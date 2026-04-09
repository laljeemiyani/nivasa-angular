const express = require('express');
const router = express.Router();
const {
    createParkingRequest,
    getMyParkingRequests,
    getAllParkingRequests,
    reviewParkingRequest,
    getAvailableSlots
} = require('../controllers/parkingController');
const { authenticateToken, requireAdmin, requireResident } = require('../middlewares/auth');

// All parking routes require authentication
router.use(authenticateToken);

// Resident-only routes
router.post('/request', requireResident, createParkingRequest);
router.get('/my-requests', requireResident, getMyParkingRequests);
router.get('/available-slots', requireResident, getAvailableSlots);   // BUG 4 FIX

// Admin-only routes
router.get('/admin/requests', requireAdmin, getAllParkingRequests);
router.put('/admin/request/:requestId', requireAdmin, reviewParkingRequest);

module.exports = router;
