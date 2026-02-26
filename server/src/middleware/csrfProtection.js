// ===========================================
// THE VIDEO POOL - CSRF Protection Middleware
// ===========================================
//
// This API uses JWT Bearer tokens (not cookie-based sessions),
// which provides inherent CSRF protection since browsers never
// auto-attach Authorization headers. However, as defense-in-depth:
//
// 1. Validate Origin/Referer headers on state-changing requests
// 2. Enforce SameSite cookie policy on any cookies set
// ===========================================

/**
 * Middleware: Validate Origin header on state-changing requests.
 * Rejects POST/PUT/DELETE/PATCH requests from unknown origins.
 */
export function csrfProtection(req, res, next) {
  // Only check state-changing methods
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Skip CSRF check for webhook endpoints (Stripe sends POST without browser origin)
  if (req.path.includes("/webhooks/")) {
    return next();
  }

  // Get origin or referer
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // If neither header present, this is likely a server-to-server request (curl, Postman).
  // Allow if Authorization header is present (Bearer token = not from browser form).
  if (!origin && !referer) {
    if (req.headers.authorization) {
      return next(); // API client with Bearer token
    }
    // No origin, no referer, no auth header — suspicious
    return res.status(403).json({
      success: false,
      error: "CSRF validation failed: missing Origin header",
      code: "CSRF_FAILED",
    });
  }

  // Validate against allowed origins
  const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3001")
    .split(",")
    .map(o => o.trim())
    .filter(Boolean);

  // Also allow the API's own origin
  allowedOrigins.push(`http://localhost:${process.env.PORT || 5000}`);

  const requestOrigin = origin || new URL(referer).origin;

  if (allowedOrigins.includes(requestOrigin)) {
    return next();
  }

  console.warn(`[CSRF] Blocked request from origin: ${requestOrigin}`);
  return res.status(403).json({
    success: false,
    error: "CSRF validation failed: untrusted origin",
    code: "CSRF_FAILED",
  });
}

/**
 * Helper: Set secure cookie defaults.
 * Call this when setting any cookie to ensure SameSite + Secure flags.
 */
export function setSecureCookie(res, name, value, options = {}) {
  const defaults = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };

  res.cookie(name, value, { ...defaults, ...options });
}

export default { csrfProtection, setSecureCookie };
