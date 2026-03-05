// ===========================================
// THE VIDEO POOL - Database Connection Pool
// PostgreSQL connection configuration
// ===========================================

import pg from 'pg';

const { Pool } = pg;

// Create connection pool
// Force pool to pick up DATABASE_URL from environment at runtime
// Pooler: aws-1-us-east-1.pooler.supabase.com:6543
// Password: TvpApp@Railway2026 (@ encoded as %40 in URL)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Pool configuration
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection not established
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Log connection events in development
if (process.env.NODE_ENV !== 'production') {
  pool.on('connect', () => {
    console.log('Database connection established');
  });

  pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
  });
}

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Database connected:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

/**
 * Graceful shutdown
 */
export async function closePool() {
  await pool.end();
  console.log('Database pool closed');
}

export default pool;
