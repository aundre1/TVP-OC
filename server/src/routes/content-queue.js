// ===========================================
// THE VIDEO POOL - Content Upload Queue Routes
// ===========================================

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler, Errors } from '../middleware/errorHandler.js';
import db from '../db/index.js';

const router = Router();

// Editor role check (Glenn or admin)
const requireEditor = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'editor') {
    return res.status(403).json({ success: false, error: 'Editor access required', code: 'EDITOR_REQUIRED' });
  }
  next();
};

// ===========================================
// EDITOR: Upload content to queue
// ===========================================
router.post(
  '/content/upload',
  requireAuth,
  requireEditor,
  [
    body('title').trim().isLength({ min: 1, max: 200 }),
    body('artist').trim().isLength({ min: 1, max: 200 }),
    body('genre').optional().trim(),
    body('fileUrl').optional().trim(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw Errors.validation(errors.array());

    const { title, artist, genre, fileUrl, metadata } = req.body;

    const result = await db.query(
      `INSERT INTO content_queue (uploaded_by, title, artist, genre, file_url, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, title, artist, genre || null, fileUrl || null, metadata || '{}']
    );

    res.status(201).json({ success: true, item: result.rows[0] });
  })
);

// ===========================================
// ADMIN: Get content queue
// ===========================================
router.get(
  '/admin/content/queue',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    let sql = 'SELECT cq.*, u.email as uploader_email FROM content_queue cq LEFT JOIN users u ON u.id = cq.uploaded_by';
    const params = [];

    if (status) {
      params.push(status);
      sql += ` WHERE cq.status = $1`;
    }

    sql += ' ORDER BY cq.created_at DESC';
    const result = await db.query(sql, params);
    res.json({ success: true, items: result.rows });
  })
);

// ===========================================
// ADMIN: Approve content
// ===========================================
router.patch(
  '/admin/content/queue/:id/approve',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await db.query(
      `UPDATE content_queue SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
       WHERE id = $2 AND status = 'pending' RETURNING *`,
      [req.user.id, req.params.id]
    );

    if (result.rows.length === 0) throw Errors.notFound('Content item');
    res.json({ success: true, item: result.rows[0] });
  })
);

// ===========================================
// ADMIN: Reject content
// ===========================================
router.patch(
  '/admin/content/queue/:id/reject',
  requireAuth,
  requireAdmin,
  [body('reason').trim().notEmpty()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw Errors.validation(errors.array());

    const result = await db.query(
      `UPDATE content_queue SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW(), rejection_reason = $2
       WHERE id = $3 AND status = 'pending' RETURNING *`,
      [req.user.id, req.body.reason, req.params.id]
    );

    if (result.rows.length === 0) throw Errors.notFound('Content item');
    res.json({ success: true, item: result.rows[0] });
  })
);

export default router;
