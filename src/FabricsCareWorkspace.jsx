import { Term } from './Term.jsx';
import { Sheet } from './Sheet.jsx';
import React, { useMemo, useState } from 'react';
import { Droplets, Search, Shield, Sparkles } from './icons.jsx';
import { getCoverReach, swatchImageFor } from './logic.js';
import { SwatchTile } from './CoverPicker.jsx';

const TABS = ['Fabrics', 'Leather', 'Care guide'];
const WEAR = { N: 'Normal', P: 'Performance', Medium: 'Medium duty' };
const CAP_NAMES = { LL: 'Limited Leathers', LM: 'Limited Leather Mate', LS: 'Limited Leathers', RL: 'Limited Renew' };
const grade = (record) => String(record.coverCode).match(/^[A-Z]+/)?.[0] || '';
const colourList = (record) => (record.colors || []).map((code) => ({ code, name: record.colorNames?.[code] || '' }));

function Chips({ label, options, value, onChange }) {
  return <div className="chip-row" role="group" aria-label={label}>
    {options.map(([key, text]) => <button key={key} type="button" className={`chip ${value === key ? 'on' : ''}`} aria-pressed={value === key} onClick={() => onChange(value === key ? '' : key)}>{text}</button>)}
  </div>;
}

function Reach({ catalog, record, isLeather }) {
  const reach = useMemo(() => getCoverReach(catalog, record, isLeather), [catalog, record, isLeather]);
  const styleCount = reach.reduce((sum, item) => sum + item.styles, 0);
  if (!reach.length) return <p className="fabric-reach-empty">No style accepts this cover.</p>;
  return <details className="fabric-reach"><summary>{reach.length} {reach.length === 1 ? 'model' : 'models'} · {styleCount} {styleCount === 1 ? 'style' : 'styles'} accept cap {record.capCode}</summary>
    <p className="fabric-reach-models">{reach.map((item) => `${item.name} ${item.model}`).join(' · ')}</p>
    <p className="fabric-reach-note">Confirm the exact style before promising it.</p>
  </details>;
}

function CoverCard({ catalog, record, isLeather, definitions, priorLabel }) {
  const [open, setOpen] = useState(false);
  const wear = WEAR[record.wearability] || '';
  const cleaning = record.cleaningCode ? definitions.cleaningCodes?.[record.cleaningCode] || record.cleaningCode : '';
  const tones = catalog?.color_tones;
  const tags = (record.specialtyAttributes || []).map((code) => definitions.specialtyAttributes?.[code] || code);
  return <article className={`fabric-card card${open ? ' open' : ''}`}>
    <button type="button" className="fabric-card-head" aria-expanded={open} onClick={() => setOpen(!open)}>
      <span className="fabric-card-title"><strong>{record.patternName}</strong>{record.prior && <em className="fabric-prior-badge">{priorLabel} · not on the April 2026 list</em>}<small>{record.coverCode}</small></span>
      <span className="fabric-badges">
        {wear && <span className={`fabric-badge wear-${record.wearability}`}>{wear}</span>}
        {cleaning && <span className="fabric-badge">{cleaning}</span>}
      </span>
    </button>
    <div className="fabric-strip" aria-hidden="true">{colourList(record).slice(0, 10).map((item) => <span key={item.code} className="strip-tile"><SwatchTile photo={swatchImageFor(catalog?.swatch_index, record.coverCode, item.code, 'thumb')} tone={tones?.[item.name]} /></span>)}{record.colors.length > 10 && <span className="strip-more">+{record.colors.length - 10}</span>}</div>
    {tags.length > 0 && <p className="fabric-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</p>}
    {open && <div className="fabric-card-body">
      <p className="fabric-codes">Cap code <Term kind="cap" code={record.capCode} /> · Wearability <Term kind="wear" code={record.wearability === 'Medium' ? 'M' : record.wearability} /> · Cleaning <Term kind="clean" code={record.cleaningCode} />{(record.specialtyAttributes || []).map((code) => <React.Fragment key={code}> · <Term kind="special" code={code} /></React.Fragment>)}</p>
      {isLeather && <p><strong>{record.group}.</strong> {definitions.leatherGroups?.[record.group]}</p>}
      {isLeather && definitions.leatherTypes?.[record.leatherType] && <p><strong>{record.leatherType}.</strong> {definitions.leatherTypes[record.leatherType]}</p>}
            <ul className="fabric-colours">{colourList(record).map((item) => <li key={item.code}><SwatchTile photo={swatchImageFor(catalog?.swatch_index, record.coverCode, item.code, 'zoom')} tone={tones?.[item.name]} /><span className="tile-name">{item.name || `Colour ${item.code}`}</span><small>{record.coverCode}{item.code}</small></li>)}</ul>
      {record.prior
        ? <p className="fabric-reach-empty">{record.droppedColorsOnly ? 'The April 2026 list still carries this cover but not these colours.' : 'The April 2026 list does not carry this cover.'} Confirm it can still be ordered for the model before offering it.</p>
        : <Reach catalog={catalog} record={record} isLeather={isLeather} />}
    </div>}
  </article>;
}

function CareGuide({ catalog, definitions }) {
  const rules = catalog.fabric_cover_program_a26?.businessRules || {};
  const cleaning = catalog.cleaning_codes || [];
  const covers = [...(catalog.fabric_cover_program_a26?.fabrics || []), ...(catalog.fabric_cover_program_a26?.leathers || [])];
  const styleRows = (catalog.style_index_2026?.styles || []).filter((row) => row.kind === 'style');
  const capRows = ['DR', 'UR', 'DP', 'NP', 'PS', 'UE', 'VS', 'BU', 'RL', 'LL', 'LM', 'LS'].map((code) => ({ code, name: CAP_NAMES[code] || '', covers: covers.filter((item) => item.capCode === code).length, styles: styleRows.filter((row) => row.capCodes.includes(code)).length }));
  return <div className="care-guide">
    <section className="card"><h2><Droplets size={17} /> Cleaning codes</h2>
      <dl>{Object.entries(definitions.cleaningCodes || {}).map(([code, name]) => { const detail = cleaning.find((item) => item.code === code || (code === 'WS' && item.code === 'W-S')); return <div key={code}><dt>{code}</dt><dd><strong>{name}</strong>{detail?.instruction ? ` · ${detail.instruction}` : ''}</dd></div>; })}</dl>
    </section>
    <section className="card"><h2><Shield size={17} /> Wearability</h2>
      <dl>{Object.entries(definitions.wearability || {}).map(([code, item]) => <div key={code}><dt>{code === 'Medium' ? 'M' : code}</dt><dd><strong>{item.name}</strong> · {item.description}</dd></div>)}</dl>
      {rules.mediumDutyRestrictions && <p className="care-rule">Medium duty is not allowed on {rules.mediumDutyRestrictions.prohibited.join(', ').toLowerCase()}.</p>}
    </section>
    <section className="card"><h2><Sparkles size={17} /> Special fabric features</h2>
      <dl>{Object.entries(definitions.specialtyAttributes || {}).map(([code, name]) => <div key={code}><dt>{code}</dt><dd>{name}</dd></div>)}</dl>
    </section>
    <section className="card"><h2>Leather types and groups</h2>
      <dl>{Object.entries(definitions.leatherTypes || {}).map(([name, text]) => <div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}</dl>
      <dl>{Object.entries(definitions.leatherGroups || {}).map(([name, text]) => <div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}</dl>
    </section>
    <section className="card"><h2>Cap codes</h2>
      <p className="care-rule">A cap code is the cover family. Each style lists the cap codes it accepts, and each cover belongs to one.</p>
      <dl>{capRows.map((row) => <div key={row.code}><dt>{row.code}</dt><dd>{row.name && <strong>{row.name} · </strong>}{row.covers} {row.covers === 1 ? 'cover' : 'covers'} in the cover program · accepted by {row.styles} {row.styles === 1 ? 'style' : 'styles'}</dd></div>)}</dl>
      {rules.pillowsNotAllowedCapCodes && <p className="care-rule">Accent pillows are not available in {rules.pillowsNotAllowedCapCodes.join(', ')} covers.</p>}
    </section>
  </div>;
}

export function FabricsCareWorkspace({ catalog }) {
  const program = catalog.fabric_cover_program_a26 || { fabrics: [], leathers: [], definitions: {} };
  const definitions = program.definitions || {};
  const [tab, setTab] = useState('Fabrics');
  const [includePrior, setIncludePrior] = useState(false);
  const prior = program.priorSeason;
  const [query, setQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [wearFilter, setWearFilter] = useState('');
  const [cleanFilter, setCleanFilter] = useState('');
  const [featureFilter, setFeatureFilter] = useState('');
  const [capFilter, setCapFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isLeather = tab === 'Leather';
  const priorOf = (list) => (includePrior && prior ? (list || []).map((record) => ({ ...record, prior: true })) : []);
  const records = isLeather ? [...program.leathers, ...priorOf(prior?.leathers)] : [...program.fabrics, ...priorOf(prior?.fabrics)];
  const matches = (record) => {
    const text = `${record.patternName} ${record.coverCode} ${Object.values(record.colorNames || {}).join(' ')} ${(record.models || []).join(' ')}`.toLowerCase();
    if (query.trim() && !text.includes(query.trim().toLowerCase())) return false;
    if (capFilter && record.capCode !== capFilter) return false;
    if (isLeather) return !typeFilter || record.leatherType === typeFilter;
    return (!gradeFilter || grade(record) === gradeFilter) && (!wearFilter || record.wearability === wearFilter) && (!cleanFilter || record.cleaningCode === cleanFilter) && (!featureFilter || (record.specialtyAttributes || []).includes(featureFilter));
  };
  const shown = useMemo(() => records.filter(matches).sort((a, b) => a.patternName.localeCompare(b.patternName)), [records, query, gradeFilter, wearFilter, cleanFilter, featureFilter, capFilter, typeFilter, isLeather]); // eslint-disable-line react-hooks/exhaustive-deps
  const filtering = Boolean(query.trim() || gradeFilter || wearFilter || cleanFilter || featureFilter || capFilter || typeFilter);
  const sections = useMemo(() => {
    const groups = new Map();
    for (const record of shown) {
      const name = isLeather ? `${record.leatherType} leather` : `Grade ${grade(record)}`;
      groups.set(name, [...(groups.get(name) || []), record]);
    }
    return [...groups].map(([name, items]) => ({ name, items })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [shown, isLeather]);
  const grades = [...new Set(program.fabrics.map(grade))].sort();
  const caps = [...new Set(records.map((record) => record.capCode))].sort();
  const activeFilters = [gradeFilter, wearFilter, cleanFilter, featureFilter, capFilter, typeFilter].filter(Boolean).length;
  const clearFilters = () => { setGradeFilter(''); setWearFilter(''); setCleanFilter(''); setFeatureFilter(''); setCapFilter(''); setTypeFilter(''); };
  const filterGroups = [
    ...(isLeather ? [['Leather type', typeFilter, setTypeFilter, Object.keys(definitions.leatherTypes || {}).map((name) => [name, name])]] : [
      ['Grade', gradeFilter, setGradeFilter, grades.map((item) => [item, `Grade ${item}`])],
      ['Wearability', wearFilter, setWearFilter, Object.entries(WEAR)],
      ['Cleaning', cleanFilter, setCleanFilter, Object.entries(definitions.cleaningCodes || {})],
      ['Special feature', featureFilter, setFeatureFilter, Object.entries(definitions.specialtyAttributes || {})],
    ]),
    ['Cap code', capFilter, setCapFilter, caps.map((item) => [item, `Cap ${item}`])],
  ];
  const reset = () => { setQuery(''); setGradeFilter(''); setWearFilter(''); setCleanFilter(''); setFeatureFilter(''); setCapFilter(''); setTypeFilter(''); };
  const changeTab = (next) => { setTab(next); reset(); };
  return <section className="module-page fabrics-index">
    <div className="module-intro"><h1>Fabrics &amp; leather</h1></div>
    <div className="chip-row" role="tablist" aria-label="Fabrics and care sections">{TABS.map((name) => <button key={name} type="button" role="tab" aria-selected={tab === name} className={`chip ${tab === name ? 'on' : ''}`} onClick={() => changeTab(name)}>{name}{name === 'Fabrics' ? ` · ${program.fabrics.length}` : name === 'Leather' ? ` · ${program.leathers.length}` : ''}</button>)}</div>
    {prior && tab !== 'Care guide' && <div className="fabric-prior-toggle">
      <button type="button" className={`chip ${includePrior ? 'on' : ''}`} aria-pressed={includePrior} onClick={() => setIncludePrior(!includePrior)}>Include {prior.label}</button>
    </div>}
    {tab === 'Care guide' ? <CareGuide catalog={catalog} definitions={definitions} /> : <>
      <div className="knowledge-search card"><Search size={19} /><input aria-label={`Search ${tab.toLowerCase()}`} placeholder="Search a pattern, cover code or colour" value={query} onChange={(event) => setQuery(event.target.value)} /><span className="product-index-count">{shown.length} shown</span></div>
      <div className="fabric-filter-bar">
        <button type="button" className={`chip fabric-filter-btn${activeFilters ? ' on' : ''}`} aria-haspopup="dialog" onClick={() => setFiltersOpen(true)}>Filters{activeFilters > 0 ? ` · ${activeFilters}` : ''}</button>
        {activeFilters > 0 && <button type="button" className="chip" onClick={clearFilters}>Clear filters</button>}
      </div>
      <p className="fabric-help">New to this? Tap to learn: <Term kind="term" code="GRADE">What is a grade?</Term> <Term kind="term" code="CAP">What is a cap code?</Term> <Term kind="term" code="PATTERN">Pattern</Term> <Term kind="term" code="COLOR">Color</Term></p>
      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filter covers" footer={<div className="fabric-filter-foot"><button type="button" className="back-button" onClick={clearFilters} disabled={!activeFilters}>Clear</button><button type="button" className="primary-button" onClick={() => setFiltersOpen(false)}>Show {shown.length} {shown.length === 1 ? 'cover' : 'covers'}</button></div>}>
        {filterGroups.map(([label, value, onChange, options]) => <div className="fabric-filter-group" key={label}><h3>{label === 'Grade' ? <Term kind="term" code="GRADE">Grade</Term> : label === 'Cap code' ? <Term kind="term" code="CAP">Cap code</Term> : label}</h3><Chips label={label} options={options} value={value} onChange={onChange} /></div>)}
      </Sheet>
      <div className="fabric-sections">{sections.map((section) => <details key={`${tab}-${section.name}-${filtering}`} className="fabric-section" open={filtering}><summary><strong>{section.name}</strong><span>{section.items.length} {section.items.length === 1 ? 'cover' : 'covers'}</span></summary><div className="fabric-grid">{section.items.map((record, itemIndex) => <CoverCard key={`${record.prior ? 'prior' : 'april'}-${record.coverCode}-${itemIndex}`} priorLabel={prior?.label} catalog={catalog} record={record} isLeather={isLeather} definitions={definitions} />)}</div></details>)}</div>
      {!shown.length && <p className="empty-state">Nothing matches. <button type="button" className="back-button" onClick={reset}>Clear filters</button></p>}
    </>}
  </section>;
}
