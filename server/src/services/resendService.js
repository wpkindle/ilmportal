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
 * Send an email via Brevo HTTP API (Port 443 / HTTPS)
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
    console.log(`📧 [LIVE EMAIL SENT VIA BREVO] MessageId: ${data.messageId} to ${JSON.stringify(to)}`);
    return {
      success: true,
      id: data.messageId || `brevo_${Date.now()}`,
      provider: 'brevo',
      data
    };
  } else {
    console.warn(`⚠️ [BREVO WARNING]:`, data);
    return {
      success: false,
      error: data.message || 'Brevo delivery failed',
      data
    };
  }
};

/**
 * Send an email via Brevo or Resend HTTP API
 */
const sendEmail = async ({
  to,
  subject,
  html,
  text,
  from = 'IlmiDunya Pakistan <info@ilmidunya.com>',
  replyTo = 'info@ilmidunya.com',
  headers = {}
}) => {
  // 1. High Priority: Brevo HTTP API (where ilmidunya.com is authenticated)
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

  // 2. High Priority: Resend HTTP API
  const client = getResendClient();

  // If no live API key is configured, simulate cleanly in development
  if (!client || !process.env.RESEND_API_KEY) {
    console.log(`[EMAIL SIMULATION] Would send email from "${from}" to "${JSON.stringify(to)}"`);
    console.log(`[EMAIL SIMULATION] Subject: "${subject}"`);
    return {
      success: true,
      id: `sim_${Date.now()}`,
      simulated: true,
      message: 'Simulated email delivery (set BREVO_API_KEY or RESEND_API_KEY for live delivery)'
    };
  }

  try {
    const recipientList = (Array.isArray(to) ? to : [to]).map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && item.address) return item.address.trim();
      if (item && item.email) return item.email.trim();
      return String(item).trim();
    });

    const rawSender = process.env.RESEND_FROM || from;
    const cleanEmail = (rawSender.match(/<([^>]+)>/) ? rawSender.match(/<([^>]+)>/)[1] : rawSender.replace(/["']/g, '')).trim();
    const sender = `IlmiDunya Pakistan <${cleanEmail}>`;

    const payload = {
      from: sender,
      to: recipientList,
      subject,
      reply_to: replyTo || 'info@ilmidunya.com',
      headers
    };

    if (html) payload.html = html;
    if (text) payload.text = text;

    const response = await client.emails.send(payload);

    if (response.error) {
      console.error('❌ [RESEND ERROR]:', response.error);
      throw new Error(response.error.message || 'Resend delivery failed');
    }

    console.log(`📧 [LIVE RESEND DISPATCH] MessageId: ${response.data?.id} to ${JSON.stringify(recipientList)}`);

    return {
      success: true,
      id: response.data?.id || `resend_${Date.now()}`,
      provider: 'resend',
      data: response.data
    };
  } catch (error) {
    console.error('❌ [RESEND EXCEPTION]:', error.message);
    throw error;
  }
};

/**
 * Fetch inbound email details from Resend Receiving API
 */
const getInboundEmail = async (emailId) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  const client = getResendClient();

  // 1. Try Resend SDK receiving API
  try {
    if (client?.emails?.receiving && typeof client.emails.receiving.get === 'function') {
      const res = await client.emails.receiving.get(emailId);
      if (res?.data) {
        return res.data;
      }
    }
  } catch (sdkErr) {
    console.warn('⚠️ [RESEND SDK INBOUND GET WARNING]:', sdkErr.message);
  }

  // 2. Direct HTTPS REST API fallback
  try {
    const response = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errBody = await response.text();
      console.error(`❌ [RESEND INBOUND REST GET ERROR] HTTP ${response.status}:`, errBody);
    }
  } catch (restErr) {
    console.error('❌ [RESEND INBOUND REST EXCEPTION]:', restErr.message);
  }

  return null;
};

module.exports = {
  sendEmail,
  getInboundEmail,
  getResendClient
};

