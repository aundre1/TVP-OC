# The Video Pool - Backend API Specification

**Version:** 1.0.0
**Last Updated:** 2026-01-18
**Frontend Status:** Phase 5 Complete (Authentication & Billing UI Ready)

---

## Overview

This document specifies all backend API endpoints required by the TVP React frontend. The frontend currently runs in **mock mode** (`DEV_CONFIG.useMockAuth = true`). Steve needs to implement these endpoints to enable production mode.

### Base Configuration

- **Base URL:** `/api` (Vite proxies this in development)
- **Authentication:** Bearer token in `Authorization` header
- **Content-Type:** `application/json`
- **Credentials:** `withCredentials: true` (cookies supported)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Subscriptions & Billing](#2-subscriptions--billing)
3. [Videos](#3-videos)
4. [Downloads](#4-downloads)
5. [Library (Crates/Playlists)](#5-library-cratesplaylists)
6. [User Preferences](#6-user-preferences)
7. [Stripe Webhooks](#7-stripe-webhooks)
8. [Error Codes](#8-error-codes)

---

## 1. Authentication

### 1.1 Login with Username/Password

```
POST /auth/login
```

**Request Body:**
```json
{
  "username": "string",  // username or email
  "password": "string"
}
```

**Response (Success - No 2FA):**
```json
{
  "user": { /* User object */ },
  "token": "jwt-token-string"
}
```

**Response (2FA Required):**
```json
{
  "requires2FA": true,
  "tempUserId": 123
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid credentials
- `422` - Validation error

---

### 1.2 Login with Google OAuth

```
POST /auth/google
```

**Request Body:**
```json
{
  "accessToken": "google-oauth-access-token"
}
```

**Response:**
```json
{
  "user": { /* User object */ },
  "token": "jwt-token-string"
}
```

**Notes:**
- Creates account if user doesn't exist (auto-registration)
- Links Google account if user exists with same email
- Returns JWT token for session

---

### 1.3 Complete 2FA Verification

```
POST /auth/login/2fa
```

**Request Body:**
```json
{
  "userId": 123,
  "code": "123456"
}
```

**Response:**
```json
{
  "user": { /* User object */ },
  "token": "jwt-token-string"
}
```

---

### 1.4 Register New Account

```
POST /auth/register
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "verificationSent": true
}
```

**Notes:**
- Sends verification email
- Auto-starts 6-month free trial upon email verification
- Sets `freeTrialStartedAt` and `freeTrialExpiresAt` (180 days later)

---

### 1.5 Logout

```
POST /auth/logout
```

**Response:** `204 No Content`

---

### 1.6 Get Current User

```
GET /auth/me
```

**Response:**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "membershipId": 1,
  "membershipType": "free" | "starter" | "pro" | "elite",
  "isAdmin": false,
  "emailVerified": true,
  "twoFactorEnabled": false,
  "profileImage": "url-or-null",
  "createdAt": "2026-01-15T10:00:00Z",
  "downloadsThisMonth": 5,
  "downloadLimit": 200,
  "bonusCredits": 0,
  "freeTrialStartedAt": "2026-01-15T10:00:00Z",
  "freeTrialExpiresAt": "2026-07-15T10:00:00Z"
}
```

**Notes:**
- Returns `null` / `401` if not authenticated
- `freeTrialStartedAt` and `freeTrialExpiresAt` only set for free trial users

---

### 1.7 Email Verification

```
POST /auth/verify-email
Body: { "token": "verification-token" }
Response: { "message": "string", "verified": true }
```

```
POST /auth/resend-verification
Response: { "message": "Verification email sent" }
```

```
GET /auth/verification-status
Response: { "verified": true }
```

---

### 1.8 Password Reset

```
POST /auth/forgot-password
Body: { "email": "string" }
Response: { "message": "Password reset email sent" }
```

```
POST /auth/validate-reset-token
Body: { "token": "string" }
Response: { "valid": true }
```

```
POST /auth/reset-password
Body: { "token": "string", "password": "string" }
Response: { "message": "Password reset successful" }
```

---

### 1.9 Two-Factor Authentication Management

```
GET /auth/2fa/status
Response: { "enabled": false, "backupCodesRemaining": 10 }
```

```
POST /auth/2fa/setup
Response: {
  "secret": "TOTP-SECRET",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": ["CODE1", "CODE2", ...]
}
```

```
POST /auth/2fa/verify
Body: { "code": "123456" }
Response: { "message": "2FA enabled" }
```

```
POST /auth/2fa/disable
Body: { "code": "123456" }
Response: { "message": "2FA disabled" }
```

```
POST /auth/2fa/backup-codes/regenerate
Body: { "code": "123456" }
Response: { "backupCodes": ["NEW1", "NEW2", ...] }
```

---

## 2. Subscriptions & Billing

### 2.1 Get Membership Tiers

```
GET /memberships
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Free Trial",
    "slug": "free",
    "price": 0,
    "quarterlyPrice": 0,
    "annualPrice": 0,
    "downloadLimit": 2,
    "features": ["2 downloads/month", "HD quality", "Basic search", "6-month trial"]
  },
  {
    "id": 2,
    "name": "Video Pool Pro",
    "slug": "paid",
    "price": 34.99,
    "quarterlyPrice": 99.99,
    "annualPrice": 299.99,
    "downloadLimit": 200,
    "features": [
      "200+ downloads/month",
      "4K quality",
      "Advanced search",
      "Set Builder Pro",
      "Early access",
      "Priority support"
    ],
    "isPopular": true
  }
]
```

**PRD Pricing Structure:**

| Tier | Monthly | Quarterly | Annual | Downloads/mo |
|------|---------|-----------|--------|--------------|
| Free Trial | $0 | - | - | 2 (6 months) |
| Monthly | $34.99 | - | - | 200 |
| Quarterly | - | $99.99 (~$33.33/mo) | - | 300 |
| Annual | - | - | $299.99 (~$25/mo) | 400 |

---

### 2.2 Get Membership Status

```
GET /memberships/status
```

**Response:**
```json
{
  "currentMembership": { /* Membership object */ },
  "subscriptionStatus": "active" | "cancelled" | "past_due" | "trialing",
  "periodEnd": "2026-02-15T10:00:00Z",
  "cancelAtPeriodEnd": false,
  "downloadsUsed": 45,
  "downloadsRemaining": 155
}
```

**Notes:**
- `subscriptionStatus: "trialing"` for free trial users
- `downloadsRemaining` can be `"unlimited"` for unlimited tiers

---

### 2.3 Check Download Permission

```
GET /memberships/can-download
```

**Response:**
```json
{
  "canDownload": true,
  "reason": null,
  "downloadsRemaining": 155,
  "upgradeRequired": false
}
```

**Failure Response:**
```json
{
  "canDownload": false,
  "reason": "Download limit reached for this month",
  "downloadsRemaining": 0,
  "upgradeRequired": true
}
```

---

### 2.4 Create Checkout Session

```
POST /memberships/create-checkout
```

**Request Body:**
```json
{
  "membershipId": 2,
  "interval": "month" | "quarter" | "year",
  "successUrl": "https://thevideopool.com/membership/success",
  "cancelUrl": "https://thevideopool.com/membership"
}
```

**Response:**
```json
{
  "sessionId": "cs_live_xxx",
  "url": "https://checkout.stripe.com/pay/cs_live_xxx"
}
```

**Notes:**
- Creates Stripe Checkout session
- Frontend redirects to returned URL
- `interval` determines pricing: month=$34.99, quarter=$99.99, year=$299.99

---

### 2.5 Cancel Subscription

```
POST /memberships/cancel
```

**Response:**
```json
{
  "message": "Subscription will cancel at end of current period"
}
```

**Notes:**
- Sets `cancelAtPeriodEnd: true` in Stripe
- User retains access until `periodEnd`

---

### 2.6 Billing Portal

```
POST /billing/portal
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/xxx"
}
```

**Notes:**
- Creates Stripe Customer Portal session
- Users can manage payment methods, view invoices, cancel subscription

---

### 2.7 Additional Billing Endpoints

```
POST /billing/subscription/resume
Response: { "message": "Subscription resumed" }

POST /billing/subscription/change
Body: { "membershipId": 2 }
Response: { "message": "Plan changed" }

GET /billing/history
Response: {
  "invoices": [
    { "id": "inv_xxx", "amount": 34.99, "status": "paid", "created": "2026-01-01", "pdfUrl": "..." }
  ]
}

GET /billing/upcoming
Response: {
  "amount": 34.99,
  "dueDate": "2026-02-15T10:00:00Z",
  "items": [{ "description": "Video Pool Pro membership", "amount": 34.99 }]
}

GET /billing/subscription
Response: {
  "status": "active",
  "currentPeriodEnd": "2026-02-15T10:00:00Z",
  "cancelAtPeriodEnd": false,
  "membership": { /* Membership object */ }
}

GET /billing/payment-methods
Response: [
  { "id": "pm_xxx", "brand": "visa", "last4": "4242", "expMonth": 12, "expYear": 2027, "isDefault": true }
]

POST /billing/payment-methods/:id/default
Response: { "message": "Default payment method updated" }

DELETE /billing/payment-methods/:id
Response: { "message": "Payment method deleted" }

POST /billing/retry-payment
Response: { "message": "Payment retried" }
```

---

## 3. Videos

### 3.1 Get Videos (with Filters)

```
GET /videos
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query (title, artist) |
| `genre` | string | Genre filter |
| `subGenre` | string | Sub-genre filter |
| `bpmMin` | number | Minimum BPM |
| `bpmMax` | number | Maximum BPM |
| `key` | string | Musical key (e.g., "Am", "C") |
| `quality` | string | Video quality (720p, 1080p, 4K) |
| `version` | string | Version type (clean, explicit, etc.) |
| `sortBy` | string | `newest`, `popular`, `title`, `artist` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response:**
```json
{
  "videos": [ /* Video objects */ ],
  "total": 30000,
  "page": 1,
  "totalPages": 1500,
  "filters": { /* Applied filters */ }
}
```

---

### 3.2 Get Single Video

```
GET /videos/:id
```

**Response:**
```json
{
  "id": 123,
  "title": "Song Title",
  "artist": "Artist Name",
  "thumbnailUrl": "https://...",
  "previewUrl": "https://...",
  "streamUrl": "https://...",
  "duration": 210,
  "bpm": 128,
  "key": "Am",
  "genre": "Hip-Hop",
  "subGenre": "Trap",
  "quality": "1080p",
  "releaseDate": "2026-01-10T00:00:00Z",
  "downloadCount": 5420,
  "isExclusive": false,
  "isTrending": true,
  "isNew": true,
  "tags": ["Hip-Hop", "Trap", "2026"],
  "versions": [
    { "id": 1, "type": "clean", "quality": "1080p", "fileSize": 150000000, "format": "mp4" },
    { "id": 2, "type": "explicit", "quality": "1080p", "fileSize": 152000000, "format": "mp4" }
  ],
  "relatedVideos": [ /* Video objects */ ]
}
```

---

### 3.3 Additional Video Endpoints

```
GET /videos/featured
Response: [ /* Video[] - Featured videos for homepage */ ]

GET /videos/recommended
Query: { limit: 20 }
Response: [ /* Video[] - Personalized recommendations */ ]

GET /videos/related/:id
Query: { limit: 10 }
Response: [ /* Video[] - Similar videos */ ]

GET /videos/:id/preview
Response: { "previewUrl": "https://...", "duration": 30 }

GET /categories
Response: [
  { "id": 1, "name": "Pop", "slug": "pop", "videoCount": 5000 },
  ...
]

GET /categories/:id
Query: { /* Same as /videos filters */ }
Response: { /* Same as /videos */ }
```

---

## 4. Downloads

### 4.1 Initiate Download

```
POST /videos/:id/download
```

**Request Body:**
```json
{
  "version": "hd"  // or "clean", "explicit", "4k", etc.
}
```

**Response:**
```json
{
  "signedUrl": "https://cdn.thevideopool.com/videos/xxx?token=xxx&expires=xxx",
  "expiresIn": 3600,
  "remainingDownloads": 154,
  "downloadId": 12345
}
```

**Notes:**
- Decrements user's download count
- Returns signed URL valid for `expiresIn` seconds
- Returns `403` if download limit exceeded

---

### 4.2 Get Download URL (Alternative)

```
GET /videos/:id/download
```

**Response:**
```json
{
  "signedUrl": "https://...",
  "expiresIn": 3600
}
```

---

### 4.3 Download History

```
GET /user/downloads
Query: { page: 1, limit: 20 }
Response: {
  "downloads": [
    {
      "id": 1,
      "videoId": 123,
      "video": { /* Video object */ },
      "version": { /* VideoVersion object */ },
      "downloadedAt": "2026-01-15T14:30:00Z",
      "status": "completed"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20
}
```

```
GET /user/downloads/recent
Query: { limit: 10 }
Response: [ /* Download[] */ ]
```

---

### 4.4 Bonus Credits

```
GET /credits/balance
Response: { "bonusCredits": 10 }

GET /credits/packs
Response: [
  { "id": "pack_10", "name": "10 Credits", "credits": 10, "price": 9.99 },
  { "id": "pack_25", "name": "25 Credits", "credits": 25, "price": 19.99, "popular": true },
  { "id": "pack_50", "name": "50 Credits", "credits": 50, "price": 34.99 }
]

POST /credits/purchase
Body: {
  "packId": "pack_25",
  "successUrl": "https://thevideopool.com/credits/success",
  "cancelUrl": "https://thevideopool.com/credits"
}
Response: { "url": "https://checkout.stripe.com/..." }
```

---

## 5. Library (Crates/Playlists)

### 5.1 Crates (Playlists)

```
GET /playlists
Response: [ /* Crate[] */ ]

GET /playlists/:id
Response: {
  "id": 1,
  "name": "My Crate",
  "description": "Friday night set",
  "videoCount": 25,
  "coverImage": "https://...",
  "isPublic": false,
  "createdAt": "2026-01-10T00:00:00Z",
  "updatedAt": "2026-01-15T00:00:00Z",
  "videos": [ /* Video[] */ ]
}

POST /playlists
Body: { "name": "string", "description": "string", "isPublic": false }
Response: { /* Crate */ }

PUT /playlists/:id
Body: { "name": "string", "description": "string", "isPublic": false }
Response: { /* Crate */ }

DELETE /playlists/:id
Response: 204 No Content

POST /playlists/:id/videos
Body: { "videoId": 123 }
Response: 201 Created

DELETE /playlists/:id/videos/:videoId
Response: 204 No Content

PUT /playlists/:id/reorder
Body: { "videoIds": [3, 1, 5, 2, 4] }
Response: 200 OK
```

---

### 5.2 Shared Playlists

```
GET /shared-playlist/:token
Response: { /* CrateWithVideos - public view */ }
```

---

### 5.3 Watch History

```
GET /watch-history
Query: { limit: 20, offset: 0 }
Response: [
  {
    "videoId": 123,
    "video": { /* Video */ },
    "progress": 120,
    "duration": 210,
    "completed": false,
    "lastWatchedAt": "2026-01-15T10:00:00Z"
  }
]

GET /watch-history/continue
Query: { limit: 10 }
Response: [ /* Incomplete videos to continue */ ]

POST /watch-history/progress
Body: { "videoId": 123, "progress": 120, "duration": 210 }
Response: 200 OK

GET /watch-history/video/:videoId
Response: { "progress": 120, "duration": 210, "completed": false }

DELETE /watch-history/video/:videoId
Response: 204 No Content

DELETE /watch-history
Response: 204 No Content (clears all)

GET /watch-history/stats
Response: {
  "totalWatched": 150,
  "totalTime": 45000,
  "topGenres": [
    { "genre": "Hip-Hop", "count": 45 },
    { "genre": "EDM", "count": 32 }
  ]
}
```

---

### 5.4 Favorites

```
GET /favorites
Response: [ /* Video[] */ ]

POST /favorites/:videoId
Response: 201 Created

DELETE /favorites/:videoId
Response: 204 No Content

GET /favorites/check/:videoId
Response: { "isFavorite": true }
```

---

## 6. User Preferences

```
POST /user/preferences
Body: {
  "topGenres": ["Hip-Hop", "EDM"],
  "bpmRange": { "min": 90, "max": 140 },
  "excludeGenres": ["Country"]
}
Response: 200 OK
```

---

## 7. Stripe Webhooks

Implement webhook handler at `POST /webhooks/stripe` to process:

### Required Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activate subscription, update user membership |
| `customer.subscription.created` | Create subscription record |
| `customer.subscription.updated` | Update subscription details (plan change, renewal) |
| `customer.subscription.deleted` | Cancel subscription, downgrade to free |
| `invoice.payment_succeeded` | Reset monthly download count |
| `invoice.payment_failed` | Mark subscription as `past_due`, send email |

### Webhook Payload Handling

```javascript
// Example: checkout.session.completed
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_xxx",
      "customer": "cus_xxx",
      "subscription": "sub_xxx",
      "metadata": {
        "userId": "123",
        "membershipId": "2",
        "interval": "month"
      }
    }
  }
}
```

### Download Count Reset Logic

When `invoice.payment_succeeded`:
1. Get subscription interval from invoice
2. Reset `downloadsThisMonth` to 0
3. Set download limit based on interval:
   - Monthly: 200
   - Quarterly: 300
   - Annual: 400

---

## 8. Error Codes

### Standard HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `204` | No Content |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `422` | Validation Error |
| `429` | Rate Limited |
| `500` | Server Error |

### Custom Error Codes

Return in body as `{ "error": "message", "code": "ERROR_CODE" }`:

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| `INVALID_CREDENTIALS` | Wrong username/password | 401 |
| `EMAIL_NOT_VERIFIED` | Email verification required | 403 |
| `SUBSCRIPTION_REQUIRED` | Paid subscription needed | 403 |
| `DOWNLOAD_LIMIT_EXCEEDED` | Monthly downloads exhausted | 403 |
| `TRIAL_EXPIRED` | Free trial has ended | 403 |
| `INVALID_2FA_CODE` | Wrong 2FA code | 401 |
| `RATE_LIMITED` | Too many requests | 429 |

---

## Implementation Priority

### Phase 1: Core Auth (Required for Launch)
1. `POST /auth/login` - Basic login
2. `POST /auth/google` - Google OAuth
3. `GET /auth/me` - Session validation
4. `POST /auth/register` - Registration
5. `POST /auth/logout` - Logout

### Phase 2: Subscriptions (Required for Revenue)
1. `GET /memberships` - Pricing tiers
2. `GET /memberships/status` - User subscription status
3. `POST /memberships/create-checkout` - Stripe checkout
4. `POST /memberships/cancel` - Cancel subscription
5. Stripe webhooks (all)

### Phase 3: Downloads (Required for Core Feature)
1. `POST /videos/:id/download` - Download with limit check
2. `GET /memberships/can-download` - Permission check
3. `GET /user/downloads` - History

### Phase 4: Everything Else
- Playlists/Crates
- Favorites
- Watch history
- 2FA management
- Password reset
- Email verification

---

## Testing the Integration

To switch from mock mode to real API:

```typescript
// src/config/dev.ts
export const DEV_CONFIG = {
  useMockAuth: false,  // Change to false
  // ...
};
```

Ensure backend is running and Vite proxy is configured:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // Your backend URL
        changeOrigin: true,
      },
    },
  },
});
```

---

## Questions for Steve

1. **Database:** PostgreSQL? MySQL? What ORM?
2. **Session Management:** JWT only, or session cookies?
3. **File Storage:** S3? CloudFront for CDN?
4. **Email Service:** SendGrid? SES? For verification emails
5. **Rate Limiting:** Redis? In-memory?
6. **Existing User Migration:** How to handle legacy users?

---

*Document generated by Claude Code - Phase 5 handoff*
