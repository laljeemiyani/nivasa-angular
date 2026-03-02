const express = require('express');
const router = express.Router();
const {
    addVehicle,
    getUserVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicleStats,
    getAllVehicles
} = require('../controllers/vehicleController');
const {authenticateToken, requireAdmin} = require('../middlewares/auth');
const {validateVehicle, validatePagination, validateObjectId} = require('../middlewares/validation');

// All vehicle routes require authentication
router.use(authenticateToken);

// User routes
router.get('/', validatePagination, getAllVehicles);
router.post('/', validateVehicle, addVehicle);
router.get('/my-vehicles', getUserVehicles);
router.get('/:vehicleId', validateObjectId('vehicleId'), getVehicle);
router.put('/:vehicleId', validateObjectId('vehicleId'), updateVehicle);
router.delete('/:vehicleId', validateObjectId('vehicleId'), deleteVehicle);

// Admin routes
router.use('/admin', requireAdmin);
router.get('/admin/stats', getVehicleStats);

module.exports = router;
