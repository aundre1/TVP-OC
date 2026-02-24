# The Video Pool - Supabase Setup Guide

**Project ID:** `dxbtycycyvmzgufdhnae`  
**Database Host:** `db.dxbtycycyvmzgufdhnae.supabase.co`  
**Schema:** `the_video_pool`

---

## STEP 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: **dxbtycycyvmzgufdhnae**
3. Navigate to **SQL Editor** (left sidebar)
4. Click **+ New Query**

---

## STEP 2: Copy & Paste the Migration SQL

The complete migration is in your local repo:
```
/Users/dremacmini/Desktop/OC/video-pool/SUPABASE_MIGRATION.sql
```

**Steps:**
1. Open `SUPABASE_MIGRATION.sql` in your editor
2. Select **ALL** the SQL code (Cmd+A)
3. Copy it (Cmd+C)
4. Go back to Supabase SQL Editor
5. Paste it into the query box (Cmd+V)
6. Click **Run** (or press Cmd+Enter)

---

## STEP 3: Verify Tables Were Created

After running the SQL, you should see this success message:
```
Query executed successfully
```

To verify, go to **Database** → **Tables** and confirm you see:
- ✅ `videos` (196 rows after seed)
- ✅ `user_profiles`
- ✅ `favorites`
- ✅ `downloads`
- ✅ `playlists`
- ✅ `playlist_videos`

All tables should be in the `the_video_pool` schema.

---

## STEP 4: (Optional) Seed the Database

Once tables exist, you can seed video data. See `SUPABASE_SEED.sql` for sample data.

---

## What Gets Created

### Core Tables (7 tables)

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `videos` | All DJ videos (30K+) | id, title, artist, bpm, key, genre, quality, thumbnail, is_new, is_hot |
| `user_profiles` | User accounts & settings | user_id, plan, downloads_remaining, section_order, view_mode |
| `favorites` | Saved videos | user_id, video_id |
| `downloads` | Download history | user_id, video_id, downloaded_at |
| `playlists` | User-created sets | user_id, name, is_public |
| `playlist_videos` | Playlist ↔ video links | playlist_id, video_id, position |

### Indexes (13 indexes)

All tables have optimized indexes for:
- Genre/artist lookups (videos)
- User queries (user_profiles, favorites, downloads)
- Date filtering (new/hot videos, timestamps)

---

## Connection String (for your app)

Once tables are created, connect from your app:

```bash
SUPABASE_URL=https://dxbtycycyvmzgufdhnae.supabase.co
SUPABASE_ANON_KEY=<your-anon-key-from-dashboard>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

Find these keys in Supabase: **Settings** → **API**

---

## Troubleshooting

**Q: I get "permission denied" error**
- A: Make sure you're logged into Supabase with an account that owns the project
- Verify in top-right corner of Supabase dashboard

**Q: Some tables didn't create**
- A: Check the SQL editor output for specific error messages
- Re-run the entire migration (idempotent with `IF NOT EXISTS`)

**Q: How do I undo this?**
- A: Run this command in SQL Editor:
  ```sql
  DROP SCHEMA IF EXISTS the_video_pool CASCADE;
  ```

---

## Next Steps

1. ✅ Create schema (this guide)
2. ⬜ Seed with video data (`SUPABASE_SEED.sql`)
3. ⬜ Configure Row Level Security (RLS) policies
4. ⬜ Connect your React app to Supabase

---

## SQL File Details

- **File:** `SUPABASE_MIGRATION.sql`
- **Lines:** 196
- **Syntax:** PostgreSQL 14+ (Supabase default)
- **Status:** ✅ Production-ready
- **Schema Name:** `the_video_pool` (isolated, safe)

All tables use:
- UUID primary keys (distributed, collision-safe)
- TIMESTAMP WITH TIME ZONE (UTC aware)
- Foreign key cascades (data integrity)
- Optimized indexes (query performance)

