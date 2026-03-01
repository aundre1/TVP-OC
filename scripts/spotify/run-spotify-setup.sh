#!/usr/bin/env bash
# ============================================================
# THE VIDEO POOL — Spotify App Creation Runner
# ============================================================
# Run this script to create a Spotify Developer app for TVP.
#
# Prerequisites:
#   - Node.js and npx installed
#   - Playwright installed (npx playwright install chromium)
#   - A Spotify account with developer access
#
# Usage:
#   chmod +x scripts/spotify/run-spotify-setup.sh
#   ./scripts/spotify/run-spotify-setup.sh
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "============================================================"
echo " THE VIDEO POOL — Spotify Developer App Setup"
echo "============================================================"
echo ""
echo " App Name:    The Video Pool"
echo " Project:     $PROJECT_ROOT"
echo "============================================================"
echo ""

# Check Node is available
if ! command -v node &>/dev/null; then
  echo "[ERROR] Node.js is required but not found. Install from https://nodejs.org"
  exit 1
fi

# Check Playwright is installed
if ! npx playwright --version &>/dev/null 2>&1; then
  echo "[INFO] Installing Playwright..."
  cd "$PROJECT_ROOT" && npx playwright install chromium
fi

# Check tsx is available for running TypeScript directly
if npx tsx --version &>/dev/null 2>&1; then
  RUNNER="npx tsx"
elif npx ts-node --version &>/dev/null 2>&1; then
  RUNNER="npx ts-node"
else
  echo "[INFO] Installing tsx for TypeScript execution..."
  npm install -g tsx
  RUNNER="npx tsx"
fi

echo "[INFO] Running Spotify app creation script..."
echo "[INFO] A browser window will open. Log in to Spotify when prompted."
echo ""

cd "$PROJECT_ROOT"
$RUNNER scripts/spotify/create-spotify-app.ts

echo ""
echo "[DONE] Spotify app creation complete."
echo "[INFO] Check test-results/spotify/ for screenshots and credentials."
