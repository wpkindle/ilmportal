const Message = require('../models/Message');
const User = require('../models/User');
const ChatRequest = require('../models/ChatRequest');
const TutorProfile = require('../models/TutorProfile');

const initSocket = (io) => {
  const onlineUsers = new Map(); // userId -> Set of socketIds
  const roomParticipants = new Map(); // roomId -> Set of user socketIds

  io.on('connection', (socket) => {
    console.log(`🔌 Socket client connected: ${socket.id}`);

    // Register user socket & send current online users list
    socket.on('register-user', async (userId) => {
      if (userId) {
        const idStr = userId.toString();
        socket.userId = idStr;
        socket.join(`user_${idStr}`);

        if (!onlineUsers.has(idStr)) {
          onlineUsers.set(idStr, new Set());
        }
        onlineUsers.get(idStr).add(socket.id);
        console.log(`👤 User registered on socket: ${idStr} (${socket.id}) - total connections: ${onlineUsers.get(idStr).size}`);

        // 1. Send all currently online user IDs to the newly connected user
        socket.emit('initial-online-users', Array.from(onlineUsers.keys()));

        // 2. Broadcast to everyone that this user came online
        io.emit('user-online-status', { userId: idStr, status: 'online' });

        // 3. Automatically deliver pending messages sent while this user was away
        try {
          const undeliveredMessages = await Message.find({
            recipient: idStr,
            isDelivered: false
          }).populate('sender', 'name avatar role');

          if (undeliveredMessages.length > 0) {
            await Message.updateMany(
              { recipient: idStr, isDelivered: false },
              { isDelivered: true, deliveredAt: new Date() }
            );

            // Notify each active conversation room and sender socket that messages are now delivered
            const notifiedConversations = new Set();
            undeliveredMessages.forEach((msg) => {
              const cId = msg.conversationId;
              if (!notifiedConversations.has(cId)) {
                notifiedConversations.add(cId);
                io.to(`conv_${cId}`).emit('messages-delivered', {
                  conversationId: cId,
                  recipientId: idStr
                });
                if (msg.sender?._id) {
                  io.to(`user_${msg.sender._id.toString()}`).emit('messages-delivered', {
                    conversationId: cId,
                    recipientId: idStr
                  });
                }
              }
            });

            // Dispatch background notification alert for the returning user
            const senderNames = Array.from(new Set(undeliveredMessages.map(m => m.sender?.name).filter(Boolean)));
            const nameStr = senderNames.length === 1 ? senderNames[0] : `${senderNames[0]} and others`;
            socket.emit('notification-alert', {
              title: `New Messages (${undeliveredMessages.length})`,
              message: `You received ${undeliveredMessages.length} message(s) from ${nameStr} while you were away.`,
              type: 'new_message',
              unreadCount: undeliveredMessages.length
            });
          }
        } catch (err) {
          console.error('Error syncing undelivered messages on register-user:', err);
        }
      }
    });

    // Query online status on-demand for instant UI precision
    socket.on('get-online-status', (userIds, callback) => {
      if (Array.isArray(userIds) && typeof callback === 'function') {
        const statusMap = {};
        userIds.forEach((id) => {
          const idStr = id?.toString();
          statusMap[idStr] = onlineUsers.has(idStr) && onlineUsers.get(idStr).size > 0;
        });
        callback(statusMap);
      }
    });

    // Join 1:1 Chat Conversation Room (Does NOT mark as seen until user actively views)
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
      console.log(`💬 Socket ${socket.id} joined conversation: conv_${conversationId}`);
    });

    // Explicit Mark Messages Seen Event from Client
    socket.on('mark-messages-seen', async ({ conversationId, readerId }) => {
      try {
        const rId = readerId || socket.userId;
        if (!rId || !conversationId) return;

        const updateResult = await Message.updateMany(
          { conversationId, recipient: rId, isRead: false },
          { isRead: true, isDelivered: true, readAt: new Date() }
        );

        if (updateResult.modifiedCount > 0 || true) {
          const seenPayload = {
            conversationId,
            readerId: rId,
            seenAt: new Date()
          };

          // 1. Broadcast to active conversation room (reaches both participants if both in room)
          io.to(`conv_${conversationId}`).emit('messages-seen', seenPayload);

          // 2. Find who sent the unread messages (the other party) and send directly to their user room
          //    This guarantees the "Seen" tick reaches the sender even if they navigated away from conv room
          try {
            const lastMessages = await Message.find(
              { conversationId, recipient: rId },
              { sender: 1 }
            ).limit(5);

            const senderIds = [...new Set(lastMessages.map(m => m.sender?.toString()).filter(Boolean))];
            for (const sId of senderIds) {
              if (sId !== rId) {
                io.to(`user_${sId}`).emit('messages-seen', seenPayload);
                const senderSockets = onlineUsers.get(sId);
                if (senderSockets && senderSockets.size > 0) {
                  for (const sSockId of senderSockets) {
                    io.to(sSockId).emit('messages-seen', seenPayload);
                  }
                }
              }
            }
          } catch (lookupErr) {
            console.warn('Could not lookup sender for seen propagation:', lookupErr.message);
          }
        }

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
        let { conversationId, senderId, recipientId, text, messageType, dealId, dealOfferData, voiceData, voiceDuration } = data;
        
        const recipientIdStr = (recipientId?._id || recipientId)?.toString();
        const senderIdStr = (senderId?._id || senderId)?.toString();

        // Ensure canonical conversationId format (sorted participants)
        if (!conversationId || conversationId.includes('undefined')) {
          conversationId = [senderIdStr, recipientIdStr].sort().join('_');
        }

        // Verify sender and recipient
        const recipientUser = await User.findById(recipientIdStr);
        const senderUser = await User.findById(senderIdStr);

        // Disallow tutor to tutor chat
        if (senderUser?.role === 'tutor' && recipientUser?.role === 'tutor') {
          socket.emit('chat-error', {
            message: 'Tutors cannot message other tutors. Messaging is reserved for student-tutor learning communication.',
            code: 'TUTOR_TO_TUTOR_FORBIDDEN'
          });
          return;
        }

        // Female tutor privacy safeguard
        if (recipientUser && recipientUser.role === 'tutor') {
          const recipientProfile = await TutorProfile.findOne({ user: recipientUser._id });
          const isFemale = recipientUser.gender === 'female' || recipientProfile?.gender === 'female';
          if (isFemale) {
            if (senderUser && senderUser.role === 'student') {
              const acceptedReq = await ChatRequest.findOne({
                student: senderUser._id,
                tutor: recipientUser._id,
                status: 'accepted'
              });
              if (!acceptedReq) {
                socket.emit('chat-error', {
                  message: 'A message request must be accepted by the female tutor before sending messages.',
                  code: 'REQUEST_REQUIRED'
                });
                return;
              }
            }
          }
        }

        const isRecipientOnline = recipientIdStr && onlineUsers.has(recipientIdStr) && onlineUsers.get(recipientIdStr).size > 0;

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

        const recipientRole = populatedMsg.recipient?.role || 'student';
        const targetChatLink = recipientRole === 'tutor' 
          ? `/tutor/messages?conversation=${conversationId}` 
          : `/student/messages?conversation=${conversationId}`;

        const alertPayload = {
          title: `New Message from ${populatedMsg.sender.name}`,
          message: voiceData ? 'Sent a voice message' : (text ? text.slice(0, 70) : 'Sent a course offer'),
          type: 'new_message',
          conversationId,
          senderAvatar: populatedMsg.sender.avatar || '/icon.png',
          link: targetChatLink
        };

        // 1. Broadcast to active conversation room
        io.to(`conv_${conversationId}`).emit('new-message', populatedMsg);

        // Also broadcast to alternate canonical conversation room if needed
        const altConvId = [recipientIdStr, senderIdStr].sort().join('_');
        if (altConvId !== conversationId) {
          io.to(`conv_${altConvId}`).emit('new-message', populatedMsg);
        }

        // 2. Guarantee sender's own socket & user room receives the populated message
        socket.emit('new-message', populatedMsg);
        if (senderIdStr) {
          io.to(`user_${senderIdStr}`).emit('new-message', populatedMsg);
        }

        // 3. Broadcast to recipient's personal user room (for users on dashboard, home, courses, etc.)
        if (recipientIdStr) {
          io.to(`user_${recipientIdStr}`).emit('new-message', populatedMsg);
          io.to(`user_${recipientIdStr}`).emit('notification-alert', alertPayload);

          // Direct socket emission fallback for all active sockets of the recipient
          const directSockets = onlineUsers.get(recipientIdStr);
          if (directSockets && directSockets.size > 0) {
            for (const dsId of directSockets) {
              if (dsId !== socket.id) {
                io.to(dsId).emit('new-message', populatedMsg);
                io.to(dsId).emit('notification-alert', alertPayload);
              }
            }
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
      if (socket.userId && onlineUsers.has(socket.userId)) {
        const userSockets = onlineUsers.get(socket.userId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);
          io.emit('user-online-status', { userId: socket.userId, status: 'offline' });
          console.log(`👤 User went offline: ${socket.userId}`);
        } else {
          console.log(`👤 User socket closed: ${socket.userId} (${userSockets.size} remaining)`);
        }
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
