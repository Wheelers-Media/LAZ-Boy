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

const parseFabrics = (file) => read(file).map((line) => {
  const [coverCode, patternName, colors, capCode, wearability, cleaningCode, specialty] = line.split('|');
  return { coverCode, patternName, colors: list(colors), colorNames: namesFor(coverCode, list(colors)), capCode, wearability, cleaningCode, specialtyAttributes: codes(specialty) };
});

const parseLeathers = (file) => {
const leathers = [];
for (const line of read(file)) {
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
return leathers;
};
const fabrics = parseFabrics('a26-fabrics.txt');
const leathers = parseLeathers('a26-leathers.txt');

// October 2025 records the April 2026 list no longer carries: whole covers, or colours dropped from a cover April still lists.
// Leathers are compared per model number because a cover code can sit on several models.
const modelNumber = (entry) => String(entry).trim().split(/\s+/)[0];
const priorFabrics = [];
for (const record of parseFabrics('o25-fabrics.txt')) {
  const april = fabrics.find((item) => item.coverCode === record.coverCode);
  const colors = record.colors.filter((color) => !april?.colors.includes(color));
  if (!colors.length) continue;
  const { colorNames, ...rest } = record;
  priorFabrics.push({ ...rest, colors, colorNames: namesFor(record.coverCode, colors), ...(april ? { droppedColorsOnly: true } : {}) });
}
const priorLeathers = [];
for (const record of parseLeathers('o25-leathers.txt')) {
  const aprilFor = (model) => leathers.filter((item) => item.coverCode === record.coverCode && (!model || item.models.some((entry) => modelNumber(entry) === modelNumber(model)))).flatMap((item) => item.colors);
  const units = record.models.length ? record.models.map((model) => ({ models: [model], taken: aprilFor(model) })) : [{ models: [], taken: aprilFor() }];
  const buckets = new Map();
  for (const unit of units) {
    const colors = record.colors.filter((color) => !unit.taken.includes(color));
    if (!colors.length) continue;
    const key = colors.join(' ');
    buckets.set(key, { colors, models: [...(buckets.get(key)?.models || []), ...unit.models], partial: unit.taken.length > 0 });
  }
  for (const { colors, models, partial } of buckets.values()) {
    const { colorNames, ...rest } = record;
    priorLeathers.push({ ...rest, colors, models, colorNames: namesFor(record.coverCode, colors), ...(partial ? { droppedColorsOnly: true } : {}) });
  }
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
  priorSeason: {
    label: 'October 2025',
    note: 'Covers and colours in the October 2025 program that the April 2026 list does not carry. Whether they can still be ordered is not confirmed. Confirm before offering one.',
    fabrics: priorFabrics,
    leathers: priorLeathers,
  },
};
// Keep arrays of plain strings on one line so the file stays readable.
const text = JSON.stringify(next, null, 2).replace(/\[\s*((?:"[^"\n]*",?\s*)+)\]/g, (_, body) => `[${body.trim().replace(/,\s+/g, ', ')}]`);
fs.writeFileSync(target, `${text}\n`);
console.log(`fabrics ${fabrics.length}, leathers ${leathers.length}, prior fabrics ${priorFabrics.length}, prior leathers ${priorLeathers.length}`);
