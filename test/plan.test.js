import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildPlanNotes, coverSummary, finishTheSet, lineIssues, loadPlan, makeLine, NOTE_LIMIT, pieceType, rmsEntryText, savePlan, sortedLines } from '../src/plan.js';

const catalog = JSON.parse(await readFile(new URL('../public/catalog_data-v2.json', import.meta.url), 'utf8'));
catalog.style_index_2026 = JSON.parse(await readFile(new URL('../public/style-index-2026.json', import.meta.url), 'utf8'));
const date = new Date('2026-10-28T12:00:00');
const recliner = makeLine({ kind: 'sku', type: 'Recliner', modelName: 'Trouper', modelCode: '724', styleCode: '10X', coverCode: 'D185553', coverName: 'Novan Pebble', rms: ['10X724 D185553 FN 007'], source: 'sku' });
const sectional = makeLine({ kind: 'sectional', type: 'Sectional piece', modelName: 'Trouper', modelCode: '724', detail: 'L-shape, 3 pieces', coverCode: 'D185553', coverName: 'Novan Pebble', pieces: ['44A', '44C', '44B'], rms: ['44A-724 D185553', '44C-724 D185553', '44B-724 D185553'] });
const lead = makeLine({ kind: 'lead', type: 'Sofa', modelName: 'Paxton', modelCode: '663' });
const fit = { height: "5'8\"", weight: '240', need: 'effortless', mechanism: 'Power recline', household: ['Kids', 'Pets'], material: 'Leather' };

test('piece type comes from the guide category text', () => {
  assert.equal(pieceType('Left-Arm SITTING Chair'), 'Sectional piece');
  assert.equal(pieceType('90 Degree Corner Unit'), 'Sectional piece');
  assert.equal(pieceType('Power Rocking Recliner w/ Headrest'), 'Recliner');
  assert.equal(pieceType('Loveseat'), 'Loveseat');
  assert.equal(pieceType('Sofa'), 'Sofa');
  assert.equal(pieceType('Ottoman'), 'Ottoman');
  assert.equal(pieceType('Chair & a Half'), 'Chair');
  assert.equal(pieceType('Mystery'), 'Piece');
});

test('lines report what is still open instead of looking finished', () => {
  assert.deepEqual(lineIssues(lead), ['Style not chosen']);
  assert.deepEqual(lineIssues(makeLine({ kind: 'sku', modelName: 'X' })), ['Cover not chosen']);
  assert.deepEqual(lineIssues(recliner), []);
});

test('internal note leads with the count, lists every line, flags open items and ends with the RMS reminder', () => {
  const { internal } = buildPlanNotes({ customer: 'Sarah', lines: [recliner, sectional, lead], fit, date });
  assert.match(internal, /^PLAN Oct 28 · Sarah · 3 items/);
  for (const expected of ['Trouper 724', 'Paxton 663', '10X724 D185553', '44A, 44C, 44B', "5'8\"", '240 lb', 'kids + pets', 'style not chosen', 'RMS']) assert.ok(internal.includes(expected), `internal should include ${expected}`);
  assert.ok(internal.length <= NOTE_LIMIT);
});

test('customer note is a plain recap: no codes, weights, prices or promises', () => {
  const { customer } = buildPlanNotes({ customer: 'Sarah', lines: [recliner, sectional, lead], fit, date });
  assert.match(customer, /^Hi Sarah, thanks for coming in/);
  assert.ok(customer.includes('Trouper') && customer.includes('Paxton') && customer.includes('Novan Pebble'));
  assert.doesNotMatch(customer, /\b724\b|\b663\b|10X|D185553|240|\blb\b|\$|in stock|guarantee|will fit|perfect/i);
  assert.match(customer, /Pricing and delivery timing come with your quote/);
  assert.ok(customer.length <= NOTE_LIMIT);
});

test('both notes stay within the limit with a very long plan and keep the first lines and the next step', () => {
  const many = Array.from({ length: 40 }, (_, i) => makeLine({ kind: 'sku', type: 'Recliner', modelName: `Model number ${i}`, modelCode: String(100 + i), coverCode: 'D185553', rms: [`10X${100 + i} D185553 FN 007 DC FP P1 Z6 BP1`] }));
  const { internal, customer } = buildPlanNotes({ lines: many, fit, date });
  assert.ok(internal.length <= NOTE_LIMIT && customer.length <= NOTE_LIMIT);
  assert.match(internal, /^PLAN/); assert.match(internal, /Next: confirm/);
  assert.match(customer, /Next: sit in each piece/);
});

test('an empty plan still produces a valid, honest note', () => {
  const { internal, customer } = buildPlanNotes({ lines: [], date });
  assert.match(internal, /0 items/);
  assert.match(customer, /thanks for coming in/i);
});

test('finish the set offers the other stationary styles of the same collection and never what is already in the plan', () => {
  const sets = finishTheSet(catalog, [makeLine({ kind: 'lead', type: 'Sofa', modelName: 'Paxton', modelCode: '663', styleCode: '610' })]);
  const paxton = sets.find((entry) => entry.modelCode === '663');
  assert.ok(paxton, 'Paxton has other stationary styles');
  const prefixes = paxton.items.map((item) => item.prefix);
  assert.ok(prefixes.includes('630') && prefixes.includes('240'), 'loveseat and ottoman are offered');
  assert.ok(!prefixes.includes('610'), 'the sofa already in the plan is not offered again');
  assert.ok(paxton.items.every((item) => item.type !== 'Sectional piece'));
});

test('cover summary flags mixed or missing covers', () => {
  assert.equal(coverSummary([recliner, sectional]).mixed, false);
  assert.equal(coverSummary([recliner, makeLine({ kind: 'sku', coverCode: 'LB172856' })]).mixed, true);
  assert.equal(coverSummary([recliner, makeLine({ kind: 'sku' })]).missing, 1);
});

test('RMS entry text lists configured lines with quantity and names the ones still to configure', () => {
  const two = { ...recliner, qty: 2 };
  const { text, pending } = rmsEntryText([two, sectional, lead]);
  assert.match(text, /10X724 D185553 FN 007 {2}x2/);
  assert.match(text, /44C-724 D185553/);
  assert.deepEqual(pending, ['Paxton 663']);
});

test('sorted lines put the sectional first, then sofa, loveseat, recliner and chair', () => {
  assert.deepEqual(sortedLines([recliner, lead, sectional]).map((line) => line.kind), ['sectional', 'lead', 'sku']);
});

test('plan storage round-trips and survives blocked or corrupt storage', () => {
  const store = new Map();
  const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  savePlan(storage, { customer: 'Sarah', lines: [recliner] });
  assert.equal(loadPlan(storage).lines.length, 1);
  assert.deepEqual(loadPlan({ getItem: () => '{bad' }), { id: '', customer: '', lines: [], layout: null });
  assert.deepEqual(loadPlan({ getItem: () => { throw new Error('blocked'); } }), { id: '', customer: '', lines: [], layout: null });
  assert.doesNotThrow(() => savePlan({ setItem: () => { throw new Error('blocked'); } }, { customer: '', lines: [] }));
});

test('cover names come from the swatch index and are empty when the index does not know the cover', async () => {
  const { coverNameFor } = await import('../src/plan.js');
  assert.equal(coverNameFor({ D185553: { pattern_name: 'Novan', color_name: 'Pebble' } }, 'D185553'), 'Novan Pebble');
  assert.equal(coverNameFor({ D185553: { pattern_name: 'Novan' } }, 'D185553'), 'Novan');
  assert.equal(coverNameFor({}, 'D185553'), '');
  assert.equal(coverNameFor(null, 'D185553'), '');
});

test('adding the same configured line twice raises the quantity; a different line is added', async () => {
  const { addLine, lineFromSku, lineFromLead } = await import('../src/plan.js');
  const a = lineFromSku({ modelCode: '724', modelName: 'Trouper', styleCode: '10X', category: 'Power Rocking Recliner', sku: '10X724 D185553', coverCode: 'D185553' });
  const b = lineFromSku({ modelCode: '724', modelName: 'Trouper', styleCode: '10X', category: 'Power Rocking Recliner', sku: '10X724 D185553', coverCode: 'D185553' });
  const once = addLine({ customer: '', lines: [] }, a);
  const twice = addLine(once, b);
  assert.equal(twice.lines.length, 1); assert.equal(twice.lines[0].qty, 2); assert.equal(twice.merged, true);
  const other = addLine(twice, lineFromLead({ source: 'fit', modelCode: '663', modelName: 'Paxton', category: 'Sofa' }));
  assert.equal(other.lines.length, 2); assert.equal(other.lines[1].type, 'Sofa');
});
