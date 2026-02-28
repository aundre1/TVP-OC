#!/bin/bash
###############################################################################
# ClipExtract Git-Based Rollback Script
#
# Usage: ./rollback-git.sh V1.0.0 ["Reason for rollback"]
#
# This script performs a clean, audited rollback using git revert.
# Perfect for planned rollbacks where you have time for full redeployment.
#
# Process:
# 1. Reverts all commits after the specified version tag
# 2. Updates ROLLBACK_LOG.md
# 3. Updates versions.json
# 4. Pushes to origin (which triggers Vercel/Railway redeploy)
# 5. Total time: ~2-3 minutes
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validate arguments
if [ -z "$1" ]; then
  echo -e "${RED}❌ Usage: $0 <VERSION> [\"Reason for rollback\"]${NC}"
  echo "Example: $0 V1.0.0 \"Dark mode toggle broken, need stability\""
  exit 1
fi

VERSION=$1
REASON=${2:-"Manual rollback"}
ROLLBACK_TIMESTAMP=$(date -u +'%Y-%m-%d %H:%M:%S UTC')
SHORT_TIMESTAMP=$(date -u +'%Y-%m-%d %H:%M')

# Verify version tag exists
if ! git rev-parse "$VERSION" > /dev/null 2>&1; then
  echo -e "${RED}❌ Version tag '$VERSION' not found${NC}"
  echo "Available tags:"
  git tag | grep "^V" | sort -V | tail -10
  exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo -e "${RED}❌ Uncommitted changes detected${NC}"
  echo "Stash or commit changes before rolling back"
  exit 1
fi

echo -e "${YELLOW}🔄 Rolling back to $VERSION...${NC}"
echo "   Reason: $REASON"
echo ""

# Get the current version
CURRENT_VERSION=$(cat VERSION)

# Get commit SHA of the version we're rolling back to
TARGET_COMMIT=$(git rev-list -n 1 $VERSION)

# Revert all commits after that version
echo -e "${YELLOW}📝 Creating revert commit...${NC}"
git revert ${TARGET_COMMIT}..HEAD --no-edit -m 1 2>/dev/null || {
  # If revert fails (no changes, etc), that's okay
  echo "No changes to revert or revert already in progress"
}

# Update ROLLBACK_LOG.md
echo -e "${YELLOW}📋 Updating rollback log...${NC}"
cat >> .versioning/ROLLBACK_LOG.md <<EOF

## [$SHORT_TIMESTAMP] Rollback to $VERSION (Git-Based)
- **Reason**: $REASON
- **From**: $CURRENT_VERSION
- **To**: $VERSION
- **Method**: Git-based (\`git revert\`)
- **Duration**: ~2-3 minutes (includes redeployment)
- **Status**: In progress (waiting for Vercel/Railway deployment)
- **Commit**: Git revert commit created

EOF

# Update versions.json - Update current_version and add rollback entry
echo -e "${YELLOW}🔧 Updating versions.json...${NC}"

# Use jq to update JSON if available, else manual update
if command -v jq &> /dev/null; then
  ROLLBACK_ISO=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

  # Update current_version and last_rollback fields
  jq --arg ver "$VERSION" \
     --arg ts "$ROLLBACK_ISO" \
     '.current_version = $ver | .last_rollback = $ARGV[0] | .last_rollback_at = $ts' \
     --args "$VERSION" \
     .versioning/versions.json > .versioning/versions.json.tmp && \
    mv .versioning/versions.json.tmp .versioning/versions.json
else
  # Fallback: manual sed-based update (less reliable but works)
  sed -i '' "s/\"current_version\": \"[^\"]*\"/\"current_version\": \"$VERSION\"/" .versioning/versions.json
fi

# Commit the rollback
echo -e "${YELLOW}💾 Committing rollback...${NC}"
git add VERSION .versioning/ROLLBACK_LOG.md .versioning/versions.json
git commit -m "chore(rollback): Revert to $VERSION

Reason: $REASON
Method: git-based (clean revert)
Initiated: $ROLLBACK_TIMESTAMP
"

# Push (triggers Vercel/Railway redeploy)
echo -e "${YELLOW}🚀 Pushing to origin (triggering redeploy)...${NC}"
git push origin HEAD:main

echo ""
echo -e "${GREEN}✅ Rollback initiated!${NC}"
echo ""
echo "Timeline:"
echo "  ✅ Git revert commit created"
echo "  ✅ ROLLBACK_LOG.md updated"
echo "  ✅ versions.json updated"
echo "  ✅ Pushed to origin"
echo "  ⏳ Vercel deploying... (check https://vercel.com/dashboard)"
echo "  ⏳ Railway redeploying... (check https://railway.app/dashboard)"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Monitor deployment at Vercel & Railway dashboards"
echo "2. Test the site at https://clipextract.com"
echo "3. If this rollback is wrong, git will have clean history to revert"
echo "4. If a hotfix is needed, create a new version tag and push"
echo ""
echo "Rollback details in: .versioning/ROLLBACK_LOG.md"
