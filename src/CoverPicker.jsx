import React, { createContext, useContext, useMemo, useState } from 'react';
import { summarizeGradeKinds } from './logic.js';

const byMaterialThenGrade = (a, b) => (a.material === b.material ? a.grade.localeCompare(b.grade) : a.material === 'Fabric' ? -1 : 1);

export const ColorTonesContext = createContext(null);

/** Grade, pattern and colour selects over a model's covers. `value` is the full cover code (grade + 4-digit pattern + 2-digit colour). */
export function CoverPicker({ swatches, value, onChange, label = 'Cover', describe, needsStyle = false }) {
  const tones = useContext(ColorTonesContext);
  const selected = swatches.find((item) => item.code === value);
  const [pickedGrade, setPickedGrade] = useState('');
  const [pickedPattern, setPickedPattern] = useState('');
  const grade = selected?.grade || pickedGrade;
  const pattern = selected?.pattern || pickedPattern;
  const grades = useMemo(() => {
    const seen = new Map();
    swatches.forEach((item) => { if (!seen.has(item.grade)) seen.set(item.grade, { grade: item.grade, material: item.material || 'Fabric' }); });
    return [...seen.values()].sort(byMaterialThenGrade);
  }, [swatches]);
  const patterns = useMemo(() => {
    const seen = new Map();
    swatches.filter((item) => item.grade === grade).forEach((item) => { if (!seen.has(item.pattern)) seen.set(item.pattern, { name: item.patternName, kind: item.kind || '' }); });
    return [...seen.entries()].sort((a, b) => String(a[1].name || a[0]).localeCompare(String(b[1].name || b[0])));
  }, [swatches, grade]);
  const kinds = useMemo(() => summarizeGradeKinds(swatches, grade), [swatches, grade]);
  const colours = swatches.filter((item) => item.grade === grade && item.pattern === pattern).sort((a, b) => a.color.localeCompare(b.color));
  const pickGrade = (next) => { setPickedGrade(next); setPickedPattern(''); onChange(''); };
  const pickPattern = (next) => { setPickedPattern(next); onChange(''); };
  if (needsStyle) return <p className="cover-empty">Choose a style first. Covers are checked against that exact style.</p>;
  if (!swatches.length) return <p className="cover-empty">No covers are listed for this model.</p>;
  return <div className="cover-picker">
    <label className="form-field"><span>{label} grade</span><select aria-label={`${label} grade`} value={grade} onChange={(event) => pickGrade(event.target.value)}><option value="">Choose a grade…</option>{grades.map((item) => <option key={item.grade} value={item.grade}>{item.grade} · {item.material}</option>)}</select></label>
    {grade && kinds.length > 0 && <p className="cover-note grade-kinds"><strong>Grade {grade} here:</strong> {kinds.map((item) => `${item.kind} (${item.patterns})`).join(' · ')}. The letter is the price tier, the kind of cover is what's listed.</p>}
    {grade && <label className="form-field"><span>Pattern</span><select aria-label={`${label} pattern`} value={pattern} onChange={(event) => pickPattern(event.target.value)}><option value="">Choose a pattern…</option>{patterns.map(([code, item]) => <option key={code} value={code}>{`${item.name ? `${item.name} · ${code}` : code}${item.kind ? ` · ${item.kind}` : ''}`}</option>)}</select></label>}
    {grade && pattern && <div className="form-field colour-field" role="radiogroup" aria-label={`${label} colour`}><span>Colour</span><div className="colour-chips">{colours.map((item) => { const tone = tones?.[item.colorName]; const on = selected?.color === item.color; return <button type="button" role="radio" aria-checked={on} key={item.code} className={`colour-chip${on ? ' selected' : ''}`} onClick={() => onChange(item.code, item)}><i className={`colour-dot${tone ? '' : ' unknown'}`} style={tone ? { background: tone } : undefined} /><span>{item.colorName || `Colour ${item.color}`}{item.colorName && <small>{item.color}</small>}</span></button>; })}</div>{tones && <small className="colour-note">Tones are approximate. Check the real swatch.</small>}</div>}
    {selected && <p className="cover-note"><strong>{selected.name}</strong> · {selected.code}{describe ? ` · ${describe(selected)}` : selected.basis === 'cap code' ? ` · accepted by cap code ${selected.capCode}. Confirm for this exact style.` : ''}</p>}
  </div>;
}
