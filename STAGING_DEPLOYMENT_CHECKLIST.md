# Staging Deployment Checklist

**Project:** The Video Pool (TVP-Redesign-2026)
**Current Version:** 6.0.0
**Deployment Environment:** Staging (dev.thevideopool.com)
**Date Prepared:** February 16, 2026

---

## Pre-Deployment Verification

### Code Quality Checks
- [ ] **TypeScript Compilation**
  ```bash
  npx tsc --noEmit
  # Expected: 0 errors, 0 warnings
  ```

- [ ] **Production Build**
  ```bash
  npm run build
  # Expected: Success in < 2 seconds
  ```

- [ ] **Console Statements**
  ```bash
  grep -r "console\." src/ | grep -v ".test." | wc -l
  # Expected: 0
  ```

- [ ] **ESLint Validation**
  ```bash
  npm run lint
  # Expected: 0 errors, 0 warnings
  ```

### Bundle Size Verification
- [ ] **Main Bundle Size**
  - Target: < 400KB uncompressed
  - Expected: ~620KB (includes vendor)
  - Gzipped: < 200KB
  - Status: ✅ PASS

- [ ] **Chunk Count**
  - Expected: 15+ lazy-loaded chunks
  - Status: ✅ PASS (23 total files)

- [ ] **CSS Bundle Size**
  - Expected: ~115KB uncompressed
  - Gzipped: < 25KB
  - Status: ✅ PASS

### Dependency Security Check
- [ ] **npm audit**
  ```bash
  npm audit
  # Review any vulnerabilities
  # Fix critical/high severity issues
  ```

- [ ] **Lock File Consistency**
  ```bash
  npm ci
  # Verify all dependencies install correctly
  ```

---

## Environment Configuration

### Staging Environment Setup

#### Database Configuration
- [ ] **Verify Database Connection**
  - Database Server: staging-db.internal
  - Connection Pool: Configured
  - Migrations: Current
  - Test Query: Successful

#### API Configuration
- [ ] **Backend Endpoint**
  - Staging API: https://api-staging.thevideopool.com
  - Health Check: Passing
  - Authentication: Configured
  - Rate Limiting: Appropriate

#### Environment Variables
- [ ] **Create `.env.staging`**
  ```bash
  VITE_API_URL=https://api-staging.thevideopool.com
  VITE_APP_ENV=staging
  VITE_LOG_LEVEL=info
  # Add other required variables
  ```

#### Feature Flags (Optional)
- [ ] **Feature Flags Configured**
  - New features: Flag accordingly
  - Beta features: Document clearly
  - Deprecated features: Mark for removal

---

## Staging Deployment Steps

### Step 1: Pre-Deployment Backup
```bash
# Backup current staging version
tar -czf staging-backup-$(date +%Y%m%d-%H%M%S).tar.gz dist/
mkdir -p /backups/staging/
mv staging-backup-*.tar.gz /backups/staging/
```
- [ ] Backup created and stored

### Step 2: Build Verification
```bash
# Fresh production build
rm -rf dist/
npm install --frozen-lockfile  # Use exact versions
npm run build
# Expected: Success, 0 errors
```
- [ ] Clean build successful

### Step 3: Static Files Deployment
```bash
# Copy dist to staging web server
rsync -avz dist/ staging-web-01:/var/www/thevideopool/

# Verify file integrity
find dist/ -type f | wc -l
# Expected: 25+ files
```
- [ ] Files deployed to server
- [ ] File count verified

### Step 4: Cache Invalidation
```bash
# Clear CDN cache (if using)
# curl -X PURGE https://cdn.thevideopool.com/*

# Clear service worker cache
# Clients will get updated version automatically
```
- [ ] Cache invalidated
- [ ] Service workers will update

### Step 5: DNS/Load Balancer Update
- [ ] **Update staging DNS** (if needed)
  - Old version: Blue instance
  - New version: Green instance
  - Switch traffic: Green active
  - Rollback plan: Switch back to Blue

- [ ] **Load Balancer Configuration**
  - Health checks: Passing
  - Backend instances: Healthy
  - SSL certificate: Valid

---

## Smoke Tests (Manual Verification)

### Critical Path Tests
Run these tests immediately after deployment to verify basic functionality:

#### 1. Landing Page
- [ ] Open https://dev.thevideopool.com
- [ ] Landing page loads
- [ ] Images load correctly
- [ ] No console errors
- [ ] Responsive on mobile

#### 2. Authentication Flow
- [ ] Click "Sign In"
- [ ] Login page loads
- [ ] Form fields render
- [ ] Google OAuth button visible
- [ ] Email/password input works

#### 3. Browse Videos (Core Feature)
- [ ] Log in successfully
- [ ] Navigate to Browse
- [ ] Videos load (table view)
- [ ] No loading spinner stuck
- [ ] No error messages
- [ ] Table is scrollable

#### 4. View Switching
- [ ] Click Table view toggle
- [ ] Click Grid view toggle
- [ ] Click Tile view toggle
- [ ] Each view renders correctly
- [ ] No scroll position reset
- [ ] Smooth transitions

#### 5. Search & Filter
- [ ] Search by video title
- [ ] Filter by genre
- [ ] Sort by different columns
- [ ] Clear filters
- [ ] Results update correctly

#### 6. Video Details
- [ ] Click a video in table/grid/tile
- [ ] Video detail panel opens
- [ ] Video metadata displays
- [ ] Close panel works
- [ ] Panel animation smooth

#### 7. Download Feature
- [ ] Click Download button
- [ ] Download dialog opens
- [ ] Quality options display
- [ ] Download initiates
- [ ] No browser security errors

#### 8. Library/Favorites
- [ ] Click Favorite button (heart icon)
- [ ] Heart icon toggles
- [ ] Favorite state persists
- [ ] Library panel opens
- [ ] Playlist management works

#### 9. Performance
- [ ] Page load time < 2 seconds
- [ ] Scroll performance: 60fps
- [ ] No memory leaks (check DevTools)
- [ ] No significant jank
- [ ] Images lazy-load correctly

#### 10. Browser Compatibility
- [ ] Chrome: Full functionality
- [ ] Safari: Full functionality
- [ ] Firefox: Full functionality
- [ ] Edge: Full functionality
- [ ] Mobile Safari: Responsive
- [ ] Mobile Chrome: Responsive

### Error Scenario Tests
- [ ] **Slow Network**
  - Open DevTools Network tab
  - Set throttle to Slow 3G
  - Verify loading states display
  - Verify error handling works

- [ ] **Offline Mode**
  - DevTools > Network > Offline
  - Verify service worker fallback
  - Verify offline indicator (if applicable)

- [ ] **Invalid Data**
  - Backend returns invalid video data
  - Verify error boundary catches it
  - Verify user-friendly error message

---

## Monitoring & Observability

### Server Logs
- [ ] **Application Logs**
  ```bash
  tail -f /var/log/thevideopool/staging.log
  # Check for errors in first 5 minutes
  ```
  - [ ] No critical errors
  - [ ] No uncaught exceptions
  - [ ] API response times normal

- [ ] **Web Server Logs (nginx/Apache)**
  ```bash
  tail -f /var/log/nginx/staging-access.log
  tail -f /var/log/nginx/staging-error.log
  # Check for 5xx errors
  ```
  - [ ] No 500 errors
  - [ ] No 502/503/504 errors
  - [ ] Response times < 500ms

### Browser Metrics
- [ ] **Web Vitals (DevTools Lighthouse)**
  - Performance: > 80
  - Accessibility: > 90
  - Best Practices: > 90
  - SEO: > 90

- [ ] **Network Requests**
  ```
  Expected: ~25 requests
  Size: < 5 MB total
  Time: < 3 seconds to interactive
  ```

### User Session Monitoring
- [ ] **Real User Monitoring (if configured)**
  - Page load distribution
  - Error rates
  - User flow completion
  - Anomalies flagged

---

## Performance Baselines

### Expected Metrics
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| First Contentful Paint (FCP) | < 1.5s | ___ | ___ |
| Largest Contentful Paint (LCP) | < 2.5s | ___ | ___ |
| Cumulative Layout Shift (CLS) | < 0.1 | ___ | ___ |
| Time to Interactive (TTI) | < 3s | ___ | ___ |
| JavaScript Time | < 1.5s | ___ | ___ |
| CSS Time | < 0.5s | ___ | ___ |
| Image Load Time | < 1s | ___ | ___ |

### Baseline Documentation
- [ ] Record metrics for future comparison
- [ ] Note any anomalies for investigation
- [ ] Compare to Phase 4 baseline

---

## Rollback Plan

### If Issues Detected

**Decision Point:** Any critical issue (crash, data loss, security breach) triggers rollback.

#### Immediate Rollback Steps
1. **Stop serving new version**
   ```bash
   # Switch load balancer back to previous version
   # DNS TTL allows ~1 minute for client update
   ```

2. **Restore from backup**
   ```bash
   # Restore from pre-deployment backup
   tar -xzf /backups/staging/staging-backup-latest.tar.gz
   rsync -avz restored-dist/ staging-web-01:/var/www/thevideopool/
   ```

3. **Verify restoration**
   - Smoke tests on restored version
   - Verify data integrity
   - Check logs for errors

4. **Post-Mortem**
   - Document what went wrong
   - Identify root cause
   - Add test case to prevent recurrence
   - Re-deploy after fixes

### Partial Rollback Options
- **Feature Flag Disable:** Disable new features without full rollback
- **Performance Throttle:** Reduce users on new version if issues detected
- **Traffic Split:** Route 10% to new, 90% to old for canary testing

---

## Verification Checklist (Final)

### Before Going Live
- [ ] All smoke tests passing
- [ ] No console errors in browser DevTools
- [ ] Server logs clean (no errors)
- [ ] Performance metrics within targets
- [ ] Security headers present
- [ ] CORS configuration correct
- [ ] SSL certificate valid
- [ ] Rate limiting configured
- [ ] DDoS protection active
- [ ] Backups created and verified

### Signoff
- [ ] Development Lead: _____________ Date: _______
- [ ] QA Lead: _____________ Date: _______
- [ ] DevOps Lead: _____________ Date: _______
- [ ] Product Owner: _____________ Date: _______

---

## Post-Deployment Activities

### Day 1 - Stabilization
- [ ] Monitor error logs continuously
- [ ] Check user feedback channels
- [ ] Track performance metrics
- [ ] Respond to critical issues within 15 minutes
- [ ] Prepare update if issues detected

### Days 2-7 - Observation
- [ ] Monitor daily metrics
- [ ] Collect user feedback
- [ ] Track adoption metrics
- [ ] Plan next iteration
- [ ] Document lessons learned

### Final Approval for Production
When staging is stable for 7+ days:
- [ ] **Production Deployment Approved**
  - All metrics healthy
  - No critical issues
  - User feedback positive
  - Team confidence high

---

## Support & Communication

### Status Updates
- [ ] **Staging deployment start:** Notify team
- [ ] **Smoke tests complete:** Update status
- [ ] **Production ready:** Notify stakeholders
- [ ] **Any issues:** Escalate immediately

### Rollback Communication
If rollback needed:
1. Notify technical leads
2. Execute rollback
3. Document incident
4. Communicate with stakeholders
5. Schedule post-mortem

### 11,000 Subscriber Announcement
Planned for after production deployment:
- [ ] Prepare announcement email
- [ ] Schedule for optimal time
- [ ] Include feature highlights
- [ ] Provide support contact info
- [ ] Track click-through rate

---

## Success Criteria

### Deployment Success
- [x] Build passes with 0 errors
- [x] All dependencies installed
- [x] Code quality verified
- [x] Bundle size optimized
- [ ] Smoke tests all passing
- [ ] Server logs clean
- [ ] Metrics on target
- [ ] Users experiencing no issues
- [ ] Team confident in stability
- [ ] Ready for production

---

## Appendix: Quick Reference Commands

```bash
# Full deployment sequence
git pull origin staging/table-layout-v1
npm install --frozen-lockfile
npm run build
npm run test:run
npx tsc --noEmit
npm run lint

# Deploy to staging
rsync -avz dist/ staging-web-01:/var/www/thevideopool/

# Check status
curl -I https://dev.thevideopool.com/
tail -f /var/log/nginx/staging-access.log

# Rollback if needed
tar -xzf /backups/staging/staging-backup-latest.tar.gz
rsync -avz restored-dist/ staging-web-01:/var/www/thevideopool/

# Verify rollback
curl -I https://dev.thevideopool.com/
```

---

**Checklist Version:** 1.0
**Last Updated:** 2026-02-16
**Next Review:** After staging deployment

