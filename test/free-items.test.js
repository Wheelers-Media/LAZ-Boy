import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createFreeItem, boundsFor, overlaps, isFree, reachConflicts, rotateItem, turnItemTo, polygonsOverlap, polygonOf } from '../src/floorplan.js';

const styles = JSON.parse(fs.readFileSync(new URL('../public/style-index-2026.json', import.meta.url), 'utf8')).styles;
const row = styles.find((r) => r.prefix === '10X' && r.model === '724');
const room = { width: 240, height: 168 };

test('a free recliner keeps its guide size and turns in 45 degree steps', () => {
  const item = createFreeItem(row, 60, 60);
  assert.equal(item.baseWidth, 35); assert.equal(item.baseHeight, 38); assert.equal(item.reachIn, 67);
  const turned = rotateItem([{ ...item, x: 100, y: 60 }], item.id, room, 45)[0];
  assert.equal(turned.rotation, 45);
  const box = boundsFor(35, 38, 45);
  assert.equal(turned.width, box.width);
  assert.ok(turned.width > 35 && turned.width < 35 + 38, 'a 45 degree box is wider than either side');
});

test('turned pieces collide by true shape, not by their box', () => {
  const a = { ...createFreeItem(row, 0, 0, 45), x: 0, y: 0 };
  // a second piece sitting in the empty corner of a's box does not overlap it
  const b = { ...createFreeItem(row, 0, 0, 0), x: 0, y: 0, width: 6, height: 6, baseWidth: 6, baseHeight: 6 };
  assert.equal(overlaps(a, b), false);
  const c = { ...b, x: a.width / 2 - 3, y: a.height / 2 - 3 };
  assert.equal(overlaps(a, c), true);
});

test('recline reach is checked against walls at any angle', () => {
  const item = { ...createFreeItem(row, 0, 0, 0), x: 100, y: 120 }; // reach runs 67 in down from y=120: past the wall at 168
  assert.equal(reachConflicts([item], room)[0]?.reason, 'wall');
  const ok = { ...item, y: 20 };
  assert.equal(reachConflicts([ok], room).length, 0);
});

test('polygons of a free item at 90 degrees match its box', () => {
  const item = createFreeItem(row, 10, 10, 90);
  const poly = polygonOf({ ...item, x: 10, y: 10 });
  const xs = poly.map((p) => p[0]); const ys = poly.map((p) => p[1]);
  assert.ok(Math.abs(Math.min(...xs) - 10) < 0.01 && Math.abs(Math.max(...xs) - (10 + item.width)) < 0.01);
  assert.ok(Math.abs(Math.max(...ys) - (10 + item.height)) < 0.01);
  assert.ok(isFree({ ...item, x: 10, y: 10 }, [], room));
  assert.equal(polygonsOverlap(poly, poly), true);
});

test('a free piece turns to any angle, and still turns when boxed in', () => {
  const item = { ...createFreeItem(row, 0, 0, 0), x: 100, y: 60 };
  const at30 = turnItemTo([item], item.id, room, 30)[0];
  assert.equal(at30.rotation, 30);
  const cramped = { width: 60, height: 60 };
  const wedged = { ...item, x: 0, y: 0 };
  const result = turnItemTo([wedged], wedged.id, cramped, 45);
  assert.ok(result && result[0].rotation === 45, 'never refuses to turn');
});
