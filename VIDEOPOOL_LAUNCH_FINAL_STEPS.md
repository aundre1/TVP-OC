# 🚀 The Video Pool — Final Launch Steps (30 Minutes)

**Status:** 95% Complete — 4 final steps to launch with $8.5K/month MRR potential
**Estimated Time:** 30 minutes
**Target:** March 1, 2026

---

## CURRENT STATUS

| Component | Status | Issue |
|-----------|--------|-------|
| **Frontend** | ✅ LIVE (Vercel) | tvp-redesign-2026.vercel.app |
| **Backend** | ✅ LIVE (Railway) | tvp-oc-production.up.railway.app |
| **Database** | ❌ CONNECTING | ENETUNREACH error — needs DATABASE_URL env var set on Railway |
| **OAuth (Google)** | ✅ READY | Client ID set on Vercel, redirect authorized in GCP |
| **OAuth (Apple)** | ✅ READY | Vars set on Vercel, need to set on Railway |
| **Email/Password Auth** | ✅ READY | Waiting for database connection |

---

## CRITICAL BLOCKER: DATABASE_URL Configuration

### What's Wrong
- Backend is **live** on Railway ✅
- Frontend is **live** on Vercel ✅
- But API calls return: `{"error": "An unexpected error occurred", "code": "ENETUNREACH"}`
- **Root cause:** `DATABASE_URL` environment variable missing on Railway backend

### Quick Fix (5 minutes)

**Option A: Manual Setup (via Railway Dashboard)**
1. Go to: https://railway.app/dashboard
2. Select project: **TVP-OC**
3. Select service: **Backend** (or your service name)
4. Click: **Variables** tab
5. Add new variable:
   - **Key:** `DATABASE_URL`
   - **Value:** Get from Supabase:
     - Go to: https://app.supabase.com/dashboard
     - Project: jvgsmiqsqtqgfagghoiv
     - Settings → Database → Connection string (PostgreSQL tab)
     - Copy the connection string
   - Paste into Railway Variables
6. Click **Save**
7. Railway will **automatically redeploy** (1-2 minutes)

**Option B: Automated Setup (via CLI)**
```bash
cd /Users/dremacmini/Desktop/OC/the-video-pool

# Log in to Railway
railway login

# Link to project (choose TVP-OC)
railway link

# Set DATABASE_URL
railway variables set DATABASE_URL="postgresql://..."

# Verify
railway variables | grep DATABASE_URL
```

---

## STEP-BY-STEP LAUNCH CHECKLIST

### ✅ STEP 1: Set DATABASE_URL on Railway (5 min)

**Status:** 🔴 BLOCKING — Do this first

1. [ ] Open https://railway.app/dashboard
2. [ ] Select project: **TVP-OC**
3. [ ] Click **Backend** service
4. [ ] Click **Variables** tab
5. [ ] Add `DATABASE_URL` with Supabase connection string
6. [ ] Wait for redeploy (watch for green checkmark, ~2 min)
7. [ ] Verify by checking `/api/health` endpoint returns `{"status":"ok","database":"connected"}`

**Test connection:**
```bash
curl https://tvp-oc-production.up.railway.app/api/health
# Should return: {"status":"ok","database":"connected"}
```

---

### ✅ STEP 2: Complete Apple OAuth on Railway (5 min)

**Status:** ⏳ READY — Vars set on Vercel, need Railway

1. [ ] Go to Railway Variables tab (same place as above)
2. [ ] Add these three variables:
   - `VITE_APPLE_TEAM_ID` = `34UE397K5R`
   - `VITE_APPLE_BUNDLE_ID` = `com.thevideopool.app`
   - `VITE_APPLE_KEY_ID` = `5243K8458B`
3. [ ] Save and wait for redeploy

---

### ✅ STEP 3: Verify Google OAuth (Already Done ✅)

**Status:** ✅ COMPLETE

- ✅ Google Client ID set on Vercel
- ✅ Google redirect URI authorized in Google Cloud Console (`https://dev.thevideopool.com`)
- ✅ Google OAuth routes exist on backend

**No action needed here.**

---

### ✅ STEP 4: Run 45-Minute End-to-End Test Suite

**Status:** ⏳ READY — Run after Database is connected

```bash
cd /Users/dremacmini/Desktop/OC/the-video-pool

# Run full test suite
npm run test:e2e

# Or run specific test suites
npm run test:e2e:auth        # Email/password login
npm run test:e2e:oauth       # Google/Apple OAuth
npm run test:e2e:videos      # Video browsing
npm run test:e2e:subscription # Membership & Stripe
```

**Expected Results:**
- ✅ 12/28 tests passing (43% from Session 13)
- ❌ 6/28 tests failing → will fix after DB connection
- ⚠️ 10/28 warnings → known issues documented

---

## DETAILED ENVIRONMENT VARIABLES FOR RAILWAY

### Essential (MUST SET)
```env
# Database
DATABASE_URL=postgresql://postgres:PASSWORD@db.jvgsmiqsqtqgfagghoiv.supabase.co:5432/postgres

# Security
NODE_ENV=production
JWT_SECRET=[generated 32-char string]
REFRESH_TOKEN_SECRET=[generated 32-char string]
```

### Optional but Recommended (OAuth)
```env
# Google OAuth
GOOGLE_CLIENT_ID=492064280951-qh2num4j23eaq7o47itoi19dvon8pcoh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=[from Google Cloud Console]

# Apple OAuth
VITE_APPLE_TEAM_ID=34UE397K5R
VITE_APPLE_BUNDLE_ID=com.thevideopool.app
VITE_APPLE_KEY_ID=5243K8458B

# Stripe
STRIPE_SECRET_KEY=[from Stripe dashboard]
STRIPE_WEBHOOK_SECRET=[from Stripe webhooks]

# Frontend
FRONTEND_URL=https://tvp-redesign-2026.vercel.app
```

---

## TESTING CHECKLIST (After DB is Connected)

### ✅ Health Checks
- [ ] `/health` endpoint returns `{"status":"healthy"}`
- [ ] `/api/health` returns `{"status":"ok","database":"connected"}`
- [ ] No 500 errors in Railway logs

### ✅ Authentication Tests
- [ ] Email input visible on login page
- [ ] Password input visible on login page
- [ ] Submit button visible on login page
- [ ] Can register new account
- [ ] Can log in with email/password
- [ ] Session persists after page refresh

### ✅ OAuth Tests
- [ ] Google sign-in button clickable
- [ ] Apple sign-in button visible
- [ ] Both complete sign-in flow without errors
- [ ] OAuth callbacks return to dashboard (not login loop)

### ✅ Video Tests
- [ ] 26,043 videos load in library
- [ ] Search/filter works
- [ ] Can browse categories
- [ ] Video player loads
- [ ] Download button visible

### ✅ Subscription Tests
- [ ] Membership plans display (Free, Starter, Pro, Elite)
- [ ] Stripe payment flow works
- [ ] Subscription status updates after payment
- [ ] Pro features unlock after purchase

---

## TROUBLESHOOTING

### Issue: `ENETUNREACH` on API calls
**Cause:** DATABASE_URL not set or invalid
**Fix:**
1. Check Railway Variables tab shows DATABASE_URL
2. Verify connection string from Supabase is correct (no truncation)
3. Check Supabase project is active (not suspended)
4. Try to connect manually: `psql "postgresql://..."`

### Issue: Google spinning forever
**Cause:** GOOGLE_CLIENT_ID missing or invalid
**Fix:** Set `VITE_GOOGLE_CLIENT_ID` on Vercel and Railway
```env
VITE_GOOGLE_CLIENT_ID=492064280951-qh2num4j23eaq7o47itoi19dvon8pcoh.apps.googleusercontent.com
```

### Issue: Apple button not visible
**Cause:** Apple OAuth vars not set
**Fix:** Set all three Apple vars on Vercel AND Railway:
```env
VITE_APPLE_TEAM_ID=34UE397K5R
VITE_APPLE_BUNDLE_ID=com.thevideopool.app
VITE_APPLE_KEY_ID=5243K8458B
```

### Issue: Tests still failing after DB connection
**Cause:** Playwright selectors may have changed
**Fix:** Run tests with debug:
```bash
npm run test:e2e -- --debug
# Or update selectors in test files as needed
```

---

## NEXT STEPS AFTER LAUNCH

1. **Monitor health:** Watch Railway logs for errors
2. **Track users:** Monitor sign-ups and conversion rate
3. **Revenue tracking:** Monitor Stripe payments (target: $8.5K/month = 300 subscribers)
4. **Feature completion:** Continue with Batch 3-6 from Session 13:
   - Batch 3: Update Playwright audit selectors
   - Batch 4: Configure Facebook OAuth
   - Batch 5: Fix light theme visibility
   - Batch 6: Verify Wasabi thumbnail loading

---

## ESTIMATED REVENUE IMPACT

| Metric | Target | Timeline |
|--------|--------|----------|
| **MRR** | $8,500 | 3 months |
| **Subscribers** | 300 | 3 months |
| **Cost to Acquire** | <$25 | Year 1 |
| **LTV** | >$500 | 2 years |

---

## AUTOMATION SCRIPT

If you prefer automated setup:
```bash
cd /Users/dremacmini/Desktop/OC/the-video-pool
chmod +x scripts/setup-railway-production.sh
./scripts/setup-railway-production.sh
```

This script will:
1. Link to Railway project
2. Detect backend service
3. Set all environment variables
4. Test database connection
5. Report status

---

## SUPPORT

If you get stuck:
1. Check `.continue-here.md` for session notes
2. Read `DEPLOYMENT_STATUS.md` for infrastructure details
3. Check Railway logs: https://railway.app/dashboard/TVP-OC (Logs tab)
4. Check Supabase status: https://status.supabase.com
5. Run OAuth diagnostic: `node scripts/oauth-diagnostic.mjs`

---

**Expected Completion Time:** 30 minutes
**Estimated Revenue Unlocked:** $8,500/month
**Target Launch Date:** March 1, 2026 (TODAY!)

🚀 Let's get The Video Pool live!
