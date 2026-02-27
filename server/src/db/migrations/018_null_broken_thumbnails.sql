-- Migration 018: Null out img.thevideopool.com thumbnail URLs
-- These are seed data videos pointing to Steve's old CDN which is not accessible.
-- VideoCard.tsx onError handler falls back to picsum placeholders,
-- but nulling these out removes the broken-image flash on load.

UPDATE videos
SET thumbnail_url = NULL
WHERE thumbnail_url LIKE 'https://img.thevideopool.com/%';

-- Verify
DO $$
DECLARE
  nulled_count INT;
BEGIN
  SELECT COUNT(*) INTO nulled_count FROM videos WHERE thumbnail_url IS NULL;
  RAISE NOTICE 'Videos with NULL thumbnail_url after migration: %', nulled_count;
END $$;
