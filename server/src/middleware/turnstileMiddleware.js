const { verifyTurnstile } = require('../utils/turnstile');

/**
 * Express middleware to enforce Cloudflare Turnstile verification on sensitive endpoints.
 */
const requireTurnstile = async (req, res, next) => {
  const token =
    req.body?.turnstileToken ||
    req.body?.captchaToken ||
    req.body?.['cf-turnstile-response'] ||
    req.headers?.['x-turnstile-token'];

  // Test suite pass-through when no token is explicitly sent
  if (process.env.NODE_ENV === 'test' && !token) {
    return next();
  }

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Please complete the Cloudflare Turnstile verification to proceed.'
    });
  }

  // Obtain client IP
  const clientIp =
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip;

  const result = await verifyTurnstile(token, clientIp);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message || 'Security verification failed. Please try again.'
    });
  }

  req.turnstileVerified = true;
  next();
};

module.exports = {
  requireTurnstile
};

