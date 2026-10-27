import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { decodeRmsSku, encodeRmsSku } from '../src/logic.js';

const readJson = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const catalog = await readJson('catalog_data-v2.json');
catalog.recliner_catalog_2026 = await readJson('recliner-catalog-2026.json');
catalog.motion_catalog_2026 = await readJson('motion-catalog-2026.json');
catalog.stationary_catalog_2026 = await readJson('stationary-catalog-2026.json');
catalog.designers_choice_catalog_2026 = await readJson('designers-choice-catalog-2026.json');

test('decodeRmsSku decodes exactly what encodeRmsSku emits (no hyphen)', () => {
  const sku = encodeRmsSku({ prefix: '10X', modelCode: '724', cover: 'DP', patternCode: '165667', colorFamily: '6', colorShade: '7', finish: '007' });
  assert.equal(sku, '10X724 D165667 FN 007');
  const result = decodeRmsSku(sku, catalog);
  assert.equal(result.style.code, '10X');
  assert.equal(result.style.status, 'documented');
  assert.equal(result.model.code, '724');
  assert.equal(result.model.status, 'documented');
  assert.equal(result.cover.raw, 'D165667');
  assert.equal(result.cover.pattern, '1656');
  assert.equal(result.cover.color, '67');
  assert.equal(result.finish?.value, '007');
  assert.ok(!result.warnings.some((warning) => /Group\/Style pair/.test(warning)));
});

test('the hyphenated form gives the same style and model as the joined form', () => {
  const joined = decodeRmsSku('10X724 D165667 FN 007', catalog);
  const hyphen = decodeRmsSku('10X-724 D165667 FN 007', catalog);
  assert.deepEqual([joined.style.code, joined.model.code, joined.model.name], [hyphen.style.code, hyphen.model.code, hyphen.model.name]);
});

test('a joined head that matches no documented style and model stays unresolved', () => {
  const result = decodeRmsSku('ZZZ999 D165667', catalog);
  assert.equal(result.style.status, 'unresolved');
  assert.equal(result.model.status, 'unresolved');
  assert.equal(result.orderable, false);
});

test('an ambiguous joined head is not guessed', () => {
  const synthetic = {
    style_prefixes: [{ code: 'AB', motion_type: 'Style AB' }, { code: 'ABC', motion_type: 'Style ABC' }],
    models_database: [{ model_code: 'C12', model_name: 'Model C12' }, { model_code: '12', model_name: 'Model 12' }],
  };
  const result = decodeRmsSku('ABC12 D165667', synthetic);
  assert.equal(result.style.status, 'unresolved');
  assert.equal(result.model.status, 'unresolved');
  assert.ok(result.warnings.some((warning) => /more than one/i.test(warning)));
});
