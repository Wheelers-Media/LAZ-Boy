import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { decodeRmsSku } from '../src/logic.js';

const readJson = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const sourceLines = async (name) => (await readFile(new URL(`../data/source/${name}`, import.meta.url), 'utf8')).split('\n').filter((line) => line.trim() && !line.startsWith('#')).map((line) => line.split('|'));
const program = await readJson('fabric-cover-program-a26.json');
const catalog = await readJson('catalog_data-v2.json');
catalog.recliner_catalog_2026 = await readJson('recliner-catalog-2026.json');
catalog.motion_catalog_2026 = await readJson('motion-catalog-2026.json');
catalog.stationary_catalog_2026 = await readJson('stationary-catalog-2026.json');
catalog.designers_choice_catalog_2026 = await readJson('designers-choice-catalog-2026.json');
catalog.april_2026_model_cover_applications = await readJson('april-2026-model-cover-applications.json');
catalog.fabric_cover_program_a26 = program;

const prior = program.priorSeason;
const aprilCodes = new Set([...program.fabrics, ...program.leathers].map((record) => record.coverCode));
const modelNumber = (entry) => String(entry).trim().split(/\s+/)[0];

test('the prior season is labelled October 2025 and says it is not confirmed as current', () => {
  assert.equal(prior.label, 'October 2025');
  assert.match(prior.note, /not confirmed/i);
});

test('29 covers are in the October 2025 program but not the April 2026 one: 26 fabrics and 3 leathers', () => {
  const fabrics = new Set(prior.fabrics.map((record) => record.coverCode).filter((code) => !aprilCodes.has(code)));
  const leathers = new Set(prior.leathers.map((record) => record.coverCode).filter((code) => !aprilCodes.has(code)));
  assert.equal(fabrics.size, 26);
  assert.deepEqual([...leathers].sort(), ['FL1523', 'FL1963', 'LB1646']);
  assert.ok(fabrics.has('B1662') && fabrics.has('C1371'));
});

test('a prior-season record never repeats a colour that April still lists for the same cover', () => {
  for (const record of prior.fabrics) {
    const april = program.fabrics.find((item) => item.coverCode === record.coverCode);
    for (const color of record.colors) assert.ok(!april?.colors.includes(color), `${record.coverCode}${color} is already in April`);
  }
  for (const record of prior.leathers) {
    const models = (record.models || []).map(modelNumber);
    const april = program.leathers.filter((item) => item.coverCode === record.coverCode && (item.models || []).some((entry) => models.includes(modelNumber(entry))));
    for (const color of record.colors) assert.ok(!april.some((item) => item.colors.includes(color)), `${record.coverCode}${color} is already in April for that model`);
  }
});

test('every prior-season cover and colour comes from the October 2025 master sheets', async () => {
  const fabricPairs = new Set((await sourceLines('o25-fabrics.txt')).flatMap(([code, , colors]) => colors.split(' ').filter(Boolean).map((color) => `${code}|${color}`)));
  const leatherPairs = new Set((await sourceLines('o25-leathers.txt')).flatMap(([, code, , colors]) => colors.split(' ').filter(Boolean).map((color) => `${code}|${color}`)));
  for (const record of prior.fabrics) for (const color of record.colors) assert.ok(fabricPairs.has(`${record.coverCode}|${color}`), `${record.coverCode}${color}`);
  for (const record of prior.leathers) for (const color of record.colors) assert.ok(leatherPairs.has(`${record.coverCode}|${color}`), `${record.coverCode}${color}`);
});

test('colours April dropped from a cover it still lists are kept: Brink 25, Lynx 76, Jazz 39', () => {
  assert.deepEqual(prior.fabrics.find((record) => record.coverCode === 'B1827').colors, ['25']);
  assert.deepEqual(prior.fabrics.find((record) => record.coverCode === 'C1872').colors, ['76']);
  assert.deepEqual(prior.leathers.find((record) => record.coverCode === 'DL1962').colors, ['39']);
});

test('prior-season fabric records carry the same attributes as current ones', () => {
  for (const record of prior.fabrics) {
    assert.ok(record.patternName && record.colors.length, record.coverCode);
    assert.match(record.capCode, /^[A-Z]{2}$/, record.coverCode);
    assert.ok(program.definitions.wearability[record.wearability], `${record.coverCode} wearability ${record.wearability}`);
    assert.ok(program.definitions.cleaningCodes[record.cleaningCode], `${record.coverCode} cleaning ${record.cleaningCode}`);
  }
});

test('the decoder names an October-only cover and says it is from the October 2025 program', () => {
  const result = decodeRmsSku('10X-724 B166257', catalog);
  assert.equal(result.cover.program_pattern_name, 'Rodigo');
  assert.equal(result.cover.program_season, 'October 2025');
  assert.match(result.cover.program_note, /not on the April 2026 list/i);
});

test('the decoder still reports an April cover as April 2026', () => {
  const result = decodeRmsSku('10X-724 B153808', catalog);
  assert.equal(result.cover.program_pattern_name, 'Seamount');
  assert.equal(result.cover.program_season, 'April 2026');
});
