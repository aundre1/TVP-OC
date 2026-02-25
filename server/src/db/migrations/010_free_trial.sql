-- Free trial support
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_plan VARCHAR(20);

-- Update membership_type enum: add 'starter' and 'elite', remove 'basic' and 'lifetime'
-- Note: PostgreSQL doesn't support DROP VALUE from enum, so we add new values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'starter' AND enumtypid = 'membership_type'::regtype) THEN
    ALTER TYPE membership_type ADD VALUE 'starter';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'elite' AND enumtypid = 'membership_type'::regtype) THEN
    ALTER TYPE membership_type ADD VALUE 'elite';
  END IF;
END$$;

-- Migrate existing users from old plan names
UPDATE users SET membership_type = 'starter' WHERE membership_type = 'basic';
UPDATE users SET membership_type = 'elite' WHERE membership_type = 'lifetime';

-- SMS sends tracking table
CREATE TABLE IF NOT EXISTS sms_sends (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'sent',
  provider VARCHAR(20) DEFAULT 'sns',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sms_sends_user_date ON sms_sends(user_id, sent_at);
