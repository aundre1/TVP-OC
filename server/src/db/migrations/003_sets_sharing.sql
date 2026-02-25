-- ===========================================
-- Migration 003: Sets sharing table
-- ===========================================

CREATE TABLE IF NOT EXISTS sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  share_id VARCHAR(12) UNIQUE NOT NULL,
  video_ids TEXT[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  track_count INTEGER DEFAULT 0,
  total_duration TEXT,
  bpm_range TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sets_share_id ON sets(share_id);
CREATE INDEX IF NOT EXISTS idx_sets_user_id ON sets(user_id);
