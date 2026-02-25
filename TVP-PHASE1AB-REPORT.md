# TVP Phase 1A+1B Report

**Date:** 2026-02-24
**Status:** ✅ Complete

## Summary

Most Phase 1A+1B work was already done in a prior session. This pass verified completeness and filled the remaining gaps.

## Already Existed (Verified ✓)

### Backend (`server/`)
- ✅ `server/src/routes/favorites.js` — full CRUD + check endpoint
- ✅ `server/src/routes/playlists.js` — full CRUD + video management (uses `user_sets`/`set_tracks` tables)
- ✅ `server/src/routes/downloads.js` — GET history + POST record
- ✅ `server/src/routes/genres.js` — 30-genre list, classify, batch reclassify
- ✅ `server/src/services/genreService.js` — MusicBrainz + Last.fm classification
- ✅ `server/src/index.js` — `/api/health` endpoint (with DB check), all routes mounted
- ✅ `server/src/routes/videos.js` — has `key` filter param
- ✅ `server/src/db/migrations/002_missing_tables.sql` — creates playlists/playlist_videos views
- ✅ Schema (`schema.sql`) already has favorites, user_sets, set_tracks, downloads tables

### Frontend (`src/api/`)
- ✅ `src/api/favoritesApi.ts` — CRUD favorites
- ✅ `src/api/playlistsApi.ts` — CRUD playlists + video management
- ✅ `src/api/downloadsApi.ts` — get history, record download

## Created / Modified This Session

| File | Action | Description |
|------|--------|-------------|
| `src/api/genresApi.ts` | **Created** | getGenres, classifyTrack, reclassifyBatch |
| `src/pages/HomePageV2.tsx` | **Rewritten** | Removed all mock data imports (`@/data/tracks`). Now fetches from `/api/videos` with sortBy params. Added loading skeletons. |
| `src/components/RecentDownloadsPanel.tsx` | **Modified** | Removed `import { recentDownloads } from '@/data/tracks'`. Now uses `getDownloadHistory()` from `downloadsApi.ts` with loading/empty states. |
| `src/components/admin/BulkUploader.tsx` | **Modified** | Expanded GENRES from 10 → 30 (full list matching backend). Added all version types: dirty, radio, remix, instrumental, acapella. |
| `server/.env.generated` | **Created** | 3 JWT secrets (JWT_SECRET, JWT_REFRESH_SECRET, JWT_VERIFICATION_SECRET) |
| `TVP-PHASE1AB-REPORT.md` | **Created** | This file |

## Notes
- HomePageV2 uses `get()` from `src/api/client.ts` which points to the Railway backend
- RecentDownloadsPanel has a `TODO` to replace hardcoded userId with auth store value
- `src/api/videos.ts` still has mock fallbacks behind `DEV_CONFIG.useMockAuth` — separate cleanup task
- `src/data/tracks.ts` can be deleted once all consumers are verified migrated
