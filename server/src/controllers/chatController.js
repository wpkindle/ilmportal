const Message = require('../models/Message');
const User = require('../models/User');
const Deal = require('../models/Deal');
const TutorProfile = require('../models/TutorProfile');
const ChatRequest = require('../models/ChatRequest');
const Notification = require('../models/Notification');
const {
  sendDedicatedChatInvitationEmail,
  sendChatRequestReceivedEmail,
  sendChatRequestStatusEmail
} = require('../utils/emailService');

// Helper to check 100% student profile completion (7 core required fields)
const isStudentProfile100Percent = (user) => {
  if (!user) return false;
  const hasName = !!user.name?.trim();
  const hasVerifiedEmail = !!user.isVerified;
  const hasPhone = !!user.phone?.trim() || !!user.guardianPhone?.trim();
  const hasAvatar = !!user.avatar?.trim();
  const hasAge = !!user.age && user.age >= 3;
  const hasGender = !!user.gender && user.gender.trim() !== '';
  const hasCity = !!user.city && user.city.trim() !== '';
  return hasName && hasVerifiedEmail && hasPhone && hasAvatar && hasAge && hasGender && hasCity;
};

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
        // Count unread messages accurately
        const unreadCount = await Message.countDocuments({
          sender: otherUser._id,
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
    const limit = parseInt(req.query.limit, 10) || 200;
    const skip = (page - 1) * limit;

    const parts = (conversationId || '').split('_');
    let query = { conversationId };

    if (parts.length === 2 && parts[0] && parts[1]) {
      const p0 = parts[0];
      const p1 = parts[1];
      const altConvId = `${p1}_${p0}`;
      query = {
        $or: [
          { conversationId },
          { conversationId: altConvId },
          { sender: p0, recipient: p1 },
          { sender: p1, recipient: p0 }
        ]
      };
    }

    // Sort newest first ({ createdAt: -1 }) with limit 200, then reverse to chronological order.
    // Guarantees newest messages are always retrieved on reload and not truncated by oldest-first limit.
    const rawMessages = await Message.find(query)
      .populate('sender', 'name avatar role city')
      .populate('recipient', 'name avatar role city')
      .populate('deal')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark undelivered messages to this user as delivered
    try {
      const undeliveredCount = await Message.countDocuments({
        ...query,
        recipient: req.user.id,
        isDelivered: false
      });
      if (undeliveredCount > 0) {
        await Message.updateMany(
          { ...query, recipient: req.user.id, isDelivered: false },
          { isDelivered: true, deliveredAt: new Date() }
        );
        const io = req.app.get('io');
        if (io) {
          io.to(`conv_${conversationId}`).emit('messages-delivered', {
            conversationId,
            recipientId: req.user.id
          });
        }
      }
    } catch (deliveryErr) {
      console.error('Error auto-delivering messages:', deliveryErr);
    }

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

    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found'
      });
    }

    // Disallow tutor-to-tutor direct messaging
    if (req.user.role === 'tutor' && recipientUser.role === 'tutor') {
      return res.status(403).json({
        success: false,
        message: 'Tutors cannot message other tutors. Messaging is reserved for student-tutor learning communication.'
      });
    }

    // Safeguard: Check if recipient is a female tutor
    if (req.user.role === 'student') {
      if (recipientUser && recipientUser.role === 'tutor') {
        const recipientProfile = await TutorProfile.findOne({ user: recipientUser._id });
        const isFemale = recipientUser.gender === 'female' || recipientProfile?.gender === 'female';
        if (isFemale) {
          if (!isStudentProfile100Percent(req.user)) {
            return res.status(403).json({
              success: false,
              code: 'PROFILE_INCOMPLETE',
              message: 'Your profile strength must be 100% complete before messaging female tutors.'
            });
          }
          const acceptedReq = await ChatRequest.findOne({
            student: req.user._id,
            tutor: recipientUser._id,
            status: 'accepted'
          });
          if (!acceptedReq) {
            return res.status(403).json({
              success: false,
              code: 'REQUEST_REQUIRED',
              message: 'You must send a message request and have it accepted by the female tutor before chatting.'
            });
          }
        }
      }
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

// @desc    Submit a message request to a female tutor
// @route   POST /api/chat/request
exports.sendChatRequest = async (req, res) => {
  try {
    const { tutorId, details } = req.body;
    const studentUser = req.user;

    if (!tutorId) {
      return res.status(400).json({ success: false, message: 'Tutor ID is required' });
    }

    if (!details || details.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide details explaining why you are interested to connect (minimum 10 characters).'
      });
    }

    // Verify student is 100% complete
    if (!isStudentProfile100Percent(studentUser)) {
      return res.status(403).json({
        success: false,
        code: 'PROFILE_INCOMPLETE',
        message: 'Your profile strength must be 100% complete before messaging female tutors. Please complete all missing profile details.'
      });
    }

    // Resolve tutor user
    let tutorUser = await User.findById(tutorId);
    let tutorProfile = null;
    if (!tutorUser) {
      tutorProfile = await TutorProfile.findById(tutorId).populate('user');
      if (tutorProfile && tutorProfile.user) {
        tutorUser = tutorProfile.user;
      }
    } else {
      tutorProfile = await TutorProfile.findOne({ user: tutorUser._id });
    }

    if (!tutorUser) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    // Check existing request
    const existing = await ChatRequest.findOne({
      student: studentUser._id,
      tutor: tutorUser._id
    }).sort({ createdAt: -1 });

    if (existing) {
      if (existing.status === 'pending') {
        return res.status(200).json({
          success: true,
          message: 'You already have a pending message request with this tutor. Please wait for her response.',
          request: existing
        });
      }
      if (existing.status === 'accepted') {
        return res.status(200).json({
          success: true,
          message: 'Your message request was already accepted! You can chat directly.',
          request: existing
        });
      }
    }

    const request = await ChatRequest.create({
      student: studentUser._id,
      tutor: tutorUser._id,
      tutorProfile: tutorProfile?._id,
      status: 'pending',
      details: details.trim(),
      studentProfileSnapshot: {
        name: studentUser.name,
        email: studentUser.email,
        phone: studentUser.phone || studentUser.guardianPhone,
        guardianPhone: studentUser.guardianPhone,
        age: studentUser.age,
        gender: studentUser.gender,
        city: studentUser.city,
        avatar: studentUser.avatar
      }
    });

    const populatedRequest = await ChatRequest.findById(request._id)
      .populate('student', 'name email avatar phone guardianPhone age gender city');

    // Send in-app notification to tutor
    await Notification.create({
      recipient: tutorUser._id,
      sender: studentUser._id,
      title: `New Message Request from ${studentUser.name}`,
      message: `${studentUser.name} (100% Profile Complete) sent a message request: "${details.trim().slice(0, 80)}..."`,
      type: 'chat_request',
      link: `/tutor/messages?request=${request._id}`
    });

    // Real-time socket notification to tutor
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${tutorUser._id}`).emit('chat-request-received', populatedRequest);
      io.to(`user_${tutorUser._id}`).emit('notification-alert', {
        title: `New Message Request from ${studentUser.name}`,
        message: `${details.trim().slice(0, 80)}...`,
        type: 'chat_request',
        senderAvatar: studentUser.avatar || '/icon.svg',
        link: `/tutor/messages?request=${request._id}`
      });
    }

    // Send email to female tutor
    const baseUrl = process.env.CLIENT_URL || 'https://ilmportal.org';
    sendChatRequestReceivedEmail({
      to: tutorUser.email,
      tutorName: tutorUser.name,
      studentName: studentUser.name,
      studentAge: studentUser.age,
      studentGender: studentUser.gender,
      studentCity: studentUser.city,
      details: details.trim(),
      tutorRequestsUrl: `${baseUrl}/tutor/messages?request=${request._id}`
    }).catch(err => console.error('Error dispatching chat request email to tutor:', err));

    res.status(201).json({
      success: true,
      message: 'Message request sent successfully to the tutor.',
      request: populatedRequest
    });
  } catch (error) {
    console.error('Error submitting chat request:', error);
    res.status(500).json({ success: false, message: error.message || 'Error submitting message request' });
  }
};

// @desc    Get request status between student and tutor
// @route   GET /api/chat/request/status/:tutorId
exports.getChatRequestStatus = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const studentId = req.user.id;

    // Resolve tutor user
    let tutorUser = await User.findById(tutorId);
    let tutorProfile = null;
    if (!tutorUser) {
      tutorProfile = await TutorProfile.findById(tutorId).populate('user');
      if (tutorProfile && tutorProfile.user) {
        tutorUser = tutorProfile.user;
      }
    } else {
      tutorProfile = await TutorProfile.findOne({ user: tutorUser._id });
    }

    if (!tutorUser) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    const isFemaleTutor = tutorUser.gender === 'female' || tutorProfile?.gender === 'female';

    const latestReq = await ChatRequest.findOne({
      student: studentId,
      tutor: tutorUser._id
    }).sort({ createdAt: -1 });

    const is100Percent = isStudentProfile100Percent(req.user);

    res.status(200).json({
      success: true,
      isFemaleTutor,
      isStudent100Percent: is100Percent,
      requestStatus: latestReq ? latestReq.status : 'none',
      request: latestReq
    });
  } catch (error) {
    console.error('Error fetching chat request status:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching request status' });
  }
};

// @desc    Get all incoming message requests for logged-in tutor
// @route   GET /api/chat/requests
exports.getChatRequests = async (req, res) => {
  try {
    const requests = await ChatRequest.find({ tutor: req.user.id })
      .populate('student', 'name avatar age gender city createdAt isVerified role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching chat requests:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching requests' });
  }
};

// @desc    Tutor responds (accept/decline) to message request
// @route   PUT /api/chat/request/:requestId/respond
exports.respondChatRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, responseMessage } = req.body; // 'accepted' | 'declined'

    if (!['accepted', 'declined'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be accepted or declined' });
    }

    const request = await ChatRequest.findById(requestId)
      .populate('student', 'name email avatar phone guardianPhone age gender city')
      .populate('tutor', 'name email avatar');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.tutor._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this request' });
    }

    request.status = action;
    request.responseMessage = responseMessage ? responseMessage.trim() : '';
    request.respondedAt = new Date();
    await request.save();

    const conversationId = [request.student._id.toString(), request.tutor._id.toString()].sort().join('_');
    const baseUrl = process.env.CLIENT_URL || 'https://ilmportal.org';
    const studentChatUrl = `${baseUrl}/student/messages?conversation=${conversationId}&tutorId=${request.tutor._id}`;
    const findTutorsUrl = `${baseUrl}/tutors`;

    if (action === 'accepted') {
      // Create initial conversation message so it appears immediately in both inboxes
      const initialText = responseMessage && responseMessage.trim() 
        ? `Assalam-o-Alaikum! I have accepted your message request. ${responseMessage.trim()}`
        : `Assalam-o-Alaikum! I have accepted your message request. How can I help you with your lessons?`;

      await Message.create({
        conversationId,
        sender: request.tutor._id,
        recipient: request.student._id,
        text: initialText,
        messageType: 'text',
        isDelivered: false,
        isRead: false
      });

      // Notify student in-app
      await Notification.create({
        recipient: request.student._id,
        sender: request.tutor._id,
        title: `Message Request Accepted by ${request.tutor.name}!`,
        message: `${request.tutor.name} accepted your request to connect. You can now chat directly and discuss lesson schedules.`,
        type: 'chat_request_accepted',
        link: `/student/messages?conversation=${conversationId}`
      });
    } else {
      // Declined
      await Notification.create({
        recipient: request.student._id,
        sender: request.tutor._id,
        title: `Message Request Update from ${request.tutor.name}`,
        message: responseMessage && responseMessage.trim()
          ? `${request.tutor.name} is currently unavailable for new classes: "${responseMessage.trim()}"`
          : `${request.tutor.name} is currently at full capacity and unable to take new students.`,
        type: 'chat_request_declined',
        link: `/tutors`
      });
    }

    // Real-time socket notification to student
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${request.student._id}`).emit('chat-request-updated', {
        requestId: request._id,
        status: action,
        tutorName: request.tutor.name,
        conversationId,
        responseMessage: request.responseMessage
      });
      io.to(`user_${request.student._id}`).emit('notification-alert', {
        title: action === 'accepted' ? `Request Accepted by ${request.tutor.name}!` : `Request Update from ${request.tutor.name}`,
        message: action === 'accepted' ? 'You can now chat directly!' : 'Tutor is currently unavailable.',
        type: action === 'accepted' ? 'chat_request_accepted' : 'chat_request_declined',
        senderAvatar: request.tutor.avatar || '/icon.svg',
        link: action === 'accepted' ? studentChatUrl : findTutorsUrl
      });
    }

    // Send email to student
    sendChatRequestStatusEmail({
      to: request.student.email,
      studentName: request.student.name,
      tutorName: request.tutor.name,
      status: action,
      responseMessage: request.responseMessage,
      chatUrl: studentChatUrl,
      findTutorsUrl
    }).catch(err => console.error('Error dispatching chat request status email to student:', err));

    res.status(200).json({
      success: true,
      message: `Message request ${action} successfully.`,
      request
    });
  } catch (error) {
    console.error('Error responding to chat request:', error);
    res.status(500).json({ success: false, message: error.message || 'Error responding to request' });
  }
};

// @desc    Get student profile for tutor inspection
// @route   GET /api/chat/student-profile/:studentId
exports.getStudentProfileForTutor = async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentDoc = await User.findById(studentId);

    if (!studentDoc || studentDoc.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const is100Percent = isStudentProfile100Percent(studentDoc);

    // Sanitize student profile: Never expose contact details (email, username, password, phone) to tutors
    const sanitizedStudent = {
      _id: studentDoc._id,
      id: studentDoc._id,
      name: studentDoc.name,
      avatar: studentDoc.avatar,
      age: studentDoc.age,
      gender: studentDoc.gender,
      city: studentDoc.city,
      createdAt: studentDoc.createdAt,
      isVerified: studentDoc.isVerified,
      role: studentDoc.role,
      status: studentDoc.status
    };

    // Also fetch any recent request or deal between this tutor and student
    const [latestRequest, latestDeal] = await Promise.all([
      ChatRequest.findOne({ student: studentDoc._id, tutor: req.user.id }).sort({ createdAt: -1 }),
      Deal.findOne({ student: studentDoc._id, tutor: req.user.id }).sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      student: sanitizedStudent,
      is100Percent,
      profileStrength: is100Percent ? 100 : 85,
      latestRequest,
      latestDeal
    });
  } catch (error) {
    console.error('Error fetching student profile for tutor:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching student profile' });
  }
};


