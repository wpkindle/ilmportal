const mongoose = require('mongoose');

const chatRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tutorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorProfile'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
    index: true
  },
  details: {
    type: String,
    required: true,
    trim: true
  },
  studentProfileSnapshot: {
    name: String,
    email: String,
    phone: String,
    guardianPhone: String,
    age: Number,
    gender: String,
    city: String,
    avatar: String
  },
  responseMessage: {
    type: String,
    default: ''
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

chatRequestSchema.index({ student: 1, tutor: 1 });

module.exports = mongoose.model('ChatRequest', chatRequestSchema);
