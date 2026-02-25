# TVP API Audit — Frontend → Backend Route Mapping

Generated: 2026-02-24

## Auth API (`src/api/auth.ts`)

| Frontend Call | Backend Route | Status |
|---|---|---|
| `POST /auth/login` | `POST /api/auth/login` | ✅ Matched |
| `POST /auth/google` | `POST /api/auth/google` | ✅ Matched |
| `POST /auth/login/2fa` | `POST /api/auth/login/2fa` | ✅ Matched |
| `POST /auth/register` | `POST /api/auth/register` | ✅ Matched |
| `POST /auth/logout` | `POST /api/auth/logout` | ✅ Matched |
| `GET /auth/me` | `GET /api/auth/me` | ✅ Matched |
| `POST /auth/verify-email` | `POST /api/auth/verify-email` | ✅ Matched |
| `POST /auth/verify-email-code` | `POST /api/auth/verify-email-code` | ✅ Matched |
| `POST /auth/resend-verification` | `POST /api/auth/resend-verification` | ✅ Matched |
| `GET /auth/verification-status` | `GET /api/auth/verification-status` | ✅ Matched |
| `POST /auth/forgot-password` | `POST /api/auth/forgot-password` | ✅ Matched |
| `POST /auth/validate-reset-token` | `POST /api/auth/validate-reset-token` | ✅ Matched |
| `POST /auth/reset-password` | `POST /api/auth/reset-password` | ✅ Matched |
| `GET /auth/2fa/status` | `GET /api/auth/2fa/status` | ✅ Matched |
| `POST /auth/2fa/setup` | `POST /api/auth/2fa/setup` | ✅ Matched |
| `POST /auth/2fa/verify` | `POST /api/auth/2fa/verify` | ✅ Matched |
| `POST /auth/2fa/disable` | `POST /api/auth/2fa/disable` | ✅ Matched |
| `POST /auth/2fa/backup-codes/regenerate` | `POST /api/auth/2fa/backup-codes/regenerate` | ✅ Matched |

## Videos API (`src/api/videos.ts`)

| Frontend Call | Backend Route | Status |
|---|---|---|
| `GET /videos` | `GET /api/videos` | ✅ Matched |
| `GET /videos/featured` | `GET /api/videos/featured` | ✅ Matched (videos.js) |
| `GET /videos/:id` | `GET /api/videos/:id` | ✅ Matched |
| `GET /videos/related/:id` | `GET /api/videos/related/:id` | ✅ Matched |
| `GET /videos/recommended` | `GET /api/videos/recommended` | ✅ Matched |
| `GET /videos/:id/preview` | `GET /api/videos/:id/preview` | ❌ Missing — needs preview route |
| `GET /categories` | `GET /api/categories` | ❌ Missing — no categories route |
| `GET /categories/:id` | `GET /api/categories/:id` | ❌ Missing — no categories route |

## Videos Browse API (`src/api/videosApi.ts`)

| Frontend Call | Backend Route | Status |
|---|---|---|
| `GET /api/videos/browse` | `GET /api/videos/browse` | ❌ Missing — needs browse endpoint |
| `GET /api/videos/genres` | `GET /api/genres` | ⚠️ Path mismatch — frontend calls `/api/videos/genres`, backend has `/api/genres` |
| `GET /api/videos/:id` | `GET /api/videos/:id` | ✅ Matched |
| `POST /api/videos/:id/favorite` | Toggle favorite | ⚠️ Path mismatch — frontend uses `/videos/:id/favorite`, backend uses `/favorites` |
| `POST /api/videos/:id/playlist/:playlistId` | Add to playlist | ⚠️ Path mismatch — different route structure |
| `POST /api/videos/:id/download` | Download initiation | ✅ Matched (videos.js has download) |
| `GET /api/user/downloads` | Download history | ⚠️ Path mismatch — frontend calls `/user/downloads`, backend has `/downloads/:userId` |
| `PUT /api/videos/:id` | Update video | ✅ Matched (admin) |
| `GET /api/videos/search` | Search videos | ⚠️ Could use `/api/videos?search=` instead |

## Downloads API (`src/api/downloads.ts`)

| Frontend Call | Backend Route | Status |
|---|---|---|
| `GET /memberships/can-download` | `GET /api/memberships/can-download` | ✅ Matched (memberships.js) |
| `GET /memberships/status` | `GET /api/memberships/status` | ✅ Matched |
| `POST /videos/:id/download` | `POST /api/videos/:id/download` | ✅ Matched |
| `GET /videos/:id/download` | `GET /api/videos/:id/download` | ✅ Matched |
| `GET /user/downloads` | `GET /api/downloads/:userId` | ⚠️ Path mismatch |
| `GET /user/downloads/recent` | N/A | ❌ Missing |
| `GET /credits/packs` | N/A | ❌ Missing (future feature) |
| `GET /credits/balance` | N/A | ❌ Missing (future feature) |
| `POST /credits/purchase` | N/A | ❌ Missing (future feature) |

## Library API (`src/api/library.ts`)

| Frontend Call | Backend Route | Status |
|---|---|---|
| `GET /playlists` | `GET /api/playlists/:userId` | ⚠️ Frontend doesn't pass userId in URL |
| `GET /playlists/:id` | `GET /api/playlists/detail/:id` | ⚠️ Slight path difference |
| `POST /playlists` | `POST /api/playlists` | ✅ Matched |
| `PUT /playlists/:id` | `PATCH /api/playlists/:id` | ⚠️ PUT vs PATCH |
| `DELETE /playlists/:id` | `DELETE /api/playlists/:id` | ✅ Matched |
| `POST /playlists/:id/videos` | `POST /api/playlists/:id/videos` | ✅ Matched |
| `DELETE /playlists/:id/videos/:videoId` | `DELETE /api/playlists/:id/videos/:videoId` | ✅ Matched |
| `PUT /playlists/:id/reorder` | N/A | ❌ Missing — reorder endpoint |
| `GET /shared-playlist/:token` | N/A | ❌ Missing — shared playlist |
| `GET /watch-history` | N/A | ❌ Missing — watch history (future) |
| `GET /favorites` | `GET /api/favorites/:userId` | ⚠️ Frontend doesn't pass userId |
| `POST /favorites/:videoId` | `POST /api/favorites` | ⚠️ Different body structure |
| `DELETE /favorites/:videoId` | `DELETE /api/favorites/:userId/:videoId` | ⚠️ Path difference |
| `GET /favorites/check/:videoId` | `GET /api/favorites/:userId/:videoId/check` | ⚠️ Path difference |

## Subscriptions API (`src/api/subscriptions.ts`)

| Frontend Call | Backend Route | Status |
|---|---|---|
| `GET /memberships` | `GET /api/memberships` | ✅ Matched |
| `GET /memberships/:id` | `GET /api/memberships/:id` | ✅ Matched |
| `GET /memberships/status` | `GET /api/memberships/status` | ✅ Matched |
| `POST /memberships/create-checkout` | `POST /api/memberships/create-checkout` | ✅ Matched |
| `POST /memberships/cancel` | `POST /api/memberships/cancel` | ✅ Matched |
| `POST /billing/subscription/resume` | N/A | ❌ Missing (future) |
| `POST /billing/subscription/change` | N/A | ❌ Missing (future) |
| `GET /billing/history` | N/A | ❌ Missing (future) |
| `GET /billing/upcoming` | N/A | ❌ Missing (future) |
| `GET /billing/subscription` | N/A | ❌ Missing (future) |
| `POST /billing/portal` | N/A | ❌ Missing (future) |
| `GET /billing/payment-methods` | N/A | ❌ Missing (future) |

## Genres API

| Frontend Call | Backend Route | Status |
|---|---|---|
| `GET /api/genres` | `GET /api/genres` | ✅ Matched (NEW) |
| `POST /api/genres/classify` | `POST /api/genres/classify` | ✅ Matched (NEW) |
| `POST /api/genres/reclassify-batch` | `POST /api/genres/reclassify-batch` | ✅ Matched (NEW) |

## Health

| Frontend Call | Backend Route | Status |
|---|---|---|
| `GET /api/health` | `GET /api/health` | ✅ Matched (NEW) |
| `GET /health` | `GET /health` | ✅ Matched (existing) |

## Summary

- **✅ Matched:** ~35 endpoints
- **⚠️ Path mismatches:** ~10 (frontend/backend use slightly different URL patterns)
- **❌ Missing:** ~12 (mostly future features: billing, credits, watch history, categories)

### Key Path Mismatches to Address in Phase 2
1. **Favorites/Library:** Frontend uses auth context (no userId in URL), backend expects userId in URL — need auth middleware to extract userId from JWT
2. **Videos browse:** Frontend expects `/api/videos/browse`, needs dedicated browse endpoint
3. **Genres path:** Frontend `videosApi.ts` calls `/api/videos/genres`, but genres are at `/api/genres`
4. **Download history:** Frontend calls `/user/downloads`, backend uses `/downloads/:userId`

These will be resolved when auth middleware is connected in Phase 2.
