const { verifyRecaptcha } = require('../utils/recaptcha');

/**
 * Express middleware to enforce Google reCAPTCHA verification on sensitive public endpoints.
 */
const requireRecaptcha = async (req, res, next) => {
  const token =
    req.body?.captchaToken ||
    req.body?.['g-recaptcha-response'] ||
    req.headers?.['x-recaptcha-token'];

  // Test suite pass-through when no token is explicitly sent
  if (process.env.NODE_ENV === 'test' && !token) {
    return next();
  }

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Please complete the reCAPTCHA verification ("I am not a robot") to proceed.'
    });
  }

  // Obtain client IP (checking proxy headers if available)
  const clientIp =
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip;

  const result = await verifyRecaptcha(token, clientIp);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message || 'reCAPTCHA verification failed. Please try again.'
    });
  }

  // Attach verification status to request for downstream handlers if needed
  req.recaptchaVerified = true;
  next();
};

module.exports = {
  requireRecaptcha
};

