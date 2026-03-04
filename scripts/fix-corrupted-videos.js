#!/usr/bin/env node

/**
 * THE VIDEO POOL — Corrupted Video Fix / Flagging Script
 *
 * Performs two actions on corrupted video records:
 *
 *   1. SET resolution = NULL for all videos where resolution = '170x170'
 *      This removes the invalid thumbnail-artifact value so the frontend
 *      no longer surfaces it as a valid resolution label.
 *      NOTE: This only applies if migration 020 has NOT already run.
 *            After migration 020, '170x170' rows were already set to NULL.
 *
 *   2. Display the full list of flagged records from the video_resolution_issues
 *      table (populated by Migration 021) so operators can coordinate with
 *      Steve on verifying and re-encoding the underlying video files.
 *
 * This script DOES modify the videos table (step 1) but is safe to re-run —
 * the UPDATE is a no-op when no '170x170' records remain.
 *
 * Usage (from the project root):
 *   DATABASE_URL="postgresql://..." NODE_PATH=server/node_modules node scripts/fix-corrupted-videos.js
 *
 * Or run directly from the server/ directory:
 *   cd server && DATABASE_URL="postgresql://..." node ../scripts/fix-corrupted-videos.js
 *
 * Or with a local .env file already containing DATABASE_URL:
 *   NODE_PATH=server/node_modules node scripts/fix-corrupted-videos.js
 *
 * Exit codes:
 *   0 — Script completed (review output for action items)
 *   1 — Connection or query error
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// ---------------------------------------------------------------------------
// Environment setup
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from project root, then server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const { Pool } = pg;

// ---------------------------------------------------------------------------
// Guard: require DATABASE_URL
// ---------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(
    '[ERROR] DATABASE_URL is not set.\n' +
    'Provide it before running this script:\n' +
    '  DATABASE_URL="postgresql://user:pass@host:5432/db" node scripts/fix-corrupted-videos.js'
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Database pool
// ---------------------------------------------------------------------------

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  connectionTimeoutMillis: 10_000,
});

// ---------------------------------------------------------------------------
// Query functions
// ---------------------------------------------------------------------------

/**
 * Count videos still carrying the invalid '170x170' resolution value.
 * After Migration 020 this should be 0.
 *
 * @param {pg.Pool} db
 * @returns {Promise<number>}
 */
async function count170x170Videos(db) {
  const result = await db.query(
    `SELECT COUNT(*) AS count FROM videos WHERE resolution = '170x170'`
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * Set resolution = NULL for all videos where resolution = '170x170'.
 * Returns the number of rows updated.
 *
 * This is idempotent — if no rows match, the UPDATE affects 0 rows.
 *
 * @param {pg.Pool} db
 * @returns {Promise<number>}
 */
async function nullify170x170Resolution(db) {
  const result = await db.query(
    `
    UPDATE videos
    SET    resolution = NULL,
           updated_at = NOW()
    WHERE  resolution = '170x170'
    `
  );
  return result.rowCount;
}

/**
 * Check whether the video_resolution_issues table exists.
 * Migration 021 creates this table — if it is missing, the operator needs
 * to run the migration before the flagged review list is available.
 *
 * @param {pg.Pool} db
 * @returns {Promise<boolean>}
 */
async function issuesTableExists(db) {
  const result = await db.query(
    `
    SELECT 1
    FROM   information_schema.tables
    WHERE  table_name = 'video_resolution_issues'
    `
  );
  return result.rowCount > 0;
}

/**
 * Fetch all flagged records from video_resolution_issues joined with video
 * metadata for human-readable display.
 *
 * @param {pg.Pool} db
 * @returns {Promise<Array>}
 */
async function fetchFlaggedRecords(db) {
  const result = await db.query(
    `
    SELECT
      vri.id            AS issue_id,
      vri.video_id,
      v.title,
      v.artist,
      vri.issue_type,
      vri.file_size_mb,
      vri.reported_resolution,
      vri.status,
      vri.notes,
      vri.created_at
    FROM   video_resolution_issues vri
    JOIN   videos v ON v.id = vri.video_id
    ORDER  BY vri.issue_type, vri.file_size_mb DESC NULLS LAST
    `
  );
  return result.rows;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/**
 * Truncate a string to a maximum length, appending '...' if cut.
 *
 * @param {string|null} str
 * @param {number} maxLen
 * @returns {string}
 */
function truncate(str, maxLen) {
  if (str == null) return 'N/A';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

/**
 * Right-pad a value to a fixed column width.
 *
 * @param {string|number} val
 * @param {number} width
 * @returns {string}
 */
function col(val, width) {
  const s = String(val ?? 'N/A');
  return s.length >= width ? s : s + ' '.repeat(width - s.length);
}

/**
 * Format a Date or ISO string as a short YYYY-MM-DD date.
 *
 * @param {Date|string|null} dateVal
 * @returns {string}
 */
function formatDate(dateVal) {
  if (dateVal == null) return 'N/A';
  const d = new Date(dateVal);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const banner = '='.repeat(70);

  console.log('');
  console.log(banner);
  console.log('  THE VIDEO POOL — Corrupted Video Fix + Flagged Review');
  console.log(banner);
  console.log('');

  let exitCode = 0;

  try {
    // -----------------------------------------------------------------
    // STEP 1: Nullify any remaining '170x170' resolution values
    // -----------------------------------------------------------------
    console.log('STEP 1: Clearing invalid 170x170 resolution values...');
    console.log('');

    const remainingCount = await count170x170Videos(pool);

    if (remainingCount === 0) {
      console.log(
        '  No videos with resolution = \'170x170\' found. ' +
        'Migration 020 already handled these records.'
      );
    } else {
      console.log(
        `  Found ${remainingCount} video(s) with resolution = '170x170'. ` +
        'Setting to NULL...'
      );

      const updatedCount = await nullify170x170Resolution(pool);

      console.log(`  Updated: ${updatedCount} row(s) set to NULL.`);
    }

    console.log('');

    // -----------------------------------------------------------------
    // STEP 2: Display flagged records from video_resolution_issues
    // -----------------------------------------------------------------
    console.log('STEP 2: Fetching flagged records for manual review...');
    console.log('');

    const tableExists = await issuesTableExists(pool);

    if (!tableExists) {
      console.log(
        '  [WARNING] Table video_resolution_issues does not exist.\n' +
        '  Run Migration 021 first to create the tracking table and populate it:\n' +
        '\n' +
        '    psql "$DATABASE_URL" -f server/src/db/migrations/021_flag_corrupted_records.sql\n' +
        '\n' +
        '  Or via the Supabase Management API if the tvp_app user lacks DDL rights.'
      );
    } else {
      const flaggedRecords = await fetchFlaggedRecords(pool);

      if (flaggedRecords.length === 0) {
        console.log(
          '  No flagged records found in video_resolution_issues.\n' +
          '  Re-run Migration 021 to populate the table if this is unexpected.'
        );
      } else {
        console.log(
          `  ${flaggedRecords.length} record(s) flagged for manual review:\n`
        );

        // Table header
        console.log(
          col('Issue ID', 10) +
          col('Video ID', 10) +
          col('Title', 28) +
          col('Issue Type', 18) +
          col('Size (MB)', 12) +
          col('Status', 10) +
          'Flagged'
        );
        console.log('-'.repeat(100));

        for (const row of flaggedRecords) {
          console.log(
            col(row.issue_id, 10) +
            col(row.video_id, 10) +
            col(truncate(row.title, 26), 28) +
            col(row.issue_type, 18) +
            col(row.file_size_mb != null ? `${row.file_size_mb}` : 'N/A', 12) +
            col(row.status, 10) +
            formatDate(row.created_at)
          );
        }

        console.log('-'.repeat(100));
        console.log('');

        // Breakdown by issue type
        const byType = flaggedRecords.reduce((acc, r) => {
          acc[r.issue_type] = (acc[r.issue_type] || 0) + 1;
          return acc;
        }, {});

        console.log('  Breakdown by issue type:');
        for (const [type, count] of Object.entries(byType)) {
          console.log(`    ${type}: ${count} record(s)`);
        }

        console.log('');
        console.log(
          '  Manual review needed — contact Steve to verify video files'
        );
        console.log('');
        console.log('  For each flagged record, Steve should confirm:');
        console.log('    - Does the video file exist in Wasabi storage?');
        console.log('    - What is the actual encoded resolution of the file?');
        console.log('    - Should the record be re-encoded, relabeled, or deleted?');
        console.log('');
        console.log('  To update the status of a reviewed record:');
        console.log(
          '    UPDATE video_resolution_issues\n' +
          '    SET    status = \'reviewed\', updated_at = NOW()\n' +
          '    WHERE  id = <issue_id>;'
        );
      }
    }

    // -----------------------------------------------------------------
    // Final summary
    // -----------------------------------------------------------------
    console.log('');
    console.log(banner);
    console.log('  COMPLETE');
    console.log(banner);
    console.log(
      '  Step 1 (170x170 nullification) : done'
    );
    console.log(
      '  Step 2 (flagged review list)   : ' +
      (tableExists ? 'done — see table above' : 'skipped — run Migration 021 first')
    );
    console.log('');
    console.log(
      '  Manual review needed — contact Steve to verify video files'
    );
    console.log('');

  } catch (err) {
    console.error('[ERROR] Fix script failed:', err.message);
    console.error(err.stack);
    exitCode = 1;
  } finally {
    await pool.end();
  }

  process.exit(exitCode);
}

main();
