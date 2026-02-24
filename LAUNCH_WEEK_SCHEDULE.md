# The Video Pool - Launch Week Schedule

**Detailed timeline and milestones for the week of February 22-28, 2026.**

**Deadline**: Friday, February 28
**Current Date**: Wednesday, February 22
**Days Remaining**: 6 days
**Status**: ON SCHEDULE ✅

---

## Week-at-a-Glance

```
WED 2/22  │ ███████████████████ 100% DEPLOYMENT START
THU 2/23  │ ██████░░░░░░░░░░░░░  30% TESTING
FRI 2/24  │ ███████░░░░░░░░░░░░  40% FINAL TESTING
SAT 2/25  │ ██████░░░░░░░░░░░░░  30% MONITORING
SUN 2/26  │ ██████░░░░░░░░░░░░░  30% MONITORING
MON 2/27  │ ██████░░░░░░░░░░░░░  30% MONITORING
TUE 2/28  │ ████████████████████ 100% LAUNCH DAY

Key: ███ Complete/In Progress  ░░░ Not Started
```

---

## Wednesday, February 22, 2026 - DEPLOYMENT DAY

### Phase 1: Prepare Environment (45 minutes)
**Start Time**: NOW
**Estimated Duration**: 45 minutes
**Responsible**: You

#### Tasks

**9:00 AM - Generate Secrets** (5 min)
```bash
# Run in Terminal 3 times, save each output
openssl rand -hex 32
# Output 1: JWT_SECRET = [copy this]
# Output 2: REFRESH_TOKEN_SECRET = [copy this]
# Output 3: SESSION_SECRET = [copy this]
```

Save to temporary file (TextEdit):
```
JWT_SECRET = a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
REFRESH_TOKEN_SECRET = x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0
SESSION_SECRET = m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0
```

**9:05 AM - Get Database URL** (5 min)
1. Open https://supabase.com/dashboard
2. Select project: `dxbtycycyvmzgufdhnae`
3. Go to **Settings** → **Database**
4. Copy PostgreSQL connection string
5. Save to same file:
```
DATABASE_URL = postgresql://postgres.dxbtycycyvmzgufdhnae:password@db.dxbtycycyvmzgufdhnae.supabase.co:5432/postgres
```

**9:10 AM - Prepare Browser Tabs** (5 min)
Open these in your browser (use separate tabs):
- [ ] Supabase: https://supabase.com/dashboard
- [ ] Railway: https://railway.app/dashboard
- [ ] GitHub: https://github.com/aundre1/TVP-OC
- [ ] Frontend: https://tvp-oc.vercel.app
- [ ] This guide (for reference)

**9:15 AM - Read Setup Guides** (25 min)
- [ ] Read `RAILWAY_MANUAL_SETUP.md` (15 min)
- [ ] Read `RAILWAY_ENV_VARS_SETUP.md` (10 min)

This is critical. Don't skip. Mistakes here mean redoing the whole thing.

**9:40 AM - Verify You Have Everything** (5 min)
Checklist:
- [ ] 3 secrets generated (JWT, REFRESH, SESSION)
- [ ] Database URL copied from Supabase
- [ ] Browser tabs open
- [ ] Guides read and understood
- [ ] GitHub access working

### Phase 2: Deploy Database (10 minutes)
**Start Time**: 9:45 AM
**Estimated Duration**: 10 minutes
**Responsible**: You

#### Tasks

**9:45 AM - Run Supabase Migration** (8 min)
1. In Supabase dashboard (already open)
2. Click **SQL Editor** (left sidebar)
3. Click **+ New Query**
4. Open file: `/Users/dremacmini/Desktop/OC/video-pool/SUPABASE_MIGRATION.sql`
5. Copy entire file: Cmd+A, Cmd+C
6. Paste in SQL Editor: Cmd+V
7. Click **Run** button
8. Wait for: "Query executed successfully"

**Success indicator**: ✅ Green checkmark appears

**9:53 AM - Verify Tables Created** (2 min)
1. In Supabase: Click **Database** (left sidebar)
2. Expand **Tables**
3. Should see 6 tables under schema `the_video_pool`:
   - [ ] videos
   - [ ] user_profiles
   - [ ] favorites
   - [ ] downloads
   - [ ] playlists
   - [ ] playlist_videos

If all 6 appear: ✅ DATABASE READY

### Phase 3: Deploy Backend to Railway (15 minutes)
**Start Time**: 9:55 AM
**Estimated Duration**: 15 minutes
**Responsible**: You

#### Tasks

**9:55 AM - Create Railway Project** (3 min)
1. Go to https://railway.app/dashboard (already open)
2. Click **+ New Project** (top left)
3. Click **GitHub Repo**
4. Authorize Railway to access GitHub (if prompted)
5. Search for: **aundre1/TVP-OC**
6. Click to select
7. Configure Build Settings:
   - Root Directory: `tvp-export`
   - Build Command: `npm run build`
   - Start Command: `npm start`
8. Click **Create Project** or **Deploy Now**

**Status**: Project created, build starting

**10:00 AM - Add Environment Variables** (5 min)

In Railway dashboard:
1. Click your project
2. Click **Variables** tab
3. Add these 8 variables (use your saved values):

| Key | Value |
|-----|-------|
| DATABASE_URL | postgresql://postgres.dxbtycycyvmzgufdhnae:... |
| CORS_ORIGIN | https://thevideopool.com,https://tvp-oc.vercel.app |
| JWT_SECRET | a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2 |
| REFRESH_TOKEN_SECRET | x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0 |
| SESSION_SECRET | m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0 |
| NODE_ENV | production |
| PORT | 3000 |
| LASTFM_API_KEY | (skip if you don't have it) |

**After adding**: Railway auto-redeploys (3-5 min)

**10:05 AM - Enable Health Checks** (2 min)
1. Click **Settings** tab
2. Find **Health Check** section
3. Set:
   - Enabled: ON (toggle blue)
   - Endpoint: `/api/health`
   - Interval: 30 seconds
   - Timeout: 5 seconds
4. Click **Save**

**10:07 AM - Wait for Deployment** (5 min)
- Watch Deployments tab
- Status should turn green (takes 3-5 minutes)
- Total: ~15 minutes from clicking "Deploy Now"

---

## Thursday, February 23, 2026 - VERIFICATION DAY

### Phase 1: Verify All Systems (30 minutes)
**Start Time**: 9:00 AM
**Responsible**: You

#### Task 1: Check Health Endpoint (5 min)

Open Terminal and run:
```bash
curl https://[your-railway-domain]/api/health
```

Example output:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-02-23T14:00:00Z",
  "environment": "production",
  "uptime": 12345.67
}
```

**Success criteria**:
- [ ] HTTP 200 OK (not 500 or 502)
- [ ] `"status": "ok"` (not "degraded")
- [ ] `"database": "connected"` (not "disconnected")

If ✅ all above: **BACKEND READY**
If ❌ any fail: See troubleshooting section

#### Task 2: Test API Call from Frontend (10 min)

1. Open browser to: https://tvp-oc.vercel.app
2. Open DevTools: Cmd+Option+I
3. Click **Console** tab
4. Paste this command:
```javascript
fetch('https://[your-railway-domain]/api/videos').then(r => r.json()).then(d => console.log(d))
```
(Replace `[your-railway-domain]` with actual domain)

**Expected**: Should see an array of videos in console (or empty array if no data seeded)

**Success criteria**:
- [ ] No CORS errors
- [ ] Response is JSON
- [ ] HTTP 200 OK
- [ ] No 500 errors

If ✅ all above: **FRONTEND-BACKEND INTEGRATION WORKING**

#### Task 3: Check Logs for Errors (10 min)

In Railway dashboard:
1. Click your service
2. Click **Logs** tab
3. Scan for any red errors or warnings
4. Common issues:
   - DATABASE connection errors = check DATABASE_URL
   - Missing environment variables = check Variables tab
   - Build errors = check build output

**Success criteria**:
- [ ] No error messages in logs
- [ ] No "502 Bad Gateway" errors
- [ ] No "database disconnected" messages

#### Task 4: Frontend Status Check (5 min)

1. Go to https://tvp-oc.vercel.app
2. Verify it loads without errors
3. Try navigating to different pages
4. Check browser console (Cmd+Option+I) for errors

**Success criteria**:
- [ ] Page loads quickly
- [ ] No 404 errors
- [ ] No console errors

---

## Friday, February 24, 2026 - FULL SYSTEM TESTING

### Phase 1: End-to-End Testing (1 hour)
**Start Time**: 9:00 AM
**Responsible**: You + any test users

#### Test Scenario 1: View Videos (10 min)

Steps:
1. Go to https://tvp-oc.vercel.app
2. Navigate to Videos section
3. Should see a list of videos
4. Try filtering by:
   - [ ] Genre
   - [ ] BPM range
   - [ ] Search term

Expected:
- [ ] Videos load
- [ ] Filters work
- [ ] No errors in console

#### Test Scenario 2: User Operations (10 min)

Steps:
1. Try creating a user account (if login/signup exists)
2. View your profile
3. Edit profile information
4. Add a video to favorites
5. Download a video
6. Create a playlist

Expected:
- [ ] All operations succeed
- [ ] Data persists (refresh page, data still there)
- [ ] No error messages

#### Test Scenario 3: API Stress (10 min)

In Terminal:
```bash
# Test rapid requests
for i in {1..10}; do
  curl -s https://[your-railway-domain]/api/videos | head -c 100
done
```

Expected:
- [ ] All requests succeed (200 OK)
- [ ] No rate limiting errors (429)
- [ ] No timeout errors

#### Test Scenario 4: Error Handling (10 min)

Try these to verify error handling:
1. Request non-existent video: `/api/videos/invalid-id`
2. Send bad data: POST to `/api/profile` with invalid data
3. Use wrong API key: Add bad Authorization header

Expected:
- [ ] Proper error messages (400, 404, 401)
- [ ] Not generic 500 errors
- [ ] No server crashes

#### Test Scenario 5: Performance (10 min)

Check response times:
```bash
# Time how long requests take
time curl https://[your-railway-domain]/api/videos > /dev/null

# Should be under 500ms
```

Expected performance:
- [ ] Health check: <100ms
- [ ] GET videos: 100-200ms
- [ ] Database queries: <500ms
- [ ] Page load: <2 seconds

#### Test Scenario 6: Mobile Testing (5 min)

1. Open frontend on mobile device or mobile simulator
2. Test on different screen sizes
3. Verify responsive design works
4. Try loading a video

Expected:
- [ ] Responsive layout works
- [ ] Touch interactions work
- [ ] Mobile performance acceptable

### Phase 2: Monitoring Setup (30 minutes)
**Start Time**: 10:30 AM
**Responsible**: You

#### Task 1: Set Up Railway Monitoring

In Railway Dashboard:
1. Enable email alerts (if available on your plan)
2. Bookmark the logs page
3. Set a reminder to check logs daily

#### Task 2: Set Up Supabase Monitoring

In Supabase Dashboard:
1. Check backup status: Settings → Backups
2. Verify backups are scheduled
3. Note database size (Settings → Database)

#### Task 3: Set Up Vercel Monitoring

In Vercel Dashboard:
1. Check deployment status
2. Verify all functions deploy correctly
3. Note any errors

#### Task 4: Create Monitoring Checklist

Save this checklist locally:
```
DAILY MONITORING CHECKLIST:

[  ] Check Railway health endpoint (should return 200 + "connected")
[  ] Check Railway logs for errors
[  ] Check Supabase for connection issues
[  ] Monitor response times (should be <500ms)
[  ] Verify all API endpoints working
[  ] Check for unusual activity/errors

Run: curl https://[domain]/api/health
```

---

## Saturday, February 25 - Monday, February 27 - MONITORING PERIOD

### Daily Routine (10 minutes per day)
**Start Time**: 9:00 AM each day
**Responsible**: You

#### Daily Checklist (Repeat Each Day)

**9:00 AM - Health Check** (2 min)
```bash
curl https://[your-railway-domain]/api/health
```
Should show: `"status": "ok"` and `"database": "connected"`

**9:05 AM - Log Review** (3 min)
- Railway dashboard → Logs
- Look for any errors or warnings
- Note anything unusual

**9:10 AM - Performance Check** (3 min)
- Check if response times increased
- Verify no 500 errors
- Confirm deployments are green

**9:15 AM - Frontend Check** (2 min)
- Open https://tvp-oc.vercel.app
- Verify page loads
- Spot check a few features

### Escalation Procedure

If something is wrong:
1. Check the relevant troubleshooting guide
2. Look at the logs for error messages
3. Try restarting the service (if needed)
4. Document what happened

---

## Tuesday, February 28 - LAUNCH DAY

### Phase 1: Final Pre-Launch Check (30 minutes)
**Start Time**: 8:00 AM
**Responsible**: You

#### Pre-Launch Checklist

**8:00 AM - System Status Check** (10 min)
- [ ] Health endpoint: 200 OK + "connected"
- [ ] No errors in Railway logs (past 24 hours)
- [ ] No errors in Vercel logs (past 24 hours)
- [ ] Response times: All <500ms
- [ ] Uptime: 99%+ (no crashes)

**8:10 AM - API Endpoint Verification** (10 min)

Test each major endpoint:
```bash
# Videos
curl https://[domain]/api/videos | head -c 200

# Profile
curl https://[domain]/api/profile/test-user | head -c 200

# Health
curl https://[domain]/api/health | head -c 200
```

All should return:
- [ ] 200 OK
- [ ] Valid JSON
- [ ] No error messages

**8:20 AM - Frontend Smoke Test** (10 min)
1. Open https://tvp-oc.vercel.app
2. Navigate through all major pages
3. Try one feature on each page
4. Verify no console errors
5. Open DevTools → Check for red errors

### Phase 2: Launch Announcement (Time Varies)
**Responsible**: Depends on your team

#### Activities (Example)
- [ ] Send announcement to users/subscribers
- [ ] Update status page
- [ ] Notify support team
- [ ] Post on social media (if applicable)
- [ ] Alert stakeholders

### Phase 3: Post-Launch Monitoring (Ongoing)
**Start Time**: After launch
**Duration**: Continuous for first 24 hours
**Responsible**: You

#### First Hour Checklist
- [ ] Health endpoint: Still green?
- [ ] Logs: Any errors appearing?
- [ ] Users: Can they access the service?
- [ ] Performance: Still fast?
- [ ] Availability: No 502/503 errors?

**If issues appear**:
1. Check logs immediately
2. Note the error message
3. Try to identify the cause
4. Look at troubleshooting guide
5. Fix or escalate as needed

#### First 24 Hours
- Check logs every 1-2 hours
- Monitor error rates
- Watch for unusual activity
- Be available if users report issues
- Document any issues for future reference

#### First Week
- Monitor daily
- Collect performance metrics
- Note any recurring issues
- Plan any needed improvements

---

## Success Metrics

### Launch is Successful When...

**Availability**: ✅
- [ ] Uptime >99% (no more than 5 min downtime in 8+ hours)
- [ ] No 502/503 errors
- [ ] No database connection failures

**Performance**: ✅
- [ ] Average response time <200ms
- [ ] P95 response time <500ms
- [ ] Page load time <2 seconds

**Functionality**: ✅
- [ ] All API endpoints responding
- [ ] All user actions working
- [ ] No data corruption
- [ ] Sessions/auth working

**Monitoring**: ✅
- [ ] Logs show normal operation
- [ ] No unhandled errors
- [ ] Health checks passing
- [ ] Database connected

**User Experience**: ✅
- [ ] No user-visible errors
- [ ] Responsive on desktop & mobile
- [ ] Features working as expected
- [ ] No CORS or security warnings

---

## Contingency Plans

### If Build Fails

**Timeline**: Immediate
**Action**:
1. Check Railway logs for build error
2. Common causes:
   - Missing root directory setting → Set to `tvp-export`
   - Package installation failed → Force rebuild
   - TypeScript errors → Check server code

**Recovery**: Rebuild takes 3-5 minutes

### If Health Check Fails

**Timeline**: Immediate
**Action**:
1. Check DATABASE_URL is set correctly
2. Verify Supabase is accessible
3. Check that migration ran successfully
4. Restart Railway service

**Recovery**: 2-5 minutes

### If Database Connection Fails

**Timeline**: Immediate
**Action**:
1. Verify DATABASE_URL is correct
2. Check Supabase project is active
3. Verify firewall isn't blocking connection
4. Test connection from Terminal:
   ```bash
   psql postgresql://user:pass@host/db
   ```

**Recovery**: 5-10 minutes

### If CORS Errors Occur

**Timeline**: Immediate
**Action**:
1. Check CORS_ORIGIN environment variable
2. Verify frontend domain is in the list
3. Check for typos (https not http, exact domain)
4. Redeploy Railway service

**Recovery**: 2-3 minutes (for redeploy)

### If Performance Degradation

**Timeline**: Monitor continuously
**Action**:
1. Check database query performance
2. Look for N+1 query problems
3. Check for memory leaks
4. Monitor CPU/memory usage
5. Scale Railway service if needed

**Recovery**: 10-30 minutes (for optimization)

---

## Contact & Escalation

### If You Get Stuck

1. **Check the guides**:
   - RAILWAY_MANUAL_SETUP.md → Troubleshooting
   - RAILWAY_ENV_VARS_SETUP.md → Common Mistakes
   - FINAL_DEPLOYMENT_READINESS.md → Troubleshooting

2. **Check the logs**:
   - Railway Logs tab → Look for error messages
   - Supabase Logs → Check for DB errors
   - Browser Console → Check for CORS/JS errors

3. **Common quick fixes**:
   - Redeploy service (usually fixes env var issues)
   - Restart service (usually fixes connectivity)
   - Rebuild (usually fixes build issues)
   - Check spelling of env var names (very common)

---

## Final Notes

### You've Got This!

This schedule is based on proven deployment patterns. If you follow it step-by-step:

1. Wednesday: Deploy in 1 hour ✅
2. Thursday: Verify everything works ✅
3. Friday: Full testing ✅
4. Saturday-Monday: Monitoring ✅
5. Tuesday: Launch ✅

### Timeline is Flexible

If something takes longer:
- You have 6 days before deadline
- Can do Friday's testing on Saturday
- Can do Saturday's monitoring on Sunday
- Launch day can be pushed to Wednesday if needed

**You're well ahead of schedule.**

### Keep This Handy

Print or bookmark this schedule. You'll reference it multiple times.

### Celebrate When Done!

Once health endpoint returns 200 OK and database is connected, **The Video Pool backend is live.**

---

## Quick Reference

### Key URLs
- Railway: https://railway.app/dashboard
- Supabase: https://supabase.com/dashboard
- Frontend: https://tvp-oc.vercel.app
- GitHub: https://github.com/aundre1/TVP-OC

### Key Commands
```bash
# Test health
curl https://[domain]/api/health

# Test API
curl https://[domain]/api/videos

# Restart service (if needed)
# Go to Railway Dashboard → Settings → Restart Service
```

### Key Files
- RAILWAY_MANUAL_SETUP.md - How to deploy
- RAILWAY_ENV_VARS_SETUP.md - Environment variables
- SUPABASE_MIGRATION.sql - Database SQL
- MONITORING_URLS.md - Dashboards & monitoring

---

**Last Updated**: February 22, 2026
**Status**: Ready for immediate deployment
**Document Version**: 1.0

**Next Reading**: RAILWAY_MANUAL_SETUP.md (start now)
