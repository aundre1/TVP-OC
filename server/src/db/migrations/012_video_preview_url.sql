-- Migration 012: Add preview_url to video_versions
-- Required for Wasabi preview clip links

ALTER TABLE video_versions
  ADD COLUMN IF NOT EXISTS preview_url TEXT;
