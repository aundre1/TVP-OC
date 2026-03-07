#!/usr/bin/env python3
"""
Email Validator for The Video Pool
===================================
Three-tier free validation:
  1. Syntax check (regex)
  2. MX record lookup (DNS — catches dead domains)
  3. SMTP RCPT TO probe (optional — checks individual mailboxes on small/corporate domains)

Usage:
  # Default: syntax + MX only (fast, ~5-10 min for 76K)
  python3 scripts/validate_emails.py

  # With SMTP probe for non-major-provider domains (slower, ~30-60 min)
  python3 scripts/validate_emails.py --smtp

  # Process a single file
  python3 scripts/validate_emails.py --file email/high_confidence_SMTP_CONFIRMED.csv

  # Dry run (just print stats, don't write output)
  python3 scripts/validate_emails.py --dry-run

Output files (in email/validated/):
  clean_<filename>.csv       — Addresses that passed all checks
  rejected_<filename>.csv    — Addresses that failed with reason
  report_<filename>.json     — Summary statistics
"""

import csv
import re
import sys
import time
import json
import socket
import smtplib
import argparse
import threading
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from collections import defaultdict

try:
    import dns.resolver
    import dns.exception
except ImportError:
    print("ERROR: dnspython not installed. Run: pip3 install dnspython --break-system-packages")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).parent.parent
EMAIL_DIR = BASE_DIR / "email"
OUTPUT_DIR = EMAIL_DIR / "validated"

INPUT_FILES = [
    EMAIL_DIR / "high_confidence_ALL.csv",
    EMAIL_DIR / "high_confidence_SMTP_CONFIRMED.csv",
]

# Major email providers — their SMTP servers always return 250 OK for RCPT TO.
# Trust syntax + domain validity only for these.
MAJOR_PROVIDERS = {
    "gmail.com", "googlemail.com",
    "yahoo.com", "yahoo.co.uk", "yahoo.ca", "yahoo.com.au", "yahoo.fr",
    "yahoo.de", "yahoo.es", "yahoo.it", "yahoo.co.jp", "yahoo.com.br",
    "hotmail.com", "hotmail.co.uk", "hotmail.fr", "hotmail.de", "hotmail.es",
    "outlook.com", "outlook.co.uk", "outlook.fr", "outlook.de",
    "live.com", "live.co.uk", "live.fr",
    "msn.com",
    "icloud.com", "me.com", "mac.com",
    "aol.com", "aim.com",
    "protonmail.com", "proton.me",
    "gmx.com", "gmx.net", "gmx.de",
    "qq.com", "163.com", "126.com",
    "mail.ru", "yandex.ru", "yandex.com",
    "zoho.com",
}

# Known bad / spam / defunct / wrong-audience domains — rejected immediately
KNOWN_BAD_DOMAINS = {
    # Obvious spam/adult
    "craszyonsex.com",
    # Google Calendar IDs (these are calendar IDs, not real email addresses)
    "group.calendar.google.com",
    "calendar.google.com",
    # Defunct Apple internal system
    "applelink.apple.com",
    # Disposable/throwaway email services
    "mailinator.com", "guerrillamail.com", "trashmail.com", "tempmail.com",
    "throwam.com", "yopmail.com", "sharklasers.com", "guerrillamailblock.com",
    "grr.la", "guerrillamail.info", "spam4.me", "getairmail.com",
    "dispostable.com", "mailnull.com", "trashmail.me", "fakeinbox.com",
    "maildrop.cc", "spamgourmet.com", "spamgourmet.org",
    "discard.email", "mailnesia.com", "trashmail.at", "trashmail.io",
    "33mail.com", "spamherelots.com", "binkmail.com", "safetymail.info",
    "spamoff.de", "trashmail.net",
    # Corporate non-DJ (sends to these hurts deliverability + spam complaints)
    "chipotle.com", "latimes.com", "jezebel.com", "deadspin.com",
    # Defunct free ISPs
    "freewwweb.com",
}

# DNS cache to avoid re-querying same domain
_dns_cache = {}    # domain -> "valid" | "no_mx" | "error"
_dns_lock = threading.Lock()


# ---------------------------------------------------------------------------
# Regex
# ---------------------------------------------------------------------------

EMAIL_RE = re.compile(
    r'^[a-zA-Z0-9]'           # must start with alphanumeric
    r'[a-zA-Z0-9._%+\-]*'     # local part body
    r'@'
    r'[a-zA-Z0-9]'            # domain starts alphanumeric
    r'[a-zA-Z0-9\-]*'         # domain body
    r'(\.[a-zA-Z0-9\-]+)*'    # subdomains
    r'\.[a-zA-Z]{2,}$'        # TLD
)

# ---------------------------------------------------------------------------
# Validation functions
# ---------------------------------------------------------------------------

def check_syntax(email):
    """Returns (valid: bool, reason: str)."""
    email = email.strip().lower()
    if not email:
        return False, "empty"
    if len(email) > 254:
        return False, "too_long"
    if email.count("@") != 1:
        return False, "invalid_at_sign"
    local, domain = email.split("@", 1)
    if len(local) == 0 or len(local) > 64:
        return False, "invalid_local_part"
    if ".." in email:
        return False, "consecutive_dots"
    if not EMAIL_RE.match(email):
        return False, "invalid_format"
    return True, "ok"


def check_domain_mx(domain):
    """Returns (has_mx: bool, reason: str). Cached per domain."""
    with _dns_lock:
        if domain in _dns_cache:
            cached = _dns_cache[domain]
            return cached == "valid", cached

    result = _do_mx_lookup(domain)
    with _dns_lock:
        _dns_cache[domain] = result
    return result == "valid", result


def _do_mx_lookup(domain):
    """Returns 'valid', 'no_mx', or 'error'."""
    try:
        answers = dns.resolver.resolve(domain, "MX", lifetime=5.0)
        if answers:
            return "valid"
        return "no_mx"
    except dns.resolver.NXDOMAIN:
        return "no_mx"        # domain doesn't exist at all
    except dns.resolver.NoAnswer:
        # No MX record — check if domain has an A record (some servers accept mail directly)
        try:
            dns.resolver.resolve(domain, "A", lifetime=3.0)
            return "valid"    # has A record, may accept mail
        except Exception:
            return "no_mx"
    except dns.resolver.Timeout:
        return "error"        # timeout — don't reject, mark uncertain
    except Exception:
        return "error"


def get_mx_host(domain):
    """Returns the highest-priority MX hostname for SMTP probing, or None."""
    try:
        answers = dns.resolver.resolve(domain, "MX", lifetime=5.0)
        sorted_mx = sorted(answers, key=lambda r: r.preference)
        return str(sorted_mx[0].exchange).rstrip(".")
    except Exception:
        return None


def check_smtp(email, from_domain="thevideopool.com", timeout=10):
    """
    SMTP RCPT TO probe. Returns (likely_valid: bool, reason: str).
    Best-effort — many servers block port 25 or refuse connections.
    We only reject on explicit 5xx permanent failure codes.
    """
    _, domain = email.split("@", 1)
    mx_host = get_mx_host(domain)
    if not mx_host:
        return False, "smtp_no_mx"

    try:
        with smtplib.SMTP(timeout=timeout) as smtp:
            smtp.connect(mx_host, 25)
            smtp.ehlo(from_domain)
            smtp.mail(f"verify@{from_domain}")
            code, _ = smtp.rcpt(email)
            smtp.quit()
            if code == 250:
                return True, "smtp_ok"
            elif code >= 500:
                return False, f"smtp_rejected_{code}"
            else:
                # 4xx = temporary/greylisting — don't reject
                return True, f"smtp_uncertain_{code}"
    except smtplib.SMTPConnectError:
        return True, "smtp_connect_refused"   # blocked, not our fault
    except smtplib.SMTPServerDisconnected:
        return True, "smtp_disconnected"      # anti-spam greylisting
    except socket.timeout:
        return True, "smtp_timeout"           # timeout = unclear
    except ConnectionRefusedError:
        return True, "smtp_port_blocked"      # ISP blocking outbound port 25
    except Exception:
        return True, "smtp_error"             # unknown — don't reject


# ---------------------------------------------------------------------------
# Per-row validation
# ---------------------------------------------------------------------------

def validate_email(row, do_smtp=False):
    """
    Full validation pipeline for one email row.
    Returns (valid: bool, reason: str, enriched_row: dict).
    """
    email = row.get("email", "").strip().lower()

    # 1. Syntax
    ok, reason = check_syntax(email)
    if not ok:
        return False, f"syntax:{reason}", row

    _, domain = email.split("@", 1)

    # 2. Known bad domains
    if domain in KNOWN_BAD_DOMAINS:
        return False, f"bad_domain:{domain}", row

    # 3. MX record
    has_mx, mx_reason = check_domain_mx(domain)
    if mx_reason == "no_mx":
        return False, "no_mx_record", row
    if mx_reason == "error":
        # DNS error — keep as uncertain, don't reject
        return True, "dns_uncertain", row

    # 4. SMTP probe (only for non-major providers when --smtp flag set)
    if do_smtp and domain not in MAJOR_PROVIDERS:
        smtp_ok, smtp_reason = check_smtp(email)
        if not smtp_ok:
            return False, smtp_reason, row

    return True, "valid", row


# ---------------------------------------------------------------------------
# File processing
# ---------------------------------------------------------------------------

def process_file(input_path, do_smtp, dry_run, workers=50):
    print(f"\n{'='*60}")
    print(f"Processing: {input_path.name}")
    print(f"{'='*60}")

    if not input_path.exists():
        print(f"  SKIP — file not found: {input_path}")
        return

    with open(input_path, newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        rows = list(reader)

    print(f"  Loaded {len(rows):,} rows")

    out_fieldnames = list(fieldnames) + ["validation_status", "validation_reason"]

    clean_rows = []
    rejected_rows = []
    stats = defaultdict(int)
    stats["total"] = len(rows)
    start_time = time.time()

    # Phase 1: Batch DNS warm-up — cache all unique domains first
    unique_domains = set()
    for row in rows:
        email = row.get("email", "").strip().lower()
        if "@" in email:
            unique_domains.add(email.split("@", 1)[1])

    print(f"  Found {len(unique_domains):,} unique domains — resolving MX records...")

    with ThreadPoolExecutor(max_workers=100) as executor:
        futures = {executor.submit(check_domain_mx, domain): domain for domain in unique_domains}
        done = 0
        for future in as_completed(futures):
            done += 1
            if done % 500 == 0:
                elapsed = time.time() - start_time
                print(f"    DNS: {done:,}/{len(unique_domains):,} domains ({elapsed:.1f}s elapsed)")

    valid_domain_count = sum(1 for v in _dns_cache.values() if v == "valid")
    dead_domain_count = sum(1 for v in _dns_cache.values() if v == "no_mx")
    print(f"  DNS complete — {valid_domain_count:,} valid, {dead_domain_count:,} dead/no-MX domains")

    # Phase 2: Validate all emails (DNS hits cache, very fast)
    print(f"  Validating {len(rows):,} email addresses...")
    validate_start = time.time()

    with ThreadPoolExecutor(max_workers=workers) as executor:
        future_to_row = {
            executor.submit(validate_email, row, do_smtp): row
            for row in rows
        }
        done = 0
        for future in as_completed(future_to_row):
            done += 1
            try:
                valid, reason, enriched_row = future.result()
            except Exception as e:
                valid, reason, enriched_row = False, f"exception", future_to_row[future]

            enriched_row = dict(enriched_row)
            enriched_row["validation_status"] = "clean" if valid else "rejected"
            enriched_row["validation_reason"] = reason

            if valid:
                clean_rows.append(enriched_row)
                stats["clean"] += 1
            else:
                rejected_rows.append(enriched_row)
                stats["rejected"] += 1

            top_reason = reason.split(":")[0]
            stats[f"reason:{top_reason}"] += 1

            if done % 5000 == 0:
                elapsed = time.time() - validate_start
                rate = done / elapsed if elapsed > 0 else 1
                pct = (done / len(rows)) * 100
                eta = (len(rows) - done) / rate
                print(f"    Validated: {done:,}/{len(rows):,} ({pct:.1f}%) — {rate:.0f}/s — ETA {eta:.0f}s")

    elapsed = time.time() - start_time
    print(f"\n  Done in {elapsed:.1f}s")
    print(f"  Clean:    {stats['clean']:,} ({stats['clean']/stats['total']*100:.1f}%)")
    print(f"  Rejected: {stats['rejected']:,} ({stats['rejected']/stats['total']*100:.1f}%)")

    print("\n  Rejection reasons:")
    reason_items = [(k, v) for k, v in stats.items() if k.startswith("reason:")]
    reason_items.sort(key=lambda x: -x[1])
    for reason_key, count in reason_items[:15]:
        label = reason_key.replace("reason:", "")
        print(f"    {label:<38} {count:>7,}")

    if dry_run:
        print("\n  [DRY RUN] — Not writing output files")
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    stem = input_path.stem

    clean_path = OUTPUT_DIR / f"clean_{stem}.csv"
    rejected_path = OUTPUT_DIR / f"rejected_{stem}.csv"
    report_path = OUTPUT_DIR / f"report_{stem}.json"

    with open(clean_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=out_fieldnames)
        writer.writeheader()
        writer.writerows(clean_rows)
    print(f"\n  Clean list:    {clean_path} ({len(clean_rows):,} rows)")

    with open(rejected_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=out_fieldnames)
        writer.writeheader()
        writer.writerows(rejected_rows)
    print(f"  Rejected list: {rejected_path} ({len(rejected_rows):,} rows)")

    report = {
        "file": input_path.name,
        "processed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "total": stats["total"],
        "clean": stats["clean"],
        "rejected": stats["rejected"],
        "clean_pct": round(stats["clean"] / stats["total"] * 100, 2),
        "rejected_pct": round(stats["rejected"] / stats["total"] * 100, 2),
        "smtp_probed": do_smtp,
        "elapsed_seconds": round(elapsed, 1),
        "rejection_breakdown": {
            k.replace("reason:", ""): v
            for k, v in sorted(reason_items, key=lambda x: -x[1])
        },
    }
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"  Report:        {report_path}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Email validator for The Video Pool")
    parser.add_argument("--smtp", action="store_true",
                        help="Enable SMTP RCPT TO probe for non-major-provider domains")
    parser.add_argument("--file", type=str, default=None,
                        help="Process a single CSV file (relative to project root)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print stats only — do not write output files")
    parser.add_argument("--workers", type=int, default=50,
                        help="Concurrent validation threads (default: 50)")
    args = parser.parse_args()

    if args.file:
        files = [BASE_DIR / args.file]
    else:
        files = INPUT_FILES

    print("=" * 60)
    print("The Video Pool — Email Validator")
    print("=" * 60)
    print(f"Mode:    {'Syntax + MX + SMTP probe' if args.smtp else 'Syntax + MX (fast mode)'}")
    print(f"Files:   {[f.name for f in files]}")
    print(f"Workers: {args.workers}")
    print(f"Dry run: {args.dry_run}")
    print()

    for file_path in files:
        process_file(file_path, do_smtp=args.smtp, dry_run=args.dry_run, workers=args.workers)

    print("\nAll done.")


if __name__ == "__main__":
    main()
