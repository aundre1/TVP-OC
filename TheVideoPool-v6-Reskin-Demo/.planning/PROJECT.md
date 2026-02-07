# The Video Pool

## What This Is

An AI-native professional video DJ platform with 30,000+ music videos, delivering personalized recommendations, natural language search, and premium content discovery. Built for working DJs who need to find the right video fast, build coherent sets, and stay current with new releases.

## Core Value

**Make DJs faster and better at their craft through intelligent content discovery.**

If everything else fails, the platform must let DJs search, find, and download the video they need in under 30 seconds.

## Requirements

### Validated

- ✓ Dark theme with cyan (#00d4ff) accent system — existing (v5.5 prototype)
- ✓ Video card grid/list views with quality badges — existing
- ✓ Search with autocomplete — existing
- ✓ Genre mega menu navigation — existing
- ✓ Preview modal with version selection — existing
- ✓ Set Builder panel with recommendations — existing
- ✓ Crate/playlist organization — existing
- ✓ Keyboard shortcuts — existing
- ✓ Mobile responsive design — existing
- ✓ Layout presets (Club/Prep/Custom) — existing

### Active

**Core Platform (MVP):**
- [ ] User authentication (email/password, Google OAuth)
- [ ] Subscription billing (Stripe integration)
- [ ] Download tracking and limits enforcement
- [ ] Download history with re-download capability
- [ ] Free tier (2 downloads/month for 6 months)
- [ ] Paid tier ($34.99/mo, $99.99/qtr, $299.99/yr)

**AI Features:**
- [ ] Personalized "For You" recommendations based on history
- [ ] Natural language search ("90s hip hop clean edits around 95 BPM")
- [ ] Smart Set Builder with BPM/key/genre flow suggestions
- [ ] "More Like This" similar video suggestions
- [ ] Trending and New This Week algorithmic sections

**Viral Growth:**
- [ ] Setlist/crate sharing with public links
- [ ] Non-member preview (blurred thumbnails + signup CTA)
- [ ] Shareable "DJ Mike's Wedding Set" landing pages

**Backend Systems:**
- [ ] Feature request database with AI triage
- [ ] Wishlist tracking with availability notifications
- [ ] Automated content ingestion pipeline
- [ ] Metadata verification system

### Out of Scope

- Crew/team features — individual DJ focus for v1, evaluate post-launch
- DJ software plugins (Serato, VirtualDJ) — future milestone, not MVP
- Real-time "Gig Mode" AI — future milestone after core platform proven
- Concierge onboarding — evaluate after achieving product-market fit
- 4K video support — infrastructure cost too high for launch, add when scale justifies
- Social features (following, profiles) — not aligned with user research priorities
- Mobile native apps — web-first, PWA later if demand exists

## Context

**Market Position:**
- Competing against SmashVision ($49.99/mo), Xtendamix ($35-40/mo), ERG, Promo Only
- Differentiation: AI-native experience + modern UX + value pricing ($34.99)
- Target: 1,000 paid subscribers within 90 days of launch

**Technical Foundation:**
- React 18 + TypeScript + Vite frontend (partially built)
- TailwindCSS with custom design system (v5.5 spec complete)
- 30,000+ video catalog (existing content library)
- Steve handles backend API development

**Strategic Decisions:**
- Sustainable growth model (profitable, no outside capital)
- Value leader pricing (30% below market leader)
- Free tier as trial, not permanent freemium
- Setlist sharing as primary viral mechanic

**Reference Documents:**
- [BRD.md](BRD.md) — Business requirements, market analysis, financial projections
- [PRD.md](PRD.md) — Product requirements, user stories, feature specifications
- [TECHNICAL_SPECIFICATION.md](../TECHNICAL_SPECIFICATION.md) — Design system, components, implementation details
- [ROADMAP.md](ROADMAP.md) — Phased delivery plan

## Constraints

- **Tech Stack**: React + TypeScript + Vite (already invested, non-negotiable)
- **Team Size**: 2 people (you + Steve) + AI automation
- **Content**: Must use properly licensed video content only
- **Performance**: <2s page load, <200ms search (DJ workflow demands speed)
- **Budget**: Bootstrap/sustainable — no burn rate that requires funding

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single paid tier with billing cycles | Simplicity over tier confusion; quarterly/annual for commitment | — Pending |
| $34.99 value pricing | Undercut SmashVision, win on price + AI | — Pending |
| Free tier expires after 6 months | Prevent "plan around the limit" behavior | — Pending |
| Setlist sharing as core viral mechanic | DJs share sets naturally; turn into acquisition | — Pending |
| No crew/social features | User research shows individual workflow focus | — Pending |
| DJ software integration deferred | Resource intensive, evaluate after traction | — Pending |

---
*Last updated: January 17, 2026 after comprehensive planning session with Design Council and Growth Council*
