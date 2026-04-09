/**
 * DEPRECATED — April 2026
 * The ParkingSlot master collection was removed as part of the DB cleanup.
 * Slot availability is now derived directly from the Vehicle collection.
 * This migration script is no longer needed and should not be run.
 */
console.error(
  '❌  migrate_parking_system.js is deprecated.\n' +
  '    The ParkingSlot collection was removed in the April 2026 DB cleanup.\n' +
  '    Slot availability is now tracked via the Vehicle collection.'
);
process.exit(1);


const WINGS = ['A', 'B', 'C', 'D', 'E', 'F'];
const FLOORS = Array.from({ length: 14 }, (_, i) => i + 1); // 1 to 14
const FLATS = ['01', '02', '03', '04'];
const POSITIONS = ['P1', 'P2'];

async function generateAllSlots() {
    const slots = [];
    for (const wing of WINGS) {
        for (const floor of FLOORS) {
            for (const flat of FLATS) {
                for (const pos of POSITIONS) {
                    const flatNumber = `${floor}${flat}`;
                    const slotNumber = `${wing}-${flatNumber}-${pos}`;
                    slots.push({
                        slotNumber,
                        wing,
                        floor,
                        flatNumber,
                        position: pos,
                        isOccupied: false,
                        vehicleId: null,
                        userId: null
                    });
                }
            }
        }
    }
    return slots;
}

async function migrate() {
    try {
        await connectDB();
        console.log('✅ Connected to database');

        // Step 1: Set parkingAllocation on existing users
        const userResult = await User.updateMany(
            { parkingAllocation: { $exists: false } },
            { $set: { parkingAllocation: 2 } }
        );
        console.log(`✅ Updated ${userResult.modifiedCount} users with parkingAllocation: 2`);

        // Step 2: Generate all parking slots
        const existingSlotCount = await ParkingSlot.countDocuments();
        if (existingSlotCount > 0) {
            console.log(`⚠️  Found ${existingSlotCount} existing parking slots. Skipping slot generation.`);
        } else {
            const slots = await generateAllSlots();
            await ParkingSlot.insertMany(slots);
            console.log(`✅ Generated ${slots.length} parking slot documents`);
        }

        // Step 3: Mark slots as occupied for existing active vehicles
        const activeVehicles = await Vehicle.find({
            isDeleted: { $ne: true },
            parkingSlot: { $exists: true, $ne: null }
        });

        let occupiedCount = 0;
        for (const vehicle of activeVehicles) {
            const result = await ParkingSlot.findOneAndUpdate(
                { slotNumber: vehicle.parkingSlot },
                {
                    $set: {
                        isOccupied: true,
                        vehicleId: vehicle._id,
                        userId: vehicle.userId
                    }
                }
            );
            if (result) {
                occupiedCount++;
            } else {
                console.warn(`⚠️  Slot ${vehicle.parkingSlot} for vehicle ${vehicle.vehicleNumber} not found in ParkingSlot collection.`);
            }
        }
        console.log(`✅ Marked ${occupiedCount} slots as occupied based on existing vehicles`);

        console.log('\n🎉 Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
