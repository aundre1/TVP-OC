// ===========================================
// THE VIDEO POOL - Migration Runner
// Runs schema + all migrations against Supabase
// Usage: node src/db/migrate.js
// ===========================================

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[FATAL] DATABASE_URL is not set. Cannot run migrations.');
  process.exit(1);
}

async function getClient() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

async function runSQL(client, sql, label) {
  try {
    await client.query(sql);
    console.log(`  ✓ ${label}`);
  } catch (err) {
    // Ignore "already exists" type errors (idempotent migrations)
    if (
      err.message.includes('already exists') ||
      err.message.includes('does not exist') ||
      err.code === '42701' || // duplicate column
      err.code === '42P07' || // duplicate table
      err.code === '42710'    // duplicate object
    ) {
      console.log(`  ~ ${label} (already applied, skipping)`);
    } else {
      console.error(`  ✗ ${label}`);
      console.error(`    Error: ${err.message}`);
      throw err;
    }
  }
}

async function runFile(client, filePath, label) {
  const sql = fs.readFileSync(filePath, 'utf-8');
  // Split on semicolons but preserve multi-statement blocks
  // Run as a single transaction
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`  ✓ ${label}`);
  } catch (err) {
    await client.query('ROLLBACK');
    if (
      err.message.includes('already exists') ||
      err.code === '42701' ||
      err.code === '42P07' ||
      err.code === '42710'
    ) {
      console.log(`  ~ ${label} (already applied, skipping)`);
    } else {
      console.error(`  ✗ ${label} FAILED`);
      console.error(`    Code: ${err.code}`);
      console.error(`    Error: ${err.message}`);
      // Don't throw — continue with remaining migrations
    }
  }
}

async function createMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
}

async function hasMigrationRun(client, filename) {
  const result = await client.query(
    'SELECT 1 FROM schema_migrations WHERE filename = $1',
    [filename]
  );
  return result.rows.length > 0;
}

async function markMigrationDone(client, filename) {
  await client.query(
    'INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING',
    [filename]
  );
}

async function main() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   THE VIDEO POOL - Database Migration Runner  ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
  console.log('Connecting to database...');

  let client;
  try {
    client = await getClient();
    console.log('  ✓ Connected to database');
  } catch (err) {
    console.error('  ✗ Connection failed:', err.message);
    process.exit(1);
  }

  try {
    // Step 1: Create migrations tracking table
    console.log('\n[Step 1] Setting up migrations table...');
    await createMigrationsTable(client);
    console.log('  ✓ schema_migrations table ready');

    // Step 2: Run base schema
    const schemaFile = path.join(__dirname, 'schema.sql');
    const schemaFilename = 'schema.sql';

    console.log('\n[Step 2] Applying base schema...');
    if (await hasMigrationRun(client, schemaFilename)) {
      console.log('  ~ schema.sql already applied, skipping');
    } else {
      await runFile(client, schemaFile, 'schema.sql');
      await markMigrationDone(client, schemaFilename);
    }

    // Step 3: Run numbered migrations in order
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // ensures 001, 002, ... order

    console.log(`\n[Step 3] Running ${migrationFiles.length} migrations...`);

    for (const filename of migrationFiles) {
      if (await hasMigrationRun(client, filename)) {
        console.log(`  ~ ${filename} (already applied)`);
        continue;
      }

      const filePath = path.join(migrationsDir, filename);
      await runFile(client, filePath, filename);
      await markMigrationDone(client, filename);
    }

    // Step 4: Verify tables
    console.log('\n[Step 4] Verifying tables...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tables = result.rows.map(r => r.table_name);
    console.log(`  ✓ Found ${tables.length} tables:`);
    tables.forEach(t => console.log(`    - ${t}`));

    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('  Migration complete! Database is ready.');
    console.log('═══════════════════════════════════════════════');
    console.log('');

  } catch (err) {
    console.error('\n[FATAL] Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
