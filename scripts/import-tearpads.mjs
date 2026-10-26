import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const catalogPath = path.resolve('public/catalog_data-v2.json');
const inputPaths = process.argv.slice(2);
if (!inputPaths.length) {
  console.error('Usage: node scripts/import-tearpads.mjs <profile.json> [profile.json ...]');
  process.exit(2);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
catalog.product_profiles ||= [];
const sectionalCatalogKey = (family) => family === 'La-Z-Motion'
  ? 'La-Z-Motion (e.g., Acadia 811)'
  : family === 'Stationary' ? 'Stationary Modular' : 'La-Z-Time Motion';
const profileKey = (profile) => `${profile.model_code}:${profile.sectional_family}`;
for (const inputPath of inputPaths) {
  const profile = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
  const previousProfile = catalog.product_profiles.find((item) => profileKey(item) === profileKey(profile));
  if (!profile.model_code || !profile.model_name || !profile.sectional_family || !Array.isArray(profile.pieces)) {
    throw new Error(`Invalid tear-pad profile: ${inputPath}`);
  }
  if (profile.catalog_model && (!profile.catalog_model.category || !profile.catalog_model.quick_spotter || !profile.catalog_model.recommendation_eligible)) {
    if (profile.catalog_model.recommendation_eligible !== false) throw new Error(`Catalog model must explicitly opt out of recommendations when fit specs are absent: ${inputPath}`);
  }
  for (const piece of profile.pieces) {
    const hasCode = piece.code || (Array.isArray(piece.variants) && piece.variants.length && piece.variants.every((variant) => variant.code));
    const hasUsableSkuPrefix = piece.code || (Array.isArray(piece.variants) && piece.variants.some((variant) => variant.code));
    if (!hasUsableSkuPrefix) throw new Error(`Missing SKU prefix in ${inputPath}: ${piece.key}`);
    if (!hasCode || !piece.key || !piece.name || !piece.dimensions_text) {
      throw new Error(`Incomplete piece in ${inputPath}: each piece needs code(s), key, name, and dimensions_text`);
    }
  }
  const existingIndex = catalog.product_profiles.findIndex((item) => profileKey(item) === profileKey(profile));
  if (existingIndex === -1) catalog.product_profiles.push(profile);
  else catalog.product_profiles[existingIndex] = profile;

  if (profile.catalog_model) {
    const modelIndex = catalog.models_database.findIndex((item) => item.model_code === profile.model_code || item.model_name === profile.model_name);
    if (modelIndex === -1) catalog.models_database.push({ model_code: profile.model_code, model_name: profile.model_name, ...profile.catalog_model });
    else catalog.models_database[modelIndex] = { ...catalog.models_database[modelIndex], ...profile.catalog_model, model_code: profile.model_code, model_name: profile.model_name };
  }

  const familyKey = sectionalCatalogKey(profile.sectional_family);
  if (!catalog.modular_sectional_prefixes[familyKey]) catalog.modular_sectional_prefixes[familyKey] = {};
  for (const piece of profile.pieces) {
    const codes = piece.code ? [piece.code] : piece.variants.map((variant) => variant.code);
    catalog.modular_sectional_prefixes[familyKey][piece.key] = codes.join(' / ');
  }

  if (previousProfile) {
    const previousFamilyKey = sectionalCatalogKey(previousProfile.sectional_family);
    for (const key of Object.keys(catalog.modular_sectional_prefixes[previousFamilyKey] || {})) {
      const stillUsed = catalog.product_profiles.some((item) => profileKey(item) !== profileKey(profile) && sectionalCatalogKey(item.sectional_family) === previousFamilyKey && item.pieces.some((piece) => piece.key === key));
      if (!stillUsed) delete catalog.modular_sectional_prefixes[previousFamilyKey][key];
    }
  }
}
fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Imported ${inputPaths.length} tear-pad profile(s) into ${catalogPath}`);
