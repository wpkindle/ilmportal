const express = require('express');
const router = express.Router();
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

// Public / User Support Endpoints
router.post('/message', supportLimiter, optionalAuth, supportController.sendMessage);
router.get('/session/:sessionId', supportController.getSessionHistory);
router.post('/escalate', optionalAuth, supportController.escalateToHuman);
router.get('/faqs', supportController.getFaqs);

// Admin Knowledge Base (FAQ) Management & Analytics
router.post('/admin/faqs', protect, authorize('admin'), supportController.adminCreateFaq);
router.put('/admin/faqs/:id', protect, authorize('admin'), supportController.adminUpdateFaq);
router.delete('/admin/faqs/:id', protect, authorize('admin'), supportController.adminDeleteFaq);
router.get('/admin/analytics', protect, authorize('admin'), supportController.getSupportAnalytics);

module.exports = router;
