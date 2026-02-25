// ===========================================
// THE VIDEO POOL - Support / Ticket Routes
// ===========================================

import { Router } from 'express';
import { body, query as queryValidator, validationResult } from 'express-validator';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler, Errors } from '../middleware/errorHandler.js';
import { sendEmail, sendSupportTicketNotification, sendSupportResponseEmail, sendSongRequestEmail } from '../services/emailService.js';
import db from '../db/index.js';

const router = Router();

// Auto-assign based on category
const ASSIGNEE_MAP = {
  song_request: 'glenn',
  bug: 'admin',
  billing: 'admin',
  other: 'admin',
};

// ===========================================
// AUTH: Create ticket
// ===========================================
router.post(
  '/support/tickets',
  requireAuth,
  [
    body('category').isIn(['bug', 'song_request', 'billing', 'other']),
    body('subject').trim().isLength({ min: 1, max: 200 }),
    body('message').trim().isLength({ min: 1 }),
    body('priority').optional().isIn(['low', 'normal', 'urgent']),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw Errors.validation(errors.array());

    const { category, subject, message, priority } = req.body;
    const assignee = ASSIGNEE_MAP[category] || 'admin';

    const result = await db.query(
      `INSERT INTO support_tickets (user_id, category, subject, message, priority, assignee)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, category, subject, message, priority || 'normal', assignee]
    );

    // Send notification emails
    try {
      const ticket = result.rows[0];
      const user = { email: req.user.email, name: req.user.name, membership_type: req.user.membership_type };

      if (category === 'song_request') {
        await sendSongRequestEmail({ ...ticket, artist: req.body.artist, title: req.body.title }, user);
      } else {
        await sendSupportTicketNotification(ticket, user);
      }
    } catch (e) {
      console.warn('[SUPPORT] Failed to send notification email:', e.message);
    }

    res.status(201).json({ success: true, ticket: result.rows[0] });
  })
);

// ===========================================
// AUTH: Get user's own tickets
// ===========================================
router.get(
  '/support/tickets',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await db.query(
      `SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, tickets: result.rows });
  })
);

// ===========================================
// ADMIN: Get all tickets (filterable)
// ===========================================
router.get(
  '/admin/support/tickets',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { category, status, assignee } = req.query;
    let sql = 'SELECT st.*, u.email as user_email FROM support_tickets st LEFT JOIN users u ON u.id = st.user_id WHERE 1=1';
    const params = [];

    if (category) {
      params.push(category);
      sql += ` AND st.category = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND st.status = $${params.length}`;
    }
    if (assignee) {
      params.push(assignee);
      sql += ` AND st.assignee = $${params.length}`;
    }

    sql += ' ORDER BY st.created_at DESC';

    const result = await db.query(sql, params);
    res.json({ success: true, tickets: result.rows });
  })
);

// ===========================================
// ADMIN: Update ticket
// ===========================================
router.patch(
  '/admin/support/tickets/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status, admin_response, assignee } = req.body;
    const sets = [];
    const params = [];

    if (status) {
      params.push(status);
      sets.push(`status = $${params.length}`);
      if (status === 'resolved' || status === 'closed') {
        sets.push('resolved_at = NOW()');
      }
    }
    if (admin_response !== undefined) {
      params.push(admin_response);
      sets.push(`admin_response = $${params.length}`);
    }
    if (assignee !== undefined) {
      params.push(assignee);
      sets.push(`assignee = $${params.length}`);
    }

    if (sets.length === 0) throw Errors.badRequest('No fields to update');

    sets.push('updated_at = NOW()');
    params.push(req.params.id);

    const result = await db.query(
      `UPDATE support_tickets SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );

    if (result.rows.length === 0) throw Errors.notFound('Ticket');

    // Send email to user when admin responds
    if (admin_response) {
      try {
        const ticket = result.rows[0];
        const userResult = await db.query('SELECT email FROM users WHERE id = $1', [ticket.user_id]);
        if (userResult.rows.length > 0) {
          await sendSupportResponseEmail(userResult.rows[0].email, ticket.subject, admin_response, ticket.id);
        }
      } catch (e) {
        console.warn('[SUPPORT] Failed to send response email:', e.message);
      }
    }

    res.json({ success: true, ticket: result.rows[0] });
  })
);

export default router;
