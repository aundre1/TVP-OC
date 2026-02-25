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
// Known price IDs — sourced from env vars.
// Used to validate priceId before sending to Stripe.
// ===========================================
function getKnownPriceIds() {
  return [
    process.env.STRIPE_PRICE_STARTER_MONTHLY,
    process.env.STRIPE_PRICE_PRO_QUARTERLY,
    process.env.STRIPE_PRICE_ELITE_ANNUAL,
    process.env.STRIPE_PRICE_FREEMIUM,
  ].filter(Boolean); // Remove undefined/empty entries
}

// Map tier slug + interval to the correct price ID env var.
// Accepts: { tier: 'starter'|'pro'|'elite'|'free', interval: 'monthly'|'quarterly'|'annual' }
function resolvePriceId(tier, interval) {
  const key = tier?.toLowerCase() + '_' + interval?.toLowerCase();
  const map = {
    starter_monthly:  process.env.STRIPE_PRICE_STARTER_MONTHLY,
    pro_quarterly:    process.env.STRIPE_PRICE_PRO_QUARTERLY,
    elite_annual:     process.env.STRIPE_PRICE_ELITE_ANNUAL,
    free_freemium:    process.env.STRIPE_PRICE_FREEMIUM,
    // Legacy interval aliases
    starter_month:    process.env.STRIPE_PRICE_STARTER_MONTHLY,
    pro_quarter:      process.env.STRIPE_PRICE_PRO_QUARTERLY,
    elite_year:       process.env.STRIPE_PRICE_ELITE_ANNUAL,
    elite_annual_:    process.env.STRIPE_PRICE_ELITE_ANNUAL,
  };
  return map[key] || null;
}

// ===========================================
// GET /memberships - List all membership tiers
// ===========================================
router.get('/', asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT
      id, name, slug, price_monthly, price_annual,
      monthly_download_limit AS download_limit,
      features,
      is_featured AS is_popular,
      stripe_price_monthly AS stripe_price_id_monthly,
      stripe_price_annual AS stripe_price_id_annual
    FROM memberships
    ORDER BY display_order ASC
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
      u.membership_type,
      u.status AS membership_status,
      m.monthly_download_limit AS download_limit,
      u.downloads_this_month AS downloads_used,
      u.downloads_reset_monthly AS download_limit_reset_date,
      0 AS bonus_credits,
      u.stripe_subscription_id,
      m.name AS membership_name, m.features
    FROM users u
    LEFT JOIN memberships m ON m.slug = u.membership_type::text
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
      m.monthly_download_limit AS download_limit,
      u.downloads_this_month AS downloads_used,
      0 AS bonus_credits,
      u.membership_type,
      u.downloads_reset_monthly AS download_limit_reset_date
    FROM users u
    LEFT JOIN memberships m ON m.slug = u.membership_type::text
    WHERE u.id = $1
  `, [userId]);

  if (result.rows.length === 0) {
    throw Errors.notFound('User not found');
  }

  const user = result.rows[0];

  // Unlimited downloads (Pro/Elite/Lifetime)
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
//
// Accepts ONE of:
//   { priceId: 'price_xxx' }              — raw Stripe price ID (validated against known IDs)
//   { tier: 'starter', interval: 'monthly' } — resolved to env var price ID
//   { membershipId: 2, interval: 'month' }   — legacy: looks up DB then resolves
// ===========================================
router.post('/create-checkout', requireAuth, asyncHandler(async (req, res) => {
  if (!stripe) {
    throw Errors.internal('Payment processing not configured');
  }

  const { priceId: rawPriceId, tier, interval, membershipId, successUrl, cancelUrl } = req.body;
  const userId = req.user.id;

  let resolvedPriceId = rawPriceId;

  // If caller sent tier+interval, resolve to a price ID
  if (!resolvedPriceId && tier && interval) {
    resolvedPriceId = resolvePriceId(tier, interval);
    if (!resolvedPriceId) {
      throw Errors.badRequest(`No price configured for tier="${tier}" interval="${interval}"`);
    }
  }

  // Legacy: membershipId + interval — look up tier slug in DB then resolve
  if (!resolvedPriceId && membershipId) {
    const membershipResult = await query(
      'SELECT slug, stripe_price_monthly, stripe_price_annual FROM memberships WHERE id = $1',
      [membershipId]
    );
    if (membershipResult.rows.length === 0) {
      throw Errors.badRequest('Membership not found');
    }
    const m = membershipResult.rows[0];
    // Prefer the DB-stored price ID; fall back to env var resolution
    const dbPriceId = (interval === 'year' || interval === 'annual')
      ? m.stripe_price_annual
      : m.stripe_price_monthly;
    resolvedPriceId = dbPriceId || resolvePriceId(m.slug, interval);
    if (!resolvedPriceId) {
      throw Errors.badRequest(`No Stripe price configured for membership ${membershipId}`);
    }
  }

  if (!resolvedPriceId) {
    throw Errors.badRequest('A priceId, or tier+interval, or membershipId is required');
  }

  // Validate the resolved price ID against our known set
  const knownPriceIds = getKnownPriceIds();
  if (knownPriceIds.length > 0 && !knownPriceIds.includes(resolvedPriceId)) {
    console.warn(`[CHECKOUT] Price ID "${resolvedPriceId}" not in known set. Proceeding anyway.`);
    // We warn but do NOT block — Stripe will reject invalid IDs on its end
  }

  // Get or create Stripe customer
  const userResult = await query(
    'SELECT email, stripe_customer_id FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw Errors.notFound('User not found');
  }

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

  // Build URLs — always fall back to FRONTEND_URL (Vercel)
  const frontendUrl = process.env.FRONTEND_URL || 'https://tvp-redesign-2026.vercel.app';
  const finalSuccessUrl = successUrl || `${frontendUrl}/membership/success?session_id={CHECKOUT_SESSION_ID}`;
  const finalCancelUrl  = cancelUrl  || `${frontendUrl}/membership`;

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: resolvedPriceId, quantity: 1 }],
    mode: 'subscription',
    success_url: finalSuccessUrl,
    cancel_url: finalCancelUrl,
    metadata: { userId: userId.toString() },
  });

  console.log(`[CHECKOUT] Created session for user ${userId}, price ${resolvedPriceId}`);

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

  const frontendUrl = process.env.FRONTEND_URL || 'https://tvp-redesign-2026.vercel.app';

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${frontendUrl}/settings`,
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
      status = 'trial'
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
