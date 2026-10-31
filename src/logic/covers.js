import { GUIDE_RESTRICTED_FAMILY, getGuideStyle, getGuideStyleRows, leatherBandOpen } from './guideIndex.js';
import { RESTRICTED_DUTY_CATEGORY } from './productIndex.js';

/**
 * Every full cover (grade + pattern + colour) a model can be built with, from the supplied catalogs and the April 2026 cover program.
 * `basis` says how each one was matched: "listed" (the model's own catalog page or leather list) or "cap code" (the model accepts that cap code).
 * Eligibility for the exact style still has to be confirmed before it is promised.
 */
export function getModelCoverSwatches(catalog, modelCode, prefix) {
  const code = String(modelCode);
  const guideRows = getGuideStyleRows(catalog, modelCode);
  const guideRow = prefix ? guideRows.find((row) => row.prefix === String(prefix)) : null;
  const guideCaps = new Set((guideRow ? [guideRow] : guideRows).flatMap((row) => row.capCodes));
  const guided = guideRows.length > 0;
  if (!guided && catalog?.style_index_2026?.styles?.length) return [];
  const program = catalog?.fabric_cover_program_a26;
  const found = new Map();
  const add = (entry) => { if (entry?.code && !found.has(entry.code)) found.set(entry.code, entry); };
  const parse = (full) => { const match = String(full).match(/^([A-Z]{1,3})(\d{4})(\d{2})$/); return match ? { grade: match[1], pattern: match[2], color: match[3] } : null; };
  const programByPattern = new Map();
  for (const record of [...(program?.fabrics || []), ...(program?.leathers || [])]) programByPattern.set(String(record.patternName || '').toLowerCase(), [...(programByPattern.get(String(record.patternName || '').toLowerCase()) || []), record]);
  const capName = (cap) => (catalog?.cover_cap_codes || []).find((entry) => entry.code === cap && !/^[A-Z]{2} cap code$/.test(entry.name))?.name || `${cap} cap code`;
  const kindOf = (record, material) => (record.leatherType ? `${record.leatherType} leather` : material === 'Leather' ? 'Leather' : capName(record.capCode));
  const fromRecord = (record, basis, material) => (record.colors || []).forEach((color) => {
    const full = `${record.coverCode}${color}`;
    const parts = parse(full);
    if (!parts) return;
    add({ code: full, ...parts, patternName: record.patternName || '', colorName: record.colorNames?.[color] || '', name: `${record.patternName || record.coverCode}${record.colorNames?.[color] ? ` ${record.colorNames[color]}` : ''}`, capCode: record.capCode, kind: kindOf(record, material), material, wearability: record.wearability || '', cleaning: record.cleaningCode || '', basis, note: material });
  });

  // 1. Covers the model's own catalog page names, with colours.
  const stationary = catalog?.stationary_catalog_2026?.products?.find((item) => String(item.model_code) === code);
  for (const group of stationary?.catalog_groups || []) for (const collection of group.fabric_collections || []) for (const [full, name] of collection.swatches || []) {
    const parts = parse(full);
    if (parts) add({ code: full, ...parts, patternName: collection.name, colorName: name, name: `${collection.name} ${name}`, material: 'Fabric', basis: 'listed', note: 'Fabric' });
  }
  const reclinerModel = catalog?.recliner_catalog_2026?.models?.find((item) => String(item.code) === code);
  for (const name of reclinerModel?.cover_collections || []) for (const record of programByPattern.get(String(name).toLowerCase()) || []) if (!guided || guideCaps.has(record.capCode)) fromRecord(record, 'listed', record.group ? 'Leather' : 'Fabric');
  for (const record of program?.leathers || []) {
    const named = (record.models || []).some((entry) => String(entry).trim().split(/\s+/)[0] === code);
    const anyCap = guided && (record.models || []).some((entry) => /^any\b/i.test(String(entry).trim()));
    if (guided && !leatherBandOpen(record, guideRow ? [guideRow] : guideRows)) continue;
    if ((named && (!guided || guideCaps.has(record.capCode))) || (anyCap && guideCaps.has(record.capCode))) fromRecord(record, anyCap && !named ? 'cap code' : 'listed', 'Leather');
  }

  // 2. Fabrics the model accepts by cap code.
  const caps = new Set();
  const designer = catalog?.designers_choice_catalog_2026?.model_cover_cap_choices?.filter((entry) => String(entry.model_code) === code) || [];
  designer.forEach((entry) => (entry.codes || []).forEach((cap) => caps.add(cap)));
  for (const group of stationary?.catalog_groups || []) Object.values(group.cover_cap_choices || {}).flat().forEach((cap) => caps.add(cap));
  const motionEntry = catalog?.motion_catalog_2026?.index?.find((item) => String(item.code) === code);
  if (reclinerModel) (catalog.recliner_catalog_2026.cover_cap_choices || []).forEach((entry) => entry.codes.forEach((cap) => caps.add(cap)));
  if (motionEntry) (catalog.motion_catalog_2026.cover_cap_choices || []).forEach((entry) => entry.codes.forEach((cap) => caps.add(cap)));
  const category = catalog?.models_database?.find((item) => String(item.model_code) === code)?.category || '';
  const flags = motionEntry?.categories || {};
  const restrictedDuty = guided ? guideRows.some((row) => GUIDE_RESTRICTED_FAMILY.test(row.family)) : Boolean(reclinerModel) || flags.recliner || flags.power_recline || flags.modular || RESTRICTED_DUTY_CATEGORY.test(category);
  for (const record of program?.fabrics || []) {
    if (!(guided ? guideCaps : caps).has(record.capCode)) continue;
    if (restrictedDuty && record.wearability === 'Medium') continue;
    fromRecord(record, 'cap code', 'Fabric');
  }
  return [...found.values()];
}

/** One plain line on why a cover is offered for an exact style: its cap code is on that style's row in the April guide, or it is on the model's own list. */
export function describeCoverEligibility(catalog, modelCode, prefix, swatch) {
  if (!swatch) return '';
  const row = prefix ? getGuideStyle(catalog, modelCode, prefix) : null;
  if (row && swatch.capCode && row.capCodes.includes(swatch.capCode)) return `Cap code ${swatch.capCode} is on the ${prefix} style list for this model.`;
  if (swatch.basis === 'listed') return 'Listed for this model.';
  return 'Not confirmed for this style. Check it in RMS before offering it.';
}

/**
 * Which guide styles accept a fabric or leather record: its cap code must be on the style's row (leathers also need the style sold in
 * that leather's price band, and a leather that names models is limited to them). Medium-duty fabrics are left off recliner, motion,
 * modular and lift styles. Returns [{ model, name, styles }] sorted by name. Eligibility still has to be confirmed for the exact order.
 */
export function getCoverReach(catalog, record, isLeather = false) {
  const rows = (catalog?.style_index_2026?.styles || []).filter((row) => row.kind === 'style');
  const named = new Set(isLeather ? (record.models || []).filter((entry) => !/^any\b/i.test(String(entry).trim())).map((entry) => String(entry).trim().split(/\s+/)[0]) : []);
  const anyCap = isLeather && (record.models || []).some((entry) => /^any\b/i.test(String(entry).trim()));
  const byModel = new Map();
  for (const row of rows) {
    if (!row.capCodes.includes(record.capCode)) continue;
    if (!isLeather && record.wearability === 'Medium' && GUIDE_RESTRICTED_FAMILY.test(row.family)) continue;
    if (isLeather) {
      if (!leatherBandOpen(record, [row])) continue;
      if (named.size && !anyCap && !named.has(row.model)) continue;
      if (!named.size && !anyCap) continue;
    }
    const entry = byModel.get(row.model) || { model: row.model, name: row.name ? row.name.charAt(0) + row.name.slice(1).toLowerCase() : row.model, styles: 0 };
    entry.styles += 1;
    byModel.set(row.model, entry);
  }
  return [...byModel.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// What a grade letter holds for one model. The letter is a price tier; the kind of cover is its cap code or leather type.
// Price-book price columns (April 2026 Upholstery Pricebook): fabric B-C, D-F, G-N, P-Q; leather BL, DL, FL, HL. Each band is priced above the one before it.
const FABRIC_BANDS = [['B', 'C'], ['D', 'F'], ['G', 'N'], ['P', 'Q']];

const LEATHER_BANDS = ['BL', 'DL', 'FL', 'HL'];

/** Short plain-language title for a cover grade letter, e.g. { short: 'D · Fabric · price band D–F', line: '...' }. Only what the price book documents; a letter outside its bands gets no price claim. */
export function describeGrade(grade, material = 'Fabric') {
  const g = String(grade || '').toUpperCase();
  if (!g) return { short: '', line: '' };
  if (g === 'LB') return { short: 'LB · Select leather', line: 'LB covers are Select leather, priced in the Select leather column of the price book.' };
  if (LEATHER_BANDS.includes(g)) {
    const rank = LEATHER_BANDS.indexOf(g);
    return { short: `${g} · Leather · price band ${g}`, line: `${g} is a leather price band. Leather bands run BL, DL, FL, HL, each priced above the one before${rank === 0 ? ' (BL is the lowest)' : rank === LEATHER_BANDS.length - 1 ? ' (HL is the highest)' : ''}.` };
  }
  const band = FABRIC_BANDS.find(([lo, hi]) => g.length === 1 && g >= lo && g <= hi);
  if (band) {
    const range = `${band[0]}–${band[1]}`;
    return { short: `${g} · ${material === 'Leather' ? 'Leather' : 'Fabric'} · price band ${range}`, line: `Grade ${g} is in the ${range} fabric price band. Fabrics price in four bands (B–C, D–F, G–N, P–Q), each above the one before.` };
  }
  return { short: `${g} · ${material}`, line: `Grade ${g} is not in a price band in the supplied price book.` };
}

export function summarizeGradeKinds(swatches, grade) {
  const patternsByKind = new Map();
  for (const swatch of swatches) {
    if (swatch.grade !== grade) continue;
    const kind = swatch.kind || swatch.material || 'Fabric';
    patternsByKind.set(kind, new Set([...(patternsByKind.get(kind) || []), swatch.pattern]));
  }
  return [...patternsByKind].map(([kind, patterns]) => ({ kind, patterns: patterns.size })).sort((a, b) => b.patterns - a.patterns || a.kind.localeCompare(b.kind));
}

/** Index public/swatch-manifest.json by 8-character cover id (cover code + colour code). Entries whose names disagree with the website are left out. */
export function buildSwatchIndex(manifest) {
  const index = {};
  for (const item of manifest?.swatches || []) {
    if (item.name_check === 'mismatch') continue;
    index[`${item.cover_code}${item.color_code}`] = item;
  }
  return index;
}

/** Local swatch image path for a cover + colour, or null when there is no verified image. `size` is 'thumb' (240px) or 'zoom' (450px). Pass the full 8-character code as `coverCode` or the cover code and colour code separately. */
export function swatchImageFor(index, coverCode, colorCode = '', size = 'zoom') {
  const entry = index?.[`${coverCode}${colorCode}`];
  if (!entry) return null;
  return (size === 'thumb' ? entry.local_thumb || entry.local_zoom : entry.local_zoom || entry.local_thumb) || null;
}
