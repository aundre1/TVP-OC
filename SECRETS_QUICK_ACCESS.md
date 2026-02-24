# 🔑 Secrets Quick Access Guide

**How to find, access, and update any secret when you need it**

---

## 30-Second Access Guide

### "I need the database password"
```bash
cat .env.secrets.local | grep DATABASE_URL
```

### "I need to regenerate JWT secrets"
```bash
npm run rotate-secrets jwt
# Then update these on Railway:
# - JWT_SECRET
# - REFRESH_TOKEN_SECRET
# - SESSION_SECRET
```

### "I need to update all secrets to Railway"
```bash
# 1. Get current values
cat .env.secrets.local

# 2. Go to https://railway.app/dashboard
# 3. TVP-OC → Backend → Variables tab
# 4. Paste each value into Railway
# 5. Save and redeploy
```

---

## Secret Locations by Category

| Secret | Location | How to Get | Update Frequency |
|--------|----------|-----------|------------------|
| **DATABASE_URL** | `.env.secrets.local` | Supabase Dashboard → Settings → Database | Monthly |
| **JWT_SECRET** | `.env.secrets.local` + Railway | `npm run rotate-secrets jwt` | Quarterly |
| **REFRESH_TOKEN_SECRET** | `.env.secrets.local` + Railway | `npm run rotate-secrets jwt` | Quarterly |
| **SESSION_SECRET** | `.env.secrets.local` + Railway | `npm run rotate-secrets jwt` | Quarterly |
| **STRIPE_SECRET_KEY** | `.env.secrets.local` | Stripe Dashboard → API Keys | As needed |
| **SENDGRID_API_KEY** | `.env.secrets.local` | SendGrid → Settings → API Keys | As needed |
| **RAILWAY_TOKEN** | `.env.secrets.local` | Railway → Account → Tokens | Monthly |
| **GITHUB_TOKEN** | `.env.secrets.local` | GitHub → Settings → Developer settings → Personal access tokens | Monthly |

---

## Getting Secrets from Dashboards

### Supabase (Database)
```
1. Go to: https://app.supabase.com/dashboard
2. Login with your Supabase account
3. Click project: jvgsmiqsqtqgfagghoiv
4. Left sidebar → Settings → Database
5. Under "Connection strings" → PostgreSQL tab
6. Copy the full connection string (includes password)
7. Update .env.secrets.local: DATABASE_URL=[paste here]
```

### Railway (Deployment)
```
1. Go to: https://railway.app/dashboard
2. Login with your Railway account
3. Project: TVP-OC
4. Left sidebar → Backend service
5. Click: Variables tab
6. View/edit all environment variables
7. Look for DATABASE_URL, JWT_SECRET, etc.
```

### Stripe (Payments)
```
1. Go to: https://dashboard.stripe.com
2. Login with your Stripe account
3. Left sidebar → Developers → API keys
4. Copy: Secret Key (starts with "sk_...")
5. Update .env.secrets.local: STRIPE_SECRET_KEY=[paste here]
```

### SendGrid (Email)
```
1. Go to: https://app.sendgrid.com
2. Login with your SendGrid account
3. Left sidebar → Settings → API Keys
4. Click: Create API Key
5. Copy the key
6. Update .env.secrets.local: SENDGRID_API_KEY=[paste here]
```

### GitHub (Source Control)
```
1. Go to: https://github.com/settings/tokens
2. Login with your GitHub account
3. Click: Generate new token (classic)
4. Select scopes: repo, admin:repo_hook
5. Copy the token
6. Update .env.secrets.local: GITHUB_TOKEN=[paste here]
```

### Vercel (Frontend)
```
1. Go to: https://vercel.com/dashboard
2. Login with your Vercel account
3. Project: tvp-redesign-2026
4. Settings → Environment Variables
5. Update VITE_API_URL if needed (backend URL)
```

---

## Updating Secrets on Railway

**After updating `.env.secrets.local`, sync to Railway:**

```bash
# 1. Get all current values
cat .env.secrets.local

# 2. Go to Railway dashboard
https://railway.app/dashboard/project/prj_tRsJcMGySrU1hFZwerQkVQMJVXSo

# 3. Click: TVP-OC → Backend service

# 4. Click: Variables tab

# 5. For each secret that changed:
#    - Click the pencil icon (edit)
#    - Paste new value
#    - Click save

# 6. Railway auto-detects changes and redeploys
#    - Watch Deployments tab for green checkmark
#    - Takes ~2-3 minutes
```

---

## Emergency: Secret Exposure

**If you accidentally exposed a secret (pushed to git, pasted in Slack, etc.):**

### Immediate Actions (Within 5 minutes)
```bash
# 1. REGENERATE the secret immediately
npm run rotate-secrets jwt    # If JWT was exposed
# OR
# Go to Supabase/Stripe/etc dashboard and rotate

# 2. UPDATE on Railway
# Go to Railway → Backend → Variables
# Paste the NEW secret value
# Save and redeploy

# 3. Update .env.secrets.local with NEW value
```

### Investigation
```bash
# 1. Check git history to see if it was committed
git log --all --full-history -- .env.secrets.local
git log --all --oneline | grep -i secret

# 2. If committed:
git show <commit-hash>:.env.secrets.local

# 3. Force cleanup (if necessary)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.secrets.local' \
  --prune-empty -- --all
```

### Notification
1. Notify team lead immediately
2. Check if the platform's audit logs show any unauthorized access
3. Document the exposure incident
4. Update rotation frequency if needed

---

## Common Tasks

### Task: Weekly Secret Verification
```bash
# Verify local secrets file is intact
ls -la .env.secrets.local
# Should show: -rw------- (600 permissions)

# Verify secrets match Railway
cat .env.secrets.local | grep DATABASE_URL
# Compare with Railway → Backend → Variables

# If mismatch, update Railway with current values
```

### Task: Monthly Secret Rotation
```bash
# 1. Rotate JWT secrets
npm run rotate-secrets jwt

# 2. Go to Railway dashboard
https://railway.app/dashboard/project/prj_tRsJcMGySrU1hFZwerQkVQMJVXSo

# 3. Backend service → Variables
# Update: JWT_SECRET, REFRESH_TOKEN_SECRET, SESSION_SECRET
# Paste new values from local .env.secrets.local

# 4. Save and watch for green checkmark (redeploy)

# 5. Test login to verify new secrets work
```

### Task: Quarterly Secret Audit
```bash
# 1. Review all secrets in use
cat .env.secrets.local

# 2. For each secret, verify:
#    - Last rotation date
#    - Is it still in use?
#    - Should it be rotated?

# 3. Update ROTATED_AT timestamps
# Example: DB_PASSWORD_ROTATED_AT, JWT_ROTATED_AT

# 4. Document in SECRETS_MANAGEMENT.md
```

### Task: Onboard New Developer
```bash
# 1. Give them repo access (at least 'maintain' role)

# 2. Share secrets securely:
#    - Use password manager (1Password, Bitwarden, etc.)
#    - OR use secure file sharing (not Slack/Email)
#    - OR verbally over video call

# 3. Have them create .env.secrets.local locally:
cat > .env.secrets.local << 'EOF'
[Paste values here]
EOF
chmod 600 .env.secrets.local

# 4. Verify they can read secrets
cat .env.secrets.local | head -5

# 5. Verify they can run rotation script
npm run rotate-secrets --help
```

---

## File Permissions & Security

### Verify Permissions
```bash
# Should be 600 (read-only for owner)
ls -la .env.secrets.local
# Output: -rw------- 1 user group ...

# Fix if wrong
chmod 600 .env.secrets.local
```

### Verify Not in Git
```bash
# Should be empty (file is in .gitignore)
git status | grep .env.secrets.local

# Should show no results (file ignored)
git ls-files | grep .env.secrets.local
```

### Verify Not Exposed
```bash
# Check git history for any secrets
git log --all -S "DATABASE_URL" --source --all-match

# If found, use git filter-branch to remove
# (See "Emergency" section above)
```

---

## Troubleshooting

### "I can't read .env.secrets.local"
```bash
# Check permissions
ls -l .env.secrets.local

# If you see errors, fix with:
chmod 600 .env.secrets.local
```

### "Railway variables don't match local secrets"
```bash
# Sync from local to Railway:
# 1. Copy from .env.secrets.local
cat .env.secrets.local

# 2. Go to Railway → Variables
# 3. Update each one to match

# Or sync from Railway to local:
# 1. Go to Railway → Variables
# 2. Copy all values
# 3. Update .env.secrets.local
```

### "I forgot a secret value"
```bash
# Check Railway (source of truth)
https://railway.app/dashboard/...

# OR check backup file (if you made one)
ls ~/backups/tvp-secrets-*.backup

# Copy from backup and update local file
```

### "Secret rotation failed"
```bash
# Check script output for errors
npm run rotate-secrets 2>&1 | tail -20

# Verify .env.secrets.local is writable
chmod 600 .env.secrets.local

# Try again
npm run rotate-secrets jwt
```

---

## Contact & Support

For questions about specific secrets:
- **Database issues:** Contact Supabase support via dashboard
- **Deployment issues:** Contact Railway support via dashboard
- **Payment issues:** Contact Stripe via support
- **General questions:** Check this guide or SECRETS_MANAGEMENT.md

For team/access questions:
- Contact the project lead or DevOps team
- Request access via your team's GitHub organization

---

**Last Updated:** 2026-02-24
**Next Rotation:** 2026-03-24 (monthly)
