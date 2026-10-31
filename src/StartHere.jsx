import React, { useMemo, useState } from 'react';
import { Term, EntryBody, useGlossary } from './Term.jsx';
import { groupGlossary, searchGlossary } from './glossary.js';
import { getGuideStyle } from './logic.js';

const JOBS = [
  ['Fit', 'Find what fits a customer', 'Answer a few questions about the person and the room. You only see products that work.'],
  ['Product Index', 'Look up a model', 'See what a model is, how it moves, and every style, cover type, finish and option for it.'],
  ['Fabrics & Care', 'Show fabrics and explain care', 'Browse covers by grade, wearability and cleaning code, and read the care rules.'],
  ['SKU Builder', 'Build or read a code', 'Build the exact code to key into RMS, or decode one from a tag.'],
  ['Room Builder', 'Lay out a room', 'Place sofas, sectionals and chairs to real size and check they fit.'],
  ['Support', 'Answer warranty and safety questions', 'Warranty, batteries, lift-chair weights and power safety, from the guides.'],
];

/** The example SKU is read live from the data. If the data is missing, the example is skipped rather than invented. */
function useExample(catalog) {
  return useMemo(() => {
    const style = getGuideStyle(catalog, '709', '10X');
    const cover = (catalog?.fabric_cover_program_a26?.fabrics || []).find((record) => record.coverCode === 'B1538');
    const color = cover?.colors?.includes('53') ? '53' : '';
    if (!style || !cover || !color) return null;
    return { style, cover, color };
  }, [catalog]);
}

function Example({ catalog }) {
  const example = useExample(catalog);
  if (!example) return null;
  const { style, cover, color } = example;
  const parts = [
    ['10X', 'Prefix', `How it moves: ${style.category}.`, 'PREFIX'],
    ['709', 'Model', `The look: ${style.name[0]}${style.name.slice(1).toLowerCase()}.`, 'MODEL'],
    ['B', 'Grade', 'The price group of the cover.', 'GRADE'],
    ['1538', 'Pattern', `The design: ${cover.patternName}.`, 'PATTERN'],
    ['53', 'Color', `The colour: ${cover.colorNames?.[color] || 'colour name not in the supplied data'}.`, 'COLOR'],
  ];
  return <div className="sh-example" role="group" aria-label="How to read a code">
    <p className="sh-code" aria-label="10X709 B153853">{parts.map(([chunk, label, , key]) => <span key={label} className={`sh-seg sh-${label.toLowerCase()}`}><Term kind="term" code={key}>{chunk}</Term></span>)}</p>
    <ol className="sh-legend">{parts.map(([chunk, label, text]) => <li key={label}><b>{label}</b> <code>{chunk}</code> {text}</li>)}</ol>
    <p className="sh-note">Cover B1538 is cap code {cover.capCode}. A style accepts it only if that cap code is on its list: {style.capCodes?.includes(cover.capCode) ? `10X709 lists ${cover.capCode}.` : `10X709 does not list ${cover.capCode}.`} Always confirm the final line in RMS.</p>
  </div>;
}

function GlossaryList() {
  const glossary = useGlossary();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState('');
  const groups = useMemo(() => groupGlossary(searchGlossary(glossary, query)), [glossary, query]);
  if (!glossary) return null;
  return <section className="sh-block card" aria-labelledby="sh-words">
    <h2 id="sh-words">Words you will hear</h2>
    <p className="sh-lead">Every code and term in the app, in plain words. Search by code or name.</p>
    <label className="form-field"><span>Search the glossary</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="UR, wall recliner, pillows…" /></label>
    {groups.length === 0 && <p className="sh-note">Nothing matches “{query}”.</p>}
    {groups.map((group) => <details key={group.kind} className="sh-group" open={Boolean(query) || group.kind === 'term'}>
      <summary>{group.label} <small>{group.items.length}</small></summary>
      <ul>{group.items.map((entry) => { const id = `${entry.kind}:${entry.code}`; return <li key={id}>
        <button type="button" className="sh-entry" aria-expanded={open === id} onClick={() => setOpen(open === id ? '' : id)}><b>{entry.term}</b>{entry.kind !== 'term' && entry.kind !== 'mech' && entry.term !== entry.code && <code>{entry.code}</code>}</button>
        {open === id && <EntryBody entry={entry} />}
      </li>; })}</ul>
    </details>)}
  </section>;
}

export function StartHere({ catalog, onGo, onDone }) {
  return <section className="module-page start-here">
    <div className="module-intro"><h1>Start <em>here</em></h1><p>Your first day on the floor, in plain words. Already know the product? Skip straight to <button type="button" className="link-button" onClick={onDone}>Fit &amp; discover</button>.</p></div>
    <section className="sh-block card" aria-labelledby="sh-jobs"><h2 id="sh-jobs">What you can do here</h2>
      <div className="sh-jobs">{JOBS.map(([tab, title, text]) => <button type="button" key={tab} className="sh-job" onClick={() => onGo(tab)}><strong>{title}</strong><span>{text}</span></button>)}</div></section>
    <section className="sh-block card" aria-labelledby="sh-read"><h2 id="sh-read">Read a code in 30 seconds</h2>
      <p className="sh-lead">Every order line is a style, then a cover. Tap any part to learn it.</p><Example catalog={catalog} /></section>
    <section className="sh-block card" aria-labelledby="sh-rules"><h2 id="sh-rules">Before you promise anything</h2>
      <ul className="sh-rules">
        <li>This app shows <strong>no prices and no stock</strong>. Read prices from the price book and confirm availability in RMS.</li>
        <li>A product “worth exploring” is not a confirmed fit. Fit comes from the customer’s answers and the exact style’s data.</li>
        <li>If something says <em>not in the supplied data</em>, the guides do not say. Ask a manager rather than guessing.</li>
        <li>Options, covers and finishes depend on the <strong>exact style</strong>, not the model name.</li>
      </ul></section>
    <GlossaryList />
    <p className="sh-foot"><button type="button" className="primary-button" onClick={onDone}>Got it, start with Fit &amp; discover</button></p>
  </section>;
}
