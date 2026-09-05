const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
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

router.post('/chat', aiLimiter, aiController.chat);
router.get('/health', aiController.health);

module.exports = router;

