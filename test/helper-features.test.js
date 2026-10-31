import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getGuideProductIndex } from '../src/logic.js';
import { searchEverything } from '../src/search.js';
import { compareStyleRows, MISSING } from '../src/compare.js';
import { buildDrill, emptyScore, recordAnswer } from '../src/drills.js';
import { buildFitSummary, decodeFitLink, encodeFitLink } from '../src/fitSummary.js';

const readJson = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const catalog = await readJson('catalog_data-v2.json');
catalog.style_index_2026 = await readJson('style-index-2026.json');
const products = getGuideProductIndex(catalog);
const rows = catalog.style_index_2026.styles.filter((row) => row.kind === 'style');
const seeded = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

test('search: empty query returns nothing, a model number finds its model first', () => {
  assert.deepEqual(searchEverything(catalog, '  ', products).models, []);
  const result = searchEverything(catalog, '724', products);
  assert.equal(result.models[0]?.modelCode, '724');
});
test('search: an RMS line decodes and keeps the decoder\'s "confirm before promising" status', () => {
  const result = searchEverything(catalog, '10X724 DP165667', products);
  assert.ok(result.decode);
  assert.equal(result.decode.orderable, false);
  assert.equal(result.decode.model.code, '724');
});
test('search: free text that is not a tag does not decode', () => {
  assert.equal(searchEverything(catalog, 'recliner', products).decode, null);
});
test('search: a style number finds its guide row', () => {
  const result = searchEverything(catalog, '44A724', products);
  assert.ok(result.styles.some((row) => row.styleNumber === '44A724'));
});

test('compare: copies guide values and says so when a field is missing', () => {
  const a = rows.find((row) => row.styleNumber === '44A724');
  const blank = { ...rows.find((row) => row.dims), dims: {}, backs: '', capCodes: [] };
  const table = compareStyleRows([a, blank]);
  assert.equal(table.columns.length, 2);
  assert.equal(table.rows.find((row) => row.label === 'Fully extended').values[0], `${a.dims.fullyExtended} in`);
  assert.equal(table.rows.find((row) => row.label === 'Fully extended').values[1], MISSING);
  assert.equal(table.rows.find((row) => row.label === 'Back').values[1], MISSING);
  assert.equal(compareStyleRows([a, a, a, a]).columns.length, 3);
});

test('drills: every kind produces a question whose correct option matches the guide', () => {
  for (const kind of ['tag', 'reach', 'wall']) {
    const drill = buildDrill(rows, seeded(7), kind);
    assert.ok(drill, kind);
    assert.equal(drill.options.length >= 3, true);
    assert.ok(drill.options.some((option) => option.id === drill.correctId));
    assert.equal(new Set(drill.options.map((option) => option.text)).size, drill.options.length);
  }
  const reach = buildDrill(rows, seeded(3), 'reach');
  const named = reach.options.map((option) => option.text);
  const winner = reach.options.find((option) => option.id === reach.correctId).text;
  const reaches = named.map((title) => rows.find((row) => `${row.name.charAt(0)}${row.name.slice(1).toLowerCase()} ${row.prefix}${row.model}` === title).dims.fullyExtended);
  assert.equal(reaches[named.indexOf(winner)], Math.max(...reaches));
  assert.equal(buildDrill([], seeded(1)), null);
});
test('drills: score tracks streak and best', () => {
  let score = emptyScore();
  [true, true, false, true].forEach((ok) => { score = recordAnswer(score, ok); });
  assert.deepEqual(score, { asked: 4, right: 3, streak: 1, best: 2 });
});

test('fit summary: labels each lead by evidence tier and never states price or stock as known', () => {
  const text = buildFitSummary({ answers: { height: '5′9″', weight: '200', category: 'Recliners', mechanism: 'Power recline', household: ['Pets'] }, sizeName: 'Small', matches: [{ rank: 1, tier: 'C', code: '724', name: 'Trouper', capacity: 'Not listed' }] });
  assert.match(text, /Catalog match \(kind of piece only\)/);
  assert.match(text, /not a confirmed fit/);
  assert.match(text, /not shown here/);
});
test('fit link round-trips known keys and rejects junk', () => {
  const answers = { height: '5′9″', weight: '200', category: 'Recliners', household: ['Pets', 'Kids'], evil: '<script>' };
  const back = decodeFitLink(encodeFitLink(answers));
  assert.deepEqual(back, { height: '5′9″', weight: '200', category: 'Recliners', household: ['Pets', 'Kids'] });
  assert.equal(decodeFitLink('#fit=%%%'), null);
  assert.equal(decodeFitLink('#other'), null);
});
