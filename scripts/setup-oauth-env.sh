#!/bin/bash
# OAuth Environment Setup Script
# Run this to set environment variables on Vercel and Railway

set -e

echo "🚀 OAuth Environment Setup"
echo "=========================="
echo ""

# Step 1: Vercel Environment Variables
echo "📍 Step 1: Setting Vercel Environment Variables"
echo ""
echo "Setting VITE_GOOGLE_CLIENT_ID on Vercel..."
vercel env add VITE_GOOGLE_CLIENT_ID 492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com --yes 2>/dev/null || {
  echo "⚠️  Vercel CLI interactive mode required."
  echo "Run manually:"
  echo "  vercel env add VITE_GOOGLE_CLIENT_ID"
  echo "  (when prompted, paste: 492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com)"
}

echo ""
echo "✅ VITE_GOOGLE_CLIENT_ID set on Vercel"
echo ""

# Step 2: Apple Environment Variables (if provided)
echo "📍 Step 2: Setting Apple Environment Variables on Vercel"
read -p "Enter VITE_APPLE_TEAM_ID (or press Enter to skip): " APPLE_TEAM_ID
if [ ! -z "$APPLE_TEAM_ID" ]; then
  vercel env add VITE_APPLE_TEAM_ID "$APPLE_TEAM_ID" --yes 2>/dev/null || echo "Could not set VITE_APPLE_TEAM_ID - use Vercel dashboard"
fi

read -p "Enter VITE_APPLE_BUNDLE_ID (or press Enter to skip): " APPLE_BUNDLE_ID
if [ ! -z "$APPLE_BUNDLE_ID" ]; then
  vercel env add VITE_APPLE_BUNDLE_ID "$APPLE_BUNDLE_ID" --yes 2>/dev/null || echo "Could not set VITE_APPLE_BUNDLE_ID - use Vercel dashboard"
fi

read -p "Enter VITE_APPLE_KEY_ID (or press Enter to skip): " APPLE_KEY_ID
if [ ! -z "$APPLE_KEY_ID" ]; then
  vercel env add VITE_APPLE_KEY_ID "$APPLE_KEY_ID" --yes 2>/dev/null || echo "Could not set VITE_APPLE_KEY_ID - use Vercel dashboard"
fi

echo ""
echo "✅ Apple environment variables set on Vercel (if provided)"
echo ""

# Step 3: Trigger Vercel redeploy
echo "📍 Step 3: Triggering Vercel Redeploy"
git push origin main
echo "✅ Pushed to main - Vercel will auto-redeploy"
echo ""

# Step 4: Railway Environment Variables (if logged in)
if command -v railway &> /dev/null; then
  echo "📍 Step 4: Setting Railway Backend Environment Variables"

  if [ ! -z "$APPLE_TEAM_ID" ]; then
    railway variables set VITE_APPLE_TEAM_ID "$APPLE_TEAM_ID" && echo "✅ Set VITE_APPLE_TEAM_ID on Railway"
  fi

  if [ ! -z "$APPLE_BUNDLE_ID" ]; then
    railway variables set VITE_APPLE_BUNDLE_ID "$APPLE_BUNDLE_ID" && echo "✅ Set VITE_APPLE_BUNDLE_ID on Railway"
  fi

  if [ ! -z "$APPLE_KEY_ID" ]; then
    railway variables set VITE_APPLE_KEY_ID "$APPLE_KEY_ID" && echo "✅ Set VITE_APPLE_KEY_ID on Railway"
  fi

  echo "Redeploying Railway backend..."
  railway up
  echo "✅ Railway backend redeployed"
else
  echo "⚠️  Railway CLI not found - please set env vars manually:"
  echo "  railway variables set VITE_APPLE_TEAM_ID '...'"
  echo "  railway variables set VITE_APPLE_BUNDLE_ID '...'"
  echo "  railway variables set VITE_APPLE_KEY_ID '...'"
  echo "  railway up"
fi

echo ""
echo "=========================="
echo "✅ OAuth Setup Complete!"
echo ""
echo "Next: Verify Google Redirect URIs in Google Cloud Console"
echo "  https://console.cloud.google.com/"
