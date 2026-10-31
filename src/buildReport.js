// The full build report: one organised view of everything in the plan. Pure functions; nothing here prices or orders.
import { getGuideStyle } from './logic.js';
import { coverSummary, lineIssues, rmsEntryText, sortedLines } from './plan.js';

const inches = (value) => (Number.isFinite(value) ? `${value} in` : '');

/** The sections of one plan line, ready to draw or print. Only fields present in the data are returned. */
export function reportLine(catalog, line, number) {
  const details = line.details || {};
  const row = line.modelCode && line.styleCode ? getGuideStyle(catalog, line.modelCode, line.styleCode) : null;
  const d = row?.dims || {};
  const sections = [];
  const add = (title, rows) => { const kept = rows.filter(([, value]) => value); if (kept.length) sections.push({ title, rows: kept }); };

  add('Piece', [
    ['Type', line.kind === 'sectional' ? 'Sectional' : line.type],
    ['Model', `${line.modelName || line.title}${line.modelCode ? ` · ${line.modelCode}` : ''}`],
    ['Style', line.styleCode ? `${line.styleCode}${line.detail ? ` · ${line.detail}` : ''}` : line.detail],
    ['Quantity', line.qty > 1 ? String(line.qty) : ''],
  ]);
  add('Cover', [
    ['Cover code', details.cover?.code || line.coverCode],
    ['Name', details.cover?.name || line.coverName],
    ['Material', details.cover?.material],
    ['Grade', details.cover?.grade],
  ]);
  add('Finish, trim and cushion', [
    ['Wood finish', details.finish ? `${details.finish.name} (FN ${details.finish.code})` : ''],
    ['Nailhead trim', details.trim ? `${details.trim.name} (${details.trim.code})` : ''],
    ['Cushion', details.cushion ? `${details.cushion.name} (${details.cushion.code})` : ''],
    ['Pillows', details.pillows],
  ]);
  if (details.options?.length) sections.push({ title: 'Options', rows: details.options.map((option) => [option.code, option.name || 'No description in the supplied data']) });
  if (details.companions?.length) sections.push({ title: 'Also enter in RMS as separate lines', rows: details.companions.map((item) => [item.label, item.code]) });
  add('Size, from the April 2026 guide', [
    ['Width', inches(d.width)], ['Depth', inches(d.depth)], ['Height', inches(d.height)], ['Seat height', inches(d.seatHeight)],
    ['Fully extended', inches(d.fullyExtended)], ['Wall space', inches(d.wallSpace)],
  ]);
  if (line.kind === 'sectional' && line.pieceDetails?.length) sections.push({ title: 'Pieces', rows: line.pieceDetails.map((piece, index) => [String(index + 1), [piece.name, piece.code, piece.size].filter(Boolean).join(' · ')]) });
  else if (line.kind === 'sectional' && line.pieces?.length) sections.push({ title: 'Pieces', rows: line.pieces.map((piece, index) => [String(index + 1), piece]) });
  if (line.note) add('Note', [['Note', line.note]]);
  return { number, id: line.id, heading: `${line.modelName || line.title}${line.modelCode ? ` ${line.modelCode}` : ''}`, type: line.kind === 'sectional' ? 'Sectional' : line.type, sections, rms: line.rms || [], issues: lineIssues(line), qty: line.qty };
}

export function buildFullReport(catalog, plan, fit = null) {
  const ordered = sortedLines(plan.lines || []);
  const lines = ordered.map((line, index) => reportLine(catalog, line, index + 1));
  const covers = coverSummary(plan.lines || []);
  const rms = rmsEntryText(plan.lines || []);
  const companions = ordered.flatMap((line) => (line.details?.companions || []).map((item) => `${item.code}  (${item.label}, with ${line.modelName} ${line.styleCode})`));
  return {
    customer: plan.customer || '', count: lines.reduce((sum, line) => sum + line.qty, 0), lines, covers, rms,
    companions, open: lines.flatMap((line) => line.issues.map((issue) => `#${line.number} ${line.heading}: ${issue}`)), fit,
  };
}

/** Plain text of the report for copying into a note or message. */
export function reportText(report) {
  const out = [`FULL BUILD REPORT${report.customer ? ` · ${report.customer}` : ''} · ${report.count} ${report.count === 1 ? 'item' : 'items'}`, ''];
  for (const line of report.lines) {
    out.push(`${line.number}. ${line.heading} (${line.type})${line.qty > 1 ? ` x${line.qty}` : ''}`);
    for (const section of line.sections) { out.push(`  ${section.title}`); section.rows.forEach(([label, value]) => out.push(`    ${label}: ${value}`)); }
    if (line.rms.length) { out.push('  RMS entry'); line.rms.forEach((entry) => out.push(`    ${entry}`)); }
    line.issues.forEach((issue) => out.push(`  ! ${issue}`));
    out.push('');
  }
  if (report.rms.text) out.push('ALL RMS ENTRIES', report.rms.text, '');
  out.push('Entry references only. Confirm style, cover, options and availability in RMS before promising anything.');
  return out.join('\n');
}
