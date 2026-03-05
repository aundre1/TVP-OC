#!/usr/bin/env node

/**
 * THE VIDEO POOL - Direct Email Batch Send
 * Sends first 500 promotional emails via Resend API
 * 
 * Usage: RESEND_API_KEY=xxx DATABASE_URL=xxx node send-batch.js
 */

import { Resend } from 'resend';
import pool from './src/db/pool.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const BATCH_SIZE = 500;
const DELAY_MS = 2000; // 2-3 sec between sends

if (!RESEND_API_KEY) {
  console.error('❌ Missing RESEND_API_KEY environment variable');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

async function main() {
  try {
    console.log('🚀 VIDEO POOL EMAIL BATCH SEND');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Batch size: ${BATCH_SIZE}`);
    console.log(`Throttle: ${DELAY_MS}ms between sends`);
    console.log('');

    // Query first 500 unsent, non-unsubscribed subscribers
    const query = `
      SELECT id, email, name FROM tvp_subscribers 
      WHERE (email_sent = false OR email_sent IS NULL) 
        AND (unsubscribed = false OR unsubscribed IS NULL)
      ORDER BY created_at DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [BATCH_SIZE]);
    const subscribers = result.rows;

    if (subscribers.length === 0) {
      console.error('❌ No subscribers to send');
      process.exit(1);
    }

    console.log(`📧 Found ${subscribers.length} subscribers to send`);
    console.log('');

    // Read email template
    const emailPath = path.join(__dirname, 'email/tvp-welcome-back.html');
    const emailTemplate = fs.readFileSync(emailPath, 'utf8');

    let sent = 0;
    let failed = 0;
    const errors = [];

    // Send emails
    for (let i = 0; i < subscribers.length; i++) {
      const sub = subscribers[i];
      
      try {
        // Create unsubscribe token
        const unsubscribeToken = Buffer.from(`${sub.id}:${Date.now()}`).toString('base64');
        
        // Personalize HTML
        const html = emailTemplate
          .replace(/{{EMAIL}}/g, sub.email)
          .replace(/{{UNSUBSCRIBE_TOKEN}}/g, unsubscribeToken)
          .replace(/{{NAME}}/g, sub.name || 'DJ');

        // Send via Resend
        const response = await resend.emails.send({
          from: 'The Video Pool <info@thevideopool.com>',
          to: sub.email,
          subject: 'The Video Pool — 30% Off For Life',
          html,
          reply_to: 'support@thevideopool.com'
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        // Mark as sent in database
        await pool.query(
          'UPDATE tvp_subscribers SET email_sent = true, email_sent_at = $1 WHERE id = $2',
          [new Date().toISOString(), sub.id]
        );

        sent++;
        
        // Progress update every 50
        if ((i + 1) % 50 === 0) {
          console.log(`📊 ${i + 1}/${subscribers.length} sent (${failed} failed)`);
        }

      } catch (error) {
        failed++;
        errors.push({ email: sub.email, error: error.message });
        console.error(`❌ Failed: ${sub.email} — ${error.message}`);
      }

      // Throttle
      if (i < subscribers.length - 1) {
        await new Promise(r => setTimeout(r, DELAY_MS + Math.random() * 1000));
      }
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ BATCH SEND COMPLETE');
    console.log(`   Sent: ${sent}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${subscribers.length}`);
    
    if (failed > 0) {
      console.log('');
      console.log('📋 Failed emails:');
      errors.forEach(e => console.log(`   - ${e.email}: ${e.error}`));
    }

    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
