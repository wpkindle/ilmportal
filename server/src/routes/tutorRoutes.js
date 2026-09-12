const express = require('express');
const router = express.Router();
const {
  getPublicTutors,
  getTutorById,
  getMyTutorProfile,
  updateMyTutorProfile,
  uploadSanad,
  uploadVideoIntro,
  getMyPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  setPreferredAccountChoice
} = require('../controllers/tutorController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const videoUpload = require('../middleware/videoUploadMiddleware');

router.get('/', getPublicTutors);
router.get('/profile/me', protect, authorize('tutor'), getMyTutorProfile);
router.put('/profile/me', protect, authorize('tutor'), updateMyTutorProfile);
router.post('/sanad/upload', protect, authorize('tutor'), upload.single('sanad'), uploadSanad);
router.post('/video-intro/upload', protect, authorize('tutor'), videoUpload.single('video'), uploadVideoIntro);

// Tutor Payment Methods
router.get('/payment-methods', protect, authorize('tutor'), getMyPaymentMethods);
router.post('/payment-methods', protect, authorize('tutor'), addPaymentMethod);
router.patch('/payment-methods/preference', protect, authorize('tutor'), setPreferredAccountChoice);
router.put('/payment-methods/:id', protect, authorize('tutor'), updatePaymentMethod);
router.delete('/payment-methods/:id', protect, authorize('tutor'), deletePaymentMethod);
router.patch('/payment-methods/:id/default', protect, authorize('tutor'), setDefaultPaymentMethod);

router.get('/:id', optionalAuth, getTutorById);

module.exports = router;

