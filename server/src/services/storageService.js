// ===========================================
// THE VIDEO POOL - Storage Service
// Wasabi S3 presigned URL generation
// Converts stored full URLs → time-limited signed URLs
// ===========================================

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: `https://${process.env.S3_ENDPOINT || 's3.wasabisys.com'}`,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true, // Required for Wasabi path-style URLs
});

const BUCKET = process.env.S3_BUCKET || 'thevideopool-us';
const URL_EXPIRY = 3600; // 1 hour

// ===========================================
// KEY EXTRACTION
// ===========================================

/**
 * Extract S3 bucket and object key from a full Wasabi URL.
 *
 * Input:  "https://s3.wasabisys.com/thevideopool-us/videos/Artist - Title.mp4"
 * Output: { bucket: "thevideopool-us", key: "videos/Artist - Title.mp4" }
 *
 * Handles both thevideopool-us (bulk import) and tvp-videos (seed) buckets.
 * Also handles bare keys (no protocol prefix) passed directly.
 */
function extractBucketAndKey(url) {
  if (!url) return { bucket: BUCKET, key: null };

  // Already a bare key (no http/https)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return { bucket: BUCKET, key: url.replace(/^\/+/, '') || null };
  }

  try {
    const parsed = new URL(url);
    // pathname is like "/thevideopool-us/videos/Artist%20-%20Title.mp4"
    // Decode percent-encoding so the S3 SDK receives the raw object key
    const decoded = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
    const slashIdx = decoded.indexOf('/');
    if (slashIdx === -1) return { bucket: BUCKET, key: null };
    return {
      bucket: decoded.slice(0, slashIdx),        // e.g. "thevideopool-us" or "tvp-videos"
      key:    decoded.slice(slashIdx + 1) || null // e.g. "videos/Artist - Title.mp4"
    };
  } catch {
    return { bucket: BUCKET, key: null };
  }
}

// ===========================================
// PRESIGNED URL GENERATORS
// ===========================================

/**
 * Generate a presigned download URL for a video file.
 * Sets Content-Disposition: attachment so the browser downloads rather than streams.
 *
 * @param {string} fileUrl - Full Wasabi URL stored in DB (file_url column)
 * @param {number} expiresIn - Seconds until URL expires (default: 3600)
 * @returns {Promise<string>} Presigned URL
 */
export async function getPresignedDownloadUrl(fileUrl, expiresIn = URL_EXPIRY) {
  const { bucket, key } = extractBucketAndKey(fileUrl);
  if (!key) throw new Error(`Invalid file URL: ${fileUrl}`);

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: 'attachment', // forces browser download
  });

  return getSignedUrl(s3, command, { expiresIn });
}

/**
 * Generate a presigned URL for a preview clip.
 * No Content-Disposition override — browser can stream inline.
 *
 * @param {string} previewUrl - Full Wasabi URL stored in DB (preview_url column)
 * @param {number} expiresIn - Seconds until URL expires (default: 3600)
 * @returns {Promise<string>} Presigned URL
 */
export async function getPresignedPreviewUrl(previewUrl, expiresIn = URL_EXPIRY) {
  const { bucket, key } = extractBucketAndKey(previewUrl);
  if (!key) throw new Error(`Invalid preview URL: ${previewUrl}`);

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn });
}

/**
 * Returns true if S3 credentials are present in environment.
 * Used as a gate: if false, routes fall back to returning the raw URL.
 *
 * @returns {boolean}
 */
export function isStorageConfigured() {
  return !!(process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY);
}
