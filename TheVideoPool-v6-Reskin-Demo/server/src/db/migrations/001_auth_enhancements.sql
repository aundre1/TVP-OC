-- ===========================================
-- THE VIDEO POOL - Auth Enhancements Migration
-- Adds columns and tables needed for full auth system
-- ===========================================

-- ===========================================
-- ADD MISSING COLUMNS TO USERS TABLE
-- ===========================================

-- Email verification (inline storage for simplicity)
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP WITH TIME ZONE;

-- Password reset (inline storage)
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;

-- 2FA enhancements
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_temp_secret VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes TEXT[];

-- Last login tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_verification_code ON users(verification_code);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- ===========================================
-- CREATE SESSIONS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(100) NOT NULL UNIQUE,
  refresh_token_hash VARCHAR(255) NOT NULL,

  -- Session metadata
  user_agent TEXT,
  ip_address VARCHAR(45),  -- IPv6 compatible

  -- Activity tracking
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Revocation
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_reason VARCHAR(100)
);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token_hash);

-- ===========================================
-- UPDATE EXISTING MEMBERSHIP_TYPE ENUM
-- ===========================================
-- Add 'monthly' and 'annual' and 'none' if not exists
-- Note: PostgreSQL doesn't support IF NOT EXISTS for enum values,
-- so we check and add conditionally

DO $$
BEGIN
  -- Add 'none' if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'none' AND enumtypid = 'membership_type'::regtype) THEN
    ALTER TYPE membership_type ADD VALUE 'none';
  END IF;

  -- Add 'monthly' if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'monthly' AND enumtypid = 'membership_type'::regtype) THEN
    ALTER TYPE membership_type ADD VALUE 'monthly';
  END IF;

  -- Add 'annual' if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'annual' AND enumtypid = 'membership_type'::regtype) THEN
    ALTER TYPE membership_type ADD VALUE 'annual';
  END IF;
EXCEPTION
  WHEN others THEN
    -- Enum values may already exist, that's fine
    NULL;
END $$;

-- ===========================================
-- COMMENTS
-- ===========================================

COMMENT ON TABLE sessions IS 'Active user sessions with refresh tokens';
COMMENT ON COLUMN users.verification_code IS '6-digit email verification code';
COMMENT ON COLUMN users.verification_expires IS 'When the verification code expires';
COMMENT ON COLUMN users.reset_token IS 'Hashed password reset token';
COMMENT ON COLUMN users.reset_token_expires IS 'When the reset token expires';
COMMENT ON COLUMN users.two_factor_temp_secret IS 'Temporary 2FA secret during setup';
COMMENT ON COLUMN users.backup_codes IS 'Array of hashed 2FA backup codes';
