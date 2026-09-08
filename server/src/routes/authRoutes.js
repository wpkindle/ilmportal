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

router.post('/register', register);
router.post('/early-tutor', registerEarlyTutor);
router.post('/early-tutor-register', registerEarlyTutor);
router.post('/verify-otp', verifyOtp);
router.post('/verify-token', verifyToken);
router.get('/verify-token', verifyToken);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.get('/test-email', testEmail);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/request-email-change', protect, requestEmailChange);
router.post('/verify-email-change', protect, verifyEmailChange);
router.delete('/delete-account', protect, deleteMyAccount);
router.post('/delete-account', protect, deleteMyAccount);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

