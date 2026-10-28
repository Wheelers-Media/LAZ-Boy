# Swatch images

Gets the real La-Z-Boy swatch photo for each cover + colour in `public/fabric-cover-program-a26.json`.

**1. Download images** (Python 3.8+, no installs): `python scripts/swatches/fetch_swatches.py`
Saves `public/swatches/thumb/<id>.jpg` (240px) and `zoom/<id>.jpg` (450px), where `<id>` is cover code + colour code (`D1855` + `53` = `D185553`).
Writes `public/swatch-manifest.json` and `reports/swatch-report.json` (ids with no image on the site). Safe to re-run; it skips files already saved. Try `--limit 20` first.

**2. Cross-check names** (optional, once): `pip install playwright beautifulsoup4 && playwright install chromium`, then
`python scripts/swatches/crawl_metadata.py --stop-when-covered`, then `python scripts/swatches/fetch_swatches.py --manifest-only`.
This reads the website's pattern and colour names (and colour family) and flags any id whose names disagree with the app. Flagged ids are not shown in the app.

In the app, `swatchImageFor(index, coverCode, colorCode, size)` in `src/logic.js` returns the local image path or `null`. No image means the app shows the tone dot as before.

Tests: `python -m unittest discover -s scripts/swatches -p "test_*.py"` and `node --test test/*.js`.
