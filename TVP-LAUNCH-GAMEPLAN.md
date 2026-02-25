# The Video Pool — Launch Game Plan
**Created:** 2026-02-25
**Target Launch:** Feb 28, 2026
**Rule:** DO NOT touch Steve's `tvp-export/` — read-only reference

---

## Architecture Overview

**What we have:**
- **Our Frontend** (`src/`): React+Vite+TypeScript, refined UI with stores, components, API layer (axios). Deployed on Vercel (`tvp-redesign-2026.vercel.app`)
- **Our Backend** (`server/`): Node.js/Express (JS), production-grade (helmet, rate limiting, morgan). Routes: auth (1003 lines), videos (320), user (651), memberships (257), admin (447), webhooks (239). Deployed on Railway (`tvp-oc-production.up.railway.app`) — **502 due to missing DATABASE_URL**
- **Our Database**: Supabase project `jvgsmiqsqtqgfagghoiv` — schema file exists (`server/src/db/schema.sql`, 10 tables) but needs to be applied
- **Steve's Reference** (`tvp-export/`): TypeScript+Drizzle, genre classification service (MusicBrainz + Last.fm), seed data, working Replit patterns

**What to borrow from Steve (code patterns only):**
1. Genre Classification Service (`genreService.ts`) — port to JS for our backend
2. Seed data logic (`seed.ts`) — for populating initial video catalog
3. Drizzle schema patterns — reference for ensuring our SQL schema covers same features
4. API route patterns — verify our routes match Steve's working endpoints

---

## PHASE 1: Everything We Can Do NOW (No Browser/Credentials Needed)

### 1A. Port Steve's Genre Service to Our Backend
- Convert `tvp-export/server/genreService.ts` → `server/src/services/genreService.js`
- Add genre routes to our backend (`/api/genres`, `/api/genres/classify`, `/api/genres/reclassify-batch`)
- Wire into `server/src/index.js`

### 1B. API Route Audit & Alignment
- Compare Steve's routes vs our routes — find gaps
- Steve has: videos, profile, favorites, downloads, playlists, playlist-videos, genres, health
- We have: auth, videos, user, memberships, admin, webhooks
- **Missing from our backend:** favorites, playlists, playlist-videos, genres
- **We have that Steve doesn't:** auth, memberships, admin, webhooks (more production-ready)
- Add missing routes to our server

### 1C. Schema Validation
- Compare Steve's Drizzle schema (`shared/schema.ts`) with our SQL schema (`server/src/db/schema.sql`)
- Ensure our schema covers: videos, user_profiles, favorites, downloads, playlists, playlist_videos
- Our schema has 10 tables (richer) — verify they align with frontend expectations

### 1D. Frontend API Layer Audit
- Check all `src/api/*.ts` files — map each API call to backend routes
- Verify route paths match between frontend expectations and backend implementation
- Fix any mismatches

### 1E. Seed Data Script
- Port Steve's `seed.ts` to work with our backend/schema
- Create `server/src/db/seed.js` for populating the 30K video catalog
- Ensure seed data matches our schema format

### 1F. Local Development Environment
- Get backend running locally (mock DATABASE_URL or SQLite fallback)
- Test all routes respond correctly
- Verify frontend → backend communication locally

---

## PHASE 2: Database Setup (Needs Supabase Access)

### 2A. Get Supabase Credentials
- Connection string (DATABASE_URL) from project `jvgsmiqsqtqgfagghoiv`
- Anon key + Service role key
- **Method:** Browser relay OR Aundre provides manually

### 2B. Apply Database Schema
- Run `server/src/db/schema.sql` against Supabase
- Run migration `001_auth_enhancements.sql`
- Verify all tables created with proper RLS policies

### 2C. Seed Video Catalog
- Run seed script to populate 30K videos
- Verify data integrity

---

## PHASE 3: Deployment & Integration (Needs Railway + Stripe Access)

### 3A. Set Railway Environment Variables
- `DATABASE_URL` (from Phase 2)
- `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `SESSION_SECRET` (can generate now)
- `FRONTEND_URL=https://tvp-redesign-2026.vercel.app`
- `CORS_ORIGIN=https://tvp-redesign-2026.vercel.app`
- `NODE_ENV=production`

### 3B. Stripe Configuration
- Get/create Stripe products for membership tiers (Free, Basic, Pro, Lifetime)
- Get webhook signing secret
- Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` on Railway

### 3C. Vercel Frontend Config
- Set `VITE_API_URL` to Railway backend URL
- Verify CORS works cross-origin
- Deploy and test

---

## PHASE 4: Testing & Launch (Feb 26-28)

### 4A. End-to-End Testing
- Registration/login flow
- Video browsing (30K videos, virtualized scrolling)
- Favorites, playlists, downloads
- Genre filtering + classification
- Subscription/payment flow
- Mobile responsiveness

### 4B. Performance & Security
- Load testing (10+ concurrent users)
- Security audit (CORS, rate limiting, JWT validation)
- Lighthouse audit

### 4C. Launch (Feb 28) 🚀
- Final deploy
- Monitor first 6 hours
- Announce to subscriber list (11K emails)

---

## What Can Be Generated NOW (Phase 1 Blockers: None)

| Task | Blocker | Status |
|------|---------|--------|
| Port genre service | None | 🔄 Starting |
| Add missing routes (favorites, playlists) | None | 🔄 Starting |
| Schema validation | None | 🔄 Starting |
| Frontend API audit | None | 🔄 Starting |
| Seed data script | None | 🔄 Starting |
| Generate JWT secrets | None | 🔄 Starting |
| Local dev testing | None | 🔄 Starting |

## What Needs Browser/Credentials (Phase 2+)

| Task | Needs |
|------|-------|
| Supabase connection string | Browser relay or manual |
| Supabase anon/service keys | Browser relay or manual |
| Railway env vars | Browser relay or manual |
| Stripe setup | Browser relay or manual |
