// ===========================================
// THE VIDEO POOL - Authentication Middleware
// ===========================================

import jwt from 'jsonwebtoken';

/**
 * Extract JWT token from Authorization header
 * Supports: "Bearer <token>" format
 */
export const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Check for Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
};

/**
 * Verify and decode a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    // Token is invalid, expired, or malformed
    return null;
  }
};

/**
 * Middleware: Require authentication
 * Rejects request if user is not authenticated
 */
export const requireAuth = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    });
  }

  // Check if token is a refresh token (not allowed for API access)
  if (decoded.type === 'refresh') {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      code: 'ACCESS_TOKEN_REQUIRED',
    });
  }

  // Attach user info to request
  req.user = {
    id: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    membershipType: decoded.membershipType,
  };

  next();
};

/**
 * Middleware: Optional authentication
 * Attaches user if authenticated, continues if not
 */
export const optionalAuth = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    // No token provided, continue without user
    req.user = null;
    return next();
  }

  const decoded = verifyToken(token);

  if (!decoded || decoded.type === 'refresh') {
    // Invalid token, continue without user
    req.user = null;
    return next();
  }

  // Attach user info to request
  req.user = {
    id: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    membershipType: decoded.membershipType,
  };

  next();
};

/**
 * Middleware: Require admin role
 * Must be used after requireAuth
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
      code: 'ADMIN_REQUIRED',
    });
  }

  next();
};

/**
 * Middleware: Require active membership
 * Must be used after requireAuth
 */
export const requireMembership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  const validMemberships = ['monthly', 'annual', 'lifetime'];

  if (!validMemberships.includes(req.user.membershipType)) {
    return res.status(403).json({
      success: false,
      error: 'Active membership required',
      code: 'MEMBERSHIP_REQUIRED',
    });
  }

  next();
};

/**
 * Middleware: Rate limit for auth routes
 * Stricter limits for login/register attempts
 */
export const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + ':' + (req.body.email || 'unknown');
    const now = Date.now();

    // Clean up old entries
    if (attempts.has(key)) {
      const entry = attempts.get(key);
      if (now - entry.firstAttempt > windowMs) {
        attempts.delete(key);
      }
    }

    if (!attempts.has(key)) {
      attempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }

    const entry = attempts.get(key);
    entry.count++;

    if (entry.count > maxAttempts) {
      const retryAfter = Math.ceil((entry.firstAttempt + windowMs - now) / 1000);
      return res.status(429).json({
        success: false,
        error: 'Too many attempts. Please try again later.',
        code: 'RATE_LIMITED',
        retryAfter,
      });
    }

    next();
  };
};

export default {
  extractToken,
  verifyToken,
  requireAuth,
  optionalAuth,
  requireAdmin,
  requireMembership,
  authRateLimit,
};
