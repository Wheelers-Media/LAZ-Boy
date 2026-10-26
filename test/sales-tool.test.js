import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { decodeRmsSku, filterCoverOptionsByMaterial, getCatalogCapabilityLeads, getContextualBatteryOptions, getContextualModelOptions, getContextualPreferenceChoices, getContextualStyleChoices, getMaterialPreferenceChoices, getModelCoverOptions, getRmsStyleOptions, getSectionalPieceOptions, matchDocumentedSectionalLayout, matchingPrefixes, validateSectionalConfiguration } from '../src/logic.js';

const readJson = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const catalog = await readJson('catalog_data-v2.json');
catalog.recliner_catalog_2026 = await readJson('recliner-catalog-2026.json');
catalog.motion_catalog_2026 = await readJson('motion-catalog-2026.json');
catalog.stationary_catalog_2026 = await readJson('stationary-catalog-2026.json');
catalog.designers_choice_catalog_2026 = await readJson('designers-choice-catalog-2026.json');
catalog.april_2026_model_cover_applications = await readJson('april-2026-model-cover-applications.json');

test('declares product cover options before deriving material preferences during app startup', async () => {
  const appSource = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8');
  const productCoversPosition = appSource.indexOf('const productCoverOptions =');
  const materialPreferencesPosition = appSource.indexOf('const availableMaterialPreferences =');

  assert.notEqual(productCoversPosition, -1, 'product cover options are declared');
  assert.notEqual(materialPreferencesPosition, -1, 'material preferences are derived');
  assert.ok(productCoversPosition < materialPreferencesPosition, 'avoid accessing a const before initialization during the first render');
});

test('decodes a catalog-listed recliner SKU into style, model, cover segment and finish without fabric-name guesses', () => {
  const result = decodeRmsSku('10X-759 D185559 FN 007', catalog);

  assert.equal(result.style.code, '10X');
  assert.equal(result.style.name, 'Power Rocking Recliner w/ Power Headrest & Lumbar');
  assert.equal(result.model.code, '759');
  assert.equal(result.model.name, 'Maddox');
  assert.equal(result.cover.grade, 'D');
  assert.equal(result.cover.pattern, '1855');
  assert.equal(result.cover.color, '59');
  assert.equal(result.finish.value, '007');
  assert.equal(result.finish.description, 'Brown Mahogany');
  assert.equal(result.claims.find((claim) => claim.code === 'FN').status, 'documented');
  assert.equal(result.orderStatus, 'requires_order_system_verification');
});

test('decodes the physical feature claim only when the exact documented style lists the suffix', () => {
  const result = decodeRmsSku('U4A-759 D185559 FS', catalog);
  const remote = result.claims.find((claim) => claim.code === 'FS');
  assert.equal(remote.status, 'documented');
  assert.match(remote.description, /Contour Cushion/i);
  assert.ok(result.physicalFeatures.some((feature) => /Contour Cushion/i.test(feature)));
});

test('does not apply a power console option to a style that does not list it', () => {
  const result = decodeRmsSku('U44-724 CB', catalog);
  const consoleOption = result.claims.find((claim) => claim.code === 'CB');

  assert.equal(result.model.name, 'Trouper');
  assert.equal(result.style.name, 'Power Reclining Sofa with Headrest');
  assert.equal(consoleOption.description.includes('wireless charging tray'), true);
  assert.equal(consoleOption.status, 'not_listed_for_exact_style');
  assert.equal(result.physicalFeatures.some((item) => item.includes('wireless charging tray')), false);
});

test('reports unsupported identifiers and malformed codes as unresolved instead of guessing', () => {
  const result = decodeRmsSku('ZZZ-999 nonsense', catalog);

  assert.equal(result.style.status, 'unresolved');
  assert.equal(result.model.status, 'unresolved');
  assert.ok(result.warnings.length > 0);
  assert.equal(decodeRmsSku('', catalog).orderStatus, 'incomplete');
});

test('narrows onboarding model and style choices to the selected category, mechanism and room clearance', () => {
  const recliners = matchingPrefixes(catalog, { category: 'Recliners', mechanism: 'Manual', clearance: 'Tight fit · 4 in' });
  assert.ok(recliners.length > 0);
  assert.ok(recliners.every((prefix) => prefix.wall_clearance_inches <= 4));
  assert.ok(recliners.every((prefix) => /recliner/i.test(prefix.category)));

  const modelOptions = getContextualModelOptions(catalog, { category: 'Recliners', mechanism: 'Manual', clearance: 'Standard · 12–18 in' });
  assert.ok(modelOptions.length > 0);
  assert.ok(modelOptions.every((model) => model.styles.length > 0));
  assert.ok(modelOptions.every((model) => model.styles.every((style) => ['010', '015', '016', '017'].includes(style.code))));
  assert.ok(!modelOptions.some((model) => model.code === '603'), 'stationary products are not shown in the recliner path');
  const stationary = getContextualModelOptions(catalog, { category: 'Stationary suites', mechanism: 'No reclining mechanism', clearance: 'Standard · 12–18 in' });
  assert.ok(stationary.length > 0);
  assert.ok(stationary.every((model) => model.styles.every((style) => !/recliner|lift/i.test(style.prefix.category))));

  const tightPower = getContextualModelOptions(catalog, { category: 'Recliners', mechanism: 'Power + headrest', clearance: 'Tight fit · 4 in' });
  assert.ok(tightPower.length > 0);
  assert.ok(tightPower.every((model) => model.styles.every((style) => style.prefix.wall_clearance_inches <= 4)));
});

test('exact style choices and add-ons are limited to the selected product and style', () => {
  const selection = { category: 'Motion sofas / loveseats', mechanism: 'Power + headrest', clearance: 'Tight fit · 4 in' };
  const selectedModel = { code: '724', styles: getContextualStyleChoices(catalog, '724', selection) };
  assert.ok(selectedModel.styles.length > 0);
  assert.deepEqual(selectedModel.styles.map((style) => style.code).sort(), ['U44', 'U46', 'U48', 'U49', 'X44', 'X46', 'X48', 'X49']);
  assert.ok(getRmsStyleOptions(catalog, '724', 'U44').options.has('FS'));
  assert.ok(!getRmsStyleOptions(catalog, '724', 'U44').options.has('CB'));
  const covers = getModelCoverOptions(catalog, '724');
  assert.ok(covers.some((cover) => cover.code === 'LB172755' && cover.type === 'Leather'));
  assert.ok(covers.some((cover) => cover.code === 'D126778' && cover.type === 'Fabric'));
  assert.ok(!covers.some((cover) => cover.code === 'D211652'));
  const morrisonCovers = getModelCoverOptions(catalog, '766');
  assert.ok(morrisonCovers.some((cover) => cover.code === 'D211652'));
  assert.ok(!morrisonCovers.some((cover) => cover.code === 'LB172755'), 'never carry Trouper’s cover rows over to Morrison');
  assert.deepEqual(filterCoverOptionsByMaterial(covers, 'Fabric').map((item) => item.code), ['D126778']);
  assert.deepEqual(filterCoverOptionsByMaterial(covers, 'Leather').map((item) => item.code), ['LB172755', 'LB172779']);
  const materialPreferences = getMaterialPreferenceChoices(covers);
  assert.ok(materialPreferences.some((item) => item.value === 'Fabric'));
  assert.ok(materialPreferences.some((item) => item.value === 'Other / need to compare swatches'));
  assert.ok(!materialPreferences.some((item) => item.value === 'Authentic leather (LL)'), 'show only material types represented in this product’s source rows');

  const lumbarSelection = { ...selection, support_preference: 'Power lumbar support' };
  const lumbarStyles = getContextualStyleChoices(catalog, '724', lumbarSelection);
  assert.ok(lumbarStyles.length > 0);
  assert.ok(lumbarStyles.every((style) => /lumbar/i.test(style.prefix.motion_type)));
  const cushionPreferences = getContextualPreferenceChoices(catalog, selection, 'cushion');
  assert.ok(cushionPreferences.length);
  assert.ok(cushionPreferences.every((item) => item.code === 'Standard' || item.code === 'FS' || item.code === 'Z6' || item.code === 'DC'));
  const headrestPreferences = getContextualPreferenceChoices(catalog, selection, 'support');
  assert.ok(headrestPreferences.some((item) => item.value === 'Power headrest'));
  assert.ok(headrestPreferences.some((item) => item.value === 'Power lumbar support'), 'show lumbar where a matching style in this category supports it');
  const exactStylePreferences = getContextualPreferenceChoices(catalog, selection, 'support', '724', 'U44');
  assert.ok(!exactStylePreferences.some((item) => item.value === 'Power lumbar support'), 'hide support choices that the selected style cannot provide');
  const manualStyles = getContextualStyleChoices(catalog, '724', { ...selection, mechanism: 'Manual' });
  assert.ok(manualStyles.length);
  assert.ok(manualStyles.every((style) => !style.prefix.power_compatible));
  const coverPreferences = getMaterialPreferenceChoices(covers);
  assert.ok(coverPreferences.some((item) => item.value === 'Fabric'));
  assert.ok(coverPreferences.some((item) => item.value === 'Authentic leather (LL)') === false);
  assert.ok(filterCoverOptionsByMaterial(covers, 'Fabric').every((item) => item.type === 'Fabric'));
  assert.ok(filterCoverOptionsByMaterial(covers, 'Leather match (LM)').every((item) => item.code.startsWith('LM')));
  assert.ok(getContextualBatteryOptions(catalog, '724', 'U44', selection).length === 0, 'hide battery options not documented for this exact style');
  assert.deepEqual(getContextualBatteryOptions(catalog, '521', '10U', { category: 'Recliners', mechanism: 'Power recline', clearance: 'Standard · 12–18 in' }).map((item) => item.code), ['BP1']);
  assert.deepEqual(getContextualBatteryOptions(catalog, '521', '', { category: 'Recliners', mechanism: 'Power recline', clearance: 'Standard · 12–18 in' }), []);
});

test('offers limited category-compatible catalog capability leads for every onboarding category', () => {
  const answers = [
    ['Recliners', 'Power + headrest', 'recliner_catalog_2026'],
    ['High-leg designer', 'Power + headrest', 'designers_choice_catalog_2026'],
    ['Motion sofas / loveseats', 'Power + headrest', 'motion_catalog_2026'],
    ['Modular sectionals', 'Power + headrest', 'motion_catalog_2026'],
    ['Stationary suites', 'No reclining mechanism', 'stationary_catalog_2026'],
    ['Sleepers', 'No reclining mechanism', 'stationary_catalog_2026'],
    ['Lift chairs', 'Lift chair', 'recliner_catalog_2026'],
  ];
  for (const [category, mechanism, sourceKey] of answers) {
    const leads = getCatalogCapabilityLeads(catalog, { category, mechanism, clearance: 'Standard · 12–18 in' });
    assert.ok(leads.length, `${category} should have an explanatory catalog capability lead from ${sourceKey}`);
    assert.ok(leads.every((lead) => lead.tier.includes('not a fit recommendation')));
    assert.ok(leads.every((lead) => lead.source || lead.model_code));
    assert.ok(leads.every((lead) => lead.styles.every((style) => style.code)));
  }
});

test('returns exact piece options only from that model and piece source row', () => {
  assert.deepEqual(getSectionalPieceOptions(catalog, 'La-Z-Time', '759', 'U4A'), ['FS', 'LW']);
  assert.deepEqual(getSectionalPieceOptions(catalog, 'La-Z-Time', '759', 'SC4'), ['CB', 'CC', 'CM']);
  assert.deepEqual(getSectionalPieceOptions(catalog, 'Stationary', '694', '60A'), ['DC', 'FN', 'FP', 'P1', 'Z6']);
  assert.deepEqual(getSectionalPieceOptions(catalog, 'La-Z-Time', '759', 'not-a-piece'), []);
});

test('never includes a known over-capacity lift model in capability leads', () => {
  const leads = getCatalogCapabilityLeads(catalog, { category: 'Lift chairs', mechanism: 'Lift chair', clearance: 'Standard · 12–18 in', weight: '600' });
  assert.ok(leads.every((lead) => lead.capacity_lbs == null || lead.capacity_lbs >= 600));
  assert.ok(!leads.some((lead) => lead.model_code === '562' && lead.capacity_lbs === 500));
});

test('catalog capability leads omit known over-capacity models and mark unknown capacity as unverified', () => {
  const leads = getCatalogCapabilityLeads(catalog, { category: 'Recliners', mechanism: 'Power + headrest', clearance: 'Standard · 12–18 in', weight: '400' });
  assert.ok(leads.every((lead) => lead.capacity_lbs == null || lead.capacity_lbs >= 400));
  assert.ok(leads.every((lead) => lead.capacity_status));
  const unknowns = getCatalogCapabilityLeads(catalog, { category: 'Recliners', mechanism: 'Power + headrest', clearance: 'Standard · 12–18 in' });
  assert.ok(unknowns.some((lead) => lead.capacity_lbs == null));
  assert.ok(unknowns.filter((lead) => lead.capacity_lbs == null).every((lead) => /not documented/.test(lead.capacity_status)));
});

test('recognizes an exact tear-pad arrangement and leaves alternate sequences unconfirmed', () => {
  const profile = catalog.product_profiles.find((entry) => entry.model_code === '759');
  const layout = profile.configuration_layouts[0];
  const exact = matchDocumentedSectionalLayout(layout.piece_callouts.map((code) => ({ modelCode: '759', code })), catalog);
  const alternate = matchDocumentedSectionalLayout([{ modelCode: '759', code: '44A' }, { modelCode: '759', code: '44B' }], catalog);
  assert.equal(exact.layout_number, layout.layout_number);
  assert.equal(exact.overall_width_inches, layout.overall_width_inches);
  assert.equal(alternate, null);
});

test('requires an armless recliner to be flanked in the same model configuration', () => {
  const base = { family: 'La-Z-Time', modelCode: '759' };
  const soloArmless = validateSectionalConfiguration([{ ...base, code: '44S' }], catalog);
  const flankedArmless = validateSectionalConfiguration([
    { ...base, code: '44A' },
    { ...base, code: '44S' },
    { ...base, code: '44B' },
  ], catalog);

  assert.equal(soloArmless.valid, false);
  assert.ok(soloArmless.errors.some((error) => /flanked/i.test(error)));
  assert.equal(flankedArmless.valid, true);
});

test('flags a different-model piece as invalid and never marks the layout order-ready', () => {
  const result = validateSectionalConfiguration([
    { family: 'La-Z-Time', modelCode: '759', code: '44A' },
    { family: 'La-Z-Time', modelCode: '800', code: '44B' },
  ], catalog);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => /same model code/i.test(error)));
  assert.equal(result.status, 'needs_changes');
});

test('does not claim a source-backed component connection where the sequence fails a hard topology rule', () => {
  const result = validateSectionalConfiguration([
    { family: 'La-Z-Time', modelCode: '759', code: '44S' },
    { family: 'La-Z-Time', modelCode: '759', code: '44B' },
  ], catalog);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => /flanked/i.test(error)));
});
