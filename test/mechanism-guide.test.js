import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { describeMechanism, formatWallProximity, getLiftSeriesRatings, getMechanismForPrefix, getMechanismsForModel, getOptionBenefit } from '../src/logic.js';

const readJson = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const guide = await readJson('mechanism-guide-2026.json');
const styleIndex = await readJson('style-index-2026.json');
const catalog = { mechanism_guide_2026: guide, style_index_2026: styleIndex };

test('every mechanism feature reference resolves and carries a benefit', () => {
  for (const mechanism of guide.mechanisms) {
    assert.ok(mechanism.features.length > 0, mechanism.id);
    for (const id of mechanism.features) assert.ok(guide.features[id]?.benefit, `${mechanism.id} -> ${id}`);
  }
});

test('each prefix belongs to one mechanism and exists in the April style index', () => {
  const indexed = new Set(styleIndex.styles.filter((row) => row.kind === 'style').map((row) => row.prefix));
  const owner = new Map();
  for (const mechanism of guide.mechanisms) {
    for (const prefix of mechanism.prefixes) {
      assert.ok(indexed.has(prefix), `${prefix} is not in the style index`);
      assert.ok(!owner.has(prefix), `${prefix} is claimed by ${owner.get(prefix)} and ${mechanism.id}`);
      owner.set(prefix, mechanism.id);
    }
  }
});

test('lift series keep their documented tested limits and no mechanism invents a weight', () => {
  const lifts = Object.fromEntries(getLiftSeriesRatings(catalog).map((series) => [series.prefixes[0], series.limitLbs]));
  assert.deepEqual(lifts, { '3BL': 300, '1HM': 500, '1PL': 350 });
  for (const mechanism of guide.mechanisms) assert.ok(mechanism.weightTestedLbs === null || Number.isFinite(mechanism.weightTestedLbs), mechanism.id);
});

test('unlisted prefixes get no mechanism and nothing is inferred', () => {
  assert.equal(getMechanismForPrefix(catalog, '30L'), null);
  assert.equal(getMechanismForPrefix(catalog, 'ZZZ'), null);
  assert.equal(getMechanismForPrefix({}, '010'), null);
  assert.equal(describeMechanism(null), null);
});

test('mechanisms resolve per model from the guide styles', () => {
  const mechanisms = getMechanismsForModel(catalog, '724');
  assert.ok(mechanisms.length > 0);
  for (const mechanism of mechanisms) assert.ok(mechanism.modelPrefixes.length > 0 && mechanism.featureList.length > 0);
});

test('wall proximity and option benefits format as documented', () => {
  assert.equal(formatWallProximity([12, 18]), '12–18"');
  assert.equal(formatWallProximity([0, 0]), '0"');
  assert.equal(formatWallProximity(null), '');
  assert.match(getOptionBenefit(catalog, 'FS').benefit, /3 years/);
  assert.equal(getOptionBenefit(catalog, 'NOPE'), null);
});

test('recorded cross-source discrepancies are kept', () => {
  assert.ok(guide.crossSourceNotes.some((note) => /Lift capacity/.test(note.topic)));
  assert.ok(guide.crossSourceNotes.some((note) => /Platinum/.test(note.topic)));
});
