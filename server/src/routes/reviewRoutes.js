const express = require('express');
const router = express.Router();
const {
  createReview,
  getTutorReviews,
  getStudentReviews,
  getMyReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/my-reviews', protect, getMyReviews);
router.get('/tutor/:tutorId', getTutorReviews);
router.get('/student/:studentId', getStudentReviews);
router.post('/', protect, authorize('student', 'tutor', 'admin'), createReview);

module.exports = router;
