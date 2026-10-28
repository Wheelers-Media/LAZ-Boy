import React, { useEffect, useMemo, useState } from 'react';
import { Armchair, Check, Copy, Info, Layers3, Minus, Plus, Search, ShieldCheck, Speaker, Sparkles } from './icons.jsx';
import { StepFlow, TileSelect } from './StepFlow.jsx';
import { CoverPicker } from './CoverPicker.jsx';
import { describeCoverEligibility, describeMechanism, getMechanismForPrefix, getOptionBenefit, encodeRmsSku, findCompatibleBattery, getDefaultRmsGroup, getGuideStyle, getGuideProductIndex, groupModelsBySection, isUnlistedModel, getModelCoverOptions, getModelCoverSwatches, getRmsModelStyleChoices, getRmsStyleOptions, getStyleFinishes, getSectionalPieceOptions, sectionalPiecesForFamily, validateSectionalConfiguration } from './logic.js';

const FLOOR_LINES = [
  { model_code: '677', model_name: 'Lauren', prefix: '610', category: 'Stationary Sofa' },
  { model_code: '811', model_name: 'Acadia', prefix: '811', category: 'Motion Sectional' },
];
const floorModelPrefix = (catalog, modelCode) => getDefaultRmsGroup(catalog, modelCode);
const InfoButton = ({ onClick, label }) => <button type="button" className="field-info" aria-label={label} onClick={onClick}><Info size={13} /></button>;
const SectionTitle = ({ icon: Icon, title }) => <div className="module-head"><span className="module-icon"><Icon size={19} /></span><div><h2>{title}</h2></div></div>;
const GENERIC_PITCH = '“Let’s choose the details that make this piece feel right for your home.”';
const fieldLabel = (text, info, onInfo, pitch) => <span>{text}{onInfo && <InfoButton label={`${text} information`} onClick={() => onInfo(text, info, pitch || GENERIC_PITCH)} />}</span>;

export function CustomizeFloorUnit({ catalog, onCopy, initialModelCode = '724', onModelChange }) {
  const [modelCode, setModelCode] = useState(initialModelCode);
  const [prefix, setPrefix] = useState(() => floorModelPrefix(catalog, initialModelCode));
  const [coverCode, setCoverCode] = useState('');
  const [pillowCover, setPillowCover] = useState('');
  const [featherlite, setFeatherlite] = useState(false);
  const [finish, setFinish] = useState('007');
  const [trimCode, setTrimCode] = useState('NN');
  const [cushionCode, setCushionCode] = useState('Standard');
  const [batteryCode, setBatteryCode] = useState('');
  const [audio, setAudio] = useState(false);
  const floorWarranty = catalog.warranty_rules || {};
  const [copied, setCopied] = useState(false);
  const floorModels = useMemo(() => {
    const byCode = new Map(catalog.models_database.map((entry) => [entry.model_code, entry]));
    return getGuideProductIndex(catalog).map((item) => byCode.get(item.modelCode) || { model_code: item.modelCode, model_name: item.modelName, category: item.categories?.[0] || '', unverified: item.unverified });
  }, [catalog]);
  const model = floorModels.find((entry) => entry.model_code === modelCode) || FLOOR_LINES.find((entry) => entry.model_code === modelCode);
  const modelStyleChoices = getRmsModelStyleChoices(catalog, modelCode);
  const selectedPrefixDocumented = modelStyleChoices.some((item) => item.code === prefix);
  const styleOptions = selectedPrefixDocumented ? getRmsStyleOptions(catalog, modelCode, prefix) : null;
  const allowedOptions = styleOptions?.options || new Set();
  const guideListsModel = Boolean(catalog.style_index_2026?.styles?.some((row) => row.kind === 'style' && row.model === modelCode));
  const unlisted = isUnlistedModel(catalog, modelCode);
  const productCoverOptions = useMemo(() => guideListsModel || unlisted ? [] : getModelCoverOptions(catalog, modelCode), [catalog, modelCode, guideListsModel, unlisted]);
  const styleFinishes = getStyleFinishes(catalog, modelCode, prefix);
  const finishChoices = guideListsModel ? [...(styleFinishes.standard ? [{ ...styleFinishes.standard, standard: true }] : []), ...styleFinishes.optional] : catalog.wood_finishes.map((item) => ({ code: item.code, name: item.name }));
  const modelSwatches = useMemo(() => {
    const merged = new Map();
    getModelCoverSwatches(catalog, modelCode, guideListsModel ? prefix : undefined).forEach((item) => merged.set(item.code, item));
    productCoverOptions.forEach((item) => { const match = item.code.match(/^([A-Z]{1,3})(\d{4})(\d{2})$/); if (match) merged.set(item.code, { ...merged.get(item.code), ...item, grade: match[1], pattern: match[2], color: match[3], material: merged.get(item.code)?.material || item.type || 'Fabric', basis: 'listed' }); });
    return [...merged.values()];
  }, [catalog, modelCode, productCoverOptions, guideListsModel, prefix]);
  const noPillowCaps = new Set(catalog.fabric_cover_program_a26?.businessRules?.pillowsNotAllowedCapCodes || []);
  const swatchCodes = modelSwatches.map((item) => item.code).join('|');
  useEffect(() => {
    const valid = new Set(swatchCodes.split('|'));
    if (coverCode && !valid.has(coverCode)) { setCoverCode(''); setPillowCover(''); }
    else if (pillowCover && !valid.has(pillowCover)) setPillowCover('');
  }, [swatchCodes, coverCode, pillowCover]);
  const describeCover = (swatch) => describeCoverEligibility(catalog, modelCode, guideListsModel ? prefix : '', swatch);
  const pillowSwatches = modelSwatches.filter((item) => item.code !== coverCode && !noPillowCaps.has(item.capCode));
  const coverRecord = modelSwatches.find((item) => item.code === coverCode) || productCoverOptions.find((item) => item.code === coverCode);
  const coverParts = coverCode.match(/^([A-Z]{1,3})([0-9]{6})$/);
  const prefixRecord = catalog.style_prefixes.find((entry) => entry.code === prefix);
  const prefixMechanism = describeMechanism(getMechanismForPrefix(catalog, prefix));
  const activeFinish = finishChoices.some((item) => item.code === finish) ? finish : finishChoices[0]?.code || '';
  const finishRecord = catalog.wood_finishes.find((item) => item.code === activeFinish);
  const availableTrims = catalog.nailhead_trims.filter((item) => item.code === 'NN' || allowedOptions.has(item.code));
  const availableCushions = catalog.cushion_upgrades.filter((item) => item.code === 'Standard' || allowedOptions.has(item.code));
  const availableBatteries = catalog.battery_packs.filter((item) => findCompatibleBattery(catalog, prefix, item.code));
  const selectedBattery = catalog.battery_packs.find((pack) => pack.code === batteryCode);
  const skuGroup = prefix && /^P9_$/.test(prefix) ? `P9${modelCode.slice(0, 1)}` : prefix;
  const skuOptions = [trimCode !== 'NN' && allowedOptions.has(trimCode) ? trimCode : '', cushionCode !== 'Standard' && allowedOptions.has(cushionCode) ? cushionCode : '', batteryCode && allowedOptions.has(batteryCode) ? batteryCode : '', audio && allowedOptions.has('AL') ? 'AL' : '', featherlite && allowedOptions.has('FP') ? 'FP' : '', pillowCover && pillowCover !== coverCode && allowedOptions.has('P1') ? 'P1' : ''].filter(Boolean);
  const sku = skuGroup && selectedPrefixDocumented && coverParts
    ? encodeRmsSku({ prefix: skuGroup, modelCode, cover: coverParts[1], patternCode: coverParts[2], finish: styleOptions?.finishMarkerListed ? activeFinish : '', optionCodes: skuOptions })
    : 'Choose a model-listed cover and documented style for preview';
  const copy = async () => { if (!selectedPrefixDocumented || !coverParts || !sku || sku.startsWith('Choose ')) return; await onCopy(sku); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  const [stepId, setStepId] = useState('model');
  const [modelPicking, setModelPicking] = useState(false);
  const [modelQuery, setModelQuery] = useState('');
  const [modelSection, setModelSection] = useState('');
  const modelGroups = useMemo(() => groupModelsBySection(catalog, floorModels), [catalog, floorModels]);
  const currentSection = modelGroups.find((group) => group.items.some((item) => item.model_code === modelCode))?.name || '';
  const query = modelQuery.trim().toLowerCase();
  const modelHits = query ? floorModels.filter((item) => `${item.model_name} ${item.model_code}`.toLowerCase().includes(query)) : [];
  const modelTile = (item) => ({ value: item.model_code, title: item.model_name, desc: `Model ${item.model_code}${item.unverified ? ' · not in guide' : ''}` });
  const resetPicks = () => { setCoverCode(''); setPillowCover(''); setBatteryCode(''); setAudio(false); setFeatherlite(false); setTrimCode('NN'); setCushionCode('Standard'); };
  const pickModel = (nextModel) => {
    const nextPrefix = floorModelPrefix(catalog, nextModel);
    setModelCode(nextModel); onModelChange?.(nextModel); setPrefix(nextPrefix); resetPicks();
    setModelPicking(false); setModelQuery(''); setModelSection('');
    setStepId(getRmsModelStyleChoices(catalog, nextModel).length > 1 ? 'style' : 'cover');
  };
  const pickPrefix = (value) => { setPrefix(value); setBatteryCode(''); setAudio(false); setFeatherlite(false); setTrimCode('NN'); setCushionCode('Standard'); setStepId('cover'); };
  const showFinishStep = Boolean(styleOptions?.finishMarkerListed) || availableTrims.length > 1 || availableCushions.length > 1;
  const showExtrasStep = availableBatteries.length > 0 || allowedOptions.has('AL');
  const showPillowStep = allowedOptions.has('FP') || allowedOptions.has('P1');
  const skuReady = selectedPrefixDocumented && coverParts && sku && !sku.startsWith('Choose ');
  const todo = [!selectedPrefixDocumented && { id: 'style', label: 'Style' }, !coverCode && { id: 'cover', label: 'Cover' }].filter(Boolean);
  const coverSummary = coverRecord ? `${coverRecord.name || ''} ${coverRecord.code}`.trim() : coverCode;
  const summaryCard = <div className="floor-summary-inner"><p className="eyebrow">LIVE FLOOR UNIT</p><h2>{model?.model_name || 'Selected model'} <small>{modelCode}</small></h2><p className="floor-model-type">{getGuideStyle(catalog, modelCode, prefix)?.category || prefixRecord?.motion_type || model?.category || modelStyleChoices.find((item) => item.code === prefix)?.label}{model?.scale && !/not specified/i.test(model.scale) ? ` · ${model.scale}` : ''}</p><div className="floor-spec"><span>Model-listed cover</span><strong>{coverRecord ? `${coverRecord.name} · ${coverRecord.code}` : 'Choose a cover'}</strong></div>{pillowCover && <div className="floor-spec"><span>Contrasting pillow cover</span><strong>{pillowCover}{featherlite ? ' · FP' : ''}</strong></div>}{styleOptions?.finishMarkerListed && <div className="floor-spec"><span>Wood finish · trim</span><strong>{finishRecord?.name} · {trimCode}</strong></div>}{availableCushions.length > 1 && <div className="floor-spec"><span>Cushion preference</span><strong>{cushionCode}</strong></div>}<div className="floor-warranty"><ShieldCheck size={15} /><span>{floorWarranty.lifetime_coverage} {floorWarranty.three_year_coverage} {floorWarranty.one_year_coverage}</span></div><div className="sku-output"><span>SKU PREVIEW · NOT ORDER VALIDATED</span><code>{sku}</code><button type="button" className="copy-button" onClick={copy} disabled={!skuReady}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy RMS SKU'}</button></div></div>;
  const steps = [
    { id: 'model', label: 'Model', summary: model ? `${model.model_name} · ${modelCode}` : '', done: Boolean(model), hint: 'Pick the floor model. Search by name or number, or browse by category.', content: <>
      {!modelPicking && <div className="sf-current-card"><div><strong>{model?.model_name || 'No model'}</strong><span>Model {modelCode}{currentSection ? ` · ${currentSection}` : ''}</span><span>{modelStyleChoices.length} {modelStyleChoices.length === 1 ? 'style' : 'styles'} in the April 2026 guide</span></div><button type="button" className="sf-secondary" onClick={() => setModelPicking(true)}>Change model</button></div>}
      {modelPicking && <>
        <label className="sf-search"><Search size={20} /><input autoFocus type="search" value={modelQuery} onChange={(event) => setModelQuery(event.target.value)} placeholder="Search model name or number" aria-label="Search models" /></label>
        {query ? (modelHits.length ? <TileSelect label="Models" options={modelHits.map(modelTile)} value={modelCode} onChange={pickModel} columns={2} /> : <p className="sf-empty">No model matches “{modelQuery}”.</p>)
          : modelSection ? <><button type="button" className="sf-link" onClick={() => setModelSection('')}>‹ All categories</button><TileSelect label={modelSection} options={(modelGroups.find((group) => group.name === modelSection)?.items || []).map(modelTile)} value={modelCode} onChange={pickModel} columns={2} /></>
          : <div className="index-launcher">{modelGroups.map((group) => <button type="button" key={group.name} className="index-launch" onClick={() => setModelSection(group.name)}><strong>{group.name}</strong><b>{group.items.length}</b><small>{group.items.slice(0, 3).map((item) => item.model_name).join(' · ')}</small></button>)}</div>}
        <button type="button" className="sf-link" onClick={() => { setModelPicking(false); setModelQuery(''); setModelSection(''); }}>Keep {model?.model_name}</button>
      </>}
    </> },
    { id: 'style', label: 'Style', summary: selectedPrefixDocumented ? `${prefix} · ${modelStyleChoices.find((item) => item.code === prefix)?.label || ''}` : '', done: selectedPrefixDocumented, hint: prefixMechanism?.text || 'The style is the RMS group: it sets the mechanism and which options exist.', content: <>
      {unlisted && <p className="rms-warning"><Info size={15} />Not in the April 2026 guide or price book. Covers, finishes and options are not documented, so none are offered.</p>}
      {modelStyleChoices.length ? <TileSelect label="Style" options={modelStyleChoices.map((item) => ({ value: item.code, title: item.label, desc: `Group ${item.code}` }))} value={prefix} onChange={pickPrefix} columns={2} /> : <p className="sf-empty">No RMS group/style mapping is in the supplied references for this model yet.</p>}
    </> },
    { id: 'cover', label: 'Cover', summary: coverSummary, done: Boolean(coverCode), hint: 'Choose a grade, then a pattern, then a colour. Only covers listed for this model are shown.', content: <>
      <CoverPicker key={`${modelCode}-${prefix}`} label="Body cover" describe={describeCover} swatches={modelSwatches} value={coverCode} onChange={(code) => { setCoverCode(code); setPillowCover(''); }} />
      {coverParts && coverRecord && <p className="floor-cover-source">Pattern and color are taken from the selected model-list code: <strong>{coverParts[2].slice(0, 4)} · {coverParts[2].slice(4)}</strong>.</p>}
    </> },
    { id: 'finish', label: 'Finish and trim', hidden: !showFinishStep, summary: [styleOptions?.finishMarkerListed && activeFinish, trimCode !== 'NN' && trimCode, cushionCode !== 'Standard' && cushionCode].filter(Boolean).join(' · ') || 'Defaults', done: true, content: <>
      {styleOptions?.finishMarkerListed && <div className="sf-group"><h3>Wood finish</h3><TileSelect label="Wood finish" options={finishChoices.map((item) => ({ value: item.code, title: item.name, desc: `FN ${item.code}`, badge: item.standard ? 'Standard' : '' }))} value={activeFinish} onChange={setFinish} columns={2} /></div>}
      {availableTrims.length > 1 && <div className="sf-group"><h3>Nailhead trim</h3><TileSelect label="Nailhead trim" options={availableTrims.map((item) => ({ value: item.code, title: item.name, desc: item.code === 'NN' ? 'No nailhead' : item.code }))} value={availableTrims.some((item) => item.code === trimCode) ? trimCode : 'NN'} onChange={setTrimCode} columns={2} /></div>}
      {availableCushions.length > 1 && <div className="sf-group"><h3>Cushion</h3><TileSelect label="Cushion" options={availableCushions.map((item) => ({ value: item.code, title: item.name, desc: `${item.code === 'Standard' ? 'Included' : item.code} · ${item.warranty_years} year foam warranty` }))} value={availableCushions.some((item) => item.code === cushionCode) ? cushionCode : 'Standard'} onChange={setCushionCode} columns={2} /></div>}
    </> },
    { id: 'extras', label: 'Battery and audio', hidden: !showExtrasStep, summary: [batteryCode, audio && 'AL'].filter(Boolean).join(' · ') || 'None', done: true, content: <>
      {availableBatteries.length > 0 && <div className="sf-group"><h3>Battery pack</h3><TileSelect label="Battery pack" options={[{ value: '', title: 'No battery pack', desc: 'Plug-in power only' }, ...availableBatteries.map((item) => ({ value: item.code, title: `${item.batteries} battery`, desc: item.code }))]} value={batteryCode} onChange={setBatteryCode} columns={2} /></div>}
      {allowedOptions.has('AL') && <div className="sf-group"><h3>Audio</h3><TileSelect multi label="Audio" options={[{ value: 'AL', title: 'AudioLuxe surround sound', desc: 'AL' }]} values={audio ? ['AL'] : []} onToggle={() => setAudio(!audio)} /></div>}
    </> },
    { id: 'pillows', label: 'Pillows', hidden: !showPillowStep, summary: [featherlite && 'FP', pillowCover && `P1 ${pillowCover}`].filter(Boolean).join(' · ') || 'Match body cover', done: true, content: <>
      {allowedOptions.has('FP') && <div className="sf-group"><h3>Featherlite pillows</h3><TileSelect multi label="Featherlite" options={[{ value: 'FP', title: 'Featherlite pillow upgrade', desc: 'FP · a feather-and-down blend for a softer, more relaxed feel' }]} values={featherlite ? ['FP'] : []} onToggle={() => setFeatherlite(!featherlite)} /></div>}
      {allowedOptions.has('P1') && <div className="sf-group"><h3>Contrasting pillow cover</h3><p className="sf-hint">{coverCode ? 'Choose a cover listed for this model, or leave it to match the body cover.' : 'Choose the body cover first.'}</p>{coverCode && <CoverPicker key={`pillow-${modelCode}-${coverCode}`} label="Pillow" describe={describeCover} swatches={pillowSwatches} value={pillowCover} onChange={(code) => setPillowCover(code)} />}{pillowCover && <button type="button" className="sf-secondary" onClick={() => setPillowCover('')}>Match body cover</button>}</div>}
    </> },
    { id: 'review', label: 'Review and copy', summary: skuReady ? sku : 'Not complete', done: Boolean(skuReady), content: <>
      {todo.length > 0 && <div className="sf-todo"><h3>Still to do</h3>{todo.map((item) => <button type="button" key={item.id} className="sf-todo-row" onClick={() => setStepId(item.id)}><strong>{item.label}</strong><span>Choose</span></button>)}</div>}
      <div className="sf-phone-only">{summaryCard}</div>
      {!selectedPrefixDocumented && <p className="tip-strip"><Info size={15} />This model has no documented RMS group/style in the loaded references yet; SKU copy remains unavailable until that source is added.</p>}
    </> },
  ];
  return <section className="module-page floor-workspace">
    <div className="module-intro"><h1>Floor <em>unit</em></h1></div>
    <StepFlow steps={steps} active={stepId} onActive={setStepId} side={<div className="floor-summary card">{summaryCard}</div>}
      strip={skuReady ? <code>{sku}</code> : `${model?.model_name || 'Model'}${prefix ? ` · ${prefix}` : ''}`}
      finish={<button type="button" className="sf-next" onClick={copy} disabled={!skuReady}>{copied ? 'Copied' : 'Copy SKU'}</button>} />
  </section>;
}
