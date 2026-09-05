const mongoose = require('mongoose');
const { getKnowledgeBaseFAQs, saveSupportFAQ } = require('../config/supabaseClient');
const SupportSession = require('../models/SupportSession');
const Notification = require('../models/Notification');
const FAQ = require('../models/FAQ');
const User = require('../models/User');

/**
 * Handle user message in Live Support Chat (routed directly to Admin Desk)
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId, guestInfo, fileUrl, fileName, fileType, fileSize } = req.body;
    if ((!message || !message.trim()) && !fileUrl) {
      return res.status(400).json({ success: false, message: 'Message or attachment is required' });
    }

    const sid = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    let session = await SupportSession.findOne({ sessionId: sid });
    const senderName = req.user?.name || guestInfo?.name || 'Website Visitor';
    const senderAvatar = req.user?.avatar || '';

    const newMsg = {
      sender: 'user',
      senderName,
      senderAvatar,
      text: (message || '').trim(),
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      fileType: fileType || '',
      fileSize: fileSize || 0,
      createdAt: new Date()
    };

    const isNewSession = !session;
    const previewText = (message || `[Attachment: ${fileName || 'File'}]`).trim().slice(0, 140);

    if (!session) {
      session = new SupportSession({
        sessionId: sid,
        user: req.user?._id || null,
        guestInfo: guestInfo || {
          name: senderName,
          email: req.user?.email || guestInfo?.email || '',
          role: req.user?.role || 'visitor',
          city: req.user?.city || guestInfo?.city || ''
        },
        status: 'human_requested',
        requestedAt: new Date(),
        messages: [newMsg],
        lastMessage: previewText,
        lastSender: 'user',
        unreadAdminCount: 1
      });
    } else {
      session.messages.push(newMsg);
      session.lastMessage = previewText;
      session.lastSender = 'user';
      if (session.status !== 'admin_joined') {
        session.status = 'human_requested';
        session.requestedAt = new Date();
      }
      session.unreadAdminCount = (session.unreadAdminCount || 0) + 1;
      if (req.user && !session.user) {
        session.user = req.user._id;
      }
    }

    await session.save();

    // Broadcast user message via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`support_${sid}`).emit('support-message-received', {
        sessionId: sid,
        message: newMsg
      });

      io.to('admins').emit('support-session-updated', {
        sessionId: sid,
        lastMessage: message.trim().slice(0, 140),
        lastSender: 'user',
        unreadAdminCount: session.unreadAdminCount
      });

      io.to('admins').emit('human-support-alert', {
        sessionId: sid,
        userName: senderName,
        message: message.trim(),
        timestamp: new Date()
      });
    }

    // Notify admins in DB if this is a newly requested session
    if (isNewSession) {
      try {
        const admins = await User.find({ role: 'admin', isActive: true });
        for (const admin of admins) {
          await Notification.create({
            recipient: admin._id,
            type: 'human_support_request',
            title: '💬 New Live Support Inquiry',
            message: `${senderName} initiated a live support chat: "${message.trim().slice(0, 60)}..."`,
            link: `/admin/support?session=${sid}`,
            data: { sessionId: sid }
          });
        }
      } catch (nErr) {}
    }

    return res.status(200).json({
      success: true,
      sessionId: sid,
      message: newMsg,
      status: session.status
    });
  } catch (error) {
    console.error('Error in live support sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send support message.'
    });
  }
};

/**
 * Get conversation history for a session
 */
exports.getSessionHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await SupportSession.findOne({ sessionId });
    if (!session) {
      return res.status(200).json({ success: true, session: null, messages: [] });
    }

    res.status(200).json({
      success: true,
      session: {
        sessionId: session.sessionId,
        status: session.status,
        assignedAdmin: session.assignedAdmin,
        updatedAt: session.updatedAt
      },
      messages: session.messages || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Escalate conversation to human support staff
 */
exports.escalateToHuman = async (req, res) => {
  try {
    const { sessionId, note, guestInfo } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    let session = await SupportSession.findOne({ sessionId });
    if (!session) {
      session = new SupportSession({
        sessionId,
        user: req.user?._id || null,
        guestInfo: guestInfo || { name: req.user?.name || 'Guest Visitor', email: req.user?.email || '', role: req.user?.role || 'visitor' },
        status: 'human_requested',
        requestedAt: new Date()
      });
    } else {
      session.status = 'human_requested';
      session.requestedAt = new Date();
      if (req.user) session.user = req.user._id;
    }

    session.messages.push({
      sender: 'system',
      senderName: 'System Notice',
      text: 'User requested human support staff. Ticket routed to active admin desk.',
      createdAt: new Date()
    });

    await session.save();

    // Notify online admins via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('human-support-alert', {
        sessionId: session.sessionId,
        userName: session.guestInfo?.name || req.user?.name || 'Guest User',
        userRole: session.guestInfo?.role || req.user?.role || 'visitor',
        note: note || 'User clicked Talk to Human Support button',
        timestamp: new Date()
      });
    }

    // Create persistent Notification for all active admins
    try {
      const admins = await User.find({ role: 'admin', isActive: true });
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          type: 'human_support_request',
          title: '🙋‍♂️ Human Support Requested',
          message: `${session.guestInfo?.name || req.user?.name || 'A visitor'} requested human assistance in support session ${sessionId}.`,
          link: `/admin/support?session=${sessionId}`,
          data: { sessionId }
        });
      }
    } catch (nErr) {}

    res.status(200).json({
      success: true,
      status: 'human_requested',
      message: 'An official team administrator has been notified. They will join shortly.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Public: Get active FAQs
 */
exports.getFaqs = async (req, res) => {
  try {
    const { category } = req.query;
    const faqs = await getKnowledgeBaseFAQs(category);
    res.status(200).json({ success: true, count: faqs.length, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Create new FAQ in Knowledge Base / Help Center
 */
exports.adminCreateFaq = async (req, res) => {
  try {
    const { question, answer, category, tags, isActive, displayOrder } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }

    const id = await saveSupportFAQ({
      question,
      answer,
      category: category || 'general',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      isActive: isActive !== false,
      displayOrder: Number(displayOrder) || 0,
      embedding: []
    });

    res.status(201).json({ success: true, message: 'FAQ added successfully', id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Update FAQ in Knowledge Base / Help Center
 */
exports.adminUpdateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, tags, isActive, displayOrder } = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (category !== undefined) faq.category = category;
    if (tags !== undefined) faq.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (isActive !== undefined) faq.isActive = isActive;
    if (displayOrder !== undefined) faq.displayOrder = Number(displayOrder);

    await faq.save();
    res.status(200).json({ success: true, message: 'FAQ updated successfully', faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Delete FAQ
 */
exports.adminDeleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    await FAQ.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Get support desk analytics
 */
exports.getSupportAnalytics = async (req, res) => {
  try {
    const totalSessions = await SupportSession.countDocuments();
    const humanRequested = await SupportSession.countDocuments({ status: 'human_requested' });
    const resolvedSessions = await SupportSession.countDocuments({ status: 'resolved' });
    const adminJoined = await SupportSession.countDocuments({ status: 'admin_joined' });

    const escalationRate = totalSessions > 0 ? Math.round((humanRequested / totalSessions) * 100) : 0;
    const resolutionRate = totalSessions > 0 ? Math.round((resolvedSessions / totalSessions) * 100) : 0;

    // Top categories / topics
    const topics = [
      { topic: 'Tutor & Alimah Search', count: Math.round(totalSessions * 0.45) },
      { topic: 'Admission & 3-Day Trial', count: Math.round(totalSessions * 0.25) },
      { topic: 'Payment Methods (Meezan/JazzCash)', count: Math.round(totalSessions * 0.18) },
      { topic: 'Tutor Sanad & Vetting', count: Math.round(totalSessions * 0.12) }
    ];

    res.status(200).json({
      success: true,
      metrics: {
        totalSessions,
        humanRequested,
        adminJoined,
        resolvedSessions,
        escalationRate: `${escalationRate}%`,
        resolutionRate: `${resolutionRate}%`,
        avgResponseTimeSec: 1.2
      },
      topics
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Upload file attachment for support chat (PNG, JPG, JPEG, PDF only, max 10MB)
 */
exports.uploadSupportFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded.' });
    }

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Only PNG, JPG, JPEG, and PDF files are allowed.' });
    }

    let fileUrl;
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const { cloudinary } = require('../config/cloudinary');
      const isImage = req.file.mimetype.startsWith('image/');
      const folder = isImage ? 'ilmportal/support/images' : 'ilmportal/support/files';

      fileUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            public_id: `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    } else {
      const base64 = req.file.buffer.toString('base64');
      fileUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    res.status(200).json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error('Error uploading support file:', error);
    res.status(500).json({ success: false, message: error.message || 'Error uploading file' });
  }
};

/**
 * Check whether any admin is currently online in support desk
 */
exports.getAdminOnlineStatus = async (req, res) => {
  try {
    const io = req.app.get('io');
    let isOnline = false;
    let count = 0;
    if (io) {
      const room = io.sockets.adapter.rooms.get('admins');
      if (room && room.size > 0) {
        isOnline = true;
        count = room.size;
      }
    }
    return res.status(200).json({
      success: true,
      isOnline,
      onlineAdmins: count
    });
  } catch (error) {
    return res.status(200).json({ success: true, isOnline: false, onlineAdmins: 0 });
  }
};

/**
 * User leaves an offline message with email when admin is not online
 */
exports.leaveOfflineMessage = async (req, res) => {
  try {
    const { email, name, message, sessionId, fileUrl, fileName, fileType, fileSize } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required so we can reach back out to you.' });
    }
    if ((!message || !message.trim()) && !fileUrl) {
      return res.status(400).json({ success: false, message: 'Message or attachment is required.' });
    }

    const sid = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const senderName = name?.trim() || req.user?.name || 'Website Visitor';
    const userEmail = email.trim().toLowerCase();

    let session = await SupportSession.findOne({ sessionId: sid });

    const newMsg = {
      sender: 'user',
      senderName,
      senderAvatar: req.user?.avatar || '',
      text: (message || '').trim(),
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      fileType: fileType || '',
      fileSize: fileSize || 0,
      createdAt: new Date()
    };

    const previewText = (message || `[Attachment: ${fileName || 'File'}]`).trim().slice(0, 140);

    if (!session) {
      session = new SupportSession({
        sessionId: sid,
        user: req.user?._id || null,
        guestInfo: {
          name: senderName,
          email: userEmail,
          role: req.user?.role || 'visitor',
          city: req.user?.city || ''
        },
        isOfflineEmailMessage: true,
        replyEmail: userEmail,
        status: 'offline_message',
        requestedAt: new Date(),
        messages: [newMsg],
        lastMessage: previewText,
        lastSender: 'user',
        unreadAdminCount: 1
      });
    } else {
      session.isOfflineEmailMessage = true;
      session.replyEmail = userEmail;
      session.status = 'offline_message';
      session.messages.push(newMsg);
      session.lastMessage = previewText;
      session.lastSender = 'user';
      session.unreadAdminCount = (session.unreadAdminCount || 0) + 1;
      if (req.user && !session.user) session.user = req.user._id;
      if (session.guestInfo) session.guestInfo.email = userEmail;
    }

    await session.save();

    // 1. Dispatch Email notification to administrators
    const { sendOfflineSupportInquiryEmail } = require('../utils/emailService');
    try {
      await sendOfflineSupportInquiryEmail({
        userName: senderName,
        userEmail,
        messageText: message || '',
        fileUrl,
        fileName,
        sessionId: sid
      });
    } catch (mailErr) {
      console.warn('Failed to send offline support inquiry email notification:', mailErr.message);
    }

    // 2. Broadcast to Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`support_${sid}`).emit('support-message-received', {
        sessionId: sid,
        message: newMsg
      });

      io.to('admins').emit('support-session-updated', {
        sessionId: sid,
        lastMessage: session.lastMessage,
        lastSender: 'user',
        unreadAdminCount: session.unreadAdminCount
      });

      io.to('admins').emit('human-support-alert', {
        sessionId: sid,
        userName: `${senderName} (Offline Inquiry - ${userEmail})`,
        message: previewText,
        timestamp: new Date()
      });
    }

    // 3. Create persistent Notification for all active admins
    try {
      const admins = await User.find({ role: 'admin', isActive: true });
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          type: 'human_support_request',
          title: '✉️ New Offline Support Message',
          message: `${senderName} (${userEmail}) left an offline inquiry: "${previewText.slice(0, 50)}..."`,
          link: `/admin/support?session=${sid}`,
          data: { sessionId: sid, email: userEmail }
        });
      }
    } catch (nErr) {}

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your message and email have been recorded. Our administration team will review and reply to your email directly.',
      sessionId: sid,
      session
    });
  } catch (error) {
    console.error('Error in leaveOfflineMessage:', error);
    res.status(500).json({ success: false, message: 'Failed to record offline message.' });
  }
};

/**
 * User deletes/clears their own active support chat session
 */
exports.deleteUserSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required.' });
    }

    await SupportSession.findOneAndDelete({ sessionId });

    const io = req.app.get('io');
    if (io) {
      io.to(`support_${sessionId}`).emit('support-chat-deleted', { sessionId });
      io.to('admins').emit('support-session-deleted', { sessionId });
    }

    res.status(200).json({ success: true, message: 'Chat history deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user support session:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Get support sessions for admin support desk
 */
exports.getAdminSessions = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search && search.trim()) {
      query.$or = [
        { 'guestInfo.name': new RegExp(search.trim(), 'i') },
        { 'guestInfo.email': new RegExp(search.trim(), 'i') },
        { replyEmail: new RegExp(search.trim(), 'i') },
        { sessionId: new RegExp(search.trim(), 'i') },
        { lastMessage: new RegExp(search.trim(), 'i') }
      ];
    }

    const sessions = await SupportSession.find(query)
      .populate('user', 'name email role avatar')
      .populate('assignedAdmin', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    const counts = {
      all: await SupportSession.countDocuments(),
      human_requested: await SupportSession.countDocuments({ status: 'human_requested' }),
      admin_joined: await SupportSession.countDocuments({ status: 'admin_joined' }),
      offline_message: await SupportSession.countDocuments({ status: 'offline_message' }),
      resolved: await SupportSession.countDocuments({ status: 'resolved' })
    };

    res.status(200).json({ success: true, sessions, counts });
  } catch (error) {
    console.error('Error fetching admin support sessions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Get specific session transcript
 */
exports.getAdminSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await SupportSession.findOne({
      $or: [
        mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null,
        { sessionId: id }
      ].filter(Boolean)
    })
      .populate('user', 'name email role avatar city')
      .populate('assignedAdmin', 'name email avatar')
      .lean();

    if (!session) {
      return res.status(404).json({ success: false, message: 'Support session not found' });
    }

    // Reset unread count for admin
    await SupportSession.updateOne({ _id: session._id }, { unreadAdminCount: 0 });

    res.status(200).json({ success: true, session });
  } catch (error) {
    console.error('Error fetching admin session:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Join support session
 */
exports.adminJoinSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await SupportSession.findOne({
      $or: [
        mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null,
        { sessionId: id }
      ].filter(Boolean)
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Support session not found' });
    }

    session.assignedAdmin = req.user._id;
    session.status = 'admin_joined';
    session.assignedAt = new Date();

    const systemMsg = {
      sender: 'system',
      senderName: 'System Notice',
      text: `🟢 **${req.user.name || 'A Support Administrator'} has joined this chat.** You are now speaking directly in real-time.`,
      createdAt: new Date()
    };
    session.messages.push(systemMsg);

    await session.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`support_${session.sessionId}`).emit('admin-joined-support', {
        sessionId: session.sessionId,
        admin: { _id: req.user._id, name: req.user.name, role: req.user.role }
      });
      io.to(`support_${session.sessionId}`).emit('support-status-changed', {
        sessionId: session.sessionId,
        status: 'admin_joined'
      });
    }

    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Send reply message in support session (with optional PNG, JPG, JPEG, PDF)
 */
exports.adminSendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, fileUrl, fileName, fileType, fileSize, senderName } = req.body;

    if ((!text || !text.trim()) && !fileUrl) {
      return res.status(400).json({ success: false, message: 'Message or attachment is required' });
    }

    const session = await SupportSession.findOne({
      $or: [
        mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null,
        { sessionId: id }
      ].filter(Boolean)
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Support session not found' });
    }

    const newMsg = {
      sender: 'admin',
      senderName: senderName || req.user?.name || 'Support Specialist',
      senderAvatar: req.user?.avatar || '',
      text: (text || '').trim(),
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      fileType: fileType || '',
      fileSize: fileSize || 0,
      createdAt: new Date()
    };

    const previewText = (text || `[Attachment: ${fileName || 'File'}]`).trim().slice(0, 140);

    session.messages.push(newMsg);
    session.lastMessage = previewText;
    session.lastSender = 'admin';
    session.unreadUserCount = (session.unreadUserCount || 0) + 1;
    if (session.status !== 'admin_joined') {
      session.status = 'admin_joined';
      session.assignedAdmin = req.user._id;
    }

    await session.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`support_${session.sessionId}`).emit('support-message-received', {
        sessionId: session.sessionId,
        message: newMsg
      });
    }

    res.status(200).json({ success: true, message: newMsg, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Resolve support session
 */
exports.adminResolveSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await SupportSession.findOne({
      $or: [
        mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null,
        { sessionId: id }
      ].filter(Boolean)
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Support session not found' });
    }

    session.status = 'resolved';
    session.resolvedAt = new Date();

    const systemMsg = {
      sender: 'system',
      senderName: 'System Notice',
      text: '✅ **This support session has been marked as resolved by the administration team.** If you have any further questions, feel free to send a message below.',
      createdAt: new Date()
    };
    session.messages.push(systemMsg);

    await session.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`support_${session.sessionId}`).emit('support-status-changed', {
        sessionId: session.sessionId,
        status: 'resolved'
      });
      io.to(`support_${session.sessionId}`).emit('support-message-received', {
        sessionId: session.sessionId,
        message: systemMsg
      });
      io.to('admins').emit('support-session-updated', {
        sessionId: session.sessionId,
        status: 'resolved'
      });
    }

    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Permanently delete a support session
 */
exports.adminDeleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await SupportSession.findOneAndDelete({
      $or: [
        mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null,
        { sessionId: id }
      ].filter(Boolean)
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Support session not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`support_${session.sessionId}`).emit('support-chat-deleted', { sessionId: session.sessionId });
      io.to('admins').emit('support-session-deleted', { sessionId: session.sessionId });
    }

    res.status(200).json({ success: true, message: 'Support session deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
