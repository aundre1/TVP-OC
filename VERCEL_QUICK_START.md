# Vercel Deployment - Quick Start (5 Minutes)

For the impatient: Deploy TVP frontend to Vercel in under 5 minutes.

---

## Option 1: GitHub Import (Fastest - Click & Done)

```
1. Go to vercel.com/signup
2. Sign in with GitHub (videomixer@gmail.com)
3. Click "Add New" → "Project"
4. Select "TVP-Redesign-2026" repo
5. Add environment variable:
   VITE_API_URL = https://api-staging.thevideopool.com
6. Click "Deploy"
7. Wait 2 minutes
8. Get URL: https://tvp-redesign-XXXXX.vercel.app
```

**Total Time**: 2-3 minutes

---

## Option 2: CLI Deploy (For Terminal Users)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login
# → Select "Continue with GitHub"
# → Authorize in browser

# Deploy
cd /Users/dremacmini/Desktop/OC/TVP-Redesign-2026
vercel --prod

# Add env var in Vercel Dashboard:
# Settings → Environment Variables
# VITE_API_URL = https://api-staging.thevideopool.com

# Redeploy to apply env vars
vercel --prod
```

**Total Time**: 2-4 minutes

---

## Verify Deployment

After deployment:

1. **Open the URL** in browser
2. **Check DevTools** (F12) → Console tab
3. **Should see NO red errors** (warnings are OK)
4. **API calls** should go to your backend
5. **Share the URL** with team

---

## If Something Goes Wrong

**Build fails?**
- Run locally first: `npm run build`
- Check console for errors
- Fix locally, push to GitHub
- Vercel redeploys automatically

**API not connecting?**
- Check env variable is set: Vercel Dashboard → Settings
- Verify backend is running
- Add backend domain to CORS allowlist

**Blank page?**
- Open DevTools → Network tab
- Check build logs in Vercel Dashboard
- Click "Redeploy"

---

## Your Deployment URL

Once deployed:
```
https://tvp-redesign-XXXXX.vercel.app
```

Share this URL with your team. That's it!

---

## Next Steps (Optional)

- Add custom domain: `staging.thevideopool.com`
- Enable preview URLs for pull requests (auto-enabled)
- Invite team members to Vercel dashboard
- Monitor performance and errors

---

**Estimated Deploy Time**: 5 minutes total from signup to shareable URL
