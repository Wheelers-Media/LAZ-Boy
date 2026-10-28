#!/usr/bin/env python3
"""Read every swatch on https://www.la-z-boy.com/content/free-swatches and compare it with the app.

Playwright opens the page and clicks "Show More" until nothing new loads (scrolling to wake lazy images).
Every image whose URL has /Images/Fabrics/<Size>/<ID>.jpg is recorded with its alt/title text, the text
of the tile around it, and any data-* attributes on that tile. Nothing about the page structure is assumed.
Writes data/free-swatches-page.json and reports/free-swatches-compare.json.

Setup: pip install playwright && playwright install chromium     Run: python scripts/swatches/crawl_free_swatches.py
"""
import json
import re
import sys
from datetime import datetime, timezone

from common import ROOT, norm, load_targets

URL = 'https://www.la-z-boy.com/content/free-swatches'
OUT = ROOT / 'data' / 'free-swatches-page.json'
COMPARE = ROOT / 'reports' / 'free-swatches-compare.json'
ID_IN_URL = re.compile(r'/Images/Fabrics/[^/]+/([A-Z]{1,3}\d{6})\.(?:jpe?g|png|webp)', re.I)
MORE = re.compile(r'show more|load more|view more|see more', re.I)

EXTRACT = """() => {
  const out = [];
  for (const img of document.querySelectorAll('img')) {
    const src = [img.currentSrc, img.src, img.dataset.src, img.getAttribute('srcset')].filter(Boolean).join(' ');
    if (!/\\/Images\\/Fabrics\\//i.test(src)) continue;
    let tile = img, text = '';
    for (let i = 0; i < 4 && tile.parentElement; i++) { tile = tile.parentElement; text = (tile.innerText || '').trim(); if (text) break; }
    const attrs = {};
    for (const a of tile.attributes) if (a.name.startsWith('data-') && !/price|stock|hold/i.test(a.name)) attrs[a.name] = a.value;
    out.push({ src, alt: img.alt || '', title: img.title || tile.title || '', text: text.slice(0, 200), attrs });
  }
  return out;
}"""


def collect(page):
    found = {}
    for item in page.evaluate(EXTRACT):
        match = ID_IN_URL.search(item['src'])
        if match:
            found.setdefault(match.group(1).upper(), {k: v for k, v in item.items() if k != 'src'})
    return found


def main():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 1400, 'height': 1000})
        page.goto(URL, wait_until='domcontentloaded', timeout=60000)
        page.wait_for_timeout(3000)
        found, clicks, stale = collect(page), 0, 0
        while clicks < 200 and stale < 3:
            button = page.get_by_role('button', name=MORE).first
            if button.count() == 0:
                button = page.locator('a', has_text=MORE).first
            if button.count() == 0 or not button.is_visible():
                break
            before = len(found)
            try:
                button.scroll_into_view_if_needed(timeout=3000)
                button.click(timeout=5000)
            except Exception:
                break
            clicks += 1
            page.wait_for_timeout(1200)
            page.mouse.wheel(0, 4000)
            page.wait_for_timeout(600)
            found.update({k: v for k, v in collect(page).items() if k not in found})
            stale = stale + 1 if len(found) == before else 0
        browser.close()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({'generated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'url': URL,
                               'show_more_clicks': clicks, 'swatches': found}, indent=1), encoding='utf-8')
    targets = load_targets()
    on_page, ours = set(found), set(targets)
    name_ok, name_off = [], []
    for cover_id in sorted(on_page & ours):
        haystack = norm(' '.join([found[cover_id]['alt'], found[cover_id]['title'], found[cover_id]['text'], ' '.join(found[cover_id]['attrs'].values())]))
        t = targets[cover_id]
        if not haystack:
            continue
        same = (not t['color_name'] or norm(t['color_name']) in haystack) and norm(t['pattern_name']) in haystack
        (name_ok if same else name_off).append(cover_id)
    COMPARE.parent.mkdir(parents=True, exist_ok=True)
    COMPARE.write_text(json.dumps({
        'swatches_on_page': len(on_page), 'show_more_clicks': clicks, 'app_ids': len(ours),
        'app_ids_on_page': len(on_page & ours), 'app_ids_not_on_page': sorted(ours - on_page),
        'page_ids_not_in_app': sorted(on_page - ours), 'names_confirmed': len(name_ok),
        'names_disagree_or_unreadable': name_off,
        'sample_text': {k: found[k]['text'][:80] for k in sorted(found)[:5]}}, indent=1), encoding='utf-8')
    print(f'{len(on_page)} swatches on page after {clicks} clicks; {len(on_page & ours)} of {len(ours)} app ids found there.')


if __name__ == '__main__':
    sys.exit(main())
