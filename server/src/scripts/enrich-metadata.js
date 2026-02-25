#!/usr/bin/env node
// =============================================================================
// THE VIDEO POOL - Metadata Enrichment Script
// Reads videos from DB, runs ffprobe on each Wasabi URL, updates genre/year/label/bpm
//
// Usage:
//   railway run --service TVP-OC node src/scripts/enrich-metadata.js
//   railway run --service TVP-OC node src/scripts/enrich-metadata.js --dry-run
//   railway run --service TVP-OC node src/scripts/enrich-metadata.js --limit 10
//   railway run --service TVP-OC node src/scripts/enrich-metadata.js --dry-run --limit 5
// =============================================================================

import { execSync } from 'child_process';
import pg from 'pg';

const { Pool } = pg;

// ─── Config ───────────────────────────────────────────────────────────────────
const FFPROBE   = '/opt/homebrew/bin/ffprobe';
const BATCH     = 15;
const TIMEOUT   = 30_000; // 30 seconds per ffprobe call

// ─── CLI Flags ────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const LIMIT   = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : null;

if (DRY_RUN) console.log('[DRY RUN] No DB writes will occur.\n');
if (LIMIT)   console.log(`[LIMIT] Processing at most ${LIMIT} videos.\n`);

// ─── Genre Normalization ──────────────────────────────────────────────────────
const GENRE_MAP = [
  [/^hip[\s\-]*hop$/i,                           'Hip-Hop'],
  [/^(r\s*&\s*b|r\s*'\s*n\s*'\s*b|rnb|rhythm and blues)$/i, 'R&B'],
  [/^pop$/i,                                     'Pop'],
  [/^latina?$/i,                                 'Latin'],
  [/^(edm|electronic(?: dance music)?|dance)$/i, 'EDM'],
  [/^country$/i,                                 'Country'],
  [/^(reggae|reggaet[oe]n)$/i,                   'Reggaeton'],
  [/^rock$/i,                                    'Rock'],
  [/^(soul|neo[\s\-]soul)$/i,                    'Soul'],
  [/^jazz$/i,                                    'Jazz'],
  [/^gospel$/i,                                  'Gospel'],
  [/^classical$/i,                               'Classical'],
];

function normalizeGenre(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  for (const [pattern, canonical] of GENRE_MAP) {
    if (pattern.test(trimmed)) return canonical;
  }

  // Unknown genre: return titlecase as-is
  return trimmed.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

// ─── ffprobe Runner ───────────────────────────────────────────────────────────
/**
 * Run ffprobe on a remote URL and extract metadata.
 * Returns { genre, release_year, record_label, bpm } — any field may be null.
 * Returns null if ffprobe fails entirely.
 */
function getMetadata(fileUrl) {
  try {
    const cmd = `"${FFPROBE}" -v quiet -print_format json -show_entries format_tags "${fileUrl}"`;
    const stdout = execSync(cmd, { timeout: TIMEOUT, encoding: 'utf8' });

    let parsed;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      return null;
    }

    const tags = parsed?.format?.tags ?? {};

    // Normalize tag keys to lowercase for consistent access
    const t = {};
    for (const [k, v] of Object.entries(tags)) {
      t[k.toLowerCase()] = v;
    }

    // ── Genre ──────────────────────────────────────────────────────────────
    const rawGenre = t['genre'] ?? t['tcon'] ?? null;
    const genre = normalizeGenre(rawGenre);

    // ── Year ───────────────────────────────────────────────────────────────
    // Common tags: date, year, TDRC, TYER — may be full date ("2023-04-15") or just year
    const rawDate =
      t['date'] ?? t['year'] ?? t['tdrc'] ?? t['tyer'] ?? t['creation_time'] ?? null;
    let release_year = null;
    if (rawDate) {
      const yearMatch = String(rawDate).match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        const y = parseInt(yearMatch[0], 10);
        if (y >= 1950 && y <= new Date().getFullYear() + 1) release_year = y;
      }
    }

    // ── Label ──────────────────────────────────────────────────────────────
    // Common tags: label, organization, publisher, tpub, tcom (composer sometimes holds label)
    const record_label =
      t['label'] ??
      t['organization'] ??
      t['publisher'] ??
      t['tpub'] ??
      t['composer'] ??
      t['tcom'] ??
      null;

    // ── BPM ────────────────────────────────────────────────────────────────
    // Common tags: bpm, tbpm, TBPM
    const rawBpm = t['bpm'] ?? t['tbpm'] ?? null;
    let bpm = null;
    if (rawBpm) {
      const b = Math.round(parseFloat(rawBpm));
      if (!isNaN(b) && b > 0 && b < 400) bpm = b;
    }

    return {
      genre:         genre         ?? null,
      release_year:  release_year  ?? null,
      record_label:  record_label  ? String(record_label).slice(0, 255) : null,
      bpm:           bpm           ?? null,
    };
  } catch (err) {
    // Timeout or ffprobe error — return null so we skip gracefully
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set.');
    console.error('Run via: railway run --service TVP-OC node src/scripts/enrich-metadata.js');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // ── Fetch videos needing enrichment ──────────────────────────────────────
  let query = `
    SELECT DISTINCT ON (v.id)
      v.id,
      v.genre,
      v.release_year,
      v.record_label,
      v.bpm,
      vv.file_url
    FROM videos v
    JOIN video_versions vv ON vv.video_id = v.id
    WHERE (v.genre IS NULL OR v.genre = 'Unknown')
      AND vv.file_url IS NOT NULL
    ORDER BY v.id, vv.id
  `;

  if (LIMIT) query += ` LIMIT ${LIMIT}`;

  const { rows } = await pool.query(query);
  console.log(`Found ${rows.length} video(s) to enrich...\n`);

  if (rows.length === 0) {
    console.log('Nothing to do. All videos already have genre metadata.');
    await pool.end();
    process.exit(0);
  }

  // ── Stats tracking ────────────────────────────────────────────────────────
  let updated  = 0;
  let failed   = 0;
  let skipped  = 0;

  const statFields = { genre: 0, release_year: 0, record_label: 0, bpm: 0 };

  // ── Process in parallel batches ───────────────────────────────────────────
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);

    await Promise.allSettled(
      batch.map(async (row) => {
        const meta = getMetadata(row.file_url);

        if (!meta) {
          failed++;
          return;
        }

        // Check if there's anything worth updating
        const hasData =
          meta.genre        !== null ||
          meta.release_year !== null ||
          meta.record_label !== null ||
          meta.bpm          !== null;

        if (!hasData) {
          skipped++;
          return;
        }

        // Build SET clause — only update fields that have extracted values
        // Never overwrite existing non-null data with null
        const setClauses = [];
        const values     = [];
        let   idx        = 1;

        if (meta.genre !== null) {
          setClauses.push(`genre = $${idx++}`);
          values.push(meta.genre);
          statFields.genre++;
        }
        if (meta.release_year !== null) {
          setClauses.push(`release_year = $${idx++}`);
          values.push(meta.release_year);
          statFields.release_year++;
        }
        if (meta.record_label !== null) {
          setClauses.push(`record_label = $${idx++}`);
          values.push(meta.record_label);
          statFields.record_label++;
        }
        if (meta.bpm !== null) {
          setClauses.push(`bpm = $${idx++}`);
          values.push(meta.bpm);
          statFields.bpm++;
        }

        if (setClauses.length === 0) {
          skipped++;
          return;
        }

        values.push(row.id); // for WHERE clause

        if (DRY_RUN) {
          console.log(`\n  [DRY RUN] Would update video ${row.id}:`, {
            file_url:     row.file_url,
            genre:        meta.genre,
            release_year: meta.release_year,
            record_label: meta.record_label,
            bpm:          meta.bpm,
          });
          updated++;
          return;
        }

        try {
          await pool.query(
            `UPDATE videos SET ${setClauses.join(', ')} WHERE id = $${idx}`,
            values
          );
          updated++;
        } catch (dbErr) {
          failed++;
          console.error(`\n  DB error for video ${row.id}:`, dbErr.message);
        }
      })
    );

    // Progress line (overwrite in place)
    const processed = Math.min(i + BATCH, rows.length);
    const pct       = Math.round((processed / rows.length) * 100);
    process.stdout.write(
      `\r  Progress: ${processed}/${rows.length} (${pct}%) — Updated: ${updated}, Failed: ${failed}, Skipped: ${skipped}   `
    );
  }

  // ── Final report ──────────────────────────────────────────────────────────
  console.log('\n');
  console.log('═══════════════════════════════════════════');
  console.log('  ENRICHMENT COMPLETE');
  console.log('═══════════════════════════════════════════');
  console.log(`  Total processed : ${rows.length}`);
  console.log(`  Updated         : ${updated}`);
  console.log(`  Skipped (no tags): ${skipped}`);
  console.log(`  Failed (ffprobe) : ${failed}`);
  console.log('───────────────────────────────────────────');
  console.log('  Fields extracted:');
  console.log(`    Genre         : ${statFields.genre}`);
  console.log(`    Year          : ${statFields.release_year}`);
  console.log(`    Label         : ${statFields.record_label}`);
  console.log(`    BPM           : ${statFields.bpm}`);
  console.log('═══════════════════════════════════════════');

  if (DRY_RUN) {
    console.log('\n  (DRY RUN — no changes written to DB)');
  }

  await pool.end();
  process.exit(0);
}

run().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
