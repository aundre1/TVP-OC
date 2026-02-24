# The Video Pool - Supabase Setup: START HERE

**Status**: ✅ 100% READY FOR DEPLOYMENT  
**Date**: February 22, 2026  
**Time to complete**: ~10-15 minutes

---

## What You're Doing

Creating a **completely independent** Supabase database project for The Video Pool with:
- ✅ 6 tables (videos, user_profiles, favorites, downloads, playlists, playlist_videos)
- ✅ 18 indexes for performance
- ✅ 2 unique constraints for data integrity
- ✅ Custom `the_video_pool` schema (isolated from other projects)
- ✅ Ready for 30,000+ DJ videos
- ✅ Full connection string for Railway deployment

---

## The 5-Step Process (10-15 minutes)

### Step 1: Create Supabase Project (3 minutes)

**Actions:**
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. **Name**: `the-video-pool`
4. **Password**: Generate & save strong password
5. **Region**: Pick closest to you
6. Click "Create"
7. **Wait 2-3 minutes** for provisioning

**⏱️ Time**: 3 minutes (mostly waiting)

---

### Step 2: Deploy Database Schema (2 minutes)

**File to use:**
```
/Users/dremacmini/Desktop/OC/video-pool/SUPABASE_MIGRATION.sql
```

**Actions:**
1. In Supabase, go to **SQL Editor**
2. Create new query
3. Copy **entire contents** of `SUPABASE_MIGRATION.sql`
4. Paste into SQL editor
5. Click **"Run"**
6. Wait for success (should see green checkmark)

**⏱️ Time**: 2 minutes (mostly running SQL)

---

### Step 3: Verify Schema Created (1 minute)

**Run this SQL query:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'the_video_pool'
ORDER BY table_name;
```

**Expected result:**
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

If you see all 6 tables → **SUCCESS!** ✅

**⏱️ Time**: 1 minute

---

### Step 4: Get Your DATABASE_URL (3 minutes)

**Actions:**
1. Go to **Project Settings → Database**
2. Find **"Connection string"**
3. Copy the **Host** (e.g., `abcdefghij.supabase.co`)
4. Remember your **Password** (from creation)

**Build your DATABASE_URL:**
```
postgresql://postgres:{PASSWORD}@{HOST}:5432/postgres?schema=the_video_pool
```

**Example** (with fake values):
```
postgresql://postgres:super_secret_123@abcdefghij.supabase.co:5432/postgres?schema=the_video_pool
```

**Save this somewhere safe** - you'll need it next.

**⏱️ Time**: 3 minutes (finding the values)

---

### Step 5: Save Your Credentials (1 minute)

**Create file**: `/Users/dremacmini/Desktop/OC/video-pool/TVP_SUPABASE_CREDENTIALS.md`

**Copy this template and fill it in:**

```markdown
# The Video Pool - Supabase Credentials

## Project Info
- **Project Name**: The Video Pool
- **Project ID**: [YOUR_PROJECT_ID]
- **Region**: [YOUR_REGION]
- **Created**: [TODAY'S DATE]

## Database Connection
- **Host**: [HOST].supabase.co
- **Database**: postgres
- **Schema**: the_video_pool
- **Port**: 5432
- **User**: postgres
- **Password**: [YOUR_PASSWORD]

## Full DATABASE_URL
```
postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST].supabase.co:5432/postgres?schema=the_video_pool
```

## Tables Created (6 Total)
- [x] videos (6 indexes)
- [x] user_profiles (3 indexes)
- [x] favorites (3 indexes)
- [x] downloads (3 indexes)
- [x] playlists (3 indexes)
- [x] playlist_videos (3 indexes)

## Verification Status
- [x] Schema created: the_video_pool
- [x] All tables created
- [x] All indexes created
- [x] DATABASE_URL tested

## Next Steps
1. Add DATABASE_URL to Railway environment variables
2. Deploy backend API to Railway
3. Test API endpoints
```

**⏱️ Time**: 1 minute

---

## Total Time: ~10-15 minutes

| Step | Action | Time |
|------|--------|------|
| 1 | Create Supabase project | 3 min |
| 2 | Deploy schema (run SQL) | 2 min |
| 3 | Verify tables created | 1 min |
| 4 | Get DATABASE_URL | 3 min |
| 5 | Save credentials file | 1 min |
| **TOTAL** | | **~10 min** |

---

## Files You'll Need

| File | Purpose | Where |
|------|---------|-------|
| `SUPABASE_MIGRATION.sql` | SQL schema to run | `/Users/dremacmini/Desktop/OC/video-pool/` |
| `TVP_SUPABASE_CREDENTIALS.md` | Store your secrets here | Create in same directory |

---

## If You Need Help

### Can't find the Host?
1. Go to Supabase Dashboard
2. Select your project
3. Click **Settings** (bottom left)
4. Click **Database**
5. Look for "Connection string" section
6. It shows: `postgresql://postgres:...@HOST:5432/...`
7. Extract the `HOST` part

### SQL didn't run?
1. Check for error messages in SQL Editor
2. Make sure you pasted the **entire** `SUPABASE_MIGRATION.sql` file
3. Try running just this to test:
   ```sql
   CREATE SCHEMA IF NOT EXISTS the_video_pool;
   ```
4. If that works, re-run the full migration

### Can't see tables?
1. Run the verification query (Step 3)
2. Tables might not show in Supabase Studio UI (it doesn't show custom schemas)
3. But they exist - the verification query proves it

---

## What This Creates

### 6 Tables
1. **videos** - 30,000+ DJ videos
2. **user_profiles** - User accounts & preferences
3. **favorites** - Favorite videos per user
4. **downloads** - Download history
5. **playlists** - User-created sets
6. **playlist_videos** - Videos in playlists

### Indexes (18 total)
- Fast lookups by genre, artist, user
- Efficient sorting by date
- Quick filtering by flags (is_new, is_hot)

### Constraints
- Unique user emails
- Prevent duplicate favorites
- Foreign key relationships with cascade delete

### Schema Isolation
- Everything in `the_video_pool` schema
- 100% separate from IncentEdge and other projects
- Zero conflicts or interference

---

## Security Notes

- 🔐 Save your DATABASE_URL in the credentials file
- 🔐 Don't commit the credentials file to Git
- 🔐 Use `.gitignore` if it exists
- 🔐 Only share DATABASE_URL with Railway environment setup
- 🔐 Never put it in public repositories

---

## What's Next?

After you complete all 5 steps:

1. **DATABASE_URL ready** → Add to Railway environment
2. **Deploy backend** → Push code to GitHub, Railway deploys
3. **Backend connects** → API talks to Supabase
4. **Frontend works** → React app uses API
5. **Done!** → The Video Pool is live

---

## Document Reference

For more detailed info, see:

| Document | Purpose |
|----------|---------|
| `TVP_SUPABASE_IMPLEMENTATION.md` | Complete setup guide with all details |
| `SUPABASE_SETUP_INSTRUCTIONS.md` | Step-by-step walkthrough |
| `TVP_SUPABASE_SETUP_SUMMARY.md` | Reference with schema details |
| `VERIFY_TVP_SUPABASE.sh` | Script to verify setup (advanced) |

---

## Ready?

**Next action**: Go to https://supabase.com/dashboard and click "New Project"

When done with all 5 steps, you'll have:
- ✅ Supabase project created
- ✅ 6 tables deployed
- ✅ DATABASE_URL ready
- ✅ Credentials saved locally
- ✅ Ready for Railway deployment

**Estimated completion**: 10-15 minutes from now

---

**Status**: ✅ READY  
**Last Updated**: February 22, 2026  
**Start here**: https://supabase.com/dashboard
