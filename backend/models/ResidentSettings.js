const mongoose = require('mongoose');

const residentSettingsSchema = new mongoose.Schema({
    // Approval Mode
    approvalMode: {
        type: String,
        enum: ['auto', 'society_admin', 'super_admin'],
        default: 'super_admin'
    },
    
    // Security Settings
    maxFailedLoginAttempts: {
        type: Number,
        default: 5,
        min: [1, 'Must be at least 1 attempt'],
        max: [10, 'Cannot exceed 10 attempts']
    },
    lockoutDurationMinutes: {
        type: Number,
        default: 30,
        min: [5, 'Must be at least 5 minutes'],
        max: [1440, 'Cannot exceed 24 hours']
    },
    
    // Feature Toggles
    allowProfileEdit: {
        type: Boolean,
        default: true
    },
    allowPasswordChange: {
        type: Boolean,
        default: true
    },
    strongPasswordRequired: {
        type: Boolean,
        default: true
    },
    
    // Account Deletion Policy (informational only)
    accountDeletionPolicy: {
        type: String,
        default: 'Deleted accounts are set to INACTIVE status only. All data is retained forever and can be reactivated by admin at any time.',
        immutable: true
    }
}, {
    timestamps: true
});

// Singleton pattern
residentSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('ResidentSettings', residentSettingsSchema);
