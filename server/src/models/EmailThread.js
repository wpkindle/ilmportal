const mongoose = require('mongoose');

const emailMessageItemSchema = new mongoose.Schema({
  messageId: {
    type: String,
    default: ''
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  from: {
    name: { type: String, default: '' },
    address: { type: String, required: true, lowercase: true, trim: true }
  },
  to: [{
    name: { type: String, default: '' },
    address: { type: String, required: true, lowercase: true, trim: true }
  }],
  subject: {
    type: String,
    default: ''
  },
  text: {
    type: String,
    default: ''
  },
  html: {
    type: String,
    default: ''
  },
  attachments: [{
    filename: String,
    contentUrl: String,
    contentType: String,
    size: Number
  }],
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const emailThreadSchema = new mongoose.Schema({
  threadId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  subject: {
    type: String,
    default: '(No Subject)',
    trim: true
  },
  from: {
    name: { type: String, default: '' },
    address: { type: String, required: true, lowercase: true, trim: true, index: true }
  },
  to: [{
    name: { type: String, default: '' },
    address: { type: String, required: true, lowercase: true, trim: true }
  }],
  replyTo: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'archived'],
    default: 'unread',
    index: true
  },
  category: {
    type: String,
    enum: ['general', 'tutor_inquiry', 'student_admission', 'support', 'sanad_verification', 'billing'],
    default: 'general',
    index: true
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'urgent'],
    default: 'normal'
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  userRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userRole: {
    type: String,
    enum: ['student', 'tutor', 'admin', 'guest'],
    default: 'guest'
  },
  messages: [emailMessageItemSchema],
  lastMessageSnippet: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for fast querying in admin mailbox
emailThreadSchema.index({ status: 1, lastMessageAt: -1 });
emailThreadSchema.index({ category: 1, lastMessageAt: -1 });
emailThreadSchema.index({ 'from.address': 1 });

module.exports = mongoose.model('EmailThread', emailThreadSchema);

