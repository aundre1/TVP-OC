# 🔐 Secrets Management & Automated Rotation

**The Video Pool** - Production-grade secret management with automated rotation, zero exposure to git, and secure access.

---

## Overview

This system ensures all sensitive credentials are:
- ✅ Never exposed in git history
- ✅ Rotated on a schedule (automated)
- ✅ Accessible locally for reference
- ✅ Stored with secure permissions (600 - read-only for owner)
- ✅ Encrypted in transit (only stored on secure platforms)

---

## Files Structure

```
.env.secrets.local          ← Master secrets vault (600 perms, NEVER commit)
.gitignore                  ← Prevents secrets from being committed
scripts/rotate-secrets.js   ← Automated rotation script
```

### .gitignore Protected Files
- `.env.secrets.local` - Master vault
- `.env.secrets`
- `.env.local`
- `.env.production.local`
- `secrets/`

---

## Secret Categories

### 1. Database Credentials
**File:** `.env.secrets.local`
```
SUPABASE_PROJECT_ID=jvgsmiqsqtqgfagghoiv
DATABASE_URL=postgresql://postgres:[PASSWORD]@db...
DB_PASSWORD_ROTATED_AT=2026-02-24T00:00:00Z
DB_PASSWORD_EXPIRES_AT=2026-03-24T00:00:00Z
```

**How to Access:**
1. Dashboard: https://app.supabase.com/dashboard
2. Project: jvgsmiqsqtqgfagghoiv
3. Settings → Database → Connection string (PostgreSQL tab)

**Rotation:** Monthly (automated by `rotate-secrets.js`)

---

### 2. JWT & Session Secrets
**File:** `.env.secrets.local`
```
JWT_SECRET=[64-byte base64]
REFRESH_TOKEN_SECRET=[64-byte base64]
SESSION_SECRET=[64-byte base64]
JWT_ROTATED_AT=2026-02-24T00:00:00Z
```

**How to Access:**
- These are ONLY in `.env.secrets.local` (not shared elsewhere)
- Generated locally via: `openssl rand -base64 32`
- Currently set in Railway environment variables

**Rotation:** Quarterly OR on-demand
```bash
npm run rotate-secrets jwt
```

---

### 3. API Platform Tokens
**File:** `.env.secrets.local`
```
RAILWAY_API_TOKEN=[token]
RAILWAY_TOKEN_ROTATED_AT=2026-02-24T00:00:00Z

GITHUB_TOKEN=[token]
GITHUB_ROTATED_AT=2026-02-24T00:00:00Z

VERCEL_TOKEN=[token]
VERCEL_ROTATED_AT=2026-02-24T00:00:00Z
```

**How to Access:**
- **Railway:** https://railway.app/account/tokens (login required)
- **GitHub:** https://github.com/settings/tokens (login required)
- **Vercel:** https://vercel.com/account/tokens (login required)

**Rotation:** Monthly (manual update to `.env.secrets.local`)

---

### 4. Payment & Email Providers
**File:** `.env.secrets.local`
```
STRIPE_SECRET_KEY=[key]
STRIPE_WEBHOOK_SECRET=[key]

SENDGRID_API_KEY=[key]

AWS_ACCESS_KEY_ID=[key]
AWS_SECRET_ACCESS_KEY=[key]
```

**How to Access:**
- **Stripe:** https://dashboard.stripe.com/apikeys
- **SendGrid:** https://app.sendgrid.com/settings/api_keys
- **AWS:** https://console.aws.amazon.com/iam/

**Rotation:** As needed (when revoking or security concern)

---

## How to Use Secrets

### For Development

**1. Get Current Secrets:**
```bash
cat .env.secrets.local
# (Requires local access - file has 600 permissions)
```

**2. Use in Code (Backend):**
```javascript
// In server/src/index.js
import dotenv from 'dotenv';
dotenv.config({ path: '../.env.secrets.local' });

const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;
```

**3. Use in Code (Frontend):**
```javascript
// Frontend gets secrets via environment variables
// VITE_API_URL=https://tvp-oc-production.up.railway.app/api
// Secrets are NOT exposed to frontend code
```

---

## Automated Rotation

### How It Works

1. **Scheduled rotation** on a cron job
2. **Script generates** new secrets locally
3. **Updates local** `.env.secrets.local`
4. **Manual step:** Update the secret on the actual platform
5. **Redeploy** services with new secrets

### Running Rotation

**Interactive (asks for confirmation):**
```bash
npm run rotate-secrets
```

**Automated (no prompts):**
```bash
npm run rotate-secrets:auto
```

**Rotate specific secret:**
```bash
npm run rotate-secrets jwt        # Only JWT secrets
npm run rotate-secrets supabase   # Only Supabase password
npm run rotate-secrets tokens     # Only API tokens
```

### What Each Rotation Does

#### JWT Rotation
1. Generates new JWT_SECRET (64-byte random)
2. Generates new REFRESH_TOKEN_SECRET
3. Generates new SESSION_SECRET
4. Updates `.env.secrets.local`
5. **Manual:** Update values in Railway environment variables
6. **Manual:** Redeploy backend

#### Supabase Password Rotation
1. Go to Supabase dashboard
2. Settings → Database → Reset Password
3. Copy new connection string
4. Run: `npm run rotate-secrets supabase`
5. Paste new DATABASE_URL when prompted
6. Script updates `.env.secrets.local`
7. **Manual:** Update DATABASE_URL on Railway
8. **Manual:** Redeploy backend

---

## Backup & Recovery

### Backup Secrets (Offline)

```bash
# Copy secrets to secure location (external drive, password manager, etc.)
cp .env.secrets.local ~/backups/tvp-secrets-2026-02-24.backup

# Keep this file secure:
chmod 600 ~/backups/tvp-secrets-2026-02-24.backup
```

### Disaster Recovery

If `.env.secrets.local` is lost:

1. **Railway environment variables** still have the values
2. Export from Railway dashboard:
   ```
   TVP-OC → Backend service → Variables tab → Copy all
   ```
3. Reconstruct `.env.secrets.local`:
   ```
   SUPABASE_PROJECT_ID=...
   DATABASE_URL=...
   JWT_SECRET=...
   (etc.)
   ```
4. Set proper permissions:
   ```bash
   chmod 600 .env.secrets.local
   ```

---

## Security Best Practices

### ✅ DO
- ✅ Keep `.env.secrets.local` file permissions as 600 (read-only)
- ✅ Back up secrets offline to secure location
- ✅ Rotate secrets on schedule
- ✅ Use strong random generation for new secrets
- ✅ Review who has access to the development machine
- ✅ Commit `.gitignore` entries (prevents accidental exposure)
- ✅ Regenerate secrets immediately if they're exposed

### ❌ DON'T
- ❌ Commit `.env.secrets.local` to git
- ❌ Paste secrets in chat/email/forums
- ❌ Use the same secret across environments
- ❌ Leave secrets in browser console/network tab
- ❌ Share the secrets file directly (use secure channels)
- ❌ Use simple/predictable secrets

---

## Platform-Specific Integration

### Railway Environment Variables

Railway stores and manages all active secrets. To update:

1. Go to: https://railway.app/dashboard
2. Project: **TVP-OC** → Backend service
3. Click: **Variables** tab
4. **Edit** each variable that was rotated
5. **Save** and Railway auto-redeploys with new secrets

**Current Railway Variables:**
- DATABASE_URL
- JWT_SECRET
- REFRESH_TOKEN_SECRET
- SESSION_SECRET
- CORS_ORIGINS
- FRONTEND_URL
- API_URL
- NODE_ENV
- SECURE_COOKIES

### Vercel Frontend Environment

Frontend secrets are set in Vercel dashboard:

1. Go to: https://vercel.com/dashboard
2. Project: **tvp-redesign-2026**
3. Settings → Environment Variables
4. Update VITE_API_URL if backend URL changes

**Note:** Frontend never has access to sensitive secrets (JWT, DB credentials)

---

## Rotation Schedule

| Secret | Interval | Type | Last Rotated |
|--------|----------|------|--------------|
| Database Password | Monthly | Automated | 2026-02-24 |
| JWT Secrets | Quarterly | Manual | 2026-02-24 |
| API Tokens | Monthly | Manual | 2026-02-24 |
| Stripe Keys | As needed | Manual | - |
| SendGrid Keys | As needed | Manual | - |

---

## Troubleshooting

### "Permission denied" when reading .env.secrets.local
```bash
# Fix permissions
chmod 600 .env.secrets.local
```

### "File not found: .env.secrets.local"
```bash
# Check location
ls -la .env.secrets.local

# Should be in project root, not in subdirectories
```

### "Secrets updated locally but Railway still has old values"
```bash
# Manual step: Update on Railway dashboard
# 1. Go to https://railway.app/dashboard
# 2. TVP-OC → Backend service → Variables
# 3. Update the secret values
# 4. Save and redeploy
```

### "How do I know what secrets are currently active?"
```bash
# View all secrets (file has restricted permissions)
cat .env.secrets.local

# To see just one:
grep "JWT_SECRET" .env.secrets.local
```

---

## Access Control

### Who Should Have Access?

- **Developers with deployment access:** Access to `.env.secrets.local`
- **DevOps/Infrastructure:** Full access to Railway & Supabase dashboards
- **Others:** No direct access (communicate via team lead)

### Granting Access

```bash
# To give someone read access to secrets:
# 1. Add them to project repo with at least 'maintain' role
# 2. Share .env.secrets.local via secure channel (Bitwarden, 1Password, etc.)
# 3. Set on their machine: chmod 600 .env.secrets.local

# DO NOT:
# - Share via Slack/Email/Chat
# - Commit to git
# - Share without encryption
```

---

## Next Steps

1. **Fill in placeholder values** in `.env.secrets.local`:
   ```bash
   # Get from respective dashboards:
   # - Supabase anon key: https://app.supabase.com/dashboard
   # - Railway API token: https://railway.app/account/tokens
   # - Etc.
   ```

2. **Test rotation** (non-production):
   ```bash
   npm run rotate-secrets jwt
   ```

3. **Set up cron job** for automated rotation:
   ```bash
   # Example: Rotate monthly on the 1st at 2 AM
   0 2 1 * * cd /path/to/project && npm run rotate-secrets:auto
   ```

4. **Back up secrets** to secure offline location

---

## Questions?

For issues or questions about secret management:
1. Check this guide first
2. Review `.env.secrets.local` structure
3. Check Railway dashboard for current values
4. Verify `.gitignore` prevents exposure

**Remember: These secrets are critical to production security.** Treat them with the same care as database backups and API keys.
