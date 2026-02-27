-- Migration 017: Facebook OAuth support
-- Adds facebook_id column to users table for Meta/Facebook login

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS users_facebook_id_idx
  ON users(facebook_id)
  WHERE facebook_id IS NOT NULL;

-- Required env vars after this migration:
-- Railway: FACEBOOK_APP_SECRET=<your-facebook-app-secret>
-- Vercel:  VITE_FACEBOOK_APP_ID=<your-facebook-app-id>
