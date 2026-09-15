const { verifyRecaptcha } = require('../src/utils/recaptcha');
const { requireRecaptcha } = require('../src/middleware/recaptchaMiddleware');

describe('reCAPTCHA Verification & Middleware Tests', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test('verifyRecaptcha rejects empty or missing token', async () => {
    // Force non-test to test raw validation
    process.env.NODE_ENV = 'production';
    const result1 = await verifyRecaptcha('');
    expect(result1.success).toBe(false);
    expect(result1.message).toMatch(/reCAPTCHA/i);

    const result2 = await verifyRecaptcha(null);
    expect(result2.success).toBe(false);
  });

  test('verifyRecaptcha accepts bypass token', async () => {
    process.env.NODE_ENV = 'production';
    const result = await verifyRecaptcha('bypass-recaptcha-token');
    expect(result.success).toBe(true);
    expect(result.bypassed).toBe(true);
  });

  test('verifyRecaptcha accepts test-token when in test environment', async () => {
    process.env.NODE_ENV = 'test';
    const result = await verifyRecaptcha('test-token');
    expect(result.success).toBe(true);
    expect(result.bypassed).toBe(true);
  });

  test('requireRecaptcha middleware blocks request if token is missing in production', async () => {
    process.env.NODE_ENV = 'production';
    const req = {
      body: {},
      headers: {},
      ip: '127.0.0.1'
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await requireRecaptcha(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/reCAPTCHA/i)
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('requireRecaptcha middleware allows pass-through in test env when token is absent', async () => {
    process.env.NODE_ENV = 'test';
    const req = {
      body: {},
      headers: {},
      ip: '127.0.0.1'
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await requireRecaptcha(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('requireRecaptcha middleware allows request with valid bypass token', async () => {
    process.env.NODE_ENV = 'production';
    const req = {
      body: { captchaToken: 'bypass-recaptcha-token' },
      headers: {},
      ip: '127.0.0.1'
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await requireRecaptcha(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.recaptchaVerified).toBe(true);
  });
});

