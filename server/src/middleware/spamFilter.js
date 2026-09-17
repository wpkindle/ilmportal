/**
 * Anti-Spam Protection Middleware
 * Defends against automated bots, random text generators, and spam submissions.
 * 
 * Includes:
 * 1. Honeypot check (invisible form fields filled by bots)
 * 2. Random gibberish / hash text detection (e.g. kLoRVrjoIhtKWMMYtmgQoDdC, Bhgft)
 * 3. Strict rate limiting on public form submissions
 */

const rateLimit = require('express-rate-limit');

/**
 * Checks if a string looks like random gibberish or automated bot hash.
 * Examples: 'kLoRVrjoIhtKWMMYtmgQoDdC', 'JpBAASBlAwYO', 'Bhgft', 'Ygrhnj'
 */
function isGibberish(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (!trimmed) return false;

  // Pattern 1: Single long token with mixed upper/lower case and no spaces (14+ chars)
  if (/^[a-zA-Z0-9_-]{14,}$/.test(trimmed)) {
    const hasUpper = /[A-Z]/.test(trimmed);
    const hasLower = /[a-z]/.test(trimmed);
    if (hasUpper && hasLower) return true;
  }

  // Pattern 2: Word with 5 or more consecutive consonants (e.g. 'Bhgft', 'Ygrhnj')
  const words = trimmed.split(/\s+/);
  for (const w of words) {
    // Strip non-letters
    const cleanWord = w.replace(/[^a-zA-Z]/g, '');
    if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{5,}/.test(cleanWord)) {
      return true;
    }

    // Pattern 3: Erratic mid-word case switching (e.g. 'BrdNPcUSToFoTMfvJ', 'kLoRVrjoIhtKWMMYtmgQoDdC')
    const midWordCaps = (w.match(/[a-z][A-Z]/g) || []).length;
    if (midWordCaps >= 3) {
      return true;
    }
  }

  // Pattern 4: High consonant-to-vowel ratio in words >= 5 letters (e.g. 0 vowels)
  for (const w of words) {
    const cleanWord = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (cleanWord.length >= 5) {
      const vowels = (cleanWord.match(/[aeiou]/g) || []).length;
      if (vowels === 0) return true;
    }
  }

  return false;
}

/**
 * Express middleware to detect honeypot fields and spam text
 */
const spamFilter = (req, res, next) => {
  const body = req.body || {};

  // 1. Honeypot check: Bots fill hidden fields
  const honeypot = body.hp_website || body.website_url || body.business_fax || body.confirm_email_hp;
  if (honeypot && typeof honeypot === 'string' && honeypot.trim() !== '') {
    console.warn('[Anti-Spam] Honeypot triggered from IP:', req.ip, 'Value:', honeypot);
    // Return standard success to trick the bot, but DO NOT proceed
    return res.status(200).json({
      success: true,
      message: 'Submission received successfully.'
    });
  }

  // 2. Gibberish check on name, subject, or message
  const name = body.name || '';
  const subject = body.subject || '';
  const message = body.message || body.text || '';

  if (isGibberish(name)) {
    console.warn('[Anti-Spam] Blocked gibberish name:', name);
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid full name.'
    });
  }

  if (isGibberish(subject)) {
    console.warn('[Anti-Spam] Blocked gibberish subject:', subject);
    return res.status(400).json({
      success: false,
      message: 'Please provide a clear and meaningful inquiry subject.'
    });
  }

  if (isGibberish(message)) {
    console.warn('[Anti-Spam] Blocked gibberish message:', message);
    return res.status(400).json({
      success: false,
      message: 'Please provide a clear inquiry message.'
    });
  }

  next();
};

// Rate limiter for user registration (Max 5 accounts per 15 minutes per IP)
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many registration attempts from this network. Please wait 15 minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for contact us / inquiry forms (Max 4 submissions per 15 minutes per IP)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 4,
  message: {
    success: false,
    message: 'You have submitted several inquiries recently. Please wait a few minutes before submitting another.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  spamFilter,
  isGibberish,
  registrationLimiter,
  contactLimiter
};
