// ===========================================
// THE VIDEO POOL - Global Error Handler
// ===========================================

/**
 * Custom API Error class for consistent error handling
 */
export class APIError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error factory methods
 */
export const Errors = {
  badRequest: (message = 'Bad request', details = null) =>
    new APIError(message, 400, 'BAD_REQUEST', details),

  unauthorized: (message = 'Unauthorized', code = 'UNAUTHORIZED') =>
    new APIError(message, 401, code),

  forbidden: (message = 'Forbidden', code = 'FORBIDDEN') =>
    new APIError(message, 403, code),

  notFound: (resource = 'Resource') =>
    new APIError(`${resource} not found`, 404, 'NOT_FOUND'),

  conflict: (message = 'Conflict', code = 'CONFLICT') =>
    new APIError(message, 409, code),

  tooManyRequests: (retryAfter = 60) =>
    new APIError('Too many requests', 429, 'RATE_LIMITED', { retryAfter }),

  internal: (message = 'Internal server error') =>
    new APIError(message, 500, 'INTERNAL_ERROR'),

  validation: (errors) =>
    new APIError('Validation failed', 400, 'VALIDATION_ERROR', errors),
};

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';
  let details = err.details || null;

  // Handle specific error types

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Validation errors from express-validator
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    details = err.array();
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    // Unique constraint violation
    statusCode = 409;
    message = 'Resource already exists';
    code = 'DUPLICATE_ENTRY';
  }

  if (err.code === '23503') {
    // Foreign key violation
    statusCode = 400;
    message = 'Referenced resource does not exist';
    code = 'FOREIGN_KEY_ERROR';
  }

  // Stripe errors
  if (err.type === 'StripeCardError') {
    statusCode = 400;
    message = err.message;
    code = 'PAYMENT_ERROR';
  }

  if (err.type === 'StripeInvalidRequestError') {
    statusCode = 400;
    message = 'Invalid payment request';
    code = 'PAYMENT_ERROR';
  }

  // Log error in development/production
  if (process.env.NODE_ENV === 'production') {
    // In production, log to error tracking service
    console.error(`[ERROR] ${code}: ${message}`, {
      statusCode,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      stack: err.stack,
    });

    // Don't expose internal error details in production
    if (!err.isOperational) {
      message = 'An unexpected error occurred';
      details = null;
    }
  } else {
    // In development, log full error
    console.error('\n[ERROR]', err);
  }

  // Send error response
  const response = {
    success: false,
    error: message,
    code,
  };

  // Include details if available
  if (details) {
    response.details = details;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Async handler wrapper to catch async errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;
