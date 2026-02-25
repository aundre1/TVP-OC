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
 * Extract S3 object key from a full Wasabi URL.
 *
 * Input:  "https://s3.wasabisys.com/thevideopool-us/videos/Artist - Title.mp4"
 * Output: "videos/Artist - Title.mp4"
 *
 * Also handles bare keys (no protocol prefix) passed directly.
 */
function extractKey(url) {
  if (!url) return null;

  // Already a bare key (no http/https)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url.replace(/^\/+/, '') || null;
  }

  try {
    const parsed = new URL(url);
    // pathname is like "/thevideopool-us/videos/Artist%20-%20Title.mp4"
    // Decode percent-encoding so the S3 SDK receives the raw object key
    // (the SDK will re-encode it correctly when building the signed URL)
    const decoded = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
    const bucketPrefix = `${BUCKET}/`;

    if (decoded.startsWith(bucketPrefix)) {
      return decoded.slice(bucketPrefix.length) || null;
    }

    // Fallback: return decoded path (minus leading slash)
    return decoded || null;
  } catch {
    return null;
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
  const key = extractKey(fileUrl);
  if (!key) throw new Error(`Invalid file URL: ${fileUrl}`);

  const command = new GetObjectCommand({
    Bucket: BUCKET,
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
  const key = extractKey(previewUrl);
  if (!key) throw new Error(`Invalid preview URL: ${previewUrl}`);

  const command = new GetObjectCommand({
    Bucket: BUCKET,
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
