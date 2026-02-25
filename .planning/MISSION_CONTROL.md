# Mission Control Dashboard -- Product & Technical Specification

**Version**: 1.0
**Author**: CoCo (Co-CEO / Product Architect)
**Date**: February 25, 2026
**Status**: Specification Complete -- Ready for Phase 1 Build

---

## 1. Executive Summary

Mission Control is the autonomous operations layer for The Video Pool. It replaces the existing `/admin` page -- currently a standard CRUD dashboard with 10 tabs of static data -- with a real-time, self-healing command center that monitors revenue, content health, support tickets, social presence, and platform infrastructure without constant human oversight. The goal is not to show an admin what happened; it is to surface what matters right now, act on routine decisions automatically, and present the operator with only the decisions that require human judgment.

What makes Mission Control different from a typical admin panel is its bias toward action. Every metric displayed has a threshold that triggers an automated response. Download failures don't sit in a log waiting to be noticed -- they trigger automatic presigned URL regeneration, notify the affected user, and create an internal ticket if the pattern persists. Subscriber churn risk doesn't appear as a chart to be interpreted -- it fires a re-engagement email sequence 7 days before renewal when login activity drops. Social media content doesn't require a marketing team -- the system drafts platform-specific posts from real catalog data, queues them for one-click approval, and publishes on schedule. Mission Control turns a one-person operation into something that runs like a 10-person team.

---

## 2. Design Philosophy

### Core Principles

1. **Same bloodline, different posture.** Mission Control uses the exact same TVP design system -- `#0a0a0f` backgrounds, `#00d4ff` cyan accents, Inter font, `tvp-` prefixed utility classes. But the density is higher, the typography is smaller, and the layout favors information throughput over consumer aesthetics. Think: Spotify's internal dashboards, not the Spotify player.

2. **Color is meaning.** Every color in Mission Control carries operational semantics:
   - `#00d4ff` (cyan) -- neutral/informational, links, active states
   - `#22c55e` (green) -- healthy, growing, resolved
   - `#f59e0b` (gold/amber) -- warning, attention needed, revenue metrics
   - `#ef4444` (red) -- error, critical, churn, failure
   - `tvp-text-muted` -- secondary information, timestamps, IDs

3. **Density over whitespace.** Consumer pages breathe. Operations pages pack. Use 12px body text, 8px gaps, compact table rows (36px height), and multi-column layouts that fill the viewport. Scrolling is acceptable; emptiness is not.

4. **Real-time by default.** Every metric panel polls or subscribes. Stale data is worse than no data. Minimum refresh: 30 seconds for non-critical metrics, 5 seconds for health checks, WebSocket for downloads and active sessions.

5. **Every number is a button.** Click any metric to drill into it. Click a user count to see the user list. Click a download number to see the download log. Click revenue to see the Stripe breakdown. No dead-end numbers.

### CSS Variables and Classes

```css
/* Existing TVP classes to use */
.tvp-bg-primary    { background: #0a0a0f; }
.tvp-bg-secondary  { background: #12121a; }
.tvp-border-subtle { border-color: #1e1e2e; }
.tvp-accent-cyan   { color: #00d4ff; }
.tvp-text-primary  { color: #ffffff; }
.tvp-text-secondary { color: #a0a0b0; }
.tvp-text-muted    { color: #6b6b80; }

/* New Mission Control additions */
.mc-metric-gold    { color: #f59e0b; }
.mc-status-green   { color: #22c55e; }
.mc-status-red     { color: #ef4444; }
.mc-panel          { @apply tvp-bg-secondary rounded-lg tvp-border-subtle border p-4; }
.mc-metric-card    { @apply mc-panel flex flex-col gap-1; }
.mc-compact-table  { @apply text-xs; }
.mc-compact-table tr { height: 36px; }
```

### Top-Level Layout (ASCII Wireframe)

```
+------------------------------------------------------------------+
| GLOBAL COMMAND BAR                                                |
| [Health: API* DB* S3*]  MRR: $4,200  |  Active: 47  |  DLs: 312 |
| [+ Video] [Send Blast] [Export]                     [Bell] [User] |
+------------------------------------------------------------------+
|       |                                                           |
| NAV   |  ACTIVE MODULE CONTENT AREA                               |
|       |                                                           |
| Dash  |  +------------------+  +-------------------------------+  |
| Analy |  | Real-time Panel  |  | Historical Charts             |  |
| Social|  | (compact metrics)|  | (Recharts, toggleable range)  |  |
| Suppo |  |                  |  |                               |  |
| Conten|  +------------------+  +-------------------------------+  |
| Reven |  +----------------------------------------------------+  |
| Users |  | Intelligent Alerts / Action Queue                   |  |
| Videos|  | [!] Downloads 40% below yesterday ... [Investigate] |  |
| System|  +----------------------------------------------------+  |
|       |                                                           |
+------------------------------------------------------------------+
```

Left nav: 72px wide, icon-only with tooltip labels. Collapsible. Active item has cyan left border.

---

## 3. Global Command Bar

Always-visible. Fixed to top. Height: 48px. Background: `#0a0a0f` with bottom border `tvp-border-subtle`.

### Left Section: Platform Health Pulse

Three colored dots with labels, each polling independently:

| Indicator | Source | Check | Interval | Green | Yellow | Red |
|-----------|--------|-------|----------|-------|--------|-----|
| API | `GET /health` | Response time + status | 5s | <200ms | 200-1000ms | >1s or down |
| DB | `GET /health` (includes DB ping) | Connection alive | 10s | <50ms | 50-500ms | >500ms or down |
| S3 | `HEAD` request to Wasabi bucket | Accessible | 30s | <500ms | 500-2000ms | >2s or down |

### Center Section: Live Metrics Ticker

```
MRR: $4,200  |  Active Now: 47  |  Downloads Today: 312  |  Signups Today: 8
```

Data sources:
- **MRR**: `SELECT SUM(price) FROM subscriptions WHERE status = 'active'` -- cached, refreshed every 5 minutes
- **Active Now**: Count of JWT tokens with last activity < 15 minutes (track via middleware updating `users.last_active_at`)
- **Downloads Today**: `SELECT COUNT(*) FROM download_history WHERE created_at >= CURRENT_DATE`
- **Signups Today**: `SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE`

### Right Section: Quick Actions + Notifications

- **[+ Video]** -- Opens bulk upload modal (existing)
- **[Send Blast]** -- Opens marketing compose modal (existing, route: `POST /api/admin/marketing/send`)
- **[Export]** -- Downloads current module data as CSV
- **Bell icon** -- Notification feed dropdown. Sources:
  - Failed payments (Stripe webhook `payment_intent.payment_failed`)
  - API error rate exceeding threshold
  - New support tickets
  - Download failure spikes
  - Milestone alerts (100th subscriber, 30K videos, etc.)

Alert feed stored in new table `mc_alerts`. Unread count badge on bell. Max 50 shown, paginated.

---

## 4. Module 1: Analytics Command Center

**Route**: `/admin/analytics`
**Replaces**: Existing Analytics tab (downloads/signups charts, top videos, membership distribution)

### Real-Time Panel (Left Column, 320px fixed width)

Six compact metric cards stacked vertically:

| Metric | Source | Refresh |
|--------|--------|---------|
| Downloads / min | Rolling 60s window from `download_history` | 5s poll |
| Active sessions | `users.last_active_at` < 15min ago | 10s poll |
| Revenue rate | (Today's revenue / hours elapsed) extrapolated to 24h | 60s |
| Searches / min | New endpoint: `GET /api/admin/metrics/search-rate` | 10s |
| Cache hit rate | Response header tracking or Redis `INFO stats` | 30s |
| Error rate | `mc_error_log` entries in last 5 min | 10s |

Each card: metric name (12px, `tvp-text-muted`), value (28px, bold, color-coded), delta arrow vs. yesterday.

### Historical Charts (Center, fluid width)

Built with **Recharts** (`recharts` npm package -- already React-compatible, composable, responsive).

| Chart | Type | Data Source | Toggles |
|-------|------|-------------|---------|
| MRR Trend | Area chart | `subscriptions` aggregate | 30d / 60d / 90d |
| Subscriber Growth + Churn | Dual line | `users` created_at + `subscriptions` cancelled_at | 30d / 90d / 1y |
| Downloads Heatmap | Grid heatmap | `download_history` grouped by hour + day_of_week | Last 4 weeks |
| Genre Popularity | Stacked bar | `download_history JOIN videos` by genre, monthly | 3mo / 6mo / 1y |
| Cohort Retention | Cohort table | Users grouped by signup month, activity by month | Auto |

SQL for MRR trend:
```sql
SELECT DATE_TRUNC('day', created_at) AS day,
       SUM(CASE WHEN status = 'active' THEN price ELSE 0 END) AS mrr
FROM subscriptions
GROUP BY day ORDER BY day DESC LIMIT 90;
```

SQL for downloads heatmap:
```sql
SELECT EXTRACT(DOW FROM created_at) AS day_of_week,
       EXTRACT(HOUR FROM created_at) AS hour,
       COUNT(*) AS downloads
FROM download_history
WHERE created_at >= NOW() - INTERVAL '28 days'
GROUP BY day_of_week, hour;
```

### Intelligent Alerts

Alert rules engine. Each rule: condition check (SQL or metric threshold) + action.

| Alert | Condition | Auto-Action |
|-------|-----------|-------------|
| Download drop | Downloads in last hour < 60% of same hour yesterday | Query `mc_error_log` for API errors. If errors found, surface with details. If not, mark as organic and dismiss. |
| Subscriber spike | Signups in last hour > 3x 7-day hourly average | Query `users` for referral source or UTM params. Surface traffic source. |
| Zero-result searches > 10% | `search_log` where `result_count = 0` / total > 0.1 | Aggregate zero-result queries, display as "Content gaps" with request counts. |
| Error rate spike | > 5 5xx errors in 10 minutes | Auto-clear cache (`POST /api/admin/system/cache/clear`), check DB connection, create ticket. |

New table:
```sql
CREATE TABLE mc_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- 'download_drop', 'subscriber_spike', etc.
  severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'critical'
  title TEXT NOT NULL,
  detail JSONB,
  auto_action_taken TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Module 2: Social Media Command Center

**Route**: `/admin/social`
**New module** (does not exist yet)

### Content Calendar View

7-day horizontal calendar. Each day is a column. Posts are cards within columns, color-coded:

| Content Type | Color | Tag |
|-------------|-------|-----|
| New Release | `#00d4ff` (cyan) | NEW |
| Trending Promo | `#f59e0b` (gold) | TREND |
| DJ Tip | `#8b5cf6` (purple) | TIP |
| Engagement | `#22c55e` (green) | ENGAGE |
| Milestone | `#ec4899` (pink) | MILE |

Each card shows: platform icon(s), preview text (truncated to 2 lines), scheduled time, status (draft/scheduled/published).

Drag-and-drop to reschedule (react-beautiful-dnd or dnd-kit).

### Autonomous Post Generator

**Triggers** (cron-based or event-driven):

| Trigger | Event | Frequency |
|---------|-------|-----------|
| New video added | `INSERT` on `videos` table | Per event (debounced to batch if >5 in 1 hour) |
| Weekly trending | Cron: Monday 9 AM | Weekly |
| Milestone | Subscriber count crosses 100/500/1K/5K/10K | Per event |
| Engagement prompt | Cron: Wednesday + Friday 12 PM | 2x/week |

**Templates** (actual copy, platform-ready):

**New Video Drop:**
- Twitter/X: `NEW DROP: [ARTIST] - "[TITLE]" now on The Video Pool. [GENRE] heat for your next set. thevideopool.com #DJLife #MusicVideos #[GENRE]`
- Instagram: `[ARTIST] - "[TITLE]" just landed. [GENRE] visuals ready for download. Link in bio. #DJPool #[GENRE] #MusicVideo #DJLife #VideoMixing`
- TikTok: `POV: You just found [ARTIST] - "[TITLE]" on The Video Pool before everyone else. #dj #djlife #[GENRE] #musicvideo`
- Facebook: `[ARTIST] - "[TITLE]" is now available on The Video Pool. Stream the preview or download in 1080p/4K for your next set. [LINK]`
- YouTube Shorts: `Title: [ARTIST] - [TITLE] | Preview | Description: Available now on The Video Pool. Full quality download at thevideopool.com`

**Weekly Trending:**
- Twitter/X: `This week's most downloaded on The Video Pool: 1. [ARTIST1] - [TITLE1] 2. [ARTIST2] - [TITLE2] 3. [ARTIST3] - [TITLE3] What are you spinning this weekend?`
- Instagram: `TOP 3 THIS WEEK: [LINE BREAK] 1. [ARTIST1] - "[TITLE1]" [LINE BREAK] 2. [ARTIST2] - "[TITLE2]" [LINE BREAK] 3. [ARTIST3] - "[TITLE3]" [LINE BREAK] All available now. Link in bio. #DJPool #TopCharts #WeeklyPicks`

**DJ Tip:**
- Twitter/X: `DJ tip: Mix [GENRE1] into [GENRE2] during peak hour. The energy shift hits different. Download both on The Video Pool.`
- Instagram: `Pro tip for weekend warriors: Layer your video transitions with BPM-matched tracks. The Video Pool shows BPM on every download so you never guess. #DJTips #VideoMixing`

**Engagement:**
- Twitter/X: `What genre are you opening with this weekend? [poll: Hip-Hop / EDM / Latin / R&B]`
- Instagram: `Weekend poll: Your headliner genre tonight? Drop it below. [fire emoji optional -- only if brand voice permits]`

### Approval Queue

AI drafts posts using templates + catalog data. Posts land in approval queue with status:

`DRAFTED --> APPROVED --> SCHEDULED --> PUBLISHED`

Admin sees each draft with: preview (rendered per platform), edit button, approve button, schedule picker, reject button.

### Integration Strategy

**Phase 1**: Use **Buffer API** (buffer.com/developers) for multi-platform scheduling. Single OAuth connection, supports Twitter/X, Instagram, Facebook, LinkedIn, TikTok. $6/mo for essentials plan.

**Phase 2** (if volume warrants): Direct platform APIs for richer features (polls on Twitter, carousels on Instagram).

New table:
```sql
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(20) NOT NULL, -- 'twitter', 'instagram', 'tiktok', 'facebook', 'youtube'
  content_type VARCHAR(20) NOT NULL, -- 'new_release', 'trending', 'dj_tip', 'engagement', 'milestone'
  body TEXT NOT NULL,
  media_url TEXT, -- thumbnail or preview clip URL
  status VARCHAR(20) DEFAULT 'drafted', -- 'drafted', 'approved', 'scheduled', 'published', 'failed'
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  external_post_id TEXT, -- ID from Buffer or platform
  trigger_video_id UUID REFERENCES videos(id),
  engagement_data JSONB, -- impressions, likes, shares (pulled post-publish)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Cron job: `social-post-drafter` -- runs every hour, checks triggers, generates drafts.
Cron job: `social-engagement-sync` -- runs every 6 hours, pulls engagement metrics from Buffer API.

---

## 6. Module 3: Support Automation Engine

**Route**: `/admin/support`
**Enhances**: Existing Support tab

### Email Integration

Connect `info@thevideopool.com` via IMAP polling (or Brevo inbound webhook if using Brevo transactional).

Incoming email flow:
```
Email arrives --> Brevo inbound webhook --> POST /api/admin/support/inbound
  --> AI classifier (keyword + pattern matching, no LLM needed for v1)
  --> Create ticket in support_tickets table
  --> If auto-resolvable: send response, mark resolved
  --> If not: add to priority queue, notify admin
```

### Classification Rules (v1 -- keyword-based, no AI dependency)

| Category | Keywords | Auto-Resolvable? |
|----------|----------|-----------------|
| Billing | "charge", "refund", "cancel", "subscription", "payment", "invoice" | Partial -- send status, escalate refunds |
| Download | "download", "can't download", "file", "corrupt", "broken link" | Yes -- regenerate URL |
| Content Request | "request", "do you have", "looking for", "add this" | Yes -- add to content queue |
| Technical | "error", "bug", "crash", "won't load", "blank page" | No -- create ticket |
| Account | "password", "login", "can't log in", "email", "verify" | Partial -- send reset link |
| General | (fallback) | No -- queue for human |

### Auto-Response Templates

**Billing (status check):**
```
Subject: Re: [ORIGINAL SUBJECT]

Hi [FIRST_NAME],

Thanks for reaching out about your account.

Here's your current subscription status:
- Plan: [TIER_NAME]
- Status: [active/cancelled/past_due]
- Next billing date: [DATE]
- Amount: [PRICE]

If you need to make changes to your subscription, you can do so from your
account settings at thevideopool.com/settings.

If this doesn't answer your question, reply to this email and we'll have
a team member respond within 2 hours.

-- The Video Pool Team
```

**Download Issue (auto-fix):**
```
Subject: Re: [ORIGINAL SUBJECT]

Hi [FIRST_NAME],

We noticed you may be having trouble with a download. Here's a fresh
download link for your file:

[FRESH_PRESIGNED_URL]

This link expires in 24 hours. If you continue having trouble, reply
to this email with the exact video title and we'll investigate further.

Downloads remaining on your plan: [REMAINING_COUNT]

-- The Video Pool Team
```

**Content Request (acknowledgment):**
```
Subject: Re: [ORIGINAL SUBJECT]

Hi [FIRST_NAME],

Great suggestion! We've added your request to our content queue:

"[EXTRACTED_SONG_TITLE]" by [EXTRACTED_ARTIST]

We process content requests weekly, prioritized by demand. You'll receive
an email notification when this track is available.

Current queue position: [POSITION]

-- The Video Pool Team
```

**Technical Bug (ticket created):**
```
Subject: Re: [ORIGINAL SUBJECT] [Ticket #TVP-[ID]]

Hi [FIRST_NAME],

Thanks for reporting this issue. We've created a support ticket:

Ticket: #TVP-[ID]
Category: Technical Issue
Priority: [PRIORITY based on user tier]
Expected response: [2 hours for subscribers / 24 hours for free]

Our team is investigating and will follow up directly on this thread.

-- The Video Pool Team
```

### Ticket Management UI

Inbox-style layout. Three columns:

```
+------------------+-------------------------+----------------------+
| TICKET LIST      | TICKET DETAIL           | USER CONTEXT         |
|                  |                         |                      |
| [!] #TVP-0042    | From: user@email.com    | Plan: Pro            |
|  Download issue  | Subject: Can't download | Member since: Jan 26 |
|  2 min ago       |                         | Downloads: 847       |
|                  | "I tried to download    | Last login: Today    |
| [ ] #TVP-0041    |  Drake - God's Plan..." | Support history: 2   |
|  Billing         |                         |                      |
|  15 min ago      | [Auto-response sent]    | [Reset PW]           |
|                  |                         | [Add Downloads]      |
| [ ] #TVP-0040    | --- Admin Actions ---   | [Generate Link]      |
|  Content request | [Resolve] [Escalate]    | [Refund]             |
|  1 hr ago        | [Refund] [Reply]        | [View Activity]      |
+------------------+-------------------------+----------------------+
```

One-click actions (right panel): each fires an API call and updates ticket status.

- **Resolve**: `PATCH /api/admin/support/tickets/:id { status: 'resolved' }`
- **Escalate**: `PATCH /api/admin/support/tickets/:id { priority: 'urgent' }`
- **Refund**: `POST /api/admin/billing/refund { userId, amount }` (Stripe refund)
- **Add Downloads**: `PATCH /api/admin/users/:id/downloads { add: 10 }`
- **Reset Password**: `POST /api/auth/forgot-password { email }` (existing)
- **Generate Link**: `POST /api/videos/:id/presign` (existing)

### SLA Tracking Dashboard

| Metric | Target | Display |
|--------|--------|---------|
| Avg first response (subscribers) | < 2 hours | Green/red gauge |
| Avg first response (free) | < 24 hours | Green/red gauge |
| Resolution rate | > 85% | Percentage bar |
| Auto-resolved rate | > 40% | Percentage bar |
| Open tickets | Minimize | Count with age breakdown |

Enhanced table:
```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number SERIAL,
  user_id UUID REFERENCES users(id),
  user_email TEXT NOT NULL,
  category VARCHAR(30), -- 'billing', 'download', 'content_request', 'technical', 'account', 'general'
  subject TEXT,
  body TEXT,
  priority VARCHAR(10) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'auto_responded', 'in_progress', 'resolved', 'escalated'
  auto_response_sent BOOLEAN DEFAULT FALSE,
  classification_confidence FLOAT,
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  thread JSONB DEFAULT '[]', -- array of { from, body, timestamp }
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Self-Healing Actions

Automated problem detection and resolution (no human needed for safe actions):

| Detection | Threshold | Auto-Action | Notification |
|-----------|-----------|-------------|--------------|
| Download failures | > 5 in 10 min | Regenerate presigned URLs for affected videos | Alert in Command Bar |
| API error rate | > 2% of requests in 5 min | Clear cache, log error patterns | Alert + internal ticket |
| Failed payments | > 3 same user | Send payment update email to user | Alert |
| Stripe webhook failures | Any `4xx/5xx` response | Retry with exponential backoff (3 attempts) | Alert if all retries fail |
| DB connection pool exhaustion | Active connections > 80% of max | Log slow queries, alert | Critical alert |

---

## 7. Module 4: Content Operations

**Route**: `/admin/content`
**Enhances**: Existing Videos tab + Bulk Upload

### Catalog Health Dashboard

Four status cards at top:

| Metric | Query | Action |
|--------|-------|--------|
| Missing genre | `SELECT COUNT(*) FROM videos WHERE genre IS NULL` | Click to see list, inline-edit |
| Missing BPM | `SELECT COUNT(*) FROM videos WHERE bpm IS NULL` | Click to see list, trigger `enrich-metadata.js` |
| No versions | `SELECT COUNT(*) FROM videos v LEFT JOIN video_versions vv ON v.id = vv.video_id WHERE vv.id IS NULL` | Flag for re-encode |
| Broken thumbnails | `SELECT COUNT(*) FROM videos WHERE thumbnail_url IS NOT NULL AND thumbnail_verified = false` | Queue for re-generation |

Below: sortable, filterable table of flagged videos. Inline editing for genre, BPM, year, label.

### Content Request Pipeline

```
+----------+    +-----------+    +----------+    +-----------+    +----------+
| REQUESTED| -> | SOURCING  | -> | ENCODING | -> | PUBLISHED | -> | NOTIFIED |
| (user)   |    | (admin)   |    | (system) |    | (system)  |    | (auto)   |
+----------+    +-----------+    +----------+    +-----------+    +----------+
```

Kanban board UI. Each card: song title, artist, requester count, top requester tier, date first requested.

Ranking formula: `score = request_count * tier_weight` where Freemium=1, Starter=2, Pro=3, Elite=5.

When status changes to "Published": auto-send email to all requesters:
```
Subject: Your requested video is now available!

Hi [FIRST_NAME],

Great news -- "[TITLE]" by [ARTIST] is now available on The Video Pool.

Download it here: [DIRECT_LINK]

Thanks for helping us build the best DJ video catalog.

-- The Video Pool Team
```

New table:
```sql
CREATE TABLE content_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT,
  requested_by UUID[] DEFAULT '{}', -- array of user IDs
  request_count INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'requested', -- 'requested', 'sourcing', 'encoding', 'published', 'rejected'
  video_id UUID REFERENCES videos(id), -- linked when published
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Velocity Tracking

| Metric | Display | Target |
|--------|---------|--------|
| New videos this week | Progress bar vs. target | 50-100 / week |
| Genre gap score | Bar chart: download demand % minus catalog % per genre | Balance within 10% |
| Catalog freshness | % of videos added in last 90 days | > 15% |

Genre gap analysis query:
```sql
WITH download_demand AS (
  SELECT v.genre, COUNT(*) AS dl_count
  FROM download_history dh JOIN videos v ON dh.video_id = v.id
  WHERE dh.created_at >= NOW() - INTERVAL '90 days'
  GROUP BY v.genre
),
catalog_share AS (
  SELECT genre, COUNT(*) AS vid_count FROM videos GROUP BY genre
)
SELECT d.genre,
  ROUND(d.dl_count * 100.0 / SUM(d.dl_count) OVER (), 1) AS demand_pct,
  ROUND(c.vid_count * 100.0 / SUM(c.vid_count) OVER (), 1) AS catalog_pct,
  ROUND(d.dl_count * 100.0 / SUM(d.dl_count) OVER (), 1) -
    ROUND(c.vid_count * 100.0 / SUM(c.vid_count) OVER (), 1) AS gap
FROM download_demand d JOIN catalog_share c ON d.genre = c.genre
ORDER BY gap DESC;
```

---

## 8. Module 5: Revenue Command Center

**Route**: `/admin/revenue`
**New module** (partially covered by existing Analytics)

### Live Revenue Metrics

Six metric cards in a 3x2 grid:

| Metric | Calculation | Color |
|--------|-------------|-------|
| MRR | Sum of active subscription prices | Gold |
| ARR | MRR * 12 | Gold |
| New MRR | MRR from subscriptions created this month | Green |
| Churned MRR | MRR lost from cancellations this month | Red |
| Expansion MRR | Revenue increase from tier upgrades this month | Green |
| Net MRR Change | New + Expansion - Churned | Green or Red |

### Churn Intelligence

**At-Risk Detection Query:**
```sql
SELECT u.id, u.email, u.first_name, s.tier, s.current_period_end,
  u.last_active_at,
  EXTRACT(DAY FROM s.current_period_end - NOW()) AS days_until_renewal,
  EXTRACT(DAY FROM NOW() - u.last_active_at) AS days_inactive
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE s.status = 'active'
  AND s.current_period_end <= NOW() + INTERVAL '14 days'
  AND u.last_active_at < NOW() - INTERVAL '14 days'
ORDER BY s.current_period_end ASC;
```

Display as a table with columns: User, Plan, Renewal Date, Days Inactive, Risk Level (High/Medium), Action buttons.

**Auto Re-engagement Email** (triggered 7 days before renewal for inactive users):
```
Subject: We miss you, [FIRST_NAME] -- here's what's new

Hi [FIRST_NAME],

It's been a while since your last download. Here's what you've been missing:

- [COUNT] new [TOP_GENRE] videos added this month
- Trending now: [TOP_VIDEO_TITLE] by [TOP_VIDEO_ARTIST]
- [DOWNLOADS_REMAINING] downloads still available on your plan

Your [TIER] subscription renews on [RENEWAL_DATE]. Log in and grab
something fresh for your next set:

[LOGIN_LINK]

-- The Video Pool Team
```

Cron job: `churn-prevention` -- runs daily at 8 AM, identifies at-risk users, sends re-engagement emails.

### Billing Alerts Panel

| Alert Type | Condition | Display |
|------------|-----------|---------|
| Failed payments (24h) | `payment_intent.payment_failed` events | List with retry status and user info |
| Upcoming renewals (7d) | `current_period_end BETWEEN NOW() AND NOW() + 7d` | Count + expected revenue total |
| Webhook failures | `mc_alerts WHERE type = 'stripe_webhook_failure'` | Count with retry button |

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal**: Global Command Bar + Analytics Command Center + Revenue metrics

| Task | Files | Depends On |
|------|-------|------------|
| Create Mission Control layout shell | `src/pages/AdminPage.tsx` (refactor), `src/components/admin/MissionControl/Layout.tsx`, `src/components/admin/MissionControl/CommandBar.tsx`, `src/components/admin/MissionControl/SideNav.tsx` | Nothing |
| Health check polling | `src/hooks/useHealthCheck.ts`, enhance `GET /health` to include DB + S3 ping | Nothing |
| Live metrics ticker | `src/components/admin/MissionControl/MetricsTicker.tsx`, `GET /api/admin/metrics/live` | New endpoint |
| Analytics real-time panel | `src/components/admin/MissionControl/AnalyticsRealtime.tsx` | Existing analytics endpoints |
| Historical charts (Recharts) | `src/components/admin/MissionControl/charts/MRRChart.tsx`, `DownloadsHeatmap.tsx`, `GenrePopularity.tsx`, `CohortRetention.tsx` | `npm install recharts` |
| Revenue dashboard | `src/components/admin/MissionControl/RevenueCommand.tsx` | Subscription data endpoints |
| Create `mc_alerts` table | `server/src/db/migrations/015_mission_control.sql` | Nothing |
| Alert rules engine (backend) | `server/src/services/alertEngine.js` | `mc_alerts` table |
| Notification bell UI | `src/components/admin/MissionControl/AlertBell.tsx` | Alert engine |

**New API endpoints**:
- `GET /api/admin/metrics/live` -- returns MRR, active users, downloads today, signups today
- `GET /api/admin/metrics/realtime` -- returns downloads/min, searches/min, error rate, cache stats
- `GET /api/admin/metrics/mrr-trend?days=90` -- MRR by day
- `GET /api/admin/metrics/downloads-heatmap` -- hour x day_of_week download counts
- `GET /api/admin/metrics/genre-trends?months=6` -- genre download shares over time
- `GET /api/admin/metrics/cohort-retention` -- signup cohorts with monthly activity rates
- `GET /api/admin/alerts` -- paginated alert feed
- `PATCH /api/admin/alerts/:id/acknowledge` -- mark alert read

### Phase 2: Automation (Week 3-4)

**Goal**: Support automation + Social post drafting + Content operations

| Task | Files | Depends On |
|------|-------|------------|
| Support ticket system | `server/src/db/migrations/016_support_tickets.sql`, `server/src/routes/support.js` (enhance), `server/src/services/ticketClassifier.js` | Migration |
| Inbound email webhook | `server/src/routes/support-inbound.js` (Brevo inbound parse) | Brevo config |
| Auto-response engine | `server/src/services/autoResponder.js` | Ticket classifier |
| Support UI (inbox view) | `src/components/admin/MissionControl/SupportInbox.tsx`, `TicketDetail.tsx`, `UserContext.tsx` | Support API |
| Social posts table | `server/src/db/migrations/017_social_posts.sql` | Migration |
| Post template engine | `server/src/services/socialDrafter.js` | `social_posts` table |
| Content calendar UI | `src/components/admin/MissionControl/SocialCalendar.tsx`, `PostCard.tsx`, `ApprovalQueue.tsx` | Social API |
| Content request pipeline | `server/src/db/migrations/018_content_requests.sql`, `server/src/routes/content-queue.js` (enhance) | Migration |
| Catalog health dashboard | `src/components/admin/MissionControl/CatalogHealth.tsx` | Existing video endpoints |
| Content request kanban | `src/components/admin/MissionControl/ContentKanban.tsx` | Content request API |

**New API endpoints**:
- `POST /api/admin/support/inbound` -- Brevo inbound webhook
- `GET /api/admin/support/tickets` -- paginated, filterable
- `PATCH /api/admin/support/tickets/:id` -- update status/priority
- `POST /api/admin/support/tickets/:id/reply` -- send reply email
- `GET /api/admin/social/posts` -- list posts with status filter
- `POST /api/admin/social/posts` -- create draft
- `PATCH /api/admin/social/posts/:id` -- approve/schedule/edit
- `POST /api/admin/social/posts/:id/publish` -- push to Buffer API
- `GET /api/admin/content/requests` -- list content requests
- `POST /api/admin/content/requests` -- create request (user-facing too)
- `PATCH /api/admin/content/requests/:id` -- update status
- `GET /api/admin/content/health` -- catalog health summary

### Phase 3: Intelligence (Week 5-6)

**Goal**: AI-powered drafts, anomaly detection, predictive churn

| Task | Details |
|------|---------|
| AI post drafting | Integrate Claude API (Haiku for cost efficiency) to generate post variations beyond templates. Input: video metadata + platform rules. Output: 3 draft options. |
| Anomaly detection | Statistical anomaly detection on download/revenue/error time series. Z-score method on hourly aggregates vs. 7-day rolling average. |
| Predictive churn scoring | Logistic regression on: days_inactive, download_frequency, login_frequency, tier, account_age. Score 0-100 for each active subscriber. |
| Smart content suggestions | Cross-reference Spotify Charts API / Billboard RSS with catalog. Surface "trending songs not in catalog" as content recommendations. |
| Automated A/B testing | Social posts: generate 2 variants per post, publish both, measure engagement, learn which style performs better per platform. |

### Phase 4: Continuous (Ongoing)

- Feedback loops: track which auto-responses resolve tickets vs. escalate
- Social analytics refinement: best posting times per platform
- Revenue forecasting: project next month's MRR based on trends
- Catalog intelligence: auto-detect trending genres and adjust acquisition strategy

---

## 10. Data Architecture

### New Database Tables

| Table | Purpose | Created In |
|-------|---------|------------|
| `mc_alerts` | Operational alerts from all modules | Migration 015 |
| `support_tickets` | Enhanced support ticket tracking | Migration 016 |
| `social_posts` | Social media content calendar and history | Migration 017 |
| `content_requests` | User song request pipeline | Migration 018 |
| `search_log` | Track search queries + result counts for analytics | Migration 015 |
| `mc_metrics_snapshot` | Hourly metric snapshots for trend analysis | Migration 015 |

### New Backend Services

| Service | File | Purpose |
|---------|------|---------|
| `alertEngine.js` | `server/src/services/alertEngine.js` | Threshold monitoring, alert creation, auto-actions |
| `ticketClassifier.js` | `server/src/services/ticketClassifier.js` | Keyword-based email classification |
| `autoResponder.js` | `server/src/services/autoResponder.js` | Template-based auto-reply with data injection |
| `socialDrafter.js` | `server/src/services/socialDrafter.js` | Post generation from templates + catalog data |
| `churnDetector.js` | `server/src/services/churnDetector.js` | At-risk subscriber identification + email trigger |
| `metricsCollector.js` | `server/src/services/metricsCollector.js` | Periodic metric snapshot collection |

### WebSocket Events (via Socket.IO)

| Event | Payload | Used By |
|-------|---------|---------|
| `download:new` | `{ videoId, userId, quality, timestamp }` | Real-time downloads/min counter |
| `session:active` | `{ count }` | Active sessions display |
| `alert:new` | `{ id, type, severity, title }` | Notification bell |
| `ticket:new` | `{ id, category, priority }` | Support inbox counter |

Implementation: Add `socket.io` to existing Express server. Emit events from relevant service functions. Frontend connects on admin page mount.

### Cron Jobs

| Job | Schedule | Service |
|-----|----------|---------|
| `metrics-snapshot` | Every hour | `metricsCollector.js` -- snapshot MRR, active users, downloads, errors |
| `alert-check` | Every 5 minutes | `alertEngine.js` -- run all threshold checks |
| `churn-prevention` | Daily 8 AM | `churnDetector.js` -- identify at-risk, send re-engagement |
| `social-post-drafter` | Every hour | `socialDrafter.js` -- check triggers, generate drafts |
| `social-engagement-sync` | Every 6 hours | `socialDrafter.js` -- pull engagement data from Buffer |
| `catalog-health-check` | Daily 2 AM | Check for missing metadata, broken thumbnails |
| `search-log-cleanup` | Weekly Sunday 3 AM | Archive search logs older than 90 days |

---

## 11. Component Inventory

### Global Components

| Component | File Path | Purpose | Data | Status |
|-----------|-----------|---------|------|--------|
| `MissionControlLayout` | `src/components/admin/MissionControl/Layout.tsx` | Top-level layout with command bar + side nav + content area | Auth context | Needs building |
| `CommandBar` | `src/components/admin/MissionControl/CommandBar.tsx` | Global command bar (health, metrics, actions, alerts) | Health API, metrics API, alerts API | Needs building |
| `SideNav` | `src/components/admin/MissionControl/SideNav.tsx` | 72px icon nav with module routing | React Router | Needs building |
| `AlertBell` | `src/components/admin/MissionControl/AlertBell.tsx` | Notification dropdown with unread count | `GET /api/admin/alerts` | Needs building |
| `MetricCard` | `src/components/admin/MissionControl/shared/MetricCard.tsx` | Reusable compact metric display (value, label, delta, color) | Props | Needs building |
| `StatusDot` | `src/components/admin/MissionControl/shared/StatusDot.tsx` | Color-coded health indicator dot | Props | Needs building |

### Analytics Module

| Component | File Path | Purpose | Data | Status |
|-----------|-----------|---------|------|--------|
| `AnalyticsCommand` | `src/components/admin/MissionControl/AnalyticsCommand.tsx` | Analytics module container | Composition | Needs building |
| `RealtimePanel` | `src/components/admin/MissionControl/analytics/RealtimePanel.tsx` | 6 live metric cards (downloads/min, sessions, etc.) | `GET /api/admin/metrics/realtime` | Needs building |
| `MRRChart` | `src/components/admin/MissionControl/analytics/MRRChart.tsx` | MRR area chart with period toggles | `GET /api/admin/metrics/mrr-trend` | Needs building |
| `DownloadsHeatmap` | `src/components/admin/MissionControl/analytics/DownloadsHeatmap.tsx` | Hour x day-of-week heatmap grid | `GET /api/admin/metrics/downloads-heatmap` | Needs building |
| `GenrePopularity` | `src/components/admin/MissionControl/analytics/GenrePopularity.tsx` | Stacked bar chart of genre trends | `GET /api/admin/metrics/genre-trends` | Needs building |
| `CohortRetention` | `src/components/admin/MissionControl/analytics/CohortRetention.tsx` | Cohort survival table | `GET /api/admin/metrics/cohort-retention` | Needs building |
| `IntelligentAlerts` | `src/components/admin/MissionControl/analytics/IntelligentAlerts.tsx` | Alert cards with auto-action status | `GET /api/admin/alerts?module=analytics` | Needs building |

### Social Media Module

| Component | File Path | Purpose | Data | Status |
|-----------|-----------|---------|------|--------|
| `SocialCommand` | `src/components/admin/MissionControl/SocialCommand.tsx` | Social module container | Composition | Needs building |
| `ContentCalendar` | `src/components/admin/MissionControl/social/ContentCalendar.tsx` | 7-day drag-and-drop calendar | `GET /api/admin/social/posts` | Needs building |
| `PostCard` | `src/components/admin/MissionControl/social/PostCard.tsx` | Individual post card (preview, platform, status) | Props | Needs building |
| `ApprovalQueue` | `src/components/admin/MissionControl/social/ApprovalQueue.tsx` | Draft review + approve/reject/edit flow | `GET /api/admin/social/posts?status=drafted` | Needs building |
| `PostComposer` | `src/components/admin/MissionControl/social/PostComposer.tsx` | Manual post creation with platform selection | `POST /api/admin/social/posts` | Needs building |
| `SocialAnalytics` | `src/components/admin/MissionControl/social/SocialAnalytics.tsx` | Per-platform engagement metrics | `social_posts.engagement_data` | Needs building |

### Support Module

| Component | File Path | Purpose | Data | Status |
|-----------|-----------|---------|------|--------|
| `SupportCommand` | `src/components/admin/MissionControl/SupportCommand.tsx` | Support module container | Composition | Needs building |
| `SupportInbox` | `src/components/admin/MissionControl/support/SupportInbox.tsx` | Ticket list with priority sorting | `GET /api/admin/support/tickets` | Needs building |
| `TicketDetail` | `src/components/admin/MissionControl/support/TicketDetail.tsx` | Full ticket view with thread history | `GET /api/admin/support/tickets/:id` | Needs building |
| `UserContext` | `src/components/admin/MissionControl/support/UserContext.tsx` | User sidebar (plan, history, quick actions) | `GET /api/admin/users/:id` | Needs building |
| `SLADashboard` | `src/components/admin/MissionControl/support/SLADashboard.tsx` | Response time + resolution rate gauges | Aggregated ticket data | Needs building |

### Content Operations Module

| Component | File Path | Purpose | Data | Status |
|-----------|-----------|---------|------|--------|
| `ContentCommand` | `src/components/admin/MissionControl/ContentCommand.tsx` | Content module container | Composition | Needs building |
| `CatalogHealth` | `src/components/admin/MissionControl/content/CatalogHealth.tsx` | 4 health cards + flagged video table | `GET /api/admin/content/health` | Needs building |
| `ContentKanban` | `src/components/admin/MissionControl/content/ContentKanban.tsx` | Request pipeline kanban board | `GET /api/admin/content/requests` | Needs building |
| `VelocityTracker` | `src/components/admin/MissionControl/content/VelocityTracker.tsx` | New videos/week progress + genre gap chart | Videos + downloads data | Needs building |
| `InlineVideoEditor` | `src/components/admin/MissionControl/content/InlineVideoEditor.tsx` | Edit metadata without leaving dashboard | `PATCH /api/admin/videos/:id` | Needs building |

### Revenue Module

| Component | File Path | Purpose | Data | Status |
|-----------|-----------|---------|------|--------|
| `RevenueCommand` | `src/components/admin/MissionControl/RevenueCommand.tsx` | Revenue module container | Composition | Needs building |
| `MRRBreakdown` | `src/components/admin/MissionControl/revenue/MRRBreakdown.tsx` | 6-card MRR grid (total, new, churned, expansion, net, ARR) | `GET /api/admin/metrics/mrr-breakdown` | Needs building |
| `ChurnIntelligence` | `src/components/admin/MissionControl/revenue/ChurnIntelligence.tsx` | At-risk subscriber table with actions | Churn detector query | Needs building |
| `BillingAlerts` | `src/components/admin/MissionControl/revenue/BillingAlerts.tsx` | Failed payments + upcoming renewals | Stripe data + subscriptions | Needs building |
| `RevenueChart` | `src/components/admin/MissionControl/revenue/RevenueChart.tsx` | MRR trend with new/churn/expansion breakdown | `GET /api/admin/metrics/mrr-trend` | Needs building |

### Existing Components (to Preserve/Enhance)

| Component | Current Path | Enhancement |
|-----------|-------------|-------------|
| `AdminPage` | `src/pages/AdminPage.tsx` | Refactor to use `MissionControlLayout`, preserve existing tab content as modules |
| `InsightsSummary` | `src/components/admin/InsightsSummary.tsx` | Integrate into Analytics module |
| `BulkUpload` | Existing in AdminPage | Move to Content module |
| `MarketingBlast` | Existing in AdminPage | Keep as modal, add to Command Bar quick actions |
| `UserManagement` | Existing in AdminPage | Preserve as standalone tab within SideNav |
| `VideoManagement` | Existing in AdminPage | Merge with CatalogHealth in Content module |
| `SystemHealth` | Existing in AdminPage | Merge into CommandBar health indicators + keep System tab for cache/logs |

---

## Summary

Mission Control transforms The Video Pool's admin page from a data viewer into an autonomous operations platform. The five modules -- Analytics, Social, Support, Content, and Revenue -- each combine real-time monitoring, intelligent alerting, and automated action-taking. The system is designed to scale a one-person operation by automating the repetitive (support responses, social posting, churn emails) while surfacing only the decisions that require human judgment.

Total new components: 35. Total new API endpoints: 18. Total new DB tables: 6. Total new backend services: 6. Total new cron jobs: 7.

Build time estimate: 6 weeks for Phases 1-3, with Phase 1 (foundation + analytics + revenue) delivering immediate operational value within 2 weeks.
