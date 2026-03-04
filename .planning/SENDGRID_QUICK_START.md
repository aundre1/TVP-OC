# 🚀 SendGrid Quick Start — 15 Minutes to Launch

**Status:** Ready to execute
**Time:** 15 minutes
**Cost:** FREE (your 11K emails = $0)

---

## ✅ Step 1: Create SendGrid Account (3 min)

1. Go to https://sendgrid.com/free
2. Click **Sign up for Free**
3. Enter:
   - Email: your email
   - Password: create secure password
   - Company name: The Video Pool
4. Click **Create Account**
5. Check your email → click verification link
6. ✅ Account created!

---

## ✅ Step 2: Get Your API Key (2 min)

1. After sign-up, you'll land on the dashboard
2. **Left sidebar** → Click **Settings**
3. Under Settings → Click **API Keys**
4. Click the blue **Create API Key** button
5. Give it a name: `TVP Campaign 2026`
6. Make sure **Full Access** is selected
7. Click **Create & Copy**
8. **⚠️ IMPORTANT:** Copy the full key immediately
   - Format: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Save it somewhere safe (1Password, notes, etc.)
   - You can't retrieve it again if you lose it

✅ Key saved!

---

## ✅ Step 3: Verify Your Sender Email (3 min)

1. **Left sidebar** → Click **Settings**
2. Under Settings → Click **Sender Authentication**
3. Click the blue **Verify a Sender** button
4. Fill in:
   - **From Email:** `info@thevideopool.com`
   - **From Name:** `The Video Pool`
   - **Reply To Email:** `support@thevideopool.com`
   - **Company Address:** Your company address (or generic)
5. Click **Create**
6. **Check your inbox** for verification email from SendGrid
7. Click the **Verify** link in the email
8. ✅ Sender verified!

---

## ✅ Step 4: Add API Key to Railway (2 min)

```bash
# Copy and run this command (replace SG.xxxxx with your actual key):
railway variables set SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Or if that doesn't work, use:
railway variable add SENDGRID_API_KEY SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Verify it was set:**
```bash
railway variables
```
You should see `SENDGRID_API_KEY` listed.

✅ API key configured!

---

## ✅ Step 5: Deploy Latest Code (2 min)

Your code is already ready. Just push:

```bash
cd /Users/dremacmini/Desktop/OC/the-video-pool

# The code is already changed, just push
git push

# Watch it deploy:
railway logs -f
```

**Wait for:** `Server listening on port 5000`

✅ Deployed!

---

## ✅ Step 6: Run Email Verification (3 min)

```bash
# Get your Supabase service role key
export SUPABASE_SERVICE_ROLE_KEY="eyJ..." # from Railway or vault

# Run verification
node scripts/verify-email-list.js
```

**Expect to see:**
```
✅ VALID EMAILS:           ~9,500 (90%)
🚨 INVALID EMAILS:         ~500 (5%)
⚠️  RISKY EMAILS:          ~400 (4%)

SAFE TO SEND:              9,500 emails
BOUNCE RISK:               ~5% (excellent)
```

✅ List verified!

---

## ✅ Step 7: Test Send (2 min)

```bash
# Send 1 test email
curl -X POST https://tvp-oc-production.up.railway.app/api/campaigns/send?limit=1

# Should return:
# {
#   "campaign_status": "completed",
#   "sent": 1,
#   "failed": 0,
#   "total": 1
# }

# Check your inbox within 30 seconds
# Click the unsubscribe link to test
```

✅ Test email sent!

---

## 🎬 Step 8: Send Your Campaign

### Option A: Quick Blast (4 days)
```bash
# Day 1: Send 3,000
curl -X POST https://tvp-oc-production.up.railway.app/api/campaigns/send?limit=3000

# Day 2: Send 3,000
curl -X POST https://tvp-oc-production.up.railway.app/api/campaigns/send?limit=3000

# Day 3: Send 3,000
curl -X POST https://tvp-oc-production.up.railway.app/api/campaigns/send?limit=3000

# Day 4: Send remaining
curl -X POST https://tvp-oc-production.up.railway.app/api/campaigns/send?limit=3000

# Total: All 11K sent in 4 days
```

### Option B: Careful Ramp (10 days, safer)
```bash
# Each day, send 300-500 emails
# Day 1-10: Run this command each morning
curl -X POST https://tvp-oc-production.up.railway.app/api/campaigns/send?limit=300

# Total: All 11K sent gradually (better for reputation)
```

**My recommendation:** Option B (10-day ramp) is safer for first campaign.

---

## 📊 Monitor Your Campaign

### In SendGrid Dashboard:
1. Go to https://app.sendgrid.com/
2. Click **Mail Send** → **Stats**
3. You'll see real-time:
   - Delivered count
   - Bounce count
   - Open count
   - Click count

### In Supabase:
```sql
-- Count how many have been sent
SELECT COUNT(*) FROM tvp_subscribers WHERE email_sent = true;

-- Check bounce/unsubscribe status
SELECT verification_status, COUNT(*)
FROM tvp_subscribers
GROUP BY verification_status;
```

---

## ✅ Final Checklist

- [ ] SendGrid account created
- [ ] API key copied (SG.xxxxx)
- [ ] Sender email verified (info@thevideopool.com)
- [ ] API key added to Railway
- [ ] Code deployed
- [ ] Email verification script run (report shows >90% valid)
- [ ] Test email sent & received
- [ ] Unsubscribe link tested
- [ ] Ready to send campaign

---

## 🎯 You're Ready to Send!

**Total time: 15 minutes**
**Cost: FREE**
**Expected success: 98%+ delivery**

### Send your campaign now:

```bash
# First batch (300 emails — test at scale)
curl -X POST https://tvp-oc-production.up.railway.app/api/campaigns/send?limit=300

# Wait 1 hour, monitor for bounces
# If bounce rate <2%, send next batch
# Repeat until all 11K sent
```

---

## 🚨 Troubleshooting

### Error: "SendGrid not configured"
- Check Railway: `railway variables` → verify `SENDGRID_API_KEY` exists
- Redeploy: `git push`

### Emails not received
- Check spam folder first
- Verify sender email (step 3) is actually verified in SendGrid
- Click **Sender Authentication** → should show "Verified ✓"

### High bounce rate (>5%)
- Review the `problematic-emails-{timestamp}.csv` file
- These are the risky/invalid emails
- Next campaign: suppress these addresses first

### Test email goes to spam
- Check SendGrid dashboard for authentication status
- If red X on DKIM/SPF, wait 10 minutes for DNS propagation
- Resend test

---

## 💡 Pro Tips

1. **Monitor first batch carefully**
   - Send 300 first
   - Wait 1 hour
   - Check bounce rate
   - If <2%, send next batch

2. **SendGrid dashboard**
   - Bookmark: https://app.sendgrid.com/
   - Check stats during campaign
   - Watch for spam complaints

3. **Unsubscribes are normal**
   - Expect 0.2-0.5% unsubscribe rate
   - That's healthy (clean list)
   - Next campaign, these won't be contacted

4. **Open rates**
   - Will show in SendGrid dashboard after 24h
   - Expect 15-25% for promotional emails

5. **Follow-up campaign**
   - Send to non-openers in 3 days
   - Better subject line
   - Expect 2-3% additional opens

---

## 🎉 You're All Set!

Everything is built. Everything is ready. All you need is:
1. SendGrid API key (2 min to get)
2. Set it on Railway (1 command)
3. Deploy (git push)
4. Send (1 curl command)

**Let's go send some emails!** 🚀

---

## Quick Reference

| Step | Command | Time |
|------|---------|------|
| Create account | https://sendgrid.com/free | 3 min |
| Get API key | Dashboard → Settings → API Keys | 2 min |
| Verify sender | Settings → Sender Auth → Verify | 3 min |
| Set on Railway | `railway variables set SENDGRID_API_KEY=...` | 1 min |
| Deploy | `git push` | 2 min |
| Verify emails | `node scripts/verify-email-list.js` | 3 min |
| Test | `curl -X POST .../api/campaigns/send?limit=1` | 2 min |
| **SEND** | `curl -X POST .../api/campaigns/send?limit=300` | ongoing |
| **TOTAL TIME** | **15-20 minutes to first batch** | |

---

**Ready? Let's go! 🚀**
