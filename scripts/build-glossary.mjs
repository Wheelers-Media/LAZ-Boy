// Builds public/glossary-2026.json: one plain-language entry per code or term a salesperson meets in the app.
// Entries come from two places only: the JSON sources already in /public (mechanism guide, cover program,
// sales reference library) and the hand-written CURATED list below, where every entry names the project
// document it was read from. Anything the supplied documents do not define is marked gap:true and says so.
import { readFileSync, writeFileSync } from 'node:fs';

const read = (name) => JSON.parse(readFileSync(new URL(`../public/${name}`, import.meta.url), 'utf8'));
const guide = read('mechanism-guide-2026.json');
const program = read('fabric-cover-program-a26.json');
const library = read('sales-reference-library-2026.json');
const rmsOptions = read('option-codes-rms.json');

const entries = [];
const add = (entry) => entries.push({ tier: 'A', ...entry });

const GUIDE_SRC = 'Product Knowledge Library (Nov 2025 – Jun 2026 issues)';
const PRICEBOOK = 'April 2026 Upholstery Price Book, Fabric & Leather Information (p. 15–16)';
const PIG = 'April 2026 Product Information Guide';
const FABRIC_LIST = 'April 2026 Fabric & Leather List';

// 1. Option codes: names, benefits and pitches already in the mechanism guide.
const noPillowCaps = (program.businessRules?.pillowsNotAllowedCapCodes || []).join(', ');
for (const [code, option] of Object.entries(guide.options || {})) {
  const pillow = ['FP', 'P1', 'P2'].includes(code);
  add({
    kind: 'option', code, term: option.name, short: option.name, plain: option.benefit, pitch: option.pitch || '',
    caution: pillow && noPillowCaps ? `Accent pillows are not available on covers with cap codes ${noPillowCaps} (${FABRIC_LIST}).` : '',
    source: GUIDE_SRC,
  });
}
// RMS 101 option codes the guide does not describe.
for (const option of rmsOptions.options || []) {
  if (entries.some((entry) => entry.kind === 'option' && entry.code === option.code)) continue;
  add({ kind: 'option', code: option.code, term: option.name, short: option.name, plain: `${option.name}. The supplied data gives the name only, not a description.`, source: rmsOptions.source });
}
add({ kind: 'option', code: 'FN', term: 'Wood finish (non-standard)', short: 'Non-standard wood finish', plain: 'Entered as FN followed by the finish code, for example FN 021. Leave it off to get the style’s standard finish.', source: 'SKU grammar used in this app; finish codes from the Product Knowledge One Pagers' });
add({ kind: 'option', code: 'DC', term: 'Seat-cushion option (name not shown)', short: 'Seat-cushion option', plain: 'Listed as an option on stationary styles next to Z6, which is ComfortCore Plus with Contour Cushion. The supplied documents do not print the name beside this code.', gap: true, source: `${PIG} (option column)` });

const catalog = read('catalog_data-v2.json');
const styleIndex = read('style-index-2026.json').styles.filter((row) => row.kind === 'style');
const rw = (catalog.option_suffixes || []).find((option) => option.code === 'RW');
if (rw) add({ kind: 'option', code: 'RW', term: rw.name, short: rw.name, plain: rw.description, tier: 'B', source: 'App catalog (catalog_data-v2.json); not described in the mechanism guide' });
add({ kind: 'option', code: 'NN', term: 'NN · nailhead trim choice (name not shown)', short: 'Nailhead trim choice', plain: 'Appears beside the nailhead trim codes NB and NS on the Dutton 828 styles. The supplied documents do not print its name.', gap: true, source: `${PIG} (option column)` });

// 2. Cover availability (cap) codes: pricebook definitions, hand-read.
const CAPS = [
  ['UR', 'Up the Roll', 'Fabric pattern pieces are cut parallel to the selvage, so no pattern match is possible. On sofas, sleep sofas and multi-seat modular units the front rail is vertically seamed and may not match.'],
  ['DR', 'Directional Railroad', 'Pattern pieces are cut perpendicular to the selvage (railroaded). No vertical pattern match is possible; a horizontal match depends on the fabric design.'],
  ['VS', 'Vertical Stripe', 'Railroaded and matched vertically only. Seat cushions are reversible on mirrored-image designs.'],
  ['PS', 'Plaid Stripe', 'Railroaded and matched vertically and horizontally. Seat cushions are reversible on mirror-image designs.'],
  ['DP', 'Directional Plaid', 'Railroaded and matched vertically and horizontally; the pattern has an upward direction. Seat cushions are reversible.'],
  ['NP', 'Non-Mirrored Plaid', 'Railroaded and matched vertically only. The design is not a mirror image, so seat cushions are not reversible.'],
  ['HS', 'Horizontal Stripe', 'Pattern pieces are cut parallel to the selvage and locked on the stripe line, so the stripe flows horizontally across inside backs, inside arms, seats and rails.'],
  ['UE', 'Urethane', 'Railroaded, no vertical pattern match. Units with loose seats or backs have venting and/or tan denim on one side. Pillows are not available.'],
  ['BU', 'Breathable Urethane', 'Railroaded, no vertical pattern match. Do not use after-treatment on BU covers. Units with loose seats or backs have venting and/or tan denim on one side. Pillows are not available.'],
  ['RL', 'Recycled Leather', 'A composite of recycled leather scraps with a cellular polyurethane face. Do not use after-treatment on RL covers. Pillows are not available.'],
  ['LM', 'Leather Mate', 'Leather plus vinyl or polyurethane. Leather is on the areas that touch the body (back, seat, inside arms); vinyl or polyurethane is on the outer parts. Pillows are not available.'],
  ['LL', 'Full Leather', 'Covered in all top-grain leather. Units with loose seats or backs have venting and/or tan denim on one side. Pillows are not available.'],
];
for (const [code, name, plain] of CAPS) {
  add({ kind: 'cap', code, term: `${code} · ${name}`, short: name, plain, caution: noPillowCaps.split(', ').includes(code) ? 'Accent pillows are not available on this cap code.' : '', pitch: '', source: PRICEBOOK });
}
add({ kind: 'cap', code: 'LS', term: 'LS · Limited Leathers', short: 'Limited Leathers', plain: 'A limited-leathers cap code listed in the Product Information Guide key. The supplied documents do not give a longer definition.', caution: 'Accent pillows are not available on this cap code.', gap: true, source: `${PIG} (cap-code key)` });
add({ kind: 'cap', code: 'RM', term: 'RM · Recycled Leather Mate', short: 'Recycled Leather Mate', plain: 'Named in the Product Information Guide key. The supplied documents do not give a longer definition.', gap: true, source: `${PIG} (cap-code key)` });
add({ kind: 'term', code: 'CAP', term: 'Cap code (cover availability code)', short: 'Cap code', plain: 'Every cover carries a cap code that says how the material is cut and matched and which styles can take it. A style lists the cap codes it accepts, and a cover only fits if its cap code is on that list.', pitch: 'Check the cap code on the cover against the style’s list before showing a customer a swatch.', source: `${PRICEBOOK}; ${PIG}` });

// 3. Wearability, cleaning, special features: cover program definitions.
const WEAR_CODE = { N: 'N', P: 'P', Medium: 'M' };
for (const [key, item] of Object.entries(program.definitions?.wearability || {})) {
  add({ kind: 'wear', code: WEAR_CODE[key] || key, term: `${item.name} wearability`, short: item.name, plain: item.description, caution: key === 'P' ? 'The supplied data does not tie the Performance marker to a stain warranty.' : '', source: FABRIC_LIST });
}
const CLEAN_HOW = { S: 'Clean with a mild water-free dry-cleaning solvent only. Never use water on it.', W: 'Clean with water-based cleaning agents or foam only. Never use solvent on it.', WS: 'Either water-based agents or dry-cleaning solvent can be used.', 'W*B': 'Bleach-cleanable. Check the cover-specific care instructions.' };
for (const [code, name] of Object.entries(program.definitions?.cleaningCodes || {})) {
  add({ kind: 'clean', code, term: `${code} · ${name}`, short: name, plain: CLEAN_HOW[code] || name, source: FABRIC_LIST });
}
for (const [code, name] of Object.entries(program.definitions?.specialtyAttributes || {})) {
  add({ kind: 'special', code, term: name, short: name, plain: `${name} is a special feature marked on the cover in the fabric list.${code === 'N' ? ' (Here N is Nanobionic, not Normal wearability.)' : ''} The supplied documents list the marker but do not give a longer claim; confirm cover-specific care before promising it.`, gap: true, source: FABRIC_LIST });
}
for (const [kind, text] of Object.entries(program.definitions?.leatherTypes || {})) {
  add({ kind: 'term', code: `LEATHER-${kind.toUpperCase()}`, term: `${kind} leather`, short: `${kind} leather`, plain: text, source: FABRIC_LIST });
}
for (const [kind, text] of Object.entries(program.definitions?.leatherGroups || {})) {
  add({ kind: 'term', code: `LEATHERGROUP-${kind.toUpperCase().replace(/\s+/g, '-')}`, term: kind, short: kind, plain: text, source: FABRIC_LIST });
}

// 4. Wood finishes.
for (const finish of library.wood_finishes || []) {
  add({ kind: 'finish', code: finish.code, term: `${finish.name} (${finish.code})`, short: finish.name, plain: finish.description, caution: finish.restriction || '', source: 'Sales reference library; Product Knowledge One Pagers' });
}

// Finishes the guide lists on styles but the reference library does not describe.
for (const row of styleIndex) {
  for (const finish of [row.standardFinish, ...(row.optionalFinishes || [])].filter(Boolean)) {
    if (entries.some((entry) => entry.kind === 'finish' && entry.code === finish.code)) continue;
    add({ kind: 'finish', code: finish.code, term: `${finish.name} (${finish.code})`, short: finish.name, plain: `${finish.name} wood finish. The supplied documents name it but give no description.`, gap: true, source: PIG });
  }
}

// 5. Measurements.
for (const dim of library.dimensions_key || []) {
  add({ kind: 'dim', code: dim.code, term: dim.name, short: dim.name, plain: dim.definition, source: 'April 2026 Upholstery Price Book, dimension key' });
}
add({ kind: 'dim', code: 'FE', term: 'Fully extended', short: 'Fully extended', plain: 'Depth of the unit from the front of the legrest to the top of the back when fully reclined.', pitch: 'This is how much floor the chair takes up when someone is fully reclined. Compare it to the room.', source: 'April 2026 Upholstery Price Book, dimension key' });

// 6. Mechanisms, generated from the guide so the numbers cannot drift.
const featureName = (id) => guide.features?.[id]?.name;
for (const mechanism of guide.mechanisms || []) {
  const parts = [];
  if (mechanism.wallProximityIn) parts.push(`Needs ${mechanism.wallProximityIn[0]}–${mechanism.wallProximityIn[1]} in from the wall to recline.`);
  if (mechanism.weightTestedLbs) parts.push(`Weight tested to ${mechanism.weightTestedLbs} lb.`);
  const features = (mechanism.features || []).map(featureName).filter(Boolean);
  if (features.length) parts.push(`Key features: ${features.join('; ')}.`);
  add({ kind: 'mech', code: mechanism.id, term: mechanism.name, short: mechanism.name, plain: parts.join(' ') || mechanism.name, prefixes: mechanism.prefixes, source: `${GUIDE_SRC}, issued ${mechanism.issued || 'date not stated'}` });
}
for (const series of guide.seriesNotes || []) {
  const name = series.series.split(' (')[0];
  add({ kind: 'term', code: name.toUpperCase().replace(/\s+/g, '-'), term: name, short: name, plain: `${series.note}`, source: GUIDE_SRC });
}

// 7. Curated terms. Each line was read from the project document named in `source`.
const CURATED = [
  ['SKU', 'SKU / RMS line', 'The ordering code for one item: style code, then cover, then any finish and options, for example 10X709 B153853. The app builds and decodes these strings so you can copy them into RMS.', 'Always confirm the line in RMS before promising it; the app does not check orders.', 'Point of Sale Basics RMS 101 (option codes page); project SKU grammar'],
  ['RMS', 'RMS', 'The point-of-sale screen where orders are entered. The app mirrors its fields (Group, Style, Grade, Pattern, Color) so a code from the app can be keyed in directly.', '', 'Point of Sale Basics RMS 101 (FY23)', true, 'What the letters stand for is not in the supplied data.'],
  ['PREFIX', 'Prefix (Group)', 'The first characters of a style code. They tell you what mechanism or construction it is. 10X is a power rocking recliner with headrest and lumbar; 016 is a wall recliner; 44 is a La-Z-Time motion sofa.', 'Learn the prefix families first. They sort the whole catalog.', 'Product Knowledge Library June 2026, table of contents; April 2026 Product Information Guide'],
  ['MODEL', 'Model (collection)', 'The three-digit number and name that give a family its look: 709 Jasper, 724 Trouper. One model comes in several styles (prefixes), so the same look can be a rocker, a wall recliner or a power chair.', 'Pick the look with the customer first, then the prefix for how it moves.', 'April 2026 Product Information Guide'],
  ['GRADE', 'Grade', 'The letter at the start of a cover code: B1538 is grade B. The price book lists fabric prices in grade groups (B–C, D–F, G–N, P–Q), so a higher grade group costs more. The app shows no prices; read the figure from the price book.', 'Quote the price from the price book, never from memory.', 'April 2026 Upholstery Price Book (price list columns); April 2026 Fabric & Leather List'],
  ['PATTERN', 'Pattern', 'The four digits after the grade letter that identify one fabric or leather design, for example 1538 Seamount.', '', 'April 2026 Fabric & Leather List'],
  ['COLOR', 'Color', 'The two digits that pick the colour of a pattern, for example 53 Silver. Each pattern lists its own colours.', '', 'April 2026 Fabric & Leather List'],
  ['COVER', 'Cover', 'The fabric or leather on the body of the furniture: grade, pattern and colour together, for example B153853.', '', 'April 2026 Fabric & Leather List'],
  ['SELECT', 'Select covers', 'Some styles list specific covers as Select fabric, Select faux leather or Select leather in the price book. These are named per style, so check the exact style’s list.', 'If the customer loves a cover that is not on the style’s select list, check the other cover groups before saying no.', 'April 2026 Upholstery Price Book (style headers)'],
  ['MOTION', 'Motion upholstery', 'The guide’s section for sofas, loveseats and modular sectionals with reclining seats: Reclina-Way, La-Z-Time and La-Z-Motion families.', '', 'Product Knowledge Library June 2026, table of contents'],
  ['RECLINA-ROCKER', 'Reclina-Rocker (rocking recliner)', 'The rocking recliner family: 010, power P10, 10U and 10X. Rocks as well as reclines.', '', 'April 2026 Product Information Guide (base kit notes); Product Knowledge Library June 2026'],
  ['RECLINA-WAY', 'Reclina-Way (wall recliner)', 'The wall recliner family: 016, power P16 and 16X. Designed to sit close to a wall; see the wall-space figure on the style.', 'Ask how far the chair sits from the wall before choosing between rocker and wall recliner.', 'April 2026 Product Information Guide (base kit notes); Product Knowledge Library June 2026'],
  ['LA-Z-TIME', 'La-Z-Time', 'Motion family with prefixes 44_ (manual), U4_ (power with headrest) and X4_ (power with headrest and lumbar).', '', 'Product Knowledge Library June 2026, table of contents'],
  ['DUO', 'Duo®', 'A reclining sofa, loveseat or chair family with prefixes P9_. The Duo battery pack (0881YC) is for styles with two power recliners.', '', 'Product Knowledge Library June 2026; April 2026 Product Information Guide (battery pack)'],
  ['LIFT', 'Lift recliners', 'Power lift chairs: Bronze (3BL), Gold (1HM) and Platinum (1PL, 1PH). Each has its own weight rating; use the lift-chair weight tiers under Support.', 'Always match the tested weight to the person, and never relax it.', 'Product Knowledge Library June 2026, table of contents'],
  ['PLATINUM', 'Platinum Luxury-Lift', 'The top lift series. Adjustable power-tilt headrest from 0 to 55 degrees, power lumbar with nearly 3.5 in of additional support, a pivoting lumbar pad and a spring-action headrest return that prevents pinching.', 'Sell the headrest and lumbar: the customer sets their own head and neck position and back support with a button.', 'Platinum-Lifts Features and Benefits, Rev 01'],
  ['SLEEPER', 'Sleeper (sleep sofa)', 'Sleep sofas come with the Supreme Comfort mattress (5.5 in innerspring with quilted damask topper, 5-year warranty) as standard. Upgrade to a Slumberaire air mattress (5-year) or a Tempur-Response memory foam mattress (3-year).', 'Ask how often guests actually sleep over: that decides standard versus upgrade.', 'Product Knowledge One Pagers (mattress page)'],
  ['COMFORTCORE', 'ComfortCore seat', 'The standard Premier stationary seat construction: zoned cushioning with a 36 lb and a 27 lb polyurethane centre.', '', 'April 2026 Upholstery Price Book, seat constructions (p. 17–19)'],
  ['ULTRA-PLUSH', 'Ultra Plush seat', 'A softer recliner seat made by adding an extra layer of 12 lb polyurethane foam on top of the polyurethane foam core.', 'For the customer who says “soft”.', 'April 2026 Upholstery Price Book, seat constructions'],
  ['SUMMIT-SEAT', 'Summit seat', 'Five seat springs and a 36 lb foam core for optimal support.', '', 'April 2026 Upholstery Price Book, seat constructions'],
  ['CONTOUR', 'La-Z-Boy Contour Cushion', 'A seat topper of temperature-resistant 2.5-density foam that moulds to the body over a 2.5-density 36 lb core. On recliners it runs from the seat through the legrest. 3-year cushion warranty.', 'Sell it as the cushion that hugs sore backs and hips.', 'Gliding Recliner Resource Guide 017; Product Knowledge One Pagers'],
  ['COMFORTDOWN', 'ComfortDown cushion', 'A plump, feathery blend over resilient foam around an individually pocketed coil core. Raises the foam warranty from 3 to 5 years.', 'The cloud-soft option.', 'Product Knowledge One Pagers'],
  ['PREMIER-STANDARD', 'Premier standard seat', 'Seat type printed as “Premier standard (SS)” on stationary styles. The seat construction definitions are on pages 17–19 of the price book.', '', 'April 2026 Product Information Guide; April 2026 Upholstery Price Book', true, 'The “(SS)” tag itself is not defined in the supplied data.'],
  ['WARRANTY', 'Warranty at a glance', 'Limited lifetime on parts for springs, mechanism and frame, with 1 year on labour. 3-year warranty on a ComfortCore seat cushion. 1 year on all other foam, fabric and leather. Categories differ; see Support for the matrix.', 'State the warranty from the guide only. Never add promises.', 'Product Knowledge One Pagers; mechanism guide warranty tiers'],
  ['TEAR-PAD', 'Collection tear pad', 'The collection sheet for a sectional that shows which pieces can connect. The app says to check every layout against it before ordering.', 'A layout in the app is a planning aid. The tear pad decides what can be ordered.', 'Sectional tear-pad profiles bundled with the app', true, 'The tear pad sheets themselves are not in the supplied project files.'],
  ['SWIVEL-BASE', 'Swivel and tall bases', 'Manual rockers swivel 360 degrees; power rockers swivel 145 degrees. A tall base adds 1 to 1.5 in to seat height and overall height depending on the kit. Base kits are separate RMS lines.', 'Ask about knees and getting up: a tall base helps taller customers.', 'April 2026 Product Information Guide (base assembly kits)'],
  ['BATTERY', 'Battery pack', 'A rechargeable pack that replaces the corded power supply on power styles. Check compatibility for the exact style under Support before adding one.', '', 'April 2026 Product Information Guide (batteries)'],
  ['PILLOWS', 'Accent pillows', 'Pillows that come with some styles. FeatherLite upgrades them to 95% duck feather and 5% duck down in a cotton down-proof ticking. Contrasting pillows (P1/P2) let the pillow fabric differ from the body cover. Not available on LL, LS, LM, RL, BU or UE covers.', 'Pillows are an easy add-on that changes the look. Check the cover’s cap code first.', 'Product Knowledge One Pagers; April 2026 Fabric & Leather List'],
];
for (const [code, term, plain, pitch, source, gap, caution] of CURATED) {
  add({ kind: 'term', code, term, short: term, plain, pitch, source, gap: Boolean(gap), caution: caution || '' });
}

const out = { _meta: { title: 'Glossary 2026', built: 'scripts/build-glossary.mjs', note: 'Plain-language definitions read from the project documents named in each entry. Entries marked gap say what the supplied data does not define.' }, entries };
writeFileSync(new URL('../public/glossary-2026.json', import.meta.url), `${JSON.stringify(out, null, 2)}\n`);
console.log(`glossary entries: ${entries.length}; gaps: ${entries.filter((entry) => entry.gap).length}`);
