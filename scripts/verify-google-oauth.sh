#!/bin/bash

echo "GOOGLE OAUTH VERIFICATION"
echo "========================================"
echo ""

# 1. Check frontend env var
echo "1. FRONTEND (Vercel)"
echo "========================================"

if grep -q "VITE_GOOGLE_CLIENT_ID=" .env.local 2>/dev/null; then
  CLIENT_ID=$(grep "VITE_GOOGLE_CLIENT_ID=" .env.local | cut -d'=' -f2)
  if [ "$CLIENT_ID" = "local-test-client-id" ] || [ -z "$CLIENT_ID" ]; then
    echo "NOT SET: VITE_GOOGLE_CLIENT_ID"
    echo "Expected: 492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com"
  else
    echo "SET: VITE_GOOGLE_CLIENT_ID=$CLIENT_ID"
  fi
else
  echo "NOT SET: .env.local not found or VITE_GOOGLE_CLIENT_ID missing"
fi

echo ""

# 2. Check if GoogleOAuthProvider is in main.tsx
echo "2. FRONTEND CODE"
echo "========================================"

if grep -q "GoogleOAuthProvider" src/main.tsx; then
  echo "FOUND: GoogleOAuthProvider in main.tsx"
else
  echo "MISSING: GoogleOAuthProvider not found"
fi

if grep -q "hasValidGoogleClientId" src/main.tsx; then
  echo "FOUND: OAuth configuration check"
else
  echo "MISSING: OAuth configuration check"
fi

echo ""

# 3. Check backend route
echo "3. BACKEND API ROUTE"
echo "========================================"

if grep -q "/google" server/src/routes/auth.js 2>/dev/null; then
  echo "FOUND: POST /auth/google route"
else
  echo "MISSING: POST /auth/google route"
fi

echo ""

# 4. Check backend env var handling
echo "4. BACKEND CONFIGURATION"
echo "========================================"

if grep -q "GOOGLE_CLIENT_ID" server/src/index.js 2>/dev/null; then
  echo "FOUND: Startup logging for Google OAuth"
else
  echo "MISSING: Startup logging"
fi

echo ""

# 5. Summary
echo "5. NEXT STEPS"
echo "========================================"

echo ""
echo "Set these environment variables:"
echo ""
echo "On Vercel (Project Settings → Variables):"
echo "  VITE_GOOGLE_CLIENT_ID=492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com"
echo ""
echo "On Railway (backend → Variables):"
echo "  GOOGLE_CLIENT_ID=492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com"
echo ""
echo "Then redeploy and test at:"
echo "  https://dev.thevideopool.com/login"
echo ""
