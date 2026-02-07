// ===========================================
// THE VIDEO POOL - Database Configuration
// PostgreSQL connection pool using pg
// ===========================================

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// ===========================================
// CONNECTION CONFIGURATION
// ===========================================

const poolConfig = {
  // Use DATABASE_URL if available (for Heroku/Railway/etc)
  // Otherwise construct from individual env vars
  connectionString: process.env.DATABASE_URL,

  // Individual connection params (fallback if no DATABASE_URL)
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'thevideopool',
  user: process.env.DB_USER || 'tvp_user',
  password: process.env.DB_PASSWORD,

  // Pool configuration
  max: 20,                    // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return error after 10 seconds if no connection

  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
};

// If DATABASE_URL is provided, remove individual params to avoid conflicts
if (process.env.DATABASE_URL) {
  delete poolConfig.host;
  delete poolConfig.port;
  delete poolConfig.database;
  delete poolConfig.user;
  delete poolConfig.password;
}

// Create the connection pool
const pool = new Pool(poolConfig);

// ===========================================
// ERROR HANDLING
// ===========================================

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client:', err);
  // Don't exit in production - the pool will attempt to reconnect
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Database client connected');
  }
});

// ===========================================
// QUERY HELPER FUNCTION
// ===========================================

/**
 * Execute a SQL query with automatic connection handling
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters (optional)
 * @returns {Promise<pg.QueryResult>} Query result
 *
 * @example
 * // Simple query
 * const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
 *
 * @example
 * // Insert with returning
 * const { rows } = await query(
 *   'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
 *   [email, name]
 * );
 */
export async function query(text, params) {
  const start = Date.now();

  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries in development
    if (process.env.NODE_ENV !== 'production' && duration > 100) {
      console.log('Slow query:', { text, duration: `${duration}ms`, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error('Database query error:', {
      query: text,
      params,
      error: error.message,
    });
    throw error;
  }
}

// ===========================================
// TRANSACTION HELPER
// ===========================================

/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Async function receiving client
 * @returns {Promise<any>} Result from callback
 *
 * @example
 * const result = await transaction(async (client) => {
 *   await client.query('UPDATE users SET credits = credits - 1 WHERE id = $1', [userId]);
 *   await client.query('INSERT INTO downloads (user_id, video_id) VALUES ($1, $2)', [userId, videoId]);
 *   return { success: true };
 * });
 */
export async function transaction(callback) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ===========================================
// CONNECTION TEST
// ===========================================

/**
 * Test database connectivity
 * @returns {Promise<boolean>} True if connected successfully
 */
export async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time, current_database() as database');
    console.log('Database connection successful:', {
      database: result.rows[0].database,
      time: result.rows[0].current_time,
    });
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

// ===========================================
// GRACEFUL SHUTDOWN
// ===========================================

/**
 * Close all database connections gracefully
 * Call this when shutting down the application
 */
export async function closePool() {
  try {
    await pool.end();
    console.log('Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

// ===========================================
// EXPORTS
// ===========================================

export { pool };
export default {
  query,
  transaction,
  testConnection,
  closePool,
  pool,
};
