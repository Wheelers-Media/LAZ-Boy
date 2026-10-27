/**
 * Renders the real App in happy-dom via Vite SSR, clicks through every tab,
 * and exercises the cross-page flows that previously leaked shared state.
 * Run: node --experimental-vm-modules scripts/.render-all-tabs.mjs
 */
import { readFileSync } from 'node:fs';

const log = (message) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${message}`);

const CATALOG_FILES = [
  'catalog_data-v2.json',
  'canada_lineup_research.json',
  'recliner-catalog-2026.json',
  'recliner-collection-index-supplement.json',
  'motion-catalog-2026.json',
  'designers-choice-catalog-2026.json',
  'stationary-catalog-2026.json',
  'april-2026-model-cover-applications.json',
  'fabric-cover-program-a26.json',
];
const payload = (file) => readFileSync(new URL(`../public/${file}`, import.meta.url), 'utf8');

const { Window, Browser } = await import('happy-dom');
const win = new Window({ url: 'http://localhost/' , settings: { disableJavaScriptEvaluation: true, disableCSSFileLoading: true } });
const document = win.document;
const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

const localFetch = (input, init) => {
  const url = String(input instanceof win.Request ? input.url : input);
  const path = url.startsWith('http') ? new URL(url).pathname : url;
  const file = CATALOG_FILES.find((name) => `/${name}` === path);
  if (file) {
    return Promise.resolve(new win.Response(payload(file), { status: 200, headers: { 'content-type': 'application/json' } }));
  }
  return Promise.resolve(new win.Response('not found', { status: 404 }));
};
win.fetch = localFetch;
globalThis.fetch = localFetch;

const defineGlobal = (name, value) => Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
for (const [name, value] of [['window', win], ['document', document], ['navigator', win.navigator], ['location', win.location], ['HTMLElement', win.HTMLElement], ['HTMLInputElement', win.HTMLInputElement], ['HTMLSelectElement', win.HTMLSelectElement], ['HTMLTextAreaElement', win.HTMLTextAreaElement], ['Element', win.Element], ['Node', win.Node], ['Event', win.Event], ['CustomEvent', win.CustomEvent], ['MouseEvent', win.MouseEvent], ['KeyboardEvent', win.KeyboardEvent], ['EventTarget', win.EventTarget], ['getComputedStyle', win.getComputedStyle]]) defineGlobal(name, value);
defineGlobal('requestAnimationFrame', (cb) => setTimeout(cb, 16));
defineGlobal('cancelAnimationFrame', (id) => clearTimeout(id));

log('happy-dom window ready');
let depthErrors = 0;
const originalConsoleError = console.error.bind(console);
console.error = (...parts) => {
  const line = parts.map(String).join(' ');
  if (/Maximum update depth/i.test(line)) {
    depthErrors += 1;
    log(`RENDER LOOP #${depthErrors} captured`);
    for (const part of parts) console.error(String(part));
  } else {
    originalConsoleError(...parts);
  }
};
win.addEventListener('error', (event) => log(`window error: ${event.error?.message || event.message}`));
const { createServer } = await import('vite');
log('vite package loaded');
const server = await createServer({
  logLevel: 'error',
  server: { middlewareMode: true, appType: 'custom' },
});
log('vite dev server created');
try {
  await Promise.race([
    server.ssrLoadModule('/src/main.jsx'),
    new Promise((_, reject) => setTimeout(() => reject(new Error('ssrLoadModule timed out after 120s')), 120_000)),
  ]);
  log('main.jsx module evaluated (app mounted)');
} catch (error) {
  log('module evaluation failed: ' + error.message);
  process.exitCode = 1;
}

const tick = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

const click = (element) => element.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
const rail = (label) => [...win.document.querySelectorAll('.rail-link')].find((button) => button.textContent.includes(label));
const text = () => document.body.textContent;
const setSearch = (page, value) => {
  const target = document.querySelector(page === 'fabric' ? '.fabrics-index .knowledge-search input' : page === 'index' ? '.product-index-page .knowledge-search input' : '.knowledge-search input');
  Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value').set.call(target, value);
  target.dispatchEvent(new win.Event('input', { bubbles: true }));
  target.dispatchEvent(new win.Event('change', { bubbles: true }));
};

await tick(600);
const results = [];
const record = (name, pass, detail = '') => { results.push({ name, pass, detail }); const status = pass ? 'PASS' : 'FAIL'; console.log(`[${status}] ${name}${detail ? ` — ${detail}` : ''}`); };

const appShell = document.querySelector('.app');
record('app mounts with rail + Fit page', Boolean(appShell && rail('Fit') && text().includes('FIT FIRST')), `body chars ${text().length}`);

const tabs = [
  ['Fit', 'FIT FIRST'],
  ['SKU Builder', 'RMS-ALIGNED SKU BUILDER'],
  ['Product Index', 'CATALOG PRODUCT INDEX'],
  ['Floor Unit', 'LIVE FLOOR UNIT'],
  ['Sectional Studio', 'FLOOR-PLAN CONFIGURATOR'],
  ['Fabrics & Care', 'FABRICS, LEATHER & CARE'],
  ['Support', 'SUPPORT & QUICK REFERENCE'],
];
for (const [label, marker] of tabs) {
  try {
    click(rail(label));
    await tick(180);
    const after = text();
    const matches = marker ? after.includes(marker) : document.querySelector('.main-content section');
    record(`renders ${label}`, Boolean(matches), marker ? (matches ? 'marker found' : 'marker missing') : 'no crash');
  } catch (error) {
    record(`renders ${label}`, false, error.message);
  }
}

// Cross-page search bleed (Product Index ↔ Fabrics & Care share `search`)
click(rail('Fabrics & Care'));
await tick(180);
try {
  const fabricInput = document.querySelector('.fabrics-index .knowledge-search input');
  log(`fabrics input found: ${Boolean(fabricInput)}`);
  setSearch('fabric', 'trouper');
  await tick(140);
  log(`typed value: "${fabricInput?.value}" · search-result boxes: ${document.querySelectorAll('.search-result').length}`);
  log(`empty-search shown: ${Boolean(document.querySelector('.empty-search'))} · knowledge-cards shown: ${Boolean(document.querySelector('.knowledge-cards'))}`);
  const fabricSeesResults = document.querySelectorAll('.search-result').length > 0;
  click(rail('Product Index'));
  await tick(160);
  const indexInput = document.querySelector('.product-index-page .knowledge-search input');
  const leaked = indexInput && indexInput.value === 'trouper';
  record('fabrics search does not leak into product index', !leaked, `index input value: "${indexInput?.value ?? 'n/a'}"`);
  record('fabrics search produced results', fabricSeesResults);
} catch (error) {
  record('fabrics search flow', false, error.message);
}

// SKU Builder model change exercises the documented defaults path
click(rail('SKU Builder'));
await tick(220);
try {
  const modelSelect = document.querySelector('select[aria-label]:scope');
  const selects = [...document.querySelectorAll('.sku-builder-page select, .rms-builder-card select')];
  const modelDropdown = selects.find((item) => [...item.options].some((option) => option.textContent.includes('Trouper')));
  if (!modelDropdown) {
    record('sku builder model select present', false, 'model dropdown not found');
  } else {
    const options = [...modelDropdown.options];
    const next = options.find((option) => option.value && option.value !== modelDropdown.value);
    modelDropdown.value = next.value;
    modelDropdown.dispatchEvent(new win.Event('change', { bubbles: true }));
    await tick(240);
    const groupSelect = selects.find((item) => item.getAttribute('aria-label') === 'RMS Group');
    record('sku builder model change keeps a documented group', Boolean(groupSelect && groupSelect.value), `group "${groupSelect?.value ?? 'none'}"`);
    record('sku builder renders group options after model change', Boolean(groupSelect && groupSelect.options.length > 0));
  }
} catch (error) {
  record('sku builder model change', false, error.message);
}

// Fabrics search-result click exercises shared-state setters (cover/prefix/finish)
click(rail('Fabrics & Care'));
await tick(180);
try {
  setSearch('fabric', 'trouper');
  await tick(140);
  const results2 = [...document.querySelectorAll('.search-result')];
  const clickable = results2.find((item) => item.textContent.includes('Product piece')) || results2[0];
  click(clickable);
  await tick(160);
  record('clicking a fabrics result does not crash', true);
} catch (error) {
  record('clicking a fabrics result does not crash', false, error.message);
}

// Return across every tab once more to catch late remount crashes
for (const [label] of tabs) {
  try {
    click(rail(label));
    await tick(90);
  } catch (error) {
    record(`revisit ${label}`, false, error.message);
  }
}
record('full tab circuit completes', true);

const failed = results.filter((item) => !item.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('FAILED:', failed.map((item) => item.name).join(' | '));
  process.exitCode = 1;
}
setTimeout(() => { server.close?.(); log('done'); process.exit(process.exitCode || 0); }, 50);
