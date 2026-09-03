const mongoose = require('mongoose');
const Report = require('../models/Report');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// Helper to log admin actions
const logAction = async (adminId, action, entityType, entityId, details, req) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : '127.0.0.1';
    await AuditLog.create({
      admin: adminId,
      action,
      entityType,
      entityId: entityId ? entityId.toString() : '',
      details,
      ipAddress
    });
  } catch (err) {
    console.error('AuditLog error:', err.message);
  }
};

// @desc    Submit a new issue/incident report
// @route   POST /api/reports
// @access  Private (Student & Tutor)
exports.createReport = async (req, res) => {
  try {
    const {
      reportedUserId,
      conversationId,
      category,
      subject,
      description,
      chatSnapshot
    } = req.body;

    let targetUserId = reportedUserId;
    if (typeof targetUserId === 'string' && targetUserId.includes('_')) {
      const parts = targetUserId.split('_');
      const myId = req.user.id || (req.user._id ? req.user._id.toString() : '');
      targetUserId = parts.find((p) => p !== myId && p.length === 24) || parts[0];
    }

    if (!targetUserId || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reported user and detailed description of the issue.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reported user ID format.'
      });
    }

    const reportedUser = await User.findById(targetUserId);
    if (!reportedUser) {
      return res.status(404).json({
        success: false,
        message: 'Reported user not found.'
      });
    }

    const report = await Report.create({
      reporter: req.user.id,
      reportedUser: targetUserId,
      conversationId,
      category: category || 'other',
      subject: subject || `Report against ${reportedUser.name}`,
      description: description.trim(),
      chatSnapshot: chatSnapshot || [],
      status: 'pending'
    });

    const populatedReport = await Report.findById(report._id)
      .populate('reporter', 'name email role phone avatar')
      .populate('reportedUser', 'name email role phone avatar');

    // Notify all platform admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        sender: req.user.id,
        title: '⚠️ New Incident Report Filed',
        message: `${req.user.name} (${req.user.role}) reported ${reportedUser.name} (${reportedUser.role}): "${category || 'Issue'}".`,
        type: 'safety_report',
        link: `/admin/reports`
      });
    }

    // Real-time socket broadcast to admins
    const io = req.app.get('io');
    if (io) {
      for (const admin of admins) {
        io.to(`user_${admin._id}`).emit('notification-alert', {
          title: '⚠️ New Incident Report',
          message: `${req.user.name} filed a report against ${reportedUser.name}`,
          type: 'safety_report',
          reportId: report._id
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Your report has been submitted to the Admin Team for priority review. We take safety and quality very seriously.',
      report: populatedReport
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating report'
    });
  }
};

// @desc    Get all reports (Admin only)
// @route   GET /api/reports
// @access  Private (Admin)
exports.getReports = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate('reporter', 'name email role phone avatar')
      .populate('reportedUser', 'name email role phone avatar')
      .populate('resolvedBy', 'name email');

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching reports'
    });
  }
};

// @desc    Update report status (Admin only)
// @route   PUT /api/reports/:id/status
// @access  Private (Admin)
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status || report.status;
    if (adminNotes) report.adminNotes = adminNotes;
    if (status === 'resolved' || status === 'dismissed') {
      report.resolvedBy = req.user.id;
    }

    await report.save();

    if (req.user) {
      await logAction(
        req.user.id,
        'RESOLVE_INCIDENT_REPORT',
        'user',
        report._id,
        { reportStatus: report.status, adminNotes },
        req
      );
    }

    res.status(200).json({
      success: true,
      message: `Report status updated to ${report.status}`,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating report status'
    });
  }
};

