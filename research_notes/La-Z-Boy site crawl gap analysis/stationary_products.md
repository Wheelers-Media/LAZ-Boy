# La-Z-Boy US site (la-z-boy.com): stationary / non-recliner furniture vs the LAZ-Boy app

Crawl date: 2026-11-08 (Veterans Day 35% sale banner live). Tool: Firecrawl `firecrawl_scrape` (worked on all pages; category pages return 36 items per "Load More" page, so lists below are first-page only unless noted). Site is the US site (prices USD, store-locator defaulted to Virginia Beach / Rockville). Everything below is US-only unless the app already has the model from Canadian data. Prices are intentionally not carried into the app.

Scope limits (honest): I read category listing pages in full for the first 36 items each, plus one product detail page (Meyer Modular Sectional). I did NOT crawl per-product pages for sleeper mattress type/size, seat construction, arm/leg options, pillow options, or cover lists. Those fields are not on listing pages. `/content/Room-Planner-3D` returned only the page shell (no readable content: JS app). No style guides, measuring guides or sectional configuration guides were found in the sitemap (see Q3).

## 1. Which models, collections, modules and categories are NOT in the app?

### Takeaway
Core upholstery names are already in the app (style-index has ~107 names incl. Meyer, Collins, Piper, Paxton, Tahoe, Alani, Wilmette, Charlie, Kennedy, Olson, Shiloh, Bexley, Noah, Mackenzie, Allegra, Dora, Maeve, etc.). The app is missing: (a) a new/obscure stationary names (Elliot; Mercury recliner), (b) the whole non-upholstery furniture business on the US site (dining, bedroom, occasional tables, media/desks, lamps, mirrors, benches, office chairs) with zero hits, and (c) site-defined sectional configuration vocabulary and product variants (apartment-size sofa, sleep-sofa-with-chaise, chair-and-a-half, twin sleep chair, modular sofa, rounded corner, curved, double chaise, storage sectionals, console/headrest/lumbar/folding-table recliner sofa variants).

### Cited Findings

**Site structure (sitemap)**
- Top nav: Recliners (gliding, high leg, power lift, rocking, wall), Chairs (office, oversized, stationary, swivel), Sofas & Sectionals (reclining loveseats, reclining sofas & sectionals, Sleepers filter, stationary loveseats, stationary sofas & sectionals), Living Room (adds Ottomans, Tables & Storage), Dining Room (barstools, cabinets, chairs, tables), Bedroom (beds, chests, dressers, nightstands), Accessories (benches, lamps, mirrors), Sale, Design Services. No "outdoor", "kids", "pillows", or "rugs" category exists in the US sitemap. Pillows appear only inside product pages ("20-inch accent pillow"). Note the Accessories intro copy mentions "decorative pillows, throws" but the category contains only lamps, mirrors, benches (30 items) — [site-map](https://www.la-z-boy.com/site-map), [accessories](https://www.la-z-boy.com/b/accessories). Outdoor/kids: not found (unverified absent on other URLs).
- Tools/content pages in the sitemap footer: 3D Room Planner, addi+ions, Free Swatches, Recliner Quiz, Performance Fabric Patterns & Care, Financing, Product Manuals, Fabric & Leather Care, iClean cleaning and iClean warranty — [site-map](https://www.la-z-boy.com/site-map).

**Item counts per category (US, as listed)**: Stationary Sofas & Sectionals 62, Stationary Sofas 37, Stationary Sectionals 25, Stationary Loveseats 11, Reclining Sofas & Sectionals 110, Reclining Loveseats 118 (page includes 2 stray recliners), Reclining Sectionals 31, Chairs 43, Ottomans 21, Dining 99, Bedroom 74, Tables & Storage 498, Accessories 30 — category URLs in section D.

### (A) NEW to app — Table

Method: case-insensitive string search of style-index-2026.json, stationary-catalog-2026.json, designers-choice-catalog-2026.json, sales-reference-library-2026.json, catalog_data-v2.json, canada_lineup_research.json. A "0" means the string is absent from all six. App `_app_inventory.md` name list has 107 names.

| Item | Type / detail (US site) | Style no. | Dims (as listed) | Source |
|---|---|---|---|---|
| **Elliot** (sofa, loveseat, chair, ottoman) | Stationary; sofa 610-679, loveseat 630-679, chair 230-679, ottoman 240679 | 679 | Sofa n/a on page read; Loveseat 39D x 37.5H x 60.5W; Chair 39D x 37.5H x 38W; Ottoman 23.5D x 19H x 31W | [elliot-sofa](https://www.la-z-boy.com/p/sofas-sectionals/stationary-sofas-sectionals/stationary-sofas/elliot-sofa/R-610679), [loveseats](https://www.la-z-boy.com/b/sofas-sectionals/stationary-loveseats), [chairs](https://www.la-z-boy.com/b/living-room/chairs) — "elliot" absent from app (0 hits) |
| **Meyer Modular Sofa** (SS2694) | Modular sofa (single-piece modular config) | 694 | 39D x 38.5H x 78.5W | [stationary sofas](https://www.la-z-boy.com/b/sofas-sectionals/stationary-sofas-sectionals/stationary-sofas) — "SS2694"/"meyer modular" absent from app |
| **Alani Modular Sofa** (SS2665) | Modular sofa | 665 | 39.5D x 37H x 75.5W | same page |
| **Apartment-Size Sofa** series: Olson 620-613, Charlie 620-638, Shiloh 620-636, Kennedy 620-593 | Compact sofa (prefix 620). App has "apartment" strings (4-8 hits) so concept partly present; check it covers these four | 613/638/636/593 | not captured | same page |
| **Sleep sofa variants** (prefixes 510 Queen, 520 Full, 51S Queen w/ Chaise): Piper (510620, 51S620), Leah (510418, 520418), Mackenzie 510435, Charlie 510638/520638, Kennedy 510593/520593, Olson 510613/520613, Shiloh 510636/520636, Bexley 510681 | Queen/Full sleepers; Piper Queen Sleep Sofa w/ Chaise = 61D x 37.5H x 82W | see left | Piper 37D x 37.5H x 82W; Leah Queen 38.5D x 38H x 82W; Leah Full 73.5W; Mackenzie 87W; Charlie Queen 79W / Full 71W; Kennedy Full 69W; Shiloh Full 72.5W; Olson/Shiloh/Bexley Queen not captured | stationary sofas page. App has 15-26 "sleep sofa" strings; whether each combo above exists is unverified |
| **Piper Sofa w/ Chaise** (61S620) | Sofa with attached chaise | 620 | 61D x 37.5H x 82W | same page |
| **Twin Sleep Chair** series: Leah 555-418, Charlie 555-638, Shiloh 555-636, Olson 555-613 | Twin sleep chair | see left | Leah 54W, Charlie 50.5W, Shiloh 52.5W, Olson 56W | [chairs](https://www.la-z-boy.com/b/living-room/chairs) (app has 4-9 "twin sleep" hits; confirm coverage) |
| **Chair & a Half** series: Olson 655613, Paxton 655663, Charlie 655638, Shiloh 655636, Wilmette 655603 | Oversized chair | see left | Olson 56W; Paxton 52W; Charlie 50.5W; Shiloh 52.5W; Wilmette 39W (34H) | chairs page |
| **Sectional configurations — stationary**: Modular, L-Shape, Corner, Rounded Corner, U-Shape, U-Shape Chaise, Sectional (2-pc "H") for Meyer, Collins, Tahoe, Alani, Paxton, Charlie (Charlie Modular only listed, "New Style") and Wilmette Modular | See model-code table below | | Alani Sectional / Paxton Sectional / Paxton Corner list "38H x 132.5W" | [stationary sectionals](https://www.la-z-boy.com/b/sofas-sectionals/stationary-sofas-sectionals/stationary-sectionals) |
| **Reclining sectionals (non-power labelled)**: Trouper (Modular, Corner, L-Shape, Sectional, Sectional w/ Storage), Armitage (Modular, Corner, Corner w/ Storage, Double Chaise), Acadia (Modular, Corner, L-Shape, Sectional, Sectional w/ Storage), Palmer (Modular, U-Shape w/ Storage, Corner Chaise w/ Storage, Sectional), Ava (Modular, Corner, L-Shape, Sectional), Maddox (Modular, U-Shape w/ Storage, Corner Chaise w/ Storage, Sectional), James (Modular, Corner, L-Shape, Sectional, Sectional w/ Storage) | 31 reclining sectional pieces. Names Armitage/Acadia/Palmer/Ava/Maddox/James exist in app, but the piece/shape codes below (xxs8xx, RR/RL/RH/RG/RU/RN/RD/RC) are not in the app (0 hits for "RH2724") | | | [reclining sectionals](https://www.la-z-boy.com/b/sofas-sectionals/reclining-sofas-sectionals/reclining-sectionals) |
| **Recliner sofa/loveseat feature variants**: "Power Reclining w/ Headrest" (U-prefix), "w/ Headrest & Lumbar" (X-prefix), "w/ Folding Table" (Dutton 446828/U46828/X46828), "w/ Console" (449xxx), "Wall" (Pinnacle 330512/33U512/33X512; 320512; Finley 32U747, U39747) | Motion, but sold on the stationary browse page. Verify the app's motion-catalog covers prefixes X44, U44, X46/U46, X48/X49/U48/U49, 33X/33U, 32U, U39, 448/449 | | See Q2 (the PDF-vs-app prefix gap in pdf_vs_app.md overlaps) | [reclining sofas](https://www.la-z-boy.com/b/sofas-sectionals/reclining-sofas-sectionals), [reclining loveseats](https://www.la-z-boy.com/b/sofas-sectionals/reclining-loveseats) |
| **Colby duo® Reclining Sofa** (P91893) | "duo" reclining sofa, 39.5D x 41H x 83W. "colby duo" absent from app | P91 prefix | | reclining sofas page |
| **Storage Ottomans**: Oliver, Maeve, Leo, Cory Storage Ottoman | Storage ottomans: Maeve 22D x 18H x 28W; Oliver 39.5D x 18H x 39.5W; Leo 22.5D x 21.5H x 22.5W; Cory 26D x 20H x 45W | 245402, 245301, 02430A, 024205 | | [ottomans](https://www.la-z-boy.com/b/living-room/ottomans). App has "storage ottoman" in stationary-catalog (1) and catalog_data-v2 (3) but not as these US item numbers |
| **Ottoman list (21)**: Tahoe 240632, Collins 240494, Meyer 240694, Lauren 024677, Fleetwood 024678, Charlie 240638, Paxton 240663, Roundabout 024225, Ferndale 245408, Maeve Storage 245402, Allegra 245401, Dora 245400, Oliver Storage 245301, Noah 240606, Wilmette 240603, Kennedy 240593, Mackenzie 240435, Leo Storage 02430A, Cory Storage 024205, Scout 245304, **Elliot 240679** | Dims: Tahoe 38.5D x 21.5H x 38.5W; Collins 23.5x18.5x31.5; Meyer 23.5x18x30.5; Lauren/Fleetwood 22x19.5x29; Charlie/Paxton 26.5x19x41; Roundabout 35x18x35; Ferndale 22x18x25; Allegra 23x19x27.5; Dora 23.5x20x29; Noah 23x17.5x30; Wilmette 24x18x37.5; Kennedy 24x19x27; Mackenzie 24x19.5x32; Scout 22.5x18x22.5; Elliot 23.5x19x31 | | Only Elliot is a new name; the rest exist in app (check dimensions vs app) | ottomans page |
| **Chairs (36 of 43)** stationary: Allegra 235401, Collins 230494, Meyer 230694, Fleetwood 023678, Lauren 023677, Kennedy 230593, Noah 230606, Gemma 235406, Maeve 235402, Dora 235400, Mackenzie 230435, Elliot 230679; swivel: Opal 215456, Reegan High Leg Swivel 210460, Bellevue High Leg Swivel 210421, Allegra/Midtown/Roxie/Alma/Ferndale/Maeve/Dora Swivel Gliding 2254xx | Dims: e.g. Opal Swivel 52D x 34.5H x 51W; Reegan 35x36.5x30; Gemma 33.5x38.5x29.5; Midtown 36x40x32 | | | chairs page. Names mostly in app; item numbers/dims to be compared |
| **Office chairs (US online exclusives)**: Nova Executive Leather Office Chair (Black 52372-BLK, Cognac 52372-CBRN), Delano Big & Tall Executive Leather (45833B-LZB Jet Black w/ Distressed Wood; 45833-LZB Chestnut Brown w/ Mahogany Wood), Sutherland Quilted Leather Office Chair Jet Black 44813A-LZB, Hidden Treasures Leah Desk Chair H47.0HTM | Dims: Nova 30D x 48.5H x 29.25W; Delano 32.25D x 45H x 28W; Sutherland 29.5D x 40.5H x 23.5W; Leah Desk 24D x 32H x 19W | | "office chair" 0 in app. US "Online Exclusive" |
| **Dining** (99 items; first 36 read) | Tables, chairs, buffets/cabinets, barstools. Collections: Hidden Treasures (counter table w/ travertine or wood top, bar/pub stools), Cascade (Hyde arm/side chair, Dillon trestle table 40D x 30H x 66W, Murphy round table 54", Townsend buffet, Harrison display cabinet), Weatherford (Heather and Cornsilk finishes: Canterbury table, Milford round table, Tasman/Baylis/Kendal chairs, Edisto sideboard, Clifton china cabinet, Hastings buffet / open hutch), Elise (Capris rectangular table, Maris buffet, Leg table), Vista (Sterling buffet), Portolone (60" Stellia pedestal table), Studio Home adjustable stool, Domaine counter stool | | e.g. Dillon 40x30x66; Murphy 54x30x54; Canterbury 44x30x78; Milford 48x30x48 | [dining](https://www.la-z-boy.com/b/dining-room) — dining: 0 in app |
| **Bedroom** (74; first 36 read) | Beds (panel, shelter, spectrum, metal), nightstands, chests, dressers. Collections: Hidden Treasures (Adele 6-drawer dresser 19D x 34H x 66W, Adele 3-drawer nightstand, Beloved Bowfront chest, Roped-In 3-drawer chest), Cascade (Ross upholstered panel beds Queen/King/Cal King, Kline panel beds, Meghan & Allyson nightstands, Caitlin drawer chest), Vista (Shelter bed Cal King), Elise (King Spectrum bed, Bachelors chest, Nightstand, Aiden chest), Weatherford Heather/Cornsilk (Westland, Shelter, Catlins metal beds; nightstands; Baldwin bachelors chest; Hamilton chest; Devon lingerie chest), Litchfield Sundown accent chest (blue) | | Queen/King/Cal-King bed dims e.g. Cascade King Ross 88D x 60H x 81W | [bedroom](https://www.la-z-boy.com/b/bedroom) — bedroom: 0 in app |
| **Tables & Storage** (498; first 36 read) | Cocktail tables, end tables, desks, media consoles, bookcases. Lines: Structures (Round Coffee Table, Chairside, Round End, Desk, Corner Desk in Pure White / Sable), Hidden Treasures concrete tables, Nicolette (Auburn), Giselle, Whitaker, Chairsides Wedge, Modern Basics, Domaine desks, Reclamation Place desk, Studio Home desk, entertainment/media consoles (Portman, Modern Timber, Sunset Valley, Liza in Pure White / Sage Green / Azul Blue, Darby Two Tone, Providence, Jenkins, Jive, Cleo, Foster, Archetype in Cinnamon / Caramel) | | e.g. Structures Round Coffee 40D x 18H x 40W; Liza console 18D x 31H x 72W | [tables-storage](https://www.la-z-boy.com/b/living-room/tables-storage) — no tables in app |
| **Accessories (30)**: floor lamps (Braided, Harrington Pharmacy 48"H, Collette 81"H, Baron 71"H, Warren 63.5"H, Grey Trace 65"H), table lamps (Claire, Bianca, Augustine, Braided, Montreux, Powell, Veronica, Strapped Metal), mirrors (Cascade Madison, Elise Bristow, Weatherford Westland/Landscape, Plank Road Westwood/Jessup in S/C finishes), benches (Weatherford Belmont dining bench 58"W, Plank Road Rankin 18D x 19H x 58W, Kafe Upholstered Dining Bench Mocha/Latte 18D x 18.5H x 56W). Note lamp "Baron" collides with app model BARON (unrelated) | | | [accessories](https://www.la-z-boy.com/b/accessories) — lamp: 0 in app |

#### Stationary sectional model-code table (new to app: shape codes and module naming)
Site SKUs = 3-char prefix + 3-digit model code. Shape prefixes observed: `xxs` = Modular (generic configurable), `SS2` = modular sofa, `SH2`/`SH3` = 2-/3-piece Sectional, `SL3/SL4` = L-Shape, `SL6` = Corner (Collins) / `SN3` = Meyer Corner / `SC5`,`SC6` = Corner (Tahoe/Alani/Paxton), `SR3` = Rounded Corner (Collins), `SU6`,`SU5`,`SU4` = U-Shape / U-Shape Chaise. Source [stationary sectionals](https://www.la-z-boy.com/b/sofas-sectionals/stationary-sofas-sectionals/stationary-sectionals). Prefix meaning is inferred from names; not a site definition.

| Model (code) | Configs on site (SKU) |
|---|---|
| Meyer (694) | Modular xxs694, U-Shape SU6694, Corner SN3694, L-Shape SL4694, Sectional SH2694, Modular Sofa SS2694 |
| Collins (494) | Modular xxs494, Rounded Corner SR3494, Corner SL6494, L-Shape SL3494, Sectional SH2494 |
| Tahoe (632) | Modular xxs632, L-Shape SL4632, Corner SC5632 |
| Alani (665) | Modular xxs665, U-Shape SU6665, U-Shape Chaise SU5665, Corner SL6665, Sectional SH3665, Modular Sofa SS2665 |
| Paxton (663) | Modular xxs663, U-Shape Chaise SU4663, L-Shape SL4663, Sectional SH3663, Corner SC6663 |
| Charlie (638) | Modular xxs638 ("New Style" tag) |
| Wilmette (603) | Modular xxs603 |

"Design Your Own" selector on the Meyer Modular product page offers six pre-configs: Modular, L-Shape, Chaise, Curved, U-Shape, Corner — [Meyer Modular Sectional](https://www.la-z-boy.com/p/sofas-sectionals/stationary-sofas-sectionals/stationary-sectionals/meyer-modular-sectional/R-xxs694). Also has "Customize in 3D" and "Reset" controls.

#### Meyer Modular Sectional detail page (only PDP read)
- At a glance: casual sectional; pieces configure to any room size/shape; patented ComfortCore cushions; deep, wide seats. Features: space-saving track arms, decorative wood legs, welt trim, choice of fabrics and finishes, matching ottoman separate. Style Number "694". Modules with arms include one 20-inch accent pillow; corner modules include two 20-inch pillows. Tearpad PDF: `https://content.la-z-boy.com/productassets/productconfigurations/tearpads/tearpad-meyer.pdf`. Availability schema "MadeToOrder"; base price 5,315 USD — [PDP](https://www.la-z-boy.com/p/sofas-sectionals/stationary-sofas-sectionals/stationary-sectionals/meyer-modular-sectional/R-xxs694).
- Tearpad naming pattern is `tearpad-<model>.pdf`; app already has tear-pad profiles for 16 models (inventory). Candidate to automatically cross-check other model PDFs (not tested).

#### Full reclining sofa/loveseat model list (non-stationary but shown in Sofas & Sectionals)
Reclining sofas (36 of 110 read): Brooks 444727, Cade 444803, Trouper 444724, Apollo 444757, Dutton 444828 (+ Folding Table 446828), Dorian 444755, Jay 444706, Emmons 444781, Morrison 444766, Pinnacle Wall 330512, Colby duo P91893, Trouper Reclining Modular Sofa RS2724; power versions with Headrest (U44xxx) or Headrest & Lumbar (X44xxx), Dutton also X46828/U46828 with Folding Table, Pinnacle Power Wall 33X512/33U512. Reclining loveseats (36 of 118 read) add Finley (U39747, 32U747 power wall), Greyson X49530, James 449521/X49521, Emmons 449781, Morrison 448766/449766/U49766. Dims for sofas: Brooks 40D x 41H x 84W; Cade 39x42x83; Trouper 42x41.5x85; Apollo 40x42x85.5; Dutton 41x42.5x87; Dorian 39.5x44x86; Jay 39x43x86.5; Pinnacle Wall 38x42x81.5; Emmons 40.5x43x83.5; Morrison 39.5x42x86; Colby duo 39.5x41x83. Names Brooks, Cade, Trouper, Apollo, Dutton, Dorian, Jay, Emmons, Morrison, Pinnacle, Colby, Finley, Greyson, James are all in the app list. The gap is SKU prefixes/variants (see pdf_vs_app.md: 80 PDF prefixes absent from motion-catalog).

### Stationary listings captured (name, SKU, dims). Table B below indicates the in-app status.

Stationary sofas (36 of 37 read): Collins 610494 (39D x 37.5H x 89W), Piper 610620 (37x37.5x82), Meyer 610694 (39x37.5x86), Fleetwood 061678 (38x37x81), Lauren 061677 (39x38.5x78.5), Olson 610613 (39.5x37x83.5), Noah 610606 (36x36.5x83), Mackenzie 610435 (38x36.5x87), Charlie 610638 (38x37x79), Paxton 610663 (42x38x88), Kennedy 610593 (38x39x77), Bexley 610681, Shiloh 610636, Wilmette 610603, Elliot 610679, plus sleep/apartment/chaise/modular variants above.
Stationary loveseats (11, all read): Piper 630620 (37D x 37.5H x 59.5W), Collins 630494 (39x37.5x65), Meyer 630694 (39x37.5x62), Fleetwood 063678 (38x37x58.5), Lauren 063677 (39x38.5x56), Bexley 630681 (38.5x38x59.5), Paxton 630663 (42x38x64), Noah 630606 (36x36.5x60.5), Kennedy 630593 (38x39x54.5), Mackenzie 630435 (38x36.5x64), Elliot 630679 (39x37.5x60.5) — [loveseats](https://www.la-z-boy.com/b/sofas-sectionals/stationary-loveseats).

### Inferences
- Because the app has no hits for dining, bedroom, console, desk, lamp, mirror, or office chair strings, the Room Builder/Sectional Designer likely models only seating and ottomans. A "complementary pieces" shelf (tables, lamps, benches, mirrors) is a real catalogue gap, but many US dining/bedroom lines (Hidden Treasures, Cascade, Weatherford, Elise, Vista) are probably not sold in La-Z-Boy Canada. Treat as US-only until the Canadian lineup confirms.
- Elliot is the only stationary upholstery name clearly missing from the app's 107-name list; everything else is a variant/config gap.

### Gaps
- Only first 36 of 62 (Stationary Sofas & Sectionals), 110 (Reclining Sofas & Sectionals), 118 (Reclining Loveseats), 43 (Chairs), 99 (Dining), 74 (Bedroom), 498 (Tables) were fetched; "Load More" pagination not followed. Not crawled: Recliner categories (out of scope), Sale page, per-product detail pages beyond Meyer Modular.
- Sleeper mattress type/size, seat/back construction, arm/leg options, cover lists, finishes and pillow options per model are only on PDPs (not crawled). Outdoor and kids categories do not exist on the sitemap; pillows exist only as PDP text.

## 2. What conflicts exist with app data?

### Takeaway
No direct data conflict was verifiable without per-model app lookups (I did not diff dimensions). However the site's own data is inconsistent, which matters if the app imports it: placeholder dimensions are reused across records, and category placement is inconsistent.

### Cited Findings
- Seven-plus Meyer/Collins sectional listings show an identical placeholder "38.5"D x 38"H x 73.5"W" (Meyer Modular, Collins Modular, Meyer U-Shape, Collins Rounded Corner, Meyer Corner, Collins Corner, Meyer L-Shape, Meyer Sectional, Collins Sectional, Collins L-Shape), also equal to Leah Full Sleep Sofa 38.5D x 38H x 73.5W. Same reuse: Meyer Modular Sofa 39 x 38.5 x 78.5 is identical to Lauren Sofa. Treat sectional dims as untrustworthy — [stationary sofas & sectionals](https://www.la-z-boy.com/b/sofas-sectionals/stationary-sofas-sectionals); only Alani/Paxton sectional rows show "38H x 132.5W".
- Reclining sectional rows (Trouper family) all carry "39D x 43H x 86.6W", i.e. the single-sofa size copied across sectionals — [reclining sofas & sectionals](https://www.la-z-boy.com/b/sofas-sectionals/reclining-sofas-sectionals).
- Chair categorisation inconsistent: Charlie Chair & A Half and Olson Twin Sleep Chair are under Stationary Chairs; Shiloh Twin Sleep Chair and Shiloh/Paxton/Wilmette/Olson Chair & a Half are under Oversized Chairs. Charlie sleep/sofas link directly under /stationary-sofas-sectionals/ without the /stationary-sofas/ segment — [chairs](https://www.la-z-boy.com/b/living-room/chairs), [stationary sofas](https://www.la-z-boy.com/b/sofas-sectionals/stationary-sofas-sectionals).
- Site data typo: Dutton loveseat URL slug "power-reclinling-loveseat" (R-U49828) — [reclining loveseats](https://www.la-z-boy.com/b/sofas-sectionals/reclining-loveseats).
- The 3-digit model code on the site (Meyer 694, style number field "694") matches the app's convention of prefix + model (e.g. app styleNumber "44P726"); and the PDF prefix gap noted in pdf_vs_app.md applies to site SKUs too, e.g. site X44/U44/X46/U46/33X/33U/32U/U39/RS2/RR/RL/RH/RG/RU/RN/RD/RC prefixes — [PDP](https://www.la-z-boy.com/p/sofas-sectionals/stationary-sofas-sectionals/stationary-sectionals/meyer-modular-sectional/R-xxs694), pdf_vs_app.md.
- Colour/cover availability counts differ by model (e.g. Paxton "+599 More", Meyer "+662 More", Lauren "+514 More") i.e. US site shows 520-670 cover options per model; app uses Canadian A26 program (not diffed here).
- US pricing is on listing pages (Meyer Modular from 5,015 USD; Meyer Loveseat 1,489 sale vs 2,279 original) and must not be shown in a Canadian app.

### Inferences
- Nothing seen contradicts the app's model names. Divergence risk is in: dimension sources (site placeholders vs tear-pad/PDF), shape/prefix codes, and the US-only cover range.

### Gaps
- Did not programmatically diff site dims vs style-index dims; unverified for any individual model.

## 3. What design/room-planning content is present?

### Takeaway
The US site's design/room-planning offering is thin in crawlable content: a "Design Your Own" sectional selector (6 pre-configs), "Customize in 3D", a 3D Room Planner page (JS shell only), Free Design Services (in-store consultation), free swatches, a recliner quiz, and product tearpad PDFs. No static style guide, measuring guide, or sectional configuration guide pages appear in the sitemap.

### Cited Findings
- Sitemap lists "3D Room Planner" `/content/Room-Planner-3D`, "addi+ions" `/content/additions`, "Free Swatches" `/content/free-swatches`, "Recliner Quiz" `/forms/recliner-quiz`, "Performance Fabric Patterns & Care", "Fabric & Leather Care", "iClean Recommended Cleaning Methods" — [site-map](https://www.la-z-boy.com/site-map).
- Scrape of `/content/Room-Planner-3D` returned only header/footer with title "3D Room Planner | La-Z-Boy" (planner itself is client-side; content not extractable) — [Room-Planner-3D](https://www.la-z-boy.com/content/Room-Planner-3D).
- Design Services banner on every page: "Your local store offers FREE Design Services... start with a consultation" — [design-services](https://www.la-z-boy.com/design-services).
- Sectional PDP offers Design Your Own: Modular, L-Shape, Chaise, Curved, U-Shape, Corner (images `sectional-pre-configs/*.png`), Customize in 3D, Reset — Meyer PDP above.
- Per-model tearpad PDFs: `https://content.la-z-boy.com/productassets/productconfigurations/tearpads/tearpad-meyer.pdf`.

### Inferences
- "Curved" and "Chaise" pre-configs are shape names to check against the app's Sectional Designer (the app has a SectionalDesignStudio.jsx; I did not audit its shape list).

### Gaps
- Not crawled: /content/additions, /content/free-swatches, /forms/recliner-quiz, /design-services, performance-fabric page, /content/CustomerCare/productmanuals (product manuals could contain per-model measuring/set-up diagrams).

## Part (E): App feature ideas
1. Add Elliot (679) sofa/loveseat/chair/ottoman to style-index (Canadian availability unverified).
2. "Complete the room" shelf: lamps, benches, mirrors, occasional tables, media consoles, desks, dining, bedroom (flag US-only unless in Canadian lineup).
3. Sectional designer: add site shape vocabulary (Modular, L-Shape, Chaise, Curved, U-Shape, Corner, Rounded Corner, U-Shape Chaise, Storage, Double Chaise, Corner Chaise w/ Storage) and "modules with arms include 1 x 20" pillow, corners 2 x 20" pillow" rule (Meyer PDP) into the pillow page.
4. Variant selectors: recliner sofas with Headrest / Headrest & Lumbar / Folding Table / Console / Wall labels, driven by prefix (U/X/33/32).
5. Show twin/full/queen sleeper and apartment-size sofa alternates side-by-side per model (Olson, Charlie, Shiloh, Kennedy).
6. Per-model tearpad PDF links (pattern `tearpad-<model>.pdf`; test remaining models).
7. Do not copy site dimensions for sectional configs (placeholder reuse).

## (D) URLs crawled (all HTTP 200 via Firecrawl unless noted)
- https://www.la-z-boy.com/site-map
- https://www.la-z-boy.com/b/sofas-sectionals/stationary-sofas-sectionals (first 36 of 62)
- https://www.la-z-boy.com/b/sofas-sectionals/stationary-sofas-sectionals/stationary-sofas (36 of 37)
- https://www.la-z-boy.com/b/sofas-sectionals/stationary-sofas-sectionals/stationary-sectionals (25 of 25)
- https://www.la-z-boy.com/b/sofas-sectionals/stationary-loveseats (11 of 11)
- https://www.la-z-boy.com/b/sofas-sectionals/reclining-sofas-sectionals (36 of 110)
- https://www.la-z-boy.com/b/sofas-sectionals/reclining-loveseats (36 of 118)
- https://www.la-z-boy.com/b/sofas-sectionals/reclining-sofas-sectionals/reclining-sectionals (31)
- https://www.la-z-boy.com/b/living-room/chairs (36 of 43)
- https://www.la-z-boy.com/b/living-room/ottomans (21 of 21)
- https://www.la-z-boy.com/b/living-room/tables-storage (36 of 498)
- https://www.la-z-boy.com/b/dining-room (36 of 99)
- https://www.la-z-boy.com/b/bedroom (36 of 74)
- https://www.la-z-boy.com/b/accessories (30 of 30)
- https://www.la-z-boy.com/content/Room-Planner-3D (shell only)
- https://www.la-z-boy.com/p/sofas-sectionals/stationary-sofas-sectionals/stationary-sectionals/meyer-modular-sectional/R-xxs694 (PDP)

Tool failures: several category scrapes exceeded the tool's output limit and were saved to disk (parsed with Python instead) — no scrape failed outright. Mid-session MCP servers (car-image, design, marketing, sales plugins) failed to connect (proxy 403); unrelated. WebFetch not used.

## (C) Conflicts - short list
See section 2. Highlights: placeholder sectional dims, inconsistent chair categories, US-only prices/covers, SKU prefixes absent from app.

## (B) Already in app (name-level match, style-index names list in _app_inventory.md)
ACADIA, ALANI, ALLEGRA, ALMA, APOLLO, ARMITAGE, AVA, BELLEVUE, BEXLEY, BROOKS, CADE, CHARLIE, COLBY, COLLINS, CORY, DORA, DORIAN, DUTTON, EMMONS, FERNDALE, FINLEY, FLEETWOOD, GEMMA, GREYSON, JAMES, JAY, KENNEDY, LAUREN, LEAH, LEO, MACKENZIE, MADDOX, MAEVE, MEYER, MIDTOWN, MORRISON, NOAH, OLIVER, OLSON, OPAL, PALMER, PAXTON, PINNACLE, PIPER, REEGAN, ROUNDABOUT, ROXIE, SCOUT, SHILOH, TAHOE, TROUPER, WILMETTE (ALMA/ALMA etc. per inventory). Note ELLIOT and MERCURY are absent; Mercury is a rocking recliner (out of scope, 010795, top US best seller).
