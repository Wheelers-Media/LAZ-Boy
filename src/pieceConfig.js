// Full configuration of one guide style for the Room Builder: cover, finish, options and the separate RMS line items.
// Everything comes from the April 2026 guide row for that exact style. Pure functions.
import { buildRmsSkuPreview } from './logic.js';
import { getGuideStyle } from './logic.js';

const TRIMS = ['NB', 'NH', 'NS'];
const CUSHIONS = ['FS', 'Z6', 'DC'];
const HANDLED_ELSEWHERE = ['FN', 'P1', 'P2']; // finish has its own picker; pillow covers are chosen in the SKU Builder
const splitCodes = (value) => String(value || '').split(/[,/;\s]+/).filter(Boolean);

/** What can be chosen for one style: finishes, options (with names) and companion line codes. */
export function styleChoices(catalog, modelCode, prefix) {
  const row = getGuideStyle(catalog, modelCode, prefix);
  if (!row) return null;
  const names = catalog.mechanism_guide_2026?.options || {};
  const fallback = Object.fromEntries((catalog.option_suffixes || []).map((item) => [item.code, item.name]));
  const finishes = row.options?.includes('FN') ? [...(row.standardFinish ? [{ ...row.standardFinish, standard: true }] : []), ...(row.optionalFinishes || [])] : [];
  const options = (row.options || []).filter((code) => !HANDLED_ELSEWHERE.includes(code)).map((code) => ({ code, name: names[code]?.name || fallback[code] || '' }));
  const companions = [['Swivel base', splitCodes(row.swivelBase)], ['Tall base', splitCodes(row.tallBase)], ['Battery pack', splitCodes(row.batteryPack)]].filter(([, codes]) => codes.length);
  return { row, finishes, options, companions, pillowsNeedBuilder: (row.options || []).some((code) => ['P1', 'P2', 'FP'].includes(code)) };
}

/** Toggle an option, keeping trims and cushions to one choice each. */
export function toggleOption(current, code) {
  if (current.includes(code)) return current.filter((entry) => entry !== code);
  const group = TRIMS.includes(code) ? TRIMS : CUSHIONS.includes(code) ? CUSHIONS : [];
  return [...current.filter((entry) => !group.includes(entry)), code];
}

/** The SKU and report details for a style and a configuration { cover, finish, options, companions }. */
export function configureStyle(catalog, modelCode, prefix, config = {}) {
  const choices = styleChoices(catalog, modelCode, prefix);
  if (!choices) return { sku: '', complete: false, missing: ['Style not in the guide'], details: null };
  const cover = String(config.cover || '');
  const match = cover.match(/^([A-Z]{1,3})(\d{4})(\d{2})$/);
  const wantsFinish = choices.finishes.length > 0;
  const finish = config.finish || (wantsFinish ? choices.finishes.find((item) => item.standard)?.code || '' : '');
  const allowed = new Set(choices.options.map((item) => item.code));
  const selected = (config.options || []).filter((code) => allowed.has(code));
  // Trim and cushion codes first, as the SKU Builder orders them, then the rest.
  const ordered = [...selected.filter((code) => TRIMS.includes(code)), ...selected.filter((code) => CUSHIONS.includes(code)), ...selected.filter((code) => !TRIMS.includes(code) && !CUSHIONS.includes(code))];
  const fields = buildRmsSkuPreview({ group: String(prefix), style: String(modelCode), grade: match?.[1] || '', pattern: match?.[2] || '', color: match?.[3] || '', finish, options: ordered, includeFinish: wantsFinish });
  const missing = [!match && 'Cover', wantsFinish && !finish && 'Finish'].filter(Boolean);
  const nameOf = (code) => choices.options.find((item) => item.code === code)?.name || '';
  const companionCodes = (config.companions || []).filter((code) => choices.companions.some(([, codes]) => codes.includes(code)));
  return {
    sku: fields.sku, complete: Boolean(fields.sku), missing,
    details: {
      cover: match ? { code: cover, name: config.coverName || '', material: config.coverMaterial || '', grade: match[1] } : null,
      finish: wantsFinish && finish ? { code: finish, name: choices.finishes.find((item) => item.code === finish)?.name || '' } : null,
      trim: ordered.find((code) => TRIMS.includes(code)) ? { code: ordered.find((code) => TRIMS.includes(code)), name: nameOf(ordered.find((code) => TRIMS.includes(code))) } : null,
      cushion: ordered.find((code) => CUSHIONS.includes(code)) ? { code: ordered.find((code) => CUSHIONS.includes(code)), name: nameOf(ordered.find((code) => CUSHIONS.includes(code))) } : null,
      options: ordered.filter((code) => !TRIMS.includes(code) && !CUSHIONS.includes(code)).map((code) => ({ code, name: nameOf(code) })),
      pillows: '',
      companions: choices.companions.flatMap(([label, codes]) => codes.filter((code) => companionCodes.includes(code)).map((code) => ({ label, code }))),
    },
  };
}

const GROUPS = [
  ['Comfort handle', 'Which handle does the customer want?', ['ES', 'H1', 'H3', '1H', '3H', '2E', 'LS', 'LE', 'L1', 'L3']],
  ['Controls', 'How should it be controlled?', ['HW', 'LW', 'LT', 'RW', 'W2']],
  ['Base and legs', 'Any change to the base or legs?', ['SW', 'SL', 'LG', '4C']],
  ['Seat cushion', 'Any cushion upgrade?', ['FS', 'Z6', 'DC']],
  ['Nailhead trim', 'Nailhead trim?', ['NB', 'NH', 'NS']],
  ['Console and charging', 'Console features?', ['CB', 'CC', 'CM']],
  ['Mattress', 'Sleeper mattress?', ['MA', 'MT']],
];

/** Options of one style sorted into plain-language groups. Anything the groups do not know goes under "More". */
export function optionGroups(options) {
  const placed = new Set();
  const groups = GROUPS.map(([title, question, codes]) => {
    const items = options.filter((option) => codes.includes(option.code));
    items.forEach((option) => placed.add(option.code));
    return { title, question, items };
  }).filter((group) => group.items.length);
  const rest = options.filter((option) => !placed.has(option.code));
  if (rest.length) groups.push({ title: 'More', question: 'Anything else?', items: rest });
  return groups;
}
