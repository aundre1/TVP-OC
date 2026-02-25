// Mock Backend Server for The Video Pool
// Provides realistic API responses for development

import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Middleware for CORS and JSON
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Simulated delay for realistic API feel
server.use((req, res, next) => {
  setTimeout(next, 100 + Math.random() * 200);
});

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  const user = db.get('users').find({ email }).value();

  if (user && user.password === password) {
    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser,
      token: `mock-jwt-token-${Date.now()}`,
      requires2FA: user.twoFactorEnabled
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

server.post('/api/auth/google', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: 1 }).value();
  const { password: _, ...safeUser } = user;

  res.json({
    success: true,
    user: safeUser,
    token: `mock-google-jwt-${Date.now()}`,
    isNewUser: false
  });
});

server.post('/api/auth/register', (req, res) => {
  const { email, username, password } = req.body;
  const db = router.db;

  // Check if email exists
  const existing = db.get('users').find({ email }).value();
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const newUser = {
    id: Date.now(),
    email,
    username,
    password,
    membershipId: 1,
    membershipType: 'free',
    isAdmin: false,
    emailVerified: false,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    downloadsThisMonth: 0,
    downloadLimit: 2,
    bonusCredits: 0,
    trialStartDate: new Date().toISOString(),
    trialEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
  };

  db.get('users').push(newUser).write();

  // Generate verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  db.get('verification_codes').push({
    id: Date.now(),
    userId: newUser.id,
    email: newUser.email,
    code: verificationCode,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
  }).write();

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({
    success: true,
    user: safeUser,
    message: 'Verification code sent to email',
    // In dev, return the code for testing
    _devCode: verificationCode
  });
});

server.post('/api/auth/verify-email', (req, res) => {
  const { token, email, code } = req.body;
  const db = router.db;

  // Token-based verification (legacy)
  if (token) {
    // For token-based, just accept any token in dev
    res.json({ success: true, message: 'Email verified successfully', verified: true });
    return;
  }

  // Code-based verification
  const verification = db.get('verification_codes')
    .find({ email, code })
    .value();

  if (verification) {
    // Mark user as verified
    db.get('users')
      .find({ email })
      .assign({ emailVerified: true })
      .write();

    // Remove used code
    db.get('verification_codes').remove({ id: verification.id }).write();

    res.json({ success: true, message: 'Email verified successfully', verified: true });
  } else {
    res.status(400).json({ error: 'Invalid or expired verification code' });
  }
});

// Code-based verification endpoint (preferred)
server.post('/api/auth/verify-email-code', (req, res) => {
  const { email, code } = req.body;
  const db = router.db;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  const verification = db.get('verification_codes')
    .find({ email, code })
    .value();

  if (verification) {
    // Check expiration
    if (new Date(verification.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // Mark user as verified
    db.get('users')
      .find({ email })
      .assign({ emailVerified: true })
      .write();

    // Remove used code
    db.get('verification_codes').remove({ id: verification.id }).write();

    res.json({ message: 'Email verified successfully', verified: true });
  } else {
    res.status(400).json({ error: 'Invalid verification code' });
  }
});

server.post('/api/auth/resend-verification', (req, res) => {
  const { email } = req.body;
  const db = router.db;

  const user = db.get('users').find({ email }).value();
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Generate new code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Remove old codes
  db.get('verification_codes').remove({ email }).write();

  // Add new code
  db.get('verification_codes').push({
    id: Date.now(),
    userId: user.id,
    email: user.email,
    code: verificationCode,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
  }).write();

  res.json({
    success: true,
    message: 'Verification code resent',
    _devCode: verificationCode
  });
});

server.get('/api/auth/me', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: 1 }).value();

  if (user) {
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

server.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// ==========================================
// MEMBERSHIP ENDPOINTS
// ==========================================

server.get('/api/memberships', (req, res) => {
  const db = router.db;
  const memberships = db.get('memberships').value();
  res.json(memberships);
});

server.get('/api/memberships/status', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: 1 }).value();
  const membership = db.get('memberships').find({ id: user.membershipId }).value();

  res.json({
    membership,
    downloadsUsed: user.downloadsThisMonth,
    downloadLimit: user.downloadLimit,
    bonusCredits: user.bonusCredits,
    resetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    subscriptionStatus: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });
});

server.get('/api/memberships/can-download', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: 1 }).value();

  const canDownload = user.downloadsThisMonth < user.downloadLimit || user.bonusCredits > 0;

  res.json({
    canDownload,
    downloadsRemaining: Math.max(0, user.downloadLimit - user.downloadsThisMonth),
    bonusCredits: user.bonusCredits,
    downloadLimit: user.downloadLimit,
    tier: user.membershipType
  });
});

server.post('/api/memberships/create-checkout', (req, res) => {
  const { membershipId, billingInterval } = req.body;

  // Return mock Stripe checkout URL
  res.json({
    checkoutUrl: `https://checkout.stripe.com/mock-session-${Date.now()}`,
    sessionId: `cs_test_${Date.now()}`
  });
});

// ==========================================
// VIDEO ENDPOINTS
// ==========================================

server.get('/api/videos', (req, res) => {
  const db = router.db;
  let videos = db.get('videos').value();

  // Apply filters
  const { genre, bpmMin, bpmMax, key, quality, search, sortBy, _limit } = req.query;

  if (genre) {
    videos = videos.filter(v => v.genre.toLowerCase() === genre.toLowerCase());
  }

  if (bpmMin) {
    videos = videos.filter(v => v.bpm >= parseInt(bpmMin));
  }

  if (bpmMax) {
    videos = videos.filter(v => v.bpm <= parseInt(bpmMax));
  }

  if (key) {
    videos = videos.filter(v => v.key === key || v.camelotKey === key);
  }

  if (quality) {
    videos = videos.filter(v => v.quality.includes(quality));
  }

  if (search) {
    const searchLower = search.toLowerCase();
    videos = videos.filter(v =>
      v.title.toLowerCase().includes(searchLower) ||
      v.artist.toLowerCase().includes(searchLower) ||
      v.genre.toLowerCase().includes(searchLower)
    );
  }

  // Sort
  if (sortBy === 'popular') {
    videos.sort((a, b) => b.downloadCount - a.downloadCount);
  } else if (sortBy === 'newest') {
    videos.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
  } else if (sortBy === 'bpm') {
    videos.sort((a, b) => a.bpm - b.bpm);
  }

  // Limit
  if (_limit) {
    videos = videos.slice(0, parseInt(_limit));
  }

  res.json(videos);
});

server.get('/api/videos/featured', (req, res) => {
  const db = router.db;
  const videos = db.get('videos').filter({ isTrending: true }).value();
  res.json(videos);
});

server.get('/api/videos/recommended', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: 1 }).value();
  const videos = db.get('videos').value().slice(0, 10);

  // Generate personalized reasons based on user preferences
  res.json(videos.map(v => {
    const reasons = [];
    const score = Math.floor(60 + Math.random() * 35);

    // Check if matches user's top genres
    if (user.topGenres && user.topGenres.includes(v.genre)) {
      reasons.push(`Genre: ${v.genre} is in your top genres`);
    }

    // Check if BPM is in user's preferred range
    if (user.bpmRange && v.bpm >= user.bpmRange.min && v.bpm <= user.bpmRange.max) {
      reasons.push(`BPM: ${v.bpm} fits your preferred range (${user.bpmRange.min}-${user.bpmRange.max})`);
    }

    // Add trending status
    if (v.isTrending) {
      reasons.push('Trending: Popular this week');
    }

    // Add quality note for 4K content
    if (v.quality && v.quality.includes('4K')) {
      reasons.push('Quality: Available in 4K Ultra HD');
    }

    // Fallback reasons
    if (reasons.length === 0) {
      reasons.push('Popular with DJs in your area');
      reasons.push(`Genre: ${v.genre} matches your listening history`);
    }

    return {
      ...v,
      recommendationScore: score / 100,
      matchScore: score,
      reasons,
      matchBreakdown: {
        genreMatch: reasons.some(r => r.startsWith('Genre')),
        bpmMatch: reasons.some(r => r.startsWith('BPM')),
        trendingBonus: v.isTrending,
        qualityBonus: v.quality?.includes('4K')
      }
    };
  }));
});

server.get('/api/videos/related/:id', (req, res) => {
  const db = router.db;
  const videoId = parseInt(req.params.id);
  const video = db.get('videos').find({ id: videoId }).value();

  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  // Find similar videos (same genre or close BPM)
  const related = db.get('videos')
    .filter(v =>
      v.id !== videoId &&
      (v.genre === video.genre || Math.abs(v.bpm - video.bpm) <= 15)
    )
    .value()
    .slice(0, 6);

  res.json(related.map(v => ({
    ...v,
    matchScore: 60 + Math.floor(Math.random() * 35),
    matchReasons: {
      bpm: Math.abs(v.bpm - video.bpm) <= 8 ? 'BPM match' : null,
      key: v.key === video.key ? 'Same key' : null,
      genre: v.genre === video.genre ? 'Same genre' : null
    }
  })));
});

server.get('/api/videos/:id', (req, res) => {
  const db = router.db;
  const video = db.get('videos').find({ id: parseInt(req.params.id) }).value();

  if (video) {
    res.json(video);
  } else {
    res.status(404).json({ error: 'Video not found' });
  }
});

server.post('/api/videos/:id/download', (req, res) => {
  const db = router.db;
  const videoId = parseInt(req.params.id);
  const { quality, version } = req.body;
  const video = db.get('videos').find({ id: videoId }).value();

  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  // Check download limits
  const user = db.get('users').find({ id: 1 }).value();
  if (user.downloadsThisMonth >= user.downloadLimit && user.bonusCredits <= 0) {
    return res.status(403).json({
      error: 'Download limit reached',
      upgradeUrl: '/membership'
    });
  }

  // Update user downloads count
  if (user.downloadsThisMonth < user.downloadLimit) {
    db.get('users').find({ id: 1 }).assign({
      downloadsThisMonth: user.downloadsThisMonth + 1
    }).write();
  } else {
    db.get('users').find({ id: 1 }).assign({
      bonusCredits: user.bonusCredits - 1
    }).write();
  }

  // Add to download history
  const download = {
    id: Date.now(),
    userId: 1,
    videoId,
    quality: quality || '1080p',
    version: version || 'clean',
    downloadedAt: new Date().toISOString(),
    fileSize: quality === '4K' ? 890000000 : quality === '1080p' ? 350000000 : 180000000
  };
  db.get('downloads').push(download).write();

  // Return signed URL (mock)
  res.json({
    downloadUrl: `/mock-cdn/videos/${videoId}/${quality || '1080p'}/${version || 'clean'}.mp4`,
    expiresIn: 3600,
    fileSize: download.fileSize,
    filename: `${video.artist} - ${video.title} (${quality || '1080p'}).mp4`
  });
});

// ==========================================
// DOWNLOAD HISTORY ENDPOINTS
// ==========================================

server.get('/api/user/downloads', (req, res) => {
  const db = router.db;
  let downloads = db.get('downloads').filter({ userId: 1 }).value();

  // Enrich with video data
  downloads = downloads.map(d => {
    const video = db.get('videos').find({ id: d.videoId }).value();
    return {
      ...d,
      video: video ? {
        id: video.id,
        title: video.title,
        artist: video.artist,
        thumbnailUrl: video.thumbnailUrl
      } : null
    };
  });

  // Sort by date descending
  downloads.sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));

  res.json({
    downloads,
    total: downloads.length,
    page: 1,
    pageSize: 20
  });
});

server.get('/api/user/downloads/recent', (req, res) => {
  const db = router.db;
  let downloads = db.get('downloads').filter({ userId: 1 }).value();

  downloads = downloads.map(d => {
    const video = db.get('videos').find({ id: d.videoId }).value();
    return { ...d, video };
  });

  downloads.sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));

  res.json(downloads.slice(0, 10));
});

// ==========================================
// SEARCH ENDPOINT
// ==========================================

server.get('/api/search', (req, res) => {
  const db = router.db;
  const { q, genre, bpmMin, bpmMax, key, quality } = req.query;

  let videos = db.get('videos').value();

  // Text search
  if (q) {
    const searchLower = q.toLowerCase();
    videos = videos.filter(v =>
      v.title.toLowerCase().includes(searchLower) ||
      v.artist.toLowerCase().includes(searchLower) ||
      v.genre.toLowerCase().includes(searchLower) ||
      v.subgenre?.toLowerCase().includes(searchLower)
    );
  }

  // Filters
  if (genre) {
    videos = videos.filter(v => v.genre.toLowerCase() === genre.toLowerCase());
  }
  if (bpmMin) {
    videos = videos.filter(v => v.bpm >= parseInt(bpmMin));
  }
  if (bpmMax) {
    videos = videos.filter(v => v.bpm <= parseInt(bpmMax));
  }
  if (key) {
    videos = videos.filter(v => v.key === key || v.camelotKey === key);
  }
  if (quality) {
    videos = videos.filter(v => v.quality.includes(quality));
  }

  res.json({
    results: videos,
    total: videos.length,
    filters: { q, genre, bpmMin, bpmMax, key, quality }
  });
});

server.get('/api/search/autocomplete', (req, res) => {
  const db = router.db;
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.json({ songs: [], artists: [], genres: [] });
  }

  const videos = db.get('videos').value();
  const searchLower = q.toLowerCase();

  // Find matching songs
  const matchingSongs = videos
    .filter(v => v.title.toLowerCase().includes(searchLower))
    .slice(0, 5);

  // Find matching artists (unique)
  const matchingArtists = [...new Set(
    videos
      .filter(v => v.artist.toLowerCase().includes(searchLower))
      .map(v => v.artist)
  )].slice(0, 3);

  // Find matching genres
  const matchingGenres = [...new Set(
    videos
      .filter(v =>
        v.genre.toLowerCase().includes(searchLower) ||
        v.subgenre?.toLowerCase().includes(searchLower)
      )
      .map(v => v.genre)
  )].slice(0, 2);

  res.json({
    songs: matchingSongs,
    artists: matchingArtists.map(name => ({ name, count: videos.filter(v => v.artist === name).length })),
    genres: matchingGenres.map(name => ({ name, count: videos.filter(v => v.genre === name).length }))
  });
});

// ==========================================
// PLAYLIST ENDPOINTS
// ==========================================

server.get('/api/playlists', (req, res) => {
  const db = router.db;
  let playlists = db.get('playlists').filter({ userId: 1 }).value();

  // Enrich with video data
  playlists = playlists.map(p => ({
    ...p,
    videos: p.videoIds.map(id => db.get('videos').find({ id }).value()).filter(Boolean)
  }));

  res.json(playlists);
});

server.post('/api/playlists', (req, res) => {
  const { name, description, isPublic } = req.body;
  const db = router.db;

  const playlist = {
    id: Date.now(),
    userId: 1,
    name,
    description: description || '',
    isPublic: isPublic || false,
    shareToken: isPublic ? `share_${Date.now()}` : null,
    videoIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.get('playlists').push(playlist).write();
  res.status(201).json(playlist);
});

server.post('/api/playlists/:id/videos', (req, res) => {
  const { videoId } = req.body;
  const db = router.db;

  const playlist = db.get('playlists').find({ id: parseInt(req.params.id) }).value();
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  if (!playlist.videoIds.includes(videoId)) {
    db.get('playlists')
      .find({ id: parseInt(req.params.id) })
      .assign({
        videoIds: [...playlist.videoIds, videoId],
        updatedAt: new Date().toISOString()
      })
      .write();
  }

  res.json({ success: true });
});

// ==========================================
// FAVORITES ENDPOINTS
// ==========================================

server.get('/api/favorites', (req, res) => {
  const db = router.db;
  let favorites = db.get('favorites').filter({ userId: 1 }).value();

  favorites = favorites.map(f => ({
    ...f,
    video: db.get('videos').find({ id: f.videoId }).value()
  }));

  res.json(favorites);
});

server.post('/api/favorites/:videoId', (req, res) => {
  const db = router.db;
  const videoId = parseInt(req.params.videoId);

  const existing = db.get('favorites').find({ userId: 1, videoId }).value();
  if (existing) {
    return res.json({ success: true, alreadyFavorited: true });
  }

  db.get('favorites').push({
    id: Date.now(),
    userId: 1,
    videoId,
    createdAt: new Date().toISOString()
  }).write();

  res.json({ success: true });
});

server.delete('/api/favorites/:videoId', (req, res) => {
  const db = router.db;
  const videoId = parseInt(req.params.videoId);

  db.get('favorites').remove({ userId: 1, videoId }).write();
  res.json({ success: true });
});

// ==========================================
// CREDITS ENDPOINTS
// ==========================================

server.get('/api/credits/packs', (req, res) => {
  const db = router.db;
  res.json(db.get('credit_packs').value());
});

server.get('/api/credits/balance', (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: 1 }).value();
  res.json({ balance: user.bonusCredits });
});

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

server.get('/api/admin/stats', (req, res) => {
  const db = router.db;
  res.json(db.get('admin_stats').value());
});

server.get('/api/admin/users', (req, res) => {
  const db = router.db;
  const users = db.get('users').value().map(u => {
    const { password, ...safeUser } = u;
    return safeUser;
  });
  res.json({ users, total: users.length });
});

server.get('/api/admin/videos', (req, res) => {
  const db = router.db;
  const videos = db.get('videos').value();
  res.json({ videos, total: videos.length });
});

// ==========================================
// BULK UPLOAD ENDPOINT
// ==========================================

server.post('/api/admin/videos/bulk-upload', (req, res) => {
  const { videos } = req.body;
  const db = router.db;

  const results = videos.map(video => {
    const newVideo = {
      id: Date.now() + Math.random() * 1000,
      ...video,
      downloadCount: 0,
      isNew: true,
      isTrending: false,
      releaseDate: new Date().toISOString()
    };

    db.get('videos').push(newVideo).write();
    return { success: true, id: newVideo.id, title: newVideo.title };
  });

  res.json({ results, totalUploaded: results.length });
});

// ==========================================
// BILLING ENDPOINTS (Mock)
// ==========================================

server.get('/api/billing/history', (req, res) => {
  res.json({
    invoices: [
      {
        id: 'inv_001',
        date: '2026-01-01',
        amount: 34.99,
        status: 'paid',
        description: 'Video Pool Pro - Monthly'
      },
      {
        id: 'inv_002',
        date: '2025-12-01',
        amount: 34.99,
        status: 'paid',
        description: 'Video Pool Pro - Monthly'
      }
    ]
  });
});

server.post('/api/billing/portal', (req, res) => {
  res.json({
    url: 'https://billing.stripe.com/mock-portal'
  });
});

// Use default router for anything not handled
server.use('/api', router);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🎬 The Video Pool Mock API Server`);
  console.log(`   Running at http://localhost:${PORT}`);
  console.log(`   Database: mock-server/db.json\n`);
});
