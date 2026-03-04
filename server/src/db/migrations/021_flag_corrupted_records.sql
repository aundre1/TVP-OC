-- ===========================================
-- Migration 021: Flag and Track Corrupted Video Records
-- ===========================================
-- Purpose: Create an audit tracking table for videos with corrupted metadata
--          identified after Migration 020 standardized resolution labels.
--          This migration does NOT modify the videos table — it only creates
--          a tracking table and populates it with flagged records.
--
-- Issue types tracked:
--   '170x170'       — Videos whose original resolution was the thumbnail
--                     artifact value '170x170' (now NULL after migration 020)
--   'null_resolution' — Videos with NULL resolution AND a file size > 50 MB,
--                       suggesting real video files with missing metadata
--   'size_mismatch' — Reserved for future use (e.g. reported resolution does
--                     not match the actual encoded dimensions)
--
-- Idempotency: All DDL uses IF NOT EXISTS. INSERTs use ON CONFLICT DO NOTHING.
--              Running this migration more than once is safe.
--
-- Source of truth for original resolution values:
--   videos_resolution_backup_20260304 (created by Migration 020)
--
-- DO NOT run against www.thevideopool.com (Steve's production).
-- Target: dev database via DATABASE_URL (Supabase pooler via tvp_app user).
-- ===========================================

BEGIN;

-- -------------------------------------------
-- STEP 1: Create the tracking table
-- -------------------------------------------
-- This table is the single audit trail for all known corrupted video records.
-- It is append-only by design — status transitions happen via UPDATE, not DELETE.

CREATE TABLE IF NOT EXISTS video_resolution_issues (
  id                  SERIAL PRIMARY KEY,
  video_id            INT NOT NULL REFERENCES videos(id),

  -- Classification of the corruption
  -- Allowed values: '170x170' | 'null_resolution' | 'size_mismatch'
  issue_type          VARCHAR(50),

  -- Metadata snapshot at the time of flagging
  file_size_mb        NUMERIC,               -- File size in MB (from video_versions)
  reported_resolution VARCHAR(50),           -- The resolution value at flag time

  -- Free-text explanation for human reviewers
  notes               TEXT,

  -- Lifecycle status
  -- Allowed values: 'flagged' | 'reviewed' | 'fixed' | 'deleted'
  status              VARCHAR(20) DEFAULT 'flagged',

  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

-- Log that the table was ensured
DO $$
BEGIN
  RAISE NOTICE '[Migration 021] Table video_resolution_issues ensured (CREATE IF NOT EXISTS).';
END $$;

-- -------------------------------------------
-- STEP 2: Add unique constraint to enable idempotent inserts
-- -------------------------------------------
-- video_id + issue_type forms the natural key for a flagged record.
-- ON CONFLICT DO NOTHING on INSERT requires a unique index to target.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uq_video_resolution_issues_video_issue'
  ) THEN
    ALTER TABLE video_resolution_issues
      ADD CONSTRAINT uq_video_resolution_issues_video_issue
      UNIQUE (video_id, issue_type);
    RAISE NOTICE '[Migration 021] Unique constraint (video_id, issue_type) added.';
  ELSE
    RAISE NOTICE '[Migration 021] Unique constraint (video_id, issue_type) already exists — skipped.';
  END IF;
END $$;

-- -------------------------------------------
-- STEP 3: Flag '170x170' videos
-- -------------------------------------------
-- These are videos whose resolution was '170x170' before Migration 020 ran.
-- Migration 020 set their resolution to NULL. We use the backup table created
-- by Migration 020 to identify them definitively.
--
-- If the backup table does not exist (e.g. this is a fresh environment), we
-- fall back to flagging videos whose resolution IS NULL — a conservative
-- approximation that the DBA should review manually.

DO $$
DECLARE
  backup_exists BOOLEAN;
  flagged_count INT;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'videos_resolution_backup_20260304'
  ) INTO backup_exists;

  IF backup_exists THEN
    -- Primary path: use the backup table for exact identification
    INSERT INTO video_resolution_issues (
      video_id,
      issue_type,
      file_size_mb,
      reported_resolution,
      notes,
      status
    )
    SELECT
      v.id                                              AS video_id,
      '170x170'                                         AS issue_type,
      ROUND(
        COALESCE(
          (
            SELECT vv.file_size / 1048576.0
            FROM   video_versions vv
            WHERE  vv.video_id = v.id
            ORDER  BY vv.file_size DESC NULLS LAST
            LIMIT  1
          ),
          0
        ),
        2
      )                                                 AS file_size_mb,
      b.resolution                                      AS reported_resolution,
      'Original resolution was ''170x170'' — thumbnail artifact. '
        || 'Set to NULL by Migration 020. Requires manual verification '
        || 'that the video file exists and has a valid encoded resolution.'
                                                        AS notes,
      'flagged'                                         AS status
    FROM   videos v
    JOIN   videos_resolution_backup_20260304 b
           ON b.id = v.id
    WHERE  b.resolution = '170x170'
    ON CONFLICT (video_id, issue_type) DO NOTHING;

    GET DIAGNOSTICS flagged_count = ROW_COUNT;
    RAISE NOTICE '[Migration 021] Flagged % new ''170x170'' records (backup table path).', flagged_count;

  ELSE
    -- Fallback path: no backup table available
    -- Flag all NULL-resolution videos as potential 170x170 candidates.
    INSERT INTO video_resolution_issues (
      video_id,
      issue_type,
      file_size_mb,
      reported_resolution,
      notes,
      status
    )
    SELECT
      v.id                                              AS video_id,
      '170x170'                                         AS issue_type,
      ROUND(
        COALESCE(
          (
            SELECT vv.file_size / 1048576.0
            FROM   video_versions vv
            WHERE  vv.video_id = v.id
            ORDER  BY vv.file_size DESC NULLS LAST
            LIMIT  1
          ),
          0
        ),
        2
      )                                                 AS file_size_mb,
      NULL                                              AS reported_resolution,
      'Backup table videos_resolution_backup_20260304 not found. '
        || 'Flagged as potential 170x170 candidate because resolution IS NULL. '
        || 'Manual verification required — original value unknown.'
                                                        AS notes,
      'flagged'                                         AS status
    FROM   videos v
    WHERE  v.resolution IS NULL
    ON CONFLICT (video_id, issue_type) DO NOTHING;

    GET DIAGNOSTICS flagged_count = ROW_COUNT;
    RAISE NOTICE '[Migration 021] Flagged % new records (fallback path — no backup table).', flagged_count;
    RAISE NOTICE '[Migration 021] WARNING: Backup table missing. Run Migration 020 first for accurate flagging.';
  END IF;
END $$;

-- -------------------------------------------
-- STEP 4: Flag 'null_resolution' videos
-- -------------------------------------------
-- These are videos whose resolution IS NULL AND whose largest known version
-- file is over 50 MB, suggesting a genuine video file with missing metadata
-- rather than a placeholder or corrupt stub.
--
-- We exclude rows already captured as '170x170' (via the backup table join
-- handled in Step 3) to avoid double-flagging.

DO $$
DECLARE
  flagged_count INT;
BEGIN
  INSERT INTO video_resolution_issues (
    video_id,
    issue_type,
    file_size_mb,
    reported_resolution,
    notes,
    status
  )
  SELECT
    v.id                                              AS video_id,
    'null_resolution'                                 AS issue_type,
    ROUND(max_vv.max_file_size_bytes / 1048576.0, 2) AS file_size_mb,
    NULL                                              AS reported_resolution,
    'Video has NULL resolution after Migration 020 AND a version file '
      || 'larger than 50 MB (' || ROUND(max_vv.max_file_size_bytes / 1048576.0, 2)
      || ' MB). Likely a real video file with metadata that was never '
      || 'populated or was lost during an import. Requires manual review.'
                                                      AS notes,
    'flagged'                                         AS status
  FROM   videos v
  JOIN   (
    -- Aggregate the largest file size per video across all versions
    SELECT   video_id,
             MAX(file_size) AS max_file_size_bytes
    FROM     video_versions
    WHERE    file_size IS NOT NULL
    GROUP BY video_id
  ) max_vv ON max_vv.video_id = v.id
  WHERE  v.resolution IS NULL
    AND  max_vv.max_file_size_bytes > 50000000   -- > 50 MB threshold
    -- Exclude videos already flagged as '170x170' in this run to prevent
    -- the same record appearing under two issue types for the same root cause
    AND NOT EXISTS (
      SELECT 1
      FROM   video_resolution_issues vri
      WHERE  vri.video_id  = v.id
        AND  vri.issue_type = '170x170'
    )
  ON CONFLICT (video_id, issue_type) DO NOTHING;

  GET DIAGNOSTICS flagged_count = ROW_COUNT;
  RAISE NOTICE '[Migration 021] Flagged % new ''null_resolution'' records (file > 50 MB, no 170x170 overlap).', flagged_count;
END $$;

-- -------------------------------------------
-- STEP 5: Log summary counts
-- -------------------------------------------

DO $$
DECLARE
  total_flagged       INT;
  count_170x170       INT;
  count_null_res      INT;
  count_size_mismatch INT;
BEGIN
  SELECT COUNT(*)         INTO total_flagged       FROM video_resolution_issues;
  SELECT COUNT(*)         INTO count_170x170       FROM video_resolution_issues WHERE issue_type = '170x170';
  SELECT COUNT(*)         INTO count_null_res      FROM video_resolution_issues WHERE issue_type = 'null_resolution';
  SELECT COUNT(*)         INTO count_size_mismatch FROM video_resolution_issues WHERE issue_type = 'size_mismatch';

  RAISE NOTICE '[Migration 021] ================================================';
  RAISE NOTICE '[Migration 021] SUMMARY — video_resolution_issues table';
  RAISE NOTICE '[Migration 021]   Total flagged records : %', total_flagged;
  RAISE NOTICE '[Migration 021]   170x170 issues        : %', count_170x170;
  RAISE NOTICE '[Migration 021]   null_resolution issues: %', count_null_res;
  RAISE NOTICE '[Migration 021]   size_mismatch issues  : %', count_size_mismatch;
  RAISE NOTICE '[Migration 021] ================================================';
  RAISE NOTICE '[Migration 021] Next step: run scripts/audit-corrupted-videos.js';
  RAISE NOTICE '[Migration 021]   to review flagged records, then coordinate';
  RAISE NOTICE '[Migration 021]   with Steve to verify underlying video files.';
END $$;

COMMIT;

-- ===========================================
-- Post-migration reference queries:
--
-- View all flagged records:
--   SELECT vri.id, vri.video_id, v.title, v.artist, vri.issue_type,
--          vri.file_size_mb, vri.reported_resolution, vri.status, vri.notes
--   FROM   video_resolution_issues vri
--   JOIN   videos v ON v.id = vri.video_id
--   ORDER  BY vri.issue_type, vri.file_size_mb DESC NULLS LAST;
--
-- Count by status:
--   SELECT status, COUNT(*) FROM video_resolution_issues GROUP BY status;
--
-- Mark a record as reviewed:
--   UPDATE video_resolution_issues
--   SET    status = 'reviewed', updated_at = NOW()
--   WHERE  id = <issue_id>;
--
-- Mark a record as fixed (after Steve verifies and re-encodes):
--   UPDATE video_resolution_issues
--   SET    status = 'fixed', updated_at = NOW(), notes = notes || ' [Fixed: <date> <description>]'
--   WHERE  id = <issue_id>;
-- ===========================================
