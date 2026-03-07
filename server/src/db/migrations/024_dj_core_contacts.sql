-- Migration 024: DJ Core Contacts
-- Separate table for the 31K validated external DJ contacts
-- De-duped against tvp_subscribers before import

CREATE TABLE IF NOT EXISTS dj_core_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  dj_software TEXT,
  country TEXT,
  source TEXT,
  confidence_tier TEXT DEFAULT 'HIGH',
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  email_id TEXT,
  unsubscribed BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMPTZ,
  bounced BOOLEAN DEFAULT false,
  bounce_type TEXT,
  complained BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dj_core_email ON dj_core_contacts(email);
CREATE INDEX IF NOT EXISTS idx_dj_core_unsent ON dj_core_contacts(email_sent) WHERE email_sent = false;
CREATE INDEX IF NOT EXISTS idx_dj_core_active ON dj_core_contacts(email_sent, unsubscribed, bounced);

COMMENT ON TABLE dj_core_contacts IS 'External DJ contacts from validated email lists — separate from registered TVP subscribers';
