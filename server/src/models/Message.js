const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  },
  text: {
    type: String,
    default: ''
  },
  messageType: {
    type: String,
    enum: ['text', 'voice', 'deal_offer', 'deal_accept', 'deal_decline', 'system_alert', 'file'],
    default: 'text'
  },
  voiceData: {
    type: String,
    default: ''
  },
  voiceDuration: {
    type: Number,
    default: 0
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  fileType: {
    type: String,
    default: ''
  },
  dealOfferData: {
    subject: String,
    price: Number,
    priceUnit: String,
    schedule: String,
    mode: String,
    notes: String,
    dealId: mongoose.Schema.Types.ObjectId
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
