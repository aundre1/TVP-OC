# The Video Pool — Project Root

**Status:** Deployed
**Type:** Video Discovery & Curation Platform
**Framework:** Vite 7.3
**Deployment:** Vercel (frontend) + Railway (backend)

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test:unit
```

---

## Project Structure

```
video-pool/
├── src/                    ← Application code
├── public/                 ← Static assets
├── package.json            ← Dependencies and scripts
├── vite.config.ts          ← Vite configuration
└── README.md               ← This file
```

---

## Key Features

✅ Video discovery and curation
✅ User dashboard
✅ Staging environment deployed

---

## Deployment

**Environments:**
- **Local:** `localhost:5173`
- **Staging:** `staging.thevideopool.com` (live)
- **Test:** `test.thevideopool.com` (setup pending)
- **Production:** `thevideopool.com` (ready for Patch Tuesday)

**Next Patch Tuesday:** March 11, 2026 @ 2:00 AM EST

---

## Automation

The project is managed by the **Video Pool Product Manager Agent**:

```bash
# Health check
bash ../../infrastructure/scripts/agent-video-pool.sh heartbeat

# Version scan
bash ../../infrastructure/scripts/agent-video-pool.sh scan

# Build test
bash ../../infrastructure/scripts/agent-video-pool.sh build-test

# QA announcement
bash ../../infrastructure/scripts/agent-video-pool.sh qa-announce

# Deploy to production
bash ../../infrastructure/scripts/agent-video-pool.sh deploy-patch-tuesday

# Status check
bash ../../infrastructure/scripts/agent-video-pool.sh status
```

---

## See Also

- [../memory/businesses/video-pool.md](../memory/businesses/video-pool.md) — Detailed business profile
- [../infrastructure/scripts/agent-video-pool.sh](../infrastructure/scripts/agent-video-pool.sh) — PM Agent
- [../CLAUDE.md](../CLAUDE.md) — System overview

