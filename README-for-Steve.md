# The Video Pool v5.5 - Developer Package

## Quick Start

### View the HTML Preview (No Setup Required)
Open `index-v5.5-pro.html` directly in your browser to see the complete UI design.

### Run the Full React App

```bash
# 1. Install dependencies
npm install

# 2. Start development server (frontend only)
npm run dev

# 3. Or start with mock backend
npm run dev:full
```

Then open http://localhost:5173

---

## Package Contents

| File/Folder | Description |
|-------------|-------------|
| `index-v5.5-pro.html` | **Main preview** - Complete UI with all features |
| `landing-preview.html` | Public landing page preview |
| `src/` | React components, hooks, stores, pages |
| `mock-server/` | JSON Server mock API for development |
| `server/` | Production Node.js/Express backend |
| `docs/` | API specs and documentation |

---

## Key Features in v5.5

- Quality color system (4K=Gold, 1080p=Cyan, 720p=Olive, etc.)
- Drag-drop section reordering
- Search autocomplete
- Set Builder panel
- Download quality selection
- Membership/subscription system
- Admin dashboard
- Toast notifications (pill style)

---

## Mock Server

The mock server provides realistic API responses for development:

```bash
npm run server
# Runs on http://localhost:5000
```

**Endpoints:**
- `POST /api/auth/login` - Authentication
- `GET /api/videos` - List videos (with filters)
- `POST /api/videos/:id/download` - Download video
- `GET /api/memberships` - Membership tiers
- `GET /api/user/downloads` - Download history

See `docs/BACKEND-API-SPEC.md` for full API documentation.

---

## Production Backend

The `server/` folder contains the production backend structure:

```
server/
  src/
    routes/      - API route handlers
    services/    - Business logic (auth, video, download, S3)
    db/          - Database schema and migrations
    middleware/  - Auth, error handling
  .env.example   - Environment variables template
```

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - For authentication
- `STRIPE_SECRET_KEY` - For payments
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` - For S3 video storage
- `SENDGRID_API_KEY` - For email notifications

---

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Zustand (state management)
- React Query (data fetching)
- @dnd-kit (drag and drop)

**Backend:**
- Node.js + Express
- PostgreSQL
- Stripe (payments)
- AWS S3 (video storage)
- SendGrid (email)

---

## Contact

Questions? Reach out to the development team.
