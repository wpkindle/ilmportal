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
  city: {
    type: String,
    default: '',
    trim: true
  },
  localArea: {
    type: String,
    default: '',
    trim: true
  },
  teachingModes: {
    type: [String],
    enum: ['online', 'in_person'],
    default: ['online']
  },
  tutoringType: {
    type: String,
    enum: ['quran', 'academic', 'both', ''],
    default: 'both'
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    default: ''
  },
  sanadDocuments: [{
    title: { type: String, default: 'Sanad / Degree Document' },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: 'image/jpeg' },
    status: {
      type: String,
      enum: ['pending', 'verified', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  verificationStatus: {
    type: String,
    enum: ['incomplete', 'under_review', 'pending', 'approved', 'rejected', 'contact_needed', 'suspended'],
    default: 'incomplete'
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

tutorProfileSchema.virtual('averageRating').get(function () {
  return this.ratingAverage !== undefined ? this.ratingAverage : 5.0;
});

tutorProfileSchema.virtual('totalReviews').get(function () {
  return this.ratingCount !== undefined ? this.ratingCount : 0;
});

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);
