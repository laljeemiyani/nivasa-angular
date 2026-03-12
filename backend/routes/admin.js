const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getResidents,
    updateResidentStatus,
    deleteResident,
    getComplaints,
    updateComplaintStatus,
    deleteComplaint,
    getVehicles,
    updateVehicleStatus,
    getFamilyMembers,
    exportResidents
} = require('../controllers/adminController');
const adminNotificationController = require('../controllers/adminNotificationController');
const adminSettingsController = require('../controllers/adminSettingsFullController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { validatePagination, validateObjectId } = require('../middlewares/validation');
const { uploadProfilePhoto } = require('../middlewares/upload');

// ==================== PUBLIC SETTINGS (NO AUTH REQUIRED) ====================
// Expose complaint categories for residents and public clients
router.get('/settings/complaint-categories', adminSettingsController.getComplaintCategories);

// All routes defined after this line require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Resident management
router.get('/residents', validatePagination, getResidents);
router.get('/residents/export', exportResidents);
router.put('/residents/:userId/status', validateObjectId('userId'), updateResidentStatus);
router.delete('/residents/:userId', validateObjectId('userId'), deleteResident);

// Complaint management
router.get('/complaints', validatePagination, getComplaints);
router.put('/complaints/:complaintId/status', validateObjectId('complaintId'), updateComplaintStatus);
router.delete('/complaints/:complaintId', validateObjectId('complaintId'), deleteComplaint);

// Vehicle management
router.get('/vehicles', validatePagination, getVehicles);
router.put('/vehicles/:vehicleId/status', validateObjectId('vehicleId'), updateVehicleStatus);

// Family Member management
router.get('/family-members', validatePagination, getFamilyMembers);

// Notification management
router.post('/notifications/all', adminNotificationController.createNotificationForAllResidents);
router.post('/notifications/resident', adminNotificationController.createNotificationForResident);

// ==================== ADMIN SETTINGS ====================

// Profile
router.get('/profile', adminSettingsController.getAdminProfile);
router.put('/profile', adminSettingsController.updateAdminProfile);
router.post('/profile/photo', uploadProfilePhoto.single('photo'), adminSettingsController.uploadProfilePhoto);

// Security
router.put('/change-email', adminSettingsController.changeEmail);
router.put('/change-password', adminSettingsController.changePassword);
router.get('/sessions', adminSettingsController.getSessions);
router.delete('/sessions/:sessionId', validateObjectId('sessionId'), adminSettingsController.revokeSession);
router.post('/logout-all-others', adminSettingsController.logoutAllOthers);

// Platform Settings
router.get('/settings/platform', adminSettingsController.getPlatformSettings);
router.put('/settings/platform', adminSettingsController.updatePlatformSettings);

// Society Settings
router.get('/settings/society', adminSettingsController.getSocietySettings);
router.put('/settings/society', adminSettingsController.updateSocietySettings);

// Resident Settings
router.get('/settings/residents', adminSettingsController.getResidentSettings);
router.put('/settings/residents', adminSettingsController.updateResidentSettings);

// Notification Preferences
router.get('/settings/notifications', adminSettingsController.getNotificationPreferences);
router.put('/settings/notifications', adminSettingsController.updateNotificationPreferences);

// Resident Activity
router.get('/activity/online', adminSettingsController.getOnlineResidents);
router.get('/activity/history', adminSettingsController.getLoginHistory);
router.post('/activity/force-logout/:userId', validateObjectId('userId'), adminSettingsController.forceLogoutResident);

// Activity Logs
router.get('/logs/activity', adminSettingsController.getAdminActivityLogs);
router.get('/logs/platform', adminSettingsController.getPlatformEventLogs);
router.get('/logs/login', adminSettingsController.getAdminLoginHistory);

// Pending Residents
router.get('/residents/pending', adminSettingsController.getPendingResidents);
router.put('/residents/:id/approve', validateObjectId('id'), adminSettingsController.approveResident);
router.put('/residents/:id/reject', validateObjectId('id'), adminSettingsController.rejectResident);

// Inactive Residents
router.get('/residents/inactive', adminSettingsController.getInactiveResidents);
router.put('/residents/:id/reactivate', validateObjectId('id'), adminSettingsController.reactivateResident);

// Danger Zone
router.post('/danger/reset-platform', adminSettingsController.resetPlatformSettings);
router.post('/danger/clear-logs', adminSettingsController.clearAllLogs);
router.post('/danger/export-data', adminSettingsController.exportAllData);
router.post('/danger/reactivate-all', adminSettingsController.reactivateAllInactive);
router.delete('/danger/permanent-delete/:id', validateObjectId('id'), adminSettingsController.permanentDeleteResident);

module.exports = router;
