// ===========================================
// THE VIDEO POOL - Authentication Service
// ===========================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import crypto from 'crypto';

// ===========================================
// PASSWORD HASHING
// ===========================================

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if match
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// ===========================================
// JWT TOKEN GENERATION
// ===========================================

/**
 * Generate an access token (JWT)
 * @param {object} user - User object with id, email, role, membershipType
 * @returns {string} - JWT access token
 */
export const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role || 'user',
    membershipType: user.membership_type || user.membershipType || 'none',
    type: 'access',
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRY || '24h',
    issuer: 'thevideopool.com',
    audience: 'tvp-client',
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Generate a refresh token (longer-lived)
 * @param {object} user - User object with id
 * @returns {string} - JWT refresh token
 */
export const generateRefreshToken = (user) => {
  const payload = {
    userId: user.id,
    type: 'refresh',
    tokenId: crypto.randomUUID(),
  };

  const options = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d',
    issuer: 'thevideopool.com',
    audience: 'tvp-client',
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, options);
};

/**
 * Verify a refresh token
 * @param {string} token - Refresh token
 * @returns {object|null} - Decoded payload or null
 */
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== 'refresh') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

// ===========================================
// VERIFICATION CODES
// ===========================================

/**
 * Generate a 6-digit verification code
 * @returns {string} - 6-digit code (zero-padded)
 */
export const generateVerificationCode = () => {
  const code = crypto.randomInt(0, 1000000);
  return code.toString().padStart(6, '0');
};

/**
 * Generate a password reset token
 * @returns {object} - { token, hash, expiresAt }
 */
export const generatePasswordResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return { token, hash, expiresAt };
};

/**
 * Hash a password reset token for comparison
 * @param {string} token - Plain reset token
 * @returns {string} - Hashed token
 */
export const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// ===========================================
// TWO-FACTOR AUTHENTICATION (2FA)
// ===========================================

/**
 * Generate a TOTP secret for 2FA
 * @param {string} email - User's email for labeling
 * @returns {object} - { secret, otpauth_url, qr_data }
 */
export const generate2FASecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `The Video Pool (${email})`,
    issuer: 'The Video Pool',
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauth_url: secret.otpauth_url,
    qr_data: secret.otpauth_url, // For generating QR code
  };
};

/**
 * Verify a TOTP code
 * @param {string} secret - User's TOTP secret (base32)
 * @param {string} token - 6-digit code from authenticator
 * @returns {boolean} - True if valid
 */
export const verify2FACode = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2, // Allow 2 intervals before/after for clock drift
  });
};

// ===========================================
// BACKUP CODES
// ===========================================

/**
 * Generate backup codes for 2FA recovery
 * @param {number} count - Number of codes to generate (default 8)
 * @returns {object[]} - Array of { code, hash } objects
 */
export const generateBackupCodes = (count = 8) => {
  const codes = [];

  for (let i = 0; i < count; i++) {
    // Generate XXXX-XXXX format
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const code = `${part1}-${part2}`;

    // Hash for storage
    const hash = crypto.createHash('sha256').update(code).digest('hex');

    codes.push({ code, hash });
  }

  return codes;
};

/**
 * Hash a backup code for comparison
 * @param {string} code - Plain backup code
 * @returns {string} - Hashed code
 */
export const hashBackupCode = (code) => {
  // Normalize: remove dashes and uppercase
  const normalized = code.replace(/-/g, '').toUpperCase();
  const formatted = `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}`;
  return crypto.createHash('sha256').update(formatted).digest('hex');
};

/**
 * Verify a backup code against stored hashes
 * @param {string} code - Plain backup code
 * @param {string[]} hashes - Array of stored code hashes
 * @returns {object|null} - { index, hash } of matched code or null
 */
export const verifyBackupCode = (code, hashes) => {
  const codeHash = hashBackupCode(code);

  for (let i = 0; i < hashes.length; i++) {
    if (hashes[i] && hashes[i] === codeHash) {
      return { index: i, hash: codeHash };
    }
  }

  return null;
};

// ===========================================
// SESSION MANAGEMENT
// ===========================================

/**
 * Generate a session ID
 * @returns {string} - UUID session ID
 */
export const generateSessionId = () => {
  return crypto.randomUUID();
};

/**
 * Generate session data for storage
 * @param {object} user - User object
 * @param {object} req - Express request object
 * @returns {object} - Session data
 */
export const createSessionData = (user, req) => {
  return {
    userId: user.id,
    sessionId: generateSessionId(),
    userAgent: req.headers['user-agent'] || 'unknown',
    ipAddress: req.ip || req.connection.remoteAddress,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  };
};

// ===========================================
// EXPORTS
// ===========================================

export default {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateVerificationCode,
  generatePasswordResetToken,
  hashResetToken,
  generate2FASecret,
  verify2FACode,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
  generateSessionId,
  createSessionData,
};
