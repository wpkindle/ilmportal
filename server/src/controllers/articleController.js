const mongoose = require('mongoose');
const Article = require('../models/Article');

// Helper to generate URL-safe slug from title
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper to estimate read time
const estimateReadTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = (content || '').trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${minutes} min read`;
};

const DEMO_SLUGS = [
  'why-camera-off-learning-and-sanad-verification-matter-pakistan',
  'nurturing-modesty-female-alimah-education-pakistan',
  'mastering-tajweed-common-mistakes-pakistani-students'
];

// @desc    Get published articles (public)
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { isPublished: true, slug: { $nin: DEMO_SLUGS } };

    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    if (req.query.author && req.query.author !== 'all') {
      query.author = req.query.author;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { category: searchRegex },
        { tags: searchRegex }
      ];
    }

    const total = await Article.countDocuments(query);
    const articles = await Article.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content'); // Exclude full content for lightweight listing

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      articles
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve articles'
    });
  }
};

// @desc    Get single article by slug (public)
// @route   GET /api/articles/:slug
// @access  Public
const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cleanSlug = (slug || '').toLowerCase();

    if (DEMO_SLUGS.includes(cleanSlug)) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Increment views atomically
    const article = await Article.findOneAndUpdate(
      { slug: cleanSlug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Related articles in same category or latest
    const relatedArticles = await Article.find({
      _id: { $ne: article._id },
      isPublished: true,
      category: article.category
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug excerpt coverImage author category readTime publishedAt');

    res.status(200).json({
      success: true,
      article,
      relatedArticles
    });
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve article'
    });
  }
};

// @desc    Get all articles for Admin (including drafts)
// @route   GET /api/articles/admin/all
// @access  Private/Admin
const getAdminArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.status === 'published') {
      query.isPublished = true;
    } else if (req.query.status === 'draft') {
      query.isPublished = false;
    }

    if (req.query.author && req.query.author !== 'all') {
      query.author = req.query.author;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { category: searchRegex }
      ];
    }

    query.slug = { $nin: DEMO_SLUGS };

    const total = await Article.countDocuments(query);

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      articles
    });
  } catch (error) {
    console.error('Error fetching admin articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin articles'
    });
  }
};

// @desc    Create new article
// @route   POST /api/articles
// @access  Private/Admin
const createArticle = async (req, res) => {
  try {
    const {
      title,
      slug: customSlug,
      content,
      excerpt,
      coverImage,
      author,
      category,
      tags,
      readTime,
      isPublished,
      metaTitle,
      metaDescription
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Validate Author choice (strictly one of the 3 specified)
    const validAuthors = ['Abdul Khaliq', 'Mrs. Abdul Khaliq', 'Guest Author'];
    const chosenAuthor = validAuthors.includes(author) ? author : 'Abdul Khaliq';

    // Generate unique slug
    let baseSlug = customSlug ? slugify(customSlug) : slugify(title);
    if (!baseSlug) baseSlug = `article-${Date.now()}`;

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Article.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const calculatedReadTime = readTime?.trim() || estimateReadTime(content);

    const article = await Article.create({
      title: title.trim(),
      slug: uniqueSlug,
      content,
      excerpt: excerpt?.trim() || '',
      coverImage: coverImage?.trim() || '',
      author: chosenAuthor,
      category: category?.trim() || 'Quran & Islamic Education',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      readTime: calculatedReadTime,
      isPublished: isPublished !== undefined ? isPublished : true,
      publishedAt: isPublished ? new Date() : null,
      metaTitle: metaTitle?.trim() || title.trim(),
      metaDescription: metaDescription?.trim() || excerpt?.trim() || '',
      createdBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      article
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create article'
    });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private/Admin
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    let article;
    if (mongoose.Types.ObjectId.isValid(id)) {
      article = await Article.findById(id);
    }
    if (!article && req.body.slug) {
      article = await Article.findOne({ slug: req.body.slug });
    }

    const {
      title,
      slug: customSlug,
      content,
      excerpt,
      coverImage,
      author,
      category,
      tags,
      readTime,
      isPublished,
      metaTitle,
      metaDescription
    } = req.body;

    if (!article) {
      // If updating an article that was loaded from fallback, save it directly as a new DB document
      const validAuthors = ['Abdul Khaliq', 'Mrs. Abdul Khaliq', 'Guest Author'];
      const chosenAuthor = validAuthors.includes(author) ? author : 'Abdul Khaliq';
      let baseSlug = customSlug ? slugify(customSlug) : slugify(title || 'article');
      if (!baseSlug) baseSlug = `article-${Date.now()}`;

      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await Article.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      const newArticle = await Article.create({
        title: (title || 'Untitled Article').trim(),
        slug: uniqueSlug,
        content: content || '',
        excerpt: excerpt?.trim() || '',
        coverImage: coverImage?.trim() || '',
        author: chosenAuthor,
        category: category?.trim() || 'Quran & Islamic Education',
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
        readTime: readTime?.trim() || estimateReadTime(content || ''),
        isPublished: isPublished !== undefined ? isPublished : true,
        publishedAt: isPublished ? new Date() : null,
        metaTitle: metaTitle?.trim() || title?.trim() || '',
        metaDescription: metaDescription?.trim() || excerpt?.trim() || '',
        createdBy: req.user?._id
      });

      return res.status(200).json({
        success: true,
        message: 'Article saved to database successfully',
        article: newArticle
      });
    }

    if (title) article.title = title.trim();
    if (content) {
      article.content = content;
      if (!readTime) {
        article.readTime = estimateReadTime(content);
      }
    }
    if (readTime) article.readTime = readTime.trim();
    if (excerpt !== undefined) article.excerpt = excerpt.trim();
    if (coverImage !== undefined) article.coverImage = coverImage.trim();

    // Check author
    if (author) {
      const validAuthors = ['Abdul Khaliq', 'Mrs. Abdul Khaliq', 'Guest Author'];
      if (validAuthors.includes(author)) {
        article.author = author;
      }
    }

    if (category) article.category = category.trim();
    if (tags !== undefined) {
      article.tags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    }

    if (customSlug && customSlug !== article.slug) {
      let newSlug = slugify(customSlug);
      const existing = await Article.findOne({ slug: newSlug, _id: { $ne: article._id } });
      if (existing) {
        newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      }
      article.slug = newSlug;
    }

    if (isPublished !== undefined) {
      if (!article.isPublished && isPublished) {
        article.publishedAt = new Date();
      }
      article.isPublished = isPublished;
    }

    if (metaTitle !== undefined) article.metaTitle = metaTitle.trim();
    if (metaDescription !== undefined) article.metaDescription = metaDescription.trim();

    await article.save();

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      article
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update article'
    });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private/Admin
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    let article;
    if (mongoose.Types.ObjectId.isValid(id)) {
      article = await Article.findById(id);
    }
    if (!article && req.query.slug) {
      article = await Article.findOne({ slug: req.query.slug });
    }

    if (!article) {
      return res.status(200).json({
        success: true,
        message: 'Article removed successfully'
      });
    }

    await Article.findByIdAndDelete(article._id);

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete article'
    });
  }
};

// Default demo articles removed - Articles section is set to Coming Soon
const DEFAULT_EDITORIAL_ARTICLES = [];

// Helper to purge demo articles if any exist
const seedAllDefaultArticles = async (adminUserId = null) => {
  try {
    await Article.deleteMany({ slug: { $in: DEMO_SLUGS } });
  } catch (err) {}
  return [];
};

// Backwards compatibility alias
const seedDemoArticleIfEmpty = async (adminUserId = null) => {
  return seedAllDefaultArticles(adminUserId);
};

// @desc    Purge demo articles from DB
// @route   POST /api/articles/admin/seed-defaults
// @access  Private/Admin
const seedAdminArticles = async (req, res) => {
  try {
    await Article.deleteMany({ slug: { $in: DEMO_SLUGS } });
    const articles = await Article.find({ slug: { $nin: DEMO_SLUGS } }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Demo articles cleared. Articles section is set to Coming Soon.",
      count: articles.length,
      articles
    });
  } catch (error) {
    console.error("Error clearing demo articles:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to clear demo articles"
    });
  }
};

// @desc    Upload featured image for an article
// @route   POST /api/articles/admin/upload-image
// @access  Private/Admin
const uploadArticleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please select an image.'
      });
    }

    let imageUrl = '';

    // 1. Upload to Cloudinary if configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const { cloudinary } = require('../config/cloudinary');
        imageUrl = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'ilmportal/articles',
              resource_type: 'image',
              transformation: [{ quality: 'auto', fetch_format: 'auto' }]
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          stream.end(req.file.buffer);
        });
      } catch (cloudErr) {
        console.warn('Cloudinary upload error, falling back to local storage:', cloudErr);
      }
    }

    // 2. Local fallback to uploads directory
    if (!imageUrl) {
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const ext = path.extname(req.file.originalname || '.jpg').toLowerCase() || '.jpg';
      const cleanName = path.basename(req.file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
      const filename = `featured-${Date.now()}-${cleanName}${ext}`;
      const filepath = path.join(uploadsDir, filename);

      fs.writeFileSync(filepath, req.file.buffer);

      const host = req.get('host');
      const protocol = req.protocol || 'https';
      imageUrl = host ? `${protocol}://${host}/uploads/${filename}` : `/uploads/${filename}`;
    }

    res.status(200).json({
      success: true,
      message: 'Feature image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Error uploading article feature image:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload feature image'
    });
  }
};

module.exports = {
  getArticles,
  getArticleBySlug,
  getAdminArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  seedAdminArticles,
  seedAllDefaultArticles,
  seedDemoArticleIfEmpty,
  uploadArticleImage
};

