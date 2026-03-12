const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ResidentLoginLog = require('../models/ResidentLoginLog');
const ActiveSession = require('../models/ActiveSession');
const config = require('../config/config');
const { deleteResidentAccount } = require('../services/residentDeletionService');

// Helper to get client IP
const getClientIp = (req) => {
    return req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           'Unknown';
};

// Helper to parse user agent
const parseUserAgent = (userAgent) => {
    if (!userAgent) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
    
    const device = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent) ? 'Mobile' : 'Desktop';
    
    let browser = 'Unknown';
    if (/Chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/Safari/i.test(userAgent)) browser = 'Safari';
    else if (/Edge/i.test(userAgent)) browser = 'Edge';
    
    let os = 'Unknown';
    if (/Windows/i.test(userAgent)) os = 'Windows';
    else if (/Mac/i.test(userAgent)) os = 'MacOS';
    else if (/Linux/i.test(userAgent)) os = 'Linux';
    else if (/Android/i.test(userAgent)) os = 'Android';
    else if (/iOS|iPhone|iPad/i.test(userAgent)) os = 'iOS';
    
    return { device, browser, os };
};

// Generate JWT token
const generateToken = (userId, sessionVersion = 0) => {
    return jwt.sign({ userId, sessionVersion }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRE
    });
};

// Register new user
const { notifyAdmins } = require('./notificationController');

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

        // Check if database is connected
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Database not available. Please try again later.',
                code: 'DB_UNAVAILABLE'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Build user payload, only including truly provided optional fields
        const userData = {
            fullName,
            email,
            password,
            phoneNumber,
            residentType,
            role: 'resident',
            status: 'pending'
        };

        if (age !== undefined && age !== null && age !== '') {
            userData.age = age;
        }
        if (gender !== undefined && gender !== null && gender !== '') {
            userData.gender = gender;
        }
        if (wing !== undefined && wing !== null && wing !== '') {
            userData.wing = wing;
        }
        if (flatNumber !== undefined && flatNumber !== null && flatNumber !== '') {
            userData.flatNumber = flatNumber;
        }

        // Create new user
        const user = new User(userData);

        await user.save();

        // Notify admins about new resident registration
        await notifyAdmins({
            title: 'New Resident Registration',
            message: `A new resident, ${fullName} (${email}), has registered and is awaiting approval.`,
            type: 'new_registration',
            relatedModel: 'User',
            relatedId: user._id
        });

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
        const { email, password } = req.body;

        // Check if database is connected
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Database not available. Please try again later.',
                code: 'DB_UNAVAILABLE'
            });
        }

        // Find user by email (exact lowercase first; then case-insensitive so pending users get 403, not 401)
        const emailNorm = (email != null ? String(email).trim() : '').toLowerCase();
        if (!emailNorm) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        let user = await User.findOne({ email: emailNorm });
        if (!user) {
            const escaped = emailNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            user = await User.findOne({ email: { $regex: '^' + escaped + '$', $options: 'i' } });
        }
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is approved FIRST (before password) so pending/rejected get 403 with clear message, not 401
        if (user.role !== 'admin' && user.status !== 'approved') {
            let message = '';
            let code = 'ACCOUNT_NOT_APPROVED';
            if (user.status === 'pending') {
                message = 'Your account is pending approval. Please wait until the administrator approves your account. You will be able to sign in once approved.';
                code = 'ACCOUNT_PENDING';
            } else if (user.status === 'rejected') {
                message = 'Your account registration has been rejected. Please contact the admin for more information.';
                code = 'ACCOUNT_REJECTED';
            } else {
                message = 'Your account is not yet approved. Please wait until the administrator approves your account.';
            }
            return res.status(403).json({
                success: false,
                message,
                status: user.status,
                code
            });
        }

        // Check password (only for approved/admin users at this point)
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

        // Generate token
        const token = generateToken(user._id, user.sessionVersion || 0);
        
        // Log login event for residents
        if (user.role === 'resident') {
            const { device, browser, os } = parseUserAgent(req.headers['user-agent']);
            
            // Create active session
            await ActiveSession.create({
                userId: user._id,
                userRole: 'resident',
                userName: user.fullName,
                societyName: user.wing || '',
                flatNumber: user.flatNumber || '',
                sessionToken: token,
                ipAddress: getClientIp(req),
                device,
                browser,
                os,
                loginAt: new Date(),
                lastActivityAt: new Date(),
                isActive: true
            });
            
            // Log login
            await ResidentLoginLog.create({
                userId: user._id,
                userName: user.fullName,
                societyId: null,
                societyName: user.wing || '',
                flatNumber: user.flatNumber || '',
                action: 'login',
                ipAddress: getClientIp(req),
                device,
                browser,
                os,
                timestamp: new Date(),
                sessionId: token
            });
        }

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

// Update user profile (basic details + optional email)
const updateProfile = async (req, res) => {
    try {
        const {
            fullName,
            phoneNumber,
            age,
            gender,
            wing,
            flatNumber,
            residentType,
            email
        } = req.body;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (age) updateData.age = age;
        if (gender) updateData.gender = gender;
        if (wing) updateData.wing = wing;
        if (flatNumber) updateData.flatNumber = flatNumber;
        if (residentType) updateData.residentType = residentType;

        if (email) {
            const normalizedEmail = String(email).trim().toLowerCase();
            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: req.user._id }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already in use'
                });
            }
            updateData.email = normalizedEmail;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
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

// Change email with password confirmation
const changeEmail = async (req, res) => {
    try {
        const { newEmail, confirmEmail, currentPassword } = req.body || {};

        if (!newEmail || !confirmEmail || !currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'New email, confirm email and current password are required'
            });
        }

        if (newEmail !== confirmEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email addresses do not match'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const normalizedEmail = String(newEmail).trim().toLowerCase();
        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: req.user._id }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email is already in use'
            });
        }

        user.email = normalizedEmail;
        await user.save();

        res.json({
            success: true,
            message: 'Email updated successfully',
            data: {
                user: user.toJSON()
            }
        });
    } catch (error) {
        console.error('Change email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change email',
            error: error.message
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

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

// Logout user
const logout = async (req, res) => {
    try {
        const user = req.user;
        const token = req.token;
        
        if (user.role === 'resident' && token) {
            const { device, browser, os } = parseUserAgent(req.headers['user-agent']);
            
            // Remove active session
            await ActiveSession.deleteOne({ sessionToken: token });
            
            // Log logout
            await ResidentLoginLog.create({
                userId: user._id,
                userName: user.fullName,
                societyId: null,
                societyName: user.wing || '',
                flatNumber: user.flatNumber || '',
                action: 'logout',
                ipAddress: getClientIp(req),
                device,
                browser,
                os,
                timestamp: new Date(),
                sessionId: token
            });
        }
        
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
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
            { profilePhotoUrl: req.file.filename },
            { new: true, runValidators: true }
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
    logout,
    getProfile,
    updateProfile,
    changeEmail,
    changePassword,
    verifyToken,
    updateProfilePhoto
};
