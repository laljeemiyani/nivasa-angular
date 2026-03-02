const express = require('express');
const router = express.Router();
const {
    createNotice,
    getNotices,
    getNotice,
    updateNotice,
    deleteNotice,
    getNoticeStats
} = require('../controllers/noticeController');
const {authenticateToken, requireAdmin, optionalAuth} = require('../middlewares/auth');
const {validateNotice, validatePagination, validateObjectId} = require('../middlewares/validation');

// Admin routes (must come before /:noticeId)
router.use('/admin', authenticateToken, requireAdmin);
router.get('/admin', validatePagination, getNotices);
router.post('/admin', validateNotice, createNotice);
router.put('/admin/:noticeId', validateObjectId('noticeId'), updateNotice);
router.delete('/admin/:noticeId', validateObjectId('noticeId'), deleteNotice);
router.get('/admin/stats', getNoticeStats);

// Public routes (for residents to view notices)
router.get('/', optionalAuth, validatePagination, getNotices);
router.get('/:noticeId', optionalAuth, validateObjectId('noticeId'), getNotice);

module.exports = router;