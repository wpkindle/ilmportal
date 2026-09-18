/**
 * Production Sitemap Generator for IlmiDunya Pakistan (https://ilmidunya.com)
 *
 * Generates an ultra-complete, standards-compliant sitemap.xml containing:
 * - Core static pages
 * - Pakistani city landing pages (/tutors/city/:city)
 * - Subject and discipline landing pages (/tutors/subject/:slug and /tutors?category=:slug)
 * - Verified public tutor profiles (/tutors/:id)
 * - Published editorial articles (/articles/:slug)
 * - Active online courses (/courses/:slug)
 *
 * Outputs directly to: client/public/sitemap.xml
 */

const fs = require('fs');
const path = require('path');

let mongoose;
try {
  mongoose = require('mongoose');
} catch (_) {
  mongoose = require(path.join(__dirname, '../server/node_modules/mongoose'));
}

const DEFAULT_MONGODB_URI = 'mongodb://abdulkhaliqwebdeveloper_db_user:pIfVMbVHUwRqrEOY@atlas-27b1a7-shard-00-00.2vvsnhq.mongodb.net:27017,atlas-27b1a7-shard-00-01.2vvsnhq.mongodb.net:27017,atlas-27b1a7-shard-00-02.2vvsnhq.mongodb.net:27017/ilmportal?ssl=true&replicaSet=atlas-27b1a7-shard-0&authSource=admin&retryWrites=true&w=majority';
const BASE_URL = 'https://ilmidunya.com';

const STATIC_ROUTES = [
  { route: '', priority: '1.0', changeFrequency: 'daily' },
  { route: '/tutors', priority: '0.95', changeFrequency: 'daily' },
  { route: '/courses', priority: '0.9', changeFrequency: 'weekly' },
  { route: '/articles', priority: '0.9', changeFrequency: 'daily' },
  { route: '/how-it-works', priority: '0.8', changeFrequency: 'monthly' },
  { route: '/safety', priority: '0.8', changeFrequency: 'monthly' },
  { route: '/about-us', priority: '0.7', changeFrequency: 'monthly' },
  { route: '/contact-us', priority: '0.7', changeFrequency: 'monthly' },
  { route: '/login', priority: '0.6', changeFrequency: 'monthly' },
  { route: '/register/tutor', priority: '0.7', changeFrequency: 'monthly' },
  { route: '/register/student', priority: '0.7', changeFrequency: 'monthly' },
  { route: '/privacy-policy', priority: '0.4', changeFrequency: 'yearly' },
  { route: '/terms', priority: '0.4', changeFrequency: 'yearly' },
  { route: '/disclaimer', priority: '0.4', changeFrequency: 'yearly' }
];

const MAJOR_CITIES = [
  'lahore',
  'karachi',
  'islamabad',
  'rawalpindi',
  'faisalabad',
  'multan',
  'peshawar',
  'quetta',
  'gujranwala',
  'sialkot',
  'sargodha',
  'bahawalpur',
  'hyderabad',
  'sukkur',
  'abbottabad',
  'mardan',
  'gujrat',
  'jhelum',
  'sahiwal',
  'sheikhupura',
  'rahim-yar-khan',
  'muzaffarabad',
  'mirpur',
  'gilgit',
  'skardu',
  'okara',
  'kasur',
  'dera-ghazi-khan',
  'swat',
  'mingora',
  'turbat',
  'gwadar',
  'khuzdar',
  'mansehra',
  'attock',
  'jhang',
  'wah-cantt',
  'taxila',
  'mianwali'
];

const PLATFORM_SUBJECTS = [
  'tajweed-al-quran',
  'nazra-quran',
  'hifz-al-quran',
  'quran-translation-tafseer',
  'noorani-qaida',
  'islamic-studies-fiqh',
  'arabic-grammar-spoken',
  'matric-ssc-science',
  'fsc-hssc',
  'fsc-pre-engineering',
  'o-level-cambridge',
  'a-level-cambridge',
  'computer-science-coding',
  'spoken-english-ielts',
  'primary-school-1-to-5',
  'middle-school-academic',
  'political-science',
  'civics',
  'pakistan-ideology',
  'constitution-law',
  'board-exam-prep',
  'entry-test-prep',
  'hifz-ul-quran-specialist'
];

const formatDate = (date) => {
  try {
    const d = date ? new Date(date) : new Date();
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  } catch (_) {
    return new Date().toISOString().split('T')[0];
  }
};

const escapeXml = (unsafe) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
};

async function generateSitemap() {
  console.log('🚀 Starting IlmiDunya Sitemap Generator...');
  const today = formatDate(new Date());

  const urls = [];

  // 1. Core Static Landing Pages
  for (const s of STATIC_ROUTES) {
    urls.push({
      loc: `${BASE_URL}${s.route}`,
      lastmod: today,
      changefreq: s.changeFrequency,
      priority: s.priority
    });
  }

  // 2. Major Pakistani Cities for In-Person & Online Tutoring
  for (const city of MAJOR_CITIES) {
    urls.push({
      loc: `${BASE_URL}/tutors/city/${city}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.85'
    });
  }

  // 3. Subject-Specific Landing Pages
  for (const subject of PLATFORM_SUBJECTS) {
    urls.push({
      loc: `${BASE_URL}/tutors/subject/${subject}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.85'
    });
    urls.push({
      loc: `${BASE_URL}/tutors?category=${subject}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.80'
    });
  }

  // 4. Query Dynamic Content from Database
  let dbConnected = false;
  try {
    const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
    console.log('📡 Connecting to MongoDB Atlas cluster...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    dbConnected = true;
    console.log('✅ Connected to database.');

    // Require models safely
    require('../server/src/models/User');
    const TutorProfile = require('../server/src/models/TutorProfile');
    const Article = require('../server/src/models/Article');
    const Course = require('../server/src/models/Course');
    const Category = require('../server/src/models/Category');

    // Fetch approved tutors
    const approvedTutors = await TutorProfile.find({
      verificationStatus: 'approved'
    }).select('_id updatedAt');

    console.log(`👨‍🏫 Found ${approvedTutors.length} approved tutors.`);
    for (const t of approvedTutors) {
      urls.push({
        loc: `${BASE_URL}/tutors/${t._id}`,
        lastmod: formatDate(t.updatedAt),
        changefreq: 'weekly',
        priority: '0.80'
      });
    }

    // Fetch published articles
    const articles = await Article.find({
      isPublished: true
    }).select('slug updatedAt publishedAt');

    console.log(`📰 Found ${articles.length} published articles.`);
    for (const a of articles) {
      urls.push({
        loc: `${BASE_URL}/articles/${a.slug}`,
        lastmod: formatDate(a.updatedAt || a.publishedAt),
        changefreq: 'weekly',
        priority: '0.80'
      });
    }

    // Fetch active courses
    const courses = await Course.find({
      isActive: true
    }).select('slug updatedAt');

    console.log(`🎓 Found ${courses.length} active courses.`);
    for (const c of courses) {
      urls.push({
        loc: `${BASE_URL}/courses/${c.slug}`,
        lastmod: formatDate(c.updatedAt),
        changefreq: 'weekly',
        priority: '0.80'
      });
    }

    // Fetch dynamic categories if any are new
    const categories = await Category.find().select('slug');
    for (const cat of categories) {
      if (cat.slug && !PLATFORM_SUBJECTS.includes(cat.slug)) {
        urls.push({
          loc: `${BASE_URL}/tutors/subject/${cat.slug}`,
          lastmod: today,
          changefreq: 'weekly',
          priority: '0.85'
        });
      }
    }
  } catch (dbErr) {
    console.warn('⚠️ Could not fetch dynamic entities from DB:', dbErr.message);
  } finally {
    if (dbConnected) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from database.');
    }
  }

  // Generate XML structure
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

  for (const item of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(item.loc)}</loc>\n`;
    xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';

  // Target paths
  const clientPublicDir = path.join(__dirname, '../client/public');
  if (!fs.existsSync(clientPublicDir)) {
    fs.mkdirSync(clientPublicDir, { recursive: true });
  }

  const sitemapXmlPath = path.join(clientPublicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapXmlPath, xml, 'utf8');

  console.log(`\n🎉 Successfully generated sitemap with ${urls.length} URLs!`);
  console.log(`📁 File written to: ${sitemapXmlPath}`);
  console.log('📊 Breakdown:');
  console.log(`   - Static core pages: ${STATIC_ROUTES.length}`);
  console.log(`   - Major cities: ${MAJOR_CITIES.length}`);
  console.log(`   - Subject/Category routes: ${PLATFORM_SUBJECTS.length * 2}`);
  console.log(`   - Total URLs: ${urls.length}\n`);

  return urls.length;
}

if (require.main === module) {
  generateSitemap()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Sitemap generation failed:', err);
      process.exit(1);
    });
}

module.exports = generateSitemap;
