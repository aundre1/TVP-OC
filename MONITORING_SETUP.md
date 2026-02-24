# The Video Pool - Monitoring Setup Guide

**Purpose:** Real-time monitoring of production systems post-launch
**Created:** February 22, 2026
**Status:** Ready for deployment
**Owner:** Aundre Oldacre

---

## Overview

This guide explains how to monitor The Video Pool after launch, including:
- Where to check deployment status
- How to test endpoints
- What metrics to watch
- How to receive alerts
- What normal values look like

---

## Part 1: Vercel Frontend Monitoring

### 1.1 Vercel Dashboard

**Location:** https://vercel.com/dashboard

**What to check:**
1. **Recent Deployments**
   ```
   Look for: "Ready" status (blue checkmark)
   Bad: "Failed" status (red X)
   Bad: "Building" or "Error" status
   ```

2. **Deployment Details**
   ```
   Click on latest deployment to see:
   - Build time
   - Build size
   - Any warnings or errors
   - Deployment URL
   ```

3. **Function Logs**
   ```
   Settings → Function Logs
   Look for:
   - Any 5xx errors
   - 404 errors (unusual)
   - Uncaught exceptions
   ```

**Success criteria:**
- Status shows "Ready"
- No errors in logs
- Build completed in 2-3 minutes

---

### 1.2 Vercel Analytics (if enabled)

**Location:** https://vercel.com/dashboard/project/analytics

**Metrics to watch:**

1. **Web Vitals**
   ```
   First Contentful Paint (FCP)
   └─ Good: < 2s (green)
   └─ OK: 2-3s (yellow)
   └─ Bad: > 3s (red)

   Largest Contentful Paint (LCP)
   └─ Good: < 2.5s (green)
   └─ OK: 2.5-4s (yellow)
   └─ Bad: > 4s (red)

   Cumulative Layout Shift (CLS)
   └─ Good: < 0.1 (green)
   └─ OK: 0.1-0.25 (yellow)
   └─ Bad: > 0.25 (red)
   ```

2. **Error Rate**
   ```
   Monitor for:
   - Sudden spikes (good = flat line)
   - Errors > 1% (bad)
   - Types of errors (4xx vs 5xx)
   ```

3. **Request Count**
   ```
   Monitor for:
   - Trends (should match user activity)
   - Sudden drops (possible infrastructure issue)
   - Spike patterns (normal during peak hours)
   ```

---

### 1.3 Manual Frontend Testing

**Test 1: Homepage Load**
```bash
curl -I https://tvp-oc.vercel.app

# Expected output:
# HTTP/2 200
# content-type: text/html; charset=utf-8
# cache-control: public, max-age=0, must-revalidate

# Success: HTTP 200, content-type is HTML
# Failure: 5xx error, 404, or timeout
```

**Test 2: Static Assets Load**
```bash
curl -I https://tvp-oc.vercel.app/index.html

# Expected: HTTP 200

curl -I https://tvp-oc.vercel.app/assets/index-*.js

# Expected: HTTP 200
```

**Test 3: Load Time**
```bash
time curl -s https://tvp-oc.vercel.app > /dev/null

# Expected: real < 3s (under 3 seconds)
# Acceptable: 3-5s
# Bad: > 5s
```

**Test 4: In-Browser Check**
1. Open https://tvp-oc.vercel.app in browser
2. Open DevTools (F12 → Console)
3. Look for:
   - Green messages (good)
   - Red errors (bad)
   - Yellow warnings (review)
4. Check Network tab:
   - All requests green (200)
   - Some requests might be 304 (cache) = OK
   - No 404s or 5xx errors

**Frequency:**
- First hour: Every 5 minutes
- Next 2 hours: Every 15 minutes
- After that: Every hour

---

## Part 2: Railway Backend Monitoring

### 2.1 Railway Dashboard

**Location:** https://railway.app/dashboard

**What to check:**
1. **Deployment Status**
   ```
   Go to: Your project → Deployments
   Look for: Green checkmark next to latest deployment
   Bad: Red X or "Failed"
   ```

2. **Deployment Logs**
   ```
   Click on latest deployment → View logs
   Look for:
   - "npm install" completed ✓
   - "npm run build" completed ✓
   - "npm run preview" started ✓
   - "Server running on port 5000" ✓
   Bad: "Error", "failed", exceptions
   ```

3. **Metrics**
   ```
   Dashboard → Metrics tab
   Monitor:
   - CPU usage (should be < 50%)
   - Memory usage (should be < 60%)
   - Network I/O (normal is < 100 MB/day for MVP)
   ```

**Success criteria:**
- Deployment shows green checkmark
- Logs show "Server running"
- CPU < 50%, Memory < 60%

---

### 2.2 Railway Environment Variables

**Location:** https://railway.app/dashboard → Project Settings → Variables

**Verify on each deployment:**
1. NODE_ENV = production
2. DATABASE_URL = (configured, not empty)
3. JWT_SECRET = (configured, not empty)
4. PORT = 5000 (or assigned port)
5. FRONTEND_URL = (set correctly)
6. AUTO_MIGRATE = true

**If a variable is missing:**
1. Go to Project Settings
2. Click Variables tab
3. Add the missing variable
4. Redeploy from latest commit

---

### 2.3 Manual Backend Testing

**Test 1: Health Check**
```bash
BACKEND_URL="https://your-railway-url.up.railway.app"

curl -X GET $BACKEND_URL/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2026-02-28T...",
#   "version": "6.0.0"
# }

# Success: HTTP 200, status: "ok"
# Failure: 5xx error, timeout, or "error" status
```

**Test 2: Response Time**
```bash
time curl -s $BACKEND_URL/api/health | jq .

# Expected: real < 1s (under 1 second)
# Acceptable: 1-2s
# Bad: > 2s
```

**Test 3: Get Videos**
```bash
curl -s "$BACKEND_URL/api/videos?limit=5" | jq '.[0]'

# Expected response (one video):
# {
#   "id": "...",
#   "title": "...",
#   "artist": "...",
#   "url": "...",
#   "thumbnail": "..."
# }

# Success: Returns array of videos
# Failure: Empty array, error, or malformed data
```

**Test 4: Search Endpoint**
```bash
curl -s "$BACKEND_URL/api/videos/search?q=dance&limit=5" | jq '.length'

# Expected: Returns number > 0 (found matching videos)
# Acceptable: Returns 0 (no matches, but endpoint works)
# Failure: Error or malformed response
```

**Test 5: Error Handling**
```bash
curl -s "$BACKEND_URL/api/videos/invalid-id" | jq .

# Expected:
# {
#   "error": "Video not found"
# }

# Or HTTP 404 response
# Success: Returns proper error response
# Failure: 5xx error or no error message
```

**Frequency:**
- First hour: Every 5 minutes
- Next 2 hours: Every 15 minutes
- After that: Every hour

---

## Part 3: Database Monitoring

### 3.1 Supabase Dashboard

**Location:** https://supabase.com/dashboard

**What to check:**
1. **Project Status**
   ```
   Home → Overview
   Look for: Green "Active" status
   Bad: Red "Error" or "Down"
   ```

2. **Database Connection**
   ```
   Settings → Database → Connections
   Verify:
   - Connected clients: > 0 (if in use)
   - No disconnection events
   - Error rate: 0%
   ```

3. **Query Performance**
   ```
   SQL Editor → Run a test query:
   SELECT COUNT(*) FROM videos;

   Expected: Completes in < 1 second
   ```

**Success criteria:**
- Database status is "Active"
- Queries complete in < 1s
- Error rate is 0%

---

### 3.2 Database Health Queries

**Test 1: Connection**
```bash
DATABASE_URL="postgres://postgres:PASSWORD@db.XXXXX.supabase.co:5432/postgres"

psql $DATABASE_URL -c "SELECT version();"

# Expected: PostgreSQL version number
# Failure: Connection refused or timeout
```

**Test 2: Table Status**
```bash
psql $DATABASE_URL << EOF
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
EOF

# Expected: List of tables (videos, genres, users, etc.)
# Failure: No tables or error
```

**Test 3: Data Integrity**
```bash
psql $DATABASE_URL << EOF
SELECT COUNT(*) as video_count FROM videos;
SELECT COUNT(*) as genre_count FROM genres;
EOF

# Expected: Positive numbers
# Failure: 0 or error
```

**Test 4: Backup Status**
```
Go to: Project Settings → Backups
Look for:
- Last backup: Today ✓
- Backup size: Reasonable
- Backups enabled: Yes ✓
```

---

## Part 4: CORS & Integration Testing

### 4.1 Test Frontend-to-Backend Communication

**From browser console (F12 → Console):**
```javascript
// Test 1: Simple fetch
fetch('https://your-railway-url.up.railway.app/api/health')
  .then(r => r.json())
  .then(d => console.log(d))

// Expected output:
// {status: "ok", timestamp: "...", version: "..."}

// Test 2: Check for CORS errors
// Look in Console for red error messages
// If you see "Access to XMLHttpRequest blocked by CORS policy"
// → CORS not configured correctly
```

**From terminal (test CORS headers):**
```bash
curl -X OPTIONS https://your-railway-url.up.railway.app/api/health \
  -H "Origin: https://tvp-oc.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Look for:
# < access-control-allow-origin: https://tvp-oc.vercel.app
# < access-control-allow-methods: GET, POST, ...

# Success: Headers present and match origin
# Failure: Headers missing or wrong origin
```

---

## Part 5: Performance Monitoring

### 5.1 Frontend Performance

**Metrics to track:**
```
1. Page Load Time
   Tool: https://pagespeed.web.dev/
   Target: > 90 (Google PageSpeed score)

2. Lighthouse Score
   DevTools → Lighthouse
   Target: > 90 for Performance

3. Core Web Vitals
   From Vercel Analytics:
   - FCP: < 2s
   - LCP: < 2.5s
   - CLS: < 0.1
```

**Daily test:**
```bash
# Check load time
curl -w "@- " -o /dev/null -s https://tvp-oc.vercel.app << 'EOF'
time_namelookup:  %{time_namelookup}
time_connect:     %{time_connect}
time_appconnect:  %{time_appconnect}
time_pretransfer: %{time_pretransfer}
time_redirect:    %{time_redirect}
time_starttransfer: %{time_starttransfer}
time_total:       %{time_total}
EOF

# Total should be < 3s
```

---

### 5.2 Backend Performance

**Metrics to track:**
```
1. API Response Time
   Target: < 1 second for most endpoints

2. Database Query Time
   Target: < 500ms for typical queries

3. CPU Usage
   Target: < 50% idle

4. Memory Usage
   Target: < 60% used
```

**Daily test:**
```bash
# Get average response time
for i in {1..5}; do
  time curl -s https://your-railway-url/api/videos > /dev/null
done

# Average should be < 1s
```

---

## Part 6: Error Tracking & Logging

### 6.1 Vercel Error Logs

**Location:** https://vercel.com/dashboard → Project → Deployments → Function Logs

**What to watch:**
```
Red messages = Errors (investigate)
Yellow messages = Warnings (review)
Gray messages = Info (normal)

For each error:
1. Click to see full details
2. Note the timestamp
3. Check if it's recurring
4. Check Railway logs to correlate
```

**Common errors and meaning:**
```
500 Internal Server Error
└─ Backend issue, check Railway

404 Not Found
└─ Invalid route or missing file

ECONNREFUSED
└─ Can't reach backend (Railway down?)

ENOTFOUND
└─ Can't resolve domain name
```

---

### 6.2 Railway Error Logs

**Location:** https://railway.app/dashboard → Logs tab

**What to watch:**
```
Any message with: ERROR, FAILED, Exception
└─ Investigate and fix immediately

Database connection errors
└─ Check Supabase is running
└─ Check DATABASE_URL is correct

Port conflicts
└─ Unusual, check Railway metrics
```

**Tail live logs from terminal:**
```bash
# SSH into Railway (if enabled)
# Or use Railway CLI:
railway logs --follow

# Ctrl+C to exit
```

---

## Part 7: Alerting Setup

### 7.1 GitHub Status Monitoring

**Location:** https://www.githubstatus.com/

**What to watch:**
- GitHub Actions: All green
- GitHub API: All green
- Any yellow/red = potential issues

---

### 7.2 Uptime Monitoring (Optional)

**Tool recommendations:**
- **UptimeRobot** (free tier)
- **Pingdom**
- **StatusCake**

**Setup steps:**
1. Create account at UptimeRobot.com
2. Add monitor:
   - URL: `https://your-railway-url.up.railway.app/api/health`
   - Check every: 5 minutes
3. Configure alerts:
   - Email alert on down
   - SMS alert (optional)
4. Get weekly summary

**Success criteria:**
- Uptime > 99.9%
- No false positives

---

### 7.3 Slack Notifications (Optional)

**Setup:**
1. Create Slack workspace channel: `#tvp-alerts`
2. Create incoming webhook:
   - Slack App Directory → Incoming Webhooks
   - Add to #tvp-alerts
   - Copy webhook URL
3. Test webhook:
   ```bash
   curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"Test alert"}' \
     <WEBHOOK_URL>
   ```

---

## Part 8: Daily Monitoring Checklist

### Every Morning (9 AM)

```bash
# 1. Check Vercel
curl -I https://tvp-oc.vercel.app

# 2. Check Railway health
curl https://your-railway-url.up.railway.app/api/health | jq .

# 3. Check dashboards
# - https://vercel.com/dashboard
# - https://railway.app/dashboard
# - https://supabase.com/dashboard

# 4. Verify uptime
# - Uptime > 99%
# - No downtime events
```

### Every Afternoon (3 PM)

```bash
# Repeat morning checks
# Check error logs
# Verify performance metrics
```

### Every Evening (8 PM)

```bash
# Final checks before bed
# Verify all systems green
# No critical issues
```

---

## Part 9: What Normal Looks Like

### Healthy Frontend
```
✓ Load time: 1-3 seconds
✓ No 5xx errors
✓ Minimal 404s
✓ FCP: < 2s
✓ LCP: < 2.5s
✓ CLS: < 0.1
✓ Memory stable
```

### Healthy Backend
```
✓ Health check: 200 OK
✓ API response: < 1s
✓ CPU: 10-40% during normal traffic
✓ Memory: 20-50% used
✓ Error rate: 0-0.1%
✓ Database queries: < 500ms
✓ No connection errors
```

### Healthy Database
```
✓ Connected: Yes
✓ Query time: < 1s
✓ Active connections: 2-10
✓ Error rate: 0%
✓ Backup: Daily
✓ Size: Stable
✓ No slow queries
```

---

## Part 10: Alerting Thresholds

**When to investigate:**
```
Frontend:
- Load time > 5s → Check Vercel
- Error rate > 1% → Check logs
- 5xx errors → Critical, check backend

Backend:
- Health check fails → Critical, check Railway
- Response time > 5s → Check database
- CPU > 80% → Check for memory leak
- Memory > 80% → Restart service

Database:
- Connection fails → Critical, check Supabase
- Query time > 2s → Check indexes
- 404 errors > 5% → Check data integrity
```

**When to rollback:**
```
✗ Backend completely down (> 5 min)
✗ Database corrupted
✗ Critical security issue
✗ Error rate > 5% (sustained)
✗ Data loss detected
```

---

## Part 11: Monitoring Schedule

| Time | Frequency | What to Check |
|------|-----------|---------------|
| 9 AM | Daily | Health check, dashboards, logs |
| 12 PM | Daily | Performance, error rate |
| 3 PM | Daily | Repeat morning checks |
| 6 PM | Daily | Final status before evening |
| 9 PM | Daily | Before-bed status check |

**Weekly (Friday 5 PM):**
- [ ] Review error trends
- [ ] Check performance metrics
- [ ] Verify backups
- [ ] Review resource usage

**Monthly (1st of month):**
- [ ] Full infrastructure audit
- [ ] Review logs and errors
- [ ] Plan optimizations
- [ ] Update documentation

---

## Part 12: Troubleshooting Quick Reference

**Issue: Frontend not loading**
```
1. Check: https://vercel.com/dashboard
2. Look for: Red X or "Failed" status
3. Click deployment → See build error
4. Fix: Check environment variables or build config
```

**Issue: API returning errors**
```
1. Check: https://railway.app/dashboard
2. Look for: Deployment status and logs
3. Search logs for: "Error", "FAILED"
4. Fix: Check database connection, restart service
```

**Issue: Database connection refused**
```
1. Check: https://supabase.com/dashboard
2. Look for: Database status
3. Verify: DATABASE_URL in Railway
4. Fix: Restart Railway deployment
```

**Issue: CORS errors in browser console**
```
1. Browser: Open DevTools → Console
2. Look for: "Access to XMLHttpRequest blocked by CORS"
3. Check: CORS_ORIGIN in Railway environment
4. Fix: Add correct frontend domain to CORS_ORIGIN
```

**Issue: Performance degradation**
```
1. Check: Vercel/Railway metrics
2. Look for: CPU spike, memory spike
3. Check: Database query logs
4. Fix: Optimize slow queries or restart service
```

---

## Resources

**Dashboards:**
- Vercel: https://vercel.com/dashboard
- Railway: https://railway.app/dashboard
- Supabase: https://supabase.com/dashboard
- GitHub: https://github.com/aundre1/TVP-OC/actions

**Monitoring Tools:**
- UptimeRobot: https://uptimerobot.com/
- Vercel Status: https://status.vercel.com/
- GitHub Status: https://www.githubstatus.com/

**Documentation:**
- FINAL_LAUNCH_CHECKLIST.md → Deployment procedures
- TROUBLESHOOTING.md → Common issues and fixes
- GITHUB_PUSH_PROCEDURE.md → How to deploy changes

---

**Created:** February 22, 2026
**Last Updated:** February 22, 2026
**Version:** 1.0
**Owner:** Aundre Oldacre
**Status:** Ready for launch
