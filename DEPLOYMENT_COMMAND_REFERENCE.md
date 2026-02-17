# Railway Deployment - Quick Command Reference

## Pre-Deployment Commands

### Verify Build Works Locally
```bash
npm run build
```
Expected output: `✓ built in X.XXs` with no errors

### Test Preview Server
```bash
npm run preview
```
Expected: Browser opens at `http://localhost:4173`

### Check Git Status
```bash
git status
```
Expected: `nothing to commit, working tree clean`

### Push Latest Changes
```bash
git push origin main
```

## Docker Commands (Optional)

### Build Docker Image Locally
```bash
docker build -f railway.Dockerfile -t tvp-staging:latest .
```

### Run Docker Container Locally
```bash
docker run -e VITE_API_URL=https://api-staging.thevideopool.com \
           -e NODE_ENV=production \
           -p 4173:4173 \
           tvp-staging:latest
```

### Test Docker Build
```bash
docker run -it tvp-staging:latest sh
```

## Railway CLI Commands (Optional)

### Install Railway CLI
```bash
npm install -g @railway/cli
```

### Login to Railway
```bash
railway login
```

### Link Current Project
```bash
railway link
```

### Deploy from CLI
```bash
railway deploy
```

### View Logs
```bash
railway logs
```

### View Project Status
```bash
railway status
```

### View Environment Variables
```bash
railway variables
```

### SSH into Container
```bash
railway shell
```

## NPM Commands

### Install Dependencies
```bash
npm ci
```

### Run Development Server
```bash
npm run dev
```

### Run with Mock Server
```bash
npm run dev:full
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Run Tests
```bash
npm test
```

### Run Tests (One Time)
```bash
npm run test:run
```

### Run Tests with UI
```bash
npm run test:ui
```

### Check Test Coverage
```bash
npm run test:coverage
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Lint Code
```bash
npm run lint
```

## Git Commands

### Check Current Branch
```bash
git branch
```

### Switch to Main Branch
```bash
git checkout main
```

### Pull Latest Changes
```bash
git pull origin main
```

### View Recent Commits
```bash
git log --oneline -10
```

### View Uncommitted Changes
```bash
git diff
```

### Stash Changes
```bash
git stash
```

### Apply Stashed Changes
```bash
git stash pop
```

## Environment Setup

### View Current Environment Variables
```bash
env | grep VITE
```

### Set Local Environment Variable
```bash
export VITE_API_URL=https://api-staging.thevideopool.com
```

### Load from .env File
```bash
source .env
```

## Deployment Quick Commands

### Complete Pre-Deployment Verification
```bash
git status && npm run build && npm run test:run
```

### Build and Preview
```bash
npm run build && npm run preview
```

### Clean and Rebuild
```bash
rm -rf dist node_modules && npm ci && npm run build
```

## Monitoring Commands

### Watch Build Output
```bash
npm run build -- --watch
```

### Monitor File Changes
```bash
npm run dev
```

### Check Port Usage
```bash
lsof -i :4173
```

### Kill Process on Port
```bash
lsof -ti:4173 | xargs kill -9
```

## Troubleshooting Commands

### Clear Node Modules Cache
```bash
npm cache clean --force
```

### Verify Node Version
```bash
node --version
```

### Verify npm Version
```bash
npm --version
```

### Check npm Global Packages
```bash
npm list -g
```

### Test Network Connectivity
```bash
curl https://api-staging.thevideopool.com/health
```

### Check Railway API Endpoint
```bash
curl -H "Authorization: Bearer $RAILWAY_TOKEN" \
     https://api.railway.app/graphql
```

## Docker Cleanup

### Remove All Containers
```bash
docker container prune
```

### Remove All Images
```bash
docker image prune
```

### Remove Build Cache
```bash
docker builder prune
```

### Full Docker Cleanup
```bash
docker system prune -a
```

## Performance Testing

### Run Lighthouse
```bash
npm run build && npx lighthouse http://localhost:4173
```

### Check Bundle Size
```bash
npm run build && du -h dist
```

### Analyze Bundle
```bash
npm run build -- --analyze
```

## Useful Curl Commands

### Test Staging API
```bash
curl https://api-staging.thevideopool.com/health \
  -H "Content-Type: application/json"
```

### Test with Bearer Token
```bash
curl https://api-staging.thevideopool.com/videos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Response Headers Only
```bash
curl -I https://api-staging.thevideopool.com/health
```

## VSCode Terminal Commands

### Open Integrated Terminal
```
Ctrl+` (backtick)
```

### Open New Terminal Tab
```
Ctrl+Shift+` (backtick)
```

### Split Terminal
```
Ctrl+Shift+5
```

## SSH Commands

### SSH into Railway Container
```bash
railway shell
```

### View Container Environment
```bash
railway shell -- env | grep VITE
```

## Secrets Management

### Store Token Safely
```bash
export RAILWAY_TOKEN="your-token-here"
```

### Don't Print Sensitive Info
```bash
# BAD - don't do this
echo $RAILWAY_TOKEN

# GOOD - use [REDACTED]
echo "Token: [REDACTED]"
```

## Useful Aliases

### Add to .bashrc or .zshrc
```bash
alias rw='railway'
alias npm-build='npm run build'
alias npm-preview='npm run preview'
alias npm-test='npm run test:run'
alias npm-lint='npm run lint'
alias git-push='git push origin main'
alias git-status='git status'
```

## One-Liners

### Complete Deploy Check
```bash
echo "Checking..." && git status && npm run build && npm run test:run && echo "✓ Ready to deploy"
```

### Build and Size
```bash
npm run build && echo "Build size:" && du -h dist
```

### List All Scripts
```bash
grep '".*":' package.json | grep -E '(dev|build|test|lint)'
```

### Count Files by Type
```bash
find src -type f | sed 's/.*\.//' | sort | uniq -c
```

## Help Commands

### npm Help
```bash
npm help
```

### npm Script Help
```bash
npm run
```

### Railway Help
```bash
railway help
```

### Git Help
```bash
git help
```

### Docker Help
```bash
docker help
```

## Quick Reference URLs

- Railway Dashboard: https://railway.app
- Railway Docs: https://docs.railway.app
- GitHub Repo: https://github.com/aundre1/TVP-OC
- Staging API: https://api-staging.thevideopool.com
- Production API: https://api.thevideopool.com

---

**Pro Tips:**
- Always run `npm run build` before pushing to main
- Use `git status` frequently to avoid surprises
- Test locally with `npm run preview` first
- Check logs in Railway dashboard for errors
- Use `railway logs --follow` to watch in real-time
- Always have backup before major changes
- Test with different network speeds (DevTools)

---

Generated: February 16, 2026
