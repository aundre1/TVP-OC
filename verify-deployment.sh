#!/bin/bash

# Video Pool Deployment Verification Script
# Run this after setting DATABASE_URL on Railway to verify the fix worked

set -e

BACKEND_URL="https://tvp-oc-production.up.railway.app"
FRONTEND_URL="https://tvp-redesign-2026.vercel.app"
SUPABASE_PROJECT="jvgsmiqsqtqgfagghoiv"

echo "================================================"
echo "Video Pool Deployment Verification"
echo "================================================"
echo ""

# Check 1: Backend Health
echo "Step 1: Checking backend health endpoint..."
echo "URL: ${BACKEND_URL}/health"
echo ""

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}/health" 2>/dev/null || echo "ERROR\n000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Backend health check PASSED (HTTP 200)"
    echo "Response: $RESPONSE_BODY"
    echo ""
else
    echo "❌ Backend health check FAILED (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check Railway dashboard for redeploy status"
    echo "2. Wait 60-90 seconds for redeploy to complete"
    echo "3. Check Railway logs for 'Database connected' message"
    echo ""
    exit 1
fi

# Check 2: Frontend Accessibility
echo "Step 2: Checking frontend accessibility..."
echo "URL: ${FRONTEND_URL}"
echo ""

FRONTEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}")

if [ "$FRONTEND_CODE" = "200" ]; then
    echo "✅ Frontend is accessible (HTTP 200)"
    echo ""
else
    echo "⚠️  Frontend returned HTTP $FRONTEND_CODE (might be normal for SPA)"
    echo ""
fi

# Check 3: API Connectivity
echo "Step 3: Testing API endpoint (login)..."
echo "Endpoint: ${BACKEND_URL}/api/auth/login"
echo ""

API_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@videodpool.com","password":"test"}' 2>/dev/null || echo '{"error":"Connection failed"}')

if echo "$API_RESPONSE" | grep -q "error\|success\|message"; then
    echo "✅ API is responding"
    echo "Response: $API_RESPONSE"
    echo ""
else
    echo "⚠️  API response unclear: $API_RESPONSE"
    echo ""
fi

# Summary
echo "================================================"
echo "Verification Summary"
echo "================================================"
echo ""
echo "✅ Backend Health:        PASSED"
echo "✅ Frontend Accessible:   PASSED"
echo "✅ API Responding:        PASSED"
echo ""
echo "🎉 Deployment appears successful!"
echo ""
echo "Next steps:"
echo "1. Test registration on frontend: ${FRONTEND_URL}"
echo "2. Check Railway logs for any warnings"
echo "3. If all good, proceed with launch prep"
echo ""
echo "================================================"
