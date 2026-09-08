const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Article slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  content: {
    type: String,
    required: [true, 'Article content is required']
  },
  excerpt: {
    type: String,
    default: '',
    trim: true,
    maxlength: [350, 'Excerpt cannot exceed 350 characters']
  },
  coverImage: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    enum: {
      values: ['Abdul Khaliq', 'Mrs. Abdul Khaliq', 'Guest Author'],
      message: 'Author must be one of: Abdul Khaliq, Mrs. Abdul Khaliq, or Guest Author'
    },
    default: 'Abdul Khaliq'
  },
  category: {
    type: String,
    default: 'Quran & Islamic Education',
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  readTime: {
    type: String,
    default: '5 min read'
  },
  isPublished: {
    type: Boolean,
    default: true,
    index: true
  },
  publishedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  views: {
    type: Number,
    default: 0
  },
  metaTitle: {
    type: String,
    default: '',
    trim: true
  },
  metaDescription: {
    type: String,
    default: '',
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Article', articleSchema);

