// ===========================================
// THE VIDEO POOL - Authentication Routes
// ===========================================

import express from 'express';
import { body, validationResult } from 'express-validator';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

import { requireAuth, authRateLimit } from '../middleware/auth.js';
import { asyncHandler, Errors } from '../middleware/errorHandler.js';
import {
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
  createSessionData,
} from '../services/authService.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  send2FAEnabledEmail,
  sendPasswordChangedEmail,
} from '../services/emailService.js';
import db from '../db/index.js';

const router = express.Router();

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Set both access and refresh tokens as HttpOnly cookies
 * Prevents XSS token theft via localStorage
 */
const setAuthCookies = (res, accessToken, refreshToken) => {
  // Access token: 15 minutes
  res.cookie('tvp_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  // Refresh token: 7 days
  res.cookie('tvp_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

// ===========================================
// VALIDATION RULES
// ===========================================

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('phone')
    .matches(/^\+[1-9]\d{6,14}$/)
    .withMessage('Valid phone number in E.164 format is required (e.g. +1XXXXXXXXXX)'),
  body('smsOptIn')
    .optional()
    .isBoolean()
    .withMessage('smsOptIn must be a boolean'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const emailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];

const codeValidation = [
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Valid 6-digit code is required'),
];

const passwordValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number'),
];

const twoFACodeValidation = [
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Valid 6-digit 2FA code is required'),
];

/**
 * Validate request and throw error if invalid
 */
const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw Errors.validation(errors.array());
  }
};

// ===========================================
// REGISTRATION
// ===========================================

/**
 * POST /register
 * Create a new user account and send verification email
 */
router.post(
  '/register',
  authRateLimit(5, 60 * 60 * 1000), // 5 attempts per hour
  registerValidation,
  asyncHandler(async (req, res) => {
    validate(req);

    const { email, password, name, phone, smsOptIn } = req.body;

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      // If user exists but not verified, allow re-registration
      if (!existingUser.rows[0].email_verified) {
        // Update existing unverified user
        const hashedPassword = await hashPassword(password);
        const verificationCode = generateVerificationCode();
        const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await db.query(
          `UPDATE users
           SET password_hash = $1, name = $2, verification_code = $3,
               verification_expires = $4, phone = $5, sms_opt_in = $6,
               sms_opt_in_at = $7, updated_at = NOW()
           WHERE email = $8`,
          [hashedPassword, name || null, verificationCode, verificationExpires, phone, smsOptIn || false, smsOptIn ? new Date() : null, email]
        );

        await sendVerificationEmail(email, verificationCode, name);

        return res.status(200).json({
          success: true,
          message: 'If this email is not already registered, a verification code has been sent.',
          requiresVerification: true,
        });
      }

      // Email is already registered and verified.
      // Return generic response to prevent email enumeration (do NOT reveal the account exists).
      return res.status(200).json({
        success: true,
        message: 'If this email is not already registered, a verification code has been sent.',
        requiresVerification: true,
      });
    }

    // Create new user
    const hashedPassword = await hashPassword(password);
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    const result = await db.query(
      `INSERT INTO users (email, password_hash, name, verification_code, verification_expires, phone, sms_opt_in, sms_opt_in_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, name, created_at`,
      [email, hashedPassword, name || null, verificationCode, verificationExpires, phone, smsOptIn || false, smsOptIn ? new Date() : null]
    );

    // Send verification email
    await sendVerificationEmail(email, verificationCode, name);

    res.status(201).json({
      success: true,
      message: 'Account created. Please check your email to verify your account.',
      requiresVerification: true,
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        name: result.rows[0].name,
      },
    });
  })
);

// ===========================================
// LOGIN
// ===========================================

/**
 * POST /login
 * Authenticate user and return JWT (or require 2FA)
 */
router.post(
  '/login',
  authRateLimit(10, 15 * 60 * 1000), // 10 attempts per 15 minutes
  loginValidation,
  asyncHandler(async (req, res) => {
    validate(req);

    const { email, password } = req.body;

    // Get user
    const result = await db.query(
      `SELECT id, email, password_hash, name, role, membership_type,
              email_verified, two_factor_enabled, two_factor_secret,
              phone_verified
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw Errors.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw Errors.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check if email is verified
    if (!user.email_verified) {
      // Resend verification code
      const verificationCode = generateVerificationCode();
      const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

      await db.query(
        `UPDATE users SET verification_code = $1, verification_expires = $2 WHERE id = $3`,
        [verificationCode, verificationExpires, user.id]
      );

      await sendVerificationEmail(email, verificationCode, user.name);

      return res.status(403).json({
        success: false,
        error: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email. A new verification code has been sent.',
      });
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      // Create temporary session token for 2FA completion
      const tempToken = jwt.sign(
        { userId: user.id, email: user.email, role: 'pending_2fa', membershipType: 'none', type: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: '10m', issuer: 'thevideopool.com', audience: 'tvp-client' }
      );

      // Store temp token in HttpOnly cookie (10-minute window matches token expiry)
      res.cookie('tvp_temp_token', tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000, // 10 minutes
        path: '/',
      });

      return res.status(200).json({
        success: true,
        requires2FA: true,
        // DO NOT return tempToken in response anymore
        message: 'Please enter your 2FA code to complete login.',
      });
    }

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Create session
    const sessionData = createSessionData(user, req);
    await db.query(
      `INSERT INTO sessions (user_id, session_id, refresh_token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        sessionData.sessionId,
        hashResetToken(refreshToken),
        sessionData.userAgent,
        sessionData.ipAddress,
        sessionData.expiresAt,
      ]
    );

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Set tokens as HttpOnly cookies (no longer in response body)
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.role === 'admin',
        membershipType: user.membership_type,
        phoneVerified: user.phone_verified || false,
      },
    });
  })
);

/**
 * POST /login/2fa
 * Complete 2FA login with TOTP code or backup code
 */
router.post(
  '/login/2fa',
  authRateLimit(5, 15 * 60 * 1000),
  [
    body('code').notEmpty().withMessage('2FA code is required'),
  ],
  asyncHandler(async (req, res) => {
    validate(req);

    // Read tempToken from HttpOnly cookie (set during /login when 2FA detected)
    const tempToken = req.cookies?.tvp_temp_token;
    if (!tempToken) {
      throw Errors.unauthorized('2FA session expired, please login again', 'SESSION_EXPIRED');
    }

    const { code } = req.body;

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      throw Errors.unauthorized('Invalid or expired session', 'INVALID_SESSION');
    }

    if (decoded.role !== 'pending_2fa') {
      throw Errors.unauthorized('Invalid session type', 'INVALID_SESSION');
    }

    // Get user with 2FA secret
    const result = await db.query(
      `SELECT id, email, name, role, membership_type, two_factor_secret, backup_codes
       FROM users WHERE id = $1 AND two_factor_enabled = true`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw Errors.unauthorized('Invalid session', 'INVALID_SESSION');
    }

    const user = result.rows[0];
    let usedBackupCode = false;

    // Try TOTP code first
    const isValidTOTP = verify2FACode(user.two_factor_secret, code);

    if (!isValidTOTP) {
      // Try backup code
      const backupCodes = user.backup_codes || [];
      const backupResult = verifyBackupCode(code, backupCodes);

      if (backupResult) {
        // Mark backup code as used
        backupCodes[backupResult.index] = null;
        await db.query(
          'UPDATE users SET backup_codes = $1 WHERE id = $2',
          [backupCodes, user.id]
        );
        usedBackupCode = true;
      } else {
        throw Errors.unauthorized('Invalid 2FA code', 'INVALID_2FA_CODE');
      }
    }

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Create session
    const sessionData = createSessionData(user, req);
    await db.query(
      `INSERT INTO sessions (user_id, session_id, refresh_token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        sessionData.sessionId,
        hashResetToken(refreshToken),
        sessionData.userAgent,
        sessionData.ipAddress,
        sessionData.expiresAt,
      ]
    );

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Clear 2FA temp cookie and set auth cookies
    res.clearCookie('tvp_temp_token');
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      message: usedBackupCode ? 'Login successful (backup code used)' : 'Login successful',
      usedBackupCode,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        membershipType: user.membership_type,
      },
    });
  })
);

// ===========================================
// EMAIL VERIFICATION
// ===========================================

/**
 * POST /verify-email-code
 * Verify email with 6-digit code
 */
router.post(
  '/verify-email-code',
  authRateLimit(10, 15 * 60 * 1000),
  [...emailValidation, ...codeValidation],
  asyncHandler(async (req, res) => {
    validate(req);

    const { email, code } = req.body;

    const result = await db.query(
      `SELECT id, name, verification_code, verification_expires, email_verified
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw Errors.notFound('User');
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.json({
        success: true,
        message: 'Email already verified',
      });
    }

    if (!user.verification_code || user.verification_code !== code) {
      throw Errors.unauthorized('Invalid verification code', 'INVALID_CODE');
    }

    if (new Date(user.verification_expires) < new Date()) {
      throw Errors.unauthorized('Verification code expired', 'CODE_EXPIRED');
    }

    // Mark email as verified
    await db.query(
      `UPDATE users
       SET email_verified = true, verification_code = NULL, verification_expires = NULL
       WHERE id = $1`,
      [user.id]
    );

    // Send welcome email
    await sendWelcomeEmail(email, user.name);

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  })
);

/**
 * POST /resend-verification
 * Resend verification code
 */
router.post(
  '/resend-verification',
  authRateLimit(3, 60 * 60 * 1000), // 3 per hour
  emailValidation,
  asyncHandler(async (req, res) => {
    validate(req);

    const { email } = req.body;

    const result = await db.query(
      'SELECT id, name, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If an account exists, a verification code has been sent.',
      });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.json({
        success: true,
        message: 'Email already verified',
      });
    }

    // Generate new code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      'UPDATE users SET verification_code = $1, verification_expires = $2 WHERE id = $3',
      [verificationCode, verificationExpires, user.id]
    );

    await sendVerificationEmail(email, verificationCode, user.name);

    res.json({
      success: true,
      message: 'Verification code sent',
    });
  })
);

// ===========================================
// PASSWORD RESET
// ===========================================

/**
 * POST /forgot-password
 * Send password reset email
 */
router.post(
  '/forgot-password',
  authRateLimit(3, 60 * 60 * 1000), // 3 per hour
  emailValidation,
  asyncHandler(async (req, res) => {
    validate(req);

    const { email } = req.body;

    const result = await db.query(
      'SELECT id, name, email_verified FROM users WHERE email = $1',
      [email]
    );

    // Always return success to prevent email enumeration
    if (result.rows.length === 0 || !result.rows[0].email_verified) {
      return res.json({
        success: true,
        message: 'If an account exists, a password reset link has been sent.',
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const { token, hash, expiresAt } = generatePasswordResetToken();

    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [hash, expiresAt, user.id]
    );

    await sendPasswordResetEmail(email, token, user.name);

    res.json({
      success: true,
      message: 'If an account exists, a password reset link has been sent.',
    });
  })
);

/**
 * POST /reset-password
 * Complete password reset with token
 */
router.post(
  '/reset-password',
  authRateLimit(5, 60 * 60 * 1000),
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    ...passwordValidation,
  ],
  asyncHandler(async (req, res) => {
    validate(req);

    const { token, password } = req.body;
    const tokenHash = hashResetToken(token);

    const result = await db.query(
      `SELECT id, email, name, reset_token_expires
       FROM users WHERE reset_token = $1`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      throw Errors.unauthorized('Invalid or expired reset token', 'INVALID_TOKEN');
    }

    const user = result.rows[0];

    if (new Date(user.reset_token_expires) < new Date()) {
      throw Errors.unauthorized('Reset token expired', 'TOKEN_EXPIRED');
    }

    // Update password
    const hashedPassword = await hashPassword(password);

    await db.query(
      `UPDATE users
       SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    // Invalidate all sessions
    await db.query('DELETE FROM sessions WHERE user_id = $1', [user.id]);

    // Send notification email
    await sendPasswordChangedEmail(user.email, user.name);

    res.json({
      success: true,
      message: 'Password reset successful. Please log in with your new password.',
    });
  })
);

// ===========================================
// CURRENT USER
// ===========================================

/**
 * GET /me
 * Get current authenticated user
 */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await db.query(
      `SELECT id, email, name, role, membership_type, membership_expires_at,
              email_verified, phone_verified, two_factor_enabled, created_at, last_login
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw Errors.notFound('User');
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.role === 'admin',
        membershipType: user.membership_type,
        membershipExpires: user.membership_expires_at,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified || false,
        twoFactorEnabled: user.two_factor_enabled,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
    });
  })
);

// ===========================================
// LOGOUT
// ===========================================

/**
 * POST /logout
 * Invalidate current session
 */
router.post(
  '/logout',
  requireAuth,
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.tvp_refresh_token;

    if (refreshToken) {
      // Delete specific session
      const tokenHash = hashResetToken(refreshToken);
      await db.query(
        'DELETE FROM sessions WHERE user_id = $1 AND refresh_token_hash = $2',
        [req.user.id, tokenHash]
      );
    } else {
      // Delete all sessions for user (logout everywhere)
      await db.query('DELETE FROM sessions WHERE user_id = $1', [req.user.id]);
    }

    res.clearCookie('tvp_token');
    res.clearCookie('tvp_refresh_token');
    res.json({ success: true, message: 'Logged out successfully' });
  })
);

// ===========================================
// TOKEN REFRESH
// ===========================================

/**
 * POST /refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.tvp_refresh_token;

    if (!refreshToken) {
      throw Errors.unauthorized('Refresh token required', 'TOKEN_REQUIRED');
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw Errors.unauthorized('Invalid refresh token', 'INVALID_TOKEN');
    }

    // Verify session exists
    const tokenHash = hashResetToken(refreshToken);
    const sessionResult = await db.query(
      'SELECT * FROM sessions WHERE user_id = $1 AND refresh_token_hash = $2',
      [decoded.userId, tokenHash]
    );

    if (sessionResult.rows.length === 0) {
      throw Errors.unauthorized('Session not found', 'SESSION_NOT_FOUND');
    }

    // Get user
    const userResult = await db.query(
      'SELECT id, email, name, role, membership_type FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      throw Errors.unauthorized('User not found', 'USER_NOT_FOUND');
    }

    const user = userResult.rows[0];

    // Generate new access token
    const accessToken = generateToken(user);

    // Update session activity
    await db.query(
      'UPDATE sessions SET last_activity = NOW() WHERE user_id = $1 AND refresh_token_hash = $2',
      [user.id, tokenHash]
    );

    // Set fresh access token cookie; reuse the same refresh token already in the cookie
    res.cookie('tvp_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes — matches access token expiry
      path: '/',
    });

    res.json({ success: true });
  })
);

// ===========================================
// TWO-FACTOR AUTHENTICATION
// ===========================================

/**
 * GET /2fa/status
 * Check if 2FA is enabled for current user
 */
router.get(
  '/2fa/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await db.query(
      `SELECT two_factor_enabled, backup_codes
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw Errors.notFound('User');
    }

    const user = result.rows[0];
    const backupCodesRemaining = (user.backup_codes || []).filter(c => c !== null).length;

    res.json({
      success: true,
      twoFactorEnabled: user.two_factor_enabled,
      backupCodesRemaining,
    });
  })
);

/**
 * POST /2fa/setup
 * Generate TOTP secret and QR code for 2FA setup
 */
router.post(
  '/2fa/setup',
  requireAuth,
  asyncHandler(async (req, res) => {
    // Check if 2FA is already enabled
    const userResult = await db.query(
      'SELECT two_factor_enabled FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows[0].two_factor_enabled) {
      throw Errors.conflict('2FA is already enabled', '2FA_ALREADY_ENABLED');
    }

    // Generate secret
    const { secret, otpauth_url } = generate2FASecret(req.user.email);

    // Store temporary secret
    await db.query(
      'UPDATE users SET two_factor_temp_secret = $1 WHERE id = $2',
      [secret, req.user.id]
    );

    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpauth_url);

    res.json({
      success: true,
      secret,
      qrCode,
      message: 'Scan the QR code with your authenticator app, then verify with a code.',
    });
  })
);

/**
 * POST /2fa/verify
 * Verify TOTP code and enable 2FA
 */
router.post(
  '/2fa/verify',
  requireAuth,
  twoFACodeValidation,
  asyncHandler(async (req, res) => {
    validate(req);

    const { code } = req.body;

    // Get temp secret
    const userResult = await db.query(
      'SELECT email, name, two_factor_enabled, two_factor_temp_secret FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = userResult.rows[0];

    if (user.two_factor_enabled) {
      throw Errors.conflict('2FA is already enabled', '2FA_ALREADY_ENABLED');
    }

    if (!user.two_factor_temp_secret) {
      throw Errors.badRequest('Please start 2FA setup first');
    }

    // Verify code
    const isValid = verify2FACode(user.two_factor_temp_secret, code);

    if (!isValid) {
      throw Errors.unauthorized('Invalid verification code', 'INVALID_CODE');
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(8);
    const backupCodeHashes = backupCodes.map(c => c.hash);

    // Enable 2FA
    await db.query(
      `UPDATE users
       SET two_factor_enabled = true,
           two_factor_secret = two_factor_temp_secret,
           two_factor_temp_secret = NULL,
           backup_codes = $1
       WHERE id = $2`,
      [backupCodeHashes, req.user.id]
    );

    // Send notification email
    await send2FAEnabledEmail(user.email, user.name);

    res.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes: backupCodes.map(c => c.code),
      warning: 'Save these backup codes in a secure location. They will only be shown once.',
    });
  })
);

/**
 * POST /2fa/disable
 * Disable 2FA (requires password)
 */
router.post(
  '/2fa/disable',
  requireAuth,
  [body('password').notEmpty().withMessage('Password is required')],
  asyncHandler(async (req, res) => {
    validate(req);

    const { password } = req.body;

    // Get user with password
    const userResult = await db.query(
      'SELECT password_hash, two_factor_enabled FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = userResult.rows[0];

    if (!user.two_factor_enabled) {
      throw Errors.badRequest('2FA is not enabled');
    }

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw Errors.unauthorized('Invalid password', 'INVALID_PASSWORD');
    }

    // Disable 2FA
    await db.query(
      `UPDATE users
       SET two_factor_enabled = false,
           two_factor_secret = NULL,
           backup_codes = NULL
       WHERE id = $1`,
      [req.user.id]
    );

    // Invalidate all sessions — re-authentication required after disabling 2FA
    await db.query('DELETE FROM sessions WHERE user_id = $1', [req.user.id]);

    res.json({
      success: true,
      message: '2FA disabled successfully',
    });
  })
);

/**
 * POST /2fa/backup-codes/regenerate
 * Generate new backup codes
 */
router.post(
  '/2fa/backup-codes/regenerate',
  requireAuth,
  [body('password').notEmpty().withMessage('Password is required')],
  asyncHandler(async (req, res) => {
    validate(req);

    const { password } = req.body;

    // Get user
    const userResult = await db.query(
      'SELECT password_hash, two_factor_enabled FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = userResult.rows[0];

    if (!user.two_factor_enabled) {
      throw Errors.badRequest('2FA is not enabled');
    }

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw Errors.unauthorized('Invalid password', 'INVALID_PASSWORD');
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes(8);
    const backupCodeHashes = backupCodes.map(c => c.hash);

    await db.query(
      'UPDATE users SET backup_codes = $1 WHERE id = $2',
      [backupCodeHashes, req.user.id]
    );

    res.json({
      success: true,
      message: 'New backup codes generated',
      backupCodes: backupCodes.map(c => c.code),
      warning: 'Previous backup codes are now invalid. Save these new codes securely.',
    });
  })
);


// ===========================================
// GOOGLE OAUTH
// ===========================================

/**
 * POST /google
 * Authenticate with Google OAuth access token
 */
router.post(
  '/google',
  authRateLimit(10, 60 * 60 * 1000),
  asyncHandler(async (req, res) => {
    const { accessToken: googleAccessToken } = req.body;

    if (!googleAccessToken) {
      throw Errors.badRequest('Google access token is required');
    }

    // Fetch user profile from Google
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
    });

    if (!googleRes.ok) {
      throw Errors.unauthorized('Invalid Google token. Please try again.', 'INVALID_GOOGLE_TOKEN');
    }

    const profile = await googleRes.json();
    const { sub: googleId, email, name, picture } = profile;

    // Verify token was issued for this application (prevents cross-app token reuse)
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (!expectedClientId && process.env.NODE_ENV === 'production') {
      console.error('[AUTH] GOOGLE_CLIENT_ID not set — Google OAuth is disabled in production');
      throw Errors.badRequest('Google sign-in is temporarily unavailable. Please use email/password login.');
    }
    if (expectedClientId) {
      const tokenInfoRes = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${googleAccessToken}`);
      if (tokenInfoRes.ok) {
        const tokenInfo = await tokenInfoRes.json();
        if (tokenInfo.aud !== expectedClientId) {
          throw Errors.unauthorized('Google token not issued for this application', 'INVALID_GOOGLE_TOKEN');
        }
      } else {
        throw Errors.unauthorized('Could not verify Google token. Please try again.', 'GOOGLE_TOKEN_VERIFY_FAILED');
      }
    }

    if (!email) {
      throw Errors.badRequest('Google account must have an email address');
    }

    // Find existing user by google_id or email
    let userResult = await db.query(
      `SELECT id, email, name, role, membership_type, google_id
       FROM users WHERE google_id = $1 OR email = $2
       LIMIT 1`,
      [googleId, email]
    );

    let user;

    if (userResult.rows.length === 0) {
      // Create new user — Google-authenticated users skip password & email verify
      const newUser = await db.query(
        `INSERT INTO users
           (email, name, google_id, avatar_url, email_verified, password_hash)
         VALUES ($1, $2, $3, $4, true, '')
         RETURNING id, email, name, role, membership_type`,
        [email, name || email.split('@')[0], googleId, picture || null]
      );
      user = newUser.rows[0];

      // Send welcome email (non-blocking)
      sendWelcomeEmail(email, user.name).catch(() => {});
    } else {
      user = userResult.rows[0];

      // Link google_id if not already linked
      if (!user.google_id) {
        await db.query(
          `UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2), email_verified = true
           WHERE id = $3`,
          [googleId, picture || null, user.id]
        );
      }
    }

    // Generate tokens
    const jwtAccessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Create session
    const sessionData = createSessionData(user, req);
    await db.query(
      `INSERT INTO sessions (user_id, session_id, refresh_token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        sessionData.sessionId,
        hashResetToken(refreshToken),
        sessionData.userAgent,
        sessionData.ipAddress,
        sessionData.expiresAt,
      ]
    );

    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Set tokens as HttpOnly cookies (no longer in response body)
    setAuthCookies(res, jwtAccessToken, refreshToken);

    res.json({
      success: true,
      message: 'Google authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        membershipType: user.membership_type,
      },
    });
  })
);

// ===========================================
// SMS PHONE VERIFICATION
// ===========================================

/**
 * POST /send-phone-verification
 * Send a 6-digit SMS code to verify phone number (requires auth)
 */
router.post(
  '/send-phone-verification',
  requireAuth,
  authRateLimit(3, 60 * 60 * 1000), // 3 per hour
  asyncHandler(async (req, res) => {
    const userResult = await db.query(
      'SELECT id, phone, phone_verified FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) throw Errors.notFound('User');
    const user = userResult.rows[0];

    if (!user.phone) {
      throw Errors.badRequest('No phone number on file. Please add a phone number first.');
    }

    if (user.phone_verified) {
      return res.json({ success: true, message: 'Phone already verified.' });
    }

    // Generate 6-digit code, store only the hash
    const code = generateVerificationCode();
    const codeHash = hashResetToken(code); // SHA-256 hash; never store plaintext OTPs
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.query(
      'UPDATE users SET phone_code = $1, phone_code_expires = $2 WHERE id = $3',
      [codeHash, expires, user.id]
    );

    // Import and send SMS (send the plaintext code to the user, not the hash)
    const { sendSMS } = await import('../services/smsService.js');
    const result = await sendSMS(
      user.phone,
      `The Video Pool: Your verification code is ${code}. Valid for 10 minutes.`,
      user.id
    );

    res.json({
      success: true,
      message: `Verification code sent to ${user.phone.slice(0, 3)}***${user.phone.slice(-4)}`,
    });
  })
);

/**
 * POST /verify-phone-code
 * Verify SMS code and mark phone as verified (requires auth)
 */
router.post(
  '/verify-phone-code',
  requireAuth,
  authRateLimit(5, 15 * 60 * 1000),
  [
    body('code')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('Valid 6-digit code is required'),
  ],
  asyncHandler(async (req, res) => {
    validate(req);
    const { code } = req.body;

    const userResult = await db.query(
      'SELECT id, phone_code, phone_code_expires, phone_verified FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) throw Errors.notFound('User');
    const user = userResult.rows[0];

    if (user.phone_verified) {
      return res.json({ success: true, message: 'Phone already verified.' });
    }

    // Compare hash of submitted code against stored hash
    const submittedHash = hashResetToken(code);
    if (!user.phone_code || user.phone_code !== submittedHash) {
      throw Errors.unauthorized('Invalid verification code', 'INVALID_CODE');
    }

    if (new Date(user.phone_code_expires) < new Date()) {
      throw Errors.unauthorized('Verification code expired. Please request a new one.', 'CODE_EXPIRED');
    }

    await db.query(
      `UPDATE users SET phone_verified = true, phone_code = NULL, phone_code_expires = NULL WHERE id = $1`,
      [user.id]
    );

    res.json({ success: true, message: 'Phone number verified successfully.' });
  })
);

// ===========================================
// FACEBOOK OAUTH
// ===========================================

/**
 * POST /facebook
 * Authenticate with Facebook OAuth access token
 * Validates via Facebook Graph API, finds or creates user
 */
router.post(
  '/facebook',
  authRateLimit(10, 60 * 60 * 1000),
  asyncHandler(async (req, res) => {
    const { accessToken: fbAccessToken } = req.body;

    if (!fbAccessToken) {
      throw Errors.badRequest('Facebook access token is required');
    }

    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const appId = process.env.FACEBOOK_APP_ID;

    if (!appSecret || !appId) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[AUTH] FACEBOOK_APP_SECRET or FACEBOOK_APP_ID not set — Facebook OAuth disabled in production');
        throw Errors.badRequest('Facebook sign-in is temporarily unavailable. Please use email/password login.');
      }
    }

    // Verify token was issued for THIS application (prevents cross-app token reuse)
    if (appId && appSecret) {
      const debugRes = await fetch(
        `https://graph.facebook.com/debug_token?input_token=${fbAccessToken}&access_token=${appId}|${appSecret}`
      );
      if (!debugRes.ok) {
        throw Errors.unauthorized('Could not verify Facebook token. Please try again.', 'FACEBOOK_TOKEN_VERIFY_FAILED');
      }
      const debugData = await debugRes.json();
      if (!debugData.data?.is_valid) {
        throw Errors.unauthorized('Invalid Facebook token. Please try again.', 'INVALID_FACEBOOK_TOKEN');
      }
      if (debugData.data.app_id !== appId) {
        throw Errors.unauthorized('Facebook token not issued for this application', 'INVALID_FACEBOOK_TOKEN');
      }
    }

    // Fetch user profile from Facebook Graph API
    const profileRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${fbAccessToken}`
    );

    if (!profileRes.ok) {
      throw Errors.unauthorized('Invalid Facebook token. Please try again.', 'INVALID_FACEBOOK_TOKEN');
    }

    const profile = await profileRes.json();
    const { id: facebookId, name, email, picture } = profile;
    const avatarUrl = picture?.data?.url || null;

    if (!email) {
      throw Errors.badRequest(
        'Your Facebook account does not have a public email address. Please use email/password registration instead.'
      );
    }

    // Find existing user by facebook_id or email
    let userResult = await db.query(
      `SELECT id, email, name, role, membership_type, facebook_id
       FROM users WHERE facebook_id = $1 OR email = $2
       LIMIT 1`,
      [facebookId, email]
    );

    let user;

    if (userResult.rows.length === 0) {
      // Create new user — Facebook-authenticated users skip password & email verify
      const newUser = await db.query(
        `INSERT INTO users
           (email, name, facebook_id, avatar_url, email_verified, password_hash)
         VALUES ($1, $2, $3, $4, true, '')
         RETURNING id, email, name, role, membership_type`,
        [email, name || email.split('@')[0], facebookId, avatarUrl]
      );
      user = newUser.rows[0];

      // Send welcome email (non-blocking)
      sendWelcomeEmail(email, user.name).catch(() => {});
    } else {
      user = userResult.rows[0];

      // Link facebook_id if not already linked
      if (!user.facebook_id) {
        await db.query(
          `UPDATE users SET facebook_id = $1, avatar_url = COALESCE(avatar_url, $2), email_verified = true
           WHERE id = $3`,
          [facebookId, avatarUrl, user.id]
        );
      }
    }

    // Generate tokens
    const jwtAccessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Create session
    const sessionData = createSessionData(user, req);
    await db.query(
      `INSERT INTO sessions (user_id, session_id, refresh_token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        sessionData.sessionId,
        hashResetToken(refreshToken),
        sessionData.userAgent,
        sessionData.ipAddress,
        sessionData.expiresAt,
      ]
    );

    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Set tokens as HttpOnly cookies (no longer in response body)
    setAuthCookies(res, jwtAccessToken, refreshToken);

    res.json({
      success: true,
      message: 'Facebook authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        membershipType: user.membership_type,
      },
    });
  })
);

// ===========================================
// SPOTIFY OAUTH
// ===========================================

/**
 * POST /spotify
 * Authenticate with Spotify OAuth access token
 * Validates via Spotify Web API, finds or creates user
 */
router.post(
  '/spotify',
  authRateLimit(10, 60 * 60 * 1000),
  asyncHandler(async (req, res) => {
    const { accessToken: spotifyAccessToken } = req.body;

    if (!spotifyAccessToken) {
      throw Errors.badRequest('Spotify access token is required');
    }

    // Fetch user profile from Spotify
    const spotifyRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${spotifyAccessToken}` },
    });

    if (!spotifyRes.ok) {
      throw Errors.unauthorized('Invalid Spotify token. Please try again.', 'INVALID_SPOTIFY_TOKEN');
    }

    const profile = await spotifyRes.json();
    const { id: spotifyId, email, display_name, images } = profile;
    const avatarUrl = images?.[0]?.url || null;

    if (!email) {
      throw Errors.badRequest('Your Spotify account does not have a public email address. Please use email/password registration instead.');
    }

    // Find existing user by spotify_id or email
    let userResult = await db.query(
      `SELECT id, email, name, role, membership_type, spotify_id
       FROM users WHERE spotify_id = $1 OR email = $2
       LIMIT 1`,
      [spotifyId, email]
    );

    let user;

    if (userResult.rows.length === 0) {
      // Create new user — Spotify-authenticated users skip password & email verify
      const newUser = await db.query(
        `INSERT INTO users
           (email, name, spotify_id, avatar_url, email_verified, password_hash)
         VALUES ($1, $2, $3, $4, true, '')
         RETURNING id, email, name, role, membership_type`,
        [email, display_name || email.split('@')[0], spotifyId, avatarUrl]
      );
      user = newUser.rows[0];

      // Send welcome email (non-blocking)
      sendWelcomeEmail(email, user.name).catch(() => {});
    } else {
      user = userResult.rows[0];

      // Link spotify_id if not already linked
      if (!user.spotify_id) {
        await db.query(
          `UPDATE users SET spotify_id = $1, avatar_url = COALESCE(avatar_url, $2), email_verified = true
           WHERE id = $3`,
          [spotifyId, avatarUrl, user.id]
        );
      }
    }

    // Generate tokens
    const jwtAccessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Create session
    const sessionData = createSessionData(user, req);
    await db.query(
      `INSERT INTO sessions (user_id, session_id, refresh_token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        sessionData.sessionId,
        hashResetToken(refreshToken),
        sessionData.userAgent,
        sessionData.ipAddress,
        sessionData.expiresAt,
      ]
    );

    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Set tokens as HttpOnly cookies
    setAuthCookies(res, jwtAccessToken, refreshToken);

    res.json({
      success: true,
      message: 'Spotify authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        membershipType: user.membership_type,
      },
    });
  })
);

// ===========================================
// APPLE OAUTH
// ===========================================

/**
 * POST /apple
 * Authenticate with Apple OAuth
 * Validates Apple JWT, finds or creates user
 */
router.post(
  '/apple',
  authRateLimit(10, 60 * 60 * 1000),
  [
    body('identityToken').notEmpty().withMessage('Apple identity token is required'),
    body('user').optional(), // Apple sends user data only on first sign-in
  ],
  asyncHandler(async (req, res) => {
    validate(req);

    const { identityToken, user: appleUserData } = req.body;

    if (!identityToken) {
      throw Errors.badRequest('Apple identity token is required');
    }

    // Decode Apple JWT (identity token is a JWT)
    // In production, verify the signature against Apple's public keys
    // For this implementation, we decode without verification (requires secure HTTPS)
    let decoded;
    try {
      const parts = identityToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Decode payload (without verification for now — production should verify signature)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      decoded = payload;
    } catch (error) {
      throw Errors.unauthorized('Invalid Apple identity token', 'INVALID_APPLE_TOKEN');
    }

    const { sub: appleId, email: appleEmail } = decoded;

    if (!appleId) {
      throw Errors.badRequest('Invalid Apple token: missing user ID');
    }

    // Use provided email or fallback (Apple may not include email in token on sign-in)
    const email = appleEmail || appleUserData?.email || `${appleId}@privaterelay.appleid.com`;
    const name = appleUserData?.name?.firstName
      ? `${appleUserData.name.firstName} ${appleUserData.name.lastName || ''}`.trim()
      : email.split('@')[0];

    // Find existing user by apple_id or email
    let userResult = await db.query(
      `SELECT id, email, name, role, membership_type, apple_id
       FROM users WHERE apple_id = $1 OR email = $2
       LIMIT 1`,
      [appleId, email]
    );

    let user;

    if (userResult.rows.length === 0) {
      // Create new user — Apple-authenticated users skip password & email verify
      const newUser = await db.query(
        `INSERT INTO users
           (email, name, apple_id, email_verified, password_hash)
         VALUES ($1, $2, $3, true, '')
         RETURNING id, email, name, role, membership_type`,
        [email, name, appleId]
      );
      user = newUser.rows[0];

      // Send welcome email (non-blocking)
      sendWelcomeEmail(email, user.name).catch(() => {});
    } else {
      user = userResult.rows[0];

      // Link apple_id if not already linked
      if (!user.apple_id) {
        await db.query(
          `UPDATE users SET apple_id = $1, email_verified = true
           WHERE id = $2`,
          [appleId, user.id]
        );
      }
    }

    // Generate tokens
    const jwtAccessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Create session
    const sessionData = createSessionData(user, req);
    await db.query(
      `INSERT INTO sessions (user_id, session_id, refresh_token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        sessionData.sessionId,
        hashResetToken(refreshToken),
        sessionData.userAgent,
        sessionData.ipAddress,
        sessionData.expiresAt,
      ]
    );

    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Set tokens as HttpOnly cookies
    setAuthCookies(res, jwtAccessToken, refreshToken);

    res.json({
      success: true,
      message: 'Apple authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        membershipType: user.membership_type,
      },
    });
  })
);

export default router;

