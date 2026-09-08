const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleBySlug,
  getAdminArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  seedAdminArticles,
  uploadArticleImage
} = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const multer = require('multer');

// Memory storage for article featured image uploads (max 10MB)
const articleUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP, GIF) are allowed.'), false);
    }
  }
});

// Public routes
router.get('/', getArticles);

// Admin routes (declared before /:slug to avoid collision)
router.get('/admin/all', protect, authorize('admin'), getAdminArticles);
router.post('/admin/seed-defaults', protect, authorize('admin'), seedAdminArticles);
router.post('/admin/upload-image', protect, authorize('admin'), articleUpload.single('image'), uploadArticleImage);
router.post('/', protect, authorize('admin'), createArticle);
router.put('/:id', protect, authorize('admin'), updateArticle);
router.delete('/:id', protect, authorize('admin'), deleteArticle);

// Public single article route
router.get('/:slug', getArticleBySlug);

module.exports = router;

