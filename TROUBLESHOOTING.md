# The Video Pool - Troubleshooting Guide

**Purpose:** Fast resolution of common deployment issues
**Created:** February 22, 2026
**Status:** Ready for deployment
**Owner:** Aundre Oldacre

---

## Quick Help

**For immediate assistance:**
1. Find your problem below
2. Read the symptoms
3. Check the diagnosis
4. Follow the solution
5. Verify with the test
6. If still broken, escalate to rollback

**Emergency contacts:**
- GitHub: https://github.com/aundre1/TVP-OC
- Vercel: https://vercel.com/support
- Railway: https://railway.app/support
- Supabase: https://supabase.com/docs

---

## Issue 1: Frontend Build Fails

### Symptoms

```
npm run build fails with error
Error message includes: "tsc error", "Cannot find module", "TS7009"
```

### Diagnosis

```
Step 1: Read error message
├─ Module not found? → Missing dependency
├─ Type error? → TypeScript syntax issue
└─ Network error? → Connection issue

Step 2: Check what failed
npm run build 2>&1 | tail -50
```

### Solutions

**Solution 1A: Missing dependency**

```bash
# Problem: "Cannot find module 'X'"

# Fix: Install missing package
npm install missing-package-name

# Example:
npm install react-router-dom

# Then retry build
npm run build
```

**Solution 1B: TypeScript error**

```bash
# Problem: "TS error: Type 'X' is not assignable to type 'Y'"

# Fix: Open the error file and fix the type
# Location shown in error message

# Check for common issues:
# - Missing type definitions
# - Wrong prop types
# - Async/await errors

# Then retry
npm run build
```

**Solution 1C: Out of memory**

```bash
# Problem: Build runs out of memory or gets killed

# Fix: Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"

# Then retry build
npm run build
```

**Solution 1D: Cache corruption**

```bash
# Problem: Strange errors that don't make sense

# Fix: Clear caches
rm -rf node_modules/.vite
rm -rf .next
npm ci

# Then retry
npm run build
```

### Verification

```bash
# Build succeeds
npm run build

# Expected output:
# ✓ ... modules transformed
# dist/index.html ... 0.45 kB
# dist/assets/index.*.js ... 485KB
# ✓ built in XXXms

# Verify dist/ folder exists
ls -la dist/
```

### Rollback if needed

```bash
git revert HEAD
git push origin main
# GitHub Actions will deploy previous version
```

**Timing:** 5-15 minutes to fix
**Severity:** High (blocks deployment)

---

## Issue 2: Frontend Deploy Fails on Vercel

### Symptoms

```
GitHub Actions shows green ✓
But Vercel deployment shows: "Failed" or "Error"
Error message in Vercel dashboard
```

### Diagnosis

```
Step 1: Go to Vercel
https://vercel.com/aundre1/the-video-pool/deployments

Step 2: Click failed deployment
Look for: Build error or function error

Step 3: Check error message
├─ "command not found" → Missing script
├─ "env var not set" → Missing variable
├─ "permission denied" → Auth issue
└─ "timeout" → Build took too long
```

### Solutions

**Solution 2A: Environment variable missing**

```bash
# Problem: "VITE_API_URL is not defined"

# Fix: Go to Vercel dashboard
# Settings → Environment Variables
# Add missing variable: VITE_API_URL
# Set to: https://your-railway-url.up.railway.app

# Then: Trigger redeploy
# Deployments tab → Click three dots → "Redeploy"
```

**Solution 2B: Build script issue**

```bash
# Problem: "Command 'npm run build' failed"

# Fix: Verify build works locally
npm run build

# If local works but Vercel fails:
# Check Vercel build settings
# https://vercel.com/aundre1/the-video-pool/settings
# Build Command: npm run build
# Output Directory: dist
# Install Command: npm install

# Redeploy
```

**Solution 2C: Timeout or memory**

```bash
# Problem: "Build timed out" or "killed: 9 (out of memory)"

# Vercel limits:
# - Build time: 45 minutes
# - Memory: 3GB

# Fix: Optimize build
# 1. Remove unused dependencies
# 2. Enable code splitting (already done)
# 3. Check for large imports

# Check for large files:
npm run build
ls -lah dist/assets/ | sort -k5 -hr

# If any file > 500KB:
# Split or optimize that file

# Redeploy
```

**Solution 2D: Source file error**

```bash
# Problem: Error in actual source code
# Like: "SyntaxError: Unexpected token"

# Fix: Check for syntax errors
npm run build

# Error will show file path
# Open file and fix the error
# Commit and push:
git add .
git commit -m "Fix: Syntax error in [file]"
git push origin main

# Vercel will auto-redeploy
```

### Verification

```bash
# Check Vercel status
curl -I https://tvp-oc.vercel.app

# Expected: HTTP 200
# Bad: 5xx error, timeout, or 404

# Verify site loads
open https://tvp-oc.vercel.app
```

### Rollback if needed

```bash
# Go to Vercel dashboard
# Deployments tab
# Find previous successful deployment
# Click three dots → "Promote to Production"

# Or via CLI:
vercel --prod --yes
```

**Timing:** 5-10 minutes to fix
**Severity:** High (frontend unavailable)

---

## Issue 3: Backend Fails to Deploy on Railway

### Symptoms

```
GitHub Actions shows: "Deploy to Railway" step failed (red X)
Or Railway shows: Deployment "Failed" (red X)
```

### Diagnosis

```
Step 1: Check Railway dashboard
https://railway.app/dashboard → Your project

Step 2: Click Deployments → View logs
Look for error message

Step 3: Identify error type
├─ Build failed → Docker/npm error
├─ Deploy failed → Runtime error
├─ Start failed → Application crash
└─ Health check failed → App not responding
```

### Solutions

**Solution 3A: Environment variable missing**

```bash
# Problem: "Error: DATABASE_URL is not defined"

# Fix: Go to Railway dashboard
# Project → Variables (Raw Editor)
# Add or update: DATABASE_URL

# Format:
DATABASE_URL=postgres://postgres:PASSWORD@db.XXXXX.supabase.co:5432/postgres

# Redeploy:
# Deployments tab → Click latest → "Redeploy"
```

**Solution 3B: Database connection refused**

```bash
# Problem: "Error: connect ECONNREFUSED"
# Or: "Unable to connect to database"

# Fix: Verify Supabase is running
# Check: https://supabase.com/dashboard
# Look for: Green status, "Active"

# Verify DATABASE_URL format
# Should be: postgres://user:pass@host:port/database
# NOT: postgresql://... (wrong protocol)

# Test connection locally (optional):
psql $DATABASE_URL -c "SELECT version();"

# Redeploy Railway
```

**Solution 3C: Build failed (npm error)**

```bash
# Problem: "npm ERR! code ..."
# Or: "npm ERR! 404 Not Found"

# Fix: Check package.json for issues
# tvp-export/package.json

# Common issues:
# 1. Typo in package name
# 2. Version conflict
# 3. Private package without auth

# Fix locally first:
cd tvp-export
npm ci

# Then commit and push
git add tvp-export/package*.json
git commit -m "Fix: Update dependencies"
git push origin main
```

**Solution 3D: Application crashes on start**

```bash
# Problem: "npm run preview" fails
# Or: "Error: listen EADDRINUSE"

# Check: server/index.ts starts correctly
# Common issues:
# 1. Port already in use (shouldn't happen on Railway)
# 2. Missing environment variables
# 3. Database migrations failed

# Fix:
# 1. Verify all env vars set (see Solution 3A)
# 2. Check logs: railway logs --follow
# 3. Look for "AUTO_MIGRATE" errors

# If migration failed:
# - Check DATABASE_URL is correct
# - Check database schema exists
# - Consider manual migration

# Redeploy
```

**Solution 3E: Timeout or memory**

```bash
# Problem: "Build timed out" or "killed"
# Or: "Compile step exceeded time limit"

# Railway limits:
# - Build time: 30 minutes
# - Memory: Depends on plan

# Fix: Optimize build
# 1. Check for large dependencies
# npm ls --all

# 2. Remove unused packages
# npm prune --production

# 3. Check for circular dependencies

# Commit optimization:
git add tvp-export/package*.json
git commit -m "Optimize: Remove unused dependencies"
git push origin main
```

### Verification

```bash
# Check health endpoint
curl https://your-railway-url.up.railway.app/api/health

# Expected:
# {"status":"ok","timestamp":"...","version":"6.0.0"}

# Check logs on Railway
# Dashboard → Logs → Look for errors
```

### Rollback if needed

```bash
# Go to Railway dashboard
# Deployments tab
# Click previous successful deployment
# Click "Redeploy"

# Or via CLI:
railway deploy --detach
```

**Timing:** 10-20 minutes to fix
**Severity:** High (API unavailable)

---

## Issue 4: CORS Errors in Browser

### Symptoms

```
Browser console shows:
"Access to XMLHttpRequest at 'https://api.../api/...'
from origin 'https://tvp-oc.vercel.app'
has been blocked by CORS policy"
```

### Diagnosis

```
This means:
- Frontend is running at: https://tvp-oc.vercel.app
- Frontend trying to reach: https://api.railway.app
- Backend rejected the request because origin doesn't match

Why it happens:
- Frontend URL not in CORS_ORIGIN list on backend
- CORS not configured properly
- Origin header missing
```

### Solutions

**Solution 4A: Add frontend domain to CORS**

```bash
# Problem: Frontend domain not in CORS list

# Fix: Go to Railway dashboard
# Project Settings → Variables
# Update: CORS_ORIGIN

# Current value might be:
# CORS_ORIGIN=http://localhost:3001

# Change to include production domain:
# CORS_ORIGIN=http://localhost:3001,https://tvp-oc.vercel.app,https://thevideopool.com

# Redeploy Railway:
# Deployments tab → Latest → Redeploy
```

**Solution 4B: CORS_ORIGIN syntax issue**

```bash
# Problem: Typo in CORS_ORIGIN value
# Like: "https://tvp_oc.vercel.app" (underscore instead of hyphen)

# Fix: Check exact domain
# Frontend URL must match CORS_ORIGIN exactly

# Correct:
CORS_ORIGIN=https://tvp-oc.vercel.app

# Incorrect (won't work):
CORS_ORIGIN=https://tvp_oc.vercel.app
CORS_ORIGIN=tvp-oc.vercel.app (missing https://)
CORS_ORIGIN=tvp-oc.vercel.app/ (trailing slash)
```

**Solution 4C: Check CORS headers**

```bash
# Verify backend is sending correct headers
curl -X OPTIONS https://your-railway-url.up.railway.app/api/health \
  -H "Origin: https://tvp-oc.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Look for:
# access-control-allow-origin: https://tvp-oc.vercel.app
# access-control-allow-methods: GET, POST, ...

# If missing, see Solution 4A
```

**Solution 4D: Wildcard CORS (development only)**

```bash
# For testing, can temporarily allow all origins
# NEVER do this in production!

# Fix: Set CORS_ORIGIN to "*"
CORS_ORIGIN=*

# WARNING: This allows any website to call your API
# Use only for testing
# Remove before production launch
```

### Verification

```javascript
// In browser console:
fetch('https://your-railway-url.up.railway.app/api/health')
  .then(r => r.json())
  .then(d => console.log('Success!', d))
  .catch(e => console.error('Error:', e))

// Expected: No CORS error, gets response
```

**Timing:** 5-10 minutes to fix
**Severity:** High (all API calls fail)

---

## Issue 5: API Returns 503 Service Unavailable

### Symptoms

```
curl https://api.railway.app/api/health

HTTP/1.1 503 Service Unavailable
{"error":"Service temporarily unavailable"}
```

### Diagnosis

```
Possible causes:
1. Railway service is down (rare)
2. Backend crashed or exited
3. Database connection lost
4. Port not listening
5. Too many requests (rate limited)
```

### Solutions

**Solution 5A: Railway service issue**

```bash
# Check Railway status
# https://railway.app/status

# If shows issues:
# Wait for Railway to recover (usually < 10 min)

# Otherwise, proceed to 5B
```

**Solution 5B: Backend crashed**

```bash
# Check Railway logs
# Dashboard → Logs tab
# Look for: "Error", "FATAL", "Crashed"

# Common causes:
# 1. Database connection lost
# 2. Out of memory
# 3. Uncaught exception

# Try: Restart service
# Deployments → Latest → "Redeploy"
```

**Solution 5C: Database connection lost**

```bash
# Check Supabase status
# https://supabase.com/dashboard

# Verify DATABASE_URL
# Railway → Variables → Check DATABASE_URL set

# Test database locally (optional):
psql $DATABASE_URL -c "SELECT 1;"

# If connection fails:
# Check Supabase is running
# Check password is correct
# Check network rules

# Redeploy Railway after fixing DATABASE_URL
```

**Solution 5D: Rate limiting**

```bash
# Problem: Too many requests, getting 503

# Check: Are you spam-testing the API?
# If yes: Wait 5-10 minutes before retrying

# Check rate limit settings:
# Railway → Variables → RATE_LIMIT_*
# Default: 100 requests per 15 minutes

# If legitimate heavy traffic:
# Increase limits in Railway environment
```

### Verification

```bash
# Retry health check
curl https://your-railway-url.up.railway.app/api/health

# Expected: {"status":"ok",...}
# Bad: Still 503 or other error
```

**Timing:** 5-20 minutes to fix
**Severity:** Critical (API completely down)

---

## Issue 6: Database Query Errors

### Symptoms

```
API returns 5xx error
Backend logs show: "Database error", "syntax error", "relation does not exist"
Frontend shows: "Something went wrong"
```

### Diagnosis

```
Possible causes:
1. Schema/table missing
2. SQL syntax error in backend code
3. Query timeout (table too large)
4. Permission denied (wrong user)
5. Data corruption
```

### Solutions

**Solution 6A: Missing table or column**

```bash
# Problem: "relation 'videos' does not exist"

# Fix: Check schema was created
# https://supabase.com/dashboard
# SQL Editor → Run:

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

# Should show: videos, genres, users, etc.

# If missing:
# Check AUTO_MIGRATE=true in Railway
# Redeploy to run migrations

# Or manually run migrations:
cd tvp-export
npm run db:migrate
```

**Solution 6B: SQL syntax error**

```bash
# Problem: "syntax error at or near ..."
# In backend logs

# Fix: Check source code for SQL error
# tvp-export/server/routes.ts
# tvp-export/server/db.ts

# Look for: Raw SQL queries
# Verify: Correct syntax, table names spelled right

# Fix the SQL
# Commit and push:
git add tvp-export/server/
git commit -m "Fix: SQL syntax error"
git push origin main
```

**Solution 6C: Query timeout**

```bash
# Problem: "Query timed out" after 30 seconds

# Cause: Query on very large table without index

# Fix: Add database index
# https://supabase.com/dashboard
# SQL Editor → Run:

CREATE INDEX idx_videos_genre ON videos(genre_id);
CREATE INDEX idx_videos_title ON videos(title);

# Or: Optimize query (use pagination, add WHERE clause)

# Redeploy backend
```

**Solution 6D: Permission denied**

```bash
# Problem: "permission denied for schema/table"

# Fix: Check database user permissions
# Supabase → SQL Editor → Run:

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO postgres;

# Usually not needed with Supabase (auto-configured)
```

### Verification

```bash
# Test affected endpoint
curl https://your-railway-url.up.railway.app/api/videos?limit=1

# Expected: Array with video objects
# Bad: Error message or 5xx status
```

**Timing:** 10-30 minutes to fix
**Severity:** High (feature broken)

---

## Issue 7: Performance Degradation

### Symptoms

```
API response time increased from < 1s to > 5s
Website feels slow
Users report slowness
```

### Diagnosis

```
Possible causes:
1. Database query getting slower
2. Increased traffic (expected)
3. Memory leak in backend
4. Vercel cold start
5. Network latency
```

### Solutions

**Solution 7A: Database optimization**

```bash
# Check slow queries
# Supabase → SQL Editor → Run:

SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

# Find slowest queries
# Add indexes or optimize:

CREATE INDEX idx_name ON table(column);

# Redeploy backend
```

**Solution 7B: Memory leak**

```bash
# Check memory usage
# Railway → Metrics
# Memory graph trending up? → Memory leak

# Fix: Restart service
# Deployments → Latest → Redeploy

# Or: Optimize backend code
# Look for: Infinite loops, cache not clearing

git add .
git commit -m "Fix: Memory leak in [component]"
git push origin main
```

**Solution 7C: Vercel cold start**

```bash
# Cold starts can take 5-10 seconds
# (First request after inactivity)

# This is normal and expected
# Not a problem unless happens every request

# After first request, should be fast
```

**Solution 7D: Traffic spike**

```bash
# If traffic increased suddenly (good sign!):

# Monitor database/backend load
# Consider upgrading Railway plan

# Check if limits being hit:
# RATE_LIMIT_MAX_REQUESTS exceeded?
# Database connection pool exhausted?

# Temporary fix: Increase limits
# Railway → Variables → Update RATE_LIMIT_MAX_REQUESTS

# Better: Upgrade plan or add caching
```

### Verification

```bash
# Test response time
time curl https://api.railway.app/api/videos

# Expected: < 2 seconds
# Bad: > 5 seconds

# If slow, check Railway metrics
# Look for: CPU spike, memory usage
```

**Timing:** 5-15 minutes to identify, up to 1 hour to fix
**Severity:** Medium (slow but working)

---

## Issue 8: GitHub Actions Workflow Fails

### Symptoms

```
GitHub Actions show red X on deployment
Build step or deploy step failed
Can't trigger manual redeploy
```

### Diagnosis

```
Step 1: Go to https://github.com/aundre1/TVP-OC/actions
Step 2: Click failed workflow
Step 3: Expand failed step
Step 4: Read error message
```

### Solutions

**Solution 8A: Secrets not set**

```bash
# Problem: "VERCEL_TOKEN not found" or "RAILWAY_TOKEN not found"

# Fix: Go to GitHub
# Settings → Secrets and variables → Actions
# Add missing secret:
# VERCEL_TOKEN=... (from Vercel account)
# RAILWAY_TOKEN=... (from Railway account)

# Then: Manually trigger workflow
# Actions tab → Latest workflow → "Re-run failed jobs"
```

**Solution 8B: Source code has errors**

```bash
# Problem: Build step shows TypeScript or syntax error

# Fix: Check build locally
npm run build

# Fix error locally
# Then commit and push:
git add .
git commit -m "Fix: Build error"
git push origin main

# GitHub Actions will auto-retry
```

**Solution 8C: Workflow file syntax error**

```bash
# Problem: Workflow file itself has error
# (Rare, usually starts workflow but fails early)

# Fix: Check workflow file
# .github/workflows/*.yml

# Verify YAML syntax
# Look for: Indentation, quotes, brackets

# Most likely: Ask Claude to review workflow
```

### Verification

```bash
# Check workflow status
# https://github.com/aundre1/TVP-OC/actions

# Should show: Green checkmark ✓
# All steps passing
```

**Timing:** 5-10 minutes to fix
**Severity:** Medium (blocks deployment)

---

## Issue 9: Wrong Version Deployed

### Symptoms

```
Pushed code but old version is still live
Feature I added isn't showing up
Changed environment variable but still using old value
```

### Diagnosis

```
Possible causes:
1. Deploy didn't trigger
2. Deploy is still in progress
3. Cached version in browser
4. Wrong branch deployed
```

### Solutions

**Solution 9A: Clear browser cache**

```bash
# Browser shows cached version

# Quick fix: Hard refresh
# Chrome: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
# Firefox: Ctrl+H then Ctrl+Shift+Delete

# Or: Clear cache
# Browser → Settings → Clear browsing data → All time

# Then reload page
```

**Solution 9B: Deployment still in progress**

```bash
# Go to Vercel or Railway dashboard
# Check: Is deployment still running?

# If yes: Wait for completion (usually 3-10 minutes)

# If no but old version showing:
# Proceed to 9C
```

**Solution 9C: Force redeploy**

```bash
# Go to Vercel dashboard
# Deployments → Latest → Three dots → "Redeploy"

# Or Railway:
# Deployments → Latest → "Redeploy"

# Wait for deploy to complete
# Hard refresh browser
```

**Solution 9D: Wrong branch deployed**

```bash
# Check: Is main branch selected?
# Vercel: Project Settings → Connected git repo
# Should say: "main branch"

# If wrong branch:
# Update settings to use main branch
# Redeploy
```

### Verification

```bash
# Check deployment timestamp
# Should be recent (< 5 minutes ago)

# Hard refresh browser and check version
# open https://tvp-oc.vercel.app
```

**Timing:** 2-10 minutes to fix
**Severity:** Low (just needs cache clear or redeploy)

---

## Issue 10: Out of Disk Space

### Symptoms

```
Railway shows: "Disk full" or "No space left"
Deployments fail
Database can't write data
```

### Diagnosis

```
Rarely happens on Railway (auto-scaled)
More likely in development

Possible causes:
1. Old deployments taking space
2. Large log files
3. Database too large
```

### Solutions

**Solution 10A: Check Railway disk**

```bash
# Go to Railway dashboard
# Metrics → Storage
# Check available space

# If nearly full:
# Delete old deployments:
# Deployments → Scroll down → Delete old ones

# Or: Upgrade plan for more storage
```

**Solution 10B: Database too large**

```bash
# Check database size
# Supabase → Database → Backups
# Look for: Database size

# If > 90% of limit:
# 1. Delete old data (optional)
# 2. Upgrade Supabase plan

# Usually not a problem for MVP
```

### Verification

```bash
# Check available space
# Railway → Metrics → Storage
# Should show: Plenty of free space
```

**Timing:** 5-15 minutes to fix
**Severity:** High (blocks deployments)

---

## Emergency Rollback

**When to rollback:**
```
✗ Critical error, can't fix in 15 minutes
✗ Data corruption
✗ Security issue
✗ Service completely unavailable
```

### Quick Rollback: Frontend (Vercel)

```bash
# Go to Vercel dashboard
# Deployments → Previous successful deployment
# Click three dots → "Promote to Production"

# Wait 2-3 minutes for deploy
# Hard refresh browser to verify
```

### Quick Rollback: Backend (Railway)

```bash
# Go to Railway dashboard
# Deployments → Previous successful deployment
# Click "Redeploy"

# Wait 3-5 minutes for deploy
# Test: curl https://api-url.up.railway.app/api/health
```

### Full Rollback: Revert Commit

```bash
# Go to GitHub
# Find previous good commit
# Click three dots → "Revert"

# Or terminal:
git revert HEAD
git push origin main

# GitHub Actions will deploy previous version
# Wait 5-10 minutes
```

**Timing:** 2-10 minutes
**Severity:** Critical - use only when necessary

---

## When to Escalate

**You've tried all solutions but issue persists?**

1. **Document the issue:**
   ```
   - What happened?
   - When did it start?
   - What did you try?
   - What error messages?
   ```

2. **Check status pages:**
   - https://status.vercel.com/
   - https://github.com/status
   - https://railway.app/status
   - https://supabase.com/status

3. **Contact support:**
   - Vercel: https://vercel.com/support
   - Railway: https://railway.app/support
   - Supabase: https://supabase.com/support
   - GitHub: https://github.com/support

4. **Ask for help:**
   - Post in team Slack
   - Email: [contact info]
   - Phone: [phone number]

---

## Recovery Checklist

**After resolving any issue:**

- [ ] Problem is fixed (verified with test)
- [ ] All systems green (Vercel, Railway, Supabase)
- [ ] No errors in logs
- [ ] Performance is normal
- [ ] Document what happened
- [ ] Update this guide if new issue

---

## Common Error Messages

### "Cannot find module 'X'"
→ Run `npm install X`

### "ECONNREFUSED"
→ Backend is down, check Railway

### "CORS policy blocked"
→ Add frontend domain to CORS_ORIGIN

### "SyntaxError: Unexpected token"
→ Fix code syntax, run `npm run build`

### "503 Service Unavailable"
→ Backend crashed, check Railway logs

### "relation does not exist"
→ Database table missing, check migrations

### "Query timeout"
→ Query is slow, add database index

### "Connection refused"
→ Database down, check Supabase

### "413 Payload Too Large"
→ Request body too big, check API limits

### "Too many requests"
→ Rate limited, wait or increase limit

---

## Prevention Tips

**To avoid issues:**

1. **Test locally before pushing**
   ```bash
   npm run build  # Verify builds
   npm run dev    # Verify runs
   ```

2. **Review changes before commit**
   ```bash
   git diff
   # Check all changes are intentional
   ```

3. **Monitor after deployment**
   ```bash
   Watch dashboards for 30 minutes post-deploy
   Check for errors, slowness, spikes
   ```

4. **Keep documentation updated**
   ```bash
   Update guides as you learn new issues
   Share with team
   ```

5. **Backup important data**
   ```bash
   Verify Supabase backups are running
   Test restore procedure periodically
   ```

---

**Created:** February 22, 2026
**Last Updated:** February 22, 2026
**Version:** 1.0
**Owner:** Aundre Oldacre
**Status:** Ready for launch
