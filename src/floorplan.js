// Real-scale floor plan geometry for the Sectional Studio.
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
export function createItem(piece, profile, x, y, rotation = 0, code) {
  const source = profile.pieces.find((entry) => entry.key === piece.key);
  const size = parsePieceDimensions(source?.dimensions_text);
  if (!size) return null;
  const turn = normalizeRotation(rotation);
  const box = rotatedSize(size.width, size.depth, turn);
  const reach = Number(source?.fully_extended_in) > size.depth ? Number(source.fully_extended_in) : null;
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    modelCode: String(profile.model_code), modelName: profile.model_name, family: profile.sectional_family,
    key: piece.key, name: piece.name, code: code || piece.variants?.[0]?.code || String(piece.prefix || '').split('/')[0].trim(),
    x, y, width: box.width, height: box.height, baseWidth: size.width, baseHeight: size.depth, heightIn: size.height,
    rotation: turn, dimensionsLabel: source?.dimensions_text || '', reachIn: reach, kind: pieceKind(piece.key),
  };
}

export const overlaps = (a, b, tolerance = EPSILON) => Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > tolerance
  && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > tolerance;

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

/** Which recliners cannot fully extend because a wall or another piece is in the way. Warnings only. */
export function reachConflicts(items, room) {
  const conflicts = [];
  for (const item of items) {
    const zone = reachRect(item);
    if (!zone) continue;
    const outside = zone.x < -EPSILON || zone.y < -EPSILON || zone.x + zone.width > room.width + EPSILON || zone.y + zone.height > room.height + EPSILON;
    const blocker = items.find((other) => other.id !== item.id && overlaps(zone, other));
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
  const rotation = normalizeRotation(current.rotation + turn);
  const box = rotatedSize(current.baseWidth, current.baseHeight, rotation);
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

const pick = (pieces, pattern) => pieces.find((piece) => pattern.test(piece.key));

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
  const make = (piece, x, y, rotation = 0) => (piece ? createItem(piece, profile, x, y, rotation) : null);
  const size = (piece, rotation = 0) => { const item = make(piece, 0, 0, rotation); return item && { width: item.width, height: item.height }; };
  let items;

  if (kind === 'l-standard' || kind === 'l-console') {
    if (!left || !right || !corner || (kind === 'l-console' && !console)) return null;
    const c = size(corner); const l = size(left, 270); const r = size(right); const s = kind === 'l-console' ? size(console) : null;
    if (!c || !l || !r || (kind === 'l-console' && !s)) return null;
    const runWidth = c.width + (s ? s.width : 0) + r.width;
    const totalWidth = Math.max(runWidth, l.width);
    const originX = (room.width - totalWidth) / 2;
    const originY = (room.height - (c.height + l.height)) / 2;
    const cornerItem = make(corner, originX, originY);
    const down = make(left, cornerItem.x + (cornerItem.width - l.width) / 2, cornerItem.y + cornerItem.height, 270);
    const runY = (high) => cornerItem.y + (cornerItem.height - high) / 2;
    items = [down, cornerItem];
    let cursor = cornerItem.x + cornerItem.width;
    if (s) { const consoleItem = make(console, cursor, runY(s.height)); items.push(consoleItem); cursor += consoleItem.width; }
    items.push(make(right, cursor, runY(r.height)));
  } else if (kind === 'u-shape') {
    if (!left || !right || !corner || !middle) return null;
    const c = size(corner); const m = size(middle); const l = size(left, 270); const r = size(right, 90);
    if (!c || !m || !l || !r) return null;
    const totalWidth = c.width * 2 + m.width;
    const originX = (room.width - totalWidth) / 2;
    const originY = (room.height - (c.height + Math.max(l.height, r.height))) / 2;
    const cornerLeft = make(corner, originX, originY, 0);
    const mid = make(middle, cornerLeft.x + cornerLeft.width, cornerLeft.y + (cornerLeft.height - m.height) / 2, 0);
    const cornerRight = make(corner, mid.x + mid.width, originY, 0);
    const leftSeat = make(left, cornerLeft.x + (cornerLeft.width - l.width) / 2, cornerLeft.y + cornerLeft.height, 270);
    const rightSeat = make(right, cornerRight.x + (cornerRight.width - r.width) / 2, cornerRight.y + cornerRight.height, 90);
    items = [leftSeat, cornerLeft, mid, cornerRight, rightSeat];
  } else if (kind === 'straight-chaise') {
    const chaise = chaiseLeft;
    const end = chaiseRight || right;
    if (!chaise || !end) return null;
    const a = size(chaise); const m = middle ? size(middle) : null; const b = size(end);
    if (!a || !b || (middle && !m)) return null;
    const totalWidth = a.width + (m ? m.width : 0) + b.width;
    const originX = (room.width - totalWidth) / 2;
    const originY = (room.height - a.height) / 2;
    const first = make(chaise, originX, originY);
    items = [first];
    let cursor = first.x + first.width;
    if (m) { const mid = make(middle, cursor, originY + (a.height - m.height) / 2); items.push(mid); cursor += mid.width; }
    items.push(make(end, cursor, originY + (a.height - b.height) / 2));
  } else return null;

  if (items.some((item) => !item)) return null;
  const fits = items.every((item, index) => isFree(item, items.slice(0, index), room));
  return fits ? items.map((item) => ({ ...item, x: round(item.x), y: round(item.y) })) : null;
}
