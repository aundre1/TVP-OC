# The Video Pool - Railway Deployment Setup Guide

**Timeline**: Complete before Friday
**Status**: Backend build verified (0 TypeScript errors)
**Railway Token Available**: aa4dc855-5455-4053-892d-58046b65d4d7

---

## Quick Start (5 minutes)

### Prerequisites
- GitHub account (for auto-deploy)
- Supabase PostgreSQL database ready
- Railway account (or create one)
- The provided Railway token

### Step 1: Create Railway Project

```bash
# Option A: Using the Railway Dashboard (GUI)
1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "GitHub Repo"
4. Select the video-pool repository
5. Railway will detect railway.json and railway.Dockerfile

# Option B: Using the Railway CLI (if installed)
railway link
railway up
```

### Step 2: Configure Environment Variables in Railway Dashboard

1. Go to Railway Dashboard → Select your project
2. Click "Variables" tab (top right)
3. Click "Raw Editor" (to paste all at once)
4. Copy the contents of `RAILWAY_ENV_VARS.json` (provided separately)
5. Paste into the Raw Editor
6. Click "Save"

**Important**: Railway encrypts all variables - they are NOT visible in logs.

---

## Detailed Setup Steps (10-15 minutes)

### Step 1: Railway Account & Project Creation

#### Create Railway Account
1. Visit https://railway.app
2. Click "Start for free"
3. Sign up with GitHub (recommended for auto-deploy)
4. Authorize Railway to access your GitHub repos

#### Create New Project
1. Dashboard → "New Project"
2. Select "GitHub Repo"
3. Find and select `video-pool` repository
4. Click "Deploy"

Railway will:
- Detect `railway.json` in the project root
- Use the Dockerfile specified: `railway.Dockerfile`
- Automatically build and deploy on push to main

### Step 2: Add Required Environment Variables

Railway Dashboard Location:
- Project → Settings (gear icon) → Variables

#### Environment Variables to Add
Create these in the Railway dashboard "Raw Editor" (copy/paste all at once):

```json
{
  "NODE_ENV": "production",
  "PORT": "3000",
  "API_URL": "https://api-tvp.railway.app",
  "DATABASE_URL": "postgres://user:password@host:5432/thevideopool",
  "CORS_ORIGIN": "https://thevideopool.com,https://tvp-oc.vercel.app,http://localhost:5173",
  "JWT_SECRET": "your-super-secret-key-min-32-chars-change-me",
  "REFRESH_TOKEN_SECRET": "your-refresh-secret-min-32-chars-change-me",
  "SESSION_SECRET": "your-session-secret-min-32-chars-change-me",
  "FROM_EMAIL": "noreply@thevideopool.com",
  "FROM_NAME": "The Video Pool",
  "LOG_LEVEL": "info",
  "SECURE_COOKIES": "true",
  "AUTO_MIGRATE": "true",
  "ENABLE_RATE_LIMIT": "true",
  "RATE_LIMIT_WINDOW_MS": "900000",
  "RATE_LIMIT_MAX_REQUESTS": "100"
}
```

**Critical variables that MUST be set:**
- `DATABASE_URL` - Supabase connection string (see below)
- `CORS_ORIGIN` - Frontend domains
- `JWT_SECRET` - Generate with: `openssl rand -hex 32`
- `REFRESH_TOKEN_SECRET` - Generate with: `openssl rand -hex 32`
- `SESSION_SECRET` - Generate with: `openssl rand -hex 32`

**Optional variables (can add later):**
- `STRIPE_SECRET_KEY` - For payment processing (Phase 2)
- `SENDGRID_API_KEY` - For email (Phase 2)
- `S3_ACCESS_KEY`, `S3_SECRET_KEY` - For file storage (Phase 2)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - For OAuth (Phase 2)
- `SENTRY_DSN` - For error tracking

### Step 3: Connect Supabase Database

#### Get Your Database URL from Supabase

1. Log into https://supabase.com
2. Select your project: **the_video_pool**
3. Go to: Settings (bottom left) → Database
4. Copy the "URI" under "Postgres Connection"
5. Format should be: `postgres://[user]:[password]@[host]:[port]/[database]`

#### Set DATABASE_URL in Railway

1. In Railway Variables section, set:
   ```
   DATABASE_URL=postgres://[paste-from-supabase]
   ```

2. If the URL is missing the database name, append it:
   ```
   postgres://user:password@host:5432/the_video_pool
   ```

### Step 4: Configure GitHub Auto-Deploy (Optional but Recommended)

This enables automatic deployment whenever you push to main branch.

#### Setup GitHub Connection

1. In Railway dashboard, find the GitHub icon (usually in top right)
2. Click "Connect GitHub" (if not already connected)
3. Select "video-pool" repository
4. Grant Railway permission to access the repo

#### Configure Auto-Deploy

1. Go to Project Settings (gear icon)
2. Scroll to "Deploy" section
3. Find "GitHub Deployment Triggers"
4. Select "Automatic deployment on push to main"
5. Save

Now every push to `main` will:
- Trigger Railway build (using railway.Dockerfile)
- Run: `npm run build`
- Start with: `npm run preview` (or command in railway.json)

### Step 5: Monitor Deployment

#### View Deployment Status
1. Dashboard → Project
2. Look for green checkmark (deployed) or red X (failed)
3. Click on the deployment to see logs

#### Common Issues During Deploy

| Issue | Fix |
|-------|-----|
| Build fails with "npm: command not found" | Node.js not installed in container - check railway.Dockerfile |
| "DATABASE_URL not set" | Add DATABASE_URL to Variables (see Step 3) |
| "CORS error" | Update CORS_ORIGIN to include frontend domain |
| "Port already in use" | Railway assigns PORT automatically - don't hardcode |
| "Health check failing" | Check database connectivity - ensure DATABASE_URL is correct |

---

## Important Configuration Details

### Railway Port Assignment

Railway automatically assigns a port. The application code reads from the `PORT` environment variable:

```typescript
const port = parseInt(process.env.PORT || "5000", 10);
httpServer.listen({ port, host: "0.0.0.0" });
```

**Do NOT hardcode the port.** Railway will inject the correct PORT on deployment.

### CORS Configuration

The backend CORS is configured in `/tvp-export/server/index.ts`:

```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

For production, set CORS_ORIGIN to all your domains:
```
CORS_ORIGIN=https://thevideopool.com,https://tvp-oc.vercel.app
```

### Health Check Endpoint

The backend includes a health check at `/api/health`:

```bash
# Test locally
curl http://localhost:5000/api/health

# Expected response
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-02-22T19:52:00.000Z",
  "environment": "production"
}
```

Railway uses this endpoint for:
- Determining if the service is healthy
- Auto-restart on failure
- Load balancing checks

### Build Process

Railway will execute:
1. `npm install` (installs dependencies)
2. `npm run build` (builds both client and server)
   - Client: Vite transpiles React → dist/public/
   - Server: esbuild bundles Express → dist/index.cjs
3. Start command from `railway.json`: `npm run preview`

**Build Output**:
- Server bundle: `dist/index.cjs` (1.0 MB)
- Client bundle: `dist/public/` (2.4 MB total)
- Build time: ~2-3 minutes

---

## Advanced: Manual Deployment with Railway CLI

If you prefer command-line deployment:

### Install Railway CLI
```bash
npm install -g @railway/cli
```

### Deploy
```bash
railway login
cd /Users/dremacmini/Desktop/OC/video-pool
railway link  # Select existing project
railway up    # Deploy current code
```

### View Logs
```bash
railway logs
```

---

## Rollback & Redeployment

### Revert to Previous Deployment
1. Dashboard → Deployments tab
2. Find previous green deployment
3. Click three-dots menu → "Rollback to this"

### Force New Deployment
```bash
git push origin main
```

Or from Railway dashboard:
1. Click "Redeploy" button on latest deployment

---

## Next Steps After Deployment

### 1. Test the Backend
```bash
# Get your Railway domain from dashboard (looks like: api-tvp.railway.app)
curl https://api-tvp.railway.app/api/health

# Test CORS with your frontend domain
curl -H "Origin: https://thevideopool.com" \
     -H "Access-Control-Request-Method: POST" \
     https://api-tvp.railway.app/api/videos
```

### 2. Connect Frontend
Update your frontend environment variables to point to the deployed backend:
```
VITE_API_URL=https://[your-railway-domain].railway.app
```

### 3. Monitor in Production
- Dashboard → Logs: View real-time logs
- Dashboard → Metrics: Monitor CPU, memory, requests
- Dashboard → Alerts: Set up alerts for failures

---

## Troubleshooting

### Build Failures

**Check Railway logs:**
1. Dashboard → Deployments
2. Click failed deployment
3. Scroll to "Build Logs"
4. Look for first error

**Common causes:**
- Missing environment variables
- TypeScript compilation errors
- Missing npm dependencies

**Fix:**
```bash
# Locally verify build works
cd /Users/dremacmini/Desktop/OC/video-pool/tvp-export
npm install
npm run build
npm run check  # TypeScript check
```

### Runtime Failures

**Check Railway runtime logs:**
1. Dashboard → Running deployment → Logs
2. Look for error messages

**Test health endpoint:**
```bash
curl https://[your-domain].railway.app/api/health
```

**If health check fails:**
- Database connection issue: Check DATABASE_URL
- Missing env vars: Check Variables section
- Port conflict: Check PORT variable

### Database Connection Issues

**Test locally first:**
```bash
DATABASE_URL="postgres://user:password@host:5432/db" \
NODE_ENV=production \
npm run build
npm run start
```

**If that works but Railway fails:**
- Supabase has IP whitelist: Add Railway IP to Supabase → Settings → Network
- Or disable IP restrictions (not recommended for production)

---

## Final Checklist Before Launch

- [ ] Railway project created
- [ ] GitHub auto-deploy configured
- [ ] All environment variables set in Railway dashboard
- [ ] DATABASE_URL connects to Supabase
- [ ] CORS_ORIGIN includes frontend domain
- [ ] Health check endpoint responds: `/api/health` → 200 OK
- [ ] Frontend can make API requests (test CORS)
- [ ] Logs show no errors
- [ ] Frontend and backend domains match in CORS config
- [ ] HTTPS is enabled (Railway provides free HTTPS)

---

## Support

**Railway Documentation**: https://docs.railway.app
**Video Pool Backend Issues**: Check `.github/workflows/` for CI/CD errors
**Database Issues**: Contact Supabase support

---

**Last Updated**: 2026-02-22
**Build Status**: PASSED (npm run build succeeded, npm run check: 0 errors)
