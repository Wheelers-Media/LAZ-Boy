import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildRmsSkuPreview, encodeRmsSku, getFullProductIndex, getModelCoverOptions, getRmsModelStyleChoices, getRmsStyleOptions } from '../src/logic.js';

const catalog = JSON.parse(await readFile(new URL('../public/catalog_data-v2.json', import.meta.url), 'utf8'));
catalog.recliner_catalog_2026 = JSON.parse(await readFile(new URL('../public/recliner-catalog-2026.json', import.meta.url), 'utf8'));
catalog.motion_catalog_2026 = JSON.parse(await readFile(new URL('../public/motion-catalog-2026.json', import.meta.url), 'utf8'));
catalog.designers_choice_catalog_2026 = JSON.parse(await readFile(new URL('../public/designers-choice-catalog-2026.json', import.meta.url), 'utf8'));
catalog.stationary_catalog_2026 = JSON.parse(await readFile(new URL('../public/stationary-catalog-2026.json', import.meta.url), 'utf8'));
catalog.recliner_collection_index_supplement = JSON.parse(await readFile(new URL('../public/recliner-collection-index-supplement.json', import.meta.url), 'utf8'));
catalog.april_2026_model_cover_applications = JSON.parse(await readFile(new URL('../public/april-2026-model-cover-applications.json', import.meta.url), 'utf8'));

test('offers only group candidates listed for the selected Trouper model across its catalogs and tear pad', () => {
  const codes = getRmsModelStyleChoices(catalog, '724').map((item) => item.code);

  assert.ok(codes.includes('010'));
  assert.ok(codes.includes('444'));
  assert.ok(codes.includes('44A'));
  assert.ok(codes.includes('U4A'));
  assert.ok(!codes.includes('3BL'));
});

test('returns only suffixes documented for the exact model and group', () => {
  assert.deepEqual([...getRmsStyleOptions(catalog, '724', '44A').options], ['FS']);
  assert.deepEqual([...getRmsStyleOptions(catalog, '724', 'U4A').options].sort(), ['FS', 'LW']);
  assert.deepEqual([...getRmsStyleOptions(catalog, '724', '444').options], ['FS']);
  assert.equal(getRmsStyleOptions(catalog, '724', '3BL'), null);
});

test('rejects incomplete pattern or color digits instead of assembling a misleading code', () => {
  const preview = buildRmsSkuPreview({ group: '010', style: '724', grade: 'D', pattern: '165', color: '67', finish: '007', includeFinish: true });

  assert.equal(preview.sku, '');
  assert.equal(preview.complete, false);
});

test('does not emit a partial or fabricated SKU from incomplete cover digits', () => {
  assert.equal(encodeRmsSku({ prefix: '010', modelCode: '724', cover: 'DP', patternCode: '165', colorFamily: '6', colorShade: '7' }), '');
  assert.equal(encodeRmsSku({ prefix: '010', modelCode: '724', cover: 'D', patternCode: '165667', finish: '' }), '010724 D165667');
  assert.equal(encodeRmsSku({ prefix: '010', modelCode: '724', cover: 'D', patternCode: '165667', optionCodes: ['FN'], finish: '' }), '');
});

test('lists model-specific cover applications without presenting unrelated cover caps', () => {
  const trouperCovers = getModelCoverOptions(catalog, '724');
  assert.ok(trouperCovers.some((item) => item.code === 'D126778' && /Denver/.test(item.note)));
  assert.ok(trouperCovers.some((item) => item.code === 'LB172755' && /Intermingle/.test(item.note)));
  assert.ok(!trouperCovers.some((item) => item.code === 'D211652'));
  assert.ok(getModelCoverOptions(catalog, '999').length === 0);
});

test('product index combines catalog styles and model-specific tear-pad pieces with source records', () => {
  const index = getFullProductIndex(catalog);
  const trouper = index.find((item) => item.modelCode === '724');
  const catalogOnly = index.find((item) => item.modelCode === '512');
  assert.ok(index.length >= 100);
  assert.ok(trouper.styles.some((item) => item.code === 'U4A'));
  assert.ok(trouper.sources.some((source) => /Trouper Tearpad/.test(source)));
  assert.ok(catalogOnly.styles.some((item) => item.code === '10X'));
});

test('builds an RMS string from separate Group, Style, Grade, Pattern, and Color fields', () => {
  const preview = buildRmsSkuPreview({
    group: '010',
    style: '724',
    grade: 'D',
    pattern: '1656',
    color: '67',
    finish: '007',
    options: ['FS'],
    includeFinish: true,
  });

  assert.deepEqual(preview.fields, [
    ['Group', '010'],
    ['Style', '724'],
    ['Grade', 'D'],
    ['Pattern', '1656'],
    ['Color', '67'],
  ]);
  assert.equal(preview.sku, '010-724 D165667 FN 007 FS');
  assert.equal(preview.complete, true);
});
