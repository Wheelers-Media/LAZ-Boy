import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildAvailability, checkCoverCode, checkStyleCode, classifyCode, prefixGaps } from '../src/logic/availability.js';

const read = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const list = await read('available-products-2026.json');
const styleIndex = (await read('style-index-2026.json')).styles;
const program = await read('fabric-cover-program-a26.json');
const availability = buildAvailability(list);

test('the list file matches the counts parsed from the supplied PDF', () => {
  assert.deepEqual(list._meta.counts, { styles: 329, covers: 993, comingSoon: 301 });
  assert.equal(availability.styles.size, 329);
  assert.equal(availability.covers.size, 993);
});

test('codes are classified with or without dashes, spaces and case', () => {
  assert.equal(classifyCode('44p-726').kind, 'style');
  assert.equal(classifyCode('44P 726').code, '44P726');
  assert.equal(classifyCode('b156175').kind, 'cover');
  assert.equal(classifyCode('LB121550').kind, 'cover');
  assert.equal(classifyCode('hello').kind, 'unknown');
});

test('a listed style is available, a coming-soon style says so, and an absent one is not listed', () => {
  assert.equal(checkStyleCode(availability, '44P-726', styleIndex).status, 'available');
  const soonOnly = [...availability.comingSoon].find((code) => !availability.styles.has(code));
  assert.equal(checkStyleCode(availability, soonOnly, styleIndex).status, 'coming-soon');
  assert.equal(checkStyleCode(availability, '999ZZZ', styleIndex).status, 'not-listed');
});

test('a listed style the app does not know is reported as such, never given a name', () => {
  const result = checkStyleCode(availability, '44P726', styleIndex);
  assert.equal(result.inApp, false);
  assert.equal(result.appName, '');
});

test('a cover splits into cover and colour and is looked up in the April program', () => {
  const some = program.fabrics[0];
  const color = some.colors[0];
  const result = checkCoverCode(availability, `${some.coverCode}${color}`, program);
  assert.equal(result.cover, some.coverCode);
  assert.equal(result.color, color);
  assert.equal(result.inProgram, true);
  assert.equal(result.patternName, some.patternName);
  assert.equal(checkCoverCode(availability, 'B156175', program).status, 'available');
});

test('prefix gaps only list prefixes the style index has no record for', () => {
  const known = new Set(styleIndex.map((row) => row.prefix));
  const gaps = prefixGaps(availability, styleIndex);
  assert.ok(gaps.length > 40);
  for (const gap of gaps) assert.ok(!known.has(gap.prefix), gap.prefix);
});
