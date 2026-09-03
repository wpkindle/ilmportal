const Deal = require('../models/Deal');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const SystemConfig = require('../models/SystemConfig');
const {
  sendTrialContinuationTutorEmail,
  sendTutorFeeClearedEmail
} = require('../utils/emailService');

// @desc    Tutor sends a deal offer to student
// @route   POST /api/deals/offer
exports.createDealOffer = async (req, res) => {
  try {
    const { studentId, subject, price, priceUnit, scheduleDetails, mode, notes } = req.body;

    if (!studentId || !subject || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide student, subject, and price for the deal offer'
      });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Target student not found'
      });
    }

    const deal = await Deal.create({
      student: student._id,
      tutor: req.user.id,
      subject,
      price: Number(price),
      priceUnit: priceUnit || 'per_month',
      scheduleDetails: scheduleDetails || '3 sessions per week (1 hr each)',
      mode: mode || 'online',
      status: 'pending_offer'
    });

    // Create a structured chat message for this deal offer
    const conversationId = [req.user.id.toString(), student._id.toString()].sort().join('_');
    const offerMessage = await Message.create({
      conversationId,
      sender: req.user.id,
      recipient: student._id,
      deal: deal._id,
      messageType: 'deal_offer',
      text: `Deal Offer: ${subject} - PKR ${price} / ${priceUnit === 'per_hour' ? 'hr' : priceUnit === 'total' ? 'course' : 'month'} (${mode === 'online' ? 'Online WebRTC Video' : 'In-Person'})`,
      dealOfferData: {
        _id: deal._id,
        dealId: deal._id,
        subject,
        price: Number(price),
        priceUnit: priceUnit || 'per_month',
        schedule: scheduleDetails,
        scheduleDetails: scheduleDetails,
        mode: mode || 'online',
        status: 'pending_offer',
        student: student._id,
        tutor: req.user.id,
        notes: notes || ''
      }
    });

    const populatedOfferMsg = await Message.findById(offerMessage._id)
      .populate('sender', 'name avatar role city')
      .populate('recipient', 'name avatar role city')
      .populate('deal');

    // Real-time broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`conv_${conversationId}`).emit('new-message', populatedOfferMsg);
      io.to(`user_${student._id}`).emit('notification-alert', {
        title: 'New Course Offer Received',
        message: `${req.user.name} sent you a tutoring offer for ${subject} (PKR ${price} / ${priceUnit}).`,
        type: 'deal_offer',
        conversationId
      });
    }

    // In-app notification for the student
    await Notification.create({
      recipient: student._id,
      sender: req.user.id,
      title: 'New Tutoring Deal Offer Received',
      message: `${req.user.name} sent you an offer for ${subject} (PKR ${price} ${priceUnit}).`,
      type: 'deal_offer',
      link: `/student/messages?conversation=${conversationId}`
    });

    res.status(201).json({
      success: true,
      message: 'Deal offer sent successfully!',
      deal,
      messageData: populatedOfferMsg
    });
  } catch (error) {
    console.error('Error creating deal offer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating deal offer'
    });
  }
};

// @desc    Student accepts or declines a deal offer
// @route   POST /api/deals/:id/respond
exports.respondToDealOffer = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'
    const deal = await Deal.findById(req.params.id)
      .populate('tutor', 'name email phone avatar')
      .populate('student', 'name email phone avatar');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    if (deal.student._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the student who received this offer can respond to it'
      });
    }

    if (deal.status !== 'pending_offer') {
      return res.status(400).json({
        success: false,
        message: `Deal is already in '${deal.status}' status.`
      });
    }

    const conversationId = [deal.student._id.toString(), deal.tutor._id.toString()].sort().join('_');

    if (action === 'accept') {
      // Get trial duration from config (default: 3 days)
      const config = await SystemConfig.findOne();
      const trialDays = config ? config.trialDurationDays : 3;

      const now = new Date();
      const trialEndDate = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

      deal.status = 'active_trial';
      deal.trialStartDate = now;
      deal.trialEndDate = trialEndDate;
      await deal.save();

      // Write acceptance message to chat
      const acceptMsg = await Message.create({
        conversationId,
        sender: req.user.id,
        recipient: deal.tutor._id,
        deal: deal._id,
        messageType: 'deal_accept',
        text: `Deal Accepted! Free ${trialDays}-day trial started. Both parties can now start scheduling live sessions.`,
        dealOfferData: {
          _id: deal._id,
          dealId: deal._id,
          subject: deal.subject,
          price: deal.price,
          priceUnit: deal.priceUnit,
          mode: deal.mode,
          status: 'active_trial'
        }
      });

      const populatedAcceptMsg = await Message.findById(acceptMsg._id)
        .populate('sender', 'name avatar role city')
        .populate('recipient', 'name avatar role city')
        .populate('deal');

      // Real-time broadcast via Socket
      const io = req.app.get('io');
      if (io) {
        io.to(`conv_${conversationId}`).emit('new-message', populatedAcceptMsg);
        io.to(`conv_${conversationId}`).emit('deal-status-updated', deal);
        io.to(`user_${deal.tutor._id}`).emit('notification-alert', {
          title: 'Deal Offer Accepted!',
          message: `${req.user.name} accepted your tutoring offer for ${deal.subject}.`,
          type: 'deal_accepted',
          conversationId
        });
      }

      // Notification for Tutor
      await Notification.create({
        recipient: deal.tutor._id,
        sender: req.user.id,
        title: 'Deal Offer Accepted!',
        message: `${req.user.name} accepted your tutoring offer for ${deal.subject}. Your ${trialDays}-day free trial is now active!`,
        type: 'deal_accepted',
        link: `/tutor/deals`
      });

      // Notification for Admin
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        await Notification.create({
          recipient: admin._id,
          sender: req.user.id,
          title: 'New Active Trial Deal',
          message: `Deal between Student ${deal.student.name} and Tutor ${deal.tutor.name} (${deal.subject}, PKR ${deal.price}) is now in active trial.`,
          type: 'deal_accepted',
          link: `/admin/deals`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Deal accepted! Your ${trialDays}-day free trial has started.`,
        deal
      });
    } else if (action === 'decline') {
      deal.status = 'cancelled';
      await deal.save();

      const declineMsg = await Message.create({
        conversationId,
        sender: req.user.id,
        recipient: deal.tutor._id,
        deal: deal._id,
        messageType: 'deal_decline',
        text: `Deal offer was declined by the student.`
      });

      const populatedDeclineMsg = await Message.findById(declineMsg._id)
        .populate('sender', 'name avatar role city')
        .populate('recipient', 'name avatar role city');

      const io = req.app.get('io');
      if (io) {
        io.to(`conv_${conversationId}`).emit('new-message', populatedDeclineMsg);
        io.to(`conv_${conversationId}`).emit('deal-status-updated', deal);
      }

      await Notification.create({
        recipient: deal.tutor._id,
        sender: req.user.id,
        title: 'Deal Offer Declined',
        message: `${req.user.name} declined the offer for ${deal.subject}.`,
        type: 'deal_declined',
        link: `/tutor/messages?conversation=${conversationId}`
      });

      return res.status(200).json({
        success: true,
        message: 'Deal offer declined',
        deal
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Expected 'accept' or 'decline'"
      });
    }
  } catch (error) {
    console.error('Error responding to deal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error responding to deal'
    });
  }
};

// @desc    Get Current User's Deals
// @route   GET /api/deals/my-deals
exports.getMyDeals = async (req, res) => {
  try {
    const filter = req.user.role === 'tutor' 
      ? { tutor: req.user.id } 
      : req.user.role === 'student'
      ? { student: req.user.id }
      : {};

    const deals = await Deal.find(filter)
      .populate('student', req.user.role === 'tutor' ? 'name avatar city' : 'name email phone avatar city')
      .populate('tutor', 'name email phone avatar city')
      .sort({ createdAt: -1 });

    // Check if any trial deals have expired without payment or overdue tutor fees
    const now = new Date();
    for (const deal of deals) {
      if (deal.status === 'active_trial' && deal.trialEndDate && new Date(deal.trialEndDate) < now) {
        if (deal.paymentStatus !== 'verified') {
          deal.status = 'trial_expired';
          await deal.save();
        }
      }

      // Check if tutor platform fee is overdue (> 3 days from continuation agreement)
      if (deal.status === 'continuation_agreed' && deal.tutorFeeDueDate && new Date(deal.tutorFeeDueDate) < now) {
        if (!deal.tutorFeePaid) {
          deal.accessRestricted = true;
          deal.restrictionType = 'suspend_access';
          deal.status = 'restricted';
          await deal.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      count: deals.length,
      deals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user deals'
    });
  }
};

// @desc    Get Single Deal
// @route   GET /api/deals/:id
exports.getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('student', 'name email phone avatar city')
      .populate('tutor', 'name email phone avatar city');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      deal.student._id.toString() !== req.user.id.toString() &&
      deal.tutor._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this deal'
      });
    }

    res.status(200).json({
      success: true,
      deal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching deal'
    });
  }
};

// @desc    Submit Manual Payment Proof (JazzCash / EasyPaisa / Bank Transfer TID)
// @route   POST /api/deals/:id/submit-payment
exports.submitPaymentProof = async (req, res) => {
  try {
    const { paymentMethod, referenceCode, notes } = req.body;

    if (!referenceCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the transaction ID (TID) / reference code of your payment.'
      });
    }

    const deal = await Deal.findById(req.params.id)
      .populate('student', 'name email')
      .populate('tutor', 'name email');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    deal.paymentStatus = 'submitted_proof';
    deal.paymentMethod = paymentMethod || 'jazzcash';
    deal.paymentProofReference = referenceCode.trim();
    deal.paymentProofNotes = notes || '';
    await deal.save();

    // Notify Admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await Notification.create({
        recipient: admin._id,
        sender: req.user.id,
        title: 'New Payment Verification Pending',
        message: `${deal.student.name} submitted ${deal.paymentMethod.toUpperCase()} payment proof (TID: ${referenceCode}) for deal ${deal.subject} (PKR ${deal.price}).`,
        type: 'payment_pending',
        link: `/admin/deals`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment proof submitted successfully! Admin will verify and mark your deal as Active Paid.',
      deal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting payment proof'
    });
  }
};

// @desc    Cancel Deal
// @route   PUT /api/deals/:id/cancel
exports.cancelDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    if (
      req.user.role !== 'admin' &&
      deal.student.toString() !== req.user.id.toString() &&
      deal.tutor.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this deal'
      });
    }

    deal.status = 'cancelled';
    await deal.save();

    res.status(200).json({
      success: true,
      message: 'Deal cancelled successfully',
      deal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error cancelling deal'
    });
  }
};

// @desc    Student decides to continue or decline classes during trial period
// @route   POST /api/deals/:id/trial-decision
exports.respondToTrialContinuation = async (req, res) => {
  try {
    const { decision, reason } = req.body; // 'continue' or 'decline'
    const deal = await Deal.findById(req.params.id)
      .populate('tutor', 'name email phone avatar')
      .populate('student', 'name email phone avatar');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    if (deal.student._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the enrolled student can make the trial continuation decision.'
      });
    }

    if (deal.status !== 'active_trial') {
      return res.status(400).json({
        success: false,
        message: `Continuation decision can only be made during active trial (current status: ${deal.status}).`
      });
    }

    const conversationId = [deal.student._id.toString(), deal.tutor._id.toString()].sort().join('_');
    const io = req.app.get('io');

    if (decision === 'continue') {
      const now = new Date();
      const feeDueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3-day deadline!

      deal.status = 'continuation_agreed';
      deal.continuationAgreed = true;
      deal.continuationAgreedAt = now;
      deal.tutorFeeDueDate = feeDueDate;
      deal.tutorFeePaid = false;
      await deal.save();

      const dueDateStr = feeDueDate.toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      // Post structured announcement into chat
      const msg = await Message.create({
        conversationId,
        sender: req.user.id,
        recipient: deal.tutor._id,
        deal: deal._id,
        messageType: 'continuation_agreed',
        text: `🎉 The student has agreed to continue regular tutoring with ${deal.tutor.name}! Tutor platform fee clearance is active (3-day clearance window until ${dueDateStr}).`
      });

      const populatedMsg = await Message.findById(msg._id)
        .populate('sender', 'name avatar role city')
        .populate('recipient', 'name avatar role city')
        .populate('deal');

      if (io) {
        io.to(`conv_${conversationId}`).emit('new-message', populatedMsg);
        io.to(`conv_${conversationId}`).emit('deal-status-updated', deal);
        io.to(`user_${deal.tutor._id}`).emit('notification-alert', {
          title: 'Student Agreed to Continue Classes!',
          message: `${req.user.name} wants to continue classes for ${deal.subject}. Please clear platform fee within 3 days (by ${dueDateStr}).`,
          type: 'continuation_agreed',
          conversationId
        });
      }

      // Notify Tutor via In-App Notification
      await Notification.create({
        recipient: deal.tutor._id,
        sender: req.user.id,
        title: 'Student Selected to Continue Regular Classes!',
        message: `${req.user.name} agreed to continue learning ${deal.subject} with you. Please submit the platform fee within 3 days (by ${dueDateStr}) to keep classes active.`,
        type: 'continuation_agreed',
        link: `/tutor/deals`
      });

      // Notify Tutor via Email
      try {
        await sendTrialContinuationTutorEmail({
          to: deal.tutor.email,
          tutorName: deal.tutor.name,
          studentName: deal.student.name,
          subject: deal.subject,
          feeDueDate: dueDateStr,
          adminContactPhone: '0317 1759093 / 0315 4453745'
        });
      } catch (mailErr) {
        console.error('Failed to send tutor continuation email:', mailErr);
      }

      // Notify Admin
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          sender: req.user.id,
          title: 'Trial Continuation: Tutor Platform Fee Invoice Due (3 Days)',
          message: `Student ${deal.student.name} agreed to continue classes with Tutor ${deal.tutor.name} (${deal.subject}, PKR ${deal.price}). Please collect the platform fee within 3 days (due ${dueDateStr}).`,
          type: 'continuation_agreed',
          link: `/admin/deals`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'You have chosen to continue regular learning with this tutor! Admin and tutor have been notified.',
        deal
      });
    } else if (decision === 'decline') {
      deal.status = 'trial_declined';
      await deal.save();

      const declineMsg = await Message.create({
        conversationId,
        sender: req.user.id,
        recipient: deal.tutor._id,
        deal: deal._id,
        messageType: 'trial_declined',
        text: `Student decided not to continue classes after the trial period${reason ? `: "${reason}"` : '.'}`
      });

      const populatedDeclineMsg = await Message.findById(declineMsg._id)
        .populate('sender', 'name avatar role city')
        .populate('recipient', 'name avatar role city');

      if (io) {
        io.to(`conv_${conversationId}`).emit('new-message', populatedDeclineMsg);
        io.to(`conv_${conversationId}`).emit('deal-status-updated', deal);
      }

      await Notification.create({
        recipient: deal.tutor._id,
        sender: req.user.id,
        title: 'Trial Concluded',
        message: `${req.user.name} has concluded the trial period for ${deal.subject}.`,
        type: 'deal_declined',
        link: `/tutor/messages?conversation=${conversationId}`
      });

      return res.status(200).json({
        success: true,
        message: 'Trial concluded. You can browse and connect with other verified tutors anytime.',
        deal
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid decision. Expected 'continue' or 'decline'."
      });
    }
  } catch (error) {
    console.error('Error responding to trial continuation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing trial decision'
    });
  }
};

// @desc    Admin clears tutor platform fee and fully unlocks classes
// @route   POST /api/deals/:id/clear-fee
exports.adminClearTutorFee = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('tutor', 'name email phone')
      .populate('student', 'name email phone');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    deal.tutorFeePaid = true;
    deal.tutorFeeClearanceAt = new Date();
    deal.tutorFeeClearanceBy = req.user.id;
    deal.status = 'active_paid';
    deal.accessRestricted = false;
    deal.restrictionType = 'none';
    deal.paymentStatus = 'verified';
    await deal.save();

    const conversationId = [deal.student._id.toString(), deal.tutor._id.toString()].sort().join('_');
    const io = req.app.get('io');

    if (io) {
      io.to(`conv_${conversationId}`).emit('deal-status-updated', deal);
      io.to(`user_${deal.tutor._id}`).emit('notification-alert', {
        title: 'Platform Fee Cleared by Admin!',
        message: `Your payment has been cleared. Regular classes with ${deal.student.name} are fully active!`,
        type: 'fee_cleared'
      });
    }

    // In-app notification to tutor
    await Notification.create({
      recipient: deal.tutor._id,
      sender: req.user.id,
      title: 'Platform Fee Cleared - Classes Active',
      message: `Admin cleared the platform fee for student ${deal.student.name}. Your classes are fully active.`,
      type: 'deal_accepted',
      link: `/tutor/deals`
    });

    // Email to tutor
    try {
      await sendTutorFeeClearedEmail({
        to: deal.tutor.email,
        tutorName: deal.tutor.name,
        studentName: deal.student.name,
        subject: deal.subject
      });
    } catch (mailErr) {
      console.error('Failed to send tutor fee cleared email:', mailErr);
    }

    res.status(200).json({
      success: true,
      message: 'Tutor platform fee cleared successfully. Classes are unlocked!',
      deal
    });
  } catch (error) {
    console.error('Error clearing tutor fee:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error clearing tutor fee'
    });
  }
};

// @desc    Admin manually restricts tutor classes (for overdue fee)
// @route   POST /api/deals/:id/restrict-classes
exports.adminRestrictTutorClasses = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('tutor', 'name email')
      .populate('student', 'name email');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    deal.accessRestricted = true;
    deal.restrictionType = 'suspend_access';
    deal.status = 'restricted';
    await deal.save();

    const conversationId = [deal.student._id.toString(), deal.tutor._id.toString()].sort().join('_');
    const io = req.app.get('io');
    if (io) {
      io.to(`conv_${conversationId}`).emit('deal-status-updated', deal);
    }

    await Notification.create({
      recipient: deal.tutor._id,
      sender: req.user.id,
      title: 'Classroom Access Restricted (Platform Fee Overdue)',
      message: `Your classes with ${deal.student.name} have been paused pending platform fee clearance. Please contact administration.`,
      type: 'account_warning',
      link: `/tutor/deals`
    });

    res.status(200).json({
      success: true,
      message: 'Deal classes restricted successfully pending tutor fee payment.',
      deal
    });
  } catch (error) {
    console.error('Error restricting deal classes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error restricting deal classes'
    });
  }
};
