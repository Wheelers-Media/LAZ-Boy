import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getDimensionBasedRecommendations, getRecommendations, reclinerCatalogSearchEntries, sectionalPiecesForFamily } from '../src/logic.js';

const catalog = JSON.parse(await readFile(new URL('../public/catalog_data-v2.json', import.meta.url), 'utf8'));
const research = JSON.parse(await readFile(new URL('../public/canada_lineup_research.json', import.meta.url), 'utf8'));
const reclinerCatalog = JSON.parse(await readFile(new URL('../public/recliner-catalog-2026.json', import.meta.url), 'utf8'));
const reclinerIndexSupplement = JSON.parse(await readFile(new URL('../public/recliner-collection-index-supplement.json', import.meta.url), 'utf8'));
const motionCatalog = JSON.parse(await readFile(new URL('../public/motion-catalog-2026.json', import.meta.url), 'utf8'));
const designersChoiceCatalog = JSON.parse(await readFile(new URL('../public/designers-choice-catalog-2026.json', import.meta.url), 'utf8'));
catalog.recliner_catalog_2026 = reclinerCatalog;

const answers = (overrides = {}) => ({
  scale: 'Small / Medium',
  height: '5′8″',
  weight: '',
  clearance: 'Standard · 12–18 in',
  category: 'Recliners',
  mechanism: 'Manual',
  ...overrides,
});

test('dimension suggestions rank exact chair configurations from direct seated measurements without calling them fit matches', () => {
  const results = getDimensionBasedRecommendations(catalog, answers({
    hip_breadth_inches: '16',
    thigh_length_inches: '21',
    popliteal_height_inches: '17',
  }), research);
  assert.ok(results.length > 8, 'the function returns the ranked candidate set; the UI presents its top eight');
  assert.deepEqual(results.slice(0, 8).map((model) => model.model_code), ['799', '403', '766', '724', '512', '521', '765', '530']);
  const vail = results.find((model) => model.model_code === '403');
  const harborTown = results.find((model) => model.model_code === '799');
  const pinnacle = results.find((model) => model.model_code === '512');

  assert.ok(vail);
  assert.equal(vail.dimension_comparison.configuration, 'rocking recliner 010403');
  assert.equal(vail.dimension_comparison.metrics.seat_width.clearance_inches, 1.5);
  assert.equal(vail.dimension_comparison.metrics.seat_depth.knee_gap_inches, 1.5);
  assert.equal(vail.dimension_comparison.tier, 'Good dimensions to try');
  assert.equal(vail.dimension_comparison.source_market, 'US');
  assert.equal(vail.dimension_comparison.availability_status, 'Canadian dealer secondary');
  assert.equal(vail.dimension_comparison.fit_source_conflict, false);
  assert.ok(results.find((model) => model.model_code === '724').dimension_comparison.fit_source_conflict, 'conflicting fit guidance remains visibly marked on its dimension-only entry');
  assert.ok(harborTown);
  assert.equal(harborTown.dimension_comparison.metrics.seat_width.clearance_inches, 7);
  assert.ok(pinnacle);
  assert.equal(pinnacle.dimension_comparison.metrics.seat_depth.score, 0);
  assert.equal(vail.fit_guidance.provisional, true);
  assert.ok(results.every((model) => model.dimension_comparison.kind === 'dimension_screen_not_fit_confirmation'));
});

test('dimension suggestions do not use standing height, body weight, or missing seat dimensions as substitutes', () => {
  const widthOnly = getDimensionBasedRecommendations(catalog, answers({ hip_breadth_inches: '16' }), research);
  const thighOnly = getDimensionBasedRecommendations(catalog, answers({ thigh_length_inches: '21' }), research);
  const rowan = widthOnly.find((model) => model.model_code === '765');

  assert.ok(widthOnly.length > 0);
  assert.ok(widthOnly.every((model) => Number.isFinite(model.dimension_comparison.metrics.seat_width?.score)));
  assert.ok(widthOnly.every((model) => model.dimension_comparison.missing_customer_measurements.includes('thigh length')));
  assert.ok(widthOnly.every((model) => model.dimension_comparison.tier.startsWith('Partial comparison')));
  assert.ok(widthOnly.every((model) => model.dimension_comparison.score_method.includes('not an ergonomic standard')));
  assert.deepEqual(getDimensionBasedRecommendations(catalog, answers({ hip_breadth_inches: '41' }), research), [], 'implausible out-of-range entries are ignored instead of ranked');
  assert.ok(!rowan, 'Rowan is excluded because its supplied width measurement is narrower than the 16-inch hip breadth');
  const rowanWithOnlyThighData = getDimensionBasedRecommendations(catalog, answers({ thigh_length_inches: '21' }), { ...research, model_fit_evidence: { 765: research.model_fit_evidence['765'] } }).find((model) => model.model_code === '765');
  assert.ok(rowanWithOnlyThighData);
  assert.equal(rowanWithOnlyThighData.dimension_comparison.metrics.seat_width, undefined);
  assert.ok(rowanWithOnlyThighData.dimension_comparison.missing_dimensions.includes('inside seat width'));
  const harborTownWithoutHipMeasurement = getDimensionBasedRecommendations(catalog, answers({ thigh_length_inches: '21' }), { ...research, model_fit_evidence: { 799: research.model_fit_evidence['799'] } }).find((model) => model.model_code === '799');
  assert.ok(harborTownWithoutHipMeasurement.dimension_comparison.missing_customer_measurements.includes('hip breadth'));
  assert.match(harborTownWithoutHipMeasurement.dimension_comparison.tier, /^Partial comparison/);
  assert.deepEqual(getDimensionBasedRecommendations(catalog, answers(), research), []);
});

test('dimension candidates respect the recliner/manual category, room clearance, measured width, and exact-configuration capacity', () => {
  const hipInput = { hip_breadth_inches: '20' };
  const standard = getDimensionBasedRecommendations(catalog, answers(hipInput), research);
  const tooTight = getDimensionBasedRecommendations(catalog, answers({ ...hipInput, clearance: 'Tight fit · 4 in' }), research);
  const power = getDimensionBasedRecommendations(catalog, answers({ ...hipInput, mechanism: 'Power recline' }), research);
  const lift = getDimensionBasedRecommendations(catalog, answers({ ...hipInput, category: 'Lift chairs', mechanism: 'Lift chair' }), research);
  const weightSpecified = getDimensionBasedRecommendations(catalog, answers({ ...hipInput, weight: '300' }), research);

  assert.ok(standard.every((model) => model.dimension_comparison.metrics.seat_width.clearance_inches >= 0), 'negative seat-width clearances are hard excluded');
  assert.ok(!standard.some((model) => model.model_code === '403'));
  assert.ok(standard.every((model) => model.dimension_comparison.availability_status));
  assert.deepEqual(tooTight, []);
  assert.deepEqual(power, []);
  assert.deepEqual(lift, []);
  assert.deepEqual(weightSpecified, [], 'unknown capacity for a specific chair configuration is not treated as unlimited');
});

test('indexes the motion collection styles, model variants, options, warranty, finish, and pillow references separately', () => {
  const entries = reclinerCatalogSearchEntries(motionCatalog);
  const search = (query) => entries.filter((entry) => `${entry.title} ${entry.detail} ${entry.kind}`.toLowerCase().includes(query.toLowerCase()));
  const pinnaclePowerConsole = entries.find((entry) => entry.kind === 'Motion catalog style' && entry.title === 'Pinnacle 339-512');
  const pinnacleIndex = entries.find((entry) => entry.kind === 'Motion index entry' && entry.code === '512');
  const trouperSectional = entries.find((entry) => entry.kind === 'Motion catalog style' && entry.title === 'Trouper 44C-724');
  const duplicateCodeIndexRows = entries.filter((entry) => entry.kind === 'Motion index entry' && entry.code === '810');

  assert.equal(motionCatalog.models.length, 29, 'retains all model table records and duplicate Palmer source-code entries');
  assert.equal(motionCatalog.models.reduce((count, model) => count + model.styles.length, 0), 345);
  assert.ok(search('Emmons 444-781').some((entry) => entry.detail.includes('83.5')));
  assert.ok(search('Palmer 44S-800').some((entry) => entry.detail.includes('suffix in supplied extraction is 521')));
  assert.ok(search('Cassian 449-802').some((entry) => entry.detail.includes('77.5')));
  assert.ok(search('Belmont 360-804').some((entry) => entry.detail.includes('Drop-Down Table')));
  assert.ok(search('Quinault 84U-810').some((entry) => entry.detail.includes('79 × 34')));
  assert.ok(search('Dutton 444-828').some((entry) => entry.detail.includes('NB, NN, NS')));
  assert.ok(search('Ovation 36X-A86').some((entry) => entry.kind === 'Motion catalog style'));
  assert.ok(search('headrests').some((entry) => entry.kind === 'Motion catalog model' && entry.title.includes('Ovation')));
  assert.ok(search('Colby P91-893').some((entry) => entry.detail.includes('41 × 83 × 39.5')));
  assert.ok(search('Bennett P94-899').some((entry) => entry.detail.includes('39.5 × 37.5 × 39')));
  assert.ok(search('1YC').some((entry) => entry.kind === 'Motion catalog option' && entry.detail.includes('storage shelf')));
  assert.ok(search('8C0').some((entry) => entry.kind === 'Motion prefix definition'));
  assert.ok(search('not defined').some((entry) => entry.kind === 'Motion catalog model' && entry.title.includes('Dutton') && entry.detail.includes('NB, NN and NS')));
  assert.ok(search('000119-A-3').some((entry) => entry.kind === 'Motion catalog source'));
  assert.ok(search('Pinnacle 330-512').some((entry) => entry.detail.includes('81.5')));
  assert.match(pinnacleIndex.detail, /index-category flags: recliner, fabric/);
  assert.equal(duplicateCodeIndexRows.length, 2, 'Palmer and the duplicate Quinault TOC row remain distinct despite sharing code 810');
  assert.ok(duplicateCodeIndexRows.some((entry) => entry.title.includes('Palmer')));
  assert.ok(duplicateCodeIndexRows.some((entry) => entry.title.includes('Quinault')));
  assert.ok(pinnaclePowerConsole.detail.includes('CB, CC, CM'));
  assert.ok(trouperSectional.detail.includes('wall space required: 92 in'));
  assert.ok(search('Pinnacle').some((entry) => entry.kind === 'Motion index entry' && entry.sourcePages.includes(1)));
  assert.ok(search('wireless remote').some((entry) => entry.kind === 'Motion catalog option' && entry.code === 'RW'));
  assert.ok(search('Sable').some((entry) => entry.kind === 'Motion catalog finish' && entry.code === '067'));
  assert.ok(search('01P-203').some((entry) => entry.kind === 'Motion pillow collection'));
  assert.ok(search('Dorian 444-755').some((entry) => entry.kind === 'Motion catalog style' && entry.detail.includes('44 × 86 × 39.5')));
  assert.ok(search('Maddox 44A-759').some((entry) => entry.kind === 'Motion catalog style' && entry.detail.includes('42 × 40 × 40')));
  assert.ok(search('Joel 449-761').some((entry) => entry.kind === 'Motion catalog style' && entry.detail.includes('81.5')));
  assert.ok(search('Morrison 446-766').some((entry) => entry.kind === 'Motion catalog style' && entry.detail.includes('Drop-Down Table')));
  assert.ok(search('Ava 44C-769').some((entry) => entry.kind === 'Motion catalog style' && entry.detail.includes('wall space required: 91 in')));
  assert.ok(search('warranty').some((entry) => entry.kind === 'Motion warranty reference' && entry.detail.includes('alignment is not reliable')));
  assert.ok(entries.some((entry) => entry.kind === 'Motion index source note' && entry.detail.includes('Quinault 810')));
  assert.ok(entries.some((entry) => entry.kind === 'Motion index source note' && entry.detail.includes('Liam 786')));
});

test('searches the Designer’s Choice 2026 index, categories, prefixes, options, warranty, and available model tables', () => {
  const entries = reclinerCatalogSearchEntries(designersChoiceCatalog);
  const search = (query) => entries.filter((entry) => `${entry.title} ${entry.detail} ${entry.kind}`.toLowerCase().includes(query.toLowerCase()));
  const scout = entries.find((entry) => entry.kind === 'Designer’s Choice index entry' && entry.code === '304');
  const rae = entries.find((entry) => entry.kind === 'Designer’s Choice catalog style' && entry.title === 'Rae 028-416');

  assert.equal(designersChoiceCatalog.index.length, 31);
  assert.equal(designersChoiceCatalog.models.length, 31);
  assert.equal(designersChoiceCatalog.models.reduce((count, model) => count + model.styles.length, 0), 44);
  assert.equal(designersChoiceCatalog.index.filter((item) => item.configuration_status === 'specifications_transcribed').length, 29);
  assert.equal(designersChoiceCatalog.index.filter((item) => item.configuration_status === 'partial_specs_transcribed').length, 2);
  assert.equal(designersChoiceCatalog.index.filter((item) => item.configuration_status === 'index_only_in_supplied_sources').length, 0);
  assert.ok(scout.detail.includes('marked NEW'));
  assert.match(scout.detail, /index-category flags: ottoman, fabric, leather/);
  assert.ok(search('Ferndale 265-408').some((entry) => entry.detail.includes('40 × 32 × 34.5')));
  assert.ok(rae.detail.includes('42.5 × 30.5 × 36.5'));
  assert.ok(search('Dante').some((entry) => entry.kind === 'Designer’s Choice catalog style' && entry.title.includes('29U-405')));
  assert.ok(search('Carleton 29U-471').some((entry) => entry.detail.includes('NB, NH, NS')));
  assert.ok(search('Audrey 29U-457').some((entry) => entry.detail.includes('31.5')));
  assert.ok(search('Eldorado 295-423').some((entry) => entry.detail.includes('42 × 32.5 × 41')));
  assert.ok(search('Tahoe').some((entry) => entry.kind === 'Designer’s Choice catalog model' && entry.detail.includes('D2124 i-Westvale')));
  assert.ok(search('ComfortDown Cushion').some((entry) => entry.kind === 'Designer’s Choice catalog option' && entry.code === 'DC'));
  assert.ok(search('Mesa').some((entry) => entry.kind === 'Designer’s Choice catalog finish' && entry.code === '142'));
  assert.ok(search('Eldorado').some((entry) => entry.kind === 'Designer’s Choice catalog model' && entry.detail.includes('standard 142')));
  assert.ok(designersChoiceCatalog.model_cover_cap_choices.some((item) => item.model_code === '458' && item.material === 'leather' && item.codes.includes('LM')));
  assert.ok(search('nailhead').some((entry) => entry.kind === 'Designer’s Choice catalog option' && entry.code === 'NB'));
  assert.ok(search('warranty').some((entry) => entry.kind === 'Designer’s Choice warranty reference' && entry.detail.includes('duo chairs')));
  assert.ok(search('Bellevue').some((entry) => entry.kind === 'Designer’s Choice index entry' && entry.sourcePages.includes(13)));
  assert.ok(search('Roundabout').some((entry) => entry.kind === 'Designer’s Choice catalog model' && entry.detail.includes('Tuft detail on top')));
  assert.ok(search('pages 30-31 content').some((entry) => entry.kind === 'Designer’s Choice index source note'));
  assert.ok(entries.some((entry) => entry.kind === 'Designer’s Choice catalog model' && entry.title.includes('Colby') && entry.detail.includes('partial_style_table')));
  assert.ok(search('La-Z-Boy_Designers_Choice_2026_part_04.pdf').some((entry) => entry.kind === 'Designer’s Choice catalog source'));
});

test('Designer’s Choice indexing leaves master product profiles and fit claims intact', () => {
  const entries = reclinerCatalogSearchEntries(designersChoiceCatalog);
  const existing = catalog.models_database.find((item) => item.model_code === '512');
  const indexedDante = entries.find((entry) => entry.kind === 'Designer’s Choice catalog model' && entry.code === '405');

  assert.ok(indexedDante);
  assert.equal(indexedDante.weight_limit_lbs, undefined);
  assert.equal(existing.recommendation_eligible, undefined);
  assert.equal(existing.weight_limit_lbs, 350);
  assert.equal(existing.recommended_height, `5'7\" - 6'0\"`);
  assert.equal(catalog.models_database.some((item) => item.model_code === '304'), false);
});

test('motion catalog inclusion does not mutate existing fit claims, model records, or capacity data', () => {
  const entries = reclinerCatalogSearchEntries(motionCatalog);
  const existingJames = catalog.models_database.find((item) => item.model_code === '521');
  const motionJames = entries.find((entry) => entry.kind === 'Motion catalog model' && entry.code === '521');

  assert.ok(motionJames);
  assert.equal(motionJames.weight_limit_lbs, undefined);
  assert.equal(existingJames.recommendation_eligible, false);
  assert.equal(existingJames.weight_limit_lbs, null);
  assert.equal(existingJames.recommended_height, 'Not specified in tear pad');
  assert.equal(catalog.product_profiles.find((profile) => profile.model_code === '521').source_document_code, 'MP0521');
});

test('searches supplemental recliner table-of-contents rows and category flags while exposing conflicting source information', () => {
  const entries = reclinerCatalogSearchEntries(reclinerIndexSupplement);
  const palmer = entries.find((entry) => entry.kind === 'Recliner index entry' && entry.code === '800');
  const sectionalAcadia = entries.find((entry) => entry.kind === 'Recliner index entry' && entry.code === '811' && entry.sourcePages.includes(32));
  const conflicts = entries.find((entry) => entry.kind === 'Recliner index source note');
  const additionalChairAndHalf = entries.find((entry) => entry.kind === 'Recliner prefix definition' && entry.code === '445');

  assert.ok(palmer.title.includes('Palmer'));
  assert.deepEqual(palmer.sourcePages, [24, 25]);
  assert.match(palmer.detail, /modular/);
  assert.match(sectionalAcadia.detail, /modular/);
  assert.ok(conflicts.detail.includes('Pinnacle 512'));
  assert.ok(additionalChairAndHalf.title.includes('Reclining Chair-and-a-Half'));
});

test('searches the recliner catalog models, styles, prefixes, options, finishes, covers, and warranty references', () => {
  const entries = reclinerCatalogSearchEntries(reclinerCatalog);
  const search = (query) => entries.filter((entry) => `${entry.title} ${entry.detail} ${entry.kind}`.toLowerCase().includes(query.toLowerCase()));

  assert.ok(search('Sammy').some((entry) => entry.kind === 'Recliner catalog model' && entry.code === '826'));
  assert.ok(search('10X-826').some((entry) => entry.kind === 'Recliner catalog style' && entry.detail.includes('43 × 37.5 × 39.5')));
  assert.ok(search('Power Wall Recliner with Headrest and Lumbar').some((entry) => entry.kind === 'Recliner prefix definition' && entry.code === '16X'));
  assert.ok(search('rechargeable').some((entry) => entry.kind === 'Recliner catalog option' && entry.code === '088BP1'));
  assert.ok(search('Graphite').some((entry) => entry.kind === 'Recliner catalog finish' && entry.code === '041'));
  assert.ok(entries.some((entry) => entry.kind === 'Recliner cover cap choices' && entry.title.includes('Leather') && entry.title.includes('LL, LM')));
  assert.ok(search('warranty').some((entry) => entry.kind === 'Recliner warranty reference' && entry.detail.includes('does not reliably preserve')));
});

test('recliner catalog indexing does not create models, fit claims, or capacity claims in the master catalog', () => {
  const entries = reclinerCatalogSearchEntries(reclinerCatalog);
  const indexedLift = entries.find((entry) => entry.kind === 'Recliner catalog model' && entry.code === '562');
  const existingAstor = catalog.models_database.find((item) => item.model_code === '519');

  assert.equal(indexedLift.modelCode, '562');
  assert.equal(indexedLift.weight_limit_lbs, undefined);
  assert.equal(existingAstor.weight_limit_lbs, 350);
  assert.equal(existingAstor.recommended_height, '6\'1\"+');
  assert.equal(catalog.models_database.some((item) => item.model_code === '826'), false);
});

test('uses the Canada guide small-to-medium examples for a 5′8″ manual recliner shopper', () => {
  const recommendations = getRecommendations(catalog, answers(), research);
  const codes = recommendations.map((model) => model.model_code);

  assert.ok(!codes.includes('521'), 'James is withheld because published fit guidance conflicts');
  assert.ok(codes.includes('765'), 'Rowan is named in the guide fit band');
  assert.ok(codes.includes('799'), 'Harbor Town is named in the guide fit band');
  assert.ok(recommendations.every((model) => model.fit_guidance?.band === 'Small to Medium'));
});

test('filters the tall guide band to the shopper category and labels its fit suggestions provisional', () => {
  const motionSofas = getRecommendations(catalog, answers({
    scale: 'Tall / Large',
    height: '6′0″',
    category: 'Motion sofas / loveseats',
    mechanism: 'Power + headrest',
    clearance: 'Tight fit · 4 in',
  }), research);
  const sectionals = getRecommendations(catalog, answers({
    scale: 'Tall / Large',
    height: '6′0″',
    category: 'Modular sectionals',
    mechanism: 'Power + headrest',
    clearance: 'Tight fit · 4 in',
  }), research);

  assert.deepEqual(motionSofas.map((model) => model.model_code), ['766', '530']);
  assert.deepEqual(sectionals, [], 'Trouper is withheld because Canadian and US dealer fit descriptions conflict');
  assert.ok(motionSofas.every((model) => model.fit_guidance?.source === 'La-Z-Boy Canada Lineup Analysis.docx'));
  assert.ok(motionSofas.every((model) => model.fit_guidance?.provisional === true));
});

test('attaches model-specific published dimensions and separates them from fit claims', () => {
  const petite = getRecommendations(catalog, answers({
    scale: 'Petite',
    height: '5′3″',
  }), research);
  const pinnacle = petite.find((model) => model.model_code === '512');
  const vail = petite.find((model) => model.model_code === '403');

  assert.equal(pinnacle.fit_evidence.dimensions.seat_depth_inches, 21.5);
  assert.equal(pinnacle.fit_evidence.dimensions.seat_height_inches, 18.5);
  assert.equal(pinnacle.fit_evidence.dimensions.source_market, 'US');
  assert.equal(pinnacle.fit_evidence.fit_claim.market, 'Canada');
  assert.ok(pinnacle.fit_evidence.fit_claim.statement.includes('5′4″ to 5′9″'));
  assert.equal(pinnacle.fit_evidence.research_document.capacity.limit_lbs, 350);
  assert.match(pinnacle.fit_evidence.research_document.capacity.configuration, /1PL512/);
  assert.equal(vail.fit_evidence.fit_claim.statement, 'Described as petite / smaller-frame seating; no numeric user-height range found.');
});

test('flags contradictory fit descriptions and does not invent a model capacity', () => {
  const recommendations = getRecommendations(catalog, answers({
    scale: 'Tall / Large',
    height: '6′0″',
    category: 'Modular sectionals',
    mechanism: 'Power + headrest',
  }), research);
  const trouper = recommendations.find((model) => model.model_code === '724');
  const redwood = getRecommendations(catalog, answers({
    scale: 'Extra Tall / XL',
    height: '6′3″+',
  }), research).find((model) => model.model_code === '776');

  assert.equal(trouper, undefined, 'Trouper is withheld due to conflicting Canadian and US dealer fit claims');
  assert.equal(redwood.fit_evidence.dimensions.seat_depth_inches, 23.5);
  assert.equal(redwood.weight_limit_lbs, null);
});

test('only applies Pinnacle Platinum capacity to a lift mechanism, never the standard recliner', () => {
  const standard = getRecommendations(catalog, answers({
    scale: 'Petite', height: '5′3″', weight: '351', mechanism: 'Power + headrest',
  }), research);
  const lift = getRecommendations(catalog, answers({
    scale: 'Petite', height: '5′3″', weight: '351', mechanism: 'Lift chair',
  }), research);

  assert.ok(!standard.some((model) => model.model_code === '512'));
  assert.ok(!lift.some((model) => model.model_code === '512'));
});

test('uses the supplied Pinnacle Platinum capacity only for lift weights within its rating', () => {
  const withinCapacity = getRecommendations(catalog, answers({
    scale: 'Petite', height: '5′3″', weight: '350', mechanism: 'Power + headrest',
  }), research);
  const overCapacity = getRecommendations(catalog, answers({
    scale: 'Petite', height: '5′3″', weight: '351', mechanism: 'Power + headrest',
  }), research);

  assert.equal(withinCapacity.find((model) => model.model_code === '512')?.weight_limit_lbs, 350);
  assert.ok(!overCapacity.some((model) => model.model_code === '512'));
});

test('does not apply the height-band guide when the shopper scale conflicts with the height answer', () => {
  const recommendations = getRecommendations(catalog, answers({
    scale: 'Average / Mid-Scale',
    height: '6′3″',
  }), research);

  assert.deepEqual(recommendations, []);
});

test('does not include incompatible categories or models above the requested capacity', () => {
  const recommendations = getRecommendations(catalog, answers({
    height: '6′0″',
    weight: '325',
    category: 'Motion sofas / loveseats',
    mechanism: 'Power recline',
  }), research);

  assert.ok(recommendations.every((model) => /motion sofa|motion sectional|sectional/i.test(model.category)));
  assert.ok(recommendations.every((model) => model.weight_limit_lbs == null || model.weight_limit_lbs >= 325));
});

test('indexes Tahoe tear-pad pieces and price-book metrics without confusing unit weight with capacity', () => {
  const profile = catalog.product_profiles.find((item) => item.model_code === '632');
  const pieces = sectionalPiecesForFamily(catalog, 'Stationary', '632');
  const model = catalog.models_database.find((item) => item.model_code === '632');
  const chair = pieces.find((piece) => piece.prefix === '60A');
  const storageArm = pieces.find((piece) => piece.prefix === '6AL');
  const ottoman = pieces.find((piece) => piece.prefix === '240');

  assert.equal(profile.source, 'Tahoe Tearpad MP0104 9-5-2025.pdf');
  assert.equal(profile.source_document_code, 'MP0104');
  assert.equal(profile.additional_source_edition, '26-04-AC-F');
  assert.equal(pieces.length, 9);
  assert.ok(chair.dimensionsLabel.includes('37" H × 47" W × 38.5" D'));
  assert.ok(chair.dimensionsLabel.includes('seat height 21.5"; seat width 37.5"; seat depth 23.5"'));
  assert.ok(chair.dimensionsLabel.includes('unit weight 100 lb'));
  assert.ok(storageArm.dimensionsLabel.includes('unit weight 59 lb'));
  assert.equal(profile.fit_specs_verified, false);
  assert.equal(model.recommendation_eligible, false);
  assert.equal(model.recommended_height, 'Not specified in supplied documents');
  assert.equal(model.weight_limit_lbs, null);
  assert.ok(ottoman.dimensionsLabel.includes('unit weight 87 lb'));
});

test('indexes James tear-pad pieces and dimensions without implying ergonomic fit', () => {
  const profile = catalog.product_profiles.find((item) => item.model_code === '521');
  const pieces = sectionalPiecesForFamily(catalog, 'La-Z-Time', '521');
  const model = catalog.models_database.find((item) => item.model_code === '521');

  assert.equal(profile.source, 'James Tearpad - MP0521 6-6-24.pdf');
  assert.equal(profile.source_document_code, 'MP0521');
  assert.equal(profile.source_document_footer_date, '06/01/24');
  assert.equal(pieces.length, 10);
  assert.ok(pieces.some((piece) => piece.prefix === '44A / U4A / X4A' && piece.dimensionsLabel.includes('41.5" H × 33" W × 39.5" D')));
  assert.ok(pieces.some((piece) => piece.prefix === '44Q / U4Q / X4Q' && piece.dimensionsLabel.includes('fully extended 77.5')));
  assert.equal(model.recommendation_eligible, false);
  assert.equal(model.recommended_height, 'Not specified in tear pad');
  assert.equal(model.weight_limit_lbs, null);
});

test('indexes Wilmette tear-pad and price-book pieces while preserving their conflicting heights', () => {
  const profile = catalog.product_profiles.find((item) => item.model_code === '603');
  const pieces = sectionalPiecesForFamily(catalog, 'Stationary', '603');
  const model = catalog.models_database.find((item) => item.model_code === '603');
  const attachedCornerSofa = pieces.find((piece) => piece.prefix === '60W');
  const ottoman = pieces.find((piece) => piece.prefix === '240');

  assert.equal(profile.source, 'Wilmette TearPad MP0106 08-21-2025.pdf');
  assert.equal(profile.source_document_code, 'MP0106');
  assert.equal(profile.additional_source_edition, '26-04-AC-F');
  assert.equal(pieces.length, 7);
  assert.ok(attachedCornerSofa.dimensionsLabel.includes('37" H × 107" W × 36" D'));
  assert.ok(attachedCornerSofa.dimensionsLabel.includes('pricebook dimensions 34" H × 107" W × 36" D'));
  assert.ok(attachedCornerSofa.dimensionsLabel.includes('Height is retained source-by-source'));
  assert.ok(ottoman.dimensionsLabel.includes('18" H × 37.5" W × 24" D'));
  assert.equal(model.recommendation_eligible, false);
  assert.equal(model.recommended_height, 'Not specified in supplied documents');
  assert.equal(model.weight_limit_lbs, null);
});

test('indexes the complete 2026 stationary catalog with model groups, styles, and conservative warranty source notes', () => {
  const stationary = catalog.stationary_catalog_2026;
  const collins = stationary.products.find((product) => product.model_code === '494');
  const paxton = stationary.products.find((product) => product.model_code === '663');
  const tahoe = stationary.products.find((product) => product.model_code === '632');
  const collinsSectional = collins.catalog_groups.find((group) => group.name === 'Stationary Sectional');
  const collinsCorner = collinsSectional.styles.find((style) => style.style_code === '60C-494');

  assert.equal(stationary.edition, 'Summer/Fall 2026');
  assert.equal(stationary.index.length, 19);
  assert.equal(stationary.products.length, 19);
  assert.deepEqual(paxton.pages, [17, 18]);
  assert.equal(collins.catalog_groups[0].styles.find((style) => style.style_code === '610-494').dimensions, '37.5 in H × 89 in W × 39 in D');
  assert.equal(collinsCorner.wall_space_required_inches, 98);
  assert.equal(tahoe.catalog_groups[0].finish_note, 'Finish options only available on 6AL, 6AR, and 6SC prefixes.');
  assert.ok(stationary.options.some((option) => option.code === '0881YC'));
  assert.ok(stationary.finishes.some((finish) => finish.code === '071'));
  assert.ok(stationary.pillow_styles.some((pillow) => pillow.code === '08P-201' && pillow.quantity === 1));
  assert.ok(stationary.warranty_reference.notes.some((note) => note.includes('dot alignment')));

  const mergedMeyer = catalog.product_profiles.find((profile) => profile.model_code === '694');
  assert.equal(mergedMeyer.manufacturer_catalog_2026.source_page_numbers[0], 23);
  assert.ok(mergedMeyer.manufacturer_catalog_2026.catalog_groups.some((group) => group.name === 'Stationary Sectional'));
});

test('indexes Maddox reclining sectional piece variants, dimensions, source details, and diagram callouts', () => {
  const profile = catalog.product_profiles.find((item) => item.model_code === '759');
  const pieces = sectionalPiecesForFamily(catalog, 'La-Z-Time', '759');
  const model = catalog.models_database.find((item) => item.model_code === '759');
  const leftRecliner = pieces.find((piece) => piece.key === 'LA_recliner');
  const chaise = pieces.find((piece) => piece.key === 'LA_reclining_chaise');

  assert.equal(profile.model_name, 'Maddox');
  assert.equal(profile.source_document_code, 'MP0101');
  assert.equal(profile.source_document_footer_date, '06/01/24');
  assert.equal(profile.pieces.length, 8);
  assert.ok(profile.source_text_extraction.includes('Deep waterfall seats, tall split backs'));
  assert.deepEqual(profile.arrangement_piece_callout_sequence.slice(0, 4), ['44C', 'M44', 'M44', '44B']);
  assert.equal(profile.configuration_layouts.length, 8);
  assert.deepEqual(profile.configuration_layouts.map(({ overall_width_inches, overall_depth_inches }) => [overall_width_inches, overall_depth_inches]), [[134.5, 118], [134.5, 150], [118, 132.5], [134.5, 132.5], [132.5, 118], [114, 65.5], [118, 118], [94.5, 40]]);
  assert.equal(profile.visual_reference.source, 'User-attached Maddox tear-pad photos in this conversation');
  assert.ok(profile.visual_reference.product_photo_description.includes('brown leather-look sectional'));
  assert.deepEqual(leftRecliner.variants.map((variant) => variant.code), ['44A', 'U4A', 'X4A']);
  assert.ok(leftRecliner.dimensionsLabel.includes('42\" H × 40\" W × 40\" D'));
  assert.ok(chaise.prefix.includes('44Q / U4Q / X4Q'));
  assert.ok(chaise.dimensionsLabel.includes('42\" H × 42\" W × 65.5\" D'));
  assert.equal(profile.fit_specs_verified, false);
  assert.equal(model.recommendation_eligible, false);
  assert.equal(model.weight_limit_lbs, null);
});

test('indexes Meyer stationary sectional pieces, printed options, source date, and diagram extraction', () => {
  const profile = catalog.product_profiles.find((item) => item.model_code === '694');
  const pieces = sectionalPiecesForFamily(catalog, 'Stationary', '694');
  const model = catalog.models_database.find((item) => item.model_code === '694');
  const leftStorageChaise = pieces.find((piece) => piece.prefix === '6SL');
  const corner = pieces.find((piece) => piece.prefix === '60C');

  assert.equal(profile.model_name, 'Meyer');
  assert.equal(profile.source_document_code, 'TS0040');
  assert.equal(profile.source_document_footer_date, '07/01/25');
  assert.equal(profile.pieces.length, 13);
  assert.ok(profile.source_text_extraction.includes('rich wood legs'));
  assert.ok(profile.configuration_diagram_piece_callouts.includes('60D'));
  assert.ok(leftStorageChaise.dimensionsLabel.includes('37.5\" H × 39\" W × 64\" D'));
  assert.ok(corner.dimensionsLabel.includes('37.5\" H × 67\" W × 39\" D'));
  assert.deepEqual(profile.pieces.find((piece) => piece.code === '60A').printed_codes, ['9CC', '9EP', '9DP', '90M']);
  assert.equal(profile.fit_specs_verified, false);
  assert.equal(model.recommendation_eligible, false);
  assert.equal(model.weight_limit_lbs, null);
});

test('indexes Cuyahoga ZMod pieces, audio console, extracted dimensions, and source text', () => {
  const profile = catalog.product_profiles.find((item) => item.model_code === '958');
  const pieces = sectionalPiecesForFamily(catalog, 'La-Z-Motion', '958');
  const model = catalog.models_database.find((item) => item.model_code === '958');
  const audioConsole = pieces.find((piece) => piece.prefix === '7PC');
  const corner = pieces.find((piece) => piece.prefix === '7C0');

  assert.equal(profile.model_name, 'Cuyahoga');
  assert.equal(profile.source_document_code, 'MP0098');
  assert.equal(profile.source_document_footer_date, '07/2024');
  assert.equal(profile.pieces.length, 9);
  assert.ok(profile.source_text_extraction.includes('unlimited reclining positions'));
  assert.deepEqual(profile.unmapped_extracted_values, ['42', '47', '47']);
  assert.ok(audioConsole.name.includes('Audio'));
  assert.ok(audioConsole.dimensionsLabel.includes('36\" H × 13\" W × 38\" D'));
  assert.ok(corner.dimensionsLabel.includes('40\" H × 66\" W × 42\" D'));
  assert.equal(profile.fit_specs_verified, false);
  assert.equal(model.recommendation_eligible, false);
  assert.equal(model.weight_limit_lbs, null);
});

test('indexes Lakewood ZMod sectional pieces, dimensions, source text, and unassigned diagram values', () => {
  const profile = catalog.product_profiles.find((item) => item.model_code === '942');
  const pieces = sectionalPiecesForFamily(catalog, 'La-Z-Motion', '942');
  const model = catalog.models_database.find((item) => item.model_code === '942');
  const sofa = pieces.find((piece) => piece.prefix === '73U');
  const powerRecliner = pieces.find((piece) => piece.prefix === '7AU');

  assert.equal(profile.model_name, 'Lakewood');
  assert.equal(profile.source_document_code, 'MP0099');
  assert.equal(profile.source_document_footer_date, '07/2024');
  assert.equal(profile.pieces.length, 10);
  assert.ok(profile.source_text_extraction.includes('unlimited reclining positions'));
  assert.deepEqual(profile.unmapped_extracted_values, ['43', '48', '48']);
  assert.ok(sofa.dimensionsLabel.includes('34\" H × 88\" W × 40\" D'));
  assert.ok(powerRecliner.name.includes('Power Headrest'));
  assert.equal(profile.fit_specs_verified, false);
  assert.equal(model.recommendation_eligible, false);
  assert.equal(model.recommended_height, 'Not specified in tear pad');
  assert.equal(model.weight_limit_lbs, null);
});

test('indexes Palmer tear-pad content, variant SKUs, diagram text, and printed source dates', () => {
  const profile = catalog.product_profiles.find((item) => item.model_code === '800');
  const pieces = sectionalPiecesForFamily(catalog, 'La-Z-Time', '800');
  const model = catalog.models_database.find((item) => item.model_code === '800');
  const leftChaise = pieces.find((piece) => piece.key === 'LA_reclining_chaise');
  const chairAndHalf = pieces.find((piece) => piece.key === 'reclining_chair_and_a_half');

  assert.equal(profile.model_name, 'Palmer');
  assert.equal(profile.source_document_code, 'MP0108');
  assert.equal(profile.source_document_filename_date, '11-20-2025');
  assert.equal(profile.source_document_footer_date, '08/01/25');
  assert.equal(profile.pieces.length, 9);
  assert.equal(profile.source_text_extraction.includes('Choose an arrangement shown below'), true);
  assert.deepEqual(profile.arrangement_piece_callout_sequence.slice(0, 4), ['44C', 'M44', 'M44', '44B']);
  assert.ok(profile.unmapped_printed_codes.includes('9CC'));
  assert.ok(leftChaise.prefix.includes('44Q / U4Q / X4Q'));
  assert.ok(leftChaise.dimensionsLabel.includes('43\" H × 42.5\" W × 66.5\" D'));
  assert.ok(chairAndHalf.prefix.includes('445 / U45 / X45'));
  assert.equal(profile.fit_specs_verified, false);
  assert.equal(model.recommendation_eligible, false);
  assert.equal(model.weight_limit_lbs, null);
});

test('indexes Paxton tear-pad pieces and preserves the ambiguous extracted armless-chair dimensions', () => {
  const profile = catalog.product_profiles.find((item) => item.model_code === '663');
  const pieces = sectionalPiecesForFamily(catalog, 'Stationary', '663');
  const model = catalog.models_database.find((item) => item.model_code === '663');
  const armlessChair = pieces.find((piece) => piece.prefix === '60M');

  assert.equal(profile.model_name, 'Paxton');
  assert.equal(profile.source, 'Paxton Tearpad - TS0043 6-6-24.pdf');
  assert.equal(profile.source_document_code, 'TS0043');
  assert.equal(profile.source_document_footer_date, '06/01/24');
  assert.equal(pieces.length, 6);
  assert.ok(pieces.some((piece) => piece.prefix === '60A' && piece.dimensionsLabel.includes('38\" H × 45\" W × 42\" D')));
  assert.ok(armlessChair.dimensionsLabel.includes('38\" D × 40\" W × 42\" D'));
  assert.ok(armlessChair.dimensionsLabel.includes('without inferring or correcting the dimensions'));
  assert.equal(profile.fit_specs_verified, false);
  assert.equal(model.recommendation_eligible, false);
  assert.equal(model.recommended_height, 'Not specified in tear pad');
  assert.equal(model.weight_limit_lbs, null);
});

test('indexes April 2026 Product Information Guide measurements across existing model profiles', () => {
  const models = [
    { code: '811', family: 'La-Z-Motion', style: '8AU811', expected: [43, 44.5, 40, 21, 33.5, 21, 26, 67.5, 8.5, null, 144, 2, 44.5] },
    { code: '812', family: 'La-Z-Motion', style: '8C0812', expected: [34.5, 68.5, 38, 19.5, null, 22, null, null, null, null, 84, 2, 100] },
    { code: '665', family: 'Stationary', style: '60A665', expected: [38, 46, 42, 21, 36, 24, 26.5, null, null, null, 104, 2, 46] },
    { code: '769', family: 'La-Z-Time', style: 'X4A769', expected: [42, 32, 41, 21, 23.5, 22.5, 25, 65.5, 5, null, 96, 2, null] },
    { code: '638', family: 'Stationary', style: '60A638', expected: [37, 37, 38.5, 21.5, 31, 21.5, 25, null, null, null, 75, 1, 37] },
    { code: '724', family: 'La-Z-Time', style: '44A724', expected: [42, 30, 40, 20.5, 22, 21, 26, 66, 4, null, 80, 2, 30] },
    { code: '494', family: 'Stationary', style: '60A494', expected: [37.5, 32.5, 39, 21, 24, 23.5, 26, null, null, null, 60, 2, 32.5] },
  ];

  for (const { code, family, style, expected } of models) {
    const profile = catalog.product_profiles.find((item) => item.model_code === code);
    const model = catalog.models_database.find((item) => item.model_code === code);
    const pieces = sectionalPiecesForFamily(catalog, family, code);
    const guide = profile.product_guide_measurements;

    assert.equal(guide.source, 'APRIL 2026 - PRODUCT INFORMATION GUIDE.xlsx', `${profile.model_name} source attribution`);
    assert.deepEqual(guide.rows[style], expected, `${style} measurements remain in source column order`);
    assert.ok(pieces[0].dimensionsLabel.includes('Product Information Guide April 2026'));
    if (model) {
      assert.ok(model.recommendation_eligible === false || model.recommendation_eligible == null);
      assert.equal(model.weight_limit_lbs == null || model.weight_limit_lbs === 300, true, 'guide unit weights are not set as model capacity');
    }
    assert.equal(profile.fit_specs_verified, false);
  }

  const ava = catalog.product_profiles.find((item) => item.model_code === '769');
  assert.equal(ava.product_guide_measurements.rows['44A769'][2], 39);
  assert.equal(ava.product_guide_measurements.rows['U4A769'][2], 41);
  assert.equal(ava.product_guide_measurements.rows['X4A769'][2], 41);
});

test('indexes Collins tear-pad pieces and dimensions without implying ergonomic fit', () => {
  const profile = catalog.product_profiles.find((item) => item.model_code === '494');
  const pieces = sectionalPiecesForFamily(catalog, 'Stationary', '494');
  const model = catalog.models_database.find((item) => item.model_code === '494');

  assert.equal(profile.source, 'Collins TearPad MP0073 8-8-25.pdf');
  assert.equal(profile.source_document_code, 'MP0073');
  assert.equal(profile.source_document_footer_date, '07/01/25');
  assert.equal(pieces.length, 14);
  assert.ok(pieces.some((piece) => piece.prefix === '60A' && piece.dimensionsLabel.includes('37.5" H × 32.5" W × 39" D')));
  assert.ok(pieces.some((piece) => piece.prefix === '6SP' && piece.dimensionsLabel.includes('fully extended 90')));
  assert.equal(model.recommendation_eligible, false);
  assert.equal(model.recommended_height, 'Not specified in tear pad');
  assert.equal(model.weight_limit_lbs, null);
});
