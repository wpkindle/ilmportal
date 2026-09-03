const Deal = require('../models/Deal');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const SystemConfig = require('../models/SystemConfig');

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
      .populate('student', 'name email phone avatar city')
      .populate('tutor', 'name email phone avatar city')
      .sort({ createdAt: -1 });

    // Check if any trial deals have expired without payment
    const now = new Date();
    for (const deal of deals) {
      if (deal.status === 'active_trial' && deal.trialEndDate && new Date(deal.trialEndDate) < now) {
        if (deal.paymentStatus !== 'verified') {
          deal.status = 'trial_expired';
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
