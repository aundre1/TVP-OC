# GitHub Secrets Reference for TVP-OC

**Repository:** aundre1/TVP-OC
**Status:** ✅ All 4 secrets configured
**Last Verified:** 2026-02-22

## Configured Secrets

| Secret | Status | Purpose |
|--------|--------|---------|
| `VERCEL_TOKEN` | ✅ Set | Authenticate with Vercel for deployment |
| `VERCEL_ORG_ID` | ✅ Set | Target Vercel organization |
| `VERCEL_PROJECT_ID` | ✅ Set | Target Vercel project |
| `RAILWAY_TOKEN` | ✅ Set | Authenticate with Railway for backend deployment |

## Current Values (Reference Only)

```
VERCEL_ORG_ID:       aora-developments-projects
VERCEL_PROJECT_ID:   prj_tRsJcMGySrU1hFZwerQkVQMJVXSo
Vercel Project Name: tvp-redesign-2026
Vercel Production:   https://new.thevideopool.com
```

## How to Update Secrets

### Using gh CLI (Recommended)

```bash
# Update any secret
gh secret set VERCEL_TOKEN --repo aundre1/TVP-OC
# Then paste token when prompted

# Or with --body flag for non-interactive
gh secret set VERCEL_ORG_ID --repo aundre1/TVP-OC --body "aora-developments-projects"
```

### Using GitHub Web UI

1. Go to: https://github.com/aundre1/TVP-OC/settings/secrets/actions
2. Click "New repository secret"
3. Enter secret name and value
4. Click "Add secret"

## Verify Secrets

```bash
gh secret list --repo aundre1/TVP-OC
```

Expected output:
```
RAILWAY_TOKEN        Updated: 2026-02-17T01:39:21Z
VERCEL_ORG_ID        Updated: 2026-02-17T01:39:20Z
VERCEL_PROJECT_ID    Updated: 2026-02-17T01:39:19Z
VERCEL_TOKEN         Updated: 2026-02-17T01:39:18Z
```

## Get New Tokens

- **Vercel Token:** https://vercel.com/account/tokens
- **Railway Token:** https://railway.app/account/tokens

## GitHub Actions Integration

These secrets are used in `.github/workflows/` to:
- Deploy to Vercel on push to main
- Deploy backend services to Railway
- Manage staging/production deployments

Example workflow usage:
```yaml
- name: Deploy to Vercel
  uses: vercel/action@master
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```
