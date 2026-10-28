import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildSwatchIndex, swatchImageFor } from '../src/logic.js';

const readJson = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const entry = (cover, color, extra = {}) => ({ cover_code: cover, color_code: color, name_check: 'match', local_thumb: `/swatches/thumb/${cover}${color}.jpg`, local_zoom: `/swatches/zoom/${cover}${color}.jpg`, ...extra });

test('swatchImageFor returns the local path for a cover + colour, in either call shape', () => {
  const index = buildSwatchIndex({ swatches: [entry('D1855', '53')] });
  assert.equal(swatchImageFor(index, 'D1855', '53'), '/swatches/zoom/D185553.jpg');
  assert.equal(swatchImageFor(index, 'D185553'), '/swatches/zoom/D185553.jpg');
  assert.equal(swatchImageFor(index, 'D185553', '', 'thumb'), '/swatches/thumb/D185553.jpg');
});

test('swatchImageFor returns null instead of guessing', () => {
  const index = buildSwatchIndex({ swatches: [entry('D1855', '53'), entry('D1855', '59', { name_check: 'mismatch' }), entry('D1855', '64', { local_thumb: null, local_zoom: null })] });
  assert.equal(swatchImageFor(index, 'D1855', '99'), null);
  assert.equal(swatchImageFor(index, 'D1855', '59'), null, 'a name mismatch with the website is never shown');
  assert.equal(swatchImageFor(index, 'D1855', '64'), null, 'an entry with no local file has no image');
  assert.equal(swatchImageFor(null, 'D1855', '53'), null);
  assert.equal(swatchImageFor(buildSwatchIndex(null), 'D1855', '53'), null);
});

test('a missing size falls back to the other local size of the same image', () => {
  const index = buildSwatchIndex({ swatches: [entry('C1525', '34', { local_zoom: null })] });
  assert.equal(swatchImageFor(index, 'C1525', '34'), '/swatches/thumb/C152534.jpg');
});

test('every manifest entry is a real app cover + colour, has its files on disk, and carries no pricing', async () => {
  const manifest = await readJson('swatch-manifest.json');
  const program = await readJson('fabric-cover-program-a26.json');
  const prior = program.priorSeason || {};
  const known = new Set([...program.fabrics, ...program.leathers, ...(prior.fabrics || []), ...(prior.leathers || [])].flatMap((record) => (record.colors || []).map((color) => `${record.coverCode}${color}`)));
  for (const item of manifest.swatches) {
    assert.ok(known.has(`${item.cover_code}${item.color_code}`), `${item.cover_code}${item.color_code} is not in the app's cover data`);
    for (const key of ['local_thumb', 'local_zoom']) if (item[key]) assert.ok(existsSync(new URL(`../public${item[key]}`, import.meta.url)), `${item[key]} missing on disk`);
    assert.ok(Object.keys(item).every((key) => !/price/i.test(key)));
  }
});
