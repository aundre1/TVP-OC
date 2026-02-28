#!/bin/bash
###############################################################################
# ClipExtract Artifact-Based Rollback Script (INSTANT)
#
# Usage: ./rollback-artifact.sh V1.0.0 ["Reason for rollback"]
#
# This script performs an INSTANT rollback using deployment artifacts.
# Perfect for emergencies where you need to revert in <30 seconds.
#
# Requirements:
# - VERCEL_TOKEN environment variable (get from https://vercel.com/account/tokens)
# - RAILWAY_TOKEN environment variable (get from https://railway.app/account/tokens)
# - jq installed for JSON parsing
#
# Process:
# 1. Loads artifact metadata for the version
# 2. Calls Vercel API to revert to previous deployment
# 3. Calls Railway API to revert to previous build
# 4. Updates versions.json
# 5. Updates ROLLBACK_LOG.md
# 6. Total time: ~30 seconds to live
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Validate arguments
if [ -z "$1" ]; then
  echo -e "${RED}❌ Usage: $0 <VERSION> [\"Reason for rollback\"]${NC}"
  echo "Example: $0 V1.0.0 \"Dark mode broke production\""
  exit 1
fi

VERSION=$1
REASON=${2:-"Emergency rollback"}
ROLLBACK_TIMESTAMP=$(date -u +'%Y-%m-%d %H:%M:%S UTC')
SHORT_TIMESTAMP=$(date -u +'%Y-%m-%d %H:%M')

# Check for required environment variables
if [ -z "$VERCEL_TOKEN" ]; then
  echo -e "${RED}❌ VERCEL_TOKEN not set${NC}"
  echo "Get your token at: https://vercel.com/account/tokens"
  echo "Then: export VERCEL_TOKEN='your_token'"
  exit 1
fi

if [ -z "$RAILWAY_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  RAILWAY_TOKEN not set (optional if no backend)${NC}"
  echo "Get your token at: https://railway.app/account/tokens"
  echo "Then: export RAILWAY_TOKEN='your_token'"
  # Don't exit - backend might be optional
fi

# Check for jq
if ! command -v jq &> /dev/null; then
  echo -e "${RED}❌ jq is required but not installed${NC}"
  echo "Install with: brew install jq"
  exit 1
fi

# Verify version artifact exists
ARTIFACT_DIR=".versioning/artifacts/$VERSION"
METADATA_FILE="$ARTIFACT_DIR/metadata.json"

if [ ! -f "$METADATA_FILE" ]; then
  echo -e "${RED}❌ Artifact for $VERSION not found${NC}"
  echo "Available versions:"
  ls -1 .versioning/artifacts/ 2>/dev/null | grep "^V" | sort -V || echo "No versions found"
  exit 1
fi

echo -e "${BLUE}🔙 INSTANT ARTIFACT-BASED ROLLBACK${NC}"
echo "   Version: $VERSION"
echo "   Reason: $REASON"
echo ""

# Extract deployment IDs from metadata
VERCEL_DEPLOYMENT_ID=$(jq -r '.vercel_deployment_id' "$METADATA_FILE")
RAILWAY_BUILD_ID=$(jq -r '.railway_build_id' "$METADATA_FILE")
GIT_COMMIT=$(jq -r '.commit_sha' "$METADATA_FILE")

if [ "$VERCEL_DEPLOYMENT_ID" = "null" ] || [ "$VERCEL_DEPLOYMENT_ID" = "manual-capture-required" ]; then
  echo -e "${RED}❌ Vercel deployment ID not captured for $VERSION${NC}"
  echo "Manual capture required:"
  echo "1. Go to https://vercel.com/dashboard"
  echo "2. Find the deployment for this version"
  echo "3. Copy the deployment ID and add to:"
  echo "   $METADATA_FILE"
  exit 1
fi

if [ "$RAILWAY_BUILD_ID" = "null" ] || [ "$RAILWAY_BUILD_ID" = "manual-capture-required" ]; then
  echo -e "${YELLOW}⚠️  Railway build ID not captured${NC}"
  echo "Proceeding with Vercel-only rollback..."
  RAILWAY_ONLY=true
else
  RAILWAY_ONLY=false
fi

echo -e "${YELLOW}📦 Rollback Details:${NC}"
echo "   Git Commit: $GIT_COMMIT"
echo "   Vercel Deployment: $VERCEL_DEPLOYMENT_ID"
[ "$RAILWAY_ONLY" = false ] && echo "   Railway Build: $RAILWAY_BUILD_ID"
echo ""

# Get current version for logging
CURRENT_VERSION=$(cat VERSION)

# VERCEL ROLLBACK
echo -e "${YELLOW}🔄 Reverting Vercel deployment...${NC}"

# Get the project name from versions.json
VERCEL_PROJECT=$(jq -r '.deployment_platforms.frontend.project_name' .versioning/versions.json)

# Call Vercel API to get the deployment and promote it
VERCEL_RESPONSE=$(curl -s -X GET \
  "https://api.vercel.com/v13/deployments/$VERCEL_DEPLOYMENT_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json")

if echo "$VERCEL_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Vercel deployment found${NC}"

  # Promote the deployment to production
  PROMOTE_RESPONSE=$(curl -s -X POST \
    "https://api.vercel.com/v13/deployments/$VERCEL_DEPLOYMENT_ID/promote" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json")

  if echo "$PROMOTE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Vercel promoted to production${NC}"
    VERCEL_SUCCESS=true
  else
    echo -e "${RED}❌ Vercel promotion failed${NC}"
    echo "$PROMOTE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROMOTE_RESPONSE"
    VERCEL_SUCCESS=false
  fi
else
  echo -e "${RED}❌ Vercel deployment not found${NC}"
  echo "$VERCEL_RESPONSE" | jq '.' 2>/dev/null || echo "$VERCEL_RESPONSE"
  VERCEL_SUCCESS=false
fi

# RAILWAY ROLLBACK (if applicable)
if [ "$RAILWAY_ONLY" = false ]; then
  echo -e "${YELLOW}🔄 Reverting Railway build...${NC}"

  if [ -z "$RAILWAY_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Skipping Railway (RAILWAY_TOKEN not set)${NC}"
    RAILWAY_SUCCESS=false
  else
    # Railway uses GraphQL; this is a simplified example
    # In reality, you'd need to use Railway's specific deployment revert API
    RAILWAY_RESPONSE=$(curl -s -X POST \
      "https://api.railway.app/graphql" \
      -H "Authorization: Bearer $RAILWAY_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "query": "query { deployment(id: \"'$RAILWAY_BUILD_ID'\") { id status } }"
      }')

    if echo "$RAILWAY_RESPONSE" | jq -e '.data.deployment.id' > /dev/null 2>&1; then
      echo -e "${GREEN}✅ Railway build found${NC}"

      # Redeploy this build (Railway's way of reverting)
      REDEPLOY_RESPONSE=$(curl -s -X POST \
        "https://api.railway.app/graphql" \
        -H "Authorization: Bearer $RAILWAY_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
          "query": "mutation { deploymentRedeploy(id: \"'$RAILWAY_BUILD_ID'\") { id status } }"
        }')

      if echo "$REDEPLOY_RESPONSE" | jq -e '.data.deploymentRedeploy.id' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Railway redeployed${NC}"
        RAILWAY_SUCCESS=true
      else
        echo -e "${YELLOW}⚠️  Railway redeploy may have failed (check manually)${NC}"
        RAILWAY_SUCCESS=false
      fi
    else
      echo -e "${YELLOW}⚠️  Railway build not found (check manually)${NC}"
      RAILWAY_SUCCESS=false
    fi
  fi
else
  RAILWAY_SUCCESS="skipped"
fi

# Update ROLLBACK_LOG.md
echo -e "${YELLOW}📋 Updating rollback log...${NC}"

cat >> .versioning/ROLLBACK_LOG.md <<EOF

## [$SHORT_TIMESTAMP] Rollback to $VERSION (Artifact-Based)
- **Reason**: $REASON
- **From**: $CURRENT_VERSION
- **To**: $VERSION
- **Method**: Artifact-based (instant, ~30 sec)
- **Duration**: <1 minute
- **Status**: $([ "$VERCEL_SUCCESS" = true ] && echo "✅ Live" || echo "❌ Failed")'
- **Vercel**: $([ "$VERCEL_SUCCESS" = true ] && echo "✅ Promoted" || echo "❌ Failed")'
- **Railway**: $([ "$RAILWAY_SUCCESS" = true ] && echo "✅ Redeployed" || echo "⚠️ $RAILWAY_SUCCESS")'
- **Git Commit**: $GIT_COMMIT

EOF

# Update versions.json
echo -e "${YELLOW}🔧 Updating versions.json...${NC}"

ROLLBACK_ISO=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

if command -v jq &> /dev/null; then
  jq --arg ver "$VERSION" \
     --arg ts "$ROLLBACK_ISO" \
     '.current_version = $ver | .last_rollback = $ver | .last_rollback_at = $ts' \
     .versioning/versions.json > .versioning/versions.json.tmp && \
    mv .versioning/versions.json.tmp .versioning/versions.json
fi

# Update VERSION file
echo "$VERSION" > VERSION

# Commit the rollback
echo -e "${YELLOW}💾 Committing rollback...${NC}"
git add VERSION .versioning/ROLLBACK_LOG.md .versioning/versions.json
git commit -m "chore(rollback): Instant revert to $VERSION via artifacts

Reason: $REASON
Method: Artifact-based (Vercel + Railway)
Initiated: $ROLLBACK_TIMESTAMP
Deployment ID: $VERCEL_DEPLOYMENT_ID
Build ID: $RAILWAY_BUILD_ID
"

git push origin HEAD:main

echo ""
if [ "$VERCEL_SUCCESS" = true ]; then
  echo -e "${GREEN}✅ ROLLBACK COMPLETE!${NC}"
  echo ""
  echo "Timeline:"
  echo "  ✅ Vercel deployment promoted"
  [ "$RAILWAY_ONLY" = false ] && [ "$RAILWAY_SUCCESS" = true ] && echo "  ✅ Railway build redeployed"
  echo "  ✅ ROLLBACK_LOG.md updated"
  echo "  ✅ Committed and pushed"
  echo ""
  echo -e "${GREEN}🚀 Site is now live on $VERSION${NC}"
  echo ""
  echo "Next steps:"
  echo "1. ✅ Verify the site works at https://clipextract.com"
  echo "2. Investigate the issue while running on stable version"
  echo "3. Create a hotfix branch and test locally"
  echo "4. Create a new version tag when ready"
  echo ""
else
  echo -e "${RED}❌ ROLLBACK FAILED${NC}"
  echo "Manual intervention required:"
  echo "1. Check Vercel dashboard: https://vercel.com/dashboard"
  echo "2. Check Railway dashboard: https://railway.app/dashboard"
  echo "3. Manually promote the correct deployment"
  echo "4. Update .versioning/versions.json with current state"
  echo ""
fi

echo "Rollback details in: .versioning/ROLLBACK_LOG.md"
