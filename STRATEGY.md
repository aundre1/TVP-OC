# The Video Pool — Business Strategy & 100X Scale Plan

**Business Type:** B2C Media Platform (Video Discovery & Curation)
**Current Stage:** MVP Deployed
**Target Audience:** Video enthusiasts, researchers, creators, educators
**100X Vision:** 0 → 10 million monthly views, 500K+ active users

---

## Core Business

**What It Does:**
The Video Pool discovers, curates, and recommends the highest-quality video content across the web. Users browse by topic, watch curated playlists, discover new creators, and build personal collections.

**Content Strategy:**
- Curated, not crowdsourced (quality > quantity)
- AI-assisted discovery (recommendation engine)
- Human curator review (final quality gate)
- Thematic collections (topics, creators, series)

**Revenue Model:**
- Free with ads
- Premium subscription (ad-free + features)
- Creator partnerships (featured content)

---

## 100X Scaling Roadmap

### Phase 1: Foundation (Now → Q2 2026)
- **Goal:** 100K monthly views, 5K active users
- **Focus:** Content freshness, search quality, UI polish
- **Key Metrics:** Daily active users >500, content add rate >20/day, engagement >10 min/session
- **Agents Needed:** Content freshness, search quality, engagement metrics

### Phase 2: Growth (Q2 → Q4 2026)
- **Goal:** 1M monthly views, 50K active users
- **Focus:** Recommendation engine, creator partnerships, mobile optimization
- **Key Metrics:** DAU >5K, avg session >15 min, discovery >30% via recommendations
- **Agents Needed:** All Phase 1 + CDN optimization, engagement cohort analysis

### Phase 3: Scale (Q4 2026 → Q2 2027)
- **Goal:** 5M monthly views, 250K active users
- **Focus:** Personalization, creator tools, API partnerships
- **Key Metrics:** DAU >25K, session >20 min, subscription >10% conversion
- **Agents Needed:** All Phase 2 + predictive engagement, churn prevention

### Phase 4: Platform (Q2 2027 → Q4 2027)
- **Goal:** 10M+ monthly views, 500K+ active users
- **Focus:** Creator marketplace, community features, international expansion
- **Key Metrics:** DAU >100K, MRR >$100K, creator partnerships >100
- **Agents Needed:** All Phase 3 + creator success, marketplace health

---

## Autonomous Agent System

### Primary Agent: `agent-video-pool.sh`
12 specialized commands working 24/7 to optimize content, performance, and engagement.

| Agent Command | Frequency | Owner | Purpose |
|---|---|---|---|
| **heartbeat** | Every 6h | Platform | Health check |
| **scan** | Daily 8 AM | Security | Dependency scanning |
| **build-test** | Pre-deploy | QA | Test build verification |
| **qa-announce** | Thu 9 AM | QA | Testing window open |
| **deploy-patch-tuesday** | 2nd Tue 2 AM | DevOps | Production deployment |
| **status** | On-demand | Dev | Git/build status |
| **content-fresh** | Every 2h | Content | New video discovery (ingest pipeline) |
| **search-quality** | Daily 9 AM | Product | Test search result relevance |
| **cdn-performance** | Every 30 min | Ops | Video delivery speed from CDN |
| **engagement-report** | Weekly Mon | Analytics | Views, watch time, user engagement |
| **dead-links** | Weekly Sun | Content | Find broken/expired video links |
| **staging-sync** | Daily 7 AM | Ops | Verify staging matches production |

---

## Cron Job Strategy (8 Jobs)

**Location:** `infrastructure/config/cron/video-pool-cron.yaml`

| Job | Schedule | What | Alert |
|-----|----------|------|-------|
| Heartbeat | Every 6h | System health | Any failure |
| Version Scan | Daily 8 AM EST | Dependencies + security | Any vulnerability |
| QA Announce | Thursday 9 AM EST | Testing window open | N/A |
| Patch Tuesday | 2nd Tue 2 AM EST | Production deploy | Build failure |
| CDN Performance | Every 30 min | Video delivery speed | Load time >3s |
| Content Fresh | Every 2h | New content detection | No new content >48h |
| Engagement Report | Monday 9 AM EST | Weekly analytics | Engagement drop >20% |
| Dead Links | Sunday 2 AM EST | Content quality check | Any dead link found |

---

## Culture & Operating Principles

**See:** `CULTURE.md`

Key principles:
- **Curation Excellence:** Quality beats quantity always
- **Creator-Centric:** Empower creators to own their audience
- **Discovery-First:** Recommendation > search
- **Trust & Transparency:** Clear data usage, user control

---

## Technology Stack (Current)

### Frontend
- React 18 + Vite 7
- Responsive design (mobile-first)
- Deployment: Vercel (auto-deploy)

### Backend
- Node.js 20 + Express
- Database: TBD (PostgreSQL planned)
- Caching: Redis for recommendations
- Deployment: Railway

### Infrastructure
- Staging: staging.thevideopool.com
- Production: thevideopool.com
- CDN: Vercel CDN (automatic)

---

## Key Metrics (SLAs)

| Metric | Current | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|---------|---------|---------|
| **Monthly Views** | 10K | 100K | 1M | 5M | 10M+ |
| **Active Users** | 500 | 5K | 50K | 250K | 500K+ |
| **Avg Session Duration** | 8 min | 10 min | 15 min | 20 min | 25 min |
| **Content Add Rate** | 5/day | 20/day | 50/day | 100/day | 200+/day |
| **Search Quality** | TBD | >80% relevant | >90% relevant | >95% relevant | >98% relevant |
| **Video Load Time** | 3-5s | <3s | <2s | <1.5s | <1s |
| **Uptime** | 99% | 99.5% | 99.8% | 99.95% | 99.99% |

---

## Revenue Projections (100X)

### Phase 1 (5K Users)
- Free users (80%): 4K
- Premium subscribers (15%): 750 × $4.99/mo = $3,742/mo
- Ad revenue (CPM $3): 100K views × $3/1K = $300/mo
- **MRR:** $4K

### Phase 4 (500K Users)
- Free users (75%): 375K
- Premium subscribers (20%): 100K × $4.99/mo = $499K/mo
- Ad revenue (CPM $4): 10M views × $4/1K = $40K/mo
- Creator partnerships: $10K/mo
- **MRR:** $550K+

---

## Scaling Challenges (100X)

| Challenge | Solution | Agent |
|-----------|----------|-------|
| Content freshness at scale | Automated discovery + curator approval | `content-fresh` |
| Video delivery latency | CDN optimization, video compression | `cdn-performance` |
| Search relevance degradation | ML ranking model, A/B testing | `search-quality` |
| Creator content retention | Creator tools, analytics, rewards | Manual (future) |
| User churn | Personalization, discovery, engagement | `engagement-report` |
| Licensing risk | Content audit, rights verification | `dead-links` |
| Database scale | Caching, partitioning, read replicas | Infrastructure review |

---

## Next Milestones

- **Feb 28:** Staging environment stable
- **Mar 11:** Patch Tuesday: Staging → Production promotion
- **Apr 1:** Public launch with 1,000 videos
- **May 1:** Premium subscription launch
- **Jun 30:** Phase 1 complete (5K users)

---

## See Also

- `CULTURE.md` — Operating principles
- `README.md` — Quick start + features
- `infrastructure/config/cron/video-pool-cron.yaml` — Cron jobs
- `infrastructure/scripts/agent-video-pool.sh` — Agent commands
- `memory/businesses/video-pool.md` — Current status
