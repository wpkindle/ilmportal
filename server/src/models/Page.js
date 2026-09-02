const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    enum: ['privacy-policy', 'terms', 'disclaimer', 'about-us', 'contact-us']
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: true
  },
  metaDescription: {
    type: String,
    default: ''
  },
  contactDetails: {
    email: { type: String, default: 'support@pakistanlms.pk' },
    phone: { type: String, default: '+92 300 1234567' },
    whatsapp: { type: String, default: '+92 300 1234567' },
    address: { type: String, default: 'Lahore, Punjab, Pakistan' },
    workingHours: { type: String, default: 'Monday – Saturday: 9:00 AM – 9:00 PM PKT' }
  },
  aboutDetails: {
    mission: { type: String, default: 'Empowering Pakistani families with accessible, authentic Quranic studies and high-achieving academic tutoring from the safety of home.' },
    vision: { type: String, default: 'To be the most trusted and credible learning platform in Pakistan, upholding academic excellence and authentic Quranic tradition.' },
    initiativeText: { type: String, default: 'An initiative by Mr. & Mrs. Abdul Khaliq from Lahore, Pakistan.' }
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Page', pageSchema);
