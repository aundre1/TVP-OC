# Video Pool - Replit Table Layout Migration Plan

**Status**: Architecture Planning Phase
**Priority**: CRITICAL PATH (blocks $10k/month launch)
**Model Strategy**: Opus (architecture), Sonnet (implementation), Haiku (routine tasks)

---

## OBJECTIVE

Transform React frontend from **card-based layout** → **table-based layout** (matching Replit design) while preserving:
- ✅ All existing backend API connections
- ✅ Authentication & billing logic
- ✅ Download limits & subscription management
- ✅ State management (Zustand)

---

## DESIGN ANALYSIS - REPLIT vs CURRENT

### Replit Table Design (TARGET)
```
COLUMNS: PLAY | PREVIEW | ARTIST | TITLE | LABEL | GENRE | BRACKET | QUALITY | VER | DATE | ACTIONS
SIDEBAR: The Pool | Browse All | Charts | Favorites | My Sets | Playlists
FILTERS: Genre bar (Pop, Dance, House, Latin, Rock, Reggae)
LAYOUT: Dark theme, cyan accents (#00d4ff)
```

### Current Card Design (LEGACY)
```
LAYOUT: Card-based discovery (Weekly Discovery Pack)
ISSUE: Inefficient for browsing large catalogs
POSITIVE: More visual/engaging for casual users
```

---

## CRITICAL QUESTIONS - NEED ANSWERS BEFORE BUILD

### 1. GITHUB & VERSION CONTROL
- [ ] What's your GitHub repo URL?
- [ ] Should I create: `staging/table-layout-v1` branch?
- [ ] Keep current master as fallback? (YES/NO)
- [ ] Deploy staging to separate subdomain? (e.g., `staging.thevideopool.com`?)

### 2. HOSTING & DEPLOYMENT
- [ ] Current hosting: Railway? Vercel? Custom?
- [ ] Staging environment: Same host on different branch/port?
- [ ] Can we deploy to `dev.thevideopool.com` or `v2.thevideopool.com`?
- [ ] Do you have Railway/Vercel credentials for me to use?

### 3. BREAKOUT PANELS - PRIORITY & BEHAVIOR
Which panels are critical for MVP?
- [ ] **Player Panel**: Full preview/playback with waveform?
- [ ] **Details Panel**: Artist bio, label info, metadata?
- [ ] **Download Panel**: Quality selection, pricing, subscription check?
- [ ] **User Library Panel**: Favorites, playlists, download history?
- [ ] **Admin Panel**: (if applicable) Metadata editing, quality controls?

For each panel:
- **Trigger**: Click on row → slide panel open? OR click button?
- **Behavior**: Overlay? Side-by-side? Modal?
- **Mobile**: How should panels work on mobile?

### 4. USER FLOWS - PRIORITY ORDER
Which user journey should work FIRST?
1. Browse → Find song → Preview → Download
2. Browse → Filter by genre → Discover playlists
3. User library → Favorites → Manage subscriptions
4. Search/discovery → Quality selection → Download

### 5. RESPONSIVE DESIGN
- [ ] Desktop-first (1440px+)?
- [ ] Tablet support required?
- [ ] Mobile support (table collapses to card view)?
- [ ] Or mobile gets different layout entirely?

### 6. SIDEBAR NAVIGATION BEHAVIOR
- [ ] Fixed sidebar (always visible)?
- [ ] Collapsible hamburger on mobile?
- [ ] Should "Charts" show top songs in modal or new page?
- [ ] Should "Favorites" filter table in-place or navigate?

### 7. GENRE FILTER
- [ ] Should genre filter collapse on mobile?
- [ ] Multi-select (AND logic) or single-select?
- [ ] "All Genres" should show all videos or reset?
- [ ] Remember user's last genre selection?

### 8. STATE MANAGEMENT
- [ ] Keep current Zustand stores?
- [ ] Add new store for: filterState, panelState, sidebarState?
- [ ] URL routing: Should genre filter update URL? (for sharing/bookmarking)

### 9. EXISTING APIs - DOCUMENTATION
- [ ] What's your API endpoint structure? (e.g., `/api/videos?genre=pop`)
- [ ] Current filters available?
- [ ] Pagination strategy?
- [ ] Are video quality tiers already in API response?

### 10. MOBILE-FIRST QUESTIONS
- [ ] Is the 11,000-subscriber audience mostly mobile or desktop?
- [ ] Should MVP focus on desktop table, mobile can be card-based?
- [ ] Or should both be tables?

---

## ARCHITECTURAL DECISIONS

### File Structure (Proposed)
```
src/
├── pages/
│   ├── BrowsePage.tsx          (NEW: Table-based browse)
│   ├── LegacyCardView.tsx       (KEEP: Old card layout, archive)
│   └── ...
├── components/
│   ├── BrowseTable.tsx          (NEW: Main table component)
│   ├── GenreFilter.tsx          (NEW: Genre filter bar)
│   ├── Sidebar.tsx              (REFACTOR: Update navigation)
│   ├── VideoRow.tsx             (NEW: Table row with actions)
│   ├── Panels/
│   │   ├── PreviewPanel.tsx     (NEW: Breakout panel)
│   │   ├── DetailsPanel.tsx     (NEW: Breakout panel)
│   │   ├── DownloadPanel.tsx    (NEW: Breakout panel)
│   │   └── ...
│   └── ...
├── stores/
│   ├── browseStore.ts           (NEW: Filter state, sort, pagination)
│   ├── panelStore.ts            (NEW: Which panels open/close)
│   └── ...
└── ...
```

### Component Hierarchy
```
BrowsePage
├── Sidebar (navigation, filtering)
├── GenreFilter (horizontal filter bar)
├── BrowseTable (main content)
│   └── VideoRow x N
│       └── Actions (preview, download, favorite, etc)
└── PanelContainer (manages all breakout panels)
    ├── PreviewPanel (slide-in/modal)
    ├── DetailsPanel (slide-in/modal)
    ├── DownloadPanel (slide-in/modal)
    └── ...
```

### Key Technical Decisions
1. **Table Library**: TanStack React Table (headless, lightweight)
2. **Styling**: TailwindCSS (existing)
3. **State**: Zustand (existing) + new stores for browse/panel state
4. **API Calls**: React Query (if already in use) or fetch
5. **Mobile Responsiveness**: Breakpoint at 768px (tablet) / 1024px (desktop)

---

## KNOWN CONSTRAINTS
- ✅ Don't break: Auth, Billing, Download limits, Subscriptions
- ✅ Preserve: API integrations, Stripe checkout, Google OAuth
- ✅ Keep: Mobile-responsive somewhere (card view fallback?)
- ⚠️ Unknown: Mobile user % in audience

---

## WORK PHASES

### Phase 1: Architecture & Planning (2 hours)
- [ ] Answer above questions
- [ ] Finalize file structure
- [ ] Create Figma/design spec if needed
- [ ] Set up staging branch & environment

### Phase 2: Core Components (4 hours)
- [ ] BrowseTable component with sorting
- [ ] GenreFilter component
- [ ] Sidebar navigation updates
- [ ] VideoRow component with actions

### Phase 3: Breakout Panels (3 hours)
- [ ] PreviewPanel
- [ ] DetailsPanel
- [ ] DownloadPanel
- [ ] Panel state management

### Phase 4: State Management & API Integration (2 hours)
- [ ] Connect to existing APIs
- [ ] Zustand stores for browse/filter/panel state
- [ ] Handle existing auth/billing

### Phase 5: Testing & Refinement (2 hours)
- [ ] Test all user flows
- [ ] Mobile responsiveness
- [ ] Browser compatibility
- [ ] Performance optimization

**TOTAL ESTIMATE: 13 hours over 3-5 days**

---

## DEPLOYMENT STRATEGY

1. **Create staging branch** `staging/table-layout-v1`
2. **Deploy to staging environment** (separate from production)
3. **Test with real data** (11,000 subscribers)
4. **Get user feedback**
5. **Merge to master** → production deployment

---

## SUCCESS METRICS
- ✅ All genre filters work
- ✅ Table sorts by all columns
- ✅ Panels open/close smoothly
- ✅ All existing APIs connected
- ✅ Auth/billing unaffected
- ✅ Mobile fallback works
- ✅ <3s page load time
- ✅ Zero console errors

---

---

## CLARIFICATIONS ANSWERED ✅

| Question | Answer |
|----------|--------|
| GitHub Repo | github.com/aundre1/Video-Pool |
| Staging Branch | staging/table-layout-v1 |
| Staging Domain | dev.thevideopool.com |
| Must-Have Panels | All: Preview, Details, Download, User Library, Admin |
| Panel Slide Direction | Right side slide-in |
| Primary User Journey | Browse → Filter genre → Find song → Preview → Download |
| Audience | 95% DESKTOP (30,000 videos to scroll) |
| MVP Focus | Desktop-first |
| Sidebar | Slide-out drawer from LEFT (hamburger on mobile) |
| Genre Filter | Multi-select with OR logic (show ANY selected) + "All Genres" reset |
| **View Options** | **Table + Grid + Tile (3 view modes with same sidebar/filters)** |

---

## REVISED ARCHITECTURE - VIEW TOGGLE

### View State Management
```javascript
// New in browseStore.ts
const viewMode = 'table' | 'grid' | 'tile'
// Applies globally to all sections
// User selects once, persists across app
```

### Component Rendering Logic
```
BrowsePage
├── Sidebar (fixed/slide-out drawer)
├── GenreFilter (always visible)
├── ViewToggle (Table | Grid | Tile buttons)
└── ContentRenderer
    ├── IF viewMode === 'table' → <BrowseTable />
    ├── IF viewMode === 'grid' → <BrowseGrid />
    └── IF viewMode === 'tile' → <BrowseTile />
```

### Three View Implementations
1. **Table View** (Replit design)
   - Columns: PLAY | PREVIEW | ARTIST | TITLE | LABEL | GENRE | BRACKET | QUALITY | VER | DATE | ACTIONS
   - Sortable, efficient, data-forward

2. **Grid View** (thumbnail grid)
   - 3-4 columns on desktop
   - Album art + artist + title
   - Hover to play, click for details

3. **Tile View** (card-based, current-like)
   - Visual cards with preview
   - Compact info display
   - Discovery-focused

---

_Document Status: READY FOR BUILD_
_Next Step: Begin Phase 1 (Architecture & Setup)_
