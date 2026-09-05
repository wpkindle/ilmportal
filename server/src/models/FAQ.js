const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['tutors', 'courses', 'pricing_trials', 'female_safety', 'account', 'general'],
    default: 'general',
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  embedding: {
    type: [Number],
    default: []
  }
}, {
  timestamps: true
});

faqSchema.index({ question: 'text', answer: 'text', tags: 'text' });

module.exports = mongoose.model('FAQ', faqSchema);
