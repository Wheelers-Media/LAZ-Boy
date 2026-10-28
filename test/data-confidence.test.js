import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { modelDataConfidence } from '../src/logic.js';

const read = (f) => JSON.parse(fs.readFileSync(new URL(`../public/${f}.json`, import.meta.url)));
const catalog = read('catalog_data-v2');
catalog.style_index_2026 = read('style-index-2026');
catalog.recliner_catalog_2026 = read('recliner-catalog-2026');
catalog.stationary_catalog_2026 = read('stationary-catalog-2026');
catalog.april_2026_model_cover_applications = read('april-2026-model-cover-applications');
const research = read('canada_lineup_research');
const check = read('pricebook-check-2026');
const by = (code) => Object.fromEntries(modelDataConfidence(catalog, research, code, check).map((c) => [c.key, c]));

test('a model with a tear pad, scale and height shows documented fit, pieces and spotter', () => {
  const t = by('724');
  assert.equal(t.fit.state, 'ok');
  assert.equal(t.spotter.state, 'ok');
  assert.equal(t.pieces.state, 'ok');
  assert.equal(t.pricebook.state, 'ok');
});

test('a model with no height or weight data says so and never claims a fit', () => {
  const none = by('205').fit;
  assert.equal(none.state, 'none');
  assert.match(none.detail, /Do not describe this as a fit match/);
});

test('cap-code-only covers are labelled as grade level, not named patterns', () => {
  const c = by('205').covers;
  assert.equal(c.state, 'partial');
  assert.match(c.detail, /Grade level only/);
});

test('model 795 is flagged as not in the price book', () => {
  assert.equal(by('795').pricebook.state, 'none');
  assert.match(by('795').pricebook.detail, /Not found/);
});

test('the Palmer 445800 width difference between guide and price book is kept, not resolved', () => {
  const d = by('800').dimensions;
  assert.equal(d.state, 'partial');
  assert.match(d.detail, /445800 width 51\.5 vs 54\.5/);
});

test('the price book check covers every NEW and DISC flag and agrees with the guide', () => {
  assert.equal(check.flagAgreement.flagged, check.flagAgreement.matchGuideStatus);
});
