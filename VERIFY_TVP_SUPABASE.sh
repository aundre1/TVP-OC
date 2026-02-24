#!/bin/bash

# The Video Pool - Supabase Verification Script
# Usage: bash VERIFY_TVP_SUPABASE.sh

echo "=========================================="
echo "The Video Pool - Supabase Setup Verification"
echo "=========================================="
echo ""

# Check if DATABASE_URL is provided
if [ -z "$1" ]; then
    echo "Usage: bash VERIFY_TVP_SUPABASE.sh 'postgresql://postgres:PASSWORD@HOST:5432/postgres?schema=the_video_pool'"
    echo ""
    echo "Or set DATABASE_URL environment variable:"
    echo "  export DATABASE_URL='postgresql://...'"
    echo "  bash VERIFY_TVP_SUPABASE.sh"
    exit 1
fi

DB_URL=$1

echo "Testing connection to Supabase..."
echo ""

# Try to connect and run verification query
psql "$DB_URL" << 'SQL'
-- Verify the_video_pool schema exists
SELECT 'SCHEMA' as check_type, 'the_video_pool' as name, 'EXISTS' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.schemata 
    WHERE schema_name = 'the_video_pool'
);

-- List all tables in the_video_pool schema
SELECT 'TABLE' as check_type, table_name as name, 'EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'the_video_pool'
ORDER BY table_name;

-- Count indexes
SELECT 'INDEXES' as check_type, 
  CAST(COUNT(*) AS TEXT) as name, 
  'TOTAL' as status
FROM pg_indexes
WHERE schemaname = 'the_video_pool';

-- Verify key constraints
SELECT 'CONSTRAINT' as check_type, constraint_name as name, 'EXISTS' as status
FROM information_schema.table_constraints
WHERE table_schema = 'the_video_pool'
AND constraint_type IN ('UNIQUE', 'PRIMARY KEY')
LIMIT 10;
SQL

echo ""
echo "=========================================="
echo "Verification complete!"
echo "=========================================="
