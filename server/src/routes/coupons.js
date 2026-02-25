// ===========================================
// THE VIDEO POOL - Coupon Routes
// ===========================================

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler, Errors } from '../middleware/errorHandler.js';
import db from '../db/index.js';

const router = Router();

// ===========================================
// ADMIN: Create coupon
// ===========================================
router.post(
  '/admin/coupons',
  requireAuth,
  requireAdmin,
  [
    body('code').trim().notEmpty().withMessage('Coupon code is required'),
    body('type').isIn(['percent', 'fixed', 'trial_days']).withMessage('Invalid coupon type'),
    body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw Errors.validation(errors.array());

    const { code, type, value, maxUses, expiresAt, applicablePlans } = req.body;

    const result = await db.query(
      `INSERT INTO coupons (code, type, value, max_uses, expires_at, applicable_plans, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [code.toUpperCase(), type, value, maxUses || null, expiresAt || null, applicablePlans || '{}', req.user.id]
    );

    res.status(201).json({ success: true, coupon: result.rows[0] });
  })
);

// ===========================================
// ADMIN: List all coupons
// ===========================================
router.get(
  '/admin/coupons',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await db.query(
      `SELECT c.*, COUNT(cr.id) as total_redemptions
       FROM coupons c
       LEFT JOIN coupon_redemptions cr ON cr.coupon_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    );
    res.json({ success: true, coupons: result.rows });
  })
);

// ===========================================
// ADMIN: Delete coupon
// ===========================================
router.delete(
  '/admin/coupons/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await db.query('DELETE FROM coupon_redemptions WHERE coupon_id = $1', [req.params.id]);
    const result = await db.query('DELETE FROM coupons WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) throw Errors.notFound('Coupon');
    res.json({ success: true, message: 'Coupon deleted' });
  })
);

// ===========================================
// PUBLIC: Validate coupon
// ===========================================
router.post(
  '/coupons/validate',
  [body('code').trim().notEmpty()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw Errors.validation(errors.array());

    const { code } = req.body;
    const result = await db.query(
      `SELECT * FROM coupons WHERE UPPER(code) = $1 AND is_active = true`,
      [code.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, valid: false, message: 'Invalid coupon code' });
    }

    const coupon = result.rows[0];

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.json({ success: true, valid: false, message: 'Coupon has expired' });
    }

    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return res.json({ success: true, valid: false, message: 'Coupon usage limit reached' });
    }

    const description =
      coupon.type === 'percent' ? `${coupon.value}% off` :
      coupon.type === 'fixed' ? `$${coupon.value} off` :
      `${coupon.value} day free trial`;

    res.json({
      success: true,
      valid: true,
      discount: coupon.value,
      type: coupon.type,
      description,
      applicablePlans: coupon.applicable_plans,
    });
  })
);

// ===========================================
// AUTH: Apply coupon
// ===========================================
router.post(
  '/coupons/apply',
  requireAuth,
  [
    body('code').trim().notEmpty(),
    body('planId').trim().notEmpty(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw Errors.validation(errors.array());

    const { code, planId } = req.body;

    const couponResult = await db.query(
      `SELECT * FROM coupons WHERE UPPER(code) = $1 AND is_active = true`,
      [code.toUpperCase()]
    );

    if (couponResult.rows.length === 0) {
      throw Errors.badRequest('Invalid coupon code');
    }

    const coupon = couponResult.rows[0];

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      throw Errors.badRequest('Coupon has expired');
    }

    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      throw Errors.badRequest('Coupon usage limit reached');
    }

    if (coupon.applicable_plans.length > 0 && !coupon.applicable_plans.includes(planId)) {
      throw Errors.badRequest('Coupon not applicable to this plan');
    }

    // Check if user already redeemed this coupon
    const existingRedemption = await db.query(
      'SELECT id FROM coupon_redemptions WHERE coupon_id = $1 AND user_id = $2',
      [coupon.id, req.user.id]
    );

    if (existingRedemption.rows.length > 0) {
      throw Errors.badRequest('You have already used this coupon');
    }

    // Record redemption and increment usage
    await db.query(
      `INSERT INTO coupon_redemptions (coupon_id, user_id, plan_id, discount_amount)
       VALUES ($1, $2, $3, $4)`,
      [coupon.id, req.user.id, planId, coupon.value]
    );

    await db.query(
      'UPDATE coupons SET current_uses = current_uses + 1 WHERE id = $1',
      [coupon.id]
    );

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      discount: coupon.value,
      type: coupon.type,
    });
  })
);

export default router;
