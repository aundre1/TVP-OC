// ===========================================
// THE VIDEO POOL - Download Service
// Business logic for download operations
// ===========================================

import { pool } from "../db/pool.js";
import { getSignedDownloadUrl } from "./s3Service.js";

// ===========================================
// DOWNLOAD LIMIT CHECKING
// ===========================================

/**
 * Check if a user can download based on their membership limits
 * @param {number} userId - The user's ID
 * @returns {Object} - { canDownload, remaining, limit, resetDate, reason }
 */
export async function checkDownloadLimit(userId) {
  const query = `
    SELECT
      u.id,
      u.membership_type,
      u.status AS membership_status,
      u.downloads_this_month AS downloads_used,
      u.downloads_reset_monthly AS download_limit_reset_date,
      m.monthly_download_limit as tier_limit
    FROM users u
    LEFT JOIN memberships m ON m.slug = u.membership_type::text
    WHERE u.id = $1
  `;

  try {
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return {
        canDownload: false,
        remaining: 0,
        limit: 0,
        resetDate: null,
        reason: "User not found",
      };
    }

    const user = result.rows[0];

    // Check membership status
    if (
      user.membership_status !== "active" &&
      user.membership_status !== "trial"
    ) {
      return {
        canDownload: false,
        remaining: 0,
        limit: user.tier_limit || 0,
        resetDate: user.download_limit_reset_date,
        reason: "Membership not active",
      };
    }

    // Use tier limit from memberships table
    const effectiveLimit = user.tier_limit;

    // NULL limit means unlimited
    if (effectiveLimit === null) {
      return {
        canDownload: true,
        remaining: null, // null indicates unlimited
        limit: null,
        resetDate: null,
        reason: null,
      };
    }

    // Check if reset is needed
    const now = new Date();
    const resetDate = user.download_limit_reset_date
      ? new Date(user.download_limit_reset_date)
      : null;

    let downloadsUsed = user.downloads_used || 0;

    // If past reset date, reset the counter
    if (resetDate && now >= resetDate) {
      // Reset downloads used
      const nextResetDate = getNextResetDate();
      await pool.query(
        `
        UPDATE users
        SET downloads_this_month = 0, downloads_reset_monthly = $1
        WHERE id = $2
      `,
        [nextResetDate, userId],
      );

      downloadsUsed = 0;
    }

    const remaining = Math.max(0, effectiveLimit - downloadsUsed);

    return {
      canDownload: remaining > 0,
      remaining,
      limit: effectiveLimit,
      resetDate: resetDate || getNextResetDate(),
      reason: remaining > 0 ? null : "Download limit reached",
    };
  } catch (error) {
    console.error("Error in checkDownloadLimit:", error);
    throw error;
  }
}

// ===========================================
// ATOMIC CHECK + RECORD (Race-condition safe)
// ===========================================

/**
 * Atomically check download limit AND record a download in a single transaction.
 * Uses SELECT ... FOR UPDATE to lock the user row, preventing concurrent
 * requests from bypassing the quota.
 *
 * @param {number} userId - The user's ID
 * @param {number} videoId - The video's ID
 * @param {string} quality - Video quality (4k, 1080p, 720p, 480p)
 * @param {string} version - Version type (clean, explicit, extended, etc.)
 * @returns {Object} - { canDownload, remaining, limit, resetDate, reason, download }
 */
export async function checkAndRecordDownload(
  userId,
  videoId,
  quality,
  version,
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the user row to prevent concurrent bypass
    const userResult = await client.query(
      `
      SELECT
        u.id,
        u.membership_type,
        u.status AS membership_status,
        u.downloads_this_month AS downloads_used,
        u.downloads_reset_monthly AS download_limit_reset_date,
        m.monthly_download_limit AS tier_limit
      FROM users u
      LEFT JOIN memberships m ON m.slug = u.membership_type::text
      WHERE u.id = $1
      FOR UPDATE OF u
    `,
      [userId],
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return {
        canDownload: false,
        remaining: 0,
        limit: 0,
        resetDate: null,
        reason: "User not found",
        download: null,
      };
    }

    const user = userResult.rows[0];

    // Check membership status
    if (
      user.membership_status !== "active" &&
      user.membership_status !== "trial"
    ) {
      await client.query("ROLLBACK");
      return {
        canDownload: false,
        remaining: 0,
        limit: user.tier_limit || 0,
        resetDate: user.download_limit_reset_date,
        reason: "Membership not active",
        download: null,
      };
    }

    const effectiveLimit = user.tier_limit;

    // NULL limit means unlimited — skip quota checks
    if (effectiveLimit === null) {
      // Record download (unlimited user)
      const download = await _insertDownload(
        client,
        userId,
        videoId,
        quality,
        version,
      );
      await client.query("COMMIT");
      return {
        canDownload: true,
        remaining: null,
        limit: null,
        resetDate: null,
        reason: null,
        download,
      };
    }

    // Check if monthly reset is needed
    const now = new Date();
    const resetDate = user.download_limit_reset_date
      ? new Date(user.download_limit_reset_date)
      : null;
    let downloadsUsed = user.downloads_used || 0;

    if (resetDate && now >= resetDate) {
      const nextResetDate = getNextResetDate();
      await client.query(
        `
        UPDATE users
        SET downloads_this_month = 0, downloads_reset_monthly = $1
        WHERE id = $2
      `,
        [nextResetDate, userId],
      );
      downloadsUsed = 0;
    }

    const remaining = Math.max(0, effectiveLimit - downloadsUsed);

    if (remaining <= 0) {
      await client.query("ROLLBACK");
      return {
        canDownload: false,
        remaining: 0,
        limit: effectiveLimit,
        resetDate: resetDate || getNextResetDate(),
        reason: "Download limit reached",
        download: null,
      };
    }

    // Limit OK — record the download atomically
    const download = await _insertDownload(
      client,
      userId,
      videoId,
      quality,
      version,
    );

    await client.query("COMMIT");

    return {
      canDownload: true,
      remaining: remaining - 1,
      limit: effectiveLimit,
      resetDate: resetDate || getNextResetDate(),
      reason: null,
      download,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in checkAndRecordDownload:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Internal helper: insert download record + increment counters.
 * Must be called within an existing transaction (with client).
 */
async function _insertDownload(client, userId, videoId, quality, version) {
  const insertResult = await client.query(
    `
    INSERT INTO downloads (user_id, video_id, version_type, quality)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
    [userId, videoId, version, quality],
  );

  await client.query(
    `
    UPDATE users
    SET downloads_this_month = COALESCE(downloads_this_month, 0) + 1,
        total_downloads = COALESCE(total_downloads, 0) + 1
    WHERE id = $1
  `,
    [userId],
  );

  await client.query(
    `
    UPDATE videos
    SET download_count = COALESCE(download_count, 0) + 1
    WHERE id = $1
  `,
    [videoId],
  );

  return {
    id: insertResult.rows[0].id,
    userId,
    videoId,
    quality,
    version,
    downloadedAt: insertResult.rows[0].downloaded_at,
  };
}

/**
 * Get the next monthly reset date (1st of next month)
 */
function getNextResetDate() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
}

// ===========================================
// DOWNLOAD RECORDING
// ===========================================

/**
 * Record a download in the database
 * @param {number} userId - The user's ID
 * @param {number} videoId - The video's ID
 * @param {string} quality - Video quality (4k, 1080p, 720p, 480p)
 * @param {string} version - Version type (clean, explicit, extended, etc.)
 * @returns {Object} - The recorded download
 */
export async function recordDownload(userId, videoId, quality, version) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get file size from video version
    const versionQuery = `
      SELECT file_size FROM video_versions
      WHERE video_id = $1 AND quality = $2 AND version_type = $3
    `;
    const versionResult = await client.query(versionQuery, [
      videoId,
      quality,
      version,
    ]);
    const fileSize = versionResult.rows[0]?.file_size || null;

    // Insert download record (downloads table has no file_size column)
    const insertQuery = `
      INSERT INTO downloads (user_id, video_id, version_type, quality)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const downloadResult = await client.query(insertQuery, [
      userId,
      videoId,
      version,
      quality,
    ]);

    // Increment user's monthly download counter
    await client.query(
      `
      UPDATE users
      SET downloads_this_month = COALESCE(downloads_this_month, 0) + 1,
          total_downloads = COALESCE(total_downloads, 0) + 1
      WHERE id = $1
    `,
      [userId],
    );

    // Increment video's download_count
    await client.query(
      `
      UPDATE videos
      SET download_count = COALESCE(download_count, 0) + 1
      WHERE id = $1
    `,
      [videoId],
    );

    await client.query("COMMIT");

    return {
      id: downloadResult.rows[0].id,
      userId,
      videoId,
      quality,
      version,
      fileSize,
      downloadedAt: downloadResult.rows[0].downloaded_at,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in recordDownload:", error);
    throw error;
  } finally {
    client.release();
  }
}

// ===========================================
// SIGNED URL GENERATION
// ===========================================

/**
 * Generate a signed URL for video download
 * @param {number} videoId - The video's ID
 * @param {string} quality - Video quality
 * @param {string} version - Version type
 * @returns {Object} - { downloadUrl, expiresIn, fileName }
 */
export async function generateSignedUrl(videoId, quality, version) {
  const query = `
    SELECT
      vv.file_url,
      vv.file_size,
      v.title,
      v.artist
    FROM video_versions vv
    JOIN videos v ON v.id = vv.video_id
    WHERE vv.video_id = $1 AND vv.quality = $2 AND vv.version_type = $3
  `;

  try {
    const result = await pool.query(query, [videoId, quality, version]);

    if (result.rows.length === 0) {
      throw new Error("Video version not found");
    }

    const { file_url, file_size, title, artist } = result.rows[0];

    // Extract the S3 key from the file URL or use directly if already a key
    const s3Key = file_url.startsWith("http")
      ? new URL(file_url).pathname.slice(1) // Remove leading /
      : file_url;

    // Generate signed URL (1 hour expiry)
    const expiresIn = 3600;
    const downloadUrl = await getSignedDownloadUrl(s3Key, expiresIn);

    // Generate friendly filename
    const sanitizedTitle = (title || "video").replace(/[^a-zA-Z0-9-_]/g, "_");
    const sanitizedArtist = (artist || "unknown").replace(
      /[^a-zA-Z0-9-_]/g,
      "_",
    );
    const fileName = `${sanitizedArtist}-${sanitizedTitle}_${quality}_${version}.mp4`;

    return {
      downloadUrl,
      expiresIn,
      fileName,
      fileSize: file_size,
    };
  } catch (error) {
    console.error("Error in generateSignedUrl:", error);
    throw error;
  }
}

// ===========================================
// DOWNLOAD HISTORY
// ===========================================

/**
 * Get a user's download history with pagination
 * @param {number} userId - The user's ID
 * @param {Object} pagination - { page, limit }
 * @returns {Object} - { downloads, total, page, limit, totalPages }
 */
export async function getUserDownloadHistory(userId, pagination = {}) {
  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * Math.min(limit, 100);
  const effectiveLimit = Math.min(limit, 100);

  const query = `
    SELECT
      d.id,
      d.quality,
      d.version_type as version,
      d.file_size,
      d.downloaded_at,
      json_build_object(
        'id', v.id,
        'title', v.title,
        'artist', v.artist,
        'genre', v.genre,
        'bpm', v.bpm,
        'key', v.key,
        'thumbnailUrl', v.thumbnail_url
      ) as video
    FROM downloads d
    JOIN videos v ON d.video_id = v.id
    WHERE d.user_id = $1
    ORDER BY d.downloaded_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*) FROM downloads WHERE user_id = $1
  `;

  try {
    const [downloadsResult, countResult] = await Promise.all([
      pool.query(query, [userId, effectiveLimit, offset]),
      pool.query(countQuery, [userId]),
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
      downloads: downloadsResult.rows.map(row => ({
        id: row.id,
        video: row.video,
        quality: row.quality,
        version: row.version,
        fileSize: row.file_size,
        downloadedAt: row.downloaded_at,
      })),
      total,
      page,
      limit: effectiveLimit,
      totalPages: Math.ceil(total / effectiveLimit),
    };
  } catch (error) {
    console.error("Error in getUserDownloadHistory:", error);
    throw error;
  }
}

/**
 * Get a user's recent downloads (last 10)
 * @param {number} userId - The user's ID
 * @returns {Array} - Array of recent downloads
 */
export async function getRecentDownloads(userId, limit = 10) {
  const query = `
    SELECT
      d.id,
      d.quality,
      d.version_type as version,
      d.file_size,
      d.downloaded_at,
      json_build_object(
        'id', v.id,
        'title', v.title,
        'artist', v.artist,
        'genre', v.genre,
        'bpm', v.bpm,
        'key', v.key,
        'thumbnailUrl', v.thumbnail_url
      ) as video
    FROM downloads d
    JOIN videos v ON d.video_id = v.id
    WHERE d.user_id = $1
    ORDER BY d.downloaded_at DESC
    LIMIT $2
  `;

  try {
    const result = await pool.query(query, [userId, limit]);

    return result.rows.map(row => ({
      id: row.id,
      video: row.video,
      quality: row.quality,
      version: row.version,
      fileSize: row.file_size,
      downloadedAt: row.downloaded_at,
    }));
  } catch (error) {
    console.error("Error in getRecentDownloads:", error);
    throw error;
  }
}

/**
 * Check if a user has already downloaded a specific video
 * @param {number} userId - The user's ID
 * @param {number} videoId - The video's ID
 * @returns {boolean} - Whether the user has downloaded this video
 */
export async function hasUserDownloaded(userId, videoId) {
  const query = `
    SELECT EXISTS(
      SELECT 1 FROM downloads
      WHERE user_id = $1 AND video_id = $2
    ) as downloaded
  `;

  try {
    const result = await pool.query(query, [userId, videoId]);
    return result.rows[0].downloaded;
  } catch (error) {
    console.error("Error in hasUserDownloaded:", error);
    throw error;
  }
}

export default {
  checkDownloadLimit,
  checkAndRecordDownload,
  recordDownload,
  generateSignedUrl,
  getUserDownloadHistory,
  getRecentDownloads,
  hasUserDownloaded,
};
