#!/usr/bin/env python3
"""Download La-Z-Boy swatch images for every cover+colour in the app, then write public/swatch-manifest.json.

Run from anywhere:  python scripts/swatches/fetch_swatches.py
Standard library only (Python 3.8+). Safe to stop and re-run: files already on disk are skipped.

Each target is the app's own cover code + colour code (e.g. D1855 + 53 -> D185553). The image is only
kept when the site returns a real JPEG for exactly that id. A 404 means "no image on the site" and is
written to the report, never guessed. If data/swatch-site-metadata.json exists (from crawl_metadata.py),
the site's pattern and colour names are compared with the app's; a mismatch is flagged and the image is
not offered to the app.
"""
import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

from common import (MANIFEST, REPORT, SIZES, SWATCH_DIR, URL_ONLY_SIZES, image_url, load_site_metadata,
                    load_targets, norm)

USER_AGENT = 'LAZBoyFloorAssistant-SwatchFetcher/1.0 (internal sales tool, low rate)'


def is_jpeg(body):
    return len(body) > 500 and body[:3] == b'\xff\xd8\xff'


def download(url, retries=3, timeout=30):
    """Return (status, body). status is 200, 404, or 'error:<reason>' after retries."""
    last = 'unknown'
    for attempt in range(retries):
        try:
            request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return 200, response.read()
        except urllib.error.HTTPError as error:
            if error.code == 404:
                return 404, b''
            last = f'http {error.code}'
        except Exception as error:  # network hiccup, timeout, reset
            last = type(error).__name__
        time.sleep(1.5 * (attempt + 1))
    return f'error:{last}', b''


def fetch_one(cover_id, sizes, delay, force):
    outcome = {}
    for key in sizes:
        path = SWATCH_DIR / key / f'{cover_id}.jpg'
        if path.exists() and not force:
            outcome[key] = 'have'
            continue
        status, body = download(image_url(key, cover_id))
        time.sleep(delay)
        if status == 200 and is_jpeg(body):
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(body)
            outcome[key] = 'saved'
        elif status == 200:
            outcome[key] = 'error:not a jpeg'
        else:
            outcome[key] = 'missing' if status == 404 else status
        if outcome[key] == 'missing':
            break  # no thumbnail means no cover on the site; skip the other sizes
    return cover_id, outcome


def build_manifest(targets, site):
    entries, name_mismatch = [], []
    for cover_id, target in sorted(targets.items()):
        have = {key: (SWATCH_DIR / key / f'{cover_id}.jpg').exists() for key in SIZES}
        if not have['thumb'] and not have['zoom']:
            continue
        seen = site.get(cover_id)
        check = 'unchecked'
        if seen:
            same_pattern = norm(seen.get('pattern')) == norm(target['pattern_name'])
            same_color = not target['color_name'] or norm(seen.get('name')) == norm(target['color_name'])
            check = 'match' if same_pattern and same_color else 'mismatch'
            if check == 'mismatch':
                name_mismatch.append({'cover_id': cover_id, 'app': [target['pattern_name'], target['color_name']],
                                      'site': [seen.get('pattern'), seen.get('name')]})
        entries.append({
            'cover_code': target['cover_code'], 'color_code': target['color_code'],
            'pattern_name': target['pattern_name'], 'color_name': target['color_name'],
            'color_family': (seen or {}).get('color_family') or None,
            'material': target['material'], 'name_check': check,
            'image_url': image_url('zoom', cover_id), 'image_url_medium': image_url('medium', cover_id),
            'image_url_large': image_url('large', cover_id),
            'local_thumb': f'/swatches/thumb/{cover_id}.jpg' if have['thumb'] else None,
            'local_zoom': f'/swatches/zoom/{cover_id}.jpg' if have['zoom'] else None})
    return entries, name_mismatch


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--workers', type=int, default=4)
    parser.add_argument('--delay', type=float, default=0.15, help='seconds to pause after each request, per worker')
    parser.add_argument('--sizes', default='thumb,zoom', help='comma list of: ' + ', '.join(SIZES))
    parser.add_argument('--no-prior', action='store_true', help='skip prior-season covers')
    parser.add_argument('--force', action='store_true', help='re-download files already on disk')
    parser.add_argument('--manifest-only', action='store_true', help='no network: rebuild manifest from files on disk')
    parser.add_argument('--limit', type=int, default=0, help='only the first N ids (for a quick trial)')
    args = parser.parse_args()
    sizes = [s for s in args.sizes.split(',') if s in SIZES]
    targets = load_targets(include_prior=not args.no_prior)
    ids = sorted(targets)[:args.limit] if args.limit else sorted(targets)
    results = {}
    if not args.manifest_only:
        print(f'{len(ids)} cover+colour ids to check, sizes: {", ".join(sizes)}')
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            for count, (cover_id, outcome) in enumerate(pool.map(lambda i: fetch_one(i, sizes, args.delay, args.force), ids), 1):
                results[cover_id] = outcome
                if count % 25 == 0 or count == len(ids):
                    print(f'  {count}/{len(ids)}', flush=True)
    entries, name_mismatch = build_manifest(targets, load_site_metadata())
    missing = sorted(i for i, o in results.items() if o.get('thumb') == 'missing' or o.get('zoom') == 'missing')
    errors = {i: o for i, o in results.items() if any(str(v).startswith('error') for v in o.values())}
    manifest = {
        '_note': 'Swatch images keyed by the app\'s own cover code + colour code. image_url* point at the La-Z-Boy website '
                 'image host. Entries with name_check "mismatch" are not shown in the app. An image proves nothing about '
                 'model eligibility or Canadian availability.',
        'generated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'sizes_px': {key: SIZES[key][1] for key in SIZES} | {key: URL_ONLY_SIZES[key][1] for key in URL_ONLY_SIZES},
        'swatches': entries}
    MANIFEST.write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    unmatched_all = sorted(set(targets) - {f"{e['cover_code']}{e['color_code']}" for e in entries})
    REPORT.write_text(json.dumps({
        'generated': manifest['generated'], 'targets': len(targets), 'with_image': len(entries),
        'no_image_on_site_or_not_yet_fetched': unmatched_all, 'missing_this_run': missing,
        'errors_this_run': errors, 'name_mismatch': name_mismatch}, indent=1) + '\n', encoding='utf-8')
    print(f'Done. {len(entries)} of {len(targets)} ids have images. Manifest: {MANIFEST}')
    print(f'No image: {len(unmatched_all)} (see {REPORT}). Errors this run: {len(errors)}. Name mismatches: {len(name_mismatch)}.')
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
