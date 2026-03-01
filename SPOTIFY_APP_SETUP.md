# Spotify Developer App Setup — The Video Pool

## What Was Built

A Playwright automation script that creates the Spotify Developer app for The Video Pool.

**Why it's not fully autonomous:** Spotify's login page uses CAPTCHA and bot-detection that blocks headless automation. The script opens a headed (visible) browser, pauses for you to log in manually, then automates all remaining steps.

---

## How to Run

```bash
cd /Users/dremacmini/Desktop/OC/the-video-pool
./scripts/spotify/run-spotify-setup.sh
```

Or directly:

```bash
cd /Users/dremacmini/Desktop/OC/the-video-pool
npx tsx scripts/spotify/create-spotify-app.ts
```

---

## What the Script Does

1. Opens https://developer.spotify.com/dashboard in a headed Chrome window
2. Pauses and waits up to 2 minutes for you to log in
3. Once dashboard is detected, takes over automatically:
   - Clicks "Create app"
   - Fills App Name: "The Video Pool"
   - Fills Description: "Professional video streaming platform with 30,000+ music videos and DJ integration"
   - Adds Redirect URIs:
     - https://thevideopool.com/api/auth/spotify/callback
     - https://dev.thevideopool.com/api/auth/spotify/callback
   - Accepts Terms of Service
   - Submits the form
4. Navigates to Settings
5. Clicks "View client secret" to reveal the secret
6. Extracts Client ID and Client Secret
7. Saves credentials to `test-results/spotify/spotify-credentials.json`
8. Prints credentials to terminal

---

## Screenshots Saved

All screenshots go to `test-results/spotify/`:

| File | What It Shows |
|------|--------------|
| `01-dashboard-logged-in.png` | Dashboard after login |
| `02-create-app-form.png` | Create app form |
| `03-form-filled.png` | Form filled with TVP details |
| `04-tos-accepted.png` | Terms accepted, ready to submit |
| `05-app-created.png` | App created confirmation |
| `06-settings-page.png` | Settings tab |
| `07-credentials-revealed.png` | Client ID + Client Secret visible |
| `08-settings-saved.png` | Redirect URIs saved |
| `09-final-settings.png` | Final state |

---

## After Getting Credentials

### Add to Vercel (Frontend)

1. Go to https://vercel.com/aora-developments-projects/tvp-redesign-2026/settings/environment-variables
2. Add: `VITE_SPOTIFY_CLIENT_ID` = your Client ID
3. Redeploy frontend

### Add to Railway (Backend)

1. Go to https://railway.app → TVP backend service → Variables
2. Add: `SPOTIFY_CLIENT_ID` = your Client ID
3. Add: `SPOTIFY_CLIENT_SECRET` = your Client Secret
4. Redeploy backend

---

## Files Created

- `/Users/dremacmini/Desktop/OC/the-video-pool/scripts/spotify/create-spotify-app.ts` — Main automation script
- `/Users/dremacmini/Desktop/OC/the-video-pool/scripts/spotify/run-spotify-setup.sh` — Shell runner
- `/Users/dremacmini/Desktop/OC/the-video-pool/SPOTIFY_APP_SETUP.md` — This guide
- `test-results/spotify/` — Screenshots and extracted credentials (gitignored)
