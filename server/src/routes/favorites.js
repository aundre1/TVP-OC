// ===========================================
// THE VIDEO POOL - Favorites Routes
// ===========================================

import express from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All favorites routes require authentication
router.use(requireAuth);

// GET /api/favorites/:userId - Get user favorites with video details
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT f.id, f.user_id, f.video_id, f.created_at,
              v.title, v.artist, v.genre, v.subgenre, v.bpm, v.key,
              v.duration, v.thumbnail_url, v.highest_quality, v.is_explicit
       FROM favorites f
       JOIN videos v ON v.id = f.video_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// POST /api/favorites - Add favorite
router.post('/', async (req, res) => {
  try {
    const { userId, videoId } = req.body;
    if (!userId || !videoId) {
      return res.status(400).json({ error: 'userId and videoId are required' });
    }

    const result = await pool.query(
      `INSERT INTO favorites (user_id, video_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, video_id) DO NOTHING
       RETURNING *`,
      [userId, videoId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'Already favorited' });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// DELETE /api/favorites/:userId/:videoId - Remove favorite
router.delete('/:userId/:videoId', async (req, res) => {
  try {
    const { userId, videoId } = req.params;
    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    );
    res.status(204).send();
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// GET /api/favorites/:userId/:videoId/check - Check if favorited
router.get('/:userId/:videoId/check', async (req, res) => {
  try {
    const { userId, videoId } = req.params;
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM favorites WHERE user_id = $1 AND video_id = $2) AS is_favorite',
      [userId, videoId]
    );
    res.json({ isFavorite: result.rows[0].is_favorite });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

export default router;
