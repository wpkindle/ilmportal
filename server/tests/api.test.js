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
  });

  afterAll(async () => {
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
    tutorToken = res.body.token;

    const TutorProfile = require('../src/models/TutorProfile');
    const profile = await TutorProfile.findOne({ user: res.body.user.id });
    expect(profile.verificationStatus).toEqual('pending');
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

  test('Public CMS routes return categories and Pakistani locations', async () => {
    const catRes = await request(app).get('/api/cms/categories');
    expect(catRes.statusCode).toEqual(200);
    expect(Array.isArray(catRes.body.categories)).toBe(true);

    const locRes = await request(app).get('/api/cms/locations');
    expect(locRes.statusCode).toEqual(200);
    expect(Array.isArray(locRes.body.locations)).toBe(true);
  });
});
