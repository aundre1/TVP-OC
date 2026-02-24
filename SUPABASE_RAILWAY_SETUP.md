# Supabase + Railway Integration Setup

## Current Status
- ✅ Frontend: Deployed on Vercel (https://tvp-redesign-2026.vercel.app)
- ✅ Backend: Deployed on Railway (https://tvp-oc-production.up.railway.app)
- 🔄 Database: Supabase PostgreSQL (needs connection)

## Supabase Credentials

| Item | Location |
| --- | --- |
| Project URL | https://jvgsmiqsqtqgfagghoiv.supabase.co |
| Anon Key | Supabase Dashboard → Settings |
| Secret Key | Supabase Dashboard → Settings (keep private!) |
| Project ID | jvgsmiqsqtqgfagghoiv |

## Step 1: Get Supabase PostgreSQL Connection String

1. Go to https://app.supabase.com/dashboard
2. Select your project (jvgsmiqsqtqgfagghoiv)
3. Navigate to: **Settings → Database → Connection string**
4. Copy the PostgreSQL connection string (it will look like):
   ```
   postgresql://postgres:[password]@db.jvgsmiqsqtqgfagghoiv.supabase.co:5432/postgres
   ```
5. Save this - you'll need it in the next step

## Step 2: Set Environment Variables on Railway

### Via Railway Dashboard (Recommended)
1. Go to https://railway.app/dashboard
2. Select project: **diplomatic-simplicity**
3. Click on the **backend** service
4. Go to **Variables** tab
5. Add the following environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Server environment |
| `PORT` | `5000` | Already set, verify it's 5000 |
| `API_URL` | `https://tvp-oc-production.up.railway.app` | Backend URL for CORS |
| `DATABASE_URL` | `postgresql://postgres:[password]@db.jvgsmiqsqtqgfagghoiv.supabase.co:5432/postgres` | **Get from Supabase Dashboard** |
| `JWT_SECRET` | `your-super-secret-random-string-min-32-chars` | Generate strong random value |
| `JWT_EXPIRY` | `24h` | Token expiration |
| `REFRESH_TOKEN_SECRET` | `your-refresh-token-secret-min-32-chars` | Generate strong random value |
| `REFRESH_TOKEN_EXPIRY` | `30d` | Refresh token expiration |
| `FRONTEND_URL` | `https://tvp-redesign-2026.vercel.app` | Frontend URL for CORS |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Optional - add when ready |
| `SENDGRID_API_KEY` | `SG.` | Optional - add when ready |

### Via Railway CLI
```bash
# Login to Railway
railway login --token 36e499c8-67dc-4485-9454-a5f4aae5abf7

# Link to project
railway link prj_tRsJcMGySrU1hFZwerQkVQMJVXSo

# Set environment variables
railway variables set NODE_ENV=production
railway variables set DATABASE_URL="postgresql://postgres:[password]@db.jvgsmiqsqtqgfagghoiv.supabase.co:5432/postgres"
railway variables set JWT_SECRET="[your-generated-secret]"
railway variables set FRONTEND_URL="https://tvp-redesign-2026.vercel.app"

# Redeploy
railway up
```

## Step 3: Generate Secure Secrets

For JWT_SECRET and REFRESH_TOKEN_SECRET, generate strong random strings:

**Option A: Using OpenSSL**
```bash
openssl rand -base64 32
```

**Option B: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Generate two different values - one for JWT_SECRET and one for REFRESH_TOKEN_SECRET.

## Step 4: Test the Connection

Once you've set the environment variables on Railway:

1. Check Railway logs to verify no connection errors
2. Frontend should auto-connect to backend
3. Test authentication flow (login/register)
4. Verify database queries are working

## Environment Variables Reference

### Required for Backend
- `NODE_ENV` - Set to `production`
- `PORT` - Backend server port (5000)
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `JWT_SECRET` - Secret for signing JWT tokens (32+ chars)
- `REFRESH_TOKEN_SECRET` - Secret for refresh tokens (32+ chars)
- `FRONTEND_URL` - Frontend URL for CORS (https://tvp-redesign-2026.vercel.app)
- `API_URL` - Backend API URL (https://tvp-oc-production.up.railway.app)

### Optional (Add Later)
- `STRIPE_SECRET_KEY` - For subscription payments
- `SENDGRID_API_KEY` - For email notifications
- `S3_*` - For video storage (if using)
- `GOOGLE_CLIENT_*` - For OAuth

## Troubleshooting

### "Connection refused" errors
- Verify DATABASE_URL is correct (copy from Supabase dashboard)
- Verify Supabase project is active
- Check Railway service status

### "Authentication failed" errors
- Verify JWT_SECRET is set and hasn't changed
- Check that frontend VITE_API_URL points to correct backend

### Frontend still shows loading screen
- Check browser console for API errors
- Verify DATABASE_URL is working (check Railway logs)
- Ensure JWT_SECRET is properly set

## Next Steps

1. ✅ Get PostgreSQL connection string from Supabase
2. ✅ Generate JWT secrets (2 values needed)
3. ✅ Set all environment variables on Railway (via dashboard or CLI)
4. ✅ Verify backend is running with new database connection
5. ✅ Test login/authentication flow on deployed frontend
6. ⏭️ Set up database schema/migrations
7. ⏭️ Configure Stripe (optional but recommended for production)
8. ⏭️ Set up email notifications via SendGrid

---

**Quick Checklist:**
- [ ] Retrieved PostgreSQL connection string from Supabase
- [ ] Generated JWT_SECRET (save it securely)
- [ ] Generated REFRESH_TOKEN_SECRET (save it securely)
- [ ] Added all required env vars to Railway
- [ ] Backend redployed successfully
- [ ] Frontend still connecting and working
- [ ] Login/register flow tested
