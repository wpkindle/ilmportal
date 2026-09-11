const Review = require('../models/Review');
const TutorProfile = require('../models/TutorProfile');
const Deal = require('../models/Deal');

// @desc    Create a review for a tutor
// @route   POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { tutorId, dealId, rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: 'Star Rating (1-5) is required'
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars'
      });
    }

    // Resolve target tutor User ID and Deal document
    let targetTutorUserId = tutorId;
    let dealDoc = null;

    if (dealId) {
      dealDoc = await Deal.findById(dealId);
      if (dealDoc && dealDoc.tutor) {
        targetTutorUserId = (dealDoc.tutor._id || dealDoc.tutor).toString();
      }
    }

    // If targetTutorUserId might be a TutorProfile ID, resolve to underlying User ID
    if (targetTutorUserId) {
      const tutorProfDoc = await TutorProfile.findById(targetTutorUserId);
      if (tutorProfDoc && tutorProfDoc.user) {
        targetTutorUserId = tutorProfDoc.user.toString();
      }
    }

    if (!targetTutorUserId) {
      return res.status(400).json({
        success: false,
        message: 'Unable to identify tutor for this review'
      });
    }

    // Check if review already exists for this student and deal
    let review = null;
    if (dealId) {
      review = await Review.findOne({ student: req.user.id, deal: dealId });
    }

    if (review) {
      review.rating = numRating;
      review.comment = comment ? comment.trim() : '';
      review.status = 'published';
      await review.save();
    } else {
      review = await Review.create({
        student: req.user.id,
        tutor: targetTutorUserId,
        deal: dealId || null,
        rating: numRating,
        comment: comment ? comment.trim() : '',
        status: 'published'
      });
    }

    // Mark deal as reviewed
    if (dealId) {
      await Deal.findByIdAndUpdate(dealId, {
        isReviewed: true,
        review: review._id
      });
    }

    // Recalculate tutor's rating average and count across all published reviews
    const allTutorReviews = await Review.find({ tutor: targetTutorUserId, status: 'published' });
    const count = allTutorReviews.length;
    const avg = count > 0 ? (allTutorReviews.reduce((sum, r) => sum + r.rating, 0) / count) : numRating;
    const roundedAvg = Math.round(avg * 10) / 10;

    await TutorProfile.findOneAndUpdate(
      { $or: [{ user: targetTutorUserId }, { _id: targetTutorUserId }] },
      {
        ratingAverage: roundedAvg,
        ratingCount: count
      }
    );

    const populatedReview = await Review.findById(review._id)
      .populate('student', 'name avatar city');

    // Real-time socket alert
    const io = req.app.get('io');
    if (io) {
      const tutorStr = targetTutorUserId.toString();
      io.to(tutorStr).emit('tutor-reviewed', {
        dealId,
        rating: numRating,
        ratingAverage: roundedAvg,
        ratingCount: count,
        review: populatedReview
      });
      io.to(`user_${tutorStr}`).emit('tutor-reviewed', {
        dealId,
        rating: numRating,
        ratingAverage: roundedAvg,
        ratingCount: count,
        review: populatedReview
      });
      if (dealId) {
        io.emit('deal-reviewed', {
          dealId,
          isReviewed: true,
          rating: numRating
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted successfully and published on the tutor profile.',
      review: populatedReview,
      ratingAverage: roundedAvg,
      ratingCount: count
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
    let tutorUserId = req.params.tutorId;

    // Check if parameter is a TutorProfile ID, resolve to user ID
    const tutorProfileDoc = await TutorProfile.findById(tutorUserId);
    if (tutorProfileDoc && tutorProfileDoc.user) {
      tutorUserId = tutorProfileDoc.user.toString();
    }

    const reviews = await Review.find({
      $or: [
        { tutor: tutorUserId },
        { tutor: req.params.tutorId }
      ],
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

// @desc    Get my reviews (for student or tutor)
// @route   GET /api/reviews/my-reviews
exports.getMyReviews = async (req, res) => {
  try {
    const filter = req.user.role === 'student'
      ? { student: req.user.id }
      : { tutor: req.user.id };

    const reviews = await Review.find(filter)
      .populate('student', 'name avatar city')
      .populate('tutor', 'name avatar')
      .populate('deal', 'subject mode')
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
