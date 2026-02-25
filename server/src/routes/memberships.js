// ===========================================
// THE VIDEO POOL - Memberships Routes
// Handles membership tiers, billing, and Stripe
// ===========================================

import { Router } from 'express';
import { query } from '../db/config.js';
import { requireAuth } from '../middleware/auth.js';
import { Errors, asyncHandler } from '../middleware/errorHandler.js';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// ===========================================
// GET /memberships - List all membership tiers
// ===========================================
router.get('/', asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT
      id, name, slug, price_monthly, price_annual,
      download_limit, features, is_popular, is_active,
      stripe_price_id_monthly, stripe_price_id_annual
    FROM memberships
    WHERE is_active = true
    ORDER BY price_monthly ASC NULLS FIRST
  `);

  const memberships = result.rows.map(m => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    priceMonthly: parseFloat(m.price_monthly) || 0,
    priceAnnual: parseFloat(m.price_annual) || 0,
    downloadLimit: m.download_limit,
    features: m.features || [],
    isPopular: m.is_popular,
    stripePriceIdMonthly: m.stripe_price_id_monthly,
    stripePriceIdAnnual: m.stripe_price_id_annual,
  }));

  res.json(memberships);
}));

// ===========================================
// GET /memberships/status - Current user's membership
// ===========================================
router.get('/status', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const userResult = await query(`
    SELECT
      u.membership_type, u.membership_status,
      u.download_limit, u.downloads_used,
      u.download_limit_reset_date, u.bonus_credits,
      u.stripe_subscription_id,
      m.name as membership_name, m.features
    FROM users u
    LEFT JOIN memberships m ON m.slug = u.membership_type
    WHERE u.id = $1
  `, [userId]);

  if (userResult.rows.length === 0) {
    throw Errors.notFound('User not found');
  }

  const user = userResult.rows[0];

  // Calculate remaining downloads
  const downloadsRemaining = user.download_limit
    ? Math.max(0, user.download_limit - user.downloads_used)
    : null; // null means unlimited

  res.json({
    membershipType: user.membership_type,
    membershipName: user.membership_name,
    membershipStatus: user.membership_status,
    downloadLimit: user.download_limit,
    downloadsUsed: user.downloads_used,
    downloadsRemaining,
    bonusCredits: user.bonus_credits || 0,
    resetDate: user.download_limit_reset_date,
    features: user.features || [],
    hasActiveSubscription: !!user.stripe_subscription_id,
  });
}));

// ===========================================
// GET /memberships/can-download - Check download ability
// ===========================================
router.get('/can-download', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(`
    SELECT
      download_limit, downloads_used, bonus_credits,
      membership_type, download_limit_reset_date
    FROM users WHERE id = $1
  `, [userId]);

  if (result.rows.length === 0) {
    throw Errors.notFound('User not found');
  }

  const user = result.rows[0];

  // Unlimited downloads (Pro/Lifetime)
  if (user.download_limit === null) {
    return res.json({
      canDownload: true,
      downloadsRemaining: null,
      isUnlimited: true,
      bonusCredits: user.bonus_credits || 0,
      tier: user.membership_type,
    });
  }

  const remaining = Math.max(0, user.download_limit - user.downloads_used);
  const canDownload = remaining > 0 || (user.bonus_credits || 0) > 0;

  res.json({
    canDownload,
    downloadsRemaining: remaining,
    isUnlimited: false,
    downloadLimit: user.download_limit,
    bonusCredits: user.bonus_credits || 0,
    resetDate: user.download_limit_reset_date,
    tier: user.membership_type,
  });
}));

// ===========================================
// POST /memberships/create-checkout - Stripe checkout session
// ===========================================
router.post('/create-checkout', requireAuth, asyncHandler(async (req, res) => {
  if (!stripe) {
    throw Errors.internal('Payment processing not configured');
  }

  const { priceId, successUrl, cancelUrl } = req.body;
  const userId = req.user.id;

  if (!priceId) {
    throw Errors.badRequest('Price ID is required');
  }

  // Get or create Stripe customer
  const userResult = await query(
    'SELECT email, stripe_customer_id FROM users WHERE id = $1',
    [userId]
  );

  let customerId = userResult.rows[0]?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userResult.rows[0].email,
      metadata: { userId: userId.toString() },
    });

    customerId = customer.id;
    await query(
      'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
      [customerId, userId]
    );
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl || `${process.env.FRONTEND_URL}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/membership`,
    metadata: { userId: userId.toString() },
  });

  res.json({
    checkoutUrl: session.url,
    sessionId: session.id,
  });
}));

// ===========================================
// POST /memberships/portal - Stripe customer portal
// ===========================================
router.post('/portal', requireAuth, asyncHandler(async (req, res) => {
  if (!stripe) {
    throw Errors.internal('Payment processing not configured');
  }

  const userId = req.user.id;

  const result = await query(
    'SELECT stripe_customer_id FROM users WHERE id = $1',
    [userId]
  );

  const customerId = result.rows[0]?.stripe_customer_id;

  if (!customerId) {
    throw Errors.badRequest('No billing account found. Please subscribe first.');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.FRONTEND_URL}/settings`,
  });

  res.json({ url: session.url });
}));

// ===========================================
// GET /memberships/billing-history - Invoice history
// ===========================================
router.get('/billing-history', requireAuth, asyncHandler(async (req, res) => {
  if (!stripe) {
    return res.json({ invoices: [] });
  }

  const userId = req.user.id;

  const result = await query(
    'SELECT stripe_customer_id FROM users WHERE id = $1',
    [userId]
  );

  const customerId = result.rows[0]?.stripe_customer_id;

  if (!customerId) {
    return res.json({ invoices: [] });
  }

  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit: 12,
  });

  res.json({
    invoices: invoices.data.map(inv => ({
      id: inv.id,
      date: new Date(inv.created * 1000).toISOString(),
      amount: inv.amount_paid / 100,
      currency: inv.currency.toUpperCase(),
      status: inv.status,
      description: inv.lines.data[0]?.description || 'Subscription',
      invoicePdf: inv.invoice_pdf,
    })),
  });
}));

// ===========================================
// POST /memberships/start-trial - Start 7-day free trial
// ===========================================
router.post('/start-trial', requireAuth, asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const userId = req.user.id;

  if (!['pro', 'elite'].includes(plan)) {
    throw Errors.badRequest('Free trial is only available for Pro and Elite plans');
  }

  // Check if user already had a trial
  const existing = await query(
    'SELECT trial_ends_at FROM users WHERE id = $1',
    [userId]
  );

  if (existing.rows[0]?.trial_ends_at) {
    throw Errors.badRequest('You have already used your free trial');
  }

  // Set trial
  const trialEnds = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await query(
    `UPDATE users SET
      trial_ends_at = $1,
      trial_plan = $2,
      membership_type = $2,
      membership_status = 'trial'
     WHERE id = $3`,
    [trialEnds, plan, userId]
  );

  res.json({
    success: true,
    trialPlan: plan,
    trialEndsAt: trialEnds.toISOString(),
    message: `Your 7-day ${plan} trial has started!`,
  });
}));

// ===========================================
// GET /memberships/trial-status - Check trial status
// ===========================================
router.get('/trial-status', requireAuth, asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT trial_ends_at, trial_plan, membership_type FROM users WHERE id = $1',
    [req.user.id]
  );

  const user = result.rows[0];
  if (!user?.trial_ends_at) {
    return res.json({ onTrial: false });
  }

  const now = new Date();
  const trialEnds = new Date(user.trial_ends_at);
  const daysRemaining = Math.max(0, Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24)));
  const expired = now >= trialEnds;

  res.json({
    onTrial: !expired,
    trialPlan: user.trial_plan,
    trialEndsAt: user.trial_ends_at,
    daysRemaining,
    expired,
  });
}));

export default router;
