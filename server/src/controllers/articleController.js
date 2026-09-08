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

    let total = await Article.countDocuments(query);
    if (total === 0 && (!req.query.search && (!req.query.status || req.query.status === 'all') && (!req.query.author || req.query.author === 'all'))) {
      await seedAllDefaultArticles(req.user?._id);
      total = await Article.countDocuments(query);
    }

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

// Foundational Editorial Articles for initial database seeding
const DEFAULT_EDITORIAL_ARTICLES = [
  {
    title: 'Building Strong Foundations: Why Camera-Off Learning & Sanad Verification Matter for Pakistani Families',
    slug: 'why-camera-off-learning-and-sanad-verification-matter-pakistan',
    author: 'Abdul Khaliq',
    category: 'Quran & Family Safety',
    excerpt: 'In Pakistani households, educational excellence and Islamic modesty go hand-in-hand. Learn how camera-off default classes and rigorous Sanad verification create the safest learning environment for our children.',
    coverImage: 'https://images.unsplash.com/photo-1584281722572-8873404c0003?w=1200&auto=format&fit=crop&q=80',
    readTime: '6 min read',
    isPublished: true,
    publishedAt: new Date('2026-09-07T09:00:00.000Z'),
    metaTitle: 'Why Camera-Off Learning & Sanad Verification Matter | IlmiDunya Pakistan',
    metaDescription: 'Discover how IlmiDunya protects Pakistani student privacy with camera-off video classes and authentic Wafaq-ul-Madaris Sanad verification.',
    tags: ['Quran Education', 'Tajweed', 'Family Privacy', 'Online Learning', 'Pakistan', 'Child Safety'],
    views: 184,
    content: `The quest for authentic knowledge is a sacred duty for every Muslim family. In our beloved Pakistan, parents have historically invested their utmost energy and finances to ensure their sons and daughters learn the Holy Quran with accurate **Tajweed (مخارج)** and receive top-notch academic guidance.

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
  },
  {
    title: 'Nurturing Confident Daughters: Why Female Quran Tutors (Alimahs) Create Safe Learning Spaces',
    slug: 'nurturing-modesty-female-alimah-education-pakistan',
    author: 'Mrs. Abdul Khaliq',
    category: 'Female Education & Safety',
    excerpt: 'A mother’s perspective on preserving Islamic modesty for our daughters while giving them world-class access to Wafaq-ul-Madaris certified female scholars.',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=1200&auto=format&fit=crop&q=80',
    readTime: '5 min read',
    isPublished: true,
    publishedAt: new Date('2026-09-06T11:00:00.000Z'),
    metaTitle: 'Why Female Quran Tutors (Alimahs) Matter for Daughters | IlmiDunya',
    metaDescription: 'Mrs. Abdul Khaliq shares why certified female Alimahs provide the most nurturing, modest, and empowering environment for young Pakistani girls.',
    tags: ['Female Education', 'Alimah', 'Modesty', 'Child Safety', 'Mothers', 'Pakistan'],
    views: 231,
    content: `As a mother living in Pakistan, nothing brings greater peace of heart than seeing our daughters fall in love with the Holy Quran. Yet, as our daughters grow past early childhood into adolescence, their emotional and spiritual comfort during lessons becomes paramount.

For many young girls, reciting out loud in front of unfamiliar male teachers can feel intimidating. Hesitation creeps in, questions go unasked, and the joy of recitation is replaced with self-consciousness.

---

## 1. The Gentle Mentorship of a Female Alimah

When a young girl learns from a qualified **Alimah (عالمہ)**, the dynamic shifts from rigid formality to warm mentorship:

### Sisterly & Maternal Empathy in Islamic Pedagogy
A female scholar understands the emotional milestones young girls traverse, offering gentle encouragement rather than harsh reprimands. Girls feel safe making mistakes and correcting their Makharij without feeling judged.

### Open Questions on Taharah, Salah & Fiqh
Daughters can comfortably ask essential questions regarding Islamic purification (Taharah), menstruation guidelines in Islam, salah rules, and female life questions that they would never broach with a male teacher.

### Inspiring Role Modeling for Growing Daughters
Seeing an educated Pakistani woman who embodies both Islamic modesty and profound scholarly knowledge inspires our daughters to cherish their own faith, character, and intellect.

---

## 2. Privacy in the Sanctity of the Home

Pakistani homes are sanctuaries of modesty. Our daughters should never be burdened by needing to dress formally or adjust cameras while reciting in their own study bedrooms.

### Comfortable Learning Without Video Exposure
With our default camera-off policy, daughters can sit comfortably without video exposure, focusing entirely on letter pronunciation and heart connection with the Quran.

### Unobtrusive Maternal Supervision
Mothers can listen in seamlessly from the next room or sit alongside their daughters without needing to be camera-ready.

---

## 3. Rigorous Sanad Standards for Female Scholars

Just as with our male Qaris, every Alimah on IlmiDunya holds authentic certifications from *Wifaq-ul-Madaris* or recognized Islamic institutes. We celebrate and honor Pakistan's female scholars by connecting them directly with respectful families who value their dedication.

#### Key Factors Parents Should Look For
* **Wafaq-ul-Madaris Sanad Verification**: Always verify that your daughter's teacher has completed the Dars-e-Nizami curriculum.
* **Child-Centric Patience**: Inquire during the 3-day trial how the teacher handles gentle repetition.
* **Regular Recitation Rhythm**: Strive for 25 to 30 minutes of consistent daily recitation.

Let us nurture our daughters with warmth, dignity, and sacred knowledge.

**— Mrs. Abdul Khaliq**  
*Co-Founder & Female Safety Dean, IlmiDunya Pakistan*`
  },
  {
    title: 'The Art of Tajweed: 5 Common Recitation Mistakes in Pakistani Homes & How to Fix Them',
    slug: 'mastering-tajweed-common-mistakes-pakistani-students',
    author: 'Guest Author',
    category: 'Quran & Tajweed',
    excerpt: 'From confusing ض (Daad) and ظ (Zaa) to rushed Qalqalah, discover how qualified Qaris diagnose and correct common pronunciation errors with patience.',
    coverImage: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=1200&auto=format&fit=crop&q=80',
    readTime: '7 min read',
    isPublished: true,
    publishedAt: new Date('2026-09-05T14:30:00.000Z'),
    metaTitle: '5 Common Tajweed Mistakes in Pakistan & How to Fix Them | IlmiDunya',
    metaDescription: 'Expert Tajweed guide addressing typical Urdu-influenced recitation errors including Makharij confusion, heavy letters, and improper elongation.',
    tags: ['Tajweed', 'Quran Recitation', 'Makharij', 'Tutor Tips', 'Noorani Qaida'],
    views: 168,
    content: `Reciting the Holy Quran with **Tajweed** is not merely an aesthetic embellishment; it is the correct preservation of how the Quran was revealed to Prophet Muhammad (peace and blessings be upon him).

Because our native languages in Pakistan are Urdu, Punjabi, Pashto, or Sindhi, our vocal tracts naturally carry regional phonetic habits. When reciting Arabic, these habits often cause subtle yet critical pronunciation errors.

---

## Five Critical Tajweed Errors Observed in Pakistani Households

### 1. Blurring the Sound of 'Daad' (ض) and 'Zaa' (ظ)
In Urdu, both letters are frequently pronounced with a soft "Z" sound (as in *Zuroorat* or *Zulm*). In classical Quranic Arabic, however:
* **ض (Daad)**: Produced by pressing the lateral side of the tongue against the upper molars. It is unique to Arabic and has a distinct resonance.
* **ظ (Zaa)**: Produced by touching the tip of the tongue to the edges of the upper front teeth.

A certified Qari trains the student's tongue placement step-by-step to prevent confusing words like *Al-Dallin* (الضالين) with *Al-Zallin*.

### 2. Flattening the Heavy Letters (Huruf Musta'liyah)
The seven heavy letters (**خ، ص، ض، غ، ط، ق، ظ**) require raising the back of the tongue toward the soft palate to produce a full, elevated tone (*Tafkheem*). Often, students pronounce:
* **ط (Taa)** like a soft Urdu **ت (Tee)**
* **ق (Qaaf)** like a soft **ک (Kaaf)**

### 3. Inconsistent Madd (Elongation) Lengths
Children often rush through 4-harakah or 6-harakah elongations (*Madd Lazim* or *Madd Muttasil*), or conversely, drag 2-harakah natural Madd (*Madd Asli*) unnecessarily. Using structured Noorani Qaida rhythmic counting, students learn to measure beat intervals accurately.

### 4. Neglecting Qalqalah (Echoing Sound) on Saakin Letters
The five Qalqalah letters (**ق، ط، ب، ج، د**) require a distinct rebounding bounce when carrying a Sukoon. In fast recitation, young students often swallow the sound, resulting in dropped letters.

### 5. Rushing at End-of-Ayah Waqf (Pauses)
Stopping correctly at punctuation marks (*Waqf*) is essential for understanding meaning. Rushing through without stopping causes breathlessness and garbled endings.

---

## How Parents Can Reinforce Tajweed at Home

#### 1. Listen to Recorded Master Reciters
Expose children to slow, clear reciters like Sheikh Mahmoud Khalil Al-Husary (*Mu'allim* version) so their ears internalize authentic Makharij.

#### 2. Consistent Daily Practice Beats Marathon Sessions
25 to 30 minutes daily is vastly superior to an exhaustive 2-hour session once a week.

#### 3. Prioritize Accuracy Over Speed
Celebrate correct letter articulation rather than pressuring children to finish Paras quickly without proper Tajweed rules.

May Allah grant us pure pronunciation and illuminate our homes with the Holy Quran.

**— Contributing Scholar**  
*Guest Educator, IlmiDunya Editorial Board*`
  }
];

// Seed all default articles helper
const seedAllDefaultArticles = async (adminUserId = null) => {
  try {
    console.log('🌱 Checking / Seeding foundational editorial articles...');
    const results = [];

    for (const item of DEFAULT_EDITORIAL_ARTICLES) {
      const existing = await Article.findOne({ slug: item.slug });
      if (!existing) {
        const created = await Article.create({
          ...item,
          createdBy: adminUserId
        });
        results.push(created);
        console.log(`✅ Seeded article: ${created.title}`);
      } else {
        // Ensure published and clean of any previous bismillah
        if (!existing.isPublished || existing.content.includes('Bismillah')) {
          existing.isPublished = true;
          existing.content = item.content;
          await existing.save();
        }
        results.push(existing);
      }
    }

    return results;
  } catch (err) {
    console.error('Error seeding default articles:', err);
    return [];
  }
};

// Backwards compatibility alias
const seedDemoArticleIfEmpty = async (adminUserId = null) => {
  return seedAllDefaultArticles(adminUserId);
};

// @desc    Seed foundational editorial articles into DB
// @route   POST /api/articles/admin/seed-defaults
// @access  Private/Admin
const seedAdminArticles = async (req, res) => {
  try {
    const seeded = await seedAllDefaultArticles(req.user?._id);
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Foundational articles seeded successfully into database',
      count: articles.length,
      articles
    });
  } catch (error) {
    console.error('Error seeding default articles:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to seed articles'
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

