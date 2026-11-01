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

import { readFileSync } from 'node:fs';
import { lineFromPillow, lineIssues, addLine } from '../src/plan.js';

const guide = JSON.parse(readFileSync(new URL('../public/style-index-2026.json', import.meta.url), 'utf8')).styles;
const pillows = guide.filter((row) => row.prefix === '01P' || row.prefix === '08P');

test('the guide holds ten custom pillow styles, fabric covers only, FP the only listed option', () => {
  assert.equal(pillows.length, 10);
  pillows.forEach((row) => {
    assert.deepEqual(row.options, ['FP']);
    assert.ok(!row.capCodes.some((code) => ['LL', 'LS', 'LM', 'RL', 'BU', 'UE'].includes(code)), row.styleNumber);
  });
  assert.equal(pillows.filter((row) => /^\(1\)/.test(row.category)).length, 6, '5 x 01P plus the single 08P-201');
});

test('a pillow plan line names the style, size and pair, never invents an RMS entry, and merges repeats', () => {
  const style = pillows.find((row) => row.styleNumber === '08P220');
  const line = lineFromPillow({ style, featherlite: true });
  assert.equal(line.kind, 'pillow');
  assert.match(line.detail, /18 × 18 in · pair · Featherlite \(FP\)/);
  assert.deepEqual(line.rms, []);
  assert.deepEqual(lineIssues(line), ['Cover and entry to confirm in RMS']);
  const once = addLine({ id: '', customer: '', lines: [] }, line);
  const twice = addLine(once, lineFromPillow({ style, featherlite: true }));
  assert.equal(twice.lines.length, 1);
  assert.equal(twice.lines[0].qty, 2);
  assert.equal(addLine(twice, lineFromPillow({ style, featherlite: false })).lines.length, 2, 'plain and Featherlite are different lines');
});

import { layoutSnapshot, layoutShapes, loadPlan, savePlan } from '../src/plan.js';

test('a room layout is snapshotted, drawn as shapes, saved with the plan and reloaded', () => {
  const room = { width: 240, height: 168 };
  const items = [
    { code: '44C', name: 'Corner', free: false, x: 0, y: 0, width: 62, height: 62, baseWidth: 62, baseHeight: 62, rotation: 0 },
    { code: '10X724', name: 'Chair', free: true, x: 100, y: 40, width: 50, height: 50, baseWidth: 38, baseHeight: 40, rotation: 45 },
    { code: '10X724', name: 'Chair', free: true, x: 160, y: 40, width: 40, height: 38, baseWidth: 38, baseHeight: 40, rotation: 90 },
  ];
  const layout = layoutSnapshot(items, room);
  const model = layoutShapes(layout);
  assert.equal(model.shapes.length, 3);
  assert.equal(model.shapes[1].turn, 45);
  assert.deepEqual([model.shapes[2].width, model.shapes[2].height], [40, 38], 'a chair turned 90 degrees swaps width and depth');
  assert.equal(layoutShapes(null), null);
  assert.equal(layoutShapes({ room: { width: 0, height: 0 }, items: [] }), null);
  const store = new Map();
  const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  savePlan(storage, { id: '', customer: 'Sam', lines: [], layout });
  assert.deepEqual(loadPlan(storage).layout, layout);
  assert.equal(loadPlan({ getItem: () => JSON.stringify({ lines: [], layout: { junk: 1 } }) }).layout, null);
});
