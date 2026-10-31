import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { presetItems, PRESET_LAYOUTS } from '../src/floorplan.js';
import { sectionalPiecesForFamily, validateSectionalStudioLayout } from '../src/logic.js';

const catalog = JSON.parse(fs.readFileSync(new URL('../public/catalog_data-v2.json', import.meta.url), 'utf8'));
const big = { width: 1200, height: 1200 };

test('every preset that builds is valid in every collection, and each collection offers at least one', () => {
  for (const profile of catalog.product_profiles.filter((p) => p.pieces.length)) {
    const pieces = sectionalPiecesForFamily(catalog, profile.sectional_family, String(profile.model_code));
    let offered = 0;
    for (const [key] of PRESET_LAYOUTS) {
      const built = presetItems(key, profile, pieces, big);
      if (!built) continue;
      const check = validateSectionalStudioLayout(built, big, catalog);
      if (check.valid) offered += 1;
      else console.log(`not offered: ${profile.model_name} ${key}: ${check.errors[0]}`);
    }
    assert.ok(offered > 0, `${profile.model_name} offers no layout`);
  }
});

test('corner footprint comes from guide wall space where the guide lists it', () => {
  const trouper = catalog.product_profiles.find((p) => p.model_code === '724');
  assert.equal(trouper.pieces.find((p) => p.key === 'corner_wedge').wall_space_in, 92);
  const wilmette = catalog.product_profiles.find((p) => p.model_code === '603');
  assert.ok(wilmette.pieces.every((p) => p.wall_space_in === undefined));
});
