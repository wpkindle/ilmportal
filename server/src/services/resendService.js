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
  from = 'IlmiDunya <info@ilmidunya.com>',
  replyTo = 'info@ilmidunya.com',
  headers = {}
}) => {
  const client = getResendClient();

  // If no live API key is configured, simulate cleanly in development
  if (!client || !process.env.RESEND_API_KEY) {
    console.log(`[RESEND SIMULATION] Would send email from "${from}" to "${to}"`);
    console.log(`[RESEND SIMULATION] Subject: "${subject}"`);
    return {
      success: true,
      id: `sim_${Date.now()}`,
      simulated: true,
      message: 'Simulated email delivery (set RESEND_API_KEY for live delivery)'
    };
  }

  try {
    const payload = {
      from,
      to: Array.isArray(to) ? to : [to],
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

