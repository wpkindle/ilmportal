const Review = require('../models/Review');
const TutorProfile = require('../models/TutorProfile');
const Deal = require('../models/Deal');

// @desc    Create a review (Student reviewing Tutor OR Tutor reviewing Student)
// @route   POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { tutorId, studentId, dealId, rating, comment, quickTags } = req.body;

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

    const reviewerId = req.user.id;
    const reviewerRole = req.user.role; // 'student', 'tutor', or 'admin'

    let dealDoc = null;
    if (dealId) {
      dealDoc = await Deal.findById(dealId);
    }

    let targetUserId = null;
    let targetRole = null;
    let studentUserId = null;
    let tutorUserId = null;

    if (reviewerRole === 'tutor') {
      // Tutor reviewing student
      targetRole = 'student';
      tutorUserId = reviewerId;
      if (studentId) {
        targetUserId = studentId;
      } else if (dealDoc && dealDoc.student) {
        targetUserId = (dealDoc.student._id || dealDoc.student).toString();
      }
      studentUserId = targetUserId;
    } else {
      // Default: Student (or Admin) reviewing tutor
      targetRole = 'tutor';
      studentUserId = reviewerId;
      if (tutorId) {
        targetUserId = tutorId;
      } else if (dealDoc && dealDoc.tutor) {
        targetUserId = (dealDoc.tutor._id || dealDoc.tutor).toString();
      }
      // If targetUserId might be a TutorProfile ID, resolve to underlying User ID
      if (targetUserId) {
        const tutorProfDoc = await TutorProfile.findById(targetUserId);
        if (tutorProfDoc && tutorProfDoc.user) {
          targetUserId = tutorProfDoc.user.toString();
        }
      }
      tutorUserId = targetUserId;
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: `Unable to identify target ${targetRole} for this review`
      });
    }

    // Check if review already exists for this reviewer and deal
    let review = null;
    if (dealId) {
      review = await Review.findOne({
        deal: dealId,
        $or: [
          { reviewer: reviewerId },
          { student: studentUserId, tutor: tutorUserId, reviewerRole: reviewerRole }
        ]
      });
    }

    const tagsArray = Array.isArray(quickTags) ? quickTags : [];

    if (review) {
      review.rating = numRating;
      review.comment = comment ? comment.trim() : '';
      review.quickTags = tagsArray;
      review.status = 'published';
      review.reviewer = reviewerId;
      review.reviewerRole = reviewerRole;
      review.targetUser = targetUserId;
      review.targetRole = targetRole;
      review.student = studentUserId;
      review.tutor = tutorUserId;
      await review.save();
    } else {
      review = await Review.create({
        student: studentUserId,
        tutor: tutorUserId,
        deal: dealId || null,
        reviewer: reviewerId,
        reviewerRole: reviewerRole,
        targetUser: targetUserId,
        targetRole: targetRole,
        rating: numRating,
        comment: comment ? comment.trim() : '',
        quickTags: tagsArray,
        status: 'published'
      });
    }

    // Update Deal document with review pointers
    if (dealId) {
      const updateFields = {};
      if (reviewerRole === 'tutor') {
        updateFields.isTutorReviewed = true;
        updateFields.tutorReview = review._id;
      } else {
        updateFields.isStudentReviewed = true;
        updateFields.isReviewed = true;
        updateFields.studentReview = review._id;
        updateFields.review = review._id;
      }
      await Deal.findByIdAndUpdate(dealId, updateFields);
    }

    let roundedAvg = null;
    let count = null;

    // If tutor was reviewed, recalculate tutor profile rating
    if (targetRole === 'tutor') {
      const allTutorReviews = await Review.find({
        tutor: targetUserId,
        $or: [
          { targetRole: 'tutor' },
          { reviewerRole: 'student' },
          { targetRole: { $exists: false } }
        ],
        status: 'published'
      });
      count = allTutorReviews.length;
      const avg = count > 0 ? (allTutorReviews.reduce((sum, r) => sum + r.rating, 0) / count) : numRating;
      roundedAvg = Math.round(avg * 10) / 10;

      await TutorProfile.findOneAndUpdate(
        { $or: [{ user: targetUserId }, { _id: targetUserId }] },
        {
          ratingAverage: roundedAvg,
          ratingCount: count
        }
      );
    }

    const populatedReview = await Review.findById(review._id)
      .populate('student', 'name avatar city')
      .populate('tutor', 'name avatar city')
      .populate('reviewer', 'name avatar role city')
      .populate('targetUser', 'name avatar role city');

    // Real-time socket alerts
    const io = req.app.get('io');
    if (io) {
      const targetStr = targetUserId.toString();

      io.to(targetStr).emit('review-received', {
        dealId,
        rating: numRating,
        review: populatedReview,
        reviewerRole
      });
      io.to(`user_${targetStr}`).emit('review-received', {
        dealId,
        rating: numRating,
        review: populatedReview,
        reviewerRole
      });

      if (targetRole === 'tutor') {
        io.to(targetStr).emit('tutor-reviewed', {
          dealId,
          rating: numRating,
          ratingAverage: roundedAvg,
          ratingCount: count,
          review: populatedReview
        });
        io.to(`user_${targetStr}`).emit('tutor-reviewed', {
          dealId,
          rating: numRating,
          ratingAverage: roundedAvg,
          ratingCount: count,
          review: populatedReview
        });
      } else {
        io.to(targetStr).emit('student-reviewed', {
          dealId,
          rating: numRating,
          review: populatedReview
        });
        io.to(`user_${targetStr}`).emit('student-reviewed', {
          dealId,
          rating: numRating,
          review: populatedReview
        });
      }

      if (dealId) {
        io.emit('deal-reviewed', {
          dealId,
          reviewerRole,
          isReviewed: true,
          rating: numRating
        });
      }
    }

    res.status(201).json({
      success: true,
      message: reviewerRole === 'tutor'
        ? 'Thank you! Your evaluation of the student has been recorded and published on their profile.'
        : 'Thank you! Your review has been submitted successfully and published on the tutor profile.',
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
        { tutor: req.params.tutorId },
        { targetUser: tutorUserId },
        { targetUser: req.params.tutorId }
      ],
      $and: [
        {
          $or: [
            { targetRole: 'tutor' },
            { reviewerRole: 'student' },
            { targetRole: { $exists: false } }
          ]
        }
      ],
      status: 'published'
    })
      .populate('student', 'name avatar city')
      .populate('reviewer', 'name avatar role city')
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

// @desc    Get published reviews for a student (feedback left by tutors)
// @route   GET /api/reviews/student/:studentId
exports.getStudentReviews = async (req, res) => {
  try {
    const { studentId } = req.params;

    const reviews = await Review.find({
      $or: [
        { student: studentId, reviewerRole: 'tutor' },
        { targetUser: studentId, targetRole: 'student' }
      ],
      status: 'published'
    })
      .populate('tutor', 'name avatar city')
      .populate('reviewer', 'name avatar role city')
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
      message: error.message || 'Error fetching student reviews'
    });
  }
};

// @desc    Get my reviews (both given and received)
// @route   GET /api/reviews/my-reviews
exports.getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch reviews where this user is the reviewer OR the target/student/tutor
    const reviews = await Review.find({
      $or: [
        { reviewer: userId },
        { targetUser: userId },
        userRole === 'student' ? { student: userId } : { tutor: userId }
      ],
      status: 'published'
    })
      .populate('student', 'name avatar city')
      .populate('tutor', 'name avatar city')
      .populate('reviewer', 'name avatar role city')
      .populate('targetUser', 'name avatar role city')
      .populate('deal', 'subject mode price priceUnit')
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
