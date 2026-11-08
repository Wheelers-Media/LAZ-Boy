import React, { useMemo, useState } from 'react';
import { buildAvailability, buildReference2025, checkCoverCode, checkStyleCode, classifyCode, prefixGaps } from './logic/availability.js';
import { swatchImageFor } from './logic.js';

const STATUS_TEXT = {
  available: 'On the Available Products list',
  'coming-soon': 'On the Coming Soon list (Oct 18)',
  both: 'On both the Available and Coming Soon lists',
  'not-listed': 'Not on the supplied list',
};

/** "Is this code on the list?" check for styles and covers, from public/available-products-2026.json. */
export function AvailabilityCheck({ list, reference, catalog }) {
  const [query, setQuery] = useState('');
  const availability = useMemo(() => buildAvailability(list), [list]);
  const styleRows = catalog?.style_index_2026?.styles || [];
  const ref2025 = useMemo(() => buildReference2025(reference), [reference]);
  const gaps = useMemo(() => prefixGaps(availability, styleRows, ref2025), [availability, styleRows, ref2025]);
  if (!list) return null;
  const parsed = classifyCode(query);
  let result = null;
  if (query.trim() && parsed.kind === 'style') result = { type: 'style', ...checkStyleCode(availability, parsed.code, styleRows, ref2025) };
  else if (query.trim() && parsed.kind === 'cover') result = { type: 'cover', ...checkCoverCode(availability, parsed.code, catalog?.fabric_cover_program_a26, (cover, color) => swatchImageFor(catalog?.swatch_index, cover, color)) };
  const counts = list._meta?.counts || {};
  return (
    <details className="support-card card fold-card availability-check">
      <summary><div className="module-head"><div><h2>Available list check</h2><p>Type a style (44P-726) or cover (B156175) to see if it is on the supplied list.</p></div></div></summary>
      <label className="form-field"><span>Style or cover code</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="44P-726 or B156175" autoCapitalize="characters" autoCorrect="off" spellCheck="false" /></label>
      {query.trim() && !result && <div className="lookup-result warning"><p><strong>Not a style or cover code.</strong><small>A style is 6 characters (3 prefix + 3 model). A cover is 1–2 letters + 5–6 digits.</small></p></div>}
      {result && result.type === 'style' && <div className={`lookup-result ${result.status === 'not-listed' ? 'warning' : 'good'}`}><p><strong>{result.code}: {STATUS_TEXT[result.status]}</strong>
        <small>Prefix {result.prefix}{result.prefixDefinition ? ` (${result.prefixDefinition})` : ''} · model {result.model}. {result.inApp ? `In this app as ${result.appName || result.appFamily}.` : result.prefixInApp ? 'This exact style has no record in the app (the prefix does).' : 'Neither this style nor its prefix has a record in the app, so there is no detail to show.'}
          {result.in2025.map((row) => <span key={`${row.catalog}${row.page}`} className="avail-2025"><br />Summer/Fall 2025 {row.catalog} catalog, p.{row.page}: {row.name}{row.type ? `, ${row.type}` : ''}{row.dims ? `, ${row.dims}` : ''}{row.wql ? ' (While Quantities Last)' : ''}{row.new ? ' (new in 2025)' : ''}{row.in26 ? '' : '. Not in the 2026 style index: confirm it is still sold'}.</span>)}</small></p></div>}
      {result && result.type === 'cover' && <div className={`lookup-result ${result.status === 'not-listed' ? 'warning' : 'good'}`}><p><strong>{result.code}: {result.status === 'available' ? 'On the Available Covers list' : 'Not on the supplied list'}</strong>
        <small>Cover {result.cover} · colour {result.color}. {result.inProgram ? `${result.patternName}${result.colorName ? ` ${result.colorName}` : ''} in the April 2026 program${result.colorInProgram ? '' : ' (this colour is not in the program)'}.` : 'This cover is not in the April 2026 program in the app.'}{result.hasSwatchPhoto ? ' A swatch photo is in the app.' : ''}</small></p></div>}
      <p className="fine-print">{counts.styles} styles · {counts.covers} covers · {counts.comingSoon} coming-soon codes on the list. {list._meta?.note}</p>
      {gaps.length > 0 && <details className="support-topic"><summary>{gaps.length} prefixes on the list have no style record in the app</summary>
        <p className="fine-print">Count of listed styles per prefix. Prefix meanings come from the Summer/Fall 2025 Motion catalog where it lists them. These styles cannot be built here until their 2026 catalog pages are added.</p>
        <p>{gaps.map((gap) => `${gap.prefix}${gap.definition ? ` ${gap.definition}` : ''} (${gap.count})`).join(' · ')}</p></details>}
    </details>
  );
}
