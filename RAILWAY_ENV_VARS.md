# Railway Environment Variables - Ready to Set

## Generated Secrets (Keep Secure!)

```
JWT_SECRET = tleVmpgH1Y+PjbojIwTSeEEm5lhVcmnZNUku1Yr2a00=
REFRESH_TOKEN_SECRET = ernqQhNZzcO2x7jz/jIKHsZP3Gp6vR/UY3L126mImfE=
```

## All Required Environment Variables

Copy and paste these into Railway dashboard → Backend Service → Variables tab:

```
NODE_ENV=production
PORT=5000
API_URL=https://tvp-oc-production.up.railway.app
FRONTEND_URL=https://tvp-redesign-2026.vercel.app
JWT_SECRET=tleVmpgH1Y+PjbojIwTSeEEm5lhVcmnZNUku1Yr2a00=
JWT_EXPIRY=24h
REFRESH_TOKEN_SECRET=ernqQhNZzcO2x7jz/jIKHsZP3Gp6vR/UY3L126mImfE=
REFRESH_TOKEN_EXPIRY=30d
```

## Missing: Supabase Database URL

⚠️ **ACTION REQUIRED**: Get this from Supabase dashboard:

1. Go to https://app.supabase.com/dashboard
2. Select project: **jvgsmiqsqtqgfagghoiv**
3. Click: **Settings** → **Database** → **Connection string**
4. Copy the PostgreSQL URI (looks like):
   ```
   postgresql://postgres:PASSWORD@db.jvgsmiqsqtqgfagghoiv.supabase.co:5432/postgres
   ```
5. Add to Railway as:
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@db.jvgsmiqsqtqgfagghoiv.supabase.co:5432/postgres
   ```

## Step-by-Step: Set Variables in Railway Dashboard

1. Open https://railway.app/dashboard
2. Click on project: **diplomatic-simplicity**
3. Click on the **backend** service
4. Go to **Variables** tab
5. For each variable above:
   - Click **+ New Variable**
   - Enter the name (left column)
   - Enter the value (right column)
   - Press Enter
6. Scroll down and add the DATABASE_URL once you get it from Supabase
7. Click **Deploy** button to redeploy with new variables

## Verification Checklist

After setting variables:
- [ ] All 9 variables appear in Railway Variables tab
- [ ] Backend service restarts (check in Deployments tab)
- [ ] No errors in Railway logs
- [ ] Frontend still accessible and responsive
- [ ] Try login/register to test database connection

## If Database Connection Fails

Check:
1. DATABASE_URL format is correct (starts with `postgresql://`)
2. Supabase project is active and running
3. Railway logs for connection errors: Railways dashboard → backend → Logs tab
4. Frontend shows specific error message in browser console

---

**Note**: Once DATABASE_URL is added and backend is redeployed, the app should:
- Allow user registration/login
- Store data in Supabase PostgreSQL
- Serve video data from database
- Handle subscriptions and user downloads
