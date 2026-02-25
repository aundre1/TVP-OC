# TVP Blast Automation Report

**Date:** February 24, 2026

---

## Task 1: aoradev Reference Cleanup ✅

Searched entire `the-video-pool/` directory (excluding node_modules, .git, tvp-export).

**Files cleaned:**
| File | What Changed |
|------|-------------|
| `GITHUB_SECRETS_REFERENCE.md` | Replaced `aora-developments-projects` Vercel org ID with generic placeholder `team_xxxxxxxxxxxx` (2 occurrences) |
| `PROJECT_MAPPING.md` | Removed `aora-development/video-pool` reference |

**Post-cleanup verification:** `grep -ri "aoradev\|aora.dev\|AoRa\|aundre@aoradev"` returns **zero results**.

---

## Task 2: Elastic Email (4th Provider) ✅

**File:** `server/src/services/emailService.js`

Added:
- **Mailjet** API integration (Basic auth, v3.1 send endpoint)
- **Elastic Email** API integration (v2 email/send endpoint, form-encoded)
- New `sendViaProvider(provider, { to, subject, text, html })` function for per-recipient provider routing

**File:** `server/.env.example`
- Added `ELASTICEMAIL_API_KEY=`

### Marketing Blast Provider Chain
| Priority | Provider | Daily Limit |
|----------|----------|-------------|
| 1 | Brevo | 300 |
| 2 | Mailjet | 200 |
| 3 | SendGrid | 100 |
| 4 | Elastic Email | 100 |
| 5 | Direct SMTP | 50 |
| **Total** | | **750/day** |

→ 11,000 recipients in ~15 days

---

## Task 3: Fully Automated Blast Pipeline ✅

**File:** `server/src/services/blastDistributor.js` (NEW)

### Flow
1. Admin creates blast via `POST /api/admin/marketing/email`
2. Blast saved with status `scheduled`
3. `initializeBlast()` auto-runs:
   - Fetches recipients by segment, shuffles randomly
   - Splits into daily batches of 750
   - Assigns providers by position within each batch
   - Creates `blast_recipients` table (idempotent)
   - Inserts all assignments in bulk (chunked for large lists)
   - Sends first batch immediately
4. Returns: `{ blastId, totalRecipients, estimatedDays, dailyCapacity: 750 }`

### Daily Auto-Send
- `POST /api/internal/run-daily-blasts` — protected by `INTERNAL_API_KEY` header
- Finds all blasts with status `sending`
- Sends next unsent batch for each
- Marks blasts as `sent` when all recipients processed
- Returns: `{ blastsProcessed, totalSent, totalFailed, totalRemaining, details }`

### Rate Limiting
- 100ms delay between individual sends to avoid provider rate limits
- Each provider only receives its daily allocation per batch

---

## Task 4: Provider Config ✅

**File:** `server/src/config/emailProviders.js` (NEW)

Exports:
- `EMAIL_PROVIDERS` — full config object with limits, env keys, priorities
- `TOTAL_DAILY_CAPACITY` — computed sum (750)
- `SENDER_EMAIL` / `SENDER_NAME` — centralized sender identity
- `getAvailableProviders()` — returns only configured providers
- `getDailyAllocation()` — returns provider/count pairs for batch splitting

---

## Task 5: Rich Blast Status Dashboard ✅

**File:** `server/src/routes/marketing.js` (updated)

`GET /api/admin/marketing/history` now returns:
```json
{
  "blasts": [{
    "id": 1,
    "subject": "...",
    "segment": "all",
    "totalRecipients": 11000,
    "sent": 2250,
    "remaining": 8750,
    "dailyCapacity": 750,
    "estimatedDaysLeft": 12,
    "startedAt": "2026-02-26",
    "estimatedCompletion": "2026-03-10",
    "providerBreakdown": {
      "brevo": { "sent": 900, "failed": 2, "pending": 0 },
      "mailjet": { "sent": 600, "failed": 0, "pending": 0 },
      "sendgrid": { "sent": 300, "failed": 1, "pending": 0 },
      "elasticemail": { "sent": 300, "failed": 0, "pending": 0 },
      "direct": { "sent": 150, "failed": 0, "pending": 0 }
    },
    "status": "sending"
  }]
}
```

---

## Files Changed/Created

| File | Action |
|------|--------|
| `GITHUB_SECRETS_REFERENCE.md` | Cleaned aoradev refs |
| `PROJECT_MAPPING.md` | Cleaned aoradev refs |
| `server/.env.example` | Added ELASTICEMAIL_API_KEY |
| `server/src/config/emailProviders.js` | **Created** — provider config |
| `server/src/services/emailService.js` | Added Mailjet, Elastic Email, sendViaProvider |
| `server/src/services/blastDistributor.js` | **Created** — full blast automation |
| `server/src/routes/marketing.js` | Auto-init blasts, rich history, internal endpoint |
| `TVP-BLAST-AUTOMATION-REPORT.md` | **Created** — this report |

---

## Setup Required

1. Set environment variables:
   ```
   ELASTICEMAIL_API_KEY=your_key
   MAILJET_API_KEY=your_key
   MAILJET_SECRET_KEY=your_secret
   INTERNAL_API_KEY=your_internal_key
   ```

2. Configure CoCo cron to call daily at 9 AM ET:
   ```
   POST /api/internal/run-daily-blasts
   Header: x-api-key: <INTERNAL_API_KEY>
   ```

3. DB table `blast_recipients` is auto-created on first blast initialization.
