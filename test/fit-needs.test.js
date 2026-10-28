import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { FIT_NEEDS, getContextualModelOptions } from '../src/logic.js';

const readJson = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const catalog = await readJson('catalog_data-v2.json');
catalog.recliner_catalog_2026 = await readJson('recliner-catalog-2026.json');
catalog.motion_catalog_2026 = await readJson('motion-catalog-2026.json');
catalog.stationary_catalog_2026 = await readJson('stationary-catalog-2026.json');
catalog.designers_choice_catalog_2026 = await readJson('designers-choice-catalog-2026.json');
catalog.style_index_2026 = await readJson('style-index-2026.json');

const base = { category: 'Recliners', clearance: 'Standard room · 18 in', mechanism: 'Power recline', scale: '', cushion_preference: 'Standard Poly', support_preference: 'No preference yet' };

test('there is a not-sure-yet choice that changes nothing', () => {
  const none = FIT_NEEDS.find((need) => need.key === 'unsure');
  assert.ok(none);
  assert.deepEqual(none.patch, {});
});

test('every need only sets a category or recline type, never a model, weight or fit', () => {
  for (const need of FIT_NEEDS) assert.deepEqual(Object.keys(need.patch).filter((key) => !['category', 'mechanism'].includes(key)), [], need.key);
});

test('every need points at a combination that has at least one model in the supplied catalogs', () => {
  for (const need of FIT_NEEDS.filter((item) => Object.keys(item.patch).length)) {
    const options = getContextualModelOptions(catalog, { ...base, ...need.patch });
    assert.ok(options.length > 0, `${need.key} (${JSON.stringify(need.patch)}) has no model in the supplied data`);
  }
});

test('need wording asks what the customer wants and never promises a fit', () => {
  for (const need of FIT_NEEDS) assert.doesNotMatch(`${need.label} ${need.hint}`, /perfect|guarantee|will fit|fits you|best for you/i, need.key);
});
