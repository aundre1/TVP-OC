# Railway Deployment Checklist

Complete checklist for deploying TVP Redesign 2026 to Railway staging environment.

---

## Pre-Deployment (Local Testing)

### Code Quality
- [ ] Run `npm run build` locally - builds successfully
- [ ] Run `npm run preview` locally - preview works
- [ ] Visit http://localhost:4173 - site loads
- [ ] Check browser console (F12) - no critical errors
- [ ] Run `npm run lint` - no linting errors
- [ ] Run `npm run test:run` - tests pass

### Repository Status
- [ ] All code committed: `git status` shows clean
- [ ] `package-lock.json` is committed
- [ ] `railway.json` is committed
- [ ] `railway.Dockerfile` is committed
- [ ] `.dockerignore` is committed
- [ ] No environment secrets in code

### Configuration Files
- [ ] `railway.json` exists and is valid
- [ ] `railway.Dockerfile` exists and builds
- [ ] `.dockerignore` optimized for build size
- [ ] No hardcoded API URLs in source code

---

## Railway Account Setup

### Create/Configure Railway Account
- [ ] Go to https://railway.app
- [ ] Create account or sign in
- [ ] Add payment method (if required)
- [ ] Verify email address
- [ ] Enable 2FA for security

### GitHub Connection
- [ ] Authorize Railway to access GitHub
- [ ] Grant access to TVP-Redesign-2026 repo
- [ ] No authentication issues

---

## Railway Project Creation

### Create New Project
- [ ] Click "New Project" in Railway dashboard
- [ ] Select "Deploy from GitHub repo"
- [ ] Search for TVP-Redesign-2026
- [ ] Select correct branch (main or staging)
- [ ] Railway detects `railway.json` (should be automatic)

### Verify Configuration Detection
- [ ] Railway detects `railway.Dockerfile`
- [ ] Docker build method selected
- [ ] Start command shows `npm run preview`
- [ ] Port 4173 is configured

---

## Environment Variables Configuration

### Set Required Variables
- [ ] Add `VITE_API_URL=https://api-staging.thevideopool.com`
- [ ] Add `NODE_ENV=production`
- [ ] Add `VITE_LOG_LEVEL=info`

### Verify Variables
- [ ] Variables visible in Railway dashboard
- [ ] No typos in variable names
- [ ] No sensitive data exposed
- [ ] Staging API URL is correct

### Optional Advanced Variables
- [ ] Add `VITE_FEATURE_FLAGS` if needed
- [ ] Add analytics keys if configured
- [ ] Add Stripe keys if payment configured

---

## Build Configuration

### Docker Build
- [ ] Build uses `railway.Dockerfile`
- [ ] Multi-stage build configured (builder + runtime)
- [ ] Node 20-Alpine used
- [ ] `npm ci` instead of `npm install`
- [ ] `npm run build` command in Dockerfile

### Build Optimization
- [ ] Build cache enabled
- [ ] `.dockerignore` minimizes context size
- [ ] No unnecessary files copied
- [ ] Build expected to complete in <5 minutes

---

## Initial Deployment

### Monitor Build
- [ ] Click "Deploy" button
- [ ] Build logs appear in real-time
- [ ] Watch for:
  - `npm ci` completing
  - `npm run build` completing
  - Docker layer caching
  - No error messages

### Build Success
- [ ] Build completes without errors
- [ ] "Build successful" message appears
- [ ] Deployment proceeds automatically
- [ ] Build took < 5 minutes

### Service Startup
- [ ] Container starts
- [ ] Logs show "npm run preview"
- [ ] Port 4173 available
- [ ] Health check passes (HTTP 200)

---

## Post-Deployment Testing

### Access Application
- [ ] Click deployment URL in Railway
- [ ] Page loads without errors
- [ ] Expected content displays

### Browser Testing
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab - no critical errors
- [ ] Check Network tab - assets load
- [ ] CSS and styling applied correctly
- [ ] Images load properly

### Functionality Testing
- [ ] Navigation works
- [ ] Click through main pages
- [ ] Forms submit if present
- [ ] API calls work (Network tab)
- [ ] Response times reasonable

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test tablet view (768px)
- [ ] Test mobile view (375px)
- [ ] Layouts respond correctly

---

## Monitoring Setup

### Enable Notifications
- [ ] Configure Slack integration (optional)
- [ ] Enable email notifications
- [ ] Set alert email address
- [ ] Test notification works

### Configure Alerts
- [ ] Memory usage alerts > 300 MB
- [ ] CPU usage alerts > 50%
- [ ] Error rate alerts > 1%
- [ ] Deployment failure alerts
- [ ] Service down alerts

### Health Check
- [ ] Health check endpoint responds
- [ ] Health check interval: 30 seconds
- [ ] Health check timeout: 10 seconds
- [ ] Retry count: 3

---

## Custom Domain (Optional)

### Set Custom Domain
- [ ] Click "Domains" in Railway project
- [ ] Add domain: `staging.thevideopool.com`
- [ ] Copy CNAME target from Railway
- [ ] Save Railway configuration

### Update DNS
- [ ] Go to domain registrar
- [ ] Create CNAME record:
  - Host: `staging`
  - Value: `[railway-url]`
  - TTL: 300
- [ ] Save DNS changes

### Verify DNS Resolution
- [ ] Wait 5-30 minutes for propagation
- [ ] Run: `nslookup staging.thevideopool.com`
- [ ] Verify it resolves to Railway
- [ ] Test https://staging.thevideopool.com
- [ ] SSL certificate auto-issued

---

## Auto-Deployment Configuration

### Enable GitHub Auto-Deploy
- [ ] Go to Railway project Settings
- [ ] Click "GitHub"
- [ ] Enable "Auto Deploy"
- [ ] Select branches to auto-deploy
- [ ] Save configuration

### Test Auto-Deploy
- [ ] Make small code change locally
- [ ] Commit and push to GitHub
- [ ] Railway detects push
- [ ] Build starts automatically
- [ ] Deployment completes
- [ ] Changes visible in app

---

## Performance Validation

### Build Metrics
- [ ] Build time: < 5 minutes (actual: ___)
- [ ] Deploy time: < 2 minutes (actual: ___)
- [ ] Container size: < 200 MB (actual: ___)

### Runtime Metrics
- [ ] Memory usage: 50-150 MB (actual: ___)
- [ ] CPU usage: < 10% idle (actual: ___)
- [ ] Response time: < 1 second (actual: ___)

### Bundle Metrics
- [ ] Bundle size: < 1.5 MB gzipped (actual: ___)
- [ ] First Contentful Paint: < 2s (actual: ___)
- [ ] Time to Interactive: < 3s (actual: ___)

---

## Logging and Monitoring

### View Logs
- [ ] Access Logs tab in Railway
- [ ] View build logs
- [ ] View deploy logs
- [ ] View service logs
- [ ] No error patterns visible

### Set Up Log Monitoring
- [ ] CLI installed: `railway` command works
- [ ] Can view live logs: `railway logs --tail`
- [ ] Can search logs for errors
- [ ] Log retention configured (30 days default)

---

## Security Checklist

### Secrets Management
- [ ] No API keys in repository
- [ ] No database passwords in code
- [ ] All secrets in Railway Variables
- [ ] No secrets in environment files

### Environment Isolation
- [ ] Staging API URL different from production
- [ ] Database connections correct
- [ ] External service URLs correct
- [ ] Feature flags appropriate for staging

### Access Control
- [ ] Only authorized users can access Railway project
- [ ] 2FA enabled on Railway account
- [ ] GitHub access limited to necessary repos
- [ ] Deployment logs not exposed publicly

---

## Backup and Disaster Recovery

### Configuration Backup
- [ ] Export environment variables: `railway variables list > backup.txt`
- [ ] Save current deployment URL
- [ ] Document custom domain configuration
- [ ] Record database/external service URLs

### Recovery Testing
- [ ] Previous deployments accessible for rollback
- [ ] Can manually trigger redeploy
- [ ] Can clear cache and rebuild
- [ ] Disaster recovery procedure documented

---

## Documentation

### Create Runbook
- [ ] Update deployment instructions
- [ ] Document common issues and solutions
- [ ] Record team access procedures
- [ ] Note any special configurations

### Communication
- [ ] Notify team of staging URL
- [ ] Share access instructions
- [ ] Document feature branch deployments
- [ ] Update project README

---

## Final Verification (Go-Live Checklist)

### Before Marking as "Production Ready"

1. **Functionality** - All features work
   - [ ] Search works
   - [ ] Filters work
   - [ ] Authentication works (if implemented)
   - [ ] Forms submit correctly

2. **Performance** - Meets baselines
   - [ ] Page loads < 2 seconds
   - [ ] No memory leaks after 1 hour use
   - [ ] No console errors after interactions

3. **Stability** - Uptime verified
   - [ ] Service running > 1 hour without restart
   - [ ] Health checks all passing
   - [ ] No automatic restarts triggered

4. **Monitoring** - Alerts configured
   - [ ] At least one notification method active
   - [ ] Team notified of critical issues
   - [ ] Log review procedure documented

5. **Documentation** - Team ready
   - [ ] Deployment guide complete
   - [ ] Team trained on access
   - [ ] Troubleshooting guide available
   - [ ] Support contacts documented

---

## Sign-Off

- **Deployed By:** _________________ Date: _______
- **Reviewed By:** _________________ Date: _______
- **Approved By:** _________________ Date: _______

### Deployment Details
- **URL:** https://staging.thevideopool.com
- **Build Number:** _______
- **Git Commit:** _______
- **Deployment Time:** _______
- **Deployment ID:** _______

---

## Next Steps After Deployment

1. [ ] Announce staging URL to team
2. [ ] Begin QA testing
3. [ ] Monitor logs for first 24 hours
4. [ ] Collect feedback from team
5. [ ] Plan feature deployment if needed
6. [ ] Schedule next review/optimization

---

## Quick Reference

### URLs
- **Dashboard:** https://railway.app
- **Staging App:** https://staging.thevideopool.com
- **GitHub Repo:** https://github.com/[user]/TVP-Redesign-2026
- **API Base:** https://api-staging.thevideopool.com

### Key Files
- **Configuration:** railway.json
- **Dockerfile:** railway.Dockerfile
- **Deployment Guide:** RAILWAY_DEPLOYMENT.md
- **Monitoring Guide:** RAILWAY_MONITORING.md

### Support
- **Railway Docs:** https://docs.railway.app
- **Report Issue:** Create GitHub issue
- **Team Chat:** [your-slack-channel]

---

**Last Updated:** February 16, 2026
**Project:** TVP Redesign 2026 (Staging)
**Status:** Ready for Deployment
