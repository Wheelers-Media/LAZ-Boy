// Look up a style or cover code against the supplied "Available Products" list (public/available-products-2026.json).
// The list says a code was listed; it never says a model accepts a cover or that the code is orderable in Canada.

const clean = (value) => String(value || '').toUpperCase().replace(/[\s\-_.]/g, '');

export function buildAvailability(list) {
  return {
    meta: list?._meta || {},
    styles: new Set(list?.styles || []),
    covers: new Set(list?.covers || []),
    comingSoon: new Set(list?.comingSoon || []),
  };
}

/** 'style' for prefix+model (6 chars, e.g. 44P726), 'cover' for letters+digits (7 or 8 chars, e.g. B156175), else 'unknown'. */
export function classifyCode(input) {
  const code = clean(input);
  if (/^[A-Z]{1,2}\d{5,6}$/.test(code) && code.length >= 7) return { kind: 'cover', code };
  if (/^[0-9A-Z]{6}$/.test(code)) return { kind: 'style', code };
  return { kind: 'unknown', code };
}

/** Index the Summer/Fall 2025 reference (public/catalog-2025-reference.json) by style number. */
export function buildReference2025(reference) {
  const byStyle = new Map();
  for (const row of reference?.styles || []) byStyle.set(row.s, [...(byStyle.get(row.s) || []), row]);
  return { byStyle, prefixes: reference?.prefixes || {}, catalogs: reference?._meta?.catalogs || {} };
}

export function checkStyleCode(availability, code, styleIndex, reference2025) {
  const norm = clean(code);
  const listed = availability.styles.has(norm);
  const soon = availability.comingSoon.has(norm);
  const known = (styleIndex || []).find((row) => String(row.styleNumber).toUpperCase() === norm) || null;
  const prefix = norm.slice(0, 3);
  const prefixKnown = (styleIndex || []).some((row) => row.prefix === prefix);
  return {
    code: norm,
    prefix,
    model: norm.slice(3),
    status: soon && listed ? 'both' : soon ? 'coming-soon' : listed ? 'available' : 'not-listed',
    inApp: Boolean(known),
    appName: known?.name || '',
    appFamily: known?.family || '',
    prefixInApp: prefixKnown,
    prefixDefinition: reference2025?.prefixes?.[prefix]?.def || '',
    prefixSection: reference2025?.prefixes?.[prefix]?.section || '',
    in2025: (reference2025?.byStyle?.get(norm) || []).map((row) => ({ name: row.n, type: row.t, dims: row.d, catalog: reference2025.catalogs[row.c] || row.c, page: row.p, wql: Boolean(row.wql), new: Boolean(row.new), in26: row.in26 })),
  };
}

export function checkCoverCode(availability, code, program, swatchIndexHas) {
  const norm = clean(code);
  const cover = norm.slice(0, -2);
  const color = norm.slice(-2);
  const record = [...(program?.fabrics || []), ...(program?.leathers || [])].find((item) => item.coverCode === cover) || null;
  return {
    code: norm,
    cover,
    color,
    status: availability.covers.has(norm) ? 'available' : 'not-listed',
    inProgram: Boolean(record),
    patternName: record?.patternName || '',
    colorName: record?.colorNames?.[color] || '',
    colorInProgram: Boolean(record && record.colors.includes(color)),
    hasSwatchPhoto: Boolean(swatchIndexHas && swatchIndexHas(cover, color)),
  };
}

/** Prefixes on the available list that the app's style index has no record for, with how many listed codes use each. */
export function prefixGaps(availability, styleIndex, reference2025) {
  const known = new Set((styleIndex || []).map((row) => row.prefix));
  const counts = new Map();
  for (const code of availability.styles) {
    const prefix = code.slice(0, 3);
    if (!known.has(prefix)) counts.set(prefix, (counts.get(prefix) || 0) + 1);
  }
  return [...counts].map(([prefix, count]) => ({ prefix, count, definition: reference2025?.prefixes?.[prefix]?.def || '' })).sort((a, b) => b.count - a.count || a.prefix.localeCompare(b.prefix));
}
