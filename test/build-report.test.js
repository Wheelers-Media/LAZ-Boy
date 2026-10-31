import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildFullReport, reportText } from '../src/buildReport.js';
import { makeLine, lineFromSku } from '../src/plan.js';

const catalog = JSON.parse(fs.readFileSync(new URL('../public/catalog_data-v2.json', import.meta.url), 'utf8'));
catalog.style_index_2026 = JSON.parse(fs.readFileSync(new URL('../public/style-index-2026.json', import.meta.url), 'utf8'));

test('a multi-piece build reports every piece with cover, options, extras and size', () => {
  const chair = lineFromSku({ swatchIndex: {}, modelCode: '724', modelName: 'Trouper', styleCode: '10X', category: 'Power Rocking Recliner w/ Headrest & Lumbar', sku: '10X-724 D185559 FN 007 LW SL', coverCode: 'D185559',
    details: { cover: { code: 'D185559', name: 'Test', material: 'Fabric', grade: 'D' }, finish: { code: '007', name: 'Brown Mahogany' }, options: [{ code: 'SL', name: 'Swivel base' }], companions: [{ label: 'Swivel base', code: '088126' }] } });
  const sofa = makeLine({ kind: 'lead', type: 'Sofa', modelCode: '724', modelName: 'Trouper', title: 'Trouper sofa' });
  const report = buildFullReport(catalog, { customer: 'Sam', lines: [chair, sofa] });
  assert.equal(report.lines.length, 2);
  const text = reportText(report);
  assert.match(text, /Brown Mahogany \(FN 007\)/);
  assert.match(text, /SL: Swivel base/);
  assert.match(text, /088126/);
  assert.ok(report.open.some((item) => /Style not chosen/.test(item)), 'unfinished piece is listed as open');
  assert.ok(report.lines.find((line) => line.type === 'Recliner').sections.some((section) => /Size/.test(section.title)), 'size comes from the guide row');
});
