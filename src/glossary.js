/** Lookup helpers for public/glossary-2026.json. Pure; no network. */
export const KIND_ORDER = ['term', 'cap', 'wear', 'clean', 'special', 'option', 'finish', 'dim', 'mech'];
export const KIND_LABELS = {
  term: 'The basics', cap: 'Cover cut and availability (cap codes)', wear: 'Wearability', clean: 'Cleaning codes', special: 'Special fabric features',
  option: 'Option codes', finish: 'Wood finishes', dim: 'Measurements', mech: 'Mechanisms',
};

export function indexGlossary(json) {
  const entries = Array.isArray(json?.entries) ? json.entries : [];
  const byKey = new Map();
  entries.forEach((entry) => byKey.set(`${entry.kind}:${String(entry.code).toUpperCase()}`, entry));
  return { entries, byKey };
}

export function lookupTerm(index, kind, code) {
  if (!index || code === undefined || code === null) return null;
  return index.byKey.get(`${kind}:${String(code).toUpperCase()}`) || null;
}

/** Entries whose term, code or text contain every word typed. Empty query returns everything in book order. */
export function searchGlossary(index, query) {
  const entries = index?.entries || [];
  const words = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return entries;
  return entries.filter((entry) => {
    const text = `${entry.code} ${entry.term} ${entry.plain} ${entry.pitch || ''}`.toLowerCase();
    return words.every((word) => text.includes(word));
  });
}

export function groupGlossary(entries) {
  return KIND_ORDER.map((kind) => ({ kind, label: KIND_LABELS[kind], items: entries.filter((entry) => entry.kind === kind) })).filter((group) => group.items.length);
}
