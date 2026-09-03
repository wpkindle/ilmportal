const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  sendChatInvitationEmail,
  sendChatRequest,
  getChatRequestStatus,
  getChatRequests,
  respondChatRequest,
  getStudentProfileForTutor,
  uploadChatFile
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:conversationId/messages', getMessages);
router.post('/send', sendMessage);
router.post('/upload', upload.single('file'), uploadChatFile);
router.post('/send-invitation-email', sendChatInvitationEmail);

// Chat Request workflow for Female Tutors
router.post('/request', sendChatRequest);
router.get('/request/status/:tutorId', getChatRequestStatus);
router.get('/requests', getChatRequests);
router.put('/request/:requestId/respond', respondChatRequest);

// Student profile inspection for all tutors
router.get('/student-profile/:studentId', getStudentProfileForTutor);

module.exports = router;
