// Guided "what are you adding?" questions for the Room Builder. Each question shows only answers that exist in the
// April 2026 guide for the answers given so far, and a question with a single possible answer is skipped.
// Everything is read from the style-index rows (category text and dimensions); nothing is inferred beyond that.

/** The kind of piece a free-standing guide row is, or '' for modular parts (corners, chaises, consoles) which come from the collection pieces. */
export function pieceTypeOf(row) {
  const text = `${row.category || ''}`;
  if (/ottoman/i.test(text)) return 'Ottoman';
  if (row.family === 'LIFT' || /lift/i.test(text)) return 'Lift chair';
  if (/sleep/i.test(text)) return 'Sleeper';
  if (/sofa/i.test(text)) return 'Sofa';
  if (/loveseat/i.test(text)) return 'Loveseat';
  if (/corner|chaise|console|sectional|armless|left-arm|right-arm/i.test(text)) return '';
  if (/reclin|recliner/i.test(text)) return 'Recliner';
  if (/chair|glider|swivel/i.test(text)) return 'Chair';
  return '';
}

export function motionOf(row) {
  const text = `${row.category || ''}`;
  if (/lumbar/i.test(text)) return 'Power with headrest and lumbar';
  if (/headrest/i.test(text)) return 'Power with headrest';
  if (/power/i.test(text)) return 'Power';
  if (/recliner|reclining|lift/i.test(text)) return 'Manual';
  return '';
}

export function baseOf(row) {
  const text = `${row.category || ''}`;
  if (/wall/i.test(text)) return 'Wall-hugger';
  if (/swivel/i.test(text)) return 'Swivel';
  if (/glid/i.test(text)) return 'Glider';
  if (/rock/i.test(text)) return 'Rocker';
  return '';
}

const MOTION_TYPES = ['Recliner', 'Sofa', 'Loveseat', 'Lift chair'];
const QUESTIONS = {
  type: 'What are you adding?',
  motion: 'How should it move?',
  base: 'How much room is there behind it?',
  size: 'How wide a piece fits the space?',
};
const BASE_LABEL = { 'Wall-hugger': 'Wall-hugger · needs little room behind', Rocker: 'Rocker · needs room behind', Glider: 'Glider · needs room behind', Swivel: 'Swivel · needs room around' };

/** Rows a customer could place on their own: a known type and a listed size. */
export function placeableRows(styles) {
  return styles.filter((row) => row.kind === 'style' && row.dims?.width > 0 && row.dims?.depth > 0 && pieceTypeOf(row));
}

const count = (rows, pick) => { const map = new Map(); rows.forEach((row) => { const key = pick(row); if (key) map.set(key, (map.get(key) || 0) + 1); }); return map; };

/** Three width bands cut from the rows themselves, so every band has pieces and the inch ranges are the guide's own. */
export function sizeBands(rows) {
  const widths = rows.map((row) => row.dims.width).sort((a, b) => a - b);
  if (new Set(widths).size < 3) return [];
  const low = widths[Math.floor(widths.length / 3) - 1];
  const high = widths[Math.floor((2 * widths.length) / 3) - 1];
  if (!(low < high)) return [];
  return [
    { value: 'small', label: `${low} in wide or less`, test: (w) => w <= low },
    { value: 'mid', label: `Over ${low} to ${high} in wide`, test: (w) => w > low && w <= high },
    { value: 'large', label: `More than ${high} in wide`, test: (w) => w > high },
  ].filter((band) => rows.some((row) => band.test(row.dims.width)));
}

/** The rows that fit the answers given so far. */
export function applyAnswers(rows, answers) {
  let list = rows;
  if (answers.type) list = list.filter((row) => pieceTypeOf(row) === answers.type);
  if (answers.motion) list = list.filter((row) => motionOf(row) === answers.motion);
  if (answers.base) list = list.filter((row) => (baseOf(row) || 'Stationary') === answers.base);
  if (answers.size) { const band = sizeBands(list).find((entry) => entry.value === answers.size); if (band) list = list.filter((row) => band.test(row.dims.width)); }
  return list;
}

/**
 * The next thing to ask, given the answers so far. Returns { id, question, options: [{ value, label, count }], rows }.
 * `id` is 'type', 'motion', 'base', 'size', then 'model' and 'style' once the questions are answered.
 */
export function nextQuestion(styles, answers) {
  let rows = placeableRows(styles);
  const filled = { ...answers };
  const ask = (id, options) => ({ id, question: QUESTIONS[id], options, rows, answers: filled });
  for (const id of ['type', 'motion', 'base', 'size']) {
    rows = applyAnswers(placeableRows(styles), { ...filled, size: undefined });
    if (filled[id]) continue;
    let options = [];
    if (id === 'type') options = [...count(rows, pieceTypeOf)].map(([value, n]) => ({ value, label: value, count: n }));
    if (id === 'motion' && MOTION_TYPES.includes(filled.type)) options = [...count(rows, motionOf)].map(([value, n]) => ({ value, label: value, count: n }));
    if (id === 'base' && ['Recliner', 'Loveseat', 'Sofa'].includes(filled.type)) options = [...count(rows, (row) => baseOf(row) || 'Stationary')].map(([value, n]) => ({ value, label: BASE_LABEL[value] || value, count: n }));
    if (id === 'size') options = sizeBands(rows).map((band) => ({ value: band.value, label: band.label, count: rows.filter((row) => band.test(row.dims.width)).length }));
    if (options.length > 1) return ask(id, options);
    if (options.length === 1) filled[id] = options[0].value; // only one possible answer: skip the question
  }
  rows = applyAnswers(placeableRows(styles), filled);
  if (!filled.model) {
    const models = new Map();
    rows.forEach((row) => { const entry = models.get(row.model) || { value: row.model, label: row.name, rows: [] }; entry.rows.push(row); models.set(row.model, entry); });
    const options = [...models.values()].map((entry) => { const widths = entry.rows.map((row) => row.dims.width); return { value: entry.value, label: entry.label, count: entry.rows.length, detail: `${Math.min(...widths)}${Math.min(...widths) === Math.max(...widths) ? '' : `–${Math.max(...widths)}`} in wide` }; }).sort((a, b) => a.label.localeCompare(b.label));
    return { id: 'model', question: 'Which model?', options, rows, answers: filled };
  }
  const chosen = rows.filter((row) => row.model === filled.model);
  return { id: 'style', question: 'Which style?', options: chosen.map((row) => ({ value: `${row.prefix}${row.model}`, label: row.category, count: 1, row })), rows: chosen, answers: filled };
}
