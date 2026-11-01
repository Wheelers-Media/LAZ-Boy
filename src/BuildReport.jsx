import React, { useContext, useMemo } from 'react';
import { Copy, Printer } from './icons.jsx';
import { SwatchIndexContext } from './CoverPicker.jsx';
import { swatchImageFor } from './logic.js';
import { buildFullReport, reportText } from './buildReport.js';
import { layoutShapes } from './plan.js';

function CoverThumb({ code, name }) {
  const swatches = useContext(SwatchIndexContext);
  const image = code ? swatchImageFor(swatches, code.slice(0, -2), code.slice(-2), 'thumb') : null;
  return image ? <img className="rep-thumb" src={image} alt={name || code} /> : null;
}

function RoomLayout({ layout }) {
  const model = layoutShapes(layout);
  if (!model) return null;
  const pad = 28; const feet = (inches) => `${Math.round((inches / 12) * 10) / 10} ft`;
  const grid = []; for (let x = 12; x < model.width; x += 12) grid.push(x); const rows = []; for (let y = 12; y < model.height; y += 12) rows.push(y);
  return <section className="rep-layout card" aria-label="Room layout">
    <h2>Room layout</h2>
    <svg viewBox={`${-pad} ${-pad} ${model.width + pad * 2} ${model.height + pad * 2}`} role="img" aria-label={`Floor plan of a ${feet(model.width)} by ${feet(model.height)} room with ${model.shapes.length} pieces`}>
      <rect x="0" y="0" width={model.width} height={model.height} className="rl-floor" />
      {grid.map((x) => <line key={`gx${x}`} x1={x} x2={x} y1="0" y2={model.height} className="rl-grid" />)}
      {rows.map((y) => <line key={`gy${y}`} y1={y} y2={y} x1="0" x2={model.width} className="rl-grid" />)}
      {model.shapes.map((shape) => <g key={shape.key} transform={shape.turn ? `rotate(${shape.turn} ${shape.cx} ${shape.cy})` : undefined}>
        <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx="3" className="rl-piece" />
        <text x={shape.cx} y={shape.cy} className="rl-num" textAnchor="middle" dominantBaseline="central" transform={shape.turn ? `rotate(${-shape.turn} ${shape.cx} ${shape.cy})` : undefined}>{shape.number}</text>
      </g>)}
      <text x={model.width / 2} y={-10} textAnchor="middle" className="rl-dim">{feet(model.width)}</text>
      <text x={-10} y={model.height / 2} textAnchor="middle" className="rl-dim" transform={`rotate(-90 -10 ${model.height / 2})`}>{feet(model.height)}</text>
    </svg>
    <ol className="rl-key">{model.shapes.map((shape) => <li key={shape.key}><b>{shape.number}</b> {shape.name ? `${shape.name} · ` : ''}{shape.code}</li>)}</ol>
    <p className="plan-fine">A schematic at one scale: the grid squares are 1 foot. Piece sizes are in each piece’s list below.</p>
  </section>;
}

export function BuildReport({ catalog, plan, fit, onClose, onCopy }) {
  const report = useMemo(() => buildFullReport(catalog, plan, fit), [catalog, plan, fit]);
  const text = useMemo(() => reportText(report), [report]);
  return <section className="module-page build-report" aria-label="Full build report">
    <div className="rep-actions no-print">
      <button type="button" className="back-button" onClick={onClose}>‹ Back to plan</button>
      <button type="button" className="back-button" onClick={() => onCopy(text, 'Report')}><Copy size={15} /> Copy report</button>
      <button type="button" className="primary-button" onClick={() => window.print()}><Printer size={15} /> Print or save PDF</button>
    </div>
    <header className="rep-head">
      <h1>Full build <em>report</em></h1>
      <p>{report.customer ? `${report.customer} · ` : ''}{report.count} {report.count === 1 ? 'item' : 'items'}{report.covers.covers.length ? ` · ${report.covers.covers.length} ${report.covers.covers.length === 1 ? 'cover' : 'covers'}` : ''}</p>
    </header>
    <RoomLayout layout={report.layout} />
    {report.open.length > 0 && <div className="rep-open"><strong>Still open</strong><ul>{report.open.map((item) => <li key={item}>{item}</li>)}</ul></div>}
    {report.covers.mixed && <p className="plan-callout">This build uses {report.covers.covers.length} different covers ({report.covers.covers.join(', ')}). Check they belong together before you quote.</p>}
    <nav className="rep-index no-print" aria-label="Pieces">{report.lines.map((line) => <a key={line.id} href={`#rep-${line.id}`}>{line.number}. {line.heading}</a>)}</nav>
    {report.lines.map((line) => <article key={line.id} id={`rep-${line.id}`} className="rep-line card">
      <div className="rep-line-head">
        <span className="rep-num">{line.number}</span>
        <div><p className="plan-type">{line.type}{line.qty > 1 ? ` · x${line.qty}` : ''}</p><h2>{line.heading}</h2></div>
        {line.sections.find((section) => section.title === 'Cover') && <CoverThumb code={line.sections.find((section) => section.title === 'Cover').rows[0]?.[1]} name={line.heading} />}
      </div>
      <div className="rep-sections">{line.sections.map((section) => <section key={section.title} className="rep-section">
        <h3>{section.title}</h3>
        <dl>{section.rows.map(([label, value]) => <div key={`${label}-${value}`}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </section>)}</div>
      {line.rms.length > 0 ? <div className="rep-rms"><h3>RMS entry</h3>{line.rms.map((entry) => <code key={entry}>{entry}</code>)}</div> : <p className="rep-pending">No RMS line yet. Finish the style and cover in the builder.</p>}
      {line.issues.length > 0 && <ul className="plan-issues">{line.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}
    </article>)}
    {report.rms.text && <section className="rep-all card"><h2>All RMS entries</h2><pre>{report.rms.text}</pre>{report.companions.length > 0 && <><h3>Separate line items</h3><pre>{report.companions.join('\n')}</pre></>}
      <button type="button" className="primary-button no-print" onClick={() => onCopy(report.rms.text, 'RMS entries')}><Copy size={15} /> Copy RMS entries</button></section>}
    <p className="plan-fine">Entry references only. Confirm style, cover, options and availability in RMS before anything is promised.</p>
  </section>;
}
