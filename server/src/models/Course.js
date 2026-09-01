const mongoose = require('mongoose');

// Question Schema for Chapter Tests
const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    default: 0
  },
  explanation: {
    type: String,
    default: ''
  }
});

// Test / Quiz Schema
const TestSchema = new mongoose.Schema({
  testNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    default: 'Read each question carefully and select the best answer.'
  },
  passingScore: {
    type: Number,
    default: 70
  },
  questions: [QuestionSchema]
}, { timestamps: true });

// Assignment Schema
const AssignmentSchema = new mongoose.Schema({
  assignmentNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  submissionType: {
    type: String,
    enum: ['audio_recitation', 'text', 'file_upload'],
    default: 'audio_recitation'
  },
  maxScore: {
    type: Number,
    default: 100
  },
  dueDateDays: {
    type: Number,
    default: 7
  }
}, { timestamps: true });

// Lesson Schema within Chapter
const ChapterLessonSchema = new mongoose.Schema({
  lessonNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: '15 mins'
  },
  videoUrl: {
    type: String,
    default: ''
  },
  resources: [{
    title: String,
    url: String
  }]
}, { timestamps: true });

// Chapter / Module Schema
const ChapterSchema = new mongoose.Schema({
  chapterNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  lessons: [ChapterLessonSchema],
  tests: [TestSchema],
  assignments: [AssignmentSchema]
}, { timestamps: true });

// Stage & Lesson Schema (Kept for Kids course progression)
const LessonSchema = new mongoose.Schema({
  lessonNumber: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  approach: { type: String, default: '' }
});

const StageSchema = new mongoose.Schema({
  stageNumber: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  lessonCount: { type: Number, required: true },
  badgeReward: { type: String, default: 'Stage Completion Badge' },
  lessons: [LessonSchema]
});

const CourseSchema = new mongoose.Schema({
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorProfile'
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'quran'
  },
  targetAudience: {
    type: String,
    default: 'Kids (Ages ~5–12)'
  },
  ageRange: {
    type: String,
    default: '5–12 Years'
  },
  track: {
    type: String,
    enum: ['kids', 'adult', 'academic'],
    default: 'kids'
  },
  sessionDuration: {
    type: String,
    default: '15–20 minutes'
  },
  totalLessons: {
    type: Number,
    default: 38
  },
  chapters: [ChapterSchema],
  stages: [StageSchema],
  designPrinciples: [{
    title: String,
    description: String,
    icon: String
  }],
  tutorTips: [{
    type: String
  }],
  platformMapping: {
    sessionLengthDefault: String,
    trialPeriodCoverage: String,
    badgeSystem: String
  },
  priceSuggested: {
    amount: Number,
    unit: String,
    currency: String
  },
  isFeatured: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600'
  },
  enrolledCount: {
    type: Number,
    default: 0
  },
  ratingAverage: {
    type: Number,
    default: 5.0
  },
  ratingCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', CourseSchema);
