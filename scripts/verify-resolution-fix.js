#!/usr/bin/env node

/**
 * THE VIDEO POOL - Resolution Label Verification Script
 *
 * Validates that Migration 020 ran correctly by querying the
 * videos table and confirming all resolution values are one of:
 *   '1080p' | '720p' | '480p' | '360p' | NULL
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/verify-resolution-fix.js
 *
 * Exit codes:
 *   0 — All resolution values are valid (migration succeeded)
 *   1 — Invalid values found or connection error
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load .env from project root if present (local dev)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const { Pool } = pg;

// ===========================================
// CONSTANTS
// ===========================================

const VALID_RESOLUTIONS = new Set(['1080p', '720p', '480p', '360p']);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(
    '[ERROR] DATABASE_URL is not set.\n' +
    'Set it before running this script:\n' +
    '  DATABASE_URL="postgresql://user:pass@host:5432/db" node scripts/verify-resolution-fix.js'
  );
  process.exit(1);
}

// ===========================================
// DATABASE CONNECTION
// ===========================================

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
  connectionTimeoutMillis: 10000,
});

// ===========================================
// QUERY FUNCTIONS
// ===========================================

/**
 * Fetch all distinct resolution values with their row counts.
 * Returns rows ordered by count descending for easy scanning.
 *
 * @param {pg.Pool} db
 * @returns {Promise<Array<{ resolution: string|null, count: string }>>}
 */
async function fetchResolutionDistribution(db) {
  const result = await db.query(`
    SELECT
      resolution,
      COUNT(*) AS count
    FROM videos
    GROUP BY resolution
    ORDER BY COUNT(*) DESC
  `);
  return result.rows;
}

/**
 * Fetch rows with resolution values that are not in the allowed set and not NULL.
 * Any result here indicates Migration 020 did not fully execute.
 *
 * @param {pg.Pool} db
 * @returns {Promise<Array<{ resolution: string, count: string }>>}
 */
async function fetchInvalidResolutions(db) {
  const result = await db.query(`
    SELECT
      resolution,
      COUNT(*) AS count
    FROM videos
    WHERE resolution IS NOT NULL
      AND resolution NOT IN ('1080p', '720p', '480p', '360p')
    GROUP BY resolution
    ORDER BY COUNT(*) DESC
  `);
  return result.rows;
}

/**
 * Count videos with NULL resolution (corrupted data set to NULL by Migration 020).
 *
 * @param {pg.Pool} db
 * @returns {Promise<number>}
 */
async function countNullResolutions(db) {
  const result = await db.query(`
    SELECT COUNT(*) AS count FROM videos WHERE resolution IS NULL
  `);
  return parseInt(result.rows[0].count, 10);
}

/**
 * Count total videos in the table.
 *
 * @param {pg.Pool} db
 * @returns {Promise<number>}
 */
async function countTotalVideos(db) {
  const result = await db.query(`SELECT COUNT(*) AS count FROM videos`);
  return parseInt(result.rows[0].count, 10);
}

/**
 * Sample a few NULL-resolution videos so we can identify the corrupted records.
 * Only fetches id, title, and artist — no bulk data exposure.
 *
 * @param {pg.Pool} db
 * @returns {Promise<Array<{ id: string, title: string, artist: string }>>}
 */
async function sampleNullVideos(db) {
  const result = await db.query(`
    SELECT id, title, artist
    FROM videos
    WHERE resolution IS NULL
    LIMIT 5
  `);
  return result.rows;
}

// ===========================================
// FORMATTING HELPERS
// ===========================================

/**
 * Format a row count as a percentage of the total.
 *
 * @param {number} count
 * @param {number} total
 * @returns {string}
 */
function pct(count, total) {
  if (total === 0) return '0.0%';
  return ((count / total) * 100).toFixed(1) + '%';
}

/**
 * Left-pad a string to a fixed width for table alignment.
 *
 * @param {string|number} val
 * @param {number} width
 * @returns {string}
 */
function pad(val, width) {
  const s = String(val ?? 'NULL');
  return s.length >= width ? s : s + ' '.repeat(width - s.length);
}

// ===========================================
// MAIN
// ===========================================

async function main() {
  console.log('');
  console.log('=========================================================');
  console.log('  THE VIDEO POOL — Resolution Label Verification');
  console.log('  Migration 020 Post-Run Check');
  console.log('=========================================================');
  console.log('');

  let exitCode = 0;

  try {
    // --- Total video count ---
    const total = await countTotalVideos(pool);
    console.log(`Total videos in database: ${total.toLocaleString()}`);
    console.log('');

    // --- Resolution distribution ---
    const distribution = await fetchResolutionDistribution(pool);

    console.log('Resolution distribution (all unique values):');
    console.log('---------------------------------------------------------');
    console.log(
      pad('Resolution', 14) +
      pad('Count', 10) +
      pad('Percent', 10) +
      'Valid?'
    );
    console.log('-'.repeat(50));

    for (const row of distribution) {
      const resLabel = row.resolution ?? 'NULL';
      const count = parseInt(row.count, 10);
      const isValid = row.resolution === null || VALID_RESOLUTIONS.has(row.resolution);
      const validLabel = isValid ? 'OK' : 'INVALID';

      console.log(
        pad(resLabel, 14) +
        pad(count.toLocaleString(), 10) +
        pad(pct(count, total), 10) +
        validLabel
      );
    }
    console.log('');

    // --- Invalid resolution check ---
    const invalidRows = await fetchInvalidResolutions(pool);

    if (invalidRows.length > 0) {
      exitCode = 1;
      console.log('RESULT: FAIL — Invalid resolution values found:');
      console.log('---------------------------------------------------------');
      for (const row of invalidRows) {
        console.log(
          `  "${row.resolution}" — ${parseInt(row.count, 10).toLocaleString()} rows`
        );
      }
      console.log('');
      console.log(
        'Action required: Run migration 020 via:\n' +
        '  cd server && npm run db:migrate\n' +
        'Or via the Supabase Management API if tvp_app lacks DDL rights.'
      );
    } else {
      console.log('RESULT: PASS — No invalid resolution values found.');
    }
    console.log('');

    // --- NULL (corrupted) count ---
    const nullCount = await countNullResolutions(pool);
    console.log(`NULL resolutions (corrupted/unrecognized — set to NULL by migration): ${nullCount.toLocaleString()}`);

    if (nullCount > 0) {
      const samples = await sampleNullVideos(pool);
      console.log('Sample NULL-resolution videos (up to 5):');
      for (const row of samples) {
        console.log(`  id=${row.id}  title="${row.title}"  artist="${row.artist}"`);
      }
      console.log(
        '\nThese records were corrupted before Migration 020 (e.g. "170x170").\n' +
        'Original values are preserved in: videos_resolution_backup_20260304\n' +
        'To investigate: SELECT * FROM videos_resolution_backup_20260304 WHERE id IN\n' +
        '  (SELECT id FROM videos WHERE resolution IS NULL);'
      );
    }
    console.log('');

    // --- Summary ---
    const validCount = distribution
      .filter(r => r.resolution !== null && VALID_RESOLUTIONS.has(r.resolution))
      .reduce((sum, r) => sum + parseInt(r.count, 10), 0);

    console.log('=========================================================');
    console.log('  SUMMARY');
    console.log('=========================================================');
    console.log(`  Total videos       : ${total.toLocaleString()}`);
    console.log(`  Valid resolutions  : ${validCount.toLocaleString()} (${pct(validCount, total)})`);
    console.log(`  NULL (corrupted)   : ${nullCount.toLocaleString()} (${pct(nullCount, total)})`);
    console.log(`  Invalid values     : ${invalidRows.length === 0 ? '0' : invalidRows.reduce((s, r) => s + parseInt(r.count, 10), 0).toLocaleString()}`);
    console.log(`  Migration status   : ${exitCode === 0 ? 'SUCCESS' : 'NEEDS ATTENTION'}`);
    console.log('=========================================================');
    console.log('');

  } catch (err) {
    console.error('[ERROR] Verification failed:', err.message);
    exitCode = 1;
  } finally {
    await pool.end();
  }

  process.exit(exitCode);
}

main();
