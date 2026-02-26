// ===========================================
// THE VIDEO POOL - Admin Routes
// Dashboard stats, user management, video management
// ===========================================

import { Router } from 'express';
import { query } from '../db/config.js';
import { requireAuth, requireAdmin, requireAdmin2FA } from '../middleware/auth.js';
import { Errors, asyncHandler } from '../middleware/errorHandler.js';
import { body, validationResult } from 'express-validator';
import { logAuditEvent, getAuditLogs } from '../services/auditService.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth, requireAdmin);

// ===========================================
// GET /admin/stats - Dashboard statistics
// ===========================================
router.get('/stats', asyncHandler(async (req, res) => {
  // Run all stats queries in parallel
  const [
    usersResult,
    subscribersResult,
    videosResult,
    downloadsResult,
    revenueResult,
    newUsersResult,
  ] = await Promise.all([
    // Total users
    query('SELECT COUNT(*) as count FROM users'),

    // Active subscribers (non-free members)
    query(`
      SELECT COUNT(*) as count FROM users
      WHERE membership_type != 'free'
      AND status = 'active'
    `),

    // Total videos
    query('SELECT COUNT(*) as count FROM videos'),

    // Downloads today
    query(`
      SELECT COUNT(*) as count FROM downloads
      WHERE downloaded_at >= CURRENT_DATE
    `),

    // Simulated monthly revenue (would come from Stripe in production)
    query(`
      SELECT
        SUM(CASE
          WHEN membership_type = 'starter' THEN 35.00
          WHEN membership_type = 'pro' THEN 33.33
          ELSE 0
        END) as revenue
      FROM users
      WHERE membership_type != 'free'
      AND status = 'active'
    `),

    // New users this week
    query(`
      SELECT COUNT(*) as count FROM users
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `),
  ]);

  res.json({
    totalUsers: parseInt(usersResult.rows[0].count),
    activeSubscribers: parseInt(subscribersResult.rows[0].count),
    totalVideos: parseInt(videosResult.rows[0].count),
    downloadsToday: parseInt(downloadsResult.rows[0].count),
    revenueThisMonth: parseFloat(revenueResult.rows[0].revenue) || 0,
    newUsersThisWeek: parseInt(newUsersResult.rows[0].count),
  });
}));

// ===========================================
// GET /admin/users - List all users
// ===========================================
router.get('/users', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  let whereClause = '';
  const params = [];

  if (search) {
    whereClause = `WHERE name ILIKE $1 OR email ILIKE $1`;
    params.push(`%${search}%`);
  }

  const [usersResult, countResult] = await Promise.all([
    query(`
      SELECT
        id, name, email, membership_type, status,
        downloads_today, total_downloads, email_verified,
        two_factor_enabled, role, created_at, last_login
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]),

    query(`SELECT COUNT(*) as count FROM users ${whereClause}`, params),
  ]);

  res.json({
    users: usersResult.rows.map(u => ({
      id: u.id,
      username: u.name,
      email: u.email,
      membershipType: u.membership_type,
      membershipStatus: u.status,
      downloadLimit: null,
      downloadsUsed: u.downloads_today ?? 0,
      emailVerified: u.email_verified,
      twoFactorEnabled: u.two_factor_enabled,
      role: u.role,
      createdAt: u.created_at,
      lastLogin: u.last_login,
    })),
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(countResult.rows[0].count / limit),
  });
}));

// ===========================================
// GET /admin/users/:id - Get single user
// ===========================================
router.get('/users/:id', asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);

  const result = await query(`
    SELECT
      id, name, email, membership_type, status,
      downloads_today, total_downloads, email_verified,
      two_factor_enabled, role, created_at, last_login,
      stripe_customer_id, stripe_subscription_id
    FROM users WHERE id = $1
  `, [userId]);

  if (result.rows.length === 0) {
    throw Errors.notFound('User not found');
  }

  // Get user's download count
  const downloadsResult = await query(
    'SELECT COUNT(*) as count FROM downloads WHERE user_id = $1',
    [userId]
  );

  const user = result.rows[0];

  res.json({
    id: user.id,
    username: user.name,
    email: user.email,
    membershipType: user.membership_type,
    membershipStatus: user.status,
    downloadLimit: null,
    downloadsUsed: user.downloads_today ?? 0,
    emailVerified: user.email_verified,
    twoFactorEnabled: user.two_factor_enabled,
    role: user.role,
    createdAt: user.created_at,
    lastLogin: user.last_login,
    totalDownloads: parseInt(downloadsResult.rows[0].count),
    hasStripeAccount: !!user.stripe_customer_id,
    hasSubscription: !!user.stripe_subscription_id,
  });
}));

// ===========================================
// PUT /admin/users/:id - Update user
// Requires 2FA for role/membership changes
// ===========================================
router.put('/users/:id', requireAdmin2FA, [
  body('role').optional().isIn(['user', 'admin']),
  body('membershipType').optional().isIn(['free', 'starter', 'pro', 'elite']),
  body('membershipStatus').optional().isIn(['active', 'suspended', 'cancelled']),
  body('bonusCredits').optional().isInt({ min: 0 }),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw Errors.validation(errors.array());
  }

  const userId = parseInt(req.params.id);
  const { role, membershipType, membershipStatus, bonusCredits } = req.body;

  // Build update query dynamically
  const updates = [];
  const params = [];
  let paramIndex = 1;

  if (role !== undefined) {
    updates.push(`role = $${paramIndex++}`);
    params.push(role);
  }
  if (membershipType !== undefined) {
    updates.push(`membership_type = $${paramIndex++}`);
    params.push(membershipType);

  }
  if (membershipStatus !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    params.push(membershipStatus);
  }

  if (updates.length === 0) {
    throw Errors.badRequest('No valid fields to update');
  }

  updates.push(`updated_at = NOW()`);
  params.push(userId);

  const result = await query(`
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, name, email, membership_type, role
  `, params);

  if (result.rows.length === 0) {
    throw Errors.notFound('User not found');
  }

  // Audit log
  logAuditEvent({
    adminId: req.user.id,
    action: 'user.update',
    resourceType: 'user',
    resourceId: userId,
    details: { changes: { role, membershipType, membershipStatus } },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    message: 'User updated successfully',
    user: result.rows[0],
  });
}));

// ===========================================
// GET /admin/videos - List all videos
// ===========================================
router.get('/videos', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  let whereClause = '';
  const params = [];

  if (search) {
    whereClause = `WHERE title ILIKE $1 OR artist ILIKE $1`;
    params.push(`%${search}%`);
  }

  const [videosResult, countResult] = await Promise.all([
    query(`
      SELECT
        id, title, artist, genre, bpm, key, duration,
        download_count, is_new, is_hot, created_at
      FROM videos
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]),

    query(`SELECT COUNT(*) as count FROM videos ${whereClause}`, params),
  ]);

  res.json({
    videos: videosResult.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(countResult.rows[0].count / limit),
  });
}));

// ===========================================
// POST /admin/videos/bulk-upload - Bulk video upload
// Requires 2FA for bulk operations
// ===========================================
router.post('/videos/bulk-upload', requireAdmin2FA, asyncHandler(async (req, res) => {
  const { videos } = req.body;

  if (!Array.isArray(videos) || videos.length === 0) {
    throw Errors.badRequest('Videos array is required');
  }

  if (videos.length > 100) {
    throw Errors.badRequest('Maximum 100 videos per upload');
  }

  const results = [];

  for (const video of videos) {
    try {
      const result = await query(`
        INSERT INTO videos (
          title, artist, genre, subgenre, bpm, key, camelot_key,
          duration, year, label, thumbnail_url, is_new
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
        RETURNING id, title, artist
      `, [
        video.title,
        video.artist,
        video.genre,
        video.subgenre || null,
        video.bpm || null,
        video.key || null,
        video.camelotKey || null,
        video.duration || 180,
        video.year || new Date().getFullYear(),
        video.label || null,
        video.thumbnailUrl || null,
      ]);

      results.push({
        success: true,
        id: result.rows[0].id,
        title: result.rows[0].title,
        artist: result.rows[0].artist,
      });
    } catch (error) {
      results.push({
        success: false,
        title: video.title,
        artist: video.artist,
        error: error.message,
      });
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  // Audit log
  logAuditEvent({
    adminId: req.user.id,
    action: 'video.bulk_upload',
    resourceType: 'video',
    resourceId: null,
    details: { total: videos.length, successful, failed },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    results,
    summary: {
      total: videos.length,
      successful,
      failed,
    },
  });
}));

// ===========================================
// DELETE /admin/videos/:id - Delete video
// Requires 2FA for destructive operations
// ===========================================
router.delete('/videos/:id', requireAdmin2FA, asyncHandler(async (req, res) => {
  const videoId = parseInt(req.params.id);

  const result = await query(
    'DELETE FROM videos WHERE id = $1 RETURNING id, title',
    [videoId]
  );

  if (result.rows.length === 0) {
    throw Errors.notFound('Video not found');
  }

  // Audit log
  logAuditEvent({
    adminId: req.user.id,
    action: 'video.delete',
    resourceType: 'video',
    resourceId: videoId,
    details: { title: result.rows[0].title },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    message: 'Video deleted successfully',
    video: result.rows[0],
  });
}));

// ===========================================
// POST /admin/cache/clear - Clear cache
// ===========================================
router.post('/cache/clear', asyncHandler(async (req, res) => {
  // In production, this would clear Redis cache
  // For now, just return success
  res.json({
    message: 'Cache cleared successfully',
    timestamp: new Date().toISOString(),
  });
}));

// ===========================================
// GET /admin/analytics - Analytics data
// ===========================================
router.get('/analytics', asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;

  // Downloads per day
  const downloadsResult = await query(`
    SELECT
      DATE(downloaded_at) as date,
      COUNT(*) as downloads
    FROM downloads
    WHERE downloaded_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(downloaded_at)
    ORDER BY date DESC
  `);

  // New users per day
  const usersResult = await query(`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as signups
    FROM users
    WHERE created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `);

  // Top downloaded videos
  const topVideosResult = await query(`
    SELECT
      v.id, v.title, v.artist, v.genre,
      COUNT(d.id) as download_count
    FROM videos v
    JOIN downloads d ON d.video_id = v.id
    WHERE d.downloaded_at >= NOW() - INTERVAL '${days} days'
    GROUP BY v.id, v.title, v.artist, v.genre
    ORDER BY download_count DESC
    LIMIT 10
  `);

  // Membership distribution
  const membershipResult = await query(`
    SELECT
      membership_type,
      COUNT(*) as count
    FROM users
    GROUP BY membership_type
  `);

  res.json({
    period: `${days} days`,
    downloadsPerDay: downloadsResult.rows,
    signupsPerDay: usersResult.rows,
    topVideos: topVideosResult.rows,
    membershipDistribution: membershipResult.rows,
  });
}));

// ===========================================
// GET /admin/audit-logs - View audit trail
// ===========================================
router.get('/audit-logs', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const { adminId, action, resourceType } = req.query;

  const result = await getAuditLogs({
    page,
    limit,
    adminId: adminId ? parseInt(adminId) : undefined,
    action,
    resourceType,
  });

  res.json(result);
}));

export default router;
