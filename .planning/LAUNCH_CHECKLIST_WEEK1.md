# The Video Pool — Week 1 Launch Checklist

**Target Launch:** Friday, March 7, 2026 (6 days)
**Status:** 🟡 In Progress — Database Connectivity Blocking
**Last Updated:** 2026-03-01 18:20 UTC

---

## 🔴 CRITICAL BLOCKERS (Fix First)

### 1. Database Connectivity (BLOCKING)
- **Issue:** Supabase unreachable from Railway backend (ENETUNREACH)
- **Evidence:** All API endpoints return `{"error": "An unexpected error occurred", "code": "ENETUNREACH"}`
- **Impact:** Cannot test login, memberships, videos, downloads — ALL auth-dependent features fail
- **Owner:** Aundre (requires Supabase investigation)
- **Timeline:** URGENT — Must fix before proceeding with any testing

**Action Items:**
- [ ] Verify Railway backend can reach Supabase IP
- [ ] Check Supabase firewall/IP whitelist settings
- [ ] Test connection string directly from Railway console
- [ ] Verify DATABASE_URL is accessible
- [ ] Check connection pool configuration
- [ ] Restart Railway backend service if needed
- [ ] Re-run `/health` endpoint to confirm database connectivity
- [ ] Test `/api/memberships` endpoint (should return 200, not ENETUNREACH)

**Success Criteria:** `/api/memberships` returns 200 with membership data

---

## ✅ P0 FEATURES (Launch Must-Haves)

### 2. Authentication System
- **Status:** ✅ Code complete | ⏳ Cannot test (DB issue)
- **What's Done:**
  - Email/password login routes built
  - Google OAuth configured
  - JWT token management
  - Mock auth disabled for production

**Remaining:**
- [ ] Test email/password login works end-to-end
- [ ] Test password reset flow
- [ ] Test email verification
- [ ] Test 2FA code generation/verification
- [ ] Verify session persistence (cookies)
- [ ] Test logout and token refresh

**Success Criteria:** User can register → verify email → login → dashboard

---

### 3. Video Catalog (26,043 Videos)
- **Status:** 🟡 Partial — Data imported | Need to validate loading
- **What's Done:**
  - 26,043 videos imported from Wasabi
  - Thumbnails from Wasabi CDN
  - Genre/label metadata populated
  - Search/filter API routes built

**Remaining:**
- [ ] Verify videos load on home page (currently 0/0 loading)
- [ ] Verify thumbnails display from Wasabi (39 confirmed, 36 from seed)
- [ ] Test search functionality (`/api/videos/search?q=`)
- [ ] Test genre filtering
- [ ] Test BPM filtering
- [ ] Test pagination
- [ ] Verify preview functionality works
- [ ] Verify playback works (if streaming enabled)

**Success Criteria:** Home page loads 50 videos with thumbnails; search returns results

---

### 4. Download System
- **Status:** ✅ Presigned URLs working | ⏳ Need to validate S3 integration
- **What's Done:**
  - Presigned download URLs generating
  - Wasabi S3 integration confirmed
  - Download tracking database tables
  - Rate limiting configured

**Remaining:**
- [ ] Test download button on video card
- [ ] Verify presigned URL is valid and downloadable
- [ ] Test download counter increments
- [ ] Verify download limits enforced per tier
- [ ] Test download reset at period end
- [ ] Verify bonus credits deduct properly
- [ ] Test error handling for expired URLs

**Success Criteria:** User can download a video and verify file integrity

---

### 5. Payment / Stripe Integration
- **Status:** ✅ Stripe configured | ⏳ Need to test checkout
- **What's Done:**
  - Stripe API keys set on Railway
  - Stripe webhook URL registered
  - Membership price IDs in database
  - Checkout session endpoint built
  - Webhook handler for payment events

**Remaining:**
- [ ] Test "Upgrade to [Plan]" button on membership page
- [ ] Test Stripe checkout session creation
- [ ] Complete payment in Stripe test mode
- [ ] Verify webhook fires and updates user membership
- [ ] Test upgrade/downgrade flow
- [ ] Test cancellation flow
- [ ] Test invoice generation
- [ ] Test refund handling

**Success Criteria:** Free user can upgrade to Pro, payment processes, membership updates

---

### 6. User Account / Download Limits
- **Status:** 🟡 Partial — Schema ready | Need to validate enforcement
- **What's Done:**
  - User schema with download limits
  - Download tracking tables
  - Membership type stored per user
  - Email notifications infrastructure

**Remaining:**
- [ ] Verify download limit displays correctly
- [ ] Verify downloads increment on download
- [ ] Test hitting download limit (should reject)
- [ ] Test monthly reset at correct date
- [ ] Test bonus credits deduct and restore
- [ ] Verify account settings page loads
- [ ] Test profile update
- [ ] Test email preferences

**Success Criteria:** User dashboard shows correct download limit; hitting limit rejects download

---

## 🟡 P1 FEATURES (Important, Post-Launch OK)

### 7. Membership Tiers (4-tier System)
- **Status:** ✅ Batch 2 complete | ⏳ Need validation
- **What's Done:**
  - Type system updated (free/starter/pro/elite)
  - Membership page redesigned with 4 cards
  - Tier icons and colors added
  - API adapter fixed

**Remaining:**
- [ ] Verify 4 membership cards display on /membership
- [ ] Verify pricing shows correctly
- [ ] Verify feature lists accurate
- [ ] Test "Most Popular" badge on Pro tier
- [ ] Test upgrade buttons disabled for free tier
- [ ] Verify current plan indicator shows

**Success Criteria:** Membership page displays 4 cards with correct pricing and features

---

### 8. Theme System (Light/Dark Mode)
- **Status:** 🟡 Partial — Dark mode works | Light theme issue reported
- **What's Done:**
  - next-themes integration
  - Dark theme CSS variables defined
  - Theme toggle button in header
  - Persistence to localStorage

**Remaining:**
- [ ] Test light theme toggle works
- [ ] Verify all components support light theme
- [ ] Check contrast ratios (WCAG AA)
- [ ] Verify theme persists on reload
- [ ] Test mobile theme toggle
- [ ] Verify logo visible in both themes

**Success Criteria:** Light theme toggle works and all components are visible

---

### 9. OAuth Providers (Google, Facebook, Apple)
- **Status:** 🟡 Partial — Google working | Facebook/Apple need env vars
- **What's Done:**
  - Google OAuth fully configured
  - Apple OAuth code ready
  - Facebook OAuth code ready
  - Social login grid UI (4 buttons visible)

**Remaining:**
- [ ] Set `VITE_FACEBOOK_APP_ID` on Vercel
- [ ] Set `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` on Railway
- [ ] Test Facebook login flow
- [ ] Test Apple login flow (if available)
- [ ] Verify user account created from OAuth
- [ ] Verify profile photo from OAuth
- [ ] Test linking social accounts to existing user

**Success Criteria:** Users can login with Google, Facebook, Apple (if configured)

---

### 10. Email System
- **Status:** ✅ Configured | ⏳ Need to verify templates
- **What's Done:**
  - Brevo email service integrated
  - SMTP fallback configured
  - SendGrid fallback ready
  - Email rate limiting

**Remaining:**
- [ ] Test welcome email sends
- [ ] Test verification email sends
- [ ] Test password reset email works
- [ ] Test 2FA code email
- [ ] Verify email templates are branded
- [ ] Check email delivery rates
- [ ] Test unsubscribe links work

**Success Criteria:** User receives welcome email after registration

---

## 🟢 P2+ FEATURES (Polish, Can Ship After Launch)

### 11. Admin Dashboard
- **Status:** 🟡 Code exists | Needs testing
- [ ] Verify admin can login
- [ ] Verify admin sees analytics
- [ ] Test user management
- [ ] Test content moderation

### 12. Legal Pages
- **Status:** ✅ Created | Need accessibility check
- [ ] Terms of Service page accessible
- [ ] Privacy Policy page accessible
- [ ] Contact page functional

### 13. Mobile Responsiveness
- **Status:** 🟡 Partial — Desktop first
- [ ] Test login on mobile
- [ ] Test video grid on mobile
- [ ] Test download on mobile
- [ ] Test payment on mobile

### 14. Search & Discovery
- **Status:** 🟡 API ready | UI needs testing
- [ ] Test search input visible
- [ ] Test search autocomplete
- [ ] Test genre browsing
- [ ] Test trending section

---

## 📋 TESTING PLAN

### Week 1 Schedule

**Monday 3/3** — Database Fix + Login Testing
- [ ] Fix database connectivity (Aundre)
- [ ] Validate email/password login
- [ ] Validate Google OAuth
- [ ] Run full Playwright audit

**Tuesday 3/4** — Video Catalog & Downloads
- [ ] Verify 26,043 videos load
- [ ] Test thumbnail display
- [ ] Test search functionality
- [ ] Test download flow
- [ ] Validate S3 integration

**Wednesday 3/5** — Payment & Membership
- [ ] Test Stripe checkout
- [ ] Test upgrade/downgrade
- [ ] Verify membership tiers display
- [ ] Test download limits
- [ ] Test webhook integration

**Thursday 3/6** — Polish & OAuth Providers
- [ ] Test light/dark theme
- [ ] Configure Facebook OAuth
- [ ] Test all auth flows
- [ ] Fix any critical bugs
- [ ] Security audit

**Friday 3/7** — Launch Verification
- [ ] Full end-to-end test (register → upload → download → payment)
- [ ] Performance testing
- [ ] Load testing (simulate 100 concurrent users)
- [ ] Security sweep
- [ ] Launch! 🚀

---

## 📊 CURRENT STATUS

| Component | Status | Blocker? | ETA |
|-----------|--------|----------|-----|
| Database | 🔴 ENETUNREACH | YES | URGENT |
| Login | ✅ Code done | NO | Mon 3/3 |
| Videos (26K) | 🟡 Need test | NO | Tue 3/4 |
| Downloads | ✅ Ready | NO | Tue 3/4 |
| Stripe | ✅ Ready | NO | Wed 3/5 |
| Membership | ✅ Ready | NO | Wed 3/5 |
| OAuth | 🟡 Google OK, Facebook TBD | NO | Thu 3/6 |
| Theme | 🟡 Light theme broken | NO | Thu 3/6 |
| Admin | 🟡 Untested | NO | Post-launch |

---

## 🎯 LAUNCH READINESS

**Go/No-Go Decision:** TBD (waiting on database fix)

**Current Blockers:** 1 critical
1. Database connectivity (ENETUNREACH) — blocks all testing

**Risk Assessment:**
- 🔴 HIGH RISK if database issue not resolved by Wed 3/5
- 🟡 MEDIUM RISK if can't test payment by Thu 3/6
- 🟢 LOW RISK for all other features (code is ready)

**Recommendation:** Fix database immediately → we can catch up and launch Friday

---

## 📞 ESCALATIONS

**To Aundre:**
- Investigate Supabase connectivity from Railway
- Verify firewall/IP whitelist
- Check connection pool settings

**To Team:**
- Set Facebook OAuth env vars if using Facebook
- Run Playwright audit after DB fix
- Load test before launch

---

**Plan Owner:** Claude Code (implementing)
**Last Status Check:** 2026-03-01 18:20 UTC
**Next Sync:** When database is fixed
