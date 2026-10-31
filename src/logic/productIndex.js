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
  return MODEL_SECTIONS.map((name) => ({ name, items: groups.get(name).sort((a, b) => (/^\d+$/.test(String(nameOf(a))) - /^\d+$/.test(String(nameOf(b)))) || String(nameOf(a)).localeCompare(String(nameOf(b)))) })).filter((group) => group.items.length);
}

export const RESTRICTED_DUTY_CATEGORY = /recliner|motion|la-z-time/i;
