import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getDefaultRmsGroup, getRmsModelStyleChoices } from '../src/logic.js';

const readJson = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const catalog = await readJson('catalog_data-v2.json');
for (const [key, file] of [['recliner_catalog_2026', 'recliner-catalog-2026.json'], ['motion_catalog_2026', 'motion-catalog-2026.json'], ['stationary_catalog_2026', 'stationary-catalog-2026.json'], ['designers_choice_catalog_2026', 'designers-choice-catalog-2026.json'], ['style_index_2026', 'style-index-2026.json']]) catalog[key] = await readJson(file);

const pieceCodes = (modelCode) => new Set(catalog.product_profiles.filter((profile) => String(profile.model_code) === modelCode).flatMap((profile) => profile.pieces.flatMap((piece) => [piece.code, ...(piece.variants || []).map((variant) => variant.code)])).filter(Boolean));

test('a model that is sold whole does not default to one of its modular pieces', () => {
  for (const modelCode of ['724', '769', '759']) {
    const choices = getRmsModelStyleChoices(catalog, modelCode);
    const whole = choices.filter((choice) => !pieceCodes(modelCode).has(choice.code));
    assert.ok(whole.length > 0, `${modelCode} has a whole-piece style`);
    assert.ok(!pieceCodes(modelCode).has(getDefaultRmsGroup(catalog, modelCode)), `${modelCode} defaulted to a modular piece`);
  }
});

test('a model that only has modular pieces still gets a default', () => {
  assert.ok(getDefaultRmsGroup(catalog, '811'));
});
