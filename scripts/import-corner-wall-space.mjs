// Copies the April 2026 guide "Wall Space Required" onto each corner piece of the sectional profiles.
// A style-index row is used only when its model, width and depth equal the piece's published W x D.
import fs from 'node:fs';
import { parsePieceDimensions } from '../src/floorplan.js';

const catalogPath = new URL('../public/catalog_data-v2.json', import.meta.url);
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const styles = JSON.parse(fs.readFileSync(new URL('../public/style-index-2026.json', import.meta.url), 'utf8')).styles;
let set = 0;
for (const profile of catalog.product_profiles) {
  for (const piece of profile.pieces) {
    delete piece.wall_space_in;
    if (!/corner/i.test(piece.key) || /attached_corner/i.test(piece.key)) continue;
    const size = parsePieceDimensions(piece.dimensions_text);
    if (!size) continue;
    const row = styles.find((s) => String(s.model) === String(profile.model_code) && s.dims?.wallSpace > 0
      && Math.abs(s.dims.width - size.width) < 0.01 && Math.abs(s.dims.depth - size.depth) < 0.51);
    if (row) { piece.wall_space_in = Number(row.dims.wallSpace); set += 1; }
  }
}
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
console.log(`wall_space_in set on ${set} corner pieces`);
