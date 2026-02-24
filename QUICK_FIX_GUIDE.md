# The Video Pool - Quick Fix Guide

## Status: ONE STEP AWAY FROM LIVE

Frontend: ✅ WORKING  
Backend: 🔴 NEEDS DATABASE_URL  
Database: ⏳ READY TO CONNECT

## What's Wrong

Backend crashes on startup because DATABASE_URL environment variable is missing.

**Proof:**
- Backend health check: 502 error
- All API endpoints: 502 error
- Frontend loads but cannot connect

## How to Fix (5 Minutes)

### Step 1: Get Connection String from Supabase

1. Open: https://app.supabase.com/dashboard
2. Select project: `jvgsmiqsqtqgfagghoiv`
3. Click: **Settings** → **Database** → **Connection string**
4. Select: **PostgreSQL** tab
5. Copy the entire connection string (looks like):
   ```
   postgresql://postgres:[YOUR_PASSWORD]@db.jvgsmiqsqtqgfagghoiv.supabase.co:5432/postgres
   ```

### Step 2: Add to Railway Environment

1. Open: https://railway.app/dashboard
2. Select project: **diplomatic-simplicity**
3. Click the **backend** service
4. Go to **Variables** tab
5. Click **+ New Variable**
6. Name: `DATABASE_URL`
7. Value: Paste the connection string from Step 1
8. Click **Deploy** button

### Step 3: Verify

Wait 30-60 seconds for deployment, then:

```bash
curl https://tvp-oc-production.up.railway.app/health
```

Expected response:
```json
{"status":"healthy","timestamp":"...","uptime":...,"environment":"production"}
```

## What to Check in Railway Logs

After deployment, check logs for:
- ✅ `[STARTUP] ✓ Backend ready to accept requests`
- ✅ `Database connection successful`
- ❌ `ECONNREFUSED` - Wrong host/password
- ❌ `FATAL` - Check DATABASE_URL format

## All Environment Variables Needed

Once DATABASE_URL is set, these should already be configured:

```
NODE_ENV=production
PORT=5000
API_URL=https://tvp-oc-production.up.railway.app
FRONTEND_URL=https://tvp-redesign-2026.vercel.app
JWT_SECRET=[should be set]
JWT_EXPIRY=24h
REFRESH_TOKEN_SECRET=[should be set]
REFRESH_TOKEN_EXPIRY=30d
DATABASE_URL=[PASTE HERE]
```

## If It Still Doesn't Work

**Check 1:** PostgreSQL connection string is correct
- Format: `postgresql://postgres:PASSWORD@db.jvgsmiqsqtqgfagghoiv.supabase.co:5432/postgres`
- Supabase project is active (green dot)

**Check 2:** Railway variables were saved
- Refresh dashboard
- Verify DATABASE_URL appears in Variables tab

**Check 3:** Backend redeploy was triggered
- Check Deployments tab
- Should show recent deployment starting

**Check 4:** Look at Railway logs for errors
- Click backend service → Logs tab
- Search for error messages
- Look for database connection errors

## Timeline to Launch

- Get connection string: 2 min
- Set on Railway: 2 min
- Wait for deployment: 1 min
- Verify health check: 1 min
- **TOTAL: 6 minutes**

## Testing After Fix

Once backend is responding with 200:

1. **Frontend Test**
   - Open: https://tvp-redesign-2026.vercel.app
   - Should load without loading spinner
   - No console errors

2. **Login Test**
   - Try to login (or register)
   - Should work or return proper error (not 502)

3. **Video API Test**
   ```bash
   curl https://tvp-oc-production.up.railway.app/api/videos
   ```
   - Should return video data array (or empty if no seed data)

## Reference Files

- `E2E_TEST_REPORT.md` - Full testing results
- `DEPLOYMENT_STATUS.md` - Deployment architecture
- `RAILWAY_ENV_VARS.md` - All environment variables
- `SUPABASE_RAILWAY_SETUP.md` - Detailed setup guide

---

**That's it!** The app is ready. Just need the database connection string.
