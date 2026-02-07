# The Video Pool - Professional DJ Video Platform

## Overview

The Video Pool is a professional DJ video platform built for browsing, previewing, and downloading high-quality music videos. The platform features full metadata support (BPM, key, genre, label), multi-version video edits, and quality tiers up to 4K. It includes user profiles with customizable layouts, favorites, playlists, and download tracking with subscription-based pricing tiers (Free, Starter, Pro, Elite).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming (dark/light mode support via next-themes)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for drag-and-drop reordering and transitions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js 5 on Node.js
- **API Pattern**: RESTful JSON API under `/api/*` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod for type-safe schema generation
- **Session Storage**: connect-pg-simple for PostgreSQL-backed sessions

### Data Layer
- **Database**: PostgreSQL (required via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` - shared between client and server
- **Tables**: videos, userProfiles, favorites, downloads, playlists, playlistVideos
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization

### Project Structure
```
├── client/src/          # React frontend application
│   ├── components/ui/   # shadcn/ui components
│   ├── pages/           # Route components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities and API client
├── server/              # Express backend
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database access layer
│   └── db.ts            # Drizzle database connection
├── shared/              # Shared types and schema
│   └── schema.ts        # Drizzle table definitions
└── migrations/          # Database migrations
```

### Development vs Production
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: Pre-built static files served from `dist/public`, bundled server in `dist/index.cjs`
- **Build Process**: Custom script using esbuild for server bundling and Vite for client

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries with PostgreSQL adapter

### Third-Party Services
- **MusicBrainz API**: Mentioned in attached assets for metadata lookup (not yet implemented in codebase)
- **Stripe**: Payment processing dependency present (integration details TBD)

### Key NPM Packages
- **UI**: @radix-ui/* primitives, framer-motion, lucide-react icons
- **Forms**: react-hook-form with @hookform/resolvers, zod validation
- **Data**: @tanstack/react-query, date-fns
- **Build**: Vite, esbuild, tsx for TypeScript execution