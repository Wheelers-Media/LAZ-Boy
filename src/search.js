import { decodeRmsSku } from './logic.js';

const norm = (value) => String(value ?? '').toLowerCase().trim();
const squash = (value) => norm(value).replace(/[\s-]+/g, '');

/**
 * One box for the whole app: an RMS line or tag (decoded), a model name or number, or a style such as 10X724.
 * Pure. Returns only what the supplied catalogs contain; nothing is guessed.
 * `products` is the list from getGuideProductIndex().
 */
export function searchEverything(catalog, rawQuery, products = []) {
  const query = norm(rawQuery);
  if (!query) return { query, decode: null, models: [], styles: [] };
  const tokens = query.split(/\s+/).filter(Boolean);

  let decode = null;
  try {
    const result = decodeRmsSku(String(rawQuery).trim().toUpperCase(), catalog);
    if (result.style.code && (result.style.status === 'documented' || result.model.status === 'documented')) decode = result;
  } catch { decode = null; }

  const score = (product) => {
    const name = norm(product.modelName);
    const haystack = `${name} ${product.modelCode} ${(product.categories || []).join(' ')} ${(product.styles || []).map((style) => `${style.code} ${style.label}`).join(' ')}`.toLowerCase();
    if (!tokens.every((token) => haystack.includes(token))) return 0;
    if (norm(product.modelCode) === query) return 100;
    if (name === query) return 90;
    if (name.startsWith(query)) return 70;
    if (name.includes(query)) return 50;
    return 10;
  };
  const models = products.map((product) => ({ product, score: score(product) })).filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.product.modelName.localeCompare(b.product.modelName)).slice(0, 8).map((item) => item.product);

  const flat = squash(rawQuery);
  const styles = flat.length >= 4 && /\d/.test(flat) ? (catalog?.style_index_2026?.styles || []).filter((row) => row.kind === 'style' && (squash(row.styleNumber) === flat || squash(`${row.prefix}${row.model}`).startsWith(flat))).slice(0, 8) : [];
  return { query, decode, models, styles };
}
