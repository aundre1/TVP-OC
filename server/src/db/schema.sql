-- ===========================================
-- THE VIDEO POOL - PostgreSQL Database Schema
-- Full schema with all 10 tables
-- ===========================================

-- ===========================================
-- EXTENSIONS
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- ===========================================
-- ENUM TYPES
-- ===========================================

-- User membership levels
CREATE TYPE membership_type AS ENUM (
  'free',
  'starter',
  'pro',
  'elite'
);

-- Video version types (different formats/edits)
CREATE TYPE version_type AS ENUM (
  'clean',
  'dirty',
  'explicit',
  'radio',
  'extended',
  'remix',
  'instrumental',
  'acapella'
);

-- Video quality options
CREATE TYPE video_quality AS ENUM (
  '720p',
  '1080p',
  '4k'
);

-- User account status
CREATE TYPE account_status AS ENUM (
  'active',
  'suspended',
  'cancelled',
  'pending'
);

-- Verification code types
CREATE TYPE verification_type AS ENUM (
  'email_verification',
  'password_reset',
  'email_change'
);

-- ===========================================
-- TABLE: memberships
-- Defines available membership tiers
-- ===========================================

CREATE TABLE memberships (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,

  -- Pricing
  price_monthly DECIMAL(10, 2),
  price_annual DECIMAL(10, 2),
  price_lifetime DECIMAL(10, 2),

  -- Stripe Price IDs
  stripe_price_monthly VARCHAR(100),
  stripe_price_annual VARCHAR(100),
  stripe_price_lifetime VARCHAR(100),

  -- Features stored as JSONB for flexibility
  features JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Limits
  daily_download_limit INTEGER,          -- NULL = unlimited
  monthly_download_limit INTEGER,        -- NULL = unlimited
  allowed_qualities video_quality[] DEFAULT ARRAY['720p']::video_quality[],

  -- Display
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  badge_color VARCHAR(20),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- TABLE: users
-- Core user accounts
-- ===========================================

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,

  -- Basic info
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  avatar_url VARCHAR(500),

  -- Membership
  membership_type membership_type DEFAULT 'free',
  membership_id INTEGER REFERENCES memberships(id),
  membership_started_at TIMESTAMP WITH TIME ZONE,
  membership_expires_at TIMESTAMP WITH TIME ZONE,

  -- Stripe integration
  stripe_customer_id VARCHAR(100) UNIQUE,
  stripe_subscription_id VARCHAR(100),
  stripe_payment_method_id VARCHAR(100),

  -- Account status
  status account_status DEFAULT 'pending',
  role VARCHAR(20) DEFAULT 'user',        -- 'user', 'admin', 'moderator'

  -- Two-Factor Authentication
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(100),
  two_factor_verified_at TIMESTAMP WITH TIME ZONE,

  -- OAuth
  google_id VARCHAR(100) UNIQUE,

  -- Download tracking
  downloads_today INTEGER DEFAULT 0,
  downloads_this_month INTEGER DEFAULT 0,
  downloads_reset_daily TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  downloads_reset_monthly TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  total_downloads INTEGER DEFAULT 0,

  -- Preferences (JSONB for flexibility)
  preferences JSONB DEFAULT '{
    "theme": "dark",
    "emailNotifications": true,
    "showExplicitContent": true,
    "defaultQuality": "1080p",
    "autoplay": false
  }'::jsonb,

  -- Security
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_login_ip VARCHAR(45),              -- IPv6 compatible
  password_changed_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- TABLE: videos
-- Core video metadata
-- ===========================================

CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,

  -- Basic metadata
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  album VARCHAR(255),
  release_year INTEGER,
  record_label VARCHAR(255),

  -- Music metadata
  bpm INTEGER,
  key VARCHAR(10),                        -- e.g., 'Am', 'C#m', 'F'
  camelot_key VARCHAR(5),                 -- e.g., '8A', '12B'
  duration INTEGER,                       -- Duration in seconds

  -- Categorization
  genre VARCHAR(100) NOT NULL,
  subgenre VARCHAR(100),
  tags TEXT[],                            -- Array of tags
  decade VARCHAR(10),                     -- e.g., '2020s', '1990s'

  -- Quality info
  highest_quality video_quality DEFAULT '1080p',
  has_clean_version BOOLEAN DEFAULT false,
  has_dirty_version BOOLEAN DEFAULT false,
  is_explicit BOOLEAN DEFAULT false,

  -- Thumbnail
  thumbnail_url VARCHAR(500),
  thumbnail_small_url VARCHAR(500),

  -- Search optimization
  search_vector TSVECTOR,

  -- Popularity metrics
  download_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  trending_score DECIMAL(10, 2) DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  featured_at TIMESTAMP WITH TIME ZONE,

  -- Internal
  source_file_path VARCHAR(500),
  import_batch_id VARCHAR(100),
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- TABLE: video_versions
-- Different versions of each video (clean, dirty, qualities)
-- ===========================================

CREATE TABLE video_versions (
  id SERIAL PRIMARY KEY,
  video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,

  -- Version info
  version_type version_type NOT NULL DEFAULT 'clean',
  quality video_quality NOT NULL DEFAULT '1080p',

  -- File info
  file_url VARCHAR(500) NOT NULL,
  file_key VARCHAR(500),                  -- S3 key for direct access
  file_size BIGINT,                       -- Size in bytes
  file_format VARCHAR(20) DEFAULT 'mp4', -- mp4, webm, etc.

  -- Technical specs
  bitrate INTEGER,                        -- Video bitrate in kbps
  audio_bitrate INTEGER,                  -- Audio bitrate in kbps
  codec VARCHAR(50),                      -- e.g., 'h264', 'h265'
  framerate DECIMAL(5, 2),               -- e.g., 29.97, 60.00

  -- Status
  is_active BOOLEAN DEFAULT true,
  encoding_status VARCHAR(20) DEFAULT 'complete',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Ensure unique version per video per quality
  UNIQUE(video_id, version_type, quality)
);

-- ===========================================
-- TABLE: downloads
-- Track all user downloads
-- ===========================================

CREATE TABLE downloads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  video_version_id INTEGER REFERENCES video_versions(id) ON DELETE SET NULL,

  -- Download details
  version_type version_type NOT NULL,
  quality video_quality NOT NULL,

  -- Context
  ip_address VARCHAR(45),                 -- IPv6 compatible
  user_agent TEXT,

  -- Timestamps
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Index for tracking recent downloads
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- TABLE: user_sets (Playlists)
-- User-created sets/playlists
-- ===========================================

CREATE TABLE user_sets (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Set info
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Sharing
  share_id VARCHAR(20) UNIQUE,            -- Short shareable ID
  is_public BOOLEAN DEFAULT false,
  share_count INTEGER DEFAULT 0,

  -- Display
  cover_image_url VARCHAR(500),
  color VARCHAR(20),                      -- Accent color for the set

  -- Stats
  track_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,       -- Total duration in seconds

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_played_at TIMESTAMP WITH TIME ZONE
);

-- ===========================================
-- TABLE: set_tracks
-- Videos in user sets (many-to-many with ordering)
-- ===========================================

CREATE TABLE set_tracks (
  id SERIAL PRIMARY KEY,
  set_id INTEGER NOT NULL REFERENCES user_sets(id) ON DELETE CASCADE,
  video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,

  -- Ordering
  position INTEGER NOT NULL,

  -- DJ Notes
  notes TEXT,
  cue_point INTEGER,                      -- Starting point in seconds

  -- Timestamps
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Prevent duplicates in same set
  UNIQUE(set_id, video_id)
);

-- ===========================================
-- TABLE: favorites
-- User favorited videos
-- ===========================================

CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,

  -- Optional organization
  folder VARCHAR(100),                    -- Group favorites into folders

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Prevent duplicate favorites
  UNIQUE(user_id, video_id)
);

-- ===========================================
-- TABLE: verification_codes
-- Email verification and password reset codes
-- ===========================================

CREATE TABLE verification_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Code info
  code VARCHAR(100) NOT NULL,
  type verification_type NOT NULL,

  -- For email change verification
  new_email VARCHAR(255),

  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,

  -- Security
  ip_address VARCHAR(45),
  attempts INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- TABLE: backup_codes
-- 2FA backup/recovery codes
-- ===========================================

CREATE TABLE backup_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Code (hashed)
  code_hash VARCHAR(255) NOT NULL,

  -- Usage
  used_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_membership_type ON users(membership_type);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Videos
CREATE INDEX idx_videos_artist ON videos(artist);
CREATE INDEX idx_videos_genre ON videos(genre);
CREATE INDEX idx_videos_bpm ON videos(bpm);
CREATE INDEX idx_videos_camelot_key ON videos(camelot_key);
CREATE INDEX idx_videos_release_year ON videos(release_year);
CREATE INDEX idx_videos_is_active ON videos(is_active);
CREATE INDEX idx_videos_is_featured ON videos(is_featured);
CREATE INDEX idx_videos_created_at ON videos(created_at);
CREATE INDEX idx_videos_trending ON videos(trending_score DESC);
CREATE INDEX idx_videos_download_count ON videos(download_count DESC);
CREATE INDEX idx_videos_search ON videos USING GIN(search_vector);
CREATE INDEX idx_videos_tags ON videos USING GIN(tags);

-- Composite indexes for common queries
CREATE INDEX idx_videos_genre_bpm ON videos(genre, bpm);
CREATE INDEX idx_videos_active_featured ON videos(is_active, is_featured);

-- Video versions
CREATE INDEX idx_video_versions_video ON video_versions(video_id);
CREATE INDEX idx_video_versions_quality ON video_versions(quality);
CREATE INDEX idx_video_versions_type ON video_versions(version_type);

-- Downloads
CREATE INDEX idx_downloads_user ON downloads(user_id);
CREATE INDEX idx_downloads_video ON downloads(video_id);
CREATE INDEX idx_downloads_date ON downloads(downloaded_at);
CREATE INDEX idx_downloads_user_date ON downloads(user_id, downloaded_at);

-- User sets
CREATE INDEX idx_user_sets_user ON user_sets(user_id);
CREATE INDEX idx_user_sets_share_id ON user_sets(share_id);
CREATE INDEX idx_user_sets_public ON user_sets(is_public);

-- Set tracks
CREATE INDEX idx_set_tracks_set ON set_tracks(set_id);
CREATE INDEX idx_set_tracks_video ON set_tracks(video_id);
CREATE INDEX idx_set_tracks_position ON set_tracks(set_id, position);

-- Favorites
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_video ON favorites(video_id);
CREATE INDEX idx_favorites_folder ON favorites(user_id, folder);

-- Verification codes
CREATE INDEX idx_verification_codes_user ON verification_codes(user_id);
CREATE INDEX idx_verification_codes_code ON verification_codes(code);
CREATE INDEX idx_verification_codes_expires ON verification_codes(expires_at);

-- Backup codes
CREATE INDEX idx_backup_codes_user ON backup_codes(user_id);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_versions_updated_at BEFORE UPDATE ON video_versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sets_updated_at BEFORE UPDATE ON user_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update video search vector
CREATE OR REPLACE FUNCTION update_video_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector =
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.artist, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.album, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.genre, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_search BEFORE INSERT OR UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_video_search_vector();

-- Function to update set track count
CREATE OR REPLACE FUNCTION update_set_track_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_sets
    SET track_count = track_count + 1,
        total_duration = total_duration + COALESCE((SELECT duration FROM videos WHERE id = NEW.video_id), 0)
    WHERE id = NEW.set_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_sets
    SET track_count = track_count - 1,
        total_duration = total_duration - COALESCE((SELECT duration FROM videos WHERE id = OLD.video_id), 0)
    WHERE id = OLD.set_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_set_counts AFTER INSERT OR DELETE ON set_tracks
  FOR EACH ROW EXECUTE FUNCTION update_set_track_count();

-- Function to update video favorite count
CREATE OR REPLACE FUNCTION update_video_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE videos SET favorite_count = favorite_count + 1 WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE videos SET favorite_count = favorite_count - 1 WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_favorite_counts AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION update_video_favorite_count();

-- ===========================================
-- COMMENTS
-- ===========================================

COMMENT ON TABLE users IS 'User accounts with membership and authentication info';
COMMENT ON TABLE videos IS 'Core video metadata and music information';
COMMENT ON TABLE video_versions IS 'Different versions (clean/dirty) and qualities of videos';
COMMENT ON TABLE downloads IS 'Track all user downloads for analytics and limits';
COMMENT ON TABLE user_sets IS 'User-created playlists/sets';
COMMENT ON TABLE set_tracks IS 'Videos within user sets with position ordering';
COMMENT ON TABLE favorites IS 'User favorited videos';
COMMENT ON TABLE verification_codes IS 'Email verification and password reset codes';
COMMENT ON TABLE backup_codes IS '2FA backup/recovery codes';
COMMENT ON TABLE memberships IS 'Available membership tiers and their features';
