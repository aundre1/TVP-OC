#!/usr/bin/env node
// ===========================================
// THE VIDEO POOL - Bulk Video Import Script
// Handles 30,000+ DJ music videos from CSV, JSON, or SQL
//
// Usage:
//   node import-videos.js --file videos.csv --format csv
//   node import-videos.js --file videos.json --format json
//   node import-videos.js --file videos.sql --format sql
//   node import-videos.js --file videos.csv --format csv --dry-run
//   node import-videos.js --file videos.csv --format csv --batch-size 200
//   node import-videos.js --file videos.csv --format csv --map title=song_title,artist=performer
//   node import-videos.js --help
// ===========================================

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';
import readline from 'readline';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

// ===========================================
// CONSTANTS
// ===========================================

const BATCH_SIZE_DEFAULT = 100;
const ERROR_LOG_PATH = path.join(process.cwd(), 'import-errors.log');

// Valid enums from schema
const VALID_VERSION_TYPES = ['clean', 'dirty', 'explicit', 'radio', 'extended', 'remix', 'instrumental', 'acapella'];
const VALID_QUALITIES = ['720p', '1080p', '4k'];

// Default field mapping (source column → DB column)
// Users can override with --map flag
const DEFAULT_FIELD_MAP = {
  title:          'title',
  artist:         'artist',
  album:          'album',
  genre:          'genre',
  subgenre:       'subgenre',
  sub_genre:      'subgenre',
  bpm:            'bpm',
  key:            'key',
  camelot_key:    'camelot_key',
  camelot:        'camelot_key',
  duration:       'duration',
  year:           'release_year',
  release_year:   'release_year',
  label:          'record_label',
  record_label:   'record_label',
  thumbnail_url:  'thumbnail_url',
  thumbnail:      'thumbnail_url',
  video_url:      'video_url',       // maps to video_versions
  is_new:         'is_new',          // converted to is_featured
  is_hot:         'is_hot',          // converted to is_featured (priority)
  is_explicit:    'is_explicit',
  explicit:       'is_explicit',
  download_count: 'download_count',
  versions:       'versions',        // array of version objects
};

// ===========================================
// CLI ARGUMENT PARSING
// ===========================================

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    file: null,
    format: null,
    dryRun: false,
    batchSize: BATCH_SIZE_DEFAULT,
    map: {},         // user-supplied field remap
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--help':
      case '-h':
        opts.help = true;
        break;
      case '--file':
      case '-f':
        opts.file = args[++i];
        break;
      case '--format':
        opts.format = args[++i]?.toLowerCase();
        break;
      case '--dry-run':
        opts.dryRun = true;
        break;
      case '--batch-size':
        opts.batchSize = parseInt(args[++i], 10) || BATCH_SIZE_DEFAULT;
        break;
      case '--map': {
        // --map title=song_title,artist=performer
        const mapStr = args[++i] || '';
        mapStr.split(',').forEach(pair => {
          const [dest, src] = pair.trim().split('=');
          if (dest && src) opts.map[src.trim()] = dest.trim();
        });
        break;
      }
      default:
        // positional: first arg without flag = file
        if (!arg.startsWith('-') && !opts.file) {
          opts.file = arg;
        }
    }
  }

  // Auto-detect format from file extension if not provided
  if (!opts.format && opts.file) {
    const ext = path.extname(opts.file).toLowerCase().slice(1);
    if (['csv', 'json', 'sql'].includes(ext)) {
      opts.format = ext;
    }
  }

  return opts;
}

function printHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         THE VIDEO POOL — Bulk Video Import Tool               ║
╚═══════════════════════════════════════════════════════════════╝

USAGE
  node import-videos.js [options]

OPTIONS
  --file, -f <path>       Path to input file (CSV, JSON, or SQL)
  --format <format>       Input format: csv | json | sql
                          (auto-detected from file extension if omitted)
  --dry-run               Validate and count records without inserting
  --batch-size <n>        Records per DB batch (default: 100)
  --map <mappings>        Remap source columns to DB fields
                          Format: dest_field=src_field,dest2=src2
                          Example: --map title=song_title,artist=performer
  --help, -h              Show this help message

EXAMPLES
  # Import a CSV file
  node import-videos.js --file videos.csv --format csv

  # Import JSON with custom field mapping
  node import-videos.js --file data.json --format json \\
    --map title=song_name,artist=performer,genre=category

  # Dry run to validate first
  node import-videos.js --file videos.csv --dry-run

  # Import SQL dump
  node import-videos.js --file dump.sql --format sql

  # Large import with bigger batches
  node import-videos.js --file bigfile.csv --batch-size 250

SUPPORTED FIELDS (CSV headers / JSON keys)
  Required:
    title           Video/song title
    artist          Artist name

  Music metadata:
    genre           Genre (e.g. "Hip-Hop", "Pop", "EDM")
    subgenre        Sub-genre (e.g. "Trap", "Synth-Pop")
    bpm             Beats per minute (integer)
    key             Musical key (e.g. "Am", "C#")
    camelot_key     Camelot notation (e.g. "8A", "1B")
    duration        Duration in seconds (integer)
    year / release_year  Release year (integer)
    label / record_label Record label

  Media:
    thumbnail_url   Thumbnail image URL
    video_url       Primary video URL (creates a 'clean' 1080p version)
    is_explicit     true/false or 1/0
    is_new          true/false — marks as recently added
    is_hot          true/false — marks as featured/trending
    download_count  Initial download count (integer)

  Versions (JSON only, or JSON-encoded in CSV):
    versions        Array of version objects:
                    [{ "type": "clean", "url": "...", "quality": "1080p",
                       "file_size": 150000000 }]
                    Valid types: clean, dirty, explicit, radio, extended,
                                 remix, instrumental, acapella
                    Valid quality: 720p, 1080p, 4k

CSV FORMAT NOTES
  - First row must be headers
  - Delimiter: comma (,) — quotes handled automatically
  - Boolean values: true/false, yes/no, 1/0 all accepted
  - Versions: encode as JSON string in a "versions" column

JSON FORMAT NOTES
  - Must be an array of objects: [{...}, {...}]
  - Or an object with a "videos" or "tracks" or "data" key containing the array

SQL FORMAT NOTES
  - Standard INSERT statements are parsed
  - Supports: INSERT INTO videos (...) VALUES (...)
  - Column order in INSERT must match the column list

ERROR LOGGING
  Failed rows are logged to: ./import-errors.log

ENVIRONMENT
  DATABASE_URL must be set (Railway/Supabase connection string)
`);
}

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
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

// ===========================================
// PARSERS
// ===========================================

/**
 * Parse CSV file into array of row objects.
 * Handles quoted fields, commas inside quotes, and newlines inside quotes.
 */
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    let headers = null;

    const rl = readline.createInterface({
      input: createReadStream(filePath, { encoding: 'utf8' }),
      crlfDelay: Infinity,
    });

    // Buffer for multi-line quoted fields
    let pendingLine = null;

    function processLine(line) {
      if (pendingLine !== null) {
        line = pendingLine + '\n' + line;
        pendingLine = null;
      }

      const fields = parseCSVLine(line);
      if (fields === null) {
        // Unclosed quote — accumulate
        pendingLine = line;
        return;
      }

      if (!headers) {
        // Normalize headers: lowercase, trim, replace spaces with underscores
        headers = fields.map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
      } else {
        if (fields.length === 0 || (fields.length === 1 && fields[0] === '')) return;
        const row = {};
        headers.forEach((h, i) => {
          row[h] = (fields[i] ?? '').trim();
        });
        rows.push(row);
      }
    }

    rl.on('line', processLine);
    rl.on('close', () => {
      if (pendingLine !== null) {
        // Process remaining line
        const fields = parseCSVLine(pendingLine);
        if (fields && headers) {
          const row = {};
          headers.forEach((h, i) => {
            row[h] = (fields[i] ?? '').trim();
          });
          rows.push(row);
        }
      }
      resolve(rows);
    });
    rl.on('error', reject);
  });
}

/**
 * Parse a single CSV line, handling quoted fields.
 * Returns null if there's an unclosed quote (multiline field).
 */
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = null;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === quoteChar) {
        // Check for escaped quote (double-quote)
        if (line[i + 1] === quoteChar) {
          current += ch;
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if ((ch === '"' || ch === "'") && current === '') {
        inQuotes = true;
        quoteChar = ch;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }

  if (inQuotes) return null; // Unclosed quote
  fields.push(current);
  return fields;
}

/**
 * Parse JSON file — handles array or object with videos/tracks/data key.
 */
function parseJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error(`Invalid JSON: ${e.message}`);
  }

  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.videos)) return parsed.videos;
  if (Array.isArray(parsed.tracks)) return parsed.tracks;
  if (Array.isArray(parsed.data)) return parsed.data;

  throw new Error('JSON must be an array, or an object with "videos", "tracks", or "data" key containing an array.');
}

/**
 * Parse SQL INSERT statements.
 * Handles: INSERT INTO videos (col1, col2) VALUES (val1, val2);
 * or multi-row: INSERT INTO videos (...) VALUES (...), (...);
 */
function parseSQL(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rows = [];

  // Match INSERT INTO [table] (columns) VALUES (...) patterns
  // We look for INSERT INTO statements targeting 'videos' table
  const insertPattern = /INSERT\s+INTO\s+(?:`?videos`?|"?videos"?)\s*\(([^)]+)\)\s*VALUES\s*([\s\S]*?)(?=;|\n\s*INSERT|\n\s*--|\n\s*$|$)/gi;

  let match;
  while ((match = insertPattern.exec(content)) !== null) {
    const columnsPart = match[1];
    const valuesPart = match[2];

    const columns = columnsPart.split(',').map(c => c.trim().replace(/[`"]/g, '').toLowerCase());

    // Extract individual value tuples
    const valueTuples = extractValueTuples(valuesPart);

    for (const tuple of valueTuples) {
      const row = {};
      columns.forEach((col, i) => {
        row[col] = tuple[i] !== undefined ? tuple[i] : null;
      });
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    throw new Error('No INSERT INTO videos statements found in SQL file. Make sure the table name is "videos".');
  }

  return rows;
}

/**
 * Extract value tuples from the VALUES (...), (...) portion of INSERT.
 * Handles strings with commas, NULLs, and nested parens.
 */
function extractValueTuples(valuesPart) {
  const tuples = [];
  let i = 0;
  const str = valuesPart.trim();

  while (i < str.length) {
    // Find opening paren
    const start = str.indexOf('(', i);
    if (start === -1) break;

    // Find matching closing paren (accounting for nested parens and strings)
    let depth = 0;
    let inStr = false;
    let strChar = null;
    let j = start;

    for (; j < str.length; j++) {
      const ch = str[j];
      if (inStr) {
        if (ch === strChar && str[j - 1] !== '\\') inStr = false;
      } else if (ch === "'" || ch === '"') {
        inStr = true;
        strChar = ch;
      } else if (ch === '(') {
        depth++;
      } else if (ch === ')') {
        depth--;
        if (depth === 0) break;
      }
    }

    const tupleStr = str.slice(start + 1, j);
    tuples.push(parseSQLValues(tupleStr));
    i = j + 1;
  }

  return tuples;
}

/**
 * Parse comma-separated SQL values within a tuple, respecting quotes.
 */
function parseSQLValues(tupleStr) {
  const values = [];
  let current = '';
  let inStr = false;
  let strChar = null;

  for (let i = 0; i < tupleStr.length; i++) {
    const ch = tupleStr[i];
    if (inStr) {
      if (ch === strChar && tupleStr[i - 1] !== '\\') {
        inStr = false;
      } else {
        current += ch;
      }
    } else if (ch === "'" || ch === '"') {
      inStr = true;
      strChar = ch;
    } else if (ch === ',') {
      const val = current.trim();
      values.push(val.toUpperCase() === 'NULL' ? null : val);
      current = '';
    } else {
      current += ch;
    }
  }

  const val = current.trim();
  values.push(val.toUpperCase() === 'NULL' ? null : val);
  return values;
}

// ===========================================
// FIELD NORMALIZATION
// ===========================================

/**
 * Apply field mapping: combine DEFAULT_FIELD_MAP with user-supplied map,
 * then normalize a raw row object to the DB schema.
 */
function normalizeRow(rawRow, userMap) {
  // Merge default + user maps (user map takes precedence)
  const fieldMap = { ...DEFAULT_FIELD_MAP, ...userMap };

  // First pass: apply field map (rename source columns to DB columns)
  const mapped = {};
  for (const [srcKey, srcVal] of Object.entries(rawRow)) {
    const lowerKey = srcKey.toLowerCase().trim();
    const destKey = fieldMap[lowerKey] || lowerKey; // fallback: keep original
    mapped[destKey] = srcVal;
  }

  // Second pass: normalize types and values
  const normalized = {};

  // --- Required ---
  normalized.title = toString(mapped.title);
  normalized.artist = toString(mapped.artist);

  // --- Music metadata ---
  normalized.album = toStringOrNull(mapped.album);
  normalized.genre = toStringOrNull(mapped.genre) || 'Unknown';
  normalized.subgenre = toStringOrNull(mapped.subgenre);
  normalized.bpm = toIntOrNull(mapped.bpm);
  normalized.key = toStringOrNull(mapped.key);
  normalized.camelot_key = toStringOrNull(mapped.camelot_key);
  normalized.duration = toIntOrNull(mapped.duration);
  normalized.release_year = toIntOrNull(mapped.release_year || mapped.year);
  normalized.record_label = toStringOrNull(mapped.record_label || mapped.label);

  // --- Media ---
  normalized.thumbnail_url = toStringOrNull(mapped.thumbnail_url || mapped.thumbnail);
  normalized.video_url = toStringOrNull(mapped.video_url);          // not a DB column; used for versions
  normalized.is_explicit = toBool(mapped.is_explicit || mapped.explicit, false);
  normalized.download_count = toIntOrNull(mapped.download_count) || 0;

  // --- Flags ---
  const isNew = toBool(mapped.is_new, false);
  const isHot = toBool(mapped.is_hot, false);
  normalized.is_featured = isHot || isNew;

  // --- Derived fields ---
  normalized.decade = normalized.release_year
    ? `${Math.floor(normalized.release_year / 10) * 10}s`
    : null;

  normalized.has_clean_version = !normalized.is_explicit;
  normalized.has_dirty_version = normalized.is_explicit;

  // Build tags
  const tags = [];
  if (normalized.genre) tags.push(normalized.genre.toLowerCase());
  if (normalized.subgenre) tags.push(normalized.subgenre.toLowerCase());
  if (normalized.decade) tags.push(normalized.decade);
  if (normalized.artist) tags.push(normalized.artist.split(' ')[0].toLowerCase());
  if (normalized.is_explicit) tags.push('explicit');
  else tags.push('clean');
  normalized.tags = tags;

  // --- Versions (array) ---
  // Accept JSON string or already-parsed array
  let versions = mapped.versions;
  if (typeof versions === 'string' && versions.trim()) {
    try {
      versions = JSON.parse(versions);
    } catch (_) {
      versions = null;
    }
  }

  // If a video_url is provided but no versions, create a default clean 1080p version
  if (!Array.isArray(versions) || versions.length === 0) {
    versions = null;
    if (normalized.video_url) {
      versions = [{ type: 'clean', url: normalized.video_url, quality: '1080p' }];
    }
  }

  normalized.versions = versions; // may be null if no video URL provided

  return normalized;
}

// --- Type coercion helpers ---

function toString(val) {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

function toStringOrNull(val) {
  if (val === null || val === undefined || val === '') return null;
  const s = String(val).trim();
  return s === '' ? null : s;
}

function toIntOrNull(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = parseInt(String(val).replace(/[^0-9-]/g, ''), 10);
  return isNaN(n) ? null : n;
}

function toBool(val, defaultVal = false) {
  if (val === null || val === undefined || val === '') return defaultVal;
  if (typeof val === 'boolean') return val;
  const s = String(val).trim().toLowerCase();
  if (['true', 'yes', '1', 'y'].includes(s)) return true;
  if (['false', 'no', '0', 'n'].includes(s)) return false;
  return defaultVal;
}

// ===========================================
// VALIDATION
// ===========================================

/**
 * Validate a normalized row. Returns array of error strings (empty = OK).
 */
function validateRow(row, rowIndex) {
  const errors = [];

  if (!row.title) errors.push(`Row ${rowIndex}: missing required field "title"`);
  if (!row.artist) errors.push(`Row ${rowIndex}: missing required field "artist"`);
  if (row.bpm !== null && (row.bpm < 1 || row.bpm > 400)) {
    errors.push(`Row ${rowIndex}: invalid bpm ${row.bpm} (must be 1-400)`);
  }
  if (row.release_year !== null && (row.release_year < 1900 || row.release_year > new Date().getFullYear() + 2)) {
    errors.push(`Row ${rowIndex}: suspicious release_year ${row.release_year}`);
  }
  if (row.duration !== null && row.duration < 0) {
    errors.push(`Row ${rowIndex}: negative duration`);
  }

  // Validate versions
  if (Array.isArray(row.versions)) {
    row.versions.forEach((v, vi) => {
      if (!v.url && !v.file_url) {
        errors.push(`Row ${rowIndex} version[${vi}]: missing url`);
      }
      const vType = (v.type || v.version_type || 'clean').toLowerCase();
      if (!VALID_VERSION_TYPES.includes(vType)) {
        errors.push(`Row ${rowIndex} version[${vi}]: invalid type "${vType}" (valid: ${VALID_VERSION_TYPES.join(', ')})`);
      }
      const vQual = (v.quality || '1080p').toLowerCase().replace('k', 'k');
      if (!VALID_QUALITIES.includes(vQual)) {
        errors.push(`Row ${rowIndex} version[${vi}]: invalid quality "${vQual}" (valid: ${VALID_QUALITIES.join(', ')})`);
      }
    });
  }

  return errors;
}

// ===========================================
// IMPORT LOGIC
// ===========================================

/**
 * Insert or update a single video.
 * Uses upsert on (title, artist) — updates metadata if exists.
 * Returns: 'inserted' | 'updated' | 'skipped'
 */
async function upsertVideo(client, video) {
  // Upsert: update on conflict of (title, artist)
  const upsertResult = await client.query(
    `INSERT INTO videos (
      uuid, title, artist, album, genre, subgenre,
      bpm, key, camelot_key, duration, release_year, decade,
      record_label, thumbnail_url, is_explicit,
      has_clean_version, has_dirty_version,
      highest_quality, tags, is_featured,
      download_count, is_active
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12,
      $13, $14, $15,
      $16, $17,
      $18, $19, $20,
      $21, true
    )
    ON CONFLICT (title, artist)
    DO UPDATE SET
      album           = EXCLUDED.album,
      genre           = EXCLUDED.genre,
      subgenre        = EXCLUDED.subgenre,
      bpm             = COALESCE(EXCLUDED.bpm, videos.bpm),
      key             = COALESCE(EXCLUDED.key, videos.key),
      camelot_key     = COALESCE(EXCLUDED.camelot_key, videos.camelot_key),
      duration        = COALESCE(EXCLUDED.duration, videos.duration),
      release_year    = COALESCE(EXCLUDED.release_year, videos.release_year),
      decade          = COALESCE(EXCLUDED.decade, videos.decade),
      record_label    = COALESCE(EXCLUDED.record_label, videos.record_label),
      thumbnail_url   = COALESCE(EXCLUDED.thumbnail_url, videos.thumbnail_url),
      is_explicit     = EXCLUDED.is_explicit,
      has_clean_version = EXCLUDED.has_clean_version,
      has_dirty_version = EXCLUDED.has_dirty_version,
      highest_quality = EXCLUDED.highest_quality,
      tags            = EXCLUDED.tags,
      is_featured     = EXCLUDED.is_featured,
      download_count  = GREATEST(EXCLUDED.download_count, videos.download_count),
      updated_at      = CURRENT_TIMESTAMP
    RETURNING id, xmax
    `,
    [
      uuidv4(),
      video.title,
      video.artist,
      video.album,
      video.genre || 'Unknown',
      video.subgenre,
      video.bpm,
      video.key,
      video.camelot_key,
      video.duration,
      video.release_year,
      video.decade,
      video.record_label,
      video.thumbnail_url,
      video.is_explicit,
      video.has_clean_version,
      video.has_dirty_version,
      '1080p',
      video.tags,
      video.is_featured,
      video.download_count,
    ]
  );

  const row = upsertResult.rows[0];
  const videoId = row.id;
  // xmax = 0 means INSERT, non-zero means UPDATE
  const wasInserted = row.xmax === '0' || row.xmax === 0;

  // Insert video_versions if provided
  if (Array.isArray(video.versions) && video.versions.length > 0) {
    for (const v of video.versions) {
      const vType = (v.type || v.version_type || 'clean').toLowerCase();
      const vQuality = (v.quality || '1080p').toLowerCase();
      const vUrl = v.url || v.file_url || '';
      const vSize = toIntOrNull(v.file_size || v.size) || null;

      await client.query(
        `INSERT INTO video_versions (video_id, version_type, quality, file_url, file_size, file_format)
         VALUES ($1, $2, $3, $4, $5, 'mp4')
         ON CONFLICT (video_id, version_type, quality)
         DO UPDATE SET
           file_url   = EXCLUDED.file_url,
           file_size  = COALESCE(EXCLUDED.file_size, video_versions.file_size),
           updated_at = CURRENT_TIMESTAMP
        `,
        [videoId, vType, vQuality, vUrl, vSize]
      );
    }
  }

  return wasInserted ? 'inserted' : 'updated';
}

// ===========================================
// PROGRESS REPORTING
// ===========================================

class ProgressTracker {
  constructor(total) {
    this.total = total;
    this.processed = 0;
    this.imported = 0;
    this.updated = 0;
    this.failed = 0;
    this.skipped = 0;
    this.startTime = Date.now();
    this.lastPrintTime = 0;
  }

  tick(result) {
    this.processed++;
    if (result === 'inserted') this.imported++;
    else if (result === 'updated') this.updated++;
    else if (result === 'failed') this.failed++;
    else if (result === 'skipped') this.skipped++;
  }

  printProgress(batchNum, totalBatches) {
    const now = Date.now();
    // Rate-limit console output to once per second
    if (now - this.lastPrintTime < 1000 && batchNum < totalBatches) return;
    this.lastPrintTime = now;

    const elapsed = (now - this.startTime) / 1000;
    const rate = this.processed > 0 ? Math.round(this.processed / elapsed) : 0;
    const eta = rate > 0 && this.total > this.processed
      ? Math.round((this.total - this.processed) / rate)
      : 0;

    process.stdout.write(
      `\r  Batch ${String(batchNum).padStart(5)}/${totalBatches}` +
      `  |  ${String(this.processed).padStart(7)}/${this.total} videos` +
      `  |  ${rate}/s` +
      (eta > 0 ? `  |  ETA ~${eta}s` : '         ')
    );
  }

  printSummary(dryRun) {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const rate = this.total > 0 ? Math.round(this.total / parseFloat(elapsed)) : 0;

    console.log('\n');
    console.log('═══════════════════════════════════════════════════');
    console.log(dryRun ? '  DRY RUN COMPLETE (nothing was written to DB)' : '  IMPORT COMPLETE');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Imported : ${this.imported.toLocaleString()}`);
    console.log(`  Updated  : ${this.updated.toLocaleString()}`);
    console.log(`  Failed   : ${this.failed.toLocaleString()}`);
    console.log(`  Skipped  : ${this.skipped.toLocaleString()}`);
    console.log('───────────────────────────────────────────────────');
    console.log(`  Total    : ${this.processed.toLocaleString()} / ${this.total.toLocaleString()}`);
    console.log(`  Time     : ${elapsed}s  (${rate}/s avg)`);
    if (this.failed > 0) {
      console.log(`  Errors   : see ${ERROR_LOG_PATH}`);
    }
    console.log('═══════════════════════════════════════════════════');
    console.log('');
  }
}

// ===========================================
// ERROR LOGGING
// ===========================================

function logError(rowIndex, rawRow, errors) {
  const lines = [
    `--- Row ${rowIndex} [${new Date().toISOString()}] ---`,
    `Errors: ${errors.join(' | ')}`,
    `Data: ${JSON.stringify(rawRow)}`,
    '',
  ];
  fs.appendFileSync(ERROR_LOG_PATH, lines.join('\n'), 'utf8');
}

// ===========================================
// MAIN
// ===========================================

async function main() {
  const opts = parseArgs(process.argv);

  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  console.log('');
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║     THE VIDEO POOL — Bulk Video Import Tool       ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log('');

  // Validate required options
  if (!opts.file) {
    console.error('ERROR: --file is required. Use --help for usage.');
    process.exit(1);
  }
  if (!opts.format) {
    console.error('ERROR: --format is required (csv, json, sql). Use --help for usage.');
    process.exit(1);
  }

  const absFile = path.resolve(opts.file);
  if (!fs.existsSync(absFile)) {
    console.error(`ERROR: File not found: ${absFile}`);
    process.exit(1);
  }

  if (opts.dryRun) {
    console.log('  MODE: DRY RUN — no data will be written to the database');
    console.log('');
  }

  // --- Step 1: Parse file ---
  console.log(`  File   : ${absFile}`);
  console.log(`  Format : ${opts.format.toUpperCase()}`);
  console.log(`  Batch  : ${opts.batchSize}`);
  if (Object.keys(opts.map).length > 0) {
    console.log(`  Map    : ${Object.entries(opts.map).map(([d, s]) => `${d}=${s}`).join(', ')}`);
  }
  console.log('');
  console.log('  Parsing file...');

  let rawRows;
  try {
    if (opts.format === 'csv') {
      rawRows = await parseCSV(absFile);
    } else if (opts.format === 'json') {
      rawRows = parseJSON(absFile);
    } else if (opts.format === 'sql') {
      rawRows = parseSQL(absFile);
    } else {
      console.error(`ERROR: Unknown format "${opts.format}". Use csv, json, or sql.`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`ERROR parsing file: ${err.message}`);
    process.exit(1);
  }

  console.log(`  Parsed ${rawRows.length.toLocaleString()} rows`);

  if (rawRows.length === 0) {
    console.log('  No rows found. Exiting.');
    process.exit(0);
  }

  // --- Step 2: Normalize and validate all rows ---
  console.log('  Normalizing and validating...');

  const normalizedRows = [];
  const preValidationErrors = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rowNum = i + 1;
    try {
      const normalized = normalizeRow(rawRows[i], opts.map);
      const errors = validateRow(normalized, rowNum);

      if (errors.length > 0) {
        preValidationErrors.push({ rowNum, row: rawRows[i], errors });
        logError(rowNum, rawRows[i], errors);
      } else {
        normalizedRows.push(normalized);
      }
    } catch (err) {
      preValidationErrors.push({ rowNum, row: rawRows[i], errors: [err.message] });
      logError(rowNum, rawRows[i], [err.message]);
    }
  }

  if (preValidationErrors.length > 0) {
    console.log(`  Validation: ${preValidationErrors.length} rows failed validation (logged to ${ERROR_LOG_PATH})`);
    // Show first 5 errors as preview
    preValidationErrors.slice(0, 5).forEach(({ rowNum, errors }) => {
      console.log(`    Row ${rowNum}: ${errors[0]}`);
    });
    if (preValidationErrors.length > 5) {
      console.log(`    ... and ${preValidationErrors.length - 5} more`);
    }
  }

  console.log(`  Valid rows to import: ${normalizedRows.length.toLocaleString()}`);

  if (normalizedRows.length === 0) {
    console.log('  Nothing to import after validation. Check import-errors.log for details.');
    process.exit(0);
  }

  // --- Dry run: stop here ---
  if (opts.dryRun) {
    console.log('');
    console.log('  DRY RUN — Sample of normalized data (first 3 rows):');
    normalizedRows.slice(0, 3).forEach((row, i) => {
      console.log(`\n  [${i + 1}] ${row.artist} — ${row.title}`);
      console.log(`      Genre: ${row.genre} | BPM: ${row.bpm} | Key: ${row.key} | Camelot: ${row.camelot_key}`);
      console.log(`      Year: ${row.release_year} | Duration: ${row.duration}s | Explicit: ${row.is_explicit}`);
      if (row.versions) {
        console.log(`      Versions: ${row.versions.map(v => `${v.type || v.version_type}@${v.quality}`).join(', ')}`);
      }
    });

    console.log('');
    console.log(`  Total would-be imports : ${normalizedRows.length.toLocaleString()}`);
    console.log(`  Validation failures    : ${preValidationErrors.length.toLocaleString()}`);
    console.log('');
    console.log('  Run without --dry-run to execute the import.');
    console.log('');
    process.exit(0);
  }

  // --- Step 3: Connect to database ---
  console.log('  Connecting to database...');
  let pool;
  try {
    pool = createPool();
    const testResult = await pool.query('SELECT 1');
    console.log('  Database connection OK');
  } catch (err) {
    console.error(`ERROR connecting to database: ${err.message}`);
    process.exit(1);
  }

  // --- Step 4: Process in batches ---
  const totalBatches = Math.ceil(normalizedRows.length / opts.batchSize);
  const tracker = new ProgressTracker(normalizedRows.length);

  console.log('');
  console.log(`  Starting import: ${normalizedRows.length.toLocaleString()} videos in ${totalBatches} batches of ${opts.batchSize}`);
  console.log('');

  // Clear/initialize error log
  if (fs.existsSync(ERROR_LOG_PATH)) {
    fs.appendFileSync(ERROR_LOG_PATH, `\n=== Import run ${new Date().toISOString()} ===\n`, 'utf8');
  }

  for (let batchNum = 1; batchNum <= totalBatches; batchNum++) {
    const start = (batchNum - 1) * opts.batchSize;
    const batch = normalizedRows.slice(start, start + opts.batchSize);

    // Each batch runs in a single transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const video of batch) {
        try {
          const result = await upsertVideo(client, video);
          tracker.tick(result);
        } catch (err) {
          tracker.tick('failed');
          logError(tracker.processed, video, [`DB error: ${err.message}`]);
          // Continue — don't abort the whole batch for one bad row
          // But we need to roll back and re-try individually if transaction is tainted
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      // Batch-level failure — mark all rows in this batch as failed
      batch.forEach((video, i) => {
        tracker.tick('failed');
        logError(start + i + 1, video, [`Batch transaction error: ${err.message}`]);
      });
    } finally {
      client.release();
    }

    tracker.printProgress(batchNum, totalBatches);
  }

  // --- Step 5: Summary ---
  tracker.printSummary(false);

  // --- Step 6: Post-import DB stats ---
  try {
    const statsResult = await pool.query('SELECT COUNT(*) as total FROM videos WHERE is_active = true');
    console.log(`  Total videos now in database: ${parseInt(statsResult.rows[0].total).toLocaleString()}`);
    console.log('');
  } catch (_) {
    // Non-critical
  }

  await pool.end();
  process.exit(tracker.failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('\nFATAL ERROR:', err.message);
  process.exit(1);
});
