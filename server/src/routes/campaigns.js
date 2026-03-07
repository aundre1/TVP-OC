/**
 * THE VIDEO POOL - Email Campaign Routes
 *
 * Endpoints for:
 * - POST /api/campaigns/send - Trigger email campaign
 * - GET /api/unsubscribe - Handle unsubscribe links
 * - GET /api/email-preferences - Email preference center
 *
 * Email Provider: Resend (https://resend.com)
 * Superior deliverability, bounce handling, and developer experience
 */

import express from 'express';
import { Resend } from 'resend';
import pool from '../db/pool.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://dev.thevideopool.com';

// Initialize Resend
let resend = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
  console.log('[EMAIL] Resend configured');
} else {
  console.warn('[EMAIL] RESEND_API_KEY not set — email sending disabled');
}

// Cache email template at startup
let cachedEmailTemplate = null;
try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const possiblePaths = [
    path.join(__dirname, '../../email/tvp-welcome-back.html'),
    path.join(__dirname, '../../../email/tvp-welcome-back.html'),
    '/app/email/tvp-welcome-back.html',
  ];

  for (const emailPath of possiblePaths) {
    try {
      if (fs.existsSync(emailPath)) {
        cachedEmailTemplate = fs.readFileSync(emailPath, 'utf8');
        console.log(`[EMAIL] Cached template from: ${emailPath}`);
        break;
      }
    } catch (e) {
      // Try next path
    }
  }

  if (!cachedEmailTemplate) {
    console.warn(`[EMAIL] Email template file not found, using production fallback`);
    // Production template fallback (tvp-welcome-back-v3-production.html)
    // This ensures Railway always sends the correct, professional template
    cachedEmailTemplate = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>The Video Pool — 30% Off For Life</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body, table, td, p, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
    body { margin:0; padding:0; width:100%!important; background-color:#040406; }
    a { color:#00d4ff; text-decoration:none; }

    /* Animated gradient border shimmer */
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .shimmer-border {
      background: linear-gradient(90deg, rgba(0,212,255,0.0) 0%, rgba(0,212,255,0.4) 50%, rgba(0,212,255,0.0) 100%);
      background-size: 200% 100%;
      animation: shimmer 3s infinite;
    }

    /* Pulsing glow on CTA */
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.3); }
      50% { box-shadow: 0 0 35px rgba(0,212,255,0.6), 0 0 60px rgba(0,212,255,0.2); }
    }
    .cta-glow { animation: pulse-glow 2.5s ease-in-out infinite; }

    /* Countdown urgency pulse */
    @keyframes urgency-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .urgency-blink { animation: urgency-pulse 1.8s ease-in-out infinite; }

    @media only screen and (max-width: 620px) {
      .email-container { width:100%!important; }
      .fluid { max-width:100%!important; height:auto!important; }
      .mp { padding-left:16px!important; padding-right:16px!important; }
      .price-card { display:block!important; width:100%!important; margin-bottom:8px!important; }
      .hero-h1 { font-size:34px!important; }
      .hero-sub { font-size:15px!important; }
      .feat-icon { width:48px!important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#040406; font-family:Helvetica,Arial,sans-serif;">

<!-- PREVIEW TEXT — this shows in inbox before opening -->
<div style="display:none;font-size:1px;color:#040406;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  You're one of the first 300. 30% off FOREVER. Once they're gone, this offer dies. We rebuilt everything.
  &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#040406;">
<tr><td align="center" style="padding:12px 10px;">

<!-- EMAIL CONTAINER — 600px -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width:600px; margin:0 auto; border-radius:14px; overflow:hidden; border:1px solid rgba(0,212,255,0.1);">

  <!-- SHIMMER TOP ACCENT LINE -->
  <tr>
    <td style="height:3px; font-size:0; line-height:0;" class="shimmer-border">&nbsp;</td>
  </tr>

  <!-- HEADER — Logo (linked) + Urgency -->
  <tr>
    <td style="background-color:#0a0a0f; padding:14px 24px; border-bottom:1px solid rgba(255,255,255,0.06);" class="mp">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:middle;">
            <a href="https://www.thevideopool.com/welcome-back" target="_blank">
              <img src="https://welcomebackpromo.b-cdn.net/The%20Video%20Pool%20Logo%202.0.png" alt="The Video Pool" width="200" style="display:block; width:200px; height:auto;" class="fluid">
            </a>
          </td>
          <td style="vertical-align:middle; text-align:right;">
            <span class="urgency-blink" style="display:inline-block; background:rgba(255,71,87,0.15); border:1px solid rgba(255,71,87,0.3); color:#ff4757; font-size:11px; font-weight:bold; padding:5px 12px; border-radius:14px; letter-spacing:0.5px; font-family:Helvetica,Arial,sans-serif;">&#9679; SPOTS FILLING</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- PERSONAL NOTE — Why you're getting this -->
  <tr>
    <td style="background-color:#0a0a0f; padding:20px 28px 0 28px;" class="mp">
      <p style="font-family:Helvetica,Arial,sans-serif; font-size:14px; color:#d0d0d4; line-height:1.6; margin:0;">
        You're receiving this because you were once part of The Video Pool — whether as a free or paid member. That means something to us. So before we open this to the public, we wanted to give <strong style="color:#ffffff;">you</strong> first access to something we've been building for the last year.
      </p>
    </td>
  </tr>

  <!-- HERO — DJ Background + Overlay -->
  <tr>
    <td style="background-color:#0a0a0f; padding:0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-image:url('https://welcomebackpromo.b-cdn.net/djbackground.jpeg'); background-size:cover; background-position:center top;">
        <tr>
          <td style="background:linear-gradient(180deg, rgba(10,10,15,0.5) 0%, rgba(10,10,15,0.82) 45%, rgba(10,10,15,0.98) 100%); padding:44px 32px 40px 32px; text-align:center;" class="mp">

            <!-- Headline -->
            <h1 class="hero-h1" style="font-family:'Trebuchet MS',Helvetica,sans-serif; font-size:42px; font-weight:bold; color:#ffffff; line-height:1.08; margin:0 0 14px 0; letter-spacing:-0.5px; text-shadow:0 2px 24px rgba(0,0,0,0.6);">
              We Rebuilt<br><span style="color:#00d4ff;">Everything.</span>
            </h1>

            <p class="hero-sub" style="font-family:Helvetica,Arial,sans-serif; font-size:17px; color:#c8c8cc; line-height:1.5; margin:0 auto 30px auto; max-width:430px; text-shadow:0 1px 10px rgba(0,0,0,0.5);">
              30,000+ videos. Up to 4K quality. Instant downloads.<br>No approvals. No DRM. Built by DJs who get it.
            </p>

            <!-- CTA #1 — with glow animation -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
              <tr>
                <td class="cta-glow" style="border-radius:12px; background-color:#00d4ff;">
                  <a href="https://www.thevideopool.com/welcome-back" target="_blank" style="display:inline-block; padding:16px 48px; font-family:Helvetica,Arial,sans-serif; font-size:18px; font-weight:bold; color:#000000; text-decoration:none; border-radius:12px; letter-spacing:0.3px;">CLAIM YOUR 30% OFF</a>
                </td>
              </tr>
              <tr>
                <td style="text-align:center; padding-top:6px;">
                  <span style="font-family:Helvetica,Arial,sans-serif; font-size:13px; font-weight:bold; color:#00d4ff; letter-spacing:2px;">FOREVER</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- SCARCITY COUNTER BAR -->
  <tr>
    <td style="background-color:#0a0a0f; padding:4px 24px 0 24px;" class="mp">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:rgba(255,71,87,0.08); border:1px solid rgba(255,71,87,0.15); border-radius:10px; padding:0;">
        <tr>
          <td style="padding:14px 20px; text-align:center;">
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:14px; color:#f5f5f7; margin:0; font-weight:600;">
              Only <span style="color:#ff4757; font-size:20px; font-weight:bold;">300</span> lifetime rate spots available
            </p>
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#a1a1aa; margin:4px 0 0 0;">
              When they're gone, this offer is dead. No exceptions. No extensions.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- PLATFORM SCREENSHOT — Brightened, linked -->
  <tr>
    <td style="background-color:#0a0a0f; padding:20px 20px 4px 20px; text-align:center;" class="mp">
      <a href="https://www.thevideopool.com/welcome-back" target="_blank" style="display:block; text-decoration:none;">
        <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(0,212,255,0.15); box-shadow:0 8px 32px rgba(0,0,0,0.3), 0 0 24px rgba(0,212,255,0.06);">
          <img src="https://welcomebackpromo.b-cdn.net/site.jpeg" alt="Browse 30,000+ DJ Videos on The Video Pool" width="560" style="display:block; width:100%; max-width:560px; height:auto;" class="fluid">
        </div>
      </a>
      <p style="font-family:Helvetica,Arial,sans-serif; font-size:11px; color:#6b6b76; margin:8px 0 0 0;">&#8593; Actual platform &mdash; genre filters, BPM, key, version type, instant download</p>
    </td>
  </tr>

  <!-- FEATURES — 4 cards, lighter bg -->
  <tr>
    <td style="background-color:#0a0a0f; padding:28px 24px 8px 24px;" class="mp">
      <p style="font-family:Helvetica,Arial,sans-serif; font-size:11px; font-weight:bold; color:#00d4ff; letter-spacing:2px; text-transform:uppercase; text-align:center; margin:0 0 6px 0;">WHAT'S NEW</p>
      <h2 style="font-family:'Trebuchet MS',Helvetica,sans-serif; font-size:22px; font-weight:bold; color:#f5f5f7; text-align:center; margin:0 0 20px 0;">Not a refresh. A ground up rebuild.</h2>
    </td>
  </tr>

  <!-- Feature 1 — Instant Downloads -->
  <tr>
    <td style="background-color:#0a0a0f; padding:0 24px 8px 24px;" class="mp">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#14141c; border:1px solid rgba(0,212,255,0.08); border-radius:10px;">
        <tr>
          <td class="feat-icon" width="56" style="padding:16px 0 16px 14px; vertical-align:top; text-align:center;">
            <div style="width:38px; height:38px; background:rgba(0,212,255,0.12); border:1px solid rgba(0,212,255,0.2); border-radius:10px; line-height:38px; font-size:17px; text-align:center;">&#9889;</div>
          </td>
          <td style="padding:16px 14px 16px 8px; vertical-align:top;">
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:14px; font-weight:bold; color:#f5f5f7; margin:0 0 3px 0;">Instant Downloads. Zero Gatekeeping.</p>
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#b0b0b8; line-height:1.5; margin:0;">Every version available the moment you find it. Clean, dirty, extended intro, quick edit. No approvals. No DRM. Download it, own it, use it anywhere.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Feature 2 — BPM + Key -->
  <tr>
    <td style="background-color:#0a0a0f; padding:0 24px 8px 24px;" class="mp">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#14141c; border:1px solid rgba(0,212,255,0.08); border-radius:10px;">
        <tr>
          <td class="feat-icon" width="56" style="padding:16px 0 16px 14px; vertical-align:top; text-align:center;">
            <div style="width:38px; height:38px; background:rgba(0,212,255,0.12); border:1px solid rgba(0,212,255,0.2); border-radius:10px; line-height:38px; font-size:17px; text-align:center;">&#127911;</div>
          </td>
          <td style="padding:16px 14px 16px 8px; vertical-align:top;">
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:14px; font-weight:bold; color:#f5f5f7; margin:0 0 3px 0;">BPM, Key, Genre on Every Track</p>
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#b0b0b8; line-height:1.5; margin:0;">Camelot wheel keys and BPM visible at a glance. Filter by genre, era, version type, and label. Build harmonic sets in seconds.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Feature 3 — Discovery + Batch -->
  <tr>
    <td style="background-color:#0a0a0f; padding:0 24px 8px 24px;" class="mp">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#14141c; border:1px solid rgba(0,212,255,0.08); border-radius:10px;">
        <tr>
          <td class="feat-icon" width="56" style="padding:16px 0 16px 14px; vertical-align:top; text-align:center;">
            <div style="width:38px; height:38px; background:rgba(0,212,255,0.12); border:1px solid rgba(0,212,255,0.2); border-radius:10px; line-height:38px; font-size:17px; text-align:center;">&#127916;</div>
          </td>
          <td style="padding:16px 14px 16px 8px; vertical-align:top;">
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:14px; font-weight:bold; color:#f5f5f7; margin:0 0 3px 0;">AI Discovery + Batch Downloads</p>
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#b0b0b8; line-height:1.5; margin:0;">Weekly Discovery Packs curated to your taste. Batch download up to 10 videos at once. Your library, built smarter.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Feature 4 — Customizable Interface -->
  <tr>
    <td style="background-color:#0a0a0f; padding:0 24px 8px 24px;" class="mp">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#1c1c28; border:1px solid rgba(0,212,255,0.12); border-radius:10px;">
        <tr>
          <td class="feat-icon" width="56" style="padding:16px 0 16px 14px; vertical-align:top; text-align:center;">
            <div style="width:38px; height:38px; background:rgba(0,212,255,0.15); border:1px solid rgba(0,212,255,0.25); border-radius:10px; line-height:38px; font-size:17px; text-align:center;">&#9881;&#65039;</div>
          </td>
          <td style="padding:16px 14px 16px 8px; vertical-align:top;">
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:14px; font-weight:bold; color:#f5f5f7; margin:0 0 3px 0;">Fully Customizable Interface</p>
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#b0b0b8; line-height:1.5; margin:0;">Drag and drop sections, collapsible panels, grid or list view, custom genre nav. Set it up once, work faster every session.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- STATS BAR -->
  <tr>
    <td style="background-color:#0a0a0f; padding:16px 24px;" class="mp">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(255,107,74,0.05) 100%); border:1px solid rgba(0,212,255,0.1); border-radius:10px;">
        <tr>
          <td width="33%" style="padding:16px 6px; text-align:center; border-right:1px solid rgba(255,255,255,0.05);">
            <p style="font-family:'Trebuchet MS',Helvetica,sans-serif; font-size:22px; font-weight:bold; color:#00d4ff; margin:0;">30K+</p>
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:10px; color:#a1a1aa; margin:2px 0 0 0; text-transform:uppercase; letter-spacing:0.5px;">Videos</p>
          </td>
          <td width="34%" style="padding:16px 6px; text-align:center; border-right:1px solid rgba(255,255,255,0.05);">
            <p style="font-family:'Trebuchet MS',Helvetica,sans-serif; font-size:22px; font-weight:bold; color:#00d4ff; margin:0;">Up to 4K</p>
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:10px; color:#a1a1aa; margin:2px 0 0 0; text-transform:uppercase; letter-spacing:0.5px;">Quality</p>
          </td>
          <td width="33%" style="padding:16px 6px; text-align:center;">
            <p style="font-family:'Trebuchet MS',Helvetica,sans-serif; font-size:22px; font-weight:bold; color:#00d4ff; margin:0;">Instant</p>
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:10px; color:#a1a1aa; margin:2px 0 0 0; text-transform:uppercase; letter-spacing:0.5px;">Downloads</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- PRICING BLOCK -->
  <tr>
    <td style="background-color:#0a0a0f; padding:8px 24px 20px 24px;" class="mp">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#111118; border:2px solid rgba(0,212,255,0.18); border-radius:14px; overflow:hidden;">
        <!-- Gradient header -->
        <tr>
          <td style="background:linear-gradient(135deg, #00d4ff 0%, #00e676 100%); padding:12px 20px; text-align:center;">
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:13px; font-weight:bold; color:#000000; margin:0; letter-spacing:0.5px;">&#127881; 30% OFF EVERY PLAN &mdash; YOUR RATE IS LOCKED FOR LIFE</p>
          </td>
        </tr>
        <!-- Pricing body -->
        <tr>
          <td style="padding:24px 12px 12px 12px; text-align:center;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <!-- MONTHLY -->
                <td width="33%" class="price-card" style="padding:4px; vertical-align:top;">
                  <a href="https://www.thevideopool.com/checkout" target="_blank" style="display:block; text-decoration:none; color:inherit;">
                  <div style="background-color:#1a1a24; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px 4px; text-align:center; cursor:pointer;">
                    <p style="font-family:Helvetica,Arial,sans-serif; font-size:10px; font-weight:bold; color:#a1a1aa; margin:0; text-transform:uppercase; letter-spacing:1px;">Monthly</p>
                    <p style="font-family:'Trebuchet MS',Helvetica,sans-serif; font-size:12px; color:#6b6b76; margin:6px 0 0 0; text-decoration:line-through;">$34.99</p>
                    <p style="font-family:'Trebuchet MS',Helvetica,sans-serif; font-size:26px; font-weight:bold; color:#f5f5f7; margin:2px 0 0 0; line-height:1;">$24.49</p>
                    <p style="font-family:Helvetica,Arial,sans-serif; font-size:10px; color:#a1a1aa; margin:2px 0 0 0;">/month</p>
                    <div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.06);">
                      <p style="font-family:Helvetica,Arial,sans-serif; font-size:11px; color:#b0b0b8; margin:0; font-weight:600;">200</p>
                      <p style="font-family:Helvetica,Arial,sans-serif; font-size:9px; color:#6b6b76; margin:1px 0 0 0;">downloads/mo</p>
                    </div>
                  </div>
                  </a>
                </td>
                <!-- QUARTERLY (BEST VALUE) -->
                <td width="34%" class="price-card" style="padding:4px; vertical-align:top;">
                  <a href="https://www.thevideopool.com/checkout" target="_blank" style="display:block; text-decoration:none; color:inherit;">
                  <div style="background-color:#1a1a24; border:2px solid #00d4ff; border-radius:10px; padding:14px 4px; text-align:center; position:relative; cursor:pointer;">
                    <p style="font-family:Helvetica,Arial,sans-serif; font-size:9px; font-weight:bold; color:#000; background:#00d4ff; display:inline-block; padding:2px 10px; border-radius:8px; margin:0 0 4px 0; letter-spacing:0.5px;">BEST VALUE</p>
                    <p style="font-family:Helvetica,Arial,sans-serif; font-size:10px; font-weight:bold; color:#a1a1aa; margin:0; text-transform:uppercase; letter-spacing:1px;">Quarterly</p>
                    <p style="font-family:'Trebuchet MS',Helvetica,sans-serif; font-size:12px; color:#6b6b76; margin:6px 0 0 0; text-decoration:line-through;">$99.99</p>
                    <p style="font-family:'Trebuchet MS',Helvetica,sans-serif; font-size:26px; font-weight:bold; color:#f5f5f7; margin:2px 0 0 0; line-height:1;">$69.99</p>
                    <p style="font-family:Helvetica,Arial,sans-serif; font-size:10px; color:#00d4ff; margin:2px 0 0 0; font-weight:600;">/quarter</p>
                    <div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(0,212,255,0.15);">
                      <p style="font-family:Helvetica,Arial,sans-serif; font-size:11px; color:#00d4ff; margin:0; font-weight:600;">250</p>
                      <p style="font-family:Helvetica,Arial,sans-serif; font-size:9px; color:#a1a1aa; margin:1px 0 0 0;">downloads/mo</p>
                    </div>
                  </div>
                  </a>
                </td>
                <!-- ANNUAL -->
                <td width="33%" class="price-card" style="padding:4px; vertical-align:top;">
                  <a href="https://www.thevideopool.com/checkout" target="_blank" style="display:block; text-decoration:none; color:inherit;">
                  <div style="background-color:#1a1a24; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px 4px; text-align:center; cursor:pointer;">
                    <p style="font-family:Helvetica,Arial,sans-serif; font-size:10px; font-weight:bold; color:#a1a1aa; margin:0; text-transform:uppercase; letter-spacing:1px;">Annual</p>
                    <p style="font-family:'Trebuchet MS',Helvetica,sans-serif; font-size:12px; color:#6b6b76; margin:6px 0 0 0; text-decoration:line-through;">$359.99</p>
                    <p style="font-family:'Trebuchet MS',Helvetica,sans-serif; font-size:26px; font-weight:bold; color:#f5f5f7; margin:2px 0 0 0; line-height:1;">$251.99</p>
                    <p style="font-family:Helvetica,Arial,sans-serif; font-size:10px; color:#a1a1aa; margin:2px 0 0 0;">/year</p>
                    <div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.06);">
                      <p style="font-family:Helvetica,Arial,sans-serif; font-size:11px; color:#b0b0b8; margin:0; font-weight:600;">300</p>
                      <p style="font-family:Helvetica,Arial,sans-serif; font-size:9px; color:#6b6b76; margin:1px 0 0 0;">downloads/mo</p>
                    </div>
                  </div>
                  </a>
                </td>
              </tr>
            </table>

            <!-- Rollover + quality note -->
            <p style="font-family:Helvetica,Arial,sans-serif; font-size:11px; color:#a1a1aa; margin:14px 0 0 0; line-height:1.6;">
              All plans: up to <strong style="color:#f5f5f7;">4K quality</strong> &bull; <strong style="color:#f5f5f7;">50 rollover downloads</strong>/mo &bull; <strong style="color:#f5f5f7;">Cancel anytime</strong><br>
              <span style="color:#6b6b76;">Your locked rate never increases. Period.</span>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- FINAL CTA — Big, glowing, with FOREVER -->
  <tr>
    <td style="background-color:#0a0a0f; padding:16px 24px 12px 24px; text-align:center;" class="mp">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
        <tr>
          <td class="cta-glow" style="border-radius:12px; background-color:#00d4ff;">
            <a href="https://www.thevideopool.com/welcome-back" target="_blank" style="display:inline-block; padding:17px 56px; font-family:Helvetica,Arial,sans-serif; font-size:18px; font-weight:bold; color:#000000; text-decoration:none; border-radius:12px; letter-spacing:0.3px;">WELCOME BACK &rarr;</a>
          </td>
        </tr>
        <tr>
          <td style="text-align:center; padding-top:6px;">
            <span style="font-family:Helvetica,Arial,sans-serif; font-size:13px; font-weight:bold; color:#00d4ff; letter-spacing:2px;">LOCK YOUR RATE FOREVER</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- URGENCY CLOSER -->
  <tr>
    <td style="background-color:#0a0a0f; padding:8px 28px 28px 28px; text-align:center;" class="mp">
      <p style="font-family:Helvetica,Arial,sans-serif; font-size:13px; color:#a1a1aa; line-height:1.6; margin:0;">
        This is a one time offer for former members only.<br>
        Once all 300 spots are claimed, this rate is <strong style="color:#ff4757;">gone forever</strong>.<br>
        <span style="color:#6b6b76;">No waitlist. No second chances. No exceptions.</span>
      </p>
    </td>
  </tr>

  <!-- FOOTER — Social (your icons) + Legal -->
  <tr>
    <td style="background-color:#0a0a0f; border-top:1px solid rgba(255,255,255,0.06); padding:24px 24px 16px 24px; text-align:center;" class="mp">
      <!-- Logo -->
      <a href="https://www.thevideopool.com/welcome-back" target="_blank">
        <img src="https://welcomebackpromo.b-cdn.net/The%20Video%20Pool%20Logo%202.0.png" alt="The Video Pool" width="150" style="display:inline-block; width:150px; height:auto; margin-bottom:6px;" class="fluid">
      </a>
      <p style="font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#6b6b76; margin:0 0 14px 0;">Built by DJs. For DJs.</p>

      <!-- Social Icons -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 14px auto;">
        <tr>
          <td style="padding:0 5px;">
            <a href="https://www.facebook.com/TheVideoPool" target="_blank" style="display:inline-block; text-decoration:none;">
              <img src="https://welcomebackpromo.b-cdn.net/social-facebook.png" alt="Facebook" width="28" height="28" style="display:block; width:28px; height:28px; border-radius:6px;">
            </a>
          </td>
          <td style="padding:0 5px;">
            <a href="https://www.instagram.com/thevideopool" target="_blank" style="display:inline-block; text-decoration:none;">
              <img src="https://welcomebackpromo.b-cdn.net/social-instagram.png" alt="Instagram" width="28" height="28" style="display:block; width:28px; height:28px; border-radius:6px;">
            </a>
          </td>
          <td style="padding:0 5px;">
            <a href="mailto:info@thevideopool.com" style="display:inline-block; text-decoration:none;">
              <img src="https://welcomebackpromo.b-cdn.net/social-email.png" alt="Email Us" width="28" height="28" style="display:block; width:28px; height:28px; border-radius:6px;">
            </a>
          </td>
        </tr>
      </table>

      <p style="font-family:Helvetica,Arial,sans-serif; font-size:10px; color:#4a4a54; line-height:1.6; margin:0;">
        &copy; 2026 The Video Pool. All rights reserved.<br>
        <a href="mailto:unsubscribe@thevideopool.com?subject=Unsubscribe%20from%20Video%20Pool%20emails" style="color:#4a4a54; text-decoration:underline;">Unsubscribe</a> &nbsp;&bull;&nbsp;
        <a href="https://www.thevideopool.com/preferences" style="color:#4a4a54; text-decoration:underline;">Manage Preferences</a> &nbsp;&bull;&nbsp;
        <a href="https://www.thevideopool.com/privacy" style="color:#4a4a54; text-decoration:underline;">Privacy</a>
      </p>
    </td>
  </tr>

  <!-- Bottom shimmer accent -->
  <tr>
    <td style="height:3px; font-size:0; line-height:0;" class="shimmer-border">&nbsp;</td>
  </tr>

</table>
<!-- /EMAIL CONTAINER -->

</td></tr></table>
</body>
</html>`;
  }
} catch (e) {
  console.warn(`[EMAIL] Failed to load template at startup: ${e.message}`);
}

// ====================================
// DEBUG ENDPOINT (check database connection)
// ====================================

/**
 * GET /api/campaigns/debug
 * Check database status and available tables
 */
router.get('/campaigns/debug', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL || 'NOT SET';
    const urlWithoutPassword = dbUrl.replace(/:([^@]+)@/, ':***@');

    // List all tables in public schema
    const tableResult = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );
    const tables = tableResult.rows.map(r => r.table_name);

    // Try to query tvp_subscribers if it exists
    let subscriberCount = 0;
    if (tables.includes('tvp_subscribers')) {
      const countResult = await pool.query('SELECT COUNT(*) as count FROM tvp_subscribers');
      subscriberCount = countResult.rows[0]?.count || 0;
    }

    res.json({
      databaseUrl: urlWithoutPassword,
      tablesInDatabase: tables,
      tvpSubscribersFound: tables.includes('tvp_subscribers'),
      subscriberCount: subscriberCount,
      resendConfigured: !!RESEND_API_KEY
    });
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code, stack: error.stack });
  }
});

// ====================================
// SIMPLE TRIGGER ENDPOINT (for testing/admin)
// ====================================

/**
 * POST /api/campaigns/trigger
 * Simple endpoint without CSRF for testing
 */
router.post('/campaigns/trigger', async (req, res) => {
  try {
    if (!RESEND_API_KEY) {
      return res.status(400).json({ error: 'Resend not configured' });
    }

    const limit = parseInt(req.query.limit) || 500;
    const delayMs = 2000;

    console.log(`📧 TRIGGER: Starting campaign send (${limit} emails)`);
    console.log(`DATABASE_URL set: ${!!process.env.DATABASE_URL}`);

    // Check if table exists
    try {
      const tableCheck = await pool.query(
        `SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'tvp_subscribers'
        )`
      );
      const tableExists = tableCheck.rows[0]?.exists;
      console.log(`tvp_subscribers table exists: ${tableExists}`);
    } catch (e) {
      console.log(`Table check error: ${e.message}`);
    }

    // Query emails
    const result = await pool.query(
      `SELECT id, email, name FROM tvp_subscribers
       WHERE (email_sent = false OR email_sent IS NULL)
       AND (unsubscribed = false OR unsubscribed IS NULL)
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    const subscribers = result.rows;
    console.log(`Subscribers found: ${subscribers.length}`);

    if (subscribers.length === 0) {
      // Log total count for diagnosis
      const totalResult = await pool.query('SELECT COUNT(*) as count FROM tvp_subscribers');
      const totalCount = totalResult.rows[0]?.count || 0;
      console.log(`Total subscribers in database: ${totalCount}`);
      return res.json({ message: 'No emails found', sent: 0, totalInDb: totalCount });
    }

    console.log(`✅ Found ${subscribers.length} subscribers to send`);

    // Send asynchronously (don't wait for response)
    res.json({
      status: 'sending',
      queued: subscribers.length,
      message: 'Batch send initiated. Check logs for progress.'
    });

    // Send emails in background
    (async () => {
      let sent = 0, failed = 0;
      try {
        if (!cachedEmailTemplate) {
          throw new Error('Email template not loaded');
        }

        const emailHtml = cachedEmailTemplate;

      for (let i = 0; i < subscribers.length; i++) {
        const sub = subscribers[i];
        try {
          const token = Buffer.from(`${sub.id}:${Date.now()}`).toString('base64');
          const html = emailHtml
            .replace(/{{EMAIL}}/g, sub.email)
            .replace(/{{UNSUBSCRIBE_TOKEN}}/g, token)
            .replace(/{{NAME}}/g, sub.name || 'DJ');

          const response = await resend.emails.send({
            from: 'The Video Pool <info@thevideopool.com>',
            to: sub.email,
            subject: 'The Video Pool — 30% Off For Life',
            html,
            reply_to: 'support@thevideopool.com'
          });

          if (response.error) throw new Error(response.error.message);

          await pool.query(
            'UPDATE tvp_subscribers SET email_sent = true, email_sent_at = $1 WHERE id = $2',
            [new Date().toISOString(), sub.id]
          );

          sent++;
          if ((i + 1) % 50 === 0) {
            console.log(`📊 Progress: ${i + 1}/${subscribers.length} sent`);
          }

        } catch (error) {
          failed++;
          console.error(`❌ Failed ${sub.email}: ${error.message}`);
        }

        if (i < subscribers.length - 1) {
          await new Promise(r => setTimeout(r, delayMs + Math.random() * 1000));
        }
      }

        console.log(`✅ BATCH COMPLETE: ${sent} sent, ${failed} failed`);
      } catch (backgroundError) {
        console.error('❌ Background task error:', backgroundError.message);
      }
    })();

  } catch (error) {
    console.error('Trigger error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// CAMPAIGN SEND ENDPOINT
// ====================================

/**
 * POST /api/campaigns/send
 * Start bulk email campaign
 *
 * Query params:
 * - limit: max emails to send (default: 300)
 * - delay_ms: ms between emails (default: 100)
 * - dry_run: true to preview without sending
 * - include_unverified: include all verification statuses (default: true)
 */
router.post('/campaigns/send', async (req, res) => {
  try {
    if (!RESEND_API_KEY) {
      return res.status(400).json({ error: 'Resend not configured. Set RESEND_API_KEY environment variable.' });
    }

    const limit = parseInt(req.query.limit) || 300;
    const delayMs = parseInt(req.query.delay_ms) || 100;
    const dryRun = req.query.dry_run === 'true';

    console.log(`📧 Starting campaign: limit=${limit}, delay=${delayMs}ms, dryRun=${dryRun}`);

    // Fetch emails - include all verification statuses by default
    // This allows sending to: valid, verified, unknown, and any new statuses
    const result = await pool.query(
      `SELECT id, email, name FROM tvp_subscribers
       WHERE (email_sent = false OR email_sent IS NULL)
       AND (unsubscribed = false OR unsubscribed IS NULL)
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    const subscribers = result.rows;

    if (subscribers.length === 0) {
      return res.json({ message: 'No valid emails to send', sent: 0 });
    }

    console.log(`📤 Found ${subscribers.length} valid emails to send`);

    const results = {
      sent: [],
      failed: [],
      skipped: 0
    };

    // Read HTML email
    const fs = await import('fs');
    const emailHtml = fs.readFileSync('./email/tvp-welcome-back.html', 'utf8');

    // Send to each subscriber
    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i];
      const unsubscribeToken = Buffer.from(`${subscriber.id}:${Date.now()}`).toString('base64');

      // Personalize HTML with email and unsubscribe token
      const personalizedHtml = emailHtml
        .replace(/{{EMAIL}}/g, subscriber.email)
        .replace(/{{UNSUBSCRIBE_TOKEN}}/g, unsubscribeToken)
        .replace(/{{NAME}}/g, subscriber.name || 'DJ');

      if (dryRun) {
        console.log(`[DRY RUN] Would send to: ${subscriber.email}`);
        results.skipped++;
        continue;
      }

      try {
        // Send via Resend (superior deliverability and bounce handling)
        const response = await resend.emails.send({
          from: 'The Video Pool <info@thevideopool.com>',
          to: subscriber.email,
          subject: 'The Video Pool — 30% Off For Life',
          html: personalizedHtml,
          reply_to: 'support@thevideopool.com',
          // Resend automatically handles List-Unsubscribe headers
          // and provides excellent bounce tracking
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        // Update database
        await pool.query(
          'UPDATE tvp_subscribers SET email_sent = true, email_sent_at = $1 WHERE id = $2',
          [new Date().toISOString(), subscriber.id]
        );

        results.sent.push(subscriber.email);
        console.log(`✅ Sent to: ${subscriber.email} (${i + 1}/${subscribers.length})`);

      } catch (err) {
        console.error(`❌ Failed to send to ${subscriber.email}:`, err.message);
        results.failed.push({ email: subscriber.email, error: err.message });
      }

      // Delay between sends to avoid rate limiting
      if (i < subscribers.length - 1) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    res.json({
      campaign_status: 'completed',
      sent: results.sent.length,
      failed: results.failed.length,
      total: subscribers.length,
      provider: 'Resend',
      details: results
    });

  } catch (err) {
    console.error('Campaign error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ====================================
// UNSUBSCRIBE ENDPOINT
// ====================================

/**
 * GET /api/unsubscribe
 * Handle unsubscribe clicks from email
 *
 * Query params:
 * - email: subscriber email
 * - token: unsubscribe token from email link
 */
router.get('/unsubscribe', async (req, res) => {
  try {
    const { email, token } = req.query;

    if (!email || !token) {
      return res.status(400).json({ error: 'Missing email or token' });
    }

    // Find subscriber by email
    const result = await pool.query(
      'SELECT id FROM tvp_subscribers WHERE email = $1',
      [email]
    );

    const subscriber = result.rows[0];

    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    // Mark as unsubscribed
    await pool.query(
      'UPDATE tvp_subscribers SET unsubscribed = true WHERE id = $1',
      [subscriber.id]
    );

    // Return success page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #00d4ff; }
          p { color: #666; font-size: 16px; }
          a { color: #00d4ff; text-decoration: none; }
        </style>
      </head>
      <body>
        <h1>✅ Unsubscribed</h1>
        <p>You've been removed from our mailing list.</p>
        <p>We respect your privacy and won't send you any more emails.</p>
        <p><a href="https://www.thevideopool.com">← Back to The Video Pool</a></p>
      </body>
      </html>
    `);

    console.log(`🚫 Unsubscribed: ${email}`);

  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ====================================
// EMAIL PREFERENCES ENDPOINT
// ====================================

/**
 * GET /api/email-preferences
 * Preference center for subscribers
 */
router.get('/email-preferences', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    const result = await pool.query(
      'SELECT id, email, unsubscribed FROM tvp_subscribers WHERE email = $1',
      [email]
    );

    const subscriber = result.rows[0];

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Preferences - The Video Pool</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', Arial, sans-serif;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
            color: #fff;
            padding: 40px 20px;
            min-height: 100vh;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: rgba(20, 20, 32, 0.8);
            border: 1px solid rgba(0, 212, 255, 0.1);
            border-radius: 12px;
            padding: 40px;
            backdrop-filter: blur(10px);
          }
          h1 {
            color: #00d4ff;
            margin-bottom: 10px;
            font-size: 28px;
          }
          .subtitle {
            color: #888;
            font-size: 14px;
            margin-bottom: 30px;
          }
          .pref-group {
            margin-bottom: 25px;
          }
          .pref-group label {
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 15px;
            background: rgba(0, 212, 255, 0.05);
            border-radius: 8px;
            transition: background 0.2s;
          }
          .pref-group label:hover {
            background: rgba(0, 212, 255, 0.1);
          }
          input[type="checkbox"] {
            margin-right: 12px;
            width: 18px;
            height: 18px;
            cursor: pointer;
          }
          .button-group {
            display: flex;
            gap: 12px;
            margin-top: 30px;
          }
          button {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-save {
            background: #00d4ff;
            color: #000;
          }
          .btn-save:hover {
            background: #00e4ff;
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
          }
          .btn-cancel {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .btn-cancel:hover {
            background: rgba(255, 255, 255, 0.15);
          }
          .message {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
          }
          .message.success {
            background: rgba(76, 175, 80, 0.2);
            color: #4caf50;
            border: 1px solid #4caf50;
            display: block;
          }
          .message.error {
            background: rgba(244, 67, 54, 0.2);
            color: #f44336;
            border: 1px solid #f44336;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📧 Email Preferences</h1>
          <p class="subtitle">Manage how you receive updates from The Video Pool</p>

          <div id="message" class="message"></div>

          <form id="preferencesForm">
            <div class="pref-group">
              <label>
                <input type="checkbox" name="promotions" checked>
                <span>Promotional offers and discounts (like this 30% off campaign)</span>
              </label>
            </div>

            <div class="pref-group">
              <label>
                <input type="checkbox" name="product_updates" checked>
                <span>New features and product updates</span>
              </label>
            </div>

            <div class="pref-group">
              <label>
                <input type="checkbox" name="weekly_picks" checked>
                <span>Weekly hot tracks and DJ picks</span>
              </label>
            </div>

            <div class="pref-group">
              <label>
                <input type="checkbox" name="all_emails">
                <span><strong>Unsubscribe from all emails</strong></span>
              </label>
            </div>

            <div class="button-group">
              <button type="submit" class="btn-save">Save Preferences</button>
              <button type="button" class="btn-cancel" onclick="window.history.back()">Cancel</button>
            </div>
          </form>
        </div>

        <script>
          const form = document.getElementById('preferencesForm');
          const messageDiv = document.getElementById('message');
          const email = '${email}';

          form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const allEmails = form.all_emails.checked;

            try {
              const response = await fetch('/api/update-preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email,
                  unsubscribed: allEmails,
                  preferences: {
                    promotions: form.promotions.checked,
                    product_updates: form.product_updates.checked,
                    weekly_picks: form.weekly_picks.checked
                  }
                })
              });

              const data = await response.json();

              if (response.ok) {
                messageDiv.className = 'message success';
                messageDiv.textContent = '✅ Preferences saved successfully';
                setTimeout(() => window.location.href = 'https://www.thevideopool.com', 2000);
              } else {
                throw new Error(data.error);
              }
            } catch (err) {
              messageDiv.className = 'message error';
              messageDiv.textContent = '❌ Error: ' + err.message;
            }
          });

          // Uncheck all if "unsubscribe all" is checked
          form.all_emails.addEventListener('change', () => {
            if (form.all_emails.checked) {
              form.promotions.checked = false;
              form.product_updates.checked = false;
              form.weekly_picks.checked = false;
            }
          });
        </script>
      </body>
      </html>
    `);

  } catch (err) {
    console.error('Preferences error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/campaigns/webhook
 * Resend webhook receiver for real-time email events
 * Tracks: delivered, bounced, opened, clicked, complained
 */
router.post('/campaigns/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({ error: 'Missing type or data' });
    }

    const eventType = type.split('.')[1]; // 'email.delivered' -> 'delivered'
    // Resend sends `to` as array and uses `email_id` (not `id` or `email`)
    const emailAddress = Array.isArray(data.to) ? data.to[0] : (data.to || data.email);
    const resendId = data.email_id || data.id;

    // Store event in database
    await pool.query(
      `INSERT INTO email_events (email_address, event_type, resend_id, event_data, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [emailAddress, eventType, resendId, JSON.stringify(data)]
    );

    // Mirror bounce/complaint/unsubscribe status to dj_core_contacts if present
    if (emailAddress) {
      if (eventType === 'bounced') {
        await pool.query(
          `UPDATE dj_core_contacts SET bounced = true, bounce_type = 'hard' WHERE LOWER(email) = LOWER($1)`,
          [emailAddress]
        );
      } else if (eventType === 'complained') {
        await pool.query(
          `UPDATE dj_core_contacts SET complained = true WHERE LOWER(email) = LOWER($1)`,
          [emailAddress]
        );
      }
    }

    console.log(`[WEBHOOK] ${eventType}: ${emailAddress}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/campaigns/stats
 * Real-time campaign statistics from email_events
 * Returns: sent, delivered, bounced, opened, clicked, complained counts and rates
 */
router.get('/campaigns/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(DISTINCT email_address) as total_recipients,
        COUNT(CASE WHEN event_type = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN event_type = 'bounced' THEN 1 END) as bounced,
        COUNT(CASE WHEN event_type = 'opened' THEN 1 END) as opened,
        COUNT(CASE WHEN event_type = 'clicked' THEN 1 END) as clicked,
        COUNT(CASE WHEN event_type = 'complained' THEN 1 END) as complained,
        COUNT(CASE WHEN event_type = 'sent' THEN 1 END) as sent
      FROM email_events
    `);

    const stats = result.rows[0];
    const totalSent = stats.sent || 0;
    const delivered = stats.delivered || 0;
    const bounced = stats.bounced || 0;
    const opened = stats.opened || 0;
    const clicked = stats.clicked || 0;
    const complained = stats.complained || 0;

    res.json({
      summary: {
        total_sent: totalSent,
        total_recipients: stats.total_recipients,
        sent: {
          count: totalSent,
          percent: 100
        },
        delivered: {
          count: delivered,
          percent: totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(1) : 0
        },
        bounced: {
          count: bounced,
          percent: totalSent > 0 ? ((bounced / totalSent) * 100).toFixed(1) : 0
        },
        opened: {
          count: opened,
          percent: totalSent > 0 ? ((opened / totalSent) * 100).toFixed(1) : 0
        },
        clicked: {
          count: clicked,
          percent: totalSent > 0 ? ((clicked / totalSent) * 100).toFixed(1) : 0
        },
        complained: {
          count: complained,
          percent: totalSent > 0 ? ((complained / totalSent) * 100).toFixed(1) : 0
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ====================================
// DJ CORE CAMPAIGN TRIGGER
// ====================================

/**
 * POST /api/campaigns/trigger-dj-core
 * Send to external dj_core_contacts list (separate from tvp_subscribers).
 * 2-3 second randomized delay between each send for deliverability.
 *
 * Query params:
 *   limit  — max to send this run (default: 500)
 *   dry_run — true to preview without sending
 */
router.post('/campaigns/trigger-dj-core', async (req, res) => {
  try {
    if (!RESEND_API_KEY) {
      return res.status(400).json({ error: 'Resend not configured' });
    }

    const limit = parseInt(req.query.limit) || 500;
    const dryRun = req.query.dry_run === 'true';

    // Totals for status response
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM dj_core_contacts
       WHERE email_sent = false AND (unsubscribed = false OR unsubscribed IS NULL)
       AND (bounced = false OR bounced IS NULL)`
    );
    const totalUnsent = parseInt(countResult.rows[0]?.total || 0);

    const result = await pool.query(
      `SELECT id, email FROM dj_core_contacts
       WHERE email_sent = false
       AND (unsubscribed = false OR unsubscribed IS NULL)
       AND (bounced = false OR bounced IS NULL)
       ORDER BY created_at ASC
       LIMIT $1`,
      [limit]
    );

    const contacts = result.rows;
    console.log(`[DJ-CORE] ${dryRun ? 'DRY RUN — ' : ''}Found ${contacts.length} contacts (${totalUnsent} total unsent)`);

    if (contacts.length === 0) {
      return res.json({ status: 'done', queued: 0, totalUnsent, message: 'All contacts sent.' });
    }

    if (dryRun) {
      return res.json({
        status: 'dry_run',
        wouldSend: contacts.length,
        totalUnsent,
        sample: contacts.slice(0, 5).map(c => c.email)
      });
    }

    // Respond immediately — send in background
    res.json({
      status: 'sending',
      queued: contacts.length,
      totalUnsent,
      message: `Sending ${contacts.length} emails. Check /api/campaigns/stats for progress.`
    });

    // Background send loop — 2-3 second jitter delay
    // Auto-pauses if bounce rate exceeds BOUNCE_RATE_LIMIT
    const BOUNCE_RATE_LIMIT = 0.20; // 20%
    const BOUNCE_CHECK_INTERVAL = 100; // check every N sends
    const runStartTime = new Date();

    (async () => {
      let sent = 0, failed = 0;
      try {
        if (!cachedEmailTemplate) throw new Error('Email template not loaded');

        for (let i = 0; i < contacts.length; i++) {
          const contact = contacts[i];
          try {
            const token = Buffer.from(`djcore:${contact.id}:${Date.now()}`).toString('base64');
            const html = cachedEmailTemplate
              .replace(/{{EMAIL}}/g, contact.email)
              .replace(/{{UNSUBSCRIBE_TOKEN}}/g, token)
              .replace(/{{NAME}}/g, 'DJ');

            const response = await resend.emails.send({
              from: 'The Video Pool <info@thevideopool.com>',
              to: contact.email,
              subject: 'The Video Pool — 30% Off For Life',
              html,
              reply_to: 'support@thevideopool.com'
            });

            if (response.error) throw new Error(response.error.message);

            const emailId = response.data?.id || null;
            await pool.query(
              `UPDATE dj_core_contacts
               SET email_sent = true, email_sent_at = NOW(), email_id = $1
               WHERE id = $2`,
              [emailId, contact.id]
            );

            sent++;
            if ((i + 1) % 50 === 0) {
              console.log(`[DJ-CORE] Progress: ${i + 1}/${contacts.length} sent`);
            }
          } catch (err) {
            failed++;
            console.error(`[DJ-CORE] Failed ${contact.email}: ${err.message}`);
          }

          // Bounce rate check every BOUNCE_CHECK_INTERVAL sends
          if (sent > 0 && sent % BOUNCE_CHECK_INTERVAL === 0) {
            try {
              const bounceCheck = await pool.query(
                `SELECT
                   COUNT(*) FILTER (WHERE email_sent = true AND email_sent_at >= $1) AS sent_this_run,
                   COUNT(*) FILTER (WHERE bounced = true AND email_sent_at >= $1) AS bounced_this_run
                 FROM dj_core_contacts`,
                [runStartTime]
              );
              const sentCount = parseInt(bounceCheck.rows[0].sent_this_run) || 0;
              const bouncedCount = parseInt(bounceCheck.rows[0].bounced_this_run) || 0;
              const bounceRate = sentCount > 0 ? bouncedCount / sentCount : 0;

              console.log(`[DJ-CORE] Bounce check at ${sent} sent: ${bouncedCount}/${sentCount} = ${(bounceRate * 100).toFixed(1)}%`);

              if (bounceRate > BOUNCE_RATE_LIMIT) {
                console.error(
                  `[DJ-CORE] PAUSED — bounce rate ${(bounceRate * 100).toFixed(1)}% exceeds ${BOUNCE_RATE_LIMIT * 100}% limit. ` +
                  `Sent ${sent} this run, ${bouncedCount} bounced. Halting send.`
                );
                break;
              }
            } catch (checkErr) {
              console.error('[DJ-CORE] Bounce check error (continuing):', checkErr.message);
            }
          }

          if (i < contacts.length - 1) {
            // 2-3 second jitter delay for deliverability
            const delay = 2000 + Math.floor(Math.random() * 1000);
            await new Promise(r => setTimeout(r, delay));
          }
        }

        console.log(`[DJ-CORE] COMPLETE: ${sent} sent, ${failed} failed`);
      } catch (bgErr) {
        console.error('[DJ-CORE] Background error:', bgErr.message);
      }
    })();

  } catch (err) {
    console.error('[DJ-CORE] Trigger error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/campaigns/dj-core-status
 * How many contacts remain, sent, bounced in dj_core_contacts
 */
router.get('/campaigns/dj-core-status', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE email_sent = true) as sent,
        COUNT(*) FILTER (WHERE email_sent = false AND (unsubscribed IS NOT TRUE) AND (bounced IS NOT TRUE)) as ready,
        COUNT(*) FILTER (WHERE bounced = true) as bounced,
        COUNT(*) FILTER (WHERE unsubscribed = true) as unsubscribed,
        COUNT(*) FILTER (WHERE complained = true) as complained
      FROM dj_core_contacts
    `);
    res.json({ ...result.rows[0], timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/campaigns/register-webhook
 * One-time setup endpoint to register Resend webhook with admin API key
 * Body: { adminApiKey: "re_..." }
 * Registers webhook for: delivered, bounced, opened, clicked, complained events
 */
router.post('/campaigns/register-webhook', async (req, res) => {
  try {
    const { adminApiKey } = req.body;

    if (!adminApiKey) {
      return res.status(400).json({ error: 'adminApiKey required in request body' });
    }

    const webhookUrl = process.env.WEBHOOK_URL || 'https://tvp-oc-production.up.railway.app/api/campaigns/webhook';
    const events = ['email.delivered', 'email.bounced', 'email.opened', 'email.clicked', 'email.complained'];

    const response = await fetch('https://api.resend.com/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: webhookUrl,
        events: events
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Webhook registration failed:', data);
      return res.status(response.status).json({ error: data.message || 'Failed to register webhook' });
    }

    console.log('[WEBHOOK] Successfully registered with Resend:', data);
    res.json({
      success: true,
      message: 'Webhook registered successfully',
      webhook_id: data.id,
      webhook_url: webhookUrl,
      events: events
    });
  } catch (err) {
    console.error('Webhook registration error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
