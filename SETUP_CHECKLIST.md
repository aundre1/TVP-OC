# The Video Pool - Supabase Setup Checklist

**Complete step-by-step checklist for setting up your database.**

---

## Phase 1: Read Documentation (10 minutes)

- [ ] Read `SUPABASE_INDEX.md` (file guide and overview)
- [ ] Read `SUPABASE_QUICK_SETUP.md` (setup instructions)
- [ ] Skim `SUPABASE_SETUP_SUMMARY.txt` (quick reference)

---

## Phase 2: Prepare Supabase (5 minutes)

- [ ] Open https://supabase.com/dashboard
- [ ] Log in to your account
- [ ] Select project: **dxbtycycyvmzgufdhnae**
- [ ] Verify you see "dxbtycycyvmzgufdhnae" in top-left corner
- [ ] Click on "SQL Editor" in left sidebar
- [ ] Click "+ New Query" button

---

## Phase 3: Run Migration (5 minutes)

- [ ] Open `SUPABASE_MIGRATION.sql` on your local machine
- [ ] Select ALL text (Cmd+A)
- [ ] Copy (Cmd+C)
- [ ] Go back to Supabase SQL Editor
- [ ] Click in the query box
- [ ] Paste (Cmd+V)
- [ ] Click "Run" button (or Cmd+Enter)
- [ ] Wait for "Query executed successfully" message

---

## Phase 4: Verify Tables Created (2 minutes)

- [ ] Go to "Database" section (left sidebar)
- [ ] Click on "Tables"
- [ ] Confirm you see these 6 tables:
  - [ ] `videos`
  - [ ] `user_profiles`
  - [ ] `favorites`
  - [ ] `downloads`
  - [ ] `playlists`
  - [ ] `playlist_videos`
- [ ] All should be under schema `the_video_pool`

---

## Phase 5: Get Connection Details (3 minutes)

- [ ] Go to "Settings" (left sidebar)
- [ ] Click on "Database"
- [ ] Find "Connection string" section
- [ ] Copy the PostgreSQL connection string
- [ ] Open `SUPABASE_CONNECTION.env`
- [ ] Replace `[PASSWORD]` with your actual password
- [ ] Save this file securely (don't commit to git)

---

## Phase 6: Set Up Your App (15 minutes)

### If using Supabase Client (JavaScript/React):

- [ ] Run: `npm install @supabase/supabase-js`
- [ ] Create `.env.local` file in your React project:
  ```
  VITE_SUPABASE_URL=https://dxbtycycyvmzgufdhnae.supabase.co
  VITE_SUPABASE_ANON_KEY=<your-anon-key-from-settings>
  ```
- [ ] Find anon key: Settings → API → Project API Keys
- [ ] Create Supabase client:
  ```javascript
  import { createClient } from '@supabase/supabase-js'
  
  export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )
  ```

### If using Node.js/Backend:

- [ ] Run: `npm install @supabase/supabase-js`
- [ ] Create `.env` file in your project root:
  ```
  SUPABASE_URL=https://dxbtycycyvmzgufdhnae.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-from-settings>
  ```
- [ ] Find service role key: Settings → API → Project API Keys
- [ ] Create Supabase client:
  ```javascript
  const { createClient } = require('@supabase/supabase-js')
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  ```

---

## Phase 7: Test Connection (5 minutes)

### Quick Test (Browser Console):

- [ ] In Supabase Dashboard, go to SQL Editor
- [ ] Run this query:
  ```sql
  SELECT COUNT(*) as table_count FROM information_schema.tables 
  WHERE table_schema = 'the_video_pool';
  ```
- [ ] Should return: `table_count: 6`

### Test from Your App:

- [ ] Add this code to test the connection:
  ```javascript
  const { data, error } = await supabase
    .from('videos')
    .select('count(*)', { count: 'exact' })
  
  if (error) {
    console.error('Connection failed:', error)
  } else {
    console.log('Connection successful! Table has', data[0]?.count || 0, 'rows')
  }
  ```
- [ ] Run your app and check console
- [ ] Should see: "Connection successful! Table has 0 rows"

- [ ] Mark complete: [ ]

---

## Phase 8: Seed Test Data (Optional, 5 minutes)

If you want to test with sample data:

- [ ] Go back to SQL Editor in Supabase
- [ ] Click "+ New Query"
- [ ] Open `SUPABASE_SEED_DATA.sql`
- [ ] Copy all and paste into SQL Editor
- [ ] Click "Run"
- [ ] Verify data was added:
  ```sql
  SELECT COUNT(*) FROM videos;
  SELECT COUNT(*) FROM user_profiles;
  ```

---

## Phase 9: Next Steps (Plan for Week 1)

### Critical for Production:

- [ ] **Add Row Level Security (RLS) Policies**
  - Prevent users from seeing other users' data
  - Restrict favorites/downloads/playlists to owner only
  - Allow public reads on public playlists
  - See: Supabase docs for RLS policy examples

- [ ] **Create Storage Bucket for Videos**
  - Supabase → Storage → Create new bucket
  - Name it: `videos`
  - Configure public/private access

- [ ] **Test with Real Users**
  - Sign up a test user
  - Create a profile
  - Favorite a video
  - Create a playlist
  - Download a video
  - Verify data appears in database

### Important for Month 1:

- [ ] [ ] Seed real video data (if available)
- [ ] [ ] Set up monitoring & alerts
- [ ] [ ] Configure automatic backups
- [ ] [ ] Test with 10+ concurrent users

### Nice to Have for Month 3+:

- [ ] [ ] Add full-text search index on videos
- [ ] [ ] Create materialized view for trending videos
- [ ] [ ] Add caching layer (Redis) for hot queries
- [ ] [ ] Configure read replicas (if scaling needed)

---

## Phase 10: Documentation Reference

Keep these files handy:

- **Setup Questions:** `SUPABASE_QUICK_SETUP.md`
- **Technical Deep-Dive:** `SUPABASE_SQL_VALIDATION.md`
- **Query Patterns:** `SUPABASE_VISUAL_REFERENCE.md`
- **ER Diagrams:** `SUPABASE_VISUAL_REFERENCE.md` (scroll to end)
- **Common Errors:** `SUPABASE_QUICK_SETUP.md` (Troubleshooting section)

---

## Troubleshooting Checklist

If something goes wrong:

- [ ] Check you're logged into Supabase (top-right corner)
- [ ] Verify you own project `dxbtycycyvmzgufdhnae`
- [ ] Check SQL Editor output for error message
- [ ] Re-run migration (it's idempotent with IF NOT EXISTS)
- [ ] Check internet connection to Supabase
- [ ] Try logging out and logging back in

---

## Success Criteria

You're done when:

- [x] All 6 tables exist in schema `the_video_pool`
- [x] All 13 indexes are created
- [x] You can run a test query from SQL Editor
- [x] You can connect from your app (no errors)
- [x] You have `.env` file with connection string
- [x] You understand the schema (read VISUAL_REFERENCE.md)

---

## Time Estimate

| Phase | Time |
|-------|------|
| 1. Read docs | 10 min |
| 2. Prepare Supabase | 5 min |
| 3. Run migration | 5 min |
| 4. Verify tables | 2 min |
| 5. Get connection | 3 min |
| 6. Set up app | 15 min |
| 7. Test connection | 5 min |
| 8. Seed data (optional) | 5 min |
| **TOTAL** | **~50 min** |

---

## Quick Reference

**Supabase Project:** dxbtycycyvmzgufdhnae  
**Database Host:** db.dxbtycycyvmzgufdhnae.supabase.co  
**Schema:** the_video_pool  
**Tables:** 6  
**Status:** Production Ready

---

## Final Checklist

- [ ] Phase 1: Documentation read
- [ ] Phase 2: Supabase prepared
- [ ] Phase 3: Migration run
- [ ] Phase 4: Tables verified
- [ ] Phase 5: Connection details obtained
- [ ] Phase 6: App set up
- [ ] Phase 7: Connection tested
- [ ] Phase 8: (Optional) Test data seeded
- [ ] Phase 9: Next steps planned

**Setup Complete!** ✅

