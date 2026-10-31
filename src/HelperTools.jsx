import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sheet } from './Sheet.jsx';
import { Check, Copy, Plus, Printer, Search, Sparkles, X } from './icons.jsx';
import { searchEverything } from './search.js';
import { compareStyleRows, styleTitle } from './compare.js';
import { buildDrill, emptyScore, recordAnswer } from './drills.js';
import { getGuideStyle } from './logic.js';

const STATUS = { documented: 'In the data', unresolved: 'Not resolved', not_listed_for_exact_style: 'Not listed for this exact style', style_not_resolved: 'Style not resolved', unresolved_finish_code: 'Finish code not resolved' };
const rowKey = (row) => `${row.prefix}${row.model}`;

/** Facts from the April 2026 guide that the index list does not show. Only fields that have a value are printed. */
export function StyleFacts({ catalog, modelCode, styleCode }) {
  const row = getGuideStyle(catalog, modelCode, styleCode);
  if (!row) return null;
  const d = row.dims || {};
  const more = [['Features', row.features], ['Pillows', row.pillows], ['Stitching', row.stitching], ['Special', row.special], ['Swivel base', row.swivelBase], ['Tall base', row.tallBase], ['Battery pack', row.batteryPack]].filter(([, value]) => value);
  const facts = [
    ['Back', row.backs], ['Seat', row.seats],
    ['Seat size', Number.isFinite(d.seatWidth) && Number.isFinite(d.seatDepth) ? `${d.seatWidth} in wide × ${d.seatDepth} in deep${Number.isFinite(d.seatHeight) ? `, ${d.seatHeight} in high` : ''}` : ''],
    ['Fully extended', Number.isFinite(d.fullyExtended) ? `${d.fullyExtended} in` : ''], ['Wall space', Number.isFinite(d.wallSpace) ? `${d.wallSpace} in` : ''],
  ].filter(([, value]) => value);
  if (!facts.length && !more.length) return null;
  const list = (items) => <dl className="style-facts">{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
  return <>{facts.length > 0 && list(facts)}{more.length > 0 && <details className="style-more"><summary>More about this style</summary>{list(more)}</details>}</>;
}

function DecodeCard({ result }) {
  const rows = [
    ['Style', result.style.code && `${result.style.code}${result.style.name ? ` · ${result.style.name}` : ''}`, result.style.status],
    ['Model', result.model.code && `${result.model.code}${result.model.name ? ` · ${result.model.name}` : ''}`, result.model.status],
    ...(result.cover.raw ? [['Cover', [result.cover.raw, result.cover.program_pattern_name, result.cover.program_color_name].filter(Boolean).join(' · '), result.cover.program_pattern_name ? 'documented' : 'unresolved']] : []),
    ...result.claims.map((claim) => [claim.code, `${claim.value ? `${claim.value} · ` : ''}${claim.description}`, claim.status]),
  ];
  return <section className="hs-card" aria-label="Decoded tag">
    <h3>Decoded, field by field</h3>
    <ul className="hs-decode">{rows.map(([label, value, status]) => <li key={`${label}-${value}`} className={status === 'documented' || status === 'partially_resolved_from_catalog' ? 'ok' : 'warn'}><strong>{label}</strong><span>{value || 'not in the supplied data'}</span><em>{STATUS[status] || (status === 'partially_resolved_from_catalog' ? 'Partly in the data' : 'Not resolved')}</em></li>)}</ul>
    {result.warnings.map((warning) => <p key={warning} className="hs-warn">{warning}</p>)}
    <p className="fine-print">{result.disclaimer}</p>
  </section>;
}

export function SmartSearchSheet({ open, onClose, catalog, products, onOpenModel, onBuild, onCompare, compareKeys }) {
  const [query, setQuery] = useState('');
  const input = useRef(null);
  useEffect(() => { if (open) window.setTimeout(() => input.current?.focus(), 60); else setQuery(''); }, [open]);
  const result = useMemo(() => searchEverything(catalog, query, products), [catalog, query, products]);
  const empty = query.trim() && !result.decode && !result.models.length && !result.styles.length;
  return <Sheet open={open} onClose={onClose} title="Find anything">
    <label className="hs-search"><Search size={18} /><input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tag, RMS line, model name or style, e.g. 10X724 DP165667" aria-label="Search tags, models and styles" autoComplete="off" autoCapitalize="characters" /></label>
    {!query.trim() && <p className="fine-print">Paste a tag or RMS line to decode it, or type a model name or number. Results come only from the supplied catalogs.</p>}
    {result.decode && <DecodeCard result={result.decode} />}
    {result.models.length > 0 && <section className="hs-card"><h3>Models</h3><ul className="hs-list">{result.models.map((product) => <li key={product.modelCode}><button type="button" onClick={() => { onOpenModel(product.modelName); onClose(); }}><strong>{product.modelName}</strong><small>Model {product.modelCode} · {product.styles.length} {product.styles.length === 1 ? 'style' : 'styles'}</small></button><button type="button" className="hs-mini" onClick={() => { onBuild(product.modelCode); onClose(); }}>Build SKU</button></li>)}</ul></section>}
    {result.styles.length > 0 && <section className="hs-card"><h3>Styles</h3><ul className="hs-list">{result.styles.map((row) => <li key={rowKey(row)}><div><strong>{styleTitle(row)}</strong><small>{row.category || 'Category not listed'}</small></div><button type="button" className="hs-mini" onClick={() => onCompare(row)} disabled={compareKeys.includes(rowKey(row))}>{compareKeys.includes(rowKey(row)) ? <><Check size={13} /> Added</> : <><Plus size={13} /> Compare</>}</button></li>)}</ul></section>}
    {empty && <p className="empty-state">Nothing in the supplied data matches that. No guess was made.</p>}
  </Sheet>;
}

export function CompareSheet({ open, onClose, rows, onRemove, onClear }) {
  const table = useMemo(() => compareStyleRows(rows), [rows]);
  return <Sheet open={open} onClose={onClose} title={`Compare${rows.length ? ` (${rows.length})` : ''}`} footer={rows.length ? <><button type="button" className="back-button" onClick={onClear}>Clear</button><button type="button" className="primary-button" onClick={onClose}>Done</button></> : null}>
    {rows.length < 2 && <p className="fine-print">{rows.length ? 'Add one more style to compare.' : 'Add two or three styles from the Product Index or search, then open Compare.'}</p>}
    {rows.length > 0 && <div className="hs-table-wrap"><table className="hs-table" style={{ '--cols': rows.length }}><thead><tr><th scope="col"><span className="sr-only">Field</span></th>{table.columns.map((column, index) => <th scope="col" key={column.key}>{column.title}<button type="button" className="hs-x" onClick={() => onRemove(rows[index])} aria-label={`Remove ${column.title}`}><X size={13} /></button></th>)}</tr></thead>
      <tbody>{table.rows.map((row) => <tr key={row.label} className={row.differs ? 'differs' : ''}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td key={table.columns[index].key}>{value}</td>)}</tr>)}</tbody></table></div>}
    {rows.length > 1 && <p className="fine-print">Highlighted rows differ. Values are copied from the April 2026 guide; "not in the supplied data" means the guide row has no value. Confirm exact specs before promising anything.</p>}
  </Sheet>;
}

const SCORE_KEY = 'drill-score';
const loadScore = () => { try { const saved = JSON.parse(window.localStorage.getItem(SCORE_KEY) || 'null'); return saved && Number.isFinite(saved.asked) ? { ...emptyScore(), ...saved } : emptyScore(); } catch { return emptyScore(); } };

export function DrillSheet({ open, onClose, rows }) {
  const [drill, setDrill] = useState(null);
  const [chosen, setChosen] = useState('');
  const [score, setScore] = useState(emptyScore);
  const next = () => { setChosen(''); setDrill(buildDrill(rows)); };
  useEffect(() => { if (open) { setScore(loadScore()); next(); } }, [open]);
  const answer = (id) => {
    if (chosen || !drill) return;
    setChosen(id);
    setScore((previous) => { const updated = recordAnswer(previous, id === drill.correctId); try { window.localStorage.setItem(SCORE_KEY, JSON.stringify(updated)); } catch { /* storage blocked */ } return updated; });
  };
  return <Sheet open={open} onClose={onClose} title="Quiz me" footer={<button type="button" className="primary-button" onClick={next} disabled={!chosen}>Next question</button>}>
    <p className="hs-score" aria-live="polite"><strong>{score.right}</strong> of {score.asked} right · streak {score.streak} · best {score.best}</p>
    {!drill ? <p className="empty-state">The guide data can't make a question right now.</p> : <>
      <h3 className="hs-q">{drill.prompt}</h3>
      <div className="hs-options" role="group" aria-label="Answers">{drill.options.map((option) => <button key={option.id} type="button" disabled={Boolean(chosen)} className={`hs-option ${chosen && option.id === drill.correctId ? 'right' : ''} ${chosen === option.id && option.id !== drill.correctId ? 'wrong' : ''}`} onClick={() => answer(option.id)}>{option.text}</button>)}</div>
      {chosen && <p className="hs-explain" role="status"><Sparkles size={14} /> {chosen === drill.correctId ? 'Right. ' : 'Not quite. '}{drill.explain}</p>}
    </>}
  </Sheet>;
}

export function FitHandoff({ text, link, onCopy }) {
  return <section className="card fitq-handoff"><h3><Copy size={16} /> Hand it over</h3><p className="fine-print">A one-page summary of these answers and leads. It says what each lead is and isn't; no price or stock.</p>
    <div className="fitq-handoff-actions"><button type="button" className="primary-button" onClick={() => onCopy(text, 'Fit summary')}><Copy size={15} /> Copy summary</button><button type="button" className="back-button" onClick={() => onCopy(`${window.location.origin}${window.location.pathname}${link}`, 'Link')}>Copy link</button><button type="button" className="back-button" onClick={() => window.print()}><Printer size={15} /> Print</button></div>
    <pre className="print-only fit-print">{text}</pre></section>;
}
