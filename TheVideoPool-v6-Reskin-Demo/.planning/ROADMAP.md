# The Video Pool - Roadmap

## Milestone 1: MVP Launch

Converting v5.5 HTML prototype to production-ready React application with full backend integration, AI features, and viral growth mechanics.

**Target:** Soft launch within 8-10 weeks, 1,000 paid subscribers within 90 days post-launch.

---

### Phase 1: Foundation ✅ COMPLETE

- [x] Update Tailwind config with v5.5 CSS variables
- [x] Install dependencies (react-window, dnd-kit, floating-ui, etc.)
- [x] Create CSS variables and utility classes
- [x] Set up Zustand stores (appStore, uiStore)
- [x] Create type definitions

---

### Phase 2: Core Components ✅ COMPLETE

- [x] SearchAutocomplete with debounce
- [x] GenreNav with mega menus
- [x] Toolbar with view toggle
- [x] VideoCard with quality colors
- [x] VideoList (Spotify-style)
- [x] VideoGrid

---

### Phase 3: Panels & Modals ✅ COMPLETE

- [x] SetBuilder panel with recommendations
- [x] RecentDownloadsPanel (left slide-out)
- [x] RequestPanel (song/feature requests)
- [x] PreviewModal with versions
- [x] Toast notifications (pill style)
- [x] ShortcutsPanel

---

### Phase 4: Layout & Navigation 🔄 IN PROGRESS (80%)

- [x] HeaderV2 with search and presets
- [x] LayoutPresetSelector
- [x] DraggableSections
- [ ] HomePage with all sections assembled
- [ ] react-window virtualization for 30K+ videos
- [ ] Wire all components together
- [ ] Integration testing

---

### Phase 5: Performance & Polish ⏳ PENDING

- [ ] Lazy loading for images and components
- [ ] Skeleton loaders for all async content
- [ ] Mobile optimization and testing
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance profiling (<2s load, <200ms search)
- [ ] Error boundary implementation
- [ ] Loading states for all interactions

---

### Phase 6: Backend Integration ⏳ PENDING

**Authentication:**

- [ ] User registration (email/password)
- [ ] Google OAuth integration
- [ ] Password reset flow
- [ ] Session management
- [ ] Profile management

**Subscription & Billing:**

- [ ] Stripe integration
- [ ] Subscription tiers ($34.99/mo, $99.99/qtr, $299.99/yr)
- [ ] Free tier (2 downloads/month, 6-month expiration)
- [ ] Billing portal and invoices
- [ ] Payment failure handling and dunning

**Downloads:**

- [ ] Download tracking and limits enforcement
- [ ] Download history with re-download capability
- [ ] Download counter display
- [ ] CDN integration for video delivery

**Content API:**

- [ ] Video catalog API endpoints
- [ ] Search API with filters
- [ ] Metadata management
- [ ] Version management (clean/explicit/intro/outro)

---

### Phase 7: AI Features ⏳ PENDING

**Recommendations:**

- [ ] "For You" personalized recommendations
- [ ] "More Like This" similar videos
- [ ] Trending algorithm (download velocity)
- [ ] New This Week feed

**Smart Search:**

- [ ] Natural language search processing
- [ ] Query interpretation and display
- [ ] Search history and suggestions

**Set Builder Intelligence:**

- [ ] BPM/key compatibility suggestions
- [ ] Genre flow recommendations
- [ ] Energy curve optimization

---

### Phase 8: Viral Features ⏳ PENDING

**Setlist Sharing:**

- [ ] Public crate/setlist links
- [ ] Blurred thumbnail preview for non-members
- [ ] Signup CTA on shared pages
- [ ] Share analytics tracking

**Crate Organization:**

- [ ] Crate creation and management
- [ ] Add videos to crates (pre-download)
- [ ] Bulk download from crate
- [ ] Drag-and-drop reordering

---

### Phase 9: Testing & Launch ⏳ PENDING

**Testing:**

- [ ] Component unit tests
- [ ] Integration tests
- [ ] E2E tests (critical flows)
- [ ] Performance testing
- [ ] Security audit

**Launch Prep:**

- [ ] Production environment setup
- [ ] Monitoring and alerting
- [ ] Support documentation
- [ ] Beta user onboarding
- [ ] Bug fixes from beta feedback

**Go Live:**

- [ ] Soft launch (100-200 beta users)
- [ ] Iterate on feedback
- [ ] Full public launch

---

## Milestone 2: Growth & Optimization (Future)

Post-launch improvements based on user feedback and metrics.

### Planned Phases

- Analytics and reporting dashboard
- A/B testing infrastructure
- Referral program
- Email automation (welcome, trial ending, re-engagement)
- Content request fulfillment pipeline
- Advanced AI recommendations

---

## Milestone 3: Platform Expansion (Future)

Expanding features and integrations.

### Planned Phases

- DJ software integrations (Serato, VirtualDJ, Rekordbox)
- Mobile PWA optimization
- Exclusive content partnerships
- Advanced Set Builder (event-based packs)
- "Gig Mode" real-time AI assistant
- 4K video support

---

## Reference Documents

- [PROJECT.md](PROJECT.md) - Project vision and requirements
- [BRD.md](BRD.md) - Business requirements and market analysis
- [PRD.md](PRD.md) - Product requirements and user stories
- [STATE.md](STATE.md) - Current project state
- [TECHNICAL_SPECIFICATION.md](../TECHNICAL_SPECIFICATION.md) - Design system

---

*Last updated: January 17, 2026*
