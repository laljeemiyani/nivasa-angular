const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { validateCommonEmail } = require('../utils/validators');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return validateCommonEmail(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits']
    },
    age: {
        type: Number,
        min: [18, 'Age must be at least 18 years (only adults can register)'],
        max: [120, 'Age cannot exceed 120']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    wing: {
        type: String,
        trim: true,
        match: [/^[A-F]$/, 'Wing must be a single letter from A to F'],
        uppercase: true
    },
    flatNumber: {
        type: String,
        trim: true,
        match: [/^([1-9]|1[0-4])(0[1-4])$/, 'Flat number must be in format: 101-104, 201-204, ..., 1401-1404 (floors 1-14, flats 01-04)']
    },
    residentType: {
        type: String,
        required: [true, 'Resident type is required'],
        enum: ['Owner', 'Tenant']
    },
    profilePhotoUrl: {
        type: String,
        default: null
    },
    aadharFrontUrl: {
        type: String,
        default: null
    },
    aadharBackUrl: {
        type: String,
        default: null
    },
    addressProofUrl: {
        type: String,
        default: null
    },
    rentAgreementUrl: {
        type: String,
        default: null
    },
    familyMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember'
    }],

    vehicles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    }],

    parkingAllocation: {
        type: Number,
        default: 2,
        min: [0, 'Parking allocation cannot be negative'],
        max: [10, 'Parking allocation cannot exceed 10']
    },

    complaints: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint'
    }],
    role: {
        type: String,
        enum: ['admin', 'resident'],
        default: 'resident'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'deleted'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: null
    },
    sessionVersion: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    deletionReason: {
        type: String,
        default: null
    },
    deletionSource: {
        type: String,
        enum: ['manual', 'property_sale', 'tenant_move_out', 'system'],
        default: 'manual'
    },
    // Account status for soft deletion - data retained forever
    accountStatus: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    dataRetained: {
        type: Boolean,
        default: true,
        immutable: true
    }
}, {
    timestamps: true
});

// Index for better query performance
// Email index is already created by the unique: true in the schema
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isDeleted: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const config = require('../config/config');
        const salt = await bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.sessionVersion;
    return user;
};

module.exports = mongoose.model('User', userSchema);
