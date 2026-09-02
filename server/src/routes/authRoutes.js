const express = require('express');
const router = express.Router();
const {
  register,
  verifyOtp,
  verifyToken,
  resendOtp,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  testEmail,
  deleteMyAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/verify-token', verifyToken);
router.get('/verify-token', verifyToken);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.get('/test-email', testEmail);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteMyAccount);
router.post('/delete-account', protect, deleteMyAccount);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

