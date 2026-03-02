const mongoose = require('mongoose');

const deletionAuditSchema = new mongoose.Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['manual', 'property_sale', 'tenant_move_out', 'system'],
    default: 'manual'
  },
  residentSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  cascadeCounts: {
    familyMembers: { type: Number, default: 0 },
    vehicles: { type: Number, default: 0 },
    complaints: { type: Number, default: 0 },
    notifications: { type: Number, default: 0 }
  },
  notificationIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  forcedLogout: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, { timestamps: true });

deletionAuditSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DeletionAudit', deletionAuditSchema);

