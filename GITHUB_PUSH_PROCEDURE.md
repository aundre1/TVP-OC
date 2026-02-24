# GitHub Push Procedure for The Video Pool

**Purpose:** Step-by-step guide to commit and push code to the production GitHub repository
**Timing:** 5-10 minutes total
**Created:** February 22, 2026
**Target:** Production launch, February 28, 2026

---

## Quick Reference

**Repository:** `aundre1/TVP-OC`
**Remote:** `git@github.com:aundre1/TVP-OC.git`
**Branch:** `main` (production)
**Structure:**
- Frontend code: `/` (root directory)
- Backend code: `/tvp-export/` (subdirectory)

---

## Step 1: Verify Repository Structure

**Terminal:**
```bash
cd /Users/dremacmini/Desktop/OC/video-pool

# Check that you're in the correct repo
git remote -v

# Expected output:
# origin	git@github.com:aundre1/TVP-OC.git (fetch)
# origin	git@github.com:aundre1/TVP-OC.git (push)
```

**Verify branch:**
```bash
git branch

# Expected output:
# * main
#   (other branches may be listed)
```

**Checklist:**
- [ ] Remote is `aundre1/TVP-OC`
- [ ] Current branch is `main`
- [ ] Running from `/Users/dremacmini/Desktop/OC/video-pool`

---

## Step 2: Check Current Status

**Terminal:**
```bash
git status

# This will show:
# - Modified files
# - Untracked files
# - Deleted files
# - Branch status
```

**Review the output carefully:**

You'll see something like:
```
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what the index)
  (use "git restore <file>..." to discard changes)
	modified:   .claude/settings.local.json
	modified:   tvp-export/server/index.ts
	modified:   tvp-export/server/routes.ts

Untracked files:
  (use "git add <file>..." to include what will be committed)
	FINAL_LAUNCH_CHECKLIST.md
	GITHUB_PUSH_PROCEDURE.md
	dist/assets/...
	node_modules/...
```

**Checklist:**
- [ ] Review modified files (should be configuration/backend fixes)
- [ ] Untracked files are expected (new docs, dist/, node_modules/)
- [ ] No accidental deletions of important files
- [ ] Branch is up to date with origin

---

## Step 3: Understand What's Being Committed

### Frontend Changes
The frontend (root directory) should have minimal changes:
- Environment variable examples (`.env.example`)
- Build output (dist/)
- Configuration files (vercel.json, vite.config.ts)
- Documentation files

### Backend Changes (tvp-export/)
The backend should have changes to:
- `tvp-export/server/index.ts` - CORS configuration, environment setup
- `tvp-export/server/routes.ts` - API endpoints, health checks
- `tvp-export/server/db.ts` - Database connection setup
- `tvp-export/package.json` - Dependencies (if updated)
- Environment variable examples

**Files you SHOULD commit:**
```
tvp-export/server/index.ts
tvp-export/server/routes.ts
tvp-export/server/db.ts
.env.backend.example
.env.frontend.example
FINAL_LAUNCH_CHECKLIST.md
GITHUB_PUSH_PROCEDURE.md
DEPLOYMENT_TIMELINE.md
MONITORING_SETUP.md
TROUBLESHOOTING.md
```

**Files you should AVOID committing:**
```
node_modules/          (too large)
dist/                  (rebuilt on deploy)
.env                   (secrets - never!)
*.log                  (build logs)
.DS_Store              (Mac system files)
```

**Checklist:**
- [ ] Understand what changed
- [ ] Know why it changed
- [ ] Ready to commit with accurate message

---

## Step 4: Stage Changes (Two Approaches)

### Option A: Stage Specific Files (Recommended for Careful Deployment)

**Terminal:**
```bash
# Stage backend fixes
git add tvp-export/server/index.ts
git add tvp-export/server/routes.ts
git add tvp-export/server/db.ts

# Stage documentation
git add FINAL_LAUNCH_CHECKLIST.md
git add GITHUB_PUSH_PROCEDURE.md
git add DEPLOYMENT_TIMELINE.md
git add MONITORING_SETUP.md
git add TROUBLESHOOTING.md

# Stage environment examples
git add .env.backend.example
git add .env.frontend.example

# Stage package.json if updated
# git add package.json
# git add tvp-export/package.json

# Verify staged files
git status

# Expected output should show:
# Changes to be committed:
#   new file: FINAL_LAUNCH_CHECKLIST.md
#   new file: GITHUB_PUSH_PROCEDURE.md
#   modified: tvp-export/server/index.ts
#   ... etc
```

### Option B: Stage Everything (Less Careful)

**Terminal:**
```bash
# Stage all changes
git add .

# Check what you're staging
git status
git diff --staged | head -100

# If something looks wrong, unstage it:
# git reset tvp-export/node_modules/
```

**Recommendation:** Use Option A for controlled, professional deployments.

**Checklist:**
- [ ] Staged only intended files
- [ ] Verified with `git status`
- [ ] No node_modules or build artifacts staged

---

## Step 5: Create Commit Message

**Important:** A good commit message is crucial for code review and rollbacks.

### Commit Message Format

```
<type>: <subject>

<body>

<footer>

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

### Commit Message Examples

**Example 1 - Full Feature Commit:**
```
Deploy: Final launch preparation for The Video Pool

- Configure Supabase database connection (DATABASE_URL)
- Setup Railway environment variables (NODE_ENV, JWT secrets)
- Implement CORS configuration for Vercel frontend
- Add health check endpoint (/api/health)
- Update backend routes for production
- Add launch checklists and deployment documentation

This commit prepares the infrastructure for production launch
on February 28, 2026. All environment variables are templated
and must be filled in before deployment.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

**Example 2 - Critical Bug Fix Commit:**
```
Fix: CORS configuration blocking frontend requests

- Add explicit CORS_ORIGIN environment variable
- Set proper Access-Control-Allow-Origin headers
- Test with Vercel frontend domain
- Verify no wildcard origins in production

Fixes cross-origin requests from https://tvp-oc.vercel.app
to backend API at Railway.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

**Example 3 - Minimal Commit:**
```
Update: Deployment configuration and documentation

- Add final launch checklist
- Add GitHub push procedure
- Add deployment timeline
- Add monitoring setup guide
- Add troubleshooting guide

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

### Terminal Command to Create Commit

```bash
# Option 1: Single line (for simple changes)
git commit -m "Deploy: Final launch configuration

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Option 2: Multi-line with editor
git commit

# This opens your default editor (nano, vim, VS Code)
# Write commit message with full details
# Save and close editor
# Git will create the commit

# Option 3: Using heredoc (most reliable)
git commit -m "$(cat <<'EOF'
Deploy: Final launch preparation for The Video Pool

- Configure Supabase database connection
- Setup Railway environment variables
- Implement CORS configuration
- Add health check endpoint
- Update backend routes for production
- Add deployment documentation

This commit prepares infrastructure for production launch.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
EOF
)"
```

**Checklist:**
- [ ] Commit message is descriptive
- [ ] Includes what changed and why
- [ ] Includes Co-Authored-By line
- [ ] No secrets or sensitive data in message

---

## Step 6: Verify Commit Before Pushing

**Terminal:**
```bash
# View the commit you just made
git log --oneline -1

# Should show something like:
# abc1234 Deploy: Final launch preparation for The Video Pool

# View full commit details
git show

# Scroll through and verify:
# - Changed files look correct
# - No accidental deletions
# - No node_modules or large files

# View just file names
git diff HEAD~1 --name-only

# Check for any files you didn't mean to include
git diff HEAD~1 --name-status
```

**Checklist:**
- [ ] Commit message is correct
- [ ] Right files are included
- [ ] No accidental changes
- [ ] No large files or node_modules

---

## Step 7: Push to GitHub Main

**IMPORTANT:** This triggers automatic deployments to Vercel and Railway!

**Terminal:**
```bash
# Push to main branch
git push origin main

# Expected output:
# Enumerating objects: 23, done.
# Counting objects: 100% (23/23), done.
# Delta compression using up to 8 threads
# Compressing objects: 100% (15/15), done.
# Writing objects: 100% (15/15), 2.34 MiB, done.
# Total 15 (delta 8), reused 2 (delta 0)
# remote: Resolving deltas: 100% (8/8), done.
# To github.com:aundre1/TVP-OC.git
#    fd45979..abc1234  main -> main
```

**If push is rejected:**
```bash
# Someone else pushed before you
git pull origin main
# Resolve any conflicts
git push origin main
```

**Checklist:**
- [ ] Push succeeds without errors
- [ ] No authentication errors
- [ ] Output shows commit hash
- [ ] GitHub website shows new commit within 30 seconds

---

## Step 8: Monitor GitHub Actions

**Location:** https://github.com/aundre1/TVP-OC/actions

**What to watch:**

1. **Workflow Trigger**
   ```
   Look for your commit message in the workflow list
   Should say: "Deploy: Final launch preparation..."
   Status will show as: Running (yellow circle)
   ```

2. **Wait for completion (3-10 minutes)**
   ```
   Workflow will execute:
   - Checkout code
   - Build frontend (npm run build)
   - Deploy to Vercel
   - Build backend
   - Deploy to Railway
   ```

3. **Verify all steps pass**
   ```
   Each step should have a green checkmark ✓
   No red X marks (those are failures)
   ```

**Common steps you'll see:**
- `Checkout` - Getting code from GitHub
- `Setup Node.js` - Preparing build environment
- `Install dependencies` - npm install
- `Build` - npm run build
- `Deploy to Vercel` - Frontend deployment
- `Deploy to Railway` - Backend deployment

**Success indicators:**
```
✓ Checkout
✓ Setup Node.js
✓ Install dependencies
✓ Build frontend
✓ Deploy to Vercel
✓ Build backend
✓ Deploy to Railway
```

**Timing:**
- Vercel build: 2-3 minutes
- Railway build: 3-5 minutes
- **Total: ~10 minutes**

**Checklist:**
- [ ] Workflow triggered automatically
- [ ] All steps showing green checkmarks
- [ ] No failed steps
- [ ] Deployment completed

---

## Step 9: Verify Deployments

### Verify Vercel Frontend

**Terminal:**
```bash
# Check frontend is live
curl -s -I https://tvp-oc.vercel.app | head -5

# Expected:
# HTTP/2 200
# content-type: text/html; charset=utf-8
# cache-control: public, max-age=0, must-revalidate

# Or go to:
# https://vercel.com/aundre1/the-video-pool/deployments
# Look for green checkmark next to latest commit
```

**Checklist:**
- [ ] Frontend returns HTTP 200
- [ ] Vercel dashboard shows "Ready"
- [ ] Can access https://tvp-oc.vercel.app

### Verify Railway Backend

**Terminal:**
```bash
# Check backend health
RAILWAY_URL="https://your-railway-url.up.railway.app"
curl -s $RAILWAY_URL/api/health | jq .

# Expected:
# {
#   "status": "ok",
#   "timestamp": "2026-02-22T...",
#   "version": "6.0.0"
# }

# Or go to:
# https://railway.app/dashboard
# Look for green checkmark on latest deployment
```

**Checklist:**
- [ ] Backend returns HTTP 200 from health endpoint
- [ ] Railway dashboard shows "Success"
- [ ] API responds to requests

---

## Step 10: Post-Push Validation

### Check that changes are live

**Terminal:**
```bash
# Frontend - verify new deployment
curl -s https://tvp-oc.vercel.app/index.html | grep -o "version"

# Backend - verify new endpoint
curl -s https://your-railway-url.up.railway.app/api/health

# Check git status is clean
git status
# Should show: "nothing to commit, working tree clean"
```

### Monitor for errors

**Next 30 minutes:**
- [ ] Check Vercel dashboard for errors (https://vercel.com/dashboard)
- [ ] Check Railway logs for errors (https://railway.app/dashboard)
- [ ] Check GitHub Actions workflow (https://github.com/aundre1/TVP-OC/actions)
- [ ] No error alerts or notifications

### Document the deployment

**Create memory note:**
```bash
# Add to daily log
cat >> /Users/dremacmini/Desktop/OC/memory/daily/2026-02-22.md << 'EOF'

## Deployment Event

**Time:** [timestamp]
**Commit:** [commit hash from git log]
**Message:** Deploy: Final launch preparation
**Status:** ✓ SUCCESSFUL

Vercel: Green ✓
Railway: Green ✓
Health check: Working ✓

All systems ready for February 28 launch.
EOF
```

**Checklist:**
- [ ] Changes are live and working
- [ ] No errors in dashboards
- [ ] Deployment documented

---

## Troubleshooting Push Failures

### Issue: Push is rejected with "permission denied"

**Problem:** SSH key not configured or expired

**Solution:**
```bash
# 1. Check SSH key
ssh -T git@github.com
# Should say: "Hi aundre1! You've successfully authenticated"

# 2. If that fails, add SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"
# Then add public key to https://github.com/settings/keys

# 3. Try push again
git push origin main
```

### Issue: Push fails with "merge conflict"

**Problem:** Someone else pushed to main before you

**Solution:**
```bash
# 1. Pull latest changes
git pull origin main

# 2. Resolve conflicts (if any appear)
# Open conflicted files and fix manually

# 3. Commit merge
git add .
git commit -m "Merge branch 'main' into main"

# 4. Push again
git push origin main
```

### Issue: GitHub Actions workflow fails

**Problem:** Build or deploy step failed

**Solution:**
1. Go to https://github.com/aundre1/TVP-OC/actions
2. Click on failed workflow
3. Expand failed step to see error message
4. Common issues:
   - Missing environment variables (check Vercel/Railway settings)
   - Build errors (check npm logs)
   - Deployment permission errors (check API tokens)

**Fix and retry:**
```bash
# If you need to fix something in code:
git add .
git commit -m "Fix: [describe what was wrong]"
git push origin main
# Workflow will automatically trigger again

# If it's an environment variable issue:
# Don't commit again - fix in Vercel/Railway dashboard
# Then manually trigger deploy
```

### Issue: Commit message has a typo

**If commit hasn't been pushed yet:**
```bash
# Amend the commit
git commit --amend -m "Correct message here"
git push origin main
```

**If commit is already pushed:**
```bash
# Create a new commit to fix
git commit --allow-empty -m "fix: Correct previous message

Previous message had typo. This commit fixes it.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
git push origin main
```

---

## Quick Reference: Complete Push Sequence

**For the impatient:**

```bash
# 1. Navigate to repo
cd /Users/dremacmini/Desktop/OC/video-pool

# 2. Check status
git status

# 3. Stage changes
git add tvp-export/server/index.ts
git add tvp-export/server/routes.ts
git add FINAL_LAUNCH_CHECKLIST.md
git add GITHUB_PUSH_PROCEDURE.md
git add DEPLOYMENT_TIMELINE.md
git add MONITORING_SETUP.md
git add TROUBLESHOOTING.md

# 4. Create commit
git commit -m "Deploy: Final launch configuration

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# 5. Push to main
git push origin main

# 6. Wait for GitHub Actions
# Watch: https://github.com/aundre1/TVP-OC/actions

# 7. Verify deployments
curl -s https://tvp-oc.vercel.app
curl -s https://your-railway-url.up.railway.app/api/health
```

**Total time:** ~15 minutes (including GitHub Actions wait time)

---

## Post-Push Checklist

**After push is complete:**

- [ ] GitHub shows new commit in main branch
- [ ] GitHub Actions workflow is running or completed
- [ ] Vercel shows new deployment as "Ready"
- [ ] Railway shows deployment as "Success"
- [ ] Frontend loads: https://tvp-oc.vercel.app
- [ ] Backend responds: https://your-railway-url.up.railway.app/api/health
- [ ] No errors in Vercel logs
- [ ] No errors in Railway logs
- [ ] All tests passing in GitHub Actions

**Success:** Your code is now live in production!

---

## Important Notes

**Never commit:**
- `.env` files (secrets)
- `node_modules/` (dependencies)
- Build artifacts unless necessary
- Personal credentials
- API keys or tokens

**Always:**
- Write meaningful commit messages
- Include Co-Authored-By line
- Test locally before pushing
- Monitor deployment status
- Be ready to rollback if needed

**Remember:**
- Main branch is production
- Every push to main triggers deployment
- Changes are live within 10 minutes
- Rollback available if needed

---

**Created:** February 22, 2026
**Version:** 1.0
**Owner:** Aundre Oldacre
**Status:** Ready for launch
