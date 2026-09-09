const express = require('express');
const router = express.Router();
const {
  createReview,
  getTutorReviews,
  getMyReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/my-reviews', protect, getMyReviews);
router.get('/tutor/:tutorId', getTutorReviews);
router.post('/', protect, authorize('student'), createReview);

module.exports = router;
