# The Video Pool - Supabase Implementation Guide

**Status**: ✅ READY FOR DEPLOYMENT  
**Date**: February 22, 2026  
**Project**: The Video Pool (TVP) - Independent Supabase Instance

---

## Overview

This guide walks you through creating a completely **independent** Supabase project for The Video Pool with a custom `the_video_pool` schema and 6 tables.

**Key Points**:
- ✅ 100% separate from IncentEdge and other projects
- ✅ Custom schema isolation: `the_video_pool`
- ✅ 6 tables with 18 indexes and 2 unique constraints
- ✅ Ready for 30,000+ DJ videos
- ✅ All documentation prepared

---

## Quick Execution Plan

### Phase 1: Create Supabase Project (2-3 minutes)

1. Go to **https://supabase.com/dashboard**
2. Click **"New Project"**
3. Select/create organization
4. Fill form:
   - **Database Name**: `the-video-pool`
   - **Password**: Generate strong password, save it
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait for provisioning (2-3 minutes)

### Phase 2: Deploy Schema (2-3 minutes)

1. In Supabase dashboard, go to **SQL Editor**
2. Create new query
3. Copy entire contents from:
   ```
   /Users/dremacmini/Desktop/OC/video-pool/SUPABASE_MIGRATION.sql
   ```
4. Paste into SQL editor
5. Click **"Run"**
6. Wait for success message

### Phase 3: Verify Tables (1 minute)

Run this in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'the_video_pool'
ORDER BY table_name;
```

**Expected output:**
```
 table_name
----------------
 downloads
 favorites
 playlist_videos
 playlists
 user_profiles
 videos
(6 rows)
```

### Phase 4: Get Credentials (2 minutes)

1. Go to **Project Settings → Database**
2. Find **"Connection string"** section
3. Copy your host and password
4. Build your DATABASE_URL:
   ```
   postgresql://postgres:{PASSWORD}@{HOST}:5432/postgres?schema=the_video_pool
   ```

Replace:
- `{PASSWORD}` = Your database password
- `{HOST}` = Your Supabase host (e.g., `abcdefghij.supabase.co`)

### Phase 5: Save Credentials File (1 minute)

Create `/Users/dremacmini/Desktop/OC/video-pool/TVP_SUPABASE_CREDENTIALS.md`:

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

## Tables Verified
- [x] videos (6 indexes)
- [x] user_profiles (3 indexes)
- [x] favorites (3 indexes)
- [x] downloads (3 indexes)
- [x] playlists (3 indexes)
- [x] playlist_videos (3 indexes)

## Next Steps
1. Add DATABASE_URL to Railway environment
2. Deploy backend API
3. Test endpoints
```

---

## Table Structure Reference

### 1. videos (30,000+ DJ videos)
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  title TEXT, artist TEXT, label TEXT,
  bpm INTEGER, key TEXT, genre TEXT,
  subgenres TEXT[] ARRAY,
  quality TEXT (4K|1080p|720p|480p),
  duration TEXT, thumbnail TEXT, video_url TEXT,
  is_new BOOLEAN, is_hot BOOLEAN,
  date_created TIMESTAMP, date_modified TIMESTAMP, upload_date TIMESTAMP
)
-- Indexes: genre, artist, is_new, is_hot, upload_date
```

### 2. user_profiles
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id TEXT UNIQUE, name TEXT, email TEXT UNIQUE,
  plan TEXT (free|pro|elite), downloads_remaining INTEGER,
  section_order JSONB, section_states JSONB,
  genre_order JSONB, view_mode TEXT (grid|list),
  created_at TIMESTAMP, updated_at TIMESTAMP
)
-- Indexes: user_id, email, plan
```

### 3. favorites
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY,
  user_id TEXT, video_id UUID (FK → videos),
  created_at TIMESTAMP,
  UNIQUE(user_id, video_id)
)
-- Indexes: user_id, video_id, created_at
```

### 4. downloads
```sql
CREATE TABLE downloads (
  id UUID PRIMARY KEY,
  user_id TEXT, video_id UUID (FK → videos),
  downloaded_at TIMESTAMP
)
-- Indexes: user_id, video_id, downloaded_at
```

### 5. playlists
```sql
CREATE TABLE playlists (
  id UUID PRIMARY KEY,
  user_id TEXT, name TEXT, description TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMP, updated_at TIMESTAMP
)
-- Indexes: user_id, is_public, created_at
```

### 6. playlist_videos (junction table)
```sql
CREATE TABLE playlist_videos (
  id UUID PRIMARY KEY,
  playlist_id UUID (FK → playlists), video_id UUID (FK → videos),
  position INTEGER, added_at TIMESTAMP,
  UNIQUE(playlist_id, video_id)
)
-- Indexes: playlist_id, video_id, (playlist_id, position)
```

---

## Schema Isolation

Your schema is **completely isolated** in the `the_video_pool` namespace:

```sql
-- All tables live in: the_video_pool.videos, the_video_pool.user_profiles, etc.
-- This prevents conflicts with any other databases or schemas
-- Connection string includes: ?schema=the_video_pool
```

---

## Verification Commands

### Check Schema Exists
```sql
SELECT * FROM information_schema.schemata WHERE schema_name = 'the_video_pool';
```

### List All Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'the_video_pool'
ORDER BY table_name;
```

### Count Indexes
```sql
SELECT COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'the_video_pool';
```

### Check Constraints
```sql
SELECT table_name, constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'the_video_pool'
ORDER BY table_name, constraint_type;
```

### List Indexes
```sql
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'the_video_pool'
ORDER BY tablename;
```

---

## Files Included

| File | Purpose | Size |
|------|---------|------|
| `SUPABASE_MIGRATION.sql` | Complete schema definition | 8.3 KB |
| `SUPABASE_SETUP_INSTRUCTIONS.md` | Step-by-step instructions | 3.6 KB |
| `TVP_SUPABASE_SETUP_SUMMARY.md` | Comprehensive summary | 7.1 KB |
| `VERIFY_TVP_SUPABASE.sh` | Verification script | 1.7 KB |
| `TVP_SUPABASE_IMPLEMENTATION.md` | This file | - |

---

## Troubleshooting

### Problem: "the_video_pool schema not found"
**Cause**: Migration wasn't fully executed

**Solution**:
1. Go to SQL Editor
2. Run: `CREATE SCHEMA IF NOT EXISTS the_video_pool;`
3. Re-run the entire SUPABASE_MIGRATION.sql

### Problem: "Can't find Host in Supabase"
**Solution**:
1. Go to Project Settings → Database
2. Look for "Connection string" section
3. It shows: `postgresql://postgres:...@HOST:5432/postgres`
4. Extract the HOST portion (e.g., `abcdefghij.supabase.co`)

### Problem: "DATABASE_URL not working in Railway"
**Checklist**:
- [ ] Format correct: `postgresql://postgres:PASSWORD@HOST:5432/postgres?schema=the_video_pool`
- [ ] Password matches (from Supabase project creation)
- [ ] Host is correct (from Project Settings)
- [ ] `?schema=the_video_pool` is at the end
- [ ] Special characters in password are URL-encoded

### Problem: "Tables show in SQL Editor but not in Supabase Studio"
**Cause**: Studio doesn't show custom schemas by default

**Solution**:
- Use SQL Editor to query your data
- Tables are definitely there (verify with verification query)
- This is normal Supabase behavior for custom schemas

---

## Next Steps After Setup

1. **Save your DATABASE_URL** to:
   ```
   /Users/dremacmini/Desktop/OC/video-pool/TVP_SUPABASE_CREDENTIALS.md
   ```

2. **Add to Railway environment**:
   - Go to Railway project settings
   - Add `DATABASE_URL` environment variable
   - Paste your connection string

3. **Deploy backend API**:
   - Push code to GitHub
   - Railway auto-deploys
   - Backend connects to Supabase

4. **Test connectivity**:
   ```bash
   # Optional: test with verification script
   bash /Users/dremacmini/Desktop/OC/video-pool/VERIFY_TVP_SUPABASE.sh \
     "postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres?schema=the_video_pool"
   ```

5. **Add seed data** (optional):
   - Use `SUPABASE_SEED_DATA.sql` for sample videos
   - Run in SQL Editor to populate test data

---

## Project Independence Summary

This Supabase project is **100% independent**:

✅ **Separate Supabase Organization**: Not shared  
✅ **Separate Project**: New project with unique ID  
✅ **Separate Database**: `postgres` database  
✅ **Separate Schema**: `the_video_pool` namespace  
✅ **Separate Connection**: Unique DATABASE_URL  
✅ **Separate Credentials**: Stored locally only  
✅ **No Integration**: Zero dependency on IncentEdge or other projects  

---

## Support Files

For more detailed information, see:
- `SUPABASE_SETUP_INSTRUCTIONS.md` - Detailed step-by-step
- `TVP_SUPABASE_SETUP_SUMMARY.md` - Complete reference
- `SUPABASE_MIGRATION.sql` - Raw SQL schema
- `SUPABASE_SEED_DATA.sql` - Sample data (optional)

---

**Status**: ✅ READY  
**Last Updated**: February 22, 2026  
**Next Action**: Create Supabase project and run migration SQL
