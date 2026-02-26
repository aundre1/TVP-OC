# The Video Pool - Claude Code Configuration

## Project Overview
Professional DJ video platform with 30,000+ music videos. React + TypeScript + Vite + TailwindCSS.

## Auto-GSD Configuration

### Project State Detection
When starting a conversation, Claude should automatically:
1. Check for `.planning/` folder and its contents
2. Look for `PLAN.md`, `ROADMAP.md`, `PROJECT.md`
3. Check `.continue-here.md` for session continuity
4. Suggest the most appropriate GSD action

### Quick Commands
- **`/go`** or **`/auto`** - Auto-detect and run the right GSD command
- **`/status`** - Quick project status (alias for `/gsd:progress`)
- **`/next`** - What should I work on next?

### State → Action Mapping
| Project State | Auto-Action |
|--------------|-------------|
| No `.planning/` folder | Suggest `/gsd:new-project` |
| Has `PROJECT.md`, no `ROADMAP.md` | Suggest `/gsd:create-roadmap` |
| Has roadmap, current phase not started | Suggest `/gsd:plan-phase` |
| Has `PLAN.md` for current phase | Suggest `/gsd:execute-plan` |
| Mid-phase with `.continue-here.md` | Suggest `/gsd:resume-work` |
| Phase complete, needs verification | Suggest `/gsd:verify-work` |
| All phases complete | Suggest `/gsd:complete-milestone` |

### Current Project Context

- **Brand Color**: Cyan (#00d4ff)
- **Owner**: Aundre Oldacre (took over from Steve)
- **Design Council**: UX decisions voted on by council (Spotify, YouTube, Apple Music, Serato, Beatport, Tidal, Billboard)
- **Mobile Note**: Requires react-window for 30K+ video virtualization

### Deployment Status (Updated Feb 25, 2026)

**Current Phase**: ✅ LIVE — Pre-launch cleanup

| URL | Purpose | Status |
|-----|---------|--------|
| https://dev.thevideopool.com | Primary dev/test URL | ✅ LIVE (15/15 checks green) |
| https://tvp-redesign-2026.vercel.app | Vercel alias | ✅ LIVE |
| https://tvp-oc-production.up.railway.app | Backend API (Railway) | ✅ LIVE |
| www.thevideopool.com | Steve's production — DO NOT TOUCH | 🔴 OFF LIMITS |

**All blockers resolved** — 26,043 videos, Wasabi downloads, Stripe checkout, auth, admin all functional.

**Post-launch cleanup**:
- [x] Register Stripe webhook URL in Stripe dashboard ✅ (we_1T4ldB2xxXTR95tlGaSnPOJE)
- [x] Change admin password from default ✅ (rotated Feb 25)
- [x] Set `VITE_GOOGLE_CLIENT_ID` on Vercel for Google OAuth ✅ (+ GOOGLE_CLIENT_ID on Railway)
- [x] Add `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` on Railway for live SMS ✅

**Verification script**: `python3 scripts/verify-deployment.py --env dev`

**Documentation**:
- `MASTER_HANDOVER.md` - Single source of truth for all systems
- `scripts/verify-deployment.py` - 15-check post-deploy test suite

### Coding Standards
- Preserve version files (don't overwrite previous versions)
- Use `@/` path aliases for imports
- TailwindCSS with custom `tvp-` prefixed classes
- Zustand for state management
- Toast notifications: minimal pill style (bottom center)

### Files to Check on Start
1. `.continue-here.md` - Session continuity
2. `.planning/ROADMAP.md` - Overall progress
3. `.planning/phases/` - Current phase plans
4. `package.json` - Dependencies status

## Session Continuity
When resuming work:
1. Read `.continue-here.md` for last session state
2. Check git status for uncommitted work
3. Review any TODO comments in recently modified files
4. Pick up where we left off
