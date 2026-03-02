const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// Generate JWT token
const generateToken = (userId, sessionVersion = 0) => {
    return jwt.sign({userId, sessionVersion}, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRE
    });
};

// Register new user
const {createNotificationInternal} = require('./notificationController');

const register = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            phoneNumber,
            age,
            gender,
            wing,
            flatNumber,
            residentType
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = new User({
            fullName,
            email,
            password,
            phoneNumber,
            age,
            gender,
            wing,
            flatNumber,
            residentType,
            role: 'resident',
            status: 'pending'
        });

        await user.save();

        // Notify admins about new resident registration
        const admins = await User.find({role: 'admin'});
        for (const admin of admins) {
            await createNotificationInternal({
                userId: admin._id,
                title: 'New Resident Registration',
                message: `A new resident, ${fullName} (${email}), has registered and is awaiting approval.`,
                type: 'new_registration',
                relatedModel: 'User',
                relatedId: user._id
            });
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please wait for admin approval.',
            data: {
                user: user.toJSON()
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        // Find user by email
        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Prevent deleted accounts
        if (user.isDeleted || user.status === 'deleted') {
            return res.status(410).json({
                success: false,
                message: 'Your account has been deleted. Please contact the admin for assistance.',
                code: 'ACCOUNT_DELETED'
            });
        }

        // Check if user is approved
        if (user.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: `Account is ${user.status}. Please wait for admin approval.`,
                status: user.status
            });
        }

        // Generate token
        const token = generateToken(user._id, user.sessionVersion || 0);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('familyMembers')
            .populate('vehicles');

        res.json({
            success: true,
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const {
            fullName,
            phoneNumber,
            age,
            gender,
            wing,
            flatNumber,
            residentType
        } = req.body;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (age) updateData.age = age;
        if (gender) updateData.gender = gender;
        if (wing) updateData.wing = wing;
        if (flatNumber) updateData.flatNumber = flatNumber;
        if (residentType) updateData.residentType = residentType;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            {new: true, runValidators: true}
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: user.toJSON()
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const {currentPassword, newPassword} = req.body;

        const user = await User.findById(req.user._id);

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
};

// Verify token
const verifyToken = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({
            success: false,
            message: 'Token verification failed',
            error: error.message
        });
    }
};

// Update profile photo
const updateProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No photo uploaded'
            });
        }

        // Update the user's profile photo field in the database
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {profilePhotoUrl: req.file.filename},
            {new: true, runValidators: true}
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile photo updated successfully',
            data: {
                user: user.toJSON()
            }
        });
    } catch (error) {
        console.error('Update profile photo error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile photo',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    verifyToken,
    updateProfilePhoto
};
