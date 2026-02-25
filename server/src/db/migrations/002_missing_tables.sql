-- ===========================================
-- Migration 002: Schema alignment with Steve's schema
-- Our schema already covers all of Steve's tables:
--   videos → videos ✓
--   user_profiles → users (superset) ✓
--   favorites → favorites ✓
--   downloads → downloads ✓
--   playlists → user_sets ✓
--   playlist_videos → set_tracks ✓
--
-- No structural changes needed. This migration
-- adds convenience views to alias Steve's naming
-- conventions for compatibility.
-- ===========================================

-- View: playlists → user_sets alias (for API compatibility)
CREATE OR REPLACE VIEW playlists AS
SELECT
  id,
  uuid AS id_uuid,
  user_id,
  name,
  description,
  is_public,
  track_count,
  created_at,
  updated_at
FROM user_sets;

-- View: playlist_videos → set_tracks alias
CREATE OR REPLACE VIEW playlist_videos AS
SELECT
  id,
  set_id AS playlist_id,
  video_id,
  position,
  added_at
FROM set_tracks;
