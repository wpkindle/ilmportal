const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['online', 'in_person'],
    default: 'online'
  },
  price: {
    type: Number,
    required: true // PKR
  },
  priceUnit: {
    type: String,
    enum: ['per_hour', 'per_month', 'total'],
    default: 'per_month'
  },
  scheduleDetails: {
    type: String,
    default: '3 days per week (1 hour/session)'
  },
  status: {
    type: String,
    enum: ['pending_offer', 'active_trial', 'continuation_agreed', 'active_paid', 'trial_declined', 'trial_expired', 'completed', 'cancelled', 'restricted'],
    default: 'pending_offer'
  },
  trialStartDate: {
    type: Date
  },
  trialEndDate: {
    type: Date
  },
  continuationAgreed: {
    type: Boolean,
    default: false
  },
  continuationAgreedAt: {
    type: Date
  },
  tutorFeeDueDate: {
    type: Date
  },
  tutorFeePaid: {
    type: Boolean,
    default: false
  },
  tutorFeeClearanceAt: {
    type: Date
  },
  tutorFeeClearanceBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tutorPaymentProofReference: {
    type: String,
    default: ''
  },
  tutorPaymentProofNotes: {
    type: String,
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'submitted_proof', 'verified', 'rejected'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['jazzcash', 'easypaisa', 'bank_transfer', 'cash', 'other'],
    default: 'jazzcash'
  },
  paymentProofReference: {
    type: String,
    default: ''
  },
  paymentProofNotes: {
    type: String,
    default: ''
  },
  paymentVerifiedAt: {
    type: Date
  },
  paymentVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  accessRestricted: {
    type: Boolean,
    default: false
  },
  restrictionType: {
    type: String,
    enum: ['none', 'warn', 'limit_chat', 'suspend_access'],
    default: 'none'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Deal', dealSchema);
