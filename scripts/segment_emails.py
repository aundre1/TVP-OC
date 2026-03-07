#!/usr/bin/env python3
"""
Email Segmenter for The Video Pool
====================================
Takes validated clean CSVs and splits into audience segments:

  1. dj_core      — Gmail/Yahoo/Outlook + known DJ software users
  2. uncertain    — Turkish ISP block (ttnet.net.tr, isnet.net.tr) and similar
  3. corporate    — .edu, news media, large corporate domains
  4. international— Other valid international addresses

Usage:
  python3 scripts/segment_emails.py
  python3 scripts/segment_emails.py --file email/validated/clean_high_confidence_ALL.csv
"""

import csv
import json
import argparse
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent
VALIDATED_DIR = BASE_DIR / "email" / "validated"
SEGMENTS_DIR = BASE_DIR / "email" / "segments"

INPUT_FILES = [
    VALIDATED_DIR / "clean_high_confidence_ALL.csv",
    VALIDATED_DIR / "clean_high_confidence_SMTP_CONFIRMED.csv",
]

# Turkish ISPs — 29K addresses. Real email format but not a DJ audience.
# Send separately only after audience confirmation.
UNCERTAIN_AUDIENCE_DOMAINS = {
    "ttnet.net.tr",
    "isnet.net.tr",
    "idt.net",
    "iamerica.net",
    "skyinet.net",
    "vcn.bc.ca",
    "freewwweb.com",
    "netone.com",
    "hongkong.com",
}

# News/media/corporate domains — not a DJ audience, spam complaints risk
CORPORATE_DOMAINS = {
    "latimes.com", "deadspin.com", "jezebel.com", "bostonherald.com",
    "u.washington.edu", "binghamton.edu",
    "isbank.net.tr", "dmv.com", "qq.com",
}

# Known major DJ software — strong signal this is a real DJ
DJ_SOFTWARE_KEYWORDS = {
    "serato", "rekordbox", "traktor", "virtual dj", "virtualdj",
    "djay", "pcdj", "mixxx", "algoriddim", "itch", "scratch live",
    "pioneer", "denon", "numark", "rane",
}

def classify_row(row):
    """Returns segment name: 'dj_core', 'uncertain', 'corporate', 'international'"""
    email = row.get("email", "").strip().lower()
    if "@" not in email:
        return "invalid"

    domain = email.split("@", 1)[1]

    # Hard excludes
    if domain in CORPORATE_DOMAINS:
        return "corporate"

    if domain in UNCERTAIN_AUDIENCE_DOMAINS:
        return "uncertain"

    # TLD-based uncertain
    if domain.endswith(".tr"):
        return "uncertain"

    # .edu = corporate/academic
    if domain.endswith(".edu"):
        return "corporate"

    # Check DJ software signal
    dj_software = row.get("dj_software", "").strip().lower()
    if dj_software and any(kw in dj_software for kw in DJ_SOFTWARE_KEYWORDS):
        return "dj_core"

    # TVP registered users (membership tier set = they signed up)
    membership = row.get("membership_tier", "").strip().lower()
    if membership and membership not in ("", "none"):
        return "dj_core"

    # Major providers with no other signal — still dj_core (came from DJ sources)
    major_tlds = {".com", ".net", ".org", ".io", ".co"}
    if any(domain.endswith(tld) for tld in major_tlds):
        return "dj_core"

    return "international"


def process_file(input_path, dry_run=False):
    print(f"\n{'='*60}")
    print(f"Segmenting: {input_path.name}")
    print(f"{'='*60}")

    if not input_path.exists():
        print(f"  SKIP — file not found: {input_path}")
        return

    with open(input_path, newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        rows = list(reader)

    print(f"  Loaded {len(rows):,} rows")

    segments = defaultdict(list)
    for row in rows:
        seg = classify_row(row)
        segments[seg].append(row)

    print(f"\n  Segments:")
    for seg, seg_rows in sorted(segments.items(), key=lambda x: -len(x[1])):
        pct = len(seg_rows) / len(rows) * 100
        print(f"    {seg:<15} {len(seg_rows):>7,}  ({pct:.1f}%)")

    if dry_run:
        print("\n  [DRY RUN] — Not writing output files")
        return segments

    SEGMENTS_DIR.mkdir(parents=True, exist_ok=True)
    stem = input_path.stem.replace("clean_", "")
    out_fieldnames = list(fieldnames) + ["segment"]

    for seg, seg_rows in segments.items():
        out_path = SEGMENTS_DIR / f"{seg}_{stem}.csv"
        enriched = [{**r, "segment": seg} for r in seg_rows]
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=out_fieldnames)
            writer.writeheader()
            writer.writerows(enriched)
        print(f"\n  Written: {out_path.name} ({len(seg_rows):,} rows)")

    # Summary JSON
    summary = {
        "source": input_path.name,
        "total": len(rows),
        "segments": {seg: len(seg_rows) for seg, seg_rows in segments.items()},
        "send_recommendation": {
            "dj_core": "Send immediately — highest deliverability + relevance",
            "international": "Send after dj_core results confirmed",
            "uncertain": "Hold — Turkish ISP block, validate audience before sending",
            "corporate": "Do not send — news/academic/corporate, high complaint risk",
        }
    }
    report_path = SEGMENTS_DIR / f"segments_report_{stem}.json"
    with open(report_path, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"  Written: {report_path.name}")

    return segments


def main():
    parser = argparse.ArgumentParser(description="Segment validated email lists")
    parser.add_argument("--file", type=str, default=None)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    files = [Path(args.file)] if args.file else INPUT_FILES

    for f in files:
        process_file(f, dry_run=args.dry_run)

    print("\nDone. Send dj_core first. Hold uncertain until audience confirmed.")


if __name__ == "__main__":
    main()
