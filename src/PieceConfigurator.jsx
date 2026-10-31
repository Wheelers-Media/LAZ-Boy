import React, { useMemo, useState } from 'react';
import { CoverPicker } from './CoverPicker.jsx';
import { configureStyle, optionGroups, styleChoices, toggleOption } from './pieceConfig.js';
import { describeCoverEligibility, getModelCoverSwatches } from './logic.js';

/** One question at a time: fabric, finish, then each group of options, then the separate RMS lines. Only what the guide lists for this exact style. */
export function PieceConfigurator({ catalog, item, onChange }) {
  const choices = useMemo(() => styleChoices(catalog, item.modelCode, item.prefix), [catalog, item.modelCode, item.prefix]);
  const allSwatches = useMemo(() => getModelCoverSwatches(catalog, item.modelCode, item.prefix), [catalog, item.modelCode, item.prefix]);
  const [step, setStep] = useState(0);
  const [material, setMaterial] = useState('all');
  const groups = useMemo(() => (choices ? optionGroups(choices.options) : []), [choices]);
  if (!choices) return <p className="studio-hint">This style is not in the April 2026 guide, so it cannot be configured here.</p>;
  const config = item.config || {};
  const result = configureStyle(catalog, item.modelCode, item.prefix, config);
  const set = (patch) => onChange({ ...config, ...patch });
  const finish = config.finish || choices.finishes.find((entry) => entry.standard)?.code || '';
  const materials = [...new Set(allSwatches.map((swatch) => swatch.material || 'Fabric'))];
  const swatches = material === 'all' ? allSwatches : allSwatches.filter((swatch) => (swatch.material || 'Fabric') === material);

  const steps = [
    { id: 'cover', label: 'Fabric', done: Boolean(config.cover), body: <>
      <h3 className="ga-question">What will it be covered in?</h3>
      {materials.length > 1 && <div className="rp-tiles" role="group" aria-label="Material">{['all', ...materials].map((entry) => <button type="button" key={entry} className={`chip ${material === entry ? 'active' : ''}`} onClick={() => setMaterial(entry)}>{entry === 'all' ? 'Show all' : entry}</button>)}</div>}
      <CoverPicker key={`${item.modelCode}-${item.prefix}-${material}`} describe={(swatch) => describeCoverEligibility(catalog, item.modelCode, item.prefix, swatch)} swatches={swatches} value={config.cover || ''}
        onChange={(code) => { const swatch = allSwatches.find((entry) => entry.code === code); set({ cover: code, coverName: swatch?.name || '', coverMaterial: swatch?.material || '' }); }} />
    </> },
    ...(choices.finishes.length ? [{ id: 'finish', label: 'Wood finish', done: true, body: <>
      <h3 className="ga-question">Which wood finish?</h3>
      <div className="rp-tiles">{choices.finishes.map((entry) => <button type="button" key={entry.code} className={`chip ${finish === entry.code ? 'active' : ''}`} onClick={() => set({ finish: entry.code })}>{entry.name}{entry.standard ? ' (standard)' : ''}</button>)}</div>
    </> }] : []),
    ...groups.map((group) => ({ id: group.title, label: group.title, done: true, body: <>
      <h3 className="ga-question">{group.question}</h3>
      <div className="rp-tiles">{group.items.map((entry) => <button type="button" key={entry.code} className={`chip ${(config.options || []).includes(entry.code) ? 'active' : ''}`} onClick={() => set({ options: toggleOption(config.options || [], entry.code) })}><b>{entry.code}</b> {entry.name || 'No description in the supplied data'}</button>)}</div>
      <p className="sf-hint">Leave blank for the standard.</p>
    </> })),
    ...(choices.companions.length ? [{ id: 'extras', label: 'Extra lines', done: true, body: <>
      <h3 className="ga-question">Anything entered as its own RMS line?</h3>
      {choices.companions.map(([label, codes]) => <div key={label}><h4>{label}</h4><div className="rp-tiles">{codes.map((code) => <button type="button" key={code} className={`chip ${(config.companions || []).includes(code) ? 'active' : ''}`} onClick={() => set({ companions: (config.companions || []).includes(code) ? (config.companions || []).filter((entry) => entry !== code) : [...(config.companions || []), code] })}>{code}</button>)}</div></div>)}
      <p className="sf-hint">The guide lists codes for these; leave blank if the customer does not need them.</p>
    </> }] : []),
  ];
  const at = Math.min(step, steps.length - 1);
  const current = steps[at];
  return <div className="rp-config">
    <ol className="cfg-steps" aria-label="Steps">{steps.map((entry, index) => <li key={entry.id}><button type="button" className={`${index === at ? 'on' : ''} ${entry.done && entry.id === 'cover' ? 'done' : ''}`} onClick={() => setStep(index)} aria-current={index === at ? 'step' : undefined}>{index + 1}. {entry.label}</button></li>)}</ol>
    {current.body}
    <div className="cfg-nav"><button type="button" className="back-button" disabled={at === 0} onClick={() => setStep(at - 1)}>Back</button><button type="button" className="primary-button" disabled={at >= steps.length - 1} onClick={() => setStep(at + 1)}>Next: {steps[Math.min(at + 1, steps.length - 1)].label}</button></div>
    <div className="rp-sku"><span>SKU so far</span><code>{result.sku || `Still needed: ${result.missing.join(', ')}`}</code></div>
  </div>;
}
