#!/bin/bash

###############################################################################
# TVP-OC VERCEL DEPLOYMENT SCRIPT
# This script handles the complete Vercel deployment process
###############################################################################

set -e

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "TVP-OC VERCEL DEPLOYMENT SCRIPT"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Project Directory: $PROJECT_DIR"
echo ""

# Step 1: Check Vercel CLI
echo "${YELLOW}Step 1: Checking Vercel CLI installation...${NC}"
if command -v vercel &> /dev/null; then
    VERCEL_VERSION=$(vercel --version)
    echo "${GREEN}✓ Vercel CLI found: $VERCEL_VERSION${NC}"
else
    echo "${RED}✗ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi
echo ""

# Step 2: Check authentication
echo "${YELLOW}Step 2: Checking Vercel authentication...${NC}"
if vercel whoami &> /dev/null; then
    VERCEL_USER=$(vercel whoami)
    echo "${GREEN}✓ Authenticated as: $VERCEL_USER${NC}"
else
    echo "${YELLOW}⚠ Not authenticated. Starting login process...${NC}"
    vercel login
    echo "${GREEN}✓ Authentication complete${NC}"
fi
echo ""

# Step 3: Verify build
echo "${YELLOW}Step 3: Building project...${NC}"
if npm run build; then
    echo "${GREEN}✓ Build successful${NC}"
else
    echo "${RED}✗ Build failed. Please check errors above.${NC}"
    exit 1
fi
echo ""

# Step 4: Deploy to Vercel
echo "${YELLOW}Step 4: Deploying to Vercel (production)...${NC}"
vercel --prod --public --yes

echo ""
echo "${GREEN}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo "${GREEN}DEPLOYMENT COMPLETE!${NC}"
echo "${GREEN}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Visit your Vercel dashboard: https://vercel.com"
echo "2. Configure environment variables if needed"
echo "3. Test your deployment at the provided URL"
echo ""
