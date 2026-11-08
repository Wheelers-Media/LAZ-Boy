"""Fill blank colour names in the cover program and swatch manifest from data/source/free-swatch-names.json.

Only blanks are filled; a name the April 2026 list already gives is never overwritten.
The site lists '<Pattern> <Colour>'; the pattern prefix is removed to leave the colour.
Run from the repo root:  python3 scripts/swatches/backfill_color_names.py
"""
import json, re
from pathlib import Path

root = Path(__file__).resolve().parents[2]
site = json.loads((root / 'data/source/free-swatch-names.json').read_text())['names']


def dump_compact(data):
    """2-space JSON with short scalar arrays on one line, matching how the cover program is stored."""
    text = json.dumps(data, indent=2, ensure_ascii=False)
    collapse = lambda m: re.sub(r'\s*\n\s*', ' ', m.group(0)).replace('[ ', '[').replace(' ]', ']')
    return re.sub(r'\[\n(?:\s+(?:"[^"\n]*"|-?\d[\d.]*|true|false|null),?\n)+\s*\]', collapse, text) + '\n'


def colour_from(site_name, pattern):
    base = re.sub(r'\s*\([A-Z]+\)\s*$', '', pattern or '').strip()
    if base and site_name.lower().startswith(base.lower() + ' '):
        return site_name[len(base) + 1:].strip()
    return ''


prog_path = root / 'public/fabric-cover-program-a26.json'
prog = json.loads(prog_path.read_text())
filled = skipped = 0
for rec in prog['fabrics'] + prog['leathers']:
    names = rec.setdefault('colorNames', {})
    for colour in rec['colors']:
        if names.get(colour):
            continue
        name = site.get(rec['coverCode'] + colour)
        value = colour_from(name, rec['patternName']) if name else ''
        if value:
            names[colour] = value
            filled += 1
        else:
            skipped += 1
prog_path.write_text(dump_compact(prog))

man_path = root / 'public/swatch-manifest.json'
man = json.loads(man_path.read_text())
mfilled = 0
for sw in man['swatches']:
    if sw.get('color_name'):
        continue
    name = site.get(sw['cover_code'] + sw['color_code'])
    value = colour_from(name, sw['pattern_name']) if name else ''
    if value:
        sw['color_name'] = value
        mfilled += 1
man_path.write_text(json.dumps(man, indent=1, ensure_ascii=False) + '\n')
print(f'cover program: filled {filled}, still blank {skipped}; manifest: filled {mfilled}')
