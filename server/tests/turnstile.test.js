const { verifyTurnstile } = require('../src/utils/turnstile');
const { requireTurnstile } = require('../src/middleware/turnstileMiddleware');

describe('Cloudflare Turnstile Verification & Middleware Tests', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test('verifyTurnstile rejects empty or missing token', async () => {
    process.env.NODE_ENV = 'production';
    const result1 = await verifyTurnstile('');
    expect(result1.success).toBe(false);
    expect(result1.message).toMatch(/Turnstile/i);

    const result2 = await verifyTurnstile(null);
    expect(result2.success).toBe(false);
  });

  test('verifyTurnstile accepts bypass token', async () => {
    process.env.NODE_ENV = 'production';
    const result = await verifyTurnstile('bypass-turnstile-token');
    expect(result.success).toBe(true);
    expect(result.bypassed).toBe(true);
  });

  test('verifyTurnstile accepts test-token in test environment', async () => {
    process.env.NODE_ENV = 'test';
    const result = await verifyTurnstile('test-token');
    expect(result.success).toBe(true);
    expect(result.bypassed).toBe(true);
  });

  test('requireTurnstile middleware blocks request if token is missing in production', async () => {
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

    await requireTurnstile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/Turnstile/i)
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('requireTurnstile middleware allows pass-through in test env when token is absent', async () => {
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

    await requireTurnstile(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('requireTurnstile middleware allows request with valid bypass token', async () => {
    process.env.NODE_ENV = 'production';
    const req = {
      body: { turnstileToken: 'bypass-turnstile-token' },
      headers: {},
      ip: '127.0.0.1'
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await requireTurnstile(req, res, next);
    expect(req.turnstileVerified).toBe(true);
    expect(next).toHaveBeenCalled();
  });
});

