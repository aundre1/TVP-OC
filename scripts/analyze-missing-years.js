#!/usr/bin/env node

/**
 * THE VIDEO POOL — Missing Year Analysis Script
 *
 * Analyses the release_year field across all videos in the database and
 * reports which records are missing a year value (NULL or 0).
 *
 * This script is READ-ONLY — it does not modify any data.
 * Run it before and after populate-missing-years.js to measure the impact.
 *
 * Usage (from the project root):
 *   DATABASE_URL="postgresql://..." NODE_PATH=server/node_modules node scripts/analyze-missing-years.js
 *
 * Or with a local .env file already containing DATABASE_URL:
 *   NODE_PATH=server/node_modules node scripts/analyze-missing-years.js
 *
 * Exit codes:
 *   0 — Analysis completed successfully
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

// Try loading .env from project root, then server/.env
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
    'node scripts/analyze-missing-years.js'
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
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of missing-year records to display in the detail table */
const DISPLAY_LIMIT = 20;

/** Maximum number of year-distribution buckets to show */
const DISTRIBUTION_LIMIT = 10;

// ---------------------------------------------------------------------------
// Query functions
// ---------------------------------------------------------------------------

/**
 * Fetch up to DISPLAY_LIMIT videos that have a NULL or zero release_year,
 * ordered by created_at descending so the newest ingested records appear first.
 *
 * @param {pg.Pool} db
 * @returns {Promise<Array<{id: number, artist: string, title: string, genre: string, created_at: Date}>>}
 */
async function fetchMissingYearVideos(db) {
  const result = await db.query(
    `
    SELECT
      id,
      artist,
      title,
      genre,
      created_at
    FROM   videos
    WHERE  release_year IS NULL
       OR  release_year = 0
    ORDER  BY created_at DESC
    LIMIT  $1
    `,
    [DISPLAY_LIMIT]
  );
  return result.rows;
}

/**
 * Fetch summary statistics for the release_year field.
 *
 * @param {pg.Pool} db
 * @returns {Promise<{
 *   totalVideos: number,
 *   missingYearCount: number,
 *   earliestYear: number|null,
 *   latestYear: number|null,
 *   uniqueYearCount: number
 * }>}
 */
async function fetchSummaryStats(db) {
  const result = await db.query(
    `
    SELECT
      COUNT(*)                                         AS total_videos,
      COUNT(*) FILTER (WHERE release_year IS NULL
                          OR release_year = 0)         AS missing_year_count,
      MIN(release_year) FILTER (WHERE release_year > 0) AS earliest_year,
      MAX(release_year) FILTER (WHERE release_year > 0) AS latest_year,
      COUNT(DISTINCT release_year)
        FILTER (WHERE release_year IS NOT NULL
                  AND release_year > 0)               AS unique_year_count
    FROM videos
    `
  );
  const row = result.rows[0];
  return {
    totalVideos:     parseInt(row.total_videos, 10),
    missingYearCount: parseInt(row.missing_year_count, 10),
    earliestYear:    row.earliest_year != null ? parseInt(row.earliest_year, 10) : null,
    latestYear:      row.latest_year   != null ? parseInt(row.latest_year,   10) : null,
    uniqueYearCount: parseInt(row.unique_year_count, 10),
  };
}

/**
 * Fetch the top DISTRIBUTION_LIMIT years by video count for videos that have
 * a populated release_year, ordered by count descending.
 *
 * @param {pg.Pool} db
 * @returns {Promise<Array<{release_year: number, video_count: number}>>}
 */
async function fetchYearDistribution(db) {
  const result = await db.query(
    `
    SELECT
      release_year,
      COUNT(*) AS video_count
    FROM   videos
    WHERE  release_year IS NOT NULL
      AND  release_year > 0
    GROUP  BY release_year
    ORDER  BY video_count DESC
    LIMIT  $1
    `,
    [DISTRIBUTION_LIMIT]
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
  console.log('  THE VIDEO POOL — Missing Year Analysis');
  console.log('  Identifies videos with NULL or zero release_year');
  console.log(banner);
  console.log('');

  try {
    // -----------------------------------------------------------------
    // STEP 1: Summary statistics
    // -----------------------------------------------------------------
    console.log('Fetching summary statistics...');
    const stats = await fetchSummaryStats(pool);
    const missingPct = stats.totalVideos > 0
      ? ((stats.missingYearCount / stats.totalVideos) * 100).toFixed(1)
      : '0.0';

    console.log('');
    console.log(banner);
    console.log('  SUMMARY');
    console.log(banner);
    console.log(`  Total videos in database     : ${stats.totalVideos.toLocaleString()}`);
    console.log(`  Missing release_year (NULL/0) : ${stats.missingYearCount.toLocaleString()} (${missingPct}%)`);
    console.log(`  Earliest year in database    : ${stats.earliestYear ?? 'N/A'}`);
    console.log(`  Latest year in database      : ${stats.latestYear   ?? 'N/A'}`);
    console.log(`  Unique year values           : ${stats.uniqueYearCount.toLocaleString()}`);
    console.log(banner);
    console.log('');

    // -----------------------------------------------------------------
    // STEP 2: Year distribution (top 10)
    // -----------------------------------------------------------------
    console.log(`Top ${DISTRIBUTION_LIMIT} years by video count:`);
    console.log('');

    const distribution = await fetchYearDistribution(pool);

    if (distribution.length === 0) {
      console.log('  No videos with a populated release_year found.');
    } else {
      console.log(col('Year', 10) + col('Videos', 10) + 'Bar');
      console.log('-'.repeat(50));

      const maxCount = parseInt(distribution[0].video_count, 10);

      for (const row of distribution) {
        const count    = parseInt(row.video_count, 10);
        const barLen   = maxCount > 0 ? Math.round((count / maxCount) * 30) : 0;
        const bar      = '#'.repeat(barLen);

        console.log(
          col(row.release_year, 10) +
          col(count.toLocaleString(), 10) +
          bar
        );
      }
      console.log('-'.repeat(50));
    }

    console.log('');

    // -----------------------------------------------------------------
    // STEP 3: Detail view of missing-year records
    // -----------------------------------------------------------------
    if (stats.missingYearCount === 0) {
      console.log('No videos with missing release_year found. All records are populated.');
    } else {
      console.log(
        `Found ${stats.missingYearCount.toLocaleString()} video(s) with missing ` +
        `release_year (showing first ${DISPLAY_LIMIT}):`
      );
      console.log('');

      const missingVideos = await fetchMissingYearVideos(pool);

      console.log(
        col('ID', 8) +
        col('Artist - Title', 42) +
        col('Genre', 16) +
        'createdAt'
      );
      console.log('-'.repeat(80));

      for (const row of missingVideos) {
        const label = truncate(`${row.artist} - ${row.title}`, 40);
        console.log(
          col(row.id, 8) +
          col(label, 42) +
          col(truncate(row.genre, 14), 16) +
          formatDate(row.created_at)
        );
      }

      console.log('-'.repeat(80));
      console.log('');

      if (stats.missingYearCount > DISPLAY_LIMIT) {
        console.log(
          `  ... and ${(stats.missingYearCount - DISPLAY_LIMIT).toLocaleString()} more ` +
          'records not shown.'
        );
        console.log('');
      }

      console.log(
        'To populate these records, run:\n' +
        '  NODE_PATH=server/node_modules node scripts/populate-missing-years.js'
      );
    }

    console.log('');

  } catch (err) {
    console.error('[ERROR] Analysis failed:', err.message);
    console.error(err.stack);
    exitCode = 1;
  } finally {
    await pool.end();
  }

  process.exit(exitCode);
}

main();
