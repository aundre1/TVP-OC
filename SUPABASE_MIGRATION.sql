-- ============================================================================
-- The Video Pool - Supabase Database Migration
-- PostgreSQL Schema for the_video_pool
-- ============================================================================
-- This migration creates all necessary tables for The Video Pool application.
-- Schema: the_video_pool (isolated from other projects)
-- Run this in Supabase SQL Editor after creating the project.
-- ============================================================================

-- Create the schema
CREATE SCHEMA IF NOT EXISTS the_video_pool;

-- Set search_path to use the schema
SET search_path TO the_video_pool;

-- ============================================================================
-- TABLE: videos
-- Purpose: Stores all DJ video content (30,000+ videos)
-- Features: UUID primary key, timestamps, arrays for subgenres, JSONB ready
-- ============================================================================
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Metadata
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  label TEXT NOT NULL,
  bpm INTEGER NOT NULL,
  key TEXT NOT NULL,
  genre TEXT NOT NULL,
  subgenres TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- Media
  quality TEXT NOT NULL CHECK (quality IN ('4K', '1080p', '720p', '480p')),
  duration TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  video_url TEXT,

  -- Status flags
  is_new BOOLEAN DEFAULT FALSE,
  is_hot BOOLEAN DEFAULT FALSE,

  -- Timestamps
  date_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_modified TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Comments
  COMMENT ON TABLE videos IS 'Stores all DJ video content. Each video has metadata (BPM, key, genre) plus quality options.'
);

-- Create indexes for video lookups
CREATE INDEX idx_videos_genre ON videos(genre);
CREATE INDEX idx_videos_artist ON videos(artist);
CREATE INDEX idx_videos_is_new ON videos(is_new) WHERE is_new = TRUE;
CREATE INDEX idx_videos_is_hot ON videos(is_hot) WHERE is_hot = TRUE;
CREATE INDEX idx_videos_upload_date ON videos(upload_date DESC);

-- ============================================================================
-- TABLE: user_profiles
-- Purpose: Stores user preferences, subscription plans, and UI settings
-- Features: UUID primary key, JSONB for flexible settings (sectionOrder, etc)
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification
  user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,

  -- Subscription
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'elite')),
  downloads_remaining INTEGER DEFAULT 0,

  -- UI Preferences (stored as JSONB for flexibility)
  section_order JSONB DEFAULT '["new-releases", "trending", "for-you"]'::jsonb,
  section_states JSONB DEFAULT '{}'::jsonb,
  genre_order JSONB DEFAULT '[]'::jsonb,
  view_mode TEXT DEFAULT 'list' CHECK (view_mode IN ('grid', 'list')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  COMMENT ON TABLE user_profiles IS 'User account data, subscription level, download limits, and UI preference settings.'
);

-- Create indexes for user lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_plan ON user_profiles(plan);

-- ============================================================================
-- TABLE: favorites
-- Purpose: Tracks which videos users have favorited
-- Features: Foreign key to videos (with cascade delete), indexed for performance
-- ============================================================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id TEXT NOT NULL,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Prevent duplicate favorites
  CONSTRAINT unique_user_video_favorite UNIQUE (user_id, video_id),

  COMMENT ON TABLE favorites IS 'User favorited videos. Cascade delete if video is deleted.'
);

-- Create indexes for efficient queries
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_video_id ON favorites(video_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- ============================================================================
-- TABLE: downloads
-- Purpose: Tracks download history and usage analytics
-- Features: Foreign key to videos (with cascade delete), indexed for queries
-- ============================================================================
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id TEXT NOT NULL,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,

  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  COMMENT ON TABLE downloads IS 'Records video downloads for analytics and quota tracking.'
);

-- Create indexes for efficient queries
CREATE INDEX idx_downloads_user_id ON downloads(user_id);
CREATE INDEX idx_downloads_video_id ON downloads(video_id);
CREATE INDEX idx_downloads_downloaded_at ON downloads(downloaded_at DESC);

-- ============================================================================
-- TABLE: playlists
-- Purpose: User-created video collections/sets
-- Features: UUID primary key, public/private visibility, timestamps
-- ============================================================================
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  COMMENT ON TABLE playlists IS 'User-created playlists (called "Sets" in the app). Can be public or private.'
);

-- Create indexes for efficient queries
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlists_is_public ON playlists(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_playlists_created_at ON playlists(created_at DESC);

-- ============================================================================
-- TABLE: playlist_videos
-- Purpose: Junction table linking playlists to videos (many-to-many)
-- Features: Ordered position, cascade deletes, foreign keys to both tables
-- ============================================================================
CREATE TABLE playlist_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,

  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Prevent duplicate entries in same playlist
  CONSTRAINT unique_playlist_video UNIQUE (playlist_id, video_id),

  COMMENT ON TABLE playlist_videos IS 'Links videos to playlists. Cascade delete if playlist or video is deleted.'
);

-- Create indexes for efficient queries
CREATE INDEX idx_playlist_videos_playlist_id ON playlist_videos(playlist_id);
CREATE INDEX idx_playlist_videos_video_id ON playlist_videos(video_id);
CREATE INDEX idx_playlist_videos_position ON playlist_videos(playlist_id, position);

-- ============================================================================
-- SCHEMA COMMENT
-- ============================================================================
COMMENT ON SCHEMA the_video_pool IS 'The Video Pool - Professional DJ video platform. 30,000+ videos with metadata (BPM, key, genre), user profiles, favorites, downloads, and playlists.';

-- ============================================================================
-- END OF MIGRATION
-- All tables created successfully with proper indexes and constraints.
-- ============================================================================
