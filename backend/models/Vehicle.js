const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    vehicleType: {
        type: String,
        required: [true, 'Vehicle type is required'],
        // Accept both frontend formats and backend enum values
        enum: ['Car', 'Bike', 'EV', 'Truck', 'Bus',
               'four_wheeler', 'two_wheeler', 'car', 'bike', 'ev', 'truck', 'bus',
               'Four Wheeler', 'Two Wheeler'],
        trim: true
    },
    vehicleName: {
        type: String,
        required: [true, 'Vehicle name is required'],
        trim: true,
        maxlength: [50, 'Vehicle name cannot exceed 50 characters']
    },
    vehicleModel: {
        type: String,
        required: false,          // optional — frontend may not send this field
        default: null,
        trim: true,
        maxlength: [50, 'Vehicle model cannot exceed 50 characters']
    },
    vehicleColor: {
        type: String,
        required: false,          // optional — frontend may not send this field
        default: null,
        trim: true,
        maxlength: [30, 'Vehicle color cannot exceed 30 characters']
    },
    vehicleNumber: {
        type: String,
        required: [true, 'Vehicle number is required'],
        unique: true,
        uppercase: true,
        match: [/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/, 'Please enter a valid vehicle number (e.g., MH04AB1234)'],
        trim: true
    },
    parkingSlot: {
        type: String,
        required: false,          // optional — can be assigned after vehicle is approved
        default: null,
        match: [/^[A-F]-([1-9]|1[0-4])(0[1-4])-P[1-9]$/, 'Please enter a valid parking slot format (e.g., B-202-P1)'],
        trim: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'approved', 'rejected'],
            message: 'Status must be either pending, approved, or rejected'
        },
        default: 'pending'
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true // This adds both createdAt and updatedAt automatically
});

// Indexes for better query performance
vehicleSchema.index({userId: 1});
vehicleSchema.index({status: 1});
vehicleSchema.index({createdAt: -1});
// Partial unique index: parking slot must be unique among active (non-deleted) vehicles
vehicleSchema.index(
    { parkingSlot: 1 },
    { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
