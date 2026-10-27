import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readJson = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const recliner = await readJson('recliner-catalog-2026.json');
const stationary = await readJson('stationary-catalog-2026.json');
const reclinerStyle = (model, prefix) => recliner.models.find((item) => item.code === model)?.styles.find(([code]) => code === prefix);

test('recliner options match the catalog pages', () => {
  assert.ok(!reclinerStyle('747', '10U')[2].includes('FN'));
  assert.ok(!reclinerStyle('747', '10X')[2].includes('FN'));
  assert.ok(reclinerStyle('803', '10X')[2].includes('RW'));
  assert.ok(reclinerStyle('725', 'P16')[2].includes('FN'));
});

test('Lennon 787 is listed with its five styles', () => {
  const lennon = recliner.models.find((item) => item.code === '787');
  assert.equal(lennon?.name, 'Lennon');
  assert.deepEqual(lennon.styles.map(([code]) => code), ['010', '10U', '10X', '016', '16X']);
});

test('Laurel 411 and Natalie 491 are listed in the stationary catalog', () => {
  const styles = (code) => stationary.products.find((item) => item.model_code === code).catalog_groups.flatMap((group) => group.styles.map((style) => style.style_code));
  assert.deepEqual(styles('411'), ['610-411', '655-411', '240-411']);
  assert.deepEqual(styles('491'), ['610-491', '510-491', '630-491', '230-491', '240-491']);
  assert.ok(stationary.index.some((item) => item.model_code === '411') && stationary.index.some((item) => item.model_code === '491'));
});
