# Backend Spec: Metadata Extraction & Record Label Feature

**For:** Steve (Backend Developer)
**From:** TVP Frontend Team + Council
**Date:** January 2026
**Priority:** High - Required for proper sorting and display

---

## Overview

We batch-uploaded 30,000 legacy videos from TVP v1. All have the same `upload_date`, making "New Releases" sorting useless. We need to:

1. Add **Record Label** as a new field
2. Extract metadata from MP4 files (ID3 tags)
3. Use external APIs to fill gaps
4. Enable proper date-based sorting

---

## New Field: Record Label

**Type:** Free text (VARCHAR 255)
**Display:** To the right of Title in track listings
**Examples:** "Interscope Records", "Atlantic", "Def Jam", "Columbia", "Republic"

### Frontend Display Order
```
[Play] [Thumb] | Title | Record Label | Artist | BPM | Key | Quality
```

---

## Database Schema Updates

```sql
ALTER TABLE videos ADD COLUMN record_label VARCHAR(255) NULL;
ALTER TABLE videos ADD COLUMN date_created DATETIME NULL;
ALTER TABLE videos ADD COLUMN date_modified DATETIME NULL;
ALTER TABLE videos ADD COLUMN release_date DATE NULL;
ALTER TABLE videos ADD COLUMN metadata_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE videos ADD COLUMN metadata_source ENUM('id3', 'api', 'manual', 'pending') DEFAULT 'pending';
```

### Complete Schema

| Field | Type | Required | Source Priority |
|-------|------|----------|-----------------|
| id | INT | Yes | Auto |
| title | VARCHAR(255) | **Yes** | ID3 → Filename → Manual |
| artist | VARCHAR(255) | **Yes** | ID3 → API → Manual |
| record_label | VARCHAR(255) | **Yes** | ID3 → API (Discogs/MusicBrainz) → Manual |
| genre | VARCHAR(100) | **Yes** | ID3 → API → Manual |
| bpm | INT | **Yes** | ID3 → API (Spotify/AcousticBrainz) |
| key | VARCHAR(10) | No | ID3 → API (AcousticBrainz) |
| quality | VARCHAR(10) | **Yes** | File analysis (resolution) |
| upload_date | DATETIME | **Yes** | Auto on upload |
| date_created | DATETIME | No | MP4 file metadata |
| date_modified | DATETIME | No | MP4 file metadata |
| release_date | DATE | No | API lookup (last resort for sorting) |
| metadata_complete | BOOLEAN | Yes | Computed |
| metadata_source | ENUM | Yes | Track where data came from |

---

## Date Sorting Priority (Waterfall Logic)

For sorting "by date," use this priority:

```
1. date_created    ← First choice (from MP4 metadata)
2. date_modified   ← Fallback (from MP4 metadata)
3. release_date    ← Last resort (from API lookup)
4. upload_date     ← Final fallback (always available)
```

### SQL Example
```sql
SELECT * FROM videos
ORDER BY COALESCE(date_created, date_modified, release_date, upload_date) DESC;
```

---

## "New Releases" Section Definition

**Definition:** Videos where `upload_date` is within the last 30 days

```sql
SELECT * FROM videos
WHERE upload_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY upload_date DESC;
```

This shows **actually new uploads** to TVP, not old songs with recent release dates.

---

## File Storage Locations

Videos are stored in TWO locations:

1. **Cloud:** Wasabi S3-compatible storage
2. **Local:** `E:\TVP Videos\videos`

Metadata extraction should work from the **local copies** first (faster, no bandwidth cost).

---

## Metadata Extraction Process

### Phase 1: Extract ID3 Tags from Local Files

Run a batch script on `E:\TVP Videos\videos` to extract:

**Tools:** FFprobe (ffmpeg), MediaInfo, or Python mutagen library

```bash
# Example using ffprobe
ffprobe -v quiet -print_format json -show_format "video.mp4"
```

**Extract these fields:**
- Title (`title` or `TITLE`)
- Artist (`artist` or `ARTIST`)
- Album/Label (`album`, `publisher`, `label`, `TPUB`)
- Genre (`genre` or `GENRE`)
- BPM (`TBPM` or `bpm`)
- Date (`date`, `creation_time`, `TDRC`)

**Python example:**
```python
from mutagen.mp4 import MP4
import os
from datetime import datetime

def extract_metadata(filepath):
    video = MP4(filepath)
    stat = os.stat(filepath)

    return {
        'title': video.tags.get('\xa9nam', [None])[0],
        'artist': video.tags.get('\xa9ART', [None])[0],
        'genre': video.tags.get('\xa9gen', [None])[0],
        'record_label': video.tags.get('\xa9pub', [None])[0],  # Publisher
        'bpm': video.tags.get('tmpo', [None])[0],
        'date_created': datetime.fromtimestamp(stat.st_ctime),
        'date_modified': datetime.fromtimestamp(stat.st_mtime),
    }
```

### Phase 2: API Enrichment for Missing Data

After ID3 extraction, run API lookups **only for videos with gaps**.

```sql
-- Find videos missing required fields
SELECT id, title, artist FROM videos
WHERE metadata_complete = FALSE
AND (record_label IS NULL OR genre IS NULL OR bpm IS NULL);
```

**API Sources:**

| Field | Primary API | Fallback API |
|-------|-------------|--------------|
| Record Label | Discogs | MusicBrainz |
| Genre | Spotify | MusicBrainz |
| BPM | Spotify | AcousticBrainz |
| Key | AcousticBrainz | Spotify Audio Features |
| Release Date | MusicBrainz | Discogs |

**API Rate Limits to Consider:**
- Discogs: 60 requests/minute
- MusicBrainz: 1 request/second
- Spotify: 100 requests/minute (with auth)

**Recommendation:** Process in batches with delays. For 30K videos, expect 8-10 hours for full API enrichment.

### Phase 3: Mark Complete

After both phases, update:

```sql
UPDATE videos
SET metadata_complete = TRUE
WHERE title IS NOT NULL
  AND artist IS NOT NULL
  AND genre IS NOT NULL
  AND bpm IS NOT NULL
  AND record_label IS NOT NULL;
```

---

## API Enrichment Timing

**For new uploads:** Background job after upload
- Upload completes immediately (fast UX)
- Metadata extraction runs as async job
- API enrichment queued if ID3 data is incomplete
- User sees "Metadata: Processing..." until complete

**For existing 30K videos:** One-time batch job
1. Extract ID3 from all local files (Phase 1)
2. Identify gaps
3. API-enrich only where needed (Phase 2)
4. Mark complete (Phase 3)

---

## Admin Dashboard Features Needed

1. **Metadata Status Overview**
   - Total videos: 30,000
   - Complete metadata: X,XXX
   - Missing record label: X,XXX
   - Missing BPM: X,XXX
   - etc.

2. **Manual Edit**
   - Ability to manually update any field
   - Set `metadata_source = 'manual'` when edited

3. **Re-fetch Button**
   - "Fetch Missing Metadata" for selected videos
   - "Retry API Lookup" for failed enrichments

4. **Batch Operations**
   - "Extract ID3 from all files"
   - "API enrich all incomplete"
   - Progress indicator for long-running jobs

---

## Frontend API Endpoints Needed

```
GET /api/videos
  ?sort=date_created|date_modified|upload_date|title|artist|bpm
  ?order=asc|desc
  ?genre=hip-hop
  ?bpm_min=120
  ?bpm_max=140
  ?label=Interscope  ← NEW
  ?new_releases=true  (upload_date last 30 days)

GET /api/videos/:id
  Returns full metadata including record_label

GET /api/metadata/status
  Returns counts of complete vs incomplete
```

---

## Questions for Steve

1. What's your preferred language for the batch extraction script? (Python recommended)

2. Do you have API keys for Spotify/Discogs already, or need to set those up?

3. Should we create a `metadata_jobs` table to track extraction/enrichment progress?

4. For the admin dashboard - existing admin panel to extend, or new interface needed?

---

## Priority Order

1. **Add record_label column** (quick DB change)
2. **Extract ID3 from local files** (batch script)
3. **Update frontend to display record_label** (I'll handle this)
4. **API enrichment setup** (can run in background)
5. **Admin dashboard for metadata management**

---

## Files Attached

- This spec: `BACKEND-SPEC-METADATA.md`
- Frontend homepage: `homepage-v4.html` (will update to v5 with record label column)
- Dashboard: `index-v5.5-pro.html` (will update to show record label)

---

**Questions?** Let me know and I'll clarify. Ready to proceed when you are.

