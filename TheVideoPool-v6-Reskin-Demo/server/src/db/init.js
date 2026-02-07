// ===========================================
// THE VIDEO POOL - Database Initialization
// Creates database and runs schema
// ===========================================

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ===========================================
// CONFIGURATION
// ===========================================

const DB_NAME = process.env.DB_NAME || 'thevideopool';
const DB_USER = process.env.DB_USER || 'tvp_user';
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT, 10) || 5432;

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Connect to PostgreSQL with default database
 */
async function getAdminClient() {
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'postgres', // Connect to default database first
  });

  await client.connect();
  return client;
}

/**
 * Connect to the application database
 */
async function getAppClient() {
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  await client.connect();
  return client;
}

/**
 * Check if database exists
 */
async function databaseExists(client, dbName) {
  const result = await client.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [dbName]
  );
  return result.rows.length > 0;
}

/**
 * Create the database if it doesn't exist
 */
async function createDatabase() {
  console.log('Checking database...');
  const client = await getAdminClient();

  try {
    const exists = await databaseExists(client, DB_NAME);

    if (exists) {
      console.log(`Database "${DB_NAME}" already exists.`);
    } else {
      console.log(`Creating database "${DB_NAME}"...`);

      // Create database (cannot use parameterized query for database name)
      await client.query(`CREATE DATABASE ${DB_NAME}`);

      console.log(`Database "${DB_NAME}" created successfully.`);
    }
  } finally {
    await client.end();
  }
}

/**
 * Run the schema SQL file
 */
async function runSchema() {
  console.log('Running schema...');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  const client = await getAppClient();

  try {
    // Run the entire schema
    await client.query(schema);
    console.log('Schema applied successfully.');
  } finally {
    await client.end();
  }
}

/**
 * Verify the schema was applied correctly
 */
async function verifySchema() {
  console.log('Verifying schema...');

  const client = await getAppClient();

  try {
    // Check for all expected tables
    const expectedTables = [
      'users',
      'videos',
      'video_versions',
      'downloads',
      'user_sets',
      'set_tracks',
      'favorites',
      'verification_codes',
      'backup_codes',
      'memberships',
    ];

    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);

    const existingTables = result.rows.map(row => row.table_name);

    console.log('\nTables in database:');
    console.log('─'.repeat(40));

    let allTablesExist = true;
    for (const table of expectedTables) {
      const exists = existingTables.includes(table);
      const status = exists ? '✓' : '✗';
      console.log(`  ${status} ${table}`);
      if (!exists) allTablesExist = false;
    }

    console.log('─'.repeat(40));

    if (allTablesExist) {
      console.log('All tables created successfully!');
    } else {
      console.log('Warning: Some tables are missing.');
    }

    // Count indexes
    const indexResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = 'public'
    `);
    console.log(`\nTotal indexes: ${indexResult.rows[0].count}`);

    // List enum types
    const enumResult = await client.query(`
      SELECT typname
      FROM pg_type
      WHERE typtype = 'e'
    `);
    console.log('\nEnum types:');
    enumResult.rows.forEach(row => {
      console.log(`  - ${row.typname}`);
    });

    return allTablesExist;
  } finally {
    await client.end();
  }
}

/**
 * Drop all tables (for clean reset)
 */
async function dropAllTables() {
  console.log('Dropping all tables...');

  const client = await getAppClient();

  try {
    // Drop tables in correct order (respecting foreign keys)
    const dropOrder = [
      'backup_codes',
      'verification_codes',
      'favorites',
      'set_tracks',
      'user_sets',
      'downloads',
      'video_versions',
      'videos',
      'users',
      'memberships',
    ];

    for (const table of dropOrder) {
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      console.log(`  Dropped ${table}`);
    }

    // Drop enum types
    const enumTypes = [
      'membership_type',
      'version_type',
      'video_quality',
      'account_status',
      'verification_type',
    ];

    for (const enumType of enumTypes) {
      await client.query(`DROP TYPE IF EXISTS ${enumType} CASCADE`);
      console.log(`  Dropped type ${enumType}`);
    }

    console.log('All tables dropped.');
  } finally {
    await client.end();
  }
}

// ===========================================
// MAIN INITIALIZATION
// ===========================================

async function init(options = {}) {
  const { reset = false, skipVerify = false } = options;

  console.log('');
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   THE VIDEO POOL - Database Initialization    ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
  console.log(`Database: ${DB_NAME}`);
  console.log(`Host: ${DB_HOST}:${DB_PORT}`);
  console.log(`User: ${DB_USER}`);
  console.log('');

  try {
    // Step 1: Create database if needed
    await createDatabase();

    // Step 2: If reset flag, drop all tables first
    if (reset) {
      console.log('');
      console.log('Reset flag detected - dropping existing tables...');
      await dropAllTables();
    }

    // Step 3: Run schema
    console.log('');
    await runSchema();

    // Step 4: Verify
    if (!skipVerify) {
      console.log('');
      await verifySchema();
    }

    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('Database initialization complete!');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Run seed script: npm run db:seed');
    console.log('  2. Start the server: npm run dev');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════');
    console.error('Database initialization failed!');
    console.error('═══════════════════════════════════════════════');
    console.error('');
    console.error('Error:', error.message);
    console.error('');

    if (error.code === 'ECONNREFUSED') {
      console.error('Could not connect to PostgreSQL.');
      console.error('Please ensure PostgreSQL is running and accessible.');
    } else if (error.code === '28P01') {
      console.error('Authentication failed.');
      console.error('Please check your database credentials in .env');
    } else if (error.code === '42P07') {
      console.error('Some objects already exist.');
      console.error('Run with --reset flag to drop existing tables first.');
    }

    console.error('');
    process.exit(1);
  }
}

// ===========================================
// CLI HANDLING
// ===========================================

// Check for CLI flags
const args = process.argv.slice(2);
const reset = args.includes('--reset') || args.includes('-r');
const skipVerify = args.includes('--skip-verify');
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
Usage: node init.js [options]

Options:
  --reset, -r      Drop all existing tables before creating
  --skip-verify    Skip verification step
  --help, -h       Show this help message

Examples:
  node init.js                  # Normal initialization
  node init.js --reset          # Reset database (drop all tables first)
  node init.js --reset -s       # Reset without verification
`);
  process.exit(0);
}

// Run initialization
init({ reset, skipVerify });
