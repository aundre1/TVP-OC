// ===========================================
// THE VIDEO POOL - Video Routes
// API endpoints for video catalog operations
// ===========================================

import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import videoService from '../services/videoService.js';
import downloadService from '../services/downloadService.js';
import pool from '../db/pool.js';
import { getPresignedDownloadUrl, getPresignedPreviewUrl, isStorageConfigured } from '../services/storageService.js';

const router = express.Router();

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
// VIDEO LISTING ENDPOINTS
// ===========================================

/**
 * GET /api/videos
 * List videos with filtering, search, and pagination
 */
router.get('/',
  [
    query('search').optional().trim().escape(),
    query('genre').optional().trim(),
    query('subGenre').optional().trim(),
    query('bpmMin').optional().isInt({ min: 1, max: 300 }),
    query('bpmMax').optional().isInt({ min: 1, max: 300 }),
    query('key').optional().trim(),
    query('quality').optional().isIn(['4k', '1080p', '720p', '480p']),
    query('version').optional().isIn(['clean', 'explicit', 'extended', 'intro', 'outro', 'quickhit']),
    query('sortBy').optional().isIn(['newest', 'oldest', 'popular', 'title', 'artist', 'bpm']),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const filters = {
        search: req.query.search,
        genre: req.query.genre,
        subGenre: req.query.subGenre,
        bpmMin: req.query.bpmMin,
        bpmMax: req.query.bpmMax,
        key: req.query.key,
        quality: req.query.quality,
        version: req.query.version,
        sortBy: req.query.sortBy || 'newest'
      };

      const pagination = {
        page: req.query.page || 1,
        limit: req.query.limit || 20
      };

      const result = await videoService.getAllVideos(filters, pagination);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/videos/featured
 * Get trending/featured videos
 */
router.get('/featured',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const limit = req.query.limit || 20;
      const tracks = await videoService.getFeaturedVideos(limit);

      res.json({ tracks });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/videos/recommended
 * Get personalized recommendations (auth optional)
 * If authenticated, returns personalized recommendations based on user history
 * If not authenticated, returns featured/trending videos
 */
router.get('/recommended',
  optionalAuth,
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = req.user?.id || null;
      const limit = req.query.limit || 20;

      const result = await videoService.getRecommendedVideos(userId, limit);

      res.json({
        tracks: result.tracks,
        isPersonalized: result.isPersonalized
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/videos/autocomplete
 * Get search autocomplete suggestions
 */
router.get('/autocomplete',
  [
    query('q').trim().notEmpty().withMessage('Query is required')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const result = await videoService.getAutocomplete(req.query.q);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/videos/related/:id
 * Get videos related to a specific video
 */
router.get('/related/:id',
  [
    param('id').isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const videoId = req.params.id;
      const limit = req.query.limit || 20;

      const tracks = await videoService.getRelatedVideos(videoId, limit);

      res.json({ tracks });
    } catch (error) {
      next(error);
    }
  }
);

// ===========================================
// SINGLE VIDEO ENDPOINTS
// ===========================================

/**
 * GET /api/videos/:id
 * Get single video details with all versions
 */
router.get('/:id',
  [
    param('id').isInt({ min: 1 }).toInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const video = await videoService.getVideoById(req.params.id);

      if (!video) {
        return res.status(404).json({
          error: 'Video not found'
        });
      }

      res.json(video);
    } catch (error) {
      next(error);
    }
  }
);

// ===========================================
// DOWNLOAD ENDPOINT
// ===========================================

/**
 * POST /api/videos/:id/download
 * Request a download URL for a video (auth required)
 */
router.post('/:id/download',
  requireAuth,
  [
    param('id').isInt({ min: 1 }).toInt(),
    body('quality').isIn(['4k', '1080p', '720p', '480p']).withMessage('Invalid quality'),
    body('version').isIn(['clean', 'explicit', 'extended', 'intro', 'outro', 'quickhit']).withMessage('Invalid version')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const videoId = req.params.id;
      const { quality, version } = req.body;
      const userId = req.user.id;

      // Check if video exists
      const video = await videoService.getVideoById(videoId);
      if (!video) {
        return res.status(404).json({
          error: 'Video not found'
        });
      }

      // Verify the requested version exists
      const versionExists = video.versions.some(
        v => v.quality === quality && v.versionType === version
      );
      if (!versionExists) {
        return res.status(404).json({
          error: 'Requested video version not available'
        });
      }

      // Check download limit
      const limitStatus = await downloadService.checkDownloadLimit(userId);
      if (!limitStatus.canDownload) {
        return res.status(403).json({
          error: 'Download limit reached',
          limit: limitStatus.limit,
          used: limitStatus.limit - limitStatus.remaining,
          remaining: limitStatus.remaining,
          resetDate: limitStatus.resetDate,
          upgradeUrl: '/membership',
        });
      }

      // Generate signed URL
      const downloadInfo = await downloadService.generateSignedUrl(videoId, quality, version);

      // Record the download
      await downloadService.recordDownload(userId, videoId, quality, version);

      // Get updated remaining downloads
      const updatedStatus = await downloadService.checkDownloadLimit(userId);

      res.json({
        downloadUrl: downloadInfo.downloadUrl,
        expiresIn: downloadInfo.expiresIn,
        fileName: downloadInfo.fileName,
        fileSize: downloadInfo.fileSize,
        remainingDownloads: updatedStatus.remaining
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===========================================
// SEARCH ENDPOINT
// ===========================================

/**
 * GET /api/videos/search
 * Search videos (alias for GET /api/videos with search param)
 */
router.get('/search',
  [
    query('q').trim().notEmpty().withMessage('Search query is required'),
    query('genre').optional().trim(),
    query('bpmMin').optional().isInt({ min: 1, max: 300 }),
    query('bpmMax').optional().isInt({ min: 1, max: 300 }),
    query('key').optional().trim(),
    query('sortBy').optional().isIn(['newest', 'oldest', 'popular', 'title', 'artist', 'bpm']),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const filters = {
        genre: req.query.genre,
        bpmMin: req.query.bpmMin,
        bpmMax: req.query.bpmMax,
        key: req.query.key,
        sortBy: req.query.sortBy || 'popular'
      };

      const pagination = {
        page: req.query.page || 1,
        limit: req.query.limit || 20
      };

      const result = await videoService.searchVideos(req.query.q, filters, pagination);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ===========================================
// PRESIGNED URL ENDPOINTS
// ===========================================

/**
 * GET /api/videos/:id/download-url
 * Generate a presigned download URL for a specific video version.
 * Auth required. Records a download entry.
 *
 * Query params:
 *   versionType - clean | explicit | extended | intro | outro | quickhit (default: clean)
 *   quality     - 4K | 1080p | 720p | 480p (default: best available)
 */
router.get('/:id/download-url',
  requireAuth,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { versionType = 'clean', quality = '1080p' } = req.query;

      // Fetch the video version record — prefer requested quality, fall back to best available
      const versionResult = await pool.query(
        `SELECT vv.file_url, vv.version_type, vv.quality,
                v.title, v.artist
         FROM video_versions vv
         JOIN videos v ON v.id = vv.video_id
         WHERE vv.video_id = $1
           AND vv.version_type = $2
         ORDER BY CASE vv.quality
           WHEN '4K'    THEN 1
           WHEN '1080p' THEN 2
           WHEN '720p'  THEN 3
           ELSE 4
         END
         LIMIT 1`,
        [id, versionType]
      );

      if (versionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Video version not found' });
      }

      const version = versionResult.rows[0];

      // If S3 creds are absent (e.g. local dev without keys), return raw URL
      if (!isStorageConfigured()) {
        return res.json({ url: version.file_url, expires: null });
      }

      // Generate time-limited presigned URL
      const url = await getPresignedDownloadUrl(version.file_url);

      // Record the download (ON CONFLICT DO NOTHING prevents duplicates)
      await pool.query(
        `INSERT INTO downloads (user_id, video_id, version_type, quality, ip_address)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [req.user.id, id, version.version_type, version.quality, req.ip]
      );

      res.json({
        url,
        expires: Math.floor(Date.now() / 1000) + 3600,
        title: version.title,
        artist: version.artist,
        versionType: version.version_type,
        quality: version.quality,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/videos/:id/preview-url
 * Generate a presigned URL for a short preview clip.
 * No auth required — public endpoint for pre-purchase previewing.
 */
router.get('/:id/preview-url',
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT vv.preview_url, v.title, v.artist
         FROM video_versions vv
         JOIN videos v ON v.id = vv.video_id
         WHERE vv.video_id = $1
           AND vv.preview_url IS NOT NULL
         LIMIT 1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Preview not available' });
      }

      const { preview_url } = result.rows[0];

      // Graceful fallback when storage is not configured or preview_url is absent
      if (!isStorageConfigured() || !preview_url) {
        return res.json({ url: preview_url || null });
      }

      const url = await getPresignedPreviewUrl(preview_url);
      res.json({ url, expires: Math.floor(Date.now() / 1000) + 3600 });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
