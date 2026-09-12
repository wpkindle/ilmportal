const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema({
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: true,
    index: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true, // in PKR
    min: 1
  },
  title: {
    type: String,
    default: 'Monthly Tuition Fee',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  // Snapshot of tutor payment methods at the time of request
  paymentMethods: [{
    method: {
      type: String,
      enum: ['bank', 'raast', 'easypaisa', 'jazzcash', 'upaisa'],
      required: true
    },
    bankName: { type: String, default: '' },
    accountTitle: { type: String, required: true },
    accountNumber: { type: String, required: true },
    instructions: { type: String, default: '' },
    isDefault: { type: Boolean, default: false }
  }],
  // Threshold: 3 days (72 hours)
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'proof_submitted', 'cleared', 'overdue', 'cancelled'],
    default: 'pending',
    index: true
  },
  // Proof submission by student
  paymentProof: {
    method: {
      type: String,
      enum: ['bank', 'raast', 'easypaisa', 'jazzcash', 'upaisa', 'other', ''],
      default: ''
    },
    transactionId: { type: String, default: '', trim: true },
    senderAccountTitle: { type: String, default: '', trim: true },
    proofImageUrl: { type: String, default: '' },
    notes: { type: String, default: '', trim: true },
    submittedAt: { type: Date }
  },
  // Clearance by tutor
  clearedAt: { type: Date },
  clearedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  clearanceNotes: {
    type: String,
    default: '',
    trim: true
  },
  // Tracking if classroom access is restricted due to overdue threshold
  isClassRestricted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

paymentRequestSchema.index({ deal: 1, createdAt: -1 });
paymentRequestSchema.index({ student: 1, status: 1 });
paymentRequestSchema.index({ tutor: 1, status: 1 });

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);

