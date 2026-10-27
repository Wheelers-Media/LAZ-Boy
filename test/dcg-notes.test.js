import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDcgNotes, DCG_NOTE_LIMIT } from '../src/logic.js';

const match = (overrides = {}) => ({ tier: 'B', code: '724', name: 'Trouper', capacity: '300 lb documented. Confirm the exact style.', capacityKnown: true, flags: [], ...overrides });
const input = (overrides = {}) => ({
  answers: { height: '5′8″', weight: '240', category: 'Recliners', household: ['Kids', 'Pets'], material_preference: 'Leather' },
  mechanism: 'Power recline',
  roomName: 'Standard room',
  sizeName: 'Small',
  matches: [match(), match({ code: '494', name: 'Collins' }), match({ code: '759', name: 'Maddox', capacity: 'Not in supplied data', capacityKnown: false })],
  ...overrides,
});

test('the DCG limit is 1,000 characters', () => {
  assert.equal(DCG_NOTE_LIMIT, 1000);
});

test('internal note carries the fit answers, the shortlist with model codes, and the RMS reminder', () => {
  const { internal } = buildDcgNotes(input());
  for (const expected of ['5′8″', 'Small', '240 lb', 'Recliners', 'Power recline', 'Standard room', 'Kids + Pets', 'Leather', 'Trouper 724', 'Collins 494', 'Maddox 759', 'RMS']) {
    assert.ok(internal.includes(expected), `internal note should include "${expected}"`);
  }
});

test('internal note says so when a capacity is not in the supplied data instead of implying it is fine', () => {
  const { internal } = buildDcgNotes(input());
  const maddox = internal.split('\n').find((line) => line.includes('Maddox'));
  assert.match(maddox, /not in the supplied data/i);
});

test('internal note keeps a fit-source disagreement flag next to its model', () => {
  const { internal } = buildDcgNotes(input({ matches: [match({ flags: ['Fit sources disagree for this model. Sit-test it and read the Product Index note.'] })] }));
  const trouper = internal.split('\n').find((line) => line.includes('Trouper'));
  assert.match(trouper, /disagree/i);
});

test('weight not given is stated as not given, never as zero or blank', () => {
  const { internal } = buildDcgNotes(input({ answers: { ...input().answers, weight: '' } }));
  assert.match(internal, /Weight: not given/);
  assert.doesNotMatch(internal, /Weight: (0|NaN|undefined|null)/);
});

test('customer note names the pieces worth sitting in but carries no weight, codes, tiers, capacities or prices', () => {
  const { customer } = buildDcgNotes(input());
  for (const expected of ['Trouper', 'Collins', 'Maddox', 'Small']) assert.ok(customer.includes(expected), `customer note should include "${expected}"`);
  assert.doesNotMatch(customer, /240|\blb\b|\b724\b|\b494\b|\b759\b/);
  assert.doesNotMatch(customer, /tier|capacity|supplied data|provisional|\$|price|in stock|available/i);
});

test('customer note never promises a fit', () => {
  const { customer } = buildDcgNotes(input());
  assert.match(customer, /sit/i);
  assert.doesNotMatch(customer, /perfect|guarantee|confirmed|will fit|fits you/i);
});

test('with no leads the internal note says so and the customer note leaves the list out', () => {
  const { internal, customer } = buildDcgNotes(input({ matches: [] }));
  assert.match(internal, /No lead in the supplied data/);
  assert.doesNotMatch(customer, /Worth sitting in/);
});

test('both notes stay within the DCG limit even with a very long shortlist, and keep the first model and the core facts', () => {
  const many = Array.from({ length: 40 }, (_, index) => match({ code: String(900 + index), name: `Long Model Name Number ${index}`, flags: ['Fit sources disagree for this model. Sit-test it and read the Product Index note.'] }));
  const { internal, customer } = buildDcgNotes(input({ matches: many }));
  assert.ok(internal.length <= DCG_NOTE_LIMIT, `internal is ${internal.length}`);
  assert.ok(customer.length <= DCG_NOTE_LIMIT, `customer is ${customer.length}`);
  assert.ok(internal.includes('Long Model Name Number 0 900'));
  assert.ok(internal.includes('Small') && internal.includes('RMS'));
  assert.ok(customer.includes('Long Model Name Number 0'));
});

test('household and material lines are omitted when there is nothing to say', () => {
  const { internal } = buildDcgNotes(input({ answers: { ...input().answers, household: [], material_preference: 'No preference yet' } }));
  assert.doesNotMatch(internal, /Household|Material/);
});

test('a stated need appears in both notes in the customer\'s terms, and nothing is added when none was picked', () => {
  const withNeed = buildDcgNotes(input({ answers: { ...input().answers, need: 'lift' } }));
  assert.match(withNeed.internal, /Needs: Help getting up/);
  assert.match(withNeed.customer, /What matters most: Help getting up/);
  for (const need of ['', 'unsure', undefined]) {
    const none = buildDcgNotes(input({ answers: { ...input().answers, need } }));
    assert.doesNotMatch(none.internal, /Needs:/);
    assert.doesNotMatch(none.customer, /What matters most/);
  }
});
