# The Video Pool — Master Product Plan
**Compiled:** 2026-02-25 (Deep Dive Analysis)
**Goal:** $100M platform. Every feature wired, every button working.
**Rule:** tvp-export/ = read-only reference. Our version = the product.

---

## WHAT WE ACTUALLY HAVE (Honest Assessment)

### Our Frontend (src/) — The Good News
- ✅ 17 pages: Landing, Home(v2), Browse, Downloads, Library, Search, Admin, Insights, Settings, Login, Register, ForgotPassword, ResetPassword, EmailVerification, Membership, MembershipSuccess, SharedSet, OG500
- ✅ Full auth routing (protected routes, public routes, redirects)
- ✅ Camelot Wheel — fully built in appStore.ts with compatibility algorithm
- ✅ Set Builder with BPM range + recommendation scoring
- ✅ VirtualizedVideoList — handles 30K+ videos
- ✅ WaveformPreview component
- ✅ BulkUploader with drag-drop + filename metadata parsing
- ✅ Full Zustand store architecture (auth, app, browse, ui, panel, trial, view)
- ✅ AdminPanel, AdminAnalytics, AdminUsers, AdminVideos components
- ✅ PricingCards component
- ✅ Keyboard shortcuts system
- ✅ Batch download modal
- ✅ Download FAB + counter
- ✅ Layout V2 with panels
- ✅ OG 500 special page

### Our Frontend — Critical Gaps
- ❌ **HomePageV2 uses 100% MOCK DATA** — imports from `/data/tracks.ts` not from API
- ❌ **RecentDownloadsPanel uses mock data** — `import { recentDownloads } from '@/data/tracks'`
- ❌ **BulkUploader has only 10 genres** (needs 30 + all subgenres)
- ❌ **BulkUploader missing version types**: Acapella, Radio Edit, Quickhit, Outro, Intro
- ❌ **BPM range filter UI exists but not wired to backend**
- ❌ **Key/Camelot filter missing entirely from browse toolbar**
- ❌ **Layout presets (Club/Prep/Mobile)** — we have LayoutPresetSelector.tsx but not fully wired
- ❌ **Genre customize modal** — GenreNav.tsx exists but drag-to-reorder needs verification
- ❌ **WaveformPreview** not integrated into preview modal
- ❌ **Subgenre filter** — genre tabs show subgenre dropdowns but subgenre filter not sent to backend
- ❌ **Set Builder "Download Set"** button — UI exists, not wired
- ❌ **Share Set modal** — ShareSetModal.tsx exists, backend route for sharing not confirmed
- ❌ **AI Recommendations** — recommendations.ts API file exists, backend not implemented
- ❌ **Playlist custom icons** — Steve has it, we need to verify/build
- ❌ **Charts section** — UI exists in Steve's version, not in our main flow
- ❌ **Weekly Pack section** — WeeklyPackSection.tsx exists, not integrated in home
- ❌ **Scoring/explanation modal** — ScoringExplanationModal.tsx exists, needs integration
- ❌ **Video versions in preview** — Steve's UI has Clean/Dirty/Extended/Intro/Acapella selection; needs wiring to our VideoVersions DB column

### Our Backend (server/) — The Good News
- ✅ Full JWT auth (register, login, refresh, logout, email verification, forgot password, reset password)
- ✅ Video routes with pagination, search, filter, sort
- ✅ User routes (profile, settings, preferences)
- ✅ Membership routes (tiers, Stripe integration placeholders)
- ✅ Admin routes (stats, user management, video management)
- ✅ Webhook routes (Stripe webhooks)
- ✅ Rate limiting, CORS, Helmet security
- ✅ 10-table PostgreSQL schema
- ✅ Auth middleware (requireAuth, optionalAuth, requireAdmin)

### Our Backend — Critical Gaps
- ❌ **No favorites routes** (/api/favorites)
- ❌ **No playlists routes** (/api/playlists)
- ❌ **No standalone downloads routes** (/api/downloads — separate from video downloads)
- ❌ **No genre classification routes** (/api/genres, /api/genres/classify)
- ❌ **No recommendations endpoint** (/api/recommendations)
- ❌ **No shared set endpoint** (/api/sets/share, /api/sets/:shareId)
- ❌ **downloadService.js** — referenced in video routes, implementation unknown
- ❌ **Schema may be missing**: favorites table, playlists table, playlist_videos table, sets table
- ❌ **Video versions** — schema has version_type enum but video routes don't expose version filtering
- ❌ **BPM range filter** — schema supports it but needs verification in video routes
- ❌ **Key filter** — missing from video routes query params
- ❌ **Health check endpoint** — critical for Railway deployment monitoring

### Steve's Unique Contributions (borrow, don't copy)
- ✅ Genre classification service (MusicBrainz + Last.fm APIs — completely free)
- ✅ Full 30-genre + subgenre data structure  
- ✅ Favorites/downloads/playlists backend logic (Drizzle ORM → convert to raw SQL)
- ✅ Seed data patterns (for test data generation)
- ✅ Health check endpoint pattern

---

## THE PHASES

---

## PHASE 1A: Backend Gap-Fill (NO CREDENTIALS NEEDED)
*Everything that runs without a database — pure code completion*

### 1A-1: Missing Routes
Create these route files:
- `server/src/routes/favorites.js` — GET/POST/DELETE favorites + check endpoint
- `server/src/routes/playlists.js` — CRUD playlists + add/remove videos + playlist detail
- `server/src/routes/downloads.js` — GET download history, POST record download
- `server/src/routes/genres.js` — GET genres list, POST classify, POST batch-reclassify
- `server/src/routes/sets.js` — Create shared set, GET by shareId
- `server/src/routes/recommendations.js` — GET recommendations for user

### 1A-2: Missing Services
Create:
- `server/src/services/genreService.js` — Port Steve's genreService.ts (MusicBrainz + Last.fm)
- `server/src/services/favoritesService.js`
- `server/src/services/playlistService.js`
- `server/src/services/recommendationsService.js` — BPM/key/genre scoring algorithm
- Verify/complete `server/src/services/downloadService.js`

### 1A-3: Schema Migrations
Compare Steve's 6-table Drizzle schema with our 10-table SQL schema:
- Create `server/src/db/migrations/002_favorites_playlists.sql` if tables missing
- Create `server/src/db/migrations/003_sets_sharing.sql` for set sharing
- Ensure `video_versions` table or column exists
- Add indexes for performance (BPM, genre, created_at)

### 1A-4: Video Routes Enhancement  
Update `server/src/routes/videos.js`:
- Add `key` filter param
- Add `version` filter param (already exists — verify it works)
- Verify BPM range filter works (bpmMin/bpmMax)
- Add `/api/health` endpoint
- Add `/api/videos/:id/versions` — get available versions for a video

### 1A-5: Wire New Routes into server/src/index.js
- Import and mount all new routes
- Add missing route middleware

---

## PHASE 1B: Frontend — Kill Mock Data (NO CREDENTIALS NEEDED)
*Wire every API call to real backend endpoints*

### 1B-1: HomePageV2 — Replace Mock Data
- Currently imports from `/data/tracks.ts` (fake data)
- Replace with real API calls via browseStore or direct API
- Implement: getTrendingVideos(), getLatestVideos(), getForYouVideos()
- Add loading states, error states, empty states

### 1B-2: RecentDownloadsPanel — Wire to Downloads API
- Remove `import { recentDownloads } from '@/data/tracks'`
- Connect to `GET /api/downloads/:userId`
- Show real download history with timestamps
- Add "Clear History" button

### 1B-3: Favorites — Full Wiring
- Wire heart icon in VideoCard/VideoListItem to POST/DELETE /api/favorites
- Wire FavoritesPage/sidebar favorites count to GET /api/favorites/:userId
- Persist favorite state across sessions

### 1B-4: Browse Filters — Wire to Backend
- BPM range slider → send bpmMin/bpmMax to API
- Key filter dropdown (new) → send key param to API
- Subgenre filter → send subGenre param to API
- All 30 genres with subgenres in GenreNav

### 1B-5: Playlists — Wire Everything
- "Create Playlist" → POST /api/playlists
- Add to Playlist → POST /api/playlists/:id/videos
- Delete Playlist → DELETE /api/playlists/:id
- LibraryPage: load real playlists from API
- Playlist detail: GET /api/playlists/detail/:id

---

## PHASE 1C: Feature Completion (NO CREDENTIALS NEEDED)
*Every button and panel that needs logic, not just wiring*

### 1C-1: Set Builder — Fully Functional
- "Download Set" button → queue all tracks for batch download
- "Share Set" → POST /api/sets/share → returns shareId → show share link
- SharedSetPage (/set/:shareId) → GET /api/sets/:shareId → render the set
- Set export as CSV/playlist file
- BPM flow visualization (transition compatibility using Camelot Wheel)
- Add drag-to-reorder within set

### 1C-2: Layout Presets — Wired
Wire LayoutPresetSelector:
- **Club Mode** — large thumbnails, minimal text, single-column, high-contrast  
- **Prep Mode** — full table view with all columns (BPM, Key, Label, Genre, Date)
- **Mobile Mode** — compact cards, touch-friendly, swipe gestures
- Save selected preset to user profile

### 1C-3: Preview Modal — Full Feature Set
- Video versions selector (Clean/Dirty/Extended/Intro/Acapella/Radio) → wire to API
- WaveformPreview integration
- Quality selector → wire to download
- Add to Set button → wire to set builder
- Add to Playlist button → playlist picker modal
- "Similar tracks" suggestion (3 tracks via recommendations API)
- CamelotWheel mini display showing current key + compatible keys

### 1C-4: BulkUploader — Production-Ready
- Expand genre list from 10 → 30 (all genres + subgenres from genre data)
- Add all version types: Clean, Dirty, Extended, Intro, Outro, Acapella, Radio, Quickhit, Instrumental
- Wire to actual backend upload endpoint (POST /api/admin/videos/bulk)
- Progress bar wired to real upload progress
- Metadata editor: inline edit all fields before upload
- Duplicate detection (compare title + artist against DB)
- Auto-tag with AI genre classification (use genre service)

### 1C-5: Admin Dashboard — Fully Wired
- Stats cards wired to real /api/admin/stats
- User management table: real data, search, filter, ban/suspend actions
- Video management: real CRUD with bulk edit
- Analytics charts: download trends, subscriber growth, revenue
- "Weekly Pack" creator: select videos → publish as weekly package

### 1C-6: Insights Page
- Personal insights for DJs: most downloaded genres, BPM preferences, download patterns
- "Your sound profile" based on favorites + downloads
- Wire to user download/favorite history

### 1C-7: Recent Downloads — Production Grade
- Slide-out panel wired to real API
- 30-day history with timestamps
- Search within history
- Re-download button
- "Add to Set" from history item
- Download count meter (X of Y monthly downloads used)

### 1C-8: Genre Classification — UI Integration
- Admin: "Auto-classify" button on any video → calls /api/genres/classify
- Bulk auto-classify in uploader → batch classify all uploaded videos
- Show confidence score + source (MusicBrainz/Last.fm/local)
- Override option

### 1C-9: Weekly Pack / Editorial Sections
- WeeklyPackSection.tsx — wire to admin-created packs
- "Editor's Picks" section on home page
- "New This Week" curated by admin

---

## PHASE 1D: UX Polish & Missing Details
*The thousand small things that make a $100M product*

### UI Details from Steve's Version We Must Match/Exceed
- [ ] Genre pill drag-to-reorder in nav bar
- [ ] Genre customize modal (add/remove/reorder all 30 genres)
- [ ] "Reset to Default" genre order
- [ ] Layout preset label in toolbar showing current mode
- [ ] Notification bell with real notifications
- [ ] Profile dropdown: Edit Profile, Change Avatar, Billing & Plan, Download History, Sign Out
- [ ] Download progress bar on individual track cards
- [ ] Batch selection floating action bar (select multiple → batch download / add to set)
- [ ] Section collapse/expand with drag-to-reorder between sections
- [ ] BPM range quick-select (70-100, 100-120, 120-130, 130+)
- [ ] Sort by: Date, Title, Artist, BPM, Key, Quality, Genre
- [ ] "NEW" and "HOT" badges on video cards
- [ ] Quality badge color coding (4K=gold, 1080p=cyan, 720p=gray)
- [ ] Dark/Light mode toggle that persists to user profile
- [ ] CMD+K global search shortcut
- [ ] Keyboard shortcuts panel (?) button

### Additional Polish
- [ ] Empty states for all pages (no favorites, no downloads, no playlists)
- [ ] Error boundaries on all major components
- [ ] Optimistic UI updates (heart toggle feels instant)
- [ ] Skeleton loaders for all data-fetching sections
- [ ] "Back to top" button after scrolling
- [ ] Infinite scroll OR "Load more" for Browse All
- [ ] Video count badge on section headers
- [ ] Responsive: mobile-optimized nav, collapsible sidebar

---

## PHASE 2: Database (Needs Supabase Credentials)
- [ ] Pull DATABASE_URL + Supabase anon/service keys via browser relay
- [ ] Apply schema.sql + all migrations to Supabase
- [ ] Verify all 10+ tables created with correct indexes
- [ ] Run seed script to populate test videos
- [ ] Test all API routes against live database

---

## PHASE 3: Deployment (Needs Railway + Vercel + Stripe)
- [ ] Set Railway env vars: DATABASE_URL, JWT secrets, FRONTEND_URL, CORS_ORIGIN
- [ ] Set Vercel env vars: VITE_API_URL pointing to Railway
- [ ] Create Stripe products: Free, Basic ($19.99/mo), Pro ($39.99/mo), Lifetime
- [ ] Create Stripe webhook → Railway endpoint → verify webhook secret
- [ ] CORS test: Vercel frontend → Railway backend
- [ ] Verify HTTPS on both ends
- [ ] Deploy backend redeploy → verify 200 on /api/health

---

## PHASE 4: Testing & Launch (Feb 26-28)
- [ ] Full E2E: register → browse → download → subscribe
- [ ] Stripe payment test ($1 test charge)
- [ ] Admin: upload 10 test videos via BulkUploader
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Load test: simulate 100 concurrent users
- [ ] Security audit: test rate limiting, auth bypass attempts
- [ ] Lighthouse score ≥ 90 on Performance/Accessibility
- [ ] 🚀 Launch email to 10,598 subscribers (Feb 28)

---

## FILE ORGANIZATION RULES
```
the-video-pool/
├── src/                    ← OUR FRONTEND (do not mix)
├── server/                 ← OUR BACKEND (do not mix)
├── tvp-export/             ← STEVE'S VERSION (READ ONLY, reference only)
├── docs/                   ← Specs and docs
└── TVP-MASTER-PLAN.md      ← This file
```
Steve's code NEVER gets imported into our src/ or server/.
We PORT logic by rewriting it cleanly in our style.
