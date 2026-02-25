-- Migration 007: Marketing blasts and SMS sends
CREATE TABLE IF NOT EXISTS marketing_blasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('email', 'sms')),
  subject VARCHAR(200),
  message TEXT NOT NULL,
  segment VARCHAR(20) DEFAULT 'all',
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS sms_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  blast_id UUID REFERENCES marketing_blasts(id),
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'queued',
  sent_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_sends_user_month ON sms_sends (user_id, sent_at);
