# The Video Pool — Manual Testing Guide (Mar 1, 2026)

## ✅ AUTOMATED TESTS — ALL PASS

- ✅ Backend: LIVE & responding (0.27s response time)
- ✅ Frontend: LIVE & HTML loads correctly
- ✅ Database: CONNECTED & operational
- ✅ API Endpoints: Responding (200 status)

---

## 📋 MANUAL TEST FLOW (45-60 minutes)

### Phase 1: Authentication Testing (15 min)

#### Test 1.1: Google OAuth Login
**Goal:** Verify Google sign-in works without hanging

1. Open: https://tvp-redesign-2026.vercel.app/login
2. Click "Sign in with Google"
3. **EXPECTED:** Google login modal opens
4. **TEST:** Does Google modal appear (or does it spin forever)?
   - ✅ Modal opens → Google OAuth working
   - ❌ Spins forever → `VITE_GOOGLE_CLIENT_ID` not set on Vercel
5. If modal opens:
   - Sign in with a test Google account
   - **EXPECTED:** Redirects back to dashboard
   - Check browser console: Should see JWT token in localStorage
6. **RESULT:** ✅ PASS or ❌ FAIL

#### Test 1.2: Email/Password Registration
**Goal:** Verify new user can create account

1. Back to https://tvp-redesign-2026.vercel.app/login
2. Click "Create Account" (or "Sign Up" link)
3. **EXPECTED:** Registration form appears
4. Fill in:
   - Email: `testuser+{timestamp}@example.com` (e.g., testuser+1709202000@example.com)
   - Password: `TestPassword123!`
   - Confirm Password: `TestPassword123!`
5. Click "Create Account"
6. **EXPECTED:** Redirects to dashboard
7. **RESULT:** ✅ PASS or ❌ FAIL

#### Test 1.3: Email/Password Login
**Goal:** Verify login works with created credentials

1. Log out (look for logout button in profile/menu)
2. Go back to login page
3. Click "Sign In" or similar
4. Enter email and password from Test 1.2
5. Click "Sign In"
6. **EXPECTED:** Redirects to dashboard
7. **RESULT:** ✅ PASS or ❌ FAIL

#### Test 1.4: Session Persistence
**Goal:** Verify login persists across page refreshes

1. On dashboard, press F5 (refresh page)
2. **EXPECTED:** Still logged in (NOT redirected to login)
3. Check localStorage: Should still have JWT token
4. **RESULT:** ✅ PASS or ❌ FAIL

---

### Phase 2: Core Features Testing (20 min)

#### Test 2.1: Browse Videos
**Goal:** Verify 26,000+ videos load in library

1. Navigate to dashboard or "Browse Videos"
2. **EXPECTED:** Video grid/list appears with thumbnails
3. Look for:
   - ✅ 26,000+ videos shown (or large number)
   - ✅ Thumbnails load (video covers visible)
   - ✅ Video titles, artists, durations visible
   - ✅ Page loads in < 5 seconds
4. **RESULT:** ✅ PASS or ❌ FAIL

#### Test 2.2: Search Videos
**Goal:** Verify search functionality works

1. Find search bar on dashboard
2. Type a common artist name (e.g., "Drake", "Taylor", "Weeknd")
3. Press Enter or click search
4. **EXPECTED:** Results filtered to matching videos
5. Look for:
   - ✅ Results appear quickly (< 2s)
   - ✅ Only matching videos shown
   - ✅ Result count updates
6. **RESULT:** ✅ PASS or ❌ FAIL

#### Test 2.3: Watch Video
**Goal:** Verify video player works

1. Click any video thumbnail
2. **EXPECTED:** Modal/player opens
3. Look for:
   - ✅ Video player appears (should see play button)
   - ✅ Video duration shows
   - ✅ Artist/title info visible
   - ✅ "Download" button visible
4. Try clicking play
   - ✅ Video should start playing (or show error if loading)
5. **RESULT:** ✅ PASS or ❌ FAIL

#### Test 2.4: Download Video
**Goal:** Verify download flow works

1. While video modal is open, click "Download" button
2. **EXPECTED:** Download options appear (quality selector)
3. Look for:
   - ✅ Quality options (320kbps, 128kbps, etc.)
   - ✅ Format options (MP3, etc.)
4. Select quality and click "Download"
5. **EXPECTED:** File starts downloading
6. Check:
   - ✅ Browser shows download progress
   - ✅ File appears in Downloads folder
   - ✅ File name is meaningful (artist-song.mp3)
7. **RESULT:** ✅ PASS or ❌ FAIL

#### Test 2.5: View Subscription Plans
**Goal:** Verify pricing page shows all tiers

1. Look for "Pricing", "Upgrade", or "Plans" link
2. Click to view pricing page
3. **EXPECTED:** 3 tiers visible:
   - Free: $0/month (100 downloads/month)
   - Pro: $9.99/month (unlimited downloads)
   - Elite: $19.99/month (4K downloads + bonus)
4. Look for:
   - ✅ All 3 plans visible
   - ✅ Feature list under each plan
   - ✅ "Upgrade" button for each paid plan
5. **RESULT:** ✅ PASS or ❌ FAIL

#### Test 2.6: Stripe Payment Flow (OPTIONAL)
**Goal:** Verify payment processing works

**⚠️ WARNING: This will attempt to charge a card. Use Stripe test card below.**

1. Click "Upgrade" on Pro plan
2. **EXPECTED:** Stripe modal opens
3. Fill in test card:
   - Card Number: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - Name: Any name
4. Click "Pay"
5. **EXPECTED:** Payment processes (may show "test" disclaimer)
6. **RESULT:** ✅ PASS or ❌ FAIL

#### Test 2.7: User Profile
**Goal:** Verify profile page shows user info

1. Look for "Profile", "Account", or user icon in header
2. Click to go to profile
3. **EXPECTED:** Profile page shows:
   - ✅ Email address
   - ✅ Current subscription tier
   - ✅ Upgrade/manage options (if on free)
4. **RESULT:** ✅ PASS or ❌ FAIL

---

### Phase 3: Edge Cases & Troubleshooting (10 min)

#### Test 3.1: Network Error Handling
**Goal:** Verify app handles network issues gracefully

1. Open browser DevTools (F12)
2. Go to Network tab
3. Find "Throttling" dropdown, set to "Slow 3G"
4. Refresh page
5. **EXPECTED:** App still loads (slower, but no crashes)
6. **RESULT:** ✅ PASS or ❌ FAIL

#### Test 3.2: Mobile Responsiveness (if time)
**Goal:** Verify UI works on mobile

1. Open DevTools (F12)
2. Click device toggle (mobile icon)
3. Select iPhone 12 or similar
4. Refresh page
5. **EXPECTED:** Layout adapts to mobile (no broken UI)
6. **RESULT:** ✅ PASS or ❌ FAIL

#### Test 3.3: Error Messages
**Goal:** Verify error handling is user-friendly

1. Try to login with wrong password
2. **EXPECTED:** Clear error message (not technical jargon)
3. Try to download without enough quota (on free plan)
4. **EXPECTED:** Clear message about plan limits
5. **RESULT:** ✅ PASS or ❌ FAIL

---

## 🔍 TROUBLESHOOTING

### Issue: Google OAuth spins forever
**Solution:**
1. Check if `VITE_GOOGLE_CLIENT_ID` is set on Vercel
2. If not, add: `492064280951-qh2num4j23eaq7o47itoi19dvon8pcoh.apps.googleusercontent.com`
3. Redeploy: `git push origin main`
4. Clear browser cache (Ctrl+Shift+Del) and refresh

### Issue: Videos don't load
**Solution:**
1. Check browser console (F12 → Console tab)
2. Look for error messages
3. Check if S3 bucket is accessible: Railway logs should show S3 errors
4. Verify S3_BUCKET, S3_ENDPOINT variables on Railway

### Issue: Payment doesn't work
**Solution:**
1. Check if Stripe keys are correct on Railway
2. Test with Stripe test card (4242 4242 4242 4242)
3. Check Stripe dashboard for errors/logs
4. Verify webhook URL is configured in Stripe

### Issue: Download doesn't start
**Solution:**
1. Check browser console for errors
2. Verify file size isn't too large (should be < 50MB)
3. Check if user is logged in
4. Verify S3 bucket has the video files

---

## 📊 RESULT TRACKING

| Test | Expected | Actual | Pass/Fail |
|------|----------|--------|-----------|
| Google OAuth | Modal opens | ⏳ | ⏳ |
| Email Registration | Redirects | ⏳ | ⏳ |
| Email Login | Redirects | ⏳ | ⏳ |
| Session Persist | Still logged in | ⏳ | ⏳ |
| Browse Videos | 26k+ load | ⏳ | ⏳ |
| Search | Results filter | ⏳ | ⏳ |
| Watch Video | Player opens | ⏳ | ⏳ |
| Download | File downloads | ⏳ | ⏳ |
| Pricing | 3 tiers show | ⏳ | ⏳ |
| Payment | Charge processes | ⏳ | ⏳ |
| Profile | Info shows | ⏳ | ⏳ |

---

## ✅ LAUNCH DECISION CRITERIA

**MUST PASS (Blocking):**
- [ ] Google OAuth OR Email/Password works
- [ ] Videos load and display correctly
- [ ] Download functionality works
- [ ] Payment processes (if testing)

**NICE TO PASS (Non-blocking):**
- [ ] All 3 auth methods work
- [ ] Profile page works
- [ ] Edge case handling works

**GO/NO-GO DECISION:**
- If all MUST PASS tests pass → ✅ **GO LIVE**
- If any MUST PASS test fails → 🔴 **FIX & RETEST**

---

## 📝 NOTES

Use this section to write down any issues found:

```
Issue 1: [Description]
  Status: [Investigating/Fixed]
  Notes: [Any findings]

Issue 2: [Description]
  Status: [Investigating/Fixed]
  Notes: [Any findings]
```

---

**EXPECTED TIME:** 45-60 minutes
**NEXT STEP:** Complete manual tests above and report results
**LAUNCH:** After all MUST PASS tests pass

