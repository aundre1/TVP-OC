import {
  videos,
  userProfiles,
  favorites,
  downloads,
  playlists,
  playlistVideos,
  type Video,
  type InsertVideo,
  type UserProfile,
  type InsertUserProfile,
  type UpdateUserProfile,
  type Favorite,
  type InsertFavorite,
  type Download,
  type InsertDownload,
  type Playlist,
  type InsertPlaylist,
  type PlaylistVideo,
  type InsertPlaylistVideo,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // Videos
  getAllVideos(filters?: {
    genre?: string;
    bpmMin?: number;
    bpmMax?: number;
    quality?: string;
    search?: string;
  }): Promise<Video[]>;
  getVideo(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  
  // User Profiles
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: UpdateUserProfile): Promise<UserProfile | undefined>;
  
  // Favorites
  getUserFavorites(userId: string): Promise<Video[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, videoId: string): Promise<void>;
  isFavorite(userId: string, videoId: string): Promise<boolean>;
  
  // Downloads
  getUserDownloads(userId: string, limit?: number): Promise<Download[]>;
  addDownload(download: InsertDownload): Promise<Download>;
  
  // Playlists
  getUserPlaylists(userId: string): Promise<Playlist[]>;
  getPlaylist(id: string): Promise<Playlist | undefined>;
  getPlaylistWithVideos(id: string): Promise<{ playlist: Playlist; videos: Video[] } | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, name: string, description?: string): Promise<Playlist | undefined>;
  deletePlaylist(id: string): Promise<void>;
  
  // Playlist Videos
  addVideoToPlaylist(playlistVideo: InsertPlaylistVideo): Promise<PlaylistVideo>;
  removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Videos
  async getAllVideos(filters?: {
    genre?: string;
    bpmMin?: number;
    bpmMax?: number;
    quality?: string;
    search?: string;
  }): Promise<Video[]> {
    let query = db.select().from(videos);
    
    const conditions = [];
    
    if (filters?.genre && filters.genre !== 'All Genres') {
      conditions.push(eq(videos.genre, filters.genre));
    }
    
    if (filters?.bpmMin !== undefined) {
      conditions.push(sql`${videos.bpm} >= ${filters.bpmMin}`);
    }
    
    if (filters?.bpmMax !== undefined) {
      conditions.push(sql`${videos.bpm} <= ${filters.bpmMax}`);
    }
    
    if (filters?.quality) {
      conditions.push(eq(videos.quality, filters.quality));
    }
    
    if (filters?.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          like(videos.title, searchPattern),
          like(videos.artist, searchPattern),
          like(videos.label, searchPattern)
        )!
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)!) as any;
    }
    
    return await query.orderBy(desc(videos.dateCreated));
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video || undefined;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }
  
  // User Profiles
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db.insert(userProfiles).values(profile).returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, profile: UpdateUserProfile): Promise<UserProfile | undefined> {
    const [updated] = await db
      .update(userProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated || undefined;
  }
  
  // Favorites
  async getUserFavorites(userId: string): Promise<Video[]> {
    const result = await db
      .select({ video: videos })
      .from(favorites)
      .innerJoin(videos, eq(favorites.videoId, videos.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
    
    return result.map(r => r.video);
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, videoId: string): Promise<void> {
    await db.delete(favorites).where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.videoId, videoId)
      )!
    );
  }

  async isFavorite(userId: string, videoId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.videoId, videoId)
        )!
      );
    return !!result;
  }
  
  // Downloads
  async getUserDownloads(userId: string, limit: number = 50): Promise<Download[]> {
    return await db
      .select()
      .from(downloads)
      .where(eq(downloads.userId, userId))
      .orderBy(desc(downloads.downloadedAt))
      .limit(limit);
  }

  async addDownload(download: InsertDownload): Promise<Download> {
    const [newDownload] = await db.insert(downloads).values(download).returning();
    return newDownload;
  }
  
  // Playlists
  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    return await db
      .select()
      .from(playlists)
      .where(eq(playlists.userId, userId))
      .orderBy(desc(playlists.createdAt));
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist || undefined;
  }

  async getPlaylistWithVideos(id: string): Promise<{ playlist: Playlist; videos: Video[] } | undefined> {
    const playlist = await this.getPlaylist(id);
    if (!playlist) return undefined;
    
    const result = await db
      .select({ video: videos, position: playlistVideos.position })
      .from(playlistVideos)
      .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
      .where(eq(playlistVideos.playlistId, id))
      .orderBy(playlistVideos.position);
    
    return {
      playlist,
      videos: result.map(r => r.video),
    };
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const [newPlaylist] = await db.insert(playlists).values(playlist).returning();
    return newPlaylist;
  }

  async updatePlaylist(id: string, name: string, description?: string): Promise<Playlist | undefined> {
    const [updated] = await db
      .update(playlists)
      .set({ name, description, updatedAt: new Date() })
      .where(eq(playlists.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePlaylist(id: string): Promise<void> {
    await db.delete(playlists).where(eq(playlists.id, id));
  }
  
  // Playlist Videos
  async addVideoToPlaylist(playlistVideo: InsertPlaylistVideo): Promise<PlaylistVideo> {
    const [newPlaylistVideo] = await db.insert(playlistVideos).values(playlistVideo).returning();
    return newPlaylistVideo;
  }

  async removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void> {
    await db.delete(playlistVideos).where(
      and(
        eq(playlistVideos.playlistId, playlistId),
        eq(playlistVideos.videoId, videoId)
      )!
    );
  }
}

export const storage = new DatabaseStorage();
