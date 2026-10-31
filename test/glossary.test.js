import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { indexGlossary, lookupTerm, searchGlossary, groupGlossary } from '../src/glossary.js';

const load = (name) => JSON.parse(readFileSync(new URL(`../public/${name}`, import.meta.url), 'utf8'));
const glossary = indexGlossary(load('glossary-2026.json'));
const styles = load('style-index-2026.json').styles.filter((row) => row.kind === 'style');
const program = load('fabric-cover-program-a26.json');

test('every cap code on any style has a glossary entry', () => {
  const caps = new Set(styles.flatMap((row) => row.capCodes || []));
  const missing = [...caps].filter((code) => !lookupTerm(glossary, 'cap', code));
  assert.deepEqual(missing, []);
});

test('every option code on any style has a glossary entry', () => {
  const options = new Set(styles.flatMap((row) => row.options || []));
  const missing = [...options].filter((code) => !lookupTerm(glossary, 'option', code));
  assert.deepEqual(missing, []);
});

test('every wood finish code in the guide has a glossary entry', () => {
  const codes = new Set(styles.flatMap((row) => [row.standardFinish?.code, ...(row.optionalFinishes || []).map((finish) => finish.code)]).filter(Boolean));
  const missing = [...codes].filter((code) => !lookupTerm(glossary, 'finish', code));
  assert.deepEqual(missing, []);
});

test('every wearability, cleaning and specialty marker on a cover has an entry', () => {
  const records = [...program.fabrics, ...program.leathers];
  const wear = new Set(records.map((record) => (record.wearability === 'Medium' ? 'M' : record.wearability)).filter(Boolean));
  const clean = new Set(records.map((record) => record.cleaningCode).filter(Boolean));
  const special = new Set(records.flatMap((record) => record.specialtyAttributes || []));
  assert.deepEqual([...wear].filter((code) => !lookupTerm(glossary, 'wear', code)), []);
  assert.deepEqual([...clean].filter((code) => !lookupTerm(glossary, 'clean', code)), []);
  assert.deepEqual([...special].filter((code) => !lookupTerm(glossary, 'special', code)), []);
});

test('every entry names its source and has plain text; gaps are flagged, not filled', () => {
  for (const entry of glossary.entries) {
    assert.ok(entry.source, `${entry.kind}:${entry.code} has no source`);
    assert.ok(entry.plain && entry.plain.length > 8, `${entry.kind}:${entry.code} has no plain text`);
  }
  assert.equal(lookupTerm(glossary, 'term', 'RMS').gap, true);
  assert.equal(lookupTerm(glossary, 'term', 'PREMIER-STANDARD').gap, true);
});

test('pillow cap-code limits come from the cover program rules, not hand-typed', () => {
  const blocked = program.businessRules.pillowsNotAllowedCapCodes;
  for (const code of blocked) assert.ok(lookupTerm(glossary, 'cap', code).caution, `${code} should warn about pillows`);
  assert.match(lookupTerm(glossary, 'option', 'FP').caution, new RegExp(blocked.join(', ')));
});

test('lookup is kind-aware so N means two different things', () => {
  assert.match(lookupTerm(glossary, 'wear', 'N').term, /Normal/);
  assert.match(lookupTerm(glossary, 'special', 'N').term, /Nanobionic/);
  assert.equal(lookupTerm(glossary, 'cap', 'ZZ'), null);
});

test('search finds by code and by words; groups keep book order', () => {
  assert.ok(searchGlossary(glossary, 'UR').some((entry) => entry.kind === 'cap' && entry.code === 'UR'));
  assert.ok(searchGlossary(glossary, 'featherlite').some((entry) => entry.code === 'FP'));
  assert.equal(searchGlossary(glossary, 'qqqqzzzz').length, 0);
  assert.equal(groupGlossary(glossary.entries)[0].kind, 'term');
});
