const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [255, 'Title cannot exceed 255 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'status_update', 'new_registration', 'parking_request'],
    default: 'info'
  },
  routingType: {
    type: String,
    enum: ['COMPLAINT_UPDATE', 'PARKING_REQUEST', 'BROADCAST', 'SYSTEM'],
    default: 'SYSTEM',
    required: [true, 'Routing type is required for frontend navigation']
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedModel: {
    type: String,
    enum: ['Vehicle', 'Maintenance', 'Payment', 'Notice', 'Other', 'User', 'ParkingSlotRequest', 'Complaint'],
    default: 'Other'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
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
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);