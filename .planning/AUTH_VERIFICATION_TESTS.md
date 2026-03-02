# The Video Pool — Auth Verification Tests

**Date:** March 2, 2026
**Status:** Ready for comprehensive testing

---

## ✅ Email/Password Authentication — Ready to Test

### Current Configuration
- **Dev Mode:** ✅ Real auth enabled (`useMockAuth: false`)
- **Auto-login:** ✅ Disabled (allows landing page testing)
- **Email Verification:** ✅ Enabled (6-digit code)
- **Password Reset:** ✅ Enabled (email token flow)
- **2FA (TOTP):** ✅ Enabled (optional)

---

## Test Plan

### 1️⃣ Registration Flow

**URL:** https://dev.thevideopool.com/register

**Steps:**
1. Click "Create Account"
2. Enter new email (e.g., `test+$(date +%s)@thevideopool.com`)
3. Enter password: `TestPass123!` (must have uppercase, lowercase, number, special char)
4. Check "I agree to Terms"
5. Click "Create Account"
6. **Expected:** Email verification page appears

**Verify Backend Response:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email.",
  "verificationSent": true,
  "_devCode": "123456"  // Only in dev mode for testing
}
```

---

### 2️⃣ Email Verification

**URL:** https://dev.thevideopool.com/verify-email

**Steps:**
1. After registration, check email inbox
2. Look for verification code (6 digits)
3. Enter code in verification field
4. Click "Verify Email"
5. **Expected:** Redirects to phone verification page

**Verify Backend Response:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-email-code \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "code":"123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "verified": true
}
```

---

### 3️⃣ Phone Verification (Optional)

**URL:** https://dev.thevideopool.com/verify-phone

**Steps:**
1. Enter phone number (e.g., `+1234567890`)
2. Click "Send Code"
3. **Expected:** Code sent via SMS (or stub in dev)
4. Enter code and click "Verify"
5. **Expected:** Redirects to home page

**Note:** Phone verification can be skipped by clicking "Skip for now" — currently allows passing through without verification

---

### 4️⃣ Login Flow (Email/Password)

**URL:** https://dev.thevideopool.com/login

**Steps:**
1. Enter email (from registration)
2. Enter password
3. Click "Sign In with Email"
4. **Expected:** Logs in successfully, redirects to home

**Verify Backend Response:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123!"
  }' \
  -v  # Shows headers to see HttpOnly cookie
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 123,
    "email": "test@example.com",
    "username": "test",
    "membershipType": "free",
    "emailVerified": true,
    "phoneVerified": false,
    "twoFactorEnabled": false
  }
}
```

**HttpOnly Cookies Set:**
- `tvp_token` (access token, 15 min)
- `tvp_refresh_token` (refresh token, 7 days)

---

### 5️⃣ OAuth Flows (After Credentials Set)

#### Google OAuth ✅ (Already Working)
```
1. Click Google button
2. Google login page appears
3. Select account
4. Should see "Signed in with Google" toast
5. Redirect to verify-phone or home
```

#### Facebook OAuth 🔴 (Waiting for Credentials)
```
1. After setting VITE_FACEBOOK_APP_ID on Vercel + Railway
2. Click Facebook button (should be enabled now)
3. Facebook login page appears
4. Approve permissions
5. Should see "Signed in with Facebook" toast
6. Redirect to verify-phone or home
```

#### Spotify OAuth ⏳ (Partial - Waiting for Redirect URI)
```
1. Click Spotify button
2. Spotify auth page in popup
3. Approve scopes (user-read-email, user-read-private)
4. Popup closes automatically
5. Should see "Signed in with Spotify" toast
6. Redirect to verify-phone or home
```

**Note:** If Spotify fails with "Invalid redirect URI," the redirect URI isn't registered in Spotify Dashboard. Check .planning/OAUTH_SETUP_GUIDE.md for registration steps.

#### Apple Sign In ⏳ (Waiting for Services ID)
```
1. After setting VITE_APPLE_SERVICE_ID on Vercel
2. Click Apple button
3. Apple sign-in modal appears (Apple browser only)
4. Authenticate
5. Should see "Signed in with Apple" toast
6. Redirect to verify-phone or home
```

---

### 6️⃣ Logout

**URL:** After logging in, settings or nav menu

**Steps:**
1. Click user menu → "Settings"
2. Scroll to bottom → Click "Log Out"
3. **Expected:** Redirects to landing page
4. Cookies cleared (`tvp_token`, `tvp_refresh_token`)

**Verify Backend Response:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b "tvp_token=YOUR_TOKEN" \
  -v  # Shows headers to verify cookies cleared
```

---

### 7️⃣ Password Reset

**URL:** https://dev.thevideopool.com/forgot-password

**Steps:**
1. Go to login page → "Forgot Password?"
2. Enter email
3. Click "Send Reset Link"
4. **Expected:** Email sent with reset token
5. Check email inbox for reset link
6. Click link → redirects to reset password page
7. Enter new password and confirm
8. Click "Reset Password"
9. **Expected:** Login page with success message
10. Login with new password should work

**Verify Backend Response:**
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

### 8️⃣ Two-Factor Authentication (2FA)

**URL:** https://dev.thevideopool.com/settings → Security

**Steps:**
1. Login (required)
2. Go to Settings
3. Find "Two-Factor Authentication" section
4. Click "Enable 2FA"
5. **Expected:** Shows QR code + backup codes
6. Scan QR with authenticator app (Google Authenticator, Authy, etc.)
7. Enter 6-digit code from app
8. Click "Enable"
9. **Expected:** 2FA enabled, backup codes displayed
10. Logout and login again
11. **Expected:** After password entry, prompts for 2FA code
12. Enter code from authenticator
13. Should log in successfully

**Disable 2FA:**
1. Settings → Security → "Disable 2FA"
2. Enter password
3. Click "Disable"
4. **Expected:** 2FA disabled

---

## Quick Test Commands

### Check Backend Health
```bash
curl http://localhost:5000/health
# Expected: { "status": "ok" }
```

### List DB Migrations (show database is ready)
```bash
curl http://localhost:5000/api/health
# Expected: { "status": "healthy", "database": "connected" }
```

### Get Current User (without token)
```bash
curl http://localhost:5000/api/auth/me
# Expected: 401 Unauthorized (no token provided)
```

### Get Current User (with token)
```bash
curl -H "Cookie: tvp_token=YOUR_TOKEN" http://localhost:5000/api/auth/me
# Expected: { "success": true, "user": { ... } }
```

---

## Expected Behavior Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Registration | ✅ Ready | Email verification required |
| Email Verification | ✅ Ready | 6-digit code sent to email |
| Phone Verification | ✅ Ready | Can be skipped (optional) |
| Email/Password Login | ✅ Ready | HttpOnly cookies |
| Password Reset | ✅ Ready | Token-based, expires in 1 hour |
| 2FA Setup | ✅ Ready | TOTP-based with backup codes |
| Google OAuth | ✅ Ready | Working (fully configured) |
| Facebook OAuth | 🔴 Blocked | Waiting for App ID + Secret |
| Spotify OAuth | ⏳ Partial | Waiting for redirect URI registration |
| Apple Sign In | ⏳ Partial | Waiting for Services ID |
| Logout | ✅ Ready | Clears cookies |
| Session Management | ✅ Ready | Refresh token auto-renews access token |

---

## Troubleshooting

### Issue: "Invalid email or password"
**Cause:** Wrong credentials
**Fix:** Try registering new account or use password reset

### Issue: Email verification code not received
**Cause:** Brevo API key missing or email config wrong
**Fix:** Check Railway env vars: `BREVO_API_KEY`, `FROM_EMAIL`

### Issue: Password doesn't meet requirements
**Cause:** Password must be 8+ chars with uppercase, lowercase, number, special char
**Fix:** Example valid password: `TestPass123!`

### Issue: "Email already registered"
**Cause:** Email already used for registration
**Fix:** Try login instead, or use different email

### Issue: Google/Facebook/Spotify OAuth fails with "invalid_client"
**Cause:** Client ID not set on Vercel or provider config wrong
**Fix:** Check .planning/OAUTH_SETUP_GUIDE.md for setup steps

### Issue: "Phone verification code invalid"
**Cause:** Code expired (usually 10 min) or wrong code
**Fix:** Click "Resend Code" to get new code

---

## Performance Benchmarks

**Target Response Times:**
- Registration: < 500ms
- Email verification: < 200ms
- Login: < 300ms
- OAuth (after redirect): < 500ms

**Database Health Check:**
```bash
# Check if database is responding
curl http://localhost:5000/health -w "\nTime: %{time_total}s\n"
```

---

## Next Steps

1. **Test email/password auth locally** (before deploying)
2. **Collect OAuth credentials** (Facebook, Apple, Spotify)
3. **Set environment variables** on Vercel + Railway
4. **Test each OAuth provider** after deployment
5. **Monitor production logs** for auth errors

---

**Created:** March 2, 2026
**Status:** Ready for execution
**Assigned to:** You (Aundre)
