# The Video Pool - UI Reskin Migration Roadmap

## Strategy: UI Reskin (Council-Approved)

**Decision:** Keep Claude Code as the architectural base (routing, state, API layer, backend integrations). Apply the polished Replit UI design system on top. This preserves all backend work (Stripe, SendGrid, Railway, BunnyCDN, Wasabi) while upgrading the visual quality.

**Source:** `TVP-Export/` (Replit export - shadcn/ui + TailwindCSS v4 + Framer Motion)
**Target:** `TVP-Redesign-2026/` (Claude Code project - React 18 + Zustand + Axios + full API layer)

---

## What We Keep From Each

### From Claude Code (Architecture)
- `src/api/` - Full API integration layer (auth, subscriptions, downloads, videos, library, recommendations, websocket)
- `src/stores/` - Zustand state management (authStore, appStore, uiStore, trialStore)
- `src/hooks/` - Custom hooks (useAuth, useDownloads, useSubscription, useLibrary, useVideos, useFreeTrial)
- `src/types/index.ts` - Complete TypeScript interfaces
- `src/pages/` - Multi-page routing (Login, Register, Settings, Admin, Membership, Downloads)
- `src/config/` - Dev config with mock auth toggle
- `vite.config.ts` - Proxy setup, code splitting, build config
- `mock-server/` - Development mock server
- `.planning/` - All project documentation

### From Replit (Visual Design)
- `client/src/index.css` - CSS variables, design tokens, component styles
- `client/src/components/ui/` - 50+ shadcn/ui components (Radix UI based)
- `client/src/pages/Home.tsx` - Visual patterns (decomposed into proper components)
- `components.json` - shadcn/ui configuration
- Design patterns: card hover effects, genre navigation, batch selection bar, set builder panel
- Dark/light theme system with CSS variables

---

## Phase 1: Design System Migration

**Goal:** Install shadcn/ui and port Replit's design tokens into the Claude Code project

### Tasks
- [ ] Install shadcn/ui dependencies (@radix-ui/*, class-variance-authority, clsx, tailwind-merge)
- [ ] Copy `components.json` config (adapted for Claude Code paths)
- [ ] Port CSS variables from Replit `index.css` into Claude Code's global CSS
- [ ] Copy all 50 shadcn/ui component files from `TVP-Export/client/src/components/ui/` to `src/components/ui/`
- [ ] Install framer-motion for animations
- [ ] Install sonner for toast notifications (replace existing toast system)
- [ ] Update `tsconfig.json` paths if needed for `@/components/ui` imports
- [ ] Verify all shadcn/ui components compile without errors
- [ ] Remove Replit-specific dependencies (@replit/* plugins)

### Files Modified
- `package.json` - New dependencies
- `src/index.css` or `src/styles/globals.css` - Design tokens
- `src/components/ui/` - New directory with 50+ components
- `tsconfig.json` - Path aliases
- `tailwind.config.ts` - Theme extensions

### Verification
- `npm run build` completes without errors
- Import any shadcn/ui component in a test page and verify it renders

---

## Phase 2: Component Reskin - Core Layout

**Goal:** Reskin Header, Sidebar, Genre Nav, and main layout to match Replit's polished look

### Tasks
- [ ] Decompose Replit `Home.tsx` (1,888 lines) into reference sections
- [ ] Reskin `HeaderV2.tsx` with Replit's header design (72px, search bar, theme toggle, user dropdown)
- [ ] Reskin `GenreNav.tsx` with Replit's draggable genre pills (Framer Motion reorder)
- [ ] Create/update Sidebar component (240px, Navigate/Discover/Library sections, download widget)
- [ ] Reskin main layout structure (sidebar + content area with proper spacing)
- [ ] Add dark/light theme toggle using next-themes (Replit pattern)
- [ ] Update Toolbar (view toggle, BPM filter, sort dropdown) to shadcn/ui

### Files Modified
- `src/components/layout/Header.tsx` or `HeaderV2.tsx`
- `src/components/GenreNav.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/Toolbar.tsx`
- `src/pages/HomePage.tsx`

### Verification
- Main layout matches Replit's visual design
- Dark/light theme toggle works
- Genre navigation is functional with drag reorder

---

## Phase 3: Component Reskin - Video Display

**Goal:** Reskin VideoCard, VideoList, and VideoGrid to match Replit's polished video components

### Tasks
- [ ] Reskin `VideoCard.tsx` (grid view) with Replit's hover effects, quality badges, NEW/HOT badges
- [ ] Reskin `VideoList.tsx` (list view) with Replit's 12-column grid row layout
- [ ] Update quality badge styling (4K=yellow, 1080p=cyan, 720p/480p=dark)
- [ ] Add batch selection UI (checkbox on cards, floating action bar)
- [ ] Reskin `PreviewModal.tsx` with Replit's split layout (thumbnail left, info right)
- [ ] Update download quality selector in preview modal
- [ ] Add Set Builder panel (right slide-out, track stats, drag reorder)
- [ ] Add Recent Downloads modal/panel
- [ ] Integrate react-window virtualization for 30K+ video lists

### Files Modified
- `src/components/VideoCard.tsx` / `VideoCardV2.tsx`
- `src/components/VideoList.tsx`
- `src/components/VideoGrid.tsx`
- `src/components/VirtualizedVideoList.tsx`
- `src/components/modals/PreviewModal.tsx`
- `src/components/SetBuilder.tsx`

### Verification
- Grid view shows polished cards with hover effects
- List view shows 12-column layout
- Preview modal displays correctly
- Batch selection works
- 30K videos render smoothly with virtualization

---

## Phase 4: Pages & Routing

**Goal:** Apply reskin to all pages and ensure routing/navigation works end-to-end

### Tasks
- [ ] Reskin `LoginPage.tsx` with shadcn/ui form components
- [ ] Reskin `RegisterPage.tsx` with email verification flow
- [ ] Reskin `SettingsPage.tsx` (profile, preferences, account)
- [ ] Reskin `MembershipPage.tsx` (pricing tiers, Stripe checkout)
- [ ] Reskin `DownloadsPage.tsx` (download history)
- [ ] Reskin `AdminPage.tsx` (if included in MVP)
- [ ] Update routing to include all pages
- [ ] Add landing page for unauthenticated users
- [ ] Wire genre customization modal (add/remove/reorder up to 20)
- [ ] Wire profile avatar upload modal

### Files Modified
- All files in `src/pages/`
- `src/App.tsx` - Route definitions
- `src/components/modals/` - Various modals

### Verification
- All pages render with consistent shadcn/ui styling
- Navigation between pages works
- Forms submit correctly (mock mode)
- Modals open/close properly

---

## Phase 5: Backend Wiring

**Goal:** Connect reskinned frontend to existing API layer and backend services

### Tasks
- [ ] Verify `src/api/client.ts` Axios interceptors work with reskinned components
- [ ] Wire auth flow: Login → JWT storage → authenticated routes → logout
- [ ] Wire Stripe checkout: Membership page → `subscriptionsApi.createCheckoutSession()` → Stripe redirect
- [ ] Wire downloads: VideoCard download button → `downloadsApi` → signed URL → file download
- [ ] Wire favorites: Heart button → `libraryApi.addFavorite()` / `removeFavorite()`
- [ ] Wire search: Search bar → `videosApi.search()` with filters
- [ ] Wire playlists/sets: Set Builder → `libraryApi` playlist endpoints
- [ ] Wire user profile: Settings page → `authApi.getCurrentUser()` + profile updates
- [ ] Test mock mode toggle (`DEV_CONFIG.useMockAuth`)
- [ ] Verify SendGrid email flows work (verification, password reset)
- [ ] Test BunnyCDN/Wasabi signed URL generation for video delivery

### Files Modified
- Components now import from `src/api/` and `src/stores/`
- `src/config/dev.ts` - Toggle mock vs real
- Environment variable configuration

### Verification
- Full flow: Register → Verify Email → Login → Browse → Download → Logout
- Stripe checkout redirects correctly
- Downloads use signed URLs
- Favorites persist across sessions
- Search returns filtered results

---

## Phase 6: Production Polish & Launch

**Goal:** Performance optimization, testing, and deployment readiness

### Tasks
- [ ] Performance profiling (<2s initial load, <200ms search response)
- [ ] Skeleton loaders for all async content
- [ ] Error boundaries for graceful failure handling
- [ ] Loading states for all API interactions
- [ ] Mobile responsive testing (all breakpoints)
- [ ] Accessibility audit (keyboard nav, screen readers, ARIA labels)
- [ ] Bundle size optimization (code splitting, tree shaking)
- [ ] Railway deployment configuration
- [ ] Environment variables secured (Stripe keys, JWT secrets, etc.)
- [ ] SSL certificate verification
- [ ] CDN cache invalidation tested
- [ ] End-to-end smoke test (signup → browse → download → payment)

### Verification
- Lighthouse score >90 (Performance, Accessibility, Best Practices)
- All critical user flows work end-to-end
- No console errors in production build
- Responsive on mobile/tablet/desktop

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| TailwindCSS v4 (Replit) vs v3 (Claude Code) incompatibility | Medium | Normalize to v3 or upgrade both - test thoroughly |
| React 19 (Replit) components in React 18 project | Low | shadcn/ui works on React 18, just use v18 APIs |
| 1,888-line Home.tsx decomposition misses features | Medium | Cross-reference Replit Home.tsx against feature checklist |
| Stripe webhook handling untested | High | Steve must pair on payment testing |
| 30K video virtualization performance | Medium | react-window already in project, proven pattern |

---

## Dependencies

| Dependency | Owner | Status |
|-----------|-------|--------|
| Railway backend API | Steve | Not started |
| Stripe webhook endpoints | Steve | Not started |
| SendGrid email templates | Steve | Not started |
| BunnyCDN signed URL service | Steve | Not started |
| Wasabi S3 storage setup | Steve | Not started |
| PostgreSQL database (Railway) | Steve | Not started |
| Video catalog data import (30K videos) | Steve | Not started |

**Note:** Frontend reskin (Phases 1-4) can proceed independently. Backend wiring (Phase 5) requires Steve's services to be operational. Mock mode allows frontend testing without backend.

---

*Created: January 28, 2026*
*Strategy: UI Reskin (Council-Approved)*
