# Migration Rollback Procedures

**Project:** The Video Pool
**Scope:** Migrations 020, 021, and 022 (Audit Fixes — March 4, 2026)
**Target database:** Supabase dev (`jvgsmiqsqtqgfagghoiv`) via tvp_app user
**DO NOT run against:** www.thevideopool.com (Steve's production)

---

## Overview

These migrations were applied as part of the March 4, 2026 audit remediation effort:

| Migration | File | Purpose | Data Risk |
|-----------|------|---------|-----------|
| 020 | `020_standardize_resolution_labels.sql` | Normalize resolution values to standard set | Modifies `videos.resolution` — backup table created |
| 021 | `021_flag_corrupted_records.sql` | Create audit tracking table for corrupted records | Additive only — no video data modified |
| 022 | `022_fill_missing_years.sql` | Fill NULL release_year from created_at | Modifies `videos.release_year` — reversible |

---

## Rollback Procedures

### If Migration 020 (Resolution Standardization) Needs Reverting

**What it did:** Standardized all resolution values in the `videos` table to one of `1080p`, `720p`, `480p`, `360p`, or `NULL`. Created a backup table `videos_resolution_backup_20260304` preserving all original values before modification.

**When to roll back:** If downstream consumers (e.g. Steve's production API or the streaming player) rely on the original resolution format (e.g. `1920x1080`) and the change breaks their logic.

**Prerequisite check — verify backup table exists:**
```sql
SELECT COUNT(*) FROM videos_resolution_backup_20260304;
-- Expected: > 0 (should match number of rows that had non-NULL resolution)
```

**SQL to restore original resolution values:**
```sql
-- Restore all resolution values from the backup table
UPDATE videos
SET resolution = backup.resolution
FROM videos_resolution_backup_20260304 backup
WHERE videos.id = backup.id;

-- Confirm no invalid values remain after restoration
SELECT resolution, COUNT(*) AS count
FROM videos
GROUP BY resolution
ORDER BY count DESC
LIMIT 20;

-- Drop the backup table after confirming restoration succeeded
DROP TABLE videos_resolution_backup_20260304;
```

**Post-rollback verification:**
```sql
-- Spot-check 10 rows to confirm original format is restored
SELECT id, title, resolution
FROM videos
WHERE resolution IS NOT NULL
ORDER BY RANDOM()
LIMIT 10;
```

---

### If Migration 021 (Flag Corrupted Records) Needs Reverting

**What it did:** Created the `video_resolution_issues` table and populated it with records flagged for corrupted metadata. This migration is **additive only** — no rows in the `videos` table were modified.

**When to roll back:** If the tracking table causes conflicts, or if you need to re-run the flagging logic with a different threshold or classification.

**SQL to rollback:**
```sql
-- Drop the tracking table entirely
DROP TABLE IF EXISTS video_resolution_issues;

-- Confirm it is gone
SELECT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_name = 'video_resolution_issues'
) AS table_still_exists;
-- Expected: false
```

**Note:** Because this migration only adds a new table and does not touch the `videos` table, rolling it back has zero impact on video data integrity.

---

### If Migration 022 (Fill Missing Years) Needs Reverting

**What it did:** Populated `videos.release_year` for rows where it was `NULL` or `0`, using `EXTRACT(YEAR FROM created_at)` as the fallback value. The update sets `updated_at = NOW()` so timestamps can be used to identify which rows were changed.

**When to roll back:** If the year derived from `created_at` proves inaccurate for a significant number of videos and is causing incorrect search/filter results.

**SQL to rollback (revert ONLY rows updated on March 4, 2026):**
```sql
-- Revert release_year to NULL for videos where:
--   1. release_year matches the year from created_at (i.e. was set by migration 022)
--   2. updated_at falls on the migration date (i.e. was last touched today)
UPDATE videos
SET    release_year = NULL,
       updated_at   = NOW()
WHERE  release_year = EXTRACT(YEAR FROM created_at)::INT
  AND  DATE(updated_at) = '2026-03-04';  -- Only revert rows updated on migration day

-- Verify how many rows were reverted
SELECT COUNT(*)
FROM videos
WHERE release_year IS NULL OR release_year = 0;
```

**Note on precision:** This WHERE clause is conservative. If videos were updated by other processes on the same day, they will be excluded correctly because their `updated_at` would differ or their `release_year` would not match `EXTRACT(YEAR FROM created_at)`.

---

## Rollback All Migrations at Once

Use this path only when individual rollbacks are insufficient (e.g. schema corruption or data integrity failure affecting multiple tables).

### Option 1: Restore from backup table (preferred for migration 020)

```bash
# Create a restore script from the backup table
psql $DATABASE_URL -c "
  -- Step 1: Restore resolution values
  UPDATE videos
  SET resolution = backup.resolution
  FROM videos_resolution_backup_20260304 backup
  WHERE videos.id = backup.id;

  -- Step 2: Revert release_year changes
  UPDATE videos
  SET release_year = NULL, updated_at = NOW()
  WHERE release_year = EXTRACT(YEAR FROM created_at)::INT
    AND DATE(updated_at) = '2026-03-04';

  -- Step 3: Drop the audit tracking table
  DROP TABLE IF EXISTS video_resolution_issues;

  -- Step 4: Drop the resolution backup table
  DROP TABLE IF EXISTS videos_resolution_backup_20260304;
"
```

### Option 2: Supabase point-in-time recovery (nuclear option)

Use only if the database state is unrecoverable via SQL rollback commands.

1. Go to Supabase dashboard: https://supabase.com/dashboard/project/jvgsmiqsqtqgfagghoiv
2. Navigate to: Settings > Database > Backups
3. Select "Point in Time Recovery"
4. Choose a restore point **BEFORE** `2026-03-04T18:47:00Z` (approximate migration start time)
5. Confirm the restore in the dashboard — this creates a new database instance
6. Update `DATABASE_URL` in Railway to point to the restored instance's pooler URL
7. Verify the application is healthy with: `python3 scripts/verify-deployment.py --env dev`

**Warning:** Point-in-time recovery replaces the entire database. Any data written after the restore point (new users, downloads, etc.) will be lost. Coordinate with Aundre before proceeding.

---

## Safety Procedures

Complete all steps in order before executing any rollback command:

- [ ] **Take a snapshot first.** Before rolling back, capture current state:
  ```sql
  -- Save counts before rollback for the post-mortem
  SELECT
    (SELECT COUNT(*) FROM videos) AS total_videos,
    (SELECT COUNT(*) FROM videos WHERE resolution IS NULL) AS null_resolutions,
    (SELECT COUNT(*) FROM videos WHERE release_year IS NULL) AS null_years,
    (SELECT COUNT(*) FROM video_resolution_issues) AS flagged_issues;
  ```

- [ ] **Test rollback commands in a dev or staging copy first.** Never execute untested rollback SQL directly against a database with live user data.

- [ ] **Document the trigger.** Record what caused the rollback decision (error message, user report, log line) before running commands. This data is required for the post-mortem.

- [ ] **Verify video table integrity after rollback.**
  ```sql
  SELECT COUNT(*) FROM videos;
  -- Must match the pre-rollback count (26,043 expected)
  ```

- [ ] **Verify all metadata fields are correctly restored.**
  ```sql
  SELECT
    COUNT(*) AS total,
    COUNT(resolution) AS has_resolution,
    COUNT(release_year) AS has_year
  FROM videos;
  ```

- [ ] **Restart the Railway server** after any rollback to clear any in-memory caches:
  ```bash
  # Trigger a redeploy via Railway CLI or dashboard
  railway redeploy
  ```

- [ ] **Notify Aundre** that a rollback was executed and what the current state of the database is.

---

## Commit SHA Reference

These commits introduced the migrations and can be used for `git diff` or `git revert`:

| Commit | Description |
|--------|-------------|
| `2ca297c` | feat: add migration 020 to standardize video resolution labels |
| `ec86b07` | feat: add migration 021 to flag and track corrupted video records |
| `f9c68a2` | feat: add migration 022 to populate missing year metadata from createdAt |
| `b2b7946` | feat: add audit verification endpoint and comprehensive audit script |

To inspect what a migration changed:
```bash
git show 2ca297c -- server/src/db/migrations/020_standardize_resolution_labels.sql
git show ec86b07 -- server/src/db/migrations/021_flag_corrupted_records.sql
git show f9c68a2 -- server/src/db/migrations/022_fill_missing_years.sql
```

---

## Files Created by These Migrations

### New database objects (rollback targets)
- `videos_resolution_backup_20260304` — Backup table (created by migration 020)
- `video_resolution_issues` — Audit tracking table (created by migration 021)

### Modified database columns
- `videos.resolution` — Standardized by migration 020 (backup exists)
- `videos.release_year` — Populated by migration 022 (reversible via date filter)

### Script files (no rollback needed — read-only)
- `scripts/verify-resolution-fix.js`
- `scripts/audit-corrupted-videos.js`
- `scripts/analyze-missing-years.js`
- `scripts/populate-missing-years.js`
- `scripts/run-full-audit.js`

### Server route files (no rollback needed — additive)
- `server/src/routes/admin.js` (audit-verification endpoint added)
