# The Video Pool - Railway Backend Deployment

## Railway Token Status

Tested tokens (2026-02-22):
- Token 1: `aa4dc855-5455-4053-892d-58046b65d4d7` - **INVALID** (Unauthorized)
- Token 2: `97eb1267-0f40-468f-845f-478d7dfcb9b1` - **INVALID** (Unauthorized)

**Action Required**: Both tokens failed authentication. New tokens must be generated.

---

## Step 1: Generate a Valid Railway Token

1. Go to https://railway.app
2. Log in with your Railway account
3. Click your **Profile** (bottom left)
4. Click **Tokens**
5. Click **Create Token**
6. Give it a name: "TVP Deployment"
7. Copy the token immediately (it won't be shown again)
8. Store securely

---

## Step 2: Connect Railway via Dashboard

### Option A: GitHub Integration (Recommended)

1. Go to https://railway.app
2. Click **New Project**
3. Select **Deploy from GitHub**
4. Authorize Railway to access GitHub
5. Select repo: `aundre1/TVP-OC`
6. Click **Deploy**
7. Railway will auto-detect `tvp-export/` as backend

### Option B: Manual CLI Setup

1. Store new token as environment variable:
   ```bash
   export RAILWAY_TOKEN="<your_new_token_here>"
   ```

2. Navigate to backend directory:
   ```bash
   cd /Users/dremacmini/Desktop/OC/video-pool/tvp-export
   ```

3. Link to existing Railway project (if one exists):
   ```bash
   railway link
   ```

4. If no project exists, create one:
   ```bash
   railway init
   ```

5. Deploy:
   ```bash
   railway up
   ```

---

## Step 3: Configure Environment Variables on Railway

In Railway Dashboard:

1. Click **Project** → **The Video Pool** (if created)
2. Click **Settings** → **Environment**
3. Add these variables:

```
DATABASE_URL=<from_supabase>
NODE_ENV=production
VITE_API_URL=https://<your-railway-domain>.railway.app
PORT=8000
```

4. Deploy will trigger automatically

---

## Step 4: Verify Deployment

Check Railway Dashboard for:
- Build status: ✓ Success
- Deployment status: ✓ Running
- Logs tab: Should show "Server listening on port 8000"

For CLI verification:
```bash
export RAILWAY_TOKEN="<your_valid_token>"
railway env
```

---

## Environment Variables Required

Copy from `/tvp-export/.env.backend.example`:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `postgres://user:pass@host:5432/db` |
| `NODE_ENV` | `production` |
| `PORT` | `8000` |
| `VITE_API_URL` | `https://tvp-backend.railway.app` |
| `JWT_SECRET` | (generate if needed) |
| `GOOGLE_CLIENT_ID` | (if OAuth enabled) |
| `GOOGLE_CLIENT_SECRET` | (if OAuth enabled) |

---

## Troubleshooting

**Build fails with "Module not found"**
- Ensure `package-lock.json` is committed to git
- Check `package.json` for missing dependencies
- Run `npm ci` locally to verify

**Environment variables not loading**
- Verify variables are set in Railway Dashboard, not `.env` file
- Redeploy after adding variables: `railway up`

**Port conflicts**
- Railway automatically assigns port 8000
- Backend must respect `PORT` environment variable

**Database connection fails**
- Verify `DATABASE_URL` is copied exactly from Supabase
- Check PostgreSQL connection string format:
  ```
  postgresql://user:password@host:port/database
  ```

---

## Next: Connect Frontend to Backend

Once Railway is live, update frontend:

**File**: `/src/lib/api.ts`

```typescript
const API_URL = process.env.VITE_API_URL || 'https://tvp-backend.railway.app';
```

Then redeploy frontend to Vercel.

---

**Status**: Manual setup via Railway Dashboard OR new token required
**Created**: 2026-02-22
**Action Item**: Generate new Railway token and retry deployment
