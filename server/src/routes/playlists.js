// ===========================================
// THE VIDEO POOL - Playlist Routes
// ===========================================

import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// GET /api/playlists/:userId - List user playlists
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT us.*, 
              (SELECT COUNT(*) FROM set_tracks st WHERE st.set_id = us.id) AS track_count
       FROM user_sets us
       WHERE us.user_id = $1
       ORDER BY us.updated_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// GET /api/playlists/detail/:id - Playlist with videos
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const playlistResult = await pool.query(
      'SELECT * FROM user_sets WHERE id = $1',
      [id]
    );

    if (playlistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const videosResult = await pool.query(
      `SELECT st.position, st.notes, st.cue_point, st.added_at,
              v.id, v.title, v.artist, v.genre, v.subgenre, v.bpm, v.key,
              v.duration, v.thumbnail_url, v.highest_quality
       FROM set_tracks st
       JOIN videos v ON v.id = st.video_id
       WHERE st.set_id = $1
       ORDER BY st.position ASC`,
      [id]
    );

    res.json({
      ...playlistResult.rows[0],
      videos: videosResult.rows
    });
  } catch (error) {
    console.error('Error fetching playlist detail:', error);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

// POST /api/playlists - Create playlist
router.post('/', async (req, res) => {
  try {
    const { userId, name, description, isPublic } = req.body;
    if (!userId || !name) {
      return res.status(400).json({ error: 'userId and name are required' });
    }

    const result = await pool.query(
      `INSERT INTO user_sets (user_id, name, description, is_public)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, name, description || null, isPublic || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// PATCH /api/playlists/:id - Update name/description
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await pool.query(
      `UPDATE user_sets SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

// DELETE /api/playlists/:id - Delete playlist
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM user_sets WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

// POST /api/playlists/:playlistId/videos - Add video to playlist
router.post('/:playlistId/videos', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { videoId, position } = req.body;
    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    // Get next position if not provided
    let pos = position;
    if (pos === undefined) {
      const countResult = await pool.query(
        'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM set_tracks WHERE set_id = $1',
        [playlistId]
      );
      pos = countResult.rows[0].next_pos;
    }

    const result = await pool.query(
      `INSERT INTO set_tracks (set_id, video_id, position)
       VALUES ($1, $2, $3)
       ON CONFLICT (set_id, video_id) DO NOTHING
       RETURNING *`,
      [playlistId, videoId, pos]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'Video already in playlist' });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding video to playlist:', error);
    res.status(500).json({ error: 'Failed to add video to playlist' });
  }
});

// DELETE /api/playlists/:playlistId/videos/:videoId - Remove video from playlist
router.delete('/:playlistId/videos/:videoId', async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;
    await pool.query(
      'DELETE FROM set_tracks WHERE set_id = $1 AND video_id = $2',
      [playlistId, videoId]
    );
    res.status(204).send();
  } catch (error) {
    console.error('Error removing video from playlist:', error);
    res.status(500).json({ error: 'Failed to remove video from playlist' });
  }
});

export default router;
