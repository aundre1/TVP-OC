# GitHub Secrets Setup — Auto-Deployment Configuration

**Last Updated:** February 22, 2026
**Status:** Required for automatic deployment to Vercel and Railway
**Timeline:** 10-15 minutes
**Automation:** Fully automated after setup (push → auto-deploy)

---

## Overview

GitHub Secrets allow us to:
1. **Trigger auto-deployments** when you push code
2. **Securely store credentials** (never exposed in code or logs)
3. **Auto-inject environment variables** into Vercel and Railway

After setup:
```
git push → GitHub Actions runs → Deploy to Vercel + Railway (parallel)
         → Both live in 5-8 minutes
         → No manual commands needed
```

---

## Step 1: Generate Vercel Token

**Time: 2 minutes**

### Go to Vercel Settings
```
https://vercel.com/account/tokens
```

### Create New Token
1. Click **"Create New"** button (top right)
2. Name: `github-actions-tvp` (or your preference)
3. Token Type: **Scoped Token**
4. Select Scopes: Check all these:
   - ✅ `read`
   - ✅ `write`
   - ✅ `deployments`
   - ✅ `deployments_write`
5. Click **"Create"**
6. **Copy the token** (it won't show again)
7. Save it temporarily (you'll paste it in Step 3)

Example token: `ABCDEfghijklmnopqrstuvwxyz1234567890`

---

## Step 2: Get Vercel Project IDs

**Time: 2 minutes**

### Go to Vercel Dashboard
```
https://vercel.com/dashboard
```

### Find TVP-OC Project
1. Click on your **TVP-OC** project
2. Go to **Settings** (top navigation)
3. Click **"General"** in sidebar

### Copy IDs
You'll see these on the General page:

**Project ID:**
```
prj_tRsJcMGySrU1hFZwerQkVQMJVXSo
```
(Copy this value)

**Org ID (under Team):**
```
team_o9AesGMQZe93lCrBGqOsc163
```
(Copy this value)

---

## Step 3: Get Railway Token

**Time: 2 minutes**

### Go to Railway Settings
```
https://railway.app/settings/tokens
```

### Create New Token
1. Click **"Create New"** (top right area)
2. Name: `github-actions-tvp`
3. Token Type: **API Token**
4. Scope: Make sure it includes:
   - ✅ Write access to your projects
   - ✅ Deployment management
5. Click **"Create"**
6. **Copy the token** (save it temporarily)

Example: `ABCDEfg.hijklmnopqrstuvwxyz1234567890==`

---

## Step 4: Add Secrets to GitHub

**Time: 5 minutes**

### Go to GitHub Repository Settings
```
https://github.com/aundre1/TVP-OC/settings/secrets/actions
```

### Add Each Secret (4 total)

For each secret below:
1. Click **"New repository secret"** (green button, top right)
2. **Name:** Paste exactly as shown
3. **Value:** Paste the token/ID from steps 1-3
4. Click **"Add secret"**

#### Secret 1: Vercel Token
| Field | Value |
|-------|-------|
| **Name** | `VERCEL_TOKEN` |
| **Value** | Your Vercel token from Step 1 |

#### Secret 2: Vercel Org ID
| Field | Value |
|-------|-------|
| **Name** | `VERCEL_ORG_ID` |
| **Value** | Your Org ID from Step 2 (team_xxx) |

#### Secret 3: Vercel Project ID
| Field | Value |
|-------|-------|
| **Name** | `VERCEL_PROJECT_ID` |
| **Value** | Your Project ID from Step 2 (prj_xxx) |

#### Secret 4: Railway Token
| Field | Value |
|-------|-------|
| **Name** | `RAILWAY_TOKEN` |
| **Value** | Your Railway token from Step 3 |

### Verification
After adding all 4 secrets, you should see:
```
VERCEL_TOKEN                ••••••••••••••••
VERCEL_ORG_ID               ••••••••••••••••
VERCEL_PROJECT_ID           ••••••••••••••••
RAILWAY_TOKEN               ••••••••••••••••
```

All 4 should be listed with dots (secrets are masked).

---

## Step 5: Test the Setup

**Time: 2 minutes**

### Make a Test Commit
```bash
cd /Users/dremacmini/Desktop/OC/video-pool

# Make a small change (e.g., add a comment)
echo "# Test deployment" >> README_DEPLOYMENT_TEST.md

# Commit and push
git add README_DEPLOYMENT_TEST.md
git commit -m "test: verify auto-deployment setup"
git push origin main
```

### Watch the Action
1. Go to: https://github.com/aundre1/TVP-OC/actions
2. You should see a new workflow running
3. Watch both jobs:
   - **deploy-vercel** (2-3 min)
   - **deploy-railway** (5-8 min)
4. Both should have green checkmarks ✅

### Check Live URLs
- **Vercel:** https://tvp-oc.vercel.app
- **Railway:** Check your Railway dashboard for the live URL

---

## What Each Secret Does

| Secret | Used By | Purpose |
|--------|---------|---------|
| `VERCEL_TOKEN` | Vercel CLI | Authenticates deployment requests |
| `VERCEL_ORG_ID` | Vercel CLI | Identifies your org |
| `VERCEL_PROJECT_ID` | Vercel CLI | Identifies the TVP-OC project |
| `RAILWAY_TOKEN` | Railway CLI | Authenticates deployment requests |

---

## GitHub Actions Workflows

Your setup includes **2 workflows** that run automatically:

### Workflow 1: `deploy-vercel.yml`
**What:** Deploys frontend to Vercel
```yaml
Trigger: git push to main or any branch
Steps:
  1. Checkout code
  2. Install dependencies
  3. Build (npm run build)
  4. Deploy to Vercel
Time: 2-3 minutes
Result: https://tvp-oc.vercel.app
```

### Workflow 2: `deploy-railway.yml`
**What:** Deploys to Railway (backend + frontend both)
```yaml
Trigger: git push to main or any branch
Steps:
  1. Checkout code
  2. Authenticate with Railway token
  3. Deploy project
Time: 5-8 minutes
Result: Check Railway dashboard for URL
```

**Both run in parallel** (you don't wait for one to finish before the other starts).

---

## How to Monitor Deployments

### Option 1: GitHub Actions (see logs)
```
https://github.com/aundre1/TVP-OC/actions
```
- Shows real-time logs
- See which step is running
- View errors if deployment fails

### Option 2: Vercel Dashboard (see live site)
```
https://vercel.com/dashboard
```
- Click TVP-OC project
- See deployment history
- View live preview
- Custom domain settings

### Option 3: Railway Dashboard (see live site)
```
https://railway.app/dashboard
```
- Click your TVP project
- See deployment status
- View logs
- Custom domain settings

---

## Troubleshooting

### Issue: Secrets not working?
**Solution:**
1. Verify spelling: `VERCEL_TOKEN` (exact case)
2. Check token is current (some tokens expire)
3. Regenerate token and update secret

### Issue: Vercel deployment fails
**Common causes:**
- Wrong Project ID or Org ID
- Build command fails locally
- Node version mismatch

**Debug:**
1. Check workflow logs: https://github.com/aundre1/TVP-OC/actions
2. Run locally: `npm run build`
3. Check Vercel build logs

### Issue: Railway deployment fails
**Common causes:**
- Invalid Railway token (expired or no permissions)
- Environment variables missing
- Docker build issues

**Debug:**
1. Check workflow logs: https://github.com/aundre1/TVP-OC/actions
2. Check Railway logs: https://railway.app/dashboard
3. Verify Railway environment variables are set

### Issue: Workflow doesn't run at all
**Solution:**
1. Check GitHub Actions is enabled
2. Go to: https://github.com/aundre1/TVP-OC/actions
3. Click "Enable workflows" if disabled
4. Re-push a commit

---

## After Setup: Your Workflow

### Before (Manual)
```bash
git push
# Wait for GitHub
npm run build  # Manual local build
vercel --prod  # Manual Vercel deploy
railway deploy # Manual Railway deploy
# Total: 20+ minutes of waiting
```

### After (Automatic)
```bash
git push
# GitHub Actions automatically:
#  → Builds code
#  → Deploys to Vercel (2-3 min)
#  → Deploys to Railway (5-8 min)
# Total: 5-8 minutes, zero manual work
```

You literally just push code and wait. Done.

---

## Security Best Practices

✅ **DO:**
- Keep tokens secret (GitHub masks them)
- Rotate tokens periodically (every 90 days recommended)
- Use scoped tokens (only needed permissions)
- Monitor action logs for suspicious activity

❌ **DON'T:**
- Share tokens with anyone
- Paste tokens in code/comments
- Log tokens in error messages
- Use the same token for multiple services

---

## Verification Checklist

- [ ] Vercel token created and copied
- [ ] Vercel Org ID copied
- [ ] Vercel Project ID copied
- [ ] Railway token created and copied
- [ ] 4 secrets added to GitHub (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, RAILWAY_TOKEN)
- [ ] Test commit pushed successfully
- [ ] Deploy-vercel workflow completed (green checkmark)
- [ ] Deploy-railway workflow completed (green checkmark)
- [ ] Vercel deployment live at https://tvp-oc.vercel.app
- [ ] Railway deployment live (check dashboard)

---

## Next Steps

Once verified:

1. **Backend setup:** See `RAILWAY_SETUP.md`
2. **Database setup:** See `SUPABASE_SETUP.md`
3. **Pre-launch checks:** See `LAUNCH_CHECKLIST.md`

---

## Reference URLs

| Resource | URL |
|----------|-----|
| Vercel Tokens | https://vercel.com/account/tokens |
| Vercel Dashboard | https://vercel.com/dashboard |
| Vercel TVP-OC Project | https://vercel.com/dashboard/tvp-oc |
| Railway Settings | https://railway.app/settings/tokens |
| Railway Dashboard | https://railway.app/dashboard |
| GitHub Secrets | https://github.com/aundre1/TVP-OC/settings/secrets/actions |
| GitHub Actions | https://github.com/aundre1/TVP-OC/actions |
| Repository | https://github.com/aundre1/TVP-OC |

---

**Status: Follow these steps in order. All 4 secrets are required for automation to work.**

**Once done: Every push = auto-deployed. No more manual work. 🚀**
