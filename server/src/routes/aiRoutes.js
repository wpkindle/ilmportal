const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limit: 60 inquiries per 15 minutes per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: 'Too many inquiries sent from this IP, please try again in a few minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public / User Chat Endpoints (optionalAuth allows attaching user identity if logged in)
router.post('/chat', aiLimiter, optionalAuth, aiController.chat);
router.post('/human-support', optionalAuth, aiController.requestHumanSupport);
router.get('/health', aiController.health);

// Admin Support Desk Management Endpoints
router.get('/support/sessions', protect, authorize('admin'), aiController.getSupportSessions);
router.get('/support/sessions/:id', protect, authorize('admin'), aiController.getSupportSessionById);
router.post('/support/sessions/:id/join', protect, authorize('admin'), aiController.joinSupportSession);
router.post('/support/sessions/:id/message', protect, authorize('admin'), aiController.sendAdminMessage);
router.post('/support/sessions/:id/resolve', protect, authorize('admin'), aiController.resolveSupportSession);

module.exports = router;
