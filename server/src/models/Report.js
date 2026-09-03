const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    conversationId: {
      type: String
    },
    category: {
      type: String,
      enum: [
        'inappropriate_behavior',
        'off_platform_contact',
        'harassment',
        'financial_dispute',
        'attendance_dispute',
        'technical_issue',
        'other'
      ],
      default: 'other'
    },
    subject: {
      type: String,
      default: 'Chat Issue Report'
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed description of the incident']
    },
    chatSnapshot: [
      {
        sender: String,
        text: String,
        createdAt: Date
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved', 'dismissed'],
      default: 'pending'
    },
    adminNotes: {
      type: String
    },
    adminResponse: {
      type: String
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Report', reportSchema);

