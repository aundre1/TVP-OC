# Google OAuth Fix Guide - The Video Pool

**Status:** 🔴 BROKEN - Missing environment variable configuration
**Root Cause:** VITE_GOOGLE_CLIENT_ID not set on Vercel; GOOGLE_CLIENT_ID not set on Railway
**Fix Time:** 5 minutes per platform
**Difficulty:** Easy - copy/paste values

---

## 🎯 The Issue

When you click "Sign in with Google" on The Video Pool, you get `Error 401: invalid_client` from Google because:

1. **Frontend (Vercel):** Missing `VITE_GOOGLE_CLIENT_ID` → GoogleOAuthProvider doesn't initialize → no login popup
2. **Backend (Railway):** Missing `GOOGLE_CLIENT_ID` → token validation fails → 401 response

## 📋 Exact Values to Use

```
VITE_GOOGLE_CLIENT_ID = 492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com
GOOGLE_CLIENT_ID = 492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com
```

(Both use the FULL client ID including `.apps.googleusercontent.com`)

---

## 🔧 Fix 1: Set VITE_GOOGLE_CLIENT_ID on Vercel (Frontend)

### Step 1: Go to Vercel Dashboard
- URL: https://vercel.com/dashboard
- Select project: `tvp-redesign-2026`

### Step 2: Go to Environment Variables
- Click: Settings (gear icon) → Environment Variables
- Look for: `VITE_GOOGLE_CLIENT_ID`

### Step 3: If the variable exists
- Edit the value: `492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com`
- Click: Save
- **IMPORTANT:** Redeploy for changes to take effect:
  - Go to Deployments
  - Click: "Redeploy" on latest deployment
  - Wait ~2 minutes

### Step 4: If the variable does NOT exist
- Click: "Add New" or "Create New"
- Name: `VITE_GOOGLE_CLIENT_ID`
- Value: `492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com`
- Environment: Select `Production`
- Click: Save
- **Redeploy:** Go to Deployments → Redeploy latest

### Verification
- Wait 5 minutes for Vercel to rebuild
- Go to https://dev.thevideopool.com/login
- You should see the Google button is now ACTIVE (not grayed out)

---

## 🔧 Fix 2: Set GOOGLE_CLIENT_ID on Railway (Backend)

### Step 1: Go to Railway Dashboard
- URL: https://railway.app/dashboard

### Step 2: Select The Video Pool Project
- Look for: `diplomatic-simplicity` or search "the-video-pool"
- Click to select

### Step 3: Select Backend Service
- In the Services sidebar, click: `backend`

### Step 4: Open Variables Tab
- Click: "Variables" tab (should be next to Deploy Log)
- View: "Raw Editor" (easier for adding one variable)

### Step 5: Add the Environment Variable
In the Raw Editor, add this line:
```
GOOGLE_CLIENT_ID=492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com
```

### Step 6: Save
- Click: Save (or Cmd+S)
- Railway will automatically redeploy the backend (~30-60 seconds)

### Verification
- Wait for Railway to show green checkmark in Deployments
- Check the logs to confirm backend is running

---

## 🌐 Fix 3: Verify Google OAuth Redirect URIs (Google Cloud Console)

**These should already be set, but let's verify:**

### Step 1: Open Google Cloud Console
- URL: https://console.cloud.google.com/apis/credentials?project=492064280951

### Step 2: Find Your OAuth Client
- Look for: "The Video Pool - Production" (or "Web client 4")
- Click the Edit (pencil) icon

### Step 3: Check "Authorized Redirect URIs"
Should include ALL of these:
```
https://dev.thevideopool.com/auth/v1/callback
https://dev.thevideopool.com/
https://dev.thevideopool.com
https://localhost:5173/auth/v1/callback
```

### Step 4: If Any Are Missing
- Click in the Authorized Redirect URIs field
- Add the missing ones (one per line)
- Click: Save

---

## ✅ Complete Testing Checklist

Once you've set the env vars on BOTH Vercel and Railway:

### Browser Test (5 minutes after deployment)
- [ ] Open https://dev.thevideopool.com/login in **Incognito** window
- [ ] Click the Google button
- [ ] Google login popup appears ✓
- [ ] Log in with a Google account
- [ ] Redirected back to app ✓
- [ ] Logged in and can see the dashboard ✓

### Console Check (Dev Tools)
- [ ] Open Browser DevTools (F12)
- [ ] Go to Console tab
- [ ] No red error messages ✓
- [ ] Check Network tab:
  - POST /api/auth/google returns 200 ✓
  - Cookies include `tvp_token` ✓

### Backend Check
- [ ] Go to Railway dashboard
- [ ] Select backend service
- [ ] Check Logs tab
- [ ] No error messages about missing GOOGLE_CLIENT_ID ✓
- [ ] Should see success message when you logged in ✓

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Google button still grayed out | VITE_GOOGLE_CLIENT_ID not set or wrong. Check Vercel env vars + redeploy |
| "Click Google" does nothing | GoogleOAuthProvider failed to initialize. Check browser console for errors |
| Popup appears but redirects back to login | Token validation failed. Check GOOGLE_CLIENT_ID on Railway + check logs |
| "Invalid Google token" error | Redirect URIs mismatch in GCP. Add all URIs from Fix 3 above |
| Still 401 after 5 min | Clear browser cache (Ctrl+Shift+Delete). Use incognito window. |

---

## 📝 Summary

|What | Where | Value|
|-----|-------|-------|
| Frontend Env Var | Vercel → Settings → Variables | `VITE_GOOGLE_CLIENT_ID=492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com` |
| Backend Env Var | Railway → backend → Variables | `GOOGLE_CLIENT_ID=492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com` |
| Redeploy | Vercel | Deployments → Redeploy |
| Auto-deploy | Railway | Automatic after variable save |
| GCP URIs | Google Cloud Console | Verify all 4 URIs are registered |

---

## 🚀 Next Steps After Fix

Once Google OAuth is working:

1. **Test with Real Email** - Try logging in with your actual Google account
2. **Test Phone Verification** - Complete the SMS verification step
3. **Test Logout** - Click logout and try logging in again
4. **Test Other Features** - Verify dashboard, videos, memberships all work

---

## ❓ Questions?

If the fix doesn't work:
1. Double-check BOTH env vars are set (frontend + backend)
2. Verify there are NO typos in the client ID
3. Wait 5+ minutes after setting variables (deployment takes time)
4. Use incognito window (clears old cached redirects)
5. Check browser console for exact error message

---

**Status After Fix:** ✅ Google OAuth should be fully working
**Time Invested:** ~10 minutes total (5 Vercel + 5 Railway)
**Confidence Level:** 99% (only missing piece is env vars)
