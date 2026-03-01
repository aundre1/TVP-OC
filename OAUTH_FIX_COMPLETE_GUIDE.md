# OAuth Fix — Complete Guide (Feb 28, 2026)

## Executive Summary

**Problem:** Google OAuth spins instead of completing; Apple OAuth grayed out
**Root Cause:** `VITE_GOOGLE_CLIENT_ID` not set on Vercel; Apple OAuth not wired
**Status:** Code fixes DONE ✅ | Env vars need manual setup ⏳

---

## ✅ Code Fixes (DONE — Commit 48c7f2e)

### What Was Fixed

1. **Apple OAuth Frontend Wiring** ✅
   - Changed `available: false` → `isAppleConfigured` check
   - Added Apple SDK loader in `index.html`
   - Wired `handleAppleClick` handler
   - Added `loginWithApple` to authStore + API

2. **Frontend OAuth Components** ✅
   - `SocialLoginGrid.tsx` — 3/3 methods configured
   - `authStore.ts` — all OAuth methods defined
   - `auth.ts` — all API endpoints defined

3. **Backend Routes** ✅
   - `/api/auth/google` — exists (validates Google token)
   - `/api/auth/facebook` — exists (validates Facebook token)
   - `/api/auth/apple` — exists (validates Apple JWT)

4. **Diagnostic Tool** ✅
   - `scripts/oauth-diagnostic.mjs` — checks your setup

---

## 🔴 CRITICAL: Manual Env Var Setup (DO THIS NOW)

### Issue #1: `VITE_GOOGLE_CLIENT_ID` Not Set on Vercel

**Why it's broken:** Your frontend code checks:
```typescript
const isGoogleConfigured = !!(
  OAUTH_CONFIG.google.clientId &&
  OAUTH_CONFIG.google.clientId !== 'your-client-id-here'
);
```

If `VITE_GOOGLE_CLIENT_ID` env var isn't on Vercel, it defaults to `'your-client-id-here'` → `isGoogleConfigured` = `false` → Google hook never mounts → button click does nothing → infinite spin.

**Fix (2 minutes):**

1. Go to: https://vercel.com/dashboard/variables?type=env
2. Select project: **tvp-redesign-2026**
3. Create **NEW** environment variable:
   - **Name:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** `492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com`
   - **Environment:** Select "Production"
4. Click "Save" + Redeploy frontend:
   ```bash
   git push origin main
   # Vercel auto-redeploys on git push
   ```
5. ✅ Test: Visit https://dev.thevideopool.com/login → Google button should be CLICKABLE (not grayed out)

---

### Issue #2: Google OAuth Redirect URIs Missing

**Why it matters:** Google needs to know which URLs to redirect to after auth.

**Fix (3 minutes):**

1. Go to: https://console.cloud.google.com/
2. Select project: **Google Cloud Project for The Video Pool**
3. Navigate to: **Credentials** → **OAuth 2.0 Client IDs** → **Web client**
4. Under **Authorized redirect URIs**, add these two:
   - `https://dev.thevideopool.com`
   - `https://tvp-redesign-2026.vercel.app`
5. Click "Save"
6. ✅ Test: Google popup should open (not popup-blocked)

---

### Issue #3: Apple OAuth Env Vars (DO THIS NEXT)

**Current Status:** Apple button now enabled in code but env vars missing.

**Fix (5 minutes):**

1. Get your Apple credentials from: https://developer.apple.com/account/
2. Go to Vercel: https://vercel.com/dashboard/variables?type=env
3. Create three environment variables:
   - **VITE_APPLE_TEAM_ID** — Your Apple Developer Team ID (starts with letters, e.g., `A1B2C3D4E5`)
   - **VITE_APPLE_BUNDLE_ID** — Bundle identifier (e.g., `com.thevideopool.app`)
   - **VITE_APPLE_KEY_ID** — Key ID from Certificates & Identifiers (e.g., `ABC123DEF4`)
4. Save each one, set Environment: "Production"
5. Also set the same three on **Railway backend**:
   ```bash
   railway variables set VITE_APPLE_TEAM_ID="your-team-id"
   railway variables set VITE_APPLE_BUNDLE_ID="com.thevideopool.app"
   railway variables set VITE_APPLE_KEY_ID="your-key-id"
   ```
6. Redeploy:
   ```bash
   git push origin main      # Frontend
   railway up                # Backend
   ```
7. ✅ Test: Apple button should appear (not grayed out)

---

## 🧪 Testing Instructions

### Test Google OAuth

```bash
# 1. Check frontend env
node scripts/oauth-diagnostic.mjs
# Should show: VITE_GOOGLE_CLIENT_ID defined ✅

# 2. Visit login page
open https://dev.thevideopool.com/login

# 3. Look for Google button (should NOT be grayed out)

# 4. Click Google button
# Expected: Google popup opens → sign in with your Google account

# 5. After sign-in:
# Expected: Redirects to /verify-phone or /home (no infinite spin)
```

### Test Apple OAuth

```bash
# 1. Check env setup
node scripts/oauth-diagnostic.mjs
# Should show:
# - VITE_APPLE_TEAM_ID set ✅
# - VITE_APPLE_BUNDLE_ID set ✅
# - VITE_APPLE_KEY_ID set ✅

# 2. Visit login page
open https://dev.thevideopool.com/login

# 3. Look for Apple button (should NOT be grayed out)

# 4. Click Apple button
# Expected: Apple Sign In popup opens

# 5. After sign-in:
# Expected: Redirects to /verify-phone or /home
```

### Test Facebook OAuth (Already Working)

```bash
# Visit https://dev.thevideopool.com/login
# Click Facebook button
# Should open popup + complete sign-in
```

---

## 📋 Checklist (Do In Order)

- [ ] **Step 1:** Set `VITE_GOOGLE_CLIENT_ID` on Vercel (2 min)
- [ ] **Step 2:** Verify Google redirect URIs (3 min)
- [ ] **Step 3:** Test Google OAuth (2 min) — should work now
- [ ] **Step 4:** Get Apple credentials from developer.apple.com (5 min)
- [ ] **Step 5:** Set Apple env vars on Vercel (3 min)
- [ ] **Step 6:** Set Apple env vars on Railway (3 min)
- [ ] **Step 7:** Test Apple OAuth (2 min) — should work now
- [ ] **Step 8:** Test all three (Google, Apple, Facebook) end-to-end (5 min)

**Total Time:** ~25 minutes

---

## 🆘 Troubleshooting

### "Google button is grayed out"
- → Env var `VITE_GOOGLE_CLIENT_ID` not set on Vercel
- → Run: `node scripts/oauth-diagnostic.mjs` to verify
- → Check: https://vercel.com/dashboard/variables?type=env

### "Google button is clickable but nothing happens"
- → Popup is blocked by browser
- → Check browser console for errors
- → Authorized redirect URI might be missing from Google Cloud Console

### "Google sign-in spins forever"
- → Backend `/api/auth/google` timeout or 500 error
- → Check Railway logs: `railway logs --service backend`
- → Verify `GOOGLE_CLIENT_ID` is set on Railway

### "Apple button is still grayed out"
- → Env vars not set on Vercel
- → Run: `node scripts/oauth-diagnostic.mjs`
- → Check: https://vercel.com/dashboard/variables?type=env

### "Apple sign-in doesn't work on production"
- → Make sure you configured Apple's Redirect URI allowlist
- → Apple needs: `https://dev.thevideopool.com`, `https://tvp-redesign-2026.vercel.app`

---

## 📚 Reference

**Google OAuth:**
- Client ID: `492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com`
- Console: https://console.cloud.google.com/
- Docs: https://developers.google.com/identity/protocols/oauth2

**Apple OAuth:**
- Developer: https://developer.apple.com/account/
- Docs: https://developer.apple.com/sign-in-with-apple/

**Facebook OAuth:**
- Console: https://developers.facebook.com/
- Status: Already configured + working ✅

---

## 🚀 What's Next

After OAuth is working:

1. **Deploy to production** (www.thevideopool.com)
2. **Add same env vars to production Vercel** + **Railway**
3. **Update authorized redirect URIs** for production domain
4. **Test end-to-end** on production
5. **Launch** 🎉

---

**Questions?** Check `scripts/oauth-diagnostic.mjs` output or review this guide.
