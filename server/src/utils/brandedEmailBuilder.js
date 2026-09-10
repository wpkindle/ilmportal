/**
 * IlmiDunya Pakistan - Official Branded Email Template Generator
 * Produces responsive, email-client-compatible HTML matching the portal theme, logo, colors, and links.
 */

const getClientBaseUrl = () => process.env.CLIENT_URL || 'https://ilmidunya.com';

const CATEGORY_META = {
  sanad_verification: {
    badge: 'Faculty Sanad Verification',
    actionText: 'Open Faculty Portal',
    actionPath: '/login/tutor'
  },
  tutor_inquiry: {
    badge: 'Faculty & Educator Network',
    actionText: 'Visit Tutor Portal',
    actionPath: '/login/tutor'
  },
  student_admission: {
    badge: 'Student Admissions Desk',
    actionText: 'Explore Verified Tutors',
    actionPath: '/tutors'
  },
  billing: {
    badge: 'Billing & Deal Verification',
    actionText: 'View LMS Dashboard',
    actionPath: '/login/student'
  },
  general: {
    badge: 'Official Correspondence',
    actionText: 'Visit IlmiDunya Portal',
    actionPath: ''
  }
};

/**
 * Converts plain text into clean, accessible HTML paragraphs with bold tags and clickable links.
 */
const formatBodyToHtml = (text = '') => {
  if (!text) return '';

  // If already contains rich HTML tags, return as-is
  if (/<(p|div|table|h1|h2|h3|ul|ol|li)[^>]*>/i.test(text)) {
    return text;
  }

  // Escape HTML entities to prevent malformed tags
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Convert URLs to styled clickable links
  const linked = escaped.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" style="color: #b85d34; text-decoration: underline; font-weight: 600;">$1</a>'
  );

  // Split by double line breaks to form paragraphs
  const paragraphs = linked.split(/\n\s*\n/);
  return paragraphs
    .map((p) => {
      const trimmed = p.trim().replace(/\n/g, '<br/>');
      return `<p style="margin: 0 0 16px 0; font-size: 14.5px; line-height: 1.7; color: #292524; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${trimmed}</p>`;
    })
    .join('');
};

/**
 * Builds full branded HTML email string with header, logo, colors, body, CTA, and footer.
 */
const buildBrandedEmailHtml = ({
  subject = '',
  contentText = '',
  recipientName = '',
  category = 'general',
  badgeText = null,
  actionText = null,
  actionUrl = null
}) => {
  const clientUrl = getClientBaseUrl();
  const logoUrl = `${clientUrl}/logo-dark.png`;
  const meta = CATEGORY_META[category] || CATEGORY_META.general;

  const resolvedBadge = badgeText || meta.badge;
  const resolvedActionText = actionText || meta.actionText;
  const resolvedActionUrl = actionUrl || `${clientUrl}${meta.actionPath || ''}`;
  const formattedBody = formatBodyToHtml(contentText);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject || 'IlmiDunya Pakistan'}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-card { width: 100% !important; border-radius: 12px !important; margin: 0 !important; }
      .email-wrapper { padding: 12px 6px !important; }
      .mobile-header { padding: 26px 20px 20px 20px !important; }
      .mobile-body { padding: 24px 20px 20px 20px !important; }
      .mobile-footer { padding: 20px 16px !important; }
      .mobile-btn { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
      .mobile-logo { width: 140px !important; height: auto !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #292524;">
  <!-- Outer Wrapper Table -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-wrapper" style="table-layout: fixed; background-color: #faf8f5; padding: 30px 10px; width: 100%;">
    <tr>
      <td align="center" style="padding: 0;">
        
        <!-- Email Container Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-card" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(12, 34, 23, 0.08); border: 1px solid #e6ded1;">
          
          <!-- Brand Header (Signature Dark Green & Gold Accent) -->
          <tr>
            <td align="center" class="mobile-header" style="padding: 34px 30px 26px 30px; background-color: #0c2217; border-bottom: 3px solid #d4a359; color: #ffffff;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 14px;">
                    <a href="${clientUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${logoUrl}" alt="IlmiDunya Pakistan" width="165" class="mobile-logo" style="display: block; width: 165px; max-width: 100%; height: auto; margin: 0 auto; border: 0;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <span style="display: inline-block; padding: 5px 16px; background-color: rgba(20, 61, 43, 0.9); color: #d4a359; border: 1px solid rgba(212, 163, 89, 0.5); border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      ${resolvedBadge}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="mobile-body" style="padding: 36px 34px 28px 34px;">
              ${recipientName ? `<h2 style="margin: 0 0 18px 0; font-size: 19px; font-weight: 800; color: #0c2217; font-family: 'Playfair Display', Georgia, serif; line-height: 26px;">Assalam-o-Alaikum, ${recipientName}!</h2>` : ''}

              <!-- Body Paragraphs -->
              <div style="color: #292524; font-size: 14.5px; line-height: 1.7;">
                ${formattedBody}
              </div>

              <!-- Interactive Call-To-Action Button -->
              ${resolvedActionText && resolvedActionUrl ? `
              <div style="text-align: center; margin: 34px 0 24px 0;">
                <a href="${resolvedActionUrl}" target="_blank" class="mobile-btn" style="display: inline-block; padding: 15px 36px; background-color: #0c2217; color: #ffffff !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; font-weight: 800; text-decoration: none; border-radius: 12px; border: 1px solid #d4a359; box-shadow: 0 4px 16px rgba(12, 34, 23, 0.25); text-transform: uppercase; letter-spacing: 0.5px;">
                  ${resolvedActionText} &rarr;
                </a>
              </div>
              ` : ''}

              <!-- Official Arabic Calligraphy Signature Block -->
              <div style="margin-top: 32px; padding-top: 22px; border-top: 1px solid #e6ded1;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="vertical-align: middle; width: 48px; padding-right: 14px;">
                      <div style="width: 44px; height: 44px; border-radius: 12px; background-color: #0c2217; border: 1px solid #d4a359; text-align: center; line-height: 44px; color: #d4a359; font-weight: 900; font-size: 18px; font-family: serif;">
                        علم
                      </div>
                    </td>
                    <td style="vertical-align: middle;">
                      <div style="font-size: 14px; font-weight: 800; color: #0c2217; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        IlmiDunya Academic Faculty &amp; Support
                      </div>
                      <div style="font-size: 12px; color: #78716c; margin-top: 2px;">
                        Official Portal: <a href="${clientUrl}" target="_blank" style="color: #b85d34; text-decoration: none; font-weight: 700;">ilmidunya.com</a> &bull; Direct: <a href="mailto:info@ilmidunya.com" style="color: #0c2217; font-weight: 600; text-decoration: none;">info@ilmidunya.com</a>
                      </div>
                      <div style="font-size: 11px; color: #a8a29e; margin-top: 2px;">
                        Helpline: +92 317 1759093 &bull; WhatsApp Available
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Quick Navigation Bar -->
          <tr>
            <td style="background-color: #faf8f5; border-top: 1px solid #e6ded1; padding: 14px 24px; text-align: center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 11.5px; font-weight: 700; color: #78716c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <a href="${clientUrl}/tutors" target="_blank" style="color: #0c2217; text-decoration: none; padding: 0 10px;">Browse Tutors</a> &bull;
                    <a href="${clientUrl}/login/student" target="_blank" style="color: #0c2217; text-decoration: none; padding: 0 10px;">Student Login</a> &bull;
                    <a href="${clientUrl}/login/tutor" target="_blank" style="color: #0c2217; text-decoration: none; padding: 0 10px;">Faculty Portal</a> &bull;
                    <a href="${clientUrl}/contact" target="_blank" style="color: #0c2217; text-decoration: none; padding: 0 10px;">Contact Us</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Legal & Brand Footer -->
          <tr>
            <td class="mobile-footer" style="padding: 24px 30px; background-color: #f5f0e6; border-top: 1px solid #e6ded1; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 800; color: #0c2217; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                IlmiDunya Pakistan &bull; Verified Academic &amp; Quranic Tutoring Network
              </p>
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #78716c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Islamabad &bull; Lahore &bull; Karachi &bull; Peshawar &bull; Quetta &bull; Nationwide
              </p>
              <p style="margin: 0; font-size: 10.5px; color: #a8a29e; line-height: 1.45; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                This official notification was dispatched from <a href="mailto:info@ilmidunya.com" style="color: #78716c; text-decoration: underline;">info@ilmidunya.com</a>. You can reply directly to this email to contact our academic coordinators.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = {
  buildBrandedEmailHtml,
  formatBodyToHtml
};
