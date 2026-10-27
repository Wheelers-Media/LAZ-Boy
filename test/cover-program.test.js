import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readJson = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const program = await readJson('fabric-cover-program-a26.json');
const catalog = await readJson('catalog_data-v2.json');
const sourceFabricCodes = (await readFile(new URL('../data/source/a26-fabrics.txt', import.meta.url), 'utf8')).split('\n').filter((line) => line.trim() && !line.startsWith('#')).map((line) => line.split('|')[0]);

test('every listed fabric is in the app data once', () => {
  const codes = program.fabrics.map((fabric) => fabric.coverCode);
  assert.equal(new Set(codes).size, codes.length);
  assert.deepEqual([...codes].sort(), [...sourceFabricCodes].sort());
  assert.equal(codes.length, 161);
});

test('fabric records have a pattern, colors, cap, wearability and cleaning code', () => {
  for (const fabric of program.fabrics) {
    assert.ok(fabric.patternName, fabric.coverCode);
    assert.ok(fabric.colors.length > 0, fabric.coverCode);
    assert.match(fabric.capCode, /^[A-Z]{2}$/, fabric.coverCode);
    assert.ok(program.definitions.wearability[fabric.wearability], `${fabric.coverCode} wearability ${fabric.wearability}`);
    assert.ok(program.definitions.cleaningCodes[fabric.cleaningCode], `${fabric.coverCode} cleaning ${fabric.cleaningCode}`);
    for (const code of fabric.specialtyAttributes) assert.ok(program.definitions.specialtyAttributes[code], `${fabric.coverCode} attribute ${code}`);
  }
});

test('leather records are present with their type, cap code and colors', () => {
  assert.equal(program.leathers.length, 50);
  for (const leather of program.leathers) {
    assert.match(leather.coverCode, /^[A-Z]{2}\d{4}$/);
    assert.ok(program.definitions.leatherTypes[leather.leatherType], leather.coverCode);
    assert.ok(program.definitions.leatherGroups[leather.group], leather.coverCode);
    assert.ok(['LM', 'LL'].includes(leather.capCode), leather.coverCode);
    assert.ok(leather.colors.length > 0, leather.coverCode);
  }
});

test('every color code belongs to a documented color family', () => {
  const families = new Set(catalog.color_families.map((family) => family.digit));
  const colors = [...program.fabrics, ...program.leathers].flatMap((cover) => cover.colors);
  for (const color of colors) assert.match(color, /^\d{2}$/);
  for (const color of colors) assert.ok(families.has(color[0]), color);
});

test('every cap code used by a cover is documented', () => {
  const documented = new Set(catalog.cover_cap_codes.map((cap) => cap.code));
  for (const cover of [...program.fabrics, ...program.leathers]) assert.ok(documented.has(cover.capCode), `${cover.coverCode} ${cover.capCode}`);
});

test('color names only come from the catalog swatch list and match their codes', async () => {
  const names = JSON.parse(await readFile(new URL('../data/source/catalog-swatch-names.json', import.meta.url), 'utf8'));
  let named = 0;
  for (const record of [...program.fabrics, ...program.leathers]) {
    for (const [color, name] of Object.entries(record.colorNames || {})) {
      assert.ok(record.colors.includes(color), `${record.coverCode} names color ${color} it does not list`);
      assert.equal(name, names[record.coverCode + color]);
      named += 1;
    }
  }
  assert.ok(named > 250, `expected 250+ named colors, got ${named}`);
});
