# TVP Operations Report

**Date:** 2026-02-24
**Commit:** feat: phone registration, coupon system, support tickets, marketing blasts, dunning, content queue

---

## Files Created

### Database Migrations
- `server/src/db/migrations/004_phone_sms.sql` — Phone + SMS opt-in columns on users
- `server/src/db/migrations/005_coupons.sql` — Coupons + coupon_redemptions tables
- `server/src/db/migrations/006_support_tickets.sql` — Support tickets table
- `server/src/db/migrations/007_marketing.sql` — Marketing blasts + SMS sends tables
- `server/src/db/migrations/008_dunning.sql` — Dunning attempts table
- `server/src/db/migrations/009_content_queue.sql` — Content upload queue table

### Backend Routes
- `server/src/routes/coupons.js` — CRUD for coupons (admin), validate/apply (public/auth)
- `server/src/routes/support.js` — Ticket CRUD with auto-routing (song_request→Glenn, bugs/billing→admin)
- `server/src/routes/marketing.js` — Email/SMS blast drafts (admin), history
- `server/src/routes/content-queue.js` — Glenn's upload queue with approve/reject

### Backend Services
- `server/src/services/dunningService.js` — Failed payment recovery: Day 0/3/7 emails, Day 8 downgrade
- `server/src/services/healthService.js` — Detailed health endpoint (DB, memory, uptime)

### Frontend API Clients
- `src/api/coupons.ts` — Coupon API calls
- `src/api/support.ts` — Support ticket API calls
- `src/api/marketing.ts` — Marketing blast API calls

### Frontend Components
- `src/components/admin/AdminCoupons.tsx` — Coupon management table + create form
- `src/components/admin/AdminSupport.tsx` — Ticket list with filters, expand/respond, color-coded categories
- `src/components/admin/AdminMarketing.tsx` — Email/SMS compose, segment selector, history table
- `src/components/SongRequestForm.tsx` — User-facing song request (Artist, Title, Notes → support ticket)

---

## Files Modified

- `server/src/routes/auth.js` — Added `phone` (required, E.164) + `smsOptIn` to registration
- `server/src/routes/webhooks.js` — Wired `invoice.payment_failed` → dunning service
- `server/src/index.js` — Mounted coupons, support, marketing, content-queue routes + `/api/health/detailed`
- `server/src/services/emailService.js` — Exported `sendEmail` for use by support/dunning services
- `src/pages/RegisterPage.tsx` — Added phone input, SMS opt-in checkbox, E.164 validation
- `src/pages/AdminPage.tsx` — Added Coupons, Support, Marketing tabs
- `src/components/Navigation/Sidebar.tsx` — Added "Request a Track" button with modal
- `src/types/index.ts` — Added `phone` + `smsOptIn` to RegisterData interface

---

## Route Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/admin/coupons | Admin | Create coupon |
| GET | /api/admin/coupons | Admin | List coupons |
| DELETE | /api/admin/coupons/:id | Admin | Delete coupon |
| POST | /api/coupons/validate | Public | Validate coupon code |
| POST | /api/coupons/apply | Auth | Apply coupon to plan |
| POST | /api/support/tickets | Auth | Create support ticket |
| GET | /api/support/tickets | Auth | User's own tickets |
| GET | /api/admin/support/tickets | Admin | All tickets (filterable) |
| PATCH | /api/admin/support/tickets/:id | Admin | Update ticket status/response |
| POST | /api/admin/marketing/email | Admin | Create email blast |
| POST | /api/admin/marketing/sms | Admin | Create SMS blast |
| GET | /api/admin/marketing/history | Admin | Blast history |
| POST | /api/content/upload | Editor | Upload to content queue |
| GET | /api/admin/content/queue | Admin | View content queue |
| PATCH | /api/admin/content/queue/:id/approve | Admin | Approve content |
| PATCH | /api/admin/content/queue/:id/reject | Admin | Reject content |
| GET | /api/health/detailed | Admin | Detailed health metrics |

---

## Notes
- Marketing email/SMS sending is **stubbed** — saves to DB but doesn't actually send. Wire SendGrid/Twilio when ready.
- Dunning emails use the existing SendGrid `sendEmail` function (works if SENDGRID_API_KEY is set).
- SMS monthly limit (max 2/user/month) is enforced via `sms_sends` table queries.
- Migrations need to be run against the database before these features go live.
