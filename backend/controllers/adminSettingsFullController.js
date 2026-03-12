const User = require('../models/User');
const AdminProfile = require('../models/AdminProfile');
const PlatformSettings = require('../models/PlatformSettings');
const SocietySettings = require('../models/SocietySettings');
const ResidentSettings = require('../models/ResidentSettings');
const NotificationPreferences = require('../models/NotificationPreferences');
const ResidentLoginLog = require('../models/ResidentLoginLog');
const AdminActivityLog = require('../models/AdminActivityLog');
const ActiveSession = require('../models/ActiveSession');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

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

// Helper to log admin activity
const logAdminActivity = async (adminId, adminName, action, entityType, entityId = null, details = {}, req) => {
    try {
        await AdminActivityLog.create({
            adminId,
            adminName,
            action,
            entityType,
            entityId,
            details,
            ipAddress: getClientIp(req),
            userAgent: req.headers['user-agent'] || ''
        });
    } catch (error) {
        console.error('Error logging admin activity:', error);
    }
};

// ==================== PROFILE ====================

const getAdminProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get user basic info
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Get or create admin profile
        let profile = await AdminProfile.findOne({ userId });
        if (!profile) {
            profile = await AdminProfile.create({
                userId,
                accountCreatedAt: user.createdAt
            });
        }
        
        res.json({
            success: true,
            data: {
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                username: profile.username,
                profilePhotoUrl: profile.profilePhotoUrl,
                designation: profile.designation,
                bio: profile.bio,
                accountCreatedAt: profile.accountCreatedAt || user.createdAt,
                lastLoginAt: profile.lastLoginAt,
                lastLoginIp: profile.lastLoginIp
            }
        });
    } catch (error) {
        console.error('Get Admin Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateAdminProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullName, phoneNumber, username, designation, bio } = req.body;
        
        // Check username uniqueness if provided
        if (username) {
            const existingProfile = await AdminProfile.findOne({ 
                username: username.toLowerCase(),
                userId: { $ne: userId }
            });
            if (existingProfile) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Username is already taken' 
                });
            }
        }
        
        // Update User model
        const userUpdate = {};
        if (fullName) userUpdate.fullName = fullName;
        if (phoneNumber) userUpdate.phoneNumber = phoneNumber;
        
        if (Object.keys(userUpdate).length > 0) {
            await User.findByIdAndUpdate(userId, userUpdate);
        }
        
        // Update or create AdminProfile
        const profileUpdate = {};
        if (username !== undefined) profileUpdate.username = username ? username.toLowerCase() : null;
        if (designation !== undefined) profileUpdate.designation = designation;
        if (bio !== undefined) profileUpdate.bio = bio;
        
        let profile = await AdminProfile.findOneAndUpdate(
            { userId },
            { $set: profileUpdate },
            { new: true, upsert: true }
        );
        
        await logAdminActivity(
            userId, 
            req.user.fullName || 'Admin', 
            'Profile updated', 
            'profile', 
            userId,
            { fields: Object.keys(req.body) },
            req
        );
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: profile
        });
    } catch (error) {
        console.error('Update Admin Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const uploadProfilePhoto = async (req, res) => {
    try {
        const userId = req.user._id;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const photoUrl = `/uploads/profile_photos/${req.file.filename}`;
        
        await AdminProfile.findOneAndUpdate(
            { userId },
            { profilePhotoUrl: photoUrl },
            { upsert: true }
        );
        
        await logAdminActivity(
            userId,
            req.user.fullName || 'Admin',
            'Profile photo uploaded',
            'profile',
            userId,
            {},
            req
        );
        
        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            data: { photoUrl }
        });
    } catch (error) {
        console.error('Upload Profile Photo Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== SECURITY ====================

const changeEmail = async (req, res) => {
    try {
        const userId = req.user._id;
        const { newEmail, confirmEmail, currentPassword } = req.body;
        
        // Validate
        if (newEmail !== confirmEmail) {
            return res.status(400).json({ success: false, message: 'Email addresses do not match' });
        }
        
        // Verify current password
        const user = await User.findById(userId);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        
        // Check if email is already in use
        const existingUser = await User.findOne({ email: newEmail.toLowerCase(), _id: { $ne: userId } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email is already in use' });
        }
        
        // Update email
        user.email = newEmail.toLowerCase();
        await user.save();
        
        await logAdminActivity(
            userId,
            req.user.fullName || 'Admin',
            'Email changed',
            'profile',
            userId,
            {},
            req
        );
        
        res.json({ success: true, message: 'Email updated successfully' });
    } catch (error) {
        console.error('Change Email Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        // Validate
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }
        
        // Get resident settings for password strength
        const residentSettings = await ResidentSettings.getSettings();
        
        if (residentSettings.strongPasswordRequired) {
            // Strong password requirements
            const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!strongRegex.test(newPassword)) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
                });
            }
        } else if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }
        
        // Verify current password
        const user = await User.findById(userId);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        
        // Hash and update password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.sessionVersion = (user.sessionVersion || 0) + 1;
        await user.save();
        
        // Revoke all sessions except current
        await ActiveSession.deleteMany({ userId, sessionToken: { $ne: req.token } });
        
        await logAdminActivity(
            userId,
            req.user.fullName || 'Admin',
            'Password changed',
            'profile',
            userId,
            {},
            req
        );
        
        res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getSessions = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const sessions = await ActiveSession.find({ userId })
            .sort({ loginAt: -1 })
            .select('-sessionToken');
        
        res.json({ success: true, data: sessions });
    } catch (error) {
        console.error('Get Sessions Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const revokeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;
        
        const session = await ActiveSession.findOne({ _id: sessionId, userId });
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        
        await ActiveSession.findByIdAndDelete(sessionId);
        
        await logAdminActivity(
            userId,
            req.user.fullName || 'Admin',
            'Session revoked',
            'profile',
            userId,
            { sessionId },
            req
        );
        
        res.json({ success: true, message: 'Session revoked successfully' });
    } catch (error) {
        console.error('Revoke Session Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const logoutAllOthers = async (req, res) => {
    try {
        const userId = req.user._id;
        const currentToken = req.token;
        
        await ActiveSession.deleteMany({ userId, sessionToken: { $ne: currentToken } });
        
        // Increment session version to invalidate other tokens
        const user = await User.findById(userId);
        user.sessionVersion = (user.sessionVersion || 0) + 1;
        await user.save();
        
        await logAdminActivity(
            userId,
            req.user.fullName || 'Admin',
            'Logged out all other sessions',
            'profile',
            userId,
            {},
            req
        );
        
        res.json({ success: true, message: 'All other sessions logged out successfully' });
    } catch (error) {
        console.error('Logout All Others Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== PLATFORM SETTINGS ====================

const getPlatformSettings = async (req, res) => {
    try {
        const settings = await PlatformSettings.getSettings();
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Get Platform Settings Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updatePlatformSettings = async (req, res) => {
    try {
        const updates = req.body;
        const settings = await PlatformSettings.getSettings();
        
        // Update allowed fields
        const allowedFields = [
            'platformName', 'tagline', 'logoUrl', 'faviconUrl',
            'contactEmail', 'contactPhone', 'contactAddress',
            'socialLinks', 'maintenanceMode', 'allowSocietyRegistration',
            'allowResidentRegistration', 'enableComplaints', 'enableNoticeBoard',
            'enableVisitorLog', 'timezone', 'dateFormat'
        ];
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                settings[field] = updates[field];
            }
        });
        
        await settings.save();
        
        await logAdminActivity(
            req.user._id,
            req.user.fullName || 'Admin',
            'Platform settings updated',
            'platform',
            null,
            { fields: Object.keys(updates) },
            req
        );
        
        res.json({ success: true, message: 'Platform settings updated', data: settings });
    } catch (error) {
        console.error('Update Platform Settings Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== PUBLIC SETTINGS ====================

const getComplaintCategories = async (req, res) => {
    try {
        const settings = await SocietySettings.getSettings();
        const categories = settings.complaintCategories || [];
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get Complaint Categories Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== SOCIETY SETTINGS ====================

const getSocietySettings = async (req, res) => {
    try {
        const settings = await SocietySettings.getSettings();
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Get Society Settings Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateSocietySettings = async (req, res) => {
    try {
        const updates = req.body;
        const settings = await SocietySettings.getSettings();
        
        // Update allowed fields
        const allowedFields = [
            'maxResidentsPerSociety', 'maxVehiclesPerResident', 'maxComplaintsPerMonth',
            'complaintCategories', 'visitorPassValidityHours', 'noticeExpiryDays',
            'autoApproveSocieties', 'autoCloseComplaints', 'allowReopenComplaints'
        ];
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                settings[field] = updates[field];
            }
        });
        
        await settings.save();
        
        await logAdminActivity(
            req.user._id,
            req.user.fullName || 'Admin',
            'Society settings updated',
            'society',
            null,
            { fields: Object.keys(updates) },
            req
        );
        
        res.json({ success: true, message: 'Society settings updated', data: settings });
    } catch (error) {
        console.error('Update Society Settings Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== RESIDENT SETTINGS ====================

const getResidentSettings = async (req, res) => {
    try {
        const settings = await ResidentSettings.getSettings();
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Get Resident Settings Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateResidentSettings = async (req, res) => {
    try {
        const updates = req.body;
        const settings = await ResidentSettings.getSettings();
        
        // Update allowed fields
        const allowedFields = [
            'approvalMode', 'maxFailedLoginAttempts', 'lockoutDurationMinutes',
            'allowProfileEdit', 'allowPasswordChange', 'strongPasswordRequired'
        ];
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                settings[field] = updates[field];
            }
        });
        
        await settings.save();
        
        await logAdminActivity(
            req.user._id,
            req.user.fullName || 'Admin',
            'Resident settings updated',
            'resident',
            null,
            { fields: Object.keys(updates) },
            req
        );
        
        res.json({ success: true, message: 'Resident settings updated', data: settings });
    } catch (error) {
        console.error('Update Resident Settings Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== NOTIFICATION PREFERENCES ====================

const getNotificationPreferences = async (req, res) => {
    try {
        const prefs = await NotificationPreferences.getPreferences();
        res.json({ success: true, data: prefs });
    } catch (error) {
        console.error('Get Notification Preferences Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateNotificationPreferences = async (req, res) => {
    try {
        const updates = req.body;
        const prefs = await NotificationPreferences.getPreferences();
        
        // Update allowed fields
        const allowedFields = [
            'newSocietyRegistered', 'newResident', 'complaintFiled',
            'complaintEscalated', 'residentAccountInactivated', 'residentReactivated',
            'suspiciousLogin', 'weeklyReport', 'weeklyReportDay'
        ];
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                prefs[field] = updates[field];
            }
        });
        
        await prefs.save();
        
        await logAdminActivity(
            req.user._id,
            req.user.fullName || 'Admin',
            'Notification preferences updated',
            'notification',
            null,
            { fields: Object.keys(updates) },
            req
        );
        
        res.json({ success: true, message: 'Notification preferences updated', data: prefs });
    } catch (error) {
        console.error('Update Notification Preferences Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== RESIDENT ACTIVITY ====================

const getOnlineResidents = async (req, res) => {
    try {
        // Get active resident sessions
        const onlineSessions = await ActiveSession.find({ 
            userRole: 'resident',
            isActive: true 
        }).sort({ lastActivityAt: -1 });
        
        // Get counts
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const onlineCount = onlineSessions.length;
        const inactiveCount = await User.countDocuments({ 
            role: 'resident', 
            accountStatus: 'inactive' 
        });
        const loginsToday = await ResidentLoginLog.countDocuments({
            action: 'login',
            timestamp: { $gte: today }
        });
        const loginsThisWeek = await ResidentLoginLog.countDocuments({
            action: 'login',
            timestamp: { $gte: weekAgo }
        });
        
        res.json({
            success: true,
            data: {
                stats: {
                    onlineCount,
                    inactiveCount,
                    loginsToday,
                    loginsThisWeek
                },
                onlineResidents: onlineSessions
            }
        });
    } catch (error) {
        console.error('Get Online Residents Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getLoginHistory = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            society, 
            startDate, 
            endDate, 
            action,
            accountStatus 
        } = req.query;
        
        const query = {};
        
        if (society) query.societyId = society;
        if (action) query.action = action;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const logs = await ResidentLoginLog.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await ResidentLoginLog.countDocuments(query);
        
        // Get inactive user IDs for badge display
        const inactiveUsers = await User.find({ 
            role: 'resident', 
            accountStatus: 'inactive' 
        }).select('_id');
        const inactiveUserIds = inactiveUsers.map(u => u._id.toString());
        
        res.json({
            success: true,
            data: {
                logs: logs.map(log => ({
                    ...log.toObject(),
                    isInactive: inactiveUserIds.includes(log.userId.toString())
                })),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get Login History Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const forceLogoutResident = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Delete all active sessions for this user
        await ActiveSession.deleteMany({ userId });
        
        // Log the forced logout
        const user = await User.findById(userId);
        if (user) {
            await ResidentLoginLog.create({
                userId,
                userName: user.fullName,
                action: 'forced_logout',
                ipAddress: getClientIp(req),
                device: 'Admin Action',
                timestamp: new Date()
            });
        }
        
        await logAdminActivity(
            req.user._id,
            req.user.fullName || 'Admin',
            `Force logout resident: ${user?.fullName || userId}`,
            'resident_account',
            userId,
            {},
            req
        );
        
        res.json({ success: true, message: 'User logged out successfully' });
    } catch (error) {
        console.error('Force Logout Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== ACTIVITY LOGS ====================

const getAdminActivityLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, entityType, startDate, endDate } = req.query;
        
        const query = { adminId: req.user._id };
        
        if (entityType) query.entityType = entityType;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const logs = await AdminActivityLog.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await AdminActivityLog.countDocuments(query);
        
        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get Admin Activity Logs Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getPlatformEventLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get all admin activity logs (platform-wide)
        const logs = await AdminActivityLog.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('adminId', 'fullName');
        
        const total = await AdminActivityLog.countDocuments();
        
        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get Platform Event Logs Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getAdminLoginHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const logs = await AdminActivityLog.find({
            adminId: req.user._id,
            entityType: 'login'
        })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await AdminActivityLog.countDocuments({
            adminId: req.user._id,
            entityType: 'login'
        });
        
        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get Admin Login History Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== PENDING RESIDENTS ====================

const getPendingResidents = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const query = { 
            role: 'resident', 
            status: 'pending',
            isDeleted: false
        };
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const residents = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await User.countDocuments(query);
        
        res.json({
            success: true,
            data: {
                residents,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get Pending Residents Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const approveResident = async (req, res) => {
    try {
        const { id } = req.params;
        
        const resident = await User.findOne({ 
            _id: id, 
            role: 'resident',
            status: 'pending',
            isDeleted: false
        });
        
        if (!resident) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pending resident not found' 
            });
        }
        
        resident.status = 'approved';
        await resident.save();
        
        // Create notification for the resident
        try {
            const { createNotificationInternal } = require('./notificationController');
            await createNotificationInternal({
                userId: resident._id,
                title: 'Registration Approved',
                message: 'Your resident registration has been approved. You can now log in.',
                type: 'success',
                relatedModel: 'User',
                relatedId: resident._id
            });
        } catch (notifError) {
            console.error('Failed to create approval notification:', notifError);
        }
        
        await logAdminActivity(
            req.user._id,
            req.user.fullName || 'Admin',
            `Approved resident: ${resident.fullName}`,
            'resident_account',
            resident._id,
            {},
            req
        );
        
        res.json({ 
            success: true, 
            message: 'Resident approved successfully',
            data: resident
        });
    } catch (error) {
        console.error('Approve Resident Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const rejectResident = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        
        const resident = await User.findOne({ 
            _id: id, 
            role: 'resident',
            status: 'pending',
            isDeleted: false
        });
        
        if (!resident) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pending resident not found' 
            });
        }
        
        resident.status = 'rejected';
        resident.rejectionReason = rejectionReason || 'No reason provided';
        await resident.save();
        
        // Create notification for the resident
        try {
            const { createNotificationInternal } = require('./notificationController');
            await createNotificationInternal({
                userId: resident._id,
                title: 'Registration Rejected',
                message: `Your resident registration has been rejected. Reason: ${rejectionReason || 'No reason provided'}`,
                type: 'error',
                relatedModel: 'User',
                relatedId: resident._id
            });
        } catch (notifError) {
            console.error('Failed to create rejection notification:', notifError);
        }
        
        await logAdminActivity(
            req.user._id,
            req.user.fullName || 'Admin',
            `Rejected resident: ${resident.fullName}`,
            'resident_account',
            resident._id,
            { reason: rejectionReason },
            req
        );
        
        res.json({ 
            success: true, 
            message: 'Resident rejected successfully',
            data: resident
        });
    } catch (error) {
        console.error('Reject Resident Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== INACTIVE RESIDENTS ====================

const getInactiveResidents = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        
        const query = { 
            role: 'resident', 
            accountStatus: 'inactive' 
        };
        
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const residents = await User.find(query)
            .select('-password')
            .sort({ deletedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await User.countDocuments(query);
        
        res.json({
            success: true,
            data: {
                residents,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get Inactive Residents Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const reactivateResident = async (req, res) => {
    try {
        const { id } = req.params;
        
        const resident = await User.findOne({ 
            _id: id, 
            role: 'resident',
            accountStatus: 'inactive'
        });
        
        if (!resident) {
            return res.status(404).json({ 
                success: false, 
                message: 'Inactive resident not found' 
            });
        }
        
        resident.accountStatus = 'active';
        resident.deletedAt = null;
        resident.deletedBy = null;
        resident.deletionReason = null;
        await resident.save();
        
        await logAdminActivity(
            req.user._id,
            req.user.fullName || 'Admin',
            `Reactivated resident: ${resident.fullName}`,
            'resident_account',
            resident._id,
            {},
            req
        );
        
        res.json({ 
            success: true, 
            message: 'Resident reactivated successfully',
            data: resident
        });
    } catch (error) {
        console.error('Reactivate Resident Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== DANGER ZONE ====================

const resetPlatformSettings = async (req, res) => {
    try {
        const { confirmation } = req.body;
        
        if (confirmation !== 'RESET') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid confirmation code' 
            });
        }
        
        // Delete and recreate with defaults
        await PlatformSettings.deleteMany({});
        const settings = await PlatformSettings.getSettings();
        
        await logAdminActivity(
            req.user._id,
            req.user.fullName || 'Admin',
            'Platform settings reset to defaults',
            'danger_zone',
            null,
            {},
            req
        );
        
        res.json({ 
            success: true, 
            message: 'Platform settings reset to defaults',
            data: settings
        });
    } catch (error) {
        console.error('Reset Platform Settings Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const clearAllLogs = async (req, res) => {
    try {
        const { confirmation } = req.body;
        
        if (confirmation !== 'CLEAR LOGS') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid confirmation code' 
            });
        }
        
        // Clear logs (keep last 30 days for safety)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        await AdminActivityLog.deleteMany({ timestamp: { $lt: thirtyDaysAgo } });
        await ResidentLoginLog.deleteMany({ timestamp: { $lt: thirtyDaysAgo } });
        
        await logAdminActivity(
            req.user._id,
            req.user.fullName || 'Admin',
            'Cleared logs older than 30 days',
            'danger_zone',
            null,
            {},
            req
        );
        
        res.json({ success: true, message: 'Logs cleared successfully' });
    } catch (error) {
        console.error('Clear All Logs Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const exportAllData = async (req, res) => {
    try {
        const { password } = req.body;
        
        // Verify admin password
        const admin = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(password, admin.password);
        
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid password' 
            });
        }
        
        // Gather all data
        const data = {
            exportedAt: new Date(),
            exportedBy: admin.email,
            platformSettings: await PlatformSettings.getSettings(),
            societySettings: await SocietySettings.getSettings(),
            residentSettings: await ResidentSettings.getSettings(),
            notificationPreferences: await NotificationPreferences.getPreferences(),
            userCount: await User.countDocuments(),
            activeResidents: await User.countDocuments({ 
                role: 'resident', 
                accountStatus: 'active' 
            }),
            inactiveResidents: await User.countDocuments({ 
                role: 'resident', 
                accountStatus: 'inactive' 
            })
        };
        
        await logAdminActivity(
            req.user._id,
            req.user.fullName || 'Admin',
            'Exported all platform data',
            'danger_zone',
            null,
            {},
            req
        );
        
        res.json({ 
            success: true, 
            message: 'Data exported successfully',
            data
        });
    } catch (error) {
        console.error('Export All Data Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const reactivateAllInactive = async (req, res) => {
    try {
        const { confirmation } = req.body;
        
        if (confirmation !== 'REACTIVATE ALL') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid confirmation code' 
            });
        }
        
        const result = await User.updateMany(
            { role: 'resident', accountStatus: 'inactive' },
            { 
                $set: { accountStatus: 'active' },
                $unset: { deletedAt: 1, deletedBy: 1, deletionReason: 1 }
            }
        );
        
        await logAdminActivity(
            req.user._id,
            req.user.fullName || 'Admin',
            `Reactivated all ${result.modifiedCount} inactive residents`,
            'danger_zone',
            null,
            { count: result.modifiedCount },
            req
        );
        
        res.json({ 
            success: true, 
            message: `Reactivated ${result.modifiedCount} residents`,
            count: result.modifiedCount
        });
    } catch (error) {
        console.error('Reactivate All Inactive Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const permanentDeleteResident = async (req, res) => {
    try {
        const { id } = req.params;
        const { confirmation, residentName } = req.body;
        
        // Verify confirmation
        if (confirmation !== `DELETE ${residentName}`) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid confirmation code' 
            });
        }
        
        const resident = await User.findOne({ 
            _id: id, 
            role: 'resident',
            accountStatus: 'inactive'
        });
        
        if (!resident) {
            return res.status(404).json({ 
                success: false, 
                message: 'Inactive resident not found' 
            });
        }
        
        // Permanent delete
        await User.findByIdAndDelete(id);
        
        // Clean up related data
        await ActiveSession.deleteMany({ userId: id });
        
        await logAdminActivity(
            req.user._id,
            req.user.fullName || 'Admin',
            `Permanently deleted resident: ${resident.fullName}`,
            'danger_zone',
            id,
            {},
            req
        );
        
        res.json({ 
            success: true, 
            message: 'Resident permanently deleted'
        });
    } catch (error) {
        console.error('Permanent Delete Resident Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    // Profile
    getAdminProfile,
    updateAdminProfile,
    uploadProfilePhoto,
    
    // Security
    changeEmail,
    changePassword,
    getSessions,
    revokeSession,
    logoutAllOthers,
    
    // Public Settings
    getComplaintCategories,
    
    // Platform Settings
    getPlatformSettings,
    updatePlatformSettings,
    
    // Society Settings
    getSocietySettings,
    updateSocietySettings,
    
    // Resident Settings
    getResidentSettings,
    updateResidentSettings,
    
    // Notification Preferences
    getNotificationPreferences,
    updateNotificationPreferences,
    
    // Resident Activity
    getOnlineResidents,
    getLoginHistory,
    forceLogoutResident,
    
    // Activity Logs
    getAdminActivityLogs,
    getPlatformEventLogs,
    getAdminLoginHistory,
    
    // Pending Residents
    getPendingResidents,
    approveResident,
    rejectResident,
    
    // Inactive Residents
    getInactiveResidents,
    reactivateResident,
    
    // Danger Zone
    resetPlatformSettings,
    clearAllLogs,
    exportAllData,
    reactivateAllInactive,
    permanentDeleteResident,
    
    // Helpers (for use in other controllers)
    logAdminActivity,
    getClientIp,
    parseUserAgent
};
