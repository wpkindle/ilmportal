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
 * Send an email via Resend API
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
  const client = getResendClient();

  // If no live API key is configured, simulate cleanly in development
  if (!client || !process.env.RESEND_API_KEY) {
    console.log(`[RESEND SIMULATION] Would send email from "${from}" to "${JSON.stringify(to)}"`);
    console.log(`[RESEND SIMULATION] Subject: "${subject}"`);
    return {
      success: true,
      id: `sim_${Date.now()}`,
      simulated: true,
      message: 'Simulated email delivery (set RESEND_API_KEY for live delivery)'
    };
  }

  try {
    const recipientList = (Array.isArray(to) ? to : [to]).map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && item.address) return item.address.trim();
      if (item && item.email) return item.email.trim();
      return String(item).trim();
    });

    const sender = process.env.RESEND_FROM || from;

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

