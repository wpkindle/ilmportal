const express = require('express');
const router = express.Router();
const multer = require('multer');
const supportController = require('../controllers/supportController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limit: 60 messages per 15 minutes per IP
const supportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: 'Support chat inquiry limit reached. Please wait a few moments or speak to our team.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Multer configured strictly for PNG, JPG, JPEG, and PDF (Max 10MB)
const supportUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, JPEG, and PDF files are allowed.'), false);
    }
  }
});

// ==========================================
// Public / User Support Endpoints
// ==========================================
router.get('/admin-status', supportController.getAdminOnlineStatus);
router.post('/message', supportLimiter, optionalAuth, supportController.sendMessage);
router.post('/offline-message', supportLimiter, optionalAuth, supportController.leaveOfflineMessage);
router.post('/upload', optionalAuth, supportUpload.single('file'), supportController.uploadSupportFile);
router.get('/session/:sessionId', supportController.getSessionHistory);
router.delete('/session/:sessionId', optionalAuth, supportController.deleteUserSession);
router.post('/escalate', optionalAuth, supportController.escalateToHuman);
router.get('/faqs', supportController.getFaqs);

// ==========================================
// Admin Support Desk Management
// ==========================================
router.get('/admin/sessions', protect, authorize('admin'), supportController.getAdminSessions);
router.get('/admin/sessions/:id', protect, authorize('admin'), supportController.getAdminSession);
router.post('/admin/sessions/:id/join', protect, authorize('admin'), supportController.adminJoinSession);
router.post('/admin/sessions/:id/message', protect, authorize('admin'), supportController.adminSendMessage);
router.post('/admin/sessions/:id/resolve', protect, authorize('admin'), supportController.adminResolveSession);
router.delete('/admin/sessions/:id', protect, authorize('admin'), supportController.adminDeleteSession);

// Admin Knowledge Base (FAQ) Management & Analytics
router.post('/admin/faqs', protect, authorize('admin'), supportController.adminCreateFaq);
router.put('/admin/faqs/:id', protect, authorize('admin'), supportController.adminUpdateFaq);
router.delete('/admin/faqs/:id', protect, authorize('admin'), supportController.adminDeleteFaq);
router.get('/admin/analytics', protect, authorize('admin'), supportController.getSupportAnalytics);

module.exports = router;
