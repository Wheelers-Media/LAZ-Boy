// Rebuilds public/fabric-cover-program-a26.json from data/source/a26-fabrics.txt and a26-leathers.txt.
// Run: node scripts/import-a26-covers.mjs
import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('public/fabric-cover-program-a26.json');
const read = (name) => fs.readFileSync(path.resolve('data/source', name), 'utf8').split('\n').filter((line) => line.trim() && !line.startsWith('#'));
const list = (value) => (value ? value.split(' ').filter(Boolean) : []);
const codes = (value) => (value ? value.split(',').filter(Boolean) : []);

// Color names come from the swatch labels printed in the supplied catalogs (data/source/catalog-swatch-names.json).
const swatchNames = JSON.parse(fs.readFileSync(path.resolve('data/source/catalog-swatch-names.json'), 'utf8'));
const namesFor = (coverCode, colors) => {
  const found = Object.fromEntries(colors.filter((color) => swatchNames[coverCode + color]).map((color) => [color, swatchNames[coverCode + color]]));
  return Object.keys(found).length ? found : undefined;
};

const fabrics = read('a26-fabrics.txt').map((line) => {
  const [coverCode, patternName, colors, capCode, wearability, cleaningCode, specialty] = line.split('|');
  return { coverCode, patternName, colors: list(colors), colorNames: namesFor(coverCode, list(colors)), capCode, wearability, cleaningCode, specialtyAttributes: codes(specialty) };
});

const leathers = [];
for (const line of read('a26-leathers.txt')) {
  const [group, coverCode, patternName, colors, capCode, leatherType, model, specialty, note] = line.split('|');
  const key = `${group}|${coverCode}|${colors}`;
  let record = leathers.find((item) => item.key === key);
  if (!record) {
    record = { key, group, coverCode, patternName, colors: list(colors), capCode, leatherType, models: [], specialtyAttributes: codes(specialty), notes: [] };
    leathers.push(record);
  }
  if (model) record.models.push(model);
  if (note && !record.notes.includes(note)) record.notes.push(note);
}
for (const record of leathers) {
  delete record.key;
  record.colorNames = namesFor(record.coverCode, record.colors);
  if (!record.notes.length) delete record.notes;
}

const existing = JSON.parse(fs.readFileSync(target, 'utf8'));
const next = {
  ...existing,
  metadata: { ...existing.metadata, program: 'April 2026 Fabric & Leather Program', version: 'A26', lastUpdated: '2026-05-25', source: 'April 2026 Fabric & Leather List', recordScope: 'Fabric and leather records and attributes as listed in the April 2026 program. They do not establish current availability or model eligibility.' },
  definitions: {
    ...existing.definitions,
    wearability: { ...existing.definitions.wearability },
    leatherTypes: {
      Authentic: 'Pure, transparent dyes show the natural markings in each hide: wrinkles, scars and brands. Every Authentic leather has a protective topcoat.',
      Performance: 'Consistent color and subtle markings, made with embossing, corrective techniques and protective coatings that resist soil.',
      Nubuck: 'Infused with transparent dyes for subtle color variation without hiding the natural character of the hide.',
    },
    leatherGroups: {
      'Select Leather Reclining': 'Married leather with a urethane or vinyl match on specific reclining frames.',
      'Select Leather Stationary': 'Married leather with a urethane or vinyl match on specific stationary frames.',
      'Custom Leather Match': 'Custom leather with a urethane match on select frames.',
      'Custom Leather Plus': 'Custom leather available on most frames.',
      'Specialty Leather': 'Custom leather on most frames. Swatch sets must be requested and purchased.',
    },
  },
  fabrics,
  leathers,
};
// Keep arrays of plain strings on one line so the file stays readable.
const text = JSON.stringify(next, null, 2).replace(/\[\s*((?:"[^"\n]*",?\s*)+)\]/g, (_, body) => `[${body.trim().replace(/,\s+/g, ', ')}]`);
fs.writeFileSync(target, `${text}\n`);
console.log(`fabrics ${fabrics.length}, leathers ${leathers.length}`);
