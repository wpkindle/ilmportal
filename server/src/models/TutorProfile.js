const mongoose = require('mongoose');

const tutorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    default: ''
  },
  qualifications: {
    type: String,
    default: ''
  },
  experienceYears: {
    type: Number,
    default: 1
  },
  hourlyRate: {
    type: Number,
    default: 1500 // In PKR
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  cities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }],
  teachingModes: {
    type: [String],
    enum: ['online', 'in_person'],
    default: ['online']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male'
  },
  sanadDocuments: [{
    title: { type: String, default: 'Sanad / Certificate' },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: 'image/jpeg' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'contact_needed', 'under_review', 'suspended'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  contactNotes: {
    type: String,
    default: ''
  },
  ratingAverage: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  availabilitySlots: [{
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
    isBooked: { type: Boolean, default: false }
  }],
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);
