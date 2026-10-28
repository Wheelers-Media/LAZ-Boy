import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const guide = JSON.parse(await readFile(new URL('../public/mechanism-guide-2026.json', import.meta.url), 'utf8'));

test('every support topic and specialty recliner names a source and a tier', () => {
  for (const topic of guide.supportTopics) {
    assert.ok(topic.source && topic.tier === 'A', topic.id);
    for (const item of topic.items) assert.ok(item.q && item.a, `${topic.id}: ${item.q}`);
  }
  for (const entry of guide.specialtyRecliners) assert.ok(entry.source && entry.tier === 'A', entry.model);
});

test('safety guidance does not promise a chair is safe for a pacemaker or oxygen', () => {
  const power = guide.supportTopics.find((topic) => topic.id === 'power-safety');
  const text = power.items.map((item) => item.a).join(' ');
  assert.match(text, /health care provider/);
  assert.match(text, /Do not tell a customer a chair is safe for a pacemaker/);
  assert.match(text, /does not recommend using a power chair in a room where oxygen/);
});

test('006 and P06 are not given a mechanism entry because the April guide does not list them', () => {
  const prefixes = guide.mechanisms.flatMap((mechanism) => mechanism.prefixes);
  assert.ok(!prefixes.includes('006') && !prefixes.includes('P06'));
});
