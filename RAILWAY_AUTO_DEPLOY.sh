#!/bin/bash

##############################################################################
# RAILWAY AUTOMATED DEPLOYMENT SCRIPT FOR TVP-REDESIGN-2026
#
# This script automates Railway deployment using the Railway API
# It handles GitHub integration setup and project creation
#
# Usage:
#   ./RAILWAY_AUTO_DEPLOY.sh [token] [email]
#
# Where:
#   token = Railway API token (from https://railway.app/account/tokens)
#   email = GitHub email (for logging into Railway)
#
# Example:
#   ./RAILWAY_AUTO_DEPLOY.sh "your-railway-token" "videomixer@gmail.com"
#
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GITHUB_REPO="aundre1/TVP-OC"
GITHUB_BRANCH="main"
RAILWAY_API_URL="https://api.railway.app"
PROJECT_NAME="tvp-redesign-2026"
SERVICE_NAME="tvp-staging"
DOCKERFILE_PATH="./railway.Dockerfile"
STARTUP_CMD="npm run preview"
PORT=4173

# Environment variables
VITE_API_URL="https://api-staging.thevideopool.com"
NODE_ENV="production"

##############################################################################
# Function Definitions
##############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

##############################################################################
# Pre-flight Checks
##############################################################################

preflight_check() {
    print_header "RUNNING PRE-FLIGHT CHECKS"

    log_info "Checking requirements..."

    # Check git
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed. Please install git first."
        exit 1
    fi
    log_success "Git is installed"

    # Check node
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    log_success "Node.js is installed ($(node -v))"

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    log_success "npm is installed ($(npm -v))"

    # Check git status
    if [ -n "$(git status --porcelain)" ]; then
        log_error "Working directory has uncommitted changes"
        log_warning "Please commit all changes before deploying"
        exit 1
    fi
    log_success "Working directory is clean"

    # Check git remote
    if ! git remote get-url origin &> /dev/null; then
        log_error "No git remote configured"
        exit 1
    fi
    log_success "Git remote is configured"

    # Check branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "$GITHUB_BRANCH" ]; then
        log_warning "Not on $GITHUB_BRANCH branch (current: $CURRENT_BRANCH)"
        log_info "Switching to $GITHUB_BRANCH..."
        git checkout $GITHUB_BRANCH
    fi
    log_success "On correct branch ($GITHUB_BRANCH)"

    # Check build
    log_info "Testing build locally..."
    if ! npm run build > /dev/null 2>&1; then
        log_error "Local build failed. Fix issues before deploying."
        exit 1
    fi
    log_success "Local build succeeds"

    log_success "All pre-flight checks passed!"
}

##############################################################################
# Check Railway CLI Installation
##############################################################################

check_railway_cli() {
    print_header "CHECKING RAILWAY CLI"

    if command -v railway &> /dev/null; then
        RAILWAY_VERSION=$(railway --version)
        log_success "Railway CLI is installed ($RAILWAY_VERSION)"
        return 0
    else
        log_warning "Railway CLI is not installed"
        log_info "Installing Railway CLI..."

        # Install Railway CLI
        if command -v npm &> /dev/null; then
            npm install -g @railway/cli
            log_success "Railway CLI installed"
            return 0
        else
            log_error "Cannot install Railway CLI without npm"
            return 1
        fi
    fi
}

##############################################################################
# Get Railway Token
##############################################################################

get_railway_token() {
    RAILWAY_TOKEN="$1"

    if [ -z "$RAILWAY_TOKEN" ]; then
        print_header "RAILWAY API TOKEN REQUIRED"
        log_warning "Railway token not provided as argument"
        echo ""
        echo "To get your Railway token:"
        echo "1. Go to https://railway.app/account/tokens"
        echo "2. Create a new token"
        echo "3. Copy the token"
        echo ""
        read -p "Enter your Railway API token: " RAILWAY_TOKEN

        if [ -z "$RAILWAY_TOKEN" ]; then
            log_error "No token provided. Exiting."
            exit 1
        fi
    fi

    log_success "Railway token received"
}

##############################################################################
# Get GitHub Email
##############################################################################

get_github_email() {
    GITHUB_EMAIL="$1"

    if [ -z "$GITHUB_EMAIL" ]; then
        print_header "GITHUB EMAIL REQUIRED"
        log_warning "GitHub email not provided as argument"
        echo ""
        read -p "Enter your GitHub email (associated with Railway account): " GITHUB_EMAIL

        if [ -z "$GITHUB_EMAIL" ]; then
            log_error "No email provided. Exiting."
            exit 1
        fi
    fi

    log_success "GitHub email received ($GITHUB_EMAIL)"
}

##############################################################################
# Create Railway Project via API
##############################################################################

create_railway_project_api() {
    print_header "CREATING RAILWAY PROJECT VIA API"

    log_info "Attempting to create project: $PROJECT_NAME"

    # Check if we have a token for API
    if [ -z "$RAILWAY_TOKEN" ]; then
        log_warning "No API token available for automated creation"
        log_info "Will need to create project manually via dashboard"
        return 1
    fi

    # Try GraphQL mutation
    MUTATION='{
      "query": "mutation { projectCreate(input: { name: \"'$PROJECT_NAME'\" }) { id name } }"
    }'

    RESPONSE=$(curl -s -X POST "$RAILWAY_API_URL/graphql" \
        -H "Authorization: Bearer $RAILWAY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$MUTATION")

    # Check if successful
    if echo "$RESPONSE" | grep -q "\"id\""; then
        PROJECT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        log_success "Project created with ID: $PROJECT_ID"
        return 0
    else
        log_warning "API project creation failed or not available"
        log_info "Will proceed with manual setup instructions"
        return 1
    fi
}

##############################################################################
# Push to GitHub
##############################################################################

push_to_github() {
    print_header "PUSHING TO GITHUB"

    log_info "Checking if changes need to be pushed..."

    # Check if ahead of origin
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/$GITHUB_BRANCH)

    if [ "$LOCAL" = "$REMOTE" ]; then
        log_success "Already up-to-date with origin"
    else
        log_info "Pushing to GitHub..."
        git push origin $GITHUB_BRANCH
        log_success "Pushed to GitHub"
    fi
}

##############################################################################
# Generate Deployment Instructions
##############################################################################

generate_manual_instructions() {
    print_header "RAILWAY DEPLOYMENT INSTRUCTIONS"

    cat > DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# Railway Deployment - Manual Steps Required

Since Railway automated API access requires browser/dashboard interaction, please follow these steps:

## Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up or log in with GitHub (videomixer@gmail.com)
3. Authorize Railway to access your GitHub account

## Step 2: Create New Project
1. Click "New Project" button
2. Select "Deploy from GitHub repo"
3. Authorize Railway to access your GitHub account
4. Select repository: `aundre1/TVP-OC`
5. Select branch: `main`
6. Click "Deploy"

## Step 3: Configure Environment Variables
Once the project is created:

1. Go to project settings
2. Click "Variables" tab
3. Add these environment variables:
   - Name: `VITE_API_URL`
     Value: `https://api-staging.thevideopool.com`
   - Name: `NODE_ENV`
     Value: `production`
   - Name: `PORT`
     Value: `4173`

## Step 4: Configure Build Settings
1. In project settings, go to "Build" tab
2. Set Dockerfile path: `./railway.Dockerfile`
3. Leave start command empty (uses default from Dockerfile)

## Step 5: Deploy
1. Railway will automatically detect the Dockerfile
2. Build will start (takes 3-5 minutes)
3. Service will deploy automatically
4. You'll receive a Railway URL

## Step 6: Verify Deployment
1. Wait for build to complete
2. Check the logs for any errors
3. Click the generated Railway URL
4. Verify the application loads
5. Test API connectivity (should use staging API)

## Step 7: Configure Custom Domain (Optional)
1. In project settings, go to "Domains"
2. Add custom domain: `staging.thevideopool.com`
3. Update DNS with CNAME record
4. Wait for DNS propagation (can take 24 hours)

## Environment Variables Summary
- `VITE_API_URL`: Points to staging API
- `NODE_ENV`: Set to production for optimized build
- `PORT`: Exposes port 4173 (required by Vite preview)

## Build Information
- Framework: Vite + React + TypeScript
- Build command: `npm run build`
- Preview command: `npm run preview`
- Dockerfile: Uses multi-stage build with Alpine Linux
- Build time: 3-5 minutes
- Image size: ~150-200 MB

## Troubleshooting
See RAILWAY_DEPLOYMENT.md for detailed troubleshooting guide.

## Support
- Railway Docs: https://docs.railway.app
- GitHub Repo: https://github.com/aundre1/TVP-OC
EOF

    log_success "Generated DEPLOYMENT_INSTRUCTIONS.md"
}

##############################################################################
# Main Execution
##############################################################################

main() {
    print_header "TVP REDESIGN 2026 - RAILWAY AUTOMATED DEPLOYMENT"

    log_info "Starting automated deployment process..."
    log_info "Date: $(date)"
    log_info "Repository: $GITHUB_REPO"
    log_info "Branch: $GITHUB_BRANCH"
    log_info ""

    # Run pre-flight checks
    preflight_check

    # Get credentials
    get_railway_token "$1"
    get_github_email "$2"

    # Push to GitHub
    push_to_github

    # Try to install and use Railway CLI
    if check_railway_cli; then
        log_info "Railway CLI available for optional use"
    fi

    # Try API-based creation
    if ! create_railway_project_api; then
        log_warning "Automated project creation not available"
        log_info "Will provide manual instructions instead"
    fi

    # Generate manual deployment instructions
    generate_manual_instructions

    # Final summary
    print_header "DEPLOYMENT READINESS SUMMARY"

    echo "✓ Pre-flight checks passed"
    echo "✓ Working directory clean"
    echo "✓ Build verified locally"
    echo "✓ Code pushed to GitHub"
    echo "✓ Deployment files ready"
    echo ""
    log_success "System is READY FOR DEPLOYMENT"
    echo ""
    echo "Next steps:"
    echo "1. Review DEPLOYMENT_INSTRUCTIONS.md"
    echo "2. Go to https://railway.app"
    echo "3. Connect to GitHub repository"
    echo "4. Configure environment variables"
    echo "5. Deploy"
    echo ""
    echo "Estimated time to deployment: 10-15 minutes"
    echo ""
}

# Run main function with provided arguments
main "$@"
