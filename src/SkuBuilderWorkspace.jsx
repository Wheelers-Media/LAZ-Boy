import React, { useMemo, useState } from 'react';
import { Check, Copy, Info, Plus, Printer, Search } from './icons.jsx';
import { CoverPicker } from './CoverPicker.jsx';
import { StepFlow, TileSelect } from './StepFlow.jsx';
import { lineFromSku } from './plan.js';
import { buildRmsSkuPreview, decodeRmsSku, describeCoverEligibility, formatSelectCovers, getGuideStyle, groupModelsBySection, isUnlistedModel, getModelCoverOptions, getModelCoverSwatches, getRmsModelStyleChoices, getRmsStyleOptions, getStyleFinishes } from './logic.js';

const MODEL_LINE_EXTRAS = [
  { model_code: '677', model_name: 'Lauren', category: 'Stationary Sofa', scale: 'Mid-Scale Classic' },
  { model_code: '811', model_name: 'Acadia', category: 'Motion Sectional', scale: 'Contemporary' },
];
const modelsFromCatalog = (catalog, knownModels) => {
  const catalogs = ['stationary_catalog_2026', 'motion_catalog_2026', 'designers_choice_catalog_2026', 'recliner_catalog_2026'];
  const catalogModels = catalogs.flatMap((key) => (catalog[key]?.index || catalog[key]?.models || []).map((item) => ({ model_code: String(item.model_code ?? item.code), model_name: item.model_name || item.name, category: item.catalog_categories?.join(' / ') || 'Catalog model' })));
  const supplemental = (catalog.recliner_collection_index_supplement?.index || []).map((item) => ({ model_code: String(item.code), model_name: item.name, category: 'Supplemental recliner index · verify specs' }));
  const allIndexed = [...catalogModels, ...supplemental, ...knownModels, ...MODEL_LINE_EXTRAS].reduce((entries, item) => {
    const code = String(item.model_code);
    const existing = entries.get(code);
    entries.set(code, existing ? { ...existing, ...item, category: [...new Set(`${existing.category || ''} / ${item.category || ''}`.split(' / ').filter(Boolean))].join(' / ') } : item);
    return entries;
  }, new Map());
  return [...allIndexed.values()];
};
const fieldStatus = (status) => status === 'documented' ? 'Listed' : status === 'not_listed_for_exact_style' ? 'Not listed for this exact style' : status === 'style_not_resolved' ? 'Style not resolved' : 'Unresolved';

export function SkuBuilderWorkspace({ catalog, modelCode, setModelCode, prefix, setPrefix, cover, setCover, patternCode, setPatternCode, colorShade, setColorShade, finish, setFinish, trimCode, setTrimCode, cushionCode, setCushionCode, optionCodes, setLiveOption, clearLiveOptions, batteryWarning, onCopy, notify, onAddToPlan = () => {} }) {
  const [copied, setCopied] = useState(false);
  const [customGroup, setCustomGroup] = useState('');
  const [customStyle, setCustomStyle] = useState('');
  const [customActive, setCustomActive] = useState(false);
  const [selectedSwatchCode, setSelectedSwatchCode] = useState('');
  const [pillowCover, setPillowCover] = useState('');
  const [featherlite, setFeatherlite] = useState(false);
  const [manualCover, setManualCover] = useState({ grade: '', pattern: '', color: '' });
  const [customFinishAllowed, setCustomFinishAllowed] = useState(false);
  const [decodeInput, setDecodeInput] = useState('');
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteContext, setQuoteContext] = useState('');
  const models = useMemo(() => modelsFromCatalog(catalog, catalog.models_database.map((item) => ({ model_code: item.model_code, model_name: item.model_name, category: item.category || 'Catalog model' }))).sort((a, b) => a.model_name.localeCompare(b.model_name)), [catalog]);
  const selectedModel = models.find((item) => item.model_code === modelCode) || models[0];
  const selectedModelCode = selectedModel?.model_code || '';
  const choices = useMemo(() => selectedModel ? getRmsModelStyleChoices(catalog, selectedModelCode) : [], [catalog, selectedModelCode]);
  const activePrefix = choices.some((item) => item.code === prefix) ? prefix : choices[0]?.code || '';
  const prefixDocumented = choices.some((item) => item.code === activePrefix);
  const styleOptions = useMemo(() => prefixDocumented ? getRmsStyleOptions(catalog, selectedModelCode, activePrefix) : null, [catalog, selectedModelCode, activePrefix, prefixDocumented]);
  const documentedOptions = styleOptions?.options || null;
  const allowedOptions = documentedOptions || new Set();
  const finishAllowed = customActive ? customFinishAllowed : Boolean(styleOptions?.finishMarkerListed);
  const allowedTrims = catalog.nailhead_trims.filter((item) => item.code === 'NN' || allowedOptions.has(item.code));
  const allowedCushions = catalog.cushion_upgrades.filter((item) => item.code === 'Standard' || allowedOptions.has(item.code));
  const options = customActive ? [] : [...new Set([...(trimCode !== 'NN' && allowedOptions.has(trimCode) ? [trimCode] : []), ...(cushionCode !== 'Standard' && allowedOptions.has(cushionCode) ? [cushionCode] : []), ...optionCodes.filter((code) => allowedOptions.has(code) && !['NB', 'NH', 'NS', 'FS', 'Z6', 'DC', 'FN', 'ES'].includes(code)), ...(featherlite && allowedOptions.has('FP') ? ['FP'] : []), ...(pillowCover && pillowCover !== selectedSwatch?.code && allowedOptions.has('P1') ? ['P1'] : [])])];
  const displayStyle = customActive ? customStyle : selectedModelCode;
  const guideStyle = useMemo(() => getGuideStyle(catalog, selectedModelCode, activePrefix), [catalog, selectedModelCode, activePrefix]);
  const styleSelect = useMemo(() => formatSelectCovers(guideStyle?.select), [guideStyle]);
  const styleFinishes = useMemo(() => getStyleFinishes(catalog, selectedModelCode, activePrefix), [catalog, selectedModelCode, activePrefix]);
  const guideListsModel = choices.length > 0 && Boolean(catalog.style_index_2026?.styles?.some((row) => row.model === selectedModelCode));
  const unlisted = isUnlistedModel(catalog, selectedModelCode);
  const applicableCovers = useMemo(() => guideListsModel || unlisted ? [] : getModelCoverOptions(catalog, selectedModelCode), [catalog, selectedModelCode, guideListsModel, unlisted]);
  const modelSwatches = useMemo(() => {
    const merged = new Map();
    getModelCoverSwatches(catalog, selectedModelCode, guideListsModel ? activePrefix : undefined).forEach((item) => merged.set(item.code, item));
    applicableCovers.forEach((item) => {
      const match = item.code.match(/^([A-Z]{1,3})(\d{4})(\d{2})$/);
      if (match) merged.set(item.code, { ...merged.get(item.code), ...item, grade: match[1], pattern: match[2], color: match[3], material: merged.get(item.code)?.material || item.type || 'Fabric', basis: 'listed' });
    });
    return [...merged.values()];
  }, [catalog, selectedModelCode, applicableCovers, guideListsModel, activePrefix]);
  const finishChoices = guideListsModel ? [...(styleFinishes.standard ? [{ ...styleFinishes.standard, standard: true }] : []), ...styleFinishes.optional] : catalog.wood_finishes.map((item) => ({ code: item.code, name: item.name }));
  const manualValid = /^[A-Z]{1,3}$/.test(manualCover.grade) && /^\d{4}$/.test(manualCover.pattern) && /^\d{2}$/.test(manualCover.color);
  const manualSwatch = manualValid ? { code: `${manualCover.grade}${manualCover.pattern}${manualCover.color}`, ...manualCover, name: 'Manual entry', material: 'Fabric', basis: 'manual', note: 'Manual entry · not checked against this model’s eligibility' } : null;
  const selectedSwatch = modelSwatches.find((item) => item.code === selectedSwatchCode) || (!selectedSwatchCode ? manualSwatch : null);
  const noPillowCaps = new Set(catalog.fabric_cover_program_a26?.businessRules?.pillowsNotAllowedCapCodes || []);
  const pillowSwatches = modelSwatches.filter((item) => item.code !== selectedSwatch?.code && !noPillowCaps.has(item.capCode));
  const pillowSwatch = modelSwatches.find((item) => item.code === pillowCover);
  const pillowNote = [pillowSwatch && pillowSwatch.code !== selectedSwatch?.code ? `Pillow cover ${pillowSwatch.code}${pillowSwatch.name ? ` (${pillowSwatch.name})` : ''}` : '', featherlite && allowedOptions.has('FP') ? 'Featherlite pillows (FP)' : ''].filter(Boolean).join(' · ');
  const skuGrade = selectedSwatch?.grade || '';
  const swatchPattern = selectedSwatch?.pattern || '';
  const swatchColor = selectedSwatch?.color || '';
  const fields = buildRmsSkuPreview({ group: customActive ? customGroup : prefixDocumented ? activePrefix : '', style: displayStyle, grade: skuGrade, pattern: swatchPattern, color: swatchColor, finish, options, includeFinish: finishAllowed });
  const optionRecords = [...catalog.option_suffixes, ...(catalog.motion_catalog_2026?.options || []).map(([code, name]) => ({ code, name })), ...(catalog.recliner_catalog_2026?.universal_options || []).map(([code, name]) => ({ code, name })), ...(catalog.stationary_catalog_2026?.options || []).map((item) => ({ code: item.code, name: item.name }))];
  const orderOptions = [...new Map(optionRecords.filter((item) => allowedOptions.has(item.code) && !['ES', 'FS', 'Z6', 'DC', 'NB', 'NH', 'NS', 'FN', 'FP', 'P1'].includes(item.code)).map((item) => [item.code, item])).values()];
  const prefixRecord = catalog.style_prefixes.find((item) => item.code === activePrefix);
  const decoded = useMemo(() => decodeInput.trim() ? decodeRmsSku(decodeInput, catalog) : null, [decodeInput, catalog]);
  const addToPlan = () => { onAddToPlan(lineFromSku({ swatchIndex: catalog.swatch_index, modelCode: selectedModelCode, modelName: selectedModel?.model_name || selectedModelCode, styleCode: displayStyle ? activePrefix || displayStyle : '', category: guideStyle?.category || prefixRecord?.motion_type || '', sku: copyDisabled ? '' : fields.sku, note: pillowNote, coverCode: copyDisabled || !skuGrade || !swatchPattern || !swatchColor ? '' : `${skuGrade}${swatchPattern}${swatchColor}` }), `${selectedModel?.model_name || selectedModelCode} ${activePrefix || ''}`.trim()); };
  const copyPreview = async () => { if (copyDisabled) return; await onCopy(fields.sku); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  const swatchMatchesCover = Boolean(selectedSwatch);
  const copyDisabled = !fields.complete || (!customActive && (!prefixDocumented || !documentedOptions)) || !swatchMatchesCover || (finishAllowed && !finish);
  const changeModel = (value) => {
    const nextModel = models.find((item) => item.model_code === value);
    const nextChoices = nextModel ? getRmsModelStyleChoices(catalog, value) : [];
    setCustomActive(false);
    setCustomFinishAllowed(false);
    setModelCode(value, nextChoices[0]?.code || '');
    setSelectedSwatchCode('');
    setManualCover({ grade: '', pattern: '', color: '' });
    setPillowCover('');
    setFeatherlite(false);
    setCustomStyle('');
    setTrimCode('NN');
    setCushionCode('Standard');
    clearLiveOptions();
    setFinish('');
  };
  const changeGroup = (value) => {
    setCustomActive(false);
    setCustomFinishAllowed(false);
    setPrefix(value);
    setPillowCover('');
    setFeatherlite(false);
    setTrimCode('NN');
    setCushionCode('Standard');
    clearLiveOptions();
    setFinish('');
  };
  const applyCustomIdentifiers = () => {
    const group = customGroup.trim().toUpperCase();
    const style = customStyle.trim() || modelCode;
    if (!/^[A-Z0-9]{2,4}$/.test(group) || !/^[A-Z0-9]{2,4}$/.test(style)) return notify('Enter RMS Group and Style values exactly as shown');
    setCustomGroup(group);
    setCustomStyle(style);
    setCustomActive(true);
    setCustomFinishAllowed(true);
    notify('RMS field values echoed without validation');
  };
  const printQuote = () => { setQuoteOpen(true); window.setTimeout(() => window.print(), 80); };

  const [stepId, setStepId] = useState('model');
  const [modelPicking, setModelPicking] = useState(false);
  const [modelQuery, setModelQuery] = useState('');
  const [modelSection, setModelSection] = useState('');
  const modelGroups = useMemo(() => groupModelsBySection(catalog, models), [catalog, models]);
  const currentSection = modelGroups.find((group) => group.items.some((item) => item.model_code === selectedModelCode))?.name || '';
  const query = modelQuery.trim().toLowerCase();
  const modelHits = query ? models.filter((item) => `${item.model_name} ${item.model_code}`.toLowerCase().includes(query)) : [];
  const modelTile = (item) => ({ value: item.model_code, title: item.model_name, desc: `Model ${item.model_code}` });
  const pickModel = (code) => { changeModel(code); setModelPicking(false); setModelQuery(''); setModelSection(''); setStepId(getRmsModelStyleChoices(catalog, code).length > 1 ? 'style' : 'cover'); };
  const pickGroup = (code) => { changeGroup(code); setStepId('cover'); };
  const showFinishStep = finishAllowed || allowedTrims.length > 1 || allowedCushions.length > 1;
  const showOptionsStep = !customActive && orderOptions.length > 0;
  const showPillowStep = !customActive && (allowedOptions.has('FP') || allowedOptions.has('P1'));
  const entryCard = <div className="rms-entry-card sf-entry">
    <h3 className="rms-side-title">Enter in RMS</h3>
    <div className="rms-field-grid">{fields.fields.map(([label, value]) => <div className="rms-field-cell" key={label}><span>{label}</span><strong>{value || (label === 'Group' ? 'Choose' : label === 'Style' || label === 'Grade' ? 'Enter' : '-')}</strong></div>)}</div>
    <div className="rms-code-output"><span>SKU STRING PREVIEW</span><code>{fields.sku || 'Complete Group, Style, Grade, Pattern, and Color to preview the string.'}</code><button type="button" className="copy-button" onClick={copyPreview} disabled={copyDisabled}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy SKU'}</button><button type="button" className="back-button plan-add-sku" onClick={addToPlan}><Plus size={15} /> Add to plan</button>{copyDisabled && <small className="sku-generation-status">{!customActive && !prefixDocumented ? 'Choose a listed Group or enter a manual Group and Style.' : !customActive && !documentedOptions ? 'This exact model/group has no option record.' : !swatchMatchesCover ? 'Choose a model-listed cover swatch.' : finishAllowed && !finish ? 'Choose a listed finish.' : 'Complete the SKU fields.'}</small>}</div>
    <details className="rms-details"><summary>Finish and option suffixes</summary><dl><div><dt>Finish</dt><dd>{fields.finish || 'Not selected'}</dd></div><div><dt>Options</dt><dd>{fields.options.join(', ') || 'None selected'}</dd></div><div><dt>Pillows</dt><dd>{pillowNote || 'Match the body cover'}</dd></div><div><dt>Model swatch</dt><dd>{selectedSwatch?.code || 'Not selected'}{selectedSwatch?.note ? ` · ${selectedSwatch.note}` : ''}</dd></div><div><dt>Prefix description</dt><dd>{prefixRecord?.motion_type || 'Not mapped'}</dd></div></dl></details>
    <div className="rms-disclaimer"><Info size={15} /><p><strong>Not an order check.</strong> Confirm in RMS.</p></div>
  </div>;

  const todoIds = [!selectedSwatch && 'cover', finishAllowed && !finish && 'finish', !prefixDocumented && !customActive && 'style'].filter(Boolean);
  const todo = todoIds.map((id) => ({ id, label: { cover: 'Cover', finish: 'Finish', style: 'Style' }[id] }));
  const steps = [
    { id: 'model', label: 'Model', summary: selectedModel ? `${selectedModel.model_name} · ${selectedModelCode}` : '', done: Boolean(selectedModel), hint: 'Pick the product line. Search by name or number, or browse by category.', content: <>
      {!modelPicking && <div className="sf-current-card"><div><strong>{selectedModel?.model_name || 'No model'}</strong><span>Model {selectedModelCode}{currentSection ? ` · ${currentSection}` : ''}</span><span>{choices.length} {choices.length === 1 ? 'style' : 'styles'} in the April 2026 guide</span></div><button type="button" className="sf-secondary" onClick={() => setModelPicking(true)}>Change model</button></div>}
      {modelPicking && <>
        <label className="sf-search"><Search size={20} /><input autoFocus type="search" value={modelQuery} onChange={(event) => setModelQuery(event.target.value)} placeholder="Search model name or number" aria-label="Search models" /></label>
        {query ? (modelHits.length ? <TileSelect label="Models" options={modelHits.map(modelTile)} value={selectedModelCode} onChange={pickModel} columns={2} /> : <p className="sf-empty">No model matches “{modelQuery}”.</p>)
          : modelSection ? <><button type="button" className="sf-link" onClick={() => setModelSection('')}>‹ All categories</button><TileSelect label={modelSection} options={(modelGroups.find((group) => group.name === modelSection)?.items || []).map(modelTile)} value={selectedModelCode} onChange={pickModel} columns={2} /></>
          : <div className="index-launcher">{modelGroups.map((group) => <button type="button" key={group.name} className="index-launch" onClick={() => setModelSection(group.name)}><strong>{group.name}</strong><b>{group.items.length}</b><small>{group.items.slice(0, 3).map((item) => item.model_name).join(' · ')}</small></button>)}</div>}
        <button type="button" className="sf-link" onClick={() => { setModelPicking(false); setModelQuery(''); setModelSection(''); }}>Keep {selectedModel?.model_name}</button>
      </>}
    </> },
    { id: 'style', label: 'Style', summary: prefixDocumented ? `${activePrefix} · ${choices.find((item) => item.code === activePrefix)?.label || ''}` : '', done: prefixDocumented, hint: 'The style is the RMS group: it sets the mechanism and which options exist.', content: choices.length ? <TileSelect label="Style" options={choices.map((item) => ({ value: item.code, title: item.label, desc: `Group ${item.code}` }))} value={activePrefix} onChange={pickGroup} columns={2} /> : <p className="sf-empty">This model has no documented RMS group. Use a custom group below.</p> },
    { id: 'cover', label: 'Cover', summary: selectedSwatch ? `${selectedSwatch.code}${selectedSwatch.name ? ` · ${selectedSwatch.name}` : ''}` : '', done: Boolean(selectedSwatch), hint: 'Choose a grade, then a pattern, then a colour.', content: <>
      <CoverPicker key={`${selectedModelCode}-${activePrefix}`} describe={(swatch) => describeCoverEligibility(catalog, selectedModelCode, guideListsModel ? activePrefix : '', swatch)} swatches={modelSwatches} value={selectedSwatch?.code || ''} onChange={(code) => setSelectedSwatchCode(code)} />
      {styleSelect.length > 0 && <div className="tip-strip rms-wide"><Info size={16} /><span><strong>Select covers for this style</strong><ul className="select-list">{styleSelect.map((line) => { const [kind, ...rest] = line.split(': '); return <li key={line}><b>{kind}</b> {rest.join(': ')}</li>; })}</ul></span></div>}
      {!customActive && <details className="custom-rms-details"><summary>Enter a cover code manually</summary><div className="rms-custom-row"><label className="form-field"><span>Grade</span><input value={manualCover.grade} maxLength={3} placeholder="D" onChange={(event) => { setSelectedSwatchCode(''); setManualCover({ ...manualCover, grade: event.target.value.toUpperCase().replace(/[^A-Z]/g, '') }); }} /></label><label className="form-field"><span>Pattern (4 digits)</span><input value={manualCover.pattern} inputMode="numeric" maxLength={4} placeholder="1855" onChange={(event) => { setSelectedSwatchCode(''); setManualCover({ ...manualCover, pattern: event.target.value.replace(/\D/g, '') }); }} /></label><label className="form-field"><span>Colour (2 digits)</span><input value={manualCover.color} inputMode="numeric" maxLength={2} placeholder="59" onChange={(event) => { setSelectedSwatchCode(''); setManualCover({ ...manualCover, color: event.target.value.replace(/\D/g, '') }); }} /></label></div><p className="fine-print">Use this for a cover that is not in the list. It is not checked against this model’s eligibility; confirm in RMS before promising it.</p></details>}
    </> },
    { id: 'finish', label: 'Finish and trim', hidden: !showFinishStep, summary: [finishAllowed && finish, trimCode !== 'NN' && trimCode, cushionCode !== 'Standard' && cushionCode].filter(Boolean).join(' · ') || 'Defaults', done: !finishAllowed || Boolean(finish), content: <>
      {finishAllowed && <div className="sf-group"><h3>Wood finish</h3><TileSelect label="Wood finish" options={finishChoices.map((item) => ({ value: item.code, title: item.name, desc: `FN ${item.code}`, badge: item.standard ? 'Standard' : '' }))} value={finishChoices.some((item) => item.code === finish) ? finish : ''} onChange={setFinish} columns={2} /></div>}
      {allowedTrims.length > 1 && <div className="sf-group"><h3>Nailhead trim</h3><TileSelect label="Nailhead trim" options={allowedTrims.map((item) => ({ value: item.code, title: item.name, desc: item.code === 'NN' ? 'No nailhead' : item.code }))} value={allowedTrims.some((item) => item.code === trimCode) ? trimCode : 'NN'} onChange={setTrimCode} columns={2} /></div>}
      {allowedCushions.length > 1 && <div className="sf-group"><h3>Cushion</h3><TileSelect label="Cushion" options={allowedCushions.map((item) => ({ value: item.code, title: item.name, desc: `${item.code === 'Standard' ? 'Included' : item.code} · ${item.warranty_years} year foam warranty` }))} value={allowedCushions.some((item) => item.code === cushionCode) ? cushionCode : 'Standard'} onChange={setCushionCode} columns={2} /></div>}
    </> },
    { id: 'options', label: 'Options', hidden: !showOptionsStep, summary: options.length ? options.join(', ') : 'None', done: true, hint: 'Tap every option the customer wants.', content: <TileSelect multi label="Options" options={orderOptions.map((item) => ({ value: item.code, title: item.name, desc: item.code }))} values={options} onToggle={setLiveOption} columns={2} /> },
    { id: 'pillows', label: 'Pillows', hidden: !showPillowStep, summary: pillowNote || 'Match body cover', done: true, content: <>
      {allowedOptions.has('FP') && <div className="sf-group"><h3>Featherlite pillows</h3><TileSelect multi label="Featherlite" options={[{ value: 'FP', title: 'Featherlite pillow upgrade', desc: 'FP · a feather-and-down blend for a softer, more relaxed feel' }]} values={featherlite ? ['FP'] : []} onToggle={() => setFeatherlite(!featherlite)} /></div>}
      {allowedOptions.has('P1') && <div className="sf-group"><h3>Contrasting pillow cover</h3><p className="sf-hint">{selectedSwatch ? 'Choose a cover listed for this model, or leave it to match the body cover.' : 'Choose the body cover first.'}</p>{selectedSwatch && <CoverPicker key={`pillow-${selectedModelCode}-${activePrefix}-${selectedSwatchCode}`} label="Pillow" describe={(swatch) => describeCoverEligibility(catalog, selectedModelCode, guideListsModel ? activePrefix : '', swatch)} swatches={pillowSwatches} value={pillowCover} onChange={(code) => setPillowCover(code)} />}{pillowCover && <button type="button" className="sf-secondary" onClick={() => setPillowCover('')}>Match body cover</button>}</div>}
    </> },
    { id: 'review', label: 'Review and copy', summary: fields.sku || 'Not complete', done: !copyDisabled, content: <>
      {todo.length > 0 && <div className="sf-todo"><h3>Still to do</h3>{todo.map((item) => <button type="button" key={item.id} className="sf-todo-row" onClick={() => setStepId(item.id)}><strong>{item.label}</strong><span>Choose</span></button>)}</div>}
      <div className="sf-phone-only">{entryCard}</div>
      {batteryWarning && <p className="rms-warning"><Info size={15} />{batteryWarning}</p>}
      <div className="sf-group"><details className="custom-rms-details"><summary>Custom group</summary><div className="rms-custom-row"><label className="form-field"><span>Group</span><input value={customGroup} onChange={(event) => setCustomGroup(event.target.value)} maxLength={4} /></label><label className="form-field"><span>Style</span><input value={customStyle} onChange={(event) => setCustomStyle(event.target.value)} maxLength={4} /></label><button type="button" className="back-button" onClick={applyCustomIdentifiers}>Use manual Group and Style</button></div></details></div>
      <details className="quote-sheet card fold-card" open={quoteOpen} onToggle={(event) => setQuoteOpen(event.currentTarget.open)} aria-label="Customer quote and order checklist"><summary><strong>Customer summary</strong><small>Print or save a one-page summary</small></summary><div className="quote-sheet-heading"><div><h2>Customer summary</h2></div><button type="button" className="primary-button no-print" onClick={printQuote}><Printer size={15} /> Print / Save as PDF</button></div><label className="form-field no-print"><span>Customer or visit note</span><input value={quoteContext} onChange={(event) => setQuoteContext(event.target.value)} placeholder="e.g. Living room refresh" /></label><p className="quote-context">{quoteContext || 'Customer name / visit reference: ______________________________'}</p><div className="quote-item"><strong>{selectedModel?.model_name || 'Selected model'} · {selectedModelCode}</strong><span>{prefixDocumented ? `${activePrefix} · ${prefixRecord?.motion_type || choices.find((item) => item.code === activePrefix)?.label}` : 'Style / mechanism not selected from catalog'}</span><span>Cover swatch: {selectedSwatch?.code || 'not selected'}{selectedSwatch?.note ? ` · ${selectedSwatch.note}` : ''}</span><span>SKU preview: <code>{fields.sku || 'incomplete'}</code></span><span>Options: {fields.options.join(', ') || 'none selected'}</span>{pillowNote && <span>Pillows: {pillowNote}</span>}</div><h3 className="print-only">Sales order checklist</h3><ul className="order-checklist print-only"><li>Confirm model, style/group, hand, and exact configuration in current ordering system.</li><li>Confirm cover cap, grade, pattern and color against current swatches and eligibility.</li><li>Verify each option, console finish, cushion, battery, and finish against the exact style.</li><li>Confirm dimensions, room clearance, delivery access, capacity, pricing, and availability from current sources.</li><li>Review order details with the customer before submission; this tool does not create an order.</li></ul><p className="quote-disclaimer">Planning aid only. Not a quote, price, inventory check or order.</p></details>
    </> },
  ];

  return <section className="module-page sku-builder-page">
    <div className="module-intro"><h1>SKU Builder</h1></div>
        <details className="sku-decoder-panel card fold-card"><summary><strong>Decode a SKU</strong><small>Read a code from RMS or a tag</small></summary><label className="form-field"><span>Decode a SKU</span><input value={decodeInput} onChange={(event) => setDecodeInput(event.target.value)} placeholder="e.g. 10X-759 D185559 FN 007" /></label>{decoded && <div className="sku-decoder-result" aria-live="polite"><div className="decoded-identifiers"><p><span>STYLE / PREFIX</span><strong>{decoded.style.code || '-'} · {decoded.style.name || 'Unresolved'}</strong><small>{fieldStatus(decoded.style.status)}</small></p><p><span>MODEL</span><strong>{decoded.model.code || '-'} · {decoded.model.name || 'Unresolved'}</strong><small>{fieldStatus(decoded.model.status)}</small></p><p><span>COVER IDENTIFIER</span><strong>{decoded.cover.raw || 'Not found'}</strong><small>{decoded.cover.pattern ? `Pattern ${decoded.cover.pattern} · color ${decoded.cover.color}${decoded.cover.swatch_name ? ` · ${decoded.cover.swatch_name}` : ''} · grade ${decoded.cover.grade}${decoded.cover.cap_name ? ` · ${decoded.cover.cap_name}` : ''} · ${decoded.cover.note}` : decoded.cover.note}</small></p></div><h3>What the customer is getting</h3><ul>{decoded.physicalFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul>{decoded.claims.length > 0 && <div className="decoded-options"><strong>Options and claims</strong>{decoded.claims.map((claim, index) => <p key={`${claim.code}-${index}`}><code>{claim.code}{claim.value ? ` ${claim.value}` : ''}</code> {claim.description} <em>{fieldStatus(claim.status)}</em></p>)}</div>}{decoded.warnings.map((warning) => <p className="rms-warning" key={warning}><Info size={15} />{warning}</p>)}<p className="rms-disclaimer"><Info size={15} /><span><strong>Not an order validation.</strong> {decoded.disclaimer}</span></p></div>}</details>
    <StepFlow steps={steps} active={stepId} onActive={setStepId} side={entryCard}
      strip={fields.sku ? <code>{fields.sku}</code> : `${selectedModel?.model_name || 'Model'}${activePrefix ? ` · ${activePrefix}` : ''}`}
      finish={<button type="button" className="sf-next" onClick={copyPreview} disabled={copyDisabled}>{copied ? 'Copied' : 'Copy SKU'}</button>} />
  </section>;
}
