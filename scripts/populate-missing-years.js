#!/usr/bin/env node

/**
 * THE VIDEO POOL — Missing Year Population Script
 *
 * Fills NULL and zero release_year values on the videos table by extracting
 * the year from each video's created_at timestamp.
 *
 * Strategy: Most videos were uploaded around the same time they were released,
 * so EXTRACT(YEAR FROM created_at) is a reasonable fallback that is far more
 * useful for filtering than NULL.
 *
 * This script performs a single UPDATE and then reports how many rows were
 * populated, how many still remain (if any), and shows a sample of five
 * successfully filled records for spot-checking.
 *
 * Run analyze-missing-years.js before and after this script to verify results.
 *
 * Usage (from the project root):
 *   DATABASE_URL="postgresql://..." NODE_PATH=server/node_modules node scripts/populate-missing-years.js
 *
 * Or with a local .env file already containing DATABASE_URL:
 *   NODE_PATH=server/node_modules node scripts/populate-missing-years.js
 *
 * Exit codes:
 *   0 — Population completed (even if some gaps remain after update)
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

// Load .env from project root, then server/.env (whichever has DATABASE_URL)
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
    '  DATABASE_URL="postgresql://user:pass@host:5432/db" ' +
    'node scripts/populate-missing-years.js'
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
 * Count videos that currently have a missing release_year (NULL or 0).
 *
 * @param {pg.Pool} db
 * @returns {Promise<number>}
 */
async function countMissingYears(db) {
  const result = await db.query(
    `
    SELECT COUNT(*) AS count
    FROM   videos
    WHERE  release_year IS NULL
       OR  release_year = 0
    `
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * Populate release_year from created_at for all videos where the year is
 * missing. Uses EXTRACT(YEAR FROM created_at)::INT as the fallback value.
 *
 * Returns the number of rows updated (rowCount from pg).
 *
 * @param {pg.Pool} db
 * @returns {Promise<number>}
 */
async function populateMissingYears(db) {
  const result = await db.query(
    `
    UPDATE videos
    SET    release_year = EXTRACT(YEAR FROM created_at)::INT,
           updated_at   = NOW()
    WHERE  (release_year IS NULL OR release_year = 0)
      AND  created_at IS NOT NULL
    `
  );
  return result.rowCount;
}

/**
 * Fetch a sample of videos whose release_year matches the year derived from
 * their created_at. This confirms the population logic worked as expected.
 *
 * @param {pg.Pool} db
 * @param {number} limit
 * @returns {Promise<Array<{id: number, title: string, artist: string, release_year: number, created_at: Date}>>}
 */
async function fetchFilledSample(db, limit) {
  const result = await db.query(
    `
    SELECT
      id,
      title,
      artist,
      release_year,
      created_at
    FROM   videos
    WHERE  release_year IS NOT NULL
      AND  release_year = EXTRACT(YEAR FROM created_at)::INT
    ORDER  BY updated_at DESC, id DESC
    LIMIT  $1
    `,
    [limit]
  );
  return result.rows;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/**
 * Right-pad a value to a fixed column width for aligned table output.
 *
 * @param {string|number|null} val
 * @param {number} width
 * @returns {string}
 */
function col(val, width) {
  const s = String(val ?? 'N/A');
  return s.length >= width ? s : s + ' '.repeat(width - s.length);
}

/**
 * Truncate a string to a maximum length, appending '...' if the string
 * exceeds the limit.
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
 * Format a Date object or ISO string as a YYYY-MM-DD string.
 *
 * @param {Date|string|null} dateVal
 * @returns {string}
 */
function formatDate(dateVal) {
  if (dateVal == null) return 'N/A';
  return new Date(dateVal).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const banner = '='.repeat(70);
  let exitCode = 0;

  console.log('');
  console.log(banner);
  console.log('  THE VIDEO POOL — Missing Year Population');
  console.log('  Fills NULL/zero release_year from created_at timestamp');
  console.log(banner);
  console.log('');

  try {
    // -----------------------------------------------------------------
    // STEP 1: Count missing years BEFORE the update
    // -----------------------------------------------------------------
    console.log('STEP 1: Counting videos with missing release_year (before update)...');
    const countBefore = await countMissingYears(pool);
    console.log(`  Before: ${countBefore.toLocaleString()} video(s) with missing release_year`);
    console.log('');

    if (countBefore === 0) {
      console.log('  All videos already have a populated release_year. Nothing to do.');
      console.log('');
      console.log(banner);
      console.log('  COMPLETE — No changes made');
      console.log(banner);
      console.log('');
      return;
    }

    // -----------------------------------------------------------------
    // STEP 2: Run the UPDATE
    // -----------------------------------------------------------------
    console.log('STEP 2: Populating release_year from created_at...');
    const rowsUpdated = await populateMissingYears(pool);
    console.log(`  Updated: ${rowsUpdated.toLocaleString()} row(s) populated.`);
    console.log('');

    // -----------------------------------------------------------------
    // STEP 3: Count missing years AFTER the update
    // -----------------------------------------------------------------
    console.log('STEP 3: Counting videos with missing release_year (after update)...');
    const countAfter = await countMissingYears(pool);
    const countFilled = countBefore - countAfter;

    console.log(`  After:  ${countAfter.toLocaleString()} video(s) still missing release_year`);
    console.log('');

    // -----------------------------------------------------------------
    // STEP 4: Sample of filled records
    // -----------------------------------------------------------------
    console.log('STEP 4: Sample of filled records (5 most recently updated):');
    console.log('');

    const sample = await fetchFilledSample(pool, 5);

    if (sample.length === 0) {
      console.log('  No recently filled records to display.');
    } else {
      console.log(
        col('ID', 8) +
        col('Title', 28) +
        col('Artist', 22) +
        col('Year', 6) +
        'createdAt'
      );
      console.log('-'.repeat(76));

      for (const row of sample) {
        console.log(
          col(row.id, 8) +
          col(truncate(row.title, 26), 28) +
          col(truncate(row.artist, 20), 22) +
          col(row.release_year, 6) +
          formatDate(row.created_at)
        );
      }

      console.log('-'.repeat(76));
    }

    console.log('');

    // -----------------------------------------------------------------
    // Final summary
    // -----------------------------------------------------------------
    console.log(banner);
    console.log('  RESULT SUMMARY');
    console.log(banner);
    console.log(`  Before: ${countBefore.toLocaleString()} videos with missing release_year`);
    console.log(`  After:  ${countAfter.toLocaleString()} videos with missing release_year`);
    console.log(`  Filled: ${countFilled.toLocaleString()} videos`);

    if (countAfter === 0) {
      console.log('');
      console.log(
        `  All ${countFilled.toLocaleString()} missing year(s) have been populated ` +
        'from created_at.'
      );
    } else {
      console.log('');
      console.log(
        `  ${countAfter.toLocaleString()} video(s) still have a missing release_year. ` +
        'These rows likely have NULL created_at values.'
      );
      console.log(
        '  Investigate with:\n' +
        '    SELECT id, title, artist, created_at\n' +
        '    FROM   videos\n' +
        '    WHERE  (release_year IS NULL OR release_year = 0)\n' +
        '      AND  created_at IS NULL;'
      );
    }

    console.log(banner);
    console.log('');

  } catch (err) {
    console.error('[ERROR] Population script failed:', err.message);
    console.error(err.stack);
    exitCode = 1;
  } finally {
    await pool.end();
  }

  process.exit(exitCode);
}

main();
