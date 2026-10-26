import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildSectionalStudioRmsLine, decodeRmsSku, getCatalogCapabilityLeads, getSectionalPieceOptions, matchDocumentedSectionalLayout, validateSectionalConfiguration, validateSectionalStudioLayout } from '../src/logic.js';

const readJson = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);
const catalog = await readJson('catalog_data-v2.json');
catalog.recliner_catalog_2026 = await readJson('recliner-catalog-2026.json');
catalog.motion_catalog_2026 = await readJson('motion-catalog-2026.json');
catalog.stationary_catalog_2026 = await readJson('stationary-catalog-2026.json');
catalog.designers_choice_catalog_2026 = await readJson('designers-choice-catalog-2026.json');

test('builds a piece-by-piece RMS entry preview and appends only explicitly selected options', () => {
  const piece = { code: '44A', modelCode: '769' };
  assert.equal(buildSectionalStudioRmsLine(piece, 'DP', '1808', '52'), '44A-769 DP180852');
  assert.equal(buildSectionalStudioRmsLine(piece, 'DP', '1808', '52', ['FS', 'LW']), '44A-769 DP180852 FS LW');
});

test('validates a catalog-backed L layout and flags terminal orientation, corner topology, room bounds and unsupported identity', () => {
  const profile = catalog.product_profiles.find((entry) => entry.model_code === '769');
  const piece = (key, code, x, y, width, height, rotation = 0) => ({ key, code, modelCode: '769', family: profile.sectional_family, x, y, width, height, rotation });
  const validL = [
    piece('LA_recliner', '44A', 100, 140, 40, 40, 270),
    piece('corner_wedge', '44C', 100, 100, 40, 40),
    piece('RA_recliner', '44B', 140, 100, 40, 40),
  ];
  assert.equal(validateSectionalStudioLayout(validL, { width: 400, height: 300 }, catalog).valid, true);

  const wrongEnd = validL.map((item) => item.key === 'LA_recliner' ? { ...item, rotation: 90 } : item);
  assert.ok(validateSectionalStudioLayout(wrongEnd, { width: 400, height: 300 }, catalog).errors.some((error) => /facing the wrong direction/i.test(error)));

  const straightCorner = [
    piece('LA_recliner', '44A', 20, 100, 40, 40),
    piece('corner_wedge', '44C', 60, 100, 40, 40),
    piece('RA_recliner', '44B', 100, 100, 40, 40),
  ];
  assert.ok(validateSectionalStudioLayout(straightCorner, { width: 400, height: 300 }, catalog).errors.some((error) => /90° junction/i.test(error)));
  assert.ok(validateSectionalStudioLayout([piece('LA_recliner', '44A', 390, 280, 39, 32)], { width: 400, height: 300 }, catalog).errors.some((error) => /room boundary/i.test(error)));
  assert.ok(validateSectionalStudioLayout([piece('LA_recliner', 'not-a-prefix', 20, 20, 39, 32)], { width: 400, height: 300 }, catalog).errors.some((error) => /not listed for model/i.test(error)));
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
