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

// @desc    Get published articles (public)
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { isPublished: true };

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

    // Increment views atomically
    const article = await Article.findOneAndUpdate(
      { slug: slug.toLowerCase() },
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
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
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
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    await Article.findByIdAndDelete(id);

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

// Seed demo article helper if database has 0 articles
const seedDemoArticleIfEmpty = async (adminUserId = null) => {
  try {
    const count = await Article.countDocuments();
    if (count > 0) return;

    console.log('🌱 Seeding initial demo article by founders...');

    const demoArticle = await Article.create({
      title: 'Building Strong Foundations: Why Camera-Off Learning & Sanad Verification Matter for Pakistani Families',
      slug: 'why-camera-off-learning-and-sanad-verification-matter-pakistan',
      author: 'Abdul Khaliq',
      category: 'Quran & Family Safety',
      excerpt: 'In Pakistani households, educational excellence and Islamic modesty go hand-in-hand. Learn how camera-off default classes and rigorous Sanad verification create the safest learning environment for our children.',
      coverImage: 'https://images.unsplash.com/photo-1584281722572-8873404c0003?w=1200&auto=format&fit=crop&q=80',
      readTime: '6 min read',
      isPublished: true,
      publishedAt: new Date(),
      metaTitle: 'Why Camera-Off Learning & Sanad Verification Matter | IlmiDunya',
      metaDescription: 'Discover how IlmiDunya protects Pakistani student privacy with camera-off video classes and authentic Wafaq-ul-Madaris Sanad verification.',
      tags: ['Quran Education', 'Tajweed', 'Family Privacy', 'Online Learning', 'Pakistan'],
      views: 124,
      createdBy: adminUserId,
      content: `### Bismillah-ir-Rahman-ir-Rahim

The quest for authentic knowledge is a sacred duty for every Muslim family. In our beloved Pakistan, parents have historically invested their utmost energy and finances to ensure their sons and daughters learn the Holy Quran with accurate **Tajweed (مخارج)** and receive top-notch academic guidance.

Yet, over the past decade, as learning moved rapidly onto digital screens, Pakistani families faced unprecedented dilemmas regarding **modesty, privacy, and digital vulnerability**.

---

## 1. The Dignity of Female Learners & Camera-Off Default

For mothers, daughters, and female Quran scholars (Alimahs), appearing on video calls with unknown individuals can be a source of discomfort and anxiety. Many households refrained from online tutoring precisely because generic international platforms force cameras on by default.

### Audio-First & Screen-Share Whiteboard Architecture
Real-time Tajweed correction requires crystal-clear sound, acoustic resonance, and synchronized Quran mushaf viewing, not intrusive video cameras. Tutors listen to the exact articulation point of each letter while sharing high-resolution pages of the Holy Quran.

### Complete Family Privacy in Home Clothes
Every classroom on IlmiDunya starts with video feeds muted and disabled by default. Students can learn in their home clothes in complete dignity, comfort, and peace of mind without worrying about camera angles or background domestic activity.

### Parent-Accessible Transparency
Parents can review trial dates, lesson schedules, and chat logs at any time, eliminating unmonitored private contact and ensuring total accountability.

---

## 2. Why Sanad Verification is Non-Negotiable

Reciting the Holy Quran without authentic **Tajweed** can inadvertently alter the meanings of Divine words. Unfortunately, generic tutor directories allow anyone to claim credentials without presenting authentic institutional certificates.

### Official Institutional Sanad Verification
Before any Quran teacher is approved on IlmiDunya, we cross-reference degrees and certificates from recognized religious boards including:
* **Wifaq-ul-Madaris Al-Arabia Pakistan**
* **Tanzeem-ul-Madaris Ahl-e-Sunnat**
* **Wifaq-ul-Madaris Al-Salafiyyah**
* **HEC Recognized Islamic Universities**

### CNIC & Identity Verification
Every tutor's national identity card (CNIC) is securely validated to maintain an accountable, safe community for Pakistani parents.

### Makharij & Tajweed Assessment
Scholars are assessed for fluency in *Hafs 'an 'Asim* and child-friendly pedagogy before receiving their verified platform badge.

---

## 3. Direct Parental Engagement & The 3-Day Free Trial

Trust is not built on words alone — it is earned through experience. Every student and family on IlmiDunya is entitled to a **3-Day Risk-Free Trial**. 

#### Practical Parent Monitoring Checkpoints
* **Listen to Recitation Pacing**: Ensure the teacher corrects mispronunciations patiently rather than rushing through verses.
* **Observe Child Comfort**: Confirm that your child feels encouraged, respected, and enthusiastic during the session.
* **Agree on Direct Transparent Fees**: Agree upon a fair fee directly with the teacher without agency middlemen taking 40% commissions from hardworking Pakistani educators.

---

## An Initiative Dedicated to Our Children's Future

When Mrs. Abdul Khaliq and I set out to build this platform from Lahore, our intention was singular: to create a trusted space where parents feel as secure as if the teacher were sitting right in their family living room.

May Allah (SWT) bless our children with beneficial knowledge, make them the coolness of our eyes, and grant sincerity to all students and teachers seeking His pleasure.

**— Abdul Khaliq**  
*Co-Founder & Platform Director, IlmiDunya Pakistan*`
    });

    console.log('✅ Demo article seeded successfully:', demoArticle.title);
  } catch (err) {
    console.error('Error seeding demo article:', err);
  }
};

module.exports = {
  getArticles,
  getArticleBySlug,
  getAdminArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  seedDemoArticleIfEmpty
};

