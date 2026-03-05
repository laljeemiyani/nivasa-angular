const ParkingSlotRequest = require('../models/ParkingSlotRequest');
const ParkingSlot = require('../models/ParkingSlot');
const User = require('../models/User');
const { createNotificationInternal } = require('./notificationController');

// Resident: Create a parking slot request
const createParkingRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { requestedSlots, reason } = req.body;

        // Validate inputs
        if (!requestedSlots || !reason) {
            return res.status(400).json({
                success: false,
                message: 'requestedSlots and reason are required'
            });
        }

        if (requestedSlots < 1 || requestedSlots > 2) {
            return res.status(400).json({
                success: false,
                message: 'You can request between 1 and 2 additional slots per request'
            });
        }

        // Check for existing pending request
        const existingPending = await ParkingSlotRequest.findOne({
            userId,
            status: 'pending'
        });

        if (existingPending) {
            return res.status(409).json({
                success: false,
                message: 'You already have a pending parking slot request. Please wait for it to be processed.'
            });
        }

        const request = new ParkingSlotRequest({
            userId,
            requestedSlots,
            reason
        });

        await request.save();

        res.status(201).json({
            success: true,
            message: 'Parking slot request submitted successfully',
            data: { request }
        });
    } catch (error) {
        console.error('Create parking request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create parking slot request',
            error: error.message
        });
    }
};

// Resident: Get their own requests
const getMyParkingRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const requests = await ParkingSlotRequest.find({ userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: { requests }
        });
    } catch (error) {
        console.error('Get my parking requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch parking requests',
            error: error.message
        });
    }
};

// Admin: Get all parking requests with optional status filter
const getAllParkingRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const statusFilter = req.query.status; // optional: pending, approved, rejected

        const filter = {};
        if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
            filter.status = statusFilter;
        }

        const [requests, total] = await Promise.all([
            ParkingSlotRequest.find(filter)
                .populate('userId', 'fullName email wing flatNumber profilePhotoUrl')
                .populate('reviewedBy', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ParkingSlotRequest.countDocuments(filter)
        ]);

        // Also get counts per status for dashboard
        const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
            ParkingSlotRequest.countDocuments({ status: 'pending' }),
            ParkingSlotRequest.countDocuments({ status: 'approved' }),
            ParkingSlotRequest.countDocuments({ status: 'rejected' })
        ]);

        res.json({
            success: true,
            data: {
                requests,
                stats: { pendingCount, approvedCount, rejectedCount },
                pagination: {
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get all parking requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch parking requests',
            error: error.message
        });
    }
};

// Admin: Approve or Reject a parking slot request
const reviewParkingRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action, adminNote, rejectionReason } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Action must be either "approve" or "reject"'
            });
        }

        if (action === 'reject' && !rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required when rejecting a request'
            });
        }

        const request = await ParkingSlotRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Parking slot request not found'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `This request has already been ${request.status}`
            });
        }

        if (action === 'approve') {
            // Only increment parkingAllocation — do NOT auto-assign a slot
            await User.findByIdAndUpdate(request.userId, {
                $inc: { parkingAllocation: request.requestedSlots }
            });

            request.status = 'approved';
            request.adminNote = adminNote || null;
            request.reviewedBy = req.user._id;
            request.reviewedAt = new Date();
            await request.save();

            // Notify the resident
            await createNotificationInternal({
                userId: request.userId,
                title: 'Parking Slot Request Approved',
                message: `Your request for ${request.requestedSlots} additional parking slot(s) has been approved.${adminNote ? ` Note: ${adminNote}` : ''} You can now assign a slot when adding your next vehicle.`,
                type: 'parking_request',
                relatedModel: 'ParkingSlotRequest',
                relatedId: request._id
            });
        } else {
            // Reject
            request.status = 'rejected';
            request.rejectionReason = rejectionReason;
            request.adminNote = adminNote || null;
            request.reviewedBy = req.user._id;
            request.reviewedAt = new Date();
            await request.save();

            // Notify the resident
            await createNotificationInternal({
                userId: request.userId,
                title: 'Parking Slot Request Rejected',
                message: `Your request for ${request.requestedSlots} additional parking slot(s) has been rejected. Reason: ${rejectionReason}`,
                type: 'parking_request',
                relatedModel: 'ParkingSlotRequest',
                relatedId: request._id
            });
        }

        res.json({
            success: true,
            message: `Parking slot request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
            data: { request }
        });
    } catch (error) {
        console.error('Review parking request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to review parking request',
            error: error.message
        });
    }
};

module.exports = {
    createParkingRequest,
    getMyParkingRequests,
    getAllParkingRequests,
    reviewParkingRequest
};
