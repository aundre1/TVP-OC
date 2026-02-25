#!/usr/bin/env node
// ===========================================
// THE VIDEO POOL - Wasabi S3 Bucket Scanner
// Lists ALL objects, parses metadata from filenames,
// groups versions, and imports into Supabase.
//
// Usage:
//   node scan-wasabi.js                          # full import
//   node scan-wasabi.js --dry-run               # list files only, no DB write
//   node scan-wasabi.js --prefix "Hip-Hop/"     # only scan a folder prefix
//   node scan-wasabi.js --limit 100             # only process first N files
//   node scan-wasabi.js --list-only             # show bucket structure (folders/counts)
//   node scan-wasabi.js --generate-urls         # generate presigned URLs for all videos
//   node scan-wasabi.js --batch-size 200        # DB batch size (default 100)
//   node scan-wasabi.js --help
// ===========================================

import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

// ===========================================
// CONSTANTS
// ===========================================

const BATCH_SIZE_DEFAULT = 100;
const PRESIGNED_URL_EXPIRY = 86400;            // 24 hours in seconds
const LIST_PAGE_SIZE = 1000;                   // Max per S3 ListObjectsV2 request
const ERROR_LOG_PATH = path.join(process.cwd(), 'wasabi-parse-errors.log');
const SUPPORTED_VIDEO_EXTS = new Set(['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.wmv']);
const SUPPORTED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

// Valid DB enums (must match schema.sql)
const VALID_VERSION_TYPES = ['clean', 'dirty', 'explicit', 'radio', 'extended', 'remix', 'instrumental', 'acapella'];
const VALID_QUALITIES = ['720p', '1080p', '4k'];

// ===========================================
// CLI ARGUMENT PARSING
// ===========================================

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    dryRun: false,
    listOnly: false,
    generateUrls: false,
    prefix: null,
    limit: null,
    batchSize: BATCH_SIZE_DEFAULT,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--help':
      case '-h':
        opts.help = true;
        break;
      case '--dry-run':
        opts.dryRun = true;
        break;
      case '--list-only':
        opts.listOnly = true;
        break;
      case '--generate-urls':
        opts.generateUrls = true;
        break;
      case '--prefix':
        opts.prefix = args[++i];
        break;
      case '--limit':
        opts.limit = parseInt(args[++i], 10) || null;
        break;
      case '--batch-size':
        opts.batchSize = parseInt(args[++i], 10) || BATCH_SIZE_DEFAULT;
        break;
    }
  }

  return opts;
}

function printHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║       THE VIDEO POOL — Wasabi S3 Bucket Scanner & Importer       ║
╚══════════════════════════════════════════════════════════════════╝

USAGE
  node scan-wasabi.js [options]

OPTIONS
  --dry-run               Scan and parse filenames; no DB writes
  --list-only             Show bucket folder structure and file counts only
  --generate-urls         Generate presigned S3 URLs for all detected videos
  --prefix <path>         Only scan objects under this key prefix (e.g. "Hip-Hop/")
  --limit <n>             Stop after processing the first N video files
  --batch-size <n>        Records per DB batch (default: ${BATCH_SIZE_DEFAULT})
  --help, -h              Show this help message

ENVIRONMENT VARIABLES (in server/.env)
  S3_ACCESS_KEY           Wasabi access key  (alias: WASABI_ACCESS_KEY)
  S3_SECRET_KEY           Wasabi secret key  (alias: WASABI_SECRET_KEY)
  S3_BUCKET               Bucket name        (alias: WASABI_BUCKET)
  S3_REGION               Region             (alias: WASABI_REGION,  default: us-east-1)
  S3_ENDPOINT             Endpoint URL       (alias: WASABI_ENDPOINT, default: s3.wasabisys.com)
  DATABASE_URL            Supabase PostgreSQL connection string

EXAMPLES
  # Full import of all 30K+ videos
  node scan-wasabi.js

  # Preview only (no DB writes)
  node scan-wasabi.js --dry-run

  # Only import Hip-Hop folder
  node scan-wasabi.js --prefix "Hip-Hop/"

  # Test with first 50 files
  node scan-wasabi.js --limit 50 --dry-run

  # Show what folders exist in the bucket
  node scan-wasabi.js --list-only

  # Generate presigned URLs for all videos
  node scan-wasabi.js --generate-urls --dry-run

FILENAME PATTERNS RECOGNIZED
  Drake - God's Plan (Clean).mp4
  Drake - God's Plan - Clean.mp4
  Drake_Gods_Plan_Clean_1080p.mp4
  01. Drake - God's Plan [Clean] [128BPM].mp4
  Hip-Hop/Drake/Gods Plan/Clean.mp4      (folder-based)
  Drake - God's Plan (Dirty) [128BPM] [Am].mp4

VERSION TYPES DETECTED   clean, dirty, explicit, radio, extended, remix, instrumental, acapella
QUALITY DETECTED         4K / 1080p / 720p / SD (defaults to 1080p)
BPM DETECTED             [128BPM], (128 BPM), 128bpm
KEY DETECTED             [Am], [C#], [Dm], etc.

ERROR LOG
  Failed-to-parse entries are written to: ${ERROR_LOG_PATH}
`);
}

// ===========================================
// S3 CLIENT SETUP
// ===========================================

function buildS3Config() {
  // Support both WASABI_* and S3_* env var names
  const accessKey  = process.env.WASABI_ACCESS_KEY  || process.env.S3_ACCESS_KEY;
  const secretKey  = process.env.WASABI_SECRET_KEY  || process.env.S3_SECRET_KEY;
  const bucket     = process.env.WASABI_BUCKET      || process.env.S3_BUCKET;
  const region     = process.env.WASABI_REGION      || process.env.S3_REGION     || 'us-east-1';
  const rawEndpoint = process.env.WASABI_ENDPOINT   || process.env.S3_ENDPOINT   || 's3.wasabisys.com';

  // Normalize endpoint: ensure it starts with https://
  const endpoint = rawEndpoint.startsWith('http')
    ? rawEndpoint
    : `https://${rawEndpoint}`;

  if (!accessKey) throw new Error('Missing S3_ACCESS_KEY / WASABI_ACCESS_KEY');
  if (!secretKey) throw new Error('Missing S3_SECRET_KEY / WASABI_SECRET_KEY');
  if (!bucket)    throw new Error('Missing S3_BUCKET / WASABI_BUCKET');

  return { accessKey, secretKey, bucket, region, endpoint };
}

function createS3Client(config) {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
    forcePathStyle: true,   // Required for Wasabi path-style URLs
  });
}

// ===========================================
// S3 BUCKET SCANNER (streaming pagination)
// ===========================================

/**
 * Async generator: yields S3 objects page by page.
 * Handles pagination automatically via ContinuationToken.
 * Never loads the entire object list into memory at once.
 *
 * @param {S3Client} s3
 * @param {string} bucket
 * @param {string|null} prefix
 * @yields {{ Key, Size, LastModified, ETag }}
 */
async function* listAllObjects(s3, bucket, prefix) {
  let continuationToken = undefined;
  let totalFetched = 0;

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: LIST_PAGE_SIZE,
      ...(prefix ? { Prefix: prefix } : {}),
      ...(continuationToken ? { ContinuationToken: continuationToken } : {}),
    });

    let response;
    try {
      response = await s3.send(command);
    } catch (err) {
      throw new Error(`S3 ListObjectsV2 failed: ${err.message}`);
    }

    const contents = response.Contents || [];
    totalFetched += contents.length;

    for (const obj of contents) {
      yield obj;
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);
}

// ===========================================
// FILENAME / PATH METADATA PARSER
// ===========================================

/**
 * Determine if a filename indicates a video file.
 */
function isVideoFile(key) {
  const ext = path.extname(key).toLowerCase();
  return SUPPORTED_VIDEO_EXTS.has(ext);
}

/**
 * Determine if a filename indicates an image file (thumbnail).
 */
function isImageFile(key) {
  const ext = path.extname(key).toLowerCase();
  return SUPPORTED_IMAGE_EXTS.has(ext);
}

/**
 * Extract a version label token from a text segment (case-insensitive).
 * Returns a normalized version_type string or null.
 */
function detectVersion(text) {
  const t = text.toLowerCase();

  // Order matters: check longer/more-specific strings first
  if (/\b(radio\s*edit)\b/.test(t)) return 'radio';
  if (/\b(clean)\b/.test(t))        return 'clean';
  if (/\b(radio)\b/.test(t))        return 'radio';
  if (/\b(dirty)\b/.test(t))        return 'dirty';
  if (/\b(explicit|uncensored)\b/.test(t)) return 'explicit';
  if (/\b(xtendz|extended|ext\.?)\b/.test(t)) return 'extended';
  if (/\b(intro)\b/.test(t))        return 'clean';    // intro → clean by convention
  if (/\b(acapella|a\s*capella)\b/.test(t)) return 'acapella';
  if (/\b(instrumental|inst\.?)\b/.test(t)) return 'instrumental';
  if (/\b(remix|rmx)\b/.test(t))    return 'remix';

  return null;
}

/**
 * Extract quality from a text segment.
 */
function detectQuality(text) {
  const t = text.toLowerCase();

  if (/\b(4k|2160p|uhd)\b/.test(t))         return '4k';
  if (/\b(1080p|1080|full\s*hd|fhd)\b/.test(t)) return '1080p';
  if (/\b(720p|720|hd)\b/.test(t))          return '720p';
  if (/\b(480p|sd)\b/.test(t))              return '720p'; // map SD → 720p (DB only has 720p/1080p/4k)

  return null;
}

/**
 * Extract BPM integer from a text segment.
 * Matches: [128BPM], (128 BPM), 128bpm, _128bpm_
 */
function detectBpm(text) {
  const m = text.match(/[\[(\s_](\d{2,3})\s*bpm[\])\s_]/i)
    || text.match(/\b(\d{2,3})\s*bpm\b/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 40 && n <= 300) return n;
  }
  return null;
}

/**
 * Extract musical key from a text segment.
 * Matches: [Am], [C#m], [Dm], [F#], etc.
 */
function detectKey(text) {
  // Look for key patterns inside brackets/parens or standalone
  const m = text.match(/[\[(\s]([A-G][#b]?m?)[\])\s]/);
  if (m) {
    const candidate = m[1];
    // Validate it's a real key (not a random word starting with A-G)
    if (/^[A-G][#b]?m?$/.test(candidate) && candidate.length <= 3) {
      return candidate;
    }
  }
  return null;
}

/**
 * Extract genre from the leading folder segments of an S3 key.
 * e.g. "Hip-Hop/Drake/God's Plan (Clean).mp4" → genre: "Hip-Hop"
 */
function extractGenreFromPath(segments) {
  if (segments.length < 2) return null;

  const knownGenres = [
    'hip-hop', 'hip hop', 'pop', 'r&b', 'rnb', 'latin', 'edm', 'electronic',
    'country', 'rock', 'reggae', 'reggaeton', 'dancehall', 'afrobeats', 'afrobeat',
    'gospel', 'soul', 'funk', 'disco', 'jazz', 'blues', 'classical', 'house',
    'techno', 'trap', 'drill', 'alternative', 'indie', 'metal', 'punk', 'ska',
    'oldies', '80s', '90s', '2000s', '2010s', 'throwbacks', 'new releases',
  ];

  const candidate = segments[0].toLowerCase().trim();
  if (knownGenres.some(g => candidate.includes(g))) {
    return segments[0].trim(); // Return original case
  }

  // If folder looks like a year (e.g. "2024/") don't treat as genre
  if (/^\d{4}$/.test(candidate)) return null;

  // Accept any top-level folder as a genre if there are 2+ levels
  if (segments.length >= 2) return segments[0].trim();

  return null;
}

/**
 * Normalize a title string: remove noise tokens, fix casing.
 */
function cleanTitle(raw) {
  return raw
    .replace(/\s*[\[(][^\])]*(clean|dirty|explicit|radio|extended|remix|acapella|instrumental|xtendz|intro|bpm|1080|720|4k|hd|uhd|fhd|sd|\d{2,3}bpm|[A-G][#b]?m?)[^\])]*[\])]/gi, '')
    .replace(/[-_]+$/, '')      // trailing dashes/underscores
    .replace(/\s{2,}/g, ' ')    // collapse spaces
    .trim();
}

/**
 * Parse a single S3 object key and return extracted metadata.
 *
 * @param {string} key   - Full S3 object key, e.g. "Hip-Hop/Drake - God's Plan (Clean 1080p).mp4"
 * @returns {{
 *   title: string,
 *   artist: string,
 *   genre: string|null,
 *   versionType: string,
 *   quality: string,
 *   bpm: number|null,
 *   key: string|null,
 *   fileKey: string,
 *   ext: string,
 * }|null}   null = could not parse
 */
function parseS3Key(key) {
  const ext = path.extname(key).toLowerCase();
  const basename = path.basename(key, ext);
  const dirPart = path.dirname(key);

  // Split path into folder segments (filter empty)
  const segments = dirPart === '.' ? [] : dirPart.split('/').filter(Boolean);

  // --- Detect version from full key string ---
  const versionFromName = detectVersion(basename);
  const qualityFromName = detectQuality(basename) || '1080p';
  const bpmFromName     = detectBpm(basename);
  const keyFromName     = detectKey(basename);
  const genreFromPath   = extractGenreFromPath(segments);

  // ---------------------------------------------------------------
  // Try to extract artist + title from the filename using common DJ
  // naming conventions (tested most-specific → least-specific order)
  // ---------------------------------------------------------------

  let artist = null;
  let title  = null;

  // Normalize underscores in basename for pattern matching
  const normalizedBase = basename.replace(/_/g, ' ');

  // Pattern 1: "01. Artist - Title" (track number prefix)
  // e.g. "01. Drake - God's Plan (Clean)"
  const withTrackNum = normalizedBase.match(/^\d+[.)]\s*(.+?)\s*-\s*(.+)$/);
  if (withTrackNum) {
    artist = withTrackNum[1].trim();
    title  = cleanTitle(withTrackNum[2]);
  }

  // Pattern 2: "Artist - Title" (standard dash separator)
  if (!artist) {
    const dashMatch = normalizedBase.match(/^(.+?)\s+-\s+(.+)$/);
    if (dashMatch) {
      artist = dashMatch[1].trim();
      title  = cleanTitle(dashMatch[2]);
    }
  }

  // Pattern 3: Folder-based "Genre/Artist/Title/VersionType.ext"
  // e.g. "Hip-Hop/Drake/Gods Plan/Clean.mp4"
  if (!artist && segments.length >= 3) {
    // segments[0] = genre, segments[1] = artist, segments[2+] = title parts
    artist = segments[1].trim();
    // Use remaining path segments + basename as title parts
    const titleParts = [...segments.slice(2), basename].join(' ');
    title  = cleanTitle(titleParts);
  }

  // Pattern 4: Folder-based "Genre/Artist/Title.ext"
  if (!artist && segments.length >= 2) {
    artist = segments[segments.length - 1].trim();
    title  = cleanTitle(basename);
  }

  // Pattern 5: Just a filename with no folder context — use filename as title
  if (!artist) {
    artist = 'Unknown';
    title  = cleanTitle(basename);
  }

  // Clean artist name (strip noise tokens too)
  artist = artist
    .replace(/\s*[\[(][^\])]*(clean|dirty|explicit|radio|bpm|\d{2,3}bpm)[^\])]*[\])]/gi, '')
    .replace(/[-_]+$/, '')
    .trim();

  // Guard: title and artist must be non-empty
  if (!title || title.length < 1) title = cleanTitle(basename);
  if (!artist || artist.length < 1) artist = 'Unknown';

  // Determine versionType: prefer parsed from name, fall back to folder hint
  let versionType = versionFromName;
  if (!versionType && segments.length >= 3) {
    // Last folder segment might be the version (e.g. "Clean")
    versionType = detectVersion(segments[segments.length - 1]);
  }
  if (!versionType) versionType = 'clean'; // default

  return {
    title,
    artist,
    genre: genreFromPath,
    versionType,
    quality: qualityFromName,
    bpm: bpmFromName,
    musicalKey: keyFromName,
    fileKey: key,
    ext: ext.replace('.', ''),
  };
}

// ===========================================
// URL BUILDER
// ===========================================

/**
 * Build the direct public URL for a Wasabi object.
 * Uses path-style URL: https://s3.{region}.wasabisys.com/{bucket}/{key}
 */
function buildPublicUrl(config, key) {
  // Remove trailing https:// from endpoint for URL building
  const host = config.endpoint.replace(/^https?:\/\//, '');
  return `https://${host}/${config.bucket}/${key}`;
}

/**
 * Generate a presigned URL for temporary access.
 */
async function buildPresignedUrl(s3, config, key, expiresIn = PRESIGNED_URL_EXPIRY) {
  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

// ===========================================
// BUCKET STRUCTURE ANALYSIS
// ===========================================

/**
 * Summarize bucket contents by top-level folder prefix.
 * Returns a Map<folder, count>.
 */
function buildFolderSummary(objects) {
  const folders = new Map();
  const rootFiles = { key: '(root)', count: 0 };

  for (const obj of objects) {
    const slashIdx = obj.Key.indexOf('/');
    if (slashIdx === -1) {
      rootFiles.count++;
    } else {
      const folder = obj.Key.slice(0, slashIdx + 1);
      folders.set(folder, (folders.get(folder) || 0) + 1);
    }
  }

  if (rootFiles.count > 0) folders.set(rootFiles.key, rootFiles.count);

  return folders;
}

// ===========================================
// DATABASE
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

function toIntOrNull(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = parseInt(String(val).replace(/[^0-9-]/g, ''), 10);
  return isNaN(n) ? null : n;
}

/**
 * Upsert a single video + its version into the DB.
 * Mirrors the logic in import-videos.js but driven by parsed S3 metadata.
 *
 * @param {pg.PoolClient} client
 * @param {object} video  - normalized video object
 * @param {object} version - { versionType, quality, fileUrl, fileKey, fileSize }
 * @returns {'inserted'|'updated'}
 */
async function upsertVideoWithVersion(client, video, version) {
  // Clamp/validate version_type and quality to DB enums
  const safeVersionType = VALID_VERSION_TYPES.includes(version.versionType)
    ? version.versionType
    : 'clean';
  const safeQuality = VALID_QUALITIES.includes(version.quality)
    ? version.quality
    : '1080p';

  // Derive flags from version type
  const isExplicit     = safeVersionType === 'explicit' || safeVersionType === 'dirty';
  const hasCleanVersion = safeVersionType === 'clean' || safeVersionType === 'radio';
  const hasDirtyVersion = isExplicit;

  const genre = video.genre || 'Unknown';
  const decade = video.release_year
    ? `${Math.floor(video.release_year / 10) * 10}s`
    : null;

  const tags = [
    genre.toLowerCase(),
    safeVersionType,
    ...(video.artist !== 'Unknown' ? [video.artist.split(' ')[0].toLowerCase()] : []),
  ].filter(Boolean);

  const upsertResult = await client.query(
    `INSERT INTO videos (
      uuid, title, artist, genre,
      bpm, key,
      highest_quality, has_clean_version, has_dirty_version, is_explicit,
      tags, decade,
      is_active, is_featured, download_count
    ) VALUES (
      $1, $2, $3, $4,
      $5, $6,
      $7, $8, $9, $10,
      $11, $12,
      true, false, 0
    )
    ON CONFLICT (title, artist)
    DO UPDATE SET
      genre             = COALESCE(EXCLUDED.genre, videos.genre),
      bpm               = COALESCE(EXCLUDED.bpm, videos.bpm),
      key               = COALESCE(EXCLUDED.key, videos.key),
      highest_quality   = CASE
                            WHEN EXCLUDED.highest_quality = '4k'   THEN '4k'::video_quality
                            WHEN EXCLUDED.highest_quality = '1080p' AND videos.highest_quality != '4k' THEN '1080p'::video_quality
                            ELSE videos.highest_quality
                          END,
      has_clean_version = videos.has_clean_version OR EXCLUDED.has_clean_version,
      has_dirty_version = videos.has_dirty_version OR EXCLUDED.has_dirty_version,
      is_explicit       = videos.is_explicit OR EXCLUDED.is_explicit,
      tags              = EXCLUDED.tags,
      decade            = COALESCE(EXCLUDED.decade, videos.decade),
      updated_at        = CURRENT_TIMESTAMP
    RETURNING id, xmax
    `,
    [
      uuidv4(),
      video.title,
      video.artist,
      genre,
      video.bpm,
      video.musicalKey,
      safeQuality,
      hasCleanVersion,
      hasDirtyVersion,
      isExplicit,
      tags,
      decade,
    ]
  );

  const row = upsertResult.rows[0];
  const videoId = row.id;
  const wasInserted = row.xmax === '0' || row.xmax === 0;

  // Upsert the video_version row
  await client.query(
    `INSERT INTO video_versions (
      video_id, version_type, quality, file_url, file_key, file_size, file_format
    ) VALUES ($1, $2, $3, $4, $5, $6, 'mp4')
    ON CONFLICT (video_id, version_type, quality)
    DO UPDATE SET
      file_url   = EXCLUDED.file_url,
      file_key   = EXCLUDED.file_key,
      file_size  = COALESCE(EXCLUDED.file_size, video_versions.file_size),
      updated_at = CURRENT_TIMESTAMP
    `,
    [
      videoId,
      safeVersionType,
      safeQuality,
      version.fileUrl,
      version.fileKey,
      version.fileSize || null,
    ]
  );

  // If a matching thumbnail URL was found, update it now
  if (video.thumbnail_url) {
    await client.query(
      `UPDATE videos SET thumbnail_url = $1 WHERE id = $2 AND thumbnail_url IS NULL`,
      [video.thumbnail_url, videoId]
    );
  }

  return wasInserted ? 'inserted' : 'updated';
}

// ===========================================
// PROGRESS TRACKER
// ===========================================

class ProgressTracker {
  constructor() {
    this.scanned    = 0;
    this.videos     = 0;
    this.images     = 0;
    this.skipped    = 0;
    this.inserted   = 0;
    this.updated    = 0;
    this.failed     = 0;
    this.parseErrors = 0;
    this.startTime  = Date.now();
    this._lastPrint = 0;
  }

  get total() { return this.videos; }

  tickScan(isVideo, isImage) {
    this.scanned++;
    if (isVideo) this.videos++;
    else if (isImage) this.images++;
    else this.skipped++;
  }

  tickDB(result) {
    if (result === 'inserted') this.inserted++;
    else if (result === 'updated') this.updated++;
    else if (result === 'failed') this.failed++;
    else if (result === 'parse_error') this.parseErrors++;
  }

  printScanProgress(batchLabel) {
    const now = Date.now();
    if (now - this._lastPrint < 500) return;
    this._lastPrint = now;
    process.stdout.write(`\r  Scanning... ${this.scanned.toLocaleString()} objects found (${this.videos.toLocaleString()} videos)  `);
  }

  printImportProgress(processed, total, batchNum, totalBatches) {
    const now = Date.now();
    if (now - this._lastPrint < 1000 && processed < total) return;
    this._lastPrint = now;

    const elapsed = (now - this.startTime) / 1000;
    const rate    = processed > 0 ? Math.round(processed / elapsed) : 0;
    const eta     = rate > 0 && total > processed ? Math.round((total - processed) / rate) : 0;

    process.stdout.write(
      `\r  Batch ${String(batchNum).padStart(5)}/${totalBatches}` +
      `  |  ${String(processed).padStart(7)}/${total} videos` +
      `  |  ${rate}/s` +
      (eta > 0 ? `  |  ETA ~${eta}s` : '         ')
    );
  }

  printSummary(mode) {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const processed = this.inserted + this.updated + this.failed;

    console.log('\n');
    console.log('═══════════════════════════════════════════════════════');
    if (mode === 'dry-run') {
      console.log('  DRY RUN COMPLETE  (nothing was written to database)');
    } else if (mode === 'list-only') {
      console.log('  BUCKET SCAN COMPLETE');
    } else {
      console.log('  IMPORT COMPLETE');
    }
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Objects scanned  : ${this.scanned.toLocaleString()}`);
    console.log(`  Video files      : ${this.videos.toLocaleString()}`);
    console.log(`  Image files      : ${this.images.toLocaleString()}`);
    console.log(`  Other (skipped)  : ${this.skipped.toLocaleString()}`);
    if (mode !== 'list-only') {
      console.log('───────────────────────────────────────────────────────');
      console.log(`  Parse errors     : ${this.parseErrors.toLocaleString()}`);
    }
    if (mode === 'import') {
      console.log('───────────────────────────────────────────────────────');
      console.log(`  Videos created   : ${this.inserted.toLocaleString()}`);
      console.log(`  Versions updated : ${this.updated.toLocaleString()}`);
      console.log(`  DB failures      : ${this.failed.toLocaleString()}`);
    }
    console.log('───────────────────────────────────────────────────────');
    console.log(`  Elapsed time     : ${elapsed}s`);
    if (this.parseErrors > 0 || this.failed > 0) {
      console.log(`  Error log        : ${ERROR_LOG_PATH}`);
    }
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
  }
}

// ===========================================
// ERROR LOGGING
// ===========================================

function logParseError(key, reason) {
  const line = `[${new Date().toISOString()}] PARSE_ERROR  key="${key}"  reason="${reason}"\n`;
  fs.appendFileSync(ERROR_LOG_PATH, line, 'utf8');
}

function logDbError(key, err) {
  const line = `[${new Date().toISOString()}] DB_ERROR     key="${key}"  error="${err.message}"\n`;
  fs.appendFileSync(ERROR_LOG_PATH, line, 'utf8');
}

// ===========================================
// THUMBNAIL MATCHING
// ===========================================

/**
 * Build a lookup map of image keys keyed by their base name (no extension).
 * Used to associate thumbnail .jpg/.png files with their matching video.
 */
function buildThumbnailMap(imageKeys) {
  const map = new Map();
  for (const key of imageKeys) {
    const base = path.basename(key, path.extname(key)).toLowerCase().trim();
    if (!map.has(base)) map.set(base, key);
  }
  return map;
}

/**
 * Try to find a matching thumbnail key for a video title + artist.
 */
function findThumbnail(thumbnailMap, config, title, artist) {
  const candidates = [
    `${artist} - ${title}`.toLowerCase(),
    `${title}`.toLowerCase(),
    `${artist}_${title}`.toLowerCase().replace(/\s+/g, '_'),
  ];
  for (const c of candidates) {
    if (thumbnailMap.has(c)) {
      return buildPublicUrl(config, thumbnailMap.get(c));
    }
  }
  return null;
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
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       THE VIDEO POOL — Wasabi S3 Bucket Scanner              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  // --- Step 1: Configure S3 ---
  let s3Config;
  try {
    s3Config = buildS3Config();
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    console.error('Set S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET in your .env file.');
    process.exit(1);
  }

  const s3 = createS3Client(s3Config);

  console.log(`  Endpoint  : ${s3Config.endpoint}`);
  console.log(`  Bucket    : ${s3Config.bucket}`);
  console.log(`  Region    : ${s3Config.region}`);
  if (opts.prefix)  console.log(`  Prefix    : ${opts.prefix}`);
  if (opts.limit)   console.log(`  Limit     : ${opts.limit.toLocaleString()} files`);
  if (opts.dryRun)  console.log(`  Mode      : DRY RUN (no DB writes)`);
  if (opts.listOnly) console.log(`  Mode      : LIST ONLY`);
  console.log('');

  // --- Step 2: Scan the bucket ---
  console.log('  Scanning bucket...');

  const tracker = new ProgressTracker();
  const allVideoObjects = [];   // { key, size }
  const allImageKeys    = [];   // string[]

  // Initialize error log for this run
  fs.appendFileSync(ERROR_LOG_PATH,
    `\n=== Scan run ${new Date().toISOString()} ===\n`,
    'utf8'
  );

  try {
    for await (const obj of listAllObjects(s3, s3Config.bucket, opts.prefix)) {
      const key = obj.Key;

      if (isVideoFile(key)) {
        tracker.tickScan(true, false);
        allVideoObjects.push({ key, size: obj.Size });

        // Respect --limit flag (count only video files toward the limit)
        if (opts.limit && allVideoObjects.length >= opts.limit) {
          process.stdout.write(`\r  Reached --limit of ${opts.limit}. Stopping scan early.              \n`);
          break;
        }
      } else if (isImageFile(key)) {
        tracker.tickScan(false, true);
        allImageKeys.push(key);
      } else {
        tracker.tickScan(false, false);
      }

      tracker.printScanProgress();
    }
  } catch (err) {
    console.error(`\nERROR scanning bucket: ${err.message}`);
    if (err.message.includes('Access Denied') || err.message.includes('403')) {
      console.error('  → Check your S3_ACCESS_KEY and S3_SECRET_KEY');
    }
    if (err.message.includes('NoSuchBucket') || err.message.includes('404')) {
      console.error(`  → Bucket "${s3Config.bucket}" not found. Check S3_BUCKET.`);
    }
    process.exit(1);
  }

  console.log(`\r  Scan complete: ${tracker.scanned.toLocaleString()} objects found (${tracker.videos.toLocaleString()} videos, ${tracker.images.toLocaleString()} images)                `);
  console.log('');

  // --- Step 3: List-only mode ---
  if (opts.listOnly) {
    const allKeys = allVideoObjects.map(o => o.key).concat(allImageKeys);
    const folderSummary = buildFolderSummary(allKeys.map(k => ({ Key: k })));

    const sorted = [...folderSummary.entries()].sort((a, b) => b[1] - a[1]);
    console.log('  Detected structure:');
    console.log('  ──────────────────────────────────────────────');
    for (const [folder, count] of sorted) {
      const bar = '█'.repeat(Math.min(Math.floor(count / 100), 40));
      console.log(`  ${folder.padEnd(30)} ${String(count).padStart(7).toLocaleString()} files  ${bar}`);
    }
    console.log('  ──────────────────────────────────────────────');
    console.log(`  Total video files : ${tracker.videos.toLocaleString()}`);
    console.log(`  Total image files : ${tracker.images.toLocaleString()}`);
    console.log('');

    tracker.printSummary('list-only');
    process.exit(0);
  }

  if (allVideoObjects.length === 0) {
    console.log('  No video files found in bucket. Check prefix or bucket name.');
    process.exit(0);
  }

  // --- Step 4: Parse all video keys ---
  console.log(`  Parsing ${allVideoObjects.length.toLocaleString()} filenames...`);

  const thumbnailMap = buildThumbnailMap(allImageKeys);

  // Each entry: { parsed, fileUrl, fileKey, fileSize }
  const parsedVideos = [];
  const parseFailures = [];

  for (const { key, size } of allVideoObjects) {
    try {
      const parsed = parseS3Key(key);
      if (!parsed || !parsed.title || !parsed.artist) {
        parseFailures.push({ key, reason: 'Could not extract title or artist' });
        logParseError(key, 'Could not extract title or artist');
        tracker.tickDB('parse_error');
        continue;
      }

      // Build direct public URL
      const fileUrl = buildPublicUrl(s3Config, key);

      // Try to find a matching thumbnail
      const thumbnailUrl = findThumbnail(thumbnailMap, s3Config, parsed.title, parsed.artist);

      parsedVideos.push({
        parsed: { ...parsed, thumbnail_url: thumbnailUrl },
        fileUrl,
        fileKey: key,
        fileSize: size,
      });
    } catch (err) {
      parseFailures.push({ key, reason: err.message });
      logParseError(key, err.message);
      tracker.tickDB('parse_error');
    }
  }

  console.log(`  Parsed successfully: ${parsedVideos.length.toLocaleString()}`);
  if (parseFailures.length > 0) {
    console.log(`  Parse failures    : ${parseFailures.length.toLocaleString()} (logged to ${ERROR_LOG_PATH})`);
    parseFailures.slice(0, 3).forEach(f => {
      console.log(`    ${f.key}`);
      console.log(`      → ${f.reason}`);
    });
    if (parseFailures.length > 3) {
      console.log(`    ... and ${parseFailures.length - 3} more (see error log)`);
    }
  }
  console.log('');

  // --- Step 5: Presigned URL generation mode ---
  if (opts.generateUrls) {
    console.log(`  Generating presigned URLs (expires in ${PRESIGNED_URL_EXPIRY}s / 24h)...`);
    const urlOutput = [];

    for (let i = 0; i < parsedVideos.length; i++) {
      const { parsed, fileKey } = parsedVideos[i];
      try {
        const url = await buildPresignedUrl(s3, s3Config, fileKey);
        urlOutput.push({
          key: fileKey,
          artist: parsed.artist,
          title: parsed.title,
          version: parsed.versionType,
          quality: parsed.quality,
          presignedUrl: url,
        });
      } catch (err) {
        urlOutput.push({ key: fileKey, error: err.message });
      }

      if (i % 100 === 0) {
        process.stdout.write(`\r  Generated ${i.toLocaleString()}/${parsedVideos.length.toLocaleString()} URLs...  `);
      }
    }

    const urlOutputPath = path.join(process.cwd(), 'wasabi-presigned-urls.json');
    fs.writeFileSync(urlOutputPath, JSON.stringify(urlOutput, null, 2), 'utf8');
    console.log(`\n  Presigned URLs written to: ${urlOutputPath}`);
    console.log('');
  }

  // --- Step 6: Dry-run sample output ---
  if (opts.dryRun) {
    console.log('  DRY RUN — Sample of parsed records (first 5):');
    console.log('  ──────────────────────────────────────────────────────────');
    parsedVideos.slice(0, 5).forEach(({ parsed, fileUrl }, i) => {
      console.log(`  [${i + 1}] ${parsed.artist} — ${parsed.title}`);
      console.log(`       Version : ${parsed.versionType} @ ${parsed.quality}`);
      if (parsed.bpm)        console.log(`       BPM     : ${parsed.bpm}`);
      if (parsed.musicalKey) console.log(`       Key     : ${parsed.musicalKey}`);
      if (parsed.genre)      console.log(`       Genre   : ${parsed.genre}`);
      console.log(`       URL     : ${fileUrl}`);
      console.log('');
    });

    // Show folder breakdown
    const folderSummary = buildFolderSummary(allVideoObjects.map(o => ({ Key: o.key })));
    const sorted = [...folderSummary.entries()].sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      console.log('  Detected folder structure:');
      sorted.slice(0, 15).forEach(([folder, count]) => {
        console.log(`    ${folder.padEnd(30)} ${String(count).padStart(7)} files`);
      });
      if (sorted.length > 15) {
        console.log(`    ... and ${sorted.length - 15} more folders`);
      }
      console.log('');
    }

    tracker.parseErrors = parseFailures.length;
    tracker.printSummary('dry-run');
    process.exit(0);
  }

  // --- Step 7: Connect to database ---
  console.log('  Connecting to database...');
  let pool;
  try {
    pool = createPool();
    await pool.query('SELECT 1');
    console.log('  Database connection OK');
  } catch (err) {
    console.error(`  ERROR connecting to database: ${err.message}`);
    process.exit(1);
  }

  // --- Step 8: Import in batches ---
  const totalBatches = Math.ceil(parsedVideos.length / opts.batchSize);
  let processed = 0;

  console.log('');
  console.log(`  Starting import: ${parsedVideos.length.toLocaleString()} videos in ${totalBatches} batches of ${opts.batchSize}`);
  console.log('');

  for (let batchNum = 1; batchNum <= totalBatches; batchNum++) {
    const start = (batchNum - 1) * opts.batchSize;
    const batch = parsedVideos.slice(start, start + opts.batchSize);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const { parsed, fileUrl, fileKey, fileSize } of batch) {
        try {
          const result = await upsertVideoWithVersion(
            client,
            parsed,
            {
              versionType: parsed.versionType,
              quality:     parsed.quality,
              fileUrl,
              fileKey,
              fileSize,
            }
          );
          tracker.tickDB(result);
        } catch (err) {
          tracker.tickDB('failed');
          logDbError(fileKey, err);
          // Per-row failure — don't abort the whole transaction.
          // Rolling back here would undo all previous rows in the batch,
          // so we intentionally keep going. If a row causes a transaction-level
          // error (e.g. constraint), the outer catch handles that.
        }

        processed++;
        tracker.printImportProgress(processed, parsedVideos.length, batchNum, totalBatches);
      }

      await client.query('COMMIT');

    } catch (err) {
      // Transaction-level failure — roll back this batch and log each key
      try { await client.query('ROLLBACK'); } catch (_) {}
      for (const { fileKey } of batch) {
        tracker.tickDB('failed');
        logDbError(fileKey, err);
      }
      processed += batch.length;
      console.error(`\n  Batch ${batchNum} transaction error: ${err.message}`);
    } finally {
      client.release();
    }

    tracker.printImportProgress(processed, parsedVideos.length, batchNum, totalBatches);
  }

  // --- Step 9: Post-import DB stats ---
  try {
    const statsResult = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM videos WHERE is_active = true)     AS video_count,
        (SELECT COUNT(*) FROM video_versions WHERE is_active = true) AS version_count
    `);
    const row = statsResult.rows[0];
    console.log('');
    console.log(`  Total videos in database  : ${parseInt(row.video_count).toLocaleString()}`);
    console.log(`  Total versions in database: ${parseInt(row.version_count).toLocaleString()}`);
  } catch (_) {
    // Non-critical
  }

  tracker.parseErrors = parseFailures.length;
  tracker.printSummary('import');

  await pool.end();
  process.exit(tracker.failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('\nFATAL ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});
