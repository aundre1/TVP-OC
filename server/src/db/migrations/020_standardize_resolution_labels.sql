-- ===========================================
-- Migration 020: Standardize Video Resolution Labels
-- ===========================================
-- Purpose: Normalize the `resolution` field across all ~26,000 video rows
--          from mixed formats (e.g. "1920x1080", "480p", "170x170", "640x360")
--          to a single standard set: 1080p | 720p | 480p | 360p | NULL.
--
-- Audit findings (March 4, 2026):
--   "1920x1080" — ~60% of videos (WxH pixel-dimension format)
--   "480p"      — ~20% of videos (already quality-tier format, correct)
--   "170x170"   — ~15% of videos (corrupted/thumbnail metadata, invalid)
--   "640x360"   — ~5%  of videos (WxH pixel-dimension format)
--
-- Target state:
--   "1080p" — videos that were "1920x1080" or "1920x<anything>"
--   "720p"  — videos that were "1280x720" or "1280x<anything>"
--   "480p"  — videos that were "854x480", "480p", or start with "480"
--   "360p"  — videos that were "640x360", "360p", or start with "360"
--   NULL    — "170x170" and any other unrecognized/corrupted value
--
-- Idempotency: Running this migration more than once is safe.
-- Values already in ['1080p','720p','480p','360p'] are re-matched to themselves.
-- NULL values remain NULL. The backup table creation uses IF NOT EXISTS.
--
-- DO NOT run against www.thevideopool.com (Steve's production).
-- Target: dev database via DATABASE_URL (Supabase pooler via tvp_app user).
-- ===========================================

BEGIN;

-- -------------------------------------------
-- STEP 1: Create backup table (idempotent)
-- -------------------------------------------
-- Preserves the original resolution values before any modifications.
-- Named with the date stamp for easy auditing and rollback.
CREATE TABLE IF NOT EXISTS videos_resolution_backup_20260304 AS
  SELECT id, resolution
  FROM videos
  WHERE resolution IS NOT NULL;

-- Log how many rows were captured in the backup
DO $$
DECLARE
  backup_count INT;
BEGIN
  SELECT COUNT(*) INTO backup_count FROM videos_resolution_backup_20260304;
  RAISE NOTICE '[Migration 020] Backup table videos_resolution_backup_20260304 contains % rows', backup_count;
END $$;

-- -------------------------------------------
-- STEP 2: Standardize resolution values
-- -------------------------------------------
-- CASE evaluation order matters:
--   1. Already-standard values (idempotency guard) — checked first so we
--      never double-process a row on re-run.
--   2. Pixel-dimension WxH formats (e.g. "1920x1080").
--   3. Mixed/partial formats (e.g. "480p" prefix or "854x480").
--   4. Everything unrecognized → NULL (includes "170x170").
--
-- ILIKE is used throughout for case-insensitive matching (e.g. "1080P" → "1080p").

UPDATE videos
SET resolution = CASE

  -- -----------------------------------------------------------------------
  -- GUARD: Values already in standard format — leave them unchanged.
  -- This makes the UPDATE safely idempotent on re-runs.
  -- -----------------------------------------------------------------------
  WHEN resolution ILIKE '1080p' THEN '1080p'
  WHEN resolution ILIKE '720p'  THEN '720p'
  WHEN resolution ILIKE '480p'  THEN '480p'
  WHEN resolution ILIKE '360p'  THEN '360p'

  -- -----------------------------------------------------------------------
  -- 1080p bucket
  -- Matches: "1920x1080", "1920x1080p", or any "1920x..." variant.
  -- -----------------------------------------------------------------------
  WHEN resolution ILIKE '1920x%' THEN '1080p'

  -- -----------------------------------------------------------------------
  -- 720p bucket
  -- Matches: "1280x720", "1280x720p", or any "1280x..." variant.
  -- -----------------------------------------------------------------------
  WHEN resolution ILIKE '1280x%' THEN '720p'

  -- -----------------------------------------------------------------------
  -- 480p bucket
  -- Matches: "854x480", "854x480p", "480p" prefix variants (e.g. "480P"),
  -- or any "854x..." variant.
  -- -----------------------------------------------------------------------
  WHEN resolution ILIKE '854x%'  THEN '480p'
  WHEN resolution ILIKE '480%'   THEN '480p'

  -- -----------------------------------------------------------------------
  -- 360p bucket
  -- Matches: "640x360", "640x360p", "360p" prefix variants,
  -- or any "640x..." variant.
  -- -----------------------------------------------------------------------
  WHEN resolution ILIKE '640x%'  THEN '360p'
  WHEN resolution ILIKE '360%'   THEN '360p'

  -- -----------------------------------------------------------------------
  -- CORRUPTED / UNRECOGNIZED → NULL
  -- Includes "170x170" (thumbnail artifact), any other unknown format.
  -- These videos are preserved in the backup table for investigation.
  -- -----------------------------------------------------------------------
  ELSE NULL

END
WHERE resolution IS NOT NULL;  -- Skip rows already NULL (no-op rows excluded)

-- Log update counts by new value
DO $$
DECLARE
  count_1080p INT;
  count_720p  INT;
  count_480p  INT;
  count_360p  INT;
  count_null  INT;
BEGIN
  SELECT COUNT(*) INTO count_1080p FROM videos WHERE resolution = '1080p';
  SELECT COUNT(*) INTO count_720p  FROM videos WHERE resolution = '720p';
  SELECT COUNT(*) INTO count_480p  FROM videos WHERE resolution = '480p';
  SELECT COUNT(*) INTO count_360p  FROM videos WHERE resolution = '360p';
  SELECT COUNT(*) INTO count_null  FROM videos WHERE resolution IS NULL;

  RAISE NOTICE '[Migration 020] Post-update distribution:';
  RAISE NOTICE '  1080p : %', count_1080p;
  RAISE NOTICE '  720p  : %', count_720p;
  RAISE NOTICE '  480p  : %', count_480p;
  RAISE NOTICE '  360p  : %', count_360p;
  RAISE NOTICE '  NULL  : % (corrupted/unknown — preserved in backup table)', count_null;
END $$;

-- -------------------------------------------
-- STEP 3: Validate — no invalid values remain
-- -------------------------------------------
-- Any resolution value NOT in the allowed set and NOT NULL is a failure.
-- RAISE EXCEPTION rolls back the entire transaction, protecting data integrity.

DO $$
DECLARE
  invalid_count INT;
  sample_values TEXT;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM videos
  WHERE resolution IS NOT NULL
    AND resolution NOT IN ('1080p', '720p', '480p', '360p');

  IF invalid_count > 0 THEN
    -- Collect a sample of the offending values for the error message
    SELECT string_agg(DISTINCT resolution, ', ' ORDER BY resolution)
    INTO sample_values
    FROM videos
    WHERE resolution IS NOT NULL
      AND resolution NOT IN ('1080p', '720p', '480p', '360p')
    LIMIT 10;

    RAISE EXCEPTION
      '[Migration 020] VALIDATION FAILED: % rows still have invalid resolution values. Sample values: [%]. Rolling back.',
      invalid_count,
      sample_values;
  END IF;

  RAISE NOTICE '[Migration 020] Validation PASSED — all resolution values are in (1080p, 720p, 480p, 360p, NULL).';
END $$;

COMMIT;

-- ===========================================
-- Post-migration notes:
--
-- To inspect the backup table:
--   SELECT resolution, COUNT(*) FROM videos_resolution_backup_20260304
--   GROUP BY resolution ORDER BY COUNT(*) DESC;
--
-- To find which videos were set to NULL (corrupted data):
--   SELECT v.id, v.title, v.artist, b.resolution AS original_resolution
--   FROM videos v
--   JOIN videos_resolution_backup_20260304 b ON b.id = v.id
--   WHERE v.resolution IS NULL;
--
-- To roll back resolution changes from backup:
--   UPDATE videos v
--   SET resolution = b.resolution
--   FROM videos_resolution_backup_20260304 b
--   WHERE v.id = b.id;
--   DROP TABLE videos_resolution_backup_20260304;
-- ===========================================
