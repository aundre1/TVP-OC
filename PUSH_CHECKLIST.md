# The Video Pool - Pre-Push Verification Checklist

Generated: 2026-02-22

## What Changed and Why

### Backend Changes (tvp-export/)
**Location:** `/Users/dremacmini/Desktop/OC/video-pool/tvp-export/`

#### 1. CORS Configuration Added
**File:** `server/index.ts`
**Change:** Installed and configured `cors` middleware
**Why:** Required for browser-based requests from frontend during development and production
**Environment Variable:** `CORS_ORIGIN` (defaults to `http://localhost:5173` for dev)

#### 2. Health Check Endpoint Added
**File:** `server/routes.ts`
**Change:** Added `/api/health` endpoint for deployment monitoring
**Why:** Required by Railway (and other containerized platforms) for container health checks and database connectivity verification

Health Check Response Format:
- Status 200 + status "ok" = healthy
- Status 503 + status "error" = unhealthy
- Always includes: timestamp, environment, database status

---

## Git Commands to Run (Copy-Paste Ready)

### Step 1: Verify Current State
```
cd /Users/dremacmini/Desktop/OC/video-pool/tvp-export
git status
```

### Step 2: Stage Backend Changes Only
```
git add server/index.ts server/routes.ts
```

### Step 3: Create Commit
```
git commit -m "Backend: Add CORS middleware and health check endpoint

- Add cors middleware for browser-based requests
- Add /api/health endpoint for deployment monitoring and database checks
- Environment-based CORS origin configuration (CORS_ORIGIN env var)
- Health checks support Railway and containerized deployments

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

### Step 4: Push to GitHub
```
git push origin main
```

---

## What Happens After Push

### 1. GitHub Actions Triggers (Immediate)
- Time: < 5 seconds after push
- Action: Runs workflow defined in `.github/workflows/`
- What it does: Installs dependencies, runs TypeScript compiler check, runs tests, builds Docker image

### 2. Build Status
- Expected: Pass
- Reason: Changes are minimal, no breaking changes

### 3. Deployment
- If auto-deploy enabled: Railway/Vercel picks up build
- Time to deploy: 2-10 minutes depending on platform
- Post-deploy: Health check endpoint available at `/api/health`

### 4. Health Check Verification (After Deploy)
```
curl -X GET https://your-deployed-api.com/api/health

Expected response (200 OK):
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-02-22T...",
  "environment": "production"
}
```

---

## Timeline for Deployment

| Phase | Time | Notes |
|-------|------|-------|
| Push to GitHub | Now | You run git push origin main |
| GitHub Actions starts | < 5 sec | Build job triggered |
| Build & test | 30-60 sec | TypeScript, tests, Docker build |
| Build status | < 2 min | Check Actions tab for result |
| Auto-deploy starts | 2-5 min | If enabled, Railway/Vercel begins deploy |
| App deployed | 2-10 min | Containers spinning up |
| Health check ready | 10-15 min | /api/health endpoint live |

---

## Pre-Push Quality Checks

### Does the code compile?
```
cd /Users/dremacmini/Desktop/OC/video-pool/tvp-export
npm run build
```
Expected: Build completes without errors

### Does the server start?
```
npm run dev
```
Expected: Server starts, no CORS errors on OPTIONS requests

### Health check endpoint works?
```
curl -X GET http://localhost:5000/api/health
```
Expected 200 OK response with status "ok"

---

## Important Configuration Notes

1. **CORS_ORIGIN Environment Variable**
   - Dev: Defaults to http://localhost:5173
   - Production: Must set CORS_ORIGIN to your domain
   - Example: CORS_ORIGIN=https://video-pool.com

2. **Health Check Endpoint**
   - Performs actual database query (not just ping)
   - If database is down, returns 503 Service Unavailable
   - Use in Kubernetes/Docker probes for auto-restart

3. **No Breaking Changes**
   - Existing endpoints unchanged
   - Only additions (CORS middleware, new endpoint)
   - Backward compatible with all clients

---

## Verification Checklist

Before Running: git push origin main

- [ ] Branch is main
- [ ] Remote is up to date (origin/main)
- [ ] Only 2 files modified: server/index.ts, server/routes.ts
- [ ] No credentials in changes
- [ ] npm run build succeeds
- [ ] npm run dev starts without errors
- [ ] Health check endpoint responds with 200 OK locally

---

## If Push Fails

### Pre-commit Hook Issues
If git commit fails due to hooks:
1. Check error message
2. Fix linting/formatting issues if any
3. Re-stage: git add server/index.ts server/routes.ts
4. Retry commit

### Remote Rejection
If push is rejected:
1. Pull latest: git pull origin main
2. Resolve conflicts if any
3. Retry: git push origin main

### Build Failure in GitHub Actions
1. Click Details on failed action
2. Check logs for error
3. Fix locally and commit again
4. Push fix: git push origin main

---

## Deployment Monitoring (After Push)

1. GitHub Actions
   - URL: https://github.com/aundre1/TVP-OC/actions
   - Look for: Green checkmark on latest commit

2. Railway Deployment (if configured)
   - URL: https://railway.app/project/...
   - Look for: Green status indicator

3. Health Endpoint (after live)
   - Test: curl https://your-api/api/health
   - Expected: 200 OK with status "ok"

---

## Rollback Plan (If Needed)

If the deploy causes issues:

```
git log --oneline -5
git revert <commit-hash>
git push origin main
```

Rollback time: < 5 minutes

---

## Summary

What's changing: Backend CORS + Health check endpoint
Risk level: Very low (additions only, no breaking changes)
Expected outcome: Build passes, deploy succeeds, health checks live
Monitoring: GitHub Actions + Railway status
Rollback time: < 5 minutes if needed

Status: Ready to push
