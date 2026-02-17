# Railway Monitoring and Maintenance Guide

Complete monitoring setup and maintenance procedures for TVP Redesign 2026 staging deployment on Railway.

---

## Real-Time Monitoring

### Access Dashboard

1. Go to https://railway.app
2. Select your TVP Redesign 2026 project
3. Click **"Logs"** tab for real-time monitoring

### Key Metrics to Watch

| Metric | Normal Range | Warning | Critical |
|--------|--------------|---------|----------|
| Memory Usage | 50-150 MB | >300 MB | >400 MB |
| CPU Usage | <10% | 20-50% | >50% |
| Response Time | <1s | 1-3s | >3s |
| Error Rate | <0.1% | 0.1-1% | >1% |
| Uptime | 99%+ | 95-99% | <95% |

### View Logs in Real-Time

**Browser Dashboard:**
1. Click **"Logs"** in Railway project
2. Choose log type:
   - **Build Logs** - Build process output
   - **Deploy Logs** - Deployment process
   - **Service Logs** - Application runtime

**CLI:**
```bash
railway logs --tail
```

---

## Health Checks

### Automatic Health Monitoring

Railway automatically monitors:

```bash
# Health check endpoint (every 30 seconds)
GET http://localhost:4173
Expected: HTTP 200

# Check interval: 30 seconds
# Timeout: 10 seconds
# Retries: 3 times
# Restart if unhealthy: Yes
```

### Manual Health Verification

```bash
# From your machine
curl -I https://staging.thevideopool.com

# Expected response
# HTTP/2 200
# Content-Type: text/html
# Cache-Control: public, max-age=3600
```

### Health Check Logs

In Railway dashboard **Logs** tab, look for:

```
Health check passed ✓
Service is running normally
```

Or errors like:

```
Health check failed
Service restart initiated
Retrying... (1/3)
```

---

## Monitoring Setup

### Step 1: Enable Deployment Notifications

1. Go to **Settings** > **Notifications**
2. Choose notification method:
   - Email
   - Slack
   - Discord
   - Webhook

3. Enable alerts for:
   - Deployment started
   - Deployment succeeded
   - Deployment failed
   - Service crashed

### Step 2: Set Up Alerts

In Railway project:

1. Click **"Settings"**
2. Scroll to **"Alerts"**
3. Configure thresholds:

```
Alert when:
- Memory > 350 MB
- CPU > 50%
- Error rate > 1%
- Response time > 5s
- Service down for > 5 minutes
```

### Step 3: Create Slack Integration (Recommended)

```bash
# 1. Create Slack webhook: https://api.slack.com/apps
# 2. Create "Incoming Webhooks"
# 3. Copy webhook URL
# 4. Paste in Railway Settings > Alerts > Slack
```

Example notification:
```
[Railway] TVP Redesign Staging - Deployment failed
Branch: main
Commit: abc123def456
Error: npm build exited with code 1
```

---

## Performance Monitoring

### Track Performance Metrics

**View in Railway Dashboard:**

1. Go to **Deployments**
2. Select latest deployment
3. View performance stats:
   - Build time (target: <5 minutes)
   - Deployment time (target: <2 minutes)
   - Container startup time (target: <30s)

### Performance Baseline

Target metrics for TVP Redesign 2026:

| Metric | Target | Actual |
|--------|--------|--------|
| Build Time | <5 min | ___ |
| Deploy Time | <2 min | ___ |
| First Paint | <2s | ___ |
| Time to Interactive | <3s | ___ |
| Lighthouse Score | >90 | ___ |
| Bundle Size | <1.5 MB (gzipped) | ___ |
| Memory Usage | <150 MB | ___ |
| Uptime | 99.9% | ___ |

### Monitor Bundle Size

After each deployment:

```bash
# Analyze locally
npm run build

# Check dist/ folder size
du -sh dist/

# Target: < 1.5 MB gzipped
```

---

## Log Analysis

### Understanding Build Logs

**Healthy build log:**
```
Starting build...
npm ci
added 500 packages
npm run build
vite build
✓ 1234 modules transformed
dist/index.html (2.34 kb)
dist/assets/main-a1b2c3d4.js (512 kb)
✓ built in 45.2s
```

**Failed build:**
```
npm ERR! code E404
npm ERR! 404 not found - [package-name]@[version]

npm ERR! You can request it here:
npm ERR! https://npm.im/[package-name]
```

### Filter Logs by Type

```bash
# View only errors
railway logs | grep ERROR

# View only warnings
railway logs | grep WARN

# View deployment events
railway logs | grep deploy

# View health checks
railway logs | grep health
```

### Search for Issues

Common error patterns:

```
# TypeScript error
error TS[XXXX]: Property '[name]' does not exist

# Build failed
error: unknown option '-[flag]'

# Port already in use
listen EADDRINUSE: address already in use :::4173

# Out of memory
JavaScript heap out of memory
```

---

## Maintenance Tasks

### Weekly Checks

- [ ] Review logs for errors/warnings
- [ ] Check uptime percentage
- [ ] Monitor memory usage trends
- [ ] Test custom domain resolution
- [ ] Verify deployments complete successfully

### Monthly Maintenance

- [ ] Review performance metrics
- [ ] Update dependencies locally
- [ ] Test backup/recovery procedures
- [ ] Review monitoring alerts
- [ ] Clean up old deployments

### Quarterly Review

- [ ] Update environment variables if needed
- [ ] Review and update railway.Dockerfile
- [ ] Check Railway pricing/plan adequacy
- [ ] Security audit of deployed app
- [ ] Performance optimization review

---

## Recovery Procedures

### Service Crash - Quick Recovery

If service crashes:

1. **Check Logs**
   ```bash
   railway logs --tail
   ```

2. **Manual Restart**
   - Go to Railway dashboard
   - Click **"Restart"** button
   - Service restarts automatically

3. **Check Health**
   ```bash
   curl -I https://staging.thevideopool.com
   ```

### Rollback to Previous Deployment

If latest deployment is broken:

1. Go to **Deployments** tab
2. Click on previous successful deployment
3. Click **"Rollback"** button
4. Service reverts to previous version

### Clear Build Cache

If build is corrupted:

1. Go to **Settings**
2. Click **"Clear Build Cache"**
3. Push new commit to trigger rebuild
4. Or manually click **"Redeploy"**

---

## Troubleshooting Guide

### Symptom: Service keeps restarting

**Diagnosis:**
1. Check Logs for error messages
2. Look for "exited with code" messages
3. Check memory/CPU usage

**Fix:**
```bash
# View recent logs
railway logs --follow

# If OOM (Out of Memory):
# - Upgrade Railway plan
# - Optimize bundle size

# If application error:
# - Check npm run preview locally
# - Check environment variables
# - Review recent code changes
```

### Symptom: Slow response times

**Diagnosis:**
1. Check CPU usage in dashboard
2. Review response times in logs
3. Monitor bundle size

**Fix:**
```bash
# Analyze locally
npm run build

# Check for large assets
du -sh dist/assets/

# Optimize:
# - Split larger chunks
# - Lazy load components
# - Compress images
```

### Symptom: Build fails on push

**Diagnosis:**
1. View build logs in detail
2. Identify error message
3. Check if works locally

**Fix:**
```bash
# Test locally
npm ci
npm run build

# If fails locally:
# - Fix issues
# - Commit and push
# - Manual redeploy

# If works locally but fails on Railway:
# - Clear build cache
# - Check environment variables
# - Ensure package-lock.json committed
```

---

## CLI Monitoring Commands

```bash
# View live logs
railway logs --tail

# View last 100 lines of logs
railway logs -n 100

# View logs with timestamps
railway logs --tail --timestamps

# Export logs to file
railway logs > deployment-logs.txt

# Check deployment status
railway status

# View memory/CPU usage
railway logs | grep "Memory\|CPU"

# Get environment variables
railway variables list

# Get service info
railway service list
```

---

## Integration with GitHub

### Auto-Deploy on Push

Enable auto-deploy in Railway Settings:

1. Go to **Settings** > **GitHub**
2. Enable **"Auto Deploy on Push"**
3. Select branches to auto-deploy:
   - main (for staging)
   - production (for prod)

### GitHub Status Checks

In GitHub repo settings:

1. Go to **Deployments**
2. Look for Railway deployment status
3. Green checkmark = deployment successful
4. Red X = deployment failed

### View Deployment Links in GitHub

After push, you'll see in PR/Commit:
```
deployment/railway - Environment: Staging
Deployed at: https://staging.thevideopool.com
```

---

## Alerting Best Practices

### Alert Severity Levels

**Critical (Alert Immediately)**
- Service down
- Continuous errors (>10% error rate)
- Memory > 400 MB
- Build failure (blocking feature branch)

**Warning (Alert Within 1 Hour)**
- Memory > 300 MB
- Response time > 3 seconds
- Deployment failed (but rollback available)
- Health check warnings

**Info (Daily Digest)**
- Deployment succeeded
- Performance metrics
- Log rotation
- Maintenance notifications

---

## Performance Optimization Tips

### Reduce Build Time

```bash
# Use npm ci instead of npm install (faster)
# Check Dockerfile - already optimized

# Analyze bundle
npm run build -- --mode production --analyze
```

### Reduce Deployment Time

1. Optimize Dockerfile
2. Use multi-stage builds (already done)
3. Cache layers efficiently
4. Minimize asset transfers

### Reduce Memory Usage

1. Enable source map removal (done in vite.config.ts)
2. Lazy load components
3. Use code splitting (done in vite.config.ts)
4. Monitor for memory leaks

### Reduce Response Time

1. Add CDN for static assets
2. Enable caching headers
3. Minify and compress (done by Vite)
4. Lazy load resources

---

## Disaster Recovery Plan

### Backup Strategy

Railway auto-maintains:
- Full deployment history
- Environment variables history
- Deployment logs (30 days)

Manual backups:
```bash
# Export environment variables
railway variables list > env-backup.txt

# Save current deployment
railway status > deployment-backup.txt

# Git history as backup
git log --oneline > git-backup.txt
```

### Recovery Time Objective (RTO)

- **Service restart:** < 2 minutes
- **Rollback to previous deployment:** < 5 minutes
- **Code fix and redeploy:** < 15 minutes
- **Full infrastructure rebuild:** < 30 minutes

### Recovery Point Objective (RPO)

- **Code changes:** Last Git commit (0 minutes)
- **Deployments:** Every commit
- **Logs:** Last 30 days
- **Environment config:** Complete history

---

## Monitoring Checklist

Daily:
- [ ] Check logs for errors
- [ ] Verify uptime status
- [ ] Test custom domain

Weekly:
- [ ] Review performance metrics
- [ ] Check memory/CPU trends
- [ ] Verify backup status

Monthly:
- [ ] Deep log analysis
- [ ] Security review
- [ ] Optimization opportunities

Quarterly:
- [ ] Update dependencies
- [ ] Review monitoring setup
- [ ] Plan capacity upgrades

---

## Support

- **Railway Docs:** https://docs.railway.app
- **Deployment Logs:** Railway Dashboard > Logs
- **GitHub Status:** GitHub repo > Deployments
- **Health Status:** Railway Dashboard > Health Checks

---

**Last Updated:** February 16, 2026
**Project:** TVP Redesign 2026 (Staging)
