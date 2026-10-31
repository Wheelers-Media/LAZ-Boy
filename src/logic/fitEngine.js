import { RMS_CATALOGS } from './guideIndex.js';
import { getSectionalPieceOptions, sectionalPieceCodes } from './sectional.js';

export const getRoomClearance = (clearance) => {
  if (clearance.startsWith('Tight')) return 4;
  if (clearance.startsWith('A little')) return 10;
  return 18;
};

export function matchingPrefixes(catalog, answers) {
  const category = String(answers.category || '').toLowerCase();
  const mechanism = String(answers.mechanism || '').toLowerCase();
  const lift = category.includes('lift');
  const family = lift ? 'lift chair'
    : category.includes('high-leg') ? 'designer choice'
      : category.includes('motion sofas') ? 'motion sofa'
        : category.includes('sectional') ? 'sectional'
          : category.includes('stationary') ? 'stationary'
            : category.includes('sleeper') ? 'sleeper'
              : category.includes('recliner') ? 'recliner' : category;
  const effectiveMechanism = answers.mechanism === 'Gold-series lift' ? 'gold-series lift' : answers.mechanism === 'Lift chair' ? 'lift chair' : String(answers.mechanism || '').toLowerCase();
  const knownPrefixes = new Map((catalog.style_prefixes || []).map((item) => [String(item.code), item]));
  for (const key of RMS_CATALOGS) {
    const source = catalog[key];
    for (const [code, description, familyName] of source?.prefix_definitions || []) {
      const prefixCode = String(code);
      if (knownPrefixes.has(prefixCode)) continue;
      knownPrefixes.set(prefixCode, {
        code: prefixCode,
        category: familyName || source.title,
        motion_type: description,
        description,
        wall_clearance_inches: (catalog.style_prefixes || []).find((item) => item.code === prefixCode)?.wall_clearance_inches ?? null,
        power_compatible: /power/i.test(description),
        clearance_unverified: true,
      });
    }
    for (const [code, description, familyName] of source?.prefix_definitions_additional || []) {
      const prefixCode = String(code);
      if (knownPrefixes.has(prefixCode)) continue;
      knownPrefixes.set(prefixCode, {
        code: prefixCode,
        category: familyName || source.title,
        motion_type: description,
        description,
        wall_clearance_inches: (catalog.style_prefixes || []).find((item) => item.code === prefixCode)?.wall_clearance_inches ?? null,
        power_compatible: /power/i.test(description),
        clearance_unverified: true,
      });
    }
    for (const definition of source?.stationary_prefix_definitions || []) {
      const [code, description, familyName] = Array.isArray(definition)
        ? definition
        : [definition.code, definition.description, definition.family];
      const prefixCode = String(code || '');
      if (!prefixCode || knownPrefixes.has(prefixCode)) continue;
      knownPrefixes.set(prefixCode, {
        code: prefixCode,
        category: familyName || source.title,
        motion_type: description || prefixCode,
        description: description || prefixCode,
        wall_clearance_inches: null,
        power_compatible: /power/i.test(description || ''),
        clearance_unverified: true,
      });
    }
  }
  const prefixes = [...knownPrefixes.values()].map((item) => {
    if (Number.isFinite(item.wall_clearance_inches)) return item;
    const clearances = (catalog.style_prefixes || [])
      .filter((prefix) => prefix.code === item.code && Number.isFinite(prefix.wall_clearance_inches))
      .map((prefix) => prefix.wall_clearance_inches);
    return clearances.length ? { ...item, wall_clearance_inches: Math.min(...clearances) } : item;
  }).filter((item) => {
    const itemCategory = String(item.category || '').toLowerCase();
    const motionType = String(item.motion_type || '');
    const label = `${itemCategory} ${motionType}`.toLowerCase();
    const referencedClearances = (catalog.style_prefixes || [])
      .filter((prefix) => prefix.code === item.code && Number.isFinite(prefix.wall_clearance_inches))
      .map((prefix) => prefix.wall_clearance_inches);
    const minimumClearance = Number.isFinite(item.wall_clearance_inches)
      ? item.wall_clearance_inches
      : referencedClearances.length ? Math.min(...referencedClearances) : null;
    const categoryMatches = family === 'designer choice' ? /high.?leg|designer choice/i.test(label)
      : family === 'motion sofa' ? /motion|la-z-time/i.test(itemCategory) && /sofa|loveseat/i.test(motionType) && !/modular|sectional|left-arm|right-arm|corner|armless|storage/i.test(motionType)
        : family === 'sectional' ? /sectional|modular|duo/.test(label)
          : family === 'stationary' ? /stationary/.test(label)
            : family === 'sleeper' ? /sleeper|sleep sofa/i.test(label)
              : family === 'recliner' ? /recliner/i.test(label) && !/modular|sectional|lift|high.?leg|designer/i.test(label)
                : itemCategory.includes(family);
    const clearanceRequired = !lift && !['stationary', 'sleeper'].includes(family);
    const clearanceMatches = !clearanceRequired || minimumClearance === null || minimumClearance <= getRoomClearance(answers.clearance);
    if (!categoryMatches || !clearanceMatches) return false;
    if (family === 'lift chair') {
      if (effectiveMechanism.includes('gold')) return item.code === '1HM';
      if (effectiveMechanism === 'lift chair') return item.code === '3BL';
      return item.power_compatible;
    }
    if (family === 'designer choice') return mechanism.includes('power') ? item.power_compatible : !item.power_compatible;
    if (family === 'recliner' && mechanism === 'lift chair') return /luxury power lift/i.test(`${itemCategory} ${motionType}`) && item.code !== '1HM';
    if (family === 'recliner' && mechanism === 'gold-series lift') return /luxury power lift/i.test(`${itemCategory} ${motionType}`) && item.code === '1HM';
    if (family === 'stationary' || family === 'sleeper') return mechanism === 'no reclining mechanism';
    const powerPrefix = Boolean(item.power_compatible);
    const prefixMotion = String(item.motion_type || '');
    const headrestRequested = mechanism.includes('headrest');
    const lumbarRequested = mechanism.includes('lumbar');
    if (mechanism.includes('power')) {
      if (!powerPrefix) return false;
      if (headrestRequested && !/headrest/i.test(prefixMotion)) return false;
      if (lumbarRequested && !/lumbar/i.test(prefixMotion)) return false;
    }
    if (family === 'motion sofa' || family === 'sectional') {
      if (mechanism === 'manual') return !powerPrefix;
      if (mechanism.includes('power')) return powerPrefix;
      return true;
    }
    if (mechanism === 'manual') return !powerPrefix;
    if (mechanism.includes('power') || lift) return powerPrefix;
    return true;
  });
  return prefixes;
}

export function getContextualModelOptions(catalog, answers) {
  const prefixOptions = matchingPrefixes(catalog, answers);
  if (!prefixOptions.length) return [];

  const category = String(answers.category || '').toLowerCase();
  const sourceKeys = category.includes('lift') ? ['recliner_catalog_2026']
    : category.includes('recliner') ? ['recliner_catalog_2026']
    : category.includes('high-leg') ? ['designers_choice_catalog_2026']
      : category.includes('motion sofas') ? ['motion_catalog_2026']
        : category.includes('sectional') ? ['motion_catalog_2026', 'stationary_catalog_2026']
          : category.includes('stationary') || category.includes('sleeper') ? ['stationary_catalog_2026'] : [];
  const options = new Map();
  const addModel = (code, name, source, categoryMatch = true) => {
    const styles = getContextualStyleChoices(catalog, code, answers);
    if (!categoryMatch || !styles.length) return;
    const existing = options.get(String(code));
    const combined = [...(existing?.styles || []), ...styles];
    const uniqueStyles = [...new Map(combined.map((style) => [style.code, style])).values()];
    options.set(String(code), { code: String(code), name: name || existing?.name || String(code), source, styles: uniqueStyles });
  };

  for (const key of sourceKeys) {
    const source = catalog[key];
    for (const model of source?.models || source?.products || []) {
      const code = String(model.model_code ?? model.code);
      addModel(code, model.model_name || model.name, source?.title);
    }
  }

  for (const profile of catalog.product_profiles || []) {
    const entries = options.get(String(profile.model_code));
    const categoryMatches = /sectional/i.test(String(answers.category))
      && (String(answers.category).toLowerCase().includes('stationary') ? profile.sectional_family === 'Stationary'
        : String(answers.category).toLowerCase().includes('motion sofas') ? /motion/i.test(profile.sectional_family)
          : /La-Z-Time/i.test(profile.sectional_family) && !/motion/i.test(profile.sectional_family));
    if (!categoryMatches || !entries) continue;
    const profileStyles = getContextualStyleChoices(catalog, profile.model_code, answers);
    entries.styles = [...new Map([...entries.styles, ...profileStyles].map((style) => [style.code, style])).values()];
  }

  const models = [...options.values()].filter((model) => model.styles.length);
  if (category.includes('lift')) {
    const mechanism = String(answers.mechanism || '').toLowerCase();
    const requiredPrefix = mechanism.includes('gold') ? '1HM' : mechanism === 'lift chair' ? '3BL' : '';
    if (!requiredPrefix) return [];
    const requestedWeight = Number(answers.weight);
    return models.filter((model) => {
      if (!model.styles.some((style) => style.code === requiredPrefix)) return false;
      if (!answers.weight || !Number.isFinite(requestedWeight)) return true;
      const capacity = catalog.lift_chair_weight_tiers?.find((tier) => String(tier.model_code) === model.code)?.limit_lbs
        ?? catalog.models_database?.find((item) => String(item.model_code) === model.code)?.weight_limit_lbs;
      return Number.isFinite(capacity) && capacity >= requestedWeight;
    });
  }
  if (answers.weight) {
    const requestedWeight = Number(answers.weight);
    return models.filter((model) => {
      const capacity = catalog.lift_chair_weight_tiers?.find((tier) => String(tier.model_code) === model.code)?.limit_lbs
        ?? catalog.models_database?.find((item) => String(item.model_code) === model.code)?.weight_limit_lbs;
      return !Number.isFinite(requestedWeight) || (Number.isFinite(capacity) && capacity >= requestedWeight);
    });
  }
  return models.sort((left, right) => left.name.localeCompare(right.name));
}

export function getContextualPreferenceChoices(catalog, answers, kind, modelCode = '', styleCode = '') {
  const context = { ...answers, support_preference: 'No preference yet', cushion_preference: 'Standard Poly' };
  const styles = modelCode
    ? getContextualStyleChoices(catalog, modelCode, context).filter((style) => !styleCode || style.code === styleCode)
    : getContextualModelOptions(catalog, context).flatMap((model) => model.styles);
  if (kind === 'cushion') {
    const listedOptions = new Set(styles.flatMap((style) => [...style.options]));
    return (catalog.cushion_upgrades || []).filter((item) => item.code === 'Standard' || listedOptions.has(item.code))
      .map((item) => item.code === 'Standard' ? { ...item, name: 'Standard Poly' } : item);
  }

  const choices = [{ value: 'No preference yet', label: 'No preference yet' }, { value: 'Manual adjustment if the model offers it', label: 'Manual adjustment if the model offers it' }];
  const supports = styles.map((style) => String(style.prefix.motion_type || '').toLowerCase());
  if (supports.some((description) => /lumbar/.test(description))) choices.push({ value: 'Power lumbar support', label: 'Power lumbar support' });
  if (supports.some((description) => /headrest/.test(description))) choices.push({ value: 'Power headrest', label: 'Power headrest' });
  if (supports.some((description) => /lumbar/.test(description) && /headrest/.test(description))) choices.push({ value: 'Power lumbar and headrest', label: 'Power lumbar and headrest' });
  return choices;
}

export function getMaterialPreferenceChoices(covers) {
  const has = (predicate) => covers.some(predicate);
  const choices = [{ value: 'No preference yet', label: 'No preference yet' }];
  if (has((item) => /fabric/i.test(`${item.type} ${item.material} ${item.category}`))) choices.push({ value: 'Fabric', label: 'Fabric' });
  if (has((item) => /performance|iclean|pet.?friendly|specialty/i.test(`${item.type} ${item.material} ${item.category} ${item.name} ${item.description}`) || ['DP', 'NP', 'PS'].includes(String(item.code).toUpperCase()))) {
    choices.push({ value: 'Performance fabric (e.g. iClean, where offered)', label: 'Performance fabric (e.g. iClean, where offered)' });
    choices.push({ value: 'Pet-friendly / specialty performance fabric, where offered', label: 'Pet-friendly / specialty performance fabric, where offered' });
  }
  if (has((item) => /leather/i.test(`${item.type} ${item.material} ${item.category}`))) choices.push({ value: 'Leather', label: 'Leather' });
  if (has((item) => /authentic leather|top.?grain|genuine leather/i.test(`${item.type} ${item.material} ${item.category} ${item.name} ${item.description}`) || String(item.code).toUpperCase() === 'LL')) choices.push({ value: 'Authentic leather (LL)', label: 'Authentic leather (LL)' });
  if (has((item) => /leather mate|leather match/i.test(`${item.type} ${item.material} ${item.category} ${item.name} ${item.description}`) || String(item.code).toUpperCase() === 'LM')) choices.push({ value: 'Leather match (LM)', label: 'Leather match (LM)' });
  if (covers.length) choices.push({ value: 'Other / need to compare swatches', label: 'Other / need to compare swatches' });
  return choices;
}

export function getContextualStyleChoices(catalog, modelCode, answers) {
  const prefixes = new Map(matchingPrefixes(catalog, answers).map((prefix) => [prefix.code, prefix]));
  if (!prefixes.size) return [];
  const category = String(answers.category || '').toLowerCase();
  const sourceKeys = category.includes('lift') ? ['recliner_catalog_2026']
    : category.includes('recliner') ? ['recliner_catalog_2026']
    : category.includes('high-leg') ? ['designers_choice_catalog_2026']
      : category.includes('motion sofas') ? ['motion_catalog_2026']
        : category.includes('sectional') ? ['motion_catalog_2026', 'stationary_catalog_2026']
          : category.includes('stationary') || category.includes('sleeper') ? ['stationary_catalog_2026'] : [];
  const styles = new Map();
  const addStyle = (code, description, options = [], dimensions = '', source = '') => {
    const prefix = prefixes.get(String(code));
    if (!prefix) return;
    const optionSet = new Set((options || []).map(String));
    if (!supportPreferenceMatches(answers.support_preference, prefix.motion_type, optionSet)) return;
    if (!cushionPreferenceMatches(answers.cushion_preference, optionSet)) return;
    const style = { code: String(code), description: description || prefix.motion_type, options: optionSet, dimensions, source, prefix };
    const existing = styles.get(style.code);
    if (!existing || existing.options.size < optionSet.size) styles.set(style.code, style);
  };

  for (const key of sourceKeys) {
    const source = catalog[key];
    for (const model of source?.models || source?.products || []) {
      if (String(model.model_code ?? model.code) !== String(modelCode)) continue;
      for (const style of model.styles || []) {
        if (!Array.isArray(style)) continue;
        const styleCode = String(style[0]);
        const prefix = findContextualPrefix(catalog, styleCode);
        const reclinerStyle = key === 'recliner_catalog_2026';
        const description = String((reclinerStyle ? prefix?.motion_type : style[1]) || prefix?.motion_type || 'Catalog style');
        const options = style.slice(2).find(Array.isArray) || [];
        const dimensions = reclinerStyle ? style[1] : style[2] && !Array.isArray(style[2]) ? style[2] : '';
        const descriptionMatches = category.includes('motion sofas') ? /sofa|loveseat/i.test(description) && !/left-arm|right-arm|corner|armless|storage/i.test(description)
          : category.includes('sectional') ? /sectional|modular/i.test(String(prefix?.category || '')) || /left-arm|right-arm|corner|armless|chaise|console/i.test(description)
            : category.includes('sleeper') ? /sleeper|sleep sofa/i.test(description)
              : true;
        if (prefix && descriptionMatches) addStyle(styleCode, description, options, dimensions, source?.title);
      }
      for (const group of model.catalog_groups || []) {
        for (const style of group.styles || []) {
          const match = String(style.style_code || '').match(/^([A-Z0-9]+)-/);
          if (match) addStyle(match[1], `${group.name}: ${style.category}`, style.options || [], style.dimensions, source?.title);
        }
      }
    }
  }

  for (const profile of catalog.product_profiles || []) {
    if (!category.includes('sectional') || String(profile.model_code) !== String(modelCode)) continue;
    for (const piece of profile.pieces || []) {
      const codes = piece.code ? [piece.code] : (piece.variants || []).map((variant) => variant.code);
      for (const code of codes) {
        const styleOptions = getSectionalPieceOptions(catalog, profile.sectional_family, modelCode, code);
        addStyle(code, `${piece.name} · documented tear-pad piece`, styleOptions, piece.dimensions_text, profile.source);
      }
    }
  }
  return [...styles.values()];
}

export function getContextualBatteryOptions(catalog, modelCode, styleCode, answers) {
  if (!modelCode || !styleCode) return [];
  const style = getContextualStyleChoices(catalog, modelCode, answers).find((item) => item.code === String(styleCode));
  if (!style) return [];

  const motion = String(style.prefix.motion_type || style.description || '');
  const category = String(style.prefix.category || '').toLowerCase();
  const code = style.prefix.battery_pack;
  if (!['BP1', 'BP2'].includes(code) || /console|lift/i.test(`${category} ${motion}`)) return [];
  const pack = (catalog.battery_packs || []).find((item) => item.code === code);
  if (!pack) return [];
  return [{ ...pack, name: (catalog.option_suffixes || []).find((item) => item.code === code)?.name || code }];
}

export function getContextualOptionRecords(catalog, optionCodes = []) {
  const records = new Map();
  const add = (code, name, description = name) => {
    if (code && !records.has(String(code))) records.set(String(code), { code: String(code), name: name || String(code), description: description || name || String(code) });
  };
  (catalog.option_suffixes || []).forEach((item) => add(item.code, item.name, item.description));
  for (const key of RMS_CATALOGS) {
    const source = catalog[key];
    for (const item of [...(source?.options || []), ...(source?.universal_options || [])]) {
      if (Array.isArray(item)) add(item[0], String(item[1] || '').split(';')[0], item[1]);
      else add(item.code, item.name, item.description || item.details || item.name);
    }
  }
  for (const item of catalog.stationary_catalog_2026?.options || []) add(item.code, item.name, item.details || item.description || item.name);
  return [...new Set([...optionCodes].map(String))].map((code) => records.get(code) || {
    code,
    name: 'Description not indexed',
    description: 'This code appears on the selected product/style row; confirm its current description and ordering details.',
  });
}

function findContextualPrefix(catalog, code) {
  const existing = (catalog.style_prefixes || []).find((prefix) => String(prefix.code) === String(code));
  if (existing) return existing;
  for (const key of RMS_CATALOGS) {
    const source = catalog[key];
    const definitions = [...(source?.prefix_definitions || []), ...(source?.prefix_definitions_additional || [])];
    const definition = definitions.find((entry) => String(Array.isArray(entry) ? entry[0] : entry.code) === String(code));
    if (definition) {
      const [prefixCode, description, familyName] = Array.isArray(definition) ? definition : [definition.code, definition.description, definition.family];
      return {
        code: String(prefixCode), category: familyName || source.title, motion_type: description || prefixCode, description: description || prefixCode,
        wall_clearance_inches: null, power_compatible: /power/i.test(description || ''), clearance_unverified: true,
      };
    }
    const stationary = (source?.stationary_prefix_definitions || []).find((entry) => String(Array.isArray(entry) ? entry[0] : entry.code) === String(code));
    if (stationary) {
      const [prefixCode, description] = Array.isArray(stationary) ? stationary : [stationary.code, stationary.description];
      return { code: String(prefixCode), category: source.title, motion_type: description, description, wall_clearance_inches: null, power_compatible: /power/i.test(description || ''), clearance_unverified: true };
    }
  }
  return null;
}

function supportPreferenceMatches(preference = '', motionType = '', options = new Set()) {
  const value = String(preference).toLowerCase();
  if (!value || value === 'no preference yet' || value === 'manual adjustment if the model offers it') return true;
  const description = String(motionType).toLowerCase();
  const hasLumbar = /lumbar/i.test(description);
  const hasHeadrest = /headrest/i.test(description);
  if (value.includes('lumbar') && value.includes('head')) return hasLumbar && hasHeadrest;
  if (value.includes('lumbar')) return hasLumbar;
  if (value.includes('head')) return hasHeadrest;
  return true;
}

function cushionPreferenceMatches(preference = '', options = new Set()) {
  const selected = String(preference).toLowerCase();
  if (!selected || selected.includes('standard')) return true;
  const code = selected.includes('comfortcore plus') ? 'Z6'
    : selected.includes('comfortdown') ? 'DC'
      : selected.includes('contour') ? 'FS' : null;
  return code ? options.has(code) : true;
}

const heightValues = (value) => [...String(value).matchAll(/(\d+)\s*[′'’]\s*(\d+)/g)].map((match) => Number(match[1]) * 12 + Number(match[2]));

export const heightInches = (value) => /under/i.test(String(value)) ? 64 : heightValues(value)[0] ?? null;

const modelHeightRange = (value) => {
  const heights = heightValues(value);
  if (/universal/i.test(String(value))) return [0, Infinity];
  return heights.length ? [Math.min(...heights), /\+/.test(String(value)) ? Infinity : Math.max(...heights)] : null;
};

const researchFitBand = (research, height, scale) => {
  if (research?.current_catalog_authority !== false || !Number.isFinite(height)) return null;
  const expectedBand = scale?.includes('Petite') ? 'Petite'
    : /extra|xl/i.test(scale || '') ? 'Extra Tall / XL'
      : /small|average|mid/i.test(scale || '') ? 'Small to Medium'
        : /tall/i.test(scale || '') ? 'Tall / Large'
          : null;
  const scaleMatch = !expectedBand || (research.fit_guidance_bands || []).find((band) => band.band === expectedBand)?.band === (research.fit_guidance_bands || []).find((band) => {
    const max = band.height_max_inches ?? Infinity;
    return height >= band.height_min_inches && height <= max;
  })?.band;
  if (!scaleMatch) return null;
  return (research.fit_guidance_bands || []).find((band) => {
    const max = band.height_max_inches ?? Infinity;
    return height >= band.height_min_inches && height <= max
      && band.verification_status === 'unverified_fit_guidance';
  }) || null;
};

const modelFitEvidence = (research, modelCode) => {
  const online = research?.model_fit_evidence?.[modelCode];
  const supplied = research?.research_document?.model_evidence?.[modelCode];
  if (!online && !supplied) return null;
  return {
    ...online,
    research_document: supplied || null,
    fit_claim: online?.fit_claim || (supplied?.explicit_fit_guidance ? {
      statement: supplied.explicit_fit_guidance,
      status: supplied.fit_status || supplied.secondary_fit_status || 'provisional_fit_guidance',
      market: supplied.canadian_availability?.includes('Canada') ? 'Canada dealer secondary' : 'unknown',
      source_url: supplied.fit_source_url,
    } : null),
    dimensions: online?.dimensions || supplied?.other_configuration_dimensions || supplied?.dimensions || null,
    capacity: supplied?.capacity || null,
    CanadianAvailability: supplied?.canadian_availability,
  };
};

const guideCandidateResearchStatus = (research, modelCode) => {
  const model = research?.research_document?.model_evidence?.[modelCode];
  return model?.fit_status || model?.secondary_fit_status || null;
};

const guideCategoryMatches = (candidate, selectedCategory, research) => {
  const categories = candidate.categories || [candidate.category];
  const selected = selectedCategory.toLowerCase();
  if (candidate.recommendation_status === 'conflicting_fit_guidance' || ['conflicting', 'conflicting_fit_guidance'].includes(guideCandidateResearchStatus(research, candidate.model_code))) return false;
  if (selected.includes('lift')) return categories.some((category) => /lift/i.test(category));
  if (selected.includes('sectional')) return categories.some((category) => /sectional/i.test(category));
  if (selected.includes('motion sofas')) return categories.some((category) => /motion sofa/i.test(category));
  if (selected.includes('stationary')) return categories.some((category) => /stationary/i.test(category));
  if (selected.includes('sleeper')) return categories.some((category) => /sleeper/i.test(category));
  if (selected.includes('high-leg')) return categories.some((category) => /high leg/i.test(category));
  return categories.some((category) => /recliner/i.test(category));
};

const guideMechanismMatches = (candidate, mechanism) => {
  const options = candidate.mechanism_options;
  return options === null || options?.includes(mechanism) === true;
};

const guideCandidateEligible = (research, modelCode) => {
  const onlineStatus = research?.model_fit_evidence?.[modelCode]?.fit_claim?.status;
  const reportStatus = guideCandidateResearchStatus(research, modelCode);
  return onlineStatus !== 'conflicting_fit_guidance' && !['conflicting', 'conflicting_fit_guidance'].includes(reportStatus);
};

const modelCapacity = (catalog, research, modelCode, mechanism) => {
  const indexed = catalog.models_database.find((model) => model.model_code === modelCode);
  if (modelCode === '512' && mechanism.toLowerCase().includes('lift')) {
    const reportCapacity = research?.research_document?.model_evidence?.['512']?.capacity;
    if (/1PL512/.test(reportCapacity?.configuration || '')) return reportCapacity.limit_lbs;
  }
  return indexed?.weight_limit_lbs ?? null;
};

export const positiveMeasurement = (value) => {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 && number <= 40 ? number : null;
};

export const widthMatchScore = (seatWidth, hipBreadth) => {
  const clearance = seatWidth - hipBreadth;
  if (clearance < 0 || clearance > 8) return 0;
  if (clearance >= 2 && clearance <= 5) return 1;
  return 0.7;
};

export const depthMatchScore = (seatDepth, thighLength) => {
  const kneeGap = thighLength - seatDepth;
  if (kneeGap < 0 || kneeGap > 4.5) return 0;
  if (kneeGap >= 1.5 && kneeGap <= 3) return 1;
  return 0.6;
};

export const heightMatchScore = (seatHeight, poplitealHeight) => {
  const difference = Math.abs(seatHeight - (poplitealHeight + 1));
  if (difference <= 1) return 1;
  if (difference <= 2) return 0.5;
  return 0;
};

/**
 * Ranks exact manual-recliner configurations against measurements the shopper
 * chose to provide. These are dimension screens, not fit or safety certifications.
 */
export function getDimensionBasedRecommendations(catalog, answers, research = null) {
  if (answers.category?.toLowerCase() !== 'recliners' || answers.mechanism?.toLowerCase() !== 'manual') return [];
  if (answers.weight !== '' && answers.weight != null) return [];

  const hipBreadth = positiveMeasurement(answers.hip_breadth_inches);
  const thighLength = positiveMeasurement(answers.thigh_length_inches);
  const poplitealHeight = positiveMeasurement(answers.popliteal_height_inches);
  if (hipBreadth === null && thighLength === null && poplitealHeight === null) return [];

  const availableClearance = getRoomClearance(answers.clearance || '');
  const manualPrefix = (catalog.style_prefixes || []).find((prefix) => prefix.code === '010');
  if (!manualPrefix || manualPrefix.wall_clearance_inches > availableClearance) return [];

  return Object.entries(research?.model_fit_evidence || []).flatMap(([modelCode, evidence]) => {
    const dimensions = evidence.dimensions || {};
    const configuration = dimensions.configuration || '';
    const configurationMatch = configuration.match(/\b(\d{3})\s*(\d{3})\b/);
    if (!configurationMatch || configurationMatch[1] !== '010') return [];

    const publishedModel = (catalog.recliner_catalog_2026?.models || []).find((item) => String(item.code) === String(modelCode));
    const publishedStyle = publishedModel?.styles?.some(([style]) => String(style) === configurationMatch[1]);
    if (!publishedStyle) return [];

    const measures = [
      ['seat_width', hipBreadth, dimensions.seat_width_inches, widthMatchScore, 'inside seat width', 'hip breadth'],
      ['seat_depth', thighLength, dimensions.seat_depth_inches, depthMatchScore, 'seat depth', 'thigh length'],
      ['seat_height', poplitealHeight, dimensions.seat_height_inches, heightMatchScore, 'seat height', 'popliteal height'],
    ];
    const scored = measures.flatMap(([key, input, productValue, scorer]) => input !== null && Number.isFinite(productValue)
      ? [[key, { customer_inches: input, chair_inches: productValue, score: scorer(productValue, input), ...(key === 'seat_width' ? { clearance_inches: Number((productValue - input).toFixed(2)) } : {}), ...(key === 'seat_depth' ? { knee_gap_inches: Number((input - productValue).toFixed(2)) } : {}), ...(key === 'seat_height' ? { target_with_shoes_inches: Number((input + 1).toFixed(2)), difference_inches: Number(Math.abs(productValue - (input + 1)).toFixed(2)) } : {}) }]]
      : []);
    if (!scored.length) return [];

    if (hipBreadth !== null && Number.isFinite(dimensions.seat_width_inches) && dimensions.seat_width_inches < hipBreadth) return [];

    const missingDimensions = measures.flatMap(([key, input, productValue, scorer, chairLabel]) => !Number.isFinite(productValue) ? [chairLabel] : []);
    const missingCustomerMeasurements = measures.flatMap(([key, input, productValue, scorer, chairLabel, customerLabel]) => input === null && Number.isFinite(productValue) ? [customerLabel] : []);
    const metrics = Object.fromEntries(scored);
    const weights = { seat_width: 0.4, seat_depth: 0.35, seat_height: 0.25 };
    const totalWeight = scored.reduce((sum, [key]) => sum + weights[key], 0);
    const score = scored.reduce((sum, [key, value]) => sum + weights[key] * value.score, 0) / totalWeight;
    const fitStatus = evidence.fit_claim?.status || research?.research_document?.model_evidence?.[modelCode]?.fit_status || null;
    const tier = missingCustomerMeasurements.length || missingDimensions.length
      ? `Partial comparison · ${missingCustomerMeasurements.length ? 'customer measurements' : ''}${missingCustomerMeasurements.length && missingDimensions.length ? ' and ' : ''}${missingDimensions.length ? 'chair dimensions' : ''} needed`
      : score >= 0.8 ? 'Good dimensions to try'
        : score >= 0.5 ? 'Possible dimensional alternative'
          : 'Lower dimensional alignment';
    const model = (catalog.models_database || []).find((item) => item.model_code === modelCode);
    const catalogModel = (catalog.recliner_catalog_2026?.models || []).find((item) => String(item.code) === String(modelCode));

    return [{
      model_code: modelCode,
      model_name: model?.model_name || catalogModel?.name || research?.research_document?.model_evidence?.[modelCode]?.name || modelCode,
      category: 'Manual rocking recliner',
      dimension_comparison: {
        kind: 'dimension_screen_not_fit_confirmation',
        tier,
        score: Number(score.toFixed(3)),
        score_method: 'Unvalidated screening heuristic from the supplied research; not an ergonomic standard or fit guarantee.',
        metrics,
        missing_dimensions: missingDimensions,
        missing_customer_measurements: missingCustomerMeasurements,
        configuration,
        source_market: dimensions.source_market || 'Not specified',
        source_kind: dimensions.source_kind || 'Unspecified source',
        source_url: dimensions.source_url || null,
        clearance_inches: manualPrefix.wall_clearance_inches,
        fit_source_conflict: fitStatus === 'conflicting_fit_guidance' || ['conflicting', 'conflicting_fit_guidance'].includes(research?.research_document?.model_evidence?.[modelCode]?.fit_status),
        availability_status: research?.research_document?.model_evidence?.[modelCode]?.canadian_availability || 'Not verified',
        capacity_status: 'Not verified for this exact manual configuration',
      },
      fit_guidance: { provisional: true, weight_confirmation_required: true, clearance_confirmation_required: true },
    }];
  }).sort((left, right) => right.dimension_comparison.score - left.dimension_comparison.score || left.model_name.localeCompare(right.model_name));
}

export function getCatalogCapabilityLeads(catalog, answers, limit = 3) {
  const matching = matchingPrefixes(catalog, answers);
  const compatibleCodes = new Set(matching.map((item) => item.code));
  if (!compatibleCodes.size) return [];
  const category = answers.category.toLowerCase();
  const notFit = 'Catalog capability only · not a fit recommendation';
  const disclaimer = 'Catalog presence confirms a listed product/style only. It does not establish ergonomic fit, exact cover/option eligibility beyond the cited style row, current Canadian availability, capacity, or a completed sectional arrangement.';

  if (category.includes('sectional')) {
    const duo = /duo/i.test(answers.mechanism);
    if (duo) return (catalog.motion_catalog_2026?.models || []).filter((model) => (model.product_groups || []).some((group) => /duo/i.test(group)))
      .map((model) => ({ model_code: String(model.code), model_name: model.name, category: answers.category, tier: notFit, source: catalog.motion_catalog_2026.title, styles: model.styles.filter((style) => /^P9/.test(style[0])).map((style) => ({ code: style[0], name: style[1], options: style[3] || [], clearance_inches: null })), note: disclaimer }))
      .filter((model) => model.styles.length).slice(0, limit);
    return (catalog.product_profiles || []).filter((profile) => {
      const familyMatch = /stationary/.test(category) ? profile.sectional_family === 'Stationary'
        : profile.sectional_family === 'La-Z-Motion' ? /motion/i.test(category)
          : /La-Z-Time/i.test(profile.sectional_family) && !/motion/i.test(category);
      return familyMatch;
    }).map((profile) => {
      const motionModel = catalog.motion_catalog_2026?.models?.find((model) => String(model.code) === String(profile.model_code));
      const profileCapacity = (catalog.models_database || []).find((entry) => String(entry.model_code) === String(profile.model_code))?.weight_limit_lbs;
      const capacityStatus = Number.isFinite(profileCapacity) ? `Catalog index: ${profileCapacity} lb; confirm exact style` : 'Capacity not documented for this model/style';
      const pieceRows = profile.pieces.flatMap((piece) => sectionalPieceCodes(piece).map((code) => ({
        code,
        name: piece.name,
        options: motionModel?.styles?.find((style) => String(style[0]) === code)?.[3] || [],
        clearance_inches: null,
      })));
      const compatible = pieceRows.filter((piece) => /power/i.test(answers.mechanism)
        ? /^(U|X|8|P9)/.test(piece.code)
        : /^(44|M44|60|6)/.test(piece.code));
      if (!compatible.length) return null;
      return { model_code: profile.model_code, model_name: profile.model_name, category: answers.category, tier: notFit, source: profile.source, capacity_lbs: Number.isFinite(profileCapacity) ? profileCapacity : null, capacity_status: capacityStatus, styles: compatible, note: disclaimer };
    }).filter(Boolean).sort((left, right) => left.model_name.localeCompare(right.model_name)).slice(0, limit);
  }

  const source = category.includes('high-leg') ? catalog.designers_choice_catalog_2026
    : category.includes('motion sofas') || category.includes('sectional') ? catalog.motion_catalog_2026
      : category.includes('stationary') || category.includes('sleeper') ? catalog.stationary_catalog_2026
        : catalog.recliner_catalog_2026;
  const candidates = (source?.models || source?.products || []).flatMap((model) => {
    const styles = (model.styles || []).map((style) => ({ code: String(style[0]), description: style[1], options: [style[2], style[3]].find(Array.isArray) || [] }));
    const catalogStyles = (model.catalog_groups || []).flatMap((group) => (group.styles || []).map((style) => ({
      code: String(style.style_code || '').split('-')[0], description: `${group.name}: ${style.category}`, options: style.options || [],
    })));
    const relevantGroup = category.includes('motion sofas') ? (model.product_groups || []).some((group) => /sofa|loveseat/i.test(group))
      : category.includes('stationary') ? (model.catalog_groups || []).some((group) => /sofa|sectional/i.test(group.name))
        : category.includes('sleeper') ? (model.catalog_groups || []).some((group) => /sleeper/i.test(group.name))
          : true;
    if (!relevantGroup) return [];
    const matches = [...styles, ...catalogStyles].filter((style) => compatibleCodes.has(style.code) || (category.includes('motion sofas') && /^P9/.test(style.code) && /duo/i.test(answers.mechanism)));
    if (!matches.length) return [];
    const code = String(model.code ?? model.model_code);
    const catalogCapacity = (catalog.lift_chair_weight_tiers || []).find((entry) => String(entry.model_code) === code)?.limit_lbs;
    const knownCapacity = catalogCapacity ?? (catalog.models_database || []).find((entry) => String(entry.model_code) === code)?.weight_limit_lbs;
    const requestedWeight = Number(answers.weight);
    if (Number.isFinite(requestedWeight) && requestedWeight > 0 && Number.isFinite(knownCapacity) && requestedWeight > knownCapacity) return [];
    return [{
      model_code: code,
      model_name: model.name || model.model_name || code,
      category: answers.category,
      tier: notFit,
      source: source.title || 'Supplied product catalog',
      styles: matches.map((style) => ({ ...style, clearance_inches: matching.find((item) => item.code === style.code)?.wall_clearance_inches ?? null })),
      capacity_lbs: Number.isFinite(knownCapacity) ? knownCapacity : null,
      capacity_status: Number.isFinite(knownCapacity) ? `Catalog index: ${knownCapacity} lb; confirm exact style` : 'Capacity not documented for this model/style',
      note: disclaimer,
    }];
  });
  return candidates.sort((left, right) => left.model_name.localeCompare(right.model_name)).slice(0, limit);
}

export function getRecommendations(catalog, answers, research = null) {
  const normalized = answers.category.toLowerCase();
  const selectedHeight = heightInches(answers.height);
  const fitBand = researchFitBand(research, selectedHeight, answers.scale);
  const candidates = (fitBand?.candidates || []).filter((candidate) => guideCategoryMatches(candidate, answers.category, research)
    && guideMechanismMatches(candidate, answers.mechanism)
    && guideCandidateEligible(research, candidate.model_code));

  return candidates.flatMap((candidate) => {
    const indexed = catalog.models_database.find((model) => model.model_code === candidate.model_code);
    const weightLimit = modelCapacity(catalog, research, candidate.model_code, answers.mechanism);
    if (answers.weight && (!Number.isFinite(weightLimit) || Number(answers.weight) > weightLimit)) return [];

    const category = candidate.category;
    const mechanism = answers.mechanism.toLowerCase();
    if (mechanism === 'no reclining mechanism') return [];
    if (mechanism.includes('lift') && !candidate.categories?.some((item) => /lift/i.test(item))) return [];
    if (!mechanism.includes('lift') && candidate.categories?.length && candidate.categories.every((item) => /lift/i.test(item))) return [];
    if (answers.weight && candidate.model_code === '512' && mechanism.includes('lift') && !/1pl/i.test(mechanism)) return [];

    return [{
      ...(indexed || {}),
      model_code: candidate.model_code,
      model_name: candidate.model_name,
      category,
      scale: indexed?.scale && !/not specified/i.test(indexed.scale) ? indexed.scale : fitBand.band,
      recommended_height: indexed?.recommended_height && !/not specified/i.test(indexed.recommended_height) ? indexed.recommended_height : fitBand.height_summary,
      weight_limit_lbs: Number.isFinite(weightLimit) ? weightLimit : null,
      fit_guidance: {
        band: fitBand.band,
        height_summary: fitBand.height_summary,
        source: research.source_file,
        verification_status: fitBand.verification_status,
        note: fitBand.note,
        provisional: true,
        weight_confirmation_required: !Number.isFinite(weightLimit),
        mechanism_confirmation_required: true,
        clearance_confirmation_required: true,
      },
      fit_evidence: modelFitEvidence(research, candidate.model_code),
    }];
  }).slice(0, 4);
}

// DCG notes: two short texts to paste into DCG after the customer leaves. DCG limits a note to 1,000 characters.
export const DCG_NOTE_LIMIT = 1000;

// Drops whole lines, highest `drop` number first (later lines first on a tie), until the note fits. Lines with drop 0 are never dropped.
function fitDcgLines(lines, limit) {
  const kept = [...lines];
  const join = () => kept.map((line) => line.text).join('\n');
  while (join().length > limit) {
    const worst = Math.max(...kept.map((line) => line.drop));
    if (worst === 0) break;
    kept.splice(kept.map((line) => line.drop).lastIndexOf(worst), 1);
  }
  const text = join();
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

export function buildDcgNotes({ answers, mechanism, roomName, sizeName, matches = [] }) {
  const weight = Number(answers.weight) > 0 ? `${Number(answers.weight)} lb` : 'not given';
  const household = answers.household || [];
  const material = answers.material_preference && answers.material_preference !== 'No preference yet' ? answers.material_preference : '';
  const need = FIT_NEEDS.find((item) => item.key === answers.need && item.key !== 'unsure');
  const capacityText = (match) => (match.capacityKnown ? match.capacity : 'Capacity not listed. Confirm before offering');
  const seatWords = { in: 'seat in range', near: 'seat close', out: 'seat outside range' };
  const matchLine = (match, index) => `${index + 1}. ${match.name} ${match.code} · ${capacityText(match)}${seatWords[match.seat?.status] ? ` · ${seatWords[match.seat.status]}` : ''}${match.flags?.length ? ` — ${match.flags[0]}` : ''}`;
  const internal = [
    { text: 'FIT NOTES · Floor Assistant', drop: 0 },
    { text: `Height: ${answers.height}${sizeName ? ` · ${sizeName}` : ''}`, drop: 0 },
    { text: `Weight: ${weight}`, drop: 0 },
    ...(need ? [{ text: `Needs: ${need.label}`, drop: 6 }] : []),
    { text: `Wants: ${answers.category} · ${mechanism}`, drop: 0 },
    ...(roomName ? [{ text: `Room behind: ${roomName}`, drop: 0 }] : []),
    ...(household.length ? [{ text: `Household: ${household.join(' + ')}`, drop: 6 }] : []),
    ...(material ? [{ text: `Material: ${material}`, drop: 6 }] : []),
    { text: matches.length ? 'To sit in:' : 'Nothing matches these answers. Nothing was loosened to fill the list.', drop: 0 },
    ...matches.map((match, index) => ({ text: matchLine(match, index), drop: 10 + index })),
    { text: 'Sit-test result:', drop: 5 },
    { text: 'Next: confirm the exact style, cover and options in RMS before promising anything.', drop: 1 },
  ];
  const customer = [
    { text: 'Thank you for coming in. Here is what we talked about.', drop: 0 },
    ...(sizeName ? [{ text: `Size: ${sizeName}`, drop: 0 }] : []),
    ...(need ? [{ text: `What matters most: ${need.label}`, drop: 3 }] : []),
    { text: `Looking for: ${answers.category} · ${mechanism}`, drop: 0 },
    ...(roomName ? [{ text: `Room behind it: ${roomName}`, drop: 0 }] : []),
    ...(household.length ? [{ text: `With ${household.join(' and ').toLowerCase()} at home, we will start with performance-rated fabrics.`, drop: 6 }] : []),
    ...(matches.length ? [{ text: `Worth sitting in: ${matches.slice(0, 3).map((match) => match.name).join(', ')}`, drop: 2 }] : []),
    { text: 'Next step: sit in each one, then we will choose the cover, finish and options together.', drop: 1 },
  ];
  return { internal: fitDcgLines(internal, DCG_NOTE_LIMIT), customer: fitDcgLines(customer, DCG_NOTE_LIMIT) };
}

// What the customer says they need, mapped only to a category and recline type the wizard already filters on.
// A need is a starting point for the shortlist. It never says a model fits the person.
export const FIT_NEEDS = [
  { key: 'simple', label: 'Simple and dependable', hint: 'A manual lever, nothing to plug in', patch: { category: 'Recliners', mechanism: 'Manual' } },
  { key: 'effortless', label: 'Easy to adjust', hint: 'Power recline at the touch of a button', patch: { category: 'Recliners', mechanism: 'Power recline' } },
  { key: 'neck', label: 'Head and neck support', hint: 'Power headrest to fine-tune while reclined', patch: { category: 'Recliners', mechanism: 'Power + headrest' } },
  { key: 'back', label: 'Lower-back support', hint: 'Power lumbar', patch: { category: 'Recliners', mechanism: 'Power + lumbar' } },
  { key: 'lift', label: 'Help getting up', hint: 'A lift chair raises the seat to standing', patch: { category: 'Lift chairs', mechanism: 'Lift chair' } },
  { key: 'family', label: 'Seating for more than one', hint: 'Motion sofas and loveseats', patch: { category: 'Motion sofas / loveseats', mechanism: 'Power recline' } },
  { key: 'guests', label: 'Somewhere guests can sleep', hint: 'Sleepers have no reclining mechanism', patch: { category: 'Sleepers', mechanism: 'No reclining mechanism' } },
  { key: 'unsure', label: 'Not sure yet', hint: 'Browse the options on the next screens', patch: {} },
];

// Modular sectionals come from the models the Sectional Studio has pieces for, grouped by family:
// La-Z-Time lists non-power (44x), power (U4x) and power + lumbar (X4x) pieces, La-Z-Motion is power, Stationary has no mechanism.
export function getSectionalLeads(catalog, answers) {
  const mechanism = String(answers.mechanism || '');
  const families = mechanism === 'No reclining mechanism' ? ['Stationary']
    : mechanism === 'Manual' ? ['La-Z-Time']
      : ['Power recline', 'Power + headrest', 'Power + lumbar'].includes(mechanism) ? ['La-Z-Time', 'La-Z-Motion'] : [];
  return (catalog.product_profiles || [])
    .filter((profile) => profile.pieces?.length && families.includes(profile.sectional_family))
    .map((profile) => ({ model_code: String(profile.model_code), model_name: profile.model_name, family: profile.sectional_family, pieceCount: profile.pieces.length, description: profile.product_description || '' }))
    .sort((a, b) => a.model_name.localeCompare(b.model_name));
}
