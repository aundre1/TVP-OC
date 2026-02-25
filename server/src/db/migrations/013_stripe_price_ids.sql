-- ===========================================
-- Migration 013: Update memberships with real Stripe price IDs
-- Replaces placeholder values ('price_starter_monthly' etc.) with
-- the actual Stripe price/schedule IDs set in Railway env vars.
-- Also sets annual price values for Starter and Pro.
-- ===========================================

UPDATE memberships SET
  stripe_price_monthly = 's2_ca2738deb60b058a12d8fcd77ac4a6e9',
  stripe_price_annual  = NULL,
  price_annual         = 0
WHERE slug = 'starter';

UPDATE memberships SET
  stripe_price_monthly = 's2_59282b1c818949d8529a63bba9bf10f8',
  stripe_price_annual  = NULL,
  price_annual         = 0
WHERE slug = 'pro';

UPDATE memberships SET
  stripe_price_monthly = NULL,
  stripe_price_annual  = 's2_3fa73632a345d05262b57252a883fbee',
  price_annual         = 360
WHERE slug = 'elite';

UPDATE memberships SET
  stripe_price_monthly = 'price_1SkCTX2xxXTR95tlX49TIN8n',
  stripe_price_annual  = NULL
WHERE slug = 'free';
