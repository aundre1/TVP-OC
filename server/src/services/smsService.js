// ===========================================
// THE VIDEO POOL - SMS Service (Amazon SNS)
// Stub mode when AWS credentials not configured
// ===========================================

import { pool } from '../db/pool.js';

let snsClient = null;

// Initialize AWS SNS if credentials are available
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  try {
    const { SNSClient, PublishCommand } = await import('@aws-sdk/client-sns');
    snsClient = new SNSClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    console.log('[SMS] Amazon SNS configured');
  } catch (e) {
    console.warn('[SMS] AWS SDK not available:', e.message);
  }
} else {
  console.warn('[SMS] AWS credentials not set — SMS in stub mode');
}

/**
 * Check if user has exceeded monthly SMS limit (2/month)
 */
async function checkMonthlyLimit(userId) {
  if (!userId) return { allowed: true, sent: 0 };

  const result = await pool.query(
    `SELECT COUNT(*) as cnt FROM sms_sends
     WHERE user_id = $1 AND sent_at >= date_trunc('month', CURRENT_TIMESTAMP)`,
    [userId]
  );

  const sent = parseInt(result.rows[0].cnt);
  return { allowed: sent < 2, sent };
}

/**
 * Record SMS send in database
 */
async function recordSend(userId, phone, message, status = 'sent') {
  try {
    await pool.query(
      `INSERT INTO sms_sends (user_id, phone, message, status) VALUES ($1, $2, $3, $4)`,
      [userId, phone, message, status]
    );
  } catch (e) {
    console.warn('[SMS] Failed to record send:', e.message);
  }
}

/**
 * Send a single SMS
 */
export async function sendSMS(phone, message, userId = null) {
  // Check monthly limit
  if (userId) {
    const { allowed, sent } = await checkMonthlyLimit(userId);
    if (!allowed) {
      console.warn(`[SMS] Monthly limit reached for user ${userId} (${sent}/2)`);
      return { success: false, reason: 'monthly_limit_reached', sent };
    }
  }

  // Stub mode
  if (!snsClient) {
    console.log(`[SMS STUB] To: ${phone} | Message: ${message}`);
    await recordSend(userId, phone, message, 'stub');
    return { success: true, stub: true };
  }

  // Send via SNS
  try {
    const { PublishCommand } = await import('@aws-sdk/client-sns');
    const cmd = new PublishCommand({
      PhoneNumber: phone,
      Message: message,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': { DataType: 'String', StringValue: 'TVP' },
        'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' },
      },
    });

    const result = await snsClient.send(cmd);
    console.log(`[SMS] Sent to ${phone}: ${result.MessageId}`);
    await recordSend(userId, phone, message, 'sent');
    return { success: true, messageId: result.MessageId };
  } catch (e) {
    console.error('[SMS] Send failed:', e.message);
    await recordSend(userId, phone, message, 'failed');
    return { success: false, error: e.message };
  }
}

/**
 * Send bulk SMS with rate limiting (100ms between sends)
 */
export async function sendBulkSMS(phones, message) {
  const results = [];
  for (const phone of phones) {
    results.push(await sendSMS(phone, message));
    // Rate limit: 100ms between sends
    await new Promise(r => setTimeout(r, 100));
  }
  return results;
}

export default { sendSMS, sendBulkSMS };
