const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true,
    maxlength: [255, 'Title cannot exceed 255 characters']
  },
  description: {
    type: String,
    required: [true, 'Notice description is required'],
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'maintenance', 'security', 'event', 'payment', 'other'],
    default: 'general'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attachmentUrl: {
    type: String,
    default: null
  },
  expiryDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
noticeSchema.index({ userId: 1 });
noticeSchema.index({ isActive: 1 });
noticeSchema.index({ priority: 1 });
noticeSchema.index({ category: 1 });
noticeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
