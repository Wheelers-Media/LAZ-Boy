"""Pull cover swatch metadata out of a La-Z-Boy product page. No prices, stock or promo fields are kept."""
from bs4 import BeautifulSoup

KEEP = {'data-cover-id': 'cover_id', 'data-cover-name': 'name', 'data-cover-pattern': 'pattern',
        'data-cover-color-family': 'color_family', 'data-cover-material': 'material'}


def parse_swatches(html):
    """Return a list of {cover_id, name, pattern, color_family, material} for every swatch in the page."""
    soup = BeautifulSoup(html, 'html.parser')
    found, seen = [], set()
    for node in soup.select('[data-cover-id]'):
        cover_id = (node.get('data-cover-id') or '').strip().upper()
        if not cover_id or cover_id in seen:
            continue
        seen.add(cover_id)
        item = {out: (node.get(attr) or '').strip() for attr, out in KEEP.items()}
        item['cover_id'] = cover_id
        # The first, "selected" swatch is a display tile with only an id and an alt text.
        if not item['name']:
            image = node.find('img')
            item['name'] = (image.get('alt') or '').strip() if image else ''
        found.append(item)
    return found
