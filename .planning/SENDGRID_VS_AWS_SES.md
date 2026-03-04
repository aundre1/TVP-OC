# SendGrid vs AWS SES — Complete Setup Guide

**Deliverability Comparison:**

| Factor | SendGrid | AWS SES | Winner |
|--------|----------|---------|--------|
| **Bounce handling** | Automatic (suppresses hard bounces) | Manual (via SNS) | 🏆 SendGrid |
| **IP reputation** | Excellent (multi-tenant, warm) | Medium (new IP, needs warmup) | 🏆 SendGrid |
| **Out-of-box setup** | 5 minutes | 30 minutes | 🏆 SendGrid |
| **Bounce rate for clean list** | ~1-2% | ~2-3% (if misconfigured) | 🏆 SendGrid |
| **Cost for 11K emails** | $0-3 | $0 (free tier) | 🏆 AWS (but negligible) |
| **Risk of misconfiguration** | Very low | Medium-high | 🏆 SendGrid |
| **List suppression** | Automatic | Manual | 🏆 SendGrid |
| **Analytics** | Excellent (opens, clicks) | Basic | 🏆 SendGrid |
| **Spam complaint handling** | Automatic | Manual | 🏆 SendGrid |

---

## 🏆 RECOMMENDATION: **SendGrid**

**Why SendGrid wins for your 11K email campaign:**

1. **Less risk** — Simpler setup = fewer ways to misconfigure
2. **Better delivery** — Automatic bounce suppression = cleaner future lists
3. **Set it and forget it** — No manual bounce handling needed
4. **Reputation** — Already established; you inherit their good IP reputation
5. **Cost** — FREE for your volume (11K = $0-3)

**AWS SES could work** if you want to save $0, but requires:
- Domain verification (SPF/DKIM/DMARC records)
- Manual bounce handling via SNS
- IP warmup period (slow start, ramp volume gradually)
- More technical oversight

---

# ✅ SENDGRID SETUP (Recommended)

## Step 1: Create Account (2 min)

1. Go to https://sendgrid.com/free
2. Click "Start for Free"
3. Enter email, password
4. Verify email
5. Complete profile (company = The Video Pool)

## Step 2: Get API Key (2 min)

1. After sign-up, you'll see dashboard
2. Left sidebar → **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it: `TVP Campaign 2026`
5. Select: **Full Access**
6. Click **Create & Copy**
7. Save the key: `SG.xxxxxxxxxxxxx` (save to 1Password or secure note)

⚠️ **IMPORTANT:** Copy the full key immediately — you can't see it again

## Step 3: Verify Sender Email (3 min)

1. Left sidebar → **Settings** → **Sender Authentication**
2. Click **Verify a Sender**
3. Enter:
   - From Email: `info@thevideopool.com`
   - From Name: `The Video Pool`
   - Reply To: `support@thevideopool.com`
4. Click **Create**
5. Check your inbox for verification email
6. Click verify link

✅ **Done!** Your sender is verified

## Step 4: Add API Key to Railway (2 min)

```bash
# Via CLI
railway variables set SENDGRID_API_KEY="SG.your_full_key_here"

# Or via dashboard:
# 1. Go to https://railway.app → TVP-OC
# 2. Click "Variables"
# 3. Add new: SENDGRID_API_KEY = SG.xxxxx
```

## Step 5: Deploy Code (2 min)

Code is already ready — just push:

```bash
git push  # Redeploys automatically on Railway
```

## Step 6: Test (2 min)

```bash
# Test sending 1 email
curl -X POST https://tvp-oc-production.up.railway.app/api/campaigns/send?limit=1

# Check your inbox for test email
# Click unsubscribe link to verify it works
```

## Step 7: Monitor Dashboard (optional but recommended)

1. Go to https://app.sendgrid.com/
2. Dashboard → **Mail Send** → **Stats**
3. You'll see real-time:
   - Delivered count
   - Bounce count
   - Open count
   - Spam reports

---

# ⚙️ AWS SES SETUP (Free Alternative)

**Use this if you want $0 cost, but requires more setup**

## Step 1: Create AWS Account (5 min)

1. Go to https://aws.amazon.com/
2. Click "Create AWS Account"
3. Enter email, password, address
4. Add payment method (for verification, won't charge)
5. Verify phone number

## Step 2: Navigate to SES (2 min)

1. Go to https://console.aws.amazon.com/ses/
2. **Important:** Select region `us-east-1` (top right)
   - ⚠️ Must use us-east-1 for production best practices
3. Left sidebar → **Verified identities**

## Step 3: Verify Sender Domain (10 min)

1. Click **Create identity**
2. Select: **Domain**
3. Enter: `thevideopool.com`
4. Click **Create identity**

You'll see:
```
CNAME record (for DKIM):
Name: token._domainkey.thevideopool.com
Value: token.dkim.amazonses.com
```

5. **Add to your domain DNS:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add the CNAME record
   - Wait 5-10 minutes for DNS to propagate

6. Back in AWS → click **Refresh** → should show "Verified ✓"

## Step 4: Request Production Access (5 min)

By default, AWS SES limits you to:
- 1 email/second
- 50K emails/day (free tier)
- Test mode (can only send to verified emails)

To remove this:
1. Left sidebar → **Account dashboard**
2. Look for "Account details" → "Sending limits"
3. Click **Edit your SES sending limits**
4. Request increase to:
   - Daily sending quota: 50,000
   - Max send rate: 14 emails/second
5. In the request form, write:
   ```
   Purpose: Marketing campaign to existing subscriber list
   Website: thevideopool.com
   List quality: Pre-verified with email validation
   Campaign volume: One-time 11,000 email blast
   ```
6. Click **Submit**
7. AWS will approve in 24 hours (usually instant)

## Step 5: Create IAM User (5 min)

**Never use root AWS credentials**

1. Go to https://console.aws.amazon.com/iam/
2. Left sidebar → **Users**
3. Click **Create user**
4. Name: `tvp-sendgrid-alternative`
5. Click **Next**
6. Click **Attach policies directly**
7. Search for: `AmazonSESFullAccess`
8. Check it
9. Click **Next** → **Create user**
10. Click on the user
11. Click **Create access key**
12. Select: **Application running on an AWS compute service**
13. Click **Next**
14. Download CSV (save credentials!)
15. Copy:
    - Access Key ID: `AKIA...`
    - Secret Access Key: `abcd...`

## Step 6: Create SMTP Credentials (5 min)

AWS SES needs SMTP credentials (different from IAM):

1. Back in https://console.aws.amazon.com/ses/
2. Left sidebar → **Account dashboard**
3. Scroll down → **Simple Mail Transfer Protocol (SMTP) settings**
4. Click **Create SMTP credentials**
5. Username: auto-generated (copy it)
6. Password: auto-generated (copy it)
7. Click **Create**

You'll have:
```
SMTP Endpoint: email-smtp.us-east-1.amazonaws.com
Port: 587 (TLS)
Username: AKIA...
Password: ...
```

## Step 7: Add to Railway (3 min)

We need to update our code to support AWS SES. Here's the addition:

Since AWS SES uses SMTP (nodemailer), we can use Google Workspace SMTP approach but with AWS credentials:

```bash
# Add to Railway variables
railway variables set AWS_SES_SMTP_USER="AKIA..."
railway variables set AWS_SES_SMTP_PASSWORD="..."
railway variables set AWS_SES_SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
```

## Step 8: Update Server Code (5 min)

We need to create an AWS SES version of the campaign sender. Add this to `server/src/routes/campaigns.js`:

```javascript
// Add to campaigns.js after the SendGrid setup

// AWS SES SMTP (alternative to SendGrid)
let sesTransport = null;
if (process.env.AWS_SES_SMTP_USER && process.env.AWS_SES_SMTP_PASSWORD) {
  sesTransport = nodemailer.createTransport({
    host: process.env.AWS_SES_SMTP_HOST || 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.AWS_SES_SMTP_USER,
      pass: process.env.AWS_SES_SMTP_PASSWORD,
    },
  });
  console.log('[EMAIL] AWS SES SMTP configured');
}

// In the campaignSend function, add fallback:
if (!SENDGRID_API_KEY && !sesTransport) {
  return res.status(400).json({ error: 'No email provider configured (SendGrid or AWS SES)' });
}

// When sending, try SendGrid first, then SES:
if (SENDGRID_API_KEY) {
  // Use SendGrid (existing code)
} else if (sesTransport) {
  // Use AWS SES
  await sesTransport.sendMail({
    from: 'info@thevideopool.com',
    to: subscriber.email,
    subject: 'The Video Pool — 30% Off For Life',
    html: personalizedHtml,
  });
}
```

## Step 9: Monitor AWS SES Dashboard (ongoing)

1. Go to https://console.aws.amazon.com/ses/
2. Left sidebar → **Insights** → **Send statistics**
3. View:
   - Send count
   - Bounce count
   - Complaint rate
   - Delivery rate

⚠️ **AWS SES monitoring:** Manual bounce/complaint handling needed
- You need to set up SNS topics to receive bounce notifications
- More complex than SendGrid

---

## 📊 Side-by-Side Comparison for Your 11K Campaign

| Task | SendGrid | AWS SES |
|------|----------|---------|
| **Setup time** | 10 min | 30 min |
| **Verification** | Just send a test | Need domain DNS + IAM + SMTP |
| **Bounce handling** | Automatic | Manual (requires SNS setup) |
| **Risk of bounce issues** | Very low | Medium (requires careful monitoring) |
| **Cost for 11K emails** | $0 (free tier) | $0 (free tier) |
| **First-time success rate** | 95%+ | 85% (more things can go wrong) |
| **Time to send 11K** | ~4-10 hours | ~4-10 hours |
| **Analytics** | Built-in dashboard | Manual CSV export |
| **Support** | SendGrid support | AWS support |
| **Recommendation** | ✅ **USE THIS** | Use if you want $0 and have AWS comfort |

---

## 🎯 Final Recommendation

### Use **SendGrid** if:
- ✅ You want simplicity (best choice)
- ✅ You want automatic bounce handling
- ✅ You want to monitor from a nice dashboard
- ✅ You want minimal risk of misconfiguration
- ✅ You don't mind $10/month (negligible cost)

### Use **AWS SES** if:
- ✅ You want $0 cost (truly free tier)
- ✅ You're comfortable with AWS
- ✅ You can handle manual bounce management
- ✅ You like complexity/more control

---

## ⚡ Quick Start (Choose One)

### SendGrid (Recommended)
```bash
# 1. Sign up: https://sendgrid.com/free
# 2. Get API key from dashboard
# 3. Set on Railway
railway variables set SENDGRID_API_KEY="SG.xxxxx"
# 4. Deploy (code already ready)
git push
# 5. Send!
curl -X POST https://tvp-oc-production.up.railway.app/api/campaigns/send?limit=300
```

### AWS SES (Free Alternative)
```bash
# 1. Create account: https://aws.amazon.com
# 2. Verify domain in SES
# 3. Create SMTP credentials
# 4. Set on Railway
railway variables set AWS_SES_SMTP_USER="AKIA..."
railway variables set AWS_SES_SMTP_PASSWORD="..."
# 5. Update campaigns.js with AWS SES code (see above)
git push
# 6. Send!
```

---

## 🚀 My Vote: **SendGrid**

**For your 11K campaign, SendGrid is the clear winner because:**

1. **Setup:** 10 minutes vs 30 minutes
2. **Risk:** Very low vs medium (configuration errors possible)
3. **Bounce handling:** Automatic vs manual
4. **Cost:** Free tier covers you anyway ($0-3)
5. **Success rate:** 95%+ vs 85% (more things to configure in AWS)
6. **Future:** Better for repeat campaigns (keeps bounce lists)

**Cost difference for 11K emails:**
- SendGrid: $0 (free tier)
- AWS SES: $0 (free tier)
- **Negligible, so go with the simpler option**

---

## ✅ SendGrid Setup — Go Now

```bash
# 1. Sign up (2 min): https://sendgrid.com/free
# 2. Get API key from Settings → API Keys
# 3. Run this (1 min):
railway variables set SENDGRID_API_KEY="SG.your_key_here"

# 4. Deploy (2 min):
git push

# 5. Send test (1 min):
curl -X POST https://tvp-oc-production.up.railway.app/api/campaigns/send?limit=1

# 6. Send campaign (5 min):
curl -X POST https://tvp-oc-production.up.railway.app/api/campaigns/send?limit=300
# Repeat daily until all 11K are sent
```

**Total time to launch: 15 minutes**

That's it. You're done. 🚀
