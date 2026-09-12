const nodemailer = require('nodemailer');

let transporter = null;

const getSmtpPass = () => (process.env.SMTP_PASS || 'wlisogtqcfzmaunw').replace(/\s+/g, '');

const initTransporter = () => {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER || 'info@ilmidunya.com';
    const smtpPass = getSmtpPass();
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpService = process.env.SMTP_SERVICE || 'gmail';

    if (smtpService === 'gmail' || (!smtpHost && smtpUser && smtpPass)) {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        connectionTimeout: 7000,
        greetingTimeout: 5000,
        socketTimeout: 8000
      });
      console.log(`📡 [EMAIL SERVICE] Configured with Gmail SSL port 465 for ${smtpUser}`);
    } else if (smtpHost && smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465 || process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        connectionTimeout: 7000,
        greetingTimeout: 5000,
        socketTimeout: 8000,
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log(`📡 [EMAIL SERVICE] Configured with custom SMTP host: ${smtpHost}:${smtpPort}`);
    } else {
      console.log(`⚠️ [EMAIL SERVICE] No live SMTP configured. Using development console logger.`);
    }
  } catch (e) {
    console.error('Error initializing email transporter:', e.message);
  }
};

initTransporter();

/**
 * Returns the verified frontend base URL for email links.
 * Overrides any obsolete 'ilmportal' or 'vercel.app' domains so links always
 * go through https://ilmidunya.com.
 */
const getClientBaseUrl = (req = null) => {
  if (req) {
    const origin = req.headers?.origin || req.headers?.referer;
    if (origin) {
      try {
        const parsed = new URL(origin);
        if (
          parsed.hostname === 'ilmidunya.com' ||
          parsed.hostname.endsWith('.ilmidunya.com') ||
          parsed.hostname === 'localhost' ||
          parsed.hostname === '127.0.0.1'
        ) {
          return `${parsed.protocol}//${parsed.host}`;
        }
      } catch (e) {}
    }
  }

  const rawUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;
  if (rawUrl) {
    const trimmed = String(rawUrl).trim().replace(/\/$/, '');
    // If the configured CLIENT_URL points to legacy ilmportal or vercel domains, force official ilmidunya.com
    if (trimmed.includes('ilmportal') || trimmed.includes('vercel.app')) {
      return 'https://ilmidunya.com';
    }
    if (trimmed.includes('localhost') || trimmed.includes('127.0.0.1')) {
      return trimmed;
    }
    if (trimmed.includes('ilmidunya.com')) {
      return trimmed;
    }
  }

  return 'https://ilmidunya.com';
};

const extractEmailAddress = (raw) => {
  if (!raw) return 'info@ilmidunya.com';
  const str = String(raw).trim();
  const match = str.match(/<([^>]+)>/);
  const candidate = (match ? match[1] : str.replace(/["']/g, '')).trim();
  if (candidate && candidate.includes('@') && candidate.includes('.')) {
    return candidate;
  }
  return 'info@ilmidunya.com';
};

// Helper to get formatted from address safely avoiding double brackets
const getFromAddress = () => {
  const cleanEmail = extractEmailAddress(process.env.SMTP_FROM || process.env.RESEND_FROM || process.env.SMTP_USER);
  return `"IlmiDunya Pakistan" <${cleanEmail}>`;
};

// Helper to check if recipient is developer email (admin requested all notifications land exclusively in admin dashboard)
const isSuppressedDeveloperEmail = (to) => {
  if (!to) return false;
  const list = Array.isArray(to) ? to : [to];
  return list.some((item) => {
    const raw = typeof item === 'string' ? item : (item?.email || item?.address || '');
    return String(raw).toLowerCase().trim().includes('abdulkhaliqwebdeveloper@gmail.com');
  });
};

// HTTP REST API Email Dispatch (Port 443 / HTTPS - NEVER blocked by cloud firewalls)
const sendViaHttpApi = async ({ to, subject, html, text }) => {
  if (isSuppressedDeveloperEmail(to)) {
    console.log(`🛡️ [EMAIL SUPPRESSED] Prevented external email to ${JSON.stringify(to)} for "${subject}". In-app Admin Dashboard notification active.`);
    return { success: true, suppressed: true, message: 'Email dispatch suppressed for developer email; in-app dashboard notification active.' };
  }
  let lastError = null;

  // 1. Brevo HTTP API (https://api.brevo.com/v3/smtp/email) - where ilmidunya.com is authenticated
  if (process.env.BREVO_API_KEY) {
    try {
      const cleanEmail = extractEmailAddress(process.env.BREVO_FROM || process.env.SMTP_FROM || process.env.RESEND_FROM);

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY.trim(),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'IlmiDunya Pakistan', email: cleanEmail },
          to: (Array.isArray(to) ? to : [to]).map(e => ({ email: typeof e === 'string' ? e.trim() : (e.email || e.address || String(e)).trim() })),
          subject,
          htmlContent: html,
          textContent: text || (html ? html.replace(/<[^>]*>?/gm, '') : '')
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`📧 [LIVE EMAIL SENT VIA BREVO HTTP API] MessageId: ${data.messageId} to ${JSON.stringify(to)}`);
        return { success: true, messageId: data.messageId, provider: 'brevo', response: '250 OK via Brevo' };
      } else {
        console.error('Brevo HTTP API error:', data);
        lastError = { success: false, error: data.message || 'Brevo error', provider: 'brevo' };
      }
    } catch (err) {
      console.error('Brevo fetch error:', err.message);
      lastError = { success: false, error: err.message, provider: 'brevo' };
    }
  }

  // 2. Resend HTTP API (https://resend.com)
  if (process.env.RESEND_API_KEY) {
    try {
      const cleanEmail = extractEmailAddress(process.env.RESEND_FROM || process.env.SMTP_FROM);
      const fromAddr = `IlmiDunya Pakistan <${cleanEmail}>`;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddr,
          to: Array.isArray(to) ? to : [to],
          reply_to: 'info@ilmidunya.com',
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, '')
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`📧 [LIVE EMAIL SENT VIA RESEND HTTP API] MessageId: ${data.id} to ${JSON.stringify(to)}`);
        return { success: true, messageId: data.id, provider: 'resend', response: '250 OK via Resend' };
      } else {
        console.error('Resend HTTP API error:', data);
        lastError = { success: false, error: data.message || 'Resend error', provider: 'resend' };
      }
    } catch (err) {
      console.error('Resend fetch error:', err.message);
      lastError = { success: false, error: err.message, provider: 'resend' };
    }
  }

  return lastError;
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (isSuppressedDeveloperEmail(to)) {
    console.log(`🛡️ [EMAIL SUPPRESSED] Prevented external email to ${JSON.stringify(to)} for "${subject}". Admin notifications land directly in Admin Dashboard.`);
    return true;
  }
  const httpResult = await sendViaHttpApi({ to, subject, html, text });
  if (httpResult && httpResult.success) {
    return true;
  }

  try {
    if (transporter) {
      const fromAddress = getFromAddress();
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text: text || html.replace(/<[^>]*>?/gm, ''),
        html
      });
      console.log(`\n======================================================`);
      console.log(`📧 [LIVE EMAIL SENT SUCCESSFULLY VIA SMTP]`);
      console.log(`📬 To: ${to}`);
      console.log(`📋 Subject: ${subject}`);
      console.log(`🆔 MessageId: ${info.messageId}`);
      console.log(`======================================================\n`);
      return true;
    } else {
      console.log(`\n======================================================`);
      console.log(`📧 [EMAIL DISPATCHED TO: ${to}]`);
      console.log(`📋 Subject: ${subject}`);
      console.log(`📝 Content:\n${text || html.replace(/<[^>]*>?/gm, '')}`);
      console.log(`======================================================\n`);
      return true;
    }
  } catch (error) {
    console.error('Email sending error:', error.message);
    return false;
  }
};

const getTransporter = (port = 587) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER || 'info@ilmidunya.com';
  const smtpPass = getSmtpPass();

  if (smtpHost) {
    const customPort = parseInt(process.env.SMTP_PORT || port, 10);
    return nodemailer.createTransport({
      host: smtpHost,
      port: customPort,
      secure: customPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 4000,
      greetingTimeout: 3000,
      socketTimeout: 5000,
      tls: { rejectUnauthorized: false }
    });
  }

  // Gmail SMTP
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: port,
    secure: port === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 4000,
    greetingTimeout: 3000,
    socketTimeout: 5000
  });
};

const sendEmailDetailed = async ({ to, subject, html, text, replyTo }) => {
  if (isSuppressedDeveloperEmail(to)) {
    console.log(`🛡️ [EMAIL SUPPRESSED] Prevented external email to ${JSON.stringify(to)} for "${subject}". Admin notifications land directly in Admin Dashboard.`);
    return { success: true, suppressed: true, message: 'Email dispatch suppressed for developer email; in-app dashboard notification active.' };
  }

  // 1. High Priority: HTTP REST API (Brevo / Resend) - instant, never blocked by cloud firewalls
  if (process.env.BREVO_API_KEY || process.env.RESEND_API_KEY) {
    const httpResult = await sendViaHttpApi({ to, subject, html, text });
    if (httpResult && httpResult.success) {
      return httpResult;
    }
    console.warn('⚠️ [EMAIL SERVICE] HTTP API dispatch failed, attempting SMTP fallback...');
  }

  const fromAddress = getFromAddress();
  const mailPayload = {
    from: fromAddress,
    to,
    subject,
    text: text || html.replace(/<[^>]*>?/gm, ''),
    html
  };
  const replyToAddress = replyTo || extractEmailAddress(process.env.RESEND_FROM || process.env.SMTP_FROM);
  if (replyToAddress) {
    mailPayload.replyTo = replyToAddress;
  }

  // 2. Direct Gmail SMTP Port 587
  try {
    const t587 = getTransporter(587);
    const info587 = await t587.sendMail(mailPayload);
    console.log(`\n======================================================`);
    console.log(`📧 [LIVE EMAIL SENT SUCCESSFULLY VIA GMAIL PORT 587]`);
    console.log(`📬 To: ${to}`);
    console.log(`📋 Subject: ${subject}`);
    console.log(`🆔 MessageId: ${info587.messageId}`);
    console.log(`======================================================\n`);
    return { success: true, messageId: info587.messageId, response: info587.response, to, provider: 'gmail-port-587' };
  } catch (err587) {
    console.warn(`⚠️ [EMAIL SERVICE] Port 587 failed (${err587.message}). Trying fallback Port 465 SSL...`);

    // 3. Direct Gmail SMTP Port 465 (SSL)
    try {
      const t465 = getTransporter(465);
      const info465 = await t465.sendMail(mailPayload);
      console.log(`\n======================================================`);
      console.log(`📧 [LIVE EMAIL SENT SUCCESSFULLY VIA GMAIL PORT 465]`);
      console.log(`📬 To: ${to}`);
      console.log(`📋 Subject: ${subject}`);
      console.log(`🆔 MessageId: ${info465.messageId}`);
      console.log(`======================================================\n`);
      return { success: true, messageId: info465.messageId, response: info465.response, to, provider: 'gmail-port-465' };
    } catch (err465) {
      console.warn(`⚠️ [EMAIL SERVICE] Both Port 587 and 465 failed.`);

      // 4. Fallback to HTTP API if not attempted yet
      const httpResult = await sendViaHttpApi({ to, subject, html, text });
      if (httpResult && httpResult.success) {
        return httpResult;
      }

      return {
        success: false,
        error: `Port 587: ${err587.message} | Port 465: ${err465.message} | HTTP: ${httpResult?.error || 'unconfigured'}`,
        provider: 'all-failed'
      };
    }
  }
};

// ==========================================
// 1. VERIFICATION OTP EMAIL TEMPLATE
// ==========================================
const sendVerificationOtpEmail = async (to, name, otp, token, role = 'student', req = null) => {
  const isTutor = role === 'tutor';
  const clientUrl = getClientBaseUrl(req);
  const tokenParam = token || otp;
  const verifyLink = `${clientUrl}/verify-email?token=${encodeURIComponent(tokenParam)}&email=${encodeURIComponent(to)}&role=${isTutor ? 'tutor' : 'student'}`;
  const logoUrl = `${clientUrl}/logo-dark.png`;

  console.log(`\n======================================================`);
  console.log(`📧 [PREPARING 1-CLICK VERIFICATION EMAIL]`);
  console.log(`📬 To: ${to}`);
  console.log(`👤 Name: ${name}`);
  console.log(`🎭 Role: ${role}`);
  console.log(`🔑 Token: ${token || otp}`);
  console.log(`🔗 Verification Link: ${verifyLink}`);
  console.log(`======================================================\n`);

  const subject = isTutor
    ? `🎓 Verify Your Faculty Account - IlmiDunya Pakistan`
    : `🔐 Verify Your Account - IlmiDunya Pakistan`;

  const badgeText = isTutor ? 'Faculty Verification & Onboarding' : 'Account Email Verification';
  const greetingTitle = isTutor ? 'Verify Your Faculty Account' : 'Verify Your Student Account';
  const welcomeText = isTutor
    ? `Thank you for applying to teach with <strong>IlmiDunya Pakistan</strong>. To activate your faculty teaching workspace, start receiving direct inquiries, and complete your onboarding, please verify your email address below:`
    : `Thank you for joining <strong>IlmiDunya Pakistan</strong>. To activate your account and connect with verified tutors, please verify your email address below:`;
  const buttonText = isTutor ? 'Verify Faculty Account →' : 'Verify Account & Continue →';
  const buttonSubtext = isTutor
    ? `⚡ Clicking the button will immediately verify your email and open your faculty onboarding dashboard.`
    : `⚡ Clicking the button will immediately verify your email and take you directly to your student workspace.`;

  const html = `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <title>${subject}</title>
      <style>
        /* Email Reset */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #faf8f5; }

        /* Responsive Mobile Styles */
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 12px 6px !important; width: 100% !important; }
          .email-card { width: 100% !important; max-width: 100% !important; border-radius: 14px !important; }
          .mobile-header { padding: 26px 18px 22px 18px !important; }
          .mobile-logo { width: 135px !important; height: auto !important; }
          .mobile-body { padding: 24px 18px 20px 18px !important; }
          .mobile-title { font-size: 19px !important; line-height: 25px !important; }
          .mobile-text { font-size: 13.5px !important; line-height: 1.6 !important; }
          .mobile-btn-container { width: 100% !important; margin: 24px 0 20px 0 !important; }
          .mobile-btn { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 15px 14px !important; font-size: 14px !important; }
          .mobile-otp-box { padding: 14px 12px !important; margin: 20px 0 !important; }
          .mobile-otp-code { font-size: 26px !important; letter-spacing: 5px !important; }
          .mobile-footer { padding: 20px 16px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <!-- Outer Wrapper Table -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-wrapper" style="table-layout: fixed; background-color: #faf8f5; padding: 30px 10px; width: 100%;">
        <tr>
          <td align="center" style="padding: 0;">
            
            <!-- Email Container (Card) -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-card" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(12, 34, 23, 0.07); border: 1px solid #e6ded1;">
              
              <!-- Brand Header (IlmiDunya Signature Dark Green & Gold Accent) -->
              <tr>
                <td align="center" class="mobile-header" style="padding: 36px 30px 28px 30px; background-color: #0c2217; border-bottom: 3px solid #d4a359; color: #ffffff;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="padding-bottom: 12px;">
                        <a href="${clientUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                          <img src="${logoUrl}" alt="IlmiDunya Pakistan" width="170" height="auto" class="mobile-logo" style="display: block; width: 170px; max-width: 100%; height: auto; margin: 0 auto; border: 0;" />
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <span style="display: inline-block; padding: 4px 14px; background-color: rgba(20, 61, 43, 0.85); color: #d4a359; border: 1px solid rgba(212, 163, 89, 0.45); border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                          ${badgeText}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Content Body -->
              <tr>
                <td class="mobile-body" style="padding: 36px 34px 26px 34px;">
                  <h2 class="mobile-title" style="margin: 0 0 14px 0; font-size: 21px; font-weight: 900; color: #0c2217; font-family: 'Playfair Display', Georgia, serif; line-height: 28px;">
                    Assalam-o-Alaikum, ${name}!
                  </h2>
                  <p class="mobile-text" style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.65; color: #292524; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    ${welcomeText}
                  </p>

                  <!-- Direct 1-Click Action Button (Fluid & Responsive) -->
                  <div class="mobile-btn-container" style="text-align: center; margin: 30px 0 24px 0;">
                    <a href="${verifyLink}" target="_blank" class="mobile-btn" style="display: inline-block; width: auto; min-width: 260px; max-width: 100%; padding: 16px 38px; background-color: #0c2217; color: #ffffff !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 14px; border: 1px solid #d4a359; box-shadow: 0 4px 16px rgba(12, 34, 23, 0.28); text-transform: uppercase; letter-spacing: 0.5px; box-sizing: border-box;">
                      ${buttonText}
                    </a>
                  </div>

                  <p style="margin: 0 0 22px 0; font-size: 12.5px; line-height: 1.55; color: #78716c; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    ${buttonSubtext}
                  </p>

                  <!-- 6-Digit OTP Box -->
                  <div class="mobile-otp-box" style="background-color: #faf8f5; border: 1px dashed #d4a359; border-radius: 14px; padding: 18px 20px; text-align: center; margin: 24px 0;">
                    <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #b85d34; margin-bottom: 6px;">
                      Verification Security Code (OTP)
                    </span>
                    <span class="mobile-otp-code" style="display: block; font-family: 'Courier New', Courier, monospace; font-size: 30px; font-weight: 900; letter-spacing: 7px; color: #0c2217;">
                      ${otp}
                    </span>
                    <span style="display: block; font-size: 11px; color: #78716c; margin-top: 6px;">
                      Valid for 24 hours. Enter this on the verification screen if prompted.
                    </span>
                  </div>

                  <!-- Direct Link Fallback Box -->
                  <div style="background-color: #faf8f5; border: 1px solid #e6ded1; padding: 14px 16px; border-radius: 12px; margin-top: 22px; word-break: break-all; word-wrap: break-word; overflow-wrap: break-word; font-size: 11.5px; color: #78716c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <span style="font-weight: 700; color: #0c2217; display: block; margin-bottom: 6px;">
                      Alternative Link (copy &amp; paste into your browser):
                    </span>
                    <a href="${verifyLink}" target="_blank" style="color: #b85d34; text-decoration: underline; font-weight: 600; word-break: break-all;">
                      ${verifyLink}
                    </a>
                  </div>

                  <!-- Security Advisory Notice -->
                  <div style="background-color: #fdfbf7; border-left: 3px solid #d4a359; padding: 12px 14px; border-radius: 8px; margin-top: 22px;">
                    <p style="margin: 0; font-size: 11.5px; line-height: 1.5; color: #78716c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <strong style="color: #0c2217;">Security Advisory:</strong> If you did not register on IlmiDunya Pakistan, please disregard this email. Your information remains completely safe.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td class="mobile-footer" style="padding: 24px 34px; background-color: #f5f0e6; border-top: 1px solid #e6ded1; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #0c2217; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    IlmiDunya Pakistan &bull; Quality Quranic &amp; Academic Tutoring
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #78716c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    Islamabad &bull; Lahore &bull; Karachi &bull; Peshawar &bull; Quetta &bull; Nationwide
                  </p>
                </td>
              </tr>

            </table>
            
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const result = await sendEmailDetailed({
    to,
    subject,
    html,
    text: `Assalam-o-Alaikum ${name}, please click this link to verify your IlmiDunya account: ${verifyLink} (OTP: ${otp})`
  });

  return result.success;
};

// ==========================================
// 2. TUTOR APPLICATION APPROVAL & REJECTION EMAIL
// ==========================================
const sendTutorStatusEmail = async (to, name, status, reason = '') => {
  const isApproved = status === 'approved';
  const clientUrl = getClientBaseUrl();
  const logoUrl = `${clientUrl}/logo-dark.png`;

  if (isApproved) {
    const subject = `🎉 Congratulations! Your Tutor Profile is Approved & Live on IlmiDunya`;
    const dashboardUrl = `${clientUrl}/tutor/dashboard`;
    const profileUrl = `${clientUrl}/tutor/profile`;

    const html = `
      <!DOCTYPE html>
      <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Tutor Profile Approved - IlmiDunya</title>
        <style>
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #faf8f5; }

          @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 12px 6px !important; width: 100% !important; }
            .email-card { width: 100% !important; max-width: 100% !important; border-radius: 14px !important; }
            .mobile-header { padding: 26px 18px 22px 18px !important; }
            .mobile-logo { width: 135px !important; height: auto !important; }
            .mobile-body { padding: 24px 18px 20px 18px !important; }
            .mobile-title { font-size: 19px !important; line-height: 25px !important; }
            .mobile-text { font-size: 13.5px !important; line-height: 1.6 !important; }
            .mobile-btn-container { width: 100% !important; margin: 24px 0 20px 0 !important; }
            .mobile-btn { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 15px 14px !important; font-size: 14px !important; }
            .mobile-footer { padding: 20px 16px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-wrapper" style="table-layout: fixed; background-color: #faf8f5; padding: 30px 10px; width: 100%;">
          <tr>
            <td align="center" style="padding: 0;">
              
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-card" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(12, 34, 23, 0.07); border: 1px solid #e6ded1;">
                
                <!-- Brand Header -->
                <tr>
                  <td align="center" class="mobile-header" style="padding: 36px 30px 28px 30px; background-color: #0c2217; border-bottom: 3px solid #d4a359; color: #ffffff;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 12px;">
                          <a href="${clientUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="${logoUrl}" alt="IlmiDunya Pakistan" width="170" height="auto" class="mobile-logo" style="display: block; width: 170px; max-width: 100%; height: auto; margin: 0 auto; border: 0;" />
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <span style="display: inline-block; padding: 4px 14px; background-color: rgba(20, 61, 43, 0.85); color: #d4a359; border: 1px solid rgba(212, 163, 89, 0.45); border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            Faculty Verification Approved
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td class="mobile-body" style="padding: 36px 34px 26px 34px;">
                    <h2 class="mobile-title" style="margin: 0 0 14px 0; font-size: 21px; font-weight: 900; color: #0c2217; font-family: 'Playfair Display', Georgia, serif; line-height: 28px;">
                      Assalam-o-Alaikum, ${name}! 🎉
                    </h2>
                    <p class="mobile-text" style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.65; color: #292524; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      We are thrilled to inform you that our Academic Verification Committee has reviewed and <strong>approved your educational qualifications and Sanad degrees</strong>. Your tutor profile is now officially <strong>LIVE</strong> across Pakistan!
                    </p>

                    <!-- Official Verification Summary Card -->
                    <div style="background: #faf8f5; border: 1px solid #e6ded1; border-radius: 14px; padding: 18px; margin: 22px 0;">
                      <h3 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0c2217; border-bottom: 1px solid #e6ded1; padding-bottom: 6px;">
                        🌟 Official Credential Status
                      </h3>
                      <table role="presentation" style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <tr>
                          <td style="padding: 6px 0; color: #78716c;">Verification Badge:</td>
                          <td style="padding: 6px 0; font-weight: 800; text-align: right; color: #0c2217;">
                            ✅ Sanad-Certified Faculty
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #78716c;">Public Visibility:</td>
                          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0c2217;">
                            Active in Pakistan Tutor Directory
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #78716c;">Teaching Features:</td>
                          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0c2217;">
                            1:1 WebRTC Video &amp; Voice Chat
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Next Steps -->
                    <h3 style="margin: 22px 0 10px 0; font-size: 14px; font-weight: 800; color: #0c2217;">
                      🚀 Next Steps to Start Teaching:
                    </h3>
                    <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #44403c;">
                      <li><strong>Course Studio:</strong> Create structured curriculum tracks, chapters, and quizzes.</li>
                      <li><strong>Student Inquiries:</strong> Receive and respond directly to student inquiries and schedule lessons.</li>
                      <li><strong>WebRTC Classroom:</strong> Conduct dedicated 1:1 classes with audio-only or camera options.</li>
                    </ul>

                    <!-- Action CTA Button -->
                    <div class="mobile-btn-container" style="text-align: center; margin: 28px 0 20px 0;">
                      <a href="${dashboardUrl}" target="_blank" class="mobile-btn" style="display: inline-block; width: auto; min-width: 260px; max-width: 100%; padding: 16px 36px; background-color: #0c2217; color: #ffffff !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 12px; border: 1px solid #d4a359; box-shadow: 0 4px 16px rgba(12, 34, 23, 0.28); text-transform: uppercase; letter-spacing: 0.5px; box-sizing: border-box;">
                        Open Tutor Portal & Dashboard →
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td class="mobile-footer" style="padding: 24px 34px; background-color: #f5f0e6; border-top: 1px solid #e6ded1; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #0c2217; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      IlmiDunya Pakistan &bull; Quality Quranic &amp; Academic Tutoring
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #78716c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Instructor Support: info@ilmidunya.com &bull; Nationwide
                    </p>
                  </td>
                </tr>

              </table>
              
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return sendEmail({
      to,
      subject,
      html,
      text: `Assalam-o-Alaikum ${name}! Mubarak! Your tutor profile and Sanad credentials have been approved on IlmiDunya Pakistan. Access your tutor dashboard at: ${dashboardUrl}`
    });
  } else {
    // Rejection or Revision Request
    const subject = `⚠️ Update on Your IlmiDunya Tutor Application`;
    const profileUrl = `${clientUrl}/tutor/profile`;

    const html = `
      <!DOCTYPE html>
      <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Tutor Application Update - IlmiDunya</title>
        <style>
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #faf8f5; }

          @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 12px 6px !important; width: 100% !important; }
            .email-card { width: 100% !important; max-width: 100% !important; border-radius: 14px !important; }
            .mobile-header { padding: 26px 18px 22px 18px !important; }
            .mobile-logo { width: 135px !important; height: auto !important; }
            .mobile-body { padding: 24px 18px 20px 18px !important; }
            .mobile-title { font-size: 19px !important; line-height: 25px !important; }
            .mobile-text { font-size: 13.5px !important; line-height: 1.6 !important; }
            .mobile-btn-container { width: 100% !important; margin: 24px 0 20px 0 !important; }
            .mobile-btn { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 15px 14px !important; font-size: 14px !important; }
            .mobile-footer { padding: 20px 16px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-wrapper" style="table-layout: fixed; background-color: #faf8f5; padding: 30px 10px; width: 100%;">
          <tr>
            <td align="center" style="padding: 0;">
              
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-card" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(12, 34, 23, 0.07); border: 1px solid #e6ded1;">
                
                <!-- Notice Header -->
                <tr>
                  <td align="center" class="mobile-header" style="padding: 36px 30px 28px 30px; background-color: #0c2217; border-bottom: 3px solid #b85d34; color: #ffffff;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 12px;">
                          <a href="${clientUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="${logoUrl}" alt="IlmiDunya Pakistan" width="170" height="auto" class="mobile-logo" style="display: block; width: 170px; max-width: 100%; height: auto; margin: 0 auto; border: 0;" />
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <span style="display: inline-block; padding: 4px 14px; background-color: rgba(184, 93, 52, 0.25); color: #f5d6cf; border: 1px solid rgba(184, 93, 52, 0.5); border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            Application Review Update
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td class="mobile-body" style="padding: 36px 34px 26px 34px;">
                    <h2 class="mobile-title" style="margin: 0 0 14px 0; font-size: 19px; font-weight: 900; color: #0c2217; font-family: 'Playfair Display', Georgia, serif; line-height: 26px;">
                      Assalam-o-Alaikum, ${name},
                    </h2>
                    <p class="mobile-text" style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.65; color: #292524; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Thank you for submitting your application to teach on IlmiDunya Pakistan. Our verification team reviewed your submitted documents and requires additional information before activating your profile.
                    </p>

                    <!-- Reason Card -->
                    <div style="background: #fdf2f0; border: 1px solid #f5d6cf; border-radius: 14px; padding: 18px; margin: 20px 0;">
                      <h4 style="margin: 0 0 8px 0; font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #b85d34; letter-spacing: 0.5px;">
                        Feedback from Verification Team:
                      </h4>
                      <p style="margin: 0; font-size: 13px; line-height: 1.55; color: #854020; font-weight: 600;">
                        "${reason || 'Please provide clearer scans of your Sanad / degree credentials or complete missing profile information.'}"
                      </p>
                    </div>

                    <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #57534e;">
                      You can easily update your profile, upload clearer documents, and re-submit for prompt re-evaluation:
                    </p>

                    <!-- Re-submit Action CTA -->
                    <div class="mobile-btn-container" style="text-align: center; margin: 28px 0 20px 0;">
                      <a href="${profileUrl}" target="_blank" class="mobile-btn" style="display: inline-block; width: auto; min-width: 260px; max-width: 100%; padding: 15px 34px; background-color: #0c2217; color: #ffffff !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 12px; border: 1px solid #d4a359; box-shadow: 0 4px 14px rgba(12, 34, 23, 0.25); text-transform: uppercase; letter-spacing: 0.5px; box-sizing: border-box;">
                        Update &amp; Re-Submit Credentials →
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td class="mobile-footer" style="padding: 24px 34px; background-color: #f5f0e6; border-top: 1px solid #e6ded1; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #0c2217; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      IlmiDunya Pakistan &bull; Quality Quranic &amp; Academic Tutoring
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #78716c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      If you have questions, please reach out to info@ilmidunya.com
                    </p>
                  </td>
                </tr>

              </table>
              
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return sendEmail({
      to,
      subject,
      html,
      text: `Assalam-o-Alaikum ${name}. Update on your IlmiDunya tutor application: ${reason || 'Please upload updated documents.'}. Update your profile at: ${profileUrl}`
    });
  }
};

// ==========================================
// 3. DEDICATED 1:1 CHAT INVITATION EMAIL
// ==========================================
const sendDedicatedChatInvitationEmail = async ({
  to,
  recipientRole = 'student',
  studentName,
  tutorName,
  chatUrl,
  studentAge,
  studentGender,
  studentCity
}) => {
  const isStudent = recipientRole === 'student';
  const subject = isStudent
    ? `💬 Your Dedicated 1:1 Chat with ${tutorName} is Ready | IlmiDunya`
    : `📩 New Student Inquiry: ${studentName} wants to connect with you | IlmiDunya`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>1:1 Tutoring Chat</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f1f5f9; padding: 30px 10px;">
        <tr>
          <td align="center">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
              
              <!-- Brand Header -->
              <tr>
                <td align="center" style="padding: 35px 30px 25px 30px; background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%); color: #ffffff;">
                  <div style="width: 54px; height: 54px; background: rgba(255, 255, 255, 0.18); border: 2px solid rgba(255, 255, 255, 0.4); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; line-height: 54px; font-size: 26px; margin-bottom: 10px;">
                    💬
                  </div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">Dedicated 1:1 Discussion</h1>
                  <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #a7f3d0;">Private & Secure Tutoring Channel</p>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 35px 35px 25px 35px;">
                  <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
                    ${isStudent ? `Assalam-o-Alaikum, ${studentName}!` : `Assalam-o-Alaikum, ${tutorName}!`}
                  </h2>
                  <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                    ${isStudent
                      ? `Your dedicated private chat channel with <strong>${tutorName}</strong> is ready. You can discuss class timings, ask questions, exchange voice notes 🎙️, and coordinate your 3-day free trial directly.`
                      : `A new student <strong>${studentName}</strong> has sent you an inquiry to connect for tutoring.`
                    }
                  </p>

                  <!-- Details Card -->
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 24px 0;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">${isStudent ? 'Sanad-Certified Tutor:' : 'Student Name:'}</td>
                        <td style="padding: 6px 0; font-weight: 800; text-align: right; color: #0f172a;">
                          ${isStudent ? tutorName : studentName}
                        </td>
                      </tr>
                      ${!isStudent && studentAge ? `
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Student Demographics:</td>
                        <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">
                          ${studentAge} Years &bull; ${studentGender || 'Student'}
                        </td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Location:</td>
                        <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">
                          ${studentCity || 'Pakistan'}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Supported Features:</td>
                        <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #059669;">
                          🎙️ Voice Notes &bull; 📹 WebRTC Video Call
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Direct Chat CTA Button -->
                  <div style="text-align: center; margin: 28px 0;">
                    <a href="${chatUrl}" style="display: inline-block; padding: 15px 36px; background-color: #059669; color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; border-radius: 14px; box-shadow: 0 5px 15px rgba(5, 150, 105, 0.35);">
                      Open Dedicated Chat Room →
                    </a>
                  </div>

                  <!-- Fallback Link -->
                  <p style="text-align: center; color: #64748b; font-size: 11px; margin: 15px 0 0 0;">
                    Or copy-paste this direct URL into your browser:<br/>
                    <a href="${chatUrl}" style="color: #059669; word-break: break-all; font-weight: 600;">${chatUrl}</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 25px 35px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #334155;">
                    IlmiDunya Pakistan &bull; Safe, Verified & High-Quality Tutoring
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                    Keep communications inside the platform to protect your account and ensure verified course records.
                  </p>
                </td>
              </tr>

            </table>
            
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text: `Your dedicated chat room with ${isStudent ? tutorName : studentName} is open at: ${chatUrl}`
  });
};

/**
 * Send Account Warning Email
 */
const sendAccountWarningEmail = async ({ to, userName, reason, message, warningCount }) => {
  const subject = `⚠️ Official Platform Policy Warning (Strike #${warningCount || 1}) - IlmiDunya Pakistan`;
  const portalUrl = getClientBaseUrl();

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
              <tr>
                <td style="padding: 30px; background-color: #991b1b; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 900;">⚠️ Official Policy Notice</h1>
                  <p style="color: #fecaca; margin: 6px 0 0 0; font-size: 13px;">IlmiDunya Trust, Safety & Quality Team</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 35px 30px;">
                  <p style="font-size: 15px; color: #334155; margin-top: 0;">Dear <strong>${userName}</strong>,</p>
                  <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                    This is an official administrative notice regarding activity on your account that conflicts with our community guidelines and safety policies.
                  </p>

                  <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; border-radius: 8px; padding: 18px; margin: 20px 0;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #991b1b;">
                      Violation Category: ${reason}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.5;">
                      "${message}"
                    </p>
                  </div>

                  <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
                    Total Warnings on Record: <strong>${warningCount || 1}</strong>. Please ensure all future communications and classroom sessions strictly adhere to our terms. Continued violations may result in permanent suspension.
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 25px;">
                    <tr>
                      <td align="center">
                        <a href="${portalUrl}" style="display: inline-block; padding: 12px 28px; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 10px;">
                          Visit Account Portal &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px; background-color: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; font-size: 11px; color: #64748b;">IlmiDunya Trust & Safety Center &bull; Pakistan</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text: `Policy Warning from IlmiDunya Pakistan: Category: ${reason}. Statement: ${message}. Total Warnings: ${warningCount || 1}.`
  });
};

/**
 * Send Account Status Change Email (Under Review / Suspended / Reinstated)
 */
const sendAccountStatusEmail = async ({ to, userName, status, reason, notes }) => {
  const isSuspended = status === 'suspended' || status === 'deactivated';
  const isReview = status === 'under_review';
  const isRestored = status === 'active';

  const statusLabel = isSuspended ? 'Account Suspended' : isReview ? 'Account Under Review' : 'Account Reinstated (Active)';
  const headerBg = isSuspended ? '#7f1d1d' : isReview ? '#9a3412' : '#047857';
  const subject = `Account Notice: ${statusLabel} - IlmiDunya Pakistan`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
              <tr>
                <td style="padding: 30px; background-color: ${headerBg}; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 900;">${statusLabel}</h1>
                  <p style="color: #ffffff; opacity: 0.9; margin: 6px 0 0 0; font-size: 13px;">IlmiDunya Administration</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 35px 30px;">
                  <p style="font-size: 15px; color: #334155; margin-top: 0;">Dear <strong>${userName}</strong>,</p>
                  
                  ${isRestored ? `
                    <p style="font-size: 14px; color: #065f46; line-height: 1.6;">
                      We are pleased to inform you that your IlmiDunya account is now fully active and verified. Your profile and courses are visible to students across Pakistan.
                    </p>
                  ` : `
                    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                      Your account status has been updated by platform moderation to: <strong>${statusLabel}</strong>.
                    </p>
                    ${reason ? `
                      <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; border-radius: 6px; padding: 15px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 13px; color: #9a3412;"><strong>Reason:</strong> ${reason}</p>
                        ${notes ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #7c2d12;">${notes}</p>` : ''}
                      </div>
                    ` : ''}
                  `}
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px; background-color: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; font-size: 11px; color: #64748b;">IlmiDunya Moderation & Compliance &bull; Pakistan</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text: `Your account status on IlmiDunya has been updated to: ${statusLabel}. Details: ${reason || ''} ${notes || ''}`
  });
};

/**
 * Send notification email to female tutor when student requests to chat
 */
const sendChatRequestReceivedEmail = async ({
  to,
  tutorName,
  studentName,
  studentAge,
  studentGender,
  studentCity,
  details,
  tutorRequestsUrl
}) => {
  const subject = `📩 New Message Request from ${studentName} (100% Verified Profile) | IlmiDunya`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
              <tr>
                <td style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 28px; text-align: center;">
                  <span style="font-size: 11px; font-weight: 800; color: #6ee7b7; text-transform: uppercase; letter-spacing: 1.5px;">Female Tutor Safety & Privacy</span>
                  <h1 style="color: #ffffff; margin: 6px 0 0 0; font-size: 22px; font-weight: 800;">New Student Message Request</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 28px;">
                  <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0;">Assalam-o-Alaikum <strong>${tutorName}</strong>,</p>
                  <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
                    A student with a <strong>100% complete verified profile</strong> has sent you a request to connect and discuss lessons. Because your profile is safeguarded with privacy protection, the student cannot chat directly until you accept.
                  </p>

                  <!-- Student Profile Card -->
                  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                    <div style="font-size: 11px; font-weight: bold; color: #047857; text-transform: uppercase; margin-bottom: 8px;">Verified Student Profile</div>
                    <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: bold; color: #0f172a;">${studentName} <span style="font-size: 11px; background-color: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 999px; font-weight: 700;">100% Profile Strength</span></p>
                    <p style="margin: 0; font-size: 13px; color: #475569;">
                      <strong>Age:</strong> ${studentAge ? `${studentAge} Years` : 'Not specified'} &bull;
                      <strong>Gender:</strong> ${studentGender || 'Student'} &bull;
                      <strong>City:</strong> ${studentCity || 'Pakistan'}
                    </p>
                  </div>

                  <!-- Details note -->
                  <div style="background-color: #f8fafc; border-left: 4px solid #059669; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #334155; text-transform: uppercase;">Student's Message &amp; Learning Goals:</p>
                    <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.5; font-style: italic;">&ldquo;${details}&rdquo;</p>
                  </div>

                  <div style="text-align: center; margin: 24px 0;">
                    <a href="${tutorRequestsUrl}" style="background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.25);">
                      Review &amp; Accept Request &rarr;
                    </a>
                  </div>

                  <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 16px 0 0 0;">
                    You can inspect the student's full profile, accept to start chatting, or decline if your schedule is full.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 16px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #64748b;">IlmiDunya &bull; Verified Quran &amp; Academic Tutoring in Pakistan</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text: `New message request from ${studentName} (${studentAge} yrs, ${studentCity}): "${details}". Review request: ${tutorRequestsUrl}`
  });
};

/**
 * Send status notification email to student when female tutor accepts or declines
 */
const sendChatRequestStatusEmail = async ({
  to,
  studentName,
  tutorName,
  status, // 'accepted' | 'declined'
  responseMessage,
  chatUrl,
  findTutorsUrl
}) => {
  const isAccepted = status === 'accepted';
  const subject = isAccepted
    ? `🎉 ${tutorName} Accepted Your Message Request! | IlmiDunya`
    : `Update Regarding Your Request to ${tutorName} | IlmiDunya`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
              <tr>
                <td style="background: ${isAccepted ? 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' : 'linear-gradient(135deg, #334155 0%, #475569 100%)'}; padding: 28px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">
                    ${isAccepted ? 'Request Accepted! 🎓' : 'Message Request Update'}
                  </h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 28px;">
                  <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0;">Assalam-o-Alaikum <strong>${studentName}</strong>,</p>

                  ${isAccepted ? `
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
                      Great news! <strong>${tutorName}</strong> has reviewed your 100% verified profile and learning goals and has <strong>accepted your request to connect</strong>.
                    </p>
                    ${responseMessage ? `
                      <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 14px 16px; border-radius: 6px; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 13px; color: #065f46;"><strong>Note from ${tutorName}:</strong> &ldquo;${responseMessage}&rdquo;</p>
                      </div>
                    ` : ''}
                    <div style="text-align: center; margin: 24px 0;">
                      <a href="${chatUrl}" style="background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.25);">
                        Open Chat with ${tutorName} &rarr;
                      </a>
                    </div>
                  ` : `
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
                      Thank you for your interest in learning with <strong>${tutorName}</strong>. The tutor is currently at full capacity and unable to take on new students at this time.
                    </p>
                    ${responseMessage ? `
                      <div style="background-color: #f8fafc; border-left: 4px solid #64748b; padding: 14px 16px; border-radius: 6px; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 13px; color: #334155;"><strong>Note from ${tutorName}:</strong> &ldquo;${responseMessage}&rdquo;</p>
                      </div>
                    ` : ''}
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
                      Do not worry! We have many other highly qualified, verified Quran and Academic tutors available with immediate availability for free trials.
                    </p>
                    <div style="text-align: center; margin: 24px 0;">
                      <a href="${findTutorsUrl}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
                        Browse Other Verified Tutors &rarr;
                      </a>
                    </div>
                  `}
                </td>
              </tr>
              <tr>
                <td style="padding: 16px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #64748b;">IlmiDunya &bull; Pakistan's Premier Tutoring Platform</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text: isAccepted
      ? `${tutorName} accepted your request to chat! Open chat: ${chatUrl}`
      : `Update from ${tutorName}: Tutor is currently unable to accept new students. Browse tutors: ${findTutorsUrl}`
  });
};

/**
 * Send email to tutor when student agrees to continue classes
 */
const sendTrialContinuationTutorEmail = async ({
  to,
  tutorName,
  studentName,
  subject,
  feeDueDate,
  adminContactPhone
}) => {
  const emailSubject = `🎉 Great News! Student ${studentName} agreed to continue classes with you | IlmiDunya`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
              <tr>
                <td style="background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 28px; text-align: center;">
                  <span style="font-size: 11px; font-weight: 800; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1.5px;">Trial Successfully Completed</span>
                  <h1 style="color: #ffffff; margin: 6px 0 0 0; font-size: 22px; font-weight: 800;">Student Agreed to Continue Regular Classes</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 28px;">
                  <p style="color: #1e293b; font-size: 15px; margin: 0 0 16px 0;">Assalamu Alaikum <strong>${tutorName}</strong>,</p>
                  <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                    Congratulations! Your student <strong>${studentName}</strong> has completed their trial period for <strong>${subject}</strong> and has officially selected to continue regular tutoring with you.
                  </p>

                  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                    <h3 style="color: #166534; font-size: 13px; font-weight: 800; text-transform: uppercase; margin: 0 0 8px 0;">3-Day Platform Fee Clearance Notice</h3>
                    <p style="color: #15803d; font-size: 13px; line-height: 1.5; margin: 0 0 12px 0;">
                      To keep your live classes, scheduling, and student messaging uninterrupted, please clear the platform fee with administration within <strong>3 days (by ${feeDueDate})</strong>.
                    </p>
                    <p style="color: #166534; font-size: 12px; margin: 0;">
                      Meezan Bank: <strong>96010105435308</strong> (Abdul Khaliq)<br>
                      Raast ID / EasyPaisa / JazzCash: <strong>03171759093</strong><br>
                      Official Support: <strong>info@ilmidunya.com</strong>
                    </p>
                  </div>

                  <p style="color: #64748b; font-size: 12px; margin: 0;">
                    Note: If payment clearance is not confirmed within 3 days, access to scheduled classroom sessions will be temporarily paused.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  return sendEmailDetailed({ to, subject: emailSubject, html });
};

/**
 * Send email to tutor when platform fee is verified and cleared
 */
const sendTutorFeeClearedEmail = async ({
  to,
  tutorName,
  studentName,
  subject
}) => {
  const emailSubject = `✅ Platform Fee Cleared - Regular Classes Active with ${studentName} | IlmiDunya`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
              <tr>
                <td style="background: #065f46; padding: 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">Payment Clearance Verified</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px;">
                  <p style="color: #1e293b; font-size: 14px;">Assalamu Alaikum <strong>${tutorName}</strong>,</p>
                  <p style="color: #334155; font-size: 13px; line-height: 1.6;">
                    Your platform fee for teaching student <strong>${studentName}</strong> (${subject}) has been successfully verified and cleared by the IlmiDunya administration.
                  </p>
                  <p style="color: #059669; font-size: 13px; font-weight: bold;">
                    Your regular classes and live video sessions are 100% active with zero restrictions.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  return sendEmailDetailed({ to, subject: emailSubject, html });
};

/**
 * Send password reset link email
 */
const sendPasswordResetEmail = async ({
  to,
  name,
  resetUrl
}) => {
  const emailSubject = `🔐 Reset Your IlmiDunya Password`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
              <tr>
                <td style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 28px; text-align: center;">
                  <span style="font-size: 11px; font-weight: 800; color: #6ee7b7; text-transform: uppercase; letter-spacing: 1.5px;">Account Security</span>
                  <h1 style="color: #ffffff; margin: 6px 0 0 0; font-size: 22px; font-weight: 800;">Password Reset Request</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 28px;">
                  <p style="color: #1e293b; font-size: 15px; margin: 0 0 16px 0;">Assalamu Alaikum <strong>${name || 'Dear User'}</strong>,</p>
                  <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                    We received a request to reset your password for your <strong>IlmiDunya</strong> account. Click the button below to set a new password:
                  </p>

                  <div style="text-align: center; margin: 28px 0;">
                    <a href="${resetUrl}" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.3);">
                      Reset My Password
                    </a>
                  </div>

                  <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 16px 0;">
                    Or copy and paste this link into your browser:<br>
                    <a href="${resetUrl}" style="color: #059669; word-break: break-all;">${resetUrl}</a>
                  </p>

                  <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 10px; padding: 12px; margin-top: 20px;">
                    <p style="color: #92400e; font-size: 12px; margin: 0; line-height: 1.5;">
                      ⚠️ <strong>Security Note:</strong> This link is valid for <strong>60 minutes</strong> and can only be used once. If you did not request a password reset, please ignore this email; your account remains completely safe.
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
                  IlmiDunya &bull; Pakistan&apos;s Trusted Quran &amp; Academic Learning Platform &bull; Lahore, Pakistan
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  return sendEmailDetailed({ to, subject: emailSubject, html });
};

// ==========================================
// 12. OFFLINE SUPPORT INQUIRY EMAIL (DISABLED - Dashboard notification used instead)
// ==========================================
const sendOfflineSupportInquiryEmail = async ({ sessionId, userEmail }) => {
  // Disabled: Admin requested no external email notifications for inquiries; in-app dashboard notification is active.
  console.log(`🛡️ [OFFLINE INQUIRY EMAIL DISABLED] Support inquiry for session ${sessionId || 'N/A'} (${userEmail || 'No Email'}) recorded. In-app dashboard notification and socket active.`);
  return { success: true, message: 'Offline inquiry email notification disabled; in-app dashboard notification active.' };
};

// ==========================================
// 13. EARLY TUTOR REGISTRATION ADMIN NOTIFICATION (DISABLED - Dashboard notification used instead)
// ==========================================
const sendEarlyTutorRegistrationAdminAlert = async () => {
  // Disabled: Admin requested no new registrant email notifications; in-app dashboard notification is used instead.
  return { success: true, message: 'Admin email notification disabled; in-app dashboard notification active.' };
};


// ==========================================
// 14. EARLY TUTOR REGISTRATION CONFIRMATION NOTICE
// ==========================================
const sendEarlyTutorNoticeEmail = async ({ to, name }) => {
  const emailSubject = `🌟 Welcome to IlmiDunya Founding Faculty, ${name}! (VIP Priority Secured)`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
      <table style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
        <tr>
          <td style="background-color: #0c2217; padding: 26px; text-align: center;">
            <h2 style="color: #d4a359; margin: 0; font-size: 22px; font-weight: 800;">IlmiDunya Pakistan</h2>
            <p style="color: #ffffff; margin: 6px 0 0 0; font-size: 13px;">Founding Faculty & Educator Network</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px; color: #1e293b; font-size: 15px; line-height: 1.7;">
            <p style="margin-top: 0;">Dear <strong>${name}</strong>,</p>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin: 0 0 8px 0; color: #065f46; font-size: 17px; font-weight: 800;">
                Welcome to the IlmiDunya Founding Faculty! 🌟
              </h3>
              <p style="margin: 0; color: #166534; font-size: 15px; font-weight: 600; line-height: 1.6;">
                Your dedication to spreading Ilm is deeply honored. You have secured <strong>VIP Priority Placement</strong> for direct student matching on launch day — our faculty team will connect with you shortly with exclusive onboarding details and early perks!
              </p>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Our academic faculty coordinator is reviewing educator submissions to organize curriculum categories, assign verified badges, and prepare direct student connections.
            </p>

            <div style="text-align: center; margin: 26px 0 10px 0;">
              <a href="https://wa.me/923171759093" style="background-color: #25D366; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
                💬 Connect on WhatsApp: +92 317 1759093
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
            IlmiDunya Pakistan &bull; Quality Quranic & Academic Tutoring &bull; Lahore, Pakistan
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmailDetailed({
    to,
    subject: emailSubject,
    html,
    text: `Dear ${name},\n\nWelcome to the IlmiDunya Founding Faculty! Your dedication to spreading Ilm is deeply honored. You have secured VIP Priority Placement for direct student matching on launch day — our faculty team will connect with you shortly with exclusive onboarding details and early perks!\n\nIlmiDunya Pakistan`
  });
};

// ==========================================
// 15. EMAIL CHANGE OTP VERIFICATION TEMPLATE
// ==========================================
const sendEmailChangeOtpEmail = async (to, name, otp) => {
  const subject = `🔐 Verify Your New Email Address - IlmiDunya Pakistan`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf8f5; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e6ded1; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
              <tr>
                <td style="background-color: #0c2217; padding: 28px 24px; text-align: center;">
                  <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; font-family: Georgia, serif; letter-spacing: 0.5px;">
                    IlmiDunya <span style="color: #d4a359;">Pakistan</span>
                  </h1>
                  <span style="display: inline-block; margin-top: 8px; font-size: 11px; font-weight: 700; color: #d4a359; text-transform: uppercase; letter-spacing: 1px; background: rgba(212,163,89,0.15); padding: 4px 12px; border: 1px solid rgba(212,163,89,0.3); border-radius: 20px;">
                    Email Verification Security Code
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px 28px; color: #1c2826;">
                  <h2 style="margin: 0 0 14px 0; font-size: 18px; font-weight: 800; color: #0c2217;">
                    Confirm Your New Email Address
                  </h2>
                  <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #57534e;">
                    Assalam-o-Alaikum <strong>${name || 'Valued Member'}</strong>,
                  </p>
                  <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #57534e;">
                    You recently requested to update your email address on IlmiDunya to <strong>${to}</strong>. To confirm this change and verify ownership of this email, please enter the following 6-digit verification code:
                  </p>
                  
                  <div style="background-color: #faf8f5; border: 1px dashed #d4a359; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0;">
                    <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #b85d34; margin-bottom: 8px;">
                      6-Digit Verification Code (OTP)
                    </span>
                    <span style="display: block; font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #0c2217;">
                      ${otp}
                    </span>
                    <span style="display: block; font-size: 11px; color: #78716c; margin-top: 8px;">
                      This code is valid for 15 minutes.
                    </span>
                  </div>

                  <div style="background-color: #fdfbf7; border-left: 3px solid #d4a359; padding: 12px 14px; border-radius: 8px; margin-top: 24px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #78716c;">
                      <strong style="color: #0c2217;">Security Notice:</strong> If you did not request to change your email on IlmiDunya, please disregard this message. Your account remains completely secure.
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 28px; background-color: #f5f0e6; border-top: 1px solid #e6ded1; text-align: center; font-size: 11px; color: #78716c;">
                  IlmiDunya Pakistan &bull; Dedicated to Verified Academic &amp; Quranic Tutoring
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmailDetailed({
    to,
    subject,
    html,
    text: `Your IlmiDunya email change verification code is: ${otp}\n\nThis code will expire in 15 minutes.`
  });
};

module.exports = {
  sendEmail,
  sendEmailDetailed,
  sendVerificationOtpEmail,
  sendEmailChangeOtpEmail,
  sendEarlyTutorRegistrationAdminAlert,
  sendEarlyTutorNoticeEmail,
  sendTutorStatusEmail,
  sendDedicatedChatInvitationEmail,
  sendAccountWarningEmail,
  sendAccountStatusEmail,
  sendChatRequestReceivedEmail,
  sendChatRequestStatusEmail,
  sendTrialContinuationTutorEmail,
  sendTutorFeeClearedEmail,
  sendPasswordResetEmail,
  sendOfflineSupportInquiryEmail,
  getClientBaseUrl
};

