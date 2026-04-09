const User = require('../models/User');
const ActiveSession = require('../models/ActiveSession');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token - user not found'
            });
        }

        if (user.isDeleted || user.status === 'deleted') {
            return res.status(410).json({
                success: false,
                message: 'Your account has been deleted. Please contact the admin for assistance.',
                code: 'ACCOUNT_DELETED'
            });
        }

        const tokenVersion = decoded.sessionVersion ?? 0;
        const currentSessionVersion = user.sessionVersion || 0;

        if (user.accountStatus === 'inactive') {
            return res.status(410).json({
                success: false,
                message: 'Account inactive. Please contact the admin.',
                code: 'ACCOUNT_INACTIVE'
            });
        }
        
        if (user.accountStatus === 'suspended') {
            return res.status(403).json({
                success: false,
                message: 'Account suspended. Please contact the admin.',
                code: 'ACCOUNT_SUSPENDED'
            });
        }

        if (tokenVersion !== currentSessionVersion) {
            const activeSession = await ActiveSession.exists({
                userId: user._id,
                sessionToken: token,
                isActive: true
            });

            if (!activeSession) {
                return res.status(401).json({
                    success: false,
                    message: 'Session invalidated. Please log in again.',
                    code: 'SESSION_INVALIDATED'
                });
            }
        }



        // Only check approval status for residents, not for admins
        if (user.role === 'resident' && user.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Account not approved yet'
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// Check if user is resident
const requireResident = (req, res, next) => {
    if (req.user.role !== 'resident') {
        return res.status(403).json({
            success: false,
            message: 'Resident access required'
        });
    }
    next();
};

// Optional authentication (for routes that work with or without auth)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');
            const tokenVersion = decoded.sessionVersion ?? 0;
            const currentSessionVersion = user?.sessionVersion || 0;
            let sessionIsValid = tokenVersion === currentSessionVersion;

            if (!sessionIsValid && user) {
                sessionIsValid = Boolean(await ActiveSession.exists({
                    userId: user._id,
                    sessionToken: token,
                    isActive: true
                }));
            }

            if (
                user &&
                user.accountStatus === 'active' &&
                sessionIsValid &&
                user.status === 'approved'
            ) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireResident,
    optionalAuth
};
