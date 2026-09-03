const Message = require('../models/Message');
const User = require('../models/User');

const initSocket = (io) => {
  const onlineUsers = new Map(); // userId -> socketId
  const roomParticipants = new Map(); // roomId -> Set of user socketIds

  io.on('connection', (socket) => {
    console.log(`🔌 Socket client connected: ${socket.id}`);

    // Register user socket & send current online users list
    socket.on('register-user', (userId) => {
      if (userId) {
        const idStr = userId.toString();
        onlineUsers.set(idStr, socket.id);
        socket.userId = idStr;
        socket.join(`user_${idStr}`);
        console.log(`👤 User registered on socket: ${idStr} (${socket.id})`);

        // 1. Send all currently online user IDs to the newly connected user
        socket.emit('initial-online-users', Array.from(onlineUsers.keys()));

        // 2. Broadcast to everyone that this user came online
        io.emit('user-online-status', { userId: idStr, status: 'online' });
      }
    });

    // Join 1:1 Chat Conversation Room & automatically mark messages as seen
    socket.on('join-conversation', async (conversationId) => {
      socket.join(`conv_${conversationId}`);
      console.log(`💬 Socket ${socket.id} joined conversation: conv_${conversationId}`);

      if (socket.userId) {
        try {
          const updateResult = await Message.updateMany(
            { conversationId, recipient: socket.userId, isRead: false },
            { isRead: true, isDelivered: true, readAt: new Date() }
          );

          if (updateResult.modifiedCount > 0) {
            // Notify other party in the conversation that messages were seen
            io.to(`conv_${conversationId}`).emit('messages-seen', {
              conversationId,
              readerId: socket.userId,
              seenAt: new Date()
            });

            // Update recipient's unread badge count
            const remainingUnread = await Message.countDocuments({
              recipient: socket.userId,
              isRead: false
            });
            io.to(`user_${socket.userId}`).emit('unread-count-updated', {
              totalUnread: remainingUnread,
              conversationId
            });
          }
        } catch (err) {
          console.error('Error auto-marking messages as seen:', err);
        }
      }
    });

    // Explicit Mark Messages Seen Event from Client
    socket.on('mark-messages-seen', async ({ conversationId, readerId }) => {
      try {
        const rId = readerId || socket.userId;
        if (!rId || !conversationId) return;

        await Message.updateMany(
          { conversationId, recipient: rId, isRead: false },
          { isRead: true, isDelivered: true, readAt: new Date() }
        );

        // Broadcast to conversation room
        io.to(`conv_${conversationId}`).emit('messages-seen', {
          conversationId,
          readerId: rId,
          seenAt: new Date()
        });

        // Push new unread total to reader's personal room
        const totalUnread = await Message.countDocuments({
          recipient: rId,
          isRead: false
        });
        io.to(`user_${rId}`).emit('unread-count-updated', {
          totalUnread,
          conversationId
        });
      } catch (err) {
        console.error('Socket mark-messages-seen error:', err);
      }
    });

    // Send 1:1 Chat Message
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, senderId, recipientId, text, messageType, dealId, dealOfferData, voiceData, voiceDuration } = data;
        
        const isRecipientOnline = recipientId && onlineUsers.has(recipientId.toString());

        const message = await Message.create({
          conversationId,
          sender: senderId,
          recipient: recipientId,
          deal: dealId || null,
          text: text || '',
          messageType: messageType || (voiceData ? 'voice' : 'text'),
          voiceData: voiceData || '',
          voiceDuration: voiceDuration || 0,
          dealOfferData: dealOfferData || undefined,
          isDelivered: isRecipientOnline,
          deliveredAt: isRecipientOnline ? new Date() : undefined,
          isRead: false
        });

        const populatedMsg = await Message.findById(message._id)
          .populate('sender', 'name avatar role city')
          .populate('recipient', 'name avatar role city')
          .populate('deal');

        const recipientIdStr = (recipientId?._id || recipientId)?.toString();
        const recipientRole = populatedMsg.recipient?.role || 'student';
        const targetChatLink = recipientRole === 'tutor' 
          ? `/tutor/messages?conversation=${conversationId}` 
          : `/student/messages?conversation=${conversationId}`;

        const alertPayload = {
          title: `New Message from ${populatedMsg.sender.name}`,
          message: voiceData ? 'Sent a voice message' : (text ? text.slice(0, 70) : 'Sent a course offer'),
          type: 'new_message',
          conversationId,
          senderAvatar: populatedMsg.sender.avatar || '/icon.svg',
          link: targetChatLink
        };

        // 1. Broadcast to active conversation room
        io.to(`conv_${conversationId}`).emit('new-message', populatedMsg);

        // 2. Broadcast to recipient's personal user room (for users on dashboard, home, courses, etc.)
        if (recipientIdStr) {
          io.to(`user_${recipientIdStr}`).emit('new-message', populatedMsg);
          io.to(`user_${recipientIdStr}`).emit('notification-alert', alertPayload);

          // 3. Direct socket emission fallback
          const directSocketId = onlineUsers.get(recipientIdStr);
          if (directSocketId && directSocketId !== socket.id) {
            io.to(directSocketId).emit('new-message', populatedMsg);
            io.to(directSocketId).emit('notification-alert', alertPayload);
          }
        }
      } catch (err) {
        console.error('Socket send-message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing Indicators
    socket.on('typing', ({ conversationId, senderName }) => {
      socket.to(`conv_${conversationId}`).emit('user-typing', { senderName });
    });

    socket.on('stop-typing', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('user-stopped-typing');
    });

    // ==========================================
    // WebRTC Live Classroom Video Signaling
    // ==========================================

    socket.on('join-classroom', ({ roomId, user }) => {
      socket.join(`class_${roomId}`);
      socket.roomId = roomId;
      socket.classroomUser = user;

      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Set());
      }
      roomParticipants.get(roomId).add(socket.id);

      const count = roomParticipants.get(roomId).size;
      console.log(`🎥 User ${user ? user.name : socket.id} joined live classroom: ${roomId} (Total: ${count})`);

      // Notify others in room
      socket.to(`class_${roomId}`).emit('peer-joined', {
        socketId: socket.id,
        user
      });

      // Send existing participants list back to the newly joined peer
      const existingPeers = Array.from(roomParticipants.get(roomId))
        .filter(id => id !== socket.id);
      
      socket.emit('existing-peers', { peers: existingPeers });
    });

    // WebRTC Peer Signaling (Offer / Answer / ICE Candidate)
    socket.on('webrtc-signal', ({ roomId, targetSocketId, signalData, callerInfo }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc-signal-received', {
          callerSocketId: socket.id,
          signalData,
          callerInfo
        });
      } else if (roomId) {
        socket.to(`class_${roomId}`).emit('webrtc-signal-received', {
          callerSocketId: socket.id,
          signalData,
          callerInfo
        });
      }
    });

    // Camera / Mic / Screen Share state broadcasts
    socket.on('media-toggle', ({ roomId, type, enabled }) => {
      socket.to(`class_${roomId}`).emit('peer-media-toggle', {
        socketId: socket.id,
        type, // 'camera', 'mic', 'screenshare'
        enabled
      });
    });

    // In-Classroom live text chat
    socket.on('classroom-chat-message', ({ roomId, sender, message, timestamp }) => {
      io.to(`class_${roomId}`).emit('classroom-chat-received', {
        sender,
        message,
        timestamp: timestamp || new Date().toISOString()
      });
    });

    // Leave classroom
    socket.on('leave-classroom', ({ roomId, user }) => {
      socket.leave(`class_${roomId}`);
      if (roomParticipants.has(roomId)) {
        roomParticipants.get(roomId).delete(socket.id);
      }
      socket.to(`class_${roomId}`).emit('peer-left', {
        socketId: socket.id,
        user
      });
      console.log(`👋 User left classroom: ${roomId}`);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('user-online-status', { userId: socket.userId, status: 'offline' });
      }
      if (socket.roomId && roomParticipants.has(socket.roomId)) {
        roomParticipants.get(socket.roomId).delete(socket.id);
        socket.to(`class_${socket.roomId}`).emit('peer-left', {
          socketId: socket.id,
          user: socket.classroomUser
        });
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
