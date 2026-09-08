const { Resend } = require('resend');

let resendClient = null;

const getResendClient = () => {
  if (!resendClient && process.env.RESEND_API_KEY) {
    try {
      resendClient = new Resend(process.env.RESEND_API_KEY);
      console.log('📡 [RESEND SERVICE] Initialized with API Key.');
    } catch (err) {
      console.error('❌ [RESEND SERVICE] Initialization failed:', err.message);
    }
  }
  return resendClient;
};

/**
 * Send an email via Brevo HTTP API (Primary provider where domain ilmidunya.com is verified)
 */
const sendViaBrevo = async ({ to, subject, html, text, replyTo }) => {
  if (!process.env.BREVO_API_KEY) return null;

  const senderEmail = process.env.BREVO_FROM || process.env.SMTP_FROM || 'info@ilmidunya.com';
  const senderName = 'IlmiDunya Pakistan';

  const recipientList = (Array.isArray(to) ? to : [to]).map((item) => {
    if (typeof item === 'string') return { email: item.trim() };
    if (item && item.address) return { email: item.address.trim(), name: item.name };
    if (item && item.email) return { email: item.email.trim(), name: item.name };
    return { email: String(item).trim() };
  });

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY.trim(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: recipientList,
      replyTo: { name: 'IlmiDunya Support', email: replyTo || 'info@ilmidunya.com' },
      subject,
      htmlContent: html || `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">${(text || '').replace(/\n/g, '<br/>')}</div>`,
      textContent: text || (html ? html.replace(/<[^>]*>?/gm, '') : '')
    })
  });

  const data = await res.json();
  if (res.ok) {
    console.log(`📧 [LIVE MAILBOX SENT VIA BREVO] MessageId: ${data.messageId} to ${JSON.stringify(to)}`);
    return {
      success: true,
      id: data.messageId || `brevo_${Date.now()}`,
      provider: 'brevo',
      data
    };
  } else {
    console.warn(`⚠️ [BREVO MAILBOX WARNING]:`, data);
    return {
      success: false,
      error: data.message || 'Brevo delivery failed',
      data
    };
  }
};

/**
 * Send an email via Brevo / Resend / SMTP
 */
const sendEmail = async ({
  to,
  subject,
  html,
  text,
  from = 'IlmiDunya <info@ilmidunya.com>',
  replyTo = 'info@ilmidunya.com',
  headers = {}
}) => {
  // 1. First priority: Brevo HTTP API (where ilmidunya.com is authenticated)
  if (process.env.BREVO_API_KEY) {
    try {
      const brevoResult = await sendViaBrevo({ to, subject, html, text, replyTo });
      if (brevoResult && brevoResult.success) {
        return brevoResult;
      }
      console.warn(`⚠️ [BREVO DISPATCH FAILED, TRYING FALLBACK]:`, brevoResult?.error);
    } catch (brevoErr) {
      console.error('❌ [BREVO DISPATCH EXCEPTION]:', brevoErr.message);
    }
  }

  // 2. Second priority: Resend API (if configured)
  const client = getResendClient();
  if (client && process.env.RESEND_API_KEY) {
    try {
      const recipientList = (Array.isArray(to) ? to : [to]).map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && item.address) return item.address.trim();
        if (item && item.email) return item.email.trim();
        return String(item).trim();
      });

      const payload = {
        from,
        to: recipientList,
        subject,
        reply_to: replyTo,
        headers
      };

      if (html) payload.html = html;
      if (text) payload.text = text;

      const response = await client.emails.send(payload);

      if (response.error) {
        console.error('❌ [RESEND ERROR]:', response.error);
        throw new Error(response.error.message || 'Resend delivery failed');
      }

      return {
        success: true,
        id: response.data?.id || `resend_${Date.now()}`,
        provider: 'resend',
        data: response.data
      };
    } catch (error) {
      console.warn('⚠️ [RESEND EXCEPTION]:', error.message);
      // If error is about unverified domain on Resend, give clear guidance
      if (error.message && error.message.includes('resend.com/domains') && !process.env.BREVO_API_KEY) {
        throw new Error(`Domain verification notice: ${error.message}. Alternatively, configure BREVO_API_KEY on Render where ilmidunya.com is verified.`);
      }
      throw error;
    }
  }

  // 3. Fallback: Development simulation if neither live key is set
  console.log(`[EMAIL SIMULATION] Would send email from "${from}" to "${JSON.stringify(to)}"`);
  console.log(`[EMAIL SIMULATION] Subject: "${subject}"`);
  return {
    success: true,
    id: `sim_${Date.now()}`,
    simulated: true,
    message: 'Simulated email delivery (set BREVO_API_KEY or RESEND_API_KEY for live delivery)'
  };
};

/**
 * Fetch inbound email details from Resend Receiving API
 */
const getInboundEmail = async (emailId) => {
  const client = getResendClient();
  if (!client || !process.env.RESEND_API_KEY) {
    return null;
  }

  try {
    if (client.emails && client.emails.receiving && typeof client.emails.receiving.get === 'function') {
      const res = await client.emails.receiving.get(emailId);
      return res.data || null;
    }
  } catch (err) {
    console.error('❌ [RESEND INBOUND GET ERROR]:', err.message);
  }
  return null;
};

module.exports = {
  sendEmail,
  getInboundEmail,
  getResendClient
};

