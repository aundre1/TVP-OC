# Post-Deployment Verification Checklist

**Project:** The Video Pool
**Audit date:** March 4, 2026
**Scope:** Migrations 020, 021, and 022 + audit verification endpoint
**Target:** dev database — `https://dev.thevideopool.com` / Railway backend
**DO NOT verify against:** www.thevideopool.com (Steve's production)

---

## Summary

This checklist verifies that all three audit migrations have been applied correctly and that the verification infrastructure is working end-to-end. Work through each section in order. All 7 checkpoints must pass before signing off.

Expected final state after passing all checkpoints:
- `videos.resolution` — only `1080p`, `720p`, `480p`, `360p`, or `NULL` (no raw pixel dimensions)
- `videos.release_year` — 0 NULL values (all videos have a year)
- `video_resolution_issues` — populated with flagged corrupted records
- `/api/admin/audit-verification` — returns clean audit report
- Git history — all 5 migration and tooling commits present

---

## PRE-DEPLOYMENT

Complete before running any migrations.

- [ ] **All 3 migration files exist**
  ```bash
  ls /Users/dremacmini/Desktop/OC/the-video-pool/server/src/db/migrations/020_* \
     /Users/dremacmini/Desktop/OC/the-video-pool/server/src/db/migrations/021_* \
     /Users/dremacmini/Desktop/OC/the-video-pool/server/src/db/migrations/022_*
  ```
  Expected: 3 files printed with no errors.

- [ ] **All 7 supporting scripts exist**
  ```bash
  ls /Users/dremacmini/Desktop/OC/the-video-pool/scripts/{verify-resolution-fix,audit-corrupted-videos,analyze-missing-years,populate-missing-years,run-full-audit}.js
  ```
  Expected: 5 scripts printed (the `fix-corrupted-videos.js` and `verify-email-list.js` bring the total to 7 in the directory).

- [ ] **Database backup taken** — Supabase dashboard > Settings > Database > Backups > Create backup

- [ ] **`DATABASE_URL` environment variable is configured**
  ```bash
  echo $DATABASE_URL | cut -c1-30  # Print only first 30 chars (avoid logging credentials)
  ```
  Expected: Starts with `postgresql://tvp_app.jvgsmiqsqtqgfagghoiv`

- [ ] **Server is NOT running** (avoid conflicts during migration)
  ```bash
  lsof -i :5000 | grep LISTEN || echo "Port 5000 clear"
  ```
  Expected: `Port 5000 clear`

---

## DEPLOYMENT

Run migrations in order. Do not skip steps.

- [ ] **Migration 020** — Resolution standardization runs without errors
  ```bash
  # Via server startup (auto-migration) or manually:
  psql $DATABASE_URL -f /Users/dremacmini/Desktop/OC/the-video-pool/server/src/db/migrations/020_standardize_resolution_labels.sql
  ```
  Expected: `COMMIT` printed at end, no `ERROR` lines, `NOTICE` lines show distribution of 1080p/720p/480p/360p values.

- [ ] **Migration 021** — Corrupted record flagging runs without errors
  ```bash
  psql $DATABASE_URL -f /Users/dremacmini/Desktop/OC/the-video-pool/server/src/db/migrations/021_flag_corrupted_records.sql
  ```
  Expected: `COMMIT` printed, table `video_resolution_issues` created, flagged count logged.

- [ ] **Migration 022** — Missing year population runs manually (NOT auto-run on server startup)
  ```bash
  node /Users/dremacmini/Desktop/OC/the-video-pool/scripts/populate-missing-years.js
  ```
  Expected: Script reports 0 videos still missing `release_year` after completion.

---

## POST-DEPLOYMENT VERIFICATION

Work through all 7 checkpoints. Each has a command, expected output, and a pass/fail decision.

---

### Checkpoint 1 — Resolution Standardization (Migration 020)

**Command:**
```bash
DATABASE_URL="$DATABASE_URL" node /Users/dremacmini/Desktop/OC/the-video-pool/scripts/verify-resolution-fix.js
```

**Expected output:**
- `Resolution values: ONLY 1080p, 720p, 480p, 360p, NULL`
- `Invalid resolutions: 0`
- `Resolutions set to NULL (corrupted): 3-5 videos` (exact count depends on database state)
- Exit code `0`

**Pass criteria:** `Invalid resolutions: 0`. Any nonzero count is a failure — stop and investigate before continuing.

**Manual SQL equivalent (run in Supabase SQL Editor if script unavailable):**
```sql
SELECT
  COUNT(*) FILTER (WHERE resolution NOT IN ('1080p','720p','480p','360p') AND resolution IS NOT NULL) AS invalid_resolutions,
  COUNT(*) FILTER (WHERE resolution = '1080p') AS count_1080p,
  COUNT(*) FILTER (WHERE resolution = '720p')  AS count_720p,
  COUNT(*) FILTER (WHERE resolution = '480p')  AS count_480p,
  COUNT(*) FILTER (WHERE resolution = '360p')  AS count_360p,
  COUNT(*) FILTER (WHERE resolution IS NULL)   AS count_null
FROM videos;
```

- [ ] Checkpoint 1 PASSED

---

### Checkpoint 2 — Corrupted Record Flagging (Migration 021)

**Command:**
```bash
DATABASE_URL="$DATABASE_URL" node /Users/dremacmini/Desktop/OC/the-video-pool/scripts/audit-corrupted-videos.js
```

**Expected output:**
- `Found 3-5 potentially corrupted records` (exact count depends on how many videos had `170x170` resolution)
- `Total flagged records in database: <same count>`
- `Issue types: 170x170, null_resolution` listed
- Exit code `0`

**Pass criteria:** Script exits without errors and the `video_resolution_issues` table exists and is populated.

**Manual SQL equivalent:**
```sql
SELECT
  issue_type,
  status,
  COUNT(*) AS record_count
FROM video_resolution_issues
GROUP BY issue_type, status
ORDER BY issue_type;
```

Expected: Rows for `170x170` and/or `null_resolution` with `status = 'flagged'`.

- [ ] Checkpoint 2 PASSED

---

### Checkpoint 3 — Missing Year Population (Migration 022)

**Command:**
```bash
DATABASE_URL="$DATABASE_URL" node /Users/dremacmini/Desktop/OC/the-video-pool/scripts/analyze-missing-years.js
```

**Expected output:**
- `Missing year: 0 (0.0%)` — ALL 26,043 videos now have `release_year`
- Year distribution table showing reasonable spread across years
- Exit code `0`

**Pass criteria:** `Missing year: 0`. Any nonzero count indicates the migration did not run or a row has a `NULL created_at` (investigate that row specifically).

**Manual SQL equivalent:**
```sql
SELECT
  COUNT(*) FILTER (WHERE release_year IS NULL OR release_year = 0) AS missing_years,
  COUNT(*) AS total_videos,
  MIN(release_year) AS earliest_year,
  MAX(release_year) AS latest_year
FROM videos;
```

Expected: `missing_years = 0`, `total_videos = 26043`, years in a plausible range (e.g. 2015-2026).

- [ ] Checkpoint 3 PASSED

---

### Checkpoint 4 — Full Audit Verification (All Migrations)

**Command:**
```bash
DATABASE_URL="$DATABASE_URL" node /Users/dremacmini/Desktop/OC/the-video-pool/scripts/run-full-audit.js
```

**Expected output:**
```
[Section 1] Resolution Standardization ... ✅ PASSED
[Section 2] Corrupted Records           ... ✅ PASSED
[Section 3] Missing Year Metadata       ... ✅ PASSED
[Section 4] Overall Data Quality        ... ✅ PASSED

Invalid resolutions : 0
Missing years       : 0 (0.0%)
```

**Pass criteria:** All 4 sections print `✅ PASSED`. Script exits with code `0`.

**If any section fails:** Do NOT continue to Checkpoint 5. Diagnose the failing section using its individual script (Checkpoints 1-3 above), fix the root cause, then re-run the full audit.

- [ ] Checkpoint 4 PASSED

---

### Checkpoint 5 — API Verification (requires server running)

Start the server in a separate terminal:
```bash
cd /Users/dremacmini/Desktop/OC/the-video-pool/server && npm run dev
```

Wait for: `Server running on port 5000` before running the curl command below.

**Command:**
```bash
curl -s http://localhost:5000/api/admin/audit-verification | jq .
```

**Expected response:**
```json
{
  "success": true,
  "timestamp": "2026-03-04T...",
  "audit": {
    "total_videos": 26043,
    "invalid_resolutions": 0,
    "missing_years": 0,
    "resolution_values": "1080p, 360p, 480p, 720p"
  }
}
```

**Pass criteria:**
- `"success": true`
- `"invalid_resolutions": 0`
- `"missing_years": 0`
- `"resolution_values"` contains only the 4 standard tiers (no raw pixel dimensions)

**If the endpoint returns 401/403:** The endpoint requires admin auth. Check admin middleware in `server/src/routes/admin.js` and confirm the request includes a valid admin token.

**If the endpoint returns 500:** Check Railway logs or local server terminal for the SQL error.

- [ ] Checkpoint 5 PASSED

---

### Checkpoint 6 — Git History

**Command:**
```bash
git -C /Users/dremacmini/Desktop/OC/the-video-pool log --oneline | head -10
```

**Expected output (all 5 commits present):**
```
b2b7946 feat: add audit verification endpoint and comprehensive audit script
f9c68a2 feat: add migration 022 to populate missing year metadata from createdAt
ec86b07 feat: add migration 021 to flag and track corrupted video records for manual review
2ca297c feat: add migration 020 to standardize video resolution labels to 1080p/720p/480p/360p
```

Plus the rollback and verification checklist commit added by this task (Task 5).

**Pass criteria:** All 4 migration/tooling commits are visible in the log with their exact SHAs. If any are missing, the work was not committed — run `git status` and commit any outstanding changes.

**Verify specific commit content:**
```bash
git show 2ca297c --stat    # Migration 020 — should show .sql file
git show ec86b07 --stat    # Migration 021 — should show .sql file
git show f9c68a2 --stat    # Migration 022 — should show .sql file
git show b2b7946 --stat    # Audit endpoint — should show admin.js + run-full-audit.js
```

- [ ] Checkpoint 6 PASSED

---

### Checkpoint 7 — Database Integrity Check

Run this directly in the Supabase SQL Editor (https://supabase.com/dashboard/project/jvgsmiqsqtqgfagghoiv/sql/new) or via psql:

```sql
SELECT
  COUNT(*)                                                                      AS total_videos,
  COUNT(CASE WHEN resolution NOT IN ('1080p','720p','480p','360p') AND resolution IS NOT NULL
             THEN 1 END)                                                         AS invalid_resolutions,
  COUNT(CASE WHEN resolution IS NULL THEN 1 END)                                AS null_resolutions,
  COUNT(CASE WHEN release_year IS NULL OR release_year = 0 THEN 1 END)          AS missing_years,
  (SELECT COUNT(*) FROM video_resolution_issues)                                AS flagged_issues,
  (SELECT COUNT(*) FROM videos_resolution_backup_20260304)                      AS backup_rows
FROM videos;
```

**Expected results:**

| Column | Expected Value | Notes |
|--------|---------------|-------|
| `total_videos` | 26043 | Must match exactly — any deviation means rows were lost or added |
| `invalid_resolutions` | 0 | Zero tolerance — any nonzero value means migration 020 did not complete |
| `null_resolutions` | 3-5 | These are the `170x170` corrupted videos, correctly set to NULL |
| `missing_years` | 0 | Zero tolerance — any nonzero value means migration 022 did not complete |
| `flagged_issues` | 3-10 | Corrupted records tracked in `video_resolution_issues` |
| `backup_rows` | > 20000 | Backup table must exist and contain the original resolution data |

**Pass criteria:** `invalid_resolutions = 0` AND `missing_years = 0`.

**If `total_videos` is not 26043:** Stop immediately — something deleted or added rows unexpectedly. Do not sign off until the discrepancy is explained.

- [ ] Checkpoint 7 PASSED

---

## SIGN-OFF

Complete after all 7 checkpoints have been individually verified.

- [ ] Checkpoint 1 passed — Resolution values standardized, 0 invalid resolutions
- [ ] Checkpoint 2 passed — Corrupted records flagged in `video_resolution_issues`
- [ ] Checkpoint 3 passed — 0 videos missing `release_year`
- [ ] Checkpoint 4 passed — Full audit script exits with all sections green
- [ ] Checkpoint 5 passed — `/api/admin/audit-verification` returns clean JSON response
- [ ] Checkpoint 6 passed — All 5 migration commits present in git history
- [ ] Checkpoint 7 passed — Database integrity SQL shows `invalid_resolutions = 0`, `missing_years = 0`
- [ ] No errors in Railway server logs or Supabase query logs during verification
- [ ] Verified first on dev database before touching anything near production
- [ ] Rollback procedures reviewed (`scripts/MIGRATION_ROLLBACK.md`) and team knows how to use them
- [ ] Aundre notified that all audit fixes are live and verified

**Verified by:** ______________________
**Date/time:** 2026-03-04 __:__ UTC
**Notes:** ______________________

---

## Quick Reference — Files Created by This Audit

### Database objects (new)
- `videos_resolution_backup_20260304` — Resolution backup table (migration 020)
- `video_resolution_issues` — Corrupted record tracking table (migration 021)

### Migration files
- `server/src/db/migrations/020_standardize_resolution_labels.sql` (commit `2ca297c`)
- `server/src/db/migrations/021_flag_corrupted_records.sql` (commit `ec86b07`)
- `server/src/db/migrations/022_fill_missing_years.sql` (commit `f9c68a2`)

### Verification scripts
- `scripts/verify-resolution-fix.js` — Checkpoint 1
- `scripts/audit-corrupted-videos.js` — Checkpoint 2
- `scripts/analyze-missing-years.js` — Checkpoint 3
- `scripts/populate-missing-years.js` — Used during deployment
- `scripts/run-full-audit.js` — Checkpoint 4 (comprehensive)

### Documentation
- `scripts/MIGRATION_ROLLBACK.md` — How to reverse each migration safely
- `scripts/VERIFICATION_CHECKLIST.md` — This file

### Server routes modified
- `server/src/routes/admin.js` — Added `/api/admin/audit-verification` endpoint (commit `b2b7946`)
