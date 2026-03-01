#!/usr/bin/env node
/**
 * OAuth Configuration Diagnostic Tool
 * Checks frontend and backend OAuth setup
 * Run: node scripts/oauth-diagnostic.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

console.log('\n🔍 THE VIDEO POOL — OAuth Configuration Diagnostic');
console.log('='.repeat(60));

// ── Check 1: Frontend OAuth Config ──────────────────────
console.log('\n📋 Check 1: Frontend OAuth Config (src/config/oauth.ts)');
try {
  const oauthConfigPath = path.join(rootDir, 'src/config/oauth.ts');
  const content = fs.readFileSync(oauthConfigPath, 'utf-8');

  const hasGoogleConfig = content.includes('google:');
  const hasFacebookConfig = content.includes('facebook:');
  const hasAppleConfig = content.includes('apple:');

  console.log('  ✓ Google config defined:', hasGoogleConfig ? '✅' : '❌');
  console.log('  ✓ Facebook config defined:', hasFacebookConfig ? '✅' : '❌');
  console.log('  ✓ Apple config defined:', hasAppleConfig ? '✅' : '❌');
} catch (error) {
  console.log('  ❌ Error reading oauth.ts:', error.message);
}

// ── Check 2: Environment Variables (Local) ──────────────────
console.log('\n📋 Check 2: Environment Variables (.env.local)');
const envPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasGoogle = envContent.includes('VITE_GOOGLE_CLIENT_ID');
  const hasGoogleValue = envContent.match(/VITE_GOOGLE_CLIENT_ID=(.+)/)?.[1];
  const hasFacebook = envContent.includes('VITE_FACEBOOK_APP_ID');
  const hasFacebookValue = envContent.match(/VITE_FACEBOOK_APP_ID=(.+)/)?.[1];

  console.log('  ✓ VITE_GOOGLE_CLIENT_ID defined:', hasGoogle ? '✅' : '❌');
  if (hasGoogleValue && hasGoogleValue !== 'your-client-id-here') {
    console.log(`    └─ Value: ${hasGoogleValue.substring(0, 20)}...`);
  }
  console.log('  ✓ VITE_FACEBOOK_APP_ID defined:', hasFacebook ? '✅' : '❌');
  if (hasFacebookValue && hasFacebookValue !== 'your-facebook-app-id-here') {
    console.log(`    └─ Value: ${hasFacebookValue.substring(0, 20)}...`);
  }
} else {
  console.log('  ⚠️  .env.local not found (this is normal — will use Vercel env vars)');
}

// ── Check 3: Frontend Components ────────────────────────
console.log('\n📋 Check 3: Frontend OAuth Components');
const componentChecks = [
  { name: 'SocialLoginGrid.tsx', path: 'src/components/SocialLoginGrid.tsx', patterns: ['isGoogleConfigured', 'isFacebookConfigured', 'isAppleConfigured'] },
  { name: 'LoginPage.tsx', path: 'src/pages/LoginPage.tsx', patterns: ['SocialLoginGrid'] },
  { name: 'authStore.ts', path: 'src/stores/authStore.ts', patterns: ['loginWithGoogle', 'loginWithFacebook', 'loginWithApple'] },
  { name: 'auth.ts (API)', path: 'src/api/auth.ts', patterns: ['loginWithGoogle', 'loginWithFacebook', 'loginWithApple'] },
];

componentChecks.forEach(check => {
  const fullPath = path.join(rootDir, check.path);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const foundPatterns = check.patterns.filter(p => content.includes(p));
    console.log(`  ✓ ${check.name}: ${foundPatterns.length}/${check.patterns.length} patterns found`);
    if (foundPatterns.length !== check.patterns.length) {
      const missing = check.patterns.filter(p => !content.includes(p));
      console.log(`    └─ Missing: ${missing.join(', ')}`);
    }
  } else {
    console.log(`  ❌ ${check.name}: File not found`);
  }
});

// ── Check 4: Backend Routes ─────────────────────────────
console.log('\n📋 Check 4: Backend OAuth Routes (server/src/routes/auth.js)');
const authRoutePath = path.join(rootDir, 'server/src/routes/auth.js');
if (fs.existsSync(authRoutePath)) {
  const authContent = fs.readFileSync(authRoutePath, 'utf-8');
  const routes = ['POST /google', 'POST /facebook', 'POST /apple'];

  routes.forEach(route => {
    const hasRoute = authContent.includes(`'/${route.split(' ')[1]}'`) || authContent.includes(`/${route.split(' ')[1]}`);
    console.log(`  ✓ ${route}: ${hasRoute ? '✅' : '❌'}`);
  });
} else {
  console.log('  ⚠️  Backend auth routes file not found');
}

// ── Check 5: Critical Verification ──────────────────────
console.log('\n📋 Check 5: Critical Verification');
console.log('  🔴 CRITICAL: Verify VITE_GOOGLE_CLIENT_ID on Vercel');
console.log('     → https://vercel.com/dashboard/variables?type=env');
console.log('     → Project: tvp-redesign-2026');
console.log('     → Expected value: 492064280951-ob4ein28fv5m0teiearhnni32o8b3jgg.apps.googleusercontent.com');
console.log('\n  🔴 CRITICAL: Verify Google OAuth Redirect URI');
console.log('     → https://console.cloud.google.com/');
console.log('     → OAuth 2.0 Application Settings');
console.log('     → Authorized redirect URIs should include:');
console.log('        • https://dev.thevideopool.com/auth/google/callback');
console.log('        • https://tvp-redesign-2026.vercel.app/auth/google/callback');

// ── Check 6: Apple OAuth Setup ──────────────────────────
console.log('\n📋 Check 6: Apple OAuth Setup (Needed)');
console.log('  ⚠️  REQUIRED: Set Apple env vars on Vercel');
console.log('     → VITE_APPLE_TEAM_ID (from Apple Developer Account)');
console.log('     → VITE_APPLE_BUNDLE_ID (com.thevideopool.app)');
console.log('     → VITE_APPLE_KEY_ID (from Certificates & Identifiers)');
console.log('\n  ⚠️  REQUIRED: Set Apple env vars on Railway backend');
console.log('     → Same three variables above');

console.log('\n' + '='.repeat(60));
console.log('✅ Diagnostic complete. See items above with 🔴 for immediate fixes.\n');
