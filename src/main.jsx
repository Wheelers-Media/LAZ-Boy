import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowDown, ArrowLeft, ArrowRight, Armchair, BatteryCharging, BookOpen, Check, CheckCircle2, Copy, Heart, Info, Layers3, Menu, Minus, Plus, Search, ShieldCheck, Sparkles, SwatchBook, Sofa, Wrench, X } from 'lucide-react';
import './styles.css';
import './brand.css';
import { encodeRmsSku, findLiftTier, findCompatibleBattery, getCatalogCapabilityLeads, getContextualBatteryOptions, getContextualModelOptions, getContextualOptionRecords, getContextualPreferenceChoices, getContextualStyleChoices, getDimensionBasedRecommendations, getFullProductIndex, getDefaultRmsGroup, filterCoverOptionsByMaterial, getMaterialPreferenceChoices, getModelCoverOptions, getRecommendations, getRoomClearance, getSectionalPrefix, matchingPrefixes, reclinerCatalogSearchEntries, sectionalPiecesForFamily } from './logic.js';
import { CustomizeFloorUnit, SectionalStudio } from './FloorWorkspaces.jsx';
import { SectionalDesignStudio } from './SectionalDesignStudio.jsx';
import { SkuBuilderWorkspace } from './SkuBuilderWorkspace.jsx';
import { FabricsCareWorkspace } from './FabricsCareWorkspace.jsx';
import { FIT_DEFAULTS, FitDiscover } from './FitDiscover.jsx';
import { applyGuideOptionDefinitions, getGuideProductIndex, heightInches, PRODUCT_INDEX_GROUPS, cleanIndexCategories, indexGroupsFor } from './logic.js';

const STEPS = ['Ergonomics', 'Room clearance', 'Category', 'Mechanisms', 'Upholstery'];
const NAV_ITEMS = [[Armchair, 'Fit'], [Wrench, 'SKU Builder'], [BookOpen, 'Product Index'], [Sparkles, 'Floor Unit'], [Layers3, 'Sectional Studio'], [SwatchBook, 'Fabrics & Care'], [ShieldCheck, 'Support']];
const categories = ['Recliners', 'High-leg designer', 'Motion sofas / loveseats', 'Modular sectionals', 'Stationary suites', 'Sleepers', 'Lift chairs'];
const mechanismOptions = [
  ['Manual', 'Simple, dependable reclining'],
  ['Power recline', 'Effortless adjustment at a touch'],
  ['Power + headrest', 'Fine-tune head and foot support'],
  ['Power + lumbar', 'Extra lower-back support'],
  ['Lift chair', 'Bronze-series lift support'],
  ['Gold-series lift', 'Gold-series power lift'],
  ['No reclining mechanism', 'Stationary seating and sleepers'],
];
const modelPrefixOptions = (catalog, code) => {
  const model = catalog.models_database.find((item) => item.model_code === code);
  if (!model) return [];
  const text = model.category.toLowerCase();
  const family = /lift/.test(text) ? 'lift' : /sectional/.test(text) ? 'sectional' : /motion/.test(text) ? 'motion' : /sleeper/.test(text) ? 'sleeper' : /stationary/.test(text) ? 'stationary' : /accent|high leg/.test(text) ? 'accent' : 'recliner';
  return catalog.style_prefixes.filter((prefix) => {
    const category = prefix.category.toLowerCase();
    return family === 'lift' ? /lift/.test(category)
      : family === 'sectional' ? /sectional|duo/.test(category)
        : family === 'motion' ? /motion/.test(category)
          : family === 'sleeper' ? /sleeper/.test(category)
            : family === 'stationary' ? /stationary/.test(category)
              : family === 'accent' ? /accent|designer choice|high leg/.test(category)
                : /recliner/.test(category) && !/high leg|lift/.test(category);
  });
};
const modelFor = (catalog, code) => catalog.models_database.find((model) => model.model_code === code);
const initialAnswers = { scale: 'Small / Medium', height: "5′8″", weight: '', clearance: 'Standard · 12–18 in', category: 'Recliners', mechanism: 'Power recline', upgrades: [], fabric: '', kidsPets: false, seat_depth_preference: 'Not sure yet', back_support_preference: 'Not sure yet', cushion_preference: 'Standard Poly', support_preference: 'No preference yet', material_preference: 'No preference yet' };
const colorList = (item) => item.colors.map((color) => (item.colorNames?.[color] ? `${color} ${item.colorNames[color]}` : color)).join(', ');
const DEFAULT_COLOR_SHADE = '6';
function App() {
  const [catalog, setCatalog] = useState(null);
  const [researchReference, setResearchReference] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [fitState, setFitState] = useState(FIT_DEFAULTS);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [modelCode, setModelCode] = useState('724');
  const [fitModelCode, setFitModelCode] = useState('');
  const [fitStyleCode, setFitStyleCode] = useState('');
  const [prefix, setPrefix] = useState('10X');
  const [cover, setCover] = useState('DP');
  const [finish, setFinish] = useState('007');
  const [patternCode, setPatternCode] = useState('165667');
  const [colorShade, setColorShade] = useState('7');
  const [pillowCover, setPillowCover] = useState('FL');
  const [pillowUpgrade, setPillowUpgrade] = useState(false);
  const [trimCode, setTrimCode] = useState('NN');
  const [cushionCode, setCushionCode] = useState('Standard');
  const [floorModel, setFloorModel] = useState('724');
  const [optionCodes, setOptionCodes] = useState([]);
  const [copied, setCopied] = useState(false);
  const [customerMode, setCustomerMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Fit');
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [buildModelCode, setBuildModelCode] = useState('724');
  const [floorWorkspaceModel, setFloorWorkspaceModel] = useState('724');
  const [indexSearch, setIndexSearch] = useState('');
  const [indexGroup, setIndexGroup] = useState('All');
  const [fabricSearch, setFabricSearch] = useState('');
  const [piecePrefix, setPiecePrefix] = useState('44A / 8AU');
  const [sectionalFamily, setSectionalFamily] = useState('La-Z-Time');
  const [piecePillowCover, setPiecePillowCover] = useState('FL');
  const [pieceFeatherlite, setPieceFeatherlite] = useState(false);
  const [cart, setCart] = useState([]);
  const [info, setInfo] = useState(null);
  const [lookup, setLookup] = useState('');
  const [liftWeight, setLiftWeight] = useState('');
  const [liftModelCode, setLiftModelCode] = useState('562');
  const [batteryType, setBatteryType] = useState('10X');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const onFloorInfo = (event) => setInfo({ title: event.detail.title, technical: event.detail.text, pitch: event.detail.pitch });
    window.addEventListener('floor-info', onFloorInfo);
    return () => window.removeEventListener('floor-info', onFloorInfo);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/catalog_data-v2.json').then((response) => {
        if (!response.ok) throw new Error('Catalog unavailable');
        return response.json();
      }),
      fetch('/canada_lineup_research.json').then((response) => {
        if (!response.ok) throw new Error('Research notes unavailable');
        return response.json();
      }),
      fetch('/recliner-catalog-2026.json').then((response) => {
        if (!response.ok) throw new Error('Recliner catalog unavailable');
        return response.json();
      }),
      fetch('/recliner-collection-index-supplement.json').then((response) => {
        if (!response.ok) throw new Error('Recliner index supplement unavailable');
        return response.json();
      }),
      fetch('/motion-catalog-2026.json').then((response) => {
        if (!response.ok) throw new Error('Motion catalog unavailable');
        return response.json();
      }),
      fetch('/designers-choice-catalog-2026.json').then((response) => {
        if (!response.ok) throw new Error('Designer’s Choice catalog unavailable');
        return response.json();
      }),
      fetch('/stationary-catalog-2026.json').then((response) => {
        if (!response.ok) throw new Error('Stationary catalog unavailable');
        return response.json();
      }),
      fetch('/april-2026-model-cover-applications.json').then((response) => {
        if (!response.ok) throw new Error('Model cover applications unavailable');
        return response.json();
      }),
      fetch('/fabric-cover-program-a26.json').then((response) => {
        if (!response.ok) throw new Error('Fabric cover program unavailable');
        return response.json();
      }),
      fetch('/style-index-2026.json').then((response) => {
        if (!response.ok) throw new Error('Style index unavailable');
        return response.json();
      }),
      fetch('/option-codes-rms.json').then((response) => (response.ok ? response.json() : { options: [] })),
    ]).then(([productCatalog, research, reclinerCatalog, reclinerIndexSupplement, motionCatalog, designersChoiceCatalog, stationaryCatalog, coverApplications, fabricCoverProgram, styleIndex, rmsOptionCodes]) => {
      productCatalog.style_index_2026 = styleIndex;
      productCatalog.rms_option_codes = rmsOptionCodes;
      productCatalog.recliner_catalog_2026 = reclinerCatalog;
      productCatalog.recliner_collection_index_supplement = reclinerIndexSupplement;
      productCatalog.motion_catalog_2026 = motionCatalog;
      productCatalog.designers_choice_catalog_2026 = designersChoiceCatalog;
      productCatalog.stationary_catalog_2026 = stationaryCatalog;
      productCatalog.april_2026_model_cover_applications = coverApplications;
      productCatalog.fabric_cover_program_a26 = fabricCoverProgram;
      setCatalog(applyGuideOptionDefinitions(productCatalog));
      setResearchReference(research);
    }).catch(() => setLoadError(true));
  }, []);

  const currentModel = useMemo(() => modelFor(catalog || { models_database: [] }, modelCode), [catalog, modelCode]);
  const currentPrefix = useMemo(() => catalog?.style_prefixes.find((item) => item.code === prefix), [catalog, prefix]);
  const selectedCover = catalog?.cover_cap_codes.find((item) => item.code === cover);
  const sku = useMemo(() => encodeRmsSku({ prefix, modelCode, cover, patternCode, colorFamily: colorShade, finish, trimCode: trimCode === 'NN' ? '' : trimCode, optionCodes: [...optionCodes.filter((code) => !['FP', 'P1', 'FS', 'Z6', 'DC', 'NB', 'NH', 'NS'].includes(code)), ...(cushionCode === 'Standard' ? [] : [cushionCode]), ...(pillowUpgrade ? ['FP'] : []), ...(pillowCover !== cover ? ['P1'] : [])] }), [prefix, modelCode, cover, patternCode, colorShade, finish, trimCode, optionCodes, cushionCode, pillowUpgrade, pillowCover]);
  const recommendations = useMemo(() => catalog ? getRecommendations(catalog, answers, researchReference) : [], [catalog, answers, researchReference]);
  const dimensionRecommendations = useMemo(() => catalog ? getDimensionBasedRecommendations(catalog, answers, researchReference) : [], [catalog, answers, researchReference]);
  const capabilityLeads = useMemo(() => catalog ? getCatalogCapabilityLeads(catalog, answers, 3) : [], [catalog, answers]);
  const fitModelOptions = useMemo(() => catalog ? getContextualModelOptions(catalog, answers) : [], [catalog, answers]);
  const fitModel = fitModelOptions.find((model) => model.code === fitModelCode);
  const fitStyleOptions = fitModel?.styles || [];
  const fitStyle = fitStyleOptions.find((style) => style.code === fitStyleCode);
  const fitStyleOptionRecords = getContextualOptionRecords(catalog || {}, fitStyle?.options || []);
  const fitBatteryOptions = fitModel && fitStyle ? getContextualBatteryOptions(catalog, fitModelCode, fitStyleCode, answers) : [];
  const fitBatteryCode = fitBatteryOptions[0]?.code || '';
  const productCoverOptions = useMemo(() => catalog && fitModelCode && fitStyleCode ? getModelCoverOptions(catalog, fitModelCode) : [], [catalog, fitModelCode, fitStyleCode]);
  const availableCushionPreferences = useMemo(() => catalog ? getContextualPreferenceChoices(catalog, answers, 'cushion', fitModelCode, fitStyleCode) : [], [catalog, answers.category, answers.clearance, answers.mechanism, answers.cushion_preference, fitModelCode, fitStyleCode]);
  const availableSupportPreferences = useMemo(() => catalog ? getContextualPreferenceChoices(catalog, answers, 'support', fitModelCode, fitStyleCode) : [], [catalog, answers.category, answers.clearance, answers.mechanism, answers.support_preference, fitModelCode, fitStyleCode]);
  const availableMaterialPreferences = useMemo(() => getMaterialPreferenceChoices(productCoverOptions), [productCoverOptions]);
  const availableMechanisms = useMemo(() => catalog ? mechanismOptions.filter(([name]) => getContextualModelOptions(catalog, { ...answers, mechanism: name }).length > 0) : [], [catalog, answers]);
  const filteredRecommendations = recommendations.filter((model) => !fitModelCode || model.model_code === fitModelCode);
  const filteredCapabilityLeads = capabilityLeads.filter((model) => !fitModelCode || model.model_code === fitModelCode);
  const currentFitLeads = fitModelCode ? filteredRecommendations : recommendations;
  const currentCapabilityLeads = fitModelCode ? filteredCapabilityLeads : capabilityLeads;
  const currentRecommendationLeads = fitModelCode ? filteredRecommendations : recommendations;
  const currentVisibleCapabilityLeads = fitModelCode ? filteredCapabilityLeads : capabilityLeads;
  const availableModelCovers = filterCoverOptionsByMaterial(productCoverOptions, answers.material_preference);
  const selectedHeightInches = heightInches(answers.height);
  const fitGuide = Number.isFinite(selectedHeightInches) ? researchReference?.fit_guidance_bands?.find((band) => selectedHeightInches >= band.height_min_inches && selectedHeightInches <= (band.height_max_inches ?? Infinity)) : undefined;
  const batteryOption = optionCodes.find((code) => code === 'BP1' || code === 'BP2');
  const batteryWarning = batteryOption && !findCompatibleBattery(catalog || { style_prefixes: [], battery_packs: [] }, prefix, batteryOption) ? `${batteryOption} is not compatible with ${currentPrefix?.motion_type || prefix} per the v2 rules. Check compatibility before adding this option.` : '';

  const fullProductIndex = useMemo(() => catalog ? getGuideProductIndex(catalog) : [], [catalog]);
  const indexedProducts = useMemo(() => {
    const query = indexSearch.trim().toLowerCase();
    return fullProductIndex.filter((product) => (indexGroup === 'All' || indexGroupsFor(product).includes(indexGroup)) && (!query || `${product.modelName} ${product.modelCode} ${product.categories.join(' ')} ${product.sources.join(' ')} ${product.notes.join(' ')} ${product.styles.map((style) => `${style.code} ${style.label} ${style.dimensions || ''} ${style.options.join(' ')} ${style.sourceNote || ''}`).join(' ')}`.toLowerCase().includes(query)));
  }, [fullProductIndex, indexSearch, indexGroup]);

  const searchResults = useMemo(() => {
    if (!catalog || !fabricSearch.trim()) return [];
    const query = fabricSearch.toLowerCase();
    const combined = [
      ...(catalog.search_reference_entries || []).map((item) => ({ kind: `Reference · ${item.section}`, title: item.title, detail: item.detail, code: item.section })),
      ...catalog.style_prefixes.map((item) => ({ kind: 'Style prefix', title: `${item.code} · ${item.motion_type}`, detail: `${item.wall_clearance_inches} in wall clearance · ${item.description}`, code: item.code })),
      ...catalog.models_database.map((item) => ({ kind: 'Model', title: `${item.model_name} · ${item.model_code}`, detail: `${item.scale} · ${item.quick_spotter}`, code: item.model_code })),
      ...(catalog.stationary_catalog_2026?.index || []).map((item) => ({ kind: 'Stationary catalog model', title: `${item.model_name} · ${item.model_code}`, detail: `Summer/Fall 2026 stationary catalog · pages ${item.pages.join(', ')} · ${item.catalog_categories.join(', ')} · indexed styles and cover details in manufacturer catalog.`, code: item.model_code })),
      ...(catalog.stationary_catalog_2026?.products || []).flatMap((product) => product.catalog_groups.flatMap((group) => group.styles.map((style) => ({ kind: 'Stationary catalog style', title: `${product.model_name} ${style.category} · ${style.style_code}`, detail: `${style.dimensions} · Options: ${style.options.join(', ') || 'none listed'}${style.wall_space_required_inches ? ` · wall space ${style.wall_space_required_inches} in` : ''}.`, code: style.style_code, modelCode: product.model_code })))),
      ...(catalog.stationary_catalog_2026?.options || []).map((item) => ({ kind: 'Stationary catalog option', title: `${item.code} · ${item.name}`, detail: item.details, code: item.code })),
      ...(catalog.stationary_catalog_2026?.finishes || []).map((item) => ({ kind: 'Stationary catalog finish', title: `${item.code} · ${item.name}`, detail: item.details, code: item.code })),
      ...(catalog.stationary_catalog_2026?.pillow_styles || []).map((item) => ({ kind: 'Stationary catalog pillow', title: `${item.code} · ${item.name}`, detail: `${item.dimensions} · quantity ${item.quantity} · options ${item.options.join(', ')}`, code: item.code })),
      ...(catalog.stationary_catalog_2026?.stationary_prefix_definitions || []).map((item) => ({ kind: 'Stationary prefix definition', title: `${item.code} · ${item.description}`, detail: `Style prefix definition from the Summer/Fall 2026 stationary catalog.`, code: item.code })),
      ...(catalog.stationary_catalog_2026?.warranty_reference ? [{ kind: 'Stationary warranty reference', title: 'Summer/Fall 2026 warranty coverage', detail: `${catalog.stationary_catalog_2026.warranty_reference.tiers_shown.join(', ')} coverage table; ${catalog.stationary_catalog_2026.warranty_reference.notes.join(' ')}`, code: 'Warranty' }] : []),
      ...reclinerCatalogSearchEntries(catalog.recliner_catalog_2026),
      ...reclinerCatalogSearchEntries(catalog.recliner_collection_index_supplement),
      ...reclinerCatalogSearchEntries(catalog.motion_catalog_2026),
      ...reclinerCatalogSearchEntries(catalog.designers_choice_catalog_2026),
      ...(catalog.product_profiles || []).flatMap((profile) => profile.pieces.map((piece) => ({ kind: 'Product piece', title: `${profile.model_name} ${piece.name} · ${piece.code || piece.variants?.map((variant) => variant.code).join('/') || ''}-${profile.model_code}`, detail: `${profile.product_description} ${piece.dimensions_text || 'Dimensions need visual verification.'} ${piece.fully_extended_in ? `Fully extended: ${piece.fully_extended_in} inches. ` : ''}${piece.dimensions_note || ''}`, code: piece.code || piece.variants?.[0]?.code, modelCode: profile.model_code }))),
      ...(catalog.inventory_model_examples || []).map((item) => ({ kind: 'Inventory example', title: `${item.model_name} · ${item.model_code} · ${item.inventory_prefix}`, detail: `${item.inventory_description} Example RMS SKU(s): ${item.sku_examples.join(' | ')} Fit specs are not provided for this item.`, code: item.model_code, skuExamples: item.sku_examples })),
      ...((researchReference?.entries) || []).map((item) => ({ kind: 'Research note', title: `${item.title} · ${item.section}`, detail: `${item.claim} Not confirmed for Canadian availability or ordering.`, code: (item.codes || []).join(', ') })),
      ...catalog.cover_cap_codes.map((item) => ({ kind: 'Cover', title: `${item.code} · ${item.name}`, detail: `${item.grade} · ${item.type} · ${item.description}`, code: item.code })),
      ...(catalog.fabric_cover_program_a26?.fabrics || []).map((item) => {
        const program = catalog.fabric_cover_program_a26;
        const cleaningName = program.definitions?.cleaningCodes?.[item.cleaningCode] || item.cleaningCode;
        const wearability = program.definitions?.wearability?.[item.wearability];
        const attributes = (item.specialtyAttributes || []).map((code) => program.definitions?.specialtyAttributes?.[code] || code);
        return { kind: 'Fabric program cover', title: `${item.coverCode} · ${item.patternName}`, detail: `Cap ${item.capCode} · colors ${colorList(item)} · ${wearability?.name || item.wearability} wearability${wearability?.description ? ` (${wearability.description})` : ''} · cleaning ${item.cleaningCode} (${cleaningName})${attributes.length ? ` · ${attributes.join(', ')}` : ''} · Confirm it is offered on the exact model first.`, code: item.coverCode };
      }),
      ...(catalog.fabric_cover_program_a26?.leathers || []).map((item) => {
        const program = catalog.fabric_cover_program_a26;
        const attributes = (item.specialtyAttributes || []).map((code) => program.definitions?.specialtyAttributes?.[code] || code);
        const fits = item.models?.length ? ` · models ${item.models.join(', ')}` : '';
        return { kind: 'Leather cover', title: `${item.coverCode} · ${item.patternName}`, detail: `${item.group} · ${item.leatherType} · cap ${item.capCode} · colors ${colorList(item)}${fits}${attributes.length ? ` · ${attributes.join(', ')}` : ''}${item.notes?.length ? ` · ${item.notes.join(' ')}` : ''} · Confirm it is offered on the exact model first.`, code: item.coverCode };
      }),

      ...catalog.option_suffixes.map((item) => ({ kind: 'Option suffix', title: `${item.code} · ${item.name}`, detail: item.description, code: item.code })),
      ...[...new Set(catalog.cover_cap_codes.map((item) => item.grade))].map((grade) => ({ kind: 'Fabric grade', title: `Grade ${grade}`, detail: catalog.cover_cap_codes.filter((item) => item.grade === grade).map((item) => `${item.code} ${item.name}`).join(' · '), code: grade })),
      ...catalog.color_families.map((item) => ({ kind: 'Color family', title: `${item.digit} · ${item.family}`, detail: item.examples, code: item.digit })),
      ...catalog.cleaning_codes.map((item) => ({ kind: 'Cleaning code', title: `${item.code} · ${item.name}`, detail: item.instruction, code: item.code })),
      ...catalog.pillows_and_accents.options.map((item) => ({ kind: 'Pillow option', title: `${item.code} · ${item.name}`, detail: item.description, code: item.code })),
      { kind: 'AudioLuxe', title: `${catalog.audioluxe_sound_system.option_code} · Klipsch AudioLuxe`, detail: `${catalog.audioluxe_sound_system.description} ${catalog.audioluxe_sound_system.features.join(' ')}`, code: catalog.audioluxe_sound_system.option_code },
      ...catalog.wood_finishes.map((item) => ({ kind: 'Wood finish', title: `${item.code} · ${item.name}`, detail: item.description, code: item.code })),
      ...catalog.nailhead_trims.map((item) => ({ kind: 'Nailhead trim', title: `${item.code} · ${item.name}`, detail: item.description, code: item.code })),
      ...catalog.cushion_upgrades.map((item) => ({ kind: 'Cushion core', title: `${item.code} · ${item.name}`, detail: `${item.warranty_years}-year warranty · ${item.description}`, code: item.code })),
      ...catalog.battery_packs.map((item) => ({ kind: 'Battery pack', title: `${item.code} · ${item.batteries} battery`, detail: `Compatible with ${item.compatible_types.join(', ')}. Incompatible with ${item.incompatible_types.join(', ')}. ${item.charge_time_hours} hours to recharge; low-battery alert at ${item.low_battery_alert_percent}%.`, code: item.code })),
    ];
    return combined.filter((item) => `${item.title} ${item.detail} ${item.kind}`.toLowerCase().includes(query)).slice(0, 12);
  }, [catalog, researchReference, fabricSearch]);

  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2200); };
  const setAnswer = (key, value) => setAnswers((prev) => ({ ...prev, [key]: value }));
  const toggleUpgrade = (code) => setAnswers((prev) => ({ ...prev, upgrades: prev.upgrades.includes(code) ? prev.upgrades.filter((item) => item !== code) : [...prev.upgrades, code] }));
  const setLiveOption = (code) => setOptionCodes((prev) => prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]);
  const clearLiveOptions = () => setOptionCodes([]);
  const copySku = async (value = sku) => { try { await navigator.clipboard.writeText(value); setCopied(true); notify('SKU copied to clipboard'); window.setTimeout(() => setCopied(false), 1800); } catch { notify('Clipboard unavailable: select and copy the SKU'); } };
  const addPiece = () => { const piece = sectionalPiecesForFamily(catalog, sectionalFamily).find((item) => item.key === piecePrefix); if (piece) setCart((prev) => [...prev, { ...piece, bodyCover: cover, pillowCover: piecePillowCover, featherlite: pieceFeatherlite, id: `${Date.now()}-${Math.random()}` }]); };
  const removePiece = (id) => setCart((prev) => prev.filter((item) => item.id !== id));
  const fitIndex = (model) => { if (!model) return 'No match for these selections. Adjust the answers or browse the catalog.'; const evidence = model.fit_evidence; const dims = evidence?.dimensions; const fitStatement = evidence?.fit_claim?.statement || evidence?.research_document?.explicit_fit_guidance; const details = [fitStatement, dims?.seat_depth_inches ? `seat depth ${dims.seat_depth_inches}″` : '', dims?.seat_height_inches ? `seat height ${dims.seat_height_inches}″` : '', dims?.source_market && dims?.configuration ? `${dims.source_market} ${dims.configuration} dimensions` : '', Number.isFinite(model.weight_limit_lbs) ? `${model.weight_limit_lbs} lb capacity for indexed configuration` : 'capacity not listed']; const status = evidence?.fit_claim?.status === 'conflicting_fit_guidance' || evidence?.research_document?.fit_status === 'conflicting' ? 'Fit sources conflict; don’t treat this as a match.' : 'Preliminary research lead only.'; const caution = model.fit_guidance?.weight_confirmation_required ? 'No weight capacity indexed for this configuration.' : ''; return `${details.filter(Boolean).join(' · ')}. ${status} ${caution} Confirm exact configuration, weight capacity, clearance, and fit with current Canadian product literature and a sit test.`; };
  const clearFitSelection = () => {
    setFitModelCode('');
    setFitStyleCode('');
    setAnswer('fabric', '');
    setAnswers((previous) => ({ ...previous, upgrades: previous.upgrades.filter((code) => code !== 'BP1' && code !== 'BP2') }));
  };
  const changeFitPreference = (key, value) => {
    if (answers[key] === value) return;
    setAnswer(key, value);
    clearFitSelection();
  };
  const changeFitModel = (value) => {
    setFitModelCode(value);
    setFitStyleCode('');
    setAnswer('fabric', '');
    setAnswers((previous) => ({ ...previous, upgrades: previous.upgrades.filter((code) => code !== 'BP1' && code !== 'BP2') }));
  };
  const changeFitStyle = (value) => {
    setFitStyleCode(value);
    setAnswer('fabric', '');
    setAnswers((previous) => ({ ...previous, upgrades: previous.upgrades.filter((code) => code !== 'BP1' && code !== 'BP2') }));
  };
  useEffect(() => {
    if (!catalog) return;
    const modelStillEligible = fitModelOptions.some((model) => model.code === fitModelCode);
    const styleStillEligible = fitStyleOptions.some((style) => style.code === fitStyleCode);
    if (!availableCushionPreferences.some((item) => item.name === answers.cushion_preference) && answers.cushion_preference !== 'Standard Poly') setAnswer('cushion_preference', 'Standard Poly');
    if (!availableSupportPreferences.some((item) => item.value === answers.support_preference) && answers.support_preference !== 'No preference yet') setAnswer('support_preference', 'No preference yet');
    if (fitModelCode && fitStyleCode && !availableMaterialPreferences.some((item) => item.value === answers.material_preference) && answers.material_preference !== 'No preference yet') setAnswer('material_preference', 'No preference yet');
    if (fitModelCode && !modelStillEligible) {
      setFitModelCode('');
      setFitStyleCode('');
      setAnswer('fabric', '');
      setAnswers((previous) => ({ ...previous, upgrades: previous.upgrades.filter((code) => code !== 'BP1' && code !== 'BP2') }));
    } else if (fitModelCode && fitStyleCode && !styleStillEligible) {
      setFitStyleCode('');
      setAnswer('fabric', '');
      setAnswers((previous) => ({ ...previous, upgrades: previous.upgrades.filter((code) => code !== 'BP1' && code !== 'BP2') }));
    }
  }, [catalog, answers.category, answers.clearance, answers.mechanism, answers.support_preference, answers.cushion_preference, answers.weight, fitModelCode, fitStyleCode, fitModelOptions, fitStyleOptions, answers.material_preference, answers.fabric, availableCushionPreferences, availableSupportPreferences, availableMaterialPreferences]);
  useEffect(() => {
    if (!answers.upgrades.some((code) => code === 'BP1' || code === 'BP2')) return;
    const selectedBattery = answers.upgrades.find((code) => code === 'BP1' || code === 'BP2');
    if (!fitBatteryCode || selectedBattery !== fitBatteryCode) {
      setAnswers((previous) => ({ ...previous, upgrades: previous.upgrades.filter((code) => code !== 'BP1' && code !== 'BP2') }));
    }
  }, [answers.upgrades, fitBatteryCode]);
  useEffect(() => {
    if (fitModelCode && answers.fabric && !availableModelCovers.some((item) => item.code === answers.fabric)) setAnswer('fabric', '');
  }, [fitModelCode, answers.fabric, answers.material_preference, availableModelCovers]);
  const availablePrefixes = useMemo(() => modelPrefixOptions(catalog || { models_database: [], style_prefixes: [] }, modelCode), [catalog, modelCode]);
  // Single authority for `prefix`: keep the current code while it still satisfies either
  // the answer-eligible family or the selected model's family; otherwise converge to a
  // code that satisfies both, then the first answer-eligible code, then the first
  // model-family code. Reconciling in one effect prevents the two former setters from
  // fighting each other in an infinite state-update loop.
  useEffect(() => {
    if (!catalog) return;
    const answerEligible = matchingPrefixes(catalog, answers);
    const satisfiesAnswers = answerEligible.some((item) => item.code === prefix);
    const satisfiesModel = availablePrefixes.some((item) => item.code === prefix);
    if (satisfiesAnswers || satisfiesModel) return;
    const both = answerEligible.find((item) => availablePrefixes.some((modelItem) => modelItem.code === item.code));
    if (both) return setPrefix(both.code);
    if (answerEligible.length) return setPrefix(answerEligible[0].code);
    if (availablePrefixes.length) return setPrefix(availablePrefixes[0].code);
  }, [catalog, answers.category, answers.clearance, answers.mechanism, answers.support_preference, answers.cushion_preference, answers.weight, answers.fabric, answers.material_preference, fitModelCode, fitStyleCode, prefix, availablePrefixes]);
  const recommendationCover = productCoverOptions.find((item) => item.code === answers.fabric);
  const matchedPrefixForBattery = catalog?.style_prefixes.find((item) => item.code === batteryType);
  const batteryCompatibility = matchedPrefixForBattery?.battery_pack === 'INCOMPATIBLE' ? `${batteryType} luxury lift chair is incompatible with battery packs` : matchedPrefixForBattery?.battery_pack ? `${matchedPrefixForBattery.battery_pack} compatible · ${matchedPrefixForBattery.motion_type}` : 'No battery pack required for this manual configuration';
  const weightResult = findLiftTier(catalog || { lift_chair_weight_tiers: [] }, liftWeight, liftModelCode);
  const warranty = catalog?.warranty_rules;
  const floorModelRecord = catalog?.models_database.find((item) => item.model_code === floorModel);
  const floorPrefix = catalog?.style_prefixes.find((item) => item.code === floorModelRecord?.prefix);
  const floorWarranty = `${catalog?.warranty_matrix?.['3_Year']} ${catalog?.warranty_matrix?.['1_Year']}`;

  if (loadError) return <main className="load-error"><h1>Catalog could not be loaded</h1><p>Refresh the page to retry the local catalog.</p></main>;
  if (!catalog) return <main className="loading"><img className="brand-mark" src="/lazboy-logo.png" alt="La-Z-Boy" /><p>Opening the floor guide…</p></main>;

  const showInfo = (title, technical, pitch) => setInfo({ title, technical, pitch });
  const optionInfo = (option) => showInfo(option.name, option.description, `“${option.name} is a thoughtful detail designed to make everyday comfort feel a little more personal.”`);
  const updateModel = (code, group) => { setModelCode(code); setPrefix(group || (catalog ? getDefaultRmsGroup(catalog, code) : '')); setTrimCode('NN'); setCushionCode('Standard'); clearLiveOptions(); setFinish(''); };

  return <div className={customerMode ? 'app customer-mode' : 'app'}>
    <aside className="rail">
      <img className="rail-logo" src="/lazboy-logo.png" alt="La-Z-Boy" />
      <div className="rail-divider" />
      {NAV_ITEMS.map(([Icon, label]) => <button key={label} className={`rail-link ${activeTab === label ? 'active' : ''}`} onClick={() => setActiveTab(label)} title={label} aria-label={label} aria-current={activeTab === label ? 'page' : undefined}><Icon size={19} /><span>{label}</span></button>)}
      <div className="rail-bottom"><span className="online-dot" /><small>LOCAL<br />CATALOG</small></div>
    </aside>

    <header className="topbar">
      <div className="mobile-brand"><img className="brand-mark-small" src="/lazboy-logo.png" alt="La-Z-Boy" /><span>Floor Assistant</span></div>
      <div className="breadcrumbs"><span>Sales floor</span><span className="crumb-slash">/</span><strong>{activeTab === 'Fit' ? 'Fit & discover' : activeTab}</strong></div>
      <div className="top-actions"><span className="catalog-status"><i /> Ready</span><button className={`mode-toggle ${customerMode ? 'is-on' : ''}`} onClick={() => setCustomerMode((value) => !value)}><span className="mode-dot" />{customerMode ? 'Customer mode' : 'Rep view'}</button><button className="avatar" aria-label="Sales associate profile">JD</button></div>
    </header>

    <main className="main-content">
      {activeTab === 'SKU Builder' && <SkuBuilderWorkspace catalog={catalog} modelCode={modelCode} setModelCode={updateModel} prefix={prefix} setPrefix={setPrefix} cover={cover} setCover={setCover} patternCode={patternCode} setPatternCode={setPatternCode} colorShade={colorShade} setColorShade={setColorShade} finish={finish} setFinish={setFinish} trimCode={trimCode} setTrimCode={setTrimCode} cushionCode={cushionCode} setCushionCode={setCushionCode} optionCodes={optionCodes} setLiveOption={setLiveOption} clearLiveOptions={clearLiveOptions} batteryWarning={batteryWarning} onCopy={copySku} notify={notify} />}
      {activeTab === 'Product Index' && <section className="module-page product-index-page"><div className="module-intro"><p className="eyebrow"><BookOpen size={13} /> CATALOG PRODUCT INDEX</p><h1>Every indexed model, <em>in one place.</em></h1><p>Every model with its styles and pieces. Open a model to see sizes and options.</p></div><div className="knowledge-search card"><Search size={19} /><input aria-label="Search product index" placeholder="Search a model, style, piece or option" value={indexSearch} onChange={(event) => setIndexSearch(event.target.value)} /><span className="product-index-count">{indexedProducts.length} models</span></div><div className="chip-row" role="group" aria-label="Filter by type">{PRODUCT_INDEX_GROUPS.map((group) => <button key={group} type="button" className={`chip ${indexGroup === group ? 'on' : ''}`} aria-pressed={indexGroup === group} onClick={() => setIndexGroup(group)}>{group}</button>)}</div><div className="product-index-list">{indexedProducts.map((product) => <details className="product-index-entry card" key={product.modelCode}><summary><span><strong>{product.modelName}</strong><small>{product.modelCode}{cleanIndexCategories(product.categories).length ? ` · ${cleanIndexCategories(product.categories).slice(0, 3).join(' · ')}` : ''}</small></span>{product.unverified && <span className="product-index-style-count">not in guide</span>}<span className="product-index-style-count">{product.styles.length} {product.styles.length === 1 ? 'style' : 'styles'}</span></summary><div className="product-index-detail"><p>{product.notes.join(' ')}</p><div className="product-index-styles">{product.styles.map((style) => <article key={`${style.code}-${style.source}`}><strong>{style.code} · {style.label}</strong>{style.dimensions && <span>{style.dimensions}</span>}{style.caps?.length > 0 && <span>Covers: {style.caps.join(' · ')}</span>}{style.finishes?.length > 0 && <span>Finishes: {style.finishes.join(', ')}</span>}{style.options.length > 0 && <span>Options: {style.options.join(', ')}</span>}{style.sourceNote && <small>{style.sourceNote}</small>}</article>)}</div></div></details>)}{!indexedProducts.length && <p className="empty-state">No catalog product matches that search.</p>}</div></section>}
      {activeTab === 'Floor Unit' && <CustomizeFloorUnit key={floorWorkspaceModel} catalog={catalog} onCopy={copySku} initialModelCode={floorWorkspaceModel} onModelChange={setFloorWorkspaceModel} />}
      {activeTab === 'Sectional Studio' && <SectionalDesignStudio catalog={catalog} onCopy={copySku} initialModelCode={buildModelCode} onModelChange={setBuildModelCode} />}
      {activeTab === 'Fit' && <FitDiscover catalog={catalog} research={researchReference} state={fitState} setState={setFitState} onInfo={showInfo} onOpenTab={setActiveTab} onIndex={(name) => { setIndexSearch(name); setIndexGroup('All'); setActiveTab('Product Index'); }} onBuild={(code) => { updateModel(code); setActiveTab('SKU Builder'); }} />}

      {activeTab === 'LegacySectional' && <section className="module-page" hidden><div className="module-intro"><p className="eyebrow"><Layers3 size={13} /> MODULAR CONFIGURATOR</p><h1>Build a sectional, <em>piece by piece.</em></h1><p>Bring the room together with a configuration that works for their space and the way they live.</p></div><div className="sectional-layout"><section className="sectional-builder card"><div className="module-head"><span className="module-icon"><Layers3 size={19} /></span><div><h2>Choose a modular piece</h2><p>Choose a family to see its compatible modular pieces.</p></div></div><div className="system-tabs">{['La-Z-Time','La-Z-Motion','Stationary'].map((family) => <button key={family} className={sectionalFamily === family ? 'active' : ''} onClick={() => { setSectionalFamily(family); const nextPiece = catalog.sectional_modular_pieces.find((piece) => getSectionalPrefix(piece, family)); if (nextPiece) setPiecePrefix(nextPiece.prefix); }}>{family}</button>)}</div><div className="tip-strip sectional-tip"><Info size={15} /><span>Only prefixes supported by the selected family are shown; multi-prefix pieces use the matching family code.</span></div><label className="field-label">Piece type</label><div className="piece-grid">{catalog.sectional_modular_pieces.filter((piece) => getSectionalPrefix(piece, sectionalFamily)).map((piece) => <button key={piece.prefix} className={`piece-option ${piecePrefix === piece.prefix ? 'selected' : ''}`} onClick={() => setPiecePrefix(piece.prefix)}><span className="piece-sketch"><Armchair size={21} strokeWidth={1.4} /></span><span><strong>{piece.name}</strong><small>{piece.type}</small></span><span className="piece-prefix">{piece.prefix}</span><span className="mini-info" role="button" tabIndex="0" onClick={(event) => { event.stopPropagation(); showInfo(piece.name, `${piece.type}. Prefix options: ${piece.prefix}. Confirm this piece is compatible with the chosen sectional family.`, `“This ${piece.name.toLowerCase()} gives us another way to shape the seating around your room.”`); }} onKeyDown={(event) => event.key === 'Enter' && showInfo(piece.name, `${piece.type}. Prefix options: ${piece.prefix}. Confirm this piece is compatible with the chosen sectional family.`, `“This ${piece.name.toLowerCase()} gives us another way to shape the seating around your room.”`)} aria-label={`Info about ${piece.name}`}><Info size={12} /></span></button>)}</div><button className="primary-button add-piece" onClick={addPiece}><Plus size={16} /> Add piece to configuration</button></section><section className="cart-panel card"><div className="cart-head"><div><p className="eyebrow">YOUR CONFIGURATION</p><h2>Sectional cart</h2></div><span className="cart-count">{cart.length} {cart.length === 1 ? 'piece' : 'pieces'}</span></div>{cart.length ? <><div className="cart-list">{cart.map((piece, index) => <div className="cart-row" key={piece.id}><span className="cart-index">{String(index + 1).padStart(2, '0')}</span><span className="cart-item-info"><strong>{piece.name}</strong><small>{piece.type} · {piece.prefix}</small></span><button onClick={() => removePiece(piece.id)} aria-label={`Remove ${piece.name}`}><Minus size={15} /></button></div>)}</div><div className="cart-package"><span>PACKAGE PIECE SKUS</span><code>{cart.map((piece) => encodeRmsSku({ prefix: getSectionalPrefix(piece, piece.family), modelCode: piece.family === 'La-Z-Motion' ? '811' : modelCode, cover, finish })).join('  ·  ')}</code><button className="copy-button" onClick={() => copySku(cart.map((piece, index) => `${encodeRmsSku({ prefix: getSectionalPrefix(piece, piece.family), modelCode: piece.family === 'La-Z-Motion' ? '811' : modelCode, cover, finish })}${index < cart.length - 1 ? '\n' : ''}`).join(''))}><Copy size={15} /> Copy piece list</button></div></> : <div className="cart-empty"><span><Layers3 size={30} /></span><h3>Start with an end piece</h3><p>Add modular pieces to see your package list and individual SKUs here.</p></div>}<div className="cart-help"><Info size={14} /> Confirm piece compatibility and final codes in your current ordering system.</div></section></div></section>}

      {activeTab === 'Fabrics & Care' && <FabricsCareWorkspace catalog={catalog} />}

      {activeTab === 'Support' && <section className="module-page support-reference"><div className="module-intro"><p className="eyebrow"><ShieldCheck size={13} /> SUPPORT & QUICK REFERENCE</p><h1>Care, capacity, <em>confidence.</em></h1><p>Helpful reference points for clear conversations and more confident recommendations.</p></div><div className="support-grid"><section className="support-card card"><div className="module-head"><span className="module-icon"><ShieldCheck size={19} /></span><div><h2>Warranty at a glance</h2><p>Coverage varies by component and product.</p></div></div><div className="warranty-row"><span className="warranty-term">Limited lifetime</span><div><strong>Frame &amp; springs</strong><small>{warranty?.lifetime_coverage}</small></div><button onClick={() => showInfo('Limited lifetime coverage', warranty?.lifetime_coverage, '“The frame and springs are built to support everyday comfort for years to come.”')} aria-label="Lifetime warranty details"><Info size={15} /></button></div><div className="warranty-row"><span className="warranty-term">3 years</span><div><strong>Electrical components</strong><small>{warranty?.three_year_coverage}</small></div><button onClick={() => showInfo('Electrical component coverage', warranty?.three_year_coverage, '“Power components include limited coverage for added peace of mind.”')} aria-label="Electrical coverage details"><Info size={15} /></button></div><div className="warranty-row"><span className="warranty-term">1 year*</span><div><strong>Cover &amp; cushion foam</strong><small>{warranty?.one_year_coverage}</small></div><button onClick={() => showInfo('Cover and cushion coverage', warranty?.one_year_coverage, '“We can go over the current warranty details for the exact cover you choose.”')} aria-label="Cover warranty details"><Info size={15} /></button></div><p className="fine-print">* Cushion upgrade options may include longer foam coverage. Verify current written warranty terms.</p></section><section className="support-card card"><div className="module-head"><span className="module-icon"><Activity size={19} /></span><div><h2>Lift chair weight tiers</h2><p>Find an appropriate model rating.</p></div></div><label className="form-field"><span>Guest’s weight (lbs)</span><input type="number" placeholder="Enter weight" value={liftWeight} onChange={(event) => setLiftWeight(event.target.value)} min="1" /></label><label className="form-field"><span>Lift chair model</span><select value={liftModelCode} onChange={(event) => setLiftModelCode(event.target.value)}>{catalog.lift_chair_weight_tiers.map((item) => <option key={item.model_code} value={item.model_code}>{item.model} · {item.limit_lbs} lbs</option>)}</select></label>{weightResult ? <div className="lookup-result good"><CheckCircle2 size={17} /><p><strong>{weightResult.model} · {weightResult.limit_lbs} lb capacity</strong><small>Based on the entered weight of {liftWeight} lbs. Confirm the model’s current specifications.</small></p></div> : liftWeight ? <div className="lookup-result warning"><Info size={17} /><p><strong>{Number(liftWeight) > (catalog.lift_chair_weight_tiers.find((item) => item.model_code === liftModelCode)?.limit_lbs || 0) ? 'This model is not rated for the entered weight.' : 'Enter a valid weight to check this model.'}</strong><small>Pause and verify model suitability with current product information.</small></p></div> : <div className="tier-list">{catalog.lift_chair_weight_tiers.map((item) => <div key={item.model_code}><span>{item.model}</span><strong>{item.limit_lbs}<small> lbs</small></strong></div>)}</div>}</section><section className="support-card card battery-card"><div className="module-head"><span className="module-icon"><BatteryCharging size={19} /></span><div><h2>Battery compatibility</h2><p>Always check before adding a pack.</p></div></div><label className="form-field"><span>Style or power group</span><select value={batteryType} onChange={(event) => setBatteryType(event.target.value)}>{catalog.style_prefixes.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.motion_type}</option>)}</select></label><div className={`battery-result ${batteryType === '1HM' ? 'warning' : matchedPrefixForBattery?.power_compatible ? 'good' : ''}`}><span className="battery-result-icon">{batteryType === '1HM' ? <Info size={17} /> : <BatteryCharging size={18} />}</span><div><strong>{batteryCompatibility}</strong><small>BP1: 1 battery · BP2: 2 batteries · 5–7 hrs to recharge · alert at 30%</small></div></div><div className="alert-note"><ShieldCheck size={15} /> Never add a battery pack to a luxury lift chair or console power bundle.</div></section></div></section>}
      <footer className="footer"><span>Made for the moments that matter.</span><span>Floor Assistant <b>·</b> Reference guide</span></footer>
    </main>

    <nav className="mobile-tabbar" aria-label="Main navigation">
      {NAV_ITEMS.slice(0, 3).map(([Icon, label]) => <button key={label} className={`mobile-tab ${activeTab === label ? 'active' : ''}`} onClick={() => { setActiveTab(label); setMobileToolsOpen(false); }} aria-current={activeTab === label ? 'page' : undefined}><Icon size={20} /><span>{label === 'Product Index' ? 'Products' : label}</span></button>)}
      <button className={`mobile-tab ${mobileToolsOpen || NAV_ITEMS.slice(3).some(([, label]) => activeTab === label) ? 'active' : ''}`} onClick={() => setMobileToolsOpen((open) => !open)} aria-expanded={mobileToolsOpen} aria-controls="mobile-tools-sheet"><Menu size={20} /><span>All tools</span></button>
    </nav>
    {mobileToolsOpen && <div className="mobile-tools-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setMobileToolsOpen(false)}><section id="mobile-tools-sheet" className="mobile-tools-sheet" role="region" aria-labelledby="mobile-tools-title"><div className="mobile-tools-heading"><div><p className="eyebrow">FLOOR ASSISTANT</p><h2 id="mobile-tools-title">All tools</h2></div><button type="button" className="mobile-tools-close" onClick={() => setMobileToolsOpen(false)} aria-label="Close all tools"><X size={20} /></button></div><div className="mobile-tools-grid">{NAV_ITEMS.slice(3).map(([Icon, label]) => <button type="button" key={label} className={`mobile-tool ${activeTab === label ? 'active' : ''}`} onClick={() => { setActiveTab(label); setMobileToolsOpen(false); }}><Icon size={21} /><span>{label}</span><ArrowRight size={16} /></button>)}</div></section></div>}

    {info && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setInfo(null)}><section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="info-title"><button className="modal-close" onClick={() => setInfo(null)} aria-label="Close information"><X size={19} /></button><span className="modal-symbol"><Info size={20} /></span><p className="eyebrow">OPTION DETAILS</p><h2 id="info-title">{info.title}</h2><div className="modal-section"><span>TECHNICAL SPEC</span><p>{info.technical}</p></div><div className="customer-pitch"><span>CUSTOMER PITCH</span><p>{info.pitch}</p></div><button className="primary-button modal-done" onClick={() => setInfo(null)}>Got it <Check size={15} /></button></section></div>}
    {toast && <div className="toast"><CheckCircle2 size={16} />{toast}</div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
