const { generateChatResponse, executeGetPlatformStats } = require('../services/aiAgentService');
const SupportSession = require('../models/SupportSession');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Handle incoming chat messages for the AI Support Agent
 * POST /api/ai/chat
 */
exports.chat = async (req, res) => {
  try {
    const { message, history, sessionId, guestInfo } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid message string is required.'
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message exceeds maximum length of 2000 characters.'
      });
    }

    const effectiveSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const response = await generateChatResponse({
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      sessionId: effectiveSessionId,
      user: req.user || null,
      guestInfo: guestInfo || (req.user ? {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        city: req.user.city
      } : undefined)
    });

    // Notify active socket room if any admin is listening
    const io = req.app.get('io');
    if (io && effectiveSessionId) {
      io.to(`support_${effectiveSessionId}`).emit('support-session-updated', {
        sessionId: effectiveSessionId,
        lastMessage: response.reply,
        lastSender: 'bot'
      });
    }

    return res.status(200).json({
      success: true,
      reply: response.reply,
      thoughts: response.thoughts,
      source: response.source,
      sessionId: effectiveSessionId,
      status: response.status
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AI support inquiry. Please try again in a moment.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Request Human Support Escalation
 * POST /api/ai/human-support
 */
exports.requestHumanSupport = async (req, res) => {
  try {
    const { sessionId, note, guestInfo } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'A valid sessionId is required.'
      });
    }

    let session = await SupportSession.findOne({ sessionId });
    const userInfo = req.user ? {
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      city: req.user.city
    } : (guestInfo || { name: 'Guest Visitor', role: 'visitor' });

    if (!session) {
      session = new SupportSession({
        sessionId,
        user: req.user ? req.user._id : null,
        guestInfo: userInfo,
        status: 'human_requested',
        requestedAt: new Date(),
        messages: []
      });
    } else {
      session.status = 'human_requested';
      session.requestedAt = new Date();
      if (req.user && !session.user) {
        session.user = req.user._id;
      }
      if (guestInfo) {
        session.guestInfo = { ...session.guestInfo, ...guestInfo };
      }
    }

    const sysMsg = {
      sender: 'system',
      senderName: 'System',
      text: note ? `Human support requested: "${note}"` : 'User requested to speak with a human support agent.',
      createdAt: new Date()
    };
    session.messages.push(sysMsg);
    session.lastMessage = sysMsg.text;
    session.lastSender = 'system';
    session.unreadAdminCount = (session.unreadAdminCount || 0) + 1;
    await session.save();

    // Alert all admins
    const admins = await User.find({ role: 'admin' });
    const requesterName = req.user?.name || session.guestInfo?.name || 'A user';

    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        sender: req.user ? req.user._id : admin._id,
        title: '🙋‍♂️ Human Support Requested',
        message: `${requesterName} is requesting live support assistance in chat.`,
        type: 'human_support_request',
        link: `/admin/support?session=${sessionId}`
      });
    }

    // Real-time socket broadcast
    const io = req.app.get('io');
    if (io) {
      const alertPayload = {
        title: 'Human Support Requested',
        message: `${requesterName} is requesting live support assistance.`,
        type: 'human_support_request',
        sessionId,
        user: userInfo,
        requestedAt: session.requestedAt,
        link: `/admin/support?session=${sessionId}`
      };

      for (const admin of admins) {
        io.to(`user_${admin._id}`).emit('notification-alert', alertPayload);
      }

      // Broadcast to dedicated admins room
      io.to('admins').emit('human-support-alert', alertPayload);

      // Broadcast status change into the support session room
      io.to(`support_${sessionId}`).emit('support-status-changed', {
        sessionId,
        status: 'human_requested'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Human support requested successfully. An administrator has been alerted.',
      sessionId,
      status: 'human_requested'
    });
  } catch (error) {
    console.error('Request Human Support Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to request human support. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all Support Sessions (Admin Only)
 * GET /api/ai/support/sessions
 */
exports.getSupportSessions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    const sessions = await SupportSession.find(filter)
      .populate('user', 'name email avatar role city phone')
      .populate('assignedAdmin', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    const counts = {
      all: await SupportSession.countDocuments(),
      human_requested: await SupportSession.countDocuments({ status: 'human_requested' }),
      admin_joined: await SupportSession.countDocuments({ status: 'admin_joined' }),
      resolved: await SupportSession.countDocuments({ status: 'resolved' })
    };

    return res.status(200).json({
      success: true,
      sessions,
      counts
    });
  } catch (error) {
    console.error('Get Support Sessions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve support sessions.'
    });
  }
};

/**
 * Get Single Support Session with full message history (Admin Only)
 * GET /api/ai/support/sessions/:id
 */
exports.getSupportSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await SupportSession.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { sessionId: id }]
    })
      .populate('user', 'name email avatar role city phone')
      .populate('assignedAdmin', 'name email avatar');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Support session not found.'
      });
    }

    // Reset unread count for admin
    if (session.unreadAdminCount > 0) {
      session.unreadAdminCount = 0;
      await session.save();
    }

    return res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Get Support Session By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve support session transcript.'
    });
  }
};

/**
 * Admin joins chat session
 * POST /api/ai/support/sessions/:id/join
 */
exports.joinSupportSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await SupportSession.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { sessionId: id }]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Support session not found.'
      });
    }

    session.status = 'admin_joined';
    session.assignedAdmin = req.user._id;
    session.assignedAt = new Date();

    const joinMessage = {
      sender: 'system',
      senderName: 'System',
      text: `${req.user.name} (Support Specialist) joined the conversation.`,
      createdAt: new Date()
    };
    session.messages.push(joinMessage);
    await session.save();

    const populatedSession = await SupportSession.findById(session._id)
      .populate('user', 'name email avatar role')
      .populate('assignedAdmin', 'name email avatar');

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(`support_${session.sessionId}`).emit('admin-joined-support', {
        sessionId: session.sessionId,
        admin: {
          id: req.user._id,
          name: req.user.name,
          avatar: req.user.avatar
        },
        message: joinMessage
      });

      io.to(`support_${session.sessionId}`).emit('support-status-changed', {
        sessionId: session.sessionId,
        status: 'admin_joined',
        assignedAdmin: req.user.name
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Joined support session successfully.',
      session: populatedSession
    });
  } catch (error) {
    console.error('Join Support Session Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to join support session.'
    });
  }
};

/**
 * Admin sends message in support session
 * POST /api/ai/support/sessions/:id/message
 */
exports.sendAdminMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required.'
      });
    }

    const session = await SupportSession.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { sessionId: id }]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Support session not found.'
      });
    }

    const newMsg = {
      sender: 'admin',
      senderName: req.user.name || 'Support Staff',
      senderAvatar: req.user.avatar || '',
      text: text.trim(),
      createdAt: new Date()
    };

    session.messages.push(newMsg);
    session.lastMessage = text.trim().slice(0, 140);
    session.lastSender = 'admin';
    session.status = 'admin_joined';
    session.unreadUserCount = (session.unreadUserCount || 0) + 1;
    await session.save();

    // Broadcast message to session room via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`support_${session.sessionId}`).emit('support-message-received', {
        sessionId: session.sessionId,
        message: newMsg
      });
    }

    return res.status(200).json({
      success: true,
      message: newMsg
    });
  } catch (error) {
    console.error('Send Admin Message Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send support message.'
    });
  }
};

/**
 * Mark support session as resolved
 * POST /api/ai/support/sessions/:id/resolve
 */
exports.resolveSupportSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await SupportSession.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { sessionId: id }]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Support session not found.'
      });
    }

    session.status = 'resolved';
    session.resolvedAt = new Date();

    const sysMsg = {
      sender: 'system',
      senderName: 'System',
      text: `Support session marked as resolved by ${req.user.name}.`,
      createdAt: new Date()
    };
    session.messages.push(sysMsg);
    await session.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`support_${session.sessionId}`).emit('support-status-changed', {
        sessionId: session.sessionId,
        status: 'resolved'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Support session marked as resolved.',
      session
    });
  } catch (error) {
    console.error('Resolve Support Session Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resolve support session.'
    });
  }
};

/**
 * Health check & status of AI Agent
 * GET /api/ai/health
 */
exports.health = async (req, res) => {
  try {
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    const stats = await executeGetPlatformStats();

    return res.status(200).json({
      success: true,
      status: 'active',
      engine: hasGeminiKey ? 'gemini-3.7-flash-thinking' : 'database-grounded-fallback',
      hasGeminiKey,
      stats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'error',
      message: error.message
    });
  }
};
