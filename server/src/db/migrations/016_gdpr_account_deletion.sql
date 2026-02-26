-- ===========================================
-- Migration 016: GDPR Account Deletion Support
-- Adds soft-delete fields and deletion request tracking
-- ===========================================

-- Track account deletion requests
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  processed_by INTEGER REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_user ON account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON account_deletion_requests(status);
