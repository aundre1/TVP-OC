#!/bin/bash

# Automated Token Setup for TVP-OC GitHub Secrets
# This script adds deployment tokens to your GitHub repository automatically

set -e

GITHUB_REPO="aundre1/TVP-OC"
GITHUB_OWNER="aundre1"

echo "=========================================="
echo "TVP-OC: Automated Token Setup for GitHub"
echo "=========================================="
echo ""

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo ""
    echo "Run: gh auth login"
    echo ""
    echo "Then authenticate with:"
    echo "  - Host: GitHub.com"
    echo "  - Protocol: HTTPS"
    echo "  - Authenticate with: your preferred method"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Function to add or update a secret
add_secret() {
    local secret_name=$1
    local secret_value=$2

    echo "Adding secret: $secret_name"

    # Use gh CLI to set the secret
    gh secret set "$secret_name" --body "$secret_value" --repo "$GITHUB_REPO"

    if [ $? -eq 0 ]; then
        echo "  ✅ Secret '$secret_name' added successfully"
    else
        echo "  ❌ Failed to add secret '$secret_name'"
        return 1
    fi
}

echo "=========================================="
echo "STEP 1: Get Your Vercel Token"
echo "=========================================="
echo ""
echo "Instructions:"
echo "  1. Go to: https://vercel.com/account/tokens"
echo "  2. Click 'Create' button"
echo "  3. Name it: 'GitHub Actions'"
echo "  4. Copy the token"
echo ""
read -p "Paste your Vercel token here: " VERCEL_TOKEN

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Vercel token is required!"
    exit 1
fi

echo ""
echo "=========================================="
echo "STEP 2: Get Your Vercel Project IDs"
echo "=========================================="
echo ""
echo "Instructions:"
echo "  1. Go to: https://vercel.com/dashboard"
echo "  2. Click on your 'TVP-OC' project"
echo "  3. Go to Settings → General"
echo "  4. Copy the Project ID (looks like: abc123def456)"
echo ""
read -p "Paste your Vercel Project ID here: " VERCEL_PROJECT_ID

if [ -z "$VERCEL_PROJECT_ID" ]; then
    echo "❌ Vercel Project ID is required!"
    exit 1
fi

echo ""
echo "Instructions for Org ID:"
echo "  - If you have a team, copy the Org ID from Settings"
echo "  - If using personal account, just press Enter"
echo ""
read -p "Paste your Vercel Org ID (or press Enter to skip): " VERCEL_ORG_ID

echo ""
echo "=========================================="
echo "STEP 3: Get Your Railway Token"
echo "=========================================="
echo ""
echo "Instructions:"
echo "  1. Go to: https://railway.app/settings/tokens"
echo "  2. Click 'Create Token' button"
echo "  3. Copy the token"
echo ""
read -p "Paste your Railway token here: " RAILWAY_TOKEN

if [ -z "$RAILWAY_TOKEN" ]; then
    echo "❌ Railway token is required!"
    exit 1
fi

echo ""
echo "=========================================="
echo "SUMMARY OF TOKENS TO ADD"
echo "=========================================="
echo ""
echo "Repository: $GITHUB_REPO"
echo ""
echo "Secrets to add:"
echo "  1. VERCEL_TOKEN: ${VERCEL_TOKEN:0:20}... (${#VERCEL_TOKEN} chars)"
echo "  2. VERCEL_PROJECT_ID: $VERCEL_PROJECT_ID"
echo "  3. VERCEL_ORG_ID: ${VERCEL_ORG_ID:-'(skipped)'}"
echo "  4. RAILWAY_TOKEN: ${RAILWAY_TOKEN:0:20}... (${#RAILWAY_TOKEN} chars)"
echo ""

read -p "Continue with adding these secrets to GitHub? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "=========================================="
echo "ADDING SECRETS TO GITHUB"
echo "=========================================="
echo ""

# Add secrets
add_secret "VERCEL_TOKEN" "$VERCEL_TOKEN"
add_secret "VERCEL_PROJECT_ID" "$VERCEL_PROJECT_ID"

if [ -n "$VERCEL_ORG_ID" ]; then
    add_secret "VERCEL_ORG_ID" "$VERCEL_ORG_ID"
fi

add_secret "RAILWAY_TOKEN" "$RAILWAY_TOKEN"

echo ""
echo "=========================================="
echo "✅ ALL DONE!"
echo "=========================================="
echo ""
echo "Your GitHub secrets have been configured!"
echo ""
echo "Next steps:"
echo "  1. Go to: https://github.com/$GITHUB_REPO/actions"
echo "  2. The workflows are ready to run"
echo "  3. Next time you push code to 'main' branch:"
echo "     - GitHub Actions will run automatically"
echo "     - Code will deploy to Vercel AND Railway in parallel"
echo ""
echo "To test it:"
echo "  cd /Users/dremacmini/Desktop/OC/TVP-Redesign-2026"
echo "  git push origin main"
echo ""
echo "Then watch the deployment:"
echo "  https://github.com/$GITHUB_REPO/actions"
echo ""
