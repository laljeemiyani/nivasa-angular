require('../models/FamilyMember');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Notice = require('../models/Notice');
const Complaint = require('../models/Complaint');
const { createNotificationInternal } = require('./notificationController');
const { deleteResidentAccount } = require('../services/residentDeletionService');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalResidents,
      pendingResidents,
      totalComplaints,
      pendingComplaints,
      totalNotices,
      totalVehicles
    ] = await Promise.all([
      User.countDocuments({ role: 'resident', status: 'approved', isDeleted: false }),
      User.countDocuments({ role: 'resident', status: 'pending', isDeleted: false }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Notice.countDocuments({ isActive: true }),
      Vehicle.countDocuments()
    ]);

    // Get recent activities
    const recentComplaints = await Complaint.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentResidents = await User.find({ role: 'resident', isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email status createdAt');
    console.log('Recent residents fetched:', recentResidents.length);

    res.json({
      success: true,
      data: {
        stats: {
          totalResidents,
          pendingResidents,
          totalComplaints,
          pendingComplaints,
          totalNotices,
          totalVehicles
        },
        recentActivities: {
          complaints: recentComplaints,
          residents: recentResidents
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get all residents with pagination and filters
const getResidents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    const filter = { role: 'resident', isDeleted: false };
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { wing: { $regex: search, $options: 'i' } },
        { flatNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const residents = await User.find(filter)
      .select('-password')
      .populate('familyMembers')
      .populate('vehicles')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        residents,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get residents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch residents',
      error: error.message
    });
  }
};

// Approve or reject resident
const updateResidentStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    const updateData = { status };
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Notify resident about status update
    await createNotificationInternal({
      userId: user._id,
      title: `Your Registration Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: status === 'approved' ?
        'Your resident registration has been approved. You can now log in.' :
        `Your resident registration has been rejected. Reason: ${rejectionReason || 'No reason provided.'}`,
      type: 'status_update',
      relatedModel: 'User',
      relatedId: user._id
    });
    
    // Send response AFTER all operations are complete
    res.json({
      success: true,
      message: `Resident ${status} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Update resident status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resident status',
      error: error.message
    });
  }
};

// Get all complaints with pagination and filters
const getComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const category = req.query.category;

    const filter = { isDeleted: false };
    
    if (status) {
      filter.status = status;
    }
    
    if (category) {
      filter.category = category;
    }

    const complaints = await Complaint.find(filter)
      .populate('userId', 'fullName email wing flatNumber')
      .populate('adminId', 'fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      data: {
        complaints,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
};

// Update complaint status
const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, adminResponse } = req.body;

    if (!['pending', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updateData = { 
      status,
      adminId: req.user._id
    };

    if (adminResponse) {
      updateData.adminResponse = adminResponse;
    }

    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email wing flatNumber');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      data: { complaint }
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status',
      error: error.message
    });
  }
};

// Delete complaint
const deleteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findByIdAndDelete(complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete complaint',
      error: error.message
    });
  }
};

// Get all vehicles
const getVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const vehicleType = req.query.vehicleType;
    const search = req.query.search;
    const status = req.query.status;

    const filter = { isDeleted: false };
    
    if (vehicleType) {
      filter.vehicleType = vehicleType;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { vehicleName: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const vehicles = await Vehicle.find(filter)
      .populate('userId', 'fullName email wing flatNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Vehicle.countDocuments(filter);

    res.json({
      success: true,
      data: {
        vehicles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles',
      error: error.message
    });
  }
};

// Update vehicle status (approve/reject)
const updateVehicleStatus = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Store previous status to check if it changed
    const previousStatus = vehicle.status;
    
    vehicle.status = status;
    await vehicle.save();
    
    // Create notification for the resident if status changed
    if (previousStatus !== status) {
      try {
        const { createNotificationInternal } = require('../controllers/notificationController');
        await createNotificationInternal({
          userId: vehicle.userId,
          title: `Vehicle ${status === 'approved' ? 'Approved' : 'Rejected'}`,
          message: `Your vehicle ${vehicle.vehicleName || vehicle.vehicleNumber} has been ${status === 'approved' ? 'approved' : 'rejected'} by the admin.`,
          type: status === 'approved' ? 'success' : 'warning',
          relatedModel: 'Vehicle',
          relatedId: vehicle._id
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
        // Continue execution even if notification creation fails
      }
    }

    res.json({
      success: true,
      message: `Vehicle ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      data: { vehicle }
    });
  } catch (error) {
    console.error('Update vehicle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vehicle status',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getResidents,
  updateResidentStatus,
  getComplaints,
  updateComplaintStatus,
  deleteComplaint,
  getVehicles,
  updateVehicleStatus,
  getFamilyMembers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search;

      const filter = {isDeleted: false};

      if (search) {
        filter.$or = [
          {fullName: {$regex: search, $options: 'i'}},
          {relation: {$regex: search, $options: 'i'}}
        ];
      }

      const familyMembers = await require('../models/FamilyMember').find(filter)
          .populate('userId', 'fullName email wing flatNumber')
          .sort({createdAt: -1})
          .skip((page - 1) * limit)
          .limit(limit);

      const total = await require('../models/FamilyMember').countDocuments(filter);

      res.json({
        success: true,
        data: {
          familyMembers,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
          }
        }
      });
    } catch (error) {
      console.error('Get family members error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch family members',
        error: error.message
      });
    }
  },
  deleteResident: async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason, source, metadata } = req.body || {};

      if (!reason || !reason.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Deletion reason is required'
        });
      }

      const deletionResult = await deleteResidentAccount({
        residentId: userId,
        performedBy: req.user._id,
        reason,
        source: source || 'manual',
        metadata
      });

      res.json({
        success: true,
        message: 'Resident deleted successfully',
        data: deletionResult
      });
    } catch (error) {
      console.error('Delete resident error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete resident',
        error: error.message
      });
    }
  }
};
