// ===========================================
// THE VIDEO POOL - S3 Service
// AWS S3/Wasabi integration for video storage
// ===========================================

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ===========================================
// S3 CLIENT CONFIGURATION
// ===========================================

// Create S3 client - supports both AWS S3 and Wasabi
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT, // For Wasabi: https://s3.wasabisys.com
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  },
  // Force path-style for Wasabi compatibility
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
});

const BUCKET_NAME = process.env.S3_BUCKET || 'tvp-videos';
const THUMBNAILS_BUCKET = process.env.S3_THUMBNAILS_BUCKET || 'tvp-thumbnails';

// ===========================================
// DOWNLOAD URL GENERATION
// ===========================================

/**
 * Generate a signed URL for downloading a file
 * @param {string} key - The S3 object key (file path)
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns {string} - The signed URL
 */
export async function getSignedDownloadUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${getFilenameFromKey(key)}"`
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed download URL:', error);
    throw new Error('Failed to generate download URL');
  }
}

/**
 * Generate a signed URL for downloading with custom filename
 * @param {string} key - The S3 object key
 * @param {string} filename - Custom filename for download
 * @param {number} expiresIn - URL expiration in seconds
 * @returns {string} - The signed URL
 */
export async function getSignedDownloadUrlWithFilename(key, filename, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed download URL:', error);
    throw new Error('Failed to generate download URL');
  }
}

// ===========================================
// UPLOAD URL GENERATION
// ===========================================

/**
 * Generate a signed URL for uploading a file
 * @param {string} key - The S3 object key (file path)
 * @param {string} contentType - The MIME type of the file
 * @param {number} expiresIn - URL expiration time in seconds (default: 15 minutes)
 * @returns {Object} - { uploadUrl, key }
 */
export async function getSignedUploadUrl(key, contentType, expiresIn = 900) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return {
      uploadUrl: signedUrl,
      key,
      expiresIn
    };
  } catch (error) {
    console.error('Error generating signed upload URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

/**
 * Generate a signed URL for uploading a thumbnail
 * @param {string} key - The S3 object key
 * @param {string} contentType - The MIME type (image/jpeg, image/png, etc.)
 * @param {number} expiresIn - URL expiration in seconds
 * @returns {Object} - { uploadUrl, key }
 */
export async function getSignedThumbnailUploadUrl(key, contentType, expiresIn = 900) {
  const command = new PutObjectCommand({
    Bucket: THUMBNAILS_BUCKET,
    Key: key,
    ContentType: contentType
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return {
      uploadUrl: signedUrl,
      key,
      expiresIn
    };
  } catch (error) {
    console.error('Error generating signed thumbnail upload URL:', error);
    throw new Error('Failed to generate thumbnail upload URL');
  }
}

// ===========================================
// FILE OPERATIONS
// ===========================================

/**
 * Check if a file exists in S3
 * @param {string} key - The S3 object key
 * @returns {boolean} - Whether the file exists
 */
export async function fileExists(key) {
  const command = new HeadObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Get file metadata from S3
 * @param {string} key - The S3 object key
 * @returns {Object|null} - File metadata or null if not found
 */
export async function getFileMetadata(key) {
  const command = new HeadObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  try {
    const response = await s3Client.send(command);
    return {
      size: response.ContentLength,
      contentType: response.ContentType,
      lastModified: response.LastModified,
      etag: response.ETag,
      metadata: response.Metadata
    };
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Delete a file from S3
 * @param {string} key - The S3 object key
 * @returns {boolean} - Whether the deletion was successful
 */
export async function deleteFile(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file');
  }
}

// ===========================================
// URL UTILITIES
// ===========================================

/**
 * Generate a public URL for a thumbnail (if bucket is public)
 * @param {string} key - The thumbnail key
 * @returns {string} - The public URL
 */
export function getThumbnailUrl(key) {
  const endpoint = process.env.S3_ENDPOINT || `https://s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com`;

  // Handle different endpoint formats
  if (process.env.S3_FORCE_PATH_STYLE === 'true') {
    return `${endpoint}/${THUMBNAILS_BUCKET}/${key}`;
  }

  // Virtual-hosted style (default for AWS)
  const baseUrl = endpoint.replace('https://', `https://${THUMBNAILS_BUCKET}.`);
  return `${baseUrl}/${key}`;
}

/**
 * Generate the S3 key for a video file
 * @param {number} videoId - The video ID
 * @param {string} quality - Video quality (4k, 1080p, 720p, 480p)
 * @param {string} version - Version type (clean, explicit, extended, etc.)
 * @returns {string} - The S3 key
 */
export function generateVideoKey(videoId, quality, version) {
  return `videos/${videoId}/${version}/${quality}.mp4`;
}

/**
 * Generate the S3 key for a thumbnail
 * @param {number} videoId - The video ID
 * @param {string} size - Thumbnail size (sm, md, lg)
 * @returns {string} - The S3 key
 */
export function generateThumbnailKey(videoId, size = 'md') {
  return `thumbnails/${videoId}/${size}.jpg`;
}

/**
 * Extract filename from S3 key
 * @param {string} key - The S3 object key
 * @returns {string} - The filename
 */
function getFilenameFromKey(key) {
  const parts = key.split('/');
  return parts[parts.length - 1] || 'download';
}

/**
 * Validate file type for upload
 * @param {string} contentType - The MIME type
 * @param {string} type - 'video' or 'image'
 * @returns {boolean} - Whether the file type is valid
 */
export function isValidFileType(contentType, type = 'video') {
  const allowedTypes = {
    video: [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska'
    ],
    image: [
      'image/jpeg',
      'image/png',
      'image/webp'
    ]
  };

  return allowedTypes[type]?.includes(contentType) || false;
}

// ===========================================
// BATCH OPERATIONS
// ===========================================

/**
 * Generate signed URLs for multiple files
 * @param {Array<string>} keys - Array of S3 object keys
 * @param {number} expiresIn - URL expiration in seconds
 * @returns {Object} - Map of key to signed URL
 */
export async function getSignedDownloadUrlsBatch(keys, expiresIn = 3600) {
  const results = {};

  await Promise.all(
    keys.map(async (key) => {
      try {
        results[key] = await getSignedDownloadUrl(key, expiresIn);
      } catch (error) {
        console.error(`Error generating URL for ${key}:`, error);
        results[key] = null;
      }
    })
  );

  return results;
}

export default {
  getSignedDownloadUrl,
  getSignedDownloadUrlWithFilename,
  getSignedUploadUrl,
  getSignedThumbnailUploadUrl,
  fileExists,
  getFileMetadata,
  deleteFile,
  getThumbnailUrl,
  generateVideoKey,
  generateThumbnailKey,
  isValidFileType,
  getSignedDownloadUrlsBatch
};
