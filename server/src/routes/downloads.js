// ===========================================
// THE VIDEO POOL - Download Routes
// ===========================================

import express from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/downloads/:userId - Get download history (auth required, own history only)
router.get('/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own download history (admins can view any)
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    const result = await pool.query(
      `SELECT d.id, d.user_id, d.video_id, d.version_type, d.quality,
              d.downloaded_at,
              v.title, v.artist, v.genre, v.thumbnail_url
       FROM downloads d
       JOIN videos v ON v.id = d.video_id
       WHERE d.user_id = $1
       ORDER BY d.downloaded_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching downloads:', error);
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
});

// POST /api/downloads - Record download
router.post('/', async (req, res) => {
  try {
    const { userId, videoId, versionType, quality } = req.body;
    if (!userId || !videoId) {
      return res.status(400).json({ error: 'userId and videoId are required' });
    }

    const result = await pool.query(
      `INSERT INTO downloads (user_id, video_id, version_type, quality, ip_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, videoId, versionType || 'clean', quality || '1080p', req.ip]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error recording download:', error);
    res.status(500).json({ error: 'Failed to record download' });
  }
});

export default router;
