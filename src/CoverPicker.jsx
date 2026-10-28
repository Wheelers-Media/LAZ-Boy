import React, { createContext, useContext, useMemo, useState } from 'react';
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

/** Grade, pattern and colour over a model's covers. `value` is the full cover code (grade + 4-digit pattern + 2-digit colour). */
export function CoverPicker({ swatches, value, onChange, label = 'Cover', describe, needsStyle = false }) {
  const tones = useContext(ColorTonesContext);
  const swatchIndex = useContext(SwatchIndexContext);
  const selected = swatches.find((item) => item.code === value);
  const [pickedGrade, setPickedGrade] = useState('');
  const [pickedPattern, setPickedPattern] = useState('');
  const [changing, setChanging] = useState(false);
  const grade = selected?.grade || pickedGrade;
  const pattern = selected?.pattern || pickedPattern;
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
  const pickGrade = (next) => { setPickedGrade(next); setPickedPattern(''); setChanging(false); onChange(''); };
  const pickPattern = (next) => { setPickedPattern(next); setChanging(false); onChange(''); };
  const current = patterns.find((item) => item.code === pattern);
  if (needsStyle) return <p className="cover-empty">Choose a style first. Covers are checked against that exact style.</p>;
  if (!swatches.length) return <p className="cover-empty">No covers are listed for this model.</p>;
  const selectedPhoto = selected && photoOf(selected);
  return <div className="cover-picker">
    <div className="cover-step" role="radiogroup" aria-label={`${label} grade`}>
      <div className="cover-chips">{grades.map((item) => <button type="button" role="radio" aria-checked={grade === item.grade} key={item.grade} className={`chip ${grade === item.grade ? 'on' : ''}`} onClick={() => pickGrade(item.grade)}>{gradeLabel(item)}</button>)}</div>
    </div>
    {grade && <div className="cover-step">
      <span className="cover-label">Pattern</span>
      {current && !changing
        ? <button type="button" className="cover-current" onClick={() => setChanging(true)}><SwatchTile photo={photoOf(current.sample)} tone={tones?.[current.sample.colorName]} /><span><strong>{current.name || current.code}</strong><small>{current.code}</small></span><em>Change</em></button>
        : <div className="cover-tiles cover-tiles-pattern" role="radiogroup" aria-label={`${label} pattern`}>{patterns.map((item) => <button type="button" role="radio" aria-checked={pattern === item.code} key={item.code} className={`cover-tile${pattern === item.code ? ' selected' : ''}`} onClick={() => pickPattern(item.code)}><SwatchTile photo={photoOf(item.sample)} tone={tones?.[item.sample.colorName]} /><span className="tile-name">{item.name || item.code}</span><small>{item.code}</small></button>)}</div>}
    </div>}
    {grade && pattern && <div className="cover-step" role="radiogroup" aria-label={`${label} colour`}>
      <span className="cover-label">Colour</span>
      <div className="cover-tiles">{colours.map((item) => <button type="button" role="radio" aria-checked={selected?.color === item.color} key={item.code} className={`cover-tile${selected?.color === item.color ? ' selected' : ''}`} onClick={() => onChange(item.code, item)}><SwatchTile photo={photoOf(item)} tone={tones?.[item.colorName]} /><span className="tile-name">{colourOf(item)}</span>{item.colorName && <small>{item.color}</small>}</button>)}</div>
      {tones && colours.some((item) => !photoOf(item)) && <small className="colour-note">Tones are approximate. Check the real swatch.</small>}
    </div>}
    {selected && <div className="cover-selected">
      {selectedPhoto && <img className="cover-preview" src={selectedPhoto} alt={`${selected.name} swatch`} />}
      <p className="cover-note"><strong>{selected.name}</strong> · {selected.code}{describe ? ` · ${describe(selected)}` : selected.basis === 'cap code' ? ` · accepted by cap code ${selected.capCode}. Confirm for this exact style.` : ''}</p>
    </div>}
  </div>;
}
