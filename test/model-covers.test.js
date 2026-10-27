import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getModelCoverSwatches } from '../src/logic.js';

const read = async (name) => JSON.parse(await readFile(new URL(`../public/${name}`, import.meta.url), 'utf8'));
const catalog = await read('catalog_data-v2.json');
catalog.recliner_catalog_2026 = await read('recliner-catalog-2026.json');
catalog.motion_catalog_2026 = await read('motion-catalog-2026.json');
catalog.designers_choice_catalog_2026 = await read('designers-choice-catalog-2026.json');
catalog.stationary_catalog_2026 = await read('stationary-catalog-2026.json');
catalog.fabric_cover_program_a26 = await read('fabric-cover-program-a26.json');

test('every model cover is a full grade + 4-digit pattern + 2-digit colour code', () => {
  for (const model of ['403', '521', '724', '411', '421']) {
    const covers = getModelCoverSwatches(catalog, model);
    assert.ok(covers.length > 0, model);
    for (const cover of covers) assert.match(cover.code, /^[A-Z]{1,3}\d{6}$/);
  }
});

test('recliner and motion models never get medium-duty fabrics', () => {
  const medium = new Set(catalog.fabric_cover_program_a26.fabrics.filter((item) => item.wearability === 'Medium').map((item) => item.coverCode));
  assert.ok(medium.size > 0);
  for (const model of ['724', '521']) {
    for (const cover of getModelCoverSwatches(catalog, model)) assert.equal(medium.has(cover.code.slice(0, -2)), false, `${model} ${cover.code}`);
  }
});

test('a model with no cap data in the supplied catalogs gets no covers instead of a guess', () => {
  assert.deepEqual(getModelCoverSwatches(catalog, '401'), []);
});

test('leathers appear only for the models the April list names', () => {
  const leatherFor724 = getModelCoverSwatches(catalog, '724').filter((item) => item.material === 'Leather');
  assert.ok(leatherFor724.length > 0);
  assert.equal(getModelCoverSwatches(catalog, '411').some((item) => item.material === 'Leather'), false);
});
