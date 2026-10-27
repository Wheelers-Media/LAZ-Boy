#!/usr/bin/env python3
"""Add which cover price bands each style is sold in (never the prices) to public/style-index-2026.json.
Usage: add-pricebook-bands.py <April 2026 price book pdf> <style-index json>
A band is "available" when the price book shows a price instead of '-' for that style.
Columns on every row: Select fabric, Select faux leather, Select leather, B-C, D-F, G-N, P-Q, BL, DL, FL, HL."""
import json, re, subprocess, sys
pdf, path = sys.argv[1], sys.argv[2]
lines = subprocess.run(['pdftotext', '-layout', pdf, '-'], capture_output=True, text=True, check=True).stdout.split('\n')
data = json.load(open(path, encoding='utf8'))
known = {r['styleNumber'] for r in data['styles'] if r['kind'] == 'style'}
NAMES = ['selectFabric', 'selectFaux', 'selectLeather', 'B-C', 'D-F', 'G-N', 'P-Q', 'BL', 'DL', 'FL', 'HL']
found = {}
for i, line in enumerate(lines):
    if 'RESALE' not in line: continue
    j = i
    while j > i - 6 and 'COST' not in lines[j]: j -= 1
    style = next((t for t in ' '.join(lines[j:i + 1]).split() if t in known), None)
    vals = line.split('RESALE', 1)[1].split()[:11]
    if style and len(vals) == 11: found[style] = [n for n, v in zip(NAMES, vals) if v != '-']
for row in data['styles']:
    if row['kind'] == 'style': row['bands'] = found.get(row['styleNumber'], [])
json.dump(data, open(path, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
print(len(found), 'of', len(known), 'styles have price-book bands')
