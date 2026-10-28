import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { applyPlacement, createItem, findFreeSpot, placementCandidates, rankPlacements, formatInches, isFree, layoutSummary, overlaps, parsePieceDimensions, pieceKind, presetItems, reachConflicts, reachRect, resolveMove, rotateItem } from '../src/floorplan.js';
import { sectionalPiecesForFamily, validateSectionalStudioLayout } from '../src/logic.js';

const catalog = JSON.parse(await readFile(new URL('../public/catalog_data-v2.json', import.meta.url), 'utf8'));
const room = { width: 240, height: 168 };

test('parses catalog dimension text and refuses to guess', () => {
  assert.deepEqual(parsePieceDimensions('42" H × 56" W × 40" D'), { height: 42, width: 56, depth: 40 });
  assert.equal(parsePieceDimensions('42" H'), null);
  assert.equal(parsePieceDimensions(''), null);
});

test('classifies piece keys', () => {
  assert.equal(pieceKind('LA_recliner'), 'arm-left');
  assert.equal(pieceKind('RA_chaise'), 'chaise-right');
  assert.equal(pieceKind('corner_wedge'), 'corner');
  assert.equal(pieceKind('storage_console'), 'console');
  assert.equal(pieceKind('armless_recliner'), 'armless');
  assert.equal(pieceKind('sofa'), 'seat');
});

const profile = catalog.product_profiles.find((item) => String(item.model_code) === '724');
const pieces = sectionalPiecesForFamily(catalog, profile.sectional_family, '724');
const piece = (key) => pieces.find((entry) => entry.key === key);

test('items carry real dimensions and recline reach', () => {
  const item = createItem(piece('armless_recliner'), profile, 10, 10, 0, '44S');
  assert.equal(item.width, 24); assert.equal(item.height, 40); assert.equal(item.reachIn, 66);
  const rotated = createItem(piece('armless_recliner'), profile, 10, 10, 90, '44S');
  assert.equal(rotated.width, 40); assert.equal(rotated.height, 24);
  assert.deepEqual(reachRect(item), { x: 10, y: 50, width: 24, height: 26 });
});

test('a piece never moves onto another piece or out of the room', () => {
  const a = createItem(piece('corner_wedge'), profile, 20, 20, 0, '44C');
  const b = createItem(piece('armless_recliner'), profile, 120, 20, 0, '44S');
  let items = resolveMove([a, b], b.id, { x: 30, y: 25 }, room);
  const moved = items.find((item) => item.id === b.id);
  assert.ok(!overlaps(moved, a));
  items = resolveMove(items, b.id, { x: 500, y: 500 }, room);
  assert.ok(isFree(items.find((item) => item.id === b.id), [a], room));
});

test('edges snap flush to a neighbour', () => {
  const a = createItem(piece('corner_wedge'), profile, 20, 20, 0, '44C');
  const b = createItem(piece('armless_recliner'), profile, 120, 20, 0, '44S');
  const items = resolveMove([a, b], b.id, { x: a.x + a.width + 3, y: a.y }, room);
  const moved = items.find((item) => item.id === b.id);
  assert.equal(moved.x, a.x + a.width);
});

test('rotating keeps the piece free', () => {
  const a = createItem(piece('corner_wedge'), profile, 20, 20, 0, '44C');
  const b = createItem(piece('armless_recliner'), profile, a.x + a.width, 20, 0, '44S');
  const turned = rotateItem([a, b], b.id, room);
  assert.ok(turned);
  const item = turned.find((entry) => entry.id === b.id);
  assert.equal(item.rotation, 90); assert.equal(item.width, 40);
  assert.ok(isFree(item, [a], room));
});

test('finds a free spot and reports a full room', () => {
  const item = createItem(piece('corner_wedge'), profile, 0, 0, 0, '44C');
  assert.ok(findFreeSpot(item, [], room));
  assert.equal(findFreeSpot(item, [], { width: 30, height: 30 }), null);
});

test('recline reach warns about walls and pieces', () => {
  const recliner = createItem(piece('armless_recliner'), profile, 10, 120, 0, '44S');
  assert.equal(reachConflicts([recliner], room)[0].reason, 'wall');
  const clear = { ...recliner, y: 20 };
  assert.deepEqual(reachConflicts([clear], room), []);
  const blocker = createItem(piece('corner_wedge'), profile, 10, 70, 0, '44C');
  assert.equal(reachConflicts([clear, blocker], room)[0].reason, 'piece');
});

test('presets are exact: no overlaps, inside the room, pieces touching', () => {
  for (const kind of ['l-standard', 'l-console', 'u-shape', 'straight-chaise']) {
    const items = presetItems(kind, profile, pieces, { width: 300, height: 220 });
    if (!items) continue;
    items.forEach((item, index) => assert.ok(isFree(item, items.slice(0, index), { width: 300, height: 220 }), `${kind}: ${item.code}`));
    const summary = layoutSummary(items, { width: 300, height: 220 });
    assert.ok(summary.width > 0 && summary.depth > 0);
  }
  assert.ok(presetItems('l-standard', profile, pieces, { width: 300, height: 220 }));
});

test('a preset that does not fit the room is refused', () => {
  assert.equal(presetItems('u-shape', profile, pieces, { width: 100, height: 100 }), null);
});

test('preset layouts pass the studio layout validation for every documented collection', () => {
  const big = { width: 400, height: 300 };
  let checked = 0;
  for (const entry of catalog.product_profiles.filter((item) => item.pieces?.length)) {
    const list = sectionalPiecesForFamily(catalog, entry.sectional_family, String(entry.model_code));
    for (const kind of ['l-standard', 'u-shape', 'straight-chaise']) {
      const items = presetItems(kind, entry, list, big);
      if (!items) continue;
      checked += 1;
      const result = validateSectionalStudioLayout(items, big, catalog);
      assert.ok(!result.errors.some((error) => /overlap|beyond the room/.test(error)), `${entry.model_name} ${kind}: ${result.errors.join('; ')}`);
    }
  }
  assert.ok(checked > 10);
});

test('formats inches as feet and inches', () => {
  assert.equal(formatInches(30), '2′ 6″');
  assert.equal(formatInches(96), '8′');
  assert.equal(formatInches(9.5), '9.5″');
});

test('a corner unit runs half of its price-book wall space along each wall, and keeps the published depth as its attach edge', () => {
  const item = createItem(piece('corner_wedge'), profile, 0, 0, 0, '44C');
  const published = parsePieceDimensions(profile.pieces.find((entry) => entry.key === 'corner_wedge').dimensions_text);
  const row = profile.product_guide_measurements.rows['44C724'];
  const wallSpace = row[profile.product_guide_measurements.columns.indexOf('WALL_SPACE')];
  assert.equal(wallSpace, 92);
  assert.equal(item.baseWidth, wallSpace / 2);
  assert.equal(item.baseHeight, wallSpace / 2);
  assert.equal(item.reachSource, 'wall-space');
  assert.equal(item.publishedWidth, published.width);
  assert.equal(item.attachIn, published.depth);
  assert.equal(item.width, item.height);
});

test('connection prediction puts the next piece edge to edge with its neighbour, facing the same way, arm side out', () => {
  const corner = { ...createItem(piece('corner_wedge'), profile, 100, 100, 0, '44C'), id: 'c' };
  const left = createItem(piece('LA_recliner'), profile, 0, 0, 0, '44A');
  const spots = placementCandidates(left, [corner], { width: 600, height: 500 });
  const right = spots.find((spot) => spot.anchorSide === 'right');
  assert.ok(right, 'a left-arm piece can join the corner right face');
  assert.deepEqual([right.x, right.y, right.rotation], [corner.x + corner.width, corner.y, 0]);
  assert.ok(!spots.some((spot) => spot.anchorSide === 'bottom'), 'a left-arm piece cannot go below the corner: its open end would face the wrong way');
  const rightArm = createItem(piece('RA_recliner'), profile, 0, 0, 0, '44B');
  const below = placementCandidates(rightArm, [corner], { width: 600, height: 500 }).find((spot) => spot.anchorSide === 'bottom');
  assert.ok(below, 'a right-arm piece can');
  assert.equal(below.rotation, 270);
  assert.equal(below.x, corner.x);
  assert.equal(below.y, corner.y + corner.height);
  assert.ok(spots.every((spot) => spot.rotation !== 180 && spot.rotation !== 90), 'never turned to face away from the corner');
});

test('a piece is never joined by its arm side, and spots outside the room or on top of a piece are dropped', () => {
  const run = { ...createItem(piece('LA_recliner'), profile, 200, 100, 0, '44A'), id: 'a' };
  const another = createItem(piece('LA_recliner'), profile, 0, 0, 0, '44A');
  const spots = placementCandidates(another, [run], { width: 600, height: 500 });
  // The run's left-arm end is its drawing-right face, so nothing may attach there.
  assert.ok(spots.every((spot) => spot.anchorSide !== 'right'));
  assert.ok(spots.every((spot) => spot.x + (spot.rotation % 180 ? another.baseHeight : another.baseWidth) <= 600 && spot.x >= 0));
  const tight = placementCandidates(another, [run], { width: 100, height: 100 });
  assert.deepEqual(tight, []);
});

test('an armless piece can be slotted into a finished L: the run beyond slides along and nothing overlaps', () => {
  const big = { width: 600, height: 500 };
  const corner = { ...createItem(piece('corner_wedge'), profile, 100, 100, 0, '44C'), id: 'c' };
  const left = { ...createItem(piece('LA_recliner'), profile, corner.x + corner.width, 100, 0, '44A'), id: 'l' };
  const right = { ...createItem(piece('RA_recliner'), profile, 100, corner.y + corner.height, 270, '44B'), id: 'r' };
  const plan = [corner, left, right];
  const armless = createItem(piece('armless_chair'), profile, 0, 0, 0, '44S');
  const spots = placementCandidates(armless, plan, big);
  const slot = spots.find((spot) => spot.anchorId === 'c' && spot.anchorSide === 'right' && spot.shift);
  assert.ok(slot, 'an insertion spot exists on the corner right face');
  assert.deepEqual(slot.shift.ids, ['l']);
  const next = applyPlacement(plan, armless, slot);
  assert.equal(next.find((entry) => entry.id === 'l').x, left.x + armless.baseWidth);
  assert.ok(next.every((entry, i) => next.every((other, j) => j <= i || !overlaps(entry, other))));
  const tight = placementCandidates(armless, plan, { width: 190, height: 500 });
  assert.ok(!tight.some((spot) => spot.shift && spot.anchorId === 'c' && spot.anchorSide === 'right'), 'no insertion when the run would leave the room');
});
