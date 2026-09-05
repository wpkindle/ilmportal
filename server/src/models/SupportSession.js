const mongoose = require('mongoose');

const messageItemSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'bot', 'admin', 'system'],
    required: true
  },
  senderName: {
    type: String,
    default: 'User'
  },
  senderAvatar: {
    type: String,
    default: ''
  },
  text: {
    type: String,
    required: true
  },
  thoughts: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const supportSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  guestInfo: {
    name: { type: String, default: 'Guest Visitor' },
    email: { type: String, default: '' },
    role: { type: String, default: 'visitor' },
    city: { type: String, default: '' },
    ip: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['ai_active', 'human_requested', 'admin_joined', 'resolved', 'closed'],
    default: 'ai_active',
    index: true
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  messages: [messageItemSchema],
  lastMessage: {
    type: String,
    default: ''
  },
  lastSender: {
    type: String,
    default: 'user'
  },
  requestedAt: {
    type: Date,
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  unreadAdminCount: {
    type: Number,
    default: 0
  },
  unreadUserCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

supportSessionSchema.index({ status: 1, updatedAt: -1 });

module.exports = mongoose.model('SupportSession', supportSessionSchema);
