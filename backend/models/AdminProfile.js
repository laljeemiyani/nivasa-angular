const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    profilePhotoUrl: {
        type: String,
        default: null
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores']
    },
    designation: {
        type: String,
        trim: true,
        maxlength: [100, 'Designation cannot exceed 100 characters']
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [250, 'Bio cannot exceed 250 characters']
    },
    accountCreatedAt: {
        type: Date,
        default: Date.now
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    lastLoginIp: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Indexes already defined in schema with unique: true

module.exports = mongoose.model('AdminProfile', adminProfileSchema);
