# The Video Pool - Supabase Project Setup

## Step 1: Create the Supabase Project (via Dashboard)

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Organization**: Select your organization
   - **Database Name**: `the-video-pool`
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

## Step 2: Get Your Credentials

Once the project is created:

1. Go to Project Settings > Database
2. Copy these values:
   - **Project ID** (shown in URL or settings)
   - **Host** (under "Connection string")
   - **Database Name** (usually `postgres`)
   - **Password** (the one you set during creation)
   - **Port** (usually `5432`)

## Step 3: Create the Schema and Tables

1. In Supabase Dashboard, go to SQL Editor
2. Create a new query
3. Copy the entire contents of `/Users/dremacmini/Desktop/OC/video-pool/SUPABASE_MIGRATION.sql`
4. Paste into the SQL editor
5. Click "Run"
6. Wait for completion (should see success messages)

## Step 4: Verify the Schema

In SQL Editor, run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'the_video_pool'
ORDER BY table_name;
```

Should return 6 tables:
- downloads
- favorites
- playlist_videos
- playlists
- user_profiles
- videos

## Step 5: Generate Your DATABASE_URL

Using your credentials from Step 2:

```
postgresql://postgres:{PASSWORD}@{HOST}:5432/postgres?schema=the_video_pool
```

Replace:
- `{PASSWORD}` with your database password
- `{HOST}` with your Supabase host (e.g., `abcdefghij.supabase.co`)

## Step 6: Save Credentials Locally

Once you have all the info, run this command:

```bash
cat > /Users/dremacmini/Desktop/OC/video-pool/TVP_SUPABASE_CREDENTIALS.md << 'CREDS'
# The Video Pool - Supabase Credentials

## Project Details
- **Project Name**: The Video Pool
- **Project ID**: [YOUR_PROJECT_ID]
- **Region**: [YOUR_REGION]
- **Created**: [DATE]

## Database Connection
- **Host**: [YOUR_HOST].supabase.co
- **Database**: postgres
- **Schema**: the_video_pool
- **Port**: 5432
- **User**: postgres

## Full DATABASE_URL
```
postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST].supabase.co:5432/postgres?schema=the_video_pool
```

## Tables Created (Verified)
- [x] videos (6 indexes)
- [x] user_profiles (3 indexes)
- [x] favorites (3 indexes, 1 unique constraint)
- [x] downloads (3 indexes)
- [x] playlists (3 indexes)
- [x] playlist_videos (3 indexes, 1 unique constraint)

## Schema Verification
SQL Query Result:
\`\`\`
 table_name
----------------
 downloads
 favorites
 playlist_videos
 playlists
 user_profiles
 videos
(6 rows)
\`\`\`

## Next Steps
1. Copy DATABASE_URL to Railway environment variables
2. Deploy backend to Railway
3. Update Vercel environment variables
4. Test endpoints
CREDS
```

---

## Alternative: Use Supabase CLI for Link (Optional)

If you want to link this to your local Supabase:

```bash
cd /Users/dremacmini/Desktop/OC/.supabase-tvp

# Link to your remote project
supabase link --project-ref {YOUR_PROJECT_ID}

# Push migrations
supabase db push

# Pull latest schema
supabase db pull
```

---

## Troubleshooting

### Can't find Host?
- Go to Supabase Dashboard > Project Settings > Database
- Look for "Connection string" 
- Extract the host from `postgresql://postgres:...@HOST:5432/...`

### Schema didn't create?
- Check SQL Editor for error messages
- Ensure you ran the ENTIRE migration.sql file
- Run the verification query to check

### Wrong schema name?
- The migration creates `the_video_pool` schema
- Make sure your DATABASE_URL includes `?schema=the_video_pool`
