import React, { useContext, useMemo, useState } from 'react';
import { Armchair, Check, ClipboardCheck, Copy, Layers3, Minus, Plus, Sofa, X } from './icons.jsx';
import { SwatchIndexContext } from './CoverPicker.jsx';
import { buildPlanNotes, coverSummary, finishTheSet, lineIssues, NOTE_LIMIT, rmsEntryText, sortedLines } from './plan.js';
import { swatchImageFor } from './logic.js';
import { BuildReport } from './BuildReport.jsx';

const TYPE_ICON = { 'Sectional piece': Layers3, Sofa, Loveseat: Sofa, Recliner: Armchair, Chair: Armchair };

function Thumb({ line }) {
  const swatches = useContext(SwatchIndexContext);
  const image = line.coverCode ? swatchImageFor(swatches, line.coverCode.slice(0, -2), line.coverCode.slice(-2), 'thumb') : null;
  const Icon = TYPE_ICON[line.kind === 'sectional' ? 'Sectional piece' : line.type] || Armchair;
  return <div className="plan-thumb">{image ? <img src={image} alt={line.coverName || line.coverCode} loading="lazy" /> : <Icon size={26} />}</div>;
}

function NoteBlock({ title, where, text, onCopy }) {
  return <div className="plan-note">
    <div className="plan-note-head"><strong>{title}</strong><small>{where}</small></div>
    <pre>{text}</pre>
    <div className="plan-note-foot"><small className={text.length > NOTE_LIMIT - 40 ? 'near' : ''}>{text.length} / {NOTE_LIMIT}</small><button type="button" className="primary-button" onClick={() => onCopy(text, title)}><Copy size={15} /> Copy</button></div>
  </div>;
}

export function PlanWorkspace({ catalog, plan, setPlan, fit, onEdit, onAddLead, onOpenTab, onCopy, reportOpen, setReportOpen }) {
  const [confirmClear, setConfirmClear] = useState(false);
  const lines = useMemo(() => sortedLines(plan.lines), [plan.lines]);
  const covers = useMemo(() => coverSummary(plan.lines), [plan.lines]);
  const sets = useMemo(() => finishTheSet(catalog, plan.lines), [catalog, plan.lines]);
  const notes = useMemo(() => buildPlanNotes({ customer: plan.customer, lines: plan.lines, fit }), [plan.customer, plan.lines, fit]);
  const rms = useMemo(() => rmsEntryText(plan.lines), [plan.lines]);
  const update = (id, patch) => setPlan((current) => ({ ...current, lines: current.lines.map((line) => (line.id === id ? { ...line, ...patch } : line)) }));
  const remove = (id) => setPlan((current) => ({ ...current, lines: current.lines.filter((line) => line.id !== id) }));

  if (reportOpen && plan.lines.length) return <BuildReport catalog={catalog} plan={plan} fit={fit} onClose={() => setReportOpen(false)} onCopy={onCopy} />;
  return <section className="module-page plan-page">
    <div className="module-intro"><h1>Customer <em>plan</em></h1></div>
    <div className="plan-top card">
      <label className="form-field"><span>Customer</span><input value={plan.customer} placeholder="First name (optional)" maxLength={40} onChange={(event) => setPlan((current) => ({ ...current, customer: event.target.value }))} /></label>
      {plan.lines.length > 0 && <button type="button" className="primary-button" onClick={() => setReportOpen(true)}>Full report</button>}
      <div className="plan-count"><strong>{plan.lines.reduce((sum, line) => sum + line.qty, 0)}</strong><span>{plan.lines.reduce((sum, line) => sum + line.qty, 0) === 1 ? 'item' : 'items'}</span></div>
    </div>

    {!lines.length ? <div className="plan-empty card">
      <ClipboardCheck size={34} />
      <h2>Nothing in the plan yet</h2>
      <p>Add every piece the customer wants. A recliner, a sofa, a sectional and the extras all go in one plan.</p>
      <div className="plan-empty-actions">
        <button type="button" className="primary-button" onClick={() => onOpenTab('Fit')}>Find a fit</button>
        <button type="button" className="back-button" onClick={() => onOpenTab('Sectional Studio')}>Design a sectional</button>
        <button type="button" className="back-button" onClick={() => onOpenTab('Product Index')}>Browse models</button>
      </div>
    </div> : <>
      <div className="plan-lines">
        {lines.map((line) => { const issues = lineIssues(line); return <article key={line.id} className="plan-line card">
          <Thumb line={line} />
          <div className="plan-line-body">
            <p className="plan-type">{line.kind === 'sectional' ? 'Sectional' : line.type}</p>
            <h3>{line.modelName || line.title}{line.modelCode && <small> {line.modelCode}</small>}</h3>
            {line.detail && <p className="plan-detail">{line.detail}</p>}
            {line.kind === 'sectional' && line.pieces.length > 0 && <p className="plan-pieces">{line.pieces.join(' · ')}</p>}
            <p className="plan-cover">{line.coverName || line.coverCode ? <><b>{line.coverName || line.coverCode}</b>{line.coverName && <small> {line.coverCode}</small>}</> : line.kind === 'lead' ? <small>Cover and style come next</small> : <small>No cover yet</small>}</p>
            {issues.length > 0 && <ul className="plan-issues">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}
            <label className="plan-note-input"><span className="sr-only">Note for {line.modelName}</span><input value={line.note} placeholder="Add a note" maxLength={60} onChange={(event) => update(line.id, { note: event.target.value })} /></label>
          </div>
          <div className="plan-line-side">
            <div className="plan-qty" role="group" aria-label={`Quantity of ${line.modelName}`}>
              <button type="button" aria-label="One fewer" disabled={line.qty <= 1} onClick={() => update(line.id, { qty: line.qty - 1 })}><Minus size={16} /></button>
              <span aria-live="polite">{line.qty}</span>
              <button type="button" aria-label="One more" disabled={line.qty >= 9} onClick={() => update(line.id, { qty: line.qty + 1 })}><Plus size={16} /></button>
            </div>
            <button type="button" className="back-button" onClick={() => onEdit(line)}>{line.kind === 'lead' ? 'Choose style' : 'Edit'}</button>
            <button type="button" className="plan-remove" aria-label={`Remove ${line.modelName} from the plan`} onClick={() => remove(line.id)}><X size={18} /></button>
          </div>
        </article>; })}
      </div>

      {covers.mixed && <p className="plan-callout"><Check size={16} /> This plan uses {covers.covers.length} different covers ({covers.covers.join(', ')}). Check they belong together before you quote.</p>}

      {sets.length > 0 && <section className="plan-sets card">
        <h2>Finish the set</h2>
        {sets.map((set) => <div key={set.modelCode} className="plan-set">
          <h3>More from {set.modelName}</h3>
          <div className="plan-set-items">{set.items.map((item) => <button type="button" key={item.prefix} className="plan-add" onClick={() => onAddLead({ modelCode: set.modelCode, modelName: set.modelName, category: item.label, styleCode: item.prefix })}>
            <Plus size={15} /><span><strong>{item.label}</strong>{item.dims && <small>{item.dims}</small>}</span>
          </button>)}</div>
        </div>)}
      </section>}

      <section className="plan-notes card">
        <h2>Notes for the store system</h2>
        <div className="plan-notes-grid">
          <NoteBlock title="Internal note" where="Hidden Notes" text={notes.internal} onCopy={onCopy} />
          <NoteBlock title="Customer note" where="Notes" text={notes.customer} onCopy={onCopy} />
        </div>
        {rms.text && <div className="plan-note">
          <div className="plan-note-head"><strong>RMS entries</strong><small>One per line · confirm each in RMS</small></div>
          <pre>{rms.text}</pre>
          {rms.pending.length > 0 && <small className="plan-pending">Still to configure: {rms.pending.join(', ')}</small>}
          <div className="plan-note-foot"><span /><button type="button" className="primary-button" onClick={() => onCopy(rms.text, 'RMS entries')}><Copy size={15} /> Copy</button></div>
        </div>}
        <p className="plan-fine">Entry references only. Style, cover, options and availability must be confirmed in RMS before anything is promised.</p>
      </section>

      <div className="plan-clear">{confirmClear
        ? <><span>Clear this plan?</span><button type="button" className="back-button" onClick={() => setConfirmClear(false)}>Keep it</button><button type="button" className="primary-button danger" onClick={() => { setPlan({ customer: '', lines: [] }); setConfirmClear(false); }}>Clear plan</button></>
        : <button type="button" className="back-button" onClick={() => setConfirmClear(true)}>New customer</button>}</div>
    </>}
  </section>;
}
