const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  sendChatInvitationEmail
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:conversationId/messages', getMessages);
router.post('/send', sendMessage);
router.post('/send-invitation-email', sendChatInvitationEmail);

module.exports = router;
