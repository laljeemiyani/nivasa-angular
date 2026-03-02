const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    verifyToken,
    updateProfilePhoto
} = require('../controllers/authController');
const {authenticateToken} = require('../middlewares/auth');
const {uploadProfilePhoto} = require('../middlewares/upload');
const {
    validateUserRegistration,
    validateUserLogin
} = require('../middlewares/validation');

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/update-profile-photo', authenticateToken, uploadProfilePhoto.single('profilePhoto'), updateProfilePhoto);
router.put('/change-password', authenticateToken, changePassword);
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;
