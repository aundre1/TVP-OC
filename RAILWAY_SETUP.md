# Railway Backend Setup — Complete Guide

**Last Updated:** February 22, 2026
**Status:** Required for backend API deployment
**Timeline:** 20-30 minutes
**Automation:** Auto-deploys with GitHub Actions (after initial setup)

---

## Overview

Railway hosts your Express.js backend that handles:
- User authentication (login, registration, JWT)
- Video search & filtering
- Playlist management
- Download tracking
- Payment processing (Phase 2)
- Email notifications (Phase 2)

---

## Architecture

```
GitHub Push
    ↓
GitHub Actions triggers
    ↓
Railway auto-deploy
    ↓
Node.js starts server
    ↓
Connects to Supabase PostgreSQL
    ↓
✅ Backend API live at: https://api.railway.app
```

---

## Prerequisites

Before starting, you need:
1. ✅ GitHub Secrets configured (see `GITHUB_SECRETS_SETUP.md`)
2. ✅ Supabase project created with schema (see `SUPABASE_SETUP.md`)
3. ✅ GitHub account with access to TVP-OC repo
4. ✅ Railway account (free tier works)

---

## Step 1: Create Railway Account

**Time: 2 minutes**

### Go to Railway
```
https://railway.app
```

### Sign Up
1. Click **"Start Project"**
2. Click **"Sign up with GitHub"**
3. Authorize GitHub access
4. You'll be redirected to Railway dashboard

### Verify Account
- Should see "Create a new project" button
- You're now ready to deploy

---

## Step 2: Create Railway Project

**Time: 5 minutes**

### Go to Railway Dashboard
```
https://railway.app/dashboard
```

### Create New Project
1. Click **"New Project"** (top right)
2. Select: **"Deploy from GitHub repo"**
3. Search: `tvp-oc` or `TVP-OC`
4. Select: **aundre1/TVP-OC** (or your fork)
5. Click **"Deploy"**

### Railway Detects Configuration
Railway automatically reads:
- `railway.json` (build config)
- `railway.Dockerfile` (Docker build process)
- `package.json` (dependencies)

The deploy will start automatically.

---

## Step 3: Configure Environment Variables

**Time: 10 minutes**

The backend needs these variables to run. Railway encrypts them.

### Go to Project Variables
1. In Railway Dashboard, select your TVP project
2. Click **"Variables"** tab
3. Click **"RAW EDITOR"** (button in top right)

### Paste All Variables

Copy this entire block and paste into the Raw Editor:

```
NODE_ENV=production
PORT=5000
API_URL=https://api.railway.app

# Database (from Supabase Setup)
DATABASE_URL=postgres://postgres:[PASSWORD]@[HOST]:5432/thevideopool

# JWT (CRITICAL - Generate your own)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long
JWT_EXPIRY=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret-also-very-long-and-different
REFRESH_TOKEN_EXPIRY=30d

# CORS (Frontend URLs)
FRONTEND_URL=https://tvp-oc.vercel.app
CORS_ORIGINS=https://tvp-oc.vercel.app,https://thevideopool.com,http://localhost:3001

# Session
SESSION_SECRET=your-session-secret-make-this-long-and-random

# Rate Limiting
ENABLE_RATE_LIMIT=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
SECURE_COOKIES=true
ENABLE_CSRF_PROTECTION=true

# Logging
LOG_LEVEL=info

# Optional: Stripe (Phase 2 - leave as is for now)
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
STRIPE_PRICE_MONTHLY=price_placeholder
STRIPE_PRICE_ANNUAL=price_placeholder
STRIPE_PRICE_LIFETIME=price_placeholder

# Optional: SendGrid (Phase 2 - leave as is for now)
SENDGRID_API_KEY=SG.placeholder
FROM_EMAIL=noreply@thevideopool.com
FROM_NAME=The Video Pool

# Optional: S3/Wasabi Storage (Phase 2)
S3_ACCESS_KEY=placeholder
S3_SECRET_KEY=placeholder
S3_BUCKET=tvp-videos
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.wasabisys.com
S3_BUCKET_URL=https://tvp-videos.s3.wasabisys.com

# Optional: Redis Cache
REDIS_URL=redis://localhost:6379

# Optional: Google OAuth (Phase 2)
GOOGLE_CLIENT_ID=placeholder
GOOGLE_CLIENT_SECRET=placeholder
GOOGLE_REDIRECT_URI=https://api.railway.app/auth/google/callback

# Migrations
AUTO_MIGRATE=true
```

### Important Variables to Replace

Before clicking Save, replace these with actual values:

#### 1. Database URL
Get from Supabase Setup (see `SUPABASE_SETUP.md`):
```
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@db.XXXX.supabase.co:5432/postgres
```

#### 2. JWT Secrets (Generate new ones)
```bash
# On your Mac, run these in terminal:
openssl rand -hex 32  # Run twice, use output for both JWT secrets
```

Output will be something like:
```
4a5f8c9d2e1b3a7c6f9d2e1b3a7c6f9d4a5f8c9d2e1b3a7c6f9d2e1b3a7c6f9d
```

Use this value for `JWT_SECRET` and generate another for `REFRESH_TOKEN_SECRET`.

#### 3. Session Secret (Generate one)
```bash
openssl rand -hex 32
```

Use this for `SESSION_SECRET`.

#### 4. Frontend URLs
Replace with your actual Vercel URL:
```
FRONTEND_URL=https://tvp-oc.vercel.app
CORS_ORIGINS=https://tvp-oc.vercel.app,https://thevideopool.com,http://localhost:3001
```

### Save Variables
1. Paste the entire block (with replacements) into Raw Editor
2. Click **"Save"** (bottom right)
3. Variables are now encrypted and stored

### Verify
You should see each variable listed (values masked with dots).

---

## Step 4: Configure Build & Deploy

**Time: 3 minutes**

### Go to Deploy Settings
1. In Railway project, click **"Settings"** (top right)
2. Go to **"Build & Deploy"** tab

### Verify Build Settings
Should show:
- **Build Command:** Detected automatically
- **Start Command:** Detected automatically
- **Root Directory:** `/server` or `.` (depending on structure)

### Optional: Enable Auto-Deploy
1. Go to **"Deploy"** tab
2. Enable **"Deploy on push"** (if not already)
3. This makes Railway redeploy when you push to GitHub

---

## Step 5: Monitor First Deployment

**Time: 5-10 minutes**

### Watch the Build
1. Go to **"Deployments"** tab
2. You'll see the current build running
3. Watch logs scroll in real-time:
   ```
   Installing dependencies...
   Building Docker image...
   Uploading to Railway...
   Starting server...
   ```

### When Build Completes
You'll see:
```
✅ Deployment successful
   URL: https://api-[random].railway.app
```

### Get Your API URL
1. Go to **"Settings"** tab
2. Look for **"Railway Domain"** or **"Public URL"**
3. Copy your Railway API URL (looks like `https://api-abc123.railway.app`)
4. This is your `VITE_API_URL` for the frontend

---

## Step 6: Test the Backend

**Time: 5 minutes**

### Health Check Endpoint
```bash
curl https://api-[your-url].railway.app/api/health

# Should respond with:
# {"status":"ok","timestamp":"2026-02-22T..."}
```

### Test API Connectivity
From your terminal:
```bash
# Get videos (if endpoint exists)
curl https://api-[your-url].railway.app/api/videos

# Get genres
curl https://api-[your-url].railway.app/api/genres
```

Should return JSON data (not 404 or error).

### Check Logs for Errors
1. In Railway, go to **"Deployments"** → **Latest**
2. Scroll through logs for any errors
3. Common issues:
   - Database connection failed → Check DATABASE_URL
   - Port already in use → Railway will assign different port
   - Missing environment variable → Check variables section

---

## Step 7: Connect Frontend to Backend

**Time: 2 minutes**

Update your frontend environment variables with the Railway URL:

### In .env.local (local development)
```
VITE_API_URL=https://api-[your-railway-url].railway.app
```

### In Vercel (production)
1. Go to Vercel Dashboard → TVP-OC → Settings
2. Go to **"Environment Variables"**
3. Update or add:
   ```
   VITE_API_URL=https://api-[your-railway-url].railway.app
   ```
4. Click Save
5. Redeploy Vercel (push to GitHub to trigger)

---

## Step 8: Set Up Custom Domain (Optional)

**Time: 5-15 minutes (including DNS propagation)**

### Add Domain to Railway
1. In Railway project, click **"Settings"**
2. Go to **"Domains"** tab
3. Click **"+ Add Domain"**
4. Enter: `api.thevideopool.com` (or your domain)
5. Click **"Add"**

### Update DNS
Railway will show a CNAME record:
```
Name: api
Type: CNAME
Value: api-[random].railway.app
```

Go to your domain registrar (GoDaddy, Namecheap, etc.):
1. Go to DNS settings
2. Add a new CNAME record
3. Paste the values from Railway
4. Wait 5-30 minutes for DNS to propagate

### Verify
```bash
# After DNS propagates (wait ~10 min):
curl https://api.thevideopool.com/api/health

# Should respond with status: ok
```

---

## Step 9: Set Up Monitoring

**Time: 2 minutes**

### Enable Alerts
1. In Railway project → **"Settings"**
2. Go to **"Alerts"** tab
3. Enable these:
   - ✅ Deployment failed
   - ✅ High memory usage
   - ✅ High CPU usage
   - ✅ Crashed restart

### Connect to Slack (Optional)
1. Go to **"Integrations"**
2. Search for "Slack"
3. Connect your Slack workspace
4. Alerts will post to a channel you specify

---

## Deployment Flow After Setup

Once GitHub Secrets are configured:

```
Developer pushes code to GitHub
           ↓
GitHub Actions detects push
           ↓
Runs deploy-railway.yml
           ↓
Authenticates with Railway token
           ↓
Tells Railway to redeploy
           ↓
Railway rebuilds Docker image
           ↓
Railway restarts Node.js server
           ↓
Backend auto-updates (5-8 min)
           ↓
✅ New version live
```

**No manual work needed.** Just push code.

---

## Environment Variables Reference

| Variable | Purpose | Source |
|----------|---------|--------|
| `NODE_ENV` | Node environment | Set to `production` |
| `DATABASE_URL` | Supabase connection | Supabase Setup |
| `JWT_SECRET` | JWT signing key | Generate with openssl |
| `REFRESH_TOKEN_SECRET` | Refresh token key | Generate with openssl |
| `SESSION_SECRET` | Session cookie secret | Generate with openssl |
| `FRONTEND_URL` | Frontend CORS origin | Your Vercel URL |
| `STRIPE_SECRET_KEY` | Stripe payments | Leave placeholder (Phase 2) |
| `SENDGRID_API_KEY` | Email service | Leave placeholder (Phase 2) |
| `S3_BUCKET` | Video storage | Leave placeholder (Phase 2) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Leave placeholder (Phase 2) |

---

## Troubleshooting

### Build Fails with "DATABASE_URL" Error
**Problem:** Backend can't connect to database
**Solution:**
1. Check `SUPABASE_SETUP.md` - ensure database is created
2. Verify DATABASE_URL format: `postgres://user:password@host:5432/dbname`
3. Test locally: `psql DATABASE_URL` should work
4. Update Railway variable and redeploy

### Build Fails with Missing Dependencies
**Problem:** `npm install` fails in Docker
**Solution:**
1. Run locally: `npm install --production`
2. Check if `server/package.json` has all dependencies
3. Verify `node_modules` is in `.gitignore` (shouldn't be committed)
4. Push fix to GitHub, Railway will rebuild

### Deployment Succeeds but No Response
**Problem:** `curl` returns nothing or timeout
**Solution:**
1. Check logs: Railway → Deployments → View logs
2. Is server starting correctly? Look for "Server running on port 5000"
3. Is database connected? Look for "Connected to database"
4. Check environment variables are all set
5. Restart deployment: Railway → Deployments → Rerun

### Memory Usage Too High
**Problem:** Railway shows red alert for memory
**Solution:**
1. Check what's using memory: Look at logs for leaks
2. Increase Railway plan (Hobby tier has 8GB, Pro tier has 32GB)
3. Optimize Node.js (if applicable)
4. Clear Redis cache if using caching

---

## Monitoring Commands

### View Railway Logs
```bash
# Install Railway CLI:
npm install -g @railway/cli

# Login:
railway login

# View logs:
railway logs

# Follow logs (live):
railway logs --follow
```

### View Deployment Status
```bash
railway status
```

### View Environment Variables
```bash
railway variables
```

---

## Cost Estimates

**Railway Pricing:**
- **Hobby (Free):** 5 GB RAM, shared resources, 100 deployment minutes/month
  - Enough for development and testing
  - ~$5/month for overage
- **Team (Paid):** $20/month, 32 GB RAM, shared resources
  - Recommended for production
  - Unlimited deployments

---

## Security Best Practices

✅ **DO:**
- Use strong secrets (openssl generated)
- Rotate secrets every 90 days
- Never commit `.env` files
- Use `SECURE_COOKIES=true` in production
- Monitor logs for suspicious activity

❌ **DON'T:**
- Share Railway token with anyone
- Commit environment variables to GitHub
- Use placeholder values in production
- Disable CSRF protection
- Allow unlimited CORS origins

---

## Verification Checklist

- [ ] Railway account created
- [ ] Railway project deployed
- [ ] All environment variables set
- [ ] Build completed successfully
- [ ] Deployment shows green status
- [ ] Health check responds: `/api/health` → `{"status":"ok"}`
- [ ] Frontend can connect to backend
- [ ] Logs show no errors
- [ ] Custom domain configured (optional)
- [ ] Alerts enabled for monitoring

---

## Next Steps

1. **Database setup:** See `SUPABASE_SETUP.md`
2. **Pre-launch checks:** See `LAUNCH_CHECKLIST.md`
3. **Rollback procedure:** See `LAUNCH_CHECKLIST.md`

---

## Reference URLs

| Resource | URL |
|----------|-----|
| Railway Dashboard | https://railway.app/dashboard |
| Railway Settings | https://railway.app/settings |
| Railway CLI Docs | https://docs.railway.app/cli/quick-start |
| Project Logs | Railway Dashboard → Deployments → View logs |

---

**Status: Follow these steps in order. Backend deployment takes 5-10 minutes.**

**Once done: Every push = auto-deployed backend. 🚀**
