# Railway Deployment Guide - TVP Redesign 2026 Staging

A comprehensive guide to deploying the TVP Redesign 2026 frontend to Railway as a separate staging project.

**Deployment Time:** 5-10 minutes
**Project Type:** Frontend SPA (React + Vite)
**Build Tool:** Vite with TypeScript
**Preview Server:** Vite Preview on Port 4173

---

## Table of Contents

1. [Quick Start (5 Minutes)](#quick-start-5-minutes)
2. [Project Setup in Railway Dashboard](#project-setup-in-railway-dashboard)
3. [GitHub Repository Connection](#github-repository-connection)
4. [Environment Variables](#environment-variables)
5. [Build and Deployment Settings](#build-and-deployment-settings)
6. [Custom Domain Setup](#custom-domain-setup)
7. [Monitoring and Health Checks](#monitoring-and-health-checks)
8. [Troubleshooting](#troubleshooting)
9. [CLI Alternative (Advanced)](#cli-alternative-advanced)

---

## Quick Start (5 Minutes)

### Option A: Web Dashboard (Recommended for First-Time Users)

1. **Go to railway.app and sign up/login**
   - Visit https://railway.app
   - Create account or sign in with GitHub

2. **Create new project**
   - Click "Create New Project" button
   - Select "Deploy from GitHub repo"

3. **Connect GitHub**
   - Click "Deploy from GitHub repo"
   - Select TVP-Redesign-2026 repository
   - Authorize Railway to access your GitHub

4. **Configure Environment Variables**
   - See [Environment Variables](#environment-variables) section below

5. **Deploy**
   - Railway will automatically detect `railway.json`
   - Builds using `railway.Dockerfile`
   - Deployment starts automatically
   - Watch logs in Railway dashboard

---

## Project Setup in Railway Dashboard

### Step 1: Create New Project

1. Log in to [railway.app](https://railway.app)
2. Click the **+ New Project** button in the top right
3. Select **"Deploy from GitHub repo"** option

### Step 2: Select Repository

1. Search for **TVP-Redesign-2026**
2. Click to select the repository
3. Grant Railway permissions if prompted
4. Select **main** or **staging** branch (depends on your workflow)

### Step 3: Configure Build Settings

Railway will automatically detect:
- `railway.json` configuration file
- `railway.Dockerfile` for custom build process
- Environment variables from `.env.local`

**No additional configuration needed** - Railway reads from `railway.json`

### Step 4: Wait for Deployment

- Initial build takes 3-5 minutes
- Watch the build logs in the dashboard
- Deployment completes when you see "Successfully deployed"

---

## GitHub Repository Connection

### Create a Staging Repository (Optional but Recommended)

For a cleaner separation from production:

```bash
# Create a new staging branch
git checkout -b staging
git push -u origin staging

# Or create a separate repository
# 1. Create "TVP-Redesign-Staging" on GitHub
# 2. Add as remote: git remote add staging <url>
# 3. Push: git push staging main
```

### Connect in Railway

1. In Railway project settings
2. Click **"GitHub Settings"**
3. Select repository and branch
4. Enable **"Auto Deploy on Push"** (recommended)

---

## Environment Variables

### Set Variables in Railway Dashboard

1. Go to your Railway project
2. Click **Variables** tab
3. Add the following variables:

#### Staging Environment Variables

```
VITE_API_URL=https://api-staging.thevideopool.com
NODE_ENV=production
VITE_LOG_LEVEL=info
VITE_FEATURE_FLAGS={"beta_features": true}
```

#### Production Environment Variables (When Ready)

```
VITE_API_URL=https://api.thevideopool.com
NODE_ENV=production
VITE_LOG_LEVEL=warn
VITE_FEATURE_FLAGS={"beta_features": false}
```

### Variable Configuration Details

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | `https://api-staging.thevideopool.com` | Backend API endpoint for staging |
| `NODE_ENV` | `production` | Vite build mode optimization |
| `VITE_LOG_LEVEL` | `info` or `warn` | Console logging verbosity |
| `VITE_FEATURE_FLAGS` | JSON object | Feature flag configuration |

### Add Variables via Dashboard

1. Click **"Variables"** tab in project
2. Click **"Raw Editor"** for bulk input:
   ```
   VITE_API_URL=https://api-staging.thevideopool.com
   NODE_ENV=production
   VITE_LOG_LEVEL=info
   ```
3. Click **"Save"**
4. Redeploy for changes to take effect

---

## Build and Deployment Settings

### Docker Build Configuration

The `railway.Dockerfile` handles:

1. **Build Stage (Multi-stage build for efficiency)**
   - Installs Node.js 20 Alpine
   - Runs `npm ci` (clean install)
   - Executes `npm run build`
   - Creates optimized build artifacts in `/app/dist`

2. **Runtime Stage**
   - Lightweight Alpine Linux runtime
   - Installs `serve` for serving static files
   - Copies built assets from builder
   - Exposes port 4173

3. **Health Check**
   - Monitors port 4173 every 30 seconds
   - Fails after 3 retries
   - Ensures Railway keeps service healthy

### railway.json Configuration

The `railway.json` file specifies:

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "railway.Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3,
    "startCommand": "npm run preview"
  }
}
```

**Settings explained:**
- `builder`: Uses custom Dockerfile instead of buildpacks
- `dockerfilePath`: Points to `railway.Dockerfile`
- `restartPolicyType`: Restarts service if it crashes
- `restartPolicyMaxRetries`: Retries up to 3 times before stopping
- `startCommand`: Runs `npm run preview` to start Vite preview server

### Build Performance Optimization

For faster builds:

1. **.dockerignore** (create if needed)
   ```
   node_modules
   .git
   dist
   coverage
   .env.local
   ```

2. **npm ci instead of npm install**
   - Dockerfile uses `npm ci` for reproducible builds
   - Faster and more reliable than `npm install`

---

## Custom Domain Setup

### Configure Custom Domain in Railway

1. Go to Railway project settings
2. Click **"Domains"** tab
3. Click **"+ Add Domain"**
4. Enter **`staging.thevideopool.com`**

### Update DNS Records

In your domain registrar (GoDaddy, Namecheap, Route53, etc.):

1. Add CNAME record:
   - **Host:** `staging`
   - **Points to:** Railway deployment URL (shown in Railway dashboard)
   - **TTL:** 300 (or lowest available)

2. Or use your registrar's DNS manager:
   ```
   Name: staging
   Type: CNAME
   Value: [railway-deployment-url]
   TTL: 300
   ```

3. Wait for DNS propagation (5-30 minutes)

### Verify Custom Domain

```bash
# Check DNS resolution
nslookup staging.thevideopool.com

# Should return Railway's IP address
```

Once DNS resolves, your app is accessible at:
- `https://staging.thevideopool.com`

---

## Monitoring and Health Checks

### View Deployment Logs

1. Click **"Deployments"** tab in Railway project
2. Select the latest deployment
3. Watch **Build Logs** and **Deploy Logs** in real-time

### Common Log Patterns

**Successful build:**
```
- Building...
- npm install/ci completed
- npm run build completed
- Image built successfully
- Container running on port 4173
- Health check passed
```

**Failed build:**
```
- npm ERR! Error installing dependencies
- TypeScript compilation error
- Build process exited with code 1
```

### Health Check Monitoring

Railway automatically monitors:
- **Port 4173** accessibility
- **HTTP 200** response status
- **Service restarts** if unhealthy

View health status in **"Logs"** tab.

### Set Up Alerts (Optional)

1. Go to **"Settings"** > **"Alerts"**
2. Configure notifications for:
   - Deployment failures
   - Service crashes
   - High memory usage

---

## Troubleshooting

### Build Fails with npm ERR

**Problem:** `npm install` fails during Docker build

**Solutions:**
1. Clear Railway cache:
   - Go to **"Settings"** > **"Clear Build Cache"**
   - Redeploy

2. Check dependencies:
   ```bash
   npm ci locally first
   npm list  # Check for conflicts
   ```

3. Verify `package-lock.json` is committed:
   ```bash
   git add package-lock.json
   git commit -m "Update lock file"
   ```

### TypeScript Compilation Error

**Problem:** Build fails with `tsc` error

**Solution:**
1. Run locally: `npm run build`
2. Fix TypeScript errors
3. Commit and push
4. Redeploy

### Service Crashes After Deployment

**Problem:** Deployment completes but service restarts repeatedly

**Check:**
1. Look at **"Logs"** tab for error messages
2. Verify environment variables are set correctly
3. Check if port 4173 is available

**Solution:**
```bash
# Test locally
npm run build
npm run preview
# Visit http://localhost:4173
```

### High Memory Usage

**Problem:** Container keeps restarting with OOM errors

**Solutions:**
1. Check for memory leaks in code
2. Increase Railway plan (Settings > Increase Resources)
3. Optimize build output:
   ```bash
   npm run build -- --mode production
   ```

### DNS Not Resolving

**Problem:** `staging.thevideopool.com` doesn't resolve

**Solutions:**
1. Verify CNAME record is set correctly
2. Wait for DNS propagation (up to 48 hours, usually 5-30 minutes)
3. Test with: `nslookup staging.thevideopool.com`
4. Clear DNS cache locally:
   ```bash
   # macOS
   sudo dscacheutil -flushcache

   # Windows
   ipconfig /flushdns

   # Linux
   sudo systemctl restart systemd-resolved
   ```

---

## CLI Alternative (Advanced)

### Using Railway CLI for Power Users

Install Railway CLI:
```bash
npm install -g railway
# or
brew install railway  # macOS
```

### Login to Railway

```bash
railway login
# Opens browser to authenticate
```

### Initialize Project

```bash
cd /path/to/TVP-Redesign-2026

# Initialize as Railway project
railway init

# Select existing project or create new one
```

### Deploy via CLI

```bash
# Deploy current state
railway up

# Deploy and follow logs
railway up --follow

# View deployment status
railway status

# View logs
railway logs

# Set environment variables
railway variables set VITE_API_URL=https://api-staging.thevideopool.com
railway variables set NODE_ENV=production
```

### Useful CLI Commands

```bash
# View current environment
railway env

# Open project in browser
railway open

# View all projects
railway list

# Switch projects
railway switch

# View logs with tail
railway logs --tail

# Deploy specific branch
railway up --branch staging
```

---

## Post-Deployment Checklist

After deployment completes:

- [ ] Visit staging.thevideopool.com in browser
- [ ] Check console for errors (F12 > Console tab)
- [ ] Verify API calls work (check Network tab)
- [ ] Test authentication if implemented
- [ ] Check responsive design on mobile
- [ ] Verify custom domain resolves
- [ ] Test major features (search, filters, etc.)
- [ ] Monitor logs for errors
- [ ] Set up GitHub auto-deploy (optional)

---

## Performance Baseline

Typical deployment metrics:

| Metric | Value |
|--------|-------|
| Build time | 3-5 minutes |
| Deployment time | 1-2 minutes |
| First page load | <2 seconds |
| Time to Interactive | <3 seconds |
| Total bundle size | ~1.2-1.5 MB (gzipped) |
| Memory usage | 50-150 MB |

---

## Architecture Diagram

```
GitHub Repository
       ↓
   Railway Project
       ↓
   Docker Build (railway.Dockerfile)
       ├─ npm ci
       ├─ npm run build
       └─ Creates dist/ folder
       ↓
   Deploy to Container
       ├─ Copy dist/
       ├─ Start npm run preview (port 4173)
       └─ Health check
       ↓
   CNAME → staging.thevideopool.com
       ↓
   Browser Access
```

---

## Support and Resources

- **Railway Docs:** https://docs.railway.app
- **Docker Docs:** https://docs.docker.com
- **Vite Docs:** https://vitejs.dev
- **Railway Community:** https://railway.app/community

---

## Next Steps

1. Create Railway account at https://railway.app
2. Create new project from GitHub
3. Set environment variables
4. Monitor first deployment
5. Configure custom domain
6. Set up GitHub auto-deploy (recommended)

Happy deploying!

---

**Last Updated:** February 16, 2026
**Project:** TVP Redesign 2026 (Staging)
**Status:** Production Ready
