// Real-scale floor plan geometry for the Room Builder.
// All lengths are inches. Pieces use their catalog W (width) and D (depth); nothing is estimated.
// Rotation is clockwise in 90 degree steps. At rotation 0 the back of a piece is at the top and the seat faces down.

export const EPSILON = 0.01;

/** Pull height, width and depth (inches) out of text like `42" H × 56" W × 40" D`. Returns null if W or D is missing. */
export function parsePieceDimensions(text = '') {
  const found = {};
  for (const match of String(text).matchAll(/([\d.]+)\s*(?:["″”]|in\b)?\s*([HWD])\b/gi)) found[match[2].toUpperCase()] = Number(match[1]);
  if (!(found.W > 0) || !(found.D > 0)) return null;
  return { width: found.W, depth: found.D, height: found.H > 0 ? found.H : null };
}

/** The picture family a piece belongs to. Used to choose its top-down drawing. */
export function pieceKind(key = '') {
  const k = String(key);
  if (/console/i.test(k)) return 'console';
  if (/ottoman/i.test(k)) return 'ottoman';
  if (/attached_corner/i.test(k)) return /^RA_/.test(k) ? 'arm-right' : 'arm-left'; // a sofa that includes its corner: drawn as a long seat run
  if (/corner/i.test(k)) return 'corner';
  if (/chaise/i.test(k)) return /^RA_/.test(k) ? 'chaise-right' : 'chaise-left';
  if (/storage_arm/i.test(k)) return /^RA_/.test(k) ? 'arm-right' : 'arm-left';
  if (/^LA_/.test(k)) return 'arm-left';
  if (/^RA_/.test(k)) return 'arm-right';
  if (/armless/i.test(k)) return 'armless';
  return 'seat';
}

export const isReclining = (key = '', reachIn = null) => Boolean(reachIn) || /recliner|reclining/i.test(String(key));

export const normalizeRotation = (rotation = 0) => ((Math.round(rotation / 90) * 90) % 360 + 360) % 360;

/** Bounding box size of a piece after rotation. */
export function rotatedSize(baseWidth, baseDepth, rotation) {
  return normalizeRotation(rotation) % 180 ? { width: baseDepth, height: baseWidth } : { width: baseWidth, height: baseDepth };
}

/** Build a placed item from a catalog piece. Returns null when the catalog gives no width and depth. */
/** "Wall Space Required" for a corner style from the April 2026 Product Information Guide rows kept in the profile, or null. */
function guideWallSpace(profile, code) {
  const guide = profile?.product_guide_measurements;
  const column = guide?.columns?.indexOf('WALL_SPACE');
  const row = guide?.rows?.[`${code}${profile.model_code}`];
  const value = row && column >= 0 ? Number(row[column]) : NaN;
  return value > 0 ? value : null;
}

export function createItem(piece, profile, x, y, rotation = 0, code, options = {}) {
  const source = profile.pieces.find((entry) => entry.key === piece.key);
  const size = parsePieceDimensions(source?.dimensions_text);
  if (!size) return null;
  const turn = normalizeRotation(rotation);
  const kind = pieceKind(piece.key);
  // A corner unit is drawn as a square L x L, where L is how far it runs along EACH wall. The April 2026 price book defines
  // "Wall Space Required" as the wall used on both sides of a corner unit, so L = that figure / 2 (Trouper 44C: 92 -> 46).
  // The published W is the widest measurement across the corner (about L x 1.41), not the run along a wall. Without a
  // wall-space figure we estimate L from W and mark it, rather than guess silently.
  const codeUsed = code || piece.variants?.[0]?.code || String(piece.prefix || '').split('/')[0].trim();
  const corner = kind === 'corner' && size.width >= size.depth;
  const wallSpace = corner ? (Number(source?.wall_space_in) > 0 ? Number(source.wall_space_in) : guideWallSpace(profile, codeUsed)) : null;
  const cornerReach = corner ? Math.max(size.depth, wallSpace ? wallSpace / 2 : Math.round((size.width / Math.SQRT2) * 2) / 2) : null;
  const footprint = corner ? { width: cornerReach, depth: cornerReach } : size;
  const box = rotatedSize(footprint.width, footprint.depth, turn);
  const reach = Number(source?.fully_extended_in) > footprint.depth ? Number(source.fully_extended_in) : null;
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    modelCode: String(profile.model_code), modelName: profile.model_name, family: profile.sectional_family,
    key: piece.key, name: piece.name, code: code || piece.variants?.[0]?.code || String(piece.prefix || '').split('/')[0].trim(),
    x, y, width: box.width, height: box.height, baseWidth: footprint.width, baseHeight: footprint.depth, heightIn: size.height,
    attachIn: corner ? Math.min(size.depth, cornerReach) : null, publishedWidth: size.width, reachSource: corner ? (wallSpace ? 'wall-space' : 'estimated') : null, mirror: Boolean(options.mirror),
    rotation: turn, dimensionsLabel: source?.dimensions_text || '', reachIn: reach, kind,
  };
}

/** Axis-aligned bounds of a width x depth rectangle turned by any angle. */
export function boundsFor(width, depth, rotation) {
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians)); const sin = Math.abs(Math.sin(radians));
  return { width: round2(width * cos + depth * sin), height: round2(width * sin + depth * cos) };
}
const round2 = (value) => Math.round(value * 100) / 100;
/** Free-standing furniture can turn in 45 degree steps; modular pieces stay on 90. */
export const normalizeFreeRotation = (rotation = 0) => ((Math.round(rotation / 45) * 45) % 360 + 360) % 360;
const isDiagonal = (item) => Boolean(item?.free) && (Number(item.rotation) || 0) % 90 !== 0;

/** Corner points of a rectangle (local x, y, w, h) turned about the item's centre, in room coordinates. */
function turnedRect(item, local) {
  const radians = ((Number(item.rotation) || 0) * Math.PI) / 180;
  const cos = Math.cos(radians); const sin = Math.sin(radians);
  const cx = item.x + item.width / 2; const cy = item.y + item.height / 2;
  const ox = local.x - item.baseWidth / 2; const oy = local.y - item.baseHeight / 2;
  return [[0, 0], [local.w, 0], [local.w, local.h], [0, local.h]].map(([dx, dy]) => {
    const px = ox + dx; const py = oy + dy;
    return [cx + px * cos - py * sin, cy + px * sin + py * cos];
  });
}
/** The outline of an item as a polygon. Modular pieces use their box; free pieces use their true turned shape. */
export const polygonOf = (item) => (item.free ? turnedRect(item, { x: 0, y: 0, w: item.baseWidth, h: item.baseHeight }) : [[item.x, item.y], [item.x + item.width, item.y], [item.x + item.width, item.y + item.height], [item.x, item.y + item.height]]);
/** Separating-axis test: true when two convex polygons overlap by more than the tolerance. */
export function polygonsOverlap(p, q, tolerance = EPSILON) {
  for (const poly of [p, q]) {
    for (let i = 0; i < poly.length; i += 1) {
      const [x1, y1] = poly[i]; const [x2, y2] = poly[(i + 1) % poly.length];
      const nx = y1 - y2; const ny = x2 - x1; const length = Math.hypot(nx, ny) || 1;
      const project = (points) => { const values = points.map(([x, y]) => (x * nx + y * ny) / length); return [Math.min(...values), Math.max(...values)]; };
      const [a0, a1] = project(p); const [b0, b1] = project(q);
      if (Math.min(a1, b1) - Math.max(a0, b0) <= tolerance) return false;
    }
  }
  return true;
}
const rectOverlap = (a, b, tolerance) => Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > tolerance
  && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > tolerance;
export const overlaps = (a, b, tolerance = EPSILON) => {
  if (!rectOverlap(a, b, tolerance)) return false; // boxes apart means shapes apart
  if (isDiagonal(a) || isDiagonal(b)) return polygonsOverlap(polygonOf(a), polygonOf(b), tolerance);
  return true;
};

export const insideRoom = (item, room) => item.x >= -EPSILON && item.y >= -EPSILON
  && item.x + item.width <= room.width + EPSILON && item.y + item.height <= room.height + EPSILON;

export const isFree = (item, others, room) => insideRoom(item, room) && !others.some((other) => other.id !== item.id && overlaps(item, other));

/** The strip of floor a reclining piece needs when fully extended, in front of its seat. */
export function reachRect(item) {
  if (!item.reachIn) return null;
  const extra = item.reachIn - item.baseHeight;
  if (!(extra > 0)) return null;
  switch (normalizeRotation(item.rotation)) {
    case 0: return { x: item.x, y: item.y + item.height, width: item.width, height: extra };
    case 90: return { x: item.x - extra, y: item.y, width: extra, height: item.height };
    case 180: return { x: item.x, y: item.y - extra, width: item.width, height: extra };
    default: return { x: item.x + item.width, y: item.y, width: extra, height: item.height };
  }
}

/** The floor a free-standing recliner needs when fully extended, as a polygon turned with the chair. */
export function reachPolygon(item) {
  if (!item.reachIn) return null;
  const extra = item.reachIn - item.baseHeight;
  if (!(extra > 0)) return null;
  if (item.free) return turnedRect(item, { x: 0, y: item.baseHeight, w: item.baseWidth, h: extra });
  const zone = reachRect(item);
  return zone ? [[zone.x, zone.y], [zone.x + zone.width, zone.y], [zone.x + zone.width, zone.y + zone.height], [zone.x, zone.y + zone.height]] : null;
}

/** Which recliners cannot fully extend because a wall or another piece is in the way. Warnings only. */
export function reachConflicts(items, room) {
  const conflicts = [];
  for (const item of items) {
    const zone = reachPolygon(item);
    if (!zone) continue;
    const outside = zone.some(([x, y]) => x < -EPSILON || y < -EPSILON || x > room.width + EPSILON || y > room.height + EPSILON);
    const blocker = items.find((other) => other.id !== item.id && polygonsOverlap(zone, polygonOf(other)));
    if (outside) conflicts.push({ id: item.id, name: item.name, code: item.code, reason: 'wall' });
    else if (blocker) conflicts.push({ id: item.id, name: item.name, code: item.code, reason: 'piece', blocker: blocker.name });
  }
  return conflicts;
}

const SNAP_DISTANCE = 6;

/** Pull an item flush against nearby walls and pieces so connections sit edge to edge. */
export function snapToEdges(item, others, room, distance = SNAP_DISTANCE) {
  let { x, y } = item;
  let bestX = distance + 1;
  let bestY = distance + 1;
  const tryX = (target) => { const gap = Math.abs(target - x); if (gap < bestX) { bestX = gap; x = target; } };
  const tryY = (target) => { const gap = Math.abs(target - y); if (gap < bestY) { bestY = gap; y = target; } };
  const startX = x;
  const startY = y;
  tryX(0); tryX(room.width - item.width); tryY(0); tryY(room.height - item.height);
  for (const other of others) {
    if (other.id === item.id) continue;
    const reachesY = Math.min(startY + item.height, other.y + other.height) - Math.max(startY, other.y) > -distance;
    const reachesX = Math.min(startX + item.width, other.x + other.width) - Math.max(startX, other.x) > -distance;
    if (reachesY) { tryX(other.x - item.width); tryX(other.x + other.width); tryX(other.x); tryX(other.x + other.width - item.width); }
    if (reachesX) { tryY(other.y - item.height); tryY(other.y + other.height); tryY(other.y); tryY(other.y + other.height - item.height); }
  }
  return { ...item, x: bestX <= distance ? x : startX, y: bestY <= distance ? y : startY };
}

const round = (value) => Math.round(value * 4) / 4;

/**
 * Move an item toward a wanted position without ever overlapping another piece or leaving the room.
 * Tries the exact spot, then each axis alone, then the furthest point along the straight path.
 */
export function resolveMove(items, id, wanted, room, { snap = true } = {}) {
  const current = items.find((item) => item.id === id);
  if (!current) return items;
  const others = items.filter((item) => item.id !== id);
  const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));
  const target = { ...current, x: clamp(wanted.x, 0, room.width - current.width), y: clamp(wanted.y, 0, room.height - current.height) };
  const candidates = [snap ? snapToEdges(target, others, room) : target];
  if (snap) candidates.push(target);
  candidates.push({ ...target, y: current.y }, { ...target, x: current.x });
  let chosen = candidates.find((candidate) => isFree(candidate, others, room));
  if (!chosen) {
    let low = 0;
    let high = 1;
    for (let step = 0; step < 18; step += 1) {
      const mid = (low + high) / 2;
      const probe = { ...current, x: current.x + (target.x - current.x) * mid, y: current.y + (target.y - current.y) * mid };
      if (isFree(probe, others, room)) low = mid; else high = mid;
    }
    chosen = { ...current, x: current.x + (target.x - current.x) * low, y: current.y + (target.y - current.y) * low };
  }
  const placed = { ...chosen, x: round(chosen.x), y: round(chosen.y) };
  const final = isFree(placed, others, room) ? placed : current;
  return items.map((item) => (item.id === id ? final : item));
}

/** Rotate an item 90 degrees about its centre, then nudge it to the nearest free spot. Returns null if it cannot fit. */
export function rotateItem(items, id, room, turn = 90) {
  const current = items.find((item) => item.id === id);
  if (!current) return items;
  const others = items.filter((item) => item.id !== id);
  const rotation = current.free ? normalizeFreeRotation(current.rotation + turn) : normalizeRotation(current.rotation + turn);
  const box = current.free ? boundsFor(current.baseWidth, current.baseHeight, rotation) : rotatedSize(current.baseWidth, current.baseHeight, rotation);
  const centerX = current.x + current.width / 2;
  const centerY = current.y + current.height / 2;
  const base = { ...current, rotation, width: box.width, height: box.height };
  const start = { ...base, x: Math.min(Math.max(centerX - box.width / 2, 0), room.width - box.width), y: Math.min(Math.max(centerY - box.height / 2, 0), room.height - box.height) };
  for (let radius = 0; radius <= 48; radius += 2) {
    for (let dx = -radius; dx <= radius; dx += 2) {
      for (let dy = -radius; dy <= radius; dy += 2) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        const probe = { ...start, x: start.x + dx, y: start.y + dy };
        if (isFree(probe, others, room)) return items.map((item) => (item.id === id ? probe : item));
      }
    }
  }
  return null;
}

/** First free spot for a new piece, scanning the room from the top-left in 6 inch steps. Returns null if the room is full. */
export function findFreeSpot(item, items, room) {
  const margin = 12;
  for (let y = margin; y + item.height <= room.height; y += 6) {
    for (let x = margin; x + item.width <= room.width; x += 6) {
      if (isFree({ ...item, x, y }, items, room)) return { x, y };
    }
  }
  return null;
}

/** Overall footprint of the arrangement and the gap to each wall. */
export function layoutSummary(items, room) {
  if (!items.length) return null;
  const left = Math.min(...items.map((item) => item.x));
  const top = Math.min(...items.map((item) => item.y));
  const right = Math.max(...items.map((item) => item.x + item.width));
  const bottom = Math.max(...items.map((item) => item.y + item.height));
  return { width: right - left, depth: bottom - top, gaps: { left, top, right: room.width - right, bottom: room.height - bottom } };
}

export function formatInches(value) {
  const total = Math.round(value * 2) / 2;
  const feet = Math.floor(total / 12);
  const inches = total - feet * 12;
  const inchText = Number.isInteger(inches) ? String(inches) : inches.toFixed(1);
  if (!feet) return `${inchText}″`;
  return inches ? `${feet}′ ${inchText}″` : `${feet}′`;
}

/** Starting layouts the Studio can offer. Each is shown only for collections whose pieces actually build and validate. */
export const PRESET_LAYOUTS = [
  ['loveseat', 'Loveseat'], ['sofa-three', 'Sofa'], ['sofa-console', 'Sofa with console'], ['straight-chaise', 'Sofa with chaise'],
  ['l-standard', 'L-shape, leg left'], ['l-mirror', 'L-shape, leg right'], ['l-middle', 'L with middle seat'], ['l-console', 'L with console'], ['u-shape', 'U-shape'],
];

const pick = (pieces, pattern) => pieces.find((piece) => pattern.test(piece.key) && !/attached_corner/i.test(piece.key));

/**
 * Starting layouts built edge to edge from the catalog dimensions. Returns null when the collection
 * does not list every piece a layout needs, or when the layout would not fit the room.
 */
export function presetItems(kind, profile, pieces, room) {
  const left = pick(pieces, /^LA_(?:recliner|chair|loveseat|sofa|power)/i) || pick(pieces, /^LA_(?:recliner|chair|loveseat|sofa)/i);
  const right = pick(pieces, /^RA_(?:recliner|chair|loveseat|sofa|power)/i) || pick(pieces, /^RA_(?:recliner|chair|loveseat|sofa)/i);
  const corner = pick(pieces, /^corner/i);
  const middle = pick(pieces, /armless_(?:chair|loveseat|recliner)/i);
  const console = pick(pieces, /console/i);
  const chaiseLeft = pick(pieces, /^LA_chaise/i);
  const chaiseRight = pick(pieces, /^RA_chaise/i);
  const make = (piece, x, y, rotation = 0, options = {}) => (piece ? createItem(piece, profile, x, y, rotation, undefined, options) : null);
  const size = (piece, rotation = 0) => { const item = make(piece, 0, 0, rotation); return item && { width: item.width, height: item.height }; };
  let items;

  if (kind === 'l-standard' || kind === 'l-console') {
    if (!left || !right || !corner || (kind === 'l-console' && !console)) return null;
    const c = size(corner); const l = size(right, 270); const r = size(left); const s = kind === 'l-console' ? size(console) : null;
    if (!c || !l || !r || (kind === 'l-console' && !s)) return null;
    const runWidth = c.width + (s ? s.width : 0) + r.width;
    const totalWidth = Math.max(runWidth, l.width);
    const originX = (room.width - totalWidth) / 2;
    const originY = (room.height - (c.height + l.height)) / 2;
    const cornerItem = make(corner, originX, originY);
    const down = make(right, cornerItem.x, cornerItem.y + cornerItem.height, 270);
    const runY = () => cornerItem.y; // run pieces sit flush against the same wall as the corner's back
    items = [down, cornerItem];
    let cursor = cornerItem.x + cornerItem.width;
    if (s) { const consoleItem = make(console, cursor, runY()); items.push(consoleItem); cursor += consoleItem.width; }
    items.push(make(left, cursor, runY()));
  } else if (kind === 'u-shape') {
    if (!left || !right || !corner || !middle) return null;
    const c = size(corner); const m = size(middle); const l = size(right, 270); const r = size(left, 90);
    if (!c || !m || !l || !r) return null;
    const totalWidth = c.width * 2 + m.width;
    const originX = (room.width - totalWidth) / 2;
    const originY = (room.height - (c.height + Math.max(l.height, r.height))) / 2;
    const cornerLeft = make(corner, originX, originY, 0);
    const mid = make(middle, cornerLeft.x + cornerLeft.width, cornerLeft.y, 0);
    const cornerRight = make(corner, mid.x + mid.width, originY, 0, { mirror: true });
    const leftSeat = make(right, cornerLeft.x, cornerLeft.y + cornerLeft.height, 270);
    const rightSeat = make(left, cornerRight.x + cornerRight.width - r.width, cornerRight.y + cornerRight.height, 90);
    items = [leftSeat, cornerLeft, mid, cornerRight, rightSeat];
  } else if (kind === 'straight-chaise') {
    // Left/right is the sitter's. Seen from above the right-arm end sits at the drawing's left.
    const startPiece = chaiseRight || (chaiseLeft ? right : null);
    const endPiece = chaiseRight ? left : chaiseLeft;
    if (!startPiece || !endPiece) return null;
    const a = size(startPiece); const m = middle ? size(middle) : null; const b = size(endPiece);
    if (!a || !b || (middle && !m)) return null;
    const totalWidth = a.width + (m ? m.width : 0) + b.width;
    const tallest = Math.max(a.height, b.height);
    const originX = (room.width - totalWidth) / 2;
    const originY = (room.height - tallest) / 2;
    const first = make(startPiece, originX, originY + (tallest - a.height) / 2);
    items = [first];
    let cursor = first.x + first.width;
    if (m) { const mid = make(middle, cursor, originY + (tallest - m.height) / 2); items.push(mid); cursor += mid.width; }
    items.push(make(endPiece, cursor, originY + (tallest - b.height) / 2));
  } else if (kind === 'l-middle') {
    // Corner, one armless seat, then the arm end; the leg comes down at the left.
    if (!left || !right || !corner || !middle) return null;
    const c = size(corner); const m = size(middle); const l = size(right, 270); const r = size(left);
    if (!c || !m || !l || !r) return null;
    const originX = (room.width - Math.max(c.width + m.width + r.width, l.width)) / 2;
    const originY = (room.height - (c.height + l.height)) / 2;
    const cornerItem = make(corner, originX, originY);
    const down = make(right, cornerItem.x, cornerItem.y + cornerItem.height, 270);
    const mid = make(middle, cornerItem.x + cornerItem.width, cornerItem.y);
    items = [down, cornerItem, mid, make(left, mid.x + mid.width, cornerItem.y)];
  } else if (kind === 'l-mirror') {
    // The same L turned the other way: arm end, optional console, mirrored corner, leg down at the right.
    if (!left || !right || !corner) return null;
    const c = size(corner); const r = size(right); const l = size(left, 90);
    if (!c || !r || !l) return null;
    const originX = (room.width - Math.max(r.width + c.width, r.width + l.width)) / 2;
    const originY = (room.height - (c.height + l.height)) / 2;
    const first = make(right, originX, originY);
    const cornerItem = make(corner, first.x + first.width, originY, 0, { mirror: true });
    const down = make(left, cornerItem.x + cornerItem.width - l.width, cornerItem.y + cornerItem.height, 90);
    items = [first, cornerItem, down];
  } else if (kind === 'sofa-three' || kind === 'loveseat' || kind === 'sofa-console') {
    // A straight run: right-arm end at the drawing's left, left-arm end at its right.
    if (!left || !right || (kind === 'sofa-three' && !middle) || (kind === 'sofa-console' && !console)) return null;
    const between = kind === 'sofa-three' ? middle : kind === 'sofa-console' ? console : null;
    const parts = [right, ...(between ? [between] : []), left];
    const sizes = parts.map((piece) => size(piece));
    if (sizes.some((entry) => !entry)) return null;
    const totalWidth = sizes.reduce((sum, entry) => sum + entry.width, 0);
    const tallest = Math.max(...sizes.map((entry) => entry.height));
    let cursor = (room.width - totalWidth) / 2;
    const originY = (room.height - tallest) / 2;
    items = parts.map((piece, index) => { const item = make(piece, cursor, originY); cursor += sizes[index].width; return item; });
  } else return null;

  if (items.some((item) => !item)) return null;
  const fits = items.every((item, index) => isFree(item, items.slice(0, index), room));
  return fits ? items.map((item) => ({ ...item, x: round(item.x), y: round(item.y) })) : null;
}

/* ---------------------------------------------------------------------------------------------------------------
 * Connection prediction. Every piece has connection faces: the two ends of a seat piece (an end with an arm is not a
 * face), and the two attach faces of a corner. A new piece can only go where one of its faces meets an open face of a
 * placed piece, with the back-ends touching (so backs run along one line), and it must face the same side of the run,
 * never away from its neighbour. Everything below is plain geometry on the catalog sizes.
 * ------------------------------------------------------------------------------------------------------------- */
const SITTER_LEFT_ARM = ['seat', 'arm-left', 'chaise-left'];
const SITTER_RIGHT_ARM = ['seat', 'arm-right', 'chaise-right'];
const turnVector = (rotation, [x, y]) => {
  switch (normalizeRotation(rotation)) {
    case 90: return [-y, x];
    case 180: return [-x, -y];
    case 270: return [y, -x];
    default: return [x, y];
  }
};
/** Where a point in a piece's own drawing frame (back on top, seat facing down) lands on the plan. */
function toWorld(item, [lx, ly]) {
  const { x, y, baseWidth: w, baseHeight: d } = item;
  switch (normalizeRotation(item.rotation)) {
    case 90: return [x + d - ly, y + lx];
    case 180: return [x + w - lx, y + d - ly];
    case 270: return [x + ly, y + w - lx];
    default: return [x + lx, y + ly];
  }
}
/** Connection faces in the piece's own frame: outward normal, the end of the face that sits against the back, and its length. */
export function connectionFaces(item) {
  const w = item.baseWidth; const d = item.baseHeight;
  if (item.kind === 'ottoman') return [];
  if (item.kind === 'corner') {
    const f = item.attachIn || w;
    return [{ side: 'right', normal: [1, 0], backEnd: [w, 0], span: f }, { side: 'bottom', normal: [0, 1], backEnd: [0, w], span: f }];
  }
  const faces = [];
  if (!SITTER_RIGHT_ARM.includes(item.kind)) faces.push({ side: 'left', normal: [-1, 0], backEnd: [0, 0], span: d });
  if (!SITTER_LEFT_ARM.includes(item.kind)) faces.push({ side: 'right', normal: [1, 0], backEnd: [w, 0], span: d });
  return faces;
}
const facingOf = (item) => (item.kind === 'corner' ? [1, 1] : [0, 1]);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];

const touching = (a, b) => {
  const gap = 2;
  const alongX = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > gap;
  const alongY = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > gap;
  return (alongX && (Math.abs(a.x + a.width - b.x) <= gap || Math.abs(b.x + b.width - a.x) <= gap))
    || (alongY && (Math.abs(a.y + a.height - b.y) <= gap || Math.abs(b.y + b.height - a.y) <= gap));
};

/** Slide the pieces beyond `anchor`'s face along the run by the new piece's length. Returns { ids, dx, dy } or null if they do not fit. */
function insertionShift(placed, anchor, outward, items, room) {
  const blockers = items.filter((other) => other.id !== anchor.id && overlaps(placed, other));
  if (!blockers.length) return null;
  const queue = [...blockers]; const moving = new Map(blockers.map((entry) => [entry.id, entry]));
  while (queue.length) {
    const current = queue.shift();
    for (const other of items) {
      if (other.id === anchor.id || moving.has(other.id) || !touching(current, other)) continue;
      moving.set(other.id, other); queue.push(other);
    }
  }
  const length = outward[0] ? placed.width : placed.height;
  const dx = outward[0] * length; const dy = outward[1] * length;
  const moved = items.map((entry) => (moving.has(entry.id) ? { ...entry, x: entry.x + dx, y: entry.y + dy } : entry));
  const everything = [...moved, placed];
  if (!everything.every((entry) => insideRoom(entry, room))) return null;
  if (everything.some((entry, index) => everything.some((other, at) => at > index && overlaps(entry, other)))) return null;
  return { ids: [...moving.keys()], dx, dy };
}

/** The plan after putting `draft` at `spot`, sliding the pieces beyond it if the spot is an insertion. */
export function applyPlacement(items, draft, spot) {
  const moved = items.map((entry) => (spot.shift?.ids.includes(entry.id) ? { ...entry, x: entry.x + spot.shift.dx, y: entry.y + spot.shift.dy } : entry));
  const box = rotatedSize(draft.baseWidth, draft.baseHeight, spot.rotation);
  return [...moved, { ...draft, x: spot.x, y: spot.y, rotation: spot.rotation, width: box.width, height: box.height }];
}

/**
 * Every spot where `draft` (a piece made with createItem) can connect to the plan, as { x, y, rotation, anchorId, anchorSide, side }.
 * Spots outside the room or overlapping a piece are left out. An empty plan returns [].
 */
export function placementCandidates(draft, items, room) {
  const found = [];
  const seen = new Set();
  for (const anchor of items) {
    const anchorTurn = normalizeRotation(anchor.rotation);
    for (const face of connectionFaces(anchor)) {
      const target = toWorld(anchor, face.backEnd);
      const outward = turnVector(anchorTurn, face.normal);
      for (const rotation of [0, 90, 180, 270]) {
        const box = rotatedSize(draft.baseWidth, draft.baseHeight, rotation);
        const probe = { ...draft, x: 0, y: 0, rotation };
        for (const own of connectionFaces(draft)) {
          const inward = turnVector(rotation, own.normal);
          if (inward[0] !== -outward[0] || inward[1] !== -outward[1]) continue;
          if (dot(turnVector(rotation, facingOf(draft)), turnVector(anchorTurn, facingOf(anchor))) < 0) continue;
          const [ox, oy] = toWorld(probe, own.backEnd);
          const spot = { x: Math.round((target[0] - ox) * 2) / 2, y: Math.round((target[1] - oy) * 2) / 2, rotation };
          const placed = { ...draft, ...spot, width: box.width, height: box.height };
          const key = `${spot.x}|${spot.y}|${rotation}`;
          if (seen.has(key)) continue;
          if (isFree(placed, items, room)) {
            seen.add(key);
            found.push({ ...spot, anchorId: anchor.id, anchorSide: face.side, side: own.side });
            continue;
          }
          // Occupied: the piece can still go in if everything beyond this connection slides along the run to make room.
          const shift = insertionShift(placed, anchor, outward, items, room);
          if (!shift) continue;
          seen.add(key);
          found.push({ ...spot, anchorId: anchor.id, anchorSide: face.side, side: own.side, shift });
        }
      }
    }
  }
  return found;
}

/**
 * Order candidate spots best first. `validate(items)` returns the layout checks (errors/warnings) for a trial plan; spots that
 * break a layout rule sort last. Reach conflicts, then closeness to the selected or newest piece, then wall contact, break ties.
 */
export function rankPlacements(draft, candidates, items, room, { validate, selectedId } = {}) {
  const newest = items[items.length - 1]?.id;
  return candidates.map((spot) => {
    const box = rotatedSize(draft.baseWidth, draft.baseHeight, spot.rotation);
    const trial = { ...draft, ...spot, width: box.width, height: box.height };
    const plan = applyPlacement(items, draft, spot);
    const checks = validate ? validate(plan) : { errors: [] };
    const blocked = reachConflicts(plan, room).length;
    const wall = [trial.x, trial.y, room.width - (trial.x + trial.width), room.height - (trial.y + trial.height)].some((gap) => gap <= 1) ? 0 : 1;
    const anchorRank = spot.anchorId === selectedId ? 0 : spot.anchorId === newest ? 1 : 2;
    return { ...spot, width: box.width, height: box.height, errors: checks.errors, score: checks.errors.length * 100 + blocked * 10 + anchorRank * 3 + wall + (spot.shift ? 2 : 0) };
  }).sort((a, b) => a.score - b.score);
}

/** What a free-standing guide style looks like from above: a recliner, a sofa, an ottoman or a chair. */
export function freeKind(row) {
  const text = `${row.name || ''} ${row.category || ''}`;
  if (/ottoman|footstool/i.test(text)) return 'ottoman';
  if (Number(row.dims?.fullyExtended) > Number(row.dims?.depth)) return 'recliner';
  if (/sofa|loveseat|sleep|settee|sectional/i.test(text)) return 'sofa';
  return 'chair';
}

/** A free-standing item from a style-index row (April 2026 guide). Null when the guide gives no width and depth. */
export function createFreeItem(row, x = 0, y = 0, rotation = 0) {
  const d = row?.dims || {};
  if (!(d.width > 0) || !(d.depth > 0)) return null;
  const turn = normalizeFreeRotation(rotation);
  const box = boundsFor(d.width, d.depth, turn);
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, free: true, kind: freeKind(row),
    modelCode: String(row.model), modelName: row.name, prefix: row.prefix, category: row.category || '', name: row.category || row.name,
    code: `${row.prefix}${row.model}`, x, y, width: box.width, height: box.height, baseWidth: d.width, baseHeight: d.depth, heightIn: d.height || null,
    reachIn: Number(d.fullyExtended) > d.depth ? Number(d.fullyExtended) : null, rotation: turn, publishedWidth: d.width,
    seatWidth: d.seatWidth || null, seatDepth: d.seatDepth || null, config: {}, dimensionsLabel: '',
  };
}
