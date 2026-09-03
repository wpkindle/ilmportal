const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false
  },
  courseTitle: {
    type: String,
    required: true
  },
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: false
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructorName: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  marks: {
    type: String,
    default: '' // e.g. "95%" or "95/100"
  },
  completionGrade: {
    type: String,
    default: 'Distinction (Sanad Verified)'
  },
  totalLessonsCompleted: {
    type: Number,
    default: 30
  },
  verificationCode: {
    type: String,
    required: true
  },
  studentNotes: {
    type: String,
    default: ''
  },
  tutorNotes: {
    type: String,
    default: ''
  },
  tutorEvaluatedAt: {
    type: Date
  },
  // Admin Pricing & Student Payment Proof Workflow
  price: {
    type: Number,
    default: 0 // In PKR, set manually by admin
  },
  adminPricedAt: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'submitted_proof', 'verified', 'rejected'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['meezan_bank', 'raast', 'easypaisa', 'jazzcash', 'other'],
    default: 'meezan_bank'
  },
  paymentProofReference: {
    type: String,
    default: ''
  },
  paymentProofReceipt: {
    type: String,
    default: '' // Screenshot or proof data URL
  },
  paymentProofNotes: {
    type: String,
    default: ''
  },
  paymentSubmittedAt: {
    type: Date
  },
  adminApprovedAt: {
    type: Date
  },
  adminApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending_tutor_review', 'pending_admin_pricing', 'awaiting_payment', 'payment_submitted', 'issued', 'revoked'],
    default: 'pending_tutor_review'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificate', CertificateSchema);
