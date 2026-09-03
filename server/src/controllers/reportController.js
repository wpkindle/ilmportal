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
        title: 'New Incident Report Filed',
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
          title: 'New Incident Report',
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
    const { status, adminNotes, adminResponse, notifyReportedUser } = req.body;
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'name email role')
      .populate('reportedUser', 'name email role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status || report.status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    if (adminResponse !== undefined) {
      report.adminResponse = adminResponse;
    } else if (adminNotes) {
      report.adminResponse = adminNotes;
    }

    if (status === 'resolved' || status === 'dismissed') {
      report.resolvedBy = req.user.id;
      report.resolvedAt = new Date();
    }

    await report.save();

    // 1. Notify the Reporter (Student or Tutor who filed the report)
    const statusLabels = {
      pending: 'is currently Queued for Review',
      under_review: 'is now Under Active Review by our Trust & Safety Team',
      resolved: 'has been Resolved by Platform Administration',
      dismissed: 'has been Reviewed and Closed'
    };

    const reporter = report.reporter;
    if (reporter) {
      const profilePath = reporter.role === 'tutor' ? '/tutor/profile' : '/student/profile';
      const statusText = statusLabels[report.status] || `status updated to ${report.status}`;
      const responseSnippet = report.adminResponse ? ` Response: "${report.adminResponse.substring(0, 120)}..."` : '';

      await Notification.create({
        recipient: reporter._id,
        sender: req.user.id,
        title: `Safety Report: ${report.status.toUpperCase().replace('_', ' ')}`,
        message: `Your incident report regarding "${report.category.replace('_', ' ')}" ${statusText}.${responseSnippet}`,
        type: 'safety_report',
        link: `${profilePath}#safety-reports`
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${reporter._id}`).emit('notification-alert', {
          title: `Safety Report: ${report.status.toUpperCase().replace('_', ' ')}`,
          message: `Your safety report ${statusText}. Check your profile for details.`,
          type: 'safety_report',
          reportId: report._id,
          link: `${profilePath}#safety-reports`
        });
      }
    }

    // 2. Notify the Reported User if requested or on resolution
    if (notifyReportedUser && report.reportedUser) {
      const reported = report.reportedUser;
      const profilePath = reported.role === 'tutor' ? '/tutor/profile' : '/student/profile';
      const userResponseSnippet = report.adminResponse ? ` Notice: "${report.adminResponse.substring(0, 120)}..."` : '';

      await Notification.create({
        recipient: reported._id,
        sender: req.user.id,
        title: `Community Safety & Conduct Update`,
        message: `A conduct inquiry concerning community standards has been updated to "${report.status.toUpperCase()}".${userResponseSnippet}`,
        type: 'safety_report',
        link: `${profilePath}#safety-reports`
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${reported._id}`).emit('notification-alert', {
          title: `Community Safety & Conduct Update`,
          message: `Your conduct review status has been updated. Check your profile for details.`,
          type: 'safety_report',
          reportId: report._id,
          link: `${profilePath}#safety-reports`
        });
      }
    }

    if (req.user) {
      await logAction(
        req.user.id,
        'RESOLVE_INCIDENT_REPORT',
        'user',
        report._id,
        { reportStatus: report.status, adminNotes: report.adminNotes, adminResponse: report.adminResponse },
        req
      );
    }

    res.status(200).json({
      success: true,
      message: `Report status updated to ${report.status} and notifications dispatched.`,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating report status'
    });
  }
};

// @desc    Get reports filed by or concerning the authenticated user
// @route   GET /api/reports/my-reports
// @access  Private (Student & Tutor)
exports.getMyReports = async (req, res) => {
  try {
    const filedByMe = await Report.find({ reporter: req.user.id })
      .sort({ createdAt: -1 })
      .populate('reportedUser', 'name role avatar')
      .populate('resolvedBy', 'name');

    const filedAgainstMe = await Report.find({ reportedUser: req.user.id })
      .sort({ createdAt: -1 })
      .select('category subject status adminResponse createdAt updatedAt resolvedAt')
      .populate('resolvedBy', 'name');

    res.status(200).json({
      success: true,
      filedByMe,
      filedAgainstMe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user reports'
    });
  }
};

