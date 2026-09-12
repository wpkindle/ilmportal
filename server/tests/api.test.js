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
    profile.paymentMethods = [
      {
        method: 'bank',
        bankName: 'Meezan Bank',
        accountTitle: 'Qari Test Tutor',
        accountNumber: 'PK12MEZN0000123456789012',
        isDefault: true
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

  test('Student leaves review for completed deal and review updates tutor profile rating', async () => {
    const Deal = require('../src/models/Deal');
    const TutorProfile = require('../src/models/TutorProfile');
    const deal = await Deal.findById(dealId);

    const reviewRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        tutorId: deal.tutor.toString(),
        dealId: dealId,
        rating: 5,
        comment: 'Outstanding tutor! Tajweed and makharij explanations were crystal clear.'
      });

    expect(reviewRes.statusCode).toEqual(201);
    expect(reviewRes.body.success).toEqual(true);
    expect(reviewRes.body.ratingAverage).toEqual(5);
    expect(reviewRes.body.ratingCount).toEqual(1);

    // Verify Deal is marked as reviewed
    const updatedDeal = await Deal.findById(dealId);
    expect(updatedDeal.isReviewed).toBe(true);
    expect(updatedDeal.review).toBeDefined();

    // Verify TutorProfile has updated ratingAverage and ratingCount
    const tutorProf = await TutorProfile.findOne({ user: deal.tutor });
    expect(tutorProf.ratingAverage).toEqual(5);
    expect(tutorProf.ratingCount).toEqual(1);

    // Verify public tutor reviews endpoint returns the review
    const pubReviewsRes = await request(app).get(`/api/reviews/tutor/${deal.tutor}`);
    expect(pubReviewsRes.statusCode).toEqual(200);
    expect(pubReviewsRes.body.count).toEqual(1);
    expect(pubReviewsRes.body.reviews[0].rating).toEqual(5);
    expect(pubReviewsRes.body.reviews[0].comment).toContain('Outstanding tutor');
  });

  test('Tutor leaves review for completed deal and review appears in student reviews endpoint', async () => {
    const Deal = require('../src/models/Deal');
    const deal = await Deal.findById(dealId);

    const tutorReviewRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        studentId: deal.student.toString(),
        dealId: dealId,
        rating: 5,
        comment: 'Dedicated learner! Punctual, attentive, and completed all homework tasks on time.',
        quickTags: ['Dedicated Learner', 'Punctual & Respectful']
      });

    expect(tutorReviewRes.statusCode).toEqual(201);
    expect(tutorReviewRes.body.success).toEqual(true);
    expect(tutorReviewRes.body.review.targetRole).toEqual('student');
    expect(tutorReviewRes.body.review.reviewerRole).toEqual('tutor');

    // Verify Deal is marked as tutor reviewed
    const updatedDeal = await Deal.findById(dealId);
    expect(updatedDeal.isTutorReviewed).toBe(true);
    expect(updatedDeal.tutorReview).toBeDefined();

    // Verify student reviews endpoint returns the review
    const studentReviewsRes = await request(app).get(`/api/reviews/student/${deal.student}`);
    expect(studentReviewsRes.statusCode).toEqual(200);
    expect(studentReviewsRes.body.count).toEqual(1);
    expect(studentReviewsRes.body.reviews[0].comment).toContain('Dedicated learner');
    expect(studentReviewsRes.body.reviews[0].quickTags).toContain('Dedicated Learner');
  });

  test('Tutor reports an inappropriate review to admin and admin overrides rating and comment', async () => {
    const Deal = require('../src/models/Deal');
    const deal = await Deal.findById(dealId);
    const reviewId = deal.studentReview;

    // 1. Tutor reports the student review
    const reportRes = await request(app)
      .post(`/api/reviews/${reviewId}/report`)
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        reason: 'disputed_claim',
        details: 'Review contains inaccurate information regarding lesson schedule.'
      });

    expect(reportRes.statusCode).toEqual(200);
    expect(reportRes.body.success).toBe(true);
    expect(reportRes.body.review.status).toEqual('flagged');
    expect(reportRes.body.review.isReported).toBe(true);

    // 2. Admin fetches all reviews filtered by flagged
    const adminReviewsRes = await request(app)
      .get('/api/admin/reviews?status=flagged')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminReviewsRes.statusCode).toEqual(200);
    expect(adminReviewsRes.body.reviews.some(r => r._id.toString() === reviewId.toString())).toBe(true);

    // 3. Admin moderates and overrides the review
    const overrideRes = await request(app)
      .put(`/api/admin/reviews/${reviewId}/override`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        rating: 5,
        comment: 'Outstanding tutor! Verified by administration.',
        status: 'published'
      });

    expect(overrideRes.statusCode).toEqual(200);
    expect(overrideRes.body.success).toBe(true);
    expect(overrideRes.body.review.adminEdited).toBe(true);
    expect(overrideRes.body.review.status).toEqual('published');
    expect(overrideRes.body.review.isReported).toBe(false);
  });

  test('Public CMS routes return categories and Pakistani locations', async () => {
    const catRes = await request(app).get('/api/cms/categories');
    expect(catRes.statusCode).toEqual(200);
    expect(Array.isArray(catRes.body.categories)).toBe(true);

    const locRes = await request(app).get('/api/cms/locations');
    expect(locRes.statusCode).toEqual(200);
    expect(Array.isArray(locRes.body.locations)).toBe(true);
  });

  test('Tutor can set optional video intro without affecting profile completion or health', async () => {
    // 1. Tutor updates profile with videoIntro URL
    const updateRes = await request(app)
      .put('/api/tutors/profile/me')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        videoIntro: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      });

    expect(updateRes.statusCode).toEqual(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.profile.videoIntro).toEqual('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    // Profile health/completion must remain 100%
    expect(updateRes.body.completion.percentage).toEqual(100);

    // 2. Fetch public profile and verify videoIntro is returned
    const publicRes = await request(app).get(`/api/tutors/${tutorProfileId}`);
    expect(publicRes.statusCode).toEqual(200);
    expect(publicRes.body.success).toBe(true);
    expect(publicRes.body.tutor.videoIntro).toEqual('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    // 3. Test video-intro upload endpoint with multipart file upload
    const fileUploadRes = await request(app)
      .post('/api/tutors/video-intro/upload')
      .set('Authorization', `Bearer ${tutorToken}`)
      .attach('video', Buffer.from('fake-mp4-video-stream'), 'intro.mp4');

    expect(fileUploadRes.statusCode).toEqual(200);
    expect(fileUploadRes.body.success).toBe(true);
    expect(fileUploadRes.body.videoIntro).toMatch(/(\/uploads\/video-intro|res\.cloudinary\.com)/);

    // 4. Fetch profile with auth token and verify videoIntro is populated
    const authProfileRes = await request(app)
      .get(`/api/tutors/${tutorProfileId}`)
      .set('Authorization', `Bearer ${tutorToken}`);
    expect(authProfileRes.statusCode).toEqual(200);
    expect(authProfileRes.body.tutor.videoIntro).toEqual(fileUploadRes.body.videoIntro);

    // 5. Test video-intro upload endpoint with videoUrl payload
    const uploadRes = await request(app)
      .post('/api/tutors/video-intro/upload')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        videoUrl: 'https://www.loom.com/share/test12345'
      });

    expect(uploadRes.statusCode).toEqual(200);
    expect(uploadRes.body.success).toBe(true);
    expect(uploadRes.body.videoIntro).toEqual('https://www.loom.com/share/test12345');

    // 6. Tutor can clear video intro and completion remains 100%
    const clearRes = await request(app)
      .put('/api/tutors/profile/me')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        videoIntro: ''
      });

    expect(clearRes.statusCode).toEqual(200);
    expect(clearRes.body.profile.videoIntro).toEqual('');
    expect(clearRes.body.completion.percentage).toEqual(100);
  });

  test('Tutor can add multiple payment methods (Bank, Raast, EasyPaisa, JazzCash, UPaisa)', async () => {
    // 1. Add EasyPaisa
    const epRes = await request(app)
      .post('/api/tutors/payment-methods')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        method: 'easypaisa',
        accountTitle: 'Qari Test Tutor',
        accountNumber: '03001234567',
        instructions: 'Send via EasyPaisa app'
      });

    expect(epRes.statusCode).toEqual(201);
    expect(epRes.body.success).toBe(true);
    expect(epRes.body.paymentMethods.length).toBeGreaterThanOrEqual(2);

    // 2. Add Raast ID
    const raastRes = await request(app)
      .post('/api/tutors/payment-methods')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        method: 'raast',
        accountTitle: 'Qari Test Tutor',
        accountNumber: '03001234567',
        instructions: 'Instant zero-fee transfer via Raast'
      });

    expect(raastRes.statusCode).toEqual(201);
    expect(raastRes.body.success).toBe(true);

    // 3. Add JazzCash
    const jcRes = await request(app)
      .post('/api/tutors/payment-methods')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        method: 'jazzcash',
        accountTitle: 'Qari Test Tutor',
        accountNumber: '03009876543'
      });

    expect(jcRes.statusCode).toEqual(201);
    expect(jcRes.body.success).toBe(true);

    // 4. Add UPaisa
    const upRes = await request(app)
      .post('/api/tutors/payment-methods')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        method: 'upaisa',
        accountTitle: 'Qari Test Tutor',
        accountNumber: '03121234567'
      });

    expect(upRes.statusCode).toEqual(201);
    expect(upRes.body.success).toBe(true);

    // Verify GET /api/tutors/payment-methods returns all
    const getRes = await request(app)
      .get('/api/tutors/payment-methods')
      .set('Authorization', `Bearer ${tutorToken}`);

    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body.paymentMethods.length).toBe(5);
  });

  test('Tutor dispatches tuition payment request with 3-day threshold and student submits proof', async () => {
    const Deal = require('../src/models/Deal');
    const deal = await Deal.findById(dealId);
    expect(deal).toBeDefined();

    // 1. Tutor creates payment request
    const prRes = await request(app)
      .post('/api/payment-requests')
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        dealId: deal._id.toString(),
        amount: 6000,
        title: 'Monthly Tuition Fee - September 2026',
        description: 'Tuition fee for 12 classes'
      });

    expect(prRes.statusCode).toEqual(201);
    expect(prRes.body.success).toBe(true);
    const createdPR = prRes.body.paymentRequest;
    expect(createdPR.amount).toBe(6000);
    expect(createdPR.status).toBe('pending');
    expect(createdPR.paymentMethods.length).toBe(5);

    // Verify 3-day (72-hour) threshold
    const dueDate = new Date(createdPR.dueDate).getTime();
    const now = Date.now();
    const diffHours = (dueDate - now) / (1000 * 60 * 60);
    expect(diffHours).toBeGreaterThan(70);
    expect(diffHours).toBeLessThanOrEqual(72.1);

    // 2. Student fetches payment requests for deal
    const listRes = await request(app)
      .get(`/api/payment-requests/deal/${deal._id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(listRes.statusCode).toEqual(200);
    expect(listRes.body.paymentRequests.length).toBeGreaterThanOrEqual(1);

    // 3. Student submits payment proof
    const proofRes = await request(app)
      .post(`/api/payment-requests/${createdPR._id}/proof`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        method: 'easypaisa',
        transactionId: 'EP-9876543210',
        senderAccountTitle: 'Test Student',
        notes: 'Transferred from my EasyPaisa app'
      });

    expect(proofRes.statusCode).toEqual(200);
    expect(proofRes.body.success).toBe(true);
    expect(proofRes.body.paymentRequest.status).toBe('proof_submitted');

    // 4. Tutor clears payment request
    const clearPRRes = await request(app)
      .post(`/api/payment-requests/${createdPR._id}/clear`)
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        clearanceNotes: 'Verified received in EasyPaisa account'
      });

    expect(clearPRRes.statusCode).toEqual(200);
    expect(clearPRRes.body.success).toBe(true);
    expect(clearPRRes.body.paymentRequest.status).toBe('cleared');
    expect(clearPRRes.body.deal.accessRestricted).toBe(false);
  });
});

