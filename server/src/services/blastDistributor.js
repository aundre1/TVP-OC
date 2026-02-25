// ===========================================
// THE VIDEO POOL - Blast Distributor
// Fully automated multi-provider email blast pipeline
// ===========================================

import db from '../db/index.js';
import { sendViaProvider } from './emailService.js';
import { EMAIL_PROVIDERS, TOTAL_DAILY_CAPACITY, getDailyAllocation } from '../config/emailProviders.js';

// ===========================================
// HELPERS
// ===========================================

/** Fisher-Yates shuffle */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Segment SQL conditions */
const SEGMENT_SQL = {
  all: '1=1',
  subscribers: "membership_type IN ('starter','pro','elite')",
  free: "membership_type = 'free'",
  inactive: "last_login < NOW() - INTERVAL '30 days'",
};

// ===========================================
// INITIALIZE BLAST
// ===========================================

/**
 * Initialize a blast: generate recipients, assign providers, start first batch.
 * Called after admin creates a blast.
 * @returns {{ blastId, totalRecipients, estimatedDays, dailyCapacity }}
 */
export async function initializeBlast(blastId) {
  // Get blast details
  const blastResult = await db.query('SELECT * FROM marketing_blasts WHERE id = $1', [blastId]);
  if (!blastResult.rows.length) throw new Error(`Blast ${blastId} not found`);
  const blast = blastResult.rows[0];

  // Get recipients
  const condition = SEGMENT_SQL[blast.segment] || '1=1';
  const recipientResult = await db.query(
    `SELECT id, email FROM users WHERE ${condition} AND email IS NOT NULL ORDER BY id`
  );
  const allRecipients = shuffle(recipientResult.rows);
  const totalRecipients = allRecipients.length;

  if (totalRecipients === 0) {
    await db.query("UPDATE marketing_blasts SET status = 'sent', sent_count = 0 WHERE id = $1", [blastId]);
    return { blastId, totalRecipients: 0, estimatedDays: 0, dailyCapacity: TOTAL_DAILY_CAPACITY };
  }

  // Split into daily batches and assign providers
  const allocation = getDailyAllocation();
  const dailyCapacity = allocation.reduce((s, a) => s + a.count, 0) || TOTAL_DAILY_CAPACITY;
  const estimatedDays = Math.ceil(totalRecipients / dailyCapacity);

  let recipientIndex = 0;
  let batchDay = 0;

  // Ensure blast_recipients table exists (idempotent)
  await db.query(`
    CREATE TABLE IF NOT EXISTS blast_recipients (
      id SERIAL PRIMARY KEY,
      blast_id INTEGER NOT NULL REFERENCES marketing_blasts(id),
      user_id INTEGER NOT NULL,
      email VARCHAR(255) NOT NULL,
      provider VARCHAR(50) NOT NULL,
      batch_day INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      sent_at TIMESTAMPTZ,
      error_message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Create index if not exists
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_blast_recipients_blast_status ON blast_recipients(blast_id, status)
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_blast_recipients_batch ON blast_recipients(blast_id, batch_day, status)
  `);

  // Build all recipient assignments
  const values = [];
  const params = [];
  let paramIdx = 1;

  while (recipientIndex < totalRecipients) {
    let positionInBatch = 0;

    for (const { provider, count } of allocation) {
      for (let i = 0; i < count && recipientIndex < totalRecipients; i++) {
        const r = allRecipients[recipientIndex];
        values.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3}, $${paramIdx + 4})`);
        params.push(blastId, r.id, r.email, provider, batchDay);
        paramIdx += 5;
        recipientIndex++;
        positionInBatch++;
      }
    }

    batchDay++;
  }

  // Bulk insert recipients
  if (values.length > 0) {
    // Insert in chunks of 1000 to avoid param limits
    const chunkSize = 1000;
    for (let i = 0; i < values.length; i += chunkSize) {
      const chunkValues = values.slice(i, i + chunkSize);
      const chunkParams = params.slice(i * 5, (i + chunkSize) * 5);
      // Reindex params for this chunk
      let idx = 1;
      const reindexedValues = [];
      const reindexedParams = [];
      for (let j = i; j < Math.min(i + chunkSize, values.length); j++) {
        const r = allRecipients[j] || {};
        // Pull from original params
        const base = j * 5;
        reindexedValues.push(`($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`);
        reindexedParams.push(params[base], params[base + 1], params[base + 2], params[base + 3], params[base + 4]);
        idx += 5;
      }
      await db.query(
        `INSERT INTO blast_recipients (blast_id, user_id, email, provider, batch_day)
         VALUES ${reindexedValues.join(', ')}`,
        reindexedParams
      );
    }
  }

  // Update blast status
  await db.query(
    `UPDATE marketing_blasts
     SET status = 'sending', recipient_count = $1, started_at = NOW()
     WHERE id = $2`,
    [totalRecipients, blastId]
  );

  // Send first batch immediately (batch_day = 0)
  const firstBatchStats = await sendBatch(blastId, 0);

  console.log(`[BLAST] Initialized blast ${blastId}: ${totalRecipients} recipients, ~${estimatedDays} days. First batch: ${firstBatchStats.sent} sent, ${firstBatchStats.failed} failed.`);

  return {
    blastId,
    totalRecipients,
    estimatedDays,
    dailyCapacity,
    firstBatch: firstBatchStats,
  };
}

// ===========================================
// SEND A SINGLE BATCH
// ===========================================

/**
 * Send all pending recipients for a specific batch_day
 */
async function sendBatch(blastId, batchDay) {
  const blast = (await db.query('SELECT * FROM marketing_blasts WHERE id = $1', [blastId])).rows[0];
  if (!blast) return { sent: 0, failed: 0 };

  const recipients = (await db.query(
    `SELECT * FROM blast_recipients
     WHERE blast_id = $1 AND batch_day = $2 AND status = 'pending'
     ORDER BY id`,
    [blastId, batchDay]
  )).rows;

  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const success = await sendViaProvider(recipient.provider, {
      to: recipient.email,
      subject: blast.subject,
      html: blast.message,
      text: blast.message?.replace(/<[^>]*>/g, '') || '',
    });

    if (success) {
      await db.query(
        `UPDATE blast_recipients SET status = 'sent', sent_at = NOW() WHERE id = $1`,
        [recipient.id]
      );
      sent++;
    } else {
      await db.query(
        `UPDATE blast_recipients SET status = 'failed', error_message = 'Provider send failed' WHERE id = $1`,
        [recipient.id]
      );
      failed++;
    }

    // Small delay between sends to avoid rate limits (100ms)
    await new Promise(r => setTimeout(r, 100));
  }

  // Update sent_count on blast
  await db.query(
    `UPDATE marketing_blasts SET sent_count = (
       SELECT COUNT(*) FROM blast_recipients WHERE blast_id = $1 AND status = 'sent'
     ) WHERE id = $1`,
    [blastId]
  );

  return { sent, failed };
}

// ===========================================
// DAILY SCHEDULED BLAST RUNNER
// ===========================================

/**
 * Process all active blasts — send next unsent batch for each.
 * Called daily at 9 AM ET via internal endpoint.
 */
export async function runScheduledBlasts() {
  const activeBlasts = (await db.query(
    "SELECT * FROM marketing_blasts WHERE status = 'sending'"
  )).rows;

  const results = {
    blastsProcessed: 0,
    totalSent: 0,
    totalFailed: 0,
    totalRemaining: 0,
    details: [],
  };

  for (const blast of activeBlasts) {
    // Find the next unsent batch_day
    const nextBatch = (await db.query(
      `SELECT DISTINCT batch_day FROM blast_recipients
       WHERE blast_id = $1 AND status = 'pending'
       ORDER BY batch_day ASC LIMIT 1`,
      [blast.id]
    )).rows;

    if (nextBatch.length === 0) {
      // All batches sent — mark blast as complete
      await db.query("UPDATE marketing_blasts SET status = 'sent' WHERE id = $1", [blast.id]);
      results.details.push({ blastId: blast.id, status: 'completed' });
      continue;
    }

    const batchDay = nextBatch[0].batch_day;
    const stats = await sendBatch(blast.id, batchDay);

    // Check remaining
    const remaining = (await db.query(
      `SELECT COUNT(*) FROM blast_recipients WHERE blast_id = $1 AND status = 'pending'`,
      [blast.id]
    )).rows[0].count;

    if (parseInt(remaining) === 0) {
      await db.query("UPDATE marketing_blasts SET status = 'sent' WHERE id = $1", [blast.id]);
    }

    results.blastsProcessed++;
    results.totalSent += stats.sent;
    results.totalFailed += stats.failed;
    results.totalRemaining += parseInt(remaining);
    results.details.push({
      blastId: blast.id,
      batchDay,
      sent: stats.sent,
      failed: stats.failed,
      remaining: parseInt(remaining),
    });
  }

  console.log(`[BLAST] Daily run complete: ${results.blastsProcessed} blasts, ${results.totalSent} sent, ${results.totalRemaining} remaining.`);
  return results;
}

// ===========================================
// BLAST STATUS / STATS
// ===========================================

/**
 * Get detailed blast status with provider breakdown
 */
export async function getBlastStatus(blastId) {
  const blast = (await db.query('SELECT * FROM marketing_blasts WHERE id = $1', [blastId])).rows[0];
  if (!blast) return null;

  // Provider breakdown
  const breakdown = (await db.query(
    `SELECT provider,
            COUNT(*) FILTER (WHERE status = 'sent') as sent,
            COUNT(*) FILTER (WHERE status = 'failed') as failed,
            COUNT(*) FILTER (WHERE status = 'pending') as pending
     FROM blast_recipients WHERE blast_id = $1
     GROUP BY provider`,
    [blastId]
  )).rows;

  const providerBreakdown = {};
  for (const row of breakdown) {
    providerBreakdown[row.provider] = {
      sent: parseInt(row.sent),
      failed: parseInt(row.failed),
      pending: parseInt(row.pending),
    };
  }

  const totalSent = Object.values(providerBreakdown).reduce((s, p) => s + p.sent, 0);
  const totalRemaining = Object.values(providerBreakdown).reduce((s, p) => s + p.pending, 0);
  const dailyCapacity = TOTAL_DAILY_CAPACITY;
  const estimatedDaysLeft = Math.ceil(totalRemaining / dailyCapacity);

  const startedAt = blast.started_at ? new Date(blast.started_at).toISOString().split('T')[0] : null;
  const estimatedCompletion = startedAt && estimatedDaysLeft > 0
    ? new Date(Date.now() + estimatedDaysLeft * 86400000).toISOString().split('T')[0]
    : startedAt;

  return {
    id: blast.id,
    subject: blast.subject,
    segment: blast.segment,
    totalRecipients: blast.recipient_count,
    sent: totalSent,
    remaining: totalRemaining,
    dailyCapacity,
    estimatedDaysLeft,
    startedAt,
    estimatedCompletion,
    providerBreakdown,
    status: blast.status,
  };
}

/**
 * Get all blasts with rich status data
 */
export async function getAllBlastStatuses() {
  const blasts = (await db.query(
    'SELECT id FROM marketing_blasts ORDER BY created_at DESC LIMIT 100'
  )).rows;

  const results = [];
  for (const { id } of blasts) {
    const status = await getBlastStatus(id);
    if (status) results.push(status);
  }
  return results;
}
