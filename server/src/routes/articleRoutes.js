const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleBySlug,
  getAdminArticles,
  createArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getArticles);

// Admin routes (declared before /:slug to avoid collision)
router.get('/admin/all', protect, authorize('admin'), getAdminArticles);
router.post('/', protect, authorize('admin'), createArticle);
router.put('/:id', protect, authorize('admin'), updateArticle);
router.delete('/:id', protect, authorize('admin'), deleteArticle);

// Public single article route
router.get('/:slug', getArticleBySlug);

module.exports = router;

