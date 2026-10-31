import { getSectionalPieceOptions, sectionalPieceCodes } from './sectional.js';

export const RMS_CATALOGS = ['stationary_catalog_2026', 'motion_catalog_2026', 'designers_choice_catalog_2026', 'recliner_catalog_2026'];

const splitRmsCodes = (value = '') => String(value).split('/').map((part) => part.trim()).filter(Boolean);

/**
 * Option-code names and descriptions from the April 2026 guide win over the older catalog entries
 * (the older file had FS as a swivel base and Z6/SL as other things). Codes the guide does not define are kept as they were.
 */
export function applyGuideOptionDefinitions(catalog) {
  const defs = new Map((catalog?.style_index_2026?.styles || []).filter((row) => row.kind === 'reference').map((row) => [row.styleNumber, { name: row.name.replace(/\s*\(Feature\)\s*$/, ''), description: row.special || '', standardFeature: row.model === 'FEATURES (STANDARD)' }]));
  const merged = new Map((catalog.option_suffixes || []).map((item) => [item.code, item]));
  defs.forEach((def, code) => merged.set(code, { ...(merged.get(code) || {}), code, ...def }));
  const rename = (list) => (list || []).map((item) => (defs.has(item.code) ? { ...item, name: defs.get(item.code).name, description: defs.get(item.code).description || item.description } : item));
  // Options the RMS custom-order screen shows that the guide's option list does not name (C1, F1, WL, Z4). The guide's wording wins where both define a code.
  for (const item of catalog?.rms_option_codes?.options || []) merged.set(item.code, { ...item, ...(merged.get(item.code) || {}), entry: item.entry });
  return { ...catalog, option_suffixes: [...merged.values()], cushion_upgrades: rename(catalog.cushion_upgrades), nailhead_trims: rename(catalog.nailhead_trims) };
}

const guideDims = (dims) => (dims?.height && dims?.width && dims?.depth ? `${dims.height} H × ${dims.width} W × ${dims.depth} D in` : '');

/**
 * Product Index entries rebuilt from the guide: for every model the guide lists, its styles are exactly the guide's rows
 * (cap codes, finishes, options, dimensions). Models the guide does not list keep their old entries, marked unverified.
 */
export function getGuideProductIndex(catalog) {
  const old = getFullProductIndex(catalog);
  const rows = (catalog?.style_index_2026?.styles || []).filter((row) => row.kind === 'style');
  const byModel = new Map();
  rows.forEach((row) => byModel.set(row.model, [...(byModel.get(row.model) || []), row]));
  const result = [];
  const seen = new Set();
  for (const [model, list] of byModel) {
    seen.add(model);
    const previous = old.find((item) => item.modelCode === model);
    const name = list.find((row) => row.name)?.name;
    result.push({
      modelCode: model, modelName: previous?.modelName && previous.modelName !== model ? previous.modelName : name ? name.charAt(0) + name.slice(1).toLowerCase() : model,
      categories: previous?.categories || [], sources: [], notes: [],
      styles: list.map((row) => ({ code: row.prefix, label: `${row.category || row.name}${row.status === 'discontinued' ? ' · discontinued' : row.status === 'new' ? ' · new' : ''}`, dimensions: guideDims(row.dims), options: row.options, caps: row.capCodes, finishes: [row.standardFinish && `${row.standardFinish.name} ${row.standardFinish.code} (standard)`, ...row.optionalFinishes.map((f) => `${f.name} ${f.code}`)].filter(Boolean), status: row.status, select: formatSelectCovers(row.select), source: 'guide' })),
    });
  }
  for (const item of old) if (!seen.has(item.modelCode)) result.push({ ...item, unverified: true, notes: ['Not in the April 2026 guide. Nothing here is verified.', ...(item.notes || [])] });
  return result.sort((a, b) => a.modelName.localeCompare(b.modelName));
}

/** True when the April 2026 guide is loaded but does not list this model. Nothing about its covers, finishes or options is documented. */
export function isUnlistedModel(catalog, modelCode) {
  return Boolean(catalog?.style_index_2026?.styles?.length) && !getGuideStyleRows(catalog, modelCode).length;
}

/** April 2026 Product Information Guide rows (public/style-index-2026.json) for one model. Empty when the guide does not list the model. */
export function getGuideStyleRows(catalog, modelCode) {
  return (catalog?.style_index_2026?.styles || []).filter((row) => row.kind === 'style' && String(row.model) === String(modelCode));
}

/** The guide row for one exact style (prefix + model, e.g. 448 + 803), or null. */
export function getGuideStyle(catalog, modelCode, prefix) {
  return getGuideStyleRows(catalog, modelCode).find((row) => row.prefix === String(prefix)) || null;
}

/** Mechanism entries (public/mechanism-guide-2026.json) that cover one style prefix, or null. A prefix the guide does not list gets no entry; nothing is inferred. */
export function getMechanismForPrefix(catalog, prefix) {
  const guide = catalog?.mechanism_guide_2026;
  if (!guide) return null;
  const mechanism = (guide.mechanisms || []).find((item) => item.prefixes.includes(String(prefix)));
  return mechanism ? resolveMechanism(guide, mechanism) : null;
}

function resolveMechanism(guide, mechanism) {
  return { ...mechanism, featureList: mechanism.features.map((id) => ({ id, ...guide.features[id] })) };
}

/** Mechanisms for the exact styles the April guide lists for one model, one entry each, with the prefixes of this model that use it. */
export function getMechanismsForModel(catalog, modelCode) {
  const found = new Map();
  for (const row of getGuideStyleRows(catalog, modelCode)) {
    const mechanism = getMechanismForPrefix(catalog, row.prefix);
    if (!mechanism) continue;
    const entry = found.get(mechanism.id) || { ...mechanism, modelPrefixes: [] };
    entry.modelPrefixes.push(row.prefix);
    found.set(mechanism.id, entry);
  }
  return [...found.values()];
}

/** "12–18"", "0"" or "" when the guide does not state wall proximity. */
export function formatWallProximity(range) {
  if (!Array.isArray(range)) return '';
  const [low, high] = range;
  return low === high ? `${low}"` : `${low}–${high}"`;
}

/** Plain-text summary and one talking point for a mechanism. */
export function describeMechanism(mechanism) {
  if (!mechanism) return null;
  const wall = formatWallProximity(mechanism.wallProximityIn);
  const facts = [mechanism.name, wall && `wall space ${wall}`, mechanism.weightTestedLbs && `weight tested to ${mechanism.weightTestedLbs} lb`].filter(Boolean).join(' · ');
  const lead = mechanism.featureList?.[0];
  return { text: `${facts}. ${(mechanism.featureList || []).map((feature) => feature.name).join(', ')}.`, pitch: lead ? `“${lead.benefit}”` : '' };
}

/** Benefit text and talking point for one option code, or null when the guide has none. */
export function getOptionBenefit(catalog, code) {
  return catalog?.mechanism_guide_2026?.options?.[String(code)] || null;
}

/** Lift chair series ratings from the guide (series, prefixes, tested limit in lb). Kept separate from the per-model capacity table. */
export function getLiftSeriesRatings(catalog) {
  return (catalog?.mechanism_guide_2026?.mechanisms || []).filter((item) => item.group === 'Lift chairs').map((item) => ({ name: item.name, prefixes: item.prefixes, limitLbs: item.weightTestedLbs }));
}

const SELECT_LABELS = { fabric: 'Select fabric', faux: 'Select faux leather', leather: 'Select leather' };

/** Price-book select cover lists as display lines, e.g. "Select fabric: B1538 Seamount". Leather entries keep their listed colours. */
export function formatSelectCovers(select) {
  return Object.entries(select || {}).map(([kind, covers]) => `${SELECT_LABELS[kind]}: ${covers.map((cover) => `${cover.code} ${cover.name}${cover.colors?.length ? ` (${cover.colors.join(', ')})` : ''}`).join(', ')}`);
}

/** Select covers the price book lists for one exact style, each marked when the cover is absent from the A26 program. */
export function getStyleSelectCovers(catalog, modelCode, prefix) {
  const known = new Set([...(catalog.fabric_cover_program_a26?.fabrics || []), ...(catalog.fabric_cover_program_a26?.leathers || [])].map((record) => record.coverCode));
  const select = getGuideStyle(catalog, modelCode, prefix)?.select || {};
  return Object.fromEntries(Object.entries(select).map(([kind, covers]) => [kind, covers.map((cover) => ({ ...cover, inA26: known.has(cover.code) }))]));
}

/** Wood finishes the guide lists for one exact style: its standard finish and its optional finishes. */
export function getStyleFinishes(catalog, modelCode, prefix) {
  const row = getGuideStyle(catalog, modelCode, prefix);
  return { standard: row?.standardFinish || null, optional: row?.optionalFinishes || [] };
}

/** Leather covers are sold in price bands (BL, DL, FL, HL, or Select leather for LB covers). A style that the price book shows no price for in that band cannot take the leather. Styles with no band data are not restricted. */
export function leatherBandOpen(record, rows) {
  const band = String(record.coverCode || '').slice(0, 2);
  const key = band === 'LB' ? 'selectLeather' : band;
  const withBands = rows.filter((row) => row.bands?.length);
  return !withBands.length || withBands.some((row) => row.bands.includes(key));
}

export const GUIDE_RESTRICTED_FAMILY = /^(MOTION|RECLINER|MODULAR|LIFT)$/;

export function getRmsModelStyleChoices(catalog, modelCode) {
  const guideRows = getGuideStyleRows(catalog, modelCode);
  if (guideRows.length) return guideRows.map((row) => ({ code: row.prefix, label: `${row.category || row.name}${row.status === 'discontinued' ? ' (discontinued)' : row.status === 'new' ? ' (new)' : ''}` }));
  const entries = new Map();
  const add = (code, label) => {
    if (code) entries.set(String(code), label || 'Catalog model/style');
  };

  for (const key of RMS_CATALOGS) {
    const source = catalog[key];
    for (const model of source?.models || source?.products || []) {
      if (String(model.model_code ?? model.code) !== String(modelCode)) continue;
      for (const style of model.styles || []) {
        if (Array.isArray(style)) add(style[0], style[1]);
      }
      for (const group of model.catalog_groups || []) {
        for (const style of group.styles || []) {
          const match = String(style.style_code || '').match(/^([A-Z0-9]+)-/);
          if (match) add(match[1], style.category || group.name);
        }
      }
    }
  }

  if (!entries.size) {
    for (const profile of catalog.product_profiles || []) {
      if (String(profile.model_code) !== String(modelCode)) continue;
      for (const piece of profile.pieces || []) {
        for (const code of [...splitRmsCodes(piece.code), ...(piece.variants || []).flatMap((variant) => splitRmsCodes(variant.code))]) {
          add(code, `${piece.name} · tear-pad piece`);
        }
      }
    }
  }

  const descriptions = new Map((catalog.style_prefixes || []).map((item) => [item.code, item.motion_type]));
  const profile = (catalog.product_profiles || []).find((entry) => String(entry.model_code) === String(modelCode));
  for (const piece of profile?.pieces || []) {
    for (const code of [...splitRmsCodes(piece.code), ...(piece.variants || []).flatMap((variant) => splitRmsCodes(variant.code))]) add(code, `${piece.name} · tear-pad piece`);
  }
  return [...entries].map(([code, label]) => ({ code, label: descriptions.get(code) || label }));
}

export function getDefaultRmsGroup(catalog, modelCode) {
  // A floor unit or quote starts from the whole piece, not one modular section of it.
  const modular = new Set((catalog.product_profiles || []).filter((profile) => String(profile.model_code) === String(modelCode)).flatMap((profile) => profile.pieces.flatMap((piece) => [piece.code, ...(piece.variants || []).map((variant) => variant.code)])).filter(Boolean));
  const choices = getRmsModelStyleChoices(catalog, modelCode);
  const whole = choices.filter((choice) => !modular.has(choice.code));
  return (whole[0] || choices[0])?.code || '';
}

export function getRmsStyleOptions(catalog, modelCode, group) {
  if (catalog?.style_index_2026?.styles?.length && !getGuideStyleRows(catalog, modelCode).length) return getRmsModelStyleChoices(catalog, modelCode).some((item) => item.code === String(group)) ? { options: new Set(), finishMarkerListed: false } : null;
  if (getGuideStyleRows(catalog, modelCode).length) {
    const row = getGuideStyle(catalog, modelCode, group);
    return row ? { options: new Set(row.options), finishMarkerListed: row.options.includes('FN') && Boolean(row.standardFinish || row.optionalFinishes.length) } : null;
  }
  const options = new Set();
  let documented = false;
  let finishMarkerListed = false;

  for (const key of RMS_CATALOGS) {
    const source = catalog[key];
    for (const model of source?.models || source?.products || []) {
      if (String(model.model_code ?? model.code) !== String(modelCode)) continue;
      for (const style of model.styles || []) {
        if (Array.isArray(style) && String(style[0]) === String(group)) {
          documented = true;
          const list = [style[2], style[3]].find(Array.isArray) || [];
          list.forEach((code) => options.add(String(code)));
          finishMarkerListed ||= list.includes('FN');
        }
      }
      for (const catalogGroup of model.catalog_groups || []) {
        for (const style of catalogGroup.styles || []) {
          const match = String(style.style_code || '').match(/^([A-Z0-9]+)-/);
          if (match?.[1] === String(group)) {
            documented = true;
            (style.options || []).forEach((code) => options.add(String(code)));
            finishMarkerListed ||= (style.options || []).includes('FN');
          }
        }
      }
    }
  }

  const profile = (catalog.product_profiles || []).find((entry) => String(entry.model_code) === String(modelCode));
  const piece = profile?.pieces?.find((entry) => sectionalPieceCodes(entry).includes(String(group)));
  if (piece) {
    documented = true;
    const catalogOptions = getSectionalPieceOptions(catalog, profile.sectional_family, modelCode, group);
    for (const code of catalogOptions) options.add(String(code));
    finishMarkerListed = options.has('FN');
  }

  return documented ? { options, finishMarkerListed } : null;
}

export function filterCoverOptionsByMaterial(covers, preference) {
  const selected = String(preference || '').toLowerCase();
  if (!selected || selected === 'no preference yet' || selected.startsWith('other')) return covers;
  const matches = (item) => `${item.code || ''} ${item.type || ''} ${item.material || ''} ${item.category || ''} ${item.name || ''} ${item.description || ''} ${item.note || ''}`.toLowerCase();
  if (/performance|pet-friendly|specialty/.test(selected)) return covers.filter((item) => /performance|iclean|pet.?friendly|specialty/.test(matches(item)) || ['DP', 'NP', 'PS'].includes(String(item.code).toUpperCase()));
  if (/authentic/.test(selected)) return covers.filter((item) => /authentic leather|top.?grain|genuine leather/.test(matches(item)) || String(item.code).toUpperCase() === 'LL');
  if (/leather match/.test(selected)) return covers.filter((item) => /leather mate|leather match/.test(matches(item)) || String(item.code).toUpperCase() === 'LM');
  if (/leather/.test(selected)) return covers.filter((item) => /leather/.test(matches(item)));
  if (/fabric/.test(selected)) return covers.filter((item) => /fabric/.test(matches(item)) && !/leather/.test(matches(item)));
  return covers;
}

export function getModelCoverOptions(catalog, modelCode) {
  const codes = new Map();
  const addCodes = (values, source = 'Product catalog cover-cap table') => (values || []).forEach((code) => {
    const key = String(code);
    if (!codes.has(key)) codes.set(key, new Set());
    codes.get(key).add(source);
  });
  const designer = catalog.designers_choice_catalog_2026?.models?.find((item) => String(item.code) === String(modelCode));
  const stationary = catalog.stationary_catalog_2026?.products?.find((item) => String(item.model_code) === String(modelCode));
  const application = catalog.april_2026_model_cover_applications?.model_applications?.find((entry) => String(entry.model_code) === String(modelCode));
  const applicationRows = (application?.rows || []).filter((row) => {
    if (!row.source_model_list) return true;
    const sourceModels = String(row.source_model_list);
    const model = String(modelCode);
    const codeListed = new RegExp(`(?:^|\\D)${model}(?:\\D|$)`).test(sourceModels);
    const normalizedModels = sourceModels.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join(' ');
    const normalizedName = String(application.model_name || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join(' ');
    const nameListed = normalizedName && ` ${normalizedModels} `.includes(` ${normalizedName} `);
    return codeListed || nameListed;
  });
  if (applicationRows.length) {
    for (const row of applicationRows) addCodes(row.cover_codes || (row.cover ? [row.cover] : []), `April 2026 cover application: ${row.program}`);
  } else {
    if (designer) Object.entries(designer.cover_cap_choices || catalog.designers_choice_catalog_2026.model_cover_cap_choices?.[modelCode] || {}).forEach(([material, values]) => addCodes(values, `${catalog.designers_choice_catalog_2026.title}: ${material}`));
    for (const group of stationary?.catalog_groups || []) Object.entries(group.cover_cap_choices || {}).forEach(([material, values]) => addCodes(values, `${catalog.stationary_catalog_2026.title}: ${group.name} ${material}`));
  }
  return [...codes].map(([code, sources]) => {
    const details = (catalog.cover_cap_codes || []).find((item) => item.code === code);
    const matchingApplicationRows = applicationRows.filter((row) => (row.cover_codes || [row.cover]).filter(Boolean).includes(code));
    const materialTypes = [...new Set([...sources].map((source) => /leather/i.test(source) ? 'Leather' : /fabric/i.test(source) ? 'Fabric' : '').filter(Boolean))];
    const coverDetails = details || (catalog.cover_cap_codes || []).find((item) => item.code === code);
    const coverType = coverDetails?.type || '';
    const coverCategory = coverDetails?.category || '';
    const leatherApplication = matchingApplicationRows.some((row) => /leather/i.test(row.program || ''));
    const fabricApplication = matchingApplicationRows.some((row) => /fabric/i.test(row.program || ''));
    const resolvedType = coverType || (leatherApplication ? 'Leather' : fabricApplication ? 'Fabric' : 'Catalog application');
    const applicationLabel = matchingApplicationRows.map((row) => `${row.cover_pattern || row.cover || code}${row.color ? ` · ${row.color}` : ''}`).filter(Boolean).join('; ');
    return { code, name: details?.name || applicationLabel || code, description: details?.description || details?.name || applicationLabel || code, type: resolvedType, material: materialTypes.join(' / '), category: coverCategory, grade: details?.grade || '', source: [...sources].join('; '), note: matchingApplicationRows.map((row) => `${row.program}: ${row.cover_pattern || row.cover || ''}${row.color ? ` · ${row.color}` : ''}`).filter(Boolean).join('; ') };
  });
}

export function getFullProductIndex(catalog) {
  const products = new Map();
  const ensureProduct = (code, name, category = '') => {
    if (!code) return null;
    const key = String(code);
    if (!products.has(key)) products.set(key, { modelCode: key, modelName: name || key, categories: new Set(), sources: new Set(), styles: new Map(), notes: new Set() });
    const product = products.get(key);
    if (category) product.categories.add(category);
    if (name && product.modelName === key) product.modelName = name;
    return product;
  };
  const addSource = (product, source, pages) => product.sources.add(`${source}${pages?.length ? ` · p. ${pages.join(', ')}` : ''}`);
  const styleLabels = new Map([
    ...(catalog.recliner_catalog_2026?.prefix_definitions || []).map(([code, label]) => [String(code), label]),
    ...(catalog.recliner_catalog_2026?.prefix_definitions_additional || []).map(([code, label]) => [String(code), label]),
    ...(catalog.motion_catalog_2026?.prefix_definitions || []).map(([code, label]) => [String(code), label]),
    ...(catalog.designers_choice_catalog_2026?.prefix_definitions || []).map(([code, label]) => [String(code), label]),
    ...(catalog.designers_choice_catalog_2026?.prefix_definitions_additional || []).map(([code, label]) => [String(code), label]),
    ...(catalog.stationary_catalog_2026?.stationary_prefix_definitions || []).map((item) => [String(item.code), item.description]),
  ]);
  const addStyle = (product, style) => {
    if (!style?.code) return;
    const key = `${style.code}|${style.source || ''}`;
    product.styles.set(key, { ...style, options: [...new Set(style.options || [])] });
  };

  const recliner = catalog.recliner_catalog_2026;
  for (const model of recliner?.models || []) {
    const product = ensureProduct(model.code, model.name, 'Recliners');
    addSource(product, recliner.title, model.pages);
    (model.cover_collections || []).forEach((item) => product.notes.add(`Cover collections listed: ${item}`));
    for (const [code, dimensions, options] of model.styles || []) addStyle(product, { code, label: styleLabels.get(String(code)) || 'Recliner style', dimensions, options, source: recliner.title });
  }
  const motion = catalog.motion_catalog_2026;
  for (const model of motion?.models || []) {
    const product = ensureProduct(model.code, model.name, 'Motion');
    addSource(product, motion.title, model.pages);
    (model.product_groups || []).forEach((item) => product.categories.add(item));
    for (const [code, label, dimensions, options, sourceNote] of model.styles || []) addStyle(product, { code, label, dimensions, options, sourceNote, source: motion.title });
  }
  const designers = catalog.designers_choice_catalog_2026;
  for (const model of designers?.models || []) {
    const product = ensureProduct(model.code, model.name, 'Designer’s Choice');
    addSource(product, designers.title, model.pages);
    for (const [code, label, dimensions, options, sourceNote] of model.styles || []) addStyle(product, { code, label, dimensions, options, sourceNote, source: designers.title });
    (model.notes || []).forEach((item) => product.notes.add(item));
  }
  const stationary = catalog.stationary_catalog_2026;
  for (const model of stationary?.products || []) {
    const product = ensureProduct(model.model_code, model.model_name, 'Stationary');
    addSource(product, stationary.title, model.pages);
    for (const group of model.catalog_groups || []) {
      product.categories.add(group.name);
      for (const style of group.styles || []) addStyle(product, { code: style.style_code, label: style.category || group.name, dimensions: style.dimensions, options: style.options, source: stationary.title, group: group.name });
    }
  }
  for (const index of [...(motion?.index || []), ...(designers?.index || []), ...(stationary?.index || [])]) {
    const product = ensureProduct(index.code ?? index.model_code, index.name ?? index.model_name, index.catalog_categories?.join(', ') || 'Catalog index');
    const source = index.catalog_categories ? stationary?.title : (motion?.index || []).includes(index) ? motion?.title : designers?.title;
    addSource(product, source || '2026 product catalog index', index.pages);
    for (const [category, listed] of Object.entries(index.categories || {})) if (listed) product.categories.add(category.replaceAll('_', ' '));
  }
  for (const entry of catalog.recliner_catalog_2026?.index || []) {
    const product = ensureProduct(entry.code, entry.name, 'Recliners');
    addSource(product, catalog.recliner_catalog_2026.title, entry.pages);
    for (const [category, listed] of Object.entries(entry.categories || {})) if (listed) product.categories.add(category.replaceAll('_', ' '));
    if (!product.styles.size) product.notes.add('Recliner catalog index row; this entry does not contain a model specification page in the supplied extraction.');
  }
  for (const entry of catalog.recliner_collection_index_supplement?.index || []) {
    const product = ensureProduct(entry.code, entry.name, 'Recliner catalog index supplement');
    addSource(product, catalog.recliner_collection_index_supplement.title, entry.pages);
    for (const [category, listed] of Object.entries(entry.categories || {})) if (listed) product.categories.add(category.replaceAll('_', ' '));
    if (!catalog.recliner_catalog_2026?.models?.some((model) => String(model.code) === String(entry.code))) product.notes.add('Supplemental table-of-contents entry only; specifications and style eligibility are not established by this index row.');
  }
  for (const entry of catalog.april_2026_model_cover_applications?.model_applications || []) {
    const product = ensureProduct(entry.model_code, entry.model_name, 'April 2026 model-cover application');
    addSource(product, catalog.april_2026_model_cover_applications.source?.document || 'April 2026 model-cover application', []);
    for (const row of entry.rows || []) product.notes.add(`${row.program}: ${row.cover_pattern || row.cover || 'listed cover program'}${row.color ? ` · ${row.color}` : ''}; source row identifies ${row.source_model_list || 'model association only'}.`);
  }
  for (const model of catalog.models_database || []) {
    const product = ensureProduct(model.model_code, model.model_name, model.category || 'Master catalog');
    addSource(product, 'Master product catalog', []);
    if (model.quick_spotter) product.notes.add(model.quick_spotter);
  }
  for (const model of [...(catalog.motion_catalog_2026?.models || []), ...(catalog.designers_choice_catalog_2026?.models || [])]) {
    for (const group of model.catalog_groups || []) {
      const product = ensureProduct(model.code, model.name, group.name);
      for (const style of group.styles || []) addStyle(product, { code: style.style_code, label: style.category || group.name, dimensions: style.dimensions, options: style.options, source: catalog.motion_catalog_2026?.models?.includes(model) ? catalog.motion_catalog_2026.title : catalog.designers_choice_catalog_2026?.title, group: group.name });
    }
  }
  for (const profile of catalog.product_profiles || []) {
    const product = ensureProduct(profile.model_code, profile.model_name, profile.sectional_family || 'Tear-pad product');
    addSource(product, profile.source, []);
    product.notes.add(profile.product_description || 'Model-specific tear-pad profile.');
    for (const piece of profile.pieces || []) {
      const variants = [...(piece.code ? [piece.code] : []), ...(piece.variants || []).map((variant) => variant.code)].flatMap(splitRmsCodes);
      for (const code of variants) addStyle(product, { code, label: piece.name, dimensions: piece.dimensions_text || '', options: piece.pricebook_options || piece.options || [], source: profile.source, kind: 'Sectional piece' });
    }
  }
  return [...products.values()].map((product) => ({
    ...product,
    categories: [...product.categories],
    sources: [...product.sources],
    styles: [...product.styles.values()].sort((left, right) => left.code.localeCompare(right.code)),
    notes: [...product.notes],
  })).sort((left, right) => left.modelName.localeCompare(right.modelName));
}
