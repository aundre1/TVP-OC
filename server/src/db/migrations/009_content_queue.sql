-- Migration 009: Content upload queue
CREATE TABLE IF NOT EXISTS content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID NOT NULL,
  title VARCHAR(200) NOT NULL,
  artist VARCHAR(200) NOT NULL,
  genre VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  file_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);
