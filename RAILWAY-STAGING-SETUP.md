# Railway Staging Deployment Setup

## Overview
Deploy the `staging/ui-fixes-feb7` branch to Railway as a separate staging environment.

---

## Step 1: Create Railway Staging Project

### Via Railway Dashboard (Easiest):
1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose: `aundre1/Video-Pool`
5. **IMPORTANT:** Set deployment branch to `staging/ui-fixes-feb7` (not master)
6. Railway will auto-generate a URL like: `https://video-pool-staging.up.railway.app`

### Via Railway CLI (Alternative):
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Link to GitHub repo and set branch
railway link aundre1/Video-Pool
railway environment staging
```

---

## Step 2: Configure Environment Variables

Add these to your Railway staging project:

```env
# Backend API
VITE_API_URL=https://video-pool-production.up.railway.app

# Stripe (use TEST keys for staging!)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # Get from Stripe dashboard

# Build Configuration
NODE_ENV=staging
VITE_ENABLE_DEBUG=true

# Optional: Feature Flags
VITE_SHOW_DEV_BANNER=true
```

**CRITICAL:** Use Stripe **TEST** keys (pk_test_...) for staging so real charges don't happen during testing.

---

## Step 3: Configure Build Settings

Railway should auto-detect Vite, but verify:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run preview
```

**Root Directory:** `/` (or wherever package.json lives)

---

## Step 4: Deploy

1. Push staging branch to GitHub:
   ```bash
   git push origin staging/ui-fixes-feb7
   ```

2. Railway automatically builds and deploys (2-3 minutes)

3. Get your staging URL from Railway dashboard

---

## Step 5: Verify Deployment

Once deployed, test:
- ✅ Homepage loads
- ✅ Can browse videos
- ✅ Table/list/grid views working
- ✅ API calls succeed (check browser console)
- ✅ No console errors

---

## Auto-Deploy Configuration

Railway will auto-deploy when you:
1. Push to `staging/ui-fixes-feb7` branch
2. Changes are detected on GitHub

To trigger manual deploy:
- Click **"Deploy"** in Railway dashboard
- Or: `railway up` via CLI

---

## Database Strategy

**Recommended for UI testing:** Use production database (read-only operations)
- Set `VITE_API_URL=https://video-pool-production.up.railway.app`
- Staging frontend → Production API → Production DB
- Safe because we're only changing UI/CSS, not data operations

**Alternative:** Create staging database
- Clone production database to staging
- Update backend to point at staging DB
- More setup but safer for testing writes/deletes

---

## Cost Estimate

**Railway Free Tier:**
- $5 free credit monthly
- Enough for staging if low traffic
- Staging sleeps after 30 min inactivity (wakes on request)

**Paid:** ~$5-10/month for always-on staging

---

## Promotion to Production

When staging is approved:

```bash
# Merge staging to master
git checkout master
git merge staging/ui-fixes-feb7
git push origin master

# Railway production auto-deploys from master
```

---

## Rollback Plan

If staging breaks:
```bash
git checkout staging/ui-fixes-feb7
git reset --hard origin/master  # Reset to Steve's baseline
git push --force origin staging/ui-fixes-feb7
```

Railway will auto-deploy the rollback.

---

## Quick Reference

| Environment | Branch | URL | Database |
|-------------|--------|-----|----------|
| Production | master | thevideopool.com | Production |
| Staging | staging/ui-fixes-feb7 | [Railway URL] | Production (read) |
| Local Dev | staging/ui-fixes-feb7 | localhost:3001 | Mock/Production |

---

## Next Steps After Staging is Live:

1. Claude implements UI fixes on staging branch
2. Push to GitHub → Railway auto-deploys
3. Test on staging URL
4. Approve → Merge to master → Production deploy
5. Launch! 🚀
