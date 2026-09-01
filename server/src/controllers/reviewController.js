const Review = require('../models/Review');
const TutorProfile = require('../models/TutorProfile');
const Deal = require('../models/Deal');

// @desc    Create a review for a tutor
// @route   POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { tutorId, dealId, rating, comment } = req.body;

    if (!tutorId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Tutor ID and Star Rating (1-5) are required'
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars'
      });
    }

    const review = await Review.create({
      student: req.user.id,
      tutor: tutorId,
      deal: dealId || null,
      rating: numRating,
      comment: comment || '',
      status: 'published'
    });

    // Recalculate tutor's rating average and count
    const allTutorReviews = await Review.find({ tutor: tutorId, status: 'published' });
    const count = allTutorReviews.length;
    const avg = allTutorReviews.reduce((sum, r) => sum + r.rating, 0) / count;

    await TutorProfile.findOneAndUpdate(
      { user: tutorId },
      {
        ratingAverage: Math.round(avg * 10) / 10,
        ratingCount: count
      }
    );

    const populatedReview = await Review.findById(review._id)
      .populate('student', 'name avatar city');

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted successfully.',
      review: populatedReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting review'
    });
  }
};

// @desc    Get published reviews for a tutor
// @route   GET /api/reviews/tutor/:tutorId
exports.getTutorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      tutor: req.params.tutorId,
      status: 'published'
    })
      .populate('student', 'name avatar city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching reviews'
    });
  }
};
