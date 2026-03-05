/**
 * THE VIDEO POOL - Email Campaign Routes
 *
 * Endpoints for:
 * - POST /api/campaigns/send - Trigger email campaign
 * - GET /api/unsubscribe - Handle unsubscribe links
 * - GET /api/email-preferences - Email preference center
 *
 * Email Provider: Resend (https://resend.com)
 * Superior deliverability, bounce handling, and developer experience
 */

import express from 'express';
import { Resend } from 'resend';
import pool from '../db/pool.js';

const router = express.Router();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://dev.thevideopool.com';

// Initialize Resend
let resend = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
  console.log('[EMAIL] Resend configured');
} else {
  console.warn('[EMAIL] RESEND_API_KEY not set — email sending disabled');
}

// ====================================
// CAMPAIGN SEND ENDPOINT
// ====================================

/**
 * POST /api/campaigns/send
 * Start bulk email campaign
 *
 * Query params:
 * - limit: max emails to send (default: 300)
 * - delay_ms: ms between emails (default: 100)
 * - dry_run: true to preview without sending
 */
router.post('/campaigns/send', async (req, res) => {
  try {
    if (!RESEND_API_KEY) {
      return res.status(400).json({ error: 'Resend not configured. Set RESEND_API_KEY environment variable.' });
    }

    const limit = parseInt(req.query.limit) || 300;
    const delayMs = parseInt(req.query.delay_ms) || 100;
    const dryRun = req.query.dry_run === 'true';

    console.log(`📧 Starting campaign: limit=${limit}, delay=${delayMs}ms, dryRun=${dryRun}`);

    // Fetch emails (not sent, not unsubscribed, any verification status)
    const result = await pool.query(
      'SELECT id, email, name FROM tvp_subscribers WHERE (email_sent = false OR email_sent IS NULL) AND (unsubscribed = false OR unsubscribed IS NULL) LIMIT $1',
      [limit]
    );

    const subscribers = result.rows;

    if (subscribers.length === 0) {
      return res.json({ message: 'No valid emails to send', sent: 0 });
    }

    console.log(`📤 Found ${subscribers.length} valid emails to send`);

    const results = {
      sent: [],
      failed: [],
      skipped: 0
    };

    // Read HTML email
    const fs = await import('fs');
    const emailHtml = fs.readFileSync('./email/tvp-welcome-back.html', 'utf8');

    // Send to each subscriber
    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i];
      const unsubscribeToken = Buffer.from(`${subscriber.id}:${Date.now()}`).toString('base64');

      // Personalize HTML with email and unsubscribe token
      const personalizedHtml = emailHtml
        .replace(/{{EMAIL}}/g, subscriber.email)
        .replace(/{{UNSUBSCRIBE_TOKEN}}/g, unsubscribeToken)
        .replace(/{{NAME}}/g, subscriber.name || 'DJ');

      if (dryRun) {
        console.log(`[DRY RUN] Would send to: ${subscriber.email}`);
        results.skipped++;
        continue;
      }

      try {
        // Send via Resend (superior deliverability and bounce handling)
        const response = await resend.emails.send({
          from: 'The Video Pool <info@thevideopool.com>',
          to: subscriber.email,
          subject: 'The Video Pool — 30% Off For Life',
          html: personalizedHtml,
          reply_to: 'support@thevideopool.com',
          // Resend automatically handles List-Unsubscribe headers
          // and provides excellent bounce tracking
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        // Update database
        await pool.query(
          'UPDATE tvp_subscribers SET email_sent = true, email_sent_at = $1 WHERE id = $2',
          [new Date().toISOString(), subscriber.id]
        );

        results.sent.push(subscriber.email);
        console.log(`✅ Sent to: ${subscriber.email} (${i + 1}/${subscribers.length})`);

      } catch (err) {
        console.error(`❌ Failed to send to ${subscriber.email}:`, err.message);
        results.failed.push({ email: subscriber.email, error: err.message });
      }

      // Delay between sends to avoid rate limiting
      if (i < subscribers.length - 1) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    res.json({
      campaign_status: 'completed',
      sent: results.sent.length,
      failed: results.failed.length,
      total: subscribers.length,
      provider: 'Resend',
      details: results
    });

  } catch (err) {
    console.error('Campaign error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ====================================
// UNSUBSCRIBE ENDPOINT
// ====================================

/**
 * GET /api/unsubscribe
 * Handle unsubscribe clicks from email
 *
 * Query params:
 * - email: subscriber email
 * - token: unsubscribe token from email link
 */
router.get('/unsubscribe', async (req, res) => {
  try {
    const { email, token } = req.query;

    if (!email || !token) {
      return res.status(400).json({ error: 'Missing email or token' });
    }

    // Find subscriber by email
    const result = await pool.query(
      'SELECT id FROM tvp_subscribers WHERE email = $1',
      [email]
    );

    const subscriber = result.rows[0];

    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    // Mark as unsubscribed
    await pool.query(
      'UPDATE tvp_subscribers SET unsubscribed = true WHERE id = $1',
      [subscriber.id]
    );

    // Return success page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #00d4ff; }
          p { color: #666; font-size: 16px; }
          a { color: #00d4ff; text-decoration: none; }
        </style>
      </head>
      <body>
        <h1>✅ Unsubscribed</h1>
        <p>You've been removed from our mailing list.</p>
        <p>We respect your privacy and won't send you any more emails.</p>
        <p><a href="https://www.thevideopool.com">← Back to The Video Pool</a></p>
      </body>
      </html>
    `);

    console.log(`🚫 Unsubscribed: ${email}`);

  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ====================================
// EMAIL PREFERENCES ENDPOINT
// ====================================

/**
 * GET /api/email-preferences
 * Preference center for subscribers
 */
router.get('/email-preferences', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    const result = await pool.query(
      'SELECT id, email, unsubscribed FROM tvp_subscribers WHERE email = $1',
      [email]
    );

    const subscriber = result.rows[0];

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Preferences - The Video Pool</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', Arial, sans-serif;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
            color: #fff;
            padding: 40px 20px;
            min-height: 100vh;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: rgba(20, 20, 32, 0.8);
            border: 1px solid rgba(0, 212, 255, 0.1);
            border-radius: 12px;
            padding: 40px;
            backdrop-filter: blur(10px);
          }
          h1 {
            color: #00d4ff;
            margin-bottom: 10px;
            font-size: 28px;
          }
          .subtitle {
            color: #888;
            font-size: 14px;
            margin-bottom: 30px;
          }
          .pref-group {
            margin-bottom: 25px;
          }
          .pref-group label {
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 15px;
            background: rgba(0, 212, 255, 0.05);
            border-radius: 8px;
            transition: background 0.2s;
          }
          .pref-group label:hover {
            background: rgba(0, 212, 255, 0.1);
          }
          input[type="checkbox"] {
            margin-right: 12px;
            width: 18px;
            height: 18px;
            cursor: pointer;
          }
          .button-group {
            display: flex;
            gap: 12px;
            margin-top: 30px;
          }
          button {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-save {
            background: #00d4ff;
            color: #000;
          }
          .btn-save:hover {
            background: #00e4ff;
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
          }
          .btn-cancel {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .btn-cancel:hover {
            background: rgba(255, 255, 255, 0.15);
          }
          .message {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
          }
          .message.success {
            background: rgba(76, 175, 80, 0.2);
            color: #4caf50;
            border: 1px solid #4caf50;
            display: block;
          }
          .message.error {
            background: rgba(244, 67, 54, 0.2);
            color: #f44336;
            border: 1px solid #f44336;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📧 Email Preferences</h1>
          <p class="subtitle">Manage how you receive updates from The Video Pool</p>

          <div id="message" class="message"></div>

          <form id="preferencesForm">
            <div class="pref-group">
              <label>
                <input type="checkbox" name="promotions" checked>
                <span>Promotional offers and discounts (like this 30% off campaign)</span>
              </label>
            </div>

            <div class="pref-group">
              <label>
                <input type="checkbox" name="product_updates" checked>
                <span>New features and product updates</span>
              </label>
            </div>

            <div class="pref-group">
              <label>
                <input type="checkbox" name="weekly_picks" checked>
                <span>Weekly hot tracks and DJ picks</span>
              </label>
            </div>

            <div class="pref-group">
              <label>
                <input type="checkbox" name="all_emails">
                <span><strong>Unsubscribe from all emails</strong></span>
              </label>
            </div>

            <div class="button-group">
              <button type="submit" class="btn-save">Save Preferences</button>
              <button type="button" class="btn-cancel" onclick="window.history.back()">Cancel</button>
            </div>
          </form>
        </div>

        <script>
          const form = document.getElementById('preferencesForm');
          const messageDiv = document.getElementById('message');
          const email = '${email}';

          form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const allEmails = form.all_emails.checked;

            try {
              const response = await fetch('/api/update-preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email,
                  unsubscribed: allEmails,
                  preferences: {
                    promotions: form.promotions.checked,
                    product_updates: form.product_updates.checked,
                    weekly_picks: form.weekly_picks.checked
                  }
                })
              });

              const data = await response.json();

              if (response.ok) {
                messageDiv.className = 'message success';
                messageDiv.textContent = '✅ Preferences saved successfully';
                setTimeout(() => window.location.href = 'https://www.thevideopool.com', 2000);
              } else {
                throw new Error(data.error);
              }
            } catch (err) {
              messageDiv.className = 'message error';
              messageDiv.textContent = '❌ Error: ' + err.message;
            }
          });

          // Uncheck all if "unsubscribe all" is checked
          form.all_emails.addEventListener('change', () => {
            if (form.all_emails.checked) {
              form.promotions.checked = false;
              form.product_updates.checked = false;
              form.weekly_picks.checked = false;
            }
          });
        </script>
      </body>
      </html>
    `);

  } catch (err) {
    console.error('Preferences error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
