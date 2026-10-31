import test from 'node:test';
import assert from 'node:assert/strict';
import { makeLine, duplicateLine, removeLine, restoreLine, lineFromSectional } from '../src/plan.js';
import { readSaved, writeSaved, clearSaved } from '../src/persist.js';

const plan = () => ({ customer: 'Sam', lines: [makeLine({ modelName: 'A' }), makeLine({ modelName: 'B' }), makeLine({ modelName: 'C' })] });

test('removeLine then restoreLine puts the line back in the same place', () => {
  const start = plan();
  const { plan: after, removed } = removeLine(start, start.lines[1].id);
  assert.deepEqual(after.lines.map((l) => l.modelName), ['A', 'C']);
  const back = restoreLine(after, removed);
  assert.deepEqual(back.lines.map((l) => l.modelName), ['A', 'B', 'C']);
  assert.equal(restoreLine(back, removed).lines.length, 3, 'restoring twice does not duplicate');
});

test('duplicateLine adds a copy with a new id right after the original', () => {
  const start = plan();
  const next = duplicateLine(start, start.lines[0].id);
  assert.deepEqual(next.lines.map((l) => l.modelName), ['A', 'A', 'B', 'C']);
  assert.notEqual(next.lines[0].id, next.lines[1].id);
  assert.equal(duplicateLine(start, 'missing'), start);
});

test('a sectional line keeps each piece name, code and size', () => {
  const line = lineFromSectional({ swatchIndex: {}, modelCode: '724', modelName: 'Test', pieces: ['44D'], pieceDetails: [{ name: 'Corner', code: '44D-724', size: '46 in' }] });
  assert.deepEqual(line.pieceDetails, [{ name: 'Corner', code: '44D-724', size: '46 in' }]);
});

test('saved work survives, and blocked storage does not crash', () => {
  const store = new Map();
  globalThis.window = { localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) } };
  assert.equal(writeSaved('x', { a: 1 }), true);
  assert.deepEqual(readSaved('x', null), { a: 1 });
  clearSaved('x');
  assert.equal(readSaved('x', 'none'), 'none');
  globalThis.window = { localStorage: { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } } };
  assert.equal(writeSaved('x', 1), false);
  assert.equal(readSaved('x', 'fallback'), 'fallback');
  delete globalThis.window;
});

import { saveCustomer, openCustomer, deleteCustomer, customerLabel } from '../src/plan.js';

test('saved customers: save, update in place, open, delete', () => {
  const p = { id: '', customer: 'Dana', lines: [makeLine({ modelName: 'A', qty: 2 })] };
  const first = saveCustomer([], p, 1000);
  assert.ok(first.plan.id);
  const again = saveCustomer(first.list, { ...first.plan, customer: 'Dana R' }, 2000);
  assert.equal(again.list.length, 1, 'same id updates, not duplicates');
  assert.equal(again.list[0].customer, 'Dana R');
  assert.deepEqual(openCustomer(again.list, first.plan.id).lines.length, 1);
  assert.equal(openCustomer(again.list, 'nope'), null);
  assert.deepEqual(customerLabel(again.list[0]), { name: 'Dana R', count: 2 });
  assert.equal(deleteCustomer(again.list, first.plan.id).length, 0);
});
