#!/usr/bin/env python3
"""Cross-check the April 2026 retail price book against public/style-index-2026.json.

Usage: pdftotext -layout <pricebook.pdf> pb.txt && python3 scripts/check-pricebook.py pb.txt
Writes public/pricebook-check-2026.json. Prices are never read or stored.
Only style number, dimensions, cap codes and the NEW!/DISC! flags are compared.
"""
import json, re, sys, collections
txt = open(sys.argv[1]).read().split('\n')
G = {x['styleNumber']: x for x in json.load(open('public/style-index-2026.json'))['styles'] if x['kind'] == 'style'}
tok = re.compile(r'(?<![\w.])(-|\d+(?:\.\d+)?)(?![\w.])')
tail = lambda l: (lambda t: t[-5:] if len(t) >= 5 else None)(tok.findall(l.rstrip()))
code_re = re.compile(r'^\s{1,14}(?:NEW!\s+|DISC!\s+)?([A-Z0-9]{3}\d{3})\b')
rows = {}
for i, l in enumerate(txt):
    if not re.search(r'\bCOST\b', l): continue
    d1 = tail(l)
    if not d1: continue
    code = next((m.group(1) for j in (i - 1, i, i + 1, i + 2) if 0 <= j < len(txt) for m in [code_re.match(txt[j])] if m), None)
    d2 = next((tail(txt[j]) for j in range(i + 1, i + 5) if j < len(txt) and 'RESALE' in txt[j]), None)
    if code and d2: rows.setdefault(code, (d1, d2))
num = lambda v: None if v == '-' else float(v)
FIELDS = ['height', 'width', 'depth', 'seatHeight', 'seatWidth', 'seatDepth', 'armHeight', 'weight', 'seatFactor']
models = collections.defaultdict(lambda: {'listed': True, 'stylesChecked': 0, 'dimsMatching': 0, 'conflicts': []})
for code, (a, b) in rows.items():
    g = G.get(code)
    if not g or not g['dims']: continue
    H, W, D, RD, WT = map(num, a); SH, SW, SD, AH, SF = map(num, b)
    pb = dict(zip(FIELDS, (H, W, D, SH, SW, SD, AH, WT, SF)))
    m = models[g['model']]; m['stylesChecked'] += 1
    diffs = [(k, v, g['dims'].get(k)) for k, v in pb.items() if v != g['dims'].get(k) and not (v is None and g['dims'].get(k) is None)]
    if diffs: m['conflicts'].extend({'style': code, 'field': k, 'pricebook': v, 'guide': gv} for k, v, gv in diffs)
    else: m['dimsMatching'] += 1
flags = {}
for l in txt:
    m = re.match(r'\s*(NEW!|DISC!)\s+([A-Z0-9]{3}\d{3})\b', l)
    if m: flags[m.group(2)] = 'new' if m.group(1) == 'NEW!' else 'discontinued'
for code, f in flags.items():
    if code in G: models[G[code]['model']]['listed'] = True
# model name/number index
idx = set()
for l in txt[60:140]:
    for m in re.finditer(r'([A-Z][A-Z\' .&-]+?)\s+(\d{3}|[A-Z]\d{2}|\d{2}[A-Z])\b', l): idx.add(m.group(2))
live_models = {x['model'] for x in G.values() if x['status'] != 'discontinued'}
out = {
  'source': 'LZB_Retail April 2026 Upholstery Pricebook (Canadian dealers: resales in CAD, costs in USD), edition 26-04-AC-F, issued April 23, 2026',
  'scope': 'Cross-check only. Compares style numbers, dimensions, NEW!/DISC! flags and model listing. No prices are read or stored. This does not establish availability or that a configuration can be ordered.',
  'stylesParsed': len(rows),
  'flagAgreement': {'flagged': len(flags), 'matchGuideStatus': sum(1 for k, v in flags.items() if k in G and G[k]['status'] == v)},
  'modelsNotInPriceBook': sorted(m for m in live_models if m not in idx and not any(x['model'] == m and x['styleNumber'] in rows for x in G.values())),
  'models': {m: v for m, v in sorted(models.items())},
}
json.dump(out, open('public/pricebook-check-2026.json', 'w'), indent=1)
print(json.dumps({k: out[k] for k in ('stylesParsed', 'flagAgreement', 'modelsNotInPriceBook')}), 'models with conflicts:', {m: v['conflicts'] for m, v in out['models'].items() if v['conflicts']})
