const mongoose = require('mongoose');

/**
 * AppSettings — single-document singleton that replaces the three old singletons:
 * PlatformSettings, SocietySettings, and ResidentSettings.
 * Access via AppSettings.getSettings() which auto-creates on first use.
 */
const appSettingsSchema = new mongoose.Schema({

    // ─── Platform ───────────────────────────────────────────────────────────
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
    logoUrl: { type: String, default: null },
    faviconUrl: { type: String, default: null },

    // Contact
    contactEmail: { type: String, default: 'support@nivasa.com', trim: true },
    contactPhone: { type: String, default: '', trim: true },
    contactAddress: { type: String, default: '', trim: true },

    // Social links
    socialLinks: {
        facebook:  { type: String, default: '' },
        instagram: { type: String, default: '' },
        twitter:   { type: String, default: '' },
        linkedin:  { type: String, default: '' }
    },

    // Feature toggles (platform-level)
    maintenanceMode:            { type: Boolean, default: false },
    allowSocietyRegistration:   { type: Boolean, default: true },
    allowResidentRegistration:  { type: Boolean, default: true },
    enableComplaints:           { type: Boolean, default: true },
    enableNoticeBoard:          { type: Boolean, default: true },
    enableVisitorLog:           { type: Boolean, default: true },

    // Localization
    timezone:   { type: String, default: 'Asia/Kolkata' },
    dateFormat: {
        type: String,
        enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'],
        default: 'DD/MM/YYYY'
    },

    // ─── Society ────────────────────────────────────────────────────────────
    maxResidentsPerSociety: {
        type: Number, default: 500,
        min: [1, 'Must allow at least 1 resident'],
        max: [10000, 'Cannot exceed 10000 residents']
    },
    maxVehiclesPerResident: {
        type: Number, default: 3,
        min: [0, 'Cannot be negative'],
        max: [10, 'Cannot exceed 10 vehicles']
    },
    maxComplaintsPerMonth: {
        type: Number, default: 10,
        min: [1, 'Must allow at least 1 complaint'],
        max: [100, 'Cannot exceed 100 complaints']
    },

    // Complaint categories (dynamic list managed by admin)
    complaintCategories: [{
        name:  { type: String, required: true, trim: true },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    }],

    // Time-based
    visitorPassValidityHours: {
        type: Number, default: 24,
        min: [1, 'Must be at least 1 hour'],
        max: [168, 'Cannot exceed 1 week']
    },
    noticeExpiryDays: {
        type: Number, default: 30,
        min: [1, 'Must be at least 1 day'],
        max: [365, 'Cannot exceed 1 year']
    },

    // Automation
    autoApproveSocieties: { type: Boolean, default: false },
    autoCloseComplaints:  { type: Boolean, default: false },
    allowReopenComplaints:{ type: Boolean, default: true },

    // ─── Resident Security / Feature Toggles ────────────────────────────────
    approvalMode: {
        type: String,
        enum: ['auto', 'society_admin', 'super_admin'],
        default: 'super_admin'
    },
    maxFailedLoginAttempts: {
        type: Number, default: 5,
        min: [1, 'Must be at least 1 attempt'],
        max: [10, 'Cannot exceed 10 attempts']
    },
    lockoutDurationMinutes: {
        type: Number, default: 30,
        min: [5, 'Must be at least 5 minutes'],
        max: [1440, 'Cannot exceed 24 hours']
    },
    allowProfileEdit:        { type: Boolean, default: true },
    allowPasswordChange:     { type: Boolean, default: true },
    strongPasswordRequired:  { type: Boolean, default: true },

    accountDeletionPolicy: {
        type: String,
        default: 'Deleted accounts are set to INACTIVE status only. All data is retained forever and can be reactivated by admin at any time.',
        immutable: true
    }

}, { timestamps: true });

// ── Singleton pattern ────────────────────────────────────────────────────────
appSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            complaintCategories: [
                { name: 'Maintenance',     order: 1 },
                { name: 'Security',        order: 2 },
                { name: 'Cleanliness',     order: 3 },
                { name: 'Noise Complaint', order: 4 },
                { name: 'Parking Issue',   order: 5 },
                { name: 'Other',           order: 6 }
            ]
        });
    }
    return settings;
};

module.exports = mongoose.model('AppSettings', appSettingsSchema);
