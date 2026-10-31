// Puts the April 2026 guide's width, depth and height on each sectional piece, per RMS code.
// The Room Builder draws pieces from these figures. A code with no guide row keeps the catalog text it already had.
import fs from 'node:fs';

const catalogPath = new URL('../public/catalog_data-v2.json', import.meta.url);
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const styles = JSON.parse(fs.readFileSync(new URL('../public/style-index-2026.json', import.meta.url), 'utf8')).styles;
let set = 0;
for (const profile of catalog.product_profiles) {
  for (const piece of profile.pieces) {
    delete piece.guide_dims_in;
    const codes = [...new Set([piece.code, ...(piece.variants || []).map((variant) => variant.code)].filter(Boolean))];
    const found = {};
    for (const code of codes) {
      const row = styles.find((entry) => entry.kind === 'style' && entry.model === String(profile.model_code) && entry.prefix === code);
      const d = row?.dims;
      if (!d || !(d.width > 0) || !(d.depth > 0)) continue;
      found[code] = { width: d.width, depth: d.depth, ...(d.height > 0 ? { height: d.height } : {}) };
      set += 1;
    }
    if (Object.keys(found).length) piece.guide_dims_in = found;
  }
}
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
console.log(`guide_dims_in set for ${set} piece codes`);
