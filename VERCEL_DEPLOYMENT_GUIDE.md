# Vercel Deployment Guide - TVP-Redesign-2026

Deploy the TVP frontend to Vercel as a quick demo site in parallel with Railway backend.

**Deployment Time**: 2-5 minutes
**Cost**: Free (with optional upgrades)
**Result**: Live shareable URL on vercel.app

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Step 1: Vercel Account Setup](#step-1-vercel-account-setup)
3. [Step 2: Choose Deployment Method](#step-2-choose-deployment-method)
4. [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
5. [Step 4: Set API Endpoint](#step-4-set-api-endpoint)
6. [Step 5: Deploy](#step-5-deploy)
7. [Step 6: Post-Deployment Verification](#step-6-post-deployment-verification)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Project builds locally: `npm run build`
- [ ] No TypeScript errors: `npm run lint` passes
- [ ] GitHub account has the repo pushed (for GitHub import method)
- [ ] Backend API is running (or will be for environment variable)
- [ ] Vercel account signup ready or credentials available

Run local build test:
```bash
npm run build
npm run preview
```

The build output should be in the `dist/` directory and preview should work on `http://localhost:4173`.

---

## Step 1: Vercel Account Setup

### Create Vercel Account

1. Go to **[vercel.com/signup](https://vercel.com/signup)**
2. Click **Continue with GitHub**
3. Authorize Vercel to access your GitHub account (videomixer@gmail.com)
4. Complete signup:
   - Confirm email
   - Create new team or use personal account
   - Accept terms

### Post-Signup

- You'll be redirected to Vercel dashboard
- You should see option to import a project
- Have GitHub credentials ready

**Tip**: Use the same GitHub account (videomixer@gmail.com) for both GitHub and Vercel for seamless integration.

---

## Step 2: Choose Deployment Method

### Method A: GitHub Import (Recommended - Quickest)

**Best for**: First-time deployments, automatic updates on push

#### Steps:

1. **From Vercel Dashboard**:
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Search for `TVP-Redesign-2026` or your repo name
   - Click "Import"

2. **Configure Project**:
   - **Project Name**: `tvp-redesign` (Vercel will auto-assign subdomain)
   - **Framework**: Should auto-detect as "Vite"
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
   - **Install Command**: Leave as default

3. **Environment Variables** (set these):
   ```
   VITE_API_URL = https://api-staging.thevideopool.com
   ```

   Or use your Railway backend URL:
   ```
   VITE_API_URL = https://your-railway-app.up.railway.app
   ```

4. **Click "Deploy"**
   - Vercel will build and deploy automatically
   - Takes 1-2 minutes
   - You'll get a unique URL: `tvp-redesign-XXXXXX.vercel.app`

**Result**:
- ✅ Site deployed
- ✅ Auto-redeploys on git push to main
- ✅ Preview URLs for pull requests
- ✅ Shareable link ready

---

### Method B: Vercel CLI (Fast Alternative)

**Best for**: Developers who prefer command line, quick deployments

#### Prerequisites

```bash
npm install -g vercel
```

#### Steps:

1. **Login to Vercel**:
   ```bash
   vercel login
   ```
   - Choose "Continue with GitHub"
   - Browser opens, authorize and confirm
   - CLI automatically logs in

2. **Deploy**:
   ```bash
   cd /Users/dremacmini/Desktop/OC/TVP-Redesign-2026
   vercel --prod
   ```

3. **During first deployment, you'll be prompted**:
   ```
   ? Set up and deploy "TVP-Redesign-2026"? [Y/n] y
   ? Which scope do you want to deploy to? [your-account]
   ? Link to existing project? [y/N] n
   ? What's your project's name? tvp-redesign
   ? In which directory is your code? ./
   ? Want to modify these settings? [y/N] n
   ```

4. **Add Environment Variables**:
   After deployment, go to Vercel dashboard:
   - Project Settings → Environment Variables
   - Add: `VITE_API_URL = https://api-staging.thevideopool.com`
   - Redeploy (Vercel will redeploy automatically)

**Result**: Live URL in your terminal, ready to share immediately.

---

### Method C: Vercel Dashboard UI (Visual/Easiest)

**Best for**: Users comfortable with web UI, no CLI needed

#### Steps:

1. Go to [vercel.com](https://vercel.com)
2. Login with GitHub
3. Click "Add New..." → "Project"
4. Select "Import Git Repository"
5. Search and select `TVP-Redesign-2026`
6. Fill in project settings (see Method A for details)
7. Click "Deploy"

---

## Step 3: Configure Environment Variables

Your app uses `VITE_API_URL` for the backend API endpoint. This must be configured in Vercel.

### Option A: During Initial Deployment

If using GitHub Import (Method A), add environment variables in the setup form before clicking "Deploy".

### Option B: After Deployment (via Dashboard)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project: `tvp-redesign`
3. Go to **Settings** → **Environment Variables**
4. Click "Add New Environment Variable"
5. Fill in:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://api-staging.thevideopool.com` (or your backend URL)
   - **Environments**: Select all (Production, Preview, Development)
6. Click "Save"
7. Vercel automatically redeploys with new variables

### Option C: Via Vercel CLI

```bash
vercel env add VITE_API_URL
# Enter: https://api-staging.thevideopool.com
# Select environments to add to
```

### Finding Your Backend API URL

- **Railway Staging**: Check your Railway dashboard for the app URL
- **Local Development**: Use `http://localhost:5000` (only works during local development)
- **Production**: Use your actual backend domain once deployed

---

## Step 4: Set API Endpoint

### Using Environment Variables in Your Code

The app already uses environment variables for API configuration. Verify in your code:

**Example in your components**:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://api-staging.thevideopool.com';
```

### Testing Environment Variables

After deployment, check that env vars are loaded:

1. Go to your Vercel deployment URL
2. Open browser DevTools (F12)
3. Check Network tab to verify API calls go to correct endpoint
4. Look at request URLs - should include your `VITE_API_URL`

---

## Step 5: Deploy

### GitHub Import Method (Recommended)

```
Vercel Dashboard → Add New → Project → Import Git Repository
→ Select TVP-Redesign-2026 → Configure → Add env vars → Deploy
```

Takes 2-3 minutes total.

### Vercel CLI Method

```bash
npm install -g vercel
vercel login  # Select "Continue with GitHub"
cd /Users/dremacmini/Desktop/OC/TVP-Redesign-2026
vercel --prod
# Follow prompts, then add env vars in dashboard
```

Takes 1-2 minutes total.

### What Happens During Deployment

1. **Build Phase** (1-2 min):
   ```bash
   npm install
   npm run build  # tsc && vite build
   ```

2. **Output**:
   - TypeScript compilation → JavaScript
   - Vite bundling with code splitting
   - Output to `dist/` directory
   - Assets optimized and minified

3. **Deploy Phase** (30 sec):
   - Files uploaded to Vercel CDN
   - Edge functions configured (if any)
   - SSL certificate generated
   - Live on vercel.app domain

4. **Result**:
   - Unique URL generated: `tvp-redesign-XXXXXX.vercel.app`
   - Or custom domain if configured
   - Shareable immediately

---

## Step 6: Post-Deployment Verification

After deployment completes, verify everything works:

### Checklist

- [ ] **Site Loads**
  - Click deployment URL
  - Page loads without errors
  - Check browser console (F12) for errors

- [ ] **Environment Variables**
  - Vercel Dashboard → Settings → Environment Variables
  - Confirm `VITE_API_URL` is set
  - Go to site and verify API calls work (Network tab in DevTools)

- [ ] **API Connectivity**
  - Open DevTools → Network tab
  - Trigger an API action (login, fetch data, etc.)
  - Check request URL includes correct API endpoint
  - Verify response status is 200/201 (not 4xx/5xx)

- [ ] **Build Success**
  - Vercel Dashboard → Deployments
  - Latest deployment should show green checkmark
  - Click to view build logs - should show:
    ```
    ✓ Compiled successfully
    ✓ Built with npm run build
    ✓ Ready to deploy
    ```

- [ ] **No Console Errors**
  - Visit site in browser
  - Open DevTools → Console tab
  - Should show no red error messages
  - Warnings are okay (yellow)

- [ ] **Get Shareable URL**
  - URL format: `https://tvp-redesign-XXXXXX.vercel.app`
  - Copy and share with team
  - Can add custom domain later

### Example Verification Log

```
✓ Deployment URL: https://tvp-redesign-abc123.vercel.app
✓ Environment: VITE_API_URL = https://api-staging.thevideopool.com
✓ Build: 127 files, dist/ folder ready
✓ API: Calls going to correct backend
✓ Console: No errors, warnings only
✓ Time to deploy: 2:45
```

---

## Domain Configuration (Optional)

### Use Default Vercel Subdomain (Free)

Your deployment is already live at:
```
https://tvp-redesign-XXXXXX.vercel.app
```

This is perfect for staging/demo purposes.

### Add Custom Domain (Advanced)

To use `staging.thevideopool.com`:

1. **Vercel Dashboard** → Project Settings → Domains
2. Click "Add Domain"
3. Enter: `staging.thevideopool.com`
4. Follow DNS setup instructions:
   - Add `CNAME` record to your domain provider (GoDaddy, Route 53, etc.)
   - Point to Vercel's servers
   - Wait for DNS propagation (5-30 minutes)
5. Vercel will generate SSL cert automatically

### Preview Deployments (Free)

Every pull request automatically gets a preview URL:
- Create PR on GitHub
- Vercel bot automatically deploys
- Click "View Preview" button
- Get shareable staging URL for that PR
- Perfect for testing before merging

---

## Troubleshooting

### Build Fails

**Error**: "Build step failed"

**Solution**:
1. Check build logs in Vercel Dashboard
2. Run locally first: `npm run build`
3. Fix errors locally, push to GitHub
4. Vercel will auto-redeploy

**Common causes**:
- TypeScript errors: `npm run lint`
- Missing dependencies: `npm install`
- Environment variables not set

### API Calls Fail

**Error**: "Failed to fetch from API" or CORS errors

**Solutions**:

1. **Check Environment Variable**:
   - Vercel Dashboard → Settings → Environment Variables
   - Verify `VITE_API_URL` is set
   - Redeploy if changed

2. **Check Backend CORS**:
   - Backend must allow requests from your Vercel domain
   - Add to backend CORS settings:
     ```
     https://tvp-redesign-XXXXXX.vercel.app
     https://*.vercel.app
     ```

3. **Verify Backend is Running**:
   - Check that your Railway/backend app is deployed
   - Test API directly: `curl https://your-api.com/health`

### Blank Page or 404

**Error**: Site loads but shows blank page or "Not Found"

**Solution**:
1. Check that `dist/` folder has `index.html`
2. Verify build output directory is `dist` (not `build`)
3. Redeploy: Vercel Dashboard → Deployments → click latest → "Redeploy"

### Environment Variables Not Working

**Error**: Code can't access `import.meta.env.VITE_API_URL`

**Solution**:
1. Ensure variable name starts with `VITE_` (Vite requirement)
2. Check variable is set in all environments (Production, Preview, Development)
3. Redeploy after adding variables
4. Check browser console - should see API URL logged

**Debug**:
Add temporary log in your app:
```typescript
console.log('API_URL:', import.meta.env.VITE_API_URL);
```

### Slow Deployments

**Issue**: Deploy taking >5 minutes

**Causes & Solutions**:
- First build is slower (caches build)
- Large node_modules
- Network issues

**Speed up**:
- Vercel caches builds automatically
- Subsequent deploys are faster
- Can't reduce on free tier

### Custom Domain Not Working

**Error**: Domain times out or shows "not found"

**Solution**:
1. DNS changes take 5-30 minutes
2. Clear browser cache (Cmd+Shift+R on Mac)
3. Check DNS configuration in Vercel Dashboard
4. Verify domain registrar shows correct CNAME

---

## Advanced: Parallel Deployment with Railway

Deploy both frontend (Vercel) and backend (Railway) simultaneously:

### Setup

**Vercel (Frontend)**:
- Framework: Vite
- Build: `npm run build`
- Output: `dist/`
- Deploy time: ~2 min

**Railway (Backend)**:
- Deploy in parallel
- Note the backend URL
- Pass to Vercel as `VITE_API_URL`

### Environment Variable Flow

```
Vercel Dashboard
    ↓
VITE_API_URL = "https://backend-railway-url.railway.app"
    ↓
Frontend code (import.meta.env.VITE_API_URL)
    ↓
API calls to Railway backend
    ↓
Data fetched and displayed
```

### Testing Both Together

1. Deploy backend to Railway
2. Get Railway app URL (e.g., `https://tvp-api-prod.up.railway.app`)
3. Deploy frontend to Vercel
4. Set `VITE_API_URL` to Railway URL
5. Test API calls in browser DevTools

---

## Post-Deployment Next Steps

After successful deployment:

1. **Share URL with Team**
   ```
   https://tvp-redesign-abc123.vercel.app
   ```

2. **Set Up Custom Domain** (optional)
   - Add `staging.thevideopool.com`
   - Configure DNS

3. **Enable Auto-Deploys** (already done with GitHub import)
   - Every push to main branch auto-deploys
   - No manual action needed

4. **Monitor Deployments**
   - Vercel Dashboard → Deployments
   - See all versions and their status
   - Rollback to previous version if needed

5. **Add Team Members**
   - Vercel Dashboard → Settings → Members
   - Invite team to view/manage deployments

6. **Set Up Analytics** (optional)
   - Vercel automatically tracks:
     - Page load performance
     - Requests per second
     - Error rates

---

## Quick Reference: Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Add environment variable
vercel env add VITE_API_URL

# View logs
vercel logs

# View deployment status
vercel status
```

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vite Guide**: https://vitejs.dev/guide/
- **TVP Project**: `/Users/dremacmini/Desktop/OC/TVP-Redesign-2026`
- **Build Config**: `/vite.config.ts`
- **Environment Vars**: `import.meta.env.*`

---

## Deployment Checklist Summary

```
PRE-DEPLOYMENT
[ ] npm run build works locally
[ ] npm run lint passes
[ ] GitHub repo is up to date
[ ] Backend URL identified

DEPLOYMENT
[ ] Vercel account created
[ ] GitHub connected to Vercel
[ ] Project imported
[ ] Environment variables set
[ ] Deploy button clicked
[ ] Wait 2-3 minutes

POST-DEPLOYMENT
[ ] Site loads without errors
[ ] API calls work
[ ] Environment variables verified
[ ] No console errors
[ ] URL is shareable
[ ] Team informed
```

---

**Last Updated**: February 2026
**Status**: Ready to deploy
**Estimated Time**: 5 minutes total
