import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { nextQuestion, pieceTypeOf, motionOf, baseOf, placeableRows } from '../src/guidedAdd.js';

const styles = JSON.parse(fs.readFileSync(new URL('../public/style-index-2026.json', import.meta.url), 'utf8')).styles;

test('the first question lists only types that exist, with counts', () => {
  const q = nextQuestion(styles, {});
  assert.equal(q.id, 'type');
  assert.ok(q.options.every((option) => option.count > 0));
  assert.ok(q.options.some((option) => option.value === 'Recliner'));
});

test('categories are read the way a salesperson would', () => {
  const row = (category) => ({ category, kind: 'style', dims: { width: 30, depth: 30 } });
  assert.equal(pieceTypeOf(row('Power Rocking Recliner w/ Headrest & Lumbar')), 'Recliner');
  assert.equal(motionOf(row('Power Rocking Recliner w/ Headrest & Lumbar')), 'Power with headrest and lumbar');
  assert.equal(motionOf(row('Rocking Recliner')), 'Manual');
  assert.equal(baseOf(row('Power Wall Recliner w/ Headrest')), 'Wall-hugger');
  assert.equal(pieceTypeOf(row('Queen Sleep Sofa')), 'Sleeper');
  assert.equal(pieceTypeOf(row('Storage Console')), '', 'modular parts are not free-standing choices');
});

test('answering narrows what is offered next and every answer leads to real styles', () => {
  let answers = {};
  for (let guard = 0; guard < 10; guard += 1) {
    const q = nextQuestion(styles, answers);
    assert.ok(q.options.length > 0, `question ${q.id} has options`);
    if (q.id === 'style') {
      assert.ok(q.options.every((option) => option.row.model === answers.model || q.answers.model === option.row.model));
      return;
    }
    answers = { ...q.answers, [q.id]: q.options[0].value };
  }
  assert.fail('never reached styles');
});

test('a question with one possible answer is skipped', () => {
  const q = nextQuestion(styles, { type: 'Ottoman' });
  assert.notEqual(q.id, 'motion');
  assert.notEqual(q.id, 'base');
});

test('every placeable style is reachable through the questions', () => {
  const rows = placeableRows(styles);
  assert.ok(rows.length > 400);
  const sample = rows[0];
  let answers = {};
  for (let guard = 0; guard < 10; guard += 1) {
    const q = nextQuestion(styles, answers);
    if (q.id === 'style') { assert.ok(q.options.some((option) => option.value === `${sample.prefix}${sample.model}`)); return; }
    const pick = q.options.find((option) => {
      if (q.id === 'type') return option.value === pieceTypeOf(sample);
      if (q.id === 'motion') return option.value === motionOf(sample);
      if (q.id === 'base') return option.value === (baseOf(sample) || 'Stationary');
      if (q.id === 'model') return option.value === sample.model;
      if (q.id === 'size') return nextQuestion(styles, { ...q.answers, size: option.value }).rows.some((row) => row === sample);
      return false;
    });
    assert.ok(pick, `no option leads to the sample at ${q.id}`);
    answers = { ...q.answers, [q.id]: pick.value };
  }
  assert.fail('never reached styles');
});
