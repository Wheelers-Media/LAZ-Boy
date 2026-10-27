import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { heightInches } from '../src/logic.js';

// Every option in the Step 1 height dropdown (src/main.jsx).
const DROPDOWN = [['Under 5′5″', 64], ['5′6″', 66], ['5′8″', 68], ['5′10″', 70], ['5′11″', 71], ['6′0″', 72], ['6′1″', 73], ['6′2″', 74], ['6′3″+', 75]];

test('heightInches parses every height the Fit wizard offers', () => {
  for (const [label, inches] of DROPDOWN) assert.equal(heightInches(label), inches, label);
});

test('heightInches returns null for text with no height', () => {
  assert.equal(heightInches(''), null);
  assert.equal(heightInches('tall'), null);
});

test('different heights land in different research bands, not always Petite', async () => {
  const research = JSON.parse(await readFile(new URL('../public/canada_lineup_research.json', import.meta.url), 'utf8'));
  const bandFor = (inches) => research.fit_guidance_bands.find((band) => inches >= band.height_min_inches && inches <= (band.height_max_inches ?? Infinity))?.band;
  const bands = new Set(DROPDOWN.map(([label]) => bandFor(heightInches(label))));
  assert.ok(bands.size > 1, `expected more than one band, got ${[...bands]}`);
  assert.notEqual(bandFor(heightInches('6′1″')), 'Petite');
});
