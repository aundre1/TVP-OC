#!/bin/bash

# ================================================================
# THE VIDEO POOL — Railway Production Setup Script
# ================================================================
# This script sets up all required environment variables on Railway
# for The Video Pool production deployment.
#
# Usage: ./scripts/setup-railway-production.sh
# ================================================================

set -e

echo "🚀 THE VIDEO POOL — Railway Production Setup"
echo "=============================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found. Install it first:${NC}"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Check if user is logged in to Railway
echo -e "${BLUE}Checking Railway authentication...${NC}"
if ! railway status &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Railway. Please log in:${NC}"
    echo "   railway login"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI authenticated${NC}"
echo ""

# ================================================================
# STEP 1: Link to Railway Project
# ================================================================
echo -e "${BLUE}STEP 1: Linking to Railway project...${NC}"

# Check if project is already linked
if [ -f .railway/config.json ]; then
    echo -e "${GREEN}✅ Project already linked${NC}"
    PROJECT_ID=$(grep -o '"projectId":"[^"]*"' .railway/config.json | cut -d'"' -f4)
    echo "   Project ID: $PROJECT_ID"
else
    echo -e "${YELLOW}⚠️  Need to link project. Choose 'tvp-oc' or 'TVP-OC' when prompted.${NC}"
    railway link

    if [ -f .railway/config.json ]; then
        PROJECT_ID=$(grep -o '"projectId":"[^"]*"' .railway/config.json | cut -d'"' -f4)
        echo -e "${GREEN}✅ Project linked: $PROJECT_ID${NC}"
    else
        echo -e "${RED}❌ Failed to link project${NC}"
        exit 1
    fi
fi

echo ""

# ================================================================
# STEP 2: Verify Service
# ================================================================
echo -e "${BLUE}STEP 2: Verifying Railway service...${NC}"

# Get list of services
SERVICES=$(railway services --json 2>/dev/null | grep -o '"name":"[^"]*"' | cut -d'"' -f4 || true)

if [ -z "$SERVICES" ]; then
    echo -e "${RED}❌ No services found in Railway project${NC}"
    echo "   Please ensure the backend service is deployed."
    exit 1
fi

echo "Found services:"
echo "$SERVICES" | sed 's/^/   - /'

# Try to find TVP-OC service
SERVICE_NAME=$(echo "$SERVICES" | grep -i "tvp\|backend" | head -1 || echo "")

if [ -z "$SERVICE_NAME" ]; then
    echo -e "${YELLOW}⚠️  Could not auto-detect service name.${NC}"
    echo "Choose the backend service from the list above:"
    read -p "Enter service name: " SERVICE_NAME
fi

echo -e "${GREEN}✅ Using service: $SERVICE_NAME${NC}"
echo ""

# ================================================================
# STEP 3: Set Environment Variables
# ================================================================
echo -e "${BLUE}STEP 3: Setting environment variables...${NC}"

# Get DATABASE_URL from .env files
DATABASE_URL=""

if [ -f .env.production.local ]; then
    DATABASE_URL=$(grep DATABASE_URL .env.production.local | cut -d'=' -f2 || true)
elif [ -f .env ]; then
    DATABASE_URL=$(grep DATABASE_URL .env | cut -d'=' -f2 || true)
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not found in local .env files${NC}"
    echo "Enter your Supabase PostgreSQL connection string:"
    read -s -p "DATABASE_URL: " DATABASE_URL
    echo ""
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL is required${NC}"
    exit 1
fi

# List of environment variables to set
declare -A ENV_VARS=(
    [DATABASE_URL]="$DATABASE_URL"
    [NODE_ENV]="production"
    [JWT_SECRET]="$(openssl rand -base64 32)"
    [REFRESH_TOKEN_SECRET]="$(openssl rand -base64 32)"
)

# Add OAuth variables if they exist
if [ -f .env.secrets.local ]; then
    GOOGLE_CLIENT_ID=$(grep VITE_GOOGLE_CLIENT_ID .env.secrets.local | cut -d'=' -f2 || true)
    GOOGLE_CLIENT_SECRET=$(grep GOOGLE_CLIENT_SECRET .env.secrets.local | cut -d'=' -f2 || true)
    APPLE_TEAM_ID=$(grep VITE_APPLE_TEAM_ID .env.secrets.local | cut -d'=' -f2 || true)
    APPLE_KEY_ID=$(grep VITE_APPLE_KEY_ID .env.secrets.local | cut -d'=' -f2 || true)

    [ -n "$GOOGLE_CLIENT_ID" ] && ENV_VARS[GOOGLE_CLIENT_ID]="$GOOGLE_CLIENT_ID"
    [ -n "$GOOGLE_CLIENT_SECRET" ] && ENV_VARS[GOOGLE_CLIENT_SECRET]="$GOOGLE_CLIENT_SECRET"
    [ -n "$APPLE_TEAM_ID" ] && ENV_VARS[VITE_APPLE_TEAM_ID]="$APPLE_TEAM_ID"
    [ -n "$APPLE_KEY_ID" ] && ENV_VARS[VITE_APPLE_KEY_ID]="$APPLE_KEY_ID"
fi

# Set each variable
for var_name in "${!ENV_VARS[@]}"; do
    var_value="${ENV_VARS[$var_name]}"
    if [ -n "$var_value" ]; then
        echo "Setting $var_name..."
        railway variables set --service="$SERVICE_NAME" "$var_name=$var_value"
        echo -e "${GREEN}✅ $var_name set${NC}"
    fi
done

echo ""

# ================================================================
# STEP 4: Verify Settings
# ================================================================
echo -e "${BLUE}STEP 4: Verifying environment variables...${NC}"

railway variables --service="$SERVICE_NAME" | grep -E "DATABASE_URL|JWT_SECRET|NODE_ENV"

echo ""

# ================================================================
# STEP 5: Test Connection
# ================================================================
echo -e "${BLUE}STEP 5: Testing database connection...${NC}"
echo "(This may take a minute while the service redeploys...)"
echo ""

# Wait for Railway to redeploy (roughly)
sleep 5

# Get the Railway service URL
SERVICE_URL=$(railway service list --json 2>/dev/null | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4 || true)

if [ -z "$SERVICE_URL" ]; then
    # Try to construct the URL from Railway's typical pattern
    SERVICE_URL="https://tvp-oc-production.up.railway.app"
fi

echo "Testing health endpoint: $SERVICE_URL/api/health"

for i in {1..10}; do
    echo -n "Attempt $i/10... "

    RESPONSE=$(curl -s "$SERVICE_URL/api/health" || true)

    if echo "$RESPONSE" | grep -q "connected\|ok"; then
        echo -e "${GREEN}✅ Database connected${NC}"
        echo "Response: $RESPONSE"
        break
    elif echo "$RESPONSE" | grep -q "error\|disconnected"; then
        echo -e "${RED}❌ Database error${NC}"
        echo "Response: $RESPONSE"
    else
        echo -e "${YELLOW}⏳ Service not ready yet${NC}"
    fi

    if [ $i -lt 10 ]; then
        sleep 6
    fi
done

echo ""
echo -e "${GREEN}✅ Railway setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Test the frontend at https://tvp-redesign-2026.vercel.app"
echo "2. Try logging in with email/password"
echo "3. Run 45-minute test suite: npm run test:e2e"
echo ""
