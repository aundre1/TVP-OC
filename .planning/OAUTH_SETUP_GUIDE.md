# The Video Pool — Complete OAuth Setup Guide

**Status:** March 2, 2026 — Phase: OAuth Credential Collection & Configuration

---

## Current OAuth Status

| Provider | Frontend Env Var | Backend Config | Status | Issue |
|----------|-----------------|----------------|--------|-------|
| **Google** | ✅ `VITE_GOOGLE_CLIENT_ID` | ✅ `GOOGLE_CLIENT_ID` | ✅ WORKING | None |
| **Facebook** | ❌ Missing | ❌ Missing | 🔴 BROKEN | App ID not set on Vercel or Railway |
| **Spotify** | ✅ `VITE_SPOTIFY_CLIENT_ID` | ✅ Endpoint ready | ⏳ PARTIAL | Redirect URI needs registration |
| **Apple** | ⏳ Incomplete | ✅ Endpoint ready | ⏳ PARTIAL | Services ID missing |
| **Email/Password** | N/A | ✅ Full auth stack | ✅ WORKING | None |

---

## What's Causing the Facebook "Hanging" Issue

When `VITE_FACEBOOK_APP_ID` is not set:

1. Frontend checks if app ID is configured → not set
2. Facebook button shows as **disabled** (grayed out)
3. Clicking it does nothing (button has `disabled={true}`)
4. Appears to "hang" because no visual feedback occurs

**Fix:** Set `VITE_FACEBOOK_APP_ID` on Vercel + `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` on Railway

---

## Credential Collection Form

**Please provide the following:**

### Facebook OAuth
- [ ] **Facebook App ID** (from [Meta Developers Console](https://developers.facebook.com))
- [ ] **Facebook App Secret** (keep this secret!)
- [ ] Confirm you've added these redirect URIs to Facebook app settings:
  - `https://dev.thevideopool.com`
  - `https://tvp-redesign-2026.vercel.app`

### Spotify OAuth
- [ ] **Spotify Client ID** (current: `bdeadc46ae934fb9b03767353deebef9` — confirm this is correct)
- [ ] Confirm you've registered these redirect URIs in [Spotify Dashboard](https://developer.spotify.com):
  - `https://dev.thevideopool.com/auth/spotify/callback`
  - `https://tvp-redesign-2026.vercel.app/auth/spotify/callback`

### Apple Sign In
- [ ] **Apple Team ID** (current: `34UE397K5R` — confirm this is correct)
- [ ] **Apple Key ID** (current: `5243K8458B` — confirm this is correct)
- [ ] **Apple Services ID for Web** (e.g., `com.thevideopool.web`)
  - **IMPORTANT:** This is NOT the iOS bundle ID (`com.thevideopool.app`)
  - Register at: [developer.apple.com → Identifiers → Service IDs](https://developer.apple.com/account/resources/identifiers)
- [ ] Confirm you've added these domain redirect URIs in Apple Services ID:
  - `https://dev.thevideopool.com`
  - `https://tvp-redesign-2026.vercel.app`

### Email/Password Auth
- [ ] Test account email: ___________
- [ ] Test account password: ___________
- [ ] Confirm email verification is working (check inbox for code)

---

## Setup Instructions by Provider

### Google OAuth ✅ (Already Working)

**Status:** Production-ready
- Frontend: ✅ `VITE_GOOGLE_CLIENT_ID=492064280951-qh2num4j23eaq7o47itoi19dvon8pcoh`
- Backend: ✅ `GOOGLE_CLIENT_ID=492064280951-qh2num4j23eaq7o47itoi19dvon8pcoh`
- GCP Authorized JS Origins: ✅ Both `dev.thevideopool.com` and `tvp-redesign-2026.vercel.app`

**Test:** Click Google button on login page → should work

---

### Facebook OAuth 🔴 (Needs Credentials)

**Backend requirements:**
- `FACEBOOK_APP_ID` (on Railway)
- `FACEBOOK_APP_SECRET` (on Railway)

**Frontend requirements:**
- `VITE_FACEBOOK_APP_ID` (on Vercel)

**Steps:**

1. Go to [Meta Developers Console](https://developers.facebook.com)
2. Create or select your app → Settings → Basic
3. Copy **App ID** and **App Secret**
4. Set on **Railway:**
   ```bash
   railway variables set FACEBOOK_APP_ID="YOUR_APP_ID"
   railway variables set FACEBOOK_APP_SECRET="YOUR_APP_SECRET"
   ```
5. Set on **Vercel:**
   ```bash
   vercel env add VITE_FACEBOOK_APP_ID --environments production,preview,development
   # Enter value: YOUR_APP_ID
   ```
6. In Meta Console, add redirect URIs:
   - Settings → Basic → App Domains: `thevideopool.com`
   - Products → Facebook Login → Settings → Valid OAuth Redirect URIs:
     - `https://dev.thevideopool.com`
     - `https://tvp-redesign-2026.vercel.app`

7. Deploy and test

---

### Spotify OAuth ⏳ (Partially Working)

**Current:**
- ✅ Frontend: `VITE_SPOTIFY_CLIENT_ID=bdeadc46ae934fb9b03767353deebef9` (set on Vercel)
- ✅ Backend: No secret needed (PKCE flow uses client ID only)
- ⏳ **Issue:** Redirect URI not registered in Spotify Dashboard

**Steps:**

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your app → Edit Settings
3. Under "Redirect URIs," add:
   - `https://dev.thevideopool.com/auth/spotify/callback`
   - `https://tvp-redesign-2026.vercel.app/auth/spotify/callback`
4. Save
5. Deploy and test (should work immediately after saving)

---

### Apple Sign In ⏳ (Needs Services ID)

**Current:**
- ✅ Team ID: `34UE397K5R`
- ✅ Key ID: `5243K8458B`
- ❌ Missing: Services ID for web sign-in

**Steps:**

1. Go to [developer.apple.com → Identifiers](https://developer.apple.com/account/resources/identifiers)
2. Click **Create a New Identifier** → Service IDs
3. Register a new Service ID (e.g., `com.thevideopool.web`)
4. Enable "Sign in with Apple"
5. Configure "Web Domain" and "Redirect URLs":
   - Primary Domain: `thevideopool.com`
   - Redirect URLs:
     - `https://dev.thevideopool.com`
     - `https://tvp-redesign-2026.vercel.app`
6. Copy the Service ID value (e.g., `com.thevideopool.web`)
7. Set on **Vercel:**
   ```bash
   vercel env add VITE_APPLE_SERVICE_ID --environments production,preview,development
   # Enter value: com.thevideopool.web (or whatever you registered)
   ```
8. Deploy and test

---

### Email/Password Auth ✅ (Already Working)

**Current Status:** Production-ready

**Features:**
- ✅ Register new account
- ✅ Login with email/password
- ✅ Email verification (6-digit code)
- ✅ Password reset via email token
- ✅ Password change (authenticated users only)
- ✅ 2FA setup (TOTP)

**Test Flow:**
1. Go to login page → "Create Account"
2. Enter email + password
3. Check inbox for verification code
4. Enter code to verify email
5. Phone verification (optional, can skip)
6. Should see dashboard

---

## Deployment Checklist

**Before going live:**

- [ ] Facebook: App ID + Secret set on Railway and Vercel
- [ ] Spotify: Redirect URI registered in Spotify Dashboard
- [ ] Apple: Services ID created and `VITE_APPLE_SERVICE_ID` set on Vercel
- [ ] All environment variables deployed to production (Railway + Vercel)
- [ ] Test each OAuth flow end-to-end
- [ ] Verify email verification works
- [ ] Confirm password reset flow works

---

## Verification Test Commands

### Test Email/Password Auth
```bash
# Register
curl -X POST https://tvp-oc-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Login
curl -X POST https://tvp-oc-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

### Test Google OAuth (should already work)
1. Visit https://dev.thevideopool.com
2. Click Google button → should open Google login
3. Select account → should redirect to verify-phone or home

### Test Facebook OAuth (after credentials set)
1. Visit https://dev.thevideopool.com
2. Click Facebook button → should open Facebook login
3. Approve permissions → should create/login user

### Test Spotify OAuth (after redirect URI registered)
1. Visit https://dev.thevideopool.com
2. Click Spotify button → should open Spotify auth in popup
3. Approve scopes → should return to app logged in

### Test Apple Sign In (after Services ID set)
1. Visit https://dev.thevideopool.com (on Apple device/browser)
2. Click Apple button → should show Apple sign-in modal
3. Authenticate → should create/login user

---

## Environment Variable Summary

### Vercel (Frontend)
```env
VITE_GOOGLE_CLIENT_ID=492064280951-qh2num4j23eaq7o47itoi19dvon8pcoh
VITE_FACEBOOK_APP_ID=                    # <- NEEDS FILL
VITE_SPOTIFY_CLIENT_ID=bdeadc46ae934fb9b03767353deebef9
VITE_APPLE_TEAM_ID=34UE397K5R
VITE_APPLE_SERVICE_ID=                   # <- NEEDS FILL
VITE_APPLE_KEY_ID=5243K8458B
VITE_STRIPE_PUBLIC_KEY=pk_live_QzpDxPYfaEE0ic4ML2fuT1u4
VITE_API_URL=/api
```

### Railway (Backend)
```env
GOOGLE_CLIENT_ID=492064280951-qh2num4j23eaq7o47itoi19dvon8pcoh
FACEBOOK_APP_ID=                         # <- NEEDS FILL
FACEBOOK_APP_SECRET=                     # <- NEEDS FILL
JWT_SECRET=oWZIQ8eY75qMs08qFfJ0rFFFFJUhXW+BpsNd0q95sEc=
REFRESH_TOKEN_SECRET=5WGG9rqCD9NlITbA9GHT1eBa/HPI8UFtwmI/OhlYaYU=
# ... (other vars remain unchanged)
```

---

## Next Steps

1. **Collect credentials** using form above
2. **Set environment variables** on Vercel and Railway
3. **Register redirect URIs** in provider dashboards (Spotify, Apple)
4. **Deploy** and test each OAuth flow
5. **Verify email/password auth** works end-to-end

---

**Last Updated:** March 2, 2026
**Maintainer:** Claude Code
