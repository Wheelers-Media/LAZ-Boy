import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowRight, Armchair, BatteryCharging, BookOpen, Check, CheckCircle2, Info, Layers3, Menu, Search, ShieldCheck, Sparkles, SwatchBook, Wrench, X } from 'lucide-react';
import './styles.css';
import './brand.css';
import { buildSitEntry, encodeRmsSku, findLiftTier, findCompatibleBattery, getDefaultRmsGroup } from './logic.js';
import { CustomizeFloorUnit } from './FloorWorkspaces.jsx';
import { SectionalDesignStudio } from './SectionalDesignStudio.jsx';
import { SkuBuilderWorkspace } from './SkuBuilderWorkspace.jsx';
import { FabricsCareWorkspace } from './FabricsCareWorkspace.jsx';
import { FIT_DEFAULTS, FitDiscover } from './FitDiscover.jsx';
import { applyGuideOptionDefinitions, getGuideProductIndex, groupModelsBySection, PRODUCT_INDEX_GROUPS, cleanIndexCategories, indexGroupsFor } from './logic.js';

const NAV_ITEMS = [[Armchair, 'Fit'], [Wrench, 'SKU Builder'], [BookOpen, 'Product Index'], [Sparkles, 'Floor Unit'], [Layers3, 'Sectional Studio'], [SwatchBook, 'Fabrics & Care'], [ShieldCheck, 'Support']];
const modelFor = (catalog, code) => catalog.models_database.find((model) => model.model_code === code);
function App() {
  const [catalog, setCatalog] = useState(null);
  const [researchReference, setResearchReference] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [fitState, setFitState] = useState(FIT_DEFAULTS);
  const [modelCode, setModelCode] = useState('724');
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
  const [activeTab, setActiveTab] = useState('Fit');
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [buildModelCode, setBuildModelCode] = useState('724');
  const [floorWorkspaceModel, setFloorWorkspaceModel] = useState('724');
  const [indexSearch, setIndexSearch] = useState('');
  const [indexGroup, setIndexGroup] = useState('All');
  const [info, setInfo] = useState(null);
  const [lookup, setLookup] = useState('');
  const [liftWeight, setLiftWeight] = useState('');
  const [liftModelCode, setLiftModelCode] = useState('562');
  const [batteryType, setBatteryType] = useState('10X');
  const [toast, setToast] = useState('');
  const [sitLog, setSitLog] = useState(() => { try { const saved = JSON.parse(window.localStorage.getItem('sit-log') || '[]'); return Array.isArray(saved) ? saved : []; } catch { return []; } });

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
  const batteryOption = optionCodes.find((code) => code === 'BP1' || code === 'BP2');
  const batteryWarning = batteryOption && !findCompatibleBattery(catalog || { style_prefixes: [], battery_packs: [] }, prefix, batteryOption) ? `${batteryOption} is not compatible with ${currentPrefix?.motion_type || prefix} per the v2 rules. Check compatibility before adding this option.` : '';

  const fullProductIndex = useMemo(() => catalog ? getGuideProductIndex(catalog) : [], [catalog]);
  const indexedProducts = useMemo(() => {
    const query = indexSearch.trim().toLowerCase();
    return fullProductIndex.filter((product) => (indexGroup === 'All' || indexGroupsFor(product).includes(indexGroup)) && (!query || `${product.modelName} ${product.modelCode} ${product.categories.join(' ')} ${product.sources.join(' ')} ${product.notes.join(' ')} ${product.styles.map((style) => `${style.code} ${style.label} ${style.dimensions || ''} ${style.options.join(' ')} ${style.sourceNote || ''}`).join(' ')}`.toLowerCase().includes(query)));
  }, [fullProductIndex, indexSearch, indexGroup]);
  const sections = useMemo(() => groupModelsBySection(catalog || {}, indexedProducts, (item) => item.modelName, (item) => item.modelCode, (item) => item.categories?.[0]), [catalog, indexedProducts]);


  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2200); };
  const setLiveOption = (code) => setOptionCodes((prev) => prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]);
  const clearLiveOptions = () => setOptionCodes([]);
  const copySku = async (value = sku) => { try { await navigator.clipboard.writeText(value); setCopied(true); notify('SKU copied to clipboard'); window.setTimeout(() => setCopied(false), 1800); } catch { notify('Clipboard unavailable: select and copy the SKU'); } };
  const logSit = (details) => {
    const entry = buildSitEntry(details);
    if (!entry) return;
    setSitLog((previous) => { const next = [...previous, entry]; try { window.localStorage.setItem('sit-log', JSON.stringify(next)); } catch { /* storage blocked: the log lasts until the page closes */ } return next; });
    notify(`${entry.modelName || entry.modelCode} sit test saved`);
  };
  const copyNote = async (text, label) => { try { await navigator.clipboard.writeText(text); notify(`${label} copied`); } catch { notify('Clipboard unavailable: select the note and copy it'); } };
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

  return <div className="app">
    <aside className="rail">
      <img className="rail-logo" src="/lazboy-logo.png" alt="La-Z-Boy" />
      <div className="rail-divider" />
      {NAV_ITEMS.map(([Icon, label]) => <button key={label} className={`rail-link ${activeTab === label ? 'active' : ''}`} onClick={() => setActiveTab(label)} title={label} aria-label={label} aria-current={activeTab === label ? 'page' : undefined}><Icon size={19} /><span>{label}</span></button>)}
    </aside>

    <header className="topbar">
      <div className="mobile-brand"><img className="brand-mark-small" src="/lazboy-logo.png" alt="La-Z-Boy" /><span>Floor Assistant</span></div>
      <div className="breadcrumbs"><span>Sales floor</span><span className="crumb-slash">/</span><strong>{activeTab === 'Fit' ? 'Fit & discover' : activeTab}</strong></div>
    </header>

    <main className="main-content">
      {activeTab === 'SKU Builder' && <SkuBuilderWorkspace catalog={catalog} modelCode={modelCode} setModelCode={updateModel} prefix={prefix} setPrefix={setPrefix} cover={cover} setCover={setCover} patternCode={patternCode} setPatternCode={setPatternCode} colorShade={colorShade} setColorShade={setColorShade} finish={finish} setFinish={setFinish} trimCode={trimCode} setTrimCode={setTrimCode} cushionCode={cushionCode} setCushionCode={setCushionCode} optionCodes={optionCodes} setLiveOption={setLiveOption} clearLiveOptions={clearLiveOptions} batteryWarning={batteryWarning} onCopy={copySku} notify={notify} />}
      {activeTab === 'Product Index' && <section className="module-page product-index-page"><div className="module-intro"><p className="eyebrow"><BookOpen size={13} /> CATALOG PRODUCT INDEX</p><h1>Every indexed model, <em>in one place.</em></h1><p>Every model with its styles and pieces. Open a model to see sizes and options.</p></div><div className="knowledge-search card"><Search size={19} /><input aria-label="Search product index" placeholder="Search model, style or option" value={indexSearch} onChange={(event) => setIndexSearch(event.target.value)} /><span className="product-index-count">{indexedProducts.length} models</span></div><div className="product-index-list">{sections.length > 1 && <nav className="index-jump" aria-label="Jump to section">{sections.map((section) => <a key={section.name} href={`#index-${section.name.replace(/\W+/g, '-')}`}>{section.name} <b>{section.items.length}</b></a>)}</nav>}{sections.map((section) => <section key={section.name} id={`index-${section.name.replace(/\W+/g, '-')}`} className="index-section"><h2 className="index-section-head">{section.name}<span>{section.items.length} {section.items.length === 1 ? 'model' : 'models'}</span></h2>{section.items.map((product) => <details className="product-index-entry card" key={product.modelCode}><summary><span><strong>{product.modelName}</strong><small>Model {product.modelCode}</small></span>{product.unverified && <span className="product-index-style-count">not in guide</span>}<span className="product-index-style-count">{product.styles.length} {product.styles.length === 1 ? 'style' : 'styles'}</span></summary><div className="product-index-detail"><p>{product.notes.join(' ')}</p><div className="product-index-actions"><button type="button" className="back-button" onClick={() => { updateModel(product.modelCode); setActiveTab('SKU Builder'); }}>Build a SKU</button>{catalog.product_profiles?.some((profile) => String(profile.model_code) === String(product.modelCode) && profile.pieces?.length) && <button type="button" className="back-button" onClick={() => { setBuildModelCode(String(product.modelCode)); setActiveTab('Sectional Studio'); }}>Design as a sectional</button>}</div><div className="product-index-styles">{product.styles.map((style) => <article key={`${style.code}-${style.source}`}><strong>{style.code} · {style.label}</strong>{style.dimensions && <span>{style.dimensions}</span>}{style.caps?.length > 0 && <span>Covers: {style.caps.join(' · ')}</span>}{style.finishes?.length > 0 && <span>Finishes: {style.finishes.join(', ')}</span>}{(style.select || []).map((line) => <span key={line}>{line}</span>)}{style.options.length > 0 && <span>Options: {style.options.join(', ')}</span>}{style.sourceNote && <small>{style.sourceNote}</small>}</article>)}</div></div></details>)}</section>)}{!indexedProducts.length && <p className="empty-state">No catalog product matches that search.</p>}</div></section>}
      {activeTab === 'Floor Unit' && <CustomizeFloorUnit key={floorWorkspaceModel} catalog={catalog} onCopy={copySku} initialModelCode={floorWorkspaceModel} onModelChange={setFloorWorkspaceModel} />}
      {activeTab === 'Sectional Studio' && <SectionalDesignStudio catalog={catalog} onCopy={copySku} initialModelCode={buildModelCode} onModelChange={setBuildModelCode} />}
      {activeTab === 'Fit' && <FitDiscover catalog={catalog} research={researchReference} state={fitState} setState={setFitState} onInfo={showInfo} onCopyText={copyNote} sitLog={sitLog} onLogSit={logSit} onOpenTab={setActiveTab} onSectional={(code) => { setBuildModelCode(code); setActiveTab('Sectional Studio'); }} onIndex={(name) => { setIndexSearch(name); setIndexGroup('All'); setActiveTab('Product Index'); }} onBuild={(code) => { updateModel(code); setActiveTab('SKU Builder'); }} />}


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
