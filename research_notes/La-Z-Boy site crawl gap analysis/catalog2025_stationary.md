# La-Z-Boy Stationary Collection Catalog, Summer/Fall 2025 vs. the app (2026 editions)

Source: Publitas flipbook https://view.publitas.com/la-z-boy/stationary-collection-catalog-summer-fall-2025 (footer: "(c) 2025 La-Z-Boy Incorporated - 07/2025 - CA0317").
How it was read: the flipbook viewer pages (`/page/N`) return only a logo image plus a short meta description (the text layer is not exposed), but the viewer HTML links the flipbook source PDF (`.../29465/2409877/pdfs/f90f1f30-....pdf`, **40 pages**). That PDF was parsed with Firecrawl (`parsers: pdf`, `maxAge: 0`) and all 40 pages returned text. Spot checks of Publitas spreads (4-5, 6-7, 8-9, 10-11, 12-13, 14-15, 40) match that text. No page was unreadable; no screenshots were needed.

**Page numbering.** Citations written "P#" are Publitas page numbers; "p.#" are printed catalog page numbers (product pages 1-28). Publitas page = printed catalog page + 10 (verified from the spread meta-descriptions above). Printed pages 1-28 are the product pages. Printed pages 24-25 are not in the index (inferred to be the options / finish-options pages that follow Meyer, i.e. Publitas 34-35; the extracted text shows the "Options" and "Finish Options" blocks directly after the Meyer sectional page, with no page labels). Citations below use **printed catalog page (Publitas page)** where useful, e.g. "p.5 (P15)".

Totals: 20 model entries in the Style Name Index (19 distinct models + Kirby), **128 style records** transcribed (all `PREFIX-MODEL` codes with dimensions), 40 PDF pages.

## Headline findings

- **Only 8 of 128 style records are absent from the app's stationary-catalog-2026.json**: all of Kirby 60D (4 records) and all of Edie 897 (4 records). Neither name nor the 60D/897 model numbers appear in any public/*.json or tear-pad profile. Treat as **changed/discontinued in 2026** (absent from the 2026 stationary catalog; confirm with a current price book).
- The remaining 120 records exist in the 2026 stationary catalog, but **118 of 120 have different option codes** and **38 have different dimensions** (details in section C).
- **Option-code scheme changed 2025 to 2026**: 2025 lists C1, F1, Z5, ZB (and a few WL, FN); 2026 lists DC, FN, Z6 (no C1/F1/ZB). Z5 and ZB are not defined anywhere in the app (glossary-2026 has no Z5/ZB entry; app options have no Z5/ZB/C1/F1/WL entries).
- 3 models are in the 2026 app but not in this 2025 catalog (new in 2026): **Charlie 638, Lauren 677, Fleetwood 678**.
- 2025 "NEW" markers: Wilmette (sectional p.11), Shiloh (p.16), Tahoe 60A/60B-632 (p.15), Meyer 60A/60B/6MM-694 (p.22), plus cover call-outs Shiloh in D207432, Belmont in LB192976 (Lazaroman, see Recliner catalog), Audrey in FL207829 (Lazarini, see Designer's Choice catalog). All of those styles are present in the 2026 app.
- Only 22 of the 128 style numbers appear in `_pdf_codes.json` products (available_products.pdf); none are in "soon" (section B).

## (A) NEW to the app (present in 2025, absent from the 2026 app data)

### A1. Style records not in stationary-catalog-2026.json / style-index-2026.json (8)

| Style no. | Model | Type | Dimensions (H x W x D, exact 2025 wording) | Options | Cover caps | Finishes | Page (Publitas) |
|---|---|---|---|---|---|---|---|
| 240-60D | KIRBY | Ottoman | 18"H X 36"W X 24"D | N/A | FABRIC: DR, UR, UE, BU; RECYCLED LEATHER: RL | Std (007) Brown Mahogany; Opt (021) Coffee, (041) Graphite | p.9 (P19) |
| 620-60D | KIRBY | Apartment-Size Sofa | 37"H X 71"W X 41"D | C1, F1, FP, P1, Z5, ZB | FABRIC: DR, UR, UE, BU; RECYCLED LEATHER: RL | Std (007) Brown Mahogany; Opt (021) Coffee, (041) Graphite | p.9 (P19) |
| 640-60D | KIRBY | Extra Long Sofa | 37"H X 92"W X 41"D | C1, F1, FP, P1, Z5, ZB | FABRIC: DR, UR, UE, BU; RECYCLED LEATHER: RL | Std (007) Brown Mahogany; Opt (021) Coffee, (041) Graphite | p.9 (P19) |
| 655-60D | KIRBY | Chair & a Half | 37"H X 42.5"W X 41"D | C1, F1, FP, P1, Z5, ZB | FABRIC: DR, UR, UE, BU; RECYCLED LEATHER: RL | Std (007) Brown Mahogany; Opt (021) Coffee, (041) Graphite | p.9 (P19) |
| 90M-897 | EDIE | duo Armless Chair | 39"H X 36.5"W X 42"D | Z5 | FABRIC: DR, UR, UE, BU; RECYCLED LEATHER: RL; LEATHER: LL | Std (007) Brown Mahogany; Opt (021) Coffee, (041) Graphite | p.27 (P37) |
| 9CC-897 | EDIE | duo Corner (Wall Space Required: 83") | 39"H X 58"W X 42"D | C1, F1, FP, P1, Z5 | FABRIC: DR, UR, UE, BU; RECYCLED LEATHER: RL; LEATHER: LL | Std (007) Brown Mahogany; Opt (021) Coffee, (041) Graphite | p.27 (P37) |
| P9D-897 | EDIE | duo Left-Arm Sitting Reclining Loveseat | 39"H X 76.5"W X 42"D | C1, F1, FP, P1, Z5 | FABRIC: DR, UR, UE, BU; RECYCLED LEATHER: RL; LEATHER: LL | Std (007) Brown Mahogany; Opt (021) Coffee, (041) Graphite | p.27 (P37) |
| P9E-897 | EDIE | duo Right-Arm Sitting Reclining Loveseat | 39"H X 76.5"W X 42"D | C1, F1, FP, P1, Z5 | FABRIC: DR, UR, UE, BU; RECYCLED LEATHER: RL; LEATHER: LL | Std (007) Brown Mahogany; Opt (021) Coffee, (041) Graphite | p.27 (P37) |

- Kirby (60D) covers, p.9: E1917 i-Adario: E191734 Basmati, E191752 Fog, E191753 Stone, E191765 Taupe (same collection is on Tahoe p.15; Tahoe is in the app).
- Edie (897) covers, p.27: C1661 Belleame: C166132 Buff, C166158 Slate, C166164 Pewter, C166173 Fawn, C166176 Otter, C166184 Stonewash. None of the six C1661xx codes is in swatch-manifest.json (the 20 2025 swatch codes missing from the manifest are listed in A3).
- Edie is the **duo sectional**: modules P9D/P9E (power reclining loveseats with left/right arm), 90M armless chair, 9CC corner ("Wall Space Required: 83\""). 9CC is **not defined** in the 2025 prefix list (only P91, P93, P94, P9D, P9E, 90M are), and the app has no 9CC/90M/P9D/P9E style or prefix definition. available_products.pdf lists Edie under the alternate prefix spellings 90M-897, 9CC-897, 92P-897, 95P-897, 9DP-897, 9EP-897.
- Naming collision: Kirby's model number is **60D**, which is also the sectional prefix 60D (Left-Arm Sitting Loveseat). Kirby = `620-60D`, `640-60D`, `655-60D`, `240-60D`. Kirby is the only 2025 stationary style with an Extra Long Sofa (640, 92"W).

### A2. Option / reference items in the 2025 catalog that the app does not carry

| Item | 2025 wording (pages) | App status |
|---|---|---|
| Z5 | "COMFORTCORE PLUS TEMPUR-RESPONSE Z5 MEMORY FOAM CUSHIONING: Upgrades standard ComfortCore seat cushions to ComfortCore plus TEMPUR-Response Memory Foam seat cushions." (Publitas P8) | Not in app options or glossary. 2026 app uses Z6 "ComfortCore with Contour cushion" and DC instead. |
| ZB | "COMFORTCORE PLUS TEMPUR-RESPONSE MEMORY ZB FOAM SEAT AND BACK CUSHIONING: Upgrades standard ComfortCore seat cushions and backs to ComfortCore plus TEMPUR-Response Memory Foam seat and back cushioning." (Publitas P8) | Not in app. No ZB in any 2026 style. |
| C1 / C2 Cord, F1 / F2 Fringe | "Cord accent can be added to primary or secondary pillows on most styles." / "Fringe accent ... primary or secondary pillows on most styles." (Publitas P8) | Glossary has C1 "Cord Option" and F1 "Fringe Option"; stationary-catalog-2026 options list does not; C2/F2 are not defined anywhere in app. |
| P2 | "Fabric on second set of accent pillows can be changed on styles that come standard with two sets of pillows." (Publitas P8) | In app options. |
| WL | Appears in option list of 610-694 and 630-694 (Meyer sofa/loveseat, p.21) but **is not defined** on the 2025 options pages. Glossary-2026 defines WL = "Contrasting Welt". | Defined in glossary only; not in the 2026 Meyer options (2026: DC, FN, FP, P1, Z6). |
| FN | Appears on Wilmette sectional 60W-60Z (p.11) and Meyer 60A/60B/6MM (p.22) but is not defined in 2025. Glossary-2026: FN = "Wood finish (non-standard)". | Defined in glossary; 2026 app puts FN on nearly every record. |
| EXTRA FABRIC | "Additional yards of fabric or complete leather hides can be ordered for use in decorative detailing or to be kept on hand in the event that a repair is needed." (Publitas P8) | Not in app options (088AC2/3/4 arm caps are). |
| 088AC3 / 088AC4 | "Quantities of napkin style arm caps and headrest covers are available with all fabric orders." (Publitas P8) | App has 088AC2/3/4. |
| Prefix lists for Duo and special items | DUO: P91 Power Reclining Sofa, P93 Power Reclining Loveseat, P94 Power Reclining Chair, P9D / P9E Power Left/Right-Arm Sitting Reclining Loveseat, 90M Armless Middle. SPECIAL ITEMS: 01P single custom pillow, 08P pair of custom pillows, 088 "swivel/tall bases/handles/armcaps/battery packs/mattresses/misc. items". CLASSICS: 028 and 295 High Leg Reclining Chair, 29U High Leg Power Reclining Chair w/ Headrest. COMPLEMENTS: 024/245 Ottoman, 210 High Leg Swivel Chair, 215 Swivel Chair, 225 Swivel Gliding Chair, 235 Chair, 265 Reclining Chair. (Publitas P3) | stationary_prefix_definitions in stationary-catalog-2026.json has 31 entries (510 ... 60Z) and none of these. |
| Prefix 6SP wording | "6SP ARMLESS FULL SLEEPER" (prefix list) / "Armless Full Sleeper" (Collins p.6) | App says "Armless Full Sleep Sofa" (cosmetic). |
| Marketing call-outs | "SOPHISTICATED STYLE" and "POWER RECLINING" (Meyer sectional continuation, printed p.23 / P33) ; "100%" (Publitas P39, text fragment from the penultimate page, likely an image); "AMERICAN ICON / LZB SINCE 1927" (P39) ; "VISIT US AT LA-Z-BOY.COM FOR MORE INFORMATION" (P40) | Not applicable. |
| Warranty year assignments | The 2025 PDF text retains the year columns (see A4). | app `warranty_reference.notes` says per-component years could not be reconstructed from the 2026 extraction. |

### A3. 2025 cover (swatch) codes not in swatch-manifest.json (20)

C151664 Sable, C151677 Mocha (Meyer, p.21-22); C166132 Buff, C166158 Slate, C166164 Pewter, C166173 Fawn, C166176 Otter, C166184 Stonewash (Edie, p.27); C191532 Porcelain, C191556 Metal, C191565 Oatmeal, C191579 Cocoa and D165631 Parchment, D165657 Midnight, D165664 Smoke, D165667 Granite (Paxton p.17-18); E191853 Steel, E191859 Raven, E191862 Barley, E191886 Eclipse (Mackenzie p.3). Checked as exact substring matches in public/swatch-manifest.json (94 of 114 distinct 2025 codes are present).

### A4. Warranty tables (exact 2025 wording, p.7 / P7)

Intro: "At La-Z-Boy, when we build our furniture we build it to last. And that's why we back the majority of our frames with a Limited Lifetime Warranty assuring your complete satisfaction. Frames, mechanisms, cushions and springs are quality crafted then rigorously tested for long-lasting comfort. Fabrics are wear-tested in our lab before being La-Z-Boy certified. And, for homes with children, pets or just everyday life, we have unique specialty fabrics that will suit your specific needs."

Year assignments as extracted (bullets are placed by the PDF text layer; verify visually before relying on them):

| LA-Z-BOY PREMIER SOFAS, SLEEP SOFAS, AND SECTIONALS | Term |
|---|---|
| Frame | Limited Lifetime |
| Show Wood | 1 year |
| Springs and Spring Systems | Limited Lifetime |
| Supreme Comfort Mechanism | Limited Lifetime |
| SlumberAir Motor | 1 year |
| Polyurethane Foam Cushioning | 1 year |
| ComfortCore Cushion | 3 year |
| ComfortCore Plus TEMPUR-Response Memory Foam Cushion | 5 year |
| Fabric and Leather; conserve Fabric*; Antimicrobial Fabric and Leather*; Restore by Nanobionic Fabric | 1 year |
| iClean Fabric and Leather*; iClean and conserve Fabric*; iClean Antimicrobial Fabric and Leather*; iClean and Restore by Nanobionic Fabric* | 3 year |
| Supreme Comfort Mattress | 5 year |
| SlumberAir Mattress | 5 year |
| Tempur-Response Memory Foam Mattress | 3 year |

| duo PREMIER SOFAS, SECTIONALS, LOVESEATS, AND CHAIRS | Term |
|---|---|
| Battery Pack | 1 year |
| Frame | Limited Lifetime |
| Show Wood | 1 year |
| Springs and Spring Systems | Limited Lifetime |
| Electrical Components | 3 year |
| duo Mechanism | Limited Lifetime |
| ComfortCore Cushion | 3 year |
| ComfortCore Plus TEMPUR-Response Memory Foam Cushion | 5 year |
| Fabric and Leather; conserve; Antimicrobial; Restore by Nanobionic | 1 year |
| iClean variants (all four) | 1 year as extracted (differs from the Premier table where iClean is 3 year; check the image) |

| STATIONARY SELECT LEATHER | Term |
|---|---|
| Frame | Limited Lifetime |
| Show Wood | 1 year |
| Springs and Spring Systems | Limited Lifetime |
| Seat Cushions | 3 year |
| Leather | 1 year |
| Restore By Nanobionic Fabrics | 1 year |

2025 has no ComfortDown or "ComfortCore with Contour" warranty rows (the 2026 app warranty text lists both).

## (B) Already in the app (matched on style code in stationary-catalog-2026.json)

| Model | Name | 2025 printed pages | 2025 records | Records in app 2026 | Records in available_products.pdf (`_pdf_codes.json`) |
|---|---|---|---|---|---|
| 411 | LAUREL | 1 | 3 | 3 | 0 |
| 418 | LEAH | 2 | 3 | 3 | 0 |
| 435 | MACKENZIE | 3 | 5 | 5 | 5 |
| 491 | NATALIE | 4 | 5 | 5 | 0 |
| 494 | COLLINS | 5, 6 | 18 | 18 | 15 |
| 593 | KENNEDY | 8 | 7 | 7 | 0 |
| 60D | KIRBY | 9 | 4 | 0 | 0 |
| 603 | WILMETTE | 10, 11 | 7 | 7 | 0 |
| 606 | NOAH | 12 | 4 | 4 | 0 |
| 613 | OLSON | 13 | 6 | 6 | 0 |
| 620 | PIPER | 14 | 5 | 5 | 0 |
| 632 | TAHOE | 15 | 9 | 9 | 0 |
| 636 | SHILOH | 16 | 6 | 6 | 0 |
| 663 | PAXTON | 17, 18 | 10 | 10 | 0 |
| 665 | ALANI | 19 | 6 | 6 | 0 |
| 681 | BEXLEY | 20 | 3 | 3 | 0 |
| 694 | MEYER | 21, 22 | 17 | 17 | 0 |
| 893 | COLBY | 26 | 3 | 3 | 0 |
| 897 | EDIE | 27 | 4 | 0 | 2 |
| 899 | BENNETT | 28 | 3 | 3 | 0 |

Style numbers from this catalog that appear in `_pdf_codes.json` "products" (22): 230-435, 240-435, 510-435, 610-435, 630-435, 230-494, 240-494, 610-494, 630-494, 60A-494, 60B-494, 60C-494, 60D-494, 60E-494, 60L-494, 60M-494, 60R-494, 6CC-494, 6MM-494, 6SP-494, 90M-897, 9CC-897. None appear in "soon". All 2025 sectional/duo spellings in that PDF are reordered in some cases (e.g. 91P-899/93P-899/94P-899 for P91/P93/P94-899; 92P/95P/9DP/9EP-897; 60W-491, 60X-491 for model 491 which in this 2025 catalog is a non-sectional Natalie) so those were not counted as matches. Model-level overlap with the PDF: 435 (5 of 5 records), 494 (all 15 records), 897 (90M, 9CC only matched literally).

Other models in the app's other data: Colby 893 and Bennett 899 (duo) are also in style-index-2026.json (P91/P93/P94, family MOTION for 893); app catalog entries for Collins, Meyer and Charlie have tear-pad profiles (collins-494, meyer-694, charlie-638, plus alani-665, paxton-663, tahoe-632, wilmette-603). Collins 6-piece sectional modules in tear pad (MP0073, 07/01/25) match the 2025 catalog piece list (6SR, 6SC, 60M ... ).

Models in the 2026 app but **not** in this 2025 catalog (new in 2026): Charlie 638 (pp.14-16 in 2026), Lauren 677 (p.20), Fleetwood 678 (p.21).

2025 pillow collection (Publitas P10; 01P-202/203/204/222/262 and 08P-201/220/222/260/262), dimensions, options, quantity and the 2025 pillow cover-cap choices (FABRIC: DR, UR, DP, NP, PS, VS) **match** app pillow_styles (same codes, H x W). Differences: the app lists only FP as option for 222/262/220/260/201 while 2025 lists "C1, F1, FP". Finishes 007/021/041/071 are in the app (descriptions are shorter in the app). Prefix definitions for 510 ... 60Z are in the app. Option codes MA, MT, FP, P1, P2, NB, NS, NH, NN, LG, LT, 0881YC, 088AC are in the app.

## (C) Conflicts / changes 2025 to 2026 (flag: changed/discontinued)

### C1. Discontinued or absent in 2026 (per app data)

- **Kirby 60D** (620-60D, 640-60D, 655-60D, 240-60D): absent. **Edie 897** (90M, 9CC, P9D, P9E): absent. Treat as changed/discontinued in the 2026 stationary catalog; Edie's power-reclining loveseats may live in a motion catalog, but there is no 897 record in style-index-2026.json (859 styles).
- Option codes removed: **ZB** (seat and back Tempur-Response) and **C1/F1** (cord/fringe) and **Z5**: none appear in the 2026 stationary options. WL on Meyer sofa/loveseat removed.
- 2025 swatches removed in the 2026 app (per model; "2026 added" in parentheses where the collection was replaced):
  - Leah 418 (p.2): C165962 Smoke, C165967 Charcoal, C165972 Taupe, C165986 Indigo, C165992 Mist removed (2026 adds D211632 Porcelain, D211652 Fog, D211675 Saddle, D211686 Indigo).
  - Mackenzie 435 (p.3): E191853 Steel, E191859 Raven, E191862 Barley, E191886 Eclipse removed (2026 adds C212152 Mineral, C212167 Flint, C212171 Flax, C212174 Sandstone, C212181 Spa and LB206032/54/77/87 leather).
  - Collins 494 (p.5-7): no 2025 swatch removed; 2026 adds D209931 Parchment, D209933 Oyster, D209953 Pewter, D209965 Driftwood.
  - Kennedy 593 (Publitas P8): D203830 Snow, D203859 Carbon, D203862 Flax, D203872 Brown Sugar, D203878 Cocoa, D203885 Navy removed (2026 adds D212931 Dove, D212933 Natural, D212952 Steel, D212954 Stone, D212970 Mushroom).
  - Paxton 663 (p.17-18): C191532/56/65/79 and D165631/57/64/67 removed (2026 adds D210137 Porcelain, D210155 Pebble, D210162 Flax, D210174 Twine).
  - Alani 665 (p.19): 2025 D180786 Eclipse; app 2026 carries "D1807786 Eclipse" (7-digit code, likely a typo in app) and adds D210137/55/62/74.
  - Meyer 694 (p.21-23): C151631 Dove, C151651 Platinum, C151657 Charcoal, C151664 Sable, C151677 Mocha, C170033 Oyster, C170053 Ash, C170057 Charcoal removed (2026 adds D209931/33/53/65).
  - Bennett 899 (p.28): D203032 Sand, D203034 Granite, D203053 Ash removed.
  - Wilmette 603, Olson 613, Shiloh 636: 2025 swatches retained; 2026 adds leather/other covers (LB206032/54/77/87; Olson/Shiloh also D209324 Leaf, D209331 Vellum, D209351 Silver, D209355 Mushroom, D209374 Dusty Rose, D209375 Cappuccino, D209376 Truffle).
  - Unchanged cover sets: Laurel 411, Natalie 491, Noah 606, Piper 620, Tahoe 632, Bexley 681, Colby 893.

### C2. Dimension differences for the same style code (38 records; 2025 exact vs app 2026)

| Style | 2025 page (Publitas) | 2025 dimensions | App 2026 dimensions |
|---|---|---|---|
| 610-491 | p.4 (P14) | 39"H X 86"W X 38"D | 39 in H × 89 in W × 38 in D |
| 630-491 | p.4 (P14) | 39"H X 63.5"W X 38"D | 39 in H × 65 in W × 38 in D |
| 230-494 | p.5 (P15) | 37"H X 39"W X 38"D | 37.5 in H × 41 in W × 39 in D |
| 610-494 | p.5 (P15) | 37"H X 87"W X 38"D | 37.5 in H × 89 in W × 39 in D |
| 630-494 | p.5 (P15) | 37"H X 63"W X 38"D | 37.5 in H × 65 in W × 39 in D |
| 60A-494 | p.6 (P16) | 37"H X 33"W X 39"D | 37.5 in H × 32.5 in W × 39 in D |
| 60B-494 | p.6 (P16) | 37"H X 33"W X 39"D | 37.5 in H × 32.5 in W × 39 in D |
| 60C-494 | p.6 (P16) | 37"H X 67"W X 39"D | 37.5 in H × 67 in W × 39 in D |
| 60D-494 | p.6 (P16) | 37"H X 57"W X 39"D | 37.5 in H × 56.5 in W × 39 in D |
| 60E-494 | p.6 (P16) | 37"H X 57"W X 39"D | 37.5 in H × 56.5 in W × 39 in D |
| 60L-494 | p.6 (P16) | 37"H X 33"W X 64"D | 37.5 in H × 32.5 in W × 64 in D |
| 60M-494 | p.6 (P16) | 37"H X 24"W X 39"D | 37.5 in H × 24 in W × 39 in D |
| 60R-494 | p.6 (P16) | 37"H X 33"W X 64"D | 37 in H × 33.5 in W × 64 in D |
| 6CC-494 | p.6 (P16) | 37"H X 53"W X 39"D | 37.5 in H × 53 in W × 39 in D |
| 6SL-494 | p.6 (P16) | 37"H X 39"W X 64"D | 37.5 in H × 39 in W × 64 in D |
| 6SR-494 | p.6 (P16) | 37"H X 39"W X 64"D | 37.5 in H × 39 in W × 64 in D |
| 60A-632 | p.15 (P25) | 37"H X 37"W X 38.5"D | 37 in H × 47 in W × 38.5 in D |
| 60B-632 | p.15 (P25) | 37"H X 37"W X 38.5"D | 37 in H × 47 in W × 38.5 in D |
| 510-636 | p.16 (P26) | 37"H X 80.5"W X 39.5"D | 37 in H × 80.5 in W × 39 in D |
| 520-636 | p.16 (P26) | 37"H X 72.5"W X 39.5"D | 37 in H × 72.5 in W × 39 in D |
| 555-636 | p.16 (P26) | 37"H X 52"W X 39.5"D | 37 in H × 44 in W × 39 in D |
| 610-636 | p.16 (P26) | 37"H X 80.5"W X 39.5"D | 37 in H × 80.5 in W × 39 in D |
| 620-636 | p.16 (P26) | 37"H X 72.5"W X 39.5"D | 37 in H × 72.5 in W × 39 in D |
| 655-636 | p.16 (P26) | 37"H X 52"W X 39.5"D | 37 in H × 44 in W × 39 in D |
| 240-663 | p.17 (P27) | 18.5"H X 40.5"W X 26"D | 19 in H × 41 in W × 26.5 in D |
| 230-694 | p.21 (P31) | 38"H X 38"W X 40"D | 37.5 in H × 38 in W × 39 in D |
| 240-694 | p.21 (P31) | 18"H X 30"W X 23"D | 18 in H × 30.5 in W × 23.5 in D |
| 610-694 | p.21 (P31) | 38"H X 86"W X 40"D | 37.5 in H × 86 in W × 39 in D |
| 630-694 | p.21 (P31) | 38"H X 62"W X 40"D | 37.5 in H × 62 in W × 39 in D |
| 60C-694 | p.22 (P32) | 37.5"H X 66"W X 55"D | 37.5 in H × 67 in W × 39 in D |
| 60D-694 | p.22 (P32) | 37.5"H X 57"W X 40"D | 37.5 in H × 55 in W × 39 in D |
| 60E-694 | p.22 (P32) | 37.5"H X 57"W X 40"D | 37.5 in H × 55 in W × 39 in D |
| 60L-694 | p.22 (P32) | 37.5"H X 32"W X 64.5"D | 37.5 in H × 31 in W × 64 in D |
| 60M-694 | p.22 (P32) | 37.5"H X 24"W X 40"D | 37.5 in H × 24 in W × 39 in D |
| 60R-694 | p.22 (P32) | 37.5"H X 32"W X 64.5"D | 37.5 in H × 31 in W × 64 in D |
| 6CC-694 | p.22 (P32) | 37.5"H X 53"W X 40"D | 37.5 in H × 53 in W × 39 in D |
| 6SL-694 | p.22 (P32) | 37.5"H X 38"W X 64"D | 37.5 in H × 39 in W × 64 in D |
| 6SR-694 | p.22 (P32) | 37.5"H X 38"W X 64"D | 37.5 in H × 39 in W × 64 in D |

Notable: Shiloh 555-636 and 655-636 are 52"W in 2025 vs 44"W in the app; 2025 names 555-636 "Twin Sleep Sofa" (the 2025 prefix list calls 555 "Twin Sleep Chair & a Half"). Tahoe 60A/60B-632 are 37"W in 2025 vs 47"W in the app. Meyer 60C-694 is 55"D in 2025 vs 39"D in the app (the 2025 55"D value looks inconsistent with the other Meyer pieces at 39-40"D; may be a typo in either source). Collins and Meyer height 37/37.5 (2025) vs 37.5/37.5 (app) and widths drift by 0.5-3". Natalie sofa/loveseat 86/63.5"W (2025) vs 89/65"W (app).

### C3. Option-code differences (118 of 120 matched records)

The 2025 option lists are systematically different from the 2026 app lists. Most common patterns (count of records):

| 2025 options | 2026 app options | Records |
|---|---|---|
| C1, F1, FP, P1, Z5, ZB | DC, FN, FP, P1, Z6 | 25 |
| C1, F1, FP, P1, Z5, ZB | DC, FP, P1, Z6 | 20 |
| N/A | FN | 11 |
| C1, F1, FP, P1, Z5 | DC, FN, FP, P1, Z6 | 10 |
| C1, F1, FP, MA, MT, P1, Z5 | DC, FN, FP, MA, MT, P1, Z6 | 6 |
| Z5, ZB | DC, Z6 | 6 |
| C1, F1, FP, MA, MT, P1, Z5, ZB | DC, FN, FP, MA, MT, P1, Z6 | 6 |
| FN, FP, P1, Z5, ZB | DC, FN, FP, P1, Z6 | 4 |
| C1, F1, FP, P1, Z5 | FN, FP, P1 | 4 |
| C1, F1, FP, MA, MT, P1, Z5 | DC, FP, MA, MT, P1, Z6 | 3 |
| Z5 | DC, FN, Z6 | 3 |
| N/A | N/A | 2 |
| N/A | (none) | 2 |
| FP, P1, Z5, ZB | DC, FN, FP, P1, Z6 | 2 |
| Z5, ZB | DC, FN, Z6 | 2 |
| C1, F1, FP, NB, NH, NS, P1, Z5 | DC, FN, FP, NB, NH, NS, P1, Z6 | 2 |
| C1, F1, FP, P1, WL, Z5, ZB | DC, FN, FP, P1, Z6 | 2 |
| C1, F1, FN, FP, P1, Z5, ZB | DC, FN, FP, P1, Z6 | 2 |
| MA, MT, Z5, ZB | DC, MA, MT, Z6 | 1 |
| Z5, ZB | DC, FN | 1 |
| C1, F1, FP, MA, MT, NB, NH, NS, P1, Z5 | DC, FN, FP, MA, MT, NB, NH, NS, P1, Z6 | 1 |
| Z5, ZB | DC, FN, FP, P1, Z6 | 1 |
| C1, F1, FP, Z5, ZB | DC, FN, FP, P1, Z6 | 1 |
| FN, Z5, ZB | DC, FN, FP, P1, Z6 | 1 |
| LT, Z5 | FN, LT | 1 |
| Z5 | FN, LT | 1 |

Summary: C1, F1, Z5, ZB (and WL) are gone in 2026; DC and Z6 are added to nearly every seat-bearing piece; FN (non-standard wood finish) is added to most; "N/A" items (ottomans, storage arms/consoles) become FN in many cases; 2025 Duo (Colby/Bennett P91/P93/P94) options "C1, F1, FP, P1, Z5" become "FN, FP, P1" and 2025 P94-899 "Z5" becomes "FN, LT". The two unchanged records are the 2025 "N/A" vs 2026 "N/A" ones.

### C4. Internal inconsistencies in the 2025 catalog itself

- Shiloh is "636" on the product page (p.16), in the Style Name Index ("SHILOH NEW 636 ... 16") and the cover call-out, but the Table of Contents prints "NEW 635 SHILOH 16".
- Wilmette sectional (p.11) is "NEW 602 WILMETTE" in the Table of Contents but every code on the page is `-603` (60W/60X/60Y/60Z-603) and the Style Name Index says "WILMETTE NEW 603 ... 10-11".
- The Style Name Index lists Kirby as style "60D" (page 9). TOC row: "60D KIRBY 9".
- Tahoe 632 sectional p.15: the sectional drawing caption is "60B/60M/6CC/60M/6SC/60A-632" and the dimension table includes 240-632 "Storage Ottoman" 21.5H x 38.5W x 38.5D with options N/A.
- Page 6 (Collins sectional) caption includes "6SR/60M/60M/60C/60D-494"; "Farifax" is misspelled for "Fairfax" in the Collins sectional cover heading (p.7).
- Pillow table prints style codes as "O1P-202" / "O8P-201*" (letter O) while the drawings use "01P"/"08P" (zero).
- Alani (p.19) table lists 60A/60B/60L/60M/60R/6CC only; no ottoman or loveseat.
- Paxton p.18 caption "60B/6CC/60M/60L-663" and the table lists six pieces (60A, 60B, 60L, 60M, 60R, 6CC).
- Meyer 60R-694 options omit P1 ("C1, F1, FP, Z5, ZB") while 60L-694 includes it; app 2026 has P1 on 60R.
- Kennedy page (Publitas P8) contains duplicated LaTeX-style dimension strings (e.g. "39 deg H x 32 deg W x 38 deg D") from the extraction; the table values are authoritative.

## (D) Page-by-page index (what was read)

All 40 Publitas pages read via the flipbook PDF text; none unreadable. Printed catalog page (Publitas page).

| Publitas page | Printed | Content read |
|---|---|---|
| 1 | cover | "La-Z-boy Stationary Collection SUMMER/FALL 2025" (viewer meta confirms page 1 is the cover; the viewer shows only a logo image). |
| 2 | front | Prefix Definitions (bolded lines = prefixes included): rocker/wall/glider recliners (010, P10, 10U, 10X, 016, P16, 16X, 017, 30L, 30R, 3CS/SC3), lift chairs (1HM, 1PH, 1PL, 3BL, 4LP), Reclina-Way (330/33U/33X, 320/32U/32X, 390/339, 39U/U39, 39X/X39), La-Z-Motion (84U, 88U, 81U, 85U), Lazaroman "NEW BELMONT in LB192976 - See Recliner Collection catalog", La-Z-Time motion (445/U45/X45 ... 449/U49/X49) and modulars (44A ... X4V, 8AU ... 8SC). (Publitas page 2-3 spread meta: "Prefix Definitions BOLDED LINES ARE PREFIXES INCLUDED IN THIS CATALOG ROCKER RECLINERS...") |
| 3 | front | Prefix Definitions (stationary): stationary sectionals 60A, 6AL, 60B, 6AR, 60C, 6CC, 60D, 60E, 60L, 60R, 60M, 6MM, 6SC, 6SL, 6SR, 6SP; Classics 60W, 60X, 60Y, 60Z; stationary sofas & sleep sofas 510, 51S, 520, 61S, 620, 630, 640, 555, 655, 230, 240; DUO P91, P93, P94, P9D, P9E, 90M; special items 01P, 08P, 088; Classics 028, 295, 29U; Complements 024/245, 210, 215, 225, 235, 265; "NEW SHILOH in D207432". |
| 4 | front | Style Name Index (20 names, each with style and printed page). |
| 5 | front | Table of Contents part 1 (411 Laurel p.1 ... 632 Tahoe p.15) with Sofa/Sleeper/Loveseat/Chair & Ottoman/Modular/Fabric/Leather matrix. |
| 6 | front | Table of Contents part 2 (NEW 635 Shiloh p.16 ... 899 Bennett p.28) and "LAZARINI ... NEW AUDREY in FL207829 See Designer's Choice Collection catalog". |
| 7 | front | Limited Lifetime Warranty text and three warranty tables (A4). |
| 8 | front | Options: C1/C2 cord, F1/F2 fringe, LG, NS, NB, NH, NN, P1, P2, Z5, ZB, MA, MT, FP, extra fabric, 088AC3/088AC4. |
| 9 | front | Finish Options 007 Brown Mahogany, 021 Coffee, 041 Graphite, 071 Driftwood. |
| 10 | front | Pillow Collections (10 styles) and cover-cap choices DR, UR, DP, NP, PS, VS. |
| 11 | 1 | LAUREL (411): 240-411, 610-411, 655-411. Plus cover-cap choices, finishes and select-cover swatches. |
| 12 | 2 | LEAH (418): 510-418, 520-418, 555-418. Plus cover-cap choices, finishes and select-cover swatches. |
| 13 | 3 | MACKENZIE (435): 230-435, 240-435, 510-435, 610-435, 630-435. Plus cover-cap choices, finishes and select-cover swatches. |
| 14 | 4 | NATALIE (491): 230-491, 240-491, 510-491, 610-491, 630-491. Plus cover-cap choices, finishes and select-cover swatches. |
| 15 | 5 | COLLINS (494): 230-494, 240-494, 610-494, 630-494. Sofa/loveseat/chair/ottoman. Plus cover-cap choices, finishes and select-cover swatches. |
| 16 | 6 | COLLINS (494): 60A-494, 60B-494, 60C-494, 60D-494, 60E-494, 60L-494, 60M-494, 60R-494, 6CC-494, 6MM-494, 6SC-494, 6SL-494, 6SP-494, 6SR-494. Plus cover-cap choices, finishes and select-cover swatches. |
| 17 | 7 | Collins (494) stationary sectional, continued: AVAILABLE IN LA-Z-BOY SELECT COVERS (D1807 Fairfax, D1905 York swatches; the heading prints "Farifax"). |
| 18 | 8 | KENNEDY (593): 230-593, 240-593, 510-593, 520-593, 610-593, 620-593, 630-593. Plus cover-cap choices, finishes and select-cover swatches. |
| 19 | 9 | KIRBY (60D): 240-60D, 620-60D, 640-60D, 655-60D. Plus cover-cap choices, finishes and select-cover swatches. |
| 20 | 10 | WILMETTE (603): 610-603, 655-603, 240-603. Plus cover-cap choices, finishes and select-cover swatches. |
| 21 | 11 | WILMETTE (603): 60W-603, 60X-603, 60Y-603, 60Z-603. Plus cover-cap choices, finishes and select-cover swatches. |
| 22 | 12 | NOAH (606): 230-606, 240-606, 610-606, 630-606. Plus cover-cap choices, finishes and select-cover swatches. |
| 23 | 13 | OLSON (613): 510-613, 520-613, 555-613, 610-613, 620-613, 655-613. Plus cover-cap choices, finishes and select-cover swatches. |
| 24 | 14 | PIPER (620): 510-620, 610-620, 630-620, 51S-620, 61S-620. Plus cover-cap choices, finishes and select-cover swatches. |
| 25 | 15 | TAHOE (632): 240-632, 60M-632, 6MM-632, 6CC-632, 6AL-632, 6AR-632, 6SC-632, 60A-632, 60B-632. Plus cover-cap choices, finishes and select-cover swatches. |
| 26 | 16 | SHILOH (636): 510-636, 520-636, 555-636, 610-636, 620-636, 655-636. Plus cover-cap choices, finishes and select-cover swatches. |
| 27 | 17 | PAXTON (663): 240-663, 610-663, 630-663, 655-663. Plus cover-cap choices, finishes and select-cover swatches. |
| 28 | 18 | PAXTON (663): 60A-663, 60B-663, 60L-663, 60M-663, 60R-663, 6CC-663. Plus cover-cap choices, finishes and select-cover swatches. |
| 29 | 19 | ALANI (665): 60A-665, 60B-665, 60L-665, 60M-665, 60R-665, 6CC-665. Plus cover-cap choices, finishes and select-cover swatches. |
| 30 | 20 | BEXLEY (681): 510-681, 610-681, 630-681. Plus cover-cap choices, finishes and select-cover swatches. |
| 31 | 21 | MEYER (694): 230-694, 240-694, 610-694, 630-694. Plus cover-cap choices, finishes and select-cover swatches. |
| 32 | 22 | MEYER (694): 60C-694, 6SC-694, 60D-694, 60E-694, 60L-694, 60M-694, 60R-694, 6CC-694, 6SL-694, 6SR-694, 60A-694, 60B-694, 6MM-694. Plus cover-cap choices, finishes and select-cover swatches. |
| 33 | 23 | Meyer (694) stationary sectional, continued: select covers C1516 Merit, C1700 Nico, C1965 Nora (C196584 Harbor marked duo); marketing call-outs "SOPHISTICATED STYLE" and "POWER RECLINING". |
| 34-35 | 24-25 (un-numbered, inferred) | Text after Meyer sectional page: Options page (C1 cord, F1 fringe, FP, LT left-hand power activator, NB, NS, P1, NH, ZB, 0881YC battery pack, Z5) and Finish Options page (007, 021, 041) - the duo-style option set; page labels not present in the extracted text, so assignment to P34/P35 is inferred. |
| 36 | 26 | COLBY (893): P91-893, P93-893, P94-893. Plus cover-cap choices, finishes and select-cover swatches. |
| 37 | 27 | EDIE (897): 90M-897, 9CC-897, P9D-897, P9E-897. Plus cover-cap choices, finishes and select-cover swatches. |
| 38 | 28 | BENNETT (899): P91-899, P93-899, P94-899. Plus cover-cap choices, finishes and select-cover swatches. |
| 39 | -- | "100%" and "AMERICAN ICON LZB SINCE 1927" (back inside/cover art). |
| 40 | -- | "VISIT US AT LA-Z-BOY.COM FOR MORE INFORMATION  (c) 2025 La-Z-Boy Incorporated - 07/2025 - CA0317" (viewer meta confirms). |

Unread pages: none. Publitas pages 34-39 text is verified as present but its page boundaries (which of 34/35/36/37 hold which block) are inferred; viewer URL meta confirmed 12-13 = Leah/Mackenzie, 14-15 = Natalie/Collins, 40 = back cover.

Select-cover swatch collections per model (exact codes) and the dimension tables for all 128 records are in the JSON companion file.

## (E) Machine-readable appendix

Full records (including options, cover caps, finishes, swatches, app comparison fields, warranty-free) are saved at `/home/user/LAZ-Boy/research_notes/La-Z-Boy site crawl gap analysis/catalog2025_stationary.json`. Compact copy of all 128 style records:

```json
[{"style_number": "240-411","name": "LAUREL","type": "Ottoman","dimensions": "19\"H X 41\"W X 23.5\"D","page": 1},{"style_number": "610-411","name": "LAUREL","type": "Sofa","dimensions": "39\"H X 80\"W X 38\"D","page": 1},{"style_number": "655-411","name": "LAUREL","type": "Chair & a Half","dimensions": "39\"H X 52\"W X 38\"D","page": 1},{"style_number": "510-418","name": "LEAH","type": "Queen Sleep Sofa","dimensions": "38\"H X 82\"W X 38.5\"D","page": 2},{"style_number": "520-418","name": "LEAH","type": "Full Sleep Sofa","dimensions": "38\"H X 73.5\"W X 38.5\"D","page": 2},{"style_number": "555-418","name": "LEAH","type": "Twin Sleep Chair","dimensions": "38\"H X 54\"W X 38.5\"D","page": 2},{"style_number": "230-435","name": "MACKENZIE","type": "Chair","dimensions": "37.5\"H X 42\"W X 37\"D","page": 3},{"style_number": "240-435","name": "MACKENZIE","type": "Ottoman","dimensions": "19.5\"H X 32\"W X 24\"D","page": 3},{"style_number": "510-435","name": "MACKENZIE","type": "Queen Sleep Sofa","dimensions": "36.5\"H X 87\"W X 38\"D","page": 3},{"style_number": "610-435","name": "MACKENZIE","type": "Sofa","dimensions": "36.5\"H X 87\"W X 38\"D","page": 3},{"style_number": "630-435","name": "MACKENZIE","type": "Loveseat","dimensions": "36.5\"H X 64\"W X 38\"D","page": 3},{"style_number": "230-491","name": "NATALIE","type": "Chair","dimensions": "39\"H X 41\"W X 38\"D","page": 4},{"style_number": "240-491","name": "NATALIE","type": "Ottoman","dimensions": "19\"H X 31.5\"W X 23\"D","page": 4},{"style_number": "510-491","name": "NATALIE","type": "Queen Sleep Sofa","dimensions": "39\"H X 86\"W X 38\"D","page": 4},{"style_number": "610-491","name": "NATALIE","type": "Sofa","dimensions": "39\"H X 86\"W X 38\"D","page": 4},{"style_number": "630-491","name": "NATALIE","type": "Loveseat","dimensions": "39\"H X 63.5\"W X 38\"D","page": 4},{"style_number": "230-494","name": "COLLINS","type": "Chair","dimensions": "37\"H X 39\"W X 38\"D","page": 5},{"style_number": "240-494","name": "COLLINS","type": "Ottoman","dimensions": "18.5H x 31.5W x 23.5D","page": 5},{"style_number": "610-494","name": "COLLINS","type": "Sofa","dimensions": "37\"H X 87\"W X 38\"D","page": 5},{"style_number": "630-494","name": "COLLINS","type": "Loveseat","dimensions": "37\"H X 63\"W X 38\"D","page": 5},{"style_number": "60A-494","name": "COLLINS","type": "Left-Arm Sitting Chair","dimensions": "37\"H X 33\"W X 39\"D","page": 6},{"style_number": "60B-494","name": "COLLINS","type": "Right-Arm Sitting Chair","dimensions": "37\"H X 33\"W X 39\"D","page": 6},{"style_number": "60C-494","name": "COLLINS","type": "Rounded Corner Unit (Wall Space Required: 98\")","dimensions": "37\"H X 67\"W X 39\"D","page": 6},{"style_number": "60D-494","name": "COLLINS","type": "Left-Arm Sitting Loveseat","dimensions": "37\"H X 57\"W X 39\"D","page": 6},{"style_number": "60E-494","name": "COLLINS","type": "Right-Arm Sitting Loveseat","dimensions": "37\"H X 57\"W X 39\"D","page": 6},{"style_number": "60L-494","name": "COLLINS","type": "Left-Arm Sitting Chaise","dimensions": "37\"H X 33\"W X 64\"D","page": 6},{"style_number": "60M-494","name": "COLLINS","type": "Armless Chair","dimensions": "37\"H X 24\"W X 39\"D","page": 6},{"style_number": "60R-494","name": "COLLINS","type": "Right-Arm Sitting Chaise","dimensions": "37\"H X 33\"W X 64\"D","page": 6},{"style_number": "6CC-494","name": "COLLINS","type": "90 Degree Corner Unit (Wall Space Required: 78\")","dimensions": "37\"H X 53\"W X 39\"D","page": 6},{"style_number": "6MM-494","name": "COLLINS","type": "Sectional Armless Loveseat","dimensions": "37\"H X 62\"W X 39\"D","page": 6},{"style_number": "6SC-494","name": "COLLINS","type": "Storage Console","dimensions": "25.5\"H X 10\"W X 38.5\"D","page": 6},{"style_number": "6SL-494","name": "COLLINS","type": "Left-Arm Sitting Chaise w/ Storage","dimensions": "37\"H X 39\"W X 64\"D","page": 6},{"style_number": "6SP-494","name": "COLLINS","type": "Armless Full Sleeper","dimensions": "37\"H X 62\"W X 39\"D","page": 6},{"style_number": "6SR-494","name": "COLLINS","type": "Right-Arm Sitting Chaise w/ Storage","dimensions": "37\"H X 39\"W X 64\"D","page": 6},{"style_number": "230-593","name": "KENNEDY","type": "Chair","dimensions": "39\"H X 32\"W X 38\"D","page": 8},{"style_number": "240-593","name": "KENNEDY","type": "Ottoman","dimensions": "19\"H X 27\"W X 24\"D","page": 8},{"style_number": "510-593","name": "KENNEDY","type": "Queen Sleep Sofa","dimensions": "39\"H X 77\"W X 38\"D","page": 8},{"style_number": "520-593","name": "KENNEDY","type": "Full Sleep Sofa","dimensions": "39\"H X 69\"W X 38\"D","page": 8},{"style_number": "610-593","name": "KENNEDY","type": "Sofa","dimensions": "39\"H X 77\"W X 38\"D","page": 8},{"style_number": "620-593","name": "KENNEDY","type": "Apartment-Size Sofa","dimensions": "39\"H X 69\"W X 38\"D","page": 8},{"style_number": "630-593","name": "KENNEDY","type": "Loveseat","dimensions": "39\"H X 54.5\"W X 38\"D","page": 8},{"style_number": "240-60D","name": "KIRBY","type": "Ottoman","dimensions": "18\"H X 36\"W X 24\"D","page": 9},{"style_number": "620-60D","name": "KIRBY","type": "Apartment-Size Sofa","dimensions": "37\"H X 71\"W X 41\"D","page": 9},{"style_number": "640-60D","name": "KIRBY","type": "Extra Long Sofa","dimensions": "37\"H X 92\"W X 41\"D","page": 9},{"style_number": "655-60D","name": "KIRBY","type": "Chair & a Half","dimensions": "37\"H X 42.5\"W X 41\"D","page": 9},{"style_number": "610-603","name": "WILMETTE","type": "Sofa","dimensions": "37\"H X 75.5\"W X 36\"D","page": 10},{"style_number": "655-603","name": "WILMETTE","type": "Chair & a Half","dimensions": "37\"H X 39\"W X 36\"D","page": 10},{"style_number": "240-603","name": "WILMETTE","type": "Ottoman","dimensions": "18\"H X 37.5\"W X 24\"D","page": 10},{"style_number": "60W-603","name": "WILMETTE","type": "Left-Arm Sitting Sofa w/ Attached Corner","dimensions": "37\"H X 107\"W X 36\"D","page": 11},{"style_number": "60X-603","name": "WILMETTE","type": "Right-Arm Sitting Sofa w/ Attached Corner","dimensions": "37\"H X 107\"W X 36\"D","page": 11},{"style_number": "60Y-603","name": "WILMETTE","type": "Left-Arm Sitting Sofa","dimensions": "37\"H X 73.5\"W X 36\"D","page": 11},{"style_number": "60Z-603","name": "WILMETTE","type": "Right-Arm Sitting Sofa","dimensions": "37\"H X 73.5\"W X 36\"D","page": 11},{"style_number": "230-606","name": "NOAH","type": "Chair","dimensions": "36.5\"H X 35\"W X 36\"D","page": 12},{"style_number": "240-606","name": "NOAH","type": "Ottoman","dimensions": "17.5\"H X 30\"W X 23\"D","page": 12},{"style_number": "610-606","name": "NOAH","type": "Sofa","dimensions": "36.5\"H X 83\"W X 36\"D","page": 12},{"style_number": "630-606","name": "NOAH","type": "Loveseat","dimensions": "36.5\"H X 60.5\"W X 36\"D","page": 12},{"style_number": "510-613","name": "OLSON","type": "Queen Sleep Sofa","dimensions": "37\"H X 83.5\"W X 39.5\"D","page": 13},{"style_number": "520-613","name": "OLSON","type": "Full Sleep Sofa","dimensions": "37\"H X 75.5\"W X 39.5\"D","page": 13},{"style_number": "555-613","name": "OLSON","type": "Twin Sleep Chair","dimensions": "37\"H X 56\"W X 39.5\"D","page": 13},{"style_number": "610-613","name": "OLSON","type": "Sofa","dimensions": "37\"H X 83.5\"W X 39.5\"D","page": 13},{"style_number": "620-613","name": "OLSON","type": "Apartment-Size Sofa","dimensions": "37\"H X 75.5\"W X 39.5\"D","page": 13},{"style_number": "655-613","name": "OLSON","type": "Chair & a Half","dimensions": "37\"H X 56\"W X 39.5\"D","page": 13},{"style_number": "510-620","name": "PIPER","type": "Queen Sleep Sofa","dimensions": "37.5\"H X 82\"W X 37\"D","page": 14},{"style_number": "610-620","name": "PIPER","type": "Sofa","dimensions": "37.5\"H X 82\"W X 37\"D","page": 14},{"style_number": "630-620","name": "PIPER","type": "Loveseat","dimensions": "37.5\"H X 59.5\"W X 37\"D","page": 14},{"style_number": "51S-620","name": "PIPER","type": "Queen Sleep Sofa w/ Chaise","dimensions": "37.5\"H X 82\"W X 61\"D","page": 14},{"style_number": "61S-620","name": "PIPER","type": "Sofa w/ Chaise","dimensions": "37.5\"H X 82\"W X 61\"D","page": 14},{"style_number": "240-632","name": "TAHOE","type": "Storage Ottoman","dimensions": "21.5\"H X 38.5\"W X 38.5\"D","page": 15},{"style_number": "60M-632","name": "TAHOE","type": "Armless Chair","dimensions": "37\"H X 37\"W X 38.5\"D","page": 15},{"style_number": "6MM-632","name": "TAHOE","type": "Armless Loveseat","dimensions": "37\"H X 74.5\"W X 38.5\"D","page": 15},{"style_number": "6CC-632","name": "TAHOE","type": "90 Degree Corner Unit (Wall Space Required: 79\")","dimensions": "37\"H X 39.5\"W X 39.5\"D","page": 15},{"style_number": "6AL-632","name": "TAHOE","type": "Left-Arm Sitting Storage Arm","dimensions": "25.5\"H X 10\"W X 38.5\"D","page": 15},{"style_number": "6AR-632","name": "TAHOE","type": "Right-Arm Sitting Storage Arm","dimensions": "25.5\"H X 10\"W X 38.5\"D","page": 15},{"style_number": "6SC-632","name": "TAHOE","type": "Storage Console","dimensions": "25.5\"H X 10\"W X 38.5\"D","page": 15},{"style_number": "60A-632","name": "TAHOE","type": "Left-Arm Sitting Chair","dimensions": "37\"H X 37\"W X 38.5\"D","page": 15},{"style_number": "60B-632","name": "TAHOE","type": "Right-Arm Sitting Chair","dimensions": "37\"H X 37\"W X 38.5\"D","page": 15},{"style_number": "510-636","name": "SHILOH","type": "Queen Sleep Sofa","dimensions": "37\"H X 80.5\"W X 39.5\"D","page": 16},{"style_number": "520-636","name": "SHILOH","type": "Full Sleep Sofa","dimensions": "37\"H X 72.5\"W X 39.5\"D","page": 16},{"style_number": "555-636","name": "SHILOH","type": "Twin Sleep Sofa","dimensions": "37\"H X 52\"W X 39.5\"D","page": 16},{"style_number": "610-636","name": "SHILOH","type": "Sofa","dimensions": "37\"H X 80.5\"W X 39.5\"D","page": 16},{"style_number": "620-636","name": "SHILOH","type": "Apartment - Size Sofa","dimensions": "37\"H X 72.5\"W X 39.5\"D","page": 16},{"style_number": "655-636","name": "SHILOH","type": "Chair & a Half","dimensions": "37\"H X 52\"W X 39.5\"D","page": 16},{"style_number": "240-663","name": "PAXTON","type": "Ottoman","dimensions": "18.5\"H X 40.5\"W X 26\"D","page": 17},{"style_number": "610-663","name": "PAXTON","type": "Sofa","dimensions": "38\"H X 88\"W X 42\"D","page": 17},{"style_number": "630-663","name": "PAXTON","type": "Loveseat","dimensions": "38\"H X 64\"W X 42\"D","page": 17},{"style_number": "655-663","name": "PAXTON","type": "Chair & a Half","dimensions": "38\"H X 52\"W X 42\"D","page": 17},{"style_number": "60A-663","name": "PAXTON","type": "Left-Arm Sitting Chair","dimensions": "38\"H X 45\"W X 42\"D","page": 18},{"style_number": "60B-663","name": "PAXTON","type": "Right-Arm Sitting Chair","dimensions": "38\"H X 45\"W X 42\"D","page": 18},{"style_number": "60L-663","name": "PAXTON","type": "Left-Arm Sitting Chaise","dimensions": "38\"H X 45\"W X 66.5\"D","page": 18},{"style_number": "60M-663","name": "PAXTON","type": "Armless Chair","dimensions": "38\"H X 40\"W X 42\"D","page": 18},{"style_number": "60R-663","name": "PAXTON","type": "Right-Arm Sitting Chaise","dimensions": "38\"H X 45\"W X 66.5\"D","page": 18},{"style_number": "6CC-663","name": "PAXTON","type": "90 Degree Corner Unit (Wall Space Required: 84\")","dimensions": "38\"H X 68\"W X 42\"D","page": 18},{"style_number": "60A-665","name": "ALANI","type": "Left-Arm Sitting Chair","dimensions": "38\"H X 46\"W X 42\"D","page": 19},{"style_number": "60B-665","name": "ALANI","type": "Right-Arm Sitting Chair","dimensions": "38\"H X 46\"W X 42\"D","page": 19},{"style_number": "60L-665","name": "ALANI","type": "Left-Arm Sitting Chaise","dimensions": "38\"H X 46\"W X 64\"D","page": 19},{"style_number": "60M-665","name": "ALANI","type": "Armless Chair","dimensions": "38\"H X 40.5\"W X 42\"D","page": 19},{"style_number": "60R-665","name": "ALANI","type": "Right-Arm Sitting Chaise","dimensions": "38\"H X 46\"W X 64\"D","page": 19},{"style_number": "6CC-665","name": "ALANI","type": "90 Degree Corner Unit (Wall Space Required: 84\")","dimensions": "38\"H X 68\"W X 42\"D","page": 19},{"style_number": "510-681","name": "BEXLEY","type": "Queen Sleep Sofa","dimensions": "38\"H X 82\"W X 38.5\"D","page": 20},{"style_number": "610-681","name": "BEXLEY","type": "Sofa","dimensions": "38\"H X 82\"W X 38.5\"D","page": 20},{"style_number": "630-681","name": "BEXLEY","type": "Loveseat","dimensions": "38\"H X 59.5\"W X 38.5\"D","page": 20},{"style_number": "230-694","name": "MEYER","type": "Chair","dimensions": "38\"H X 38\"W X 40\"D","page": 21},{"style_number": "240-694","name": "MEYER","type": "Ottoman","dimensions": "18\"H X 30\"W X 23\"D","page": 21},{"style_number": "610-694","name": "MEYER","type": "Sofa","dimensions": "38\"H X 86\"W X 40\"D","page": 21},{"style_number": "630-694","name": "MEYER","type": "Loveseat","dimensions": "38\"H X 62\"W X 40\"D","page": 21},{"style_number": "60C-694","name": "MEYER","type": "Rounded Corner Unit (Wall Space Required: 98\")","dimensions": "37.5\"H X 66\"W X 55\"D","page": 22},{"style_number": "6SC-694","name": "MEYER","type": "Storage Console","dimensions": "25.5\"H X 10\"W X 38.5\"D","page": 22},{"style_number": "60D-694","name": "MEYER","type": "Left-Arm Sitting Loveseat","dimensions": "37.5\"H X 57\"W X 40\"D","page": 22},{"style_number": "60E-694","name": "MEYER","type": "Right-Arm Sitting Loveseat","dimensions": "37.5\"H X 57\"W X 40\"D","page": 22},{"style_number": "60L-694","name": "MEYER","type": "Left-Arm Sitting Chaise","dimensions": "37.5\"H X 32\"W X 64.5\"D","page": 22},{"style_number": "60M-694","name": "MEYER","type": "Sectional Armless Chair","dimensions": "37.5\"H X 24\"W X 40\"D","page": 22},{"style_number": "60R-694","name": "MEYER","type": "Right-Arm Sitting Chaise","dimensions": "37.5\"H X 32\"W X 64.5\"D","page": 22},{"style_number": "6CC-694","name": "MEYER","type": "90 Degree Corner Unit (Wall Space Required: 78\")","dimensions": "37.5\"H X 53\"W X 40\"D","page": 22},{"style_number": "6SL-694","name": "MEYER","type": "Left-Arm Sitting Chaise w/ Storage","dimensions": "37.5\"H X 38\"W X 64\"D","page": 22},{"style_number": "6SR-694","name": "MEYER","type": "Right-Arm Sitting Chaise w/ Storage","dimensions": "37.5\"H X 38\"W X 64\"D","page": 22},{"style_number": "60A-694","name": "MEYER","type": "Left-Arm Sitting Chair","dimensions": "37.5\"H X 31\"W X 39\"D","page": 22},{"style_number": "60B-694","name": "MEYER","type": "Right-Arm Sitting Chair","dimensions": "37.5\"H X 31\"W X 39\"D","page": 22},{"style_number": "6MM-694","name": "MEYER","type": "Armless Loveseat","dimensions": "37.5\"H X 63\"W X 39\"D","page": 22},{"style_number": "P91-893","name": "COLBY","type": "duo Reclining Sofa","dimensions": "41\"H X 83\"W X 39.5\"D","page": 26},{"style_number": "P93-893","name": "COLBY","type": "duo Reclining Loveseat","dimensions": "41\"H X 61\"W X 39.5\"D","page": 26},{"style_number": "P94-893","name": "COLBY","type": "duo Reclining Chair","dimensions": "41\"H X 39\"W X 39.5\"D","page": 26},{"style_number": "90M-897","name": "EDIE","type": "duo Armless Chair","dimensions": "39\"H X 36.5\"W X 42\"D","page": 27},{"style_number": "9CC-897","name": "EDIE","type": "duo Corner (Wall Space Required: 83\")","dimensions": "39\"H X 58\"W X 42\"D","page": 27},{"style_number": "P9D-897","name": "EDIE","type": "duo Left-Arm Sitting Reclining Loveseat","dimensions": "39\"H X 76.5\"W X 42\"D","page": 27},{"style_number": "P9E-897","name": "EDIE","type": "duo Right-Arm Sitting Reclining Loveseat","dimensions": "39\"H X 76.5\"W X 42\"D","page": 27},{"style_number": "P91-899","name": "BENNETT","type": "duo Reclining Sofa","dimensions": "39.5\"H X 82.5\"W X 39\"D","page": 28},{"style_number": "P93-899","name": "BENNETT","type": "duo Reclining Loveseat","dimensions": "39.5\"H X 60\"W X 39\"D","page": 28},{"style_number": "P94-899","name": "BENNETT","type": "duo Reclining Chair","dimensions": "39.5\"H X 37.5\"W X 39\"D","page": 28}]
```