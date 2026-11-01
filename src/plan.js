// The customer plan: every piece a customer wants, collected from the Fit wizard, SKU Builder, Room Builder and the
// Product Index, with the notes for the store system built from it. Pure functions only; nothing here reads the DOM.
// Nothing in a plan is a price, a stock level or an order. A line is a reference to confirm in RMS.
import { FIT_NEEDS, getGuideStyleRows, heightInches } from './logic.js';

export const PLAN_STORAGE_KEY = 'floor-plan-v1';
export const NOTE_LIMIT = 1000;

const TYPE_RULES = [
  [/sectional|corner|armless|chaise|console|wedge|sitting/i, 'Sectional piece'],
  [/lift/i, 'Lift chair'],
  [/sleep/i, 'Sleeper'],
  [/ottoman|footstool/i, 'Ottoman'],
  [/loveseat/i, 'Loveseat'],
  [/sofa/i, 'Sofa'],
  [/recliner|rocker|glider|swivel|reclining/i, 'Recliner'],
  [/chair/i, 'Chair'],
];
/** The role a piece plays in the room, from the guide's category text. 'Piece' when the text says nothing useful. */
export function pieceType(label = '') {
  const hit = TYPE_RULES.find(([pattern]) => pattern.test(String(label)));
  return hit ? hit[1] : 'Piece';
}

let counter = 0;
const lineId = () => `ln-${Date.now().toString(36)}-${(counter += 1).toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/**
 * A plan line. kind: 'lead' (a model worth considering, no style chosen yet), 'sku' (one RMS line) or 'sectional'
 * (a group of pieces from the Room Builder). `rms` holds the entry lines to confirm in RMS.
 */
export function makeLine(partial) {
  return {
    id: lineId(), kind: 'lead', type: 'Piece', title: '', modelCode: '', modelName: '', detail: '', cover: '', coverCode: '',
    rms: [], pieces: [], pieceDetails: [], details: null, qty: 1, note: '', source: '', warnings: [], addedAt: Date.now(), ...partial,
  };
}

/** "Pattern Colour" for a cover code like D185553, from the swatch index, or '' when the index does not name it. */
export function coverNameFor(swatchIndex, coverCode = '') {
  const entry = swatchIndex?.[coverCode];
  if (!entry) return '';
  return [entry.pattern_name, entry.color_name].filter(Boolean).join(' ');
}

/** A plan line from the SKU Builder: one RMS entry the rep has fully specified. */
export function lineFromSku({ swatchIndex, modelCode, modelName, styleCode, category, sku, coverCode, note = '', details = null }) {
  return makeLine({
    kind: 'sku', source: 'sku', type: pieceType(category), modelCode: String(modelCode), modelName, styleCode: String(styleCode || ''),
    title: `${modelName} ${styleCode || ''}`.trim(), detail: category || '', coverCode: coverCode || '', coverName: coverNameFor(swatchIndex, coverCode), rms: sku ? [sku] : [], note, details,
  });
}

/** A plan line from the Room Builder: the whole sectional as one group, with every piece's RMS entry. */
export function lineFromSectional({ swatchIndex, modelCode, modelName, family, detail, pieces = [], pieceDetails = [], rms = [], coverCode = '' }) {
  return makeLine({
    kind: 'sectional', source: 'studio', type: 'Sectional piece', modelCode: String(modelCode), modelName, title: `${modelName} sectional`,
    detail: detail || `${pieces.length} pieces`, family, pieces, pieceDetails, rms, coverCode, coverName: coverNameFor(swatchIndex, coverCode),
  });
}

/** A plan line for a model worth considering: no style, cover or options yet. */
export function lineFromLead({ source, modelCode, modelName, category = '', sectional = false, note = '', styleCode = '' }) {
  return makeLine({ kind: 'lead', source, type: sectional ? 'Sectional piece' : pieceType(category), modelCode: String(modelCode), modelName, styleCode: String(styleCode), title: modelName, detail: category, note });
}

/** Add a line, or raise the quantity when the same configured line is already there. */
export function addLine(plan, line) {
  const same = plan.lines.find((entry) => entry.kind === line.kind && entry.modelCode === line.modelCode && entry.kind !== 'sectional'
    && (line.kind === 'lead' || line.kind === 'pillow' ? entry.styleCode === line.styleCode && entry.detail === line.detail : entry.rms[0] && entry.rms[0] === line.rms[0]));
  if (same) return { ...plan, lines: plan.lines.map((entry) => (entry.id === same.id ? { ...entry, qty: Math.min(9, entry.qty + 1) } : entry)), merged: true };
  return { ...plan, lines: [...plan.lines, line], merged: false };
}

export function loadPlan(storage) {
  try {
    const saved = JSON.parse(storage?.getItem(PLAN_STORAGE_KEY) || 'null');
    if (saved && Array.isArray(saved.lines)) return { id: saved.id ? String(saved.id) : '', customer: String(saved.customer || ''), lines: saved.lines.filter((line) => line && line.id), layout: validLayout(saved.layout) ? saved.layout : null };
  } catch { /* storage blocked or corrupt: start empty */ }
  return { id: '', customer: '', lines: [], layout: null };
}

export function savePlan(storage, plan) {
  try { storage?.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan)); } catch { /* storage blocked: the plan lasts until the page closes */ }
}

/** What still has to happen before a line can be entered. Empty means it is ready to confirm in RMS. */
export function lineIssues(line) {
  const issues = [];
  if (line.kind === 'pillow') issues.push('Cover and entry to confirm in RMS');
  else if (line.kind === 'lead') issues.push('Style not chosen');
  else if (!line.coverCode) issues.push('Cover not chosen');
  for (const warning of line.warnings || []) issues.push(warning);
  return issues;
}

const unique = (list) => [...new Set(list.filter(Boolean))];

/** Other styles in the same collection as the plan's pieces: the sofa that goes with the chair, the ottoman, and so on. */
export function finishTheSet(catalog, lines, limit = 6) {
  const inPlan = new Set(lines.filter((line) => line.modelCode).map((line) => `${line.modelCode}|${line.styleCode || ''}`));
  const models = unique(lines.filter((line) => line.kind !== 'sectional' && line.modelCode).map((line) => String(line.modelCode)));
  const result = [];
  for (const modelCode of models) {
    const rows = getGuideStyleRows(catalog, modelCode).filter((row) => row.family !== 'SECTIONAL' && row.status !== 'discontinued');
    const items = rows
      .filter((row) => !inPlan.has(`${modelCode}|${row.prefix}`))
      .map((row) => ({ prefix: row.prefix, label: row.category || row.name, type: pieceType(row.category), dims: row.dims && row.dims.width ? `${row.dims.width}″ W × ${row.dims.depth}″ D` : '' }))
      .filter((item) => item.type !== 'Piece' && item.type !== 'Sectional piece');
    if (items.length) result.push({ modelCode, modelName: lines.find((line) => String(line.modelCode) === modelCode)?.modelName || modelCode, items: items.slice(0, limit) });
  }
  return result;
}

/** Cover codes that differ across the plan, so the rep can check they belong together. */
export function coverSummary(lines) {
  const covers = unique(lines.filter((line) => line.kind !== 'lead').map((line) => line.coverCode));
  return { covers, mixed: covers.length > 1, missing: lines.filter((line) => line.kind !== 'lead' && !line.coverCode).length };
}

const TYPE_ORDER = ['Sectional piece', 'Sofa', 'Loveseat', 'Recliner', 'Chair', 'Lift chair', 'Sleeper', 'Ottoman', 'Piece'];
const typeRank = (line) => { const rank = TYPE_ORDER.indexOf(line.kind === 'sectional' ? 'Sectional piece' : line.type); return rank < 0 ? TYPE_ORDER.length : rank; };
export const sortedLines = (lines) => [...lines].sort((a, b) => typeRank(a) - typeRank(b) || a.addedAt - b.addedAt);

const heightText = (value) => String(value || '').replace(/[′']/g, "'").replace(/[″"]/g, '"');
const fitSize = (inches) => (inches <= 63 ? 'Petite' : inches <= 69 ? 'Small' : inches <= 74 ? 'Tall' : 'Extra Tall');
const typeLabel = (line) => (line.kind === 'sectional' ? 'Sectional' : line.type === 'Piece' ? 'Piece' : line.type);
const qtyText = (line) => (line.qty > 1 ? ` x${line.qty}` : '');

function fitLine(fit) {
  if (!fit || !fit.height) return '';
  const inches = heightInches(fit.height);
  const parts = [`${heightText(fit.height)}${Number.isFinite(inches) ? ` (${fitSize(inches)})` : ''}`];
  if (Number(fit.weight) > 0) parts.push(`${Number(fit.weight)} lb`);
  const need = FIT_NEEDS.find((item) => item.key === fit.need && item.key !== 'unsure');
  if (need) parts.push(need.label.toLowerCase());
  if (fit.mechanism) parts.push(String(fit.mechanism).toLowerCase());
  if (fit.household?.length) parts.push(fit.household.join(' + ').toLowerCase());
  if (fit.material && fit.material !== 'No preference yet') parts.push(fit.material.toLowerCase());
  return parts.join(' · ');
}

function dropToFit(lines, limit) {
  const kept = [...lines];
  const join = () => kept.map((line) => line.text).join('\n');
  while (join().length > limit) {
    const worst = Math.max(...kept.map((line) => line.drop));
    if (worst === 0) break;
    kept.splice(kept.map((line) => line.drop).lastIndexOf(worst), 1);
  }
  const text = join();
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

const today = (date) => date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });

/**
 * The two notes for the store system. Internal goes in Hidden Notes: what to do next, in the order a colleague needs it.
 * Customer goes in Notes: a plain-language recap with no codes, weights, prices or promises. Both stay within `limit`.
 */
export function buildPlanNotes({ customer = '', lines = [], fit = null, date = new Date(), limit = NOTE_LIMIT } = {}) {
  const ordered = sortedLines(lines);
  const name = String(customer).trim();
  const open = ordered.flatMap((line, index) => lineIssues(line).map((issue) => `#${index + 1} ${issue.toLowerCase()}`));
  const fitText = fitLine(fit);

  const internal = [
    { text: `PLAN ${today(date)}${name ? ` · ${name}` : ''} · ${ordered.length} ${ordered.length === 1 ? 'item' : 'items'}`, drop: 0 },
    ...(fitText ? [{ text: `Fit: ${fitText}`, drop: 4 }] : []),
    ...ordered.map((line, index) => ({
      text: `${index + 1}. ${typeLabel(line)} · ${line.modelName || line.title}${line.modelCode ? ` ${line.modelCode}` : ''}${qtyText(line)}${line.kind === 'sectional' && line.detail ? ` · ${line.detail}` : ''}${line.coverCode ? ` · cover ${line.coverCode}` : ''}${line.kind === 'sku' && line.rms[0] ? ` · ${line.rms[0]}` : ''}${line.kind === 'sectional' && line.pieces?.length ? ` · ${line.pieces.join(', ')}` : ''}${line.note ? ` · ${line.note}` : ''}`,
      drop: 10 + index,
    })),
    ...(open.length ? [{ text: `Open: ${open.join('; ')}`, drop: 2 }] : [{ text: 'Open: nothing missing in the plan', drop: 6 }]),
    { text: 'Next: confirm style, cover, options and availability in RMS. Sit-test each piece before quoting.', drop: 0 },
  ];

  const customerLines = [
    { text: `${name ? `Hi ${name}, t` : 'T'}hanks for coming in. Here is what we talked about.`, drop: 0 },
    ...ordered.map((line, index) => ({
      text: `• ${typeLabel(line)}: ${line.modelName || line.title}${qtyText(line)}${line.kind === 'sectional' && line.detail ? `, ${line.detail}` : ''}${line.coverName ? `, in ${line.coverName}` : line.kind !== 'lead' && !line.coverCode ? ', cover still to choose' : ''}${line.kind === 'lead' ? ', style still to choose' : ''}`,
      drop: 10 + index,
    })),
    ...(fit?.household?.length ? [{ text: `With ${fit.household.join(' and ').toLowerCase()} at home, we will look at performance-rated covers.`, drop: 6 }] : []),
    { text: 'Next: sit in each piece, then we will confirm the cover, finish and options together. Pricing and delivery timing come with your quote.', drop: 0 },
  ];
  return { internal: dropToFit(internal, limit), customer: dropToFit(customerLines, limit) };
}

/** Every RMS entry line in the plan, one per line, for pasting into RMS. Lines still to configure are left out and listed after. */
export function rmsEntryText(lines) {
  const ready = sortedLines(lines).filter((line) => line.rms?.length);
  const body = ready.flatMap((line) => line.rms.map((entry) => (line.qty > 1 ? `${entry}  x${line.qty}` : entry)));
  const pending = sortedLines(lines).filter((line) => !line.rms?.length).map((line) => `${line.modelName || line.title} ${line.modelCode || ''}`.trim());
  return { text: body.join('\n'), pending };
}

/** A copy of a plan line with a fresh id, placed right after the original in the list. */
export function duplicateLine(plan, id) {
  const index = plan.lines.findIndex((line) => line.id === id);
  if (index < 0) return plan;
  const copy = { ...plan.lines[index], id: lineId(), addedAt: Date.now() };
  const lines = [...plan.lines.slice(0, index + 1), copy, ...plan.lines.slice(index + 1)];
  return { ...plan, lines };
}

/** Remove one line and report what was removed (and where) so it can be put back. */
export function removeLine(plan, id) {
  const index = plan.lines.findIndex((line) => line.id === id);
  if (index < 0) return { plan, removed: null };
  return { plan: { ...plan, lines: plan.lines.filter((line) => line.id !== id) }, removed: { line: plan.lines[index], index } };
}

/** Put a removed line back where it was (or at the end if the list is now shorter). */
export function restoreLine(plan, removed) {
  if (!removed || plan.lines.some((line) => line.id === removed.line.id)) return plan;
  const at = Math.min(removed.index, plan.lines.length);
  return { ...plan, lines: [...plan.lines.slice(0, at), removed.line, ...plan.lines.slice(at)] };
}

/** Saved customers: a list of plan snapshots the rep can come back to. Pure; the caller stores the list. */
export function saveCustomer(list, plan, now = Date.now()) {
  const id = plan.id || `cu-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const entry = { id, customer: plan.customer || '', lines: plan.lines, layout: plan.layout || null, savedAt: now };
  const rest = list.filter((item) => item.id !== id);
  return { list: [entry, ...rest].slice(0, 50), plan: { ...plan, id } };
}

export function openCustomer(list, id) {
  const entry = list.find((item) => item.id === id);
  return entry ? { id: entry.id, customer: entry.customer, lines: entry.lines, layout: entry.layout || null } : null;
}

export function deleteCustomer(list, id) {
  return list.filter((item) => item.id !== id);
}

export function customerLabel(entry) {
  const count = (entry.lines || []).reduce((sum, line) => sum + (line.qty || 1), 0);
  return { name: entry.customer || 'No name', count };
}

/**
 * A plan line for a custom pillow style (01P / 08P). No RMS entry is written: the guide gives the style and its allowed
 * cover cap codes, not an entry format for pillows, so the line is a reminder to confirm the cover and entry in RMS.
 */
export function lineFromPillow({ style, featherlite = false }) {
  const label = `${style.styleNumber.slice(0, 3)}-${style.styleNumber.slice(3)}`;
  const size = style.dims?.height && style.dims?.width ? `${style.dims.height} × ${style.dims.width} in` : '';
  return makeLine({
    kind: 'pillow', source: 'pillows', type: 'Pillow', modelCode: style.styleNumber, modelName: `Pillow ${label}`, styleCode: style.styleNumber,
    title: `Pillow ${label}`, detail: [style.category.replace(/^\(\d\)\s*/, ''), size, /^\(2\)/.test(style.category) ? 'pair' : 'single', featherlite ? 'Featherlite (FP)' : ''].filter(Boolean).join(' · '),
    note: '',
  });
}

const validLayout = (layout) => Boolean(layout && layout.room && Number(layout.room.width) > 0 && Number(layout.room.height) > 0 && Array.isArray(layout.items));

/** What the Room Builder drew, kept with the plan so the report can show it. Sizes are inches. */
export function layoutSnapshot(items, room) {
  return {
    room: { width: room.width, height: room.height },
    items: items.map((item) => ({
      code: item.code, name: item.name || item.modelName || '', free: Boolean(item.free), x: item.x, y: item.y, width: item.width, height: item.height,
      baseWidth: item.baseWidth || item.width, baseHeight: item.baseHeight || item.height, rotation: Number(item.rotation) || 0,
    })),
  };
}

/** Plain shapes for drawing a saved layout as a static schematic: a room outline and one labelled rectangle per piece. */
export function layoutShapes(layout) {
  if (!validLayout(layout)) return null;
  const { room } = layout;
  const shapes = layout.items.map((item, index) => {
    const cx = item.x + item.width / 2; const cy = item.y + item.height / 2;
    const turned = item.free && item.rotation % 90 !== 0;
    const w = item.free ? item.baseWidth : item.width; const h = item.free ? item.baseHeight : item.height;
    const sideways = item.free && item.rotation % 180 === 90;
    const dw = sideways ? h : w; const dh = sideways ? w : h;
    return { key: `${item.code}-${index}`, number: index + 1, code: item.code, name: item.name, x: cx - dw / 2, y: cy - dh / 2, width: dw, height: dh, turn: turned ? item.rotation : 0, cx, cy };
  });
  return { width: room.width, height: room.height, shapes };
}
