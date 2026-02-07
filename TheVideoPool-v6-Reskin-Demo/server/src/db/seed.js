// ===========================================
// THE VIDEO POOL - Database Seed Script
// Seeds initial data: memberships, admin, videos
// ===========================================

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction, closePool } from './config.js';
import dotenv from 'dotenv';

dotenv.config();

// ===========================================
// SEED DATA
// ===========================================

/**
 * 4 Membership tiers
 */
const memberships = [
  {
    name: 'Free',
    slug: 'free',
    description: 'Try The Video Pool with limited access',
    price_monthly: null,
    price_annual: null,
    price_lifetime: null,
    stripe_price_monthly: null,
    stripe_price_annual: null,
    stripe_price_lifetime: null,
    features: {
      preview: true,
      download: false,
      streaming: true,
      maxQuality: '720p',
      dailyPreviews: 10,
      sets: 1,
      favorites: 50,
    },
    daily_download_limit: 0,
    monthly_download_limit: 0,
    allowed_qualities: ['720p'],
    display_order: 1,
    is_featured: false,
    badge_color: '#6b7280',
  },
  {
    name: 'Basic',
    slug: 'basic',
    description: 'Perfect for casual DJs and enthusiasts',
    price_monthly: 19.99,
    price_annual: 199.99,
    price_lifetime: null,
    stripe_price_monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY || 'price_basic_monthly',
    stripe_price_annual: process.env.STRIPE_PRICE_BASIC_ANNUAL || 'price_basic_annual',
    stripe_price_lifetime: null,
    features: {
      preview: true,
      download: true,
      streaming: true,
      maxQuality: '1080p',
      dailyDownloads: 25,
      monthlyDownloads: 500,
      sets: 10,
      favorites: 500,
      historyDays: 30,
    },
    daily_download_limit: 25,
    monthly_download_limit: 500,
    allowed_qualities: ['720p', '1080p'],
    display_order: 2,
    is_featured: false,
    badge_color: '#3b82f6',
  },
  {
    name: 'Pro',
    slug: 'pro',
    description: 'For professional DJs who need it all',
    price_monthly: 39.99,
    price_annual: 399.99,
    price_lifetime: null,
    stripe_price_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    stripe_price_annual: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual',
    stripe_price_lifetime: null,
    features: {
      preview: true,
      download: true,
      streaming: true,
      maxQuality: '4k',
      dailyDownloads: 100,
      monthlyDownloads: null, // unlimited
      sets: null, // unlimited
      favorites: null, // unlimited
      historyDays: 365,
      prioritySupport: true,
      earlyAccess: true,
      bulkDownload: true,
    },
    daily_download_limit: 100,
    monthly_download_limit: null,
    allowed_qualities: ['720p', '1080p', '4k'],
    display_order: 3,
    is_featured: true,
    badge_color: '#00d4ff',
  },
  {
    name: 'Lifetime',
    slug: 'lifetime',
    description: 'One-time purchase, unlimited access forever',
    price_monthly: null,
    price_annual: null,
    price_lifetime: 999.99,
    stripe_price_monthly: null,
    stripe_price_annual: null,
    stripe_price_lifetime: process.env.STRIPE_PRICE_LIFETIME || 'price_lifetime',
    features: {
      preview: true,
      download: true,
      streaming: true,
      maxQuality: '4k',
      dailyDownloads: null, // unlimited
      monthlyDownloads: null, // unlimited
      sets: null, // unlimited
      favorites: null, // unlimited
      historyDays: null, // forever
      prioritySupport: true,
      earlyAccess: true,
      bulkDownload: true,
      lifetimeUpdates: true,
      exclusiveContent: true,
    },
    daily_download_limit: null,
    monthly_download_limit: null,
    allowed_qualities: ['720p', '1080p', '4k'],
    display_order: 4,
    is_featured: false,
    badge_color: '#fbbf24',
  },
];

/**
 * Sample admin user
 */
const adminUser = {
  email: 'admin@thevideopool.com',
  password: 'Admin123!@#', // Will be hashed
  name: 'TVP Admin',
  role: 'admin',
  membership_type: 'lifetime',
};

/**
 * 50+ sample videos across genres
 */
const sampleVideos = [
  // Pop (10 videos)
  { title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop', subgenre: 'Synth-Pop', bpm: 171, key: 'Fm', camelot_key: '4A', release_year: 2020, duration: 200, is_explicit: false },
  { title: 'Anti-Hero', artist: 'Taylor Swift', genre: 'Pop', subgenre: 'Indie Pop', bpm: 97, key: 'E', camelot_key: '12B', release_year: 2022, duration: 200, is_explicit: false },
  { title: 'As It Was', artist: 'Harry Styles', genre: 'Pop', subgenre: 'Synth-Pop', bpm: 174, key: 'F#m', camelot_key: '11A', release_year: 2022, duration: 167, is_explicit: false },
  { title: 'Flowers', artist: 'Miley Cyrus', genre: 'Pop', subgenre: 'Disco-Pop', bpm: 118, key: 'Am', camelot_key: '8A', release_year: 2023, duration: 200, is_explicit: false },
  { title: 'Levitating', artist: 'Dua Lipa', genre: 'Pop', subgenre: 'Disco-Pop', bpm: 103, key: 'Bm', camelot_key: '10A', release_year: 2020, duration: 203, is_explicit: false },
  { title: 'Shape of You', artist: 'Ed Sheeran', genre: 'Pop', subgenre: 'Dance-Pop', bpm: 96, key: 'C#m', camelot_key: '1A', release_year: 2017, duration: 234, is_explicit: false },
  { title: 'Watermelon Sugar', artist: 'Harry Styles', genre: 'Pop', subgenre: 'Funk-Pop', bpm: 95, key: 'Dm', camelot_key: '7A', release_year: 2020, duration: 174, is_explicit: false },
  { title: 'Save Your Tears', artist: 'The Weeknd', genre: 'Pop', subgenre: 'Synth-Pop', bpm: 118, key: 'Ab', camelot_key: '4B', release_year: 2020, duration: 215, is_explicit: false },
  { title: 'Stay', artist: 'Kid LAROI & Justin Bieber', genre: 'Pop', subgenre: 'Dance-Pop', bpm: 170, key: 'C', camelot_key: '8B', release_year: 2021, duration: 141, is_explicit: true },
  { title: 'Cruel Summer', artist: 'Taylor Swift', genre: 'Pop', subgenre: 'Synth-Pop', bpm: 170, key: 'A', camelot_key: '11B', release_year: 2019, duration: 178, is_explicit: false },

  // Hip-Hop (10 videos)
  { title: 'God\'s Plan', artist: 'Drake', genre: 'Hip-Hop', subgenre: 'Trap', bpm: 77, key: 'Ab', camelot_key: '4B', release_year: 2018, duration: 198, is_explicit: true },
  { title: 'HUMBLE.', artist: 'Kendrick Lamar', genre: 'Hip-Hop', subgenre: 'West Coast', bpm: 150, key: 'F#m', camelot_key: '11A', release_year: 2017, duration: 177, is_explicit: true },
  { title: 'Sicko Mode', artist: 'Travis Scott', genre: 'Hip-Hop', subgenre: 'Trap', bpm: 155, key: 'Am', camelot_key: '8A', release_year: 2018, duration: 312, is_explicit: true },
  { title: 'Bad and Boujee', artist: 'Migos', genre: 'Hip-Hop', subgenre: 'Trap', bpm: 127, key: 'Am', camelot_key: '8A', release_year: 2016, duration: 343, is_explicit: true },
  { title: 'Rockstar', artist: 'Post Malone', genre: 'Hip-Hop', subgenre: 'Trap', bpm: 160, key: 'Dm', camelot_key: '7A', release_year: 2017, duration: 218, is_explicit: true },
  { title: 'Old Town Road', artist: 'Lil Nas X', genre: 'Hip-Hop', subgenre: 'Country-Trap', bpm: 136, key: 'G', camelot_key: '9B', release_year: 2019, duration: 157, is_explicit: false },
  { title: 'WAP', artist: 'Cardi B', genre: 'Hip-Hop', subgenre: 'Trap', bpm: 133, key: 'Fm', camelot_key: '4A', release_year: 2020, duration: 186, is_explicit: true },
  { title: 'Money Trees', artist: 'Kendrick Lamar', genre: 'Hip-Hop', subgenre: 'West Coast', bpm: 72, key: 'Bbm', camelot_key: '3A', release_year: 2012, duration: 386, is_explicit: true },
  { title: 'Hotline Bling', artist: 'Drake', genre: 'Hip-Hop', subgenre: 'R&B-Rap', bpm: 135, key: 'Dm', camelot_key: '7A', release_year: 2015, duration: 267, is_explicit: true },
  { title: 'Industry Baby', artist: 'Lil Nas X', genre: 'Hip-Hop', subgenre: 'Pop-Rap', bpm: 150, key: 'C#m', camelot_key: '1A', release_year: 2021, duration: 212, is_explicit: true },

  // Latin (10 videos)
  { title: 'Despacito', artist: 'Luis Fonsi', genre: 'Latin', subgenre: 'Reggaeton', bpm: 89, key: 'Bm', camelot_key: '10A', release_year: 2017, duration: 282, is_explicit: false },
  { title: 'Mi Gente', artist: 'J Balvin', genre: 'Latin', subgenre: 'Reggaeton', bpm: 105, key: 'Dm', camelot_key: '7A', release_year: 2017, duration: 189, is_explicit: false },
  { title: 'Taki Taki', artist: 'DJ Snake', genre: 'Latin', subgenre: 'Reggaeton', bpm: 96, key: 'Bbm', camelot_key: '3A', release_year: 2018, duration: 220, is_explicit: true },
  { title: 'Dákiti', artist: 'Bad Bunny', genre: 'Latin', subgenre: 'Reggaeton', bpm: 110, key: 'Em', camelot_key: '9A', release_year: 2020, duration: 205, is_explicit: false },
  { title: 'Hawái', artist: 'Maluma', genre: 'Latin', subgenre: 'Reggaeton', bpm: 90, key: 'F#m', camelot_key: '11A', release_year: 2020, duration: 199, is_explicit: false },
  { title: 'Tusa', artist: 'Karol G', genre: 'Latin', subgenre: 'Reggaeton', bpm: 92, key: 'Cm', camelot_key: '5A', release_year: 2019, duration: 200, is_explicit: true },
  { title: 'Con Altura', artist: 'ROSALÍA', genre: 'Latin', subgenre: 'Reggaeton', bpm: 98, key: 'Gm', camelot_key: '6A', release_year: 2019, duration: 177, is_explicit: false },
  { title: 'Baila Baila Baila', artist: 'Ozuna', genre: 'Latin', subgenre: 'Reggaeton', bpm: 176, key: 'Am', camelot_key: '8A', release_year: 2019, duration: 210, is_explicit: false },
  { title: 'La Canción', artist: 'J Balvin & Bad Bunny', genre: 'Latin', subgenre: 'Reggaeton', bpm: 176, key: 'Bbm', camelot_key: '3A', release_year: 2019, duration: 241, is_explicit: false },
  { title: 'Vivir Mi Vida', artist: 'Marc Anthony', genre: 'Latin', subgenre: 'Salsa', bpm: 100, key: 'Am', camelot_key: '8A', release_year: 2013, duration: 279, is_explicit: false },

  // Country (8 videos)
  { title: 'Wagon Wheel', artist: 'Darius Rucker', genre: 'Country', subgenre: 'Country-Rock', bpm: 152, key: 'A', camelot_key: '11B', release_year: 2013, duration: 238, is_explicit: false },
  { title: 'Body Like a Back Road', artist: 'Sam Hunt', genre: 'Country', subgenre: 'Country-Pop', bpm: 102, key: 'G', camelot_key: '9B', release_year: 2017, duration: 192, is_explicit: false },
  { title: 'Meant to Be', artist: 'Bebe Rexha', genre: 'Country', subgenre: 'Country-Pop', bpm: 83, key: 'Bb', camelot_key: '6B', release_year: 2017, duration: 171, is_explicit: false },
  { title: 'Cruise', artist: 'Florida Georgia Line', genre: 'Country', subgenre: 'Bro-Country', bpm: 76, key: 'Bb', camelot_key: '6B', release_year: 2012, duration: 199, is_explicit: false },
  { title: 'Tennessee Whiskey', artist: 'Chris Stapleton', genre: 'Country', subgenre: 'Soul-Country', bpm: 96, key: 'A', camelot_key: '11B', release_year: 2015, duration: 287, is_explicit: false },
  { title: 'The Bones', artist: 'Maren Morris', genre: 'Country', subgenre: 'Country-Pop', bpm: 73, key: 'F', camelot_key: '7B', release_year: 2019, duration: 192, is_explicit: false },
  { title: 'Last Night', artist: 'Morgan Wallen', genre: 'Country', subgenre: 'Country-Pop', bpm: 104, key: 'G', camelot_key: '9B', release_year: 2023, duration: 173, is_explicit: false },
  { title: 'Fast Car', artist: 'Luke Combs', genre: 'Country', subgenre: 'Country-Rock', bpm: 105, key: 'C', camelot_key: '8B', release_year: 2023, duration: 268, is_explicit: false },

  // EDM (8 videos)
  { title: 'Titanium', artist: 'David Guetta', genre: 'EDM', subgenre: 'Electro House', bpm: 126, key: 'Eb', camelot_key: '5B', release_year: 2011, duration: 245, is_explicit: false },
  { title: 'Wake Me Up', artist: 'Avicii', genre: 'EDM', subgenre: 'Progressive House', bpm: 124, key: 'Bm', camelot_key: '10A', release_year: 2013, duration: 249, is_explicit: false },
  { title: 'Lean On', artist: 'Major Lazer', genre: 'EDM', subgenre: 'Moombahton', bpm: 98, key: 'Am', camelot_key: '8A', release_year: 2015, duration: 176, is_explicit: false },
  { title: 'Clarity', artist: 'Zedd', genre: 'EDM', subgenre: 'Electro House', bpm: 128, key: 'G#m', camelot_key: '1A', release_year: 2012, duration: 270, is_explicit: false },
  { title: 'Animals', artist: 'Martin Garrix', genre: 'EDM', subgenre: 'Big Room', bpm: 128, key: 'F#m', camelot_key: '11A', release_year: 2013, duration: 186, is_explicit: false },
  { title: 'Faded', artist: 'Alan Walker', genre: 'EDM', subgenre: 'Progressive House', bpm: 90, key: 'Fm', camelot_key: '4A', release_year: 2015, duration: 212, is_explicit: false },
  { title: 'This Is What You Came For', artist: 'Calvin Harris', genre: 'EDM', subgenre: 'Future Bass', bpm: 123, key: 'Ab', camelot_key: '4B', release_year: 2016, duration: 222, is_explicit: false },
  { title: 'Scary Monsters and Nice Sprites', artist: 'Skrillex', genre: 'EDM', subgenre: 'Dubstep', bpm: 140, key: 'Em', camelot_key: '9A', release_year: 2010, duration: 263, is_explicit: false },

  // R&B (8 videos)
  { title: 'Blinding Lights', artist: 'The Weeknd', genre: 'R&B', subgenre: 'Synth-R&B', bpm: 171, key: 'Fm', camelot_key: '4A', release_year: 2020, duration: 200, is_explicit: false },
  { title: 'Thinking Out Loud', artist: 'Ed Sheeran', genre: 'R&B', subgenre: 'Soul', bpm: 79, key: 'D', camelot_key: '10B', release_year: 2014, duration: 281, is_explicit: false },
  { title: 'All of Me', artist: 'John Legend', genre: 'R&B', subgenre: 'Soul', bpm: 120, key: 'Ab', camelot_key: '4B', release_year: 2013, duration: 270, is_explicit: false },
  { title: 'Good Days', artist: 'SZA', genre: 'R&B', subgenre: 'Neo-Soul', bpm: 121, key: 'A', camelot_key: '11B', release_year: 2020, duration: 279, is_explicit: true },
  { title: 'Kiss Me More', artist: 'Doja Cat', genre: 'R&B', subgenre: 'Pop-R&B', bpm: 111, key: 'Bb', camelot_key: '6B', release_year: 2021, duration: 209, is_explicit: true },
  { title: 'Adorn', artist: 'Miguel', genre: 'R&B', subgenre: 'Neo-Soul', bpm: 82, key: 'Bb', camelot_key: '6B', release_year: 2012, duration: 204, is_explicit: true },
  { title: 'Best Part', artist: 'Daniel Caesar', genre: 'R&B', subgenre: 'Neo-Soul', bpm: 73, key: 'Db', camelot_key: '8B', release_year: 2017, duration: 216, is_explicit: false },
  { title: 'On The Floor', artist: 'Jennifer Lopez', genre: 'R&B', subgenre: 'Dance', bpm: 130, key: 'C#m', camelot_key: '1A', release_year: 2011, duration: 229, is_explicit: false },
];

// ===========================================
// SEED FUNCTIONS
// ===========================================

/**
 * Seed memberships
 */
async function seedMemberships() {
  console.log('Seeding memberships...');

  for (const membership of memberships) {
    const existingResult = await query(
      'SELECT id FROM memberships WHERE slug = $1',
      [membership.slug]
    );

    if (existingResult.rows.length > 0) {
      console.log(`  Membership "${membership.name}" already exists, skipping.`);
      continue;
    }

    await query(
      `INSERT INTO memberships (
        name, slug, description,
        price_monthly, price_annual, price_lifetime,
        stripe_price_monthly, stripe_price_annual, stripe_price_lifetime,
        features, daily_download_limit, monthly_download_limit,
        allowed_qualities, display_order, is_featured, badge_color
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        membership.name,
        membership.slug,
        membership.description,
        membership.price_monthly,
        membership.price_annual,
        membership.price_lifetime,
        membership.stripe_price_monthly,
        membership.stripe_price_annual,
        membership.stripe_price_lifetime,
        JSON.stringify(membership.features),
        membership.daily_download_limit,
        membership.monthly_download_limit,
        membership.allowed_qualities,
        membership.display_order,
        membership.is_featured,
        membership.badge_color,
      ]
    );

    console.log(`  Created membership: ${membership.name}`);
  }

  console.log('Memberships seeded.');
}

/**
 * Seed admin user
 */
async function seedAdminUser() {
  console.log('Seeding admin user...');

  // Check if admin already exists
  const existingResult = await query(
    'SELECT id FROM users WHERE email = $1',
    [adminUser.email]
  );

  if (existingResult.rows.length > 0) {
    console.log('  Admin user already exists, skipping.');
    return;
  }

  // Get lifetime membership ID
  const membershipResult = await query(
    'SELECT id FROM memberships WHERE slug = $1',
    ['lifetime']
  );
  const membershipId = membershipResult.rows[0]?.id;

  // Hash password
  const passwordHash = await bcrypt.hash(adminUser.password, 12);

  await query(
    `INSERT INTO users (
      uuid, email, email_verified, password_hash, name,
      membership_type, membership_id, membership_started_at,
      status, role
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      uuidv4(),
      adminUser.email,
      true,
      passwordHash,
      adminUser.name,
      adminUser.membership_type,
      membershipId,
      new Date(),
      'active',
      adminUser.role,
    ]
  );

  console.log(`  Created admin user: ${adminUser.email}`);
  console.log(`  Password: ${adminUser.password}`);
  console.log('Admin user seeded.');
}

/**
 * Seed sample videos
 */
async function seedVideos() {
  console.log('Seeding videos...');

  let created = 0;
  let skipped = 0;

  for (const video of sampleVideos) {
    // Check if video already exists (by title + artist)
    const existingResult = await query(
      'SELECT id FROM videos WHERE title = $1 AND artist = $2',
      [video.title, video.artist]
    );

    if (existingResult.rows.length > 0) {
      skipped++;
      continue;
    }

    // Determine decade from release year
    const decade = video.release_year
      ? `${Math.floor(video.release_year / 10) * 10}s`
      : null;

    // Generate tags from metadata
    const tags = [
      video.genre.toLowerCase(),
      video.subgenre?.toLowerCase(),
      video.artist.split(' ')[0].toLowerCase(),
      decade,
      video.is_explicit ? 'explicit' : 'clean',
    ].filter(Boolean);

    // Insert video
    const videoResult = await query(
      `INSERT INTO videos (
        uuid, title, artist, genre, subgenre,
        bpm, key, camelot_key, duration, release_year,
        decade, tags, is_explicit,
        has_clean_version, has_dirty_version,
        highest_quality, thumbnail_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id`,
      [
        uuidv4(),
        video.title,
        video.artist,
        video.genre,
        video.subgenre,
        video.bpm,
        video.key,
        video.camelot_key,
        video.duration,
        video.release_year,
        decade,
        tags,
        video.is_explicit,
        !video.is_explicit,    // has_clean_version
        video.is_explicit,     // has_dirty_version
        '1080p',
        `https://img.thevideopool.com/thumbnails/${encodeURIComponent(video.artist)}-${encodeURIComponent(video.title)}.jpg`,
      ]
    );

    const videoId = videoResult.rows[0].id;

    // Create video versions (clean 720p, clean 1080p, possibly dirty versions)
    const versions = [
      { version_type: 'clean', quality: '720p' },
      { version_type: 'clean', quality: '1080p' },
    ];

    if (video.is_explicit) {
      versions.push(
        { version_type: 'dirty', quality: '720p' },
        { version_type: 'dirty', quality: '1080p' }
      );
    }

    for (const version of versions) {
      const fileName = `${video.artist} - ${video.title} (${version.version_type}) [${version.quality}].mp4`
        .replace(/[^a-zA-Z0-9\-\[\]() .]/g, '');

      await query(
        `INSERT INTO video_versions (
          video_id, version_type, quality,
          file_url, file_key, file_size, file_format
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          videoId,
          version.version_type,
          version.quality,
          `https://s3.wasabisys.com/tvp-videos/${encodeURIComponent(fileName)}`,
          `videos/${fileName}`,
          version.quality === '1080p' ? 150000000 : 75000000, // Approximate sizes
          'mp4',
        ]
      );
    }

    created++;
  }

  console.log(`  Created ${created} videos, skipped ${skipped} (already exist).`);
  console.log('Videos seeded.');
}

/**
 * Create sample user set (playlist)
 */
async function seedSampleSet() {
  console.log('Seeding sample set...');

  // Get admin user
  const userResult = await query(
    'SELECT id FROM users WHERE email = $1',
    [adminUser.email]
  );

  if (userResult.rows.length === 0) {
    console.log('  Admin user not found, skipping set creation.');
    return;
  }

  const userId = userResult.rows[0].id;

  // Check if sample set exists
  const existingResult = await query(
    'SELECT id FROM user_sets WHERE user_id = $1 AND name = $2',
    [userId, 'Party Starters']
  );

  if (existingResult.rows.length > 0) {
    console.log('  Sample set already exists, skipping.');
    return;
  }

  // Create set
  const setResult = await query(
    `INSERT INTO user_sets (
      uuid, user_id, name, description, share_id, is_public, color
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id`,
    [
      uuidv4(),
      userId,
      'Party Starters',
      'High-energy tracks to get the party going',
      'party2024',
      true,
      '#00d4ff',
    ]
  );

  const setId = setResult.rows[0].id;

  // Add some videos to the set
  const videoTitles = ['Blinding Lights', 'Levitating', 'Titanium', 'Wake Me Up', 'Animals'];
  let position = 1;

  for (const title of videoTitles) {
    const videoResult = await query(
      'SELECT id FROM videos WHERE title = $1 LIMIT 1',
      [title]
    );

    if (videoResult.rows.length > 0) {
      await query(
        'INSERT INTO set_tracks (set_id, video_id, position) VALUES ($1, $2, $3)',
        [setId, videoResult.rows[0].id, position++]
      );
    }
  }

  console.log(`  Created sample set with ${position - 1} tracks.`);
  console.log('Sample set seeded.');
}

/**
 * Print summary statistics
 */
async function printSummary() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════');
  console.log('SEED SUMMARY');
  console.log('═══════════════════════════════════════════════');

  const stats = await Promise.all([
    query('SELECT COUNT(*) as count FROM memberships'),
    query('SELECT COUNT(*) as count FROM users'),
    query('SELECT COUNT(*) as count FROM videos'),
    query('SELECT COUNT(*) as count FROM video_versions'),
    query('SELECT COUNT(*) as count FROM user_sets'),
    query('SELECT COUNT(*) as count FROM set_tracks'),
  ]);

  console.log(`  Memberships:     ${stats[0].rows[0].count}`);
  console.log(`  Users:           ${stats[1].rows[0].count}`);
  console.log(`  Videos:          ${stats[2].rows[0].count}`);
  console.log(`  Video Versions:  ${stats[3].rows[0].count}`);
  console.log(`  User Sets:       ${stats[4].rows[0].count}`);
  console.log(`  Set Tracks:      ${stats[5].rows[0].count}`);
  console.log('═══════════════════════════════════════════════');

  // Print genre breakdown
  const genreResult = await query(`
    SELECT genre, COUNT(*) as count
    FROM videos
    GROUP BY genre
    ORDER BY count DESC
  `);

  console.log('\nVideos by Genre:');
  for (const row of genreResult.rows) {
    console.log(`  ${row.genre.padEnd(15)} ${row.count}`);
  }
}

// ===========================================
// MAIN SEED FUNCTION
// ===========================================

async function seed() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   THE VIDEO POOL - Database Seed Script       ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');

  try {
    // Seed in order (respecting foreign keys)
    await seedMemberships();
    console.log('');

    await seedAdminUser();
    console.log('');

    await seedVideos();
    console.log('');

    await seedSampleSet();

    await printSummary();

    console.log('\nDatabase seeding complete!');
    console.log('');
    console.log('You can now start the server: npm run dev');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════');
    console.error('Seeding failed!');
    console.error('═══════════════════════════════════════════════');
    console.error('Error:', error.message);
    console.error('');

    if (error.code === '42P01') {
      console.error('Tables do not exist. Run init first: npm run db:init');
    }

    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run seed
seed();
