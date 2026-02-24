// ===========================================
// THE VIDEO POOL - Email Service (SendGrid)
// ===========================================

import sgMail from '@sendgrid/mail';

// Initialize SendGrid (only if API key is configured)
let sendgridEnabled = false;
if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sendgridEnabled = true;
    console.log('[EMAIL] SendGrid initialized');
  } catch (error) {
    console.warn('[EMAIL] SendGrid initialization failed:', error.message);
    console.warn('[EMAIL] Email service will be disabled - set valid SENDGRID_API_KEY to enable');
  }
} else {
  console.warn('[EMAIL] SENDGRID_API_KEY not configured - email service disabled');
}

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@thevideopool.com';
const FROM_NAME = process.env.FROM_NAME || 'The Video Pool';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

/**
 * Send an email using SendGrid
 * @param {object} options - Email options
 * @returns {Promise<boolean>} - Success status
 */
const sendEmail = async ({ to, subject, text, html }) => {
  // If SendGrid is not configured, log and skip
  if (!sendgridEnabled) {
    console.warn(`[EMAIL] SendGrid disabled - skipping email to ${to} (subject: "${subject}")`);
    return false;
  }

  try {
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject,
      text,
      html,
    };

    await sgMail.send(msg);
    console.log(`[EMAIL] Sent "${subject}" to ${to}`);
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send:', error.message);
    if (error.response) {
      console.error('[EMAIL] SendGrid error:', error.response.body);
    }
    throw new Error('Failed to send email');
  }
};

// ===========================================
// EMAIL TEMPLATES
// ===========================================

/**
 * Send verification email with 6-digit code
 * @param {string} email - Recipient email
 * @param {string} code - 6-digit verification code
 * @param {string} name - User's name (optional)
 */
export const sendVerificationEmail = async (email, code, name = '') => {
  const greeting = name ? `Hi ${name}` : 'Hi there';

  const subject = `${code} is your Video Pool verification code`;

  const text = `
${greeting},

Your verification code is: ${code}

Enter this code to verify your email address and complete your registration.

This code will expire in 15 minutes.

If you didn't create an account with The Video Pool, you can safely ignore this email.

- The Video Pool Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; padding: 40px 20px; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #111; border-radius: 12px; padding: 40px; border: 1px solid #222;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #00d4ff; font-size: 24px; margin: 0;">The Video Pool</h1>
    </div>

    <p style="color: #fff; font-size: 16px; margin: 0 0 20px;">${greeting},</p>

    <p style="color: #aaa; font-size: 14px; margin: 0 0 30px;">
      Enter this code to verify your email address:
    </p>

    <div style="background-color: #1a1a1a; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 30px; border: 1px solid #333;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #00d4ff;">${code}</span>
    </div>

    <p style="color: #666; font-size: 13px; margin: 0 0 10px;">
      This code expires in 15 minutes.
    </p>

    <p style="color: #666; font-size: 13px; margin: 0;">
      If you didn't create an account, you can safely ignore this email.
    </p>

    <hr style="border: none; border-top: 1px solid #222; margin: 30px 0;">

    <p style="color: #444; font-size: 12px; text-align: center; margin: 0;">
      The Video Pool - Premium DJ Music Videos
    </p>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send password reset email with token link
 * @param {string} email - Recipient email
 * @param {string} token - Password reset token
 * @param {string} name - User's name (optional)
 */
export const sendPasswordResetEmail = async (email, token, name = '') => {
  const greeting = name ? `Hi ${name}` : 'Hi there';
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  const subject = 'Reset your Video Pool password';

  const text = `
${greeting},

We received a request to reset your password for The Video Pool.

Click the link below to create a new password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

- The Video Pool Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; padding: 40px 20px; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #111; border-radius: 12px; padding: 40px; border: 1px solid #222;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #00d4ff; font-size: 24px; margin: 0;">The Video Pool</h1>
    </div>

    <p style="color: #fff; font-size: 16px; margin: 0 0 20px;">${greeting},</p>

    <p style="color: #aaa; font-size: 14px; margin: 0 0 30px;">
      We received a request to reset your password. Click the button below to create a new password:
    </p>

    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${resetUrl}" style="display: inline-block; background-color: #00d4ff; color: #000; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 14px;">
        Reset Password
      </a>
    </div>

    <p style="color: #666; font-size: 13px; margin: 0 0 10px;">
      This link expires in 1 hour.
    </p>

    <p style="color: #666; font-size: 13px; margin: 0 0 20px;">
      If you didn't request this, you can safely ignore this email.
    </p>

    <p style="color: #444; font-size: 12px; margin: 0 0 10px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="color: #00d4ff; font-size: 11px; word-break: break-all; margin: 0;">
      ${resetUrl}
    </p>

    <hr style="border: none; border-top: 1px solid #222; margin: 30px 0;">

    <p style="color: #444; font-size: 12px; text-align: center; margin: 0;">
      The Video Pool - Premium DJ Music Videos
    </p>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send welcome email after successful registration
 * @param {string} email - Recipient email
 * @param {string} name - User's name
 */
export const sendWelcomeEmail = async (email, name = '') => {
  const greeting = name ? `Welcome, ${name}!` : 'Welcome to The Video Pool!';
  const loginUrl = `${FRONTEND_URL}/login`;
  const browseUrl = `${FRONTEND_URL}/videos`;

  const subject = 'Welcome to The Video Pool!';

  const text = `
${greeting}

Your account is now active and ready to use.

The Video Pool gives you access to over 30,000 premium DJ music videos, including:
- Latest releases updated weekly
- HD quality videos in multiple formats
- Karaoke versions for many tracks
- Curated playlists and trending charts

Log in to start exploring: ${loginUrl}

If you have any questions, reply to this email and we'll be happy to help.

Rock on!
- The Video Pool Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; padding: 40px 20px; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #111; border-radius: 12px; padding: 40px; border: 1px solid #222;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #00d4ff; font-size: 24px; margin: 0;">The Video Pool</h1>
    </div>

    <h2 style="color: #fff; font-size: 22px; text-align: center; margin: 0 0 30px;">${greeting}</h2>

    <p style="color: #aaa; font-size: 14px; margin: 0 0 24px;">
      Your account is now active. Here's what you can do:
    </p>

    <div style="background-color: #1a1a1a; border-radius: 8px; padding: 20px; margin-bottom: 30px; border: 1px solid #333;">
      <ul style="color: #ccc; font-size: 14px; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Access 30,000+ premium DJ music videos</li>
        <li style="margin-bottom: 10px;">New releases added weekly</li>
        <li style="margin-bottom: 10px;">HD quality in multiple formats</li>
        <li style="margin-bottom: 0;">Curated playlists and trending charts</li>
      </ul>
    </div>

    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${browseUrl}" style="display: inline-block; background-color: #00d4ff; color: #000; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 14px;">
        Start Browsing Videos
      </a>
    </div>

    <p style="color: #666; font-size: 13px; margin: 0;">
      Have questions? Just reply to this email and we'll help you out.
    </p>

    <hr style="border: none; border-top: 1px solid #222; margin: 30px 0;">

    <p style="color: #444; font-size: 12px; text-align: center; margin: 0;">
      The Video Pool - Premium DJ Music Videos
    </p>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send 2FA enabled notification
 * @param {string} email - Recipient email
 * @param {string} name - User's name (optional)
 */
export const send2FAEnabledEmail = async (email, name = '') => {
  const greeting = name ? `Hi ${name}` : 'Hi there';

  const subject = 'Two-factor authentication enabled';

  const text = `
${greeting},

Two-factor authentication has been enabled on your Video Pool account.

From now on, you'll need to enter a code from your authenticator app when signing in.

If you didn't enable this, please contact support immediately.

- The Video Pool Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; padding: 40px 20px; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #111; border-radius: 12px; padding: 40px; border: 1px solid #222;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #00d4ff; font-size: 24px; margin: 0;">The Video Pool</h1>
    </div>

    <p style="color: #fff; font-size: 16px; margin: 0 0 20px;">${greeting},</p>

    <div style="background-color: #0a2a1a; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #1a4a2a;">
      <p style="color: #4ade80; font-size: 14px; margin: 0;">
        <strong>Two-factor authentication is now enabled</strong> on your account.
      </p>
    </div>

    <p style="color: #aaa; font-size: 14px; margin: 0 0 24px;">
      From now on, you'll need to enter a code from your authenticator app when signing in.
    </p>

    <p style="color: #666; font-size: 13px; margin: 0;">
      If you didn't make this change, please contact support immediately.
    </p>

    <hr style="border: none; border-top: 1px solid #222; margin: 30px 0;">

    <p style="color: #444; font-size: 12px; text-align: center; margin: 0;">
      The Video Pool - Premium DJ Music Videos
    </p>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send password changed notification
 * @param {string} email - Recipient email
 * @param {string} name - User's name (optional)
 */
export const sendPasswordChangedEmail = async (email, name = '') => {
  const greeting = name ? `Hi ${name}` : 'Hi there';

  const subject = 'Your password was changed';

  const text = `
${greeting},

Your Video Pool password was just changed.

If you made this change, you can ignore this email.

If you didn't change your password, please contact support immediately to secure your account.

- The Video Pool Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; padding: 40px 20px; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #111; border-radius: 12px; padding: 40px; border: 1px solid #222;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #00d4ff; font-size: 24px; margin: 0;">The Video Pool</h1>
    </div>

    <p style="color: #fff; font-size: 16px; margin: 0 0 20px;">${greeting},</p>

    <p style="color: #aaa; font-size: 14px; margin: 0 0 24px;">
      Your Video Pool password was just changed.
    </p>

    <p style="color: #aaa; font-size: 14px; margin: 0 0 24px;">
      If you made this change, you can ignore this email.
    </p>

    <div style="background-color: #2a1a1a; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #4a2a2a;">
      <p style="color: #f87171; font-size: 14px; margin: 0;">
        <strong>Didn't make this change?</strong> Contact support immediately to secure your account.
      </p>
    </div>

    <hr style="border: none; border-top: 1px solid #222; margin: 30px 0;">

    <p style="color: #444; font-size: 12px; text-align: center; margin: 0;">
      The Video Pool - Premium DJ Music Videos
    </p>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
};

// ===========================================
// EXPORTS
// ===========================================

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  send2FAEnabledEmail,
  sendPasswordChangedEmail,
};
