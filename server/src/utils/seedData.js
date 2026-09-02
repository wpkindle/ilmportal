const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');

const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const Category = require('../models/Category');
const Location = require('../models/Location');
const Deal = require('../models/Deal');
const Message = require('../models/Message');
const Review = require('../models/Review');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const SystemConfig = require('../models/SystemConfig');
const AuditLog = require('../models/AuditLog');
const Course = require('../models/Course');
const Certificate = require('../models/Certificate');
const Page = require('../models/Page');
const defaultPages = require('./defaultPages');

dotenv.config();

const locationsData = [
  // Islamabad Capital Territory
  { name: 'Islamabad', province: 'Islamabad Capital Territory', isMajorCity: true },

  // Punjab Major Cities & Districts
  { name: 'Lahore', province: 'Punjab', isMajorCity: true },
  { name: 'Rawalpindi', province: 'Punjab', isMajorCity: true },
  { name: 'Faisalabad', province: 'Punjab', isMajorCity: true },
  { name: 'Multan', province: 'Punjab', isMajorCity: true },
  { name: 'Gujranwala', province: 'Punjab', isMajorCity: true },
  { name: 'Sialkot', province: 'Punjab', isMajorCity: true },
  { name: 'Bahawalpur', province: 'Punjab', isMajorCity: true },
  { name: 'Sargodha', province: 'Punjab', isMajorCity: true },
  { name: 'Gujrat', province: 'Punjab', isMajorCity: false },
  { name: 'Sheikhupura', province: 'Punjab', isMajorCity: false },
  { name: 'Jhelum', province: 'Punjab', isMajorCity: false },
  { name: 'Jhang', province: 'Punjab', isMajorCity: false },
  { name: 'Rahim Yar Khan', province: 'Punjab', isMajorCity: false },
  { name: 'Sahiwal', province: 'Punjab', isMajorCity: false },
  { name: 'Wah Cantt', province: 'Punjab', isMajorCity: false },
  { name: 'Kasur', province: 'Punjab', isMajorCity: false },
  { name: 'Okara', province: 'Punjab', isMajorCity: false },
  { name: 'Dera Ghazi Khan', province: 'Punjab', isMajorCity: false },
  { name: 'Chiniot', province: 'Punjab', isMajorCity: false },
  { name: 'Kamoke', province: 'Punjab', isMajorCity: false },
  { name: 'Mandi Bahauddin', province: 'Punjab', isMajorCity: false },
  { name: 'Sadiqabad', province: 'Punjab', isMajorCity: false },
  { name: 'Khanewal', province: 'Punjab', isMajorCity: false },
  { name: 'Hafizabad', province: 'Punjab', isMajorCity: false },
  { name: 'Muzaffargarh', province: 'Punjab', isMajorCity: false },
  { name: 'Khanpur', province: 'Punjab', isMajorCity: false },
  { name: 'Gojra', province: 'Punjab', isMajorCity: false },
  { name: 'Bahawalnagar', province: 'Punjab', isMajorCity: false },
  { name: 'Muridke', province: 'Punjab', isMajorCity: false },
  { name: 'Pakpattan', province: 'Punjab', isMajorCity: false },
  { name: 'Toba Tek Singh', province: 'Punjab', isMajorCity: false },
  { name: 'Vehari', province: 'Punjab', isMajorCity: false },
  { name: 'Kot Addu', province: 'Punjab', isMajorCity: false },
  { name: 'Wazirabad', province: 'Punjab', isMajorCity: false },
  { name: 'Chakwal', province: 'Punjab', isMajorCity: false },
  { name: 'Mianwali', province: 'Punjab', isMajorCity: false },
  { name: 'Attock', province: 'Punjab', isMajorCity: false },
  { name: 'Lodhran', province: 'Punjab', isMajorCity: false },
  { name: 'Bhakkar', province: 'Punjab', isMajorCity: false },
  { name: 'Layyah', province: 'Punjab', isMajorCity: false },
  { name: 'Khushab', province: 'Punjab', isMajorCity: false },
  { name: 'Narowal', province: 'Punjab', isMajorCity: false },
  { name: 'Rajanpur', province: 'Punjab', isMajorCity: false },
  { name: 'Taxila', province: 'Punjab', isMajorCity: false },
  { name: 'Murree', province: 'Punjab', isMajorCity: false },
  { name: 'Burewala', province: 'Punjab', isMajorCity: false },

  // Sindh Major Cities & Districts
  { name: 'Karachi', province: 'Sindh', isMajorCity: true },
  { name: 'Hyderabad', province: 'Sindh', isMajorCity: true },
  { name: 'Sukkur', province: 'Sindh', isMajorCity: true },
  { name: 'Larkana', province: 'Sindh', isMajorCity: true },
  { name: 'Nawabshah (Shaheed Benazirabad)', province: 'Sindh', isMajorCity: false },
  { name: 'Mirpur Khas', province: 'Sindh', isMajorCity: false },
  { name: 'Jacobabad', province: 'Sindh', isMajorCity: false },
  { name: 'Shikarpur', province: 'Sindh', isMajorCity: false },
  { name: 'Khairpur', province: 'Sindh', isMajorCity: false },
  { name: 'Dadu', province: 'Sindh', isMajorCity: false },
  { name: 'Tando Adam', province: 'Sindh', isMajorCity: false },
  { name: 'Tando Allahyar', province: 'Sindh', isMajorCity: false },
  { name: 'Thatta', province: 'Sindh', isMajorCity: false },
  { name: 'Badin', province: 'Sindh', isMajorCity: false },
  { name: 'Ghotki', province: 'Sindh', isMajorCity: false },
  { name: 'Umerkot', province: 'Sindh', isMajorCity: false },
  { name: 'Kotri', province: 'Sindh', isMajorCity: false },
  { name: 'Kashmore', province: 'Sindh', isMajorCity: false },
  { name: 'Sanghar', province: 'Sindh', isMajorCity: false },

  // Khyber Pakhtunkhwa (KP) Major Cities & Districts
  { name: 'Peshawar', province: 'Khyber Pakhtunkhwa', isMajorCity: true },
  { name: 'Abbottabad', province: 'Khyber Pakhtunkhwa', isMajorCity: true },
  { name: 'Mardan', province: 'Khyber Pakhtunkhwa', isMajorCity: true },
  { name: 'Mingora (Swat)', province: 'Khyber Pakhtunkhwa', isMajorCity: true },
  { name: 'Kohat', province: 'Khyber Pakhtunkhwa', isMajorCity: false },
  { name: 'Dera Ismail Khan', province: 'Khyber Pakhtunkhwa', isMajorCity: false },
  { name: 'Bannu', province: 'Khyber Pakhtunkhwa', isMajorCity: false },
  { name: 'Swabi', province: 'Khyber Pakhtunkhwa', isMajorCity: false },
  { name: 'Charsadda', province: 'Khyber Pakhtunkhwa', isMajorCity: false },
  { name: 'Nowshera', province: 'Khyber Pakhtunkhwa', isMajorCity: false },
  { name: 'Mansehra', province: 'Khyber Pakhtunkhwa', isMajorCity: false },
  { name: 'Haripur', province: 'Khyber Pakhtunkhwa', isMajorCity: false },
  { name: 'Batkhela', province: 'Khyber Pakhtunkhwa', isMajorCity: false },
  { name: 'Karak', province: 'Khyber Pakhtunkhwa', isMajorCity: false },
  { name: 'Hangu', province: 'Khyber Pakhtunkhwa', isMajorCity: false },
  { name: 'Timergara (Dir)', province: 'Khyber Pakhtunkhwa', isMajorCity: false },
  { name: 'Chitral', province: 'Khyber Pakhtunkhwa', isMajorCity: false },
  { name: 'Parachinar', province: 'Khyber Pakhtunkhwa', isMajorCity: false },
  { name: 'Tank', province: 'Khyber Pakhtunkhwa', isMajorCity: false },

  // Balochistan Major Cities & Districts
  { name: 'Quetta', province: 'Balochistan', isMajorCity: true },
  { name: 'Turbat', province: 'Balochistan', isMajorCity: false },
  { name: 'Khuzdar', province: 'Balochistan', isMajorCity: false },
  { name: 'Hub', province: 'Balochistan', isMajorCity: false },
  { name: 'Chaman', province: 'Balochistan', isMajorCity: false },
  { name: 'Gwadar', province: 'Balochistan', isMajorCity: true },
  { name: 'Sibi', province: 'Balochistan', isMajorCity: false },
  { name: 'Zhob', province: 'Balochistan', isMajorCity: false },
  { name: 'Loralai', province: 'Balochistan', isMajorCity: false },
  { name: 'Dera Murad Jamali', province: 'Balochistan', isMajorCity: false },
  { name: 'Dera Allah Yar', province: 'Balochistan', isMajorCity: false },
  { name: 'Nushki', province: 'Balochistan', isMajorCity: false },
  { name: 'Kalat', province: 'Balochistan', isMajorCity: false },
  { name: 'Kharan', province: 'Balochistan', isMajorCity: false },
  { name: 'Mastung', province: 'Balochistan', isMajorCity: false },
  { name: 'Pishin', province: 'Balochistan', isMajorCity: false },

  // Azad Jammu & Kashmir (AJK)
  { name: 'Muzaffarabad', province: 'Azad Jammu & Kashmir', isMajorCity: true },
  { name: 'Mirpur (AJK)', province: 'Azad Jammu & Kashmir', isMajorCity: true },
  { name: 'Rawalakot', province: 'Azad Jammu & Kashmir', isMajorCity: false },
  { name: 'Kotli', province: 'Azad Jammu & Kashmir', isMajorCity: false },
  { name: 'Bhimber', province: 'Azad Jammu & Kashmir', isMajorCity: false },
  { name: 'Bagh', province: 'Azad Jammu & Kashmir', isMajorCity: false },

  // Gilgit-Baltistan
  { name: 'Gilgit', province: 'Gilgit-Baltistan', isMajorCity: true },
  { name: 'Skardu', province: 'Gilgit-Baltistan', isMajorCity: true },
  { name: 'Hunza', province: 'Gilgit-Baltistan', isMajorCity: false },
  { name: 'Chilas', province: 'Gilgit-Baltistan', isMajorCity: false }
];

const categoriesData = [
  // Quranic Categories
  {
    name: 'Tajweed al-Quran',
    slug: 'tajweed-al-quran',
    type: 'quran',
    icon: 'BookOpen',
    description: 'Learn authentic Quran recitation with Makharij, Sifaat, and classical Tajweed rules.',
    subtopics: ['Makharij al-Huroof', 'Ahkam al-Tajweed', 'Waqf Rules', 'Daily Practice']
  },
  {
    name: 'Nazra Quran for Kids & Adults',
    slug: 'nazra-quran',
    type: 'quran',
    icon: 'BookOpen',
    description: 'Fluency in reading the Holy Quran correctly from beginning to end with proper pronunciation.',
    subtopics: ['Noorani Qaida', 'Letter Recognition', 'Joining Letters', 'Complete Para Reading']
  },
  {
    name: 'Hifz al-Quran (Memorization)',
    slug: 'hifz-al-quran',
    type: 'quran',
    icon: 'Sparkles',
    description: 'Structured memorization program (Sabaq, Sabaqi, Manzil) with certified Huffaz.',
    subtopics: ['Daily Sabaq Target', 'Sabaqi Revision', 'Manzil Retention', 'Dua & Adhkar']
  },
  {
    name: 'Quran Translation & Tafseer',
    slug: 'quran-translation-tafseer',
    type: 'quran',
    icon: 'Compass',
    description: 'Word-by-word translation, context of revelation (Shan-e-Nuzul), and classical Tafseer.',
    subtopics: ['Word-by-Word Translation', 'Surah Context', 'Practical Lessons', 'Moral Guidance']
  },
  {
    name: 'Noorani Qaida for Beginners',
    slug: 'noorani-qaida',
    type: 'quran',
    icon: 'GraduationCap',
    description: 'Gentle, interactive foundational lessons for children and non-Arabic speakers.',
    subtopics: ['Arabic Alphabet', 'Harakat (Zabar, Zair, Paish)', 'Tanween', 'Maddah Letters']
  },
  {
    name: 'Islamic Studies & Fiqh / Hadith',
    slug: 'islamic-studies-fiqh',
    type: 'quran',
    icon: 'ShieldCheck',
    description: 'Essential beliefs (Aqeedah), daily Salah/Wudu fiqh, 40 Hadith of Imam Nawawi, and Seerat-un-Nabi.',
    subtopics: ['Namaz & Taharah Rules', 'Daily Masnoon Duas', 'Hadith Study', 'Islamic Manners & Akhlaq']
  },
  {
    name: 'Arabic Grammar & Spoken Arabic',
    slug: 'arabic-grammar-spoken',
    type: 'quran',
    icon: 'Languages',
    description: 'Nahw & Sarf for understanding Quranic Arabic directly without translation.',
    subtopics: ['Ilm-us-Sarf (Verb Forms)', 'Ilm-un-Nahw (Sentence Syntax)', 'Vocabulary Building', 'Conversational Arabic']
  },

  // Academic Categories
  {
    name: 'Matric / SSC Science (Class 9 & 10)',
    slug: 'matric-ssc-science',
    type: 'academic',
    icon: 'BookMarked',
    description: 'Complete syllabus preparation according to Lahore, Federal, Rawalpindi, and Karachi boards.',
    subtopics: ['Mathematics', 'Physics', 'Chemistry', 'Biology / Computer']
  },
  {
    name: 'FSc / HSSC Pre-Medical & Pre-Engineering',
    slug: 'fsc-hssc',
    type: 'academic',
    icon: 'GraduationCap',
    description: 'In-depth conceptual tutoring and numerical solving for 1st year and 2nd year college students.',
    subtopics: ['Physics 11 & 12', 'Chemistry 11 & 12', 'Biology / Higher Math', 'Entry Test Prep (MDCAT/ECAT)']
  },
  {
    name: 'O-Level / IGCSE Cambridge',
    slug: 'o-level-cambridge',
    type: 'academic',
    icon: 'Award',
    description: 'Past papers solving, examiner tips, and syllabus mastery for Cambridge CAIE O-Levels.',
    subtopics: ['Math Syllabus D (4024)', 'Physics (5054)', 'Chemistry (5070)', 'Islamiyat & Pak Studies (2058/2059)']
  },
  {
    name: 'A-Level Cambridge',
    slug: 'a-level-cambridge',
    type: 'academic',
    icon: 'Award',
    description: 'Advanced Level CAIE coaching: Pure Math, Mechanics, Physics, Chemistry, and Economics.',
    subtopics: ['Pure Mathematics (P1, P3, M1, S1)', 'A-Level Physics', 'A-Level Chemistry', 'Computer Science (9618)']
  },
  {
    name: 'Computer Science & Coding',
    slug: 'computer-science-coding',
    type: 'academic',
    icon: 'Code',
    description: 'Python, Web Development (HTML/CSS/JS/React), Scratch for Kids, and Algorithm basics.',
    subtopics: ['Python for Beginners', 'Full-Stack Web Dev', 'Problem Solving', 'Data Structures']
  },
  {
    name: 'Spoken English & IELTS Prep',
    slug: 'spoken-english-ielts',
    type: 'academic',
    icon: 'Languages',
    description: 'Fluency in English speaking, grammar refinement, and IELTS Academic/General Band 7+ prep.',
    subtopics: ['IELTS Speaking & Writing', 'Pronunciation & Vocabulary', 'Grammar in Context', 'Listening & Reading Skills']
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Database Seeding for Pakistan-Wide LMS Portal...');
    await connectDB();

    // Clear existing collections
    await User.deleteMany({});
    await TutorProfile.deleteMany({});
    await Category.deleteMany({});
    await Location.deleteMany({});
    await Deal.deleteMany({});
    await Message.deleteMany({});
    await Review.deleteMany({});
    await Session.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await SystemConfig.deleteMany({});
    await Course.deleteMany({});
    await Certificate.deleteMany({});

    console.log('🧹 Cleaned existing database collections');

    // 1. Seed Locations
    const createdLocations = await Location.insertMany(locationsData);
    console.log(`✅ Seeded ${createdLocations.length} Pakistani Cities & Regions`);

    const locMap = {};
    createdLocations.forEach(loc => {
      locMap[loc.name] = loc._id;
    });

    // 2. Seed Categories
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`✅ Seeded ${createdCategories.length} Quran & Academic Categories`);

    const catMap = {};
    createdCategories.forEach(cat => {
      catMap[cat.slug] = cat._id;
    });

    // 3. Seed SystemConfig
    const systemConfig = await SystemConfig.create({
      trialDurationDays: 3,
      paymentInstructions: {
        bankName: 'Meezan Bank Limited (Islamic Banking)',
        accountNumber: '01020304050607',
        accountTitle: 'IlmPortal Education Pvt Ltd',
        iban: 'PK36MEZN0001020304050607',
        jazzcashNumber: '03001234567',
        jazzcashTitle: 'IlmPortal Online Tutoring',
        easypaisaNumber: '03451234567',
        easypaisaTitle: 'IlmPortal Online Tutoring',
        instructionsNotes: 'Transfer fee via JazzCash, EasyPaisa, or Online Bank Transfer and submit the Transaction ID (TID) below. Payments verified within 2–4 hours.'
      },
      platformNotice: 'Welcome to Pakistan’s premier Quran & Academic Tutoring Platform. All live classes feature full HD video & interactive whiteboard.',
      supportEmail: 'support@pakistanlms.pk',
      supportPhone: '+92 300 1234567'
    });
    console.log('✅ Seeded System Configuration (3-day trial, JazzCash, EasyPaisa, Meezan Bank)');

    // 4. Seed Admin User
    const adminUser = await User.create({
      name: 'IlmPortal Admin',
      email: 'admin@pakistanlms.pk',
      password: 'Admin@12345',
      role: 'admin',
      isVerified: true,
      city: 'Lahore',
      phone: '+92 300 1234567',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });
    console.log('✅ Seeded Super Admin Account (admin@pakistanlms.pk / Admin@12345)');

    // 5. Seed Verified Tutors
    // Tutor 1: Qari Muhammad Huzaifa (Lahore - Quran & Tajweed)
    const tutor1User = await User.create({
      name: 'Qari Muhammad Huzaifa',
      email: 'qari.huzaifa@example.com',
      password: 'Password@123',
      role: 'tutor',
      isVerified: true,
      city: 'Lahore',
      phone: '+92 301 2345678',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'
    });

    const tutor1Profile = await TutorProfile.create({
      user: tutor1User._id,
      bio: 'Assalam-o-Alaikum! Certified Hafiz-e-Quran & Qari from Wifaq-ul-Madaris Al-Arabia with 9+ years of teaching experience. Specialized in Tajweed, Makharij, and melodious Qirat for both children and adults.',
      qualifications: 'Shahadat-ul-Alimiyyah (Dars-e-Nizami), Sanad Tajweed & Qirat Sabaa',
      experienceYears: 9,
      hourlyRate: 1500, // PKR
      subjects: [catMap['tajweed-al-quran'], catMap['nazra-quran'], catMap['hifz-al-quran']],
      cities: [locMap['Lahore'], locMap['Islamabad'], locMap['Rawalpindi']],
      teachingModes: ['online', 'in_person'],
      gender: 'male',
      verificationStatus: 'approved',
      ratingAverage: 5.0,
      ratingCount: 28,
      isFeatured: true,
      sanadDocuments: [{
        title: 'Sanad Tajweed & Qirat (Wifaq-ul-Madaris)',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
        fileType: 'image/jpeg',
        uploadedAt: new Date()
      }],
      availabilitySlots: [
        { dayOfWeek: 'Monday', startTime: '16:00', endTime: '21:00', isBooked: false },
        { dayOfWeek: 'Tuesday', startTime: '16:00', endTime: '21:00', isBooked: false },
        { dayOfWeek: 'Wednesday', startTime: '16:00', endTime: '21:00', isBooked: false },
        { dayOfWeek: 'Thursday', startTime: '16:00', endTime: '21:00', isBooked: false },
        { dayOfWeek: 'Friday', startTime: '16:00', endTime: '21:00', isBooked: false },
        { dayOfWeek: 'Saturday', startTime: '10:00', endTime: '18:00', isBooked: false }
      ]
    });

    // Tutor 2: Alimah Fatima Zahra (Islamabad - Female Quran & Noorani Qaida)
    const tutor2User = await User.create({
      name: 'Alimah Fatima Zahra',
      email: 'alimah.fatima@example.com',
      password: 'Password@123',
      role: 'tutor',
      isVerified: true,
      city: 'Islamabad',
      phone: '+92 333 4567890',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200'
    });

    const tutor2Profile = await TutorProfile.create({
      user: tutor2User._id,
      bio: 'Dedicated female Islamic scholar providing personalized one-on-one Quran tutoring for female students, young girls, and kids. Expert in Noorani Qaida foundations and Islamic etiquette.',
      qualifications: 'Alimiyyah Degree (Jamia Hafsa), MA Islamic Studies (Punjab University)',
      experienceYears: 6,
      hourlyRate: 1800, // PKR
      subjects: [catMap['noorani-qaida'], catMap['nazra-quran'], catMap['islamic-studies-fiqh']],
      cities: [locMap['Islamabad'], locMap['Rawalpindi']],
      teachingModes: ['online', 'in_person'],
      gender: 'female',
      verificationStatus: 'approved',
      ratingAverage: 4.9,
      ratingCount: 19,
      isFeatured: true,
      sanadDocuments: [{
        title: 'Shahadat-ul-Alimiyyah Degree',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
        fileType: 'image/jpeg',
        uploadedAt: new Date()
      }]
    });

    // Tutor 3: Engr. Bilal Ahmad (Karachi - O/A Level Math & Physics)
    const tutor3User = await User.create({
      name: 'Engr. Bilal Ahmad',
      email: 'bilal.ahmad@example.com',
      password: 'Password@123',
      role: 'tutor',
      isVerified: true,
      city: 'Karachi',
      phone: '+92 321 9876543',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200'
    });

    const tutor3Profile = await TutorProfile.create({
      user: tutor3User._id,
      bio: 'NUST graduate with 7 years of specialized coaching for Cambridge CAIE O/A Levels and FSc. Focus on conceptual clarity, rigorous past-paper practice, and exam strategies that yield A* grades.',
      qualifications: 'MS Electrical Engineering (NUST), Cambridge Certified Tutor',
      experienceYears: 7,
      hourlyRate: 2500, // PKR
      subjects: [catMap['o-level-cambridge'], catMap['a-level-cambridge'], catMap['fsc-hssc']],
      cities: [locMap['Karachi'], locMap['Hyderabad']],
      teachingModes: ['online', 'in_person'],
      gender: 'male',
      verificationStatus: 'approved',
      ratingAverage: 4.9,
      ratingCount: 22,
      isFeatured: true,
      sanadDocuments: [{
        title: 'MS Degree Certificate (NUST)',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
        fileType: 'image/jpeg',
        uploadedAt: new Date()
      }]
    });

    // Tutor 4: Dr. Ayesha Tariq (Lahore - Biology & Chemistry)
    const tutor4User = await User.create({
      name: 'Dr. Ayesha Tariq',
      email: 'dr.ayesha@example.com',
      password: 'Password@123',
      role: 'tutor',
      isVerified: true,
      city: 'Lahore',
      phone: '+92 345 5566778',
      avatar: 'https://images.unsplash.com/photo-1594824813575-b92d6e32d561?w=200'
    });

    const tutor4Profile = await TutorProfile.create({
      user: tutor4User._id,
      bio: 'MBBS Doctor & Gold Medalist. Passionate about teaching Biology, Chemistry, and MDCAT entry test preparation with interactive 3D anatomy and physiological diagrams.',
      qualifications: 'MBBS (King Edward Medical University), Gold Medalist',
      experienceYears: 5,
      hourlyRate: 3000,
      subjects: [catMap['fsc-hssc'], catMap['matric-ssc-science'], catMap['o-level-cambridge']],
      cities: [locMap['Lahore']],
      teachingModes: ['online'],
      gender: 'female',
      verificationStatus: 'approved',
      ratingAverage: 5.0,
      ratingCount: 31,
      isFeatured: true,
      sanadDocuments: [{
        title: 'KEMU MBBS Degree & PMDC Registration',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
        fileType: 'image/jpeg',
        uploadedAt: new Date()
      }]
    });

    // Tutor 5: Ustadh Abdul Rahman (Peshawar - Quran Translation & Arabic)
    const tutor5User = await User.create({
      name: 'Ustadh Abdul Rahman',
      email: 'abdul.rahman@example.com',
      password: 'Password@123',
      role: 'tutor',
      isVerified: true,
      city: 'Peshawar',
      phone: '+92 312 3344556',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200'
    });

    const tutor5Profile = await TutorProfile.create({
      user: tutor5User._id,
      bio: 'Master of Arabic Literature & Islamic Jurisprudence. Teaching Quranic Arabic, Nahw, Sarf, and word-by-word Tafseer so students can connect with the Divine text directly.',
      qualifications: 'MA Arabic (Peshawar University), Dars-e-Nizami',
      experienceYears: 8,
      hourlyRate: 1600,
      subjects: [catMap['quran-translation-tafseer'], catMap['arabic-grammar-spoken'], catMap['islamic-studies-fiqh']],
      cities: [locMap['Peshawar'], locMap['Abbottabad'], locMap['Mardan']],
      teachingModes: ['online', 'in_person'],
      gender: 'male',
      verificationStatus: 'approved',
      ratingAverage: 4.8,
      ratingCount: 15,
      sanadDocuments: [{
        title: 'Sanad-e-Faraghat & MA Certificate',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
        fileType: 'image/jpeg',
        uploadedAt: new Date()
      }]
    });

    // Tutor 6: Pending Tutor for Approval Queue Testing
    const pendingTutorUser = await User.create({
      name: 'Hafiz Usman Ali',
      email: 'usman.ali@example.com',
      password: 'Password@123',
      role: 'tutor',
      isVerified: true,
      city: 'Faisalabad',
      phone: '+92 304 9988776',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200'
    });

    const pendingTutorProfile = await TutorProfile.create({
      user: pendingTutorUser._id,
      bio: 'Recent graduate from Jamia Darul Uloom with specialization in Tajweed and Hifz. Looking forward to teaching online.',
      qualifications: 'Hafiz-e-Quran (Wifaq-ul-Madaris), FSC Pre-Engineering',
      experienceYears: 2,
      hourlyRate: 1200,
      subjects: [catMap['hifz-al-quran'], catMap['tajweed-al-quran']],
      cities: [locMap['Faisalabad']],
      teachingModes: ['online', 'in_person'],
      gender: 'male',
      verificationStatus: 'pending',
      sanadDocuments: [{
        title: 'Hifz Certificate (Wifaq)',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
        fileType: 'image/jpeg',
        uploadedAt: new Date()
      }]
    });

    console.log('✅ Seeded Verified and Pending Tutor Profiles with Sanad Documents');

    // 6. Seed Students
    const student1 = await User.create({
      name: 'Hamza Khan',
      email: 'student.hamza@example.com',
      password: 'Password@123',
      role: 'student',
      isVerified: true,
      city: 'Lahore',
      phone: '+92 302 1122334',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'
    });

    const student2 = await User.create({
      name: 'Zainab Malik',
      email: 'student.zainab@example.com',
      password: 'Password@123',
      role: 'student',
      isVerified: true,
      city: 'Islamabad',
      phone: '+92 334 5566778',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'
    });

    const student3 = await User.create({
      name: 'Ali Raza',
      email: 'student.ali@example.com',
      password: 'Password@123',
      role: 'student',
      isVerified: true,
      city: 'Karachi',
      phone: '+92 322 9988112',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200'
    });

    console.log('✅ Seeded Demo Students (Hamza Khan, Zainab Malik, Ali Raza)');

    // 7. Seed Deals
    // Deal 1: Hamza Khan & Qari Huzaifa -> Active Trial (3-day countdown)
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const deal1 = await Deal.create({
      student: student1._id,
      tutor: tutor1User._id,
      subject: 'Tajweed al-Quran',
      mode: 'online',
      price: 4500,
      priceUnit: 'per_month',
      scheduleDetails: 'Mon, Wed, Fri at 5:00 PM PKT',
      status: 'active_trial',
      trialStartDate: now,
      trialEndDate: trialEnd,
      paymentStatus: 'unpaid'
    });

    // Deal 2: Zainab Malik & Alimah Fatima -> Active Paid (Verified via JazzCash)
    const deal2 = await Deal.create({
      student: student2._id,
      tutor: tutor2User._id,
      subject: 'Noorani Qaida & Islamic Etiquette for Kids',
      mode: 'online',
      price: 5000,
      priceUnit: 'per_month',
      scheduleDetails: 'Tue, Thu, Sat at 4:00 PM PKT',
      status: 'active_paid',
      paymentStatus: 'verified',
      paymentMethod: 'jazzcash',
      paymentProofReference: 'JC88920194829',
      paymentProofNotes: 'Transferred via JazzCash mobile app',
      paymentVerifiedAt: now,
      paymentVerifiedBy: adminUser._id
    });

    // Deal 3: Ali Raza & Engr. Bilal -> Pending Offer
    const deal3 = await Deal.create({
      student: student3._id,
      tutor: tutor3User._id,
      subject: 'O-Level Mathematics (4024)',
      mode: 'online',
      price: 7500,
      priceUnit: 'per_month',
      scheduleDetails: '3 days a week (1.5 hours/session)',
      status: 'pending_offer'
    });

    console.log('✅ Seeded Deals (Active Trial with countdown, Active Paid with JazzCash TID, Pending Offer)');

    // 8. Seed Chat Messages & Deal Cards
    const conv1 = [student1._id.toString(), tutor1User._id.toString()].sort().join('_');
    await Message.create({
      conversationId: conv1,
      sender: student1._id,
      recipient: tutor1User._id,
      text: 'Assalam-o-Alaikum Qari Sahab! I want to learn Tajweed from the basics. Are you available in the evening?',
      messageType: 'text',
      createdAt: new Date(Date.now() - 3600000 * 5)
    });

    await Message.create({
      conversationId: conv1,
      sender: tutor1User._id,
      recipient: student1._id,
      text: 'Walaikum Assalam! Yes brother Hamza, I have slots open on Mon, Wed, Fri at 5:00 PM. Sending you a 3-day free trial offer.',
      messageType: 'text',
      createdAt: new Date(Date.now() - 3600000 * 4)
    });

    await Message.create({
      conversationId: conv1,
      sender: tutor1User._id,
      recipient: student1._id,
      deal: deal1._id,
      messageType: 'deal_offer',
      text: 'Deal Offer: Tajweed al-Quran - PKR 4500 / month (Online Livestream)',
      dealOfferData: {
        dealId: deal1._id,
        subject: 'Tajweed al-Quran',
        price: 4500,
        priceUnit: 'per_month',
        schedule: 'Mon, Wed, Fri at 5:00 PM PKT',
        mode: 'online',
        notes: 'Includes free 3-day trial period.'
      },
      createdAt: new Date(Date.now() - 3600000 * 3)
    });

    await Message.create({
      conversationId: conv1,
      sender: student1._id,
      recipient: tutor1User._id,
      deal: deal1._id,
      messageType: 'deal_accept',
      text: 'Deal Accepted! Free 3-day trial started.',
      createdAt: new Date(Date.now() - 3600000 * 2)
    });

    // 9. Seed Reviews
    await Review.create({
      deal: deal2._id,
      student: student2._id,
      tutor: tutor2User._id,
      rating: 5,
      comment: 'MashaAllah Alimah Fatima is exceptionally patient and kind with children. My 7-year-old daughter completed her Qaida in just 2 months with perfect pronunciation!',
      status: 'published'
    });

    await Review.create({
      deal: deal1._id,
      student: student1._id,
      tutor: tutor1User._id,
      rating: 5,
      comment: 'Alhamdulillah Qari Huzaifa’s Tajweed explanation is the clearest I have ever experienced. Highly recommended for all Pakistani families.',
      status: 'published'
    });

    // 10. Seed Scheduled Live Classroom Sessions
    await Session.create({
      deal: deal1._id,
      roomId: 'ilm-demo-room-tajweed-101',
      tutor: tutor1User._id,
      student: student1._id,
      title: 'Tajweed al-Quran - Trial Class 1',
      mode: 'online',
      scheduledStartTime: new Date(Date.now() + 1800000), // In 30 mins
      scheduledEndTime: new Date(Date.now() + 5400000),
      status: 'scheduled',
      sessionNotes: 'Lesson 1: Makharij al-Huroof and introduction to Throat letters.'
    });

    // 11. Seed Structured Courses
    const coursesData = [
      {
        instructor: tutor1User._id,
        tutorProfile: tutor1Profile._id,
        title: 'Quran Recitation Course for Kids (Ages ~5–12)',
        slug: 'nazra-quran-kids',
        subtitle: 'Standalone foundational Quran reading curriculum designed specifically for children with gentle, short sessions and joyful milestones.',
        description: 'A dedicated kids-only track separate from adult recitation and separate from Hifz memorization. Focused purely on learning to recognize Arabic letters, join sounds, and recite the Holy Quran with proper Makharij at a child-friendly pace.',
        category: 'quran',
        targetAudience: 'Kids (Ages ~5–12)',
        ageRange: '5–12 Years',
        track: 'kids',
        sessionDuration: '15–20 minutes',
        totalLessons: 38,
        thumbnail: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80',
        enrolledCount: 184,
        ratingAverage: 5.0,
        ratingCount: 42,
        isFeatured: true,
        priceSuggested: {
          amount: 3500,
          unit: 'month',
          currency: 'PKR'
        },
        chapters: [
          {
            chapterNumber: 1,
            title: 'Chapter 1: Arabic Alphabet & Sound Foundations',
            description: 'Recognizing letters 1–28 and their distinctive shapes when connecting words.',
            lessons: [
              { lessonNumber: 1, title: 'Letters 1–4 (Alif, Ba, Ta, Tha)', content: 'Tracing and chanting initial letters.', duration: '15 mins', videoUrl: 'https://example.com/huroof-intro' },
              { lessonNumber: 2, title: 'Letters 5–8 (Jeem, Ha, Kha, Dal)', content: 'Makharij focus with picture association.', duration: '15 mins' }
            ],
            tests: [
              {
                testNumber: 1,
                title: 'Huroof Mastery Quiz (Letters 1–8)',
                instructions: 'Point to the correct sound for each highlighted letter symbol.',
                passingScore: 75,
                questions: [
                  {
                    question: 'Which letter has 3 dots on top?',
                    options: ['Ba (ب)', 'Ta (ت)', 'Tha (ث)', 'Jeem (ج)'],
                    correctAnswer: 2,
                    explanation: 'Tha (ث) carries three distinct dots on top and has a gentle lisp.'
                  },
                  {
                    question: 'Where is the letter Kha (خ) articulated from?',
                    options: ['Lips', 'Upper Throat (Adna al-Halq)', 'Tongue Tip', 'Nasal Cavity'],
                    correctAnswer: 1,
                    explanation: 'Kha is a throat letter emitted with slight rasp from the upper throat.'
                  }
                ]
              }
            ],
            assignments: [
              {
                assignmentNumber: 1,
                title: 'Audio Recitation: First 8 Letters Chanted',
                instructions: 'Record and submit a 60-second audio recitation chanting letters Alif through Dal with clear vocalization for Qari Huzaifa to evaluate.',
                submissionType: 'audio_recitation',
                dueDateDays: 5
              }
            ]
          },
          {
            chapterNumber: 2,
            title: 'Chapter 2: Harakat Vowel Signs & Phonics',
            description: 'Mastering short vowels (Fatha, Kasra, Damma) and double vowels (Tanween).',
            lessons: [
              { lessonNumber: 3, title: 'Fatha & Kasra Phonics Drills', content: 'Open smile sounds and short vowels.', duration: '15 mins' },
              { lessonNumber: 4, title: 'Damma & Tanween Mastery', content: 'Rounded lip gestures and double vowels.', duration: '15 mins' }
            ],
            tests: [
              {
                testNumber: 2,
                title: 'Vowel Signs Identification Check',
                instructions: 'Identify the vowel symbol displayed on the Arabic letter.',
                passingScore: 70,
                questions: [
                  {
                    question: 'What sound does Fatha ( َ ) make?',
                    options: ['Short "u" sound', 'Short "a" sound', 'Short "i" sound', 'Silent stop'],
                    correctAnswer: 1,
                    explanation: 'Fatha produces an open short "a" sound.'
                  }
                ]
              }
            ],
            assignments: [
              {
                assignmentNumber: 2,
                title: 'Vowel Matching Worksheet & Audio Check',
                instructions: 'Submit a clear photo or recitation recording of the 6 Harakat drill lines from your Qaida workbook.',
                submissionType: 'file_upload',
                dueDateDays: 7
              }
            ]
          }
        ],
        designPrinciples: [
          {
            title: 'Short Sessions (15–20 mins)',
            description: 'Attention span is the limiting factor in early childhood education. Lessons are designed to keep children sharp, engaged, and eager for the next class.',
            icon: 'Clock'
          },
          {
            title: 'High Repetition, Low New Content',
            description: 'Maximum 1 new concept per lesson, accompanied by heavy review of earlier concepts to cement long-term retention without overwhelm.',
            icon: 'RotateCcw'
          },
          {
            title: 'Visual & Audio Reinforcement',
            description: 'Interactive letter cards, color-coded Tajweed highlights, and call-and-response rhythm repetition so kids absorb sounds musically and visually.',
            icon: 'Sparkles'
          },
          {
            title: 'Positive Gamification & Badges',
            description: 'Reward markers, praise stars, and digital completion badges for each stage milestone that can be viewed proudly on the student dashboard.',
            icon: 'Award'
          },
          {
            title: 'Consistent Lesson Routine',
            description: 'Predictable lesson flow: Warm-up review → New concept → Practice & drill → Cool-down recap so children feel secure and confident.',
            icon: 'Calendar'
          },
          {
            title: 'Direct Parent Visibility',
            description: 'Automated post-class progress summaries sent to parents after every lesson via platform notifications and updates.',
            icon: 'ShieldCheck'
          }
        ],
        tutorTips: [
          'Never rush a stage — repetition and confidence matter far more than speed at this age.',
          'Keep tone warm and encouraging even when correcting; kids disengage quickly from strictness.',
          'Use games, chants, and rhythm drills — children absorb Arabic phonetics much faster through melodic patterns.',
          'End every lesson on something the child achieved or pronounced right, celebrating their effort.',
          'For children under 7, expect Stage 1 to require extra patience — pace by the child, not calendar dates.'
        ],
        platformMapping: {
          sessionLengthDefault: '15–20 minutes (pediatric setting)',
          trialPeriodCoverage: '3-Day Free Trial covers Stage 1, Lessons 1–2 before commitment',
          badgeSystem: 'Stage 1–4 completion badges awarded to student profile'
        },
        stages: [
          {
            stageNumber: 1,
            name: 'Stage 1: Letter Recognition (Huroof)',
            description: 'Mastering the 28 Arabic letters and their initial, medial, and final cursive shapes.',
            lessonCount: 12,
            badgeReward: 'Huroof Explorer Badge ⭐',
            lessons: [
              { lessonNumber: 1, title: 'Letters 1–4 (Alif, Ba, Ta, Tha)', content: 'Introduction to the first 4 Arabic alphabet letters.', approach: 'Sing/chant letter names, trace shapes with colorful whiteboard markers' },
              { lessonNumber: 2, title: 'Letters 5–8 (Jeem, Ha, Kha, Dal)', content: 'Throat and tongue sounds introduction.', approach: 'Repeat-after-me call-and-response drill, picture association' },
              { lessonNumber: 3, title: 'Letters 9–12 (Dhal, Ra, Zay, Seen)', content: 'Whistling and dental letter distinction.', approach: 'Review previous + new letters, flashcard matching game' },
              { lessonNumber: 4, title: 'Letters 13–16 (Sheen, Sad, Dad, Ta)', content: 'Heavy vs light letter articulation.', approach: 'Slow-paced guided repetition with visual mouth position hints' },
              { lessonNumber: 5, title: 'Letters 17–20 (Zha, Ain, Ghain, Fa)', content: 'Deep throat letters mastery.', approach: 'Focus on tricky throat letters (Ain, Ghain) with extra gentle repetition' },
              { lessonNumber: 6, title: 'Letters 21–24 (Qaf, Kaf, Lam, Meem)', content: 'Palate and lip letters pronunciation.', approach: 'Review + new letters, short quiz-style recap (point to letter, child names it)' },
              { lessonNumber: 7, title: 'Letters 25–28 (Noon, Waw, Ha, Ya)', content: 'Completing the full 28 Arabic letters.', approach: 'Full alphabet celebratory rhyme and certificate of letters' },
              { lessonNumber: 8, title: 'Full Alphabet Review & Speed Round', content: 'Comprehensive identification of all 28 letters.', approach: 'Random-order flashcards, fun low-stress speed challenge' },
              { lessonNumber: 9, title: 'Letter Shapes: Beginning of Word', content: 'How letters look when they start a word.', approach: 'Visual before-and-after comparison cards' },
              { lessonNumber: 10, title: 'Letter Shapes: Middle of Word', content: 'How letters look when joined on both sides.', approach: 'Connecting puzzle pieces exercise on digital board' },
              { lessonNumber: 11, title: 'Letter Shapes: End of Word', content: 'How letters look when ending a word.', approach: 'Tracing ending flourishes and recognizing full letters' },
              { lessonNumber: 12, title: 'Stage 1 Mini Assessment', content: 'Independent identification of all letters and positions.', approach: 'Tutor points to random letters/forms; child identifies confidently; Stage 1 badge awarded' }
            ]
          },
          {
            stageNumber: 2,
            name: 'Stage 2: Vowel Sounds (Harakat)',
            description: 'Understanding short vowels, Tanween, Sukoon, and the Shaddah rhythm trick.',
            lessonCount: 8,
            badgeReward: 'Harakat Master Badge 🌟',
            lessons: [
              { lessonNumber: 1, title: 'Fatha (Short "a" Sound)', content: 'Fatha on familiar letters.', approach: 'Phonics drills with open mouth smile sounds' },
              { lessonNumber: 2, title: 'Kasra (Short "i" Sound)', content: 'Kasra on familiar letters.', approach: 'Audio repeat-after-me comparison between Fatha and Kasra' },
              { lessonNumber: 3, title: 'Damma (Short "u" Sound)', content: 'Damma on familiar letters.', approach: 'Rounded lip gestures and quick-fire vowel drills' },
              { lessonNumber: 4, title: 'Mixing All Three Vowels', content: 'Alternating between Fatha, Kasra, and Damma.', approach: 'Quick-fire practice switching vowels on identical letters' },
              { lessonNumber: 5, title: 'Tanween Basics (an / in / un)', content: 'Recognizing double vowels with Noon sound.', approach: 'Simple explanation with lots of repetition' },
              { lessonNumber: 6, title: 'Sukoon (No Vowel / Stop Sound)', content: 'Pronouncing letters with no vowel and breath pause.', approach: 'Bouncing ball analogy for quiet rest stops' },
              { lessonNumber: 7, title: 'Shaddah (Doubled Letter Sound)', content: 'Emphasizing double letters with pressure.', approach: 'Clap-based rhythm trick to feel the physical emphasis' },
              { lessonNumber: 8, title: 'Review & Fun Matching Quiz', content: 'Consolidation of Harakat, Tanween, and Shaddah.', approach: 'Matching game: letter + vowel symbol → correct sound' }
            ]
          },
          {
            stageNumber: 3,
            name: 'Stage 3: Reading Simple Words & Joining Sounds',
            description: 'Blending letters into 2 and 3-letter words, Madd elongation, and Waqf pauses.',
            lessonCount: 8,
            badgeReward: 'Qaida Graduate Badge 🎖️',
            lessons: [
              { lessonNumber: 1, title: '2-Letter Word Blending', content: 'Letter + letter with simple vowels.', approach: 'Smooth phonics sliding sound practice' },
              { lessonNumber: 2, title: '3-Letter Word Blending', content: 'Reading full 3-letter Arabic words effortlessly.', approach: 'Word building blocks on digital board' },
              { lessonNumber: 3, title: 'Reading Rows of Simple Words', content: 'Building reading smoothness across words.', approach: 'Smooth pointer reading to build confidence' },
              { lessonNumber: 4, title: 'Introducing Madd Letters (Alif, Waw, Ya)', content: 'Simple 2-count stretch for long vowels.', approach: 'Practiced with clapping and 2-second finger counting' },
              { lessonNumber: 5, title: 'Reading Words with Madd', content: 'Distinguishing between short and long vowel words.', approach: 'Comparison drills: short vs long stretch' },
              { lessonNumber: 6, title: 'Simple Waqf (Stop) Signs', content: 'Punctuation and pauses in Quranic verses.', approach: '"When you see this mark, take a little pause"' },
              { lessonNumber: 7, title: 'Full-Line Reading Practice from Qaida', content: 'Fluent line-by-line reading practice.', approach: 'Independent student reading with tutor encouragement' },
              { lessonNumber: 8, title: 'Confidence Read-Aloud Session', content: 'Full page recitation without hesitation.', approach: 'Child reads a full page slowly, tutor only corrects, doesn\'t interrupt flow' }
            ]
          },
          {
            stageNumber: 4,
            name: 'Stage 4: First Real Quran Reading (Short Surahs)',
            description: 'Transitioning to the Holy Mushaf with the 4 most familiar short Surahs.',
            lessonCount: 10,
            badgeReward: 'Junior Qari Gold Certificate 🏆',
            lessons: [
              { lessonNumber: 1, title: 'Surah Al-Fatiha — Word by Word', content: 'Ayat 1–4 pronunciation and meaning overview.', approach: 'Word by word, correct pronunciation' },
              { lessonNumber: 2, title: 'Surah Al-Fatiha — Full Recitation Practice', content: 'Connecting the entire Surah smoothly.', approach: 'Full recitation practice with melody' },
              { lessonNumber: 3, title: 'Surah An-Nas — Word by Word', content: 'Seeking protection from whispered doubts.', approach: 'Word by word, correct pronunciation' },
              { lessonNumber: 4, title: 'Surah An-Nas — Full Recitation', content: 'Complete recitation of Surah An-Nas.', approach: 'Full recitation practice' },
              { lessonNumber: 5, title: 'Surah Al-Falaq — Word by Word', content: 'Seeking refuge with the Lord of daybreak.', approach: 'Word by word, correct pronunciation' },
              { lessonNumber: 6, title: 'Surah Al-Falaq — Full Recitation', content: 'Complete recitation of Surah Al-Falaq.', approach: 'Full recitation practice' },
              { lessonNumber: 7, title: 'Surah Al-Ikhlas — Word by Word', content: 'The oneness of Allah (Tawheed).', approach: 'Word by word, correct pronunciation' },
              { lessonNumber: 8, title: 'Surah Al-Ikhlas — Full Recitation', content: 'Complete recitation of Surah Al-Ikhlas.', approach: 'Full recitation practice' },
              { lessonNumber: 9, title: 'Combined Review of All 4 Surahs', content: 'Reciting Fatiha, Nas, Falaq, and Ikhlas in sequence.', approach: 'All 4 Surahs recited in sequence' },
              { lessonNumber: 10, title: 'Celebration Lesson & Certification', content: 'Child recites all learned Surahs for tutor and parent.', approach: 'Child recites all learned Surahs for tutor + parent; mark course-stage completion badge/certificate on platform' }
            ]
          }
        ]
      },
      {
        instructor: tutor2User._id,
        tutorProfile: tutor2Profile._id,
        title: 'Tajweed al-Quran & Melodious Qirat (Adults & Teens)',
        slug: 'tajweed-adults-teens',
        subtitle: 'Comprehensive Tajweed rules, Makharij precision, and melodious Quranic recitation for older students and adults.',
        description: 'Designed for adults, university students, and teenagers aiming to correct accent, master classical Tajweed principles (Ahkam al-Noon, Meem, Madd, Waqf), and recite with confidence.',
        category: 'quran',
        targetAudience: 'Adults & Teens (Ages 13+)',
        ageRange: '13+ Years',
        track: 'adult',
        sessionDuration: '30–45 minutes',
        totalLessons: 24,
        thumbnail: 'https://images.unsplash.com/photo-1584281722572-887498c87103?w=800&q=80',
        enrolledCount: 96,
        ratingAverage: 4.98,
        ratingCount: 29,
        isFeatured: true,
        priceSuggested: {
          amount: 4500,
          unit: 'month',
          currency: 'PKR'
        },
        chapters: [
          {
            chapterNumber: 1,
            title: 'Chapter 1: The 5 Primary Articulation Regions (Makharij)',
            description: 'Comprehensive study of Halq (Throat), Lisaan (Tongue), Shafataan (Lips), Khayshoom (Nose), and Jawf (Cavity).',
            lessons: [
              { lessonNumber: 1, title: 'Throat Letters (Halqiyyah) Masterclass', content: 'Detailed analysis of Hamzah, Ha, Ain, Ha, Ghain, Kha.', duration: '30 mins' }
            ],
            tests: [
              {
                testNumber: 1,
                title: 'Makharij Theoretical Exam',
                instructions: 'Answer the phonetics questions accurately.',
                passingScore: 80,
                questions: [
                  {
                    question: 'How many letters are emitted from the throat (Halq)?',
                    options: ['4 letters', '6 letters', '8 letters', '10 letters'],
                    correctAnswer: 1,
                    explanation: 'There are 6 throat letters: Hamzah, Haa, Ain, Haa, Ghain, Khaa.'
                  }
                ]
              }
            ],
            assignments: [
              {
                assignmentNumber: 1,
                title: 'Audio Submission: Surah Al-Mulk (Verses 1–5)',
                instructions: 'Record and submit your recitation of Surah Al-Mulk verses 1–5 paying special attention to throat letters and Qalqalah.',
                submissionType: 'audio_recitation',
                dueDateDays: 7
              }
            ]
          }
        ],
        designPrinciples: [
          {
            title: '30–45 Min In-Depth Sessions',
            description: 'Focused conceptual and practical recitation sessions suited for mature learners.',
            icon: 'Clock'
          },
          {
            title: 'Classical Sanad Methodology',
            description: 'Taught by certified Sanad holders following classical Arabic phonetic rules.',
            icon: 'Award'
          }
        ],
        tutorTips: [
          'Identify individual phoneme difficulties early and give targeted corrective exercises.',
          'Balance rules explanation with active student recitation time.'
        ],
        platformMapping: {
          sessionLengthDefault: '30–45 minutes',
          trialPeriodCoverage: '3-Day Free Trial covers Makharij assessment & Lesson 1',
          badgeSystem: 'Advanced Tajweed Certification upon completion'
        },
        stages: [
          {
            stageNumber: 1,
            name: 'Stage 1: Makharij al-Huroof (Articulation Points)',
            description: 'Precision in throat, tongue, palate, and lip points of articulation.',
            lessonCount: 8,
            badgeReward: 'Makharij Certificate',
            lessons: [
              { lessonNumber: 1, title: 'Introduction to the 5 Primary Articulation Regions', content: 'Throat, oral cavity, tongue, lips, nasal cavity.', approach: 'Anatomical diagrams & sound emission analysis' },
              { lessonNumber: 2, title: 'Throat Letters (Halqiyyah) - Hamzah, Ha, Ain, Ha, Ghain, Kha', content: 'Deep, middle, and upper throat sounds.', approach: 'Vocal cord placement exercises' }
            ]
          }
        ]
      },

      // Course 3: Alimah Fatima Zahra - Noorani Qaida for Females & Kids
      {
        instructor: tutor2User._id,
        tutorProfile: tutor2Profile._id,
        title: 'Noorani Qaida & Arabic Phonics (Females & Kids)',
        slug: 'noorani-qaida-beginners',
        subtitle: 'Foundational Arabic letters, phonetics, and Harakat taught with gentle motherly pacing.',
        description: 'Specialized 1-on-1 track for young girls, young children, and female beginners. Learn letter shapes, connection rules, and correct articulation from Jamia Hafsa certified Alimah.',
        category: 'quran',
        targetAudience: 'Females & Young Children',
        ageRange: '4–14 Years',
        track: 'kids',
        sessionDuration: '15–20 minutes',
        totalLessons: 18,
        thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
        enrolledCount: 65,
        ratingAverage: 5.0,
        ratingCount: 19,
        isFeatured: true,
        priceSuggested: {
          amount: 3200,
          unit: 'month',
          currency: 'PKR'
        },
        chapters: [
          {
            chapterNumber: 1,
            title: 'Chapter 1: Single Letter Articulation (Mufradat)',
            description: 'Mastering the 29 isolated Arabic alphabet characters.',
            lessons: [
              { lessonNumber: 1, title: 'Alif to Khaa Phonetics & Lip Shapes', content: 'Chanting isolated letters with picture flashcards.', duration: '15 mins' },
              { lessonNumber: 2, title: 'Daal to Yaa & Review Drill', content: 'Gentle repetition and memory reinforcement.', duration: '15 mins' }
            ],
            tests: [
              {
                testNumber: 1,
                title: 'Mufradat Identification Check',
                instructions: 'Select the correct letter sound matching the symbol.',
                passingScore: 75,
                questions: [
                  {
                    question: 'Which letter produces a soft whistle sound?',
                    options: ['Zay (ز)', 'Jeem (ج)', 'Khaf (ك)', 'Meem (م)'],
                    correctAnswer: 0,
                    explanation: 'Zay is one of the whistling letters (Huroof As-Safeer).'
                  }
                ]
              }
            ],
            assignments: [
              {
                assignmentNumber: 1,
                title: 'Audio Recitation: Letters 1–15',
                instructions: 'Record and submit a 1-minute audio recording chanting letters Alif to Daad.',
                submissionType: 'audio_recitation',
                dueDateDays: 5
              }
            ]
          }
        ]
      },

      // Course 4: Alimah Fatima Zahra - Daily Duas & Fiqh of Salah
      {
        instructor: tutor2User._id,
        tutorProfile: tutor2Profile._id,
        title: 'Essential Daily Duas, Masnoon Azkar & Fiqh of Salah',
        slug: 'daily-duas-salah-fiqh',
        subtitle: 'Learn the meaning, pronunciation, and Sunnah etiquette of daily prayers and Wudu.',
        description: 'A practical, spiritually uplifting course covering step-by-step Wudu, prayer recitation with Tajweed, and essential morning/evening Duas for Muslim youth and sisters.',
        category: 'quran',
        targetAudience: 'Kids & Teens',
        ageRange: '7–16 Years',
        track: 'kids',
        sessionDuration: '20–30 minutes',
        totalLessons: 16,
        thumbnail: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80',
        enrolledCount: 52,
        ratingAverage: 4.95,
        ratingCount: 14,
        isFeatured: false,
        priceSuggested: {
          amount: 2800,
          unit: 'month',
          currency: 'PKR'
        },
        chapters: [
          {
            chapterNumber: 1,
            title: 'Chapter 1: Taharah & The Sunnah Wudu Steps',
            description: 'Practical demonstrations of ablution and its authentic supplications.',
            lessons: [
              { lessonNumber: 1, title: 'Wudu Obligatory Acts (Faraid) vs Sunnahs', content: 'Step-by-step physical and spiritual purification.', duration: '20 mins' }
            ],
            tests: [
              {
                testNumber: 1,
                title: 'Wudu Fiqh Assessment',
                instructions: 'Identify the mandatory steps of Wudu.',
                passingScore: 80,
                questions: [
                  {
                    question: 'How many Faraid (obligatory acts) are there in Wudu?',
                    options: ['4', '6', '8', '10'],
                    correctAnswer: 0,
                    explanation: 'The 4 Faraid are: washing the face, arms to elbows, wiping head, and washing feet to ankles.'
                  }
                ]
              }
            ],
            assignments: [
              {
                assignmentNumber: 1,
                title: 'Audio Recitation: Dua After Wudu',
                instructions: 'Record your recitation of the Shahadah and supplication recited upon completing Wudu.',
                submissionType: 'audio_recitation',
                dueDateDays: 5
              }
            ]
          }
        ]
      },

      // Course 5: Engr. Bilal Ahmed - Cambridge O-Level Physics
      {
        instructor: tutor3User._id,
        tutorProfile: tutor3Profile._id,
        title: 'Cambridge O-Level Physics (5054): Complete Mechanics',
        slug: 'o-level-physics-mechanics',
        subtitle: 'Master Kinematics, Dynamics, Forces, and Past Paper Problem-Solving with an MS Electrical Engineer.',
        description: 'Comprehensive CAIE syllabus coverage designed to turn B/C grades into solid A*s. Includes formula sheets, graphical motion analysis, and step-by-step past paper problem breakdowns.',
        category: 'academic',
        targetAudience: 'Cambridge O-Level Students',
        ageRange: '14–17 Years',
        track: 'academic',
        sessionDuration: '45–60 minutes',
        totalLessons: 20,
        thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80',
        enrolledCount: 48,
        ratingAverage: 4.95,
        ratingCount: 16,
        isFeatured: true,
        priceSuggested: {
          amount: 5000,
          unit: 'month',
          currency: 'PKR'
        },
        chapters: [
          {
            chapterNumber: 1,
            title: 'Chapter 1: Kinematics & Graphical Analysis of Motion',
            description: 'Displacement, velocity, acceleration, and gradient/area techniques on motion graphs.',
            lessons: [
              { lessonNumber: 1, title: 'Speed-Time Graphs: Calculating Acceleration & Distance', content: 'Finding slope for acceleration and area under curve for total distance.', duration: '45 mins', videoUrl: 'https://example.com/physics-kinematics' },
              { lessonNumber: 2, title: 'Terminal Velocity & Freefall with Air Resistance', content: 'Balanced vs unbalanced forces on falling parachutists.', duration: '45 mins' }
            ],
            tests: [
              {
                testNumber: 1,
                title: 'Kinematics Speed Check (Paper 1 MCQs)',
                instructions: 'Solve within 15 minutes. No external aid.',
                passingScore: 75,
                questions: [
                  {
                    question: 'What does the area under a Speed-Time graph represent?',
                    options: ['Acceleration', 'Total Distance Travelled', 'Speed', 'Rate of change of velocity'],
                    correctAnswer: 1,
                    explanation: 'The integral/area under speed vs time yields distance travelled.'
                  }
                ]
              }
            ],
            assignments: [
              {
                assignmentNumber: 1,
                title: 'Past Paper 2 Numerical Problem Set (2020–2024)',
                instructions: 'Solve questions 1 through 4 from the kinematics worksheet showing all formula steps and units. Upload PDF/photo scan.',
                submissionType: 'file_upload',
                dueDateDays: 7
              }
            ]
          }
        ]
      },

      // Course 6: Dr. Ayesha Tariq - MDCAT & FSc Biology
      {
        instructor: tutor4User._id,
        tutorProfile: tutor4Profile._id,
        title: 'MDCAT & FSc Biology: Human Physiology & Cell Masterclass',
        slug: 'mdcat-fsc-biology',
        subtitle: 'High-yield medical entrance coaching with King Edward Medical University Gold Medalist.',
        description: 'Master tricky biological diagrams, nerve action potentials, circulatory loops, and enzyme kinetics for guaranteed high scores in PMDC MDCAT and FSc Board exams.',
        category: 'academic',
        targetAudience: 'Pre-Medical & MDCAT Students',
        ageRange: '16–19 Years',
        track: 'academic',
        sessionDuration: '45–60 minutes',
        totalLessons: 22,
        thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
        enrolledCount: 78,
        ratingAverage: 5.0,
        ratingCount: 25,
        isFeatured: true,
        priceSuggested: {
          amount: 6000,
          unit: 'month',
          currency: 'PKR'
        },
        chapters: [
          {
            chapterNumber: 1,
            title: 'Chapter 1: Human Circulation & The Cardiac Cycle',
            description: 'Systole, diastole, ECG wave interpretation, and blood pressure regulation.',
            lessons: [
              { lessonNumber: 1, title: 'The Cardiac Conduction System (SA Node, AV Node, Purkinje Fibers)', content: 'Electrical pathway triggering ventricular contractions.', duration: '50 mins' }
            ],
            tests: [
              {
                testNumber: 1,
                title: 'MDCAT Speed MCQ Test: Circulation & Blood',
                instructions: '40 seconds per question to mimic the real entry test pressure.',
                passingScore: 85,
                questions: [
                  {
                    question: 'Which node acts as the primary natural pacemaker of the human heart?',
                    options: ['Atrioventricular (AV) Node', 'Sinoatrial (SA) Node', 'Bundle of His', 'Purkinje Fibers'],
                    correctAnswer: 1,
                    explanation: 'The SA Node located in the right atrium initiates rhythmic cardiac impulses at 72 bpm.'
                  }
                ]
              }
            ],
            assignments: [
              {
                assignmentNumber: 1,
                title: 'Cardiac Cycle Flowchart & Wave Interpretation',
                instructions: 'Draw and label the pressure changes in the left ventricle during the cardiac cycle and submit your notes scan.',
                submissionType: 'file_upload',
                dueDateDays: 6
              }
            ]
          }
        ]
      },

      // Course 7: Ustadh Abdul Rahman - Classical Quranic Arabic
      {
        instructor: tutor5User._id,
        tutorProfile: tutor5Profile._id,
        title: 'Classical Quranic Arabic & Grammar (Nahw & Sarf)',
        slug: 'quranic-arabic-grammar',
        subtitle: 'Understand the Quran directly in Arabic without relying on translated interpretations.',
        description: 'Explore the root system, grammatical declensions (I’rab), nominal sentences (Jumlah Ismiyyah), and verbal sentences (Jumlah Fi’liyyah) with MA Arabic scholar from Peshawar.',
        category: 'quran',
        targetAudience: 'Adults & University Students',
        ageRange: '16+ Years',
        track: 'adult',
        sessionDuration: '30–45 minutes',
        totalLessons: 24,
        thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
        enrolledCount: 39,
        ratingAverage: 4.88,
        ratingCount: 12,
        isFeatured: false,
        priceSuggested: {
          amount: 3800,
          unit: 'month',
          currency: 'PKR'
        },
        chapters: [
          {
            chapterNumber: 1,
            title: 'Chapter 1: The 3 Components of Arabic Speech (Ism, Fi’l, Harf)',
            description: 'Distinguishing nouns, verbs, and particles in Quranic verses.',
            lessons: [
              { lessonNumber: 1, title: 'Signs of Nouns (Tanween, Alif-Lam, Kasrah)', content: 'How to instantly identify an Ism in the Quran.', duration: '35 mins' }
            ],
            tests: [
              {
                testNumber: 1,
                title: 'Parts of Speech in Surah Al-Fatiha',
                instructions: 'Classify each word from the opening chapter.',
                passingScore: 80,
                questions: [
                  {
                    question: 'What type of word is "Al-Hamd" (الْحَمْدُ)?',
                    options: ['Fi\'l (Verb)', 'Ism (Noun)', 'Harf (Particle)', 'Shibh Jumlah'],
                    correctAnswer: 1,
                    explanation: 'Al-Hamd begins with Alif-Lam (Definite Article), which is a definitive sign of an Ism.'
                  }
                ]
              }
            ],
            assignments: [
              {
                assignmentNumber: 1,
                title: 'Grammatical Breakdown: Ayah 1–5 of Surah Al-Baqarah',
                instructions: 'Highlight and classify 10 nouns and 5 verbs in the passage with their respective root letters.',
                submissionType: 'text',
                dueDateDays: 7
              }
            ]
          }
        ]
      }
    ];

    const seededCourses = await Course.insertMany(coursesData);
    console.log(`✅ Seeded ${seededCourses.length} Structured Courses assigned to verified tutors`);

    // 12. Seed Sample Course Completion Certificate for Demo Student
    await Certificate.create({
      certificateId: 'ILM-CERT-2026-89412',
      student: student1._id,
      studentName: student1.name,
      studentEmail: student1.email,
      course: seededCourses[0]._id,
      courseTitle: seededCourses[0].title,
      instructor: tutor1User._id,
      instructorName: tutor1User.name,
      completionGrade: 'Distinction (Sanad Verified - 98%)',
      totalLessonsCompleted: 38,
      verificationCode: 'SANAD-QA-89412',
      status: 'issued'
    });
    console.log('✅ Seeded Sample Course Completion Certificate for Hamza Khan');

    console.log('✅ Seeded Sample Messages, Reviews, and WebRTC Classroom Sessions');

    // Seed CMS Pages (Privacy, Terms, Disclaimer, About Us, Contact Us)
    for (const [slug, pageData] of Object.entries(defaultPages)) {
      const existingPage = await Page.findOne({ slug });
      if (!existingPage) {
        await Page.create(pageData);
      }
    }
    console.log('✅ Seeded CMS Pages (Privacy, Terms, Disclaimer, About Us, Contact Us)');

    console.log('\n======================================================');
    console.log('🎉 Database Seeding Complete!');
    console.log('Credentials Summary:');
    console.log('Admin:   admin@pakistanlms.pk    / Admin@12345');
    console.log('Tutor:   qari.huzaifa@example.com / Password@123');
    console.log('Student: student.hamza@example.com / Password@123');
    console.log('======================================================\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    // Only disconnect if standalone script
    if (process.env.STANDALONE_SEED === 'true') {
      await disconnectDB();
      process.exit(0);
    }
  }
};

if (require.main === module) {
  process.env.STANDALONE_SEED = 'true';
  seedDatabase();
}

module.exports = seedDatabase;
