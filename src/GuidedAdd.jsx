import React, { useMemo, useState } from 'react';
import { nextQuestion } from './guidedAdd.js';
import { createFreeItem, formatInches } from './floorplan.js';
import { ChairArt } from './ChairArt.jsx';

const LABELS = { type: 'Piece', motion: 'Movement', base: 'Room behind', size: 'Width', model: 'Model' };

/** Asks one question at a time and only offers what exists in the April 2026 guide for the answers so far. */
export function GuidedAdd({ styles, onAdd }) {
  const [answers, setAnswers] = useState({});
  const q = useMemo(() => nextQuestion(styles, answers), [styles, answers]);
  const answered = Object.entries(q.answers).filter(([id]) => id !== 'size' || q.answers.size);
  const names = { model: q.rows[0]?.name };
  const back = (id) => setAnswers((current) => { const order = ['type', 'motion', 'base', 'size', 'model']; const keep = {}; for (const key of order) { if (key === id) break; if (current[key]) keep[key] = current[key]; } return keep; });
  const pick = (value) => setAnswers({ ...q.answers, [q.id]: value });
  return <div className="ga" aria-live="polite">
    {answered.length > 0 && <div className="ga-crumbs">{answered.map(([id, value]) => <button key={id} type="button" className="chip" onClick={() => back(id)} aria-label={`Change ${LABELS[id]}`}>{LABELS[id]}: {id === 'model' ? (styles.find((row) => row.model === value)?.name || value) : id === 'size' ? (q.options.find((option) => option.value === value)?.label || 'chosen') : value} ✎</button>)}</div>}
    <h3 className="ga-question">{q.question}</h3>
    {q.id === 'style'
      ? <div className="ga-grid">{q.options.map((option) => { const draft = createFreeItem(option.row); return <button key={option.value} type="button" className="ga-tile" onClick={() => { onAdd(option.row); setAnswers({}); }}>
          <svg viewBox={`-3 -3 ${draft.baseWidth + 6} ${draft.baseHeight + 6}`} aria-hidden="true" focusable="false"><ChairArt item={draft} /></svg>
          <strong>{option.row.category}</strong>
          <small>{option.row.prefix}{option.row.model} · {formatInches(draft.baseWidth)} W × {formatInches(draft.baseHeight)} D{draft.reachIn ? ` · ${formatInches(draft.reachIn)} reclined` : ''}</small>
        </button>; })}</div>
      : <div className="ga-grid">{q.options.map((option) => <button key={option.value} type="button" className="ga-tile" onClick={() => pick(option.value)}>
          <strong>{option.label}</strong>
          <small>{option.detail ? `${option.detail} · ` : ''}{option.count} {option.count === 1 ? 'style' : 'styles'}</small>
        </button>)}</div>}
    {names.model && q.id === 'style' && <p className="studio-hint">Showing {q.options.length} {q.options.length === 1 ? 'style' : 'styles'} of {names.model}. Covers, finish and options come next.</p>}
  </div>;
}
