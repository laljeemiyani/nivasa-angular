const mongoose = require('mongoose');

const residentLoginLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        default: null
    },
    societyName: {
        type: String,
        default: ''
    },
    flatNumber: {
        type: String,
        default: ''
    },
    action: {
        type: String,
        enum: ['login', 'logout', 'forced_logout'],
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    device: {
        type: String,
        default: 'Unknown'
    },
    browser: {
        type: String,
        default: 'Unknown'
    },
    os: {
        type: String,
        default: 'Unknown'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    sessionId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
residentLoginLogSchema.index({ userId: 1, timestamp: -1 });
residentLoginLogSchema.index({ timestamp: -1 });
residentLoginLogSchema.index({ action: 1 });
residentLoginLogSchema.index({ societyId: 1 });

module.exports = mongoose.model('ResidentLoginLog', residentLoginLogSchema);
