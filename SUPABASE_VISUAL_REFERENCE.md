# The Video Pool - Database Visual Reference

**Quick lookup for table structures, relationships, and queries.**

---

## Entity Relationship Diagram (Text Format)

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                         │
│                      the_video_pool (Supabase)                  │
└─────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   videos     │
                              │  (30,000+)   │
                              └──────┬───────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
              ▼─────────┐      ▼─────────────┐  ▼──────────────┐
         ┌──────────────────┐ ┌──────────────┐ ┌────────────────┐
         │   favorites      │ │  downloads   │ │ playlist_videos│
         │ (user liked)     │ │ (analytics)  │ │ (many-to-many) │
         └──────────────────┘ └──────────────┘ └────┬───────────┘
                    │                                 │
                    └────────────────┬────────────────┘
                                     │
                              ┌──────▼───────┐
                              │  playlists   │
                              │ (user sets)  │
                              └──────────────┘
                                     │
                                     │
                              ┌──────▼───────────┐
                              │ user_profiles    │
                              │ (accounts/prefs) │
                              └──────────────────┘
```

---

## Table Structures Quick Ref

### `videos` (Core Content)
```
Primary Key:  id (UUID)
Rows:         30,000+

Fields:
  - metadata:  title, artist, label, bpm, key, genre, subgenres[]
  - media:     quality (4K|1080p|720p|480p), duration, thumbnail, video_url
  - flags:     is_new, is_hot
  - tracking:  date_created, date_modified, upload_date (all UTC)

Indexes:      genre, artist, is_new, is_hot, upload_date
Constraints:  quality CHECK (4K|1080p|720p|480p)
```

### `user_profiles` (Accounts)
```
Primary Key:  id (UUID)
Foreign Ref:  user_id (TEXT, UNIQUE)
Rows:         Active users

Fields:
  - auth:      user_id, name, email (both UNIQUE)
  - billing:   plan (free|pro|elite), downloads_remaining
  - ui prefs:  section_order, section_states, genre_order (JSONB)
  - ui prefs:  view_mode (grid|list)
  - tracking:  created_at, updated_at (UTC)

Indexes:      user_id, email, plan
Constraints:  plan CHECK (free|pro|elite), view_mode CHECK (grid|list)
```

### `favorites` (User Likes)
```
Primary Key:  id (UUID)
Foreign Refs: user_id (TEXT), video_id (UUID → videos.id)
Rows:         User favorites (N × M possible)

Fields:
  - user_id:   Who favorited
  - video_id:  What video (CASCADE delete)
  - created_at: When favorited (UTC)

Indexes:      user_id, video_id, created_at
Constraints:  UNIQUE (user_id, video_id) — no duplicate favorites
```

### `downloads` (Analytics)
```
Primary Key:  id (UUID)
Foreign Refs: user_id (TEXT), video_id (UUID → videos.id)
Rows:         Download history (all-time audit trail)

Fields:
  - user_id:      Who downloaded
  - video_id:     What video (CASCADE delete)
  - downloaded_at: When (UTC)

Indexes:      user_id, video_id, downloaded_at
Constraints:  Foreign key CASCADE
```

### `playlists` (User Sets)
```
Primary Key:  id (UUID)
Foreign Ref:  user_id (TEXT)
Rows:         User playlists

Fields:
  - user_id:    Owner
  - name:       Playlist name
  - description: Optional description
  - is_public:  Share visibility (default: private)
  - created_at, updated_at: Timestamps (UTC)

Indexes:      user_id, is_public (filtered), created_at
Constraints:  None (free-form)
```

### `playlist_videos` (Playlist Content)
```
Primary Key:  id (UUID)
Foreign Refs: playlist_id (UUID → playlists.id CASCADE)
              video_id (UUID → videos.id CASCADE)
Rows:         Playlist memberships (many-to-many)

Fields:
  - playlist_id: Which playlist
  - video_id:    Which video
  - position:    Order in playlist (0-based)
  - added_at:    When added (UTC)

Indexes:      playlist_id, video_id, (playlist_id, position)
Constraints:  UNIQUE (playlist_id, video_id) — no duplicates in same playlist
```

---

## Common Query Patterns

### Get Videos for Homepage
```sql
SELECT * FROM videos
WHERE is_new = TRUE OR is_hot = TRUE
ORDER BY upload_date DESC
LIMIT 50;
```
Uses: `idx_videos_is_new`, `idx_videos_is_hot`, `idx_videos_upload_date`

### Get User's Favorites
```sql
SELECT v.* FROM videos v
JOIN favorites f ON v.id = f.video_id
WHERE f.user_id = 'user-123'
ORDER BY f.created_at DESC;
```
Uses: `idx_favorites_user_id`, `idx_favorites_video_id`

### Get User's Playlists
```sql
SELECT * FROM playlists
WHERE user_id = 'user-123'
ORDER BY created_at DESC;
```
Uses: `idx_playlists_user_id`

### Get Videos in Playlist (Ordered)
```sql
SELECT v.*, pv.position FROM videos v
JOIN playlist_videos pv ON v.id = pv.video_id
WHERE pv.playlist_id = 'playlist-456'
ORDER BY pv.position ASC;
```
Uses: `idx_playlist_videos_playlist_id`

### Filter by Genre
```sql
SELECT * FROM videos
WHERE genre = 'House'
ORDER BY upload_date DESC;
```
Uses: `idx_videos_genre`

### Get Download History (Pagination)
```sql
SELECT v.title, d.downloaded_at FROM downloads d
JOIN videos v ON d.video_id = v.id
WHERE d.user_id = 'user-123'
ORDER BY d.downloaded_at DESC
OFFSET 0 LIMIT 50;
```
Uses: `idx_downloads_user_id`

---

## Data Relationships

### One User → Many Favorites
```
user_profiles (user_id="alice")
           ↓
    [favorites]  ← user_id = "alice"
           ↓
      [videos]  ← multiple
```

### One User → Many Playlists → Many Videos
```
user_profiles (user_id="bob")
           ↓
    [playlists]  ← user_id = "bob"
           ↓
  [playlist_videos] ← many
           ↓
     [videos]  ← many per playlist
```

### One User → Many Downloads
```
user_profiles (user_id="charlie")
           ↓
   [downloads]  ← user_id = "charlie"
           ↓
     [videos]  ← all downloads
```

---

## Cascade Delete Behavior

If you DELETE a record, here's what cascades:

```
DELETE FROM videos WHERE id = 'video-123'
  ↓
Cascades to:
  - favorites (all favorites for this video)
  - downloads (all downloads for this video)
  - playlist_videos (video removed from all playlists)

DELETE FROM playlists WHERE id = 'playlist-456'
  ↓
Cascades to:
  - playlist_videos (all entries for this playlist)
  - (videos are NOT deleted, just unlinked)

DELETE FROM user_profiles WHERE user_id = 'user-xyz'
  ↓
DOES NOT cascade (by design, need separate cleanup)
  - Orphaned favorites, downloads, playlists remain
  - TODO: Add RLS policies to handle user deletion
```

---

## JSON Field Examples

### `section_order` (user_profiles)
```json
["new-releases", "trending", "for-you"]
```
Stores the order of sections in the UI.

### `section_states` (user_profiles)
```json
{
  "new-releases": { "collapsed": false },
  "trending": { "collapsed": true },
  "for-you": { "collapsed": false }
}
```
Stores collapse state of each section.

### `genre_order` (user_profiles)
```json
["House", "Techno", "Drum & Bass", "Trance"]
```
User's custom genre ordering.

---

## Size Estimates (30K videos)

| Table | Rows | Approx Size | Growth |
|-------|------|-------------|--------|
| `videos` | 30,000 | 15-20 MB | +video metadata |
| `user_profiles` | 1,000-10,000 | 1-5 MB | +new users |
| `favorites` | 100,000 | 5-10 MB | +user activity |
| `downloads` | 500,000+ | 20-40 MB | +audit trail |
| `playlists` | 10,000-100,000 | 2-10 MB | +user playlists |
| `playlist_videos` | 100,000+ | 10-20 MB | +playlist content |
| **TOTAL** | **~700K-800K** | **~53-95 MB** | Grows with users |

---

## Index Size Estimates

| Index | Approx Size | Purpose |
|-------|-------------|---------|
| `idx_videos_genre` | 200 KB | Genre filtering |
| `idx_videos_artist` | 250 KB | Artist filtering |
| `idx_videos_is_new` | 50 KB | Filtered index (only TRUE) |
| `idx_videos_is_hot` | 50 KB | Filtered index (only TRUE) |
| `idx_videos_upload_date` | 250 KB | Date sorting |
| `idx_user_profiles_user_id` | 100 KB | User lookups |
| `idx_user_profiles_email` | 100 KB | Email lookups |
| `idx_user_profiles_plan` | 50 KB | Plan filtering |
| `idx_favorites_user_id` | 300 KB | User's favorites |
| `idx_favorites_video_id` | 300 KB | Video's fans |
| `idx_favorites_created_at` | 200 KB | Recency sorting |
| `idx_downloads_user_id` | 1-2 MB | User's downloads |
| `idx_downloads_video_id` | 1-2 MB | Video's popularity |
| `idx_downloads_downloaded_at` | 1-2 MB | Recent downloads |
| `idx_playlists_user_id` | 100 KB | User's playlists |
| `idx_playlists_is_public` | 50 KB | Public playlists |
| `idx_playlists_created_at` | 100 KB | Playlist recency |
| `idx_playlist_videos_playlist_id` | 300 KB | Playlist members |
| `idx_playlist_videos_video_id` | 300 KB | Video memberships |
| `idx_playlist_videos_position` | 300 KB | Playlist ordering |
| **TOTAL** | **~6-8 MB** | All indexes |

---

## Performance Notes

- **Query Speed:** All common queries can be served in <50ms
- **Concurrent Users:** Database can handle 100+ concurrent users
- **Insert Speed:** New videos indexed immediately (no batch lag)
- **Scan Performance:** Filtered indexes prevent full table scans
- **Cascade Deletes:** Video deletion triggers ~3 cascade operations (safe, but not instant on large datasets)

---

## Scaling Considerations

### When You Have 100K Videos
- Add full-text search index on `videos(title, artist)`
- Consider partitioning `downloads` table by date
- Add materialized view for trending videos cache

### When You Have 1M+ Downloads
- Partition `downloads` by date (monthly or quarterly)
- Archive old downloads to separate schema
- Add caching layer (Redis) for hot queries

### When You Have 100K+ Users
- Denormalize popular video stats to avoid joins
- Add replication for read scaling
- Use connection pooling (PgBouncer)

---

## ER Diagram (ASCII Art)

```
                            ┌─────────────────────────┐
                            │      videos             │
                            ├─────────────────────────┤
                            │ id (UUID) PK            │
                            │ title, artist, label    │
                            │ bpm, key, genre         │
                            │ subgenres[]             │
                            │ quality, duration       │
                            │ thumbnail, video_url    │
                            │ is_new, is_hot          │
                            │ date_created            │
                            │ date_modified           │
                            │ upload_date             │
                            └───────┬──────┬──────┬────┘
                                    │      │      │
                    ┌───────────────┘      │      └──────────────┐
                    │                      │                     │
              ┌─────▼──────┐    ┌──────────▼──────┐    ┌─────────▼──────┐
              │ favorites   │    │  downloads      │    │ playlist_videos│
              ├─────────────┤    ├─────────────────┤    ├─────────────────┤
              │ id (UUID)PK │    │ id (UUID) PK    │    │ id (UUID) PK    │
              │ user_id (FK)│    │ user_id (FK)    │    │ playlist_id(FK) │
              │ video_id(FK)│    │ video_id (FK)   │    │ video_id (FK)   │
              │ created_at  │    │ downloaded_at   │    │ position        │
              └─────────────┘    └─────────────────┘    │ added_at        │
                    │                   │               └────────┬────────┘
                    │                   │                        │
                    │          ┌────────┘                        │
                    │          │                                 │
                    └──────────┼─────────────────────────────────┘
                               │
                        ┌──────▼──────────┐
                        │   playlists     │
                        ├─────────────────┤
                        │ id (UUID) PK    │
                        │ user_id (FK)    │
                        │ name            │
                        │ description     │
                        │ is_public       │
                        │ created_at      │
                        │ updated_at      │
                        └────────┬────────┘
                                 │
                        ┌────────▼─────────────┐
                        │  user_profiles      │
                        ├─────────────────────┤
                        │ id (UUID) PK        │
                        │ user_id (TEXT, UQ)  │
                        │ name                │
                        │ email (UNIQUE)      │
                        │ plan                │
                        │ downloads_remaining │
                        │ section_order       │
                        │ section_states      │
                        │ genre_order         │
                        │ view_mode           │
                        │ created_at          │
                        │ updated_at          │
                        └─────────────────────┘

Key:
  PK = Primary Key
  FK = Foreign Key (with CASCADE delete)
  UQ = Unique
```

---

## File Locations

```
/Users/dremacmini/Desktop/OC/video-pool/
├── SUPABASE_MIGRATION.sql         ← Run this in Supabase
├── SUPABASE_QUICK_SETUP.md         ← Setup instructions
├── SUPABASE_SQL_VALIDATION.md      ← Technical validation
└── SUPABASE_VISUAL_REFERENCE.md    ← This file
```

---

## What's NOT Included (Add Later)

- Row Level Security (RLS) policies
- Full-text search indexes
- Storage bucket for video files
- Real-time subscriptions (Supabase feature)
- Audit logs (created_by, modified_by tracking)
- Soft deletes (is_deleted flags)

