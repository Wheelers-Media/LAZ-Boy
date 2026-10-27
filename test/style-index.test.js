import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getGuideStyle, getGuideStyleRows, getModelCoverSwatches, getRmsModelStyleChoices, getRmsStyleOptions, getStyleFinishes } from '../src/logic.js';

const read = async (name) => JSON.parse(await readFile(new URL(`../public/${name}`, import.meta.url), 'utf8'));
const catalog = await read('catalog_data-v2.json');
for (const [key, file] of [['recliner_catalog_2026', 'recliner-catalog-2026.json'], ['motion_catalog_2026', 'motion-catalog-2026.json'], ['designers_choice_catalog_2026', 'designers-choice-catalog-2026.json'], ['stationary_catalog_2026', 'stationary-catalog-2026.json'], ['fabric_cover_program_a26', 'fabric-cover-program-a26.json'], ['style_index_2026', 'style-index-2026.json']]) catalog[key] = await read(file);
const styles = catalog.style_index_2026.styles.filter((row) => row.kind === 'style');
const program = catalog.fabric_cover_program_a26;
const capOf = new Map([...program.fabrics, ...program.leathers].map((record) => [record.coverCode, record.capCode]));

test('guide holds 765 styles across 105 models', () => {
  assert.equal(styles.length, 765);
  assert.equal(new Set(styles.map((row) => row.model)).size, 105);
});

test('every offered cover is accepted by that exact style\'s cap codes', () => {
  for (const row of styles) {
    const caps = new Set(row.capCodes);
    for (const cover of getModelCoverSwatches(catalog, row.model, row.prefix)) {
      const cap = cover.capCode || capOf.get(cover.code.slice(0, -2));
      if (cap) assert.ok(caps.has(cap), `${row.styleNumber} offers ${cover.code} (cap ${cap}) but guide caps are ${row.capCodes.join('|')}`);
    }
  }
});

test('styles without a cap code offer no covers', () => {
  for (const row of styles.filter((item) => !item.capCodes.length)) assert.deepEqual(getModelCoverSwatches(catalog, row.model, row.prefix), [], row.styleNumber);
});

test('no leather is offered where the style has neither LL, LM nor LS', () => {
  for (const row of styles) {
    if (row.capCodes.some((cap) => ['LL', 'LM', 'LS'].includes(cap))) continue;
    assert.ok(!getModelCoverSwatches(catalog, row.model, row.prefix).some((cover) => cover.material === 'Leather'), row.styleNumber);
  }
});

test('Cade 803 offers LL/LM leather but never DP, NP, PS or VS fabrics', () => {
  const row = getGuideStyle(catalog, '803', '448');
  assert.deepEqual(row.capCodes, ['DR', 'UR', 'UE', 'BU', 'RL', 'LL', 'LM']);
  const covers = getModelCoverSwatches(catalog, '803', '448');
  assert.ok(covers.some((cover) => cover.material === 'Leather'));
  assert.ok(!covers.some((cover) => ['DP', 'NP', 'PS', 'VS'].includes(cover.capCode)));
});

test('options and finishes come only from the style row', () => {
  for (const row of styles) {
    const options = getRmsStyleOptions(catalog, row.model, row.prefix);
    assert.deepEqual([...options.options].sort(), [...row.options].sort(), row.styleNumber);
    const finishes = getStyleFinishes(catalog, row.model, row.prefix);
    assert.deepEqual(finishes.optional, row.optionalFinishes);
    assert.deepEqual(finishes.standard, row.standardFinish);
    assert.ok(!row.options.includes('N/A'));
  }
  assert.deepEqual(getStyleFinishes(catalog, '681', '610').standard, { name: 'Brown Mahogany', code: '007' });
});

test('style choices for a model are exactly its guide rows', () => {
  for (const model of new Set(styles.map((row) => row.model))) {
    assert.deepEqual(getRmsModelStyleChoices(catalog, model).map((item) => item.code), getGuideStyleRows(catalog, model).map((row) => row.prefix), model);
  }
});

test('tag photos: Cade 448803, Bexley 610681, Apollo X49757 match the guide', () => {
  assert.deepEqual(getGuideStyle(catalog, '803', '448').dims, { height: 42, width: 60, depth: 39, seatHeight: 20.5, seatWidth: 46, seatDepth: 22.5, armHeight: 25.5, fullyExtended: 67.5, reclineDistance: 6, weight: 157, seatFactor: 2 });
  assert.deepEqual(getGuideStyle(catalog, '681', '610').options, ['DC', 'FN', 'FP', 'NB', 'NH', 'NS', 'P1', 'Z6']);
  assert.deepEqual(getGuideStyle(catalog, '757', 'X49').options, ['CB', 'CC', 'CM', 'FS', 'W2']);
});
