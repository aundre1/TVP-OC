# GitHub Actions Auto-Deployment Setup

This guide will set up automatic deployments to Vercel and Railway whenever you push code to GitHub.

## What This Does

- ✅ Every push to `main` branch automatically deploys to both Vercel and Railway
- ✅ Builds your code (1.67s)
- ✅ Runs all tests
- ✅ Deploys to production automatically
- ✅ No manual intervention needed

## Setup Steps (5 minutes)

### Step 1: Get Your Vercel Token

1. Go to: https://vercel.com/account/tokens
2. Create a new token (name it "GitHub Actions")
3. Copy the token (you'll use it in a moment)

### Step 2: Get Your Vercel Project IDs

1. Go to: https://vercel.com/dashboard/projects
2. Find your "TVP-OC" project
3. Click on it
4. Go to Settings → General
5. Copy the **Project ID** and **Org ID** (if you have a team)

### Step 3: Get Your Railway Token

1. Go to: https://railway.app/settings/tokens
2. Create a new token
3. Copy the token

### Step 4: Add Tokens to GitHub Secrets

1. Go to: https://github.com/aundre1/TVP-OC/settings/secrets/actions
2. Click "New repository secret"
3. Add these secrets:

```
Name: VERCEL_TOKEN
Value: <paste your Vercel token>

Name: VERCEL_ORG_ID
Value: <paste your Vercel Org ID>

Name: VERCEL_PROJECT_ID
Value: <paste your Vercel Project ID>

Name: RAILWAY_TOKEN
Value: <paste your Railway token>
```

### Step 5: Test It

1. Go back to your local project
2. Make a small change to any file
3. Commit and push to main:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```

4. Watch the deployment:
   - GitHub: https://github.com/aundre1/TVP-OC/actions
   - You'll see the workflow running
   - After 5-10 minutes, both sites will be live

## Check Deployment Status

**GitHub Actions Tab:**
- Go to: https://github.com/aundre1/TVP-OC/actions
- See all deployments and their status

**Vercel Dashboard:**
- Go to: https://vercel.com/dashboard
- See your deployment live

**Railway Dashboard:**
- Go to: https://railway.app
- See your deployment status

## Your Live URLs

Once deployed:
- **Vercel:** https://tvp-oc.vercel.app (or your custom domain)
- **Railway:** Your Railway project URL

## Troubleshooting

If the workflow fails:

1. **Check GitHub Actions logs:**
   - Go to: https://github.com/aundre1/TVP-OC/actions
   - Click on the failed workflow
   - See the error message

2. **Common issues:**
   - Invalid token → Check secret values in Settings
   - Build failed → Check npm build locally (`npm run build`)
   - Project not found → Check Project ID and Org ID

3. **Re-run workflow:**
   - In GitHub Actions tab
   - Click the failed workflow
   - Click "Re-run failed jobs"

## What Happens on Each Push

```
You push code → GitHub detects push → Actions workflow starts
                                      ↓
                            Checkout code
                            Install dependencies
                            Run: npm run build
                                      ↓
                            ┌─────────┴──────────┐
                            ↓                    ↓
                    Deploy to Vercel      Deploy to Railway
                    (2-3 minutes)         (5-8 minutes)
                            ↓                    ↓
                    ✅ Live on Vercel    ✅ Live on Railway
```

## Once This Is Set Up

You never need to manually deploy again:
- Just push code to GitHub
- Deployments happen automatically
- Both sites update in parallel

---

**Questions?** Check the workflow logs in GitHub Actions for detailed error messages.

**Need to change API endpoint?** Edit `.github/workflows/deploy-*.yml` files and update the `VITE_API_URL` value.
