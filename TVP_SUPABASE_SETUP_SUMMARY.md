# The Video Pool - Supabase Setup Summary

## Status: READY FOR DEPLOYMENT

**Date**: February 22, 2026
**Project**: The Video Pool (TVP)
**Database**: PostgreSQL via Supabase
**Schema**: `the_video_pool`

---

## What Has Been Prepared

### 1. Migration File
- **Location**: `/Users/dremacmini/Desktop/OC/video-pool/SUPABASE_MIGRATION.sql`
- **Size**: 8.5 KB
- **Contents**: 6 tables with 18 indexes and 2 unique constraints

### 2. Tables to Create (6 total)

| Table | Purpose | Records | Key Features |
|-------|---------|---------|--------------|
| `videos` | DJ video content (30K+) | ~30,000+ | UUID PK, genre/artist indexes, is_new/is_hot flags |
| `user_profiles` | User accounts & preferences | Variable | JSONB for section_order/states, subscription plans |
| `favorites` | User-favorited videos | Variable | user_id + video_id unique constraint |
| `downloads` | Download history & analytics | Variable | tracks usage per user |
| `playlists` | User-created video sets | Variable | public/private visibility |
| `playlist_videos` | Playlist-to-video junction table | Variable | position ordering, cascade deletes |

### 3. Setup Documentation
- ✅ `/Users/dremacmini/Desktop/OC/video-pool/SUPABASE_SETUP_INSTRUCTIONS.md` - Step-by-step guide
- ✅ `/Users/dremacmini/Desktop/OC/video-pool/VERIFY_TVP_SUPABASE.sh` - Verification script
- ✅ `/Users/dremacmini/Desktop/OC/video-pool/SUPABASE_MIGRATION.sql` - Ready to deploy

---

## Quick Start (2 Steps)

### Step 1: Create Project on Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. **Name**: `the-video-pool`
4. **Region**: Closest to your users
5. Click "Create" and wait 2-3 minutes

### Step 2: Deploy Schema
1. Open SQL Editor in your new Supabase project
2. Copy entire contents of `/Users/dremacmini/Desktop/OC/video-pool/SUPABASE_MIGRATION.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify with:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'the_video_pool'
ORDER BY table_name;
```

Expected result: 6 rows (videos, user_profiles, favorites, downloads, playlists, playlist_videos)

---

## Getting Your DATABASE_URL

Once the project is created:

1. **Go to**: Project Settings → Database
2. **Find**: "Connection string" section
3. **Copy the connection string** (or build manually):

```
postgresql://postgres:{PASSWORD}@{HOST}.supabase.co:5432/postgres?schema=the_video_pool
```

Replace:
- `{PASSWORD}` = Your database password (from project creation)
- `{HOST}` = Your Supabase project host (from URL, e.g., `abcdefghijklmnopqrst`)

---

## Next: Save Credentials File

Once you have the DATABASE_URL, create this file:

**File**: `/Users/dremacmini/Desktop/OC/video-pool/TVP_SUPABASE_CREDENTIALS.md`

```markdown
# The Video Pool - Supabase Credentials

## Project Info
- **Project Name**: The Video Pool
- **Project ID**: [YOUR_PROJECT_ID]
- **Region**: [YOUR_REGION]
- **Created**: [DATE]

## Database Connection
- **Host**: [HOST].supabase.co
- **Database**: postgres
- **Schema**: the_video_pool
- **Port**: 5432
- **User**: postgres

## Full DATABASE_URL
```
postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST].supabase.co:5432/postgres?schema=the_video_pool
```

## Tables Created (6 Total)
- [x] videos - DJ video content (6 indexes)
- [x] user_profiles - User accounts & preferences (3 indexes)
- [x] favorites - User favorites (3 indexes)
- [x] downloads - Download analytics (3 indexes)
- [x] playlists - User-created sets (3 indexes)
- [x] playlist_videos - Playlist→video junction (3 indexes)

## Verification
All tables created successfully with proper indexes and constraints.
```

---

## Schema Details

### videos (30,000+ records)
```sql
id (UUID PK)
title, artist, label, genre, subgenres[]
bpm (INTEGER), key (TEXT)
quality (4K|1080p|720p|480p)
duration, thumbnail, video_url
is_new BOOLEAN, is_hot BOOLEAN
date_created, date_modified, upload_date
```

**Indexes** (6):
- genre, artist, is_new, is_hot, upload_date

### user_profiles
```sql
id (UUID PK)
user_id (TEXT UNIQUE), name, email (UNIQUE)
plan (free|pro|elite), downloads_remaining
section_order (JSONB), section_states (JSONB)
genre_order (JSONB), view_mode (grid|list)
created_at, updated_at
```

**Indexes** (3):
- user_id, email, plan

### favorites
```sql
id (UUID PK)
user_id (TEXT), video_id (UUID FK → videos)
created_at
UNIQUE(user_id, video_id)
```

**Indexes** (3):
- user_id, video_id, created_at

### downloads
```sql
id (UUID PK)
user_id (TEXT), video_id (UUID FK → videos)
downloaded_at
```

**Indexes** (3):
- user_id, video_id, downloaded_at

### playlists
```sql
id (UUID PK)
user_id (TEXT), name, description
is_public BOOLEAN
created_at, updated_at
```

**Indexes** (3):
- user_id, is_public, created_at

### playlist_videos
```sql
id (UUID PK)
playlist_id (UUID FK → playlists), video_id (UUID FK → videos)
position (INTEGER)
added_at
UNIQUE(playlist_id, video_id)
```

**Indexes** (3):
- playlist_id, video_id, (playlist_id, position)

---

## Verification Checklist

- [ ] Project created on Supabase dashboard
- [ ] Project ID and host obtained
- [ ] Migration SQL executed in SQL Editor
- [ ] 6 tables visible in Table Editor
- [ ] All indexes created
- [ ] DATABASE_URL generated and copied
- [ ] TVP_SUPABASE_CREDENTIALS.md file created
- [ ] DATABASE_URL added to Railway environment
- [ ] Backend API deployed to Railway
- [ ] Endpoints tested

---

## Project Independence

This Supabase project is **100% independent** from all other projects:
- ✅ Separate Supabase account/project
- ✅ Separate database (`the_video_pool` schema)
- ✅ Separate connection string
- ✅ Separate credentials file
- ✅ No shared resources with IncentEdge or other projects

---

## Troubleshooting

### Issue: "Host not found"
**Solution**: 
- Go to Project Settings → Database
- Look for "Connection string" section
- Extract host from: `postgresql://postgres:...@HOST:5432/...`

### Issue: "Schema doesn't exist"
**Solution**:
- Make sure you ran the ENTIRE SUPABASE_MIGRATION.sql file
- Check SQL Editor for error messages
- Verify with: `SELECT * FROM information_schema.schemata WHERE schema_name = 'the_video_pool';`

### Issue: "Can't connect with DATABASE_URL"
**Solution**:
- Verify DATABASE_URL format: `postgresql://postgres:PASSWORD@HOST:5432/postgres?schema=the_video_pool`
- Check special characters in password (URL encode if needed)
- Ensure `?schema=the_video_pool` is at the end

### Issue: Tables not showing in Studio
**Solution**:
- Tables are in a custom schema (`the_video_pool`)
- Supabase Studio may not show custom schemas by default
- Use SQL Editor to verify: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'the_video_pool';`

---

## Files Reference

| File | Purpose | Status |
|------|---------|--------|
| SUPABASE_MIGRATION.sql | Schema definition | ✅ Ready |
| SUPABASE_SETUP_INSTRUCTIONS.md | Step-by-step guide | ✅ Ready |
| VERIFY_TVP_SUPABASE.sh | Verification script | ✅ Ready |
| TVP_SUPABASE_CREDENTIALS.md | Store your credentials | ⏳ To be created |
| TVP_SUPABASE_SETUP_SUMMARY.md | This file | ✅ Ready |

---

**Last Updated**: February 22, 2026
**Status**: ✅ COMPLETE - Ready for Supabase project creation
