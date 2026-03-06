const Vehicle = require('../models/Vehicle');
const ParkingSlot = require('../models/ParkingSlot');
const User = require('../models/User');

// Add vehicle — with atomic parking slot claim
const addVehicle = async (req, res) => {
    try {
        // DEBUG: Log the full request payload
        console.log('=== ADD VEHICLE DEBUG ===');
        console.log('Full request body:', JSON.stringify(req.body, null, 2));

        let {
            vehicleType,
            vehicleName,
            vehicleModel,
            vehicleColor,
            parkingSlot,
            vehicleNumber,
            registrationDate
        } = req.body;

        // Normalize vehicle type to canonical format (preserves 'EV' correctly)
        if (vehicleType) {
            const typeMap = { car: 'Car', bike: 'Bike', ev: 'EV', truck: 'Truck', bus: 'Bus' };
            vehicleType = typeMap[vehicleType.toLowerCase()] || vehicleType;
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
            console.log('DEBUG: vehicleNumber is empty/falsy');
            return res.status(400).json({
                success: false,
                message: 'Vehicle number is required'
            });
        }

        if (!parkingSlot) {
            console.log('DEBUG: parkingSlot is empty/falsy');
            return res.status(400).json({
                success: false,
                message: 'Parking slot is required'
            });
        }

        // DEBUG: Log format validation
        const slotRegex = /^[A-F]-([1-9]|1[0-4])(0[1-4])-P[1-2]$/;
        console.log(`DEBUG: parkingSlot value = "${parkingSlot}", regex test = ${slotRegex.test(parkingSlot)}`);
        console.log(`DEBUG: parkingSlot chars =`, [...parkingSlot].map(c => c.charCodeAt(0)));

        // Check if vehicle number already exists (globally, not just for this user)
        const existingVehicle = await Vehicle.findOne({
            vehicleNumber: vehicleNumber.toUpperCase(),
            isDeleted: { $ne: true }
        });

        if (existingVehicle) {
            console.log('DEBUG: Duplicate vehicle number found:', existingVehicle.vehicleNumber);
            return res.status(400).json({
                success: false,
                message: 'Vehicle with this number already registered'
            });
        }

        // Enforce parking allocation limit
        const user = await User.findById(req.user._id);
        const activeVehicleCount = await Vehicle.countDocuments({
            userId: req.user._id,
            isDeleted: { $ne: true }
        });

        console.log(`DEBUG: User allocation = ${user.parkingAllocation || 2}, active vehicles = ${activeVehicleCount}`);

        if (activeVehicleCount >= (user.parkingAllocation || 2)) {
            return res.status(403).json({
                success: false,
                message: `You have reached your parking allocation limit of ${user.parkingAllocation || 2} vehicles. Please request additional parking slots.`
            });
        }

        // Atomically claim the parking slot using findOneAndUpdate
        console.log(`DEBUG: Claiming slot - query: { slotNumber: "${parkingSlot}", isOccupied: false }`);
        const claimedSlot = await ParkingSlot.findOneAndUpdate(
            { slotNumber: parkingSlot, isOccupied: false },
            { $set: { isOccupied: true, userId: req.user._id } },
            { new: true }
        );

        console.log(`DEBUG: Claimed slot result:`, claimedSlot ? claimedSlot.slotNumber : 'NULL (slot not found or already occupied)');

        if (!claimedSlot) {
            // DEBUG: Check if slot exists at all
            const slotExists = await ParkingSlot.findOne({ slotNumber: parkingSlot });
            console.log(`DEBUG: Slot exists in DB? ${!!slotExists}, isOccupied? ${slotExists?.isOccupied}`);
            return res.status(409).json({
                success: false,
                message: 'This parking slot is no longer available. It may have been taken by another resident. Please select a different slot.'
            });
        }

        // Create the vehicle
        let vehicle;
        try {
            const vehicleData = {
                userId: req.user._id,
                vehicleType,
                vehicleName,
                vehicleModel,
                vehicleColor,
                vehicleNumber: vehicleNumber.toUpperCase(),
                parkingSlot,
                status: 'pending',
                registrationDate: registrationDate ? new Date(registrationDate) : null
            };
            console.log('DEBUG: Creating vehicle with data:', JSON.stringify(vehicleData, null, 2));
            vehicle = new Vehicle(vehicleData);
            await vehicle.save();
            console.log('DEBUG: Vehicle saved successfully, id:', vehicle._id);
        } catch (saveError) {
            console.error('DEBUG: Vehicle save FAILED:', saveError.message);
            console.error('DEBUG: Save error details:', JSON.stringify(saveError, null, 2));
            // Rollback the parking slot claim if vehicle save fails
            await ParkingSlot.findOneAndUpdate(
                { slotNumber: parkingSlot },
                { $set: { isOccupied: false, userId: null, vehicleId: null } }
            );
            throw saveError;
        }

        // Update the parking slot with the vehicle reference
        await ParkingSlot.findOneAndUpdate(
            { slotNumber: parkingSlot },
            { $set: { vehicleId: vehicle._id } }
        );

        console.log('=== ADD VEHICLE SUCCESS ===');
        res.status(201).json({
            success: true,
            message: 'Vehicle added successfully',
            data: { vehicle }
        });
    } catch (error) {
        console.error('Add vehicle error:', error);
        console.error('Add vehicle error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to add vehicle',
            error: error.message
        });
    }
};

// Get available parking slots with optional wing/floor filtering
const getAvailableSlots = async (req, res) => {
    try {
        const { wing, floor } = req.query;

        const filter = { isOccupied: false };
        if (wing && /^[A-F]$/.test(wing)) {
            filter.wing = wing;
        }
        if (floor) {
            const floorNum = parseInt(floor);
            if (floorNum >= 1 && floorNum <= 14) {
                filter.floor = floorNum;
            }
        }

        const slots = await ParkingSlot.find(filter)
            .select('slotNumber wing floor flatNumber position')
            .sort({ wing: 1, floor: 1, flatNumber: 1, position: 1 });

        res.json({
            success: true,
            data: {
                slots,
                total: slots.length
            }
        });
    } catch (error) {
        console.error('Get available slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available parking slots',
            error: error.message
        });
    }
};

// Get user's vehicles
const getUserVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ userId: req.user._id, isDeleted: { $ne: true } })
            .sort({ createdAt: -1 });

        // Also return allocation info
        const user = await User.findById(req.user._id).select('parkingAllocation');
        const activeVehicleCount = await Vehicle.countDocuments({
            userId: req.user._id,
            isDeleted: { $ne: true }
        });

        res.json({
            success: true,
            data: {
                vehicles,
                parkingAllocation: user.parkingAllocation || 2,
                activeVehicleCount,
                canAddMore: activeVehicleCount < (user.parkingAllocation || 2)
            }
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
        const { vehicleId } = req.params;

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
            data: { vehicle }
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
        const { vehicleId } = req.params;
        let {
            vehicleType,
            vehicleName,
            vehicleNumber,
            vehicleModel,
            vehicleColor,
            parkingSlot,
            registrationDate
        } = req.body;

        // Normalize vehicle type to canonical format (preserves 'EV' correctly)
        if (vehicleType) {
            const typeMap = { car: 'Car', bike: 'Bike', ev: 'EV', truck: 'Truck', bus: 'Bus' };
            vehicleType = typeMap[vehicleType.toLowerCase()] || vehicleType;
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

        const existingVehicle = await Vehicle.findOne({
            _id: vehicleId,
            userId: req.user._id
        });

        if (!existingVehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Check if vehicle number already exists for another vehicle
        if (vehicleNumber) {
            const duplicateVehicle = await Vehicle.findOne({
                vehicleNumber: vehicleNumber.toUpperCase(),
                _id: { $ne: vehicleId },
                isDeleted: { $ne: true }
            });

            if (duplicateVehicle) {
                return res.status(400).json({
                    success: false,
                    message: 'Vehicle with this number already registered'
                });
            }
        }

        // Handle parking slot change atomically
        if (parkingSlot && parkingSlot !== existingVehicle.parkingSlot) {
            // Release old slot
            await ParkingSlot.findOneAndUpdate(
                { slotNumber: existingVehicle.parkingSlot },
                { $set: { isOccupied: false, userId: null, vehicleId: null } }
            );

            // Atomically claim new slot
            const claimedSlot = await ParkingSlot.findOneAndUpdate(
                { slotNumber: parkingSlot, isOccupied: false },
                { $set: { isOccupied: true, userId: req.user._id, vehicleId: existingVehicle._id } },
                { new: true }
            );

            if (!claimedSlot) {
                // Re-claim old slot since new one failed
                await ParkingSlot.findOneAndUpdate(
                    { slotNumber: existingVehicle.parkingSlot },
                    { $set: { isOccupied: true, userId: req.user._id, vehicleId: existingVehicle._id } }
                );
                return res.status(409).json({
                    success: false,
                    message: 'The new parking slot is no longer available. Your original slot has been kept.'
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
            { _id: vehicleId, userId: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Vehicle updated successfully',
            data: { vehicle }
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

// Delete vehicle — release parking slot
const deleteVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;

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

        // Release the parking slot
        if (vehicle.parkingSlot) {
            await ParkingSlot.findOneAndUpdate(
                { slotNumber: vehicle.parkingSlot },
                { $set: { isOccupied: false, userId: null, vehicleId: null } }
            );
        }

        // Soft delete the vehicle
        vehicle.isDeleted = true;
        vehicle.deletedAt = new Date();
        vehicle.deletedBy = req.user._id;
        await vehicle.save();

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
            Vehicle.countDocuments({ isDeleted: { $ne: true } }),
            Vehicle.countDocuments({ vehicleType: 'Two Wheeler', isDeleted: { $ne: true } }),
            Vehicle.countDocuments({ vehicleType: 'Four Wheeler', isDeleted: { $ne: true } }),
            Vehicle.aggregate([
                { $match: { isDeleted: { $ne: true } } },
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
                        count: { $sum: 1 }
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
            Vehicle.find({ isDeleted: { $ne: true } })
                .populate('userId', 'fullName email wing flatNumber profilePhoto')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Vehicle.countDocuments({ isDeleted: { $ne: true } })
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
    getAvailableSlots,
    getUserVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicleStats,
    getAllVehicles
};
