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
const multer = require('multer');

// Use memory storage so files are available regardless of filesystem (works on Render/ephemeral)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Supported: JPG, PNG, WEBP, GIF, PDF, DOC, DOCX, TXT'), false);
    }
  }
});

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
