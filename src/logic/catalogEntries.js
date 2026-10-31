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
