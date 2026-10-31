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
    note: colorMatch ? 'Pattern and color matched a known swatch. Confirm the exact model can be ordered in it.' : 'Grade/pattern/color digits parsed from the SKU string. The pattern and color name could not be confirmed.',
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
      claims.push({ code, description: 'No description for this option', status: 'unresolved' });
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
  if (!stylePrefix && !found) warnings.push(`Style ${styleCode || '(missing)'} could not be matched.`);
  if (!model) warnings.push(`Model ${modelCode || '(missing)'} could not be matched.`);
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
