const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'tutor_application',
      'verification_status',
      'deal_offer',
      'deal_accepted',
      'deal_declined',
      'trial_expiring',
      'payment_pending',
      'payment_verified',
      'payment_rejected',
      'new_message',
      'chat_request',
      'chat_request_accepted',
      'chat_request_declined',
      'session_reminder',
      'safety_report',
      'admin_alert'
    ],
    default: 'admin_alert'
  },
  link: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
