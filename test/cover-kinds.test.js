import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getModelCoverSwatches, summarizeGradeKinds } from '../src/logic.js';

const readJson = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const catalog = await readJson('catalog_data-v2.json');
for (const [key, file] of [['recliner_catalog_2026', 'recliner-catalog-2026.json'], ['motion_catalog_2026', 'motion-catalog-2026.json'], ['stationary_catalog_2026', 'stationary-catalog-2026.json'], ['designers_choice_catalog_2026', 'designers-choice-catalog-2026.json'], ['style_index_2026', 'style-index-2026.json'], ['april_2026_model_cover_applications', 'april-2026-model-cover-applications.json'], ['fabric_cover_program_a26', 'fabric-cover-program-a26.json']]) catalog[key] = await readJson(file);

const swatches = getModelCoverSwatches(catalog, '724', '010');
const named = swatches.filter((swatch) => swatch.capCode);

test('every program cover says what kind of cover it is', () => {
  assert.ok(named.length > 0);
  for (const swatch of named) assert.ok(swatch.kind, `${swatch.code} has no kind`);
});

test('fabric kinds come from the cap code names in the catalog, leathers from their leather type', () => {
  const dr = named.find((swatch) => swatch.capCode === 'DR');
  assert.equal(dr.kind, 'Standard Body Fabric');
  const leather = named.find((swatch) => swatch.material === 'Leather');
  if (leather) assert.match(leather.kind, /Authentic leather|Performance leather|Nubuck leather/);
});

test('a cap code the catalog does not describe is shown as its code, never given a made-up name', () => {
  const vs = swatches.find((swatch) => swatch.capCode === 'VS') || getModelCoverSwatches(catalog, '759', '010').find((swatch) => swatch.capCode === 'VS');
  if (vs) assert.equal(vs.kind, 'VS cap code');
});

test('a grade summary counts patterns per kind and only counts that grade', () => {
  const summary = summarizeGradeKinds(swatches, 'D');
  assert.ok(summary.length > 0);
  const patterns = new Set(swatches.filter((swatch) => swatch.grade === 'D').map((swatch) => swatch.pattern));
  assert.equal(summary.reduce((sum, item) => sum + item.patterns, 0), patterns.size);
  assert.deepEqual(summarizeGradeKinds(swatches, 'ZZ'), []);
});
