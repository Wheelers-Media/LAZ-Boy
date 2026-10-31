import { styleTitle } from './compare.js';

const pick = (list, rng) => list[Math.floor(rng() * list.length) % list.length];
const shuffle = (list, rng) => { const out = [...list]; for (let i = out.length - 1; i > 0; i -= 1) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; } return out; };
const usable = (rows) => rows.filter((row) => row.kind === 'style' && row.name && row.category && row.prefix && row.model);

/** "What is this tag?" Show PREFIX+MODEL and pick the category the guide lists for it. */
function tagDrill(rows, rng) {
  const pool = usable(rows);
  const row = pick(pool, rng);
  const wrong = shuffle([...new Set(pool.map((item) => item.category).filter((category) => category !== row.category))], rng).slice(0, 3);
  if (wrong.length < 3) return null;
  const options = shuffle([row.category, ...wrong], rng).map((text, index) => ({ id: String(index), text }));
  return { kind: 'tag', prompt: `Tag ${row.prefix}${row.model}: what is it?`, options, correctId: options.find((item) => item.text === row.category).id, explain: `${styleTitle(row)} is listed as "${row.category}" in the April 2026 guide.` };
}

/** "Which one reaches furthest / needs the least wall?" among three styles with a real, distinct number. */
function specDrill(rows, rng, field, label, best) {
  const pool = usable(rows).filter((row) => Number.isFinite(row.dims?.[field]));
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const three = shuffle(pool, rng).slice(0, 3);
    const values = three.map((row) => row.dims[field]);
    if (three.length < 3 || new Set(values).size < 3 || new Set(three.map(styleTitle)).size < 3) continue;
    const winner = three.reduce((a, b) => (best === 'max' ? (b.dims[field] > a.dims[field] ? b : a) : (b.dims[field] < a.dims[field] ? b : a)));
    const options = three.map((row, index) => ({ id: String(index), text: styleTitle(row) }));
    return { kind: field, prompt: `Which has the ${label}?`, options, correctId: options[three.indexOf(winner)].id, explain: three.map((row) => `${styleTitle(row)}: ${row.dims[field]} in`).join(' · ') };
  }
  return null;
}

/** One question from the April 2026 guide rows. Deterministic for a given rng. Returns null when the data cannot support it. */
export function buildDrill(rows, rng = Math.random, kind = 'any') {
  const makers = { tag: () => tagDrill(rows, rng), reach: () => specDrill(rows, rng, 'fullyExtended', 'longest fully extended length', 'max'), wall: () => specDrill(rows, rng, 'wallSpace', 'smallest wall-space need', 'min') };
  const order = kind === 'any' ? shuffle(Object.keys(makers), rng) : [kind];
  for (const key of order) { const drill = makers[key]?.(); if (drill) return drill; }
  return null;
}

export const emptyScore = () => ({ asked: 0, right: 0, streak: 0, best: 0 });
export function recordAnswer(score, correct) {
  const streak = correct ? score.streak + 1 : 0;
  return { asked: score.asked + 1, right: score.right + (correct ? 1 : 0), streak, best: Math.max(score.best, streak) };
}
