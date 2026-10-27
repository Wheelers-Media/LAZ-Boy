import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getSectionalLeads } from '../src/logic.js';

const catalog = JSON.parse(await readFile(new URL('../public/catalog_data-v2.json', import.meta.url), 'utf8'));
const names = (answers) => getSectionalLeads(catalog, answers).map((lead) => lead.model_name);
const profileFamilies = Object.fromEntries(catalog.product_profiles.filter((p) => p.pieces?.length).map((p) => [p.model_name, p.sectional_family]));

test('a stationary sectional comes only from stationary modular models', () => {
  const found = names({ mechanism: 'No reclining mechanism' });
  assert.ok(found.length > 0);
  for (const name of found) assert.equal(profileFamilies[name], 'Stationary', name);
  assert.ok(found.includes('Collins') && found.includes('Charlie'));
});

test('a manual reclining sectional comes only from La-Z-Time, the family with non-power pieces', () => {
  const found = names({ mechanism: 'Manual' });
  assert.ok(found.includes('Ava'));
  for (const name of found) assert.equal(profileFamilies[name], 'La-Z-Time', name);
});

test('a power reclining sectional includes La-Z-Time and La-Z-Motion, never stationary', () => {
  const found = names({ mechanism: 'Power recline' });
  assert.ok(found.includes('Ava') && found.includes('Acadia'));
  for (const name of found) assert.notEqual(profileFamilies[name], 'Stationary', name);
});

test('each lead says which family it belongs to and how many pieces the studio has for it', () => {
  for (const lead of getSectionalLeads(catalog, { mechanism: 'Power recline' })) {
    assert.ok(['La-Z-Time', 'La-Z-Motion'].includes(lead.family));
    assert.ok(lead.pieceCount > 0);
    assert.ok(lead.model_code);
  }
});

test('mechanisms with no modular sectional return nothing rather than something near', () => {
  assert.deepEqual(getSectionalLeads(catalog, { mechanism: 'Lift chair' }), []);
});
