// ===========================================
// THE VIDEO POOL - Support / Ticket Routes
// ===========================================

import { Router } from 'express';
import { body, query as queryValidator, validationResult } from 'express-validator';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler, Errors } from '../middleware/errorHandler.js';
import { sendEmail } from '../services/emailService.js';
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

    // Send notification email to info@thevideopool.com
    try {
      await sendEmail({
        to: 'info@thevideopool.com',
        subject: `[TVP Support] New ${category} ticket: ${subject}`,
        text: `New support ticket from user ${req.user.email}\n\nCategory: ${category}\nPriority: ${priority || 'normal'}\nAssigned to: ${assignee}\n\n${message}`,
        html: `<h3>New Support Ticket</h3>
          <p><strong>From:</strong> ${req.user.email}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Priority:</strong> ${priority || 'normal'}</p>
          <p><strong>Assigned to:</strong> ${assignee}</p>
          <hr/>
          <p>${message}</p>`,
      });
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
    res.json({ success: true, ticket: result.rows[0] });
  })
);

export default router;
