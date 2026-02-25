#!/usr/bin/env node
// ===========================================
// THE VIDEO POOL - Database Export Check
// Verifies current video count and sample data
//
// Usage:
//   node export-check.js
//   node export-check.js --limit 10   (more sample rows)
//   node export-check.js --genre "Hip-Hop"
// ===========================================

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// ===========================================
// DATABASE CONNECTION
// ===========================================

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    connectionTimeoutMillis: 10000,
  });
}

// ===========================================
// ARG PARSING
// ===========================================

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = { limit: 5, genre: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) opts.limit = parseInt(args[++i], 10) || 5;
    if (args[i] === '--genre' && args[i + 1]) opts.genre = args[++i];
  }
  return opts;
}

// ===========================================
// HELPERS
// ===========================================

function pad(str, len) {
  return String(str).padEnd(len);
}

function padLeft(str, len) {
  return String(str).padStart(len);
}

function formatDuration(seconds) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ===========================================
// MAIN
// ===========================================

async function main() {
  const opts = parseArgs(process.argv);

  console.log('');
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║     THE VIDEO POOL — Database Export Check        ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log('');

  let pool;
  try {
    pool = createPool();
    await pool.query('SELECT 1');
    console.log('  Connected to database.\n');
  } catch (err) {
    console.error(`ERROR: Cannot connect to database: ${err.message}`);
    console.error('Make sure DATABASE_URL is set in your .env file.');
    process.exit(1);
  }

  // ---- Total counts ----
  const [
    videoCount,
    versionCount,
    activeCount,
    featuredCount,
    explicitCount,
  ] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM videos'),
    pool.query('SELECT COUNT(*) FROM video_versions'),
    pool.query('SELECT COUNT(*) FROM videos WHERE is_active = true'),
    pool.query('SELECT COUNT(*) FROM videos WHERE is_featured = true'),
    pool.query('SELECT COUNT(*) FROM videos WHERE is_explicit = true'),
  ]);

  const total = parseInt(videoCount.rows[0].count);
  const totalVersions = parseInt(versionCount.rows[0].count);
  const totalActive = parseInt(activeCount.rows[0].count);
  const totalFeatured = parseInt(featuredCount.rows[0].count);
  const totalExplicit = parseInt(explicitCount.rows[0].count);

  console.log('  ── TOTALS ──────────────────────────────────────────');
  console.log(`  Total videos       : ${total.toLocaleString()}`);
  console.log(`  Active videos      : ${totalActive.toLocaleString()}`);
  console.log(`  Video versions     : ${totalVersions.toLocaleString()}`);
  console.log(`  Featured           : ${totalFeatured.toLocaleString()}`);
  console.log(`  Explicit           : ${totalExplicit.toLocaleString()}`);
  console.log(`  Clean              : ${(total - totalExplicit).toLocaleString()}`);
  console.log('');

  if (total === 0) {
    console.log('  No videos in database. Run the import script to add videos.');
    console.log('  Example: node src/scripts/import-videos.js --file videos.csv --format csv');
    console.log('');
    await pool.end();
    return;
  }

  // ---- Genre breakdown ----
  const genreResult = await pool.query(`
    SELECT genre, COUNT(*) as count
    FROM videos
    GROUP BY genre
    ORDER BY count DESC
    LIMIT 20
  `);

  console.log('  ── BY GENRE ────────────────────────────────────────');
  genreResult.rows.forEach(row => {
    const bar = '█'.repeat(Math.min(Math.round(row.count / Math.max(total, 1) * 30), 30));
    console.log(`  ${pad(row.genre, 20)} ${padLeft(parseInt(row.count).toLocaleString(), 7)}  ${bar}`);
  });
  console.log('');

  // ---- BPM stats ----
  const bpmResult = await pool.query(`
    SELECT
      MIN(bpm) as min_bpm,
      MAX(bpm) as max_bpm,
      ROUND(AVG(bpm)) as avg_bpm,
      COUNT(*) FILTER (WHERE bpm IS NOT NULL) as has_bpm
    FROM videos
  `);
  const bpm = bpmResult.rows[0];

  // ---- Release year range ----
  const yearResult = await pool.query(`
    SELECT MIN(release_year) as min_year, MAX(release_year) as max_year
    FROM videos
    WHERE release_year IS NOT NULL
  `);
  const years = yearResult.rows[0];

  // ---- Quality breakdown (from video_versions) ----
  const qualityResult = await pool.query(`
    SELECT quality, COUNT(*) as count
    FROM video_versions
    GROUP BY quality
    ORDER BY count DESC
  `);

  // ---- Version type breakdown ----
  const versionTypeResult = await pool.query(`
    SELECT version_type, COUNT(*) as count
    FROM video_versions
    GROUP BY version_type
    ORDER BY count DESC
  `);

  console.log('  ── METADATA ────────────────────────────────────────');
  console.log(`  BPM range       : ${bpm.min_bpm || '--'} – ${bpm.max_bpm || '--'} (avg ${bpm.avg_bpm || '--'})`);
  console.log(`  With BPM data   : ${parseInt(bpm.has_bpm).toLocaleString()} / ${total.toLocaleString()}`);
  console.log(`  Release years   : ${years.min_year || '--'} – ${years.max_year || '--'}`);
  console.log('');

  if (qualityResult.rows.length > 0) {
    console.log('  ── VIDEO VERSIONS ──────────────────────────────────');
    qualityResult.rows.forEach(row => {
      console.log(`  Quality ${pad(row.quality, 8)} : ${parseInt(row.count).toLocaleString()} versions`);
    });
    versionTypeResult.rows.forEach(row => {
      console.log(`  Type    ${pad(row.version_type, 8)} : ${parseInt(row.count).toLocaleString()} versions`);
    });
    console.log('');
  }

  // ---- Decade breakdown ----
  const decadeResult = await pool.query(`
    SELECT decade, COUNT(*) as count
    FROM videos
    WHERE decade IS NOT NULL
    GROUP BY decade
    ORDER BY decade DESC
    LIMIT 10
  `);

  if (decadeResult.rows.length > 0) {
    console.log('  ── BY DECADE ───────────────────────────────────────');
    decadeResult.rows.forEach(row => {
      console.log(`  ${pad(row.decade, 8)} : ${parseInt(row.count).toLocaleString()}`);
    });
    console.log('');
  }

  // ---- Top artists ----
  const artistResult = await pool.query(`
    SELECT artist, COUNT(*) as count
    FROM videos
    GROUP BY artist
    ORDER BY count DESC
    LIMIT 10
  `);

  console.log('  ── TOP ARTISTS (by video count) ────────────────────');
  artistResult.rows.forEach((row, i) => {
    console.log(`  ${padLeft(i + 1, 2)}. ${pad(row.artist, 30)} ${parseInt(row.count)} videos`);
  });
  console.log('');

  // ---- Sample videos ----
  const whereClause = opts.genre ? `WHERE genre = $1` : '';
  const queryParams = opts.genre ? [opts.genre] : [];

  const sampleResult = await pool.query(
    `SELECT
      v.id, v.title, v.artist, v.genre, v.subgenre,
      v.bpm, v.key, v.camelot_key, v.duration,
      v.release_year, v.is_explicit, v.download_count,
      v.is_featured,
      (SELECT COUNT(*) FROM video_versions vv WHERE vv.video_id = v.id) as version_count
    FROM videos v
    ${whereClause}
    ORDER BY v.created_at DESC
    LIMIT $${queryParams.length + 1}`,
    [...queryParams, opts.limit]
  );

  const heading = opts.genre ? `SAMPLE (${opts.genre})` : 'SAMPLE (most recent)';
  console.log(`  ── ${heading} ─────────────────────────────────────`);
  console.log(`  ${'ID'.padEnd(6)} ${'Artist'.padEnd(22)} ${'Title'.padEnd(30)} ${'Genre'.padEnd(12)} BPM  Key    Dur   Exp Ver`);
  console.log(`  ${'─'.repeat(6)} ${'─'.repeat(22)} ${'─'.repeat(30)} ${'─'.repeat(12)} ─── ──── ───── ─── ───`);

  sampleResult.rows.forEach(row => {
    console.log(
      `  ${padLeft(row.id, 6)} ` +
      `${pad(row.artist?.slice(0, 22), 22)} ` +
      `${pad(row.title?.slice(0, 30), 30)} ` +
      `${pad(row.genre?.slice(0, 12), 12)} ` +
      `${padLeft(row.bpm || '--', 3)} ` +
      `${pad(row.key || '--', 4)} ` +
      `${pad(formatDuration(row.duration), 5)} ` +
      `${row.is_explicit ? 'EXP' : '   '} ` +
      `${padLeft(row.version_count || 0, 3)}`
    );
  });
  console.log('');

  // ---- Import batch history (if available) ----
  const batchResult = await pool.query(`
    SELECT import_batch_id, COUNT(*) as count
    FROM videos
    WHERE import_batch_id IS NOT NULL
    GROUP BY import_batch_id
    ORDER BY MIN(created_at) DESC
    LIMIT 5
  `);

  if (batchResult.rows.length > 0) {
    console.log('  ── RECENT IMPORT BATCHES ───────────────────────────');
    batchResult.rows.forEach(row => {
      console.log(`  ${pad(row.import_batch_id, 30)} : ${parseInt(row.count).toLocaleString()} videos`);
    });
    console.log('');
  }

  // ---- Videos missing key data ----
  const missingDataResult = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE bpm IS NULL)          AS no_bpm,
      COUNT(*) FILTER (WHERE key IS NULL)           AS no_key,
      COUNT(*) FILTER (WHERE camelot_key IS NULL)   AS no_camelot,
      COUNT(*) FILTER (WHERE thumbnail_url IS NULL) AS no_thumbnail,
      COUNT(*) FILTER (WHERE duration IS NULL)      AS no_duration,
      COUNT(*) FILTER (WHERE release_year IS NULL)  AS no_year
    FROM videos
  `);
  const missing = missingDataResult.rows[0];

  const hasMissing = Object.values(missing).some(v => parseInt(v) > 0);
  if (hasMissing) {
    console.log('  ── DATA COMPLETENESS ───────────────────────────────');
    if (parseInt(missing.no_bpm) > 0)        console.log(`  Missing BPM         : ${parseInt(missing.no_bpm).toLocaleString()} videos`);
    if (parseInt(missing.no_key) > 0)        console.log(`  Missing key         : ${parseInt(missing.no_key).toLocaleString()} videos`);
    if (parseInt(missing.no_camelot) > 0)    console.log(`  Missing camelot_key : ${parseInt(missing.no_camelot).toLocaleString()} videos`);
    if (parseInt(missing.no_thumbnail) > 0)  console.log(`  Missing thumbnail   : ${parseInt(missing.no_thumbnail).toLocaleString()} videos`);
    if (parseInt(missing.no_duration) > 0)   console.log(`  Missing duration    : ${parseInt(missing.no_duration).toLocaleString()} videos`);
    if (parseInt(missing.no_year) > 0)       console.log(`  Missing year        : ${parseInt(missing.no_year).toLocaleString()} videos`);
    console.log('');
  }

  console.log('  ── QUICK COMMANDS ──────────────────────────────────');
  console.log('  Import CSV   : node src/scripts/import-videos.js --file videos.csv --format csv');
  console.log('  Dry run      : node src/scripts/import-videos.js --file videos.csv --dry-run');
  console.log('  Check genre  : node src/scripts/export-check.js --genre "Hip-Hop"');
  console.log('  More samples : node src/scripts/export-check.js --limit 20');
  console.log('');

  await pool.end();
}

main().catch(err => {
  console.error('\nFATAL ERROR:', err.message);
  process.exit(1);
});
