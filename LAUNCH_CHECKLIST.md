# The Video Pool — Launch Checklist (Mar 1, 2026)

## 🟢 INFRASTRUCTURE STATUS

### Backend & Database
- ✅ Backend: LIVE (tvp-oc-production.up.railway.app)
- ✅ Database: CONNECTED (Supabase PostgreSQL verified)
- ✅ Health check: PASSING
- ✅ Environment variables: All set on Railway
- ✅ S3 bucket: Connected (Wasabi)
- ✅ Stripe: Configured (all price IDs set)

### Frontend
- ✅ Frontend: LIVE (tvp-redesign-2026.vercel.app)
- 🟡 Google OAuth: Need to verify VITE_GOOGLE_CLIENT_ID on Vercel
- 🟡 Email/Password: Need to test
- 🟡 Features: Need to verify

---

## 🔴 CRITICAL PATH TO LAUNCH (3-4 steps)

### Step 1: Verify Google OAuth on Vercel (5 min)
1. Go to: https://vercel.com/dashboard/variables?type=env
2. Select project: tvp-redesign-2026
3. Look for: VITE_GOOGLE_CLIENT_ID
4. If NOT set, add it with value: 492064280951-qh2num4j23eaq7o47itoi19dvon8pcoh.apps.googleusercontent.com
5. Save and trigger redeploy

### Step 2: Test Full Auth Flow (10 min)
Test at: https://tvp-redesign-2026.vercel.app/login
- [ ] Google Login (should NOT spin infinitely)
- [ ] Email/Password Registration
- [ ] Email/Password Login
- [ ] Session Persistence (refresh page, should stay logged in)

### Step 3: Test Core Features (15 min)
- [ ] Browse Videos (26,000+ load)
- [ ] Search/Filter
- [ ] Watch Video (player works)
- [ ] Download Video
- [ ] Subscription Plans (Stripe payment)
- [ ] Profile/Account

### Step 4: Resolve Any Blockers (15-30 min)
- Check Railway logs for errors
- Check Vercel logs for frontend errors
- Verify all API endpoints responding

---

## 💰 REVENUE MODEL (Ready to Activate)

| Plan | Price | Features |
|------|-------|----------|
| Free | $0/mo | 100 downloads/month |
| Pro | $9.99/mo | Unlimited downloads |
| Elite | $19.99/mo | Unlimited + 4K downloads |

**Current MRR Target:** $8,500/month (300 subscribers)

---

## 📊 METRICS TO TRACK POST-LAUNCH

- [ ] Sign-up conversion rate
- [ ] Free → Paid conversion rate
- [ ] Video download volume
- [ ] Most popular videos
- [ ] Churn rate
- [ ] API response times

---

**Next Step:** Run checklist above and report back. Expected time: 50-65 minutes to full launch.
