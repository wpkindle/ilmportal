const Message = require('../models/Message');
const User = require('../models/User');

const initSocket = (io) => {
  const onlineUsers = new Map(); // userId -> socketId
  const roomParticipants = new Map(); // roomId -> Set of user socketIds

  io.on('connection', (socket) => {
    console.log(`🔌 Socket client connected: ${socket.id}`);

    // Register user socket
    socket.on('register-user', (userId) => {
      if (userId) {
        onlineUsers.set(userId.toString(), socket.id);
        socket.userId = userId.toString();
        socket.join(`user_${userId}`);
        console.log(`👤 User registered on socket: ${userId} (${socket.id})`);
        io.emit('user-online-status', { userId, status: 'online' });
      }
    });

    // Join 1:1 Chat Conversation Room
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
      console.log(`💬 Socket ${socket.id} joined conversation: conv_${conversationId}`);
    });

    // Send 1:1 Chat Message
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, senderId, recipientId, text, messageType, dealId, dealOfferData, voiceData, voiceDuration } = data;
        
        const message = await Message.create({
          conversationId,
          sender: senderId,
          recipient: recipientId,
          deal: dealId || null,
          text: text || '',
          messageType: messageType || (voiceData ? 'voice' : 'text'),
          voiceData: voiceData || '',
          voiceDuration: voiceDuration || 0,
          dealOfferData: dealOfferData || undefined
        });

        const populatedMsg = await Message.findById(message._id)
          .populate('sender', 'name avatar role city')
          .populate('recipient', 'name avatar role city')
          .populate('deal');

        // Broadcast to both participants in room
        io.to(`conv_${conversationId}`).emit('new-message', populatedMsg);

        // Also push notification event to recipient's personal room
        io.to(`user_${recipientId}`).emit('notification-alert', {
          title: 'New Message',
          message: `${populatedMsg.sender.name}: ${voiceData ? '🎙️ Sent a voice message' : (text ? text.slice(0, 50) : 'Sent an offer')}`,
          type: 'new_message',
          conversationId
        });
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
    socket.on('webrtc-signal', ({ targetSocketId, signalData, callerInfo }) => {
      io.to(targetSocketId).emit('webrtc-signal-received', {
        callerSocketId: socket.id,
        signalData,
        callerInfo
      });
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
