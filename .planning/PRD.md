# The Video Pool -- Product Requirements Document v2.0

| Field | Value |
|-------|-------|
| **Version** | 2.0 |
| **Date** | February 25, 2026 |
| **Status** | LAUNCH READY |
| **Owner** | Aundre Oldacre |
| **Frontend** | https://tvp-redesign-2026.vercel.app |
| **API** | https://tvp-oc-production.up.railway.app |
| **Repository** | github.com/aundre1/TVP-OC.git |

### Version History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0 | Jan 17, 2026 | Aundre Oldacre | Initial PRD -- feature wishlist, architecture proposal, tier definitions |
| **2.0** | **Feb 25, 2026** | **Aundre Oldacre / CoCo** | **Complete rewrite reflecting built system. All critical blockers resolved. Launch-ready state.** |

---

## 1. Product Summary

The Video Pool is a professional DJ music video streaming and download platform serving 26,043+ videos across all major genres. DJs and VJs subscribe to access high-quality music video files (720p through 4K) for live performance, with features built around how working DJs actually find, preview, organize, and download content.

The platform replaces a legacy system (www.thevideopool.com, operated by Steve -- DO NOT TOUCH) with a modern stack, new brand identity, and a subscription model designed around DJ workflow economics.

**Core value proposition:** Find the right video in under 10 seconds, download it in the quality you need, and get back to your set.

### Product Principles

1. **DJ Workflow First** -- Every feature must make DJs faster or better at their craft
2. **Speed is a Feature** -- Sub-500ms search, instant previews, fast downloads
3. **Dark Mode Default** -- DJs work at night; respect their environment
4. **Professional Quality** -- 720p/1080p/4K, accurate metadata, reliable downloads
5. **AI-Enhanced, Not AI-Dependent** -- AI improves the experience but manual control is always available

---

## 2. User Personas

| Persona | Profile | Needs | Tier Fit |
|---------|---------|-------|----------|
| **DJ Mike** (Primary) | Working pro, 28-45, 2-6 gigs/month, uses Serato/VirtualDJ | Fast search, reliable downloads, genre depth, saves time | Starter / Pro |
| **VJ Sarah** (Secondary) | Visual artist, 22-35, clubs + festivals, uses Resolume/VDMX | 1080p/4K quality, batch downloads, visual browsing | Pro / Elite |
| **DJ Carlos** (Tertiary) | Up-and-comer, 21-30, building library, price-conscious | Free tier to explore, upgrade path when gigs come | Freemium / Starter |

---

## 3. Business Goals

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Paid subscribers | 1,000 | 90 days post-launch |
| Activation rate (download within 24h of signup) | 60%+ | Ongoing |
| Search-to-download conversion | 85%+ | Ongoing |
| Average revenue per subscriber | $34.99/mo | Steady state |
| Content velocity | 50-100 new videos/week | Post-launch |
| Monthly churn | < 5% | Steady state |

---

## 4. Subscription Tiers (Live Stripe)

| Tier | Price | Billing | Downloads/Month | Stripe Price ID | Status |
|------|-------|---------|-----------------|-----------------|--------|
| Freemium | $0 | -- | 2 | `price_1SkCTX2xxXTR95tlX49TIN8n` | LIVE |
| Starter | $34.99 | Monthly | 200 | `s2_ca2738deb60b058a12d8fcd77ac4a6e9` | LIVE |
| Pro | $99.99 | Quarterly | 300 | `s2_59282b1c818949d8529a63bba9bf10f8` | LIVE |
| Elite | $299.99 | Annual | 400 | `s2_3fa73632a345d05262b57252a883fbee` | LIVE |

All 7 checkout variants return real `cs_live_` Stripe session IDs. Checkout endpoint: `POST /api/memberships/create-checkout` with body `{"tier":"starter","interval":"monthly"}`.

### Feature Access by Tier

| Feature | Freemium | Starter | Pro | Elite |
|---------|----------|---------|-----|-------|
| Browse catalog | Yes | Yes | Yes | Yes |
| Search and filter | Yes | Yes | Yes | Yes |
| Video preview | Yes | Yes | Yes | Yes |
| Downloads per month | 2 | 200 | 300 | 400 |
| Crate organization | Yes | Yes | Yes | Yes |
| AI recommendations | Basic | Full | Full | Full |
| Setlist sharing | Yes | Yes | Yes | Yes |
| 1080p/4K downloads | No | Yes | Yes | Yes |
| Priority support | No | No | Yes | Yes |
| Early access to new content | No | No | No | Yes |

---

## 5. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + TypeScript + Vite | Dev port 3001 |
| Styling | TailwindCSS | Custom `tvp-` prefixed classes, dark-first |
| State | Zustand + TanStack React Query | Client + server state separation |
| Backend | Node.js + Express | Railway deployment |
| Database | PostgreSQL (Supabase) | Project: jvgsmiqsqtqgfagghoiv |
| ORM | Drizzle | |
| Storage | Wasabi S3 | Bucket: thevideopool-us, region: us-east-1 |
| Payments | Stripe | Live keys, webhook at `/api/webhooks/stripe` |
| Email | Brevo (primary) + SendGrid (fallback) | Chain: SMTP -> Brevo -> SendGrid |
| Auth | JWT + Refresh tokens | Google OAuth, TOTP 2FA, SMS verification |
| CDN | Vercel edge (frontend), Wasabi presigned URLs (video) | |
| Virtualization | react-window | Required for 30K+ video lists |

### Brand and Design System

| Property | Value |
|----------|-------|
| Primary color | Cyan `#00d4ff` |
| Background | `#0a0a0f` (near-black) |
| Body font | Inter |
| Heading font | Plus Jakarta Sans |
| Mono font | JetBrains Mono |
| Mode | Dark-first |
| CSS prefix | `tvp-` |
| Design references | Spotify, YouTube, Apple Music, Serato, Beatport, Tidal, Billboard |

---

## 6. Frontend Routes (19 Total)

All routes are implemented and deployed.

| Route | Page | Auth | Status |
|-------|------|------|--------|
| `/welcome` | Landing page | Public | BUILT |
| `/` | Root redirect (-> /home if auth'd, -> /welcome if not) | Conditional | BUILT |
| `/login` | Login (Google OAuth + email/password + 2FA) | Public | BUILT |
| `/register` | Registration with phone validation | Public | BUILT |
| `/forgot-password` | Password reset request | Public | BUILT |
| `/reset-password` | Password reset with token | Public | BUILT |
| `/verify-email` | Email verification | Public | BUILT |
| `/verify-phone` | SMS phone verification (post-login) | Protected | BUILT |
| `/home` | Main app dashboard | Protected | BUILT |
| `/video/:id` | Video detail page | Protected | BUILT |
| `/search` | Search results | Protected | BUILT |
| `/library` | Playlists / crates / favorites | Protected | BUILT |
| `/downloads` | Download history | Protected | BUILT |
| `/membership` | Subscription plans | Protected | BUILT |
| `/membership/success` | Post-Stripe checkout confirmation | Protected | BUILT |
| `/settings` | Account settings | Protected | BUILT |
| `/admin` | Admin dashboard (10 tabs) | Admin only | BUILT |
| `/insights` | Business intelligence | Admin only | BUILT |
| `/set/:shareId` | Public shared setlist | Public | BUILT |
| `/og500` | OG500 marketing page | Public | BUILT |

Protected routes require a valid JWT. Admin routes require `role: 'admin'`.

---

## 7. Backend API Reference

### 7.1 Authentication

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Email/phone/password registration | LIVE |
| POST | `/api/auth/login` | Login, returns JWT + refresh token | LIVE |
| POST | `/api/auth/google` | Google OAuth -> JWT (find or create user) | LIVE |
| POST | `/api/auth/send-phone-verification` | Send SMS code (requiresAuth) | LIVE (stub) |
| POST | `/api/auth/verify-phone-code` | Confirm SMS code | LIVE (stub) |
| GET | `/api/auth/me` | Current user profile | LIVE |
| POST | `/api/auth/forgot-password` | Request password reset email | LIVE |
| POST | `/api/auth/reset-password` | Reset password with token | LIVE |
| POST | `/api/auth/2fa/setup` | Generate TOTP secret + QR | LIVE |
| POST | `/api/auth/2fa/verify` | Confirm TOTP code | LIVE |
| POST | `/api/auth/2fa/disable` | Disable 2FA | LIVE |

### 7.2 Videos and Content

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/videos` | List videos (filters: genre, year, label, BPM, search) | LIVE |
| GET | `/api/videos/:id` | Single video with all versions | LIVE |
| GET | `/api/videos/search?q=` | Dedicated search endpoint | LIVE |
| GET | `/api/videos/:id/download` | Presigned Wasabi download URL | LIVE |
| GET | `/api/genres` | Genre list | LIVE |
| GET | `/api/sets/:shareId` | Public shared set data | LIVE |

### 7.3 Subscriptions and Billing

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/memberships` | List 4 tiers | LIVE |
| POST | `/api/memberships/create-checkout` | Create Stripe checkout session | LIVE |
| POST | `/api/memberships/cancel` | Cancel subscription | LIVE |
| GET | `/api/billing/*` | Billing history, portal, payment methods | LIVE |
| POST | `/api/webhooks/stripe` | Stripe webhook handler | LIVE |

### 7.4 User Data

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/user/downloads` | Download history | LIVE |
| GET | `/api/playlists` | User playlists/crates | LIVE |
| GET | `/api/favorites` | User favorites | LIVE |

### 7.5 Admin (requires admin role)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/admin/stats` | Dashboard stat cards | LIVE |
| GET | `/api/admin/users` | Paginated user list with search | LIVE |
| PUT | `/api/admin/users/:id` | Update user role/tier/status | LIVE |
| GET | `/api/admin/videos` | Paginated video list with search | LIVE |
| POST | `/api/admin/videos/bulk-upload` | JSON/CSV ingest (up to 100 per batch) | LIVE |
| GET | `/api/admin/analytics` | Downloads/signups/top videos | LIVE |
| POST | `/api/admin/marketing/email` | Email blast (multi-provider distributor) | LIVE |
| POST | `/api/admin/marketing/sms` | SMS blast | LIVE (stub) |
| GET | `/api/admin/marketing/history` | Blast history | LIVE |

---

## 8. Admin Dashboard (10 Tabs)

All tabs are implemented at `/admin`. Credentials: `admin@thevideopool.com` / `Admin123!@#`

| Tab | Component | Capabilities |
|-----|-----------|-------------|
| **Overview** | AdminOverview | 6 stat cards (users, subscribers, videos, downloads today, MRR, new this week), quick actions, recent activity feed |
| **Business Intel** | AdminInsightsSummary | Revenue trends, cohort analysis, churn indicators |
| **Users** | AdminUsers | Paginated user list, search, inline role/tier/status editing |
| **Videos** | AdminVideos | Paginated video list, search, delete |
| **Analytics** | AdminAnalytics | Downloads and signups per day charts, top videos, membership distribution |
| **Bulk Upload** | BulkUploader | JSON/CSV video ingest, up to 100 videos per batch |
| **Coupons** | AdminCoupons | Discount code creation and management |
| **Support** | AdminSupport | Support ticket queue and management |
| **Marketing** | AdminMarketing | Email/SMS blast composer, 4 audience segments (all, subscribers, free, inactive) |
| **System** | AdminSystem | Health check, cache clear, audit logs, error logs |

---

## 9. Feature Status Matrix

| Feature | Current State | Target State | Priority | Owner |
|---------|--------------|--------------|----------|-------|
| Email/password auth | LIVE | -- | Done | -- |
| Google OAuth | LIVE (needs VITE_GOOGLE_CLIENT_ID on Vercel) | Fully live | P0 | Aundre |
| Phone SMS verification | Stub mode (no AWS keys) | Live via AWS SNS | P1 | Aundre |
| TOTP 2FA | LIVE | -- | Done | -- |
| Video search (keyword) | LIVE | -- | Done | -- |
| Natural language search | UI built (AISearchHero + AISearchInput) | Backend NLP processing wired | P2 | Backlog |
| Genre/year/label/BPM filters | LIVE | -- | Done | -- |
| Video preview modal | BUILT (PreviewModalV2) | -- | Done | -- |
| Presigned download URLs | LIVE (Wasabi, tested 83-190MB files) | -- | Done | -- |
| Download quality selector | BUILT (DownloadQualityModal) | -- | Done | -- |
| Batch download modal | BUILT (BatchDownloadModal) | -- | Done | -- |
| Download counter | BUILT (DownloadCounter) | -- | Done | -- |
| Download history | LIVE | -- | Done | -- |
| Playlists/crates | BUILT | -- | Done | -- |
| Set builder + AI suggestions | BUILT (SetBuilder) | -- | Done | -- |
| Shared setlists (public) | LIVE at /set/:shareId | -- | Done | -- |
| Camelot wheel (key compatibility) | BUILT (CamelotWheel) | -- | Done | -- |
| Waveform preview | BUILT (WaveformPreview) | -- | Done | -- |
| Stripe checkout (7 variants) | LIVE (cs_live_ sessions confirmed) | -- | Done | -- |
| Stripe webhook | Code live at /api/webhooks/stripe | URL registered in Stripe dashboard | P0 | Aundre |
| Membership cancel | LIVE | -- | Done | -- |
| Email delivery (Brevo) | LIVE (all 8 auth triggers confirmed) | -- | Done | -- |
| react-window virtualization | Code exists (VirtualizedVideoList) | Wired to live 26K dataset | P1 | Backlog |
| Recommendations API | Backend at /api/recommendations | Frontend wired to backend | P2 | Backlog |
| Thumbnail rendering | URLs present in DB | Visual QA pass across all views | P1 | Backlog |
| Social logins (7 providers) | UI built (coming-soon tooltips) | Live OAuth per provider | P3 | Backlog |
| SMS marketing blasts | Stub in AdminMarketing | Live via AWS SNS | P2 | Backlog |
| Admin dashboard (10 tabs) | ALL BUILT | -- | Done | -- |
| OG500 marketing page | BUILT | -- | Done | -- |
| Search autocomplete | BUILT (SearchAutocomplete) | -- | Done | -- |
| Free trial banner + expired modal | BUILT | -- | Done | -- |
| Social login grid | BUILT (Google live, 7 coming-soon) | -- | Done | -- |

---

## 10. Integration Status

| Service | Purpose | Status | Blocking Action |
|---------|---------|--------|-----------------|
| **Stripe** | Payments, subscriptions | LIVE -- all 7 checkout variants working | Register webhook URL in Stripe dashboard |
| **Wasabi S3** | Video/thumbnail/audio storage | LIVE -- 26,043 videos, presigned URLs verified | None |
| **Supabase** | PostgreSQL database | LIVE -- all tables populated | None |
| **Brevo** | Transactional email (primary) | LIVE -- delivery confirmed | None |
| **SendGrid** | Transactional email (fallback) | Configured as fallback in chain | None |
| **Google OAuth** | Social login | Code live, tested | Set `VITE_GOOGLE_CLIENT_ID` on Vercel |
| **AWS SNS** | SMS verification + marketing blasts | Stub mode | Set `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` on Railway |
| **Vercel** | Frontend hosting + edge CDN | LIVE | None |
| **Railway** | Backend hosting | LIVE -- healthy, all routes functional | None |

---

## 11. User-Facing Components

| Component | Purpose |
|-----------|---------|
| `HeaderV2` | Search bar with autocomplete, genre nav, user dropdown, download counter |
| `GenreNav` | Genre mega menu navigation |
| `VideoCardV2` | Grid card: quality badge, hover preview, add-to-crate, download |
| `VirtualizedVideoList` | react-window list view for 30K+ video performance |
| `VideoGrid` | Standard grid layout |
| `PreviewModalV2` | Video preview with all versions, full metadata, download options |
| `SetBuilder` | Slide-out set builder panel with AI-powered next-track suggestions |
| `AISearchHero` + `AISearchInput` | Natural language search UI |
| `CamelotWheel` | Musical key compatibility wheel visualization |
| `WaveformPreview` | Audio waveform display |
| `SearchAutocomplete` | Debounced search with suggestions dropdown |
| `DownloadCounter` | Downloads used/remaining indicator |
| `BatchDownloadModal` | Multi-video download queue |
| `DownloadQualityModal` | Quality selector (720p/1080p/4K) before download |
| `FreeTrialBanner` | Upgrade prompt for free-tier users |
| `TrialExpiredModal` | Trial expiry gate with upgrade CTA |
| `SocialLoginGrid` | 2x4 grid (Google live, 7 coming-soon with tooltips) |
| `Toast` | Pill-style bottom-center notifications |
| `ErrorBoundary` | React error boundaries |
| `SidePanel` + sub-panels | Context panels: Details, Download, Library, Preview, Admin |

---

## 12. Database Schema (Key Tables)

| Table | Records | Purpose |
|-------|---------|---------|
| `videos` | 26,043 | Master catalog: title, artist, genre, release_year, record_label, BPM, key |
| `video_versions` | 27,619 | Quality variants per video (720p, 1080p, 4K) with Wasabi S3 keys |
| `users` | -- | Accounts: email, password_hash, role, google_id, avatar_url, phone fields |
| `memberships` | 4 | Tier definitions with Stripe price IDs |
| `user_memberships` | -- | Active subscriptions per user |
| `downloads` | -- | Download history: user_id, video_id, version_id, timestamp |
| `playlists` | -- | User crates/playlists |
| `playlist_videos` | -- | Videos in playlists (join table) |
| `favorites` | -- | User favorited videos |
| `shared_sets` | -- | Public shareable setlists |

**Important schema note:** `videos.release_year` and `videos.record_label` hold the real data. The columns `year` and `label` exist but are empty. The API aliases them: `v.release_year AS year, v.record_label AS label`. Genre coverage: 99.5%. Release year coverage: 99.9%. Record label coverage: 99.1%.

---

## 13. Analytics Events to Track

### Activation and Conversion
- `user.registered` -- method (email/google), timestamp
- `user.verified_email` -- time from registration
- `user.verified_phone` -- method
- `user.first_download` -- time-to-first-download from signup
- `membership.checkout_started` -- tier, interval
- `membership.checkout_completed` -- tier, interval, amount
- `membership.cancelled` -- tier, reason, months_active

### Engagement
- `video.searched` -- query, results_count, time_to_first_click
- `video.previewed` -- video_id, duration_watched
- `video.downloaded` -- video_id, quality, file_size_mb
- `video.added_to_crate` -- video_id, crate_id
- `set.created` -- video_count
- `set.shared` -- share_id, recipient_count
- `filter.applied` -- filter_type, value

### Retention
- `session.started` -- days_since_last_session
- `downloads.quota_warning` -- used, remaining, percentage
- `downloads.quota_exhausted` -- tier, days_until_reset
- `membership.renewal_success` -- tier, amount
- `membership.renewal_failed` -- tier, failure_reason

### Admin
- `admin.bulk_upload` -- count, success, failed
- `admin.marketing_blast` -- channel (email/sms), segment, recipient_count
- `admin.user_modified` -- user_id, field_changed, old_value, new_value

---

## 14. Security

| Mechanism | Implementation | Status |
|-----------|---------------|--------|
| JWT access tokens | Configurable expiry, signed with JWT_SECRET | LIVE |
| Refresh token rotation | Separate REFRESH_TOKEN_SECRET | LIVE |
| TOTP 2FA | Setup/verify/disable endpoints | LIVE |
| Phone SMS verification | Post-login step, skippable | LIVE (stub) |
| Google OAuth | Stateless find-or-create flow | LIVE |
| Password reset | Signed email tokens via Brevo | LIVE |
| Admin role enforcement | Middleware on all /api/admin/* routes | LIVE |
| Presigned download URLs | Time-limited, per-user Wasabi URLs | LIVE |
| CORS | Configured for frontend origin only | LIVE |
| Stripe webhook verification | Signature validation on /api/webhooks/stripe | LIVE |
| Rate limiting | Applied to auth endpoints | LIVE |

---

## 15. What's Missing -- Prioritized Backlog

### P0 -- Launch Day (minutes of work)

1. **Register Stripe webhook URL** in Stripe dashboard: `https://tvp-oc-production.up.railway.app/api/webhooks/stripe`
2. **Set `VITE_GOOGLE_CLIENT_ID`** on Vercel for live Google OAuth (authorized JS origin: `tvp-redesign-2026.vercel.app`)

### P1 -- First Week Post-Launch

3. **Wire react-window virtualization** to live 26K dataset -- VirtualizedVideoList component exists, needs connection to real data source
4. **Visual QA pass on thumbnails** -- URLs present in DB, need to verify rendering across grid, list, and preview views
5. **Enable live SMS verification** via AWS SNS -- set `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` on Railway
6. **Verify Stripe billing portal** -- confirm customer portal link works end-to-end for self-service plan changes

### P2 -- First Month

7. **Wire recommendations API** -- backend exists at `/api/recommendations/*`, frontend currently hits `/api/videos/recommended` (mismatch)
8. **Natural language search backend** -- AISearchHero/AISearchInput UI is built, needs NLP query parsing on server
9. **Live SMS marketing blasts** -- AdminMarketing tab is ready, needs AWS SNS credentials
10. **Automated content ingestion pipeline** -- weekly Wasabi-to-DB import for 50-100 new videos/week target

### P3 -- Quarter 1

11. **Additional social logins** -- Instagram, Facebook, Twitter/X, LinkedIn, TikTok (UI slots ready with coming-soon tooltips in SocialLoginGrid)
12. **Mobile app or PWA** -- DJ Mike uses phone at gigs, needs responsive native experience
13. **Serato/VirtualDJ integration** -- direct crate export to DJ software file formats
14. **Advanced analytics** -- cohort analysis, LTV calculation, churn prediction beyond current AdminAnalytics
15. **Referral program** -- DJ community is word-of-mouth driven; incentivize sharing

---

## 16. Launch Readiness

| Criterion | Target | Current Status |
|-----------|--------|----------------|
| Homepage loads under 2s | LCP < 2000ms | Verify post-deploy |
| Search returns results under 500ms | p95 < 500ms | Verify post-deploy |
| Download URL generation under 1s | Presigned URL response time | PASS |
| Stripe checkout completes | All 7 variants return cs_live_ | PASS |
| Email delivery works | All 8 auth email triggers deliver | PASS |
| Auth flow end-to-end | Register -> verify -> login -> access content | PASS |
| Admin dashboard functional | All 10 tabs render and operate | PASS |
| Video catalog accessible | 26,043 videos queryable with genre/year/label/BPM filters | PASS |
| Presigned downloads work | Wasabi URLs return real files (83-190MB tested) | PASS |
| Zero critical errors | Frontend error boundary + backend logs clean | Verify post-deploy |

### Immediate Post-Launch Checklist

- [ ] Register Stripe webhook URL in dashboard (5 min)
- [ ] Set VITE_GOOGLE_CLIENT_ID on Vercel (2 min)
- [ ] Verify frontend loads correctly with live backend (manual check)
- [ ] Complete one full user flow: register -> verify email -> login -> search -> download (10 min)
- [ ] Verify admin login and all 10 tabs (5 min)
- [ ] Monitor error logs for first 24 hours

---

## 17. Critical Code Warnings

These are hard-won lessons from development. Do not repeat these mistakes.

1. **www.thevideopool.com is Steve's production site.** Never touch, reference, or deploy to it.
2. **Server returns `tracks` key, not `videos`.** The adapter layer (`src/api/adapters.ts`) maps `{tracks:[]}` to the frontend's `Track[]` type. Do not bypass it.
3. **Stripe price IDs use legacy `s2_` format.** They are valid and functional. Do not replace them with `price_` format.
4. **Database columns `v.year` and `v.label` are EMPTY.** Real data lives in `release_year` and `record_label`. The API aliases them.
5. **Admin password contains special characters** (`Admin123!@#`). Use proper encoding (Python urllib or `--data-raw` in curl) when testing via CLI.
6. **`extractKey()` must decode percent-encoded S3 keys** before passing to AWS SDK to prevent double-encoding.
7. **Quality enum in ORDER BY must be cast to text** (`vv.quality::text`) to prevent PostgreSQL error 22P02. The enum value is `'4k'` (lowercase), not `'4K'`.

---

*This document is the single source of truth for The Video Pool platform. It reflects the actual built state as of February 25, 2026. When the product changes, update this document -- not scattered notes.*

*Next review: 1 week post-launch.*
