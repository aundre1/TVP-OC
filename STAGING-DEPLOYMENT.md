# Staging Deployment Strategy - The Video Pool

## Overview
Deploy UI fixes to separate staging environment so production (thevideopool.com) remains untouched while we test.

## Branch Structure
```
master                      ← Steve's production code (SAFE)
  └── staging/ui-fixes-feb7 ← Claude's UI fixes (TESTING)
```

## Deployment Options (Ranked by Speed)

### Option 1: Railway Staging Environment (RECOMMENDED - 15 min)
**Pros:** Same infrastructure as production, easy to promote to prod later
**Cons:** Requires Railway account setup

**Steps:**
1. Deploy `staging/ui-fixes-feb7` branch to Railway
2. Railway gives you: `tvp-staging-abc123.railway.app`
3. Point staging at same backend API as production (or create staging API)
4. Test freely without affecting thevideopool.com
5. When ready: merge staging branch to master, redeploy production

**Cost:** Free tier available, ~$5/month for staging if needed

### Option 2: Subdomain (staging.thevideopool.com) - 30 min
**Pros:** Clean URL, professional
**Cons:** Requires DNS + SSL setup

**Steps:**
1. Deploy to Vercel/Netlify from staging branch
2. Configure DNS: `staging.thevideopool.com` → staging deployment
3. Auto-deploy on push to staging branch

### Option 3: Test Route on Production (/staging path) - 10 min
**Pros:** Fastest, no new infrastructure
**Cons:** Could affect production if something breaks badly

**Steps:**
1. Build from staging branch
2. Deploy to `/staging` path on current production server
3. Access via `thevideopool.com/staging`

**⚠️ NOT RECOMMENDED:** Shares same server/database as production

## Recommended: Railway Staging + GitHub

### Setup Flow:
1. **Push to GitHub** (both master and staging branches)
2. **Connect GitHub to Railway:**
   - Create new Railway project: "TVP-Staging"
   - Connect to GitHub repo
   - Set branch: `staging/ui-fixes-feb7`
   - Railway auto-deploys on push
3. **Configure environment variables** (same as production)
4. **Get staging URL:** `https://tvp-staging-xyz.up.railway.app`

### Testing Flow:
1. Make UI changes on staging branch
2. Push to GitHub
3. Railway auto-deploys (2-3 minutes)
4. Test on staging URL
5. If good → merge to master → deploy to production
6. If bad → revert staging branch, start over

## Environment Variables Needed (Staging)

```env
# Backend API
VITE_API_URL=https://api.thevideopool.com  # or staging API if separate

# Stripe (use TEST keys for staging)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Feature Flags (optional)
VITE_ENABLE_DEBUG=true
VITE_SHOW_DEV_TOOLS=true
```

## Database Strategy

**Option A:** Staging uses PRODUCTION database (read-only testing)
- Safe for UI/layout testing
- Don't create test users or downloads on production

**Option B:** Staging uses SEPARATE staging database
- Full testing including writes
- Requires database clone/seed data
- More setup but safer

## What We'll Deploy to Staging:
- ✅ Fixed table/list/grid layouts (proper column spacing)
- ✅ Record Label column added
- ✅ BPM/Genre displayed properly
- ✅ Alternating row colors
- ✅ Proper metadata spread (not squished)
- ✅ All current functionality preserved

## Timeline:
- **Now:** Push code to GitHub
- **+15 min:** Railway staging deployed
- **+30 min:** UI fixes implemented and deployed to staging
- **+1 hour:** Full testing complete on staging URL
- **+1.5 hours:** Merge to master, deploy to production

---

## Next Steps:
1. Get GitHub repo URL from you
2. Push master + staging branches
3. Set up Railway staging deployment
4. Implement UI fixes
5. Test on staging URL
6. Merge when approved
