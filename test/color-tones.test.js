import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readJson = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8').then(JSON.parse);

test('every cover colour name in the A26 program has a display tone', async () => {
  const program = await readJson('fabric-cover-program-a26.json');
  const { tones } = await readJson('color-tones.json');
  const names = new Set([...program.fabrics, ...program.leathers].flatMap((record) => Object.values(record.colorNames || {})));
  const missing = [...names].filter((name) => !tones[name]);
  assert.deepEqual(missing, []);
  for (const [name, tone] of Object.entries(tones)) assert.match(tone, /^#[0-9a-f]{6}$/i, name);
});
