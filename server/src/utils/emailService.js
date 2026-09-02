const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = () => {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER || 'abdulkhaliqwebdeveloper@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'zthfqcnavkuldwxt';
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

const getClientBaseUrl = () => process.env.CLIENT_URL || 'https://ilmportal.vercel.app';

// HTTP REST API Email Dispatch (Port 443 / HTTPS - NEVER blocked by cloud firewalls)
const sendViaHttpApi = async ({ to, subject, html, text }) => {
  let lastError = null;

  // 1. Brevo HTTP API (https://brevo.com - Sends to ANY recipient without domain verification)
  if (process.env.BREVO_API_KEY) {
    try {
      const fromEmail = process.env.BREVO_FROM || 'abdulkhaliqwebdeveloper@gmail.com';
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'IlmPortal Pakistan', email: fromEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text || html.replace(/<[^>]*>?/gm, '')
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`📧 [LIVE EMAIL SENT VIA BREVO HTTP API] MessageId: ${data.messageId} to ${to}`);
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
      const fromAddr = process.env.RESEND_FROM || 'IlmPortal <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddr,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, '')
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`📧 [LIVE EMAIL SENT VIA RESEND HTTP API] MessageId: ${data.id} to ${to}`);
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
  const httpResult = await sendViaHttpApi({ to, subject, html, text });
  if (httpResult && httpResult.success) {
    return true;
  }

  try {
    if (transporter) {
      const fromAddress = `"IlmPortal Pakistan" <${process.env.SMTP_USER || 'abdulkhaliqwebdeveloper@gmail.com'}>`;
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
  const smtpUser = process.env.SMTP_USER || 'abdulkhaliqwebdeveloper@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'zthfqcnavkuldwxt';

  if (smtpHost) {
    const customPort = parseInt(process.env.SMTP_PORT || port, 10);
    return nodemailer.createTransport({
      host: smtpHost,
      port: customPort,
      secure: customPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 10000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
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
    connectionTimeout: 10000,
    greetingTimeout: 8000,
    socketTimeout: 12000
  });
};

const sendEmailDetailed = async ({ to, subject, html, text }) => {
  const fromAddress = `"IlmPortal Pakistan" <${process.env.SMTP_USER || 'abdulkhaliqwebdeveloper@gmail.com'}>`;

  // 1. Direct Gmail SMTP Port 587 (Authentic DKIM signed by Google, delivers straight to Primary Inbox)
  try {
    const t587 = getTransporter(587);
    const info587 = await t587.sendMail({
      from: fromAddress,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html
    });
    console.log(`\n======================================================`);
    console.log(`📧 [LIVE EMAIL SENT SUCCESSFULLY VIA GMAIL PORT 587]`);
    console.log(`📬 To: ${to}`);
    console.log(`📋 Subject: ${subject}`);
    console.log(`🆔 MessageId: ${info587.messageId}`);
    console.log(`======================================================\n`);
    return { success: true, messageId: info587.messageId, response: info587.response, to, provider: 'gmail-port-587' };
  } catch (err587) {
    console.warn(`⚠️ [EMAIL SERVICE] Port 587 failed (${err587.message}). Trying fallback Port 465 SSL...`);

    // 2. Direct Gmail SMTP Port 465 (SSL)
    try {
      const t465 = getTransporter(465);
      const info465 = await t465.sendMail({
        from: fromAddress,
        to,
        subject,
        text: text || html.replace(/<[^>]*>?/gm, ''),
        html
      });
      console.log(`\n======================================================`);
      console.log(`📧 [LIVE EMAIL SENT SUCCESSFULLY VIA GMAIL PORT 465]`);
      console.log(`📬 To: ${to}`);
      console.log(`📋 Subject: ${subject}`);
      console.log(`🆔 MessageId: ${info465.messageId}`);
      console.log(`======================================================\n`);
      return { success: true, messageId: info465.messageId, response: info465.response, to, provider: 'gmail-port-465' };
    } catch (err465) {
      console.warn(`⚠️ [EMAIL SERVICE] Both Port 587 and 465 failed. Trying HTTP API relay fallback...`);

      // 3. Fallback to HTTP API (Brevo/Resend) if cloud blocks SMTP
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
const sendVerificationOtpEmail = async (to, name, otp, token) => {
  console.log(`\n======================================================`);
  console.log(`📧 [PREPARING 1-CLICK VERIFICATION EMAIL]`);
  console.log(`📬 To: ${to}`);
  console.log(`👤 Name: ${name}`);
  console.log(`🔑 Token: ${token || otp}`);
  console.log(`======================================================\n`);

  const subject = `🔐 Verify Your Account - IlmPortal Pakistan`;
  const clientUrl = getClientBaseUrl();
  const tokenParam = token || otp;
  const verifyLink = `${clientUrl}/verify-email?token=${encodeURIComponent(tokenParam)}&email=${encodeURIComponent(to)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Account - IlmPortal</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f1f5f9; padding: 30px 10px;">
        <tr>
          <td align="center">
            
            <!-- Email Container -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
              
              <!-- Brand Header -->
              <tr>
                <td align="center" style="padding: 35px 30px 25px 30px; background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%); color: #ffffff;">
                  <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding-bottom: 12px;">
                        <div style="width: 52px; height: 52px; background: rgba(255, 255, 255, 0.18); border: 2px solid rgba(255, 255, 255, 0.4); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; line-height: 52px; font-size: 26px;">
                          📖
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">IlmPortal Pakistan</h1>
                        <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #a7f3d0;">Online Quran & Academic LMS</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Content Body -->
              <tr>
                <td style="padding: 35px 35px 25px 35px;">
                  <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
                    Assalam-o-Alaikum, ${name}! 👋
                  </h2>
                  <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                    Thank you for joining <strong>IlmPortal Pakistan</strong>. To activate your account and complete your profile, please click the button below:
                  </p>

                  <!-- Direct 1-Click Action Button -->
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${verifyLink}" style="display: inline-block; padding: 16px 42px; background-color: #059669; color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; border-radius: 14px; box-shadow: 0 4px 18px rgba(5, 150, 105, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                      Verify Account & Go to Profile →
                    </a>
                  </div>

                  <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #64748b; text-align: center;">
                    ⚡ <em>Clicking the button will immediately verify your account and take you straight to your profile page.</em>
                  </p>

                  <!-- Direct Link Fallback Box -->
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px 16px; border-radius: 12px; margin-top: 25px; word-break: break-all; font-size: 11px; color: #64748b;">
                    <span style="font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">
                      If the button doesn't work, copy and paste this link in your browser:
                    </span>
                    <a href="${verifyLink}" style="color: #059669; text-decoration: underline; font-weight: 600;">
                      ${verifyLink}
                    </a>
                  </div>

                  <!-- Security Advisory Notice -->
                  <div style="background-color: #f8fafc; border-left: 4px solid #059669; padding: 14px 16px; border-radius: 8px; margin-top: 25px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #475569;">
                      <strong style="color: #0f172a;">Security Advisory:</strong> If you did not create an account on IlmPortal Pakistan, please ignore this email.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 25px 35px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #334155;">
                    IlmPortal Pakistan &bull; Quality Quranic & Academic Education
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #94a3b8;">
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
    text: `Assalam-o-Alaikum ${name}, please click this link to verify your IlmPortal account: ${verifyLink}`
  });

  // If sending failed (e.g. Resend free development sandbox restricted recipient to account owner)
  // forward the verification link directly to the admin testing email so you can always verify!
  if (!result.success && to.toLowerCase().trim() !== 'abdulkhaliqwebdeveloper@gmail.com') {
    console.log(`🔄 [SANDBOX NOTICE] Forwarding verification link for ${to} to admin email abdulkhaliqwebdeveloper@gmail.com`);
    await sendEmail({
      to: 'abdulkhaliqwebdeveloper@gmail.com',
      subject: `🔐 [Verification Link for ${to}]`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; max-width: 550px;">
          <div style="font-size: 20px; font-weight: 800; color: #065f46; margin-bottom: 8px;">IlmPortal Account Verification</div>
          <p style="font-size: 13px; color: #475569; margin: 0 0 16px 0;">New user registered: <strong>${name}</strong> (<code>${to}</code>). Click below to verify their account:</p>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verifyLink}" style="display: inline-block; padding: 14px 32px; background: #059669; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 12px;">
              Verify Account (${to}) →
            </a>
          </div>

          <div style="background: #ffffff; padding: 12px 16px; border-radius: 10px; border: 1px solid #e2e8f0; word-break: break-all; font-size: 11px; color: #64748b; margin-bottom: 16px;">
            <strong>Verification Link:</strong><br/>
            <a href="${verifyLink}" style="color: #059669;">${verifyLink}</a>
          </div>

          <p style="font-size: 11px; color: #64748b; line-height: 1.5; margin: 0;">
            <strong>Why did you receive this?</strong> Resend free tier sandbox delivers to the account owner (<code>abdulkhaliqwebdeveloper@gmail.com</code>). Whitelisting Render's IP on Brevo or adding a domain on Resend delivers directly to the user's inbox.
          </p>
        </div>
      `,
      text: `User ${name} (${to}) registered. Verification Link: ${verifyLink}`
    });
  }

  return result.success;
};

// ==========================================
// 2. TUTOR APPLICATION APPROVAL & REJECTION EMAIL
// ==========================================
const sendTutorStatusEmail = async (to, name, status, reason = '') => {
  const isApproved = status === 'approved';
  const clientUrl = getClientBaseUrl();

  if (isApproved) {
    const subject = `🎉 Congratulations! Your Tutor Profile is Approved & Live on IlmPortal`;
    const dashboardUrl = `${clientUrl}/tutor/dashboard`;
    const profileUrl = `${clientUrl}/tutor/profile`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tutor Profile Approved</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f1f5f9; padding: 30px 10px;">
          <tr>
            <td align="center">
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
                
                <!-- Celebratory Emerald Header -->
                <tr>
                  <td align="center" style="padding: 40px 30px 30px 30px; background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%); color: #ffffff;">
                    <div style="width: 64px; height: 64px; background: #ffffff; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; line-height: 64px; font-size: 32px; box-shadow: 0 8px 18px rgba(0, 0, 0, 0.15); margin-bottom: 15px;">
                      🎓
                    </div>
                    <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">Mubarak! You Are Verified</h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #a7f3d0;">Sanad & Credentials Approved</p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 35px 35px 25px 35px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
                      Assalam-o-Alaikum, ${name}! 🎉
                    </h2>
                    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                      We are thrilled to inform you that our Academic Verification Committee has reviewed and <strong>approved your educational qualifications and Sanad degrees</strong>. Your tutor profile is now officially <strong>LIVE</strong> across Pakistan!
                    </p>

                    <!-- Official Verification Summary Card -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 24px 0;">
                      <h3 style="margin: 0 0 14px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                        🌟 Official Credential Status
                      </h3>
                      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <tr>
                          <td style="padding: 6px 0; color: #64748b;">Verification Badge:</td>
                          <td style="padding: 6px 0; font-weight: 800; text-align: right; color: #059669;">
                            ✅ Sanad-Certified Tutor
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b;">Public Visibility:</td>
                          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">
                            Active in Pakistan Tutor Directory
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b;">Tutoring Features:</td>
                          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">
                            1:1 WebRTC Video & Voice Chat
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b;">Free Trial Matching:</td>
                          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #059669;">
                            3-Day Student Trial Active
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- What's Next Steps -->
                    <h3 style="margin: 25px 0 12px 0; font-size: 15px; font-weight: 800; color: #0f172a;">
                      🚀 Next Steps to Start Teaching:
                    </h3>
                    <ul style="margin: 0 0 25px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;">
                      <li><strong>Course Studio:</strong> Create curriculum chapters, quiz tests, and reading materials in your Course Studio.</li>
                      <li><strong>Student Messages:</strong> Respond to incoming student inquiries and send custom deal offers.</li>
                      <li><strong>WebRTC Classroom:</strong> Conduct 1:1 live interactive video classes with digital Quran reader tools.</li>
                    </ul>

                    <!-- Action CTA Button -->
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 15px 36px; background-color: #059669; color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; border-radius: 14px; box-shadow: 0 5px 15px rgba(5, 150, 105, 0.35);">
                        Open Tutor Portal & Dashboard →
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 25px 35px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #334155;">
                      IlmPortal Pakistan &bull; Quality Quranic & Academic Education
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                      Need assistance? Contact our instructor support team at support@pakistanlms.pk
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
      text: `Assalam-o-Alaikum ${name}! Mubarak! Your tutor profile and Sanad credentials have been approved on IlmPortal Pakistan. Access your tutor dashboard at: ${dashboardUrl}`
    });
  } else {
    // Rejection or Revision Request
    const subject = `⚠️ Update on Your IlmPortal Tutor Application`;
    const profileUrl = `${clientUrl}/tutor/profile`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tutor Application Update</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f1f5f9; padding: 30px 10px;">
          <tr>
            <td align="center">
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
                
                <!-- Notice Header -->
                <tr>
                  <td align="center" style="padding: 35px 30px 25px 30px; background: linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #c2410c 100%); color: #ffffff;">
                    <div style="width: 54px; height: 54px; background: rgba(255, 255, 255, 0.18); border: 2px solid rgba(255, 255, 255, 0.4); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; line-height: 54px; font-size: 26px; margin-bottom: 10px;">
                      📋
                    </div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">Application Review Update</h1>
                    <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #fecaca;">Action Required on Credentials</p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 35px 35px 25px 35px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #0f172a;">
                      Assalam-o-Alaikum, ${name},
                    </h2>
                    <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                      Thank you for submitting your application to teach on IlmPortal Pakistan. Our verification team reviewed your submitted documents and could not approve your profile at this stage.
                    </p>

                    <!-- Reason Card -->
                    <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 14px; padding: 18px; margin: 20px 0;">
                      <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #9f1239;">
                        Feedback from Verification Team:
                      </h4>
                      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #be123c; font-weight: 600;">
                        "${reason || 'Please provide higher resolution scans of your Sanad / Shahada degree or verify your contact details.'}"
                      </p>
                    </div>

                    <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #475569;">
                      You can easily update your profile, upload clearer certificate images (JPG, PNG, or PDF), and re-submit for prompt re-evaluation:
                    </p>

                    <!-- Re-submit Action CTA -->
                    <div style="text-align: center; margin: 28px 0;">
                      <a href="${profileUrl}" style="display: inline-block; padding: 14px 32px; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);">
                        Update & Re-Submit Sanad Documents →
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 25px 35px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #334155;">
                      IlmPortal Pakistan &bull; Quality Quranic & Academic Education
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                      If you have questions, please reach out to admin@pakistanlms.pk
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
      text: `Assalam-o-Alaikum ${name}. Update on your IlmPortal tutor application: ${reason || 'Please upload updated documents.'}. Update your profile at: ${profileUrl}`
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
    ? `💬 Your Dedicated 1:1 Chat with ${tutorName} is Ready | IlmPortal`
    : `📩 New Student Inquiry: ${studentName} wants to connect with you | IlmPortal`;

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
                    IlmPortal Pakistan &bull; Safe, Verified & High-Quality Tutoring
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

// ==========================================
// 4. COURSE COMPLETION CERTIFICATE EMAIL
// ==========================================
const sendCertificateIssuedEmail = async ({ to, studentName, courseTitle, instructorName, certificateId, verificationUrl }) => {
  const subject = `🎓 Mubarak! Your Course Completion Certificate: ${courseTitle}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Official Certificate</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f1f5f9; padding: 30px 10px;">
        <tr>
          <td align="center">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 2px solid #059669;">
              
              <!-- Brand Header -->
              <tr>
                <td align="center" style="padding: 35px 30px 25px 30px; background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #d97706 100%); color: #ffffff;">
                  <div style="width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border: 2px solid rgba(255, 255, 255, 0.5); border-radius: 18px; display: inline-flex; align-items: center; justify-content: center; line-height: 60px; font-size: 30px; margin-bottom: 12px;">
                    🎓
                  </div>
                  <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">Official Certificate Awarded</h1>
                  <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #fef3c7;">IlmPortal Pakistan Credential</p>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 35px 35px 25px 35px;">
                  <div style="text-align: center; margin-bottom: 25px;">
                    <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 900; color: #065f46;">
                      Mubarak & Congratulations!
                    </h2>
                    <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.5;">
                      This official certificate acknowledges that <strong>${studentName}</strong> has successfully completed the curriculum requirements for:
                    </p>
                    <div style="margin: 18px 0; padding: 14px 20px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; font-size: 18px; font-weight: 800; color: #065f46;">
                      ${courseTitle}
                    </div>
                    <p style="margin: 0; font-size: 13px; color: #64748b;">
                      Supervised by Sanad-Certified Instructor: <strong style="color: #0f172a;">${instructorName}</strong>
                    </p>
                  </div>

                  <!-- Metadata Table -->
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 24px 0;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Certificate ID:</td>
                        <td style="padding: 6px 0; font-weight: 800; text-align: right; font-family: monospace; color: #0f172a;">
                          ${certificateId}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Issue Date:</td>
                        <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">
                          ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Verification Status:</td>
                        <td style="padding: 6px 0; font-weight: 800; text-align: right; color: #059669;">
                          Authentic & Verified
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Download Button -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 15px 36px; background-color: #059669; color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; border-radius: 14px; box-shadow: 0 5px 15px rgba(5, 150, 105, 0.35);">
                      View & Download PDF Certificate →
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 25px 35px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #334155;">
                    IlmPortal Pakistan &bull; Quality Quranic & Academic Education
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                    You can verify this certificate at any time using the link above.
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
    text: `Congratulations ${studentName}! You have earned your completion certificate for "${courseTitle}". Download it at: ${verificationUrl}`
  });
};

/**
 * Send Account Warning Email
 */
const sendAccountWarningEmail = async ({ to, userName, reason, message, warningCount }) => {
  const subject = `⚠️ Official Platform Policy Warning (Strike #${warningCount || 1}) - IlmPortal Pakistan`;
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
                  <p style="color: #fecaca; margin: 6px 0 0 0; font-size: 13px;">IlmPortal Trust, Safety & Quality Team</p>
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
                  <p style="margin: 0; font-size: 11px; color: #64748b;">IlmPortal Trust & Safety Center &bull; Pakistan</p>
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
    text: `Policy Warning from IlmPortal Pakistan: Category: ${reason}. Statement: ${message}. Total Warnings: ${warningCount || 1}.`
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
  const subject = `Account Notice: ${statusLabel} - IlmPortal Pakistan`;

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
                  <p style="color: #ffffff; opacity: 0.9; margin: 6px 0 0 0; font-size: 13px;">IlmPortal Administration</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 35px 30px;">
                  <p style="font-size: 15px; color: #334155; margin-top: 0;">Dear <strong>${userName}</strong>,</p>
                  
                  ${isRestored ? `
                    <p style="font-size: 14px; color: #065f46; line-height: 1.6;">
                      We are pleased to inform you that your IlmPortal account is now fully active and verified. Your profile and courses are visible to students across Pakistan.
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
                  <p style="margin: 0; font-size: 11px; color: #64748b;">IlmPortal Moderation & Compliance &bull; Pakistan</p>
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
    text: `Your account status on IlmPortal has been updated to: ${statusLabel}. Details: ${reason || ''} ${notes || ''}`
  });
};

module.exports = {
  sendEmail,
  sendEmailDetailed,
  sendVerificationOtpEmail,
  sendTutorStatusEmail,
  sendCertificateIssuedEmail,
  sendDedicatedChatInvitationEmail,
  sendAccountWarningEmail,
  sendAccountStatusEmail
};

