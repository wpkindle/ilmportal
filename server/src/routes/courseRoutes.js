const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseBySlug,
  getMyAuthoredCourses,
  createCourse,
  updateCourse,
  addChapter,
  updateChapter,
  deleteChapter,
  addLesson,
  updateLesson,
  deleteLesson,
  addTest,
  updateTest,
  deleteTest,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  deleteCourse,
  getTutorPublicCourses
} = require('../controllers/courseController');

const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public endpoints
router.get('/', getAllCourses);
router.get('/by-tutor/:tutorUserId', getTutorPublicCourses);

// Tutor protected endpoints (must be before /:slug to prevent slug collision)
router.get('/tutor/my-courses', protect, authorize('tutor', 'admin'), getMyAuthoredCourses);
router.post('/tutor/create', protect, authorize('tutor', 'admin'), createCourse);
router.put('/tutor/:id', protect, authorize('tutor', 'admin'), updateCourse);
router.delete('/tutor/:id', protect, authorize('tutor', 'admin'), deleteCourse);

// Chapter management
router.post('/tutor/:id/chapters', protect, authorize('tutor', 'admin'), addChapter);
router.put('/tutor/:id/chapters/:chapterId', protect, authorize('tutor', 'admin'), updateChapter);
router.delete('/tutor/:id/chapters/:chapterId', protect, authorize('tutor', 'admin'), deleteChapter);

// Lesson management
router.post('/tutor/:id/chapters/:chapterId/lessons', protect, authorize('tutor', 'admin'), addLesson);
router.put('/tutor/:id/chapters/:chapterId/lessons/:lessonId', protect, authorize('tutor', 'admin'), updateLesson);
router.delete('/tutor/:id/chapters/:chapterId/lessons/:lessonId', protect, authorize('tutor', 'admin'), deleteLesson);

// Test management
router.post('/tutor/:id/chapters/:chapterId/tests', protect, authorize('tutor', 'admin'), addTest);
router.put('/tutor/:id/chapters/:chapterId/tests/:testId', protect, authorize('tutor', 'admin'), updateTest);
router.delete('/tutor/:id/chapters/:chapterId/tests/:testId', protect, authorize('tutor', 'admin'), deleteTest);

// Assignment management
router.post('/tutor/:id/chapters/:chapterId/assignments', protect, authorize('tutor', 'admin'), addAssignment);
router.put('/tutor/:id/chapters/:chapterId/assignments/:assignmentId', protect, authorize('tutor', 'admin'), updateAssignment);
router.delete('/tutor/:id/chapters/:chapterId/assignments/:assignmentId', protect, authorize('tutor', 'admin'), deleteAssignment);

// Single course by slug (with optionalAuth for registered user test unlocking)
router.get('/:slug', optionalAuth, getCourseBySlug);

module.exports = router;
