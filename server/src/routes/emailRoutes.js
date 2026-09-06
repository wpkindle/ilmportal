const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const EmailThread = require('../models/EmailThread');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { sendEmail, getInboundEmail } = require('../services/resendService');

// Helper to sanitize subject lines for threading (remove Re:, Fwd:)
const cleanSubject = (subject = '') => {
  return subject.replace(/^(re|fwd|fw):\s*/i, '').trim();
};

// Helper to determine category from content
const detectCategory = (subject = '', text = '') => {
  const content = `${subject} ${text}`.toLowerCase();
  if (content.includes('sanad') || content.includes('certificate') || content.includes('ijazah')) {
    return 'sanad_verification';
  }
  if (content.includes('tutor') || content.includes('teaching') || content.includes('faculty') || content.includes('qari')) {
    return 'tutor_inquiry';
  }
  if (content.includes('admission') || content.includes('enroll') || content.includes('student') || content.includes('course')) {
    return 'student_admission';
  }
  if (content.includes('fee') || content.includes('payment') || content.includes('refund') || content.includes('price')) {
    return 'billing';
  }
  return 'general';
};

// ==========================================
// 1. PUBLIC INBOUND WEBHOOK (For Resend)
// ==========================================
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    console.log('📥 [EMAIL WEBHOOK RECEIVED]:', JSON.stringify(payload).slice(0, 300));

    let emailData = payload;

    // Handle Resend standard webhook structure: { type: 'email.received', data: { email_id, from, to, subject } }
    if (payload.type === 'email.received' && payload.data?.email_id) {
      const fullEmail = await getInboundEmail(payload.data.email_id);
      if (fullEmail) {
        emailData = {
          messageId: payload.data.email_id,
          from: fullEmail.from || payload.data.from,
          to: fullEmail.to || payload.data.to,
          subject: fullEmail.subject || payload.data.subject,
          text: fullEmail.text || '',
          html: fullEmail.html || '',
          attachments: fullEmail.attachments || []
        };
      }
    }

    const rawFrom = emailData.from || '';
    const rawTo = emailData.to || 'info@ilmidunya.com';
    const subject = emailData.subject || '(No Subject)';
    const text = emailData.text || '';
    const html = emailData.html || '';

    // Extract email and name
    let senderAddress = '';
    let senderName = '';
    if (typeof rawFrom === 'string') {
      const match = rawFrom.match(/(.*)<(.*)>/);
      if (match) {
        senderName = match[1].trim().replace(/^["']|["']$/g, '');
        senderAddress = match[2].trim().toLowerCase();
      } else {
        senderAddress = rawFrom.trim().toLowerCase();
        senderName = senderAddress.split('@')[0];
      }
    } else if (typeof rawFrom === 'object') {
      senderAddress = (rawFrom.address || rawFrom.email || '').trim().toLowerCase();
      senderName = rawFrom.name || senderAddress.split('@')[0];
    }

    if (!senderAddress) {
      return res.status(400).json({ success: false, message: 'Invalid sender email address' });
    }

    // Check if sender is a registered user in LMS
    const matchedUser = await User.findOne({ email: senderAddress }).select('name role avatar phone city');
    const userRole = matchedUser ? matchedUser.role : 'guest';
    const userRef = matchedUser ? matchedUser._id : null;

    // Find existing thread with matching sender and normalized subject
    const normalizedSub = cleanSubject(subject);
    let thread = await EmailThread.findOne({
      'from.address': senderAddress,
      status: { $ne: 'archived' },
      $or: [
        { subject: new RegExp(normalizedSub.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        { lastMessageAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Within last 7 days
      ]
    });

    const newMessageItem = {
      messageId: emailData.messageId || `in_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      direction: 'inbound',
      from: { name: senderName, address: senderAddress },
      to: [{ name: 'IlmiDunya Support', address: 'info@ilmidunya.com' }],
      subject,
      text,
      html,
      attachments: emailData.attachments || [],
      createdAt: new Date()
    };

    const snippet = (text || subject || '').slice(0, 160).replace(/\s+/g, ' ');

    if (thread) {
      thread.messages.push(newMessageItem);
      thread.status = 'unread';
      thread.lastMessageSnippet = snippet;
      thread.lastMessageAt = new Date();
      if (!thread.userRef && userRef) {
        thread.userRef = userRef;
        thread.userRole = userRole;
      }
      await thread.save();
    } else {
      thread = await EmailThread.create({
        threadId: `th_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        subject,
        from: { name: senderName, address: senderAddress },
        to: [{ name: 'IlmiDunya Support', address: 'info@ilmidunya.com' }],
        status: 'unread',
        category: detectCategory(subject, text),
        userRef,
        userRole,
        messages: [newMessageItem],
        lastMessageSnippet: snippet,
        lastMessageAt: new Date()
      });
    }

    // Emit live socket event to connected admin dashboards
    const io = req.app.get('io');
    if (io) {
      io.emit('email-received', {
        threadId: thread.threadId,
        from: thread.from,
        subject: thread.subject,
        snippet: thread.lastMessageSnippet,
        category: thread.category,
        userRole: thread.userRole
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inbound email processed and saved',
      threadId: thread.threadId
    });
  } catch (error) {
    console.error('❌ [EMAIL WEBHOOK ERROR]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. ADMIN AUTHENTICATED ROUTES
// ==========================================
router.use(protect);
router.use(authorize('admin'));

// GET /api/emails/counts - Fast counts for sidebar badges
router.get('/counts', async (req, res) => {
  try {
    const unread = await EmailThread.countDocuments({ status: 'unread' });
    const total = await EmailThread.countDocuments();
    const tutors = await EmailThread.countDocuments({ userRole: 'tutor' });
    const students = await EmailThread.countDocuments({ userRole: 'student' });

    res.status(200).json({
      success: true,
      counts: { unread, total, tutors, students }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/emails/threads - List threads with filters and pagination
router.get('/threads', async (req, res) => {
  try {
    const { status, category, role, search, page = 1, limit = 25 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (role && role !== 'all') {
      query.userRole = role;
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { subject: regex },
        { 'from.address': regex },
        { 'from.name': regex },
        { lastMessageSnippet: regex }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [threads, totalCount, unreadCount] = await Promise.all([
      EmailThread.find(query)
        .populate('userRef', 'name email avatar role phone city')
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limitNum),
      EmailThread.countDocuments(query),
      EmailThread.countDocuments({ status: 'unread' })
    ]);

    res.status(200).json({
      success: true,
      threads,
      totalCount,
      unreadCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum) || 1
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/emails/threads/:id - Get full single thread
router.get('/threads/:id', async (req, res) => {
  try {
    const thread = await EmailThread.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { threadId: req.params.id }]
    }).populate('userRef', 'name email avatar role phone city cnicVerified rating totalReviews');

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Email thread not found' });
    }

    // Auto mark as read if it was unread
    if (thread.status === 'unread') {
      thread.status = 'read';
      await thread.save();
    }

    res.status(200).json({
      success: true,
      thread
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/emails/threads/:id/reply - Send reply via Resend and append to thread
router.post('/threads/:id/reply', async (req, res) => {
  try {
    const { text, html } = req.body;
    if (!text && !html) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty' });
    }

    const thread = await EmailThread.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { threadId: req.params.id }]
    });

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Email thread not found' });
    }

    const recipientAddress = thread.from.address;
    const replySubject = thread.subject.startsWith('Re:') ? thread.subject : `Re: ${thread.subject}`;

    // Send email using Resend
    const sendResult = await sendEmail({
      to: recipientAddress,
      subject: replySubject,
      text: text || '',
      html: html || `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">${(text || '').replace(/\n/g, '<br/>')}</div>`,
      from: 'IlmiDunya Pakistan <info@ilmidunya.com>',
      replyTo: 'info@ilmidunya.com'
    });

    const replyMessage = {
      messageId: sendResult.id || `out_${Date.now()}`,
      direction: 'outbound',
      from: { name: 'IlmiDunya Admin', address: 'info@ilmidunya.com' },
      to: [{ name: thread.from.name || recipientAddress, address: recipientAddress }],
      subject: replySubject,
      text: text || '',
      html: html || text,
      sentBy: req.user._id,
      createdAt: new Date()
    };

    thread.messages.push(replyMessage);
    thread.status = 'replied';
    thread.lastMessageSnippet = (text || replySubject).slice(0, 160);
    thread.lastMessageAt = new Date();
    await thread.save();

    res.status(200).json({
      success: true,
      message: 'Reply delivered successfully from info@ilmidunya.com',
      thread
    });
  } catch (error) {
    console.error('❌ [REPLY ERROR]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send reply' });
  }
});

// POST /api/emails/compose - Send a fresh new email from info@ilmidunya.com
router.post('/compose', async (req, res) => {
  try {
    const { to, subject, text, html, category = 'general' } = req.body;

    if (!to || !to.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Subject line is required' });
    }
    if (!text && !html) {
      return res.status(400).json({ success: false, message: 'Email body cannot be empty' });
    }

    const recipientAddress = to.trim().toLowerCase();

    // Check if recipient is a registered LMS user
    const matchedUser = await User.findOne({ email: recipientAddress }).select('name role avatar phone city');
    const userRole = matchedUser ? matchedUser.role : 'guest';
    const userRef = matchedUser ? matchedUser._id : null;

    // Send email using Resend
    const sendResult = await sendEmail({
      to: recipientAddress,
      subject: subject.trim(),
      text: text || '',
      html: html || `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">${(text || '').replace(/\n/g, '<br/>')}</div>`,
      from: 'IlmiDunya Pakistan <info@ilmidunya.com>',
      replyTo: 'info@ilmidunya.com'
    });

    const newThread = await EmailThread.create({
      threadId: `th_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      subject: subject.trim(),
      from: { name: 'IlmiDunya Admin', address: 'info@ilmidunya.com' },
      to: [{ name: matchedUser?.name || recipientAddress, address: recipientAddress }],
      status: 'replied',
      category,
      userRef,
      userRole,
      messages: [{
        messageId: sendResult.id || `out_${Date.now()}`,
        direction: 'outbound',
        from: { name: 'IlmiDunya Admin', address: 'info@ilmidunya.com' },
        to: [{ name: matchedUser?.name || recipientAddress, address: recipientAddress }],
        subject: subject.trim(),
        text: text || '',
        html: html || text,
        sentBy: req.user._id,
        createdAt: new Date()
      }],
      lastMessageSnippet: (text || subject).slice(0, 160),
      lastMessageAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Email successfully sent from info@ilmidunya.com',
      thread: newThread
    });
  } catch (error) {
    console.error('❌ [COMPOSE ERROR]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to compose and send email' });
  }
});

// PATCH /api/emails/threads/:id/status - Update status, star, or category
router.patch('/threads/:id/status', async (req, res) => {
  try {
    const { status, isStarred, category, priority } = req.body;

    const thread = await EmailThread.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { threadId: req.params.id }]
    });

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Email thread not found' });
    }

    if (status !== undefined) thread.status = status;
    if (isStarred !== undefined) thread.isStarred = Boolean(isStarred);
    if (category !== undefined) thread.category = category;
    if (priority !== undefined) thread.priority = priority;

    await thread.save();

    res.status(200).json({
      success: true,
      message: 'Thread status updated',
      thread
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/emails/threads/:id - Archive or delete thread
router.delete('/threads/:id', async (req, res) => {
  try {
    const thread = await EmailThread.findOneAndDelete({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { threadId: req.params.id }]
    });

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Thread deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/emails/seed-demo - Initialize sample inquiries for instant testing
router.post('/seed-demo', async (req, res) => {
  try {
    const existing = await EmailThread.countDocuments();
    if (existing > 0) {
      return res.status(200).json({ success: true, message: 'Inbox already contains data', count: existing });
    }

    const demoThreads = [
      {
        threadId: `th_demo_sanad_1`,
        subject: 'Sanad Verification & Degree Submission - Qari Huzaifa',
        from: { name: 'Qari Huzaifa Tariq', address: 'qari.huzaifa@example.com' },
        to: [{ name: 'IlmiDunya Faculty Support', address: 'info@ilmidunya.com' }],
        status: 'unread',
        category: 'sanad_verification',
        priority: 'high',
        isStarred: true,
        userRole: 'tutor',
        lastMessageSnippet: 'Assalam-o-Alaikum, I have registered as a Quran Tajweed tutor and attached my Wifaq ul Madaris Sanad for verification.',
        messages: [{
          messageId: 'msg_demo_1',
          direction: 'inbound',
          from: { name: 'Qari Huzaifa Tariq', address: 'qari.huzaifa@example.com' },
          to: [{ name: 'IlmiDunya Support', address: 'info@ilmidunya.com' }],
          subject: 'Sanad Verification & Degree Submission - Qari Huzaifa',
          text: 'Assalam-o-Alaikum,\n\nI have registered as a Quran Tajweed tutor on the platform. Attached is my Shahadat-ul-Alimiyya certificate issued by Wifaq ul Madaris Pakistan. Kindly verify my profile so I can start offering free demo classes to students.\n\nJazakAllah Khair,\nQari Huzaifa Tariq\nLahore, Pakistan',
          createdAt: new Date(Date.now() - 3600000 * 2)
        }]
      },
      {
        threadId: `th_demo_admission_2`,
        subject: 'Admission Inquiry: Female Alimah Tutor for 8-Year Old Daughter',
        from: { name: 'Mrs. Zainab Farooq', address: 'zainab.farooq.lhr@gmail.com' },
        to: [{ name: 'IlmiDunya Admissions', address: 'info@ilmidunya.com' }],
        status: 'unread',
        category: 'student_admission',
        priority: 'normal',
        isStarred: false,
        userRole: 'student',
        lastMessageSnippet: 'Hello, I want to enroll my daughter in Noorani Qaida and basic Nazra. Can we get a certified female teacher in Lahore?',
        messages: [{
          messageId: 'msg_demo_2',
          direction: 'inbound',
          from: { name: 'Mrs. Zainab Farooq', address: 'zainab.farooq.lhr@gmail.com' },
          to: [{ name: 'IlmiDunya Admissions', address: 'info@ilmidunya.com' }],
          subject: 'Admission Inquiry: Female Alimah Tutor for 8-Year Old Daughter',
          text: 'Respected Team,\n\nI want to enroll my 8-year-old daughter in Noorani Qaida and basic Nazra. We strictly require a certified female Alimah with camera-off privacy mode enabled. Could you please share the demo booking process?\n\nRegards,\nMrs. Zainab Farooq',
          createdAt: new Date(Date.now() - 3600000 * 5)
        }]
      },
      {
        threadId: `th_demo_academic_3`,
        subject: 'Cambridge O-Level Physics & Additional Maths Tutor',
        from: { name: 'Hamza Bilal', address: 'hamza.bilal.isb@gmail.com' },
        to: [{ name: 'IlmiDunya Support', address: 'info@ilmidunya.com' }],
        status: 'replied',
        category: 'tutor_inquiry',
        priority: 'normal',
        isStarred: false,
        userRole: 'guest',
        lastMessageSnippet: 'Thank you for connecting me with Sir Usman for Cambridge Physics.',
        messages: [
          {
            messageId: 'msg_demo_3a',
            direction: 'inbound',
            from: { name: 'Hamza Bilal', address: 'hamza.bilal.isb@gmail.com' },
            to: [{ name: 'IlmiDunya Support', address: 'info@ilmidunya.com' }],
            subject: 'Cambridge O-Level Physics & Additional Maths Tutor',
            text: 'Salam, looking for an experienced Cambridge O-Level Physics tutor for May/June series exam preparation in Islamabad.',
            createdAt: new Date(Date.now() - 3600000 * 24)
          },
          {
            messageId: 'msg_demo_3b',
            direction: 'outbound',
            from: { name: 'IlmiDunya Faculty Support', address: 'info@ilmidunya.com' },
            to: [{ name: 'Hamza Bilal', address: 'hamza.bilal.isb@gmail.com' }],
            subject: 'Re: Cambridge O-Level Physics & Additional Maths Tutor',
            text: 'Wa Alaikum Assalam Hamza,\n\nWe have verified Cambridge educators available in Islamabad and online via our WebRTC classroom. You can book a free 30-minute demo session directly from our tutors directory.\n\nWarm regards,\nIlmiDunya Academic Faculty Team',
            createdAt: new Date(Date.now() - 3600000 * 18)
          }
        ]
      }
    ];

    await EmailThread.insertMany(demoThreads);

    res.status(201).json({
      success: true,
      message: 'Demo inquiries initialized',
      count: demoThreads.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
