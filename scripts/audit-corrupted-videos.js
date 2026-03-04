#!/usr/bin/env node

/**
 * THE VIDEO POOL — Corrupted Video Audit Script
 *
 * Investigates videos with corrupted resolution metadata:
 *   1. Videos with resolution = '170x170' (thumbnail artifact — pre-migration 020)
 *   2. Videos with file size > 100 MB AND resolution in ('170x170', '360p')
 *   3. Videos with file size > 50 MB AND resolution IS NULL AND duration < 10s
 *
 * Displays up to 20 corrupted records and a summary statistics block.
 * Read-only — this script does NOT modify any data.
 *
 * Usage (from the project root):
 *   DATABASE_URL="postgresql://..." NODE_PATH=server/node_modules node scripts/audit-corrupted-videos.js
 *
 * Or run directly from the server/ directory:
 *   cd server && DATABASE_URL="postgresql://..." node ../scripts/audit-corrupted-videos.js
 *
 * Or with a local .env file already containing DATABASE_URL:
 *   NODE_PATH=server/node_modules node scripts/audit-corrupted-videos.js
 *
 * Exit codes:
 *   0 — Audit completed (even if corrupted records were found)
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

// Try loading .env from project root, then server/.env (whichever has DATABASE_URL)
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const { Pool } = pg;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum rows to display in the corrupted records table */
const DISPLAY_LIMIT = 20;

/** File size threshold in bytes for null_resolution and size checks */
const LARGE_FILE_BYTES = 100_000_000; // 100 MB
const NULL_RES_FILE_BYTES = 50_000_000; // 50 MB

/** Short duration threshold in seconds for null_resolution check */
const SHORT_DURATION_SECONDS = 10;

// ---------------------------------------------------------------------------
// Guard: require DATABASE_URL
// ---------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(
    '[ERROR] DATABASE_URL is not set.\n' +
    'Provide it before running this script:\n' +
    '  DATABASE_URL="postgresql://user:pass@host:5432/db" node scripts/audit-corrupted-videos.js'
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
 * Find corrupted video records matching any of the three corruption criteria.
 * Returns up to DISPLAY_LIMIT rows, ordered by the largest file size first
 * so the most impactful records appear at the top.
 *
 * The three criteria are UNIONed so each video appears at most once
 * (UNION deduplicates; we label the corruption reason for clarity).
 *
 * @param {pg.Pool} db
 * @returns {Promise<Array>}
 */
async function fetchCorruptedRecords(db) {
  const result = await db.query(
    `
    SELECT
      sub.id,
      sub.title,
      sub.resolution,
      sub.file_size_bytes,
      sub.duration,
      sub.video_url,
      sub.corruption_reason
    FROM (

      -- Criterion 1: resolution = '170x170' (thumbnail artifact value)
      SELECT DISTINCT ON (v.id)
        v.id,
        v.title,
        v.resolution,
        vv.file_size                                           AS file_size_bytes,
        v.duration,
        vv.file_url                                            AS video_url,
        '170x170 resolution (thumbnail artifact)'              AS corruption_reason
      FROM   videos v
      LEFT JOIN video_versions vv ON vv.video_id = v.id
      WHERE  v.resolution = '170x170'
      ORDER  BY v.id, vv.file_size DESC NULLS LAST

      UNION

      -- Criterion 2: file_size > 100 MB AND resolution in ('170x170', '360p')
      SELECT DISTINCT ON (v.id)
        v.id,
        v.title,
        v.resolution,
        vv.file_size                                           AS file_size_bytes,
        v.duration,
        vv.file_url                                            AS video_url,
        'Large file (>100 MB) with low/invalid resolution'     AS corruption_reason
      FROM   videos v
      JOIN   video_versions vv ON vv.video_id = v.id
      WHERE  vv.file_size > $1
        AND  v.resolution IN ('170x170', '360p')
      ORDER  BY v.id, vv.file_size DESC NULLS LAST

      UNION

      -- Criterion 3: file_size > 50 MB AND resolution IS NULL AND duration < 10s
      SELECT DISTINCT ON (v.id)
        v.id,
        v.title,
        v.resolution,
        vv.file_size                                           AS file_size_bytes,
        v.duration,
        vv.file_url                                            AS video_url,
        'NULL resolution, large file (>50 MB), short duration (<10s)' AS corruption_reason
      FROM   videos v
      JOIN   video_versions vv ON vv.video_id = v.id
      WHERE  v.resolution IS NULL
        AND  vv.file_size > $2
        AND  (v.duration IS NOT NULL AND v.duration < $3)
      ORDER  BY v.id, vv.file_size DESC NULLS LAST

    ) sub
    ORDER BY sub.file_size_bytes DESC NULLS LAST
    LIMIT  $4
    `,
    [LARGE_FILE_BYTES, NULL_RES_FILE_BYTES, SHORT_DURATION_SECONDS, DISPLAY_LIMIT]
  );
  return result.rows;
}

/**
 * Fetch summary statistics for corrupted video detection.
 *
 * @param {pg.Pool} db
 * @returns {Promise<object>}
 */
async function fetchSummaryStats(db) {
  const [totalResult, corruptResult, nullResult, sizeStatsResult] = await Promise.all([
    // Total video count
    db.query('SELECT COUNT(*) AS count FROM videos'),

    // Count of 170x170 resolution records (pre-migration 020 state OR if still present)
    db.query(
      `SELECT COUNT(*) AS count FROM videos WHERE resolution = '170x170'`
    ),

    // Count of NULL resolution records
    db.query(
      `SELECT COUNT(*) AS count FROM videos WHERE resolution IS NULL`
    ),

    // Average and max file size across all video_versions
    db.query(
      `
      SELECT
        ROUND(AVG(file_size) / 1048576.0, 2) AS avg_file_size_mb,
        ROUND(MAX(file_size) / 1048576.0, 2) AS max_file_size_mb
      FROM video_versions
      WHERE file_size IS NOT NULL
      `
    ),
  ]);

  return {
    totalVideos:    parseInt(totalResult.rows[0].count, 10),
    count170x170:   parseInt(corruptResult.rows[0].count, 10),
    countNullRes:   parseInt(nullResult.rows[0].count, 10),
    avgFileSizeMb:  parseFloat(sizeStatsResult.rows[0].avg_file_size_mb ?? 0),
    maxFileSizeMb:  parseFloat(sizeStatsResult.rows[0].max_file_size_mb ?? 0),
  };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/**
 * Convert bytes to a human-readable MB string.
 *
 * @param {number|null} bytes
 * @returns {string}
 */
function formatMb(bytes) {
  if (bytes == null) return 'N/A';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const banner = '='.repeat(70);

  console.log('');
  console.log(banner);
  console.log('  THE VIDEO POOL — Corrupted Video Audit');
  console.log('  Identifies videos with invalid resolution metadata');
  console.log(banner);
  console.log('');

  let exitCode = 0;

  try {
    // -----------------------------------------------------------------
    // 1. Fetch corrupted records
    // -----------------------------------------------------------------
    console.log('Scanning for corrupted records...');
    console.log('');

    const records = await fetchCorruptedRecords(pool);

    if (records.length === 0) {
      console.log('No corrupted records found. Database looks clean.');
      console.log('');
    } else {
      console.log(
        `Found ${records.length} corrupted record(s) (showing up to ${DISPLAY_LIMIT}):`
      );
      console.log('-'.repeat(70));

      // Table header
      console.log(
        col('ID', 8) +
        col('Title', 30) +
        col('Resolution', 18) +
        col('File Size', 14) +
        col('Duration', 10) +
        'Video URL (first 60 chars)'
      );
      console.log('-'.repeat(70));

      for (const row of records) {
        const resLabel =
          row.resolution == null
            ? 'NULL'
            : `${row.resolution} [INVALID]`;

        console.log(
          col(row.id, 8) +
          col(truncate(row.title, 28), 30) +
          col(resLabel, 18) +
          col(formatMb(row.file_size_bytes), 14) +
          col(row.duration != null ? `${row.duration}s` : 'N/A', 10) +
          truncate(row.video_url, 60)
        );

        // Print the corruption reason on its own indented line for clarity
        console.log(
          ' '.repeat(8) +
          `  Reason: ${row.corruption_reason}`
        );
      }

      console.log('-'.repeat(70));
      console.log('');
    }

    // -----------------------------------------------------------------
    // 2. Summary statistics
    // -----------------------------------------------------------------
    console.log('Fetching summary statistics...');
    const stats = await fetchSummaryStats(pool);

    console.log('');
    console.log(banner);
    console.log('  SUMMARY STATISTICS');
    console.log(banner);
    console.log(`  Total videos in database    : ${stats.totalVideos.toLocaleString()}`);
    console.log(`  Videos with 170x170 res     : ${stats.count170x170.toLocaleString()}`);
    console.log(`  Videos with NULL resolution  : ${stats.countNullRes.toLocaleString()}`);
    console.log(`  Avg file size (all versions) : ${stats.avgFileSizeMb.toFixed(2)} MB`);
    console.log(`  Max file size (all versions) : ${stats.maxFileSizeMb.toFixed(2)} MB`);
    console.log(banner);
    console.log('');

    if (stats.count170x170 > 0 || stats.countNullRes > 0) {
      console.log('Action items:');
      if (stats.count170x170 > 0) {
        console.log(
          `  - ${stats.count170x170} video(s) still have resolution = '170x170'.` +
          ' Run Migration 020 if not already applied.'
        );
      }
      if (stats.countNullRes > 0) {
        console.log(
          `  - ${stats.countNullRes} video(s) have NULL resolution.` +
          ' Run scripts/fix-corrupted-videos.js to flag them for manual review.'
        );
      }
      console.log(
        '  - Contact Steve to verify that the underlying video files are valid.'
      );
      console.log('');
    }

  } catch (err) {
    console.error('[ERROR] Audit failed:', err.message);
    console.error(err.stack);
    exitCode = 1;
  } finally {
    await pool.end();
  }

  process.exit(exitCode);
}

main();
