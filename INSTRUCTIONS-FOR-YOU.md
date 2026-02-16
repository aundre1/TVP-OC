# Instructions - What You Need to Do

## ✅ I Just Created for You:

1. **Visual Mockup**: `PREVIEW-TABLE-LAYOUT.html`
   - Open this file in any browser to see the new table layout
   - Shows Genre column, proper spacing, before/after comparison
   - [Click here to view](computer:///sessions/zealous-sleepy-keller/mnt/TVP-Redesign-2026/PREVIEW-TABLE-LAYOUT.html)

---

## 🚫 What I Cannot Do (You Must Do These):

### 1. Push to GitHub
**Why I can't:** No git credentials/access

**You do this in Terminal:**
```bash
cd ~/Desktop/TVP-Redesign-2026

# Push Steve's baseline (master branch)
git push -u origin master

# Push our UI fixes (staging branch)
git push -u origin staging/ui-fixes-feb7
```

**Expected output:**
```
Enumerating objects: 50, done.
Counting objects: 100% (50/50), done.
...
To https://github.com/aundre1/Video-Pool.git
 * [new branch]      master -> master
 * [new branch]      staging/ui-fixes-feb7 -> staging/ui-fixes-feb7
```

---

### 2. Deploy to Railway Staging
**Why I can't:** No Railway API access or browser access

**Option A: You Do It Manually (5 minutes)**

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select: `aundre1/Video-Pool`
5. **CRITICAL:** Set branch to `staging/ui-fixes-feb7` (NOT master!)
6. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://video-pool-production.up.railway.app`
7. Click "Deploy"
8. Wait 2-3 minutes for build
9. Get your staging URL: `https://video-pool-staging-xyz.railway.app`

**Option B: Use Claude in Chrome (10 minutes)**

I'll give you exact prompts to copy/paste to Claude in Chrome below.

---

## 🌐 Instructions for Claude in Chrome

If you want Claude in Chrome to handle the Railway deployment, use this:

### Step 1: Open Claude in Chrome
Make sure you have Claude in Chrome extension installed and connected to your browser.

### Step 2: Copy/Paste This Prompt:

```
I need you to deploy my GitHub repository to Railway staging environment. Here are the exact steps:

1. Navigate to https://railway.app/dashboard

2. Click "New Project"

3. Select "Deploy from GitHub repo"

4. Choose the repository: aundre1/Video-Pool

5. IMPORTANT: Set the deployment branch to "staging/ui-fixes-feb7" (NOT master)

6. Add this environment variable:
   - Variable name: VITE_API_URL
   - Value: https://video-pool-production.up.railway.app

7. Click "Deploy" and wait for the build to complete

8. Once deployed, give me the staging URL (it will look like: https://video-pool-staging-xyz.railway.app)

Please confirm each step as you complete it and let me know if you encounter any issues.
```

### Step 3: Wait for Claude to Complete
Claude in Chrome will:
- Navigate Railway
- Create the project
- Configure the branch
- Set environment variables
- Deploy
- Give you the staging URL

---

## 📋 Summary Checklist

- [ ] **View mockup**: Open `PREVIEW-TABLE-LAYOUT.html` in browser
- [ ] **Push to GitHub**: Run commands in Terminal (see above)
- [ ] **Deploy to Railway**: Either manually or via Claude in Chrome
- [ ] **Test staging URL**: Verify Genre column shows, all features work
- [ ] **Approve or iterate**: Let me know if changes needed

---

## 🆘 If You Have Issues:

**Git push fails:**
```bash
# Check if you're on the right branch
git branch

# Check remote is correct
git remote -v

# If needed, re-add remote
git remote set-url origin https://github.com/aundre1/Video-Pool.git
```

**Railway deployment fails:**
- Check that branch name is exactly: `staging/ui-fixes-feb7`
- Verify environment variable is set correctly
- Check build logs in Railway dashboard for errors

**Can't use Claude in Chrome:**
- Install extension from: https://chromewebstore.google.com/detail/claude-in-chrome
- Make sure it's connected (should show green dot)
- If not working, do manual Railway deployment (Option A above)

---

## Next After Deployment:

1. Test staging URL thoroughly
2. If good → Merge to production:
   ```bash
   git checkout master
   git merge staging/ui-fixes-feb7
   git push origin master
   ```
3. Railway production auto-deploys from master
4. Launch! 🚀

---

**Files created for you:**
- `PREVIEW-TABLE-LAYOUT.html` - Visual mockup (open now!)
- `UI-FIXES-FEB7-2026.md` - Complete change documentation
- `STAGING-DEPLOYMENT.md` - Deployment strategy
- `RAILWAY-STAGING-SETUP.md` - Railway setup guide
- `INSTRUCTIONS-FOR-YOU.md` - This file

**Current branch:** `staging/ui-fixes-feb7`
**Safe rollback:** `git checkout master`
