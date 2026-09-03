const Message = require('../models/Message');
const User = require('../models/User');
const Deal = require('../models/Deal');
const TutorProfile = require('../models/TutorProfile');
const { sendDedicatedChatInvitationEmail } = require('../utils/emailService');

// @desc    Get all conversation threads for logged-in user
// @route   GET /api/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all distinct conversationIds involving this user
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name avatar role city')
      .populate('recipient', 'name avatar role city')
      .populate('deal');

    // Group by conversation partner
    const conversationMap = new Map();

    for (const msg of messages) {
      const otherUser = msg.sender._id.toString() === userId.toString() ? msg.recipient : msg.sender;
      if (!otherUser) continue;
      
      const key = otherUser._id.toString();
      if (!conversationMap.has(key)) {
        // Count unread messages
        const unreadCount = await Message.countDocuments({
          conversationId: msg.conversationId,
          recipient: userId,
          isRead: false
        });

        conversationMap.set(key, {
          conversationId: msg.conversationId,
          partner: otherUser,
          lastMessage: msg,
          unreadCount,
          deal: msg.deal
        });
      }
    }

    const conversations = Array.from(conversationMap.values());

    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching conversations'
    });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/:conversationId/messages
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar role')
      .populate('recipient', 'name avatar role')
      .populate('deal')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching messages'
    });
  }
};

// @desc    Send a message (REST fallback)
// @route   POST /api/chat/send
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, text, messageType, dealId, dealOfferData, voiceData, voiceDuration } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required'
      });
    }

    const conversationId = [req.user.id.toString(), recipientId.toString()].sort().join('_');

    const message = await Message.create({
      conversationId,
      sender: req.user.id,
      recipient: recipientId,
      deal: dealId || null,
      text: text || '',
      messageType: messageType || (voiceData ? 'voice' : 'text'),
      voiceData: voiceData || '',
      voiceDuration: voiceDuration || 0,
      dealOfferData: dealOfferData || undefined
    });

    const populatedMsg = await Message.findById(message._id)
      .populate('sender', 'name avatar role')
      .populate('recipient', 'name avatar role')
      .populate('deal');

    // Broadcast via Socket.IO to real-time participants
    const io = req.app.get('io');
    if (io) {
      const recipientIdStr = (recipientId?._id || recipientId)?.toString();
      const targetChatLink = populatedMsg.recipient?.role === 'tutor' 
        ? `/tutor/messages?conversation=${conversationId}` 
        : `/student/messages?conversation=${conversationId}`;

      io.to(`conv_${conversationId}`).emit('new-message', populatedMsg);
      if (recipientIdStr) {
        io.to(`user_${recipientIdStr}`).emit('new-message', populatedMsg);
        io.to(`user_${recipientIdStr}`).emit('notification-alert', {
          title: `New Message from ${req.user.name}`,
          message: `${voiceData ? 'Voice message' : (text ? text.slice(0, 70) : 'Sent a course offer')}`,
          type: 'new_message',
          conversationId,
          senderAvatar: req.user.avatar || '/icon.svg',
          link: targetChatLink
        });
      }
    }

    res.status(201).json({
      success: true,
      message: populatedMsg,
      chatMessage: populatedMsg
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending message'
    });
  }
};

// @desc    Send dedicated 1:1 chat invitation email to student and tutor
// @route   POST /api/chat/send-invitation-email
exports.sendChatInvitationEmail = async (req, res) => {
  try {
    const { tutorId, conversationId } = req.body;
    const studentUser = req.user;

    // Find tutor user or profile
    let tutor = await User.findById(tutorId);
    if (!tutor) {
      const profile = await TutorProfile.findById(tutorId).populate('user');
      if (profile && profile.user) {
        tutor = profile.user;
      }
    }

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor account not found'
      });
    }

    const convId = conversationId || [studentUser._id.toString(), tutor._id.toString()].sort().join('_');
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const studentChatUrl = `${baseUrl}/student/messages?conversation=${convId}&tutorId=${tutor._id}`;
    const tutorChatUrl = `${baseUrl}/tutor/messages?conversation=${convId}&studentId=${studentUser._id}`;

    // 1. Email to Student
    await sendDedicatedChatInvitationEmail({
      to: studentUser.email,
      recipientRole: 'student',
      studentName: studentUser.name,
      tutorName: tutor.name,
      chatUrl: studentChatUrl,
      studentAge: studentUser.age,
      studentGender: studentUser.gender,
      studentCity: studentUser.city
    });

    // 2. Email to Tutor
    await sendDedicatedChatInvitationEmail({
      to: tutor.email,
      recipientRole: 'tutor',
      studentName: studentUser.name,
      tutorName: tutor.name,
      chatUrl: tutorChatUrl,
      studentAge: studentUser.age,
      studentGender: studentUser.gender,
      studentCity: studentUser.city
    });

    res.status(200).json({
      success: true,
      message: 'Dedicated 1:1 chat invitations dispatched to both student and tutor emails!',
      conversationId: convId,
      studentChatUrl,
      tutorChatUrl
    });
  } catch (error) {
    console.error('Error sending chat invitation email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending chat invitation email'
    });
  }
};

