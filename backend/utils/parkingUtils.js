const ParkingSlot = require('../models/ParkingSlot');

/**
 * Auto-allocate 2 default parking slots (P1, P2) when a resident registers.
 * Finds the pre-generated slots for the resident's flat and marks them with the userId.
 * If slots don't exist yet (migration not run), creates them on the fly.
 *
 * @param {string} userId - The ObjectId of the newly registered user
 * @param {string} wing - Wing letter (A-F)
 * @param {string} flatNumber - Flat number (e.g., '101', '1404')
 * @returns {Object} - { allocatedSlots: string[], errors: string[] }
 */
const autoAllocateParking = async (userId, wing, flatNumber) => {
    if (!wing || !flatNumber) {
        return { allocatedSlots: [], errors: ['Wing and flat number are required for parking allocation'] };
    }

    const positions = ['P1', 'P2'];
    const allocatedSlots = [];
    const errors = [];

    for (const pos of positions) {
        const slotNumber = `${wing}-${flatNumber}-${pos}`;
        const floor = parseInt(flatNumber.length <= 3 ? flatNumber.charAt(0) : flatNumber.substring(0, flatNumber.length - 2), 10);

        try {
            // Try to find and claim the existing slot atomically
            let slot = await ParkingSlot.findOneAndUpdate(
                {
                    slotNumber,
                    $or: [
                        { userId: null },
                        { userId: userId } // idempotency: already allocated to this user
                    ]
                },
                {
                    $set: {
                        userId,
                        wing,
                        floor,
                        flatNumber,
                        position: pos
                    }
                },
                { new: true }
            );

            if (slot) {
                allocatedSlots.push(slotNumber);
            } else {
                // Slot might not exist (migration not run), create it
                try {
                    slot = await ParkingSlot.create({
                        slotNumber,
                        wing,
                        floor,
                        flatNumber,
                        position: pos,
                        isOccupied: false,
                        vehicleId: null,
                        userId
                    });
                    allocatedSlots.push(slotNumber);
                } catch (createErr) {
                    // Duplicate key = slot exists but allocated to someone else
                    if (createErr.code === 11000) {
                        errors.push(`Slot ${slotNumber} is already allocated to another resident`);
                    } else {
                        errors.push(`Failed to create slot ${slotNumber}: ${createErr.message}`);
                    }
                }
            }
        } catch (err) {
            errors.push(`Failed to allocate slot ${slotNumber}: ${err.message}`);
        }
    }

    return { allocatedSlots, errors };
};

module.exports = { autoAllocateParking };
