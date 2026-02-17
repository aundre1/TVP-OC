# Vercel Deployment Checklist

One-page checklist for TVP-Redesign-2026 deployment.

---

## Pre-Deployment (Do This First)

```
PRE-FLIGHT CHECK
[ ] Project builds locally: npm run build
[ ] No linting errors: npm run lint
[ ] Preview works: npm run preview
[ ] GitHub repo is up to date
[ ] All changes committed and pushed
```

**If any failed**: Fix locally before proceeding. Push to GitHub and test again.

---

## Vercel Account Setup

```
ACCOUNT SETUP
[ ] Go to vercel.com/signup
[ ] Sign in with GitHub (videomixer@gmail.com)
[ ] Authorize Vercel to access GitHub
[ ] Verify email
[ ] Login to Vercel dashboard
```

**Takes**: 3-5 minutes

---

## Choose Deployment Method

### Method 1: GitHub Import (Recommended)

```
GITHUB IMPORT DEPLOYMENT
[ ] Vercel Dashboard opened
[ ] Click "Add New" → "Project"
[ ] Click "Import Git Repository"
[ ] Search for "TVP-Redesign-2026"
[ ] Click "Import"
[ ] Project name: tvp-redesign (or auto-fill)
[ ] Framework: Should auto-detect "Vite"
[ ] Build Command: npm run build (auto-filled)
[ ] Output Directory: dist (auto-filled)
[ ] Add Environment Variable:
    ├─ Name: VITE_API_URL
    ├─ Value: https://api-staging.thevideopool.com
    └─ Environments: Production, Preview, Development (all checked)
[ ] Click "Deploy"
[ ] Wait for green checkmark (2-3 minutes)
[ ] Copy deployment URL
```

**Takes**: 2-3 minutes

### Method 2: Vercel CLI

```
CLI DEPLOYMENT
[ ] npm install -g vercel
[ ] vercel login
[ ] Select "Continue with GitHub"
[ ] Browser opens, authorize and confirm
[ ] Terminal shows: "✓ Logged in"
[ ] cd /Users/dremacmini/Desktop/OC/TVP-Redesign-2026
[ ] vercel --prod
[ ] Answer prompts (or accept defaults)
[ ] Wait for build (1-2 minutes)
[ ] Copy deployment URL from terminal
[ ] Go to Vercel Dashboard
[ ] Settings → Environment Variables
[ ] Add: VITE_API_URL = https://api-staging.thevideopool.com
[ ] Redeploy: Deployments → latest → Redeploy
```

**Takes**: 3-4 minutes

---

## Environment Variables (Do This After Deploy)

```
IF USING GITHUB IMPORT
[ ] Environment variable already set during deployment
[ ] Skip to "Verification"

IF USING CLI OR FORGOT TO ADD
[ ] Go to Vercel Dashboard
[ ] Click project: tvp-redesign
[ ] Settings tab
[ ] Environment Variables (left menu)
[ ] Add New Environment Variable:
    ├─ Name: VITE_API_URL
    ├─ Value: https://api-staging.thevideopool.com
    └─ Environments: Check all three
[ ] Save
[ ] Go to Deployments
[ ] Click latest deployment
[ ] Click "Redeploy"
[ ] Wait for new build (1-2 minutes)
```

**Takes**: 2-3 minutes

---

## Verification (Do This Right After Deploy)

```
IMMEDIATE VERIFICATION
[ ] Deployment shows green checkmark
[ ] Copy deployment URL
[ ] Open URL in new browser tab
[ ] Wait for page to load (5-10 seconds)

LOADING CHECK
[ ] Page is NOT blank
[ ] Page is NOT showing 404
[ ] TVP interface is visible
[ ] No spinning loading indicator (should load fully)

CONSOLE CHECK (Press F12)
[ ] DevTools opens
[ ] Go to Console tab
[ ] Look for RED ERROR MESSAGES
    ├─ If red errors: Note the error message
    ├─ See Troubleshooting guide
    └─ Don't continue until fixed
[ ] Yellow warnings are OK
[ ] Check API URL:
    ├─ Run: import.meta.env.VITE_API_URL
    └─ Should show: https://api-staging.thevideopool.com

NETWORK CHECK
[ ] Still in DevTools
[ ] Go to Network tab
[ ] Click a link in the app
[ ] Or trigger an API action (login, search, etc.)
[ ] Look for network request to API
    ├─ Request URL should include your API domain
    ├─ Response status should be 200 (green)
    ├─ If 4xx/5xx: API error, check backend
    └─ If CORS error: See Troubleshooting

FUNCTIONALITY CHECK
[ ] Homepage loads and looks right
[ ] Click links, navigate between pages
[ ] Each page loads without 404
[ ] Try a feature that uses the API
    ├─ Should fetch data
    ├─ Should display results
    └─ No errors in console
```

**Takes**: 2-3 minutes

---

## Post-Deployment

```
SHARE WITH TEAM
[ ] Copy deployment URL
[ ] Share in Slack/email with team
[ ] Format: https://tvp-redesign-XXXXX.vercel.app
[ ] Include in project documentation

MONITOR FIRST HOUR
[ ] Check Vercel dashboard for errors
[ ] Monitor console for issues
[ ] Test multiple scenarios
[ ] Ensure backend is running

SET UP AUTO-REDEPLOY (if using GitHub)
[ ] Vercel automatically watches GitHub
[ ] Every push to main auto-deploys
[ ] No manual action needed
[ ] Verify next push auto-deploys

OPTIONAL: ADD CUSTOM DOMAIN
[ ] Vercel Dashboard → Settings → Domains
[ ] Click "Add Domain"
[ ] Enter: staging.thevideopool.com
[ ] Follow DNS setup instructions
[ ] Wait 5-30 minutes for DNS
```

---

## If Something Goes Wrong

```
BLANK PAGE / 404 ERROR
[ ] Open Vercel Dashboard
[ ] Go to Deployments
[ ] Click latest deployment
[ ] Look at build log
[ ] Note any error messages
[ ] See VERCEL_TROUBLESHOOTING.md
[ ] Fix locally and push to GitHub
[ ] Vercel auto-redeploys

API CALLS FAILING
[ ] Open DevTools → Console
[ ] Check VITE_API_URL: import.meta.env.VITE_API_URL
[ ] If undefined: Add env var to Vercel (see above)
[ ] If wrong value: Update in Vercel Dashboard
[ ] Open Network tab
[ ] Check request URL and response status
[ ] If CORS error: Backend needs CORS config
[ ] If timeout: Backend might be down

TYPESCRIPT ERRORS
[ ] npm run lint (shows errors)
[ ] Fix errors in code
[ ] npm run build (verify fix works)
[ ] git push (auto-redeploys)

ENVIRONMENT VARIABLE NOT WORKING
[ ] Check spelling: VITE_API_URL (case sensitive)
[ ] Check it's in Vercel Dashboard
[ ] Clear browser cache: Cmd+Shift+R
[ ] Redeploy from Vercel
[ ] Check in console: import.meta.env.VITE_API_URL

NEED TO ROLLBACK
[ ] Vercel Dashboard → Deployments
[ ] Find last working version
[ ] Click it
[ ] Click "Redeploy"
[ ] Takes <1 minute
```

---

## Success Checklist

You're done when ALL of these are true:

```
FINAL VERIFICATION
[ ] Deployment URL works in browser
[ ] Page loads without blank/404
[ ] No red errors in console
[ ] Navigation links work
[ ] API calls go to correct backend (check Network tab)
[ ] Can perform basic app functions
[ ] Team has the shareable URL
[ ] README/wiki updated with link
```

---

## Quick Commands

```bash
# Test locally first
npm run build && npm run lint && npm run preview

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# View logs
vercel logs

# Check environment
vercel env ls
```

---

## Support Docs

All documents in: `/Users/dremacmini/Desktop/OC/TVP-Redesign-2026/`

- **VERCEL_QUICK_START.md** - 5-minute summary (START HERE)
- **VERCEL_DEPLOYMENT_GUIDE.md** - Detailed step-by-step
- **VERCEL_ENV_CONFIG.md** - Environment variables reference
- **VERCEL_TROUBLESHOOTING.md** - Problem solving
- **VERCEL_SUMMARY.md** - Overview and FAQ
- **VERCEL_CHECKLIST.md** - This file

---

## Key Contacts

- **Vercel Support**: https://vercel.com/help
- **Backend/API Issues**: Contact Steve or backend team
- **GitHub Issues**: Create issue in TVP-Redesign-2026 repo

---

## Time Estimates

| Task | Time |
|------|------|
| Pre-flight check | 2 min |
| Vercel account | 3 min |
| Deploy | 3 min |
| Env variables | 2 min |
| Verify | 3 min |
| **Total** | **13 min** |

---

## Remember

- [ ] **Pre-flight first**: npm run build must work
- [ ] **Choose one method**: GitHub import or CLI
- [ ] **Add env vars**: VITE_API_URL is required
- [ ] **Verify everything**: Check console, network, features
- [ ] **Share the URL**: That's your demo link
- [ ] **No manual redeploys needed**: GitHub push auto-deploys

---

**Deployment Status**: READY
**Last Updated**: February 2026
**Estimated Time**: 13 minutes total
