#!/bin/bash
###############################################################################
# ClipExtract Release New Version Script
#
# Usage: ./release-new-version.sh V1.2.0 "Description of changes"
#
# This script creates a new version snapshot by:
# 1. Creating a git tag with the version
# 2. Creating metadata in .versioning/artifacts/
# 3. Preparing version entry in versions.json
# 4. Committing and pushing (which triggers CI/CD)
#
# Note: Deployment IDs (Vercel/Railway) are captured AFTER the deploy completes.
# This script creates the framework for them.
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Validate arguments
if [ -z "$1" ] || [ -z "$2" ]; then
  echo -e "${RED}❌ Usage: $0 <VERSION> <\"Description\">\"${NC}"
  echo "Example: $0 V1.2.0 \"Added dark mode, fixed footer styling\""
  exit 1
fi

NEW_VERSION=$1
DESCRIPTION=$2
RELEASE_TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
SHORT_TIMESTAMP=$(date -u +'%Y-%m-%d %H:%M')

# Validate version format
if ! [[ $NEW_VERSION =~ ^V[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo -e "${RED}❌ Invalid version format: $NEW_VERSION${NC}"
  echo "Expected format: V1.2.0"
  exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo -e "${RED}❌ Uncommitted changes detected${NC}"
  echo "Commit or stash your changes before creating a new version"
  exit 1
fi

# Check if version already exists
if git rev-parse "$NEW_VERSION" > /dev/null 2>&1; then
  echo -e "${RED}❌ Version $NEW_VERSION already exists${NC}"
  echo "Use a different version number"
  exit 1
fi

echo -e "${BLUE}📦 Creating new version: $NEW_VERSION${NC}"
echo "   Description: $DESCRIPTION"
echo ""

# Get current git information
CURRENT_COMMIT=$(git rev-parse HEAD)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Update VERSION file
echo -e "${YELLOW}📝 Updating VERSION file...${NC}"
echo "$NEW_VERSION" > VERSION

# Create artifact directory
echo -e "${YELLOW}📁 Creating artifact directory...${NC}"
ARTIFACT_DIR=".versioning/artifacts/$NEW_VERSION"
mkdir -p "$ARTIFACT_DIR"

# Create initial metadata (deployment IDs will be captured by CI/CD after deploy)
echo -e "${YELLOW}📄 Creating artifact metadata...${NC}"

cat > "$ARTIFACT_DIR/metadata.json" <<EOF
{
  "tag": "$NEW_VERSION",
  "created_at": "$RELEASE_TIMESTAMP",
  "deployed_at": null,
  "git_commit": "$CURRENT_COMMIT",
  "git_branch": "$CURRENT_BRANCH",
  "vercel_deployment_id": "pending-capture-from-ci",
  "railway_build_id": "pending-capture-from-ci",
  "git_tag": "$NEW_VERSION",
  "changelog_entry": "$DESCRIPTION",
  "status": "pending-deployment"
}
EOF

echo -e "${GREEN}✅ Metadata created:${NC}"
cat "$ARTIFACT_DIR/metadata.json" | jq '.' 2>/dev/null || cat "$ARTIFACT_DIR/metadata.json"

# Create empty deployment status file (to be filled in by CI/CD)
cat > "$ARTIFACT_DIR/deployment-status.json" <<EOF
{
  "vercel": {
    "status": "pending",
    "deployment_id": null,
    "deployment_url": null,
    "timestamp": null
  },
  "railway": {
    "status": "pending",
    "build_id": null,
    "build_url": null,
    "timestamp": null
  },
  "notes": "Updated by CI/CD after deployment completes"
}
EOF

# Update versions.json to add this new version
echo -e "${YELLOW}🔧 Updating versions.json...${NC}"

if command -v jq &> /dev/null; then
  # Use jq to safely update JSON
  jq --arg ver "$NEW_VERSION" \
     --arg ts "$RELEASE_TIMESTAMP" \
     --arg commit "$CURRENT_COMMIT" \
     '.current_version = $ver |
      .all_versions = ([.all_versions[0]] + [
        {
          "tag": $ver,
          "created_at": $ts,
          "deployed_at": null,
          "git_commit": $commit,
          "vercel_deployment_id": "pending-capture-from-ci",
          "railway_build_id": "pending-capture-from-ci",
          "status": "pending-deployment",
          "notes": "Awaiting CI/CD deployment"
        }
      ] + .all_versions[1:])' \
     .versioning/versions.json > .versioning/versions.json.tmp && \
    mv .versioning/versions.json.tmp .versioning/versions.json
else
  echo -e "${YELLOW}⚠️  jq not found, skipping versions.json update${NC}"
  echo "You may need to manually update .versioning/versions.json"
fi

# Git operations
echo -e "${YELLOW}💾 Committing version files...${NC}"
git add VERSION .versioning/artifacts/$NEW_VERSION/ .versioning/versions.json
git commit -m "chore(release): Prepare $NEW_VERSION for deployment

Description: $DESCRIPTION
Commit: $CURRENT_COMMIT
Artifacts prepared in: .versioning/artifacts/$NEW_VERSION/
CI/CD will capture deployment IDs after successful deployment.
"

# Create git tag
echo -e "${YELLOW}🏷️  Creating git tag...${NC}"
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION: $DESCRIPTION"

# Push (triggers CI/CD)
echo -e "${YELLOW}🚀 Pushing to origin...${NC}"
git push origin HEAD:main
git push origin "$NEW_VERSION"

echo ""
echo -e "${GREEN}✅ VERSION PREPARED!${NC}"
echo ""
echo "Timeline:"
echo "  ✅ VERSION file updated"
echo "  ✅ Artifact directory created: $ARTIFACT_DIR"
echo "  ✅ Metadata prepared"
echo "  ✅ versions.json updated"
echo "  ✅ Git tag created: $NEW_VERSION"
echo "  ✅ Pushed to origin"
echo "  ⏳ CI/CD deploying..."
echo ""
echo -e "${YELLOW}What happens next:${NC}"
echo "1. GitHub Actions/CI triggers on push"
echo "2. Vercel builds and deploys frontend"
echo "3. Railway builds and deploys backend"
echo "4. After deployment succeeds:"
echo "   - Deployment IDs are captured"
echo "   - Artifact metadata is updated"
echo "   - $NEW_VERSION is marked 'live' in versions.json"
echo ""
echo "Monitor deployments:"
echo "  📊 Vercel: https://vercel.com/dashboard"
echo "  🚂 Railway: https://railway.app/dashboard"
echo "  📝 This repo: git log"
echo ""
echo "If deployment fails:"
echo "  1. Check Vercel/Railway dashboards for errors"
echo "  2. Fix the issue in your code"
echo "  3. Commit the fix"
echo "  4. Create a new version tag (e.g., V1.2.1)"
echo ""
echo "Version details:"
echo "  Directory: $ARTIFACT_DIR"
echo "  Metadata: $ARTIFACT_DIR/metadata.json"
echo "  Versions log: .versioning/versions.json"
