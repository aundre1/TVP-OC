# The Video Pool - Monitoring URLs & Dashboards

**Complete reference for all monitoring dashboards, health checks, and testing endpoints.**

**Date**: February 22, 2026
**Status**: Ready for deployment
**Bookmark this page**

---

## Critical Dashboards (Bookmark These)

### 1. Railway Backend Dashboard

**URL**: https://railway.app/dashboard

**What to monitor**:
- [ ] Project status (green = healthy)
- [ ] Deployment status
- [ ] Logs (real-time error tracking)
- [ ] Environment variables (confirm all 8 set)
- [ ] Metrics (uptime, response time)

**When to check**:
- After deployment (first 5 min)
- Daily (morning)
- When issues reported
- When making changes

**What to look for**:
- Green deployment status
- No error messages in logs
- Response times < 500ms
- Uptime > 99%

**If red/yellow**:
1. Click Logs tab
2. Search for "error" or "failed"
3. Fix the issue (see troubleshooting guides)
4. Redeploy or restart service

---

### 2. Supabase Database Dashboard

**URL**: https://supabase.com/dashboard

**Project**: `dxbtycycyvmzgufdhnae`

**What to monitor**:
- [ ] Database connection status
- [ ] Backup status
- [ ] Database size
- [ ] Real-time query performance
- [ ] Active connections

**When to check**:
- Before deployment (confirm migration ran)
- Weekly (backup verification)
- When database issues occur

**What to look for**:
- Green connection status
- 6 tables in `the_video_pool` schema
- Backups running on schedule
- Database size growing as expected

**Key sections**:
- **Database** → Tables → Should see:
  - videos
  - user_profiles
  - favorites
  - downloads
  - playlists
  - playlist_videos
- **Settings** → Database → Connection string
- **Settings** → Backups → Schedule verified

---

### 3. Vercel Frontend Dashboard

**URL**: https://vercel.com/dashboard

**What to monitor**:
- [ ] Deployment status (green = live)
- [ ] Build logs
- [ ] Analytics
- [ ] Error tracking

**When to check**:
- After making code changes
- Daily (morning)
- When users report UI issues

**What to look for**:
- Green "Ready" status
- No failed deployments
- Page load time < 2 seconds
- No error spikes

---

## Health Check Endpoints

### Main Health Endpoint

**Purpose**: Verify backend is running and database is connected

**Endpoint**:
```
GET https://[your-railway-domain]/api/health
```

**Example command**:
```bash
curl https://video-pool-production-xyz.railway.app/api/health
```

**Expected response** (200 OK):
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-02-22T20:00:00Z",
  "environment": "production",
  "uptime": 3600.123
}
```

**Health status meanings**:
- `"status": "ok"` = Everything is good
- `"status": "degraded"` = Something is wrong
- `"database": "connected"` = Database is accessible
- `"database": "disconnected"` = Database connection failed

**How often**: Check every 5-15 minutes during launch day

**Automated monitoring**: Railway does this automatically every 30 seconds

---

## API Test Endpoints

### Test 1: Get All Videos

**Purpose**: Verify backend can query database

**Endpoint**:
```bash
curl https://[your-railway-domain]/api/videos
```

**Expected response**: 200 OK with JSON array
```json
[
  {
    "id": "1",
    "title": "Video Title",
    "artist": "Artist Name",
    "bpm": 120,
    "genre": "Techno",
    ...
  },
  ...
]
```

**Success criteria**:
- [ ] HTTP 200 (not 500, 502, 503)
- [ ] Valid JSON response
- [ ] Contains video objects (or empty array)
- [ ] Takes <500ms

---

### Test 2: Get Single Video

**Purpose**: Verify API routing and database query

**Endpoint**:
```bash
curl https://[your-railway-domain]/api/videos/video-id-here
```

**Expected response** (if video exists): 200 OK
```json
{
  "id": "video-id",
  "title": "...",
  ...
}
```

**Or if not found** (404):
```json
{"error": "Video not found"}
```

**Success criteria**:
- [ ] Returns 200 (if exists) or 404 (if not)
- [ ] Never returns 500
- [ ] Response is valid JSON

---

### Test 3: Create User Profile

**Purpose**: Verify POST requests and database writes work

**Endpoint**:
```bash
curl -X POST https://[your-railway-domain]/api/profile \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-123","name":"Test User"}'
```

**Expected response**: 201 Created
```json
{
  "id": "test-user-123",
  "name": "Test User",
  "createdAt": "2026-02-22T20:00:00Z"
}
```

**Success criteria**:
- [ ] Returns 201 (not 400, 500)
- [ ] Profile is created
- [ ] Data persists (can query it back)

---

### Test 4: Test Error Handling

**Purpose**: Verify API returns proper error responses

**Endpoint** (invalid):
```bash
curl https://[your-railway-domain]/api/videos/nonexistent-id-xyz
```

**Expected response**: 404 Not Found
```json
{"error": "Video not found"}
```

**Not**: 500 Internal Server Error
```json
{"error": "Internal Server Error", ...}
```

**Success criteria**:
- [ ] Returns appropriate status code (404, 400, etc)
- [ ] Error message is helpful
- [ ] No stack traces leaked
- [ ] No 500 errors for bad input

---

## Performance Testing

### Response Time Check

**Quick test** (single request):
```bash
time curl https://[your-railway-domain]/api/videos > /dev/null
```

**Expected**:
```
real        0m0.245s   ← Should be <500ms
```

### Load Test (Optional)

**Simulate 10 concurrent requests**:
```bash
for i in {1..10}; do
  curl -s https://[your-railway-domain]/api/videos | wc -c &
done
wait
```

**Expected**:
- All requests succeed
- No timeouts
- Consistent response times

---

## Log Monitoring

### Railway Logs

**Location**: https://railway.app/dashboard → Your Project → Logs tab

**What to look for**:
- Error messages (shown in red)
- Warning messages (shown in yellow)
- Request logs (info level)

**Normal log patterns**:
```
[express] GET /api/health 200 in 45ms
[express] GET /api/videos 200 in 156ms
[express] POST /api/profile 201 in 234ms
```

**Problem log patterns**:
```
Error: DATABASE_URL must be set       ← Missing env var
Error: Connection refused             ← Database unreachable
Error: CORS policy blocking request   ← CORS misconfigured
Error: ECONNREFUSED                   ← Port not listening
```

**To find errors**:
1. Go to Logs tab
2. Search for: `error` or `Error` or `failed`
3. Click on matching line
4. Read the full error message
5. Cross-reference with troubleshooting guides

---

### Browser Console Logs

**How to access**:
1. Open frontend: https://tvp-oc.vercel.app
2. Press: Cmd+Option+I (Mac) or Ctrl+Shift+I (Windows)
3. Click: Console tab

**What to look for**:
- Red errors (blocking issues)
- Yellow warnings (non-critical)
- Blue messages (info)

**Common errors to watch for**:
```
CORS error: Access-Control-Allow-Origin missing
  → Check CORS_ORIGIN in Railway variables

Fetch error: Failed to fetch from API
  → Check health endpoint
  → Check backend is running

TypeError: Cannot read property 'xxx'
  → Frontend bug (check if your code has this)

ReferenceError: API_BASE is not defined
  → Configuration issue in client code
```

---

## Uptime Monitoring

### Railway Uptime Status

**Where to check**: https://railway.app/dashboard → Metrics or Status

**Expected**:
- 99%+ uptime
- Less than 5 minutes downtime per month
- No planned maintenance during launch window

### Manual Uptime Check

**Command** (checks if endpoint is responding):
```bash
while true; do
  status=$(curl -s -o /dev/null -w "%{http_code}" https://[domain]/api/health)
  echo "$(date): $status"
  sleep 60  # Check every 60 seconds
done
```

**Expected output**:
```
Wed Feb 22 20:00:00 PST 2026: 200
Wed Feb 22 20:01:00 PST 2026: 200
Wed Feb 22 20:02:00 PST 2026: 200
... (all 200s)
```

**If you see**:
- 502, 503, 504 = Backend crashed or overloaded
- 000 = Network unreachable

---

## Database Monitoring

### Connection Test

**Purpose**: Verify database is accessible from backend

**In Railway logs**, you should see:
```
Database connected successfully
Pool initialized with 10 connections
```

**Not**:
```
Error: Connection refused
Error: ECONNREFUSED
```

### Query Performance

**In Railway logs**, check response times:
```
[express] GET /api/videos 200 in 156ms   ← Good (< 500ms)
[express] GET /api/videos 200 in 2156ms  ← Slow (> 1000ms)
[express] GET /api/videos 500 in 5000ms  ← Failed/Timeout
```

**Baseline performance**:
- Simple query (no filters): <200ms
- Filtered query: 100-300ms
- Complex query: 300-500ms
- Timeout: >5000ms (indicates problem)

### Database Size Tracking

**In Supabase**, go to **Settings** → **Database**

**Check**:
- Database size (should grow as data added)
- Connection count (should be stable)
- Activity monitor

---

## Alert Thresholds

### Immediate Alert (Fix Now)

These indicate a critical issue:

| Issue | Indicator | Action |
|-------|-----------|--------|
| Backend down | Health returns 502/503 | Restart service |
| Database offline | Health: "disconnected" | Check DATABASE_URL |
| CORS blocked | Browser console: CORS error | Check CORS_ORIGIN |
| High error rate | >10% requests failing | Check logs, identify pattern |

### Warn Soon (Check Today)

These should be addressed before EOD:

| Issue | Indicator | Action |
|-------|-----------|--------|
| Slow responses | Average >500ms | Check database queries |
| Memory leak | Memory increasing constantly | Restart service |
| Disk space | Database size >80% quota | Archive data or upgrade |

### Monitor (Ongoing)

These are normal to watch:

| Metric | Expected | Action |
|--------|----------|--------|
| Uptime | 99%+ | If drops below, investigate |
| Errors | <1% of requests | If increases, review logs |
| Latency | <500ms | If increasing, optimize |
| Connections | Stable | If spiking, may indicate attack |

---

## Test Scenarios Checklist

### Before Launch

Run these tests 24 hours before launch:

**Backend Tests**:
- [ ] Health endpoint returns 200
- [ ] GET /api/videos returns results
- [ ] POST /api/profile creates user
- [ ] Error handling returns proper status codes
- [ ] Response times <500ms

**Database Tests**:
- [ ] 6 tables exist in Supabase
- [ ] Can query from backend
- [ ] Backups are running
- [ ] Database size is reasonable

**Frontend Tests**:
- [ ] Page loads in <2 seconds
- [ ] Can call backend API
- [ ] No console errors
- [ ] Responsive on mobile

**Integration Tests**:
- [ ] Frontend → Backend communication works
- [ ] Backend → Database communication works
- [ ] No CORS errors
- [ ] Data flows end-to-end

### During Launch

Run these tests hourly for first 4 hours:

- [ ] Health endpoint: 200 OK
- [ ] API latency: <500ms
- [ ] Error rate: <1%
- [ ] Uptime: 100%
- [ ] Logs: No errors

### Post-Launch

Run daily for first week:

- [ ] Health endpoint: 200 OK
- [ ] No new errors in logs
- [ ] Response times stable
- [ ] Database size reasonable
- [ ] Backups completed

---

## Browser Testing Tools

### Built-in Browser Tools

**Network tab** (measure API latency):
1. Open DevTools (Cmd+Option+I)
2. Click Network tab
3. Refresh page
4. Look for API calls under "Fetch/XHR"
5. Check response time and status code

**Console tab** (check for errors):
1. Open DevTools
2. Click Console tab
3. Look for red error messages
4. Click error for stack trace

**Performance tab** (page load time):
1. Open DevTools
2. Click Performance tab
3. Click refresh/record button
4. Look for:
   - Blue: DOM content loaded
   - Red: Page fully loaded
   - Total time should be <2 seconds

### Command-Line Tools

**curl** (test endpoints):
```bash
curl https://[domain]/api/health
curl https://[domain]/api/videos
```

**time** (measure latency):
```bash
time curl https://[domain]/api/videos > /dev/null
```

**ab** (load testing, if installed):
```bash
ab -n 100 -c 10 https://[domain]/api/videos
```

---

## Creating a Monitoring Dashboard

### Simple Monitoring Schedule

**Every 5 minutes (First 4 hours)**:
```bash
# Put in terminal, runs every 5 min
watch -n 300 'curl -s https://[domain]/api/health | jq .'
```

**Every 30 minutes (Day 1)**:
- Check health endpoint manually
- Glance at Railway Logs
- Verify no user complaints

**Once daily (Week 1)**:
- Check uptime (99%+?)
- Review error rate (<1%?)
- Verify backups are running
- Check database size growth

### Email Alerts (Optional)

If using Railway Pro:
1. Go to Settings
2. Enable email notifications
3. Set alert threshold (e.g., 5 consecutive failed health checks)
4. Provide email address

---

## Quick Reference Commands

### Health Check (Fastest)
```bash
curl https://[domain]/api/health | jq .status
```
**Expected**: `ok`

### Full Health Response
```bash
curl https://[domain]/api/health | jq .
```
**Expected**: All fields present, database: "connected"

### Quick API Test
```bash
curl https://[domain]/api/videos | jq 'length'
```
**Expected**: Number > 0 (or 0 if no data)

### Performance Test
```bash
time curl https://[domain]/api/videos > /dev/null
```
**Expected**: real < 0m0.500s (under 500ms)

### Get Your Railway Domain
```bash
# Replace with your project name, then:
# Go to Railway dashboard → Project → Domain
```

---

## Troubleshooting via Monitoring

### Symptom: "502 Bad Gateway"
**Check**: Health endpoint
```bash
curl https://[domain]/api/health
```
**If**: Returns 502
→ Backend crashed → Check Railway logs for error

### Symptom: "CORS error in console"
**Check**: CORS_ORIGIN variable
```bash
# In Railway Variables tab, verify:
CORS_ORIGIN = https://thevideopool.com,https://tvp-oc.vercel.app
```
**If**: Missing your domain → Add it

### Symptom: "Request timeout"
**Check**: Response time
```bash
time curl https://[domain]/api/videos
```
**If**: Takes >5 seconds → Database slow or not responding

### Symptom: "Uptime drops suddenly"
**Check**: Railway Logs
```bash
# Look for errors in real-time
# Common: OOM, crash, deployment issue
```

---

## Daily Monitoring Checklist

### Save as Recurring Task

```
DAILY VIDEO POOL MONITORING
├─ 9:00 AM
│  ├─ [ ] curl health endpoint
│  ├─ [ ] Check Railway logs
│  └─ [ ] Verify deployment green
├─ 12:00 PM
│  └─ [ ] Spot check API
├─ 5:00 PM
│  └─ [ ] Check uptime % (Railway dashboard)
└─ 9:00 PM
   └─ [ ] Review error rate
```

---

## Emergency Contacts

### If Critical Issue During Launch

1. **Check logs first** (Railway Logs tab)
2. **Verify health endpoint** (curl test)
3. **Check database status** (Supabase dashboard)
4. **Escalate if needed**:
   - Railway: https://railway.app/support
   - Supabase: https://supabase.com/support
   - GitHub: https://github.com/aundre1/TVP-OC/issues

---

## Bookmarks (Add to Browser)

Save these for quick access:

```
PRODUCTION MONITORING
├─ Railway Dashboard
│  https://railway.app/dashboard
├─ Supabase Dashboard
│  https://supabase.com/dashboard
├─ Vercel Dashboard
│  https://vercel.com/dashboard
├─ Frontend (Live)
│  https://tvp-oc.vercel.app
└─ GitHub Repository
   https://github.com/aundre1/TVP-OC
```

---

## Summary

### Key Metrics to Watch

| Metric | Target | Check Frequency |
|--------|--------|-----------------|
| Health endpoint | 200 OK | Every 5 min (first day) |
| Database connection | "connected" | Every 5 min (first day) |
| Response time | <500ms | Every 30 min |
| Error rate | <1% | Daily |
| Uptime | 99%+ | Daily |
| Backup status | Running | Weekly |

### Critical Dashboards

1. **Railway** - Backend health & logs
2. **Supabase** - Database status
3. **Vercel** - Frontend status
4. **Browser DevTools** - API testing & errors

### Most Important Test

```bash
curl https://[your-domain]/api/health
```

If this returns 200 with `"database": "connected"`, **you're deployed.**

---

**Last Updated**: February 22, 2026
**Status**: Ready for deployment
**Bookmark this file**
