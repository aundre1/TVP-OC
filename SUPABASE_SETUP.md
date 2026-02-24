# Supabase Setup — Database Configuration

**Last Updated:** February 22, 2026
**Status:** Required before backend can start
**Timeline:** 20-30 minutes
**Database:** PostgreSQL 15+

---

## Overview

Supabase hosts the PostgreSQL database that stores:
- Users (registration, login, profiles)
- Videos (metadata, genres, ratings)
- Playlists (user-created collections)
- Downloads (tracking, analytics)
- Sessions (JWT tokens, refresh tokens)

---

## Architecture

```
Frontend → Vercel
  ↓
Backend → Railway
  ↓
Database → Supabase PostgreSQL (the_video_pool schema)
  ↓
✅ All connected
```

---

## Step 1: Create Supabase Account

**Time: 2 minutes**

### Go to Supabase
```
https://supabase.com
```

### Sign Up
1. Click **"Start your project"**
2. Click **"Sign up with GitHub"**
3. Authorize GitHub access
4. You'll be redirected to create a project

---

## Step 2: Create Project

**Time: 5 minutes**

### Create New Project
1. Go to: https://app.supabase.com
2. Click **"New Project"**
3. Fill in details:
   - **Name:** `the-video-pool` (or `tvp`)
   - **Password:** Generate a strong password (you'll need this)
   - **Region:** Pick closest to your users (us-east-1 or eu-west-1)
   - **Pricing Plan:** Free tier works for launch

### Wait for Project Setup
Supabase provisions the database (takes 1-2 minutes):
```
Creating PostgreSQL instance...
Creating Auth system...
Creating API...
✅ Project ready
```

### Get Database Credentials
Once ready, click **"Settings"** → **"Database"** to see:
```
Host: db.XXXXX.supabase.co
Database: postgres
User: postgres
Password: [your password from step 3]
Port: 5432
```

---

## Step 3: Get Connection String

**Time: 2 minutes**

### Go to Database Settings
1. In Supabase project, click **"Settings"** (gear icon)
2. Go to **"Database"** in left sidebar
3. Scroll to **"Connection strings"** section
4. Switch to **"URI"** tab

### Copy PostgreSQL Connection String
You'll see:
```
postgresql://postgres:[PASSWORD]@db.XXXXX.supabase.co:5432/postgres
```

Replace `[PASSWORD]` with the password you created.

This is your **DATABASE_URL** for:
- `.env.local` (local development)
- Railway environment variables (production)

---

## Step 4: Create Schema

**Time: 10 minutes**

The database needs tables for the Video Pool app. You can:
1. **Option A:** Run SQL migrations (recommended)
2. **Option B:** Use the Supabase UI to create tables manually

### Option A: Run SQL Migrations (Recommended)

#### In Supabase Editor
1. Go to: https://app.supabase.com → Your Project
2. Click **"SQL Editor"** in left sidebar
3. Click **"New Query"**
4. Copy this entire SQL block:

```sql
-- ============================================================
-- THE VIDEO POOL - Core Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Users Table
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- Sessions Table (for JWT tokens)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500),
  refresh_token VARCHAR(500),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- ============================================================
-- Genres Table
-- ============================================================
CREATE TABLE IF NOT EXISTS genres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  color VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Artists Table
-- ============================================================
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Videos Table (Core)
-- ============================================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  duration_seconds INTEGER,
  genre_id UUID REFERENCES genres(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  release_date DATE,
  bpm INTEGER,
  key VARCHAR(10),
  energy_level VARCHAR(50),
  mood VARCHAR(50),
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active'
);

-- ============================================================
-- Playlists Table
-- ============================================================
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Playlist Videos (Junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS playlist_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(playlist_id, video_id)
);

-- ============================================================
-- Downloads Tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  download_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  file_format VARCHAR(50),
  file_size INTEGER
);

-- ============================================================
-- Favorites (Likes)
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, video_id)
);

-- ============================================================
-- Subscriptions (Phase 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Indexes (Performance)
-- ============================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_videos_genre ON videos(genre_id);
CREATE INDEX idx_videos_artist ON videos(artist_id);
CREATE INDEX idx_playlists_user ON playlists(user_id);
CREATE INDEX idx_playlist_videos_playlist ON playlist_videos(playlist_id);
CREATE INDEX idx_downloads_user ON downloads(user_id);
CREATE INDEX idx_downloads_video ON downloads(video_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- ============================================================
-- Seed Data (Optional - for development)
-- ============================================================
INSERT INTO genres (name, slug, description, color) VALUES
  ('Hip-Hop', 'hip-hop', 'Hip-hop and rap music', '#FF6B6B'),
  ('House', 'house', 'Electronic dance and house music', '#4ECDC4'),
  ('Reggae', 'reggae', 'Reggae and dancehall', '#FFE66D'),
  ('Pop', 'pop', 'Pop and mainstream music', '#95E1D3'),
  ('Rock', 'rock', 'Rock and alternative', '#AA96DA')
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, slug, bio) VALUES
  ('DJ Khaled', 'dj-khaled', 'Producer and DJ'),
  ('Calvin Harris', 'calvin-harris', 'Electronic music producer'),
  ('Bob Marley', 'bob-marley', 'Reggae legend')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Helper: Update timestamps automatically
-- ============================================================
-- Note: Supabase has built-in timestamp functions
-- If needed, create triggers for updated_at fields
```

5. Click **"Run"** (or Cmd+Enter)
6. Wait for SQL to execute
7. You should see "Success" message

### Option B: Create Tables in Supabase UI (Manual)

1. In Supabase, click **"SQL Editor"** → **"New Query"**
2. Paste sections one at a time
3. Run each section individually
4. Wait for success before next section

---

## Step 5: Verify Schema

**Time: 2 minutes**

### Check Tables Exist
1. Go to **"Table Editor"** in Supabase
2. You should see these tables in the left sidebar:
   ```
   ✅ users
   ✅ sessions
   ✅ genres
   ✅ artists
   ✅ videos
   ✅ playlists
   ✅ playlist_videos
   ✅ downloads
   ✅ favorites
   ✅ subscriptions
   ```

### Check Sample Data
1. Click **"genres"** table
2. You should see 5 genres (Hip-Hop, House, etc.)
3. Click **"artists"** table
4. You should see 3 artists

---

## Step 6: Configure Permissions (Security)

**Time: 5 minutes**

**Important:** By default, Supabase tables are readable by the public database role. For launch (MVP), this is fine. For production, you'll need Row-Level Security (RLS).

### For MVP (Current)
Skip this step. Public access is OK for now.

### For Production (Later)
You'll need to:
1. Enable RLS on sensitive tables (users, subscriptions)
2. Create policies for user isolation
3. See Supabase RLS docs for details

---

## Step 7: Get Environment Variables

**Time: 2 minutes**

You now have everything for the `.env` files:

### Backend (.env)
```
DATABASE_URL=postgres://postgres:[PASSWORD]@db.XXXXX.supabase.co:5432/postgres
```

### Local Development
```bash
# .env.local in project root
DATABASE_URL=postgres://postgres:[PASSWORD]@db.XXXXX.supabase.co:5432/postgres
```

### Railway
Copy to Railway Variables:
```
DATABASE_URL=postgres://postgres:[PASSWORD]@db.XXXXX.supabase.co:5432/postgres
```

---

## Step 8: Test Connection (Optional)

**Time: 3 minutes**

### Test with psql (Command Line)
```bash
# Install psql (macOS):
# brew install libpq
# Or use the full PostgreSQL: brew install postgresql

# Test connection:
psql postgres://postgres:[PASSWORD]@db.XXXXX.supabase.co:5432/postgres -c "SELECT version();"

# Should output PostgreSQL version
```

### Test with Node.js
```bash
# Create test.js:
cat > test-db.js << 'EOF'
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.query('SELECT version()', (err, res) => {
  if (err) {
    console.error('Connection failed:', err);
  } else {
    console.log('Connected! PostgreSQL:', res.rows[0].version);
  }
  pool.end();
});
EOF

# Run test:
DATABASE_URL="postgres://..." node test-db.js
```

---

## Step 9: Backup & Security

**Time: 2 minutes**

### Enable Automatic Backups
1. Go to **"Settings"** → **"Backups"**
2. Check **"Automatic backups enabled"**
3. Retention: Keep last 7 days (free tier)

### Enable Point-in-Time Recovery (Optional)
1. Go to **"Settings"** → **"Backups"**
2. Check **"Point-in-time recovery"**
3. Allows restoring to any point in last 7 days

### Create Manual Backup
1. Go to **"Backups"**
2. Click **"Take backup"**
3. Backup creates instantly
4. Can restore if needed

---

## Database Tables Reference

| Table | Purpose | Rows |
|-------|---------|------|
| `users` | User accounts, auth | ~11,000 (from previous) |
| `sessions` | JWT tokens, login sessions | Dynamic |
| `genres` | Music genres (Hip-Hop, House, etc.) | ~50 |
| `artists` | Music artists | ~500+ |
| `videos` | DJ videos library | ~29,000+ |
| `playlists` | User-created video collections | Dynamic |
| `playlist_videos` | Videos in each playlist | Dynamic |
| `downloads` | Track which videos users downloaded | Dynamic |
| `favorites` | Users' liked videos | Dynamic |
| `subscriptions` | Subscription plans (Phase 2) | Dynamic |

---

## Troubleshooting

### Can't connect to database
**Problem:** `ECONNREFUSED` or timeout
**Solution:**
1. Check DATABASE_URL is correct (copy from Supabase)
2. Verify password doesn't have special characters (URL encode if needed)
3. Check IP allowlist: Supabase → Settings → Network → IP Whitelist
   - For Railway: Add `0.0.0.0/0` (allows any IP) or Railway's IP
   - For local: Already allowed
4. Try connecting with `psql` to debug

### Foreign Key Errors
**Problem:** Error creating tables with REFERENCES
**Solution:**
1. Create tables in order (dependencies first)
2. Use the provided SQL (already in correct order)
3. If error persists, drop and recreate: `DROP TABLE IF EXISTS [table_name] CASCADE;`

### Data Not Showing
**Problem:** Tables created but no data
**Solution:**
1. Check you ran the INSERT statements (seed data)
2. Click "genres" and "artists" tables in UI
3. If empty, copy INSERT statements and run separately

---

## Local Development

### Connect Locally
```bash
# Set DATABASE_URL in .env.local
DATABASE_URL=postgres://postgres:[PASSWORD]@db.XXXXX.supabase.co:5432/postgres

# Test connection:
npm run db:test
# or
node -e "require('pg').Pool({connectionString: process.env.DATABASE_URL}).query('SELECT 1', (e) => console.log(e ? 'Error' : 'OK'))"
```

### Seed Database Locally
```bash
npm run db:seed
```

---

## Production Checklist

- [ ] Supabase project created
- [ ] PostgreSQL database configured
- [ ] All tables created successfully
- [ ] Seed data loaded
- [ ] Backups enabled
- [ ] Connection string verified
- [ ] DATABASE_URL set in Railway variables
- [ ] Test query successful
- [ ] IP whitelist configured (if needed)

---

## Next Steps

1. **Backend setup:** See `RAILWAY_SETUP.md`
2. **GitHub secrets:** See `GITHUB_SECRETS_SETUP.md`
3. **Pre-launch checks:** See `LAUNCH_CHECKLIST.md`

---

## Reference URLs

| Resource | URL |
|----------|-----|
| Supabase Dashboard | https://app.supabase.com |
| Supabase Docs | https://supabase.com/docs |
| PostgreSQL Docs | https://www.postgresql.org/docs/ |
| SQL Tutorial | https://www.w3schools.com/sql/ |

---

**Status: Database is the foundation. Complete this before Railway setup.**

**Once done: Backend can connect and run queries. 🚀**
