// ===========================================
// THE VIDEO POOL - Marketing Routes (Admin)
// ===========================================

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler, Errors } from '../middleware/errorHandler.js';
import db from '../db/index.js';
import { initializeBlast, runScheduledBlasts, getAllBlastStatuses } from '../services/blastDistributor.js';
import { TOTAL_DAILY_CAPACITY } from '../config/emailProviders.js';

const router = Router();

// Segment queries
const SEGMENT_CONDITIONS = {
  all: '1=1',
  subscribers: "membership_type IN ('starter','pro','elite')",
  free: "membership_type = 'free'",
  inactive: "last_login < NOW() - INTERVAL '30 days'",
};

// ===========================================
// ADMIN: Send email blast (saves to DB)
// ===========================================
router.post(
  '/admin/marketing/email',
  requireAuth,
  requireAdmin,
  [
    body('subject').trim().notEmpty(),
    body('htmlBody').optional(),
    body('textBody').optional(),
    body('segment').optional().isIn(['all', 'subscribers', 'free', 'inactive']),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw Errors.validation(errors.array());

    const { subject, htmlBody, textBody, segment } = req.body;
    const seg = segment || 'all';

    // Count recipients
    const condition = SEGMENT_CONDITIONS[seg] || '1=1';
    const countResult = await db.query(`SELECT COUNT(*) FROM users WHERE ${condition}`);
    const recipientCount = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `INSERT INTO marketing_blasts (type, subject, message, segment, recipient_count, status, created_by)
       VALUES ('email', $1, $2, $3, $4, 'scheduled', $5)
       RETURNING *`,
      [subject, htmlBody || textBody || '', seg, recipientCount, req.user.id]
    );

    const blast = result.rows[0];

    // Auto-initialize: generate recipients, assign providers, send first batch
    let blastInfo;
    try {
      blastInfo = await initializeBlast(blast.id);
    } catch (e) {
      console.error('[BLAST] Auto-init failed:', e.message);
      blastInfo = { totalRecipients: recipientCount, estimatedDays: Math.ceil(recipientCount / TOTAL_DAILY_CAPACITY), dailyCapacity: TOTAL_DAILY_CAPACITY };
    }

    res.status(201).json({
      success: true,
      blastId: blast.id,
      totalRecipients: blastInfo.totalRecipients,
      estimatedDays: blastInfo.estimatedDays,
      dailyCapacity: TOTAL_DAILY_CAPACITY,
      message: `Email blast created and sending started. ${blastInfo.totalRecipients} recipients, ~${blastInfo.estimatedDays} days at ${TOTAL_DAILY_CAPACITY}/day.`,
    });
  })
);

// ===========================================
// ADMIN: Send SMS blast (saves to DB)
// ===========================================
router.post(
  '/admin/marketing/sms',
  requireAuth,
  requireAdmin,
  [
    body('message').trim().isLength({ min: 1, max: 160 }).withMessage('SMS must be 1-160 characters'),
    body('segment').optional().isIn(['all', 'subscribers', 'free', 'inactive']),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw Errors.validation(errors.array());

    const { message, segment } = req.body;
    const seg = segment || 'all';

    // Count opted-in users in segment
    const condition = SEGMENT_CONDITIONS[seg] || '1=1';
    const countResult = await db.query(
      `SELECT COUNT(*) FROM users WHERE sms_opt_in = true AND phone IS NOT NULL AND ${condition}`
    );
    const recipientCount = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `INSERT INTO marketing_blasts (type, message, segment, recipient_count, status, created_by)
       VALUES ('sms', $1, $2, $3, 'draft', $4)
       RETURNING *`,
      [message, seg, recipientCount, req.user.id]
    );

    res.status(201).json({
      success: true,
      blast: result.rows[0],
      message: `SMS blast saved. ${recipientCount} opted-in recipients. Sending will be enabled when SMS provider is configured.`,
    });
  })
);

// ===========================================
// ADMIN: Marketing history
// ===========================================
router.get(
  '/admin/marketing/history',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const blasts = await getAllBlastStatuses();
    res.json({ success: true, blasts });
  })
);

// ===========================================
// INTERNAL: Daily blast runner (called by cron)
// ===========================================
router.post(
  '/internal/run-daily-blasts',
  asyncHandler(async (req, res) => {
    // Authenticate via INTERNAL_API_KEY
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    if (!process.env.INTERNAL_API_KEY || apiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const results = await runScheduledBlasts();
    res.json({ success: true, ...results });
  })
);

export default router;
