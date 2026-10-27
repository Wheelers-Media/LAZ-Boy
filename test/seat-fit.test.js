import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getSeatFit } from '../src/logic.js';

const readJson = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const catalog = await readJson('catalog_data-v2.json');
for (const [key, file] of [['recliner_catalog_2026', 'recliner-catalog-2026.json'], ['motion_catalog_2026', 'motion-catalog-2026.json'], ['stationary_catalog_2026', 'stationary-catalog-2026.json'], ['designers_choice_catalog_2026', 'designers-choice-catalog-2026.json'], ['style_index_2026', 'style-index-2026.json']]) catalog[key] = await readJson(file);
const research = await readJson('canada_lineup_research.json');

const base = { category: 'Recliners', clearance: 'Standard room · 18 in', mechanism: 'Manual', hip_breadth_inches: '', thigh_length_inches: '', popliteal_height_inches: '' };
const fit = (modelCode, inches, extra = {}) => getSeatFit(catalog, research, { modelCode, inches, answers: { ...base, ...extra } });
const row = (modelCode, prefix) => catalog.style_index_2026.styles.find((style) => style.kind === 'style' && String(style.model) === modelCode && style.prefix === prefix).dims;

test('height alone checks seat depth and seat height against the height band', () => {
  const result = fit('403', 67); // 5'7", Small to Medium band: depth 19.5-20.5, height 19-20
  assert.equal(result.basis, 'Small to Medium');
  const depth = result.checks.find((check) => check.key === 'depth');
  const height = result.checks.find((check) => check.key === 'height');
  assert.equal(depth.chair, row('403', '010').seatDepth);
  assert.equal(depth.status, 'in');
  assert.equal(height.chair, row('403', '010').seatHeight);
  assert.equal(height.status, 'near'); // 18 in is one inch under the 19-20 band
  assert.equal(result.status, 'near');
});

test('a seat well outside the band is out, and says by how much', () => {
  const result = fit('502', 67, { mechanism: 'Power + lumbar' }); // 10X, seat depth 22
  const depth = result.checks.find((check) => check.key === 'depth');
  assert.equal(depth.chair, 22);
  assert.equal(depth.status, 'out');
  assert.equal(result.status, 'out');
});

test('entered measurements are checked directly: knee gap, seat height and hip clearance', () => {
  const result = fit('512', 67, { thigh_length_inches: '24', popliteal_height_inches: '17.5', hip_breadth_inches: '15' });
  assert.equal(result.basis, 'measurements');
  assert.deepEqual(result.checks.map((check) => check.key).sort(), ['depth', 'height', 'width']);
  assert.equal(result.checks.find((check) => check.key === 'depth').status, 'in'); // 24 - 21.5 = 2.5 in gap
  assert.equal(result.checks.find((check) => check.key === 'height').status, 'in'); // 18.5 vs 17.5 + 1
  assert.equal(result.checks.find((check) => check.key === 'width').status, 'in'); // 19 - 15 = 4 in
});

test('a hip measurement wider than the seat is out', () => {
  const result = fit('512', 67, { hip_breadth_inches: '21' });
  assert.equal(result.checks.find((check) => check.key === 'width').status, 'out');
  assert.equal(result.status, 'out');
});

test('a model with no seat dimensions is unscored, not ranked low and not assumed to fit', () => {
  const result = fit('000', 67);
  assert.equal(result.status, 'unscored');
  assert.deepEqual(result.checks, []);
});

test('no height and no measurements is unscored', () => {
  assert.equal(fit('403', NaN).status, 'unscored');
});
