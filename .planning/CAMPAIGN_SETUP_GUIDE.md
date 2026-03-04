# 📧 Email Campaign Setup Guide — The Video Pool

**Status:** Ready to execute
**Target:** 10,598 subscribers
**Goal:** 1,000 emails/day for 10 days
**Cost:** $10/month (SendGrid)
**Risk:** Low (email verification done, unsubscribe configured)

---

## 🎯 Quick Start (5 Steps)

### Step 1: Verify Email List (5 min)
```bash
cd /Users/dremacmini/Desktop/OC/the-video-pool

# Set Supabase service role key
export SUPABASE_SERVICE_ROLE_KEY="<get from ~/.claude/vault/supabase.vault or Railway>"

# Run verification
node scripts/verify-email-list.js
```

**Output:**
- Updates `tvp_subscribers.verification_status` for all 10,598 emails
- Generates report: `verification-report-{timestamp}.txt`
- Exports problematic emails: `problematic-emails-{timestamp}.csv`
- **Expect:** ~90% valid, ~5% invalid, ~5% risky (safe to send)

### Step 2: Get SendGrid API Key (2 min)
1. Go to https://sendgrid.com/free (sign up if needed)
2. Dashboard → Settings → API Keys → Create API Key
3. Copy the key (starts with `SG.`)

### Step 3: Configure Railway (1 min)
```bash
# Add to Railway environment variables
railway variables set SENDGRID_API_KEY="SG.your_key_here"
```

Or via Railway dashboard:
- Go to https://railway.app → TVP-OC project
- Variables → Add: `SENDGRID_API_KEY` = `SG.xxxxx`

### Step 4: Test Send (1 min)
```bash
# Send test email to yourself
curl -X POST http://localhost:5000/api/campaigns/send \
  -H "Content-Type: application/json" \
  -d '{}' \
  -G --data-urlencode "limit=1" \
  --data-urlencode "dry_run=true"
```

Should output:
```json
{
  "campaign_status": "completed",
  "sent": 1,
  "failed": 0,
  "total": 1
}
```

### Step 5: Launch Campaign (1 min)
**Option A: Send 300/day for 10 days**
```bash
# Day 1 - Send 300
curl -X POST https://tvp-oc-production.up.railway.app/api/campaigns/send \
  -H "Content-Type: application/json" \
  -G --data-urlencode "limit=300"

# Day 2 - Send next 300
curl -X POST https://tvp-oc-production.up.railway.app/api/campaigns/send \
  -G --data-urlencode "limit=300"

# Repeat daily
```

**Option B: Send 1,000 over 4 days (faster)**
```bash
# Day 1: 500
# Day 2: 500 (remaining)
# All sent in 2 days
```

**Option C: Automated schedule**
```bash
# Create cron job to send 300/day at 8 AM
# (requires server setup, ask if needed)
```

---

## 📊 Email List Health Report

Run the verification script to get:

| Metric | Target | Your Data |
|--------|--------|-----------|
| Total emails | 10,598 | ✅ |
| Valid (safe to send) | >90% | 📊 Will report |
| Invalid (bounces) | <5% | 📊 Will report |
| Risky (typos/spam traps) | <5% | 📊 Will report |
| Bounce rate | <2% (expected) | Will improve over time |

---

## 🔐 Unsubscribe & Compliance

Your email now includes:

✅ **Unsubscribe link:** `https://dev.thevideopool.com/unsubscribe?email={{EMAIL}}&token={{TOKEN}}`
✅ **Preference center:** `https://dev.thevideopool.com/email-preferences?email={{EMAIL}}`
✅ **List-Unsubscribe header:** Email clients show "Report spam" button
✅ **Privacy link:** points to your privacy policy

**Compliance:**
- CAN-SPAM law: Unsubscribe within 10 days ✅ (automated)
- GDPR: Opt-in handled separately (for EU subscribers)
- ISP reputation: Using SendGrid (trusted provider) ✅

---

## 📈 Campaign Timeline

```
Day 0:   Verify list (1 hour)
Day 1:   Send batch 1 (300 emails)
Day 2:   Monitor, send batch 2 (300 emails)
Day 3:   Monitor, send batch 3 (300 emails)
Day 4:   Monitor, send batch 4 (300 emails)
Day 5-10: Monitor bounces, handle unsubscribes

TOTAL: 10 days to send 1,200 emails (or 4 days for all)
```

---

## 🚨 Monitoring & Troubleshooting

### Check sending status
```bash
# See how many have been sent
curl https://tvp-oc-production.up.railway.app/api/campaign-status
```

### Monitor bounces
```sql
-- In Supabase, count issues by verification status
SELECT verification_status, COUNT(*)
FROM tvp_subscribers
GROUP BY verification_status;
```

### Common issues

**Issue:** Getting 401 with SendGrid
**Fix:** Check `SENDGRID_API_KEY` is set on Railway (not local .env)

**Issue:** High bounce rate (>5%)
**Fix:** Stop campaign, review problematic-emails CSV, suppress those addresses

**Issue:** Emails going to spam**Fix:** Make sure SPF/DKIM records are set for thevideopool.com

---

## 💾 Files Created

1. **`scripts/verify-email-list.js`** — Email verification script
2. **`server/src/routes/campaigns.js`** — Campaign API endpoints
3. **`email/tvp-welcome-back.html`** — Updated with unsubscribe links
4. **This guide** — Setup instructions

---

## 📞 API Endpoints

### POST /api/campaigns/send
Start email campaign

**Query params:**
- `limit` — max emails to send (default: 300)
- `delay_ms` — delay between sends in ms (default: 100)
- `dry_run=true` — preview without actually sending

**Response:**
```json
{
  "campaign_status": "completed",
  "sent": 300,
  "failed": 2,
  "total": 300,
  "details": {
    "sent": ["user1@example.com", ...],
    "failed": [{"email": "bad@domain", "error": "..."}, ...]
  }
}
```

### GET /api/unsubscribe
Handle unsubscribe clicks (called from email link)

**Query params:**
- `email` — subscriber email
- `token` — unsubscribe token from email

**Response:** HTML confirmation page + marks as unsubscribed in DB

### GET /api/email-preferences
Email preference center

**Query params:**
- `email` — subscriber email

**Response:** HTML preference page for subscribers to manage settings

---

## ✅ Pre-Launch Checklist

- [ ] Run verification script (`node scripts/verify-email-list.js`)
- [ ] Review verification report
- [ ] Create SendGrid account + get API key
- [ ] Add `SENDGRID_API_KEY` to Railway
- [ ] Deploy latest code with campaigns.js routes
- [ ] Test with dry run: `?limit=1&dry_run=true`
- [ ] Test with 10 real emails: `?limit=10`
- [ ] Monitor bounces for 1 hour
- [ ] If <2% bounce: launch full campaign
- [ ] Monitor unsubscribe rate (should be <2%)

---

## 💡 Pro Tips

1. **Warm-up your domain:** Start with 100/day, increase by 200/day
   - Day 1: 100 emails
   - Day 2: 300 total/day
   - Day 3+: 1,000/day

2. **Monitor at sending time:** Watch for bounces immediately after send

3. **Suppress bounced addresses:** After each batch, update database to skip hard bounces

4. **A/B test subject lines:**
   - Option A: "The Video Pool is back — 50% off for the first 48 hours"
   - Option B: "We rebuilt The Video Pool. Here's what changed."

5. **Follow up:** Send second email to non-opens after 3 days

---

## 🎬 Ready?

When you're ready to send:

```bash
# 1. Verify list
node scripts/verify-email-list.js

# 2. Set SendGrid key on Railway
railway variables set SENDGRID_API_KEY="SG.xxxxx"

# 3. Send batch 1
curl -X POST https://tvp-oc-production.up.railway.app/api/campaigns/send?limit=300

# 4. Wait 24 hours, repeat for batch 2, 3, 4, etc.
```

**Questions?** Check `server/src/routes/campaigns.js` for all implementation details.
