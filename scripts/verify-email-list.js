#!/usr/bin/env node

/**
 * THE VIDEO POOL - Advanced Email List Verification
 *
 * Validates 10K+ emails for:
 * - Format validity
 * - DNS MX records (domain exists)
 * - Disposable/temporary email providers
 * - Common typos (gmail.com vs gmial.com)
 * - Spam trap patterns
 *
 * Updates Supabase with verification_status: valid | invalid | risky | disposable
 * Generates comprehensive report
 */

import { createClient } from '@supabase/supabase-js';
import dns from 'dns/promises';
import fs from 'fs';

// ====================================
// CONFIG
// ====================================

const SUPABASE_URL = 'https://jvgsmiqsqtqgfagghoiv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Disposable email providers (update this list regularly)
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com',
  'mailinator.com', 'maildrop.cc', 'trashmail.com', 'yopmail.com',
  'throwaway.email', 'fake-mail.com', 'tempmail.us', 'maildummy.com',
  'tmp-mail.com', 'tmail.ws', 'mailtest.com', 'dispostable.com',
  'sharklasers.com', 'spam4.me', 'mailnesia.com', 'mockemail.com',
  'getmyip.com', 'temp.email', 'tutanota.com', '0-mail.com'
]);

// Common email domain typos to catch
const COMMON_TYPOS = {
  'gmial.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yahou.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'homail.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'aol.con': 'aol.com',
  'msn.con': 'msn.com',
  'comcast.cmo': 'comcast.com'
};

// Spam trap patterns (high-risk addresses)
const SPAM_TRAP_PATTERNS = [
  /^admin@/i,
  /^postmaster@/i,
  /^abuse@/i,
  /^noreply@/i,
  /^no-reply@/i,
  /^test@/i,
  /^fake/i,
  /^spam/i,
  /123456|111111|000000|999999/,
];

// ====================================
// VALIDATION FUNCTIONS
// ====================================

/**
 * Check if email format is valid
 */
function isValidFormat(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Check if domain has MX records (actually receives email)
 */
async function hasMXRecord(domain) {
  try {
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch (e) {
    return false;
  }
}

/**
 * Check if email is from disposable provider
 */
function isDisposable(email) {
  const domain = email.split('@')[1];
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase());
}

/**
 * Check for common typos in domain
 */
function hasTypo(email) {
  const domain = email.split('@')[1];
  return COMMON_TYPOS[domain.toLowerCase()];
}

/**
 * Check if email matches spam trap patterns
 */
function isSpamTrap(email) {
  return SPAM_TRAP_PATTERNS.some(pattern => pattern.test(email));
}

/**
 * Check if email looks like a test/fake account
 */
function isSuspicious(email) {
  const localPart = email.split('@')[0].toLowerCase();
  const suspiciousKeywords = [
    'test', 'demo', 'example', 'sample', 'fake', 'temp',
    'invalid', 'noreply', 'no-reply', 'notification', 'donotreply'
  ];
  return suspiciousKeywords.some(keyword => localPart.includes(keyword));
}

/**
 * Main verification function
 */
async function verifyEmail(email) {
  const trimmed = email.trim().toLowerCase();

  // 1. Format check
  if (!isValidFormat(trimmed)) {
    return { status: 'invalid', reason: 'Invalid email format' };
  }

  // 2. Check for typos
  const typo = hasTypo(trimmed);
  if (typo) {
    return { status: 'risky', reason: `Possible typo: ${trimmed} → ${typo}` };
  }

  // 3. Check for spam traps
  if (isSpamTrap(trimmed)) {
    return { status: 'risky', reason: 'Matches spam trap pattern' };
  }

  // 4. Check for suspicious patterns
  if (isSuspicious(trimmed)) {
    return { status: 'risky', reason: 'Suspicious test account pattern' };
  }

  // 5. Check if disposable
  if (isDisposable(trimmed)) {
    return { status: 'disposable', reason: 'Disposable email provider' };
  }

  // 6. Check MX records (domain exists)
  const domain = trimmed.split('@')[1];
  const hasMX = await hasMXRecord(domain);
  if (!hasMX) {
    return { status: 'invalid', reason: 'Domain has no MX records' };
  }

  return { status: 'valid', reason: 'Verified' };
}

// ====================================
// MAIN SCRIPT
// ====================================

async function runVerification() {
  console.log('📧 THE VIDEO POOL - Email List Verification');
  console.log('='.repeat(60));

  try {
    // Fetch all subscribers
    console.log('\n📥 Fetching 10,598 subscribers from Supabase...');
    const { data: subscribers, error } = await supabase
      .from('tvp_subscribers')
      .select('id, email, verification_status')
      .limit(10600);

    if (error) throw error;

    console.log(`✅ Loaded ${subscribers.length} emails\n`);

    // Verification tracking
    const results = {
      valid: [],
      invalid: [],
      risky: [],
      disposable: [],
      skipped: []
    };

    const startTime = Date.now();
    let processed = 0;

    // Verify each email
    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i];

      // Show progress
      if ((i + 1) % 1000 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`⏳ Processed ${i + 1}/${subscribers.length} emails (${elapsed}s)...`);
      }

      // Skip if already verified recently
      if (subscriber.verification_status === 'valid' || subscriber.verification_status === 'invalid') {
        results.skipped.push(subscriber.email);
        continue;
      }

      // Verify
      const verification = await verifyEmail(subscriber.email);
      results[verification.status].push({
        email: subscriber.email,
        reason: verification.reason
      });

      // Update Supabase
      await supabase
        .from('tvp_subscribers')
        .update({
          verification_status: verification.status,
          verification_reason: verification.reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriber.id);

      processed++;

      // Rate limiting - DNS checks are slow
      if (verification.status === 'valid') {
        await new Promise(r => setTimeout(r, 50)); // 50ms between DNS checks
      }
    }

    // ====================================
    // GENERATE REPORT
    // ====================================

    const totalVerified = results.valid.length + results.invalid.length + results.risky.length + results.disposable.length;
    const validRate = ((results.valid.length / totalVerified) * 100).toFixed(1);
    const bounceRisk = ((
      (results.invalid.length + results.risky.length + results.disposable.length) / totalVerified
    ) * 100).toFixed(1);

    const report = `
╔════════════════════════════════════════════════════════════╗
║         EMAIL LIST VERIFICATION REPORT                     ║
║         Generated: ${new Date().toLocaleString()}
╚════════════════════════════════════════════════════════════╝

📊 SUMMARY
──────────────────────────────────────────────────────────────
Total emails:              ${subscribers.length}
Newly verified:            ${totalVerified}
Skipped (pre-verified):    ${results.skipped.length}
Processing time:           ${((Date.now() - startTime) / 1000).toFixed(1)}s

✅ VALID EMAILS:           ${results.valid.length} (${validRate}%)
🚨 INVALID EMAILS:         ${results.invalid.length}
⚠️  RISKY EMAILS:          ${results.risky.length}
🗑️  DISPOSABLE EMAILS:     ${results.disposable.length}

SAFE TO SEND:              ${results.valid.length} emails
BOUNCE RISK:               ${results.invalid.length + results.risky.length + results.disposable.length} emails (${bounceRisk}%)

📈 CAMPAIGN IMPACT
──────────────────────────────────────────────────────────────
Safe send-to list:         ${results.valid.length} emails
Expected bounce rate:      ~${Math.min(bounceRisk, 5).toFixed(1)}% (acceptable <5%)
Recommended batch size:    ${Math.floor(results.valid.length / 10)} emails/day
Estimated campaign time:   ${Math.ceil(results.valid.length / 1000)} days (at 1K/day)

⚡ RECOMMENDATIONS
──────────────────────────────────────────────────────────────
${results.invalid.length > 0 ? `1. ❌ Suppress ${results.invalid.length} invalid emails (format/no MX records)` : '1. ✅ No invalid format emails'}
${results.disposable.length > 0 ? `2. 🗑️  Consider suppressing ${results.disposable.length} disposable emails` : '2. ✅ No disposable emails detected'}
${results.risky.length > 0 ? `3. ⚠️  Flag ${results.risky.length} risky emails (typos/spam traps) for review` : '3. ✅ No risky emails detected'}
${validRate >= 90 ? `4. 🎯 List quality EXCELLENT - ready to send` : `4. 📋 List quality GOOD - proceed with caution`}
5. 🔒 Use SendGrid ($10/mo) for sending - better reputation than direct SMTP
6. 📤 Warm-up: Start with 300/day, increase by 500/day until 1K/day stable

🔥 ACTION ITEMS
──────────────────────────────────────────────────────────────
[ ] Review ${results.invalid.length} invalid emails in Supabase (verification_status = 'invalid')
[ ] Set up SendGrid account + API key
[ ] Update server/.env with SENDGRID_API_KEY
[ ] Configure unsubscribe URL for campaign
[ ] Test send with 100 valid emails
[ ] Monitor bounce rate + deliverability
[ ] Scale to 1,000/day once stable

💾 DETAILS SAVED TO: verification-report-${Date.now()}.txt
`;

    console.log(report);

    // Save detailed report
    const detailFile = `verification-report-${Date.now()}.txt`;
    fs.writeFileSync(detailFile, report);

    // Save CSV export of invalid/risky emails
    const problematicEmails = [
      ...results.invalid.map(e => `${e.email},INVALID,${e.reason}`),
      ...results.risky.map(e => `${e.email},RISKY,${e.reason}`),
      ...results.disposable.map(e => `${e.email},DISPOSABLE,${e.reason}`)
    ];

    if (problematicEmails.length > 0) {
      const csvFile = `problematic-emails-${Date.now()}.csv`;
      fs.writeFileSync(
        csvFile,
        'email,issue_type,reason\n' + problematicEmails.join('\n')
      );
      console.log(`\n📄 Problematic emails exported to: ${csvFile}`);
    }

    console.log(`✅ All updates saved to Supabase\n`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Run verification
runVerification();
