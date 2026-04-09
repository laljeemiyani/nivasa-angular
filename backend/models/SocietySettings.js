const mongoose = require('mongoose');

const societySettingsSchema = new mongoose.Schema({
    // Limits
    maxResidentsPerSociety: {
        type: Number,
        default: 500,
        min: [1, 'Must allow at least 1 resident'],
        max: [10000, 'Cannot exceed 10000 residents']
    },
    maxVehiclesPerResident: {
        type: Number,
        default: 3,
        min: [0, 'Cannot be negative'],
        max: [10, 'Cannot exceed 10 vehicles']
    },
    maxComplaintsPerMonth: {
        type: Number,
        default: 10,
        min: [1, 'Must allow at least 1 complaint'],
        max: [100, 'Cannot exceed 100 complaints']
    },
    
    // Complaint Categories (dynamic list)
    complaintCategories: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        order: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    
    // Time-based Settings
    visitorPassValidityHours: {
        type: Number,
        default: 24,
        min: [1, 'Must be at least 1 hour'],
        max: [168, 'Cannot exceed 1 week']
    },
    noticeExpiryDays: {
        type: Number,
        default: 30,
        min: [1, 'Must be at least 1 day'],
        max: [365, 'Cannot exceed 1 year']
    },
    
    // Automation Toggles
    autoApproveSocieties: {
        type: Boolean,
        default: false
    },
    autoCloseComplaints: {
        type: Boolean,
        default: false
    },
    allowReopenComplaints: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Singleton pattern
societySettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            complaintCategories: [
                { name: 'Maintenance', order: 1 },
                { name: 'Security', order: 2 },
                { name: 'Cleanliness', order: 3 },
                { name: 'Noise Complaint', order: 4 },
                { name: 'Parking Issue', order: 5 },
                { name: 'Other', order: 6 }
            ]
        });
    }
    return settings;
};

module.exports = mongoose.model('SocietySettings', societySettingsSchema);
