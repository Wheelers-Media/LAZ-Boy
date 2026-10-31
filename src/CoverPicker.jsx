import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { Sheet } from './Sheet.jsx';
import { swatchImageFor } from './logic.js';

const byMaterialThenGrade = (a, b) => (a.material === b.material ? a.grade.localeCompare(b.grade) : a.material === 'Fabric' ? -1 : 1);
const gradeLabel = (item) => (item.material === 'Leather' ? `Leather ${item.grade}` : `Grade ${item.grade}`);

export const ColorTonesContext = createContext(null);
export const SwatchIndexContext = createContext(null);

/** A swatch tile: the real photo when there is one, the approximate tone otherwise. */
export function SwatchTile({ photo, tone }) {
  if (photo) return <img className="tile-img" src={photo} alt="" loading="lazy" decoding="async" />;
  return <span className={`tile-img tile-fallback${tone ? '' : ' unknown'}`} style={tone ? { background: tone } : undefined} />;
}

/** Grade, pattern and colour over a model's covers. `value` is the full cover code (grade + 4-digit pattern + 2-digit colour).
 *  The page shows one row for the current cover; the choosing happens in a sheet so the page never grows a long swatch list. */
export function CoverPicker({ swatches, value, onChange, label = 'Cover', describe, needsStyle = false }) {
  const tones = useContext(ColorTonesContext);
  const swatchIndex = useContext(SwatchIndexContext);
  const selected = swatches.find((item) => item.code === value);
  const [open, setOpen] = useState(false);
  const [draftGrade, setDraftGrade] = useState('');
  const [draftPattern, setDraftPattern] = useState('');
  const colourRef = useRef(null);
  const grade = draftGrade;
  const pattern = draftPattern;
  const grades = useMemo(() => {
    const seen = new Map();
    swatches.forEach((item) => { if (!seen.has(item.grade)) seen.set(item.grade, { grade: item.grade, material: item.material || 'Fabric' }); });
    return [...seen.values()].sort(byMaterialThenGrade);
  }, [swatches]);
  const colourOf = (item) => item.colorName || `Colour ${item.color}`;
  const photoOf = (item, size = 'zoom') => swatchImageFor(swatchIndex, item.code, '', size);
  const patterns = useMemo(() => {
    const seen = new Map();
    swatches.filter((item) => item.grade === grade).sort((a, b) => a.color.localeCompare(b.color)).forEach((item) => { if (!seen.has(item.pattern)) seen.set(item.pattern, { code: item.pattern, name: item.patternName, sample: item }); });
    return [...seen.values()].sort((a, b) => String(a.name || a.code).localeCompare(String(b.name || b.code)));
  }, [swatches, grade]);
  const colours = swatches.filter((item) => item.grade === grade && item.pattern === pattern).sort((a, b) => a.color.localeCompare(b.color));
  const openSheet = () => { setDraftGrade(selected?.grade || ''); setDraftPattern(selected?.pattern || ''); setOpen(true); };
  const pickGrade = (next) => { setDraftGrade(next); setDraftPattern(''); };
  const pickPattern = (next) => { setDraftPattern(next); window.setTimeout(() => colourRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 30); };
  const pickColour = (item) => { onChange(item.code, item); setOpen(false); };
  if (needsStyle) return <p className="cover-empty">Choose a style first. Covers are checked against that exact style.</p>;
  if (!swatches.length) return <p className="cover-empty">No covers are listed for this model.</p>;
  const selectedPhoto = selected && photoOf(selected);
  return <div className="cover-picker">
    <button type="button" className="cover-current cover-trigger" onClick={openSheet} aria-haspopup="dialog">
      {selected ? <SwatchTile photo={selectedPhoto} tone={tones?.[selected.colorName]} /> : <span className="tile-img tile-fallback unknown" />}
      <span><strong>{selected ? selected.name || selected.code : `Choose ${label.toLowerCase()}`}</strong><small>{selected ? selected.code : 'Grade, then pattern, then colour'}</small></span>
      <em>{selected ? 'Change' : 'Choose'}</em>
    </button>
    {selected && <div className="cover-selected">
      {selectedPhoto && <img className="cover-preview" src={selectedPhoto} alt={`${selected.name} swatch`} />}
      <p className="cover-note"><strong>{selected.name}</strong> · {selected.code}{describe ? ` · ${describe(selected)}` : selected.basis === 'cap code' ? ` · accepted by cap code ${selected.capCode}. Confirm for this exact style.` : ''}</p>
    </div>}
    <Sheet wide open={open} onClose={() => setOpen(false)} title={`Choose ${label.toLowerCase()}`}>
      <div className="cover-sheet-grades" role="radiogroup" aria-label={`${label} grade`}>{grades.map((item) => <button type="button" role="radio" aria-checked={grade === item.grade} key={item.grade} className={`chip ${grade === item.grade ? 'on' : ''}`} onClick={() => pickGrade(item.grade)}>{gradeLabel(item)}</button>)}</div>
      {!grade && <p className="cover-sheet-hint">Pick a grade to see its patterns.</p>}
      {grade && <div className="cover-step">
        <span className="cover-label">Pattern</span>
        <div className="cover-tiles cover-tiles-pattern" role="radiogroup" aria-label={`${label} pattern`}>{patterns.map((item) => <button type="button" role="radio" aria-checked={pattern === item.code} key={item.code} className={`cover-tile${pattern === item.code ? ' selected' : ''}`} onClick={() => pickPattern(item.code)}><SwatchTile photo={photoOf(item.sample)} tone={tones?.[item.sample.colorName]} /><span className="tile-name">{item.name || item.code}</span><small>{item.code}</small></button>)}</div>
      </div>}
      {grade && pattern && <div className="cover-step" ref={colourRef} role="radiogroup" aria-label={`${label} colour`}>
        <span className="cover-label">Colour</span>
        <div className="cover-tiles">{colours.map((item) => <button type="button" role="radio" aria-checked={selected?.code === item.code} key={item.code} className={`cover-tile${selected?.code === item.code ? ' selected' : ''}`} onClick={() => pickColour(item)}><SwatchTile photo={photoOf(item)} tone={tones?.[item.colorName]} /><span className="tile-name">{colourOf(item)}</span>{item.colorName && <small>{item.color}</small>}</button>)}</div>
        {tones && colours.some((item) => !photoOf(item)) && <small className="colour-note">Tones are approximate. Check the real swatch.</small>}
      </div>}
    </Sheet>
  </div>;
}
