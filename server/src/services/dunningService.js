// ===========================================
// THE VIDEO POOL - Dunning Service
// Failed payment recovery automation
// ===========================================

import db from '../db/index.js';
import { sendEmail } from './emailService.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

/**
 * Handle a failed payment — initiate or advance dunning sequence
 */
export async function handleFailedPayment(userId, invoiceId) {
  // Check for existing dunning attempt
  const existing = await db.query(
    `SELECT * FROM dunning_attempts WHERE user_id = $1 AND stripe_invoice_id = $2 AND resolved = false`,
    [userId, invoiceId]
  );

  const user = await db.query('SELECT email, name FROM users WHERE id = $1', [userId]);
  if (user.rows.length === 0) return;
  const { email, name } = user.rows[0];

  if (existing.rows.length === 0) {
    // Day 0: First attempt
    await db.query(
      `INSERT INTO dunning_attempts (user_id, stripe_invoice_id, attempt_number, email_sent, next_attempt_at)
       VALUES ($1, $2, 1, true, NOW() + INTERVAL '3 days')`,
      [userId, invoiceId]
    );

    await sendDunningEmail(email, name, 1);
    console.log(`[DUNNING] Day 0 email sent to ${email}`);
  } else {
    const attempt = existing.rows[0];
    const nextAttempt = attempt.attempt_number + 1;

    if (nextAttempt === 2) {
      // Day 3
      await db.query(
        `UPDATE dunning_attempts SET attempt_number = 2, email_sent = true, next_attempt_at = NOW() + INTERVAL '4 days'
         WHERE id = $1`,
        [attempt.id]
      );
      await sendDunningEmail(email, name, 2);
      console.log(`[DUNNING] Day 3 email sent to ${email}`);
    } else if (nextAttempt === 3) {
      // Day 7
      await db.query(
        `UPDATE dunning_attempts SET attempt_number = 3, email_sent = true, next_attempt_at = NOW() + INTERVAL '1 day'
         WHERE id = $1`,
        [attempt.id]
      );
      await sendDunningEmail(email, name, 3);
      console.log(`[DUNNING] Day 7 final warning sent to ${email}`);
    } else if (nextAttempt >= 4) {
      // Day 8: Downgrade
      await db.query(
        `UPDATE users SET membership_type = 'free', status = 'cancelled', download_limit = 10 WHERE id = $1`,
        [userId]
      );
      await db.query(
        `UPDATE dunning_attempts SET resolved = true, resolved_at = NOW() WHERE id = $1`,
        [attempt.id]
      );
      console.log(`[DUNNING] User ${email} downgraded to free plan`);
    }
  }
}

/**
 * Resolve dunning when payment succeeds
 */
export async function resolveDunning(userId, invoiceId) {
  await db.query(
    `UPDATE dunning_attempts SET resolved = true, resolved_at = NOW()
     WHERE user_id = $1 AND stripe_invoice_id = $2 AND resolved = false`,
    [userId, invoiceId]
  );
}

async function sendDunningEmail(email, name, attempt) {
  const subjects = {
    1: 'Payment failed — please update your card',
    2: 'Your subscription is at risk',
    3: 'Last chance — account will be downgraded tomorrow',
  };

  const messages = {
    1: `Hi ${name || 'there'},\n\nWe weren't able to process your payment. Please update your payment method to keep your subscription active.\n\n${FRONTEND_URL}/settings/billing`,
    2: `Hi ${name || 'there'},\n\nThis is a reminder that your payment failed. Your subscription will be downgraded if payment isn't resolved soon.\n\n${FRONTEND_URL}/settings/billing`,
    3: `Hi ${name || 'there'},\n\nFinal notice: your account will be downgraded to the free plan tomorrow unless you update your payment method.\n\n${FRONTEND_URL}/settings/billing`,
  };

  try {
    await sendEmail({
      to: email,
      subject: subjects[attempt],
      text: messages[attempt],
    });
  } catch (e) {
    console.error(`[DUNNING] Failed to send email attempt ${attempt} to ${email}:`, e.message);
  }
}

export default { handleFailedPayment, resolveDunning };
