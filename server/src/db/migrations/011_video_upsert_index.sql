-- ===========================================
-- Migration 011: Unique constraint on videos(title, artist)
-- Required for bulk import upsert logic.
-- Allows ON CONFLICT (title, artist) DO UPDATE.
-- ===========================================

-- Add unique constraint if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'videos_title_artist_unique'
      AND conrelid = 'videos'::regclass
  ) THEN
    ALTER TABLE videos
      ADD CONSTRAINT videos_title_artist_unique UNIQUE (title, artist);
  END IF;
END;
$$;
