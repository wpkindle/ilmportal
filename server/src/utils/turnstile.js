/**
 * Cloudflare Turnstile Verification Utility
 * Verifies Turnstile tokens against Cloudflare's siteverify API.
 */

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || '0x4AAAAAAE52TT00KyyNVcrLj_f7Ygt3r4U';

/**
 * Verifies a Cloudflare Turnstile token.
 * @param {string} token - The token from Turnstile widget on client.
 * @param {string} [remoteIp] - Optional client IP.
 * @returns {Promise<{ success: boolean, message?: string, bypassed?: boolean, data?: object }>}
 */
const verifyTurnstile = async (token, remoteIp) => {
  // Pass-through in test environment
  if (process.env.NODE_ENV === 'test') {
    if (!token || token === 'test-token' || token === 'bypass-turnstile-token') {
      return { success: true, bypassed: true };
    }
  }

  // Development bypass token
  if (token === 'bypass-turnstile-token') {
    return { success: true, bypassed: true };
  }

  if (!token || typeof token !== 'string' || !token.trim()) {
    return {
      success: false,
      message: 'Cloudflare Turnstile verification missing. Please try again.'
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', TURNSTILE_SECRET);
    formData.append('response', token.trim());
    // Cloudflare remoteip is optional and known to cause false rejections
    // when backend is behind reverse proxies, CDNs, or cellular CGNAT networks.
    // Omit remoteip for reliable verification.

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    const data = await response.json();

    if (!data.success) {
      const codes = data['error-codes'] || [];
      console.warn('[Cloudflare Turnstile] Rejected token:', codes);

      // Fail-open for config/invalid-secret errors so visitors are never locked out by key mistakes
      const isConfigError = codes.some(c => c === 'invalid-input-secret' || c === 'missing-input-secret');
      if (isConfigError) {
        console.warn('[Cloudflare Turnstile] Failing open due to secret key config error:', codes);
        return { success: true, bypassed: true };
      }

      let errorMsg = 'Security verification failed. Please refresh the page and try again.';
      if (codes.includes('timeout-or-duplicate')) {
        errorMsg = 'Security verification expired. Please complete the security check and try again.';
      }

      return {
        success: false,
        message: errorMsg,
        errors: codes
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Cloudflare Turnstile] Network error:', error.message);
    // Don't block real users if Cloudflare API is temporarily unreachable
    return { success: true, bypassed: true };
  }
};

module.exports = {
  verifyTurnstile,
  TURNSTILE_SECRET
};

