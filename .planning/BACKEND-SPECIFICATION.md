# The Video Pool - Backend Specification
## For Steve (Backend Developer)
## Version: 5.5 | Date: January 27, 2026

---

## OVERVIEW

This document specifies all backend requirements for The Video Pool DJ platform. The frontend is 100% complete and uses a mock server for development. This spec defines what the real backend needs to implement.

**Tech Stack Recommendation:**
- Node.js + Express OR Python + FastAPI
- PostgreSQL database
- Redis for caching/sessions
- S3/Wasabi for video storage
- Stripe for payments
- SendGrid/Mailgun for email

---

## 1. DATABASE SCHEMA

### 1.1 Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  membership_type ENUM('free', 'monthly', 'annual', 'lifetime') DEFAULT 'free',
  membership_status ENUM('active', 'cancelled', 'expired', 'trial') DEFAULT 'free',
  download_limit INTEGER DEFAULT 0,
  downloads_used INTEGER DEFAULT 0,
  download_limit_reset_date TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

### 1.2 Videos Table

```sql
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  subgenre VARCHAR(100),
  bpm INTEGER,
  key VARCHAR(10),
  camelot_key VARCHAR(5),
  duration INTEGER, -- seconds
  year INTEGER,
  label VARCHAR(255),
  thumbnail_url VARCHAR(500),
  is_new BOOLEAN DEFAULT FALSE,
  is_hot BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 1.3 Video Versions Table

```sql
CREATE TABLE video_versions (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  version_type ENUM('clean', 'explicit', 'extended', 'intro', 'outro', 'quickhit') NOT NULL,
  quality ENUM('4k', '1080p', '720p', '480p') NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size INTEGER, -- bytes
  bitrate INTEGER, -- kbps
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(video_id, version_type, quality)
);
```

### 1.4 Downloads Table

```sql
CREATE TABLE downloads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  version_type VARCHAR(50),
  quality VARCHAR(10),
  file_size INTEGER,
  downloaded_at TIMESTAMP DEFAULT NOW()
);
```

### 1.5 User Sets (Playlists) Table

```sql
CREATE TABLE user_sets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  share_id VARCHAR(50) UNIQUE,
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 1.6 Set Tracks Table

```sql
CREATE TABLE set_tracks (
  id SERIAL PRIMARY KEY,
  set_id INTEGER REFERENCES user_sets(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP DEFAULT NOW()
);
```

### 1.7 Favorites Table

```sql
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);
```

### 1.8 Verification Codes Table

```sql
CREATE TABLE verification_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  type ENUM('email_verify', 'password_reset', '2fa_setup') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 1.9 Backup Codes Table (2FA)

```sql
CREATE TABLE backup_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  code_hash VARCHAR(255) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 1.10 Memberships Table

```sql
CREATE TABLE memberships (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  price_monthly DECIMAL(10,2),
  price_annual DECIMAL(10,2),
  download_limit INTEGER, -- NULL for unlimited
  features JSONB,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_annual VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed data
INSERT INTO memberships (name, slug, price_monthly, price_annual, download_limit, is_popular, features) VALUES
('Free', 'free', 0, 0, 10, false, '["Access to 720p videos", "Limited downloads per month"]'),
('Basic', 'basic', 9.99, 99.99, 100, false, '["Access to 1080p videos", "100 downloads per month", "Email support"]'),
('Pro', 'pro', 19.99, 199.99, NULL, true, '["Access to 4K videos", "Unlimited downloads", "Priority support", "Early access to new releases"]'),
('Lifetime', 'lifetime', NULL, 499.99, NULL, false, '["One-time payment", "Lifetime access to all features", "4K videos", "Unlimited downloads"]');
```

---

## 2. API ENDPOINTS

### 2.1 Authentication

#### POST /api/auth/register
**Request:**
```json
{
  "username": "djmaster",
  "email": "dj@example.com",
  "password": "SecurePass123"
}
```
**Response:**
```json
{
  "message": "Registration successful. Please verify your email.",
  "email": "dj@example.com",
  "_devCode": "123456"  // DEV ONLY - remove in production
}
```
**Logic:**
1. Validate username uniqueness
2. Validate email format and uniqueness
3. Hash password (bcrypt, cost=12)
4. Create user record
5. Generate 6-digit verification code
6. Send verification email via SendGrid
7. Return response

#### POST /api/auth/login
**Request:**
```json
{
  "email": "dj@example.com",
  "password": "SecurePass123"
}
```
**Response (no 2FA):**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "djmaster",
    "email": "dj@example.com",
    "membershipType": "pro",
    "membershipStatus": "active",
    "downloadLimit": null,
    "downloadsUsed": 42,
    "emailVerified": true,
    "twoFactorEnabled": false,
    "role": "user"
  }
}
```
**Response (2FA required):**
```json
{
  "requires2FA": true,
  "tempToken": "temp_abc123..."
}
```

#### POST /api/auth/login/2fa
**Request:**
```json
{
  "tempToken": "temp_abc123...",
  "code": "123456"
}
```

#### POST /api/auth/verify-email-code
**Request:**
```json
{
  "email": "dj@example.com",
  "code": "123456"
}
```

#### POST /api/auth/resend-verification
**Request:**
```json
{
  "email": "dj@example.com"
}
```

#### POST /api/auth/forgot-password
**Request:**
```json
{
  "email": "dj@example.com"
}
```
**Logic:** Generate reset token, send email with link

#### POST /api/auth/reset-password
**Request:**
```json
{
  "token": "reset_token_abc...",
  "newPassword": "NewSecurePass456"
}
```

#### GET /api/auth/me
**Headers:** `Authorization: Bearer <token>`
**Response:** Full user object (same as login response.user)

#### POST /api/auth/logout
Clear session/token on server side.

---

### 2.2 Two-Factor Authentication

#### GET /api/auth/2fa/status
**Response:**
```json
{
  "enabled": false
}
```

#### POST /api/auth/2fa/setup
**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "otpauth://totp/TheVideoPool:dj@example.com?secret=..."
}
```

#### POST /api/auth/2fa/verify
**Request:**
```json
{
  "code": "123456"
}
```
**Logic:** Verify TOTP code, enable 2FA on success

#### POST /api/auth/2fa/disable
**Request:**
```json
{
  "password": "current_password"
}
```

#### POST /api/auth/2fa/backup-codes/regenerate
**Response:**
```json
{
  "backupCodes": ["XXXX-XXXX", "YYYY-YYYY", ...]
}
```
**Logic:** Generate 8 new backup codes, hash and store

---

### 2.3 Videos

#### GET /api/videos
**Query Params:**
- `search` - Text search (title, artist, label)
- `genre` - Filter by genre
- `subGenre` - Filter by subgenre
- `bpmMin` - Minimum BPM
- `bpmMax` - Maximum BPM
- `key` - Musical key filter
- `quality` - Filter by quality
- `version` - Filter by version type
- `sortBy` - newest, popular, title, artist
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**
```json
{
  "tracks": [...],
  "total": 45678,
  "page": 1,
  "limit": 20,
  "totalPages": 2284
}
```

#### GET /api/videos/featured
Returns trending/featured videos (downloads > threshold, recent activity)

#### GET /api/videos/recommended
**Headers:** `Authorization: Bearer <token>` (optional)
**Response includes match scores and reasons:**
```json
{
  "tracks": [
    {
      "id": 1,
      "title": "...",
      "score": 85,
      "reasons": [
        "Harmonic: Same key (Am)",
        "BPM: Close match (+4 BPM)",
        "Genre: Same genre (Pop)"
      ]
    }
  ]
}
```
**Logic for recommendations:**
1. If user has recent downloads, find tracks with:
   - Same/compatible key (Camelot wheel)
   - Similar BPM (±10)
   - Same genre
2. Calculate match score (0-100)
3. Return top 20 with reasons

#### GET /api/videos/related/:id
Returns videos related to a specific video (same genre, similar BPM/key)

#### GET /api/videos/:id
Returns single video with all details and available versions

#### POST /api/videos/:id/download
**Headers:** `Authorization: Bearer <token>`
**Request:**
```json
{
  "quality": "1080p",
  "version": "clean"
}
```
**Response:**
```json
{
  "downloadUrl": "https://signed-s3-url...",
  "expiresIn": 3600,
  "remainingDownloads": 58
}
```
**Logic:**
1. Check user download limit
2. Decrement downloads_used
3. Log download to downloads table
4. Generate signed S3 URL (1 hour expiry)
5. Return URL

---

### 2.4 Search

#### GET /api/search
Same as `/api/videos` with search param

#### GET /api/search/autocomplete
**Query:** `q=string`
**Response:**
```json
{
  "songs": [...],      // Max 10
  "artists": [...],    // Max 5 unique artists
  "labels": [...]      // Max 3 unique labels
}
```

---

### 2.5 User Downloads

#### GET /api/user/downloads
**Headers:** `Authorization: Bearer <token>`
**Query:** `page`, `limit`
**Response:**
```json
{
  "downloads": [
    {
      "id": 1,
      "video": {...},
      "quality": "1080p",
      "version": "clean",
      "downloadedAt": "2026-01-27T..."
    }
  ],
  "total": 42
}
```

#### GET /api/user/downloads/recent
Returns last 10 downloads

---

### 2.6 User Sets

#### GET /api/sets
Returns user's sets

#### POST /api/sets
**Request:**
```json
{
  "name": "Friday Night Mix",
  "trackIds": [1, 2, 3, 4, 5]
}
```

#### GET /api/sets/:id
Returns set details with tracks

#### PUT /api/sets/:id
Update set (name, tracks, order, visibility)

#### DELETE /api/sets/:id
Delete set

#### POST /api/sets/:id/share
Generate shareable link
**Response:**
```json
{
  "shareId": "abc123",
  "shareUrl": "https://thevideopool.com/set/abc123"
}
```

#### GET /api/shared-sets/:shareId
Public endpoint - returns set if public

---

### 2.7 Favorites

#### GET /api/favorites
Returns user's favorited videos

#### POST /api/favorites
**Request:** `{ "videoId": 123 }`

#### DELETE /api/favorites/:videoId
Remove from favorites

---

### 2.8 Memberships & Billing

#### GET /api/memberships
Returns all membership tiers

#### GET /api/memberships/status
Returns current user's membership status

#### GET /api/memberships/can-download
**Response:**
```json
{
  "canDownload": true,
  "remaining": 58,
  "limit": 100,
  "resetDate": "2026-02-01T00:00:00Z"
}
```

#### POST /api/memberships/create-checkout
**Request:**
```json
{
  "priceId": "price_abc123",
  "successUrl": "https://thevideopool.com/membership/success",
  "cancelUrl": "https://thevideopool.com/membership"
}
```
**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

#### POST /api/memberships/portal
Creates Stripe customer portal session

#### POST /api/webhooks/stripe
Handle Stripe webhooks:
- `checkout.session.completed` - Activate subscription
- `customer.subscription.updated` - Update membership
- `customer.subscription.deleted` - Downgrade to free
- `invoice.payment_failed` - Handle failed payment

---

### 2.9 Admin Endpoints

All require `role: 'admin'`

#### GET /api/admin/stats
**Response:**
```json
{
  "totalUsers": 12458,
  "activeSubscribers": 8234,
  "totalVideos": 45678,
  "downloadsToday": 3456,
  "revenueThisMonth": 124580,
  "newUsersThisWeek": 342
}
```

#### GET /api/admin/users
Paginated user list (exclude passwords)

#### GET /api/admin/users/:id
Single user details

#### PUT /api/admin/users/:id
Update user (role, membership, etc.)

#### GET /api/admin/videos
Paginated video list

#### POST /api/admin/videos/bulk-upload
**Request:** Array of video metadata objects
**Logic:**
1. Validate all metadata
2. Create video records
3. Return created IDs

#### POST /api/admin/videos/:id/upload-file
Presigned URL for S3 upload

#### DELETE /api/admin/videos/:id
Soft delete video

---

## 3. THIRD-PARTY INTEGRATIONS

### 3.1 Stripe

**Required:**
- Account with Products/Prices set up
- Webhook endpoint configured
- Customer portal enabled

**Environment Variables:**
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
STRIPE_PRICE_LIFETIME=price_...
```

### 3.2 SendGrid/Mailgun

**Email Templates Needed:**
1. Email Verification (with 6-digit code)
2. Password Reset (with link)
3. Welcome Email
4. Subscription Confirmation
5. Download Limit Warning (at 80%)
6. Payment Failed Notification

**Environment Variables:**
```
SENDGRID_API_KEY=SG.xxx...
FROM_EMAIL=noreply@thevideopool.com
```

### 3.3 S3/Wasabi

**Buckets Needed:**
- `tvp-videos` - Video files
- `tvp-thumbnails` - Video thumbnails
- `tvp-user-uploads` - User avatars (future)

**Environment Variables:**
```
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=tvp-videos
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.wasabisys.com  # For Wasabi
```

### 3.4 Google OAuth (Optional)

**Environment Variables:**
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 4. SECURITY REQUIREMENTS

### 4.1 Authentication
- JWT tokens with 24-hour expiry
- Refresh tokens with 30-day expiry
- Password hashing: bcrypt (cost=12)
- Rate limiting: 100 req/min per IP
- Login: 5 attempts then 15-minute lockout

### 4.2 API Security
- CORS: Only allow frontend domain
- HTTPS only
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitize output)

### 4.3 File Security
- Signed URLs for downloads (1 hour expiry)
- No direct bucket access
- Validate file types on upload

---

## 5. CACHING STRATEGY

### Redis Keys:
- `user:{id}` - User session data (TTL: 1 hour)
- `videos:featured` - Featured videos list (TTL: 5 min)
- `videos:genre:{genre}` - Genre video lists (TTL: 10 min)
- `search:{hash}` - Search results (TTL: 5 min)
- `recommendations:{userId}` - User recommendations (TTL: 1 hour)

---

## 6. MONITORING & ANALYTICS

### Endpoints to Add:

#### POST /api/analytics/event
Track user events for BI dashboard:
```json
{
  "event": "download",
  "videoId": 123,
  "quality": "1080p",
  "sessionId": "abc..."
}
```

Events to track:
- `page_view` - Page visits
- `search` - Search queries
- `preview` - Video previews
- `download` - Downloads
- `add_to_set` - Set builder usage
- `share_set` - Set sharing
- `signup` - Registration
- `subscription_start` - New subscription
- `subscription_cancel` - Cancellation

---

## 7. IMPLEMENTATION PRIORITY

### Phase 1 (Week 1) - Core
1. Database schema setup
2. User authentication (register, login, JWT)
3. Email verification
4. Basic video CRUD
5. Video search and filtering

### Phase 2 (Week 2) - Payments & Downloads
1. Stripe integration
2. Membership management
3. Download tracking & limits
4. Signed URL generation
5. Webhook handling

### Phase 3 (Week 3) - Features
1. User sets (playlists)
2. Set sharing
3. Favorites
4. 2FA implementation
5. Password reset

### Phase 4 (Week 4) - Admin & Polish
1. Admin endpoints
2. Bulk upload
3. Analytics events
4. Rate limiting
5. Security hardening

---

## 8. TESTING REQUIREMENTS

### Unit Tests
- All service functions
- Authentication flows
- Payment processing

### Integration Tests
- API endpoints
- Database operations
- External services (mock)

### Load Testing
- 1000 concurrent users
- 10,000 requests/minute
- Download bandwidth

---

## 9. DEPLOYMENT

### Environment Variables Summary:
```env
# Server
NODE_ENV=production
PORT=3001
API_URL=https://api.thevideopool.com

# Database
DATABASE_URL=postgres://user:pass@host:5432/tvp

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=30d

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG.xxx...
FROM_EMAIL=noreply@thevideopool.com

# Storage
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=tvp-videos
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.wasabisys.com

# Redis
REDIS_URL=redis://localhost:6379

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 10. CURRENT MOCK SERVER REFERENCE

The mock server at `mock-server/server.js` demonstrates all endpoint behaviors. Use it as a reference for expected request/response formats.

**Run mock server:**
```bash
cd mock-server
npm install
npm start
# Server runs on http://localhost:3001
```

---

## CONTACT

- Frontend: [Your Name] - Questions about API contracts
- Steve (Backend): Implementation owner

Last Updated: January 27, 2026
