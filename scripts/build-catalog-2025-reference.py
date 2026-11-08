"""Merge the four Summer/Fall 2025 catalog extractions into public/catalog-2025-reference.json.

Inputs (committed research notes): research_notes/La-Z-Boy site crawl gap analysis/catalog2025_{recliner,motion,stationary,designers_choice}.json
Output: one compact reference of every style printed in the 2025 catalogs, a prefix dictionary, and whether the 2026 style index has the style.
Run from the repo root:  python3 scripts/build-catalog-2025-reference.py
"""
import json, re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
notes = root / 'research_notes/La-Z-Boy site crawl gap analysis'
load = lambda name: json.loads((notes / name).read_text())
style_index = json.loads((root / 'public/style-index-2026.json').read_text())['styles']
in_2026 = {row['styleNumber'].upper() for row in style_index}

CATALOGS = {'R': 'Recliner', 'M': 'Motion', 'S': 'Stationary', 'D': "Designer's Choice"}
rows, seen = [], {}


def add(catalog, number, name, kind, dims, options, page, wql=False, new=False):
    number = re.sub(r'[\s\-]', '', str(number)).upper()
    if not number:
        return
    key = (catalog, number)
    if key in seen:
        return
    seen[key] = True
    rows.append({
        's': number, 'n': (name or '').title(), 't': kind or '', 'd': dims or '', 'o': [o for o in (options or []) if o and o != 'N/A'],
        'c': catalog, 'p': page, **({'wql': True} if wql else {}), **({'new': True} if new else {}), 'in26': number in in_2026,
    })


for r in load('catalog2025_recliner.json'):
    add('R', r['style_number'], r['name'], r['type'], r.get('dimensions_printed'), r.get('options'), r.get('catalog_page'), 'WQL' in r.get('markers', []), 'NEW' in r.get('markers', []))
motion = load('catalog2025_motion.json')
for r in motion['styles']:
    add('M', r['style_number'], r['model_name'], r['category_printed'], r.get('dimensions_printed'), r.get('options'), r.get('catalog_page'), r.get('wql', False))
for r in load('catalog2025_stationary.json')['styles']:
    add('S', r['style_number'], r['name'], r['type'], r.get('dimensions'), r.get('options'), r.get('catalog_page'), False, r.get('new_marker_2025', False))
for r in load('catalog2025_designers_choice.json')['style_records']:
    add('D', r['style_number'], r['model_name'], r['type'], r.get('dims_raw'), r.get('options'), r.get('page'), False, r.get('new', False))

prefixes = {}
for item in motion['prefix_definitions_2025']:
    prefixes[item['prefix'].upper()] = {'def': item['definition'], 'section': item['section']}

out = {
    '_meta': {
        'title': 'Summer/Fall 2025 catalogs, style reference',
        'source': 'La-Z-Boy Recliner, Motion, Stationary and Designer\'s Choice collection catalogs, Summer/Fall 2025 (Publitas flipbooks), read from their text layer. Built by scripts/build-catalog-2025-reference.py.',
        'note': 'This is last season\'s printed catalog, not the app\'s 2026 data. A style here that is not in the 2026 style index may be discontinued, renamed or simply missing from the 2026 files. Confirm before offering it. Dimensions are as printed; some differ from 2026 (mostly power and wall-power widths).',
        'catalogs': CATALOGS,
        'counts': {name: sum(1 for r in rows if r['c'] == key) for key, name in CATALOGS.items()},
    },
    'prefixes': dict(sorted(prefixes.items())),
    'styles': rows,
}
text = json.dumps(out, indent=1, ensure_ascii=False)
text = re.sub(r'\[\n(?:\s+(?:"[^"\n]*"|-?\d[\d.]*|true|false|null),?\n)+\s*\]', lambda m: re.sub(r'\s*\n\s*', ' ', m.group(0)).replace('[ ', '[').replace(' ]', ']'), text)
# one line per style record
text = re.sub(r'\{\n\s+"s":.*?\n\s+\}', lambda m: re.sub(r'\s*\n\s*', ' ', m.group(0)), text, flags=re.S)
(root / 'public/catalog-2025-reference.json').write_text(text + '\n')
print(out['_meta']['counts'], len(prefixes), 'prefixes', len(text), 'bytes')
