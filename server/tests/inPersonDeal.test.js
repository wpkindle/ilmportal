const request = require('supertest');
const { app, server } = require('../src/server');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Deal = require('../src/models/Deal');
const jwt = require('jsonwebtoken');

jest.setTimeout(30000);

describe('In-Person Deal Video Classroom Access Tests', () => {
  let studentUser;
  let tutorUser;
  let studentToken;
  let tutorToken;

  beforeAll(async () => {
    await connectDB();
    
    // Clean up test data
    await User.deleteMany({ email: { $in: ['inperson_student@ilmidunya.pk', 'inperson_tutor@ilmidunya.pk'] } });

    // Create student & tutor
    studentUser = await User.create({
      name: 'InPerson Student',
      email: 'inperson_student@ilmidunya.pk',
      password: 'Password@123',
      role: 'student',
      city: 'Lahore',
      isEmailVerified: true
    });

    tutorUser = await User.create({
      name: 'InPerson Tutor',
      email: 'inperson_tutor@ilmidunya.pk',
      password: 'Password@123',
      role: 'tutor',
      city: 'Lahore',
      isEmailVerified: true
    });

    studentToken = jwt.sign({ id: studentUser._id, role: studentUser.role }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1d' });
    tutorToken = jwt.sign({ id: tutorUser._id, role: tutorUser.role }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1d' });
  });

  afterAll(async () => {
    await Deal.deleteMany({
      $or: [
        { student: studentUser._id },
        { tutor: tutorUser._id }
      ]
    });
    await User.deleteMany({ email: { $in: ['inperson_student@ilmidunya.pk', 'inperson_tutor@ilmidunya.pk'] } });
    await disconnectDB();
    server.close();
  });

  test('blocks video classroom access for in-person deals with 403 and isInPerson: true', async () => {
    // Create in-person deal
    const deal = await Deal.create({
      student: studentUser._id,
      tutor: tutorUser._id,
      subject: 'Tajweed-ul-Quran (Home)',
      mode: 'in_person',
      price: 15000,
      priceUnit: 'per_month',
      status: 'active_trial',
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 72 * 60 * 60 * 1000)
    });

    const roomId = [studentUser._id.toString(), tutorUser._id.toString()].sort().join('_');

    const res = await request(app)
      .get(`/api/sessions/room/${roomId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.isDenied).toBe(true);
    expect(res.body.isInPerson).toBe(true);
    expect(res.body.message).toContain('in-person');

    // Clean up deal
    await Deal.findByIdAndDelete(deal._id);
  });

  test('allows video classroom access for online deals', async () => {
    // Create online deal
    const onlineDeal = await Deal.create({
      student: studentUser._id,
      tutor: tutorUser._id,
      subject: 'Quran Reading (Online)',
      mode: 'online',
      price: 12000,
      priceUnit: 'per_month',
      status: 'active_trial',
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 72 * 60 * 60 * 1000)
    });

    const roomId = [studentUser._id.toString(), tutorUser._id.toString()].sort().join('_');

    const res = await request(app)
      .get(`/api/sessions/room/${roomId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.session).toBeDefined();

    // Clean up deal
    await Deal.findByIdAndDelete(onlineDeal._id);
  });
});
