# Railway Environment Variables Setup

**Complete reference for all environment variables required for The Video Pool backend on Railway.**

**Status**: Ready to configure
**Required Variables**: 7 critical + 1 optional
**Difficulty**: Beginner
**Time to setup**: 5-10 minutes

---

## Quick Start

Copy this section and paste each variable into Railway Variables panel:

**Go to**: Railway Dashboard → Your Project → Variables → Add Variable

Then paste each entry below.

---

## All Environment Variables

### 1. DATABASE_URL (CRITICAL)

**What it is**: Connection string to your PostgreSQL database

**Where to get it**:
1. Open https://supabase.com/dashboard
2. Select project: `dxbtycycyvmzgufdhnae`
3. Go to **Settings** → **Database**
4. Copy the **PostgreSQL** connection string (NOT pgBouncer)

**Format**:
```
postgresql://postgres.dxbtycycyvmzgufdhnae:[PASSWORD]@db.dxbtycycyvmzgufdhnae.supabase.co:5432/postgres
```

**Example** (with redacted password):
```
postgresql://postgres.dxbtycycyvmzgufdhnae:EXAMPLEpasswordXYZ@db.dxbtycycyvmzgufdhnae.supabase.co:5432/postgres
```

**In Railway Variables**:
```
Key: DATABASE_URL
Value: postgresql://postgres.dxbtycycyvmzgufdhnae:...
```

**⚠️ Important**:
- Do NOT modify the URL
- Include the password (it's in a secure environment variable)
- Use the full string from Supabase

---

### 2. CORS_ORIGIN (CRITICAL)

**What it is**: Which frontend domains are allowed to call your backend

**Why it matters**: Prevents unauthorized websites from accessing your API

**Where to get it**: Your frontend deployment URLs

**Format** (comma-separated, no spaces):
```
https://thevideopool.com,https://tvp-oc.vercel.app
```

**Explanation**:
- `https://thevideopool.com` = Your production domain
- `https://tvp-oc.vercel.app` = Your Vercel deployment
- Separate multiple domains with commas
- NO SPACES after commas
- Always use HTTPS (not HTTP)

**In Railway Variables**:
```
Key: CORS_ORIGIN
Value: https://thevideopool.com,https://tvp-oc.vercel.app
```

**Development Note**:
- If you need to test locally, add: `http://localhost:5173`
- Format: `https://thevideopool.com,https://tvp-oc.vercel.app,http://localhost:5173`

---

### 3. JWT_SECRET (CRITICAL)

**What it is**: Secret key for signing JSON Web Tokens (authentication)

**Where to get it**:
```bash
openssl rand -hex 32
```

This generates a random string like:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**How to generate**:
1. Open Terminal on your Mac
2. Paste: `openssl rand -hex 32`
3. Press Enter
4. Copy the output (64 characters)

**In Railway Variables**:
```
Key: JWT_SECRET
Value: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**⚠️ Important**:
- Generate a NEW secret (don't reuse across projects)
- Must be at least 32 characters
- Keep it SECRET (never commit to git)
- If compromised, regenerate it

---

### 4. REFRESH_TOKEN_SECRET (CRITICAL)

**What it is**: Secret key for refresh tokens (long-lived authentication)

**Where to get it**:
```bash
openssl rand -hex 32
```

Generate a DIFFERENT secret than JWT_SECRET.

**In Railway Variables**:
```
Key: REFRESH_TOKEN_SECRET
Value: x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0
```

**⚠️ Important**:
- Generate a DIFFERENT secret than JWT_SECRET
- Each secret serves a different purpose
- Same security requirements as JWT_SECRET

---

### 5. SESSION_SECRET (CRITICAL)

**What it is**: Secret key for session cookies (authentication state)

**Where to get it**:
```bash
openssl rand -hex 32
```

Generate a DIFFERENT secret from the other two.

**In Railway Variables**:
```
Key: SESSION_SECRET
Value: m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0
```

**⚠️ Important**:
- Generate a DIFFERENT secret from JWT and REFRESH
- Users with existing sessions will be logged out if this changes
- Same security requirements as other secrets

---

### 6. NODE_ENV (CRITICAL)

**What it is**: Tells the server it's running in production

**Value for production**: `production`

**In Railway Variables**:
```
Key: NODE_ENV
Value: production
```

**Why it matters**:
- Enables performance optimizations
- Disables dev-only features
- Affects error handling and logging

**Never change this** unless you're testing something specific.

---

### 7. PORT (CRITICAL)

**What it is**: The network port your server listens on

**Value for Railway**: `3000`

**In Railway Variables**:
```
Key: PORT
Value: 3000
```

**Why Railway uses 3000**:
- Standard port for Node.js applications
- Railway expects this port
- Will be exposed via Railway's domain (no need to specify port in URL)

**Never change this** unless Railway gives you a different instruction.

---

### 8. LASTFM_API_KEY (OPTIONAL)

**What it is**: API key for Last.fm integration (music metadata)

**Value**: Leave empty if not using Last.fm

**In Railway Variables** (only if you have this):
```
Key: LASTFM_API_KEY
Value: [your-lastfm-api-key]
```

**If you don't have it**:
- Skip this variable
- The app will work fine without it
- Add it later if needed

**Get the key**:
1. Visit https://www.last.fm/api
2. Register your app
3. Copy your API key

---

## Complete Variable Set (Copy-Paste Format)

Here's all 8 variables formatted for easy copying:

```
DATABASE_URL = postgresql://postgres.dxbtycycyvmzgufdhnae:[PASSWORD]@db.dxbtycycyvmzgufdhnae.supabase.co:5432/postgres

CORS_ORIGIN = https://thevideopool.com,https://tvp-oc.vercel.app

JWT_SECRET = [run: openssl rand -hex 32]

REFRESH_TOKEN_SECRET = [run: openssl rand -hex 32]

SESSION_SECRET = [run: openssl rand -hex 32]

NODE_ENV = production

PORT = 3000

LASTFM_API_KEY = [optional - skip if not using]
```

---

## Step-by-Step: Adding Variables to Railway

### For Each Variable:

1. **Open Railway Dashboard**
   - Go to https://railway.app/dashboard
   - Select your project
   - Click the service name

2. **Click "Variables" Tab**
   - Next to Logs, Settings, etc.

3. **Click "+ Add Variable" Button**
   - Or "New Variable"

4. **Enter Key and Value**
   ```
   Key: [Variable Name]
   Value: [Variable Value]
   ```

5. **Press Enter or Click Save**
   - Variable is saved automatically

6. **Repeat for all 8 variables**

7. **Redeploy Service**
   - Railway will automatically redeploy
   - Watch Deployments tab
   - Wait for green status

---

## Verifying Variables Are Set

### In Railway Dashboard:

1. Click your service
2. Click **Variables** tab
3. You should see all 8 variables listed:
   - ✅ DATABASE_URL
   - ✅ CORS_ORIGIN
   - ✅ JWT_SECRET
   - ✅ REFRESH_TOKEN_SECRET
   - ✅ SESSION_SECRET
   - ✅ NODE_ENV
   - ✅ PORT
   - ⚠️ LASTFM_API_KEY (optional)

### In Your Logs:

Run health check after all variables are set:

```bash
curl https://[your-railway-domain]/api/health
```

Should return:
```json
{
  "status": "ok",
  "database": "connected"
}
```

If database shows "disconnected", check DATABASE_URL is correct.

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Copying Examples

**Wrong**:
```
DATABASE_URL = postgresql://postgres.dxbtycycyvmzgufdhnae:[PASSWORD]@db...
```
(with [PASSWORD] literal text)

**Right**:
```
DATABASE_URL = postgresql://postgres.dxbtycycyvmzgufdhnae:actualpassword123@db...
```
(with actual password from Supabase)

---

### ❌ Mistake 2: Missing Commas in CORS_ORIGIN

**Wrong**:
```
CORS_ORIGIN = https://thevideopool.com https://tvp-oc.vercel.app
```
(with space instead of comma)

**Right**:
```
CORS_ORIGIN = https://thevideopool.com,https://tvp-oc.vercel.app
```
(with comma, no space)

---

### ❌ Mistake 3: Using HTTP Instead of HTTPS

**Wrong**:
```
CORS_ORIGIN = http://thevideopool.com
```

**Right**:
```
CORS_ORIGIN = https://thevideopool.com
```

Always use HTTPS in production.

---

### ❌ Mistake 4: Not Regenerating Secrets

**Wrong**: Reusing JWT_SECRET as REFRESH_TOKEN_SECRET

**Right**:
```bash
# Run this 3 times to generate 3 DIFFERENT secrets
openssl rand -hex 32
openssl rand -hex 32
openssl rand -hex 32
```

Each secret should be unique.

---

### ❌ Mistake 5: Forgetting to Redeploy

**After adding variables**, Railway needs to redeploy:

1. Go to **Deployments** tab
2. Click the latest deployment
3. Click **Redeploy** button
4. Wait 2-3 minutes for redeployment

Variables don't apply until redeployed.

---

## Security Notes

### These Variables Are Secrets

- **DATABASE_URL**: Contains your database password
- **JWT_SECRET**: Signs your authentication tokens
- **REFRESH_TOKEN_SECRET**: Creates long-lived session tokens
- **SESSION_SECRET**: Encrypts user sessions

**Never**:
- Commit them to git
- Share them in Slack/email
- Log them in error messages
- Use weak/short values

**If compromised**:
1. Generate new secrets immediately
2. Update in Railway Variables
3. All existing sessions become invalid (users re-login)

### CORS_ORIGIN Security

**CORS_ORIGIN controls which websites can call your API.**

If you set:
```
CORS_ORIGIN = *
```

Any website can call your API. **Don't do this.**

Instead, list only trusted domains:
```
CORS_ORIGIN = https://thevideopool.com,https://tvp-oc.vercel.app
```

---

## Reference: Where Each Value Comes From

| Variable | Source | How to Find |
|----------|--------|-----------|
| DATABASE_URL | Supabase | Dashboard → Settings → Database → Connection String (PostgreSQL) |
| CORS_ORIGIN | Your domains | Your frontend URLs |
| JWT_SECRET | Generated | Run: `openssl rand -hex 32` |
| REFRESH_TOKEN_SECRET | Generated | Run: `openssl rand -hex 32` |
| SESSION_SECRET | Generated | Run: `openssl rand -hex 32` |
| NODE_ENV | Constant | Always: `production` |
| PORT | Constant | Always: `3000` |
| LASTFM_API_KEY | Optional | https://www.last.fm/api or skip |

---

## Troubleshooting Variables

### Issue: "DATABASE_URL is not defined"

**Cause**: DATABASE_URL variable not set or misspelled

**Fix**:
1. Check spelling: `DATABASE_URL` (capital letters)
2. Verify it's actually set in Variables tab
3. Ensure you clicked Save/Enter
4. Redeploy service

---

### Issue: "CORS errors from frontend"

**Cause**: CORS_ORIGIN doesn't include your frontend domain

**Fix**:
1. Check your frontend URL (in browser address bar)
2. Add it to CORS_ORIGIN
3. Format: `https://domain.com,https://otherdomain.com` (comma-separated)
4. Redeploy service

---

### Issue: "Authentication failing for all users"

**Cause**: JWT_SECRET or SESSION_SECRET changed or invalid

**Fix**:
1. Check JWT_SECRET is set (not empty)
2. Check SESSION_SECRET is set (not empty)
3. If you changed them, all existing sessions expire (users must re-login)
4. Use valid secrets from `openssl rand -hex 32`

---

## Testing Variables

### Test 1: Health Endpoint

```bash
curl https://[your-railway-domain]/api/health
```

Should show:
- `"database": "connected"` → DATABASE_URL is correct
- `"status": "ok"` → All variables are set

### Test 2: CORS

Open your frontend in browser and try an API call:

```javascript
fetch('https://[your-railway-domain]/api/videos')
  .then(r => r.json())
  .then(data => console.log(data))
```

Should work without CORS errors → CORS_ORIGIN is correct

### Test 3: Auth

Try to log in a user:

```javascript
fetch('https://[your-railway-domain]/api/login', {
  method: 'POST',
  body: JSON.stringify({ email: '...', password: '...' })
})
```

Should work → JWT_SECRET and SESSION_SECRET are correct

---

## Regenerating Variables

### If you need to change a secret:

1. **Generate new value**:
   ```bash
   openssl rand -hex 32
   ```

2. **Update in Railway**:
   - Variables tab → Find variable
   - Update value
   - Save

3. **Redeploy**:
   - Deployments → Redeploy latest

4. **Consequences**:
   - **JWT_SECRET**: All JWT tokens become invalid (users must re-authenticate)
   - **SESSION_SECRET**: All sessions expire (users must re-login)
   - **DATABASE_URL**: Can't connect to DB until value is correct

---

## Format Reference

### Valid Formats

**DATABASE_URL**:
```
postgresql://postgres.dxbtycycyvmzgufdhnae:password@db.dxbtycycyvmzgufdhnae.supabase.co:5432/postgres
```
- Starts with: `postgresql://`
- Includes password
- Ends with database name: `/postgres`

**CORS_ORIGIN**:
```
https://thevideopool.com,https://tvp-oc.vercel.app
```
- Comma-separated
- No spaces
- Each starts with `https://`
- Include subdomains if needed: `https://api.tvp.com`

**Secrets (JWT, REFRESH, SESSION)**:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```
- 64 characters (hex)
- No spaces
- No special characters
- Generated with: `openssl rand -hex 32`

**NODE_ENV**:
```
production
```
- Lowercase
- No quotes
- No spaces

**PORT**:
```
3000
```
- Number only
- No quotes
- No spaces

---

## Checklist: Before Going Live

- [ ] DATABASE_URL is set and tested (health check shows "connected")
- [ ] CORS_ORIGIN includes all frontend domains
- [ ] JWT_SECRET is set (64 random characters)
- [ ] REFRESH_TOKEN_SECRET is set (64 random characters, different from JWT)
- [ ] SESSION_SECRET is set (64 random characters, different from both)
- [ ] NODE_ENV is set to `production`
- [ ] PORT is set to `3000`
- [ ] Service has been redeployed after adding variables
- [ ] Health endpoint returns 200 OK
- [ ] Frontend can call API without CORS errors
- [ ] Authentication works (users can log in)

---

## Quick Summary

| Variable | Required? | Type | Example |
|----------|-----------|------|---------|
| DATABASE_URL | YES | Connection string | `postgresql://...` |
| CORS_ORIGIN | YES | Domain list | `https://domain.com,https://other.com` |
| JWT_SECRET | YES | Random (64 chars) | `a1b2c3d4e5f6...` |
| REFRESH_TOKEN_SECRET | YES | Random (64 chars) | `x9y8z7w6v5u4...` |
| SESSION_SECRET | YES | Random (64 chars) | `m1n2o3p4q5r6...` |
| NODE_ENV | YES | Constant | `production` |
| PORT | YES | Constant | `3000` |
| LASTFM_API_KEY | NO | API key | `abcd1234efgh...` |

---

## You're Ready!

Once all 8 variables are set and service is redeployed, your backend is ready for production.

**Next Step**: See **FINAL_DEPLOYMENT_READINESS.md** to check overall deployment status.

---

**Last Updated**: February 22, 2026
**Document Version**: 1.0
**Status**: Production Ready
