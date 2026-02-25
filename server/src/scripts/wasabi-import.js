#!/usr/bin/env node
// ===========================================
// THE VIDEO POOL — Targeted Wasabi Importer
// Handles EXACT bucket structure:
//   videos/Artist - Title (Version).mp4
//   thumbnails/Artist - Title_thumb.jpg
//   previews/Artist - Title_preview.mp4
//
// Usage:
//   node wasabi-import.js              # full import
//   node wasabi-import.js --dry-run    # parse only, show first 20, no DB writes
//   node wasabi-import.js --limit 500  # import first N videos
//   node wasabi-import.js --dry-run --limit 20 --with-metadata
//                                      # dry-run with HeadObject metadata probe
// ===========================================

import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load .env from server/ directory (also tries parent)
dotenv.config();
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../.env') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

// ===========================================
// CONSTANTS
// ===========================================

const BUCKET        = process.env.S3_BUCKET    || 'thevideopool-us';
const REGION        = process.env.S3_REGION    || 'us-east-1';
const ENDPOINT      = `https://${process.env.S3_ENDPOINT || 's3.wasabisys.com'}`;
const ACCESS_KEY    = process.env.S3_ACCESS_KEY || '4B2DY9N2MSWPMHUC3972';
const SECRET_KEY    = process.env.S3_SECRET_KEY || 'zSDaEzzQFt6FoYhwzTwwFOeNSPImp0Nk2J2Ufl0K';
const BATCH_SIZE    = 100;
const LIST_PAGE     = 1000;

// HeadObject concurrency limit (--with-metadata mode)
const META_CONCURRENCY = 50;
// Sample size: probe this many files before deciding whether to fetch all
const META_SAMPLE_SIZE = 20;

// URL builders
const videoUrl     = (filename) => `https://s3.wasabisys.com/${BUCKET}/videos/${encodeURIComponent(filename)}.mp4`;
const thumbUrl     = (filename) => `https://s3.wasabisys.com/${BUCKET}/thumbnails/${encodeURIComponent(filename)}_thumb.jpg`;
const previewUrl   = (filename) => `https://s3.wasabisys.com/${BUCKET}/previews/${encodeURIComponent(filename)}_preview.mp4`;

// Version type keywords (matched against last parenthetical only)
const VERSION_MARKERS = [
  { pattern: /^dirty$/i,                       type: 'explicit'     },
  { pattern: /^explicit$/i,                    type: 'explicit'     },
  { pattern: /^uncensored$/i,                  type: 'explicit'     },
  { pattern: /^clean$/i,                       type: 'clean'        },
  { pattern: /^radio\s*edit$/i,                type: 'clean'        },
  { pattern: /^radio$/i,                       type: 'clean'        },
  { pattern: /^intro$/i,                       type: 'clean'        },
  { pattern: /^quick\s*hitter$/i,              type: 'clean'        },
  { pattern: /^xtendz$/i,                      type: 'extended'     },
  { pattern: /^ext(?:ended)?\.?$/i,            type: 'extended'     },
  { pattern: /^extended$/i,                    type: 'extended'     },
  { pattern: /^acapella$/i,                    type: 'instrumental' },
  { pattern: /^a\s*capella$/i,                 type: 'instrumental' },
  { pattern: /^instrumental$/i,               type: 'instrumental' },
];

// Quality markers (last paren) — these mean clean version but specify quality
const QUALITY_MARKERS = [
  { pattern: /^4[kK]$/,           quality: '4k'    },
  { pattern: /^2160p$/i,          quality: '4k'    },
  { pattern: /^1080p$/i,          quality: '1080p' },
  { pattern: /^hd$/i,             quality: '1080p' },
  { pattern: /^hq$/i,             quality: '1080p' },
  { pattern: /^720p$/i,           quality: '720p'  },
];

// Valid DB enums
const VALID_VERSION_TYPES = new Set(['clean', 'dirty', 'explicit', 'radio', 'extended', 'remix', 'instrumental', 'acapella']);
const VALID_QUALITIES     = new Set(['720p', '1080p', '4k']);

// ===========================================
// CLI ARGS
// ===========================================

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = { dryRun: false, limit: null, withMetadata: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run')       opts.dryRun = true;
    if (args[i] === '--with-metadata') opts.withMetadata = true;
    if (args[i] === '--limit' && args[i + 1]) {
      opts.limit = parseInt(args[++i], 10) || null;
    }
  }

  return opts;
}

// ===========================================
// S3 CLIENT
// ===========================================

function createS3() {
  return new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
    forcePathStyle: true,
  });
}

// ===========================================
// S3 LISTING (paginated generator)
// ===========================================

async function* listPrefix(s3, prefix) {
  let continuationToken;

  do {
    const cmd = new ListObjectsV2Command({
      Bucket:  BUCKET,
      Prefix:  prefix,
      MaxKeys: LIST_PAGE,
      ...(continuationToken ? { ContinuationToken: continuationToken } : {}),
    });

    const resp = await s3.send(cmd);
    for (const obj of resp.Contents || []) {
      yield obj.Key;
    }
    continuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (continuationToken);
}

// ===========================================
// FILENAME PARSER
// ===========================================

/**
 * Parse a filename stem (no folder, no extension) into structured metadata.
 *
 * Input example:  "2 Chainz  ft. Kanye West - Birthday Song (HD)"
 * Returns: { artist, title, versionType, quality }
 */
function parseFilename(stem) {
  // Step 1: Try splitting on " - " first, then fall back to "- " (no leading space)
  let dashIdx = stem.indexOf(' - ');
  let splitWidth = 3;

  if (dashIdx === -1) {
    // Try "- " with no leading space (e.g. "Artist- Title")
    dashIdx = stem.indexOf('- ');
    splitWidth = 2;
  }

  if (dashIdx === -1) {
    // No " - " or "- " separator at all — treat whole thing as title, artist unknown
    return {
      artist:      'Unknown',
      title:       stem.trim(),
      versionType: 'clean',
      quality:     '1080p',
    };
  }

  let artistRaw = stem.slice(0, dashIdx);
  let rest      = stem.slice(dashIdx + splitWidth);  // everything after separator

  // Step 2: Normalize artist — strip track number prefix (e.g. "01. ", "1. "), collapse spaces
  const artist = artistRaw
    .replace(/^\d+[.)]\s*/, '')   // strip leading "01. " or "1) "
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Step 3: Extract the LAST parenthetical from rest
  // Match the last (...) group at the end (with optional trailing whitespace)
  const lastParenMatch = rest.match(/^(.*)\(([^)]+)\)\s*$/);

  let title       = rest.trim();
  let versionType = 'clean';
  let quality     = '1080p';

  if (lastParenMatch) {
    const beforeParen = lastParenMatch[1];
    const parenContent = lastParenMatch[2].trim();

    // Check if last paren is a VERSION marker
    const versionMatch = VERSION_MARKERS.find(v => v.pattern.test(parenContent));
    if (versionMatch) {
      versionType = versionMatch.type;
      title = beforeParen.replace(/\s+$/, '').trim();
      // title might still have trailing parens (remix, feat, etc.) — keep them
    } else {
      // Check if last paren is a QUALITY marker
      const qualityMatch = QUALITY_MARKERS.find(q => q.pattern.test(parenContent));
      if (qualityMatch) {
        quality     = qualityMatch.quality;
        versionType = 'clean';
        title = beforeParen.replace(/\s+$/, '').trim();
      } else {
        // It's a remix/feat/other — keep the whole thing in the title
        title = rest.trim();
      }
    }
  }

  // Clean up title: collapse extra spaces
  title = title.replace(/\s{2,}/g, ' ').trim();

  // Ensure title is non-empty
  if (!title) title = rest.trim() || stem.trim();

  return { artist, title, versionType, quality };
}

// ===========================================
// THUMBNAIL & PREVIEW MATCHING
// ===========================================

/**
 * Build a Set of base names (without _thumb.jpg) from thumbnails/ listing.
 * Key stored: lowercase stem for case-insensitive matching.
 */
async function buildThumbSet(s3) {
  const thumbs = new Set();
  console.log('  Building thumbnail index...');
  let count = 0;

  for await (const key of listPrefix(s3, 'thumbnails/')) {
    if (!key.endsWith('_thumb.jpg')) continue;
    // Extract: "thumbnails/Artist - Title_thumb.jpg" → "Artist - Title"
    const base = path.basename(key, '_thumb.jpg');
    thumbs.add(base.toLowerCase());
    count++;
    if (count % 5000 === 0) process.stdout.write(`\r  Thumbnails indexed: ${count.toLocaleString()}  `);
  }

  process.stdout.write(`\r  Thumbnails indexed: ${count.toLocaleString()}             \n`);
  return thumbs;
}

/**
 * Build a Set of base names (without _preview.mp4) from previews/ listing.
 */
async function buildPreviewSet(s3) {
  const previews = new Set();
  console.log('  Building preview index...');
  let count = 0;

  for await (const key of listPrefix(s3, 'previews/')) {
    if (!key.endsWith('_preview.mp4')) continue;
    const base = path.basename(key, '_preview.mp4');
    previews.add(base.toLowerCase());
    count++;
    if (count % 5000 === 0) process.stdout.write(`\r  Previews indexed: ${count.toLocaleString()}  `);
  }

  process.stdout.write(`\r  Previews indexed: ${count.toLocaleString()}             \n`);
  return previews;
}

// ===========================================
// DATABASE
// ===========================================

function createPool() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set.\n' +
      'Set it in server/.env or pass it as an env var:\n' +
      '  DATABASE_URL="postgres://..." node src/scripts/wasabi-import.js --dry-run'
    );
  }
  return new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });
}

/**
 * Upsert a video record (ON CONFLICT on title+artist unique index from migration 011).
 * Returns the video id.
 */
async function upsertVideo(client, { title, artist, thumbnailUrl }) {
  const result = await client.query(
    `INSERT INTO videos (title, artist, thumbnail_url, genre, is_active, download_count, created_at)
     VALUES ($1, $2, $3, 'Unknown', true, 0, NOW())
     ON CONFLICT (title, artist) DO UPDATE SET
       thumbnail_url = COALESCE(EXCLUDED.thumbnail_url, videos.thumbnail_url),
       updated_at    = NOW()
     RETURNING id`,
    [title, artist, thumbnailUrl || null]
  );
  return result.rows[0].id;
}

/**
 * Upsert a video_version record.
 */
async function upsertVersion(client, { videoId, versionType, fileUrl, quality, prevUrl }) {
  // Clamp to valid DB enums
  const safeType    = VALID_VERSION_TYPES.has(versionType) ? versionType : 'clean';
  const safeQuality = VALID_QUALITIES.has(quality)         ? quality     : '1080p';

  await client.query(
    `INSERT INTO video_versions (video_id, version_type, file_url, quality, file_format, is_active, encoding_status)
     VALUES ($1, $2, $3, $4, 'mp4', true, 'complete')
     ON CONFLICT (video_id, version_type, quality) DO UPDATE SET
       file_url   = EXCLUDED.file_url,
       updated_at = NOW()`,
    [videoId, safeType, fileUrl, safeQuality]
  );
}

// ===========================================
// GROUPING LOGIC
// ===========================================

/**
 * Group parsed video files by normalized artist|title key.
 * Returns Map<groupKey, { artist, title, versions: [] }>
 */
function groupVideos(parsedFiles) {
  const groups = new Map();

  for (const file of parsedFiles) {
    const { artist, title, versionType, quality, stem } = file;
    const groupKey = `${artist.toLowerCase()}|${title.toLowerCase()}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, { artist, title, versions: [] });
    }

    groups.get(groupKey).versions.push({ versionType, quality, stem });
  }

  return groups;
}

// ===========================================
// MAIN
// ===========================================

async function main() {
  const opts = parseArgs(process.argv);

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        THE VIDEO POOL — Targeted Wasabi Importer             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Bucket  : ${BUCKET}`);
  console.log(`  Region  : ${REGION}`);
  console.log(`  Mode    : ${opts.dryRun ? 'DRY RUN (no DB writes)' : 'IMPORT'}`);
  if (opts.limit) console.log(`  Limit   : first ${opts.limit.toLocaleString()} video files`);
  console.log('');

  const s3 = createS3();
  const startTime = Date.now();

  // ─── Step 1: List all videos/ files ───────────────────────────────────────
  console.log('  Listing videos/ in thevideopool-us...');

  const videoFiles = [];
  let scanCount = 0;

  for await (const key of listPrefix(s3, 'videos/')) {
    scanCount++;

    // Skip non-mp4, skip hidden/tool folders
    if (!key.endsWith('.mp4'))                   continue;
    if (key.includes('/.'))                      continue;
    if (key.includes('.claude/'))                continue;
    if (key.includes('.vscode/'))                continue;

    // Extract just the filename stem (no folder, no .mp4)
    const stem = path.basename(key, '.mp4');

    // Parse
    const { artist, title, versionType, quality } = parseFilename(stem);
    videoFiles.push({ stem, artist, title, versionType, quality });

    if (opts.limit && videoFiles.length >= opts.limit) break;

    if (scanCount % 2000 === 0) {
      process.stdout.write(`\r  Scanned ${scanCount.toLocaleString()} objects, ${videoFiles.length.toLocaleString()} videos found...  `);
    }
  }

  process.stdout.write(`\r  Found ${videoFiles.length.toLocaleString()} video files (scanned ${scanCount.toLocaleString()} objects)          \n`);
  console.log('');

  // ─── Step 2: Group into unique video records ───────────────────────────────
  console.log('  Grouping into unique videos...');
  const groups = groupVideos(videoFiles);
  console.log(`  Unique titles: ${groups.size.toLocaleString()} (${videoFiles.length.toLocaleString()} total versions)`);
  console.log('');

  // ─── Step 3: DRY RUN ──────────────────────────────────────────────────────
  if (opts.dryRun) {
    console.log('  ─── DRY RUN — First 20 parsed videos ───');
    console.log('');

    let shown = 0;
    for (const [, group] of groups) {
      if (shown >= 20) break;
      shown++;

      console.log(`  [${String(shown).padStart(2)}] ${group.artist} — ${group.title}`);
      for (const v of group.versions) {
        const vUrl   = videoUrl(v.stem);
        const tUrl   = thumbUrl(v.stem.replace(/ - .+$/, ` - ${group.title}`));
        const pUrl   = previewUrl(v.stem.replace(/ - .+$/, ` - ${group.title}`));
        console.log(`        version : ${v.versionType}  quality : ${v.quality}`);
        console.log(`        file    : ${vUrl}`);
      }
      console.log('');
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('═══════════════════════════════════════════════════════');
    console.log('  DRY RUN COMPLETE  (nothing written to database)');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Video files parsed   : ${videoFiles.length.toLocaleString()}`);
    console.log(`  Unique video records : ${groups.size.toLocaleString()}`);
    console.log(`  Elapsed              : ${elapsed}s`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('  Run without --dry-run to start importing.');
    console.log('');
    process.exit(0);
  }

  // ─── Step 4: Build thumbnail + preview index ───────────────────────────────
  const thumbSet   = await buildThumbSet(s3);
  const previewSet = await buildPreviewSet(s3);
  console.log('');

  // ─── Step 5: Connect to DB ────────────────────────────────────────────────
  console.log('  Connecting to database...');
  let pool;
  try {
    pool = createPool();
    await pool.query('SELECT 1');
    console.log('  Database connection OK');
  } catch (err) {
    console.error(`\n  ERROR: ${err.message}`);
    process.exit(1);
  }
  console.log('');

  // ─── Step 6: Import in batches ────────────────────────────────────────────
  const groupsArr    = [...groups.entries()];
  const totalGroups  = groupsArr.length;
  const totalBatches = Math.ceil(totalGroups / BATCH_SIZE);

  let videosUpserted   = 0;
  let versionsUpserted = 0;
  let failed           = 0;
  let processed        = 0;

  console.log(`  Importing ${totalGroups.toLocaleString()} videos in ${totalBatches} batches of ${BATCH_SIZE}...`);
  console.log('');

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    const batchNum  = batchIdx + 1;
    const batchStart = batchIdx * BATCH_SIZE;
    const batch      = groupsArr.slice(batchStart, batchStart + BATCH_SIZE);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const [, group] of batch) {
        // Use a SAVEPOINT per row so a row failure doesn't abort the whole transaction
        await client.query('SAVEPOINT sp_row');
        try {
          // Build thumbnail URL if we have a matching thumbnail
          // Thumbnails are named: "Artist - Title_thumb.jpg"
          const thumbStem    = `${group.artist} - ${group.title}`;
          const hasThumbnail = thumbSet.has(thumbStem.toLowerCase());
          const thumbnail    = hasThumbnail ? thumbUrl(thumbStem) : null;

          const videoId = await upsertVideo(client, {
            title:        group.title,
            artist:       group.artist,
            thumbnailUrl: thumbnail,
          });
          videosUpserted++;

          // Upsert each version
          for (const ver of group.versions) {
            const fUrl = videoUrl(ver.stem);
            const pStem = `${group.artist} - ${group.title}`;
            const hasPreview = previewSet.has(pStem.toLowerCase());
            const pUrl = hasPreview ? previewUrl(pStem) : null;

            await upsertVersion(client, {
              videoId,
              versionType: ver.versionType,
              fileUrl:     fUrl,
              quality:     ver.quality,
              prevUrl:     pUrl,
            });
            versionsUpserted++;
          }

          await client.query('RELEASE SAVEPOINT sp_row');
        } catch (err) {
          // Roll back only this row, keep the transaction alive
          await client.query('ROLLBACK TO SAVEPOINT sp_row');
          await client.query('RELEASE SAVEPOINT sp_row');
          failed++;
          // Only print first 5 failures to avoid log spam
          if (failed <= 5) {
            console.error(`\n  WARN: Failed on "${group.artist} - ${group.title}": ${err.message}`);
          } else if (failed === 6) {
            console.error(`\n  (further row warnings suppressed...)`);
          }
        }

        processed++;
      }

      await client.query('COMMIT');

    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (_) {}
      failed += batch.length;
      console.error(`\n  ERROR: Batch ${batchNum} transaction failed: ${err.message}`);
      processed += batch.length;
    } finally {
      client.release();
    }

    // Progress line
    const pct = Math.round((processed / totalGroups) * 100);
    process.stdout.write(
      `\r  Importing batch ${String(batchNum).padStart(5)}/${totalBatches}  ` +
      `(${processed.toLocaleString()}/${totalGroups.toLocaleString()} videos, ${pct}%)  `
    );
  }

  console.log('');
  console.log('');

  // ─── Step 7: Final DB stats ────────────────────────────────────────────────
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM videos WHERE is_active = true)                 AS video_count,
        (SELECT COUNT(*) FROM video_versions WHERE is_active = true)         AS version_count
    `);
    const row = stats.rows[0];
    console.log(`  DB totals after import:`);
    console.log(`    Videos in DB   : ${parseInt(row.video_count).toLocaleString()}`);
    console.log(`    Versions in DB : ${parseInt(row.version_count).toLocaleString()}`);
  } catch (_) { /* non-critical */ }

  const elapsed = ((Date.now() - startTime) / 1000);
  const elapsedStr = elapsed >= 60
    ? `${Math.floor(elapsed / 60)}m ${Math.round(elapsed % 60)}s`
    : `${elapsed.toFixed(1)}s`;

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  IMPORT COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Videos upserted  : ${videosUpserted.toLocaleString()}`);
  console.log(`  Versions upserted: ${versionsUpserted.toLocaleString()}`);
  console.log(`  Failed           : ${failed.toLocaleString()}`);
  console.log(`  Time             : ${elapsedStr}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('\nFATAL ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});
