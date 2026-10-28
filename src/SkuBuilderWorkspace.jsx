import React, { useMemo, useState } from 'react';
import { Check, Copy, Info, Plus, Printer } from './icons.jsx';
import { CoverPicker } from './CoverPicker.jsx';
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
  const [customFinishAllowed, setCustomFinishAllowed] = useState(false);
  const [decodeInput, setDecodeInput] = useState('');
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
  const options = customActive ? [] : [...new Set([...(trimCode !== 'NN' && allowedOptions.has(trimCode) ? [trimCode] : []), ...(cushionCode !== 'Standard' && allowedOptions.has(cushionCode) ? [cushionCode] : []), ...optionCodes.filter((code) => allowedOptions.has(code) && !['NB', 'NH', 'NS', 'FS', 'Z6', 'DC', 'FN', 'ES'].includes(code))])];
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
  const selectedSwatch = modelSwatches.find((item) => item.code === selectedSwatchCode);
  const skuGrade = selectedSwatch?.grade || '';
  const swatchPattern = selectedSwatch?.pattern || '';
  const swatchColor = selectedSwatch?.color || '';
  const fields = buildRmsSkuPreview({ group: customActive ? customGroup : prefixDocumented ? activePrefix : '', style: displayStyle, grade: skuGrade, pattern: swatchPattern, color: swatchColor, finish, options, includeFinish: finishAllowed });
  const optionRecords = [...catalog.option_suffixes, ...(catalog.motion_catalog_2026?.options || []).map(([code, name]) => ({ code, name })), ...(catalog.recliner_catalog_2026?.universal_options || []).map(([code, name]) => ({ code, name })), ...(catalog.stationary_catalog_2026?.options || []).map((item) => ({ code: item.code, name: item.name }))];
  const orderOptions = [...new Map(optionRecords.filter((item) => allowedOptions.has(item.code) && !['ES', 'FS', 'Z6', 'DC', 'NB', 'NH', 'NS', 'FN'].includes(item.code)).map((item) => [item.code, item])).values()];
  const prefixRecord = catalog.style_prefixes.find((item) => item.code === activePrefix);
  const decoded = useMemo(() => decodeInput.trim() ? decodeRmsSku(decodeInput, catalog) : null, [decodeInput, catalog]);
  const addToPlan = () => { if (copyDisabled) return; onAddToPlan(lineFromSku({ swatchIndex: catalog.swatch_index, modelCode: selectedModelCode, modelName: selectedModel?.model_name || selectedModelCode, styleCode: displayStyle ? activePrefix || displayStyle : '', category: guideStyle?.category || prefixRecord?.motion_type || '', sku: fields.sku, coverCode: `${skuGrade}${swatchPattern}${swatchColor}` }), `${selectedModel?.model_name || selectedModelCode} ${activePrefix || ''}`.trim()); };
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
  const printQuote = () => window.print();
  return <section className="module-page sku-builder-page">
    <div className="module-intro"><h1>SKU Builder</h1></div>
    <section className="sku-decoder-panel card"><label className="form-field"><span>Decode a SKU</span><input value={decodeInput} onChange={(event) => setDecodeInput(event.target.value)} placeholder="e.g. 10X-759 D185559 FN 007" /></label>{decoded && <div className="sku-decoder-result" aria-live="polite"><div className="decoded-identifiers"><p><span>STYLE / PREFIX</span><strong>{decoded.style.code || '-'} · {decoded.style.name || 'Unresolved'}</strong><small>{fieldStatus(decoded.style.status)}</small></p><p><span>MODEL</span><strong>{decoded.model.code || '-'} · {decoded.model.name || 'Unresolved'}</strong><small>{fieldStatus(decoded.model.status)}</small></p><p><span>COVER IDENTIFIER</span><strong>{decoded.cover.raw || 'Not found'}</strong><small>{decoded.cover.pattern ? `Pattern ${decoded.cover.pattern} · color ${decoded.cover.color}${decoded.cover.swatch_name ? ` · ${decoded.cover.swatch_name}` : ''} · grade ${decoded.cover.grade}${decoded.cover.cap_name ? ` · ${decoded.cover.cap_name}` : ''} · ${decoded.cover.note}` : decoded.cover.note}</small></p></div><h3>What the customer is getting</h3><ul>{decoded.physicalFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul>{decoded.claims.length > 0 && <div className="decoded-options"><strong>Options and claims</strong>{decoded.claims.map((claim, index) => <p key={`${claim.code}-${index}`}><code>{claim.code}{claim.value ? ` ${claim.value}` : ''}</code> {claim.description} <em>{fieldStatus(claim.status)}</em></p>)}</div>}{decoded.warnings.map((warning) => <p className="rms-warning" key={warning}><Info size={15} />{warning}</p>)}<p className="rms-disclaimer"><Info size={15} /><span><strong>Not an order validation.</strong> {decoded.disclaimer}</span></p></div>}</section>
    <div className="rms-layout">
      <section className="rms-builder-card card">
        <label className="form-field"><span>1 · Model</span><select value={selectedModel?.model_code || ''} onChange={(event) => changeModel(event.target.value)}>{groupModelsBySection(catalog, models).map((group) => <optgroup key={group.name} label={`${group.name} (${group.items.length})`}>{group.items.map((item) => <option key={item.model_code} value={item.model_code}>{item.model_name} · {item.model_code}</option>)}</optgroup>)}</select>{unlisted && <small>'Not in the April 2026 guide or price book. Covers, finishes and options are not documented, so none are offered.'</small>}</label>
        <div className="rms-two-col">
          {choices.length > 0 && <label className="form-field"><span>2 · Group</span><select aria-label="RMS Group" value={activePrefix} onChange={(event) => changeGroup(event.target.value)}><option value="" disabled>Choose documented Group</option>{choices.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.label}</option>)}</select></label>}
          <p className="field-label rms-step">3 · Cover</p><CoverPicker key={`${selectedModelCode}-${activePrefix}`} describe={(swatch) => describeCoverEligibility(catalog, selectedModelCode, guideListsModel ? activePrefix : '', swatch)} swatches={modelSwatches} value={selectedSwatch?.code || ''} onChange={(code) => setSelectedSwatchCode(code)} />{styleSelect.length > 0 && <div className="tip-strip rms-wide"><Info size={16} /><span><strong>Select covers for this style</strong><ul className="select-list">{styleSelect.map((line) => { const [kind, ...rest] = line.split(': '); return <li key={line}><b>{kind}</b> {rest.join(': ')}</li>; })}</ul></span></div>}
          <div className="rms-pair">
          {finishAllowed && <label className="form-field"><span>4 · Finish (FN)</span><select value={finishChoices.some((item) => item.code === finish) ? finish : ''} onChange={(event) => setFinish(event.target.value)}><option value="">Choose a finish…</option>{finishChoices.map((item) => <option key={item.code} value={item.code}>{item.name} · {item.code}{item.standard ? ' (standard)' : ''}</option>)}</select></label>}
          {allowedTrims.length > 1 && <label className="form-field"><span>Nailhead trim</span><select value={allowedTrims.some((item) => item.code === trimCode) ? trimCode : 'NN'} onChange={(event) => setTrimCode(event.target.value)}>{allowedTrims.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name}</option>)}</select></label>}
          {allowedCushions.length > 1 && <label className="form-field"><span>Cushion option</span><select value={allowedCushions.some((item) => item.code === cushionCode) ? cushionCode : 'Standard'} onChange={(event) => setCushionCode(event.target.value)}>{allowedCushions.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name}</option>)}</select></label>}
          </div>
        </div>
        {!customActive && orderOptions.length > 0 && <div className="rms-options"><p className="field-label">5 · Options</p>{orderOptions.map((item) => <label className="rms-option-row" key={item.code}><input type="checkbox" checked={options.includes(item.code)} onChange={() => setLiveOption(item.code)} /><span><strong>{item.code}</strong><small>{item.name}</small></span></label>)}</div>}
        <details className="custom-rms-details"><summary>Custom group</summary><div className="rms-custom-row"><label className="form-field"><span>Group</span><input value={customGroup} onChange={(event) => setCustomGroup(event.target.value)} maxLength={4} /></label><label className="form-field"><span>Style</span><input value={customStyle} onChange={(event) => setCustomStyle(event.target.value)} maxLength={4} /></label><button type="button" className="back-button" onClick={applyCustomIdentifiers}>Use manual Group and Style</button></div></details>
        {batteryWarning && <p className="rms-warning"><Info size={15} />{batteryWarning}</p>}
      </section>
      <aside className="rms-entry-card card">
        <h2 className="rms-side-title">Enter in RMS</h2>
                <div className="rms-field-grid">{fields.fields.map(([label, value]) => <div className="rms-field-cell" key={label}><span>{label}</span><strong>{value || (label === 'Group' ? 'Choose' : label === 'Style' || label === 'Grade' ? 'Enter' : '-')}</strong></div>)}</div>
        <div className="rms-code-output"><span>SKU STRING PREVIEW</span><code>{fields.sku || 'Complete Group, Style, Grade, Pattern, and Color to preview the string.'}</code><button type="button" className="copy-button" onClick={copyPreview} disabled={copyDisabled}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy SKU'}</button><button type="button" className="back-button plan-add-sku" onClick={addToPlan} disabled={copyDisabled}><Plus size={15} /> Add to plan</button>{copyDisabled && <small className="sku-generation-status">{!customActive && !prefixDocumented ? 'Choose a listed Group or enter a manual Group and Style.' : !customActive && !documentedOptions ? 'This exact model/group has no option record.' : !swatchMatchesCover ? 'Choose a model-listed cover swatch.' : finishAllowed && !finish ? 'Choose a listed finish.' : 'Complete the SKU fields.'}</small>}</div>
        <details className="rms-details"><summary>Finish and option suffixes</summary><dl><div><dt>Finish</dt><dd>{fields.finish || 'Not selected'}</dd></div><div><dt>Options</dt><dd>{fields.options.join(', ') || 'None selected'}</dd></div><div><dt>Model swatch</dt><dd>{selectedSwatch?.code || 'Not selected'}{selectedSwatch?.note ? ` · ${selectedSwatch.note}` : ''}</dd></div><div><dt>Prefix description</dt><dd>{prefixRecord?.motion_type || 'Not mapped'}</dd></div></dl></details>
        <div className="rms-disclaimer"><Info size={15} /><p><strong>Not an order check.</strong> Confirm in RMS.</p></div>
      </aside>
      <div className="sku-sticky-bar" role="region" aria-label="SKU copy bar"><code>{fields.sku || 'Complete the cover to build the SKU'}</code><button type="button" className="copy-button" onClick={copyPreview} disabled={copyDisabled}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy'}</button><button type="button" className="plan-add-fab" onClick={addToPlan} disabled={copyDisabled} aria-label="Add to plan"><Plus size={18} /> Plan</button></div>
    </div>
    <section className="quote-sheet card" aria-label="Customer quote and order checklist"><div className="quote-sheet-heading"><div><h2>Customer summary</h2></div><button type="button" className="primary-button no-print" onClick={printQuote}><Printer size={15} /> Print / Save as PDF</button></div><label className="form-field no-print"><span>Customer or visit note</span><input value={quoteContext} onChange={(event) => setQuoteContext(event.target.value)} placeholder="e.g. Living room refresh" /></label><p className="quote-context">{quoteContext || 'Customer name / visit reference: ______________________________'}</p><div className="quote-item"><strong>{selectedModel?.model_name || 'Selected model'} · {selectedModelCode}</strong><span>{prefixDocumented ? `${activePrefix} · ${prefixRecord?.motion_type || choices.find((item) => item.code === activePrefix)?.label}` : 'Style / mechanism not selected from catalog'}</span><span>Cover swatch: {selectedSwatch?.code || 'not selected'}{selectedSwatch?.note ? ` · ${selectedSwatch.note}` : ''}</span><span>SKU preview: <code>{fields.sku || 'incomplete'}</code></span><span>Options: {fields.options.join(', ') || 'none selected'}</span></div><h3 className="print-only">Sales order checklist</h3><ul className="order-checklist print-only"><li>Confirm model, style/group, hand, and exact configuration in current ordering system.</li><li>Confirm cover cap, grade, pattern and color against current swatches and eligibility.</li><li>Verify each option, console finish, cushion, battery, and finish against the exact style.</li><li>Confirm dimensions, room clearance, delivery access, capacity, pricing, and availability from current sources.</li><li>Review order details with the customer before submission; this tool does not create an order.</li></ul><p className="quote-disclaimer">Planning aid only. Not a quote, price, inventory check or order.</p></section>
  </section>;
}
