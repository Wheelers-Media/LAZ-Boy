"""Offline tests: python -m unittest discover -s scripts/swatches -p 'test_*.py'"""
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import common
import fetch_swatches
from parse_cover_swatches import parse_swatches

JPEG = b'\xff\xd8\xff\xe0' + b'0' * 600


class ParseTests(unittest.TestCase):
    def test_parses_ids_names_and_drops_prices(self):
        html = (Path(__file__).parent / 'fixtures' / 'product_page_sample.html').read_text()
        items = {i['cover_id']: i for i in parse_swatches(html)}
        self.assertEqual(set(items), {'LB211268', 'D185553', 'D185559'})  # upper-cased, de-duplicated
        self.assertEqual(items['D185553']['pattern'], 'i-Rivers')
        self.assertEqual(items['D185559']['color_family'], 'darkgrey')
        self.assertEqual(items['LB211268']['name'], 'Slate')  # selected tile falls back to the image alt text
        self.assertTrue(all('price' not in k for i in items.values() for k in i))


class TargetTests(unittest.TestCase):
    def test_targets_come_from_app_data_and_follow_the_tag_grammar(self):
        targets = common.load_targets()
        self.assertGreater(len(targets), 700)
        self.assertTrue(all(common.COVER_ID.match(i) for i in targets))
        self.assertEqual(targets['D185553']['pattern_name'], 'i-Rivers')
        self.assertEqual(targets['D185553']['color_name'], 'Fossil')


class FetchTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        patcher = mock.patch.object(fetch_swatches, 'SWATCH_DIR', Path(self.tmp.name))
        patcher.start()
        self.addCleanup(patcher.stop)
        self.addCleanup(self.tmp.cleanup)

    def test_saves_real_jpeg_and_skips_existing(self):
        with mock.patch.object(fetch_swatches, 'download', return_value=(200, JPEG)) as dl:
            _, out = fetch_swatches.fetch_one('D185553', ['thumb', 'zoom'], 0, False)
            self.assertEqual(out, {'thumb': 'saved', 'zoom': 'saved'})
            _, again = fetch_swatches.fetch_one('D185553', ['thumb', 'zoom'], 0, False)
            self.assertEqual(again, {'thumb': 'have', 'zoom': 'have'})
            self.assertEqual(dl.call_count, 2)

    def test_404_is_missing_and_writes_nothing(self):
        with mock.patch.object(fetch_swatches, 'download', return_value=(404, b'')):
            _, out = fetch_swatches.fetch_one('ZZ999999', ['thumb', 'zoom'], 0, False)
        self.assertEqual(out, {'thumb': 'missing'})  # stops after the first miss
        self.assertEqual(list(Path(self.tmp.name).rglob('*.jpg')), [])

    def test_placeholder_that_is_not_a_jpeg_is_rejected(self):
        with mock.patch.object(fetch_swatches, 'download', return_value=(200, b'<html>not an image</html>' * 40)):
            _, out = fetch_swatches.fetch_one('D185553', ['thumb'], 0, False)
        self.assertTrue(out['thumb'].startswith('error'))

    def test_manifest_flags_name_mismatch_and_skips_ids_without_files(self):
        targets = {
            'D185553': {'cover_code': 'D1855', 'color_code': '53', 'pattern_name': 'i-Rivers', 'color_name': 'Fossil', 'material': 'Fabric'},
            'D185559': {'cover_code': 'D1855', 'color_code': '59', 'pattern_name': 'i-Rivers', 'color_name': 'Smoke', 'material': 'Fabric'},
            'D185564': {'cover_code': 'D1855', 'color_code': '64', 'pattern_name': 'i-Rivers', 'color_name': 'Sand', 'material': 'Fabric'}}
        for cover_id in ('D185553', 'D185559'):
            for size in ('thumb', 'zoom'):
                (Path(self.tmp.name) / size).mkdir(exist_ok=True)
                (Path(self.tmp.name) / size / f'{cover_id}.jpg').write_bytes(JPEG)
        site = {'D185553': {'pattern': 'i-Rivers', 'name': 'Fossil', 'color_family': 'grey'},
                'D185559': {'pattern': 'Other', 'name': 'Smoke', 'color_family': 'darkgrey'}}
        entries, mismatch = fetch_swatches.build_manifest(targets, site)
        by_id = {e['cover_code'] + e['color_code']: e for e in entries}
        self.assertEqual(set(by_id), {'D185553', 'D185559'})  # D185564 has no file -> not in manifest
        self.assertEqual(by_id['D185553']['name_check'], 'match')
        self.assertEqual(by_id['D185553']['color_family'], 'grey')
        self.assertEqual(by_id['D185559']['name_check'], 'mismatch')
        self.assertEqual(len(mismatch), 1)


if __name__ == '__main__':
    unittest.main()
