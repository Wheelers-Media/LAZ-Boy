#!/usr/bin/env python3
"""Build public/style-index-2026.json from the April 2026 Product Information Guide.
Usage: build-style-index.py <guide-text-export> <out.json>
The export is the tab-separated text of the guide workbook: PROD SPECS sheet, then DIMENSIONS sheet.
One record per Style Number. Nothing is inferred: blank in the guide stays blank here."""
import json, re, sys
src, out = sys.argv[1], sys.argv[2]
lines = open(src, encoding='utf8').read().split('\n')
def table(start_idx_pred):
    h = next(i for i, l in enumerate(lines) if l.startswith('Style Number\t') and start_idx_pred(i))
    cols = lines[h].split('\t'); rows = []
    for l in lines[h + 1:]:
        if l.startswith('## Sheet:') or l.startswith('Style Number\t'): break
        if not l.strip(): continue
        c = l.split('\t'); c += [''] * (len(cols) - len(c)); rows.append(dict(zip(cols, c)))
    return rows
specs = table(lambda i: True)
second = [i for i, l in enumerate(lines) if l.startswith('Style Number\t')][1]
dims = {r['Style Number']: r for r in table(lambda i: i == second)}
def split(v): return [x.strip() for x in v.split('|') if x.strip() and x.strip().upper() != 'N/A']
def fin(v):
    m = re.match(r'(.*)\((\d{3})\)\s*$', v.strip())
    return {'name': m.group(1).strip(), 'code': m.group(2)} if m else None
def num(v):
    try: return float(v)
    except ValueError: return None
DIM = {'Height': 'height', 'Width': 'width', 'Depth': 'depth', 'Seat Height': 'seatHeight', 'Seat Width': 'seatWidth',
       'Seat Depth': 'seatDepth', 'Arm Height': 'armHeight', 'Fully Extended': 'fullyExtended',
       'Recline Distance': 'reclineDistance', 'Leg Height': 'legHeight', 'Weight': 'weight',
       'Seat Factor': 'seatFactor', 'Wall Space': 'wallSpace'}
res = []
for r in specs:
    code = r['Style Code']; fam = code.split('-', 1)
    d = dims.get(r['Style Number'], {})
    status = {'NEW!': 'new', 'DISC!': 'discontinued'}.get(r['New vs Discontinued'], '')
    kind = ('reference' if len(r['Style Number']) == 2 or fam[-1] in ('Options', 'FEATURES (STANDARD)')
            else 'accessory' if r['Product Prefix'] in ('088', 'D88', 'Z88', '01P', '08P') else 'style')
    res.append({
        'kind': kind, 'styleNumber': r['Style Number'], 'prefix': r['Product Prefix'],
        'model': fam[0], 'family': fam[1] if len(fam) > 1 else '', 'styleCode': code,
        'name': r['Product Name'], 'category': r['Style Category'], 'status': status,
        'plants': split(r['Plants']),
        'capCodes': split(r['Cover Availability (CAP CODE)']),
        'standardFinish': fin(r['Standard Finish']),
        'optionalFinishes': [f for f in map(fin, split(r['Optional Finishes'])) if f],
        'options': split(r['Options']), 'backs': r['Backs'], 'seats': r['Seats'], 'pillows': r['Pillows'],
        'features': r['Standard Features'], 'special': r['Special Information'], 'stitching': r['Stitching Notes'],
        'swivelBase': r['Swivel Base'], 'tallBase': r['Tall Base'], 'batteryPack': r['Battery Pack'],
        'dims': {k: num(d.get(h, '')) for h, k in DIM.items() if num(d.get(h, '')) is not None},
    })
json.dump({'edition': 'April 2026 Product Information Guide (Canadian)', 'styles': res}, open(out, 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(res), 'styles')
