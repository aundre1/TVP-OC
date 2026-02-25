// ===========================================
// THE VIDEO POOL - Email Service
// Multi-provider: Brevo (marketing) → SendGrid (fallback) → Google SMTP (transactional)
// ===========================================

import nodemailer from 'nodemailer';

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'info@thevideopool.com';
const FROM_NAME = process.env.FROM_NAME || 'The Video Pool';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const ADMIN_URL = process.env.ADMIN_URL || `${FRONTEND_URL}/admin`;

// ===========================================
// HTML ESCAPING (prevents XSS in email templates)
// ===========================================

const escapeHtml = (str) => {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// ===========================================
// PROVIDER SETUP
// ===========================================

// Google Workspace SMTP (transactional)
let gmailTransport = null;
if (process.env.GOOGLE_APP_PASSWORD) {
  try {
    gmailTransport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: FROM_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });
    console.log('[EMAIL] Google Workspace SMTP configured');
  } catch (e) {
    console.warn('[EMAIL] Google SMTP setup failed:', e.message);
  }
} else {
  console.warn('[EMAIL] GOOGLE_APP_PASSWORD not set — SMTP disabled');
}

// Brevo API (marketing)
const brevoEnabled = !!process.env.BREVO_API_KEY;
if (brevoEnabled) console.log('[EMAIL] Brevo API configured');

// Mailjet API (marketing)
const mailjetEnabled = !!(process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY);
if (mailjetEnabled) console.log('[EMAIL] Mailjet API configured');

// SendGrid (fallback)
let sgMail = null;
if (process.env.SENDGRID_API_KEY) {
  try {
    const sg = await import('@sendgrid/mail');
    sgMail = sg.default || sg;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('[EMAIL] SendGrid configured');
  } catch (e) {
    console.warn('[EMAIL] SendGrid not available:', e.message);
  }
}

// Elastic Email API (marketing)
const elasticEmailEnabled = !!process.env.ELASTICEMAIL_API_KEY;
if (elasticEmailEnabled) console.log('[EMAIL] Elastic Email configured');

// ===========================================
// SEND FUNCTIONS
// ===========================================

/**
 * Send transactional email via Google SMTP (with Brevo + SendGrid fallbacks)
 */
const sendTransactional = async ({ to, subject, text, html }) => {
  // Try Google SMTP first
  if (gmailTransport) {
    try {
      await gmailTransport.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to, subject, text, html,
      });
      console.log(`[EMAIL] Sent via SMTP: "${subject}" → ${to}`);
      return true;
    } catch (e) {
      console.warn('[EMAIL] SMTP failed, trying fallback:', e.message);
    }
  }

  // Fallback to Brevo (transactional emails work on free plan)
  if (brevoEnabled) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: FROM_NAME, email: FROM_EMAIL },
          to: Array.isArray(to) ? to.map(e => ({ email: e })) : [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });
      if (res.ok) {
        console.log(`[EMAIL] Sent via Brevo: "${subject}" → ${to}`);
        return true;
      }
      const errBody = await res.text();
      console.warn('[EMAIL] Brevo transactional failed:', errBody);
    } catch (e) {
      console.warn('[EMAIL] Brevo transactional error:', e.message);
    }
  }

  // Fallback to SendGrid
  if (sgMail) {
    try {
      await sgMail.send({ to, from: { email: FROM_EMAIL, name: FROM_NAME }, subject, text, html });
      console.log(`[EMAIL] Sent via SendGrid: "${subject}" → ${to}`);
      return true;
    } catch (e) {
      console.warn('[EMAIL] SendGrid failed:', e.message);
    }
  }

  console.warn(`[EMAIL] No provider available — skipping: "${subject}" → ${to}`);
  return false;
};

/**
 * Send marketing blast via Brevo (with SendGrid fallback)
 */
const sendMarketing = async ({ to, subject, text, html }) => {
  // Try Brevo first
  if (brevoEnabled) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: FROM_NAME, email: FROM_EMAIL },
          to: Array.isArray(to) ? to.map(e => ({ email: e })) : [{ email: to }],
          subject, htmlContent: html, textContent: text,
        }),
      });
      if (res.ok) {
        console.log(`[EMAIL] Sent via Brevo: "${subject}"`);
        return true;
      }
      console.warn('[EMAIL] Brevo failed:', await res.text());
    } catch (e) {
      console.warn('[EMAIL] Brevo error:', e.message);
    }
  }

  // Fallback to SendGrid
  if (sgMail) {
    try {
      const recipients = Array.isArray(to) ? to : [to];
      for (const recipient of recipients) {
        await sgMail.send({ to: recipient, from: { email: FROM_EMAIL, name: FROM_NAME }, subject, text, html });
      }
      console.log(`[EMAIL] Sent via SendGrid (marketing fallback): "${subject}"`);
      return true;
    } catch (e) {
      console.warn('[EMAIL] SendGrid marketing fallback failed:', e.message);
    }
  }

  console.warn(`[EMAIL] No marketing provider — skipping: "${subject}"`);
  return false;
};

/**
 * Send a single email via a specific provider (used by blast distributor)
 * @param {string} provider - Provider key: brevo, mailjet, sendgrid, elasticemail, direct
 * @param {{ to, subject, text, html }} params
 * @returns {Promise<boolean>}
 */
const sendViaProvider = async (provider, { to, subject, text, html }) => {
  try {
    switch (provider) {
      case 'brevo': {
        if (!brevoEnabled) return false;
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
          },
          body: JSON.stringify({
            sender: { name: FROM_NAME, email: FROM_EMAIL },
            to: [{ email: to }],
            subject, htmlContent: html, textContent: text,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        return true;
      }

      case 'mailjet': {
        if (!mailjetEnabled) return false;
        const auth = Buffer.from(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`).toString('base64');
        const res = await fetch('https://api.mailjet.com/v3.1/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`,
          },
          body: JSON.stringify({
            Messages: [{
              From: { Email: FROM_EMAIL, Name: FROM_NAME },
              To: [{ Email: to }],
              Subject: subject,
              HTMLPart: html,
              TextPart: text,
            }],
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        return true;
      }

      case 'sendgrid': {
        if (!sgMail) return false;
        await sgMail.send({ to, from: { email: FROM_EMAIL, name: FROM_NAME }, subject, text, html });
        return true;
      }

      case 'elasticemail': {
        if (!elasticEmailEnabled) return false;
        const params = new URLSearchParams({
          apikey: process.env.ELASTICEMAIL_API_KEY,
          from: FROM_EMAIL,
          fromName: FROM_NAME,
          to,
          subject,
          bodyHtml: html || '',
          bodyText: text || '',
        });
        const res = await fetch('https://api.elasticemail.com/v2/email/send', {
          method: 'POST',
          body: params,
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Elastic Email send failed');
        return true;
      }

      case 'direct': {
        if (!gmailTransport) return false;
        await gmailTransport.sendMail({
          from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
          to, subject, text, html,
        });
        return true;
      }

      default:
        console.warn(`[EMAIL] Unknown provider: ${provider}`);
        return false;
    }
  } catch (e) {
    console.warn(`[EMAIL] ${provider} send failed for ${to}:`, e.message);
    return false;
  }
};

// Generic send (routes to transactional)
const sendEmail = sendTransactional;

// ===========================================
// HTML TEMPLATE WRAPPER
// ===========================================

const wrap = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; padding: 40px 20px; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #111; border-radius: 12px; padding: 40px; border: 1px solid #222;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #00d4ff; font-size: 24px; margin: 0;">The Video Pool</h1>
    </div>
    ${content}
    <hr style="border: none; border-top: 1px solid #222; margin: 30px 0;">
    <p style="color: #444; font-size: 12px; text-align: center; margin: 0;">The Video Pool — Premium DJ Music Videos</p>
  </div>
</body>
</html>`.trim();

// ===========================================
// EMAIL TEMPLATES
// ===========================================

export const sendVerificationEmail = async (email, code, name = '') => {
  const greeting = name ? `Hi ${name}` : 'Hi there';
  return sendTransactional({
    to: email,
    subject: `${code} is your Video Pool verification code`,
    text: `${greeting},\n\nYour verification code is: ${code}\n\nThis code expires in 15 minutes.\n\n- The Video Pool Team`,
    html: wrap(`
      <p style="color: #fff; font-size: 16px;">${escapeHtml(greeting)},</p>
      <p style="color: #aaa; font-size: 14px;">Enter this code to verify your email:</p>
      <div style="background: #1a1a1a; border-radius: 8px; padding: 24px; text-align: center; margin: 20px 0; border: 1px solid #333;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #00d4ff;">${code}</span>
      </div>
      <p style="color: #666; font-size: 13px;">This code expires in 15 minutes.</p>
    `),
  });
};

export const sendPasswordResetEmail = async (email, token, name = '') => {
  const greeting = name ? `Hi ${name}` : 'Hi there';
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  return sendTransactional({
    to: email,
    subject: 'Reset your Video Pool password',
    text: `${greeting},\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour.\n\n- The Video Pool Team`,
    html: wrap(`
      <p style="color: #fff; font-size: 16px;">${escapeHtml(greeting)},</p>
      <p style="color: #aaa; font-size: 14px;">Click below to reset your password:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #00d4ff; color: #000; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">Reset Password</a>
      </div>
      <p style="color: #666; font-size: 13px;">This link expires in 1 hour.</p>
    `),
  });
};

export const sendWelcomeEmail = async (email, name = '') => {
  const greeting = name ? `Welcome, ${name}!` : 'Welcome to The Video Pool!';
  return sendTransactional({
    to: email,
    subject: 'Welcome to The Video Pool!',
    text: `${greeting}\n\nYour account is active. Browse 30,000+ HD DJ music videos.\n\nLog in: ${FRONTEND_URL}/login\n\n- The Video Pool Team`,
    html: wrap(`
      <h2 style="color: #fff; font-size: 22px; text-align: center;">${escapeHtml(greeting)}</h2>
      <p style="color: #aaa; font-size: 14px;">Your account is active. Here's what you can do:</p>
      <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #333;">
        <ul style="color: #ccc; font-size: 14px; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Browse 30,000+ premium DJ music videos</li>
          <li style="margin-bottom: 8px;">Build sets with BPM & key matching</li>
          <li style="margin-bottom: 8px;">Download in HD & 4K quality</li>
          <li>New releases added daily</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${FRONTEND_URL}/videos" style="display: inline-block; background: #00d4ff; color: #000; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">Start Browsing</a>
      </div>
    `),
  });
};

export const sendPaymentFailedEmail = async (email, name = '') => {
  const greeting = name ? `Hi ${name}` : 'Hi there';
  return sendTransactional({
    to: email,
    subject: 'Your Video Pool payment didn\'t go through',
    text: `${greeting},\n\nWe couldn't process your payment. Please update your payment method at ${FRONTEND_URL}/settings.\n\n- The Video Pool Team`,
    html: wrap(`
      <p style="color: #fff; font-size: 16px;">${escapeHtml(greeting)},</p>
      <p style="color: #aaa; font-size: 14px;">We couldn't process your latest payment. Please update your payment method to keep your subscription active.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${FRONTEND_URL}/settings" style="display: inline-block; background: #00d4ff; color: #000; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">Update Payment</a>
      </div>
    `),
  });
};

export const sendSubscriptionConfirmedEmail = async (email, planName, name = '') => {
  const greeting = name ? `Hi ${name}` : 'Hi there';
  return sendTransactional({
    to: email,
    subject: `Welcome to ${planName}!`,
    text: `${greeting},\n\nYou're now on the ${planName} plan! Enjoy all features.\n\n- The Video Pool Team`,
    html: wrap(`
      <p style="color: #fff; font-size: 16px;">${escapeHtml(greeting)},</p>
      <div style="background: #0a2a1a; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #1a4a2a;">
        <p style="color: #4ade80; font-size: 16px; margin: 0; font-weight: bold;">🎉 Welcome to ${escapeHtml(planName)}!</p>
      </div>
      <p style="color: #aaa; font-size: 14px;">Your subscription is now active. Enjoy all the features of your new plan.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${FRONTEND_URL}/videos" style="display: inline-block; background: #00d4ff; color: #000; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">Start Downloading</a>
      </div>
    `),
  });
};

export const sendDownloadLimitEmail = async (email, used, limit, name = '') => {
  const greeting = name ? `Hi ${name}` : 'Hi there';
  return sendTransactional({
    to: email,
    subject: `You've used ${used} of ${limit} downloads this month`,
    text: `${greeting},\n\nYou've used ${used} of your ${limit} monthly downloads. Upgrade for more: ${FRONTEND_URL}/membership\n\n- The Video Pool Team`,
    html: wrap(`
      <p style="color: #fff; font-size: 16px;">${escapeHtml(greeting)},</p>
      <p style="color: #aaa; font-size: 14px;">You've used <strong style="color: #fff;">${used}</strong> of your <strong style="color: #fff;">${limit}</strong> monthly downloads.</p>
      <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #333;">
        <div style="background: #222; border-radius: 4px; height: 8px; overflow: hidden;">
          <div style="background: ${used >= limit ? '#ef4444' : '#00d4ff'}; height: 100%; width: ${Math.min(100, (used / limit) * 100)}%;"></div>
        </div>
        <p style="color: #888; font-size: 12px; margin: 8px 0 0; text-align: center;">${used}/${limit} downloads used</p>
      </div>
      ${used >= limit * 0.8 ? `<div style="text-align: center; margin: 24px 0;">
        <a href="${FRONTEND_URL}/membership" style="display: inline-block; background: #00d4ff; color: #000; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">Upgrade Plan</a>
      </div>` : ''}
    `),
  });
};

export const send2FAEnabledEmail = async (email, name = '') => {
  const greeting = name ? `Hi ${name}` : 'Hi there';
  return sendTransactional({
    to: email,
    subject: 'Two-factor authentication enabled',
    text: `${greeting},\n\n2FA has been enabled on your account.\n\n- The Video Pool Team`,
    html: wrap(`
      <p style="color: #fff; font-size: 16px;">${escapeHtml(greeting)},</p>
      <div style="background: #0a2a1a; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #1a4a2a;">
        <p style="color: #4ade80; font-size: 14px; margin: 0;"><strong>Two-factor authentication is now enabled</strong> on your account.</p>
      </div>
      <p style="color: #666; font-size: 13px;">If you didn't make this change, contact support immediately.</p>
    `),
  });
};

export const sendPasswordChangedEmail = async (email, name = '') => {
  const greeting = name ? `Hi ${name}` : 'Hi there';
  return sendTransactional({
    to: email,
    subject: 'Your password was changed',
    text: `${greeting},\n\nYour password was just changed. If this wasn't you, contact support.\n\n- The Video Pool Team`,
    html: wrap(`
      <p style="color: #fff; font-size: 16px;">${escapeHtml(greeting)},</p>
      <p style="color: #aaa; font-size: 14px;">Your Video Pool password was just changed.</p>
      <div style="background: #2a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #4a2a2a;">
        <p style="color: #f87171; font-size: 14px; margin: 0;"><strong>Didn't make this change?</strong> Contact support immediately.</p>
      </div>
    `),
  });
};

// ===========================================
// SUPPORT / TICKET EMAILS
// ===========================================

export const sendSupportTicketNotification = async (ticket, user) => {
  const adminLink = `${ADMIN_URL}/support/tickets/${ticket.id}`;
  return sendTransactional({
    to: 'info@thevideopool.com',
    subject: `[TVP Support] ${ticket.category}: ${ticket.subject}`,
    text: `New support ticket from ${user.name || user.email}\n\nCategory: ${ticket.category}\nPriority: ${ticket.priority}\nPlan: ${user.membership_type || 'free'}\n\n${ticket.message}\n\nView: ${adminLink}`,
    html: wrap(`
      <h3 style="color: #fff;">New Support Ticket</h3>
      <p style="color: #aaa;"><strong>From:</strong> ${escapeHtml(user.name || 'N/A')} (${escapeHtml(user.email)})</p>
      <p style="color: #aaa;"><strong>Plan:</strong> ${escapeHtml(user.membership_type || 'free')}</p>
      <p style="color: #aaa;"><strong>Category:</strong> ${escapeHtml(ticket.category)} | <strong>Priority:</strong> ${escapeHtml(ticket.priority)}</p>
      <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #333;">
        <p style="color: #ccc; margin: 0;">${escapeHtml(ticket.message)}</p>
      </div>
      <div style="text-align: center;">
        <a href="${adminLink}" style="display: inline-block; background: #00d4ff; color: #000; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">View in Admin</a>
      </div>
    `),
  });
};

export const sendSupportResponseEmail = async (userEmail, originalSubject, response, ticketId) => {
  return sendTransactional({
    to: userEmail,
    subject: `Re: ${originalSubject}`,
    text: `We've responded to your support ticket #${ticketId}:\n\n${response}\n\n- The Video Pool Team`,
    html: wrap(`
      <p style="color: #fff; font-size: 16px;">We've responded to your ticket:</p>
      <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #333;">
        <p style="color: #ccc; margin: 0;">${escapeHtml(response)}</p>
      </div>
      <p style="color: #666; font-size: 13px;">Ticket reference: #${ticketId}</p>
    `),
  });
};

// ===========================================
// SONG REQUEST EMAIL
// ===========================================

export const sendSongRequestEmail = async (ticket, user) => {
  // Notify Aundre
  await sendSupportTicketNotification(ticket, user);

  // Forward to Glenn if EDITOR_EMAIL is set
  const editorEmail = process.env.EDITOR_EMAIL;
  if (editorEmail) {
    const artist = ticket.artist || 'Unknown';
    const title = ticket.title || ticket.subject;
    const completeLink = `${ADMIN_URL}/content-queue?complete=${ticket.id}`;

    await sendTransactional({
      to: editorEmail,
      subject: `[TVP Song Request] ${artist} - ${title}`,
      text: `New song request:\n\nArtist: ${artist}\nTitle: ${title}\nRequested by: ${user.name || user.email}\nNotes: ${ticket.message || 'None'}\n\nMark complete: ${completeLink}`,
      html: wrap(`
        <h3 style="color: #fff;">🎵 New Song Request</h3>
        <p style="color: #aaa;"><strong>Artist:</strong> ${escapeHtml(artist)}</p>
        <p style="color: #aaa;"><strong>Title:</strong> ${escapeHtml(title)}</p>
        <p style="color: #aaa;"><strong>Requested by:</strong> ${escapeHtml(user.name || user.email)}</p>
        ${ticket.message ? `<p style="color: #aaa;"><strong>Notes:</strong> ${escapeHtml(ticket.message)}</p>` : ''}
        <div style="text-align: center; margin: 24px 0;">
          <a href="${completeLink}" style="display: inline-block; background: #4ade80; color: #000; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">Mark as Completed</a>
        </div>
      `),
    });
  }
};

// ===========================================
// EXPORTS
// ===========================================

export { sendEmail, sendTransactional, sendMarketing, sendViaProvider };

export default {
  sendEmail,
  sendTransactional,
  sendMarketing,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendPaymentFailedEmail,
  sendSubscriptionConfirmedEmail,
  sendDownloadLimitEmail,
  send2FAEnabledEmail,
  sendPasswordChangedEmail,
  sendSupportTicketNotification,
  sendSupportResponseEmail,
  sendSongRequestEmail,
  sendViaProvider,
};
