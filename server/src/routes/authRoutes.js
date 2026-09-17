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
  testEmail,
  deleteMyAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { requireRecaptcha } = require('../middleware/recaptchaMiddleware');
const { spamFilter, registrationLimiter } = require('../middleware/spamFilter');

router.post('/register', registrationLimiter, spamFilter, requireRecaptcha, register);
router.post('/early-tutor', registrationLimiter, spamFilter, requireRecaptcha, registerEarlyTutor);
router.post('/early-tutor-register', registrationLimiter, spamFilter, requireRecaptcha, registerEarlyTutor);
router.post('/verify-otp', verifyOtp);
router.post('/verify-token', verifyToken);
router.get('/verify-token', verifyToken);
router.post('/resend-otp', resendOtp);
router.post('/login', requireRecaptcha, login);
router.get('/test-email', testEmail);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/request-email-change', protect, requestEmailChange);
router.post('/verify-email-change', protect, verifyEmailChange);
router.delete('/delete-account', protect, deleteMyAccount);
router.post('/delete-account', protect, deleteMyAccount);
router.post('/forgot-password', requireRecaptcha, forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

