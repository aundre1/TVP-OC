# The Video Pool - Supabase Database Setup

## Project Information
- **Supabase Project ID**: `dxbtycycyvmzgufdhnae`
- **Database Host**: `db.dxbtycycyvmzgufdhnae.supabase.co`
- **Database Port**: `5432`
- **Database Name**: `postgres`
- **Schema**: `the_video_pool`

## Step 1: Access Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select project `dxbtycycyvmzgufdhnae`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

## Step 2: Create the Schema

Copy and paste the entire content below into the SQL Editor and click **Run**:

```sql
-- ============================================================================
-- The Video Pool - Supabase Database Migration
-- PostgreSQL Schema for the_video_pool
-- ============================================================================

-- Create the schema
CREATE SCHEMA IF NOT EXISTS the_video_pool;

-- Set search_path to use the schema
SET search_path TO the_video_pool;

-- ============================================================================
-- TABLE: videos
-- ============================================================================
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  label TEXT NOT NULL,
  bpm INTEGER NOT NULL,
  key TEXT NOT NULL,
  genre TEXT NOT NULL,
  subgenres TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  quality TEXT NOT NULL CHECK (quality IN ('4K', '1080p', '720p', '480p')),
  duration TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  video_url TEXT,
  is_new BOOLEAN DEFAULT FALSE,
  is_hot BOOLEAN DEFAULT FALSE,
  date_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_modified TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  COMMENT ON TABLE videos IS 'Stores all DJ video content. Each video has metadata (BPM, key, genre) plus quality options.'
);

CREATE INDEX idx_videos_genre ON videos(genre);
CREATE INDEX idx_videos_artist ON videos(artist);
CREATE INDEX idx_videos_is_new ON videos(is_new) WHERE is_new = TRUE;
CREATE INDEX idx_videos_is_hot ON videos(is_hot) WHERE is_hot = TRUE;
CREATE INDEX idx_videos_upload_date ON videos(upload_date DESC);

-- ============================================================================
-- TABLE: user_profiles
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'elite')),
  downloads_remaining INTEGER DEFAULT 0,
  section_order JSONB DEFAULT '["new-releases", "trending", "for-you"]'::jsonb,
  section_states JSONB DEFAULT '{}'::jsonb,
  genre_order JSONB DEFAULT '[]'::jsonb,
  view_mode TEXT DEFAULT 'list' CHECK (view_mode IN ('grid', 'list')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  COMMENT ON TABLE user_profiles IS 'User account data, subscription level, download limits, and UI preference settings.'
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_plan ON user_profiles(plan);

-- ============================================================================
-- TABLE: favorites
-- ============================================================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_video_favorite UNIQUE (user_id, video_id),
  COMMENT ON TABLE favorites IS 'User favorited videos. Cascade delete if video is deleted.'
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_video_id ON favorites(video_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- ============================================================================
-- TABLE: downloads
-- ============================================================================
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  COMMENT ON TABLE downloads IS 'Records video downloads for analytics and quota tracking.'
);

CREATE INDEX idx_downloads_user_id ON downloads(user_id);
CREATE INDEX idx_downloads_video_id ON downloads(video_id);
CREATE INDEX idx_downloads_downloaded_at ON downloads(downloaded_at DESC);

-- ============================================================================
-- TABLE: playlists
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

CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlists_is_public ON playlists(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_playlists_created_at ON playlists(created_at DESC);

-- ============================================================================
-- TABLE: playlist_videos
-- ============================================================================
CREATE TABLE playlist_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_playlist_video UNIQUE (playlist_id, video_id),
  COMMENT ON TABLE playlist_videos IS 'Links videos to playlists. Cascade delete if playlist or video is deleted.'
);

CREATE INDEX idx_playlist_videos_playlist_id ON playlist_videos(playlist_id);
CREATE INDEX idx_playlist_videos_video_id ON playlist_videos(video_id);
CREATE INDEX idx_playlist_videos_position ON playlist_videos(playlist_id, position);

-- ============================================================================
-- SCHEMA COMMENT
-- ============================================================================
COMMENT ON SCHEMA the_video_pool IS 'The Video Pool - Professional DJ video platform. 30,000+ videos with metadata (BPM, key, genre), user profiles, favorites, downloads, and playlists.';
```

## Step 3: Verify Schema Creation

After running the migration, verify success:

1. Click **SQL Editor** → **New Query**
2. Run this verification query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'the_video_pool'
ORDER BY table_name;
```

**Expected Output** (7 tables):
- downloads
- favorites
- playlist_videos
- playlists
- user_profiles
- videos

3. If all 7 tables appear, schema creation is successful!

## Step 4: Get Connection String

For backend connection:

1. Go to **Project Settings** (gear icon)
2. Click **Database**
3. Copy the **"Connection string"** under **URI** (Postgres)
4. Add to `.env.backend`:
   ```
   DATABASE_URL=<paste_connection_string_here>
   ```

## Troubleshooting

**Error: Schema already exists**
- This is fine! The `CREATE SCHEMA IF NOT EXISTS` will skip it.

**Error: Table already exists**
- Run `DROP SCHEMA the_video_pool CASCADE;` first, then re-run the migration

**Connection timeout**
- Check that Supabase project is running
- Verify network access (allow all IPs in Project Settings → Network)

**Permissions error**
- Ensure you're using the `postgres` user (superuser)
- Check Project Settings → Database → User roles

---

**Status**: Manual setup required via Supabase Dashboard SQL Editor
**Created**: 2026-02-22
