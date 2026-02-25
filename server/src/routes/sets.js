// ===========================================
// THE VIDEO POOL - Sets/Sharing Routes
// ===========================================

import express from 'express';
import crypto from 'crypto';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Generate 8-char share ID
function generateShareId() {
  return crypto.randomBytes(6).toString('base64url').slice(0, 8);
}

// POST /api/sets/share - Create a shared set
router.post('/share', requireAuth, async (req, res) => {
  try {
    const { userId, name, videoIds, totalDuration, bpmRange } = req.body;
    if (!userId || !name || !Array.isArray(videoIds) || videoIds.length === 0) {
      return res.status(400).json({ error: 'userId, name, and videoIds[] are required' });
    }

    const shareId = generateShareId();
    const result = await pool.query(
      `INSERT INTO sets (user_id, name, share_id, video_ids, track_count, total_duration, bpm_range)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, name, shareId, videoIds, videoIds.length, totalDuration || null, bpmRange || null]
    );

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.status(201).json({
      shareId,
      shareUrl: `${baseUrl}/sets/${shareId}`,
      set: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating shared set:', error);
    res.status(500).json({ error: 'Failed to create shared set' });
  }
});

// GET /api/sets/:shareId - Get shared set (public, no auth)
router.get('/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    const setResult = await pool.query('SELECT * FROM sets WHERE share_id = $1', [shareId]);

    if (setResult.rows.length === 0) {
      return res.status(404).json({ error: 'Set not found' });
    }

    const setData = setResult.rows[0];

    // Fetch video details for the IDs in the set
    let videos = [];
    if (setData.video_ids && setData.video_ids.length > 0) {
      const videoResult = await pool.query(
        `SELECT id, title, artist, genre, subgenre, bpm, key, duration, thumbnail_url, highest_quality
         FROM videos WHERE id = ANY($1::int[])`,
        [setData.video_ids]
      );
      videos = videoResult.rows;
    }

    res.json({ ...setData, videos });
  } catch (error) {
    console.error('Error fetching shared set:', error);
    res.status(500).json({ error: 'Failed to fetch shared set' });
  }
});

export default router;
