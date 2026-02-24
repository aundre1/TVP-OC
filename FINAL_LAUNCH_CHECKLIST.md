# The Video Pool - Final Launch Checklist
**Status:** Production Deployment
**Target Launch:** Friday, February 28, 2026
**Created:** February 22, 2026
**Timeline:** 3-4 days to launch

---

## Executive Summary

This document is the **definitive production deployment checklist** for The Video Pool. It covers:
1. Pre-deployment infrastructure setup (Supabase, Railway, GitHub Secrets)
2. Code verification (build test, health checks, API tests)
3. Deployment pipeline (push to GitHub, auto-deploy verification)
4. Post-launch validation (smoke tests, monitoring)
5. Emergency rollback procedures

Each section includes **exact success criteria** and **estimated timing**.

---

## Section 1: Pre-Deployment Setup (1-1.5 hours)

### 1.1 Supabase Database Setup (20 minutes)

**Location:** https://supabase.com/dashboard

**Steps:**
1. Create or access The Video Pool project
   - [ ] Project created
   - [ ] Project URL noted: `https://XXXXX.supabase.co`

2. Copy database connection string
   ```
   Go to: Project Settings → Database → Connection Pooling
   Copy: Connection string (Postgres URI)
   ```
   - [ ] Connection string copied
   - [ ] Format: `postgres://postgres:PASSWORD@db.XXXXX.supabase.co:5432/postgres`

3. Store in secure location (password manager or 1Password)
   - [ ] DATABASE_URL saved securely

4. Run initial schema migration
   ```bash
   # Will be done via Railway auto-migration on first deploy
   # DATABASE_URL must be set for this to work
   ```
   - [ ] Schema migration tested locally (optional but recommended)

**Success Criteria:**
- Can connect to database from local machine
- `psql $DATABASE_URL -c "SELECT version();"` returns PostgreSQL version

**Timing:** ~20 minutes

---

### 1.2 Railway Backend Deployment Setup (25 minutes)

**Location:** https://railway.app/dashboard

**Steps:**
1. Create Railway project for The Video Pool backend
   - [ ] Project created
   - [ ] Name: "The Video Pool Backend"

2. Set environment variables
   ```bash
   NODE_ENV=production
   PORT=5000
   API_URL=https://your-railway-url.up.railway.app
   CORS_ORIGIN=https://tvp-oc.vercel.app,https://thevideopool.com
   DATABASE_URL=postgres://postgres:PASSWORD@db.XXXXX.supabase.co:5432/postgres
   JWT_SECRET=<generate-new-secret>
   JWT_EXPIRY=24h
   REFRESH_TOKEN_SECRET=<generate-new-secret>
   REFRESH_TOKEN_EXPIRY=30d
   FRONTEND_URL=https://tvp-oc.vercel.app
   LOG_LEVEL=info
   AUTO_MIGRATE=true
   ```

   **Generate JWT secrets:**
   ```bash
   openssl rand -hex 32
   # Output example: a3f8c9d4b2e1f6a5c8d3e2b1f4a6c9d2
   ```
   - [ ] JWT_SECRET generated and saved
   - [ ] REFRESH_TOKEN_SECRET generated and saved

3. Connect GitHub repository
   ```
   Go to: Railway Dashboard → Connect GitHub
   Select: aundre1/TVP-OC
   ```
   - [ ] GitHub repo connected
   - [ ] Branch: main

4. Configure deployment settings
   ```
   Railway → Project → Settings → Deployments
   - Root Directory: tvp-export
   - Build Command: npm run build
   - Start Command: npm run preview
   ```
   - [ ] Root directory set to tvp-export
   - [ ] Build and start commands configured

**Success Criteria:**
- Railway shows "Deployment in progress"
- All environment variables visible in Railway dashboard (redacted for secrets)
- No deployment errors

**Timing:** ~25 minutes (includes initial build)

---

### 1.3 Vercel Frontend Deployment Setup (20 minutes)

**Location:** https://vercel.com/dashboard

**Steps:**
1. Create or access Vercel project
   ```
   Import Project → GitHub → aundre1/TVP-OC
   ```
   - [ ] Project imported
   - [ ] Project name: "the-video-pool"

2. Configure build settings
   ```
   Project Settings → Build & Development Settings

   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
   - [ ] Build command set
   - [ ] Output directory: dist
   - [ ] Framework: Vite

3. Set environment variables
   ```bash
   VITE_API_URL=https://your-railway-url.up.railway.app
   VITE_RECAPTCHA_SITE_KEY=<your-site-key>
   VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
   ```
   - [ ] VITE_API_URL set to Railway backend URL
   - [ ] VITE_RECAPTCHA_SITE_KEY set

4. Configure domains
   ```
   Project Settings → Domains
   Add: thevideopool.com (if purchased)
   Add: www.thevideopool.com (www redirect)
   ```
   - [ ] Primary domain configured
   - [ ] Domain DNS verified

**Success Criteria:**
- Vercel shows "Ready" status
- Environment variables visible in dashboard
- Domain points to Vercel

**Timing:** ~20 minutes

---

### 1.4 GitHub Secrets Configuration (15 minutes)

**Location:** https://github.com/aundre1/TVP-OC/settings/secrets/actions

**Steps:**
1. Create secrets for GitHub Actions
   ```bash
   # Go to: Settings → Secrets and variables → Actions → New repository secret

   # Vercel
   VERCEL_TOKEN=<your-vercel-token>
   VERCEL_PROJECT_ID=<your-project-id>
   VERCEL_ORG_ID=<your-org-id>

   # Railway
   RAILWAY_TOKEN=<your-railway-token>
   ```

2. Get tokens from respective services
   - **Vercel:** Settings → Tokens → Create Token
   - **Railway:** Account Settings → Tokens → Create Token

   - [ ] VERCEL_TOKEN created and stored
   - [ ] RAILWAY_TOKEN created and stored

3. Verify secrets are NOT visible in public
   ```bash
   git log --all --grep="token\|secret" --oneline
   # Should return nothing (no secrets in commit history)
   ```
   - [ ] No secrets in git history

**Success Criteria:**
- All secrets marked as (redacted) in GitHub
- Can trigger deployments via GitHub Actions

**Timing:** ~15 minutes

---

## Section 2: Code Verification (45 minutes - 1 hour)

### 2.1 Local Build Test (15 minutes)

**Terminal:**
```bash
cd /Users/dremacmini/Desktop/OC/video-pool

# Install dependencies (if needed)
npm ci

# Run TypeScript check
npm run build

# Expected output:
# ✓ 245 modules transformed.
# dist/index.html          0.45 kB │ gzip: 0.30 kB
# dist/assets/index.*.js   485.32 kB │ gzip: 156.48 kB
# ✓ built in XXXms
```

**Checklist:**
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors
- [ ] dist/ folder created with HTML + JS/CSS assets
- [ ] Bundle size < 600KB (uncompressed)

**Success Criteria:**
- Build succeeds
- Zero TypeScript errors
- dist/index.html exists
- dist/assets/ has JS and CSS files

**Timing:** ~15 minutes

---

### 2.2 Backend Build Test (10 minutes)

**Terminal:**
```bash
cd /Users/dremacmini/Desktop/OC/video-pool/tvp-export

# Install dependencies
npm ci

# Build backend
npm run build

# Expected output:
# tsc ✓
# Backend compiled successfully
```

**Checklist:**
- [ ] TypeScript compiles without errors
- [ ] server/dist/ folder created

**Success Criteria:**
- Zero TypeScript compilation errors
- dist/ folder created

**Timing:** ~10 minutes

---

### 2.3 Health Check API Test (10 minutes)

**Terminal:**
```bash
# Start backend locally (if testing locally)
cd /Users/dremacmini/Desktop/OC/video-pool/tvp-export
npm run preview &

# Wait for startup (3-5 seconds)
sleep 5

# Test health endpoint
curl -X GET http://localhost:5000/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-02-22T...","version":"6.0.0"}
```

**Check for:**
- [ ] HTTP 200 status code
- [ ] Response includes "status": "ok"
- [ ] Timestamp is current

**Alternative - Test in Production (once deployed):**
```bash
curl -X GET https://your-railway-url.up.railway.app/api/health
```

**Success Criteria:**
- Returns HTTP 200
- Response body is valid JSON with "status": "ok"

**Timing:** ~10 minutes

---

### 2.4 CORS & API Integration Test (10 minutes)

**What to test:**
- Frontend can reach backend
- No CORS errors
- API calls work end-to-end

**Test Steps:**
1. Start frontend locally
   ```bash
   npm run dev
   # Opens http://localhost:3001
   ```

2. Open browser console (DevTools → Console)

3. Test API call
   ```javascript
   // In browser console:
   fetch('http://localhost:5000/api/health')
     .then(r => r.json())
     .then(d => console.log(d))
   ```

4. Check for:
   - [ ] No CORS errors in console
   - [ ] Response logged successfully

**Success Criteria:**
- No CORS errors
- API response received in browser
- Status is "ok"

**Timing:** ~10 minutes

---

## Section 3: Deployment Pipeline (30-45 minutes)

### 3.1 Push Code to GitHub (5 minutes)

**Terminal:**
```bash
cd /Users/dremacmini/Desktop/OC/video-pool

# Check status
git status

# Stage all changes (verify first!)
git add .

# Commit with meaningful message
git commit -m "Deploy: Final launch configuration

- Setup Supabase database connection
- Configure Railway backend environment
- Setup Vercel frontend deployment
- Add GitHub Actions secrets
- Verified build and API health

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Push to main
git push origin main

# Expected output:
# Enumerating objects: X, done.
# Writing objects: 100% (X/X), Xmb
# To github.com:aundre1/TVP-OC.git
#    abc1234..def5678  main -> main
```

**Checklist:**
- [ ] `git status` shows clean working directory
- [ ] Commit message is descriptive
- [ ] Push succeeds without errors
- [ ] No authentication errors

**Success Criteria:**
- GitHub shows new commit
- No merge conflicts

**Timing:** ~5 minutes

---

### 3.2 Verify GitHub Actions Triggered (10 minutes)

**Location:** https://github.com/aundre1/TVP-OC/actions

**Steps:**
1. Go to Actions tab
2. Look for workflow that triggered on your push
   ```
   Should see:
   - "Deploy: Final launch configuration" (commit message)
   - Status: "In Progress" → "Completed"
   - Yellow circle → Green checkmark
   ```

3. Click workflow to see details
   - [ ] Vercel deployment step (green checkmark)
   - [ ] Railway deployment step (green checkmark)

**Success Criteria:**
- Workflow completed successfully
- Both Vercel and Railway show green checkmarks
- No failed steps

**Timing:** ~10 minutes (includes waiting for CI to complete)

---

### 3.3 Verify Vercel Deployment (10 minutes)

**Location:** https://vercel.com/dashboard

**Steps:**
1. Go to your project dashboard
2. Look for recent deployment
   ```
   Should show:
   - Branch: main
   - Status: Ready (blue checkmark)
   - Domain: thevideopool.com or tvp-oc.vercel.app
   - Time: "Deployed X minutes ago"
   ```

3. Click deployment to see details
   - [ ] Build succeeded
   - [ ] All environment variables passed
   - [ ] No errors in build logs

4. Test URL
   ```bash
   curl -s https://tvp-oc.vercel.app | head -20
   # Should return HTML starting with <!DOCTYPE html>
   ```

**Success Criteria:**
- Deployment shows "Ready"
- Build succeeded with no errors
- Can access site via URL

**Timing:** ~10 minutes

---

### 3.4 Verify Railway Deployment (10 minutes)

**Location:** https://railway.app/dashboard

**Steps:**
1. Go to your backend project
2. Look for recent deployment
   ```
   Should show:
   - Status: Success (green checkmark)
   - "Deployment completed X minutes ago"
   ```

3. Check logs
   ```
   Click: Deployments → View Logs
   Should see:
   - "npm install" completed
   - "npm run build" completed
   - "npm run preview" started
   - "Server running on port 5000"
   ```

4. Test backend URL
   ```bash
   RAILWAY_URL="https://your-railway-url.up.railway.app"
   curl -X GET $RAILWAY_URL/api/health
   # Should return: {"status":"ok",...}
   ```

**Success Criteria:**
- Deployment shows green checkmark
- Logs show no errors
- Health endpoint responds with 200 OK

**Timing:** ~10 minutes

---

## Section 4: Post-Launch Smoke Tests (1-2 hours)

### 4.1 Frontend Accessibility Test (15 minutes)

**Test via:** https://tvp-oc.vercel.app (or your domain)

**Steps:**
1. Open site in browser
2. Check homepage loads
   - [ ] Logo visible
   - [ ] Navigation menu visible
   - [ ] No 404 errors in console
   - [ ] No CORS errors

3. Click through main pages
   - [ ] Home page loads
   - [ ] Search page loads
   - [ ] Library page loads (if auth required, this will fail - that's OK for MVP)
   - [ ] Settings page loads

4. Check theme toggle
   - [ ] Dark mode toggle works
   - [ ] Styles apply correctly

**Success Criteria:**
- No JavaScript errors in console
- All main pages load
- UI is responsive

**Timing:** ~15 minutes

---

### 4.2 API Integration Test (20 minutes)

**Terminal:**
```bash
BACKEND_URL="https://your-railway-url.up.railway.app"

# Test 1: Health check
echo "=== Health Check ==="
curl -X GET $BACKEND_URL/api/health

# Expected: {"status":"ok",...}

# Test 2: Get genres
echo "=== Get Genres ==="
curl -X GET $BACKEND_URL/api/genres

# Expected: Array of genre objects

# Test 3: Get videos
echo "=== Get Videos (first 10) ==="
curl -X GET "$BACKEND_URL/api/videos?limit=10"

# Expected: Array of video objects with id, title, url, etc.

# Test 4: Search videos
echo "=== Search ==="
curl -X GET "$BACKEND_URL/api/videos/search?q=dance&limit=5"

# Expected: Array of matching videos
```

**Checklist:**
- [ ] /api/health returns 200
- [ ] /api/genres returns valid JSON array
- [ ] /api/videos returns valid JSON array with >0 items
- [ ] /api/videos/search returns results

**Success Criteria:**
- All endpoints return HTTP 200
- All responses are valid JSON
- Video data includes expected fields

**Timing:** ~20 minutes

---

### 4.3 Performance Check (15 minutes)

**Metrics to check:**
1. Frontend load time
   ```bash
   curl -o /dev/null -s -w "%{time_total}\n" https://tvp-oc.vercel.app
   # Should be < 3 seconds
   ```

2. Backend response time
   ```bash
   time curl -s $BACKEND_URL/api/videos | head
   # Should be < 1 second
   ```

3. Check Vercel Analytics (if enabled)
   - [ ] Core Web Vitals: Green
   - [ ] Load time: < 3 seconds

**Success Criteria:**
- Frontend loads in < 3 seconds
- API responds in < 1 second
- No performance warnings

**Timing:** ~15 minutes

---

### 4.4 Database Connectivity Test (10 minutes)

**Steps:**
1. Verify migrations ran
   - [ ] Check Railway logs for "AUTO_MIGRATE=true" and migration completion

2. Query database to verify schema
   ```bash
   # From Railway dashboard:
   # Query Editor → Run:
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';

   # Should show tables like: videos, genres, users, etc.
   ```

3. Check data population
   ```bash
   # Query Editor:
   SELECT COUNT(*) as video_count FROM videos;

   # Should show > 0 if seed data was loaded
   ```

**Success Criteria:**
- Schema tables exist
- No connection errors
- Database contains expected data

**Timing:** ~10 minutes

---

### 4.5 Security & Configuration Test (10 minutes)

**Steps:**
1. Verify CORS is configured correctly
   ```bash
   # Test request from frontend domain
   curl -X OPTIONS https://your-railway-url.up.railway.app/api/health \
     -H "Origin: https://tvp-oc.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -v

   # Should see:
   # access-control-allow-origin: https://tvp-oc.vercel.app
   ```

2. Verify no secrets in frontend code
   ```bash
   # Check that sensitive vars are not in dist/
   grep -r "JWT_SECRET\|DATABASE_URL" dist/
   # Should return nothing
   ```

3. Verify environment variables applied
   - [ ] Check Vercel env vars are set
   - [ ] Check Railway env vars are set

**Success Criteria:**
- CORS headers present and correct
- No secrets in frontend bundle
- All env vars configured

**Timing:** ~10 minutes

---

## Section 5: Post-Deployment Monitoring (Ongoing)

### 5.1 First 24 Hours Monitoring

**Check every 2-4 hours:**

1. **Vercel Dashboard**
   - [ ] No spike in error rates
   - [ ] Response times stable
   - [ ] Build is not failing on new commits

2. **Railway Dashboard**
   - [ ] CPU usage < 50%
   - [ ] Memory usage < 60%
   - [ ] No crashes or restarts
   - [ ] Logs show no errors

3. **Manual smoke test**
   ```bash
   # Every 4 hours, run:
   curl -s https://tvp-oc.vercel.app/api/health | grep "ok"
   # Should return: "status":"ok"
   ```

**Success Criteria:**
- No errors in logs
- Normal resource usage
- Uptime = 100%

---

### 5.2 Weekly Monitoring

**Every week (or per Patch Tuesday):**
- [ ] Check for dependency updates
- [ ] Review error logs
- [ ] Verify backup/disaster recovery
- [ ] Check uptime percentage (should be > 99.9%)

---

## Section 6: Emergency Rollback Procedure

**When to rollback:**
- Frontend deploy is broken and not fixable in 30 minutes
- Backend is down and not recoverable
- Critical security issue discovered
- Database corruption

### 6.1 Rollback Frontend (Vercel)

**Time needed:** ~2 minutes

**Steps:**
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to Deployments tab
4. Find the previous successful deployment
5. Click the three-dot menu → "Promote to Production"

```bash
# Or via CLI:
vercel --prod --yes
# This redeploys the last stable version
```

**Success Criteria:**
- Previous version is now live
- All traffic serving from old deployment
- Latest broken deployment is no longer active

---

### 6.2 Rollback Backend (Railway)

**Time needed:** ~2-3 minutes

**Steps:**
1. Go to https://railway.app/dashboard
2. Click on backend project
3. Go to Deployments tab
4. Click on last successful deployment
5. Click "Redeploy"

```bash
# Or via CLI (if configured):
railway deploy --detach
```

**Success Criteria:**
- Previous version redeployed
- Health check passes
- No errors in logs

---

### 6.3 Database Rollback (Last Resort - Supabase)

**Time needed:** ~5-10 minutes

**Steps:**
1. Go to https://supabase.com/dashboard
2. Click on project
3. Go to Database → Backups
4. Find restore point (automatic daily backups)
5. Click Restore
6. Confirm restoration

**Warning:** This will restore **all data** to backup point, losing recent changes.

**Success Criteria:**
- Restoration completes
- Database is accessible
- No connection errors

---

### 6.4 Full Revert Procedure

**If both frontend and backend are broken:**

```bash
# 1. Revert last commit
git revert HEAD

# 2. Push to main (triggers new deployment)
git push origin main

# 3. Monitor deployments
# Watch https://github.com/aundre1/TVP-OC/actions

# 4. Verify health
curl https://your-railway-url.up.railway.app/api/health
curl https://tvp-oc.vercel.app

# 5. If that doesn't work, use individual rollbacks above
```

**Timeline:**
- Commit revert: < 1 minute
- Push: < 1 minute
- Vercel deploy: 2-3 minutes
- Railway deploy: 3-5 minutes
- **Total: ~10 minutes**

---

## Pre-Launch Final Checklist (Day Before Launch)

**Friday, February 27 at 2 PM:**
- [ ] All tests in Section 2 passing
- [ ] All deployments in Section 3 green
- [ ] All smoke tests in Section 4 passing
- [ ] Monitoring set up
- [ ] Team aware of launch time
- [ ] Slack notifications configured
- [ ] Rollback procedures reviewed with team

---

## Launch Day Checklist (Friday, February 28)

**Time: 12:00 PM EST (or your preferred launch time)**

**30 minutes before launch:**
- [ ] Final health check: `curl https://api-url/api/health`
- [ ] Frontend loads: https://tvp-oc.vercel.app
- [ ] No errors in Vercel logs
- [ ] No errors in Railway logs
- [ ] Team is ready
- [ ] Communication channels open

**Launch announcement:**
- [ ] Announce launch to subscribers
- [ ] Share link to app
- [ ] Monitor feedback channels
- [ ] Be ready to rollback if needed

**After launch (first 4 hours):**
- [ ] Check every 15 minutes
- [ ] Monitor error rates
- [ ] Monitor user signups/activity
- [ ] Be ready to rollback until confident system is stable

---

## Success Metrics

**Launch is successful when:**
1. ✓ Frontend loads without errors
2. ✓ API health check returns 200
3. ✓ Users can search and view videos
4. ✓ No critical errors in logs (first 24 hours)
5. ✓ Performance metrics are good (load < 3s)
6. ✓ Uptime is 100% (first 24 hours)

---

## Contacts & Resources

**GitHub:**
- Repo: https://github.com/aundre1/TVP-OC
- Actions: https://github.com/aundre1/TVP-OC/actions

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Project: https://vercel.com/aundre1/the-video-pool

**Railway:**
- Dashboard: https://railway.app/dashboard

**Supabase:**
- Dashboard: https://supabase.com/dashboard

**Monitoring:**
- Frontend: https://tvp-oc.vercel.app
- Backend: https://your-railway-url.up.railway.app/api/health
- GitHub Actions: https://github.com/aundre1/TVP-OC/actions

---

**Last Updated:** February 22, 2026
**Next Review:** February 27, 2026 (day before launch)
**Owner:** Aundre Oldacre
