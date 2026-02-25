-- Migration 006: Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('bug', 'song_request', 'billing', 'other')),
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(10) DEFAULT 'normal',
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assignee VARCHAR(100),
  admin_response TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
