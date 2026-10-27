import React, { useMemo, useState } from 'react';

const byMaterialThenGrade = (a, b) => (a.material === b.material ? a.grade.localeCompare(b.grade) : a.material === 'Fabric' ? -1 : 1);

/** Grade, pattern and colour selects over a model's covers. `value` is the full cover code (grade + 4-digit pattern + 2-digit colour). */
export function CoverPicker({ swatches, value, onChange, label = 'Cover' }) {
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
    swatches.filter((item) => item.grade === grade).forEach((item) => { if (!seen.has(item.pattern)) seen.set(item.pattern, item.patternName); });
    return [...seen.entries()].sort((a, b) => String(a[1] || a[0]).localeCompare(String(b[1] || b[0])));
  }, [swatches, grade]);
  const colours = swatches.filter((item) => item.grade === grade && item.pattern === pattern).sort((a, b) => a.color.localeCompare(b.color));
  const pickGrade = (next) => { setPickedGrade(next); setPickedPattern(''); onChange(''); };
  const pickPattern = (next) => { setPickedPattern(next); onChange(''); };
  if (!swatches.length) return <p className="cover-empty">No covers are in the supplied data for this model.</p>;
  return <div className="cover-picker">
    <label className="form-field"><span>{label} grade</span><select aria-label={`${label} grade`} value={grade} onChange={(event) => pickGrade(event.target.value)}><option value="">Choose a grade…</option>{grades.map((item) => <option key={item.grade} value={item.grade}>{item.grade} · {item.material}</option>)}</select></label>
    {grade && <label className="form-field"><span>Pattern</span><select aria-label={`${label} pattern`} value={pattern} onChange={(event) => pickPattern(event.target.value)}><option value="">Choose a pattern…</option>{patterns.map(([code, name]) => <option key={code} value={code}>{name ? `${name} · ${code}` : code}</option>)}</select></label>}
    {grade && pattern && <label className="form-field"><span>Colour</span><select aria-label={`${label} colour`} value={selected?.color || ''} onChange={(event) => { const match = colours.find((item) => item.color === event.target.value); onChange(match?.code || '', match); }}><option value="">Choose a colour…</option>{colours.map((item) => <option key={item.code} value={item.color}>{item.color}{item.colorName ? ` · ${item.colorName}` : ''}</option>)}</select></label>}
    {selected && <p className="cover-note"><strong>{selected.name}</strong> · {selected.code}{selected.basis === 'cap code' ? ` · accepted by cap code ${selected.capCode}. Confirm for this exact style.` : ''}</p>}
  </div>;
}
