# The Video Pool -- Master Handover Document

**Prepared by:** CoCo (AI Execution Partner) on behalf of Aundre Oldacre
**Date:** February 25, 2026
**Classification:** Internal -- Contains credential references. Do not distribute externally.

---

## 1. TL;DR

- **What it is:** A professional DJ music video platform with 26,043 videos across all major genres. DJs subscribe to download high-quality music videos (with BPM, key, genre metadata) for live gigs. Think "Spotify for DJ video downloads."
- **Where it's deployed:** Frontend on Vercel, backend API on Railway, database on Supabase (PostgreSQL), video files on Wasabi S3. All services are live and healthy as of Feb 25, 2026.
- **What's working:** Video catalog with metadata filters, Stripe checkout (all 7 tier/interval combos), Wasabi presigned downloads (83--190MB files), email delivery via Brevo, Google OAuth, JWT auth, admin dashboard, phone verification routes.
- **What's left before public launch:** Register the Stripe webhook URL in the Stripe dashboard, set the Google OAuth client ID on Vercel, verify thumbnails render correctly on the frontend, and configure AWS credentials for live SMS delivery. None of these are code changes.
- **How to contribute:** Clone `github.com/aundre1/TVP-OC.git`, run `npm install && npm run dev` in both root and `server/` directories, read the Known Gotchas section below before touching any code.

---

## 2. Platform Overview

### What It Does

The Video Pool is a subscription-based platform where professional DJs browse, search, and download high-quality music videos for use during live performances. The catalog spans 26,043 videos across Hip-Hop, EDM, Pop, R&B, Rock, Reggaeton, Latin, and more -- each tagged with genre, release year, record label, BPM, and musical key.

### Who It's For

Working DJs who need a reliable, legal source of music videos for clubs, festivals, weddings, and corporate events. The platform replaces scattered file-sharing with a centralized, searchable library with download tracking and playlist management.

### Business Model

Four subscription tiers with increasing download allowances:

| Tier | Price | Downloads/Month | Billing Cycle | Stripe Price ID |
|------|-------|-----------------|---------------|-----------------|
| Freemium | $0 | 2 | -- | `price_1SkCTX2xxXTR95tlX49TIN8n` |
| Starter | $34.99 | 200 | Monthly | `s2_ca2738deb60b058a12d8fcd77ac4a6e9` |
| Pro | $99.99 | 300 | Quarterly | `s2_59282b1c818949d8529a63bba9bf10f8` |
| Elite | $299.99 | 400 | Annual | `s2_3fa73632a345d05262b57252a883fbee` |

Revenue flows through Stripe. The `s2_` price IDs are a legacy format but are fully valid -- do not attempt to replace them with `price_` format IDs.

### Ownership

- **Owner:** Aundre Oldacre
- **Previous owner:** Steve (his production site at www.thevideopool.com is entirely separate -- never touch or reference it)
- **Repository:** `github.com/aundre1/TVP-OC.git`
- **Local path:** `/Users/dremacmini/Desktop/OC/the-video-pool/`

---

## 3. Infrastructure Map

| Service | URL / Identifier | Purpose | Status |
|---------|-----------------|---------|--------|
| **Vercel** | https://tvp-redesign-2026.vercel.app | Frontend hosting (React SPA) | Live |
| **Railway** | https://tvp-oc-production.up.railway.app | Backend API (Express) | Live |
| **Supabase** | Project ID: `jvgsmiqsqtqgfagghoiv` | PostgreSQL database | Live |
| **Wasabi** | Bucket: `thevideopool-us` (us-east-1) | Video file storage (S3-compatible) | Live |
| **Stripe** | Live keys configured | Payments and subscriptions | Live |
| **Brevo** | API key configured | Transactional email delivery | Live |

### Credential Management

All secrets are stored as environment variables on their respective platforms. **Do not hardcode credentials.**

- **Railway env vars:** See `RAILWAY_ENV_VARS.md` in the project root for the complete list (DATABASE_URL, JWT_SECRET, REFRESH_TOKEN_SECRET, all Stripe keys, Brevo API key, Wasabi S3 credentials, and more).
- **Vercel env vars:** `VITE_STRIPE_PUBLIC_KEY` and `VITE_API_URL=/api` are set. `VITE_GOOGLE_CLIENT_ID` still needs to be added.
- **Admin account:** `admin@thevideopool.com` / `Admin123!@#` -- change this password before public launch.

### Proxy Architecture

Vercel's `vercel.json` proxies all `/api/*` requests to the Railway backend. The frontend never calls Railway directly -- all traffic routes through the Vercel domain.

---

## 4. Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS (custom `tvp-` classes), Zustand, TanStack React Query |
| Backend | Node.js, Express, PostgreSQL (via Supabase), Drizzle ORM |
| Storage | Wasabi S3 (S3-compatible API) |
| Payments | Stripe (checkout sessions, webhooks) |
| Email | Brevo (transactional), with SMTP and SendGrid as fallbacks |
| Auth | JWT + refresh tokens, Google OAuth, SMS phone verification |

### Data Flow (ASCII)

```
                                    +------------------+
                                    |   Wasabi S3      |
                                    | (video files,    |
                                    |  thumbnails)     |
                                    +--------+---------+
                                             |
                                     presigned URLs
                                             |
+-------------+    /api/* proxy    +---------+--------+    SQL    +------------+
|   Vercel    | -----------------> |    Railway       | --------> |  Supabase  |
| (React SPA) | <----------------- | (Express API)    | <-------- | (Postgres) |
+------+------+    JSON responses  +---------+--------+           +------------+
       |                                     |
       |                                     |
  User Browser                    +----------+----------+
                                  |                     |
                              +---+---+           +-----+-----+
                              | Stripe|           |   Brevo   |
                              | (pay) |           |  (email)  |
                              +-------+           +-----------+
```

### Project Structure

```
the-video-pool/
├── src/                           # Frontend (React + TypeScript)
│   ├── App.tsx                    # Route definitions (19 routes)
│   ├── pages/                     # 18 page components
│   ├── components/                # 50+ UI components
│   │   ├── admin/                 # 8 admin sub-components
│   │   ├── ui/                    # 40+ shadcn/radix primitives
│   │   ├── Panels/                # 5 slide-out panels
│   │   └── SocialLoginGrid.tsx    # Google OAuth + coming-soon grid
│   ├── stores/                    # Zustand: authStore, uiStore, appStore
│   ├── hooks/                     # useAuth, useVideos, use-mobile
│   ├── api/                       # API client, endpoint modules, adapters.ts
│   └── types/                     # TypeScript definitions
├── server/                        # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/                # 15 route files (see Route Reference)
│   │   ├── services/              # authService, emailService, videoService, blastDistributor
│   │   ├── middleware/            # auth, errorHandler, rateLimit
│   │   ├── db/                    # config, migrations/ (001-014)
│   │   └── scripts/               # wasabi-import.js, enrich-metadata.js
│   └── package.json
├── vercel.json                    # /api/* proxy to Railway
├── .planning/                     # PRD, Roadmap, BRD, phase plans
├── RAILWAY_ENV_VARS.md            # All environment variable values
├── DEPLOYMENT_STATUS.md           # Deployment report
├── SUPABASE_RAILWAY_SETUP.md      # Integration guide
└── MASTER_HANDOVER.md             # THIS DOCUMENT
```

### Key Adapter Pattern

The server returns video data under a `tracks` key (not `videos`). The file `src/api/adapters.ts` maps the server's `{tracks:[]}` response shape into the frontend's `Track[]` type. Any new developer must be aware of this translation layer.

---

## 5. Feature Inventory

| Feature | Status | Frontend Location | Backend Location | Notes |
|---------|--------|-------------------|------------------|-------|
| User registration | Built | `RegisterPage.tsx` | `routes/auth.js` | Email + password + phone |
| User login | Built | `LoginPage.tsx` | `routes/auth.js` | JWT + refresh tokens |
| Google OAuth | Built | `SocialLoginGrid.tsx` | `routes/auth.js` (POST /auth/google) | Needs VITE_GOOGLE_CLIENT_ID on Vercel |
| Phone verification (SMS) | Built | `PhoneVerificationPage.tsx` | `routes/auth.js` | Stub mode -- needs AWS SNS creds |
| Password reset | Built | `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx` | `routes/auth.js` | Token-based flow |
| Email verification | Built | `EmailVerificationPage.tsx` | `routes/auth.js` | Via Brevo |
| Video catalog browse | Built | `HomePage.tsx` | `routes/videos.js` | Genre/year/label filters |
| Video search | Built | `SearchPage.tsx` | `routes/videos.js` | Query param search |
| Video detail + download | Built | `VideoPage.tsx` | `routes/videos.js`, `routes/downloads.js` | Wasabi presigned URLs |
| Download tracking | Built | `DownloadsPage.tsx` | `routes/downloads.js` | History + re-download |
| Playlists (crates) | Built | `LibraryPage.tsx` | `routes/playlists.js` | Create, manage, add videos |
| Favorites | Built | `LibraryPage.tsx` | `routes/favorites.js` | Star/unstar videos |
| Shared setlists | Built | `SharedSetPage.tsx` | `routes/sets.js` | Public share link |
| Membership management | Built | `MembershipPage.tsx` | `routes/memberships.js` | Stripe checkout integration |
| Post-checkout success | Built | `MembershipSuccessPage.tsx` | -- | Confirmation UI |
| Admin dashboard | Built | `AdminPage.tsx` + `components/admin/` | `routes/admin.js` | 10-tab dashboard |
| Business insights | Built | `InsightsPage.tsx` | `routes/admin.js` | Admin-only analytics |
| Marketing blasts | Built | -- | `routes/marketing.js` | Email/SMS campaigns |
| Support tickets | Built | -- | `routes/support.js` | Ticket submission |
| Coupon codes | Built | -- | `routes/coupons.js` | Discount management |
| Content request queue | Built | -- | `routes/content-queue.js` | User video requests |
| Stripe webhook handler | Built | -- | `routes/webhooks.js` | Needs URL registered in Stripe |
| AI search | Partial | UI exists in SearchPage | Not wired | NLP query parsing planned |
| react-window virtualization | Partial | Scaffolded | -- | Needed for 30K+ catalog perf |
| DJ software export | Planned | -- | -- | Serato, VirtualDJ, Rekordbox |
| Mobile PWA | Planned | -- | -- | Responsive exists, PWA does not |

---

## 6. Route Reference

### Frontend Routes (19)

| Route | Auth | Component | Purpose |
|-------|------|-----------|---------|
| `/welcome` | No | LandingPage | Public marketing page |
| `/` | No | RootRedirect | Redirects to /home (auth) or /welcome (anon) |
| `/login` | No* | LoginPage | Email/Google login + 2FA (* redirects if already auth'd) |
| `/register` | No* | RegisterPage | Account creation (* redirects if already auth'd) |
| `/forgot-password` | No | ForgotPasswordPage | Password reset request |
| `/reset-password` | No | ResetPasswordPage | Password reset with token |
| `/verify-email` | No | EmailVerificationPage | Email confirmation |
| `/verify-phone` | Yes | PhoneVerificationPage | SMS MFA step (skippable) |
| `/home` | Yes | HomePage | Main dashboard with catalog |
| `/video/:id` | Yes | VideoPage | Video detail and download |
| `/search` | Yes | SearchPage | Filtered search results |
| `/library` | Yes | LibraryPage | Playlists and favorites |
| `/downloads` | Yes | DownloadsPage | Download history |
| `/membership` | Yes | MembershipPage | Plan management and upgrade |
| `/membership/success` | Yes | MembershipSuccessPage | Post-Stripe confirmation |
| `/settings` | Yes | SettingsPage | Profile and 2FA settings |
| `/admin` | Admin | AdminPage | 10-tab admin dashboard |
| `/insights` | Admin | InsightsPage | Business intelligence |
| `/set/:shareId` | No | SharedSetPage | Public shared setlists |

### Backend Route Files (15)

| File | Prefix | Key Endpoints |
|------|--------|---------------|
| `auth.js` | `/api/auth` | POST /register, /login, /google, /send-phone-verification, /verify-phone-code, /forgot-password, /reset-password |
| `videos.js` | `/api/videos` | GET / (list+filter), GET /search, GET /:id, GET /:id/download |
| `downloads.js` | `/api/downloads` | GET / (history), POST / (track), GET /limits |
| `memberships.js` | `/api/memberships` | GET / (tiers), POST /create-checkout, POST /cancel |
| `admin.js` | `/api/admin` | GET /stats, /users, /videos, /analytics, POST /cache/clear |
| `marketing.js` | `/api/admin/marketing` | POST /blast, GET /history, POST /daily-runner |
| `support.js` | `/api/support` | POST / (create ticket), GET / (list) |
| `playlists.js` | `/api/playlists` | CRUD operations for DJ crates |
| `favorites.js` | `/api/favorites` | POST /toggle, GET / (list) |
| `sets.js` | `/api/sets` | CRUD for shared setlists |
| `genres.js` | `/api/genres` | GET / (genre list) |
| `user.js` | `/api/user` | GET /profile, PATCH /profile, PATCH /email-preferences |
| `webhooks.js` | `/api/webhooks` | POST /stripe (Stripe event handler) |
| `coupons.js` | `/api/coupons` | CRUD for discount codes |
| `content-queue.js` | `/api/content-queue` | POST / (request video), GET / (queue) |

---

## 7. Database Schema Summary

The database runs on Supabase PostgreSQL with 14 migrations applied (001 through 014).

### Key Tables

| Table | Row Count | Purpose | Important Columns |
|-------|-----------|---------|-------------------|
| `videos` | 26,043 | Master video catalog | id, title, artist, genre, release_year, record_label, bpm, key, slug |
| `video_versions` | 27,619 | Quality variants per video | video_id, quality (enum: 1080p/720p/4k/audio), file_path, file_size |
| `users` | -- | User accounts | id, email, password_hash, membership_tier, google_id, avatar_url, phone_code, phone_code_expires, phone_verified |
| `memberships` | 4 | Subscription tier definitions | id, name, price, download_limit, stripe_price_id |
| `downloads` | -- | Download history + limits | user_id, video_id, version_id, downloaded_at |
| `playlists` | -- | User-created crates | user_id, name, description |
| `playlist_videos` | -- | Join table | playlist_id, video_id |
| `favorites` | -- | Favorited videos | user_id, video_id |
| `sets` | -- | Shared setlists | id, user_id, share_id, name, videos (jsonb) |
| `support_tickets` | -- | Support requests | user_id, subject, message, status |
| `coupons` | -- | Discount codes | code, discount_percent, valid_until |

### Catalog Quality

| Metric | Coverage |
|--------|----------|
| Genre populated | 99.5% (25,913 / 26,043) |
| Record label populated | 99.1% (25,819 / 26,043) |
| Release year populated | 99.9% (26,005 / 26,043) |

### Migration 014 (Latest)

Added to the `users` table: `google_id` (varchar, nullable), `avatar_url` (text, nullable), `phone_code` (varchar(6), nullable), `phone_code_expires` (timestamp, nullable). This supports Google OAuth login and SMS-based phone verification.

---

## 8. Known Gotchas

These are the pitfalls that will waste hours if you are not aware of them. Read this section before writing any code.

| # | Gotcha | Impact | Resolution |
|---|--------|--------|------------|
| 1 | `v.year` and `v.label` columns are **empty** | Queries using these columns return null | Always use `v.release_year` and `v.record_label` instead |
| 2 | Server returns `tracks` key, not `videos` | Frontend receives empty arrays if not adapted | `src/api/adapters.ts` handles the mapping -- use it |
| 3 | S3 key extraction must `decodeURIComponent()` first | Double-encoded URLs cause 403 from Wasabi | Always decode before passing to AWS SDK |
| 4 | Quality enum must be cast to text in SQL | `ORDER BY CASE vv.quality WHEN '4K'` fails (it's `'4k'`) | Use `vv.quality::text` in CASE expressions |
| 5 | Admin password contains `!@#` | Shell escaping breaks curl commands | Use Python `urllib` or curl `--data-raw` |
| 6 | Stripe price IDs use `s2_` prefix | Looks wrong but is valid legacy format | Do not replace with `price_` format |
| 7 | www.thevideopool.com is Steve's production site | Modifying it would break a live business | Never touch, reference, or deploy to it |
| 8 | Email `sendTransactional()` fallback chain | Originally only tried SMTP + SendGrid (both unconfigured) | Fixed: chain is now SMTP -> Brevo -> SendGrid |

---

## 9. What's Working (Verified Feb 25, 2026)

Every item below has been tested against the production deployment and confirmed functional.

| Integration | Verification Method | Result |
|-------------|-------------------|--------|
| Backend health | `GET /health` | Returns healthy |
| Video catalog + filters | `GET /api/videos?limit=3&genre=Hip-Hop` | Returns videos with genre, year, label |
| Video search | `GET /api/videos/search?q=drake` | Returns matching results |
| Admin login | `POST /api/auth/login` with admin creds | Returns valid JWT |
| Stripe checkout | `POST /api/memberships/create-checkout` (all 7 combos) | Returns real `cs_live_` session IDs |
| Wasabi downloads | `GET /api/videos/:id/download` | Returns presigned URLs, files 83--190MB |
| Email delivery | Triggered all 8 auth email types | Delivered to videomixer@gmail.com via Brevo |
| Google OAuth | `POST /api/auth/google` | Creates/finds user, returns JWT |
| Database migrations | 014 migrations applied | All columns present |
| Phone verification routes | `POST /api/auth/send-phone-verification` | Routes exist (stub mode -- needs AWS SNS) |

### Quick Verification Commands

```bash
# Health check
curl https://tvp-oc-production.up.railway.app/health

# Videos with metadata
curl "https://tvp-oc-production.up.railway.app/api/videos?limit=3&genre=Hip-Hop"

# Admin login (handles special chars in password)
python3 -c "
import urllib.request, json
data = json.dumps({'email':'admin@thevideopool.com','password':'Admin123!@#'}).encode()
req = urllib.request.Request('https://tvp-oc-production.up.railway.app/api/auth/login', data=data, headers={'Content-Type':'application/json'})
print(json.loads(urllib.request.urlopen(req).read())['accessToken'])
"
```

---

## 10. What's Left (Prioritized Backlog)

### Immediate (Pre-Public Launch) -- Configuration Only, No Code Changes

| # | Task | Effort | Where |
|---|------|--------|-------|
| 1 | Register Stripe webhook URL in Stripe dashboard | 5 min | Stripe Dashboard -> Webhooks -> Add `https://tvp-oc-production.up.railway.app/api/webhooks/stripe` |
| 2 | Set `VITE_GOOGLE_CLIENT_ID` on Vercel | 2 min | Vercel -> Settings -> Env Vars (authorized JS origin: `tvp-redesign-2026.vercel.app`) |
| 3 | Verify thumbnails render on frontend | 15 min | Browser testing -- Wasabi URLs are present in data |
| 4 | Set `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` on Railway | 5 min | For live SMS via AWS SNS (currently in stub mode) |
| 5 | Change admin password from default | 2 min | Database or settings UI |

### Near-Term (Post-Soft-Launch)

| # | Task | Effort | Description |
|---|------|--------|-------------|
| 6 | Dedicated recommendations endpoint | 1 day | Wire frontend to `/api/recommendations/*` (currently using `/api/videos/recommended`) |
| 7 | Autocomplete search | 1 day | Wire `/api/search` for typeahead (currently using `/api/videos` with params) |
| 8 | react-window virtualization | 2 days | Critical for 30K+ catalog performance on browse pages |
| 9 | Sentry error tracking | 0.5 day | Frontend + backend error monitoring |
| 10 | Analytics (Mixpanel/Amplitude) | 1 day | User behavior tracking |

### Roadmap (Growth Phase)

| # | Feature | Effort | Description |
|---|---------|--------|-------------|
| 11 | AI-powered natural language search | 1 week | UI is built, backend NLP parsing not wired |
| 12 | Viral setlist sharing | 1 week | SharedSetPage exists, needs engagement/social layer |
| 13 | DJ software export | 2 weeks | Generate Serato, VirtualDJ, Rekordbox compatible files |
| 14 | Mobile PWA | 2 weeks | Responsive layout exists, needs service worker + manifest |

---

## 11. How to Run Locally

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL connection (use Supabase or local)

### Frontend

```bash
cd /Users/dremacmini/Desktop/OC/the-video-pool
npm install
npm run dev
# Runs at http://localhost:3001
```

### Backend

```bash
cd /Users/dremacmini/Desktop/OC/the-video-pool/server
npm install
# Create .env file -- see RAILWAY_ENV_VARS.md for all required values
npm run dev
# Runs at http://localhost:5000
```

### Key Development Notes

- Frontend uses `@/` path aliases (mapped to `src/`)
- TailwindCSS uses custom `tvp-` prefixed utility classes
- Zustand stores: `authStore` (user/tokens), `uiStore` (panels/modals), `appStore` (global state)
- The Vercel proxy (`vercel.json`) only applies in production -- locally, configure VITE_API_URL to point to `http://localhost:5000/api`

---

## 12. Version History

| Version | Date | Key Changes |
|---------|------|-------------|
| v1 | Jan 2026 | Initial codebase inherited from Steve's export |
| v2 | Feb 1--15, 2026 | Complete frontend redesign (Phases 1--5): 18 pages, 50+ components, Zustand stores, TailwindCSS design system |
| v3 | Feb 16--24, 2026 | Backend integration: Supabase DB with 26K videos imported, Railway deployment, Vercel deployment, environment configuration, API proxy setup |
| v4 | Feb 25, 2026 | All critical blockers resolved: Stripe checkout (7 variants verified), Wasabi presigned downloads (dual-bucket fix), email delivery (Brevo fallback chain), Google OAuth with JWT, phone verification (SMS stub), database migration 014 |

### Notable Commits (Recent)

| Hash | Description |
|------|-------------|
| `21f35c8` | Dual-bucket S3 key extraction + auth on downloads history |
| `ccb0f6c` | TypeScript build errors blocking CI and Vercel deploys |
| `48c1ebf` | Decode percent-encoded S3 key before signing |
| `319bb11` | Cast quality enum to text in CASE expression |
| `ff15b7a` | Seed real Stripe price IDs into memberships table |

---

## 13. Contacts & Access

| Role | Person | Contact |
|------|--------|---------|
| **Owner / CEO** | Aundre Oldacre | admin@thevideopool.com |
| **AI Execution Partner** | CoCo (via OpenClaw + Claude Code) | Embedded in workspace |
| **Previous Owner** | Steve | No longer involved -- do not contact regarding this deployment |

### Access Points

| Resource | How to Access |
|----------|---------------|
| GitHub repo | `github.com/aundre1/TVP-OC.git` |
| Vercel dashboard | Vercel account linked to repo |
| Railway dashboard | Railway account -- service name: TVP-OC |
| Supabase dashboard | `https://app.supabase.com` -- project ID: `jvgsmiqsqtqgfagghoiv` |
| Stripe dashboard | Stripe account with live keys configured |
| Wasabi console | Wasabi account -- bucket: `thevideopool-us` (us-east-1) |
| Brevo dashboard | Brevo account with API key configured |

### Critical Reminder

**www.thevideopool.com belongs to Steve's production environment.** Our deployment is at `tvp-redesign-2026.vercel.app` (frontend) and `tvp-oc-production.up.railway.app` (backend). These are entirely separate systems. Never deploy to, modify, or reference Steve's domain.

---

*This document is the single source of truth for The Video Pool. Update it when infrastructure, features, or architecture changes. Last verified: February 25, 2026.*
