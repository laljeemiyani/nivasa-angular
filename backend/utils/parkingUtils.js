const Vehicle = require('../models/Vehicle');

/**
 * Utility: Check if a parking slot string is currently free.
 * Slot availability is derived from the Vehicle collection — no ParkingSlot
 * master table needed (removed in DB cleanup, April 2026).
 *
 * @param {string} slotNumber - Slot string e.g. "A-101-P1"
 * @param {string|null} excludeVehicleId - Vehicle _id to exclude (for update checks)
 * @returns {boolean}
 */
const isSlotAvailable = async (slotNumber, excludeVehicleId = null) => {
    const query = { parkingSlot: slotNumber, isDeleted: { $ne: true } };
    if (excludeVehicleId) {
        query._id = { $ne: excludeVehicleId };
    }
    const occupied = await Vehicle.exists(query);
    return !occupied;
};

/**
 * Get all occupied slot strings.
 * @returns {string[]}
 */
const getOccupiedSlots = async () => {
    const vehicles = await Vehicle.find(
        { isDeleted: { $ne: true }, parkingSlot: { $exists: true, $ne: null } },
        { parkingSlot: 1 }
    );
    return vehicles.map(v => v.parkingSlot).filter(Boolean);
};

module.exports = { isSlotAvailable, getOccupiedSlots };
