import React, { useMemo, useState } from 'react';
import { Check, Copy, Info, Printer, Wrench } from 'lucide-react';
import { buildRmsSkuPreview, decodeRmsSku, getModelCoverOptions, getRmsModelStyleChoices, getRmsStyleOptions } from './logic.js';

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
const fieldStatus = (status) => status === 'documented' ? 'Verified in supplied catalog' : status === 'not_listed_for_exact_style' ? 'Not listed for this exact style' : status === 'style_not_resolved' ? 'Style not resolved' : 'Unresolved';

export function SkuBuilderWorkspace({ catalog, modelCode, setModelCode, prefix, setPrefix, cover, setCover, patternCode, setPatternCode, colorShade, setColorShade, finish, setFinish, trimCode, setTrimCode, cushionCode, setCushionCode, optionCodes, setLiveOption, clearLiveOptions, batteryWarning, onCopy, notify }) {
  const [copied, setCopied] = useState(false);
  const [customGroup, setCustomGroup] = useState('');
  const [customStyle, setCustomStyle] = useState('');
  const [customActive, setCustomActive] = useState(false);
  const [selectedSwatchCode, setSelectedSwatchCode] = useState('');
  const [selectedCoverGrade, setSelectedCoverGrade] = useState('');
  const [selectedCoverPattern, setSelectedCoverPattern] = useState('');
  const [selectedSwatchColor, setSelectedSwatchColor] = useState('');
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
  const applicableCovers = useMemo(() => getModelCoverOptions(catalog, selectedModelCode), [catalog, selectedModelCode]);
  const modelSwatches = applicableCovers.flatMap((item) => {
    const match = item.code.match(/^([A-Z]{1,3})(\d{4})(\d{2})$/);
    return match ? [{ ...item, grade: match[1], pattern: match[2], color: match[3] }] : [];
  });
  const selectedSwatch = modelSwatches.find((item) => item.code === selectedSwatchCode);
  const skuGrade = selectedSwatch?.grade || '';
  const swatchPattern = selectedSwatch?.pattern || '';
  const swatchColor = selectedSwatch?.color || '';
  const fields = buildRmsSkuPreview({ group: customActive ? customGroup : prefixDocumented ? activePrefix : '', style: displayStyle, grade: skuGrade, pattern: swatchPattern, color: swatchColor, finish, options, includeFinish: finishAllowed });
  const optionRecords = [...catalog.option_suffixes, ...(catalog.motion_catalog_2026?.options || []).map(([code, name]) => ({ code, name })), ...(catalog.recliner_catalog_2026?.universal_options || []).map(([code, name]) => ({ code, name })), ...(catalog.stationary_catalog_2026?.options || []).map((item) => ({ code: item.code, name: item.name }))];
  const orderOptions = [...new Map(optionRecords.filter((item) => allowedOptions.has(item.code) && !['ES', 'FS', 'Z6', 'DC', 'NB', 'NH', 'NS', 'FN'].includes(item.code)).map((item) => [item.code, item])).values()];
  const prefixRecord = catalog.style_prefixes.find((item) => item.code === activePrefix);
  const decoded = useMemo(() => decodeInput.trim() ? decodeRmsSku(decodeInput, catalog) : null, [decodeInput, catalog]);
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
    setSelectedCoverGrade('');
    setSelectedCoverPattern('');
    setSelectedSwatchColor('');
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
    <div className="module-intro"><p className="eyebrow"><Wrench size={13} /> RMS-ALIGNED SKU BUILDER</p><h1>Build the code, <em>field by field.</em></h1><p>Preview a customer’s selected product details in the RMS field pattern. No inventory check or order submission.</p></div>
    <section className="sku-decoder-panel card"><div className="rms-card-heading"><div><span className="eyebrow">LOOK UP A CUSTOMER OR FLOOR SKU</span><h2>Decode a product string</h2></div><span className="rms-status">Evidence-aware</span></div><label className="form-field"><span>Full SKU</span><input value={decodeInput} onChange={(event) => setDecodeInput(event.target.value)} placeholder="e.g. 10X-759 D185559 FN 007" /></label>{decoded && <div className="sku-decoder-result" aria-live="polite"><div className="decoded-identifiers"><p><span>STYLE / PREFIX</span><strong>{decoded.style.code || '-'} · {decoded.style.name || 'Unresolved'}</strong><small>{fieldStatus(decoded.style.status)}</small></p><p><span>MODEL</span><strong>{decoded.model.code || '-'} · {decoded.model.name || 'Unresolved'}</strong><small>{fieldStatus(decoded.model.status)}</small></p><p><span>COVER IDENTIFIER</span><strong>{decoded.cover.raw || 'Not found'}</strong><small>{decoded.cover.pattern ? `Pattern ${decoded.cover.pattern} · color ${decoded.cover.color}${decoded.cover.swatch_name ? ` · ${decoded.cover.swatch_name}` : ''} · grade ${decoded.cover.grade}${decoded.cover.cap_name ? ` · ${decoded.cover.cap_name}` : ''} · ${decoded.cover.note}` : decoded.cover.note}</small></p></div><h3>Features explicitly supported by the supplied references</h3><ul>{decoded.physicalFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul>{decoded.claims.length > 0 && <div className="decoded-options"><strong>Options and claims</strong>{decoded.claims.map((claim, index) => <p key={`${claim.code}-${index}`}><code>{claim.code}{claim.value ? ` ${claim.value}` : ''}</code> {claim.description} <em>{fieldStatus(claim.status)}</em></p>)}</div>}{decoded.warnings.map((warning) => <p className="rms-warning" key={warning}><Info size={15} />{warning}</p>)}<p className="rms-disclaimer"><Info size={15} /><span><strong>Not an order validation.</strong> {decoded.disclaimer}</span></p></div>}</section>
    <div className="rms-layout">
      <section className="rms-builder-card card">
        <div className="rms-card-heading"><div><span className="eyebrow">MODEL FIRST</span><h2>Product details</h2></div><span className="rms-status">SKU preview</span></div>
        <label className="form-field"><span>Product / model</span><select value={selectedModel?.model_code || ''} onChange={(event) => changeModel(event.target.value)}>{models.map((item) => <option key={item.model_code} value={item.model_code}>{item.model_name} · {item.model_code}</option>)}</select><small>Selections below are narrowed to this model and its documented style.</small></label>
        <div className="rms-two-col">
          {choices.length > 0 && <label className="form-field"><span>Group / style prefix</span><select aria-label="RMS Group" value={activePrefix} onChange={(event) => changeGroup(event.target.value)}><option value="" disabled>Choose documented Group</option>{choices.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.label}</option>)}</select></label>}
          {modelSwatches.length > 0 && <label className="form-field"><span>Eligible cover grade</span><select aria-label="Eligible cover grade" value={selectedCoverGrade} onChange={(event) => { setSelectedCoverGrade(event.target.value); setSelectedCoverPattern(''); setSelectedSwatchColor(''); setSelectedSwatchCode(''); }}><option value="">Choose a model-listed grade…</option>{[...new Set(modelSwatches.map((item) => item.grade))].map((grade) => <option key={grade} value={grade}>{grade} · {modelSwatches.find((item) => item.grade === grade)?.note || modelSwatches.find((item) => item.grade === grade)?.name || grade}</option>)}</select></label>}
          {selectedCoverGrade && <label className="form-field"><span>Pattern</span><select aria-label="Model-listed pattern" value={selectedCoverPattern} onChange={(event) => { setSelectedCoverPattern(event.target.value); setSelectedSwatchColor(''); setSelectedSwatchCode(''); }}><option value="">Choose a listed pattern…</option>{[...new Set(modelSwatches.filter((item) => item.grade === selectedCoverGrade).map((item) => item.pattern))].map((pattern) => <option key={pattern} value={pattern}>{pattern}</option>)}</select></label>}
          {selectedCoverGrade && selectedCoverPattern && <label className="form-field"><span>Color</span><select aria-label="Model-listed color" value={selectedSwatchColor} onChange={(event) => { const color = event.target.value; setSelectedSwatchColor(color); const match = modelSwatches.find((item) => item.grade === selectedCoverGrade && item.pattern === selectedCoverPattern && item.color === color); setSelectedSwatchCode(match?.code || ''); }}><option value="">Choose a listed color…</option>{[...new Set(modelSwatches.filter((item) => item.grade === selectedCoverGrade && item.pattern === selectedCoverPattern).map((item) => item.color))].map((color) => <option key={color} value={color}>{color} · {modelSwatches.find((item) => item.color === color && item.pattern === selectedCoverPattern)?.note || 'listed cover color'}</option>)}</select><small>{selectedSwatch ? `SKU fields use Grade ${skuGrade}, Pattern ${swatchPattern}, Color ${swatchColor}.` : 'Only colors explicitly listed for this model, grade, and pattern are shown.'}</small></label>}
          {!modelSwatches.length && <p className="rms-option-note">No exact grade, pattern, and color swatches are listed for this model in supplied sources; SKU generation stays disabled.</p>}
          {finishAllowed && <label className="form-field"><span>Finish</span><select value={catalog.wood_finishes.some((item) => item.code === finish) ? finish : ''} onChange={(event) => setFinish(event.target.value)}><option value="">Choose a listed finish…</option>{catalog.wood_finishes.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name}</option>)}</select></label>}
          {allowedTrims.length > 1 && <label className="form-field"><span>Nailhead trim</span><select value={allowedTrims.some((item) => item.code === trimCode) ? trimCode : 'NN'} onChange={(event) => setTrimCode(event.target.value)}>{allowedTrims.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name}</option>)}</select></label>}
          {allowedCushions.length > 1 && <label className="form-field"><span>Cushion option</span><select value={allowedCushions.some((item) => item.code === cushionCode) ? cushionCode : 'Standard'} onChange={(event) => setCushionCode(event.target.value)}>{allowedCushions.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name}</option>)}</select></label>}
        </div>
        {!customActive && orderOptions.length > 0 && <div className="rms-options"><p className="field-label">Options for {activePrefix} · {choices.find((item) => item.code === activePrefix)?.label || selectedModel?.model_name}</p>{orderOptions.map((item) => <label className="rms-option-row" key={item.code}><input type="checkbox" checked={options.includes(item.code)} onChange={() => setLiveOption(item.code)} /><span><strong>{item.code}</strong><small>{item.name}</small></span></label>)}</div>}
        {prefixDocumented && <p className="sku-style-context"><strong>Selected style:</strong> {`${activePrefix} · ${choices.find((item) => item.code === activePrefix)?.label}`} <span>RMS style/model field: {selectedModelCode}</span></p>}
        <details className="custom-rms-details"><summary>Enter a Group not present in the catalog</summary><p>Manual identifiers can be previewed, but unknown options and finishes are not included.</p><div className="rms-custom-row"><label className="form-field"><span>Group</span><input value={customGroup} onChange={(event) => setCustomGroup(event.target.value)} maxLength={4} /></label><label className="form-field"><span>Style</span><input value={customStyle} onChange={(event) => setCustomStyle(event.target.value)} maxLength={4} /></label><button type="button" className="back-button" onClick={applyCustomIdentifiers}>Use manual Group and Style</button></div></details>
        {batteryWarning && <p className="rms-warning"><Info size={15} />{batteryWarning}</p>}
      </section>
      <aside className="rms-entry-card card">
        <div className="rms-card-heading"><div><span className="eyebrow">MATCH THE SCREEN</span><h2>RMS stock fields</h2></div></div>
        <p className="rms-screen-note">Enter each field as RMS displays it. Group, Style, Grade, Pattern, and Color remain distinct; the compact string preview is only a convenience and is not an inventory lookup.</p>
        <div className="rms-field-grid">{fields.fields.map(([label, value]) => <div className="rms-field-cell" key={label}><span>{label}</span><strong>{value || (label === 'Group' ? 'Choose' : label === 'Style' || label === 'Grade' ? 'Enter' : '-')}</strong></div>)}</div>
        <div className="rms-code-output"><span>SKU STRING PREVIEW</span><code>{fields.sku || 'Complete Group, Style, Grade, Pattern, and Color to preview the string.'}</code><button type="button" className="copy-button" onClick={copyPreview} disabled={copyDisabled}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy SKU'}</button>{copyDisabled && <small className="sku-generation-status">{!customActive && !prefixDocumented ? 'Choose a listed Group or enter a manual Group and Style.' : !customActive && !documentedOptions ? 'This exact model/group has no option record.' : !swatchMatchesCover ? 'Choose a model-listed cover swatch.' : finishAllowed && !finish ? 'Choose a listed finish.' : 'Complete the SKU fields.'}</small>}</div>
        <details className="rms-details"><summary>Finish and option suffixes</summary><dl><div><dt>Finish</dt><dd>{fields.finish || 'Not selected'}</dd></div><div><dt>Options</dt><dd>{fields.options.join(', ') || 'None selected'}</dd></div><div><dt>Model swatch</dt><dd>{selectedSwatch?.code || 'Not selected'}{selectedSwatch?.note ? ` · ${selectedSwatch.note}` : ''}</dd></div><div><dt>Prefix description</dt><dd>{prefixRecord?.motion_type || 'Not mapped'}</dd></div></dl></details>
        <div className="rms-disclaimer"><Info size={15} /><p><strong>Code preview only.</strong> It mirrors the RMS field layout shown, but does not check inventory, price, compatibility, or submit anything.</p></div>
      </aside>
    </div>
    <section className="quote-sheet card" aria-label="Customer quote and order checklist"><div className="quote-sheet-heading"><div><p className="eyebrow">CUSTOMER SUMMARY · PRINTABLE</p><h2>Comfort plan &amp; order checklist</h2></div><button type="button" className="primary-button no-print" onClick={printQuote}><Printer size={15} /> Print / Save as PDF</button></div><label className="form-field no-print"><span>Customer or visit note · optional, stored only in this page</span><input value={quoteContext} onChange={(event) => setQuoteContext(event.target.value)} placeholder="e.g. Living room refresh" /></label><p className="quote-context">{quoteContext || 'Customer name / visit reference: ______________________________'}</p><div className="quote-item"><strong>{selectedModel?.model_name || 'Selected model'} · {selectedModelCode}</strong><span>{prefixDocumented ? `${activePrefix} · ${prefixRecord?.motion_type || choices.find((item) => item.code === activePrefix)?.label}` : 'Style / mechanism not selected from catalog'}</span><span>Cover swatch: {selectedSwatch?.code || 'not selected'}{selectedSwatch?.note ? ` · ${selectedSwatch.note}` : ''}</span><span>SKU preview: <code>{fields.sku || 'incomplete'}</code></span><span>Options: {fields.options.join(', ') || 'none selected'}</span></div><h3>Sales order checklist</h3><ul className="order-checklist"><li>Confirm model, style/group, hand, and exact configuration in current ordering system.</li><li>Confirm cover cap, grade, pattern and color against current swatches and eligibility.</li><li>Verify each option, console finish, cushion, battery, and finish against the exact style.</li><li>Confirm dimensions, room clearance, delivery access, capacity, pricing, and availability from current sources.</li><li>Review order details with the customer before submission; this tool does not create an order.</li></ul><p className="quote-disclaimer">Planning aid only. Not a sales quote, confirmed price, inventory check, fit certification, or order. No pricing is available in the supplied local sources.</p></section>
  </section>;
}
