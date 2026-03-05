-- ===========================================
-- Migration 022: Fill Missing release_year Metadata
-- ===========================================
-- Purpose: Populate NULL or zero release_year values on the videos table
--          using the year extracted from created_at as a fallback.
--
-- Rationale: Audit findings (March 4, 2026) show ~20% of sampled videos have
--            a NULL or zero release_year. Most videos were uploaded around the
--            time they were released, so EXTRACT(YEAR FROM created_at) provides
--            a reasonable approximation that is far better than NULL for
--            enabling year-based filtering.
--
-- Affected column: videos.release_year (INTEGER)
-- Source column  : videos.created_at   (TIMESTAMP WITH TIME ZONE)
--
-- Idempotency: Running this migration more than once is safe.
--              The WHERE clause restricts updates to rows still missing a year.
--              Rows already populated are never touched.
--
-- DO NOT run against www.thevideopool.com (Steve's production).
-- Target: dev database via DATABASE_URL (Supabase pooler via tvp_app user).
--
-- To run via Supabase Management API (tvp_app lacks DDL but has DML rights):
--   POST https://api.supabase.com/v1/projects/jvgsmiqsqtqgfagghoiv/database/query
-- ===========================================

BEGIN;

-- -------------------------------------------
-- STEP 1: Populate release_year from created_at
-- -------------------------------------------
-- Only rows where release_year IS NULL or release_year = 0 are updated.
-- All rows in the videos table have a created_at value (DEFAULT CURRENT_TIMESTAMP),
-- so the IS NOT NULL guard is a safety check only.

UPDATE videos
SET    release_year = EXTRACT(YEAR FROM created_at)::INT,
       updated_at   = NOW()
WHERE  (release_year IS NULL OR release_year = 0)
  AND  created_at IS NOT NULL;

-- -------------------------------------------
-- STEP 2: Log results and validate
-- -------------------------------------------

DO $$
DECLARE
  populated_count  INT;
  still_missing    INT;
BEGIN
  -- Count rows that were just updated (release_year IS NOT NULL AND != 0)
  -- We use the total minus still-missing to derive how many were populated.
  SELECT COUNT(*)
    INTO still_missing
    FROM videos
   WHERE release_year IS NULL OR release_year = 0;

  -- Count total rows that now have a valid release_year
  SELECT COUNT(*)
    INTO populated_count
    FROM videos
   WHERE release_year IS NOT NULL AND release_year > 0;

  RAISE NOTICE '[Migration 022] ================================================';
  RAISE NOTICE '[Migration 022] release_year population complete.';
  RAISE NOTICE '[Migration 022]   Videos with a valid release_year : %', populated_count;
  RAISE NOTICE '[Migration 022]   Videos still missing release_year: %', still_missing;
  RAISE NOTICE '[Migration 022] ================================================';

  -- Validation guard: any remaining gaps indicate rows with NULL created_at,
  -- which should not exist given the DEFAULT CURRENT_TIMESTAMP constraint.
  -- Raise an exception to alert the operator so the anomaly can be investigated.
  IF still_missing > 0 THEN
    RAISE EXCEPTION
      '[Migration 022] VALIDATION FAILED: % video(s) still have NULL/zero '
      'release_year after the update. These rows likely have a NULL created_at '
      'value, which violates the schema default. Investigate with: '
      'SELECT id, title, artist, created_at FROM videos '
      'WHERE release_year IS NULL OR release_year = 0;',
      still_missing;
  END IF;
END $$;

COMMIT;

-- ===========================================
-- Post-migration reference queries:
--
-- Verify the update applied cleanly:
--   SELECT COUNT(*) FROM videos WHERE release_year IS NULL OR release_year = 0;
--   -- Expected: 0
--
-- Inspect the year distribution after populating:
--   SELECT release_year, COUNT(*) AS video_count
--   FROM   videos
--   GROUP  BY release_year
--   ORDER  BY release_year DESC;
--
-- Spot-check a sample of recently populated rows:
--   SELECT id, title, artist, release_year,
--          EXTRACT(YEAR FROM created_at)::INT AS created_year,
--          created_at::DATE AS created_date
--   FROM   videos
--   WHERE  release_year = EXTRACT(YEAR FROM created_at)::INT
--   ORDER  BY created_at DESC
--   LIMIT  10;
-- ===========================================
