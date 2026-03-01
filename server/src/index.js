// ===========================================
// THE VIDEO POOL - Production Backend Server
// ===========================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Force IPv4 DNS resolution — Railway containers cannot reach IPv6 addresses
// (Supabase direct connection DNS returns IPv6 first, causing ENETUNREACH)
import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");

// Load environment variables
dotenv.config();

// Security assertions
if (!process.env.JWT_SECRET) {
  console.error("[SECURITY FATAL] JWT_SECRET is not set. Refusing to start.");
  process.exit(1);
}
if (!process.env.REFRESH_TOKEN_SECRET) {
  console.error(
    "[SECURITY WARNING] REFRESH_TOKEN_SECRET is not set — falling back to JWT_SECRET. Set a separate secret for production security isolation.",
  );
}
if (
  !process.env.STRIPE_WEBHOOK_SECRET &&
  process.env.NODE_ENV === "production"
) {
  console.warn(
    "[SECURITY WARNING] STRIPE_WEBHOOK_SECRET not set — Stripe webhooks will be accepted without signature verification.",
  );
}

// Google OAuth configuration check
if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn(
    "[OAuth] GOOGLE_CLIENT_ID not set — Google sign-in will be unavailable. Set GOOGLE_CLIENT_ID environment variable to enable.",
  );
} else {
  const clientIdLength = process.env.GOOGLE_CLIENT_ID.length;
  const isValidFormat = process.env.GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com');
  console.log(
    `[OAuth] Google OAuth configured (Client ID length: ${clientIdLength}, Valid format: ${isValidFormat ? '✓' : '✗'})`,
  );
}

// Import routes
import authRoutes from "./routes/auth.js";
import videoRoutes from "./routes/videos.js";
import userRoutes from "./routes/user.js";
import membershipRoutes from "./routes/memberships.js";
import adminRoutes from "./routes/admin.js";
import webhookRoutes from "./routes/webhooks.js";
import genreRoutes from "./routes/genres.js";
import favoriteRoutes from "./routes/favorites.js";
import playlistRoutes from "./routes/playlists.js";
import downloadRoutes from "./routes/downloads.js";
import setRoutes from "./routes/sets.js";
import couponsRoutes from "./routes/coupons.js";
import supportRoutes from "./routes/support.js";
import marketingRoutes from "./routes/marketing.js";
import contentQueueRoutes from "./routes/content-queue.js";
import { getDetailedHealth } from "./services/healthService.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { csrfProtection } from "./middleware/csrfProtection.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Railway/Heroku/Vercel reverse proxy
app.set("trust proxy", 1);

// ===========================================
// MIDDLEWARE
// ===========================================

// Security headers
app.use(helmet());

// CORS configuration — supports comma-separated FRONTEND_URL for multi-domain
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3001")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Request logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Parse cookies from request headers
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Body parsing (except for webhooks which need raw body)
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CSRF protection (origin validation for state-changing requests)
app.use("/api", csrfProtection);

// ===========================================
// HEALTH CHECK
// ===========================================

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// API Health check (matches Steve's /api/health for Railway)
app.get("/api/health", async (req, res) => {
  try {
    const { pool } = await import("./db/pool.js");
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

// Detailed health (admin)
app.get("/api/health/detailed", async (req, res) => {
  // Simple auth check — requires admin token
  const { requireAuth, requireAdmin } = await import("./middleware/auth.js");
  requireAuth(req, res, () => {
    requireAdmin(req, res, async () => {
      try {
        const health = await getDetailedHealth();
        res.json(health);
      } catch (e) {
        res.status(500).json({ status: "error", error: e.message });
      }
    });
  });
});

// ===========================================
// API ROUTES
// ===========================================

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/user", userRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/sets", setRoutes);
app.use("/api", couponsRoutes);
app.use("/api", supportRoutes);
app.use("/api", marketingRoutes);
app.use("/api", contentQueueRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

app.use(notFoundHandler);
app.use(errorHandler);

// ===========================================
// START SERVER
// ===========================================

// Graceful error handling before startup
process.on("uncaughtException", err => {
  console.error("[FATAL] Uncaught Exception:", err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[FATAL] Unhandled Rejection:", reason);
  process.exit(1);
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   🎬 THE VIDEO POOL - Backend API Server      ║
╠═══════════════════════════════════════════════╣
║   Status:      Running ✓                      ║
║   Port:        ${PORT}                            ║
║   Environment: ${(process.env.NODE_ENV || "development").padEnd(28)}║
║   API Base:    http://localhost:${PORT}/api       ║
║   Listening:   0.0.0.0:${PORT}                  ║
╚═══════════════════════════════════════════════╝
  `);
  console.log("[STARTUP] ✓ Backend ready to accept requests");
});

server.on("error", err => {
  console.error("[SERVER ERROR] Unable to start server:", err.message);
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

export default app;
// CORS fix
