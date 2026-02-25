// ===========================================
// THE VIDEO POOL - Marketing Routes (Admin)
// ===========================================

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler, Errors } from '../middleware/errorHandler.js';
import db from '../db/index.js';

const router = Router();

// Segment queries
const SEGMENT_CONDITIONS = {
  all: '1=1',
  subscribers: "membership_type IN ('basic','pro','lifetime')",
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
       VALUES ('email', $1, $2, $3, $4, 'draft', $5)
       RETURNING *`,
      [subject, htmlBody || textBody || '', seg, recipientCount, req.user.id]
    );

    res.status(201).json({
      success: true,
      blast: result.rows[0],
      message: `Email blast saved. ${recipientCount} recipients in "${seg}" segment. Sending will be enabled when email provider is configured.`,
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
    const result = await db.query(
      'SELECT * FROM marketing_blasts ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ success: true, blasts: result.rows });
  })
);

export default router;
