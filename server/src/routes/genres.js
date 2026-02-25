// ===========================================
// THE VIDEO POOL - Genre Routes
// Genre classification and listing endpoints
// ===========================================

import express from 'express';
import { genreService } from '../services/genreService.js';

const router = express.Router();

// GET /api/genres - Static genre list (30 genres)
router.get('/', (req, res) => {
  try {
    const genres = [
      { id: 'pop', name: 'Pop', subGenres: ['Synth Pop', 'Dance Pop', 'Indie Pop', 'Art Pop', 'Bubblegum Pop'] },
      { id: 'hip-hop', name: 'Hip-Hop / Rap', subGenres: ['Trap', 'Drill', 'Old School', 'Boom Bap', 'Conscious', 'Mumble Rap', 'G-Funk'] },
      { id: 'rnb', name: 'R&B', subGenres: ['Contemporary R&B', 'Neo Soul', 'Slow Jams', 'New Jack Swing', 'Alternative R&B'] },
      { id: 'rock', name: 'Rock', subGenres: ['Alternative', 'Indie Rock', 'Classic Rock', 'Hard Rock', 'Soft Rock'] },
      { id: 'latin', name: 'Latin', subGenres: ['Reggaeton', 'Latin Pop', 'Latin Trap', 'Bachata', 'Salsa', 'Cumbia', 'Dembow'] },
      { id: 'electronic', name: 'Electronic / Dance', subGenres: ['EDM', 'Electro', 'Big Room', 'Future Bass', 'Dubstep', 'Drum & Bass'] },
      { id: 'afrobeats', name: 'Afrobeats', subGenres: ['Afro-Fusion', 'Afro-Pop', 'Naija Beats'] },
      { id: 'country', name: 'Country', subGenres: ['Country Pop', 'Country Rock', 'Americana', 'Outlaw Country'] },
      { id: 'kpop', name: 'K-Pop', subGenres: [] },
      { id: 'indie', name: 'Indie / Alternative', subGenres: ['Dream Pop', 'Shoegaze', 'Lo-Fi Indie', 'Art Rock'] },
      { id: 'jazz', name: 'Jazz', subGenres: ['Smooth Jazz', 'Bebop', 'Jazz Fusion', 'Acid Jazz'] },
      { id: 'metal', name: 'Metal', subGenres: ['Heavy Metal', 'Death Metal', 'Nu Metal', 'Metalcore', 'Thrash'] },
      { id: 'punk', name: 'Punk', subGenres: ['Pop Punk', 'Hardcore', 'Post-Punk', 'Skate Punk'] },
      { id: 'classical', name: 'Classical', subGenres: ['Orchestral', 'Chamber', 'Contemporary Classical'] },
      { id: 'reggae', name: 'Reggae / Dancehall', subGenres: ['Dancehall', 'Dub', 'Roots Reggae', 'Lovers Rock'] },
      { id: 'blues', name: 'Blues', subGenres: ['Delta Blues', 'Chicago Blues', 'Electric Blues'] },
      { id: 'folk', name: 'Folk / Americana', subGenres: ['Acoustic Folk', 'Folk Rock', 'Traditional'] },
      { id: 'house', name: 'House', subGenres: ['Deep House', 'Tech House', 'Progressive House', 'Future House', 'Afro House', 'Bass House'] },
      { id: 'drill', name: 'Drill', subGenres: ['UK Drill', 'Brooklyn Drill', 'Chicago Drill'] },
      { id: 'gospel', name: 'Gospel / CCM', subGenres: ['Contemporary Christian', 'Worship', 'Traditional Gospel'] },
      { id: 'techno', name: 'Techno', subGenres: ['Detroit Techno', 'Minimal Techno', 'Industrial Techno'] },
      { id: 'trance', name: 'Trance', subGenres: ['Progressive Trance', 'Uplifting Trance', 'Psytrance', 'Vocal Trance'] },
      { id: 'funk', name: 'Funk', subGenres: ['P-Funk', 'Electro Funk', 'Disco Funk'] },
      { id: 'soul', name: 'Soul', subGenres: ['Classic Soul', 'Northern Soul', 'Psychedelic Soul'] },
      { id: 'ska', name: 'Ska', subGenres: [] },
      { id: 'lofi', name: 'Lo-Fi / Chillhop', subGenres: ['Study Beats', 'Chill Beats', 'Jazzhop'] },
      { id: 'ambient', name: 'Ambient', subGenres: ['Dark Ambient', 'Space Ambient', 'Drone'] },
      { id: 'throwbacks', name: 'Throwbacks', subGenres: ['90s Hits', '2000s Hits', '80s Classics', 'Retro Mix'] },
      { id: 'remixes', name: 'Remixes', subGenres: ['Club Remixes', 'Extended Mixes', 'Mashups', 'Bootlegs'] },
      { id: 'world', name: 'World / Global Fusion', subGenres: ['Afro-Cuban', 'Brazilian', 'Middle Eastern'] },
    ];
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

// POST /api/genres/classify - Classify a single track
router.post('/classify', async (req, res) => {
  try {
    const { artist, title } = req.body;
    if (!artist || !title) {
      return res.status(400).json({ error: 'Artist and title are required' });
    }

    const lastFmApiKey = process.env.LASTFM_API_KEY;
    const classification = await genreService.classifyTrack(artist, title, lastFmApiKey);

    res.json({
      success: true,
      classification,
      message: classification.source === 'local'
        ? 'Classification based on local analysis (no external data found)'
        : `Classification from ${classification.source}`
    });
  } catch (error) {
    console.error('Genre classification error:', error);
    res.status(500).json({ error: 'Failed to classify genre' });
  }
});

// POST /api/genres/reclassify-batch - Batch reclassify (max 50)
router.post('/reclassify-batch', async (req, res) => {
  try {
    const { tracks } = req.body;
    if (!Array.isArray(tracks) || tracks.length === 0) {
      return res.status(400).json({ error: 'At least one track required' });
    }
    if (tracks.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 tracks per batch' });
    }

    const lastFmApiKey = process.env.LASTFM_API_KEY;
    const results = await genreService.reclassifyGenres(tracks, lastFmApiKey);

    res.json({
      success: true,
      results,
      message: `Classified ${results.length} tracks`
    });
  } catch (error) {
    console.error('Batch genre classification error:', error);
    res.status(500).json({ error: 'Failed to classify genres' });
  }
});

export default router;
