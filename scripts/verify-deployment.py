#!/usr/bin/env python3
"""
verify-deployment.py — The Video Pool deployment verification script
Usage: python3 scripts/verify-deployment.py [--env dev|prod|staging]
       python3 scripts/verify-deployment.py --base https://dev.thevideopool.com

Run this after EVERY deploy. ALL SYSTEMS GO required before sharing links externally.
"""

import urllib.request
import json
import ssl
import socket
import sys
import argparse
import time

# === CONFIGURATION ===
ENVIRONMENTS = {
    'dev': {
        'frontend': 'https://dev.thevideopool.com',
        'api': 'https://tvp-oc-production.up.railway.app',
    },
    'staging': {
        'frontend': 'https://tvp-redesign-2026.vercel.app',
        'api': 'https://tvp-oc-production.up.railway.app',
    },
}

ADMIN_EMAIL = 'admin@thevideopool.com'
ADMIN_PASSWORD = 'Admin123!@#'

# =====================


def post(base, path, body, token=None, timeout=20):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(
        f'{base}{path}',
        data=json.dumps(body).encode(),
        headers=headers,
    )
    try:
        r = urllib.request.urlopen(req, timeout=timeout)
        return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())
    except Exception as e:
        return 0, {'error': str(e)}


def get(base, path, token=None, timeout=20):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(f'{base}{path}', headers=headers)
    try:
        r = urllib.request.urlopen(req, timeout=timeout)
        return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())
    except Exception as e:
        return 0, {'error': str(e)}


def check_ssl(hostname):
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=hostname) as s:
            s.connect((hostname, 443))
            cert = s.getpeercert()
            cn = dict(x[0] for x in cert['subject']).get('commonName', '?')
            exp = cert['notAfter']
            return True, f'CN={cn}, expires={exp}'
    except Exception as e:
        return False, str(e)


def run_verification(frontend_url, api_url):
    results = []
    start_time = time.time()

    def check(name, passed, detail=''):
        icon = '✅' if passed else '❌'
        results.append((icon, name, detail, passed))
        print(f'  {icon}  {name:<32} {detail}')

    print(f'\n{"="*65}')
    print(f'   VIDEO POOL DEPLOYMENT VERIFICATION')
    print(f'   Frontend: {frontend_url}')
    print(f'   API:      {api_url}')
    print(f'{"="*65}')

    # 1. SSL
    hostname = frontend_url.replace('https://', '').split('/')[0]
    ok, detail = check_ssl(hostname)
    check('ssl_certificate', ok, detail)

    # 2. Health
    s, d = get(api_url, '/health')
    check('backend_health', s == 200, f'status={s} db={d.get("database", "?")}')

    # 3. Health via frontend proxy
    s, d = get(frontend_url, '/api/health')
    check('api_proxy_health', s == 200 and d.get('database') == 'connected',
          f'status={s} db={d.get("database", "?")}')

    # 4. Admin login (Railway direct)
    s, d = post(api_url, '/api/auth/login',
                {'email': ADMIN_EMAIL, 'password': ADMIN_PASSWORD})
    tok_r = d.get('accessToken', '')
    check('admin_auth_railway', bool(tok_r) and s == 200,
          f'status={s} role={d.get("user", {}).get("role", "?")}')

    # 5. Admin login (via frontend proxy)
    s, d2 = post(frontend_url, '/api/auth/login',
                 {'email': ADMIN_EMAIL, 'password': ADMIN_PASSWORD})
    tok_b = d2.get('accessToken', '')
    check('admin_auth_proxy', bool(tok_b) and s == 200, f'status={s}')

    # 6. Video catalog
    s, d = get(frontend_url, '/api/videos?limit=3&genre=Hip-Hop', tok_b)
    tracks = d.get('tracks', [])
    check('video_catalog', s == 200 and len(tracks) > 0,
          f'{len(tracks)} results, total={d.get("total", "?")}')

    # 7. Video search
    s, d = get(frontend_url, '/api/videos/search?q=drake&limit=3', tok_b)
    t2 = d.get('tracks', [])
    check('video_search', s == 200 and len(t2) > 0, f'{len(t2)} results for "drake"')

    # 8. Video detail
    s, d = get(api_url, '/api/videos/1', tok_r)
    v = d.get('video', d)
    versions = v.get('versions', [])
    check('video_detail', s == 200 and len(versions) > 0,
          f'"{v.get("title", "?")}" {len(versions)} versions')

    # 9. Download (Wasabi presigned URL)
    download_pass = False
    download_detail = 'no versions to test'
    if versions:
        q, vt = versions[0]['quality'], versions[0]['versionType']
        s, d = post(api_url, '/api/videos/1/download',
                    {'quality': q, 'version': vt}, tok_r)
        url = d.get('downloadUrl', '')
        if s == 200 and url:
            domain = url.split('/')[2] if '/' in url else url[:40]
            download_pass = True
            download_detail = f'{d.get("fileName", "?")} via {domain}'
        elif s == 403 and 'limit' in str(d).lower():
            download_pass = True
            download_detail = 'limit enforced (route works)'
        else:
            download_detail = f'status={s} code={d.get("code", "?")}'
    check('wasabi_download', download_pass, download_detail)

    # 10. Memberships
    s, d = get(frontend_url, '/api/memberships', tok_b)
    tiers = d if isinstance(d, list) else []
    check('membership_tiers', s == 200 and len(tiers) == 4,
          f'{len(tiers)} tiers')

    # 11. Genres
    s, d = get(frontend_url, '/api/genres', tok_b)
    genres = d if isinstance(d, list) else []
    check('genres', s == 200 and len(genres) >= 8,
          f'{len(genres)} genres')

    # 12. Stripe checkout
    s, d = post(api_url, '/api/memberships/create-checkout',
                {'tier': 'starter', 'interval': 'monthly'}, tok_r)
    sess = str(d.get('sessionId', d.get('url', '')))
    check('stripe_checkout', sess.startswith('cs_live_'),
          sess[:30] if sess.startswith('cs_live_') else f'status={s}: {sess[:40]}')

    # 13. Admin dashboard stats
    s, d = get(frontend_url, '/api/admin/stats', tok_b)
    check('admin_dashboard', s == 200,
          f'users={d.get("totalUsers", "?")} videos={d.get("totalVideos", "?")}')

    # 14. CORS headers
    req = urllib.request.Request(
        f'{frontend_url}/api/health',
        headers={'Origin': frontend_url}
    )
    try:
        r = urllib.request.urlopen(req, timeout=10)
        cors = r.headers.get('Access-Control-Allow-Origin', '')
        check('cors_headers', bool(cors), f'Access-Control-Allow-Origin: {cors or "missing"}')
    except Exception as e:
        check('cors_headers', False, str(e))

    # 15. Rate limiting (should NOT be rate limited on a normal request)
    s, _ = get(frontend_url, '/api/videos?limit=1', tok_b)
    check('rate_limit_normal', s == 200, f'status={s} (200 expected for normal request)')

    # Summary
    elapsed = time.time() - start_time
    passed = sum(1 for r in results if r[3])
    total = len(results)
    print(f'\n{"="*65}')
    print(f'  RESULT: {passed}/{total} checks passed in {elapsed:.1f}s')
    if passed == total:
        print(f'  ✅ ALL SYSTEMS GO — safe to share links externally')
    else:
        failed = [r[1] for r in results if not r[3]]
        print(f'  ❌ ISSUES FOUND: {", ".join(failed)}')
        print(f'     Do NOT announce or share links until all checks pass.')
    print(f'{"="*65}\n')

    return passed == total


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Verify TVP deployment health')
    parser.add_argument('--env', choices=['dev', 'staging'], default='dev',
                        help='Environment to test (default: dev)')
    parser.add_argument('--base', help='Override frontend URL')
    args = parser.parse_args()

    env = ENVIRONMENTS.get(args.env, ENVIRONMENTS['dev'])
    frontend = args.base or env['frontend']
    api = env['api']

    success = run_verification(frontend, api)
    sys.exit(0 if success else 1)
