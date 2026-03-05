/**
 * Race Condition Test: Concurrent Parking Slot Claims
 *
 * Simulates two residents trying to claim the same parking slot simultaneously.
 * Verifies that only one succeeds using the atomic findOneAndUpdate pattern.
 *
 * Usage: node tests/race_condition_parking.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const ParkingSlot = require('../models/ParkingSlot');

async function testRaceCondition() {
    try {
        await connectDB();
        console.log('✅ Connected to database');

        // Find an available slot to test with
        const testSlot = await ParkingSlot.findOne({ isOccupied: false });
        if (!testSlot) {
            console.error('❌ No available parking slots found. Run the migration script first.');
            process.exit(1);
        }

        const slotNumber = testSlot.slotNumber;
        console.log(`🎯 Testing concurrent claims on slot: ${slotNumber}`);

        // Ensure the slot is free before test
        await ParkingSlot.findOneAndUpdate(
            { slotNumber },
            { $set: { isOccupied: false, userId: null, vehicleId: null } }
        );

        // Create two fake user IDs
        const userId1 = new mongoose.Types.ObjectId();
        const userId2 = new mongoose.Types.ObjectId();

        // Simulate two concurrent atomic claims using Promise.all
        const [result1, result2] = await Promise.all([
            ParkingSlot.findOneAndUpdate(
                { slotNumber, isOccupied: false },
                { $set: { isOccupied: true, userId: userId1 } },
                { new: true }
            ),
            ParkingSlot.findOneAndUpdate(
                { slotNumber, isOccupied: false },
                { $set: { isOccupied: true, userId: userId2 } },
                { new: true }
            )
        ]);

        // Exactly one should succeed, the other should return null
        const succeeded = [result1, result2].filter(r => r !== null);
        const failed = [result1, result2].filter(r => r === null);

        if (succeeded.length === 1 && failed.length === 1) {
            const winnerId = succeeded[0].userId.toString();
            const winner = winnerId === userId1.toString() ? 'User 1' : 'User 2';
            console.log(`✅ PASS: Only one claim succeeded (${winner}). The other correctly received null.`);
            console.log(`   Winner userId: ${winnerId}`);
        } else if (succeeded.length === 2) {
            console.error('❌ FAIL: Both claims succeeded! Race condition NOT prevented.');
        } else if (succeeded.length === 0) {
            console.error('❌ FAIL: Neither claim succeeded. Something is wrong with the slot state.');
        }

        // Cleanup: Reset the test slot
        await ParkingSlot.findOneAndUpdate(
            { slotNumber },
            { $set: { isOccupied: false, userId: null, vehicleId: null } }
        );
        console.log('🧹 Cleaned up test slot');

        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed with error:', error);
        process.exit(1);
    }
}

testRaceCondition();
