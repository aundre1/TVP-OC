# TVP Pricing, Email & Trial Report

## Task 1: Pricing Tiers Updated ✅

### Official Tiers
| Plan | Price | Downloads/mo | Quality |
|------|-------|-------------|---------|
| Free | $0 | 1 | 1080p max |
| Starter | $35/month | 200 | Full HD, all versions |
| Pro | $100/quarter ($33/mo) | 250 | All versions |
| Elite | $360/year ($30/mo) | 300 | All versions |

### Files Updated
- **`src/components/PricingCards.tsx`** — Complete rewrite with 4-tier grid, correct CTAs (Get Started / Start Free Trial), Popular badge on Pro, 7-day trial notes
- **`src/pages/LandingPage.tsx`** — PricingSection rewritten with 4 tiers (was 3), SocialProofSection updated to "11,000+ DJs Worldwide"
- **`src/pages/MembershipPage.tsx`** — Already data-driven from API, works with updated DB
- **`server/src/db/schema.sql`** — Enum changed: `basic`→`starter`, `lifetime`→`elite`
- **`server/src/db/seed.js`** — All 4 plans updated with correct pricing and limits
- **`server/src/db/migrations/010_free_trial.sql`** — Adds `starter`/`elite` to enum, migrates existing users, adds trial columns, creates `sms_sends` table
- **`server/src/routes/admin.js`** — Updated plan names and pricing in revenue calc
- **`server/src/routes/webhooks.js`** — Updated amount thresholds and plan names
- **`server/src/routes/marketing.js`** — Updated subscriber filter
- **`server/src/middleware/auth.js`** — Updated valid membership list

## Task 2: Email Service ✅

**`server/src/services/emailService.js`** — Complete rewrite with multi-provider support:

1. **Brevo** (BREVO_API_KEY) — marketing blasts, 300/day free
2. **SendGrid** (SENDGRID_API_KEY) — fallback
3. **Google Workspace SMTP** (GOOGLE_APP_PASSWORD) — transactional emails from info@thevideopool.com

### Email Templates
- `sendVerificationEmail` — 6-digit code
- `sendPasswordResetEmail` — Reset link
- `sendWelcomeEmail` — Welcome with feature highlights
- `sendPaymentFailedEmail` — Dunning (update payment)
- `sendSubscriptionConfirmedEmail` — Plan confirmation
- `sendDownloadLimitEmail` — Usage bar with upgrade CTA
- `send2FAEnabledEmail` / `sendPasswordChangedEmail` — Security notifications

### Env Vars Needed
```
GOOGLE_APP_PASSWORD=     # Google Workspace app password for info@thevideopool.com
BREVO_API_KEY=           # Brevo API key (free tier: 300/day)
SENDGRID_API_KEY=        # Optional fallback
EDITOR_EMAIL=            # Glenn's email for song request forwarding
```

## Task 3: Support Email Forwarding ✅

**`server/src/routes/support.js`** updated:
- Ticket creation → sends formatted email to info@thevideopool.com with user details, plan, admin dashboard link
- Admin response → sends email to user with "Re: {subject}" and ticket reference
- Uses new `sendSupportTicketNotification` and `sendSupportResponseEmail` functions

## Task 4: Song Request Email to Glenn ✅

- Song request tickets auto-email info@thevideopool.com (Aundre)
- When `EDITOR_EMAIL` env var is set, auto-forwards to Glenn with "[TVP Song Request] Artist - Title"
- Includes "Mark as Completed" link to content queue

## Task 5: SMS Service (Amazon SNS) ✅

**`server/src/services/smsService.js`** created:
- `sendSMS(phone, message, userId)` — sends via SNS or stub mode
- `sendBulkSMS(phones[], message)` — batch with 100ms rate limit
- Monthly limit: 2 SMS per user per month (enforced via `sms_sends` table)
- Stub mode when AWS credentials not set (logs message, returns success)

### Env Vars Needed
```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
```

## Task 6: Download Enforcement ✅

Already well-implemented in `server/src/services/downloadService.js`:
- Checks `download_limit` on user → falls back to `tier_limit` from memberships table
- Monthly reset with date tracking
- Updated error response to include `upgradeUrl: '/membership'` and `used` count

Plan limits enforced via seed data:
- Free: 1/month
- Starter: 200/month
- Pro: 250/month
- Elite: 300/month

## Task 7: Landing Page ✅

- Pricing section now shows all 4 tiers in a grid
- "Trusted by 11,000+ DJs worldwide" in pricing header
- SocialProofSection stats updated (11,000+ DJs)
- Testimonials section already present with placeholders

## Task 8: Free Trial Flow ✅

### Backend
- `POST /api/memberships/start-trial` — starts 7-day trial for Pro/Elite
- `GET /api/memberships/trial-status` — returns trial state + days remaining
- Prevents duplicate trials
- Sets `membership_status = 'trial'`

### Database
- Migration `010_free_trial.sql` adds `trial_ends_at` and `trial_plan` columns
- Download service already checks `membership_status` includes 'trial'

### Frontend
- PricingCards shows "Start Free Trial" + "7-day free trial included" for Pro/Elite
- `useTrialStore` (Zustand) already exists for banner dismissal
- Trial countdown can be added to header using `/api/memberships/trial-status` endpoint
