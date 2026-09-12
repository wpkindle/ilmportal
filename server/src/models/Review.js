const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  },
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
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    default: ''
  },
  adminEdited: {
    type: Boolean,
    default: false
  },
  originalRating: {
    type: Number
  },
  originalComment: {
    type: String
  },
  status: {
    type: String,
    enum: ['published', 'hidden', 'flagged'],
    default: 'published'
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportReason: {
    type: String,
    default: ''
  },
  reportedAt: {
    type: Date
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewerRole: {
    type: String,
    enum: ['student', 'tutor', 'admin'],
    default: 'student'
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetRole: {
    type: String,
    enum: ['student', 'tutor'],
    default: 'tutor'
  },
  quickTags: [{
    type: String
  }]
}, {
  timestamps: true
});

reviewSchema.index({ targetUser: 1, status: 1 });
reviewSchema.index({ tutor: 1, status: 1 });
reviewSchema.index({ student: 1, status: 1 });
reviewSchema.index({ deal: 1, reviewer: 1 });

module.exports = mongoose.model('Review', reviewSchema);
