-- Migration 008: Dunning (failed payment recovery)
CREATE TABLE IF NOT EXISTS dunning_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_invoice_id VARCHAR(100),
  attempt_number INTEGER DEFAULT 1,
  email_sent BOOLEAN DEFAULT false,
  next_attempt_at TIMESTAMP,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
