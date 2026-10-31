import { depthMatchScore, heightInches, heightMatchScore, matchingPrefixes, positiveMeasurement, widthMatchScore } from './fitEngine.js';
import { getGuideStyleRows } from './guideIndex.js';

const SEAT_RANK = { in: 0, near: 1, out: 2 };

const scoreStatus = (score) => (score >= 1 ? 'in' : score > 0 ? 'near' : 'out');

const rangeStatus = (value, [low, high]) => (value >= low && value <= high ? 'in' : value >= low - 1 && value <= high + 1 ? 'near' : 'out');

/**
 * Screens one model's seat against the customer, using the seat dimensions in the April guide for the
 * style that matches their recline choice. Measurements they give are checked directly (knee gap, seat
 * height against the back of the knee, hip clearance); otherwise their height band sets the seat depth
 * and seat height range. A model with no seat dimensions comes back unscored, never as a fit.
 */
export function getSeatFit(catalog, research, { modelCode, answers, inches }) {
  // The first style, in the order the recline choice lists its prefixes (010 before 016, for example), that has seat dimensions.
  const order = matchingPrefixes(catalog, answers).map((prefix) => prefix.code);
  const dims = order.map((code) => getGuideStyleRows(catalog, modelCode).find((row) => row.prefix === code && Number.isFinite(row.dims?.seatDepth))).find(Boolean)?.dims;
  const unscored = { status: 'unscored', basis: '', checks: [] };
  if (!dims) return unscored;
  const thigh = positiveMeasurement(answers.thigh_length_inches);
  const popliteal = positiveMeasurement(answers.popliteal_height_inches);
  const hip = positiveMeasurement(answers.hip_breadth_inches);
  const checks = [];
  let basis = '';
  if (thigh !== null || popliteal !== null || hip !== null) {
    basis = 'measurements';
    if (thigh !== null) checks.push({ key: 'depth', label: 'Seat depth', chair: dims.seatDepth, target: `thigh length ${thigh} in`, status: scoreStatus(depthMatchScore(dims.seatDepth, thigh)) });
    if (popliteal !== null && Number.isFinite(dims.seatHeight)) checks.push({ key: 'height', label: 'Seat height', chair: dims.seatHeight, target: `back of knee ${popliteal} in`, status: scoreStatus(heightMatchScore(dims.seatHeight, popliteal)) });
    if (hip !== null && Number.isFinite(dims.seatWidth) && !(dims.seatFactor > 1)) checks.push({ key: 'width', label: 'Seat width', chair: dims.seatWidth, target: `hips ${hip} in`, status: scoreStatus(widthMatchScore(dims.seatWidth, hip)) });
  } else if (Number.isFinite(inches) && /recliner|lift/i.test(String(answers.category || ''))) {
    const band = (research?.fit_guidance_bands || []).find((item) => inches >= item.height_min_inches && inches <= (item.height_max_inches ?? Infinity));
    if (!band) return unscored;
    basis = band.band;
    checks.push({ key: 'depth', label: 'Seat depth', chair: dims.seatDepth, target: `${band.seat_depth_inches[0]}–${band.seat_depth_inches[1]} in`, status: rangeStatus(dims.seatDepth, band.seat_depth_inches) });
    if (Number.isFinite(dims.seatHeight)) checks.push({ key: 'height', label: 'Seat height', chair: dims.seatHeight, target: `${band.seat_height_inches[0]}–${band.seat_height_inches[1]} in`, status: rangeStatus(dims.seatHeight, band.seat_height_inches) });
  }
  if (!checks.length) return unscored;
  return { status: checks.reduce((worst, check) => (SEAT_RANK[check.status] > SEAT_RANK[worst] ? check.status : worst), 'in'), basis, checks };
}

export const SIT_VERDICTS = [
  { key: 'good', label: 'Fits well' },
  { key: 'too-deep', label: 'Seat too deep' },
  { key: 'too-shallow', label: 'Seat too shallow' },
  { key: 'too-high', label: 'Seat too high' },
  { key: 'too-low', label: 'Seat too low' },
  { key: 'too-tight', label: 'Too tight' },
  { key: 'not-for-them', label: 'Not for them' },
];

/** One logged sit test. Returns null for an unknown verdict or a missing model so bad input is never stored. */
export function buildSitEntry({ modelCode, modelName = '', inches, verdict, note = '', now = new Date() }) {
  if (!modelCode || !SIT_VERDICTS.some((item) => item.key === verdict)) return null;
  return {
    id: `${now.getTime()}-${String(modelCode)}`,
    date: now.toISOString().slice(0, 10),
    modelCode: String(modelCode),
    modelName,
    heightInches: Number.isFinite(inches) ? inches : null,
    verdict,
    note: String(note).trim().slice(0, 200),
  };
}

/** How sits went for a model overall, and for customers within two inches of this height. */
export function summarizeSitLog(entries, modelCode, inches) {
  const sits = entries.filter((item) => item.modelCode === String(modelCode));
  const near = Number.isFinite(inches) ? sits.filter((item) => Number.isFinite(item.heightInches) && Math.abs(item.heightInches - inches) <= 2) : [];
  const good = (list) => list.filter((item) => item.verdict === 'good').length;
  return { total: sits.length, good: good(sits), similar: { total: near.length, good: good(near) } };
}

export function sitLogToText(entries) {
  const label = (key) => SIT_VERDICTS.find((item) => item.key === key)?.label || key;
  return ['date\tmodel code\tmodel\theight in\tverdict\tnote', ...entries.map((item) => [item.date, item.modelCode, item.modelName, item.heightInches ?? '', label(item.verdict), item.note].join('\t'))].join('\n');
}

/**
 * What the app does and does not know about one model, as short chips for the Product Index.
 * state: 'ok' (documented), 'partial' (provisional or basis-only), 'none' (no data). Nothing is inferred.
 */
export function modelDataConfidence(catalog, research, modelCode, pricebookCheck) {
  const code = String(modelCode);
  const rows = getGuideStyleRows(catalog, code).filter((row) => row.status !== 'discontinued');
  const out = [];
  const dimmed = rows.filter((row) => row.dims);
  const check = pricebookCheck?.models?.[code];
  const conflicts = check?.conflicts || [];
  out.push({
    key: 'dimensions', label: 'Dimensions',
    state: dimmed.length ? (conflicts.length ? 'partial' : 'ok') : 'none',
    detail: !dimmed.length ? 'No dimensions in the supplied data.'
      : conflicts.length ? `Guide and price book differ: ${conflicts.map((c) => `${c.style} ${c.field} ${c.pricebook} vs ${c.guide}`).join('; ')}. Check the tear pad.`
      : check?.stylesChecked ? `${dimmed.length} style${dimmed.length === 1 ? '' : 's'} on file; ${check.dimsMatching} of ${check.stylesChecked} checked against the April 2026 price book.` : `${dimmed.length} style${dimmed.length === 1 ? '' : 's'} on file from the product guide.`,
  });
  const caps = new Set(rows.flatMap((row) => row.capCodes || []));
  const named = (catalog?.recliner_catalog_2026?.models || []).some((m) => String(m.code) === code && m.cover_collections?.length)
    || (catalog?.april_2026_model_cover_applications?.model_applications || []).some((m) => String(m.model_code) === code)
    || (catalog?.stationary_catalog_2026?.products || []).some((m) => String(m.model_code) === code);
  out.push({
    key: 'covers', label: 'Covers',
    state: named ? 'ok' : caps.size ? 'partial' : 'none',
    detail: named ? 'Named cover collections are listed for this model.' : caps.size ? `Grade level only (cap codes ${[...caps].join(', ')}). No named patterns for this model in the supplied data.` : 'No cover information in the supplied data.',
  });
  const profile = (catalog?.models_database || []).find((m) => String(m.model_code) === code);
  const claim = research?.model_fit_evidence?.[code]?.fit_claim;
  out.push({
    key: 'fit', label: 'Fit data',
    state: profile?.recommended_height ? 'ok' : claim ? 'partial' : 'none',
    detail: profile?.recommended_height ? `Scale ${profile.scale || 'not stated'}, height range ${profile.recommended_height}. Weight limit ${profile.weight_limit_lbs ? `${profile.weight_limit_lbs} lb` : 'not in the supplied data'}.`
      : claim ? 'Provisional fit guidance only (dealer source). Not a verified fit.' : 'No height or weight guidance. Do not describe this as a fit match.',
  });
  const hasSpotter = Boolean(profile?.quick_spotter || (catalog?.product_profiles || []).some((p) => String(p.model_code) === code && p.quick_spotter));
  out.push({ key: 'spotter', label: 'Spotter', state: hasSpotter ? 'ok' : 'none', detail: hasSpotter ? 'Look-alikes and a quick giveaway are on file.' : 'No look-alike or giveaway line on file.' });
  const pieces = (catalog?.product_profiles || []).some((p) => String(p.model_code) === code && p.pieces?.length);
  out.push({ key: 'pieces', label: 'Pieces', state: pieces ? 'ok' : 'none', detail: pieces ? 'Piece list from the tear pad.' : 'No tear-pad piece list.' });
  const statuses = rows.map((row) => row.status);
  const listed = check?.listed;
  out.push({
    key: 'pricebook', label: 'Price book',
    state: listed ? 'ok' : (pricebookCheck ? 'none' : 'none'),
    detail: !pricebookCheck ? 'Price book check not loaded.' : listed ? `Listed in the April 2026 Canadian price book${statuses.includes('new') ? ' (new)' : ''}. Confirm availability in RMS.` : 'Not found in the April 2026 price book. Do not treat as orderable until confirmed.',
  });
  return out;
}
