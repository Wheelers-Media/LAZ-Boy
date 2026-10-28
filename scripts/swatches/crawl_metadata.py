#!/usr/bin/env python3
"""Harvest cover metadata (id, colour name, pattern, colour family, material) from la-z-boy.com product pages.

Playwright renders each product page, clicks every "Show More" in the cover picker until none is left,
and BeautifulSoup reads the data-cover-* attributes. Output: data/swatch-site-metadata.json.

Setup (once):  pip install playwright beautifulsoup4 && playwright install chromium
Run:           python scripts/swatches/crawl_metadata.py --stop-when-covered

Polite by design: only clean /p/ product URLs (robots.txt allows these; query-string URLs are skipped),
one page at a time, a pause between pages, resumable. Prices and stock flags are never stored.
"""
import argparse
import json
import re
import sys
import time
import urllib.request
from datetime import datetime, timezone

from common import ROOT, SITE_METADATA, load_targets
from parse_cover_swatches import parse_swatches

SITEMAP = 'https://www.la-z-boy.com/sitemap_detail0.xml'
STATE = ROOT / 'data' / '.swatch-crawl-state.json'
USER_AGENT = 'LAZBoyFloorAssistant-SwatchCrawler/1.0 (internal sales tool, low rate)'


def product_urls():
    request = urllib.request.Request(SITEMAP, headers={'User-Agent': USER_AGENT})
    xml = urllib.request.urlopen(request, timeout=60).read().decode('utf-8', 'replace')
    urls = re.findall(r'<loc>([^<]+)</loc>', xml)
    return [u for u in urls if '/p/' in u and '?' not in u]


def expand_picker(page, max_clicks=12):
    """Click 'Show More' until it is gone. Tolerates the button re-rendering between clicks."""
    for _ in range(max_clicks):
        button = page.locator('button:has-text("Show More"), a:has-text("Show More")').first
        try:
            if button.count() == 0 or not button.is_visible():
                return
            button.click(timeout=3000)
            page.wait_for_timeout(400)
        except Exception:
            return


def load_json(path, default):
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except Exception:
        return default


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--limit', type=int, default=0, help='visit at most N pages this run')
    parser.add_argument('--delay', type=float, default=1.5, help='seconds between pages')
    parser.add_argument('--stop-when-covered', action='store_true', help='stop once every app cover id has been seen')
    parser.add_argument('--headed', action='store_true', help='show the browser window')
    args = parser.parse_args()
    from playwright.sync_api import TimeoutError as PlaywrightTimeout, sync_playwright

    targets = set(load_targets())
    covers = {c['cover_id']: c for c in load_json(SITE_METADATA, {}).get('covers', [])}
    state = load_json(STATE, {'done': [], 'failed': {}})
    todo = [u for u in product_urls() if u not in set(state['done'])]
    print(f'{len(todo)} product pages to visit; {len(covers)} covers already known')
    visited = 0
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=not args.headed)
        page = browser.new_context(user_agent=USER_AGENT).new_page()
        for url in todo:
            if args.limit and visited >= args.limit:
                break
            if args.stop_when_covered and targets <= set(covers):
                print('Every app cover id has been seen; stopping.')
                break
            visited += 1
            try:
                page.goto(url, wait_until='domcontentloaded', timeout=45000)
                try:
                    page.wait_for_selector('[data-cover-id]', timeout=8000)  # dynamic DOM: picker renders after load
                except PlaywrightTimeout:
                    state['done'].append(url)  # product without a cover picker (tables, accessories)
                    continue
                expand_picker(page)
                for item in parse_swatches(page.content()):
                    covers.setdefault(item['cover_id'], item)
                state['done'].append(url)
            except Exception as error:
                state['failed'][url] = f'{type(error).__name__}: {str(error)[:120]}'
            if visited % 20 == 0:
                SITE_METADATA.parent.mkdir(parents=True, exist_ok=True)
                SITE_METADATA.write_text(json.dumps({'covers': sorted(covers.values(), key=lambda c: c['cover_id'])}, indent=1), encoding='utf-8')
                STATE.write_text(json.dumps(state), encoding='utf-8')
                print(f'  {visited} pages, {len(covers)} covers, {len(targets & set(covers))}/{len(targets)} app ids seen', flush=True)
            time.sleep(args.delay)
        browser.close()
    SITE_METADATA.parent.mkdir(parents=True, exist_ok=True)
    SITE_METADATA.write_text(json.dumps({
        'generated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'covers': sorted(covers.values(), key=lambda c: c['cover_id'])}, indent=1), encoding='utf-8')
    STATE.write_text(json.dumps(state), encoding='utf-8')
    print(f'Done. {len(covers)} site covers; {len(targets & set(covers))}/{len(targets)} app ids confirmed by name. Failed pages: {len(state["failed"])}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
