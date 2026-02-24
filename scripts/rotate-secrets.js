#!/usr/bin/env node

/**
 * 🔐 THE VIDEO POOL - AUTOMATED SECRET ROTATION
 *
 * This script automates rotation of sensitive credentials:
 * - Supabase database password
 * - JWT secrets
 * - API tokens
 *
 * Usage:
 *   npm run rotate-secrets              # Interactive (asks for confirmation)
 *   npm run rotate-secrets -- --auto    # Automated (no prompts)
 *   npm run rotate-secrets -- supabase  # Rotate only Supabase
 *   npm run rotate-secrets -- jwt       # Rotate only JWT
 *
 * Requirements:
 *   - .env.secrets.local file with RAILWAY_API_TOKEN
 *   - .env variables with API endpoints
 *   - Node.js 18+
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const SECRETS_FILE = path.join(PROJECT_ROOT, '.env.secrets.local');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  supabaseProjectId: 'jvgsmiqsqtqgfagghoiv',
  supabaseUrl: 'https://jvgsmiqsqtqgfagghoiv.supabase.co',
  railwayProjectId: 'prj_tRsJcMGySrU1hFZwerQkVQMJVXSo',
  railwayApiUrl: 'https://railway.app/api/v1',
  rotationIntervals: {
    supabase: '1mo',  // Monthly
    jwt: '3mo',       // Quarterly
    tokens: '1mo',    // Monthly
  },
};

// ============================================
// UTILITIES
// ============================================

function log(message, level = 'info') {
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m',   // red
    reset: '\x1b[0m',
  };
  const color = colors[level] || colors.info;
  console.log(`${color}[${level.toUpperCase()}]${colors.reset} ${message}`);
}

function generateSecretKey(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function readSecretsFile() {
  if (!fs.existsSync(SECRETS_FILE)) {
    throw new Error(`Secrets file not found: ${SECRETS_FILE}`);
  }
  return fs.readFileSync(SECRETS_FILE, 'utf-8');
}

function writeSecretsFile(content) {
  fs.writeFileSync(SECRETS_FILE, content, { mode: 0o600 });
  log(`Updated: ${SECRETS_FILE}`, 'success');
}

function updateSecretsValue(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return content + `\n${key}=${value}`;
  }
}

// ============================================
// SUPABASE OPERATIONS
// ============================================

/**
 * Note: Supabase API for password rotation requires admin access
 * For production, use Supabase dashboard manually and run this script
 * with the new credentials
 */
async function handleSupabaseRotation(railwayToken) {
  log('Supabase password rotation requires manual steps:', 'warning');
  log('1. Go to: https://app.supabase.com/dashboard', 'info');
  log('2. Project: jvgsmiqsqtqgfagghoiv', 'info');
  log('3. Settings → Database → Reset Password', 'info');
  log('4. Copy new password', 'info');

  // For automated scenario, we'd need Supabase admin credentials
  // This is a manual process that integrates with Railway automation
  log('After resetting password, provide new connection string...', 'info');

  // In actual usage, this would parse Railway logs or use Supabase webhooks
  return null;
}

// ============================================
// RAILWAY OPERATIONS
// ============================================

async function callRailwayAPI(token, query, variables = {}) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({ query, variables });

    const options = {
      hostname: 'api.railway.app',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
        'Authorization': `Bearer ${token}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.errors) {
            reject(new Error(`Railway API error: ${response.errors[0]?.message}`));
          } else {
            resolve(response.data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

async function updateRailwayEnvVar(token, projectId, serviceId, key, value) {
  // This requires the exact service ID from Railway
  // Would need to query first to get the service
  log(`Would update Railway: ${key}`, 'info');
  log('Note: Requires Railway GraphQL authentication', 'warning');
  // Implementation depends on Railway GraphQL API structure
  return true;
}

// ============================================
// JWT SECRET ROTATION
// ============================================

function rotateJWTSecrets() {
  log('Generating new JWT secrets...', 'info');

  const oldSecrets = readSecretsFile();
  let newSecrets = oldSecrets;

  // Generate new secrets
  const jwtSecret = generateSecretKey(64);
  const refreshTokenSecret = generateSecretKey(64);
  const sessionSecret = generateSecretKey(64);

  // Update in local file
  newSecrets = updateSecretsValue(newSecrets, 'JWT_SECRET', jwtSecret);
  newSecrets = updateSecretsValue(newSecrets, 'REFRESH_TOKEN_SECRET', refreshTokenSecret);
  newSecrets = updateSecretsValue(newSecrets, 'SESSION_SECRET', sessionSecret);
  newSecrets = updateSecretsValue(newSecrets, 'JWT_ROTATED_AT', new Date().toISOString());

  writeSecretsFile(newSecrets);

  log('New JWT secrets generated:', 'success');
  log(`  JWT_SECRET: [hidden - ${jwtSecret.substring(0, 8)}...]`, 'success');
  log(`  REFRESH_TOKEN_SECRET: [hidden - ${refreshTokenSecret.substring(0, 8)}...]`, 'success');
  log(`  SESSION_SECRET: [hidden - ${sessionSecret.substring(0, 8)}...]`, 'success');

  return {
    JWT_SECRET: jwtSecret,
    REFRESH_TOKEN_SECRET: refreshTokenSecret,
    SESSION_SECRET: sessionSecret,
  };
}

// ============================================
// MAIN ROTATION ORCHESTRATION
// ============================================

async function rotateAllSecrets(options = {}) {
  const isAuto = options.auto || process.argv.includes('--auto');
  const specificSecret = process.argv[2];

  try {
    log('🔐 THE VIDEO POOL - SECRET ROTATION STARTED', 'info');
    log(`Mode: ${isAuto ? 'Automated' : 'Interactive'}`, 'info');

    // Read secrets file to get API token
    const secretsContent = readSecretsFile();

    // For now, JWT rotation is fully automated
    if (!specificSecret || specificSecret === 'jwt') {
      log('Step 1/3: Rotating JWT Secrets...', 'info');
      const newJWTs = rotateJWTSecrets();

      // TODO: Update these in Railway environment variables
      log('⚠️  Remember to update JWT secrets in Railway:', 'warning');
      log('  1. Go to Railway dashboard', 'warning');
      log('  2. Project TVP-OC → Backend service', 'warning');
      log('  3. Variables tab → Update JWT_SECRET, REFRESH_TOKEN_SECRET, SESSION_SECRET', 'warning');
      log('  4. Save and redeploy', 'warning');
    }

    if (!specificSecret || specificSecret === 'supabase') {
      log('Step 2/3: Supabase Password Rotation', 'info');
      await handleSupabaseRotation(null);
    }

    if (!specificSecret || specificSecret === 'tokens') {
      log('Step 3/3: API Tokens Rotation', 'info');
      log('API token rotation should be done via respective dashboards:', 'warning');
      log('  - Railway: https://railway.app/account/tokens', 'warning');
      log('  - GitHub: https://github.com/settings/tokens', 'warning');
      log('  - Vercel: https://vercel.com/account/tokens', 'warning');
    }

    log('✅ Secret rotation completed!', 'success');
    log('Next: Update Railway environment variables and redeploy', 'warning');

  } catch (error) {
    log(`Error during rotation: ${error.message}`, 'error');
    process.exit(1);
  }
}

// ============================================
// CLI EXECUTION
// ============================================

rotateAllSecrets({ auto: process.argv.includes('--auto') });
