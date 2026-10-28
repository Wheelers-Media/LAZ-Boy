"""Shared helpers for the La-Z-Boy swatch tools. Standard library only."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
PROGRAM_JSON = PUBLIC / 'fabric-cover-program-a26.json'
SWATCH_DIR = PUBLIC / 'swatches'
MANIFEST = PUBLIC / 'swatch-manifest.json'
SITE_METADATA = ROOT / 'data' / 'swatch-site-metadata.json'
REPORT = ROOT / 'reports' / 'swatch-report.json'
IMAGE_HOST = 'https://content.la-z-boy.com/Images/Fabrics'
# Folder name on the site -> (local folder, pixel size). Medium/Large are recorded as URLs only.
SIZES = {'thumb': ('Thumbnails', 240), 'zoom': ('Zoom', 450)}
URL_ONLY_SIZES = {'medium': ('Medium', 1600), 'large': ('Large', 2000)}
COVER_ID = re.compile(r'^[A-Z]{1,3}\d{6}$')


def norm(text):
    """Lower-case alphanumerics only, so 'Blue Grey' == 'blue-grey'."""
    return re.sub(r'[^a-z0-9]', '', str(text or '').lower())


def image_url(size_key, cover_id):
    folder = {**SIZES, **URL_ONLY_SIZES}[size_key][0]
    return f'{IMAGE_HOST}/{folder}/{cover_id}.jpg'


def load_targets(include_prior=True):
    """Every cover+colour in the app's own data, keyed by the 8-character cover id (cover code + colour code)."""
    program = json.loads(PROGRAM_JSON.read_text(encoding='utf-8'))
    groups = [(program['fabrics'], 'Fabric', False), (program['leathers'], 'Leather', False)]
    if include_prior:
        prior = program.get('priorSeason') or {}
        groups += [(prior.get('fabrics', []), 'Fabric', True), (prior.get('leathers', []), 'Leather', True)]
    targets = {}
    for records, material, is_prior in groups:
        for record in records:
            for color in record.get('colors', []):
                cover_id = f"{record['coverCode']}{color}"
                if not COVER_ID.match(cover_id):
                    continue
                entry = targets.setdefault(cover_id, {
                    'cover_code': record['coverCode'], 'color_code': color,
                    'pattern_name': record.get('patternName', ''),
                    'color_name': (record.get('colorNames') or {}).get(color, ''),
                    'material': material, 'prior_season_only': is_prior})
                if not is_prior:
                    entry['prior_season_only'] = False
    return targets


def load_site_metadata():
    if not SITE_METADATA.exists():
        return {}
    data = json.loads(SITE_METADATA.read_text(encoding='utf-8'))
    return {item['cover_id']: item for item in data.get('covers', [])}
