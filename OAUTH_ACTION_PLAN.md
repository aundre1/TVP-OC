# OAuth Fix — Action Plan (Feb 28, 2026)

## Status: 90% Complete ✅

Code is done. Backend is ready. Now execute these 3 manual steps + 1 automated step.

---

## 📋 Your Action Checklist

### ✅ DONE (by CoCo)
- [x] Apple OAuth frontend code (isAppleConfigured check)
- [x] loginWithApple method (authStore + API)
- [x] Apple SDK loader (index.html)
- [x] Diagnostic tool (scripts/oauth-diagnostic.mjs)
- [x] Setup script (scripts/setup-oauth-env.sh)
- [x] Documentation (OAUTH_FIX_COMPLETE_GUIDE.md)

### ⏳ YOUR TURN (3-5 minutes)

#### Step 1: Get Your Apple Credentials (2 min)

Go to: https://developer.apple.com/account/

Find these three values:
- **Team ID** (e.g., `34UE397K5R`) — Under "Membership"
- **Bundle ID** (e.g., `com.thevideopool.app`) — Under "App IDs" or "Identifiers"
- **Key ID** (e.g., `5243K8458B`) — Under "Keys" → "Auth Key"

**Have these ready for the next step.**

---

#### Step 2: Run Automated Setup (1 min)

```bash
cd /Users/dremacmini/Desktop/OC/the-video-pool
bash scripts/setup-oauth-env.sh
```

**What it does:**
1. Sets `VITE_GOOGLE_CLIENT_ID` on Vercel (for you to confirm)
2. Prompts you to enter Apple credentials
3. Sets Apple env vars on Vercel (for you to confirm)
4. Pushes to main (triggers Vercel redeploy)
5. Sets Apple env vars on Railway (if CLI available)
6. Redeploys Railway backend

**What you'll see:**
```
🚀 OAuth Environment Setup
Setting VITE_GOOGLE_CLIENT_ID on Vercel...
(You may need to confirm in Vercel CLI interactive mode)

Enter VITE_APPLE_TEAM_ID (or press Enter to skip): 34UE397K5R
Enter VITE_APPLE_BUNDLE_ID (or press Enter to skip): com.thevideopool.app
Enter VITE_APPLE_KEY_ID (or press Enter to skip): 5243K8458B

✅ OAuth Setup Complete!
```

---

#### Step 3: Verify Google Redirect URIs (2 min)

Go to: https://console.cloud.google.com/

**Do this:**
1. Select your Google Cloud project
2. Go to: **Credentials** → **OAuth 2.0 Client IDs**
3. Click the "Web client" ID
4. Under **Authorized redirect URIs**, add:
   - `https://dev.thevideopool.com`
   - `https://tvp-redesign-2026.vercel.app`
5. Click **Save**

⚠️ **This is critical** — without this, Google auth will fail.

---

### ✅ Test When All Steps Done (5 min)

```bash
# 1. Run diagnostic
node scripts/oauth-diagnostic.mjs

# 2. Open login page
open https://dev.thevideopool.com/login

# 3. Test each button:
# ✓ Google — should be clickable (not grayed)
# ✓ Apple — should be clickable (not grayed)
# ✓ Facebook — should already work

# 4. Click each one and verify sign-in works
```

---

## 🎯 Quick Reference

**Google OAuth:**
- Client ID: `492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com`
- Env var: `VITE_GOOGLE_CLIENT_ID`
- Status: ✅ Code ready, ⏳ env var needs manual set on Vercel

**Apple OAuth:**
- Env vars: `VITE_APPLE_TEAM_ID`, `VITE_APPLE_BUNDLE_ID`, `VITE_APPLE_KEY_ID`
- Source: https://developer.apple.com/account/
- Status: ✅ Code ready, ⏳ env vars need manual set on Vercel + Railway

**Facebook OAuth:**
- Status: ✅ Already working

---

## 🚨 If Script Fails

**Error: "Vercel CLI not found"**
```bash
npm i -g vercel
vercel login
# Then retry: bash scripts/setup-oauth-env.sh
```

**Error: "Railway CLI not found"**
```bash
# Skip — manually run:
railway variables set VITE_APPLE_TEAM_ID "..."
railway variables set VITE_APPLE_BUNDLE_ID "..."
railway variables set VITE_APPLE_KEY_ID "..."
railway up
```

**Error: Vercel interactive mode**
- Just enter the values when prompted
- Or use Vercel dashboard: https://vercel.com/dashboard/variables?type=env

---

## ✅ When You're Done

All three OAuth methods should work. You'll have:
- ✅ Google Sign In (popup → sign in → redirects)
- ✅ Apple Sign In (popup → sign in → redirects)
- ✅ Facebook Sign In (already working)

Then you can launch! 🚀

---

## 📞 Need Help?

```bash
# Check what's configured
node scripts/oauth-diagnostic.mjs

# Check Vercel env vars
vercel env ls --prod

# Check Railway env vars
railway variables
```

---

**Total time: ~10 minutes**

Start with: `bash scripts/setup-oauth-env.sh` ⬇️
