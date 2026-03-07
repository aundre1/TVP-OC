#!/usr/bin/env python3
"""
Import DJ Core Contacts to Supabase
====================================
1. Bulk-inserts dj_core CSV into dj_core_contacts (ON CONFLICT DO NOTHING)
2. De-dupes in SQL after import: deletes any email that's in tvp_subscribers
3. Reports final clean count ready to send

Usage:
  python3 scripts/import_dj_core.py
  python3 scripts/import_dj_core.py --dry-run
"""

import csv
import sys
import time
import argparse
import requests
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
INPUT_CSV = BASE_DIR / "email" / "segments" / "dj_core_high_confidence_ALL.csv"

SUPABASE_PROJECT = "jvgsmiqsqtqgfagghoiv"
SUPABASE_PAT = "sbp_d498c7d1e9f2b697ec39dd56a0e0f5960620d0d2"
API_URL = f"https://api.supabase.com/v1/projects/{SUPABASE_PROJECT}/database/query"
BATCH_SIZE = 300
DELAY_BETWEEN_BATCHES = 1.5   # seconds — avoids rate limiting


def run_sql(query, retries=3):
    """Execute SQL via Supabase Management API with retry."""
    for attempt in range(retries):
        try:
            resp = requests.post(
                API_URL,
                headers={"Authorization": f"Bearer {SUPABASE_PAT}", "Content-Type": "application/json"},
                json={"query": query},
                timeout=30
            )
            if resp.ok:
                return resp.json()
            # Retry on 5xx/544
            if resp.status_code >= 500 and attempt < retries - 1:
                time.sleep(3 * (attempt + 1))
                continue
            raise Exception(f"SQL error {resp.status_code}: {resp.text[:300]}")
        except requests.RequestException as e:
            if attempt < retries - 1:
                time.sleep(3)
                continue
            raise
    raise Exception("Max retries exceeded")


def esc(v):
    if v is None:
        return "NULL"
    return "'" + str(v).replace("\\", "\\\\").replace("'", "''") + "'"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    print("=" * 60)
    print("The Video Pool — DJ Core Import")
    print("=" * 60)

    # Load CSV
    print(f"\nLoading {INPUT_CSV.name}...")
    with open(INPUT_CSV, newline="", encoding="utf-8", errors="replace") as f:
        rows = list(csv.DictReader(f))
    print(f"  {len(rows):,} rows loaded")

    # Deduplicate within the CSV itself (same email twice in list)
    seen = set()
    unique_rows = []
    for row in rows:
        email = row.get("email", "").strip().lower()
        if email and "@" in email and email not in seen:
            seen.add(email)
            unique_rows.append(row)
    print(f"  {len(unique_rows):,} unique emails (removed {len(rows) - len(unique_rows):,} intra-list dupes)")

    if args.dry_run:
        print("\n  [DRY RUN] Connecting to check existing counts...")
        result = run_sql("SELECT COUNT(*) as subscribers FROM tvp_subscribers")
        subs = result[0]["subscribers"]
        result2 = run_sql("SELECT COUNT(*) as imported FROM dj_core_contacts")
        imported = result2[0]["imported"]
        print(f"  tvp_subscribers: {subs:,}")
        print(f"  dj_core_contacts (current): {imported:,}")
        print(f"  Would insert up to: {len(unique_rows):,} (minus dupes vs subscribers)")
        print("\n  [DRY RUN] Done. Run without --dry-run to import.")
        return

    # Batch INSERT
    print(f"\nInserting in batches of {BATCH_SIZE} with {DELAY_BETWEEN_BATCHES}s delay...")
    inserted_batches = 0
    errors = 0
    start = time.time()

    for i in range(0, len(unique_rows), BATCH_SIZE):
        batch = unique_rows[i:i + BATCH_SIZE]

        values = ",\n".join(
            f"({esc(r.get('email','').strip().lower())}, {esc(r.get('first_name','').strip() or None)}, "
            f"{esc(r.get('last_name','').strip() or None)}, {esc(r.get('display_name','').strip() or None)}, "
            f"{esc(r.get('dj_software','').strip() or None)}, {esc(r.get('country','').strip() or None)}, "
            f"{esc(r.get('source','').strip() or None)}, {esc(r.get('confidence_tier','HIGH').strip() or 'HIGH')})"
            for r in batch
        )

        sql = (
            "INSERT INTO dj_core_contacts "
            "(email, first_name, last_name, display_name, dj_software, country, source, confidence_tier) "
            f"VALUES {values} ON CONFLICT (email) DO NOTHING"
        )

        try:
            run_sql(sql)
            inserted_batches += len(batch)
            elapsed = time.time() - start
            rate = inserted_batches / elapsed if elapsed > 0 else 1
            pct = (i + len(batch)) / len(unique_rows) * 100
            print(f"  Batch {i // BATCH_SIZE + 1:>3}: {inserted_batches:>6,}/{len(unique_rows):,} ({pct:.0f}%) — {rate:.0f}/s")
        except Exception as e:
            errors += len(batch)
            print(f"  ERROR batch {i // BATCH_SIZE + 1}: {e}")

        if i + BATCH_SIZE < len(unique_rows):
            time.sleep(DELAY_BETWEEN_BATCHES)

    elapsed = time.time() - start
    print(f"\nInsert phase done in {elapsed:.1f}s — {errors:,} row errors")

    # De-dupe in SQL: remove any email already in tvp_subscribers
    print("\nRemoving subscriber dupes from dj_core_contacts...")
    dedup = run_sql("""
        DELETE FROM dj_core_contacts
        WHERE email IN (SELECT LOWER(email) FROM tvp_subscribers)
    """)
    print("  De-dupe complete.")
    time.sleep(1)

    # Final stats
    final = run_sql("""
        SELECT
          COUNT(*) FILTER (WHERE email_sent = false AND unsubscribed = false AND bounced = false) AS ready_to_send,
          COUNT(*) AS total
        FROM dj_core_contacts
    """)
    stats = final[0]

    print(f"\n{'=' * 60}")
    print(f"Import complete in {elapsed:.1f}s")
    print(f"  Total in dj_core_contacts: {stats['total']:,}")
    print(f"  Ready to send:             {stats['ready_to_send']:,}")
    print(f"  Batch errors:              {errors:,}")
    print(f"\n✅ Run the campaign trigger to start sending.")


if __name__ == "__main__":
    main()
