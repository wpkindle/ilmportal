/**
 * Production Database Cleanup Script for IlmiDunya LMS
 *
 * Removes all mock/test data:
 * - Deals, payment receipts, trials
 * - Reviews & ratings
 * - Messages, chat requests, support chats, email threads
 * - Classroom sessions
 * - Notifications, reports, audit logs
 * - Test tutor profiles & accounts (role === 'tutor')
 * - Test student accounts (role === 'student')
 * - Dummy courses
 * - Temporary local test uploads
 *
 * Preserves essential platform infrastructure:
 * - Super Admin account (role === 'admin')
 * - Pakistani Locations & Cities
 * - Academic & Quran Categories
 * - CMS Pages & Published Articles
 * - System payment configuration
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { connectDB, disconnectDB } = require('../config/db');

// Import all models
const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const Deal = require('../models/Deal');
const Review = require('../models/Review');
const Message = require('../models/Message');
const ChatRequest = require('../models/ChatRequest');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const SupportSession = require('../models/SupportSession');
const EmailThread = require('../models/EmailThread');
const Course = require('../models/Course');
const AuditLog = require('../models/AuditLog');
const Location = require('../models/Location');
const Category = require('../models/Category');
const Page = require('../models/Page');
const Article = require('../models/Article');
const SystemConfig = require('../models/SystemConfig');
const FAQ = require('../models/FAQ');

const defaultPages = require('../utils/defaultPages');

async function cleanDatabaseForLaunch() {
  console.log('\n======================================================');
  console.log('🚀 ILMIDUNYA LMS — PRODUCTION DATABASE CLEANUP');
  console.log('======================================================\n');

  try {
    await connectDB();
    console.log('📡 Connected to persistent database.');

    // Step 1: Log Before Counts
    console.log('\n📊 [STEP 1] Current Document Counts BEFORE Cleanup:');
    console.log('------------------------------------------------------');
    const beforeCounts = {
      usersTotal: await User.countDocuments(),
      tutors: await User.countDocuments({ role: 'tutor' }),
      students: await User.countDocuments({ role: 'student' }),
      admins: await User.countDocuments({ role: 'admin' }),
      tutorProfiles: await TutorProfile.countDocuments(),
      deals: await Deal.countDocuments(),
      reviews: await Review.countDocuments(),
      messages: await Message.countDocuments(),
      chatRequests: await ChatRequest.countDocuments(),
      sessions: await Session.countDocuments(),
      notifications: await Notification.countDocuments(),
      reports: await Report.countDocuments(),
      supportSessions: await SupportSession.countDocuments(),
      emailThreads: await EmailThread.countDocuments(),
      courses: await Course.countDocuments(),
      auditLogs: await AuditLog.countDocuments(),
      locations: await Location.countDocuments(),
      categories: await Category.countDocuments(),
      pages: await Page.countDocuments(),
      articles: await Article.countDocuments(),
      systemConfigs: await SystemConfig.countDocuments()
    };
    console.table(beforeCounts);

    // Step 2: Delete testing/dummy data
    console.log('\n🧹 [STEP 2] Purging Test & Mock Collections...');

    const deletedDeals = await Deal.deleteMany({});
    console.log(`  - Deleted Deals: ${deletedDeals.deletedCount}`);

    const deletedReviews = await Review.deleteMany({});
    console.log(`  - Deleted Reviews: ${deletedReviews.deletedCount}`);

    const deletedMessages = await Message.deleteMany({});
    console.log(`  - Deleted Messages: ${deletedMessages.deletedCount}`);

    const deletedChatRequests = await ChatRequest.deleteMany({});
    console.log(`  - Deleted Chat Requests: ${deletedChatRequests.deletedCount}`);

    const deletedSessions = await Session.deleteMany({});
    console.log(`  - Deleted Classroom Sessions: ${deletedSessions.deletedCount}`);

    const deletedNotifications = await Notification.deleteMany({});
    console.log(`  - Deleted Notifications: ${deletedNotifications.deletedCount}`);

    const deletedReports = await Report.deleteMany({});
    console.log(`  - Deleted Reports: ${deletedReports.deletedCount}`);

    const deletedSupportSessions = await SupportSession.deleteMany({});
    console.log(`  - Deleted Support Sessions: ${deletedSupportSessions.deletedCount}`);

    const deletedEmailThreads = await EmailThread.deleteMany({});
    console.log(`  - Deleted Email Threads: ${deletedEmailThreads.deletedCount}`);

    const deletedCourses = await Course.deleteMany({});
    console.log(`  - Deleted Courses: ${deletedCourses.deletedCount}`);

    const deletedAuditLogs = await AuditLog.deleteMany({});
    console.log(`  - Deleted Audit Logs: ${deletedAuditLogs.deletedCount}`);

    const deletedTutorProfiles = await TutorProfile.deleteMany({});
    console.log(`  - Deleted Tutor Profiles: ${deletedTutorProfiles.deletedCount}`);

    const deletedUsers = await User.deleteMany({ role: { $in: ['student', 'tutor'] } });
    console.log(`  - Deleted Student & Tutor User Accounts: ${deletedUsers.deletedCount}`);

    // Step 3: Clean temporary test files in uploads folder
    const uploadsDir = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      let removedFiles = 0;
      for (const file of files) {
        if (file.startsWith('video-intro-') || file.startsWith('sanad-') || file.startsWith('test-')) {
          try {
            fs.unlinkSync(path.join(uploadsDir, file));
            removedFiles++;
          } catch (e) {
            console.warn(`Could not remove ${file}:`, e.message);
          }
        }
      }
      console.log(`  - Removed ${removedFiles} temporary test file(s) from uploads directory.`);
    }

    // Step 4: Ensure Super Admin Account Exists
    console.log('\n🛡️ [STEP 3] Verifying Super Admin Account...');
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('  - No admin account found. Creating primary Super Admin...');
      admin = await User.create({
        name: 'IlmiDunya Admin',
        email: process.env.ADMIN_EMAIL || 'admin@ilmidunya.com',
        password: 'Admin@12345',
        role: 'admin',
        isVerified: true,
        city: 'Lahore',
        phone: '+92 300 1234567',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      });
      console.log(`  ✅ Super Admin created: ${admin.email} (Password: Admin@12345)`);
    } else {
      console.log(`  ✅ Verified Super Admin account exists: ${admin.email}`);
    }

    // Step 5: Verify Critical Platform Infrastructure
    console.log('\n🏛️ [STEP 4] Verifying Core Taxonomies & Platform Infrastructure...');

    const locationCount = await Location.countDocuments();
    console.log(`  - Pakistani Locations Count: ${locationCount}`);

    const categoryCount = await Category.countDocuments();
    console.log(`  - Categories & Disciplines Count: ${categoryCount}`);

    // Ensure system config exists
    let systemConfig = await SystemConfig.findOne();
    if (!systemConfig) {
      console.log('  - Creating default SystemConfig...');
      systemConfig = await SystemConfig.create({
        trialDurationDays: 3,
        paymentInstructions: {
          bankName: 'Meezan Bank Limited (Islamic Banking)',
          accountNumber: '01020304050607',
          accountTitle: 'IlmiDunya Education Pvt Ltd',
          iban: 'PK36MEZN0001020304050607',
          jazzcashNumber: '03001234567',
          jazzcashTitle: 'IlmiDunya Online Tutoring',
          easypaisaNumber: '03451234567',
          easypaisaTitle: 'IlmiDunya Online Tutoring',
          instructionsNotes: 'Transfer fee via JazzCash, EasyPaisa, or Online Bank Transfer and submit Transaction ID (TID). Payments verified promptly.'
        },
        platformNotice: 'Welcome to Pakistan’s premier Quran & Academic Tutoring Platform.',
        supportEmail: 'info@ilmidunya.com',
        supportPhone: '+92 300 1234567'
      });
      console.log('  ✅ Seeded System Configuration.');
    } else {
      console.log('  ✅ System Configuration verified.');
    }

    // Ensure CMS Pages exist
    for (const [slug, pageData] of Object.entries(defaultPages)) {
      const existingPage = await Page.findOne({ slug });
      if (!existingPage) {
        await Page.create(pageData);
      }
    }
    console.log('  ✅ CMS Pages verified (Terms, Privacy, About Us, Contact Us, Disclaimer, Safety).');

    // Step 6: Log Final Clean Document Counts
    console.log('\n📊 [STEP 5] Document Counts AFTER Cleanup:');
    console.log('------------------------------------------------------');
    const afterCounts = {
      usersTotal: await User.countDocuments(),
      tutors: await User.countDocuments({ role: 'tutor' }),
      students: await User.countDocuments({ role: 'student' }),
      admins: await User.countDocuments({ role: 'admin' }),
      tutorProfiles: await TutorProfile.countDocuments(),
      deals: await Deal.countDocuments(),
      reviews: await Review.countDocuments(),
      messages: await Message.countDocuments(),
      chatRequests: await ChatRequest.countDocuments(),
      sessions: await Session.countDocuments(),
      notifications: await Notification.countDocuments(),
      reports: await Report.countDocuments(),
      supportSessions: await SupportSession.countDocuments(),
      emailThreads: await EmailThread.countDocuments(),
      courses: await Course.countDocuments(),
      auditLogs: await AuditLog.countDocuments(),
      locations: await Location.countDocuments(),
      categories: await Category.countDocuments(),
      pages: await Page.countDocuments(),
      articles: await Article.countDocuments(),
      systemConfigs: await SystemConfig.countDocuments()
    };
    console.table(afterCounts);

    console.log('\n======================================================');
    console.log('🎉 CLEANUP COMPLETE! Platform is 100% clean and ready for LIVE use.');
    console.log('======================================================\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    if (disconnectDB) {
      await disconnectDB();
    }
    process.exit(0);
  }
}

cleanDatabaseForLaunch();

