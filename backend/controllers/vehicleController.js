const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { notifyAdmins } = require('./notificationController');

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

        // DEBUG: Log format validation (P1–P9 to support additional slots after admin approval)
        const slotRegex = /^[A-F]-([1-9]|1[0-4])(0[1-4])-P[1-9]$/;
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

        // Check if parking slot is already taken by another active vehicle
        const slotTaken = await Vehicle.findOne({
            parkingSlot,
            isDeleted: { $ne: true }
        });
        if (slotTaken) {
            return res.status(409).json({
                success: false,
                message: 'This parking slot is already occupied. Please select a different slot.'
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
            if (saveError.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'This parking slot was just taken. Please select a different slot.'
                });
            }
            throw saveError;
        }

        // Notify admins about new vehicle registration
        await notifyAdmins({
            title: 'New Vehicle Registration',
            message: `A new vehicle (${vehicleNumber.toUpperCase()}) has been registered by ${user.fullName} and is awaiting approval.`,
            type: 'parking_request',
            relatedModel: 'Vehicle',
            relatedId: vehicle._id
        });

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

// Get available parking slots — derived from Vehicle records (no ParkingSlot master needed)
const getAvailableSlots = async (req, res) => {
    try {
        const { wing, floor } = req.query;

        // Build the slot number pattern from known building config (wings A-F, floors 1-14, flats 01-04)
        const WINGS = ['A', 'B', 'C', 'D', 'E', 'F'];
        const FLOORS = Array.from({ length: 14 }, (_, i) => i + 1);
        const FLATS = ['01', '02', '03', '04'];
        const POSITIONS = ['P1', 'P2', 'P3'];

        // Generate all possible slot strings
        let allSlots = [];
        for (const w of WINGS) {
            if (wing && wing !== w) continue;
            for (const f of FLOORS) {
                if (floor && parseInt(floor) !== f) continue;
                for (const flat of FLATS) {
                    for (const pos of POSITIONS) {
                        allSlots.push(`${w}-${f}${flat}-${pos}`);
                    }
                }
            }
        }

        // Find occupied slots from Vehicle collection
        const occupiedVehicles = await Vehicle.find(
            { isDeleted: { $ne: true }, parkingSlot: { $exists: true, $ne: null } },
            { parkingSlot: 1 }
        );
        const occupiedSet = new Set(occupiedVehicles.map(v => v.parkingSlot));

        const availableSlots = allSlots
            .filter(s => !occupiedSet.has(s))
            .map(s => {
                const parts = s.split('-');
                return {
                    slotNumber: s,
                    wing: parts[0],
                    floor: parseInt(parts[1].slice(0, -2), 10),
                    flatNumber: parts[1],
                    position: parts[2]
                };
            });

        res.json({
            success: true,
            data: { slots: availableSlots, total: availableSlots.length }
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

        // Handle parking slot change
        if (parkingSlot && parkingSlot !== existingVehicle.parkingSlot) {
            // Check if new slot is taken by another active vehicle
            const slotTaken = await Vehicle.findOne({
                parkingSlot,
                _id: { $ne: vehicleId },
                isDeleted: { $ne: true }
            });
            if (slotTaken) {
                return res.status(409).json({
                    success: false,
                    message: 'The new parking slot is already occupied. Your original slot has been kept.'
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

        // Soft delete the vehicle (slot string stays on Vehicle, uniqueness is partial-index enforced)
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

// Get all vehicles with resident-safe scoping
const getAllVehicles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const isAdmin = req.user.role === 'admin';

        const filter = { isDeleted: { $ne: true } };
        if (isAdmin && req.query.userId) {
            filter.userId = req.query.userId;
        }
        if (!isAdmin) {
            filter.userId = req.user._id;
        }

        const vehiclesQuery = Vehicle.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        if (isAdmin) {
            vehiclesQuery.populate('userId', 'fullName email wing flatNumber profilePhotoUrl');
        }

        const [vehicles, total] = await Promise.all([
            vehiclesQuery,
            Vehicle.countDocuments(filter)
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
