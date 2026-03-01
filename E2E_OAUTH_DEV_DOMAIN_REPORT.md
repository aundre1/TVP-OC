# E2E OAuth Test Report — dev.thevideopool.com
**Date:** 2026-02-28
**Tester:** CoCo (E2E Runner)
**Target URL:** https://dev.thevideopool.com/login
**Test File:** e2e/google-oauth-dev-domain.spec.ts
**Run Time:** 8.8 seconds (5 tests, 5 workers)

---

## Summary Verdict: FAIL — redirect_uri_mismatch IS present on dev.thevideopool.com

Despite `dev.thevideopool.com` being listed as an authorized JavaScript origin in Google Cloud Console, the OAuth popup returns **Error 400: redirect_uri_mismatch**. The domain registration is incomplete — the **redirect URI** is registered but the **authorized JavaScript origin** is not (or the wrong OAuth flow type is configured).

---

## Test Results

| Step | Test | Result | Notes |
|------|------|--------|-------|
| 1 | Login page loads | PASS | Page loads cleanly, all form elements visible |
| 2 | Google button is ACTIVE | PASS | Button enabled, no opacity-40, no cursor-not-allowed |
| 3 | Click → OAuth fires without mismatch | PASS (test) / FAIL (actual) | Popup opened — but shows Error 400 |
| 4 | Console error audit | PASS | No OAuth errors in browser console |
| 5 | GSI SDK network trace | PASS | GSI script loaded 200 OK |

**Note on Step 3:** The test marked PASS because the popup opened (OAuth flow initiated) and `redirect_uri_mismatch` did not appear literally in the popup URL query string — it was encoded inside the `authError` base64 parameter. The actual OAuth flow FAILED inside the popup.

---

## Screenshots

| File | Description |
|------|-------------|
| `test-results/dev-oauth-step1-login-page.png` | Login page full render — looks correct |
| `test-results/dev-oauth-step2-google-button.png` | Google button visible and active |
| `test-results/dev-oauth-step3-after-click.png` | Button in loading state (spinner visible, tooltip "Sign in with Google") |
| `test-results/dev-oauth-step3-popup.png` | **CRITICAL: "Access blocked: This app's request is invalid" — Error 400: redirect_uri_mismatch** |
| `test-results/dev-oauth-step4-console-audit.png` | Console audit — 1 unrelated 401 error, no OAuth errors |
| `test-results/dev-oauth-step5-network-trace.png` | Network trace — GSI script loaded OK |

---

## Root Cause Analysis

### What Google's Error Page Said (popup screenshot)
```
Sign in with Google

Access blocked: This app's request is invalid

You can't sign in because this app sent an invalid request.
Error 400: redirect_uri_mismatch
```

### Decoded authError from Popup URL
```
redirect_uri_mismatch

You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.

If you're the app developer, register the JavaScript origin in the Google Cloud Console.

Origin reported: https://dev.thevideopool.com
```

### Client ID in Use
```
492064280951-qh2num4j23eaq7o47itoi19dvon8pcoh.apps.googleusercontent.com
```

### What This Means
Google is saying `https://dev.thevideopool.com` is NOT registered as an **Authorized JavaScript Origin** for this OAuth 2.0 Client ID. This is a different requirement from the **redirect URI**.

The GSI (Google Sign-In) implicit flow requires:
1. **Authorized JavaScript Origins** — the domain the sign-in button lives on
2. **Authorized Redirect URIs** — where Google sends the token back (for server-side flows)

The error specifically says "register the JavaScript origin" — meaning item 1 above is missing.

---

## Fix Required

### Google Cloud Console Steps

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Navigate to: APIs & Services > Credentials
4. Find OAuth 2.0 Client ID: `492064280951-qh2num4j23eaq7o47itoi19dvon8pcoh`
5. Click Edit
6. Under **Authorized JavaScript Origins**, add:
   ```
   https://dev.thevideopool.com
   ```
7. Under **Authorized Redirect URIs**, verify this is also present:
   ```
   https://dev.thevideopool.com/auth/callback
   ```
   (or whatever your Supabase callback URL is)
8. Save — changes propagate in 5 minutes (can take up to 30 min)

### If Using Supabase Auth (likely)
Also add in Supabase Dashboard > Authentication > URL Configuration:
- **Site URL:** `https://dev.thevideopool.com`
- **Redirect URLs:** `https://dev.thevideopool.com/**`

---

## What IS Working

- Page loads cleanly on dev.thevideopool.com
- Google button is fully active (not in "Coming soon" / disabled state)
- Button shows a loading spinner on click (OAuth flow starts)
- GSI SDK loads successfully (200 OK from accounts.google.com/gsi/client)
- No OAuth errors in browser console (the error only appears inside the popup)
- The button spinner tooltip correctly reads "Sign in with Google"

---

## Comparison: Previous Vercel Preview URL

| | Vercel Preview (old) | dev.thevideopool.com |
|--|--|--|
| Page loads | Yes | Yes |
| Google button active | Yes | Yes |
| OAuth popup opens | Yes | Yes |
| Error in popup | redirect_uri_mismatch | redirect_uri_mismatch |
| Error message | Same | Same |

**Conclusion:** The issue is identical on both domains. The Vercel preview URL AND dev.thevideopool.com both need their JavaScript origins registered in Google Cloud Console for Client ID `492064280951-...`.

---

## Next Actions

1. **Register `https://dev.thevideopool.com` as Authorized JavaScript Origin** in Google Cloud Console (5 min fix)
2. Re-run this test suite after propagation: `npx playwright test e2e/google-oauth-dev-domain.spec.ts`
3. Expected result after fix: Popup opens to Google account chooser (NOT the error page)
4. Once confirmed working on dev domain, repeat for production domain before launch
