#!/usr/bin/env python3
"""Add the price book's per-style SELECT fabric / faux leather / leather cover lists (never prices) to public/style-index-2026.json.
Usage: add-pricebook-select.py <April 2026 price book pdf> <style-index json>
Each page of the price book opens with a block "SELECT FABRIC: ... SELECT FAUX LEATHER: ... SELECT LEATHER: ..." in three columns,
followed by the model's tables. The block applies to every style listed until the next block."""
import json, re, subprocess, sys
pdf, path = sys.argv[1], sys.argv[2]
lines = subprocess.run(['pdftotext', '-layout', pdf, '-'], capture_output=True, text=True, check=True).stdout.split('\n')
data = json.load(open(path, encoding='utf8'))
known = {r['styleNumber'] for r in data['styles'] if r['kind'] == 'style'}
item = re.compile(r'([A-Z]{1,3}\d{4})\s+([A-Za-z].*?)(?=\s{3,}|$)')
starts = [i for i, l in enumerate(lines) if 'SELECT FABRIC:' in l and 'SELECT LEATHER:' in l]
KEYS = ('fabric', 'faux', 'leather')
per_style = {}
for n, i in enumerate(starts):
    l = lines[i]
    cut = [l.index('SELECT FABRIC:') - 3, l.index('SELECT FAUX LEATHER:') - 3, l.index('SELECT LEATHER:') - 3, 10 ** 6]
    cols = {k: [] for k in KEYS}
    j = i + 1
    while j < len(lines) and lines[j].strip() and 'SELECT' not in lines[j] and 'CUSTOM' not in lines[j]:
        for k, a, b in zip(KEYS, cut, cut[1:]):
            for m in item.finditer(lines[j][max(a, 0):b]):
                name, colors = m.group(2).strip(), []
                tail = re.match(r'(.*?)\s+-\s+([\d, ]+)$', name)
                if tail: name, colors = tail.group(1), [c.strip() for c in tail.group(2).split(',') if c.strip()]
                entry = {'code': m.group(1), 'name': name}
                if colors: entry['colors'] = colors
                cols[k].append(entry)
        j += 1
    end = starts[n + 1] if n + 1 < len(starts) else len(lines)
    for line in lines[j:end]:
        for token in re.findall(r'\b[0-9A-Z]{6}\b', line):
            if token in known: per_style.setdefault(token, cols)
for row in data['styles']:
    if row['kind'] != 'style': continue
    cols = per_style.get(row['styleNumber'])
    select = {k: cols[k] for k in KEYS if cols and cols[k]} if cols else {}
    if select: row['select'] = select
    else: row.pop('select', None)
json.dump(data, open(path, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
print(sum(1 for r in data['styles'] if r.get('select')), 'styles have select lists;', len(per_style), 'styles seen in price book')
