// ===========================================
// THE VIDEO POOL - Video Service
// Business logic for video catalog operations
// ===========================================

import { pool } from '../db/pool.js';

// ===========================================
// CAMELOT WHEEL FOR HARMONIC MIXING
// ===========================================

const CAMELOT_WHEEL = {
  // Minor keys (column A)
  'Am': '8A', 'Em': '9A', 'Bm': '10A', 'F#m': '11A', 'C#m': '12A',
  'G#m': '1A', 'Ebm': '2A', 'Bbm': '3A', 'Fm': '4A', 'Cm': '5A',
  'Gm': '6A', 'Dm': '7A',
  // Major keys (column B)
  'C': '8B', 'G': '9B', 'D': '10B', 'A': '11B', 'E': '12B',
  'B': '1B', 'F#': '2B', 'Db': '3B', 'Ab': '4B', 'Eb': '5B',
  'Bb': '6B', 'F': '7B'
};

// Reverse lookup: camelot to musical key
const CAMELOT_TO_KEY = Object.fromEntries(
  Object.entries(CAMELOT_WHEEL).map(([k, v]) => [v, k])
);

/**
 * Get compatible Camelot keys for harmonic mixing
 * Compatible keys: same key, +1, -1, and parallel (A/B swap)
 */
function getCompatibleCamelotKeys(camelotKey) {
  if (!camelotKey) return [];

  const num = parseInt(camelotKey);
  const letter = camelotKey.slice(-1);

  const compatible = [camelotKey]; // Same key

  // +1 and -1 (wrapping 12 -> 1 and 1 -> 12)
  const plus1 = num === 12 ? 1 : num + 1;
  const minus1 = num === 1 ? 12 : num - 1;

  compatible.push(`${plus1}${letter}`);
  compatible.push(`${minus1}${letter}`);

  // Parallel key (A <-> B)
  const parallelLetter = letter === 'A' ? 'B' : 'A';
  compatible.push(`${num}${parallelLetter}`);

  return compatible;
}

/**
 * Calculate harmonic compatibility score (0-100)
 */
function calculateHarmonicScore(key1, key2) {
  if (!key1 || !key2) return 0;

  // Convert to camelot if needed
  const camelot1 = CAMELOT_WHEEL[key1] || key1;
  const camelot2 = CAMELOT_WHEEL[key2] || key2;

  if (camelot1 === camelot2) return 100; // Perfect match

  const num1 = parseInt(camelot1);
  const num2 = parseInt(camelot2);
  const letter1 = camelot1.slice(-1);
  const letter2 = camelot2.slice(-1);

  // Adjacent numbers (same column)
  const numDiff = Math.abs(num1 - num2);
  const wrappedDiff = Math.min(numDiff, 12 - numDiff);

  if (letter1 === letter2) {
    if (wrappedDiff === 1) return 90; // Adjacent in same column
    if (wrappedDiff === 2) return 70; // Two steps away
  }

  // Same number, different column (relative major/minor)
  if (num1 === num2 && letter1 !== letter2) return 85;

  // Adjacent with column change
  if (wrappedDiff === 1) return 75;

  // Everything else
  return Math.max(0, 50 - wrappedDiff * 10);
}

/**
 * Calculate BPM compatibility score (0-100)
 */
function calculateBpmScore(bpm1, bpm2, threshold = 10) {
  if (!bpm1 || !bpm2) return 0;

  const diff = Math.abs(bpm1 - bpm2);

  if (diff === 0) return 100;
  if (diff <= threshold / 2) return 90;
  if (diff <= threshold) return 80;
  if (diff <= threshold * 1.5) return 60;
  if (diff <= threshold * 2) return 40;

  // Check for double/half time compatibility
  const halfTime = Math.abs(bpm1 - bpm2 / 2);
  const doubleTime = Math.abs(bpm1 - bpm2 * 2);

  if (halfTime <= threshold || doubleTime <= threshold) return 70;

  return 0;
}

// ===========================================
// VIDEO SERVICE FUNCTIONS
// ===========================================

/**
 * Get all videos with filtering, search, and pagination
 */
export async function getAllVideos(filters = {}, pagination = {}) {
  const {
    search,
    genre,
    subGenre,
    bpmMin,
    bpmMax,
    key,
    quality,
    version,
    sortBy = 'newest'
  } = filters;

  const {
    page = 1,
    limit = 20
  } = pagination;

  const offset = (page - 1) * Math.min(limit, 100);
  const effectiveLimit = Math.min(limit, 100);

  let query = `
    SELECT
      v.id,
      v.title,
      v.artist,
      v.genre,
      v.subgenre,
      v.bpm,
      v.key,
      v.camelot_key,
      v.duration,
      v.year,
      v.label,
      v.thumbnail_url,
      v.is_new,
      v.is_hot,
      v.download_count,
      v.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', vv.id,
            'versionType', vv.version_type,
            'quality', vv.quality,
            'fileSize', vv.file_size
          )
        ) FILTER (WHERE vv.id IS NOT NULL),
        '[]'
      ) as versions
    FROM videos v
    LEFT JOIN video_versions vv ON v.id = vv.video_id
  `;

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Search filter (title, artist, label)
  if (search) {
    conditions.push(`(
      v.title ILIKE $${paramIndex} OR
      v.artist ILIKE $${paramIndex} OR
      v.label ILIKE $${paramIndex}
    )`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Genre filter
  if (genre) {
    conditions.push(`v.genre = $${paramIndex}`);
    params.push(genre);
    paramIndex++;
  }

  // Subgenre filter
  if (subGenre) {
    conditions.push(`v.subgenre = $${paramIndex}`);
    params.push(subGenre);
    paramIndex++;
  }

  // BPM range filter
  if (bpmMin) {
    conditions.push(`v.bpm >= $${paramIndex}`);
    params.push(parseInt(bpmMin));
    paramIndex++;
  }

  if (bpmMax) {
    conditions.push(`v.bpm <= $${paramIndex}`);
    params.push(parseInt(bpmMax));
    paramIndex++;
  }

  // Key filter
  if (key) {
    conditions.push(`(v.key = $${paramIndex} OR v.camelot_key = $${paramIndex})`);
    params.push(key);
    paramIndex++;
  }

  // Quality filter (requires join)
  if (quality) {
    conditions.push(`EXISTS (
      SELECT 1 FROM video_versions vv2
      WHERE vv2.video_id = v.id AND vv2.quality = $${paramIndex}
    )`);
    params.push(quality);
    paramIndex++;
  }

  // Version filter
  if (version) {
    conditions.push(`EXISTS (
      SELECT 1 FROM video_versions vv2
      WHERE vv2.video_id = v.id AND vv2.version_type = $${paramIndex}
    )`);
    params.push(version);
    paramIndex++;
  }

  // Add WHERE clause if conditions exist
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  // Group by video
  query += ` GROUP BY v.id`;

  // Sorting
  const sortOptions = {
    newest: 'v.created_at DESC',
    oldest: 'v.created_at ASC',
    popular: 'v.download_count DESC',
    title: 'v.title ASC',
    artist: 'v.artist ASC',
    bpm: 'v.bpm ASC'
  };
  query += ` ORDER BY ${sortOptions[sortBy] || sortOptions.newest}`;

  // Pagination
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(effectiveLimit, offset);

  // Count query
  let countQuery = `SELECT COUNT(*) FROM videos v`;
  if (conditions.length > 0) {
    // Re-add conditions for count (excluding version-related subqueries for count)
    countQuery += ` WHERE ${conditions.join(' AND ')}`;
  }

  try {
    const [videosResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2)) // Exclude LIMIT/OFFSET params
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
      tracks: videosResult.rows.map(formatVideoResponse),
      total,
      page,
      limit: effectiveLimit,
      totalPages: Math.ceil(total / effectiveLimit)
    };
  } catch (error) {
    console.error('Error in getAllVideos:', error);
    throw error;
  }
}

/**
 * Get a single video by ID with all versions
 */
export async function getVideoById(id) {
  const query = `
    SELECT
      v.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', vv.id,
            'versionType', vv.version_type,
            'quality', vv.quality,
            'fileSize', vv.file_size,
            'bitrate', vv.bitrate
          ) ORDER BY
            CASE vv.quality
              WHEN '4k' THEN 1
              WHEN '1080p' THEN 2
              WHEN '720p' THEN 3
              WHEN '480p' THEN 4
            END,
            vv.version_type
        ) FILTER (WHERE vv.id IS NOT NULL),
        '[]'
      ) as versions
    FROM videos v
    LEFT JOIN video_versions vv ON v.id = vv.video_id
    WHERE v.id = $1
    GROUP BY v.id
  `;

  try {
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return formatVideoResponse(result.rows[0]);
  } catch (error) {
    console.error('Error in getVideoById:', error);
    throw error;
  }
}

/**
 * Get featured/trending videos
 * Based on download_count, is_hot flag, and recent activity
 */
export async function getFeaturedVideos(limit = 20) {
  const query = `
    SELECT
      v.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', vv.id,
            'versionType', vv.version_type,
            'quality', vv.quality,
            'fileSize', vv.file_size
          )
        ) FILTER (WHERE vv.id IS NOT NULL),
        '[]'
      ) as versions,
      (
        SELECT COUNT(*) FROM downloads d
        WHERE d.video_id = v.id
        AND d.downloaded_at > NOW() - INTERVAL '7 days'
      ) as recent_downloads
    FROM videos v
    LEFT JOIN video_versions vv ON v.id = vv.video_id
    GROUP BY v.id
    ORDER BY
      v.is_hot DESC,
      recent_downloads DESC,
      v.download_count DESC,
      v.created_at DESC
    LIMIT $1
  `;

  try {
    const result = await pool.query(query, [Math.min(limit, 50)]);
    return result.rows.map(formatVideoResponse);
  } catch (error) {
    console.error('Error in getFeaturedVideos:', error);
    throw error;
  }
}

/**
 * Get personalized recommendations for a user
 * Based on harmonic key matching, BPM compatibility, and genre history
 */
export async function getRecommendedVideos(userId, limit = 20) {
  // If no user, return featured videos
  if (!userId) {
    return {
      tracks: await getFeaturedVideos(limit),
      isPersonalized: false
    };
  }

  try {
    // Get user's recent download history for context
    const historyQuery = `
      SELECT
        v.genre,
        v.bpm,
        v.key,
        v.camelot_key,
        COUNT(*) as count
      FROM downloads d
      JOIN videos v ON d.video_id = v.id
      WHERE d.user_id = $1
      AND d.downloaded_at > NOW() - INTERVAL '30 days'
      GROUP BY v.genre, v.bpm, v.key, v.camelot_key
      ORDER BY count DESC
      LIMIT 10
    `;

    const historyResult = await pool.query(historyQuery, [userId]);

    if (historyResult.rows.length === 0) {
      // No history, return featured
      return {
        tracks: await getFeaturedVideos(limit),
        isPersonalized: false
      };
    }

    // Extract user preferences
    const preferredGenres = [...new Set(historyResult.rows.map(r => r.genre).filter(Boolean))];
    const avgBpm = Math.round(
      historyResult.rows.reduce((sum, r) => sum + (r.bpm || 0), 0) /
      historyResult.rows.filter(r => r.bpm).length
    ) || 120;
    const recentKeys = historyResult.rows.map(r => r.camelot_key || CAMELOT_WHEEL[r.key]).filter(Boolean);

    // Build compatible keys list
    const compatibleKeys = [...new Set(
      recentKeys.flatMap(k => getCompatibleCamelotKeys(k))
    )];

    // Get candidate videos (excluding already downloaded)
    const candidatesQuery = `
      SELECT
        v.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', vv.id,
              'versionType', vv.version_type,
              'quality', vv.quality,
              'fileSize', vv.file_size
            )
          ) FILTER (WHERE vv.id IS NOT NULL),
          '[]'
        ) as versions
      FROM videos v
      LEFT JOIN video_versions vv ON v.id = vv.video_id
      WHERE v.id NOT IN (
        SELECT video_id FROM downloads WHERE user_id = $1
      )
      AND (
        v.genre = ANY($2) OR
        v.camelot_key = ANY($3) OR
        v.bpm BETWEEN $4 AND $5
      )
      GROUP BY v.id
      LIMIT 200
    `;

    const candidatesResult = await pool.query(candidatesQuery, [
      userId,
      preferredGenres,
      compatibleKeys,
      avgBpm - 15,
      avgBpm + 15
    ]);

    // Score each candidate
    const scoredCandidates = candidatesResult.rows.map(video => {
      const reasons = [];
      let score = 0;

      // Harmonic compatibility (0-40 points)
      const videoCamelot = video.camelot_key || CAMELOT_WHEEL[video.key];
      if (videoCamelot && recentKeys.length > 0) {
        const harmonicScores = recentKeys.map(k => calculateHarmonicScore(k, videoCamelot));
        const maxHarmonicScore = Math.max(...harmonicScores);
        const harmonicPoints = Math.round(maxHarmonicScore * 0.4);
        score += harmonicPoints;

        if (maxHarmonicScore >= 85) {
          const matchedKey = CAMELOT_TO_KEY[videoCamelot] || videoCamelot;
          reasons.push(`Harmonic: Compatible key (${matchedKey})`);
        }
      }

      // BPM compatibility (0-30 points)
      if (video.bpm) {
        const bpmScore = calculateBpmScore(video.bpm, avgBpm);
        const bpmPoints = Math.round(bpmScore * 0.3);
        score += bpmPoints;

        const bpmDiff = video.bpm - avgBpm;
        if (Math.abs(bpmDiff) <= 10) {
          const sign = bpmDiff >= 0 ? '+' : '';
          reasons.push(`BPM: Close match (${sign}${bpmDiff} BPM)`);
        }
      }

      // Genre match (0-20 points)
      if (preferredGenres.includes(video.genre)) {
        score += 20;
        reasons.push(`Genre: ${video.genre}`);
      }

      // Popularity boost (0-10 points)
      if (video.is_hot) {
        score += 5;
        reasons.push('Trending now');
      }
      if (video.is_new) {
        score += 5;
        reasons.push('New release');
      }

      return {
        ...formatVideoResponse(video),
        score,
        reasons
      };
    });

    // Sort by score and return top results
    scoredCandidates.sort((a, b) => b.score - a.score);

    return {
      tracks: scoredCandidates.slice(0, limit),
      isPersonalized: true
    };
  } catch (error) {
    console.error('Error in getRecommendedVideos:', error);
    throw error;
  }
}

/**
 * Get videos related to a specific video
 * Based on genre, BPM, and key compatibility
 */
export async function getRelatedVideos(videoId, limit = 20) {
  try {
    // Get the source video
    const sourceVideo = await getVideoById(videoId);
    if (!sourceVideo) {
      return [];
    }

    const { genre, bpm, camelotKey } = sourceVideo;
    const compatibleKeys = camelotKey ? getCompatibleCamelotKeys(camelotKey) : [];

    const query = `
      SELECT
        v.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', vv.id,
              'versionType', vv.version_type,
              'quality', vv.quality,
              'fileSize', vv.file_size
            )
          ) FILTER (WHERE vv.id IS NOT NULL),
          '[]'
        ) as versions,
        CASE
          WHEN v.genre = $2 THEN 30
          ELSE 0
        END +
        CASE
          WHEN v.camelot_key = ANY($3) THEN 40
          ELSE 0
        END +
        CASE
          WHEN v.bpm BETWEEN $4 AND $5 THEN 30
          ELSE 0
        END as relevance_score
      FROM videos v
      LEFT JOIN video_versions vv ON v.id = vv.video_id
      WHERE v.id != $1
      AND (
        v.genre = $2 OR
        v.camelot_key = ANY($3) OR
        v.bpm BETWEEN $4 AND $5
      )
      GROUP BY v.id
      ORDER BY relevance_score DESC, v.download_count DESC
      LIMIT $6
    `;

    const result = await pool.query(query, [
      videoId,
      genre,
      compatibleKeys,
      (bpm || 120) - 10,
      (bpm || 120) + 10,
      limit
    ]);

    return result.rows.map(video => {
      const formatted = formatVideoResponse(video);

      // Add match reasons
      const reasons = [];
      if (video.genre === genre) reasons.push(`Same genre: ${genre}`);
      if (compatibleKeys.includes(video.camelot_key)) {
        reasons.push(`Harmonic match: ${video.camelot_key}`);
      }
      if (bpm && video.bpm && Math.abs(video.bpm - bpm) <= 10) {
        reasons.push(`Similar BPM: ${video.bpm}`);
      }

      return {
        ...formatted,
        score: video.relevance_score,
        reasons
      };
    });
  } catch (error) {
    console.error('Error in getRelatedVideos:', error);
    throw error;
  }
}

/**
 * Search videos with full-text search
 */
export async function searchVideos(query, filters = {}, pagination = {}) {
  // Delegate to getAllVideos with search filter
  return getAllVideos({ ...filters, search: query }, pagination);
}

/**
 * Get autocomplete suggestions for search
 * Returns songs, artists, and genres
 */
export async function getAutocomplete(query, limit = { songs: 10, artists: 5, genres: 3 }) {
  if (!query || query.length < 2) {
    return { songs: [], artists: [], genres: [] };
  }

  const searchPattern = `%${query}%`;

  try {
    // Songs (title matches)
    const songsQuery = `
      SELECT DISTINCT ON (v.title, v.artist)
        v.id,
        v.title,
        v.artist,
        v.thumbnail_url,
        v.bpm,
        v.genre
      FROM videos v
      WHERE v.title ILIKE $1 OR v.artist ILIKE $1
      ORDER BY v.title, v.artist, v.download_count DESC
      LIMIT $2
    `;

    // Artists
    const artistsQuery = `
      SELECT DISTINCT v.artist, COUNT(*) as video_count
      FROM videos v
      WHERE v.artist ILIKE $1
      GROUP BY v.artist
      ORDER BY video_count DESC
      LIMIT $2
    `;

    // Genres
    const genresQuery = `
      SELECT DISTINCT v.genre, COUNT(*) as video_count
      FROM videos v
      WHERE v.genre ILIKE $1 AND v.genre IS NOT NULL
      GROUP BY v.genre
      ORDER BY video_count DESC
      LIMIT $2
    `;

    const [songsResult, artistsResult, genresResult] = await Promise.all([
      pool.query(songsQuery, [searchPattern, limit.songs]),
      pool.query(artistsQuery, [searchPattern, limit.artists]),
      pool.query(genresQuery, [searchPattern, limit.genres])
    ]);

    return {
      songs: songsResult.rows.map(row => ({
        id: row.id,
        title: row.title,
        artist: row.artist,
        thumbnailUrl: row.thumbnail_url,
        bpm: row.bpm,
        genre: row.genre
      })),
      artists: artistsResult.rows.map(row => ({
        name: row.artist,
        videoCount: parseInt(row.video_count)
      })),
      genres: genresResult.rows.map(row => ({
        name: row.genre,
        videoCount: parseInt(row.video_count)
      }))
    };
  } catch (error) {
    console.error('Error in getAutocomplete:', error);
    throw error;
  }
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Format video row from database to API response format
 */
function formatVideoResponse(row) {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    genre: row.genre,
    subgenre: row.subgenre,
    bpm: row.bpm,
    key: row.key,
    camelotKey: row.camelot_key,
    duration: row.duration,
    year: row.year,
    label: row.label,
    thumbnailUrl: row.thumbnail_url,
    isNew: row.is_new,
    isHot: row.is_hot,
    downloadCount: row.download_count,
    createdAt: row.created_at,
    versions: row.versions || []
  };
}

export default {
  getAllVideos,
  getVideoById,
  getFeaturedVideos,
  getRecommendedVideos,
  getRelatedVideos,
  searchVideos,
  getAutocomplete,
  // Export utilities for testing
  calculateHarmonicScore,
  calculateBpmScore,
  getCompatibleCamelotKeys
};
