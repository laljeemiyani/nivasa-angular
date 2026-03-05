const mongoose = require('mongoose');

const parkingSlotRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    requestedSlots: {
        type: Number,
        required: [true, 'Number of requested slots is required'],
        min: [1, 'Must request at least 1 slot'],
        max: [2, 'Cannot request more than 2 slots per request']
    },
    reason: {
        type: String,
        required: [true, 'Reason is required'],
        trim: true,
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'approved', 'rejected'],
            message: 'Status must be pending, approved, or rejected'
        },
        default: 'pending'
    },
    adminNote: {
        type: String,
        trim: true,
        maxlength: [500, 'Admin note cannot exceed 500 characters'],
        default: null
    },
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
        default: null
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes
parkingSlotRequestSchema.index({ userId: 1 });
parkingSlotRequestSchema.index({ status: 1 });
parkingSlotRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ParkingSlotRequest', parkingSlotRequestSchema);
