const PaymentRequest = require('../models/PaymentRequest');
const Deal = require('../models/Deal');
const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

/**
 * Helper: check if a payment request is past 3-day threshold and mark deal restricted if not cleared
 */
const evaluatePaymentOverdue = async (deal) => {
  if (!deal) return null;
  const activeRequest = await PaymentRequest.findOne({
    deal: deal._id,
    status: { $in: ['pending', 'proof_submitted'] }
  }).sort({ createdAt: -1 });

  if (activeRequest) {
    const isOverdue = new Date(activeRequest.dueDate).getTime() < Date.now();
    if (isOverdue) {
      activeRequest.status = 'overdue';
      activeRequest.isClassRestricted = true;
      await activeRequest.save();

      deal.accessRestricted = true;
      deal.hasOverduePayment = true;
      deal.overduePaymentThresholdAt = activeRequest.dueDate;
      await deal.save();
    }
  }
  return deal;
};

exports.evaluatePaymentOverdue = evaluatePaymentOverdue;

// @desc    Tutor sends tuition fee payment request to student (3-day threshold)
// @route   POST /api/payment-requests
exports.createPaymentRequest = async (req, res) => {
  try {
    const { dealId, amount, title, description } = req.body;

    if (!dealId) {
      return res.status(400).json({ success: false, message: 'Deal ID is required' });
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid tuition fee amount in PKR is required' });
    }

    const deal = await Deal.findById(dealId).populate('student', 'name email avatar').populate('tutor', 'name email avatar');
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    const tutorId = deal.tutor?._id ? deal.tutor._id.toString() : deal.tutor?.toString();
    const studentId = deal.student?._id ? deal.student._id.toString() : deal.student?.toString();

    if (!tutorId || !studentId) {
      return res.status(400).json({ success: false, message: 'Deal participants are invalid or missing' });
    }

    // Verify requesting user is the tutor on this deal
    if (tutorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the tutor can request tuition fees for this deal' });
    }

    // Verify tutor has at least 1 payment method configured
    const tutorProfile = await TutorProfile.findOne({ user: req.user.id });
    const paymentMethods = tutorProfile?.paymentMethods || [];

    if (!paymentMethods || paymentMethods.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You must add at least one payment method (Bank, Raast, EasyPaisa, JazzCash, or UPaisa) in your profile settings before sending payment requests.'
      });
    }

    // 3 Days (72 hours) threshold
    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const paymentRequest = new PaymentRequest({
      deal: deal._id,
      tutor: tutorId,
      student: studentId,
      amount: numericAmount,
      title: (title || 'Monthly Tuition Fee').trim(),
      description: (description || '').trim(),
      paymentMethods: paymentMethods.map(pm => ({
        method: pm.method,
        bankName: pm.bankName || '',
        accountTitle: pm.accountTitle || '',
        accountNumber: pm.accountNumber || '',
        instructions: pm.instructions || '',
        isDefault: Boolean(pm.isDefault)
      })),
      dueDate,
      status: 'pending'
    });

    await paymentRequest.save();

    deal.latestPaymentRequest = paymentRequest._id;
    await deal.save();

    // Create In-App Notification for Student
    try {
      await Notification.create({
        recipient: studentId,
        sender: req.user.id,
        type: 'payment_pending',
        title: 'Tuition Fee Payment Requested',
        message: `${req.user.name} has requested tuition fee of PKR ${numericAmount.toLocaleString()}. You have 3 days (72 hours) to pay before classes are restricted.`,
        link: '/student/deals'
      });
    } catch (nErr) {
      console.error('Notification error:', nErr);
    }

    // Send Chat Message if conversation exists
    try {
      const convId = [req.user.id.toString(), studentId].sort().join('_');
      await Message.create({
        conversationId: convId,
        sender: req.user.id,
        recipient: studentId,
        deal: deal._id,
        text: `💳 Tuition Fee Payment Request: PKR ${numericAmount.toLocaleString()} (${paymentRequest.title})\n\n⏰ 3-Day Payment Threshold: Please transfer via Bank / Raast / EasyPaisa / JazzCash / UPaisa and submit transaction proof within 3 days to avoid classroom restriction.`,
        messageType: 'text'
      });
    } catch (mErr) {
      console.error('Message creation error:', mErr);
    }

    res.status(201).json({
      success: true,
      message: 'Payment request sent successfully with a 3-day payment threshold!',
      paymentRequest
    });
  } catch (error) {
    console.error('createPaymentRequest error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating payment request'
    });
  }
};

// @desc    Get all payment requests for a deal
// @route   GET /api/payment-requests/deal/:dealId
exports.getPaymentRequestsByDeal = async (req, res) => {
  try {
    const { dealId } = req.params;
    const deal = await Deal.findById(dealId);

    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    // Check authorization
    const isParticipant =
      deal.student.toString() === req.user.id ||
      deal.tutor.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to view payment requests for this deal' });
    }

    // Evaluate 3-day threshold
    await evaluatePaymentOverdue(deal);

    const paymentRequests = await PaymentRequest.find({ deal: dealId })
      .sort({ createdAt: -1 })
      .populate('tutor', 'name email avatar')
      .populate('student', 'name email avatar');

    res.status(200).json({
      success: true,
      paymentRequests,
      dealRestricted: Boolean(deal.accessRestricted || deal.hasOverduePayment)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payment requests'
    });
  }
};

// @desc    Get payment request by ID
// @route   GET /api/payment-requests/:id
exports.getPaymentRequestById = async (req, res) => {
  try {
    const paymentRequest = await PaymentRequest.findById(req.params.id)
      .populate('tutor', 'name email avatar')
      .populate('student', 'name email avatar')
      .populate('deal');

    if (!paymentRequest) {
      return res.status(404).json({ success: false, message: 'Payment request not found' });
    }

    // Check authorization
    const isParticipant =
      paymentRequest.student._id.toString() === req.user.id ||
      paymentRequest.tutor._id.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check 3-day threshold
    if (['pending', 'proof_submitted'].includes(paymentRequest.status) && new Date(paymentRequest.dueDate).getTime() < Date.now()) {
      paymentRequest.status = 'overdue';
      paymentRequest.isClassRestricted = true;
      await paymentRequest.save();

      await Deal.findByIdAndUpdate(paymentRequest.deal._id, {
        accessRestricted: true,
        hasOverduePayment: true,
        overduePaymentThresholdAt: paymentRequest.dueDate
      });
    }

    res.status(200).json({
      success: true,
      paymentRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payment request'
    });
  }
};

// @desc    Student submits payment proof
// @route   POST /api/payment-requests/:id/proof
exports.submitPaymentProof = async (req, res) => {
  try {
    const { method, transactionId, senderAccountTitle, proofImageUrl, notes } = req.body;
    const paymentRequest = await PaymentRequest.findById(req.params.id)
      .populate('student', 'name email')
      .populate('tutor', 'name email');

    if (!paymentRequest) {
      return res.status(404).json({ success: false, message: 'Payment request not found' });
    }

    if (paymentRequest.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the student can submit payment proof for this request' });
    }

    if (paymentRequest.status === 'cleared') {
      return res.status(400).json({ success: false, message: 'Payment for this request has already been cleared' });
    }

    if (!transactionId?.trim() && !proofImageUrl?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a Transaction Reference ID or proof receipt screenshot'
      });
    }

    paymentRequest.paymentProof = {
      method: (method || '').trim(),
      transactionId: (transactionId || '').trim(),
      senderAccountTitle: (senderAccountTitle || '').trim(),
      proofImageUrl: (proofImageUrl || '').trim(),
      notes: (notes || '').trim(),
      submittedAt: new Date()
    };
    paymentRequest.status = 'proof_submitted';

    await paymentRequest.save();

    // Notify tutor
    try {
      await Notification.create({
        recipient: paymentRequest.tutor._id,
        sender: req.user.id,
        type: 'payment_pending',
        title: 'Tuition Payment Proof Submitted',
        message: `${req.user.name} has submitted payment proof for PKR ${paymentRequest.amount.toLocaleString()}. Please review and clear payment.`,
        link: '/tutor/deals'
      });
    } catch (nErr) {
      console.error('Notification error:', nErr);
    }

    res.status(200).json({
      success: true,
      message: 'Payment proof submitted successfully! Your tutor will verify and clear it.',
      paymentRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting payment proof'
    });
  }
};

// @desc    Tutor clears / approves payment received (lifts classroom restriction)
// @route   POST /api/payment-requests/:id/clear
exports.clearPaymentRequest = async (req, res) => {
  try {
    const { clearanceNotes } = req.body;
    const paymentRequest = await PaymentRequest.findById(req.params.id)
      .populate('deal')
      .populate('student', 'name email');

    if (!paymentRequest) {
      return res.status(404).json({ success: false, message: 'Payment request not found' });
    }

    if (paymentRequest.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the tutor can clear payment for this request' });
    }

    if (paymentRequest.status === 'cleared') {
      return res.status(400).json({ success: false, message: 'Payment has already been cleared' });
    }

    paymentRequest.status = 'cleared';
    paymentRequest.clearedAt = new Date();
    paymentRequest.clearedBy = req.user.id;
    paymentRequest.clearanceNotes = (clearanceNotes || '').trim();
    paymentRequest.isClassRestricted = false;
    await paymentRequest.save();

    // Unlock deal & classroom sessions
    const deal = await Deal.findById(paymentRequest.deal._id);
    if (deal) {
      deal.accessRestricted = false;
      deal.hasOverduePayment = false;
      deal.overduePaymentThresholdAt = null;
      if (['active_trial', 'continuation_agreed'].includes(deal.status)) {
        deal.status = 'active_paid';
      }
      await deal.save();
    }

    // Notify student
    try {
      await Notification.create({
        recipient: paymentRequest.student._id,
        sender: req.user.id,
        type: 'payment_verified',
        title: 'Tuition Payment Cleared',
        message: `Your payment of PKR ${paymentRequest.amount.toLocaleString()} has been verified and cleared by your tutor. All classes are active and unlocked!`,
        link: '/student/deals'
      });
    } catch (nErr) {
      console.error('Notification error:', nErr);
    }

    // Send confirmation in chat
    try {
      const convId = [req.user.id.toString(), paymentRequest.student._id.toString()].sort().join('_');
      await Message.create({
        conversationId: convId,
        sender: req.user.id,
        recipient: paymentRequest.student._id,
        deal: paymentRequest.deal._id,
        text: `✅ Payment Cleared: Tuition fee payment of PKR ${paymentRequest.amount.toLocaleString()} has been verified and cleared. Classes are fully unlocked!`,
        messageType: 'text'
      });
    } catch (mErr) {
      console.error('Message creation error:', mErr);
    }

    res.status(200).json({
      success: true,
      message: 'Payment marked as cleared! Classroom access is fully unlocked.',
      paymentRequest,
      deal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error clearing payment request'
    });
  }
};

// @desc    Cancel payment request
// @route   POST /api/payment-requests/:id/cancel
exports.cancelPaymentRequest = async (req, res) => {
  try {
    const paymentRequest = await PaymentRequest.findById(req.params.id);
    if (!paymentRequest) {
      return res.status(404).json({ success: false, message: 'Payment request not found' });
    }

    if (paymentRequest.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
    }

    paymentRequest.status = 'cancelled';
    paymentRequest.isClassRestricted = false;
    await paymentRequest.save();

    // Check if deal has other overdue requests, else lift restriction
    const deal = await Deal.findById(paymentRequest.deal);
    if (deal) {
      const remainingOverdue = await PaymentRequest.findOne({
        deal: deal._id,
        status: 'overdue'
      });
      if (!remainingOverdue) {
        deal.accessRestricted = false;
        deal.hasOverduePayment = false;
        await deal.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment request cancelled successfully',
      paymentRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error cancelling payment request'
    });
  }
};

