import fs from 'node:fs';

const catalogPath = new URL('../public/catalog_data-v2.json', import.meta.url);
const libraryPath = new URL('../public/sales-reference-library-2026.json', import.meta.url);
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const library = JSON.parse(fs.readFileSync(libraryPath, 'utf8'));

catalog.sales_reference_library = library;
catalog.search_reference_entries = library.search_index;

// Preserve the project’s established finish schema while refreshing the source-backed
// names and descriptions. Keep extra existing catalog finishes that are not in this handout.
const suppliedFinishes = new Map(library.wood_finishes.map((finish) => [finish.code, finish]));
for (const finish of catalog.wood_finishes || []) {
  const supplied = suppliedFinishes.get(finish.code);
  if (supplied) {
    finish.name = supplied.name;
    finish.description = supplied.description;
    finish.source_note = 'Dimensions, Finishes & Technical Specs.md (user-supplied; verify exact model eligibility).';
    if (supplied.restriction) finish.source_restriction = supplied.restriction;
  }
}

fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Merged ${library.search_index.length} reference search entries and ${library.product_directory.styles.length} directory rows.`);
