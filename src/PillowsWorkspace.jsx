import React, { useMemo, useState } from 'react';
import { Plus, Info } from './icons.jsx';
import { Term, useGlossary } from './Term.jsx';
import { lookupTerm } from './glossary.js';
import { lineFromPillow } from './plan.js';

const titleCase = (text = '') => text.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const isPair = (style) => /^\(2\)/.test(style.category || '');
const plainCategory = (style) => (style.category || style.name || '').replace(/^\(\d\)\s*/, '');

/** A pillow drawn to its real proportions (width x height), so the shapes can be told apart at a glance. */
function PillowShape({ style }) {
  const { width = 18, height = 18 } = style.dims || {};
  const scale = 110 / Math.max(width, height);
  const w = Math.round(width * scale); const h = Math.round(height * scale);
  const welt = /welt/i.test(style.category);
  const kidney = /kidney/i.test(style.category);
  const box = /box/i.test(style.category);
  return <svg className="pil-shape" viewBox="0 0 130 130" role="img" aria-label={`${plainCategory(style)}, ${height} by ${width} inches`}>
    <rect x={(130 - w) / 2} y={(130 - h) / 2} width={w} height={h} rx={kidney ? Math.min(h / 2, 22) : 10} className="pil-body" />
    {welt && <rect x={(130 - w) / 2 + 4} y={(130 - h) / 2 + 4} width={w - 8} height={h - 8} rx={kidney ? Math.min(h / 2, 18) : 7} className="pil-welt" />}
    {box && <line x1={(130 - w) / 2} x2={(130 + w) / 2} y1={(130 - h) / 2 + 8} y2={(130 - h) / 2 + 8} className="pil-welt" />}
  </svg>;
}

export function PillowsWorkspace({ catalog, onAddToPlan, onOpenTab }) {
  const glossary = useGlossary();
  const rows = catalog?.style_index_2026?.styles || [];
  const customs = useMemo(() => rows.filter((row) => row.prefix === '01P' || row.prefix === '08P').sort((a, b) => a.styleNumber.localeCompare(b.styleNumber)), [rows]);
  const blocked = catalog?.fabric_cover_program_a26?.businessRules?.pillowsNotAllowedCapCodes || [];
  const customCaps = useMemo(() => [...new Set(customs.flatMap((row) => row.capCodes || []))], [customs]);
  const allCaps = useMemo(() => [...new Set([...customCaps, ...blocked])], [customCaps, blocked]);
  const [featherlite, setFeatherlite] = useState(false);
  const [cap, setCap] = useState('');
  const [added, setAdded] = useState('');
  const [modelCode, setModelCode] = useState('');
  const models = useMemo(() => {
    const byModel = new Map();
    rows.filter((row) => row.kind === 'style' && row.pillows).forEach((row) => { if (!byModel.has(row.model)) byModel.set(row.model, row.name); });
    return [...byModel.entries()].sort((a, b) => a[1].localeCompare(b[1])).map(([code, name]) => ({ code, name: titleCase(name) }));
  }, [rows]);
  const modelRows = useMemo(() => rows.filter((row) => row.kind === 'style' && String(row.model) === String(modelCode) && row.pillows), [rows, modelCode]);
  const fp = lookupTerm(glossary, 'option', 'FP');
  const p1 = lookupTerm(glossary, 'option', 'P1');
  const add = (style) => { onAddToPlan(lineFromPillow({ style, featherlite }), `Pillow ${style.styleNumber}`); setAdded(style.styleNumber); };

  return <section className="module-page pillows-page">
    <div className="module-intro"><h1>Accent <em>pillows</em></h1></div>

    <div className="pil-ways">
      <article className="card"><span className="pil-n">1</span><h2>Comes with the style</h2><p>Many sofas, loveseats and chairs list the accent pillows that come with them. Look it up by model below.</p></article>
      <article className="card"><span className="pil-n">2</span><h2>Change it on the style</h2><p><Term kind="option" code="P1">P1</Term> puts a contrasting cover on the pillows. <Term kind="option" code="FP">FP</Term> upgrades the fill to Featherlite.</p></article>
      <article className="card"><span className="pil-n">3</span><h2>Sell extra pillows</h2><p>Custom pillows are their own styles (01P and 08P) with their own cover and size. Add them as a separate line.</p></article>
    </div>

    <section className="card pil-block" aria-labelledby="pil-check">
      <h2 id="pil-check">Can this cover have pillows?</h2>
      <p className="pil-lead">Tap the cap code on the cover. The cap code is on the Fabrics &amp; Care card and the cover tag.</p>
      <div className="pil-caps" role="group" aria-label="Cover cap code">{allCaps.map((code) => <button type="button" key={code} className={`pil-cap${cap === code ? ' on' : ''}`} aria-pressed={cap === code} onClick={() => setCap(cap === code ? '' : code)}>{code}</button>)}</div>
      {cap && <p className={`pil-verdict ${blocked.includes(cap) ? 'no' : 'yes'}`} role="status">
        {blocked.includes(cap)
          ? <><strong>{cap}: no pillows.</strong> Accent pillows are not available in <Term kind="cap" code={cap}>{cap}</Term> covers (April 2026 Fabric &amp; Leather List).</>
          : <><strong>{cap}: pillows allowed.</strong> {customCaps.includes(cap) ? 'Custom pillow styles can also use this cap code.' : 'Not on the custom pillow cover list, so confirm before offering it on a separate pillow.'}</>}
      </p>}
    </section>

    <section className="card pil-block" aria-labelledby="pil-custom">
      <h2 id="pil-custom">Custom pillow styles</h2>
      <p className="pil-lead">Drawn to scale. “Pair” means two pillows come with the style. Covers: {customCaps.map((code) => <Term key={code} kind="cap" code={code}>{code}</Term>).reduce((list, node) => (list.length ? [...list, ', ', node] : [node]), [])}. Fabric only; no leather or faux leather.</p>
      <label className="pil-fp"><input type="checkbox" checked={featherlite} onChange={(event) => setFeatherlite(event.target.checked)} /> Add <Term kind="option" code="FP">Featherlite (FP)</Term> when I add to the plan</label>
      <div className="pil-grid">{customs.map((style) => <article key={style.styleNumber} className="pil-card">
        <PillowShape style={style} />
        <h3>{style.prefix}-{style.styleNumber.slice(3)}</h3>
        <p>{plainCategory(style)}</p>
        <p className="pil-size">{style.dims.height} × {style.dims.width} in · {isPair(style) ? 'pair' : 'single'}</p>
        <button type="button" className="back-button" aria-label={`Add pillow ${style.styleNumber} to the plan`} onClick={() => add(style)}><Plus size={15} /> {added === style.styleNumber ? 'Added' : 'Add to plan'}</button>
      </article>)}</div>
      <p className="pil-note"><Info size={15} /> The 2025 stationary and motion catalogs list C1, F1 and FP as options on the 18″ and 20″ pillows. The 2026 Summer/Fall Motion catalog lists FP only. What C1 and F1 mean is not in the supplied data, so confirm in RMS before offering them. 08P-201 is one pillow; every other 08P style is a pair.</p>
    </section>

    <section className="card pil-block" aria-labelledby="pil-model">
      <h2 id="pil-model">What comes with a model</h2>
      <label className="form-field"><span>Model</span>
        <select value={modelCode} onChange={(event) => setModelCode(event.target.value)}>
          <option value="">Choose a model</option>
          {models.map((model) => <option key={model.code} value={model.code}>{model.name} · {model.code}</option>)}
        </select>
      </label>
      {modelCode && <ul className="pil-styles">{modelRows.map((row) => { const options = row.options || []; const contrast = options.includes('P1') || options.includes('P2'); return <li key={row.styleNumber}>
        <strong>{row.prefix}{row.model}</strong> <span>{titleCase(row.category || '')}</span>
        <span className="pil-incl">Comes with: {row.pillows.replace(/\s*\(P[12]\)\s*$/i, '')}</span>
        <span className="pil-opts">{contrast ? <Term kind="option" code={options.includes('P1') ? 'P1' : 'P2'}>{options.includes('P1') ? 'P1' : 'P2'} contrast cover</Term> : <em>No contrast-cover option listed</em>}{options.includes('FP') ? <Term kind="option" code="FP">FP Featherlite</Term> : <em>No Featherlite option listed</em>}</span>
      </li>; })}{!modelRows.length && <li>No pillow details for this model in the supplied data.</li>}</ul>}
      {!modelCode && <p className="pil-lead">{models.length} models list their included pillows in the April 2026 guide. Models not listed have no pillow details in the supplied data.</p>}
    </section>

    {(fp || p1) && <section className="card pil-block" aria-labelledby="pil-say">
      <h2 id="pil-say">What to say</h2>
      <dl className="pil-say">
        {p1 && <><dt>Contrast pillows (P1)</dt><dd>{p1.pitch}</dd></>}
        {fp && <><dt>Featherlite (FP)</dt><dd>{fp.pitch} {fp.plain}</dd></>}
      </dl>
      <p className="pil-note">Confirm the exact style offers each option before you promise it. Pillow options are listed per style.</p>
    </section>}
    <p className="pil-foot"><button type="button" className="back-button" onClick={() => onOpenTab('Plan')}>Open the plan</button></p>
  </section>;
}
