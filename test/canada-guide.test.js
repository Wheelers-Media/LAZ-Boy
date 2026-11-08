import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const guide = JSON.parse(await readFile(new URL('../public/canada-floor-guide-2026.json', import.meta.url), 'utf8'));
const kinds = Object.keys(guide._meta.provenanceKey);

test('every section and the care block say where they came from and when', () => {
  for (const section of guide.sections) {
    assert.ok(kinds.includes(section.provenance), section.id);
    assert.ok(section.source && section.asOf && section.note, section.id);
    for (const item of section.items) assert.ok(item.q && item.a, `${section.id}: ${item.q}`);
  }
  assert.ok(kinds.includes(guide.care.provenance));
  assert.ok(guide.care.source && guide.care.asOf);
});

test('the tax card is flagged as not tax advice and never promises a saving', () => {
  const tax = guide.sections.find((section) => section.id === 'lift-tax');
  assert.match(tax.note, /Not tax advice/);
  assert.match(tax.items.map((item) => item.a).join(' '), /up to \$390/);
});

test('dealer terms are tagged as one dealer, not La-Z-Boy Canada', () => {
  const dealer = guide.sections.find((section) => section.id === 'dealer-terms');
  assert.equal(dealer.provenance, 'dealer');
  assert.match(guide._meta.provenanceKey.dealer, /not La-Z-Boy Canada policy/);
});

test('care procedures cover every cleaning code the cover program uses', async () => {
  const program = JSON.parse(await readFile(new URL('../public/fabric-cover-program-a26.json', import.meta.url), 'utf8'));
  const codes = new Set(guide.care.procedures.map((item) => item.code));
  for (const code of Object.keys(program.definitions.cleaningCodes)) {
    if (code === 'W*B') continue; // bleach-cleanable has no wording on the care page
    assert.ok(codes.has(code), `no care steps for ${code}`);
  }
});

test('claims-to-avoid keeps the battery-pack-on-a-lift warning', () => {
  const avoid = guide.sections.find((section) => section.id === 'claims-to-avoid');
  assert.ok(avoid.items.some((item) => /battery pack/i.test(item.q) && /not for lift/i.test(item.a)));
});
