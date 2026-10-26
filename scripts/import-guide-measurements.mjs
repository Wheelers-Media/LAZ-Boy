import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve('data/tear-pad-profiles');
const catalogPath = path.resolve('public/catalog_data-v2.json');
const columns = ['H', 'W', 'D', 'SH', 'SW', 'SD', 'AH', 'EXT', 'RD', 'LH', 'WT_LB', 'SEAT_FACTOR', 'WALL_SPACE'];
const rowsByCode = {
  '811': {
    '8AU811': [43, 44.5, 40, 21, 33.5, 21, 26, 67.5, 8.5, null, 144, 2, 44.5],
    '8BU811': [43, 44.5, 40, 21, 33.5, 21, 26, 67.5, 8.5, null, 144, 2, 44.5],
    '8C0811': [43, 68.5, 40, 21, null, 24, null, null, null, null, 75, 2, 100],
    '8M0811': [43, 35, 40, 21, null, 21, null, null, null, null, 60, 2, 35],
    '8SC811': [39, 13, 39, null, null, null, null, null, null, null, 61, 1, 13],
    '8SU811': [43, 35, 40, 21, null, 21, null, 67.5, 8.5, null, 109, 2, 35],
  },
  '812': {
    '8AU812': [42, 45, 38.5, 19.5, 34, 22, 24.5, 65, 8, null, 157, 2, null],
    '8BU812': [42, 45, 38.5, 19.5, 34, 22, 24.5, 65, 8, null, 157, 2, null],
    '8C0812': [34.5, 68.5, 38, 19.5, null, 22, null, null, null, null, 84, 2, 100],
    '8M0812': [34.5, 34, 38.5, 19.5, 34, 22, null, null, null, null, 58, 1, null],
    '8SC812': [29.5, 13, 38, null, null, null, null, 44, null, null, 55, 1, null],
    '8SU812': [42, 34, 38.5, 19.5, 34, 22, 24.5, 63, 8, null, 121, 1, null],
  },
  '665': {
    '60A665': [38, 46, 42, 21, 36, 24, 26.5, null, null, null, 104, 2, 46],
    '60B665': [38, 46, 42, 21, 36, 24, 26.5, null, null, null, 104, 2, 46],
    '60L665': [38, 46, 66, 21, 36, 48, 26.5, null, null, null, 140, 2, 46],
    '60M665': [38, 40.5, 42, 21, 40.5, 24, null, null, null, null, 80, 2, 40.5],
    '60R665': [38, 46, 66, 21, 36, 48, 26.5, null, null, null, 146, 2, 46],
    '6CC665': [38, 68, 42, 21, null, 25, null, null, null, null, 98, 2, 84],
  },
  '769': {
    '44A769': [42, 32, 39, 21, 23.5, 22.5, 25, 65.5, 5, null, 79, 2, null],
    '44B769': [42, 32, 39, 21, 23.5, 22.5, 25, 65.5, 5, null, 79, 2, null],
    '44C769': [42, 60, 41, 21, null, 26, 25, null, null, null, 65, 2, 91],
    '44D769': [42, 54.5, 39, 21, 48.5, 22.5, 25, 65.5, 5, null, 122, 2, null],
    '44E769': [42, 54.5, 39, 21, 48.5, 22.5, 25, 65.5, 5, null, 122, 2, null],
    '44Q769': [42, 35, 67, 21, 26, 50, 25, 76, 8, null, 92, 2, null],
    '44S769': [42, 24, 41, 21, 25, 22.5, 25, 65.5, 4, null, 62, 1, null],
    '44V769': [42, 35, 67, 21, 26, 50, 25, 76, 8, null, 92, 2, null],
    'M44769': [42, 24, 39, 21, 24, 22.5, null, null, null, null, 43, 1, null],
    'SC4769': [38.5, 14.5, 37.5, null, null, null, null, null, null, null, null, null, null],
    'U4A769': [42, 32, 41, 21, 23.5, 22.5, 25, 65.5, 5, null, 91, 2, null],
    'U4B769': [42, 32, 41, 21, 23.5, 22.5, 25, 65.5, 5, null, 91, 2, null],
    'U4D769': [42, 54.5, 41, 21, 48.5, 22.5, 25, 65.5, 5, null, 134, 2, null],
    'U4E769': [42, 54.5, 41, 21, 48.5, 22.5, 25, 65.5, 5, null, 134, 2, null],
    'U4Q769': [42, 35, 67, 21, 26, 50, 25, 76, 8, null, 115, 2, null],
    'U4S769': [42, 24, 41, 21, 24, 22.5, null, 65.5, 4, null, 77, 1, null],
    'U4V769': [42, 35, 67, 21, 26, 50, 25, 76, 8, null, 115, 2, null],
    'X4A769': [42, 32, 41, 21, 23.5, 22.5, 25, 65.5, 5, null, 96, 2, null],
    'X4B769': [42, 32, 41, 21, 23.5, 22.5, 25, 65.5, 5, null, 96, 2, null],
    'X4D769': [42, 54.5, 41, 21, 48.5, 22.5, 25, 65.5, 5, null, 144, 2, null],
    'X4E769': [42, 54.5, 41, 21, 48.5, 22.5, 25, 65.5, 5, null, 144, 2, null],
    'X4Q769': [42, 35, 67, 21, 26, 50, 25, 76, 8, null, 120, 2, null],
    'X4S769': [42, 24, 41, 21, 24, 22.5, null, 65.5, 4, null, 82, 1, null],
    'X4V769': [42, 35, 67, 21, 26, 50, 25, 76, 8, null, 120, 2, null],
  },
  '638': {
    '60A638': [37, 37, 38.5, 21.5, 31, 21.5, 25, null, null, null, 75, 1, 37],
    '60B638': [37, 37, 38.5, 21.5, 31, 21.5, 25, null, null, null, 75, 1, 37],
    '60C638': [37, 59.5, 37, 21, null, 22.5, null, null, null, null, 74, 2, 97],
    '60D638': [37, 68.5, 38.5, 21.5, 62.5, 21.5, 25, null, null, null, 114, 2, null],
    '60E638': [37, 68.5, 38.5, 21.5, 62.5, 21.5, 25, null, null, null, 114, 2, null],
    '60L638': [37, 37.5, 63.5, 21.5, 31.5, 47, 25, null, null, null, 117, 2, 37.5],
    '60M638': [37, 32, 38, 21.5, 32, 20.5, null, null, null, null, 53, 1, 32],
    '60R638': [37, 37.5, 63.5, 21.5, 31.5, 47, 25, null, null, null, 117, 2, 37.5],
    '6CC638': [37, 52.5, 37, 21, null, 29.5, null, null, null, null, 62, 1, 74],
    '6MM638': [37, 62.5, 38, 21.5, 62.5, 21, null, null, null, null, 91, 2, 62.5],
    '6SL638': [37, 37.5, 63.5, 21.5, 31.5, 47, 25, null, null, null, 162, 2, 37.5],
    '6SP638': [37, 62.5, 38, 21.5, 62.5, 21, null, 90.5, null, null, 150, 2, null],
    '6SR638': [37, 37.5, 63.5, 21.5, 31.5, 47, 25, null, null, null, 162, 2, 37.5],
  },
  '724': {
    '44A724': [42, 30, 40, 20.5, 22, 21, 26, 66, 4, null, 80, 2, 30],
    '44B724': [42, 30, 40, 20.5, 22, 21, 26, 66, 4, null, 80, 2, 30],
    '44C724': [42, 62, 38, 19.5, null, 22, null, null, null, null, 72, 2, 92],
    '44D724': [42, 56, 40, 20.5, 45, 20.5, 26, 66, 4, null, 128, 2, 56],
    '44E724': [42, 56, 40, 20.5, 45, 20.5, 26, 66, 4, null, 128, 2, 56],
    '44Q724': [42, 35, 68, 20, 26, 49, 26, 79, 10, null, 105, 2, 35],
    '44S724': [42, 24, 40, 20.5, 24, 20.5, null, 66, 4, null, 62, 1, 24],
    '44V724': [42, 35, 68, 20, 26, 49, 26, 79, 10, null, 105, 2, 35],
    'M44724': [42, 24, 40, 20.5, 24, 20.5, null, null, null, null, 48, 1, null],
    'SC4724': [38.5, 14.5, 37.5, null, null, null, null, null, null, null, 55, 1, 15.5],
    'U4A724': [42, 30, 40, 20.5, 22, 21, 26, 66, 4, null, 97, 2, 30],
    'U4B724': [42, 30, 40, 20.5, 22, 21, 26, 66, 4, null, 97, 2, 30],
    'U4D724': [42, 56, 40, 20.5, 45, 20.5, 26, 66, 4, null, 145, 2, 56],
    'U4E724': [42, 56, 40, 20.5, 45, 20.5, 26, 66, 4, null, 145, 2, 56],
    'U4Q724': [42, 35, 68, 20, 26, 49, 26, 79, 10, null, 105, 2, 35],
    'U4S724': [42, 24, 40, 20.5, 24, 20.5, null, 66, 4, null, 77, 1, null],
    'U4V724': [42, 35, 68, 20, 26, 49, 26, 79, 10, null, 105, 2, 35],
    'X4A724': [42, 30, 40, 20.5, 22, 21, 26, 66, 4, null, 102, 2, 30],
    'X4B724': [42, 30, 40, 20.5, 22, 21, 26, 66, 4, null, 102, 2, 30],
    'X4D724': [42, 56, 40, 20.5, 45, 20.5, 26, 66, 4, null, 155, 2, 56],
    'X4E724': [42, 56, 40, 20.5, 45, 20.5, 26, 66, 4, null, 155, 2, 56],
    'X4Q724': [42, 35, 68, 20, 26, 49, 26, 79, 10, null, 115, 2, 35],
    'X4S724': [42, 24, 40, 20.5, 24, 20.5, null, 66, 4, null, 82, 1, null],
    'X4V724': [42, 35, 68, 20, 26, 49, 26, 79, 10, null, 115, 2, 35],
  },
  '494': {
    '60A494': [37.5, 32.5, 39, 21, 24, 23.5, 26, null, null, null, 60, 2, 32.5],
    '60B494': [37.5, 32.5, 39, 21, 24, 23.5, 26, null, null, null, 60, 2, 32.5],
    '60C494': [37.5, 67, 39, 21, null, 25, null, null, null, null, 79, 2, 98],
    '60D494': [37.5, 56.5, 39, 21, 48, 23.5, 26, null, null, null, 93, 2, 56.5],
    '60E494': [37.5, 56.5, 39, 21, 48, 23.5, 26, null, null, null, 93, 2, 56.5],
    '60L494': [37.5, 32.5, 64, 21, 24, 48, 26, null, null, null, 86, 2, 32.5],
    '60M494': [37.5, 24, 39, 21, 24, 23.5, null, null, null, null, 46, 1, 24],
    '60R494': [37.5, 32.5, 64, 21, 24, 48, 26, null, null, null, 86, 2, 32.5],
    '6CC494': [37.5, 53, 39, 21, null, 23.5, null, null, null, null, 70, 1, 78],
    '6MM494': [37.5, 63, 39, 21, 63, 23.5, null, null, null, null, 90, 2, 63],
    '6SC494': [25.5, 10, 38.5, null, null, null, null, null, null, null, 59, 1, 10],
    '6SL494': [37.5, 39, 64, 21, 30, 48, 26, null, null, null, 148, 2, 39],
    '6SP494': [37.5, 63, 39, 21, 63, 23.5, null, 90, null, null, 142, 2, 63],
    '6SR494': [37.5, 39, 64, 21, 30, 48, 26, null, null, null, 148, 2, 39],
  },
};

const affectedCodes = new Set(Object.keys(rowsByCode));
const codePrefix = (piece) => piece.code || (piece.variants || []).map(({ code }) => code);
const rowsForProfile = (profile) => {
  const rows = {};
  for (const piece of profile.pieces) {
    const pieces = Array.isArray(codePrefix(piece)) ? codePrefix(piece) : [codePrefix(piece)];
    for (const prefix of pieces) {
      const style = `${prefix}${profile.model_code}`;
      if (rowsByCode[profile.model_code]?.[style]) rows[style] = rowsByCode[profile.model_code][style];
    }
  }
  return rows;
};

const profiles = fs.readdirSync(root).filter((file) => file.endsWith('.json'));
const touchedProfiles = new Map();
for (const file of profiles) {
  const filePath = path.join(root, file);
  const profile = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!affectedCodes.has(profile.model_code)) continue;
  const rows = rowsForProfile(profile);
  if (!Object.keys(rows).length) throw new Error(`No matching guide rows for ${profile.model_name}`);
  profile.product_guide_measurements = {
    source: 'APRIL 2026 - PRODUCT INFORMATION GUIDE.xlsx',
    edition: 'April 2026',
    columns,
    note: 'Values are transcribed from the guide Dimensions table and keyed to exact printed style numbers. Linear measurements are inches. WT_LB is the product/unit weight, not a user-weight capacity. Blank source cells remain null. These dimensions do not establish recommended customer height or fit.',
    rows,
  };
  fs.writeFileSync(filePath, `${JSON.stringify(profile, null, 2)}\n`);
  touchedProfiles.set(profile.model_code, profile);
  console.log(`Added ${Object.keys(rows).length} Product Information Guide rows to ${file}`);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
for (const code of affectedCodes) {
  const profile = catalog.product_profiles.find((item) => item.model_code === code);
  if (!profile) throw new Error(`Generated catalog is missing profile ${code}`);
  const sourceProfile = touchedProfiles.get(code) || profile;
  catalog.product_profiles[catalog.product_profiles.indexOf(profile)] = sourceProfile;
}
fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
