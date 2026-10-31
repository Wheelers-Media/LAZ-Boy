import React, { useMemo } from 'react';
import { CoverPicker } from './CoverPicker.jsx';
import { configureStyle, styleChoices, toggleOption } from './pieceConfig.js';
import { describeCoverEligibility, getModelCoverSwatches } from './logic.js';

/** Full customization of one guide style: cover, finish, every listed option, extra RMS lines, and the SKU they make. */
export function PieceConfigurator({ catalog, item, onChange }) {
  const choices = useMemo(() => styleChoices(catalog, item.modelCode, item.prefix), [catalog, item.modelCode, item.prefix]);
  const swatches = useMemo(() => getModelCoverSwatches(catalog, item.modelCode, item.prefix), [catalog, item.modelCode, item.prefix]);
  if (!choices) return <p className="sf-hint">This style is not in the April 2026 guide, so it cannot be configured here.</p>;
  const config = item.config || {};
  const result = configureStyle(catalog, item.modelCode, item.prefix, config);
  const set = (patch) => onChange({ ...config, ...patch });
  const finish = config.finish || choices.finishes.find((entry) => entry.standard)?.code || '';
  return <div className="rp-config">
    <h3>Cover</h3>
    <CoverPicker key={`${item.modelCode}-${item.prefix}`} describe={(swatch) => describeCoverEligibility(catalog, item.modelCode, item.prefix, swatch)} swatches={swatches} value={config.cover || ''}
      onChange={(code) => { const swatch = swatches.find((entry) => entry.code === code); set({ cover: code, coverName: swatch?.name || '', coverMaterial: swatch?.material || '' }); }} />
    {choices.finishes.length > 0 && <><h3>Wood finish</h3><div className="rp-tiles">{choices.finishes.map((entry) => <button type="button" key={entry.code} className={`chip ${finish === entry.code ? 'active' : ''}`} onClick={() => set({ finish: entry.code })}>{entry.name} · {entry.code}{entry.standard ? ' (standard)' : ''}</button>)}</div></>}
    {choices.options.length > 0 && <><h3>Options</h3><div className="rp-tiles">{choices.options.map((entry) => <button type="button" key={entry.code} className={`chip ${(config.options || []).includes(entry.code) ? 'active' : ''}`} onClick={() => set({ options: toggleOption(config.options || [], entry.code) })}><b>{entry.code}</b> {entry.name || 'No description in the supplied data'}</button>)}</div>
      {choices.pillowsNeedBuilder && <p className="sf-hint">Contrasting and Featherlite pillows are set in the SKU Builder.</p>}</>}
    {choices.companions.map(([label, codes]) => <div key={label}><h3>{label} (separate RMS line)</h3><div className="rp-tiles">{codes.map((code) => <button type="button" key={code} className={`chip ${(config.companions || []).includes(code) ? 'active' : ''}`} onClick={() => set({ companions: (config.companions || []).includes(code) ? (config.companions || []).filter((entry) => entry !== code) : [...(config.companions || []), code] })}>{code}</button>)}</div></div>)}
    <div className="rp-sku"><span>SKU</span><code>{result.sku || `Still needed: ${result.missing.join(', ')}`}</code></div>
  </div>;
}
