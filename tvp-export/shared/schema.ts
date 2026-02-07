import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Videos table - stores all video content
export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  label: text("label").notNull(),
  bpm: integer("bpm").notNull(),
  key: text("key").notNull(),
  genre: text("genre").notNull(),
  subgenres: text("subgenres").array().notNull().default(sql`ARRAY[]::text[]`),
  quality: text("quality").notNull(), // '4K', '1080p', '720p', '480p'
  duration: text("duration").notNull(),
  thumbnail: text("thumbnail").notNull(),
  videoUrl: text("video_url"), // Optional: actual video file URL
  isNew: boolean("is_new").default(false),
  isHot: boolean("is_hot").default(false),
  dateCreated: timestamp("date_created").notNull().defaultNow(),
  dateModified: timestamp("date_modified").notNull().defaultNow(),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
});

// User profiles - stores user preferences and settings
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().unique(), // External user ID (from auth system)
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  plan: text("plan").notNull().default('free'), // 'free', 'pro', 'elite'
  downloadsRemaining: integer("downloads_remaining").default(0),
  
  // Layout preferences
  sectionOrder: jsonb("section_order").$type<string[]>().default(['new-releases', 'trending', 'for-you']),
  sectionStates: jsonb("section_states").$type<Record<string, boolean>>().default({}), // collapsed/expanded state
  genreOrder: jsonb("genre_order").$type<string[]>().default([]),
  viewMode: text("view_mode").default('list'), // 'grid' or 'list'
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User favorites - tracks favorited videos
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  videoId: varchar("video_id").notNull().references(() => videos.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User downloads - tracks download history
export const downloads = pgTable("downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  videoId: varchar("video_id").notNull().references(() => videos.id, { onDelete: 'cascade' }),
  downloadedAt: timestamp("downloaded_at").notNull().defaultNow(),
});

// Playlists (Sets) - user-created collections
export const playlists = pgTable("playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Playlist videos - junction table
export const playlistVideos = pgTable("playlist_videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playlistId: varchar("playlist_id").notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  videoId: varchar("video_id").notNull().references(() => videos.id, { onDelete: 'cascade' }),
  position: integer("position").notNull().default(0),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

// Insert schemas
export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  dateCreated: true,
  dateModified: true,
  uploadDate: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertDownloadSchema = createInsertSchema(downloads).omit({
  id: true,
  downloadedAt: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlaylistVideoSchema = createInsertSchema(playlistVideos).omit({
  id: true,
  addedAt: true,
});

// Update schemas
export const updateUserProfileSchema = insertUserProfileSchema.partial();

// Types
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type Download = typeof downloads.$inferSelect;
export type InsertDownload = z.infer<typeof insertDownloadSchema>;

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;

export type PlaylistVideo = typeof playlistVideos.$inferSelect;
export type InsertPlaylistVideo = z.infer<typeof insertPlaylistVideoSchema>;
