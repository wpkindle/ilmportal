const express = require('express');
const router = express.Router();
const {
  getPublicTutors,
  getTutorById,
  getMyTutorProfile,
  updateMyTutorProfile,
  uploadSanad,
  uploadVideoIntro
} = require('../controllers/tutorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const videoUpload = require('../middleware/videoUploadMiddleware');

router.get('/', getPublicTutors);
router.get('/profile/me', protect, authorize('tutor'), getMyTutorProfile);
router.put('/profile/me', protect, authorize('tutor'), updateMyTutorProfile);
router.post('/sanad/upload', protect, authorize('tutor'), upload.single('sanad'), uploadSanad);
router.post('/video-intro/upload', protect, authorize('tutor'), videoUpload.single('video'), uploadVideoIntro);
router.get('/:id', getTutorById);

module.exports = router;

