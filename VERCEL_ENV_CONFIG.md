# Vercel Environment Configuration Guide

Complete reference for setting up environment variables for TVP-Redesign on Vercel.

---

## Overview

Your Vite app uses environment variables prefixed with `VITE_` to configure API endpoints and other settings.

**Key Principle**: Only variables starting with `VITE_` are exposed to the browser. All others are private.

---

## Required Environment Variables

### VITE_API_URL (Required)

The backend API endpoint where your frontend makes requests.

**Variable Name**: `VITE_API_URL`

**Possible Values**:

| Environment | Value | Notes |
|-----------|-------|-------|
| Local Development | `http://localhost:5000` | For local testing |
| Staging | `https://api-staging.thevideopool.com` | Recommended for demo |
| Production | `https://api.thevideopool.com` | Production API |
| Railway Staging | `https://tvp-api-staging.up.railway.app` | If using Railway |
| Railway Prod | `https://tvp-api-prod.up.railway.app` | If using Railway |

**How to Find Your Backend URL**:

1. **If deployed to Railway**:
   - Open Railway dashboard
   - Navigate to your backend project
   - Copy the "Public Domain" URL (looks like `https://app-name.up.railway.app`)

2. **If using custom domain**:
   - Use your domain: `https://api-staging.thevideopool.com`

3. **If local**:
   - Use `http://localhost:5000` (only for development)

**Example**:
```
VITE_API_URL=https://api-staging.thevideopool.com
```

---

## Setting Environment Variables in Vercel

### Method 1: During Project Import (GitHub)

When importing project from GitHub:

1. After selecting project, before clicking "Deploy"
2. Scroll to "Environment Variables"
3. Click "Add Environment Variable"
4. Fill in:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://api-staging.thevideopool.com`
   - **Environments**: Select "Production", "Preview", "Development"
5. Click "Deploy"

### Method 2: Dashboard (After Deployment)

1. Go to **[vercel.com/dashboard](https://vercel.com/dashboard)**
2. Click on your project: `tvp-redesign`
3. Go to **Settings tab**
4. Click **Environment Variables** in left menu
5. Click **Add New Environment Variable**
6. Fill in:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://api-staging.thevideopool.com`
   - **Environments**: Check all (Production, Preview, Development)
7. Click **Save**
8. **Redeploy** (Vercel will auto-redeploy, or manually trigger)

**Screenshot path**: Settings → Environment Variables → Add

### Method 3: Vercel CLI

```bash
# Add environment variable
vercel env add VITE_API_URL

# Prompts will ask:
# ? What's the value?
# → https://api-staging.thevideopool.com
#
# ? Select environments (select all):
# ✓ Production
# ✓ Preview
# ✓ Development

# List all environment variables
vercel env ls

# Remove environment variable
vercel env remove VITE_API_URL
```

---

## Environment-Specific Configuration

### Production Environment

Used when accessing the main deployment URL.

**Settings**:
- `VITE_API_URL=https://api.thevideopool.com` (production backend)

**Deploy command**:
```bash
vercel --prod
```

### Preview Environment

Used for PR preview deployments.

**Settings**:
- `VITE_API_URL=https://api-staging.thevideopool.com` (staging backend)

**Triggered automatically** when creating pull requests.

### Development Environment

Only used for local testing with Vercel integration.

**Settings**:
- Same as Preview (staging)

**Local dev** still uses `.env` or `.env.local` files.

---

## Using Environment Variables in Your Code

### Access in React Components

```typescript
// Get API URL
const API_URL = import.meta.env.VITE_API_URL;

// Use in fetch
const response = await fetch(`${API_URL}/api/videos`);

// Use in axios
import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
```

### Access in Utility Files

```typescript
// src/api/client.ts
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api-staging.thevideopool.com';

export const fetchVideos = async () => {
  const response = await fetch(`${BASE_URL}/api/videos`);
  return response.json();
};
```

### Debug in Browser Console

```typescript
// Add to any component or script
console.log('API URL:', import.meta.env.VITE_API_URL);
```

Then check browser DevTools → Console to verify it's loaded.

---

## Verifying Environment Variables Work

### During Development

```bash
npm run dev
# Open http://localhost:3001
# Open DevTools → Console
# Should show correct VITE_API_URL value
```

### After Deployment

1. **Vercel Dashboard Check**:
   - Project → Settings → Environment Variables
   - Verify `VITE_API_URL` is listed
   - Check it shows correct value

2. **Browser Check**:
   - Open your deployed URL
   - Open DevTools → Console
   - Add temporary log:
     ```javascript
     console.log(import.meta.env.VITE_API_URL)
     ```
   - Should display correct API URL

3. **Network Request Check**:
   - Open DevTools → Network tab
   - Trigger an API call (login, fetch data, etc.)
   - Look at request URL in Network tab
   - Should show API requests going to correct domain

---

## Common Issues & Solutions

### Env Variable Not Loading

**Problem**: `import.meta.env.VITE_API_URL` is undefined

**Solutions**:
1. Variable name must start with `VITE_`
2. Must be set in Vercel Dashboard (not just locally)
3. Must redeploy after setting variables
4. Check spelling matches exactly

**Debug**:
```typescript
console.log('All env vars:', import.meta.env);
// Should show VITE_API_URL in output
```

### API Calls Still Going to Wrong Endpoint

**Problem**: Frontend makes requests to old API

**Solutions**:
1. Verify `VITE_API_URL` value in Vercel Dashboard
2. Force browser cache clear:
   - Chrome: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Or open DevTools → Network → "Disable cache" checkbox
3. Redeploy from Vercel Dashboard
4. Check browser console to confirm env var loaded

### CORS Errors When Calling API

**Problem**:
```
Access to XMLHttpRequest at 'https://api-staging...' blocked by CORS policy
```

**Solution**:
- Backend needs to allow requests from your Vercel domain
- Add to backend CORS configuration:
  ```
  https://tvp-redesign-XXXXX.vercel.app
  https://*.vercel.app
  ```

### Env Variable Visible in Browser (Security Issue)

**Don't do this**:
```typescript
// ❌ WRONG - exposes secrets
VITE_SECRET_KEY = "super-secret-key"
```

**Do this instead**:
```typescript
// ✅ RIGHT - for API URLs and public config
VITE_API_URL = "https://api.example.com"

// ✅ RIGHT - for private keys, use server-side only
// Never prefix with VITE_, set as regular env var in Vercel
```

---

## Advanced: Multiple Environments

### Setup Different URLs per Environment

**Scenario**: Different APIs for staging vs production

**Step 1: Create separate deployments**

Option A: Use different projects
- `tvp-redesign-staging.vercel.app` (staging backend)
- `tvp-redesign-prod.vercel.app` (production backend)

Option B: Use environment overrides
- Same project, different branch deployments

**Step 2: Set env vars per environment**

Vercel Dashboard → Environment Variables → Select environment

```
Production:
  VITE_API_URL = https://api.thevideopool.com

Preview:
  VITE_API_URL = https://api-staging.thevideopool.com

Development:
  VITE_API_URL = https://api-staging.thevideopool.com
```

**Step 3: Deploy**

```bash
# Production deployment
vercel --prod

# Preview (automatic on PR)
# (no manual command needed)
```

---

## Integration with Railway Backend

If backend is deployed to Railway:

### Get Railway API URL

1. Open Railway dashboard
2. Click your backend project
3. Go to "Settings" tab
4. Copy "Public Domain" (looks like `https://tvp-api-prod.up.railway.app`)

### Add to Vercel

```
VITE_API_URL = https://tvp-api-prod.up.railway.app
```

### Verify Connection

1. Deploy frontend to Vercel
2. Check in browser DevTools → Network
3. API requests should go to Railway domain
4. Should see 200 responses (not CORS errors)

---

## Environment Variable Naming Convention

### Recommended Pattern

```
# Production
VITE_API_URL = https://api.thevideopool.com

# Public/Client-side config (exposed to browser)
VITE_APP_NAME = "The Video Pool"
VITE_APP_VERSION = "6.0.0"
VITE_ENABLE_ANALYTICS = true

# Private/Server-side config (NOT exposed, no VITE_ prefix)
# These would need backend configuration, not frontend
DATABASE_URL = "..."
API_SECRET_KEY = "..."
```

### Rules

- Use `VITE_` prefix for anything that should be accessible in the browser
- Use regular names (no prefix) for server-only secrets
- Use SCREAMING_SNAKE_CASE for all env vars
- Use meaningful, descriptive names

---

## Troubleshooting Checklist

```
Environment Variable Not Working?

[ ] Check spelling: VITE_API_URL (exact match)
[ ] Check prefix: Must start with VITE_
[ ] Check Vercel Dashboard: Settings → Environment Variables
[ ] Verify value is set correctly
[ ] Redeploy after changing variables
[ ] Clear browser cache (Cmd+Shift+R)
[ ] Check browser console (F12) - should see correct value
[ ] Check Network tab - requests should use correct domain
[ ] Check backend CORS allows Vercel domain
[ ] Check backend is running and accessible
```

---

## Quick Reference: Common Values

```bash
# Local Development
VITE_API_URL=http://localhost:5000

# Staging (Default)
VITE_API_URL=https://api-staging.thevideopool.com

# Production
VITE_API_URL=https://api.thevideopool.com

# Railway Staging
VITE_API_URL=https://tvp-api-staging.up.railway.app

# Railway Production
VITE_API_URL=https://tvp-api-prod.up.railway.app
```

---

## Resources

- **Vercel Env Docs**: https://vercel.com/docs/concepts/projects/environment-variables
- **Vite Env Guide**: https://vitejs.dev/guide/env-and-mode.html
- **Project Root**: `/Users/dremacmini/Desktop/OC/TVP-Redesign-2026`
- **Vite Config**: `/Users/dremacmini/Desktop/OC/TVP-Redesign-2026/vite.config.ts`

---

**Last Updated**: February 2026
