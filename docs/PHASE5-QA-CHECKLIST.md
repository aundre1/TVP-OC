# Phase 5 QA Test Checklist

**Dev Server:** http://localhost:3001
**Build Status:** Passing (433KB bundle)
**Date:** 2026-01-18

---

## 1. Authentication & Login

### Landing Page (`/welcome`)
- [ ] Landing page loads for unauthenticated users
- [ ] Hero section displays correctly
- [ ] "Start Free Trial" button navigates to `/register`
- [ ] "Sign In" button navigates to `/login`
- [ ] Feature highlights are visible
- [ ] Pricing section shows correct PRD prices:
  - Free Trial: $0 (2 downloads/mo, 6-month trial)
  - Monthly: $34.99 (200 downloads)
  - Quarterly: $99.99 (300 downloads)
  - Annual: $299.99 (400 downloads)

### Login Page (`/login`)
- [ ] Login form renders
- [ ] Username/password fields accept input
- [ ] Form validation shows errors for empty fields
- [ ] "Forgot Password" link works
- [ ] "Sign Up" link navigates to `/register`
- [ ] **Google OAuth button displays** (new in Phase 5)
- [ ] Google OAuth button has correct styling
- [ ] Mock login succeeds with test credentials

### Registration Page (`/register`)
- [ ] Registration form renders
- [ ] Email, username, password fields work
- [ ] Password confirmation validation
- [ ] "Sign In" link works
- [ ] Google OAuth option available

---

## 2. Subscription & Billing

### Membership Page (`/membership`)
- [ ] Page loads for authenticated users
- [ ] **Two tiers display: Free Trial and Video Pool Pro**
- [ ] Correct prices shown:
  - Free Trial: $0/mo, 2 downloads
  - Pro Monthly: $34.99, 200 downloads
  - Pro Quarterly: $99.99 (~$33/mo), 300 downloads
  - Pro Annual: $299.99 (~$25/mo), 400 downloads
- [ ] Billing interval toggle (Monthly/Quarterly/Annual)
- [ ] "Popular" badge on Pro tier
- [ ] Feature lists display for each tier
- [ ] CTA buttons work

### Download Counter (Header)
- [ ] **DownloadCounter component visible in header**
- [ ] Shows current download count (e.g., "45 / 200")
- [ ] Dropdown menu on click
- [ ] Shows tier name and reset date
- [ ] "Upgrade" button for free users
- [ ] Unlimited display for unlimited tiers

### Free Trial Banner
- [ ] **FreeTrialBanner shows for trial users**
- [ ] Shows days remaining in trial
- [ ] "Upgrade Now" CTA works
- [ ] Dismissible (x button)

### Trial Expired Modal
- [ ] Modal appears when trial expires (test by manipulating mock data)
- [ ] Shows expiration message
- [ ] "Choose a Plan" button navigates to membership

### Download Limit Modal
- [ ] Modal appears when download limit reached
- [ ] Shows current usage (e.g., "200/200 downloads used")
- [ ] Displays upgrade options
- [ ] "Upgrade" button works

---

## 3. AI Search (New Feature)

### AI Search Hero (`/home`)
- [ ] **AISearchHero section visible on homepage**
- [ ] "AI-Powered Search" badge displays
- [ ] Large search input with sparkles icon
- [ ] Placeholder text shows example query
- [ ] Example dropdown appears on focus
- [ ] Quick filter chips work (Trending, New Releases, etc.)

### AI Search Input
- [ ] Input accepts natural language queries
- [ ] Real-time parsing preview shows below input
- [ ] Shows interpreted filters (Genre, BPM, etc.)
- [ ] Confidence indicator (high/medium/low)
- [ ] Enter key triggers search
- [ ] Search button navigates to `/search` with params

### Search Page (`/search`)
- [ ] `?ai=1` parameter accepted
- [ ] Filters pre-populated from AI query
- [ ] Results display correctly
- [ ] Traditional filter panel still works

---

## 4. Set Builder & Sharing (New Feature)

### Set Builder Panel
- [ ] Opens from header button
- [ ] Shows track count and duration
- [ ] **Editable set name (click to edit)**
- [ ] Empty state shows instructions
- [ ] Tracks can be added via "S" hotkey
- [ ] Drag-to-reorder works
- [ ] Remove track button works
- [ ] Recommendations section shows AI suggestions
- [ ] Clear button clears all tracks
- [ ] Download Set button triggers toast

### Share Set Modal
- [ ] **Share button visible when tracks exist**
- [ ] Modal opens on click
- [ ] Set preview shows name, track count, duration
- [ ] Track list preview (first 3 tracks)
- [ ] Public/Private toggle
- [ ] Share link generated
- [ ] Copy button copies to clipboard
- [ ] "Copied!" confirmation
- [ ] Social share buttons:
  - [ ] Twitter opens share dialog
  - [ ] Facebook opens share dialog
  - [ ] WhatsApp opens share dialog
  - [ ] Email opens mailto
- [ ] QR code toggle works

### Shared Set Page (`/set/:shareId`)
- [ ] **Page loads without authentication**
- [ ] Set name and description display
- [ ] Creator info shows
- [ ] Track count, duration, view count display
- [ ] Full track list renders
- [ ] Play button on hover previews track
- [ ] "Copy to My Set" button:
  - [ ] Prompts login for unauthenticated users
  - [ ] Copies tracks for authenticated users
- [ ] Like button toggles
- [ ] Share button copies link
- [ ] CTA for non-authenticated users visible

---

## 5. Core Functionality

### Homepage (`/home`)
- [ ] RecentSection displays
- [ ] DraggableSections render (Trending, Latest, For You, etc.)
- [ ] Sections can be collapsed
- [ ] Sections can be reordered via drag
- [ ] View mode toggle (grid/list) works
- [ ] Genre filter works

### Video Cards
- [ ] Thumbnail displays
- [ ] Title and artist visible
- [ ] BPM and key badges
- [ ] Hover preview works
- [ ] Click opens preview modal
- [ ] "Add to Set" button works

### Preview Modal
- [ ] Opens on video card click
- [ ] Video info displays
- [ ] Play/pause controls
- [ ] Download buttons work
- [ ] Add to Set button works
- [ ] Close button/escape key works

### Layout
- [ ] Header sticky at top
- [ ] GenreNav sidebar shows
- [ ] Set Builder panel slides in/out
- [ ] Request Panel opens
- [ ] Mobile responsive (test at 375px width)

---

## 6. Navigation & Routing

- [ ] `/` redirects based on auth status
- [ ] `/welcome` shows landing (unauth only)
- [ ] `/home` requires auth
- [ ] `/login` redirects to home if already logged in
- [ ] `/register` redirects to home if already logged in
- [ ] `/set/:shareId` works without auth
- [ ] `/membership` requires auth
- [ ] `/library` requires auth
- [ ] `/settings` requires auth
- [ ] 404 redirects to welcome

---

## 7. Performance

- [ ] Initial page load < 3s
- [ ] Bundle size < 500KB (current: 433KB)
- [ ] Virtualized list scrolls smoothly (30k videos)
- [ ] No console errors
- [ ] No TypeScript errors in build

---

## Test Credentials (Mock Mode)

```
Username: dev@thevideopool.com
Password: (any password works in mock mode)
```

---

## Known Issues / Notes

1. Mock mode enabled (`DEV_CONFIG.useMockAuth = true`)
2. Stripe checkout returns mock URLs
3. Google OAuth requires real client ID for production
4. Download URLs are placeholders
5. QR code shows placeholder icon (needs QR library)

---

## Sign-off

| Tester | Date | Status |
|--------|------|--------|
| | | |
