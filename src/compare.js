export const MISSING = 'not in the supplied data';

const inches = (value) => (Number.isFinite(value) ? `${value} in` : MISSING);
const list = (value) => (Array.isArray(value) && value.length ? value.join(', ') : MISSING);
const text = (value) => (value ? String(value) : MISSING);

/** Display name for one April 2026 guide row, e.g. "Trouper 44A724". */
export const styleTitle = (row) => `${String(row.name || row.model).charAt(0)}${String(row.name || row.model).slice(1).toLowerCase()} ${row.prefix}${row.model}`;

/**
 * Side-by-side rows for 2-3 guide style rows. Every cell is copied from the guide;
 * a missing field says so rather than being estimated. `differs` marks rows worth a look.
 */
export function compareStyleRows(rows) {
  const picked = (rows || []).filter(Boolean).slice(0, 3);
  const d = (row) => row.dims || {};
  const finish = (row) => [row.standardFinish && `${row.standardFinish.name} (standard)`, ...(row.optionalFinishes || []).map((item) => item.name)].filter(Boolean);
  const defs = [
    ['Type', (row) => text(row.category)],
    ['Height', (row) => inches(d(row).height)],
    ['Width', (row) => inches(d(row).width)],
    ['Depth', (row) => inches(d(row).depth)],
    ['Seat height', (row) => inches(d(row).seatHeight)],
    ['Seat width', (row) => inches(d(row).seatWidth)],
    ['Seat depth', (row) => inches(d(row).seatDepth)],
    ['Arm height', (row) => inches(d(row).armHeight)],
    ['Fully extended', (row) => inches(d(row).fullyExtended)],
    ['Wall space needed', (row) => inches(d(row).wallSpace)],
    ['Weight', (row) => (Number.isFinite(d(row).weight) ? `${d(row).weight} lb (chair weight)` : MISSING)],
    ['Back', (row) => text(row.backs)],
    ['Seat', (row) => text(row.seats)],
    ['Cover cap codes', (row) => list(row.capCodes)],
    ['Options', (row) => list(row.options)],
    ['Finishes', (row) => (finish(row).length ? finish(row).join(', ') : MISSING)],
    ['Battery pack', (row) => text(row.batteryPack)],
  ];
  return {
    columns: picked.map((row) => ({ key: `${row.prefix}${row.model}`, title: styleTitle(row) })),
    rows: defs.map(([label, read]) => { const values = picked.map(read); return { label, values, differs: new Set(values).size > 1 }; }),
  };
}
