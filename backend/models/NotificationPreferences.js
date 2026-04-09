const mongoose = require('mongoose');

const notificationPreferencesSchema = new mongoose.Schema({
    // Platform Events
    newSocietyRegistered: {
        type: Boolean,
        default: true
    },
    newResident: {
        type: Boolean,
        default: true
    },
    
    // Complaint Events
    complaintFiled: {
        type: Boolean,
        default: true
    },
    complaintEscalated: {
        type: Boolean,
        default: true
    },
    
    // Account Events
    residentAccountInactivated: {
        type: Boolean,
        default: true
    },
    residentReactivated: {
        type: Boolean,
        default: true
    },
    suspiciousLogin: {
        type: Boolean,
        default: true
    },
    
    // Reports
    weeklyReport: {
        type: Boolean,
        default: true
    },
    weeklyReportDay: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        default: 'Monday'
    }
}, {
    timestamps: true
});

// Singleton pattern
notificationPreferencesSchema.statics.getPreferences = async function() {
    let prefs = await this.findOne();
    if (!prefs) {
        prefs = await this.create({});
    }
    return prefs;
};

module.exports = mongoose.model('NotificationPreferences', notificationPreferencesSchema);
