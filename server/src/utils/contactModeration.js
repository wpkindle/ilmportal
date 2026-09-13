/**
 * AI Contact Sharing Detection & Content Moderation Utility
 * Intercepts phone numbers, emails, and off-platform messaging solicitation.
 */

const detectContactSharing = (text) => {
  if (!text || typeof text !== 'string') return null;
  const clean = text.toLowerCase();

  // Pakistani phone formats: 03xx-xxxxxxx, +923xxxxxxxxx, 03xxxxxxxxx, or spaced/hyphenated numbers
  const phonePattern = /(?:\+?92\s*3\d{2}[-\s]?\d{7}|03\d{2}[-\s]?\d{7}|\b03\d{9}\b|\b\d{4}[-\s]?\d{7}\b)/;
  if (phonePattern.test(clean)) {
    return 'Phone number or contact digit sequence detected';
  }

  // General contiguous digit sequences (10-12 digits)
  const genericDigits = /\b\d{10,12}\b/;
  if (genericDigits.test(clean)) {
    return 'Phone number pattern detected';
  }

  // Email address
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (emailPattern.test(clean)) {
    return 'Email address detected';
  }

  // Social / messaging solicitation keywords
  const keywordPattern = /\b(whats\s*app|whatapp|watsapp|call\s*me\s*at|call\s*me\s*on|contact\s*me\s*at|contact\s*me\s*on|my\s*num(?:ber)?|reach\s*me\s*at|telegram|skype|imo\b)/i;
  if (keywordPattern.test(clean)) {
    return 'External contact solicitation keyword detected';
  }

  return null;
};

module.exports = {
  detectContactSharing
};
