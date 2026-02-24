# The Video Pool — Operating Culture & Standards

**Org Identity:** Media platform startup (curation-focused)
**Core Value:** Help people discover content worth their time
**Team Vibe:** Thoughtful, quality-obsessed, creator-first
**Risk Profile:** Low-to-moderate (trust > growth)

---

## Core Operating Principles

### 1. **Curation Over Crowdsourcing**
- Not every video deserves to be discovered. Most don't.
- Our curation team applies human judgment to algorithmic results.
- We'd rather have 100 great videos than 1M mediocre ones.

**Decision Rule:** If content doesn't meet quality bar, it doesn't get discovered. User trust > content quantity.

### 2. **Creator-Centric, Not User-Extractive**
- Creators built the content. They deserve fair attribution and opportunity.
- We don't manipulate creators for engagement (no artificial virality hacks).
- Creator tools are premium. We invest in creator success.

**Decision Rule:** Would a creator trust us with their audience? If not, we don't do it.

### 3. **Search + Discovery Balance**
- Users come for search (what I'm looking for).
- Users stay for discovery (what I didn't know I wanted).
- We balance both: 50% explicit, 50% algorithmic.

**Decision Rule:** Discovery features A/B tested before shipping. Engagement tracked.

### 4. **Privacy Respects Autonomy**
- We track minimal data. No behavioral tracking across sites.
- Users control what we know (watch history opt-in, not default).
- Transparent data usage. No dark patterns.

**Decision Rule:** Assume users will ask "why are you tracking this?" and have a good answer.

### 5. **Quality Gates Everywhere**
- Content quality: Curator approval required
- Technical quality: Video loads in <3 seconds
- UX quality: <2 clicks to find anything
- Search quality: >80% relevant results

**Decision Rule:** If we can't measure it, we're guessing. If we're guessing, we're slowing down.

---

## Communication Style

### Internal
- **Docs First:** Decisions documented. Not announced in chat.
- **Async by Default:** Not everything needs a meeting.
- **Clear Over Fast:** Good writing beats fast talking.
- **Evidence-Based:** "What does data say?" beats "What do I feel?"

### External (Users & Creators)
- **Honest:** "We don't have that" > "It's coming soon"
- **Helpful:** We answer creator questions, not hide.
- **Transparent:** Content selection rationale explained.

---

## Standards & Practices

### Content Curation
- **Approval Process:** Discover → Filter → Curator review → Index
- **Quality Criteria:** Clarity, authenticity, no spam, creator reputation
- **Speed:** New content appears within 24 hours of approval
- **Audit:** Weekly quality check. Remove outdated/broken links.

### Technical Standards
- **Video Quality:** 480p minimum, <5s load time, no buffering
- **Search:** Relevance >80%, faceted search for all content types
- **Mobile:** Mobile-first design. Responsive to 320px width.
- **Uptime:** 99.5% target. Degraded mode (CDN cache) if backend fails.

### Deployment
- **Patch Tuesday:** 2nd Tuesday, 2 AM EST.
- **QA Window:** Thursday 9 AM - Friday 5 PM EST (mandatory curator review).
- **Rollback:** Auto-rollback if video load time >5 seconds.
- **Staging:** Staging environment always matches production schema.

### Operations
- **Monitoring:** CDN performance every 30 minutes. Content freshness every 2 hours.
- **Alerts:** Only actionable alerts (broken links, slow CDN, zero new content).
- **On-Call:** 1 person during business hours. Respond within 30 minutes.

---

## Decision-Making Framework

### Fast Decisions (1 person)
- **What:** Bug fixes, curator approvals, UI tweaks, content removals
- **Who:** Engineer, content lead, curator
- **When:** Make it, log it, keep moving

### Medium Decisions (team alignment)
- **What:** New discovery feature, curation criteria change, pricing
- **Who:** Product + Tech + Content leads
- **When:** Doc discussion, 24-hour comment period, then execute

### Slow Decisions (need consensus)
- **What:** Creator marketplace launch, international expansion, business model pivot
- **Who:** Full team
- **When:** Deep discussion, alignment, document decision

---

## Curator Standards

### What Makes a Curator
- Eye for quality and authenticity
- Understanding of audience intent
- No financial incentives in creator promotions
- Able to say "no" to mediocre content

### Approval Process
- 3-tier quality check (relevance, authenticity, quality)
- Documented rationale for rejections
- Creator feedback (why we didn't approve)
- Monthly quality audits

### Content Guidelines
- **Avoid:** Spam, artificial engagement, manipulated content, low production quality
- **Accept:** All topics, styles, perspectives (as long as quality bar met)
- **Prioritize:** Educational, creative, niche, underrepresented creators

---

## Risk Management

### Content Risk (We're careful)
- **Misinformation:** No explicit fact-checking, but remove obviously false
- **Harmful content:** Removed (violence, hate, harassment)
- **Copyright:** Links only, no hosting. Creator responsible for licensing.

**Mitigation:** Automated detection + manual review + user reporting.

### Business Risk (We're strategic)
- **Creator churn:** Monthly surveys, engagement tracking
- **Platform dependence:** Develop own platform, don't rely on YouTube/Vimeo forever
- **Revenue concentration:** Multiple revenue streams (ads, premium, partnerships)

**Mitigation:** Creator partnerships, original content in 2-3 years.

### Technical Risk (We're prepared)
- **CDN failure:** Cache at edge, degrade gracefully
- **Database failure:** Read replicas, automated backup, recovery testing
- **Search relevance degradation:** A/B test all ranking changes, rollback if worse

**Mitigation:** SLAs with vendors, infrastructure redundancy, testing.

---

## Metrics We Care About

### User Metrics (Weekly)
- Daily active users (DAU)
- Average session duration
- Video watch-throughs (completion rate)
- User retention (day 1, week 1, month 1)
- Search vs discovery split

### Content Metrics (Weekly)
- New videos approved/day
- Video load time (p50, p95, p99)
- Dead links found
- Content freshness (days since update)

### Business Metrics (Monthly)
- Monthly active users (MAU)
- Subscription conversion rate
- Monthly recurring revenue (MRR)
- Ad revenue per view (CPM/RPM)
- Creator partnership pipeline

### Technical Metrics (Daily)
- Uptime (%)
- CDN origin hit ratio
- Search latency (ms)
- API error rate
- Database query time

---

## Hiring & Growth

### Key Hires
1. Content/Curation manager (understand what "good" means)
2. Recommendation engineer (ML/personalization)
3. Full-stack engineer (features, CDN optimization)
4. Creator success manager (partnerships, retention)
5. Growth/marketing (user acquisition)

### Culture Fit
- Opinionated about quality
- Willing to say "no" to mediocrity
- Respect for creators
- Data-driven decision making

---

## Guardrails

1. **Quality:** Every video meets curation standard
2. **Creator respect:** Fair attribution, transparent promotion
3. **User privacy:** Minimal tracking, user control
4. **Technical excellence:** <3s load time, 99.5% uptime
5. **Honesty:** No dark patterns, clear communication

---

## Our Philosophy

We're building the best place to discover content worth your time. That means:
- We curate ruthlessly
- We respect creators
- We respect users' time
- We're transparent about data
- We optimize for quality, not engagement hacks
- We deploy thoughtfully
- We listen to feedback
- We build for the long term

**Success = Users return because they trust our judgment. Creators return because we treat them fairly.**

