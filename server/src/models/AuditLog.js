const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    enum: ['user', 'tutor_profile', 'deal', 'review', 'category', 'location', 'system_config'],
    required: true
  },
  entityId: {
    type: String,
    default: ''
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  }
}, {
  timestamps: true
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ admin: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
