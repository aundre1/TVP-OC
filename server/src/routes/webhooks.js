// ===========================================
// THE VIDEO POOL - Webhook Routes
// Handles Stripe webhooks and other external events
// ===========================================

import { Router } from 'express';
import { query } from '../db/config.js';
import Stripe from 'stripe';
import { handleFailedPayment } from '../services/dunningService.js';

const router = Router();

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// ===========================================
// POST /webhooks/stripe - Stripe webhook handler
// ===========================================
router.post('/stripe', async (req, res) => {
  if (!stripe) {
    console.warn('Stripe not configured, ignoring webhook');
    return res.status(200).json({ received: true });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // req.body is raw buffer because of express.raw() middleware
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Error handling webhook ${event.type}:`, error);
    res.status(500).json({ error: 'Webhook handler error' });
  }
});

// ===========================================
// Price ID → Membership mapping helper
// Reads all 4 price IDs from env vars and returns
// the correct tier name + download limit for a given priceId.
// ===========================================
function getMembershipFromPriceId(priceId) {
  const priceMap = {
    [process.env.STRIPE_PRICE_STARTER_MONTHLY]: {
      membershipType: 'starter',
      downloadLimit: 200,
    },
    [process.env.STRIPE_PRICE_PRO_QUARTERLY]: {
      membershipType: 'pro',
      downloadLimit: 250,
    },
    [process.env.STRIPE_PRICE_ELITE_ANNUAL]: {
      membershipType: 'elite',
      downloadLimit: 300,
    },
    [process.env.STRIPE_PRICE_FREEMIUM]: {
      membershipType: 'free',
      downloadLimit: 1,
    },
  };

  // Remove entries where env var was undefined (key = "undefined")
  delete priceMap['undefined'];
  delete priceMap[undefined];

  const match = priceMap[priceId];
  if (match) {
    return match;
  }

  // Unknown price ID — default to starter with 100 downloads
  console.warn(`[WEBHOOK] Unknown price ID: ${priceId}, defaulting to starter`);
  return { membershipType: 'starter', downloadLimit: 100 };
}

// ===========================================
// Webhook Handlers
// ===========================================

async function handleCheckoutComplete(session) {
  const userId = session.metadata?.userId;
  const customerId = session.customer;

  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  // Update user's Stripe customer ID
  await query(
    'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
    [customerId, userId]
  );

  // If it's a one-time payment (lifetime/freemium), update membership directly
  // Subscriptions are handled by the subscription webhook
  if (session.mode === 'payment') {
    await query(`
      UPDATE users SET
        membership_type = 'elite',
        membership_status = 'active',
        download_limit = NULL,
        updated_at = NOW()
      WHERE id = $1
    `, [userId]);

    console.log(`User ${userId} upgraded to Lifetime/Elite membership`);
  }
}

async function handleSubscriptionUpdate(subscription) {
  const customerId = subscription.customer;

  // Get user by Stripe customer ID
  const userResult = await query(
    'SELECT id FROM users WHERE stripe_customer_id = $1',
    [customerId]
  );

  if (userResult.rows.length === 0) {
    console.error(`No user found for customer ${customerId}`);
    return;
  }

  const userId = userResult.rows[0].id;

  // Determine membership type from price ID
  const priceId = subscription.items.data[0]?.price?.id;
  const { membershipType, downloadLimit } = getMembershipFromPriceId(priceId);

  // Map subscription status
  let membershipStatus = 'active';
  if (subscription.status === 'past_due') {
    membershipStatus = 'active'; // Still give access during grace period
  } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    membershipStatus = 'cancelled';
  } else if (subscription.status === 'trialing') {
    membershipStatus = 'active';
  }

  await query(`
    UPDATE users SET
      membership_type = $1,
      membership_status = $2,
      download_limit = $3,
      stripe_subscription_id = $4,
      updated_at = NOW()
    WHERE id = $5
  `, [membershipType, membershipStatus, downloadLimit, subscription.id, userId]);

  console.log(`User ${userId} subscription updated to ${membershipType} (${membershipStatus}) via price ${priceId}`);
}

async function handleSubscriptionCancelled(subscription) {
  const customerId = subscription.customer;

  const userResult = await query(
    'SELECT id FROM users WHERE stripe_customer_id = $1',
    [customerId]
  );

  if (userResult.rows.length === 0) {
    return;
  }

  const userId = userResult.rows[0].id;

  // Downgrade to free tier
  await query(`
    UPDATE users SET
      membership_type = 'free',
      membership_status = 'cancelled',
      download_limit = 10,
      stripe_subscription_id = NULL,
      updated_at = NOW()
    WHERE id = $1
  `, [userId]);

  console.log(`User ${userId} subscription cancelled, downgraded to Free`);
}

async function handlePaymentSucceeded(invoice) {
  const customerId = invoice.customer;

  // Log successful payment
  console.log(`Payment succeeded for customer ${customerId}: $${invoice.amount_paid / 100}`);

  // Reset download count on subscription renewal
  if (invoice.billing_reason === 'subscription_cycle') {
    const userResult = await query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [customerId]
    );

    if (userResult.rows.length > 0) {
      await query(`
        UPDATE users SET
          downloads_used = 0,
          download_limit_reset_date = NOW() + INTERVAL '1 month'
        WHERE id = $1
      `, [userResult.rows[0].id]);
    }
  }
}

async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;

  // Get user
  const userResult = await query(
    'SELECT id, email FROM users WHERE stripe_customer_id = $1',
    [customerId]
  );

  if (userResult.rows.length === 0) {
    return;
  }

  const user = userResult.rows[0];

  // Log failed payment and trigger dunning
  console.log(`Payment failed for user ${user.id} (${user.email})`);

  try {
    await handleFailedPayment(user.id, invoice.id);
  } catch (e) {
    console.error('[DUNNING] Error triggering dunning:', e.message);
  }
}

export default router;
