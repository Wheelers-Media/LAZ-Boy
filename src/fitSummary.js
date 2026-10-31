const TIER = { B: 'Research match (provisional lead)', C: 'Catalog match (kind of piece only)', S: 'Modular line' };

/** Plain-text hand-over of a fit session. States what each lead is and is not; promises no price, stock or order. */
export function buildFitSummary({ answers, sizeName = '', roomName = '', matches = [], customer = '' }) {
  const lines = [];
  lines.push(`La-Z-Boy fit summary${customer ? ` for ${customer}` : ''}`);
  lines.push('');
  lines.push(`Height: ${answers.height || 'not given'}${sizeName ? ` (${sizeName})` : ''}`);
  lines.push(`Weight: ${answers.weight ? `${answers.weight} lb` : 'not given'}`);
  lines.push(`Looking for: ${answers.category}${answers.mechanism ? ` · ${answers.mechanism}` : ''}`);
  if (roomName) lines.push(`Room: ${roomName}`);
  if (answers.household?.length) lines.push(`Household: ${answers.household.join(', ')}`);
  lines.push('');
  if (matches.length) {
    lines.push('Worth sitting in:');
    matches.forEach((match) => lines.push(`${match.rank}. ${match.name} (model ${match.code}) · ${TIER[match.tier] || 'Lead'} · capacity: ${match.capacity}`));
  } else {
    lines.push('No match for these answers. Nothing was loosened to fill the list.');
  }
  lines.push('');
  lines.push('These are leads to sit in, not a confirmed fit. Price, stock, delivery and orderability are not shown here; confirm them in the ordering system.');
  return lines.join('\n');
}

const toB64 = (text) => (typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(text))) : Buffer.from(text, 'utf8').toString('base64'));
const fromB64 = (text) => (typeof atob === 'function' ? decodeURIComponent(escape(atob(text))) : Buffer.from(text, 'base64').toString('utf8'));
const KEYS = ['height', 'weight', 'need', 'category', 'clearance', 'mechanism', 'cushion_preference', 'support_preference', 'household', 'material_preference'];

/** Answers → "#fit=..." so a result can be reopened from a link with no server. */
export function encodeFitLink(answers) {
  const slim = Object.fromEntries(KEYS.filter((key) => answers[key] !== undefined && answers[key] !== '').map((key) => [key, answers[key]]));
  return `#fit=${encodeURIComponent(toB64(JSON.stringify(slim)))}`;
}
/** Reads a "#fit=..." hash; returns only known keys of the right type, or null. */
export function decodeFitLink(hash) {
  const match = String(hash || '').match(/^#fit=(.+)$/);
  if (!match) return null;
  try {
    const data = JSON.parse(fromB64(decodeURIComponent(match[1])));
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    const out = {};
    for (const key of KEYS) {
      if (key === 'household') { if (Array.isArray(data[key]) && data[key].every((item) => typeof item === 'string')) out[key] = data[key]; }
      else if (typeof data[key] === 'string') out[key] = data[key].slice(0, 80);
    }
    return Object.keys(out).length ? out : null;
  } catch { return null; }
}
