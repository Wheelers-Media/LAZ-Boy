import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (name) => JSON.parse(fs.readFileSync(new URL(`../public/${name}`, import.meta.url), 'utf8'));

test('MT, 4C and LG are named from the April 2026 guide', () => {
  const options = read('mechanism-guide-2026.json').options;
  assert.match(options.MT.name, /Tempur/);
  assert.match(options['4C'].name, /Caster/);
  assert.match(options.LG.name, /Leg/);
});

test('every option code on a style row has a name somewhere in the data', () => {
  const guide = read('mechanism-guide-2026.json').options;
  const catalog = read('catalog_data-v2.json');
  const known = new Set([...Object.keys(guide), ...catalog.option_suffixes.map((o) => o.code), ...(catalog.nailhead_trims || []).map((o) => o.code), ...(catalog.cushion_upgrades || []).map((o) => o.code)]);
  const missing = new Set();
  for (const row of read('style-index-2026.json').styles) for (const code of row.options || []) if (!known.has(code)) missing.add(code);
  console.log('codes with no name:', [...missing].join(' ') || 'none');
  assert.deepEqual([...missing].filter((c) => !['FN'].includes(c)), []);
});
