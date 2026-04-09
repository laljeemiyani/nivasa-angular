/**
 * DEPRECATED — April 2026
 * The ParkingSlot master collection was removed as part of the DB cleanup.
 * Race condition protection is now enforced via a partial unique index on
 * Vehicle.parkingSlot (isDeleted != true), so two concurrent Vehicle inserts
 * for the same slot will produce a duplicate-key error (code 11000).
 *
 * This test is superseded by testing the Vehicle.create() duplicate-key path
 * in vehicleController.addVehicle().
 */
console.error(
  '❌  race_condition_parking.js is deprecated.\n' +
  '    The ParkingSlot collection was removed in the April 2026 DB cleanup.\n' +
  '    Concurrency is now enforced by the unique partial index on Vehicle.parkingSlot.'
);
process.exit(1);
