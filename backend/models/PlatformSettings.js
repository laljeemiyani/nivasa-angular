const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
    // Basic Info
    platformName: {
        type: String,
        default: 'Nivasa',
        trim: true,
        maxlength: [100, 'Platform name cannot exceed 100 characters']
    },
    tagline: {
        type: String,
        default: 'Society Management Made Simple',
        trim: true,
        maxlength: [200, 'Tagline cannot exceed 200 characters']
    },
    logoUrl: {
        type: String,
        default: null
    },
    faviconUrl: {
        type: String,
        default: null
    },
    
    // Contact Info
    contactEmail: {
        type: String,
        default: 'support@nivasa.com',
        trim: true
    },
    contactPhone: {
        type: String,
        default: '',
        trim: true
    },
    contactAddress: {
        type: String,
        default: '',
        trim: true
    },
    
    // Social Links
    socialLinks: {
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        twitter: { type: String, default: '' },
        linkedin: { type: String, default: '' }
    },
    
    // Feature Toggles
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    allowSocietyRegistration: {
        type: Boolean,
        default: true
    },
    allowResidentRegistration: {
        type: Boolean,
        default: true
    },
    enableComplaints: {
        type: Boolean,
        default: true
    },
    enableNoticeBoard: {
        type: Boolean,
        default: true
    },
    enableVisitorLog: {
        type: Boolean,
        default: true
    },
    
    // Localization
    timezone: {
        type: String,
        default: 'Asia/Kolkata'
    },
    dateFormat: {
        type: String,
        enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'],
        default: 'DD/MM/YYYY'
    }
}, {
    timestamps: true
});

// Singleton pattern - only one document
platformSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
