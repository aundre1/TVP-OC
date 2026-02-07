// ===========================================
// THE VIDEO POOL - User Routes
// API endpoints for user operations
// ===========================================

import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import downloadService from '../services/downloadService.js';
import { pool } from '../db/pool.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// All user routes require authentication
router.use(requireAuth);

// ===========================================
// VALIDATION MIDDLEWARE
// ===========================================

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// ===========================================
// DOWNLOAD HISTORY ENDPOINTS
// ===========================================

/**
 * GET /api/user/downloads
 * Get user's download history with pagination
 */
router.get('/downloads',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const pagination = {
        page: req.query.page || 1,
        limit: req.query.limit || 20
      };

      const result = await downloadService.getUserDownloadHistory(
        req.user.id,
        pagination
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/user/downloads/recent
 * Get user's last 10 downloads
 */
router.get('/downloads/recent',
  async (req, res, next) => {
    try {
      const downloads = await downloadService.getRecentDownloads(req.user.id, 10);
      res.json({ downloads });
    } catch (error) {
      next(error);
    }
  }
);

// ===========================================
// USER SETS (PLAYLISTS) ENDPOINTS
// ===========================================

/**
 * GET /api/user/sets
 * Get user's playlists
 */
router.get('/sets',
  async (req, res, next) => {
    try {
      const query = `
        SELECT
          us.id,
          us.name,
          us.description,
          us.share_id,
          us.is_public,
          us.view_count,
          us.copy_count,
          us.like_count,
          us.created_at,
          us.updated_at,
          COUNT(st.id) as track_count,
          COALESCE(
            json_agg(
              json_build_object(
                'id', v.id,
                'title', v.title,
                'artist', v.artist,
                'thumbnailUrl', v.thumbnail_url
              ) ORDER BY st.position
            ) FILTER (WHERE v.id IS NOT NULL),
            '[]'
          ) as tracks_preview
        FROM user_sets us
        LEFT JOIN set_tracks st ON us.id = st.set_id
        LEFT JOIN videos v ON st.video_id = v.id
        WHERE us.user_id = $1
        GROUP BY us.id
        ORDER BY us.updated_at DESC
      `;

      const result = await pool.query(query, [req.user.id]);

      const sets = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        shareId: row.share_id,
        isPublic: row.is_public,
        viewCount: row.view_count,
        copyCount: row.copy_count,
        likeCount: row.like_count,
        trackCount: parseInt(row.track_count),
        tracksPreview: row.tracks_preview.slice(0, 4), // First 4 tracks for preview
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.json({ sets });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/user/sets
 * Create a new playlist
 */
router.post('/sets',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('trackIds').optional().isArray(),
    body('trackIds.*').optional().isInt({ min: 1 })
  ],
  handleValidationErrors,
  async (req, res, next) => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { name, description, trackIds = [] } = req.body;

      // Create the set
      const insertSetQuery = `
        INSERT INTO user_sets (user_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const setResult = await client.query(insertSetQuery, [
        req.user.id,
        name,
        description || null
      ]);

      const setId = setResult.rows[0].id;

      // Add tracks if provided
      if (trackIds.length > 0) {
        const insertTracksQuery = `
          INSERT INTO set_tracks (set_id, video_id, position)
          SELECT $1, video_id, position
          FROM UNNEST($2::int[], $3::int[]) AS t(video_id, position)
        `;
        const positions = trackIds.map((_, i) => i + 1);
        await client.query(insertTracksQuery, [setId, trackIds, positions]);
      }

      await client.query('COMMIT');

      res.status(201).json({
        id: setId,
        name,
        description,
        isPublic: false,
        trackCount: trackIds.length,
        createdAt: setResult.rows[0].created_at
      });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  }
);

/**
 * GET /api/user/sets/:id
 * Get a specific playlist with all tracks
 */
router.get('/sets/:id',
  [
    param('id').isInt({ min: 1 }).toInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const query = `
        SELECT
          us.id,
          us.name,
          us.description,
          us.share_id,
          us.is_public,
          us.view_count,
          us.copy_count,
          us.like_count,
          us.created_at,
          us.updated_at
        FROM user_sets us
        WHERE us.id = $1 AND us.user_id = $2
      `;

      const result = await pool.query(query, [req.params.id, req.user.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Set not found' });
      }

      // Get tracks separately for full details
      const tracksQuery = `
        SELECT
          st.position,
          v.id,
          v.title,
          v.artist,
          v.genre,
          v.bpm,
          v.key,
          v.camelot_key,
          v.duration,
          v.thumbnail_url
        FROM set_tracks st
        JOIN videos v ON st.video_id = v.id
        WHERE st.set_id = $1
        ORDER BY st.position
      `;
      const tracksResult = await pool.query(tracksQuery, [req.params.id]);

      const set = result.rows[0];

      res.json({
        id: set.id,
        name: set.name,
        description: set.description,
        shareId: set.share_id,
        isPublic: set.is_public,
        viewCount: set.view_count,
        copyCount: set.copy_count,
        likeCount: set.like_count,
        tracks: tracksResult.rows.map(row => ({
          position: row.position,
          id: row.id,
          title: row.title,
          artist: row.artist,
          genre: row.genre,
          bpm: row.bpm,
          key: row.key,
          camelotKey: row.camelot_key,
          duration: row.duration,
          thumbnailUrl: row.thumbnail_url
        })),
        createdAt: set.created_at,
        updatedAt: set.updated_at
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/user/sets/:id
 * Update a playlist (name, description, tracks, visibility)
 */
router.put('/sets/:id',
  [
    param('id').isInt({ min: 1 }).toInt(),
    body('name').optional().trim().notEmpty().isLength({ max: 255 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('trackIds').optional().isArray(),
    body('trackIds.*').optional().isInt({ min: 1 }),
    body('isPublic').optional().isBoolean()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verify ownership
      const checkQuery = `
        SELECT id FROM user_sets WHERE id = $1 AND user_id = $2
      `;
      const checkResult = await client.query(checkQuery, [req.params.id, req.user.id]);

      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Set not found' });
      }

      const { name, description, trackIds, isPublic } = req.body;

      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(name);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(description);
      }
      if (isPublic !== undefined) {
        updates.push(`is_public = $${paramIndex++}`);
        values.push(isPublic);
      }

      if (updates.length > 0) {
        updates.push(`updated_at = NOW()`);
        const updateQuery = `
          UPDATE user_sets
          SET ${updates.join(', ')}
          WHERE id = $${paramIndex}
        `;
        values.push(req.params.id);
        await client.query(updateQuery, values);
      }

      // Update tracks if provided
      if (trackIds !== undefined) {
        // Remove existing tracks
        await client.query('DELETE FROM set_tracks WHERE set_id = $1', [req.params.id]);

        // Add new tracks
        if (trackIds.length > 0) {
          const insertTracksQuery = `
            INSERT INTO set_tracks (set_id, video_id, position)
            SELECT $1, video_id, position
            FROM UNNEST($2::int[], $3::int[]) AS t(video_id, position)
          `;
          const positions = trackIds.map((_, i) => i + 1);
          await client.query(insertTracksQuery, [req.params.id, trackIds, positions]);
        }
      }

      await client.query('COMMIT');

      res.json({ message: 'Set updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  }
);

/**
 * DELETE /api/user/sets/:id
 * Delete a playlist
 */
router.delete('/sets/:id',
  [
    param('id').isInt({ min: 1 }).toInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const query = `
        DELETE FROM user_sets
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `;

      const result = await pool.query(query, [req.params.id, req.user.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Set not found' });
      }

      res.json({ message: 'Set deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/user/sets/:id/share
 * Generate a shareable link for a playlist
 */
router.post('/sets/:id/share',
  [
    param('id').isInt({ min: 1 }).toInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      // Check ownership and current share status
      const checkQuery = `
        SELECT id, share_id FROM user_sets
        WHERE id = $1 AND user_id = $2
      `;
      const checkResult = await pool.query(checkQuery, [req.params.id, req.user.id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Set not found' });
      }

      let shareId = checkResult.rows[0].share_id;

      // Generate new share ID if doesn't exist
      if (!shareId) {
        shareId = uuidv4().substring(0, 8);

        const updateQuery = `
          UPDATE user_sets
          SET share_id = $1, is_public = true, updated_at = NOW()
          WHERE id = $2
        `;
        await pool.query(updateQuery, [shareId, req.params.id]);
      }

      const baseUrl = process.env.FRONTEND_URL || 'https://thevideopool.com';

      res.json({
        shareId,
        shareUrl: `${baseUrl}/set/${shareId}`
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===========================================
// FAVORITES ENDPOINTS
// ===========================================

/**
 * GET /api/user/favorites
 * Get user's favorite videos
 */
router.get('/favorites',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const limit = Math.min(req.query.limit || 20, 100);
      const offset = (page - 1) * limit;

      const query = `
        SELECT
          f.id as favorite_id,
          f.created_at as favorited_at,
          v.id,
          v.title,
          v.artist,
          v.genre,
          v.bpm,
          v.key,
          v.camelot_key,
          v.duration,
          v.thumbnail_url,
          v.is_new,
          v.is_hot
        FROM favorites f
        JOIN videos v ON f.video_id = v.id
        WHERE f.user_id = $1
        ORDER BY f.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const countQuery = `
        SELECT COUNT(*) FROM favorites WHERE user_id = $1
      `;

      const [favoritesResult, countResult] = await Promise.all([
        pool.query(query, [req.user.id, limit, offset]),
        pool.query(countQuery, [req.user.id])
      ]);

      const total = parseInt(countResult.rows[0].count);

      res.json({
        favorites: favoritesResult.rows.map(row => ({
          favoriteId: row.favorite_id,
          favoritedAt: row.favorited_at,
          video: {
            id: row.id,
            title: row.title,
            artist: row.artist,
            genre: row.genre,
            bpm: row.bpm,
            key: row.key,
            camelotKey: row.camelot_key,
            duration: row.duration,
            thumbnailUrl: row.thumbnail_url,
            isNew: row.is_new,
            isHot: row.is_hot
          }
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/user/favorites/:videoId
 * Add a video to favorites
 */
router.post('/favorites/:videoId',
  [
    param('videoId').isInt({ min: 1 }).toInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      // Check if video exists
      const videoCheck = await pool.query(
        'SELECT id FROM videos WHERE id = $1',
        [req.params.videoId]
      );

      if (videoCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Add to favorites (upsert)
      const query = `
        INSERT INTO favorites (user_id, video_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, video_id) DO NOTHING
        RETURNING id
      `;

      const result = await pool.query(query, [req.user.id, req.params.videoId]);

      if (result.rows.length === 0) {
        // Already favorited
        return res.json({ message: 'Already in favorites' });
      }

      res.status(201).json({
        message: 'Added to favorites',
        favoriteId: result.rows[0].id
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/user/favorites/:videoId
 * Remove a video from favorites
 */
router.delete('/favorites/:videoId',
  [
    param('videoId').isInt({ min: 1 }).toInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const query = `
        DELETE FROM favorites
        WHERE user_id = $1 AND video_id = $2
        RETURNING id
      `;

      const result = await pool.query(query, [req.user.id, req.params.videoId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Favorite not found' });
      }

      res.json({ message: 'Removed from favorites' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/user/favorites/check/:videoId
 * Check if a video is favorited
 */
router.get('/favorites/check/:videoId',
  [
    param('videoId').isInt({ min: 1 }).toInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const query = `
        SELECT EXISTS(
          SELECT 1 FROM favorites
          WHERE user_id = $1 AND video_id = $2
        ) as is_favorited
      `;

      const result = await pool.query(query, [req.user.id, req.params.videoId]);

      res.json({ isFavorited: result.rows[0].is_favorited });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
