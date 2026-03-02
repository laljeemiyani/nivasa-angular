const Vehicle = require('../models/Vehicle');

// Add vehicle
const addVehicle = async (req, res) => {
    try {
        let {
            vehicleType,
            vehicleName,
            vehicleModel,
            vehicleColor,
            parkingSlot,
            vehicleNumber,
            registrationDate
        } = req.body;

        // Normalize vehicle type to capitalized format
        if (vehicleType) {
            vehicleType = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1).toLowerCase();
        }

        // Capitalize other fields for consistency
        if (vehicleName) {
            vehicleName = vehicleName.charAt(0).toUpperCase() + vehicleName.slice(1).toLowerCase();
        }
        if (vehicleModel) {
            vehicleModel = vehicleModel.charAt(0).toUpperCase() + vehicleModel.slice(1).toLowerCase();
        }
        if (vehicleColor) {
            vehicleColor = vehicleColor.charAt(0).toUpperCase() + vehicleColor.slice(1).toLowerCase();
        }

        // Safety check for vehicleNumber
        if (!vehicleNumber) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle number is required'
            });
        }

        // Check if vehicle number already exists for this user
        const existingVehicle = await Vehicle.findOne({
            userId: req.user._id,
            vehicleNumber: vehicleNumber.toUpperCase()
        });

        if (existingVehicle) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle with this number already registered'
            });
        }

        const vehicle = new Vehicle({
            userId: req.user._id,
            vehicleType,
            vehicleName,
            vehicleModel,
            vehicleColor,
            vehicleNumber: vehicleNumber.toUpperCase(),
            parkingSlot,
            status: 'pending',
            registrationDate: registrationDate ? new Date(registrationDate) : null
        });

        await vehicle.save();

        res.status(201).json({
            success: true,
            message: 'Vehicle added successfully',
            data: {vehicle}
        });
    } catch (error) {
        console.error('Add vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add vehicle',
            error: error.message
        });
    }
};

// Get user's vehicles
const getUserVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({userId: req.user._id})
            .sort({createdAt: -1});

        res.json({
            success: true,
            data: {vehicles}
        });
    } catch (error) {
        console.error('Get user vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicles',
            error: error.message
        });
    }
};

// Get single vehicle
const getVehicle = async (req, res) => {
    try {
        const {vehicleId} = req.params;

        const vehicle = await Vehicle.findOne({
            _id: vehicleId,
            userId: req.user._id
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            data: {vehicle}
        });
    } catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicle',
            error: error.message
        });
    }
};

// Update vehicle
const updateVehicle = async (req, res) => {
    try {
        const {vehicleId} = req.params;
        let {
            vehicleType,
            vehicleName,
            vehicleNumber,
            vehicleModel,
            vehicleColor,
            parkingSlot,
            registrationDate
        } = req.body;

        // Normalize vehicle type to capitalized format
        if (vehicleType) {
            vehicleType = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1).toLowerCase();
        }

        // Capitalize other fields for consistency
        if (vehicleName) {
            vehicleName = vehicleName.charAt(0).toUpperCase() + vehicleName.slice(1).toLowerCase();
        }
        if (vehicleModel) {
            vehicleModel = vehicleModel.charAt(0).toUpperCase() + vehicleModel.slice(1).toLowerCase();
        }
        if (vehicleColor) {
            vehicleColor = vehicleColor.charAt(0).toUpperCase() + vehicleColor.slice(1).toLowerCase();
        }

        // Check if vehicle number already exists for another vehicle of this user
        if (vehicleNumber) {
            const existingVehicle = await Vehicle.findOne({
                userId: req.user._id,
                vehicleNumber: vehicleNumber.toUpperCase(),
                _id: {$ne: vehicleId}
            });

            if (existingVehicle) {
                return res.status(400).json({
                    success: false,
                    message: 'Vehicle with this number already registered'
                });
            }
        }

        const updateData = {};
        if (vehicleType) updateData.vehicleType = vehicleType;
        if (vehicleName) updateData.vehicleName = vehicleName;
        if (vehicleNumber) updateData.vehicleNumber = vehicleNumber.toUpperCase();
        if (vehicleModel) updateData.vehicleModel = vehicleModel;
        if (vehicleColor) updateData.vehicleColor = vehicleColor;
        if (parkingSlot) updateData.parkingSlot = parkingSlot;
        if (registrationDate) updateData.registrationDate = new Date(registrationDate);

        // Reset status to pending when vehicle details are updated
        updateData.status = 'pending';

        const vehicle = await Vehicle.findOneAndUpdate(
            {_id: vehicleId, userId: req.user._id},
            updateData,
            {new: true, runValidators: true}
        );

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            message: 'Vehicle updated successfully',
            data: {vehicle}
        });
    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vehicle',
            error: error.message
        });
    }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
    try {
        const {vehicleId} = req.params;

        const vehicle = await Vehicle.findOneAndDelete({
            _id: vehicleId,
            userId: req.user._id
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete vehicle',
            error: error.message
        });
    }
};

// Get vehicle statistics (Admin only)
const getVehicleStats = async (req, res) => {
    try {
        const [
            totalVehicles,
            twoWheelers,
            fourWheelers,
            vehiclesByWing
        ] = await Promise.all([
            Vehicle.countDocuments(),
            Vehicle.countDocuments({vehicleType: 'Two Wheeler'}),
            Vehicle.countDocuments({vehicleType: 'Four Wheeler'}),
            Vehicle.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $group: {
                        _id: '$user.wing',
                        count: {$sum: 1}
                    }
                }
            ])
        ]);

        res.json({
            success: true,
            data: {
                totalVehicles,
                twoWheelers,
                fourWheelers,
                vehiclesByWing
            }
        });
    } catch (error) {
        console.error('Get vehicle stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicle statistics',
            error: error.message
        });
    }
};
// Get all vehicles (Admin or general listing)
const getAllVehicles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [vehicles, total] = await Promise.all([
            Vehicle.find()
                .populate('userId', 'fullName email wing flatNumber profilePhoto')
                .skip(skip)
                .limit(limit)
                .sort({createdAt: -1}),
            Vehicle.countDocuments()
        ]);

        res.json({
            success: true,
            data: vehicles,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get all vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicles',
            error: error.message
        });
    }
};

module.exports = {
    addVehicle,
    getUserVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicleStats,
    getAllVehicles
};
