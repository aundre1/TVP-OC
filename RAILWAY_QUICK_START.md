# Railway Deployment - Quick Start (5 Minutes)

Get TVP Redesign 2026 staging live on Railway in 5 minutes.

## Step 1: Go to Railway (1 minute)

1. Visit https://railway.app
2. Click "Start Project" or "New Project"
3. Sign in with GitHub

## Step 2: Create Project (1 minute)

1. Click **"Deploy from GitHub repo"**
2. Search and select **TVP-Redesign-2026**
3. Select your branch (main or staging)
4. Click **"Deploy"**

Railway auto-detects `railway.json` and `railway.Dockerfile` - no manual config needed!

## Step 3: Set Environment Variables (1 minute)

In the Railway dashboard:

1. Go to **Variables** tab
2. Click **"Raw Editor"**
3. Paste:
   ```
   VITE_API_URL=https://api-staging.thevideopool.com
   NODE_ENV=production
   ```
4. Click **Save**

## Step 4: Deploy (2 minutes)

Railway starts building automatically:
- Watch logs scroll in real-time
- Build completes in ~3-5 minutes
- You'll see "Successfully deployed" ✓

## Step 5: Get Your URL

In the **"Deployments"** tab:
- You'll see your live deployment URL
- Click to visit your app
- Should see TVP Redesign loading

## Optional: Add Custom Domain

1. Click **Domains** in project
2. Click **"+ Add Domain"**
3. Enter: `staging.thevideopool.com`
4. Update DNS CNAME to Railway URL
5. Wait 5-30 minutes for DNS propagation

## Done!

Your staging environment is live!

```
https://[random-url].railway.app
OR
https://staging.thevideopool.com (if custom domain set)
```

## Troubleshooting

**Build fails?**
- Check environment variables are set
- Verify `npm run build` works locally

**Site won't load?**
- Check Logs tab for errors
- Refresh browser (hard refresh: Cmd+Shift+R)

**Custom domain not working?**
- Run: `nslookup staging.thevideopool.com`
- Wait for DNS propagation (up to 48h)

## Need Details?

Read the full guide: `RAILWAY_DEPLOYMENT.md`

---

**That's it! Your staging environment is ready to go.** 🚀
