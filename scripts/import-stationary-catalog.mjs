import fs from 'node:fs';
import path from 'node:path';

const sourcePath = path.resolve('public/stationary-catalog-2026.json');
const catalogPath = path.resolve('public/catalog_data-v2.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const key = 'stationary_catalog_2026';
catalog[key] = source;

for (const entry of source.products) {
  const profile = catalog.product_profiles.find((item) => item.model_code === entry.model_code);
  if (profile) {
    profile.manufacturer_catalog_2026 = {
      source: 'La-Z-Boy Stationary Collection Summer/Fall 2026',
      source_page_numbers: entry.pages,
      catalog_groups: entry.catalog_groups,
      note: 'Retain this manufacturer catalog snapshot alongside the tear pad and Product Information Guide; do not overwrite conflicting dimensions or infer fit/capacity.'
    };
  }
}

fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Merged ${source.products.length} indexed models; enriched ${source.products.filter(({ model_code }) => catalog.product_profiles.some((profile) => profile.model_code === model_code)).length} existing profiles.`);
