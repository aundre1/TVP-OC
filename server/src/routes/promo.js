import express from 'express';
const router = express.Router();

// Promo inventory tracking (300 total: 100 per plan)
// In production, use database or Redis. For now, use environment or memory
const PROMO_INVENTORY = {
  monthly: parseInt(process.env.PROMO_MONTHLY_SPOTS || '100'),
  quarterly: parseInt(process.env.PROMO_QUARTERLY_SPOTS || '100'),
  annual: parseInt(process.env.PROMO_ANNUAL_SPOTS || '100'),
};

// Stripe checkout URLs
const STRIPE_CHECKOUT = {
  monthly: 'https://checkout.stripe.com/c/pay/cs_live_a1TdyZALT7qlC3VkQLdeLFkSOR4pfqpD2a3XBCdafVN8F9t0OMzXNmOH1f#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blppbHNgWlR%2FdUF9VVxjZEBANWxmMUhJN2NwUTRwMScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',
  quarterly: 'https://checkout.stripe.com/c/pay/cs_live_a1r42vbLs5l6XLjfVawy5FemPuS8V1OwGVFrlzDETi2aXuBknzd5x42Yjn#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blppbHNgWlR%2FdUF9VVxjZEBANWxmMUhJN2NwUTRwMScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',
  annual: 'https://checkout.stripe.com/c/pay/cs_live_a13MeJ7uPE7VbDv8LAamTh5Y6UwxgGfmD3tZJrqwhKw1uSim0cjTf7eGSs#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blppbHNgWlR%2FdUF9VVxjZEBANWxmMUhJN2NwUTRwMScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',
};

// Regular pricing URLs (fallback when promo sold out)
const REGULAR_PRICING = {
  monthly: 'https://www.thevideopool.com/pricing#monthly',
  quarterly: 'https://www.thevideopool.com/pricing#quarterly',
  annual: 'https://www.thevideopool.com/pricing#annual',
};

/**
 * GET /promo/:plan
 * Redirects to Stripe checkout if spots available
 * Shows promotion ended page + redirects to regular pricing if sold out
 */
router.get('/:plan', (req, res) => {
  const plan = req.params.plan.toLowerCase();

  // Validate plan
  if (!['monthly', 'quarterly', 'annual'].includes(plan)) {
    return res.status(404).json({ error: 'Invalid plan' });
  }

  // Check inventory
  const spotsRemaining = PROMO_INVENTORY[plan];

  if (spotsRemaining > 0) {
    // Spots available - decrement and redirect to Stripe
    PROMO_INVENTORY[plan]--;
    console.log(`✅ Promo ${plan}: ${spotsRemaining - 1} spots remaining`);
    return res.redirect(STRIPE_CHECKOUT[plan]);
  }

  // Spots sold out - show promotion ended page
  console.log(`❌ Promo ${plan} SOLD OUT - redirecting to regular pricing`);

  const promoEndedHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Promotion Ended</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a24 100%);
          color: #fff;
          margin: 0;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .container {
          text-align: center;
          max-width: 500px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 212, 255, 0.1);
          border-radius: 14px;
          padding: 40px 30px;
          backdrop-filter: blur(10px);
        }
        h1 {
          font-size: 32px;
          margin: 20px 0 10px;
          background: linear-gradient(135deg, #ff4757 0%, #ff7675 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p {
          font-size: 16px;
          color: #a1a1aa;
          margin: 15px 0;
          line-height: 1.6;
        }
        .emoji { font-size: 48px; margin: 20px 0; }
        a {
          display: inline-block;
          background: #00d4ff;
          color: #0a0a0f;
          padding: 12px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 20px;
          transition: all 0.3s ease;
        }
        a:hover {
          background: #00e6ff;
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">🎉</div>
        <h1>Promotion Ended</h1>
        <p>Unfortunately, the 30% off offer for the <strong>${plan}</strong> plan has been claimed.</p>
        <p>You're one of the first 300 DJs to hear about this — but this exclusive offer is now sold out.</p>
        <p>Check out our regular pricing below:</p>
        <a href="${REGULAR_PRICING[plan]}">View Pricing</a>
      </div>
      <script>
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          window.location.href = '${REGULAR_PRICING[plan]}';
        }, 3000);
      </script>
    </body>
    </html>
  `;

  res.set('Content-Type', 'text/html');
  res.send(promoEndedHTML);
});

/**
 * GET /promo/status
 * Admin endpoint to check remaining inventory
 */
router.get('/status/inventory', (req, res) => {
  const total = Object.values(PROMO_INVENTORY).reduce((a, b) => a + b, 0);
  res.json({
    monthly: PROMO_INVENTORY.monthly,
    quarterly: PROMO_INVENTORY.quarterly,
    annual: PROMO_INVENTORY.annual,
    total,
    message: `${total} spots remaining out of 300`,
  });
});

export default router;
