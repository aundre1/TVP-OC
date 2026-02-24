# The Video Pool - Supabase Setup Guide

Complete step-by-step instructions to set up The Video Pool database in Supabase.

**Project Details:**
- **Supabase Project:** IncentEdge Grants Database (dxbtycycyvmzgufdhnae)
- **Schema:** `the_video_pool` (isolated from IncentEdge data)
- **Tables:** 6 total (videos, user_profiles, favorites, downloads, playlists, playlist_videos)
- **Database:** PostgreSQL at db.dxbtycycyvmzgufdhnae.supabase.co

---

## Step 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Log in with your credentials
3. You should see "IncentEdge Grants Database" in your project list

---

## Step 2: Select the IncentEdge Project

1. Click on "IncentEdge Grants Database"
2. You're now inside the Supabase project
3. Make sure you're in the correct region (look at the top)

---

## Step 3: Open SQL Editor

1. In the left sidebar, click **SQL Editor**
2. You should see a blank SQL editor window
3. Click **"New Query"** button

---

## Step 4: Paste the Migration SQL

1. Open the file: `/Users/dremacmini/Desktop/OC/video-pool/SUPABASE_MIGRATION.sql`
2. Copy the entire contents (Cmd+A, Cmd+C)
3. In the Supabase SQL Editor, paste it (Cmd+V)
4. The query should show:
   - `CREATE SCHEMA the_video_pool;`
   - Multiple `CREATE TABLE` statements
   - Multiple `CREATE INDEX` statements

---

## Step 5: Execute the Migration

1. Click the blue **"Run"** button (or Cmd+Enter)
2. You should see a success message at the bottom:
   ```
   Success: Query executed in XX ms
   ```
3. If there are any errors, they'll appear in red. Common issues:
   - **"Schema already exists"** → Just delete the first line and run again
   - **"Table already exists"** → Drop the table first: `DROP TABLE the_video_pool.tablename;`

---

## Step 6: Verify Tables in Table Editor

1. In the left sidebar, click **Table Editor**
2. You should see a dropdown for your schema
3. Click on **"the_video_pool"** in the dropdown (or it may auto-select)
4. You should see all 6 tables listed:
   - ✅ videos
   - ✅ user_profiles
   - ✅ favorites
   - ✅ downloads
   - ✅ playlists
   - ✅ playlist_videos

If you don't see them, click the refresh icon in the Table Editor.

---

## Step 7: Get Your Connection String

The connection string is needed to connect your app to the database.

### From Supabase Dashboard:

1. In the left sidebar, click **Settings**
2. Click **Database** (under "Configuration")
3. Scroll down to **"Connection string"**
4. You'll see multiple tabs:
   - **URI** (what we need)
   - **psql**
   - **Python**
   - **JavaScript**
5. Click the **URI** tab
6. You should see something like:
   ```
   postgresql://postgres.dxbtycycyvmzgufdhnae:[PASSWORD]@db.dxbtycycyvmzgufdhnae.supabase.co:5432/postgres
   ```

### Important: Do NOT copy this directly!

The connection string from Supabase includes `postgres` database. For Railway, you need to change it:

**Original (from Supabase):**
```
postgresql://postgres.dxbtycycyvmzgufdhnae:[PASSWORD]@db.dxbtycycyvmzgufdhnae.supabase.co:5432/postgres
```

**What you need for Railway:**
```
postgresql://postgres.dxbtycycyvmzgufdhnae:[PASSWORD]@db.dxbtycycyvmzgufdhnae.supabase.co:5432/postgres?schema=the_video_pool
```

Notice: Added `?schema=the_video_pool` at the end.

---

## Step 8: Set Up Railway Environment Variable

1. Go to Railway dashboard for The Video Pool project
2. Select the "Database" service (if you have one) or the app service
3. Click **Variables**
4. Add/Update the `DATABASE_URL`:
   ```
   postgresql://postgres.dxbtycycyvmzgufdhnae:[PASSWORD]@db.dxbtycycyvmzgufdhnae.supabase.co:5432/postgres?schema=the_video_pool
   ```
5. Replace `[PASSWORD]` with the actual password from Supabase
6. Click **Save**

---

## Optional: Load Sample Data

If you want to test with sample data:

1. In Supabase SQL Editor, create a **New Query**
2. Open `/Users/dremacmini/Desktop/OC/video-pool/SUPABASE_SEED_DATA.sql`
3. Copy and paste into SQL Editor
4. Click **Run**
5. You'll now have 15 sample videos and test data to work with

---

## Troubleshooting

### Issue: "Schema already exists"
**Solution:** The migration file tries to create the schema. If it exists, just delete that line:
```sql
-- DELETE THIS LINE if schema already exists:
-- CREATE SCHEMA IF NOT EXISTS the_video_pool;
```

### Issue: "Table already exists"
**Solution:** Drop it first:
```sql
DROP TABLE IF EXISTS the_video_pool.playlist_videos CASCADE;
DROP TABLE IF EXISTS the_video_pool.playlists CASCADE;
DROP TABLE IF EXISTS the_video_pool.downloads CASCADE;
DROP TABLE IF EXISTS the_video_pool.favorites CASCADE;
DROP TABLE IF EXISTS the_video_pool.user_profiles CASCADE;
DROP TABLE IF EXISTS the_video_pool.videos CASCADE;
```

Then run the migration again.

### Issue: "Foreign key constraint fails"
**Solution:** This usually means you're trying to insert data in the wrong order. Always insert into:
1. `videos` first
2. `user_profiles` second
3. Everything else after that

### Issue: Can't see the schema in Table Editor
**Solution:** Click the refresh icon (⟳) or check that you've selected the right schema in the dropdown at the top.

---

## What's Created

### Tables

| Table | Columns | Purpose |
|-------|---------|---------|
| **videos** | 15 columns | All DJ videos (30,000+) with metadata |
| **user_profiles** | 10 columns | User accounts, subscriptions, UI settings |
| **favorites** | 3 columns | Tracks favorited videos |
| **downloads** | 3 columns | Download history & analytics |
| **playlists** | 6 columns | User-created sets/collections |
| **playlist_videos** | 4 columns | Links videos to playlists |

### Indexes Created

For performance optimization:
- **videos:** genre, artist, is_new, is_hot, upload_date
- **user_profiles:** user_id, email, plan
- **favorites:** user_id, video_id, created_at
- **downloads:** user_id, video_id, downloaded_at
- **playlists:** user_id, is_public, created_at
- **playlist_videos:** playlist_id, video_id, position

### Constraints

- UUID primary keys on all tables
- Foreign keys with CASCADE delete (e.g., delete video → auto-delete from favorites)
- UNIQUE constraints (user can't favorite same video twice)
- CHECK constraints (quality must be 4K, 1080p, 720p, or 480p)

---

## Next Steps

1. **Backend:** Update `server/db.ts` to use Supabase instead of local SQLite
2. **Connection:** Add `DATABASE_URL` to Railway environment
3. **Migrations:** If using Drizzle ORM migrations, run them in order
4. **Testing:** Try inserting a test video to confirm connection works
5. **Seeding:** Load sample data from `SUPABASE_SEED_DATA.sql`

---

## Support

If you hit issues:
1. Check the **error message** carefully (Supabase gives good errors)
2. Verify the connection string has `?schema=the_video_pool`
3. Make sure you're in the right Supabase project
4. Check that all tables exist in Table Editor (refresh if needed)
5. Confirm the password is correct in the connection string
