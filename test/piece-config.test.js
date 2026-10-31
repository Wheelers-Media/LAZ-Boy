import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { configureStyle, styleChoices, toggleOption } from '../src/pieceConfig.js';

const catalog = JSON.parse(fs.readFileSync(new URL('../public/catalog_data-v2.json', import.meta.url), 'utf8'));
catalog.style_index_2026 = JSON.parse(fs.readFileSync(new URL('../public/style-index-2026.json', import.meta.url), 'utf8'));

test('Trouper 10X builds the same SKU as the SKU Builder, with the standard finish by default', () => {
  const result = configureStyle(catalog, '724', '10X', { cover: 'D185559', options: ['LW', 'SL'] });
  assert.equal(result.sku, '10X-724 D185559 FN 007 LW SL');
  assert.deepEqual(result.missing, []);
});

test('no cover means no SKU and the report is told what is missing', () => {
  const result = configureStyle(catalog, '724', '10X', {});
  assert.equal(result.sku, '');
  assert.deepEqual(result.missing, ['Cover']);
});

test('options not listed for the exact style are ignored, trims and cushions are single choice', () => {
  const result = configureStyle(catalog, '724', '10X', { cover: 'D185559', options: ['MT', 'LW'] });
  assert.ok(!result.sku.includes('MT'));
  assert.deepEqual(toggleOption(['NB'], 'NH'), ['NH']);
  assert.deepEqual(toggleOption(['FS'], 'Z6'), ['Z6']);
  assert.deepEqual(toggleOption(['LW'], 'LW'), []);
});

test('every guide style can be configured (names resolve, companions parse)', () => {
  let count = 0;
  for (const row of catalog.style_index_2026.styles.filter((r) => r.kind === 'style')) {
    const choices = styleChoices(catalog, row.model, row.prefix);
    assert.ok(choices, `${row.prefix}${row.model}`);
    count += 1;
  }
  assert.ok(count > 700);
});
