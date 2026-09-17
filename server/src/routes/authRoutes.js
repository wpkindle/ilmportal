const express = require('express');
const router = express.Router();
const {
  register,
  registerEarlyTutor,
  verifyOtp,
  verifyToken,
  resendOtp,
  login,
  getMe,
  updateProfile,
  changePassword,
  requestEmailChange,
  verifyEmailChange,
  forgotPassword,
  resetPassword,
  deleteMyAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { requireTurnstile } = require('../middleware/turnstileMiddleware');
const { spamFilter, registrationLimiter } = require('../middleware/spamFilter');

router.post('/register', registrationLimiter, spamFilter, requireTurnstile, register);
router.post('/early-tutor', registrationLimiter, spamFilter, requireTurnstile, registerEarlyTutor);
router.post('/early-tutor-register', registrationLimiter, spamFilter, requireTurnstile, registerEarlyTutor);
router.post('/verify-otp', verifyOtp);
router.post('/verify-token', verifyToken);
router.get('/verify-token', verifyToken);
router.post('/resend-otp', resendOtp);
router.post('/login', requireTurnstile, login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/request-email-change', protect, requestEmailChange);
router.post('/verify-email-change', protect, verifyEmailChange);
router.delete('/delete-account', protect, deleteMyAccount);
router.post('/delete-account', protect, deleteMyAccount);
router.post('/forgot-password', requireTurnstile, forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

