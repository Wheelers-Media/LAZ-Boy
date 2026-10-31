import { getModelCoverSwatches } from './covers.js';

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

export const sectionalPieceCodes = (piece) => [piece.code, ...(piece.variants || []).map((variant) => variant.code)]
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
