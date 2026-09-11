const request = require('supertest');
const { app, server } = require('../src/server');
const { connectDB, disconnectDB } = require('../src/config/db');

jest.setTimeout(90000);

describe('IlmiDunya Pakistan LMS API Tests', () => {
  let studentToken = '';
  let tutorToken = '';
  let adminToken = '';
  let tutorProfileId = '';
  let dealId = '';

  beforeAll(async () => {
    await connectDB();
    const User = require('../src/models/User');
    await User.deleteMany({ email: { $in: ['teststudent@pakistanlms.pk', 'testtutor@pakistanlms.pk'] } });
  });

  afterAll(async () => {
    const User = require('../src/models/User');
    await User.deleteMany({ email: { $in: ['teststudent@pakistanlms.pk', 'testtutor@pakistanlms.pk'] } });
    await disconnectDB();
    server.close();
  });

  test('GET /api/health returns online status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('online');
  });

  test('POST /api/auth/register creates a student and returns verification OTP', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Student Lahore',
        email: 'teststudent@pakistanlms.pk',
        password: 'Password@123',
        phone: '03001112233',
        city: 'Lahore',
        role: 'student'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.user.role).toEqual('student');
    studentToken = res.body.token;
  });

  test('POST /api/auth/verify-otp verifies the student account', async () => {
    const User = require('../src/models/User');
    const user = await User.findOne({ email: 'teststudent@pakistanlms.pk' });
    expect(user.verificationOtp).toBeDefined();

    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'teststudent@pakistanlms.pk',
        otp: user.verificationOtp
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.user.isVerified).toEqual(true);
    studentToken = res.body.token;
  });

  test('POST /api/auth/register creates a tutor in pending verification status', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Qari Test Tutor',
        email: 'testtutor@pakistanlms.pk',
        password: 'Password@123',
        phone: '03009998877',
        city: 'Islamabad',
        role: 'tutor'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toEqual(true);

    const jwt = require('jsonwebtoken');
    tutorToken = jwt.sign({ id: res.body.user.id }, process.env.JWT_SECRET || 'fallback_jwt_secret_for_pakistan_lms_2026', { expiresIn: '30d' });

    const User = require('../src/models/User');
    await User.findByIdAndUpdate(res.body.user.id, {
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      age: 32,
      gender: 'Male',
      city: 'Islamabad'
    });

    const TutorProfile = require('../src/models/TutorProfile');
    const profile = await TutorProfile.findOne({ user: res.body.user.id });
    const Category = require('../src/models/Category');
    let cat = await Category.findOne();
    if (!cat) {
      cat = await Category.create({ name: 'Quran & Tajweed', slug: 'quran-tajweed', icon: 'BookOpen' });
    }

    profile.verificationStatus = 'pending';
    profile.gender = 'male';
    profile.city = 'Islamabad';
    profile.subjects = [cat._id];
    profile.bio = 'Experienced certified Quran tutor teaching Tajweed, Hifz, and Islamic studies for over 10 years.';
    profile.qualifications = 'Shahadat-ul-Alimiyyah (Wifaq-ul-Madaris)';
    profile.sanadDocuments = [
      {
        title: 'Shahadat-ul-Alimiyyah',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
        fileType: 'image/jpeg',
        status: 'verified',
        uploadedAt: new Date()
      }
    ];
    await profile.save();
    tutorProfileId = profile._id.toString();
  });

  test('POST /api/auth/login logs in admin account', async () => {
    const User = require('../src/models/User');
    let admin = await User.findOne({ email: 'admin@pakistanlms.pk' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin Test',
        email: 'admin@pakistanlms.pk',
        password: 'Admin@12345',
        role: 'admin',
        isVerified: true
      });
    }

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@pakistanlms.pk',
        password: 'Admin@12345'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.user.role).toEqual('admin');
    adminToken = res.body.token;
  });

  test('Admin approves tutor application via PUT /api/admin/tutors/:id/approve', async () => {
    const res = await request(app)
      .put(`/api/admin/tutors/${tutorProfileId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.tutor.verificationStatus).toEqual('approved');
  });

  test('Tutor sends deal offer to student and student accepts starting 3-day trial', async () => {
    const User = require('../src/models/User');
    const student = await User.findOne({ email: 'teststudent@pakistanlms.pk' });

    const offerRes = await request(app)
      .post('/api/deals/offer')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        studentId: student._id.toString(),
        subject: 'Tajweed al-Quran Basics',
        price: 4000,
        priceUnit: 'per_month',
        mode: 'online',
        scheduleDetails: 'Mon, Wed, Fri at 6 PM'
      });

    expect(offerRes.statusCode).toEqual(201);
    expect(offerRes.body.deal.status).toEqual('pending_offer');
    dealId = offerRes.body.deal._id.toString();

    const acceptRes = await request(app)
      .post(`/api/deals/${dealId}/respond`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ action: 'accept' });

    expect(acceptRes.statusCode).toEqual(200);
    expect(acceptRes.body.deal.status).toEqual('active_trial');
    expect(acceptRes.body.deal.trialEndDate).toBeDefined();
  });

  test('Student submits manual JazzCash payment proof and Admin verifies payment', async () => {
    const submitRes = await request(app)
      .post(`/api/deals/${dealId}/submit-payment`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        paymentMethod: 'jazzcash',
        referenceCode: 'JC987654321',
        notes: 'Paid from 0300-1112233'
      });

    expect(submitRes.statusCode).toEqual(200);
    expect(submitRes.body.deal.paymentStatus).toEqual('submitted_proof');

    const verifyRes = await request(app)
      .put(`/api/admin/deals/${dealId}/verify-payment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'verified' });

    expect(verifyRes.statusCode).toEqual(200);
    expect(verifyRes.body.deal.paymentStatus).toEqual('verified');
    expect(verifyRes.body.deal.status).toEqual('active_paid');
  });

  test('Tutor sends in-person deal offer with physical mode and succeeds without validation error', async () => {
    const User = require('../src/models/User');
    const student = await User.findOne({ email: 'teststudent@pakistanlms.pk' });

    const physicalOfferRes = await request(app)
      .post('/api/deals/offer')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        studentId: student._id.toString(),
        subject: 'Hifz-ul-Quran (In-Person)',
        price: 8000,
        priceUnit: 'per_month',
        mode: 'physical',
        scheduleDetails: 'Starts 15 Sep • Mon, Wed, Fri at 5 PM PKT • In-Person Home Tuition (DHA Phase 5, Lahore)'
      });

    expect(physicalOfferRes.statusCode).toEqual(201);
    expect(physicalOfferRes.body.success).toEqual(true);
    expect(['in_person', 'physical']).toContain(physicalOfferRes.body.deal.mode);
  });

  test('Tutor cannot mark deal as completed if platform fee is unpaid, but succeeds once cleared', async () => {
    const Deal = require('../src/models/Deal');
    // Ensure the deal has uncleared fee
    await Deal.findByIdAndUpdate(dealId, {
      tutorFeePaid: false,
      paymentStatus: 'unpaid',
      platformFee: 400
    });

    // Attempt completion by tutor - should fail with 400 and PLATFORM_FEE_UNCLEARED
    const failRes = await request(app)
      .put(`/api/deals/${dealId}/complete`)
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({ notes: 'Finished course early' });

    expect(failRes.statusCode).toEqual(400);
    expect(failRes.body.success).toEqual(false);
    expect(failRes.body.code).toEqual('PLATFORM_FEE_UNCLEARED');

    // Admin clears the platform fee
    await Deal.findByIdAndUpdate(dealId, {
      tutorFeePaid: true,
      paymentStatus: 'verified'
    });

    // Attempt completion by tutor again - should succeed
    const successRes = await request(app)
      .put(`/api/deals/${dealId}/complete`)
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({ notes: 'Course successfully completed and student graduated!' });

    expect(successRes.statusCode).toEqual(200);
    expect(successRes.body.success).toEqual(true);
    expect(successRes.body.deal.status).toEqual('completed');
  });

  test('Public CMS routes return categories and Pakistani locations', async () => {
    const catRes = await request(app).get('/api/cms/categories');
    expect(catRes.statusCode).toEqual(200);
    expect(Array.isArray(catRes.body.categories)).toBe(true);

    const locRes = await request(app).get('/api/cms/locations');
    expect(locRes.statusCode).toEqual(200);
    expect(Array.isArray(locRes.body.locations)).toBe(true);
  });
});
