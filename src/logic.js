export function reclinerCatalogSearchEntries(reclinerCatalog) {
  if (!reclinerCatalog) return [];
  const collectionName = reclinerCatalog.title?.includes('Designer’s Choice') ? 'designers-choice' : reclinerCatalog.title?.includes('Motion') ? 'motion' : 'recliner';
  const label = collectionName === 'motion' ? 'Motion' : collectionName === 'designers-choice' ? 'Designer’s Choice' : 'Recliner';
  const entries = [
    ...(collectionName === 'recliner' ? (reclinerCatalog.models || []).flatMap((model) => [
      {
        kind: `${label} catalog model`,
        title: `${model.name} · ${model.code}`,
        detail: `${reclinerCatalog.edition} recliner catalog · pages ${model.pages.join(', ')} · styles ${model.styles.map(([style]) => style).join(', ')} · covers ${(model.cover_collections || []).join(', ')}${model.notes?.length ? ` · ${model.notes.join(' ')}` : ''}. Catalog record only; fit and capacity claims are not inferred.`,
        code: model.code,
        modelCode: model.code,
      },
      ...model.styles.map(([style, dimensions, options]) => ({
        kind: `${label} catalog style`,
        title: `${model.name} ${style}-${model.code}`,
        detail: `${style} ${model.name} style · dimensions H × W × D: ${dimensions} in · options ${options.join(', ')} · ${reclinerCatalog.edition} recliner catalog page ${model.pages.join('/')}.`,
        code: style,
        modelCode: model.code,
      })),
    ]) : []),
    ...(reclinerCatalog.prefix_definitions || []).map(([code, description, family]) => ({
      kind: `${label} prefix definition`,
      title: `${code} · ${description}`,
      detail: `${family}; prefix definition in the ${reclinerCatalog.edition} ${label} catalog.`,
      code,
    })),
    ...(reclinerCatalog.title?.includes('Designer’s Choice') ? (reclinerCatalog.prefix_definitions_additional || []).map(([code, description, family]) => ({
      kind: `${label} prefix definition`,
      title: `${code} · ${description}`,
      detail: `${family}; prefix definition in the ${reclinerCatalog.edition} Designer’s Choice catalog.`,
      code,
    })) : []),
    ...((reclinerCatalog.universal_options || reclinerCatalog.options || [])).map(([code, description]) => ({
      kind: `${label} catalog option`,
      title: `${code} · ${description.split(';')[0]}`,
      detail: description,
      code,
    })),
    ...(reclinerCatalog.finishes || []).map((item) => ({
      kind: `${label} catalog finish`,
      title: `${item.code} · ${item.name}`,
      detail: item.description,
      code: item.code,
    })),
    ...(reclinerCatalog.cover_cap_choices || []).map((item) => ({
      kind: `${label} cover cap choices`,
      title: `${item.material} · ${item.codes.join(', ')}`,
      detail: `Catalog cover-cap codes for ${item.material.toLowerCase()} upholstery. Check the individual model/style catalog entry for eligibility.`,
      code: item.codes.join(', '),
    })),
    ...(reclinerCatalog.source_documents?.length ? [{
      kind: `${label} catalog source`,
      title: `${reclinerCatalog.edition} ${reclinerCatalog.title?.includes('Designer’s Choice') ? 'Designer’s Choice' : collectionName} catalog source documents`,
      detail: `${reclinerCatalog.source_documents.map((source) => `${source.file}: ${source.pages}`).join(' · ')}${reclinerCatalog.publication_footer ? ` · ${reclinerCatalog.publication_footer}` : ''}`,
      code: reclinerCatalog.edition,
    }] : []),

    ...(reclinerCatalog.title?.includes('Designer’s Choice') && reclinerCatalog.warranty_reference ? [{
      kind: 'Designer’s Choice warranty reference',
      title: `${reclinerCatalog.edition} Designer’s Choice warranty tables`,
      detail: `${reclinerCatalog.warranty_reference.tables.map((table) => `${table.product_group}: terms shown ${table.terms_shown.join(', ')}`).join(' · ')} · ${(reclinerCatalog.warranty_reference.notes || []).join(' ')}`,
      code: 'Warranty',
    }] : []),
    ...(reclinerCatalog.warranty_reference && !reclinerCatalog.title?.includes('Designer’s Choice') ? [{
      kind: `${label} warranty reference`,
      title: `${reclinerCatalog.edition} ${label} warranty tables`,
      detail: `${reclinerCatalog.warranty_reference.tables
        ? reclinerCatalog.warranty_reference.tables.map((table) => `${table.product_group}: terms shown ${table.terms_shown.join(', ')}; components include ${table.components_listed.join(', ')}`).join(' · ')
        : `${JSON.stringify(reclinerCatalog.warranty_reference.terms_shown)} · groups: ${(reclinerCatalog.warranty_reference.groups || []).join(', ')} · components: ${(reclinerCatalog.warranty_reference.components || []).join(', ')}`}
        ${(reclinerCatalog.warranty_reference.notes || []).join(' ')}`,
      code: 'Warranty',
    }] : []),
    ...(reclinerCatalog.title?.includes('Designer’s Choice') ? (reclinerCatalog.models || []).flatMap((model) => [
      {
        kind: 'Designer’s Choice catalog model',
        title: `${model.name} · ${model.code}`,
        detail: `${reclinerCatalog.edition} Designer’s Choice catalog · pages ${model.pages.join(', ')}${model.coverage_status ? ` · coverage ${model.coverage_status}` : ''}${model.finishes ? ` · finishes standard ${model.finishes.standard.join(', ') || 'none'}, optional ${model.finishes.optional.join(', ') || 'none'}` : ''}${model.cover_cap_choices ? ` · cover cap choices ${Object.entries(model.cover_cap_choices).map(([material, caps]) => `${material}: ${caps.join(', ')}`).join('; ')}` : ''}${model.notes?.length ? ` · ${model.notes.join(' ')}` : ''}. Source catalog listing; it does not establish fit or user weight capacity.`,
        code: model.code,
        modelCode: model.code,
        sourcePages: model.pages,
      },
      ...model.styles.map(([style, category, dimensions, options, sourceNote]) => ({
        kind: 'Designer’s Choice catalog style',
        title: `${model.name} ${style}-${model.code}`,
        detail: `${category} · ${dimensions} in H × W × D · options ${options.join(', ')}${sourceNote ? ` · source note: ${sourceNote}` : ''} · ${reclinerCatalog.edition} Designer’s Choice catalog pages ${model.pages.join('/')}. Check the current price book for complete details.`,
        code: style,
        modelCode: model.code,
        sourcePages: model.pages,
      })),
    ]) : []),
    ...(collectionName === 'motion' ? (reclinerCatalog.models || []).flatMap((model) => [
      {
        kind: `${label} catalog model`,
        title: `${model.name} · ${model.code}`,
        detail: `${reclinerCatalog.edition} ${collectionName} catalog · pages ${model.pages.join(', ')} · groups ${model.product_groups.join(', ')}${model.notes?.length ? ` · ${model.notes.join(' ')}` : ''}. Source catalog listing; does not establish fit or user weight capacity.`,
        code: model.code,
        modelCode: model.code,
        sourcePages: model.pages,
      },
      ...model.styles.map(([style, category, dimensions, options, sourceNote]) => ({
        kind: `${label} catalog style`,
        title: `${model.name} ${style}-${model.code}`,
        detail: `${category} · ${dimensions} in H × W × D · options ${options.join(', ')}${sourceNote ? ` · source note: ${sourceNote}` : ''} · ${reclinerCatalog.edition} ${collectionName} catalog pages ${model.pages.join('/')}. Verify the current price book for complete details.`,
        code: style,
        modelCode: model.code,
        sourcePages: model.pages,
      })),
      ...(reclinerCatalog.source_documents?.length ? [{
        kind: `${label} catalog source`,
        title: `${reclinerCatalog.edition} ${collectionName} catalog source documents`,
        detail: `${reclinerCatalog.source_documents.map((source) => `${source.file}: ${source.pages}`).join(' · ')}${reclinerCatalog.publication_footer ? ` · ${reclinerCatalog.publication_footer}` : ''}`,
        code: reclinerCatalog.edition,
      }] : []),
    ]) : []),
    ...(reclinerCatalog.index || []).map((item) => ({
      kind: `${label} index entry`,
      title: `${item.name} · ${item.code}`,
      detail: `${collectionName === 'motion' ? 'Motion Collection' : collectionName === 'designers-choice' ? 'Designer’s Choice Collection' : 'Supplemental recliner'} Summer/Fall 2026 index · pages ${item.pages.join(', ')} · index-category flags: ${Object.entries(item.categories).filter(([, listed]) => listed).map(([category]) => category.replaceAll('_', ' ')).join(', ')}${item.new_introduction ? ' · marked NEW' : ''}. ${reclinerCatalog.source_note}`,
      code: item.code,
      modelCode: item.code,
      sourcePages: item.pages,
    })),
    ...(reclinerCatalog.prefix_definitions_additional || []).map(([code, description, family]) => ({
      kind: `${label} prefix definition`,
      title: `${code} · ${description}`,
      detail: `${family}; additional prefix definition from the ${reclinerCatalog.title?.includes('Designer’s Choice') ? 'Designer’s Choice' : collectionName} Summer/Fall 2026 index page.`,
      code,
    })),
    ...(reclinerCatalog.source_conflicts?.length ? [{
      kind: `${label} index source note`,
      title: `${label} catalog source differences`,
      detail: reclinerCatalog.source_conflicts.join(' '),
      code: 'Source note',
    }] : []),
    ...(reclinerCatalog.known_conflicts?.length ? [{
      kind: `${label} index source note`,
      title: `${label} catalog index discrepancies`,
      detail: reclinerCatalog.known_conflicts.join(' '),
      code: 'Source note',
    }] : []),
    ...((reclinerCatalog.pillow_collections || reclinerCatalog.pillow_styles || [])).map(([code, name, dimensions, options, quantity]) => ({
      kind: `${label} pillow collection`,
      title: `${code} · ${name}`,
      detail: `${dimensions} inches · option ${options} · quantity ${quantity} · ${reclinerCatalog.edition} ${collectionName} catalog.`,
      code,
    })),
  ];
  return entries;
}

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

const positiveMeasurement = (value) => {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 && number <= 40 ? number : null;
};

const widthMatchScore = (seatWidth, hipBreadth) => {
  const clearance = seatWidth - hipBreadth;
  if (clearance < 0 || clearance > 8) return 0;
  if (clearance >= 2 && clearance <= 5) return 1;
  return 0.7;
};

const depthMatchScore = (seatDepth, thighLength) => {
  const kneeGap = thighLength - seatDepth;
  if (kneeGap < 0 || kneeGap > 4.5) return 0;
  if (kneeGap >= 1.5 && kneeGap <= 3) return 1;
  return 0.6;
};

const heightMatchScore = (seatHeight, poplitealHeight) => {
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

export function getSectionalPrefix(piece, family) {
  const prefixes = piece.prefix.split('/').map((item) => item.trim());
  if (family === 'Stationary') return prefixes.find((item) => item.startsWith('60')) || null;
  if (family === 'La-Z-Motion') return prefixes.find((item) => item.startsWith('8')) || null;
  return prefixes.find((item) => !item.startsWith('8') && !item.startsWith('60')) || null;
}

export function sectionalPiecesForFamily(catalog, family, modelCode) {
  const profile = (catalog.product_profiles || []).find((item) => item.sectional_family === family && item.model_code === modelCode)
    || (family === 'La-Z-Motion' && !modelCode ? (catalog.product_profiles || []).find((item) => item.sectional_family === family) : null);
  if (profile) {
    return profile.pieces.map((piece) => {
      const codes = piece.code ? [piece.code] : (piece.variants || []).map((variant) => variant.code);
      return {
        family,
        key: piece.key,
        prefix: codes.join(' / '),
        modelCode: profile.model_code,
        variants: piece.variants || [],
        name: piece.name,
        type: piece.key.replaceAll('_', ' '),
        connectionType: piece.key.startsWith('LA_') ? 'left-arm' : piece.key.startsWith('RA_') ? 'right-arm' : piece.key === 'corner_wedge' || piece.key === 'corner_wedge_compact' ? 'corner' : piece.key.includes('armless') ? 'armless' : piece.key.includes('console') ? 'console' : 'middle',
        options: piece.options || piece.pricebook_options || [],
        dimensionsLabel: piece.dimensions_text
          ? `${profile.model_name}: ${piece.dimensions_text}${piece.fully_extended_in ? ` · fully extended ${piece.fully_extended_in}"` : ''}${piece.pricebook_dimensions_text ? ` · pricebook dimensions ${piece.pricebook_dimensions_text}` : ''}${piece.dimensions_conflict_note ? ` (${piece.dimensions_conflict_note})` : ''}${piece.dimensions_note ? ` (${piece.dimensions_note})` : ''} · ${profile.source}${piece.pricebook_dimensions_text ? `; ${profile.additional_source} (${profile.additional_source_edition})` : ''}${profile.product_guide_measurements ? `; Product Information Guide ${profile.product_guide_measurements.edition} · ${Object.entries(profile.product_guide_measurements.rows).filter(([style]) => codes.some((code) => style.startsWith(`${code}${profile.model_code}`))).map(([style, values]) => `${style} ${values.map((value, index) => value == null ? null : `${profile.product_guide_measurements.columns[index]} ${value}`).filter(Boolean).join(', ')}`).join('; ')}` : ''}`
          : '',
        footprintLabels: (profile.configuration_diagram_dimension_labels_in || []).join(' · '),
        footprintNote: profile.configuration_diagram_dimension_note || '',
      };
    });
  }

  const name = family === 'Stationary' ? 'Stationary Modular' : family === 'La-Z-Motion' ? 'La-Z-Motion (e.g., Acadia 811)' : 'La-Z-Time Motion';
  const listedPieces = Object.entries(catalog.modular_sectional_prefixes[name] || {});
  const configuredPieces = (catalog.product_profiles || []).filter((item) => item.sectional_family === family && item.model_code === modelCode).flatMap((item) => item.pieces.map((piece) => {
    const prefix = piece.code || (piece.variants || []).map((variant) => variant.code).join(' / ');
    return [piece.key, prefix, item.model_code, item.model_name];
  }));
  const basePieces = listedPieces.map(([key, prefix]) => [key, { prefix, profileModelCode: modelCode, modelName: '' }]);
  const mergedPieces = [...new Map([...basePieces, ...configuredPieces.map(([key, prefix, profileModelCode, modelName]) => [key, { prefix, profileModelCode, modelName }])]).entries()];
  const selectedProfile = (catalog.product_profiles || []).find((item) => item.sectional_family === family && item.model_code === modelCode);
  return mergedPieces.map(([key, details]) => {
    const piece = selectedProfile?.pieces.find((item) => item.key === key);
    return {
      family,
      key,
      prefix: details.prefix,
      modelCode: details.profileModelCode || modelCode,        name: piece?.name || key.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
        type: key.replaceAll('_', ' '),
        connectionType: key.startsWith('LA_') ? 'left-arm' : key.startsWith('RA_') ? 'right-arm' : key === 'corner_wedge' || key === 'corner_wedge_compact' ? 'corner' : key.includes('armless') ? 'armless' : key.includes('console') ? 'console' : 'middle',
        options: piece?.options || piece?.pricebook_options || [],
        dimensionsLabel: piece?.dimensions_text ? `${selectedProfile.model_name}: ${piece.dimensions_text}${piece.fully_extended_in ? ` · fully extended ${piece.fully_extended_in} inches` : ''} · ${selectedProfile.source}` : '',
      footprintLabels: (selectedProfile?.configuration_diagram_dimension_labels_in || []).join(' · '),
      footprintNote: selectedProfile?.configuration_diagram_dimension_note || '',
    };
  });
}

const RMS_CATALOGS = ['stationary_catalog_2026', 'motion_catalog_2026', 'designers_choice_catalog_2026', 'recliner_catalog_2026'];
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
function leatherBandOpen(record, rows) {
  const band = String(record.coverCode || '').slice(0, 2);
  const key = band === 'LB' ? 'selectLeather' : band;
  const withBands = rows.filter((row) => row.bands?.length);
  return !withBands.length || withBands.some((row) => row.bands.includes(key));
}
const GUIDE_RESTRICTED_FAMILY = /^(MOTION|RECLINER|MODULAR|LIFT)$/;

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

export function buildRmsSkuPreview({ group = '', style = '', grade = '', pattern = '', color = '', finish = '', options = [], includeFinish = false }) {
  const fields = [['Group', group], ['Style', style], ['Grade', grade], ['Pattern', pattern], ['Color', color]];
  const digits = (value, length) => String(value).length === length && [...String(value)].every((digit) => digit >= '0' && digit <= '9');
  const fabricSegment = grade && digits(pattern, 4) && digits(color, 2) ? `${grade}${pattern}${color}` : '';
  const identifiers = group && style ? `${group}-${style}` : '';
  const beforeFinish = options.filter((code) => code === 'ES');
  const afterFinish = options.filter((code) => code !== 'ES');
  const hasCore = Boolean(/^[A-Z0-9]{2,4}$/i.test(group) && /^[A-Z0-9]{2,4}$/i.test(style) && /^[A-Z]{1,3}$/.test(grade) && digits(pattern, 4) && digits(color, 2));
  const hasRequiredFinish = !includeFinish || Boolean(finish);
  const sku = hasCore && hasRequiredFinish ? [identifiers, fabricSegment, ...beforeFinish, ...(includeFinish ? ['FN', finish] : []), ...afterFinish].filter(Boolean).join(' ') : '';
  return { group, style, grade, pattern, color, finish, options, fields, sku, complete: Boolean(sku) };
}

export function encodeRmsSku({ prefix, modelCode, cover, patternCode = '2035', colorFamily = '3', colorShade = '1', optionCodes = [], finish = '007', trimCode = '', pillowCover = '', includePillow = false }) {
  const skuCover = cover === 'DP' ? 'D' : cover;
  const patternValue = String(patternCode);
  const patternAndColor = patternValue.length >= 6 ? patternValue : patternValue.length === 4 && patternValue.endsWith(`${colorFamily}${colorShade}`) ? patternValue : `${patternValue}${colorFamily}${colorShade}`;
  const coverPart = `${skuCover}${patternAndColor}`;
  const options = [...new Set([trimCode, ...optionCodes, ...(includePillow ? ['FP', 'P1'] : [])].filter(Boolean))];
  const beforeFinish = options.filter((code) => code === 'ES');
  const afterFinish = options.filter((code) => code !== 'ES');
  const validPattern = /^[A-Z]{1,3}\d{6}$/.test(coverPart);
  if (!prefix || !modelCode || !validPattern || (!finish && options.includes('FN'))) return '';
  return [`${prefix}${modelCode}`, coverPart, ...beforeFinish, ...(finish ? ['FN', finish] : []), ...afterFinish].join(' ');
}

export function findLiftTier(catalog, weight, modelCode) {
  if (!weight || Number(weight) <= 0) return null;
  const tier = catalog.lift_chair_weight_tiers.find((item) => !modelCode || item.model_code === modelCode);
  return tier && Number(weight) <= tier.limit_lbs ? tier : null;
}

export function findCompatibleBattery(catalog, prefix, code) {
  const item = catalog.style_prefixes.find((entry) => entry.code === prefix);
  const pack = catalog.battery_packs.find((entry) => entry.code === code);
  if (!item || !pack) return false;
  return item.battery_pack === code;
}

function catalogModelStyle(catalog, modelCode, styleCode) {
  for (const key of ['recliner_catalog_2026', 'motion_catalog_2026', 'designers_choice_catalog_2026']) {
    const model = catalog[key]?.models?.find((entry) => String(entry.code) === String(modelCode));
    const style = model?.styles?.find((entry) => String(entry[0]) === String(styleCode));
    if (style) return { model, style, source: catalog[key].title };
  }
  const product = catalog.stationary_catalog_2026?.products?.find((entry) => String(entry.model_code) === String(modelCode));
  for (const group of product?.catalog_groups || []) {
    const style = group.styles?.find((entry) => String(entry.style_code).split('-')[0] === String(styleCode));
    if (style) return { model: product, style, source: catalog.stationary_catalog_2026.title, group };
  }
  return null;
}

function findCatalogStyleCode(catalog, modelCode, styleCode) {
  const match = catalogModelStyle(catalog, modelCode, styleCode);
  if (match) return { ...match, status: 'documented' };
  const profile = (catalog.product_profiles || []).find((entry) => String(entry.model_code) === String(modelCode));
  const piece = profile?.pieces?.find((entry) => [entry.code, ...(entry.variants || []).map((variant) => variant.code)].filter(Boolean).some((code) => String(code).split('/').map((part) => part.trim()).includes(styleCode)));
  return piece ? { model: { code: modelCode, name: profile.model_name }, style: [styleCode, piece.name, []], source: profile.source, status: 'tear_pad_piece_only' } : null;
}

function optionDescription(catalog, code, source = '') {
  const motion = (catalog.motion_catalog_2026?.options || []).find(([option]) => option === code);
  if (/Motion Collection/i.test(source) && motion) return motion[1];
  const recliner = catalog.recliner_catalog_2026?.options?.find?.(([option]) => option === code);
  if (/Recliner Collection/i.test(source) && recliner) return recliner[1];
  const suffix = catalog.option_suffixes?.find((entry) => entry.code === code);
  if (suffix) return suffix.name;
  if (motion) return motion[1];
  const stationary = catalog.stationary_catalog_2026?.options?.find((entry) => entry.code === code);
  if (stationary) return stationary.name;
  return recliner?.[1] || null;
}

function catalogOptionIsSupported(found, code) {
  if (!found) return false;
  if (found.style?.[3] && Array.isArray(found.style[3])) return found.style[3].includes(code);
  if (found.style?.[2] && Array.isArray(found.style[2])) return found.style[2].includes(code);
  return found.style?.options?.includes?.(code) || false;
}

/** Split a joined head such as "10X724" into style + model, only when exactly one split is documented. */
function splitJoinedSkuHead(catalog, head) {
  if (!/^[A-Z0-9]{5,8}$/.test(head)) return null;
  const hits = [];
  for (let index = 2; index <= 4 && index < head.length - 1; index += 1) {
    const styleCode = head.slice(0, index);
    const modelCode = head.slice(index);
    const styleListed = (catalog.style_prefixes || []).some((entry) => entry.code === styleCode);
    const modelListed = (catalog.models_database || []).some((entry) => String(entry.model_code) === modelCode);
    if (findCatalogStyleCode(catalog, modelCode, styleCode) || (styleListed && modelListed)) hits.push({ styleCode, modelCode });
  }
  if (hits.length === 1) return hits[0];
  return hits.length > 1 ? { ambiguous: hits } : null;
}

/** Decode only identifiers present in supplied catalogs; unresolved fields stay explicitly unresolved. */
export function decodeRmsSku(input, catalog) {
  const raw = String(input ?? '').trim();
  const tokens = raw.split(/\s+/).filter(Boolean);
  const head = tokens[0] || '';
  const hyphenPair = head.match(/^([A-Z0-9]+)-([A-Z0-9]+)$/i);
  const joined = hyphenPair ? null : splitJoinedSkuHead(catalog, head.toUpperCase());
  const pair = hyphenPair || (joined?.styleCode ? joined : null);
  const styleCode = hyphenPair?.[1]?.toUpperCase() || joined?.styleCode || '';
  const modelCode = hyphenPair?.[2]?.toUpperCase() || joined?.modelCode || '';
  const stylePrefix = catalog.style_prefixes?.find((entry) => entry.code === styleCode);
  const found = modelCode && styleCode ? findCatalogStyleCode(catalog, modelCode, styleCode) : null;
  const model = (catalog.models_database || []).find((entry) => String(entry.model_code) === modelCode)
    || found?.model || null;
  const modelName = found?.model?.name || found?.model?.model_name || model?.model_name || null;
  const style = {
    code: styleCode || null,
    name: stylePrefix?.motion_type || found?.style?.[1] || null,
    status: stylePrefix || found ? 'documented' : 'unresolved',
    source: found?.source || (stylePrefix ? 'Catalog style-prefix reference' : null),
  };
  const modelResult = { code: modelCode || null, name: modelName, status: model ? 'documented' : 'unresolved', source: found?.source || (model ? 'Master product catalog' : null) };
  const coverTokenIndex = tokens.findIndex((token, index) => index > 0 && /^[A-Z]{1,3}\d{6}$/i.test(token));
  const coverToken = coverTokenIndex >= 0 ? tokens[coverTokenIndex].toUpperCase() : '';
  const coverRecord = coverToken && (catalog.cover_cap_codes || []).find((entry) => entry.code === coverToken.match(/^[A-Z]{1,3}/)?.[0]);
  const patternCode = coverToken.match(/^[A-Z]{1,3}(\d{4})(\d{2})$/)?.[1] || null;
  const colorCode = coverToken.match(/^[A-Z]{1,3}(\d{4})(\d{2})$/)?.[2] || null;
  const swatchCollections = (catalog.stationary_catalog_2026?.products || []).flatMap((product) => (product.catalog_groups || []).flatMap((group) => group.fabric_collections || []));
  const matchedCollection = swatchCollections.find((collection) => (collection.swatches || []).some(([swatch]) => String(swatch) === patternCode + colorCode));
  const colorMatch = patternCode && colorCode ? (matchedCollection?.swatches || []).find(([swatch]) => String(swatch) === patternCode + colorCode) : null;
  const programCovers = [...(catalog.fabric_cover_program_a26?.fabrics || []), ...(catalog.fabric_cover_program_a26?.leathers || [])];
  const programGrade = coverToken.match(/^[A-Z]{1,3}/)?.[0] || null;
  const aprilRecord = programGrade && patternCode ? programCovers.find((record) => record.coverCode === `${programGrade}${patternCode}`) : null;
  const priorSeason = catalog.fabric_cover_program_a26?.priorSeason;
  const priorRecord = programGrade && patternCode && !aprilRecord?.colors?.includes(colorCode) ? [...(priorSeason?.fabrics || []), ...(priorSeason?.leathers || [])].find((record) => record.coverCode === `${programGrade}${patternCode}` && record.colors.includes(colorCode)) : null;
  const programRecord = priorRecord || aprilRecord;
  const programSeason = programRecord ? (priorRecord ? priorSeason.label : 'April 2026') : null;
  const programGradeKnown = Boolean(programGrade) && programCovers.some((record) => record.coverCode.match(/^[A-Z]+/)?.[0] === programGrade);
  const cover = coverToken ? {
    program_pattern_name: programRecord?.patternName || null,
    program_color_name: programRecord?.colorNames?.[colorCode] || null,
    program_cap_code: programRecord?.capCode || null,
    program_season: programSeason,
    program_note: priorRecord ? `${priorSeason.label} program, not on the April 2026 list. Confirm it can still be ordered.` : null,
    raw: coverToken,
    grade: coverToken.match(/^[A-Z]{1,3}/)?.[0] || null,
    pattern: patternCode,
    color: colorCode,
    cap_name: coverRecord?.name || null,
    swatch_name: colorMatch?.[1] ? colorMatch[1] : null,
    swatch_source: colorMatch ? matchedCollection?.name || 'Stationary catalog swatch' : null,
    status: colorMatch || coverRecord ? 'partially_resolved_from_catalog' : 'digits_parsed_name_unresolved',
    note: colorMatch ? 'Pattern/color digits matched a supplied catalog swatch record; verify the source collection and exact model eligibility.' : 'Grade/pattern/color digits parsed from the SKU string. A pattern/color name was not confirmed in the supplied swatch data.',
  } : { raw: null, grade: null, pattern: null, color: null, status: 'unresolved', note: 'No complete cover segment was found.' };
  const claims = [];
  const physicalFeatures = [];
  if (style.name) physicalFeatures.push(style.name);
  if (coverToken) physicalFeatures.push(`Cover identifier ${coverToken}${programRecord ? ` · ${programRecord.patternName}${programRecord.colorNames?.[colorCode] ? ` ${programRecord.colorNames[colorCode]}` : ''} (${priorRecord ? `${priorSeason.label} program, not on the April 2026 list` : 'A26 program'}, cap ${programRecord.capCode})` : ''}${coverRecord?.name ? ` (${coverRecord.name})` : ''}${coverRecord ? ` · ${coverRecord.type || coverRecord.category || 'material type not specified'}` : ''}${colorMatch ? ` · swatch ${colorMatch[1]} from ${matchedCollection?.name || 'supplied Stationary catalog'}` : ' (pattern/color names not resolved)'}`);
  for (let index = 1; index < tokens.length; index += 1) {
    const code = tokens[index].toUpperCase();
    if (index === coverTokenIndex) continue;
    if (code === 'FN' && tokens[index + 1]) {
      const finishCode = tokens[index + 1].toUpperCase();
      const finish = catalog.wood_finishes?.find((entry) => entry.code === finishCode);
      const supported = catalogOptionIsSupported(found, 'FN');
      const status = !finish ? 'unresolved_finish_code' : supported ? 'documented' : 'not_listed_for_exact_style';
      claims.push({ code: 'FN', value: finishCode, description: finish?.name || 'Finish name unresolved', status });
      if (supported && finish) physicalFeatures.push(`${finish.name} finish`);
      index += 1;
      continue;
    }
    const description = optionDescription(catalog, code, found?.source || '');
    if (!description) {
      claims.push({ code, description: 'No option description in supplied catalogs', status: 'unresolved' });
      continue;
    }
    const supported = catalogOptionIsSupported(found, code);
    const status = !found ? 'style_not_resolved' : supported ? 'documented' : 'not_listed_for_exact_style';
    claims.push({ code, description, status });
    if (supported) physicalFeatures.push(description);
  }
  const warnings = [];
  if (joined?.ambiguous) warnings.push(`The start of this SKU could be read more than one way (${joined.ambiguous.map((hit) => `${hit.styleCode}-${hit.modelCode}`).join(' or ')}). Enter it as PREFIX-MODEL to decode it.`);
  else if (!pair) warnings.push('Expected a documented prefix and model, such as 10X724 or 10X-724.');
  if (!stylePrefix && !found) warnings.push(`Style ${styleCode || '(missing)'} is not resolved in the supplied references.`);
  if (!model) warnings.push(`Model ${modelCode || '(missing)'} is not resolved in the supplied references.`);
  if (claims.some((claim) => claim.status === 'not_listed_for_exact_style')) warnings.push('One or more options are not listed for this exact style; they are not included in the physical-feature summary.');
  if (!coverToken) warnings.push('Cover material, pattern, and color have not been resolved.');
  else if (programCovers.length && !programGradeKnown) warnings.push(`Grade ${programGrade} is not in the supplied A26 cover program, so its name and cap code are unresolved. Confirm the cover in RMS.`);
  else if (priorRecord) warnings.push(`Cover ${coverToken} is from the ${priorSeason.label} program and is not on the April 2026 list. Confirm in RMS that it can still be ordered for this model.`);
  else if (programCovers.length && !programRecord) warnings.push(`Pattern ${programGrade}${patternCode} is not in the supplied A26 cover program. Confirm the cover in RMS.`);
  return {
    input: raw,
    style,
    model: modelResult,
    cover,
    finish: claims.find((claim) => claim.code === 'FN') || null,
    claims,
    physicalFeatures,
    warnings,
    orderStatus: !raw ? 'incomplete' : found && stylePrefix ? 'requires_order_system_verification' : 'partially_unresolved',
    orderable: false,
    disclaimer: 'Reference decoder only. Confirm exact configuration, current availability, and orderability in the live ordering system.',
  };
}

const sectionalPieceCodes = (piece) => [piece.code, ...(piece.variants || []).map((variant) => variant.code)]
  .filter(Boolean).flatMap((value) => String(value).split('/').map((code) => code.trim()));

export function getSectionalPieceOptions(catalog, family, modelCode, pieceCode) {
  const profile = (catalog.product_profiles || []).find((entry) => String(entry.model_code) === String(modelCode) && entry.sectional_family === family);
  if (!profile || !pieceCode || !sectionalPieceCodes(profile.pieces.find((piece) => sectionalPieceCodes(piece).includes(pieceCode)) || {}).includes(pieceCode)) return [];
  const motion = catalog.motion_catalog_2026?.models?.find((entry) => String(entry.code) === String(modelCode));
  const motionStyle = motion?.styles?.find((style) => String(style[0]) === pieceCode);
  if (motionStyle) return [...new Set(motionStyle[3] || [])];
  const stationary = catalog.stationary_catalog_2026?.products?.find((entry) => String(entry.model_code) === String(modelCode));
  for (const group of stationary?.catalog_groups || []) {
    const style = group.styles?.find((entry) => String(entry.style_code).split('-')[0] === pieceCode);
    if (style) return [...new Set(style.options || [])];
  }
  const tearPadPiece = profile.pieces.find((piece) => sectionalPieceCodes(piece).includes(pieceCode));
  return [...new Set(tearPadPiece?.pricebook_options || [])];
}

/** Covers every placed piece can be built in: the swatches the guide allows for each piece's exact style, kept only where all pieces agree. */
export function getSharedCoverSwatches(catalog, pieces) {
  const keys = [...new Set((pieces || []).map((piece) => `${piece.code}|${piece.modelCode}`))];
  if (!keys.length) return [];
  const lists = keys.map((key) => { const [code, model] = key.split('|'); return getModelCoverSwatches(catalog, model, code); });
  return lists[0].filter((cover) => lists.every((list) => list.some((item) => item.code === cover.code)));
}

export function buildSectionalStudioRmsLine(piece, cover, pattern, color, options = []) {
  return `${piece.code}-${piece.modelCode} ${cover}${pattern}${color}${options.length ? ` ${options.join(' ')}` : ''}`;
}

export function validateSectionalStudioLayout(items, room, catalog) {
  const pieces = Array.isArray(items) ? items : [];
  const errors = [];
  const warnings = [];
  if (!pieces.length) return { valid: false, errors: ['Add a piece to the floor plan.'], warnings };
  const bounds = room || { width: 900, height: 600 };
  const edges = pieces.map(() => []);
  // Plans are drawn to true size, so connected pieces sit edge to edge; allow only 2 in of float.
  const gap = 2;
  const near = (a, b) => Math.abs(a - b) <= gap;
  const shared = (a1, a2, b1, b2) => Math.min(a2, b2) - Math.max(a1, b1) > gap;

  for (const [index, piece] of pieces.entries()) {
    if (piece.x < 0 || piece.y < 0 || piece.x + piece.width > bounds.width || piece.y + piece.height > bounds.height) {
      errors.push(`${piece.name || piece.code} extends beyond the room boundary.`);
    }
    for (let otherIndex = 0; otherIndex < index; otherIndex += 1) {
      const other = pieces[otherIndex];
      const overlapX = Math.min(piece.x + piece.width, other.x + other.width) - Math.max(piece.x, other.x);
      const overlapY = Math.min(piece.y + piece.height, other.y + other.height) - Math.max(piece.y, other.y);
      if (overlapX > 2 && overlapY > 2) errors.push(`${piece.name || piece.code} overlaps ${other.name || other.code}.`);
      const verticalTouch = (near(piece.x + piece.width, other.x) || near(other.x + other.width, piece.x))
        && shared(piece.y, piece.y + piece.height, other.y, other.y + other.height);
      const horizontalTouch = (near(piece.y + piece.height, other.y) || near(other.y + other.height, piece.y))
        && shared(piece.x, piece.x + piece.width, other.x, other.x + other.width);
      if (verticalTouch || horizontalTouch) {
        const direction = verticalTouch ? (other.x > piece.x ? 'right' : 'left') : (other.y > piece.y ? 'down' : 'up');
        const opposite = { right: 'left', left: 'right', up: 'down', down: 'up' }[direction];
        edges[index].push({ index: otherIndex, axis: verticalTouch ? 'horizontal' : 'vertical', direction });
        edges[otherIndex].push({ index, axis: verticalTouch ? 'horizontal' : 'vertical', direction: opposite });
      }
    }
  }

  const category = (piece) => {
    const key = String(piece.key || '');
    if (/^LA_/.test(key)) return 'left';
    if (/^RA_/.test(key)) return 'right';
    if (/corner/i.test(key)) return 'corner';
    if (/armless/i.test(key)) return 'middle';
    if (/console/i.test(key)) return 'console';
    return 'other';
  };
  const modelCodes = new Set(pieces.map((piece) => String(piece.modelCode)));
  const families = new Set(pieces.map((piece) => piece.family));
  if (modelCodes.size > 1 || families.size > 1) errors.push('A floor plan must use pieces from one collection/model.');
  const profile = catalog?.product_profiles?.find((entry) => String(entry.model_code) === String(pieces[0]?.modelCode) && entry.sectional_family === pieces[0]?.family);
  if (catalog && !profile) errors.push('The selected model/family has no matching catalog profile.');
  for (const piece of pieces) {
    const sourcePiece = profile?.pieces?.find((entry) => entry.key === piece.key);
    const sourceCodes = sourcePiece ? [sourcePiece.code, ...(sourcePiece.variants || []).map((variant) => variant.code)].filter(Boolean).flatMap((code) => String(code).split('/').map((part) => part.trim())) : [];
    if (catalog && !sourceCodes.includes(piece.code)) errors.push(`${piece.code || 'Unknown piece'} is not listed for model ${piece.modelCode || '(missing)'}.`);
  }
  for (const [index, piece] of pieces.entries()) {
    const role = category(piece);
    const neighbors = edges[index];
    if (role === 'left' || role === 'right') {
      if (neighbors.length > 1) errors.push(`${piece.code} is an end piece and cannot connect in the middle of a run.`);
      const rotation = ((piece.rotation || 0) % 360 + 360) % 360;
      // "Left-arm" means the arm is on the left of the person sitting. Seen from above with the seat facing down,
      // that arm is on the right of the drawing, so a left-arm piece joins its neighbour on the left of the drawing.
      const leftConnection = { 0: 'left', 90: 'up', 180: 'right', 270: 'down' }[rotation];
      const rightConnection = { 0: 'right', 90: 'down', 180: 'left', 270: 'up' }[rotation];
      const expected = role === 'left' ? leftConnection : rightConnection;
      if (neighbors.length === 1 && neighbors[0].direction !== expected) errors.push(`${piece.code} ${role === 'left' ? 'left-arm' : 'right-arm'} piece is facing the wrong direction for this end.`);
      if (role === 'left' && neighbors.some(({ index: n }) => category(pieces[n]) === 'left')) errors.push('Left-arm terminal pieces cannot join each other.');
      if (role === 'right' && neighbors.some(({ index: n }) => category(pieces[n]) === 'right')) errors.push('Right-arm terminal pieces cannot join each other.');
    } else if (role === 'corner') {
      if (neighbors.length !== 2) errors.push(`${piece.code} corner must connect at exactly one vertex between two runs.`);
      if (neighbors.length === 2 && neighbors[0].axis === neighbors[1].axis) {
        errors.push(`${piece.code} corner cannot sit in the middle of a straight run; connect it at a 90° junction.`);
      }
    } else if (role === 'middle') {
      const validNeighbors = neighbors.length === 2 && neighbors.every(({ index: n }) => ['left', 'right', 'corner'].includes(category(pieces[n])));
      if (!validNeighbors) errors.push(`${piece.code} armless piece must sit between two terminal pieces or a terminal and corner.`);
    } else if (role === 'console') {
      if (neighbors.length === 0 || neighbors.length > 2 || neighbors.some(({ index: n }) => category(pieces[n]) === 'other')) {
        errors.push(`${piece.code} console must connect to modular seating at an end or between compatible seats.`);
      }
    }
  }
  if (!errors.length) warnings.push('Spatial checks pass; verify the exact connection plan against the collection tear pad and current dealer ordering guide.');
  else warnings.push('Only indexed piece identity is source-backed. Adjust the plan and confirm the final connection topology with the tear pad.');
  return { valid: errors.length === 0, errors: [...new Set(errors)], warnings, pieceCount: pieces.length, status: errors.length ? 'needs_changes' : 'draft_requires_order_guide_check' };
}

export function matchDocumentedSectionalLayout(items, catalog) {
  if (!Array.isArray(items) || !items.length) return null;
  const { modelCode } = items[0];
  const profile = (catalog.product_profiles || []).find((entry) => String(entry.model_code) === String(modelCode));
  return profile?.configuration_layouts?.find((layout) => layout.piece_callouts?.length === items.length && layout.piece_callouts.every((code, index) => code === items[index].code)) || null;
}

/** Validate only source-backed identity and the explicit armless-recliner adjacency rule. */
export function validateSectionalConfiguration(items, catalog) {
  const pieces = Array.isArray(items) ? items : [];
  const errors = [];
  const warnings = [];
  if (!pieces.length) errors.push('Add at least one piece to the configuration.');
  const models = new Set(pieces.map((piece) => String(piece.modelCode)));
  const families = new Set(pieces.map((piece) => piece.family));
  if (models.size > 1) errors.push('Every piece in one configuration must use the same model code.');
  if (families.size > 1) errors.push('Every piece in one configuration must use the same sectional family.');
  for (const [index, item] of pieces.entries()) {
    const category = catalog.style_prefixes?.find((entry) => entry.code === item.code)?.category || '';
    if (index === 0 && /right-arm/i.test(category)) errors.push('Start the sequence with a left-arm piece or compare the pieces with a published layout.');
    if (index === pieces.length - 1 && /left-arm/i.test(category)) errors.push('Finish the sequence with a right-arm piece or compare the pieces with a published layout.');
    if (index > 0) {
      const previousCategory = catalog.style_prefixes?.find((entry) => entry.code === pieces[index - 1].code)?.category || '';
      if (/left-arm/i.test(previousCategory) && /left-arm/i.test(category)) errors.push('Two left-arm end pieces are adjacent; confirm a published arrangement before proceeding.');
      if (/right-arm/i.test(previousCategory) && /right-arm/i.test(category)) errors.push('Two right-arm end pieces are adjacent; confirm a published arrangement before proceeding.');
    }
  }
  const profile = (catalog.product_profiles || []).find((entry) => String(entry.model_code) === String(pieces[0]?.modelCode) && entry.sectional_family === pieces[0]?.family);
  if (!profile && pieces.length) errors.push('The selected model/family has no matching source profile.');
  for (const [index, item] of pieces.entries()) {
    const sourcePiece = profile?.pieces?.find((piece) => sectionalPieceCodes(piece).includes(item.code));
    if (!sourcePiece) errors.push(`${item.code || 'Unknown piece'} is not listed for model ${item.modelCode || '(missing)'}.`);
    if (/^(44S|U4S|X4S)$/.test(item.code) && (index === 0 || index === pieces.length - 1)) {
      errors.push(`${item.code} armless recliner must be flanked by a piece on both sides.`);
    }
  }
  if (profile?.configuration_layouts?.length) warnings.push('The source tear pad lists named layouts; this sequence is a draft, not a manufacturer-confirmed connection plan. Compare the finished arrangement with a documented layout or current dealer ordering guide.');
  else warnings.push('No source-backed connector/topology rules are indexed for this model; the sequence is not certified as a compatible arrangement.');
  return { valid: errors.length === 0, errors, warnings, pieceCount: pieces.length, profile, status: errors.length ? 'needs_changes' : 'draft_requires_order_guide_check' };
}

export const PRODUCT_INDEX_GROUPS = ['All', 'Recliners', 'Stationary', 'Sectionals', 'Motion', 'Lift chairs'];

/** Categories worth showing a salesperson; drops bookkeeping labels such as catalog, index or supplement notes. */
export function cleanIndexCategories(categories = []) {
  const noise = /catalog|index|supplement|verify|april|summer|fall|winter|spring|designer.?s choice|^product$/i;
  return [...new Set(categories.flatMap((entry) => String(entry).split('/')).map((part) => part.trim()).filter((part) => part && !noise.test(part)))];
}

/** Which browse groups a product belongs to, from its categories and style labels. */
export function indexGroupsFor(product) {
  const text = `${(product.categories || []).join(' ')} ${(product.styles || []).map((style) => style.label).join(' ')}`.toLowerCase();
  const groups = [];
  if (/recliner|rocker|swivel glider|wall.?hugger/.test(text)) groups.push('Recliners');
  if (/stationary|sofa|loveseat|accent chair|ottoman/.test(text)) groups.push('Stationary');
  if (/sectional|modular|corner|chaise|armless/.test(text)) groups.push('Sectionals');
  if (/motion|power|reclining/.test(text)) groups.push('Motion');
  if (/lift/.test(text)) groups.push('Lift chairs');
  return groups;
}

export const MODEL_SECTIONS = ['Recliners', 'Motion sofas & loveseats', 'Lift chairs', 'High-leg designer', 'Sectionals & modulars', 'Stationary seating', 'Other models'];
const sectionOfCategory = (category = '', family = '') => {
  if (/lift/i.test(category) || family === 'LIFT') return 'Lift chairs';
  if (/high leg/i.test(category)) return 'High-leg designer';
  if (/reclining (wall )?(sofa|loveseat)|reclining.*(sofa|loveseat)/i.test(category)) return 'Motion sofas & loveseats';
  if (/sectional|corner unit|armless|wedge|chaise|sitting|console/i.test(category) || family === 'MODULAR' || family === 'SECTIONAL') return 'Sectionals & modulars';
  if (/recliner|rocking|glid|swivel/i.test(category)) return 'Recliners';
  if (/sofa|loveseat|chair|sleep|ottoman|table|bench/i.test(category)) return 'Stationary seating';
  return 'Other models';
};
const sectionCache = new WeakMap();
/** One browse section per model, taken from the guide's own style categories (the section most of its styles fall in). Models the guide does not list use their catalog category text. */
export function getModelSection(catalog, modelCode, fallbackCategory = '') {
  if (!sectionCache.has(catalog)) {
    const byModel = new Map();
    for (const row of catalog.style_index_2026?.styles || []) {
      if (row.kind !== 'style') continue;
      const tally = byModel.get(row.model) || {};
      const section = sectionOfCategory(row.category, row.family);
      tally[section] = (tally[section] || 0) + 1;
      byModel.set(row.model, tally);
    }
    sectionCache.set(catalog, new Map([...byModel].map(([model, tally]) => [model, MODEL_SECTIONS.filter((name) => tally[name]).sort((a, b) => tally[b] - tally[a] || MODEL_SECTIONS.indexOf(a) - MODEL_SECTIONS.indexOf(b))[0]])));
  }
  return sectionCache.get(catalog).get(String(modelCode)) || sectionOfCategory(fallbackCategory);
}
/** Groups a list of models into MODEL_SECTIONS order, each section sorted by name. */
export function groupModelsBySection(catalog, models, nameOf = (item) => item.model_name, codeOf = (item) => item.model_code, categoryOf = (item) => item.category) {
  const groups = new Map(MODEL_SECTIONS.map((name) => [name, []]));
  for (const item of models) groups.get(getModelSection(catalog, codeOf(item), categoryOf(item) || ''))?.push(item);
  return MODEL_SECTIONS.map((name) => ({ name, items: groups.get(name).sort((a, b) => String(nameOf(a)).localeCompare(String(nameOf(b)))) })).filter((group) => group.items.length);
}

const RESTRICTED_DUTY_CATEGORY = /recliner|motion|la-z-time/i;

/**
 * Every full cover (grade + pattern + colour) a model can be built with, from the supplied catalogs and the April 2026 cover program.
 * `basis` says how each one was matched: "listed" (the model's own catalog page or leather list) or "cap code" (the model accepts that cap code).
 * Eligibility for the exact style still has to be confirmed before it is promised.
 */
export function getModelCoverSwatches(catalog, modelCode, prefix) {
  const code = String(modelCode);
  const guideRows = getGuideStyleRows(catalog, modelCode);
  const guideRow = prefix ? guideRows.find((row) => row.prefix === String(prefix)) : null;
  const guideCaps = new Set((guideRow ? [guideRow] : guideRows).flatMap((row) => row.capCodes));
  const guided = guideRows.length > 0;
  if (!guided && catalog?.style_index_2026?.styles?.length) return [];
  const program = catalog?.fabric_cover_program_a26;
  const found = new Map();
  const add = (entry) => { if (entry?.code && !found.has(entry.code)) found.set(entry.code, entry); };
  const parse = (full) => { const match = String(full).match(/^([A-Z]{1,3})(\d{4})(\d{2})$/); return match ? { grade: match[1], pattern: match[2], color: match[3] } : null; };
  const programByPattern = new Map();
  for (const record of [...(program?.fabrics || []), ...(program?.leathers || [])]) programByPattern.set(String(record.patternName || '').toLowerCase(), [...(programByPattern.get(String(record.patternName || '').toLowerCase()) || []), record]);
  const capName = (cap) => (catalog?.cover_cap_codes || []).find((entry) => entry.code === cap && !/^[A-Z]{2} cap code$/.test(entry.name))?.name || `${cap} cap code`;
  const kindOf = (record, material) => (record.leatherType ? `${record.leatherType} leather` : material === 'Leather' ? 'Leather' : capName(record.capCode));
  const fromRecord = (record, basis, material) => (record.colors || []).forEach((color) => {
    const full = `${record.coverCode}${color}`;
    const parts = parse(full);
    if (!parts) return;
    add({ code: full, ...parts, patternName: record.patternName || '', colorName: record.colorNames?.[color] || '', name: `${record.patternName || record.coverCode}${record.colorNames?.[color] ? ` ${record.colorNames[color]}` : ''}`, capCode: record.capCode, kind: kindOf(record, material), material, wearability: record.wearability || '', cleaning: record.cleaningCode || '', basis, note: material });
  });

  // 1. Covers the model's own catalog page names, with colours.
  const stationary = catalog?.stationary_catalog_2026?.products?.find((item) => String(item.model_code) === code);
  for (const group of stationary?.catalog_groups || []) for (const collection of group.fabric_collections || []) for (const [full, name] of collection.swatches || []) {
    const parts = parse(full);
    if (parts) add({ code: full, ...parts, patternName: collection.name, colorName: name, name: `${collection.name} ${name}`, material: 'Fabric', basis: 'listed', note: 'Fabric' });
  }
  const reclinerModel = catalog?.recliner_catalog_2026?.models?.find((item) => String(item.code) === code);
  for (const name of reclinerModel?.cover_collections || []) for (const record of programByPattern.get(String(name).toLowerCase()) || []) if (!guided || guideCaps.has(record.capCode)) fromRecord(record, 'listed', record.group ? 'Leather' : 'Fabric');
  for (const record of program?.leathers || []) {
    const named = (record.models || []).some((entry) => String(entry).trim().split(/\s+/)[0] === code);
    const anyCap = guided && (record.models || []).some((entry) => /^any\b/i.test(String(entry).trim()));
    if (guided && !leatherBandOpen(record, guideRow ? [guideRow] : guideRows)) continue;
    if ((named && (!guided || guideCaps.has(record.capCode))) || (anyCap && guideCaps.has(record.capCode))) fromRecord(record, anyCap && !named ? 'cap code' : 'listed', 'Leather');
  }

  // 2. Fabrics the model accepts by cap code.
  const caps = new Set();
  const designer = catalog?.designers_choice_catalog_2026?.model_cover_cap_choices?.filter((entry) => String(entry.model_code) === code) || [];
  designer.forEach((entry) => (entry.codes || []).forEach((cap) => caps.add(cap)));
  for (const group of stationary?.catalog_groups || []) Object.values(group.cover_cap_choices || {}).flat().forEach((cap) => caps.add(cap));
  const motionEntry = catalog?.motion_catalog_2026?.index?.find((item) => String(item.code) === code);
  if (reclinerModel) (catalog.recliner_catalog_2026.cover_cap_choices || []).forEach((entry) => entry.codes.forEach((cap) => caps.add(cap)));
  if (motionEntry) (catalog.motion_catalog_2026.cover_cap_choices || []).forEach((entry) => entry.codes.forEach((cap) => caps.add(cap)));
  const category = catalog?.models_database?.find((item) => String(item.model_code) === code)?.category || '';
  const flags = motionEntry?.categories || {};
  const restrictedDuty = guided ? guideRows.some((row) => GUIDE_RESTRICTED_FAMILY.test(row.family)) : Boolean(reclinerModel) || flags.recliner || flags.power_recline || flags.modular || RESTRICTED_DUTY_CATEGORY.test(category);
  for (const record of program?.fabrics || []) {
    if (!(guided ? guideCaps : caps).has(record.capCode)) continue;
    if (restrictedDuty && record.wearability === 'Medium') continue;
    fromRecord(record, 'cap code', 'Fabric');
  }
  return [...found.values()];
}

/**
 * Which guide styles accept a fabric or leather record: its cap code must be on the style's row (leathers also need the style sold in
 * that leather's price band, and a leather that names models is limited to them). Medium-duty fabrics are left off recliner, motion,
 * modular and lift styles. Returns [{ model, name, styles }] sorted by name. Eligibility still has to be confirmed for the exact order.
 */
export function getCoverReach(catalog, record, isLeather = false) {
  const rows = (catalog?.style_index_2026?.styles || []).filter((row) => row.kind === 'style');
  const named = new Set(isLeather ? (record.models || []).filter((entry) => !/^any\b/i.test(String(entry).trim())).map((entry) => String(entry).trim().split(/\s+/)[0]) : []);
  const anyCap = isLeather && (record.models || []).some((entry) => /^any\b/i.test(String(entry).trim()));
  const byModel = new Map();
  for (const row of rows) {
    if (!row.capCodes.includes(record.capCode)) continue;
    if (!isLeather && record.wearability === 'Medium' && GUIDE_RESTRICTED_FAMILY.test(row.family)) continue;
    if (isLeather) {
      if (!leatherBandOpen(record, [row])) continue;
      if (named.size && !anyCap && !named.has(row.model)) continue;
      if (!named.size && !anyCap) continue;
    }
    const entry = byModel.get(row.model) || { model: row.model, name: row.name ? row.name.charAt(0) + row.name.slice(1).toLowerCase() : row.model, styles: 0 };
    entry.styles += 1;
    byModel.set(row.model, entry);
  }
  return [...byModel.values()].sort((a, b) => a.name.localeCompare(b.name));
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

// What a grade letter holds for one model. The letter is a price tier; the kind of cover is its cap code or leather type.
export function summarizeGradeKinds(swatches, grade) {
  const patternsByKind = new Map();
  for (const swatch of swatches) {
    if (swatch.grade !== grade) continue;
    const kind = swatch.kind || swatch.material || 'Fabric';
    patternsByKind.set(kind, new Set([...(patternsByKind.get(kind) || []), swatch.pattern]));
  }
  return [...patternsByKind].map(([kind, patterns]) => ({ kind, patterns: patterns.size })).sort((a, b) => b.patterns - a.patterns || a.kind.localeCompare(b.kind));
}

const SEAT_RANK = { in: 0, near: 1, out: 2 };
const scoreStatus = (score) => (score >= 1 ? 'in' : score > 0 ? 'near' : 'out');
const rangeStatus = (value, [low, high]) => (value >= low && value <= high ? 'in' : value >= low - 1 && value <= high + 1 ? 'near' : 'out');

/**
 * Screens one model's seat against the customer, using the seat dimensions in the April guide for the
 * style that matches their recline choice. Measurements they give are checked directly (knee gap, seat
 * height against the back of the knee, hip clearance); otherwise their height band sets the seat depth
 * and seat height range. A model with no seat dimensions comes back unscored, never as a fit.
 */
export function getSeatFit(catalog, research, { modelCode, answers, inches }) {
  // The first style, in the order the recline choice lists its prefixes (010 before 016, for example), that has seat dimensions.
  const order = matchingPrefixes(catalog, answers).map((prefix) => prefix.code);
  const dims = order.map((code) => getGuideStyleRows(catalog, modelCode).find((row) => row.prefix === code && Number.isFinite(row.dims?.seatDepth))).find(Boolean)?.dims;
  const unscored = { status: 'unscored', basis: '', checks: [] };
  if (!dims) return unscored;
  const thigh = positiveMeasurement(answers.thigh_length_inches);
  const popliteal = positiveMeasurement(answers.popliteal_height_inches);
  const hip = positiveMeasurement(answers.hip_breadth_inches);
  const checks = [];
  let basis = '';
  if (thigh !== null || popliteal !== null || hip !== null) {
    basis = 'measurements';
    if (thigh !== null) checks.push({ key: 'depth', label: 'Seat depth', chair: dims.seatDepth, target: `thigh length ${thigh} in`, status: scoreStatus(depthMatchScore(dims.seatDepth, thigh)) });
    if (popliteal !== null && Number.isFinite(dims.seatHeight)) checks.push({ key: 'height', label: 'Seat height', chair: dims.seatHeight, target: `back of knee ${popliteal} in`, status: scoreStatus(heightMatchScore(dims.seatHeight, popliteal)) });
    if (hip !== null && Number.isFinite(dims.seatWidth) && !(dims.seatFactor > 1)) checks.push({ key: 'width', label: 'Seat width', chair: dims.seatWidth, target: `hips ${hip} in`, status: scoreStatus(widthMatchScore(dims.seatWidth, hip)) });
  } else if (Number.isFinite(inches) && /recliner|lift/i.test(String(answers.category || ''))) {
    const band = (research?.fit_guidance_bands || []).find((item) => inches >= item.height_min_inches && inches <= (item.height_max_inches ?? Infinity));
    if (!band) return unscored;
    basis = band.band;
    checks.push({ key: 'depth', label: 'Seat depth', chair: dims.seatDepth, target: `${band.seat_depth_inches[0]}–${band.seat_depth_inches[1]} in`, status: rangeStatus(dims.seatDepth, band.seat_depth_inches) });
    if (Number.isFinite(dims.seatHeight)) checks.push({ key: 'height', label: 'Seat height', chair: dims.seatHeight, target: `${band.seat_height_inches[0]}–${band.seat_height_inches[1]} in`, status: rangeStatus(dims.seatHeight, band.seat_height_inches) });
  }
  if (!checks.length) return unscored;
  return { status: checks.reduce((worst, check) => (SEAT_RANK[check.status] > SEAT_RANK[worst] ? check.status : worst), 'in'), basis, checks };
}

export const SIT_VERDICTS = [
  { key: 'good', label: 'Fits well' },
  { key: 'too-deep', label: 'Seat too deep' },
  { key: 'too-shallow', label: 'Seat too shallow' },
  { key: 'too-high', label: 'Seat too high' },
  { key: 'too-low', label: 'Seat too low' },
  { key: 'too-tight', label: 'Too tight' },
  { key: 'not-for-them', label: 'Not for them' },
];

/** One logged sit test. Returns null for an unknown verdict or a missing model so bad input is never stored. */
export function buildSitEntry({ modelCode, modelName = '', inches, verdict, note = '', now = new Date() }) {
  if (!modelCode || !SIT_VERDICTS.some((item) => item.key === verdict)) return null;
  return {
    id: `${now.getTime()}-${String(modelCode)}`,
    date: now.toISOString().slice(0, 10),
    modelCode: String(modelCode),
    modelName,
    heightInches: Number.isFinite(inches) ? inches : null,
    verdict,
    note: String(note).trim().slice(0, 200),
  };
}

/** How sits went for a model overall, and for customers within two inches of this height. */
export function summarizeSitLog(entries, modelCode, inches) {
  const sits = entries.filter((item) => item.modelCode === String(modelCode));
  const near = Number.isFinite(inches) ? sits.filter((item) => Number.isFinite(item.heightInches) && Math.abs(item.heightInches - inches) <= 2) : [];
  const good = (list) => list.filter((item) => item.verdict === 'good').length;
  return { total: sits.length, good: good(sits), similar: { total: near.length, good: good(near) } };
}

export function sitLogToText(entries) {
  const label = (key) => SIT_VERDICTS.find((item) => item.key === key)?.label || key;
  return ['date\tmodel code\tmodel\theight in\tverdict\tnote', ...entries.map((item) => [item.date, item.modelCode, item.modelName, item.heightInches ?? '', label(item.verdict), item.note].join('\t'))].join('\n');
}
