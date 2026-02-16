# Video Pool - Table/Grid/Tile Implementation Spec

**Author**: CoCo
**Status**: Ready to Build
**Priority**: CRITICAL PATH
**Estimated Duration**: 13 hours over 3-5 days
**Model Strategy**: Opus (architecture) → Sonnet (implementation) → Haiku (routine)

---

## EXECUTIVE SUMMARY

Transform Video Pool frontend to support **three view modes** (Table, Grid, Tile) while preserving all backend APIs and existing features. Desktop-optimized (95% audience) with mobile fallback.

**Key Constraint**: 30,000 videos = virtualization required for performance

---

## FILE STRUCTURE (FINAL)

```
src/
├── pages/
│   ├── BrowsePage.tsx              (REFACTOR: NEW browse page)
│   ├── LegacyCardView.tsx           (ARCHIVE: Current card view)
│   └── ...existing pages
│
├── components/
│   ├── Browse/
│   │   ├── BrowseTable.tsx          (NEW: Table view, 30k+ videos)
│   │   ├── BrowseGrid.tsx           (NEW: Grid view, 3-4 columns)
│   │   ├── BrowseTile.tsx           (NEW: Card/tile view)
│   │   ├── VideoRow.tsx             (NEW: Table row component)
│   │   ├── VideoGridCard.tsx        (NEW: Grid card component)
│   │   ├── VideoTile.tsx            (NEW: Tile card component)
│   │   └── ViewToggle.tsx           (NEW: Table/Grid/Tile buttons)
│   │
│   ├── Navigation/
│   │   ├── Sidebar.tsx              (REFACTOR: Slide-out drawer)
│   │   ├── GenreFilter.tsx          (NEW: Multi-select filter bar)
│   │   └── HamburgerMenu.tsx        (NEW: Mobile hamburger)
│   │
│   ├── Panels/
│   │   ├── PanelContainer.tsx       (NEW: Manager for all panels)
│   │   ├── PreviewPanel.tsx         (NEW: Audio preview/playback)
│   │   ├── DetailsPanel.tsx         (NEW: Artist/label metadata)
│   │   ├── DownloadPanel.tsx        (NEW: Quality selection)
│   │   ├── LibraryPanel.tsx         (NEW: Favorites/Playlists)
│   │   └── AdminPanel.tsx           (NEW: Metadata editing)
│   │
│   └── ...existing components
│
├── stores/
│   ├── browseStore.ts               (NEW: Filter, sort, pagination)
│   ├── panelStore.ts                (NEW: Panel open/close state)
│   ├── viewStore.ts                 (NEW: View mode preference)
│   ├── authStore.ts                 (EXISTING: Keep unchanged)
│   ├── subscriptionStore.ts         (EXISTING: Keep unchanged)
│   └── ...existing stores
│
├── hooks/
│   ├── useBrowseVideos.ts           (NEW: Fetch + filter logic)
│   ├── useVirtualization.ts         (NEW: Virtualize 30k videos)
│   ├── usePanelManager.ts           (NEW: Open/close panels)
│   └── ...existing hooks
│
├── api/
│   ├── videosApi.ts                 (REFACTOR: Add genre filter)
│   └── ...existing APIs
│
├── types/
│   ├── browse.ts                    (NEW: BrowseState, VideoFilter types)
│   └── ...existing types
│
├── styles/
│   ├── browse.module.css            (NEW: Browse-specific styles)
│   └── ...existing styles
│
└── ...

```

---

## COMPONENT SPECIFICATIONS

### 1. BrowsePage (Parent Container)
```typescript
// BrowsePage.tsx
// Orchestrates entire browse experience
// - Manages view mode, filters, panel state
// - Routes to correct view component (Table/Grid/Tile)
// - Handles responsive layout (desktop vs mobile)

Props: None (uses Zustand stores)

State Management:
- browseStore: filters, sorting, pagination
- viewStore: current view mode (table | grid | tile)
- panelStore: which panels are open
- authStore: user auth (existing)
- subscriptionStore: download limits (existing)

Layout:
[Hamburger] [View Toggle] [Genre Filter]
[────────────── Sidebar ──────────────────]
[───────────── Content Area ────────────]
└── <BrowseTable/> OR <BrowseGrid/> OR <BrowseTile/>
└── <PanelContainer /> (Preview, Details, Download, etc)

Responsive:
- Desktop (1024px+): Sidebar visible, full layout
- Tablet (768-1023px): Sidebar drawer, content full-width
- Mobile (<768px): Hamburger menu, stack vertically
```

### 2. BrowseTable Component
```typescript
// BrowseTable.tsx
// Table view using TanStack React Table + virtualization
// Columns: PLAY | PREVIEW | ARTIST | TITLE | LABEL | GENRE | BRACKET | QUALITY | VER | DATE | ACTIONS

Features:
- Sortable columns (click header)
- 30,000+ videos: Use react-window or TanStack virtual
- Row hover effects (highlight, show actions)
- Click to open PreviewPanel (right slide-in)
- Action buttons: preview, details, download, favorite, playlist

Performance:
- Virtualization: Only render visible rows (~30-50)
- Memo-ization on VideoRow to prevent re-renders
- API pagination: Load 100 videos at a time

Props:
- videos: Video[]
- isLoading: boolean
- onRowClick: (video) => void
- onPreview: (video) => void
- onDownload: (video) => void
- onFavorite: (video) => void
```

### 3. BrowseGrid Component
```typescript
// BrowseGrid.tsx
// Grid view: 3-4 columns of video cards
// Shows: Album art, Artist, Title
// Hover: Play button appears

Features:
- Responsive columns (4 on desktop, 2 on tablet, 1 on mobile)
- Album art thumbnail
- Artist + Title overlay
- Hover play button + more info
- Click card → open DetailsPanel

Performance:
- Masonry layout (Tailwind CSS Grid)
- Lazy load images
- Virtualization for 30k videos

Props:
- videos: Video[]
- isLoading: boolean
- columns: number (responsive)
- onCardClick: (video) => void
```

### 4. BrowseTile Component
```typescript
// BrowseTile.tsx (Current card view)
// Card/tile view: 2-3 columns of full cards
// Shows: Album art, Artist, Title, Genre, Duration, Actions

Features:
- Weekly Discovery Pack section
- Trending Now section
- For You section
- Scrollable, card-based layout

Props:
- videos: Video[]
- isLoading: boolean
```

### 5. GenreFilter Component
```typescript
// GenreFilter.tsx
// Multi-select genre filter bar
// Show: Pop | Dance | House | Latin | Rock | Reggae | ... | All Genres (reset)

Features:
- Toggle each genre on/off
- OR logic: Show videos matching ANY selected genre
- "All Genres" button: Clear all selections, show everything
- Persist selection to browseStore
- Visual feedback (highlight selected)
- On mobile: Dropdown/collapse

State:
- selectedGenres: Set<string>
- Update browseStore.filters.genres on change

Props:
- selectedGenres: string[]
- availableGenres: string[]
- onGenreChange: (genres: string[]) => void
```

### 6. Sidebar Component (Slide-out Drawer)
```typescript
// Sidebar.tsx
// Left slide-out drawer on mobile, fixed on desktop
// Navigation items: The Pool | Browse All | Charts | Favorites | My Sets | Playlists

Features:
- Fixed on desktop (1024px+)
- Slide-out drawer on mobile (<1024px)
- Close when item clicked (on mobile)
- Active state indicator
- Click to navigate or filter

Items:
- The Pool (main browse)
- Browse All (show all videos)
- Charts (top 100)
- Favorites (saved videos)
- My Sets (user playlists)
- Playlists (all playlists)
- Downloads (download history)

Mobile behavior:
- Hamburger menu opens/closes drawer
- Drawer slides from left
- Overlay on content (semi-transparent)
- Click item → navigate, close drawer

Props:
- isOpen: boolean
- onClose: () => void
- activeItem: string
- onItemClick: (item: string) => void
```

### 7. PanelContainer (Breakout Panels)
```typescript
// PanelContainer.tsx
// Manages all 5 breakout panels: Preview, Details, Download, Library, Admin
// Only one panel open at a time (or two side-by-side on large screens)

Features:
- Panels slide in from right side
- Click outside → close panel
- Esc key → close panel
- Smooth transitions (CSS animations)
- Store which panel is open in panelStore

Panels:
1. PreviewPanel: Audio player + waveform + metadata
2. DetailsPanel: Full artist info, label, release date, genre, etc
3. DownloadPanel: Quality selection (4K, 1080p, 720p) + pricing
4. LibraryPanel: Add to favorites, create/add to playlist
5. AdminPanel: Edit metadata, change quality, manage versions

Props:
- activePanel: 'preview' | 'details' | 'download' | 'library' | 'admin' | null
- panelData: Video object
- onClose: () => void

State:
- panelStore.activePanel
- panelStore.panelData
```

### 8. ViewToggle Component
```typescript
// ViewToggle.tsx
// Three buttons: [Table] [Grid] [Tile]
// Show which is currently selected (highlight/active state)
// Click to change view mode (updates viewStore.viewMode)

Features:
- Visual buttons with icons
- Active button highlighted (cyan color)
- Smooth transition when switching views
- Persist preference to localStorage

Props:
- currentView: 'table' | 'grid' | 'tile'
- onViewChange: (view: 'table' | 'grid' | 'tile') => void
```

---

## STATE MANAGEMENT (Zustand Stores)

### browseStore.ts
```typescript
interface BrowseState {
  // Filtering
  selectedGenres: Set<string>
  searchQuery: string
  sortBy: 'date' | 'popularity' | 'trending'
  sortOrder: 'asc' | 'desc'

  // Pagination
  page: number
  pageSize: number

  // Data
  videos: Video[]
  isLoading: boolean
  hasMore: boolean

  // Actions
  setGenres: (genres: string[]) => void
  setSearch: (query: string) => void
  setSortBy: (field: string) => void
  setPage: (page: number) => void
  fetchVideos: () => void
  resetFilters: () => void
}
```

### viewStore.ts
```typescript
interface ViewState {
  viewMode: 'table' | 'grid' | 'tile'
  setViewMode: (mode: 'table' | 'grid' | 'tile') => void
}
```

### panelStore.ts
```typescript
interface PanelState {
  activePanel: null | 'preview' | 'details' | 'download' | 'library' | 'admin'
  panelData: Video | null
  openPanel: (panel: string, data: Video) => void
  closePanel: () => void
}
```

---

## API INTEGRATION

### Existing APIs to Preserve
- ✅ Authentication (Google OAuth)
- ✅ Subscription/billing (Stripe)
- ✅ Download limits & tracking
- ✅ User library (favorites, playlists)

### New/Modified APIs
```typescript
// videosApi.ts - ADD PARAMETERS

// Get videos with filters
GET /api/videos?
  genres=pop,dance        // Multi-select
  search=query            // Search
  sortBy=date|popularity  // Sort field
  sortOrder=asc|desc      // Sort direction
  page=1                  // Pagination
  limit=100               // Items per page

// Get genres (for filter)
GET /api/genres → string[]

// Update view preference (optional, for persistence)
POST /api/user/preferences
{
  viewMode: 'table' | 'grid' | 'tile'
}
```

---

## PERFORMANCE OPTIMIZATION

### Virtualization (30,000 videos)
```typescript
// Use react-window or TanStack virtual for table/grid
// Only render visible rows/items
// Estimated: 30-50 items visible at once
// Huge performance gain vs rendering all 30,000

// Example: react-window FixedSizeList
<FixedSizeList
  height={600}
  itemCount={30000}
  itemSize={50}
  width="100%"
>
  {VideoRow}
</FixedSizeList>
```

### Image Optimization
- Lazy load album art thumbnails
- Use srcSet for responsive images
- Compress images (WebP format)

### Code Splitting
- Lazy load panels (Preview, Details, Download, etc)
- Separate bundle for browse page
- Defer admin panel loading

---

## RESPONSIVE DESIGN BREAKPOINTS

```css
/* Desktop (1024px+) */
.browse-layout {
  display: grid;
  grid-template-columns: 250px 1fr; /* Sidebar + content */
}

/* Tablet (768-1023px) */
@media (max-width: 1023px) {
  .sidebar { position: fixed; left: -250px; /* Hidden by default */ }
  .hamburger { display: block; }
}

/* Mobile (<768px) */
@media (max-width: 767px) {
  .view-toggle { flex-direction: column; }
  .genre-filter { overflow-x: auto; } /* Horizontal scroll */
  .browse-table { font-size: 12px; } /* Shrink for small screens */
}
```

---

## BUILD PHASES

### Phase 1: Setup & Architecture (2 hours)
- [ ] Create staging/table-layout-v1 branch
- [ ] Set up file structure
- [ ] Create Zustand stores (browse, view, panel)
- [ ] Create BrowsePage scaffold

### Phase 2: Core Components (4 hours)
- [ ] BrowseTable (with virtualization)
- [ ] BrowseGrid
- [ ] BrowseTile
- [ ] GenreFilter
- [ ] ViewToggle
- [ ] Sidebar refactor

### Phase 3: Breakout Panels (3 hours)
- [ ] PanelContainer
- [ ] PreviewPanel
- [ ] DetailsPanel
- [ ] DownloadPanel
- [ ] LibraryPanel
- [ ] AdminPanel (basic)

### Phase 4: API Integration (2 hours)
- [ ] Connect to video APIs
- [ ] Genre filter API calls
- [ ] Preserve auth/billing logic
- [ ] Test all user journeys

### Phase 5: Testing & Polish (2 hours)
- [ ] Test all 3 views
- [ ] Mobile responsiveness
- [ ] Performance (30k videos)
- [ ] Accessibility (keyboard nav, etc)

---

## SUCCESS CHECKLIST

- [ ] Table view fully functional with sorting
- [ ] Grid view displays 3-4 columns correctly
- [ ] Tile view matches current card layout
- [ ] All genre filters work (multi-select, OR logic)
- [ ] "All Genres" button resets filters
- [ ] Sidebar slides out/in smoothly
- [ ] All 5 panels open/close correctly
- [ ] Panels slide in from right side
- [ ] Click outside panel closes it
- [ ] Auth/billing/subscriptions unaffected
- [ ] 30k videos load without lag (virtualization works)
- [ ] Mobile responsive (<768px)
- [ ] View preference persists (localStorage)
- [ ] URL shareable with filters (optional but nice)
- [ ] <3s page load time

---

## DEPLOYMENT STRATEGY

1. Push to `staging/table-layout-v1` branch
2. Deploy to `dev.thevideopool.com` (Railway)
3. Test with real 30k videos
4. Get user feedback
5. Merge to `master` → production on `thevideopool.com`

---

_Status: Ready to Begin Build_
_Next: Phase 1 - Start coding_
