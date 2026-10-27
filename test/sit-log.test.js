import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSitEntry, SIT_VERDICTS, sitLogToText, summarizeSitLog } from '../src/logic.js';

const entry = (overrides = {}) => buildSitEntry({ modelCode: '769', modelName: 'Ava', inches: 67, verdict: 'good', note: '', now: new Date('2026-10-27T12:00:00Z'), ...overrides });

test('an entry keeps the model, the height, the verdict and the date', () => {
  const made = entry({ note: 'Liked the headrest' });
  assert.equal(made.modelCode, '769');
  assert.equal(made.heightInches, 67);
  assert.equal(made.verdict, 'good');
  assert.equal(made.date, '2026-10-27');
  assert.equal(made.note, 'Liked the headrest');
  assert.ok(made.id);
});

test('an unknown verdict or a missing model is refused instead of stored', () => {
  assert.equal(entry({ verdict: 'great' }), null);
  assert.equal(entry({ modelCode: '' }), null);
});

test('a note is trimmed and capped so one entry cannot swell the log', () => {
  assert.equal(entry({ note: `  ${'x'.repeat(500)}  ` }).note.length, 200);
});

test('verdicts cover good and the ways a seat can be wrong', () => {
  const keys = SIT_VERDICTS.map((item) => item.key);
  for (const key of ['good', 'too-deep', 'too-shallow', 'too-high', 'too-low', 'too-tight', 'not-for-them']) assert.ok(keys.includes(key), key);
});

test('the summary counts sits for the model and, separately, for people within two inches of this height', () => {
  const log = [entry(), entry({ inches: 68, verdict: 'too-deep' }), entry({ inches: 75, verdict: 'good' }), entry({ modelCode: '724', modelName: 'Trouper' })];
  const summary = summarizeSitLog(log, '769', 67);
  assert.deepEqual(summary, { total: 3, good: 2, similar: { total: 2, good: 1 } });
  assert.deepEqual(summarizeSitLog(log, '999', 67), { total: 0, good: 0, similar: { total: 0, good: 0 } });
});

test('the log copies out as tab-separated text with a header row', () => {
  const text = sitLogToText([entry({ note: 'ok' })]);
  const [head, row] = text.split('\n');
  assert.equal(head, 'date\tmodel code\tmodel\theight in\tverdict\tnote');
  assert.equal(row, '2026-10-27\t769\tAva\t67\tFits well\tok');
});
