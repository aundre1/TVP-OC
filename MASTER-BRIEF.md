# The Video Pool — Master Brief (Agent-Ready)

**Version:** 1.0 — February 20, 2026
**Owner:** Aundre Oldacre
**AI Partner:** CoCo (OpenClaw + Claude Code)
**Lead Developer:** Steve Kumar (CTO)
**Status:** Relaunch — Backend 85%, Frontend needs UI polish to match Replit design reference

> This is the single source of truth for The Video Pool. Any agent, sub-agent, or developer should be able to read this document and know exactly what to build, how to build it, and what the business needs.

---

## 1. What The Video Pool Is

**One sentence:** AI-powered video DJ platform with 29K+ HD music videos, personalized recommendations, and instant downloads for professional DJs.

**Tagline:** "Your next set starts here."

**Category:** B2C Subscription Platform (Video DJ Content Pool)

**The Agentic Vision:** Video Pool isn't a file browser — it's a DJ's AI curator. A DJ describes their next gig ("Saturday night 90s hip-hop set for a rooftop party, 200 people"), and the agent builds a recommended set list with the right videos, transitions, and energy flow. The agent knows the DJ's style, their crowd preferences, and what's trending.

**Domain:** thevideopool.com (owned, live)

**History:** Existing business being relaunched after 5 years dormant. Previous subscriber base: ~11,000 DJs. 29K+ HD videos in library.

---

## 2. Target Market

**Primary: Professional Video DJs**

| Segment | Description | Estimated Size |
|---------|-------------|----------------|
| Mobile DJs | Wedding, corporate, private events | 50,000+ in US |
| Club/Venue DJs | Residencies, nightclubs, bars | 25,000+ in US |
| Video Jockeys (VJs) | Dedicated video performance artists | 10,000+ globally |
| Radio/Streaming DJs | Online, radio, podcast with video needs | 15,000+ |

**Key Personas:**
- **Weekend Warrior** — Mobile DJ, 2-4 gigs/month, needs variety, price-conscious
- **Residency Pro** — Club DJ, regular gig, needs fresh content weekly, values curation
- **Old School OG** — Former subscriber who remembers TVP, loyal if we deliver

---

## 3. Pricing (LOCKED — No Changes)

### Subscription Tiers

| Tier | Price | Downloads/Month | Duration |
|------|-------|-----------------|----------|
| **Free Trial** | $0 | 2 | 6 months, then expires |
| **Monthly** | $34.99 | 200 | Month-to-month |
| **Quarterly** | $99.99 | 300 | 3-month commitment |
| **Annual** | $299.99 | 400 | 12-month commitment |

### OG 500 Relaunch Pricing
- **Coupon code:** "OG500"
- **Discount:** 30% off forever
- **Limit:** First 500 returning subscribers
- **OG Pricing:** Monthly $24.50 / Quarterly $69.99 / Annual $209.99

### Revenue Targets

| Milestone | Timeline | Target |
|-----------|----------|--------|
| OG 500 campaign | Month 1 | 500 returning subscribers |
| Month 3 | Q2 2026 | 1,000 paying → $35K MRR |
| Month 6 | Q3 2026 | 2,500 paying → $65K MRR |
| Year 1 | Q1 2027 | 5,000 paying → $125K MRR |

---

## 4. Tech Stack (PRODUCTION — Do Not Change Architecture)

### Frontend (KEEP — React 18 + Vite + Tailwind)
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS with custom design system
- **State:** Zustand
- **Queries:** TanStack React Query
- **Deployment:** Vercel (thevideopool.com)
- **Location:** `/Users/dremacmini/Desktop/OC/video-pool/`

### Backend (Steve's — Production-Ready)
- **Framework:** Node.js + Express
- **Database:** PostgreSQL (40+ tables, Drizzle ORM)
- **Auth:** JWT (Google OAuth + email)
- **Billing:** Stripe (products configured)
- **Storage:** Wasabi S3 (video files)
- **CDN:** BunnyCDN (video delivery)
- **Email:** SendGrid
- **WebSocket:** Real-time updates
- **Deployment:** Railway
- **Endpoints:** 100+ REST API endpoints

### Replit Version (DESIGN REFERENCE ONLY — Not Production)
- Next.js 14 with App Router
- shadcn/ui + Tailwind v4 + Framer Motion
- **NO backend, NO auth, NO downloads, NO persistence**
- Use ONLY as a visual reference for UI polish
- PNG screenshots in `/video-pool/` folder for comparison

---

## 5. THE CRITICAL ISSUE: Frontend UI Polish

### What Steve Has Built (Production App)
- Working auth, Stripe billing, downloads, membership tiers, database state
- Every interaction is actually wired to the backend
- ~90% visually equivalent to Replit version
- Functional drag-to-reorder, view toggles (Home only)

### What Aundre Wants (From Replit Design)
- Cleaner, more polished UI matching the Replit aesthetic
- Dark theme emphasis (light theme too bright currently)
- Smaller video tiles (half current height) for better scrolling through 30K+ videos
- Grid view cards also need to be smaller
- "For You" and "Latest" sections should be side features, not mid-browse interruptions
- User-customizable section order (checkboxes to enable/disable, drag to reorder)
- List/grid view toggle on ALL pages (not just Home — browse, search, genres, everywhere)

### The Resolution (Council-Approved Strategy)
1. **Lock production stack** (React 18 + Vite + Tailwind) — DO NOT migrate to Next.js
2. **Treat Replit as visual reference only** — use the PNG screenshots/prototype for design targets
3. **Targeted UI work** — layout, spacing, typography, component polish, dark theme
4. **Figma-style spec from Replit** — translate design into exact spacing, font sizes, colors, breakpoints
5. **Never break Steve's backend** — all UI changes must work with existing APIs

### Specific UI Fixes Needed (Priority Order)

| Fix | Priority | Notes |
|-----|----------|-------|
| Dark theme refinement (light too bright) | HIGH | Rebalance contrast, mute bright whites |
| Video tile height reduction (50% smaller) | HIGH | Critical for scrolling through 30K videos |
| Grid card size reduction | HIGH | Also too large for content density |
| List/grid toggle on ALL pages | HIGH | Currently Home only, needs Browse, Search, Genres |
| "For You" / "Latest" → sidebar toggle | MEDIUM | Customizable sections, drag to reorder |
| Section visibility checkboxes | MEDIUM | Users control which sections appear |
| Typography/spacing alignment to Replit | MEDIUM | Match the polish level |
| Genre navigation cleanup | MEDIUM | Mega menus need refinement |
| Mobile responsive pass | LOW | Desktop-first for DJs |

---

## 6. Build Status

### What's Working (Don't Touch)
| Component | Status | Owner |
|-----------|--------|-------|
| Backend API (100+ endpoints) | 85% | Steve |
| Auth (JWT + Google OAuth) | Working | Steve |
| Stripe billing (3 tiers + OG 500) | Configured | Steve |
| Database (40+ tables) | Working | Steve |
| Download system | Working | Steve |
| Video storage (Wasabi S3) | Working | Steve |
| CDN delivery (BunnyCDN) | Working | Steve |
| Email (SendGrid) | Working | Steve |
| WebSocket real-time | Working | Steve |

### What Needs Work (CoCo's Domain)
| Component | Status | Notes |
|-----------|--------|-------|
| UI polish (match Replit design) | 60% | Targeted CSS/component work |
| View toggle on all pages | 30% | Only on Home, needs everywhere |
| Section customization UI | 40% | Drag-reorder exists, needs checkboxes |
| Dark theme tuning | 50% | Too bright on light, dark needs polish |
| Tile/card size optimization | 0% | Need smaller tiles for 30K library |
| Frontend-backend integration | 50% | Integration spec exists, not started |
| AI recommendations | 0% | Future feature |
| Natural language search | 0% | Future feature |

---

## 7. Critical Path to Relaunch

### Track A: UI Polish (CoCo — Agent Team)
1. Audit Replit PNG screenshots for exact design targets
2. Reduce video tile height by 50%, reduce grid card size
3. Add list/grid toggle to Browse, Search, Genres, and all discovery views
4. Refine dark theme (mute bright whites, improve contrast)
5. Move "For You" / "Latest" to sidebar with toggle checkboxes
6. Implement section customization (enable/disable + reorder)
7. Typography and spacing pass to match Replit polish

### Track B: Frontend-Backend Integration (CoCo + Steve)
1. Follow integration spec at `docs/tvp-integration-spec.md`
2. Wire auth flow (frontend → JWT endpoints)
3. Wire video browsing (React components → API endpoints)
4. Wire download flow (UI → backend → Wasabi)
5. Wire Stripe checkout and subscription management
6. Wire user preferences and crate/playlist management
7. Test end-to-end: signup → browse → download → manage subscription

### Track C: OG 500 Relaunch Campaign (Marketing Agent)
1. Clean email list (11K → ~7-8K valid)
2. Set up sending infrastructure (Brevo + Google Workspace + Maileroo)
3. Execute 3-email win-back sequence over 7 days
4. Social media campaign: Instagram 40%, TikTok 25%, YouTube 20%
5. OG 500 landing page with countdown timer
6. Monitor signups, adjust messaging

---

## 8. Agent Skills Needed

| Skill Name | Purpose | Tools |
|------------|---------|-------|
| `tvp-frontend` | React components, Tailwind styling, view toggles | Read, Edit, Write, Bash |
| `tvp-designer` | Match Replit design, dark theme, spacing, typography | Read, Edit, Write |
| `tvp-integrator` | Wire frontend to Steve's API endpoints | Read, Edit, Write, Bash |
| `tvp-marketing` | Email campaigns, social content, OG 500 relaunch | Read, Write, WebSearch |
| `tvp-qa` | Test browsing, downloads, billing, cross-browser | Bash, Read, WebFetch |

---

## 9. Coordination With Steve

### Rules of Engagement
- **Steve owns the backend.** Do not modify anything in `server/` without his approval.
- **CoCo owns UI polish.** Steve should not be doing manual CSS work — that's what agents are for.
- **Integration is joint.** Frontend-backend wiring requires both to coordinate on API contracts.
- **Communication:** Through Aundre. Don't send messages to Steve directly unless authorized.

### Steve's Remaining Backend Work
- Content delivery optimization
- AI recommendation model (deferred)
- Performance optimization for 30K+ video queries
- Stripe webhook fine-tuning

---

## 10. Competitive Landscape

| Competitor | Price | Videos | AI Features | Weakness |
|------------|-------|--------|-------------|----------|
| SmashVision | $49.99/mo | 20K+ | None | Aging UI, no innovation |
| Xtendamix | $39.99/mo | 15K+ | None | Limited catalog, slow updates |
| BPM Supreme | $29.99/mo | Audio only + some video | Basic | Not video-focused |
| **The Video Pool** | $34.99/mo | 29K+ | Recommendations, NL search | Building |

**The Video Pool moat:** Largest video catalog + AI-native platform + 11K past subscriber base for relaunch. Heritage: Aundre pioneered video DJing for TV (BET Rap City, 106 & Park, Vibe Awards, 50 Cent's The Massacre, Nas tour, Alicia Keys BET/Sky UK launch, Kanye, Beyoncé, P. Diddy, Knicks games). The brand carries culture.

---

## 11. Key Documents Reference

| Document | Path | Purpose |
|----------|------|---------|
| This brief | `video-pool/MASTER-BRIEF.md` | Single source of truth |
| PRD | `video-pool/.planning/PRD.md` | Full product requirements |
| BRD | `video-pool/.planning/BRD.md` | Business requirements + pricing |
| Project | `video-pool/.planning/PROJECT.md` | Project definition |
| State | `video-pool/.planning/STATE.md` | Current project state |
| Roadmap | `video-pool/.planning/ROADMAP.md` | MVP launch roadmap |
| Reskin Roadmap | `video-pool/.planning/ROADMAP-RESKIN.md` | UI migration plan |
| Design Council | `video-pool/.planning/DESIGN-COUNCIL-REVIEW.md` | Expert UX review |
| Backend Spec | `video-pool/.planning/BACKEND-SPECIFICATION.md` | Database + API spec for Steve |
| API Spec | `video-pool/docs/BACKEND-API-SPEC.md` | Full REST API endpoints |
| Integration Spec | `docs/tvp-integration-spec.md` | Frontend-backend bridge document |
| Growth Strategy | `docs/tvp-growth-strategy.md` | Marketing + relaunch plan |
| OG 500 Emails | `docs/tvp-relaunch-emails.md` | Win-back email sequence |
| Stripe Setup | `docs/tvp-stripe-setup.md` | Stripe products + OG coupon |
| Email Strategy | `docs/tvp-email-sending-strategy.md` | Free-tier email sending plan |
| Technical Spec | `video-pool/TECHNICAL_SPECIFICATION.md` | UI/UX design system |
| Launch Readiness | `video-pool/LAUNCH_READINESS_REPORT.md` | 95% ready assessment |

---

## 12. Team

| Role | Person | Focus |
|------|--------|-------|
| Founder / Product | Aundre | Strategy, design direction, customer relationships |
| AI Execution Partner | CoCo | UI polish, integration, marketing, operations |
| CTO / Backend | Steve Kumar | Backend, APIs, infrastructure, Stripe |
| Video Editor | Philippines-based editor | All video edits, uploads, social media posts. AI marketing agent assists. |

---

## 13. Open Decisions

- [ ] Exact Replit design targets — need pixel-level specs from PNG comparisons
- [ ] Steve's availability for integration work
- [ ] OG 500 campaign launch date
- [ ] AI recommendation model approach (collaborative filtering vs. content-based)
- [ ] Content licensing partnerships for exclusive content
- [ ] Mobile app (React Native) — timeline?

---

## 14. The Big Opportunity

Video Pool has advantages no other business in the portfolio has:
1. **Existing customer base** — 11K past subscribers to relaunch to
2. **Revenue-ready product** — Backend is 85% done with real Stripe, auth, downloads
3. **Large content library** — 29K+ HD videos, more than any competitor
4. **Niche market** — Professional video DJs, clear target, willingness to pay
5. **Recurring revenue** — Subscription model with strong retention (DJs need content monthly)

This is the **fastest path to revenue** in the portfolio. ClipExtract needs to acquire new users. Video Pool just needs to win back old ones.

---

_The Video Pool: Your next set starts here._
_29K+ videos. AI-powered. Built for DJs who take their craft seriously._
