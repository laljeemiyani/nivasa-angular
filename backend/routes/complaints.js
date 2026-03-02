const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getUserComplaints,
    getComplaint,
    updateComplaint,
    deleteComplaint,
    getComplaintStats,
    getAllComplaints
} = require('../controllers/complaintController');
const {authenticateToken, requireAdmin} = require('../middlewares/auth');
const {validateComplaint, validatePagination, validateObjectId} = require('../middlewares/validation');

// All complaint routes require authentication
router.use(authenticateToken);

// User routes
router.get('/', validatePagination, getAllComplaints);
router.post('/', validateComplaint, createComplaint);
router.get('/my-complaints', validatePagination, getUserComplaints);
router.get('/:complaintId', validateObjectId('complaintId'), getComplaint);
router.put('/:complaintId', validateObjectId('complaintId'), updateComplaint);
router.delete('/:complaintId', validateObjectId('complaintId'), deleteComplaint);

// Admin routes
router.use('/admin', requireAdmin);
router.get('/admin/stats', getComplaintStats);

module.exports = router;
