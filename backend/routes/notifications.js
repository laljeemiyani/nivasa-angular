const express = require('express');
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notificationController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { validateObjectId, validatePagination } = require('../middlewares/validation');

// All routes require authentication
router.use(authenticateToken);

// User notification routes
router.get('/', validatePagination, getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:notificationId/read', validateObjectId('notificationId'), markNotificationAsRead);
router.put('/mark-all-read', markAllNotificationsAsRead);
router.delete('/:notificationId', validateObjectId('notificationId'), deleteNotification);

// Admin routes
router.post('/', requireAdmin, createNotification);

module.exports = router;