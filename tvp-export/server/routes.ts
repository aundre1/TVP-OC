import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { genreService } from "./genreService";
import { 
  insertVideoSchema, 
  insertUserProfileSchema, 
  updateUserProfileSchema,
  insertFavoriteSchema,
  insertDownloadSchema,
  insertPlaylistSchema,
  insertPlaylistVideoSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Videos
  app.get("/api/videos", async (req, res) => {
    try {
      const { genre, bpmMin, bpmMax, quality, search } = req.query;
      
      const filters = {
        genre: genre as string | undefined,
        bpmMin: bpmMin ? parseInt(bpmMin as string) : undefined,
        bpmMax: bpmMax ? parseInt(bpmMax as string) : undefined,
        quality: quality as string | undefined,
        search: search as string | undefined,
      };
      
      const videos = await storage.getAllVideos(filters);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch video" });
    }
  });

  app.post("/api/videos", async (req, res) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(videoData);
      res.status(201).json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create video" });
    }
  });

  // User Profile
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const profileData = insertUserProfileSchema.parse(req.body);
      const profile = await storage.createUserProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create profile" });
    }
  });

  app.patch("/api/profile/:userId", async (req, res) => {
    try {
      const profileData = updateUserProfileSchema.parse(req.body);
      const profile = await storage.updateUserProfile(req.params.userId, profileData);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Favorites
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.params.userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const favoriteData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.addFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:userId/:videoId", async (req, res) => {
    try {
      await storage.removeFavorite(req.params.userId, req.params.videoId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  app.get("/api/favorites/:userId/:videoId/check", async (req, res) => {
    try {
      const isFavorite = await storage.isFavorite(req.params.userId, req.params.videoId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ error: "Failed to check favorite status" });
    }
  });

  // Downloads
  app.get("/api/downloads/:userId", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const downloads = await storage.getUserDownloads(req.params.userId, limit);
      res.json(downloads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch downloads" });
    }
  });

  app.post("/api/downloads", async (req, res) => {
    try {
      const downloadData = insertDownloadSchema.parse(req.body);
      const download = await storage.addDownload(downloadData);
      res.status(201).json(download);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add download" });
    }
  });

  // Playlists
  app.get("/api/playlists/:userId", async (req, res) => {
    try {
      const playlists = await storage.getUserPlaylists(req.params.userId);
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch playlists" });
    }
  });

  app.get("/api/playlists/detail/:id", async (req, res) => {
    try {
      const playlistData = await storage.getPlaylistWithVideos(req.params.id);
      if (!playlistData) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      res.json(playlistData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch playlist" });
    }
  });

  app.post("/api/playlists", async (req, res) => {
    try {
      const playlistData = insertPlaylistSchema.parse(req.body);
      const playlist = await storage.createPlaylist(playlistData);
      res.status(201).json(playlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create playlist" });
    }
  });

  app.patch("/api/playlists/:id", async (req, res) => {
    try {
      const { name, description } = req.body;
      const playlist = await storage.updatePlaylist(req.params.id, name, description);
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ error: "Failed to update playlist" });
    }
  });

  app.delete("/api/playlists/:id", async (req, res) => {
    try {
      await storage.deletePlaylist(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete playlist" });
    }
  });

  // Playlist Videos
  app.post("/api/playlists/:playlistId/videos", async (req, res) => {
    try {
      const playlistVideoData = insertPlaylistVideoSchema.parse({
        playlistId: req.params.playlistId,
        ...req.body,
      });
      const playlistVideo = await storage.addVideoToPlaylist(playlistVideoData);
      res.status(201).json(playlistVideo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add video to playlist" });
    }
  });

  app.delete("/api/playlists/:playlistId/videos/:videoId", async (req, res) => {
    try {
      await storage.removeVideoFromPlaylist(req.params.playlistId, req.params.videoId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove video from playlist" });
    }
  });

  // Genre Classification API (Free - MusicBrainz + Last.fm)
  const classifyTrackSchema = z.object({
    artist: z.string().min(1, "Artist is required"),
    title: z.string().min(1, "Title is required"),
  });

  app.post("/api/genres/classify", async (req, res) => {
    try {
      const parsed = classifyTrackSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      const { artist, title } = parsed.data;
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
      res.status(500).json({ error: "Failed to classify genre" });
    }
  });

  const batchReclassifySchema = z.object({
    tracks: z.array(z.object({
      id: z.string(),
      artist: z.string(),
      title: z.string(),
      currentGenre: z.string().optional(),
    })).min(1, "At least one track required").max(50, "Maximum 50 tracks per batch"),
  });

  app.post("/api/genres/reclassify-batch", async (req, res) => {
    try {
      const parsed = batchReclassifySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      const { tracks } = parsed.data;
      const lastFmApiKey = process.env.LASTFM_API_KEY;
      const results = await genreService.reclassifyGenres(tracks, lastFmApiKey);
      
      res.json({
        success: true,
        results,
        message: `Classified ${results.length} tracks`
      });
    } catch (error) {
      console.error('Batch genre classification error:', error);
      res.status(500).json({ error: "Failed to classify genres" });
    }
  });

  // Get available genres (30 total to match frontend)
  app.get("/api/genres", async (_req, res) => {
    try {
      const genres = [
        { id: "pop", name: "Pop", subGenres: ["Synth Pop", "Dance Pop", "Indie Pop", "Art Pop", "Bubblegum Pop"] },
        { id: "hip-hop", name: "Hip-Hop / Rap", subGenres: ["Trap", "Drill", "Old School", "Boom Bap", "Conscious", "Mumble Rap", "G-Funk"] },
        { id: "rnb", name: "R&B", subGenres: ["Contemporary R&B", "Neo Soul", "Slow Jams", "New Jack Swing", "Alternative R&B"] },
        { id: "rock", name: "Rock", subGenres: ["Alternative", "Indie Rock", "Classic Rock", "Hard Rock", "Soft Rock"] },
        { id: "latin", name: "Latin", subGenres: ["Reggaeton", "Latin Pop", "Latin Trap", "Bachata", "Salsa", "Cumbia", "Dembow"] },
        { id: "electronic", name: "Electronic / Dance", subGenres: ["EDM", "Electro", "Big Room", "Future Bass", "Dubstep", "Drum & Bass"] },
        { id: "afrobeats", name: "Afrobeats", subGenres: ["Afro-Fusion", "Afro-Pop", "Naija Beats"] },
        { id: "country", name: "Country", subGenres: ["Country Pop", "Country Rock", "Americana", "Outlaw Country"] },
        { id: "kpop", name: "K-Pop", subGenres: [] },
        { id: "indie", name: "Indie / Alternative", subGenres: ["Dream Pop", "Shoegaze", "Lo-Fi Indie", "Art Rock"] },
        { id: "jazz", name: "Jazz", subGenres: ["Smooth Jazz", "Bebop", "Jazz Fusion", "Acid Jazz"] },
        { id: "metal", name: "Metal", subGenres: ["Heavy Metal", "Death Metal", "Nu Metal", "Metalcore", "Thrash"] },
        { id: "punk", name: "Punk", subGenres: ["Pop Punk", "Hardcore", "Post-Punk", "Skate Punk"] },
        { id: "classical", name: "Classical", subGenres: ["Orchestral", "Chamber", "Contemporary Classical"] },
        { id: "reggae", name: "Reggae / Dancehall", subGenres: ["Dancehall", "Dub", "Roots Reggae", "Lovers Rock"] },
        { id: "blues", name: "Blues", subGenres: ["Delta Blues", "Chicago Blues", "Electric Blues"] },
        { id: "folk", name: "Folk / Americana", subGenres: ["Acoustic Folk", "Folk Rock", "Traditional"] },
        { id: "house", name: "House", subGenres: ["Deep House", "Tech House", "Progressive House", "Future House", "Afro House", "Bass House"] },
        { id: "drill", name: "Drill", subGenres: ["UK Drill", "Brooklyn Drill", "Chicago Drill"] },
        { id: "gospel", name: "Gospel / CCM", subGenres: ["Contemporary Christian", "Worship", "Traditional Gospel"] },
        { id: "techno", name: "Techno", subGenres: ["Detroit Techno", "Minimal Techno", "Industrial Techno"] },
        { id: "trance", name: "Trance", subGenres: ["Progressive Trance", "Uplifting Trance", "Psytrance", "Vocal Trance"] },
        { id: "funk", name: "Funk", subGenres: ["P-Funk", "Electro Funk", "Disco Funk"] },
        { id: "soul", name: "Soul", subGenres: ["Classic Soul", "Northern Soul", "Psychedelic Soul"] },
        { id: "ska", name: "Ska", subGenres: [] },
        { id: "lofi", name: "Lo-Fi / Chillhop", subGenres: ["Study Beats", "Chill Beats", "Jazzhop"] },
        { id: "ambient", name: "Ambient", subGenres: ["Dark Ambient", "Space Ambient", "Drone"] },
        { id: "throwbacks", name: "Throwbacks", subGenres: ["90s Hits", "2000s Hits", "80s Classics", "Retro Mix"] },
        { id: "remixes", name: "Remixes", subGenres: ["Club Remixes", "Extended Mixes", "Mashups", "Bootlegs"] },
        { id: "world", name: "World / Global Fusion", subGenres: ["Afro-Cuban", "Brazilian", "Middle Eastern"] },
      ];
      
      res.json(genres);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch genres" });
    }
  });

  return httpServer;
}
