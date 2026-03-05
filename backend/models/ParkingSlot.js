const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
    slotNumber: {
        type: String,
        required: [true, 'Slot number is required'],
        unique: true,
        trim: true,
        match: [/^[A-F]-([1-9]|1[0-4])(0[1-4])-P[1-2]$/, 'Slot format must be e.g. B-202-P1']
    },
    wing: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D', 'E', 'F']
    },
    floor: {
        type: Number,
        required: true,
        min: 1,
        max: 14
    },
    flatNumber: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true,
        enum: ['P1', 'P2']
    },
    isOccupied: {
        type: Boolean,
        default: false
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// Indexes for filtering
parkingSlotSchema.index({ wing: 1, floor: 1 });
parkingSlotSchema.index({ isOccupied: 1 });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
