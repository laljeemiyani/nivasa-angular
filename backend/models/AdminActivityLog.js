const mongoose = require('mongoose');

const adminActivityLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminName: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    entityType: {
        type: String,
        enum: ['profile', 'platform', 'society', 'resident', 'notification', 'resident_account', 'danger_zone', 'login'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
adminActivityLogSchema.index({ adminId: 1, timestamp: -1 });
adminActivityLogSchema.index({ timestamp: -1 });
adminActivityLogSchema.index({ entityType: 1 });
adminActivityLogSchema.index({ action: 1 });

module.exports = mongoose.model('AdminActivityLog', adminActivityLogSchema);
