-- Migration 019: Spotify + Apple OAuth support
-- Adds spotify_id and apple_id columns to users table

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS spotify_id VARCHAR(255);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS apple_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS users_spotify_id_idx
  ON users(spotify_id)
  WHERE spotify_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_apple_id_idx
  ON users(apple_id)
  WHERE apple_id IS NOT NULL;

-- Required env vars after this migration:
-- Railway (backend): SPOTIFY_CLIENT_ID=<from Spotify Developer Dashboard>
--                    SPOTIFY_CLIENT_SECRET=<from Spotify Developer Dashboard>
--                    APPLE_TEAM_ID=34UE397K5R (already set)
--                    APPLE_KEY_ID=5243K8458B  (already set)
--                    APPLE_PRIVATE_KEY=<.p8 contents from Apple Developer Console>
--                    APPLE_SERVICE_ID=<Service ID registered for web in Apple Developer Console>
-- Vercel (frontend): VITE_SPOTIFY_CLIENT_ID=<from Spotify Developer Dashboard>
--                    VITE_APPLE_TEAM_ID=34UE397K5R  (already set)
--                    VITE_APPLE_KEY_ID=5243K8458B   (already set)
--                    VITE_APPLE_BUNDLE_ID=com.thevideopool.app (already set)
