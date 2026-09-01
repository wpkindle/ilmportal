const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  trialDurationDays: {
    type: Number,
    default: 3
  },
  paymentInstructions: {
    bankName: { type: String, default: 'Meezan Bank Limited (Islamic Banking)' },
    accountNumber: { type: String, default: '01020304050607' },
    accountTitle: { type: String, default: 'IlmPortal Education Pvt Ltd' },
    iban: { type: String, default: 'PK36MEZN0001020304050607' },
    jazzcashNumber: { type: String, default: '03001234567' },
    jazzcashTitle: { type: String, default: 'IlmPortal Online Tutoring' },
    easypaisaNumber: { type: String, default: '03451234567' },
    easypaisaTitle: { type: String, default: 'IlmPortal Online Tutoring' },
    instructionsNotes: {
      type: String,
      default: 'Please transfer your course fee via JazzCash, EasyPaisa, or Online Bank Transfer and submit the Transaction ID (TID) / reference code below. Our admin team verifies payments within 2–4 hours.'
    }
  },
  platformNotice: {
    type: String,
    default: 'Welcome to Pakistan’s premier Quran & Academic Tutoring Platform. All live classes feature full HD video & interactive whiteboard.'
  },
  supportEmail: {
    type: String,
    default: 'support@pakistanlms.pk'
  },
  supportPhone: {
    type: String,
    default: '+92 300 1234567'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
