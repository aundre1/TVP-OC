# Facebook OAuth Setup — Batch 4

**Status:** 🟡 Requires manual configuration (awaiting Facebook App credentials)

## Required Credentials

To enable Facebook OAuth login, you need:

1. **Facebook App ID** — From Facebook Developer Console
2. **Facebook App Secret** — From Facebook Developer Console
3. **Redirect URI** — https://dev.thevideopool.com (already authorized for OAuth)

## Step-by-Step Configuration

### Step 1: Get Facebook App ID & Secret (Manual)
1. Go to: https://developers.facebook.com/apps/
2. Create a new app (type: "Consumer")
3. In app settings, copy:
   - **App ID** → will become `VITE_FACEBOOK_APP_ID` (frontend)
   - **App Secret** → will become `FACEBOOK_APP_SECRET` (backend)
4. Authorized JavaScript Origins: Add `https://dev.thevideopool.com`

### Step 2: Set Vercel Environment Variables (Frontend)
```bash
vercel env add VITE_FACEBOOK_APP_ID
# Paste the App ID value
```

Or via Vercel Dashboard:
1. Go: https://vercel.com/dashboard
2. Project: TVP Redesign 2026
3. Settings → Environment Variables
4. Add: `VITE_FACEBOOK_APP_ID` = `<your-app-id>`
5. Redeploy

### Step 3: Set Railway Environment Variables (Backend)
```bash
export RAILWAY_TOKEN="<your-railway-token>"
railway variables set FACEBOOK_APP_ID="<your-app-id>"
railway variables set FACEBOOK_APP_SECRET="<your-app-secret>"
```

Or via Railway Dashboard:
1. Go: https://railway.app/dashboard/projects/TVP-OC
2. Select TVP backend service
3. Variables tab
4. Add:
   - `FACEBOOK_APP_ID` = `<your-app-id>`
   - `FACEBOOK_APP_SECRET` = `<your-app-secret>`
5. Service will auto-redeploy

### Step 4: Verify Configuration
After setting env vars on both Vercel and Railway:

```bash
# Frontend: Vercel will auto-redeploy (~2 min)
# Check logs: https://vercel.com/dashboard/tvp-redesign-2026

# Backend: Railway will auto-redeploy (~1 min)
# Check logs: https://railway.app/dashboard/projects/TVP-OC

# Test at https://dev.thevideopool.com/login
# Facebook button should be clickable (not disabled)
```

## Backend Route

The backend has the Facebook OAuth endpoint ready:
- **Route:** `POST /api/auth/facebook`
- **Expected body:** `{ accessToken: string }`
- **Returns:** JWT token + user data

## Frontend Implementation

The SocialLoginGrid component is ready:
- Detects when `VITE_FACEBOOK_APP_ID` is set
- Automatically enables Facebook button
- Calls `loginWithFacebook(accessToken)` from authStore

## Status After Configuration

Once credentials are set:
- ✅ Facebook button will be enabled (not grayed out)
- ✅ Clicking opens Facebook login modal
- ✅ On success: user created/logged in, redirected to home
- ⏳ Full test requires database connectivity fix (currently blocking)

## Links
- Facebook Developers: https://developers.facebook.com/
- Vercel Dashboard: https://vercel.com/dashboard
- Railway Dashboard: https://railway.app/dashboard/projects/TVP-OC
