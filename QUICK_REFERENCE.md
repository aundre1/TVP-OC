# The Video Pool — Quick Reference Card

**Print this or bookmark it. You'll reference it during setup and testing.**

---

## Day 1-2: Setup (Copy-Paste Commands)

### Generate Secrets (Day 2, Terminal)
```bash
# Generate JWT_SECRET
openssl rand -hex 32
# Copy output → RAILWAY VARIABLE: JWT_SECRET

# Generate REFRESH_TOKEN_SECRET (different value)
openssl rand -hex 32
# Copy output → RAILWAY VARIABLE: REFRESH_TOKEN_SECRET

# Generate SESSION_SECRET (different value)
openssl rand -hex 32
# Copy output → RAILWAY VARIABLE: SESSION_SECRET
```

### Test Supabase Connection (after setup)
```bash
# Set your DATABASE_URL
export DATABASE_URL="postgres://postgres:PASSWORD@db.XXXXX.supabase.co:5432/postgres"

# Test connection
psql $DATABASE_URL -c "SELECT version();"
# Output: PostgreSQL 15.x
```

### Test Backend Health (after Railway deployment)
```bash
# Test health endpoint
curl https://api.railway.app/api/health
# Response: {"status":"ok","timestamp":"..."}

# Test API endpoint
curl https://api.railway.app/api/genres
# Response: JSON array of genres
```

### Test Frontend Locally
```bash
# Local dev
npm run dev
# Visit: http://localhost:3001

# Production preview
npm run preview
# Visit: http://localhost:4173
```

---

## URLs You'll Need

| Service | Purpose | URL |
|---------|---------|-----|
| **Vercel** | Frontend deploy | https://vercel.com/dashboard |
| **Vercel Tokens** | Create API token | https://vercel.com/account/tokens |
| **Railway** | Backend deploy | https://railway.app/dashboard |
| **Railway Tokens** | Create API token | https://railway.app/settings/tokens |
| **Supabase** | Database | https://app.supabase.com |
| **GitHub Secrets** | Add tokens | https://github.com/aundre1/TVP-OC/settings/secrets/actions |
| **GitHub Actions** | Watch deploys | https://github.com/aundre1/TVP-OC/actions |

---

## Environment Variables Cheat Sheet

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000
VITE_RECAPTCHA_SITE_KEY=placeholder-for-mvp
VITE_GOOGLE_CLIENT_ID=placeholder-for-mvp
```

### Frontend (Vercel - Project Settings → Environment)
```
VITE_API_URL=https://api.railway.app
VITE_RECAPTCHA_SITE_KEY=your-key-from-google
VITE_GOOGLE_CLIENT_ID=your-id-from-google
```

### Backend (.env or Railway Variables)
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgres://postgres:PASSWORD@db.XXXXX.supabase.co:5432/postgres
JWT_SECRET=[run openssl rand -hex 32]
REFRESH_TOKEN_SECRET=[run openssl rand -hex 32]
SESSION_SECRET=[run openssl rand -hex 32]
FRONTEND_URL=https://tvp-oc.vercel.app
CORS_ORIGINS=https://tvp-oc.vercel.app,http://localhost:3001
ENABLE_RATE_LIMIT=true
ENABLE_CSRF_PROTECTION=true
LOG_LEVEL=info
```

---

## 4 GitHub Secrets to Add

Go to: https://github.com/aundre1/TVP-OC/settings/secrets/actions

| Name | Where to Get | Value Format |
|------|-------------|--------------|
| **VERCEL_TOKEN** | https://vercel.com/account/tokens | ABCDEfg... |
| **VERCEL_ORG_ID** | https://vercel.com/dashboard → Settings | team_XXXXX... |
| **VERCEL_PROJECT_ID** | https://vercel.com/dashboard → Settings | prj_XXXXX... |
| **RAILWAY_TOKEN** | https://railway.app/settings/tokens | XXXXX... |

---

## Deployment Checklist (Condensed)

```
FRONTEND
  ☐ npm run build (0 errors)
  ☐ npm run preview works (no 404s)
  ☐ Browser console clear (F12)
  ☐ Mobile responsive (try on phone)

BACKEND
  ☐ DATABASE_URL correct
  ☐ JWT secrets set (3 different values)
  ☐ FRONTEND_URL set to Vercel URL
  ☐ Railway deployment shows green

DATABASE
  ☐ Supabase tables created
  ☐ Seed data loaded (5 genres, 3 artists)
  ☐ Backups enabled

INTEGRATION
  ☐ curl https://api.railway.app/api/health → 200
  ☐ curl https://api.railway.app/api/genres → JSON
  ☐ Frontend loads from Vercel
  ☐ Frontend API calls successful (Network tab)

LOGS
  ☐ Vercel logs: no errors
  ☐ Railway logs: no errors
  ☐ Browser console: no errors
```

---

## GitHub Secrets Quick Setup

### Step 1: Get Tokens

**Vercel Token:**
```
https://vercel.com/account/tokens
→ Create → Name: github-actions-tvp
→ Copy token
```

**Vercel IDs:**
```
https://vercel.com/dashboard
→ TVP-OC project → Settings
→ Copy: Org ID (team_xxx) and Project ID (prj_xxx)
```

**Railway Token:**
```
https://railway.app/settings/tokens
→ Create New → Name: github-actions-tvp
→ Copy token
```

### Step 2: Add to GitHub

```
https://github.com/aundre1/TVP-OC/settings/secrets/actions
→ New repository secret (4 times):
  1. VERCEL_TOKEN = [paste]
  2. VERCEL_ORG_ID = [paste]
  3. VERCEL_PROJECT_ID = [paste]
  4. RAILWAY_TOKEN = [paste]
```

### Step 3: Test

```bash
git add .
git commit -m "test: verify auto-deploy"
git push origin main
# Check: https://github.com/aundre1/TVP-OC/actions
# Should see 2 jobs (Vercel + Railway) running/complete
```

---

## SQL Commands (Supabase)

### Check Database Connected
```sql
SELECT version();
-- PostgreSQL 15.x
```

### Count Tables
```sql
SELECT COUNT(*) FROM genres;
SELECT COUNT(*) FROM artists;
SELECT COUNT(*) FROM videos;
SELECT COUNT(*) FROM users;
```

### View Sample Data
```sql
SELECT * FROM genres LIMIT 5;
SELECT * FROM artists LIMIT 3;
```

### Create New User (Testing)
```sql
INSERT INTO users (email, username)
VALUES ('test@example.com', 'testuser');
```

---

## Troubleshooting Quick Links

| Problem | See |
|---------|-----|
| Build fails | `LAUNCH_CHECKLIST.md` Section 1 |
| Can't connect to database | `SUPABASE_SETUP.md` Troubleshooting |
| Backend won't start | `RAILWAY_SETUP.md` Troubleshooting |
| Frontend can't reach backend | `LAUNCH_CHECKLIST.md` Section 5 |
| GitHub Actions don't run | `GITHUB_SECRETS_SETUP.md` Troubleshooting |
| Deployment hangs | `RAILWAY_SETUP.md` or `SUPABASE_SETUP.md` |

---

## Health Check Commands

### All at Once (Everything)
```bash
# Frontend
curl -s https://tvp-oc.vercel.app | head -20

# Backend health
curl -s https://api.railway.app/api/health | jq .

# API endpoint
curl -s https://api.railway.app/api/genres | jq '.[] | {id, name}' | head -10

# Database (if you have psql)
psql $DATABASE_URL -c "SELECT 'DB OK' as status, COUNT(*) as genre_count FROM genres;"

# All checks passed?
echo "✅ Frontend, Backend, API, Database all operational!"
```

---

## Expected Outputs

### curl https://api.railway.app/api/health
```json
{
  "status": "ok",
  "timestamp": "2026-02-22T15:30:00Z",
  "uptime": 3600
}
```

### curl https://api.railway.app/api/genres
```json
[
  {
    "id": "uuid-1",
    "name": "Hip-Hop",
    "slug": "hip-hop",
    "color": "#FF6B6B"
  },
  {
    "id": "uuid-2",
    "name": "House",
    "slug": "house",
    "color": "#4ECDC4"
  },
  ...
]
```

### npm run build
```
✓ 2214 modules transformed.
dist/index.html          0.89 kB │ gzip:  0.40 kB
dist/assets/vendor-...   184.23 kB │ gzip: 52.89 kB
...
✓ built in 1.67s
```

---

## Common Mistakes (Avoid These)

❌ **Don't:**
- Use placeholder values in production
- Commit `.env` files to GitHub
- Share tokens in Slack/email
- Mix JWT_SECRET with REFRESH_TOKEN_SECRET
- Forget to set FRONTEND_URL in Railway
- Test with `localhost` URLs in production
- Push secrets to Git

✅ **Do:**
- Use different secrets for each variable
- Store secrets in GitHub Secrets only
- Regenerate secrets every 90 days
- Test locally before pushing
- Use HTTPS everywhere
- Check logs after deployment
- Monitor for errors first hour

---

## Timeline Reference

```
Feb 22 (Today)
  20 min: Read this file + DEPLOYMENT_STATUS_SUMMARY.md
  10 min: Supabase account + copy DATABASE_URL

Feb 23 (Tomorrow)
  5 min: Generate 3 secrets (openssl)
  5 min: Get Vercel token + IDs
  5 min: Get Railway token
  10 min: Add 4 secrets to GitHub
  20 min: Run SUPABASE_SETUP.md
  15 min: Run RAILWAY_SETUP.md
  5 min: Test push (auto-deploy)

Feb 24-25
  2-4 hrs: Run LAUNCH_CHECKLIST.md

Feb 26-27
  1-2 hrs: Final polish + fixes

Feb 28
  30 min: Final checks
  ✅ LAUNCH 🚀
```

---

## Rollback (If Needed)

**Fastest (30 seconds):**
```
Vercel → TVP-OC → Deployments
→ Click previous successful
→ Three dots → "Promote to Production"
```

**Alternative:**
```bash
git revert [commit-hash]
git push origin main
# Auto-redeploys
```

**Nuclear Option:**
```bash
git reset --hard [commit-hash]
git push --force-with-lease
# Both platforms redeploy
```

---

## Documentation Structure

```
Start here:
  ↓
DEPLOYMENT_DOCUMENTATION_INDEX.md (navigation guide)
  ↓
DEPLOYMENT_STATUS_SUMMARY.md (read first - 5 min)
  ↓
Do in order:
  1. GITHUB_SECRETS_SETUP.md (25 min)
  2. SUPABASE_SETUP.md (50 min)
  3. RAILWAY_SETUP.md (35 min)
  ↓
Then:
  LAUNCH_CHECKLIST.md (2-4 hours of testing)
  ↓
QUICK_REFERENCE.md (this file - reference during setup)
```

---

## URLs Saved (Copy-Paste Ready)

**Setup URLs:**
```
https://vercel.com/dashboard
https://vercel.com/account/tokens
https://railway.app/dashboard
https://railway.app/settings/tokens
https://app.supabase.com
https://github.com/aundre1/TVP-OC/settings/secrets/actions
https://github.com/aundre1/TVP-OC/actions
```

**Production URLs:**
```
https://tvp-oc.vercel.app (frontend)
https://api.railway.app (backend)
db.XXXXX.supabase.co (database)
```

**Status Pages:**
```
https://vercel.com/statuspage
https://railway.app/status
https://status.supabase.com
https://www.githubstatus.com
```

---

## Contact Info (If Stuck)

| Service | Support | Status |
|---------|---------|--------|
| Vercel | support@vercel.com | https://vercel.com/statuspage |
| Railway | support@railway.app | https://railway.app/status |
| Supabase | support@supabase.com | https://status.supabase.com |
| GitHub | support@github.com | https://www.githubstatus.com |

---

## Final Checklist

- [ ] Have this file bookmarked
- [ ] Know where to find all URLs (above)
- [ ] Know the 4 GitHub Secrets names
- [ ] Know the 3 secrets to generate
- [ ] Know the 3 setup guides to follow
- [ ] Ready to launch Friday
- [ ] Coffee nearby for Day 3-6 testing

---

**Print this. Bookmark this. You'll reference it constantly during setup. Go get 'em! 🚀**

**Status: You're 95% ready. Just add credentials and verify. 6 days to launch. Let's go! 🎯**
