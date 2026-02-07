// ===========================================
// THE VIDEO POOL - 404 Not Found Handler
// ===========================================

/**
 * Handle 404 errors for unmatched routes
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Resource not found',
    code: 'NOT_FOUND',
    path: req.originalUrl,
    method: req.method,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    suggestion: 'Please check the API documentation for valid endpoints.',
    availableEndpoints: {
      auth: '/api/auth',
      videos: '/api/videos',
      user: '/api/user',
      memberships: '/api/memberships',
      health: '/health',
    },
  });
};

export default notFoundHandler;
