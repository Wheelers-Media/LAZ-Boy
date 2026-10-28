import React, { useMemo } from 'react';
import { AlertTriangle, Armchair, ArrowLeft, ArrowRight, Check, ClipboardCheck, Copy, FileText, Info, MessageSquareText, Ruler, Sparkles } from 'lucide-react';
import { buildDcgNotes, DCG_NOTE_LIMIT, FIT_NEEDS, SIT_VERDICTS, getCatalogCapabilityLeads, getContextualModelOptions, getContextualPreferenceChoices, getDimensionBasedRecommendations, getRecommendations, getRoomClearance, getSeatFit, getSectionalLeads, heightInches, sitLogToText, summarizeSitLog } from './logic.js';

export const FIT_STEPS = ['Their fit', 'What they need', 'Room and comfort', 'Real life'];
export const FIT_DEFAULTS = {
  step: 0,
  answers: { height: '', weight: '', need: '', category: 'Recliners', clearance: 'Standard room · 18 in', mechanism: 'Power recline', cushion_preference: 'Standard Poly', support_preference: 'No preference yet', household: [], material_preference: 'No preference yet', hip_breadth_inches: '', thigh_length_inches: '', popliteal_height_inches: '' },
};

const CATEGORIES = ['Recliners', 'High-leg designer', 'Motion sofas / loveseats', 'Modular sectionals', 'Stationary suites', 'Sleepers', 'Lift chairs'];
const MECHANISMS = [
  ['Manual', 'Simple, dependable reclining'],
  ['Power recline', 'Effortless adjustment at a touch'],
  ['Power + headrest', 'Fine-tune head and foot support'],
  ['Power + lumbar', 'Extra lower-back support'],
  ['Lift chair', 'Bronze-series lift support'],
  ['Gold-series lift', 'Gold-series power lift'],
  ['No reclining mechanism', 'Stationary seating and sleepers'],
];
const ROOMS = [
  ['Tight fit', '4 in or less', 'Wall-away motion only', 4],
  ['A little room', '6–10 in', 'Flexible placement', 10],
  ['Standard room', '12–18 in', 'Room for rocking or gliding', 18],
];
// La-Z-Boy's public Recliner Fit guide sizes by height. The Canada research file cuts the bands one inch differently, so both are kept.
const SIZES = [
  ['Petite', '5′3″ and under', '5′2″'],
  ['Small', '5′4″ – 5′9″', '5′7″'],
  ['Tall', '5′10″ – 6′2″', '5′11″'],
  ['Extra Tall', '6′3″ and up', '6′4″'],
];
const HEIGHT_CHOICES = Array.from({ length: 21 }, (_, index) => `${4 + Math.floor((10 + index) / 12)}′${(10 + index) % 12}″`);
const guideSize = (inches) => (inches <= 63 ? 'Petite' : inches <= 69 ? 'Small' : inches <= 74 ? 'Tall' : 'Extra Tall');
const researchScale = (inches) => (inches <= 64 ? 'Petite' : inches <= 69 ? 'Small / Medium' : inches <= 74 ? 'Tall / Large' : 'Extra Tall / XL');
const SIT_TEST = [
  'Feet flat on the floor with the seat back in the upright position',
  'Back and lower back supported without perching',
  'Head and neck rest comfortably when reclined',
  'Fully extended leg rest supports the calves, not just the heels',
  'Getting in and out feels easy',
];
const GREET = [
  'Ask what room or project they are getting ideas for.',
  'Ask where the recliner will live in that room.',
  'Use these three as reference points, then add one or two of your own that fit their style and features.',
  'Make them sit. The sit test is the part no quiz can replace.',
  'Customization (cover, finish, options) is your conversation. This screen does not cover it.',
];

const SEAT_ORDER = { in: 0, near: 1, unscored: 2, out: 3 };
const SEAT_TEXT = { in: 'in range', near: 'close', out: 'outside range' };
const chip = (selected) => `chip ${selected ? 'on' : ''}`;

function Choices({ label, options, value, onChange }) {
  return <div className="fitq-group" role="group" aria-label={label}>
    {options.map(([key, title, hint]) => <button key={key} type="button" className={`fitq-choice ${value === key ? 'selected' : ''}`} aria-pressed={value === key} onClick={() => onChange(key)}>
      <strong>{title}</strong>{hint && <small>{hint}</small>}{value === key && <Check size={14} className="fitq-check" aria-hidden="true" />}
    </button>)}
  </div>;
}

function SitLogger({ match, inches, onLogSit }) {
  const [open, setOpen] = React.useState(false);
  const [note, setNote] = React.useState('');
  if (!open) return <button type="button" className="back-button" onClick={() => setOpen(true)}>Log a sit test</button>;
  return <div className="fitq-sit">
    <p className="field-label">How did {match.name} sit?</p>
    <div className="chip-row" role="group" aria-label="Sit test result">{SIT_VERDICTS.map((item) => <button key={item.key} type="button" className="chip" onClick={() => { onLogSit({ modelCode: match.code, modelName: match.name, inches, verdict: item.key, note }); setOpen(false); setNote(''); }}>{item.label}</button>)}</div>
    <label className="form-field"><span>Note <span className="optional">optional</span></span><input value={note} maxLength={200} onChange={(event) => setNote(event.target.value)} /></label>
  </div>;
}

function MatchCard({ match, weight, inches, sitLog, onLogSit, onIndex, onBuild, onSectional }) {
  const floor = summarizeSitLog(sitLog, match.code, inches);
  const isResearch = match.tier === 'B';
  return <article className={`fitq-match card tier-${match.tier}`}>
    <header>
      <span className="fitq-rank">{match.rank}</span>
      <div><h3>{match.name}</h3><p>{match.category}</p></div>
      <span className="fitq-tier">{match.sectional ? 'Modular' : isResearch ? 'Research match' : 'Catalog match'}</span>
    </header>
    <ul className="fitq-why">{match.why.map((line) => <li key={line}>{line}</li>)}</ul>
    {match.seat?.checks.length > 0 && <ul className="fitq-seat" aria-label="Seat check">{match.seat.checks.map((check) => <li key={check.key} className={`seat-${check.status}`}><span>{check.label} {check.chair} in</span><small>{SEAT_TEXT[check.status]} · {check.target}</small></li>)}</ul>}
    {match.seat?.status === 'unscored' && !match.sectional && <p className="fitq-seat-none">Seat size not listed for this style. Sit-test it.</p>}
    {floor.total > 0 && <p className="fitq-floor">Your floor: {floor.good} of {floor.total} sat well{floor.similar.total > 0 ? `. Near this height: ${floor.similar.good} of ${floor.similar.total}` : ''}.</p>}
    {match.flags.map((flag) => <p key={flag} className="fitq-flag"><AlertTriangle size={14} aria-hidden="true" /> {flag}</p>)}
    <dl className="fitq-facts">
      <div><dt>Capacity</dt><dd>{match.capacity}</dd></div>
      <div><dt>{isResearch ? 'Fit basis' : 'Why it is listed'}</dt><dd>{match.basis}</dd></div>
    </dl>
    {weight && !match.capacityKnown && <p className="fitq-flag"><AlertTriangle size={14} aria-hidden="true" /> Capacity is not listed. Confirm it for {weight} lb before offering this model.</p>}
    <footer>
      <SitLogger match={match} inches={inches} onLogSit={onLogSit} />
      <button type="button" className="back-button" onClick={() => onIndex(match.name)}>See in Product Index</button>
      {match.sectional
        ? <button type="button" className="primary-button" onClick={() => onSectional(match.code)}>Design in Sectional Studio <ArrowRight size={14} /></button>
        : <button type="button" className="primary-button" onClick={() => onBuild(match.code)}>Build a SKU <ArrowRight size={14} /></button>}
    </footer>
  </article>;
}

export function FitDiscover({ catalog, research, state, setState, onIndex, onBuild, onOpenTab, onInfo, onCopyText, onSectional, sitLog = [], onLogSit = () => {} }) {
  const { step, answers } = state;
  const set = (patch) => setState((previous) => ({ ...previous, answers: { ...previous.answers, ...patch } }));
  const go = (next) => setState((previous) => ({ ...previous, step: next }));
  const inches = heightInches(answers.height);
  const hasHeight = Number.isFinite(inches);

  const isSectional = answers.category === 'Modular sectionals';
  const available = useMemo(() => MECHANISMS.filter(([name]) => (isSectional ? getSectionalLeads(catalog, { mechanism: name }).length > 0 : getContextualModelOptions(catalog, { ...answers, mechanism: name, scale: '' }).length > 0)), [catalog, answers.category, answers.clearance]);
  const mechanism = available.some(([name]) => name === answers.mechanism) ? answers.mechanism : available[0]?.[0] || answers.mechanism;
  const engine = useMemo(() => ({
    ...answers, mechanism, scale: hasHeight ? researchScale(inches) : '', upgrades: [], fabric: '', kidsPets: answers.household.length > 0,
    seat_depth_preference: 'Not sure yet', back_support_preference: 'Not sure yet',
  }), [answers, mechanism, inches, hasHeight]);

  const cushions = useMemo(() => getContextualPreferenceChoices(catalog, engine, 'cushion'), [catalog, engine.category, engine.clearance, mechanism]);
  const supports = useMemo(() => getContextualPreferenceChoices(catalog, engine, 'support'), [catalog, engine.category, engine.clearance, mechanism]);
  const results = useMemo(() => {
    if (step < 4 || !hasHeight) return null;
    if (isSectional) {
      const sectionals = getSectionalLeads(catalog, { mechanism }).map((lead, index) => ({
        tier: 'S', code: lead.model_code, name: lead.model_name, category: `${lead.family} modular sectional`, sectional: true, rank: index + 1,
        why: [`${lead.family} modular · ${lead.pieceCount} pieces in Sectional Studio`, mechanism],
        flags: [], capacity: 'Not listed', capacityKnown: false,
        basis: 'Lay out the pieces to size it to the room, then take the piece SKUs into RMS.',
      }));
      return { matches: sectionals, hidden: 0, dimension: [] };
    }
    const recs = getRecommendations(catalog, engine, research);
    const withoutWeight = engine.weight ? getRecommendations(catalog, { ...engine, weight: '' }, research) : recs;
    const leads = getCatalogCapabilityLeads(catalog, engine, 8);
    const dimension = getDimensionBasedRecommendations(catalog, engine, research);
    const roomInches = getRoomClearance(engine.clearance);
    const matches = [
      ...recs.map((model) => {
        const conflict = model.fit_evidence?.fit_claim?.status === 'conflicting_fit_guidance' || model.fit_evidence?.research_document?.fit_status === 'conflicting';
        const known = Number.isFinite(model.weight_limit_lbs);
        return {
          tier: 'B', code: model.model_code, name: model.model_name, category: model.category,
          why: [`Research lists it for ${model.fit_guidance.height_summary} (${model.fit_guidance.band})`, `${engine.category} · ${mechanism}`, `Room behind allows up to ${roomInches} in`],
          flags: conflict ? ['Fit sources disagree for this model. Sit-test it and read the Product Index note.'] : [],
          capacity: known ? `${model.weight_limit_lbs} lb documented. Confirm the exact style.` : 'Not listed',
          capacityKnown: known,
          basis: 'Listed for their height. Have them sit in it to confirm.',
        };
      }),
      ...leads.filter((lead) => !recs.some((model) => String(model.model_code) === String(lead.model_code))).map((lead) => {
        const known = Number.isFinite(lead.capacity_lbs);
        return {
          tier: 'C', code: String(lead.model_code), name: lead.model_name, category: lead.category,
          why: [`${engine.category} · ${mechanism}`, `Room behind allows up to ${roomInches} in`, `${lead.styles.length} listed ${lead.styles.length === 1 ? 'style' : 'styles'}: ${lead.styles.slice(0, 4).map((style) => style.code).join(', ')}${lead.styles.length > 4 ? '…' : ''}`],
          flags: [], capacity: lead.capacity_status, capacityKnown: known,
          basis: 'Matches the kind of piece and recline you picked. Have them sit in it to see if it suits them.',
        };
      }),
    ].map((match) => ({ ...match, seat: getSeatFit(catalog, research, { modelCode: match.code, answers: engine, inches }) }))
      .map((match, index) => ({ match, index }))
      .sort((a, b) => (SEAT_ORDER[a.match.seat.status] - SEAT_ORDER[b.match.seat.status]) || (a.index - b.index))
      .map(({ match }) => match).slice(0, 3).map((match, index) => ({ ...match, rank: index + 1 }));
    return { matches, hidden: Math.max(0, withoutWeight.length - recs.length), dimension: dimension.slice(0, 3) };
  }, [step, catalog, engine, research, mechanism, hasHeight]);

  const sizeName = hasHeight ? guideSize(inches) : '';
  const researchBand = hasHeight ? { 'Petite': 'Petite', 'Small / Medium': 'Small', 'Tall / Large': 'Tall', 'Extra Tall / XL': 'Extra Tall' }[researchScale(inches)] : '';
  const bandsDiffer = hasHeight && researchBand !== sizeName;
  const performance = (catalog.fabric_cover_program_a26?.fabrics || []).filter((item) => item.wearability === 'P').length;
  const fabricTotal = (catalog.fabric_cover_program_a26?.fabrics || []).length;
  const weightNumber = Number(answers.weight);
  const roomName = ROOMS.find(([name]) => answers.clearance.startsWith(name))?.[0] || 'Standard room';

  const setCategory = (category) => set({ category });
  const toggleHousehold = (key) => set({ household: answers.household.includes(key) ? answers.household.filter((item) => item !== key) : [...answers.household, key] });
  const stepHeading = ['About the person', 'What do they need?', 'Where, and how should it feel?', 'Real life'][step];

  if (step === 4) {
    const summary = [
      ['Height', answers.height || 'Not set', 0], ['Weight', answers.weight ? `${answers.weight} lb` : 'Not given', 0], ...(FIT_NEEDS.find((item) => item.key === answers.need && item.key !== 'unsure') ? [['Needs', FIT_NEEDS.find((item) => item.key === answers.need).label, 1]] : []), ['Looking for', answers.category, 1], ...(isSectional ? [] : [['Room', roomName, 2]]), ['Recline', mechanism, 2],
      ['Household', answers.household.length ? answers.household.join(' + ') : 'No kids or pets', 3],
    ];
    const notes = results ? buildDcgNotes({ answers, mechanism, roomName: isSectional ? '' : roomName, sizeName, matches: results.matches }) : null;
    return <div className="fitq fitq-results">
      <h1 className="sr-only">Fit and discover results</h1>
      <section className="fitq-head">
        <div><p className="eyebrow"><Sparkles size={13} /> {isSectional ? 'MODULAR LINES' : 'THREE TO SIT IN'}</p><h2>{isSectional ? <>Lines to lay out, <em>then sit in.</em></> : <>Worth sitting in, <em>not a final answer.</em></>}</h2><p>{isSectional ? 'Every modular line that matches. Open one in Sectional Studio to size it to their room.' : 'A short list built from what they told you. It is deliberately broad so they try more than one.'}</p></div>
        <button type="button" className="back-button" onClick={() => setState({ ...FIT_DEFAULTS, answers: { ...FIT_DEFAULTS.answers } })}>Start over</button>
      </section>
      <div className="fitq-summary" role="list">{summary.map(([label, value, target]) => <button role="listitem" type="button" key={label} className="fitq-pill" onClick={() => go(target)}><span>{label}</span><strong>{value}</strong></button>)}</div>
      {results?.hidden > 0 && <p className="tip-strip fitq-hold"><Info size={16} /><span><strong>{results.hidden} match {results.hidden === 1 ? 'is' : 'es are'} hidden.</strong> Capacity is under {answers.weight} lb or not listed.</span></p>}
      {bandsDiffer && <p className="tip-strip"><Info size={16} /><span>La-Z-Boy's public guide calls {answers.height} <strong>{sizeName}</strong>. The Canada research file puts it in a neighbouring band. Try both sizes.</span></p>}
      <div className="fitq-layout">
        <div className="fitq-matches">
          {results?.matches.length ? results.matches.map((match) => <MatchCard key={`${match.tier}-${match.code}`} match={match} weight={weightNumber > 0 ? String(weightNumber) : ''} onIndex={onIndex} onBuild={onBuild} onSectional={onSectional} inches={inches} sitLog={sitLog} onLogSit={onLogSit} />)
            : <section className="card fitq-empty"><h3>Nothing matches these answers.</h3><p>Nothing was loosened to fill the list. Change one answer above and look again, or browse the Product Index.</p><button type="button" className="primary-button" onClick={() => onOpenTab('Product Index')}>Open Product Index <ArrowRight size={14} /></button></section>}
          {results?.dimension.length > 0 && <section className="card fitq-dimension"><h3>Dimension screen · manual rocking recliners</h3><p>A screening comparison against published seat dimensions. It is not a fit confirmation.</p><ul>{results.dimension.map((item) => <li key={item.model_code}><strong>{item.model_name}</strong> · {item.dimension_comparison.tier}</li>)}</ul></section>}
        </div>
        <aside className="fitq-side">
          {notes && <section className="card fitq-notes"><h3><FileText size={16} /> Notes for DCG</h3>
            <p>Paste into DCG after they leave.</p>
            {[['Internal note', 'for Hidden Notes', notes.internal], ['Customer note', 'for Notes', notes.customer]].map(([title, where, text]) => <div className="fitq-notes-block" key={title}>
              <div className="fitq-notes-head"><strong>{title}</strong><small>{where} · {text.length} / {DCG_NOTE_LIMIT}</small></div>
              <pre className="fitq-note-text" tabIndex={0} aria-label={title}>{text}</pre>
              <button type="button" className="copy-button" onClick={() => onCopyText(text, title)}><Copy size={15} /> Copy {title.toLowerCase()}</button>
            </div>)}
          </section>}
          <section className="card"><h3><MessageSquareText size={16} /> Greet to Discover</h3><ol>{GREET.map((line) => <li key={line}>{line}</li>)}</ol></section>
          <section className="card"><h3><ClipboardCheck size={16} /> Sit-test checklist</h3><ul>{SIT_TEST.map((line) => <li key={line}>{line}</li>)}</ul>
            {sitLog.length > 0 && <><p className="fitq-floor">{sitLog.length} sit {sitLog.length === 1 ? 'test' : 'tests'} logged on this device.</p><button type="button" className="copy-button" onClick={() => onCopyText(sitLogToText(sitLog), 'Sit log')}><Copy size={15} /> Copy sit log</button></>}
          </section>
          <section className="card"><h3><Armchair size={16} /> Cover direction</h3>
            <p>{answers.household.length ? `With ${answers.household.join(' and ').toLowerCase()} at home, start with performance-rated fabrics: ${performance} of ${fabricTotal} fabrics in the A26 program.` : 'No kids or pets mentioned. Start from their look and feel preference.'}</p>
            {answers.material_preference !== 'No preference yet' && <p>They lean toward {answers.material_preference.toLowerCase()}.</p>}
            <button type="button" className="back-button" onClick={() => onOpenTab('Fabrics & Care')}>Open Fabrics &amp; Care <ArrowRight size={14} /></button>
          </section>
        </aside>
      </div>
    </div>;
  }

  return <div className="fitq">
    <h1 className="sr-only">Fit and discover</h1>
    <nav className="stepper" aria-label="Customer fit steps">{FIT_STEPS.map((name, index) => <button key={name} type="button" className={`step-item ${index === step ? 'current' : ''} ${index < step ? 'done' : ''}`} onClick={() => (index <= step || hasHeight) && go(index)} aria-current={index === step ? 'step' : undefined}><span className="step-number">{index < step ? <Check size={13} /> : `0${index + 1}`}</span><span className="step-name">{name}</span>{index < FIT_STEPS.length - 1 && <span className="step-track" />}</button>)}</nav>
    <section className="wizard-panel card fitq-panel">
      <div className="panel-heading"><div><h2>{stepHeading}</h2></div>
        <button type="button" className="icon-help" aria-label="More about this question" onClick={() => onInfo(FIT_STEPS[step], 'These answers build a short list to sit-test. They never confirm fit, capacity or clearance for a specific model.', '“I am just learning what matters most so I can put the right ones in front of you.”')}><Info size={16} /></button></div>
      <div className="wizard-body">
        {step === 0 && <>
          <label className="field-label">Who will sit in it most? Pick a size or set an exact height.</label>
          <Choices label="Size" value={sizeName} onChange={(name) => set({ height: SIZES.find(([key]) => key === name)[2] })} options={SIZES.map(([key, range]) => [key, key, range])} />
          <div className="inline-fields">
            <label className="form-field"><span>Exact height</span><select value={answers.height} onChange={(event) => set({ height: event.target.value })}><option value="">Choose…</option>{HEIGHT_CHOICES.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="form-field"><span>Heaviest person who will use it <span className="optional">optional · lb</span></span><input inputMode="numeric" placeholder="e.g. 240" value={answers.weight} onChange={(event) => set({ weight: event.target.value.replace(/[^\d]/g, '').slice(0, 3) })} /></label>
          </div>
          <details className="fitq-more"><summary>More detail · seated measurements <span className="optional">optional</span></summary>
            <div className="inline-fields">{[['hip_breadth_inches', 'Hip breadth (in)'], ['thigh_length_inches', 'Thigh length (in)'], ['popliteal_height_inches', 'Floor to back of knee (in)']].map(([key, label]) => <label className="form-field" key={key}><span>{label}</span><input inputMode="decimal" value={answers[key]} onChange={(event) => set({ [key]: event.target.value.replace(/[^\d.]/g, '').slice(0, 5) })} /></label>)}</div>
            <p>Used only for a manual rocking-recliner dimension screen.</p></details>
        </>}
        {step === 1 && <>
          <label className="field-label">What matters most to them?</label>
          <Choices label="What they need" value={answers.need} onChange={(key) => set({ need: key, ...FIT_NEEDS.find((item) => item.key === key).patch })} options={FIT_NEEDS.map((item) => [item.key, item.label, item.hint])} />
          <label className="field-label">What are they hoping to bring home?</label>
          <Choices label="Category" value={answers.category} onChange={setCategory} options={CATEGORIES.map((item) => [item, item])} />
        </>}
        {step === 2 && <>
          {!isSectional && <>
            <label className="field-label">How much space is behind it?</label>
            <Choices label="Room behind" value={roomName} onChange={(name) => { const room = ROOMS.find(([key]) => key === name); set({ clearance: `${name} · ${room[3]} in` }); }} options={ROOMS.map(([name, amount, help]) => [name, name, `${amount} · ${help}`])} />
          </>}
          {isSectional && <p className="tip-strip"><Info size={16} /><span>Room size is set in Sectional Studio, where pieces are drawn at true size.</span></p>}
          <label className="field-label">Which kind of comfort sounds right?</label>
          <Choices label="Recline type" value={mechanism} onChange={(name) => set({ mechanism: name })} options={available.map(([name, hint]) => [name, name, hint])} />
          {cushions.length > 1 && <><label className="field-label">Seat feel</label><div className="chip-row" role="group" aria-label="Seat feel">{cushions.map((item) => <button key={item.code} type="button" className={chip(answers.cushion_preference === item.name)} aria-pressed={answers.cushion_preference === item.name} onClick={() => set({ cushion_preference: item.name })}>{item.name} · {item.code}</button>)}</div></>}
          {supports.length > 1 && <><label className="field-label">Back and lumbar support</label><div className="chip-row" role="group" aria-label="Back support">{supports.map((item) => <button key={item.value} type="button" className={chip(answers.support_preference === item.value)} aria-pressed={answers.support_preference === item.value} onClick={() => set({ support_preference: item.value })}>{item.label}</button>)}</div></>}
        </>}
        {step === 3 && <>
          <label className="field-label">Who else lives with it?</label>
          <div className="chip-row" role="group" aria-label="Household">{[['Kids', 'Kids'], ['Pets', 'Pets']].map(([key, label]) => <button key={key} type="button" className={chip(answers.household.includes(key))} aria-pressed={answers.household.includes(key)} onClick={() => toggleHousehold(key)}>{label}</button>)}</div>
          <label className="field-label">Leather or fabric?</label>
          <Choices label="Material" value={answers.material_preference} onChange={(value) => set({ material_preference: value })} options={[['No preference yet', 'Open to either'], ['Leather', 'Leather'], ['Fabric', 'Fabric']]} />
        </>}
      </div>
      <div className="wizard-footer">
        <button type="button" className="back-button" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0}><ArrowLeft size={15} /> Back</button>
        <span className="step-count">{step + 1} <span>/</span> 4</span>
        <button type="button" className="primary-button" disabled={!hasHeight} onClick={() => go(step + 1)}>{step === 3 ? 'Show three to sit in' : 'Continue'} <ArrowRight size={15} /></button>
      </div>
    </section>
  </div>;
}
