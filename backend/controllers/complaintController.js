const Complaint = require('../models/Complaint');

// Create new complaint
const createComplaint = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            priority
        } = req.body;

        const complaint = new Complaint({
            userId: req.user._id,
            title,
            description,
            category,
            priority: priority || 'medium'
        });

        await complaint.save();

        const populatedComplaint = await Complaint.findById(complaint._id)
            .populate('userId', 'fullName email wing flatNumber');

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            data: {complaint: populatedComplaint}
        });
    } catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit complaint',
            error: error.message
        });
    }
};

// Get user's own complaints
const getUserComplaints = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const category = req.query.category;

        const filter = {userId: req.user._id};

        if (status) {
            filter.status = status;
        }

        if (category) {
            filter.category = category;
        }

        const complaints = await Complaint.find(filter)
            .populate('adminId', 'fullName')
            .sort({createdAt: -1})
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
        console.error('Get user complaints error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaints',
            error: error.message
        });
    }
};

// Get single complaint
const getComplaint = async (req, res) => {
    try {
        const {complaintId} = req.params;

        const complaint = await Complaint.findById(complaintId)
            .populate('userId', 'fullName email wing flatNumber')
            .populate('adminId', 'fullName');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check if user can access this complaint
        if (req.user.role === 'resident' && complaint.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: {complaint}
        });
    } catch (error) {
        console.error('Get complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaint',
            error: error.message
        });
    }
};

// Update complaint (User can only update their own pending complaints)
const updateComplaint = async (req, res) => {
    try {
        const {complaintId} = req.params;
        const {title, description, category, priority} = req.body;

        const complaint = await Complaint.findById(complaintId);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check if user can update this complaint
        if (complaint.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Only allow updates to pending complaints
        if (complaint.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Can only update pending complaints'
            });
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (priority) updateData.priority = priority;

        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            updateData,
            {new: true, runValidators: true}
        ).populate('userId', 'fullName email wing flatNumber');

        res.json({
            success: true,
            message: 'Complaint updated successfully',
            data: {complaint: updatedComplaint}
        });
    } catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update complaint',
            error: error.message
        });
    }
};

// Delete complaint (User can only delete their own pending complaints)
const deleteComplaint = async (req, res) => {
    try {
        const {complaintId} = req.params;

        const complaint = await Complaint.findById(complaintId);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check if user can delete this complaint
        if (req.user.role === 'resident' && complaint.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Only allow deletion of pending complaints for residents
        if (req.user.role === 'resident' && complaint.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Can only delete pending complaints'
            });
        }

        await Complaint.findByIdAndDelete(complaintId);

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

// Get complaint statistics (Admin only)
const getComplaintStats = async (req, res) => {
    try {
        const [
            totalComplaints,
            pendingComplaints,
            inProgressComplaints,
            resolvedComplaints,
            complaintsByCategory,
            complaintsByPriority
        ] = await Promise.all([
            Complaint.countDocuments(),
            Complaint.countDocuments({status: 'pending'}),
            Complaint.countDocuments({status: 'in_progress'}),
            Complaint.countDocuments({status: 'resolved'}),
            Complaint.aggregate([
                {$group: {_id: '$category', count: {$sum: 1}}}
            ]),
            Complaint.aggregate([
                {$group: {_id: '$priority', count: {$sum: 1}}}
            ])
        ]);

        res.json({
            success: true,
            data: {
                totalComplaints,
                pendingComplaints,
                inProgressComplaints,
                resolvedComplaints,
                complaintsByCategory,
                complaintsByPriority
            }
        });
    } catch (error) {
        console.error('Get complaint stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaint statistics',
            error: error.message
        });
    }
};

// Get all complaints (Admin or general listing)
const getAllComplaints = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [complaints, total] = await Promise.all([
            Complaint.find()
                .skip(skip)
                .limit(limit)
                .sort({createdAt: -1}),
            Complaint.countDocuments()
        ]);

        res.json({
            success: true,
            data: {complaints},
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get all complaints error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaints',
            error: error.message
        });
    }
};

module.exports = {
    createComplaint,
    getUserComplaints,
    getComplaint,
    updateComplaint,
    deleteComplaint,
    getComplaintStats,
    getAllComplaints
};
