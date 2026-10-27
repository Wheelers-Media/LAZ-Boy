import React, { useMemo, useState } from 'react';
import { Droplets, Search, Shield, Sparkles } from 'lucide-react';
import { getCoverReach } from './logic.js';

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

function Pick({ label, options, value, onChange }) {
  return <label className="form-field fabric-pick"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}><option value="">All</option>{options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>;
}

function Reach({ catalog, record, isLeather }) {
  const reach = useMemo(() => getCoverReach(catalog, record, isLeather), [catalog, record, isLeather]);
  const styleCount = reach.reduce((sum, item) => sum + item.styles, 0);
  if (!reach.length) return <p className="fabric-reach-empty">No style accepts this cover.</p>;
  return <div className="fabric-reach">
    <p><strong>{reach.length} {reach.length === 1 ? 'model' : 'models'} · {styleCount} {styleCount === 1 ? 'style' : 'styles'}</strong> accept cap code {record.capCode}. Confirm the exact style before promising it.</p>
    <p className="fabric-reach-models">{reach.map((item) => `${item.name} ${item.model}`).join(' · ')}</p>
  </div>;
}

function CoverCard({ catalog, record, isLeather, definitions, priorLabel }) {
  const [open, setOpen] = useState(false);
  const wear = WEAR[record.wearability] || '';
  const cleaning = record.cleaningCode ? definitions.cleaningCodes?.[record.cleaningCode] || record.cleaningCode : '';
  const tags = (record.specialtyAttributes || []).map((code) => definitions.specialtyAttributes?.[code] || code);
  return <article className="fabric-card card">
    <button type="button" className="fabric-card-head" aria-expanded={open} onClick={() => setOpen(!open)}>
      <span><strong>{record.patternName}</strong>{record.prior && <em className="fabric-prior-badge">{priorLabel} · not on the April 2026 list</em>}<small>{record.coverCode} · {isLeather ? record.leatherType : `Grade ${grade(record)}`} · cap {record.capCode}</small></span>
      <span className="fabric-badges">
        {wear && <span className={`fabric-badge wear-${record.wearability}`}>{wear}</span>}
        {cleaning && <span className="fabric-badge">{cleaning}</span>}
      </span>
    </button>
    {tags.length > 0 && <p className="fabric-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</p>}
    {open && <div className="fabric-card-body">
      {isLeather && <p><strong>{record.group}.</strong> {definitions.leatherGroups?.[record.group]}</p>}
      {isLeather && definitions.leatherTypes?.[record.leatherType] && <p><strong>{record.leatherType}.</strong> {definitions.leatherTypes[record.leatherType]}</p>}
      <p className="field-label">Colours · full cover code</p>
      <ul className="fabric-colours">{colourList(record).map((item) => <li key={item.code}><code>{record.coverCode}{item.code}</code>{item.name ? ` ${item.name}` : ''}</li>)}</ul>
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
  const isLeather = tab === 'Leather';
  const priorOf = (list) => (includePrior && prior ? (list || []).map((record) => ({ ...record, prior: true })) : []);
  const records = isLeather ? [...program.leathers, ...priorOf(prior?.leathers)] : [...program.fabrics, ...priorOf(prior?.fabrics)];
  const colourCount = [...program.fabrics, ...program.leathers].reduce((sum, record) => sum + record.colors.length, 0);
  const coverCount = new Set([...program.fabrics, ...program.leathers].map((record) => record.coverCode)).size;
  const priorColourCount = [...(prior?.fabrics || []), ...(prior?.leathers || [])].reduce((sum, record) => sum + record.colors.length, 0);
  const priorCoverCount = new Set([...(prior?.fabrics || []), ...(prior?.leathers || [])].filter((record) => !record.droppedColorsOnly).map((record) => record.coverCode)).size;
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
  const reset = () => { setQuery(''); setGradeFilter(''); setWearFilter(''); setCleanFilter(''); setFeatureFilter(''); setCapFilter(''); setTypeFilter(''); };
  const changeTab = (next) => { setTab(next); reset(); };
  return <section className="module-page fabrics-index">
    <div className="module-intro"><p className="eyebrow">FABRICS, LEATHER &amp; CARE</p><h1>Every cover, <em>with how to care for it.</em></h1><p>{coverCount} covers and {colourCount} colour options on the April 2026 list. Open a card to see its colours, full cover codes and the styles that accept it.</p></div>
    <div className="chip-row" role="tablist" aria-label="Fabrics and care sections">{TABS.map((name) => <button key={name} type="button" role="tab" aria-selected={tab === name} className={`chip ${tab === name ? 'on' : ''}`} onClick={() => changeTab(name)}>{name}{name === 'Fabrics' ? ` · ${program.fabrics.length}` : name === 'Leather' ? ` · ${program.leathers.length}` : ''}</button>)}</div>
    {prior && tab !== 'Care guide' && <div className="fabric-prior-toggle">
      <button type="button" className={`chip ${includePrior ? 'on' : ''}`} aria-pressed={includePrior} onClick={() => setIncludePrior(!includePrior)}>Include {prior.label} covers · {priorCoverCount} covers, {priorColourCount} colours</button>
      {includePrior && <p>{prior.note}</p>}
    </div>}
    {tab === 'Care guide' ? <CareGuide catalog={catalog} definitions={definitions} /> : <>
      <div className="knowledge-search card"><Search size={19} /><input aria-label={`Search ${tab.toLowerCase()}`} placeholder="Search a pattern, cover code or colour" value={query} onChange={(event) => setQuery(event.target.value)} /><span className="product-index-count">{shown.length} shown</span></div>
      <div className="fabric-filters">
        {!isLeather && <>
          <Pick label="Grade" value={gradeFilter} onChange={setGradeFilter} options={grades.map((item) => [item, `Grade ${item}`])} />
          <Pick label="Wearability" value={wearFilter} onChange={setWearFilter} options={Object.entries(WEAR)} />
          <Pick label="Cleaning" value={cleanFilter} onChange={setCleanFilter} options={Object.entries(definitions.cleaningCodes || {})} />
          <Pick label="Special feature" value={featureFilter} onChange={setFeatureFilter} options={Object.entries(definitions.specialtyAttributes || {})} />
        </>}
        {isLeather && <Pick label="Leather type" value={typeFilter} onChange={setTypeFilter} options={Object.keys(definitions.leatherTypes || {}).map((name) => [name, name])} />}
        <Pick label="Cap code" value={capFilter} onChange={setCapFilter} options={caps.map((item) => [item, `Cap ${item}`])} />
        {filtering && <button type="button" className="back-button" onClick={reset}>Clear filters</button>}
      </div>
      <div className="fabric-sections">{sections.map((section, index) => <details key={`${tab}-${section.name}-${filtering}`} className="fabric-section" open={filtering || index === 0}><summary><strong>{section.name}</strong><span>{section.items.length} {section.items.length === 1 ? 'cover' : 'covers'}</span></summary><div className="fabric-grid">{section.items.map((record, itemIndex) => <CoverCard key={`${record.prior ? 'prior' : 'april'}-${record.coverCode}-${itemIndex}`} priorLabel={prior?.label} catalog={catalog} record={record} isLeather={isLeather} definitions={definitions} />)}</div></details>)}</div>
      {!shown.length && <p className="empty-state">Nothing matches. <button type="button" className="back-button" onClick={reset}>Clear filters</button></p>}
    </>}
  </section>;
}
