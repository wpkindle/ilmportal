const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const Category = require('../models/Category');
const Location = require('../models/Location');
const Deal = require('../models/Deal');
const Message = require('../models/Message');
const Review = require('../models/Review');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const SystemConfig = require('../models/SystemConfig');
const Report = require('../models/Report');
const { sendTutorStatusEmail, sendAccountWarningEmail, sendAccountStatusEmail } = require('../utils/emailService');

// Helper to log admin actions
const logAction = async (adminId, action, entityType, entityId, details, req) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
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

// @desc    Get Admin Dashboard Stats & Analytics
// @route   GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTutors = await User.countDocuments({ role: 'tutor' });
    const approvedTutors = await TutorProfile.countDocuments({ verificationStatus: 'approved' });
    const pendingTutorApprovals = await TutorProfile.countDocuments({ verificationStatus: { $in: ['under_review', 'pending'] } });
    const incompleteTutors = await TutorProfile.countDocuments({ verificationStatus: 'incomplete' });
    
    const totalDeals = await Deal.countDocuments();
    const activeTrialDeals = await Deal.countDocuments({ status: 'active_trial' });
    const activePaidDeals = await Deal.countDocuments({ status: 'active_paid' });
    const expiredDeals = await Deal.countDocuments({ status: 'trial_expired' });
    const completedSessions = await Session.countDocuments({ status: 'completed' });

    // Incident & Safety Reports
    const pendingReportsCount = await Report.countDocuments({ status: 'pending' });
    const totalReportsCount = await Report.countDocuments();
    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('reporter', 'name email role avatar')
      .populate('reportedUser', 'name email role avatar');

    // Aggregate revenue from verified payments
    const verifiedDeals = await Deal.find({ paymentStatus: 'verified' });
    const totalRevenue = verifiedDeals.reduce((sum, d) => sum + (d.price || 0), 0);

    // City distribution
    const locationStats = await User.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // Categories count
    const totalCategories = await Category.countDocuments();
    const totalLocations = await Location.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalTutors,
        approvedTutors,
        pendingTutorApprovals,
        totalDeals,
        activeTrialDeals,
        activePaidDeals,
        expiredDeals,
        completedSessions,
        totalRevenue,
        pendingReportsCount,
        totalReportsCount,
        recentReports,
        totalCategories,
        totalLocations,
        locationStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching stats'
    });
  }
};

// @desc    Get Tutor Approval Queue
// @route   GET /api/admin/tutors/queue
exports.getTutorApprovalQueue = async (req, res) => {
  try {
    const { status = 'under_review' } = req.query;
    let filter = {};

    if (status === 'under_review') {
      filter = { verificationStatus: { $in: ['under_review', 'pending'] } };
    } else if (status === 'incomplete') {
      filter = { verificationStatus: 'incomplete' };
    } else if (status === 'approved') {
      filter = { verificationStatus: 'approved' };
    } else if (status === 'contact_needed') {
      filter = { verificationStatus: 'contact_needed' };
    } else if (status === 'rejected') {
      filter = { verificationStatus: 'rejected' };
    } else if (status !== 'all') {
      filter = { verificationStatus: status };
    }

    const tutors = await TutorProfile.find(filter)
      .populate('user', 'name email avatar phone city isVerified createdAt')
      .populate('subjects', 'name type')
      .populate('cities', 'name province')
      .sort({ createdAt: -1 });

    const { calculateProfileCompletion } = require('./authController');
    const tutorsWithCompletion = tutors.map((t) => {
      const completion = t.user ? calculateProfileCompletion(t.user, t) : { percentage: 0, items: [] };
      return {
        ...t.toObject(),
        completion
      };
    });

    const counts = {
      under_review: await TutorProfile.countDocuments({ verificationStatus: { $in: ['under_review', 'pending'] } }),
      incomplete: await TutorProfile.countDocuments({ verificationStatus: 'incomplete' }),
      approved: await TutorProfile.countDocuments({ verificationStatus: 'approved' }),
      contact_needed: await TutorProfile.countDocuments({ verificationStatus: 'contact_needed' }),
      rejected: await TutorProfile.countDocuments({ verificationStatus: 'rejected' }),
      all: await TutorProfile.countDocuments({})
    };

    res.status(200).json({
      success: true,
      count: tutorsWithCompletion.length,
      counts,
      tutors: tutorsWithCompletion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching approval queue'
    });
  }
};

// @desc    Approve Tutor Application
// @route   PUT /api/admin/tutors/:id/approve
exports.approveTutor = async (req, res) => {
  try {
    const tutor = await TutorProfile.findById(req.params.id).populate('user');

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found'
      });
    }

    tutor.verificationStatus = 'approved';
    tutor.rejectionReason = '';
    await tutor.save();

    // Create Notification & Send Email
    await Notification.create({
      recipient: tutor.user._id,
      sender: req.user.id,
      title: 'Tutor Profile Approved!',
      message: 'Congratulations! Your tutor application and credentials have been verified and approved. Your profile is now live.',
      type: 'verification_status',
      link: '/tutor/dashboard'
    });

    await sendTutorStatusEmail(tutor.user.email, tutor.user.name, 'approved');
    await logAction(req.user.id, 'APPROVE_TUTOR', 'tutor_profile', tutor._id, { tutorName: tutor.user.name }, req);

    res.status(200).json({
      success: true,
      message: `Tutor ${tutor.user.name} has been approved successfully!`,
      tutor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error approving tutor'
    });
  }
};

// @desc    Reject Tutor Application
// @route   PUT /api/admin/tutors/:id/reject
exports.rejectTutor = async (req, res) => {
  try {
    const { reason } = req.body;
    const tutor = await TutorProfile.findById(req.params.id).populate('user');

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found'
      });
    }

    tutor.verificationStatus = 'rejected';
    tutor.rejectionReason = reason || 'Documentation could not be verified.';
    await tutor.save();

    await Notification.create({
      recipient: tutor.user._id,
      sender: req.user.id,
      title: 'Tutor Application Update',
      message: `Your tutor application could not be approved. Reason: ${tutor.rejectionReason}`,
      type: 'verification_status',
      link: '/tutor/profile'
    });

    await sendTutorStatusEmail(tutor.user.email, tutor.user.name, 'rejected', tutor.rejectionReason);
    await logAction(req.user.id, 'REJECT_TUTOR', 'tutor_profile', tutor._id, { reason: tutor.rejectionReason }, req);

    res.status(200).json({
      success: true,
      message: `Tutor application marked as rejected.`,
      tutor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error rejecting tutor'
    });
  }
};

// @desc    Contact Tutor Applicant
// @route   PUT /api/admin/tutors/:id/contact
exports.contactTutor = async (req, res) => {
  try {
    const { notes } = req.body;
    const tutor = await TutorProfile.findById(req.params.id).populate('user');

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found'
      });
    }

    tutor.verificationStatus = 'contact_needed';
    tutor.contactNotes = notes || 'Please upload a clearer scan of your Sanad certificate.';
    await tutor.save();

    await Notification.create({
      recipient: tutor.user._id,
      sender: req.user.id,
      title: 'Clarification Needed on Your Application',
      message: `Admin Note: ${tutor.contactNotes}`,
      type: 'verification_status',
      link: '/tutor/profile'
    });

    await sendTutorStatusEmail(tutor.user.email, tutor.user.name, 'contact_needed', tutor.contactNotes);
    await logAction(req.user.id, 'CONTACT_TUTOR', 'tutor_profile', tutor._id, { notes: tutor.contactNotes }, req);

    res.status(200).json({
      success: true,
      message: `Clarification notice sent to ${tutor.user.name}`,
      tutor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending contact notice'
    });
  }
};

// @desc    Get All Users with search & filters
// @route   GET /api/admin/users
// @desc    Get All Users with search, role, and status filters
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, city, status, isVerified } = req.query;
    const query = {};

    if (role && role !== 'all' && role !== 'undefined' && role !== 'null') {
      query.role = role;
    }

    if (city && city !== 'all' && city !== 'undefined' && city !== 'null' && city.trim()) {
      query.city = new RegExp(city.trim(), 'i');
    }

    if (status && status !== 'all' && status !== 'undefined' && status !== 'null') {
      if (status === 'warned') {
        query.$or = [{ status: 'warned' }, { warningCount: { $gt: 0 } }];
      } else if (status === 'suspended') {
        query.$or = [{ status: 'suspended' }, { status: 'deactivated' }, { isActive: false }];
      } else if (status === 'under_review') {
        query.status = 'under_review';
      } else if (status === 'active') {
        query.$and = [
          { $or: [{ status: 'active' }, { status: { $exists: false } }, { status: null }] },
          { isActive: { $ne: false } }
        ];
      } else {
        query.status = status;
      }
    }

    if (isVerified !== undefined && isVerified !== 'all' && isVerified !== 'undefined' && isVerified !== 'null') {
      query.isVerified = isVerified === 'true';
    }

    if (search && search !== 'undefined' && search !== 'null' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchConditions = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
      if (query.$or) {
        query.$and = (query.$and || []).concat([{ $or: query.$or }, { $or: searchConditions }]);
        delete query.$or;
      } else if (query.$and) {
        query.$and.push({ $or: searchConditions });
      } else {
        query.$or = searchConditions;
      }
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    // Enhance each user with tutor profile info & active deals count
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const uObj = u.toObject();
        if (u.role === 'tutor') {
          const profile = await TutorProfile.findOne({ user: u._id })
            .populate('subjects', 'name slug')
            .populate('cities', 'name');
          uObj.tutorProfile = profile;
        }
        const dealCount = await Deal.countDocuments({
          $or: [{ student: u._id }, { tutor: u._id }]
        });
        const reportsCount = await Report.countDocuments({ reportedUser: u._id });
        uObj.dealCount = dealCount;
        uObj.reportsCount = reportsCount;
        return uObj;
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedUsers.length,
      users: enrichedUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users'
    });
  }
};

// @desc    Issue Official Warning to User (Student or Tutor)
// @route   PUT /api/admin/users/:id/warning
exports.issueUserWarning = async (req, res) => {
  try {
    const { reason, message, sendEmail } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!reason || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide warning violation reason and message explanation.'
      });
    }

    user.warningCount = (user.warningCount || 0) + 1;
    user.status = 'warned';
    user.warnings.push({
      reason,
      message,
      issuedBy: req.user.id,
      issuedAt: new Date()
    });

    await user.save();

    // Create In-App Notification
    await Notification.create({
      recipient: user._id,
      sender: req.user.id,
      title: `Policy Warning Notice (Strike #${user.warningCount})`,
      message: `Violation: ${reason}. Message: "${message}". Please adhere to community guidelines.`,
      type: 'admin_alert',
      link: user.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'
    });

    // Real-time Socket Alert
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${user._id}`).emit('notification-alert', {
        title: `Policy Warning Notice (Strike #${user.warningCount})`,
        message: `Violation: ${reason}. "${message}"`,
        type: 'admin_alert'
      });
    }

    // Send Branded Email Notice asynchronously without blocking response
    if (sendEmail !== false) {
      sendAccountWarningEmail({
        to: user.email,
        userName: user.name,
        reason,
        message,
        warningCount: user.warningCount
      }).catch((e) => console.error('Failed to send warning email:', e.message));
    }

    await logAction(
      req.user.id,
      'WARN_USER',
      'user',
      user._id,
      { userName: user.name, role: user.role, reason, warningCount: user.warningCount },
      req
    );

    res.status(200).json({
      success: true,
      message: `Official warning issued to ${user.name} (Strike #${user.warningCount})`,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error issuing warning'
    });
  }
};

// @desc    Update User Moderation Status (Active / Under Review / Suspended / Deactivated)
// @route   PUT /api/admin/users/:id/status
exports.updateUserStatus = async (req, res) => {
  try {
    const { status, reason, notes, sendEmail } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const validStatuses = ['active', 'warned', 'under_review', 'suspended', 'deactivated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const prevStatus = user.status;
    user.status = status;
    user.isActive = status !== 'suspended' && status !== 'deactivated';
    if (notes) user.adminNotes = notes;
    if (reason) user.underReviewReason = reason;

    await user.save();

    // If Tutor, sync verificationStatus in TutorProfile
    if (user.role === 'tutor') {
      const tutorProfile = await TutorProfile.findOne({ user: user._id });
      if (tutorProfile) {
        if (status === 'under_review') {
          tutorProfile.verificationStatus = 'under_review';
        } else if (status === 'suspended' || status === 'deactivated') {
          tutorProfile.verificationStatus = 'suspended';
        } else if (status === 'active' && tutorProfile.verificationStatus !== 'approved') {
          tutorProfile.verificationStatus = 'approved';
        }
        await tutorProfile.save();
      }
    }

    // In-App Notification
    let notifTitle = 'Account Status Notice';
    let notifMsg = `Your account status has been set to: ${status.replace('_', ' ').toUpperCase()}.`;
    if (status === 'active') {
      notifTitle = 'Account Reinstated & Active';
      notifMsg = 'Your account has been fully verified and is active on IlmiDunya.';
    } else if (status === 'under_review') {
      notifTitle = 'Account Placed Under Administrative Review';
      notifMsg = `Your account is temporarily under review. Reason: ${reason || 'Standard safety audit'}.`;
    } else if (status === 'suspended') {
      notifTitle = 'Account Suspended';
      notifMsg = `Your account access has been suspended by administration. Reason: ${reason || 'Policy violation'}.`;
    }

    await Notification.create({
      recipient: user._id,
      sender: req.user.id,
      title: notifTitle,
      message: notifMsg,
      type: 'admin_alert',
      link: user.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'
    });

    // Real-time socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${user._id}`).emit('notification-alert', {
        title: notifTitle,
        message: notifMsg,
        type: 'admin_alert',
        accountStatus: status
      });
    }

    // Send Status Email Notice asynchronously without blocking response
    if (sendEmail !== false) {
      sendAccountStatusEmail({
        to: user.email,
        userName: user.name,
        status,
        reason,
        notes
      }).catch((e) => console.error('Failed to send status email:', e.message));
    }

    await logAction(
      req.user.id,
      'UPDATE_USER_STATUS',
      'user',
      user._id,
      { userName: user.name, role: user.role, prevStatus, newStatus: status, reason },
      req
    );

    res.status(200).json({
      success: true,
      message: `User ${user.name} status updated from ${prevStatus} to ${status}`,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user status'
    });
  }
};

// @desc    Permanently Delete / Remove User Account
// @route   DELETE /api/admin/users/:id
exports.deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own administrator account.'
      });
    }

    const userName = user.name;
    const userEmail = user.email;
    const userRole = user.role;

    // Delete associated tutor profile if tutor
    if (user.role === 'tutor') {
      await TutorProfile.deleteOne({ user: user._id });
    }

    // Cancel any active deals
    await Deal.updateMany(
      { $or: [{ student: user._id }, { tutor: user._id }] },
      { status: 'cancelled' }
    );

    // Delete User
    await User.findByIdAndDelete(user._id);

    await logAction(
      req.user.id,
      'DELETE_USER_ACCOUNT',
      'user',
      user._id,
      { userName, userEmail, userRole },
      req
    );

    res.status(200).json({
      success: true,
      message: `Account for ${userName} (${userEmail}) has been permanently deleted.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting user'
    });
  }
};

// @desc    Toggle User Active Status (Legacy Ban / Unban)
// @route   PUT /api/admin/users/:id/toggle-status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    user.status = user.isActive ? 'active' : 'suspended';
    await user.save();

    await logAction(req.user.id, user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER', 'user', user._id, { userName: user.name }, req);

    res.status(200).json({
      success: true,
      message: `User ${user.name} is now ${user.isActive ? 'active' : 'deactivated'}`,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error toggling user status'
    });
  }
};

// @desc    Get All Deals (Admin Overview)
// @route   GET /api/admin/deals
exports.getAllDeals = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;

    const deals = await Deal.find(query)
      .populate('student', 'name email phone avatar city')
      .populate('tutor', 'name email phone avatar city')
      .populate('paymentVerifiedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deals.length,
      deals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching deals'
    });
  }
};

// @desc    Admin manually verifies payment for a deal
// @route   PUT /api/admin/deals/:id/verify-payment
exports.verifyDealPayment = async (req, res) => {
  try {
    const { status = 'verified' } = req.body;
    const deal = await Deal.findById(req.params.id)
      .populate('student', 'name email')
      .populate('tutor', 'name email');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    if (status === 'verified') {
      deal.paymentStatus = 'verified';
      deal.status = 'active_paid';
      deal.paymentVerifiedAt = new Date();
      deal.paymentVerifiedBy = req.user.id;
      deal.accessRestricted = false;
      deal.restrictionType = 'none';
      await deal.save();

      // Notify Student & Tutor
      await Notification.create({
        recipient: deal.student._id,
        sender: req.user.id,
        title: 'Payment Verified! 🎉',
        message: `Your payment of PKR ${deal.price} for "${deal.subject}" has been verified by the admin team. Your course access is fully active!`,
        type: 'payment_verified',
        link: '/student/deals'
      });

      await Notification.create({
        recipient: deal.tutor._id,
        sender: req.user.id,
        title: 'Student Payment Verified ✅',
        message: `Payment for deal with ${deal.student.name} (${deal.subject}, PKR ${deal.price}) has been verified.`,
        type: 'payment_verified',
        link: '/tutor/deals'
      });

      await logAction(req.user.id, 'VERIFY_PAYMENT', 'deal', deal._id, { amount: deal.price, student: deal.student.name, tutor: deal.tutor.name }, req);

      return res.status(200).json({
        success: true,
        message: 'Payment marked as verified successfully. Deal status set to Active Paid.',
        deal
      });
    } else {
      deal.paymentStatus = 'rejected';
      await deal.save();

      await Notification.create({
        recipient: deal.student._id,
        sender: req.user.id,
        title: 'Payment Proof Rejected',
        message: `The payment reference code for "${deal.subject}" could not be verified. Please check your transaction ID and resubmit.`,
        type: 'payment_rejected',
        link: '/student/deals'
      });

      await logAction(req.user.id, 'REJECT_PAYMENT', 'deal', deal._id, { dealId: deal._id }, req);

      return res.status(200).json({
        success: true,
        message: 'Payment marked as rejected.',
        deal
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating payment status'
    });
  }
};

// @desc    Admin restricts deal access (warn / limit_chat / suspend)
// @route   PUT /api/admin/deals/:id/restrict
exports.restrictDealAccess = async (req, res) => {
  try {
    const { restrictionType, accessRestricted } = req.body;
    const deal = await Deal.findById(req.params.id)
      .populate('student', 'name email')
      .populate('tutor', 'name email');

    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    deal.accessRestricted = accessRestricted !== undefined ? accessRestricted : true;
    deal.restrictionType = restrictionType || 'warn';
    if (deal.restrictionType === 'suspend_access') {
      deal.status = 'restricted';
    }
    await deal.save();

    await Notification.create({
      recipient: deal.tutor._id,
      sender: req.user.id,
      title: 'Deal Status / Restriction Update',
      message: `Admin applied restriction (${deal.restrictionType}) on deal "${deal.subject}". Please verify trial payment.`,
      type: 'admin_alert',
      link: '/tutor/deals'
    });

    await logAction(req.user.id, 'RESTRICT_DEAL', 'deal', deal._id, { restrictionType: deal.restrictionType }, req);

    res.status(200).json({
      success: true,
      message: `Deal restriction updated to: ${deal.restrictionType}`,
      deal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating restriction'
    });
  }
};

// @desc    Get All Conversations for Chat Oversight
// @route   GET /api/admin/chats
exports.getAllConversations = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'name email avatar role city')
      .populate('recipient', 'name email avatar role city')
      .populate('deal')
      .sort({ createdAt: -1 });

    const conversationMap = new Map();

    for (const msg of messages) {
      if (!msg.sender || !msg.recipient) continue;
      if (!conversationMap.has(msg.conversationId)) {
        const totalMsgs = await Message.countDocuments({ conversationId: msg.conversationId });
        conversationMap.set(msg.conversationId, {
          conversationId: msg.conversationId,
          user1: msg.sender,
          user2: msg.recipient,
          lastMessage: msg,
          messageCount: totalMsgs,
          deal: msg.deal
        });
      }
    }

    res.status(200).json({
      success: true,
      conversations: Array.from(conversationMap.values())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching chat conversations'
    });
  }
};

// @desc    Get Complete Chat Transcript for a Conversation
// @route   GET /api/admin/chats/:conversationId/transcript
exports.getConversationTranscript = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email avatar role city')
      .populate('recipient', 'name email avatar role city')
      .populate('deal')
      .sort({ createdAt: 1 });

    await logAction(req.user.id, 'VIEW_CHAT_TRANSCRIPT', 'deal', conversationId, { conversationId }, req);

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching transcript'
    });
  }
};

// @desc    Get All Reviews for Moderation & Override
// @route   GET /api/admin/reviews
exports.getAllReviews = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};

    const reviews = await Review.find(query)
      .populate('student', 'name email avatar city')
      .populate('tutor', 'name email avatar city')
      .populate('deal', 'subject price mode')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching reviews'
    });
  }
};

// @desc    Admin Override Review Rating & Comment
// @route   PUT /api/admin/reviews/:id/override
exports.overrideReview = async (req, res) => {
  try {
    const { rating, comment, status } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (!review.adminEdited) {
      review.originalRating = review.rating;
      review.originalComment = review.comment;
      review.adminEdited = true;
    }

    if (rating !== undefined) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;
    if (status !== undefined) review.status = status;

    await review.save();

    // Recalculate tutor's rating average and count
    const allTutorReviews = await Review.find({ tutor: review.tutor, status: 'published' });
    const count = allTutorReviews.length;
    const avg = count > 0 ? (allTutorReviews.reduce((sum, r) => sum + r.rating, 0) / count) : 5.0;

    await TutorProfile.findOneAndUpdate(
      { user: review.tutor },
      {
        ratingAverage: Math.round(avg * 10) / 10,
        ratingCount: count
      }
    );

    await logAction(req.user.id, 'OVERRIDE_REVIEW', 'review', review._id, {
      newRating: review.rating,
      newComment: review.comment,
      status: review.status
    }, req);

    res.status(200).json({
      success: true,
      message: 'Review rating/comment successfully moderated & updated!',
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error overriding review'
    });
  }
};

// @desc    Delete or Hide Review
// @route   DELETE /api/admin/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const tutorId = review.tutor;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate tutor's rating average and count
    const allTutorReviews = await Review.find({ tutor: tutorId, status: 'published' });
    const count = allTutorReviews.length;
    const avg = count > 0 ? (allTutorReviews.reduce((sum, r) => sum + r.rating, 0) / count) : 5.0;

    await TutorProfile.findOneAndUpdate(
      { user: tutorId },
      {
        ratingAverage: Math.round(avg * 10) / 10,
        ratingCount: count
      }
    );

    await logAction(req.user.id, 'DELETE_REVIEW', 'review', req.params.id, { tutorId }, req);

    res.status(200).json({
      success: true,
      message: 'Review removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing review'
    });
  }
};

// @desc    Get Session Logs (Live & In-Person)
// @route   GET /api/admin/sessions
exports.getSessionLogs = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('deal', 'subject price mode status')
      .populate('tutor', 'name email avatar phone city')
      .populate('student', 'name email avatar phone city')
      .sort({ scheduledStartTime: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching session logs'
    });
  }
};

// @desc    Get Audit Logs
// @route   GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('admin', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching audit logs'
    });
  }
};

// @desc    CMS - Create Category
// @route   POST /api/admin/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, description, type, icon, subtopics } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      type: type || 'quran',
      icon: icon || 'BookOpen',
      subtopics: subtopics || []
    });

    await logAction(req.user.id, 'CREATE_CATEGORY', 'category', category._id, { name }, req);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating category'
    });
  }
};

// @desc    CMS - Update Category
// @route   PUT /api/admin/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, type, icon, subtopics, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) category.description = description;
    if (type !== undefined) category.type = type;
    if (icon !== undefined) category.icon = icon;
    if (subtopics !== undefined) category.subtopics = subtopics;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    await logAction(req.user.id, 'UPDATE_CATEGORY', 'category', category._id, { name: category.name }, req);

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating category'
    });
  }
};

// @desc    CMS - Delete Category
// @route   DELETE /api/admin/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await logAction(req.user.id, 'DELETE_CATEGORY', 'category', req.params.id, { name: category.name }, req);

    res.status(200).json({
      success: true,
      message: 'Category removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting category'
    });
  }
};

// @desc    CMS - Create Location / City
// @route   POST /api/admin/locations
exports.createLocation = async (req, res) => {
  try {
    const { name, province, isMajorCity } = req.body;
    const location = await Location.create({
      name,
      province,
      isMajorCity: isMajorCity || false
    });

    await logAction(req.user.id, 'CREATE_LOCATION', 'location', location._id, { name, province }, req);

    res.status(201).json({
      success: true,
      message: 'Location added successfully',
      location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating location'
    });
  }
};

// @desc    CMS - Update Location
// @route   PUT /api/admin/locations/:id
exports.updateLocation = async (req, res) => {
  try {
    const { name, province, isMajorCity, isActive } = req.body;
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    if (name) location.name = name;
    if (province) location.province = province;
    if (isMajorCity !== undefined) location.isMajorCity = isMajorCity;
    if (isActive !== undefined) location.isActive = isActive;

    await location.save();
    await logAction(req.user.id, 'UPDATE_LOCATION', 'location', location._id, { name: location.name }, req);

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating location'
    });
  }
};

// @desc    CMS - Delete Location
// @route   DELETE /api/admin/locations/:id
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    await logAction(req.user.id, 'DELETE_LOCATION', 'location', req.params.id, { name: location.name }, req);

    res.status(200).json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting location'
    });
  }
};

// @desc    Update System Configuration
// @route   PUT /api/admin/system-config
exports.updateSystemConfig = async (req, res) => {
  try {
    const { trialDurationDays, paymentInstructions, platformNotice, supportEmail, supportPhone } = req.body;
    let config = await SystemConfig.findOne();

    if (!config) {
      config = new SystemConfig();
    }

    if (trialDurationDays !== undefined) config.trialDurationDays = Number(trialDurationDays);
    if (paymentInstructions) config.paymentInstructions = { ...config.paymentInstructions, ...paymentInstructions };
    if (platformNotice !== undefined) config.platformNotice = platformNotice;
    if (supportEmail !== undefined) config.supportEmail = supportEmail;
    if (supportPhone !== undefined) config.supportPhone = supportPhone;

    await config.save();
    await logAction(req.user.id, 'UPDATE_SYSTEM_CONFIG', 'system_config', config._id, { trialDurationDays: config.trialDurationDays }, req);

    res.status(200).json({
      success: true,
      message: 'System configuration saved successfully',
      config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating system config'
    });
  }
};

const Page = require('../models/Page');

// @desc    Update CMS Page Content (Admin)
// @route   PUT /api/admin/pages/:slug
exports.updatePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, subtitle, content, metaDescription, contactDetails, aboutDetails } = req.body;

    let page = await Page.findOne({ slug });
    if (!page) {
      page = new Page({ slug, title: title || slug, content: content || '' });
    }

    if (title !== undefined) page.title = title;
    if (subtitle !== undefined) page.subtitle = subtitle;
    if (content !== undefined) page.content = content;
    if (metaDescription !== undefined) page.metaDescription = metaDescription;
    if (contactDetails) page.contactDetails = { ...page.contactDetails, ...contactDetails };
    if (aboutDetails) page.aboutDetails = { ...page.aboutDetails, ...aboutDetails };
    page.lastUpdatedBy = req.user._id || req.user.id;

    await page.save();
    await logAction(req.user.id, 'UPDATE_CMS_PAGE', 'page', page._id, { slug, title: page.title }, req);

    res.status(200).json({
      success: true,
      message: `${page.title} updated successfully!`,
      page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating CMS page'
    });
  }
};
