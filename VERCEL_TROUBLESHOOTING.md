# Vercel Deployment Troubleshooting & Verification Guide

Diagnose and fix common deployment issues.

---

## Pre-Deployment Verification

Before uploading to Vercel, verify the build works locally.

### Step 1: Local Build Test

```bash
cd /Users/dremacmini/Desktop/OC/TVP-Redesign-2026

# Clean install (optional, but safe)
rm -rf node_modules package-lock.json
npm install

# Run linter
npm run lint

# Build
npm run build

# Check output
ls -la dist/
```

**Expected Output**:
- No errors from `npm run lint`
- Build completes without errors
- `dist/` folder contains `index.html` and assets

**If build fails locally**, fix before deploying to Vercel:
- Run `npm run lint` to see errors
- Fix TypeScript/syntax errors in code
- Run `npm install` if dependencies are missing
- Commit changes to Git

### Step 2: Local Preview

```bash
npm run preview
# Opens http://localhost:4173
# Should look identical to local dev (npm run dev)
```

If preview looks wrong locally, deployment will too.

---

## Deployment Verification Checklist

After clicking "Deploy" in Vercel or running `vercel --prod`:

### During Build (1-2 minutes)

**In Vercel Dashboard**:
- Watch build progress in real-time
- Should see:
  ```
  ✓ Analyzing source files
  ✓ Installing dependencies
  ✓ Building application
  ✓ Creating optimized builds
  ```

**If build fails**:
1. Click build log to see errors
2. Common errors:
   - TypeScript compilation: Fix code locally
   - Missing dependencies: Check `package.json`
   - Environment variable: Add to Vercel Dashboard
3. Fix locally, push to GitHub
4. Vercel auto-redeploys

### After Deployment (Immediate)

**URL Generated**:
- Format: `https://tvp-redesign-XXXXXX.vercel.app`
- Green checkmark = deployment successful
- Copy this URL

**Visit the URL**:
```
1. Click deployment URL
2. Wait for page to load (5-10 seconds first visit)
3. Should see TVP interface
4. Check console for errors
```

---

## Common Issues & Fixes

### Issue 1: Build Fails with "npm run build" Error

**Error Message**:
```
error: build command failed with error code 1
```

**Diagnosis**:
1. Click build log in Vercel
2. Look for red error message
3. Common culprits:
   - TypeScript compilation errors
   - Missing dependencies
   - Syntax errors in code

**Fix**:
```bash
# Test locally first
npm run build

# See actual error
npm run lint

# Fix errors in code

# Test again
npm run build

# Commit and push
git add .
git commit -m "Fix build errors"
git push origin main

# Vercel auto-redeploys
```

**Common Build Errors**:

| Error | Cause | Fix |
|-------|-------|-----|
| `error TS1005: '=>' expected` | Syntax error in TypeScript | Check line number in error, fix syntax |
| `Cannot find module '@/'` | Path alias not set | Check `tsconfig.json` and `vite.config.ts` |
| `Module not found: 'react'` | Dependency missing | `npm install` and check `package.json` |
| `error: ReferenceError: fetch is not defined` | Node polyfill issue (rare) | Update vite.config.ts |

---

### Issue 2: Blank Page or "Cannot GET /"

**What You See**:
- Vercel URL opens
- Page is completely blank
- Browser console: No errors shown

**Causes**:
1. Missing `dist/index.html`
2. Wrong output directory
3. Build didn't complete

**Fix**:

```bash
# Verify build output locally
npm run build
ls dist/index.html  # Should exist

# Check build config
cat vite.config.ts  # output dir should be 'dist'

# Redeploy
# Vercel Dashboard → Deployments → latest → "Redeploy"
```

**Verify dist folder exists**:
```bash
cd /Users/dremacmini/Desktop/OC/TVP-Redesign-2026
ls -la dist/

# Should show:
# -rw-r--r--  1 user  staff  12345 Feb 16 10:00 index.html
# drwxr-xr-x  3 user  staff     96 Feb 16 10:00 assets
```

---

### Issue 3: "Cannot GET /page" on Navigation

**What happens**:
- Homepage loads fine
- Click link to another page → 404 "Cannot GET /about"

**Cause**: Single Page App (SPA) routing issue

**Fix**:

Vercel should auto-detect Vite and configure routing. If not:

1. **Vercel Dashboard** → Project Settings
2. Scroll to "Build & Development Settings"
3. Find "Framework Preset" - should be "Vite"
4. If not, manually add:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Vercel config file** (if above doesn't work):

Create `/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Then redeploy.

---

### Issue 4: API Calls Failing or Timing Out

**Error in Console**:
```
Failed to fetch from https://api-staging.thevideopool.com
CORS error
Timeout after 30s
```

**Diagnosis**:
1. Open DevTools → Network tab
2. Trigger an API action (login, fetch data)
3. Check Network tab for request
4. Look for error response or timeout

**Fix Step 1: Check Environment Variable**

```
Vercel Dashboard
  → Project: tvp-redesign
  → Settings
  → Environment Variables
  → Verify VITE_API_URL is set
```

Should show:
```
Name: VITE_API_URL
Value: https://api-staging.thevideopool.com
Environments: Production, Preview, Development (all checked)
```

If not set:
1. Click "Add New Environment Variable"
2. Add `VITE_API_URL = https://api-staging.thevideopool.com`
3. Click "Save"
4. **Redeploy**: Deployments → latest → "Redeploy"

**Fix Step 2: Verify Backend Running**

```bash
# Test API directly
curl -v https://api-staging.thevideopool.com/health

# Should return 200 with JSON response
# If not, backend is down
```

Check:
- Backend is deployed to Railway
- Backend is actually running (not paused)
- Backend URL is correct

**Fix Step 3: Check CORS**

Backend must allow requests from your Vercel domain.

Backend CORS config should include:
```
https://tvp-redesign-XXXXXX.vercel.app
https://*.vercel.app
```

Ask backend team to add this if not already set.

**Fix Step 4: Verify in Browser**

1. Visit deployed URL
2. Open DevTools → Console
3. Paste:
   ```javascript
   console.log('API URL:', import.meta.env.VITE_API_URL)
   fetch(import.meta.env.VITE_API_URL + '/health')
     .then(r => r.json())
     .then(d => console.log('Success:', d))
     .catch(e => console.error('Error:', e))
   ```
4. Should see either:
   - ✅ `Success: {data}` - API is working
   - ❌ CORS error - Backend needs CORS config
   - ❌ Network error - Backend is down

---

### Issue 5: Environment Variable Shows Undefined

**Error in Console**:
```
import.meta.env.VITE_API_URL = undefined
API_URL is undefined
```

**Cause**: Variable not set or name is wrong

**Fix**:

1. **Check variable name** (must be exact):
   - ✅ `VITE_API_URL` (correct)
   - ❌ `VITE_api_url` (wrong - case sensitive)
   - ❌ `API_URL` (wrong - missing VITE_ prefix)

2. **Check Vercel Dashboard**:
   - Settings → Environment Variables
   - Should show `VITE_API_URL` exactly as typed

3. **Redeploy after adding**:
   - Just adding the variable doesn't apply it
   - Must redeploy or trigger new deploy
   - Dashboard → Deployments → latest → "Redeploy"

4. **Clear browser cache**:
   - Chrome: Cmd+Shift+R (Mac)
   - DevTools → Network → Check "Disable cache"

---

### Issue 6: TypeScript Errors During Build

**Error**:
```
error TS7006: Parameter 'x' implicitly has an 'any' type.
error TS2322: Type 'string' is not assignable to type 'number'.
```

**Cause**: Code has type errors that local development ignores

**Fix**:

```bash
# See all TypeScript errors
npm run lint

# Fix errors in your code
# Common fixes:
# 1. Add type annotations
#    const x: string = "hello"
# 2. Fix type mismatches
#    const num: number = parseInt(str, 10)
# 3. Add optional chaining
#    obj?.property?.value

# Test locally
npm run build

# If it works locally, push to GitHub
git add .
git commit -m "Fix TypeScript errors"
git push

# Vercel auto-redeploys
```

---

### Issue 7: Large Bundle Size Warning

**Warning**:
```
⚠️ Assets larger than 1.5 MB
```

**Cause**: App bundle too large

**Impact**: Slower load times, not a deploy failure

**Fix** (Optional):
1. Verify vite.config.ts has code splitting enabled (it does)
2. Check actual build size:
   ```bash
   npm run build
   # Look for "dist/" folder size
   du -sh dist/
   ```

3. If really large:
   - Consider lazy loading components
   - Split large components into separate chunks
   - Remove unused dependencies

**For now**: Warning is OK, site still works

---

## Comprehensive Verification Checklist

Run through this after deployment:

### Homepage Load
- [ ] URL loads in browser
- [ ] Page displays TVP interface
- [ ] No blank page or 404
- [ ] Takes <3 seconds to load

### Navigation
- [ ] Click links to other pages
- [ ] URLs change correctly
- [ ] Pages load without 404 errors
- [ ] No console errors in DevTools

### API Connectivity
- [ ] Open DevTools → Network tab
- [ ] Trigger an API action (login, search, etc.)
- [ ] Request visible in Network tab
- [ ] Request URL shows correct API domain
- [ ] Response status is 200/201 (not 4xx/5xx)
- [ ] No CORS errors in console

### Environment Variables
- [ ] Open DevTools → Console
- [ ] Run: `import.meta.env.VITE_API_URL`
- [ ] Should return API URL, not undefined
- [ ] URL matches configured value

### Console Check
- [ ] Open DevTools → Console tab
- [ ] Should show NO red error messages
- [ ] Warnings (yellow) are OK
- [ ] No "fetch failed" or CORS messages

### Performance
- [ ] Page loads responsively
- [ ] No infinite loading spinners
- [ ] Interactions respond quickly
- [ ] Images and assets load

### Responsive Design
- [ ] Test on mobile size (375px)
- [ ] Test on tablet size (768px)
- [ ] Test on desktop size (1920px)
- [ ] Layout doesn't break

### Full Verification Script

Run this in browser console to check everything:

```javascript
// Check API URL
console.log('API URL:', import.meta.env.VITE_API_URL);

// Check API connectivity
fetch(import.meta.env.VITE_API_URL + '/health')
  .then(r => r.json())
  .then(d => console.log('API Status:', d))
  .catch(e => console.error('API Error:', e.message));

// Check window object
console.log('Window ready:', typeof window !== 'undefined');

// Check React
console.log('React version:', React?.version);
```

**Expected output**:
```
API URL: https://api-staging.thevideopool.com
API Status: { status: 'ok' }  // or whatever your health endpoint returns
Window ready: true
React version: 18.3.1
```

---

## Rollback to Previous Version

If deployment is broken:

1. **Vercel Dashboard** → Deployments
2. Find previous working version
3. Click the deployment
4. Click "Redeploy"
5. Select "Redeploy to Production"
6. Current deployment rolled back

Rollback takes <1 minute.

---

## Performance Checking

### Vercel Analytics

Vercel automatically tracks performance:

1. **Dashboard** → Project → Analytics
2. See metrics:
   - Page load time
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)
   - First Input Delay (FID)

Target metrics:
- LCP: <2.5s
- FID: <100ms
- CLS: <0.1

### Local Performance Check

```bash
npm run build
npm run preview

# Then open DevTools → Performance tab
# Click record, do user interaction
# Click stop
# Analyze timeline
```

---

## Debug Logs

### View Vercel Deployment Logs

1. **Dashboard** → Deployments → [Your Deployment]
2. Scroll to "Build Logs"
3. Shows step-by-step build process:
   ```
   ✓ Queued
   ✓ Building
   ✓ npm install
   ✓ npm run build
   ✓ Upload artifacts
   ✓ Done
   ```

### View Function Logs

If using Vercel Functions (unlikely for static site):
1. Dashboard → Function Logs
2. Shows server-side errors and requests

### CLI Logs

```bash
# View recent logs
vercel logs

# View specific deployment
vercel logs [deployment-url]

# Tail logs (watch live)
vercel logs --tail
```

---

## Getting Help

### Vercel Support

- **Docs**: https://vercel.com/docs
- **Support Chat**: vercel.com/help
- **Status Page**: https://www.vercel-status.com/

### TVP Issues

- **Project**: `/Users/dremacmini/Desktop/OC/TVP-Redesign-2026`
- **Build Config**: `vite.config.ts`
- **Type Checking**: `npm run lint`

### When to Contact Backend Team

- API calls failing (CORS)
- Environment variable issues
- Backend URL problems
- Health check endpoint not working

---

## Quick Fix Commands

```bash
# Full clean rebuild and deploy
cd /Users/dremacmini/Desktop/OC/TVP-Redesign-2026
rm -rf node_modules dist
npm install
npm run lint
npm run build
npm run preview  # test locally first

# Push to GitHub (auto-redeploys)
git add .
git commit -m "Fix deployment issues"
git push origin main

# Or manual Vercel deploy
npm install -g vercel
vercel --prod

# Clear Vercel cache and rebuild
vercel --prod --force
```

---

## Troubleshooting Decision Tree

```
Is site deployed?
├─ NO
│  └─ Follow VERCEL_DEPLOYMENT_GUIDE.md
│
└─ YES
   ├─ Does it load?
   │  ├─ NO (blank page / 404)
   │  │  └─ See "Blank Page or 404" section
   │  │
   │  └─ YES
   │     ├─ Does navigation work?
   │     │  ├─ NO (404 on page clicks)
   │     │  │  └─ See "Cannot GET /page" section
   │     │  │
   │     │  └─ YES
   │     │     ├─ Do API calls work?
   │     │     │  ├─ NO (CORS, timeout, undefined)
   │     │     │  │  └─ See "API Calls Failing" section
   │     │     │  │
   │     │     │  └─ YES
   │     │     │     └─ ✅ Deployment successful!
```

---

**Last Updated**: February 2026
**File Location**: `/Users/dremacmini/Desktop/OC/TVP-Redesign-2026/VERCEL_TROUBLESHOOTING.md`
