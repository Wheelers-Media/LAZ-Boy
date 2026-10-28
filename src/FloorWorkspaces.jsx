import React, { useEffect, useMemo, useState } from 'react';
import { Armchair, Check, Copy, Info, Layers3, Minus, Plus, ShieldCheck, Speaker, Sparkles } from './icons.jsx';
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
  return <section className="module-page floor-workspace">
    <div className="module-intro"><h1>Floor <em>unit</em></h1></div>
    <div className="floor-layout">
      <section className="floor-controls card">
        <SectionTitle icon={Armchair} title="Select a floor model" />
        <div className="floor-fields"><label className="form-field">{fieldLabel('Floor model', 'Choose the floor model for a field-by-field SKU preview. No inventory or order validation is performed.')}<select value={modelCode} onChange={(event) => { const nextModel = event.target.value; const nextPrefix = floorModelPrefix(catalog, nextModel); setModelCode(nextModel); onModelChange?.(nextModel); setPrefix(nextPrefix); setCoverCode(''); setPillowCover(''); setBatteryCode(''); setAudio(false); setFeatherlite(false); setTrimCode('NN'); setCushionCode('Standard'); }}>{groupModelsBySection(catalog, floorModels).map((group) => <optgroup key={group.name} label={`${group.name} (${group.items.length})`}>{group.items.map((item) => <option key={item.model_code} value={item.model_code}>{item.model_name} · {item.model_code}{item.unverified ? ' (not in guide)' : ''}</option>)}</optgroup>)}<optgroup label="Floor-unit examples">{FLOOR_LINES.filter((line) => !floorModels.some((item) => item.model_code === line.model_code)).map((line) => <option key={line.model_code} value={line.model_code}>{line.model_name} · {line.model_code}</option>)}</optgroup></select></label>
          <label className="form-field">{fieldLabel('Style / motion prefix', prefixMechanism?.text || prefixRecord?.description, (title, text, pitch) => window.dispatchEvent(new CustomEvent('floor-info', { detail: { title, text, pitch } })), prefixMechanism?.pitch)}<select value={prefix} onChange={(event) => { setPrefix(event.target.value); setBatteryCode(''); setAudio(false); setFeatherlite(false); setTrimCode('NN'); setCushionCode('Standard'); }}><option value="">Choose group / style prefix…</option>{modelStyleChoices.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.label}</option>)}</select><small>{modelStyleChoices.length ? 'Only groups and styles listed for this model are shown.' : 'No RMS group/style mapping is in the supplied references for this model yet.'}</small></label>
          {unlisted && <p className="rms-warning"><Info size={15} />Not in the April 2026 guide or price book. Covers, finishes and options are not documented, so none are offered.</p>}<div className="form-field cover-field">{fieldLabel('Body cover', coverRecord?.description, (title, text, pitch) => window.dispatchEvent(new CustomEvent('floor-info', { detail: { title, text, pitch } })))}<CoverPicker key={`${modelCode}-${prefix}`} label="Body cover" describe={describeCover} swatches={modelSwatches} value={coverCode} onChange={(code) => { setCoverCode(code); setPillowCover(''); }} /></div>
          {coverParts && coverRecord && <p className="floor-cover-source">Pattern and color are taken from the selected model-list code: <strong>{coverParts[2].slice(0, 4)} · {coverParts[2].slice(4)}</strong>.</p>}
          {styleOptions?.finishMarkerListed && <label className="form-field">{fieldLabel('Wood finish', finishRecord?.description, (title, text, pitch) => window.dispatchEvent(new CustomEvent('floor-info', { detail: { title, text, pitch } })))}<select value={activeFinish} onChange={(event) => setFinish(event.target.value)}>{finishChoices.map((item) => <option key={item.code} value={item.code}>{item.name} · {item.code}{item.standard ? ' (standard)' : ''}</option>)}</select></label>}
          {availableTrims.length > 1 && <label className="form-field">{fieldLabel('Nailhead trim', 'Only trim options listed for this exact model style are shown.', (title, text, pitch) => window.dispatchEvent(new CustomEvent('floor-info', { detail: { title, text, pitch } })), getOptionBenefit(catalog, trimCode)?.pitch)}<select value={availableTrims.some((item) => item.code === trimCode) ? trimCode : 'NN'} onChange={(event) => setTrimCode(event.target.value)}>{availableTrims.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name}</option>)}</select></label>}
          {availableCushions.length > 1 && <label className="form-field">{fieldLabel('Cushion core', getOptionBenefit(catalog, cushionCode)?.benefit || catalog.cushion_upgrades.find((item) => item.code === cushionCode)?.description, (title, text, pitch) => window.dispatchEvent(new CustomEvent('floor-info', { detail: { title, text, pitch } })), getOptionBenefit(catalog, cushionCode)?.pitch)}<select value={availableCushions.some((item) => item.code === cushionCode) ? cushionCode : 'Standard'} onChange={(event) => setCushionCode(event.target.value)}>{availableCushions.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name} · {item.warranty_years} yr</option>)}</select></label>}
          {availableBatteries.length > 0 && <label className="form-field">{fieldLabel('Battery pack', selectedBattery?.description || 'Only packs compatible with the selected style are shown.', (title, text, pitch) => window.dispatchEvent(new CustomEvent('floor-info', { detail: { title, text, pitch } })))}<select value={batteryCode} onChange={(event) => setBatteryCode(event.target.value)}><option value="">No battery pack</option>{availableBatteries.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.batteries} battery</option>)}</select></label>}</div>
        {allowedOptions.has('P1') && <div className="customization-row"><div><strong>Contrasting pillow cover · P1</strong><small>Choose only covers listed for this model.</small></div><CoverPicker key={`pillow-${modelCode}-${coverCode}`} label="Pillow" describe={describeCover} swatches={pillowSwatches} value={pillowCover} onChange={(code) => setPillowCover(code)} /></div>}
        {allowedOptions.has('FP') && <label className="checkbox-row"><input type="checkbox" checked={featherlite} onChange={(event) => setFeatherlite(event.target.checked)} /><span className="custom-checkbox"><Check size={12} /></span><span>Featherlite pillow upgrade · FP</span><InfoButton label="Featherlite details" onClick={() => window.dispatchEvent(new CustomEvent('floor-info', { detail: { title: 'Featherlite pillow upgrade', text: catalog.pillows_and_accents.options.find((item) => item.code === 'FP')?.description, pitch: getOptionBenefit(catalog, 'FP')?.pitch || '“A feather-and-down blend adds a softer, more relaxed feel to the included throw pillows.”' } }))} /></label>}
        {allowedOptions.has('AL') && <label className="checkbox-row"><input type="checkbox" checked={audio} onChange={(event) => setAudio(event.target.checked)} /><span className="custom-checkbox"><Check size={12} /></span><span>AudioLuxe surround sound · AL</span><Speaker size={15} /></label>}
        {!selectedPrefixDocumented && <p className="tip-strip"><Info size={15} />This model has no documented RMS group/style in the loaded references yet; SKU copy remains unavailable until that source is added.</p>}
      </section>
      <aside className="floor-summary card"><p className="eyebrow">LIVE FLOOR UNIT</p><h2>{model?.model_name || 'Selected model'} <small>{modelCode}</small></h2><p className="floor-model-type">{getGuideStyle(catalog, modelCode, prefix)?.category || prefixRecord?.motion_type || model?.category || modelStyleChoices.find((item) => item.code === prefix)?.label}{model?.scale && !/not specified/i.test(model.scale) ? ` · ${model.scale}` : ""}</p><div className="floor-spec"><span>Model-listed cover</span><strong>{coverRecord ? `${coverRecord.name} · ${coverRecord.code}` : 'Choose a cover'}</strong></div>{pillowCover && <div className="floor-spec"><span>Contrasting pillow cover</span><strong>{pillowCover}{featherlite ? ' · FP' : ''}</strong></div>}{styleOptions?.finishMarkerListed && <div className="floor-spec"><span>Wood finish · trim</span><strong>{finishRecord?.name} · {trimCode}</strong></div>}{availableCushions.length > 1 && <div className="floor-spec"><span>Cushion preference</span><strong>{cushionCode}</strong></div>}<div className="floor-warranty"><ShieldCheck size={15} /><span>{floorWarranty.lifetime_coverage} {floorWarranty.three_year_coverage} {floorWarranty.one_year_coverage}</span></div><div className="sku-output"><span>SKU PREVIEW · NOT ORDER VALIDATED</span><code>{sku}</code><button className="copy-button" onClick={copy} disabled={!selectedPrefixDocumented || !coverParts || !sku || sku.startsWith('Choose ')}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy RMS SKU'}</button></div></aside>
    </div>
  </section>;
}
