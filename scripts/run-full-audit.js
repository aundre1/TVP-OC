#!/usr/bin/env node

/**
 * THE VIDEO POOL — Comprehensive Audit Verification Script
 *
 * Verifies that migrations 020, 021, and 022 have all been applied correctly
 * by running four structured audit sections against the live database.
 *
 * Sections:
 *   1. Resolution Standardization  (Migration 020)
 *   2. Corrupted Records           (Migration 021)
 *   3. Missing Year Metadata       (Migration 022)
 *   4. Overall Data Quality        (Summary)
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/run-full-audit.js
 *
 * The script resolves DATABASE_URL from the environment or from server/.env
 * automatically when run from the project root.
 *
 * Exit codes:
 *   0 — All audit checks passed
 *   1 — One or more checks failed, or a database error occurred
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// ---------------------------------------------------------------------------
// Environment setup
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Load .env from project root first, then server/.env (server wins if both set)
dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config({ path: path.join(projectRoot, 'server', '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(
    '\n[ERROR] DATABASE_URL is not set.\n' +
    'Set it before running this script:\n' +
    '  DATABASE_URL="postgresql://user:pass@host:5432/db" node scripts/run-full-audit.js\n'
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Database connection pool
// ---------------------------------------------------------------------------

const { Pool } = pg;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  connectionTimeoutMillis: 15000,
});

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/**
 * Format a number as a percentage of a total, rounded to one decimal place.
 * Returns "0.0%" when total is zero to avoid division-by-zero.
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
 * Right-pad a string or number to a minimum column width.
 *
 * @param {string|number|null} val
 * @param {number} width
 * @returns {string}
 */
function padRight(val, width) {
  const s = String(val ?? 'NULL');
  return s.length >= width ? s : s + ' '.repeat(width - s.length);
}

/**
 * Left-pad a numeric string for right-aligned columns.
 *
 * @param {string|number} val
 * @param {number} width
 * @returns {string}
 */
function padLeft(val, width) {
  const s = String(val ?? '0');
  return s.length >= width ? s : ' '.repeat(width - s.length) + s;
}

const DIVIDER = '-'.repeat(60);
const THICK_DIVIDER = '='.repeat(60);

// ---------------------------------------------------------------------------
// Audit section runners
// ---------------------------------------------------------------------------

/**
 * Section 1: Resolution Standardization
 * Validates that migration 020 converted all resolution values to the
 * canonical set: '1080p' | '720p' | '480p' | '360p' | NULL.
 *
 * @param {pg.Pool} db
 * @returns {Promise<{ passed: boolean, invalidCount: number }>}
 */
async function auditResolutionStandardization(db) {
  console.log('\n1️⃣  RESOLUTION STANDARDIZATION');
  console.log(DIVIDER);

  const [distResult, invalidResult] = await Promise.all([
    // All distinct resolution values and their counts
    db.query(`
      SELECT
        resolution,
        COUNT(*) AS count
      FROM videos
      GROUP BY resolution
      ORDER BY COUNT(*) DESC
    `),

    // Any resolution value that is not in the allowed set and not NULL
    db.query(`
      SELECT
        resolution,
        COUNT(*) AS count
      FROM videos
      WHERE resolution IS NOT NULL
        AND resolution NOT IN ('1080p', '720p', '480p', '360p')
      GROUP BY resolution
      ORDER BY COUNT(*) DESC
    `),
  ]);

  const totalResult = await db.query('SELECT COUNT(*) AS total FROM videos');
  const total = parseInt(totalResult.rows[0].total, 10);

  // Print distribution table
  console.log(`\n  ${ padRight('Resolution', 12) }  ${ padLeft('Count', 8) }  ${ padLeft('Pct', 7) }`);
  console.log(`  ${ '-'.repeat(12) }  ${ '-'.repeat(8) }  ${ '-'.repeat(7) }`);

  for (const row of distResult.rows) {
    const label = row.resolution ?? 'NULL (corrupted)';
    const count = parseInt(row.count, 10);
    console.log(`  ${ padRight(label, 12) }  ${ padLeft(count.toLocaleString(), 8) }  ${ padLeft(pct(count, total), 7) }`);
  }

  console.log('');

  const invalidCount = invalidResult.rows.reduce(
    (sum, r) => sum + parseInt(r.count, 10),
    0
  );

  if (invalidCount === 0) {
    console.log(`  Invalid resolutions: 0`);
    console.log('  All values are in (1080p, 720p, 480p, 360p, NULL).');
    return { passed: true, invalidCount: 0 };
  }

  console.log(`  INVALID resolutions found: ${invalidCount.toLocaleString()} rows`);
  for (const row of invalidResult.rows) {
    console.log(`    "${row.resolution}" — ${parseInt(row.count, 10).toLocaleString()} rows`);
  }
  console.log('  Action: Re-run migration 020 via POST /api/admin/run-migrations');
  return { passed: false, invalidCount };
}

/**
 * Section 2: Corrupted Records (Flagged for Review)
 * Reports on records in video_resolution_issues, created by migration 021.
 * Handles the case where the table does not yet exist.
 *
 * @param {pg.Pool} db
 * @returns {Promise<{ passed: boolean, totalFlagged: number }>}
 */
async function auditCorruptedRecords(db) {
  console.log('\n2️⃣  CORRUPTED RECORDS (Flagged for Review)');
  console.log(DIVIDER);

  // Check whether migration 021 has run (table may not exist yet)
  const tableCheckResult = await db.query(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_name = 'video_resolution_issues'
    ) AS table_exists
  `);

  const tableExists = tableCheckResult.rows[0].table_exists;

  if (!tableExists) {
    console.log('\n  video_resolution_issues table does not exist.');
    console.log('  Migration 021 has not been applied yet.');
    console.log('  Action: Apply migration 021 via POST /api/admin/run-migrations');
    return { passed: false, totalFlagged: 0 };
  }

  const issueResult = await db.query(`
    SELECT
      issue_type,
      COUNT(*) AS count
    FROM video_resolution_issues
    GROUP BY issue_type
    ORDER BY COUNT(*) DESC
  `);

  const totalFlagged = issueResult.rows.reduce(
    (sum, r) => sum + parseInt(r.count, 10),
    0
  );

  if (totalFlagged === 0) {
    console.log('\n  No corrupted records flagged.');
    return { passed: true, totalFlagged: 0 };
  }

  console.log(`\n  Total flagged records: ${totalFlagged.toLocaleString()}`);
  console.log('');
  console.log(`  ${ padRight('Issue Type', 20) }  ${ padLeft('Count', 8) }`);
  console.log(`  ${ '-'.repeat(20) }  ${ '-'.repeat(8) }`);

  for (const row of issueResult.rows) {
    console.log(
      `  ${ padRight(row.issue_type, 20) }  ${ padLeft(parseInt(row.count, 10).toLocaleString(), 8) }`
    );
  }

  console.log('\n  These records are tracked in video_resolution_issues and');
  console.log('  require manual review with Steve to verify underlying video files.');

  // Flagged records are expected — this is informational, not a failure
  return { passed: true, totalFlagged };
}

/**
 * Section 3: Missing Year Metadata
 * Verifies that migration 022 populated release_year for all videos that
 * previously had NULL or zero values.
 *
 * @param {pg.Pool} db
 * @returns {Promise<{ passed: boolean, missingCount: number, totalVideos: number }>}
 */
async function auditMissingYearMetadata(db) {
  console.log('\n3️⃣  MISSING YEAR METADATA');
  console.log(DIVIDER);

  const [totalResult, missingResult] = await Promise.all([
    db.query('SELECT COUNT(*) AS total FROM videos'),
    db.query(`
      SELECT COUNT(*) AS missing
      FROM videos
      WHERE release_year IS NULL OR release_year = 0
    `),
  ]);

  const total = parseInt(totalResult.rows[0].total, 10);
  const missing = parseInt(missingResult.rows[0].missing, 10);
  const present = total - missing;
  const missingPct = pct(missing, total);

  console.log('');
  console.log(`  Total videos       : ${total.toLocaleString()}`);
  console.log(`  Have release_year  : ${present.toLocaleString()} (${ pct(present, total) })`);
  console.log(`  Missing year       : ${missing.toLocaleString()} (${missingPct})`);
  console.log('');

  if (missing === 0) {
    console.log(`  ${present.toLocaleString()} videos have release_year populated.`);
    return { passed: true, missingCount: 0, totalVideos: total };
  }

  if ((missing / total) < 0.05) {
    console.log('  Less than 5% missing — acceptable threshold.');
    console.log('  Action: Re-run migration 022 to fill remaining gaps.');
    return { passed: true, missingCount: missing, totalVideos: total };
  }

  console.log(`  WARNING: More than 5% of videos (${missingPct}) are missing release_year.`);
  console.log('  Action: Apply migration 022 via POST /api/admin/run-migrations');
  return { passed: false, missingCount: missing, totalVideos: total };
}

/**
 * Section 4: Overall Data Quality Summary
 * Consolidates results from sections 1–3 into a final checklist.
 *
 * @param {{ resolution: object, corrupted: object, years: object }} results
 */
function printDataQualitySummary(results) {
  console.log('\n4️⃣  OVERALL DATA QUALITY');
  console.log(DIVIDER);
  console.log('');

  const { resolution, corrupted, years } = results;

  // Resolution labels check
  const resolutionStatus = resolution.invalidCount === 0
    ? 'Standardized'
    : `${resolution.invalidCount.toLocaleString()} invalid values remain`;
  const resolutionIcon = resolution.passed ? '' : '';
  console.log(`  ${resolutionIcon} Resolution labels      : ${resolutionStatus}`);

  // Corrupted records check
  const corruptedStatus = corrupted.totalFlagged === 0
    ? 'Fixed (none flagged)'
    : `${corrupted.totalFlagged.toLocaleString()} record(s) flagged for review`;
  const corruptedIcon = corrupted.passed ? '' : '';
  console.log(`  ${corruptedIcon} Corrupted records      : ${corruptedStatus}`);

  // Year metadata check
  let yearStatus;
  if (years.missingCount === 0) {
    yearStatus = 'Complete';
  } else if ((years.missingCount / years.totalVideos) < 0.05) {
    yearStatus = `Mostly filled (${years.missingCount.toLocaleString()} gaps < 5%)`;
  } else {
    yearStatus = `${years.missingCount.toLocaleString()} missing (${pct(years.missingCount, years.totalVideos)})`;
  }
  const yearIcon = years.passed ? '' : '';
  console.log(`  ${yearIcon} Year metadata          : ${yearStatus}`);

  console.log('');

  const allPassed = resolution.passed && corrupted.passed && years.passed;

  if (allPassed) {
    console.log(THICK_DIVIDER);
    console.log('  AUDIT COMPLETE — All fixes verified!');
    console.log(THICK_DIVIDER);
  } else {
    console.log(THICK_DIVIDER);
    console.log('  AUDIT INCOMPLETE — One or more checks need attention.');
    console.log('  Review the sections above for remediation steps.');
    console.log(THICK_DIVIDER);
  }

  return allPassed;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

async function main() {
  console.log('');
  console.log(THICK_DIVIDER);
  console.log('  THE VIDEO POOL — Full Audit Verification');
  console.log('  Migrations 020, 021, 022 Post-Run Check');
  console.log(`  Run date : ${new Date().toISOString()}`);
  console.log(THICK_DIVIDER);

  let exitCode = 0;

  try {
    // Verify the connection before running any queries
    await pool.query('SELECT 1');
    console.log('\n  Database connection: OK');

    // Run all four sections sequentially so output is ordered and readable
    const resolutionResult = await auditResolutionStandardization(pool);
    const corruptedResult = await auditCorruptedRecords(pool);
    const yearsResult = await auditMissingYearMetadata(pool);

    const allPassed = printDataQualitySummary({
      resolution: resolutionResult,
      corrupted: corruptedResult,
      years: yearsResult,
    });

    exitCode = allPassed ? 0 : 1;

  } catch (err) {
    console.error('\n[ERROR] Audit failed with an unexpected error:');
    console.error(`  ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
      console.error(err.stack);
    }
    exitCode = 1;
  } finally {
    await pool.end();
  }

  process.exit(exitCode);
}

main();
