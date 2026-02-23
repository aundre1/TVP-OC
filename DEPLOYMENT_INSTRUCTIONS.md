# The Video Pool - Complete Deployment Instructions

**Version:** 1.0
**Created:** February 23, 2026
**Deadline:** February 28, 2026 (5 days)
**Owner:** Aundre Oldacre
**Status:** EXECUTION IN PROGRESS

---

## Executive Summary

This document guides the complete deployment of The Video Pool from code to live production. All work is autonomous - no external services need to be manually configured beyond providing API keys.

**Timeline:** Feb 23-28, 2026 (6 days)
**Phases:** 9 total
**Estimated Time:** 25-30 hours of work
**Success Criteria:** All tests pass + 0 critical errors after launch

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    THE VIDEO POOL DEPLOYMENT                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend (Vercel)           Backend (Railway)                  │
│  ├─ React + TypeScript       ├─ Node.js + Express             │
│  ├─ 30K video virtualization ├─ PostgreSQL driver             │
│  ├─ Responsive grid (1-5)    ├─ Genre/video endpoints         │
│  ├─ Dark/light theme         ├─ Health check endpoint         │
│  ├─ Search + filter          ├─ CORS enabled                  │
│  └─ Playlist management      └─ Rate limiting                 │
│         ↕                              ↕                       │
│         └──────────────────────────────┘                       │
│                    Supabase (Database)                          │
│                    ├─ PostgreSQL                               │
│                    ├─ 6 tables (videos, users, etc)           │
│                    ├─ 30,000+ videos                          │
│                    └─ Full-text search indexes                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before starting, ensure you have:

- GitHub account with access to `aundre1/video-pool` repository
- Vercel account (for frontend)
- Railway account (for backend)
- Supabase account (for database)
- Terminal access to run commands
- This document bookmarked for reference

**All accounts are free tiers** (no payment required for launch)

---

## Phase 1: Supabase Database Setup (2-3 hours)

### What Gets Done
- Create Supabase project
- Run database migrations (create 6 tables)
- Load seed data (30K+ videos)
- Create storage buckets
- Generate connection string
- Verify connectivity

### Step 1.1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New project"**
3. Fill in:
   - **Name:** `The Video Pool`
   - **Database password:** Generate strong password, save it
   - **Region:** Choose nearest to you (e.g., US East)
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning
6. You'll see the project dashboard

### Step 1.2: Run Database Migrations

Once project is ready:

1. Click **"SQL Editor"** in left sidebar
2. Click **"New Query"** button
3. Open this file: `/Users/dremacmini/Desktop/OC/video-pool/SUPABASE_MIGRATION.sql`
4. Copy entire contents (Cmd+A, Cmd+C)
5. Paste into SQL Editor (Cmd+V)
6. Click blue **"Run"** button
7. Wait for success message:
   ```
   Success: Query executed in XXX ms
   ```

If you get "Schema already exists" error:
- Delete the first line: `CREATE SCHEMA the_video_pool;`
- Run again

### Step 1.3: Verify Tables Created

1. Click **"Table Editor"** in left sidebar
2. You should see dropdown showing `the_video_pool` schema
3. Click on it if not already selected
4. Verify all 6 tables appear:
   - ✅ `videos`
   - ✅ `user_profiles`
   - ✅ `favorites`
   - ✅ `downloads`
   - ✅ `playlists`
   - ✅ `playlist_videos`

If tables not visible, click refresh icon (↻) next to schema dropdown.

### Step 1.4: Load Sample Data (Optional but Recommended)

1. Go back to **SQL Editor**
2. Click **"New Query"**
3. Open: `/Users/dremacmini/Desktop/OC/video-pool/SUPABASE_SEED_DATA.sql`
4. Copy and paste into editor
5. Click **"Run"**
6. Wait for success

This loads 15 sample videos + test users for quick validation.

### Step 1.5: Get Database Connection String

1. Click **"Settings"** in left sidebar
2. Click **"Database"** under Configuration
3. Scroll to **"Connection string"**
4. Click **"URI"** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres.PROJECT_ID:[PASSWORD]@db.PROJECT_ID.supabase.co:5432/postgres
   ```

**Important:** You need to modify this for Railway:
- Original: `postgresql://...postgres`
- For Railway: `postgresql://...postgres?schema=the_video_pool`

6. **Save this connection string securely** (you'll need it for Railway)

### Step 1.6: Test Database Connection (Local)

From terminal, test the connection:

```bash
# Replace with your actual connection string
psql "postgresql://postgres.abc123:[PASSWORD]@db.abc123.supabase.co:5432/postgres?schema=the_video_pool" -c "SELECT COUNT(*) as video_count FROM videos;"
```

Expected output:
```
 video_count
─────────────
          15
```

(or 0 if you skipped seed data)

### Step 1.7: Verify Schema

In SQL Editor, run:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'the_video_pool'
ORDER BY table_name;
```

Expected output shows all 6 tables.

---

## Phase 2: Railway Backend Deployment (3-4 hours)

### What Gets Done
- Create Railway project
- Connect GitHub repository
- Configure environment variables
- Deploy backend API server
- Verify API endpoints work
- Get Railway backend URL

### Step 2.1: Create Railway Project

1. Go to https://railway.app/dashboard
2. Click **"+ New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authenticate with GitHub if prompted
5. Search for and select: `aundre1/video-pool`
6. Choose branch: **`main`**
7. Click **"Deploy"**

Railway will start building automatically.

### Step 2.2: Set Environment Variables

While building, set up environment variables:

1. In Railway dashboard, click on your project
2. Click **"Variables"** tab
3. Switch to **"Raw Editor"** (easier than GUI)
4. Paste this JSON (replace placeholders):

```json
{
  "NODE_ENV": "production",
  "PORT": "3000",
  "API_URL": "https://your-railway-project.up.railway.app",
  "DATABASE_URL": "postgresql://postgres.PROJECT_ID:[PASSWORD]@db.PROJECT_ID.supabase.co:5432/postgres?schema=the_video_pool",
  "CORS_ORIGINS": "http://localhost:3001,https://tvp-oc.vercel.app,https://thevideopool.com",
  "JWT_SECRET": "generate-with-openssl-rand-hex-32",
  "REFRESH_TOKEN_SECRET": "generate-different-openssl-rand-hex-32",
  "SESSION_SECRET": "another-openssl-rand-hex-32",
  "FROM_EMAIL": "noreply@thevideopool.com",
  "FROM_NAME": "The Video Pool",
  "LOG_LEVEL": "info",
  "SECURE_COOKIES": "true",
  "ENABLE_RATE_LIMIT": "true",
  "RATE_LIMIT_WINDOW_MS": "900000",
  "RATE_LIMIT_MAX_REQUESTS": "100",
  "ENABLE_CSRF_PROTECTION": "true"
}
```

**To generate secrets:**

```bash
openssl rand -hex 32  # Run 3 times for 3 different secrets
```

5. Click **"Update Variables"**
6. Railway will redeploy automatically

### Step 2.3: Get Your Railway URL

Once deployment completes (watch the logs):

1. In Railway dashboard, click your project
2. Click the "Backend" service
3. Click **"Settings"** tab
4. Look for **"Public URL"** - copy it
   - Format: `https://your-project-name-xxxx.up.railway.app`

**Save this URL** - you'll need it for frontend.

### Step 2.4: Wait for Build to Complete

Watch the **Logs** tab for build progress:

```
✓ Checked out
✓ Dependency cache updated
✓ Dependencies installed
✓ Build completed
✓ Application started
```

Once you see "Application started", move to next step.

### Step 2.5: Test Backend Health

Once deployed, test the health endpoint:

```bash
# Replace with your Railway URL
curl https://your-railway-url/api/health

# Expected response:
{"status":"ok","database":"connected","uptime":123}
```

If you get a response, your backend is working!

### Step 2.6: Test Video Endpoint

```bash
curl https://your-railway-url/api/videos?limit=5

# Expected response:
[
  {"id":"uuid","title":"Video Title","artist":"Artist","genre":"House",...},
  ...
]
```

If both endpoints work, **Phase 2 is complete**.

---

## Phase 3: Vercel Frontend Deployment (2-3 hours)

### What Gets Done
- Connect Vercel to GitHub repository
- Configure build settings
- Set environment variables
- Deploy frontend static site
- Get Vercel URL
- Test loading

### Step 3.1: Connect to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Paste GitHub URL: `https://github.com/aundre1/video-pool`
4. Or search for `aundre1/video-pool`
5. Click **"Import"**

### Step 3.2: Configure Build Settings

Vercel will auto-detect Vite settings. Verify:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm ci`

If not set, configure manually:

1. Click **"Project Settings"**
2. Click **"Build & Deployment"**
3. Set as above
4. Click **"Save"**

### Step 3.3: Set Environment Variables

1. Go to **Project Settings**
2. Click **"Environment Variables"**
3. Add these variables:

```
VITE_API_URL = https://your-railway-url
VITE_RECAPTCHA_SITE_KEY = (can be placeholder for now)
VITE_GOOGLE_CLIENT_ID = (can be placeholder for now)
VITE_ENV = production
```

The first one is critical - others can be placeholders.

4. Click **"Save and Deploy"**

### Step 3.4: Wait for Build

Watch the **Deployments** tab:

```
✓ Building
✓ Installing dependencies
✓ Building project
✓ Finalizing deployment
✓ Ready for preview
```

Build takes 2-3 minutes.

### Step 3.5: Get Your Vercel URL

Once deployed:

1. Click the **Preview** button (blue button at top)
2. Or look for **"Production"** domain
   - Format: `https://tvp-oc.vercel.app` (or your custom domain)

**Save this URL** - this is your live frontend!

### Step 3.6: Test Frontend Loading

```bash
curl -I https://your-vercel-url

# Expected response:
HTTP/2 200
```

Then open in browser - should see The Video Pool homepage.

---

## Phase 4: GitHub Secrets Configuration (1 hour)

### What Gets Done
- Add deployment tokens to GitHub
- Enable CI/CD workflows
- Test that workflows trigger on push

### Step 4.1: Get GitHub Token

This allows automated deployments.

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Fill in:
   - **Note:** "Deployment Token"
   - **Expiration:** 90 days
   - **Scopes:** Select `repo`, `workflow`
4. Click **"Generate token"**
5. Copy the token (you'll only see it once)

### Step 4.2: Get Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click **"Create"**
3. Name: "GitHub Actions"
4. Copy the token

### Step 4.3: Get Railway Token

1. Go to https://railway.app/account/tokens
2. Click **"Create Token"**
3. Give it a name: "GitHub Actions"
4. Copy the token

### Step 4.4: Add Secrets to GitHub

1. Go to https://github.com/aundre1/video-pool/settings/secrets/actions
2. Click **"New repository secret"** for each:

```
Name: GITHUB_TOKEN
Value: (your GitHub token)

Name: VERCEL_TOKEN
Value: (your Vercel token)

Name: RAILWAY_TOKEN
Value: (your Railway token)
```

3. Click **"Add secret"** for each one

### Step 4.5: Verify Secrets are Set

You should see all 3 secrets listed (shown as masked).

---

## Phase 5: Integration Testing (3-4 hours)

### What Gets Done
- Test frontend loads
- Test backend API responds
- Test database connectivity
- Test end-to-end workflows

### Test 5.1: Frontend Loads

```bash
curl -I https://your-vercel-url/
# Expected: HTTP 200
```

Then visit in browser:
- Page should load
- No console errors (F12 → Console)
- Navigation works

### Test 5.2: Backend Health

```bash
curl https://your-railway-url/api/health
# Expected: {"status":"ok",...}
```

### Test 5.3: API Endpoints

```bash
# Get videos
curl https://your-railway-url/api/videos?limit=10

# Get genres
curl https://your-railway-url/api/genres

# Search
curl https://your-railway-url/api/videos/search?q=house
```

All should return valid JSON.

### Test 5.4: Database Connectivity

From your Railway logs, search for:
```
Database connection established
```

If you see this, database is working.

### Test 5.5: CORS Test

Make API call from frontend (in browser console):

```javascript
fetch('https://your-railway-url/api/videos?limit=5')
  .then(r => r.json())
  .then(d => console.log('Success!', d.length, 'videos'))
  .catch(e => console.error('Failed:', e.message))
```

Should log "Success! X videos"

### Test 5.6: Mobile Responsiveness

- Open frontend on phone
- Test portrait and landscape
- Touch interactions work
- No console errors

---

## Phase 6: Performance Testing (2-3 hours)

### What Gets Done
- Test response times
- Test under load
- Test virtualization (30K videos)
- Measure Core Web Vitals

### Test 6.1: Frontend Performance

```bash
# Time to first byte
time curl -I https://your-vercel-url/

# Should be < 500ms
```

### Test 6.2: API Response Times

```bash
# Time API response
time curl https://your-railway-url/api/videos?limit=50

# Should be < 1000ms
```

### Test 6.3: Load Testing (10 concurrent requests)

```bash
# Using Apache Bench (if installed)
ab -n 100 -c 10 https://your-vercel-url/

# Should see: Requests per second > 10
# Failed requests: 0
```

### Test 6.4: Core Web Vitals

1. Open https://your-vercel-url in Chrome
2. Press F12 → Lighthouse tab
3. Click "Analyze page load"
4. Look for:
   - **LCP (Largest Contentful Paint):** < 2.5s
   - **FID (First Input Delay):** < 100ms
   - **CLS (Cumulative Layout Shift):** < 0.1

All should be green.

---

## Phase 7: Security Audit (2-3 hours)

### What Gets Done
- Verify no secrets exposed
- Check CORS configuration
- Verify HTTPS enforced
- Test authentication

### Test 7.1: Check for Exposed Secrets

```bash
# Clone repo and search
cd /Users/dremacmini/Desktop/OC/video-pool
grep -r "password\|secret\|key" --include="*.ts" --include="*.tsx" --include="*.js" src/ tvp-export/client/ tvp-export/server/ | grep -v node_modules | grep -v ".env"

# Should find NONE
```

### Test 7.2: Verify HTTPS

```bash
# Should redirect HTTP → HTTPS
curl -I http://your-vercel-url/
# Should see: HTTP/1.1 308 (redirect)

curl -I https://your-vercel-url/
# Should see: HTTP/2 200
```

### Test 7.3: Check CORS Configuration

Backend should only accept requests from frontend URL:

```bash
# From browser console on your-vercel-url:
fetch('https://your-railway-url/api/videos', {
  headers: {'Origin': 'https://attacker.com'}
})
# Should fail with CORS error
```

### Test 7.4: Verify Rate Limiting

Make 200 requests rapidly:

```bash
for i in {1..200}; do
  curl https://your-railway-url/api/videos &
done
wait

# After 100 requests, subsequent ones should return 429 (Too Many Requests)
```

---

## Phase 8: Pre-Launch Checklist (2-3 hours)

### Database Verification
- [ ] Supabase project created
- [ ] All 6 tables exist
- [ ] Indexes created
- [ ] Connection string works
- [ ] Sample data loaded

### Backend Verification
- [ ] Railway project created
- [ ] All environment variables set
- [ ] Build completes with 0 errors
- [ ] Health endpoint returns 200
- [ ] All API endpoints tested
- [ ] Database connectivity confirmed
- [ ] Logs show no errors

### Frontend Verification
- [ ] Vercel project created
- [ ] Build completes with 0 errors
- [ ] Pages load without errors
- [ ] Responsive on mobile
- [ ] Dark/light mode works
- [ ] Search functionality works
- [ ] Navigation works
- [ ] No console errors

### Integration Verification
- [ ] Frontend ↔ Backend communication works
- [ ] CORS configured correctly
- [ ] Database queries from backend work
- [ ] All HTTP methods (GET, POST, etc.) work
- [ ] Error handling works

### Performance Verification
- [ ] Frontend loads in < 3 seconds
- [ ] API responds in < 1 second
- [ ] 30K video virtualization smooth
- [ ] Core Web Vitals green
- [ ] Mobile performance acceptable

### Security Verification
- [ ] No secrets in code
- [ ] HTTPS enforced
- [ ] CORS restricted to frontend
- [ ] Rate limiting enabled
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS protection enabled

---

## Phase 9: Launch & Monitoring (Ongoing)

### Launch Day (Feb 28)

1. **30 minutes before launch:**
   - Do final health checks
   - Verify all systems green
   - Open communication channels

2. **At launch time:**
   - Send email to subscribers
   - Post to social media
   - Update status page

3. **First hour (critical):**
   - Monitor logs every 5 minutes
   - Watch error rates
   - Check response times
   - Be ready to rollback

4. **Hours 2-6:**
   - Monitor every 15 minutes
   - Watch for user feedback
   - Respond to any issues
   - Celebrate!

### Monitoring Checklist

```
Every 5 minutes (first hour):
- [ ] Frontend loads
- [ ] API health OK
- [ ] Errors < 0.1%
- [ ] Response times < 1s
- [ ] No database connection errors

Every 15 minutes (next 5 hours):
- [ ] Error rate stable
- [ ] Performance stable
- [ ] User count increasing
- [ ] No critical issues reported

After 6 hours:
- [ ] All systems stable
- [ ] User feedback positive
- [ ] Ready for handoff to operations
```

### Rollback Procedure (if needed)

If something breaks critically:

1. **Vercel rollback:**
   - Go to Deployments → Select previous
   - Click "Rollback"

2. **Railway rollback:**
   - Go to Deployments → Select previous
   - Click "Redeploy"

3. **Communicate:**
   - Update status page
   - Send message to team
   - Fix issue
   - Redeploy

---

## Troubleshooting

### Database Connection Fails

**Error:** `ECONNREFUSED` or `Connection timeout`

**Solution:**
1. Verify Supabase project is running
2. Check DATABASE_URL is correct
3. Verify password is correct
4. Check firewall isn't blocking (Supabase allows all by default)
5. Test locally: `psql $DATABASE_URL -c "SELECT 1"`

### Frontend Won't Build

**Error:** `npm ERR!` or `Build failed`

**Solution:**
1. Check Node version: `node -v` (should be 18+)
2. Clear cache: `rm -rf node_modules && npm ci`
3. Check for TypeScript errors: `npm run check`
4. Review build output for specific error

### API Returns 404

**Error:** `GET /api/videos → 404`

**Solution:**
1. Verify backend is running: `curl https://your-railway-url/api/health`
2. Check CORS_ORIGINS includes frontend URL
3. Verify API_URL in frontend matches Railway URL
4. Check backend routes are registered

### CORS Error

**Error:** `No 'Access-Control-Allow-Origin' header`

**Solution:**
1. Add frontend URL to CORS_ORIGINS in Railway
2. Redeploy backend
3. Wait 30 seconds for changes to apply
4. Retry from browser

### Video Virtualization is Slow

**Error:** Scrolling is janky, freezes when loading

**Solution:**
1. Check you're using react-window (already in code)
2. Verify items-per-row < 5
3. Profile in Chrome DevTools
4. Reduce thumbnail quality if needed

---

## Key URLs for Reference

| Service | URL | Purpose |
|---------|-----|---------|
| GitHub | https://github.com/aundre1/video-pool | Code repository |
| Supabase | https://supabase.com/dashboard | Database |
| Railway | https://railway.app/dashboard | Backend hosting |
| Vercel | https://vercel.com/dashboard | Frontend hosting |
| Frontend | https://tvp-oc.vercel.app | Live site (when deployed) |

---

## Commands Reference

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM videos;"

# Generate JWT secrets
openssl rand -hex 32

# Test backend
curl https://your-railway-url/api/health
curl https://your-railway-url/api/videos?limit=5

# Test frontend
curl -I https://your-vercel-url/

# View backend logs
# (In Railway dashboard → Logs tab)

# View frontend logs
# (In Vercel dashboard → Logs tab)
```

---

## Success Criteria

When complete, you'll have:

✅ **Working frontend** - Loads in <3s, responsive, searches work
✅ **Working backend** - API endpoints respond in <1s
✅ **Working database** - 30K+ videos available
✅ **Zero critical errors** - First 24 hours
✅ **100% uptime** - First 24 hours
✅ **Users can** - Search, browse, view details

---

## Support Contacts

If you hit issues:

1. **For code issues:** Review logs in Vercel/Railway dashboards
2. **For database issues:** Check Supabase SQL Editor
3. **For deployment issues:** Review this document's troubleshooting section
4. **For urgent help:** Check the TROUBLESHOOTING.md file

---

## Final Notes

- **This deployment is REVERSIBLE** - you can rollback at any time
- **No real money needed** - all free tiers
- **You have 5 days** - plenty of time if issues arise
- **Celebrate after Phase 6** - deployment is essentially done
- **Phases 7-8 are refinement** - not blocking launch
- **Phase 9 is monitoring** - just watch and respond

---

**Document Version:** 1.0
**Last Updated:** February 23, 2026
**Created by:** Aundre Oldacre (autonomous deployment)
**Status:** ACTIVE DEPLOYMENT IN PROGRESS

---

**Next Step:** Execute Phase 1 (Supabase) following the detailed instructions above.

