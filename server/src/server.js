const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');
const initSocket = require('./socket/socketHandler');
const seedDatabase = require('./utils/seedData');
const User = require('./models/User');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Attach socket handler
initSocket(io, app);
app.set('io', io);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tutors', require('./routes/tutorRoutes'));
app.use('/api/deals', require('./routes/dealRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/cms', require('./routes/cmsRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/support-chat', require('./routes/supportRoutes'));
app.use('/api/emails', require('./routes/emailRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/payment-requests', require('./routes/paymentRequestRoutes'));

// Root status endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    project: 'Pakistan-Wide Quran & Academic Tutoring LMS Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      tutors: '/api/tutors',
      courses: '/api/courses',
      deals: '/api/deals',
      reports: '/api/reports'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    message: 'IlmiDunya Pakistan LMS API is running smoothly'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    if (process.env.NODE_ENV !== 'test') {
      // Auto-seed only when explicitly requested (disabled by default in live/production)
      if (process.env.AUTO_SEED === 'true') {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          console.log('Database empty and AUTO_SEED=true. Running Pakistan initial seed...');
          await seedDatabase();
        }
      }

      // Clear legacy unintended default city/gender for accounts registered without them
      try {
        await User.updateMany(
          { role: { $ne: 'admin' }, age: { $exists: false }, avatar: { $in: ['', null] }, city: 'Lahore' },
          { $set: { city: '' } }
        );
        await User.updateMany(
          { role: { $ne: 'admin' }, age: { $exists: false }, avatar: { $in: ['', null] }, gender: 'male' },
          { $set: { gender: '' } }
        );
      } catch (cleanupErr) {
        console.warn('Profile defaults cleanup note:', cleanupErr.message);
      }

      // Ensure verified faculty have authoritative cultural portraits
      try {
        await User.updateMany(
          { $or: [{ name: { $regex: /huzaifa/i } }, { email: 'qari.huzaifa@example.com' }] },
          { $set: { avatar: '/images/tutors/qari-huzaifa.jpg' } }
        );
        await User.updateMany(
          { $or: [{ name: { $regex: /fatima|zahra/i } }, { email: 'alimah.fatima@example.com' }] },
          { $set: { avatar: '/images/tutors/alimah-fatima.jpg' } }
        );
        await User.updateMany(
          { $or: [{ name: { $regex: /abdul r[ea]hman/i } }, { email: 'abdul.rahman@example.com' }] },
          { $set: { avatar: '/images/tutors/ustadh-abdul-rehman.jpg' } }
        );
        await User.updateMany(
          { $or: [{ name: { $regex: /ayesha/i } }, { email: 'dr.ayesha@example.com' }] },
          { $set: { avatar: '/images/dr-ayesha.jpg' } }
        );
      } catch (avatarErr) {
        console.warn('Portraits sync note:', avatarErr.message);
      }

      // Ensure demo article exists
      try {
        const { seedDemoArticleIfEmpty } = require('./controllers/articleController');
        await seedDemoArticleIfEmpty();
      } catch (articleSeedErr) {
        console.warn('Article seed note:', articleSeedErr.message);
      }

      // Sync contact-us CMS page (remove phone/address/office, add guest author content)
      try {
        const Page = require('./models/Page');
        const defaultPages = require('./utils/defaultPages');
        if (defaultPages['contact-us']) {
          await Page.updateOne(
            { slug: 'contact-us' },
            {
              $set: {
                title: defaultPages['contact-us'].title,
                subtitle: defaultPages['contact-us'].subtitle,
                metaDescription: defaultPages['contact-us'].metaDescription,
                content: defaultPages['contact-us'].content,
                'contactDetails.email': 'info@ilmidunya.com',
                'contactDetails.phone': '',
                'contactDetails.whatsapp': '',
                'contactDetails.address': '',
                'contactDetails.workingHours': ''
              }
            }
          );
        }
      } catch (contactSyncErr) {
        console.warn('Contact page sync note:', contactSyncErr.message);
      }

      // Ensure academic categories exist in database
      try {
        const Category = require('./models/Category');
        const categoriesToEnsure = [
          {
            name: 'Primary School (Class 1 to 5)',
            slug: 'primary-school-1-to-5',
            type: 'academic',
            icon: 'Users',
            description: 'Foundational learning for young learners in English, Urdu, Basic Mathematics, General Science, and daily schoolwork guidance.',
            subtopics: ['Class 1 to 5 All Subjects', 'Primary English Phonics', 'Urdu Reading & Writing', 'Basic Math & Tables', 'General Science & Social Studies']
          },
          {
            name: 'Middle School (Class 6 to 8)',
            slug: 'middle-school-academic',
            type: 'academic',
            icon: 'GraduationCap',
            description: 'Structured coaching for Grade 6, 7, and 8 students in Mathematics, General Science, English Grammar, Urdu, and Social Studies.',
            subtopics: ['Class 6 All Subjects', 'Class 7 All Subjects', 'Class 8 All Subjects', 'Middle School Math (Class 6-8)', 'General Science (Class 6-8)', 'English Grammar & Comprehension']
          },
          {
            name: 'Political Science',
            slug: 'political-science',
            type: 'academic',
            icon: 'Landmark',
            description: 'In-depth tutoring in Political Theory, Western & Islamic Political Thought, Comparative Politics, International Relations, and Government of Pakistan.',
            subtopics: ['Political Theory & State Concepts', 'Comparative Politics & Systems', 'Western & Islamic Political Philosophy', 'Constitution & Politics of Pakistan', 'International Relations']
          },
          {
            name: 'Civics',
            slug: 'civics',
            type: 'academic',
            icon: 'ShieldCheck',
            description: 'Civics education for Matric, Intermediate, and College students: citizenship rights, civic duties, state organs, and public administration.',
            subtopics: ['Civics (Class 9 & 10 Matric)', 'Civics (FA Intermediate Part 1 & 2)', 'Citizenship, Rights & Responsibilities', 'State Organs & Local Government', 'Social Ethics & Public Administration']
          },
          {
            name: 'Pakistan Ideology & Studies',
            slug: 'pakistan-ideology',
            type: 'academic',
            icon: 'Compass',
            description: 'Nazria-e-Pakistan (Pakistan Ideology), Two-Nation Theory, freedom struggle, teachings of Allama Iqbal and Quaid-e-Azam, and compulsory Pakistan Studies for all boards.',
            subtopics: ['Nazria-e-Pakistan (Pakistan Ideology)', 'Two-Nation Theory & Historical Evolution', 'Vision of Quaid-e-Azam & Allama Iqbal', 'Pakistan Movement (1857-1947)', 'Pakistan Studies (Matric, FSc & Degree)']
          },
          {
            name: 'Constitution & Constitutional Law',
            slug: 'constitution-law',
            type: 'academic',
            icon: 'Scale',
            description: 'Comprehensive study of the 1973 Constitution of Pakistan, Constitutional History, Fundamental Rights, Parliament, Judiciary, and Legal Systems for academia, CSS, PMS & LLB.',
            subtopics: ['1973 Constitution of Pakistan', 'Fundamental Rights & Principles of Policy', 'Parliament, Senate & Federal Executive', 'Supreme Court, High Courts & Judicial System', 'Constitutional Amendments & History']
          }
        ];

        for (const cat of categoriesToEnsure) {
          await Category.findOneAndUpdate(
            { slug: cat.slug },
            {
              $setOnInsert: {
                name: cat.name,
                slug: cat.slug,
                type: cat.type,
                icon: cat.icon,
                description: cat.description,
                subtopics: cat.subtopics
              },
              $set: { isActive: true }
            },
            { upsert: true, new: true }
          );
        }
      } catch (catErr) {
        console.warn('Academic categories sync note:', catErr.message);
      }

      // Synchronize genuine review counts and ratings for all tutor profiles (strip fake/stale reviews)
      try {
        const TutorProfile = require('./models/TutorProfile');
        const Review = require('./models/Review');
        const tutorProfiles = await TutorProfile.find({});
        for (const tp of tutorProfiles) {
          const uId = tp.user?._id || tp.user?.id || tp.user;
          const publishedReviews = await Review.find({
            $or: [
              { tutor: uId },
              { targetUser: uId }
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
          });
          const realCount = publishedReviews.length;
          const realAvg = realCount > 0
            ? Math.round((publishedReviews.reduce((sum, r) => sum + r.rating, 0) / realCount) * 10) / 10
            : 0;

          if (tp.ratingCount !== realCount || tp.ratingAverage !== realAvg) {
            tp.ratingCount = realCount;
            tp.ratingAverage = realAvg;
            await tp.save();
          }
        }
        console.log('✅ Genuine review metrics synchronized for all faculty profiles.');
      } catch (revSyncErr) {
        console.warn('Review metrics sync note:', revSyncErr.message);
      }

      server.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is currently in use. Exiting for clean supervisor restart...`);
          process.exit(1);
        } else {
          console.error('Server error:', e);
        }
      });

      server.listen(PORT, '0.0.0.0', () => {
        console.log(`\n======================================================`);
        console.log(`🚀 IlmiDunya Pakistan LMS Backend running on http://0.0.0.0:${PORT}`);
        console.log(`📡 WebSocket server initialized`);
        console.log(`🔗 API Base URL: http://127.0.0.1:${PORT}/api`);
        console.log(`======================================================\n`);
      });
    }
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

const gracefulShutdown = async (signal) => {
  try {
    if (server && server.listening) {
      server.close();
    }
    await disconnectDB();
  } catch (e) {
    // ignore
  } finally {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGUSR2', async () => {
  try {
    if (server && server.listening) {
      server.close();
    }
    await disconnectDB();
  } catch (e) {}
  process.kill(process.pid, 'SIGUSR2');
});

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, server, startServer };
