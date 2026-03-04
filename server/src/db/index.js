// ===========================================
// THE VIDEO POOL - Database Module Index
// ===========================================

// Re-export everything from config
export { query, transaction, testConnection, closePool, pool } from './config.js';
export { default } from './config.js';

// ===========================================
// AUTO-MIGRATION RUNNER
// ===========================================
// Migrations run at module load time (server startup) unless SKIP_MIGRATIONS=true.
// NOTE: The tvp_app database user cannot ALTER TABLE on tables it does not own.
//       For DDL migrations (schema changes), use the Supabase Management API instead:
//         POST https://api.supabase.com/v1/projects/{ref}/database/query
//       Data-only migrations (UPDATE, INSERT) run safely here.
//
// Migration 020 only contains UPDATE statements against the videos table,
// which tvp_app can execute (it has DML rights on all tables).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Auto-run migration 020: Standardize resolution labels
if (!process.env.SKIP_MIGRATIONS) {
  const migration020Path = path.join(
    __dirname,
    'migrations',
    '020_standardize_resolution_labels.sql'
  );

  const migration020 = fs.readFileSync(migration020Path, 'utf-8');

  pool.query(migration020)
    .then(() => {
      console.log('[Migration 020] Resolution labels standardized successfully.');
    })
    .catch(err => {
      // Log the failure but do not crash the server — the backup table preserves
      // original data and the migration is idempotent, so it can be re-run via
      // `npm run db:migrate` from within the server/ directory.
      console.error('[Migration 020] Failed:', err.message);
    });
}
