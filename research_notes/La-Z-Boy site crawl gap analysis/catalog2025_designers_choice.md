# La-Z-Boy Designer's Choice Collection, Summer/Fall 2025: extraction and app gap analysis

Source: https://view.publitas.com/la-z-boy/designers-choice-collection-catalog-summer-fall-2025/page/1 (footer: "(c) 2025 La-Z-Boy Incorporated - 07/2025 - CA0314").
Compared against the app's 2026 edition (`designers-choice-catalog-2026.json`, footer "04/2026 - 000119-A-1"), `style-index-2026.json`, `glossary-2026.json`, `sales-reference-library-2026.json`, `stationary-catalog-2026.json`, and `_pdf_codes.json`.

## How it was read (and limits)
- The Publitas viewer pages (`/page/N`) return only the logo image to the scraper (no text layer, `robots: noindex`, page images only). The page HTML exposes the flipbook's PDF download link, and that PDF (44 PDF pages) was parsed with Firecrawl's PDF parser, giving the full text layer. All 44 PDF pages were read; no page was unreadable at the text level.
- Printed page numbers below are the catalog's own (1-33). The PDF text has no page markers; PDF-page positions are inferred from section order (front matter = 10 PDF pages, then printed pages 1-29 = PDF 11-39, options spread 30-31 = PDF 40-41, printed 32-33 = PDF 42-43, back cover = PDF 44). The printed index jumps from 29 to 32 because 30-31 are the second Options and Finish Options pages.
- Text-layer weaknesses: Charlotte 028-931 (p29) options cell is empty and its page has stray words ("duo", "SOPHISTICATED STYLE", "RECLINING POWER"); some page titles (e.g. Cory, Dora) only appear via the Style Name Index/TOC. Photos, swatch colours and callout art are images and were not read. Nothing below is inferred beyond the text layer; inferences are labelled.
- No per-style prices, weights, seat dimensions, or fully-extended dimensions appear in this catalog; only H x W x D.

## Headline findings
- 45 style records on 31 model pages (31 models) in 2025. 42 of 45 style numbers exist in the app (the 3 missing are Mercer 295-404, 29U-404 and Marietta 235-498); every dimension triple present in the app matches the 2025 catalog exactly (0 dimension conflicts).
- **2025-only (not in app): MERCER 404 (295-404, 29U-404, p8) and MARIETTA 498 (235-498, p26).** Neither name appears in any of the five JSONs. FLETCHER 424 (p13) is in the app only as `295424` status `discontinued`, and is absent from the app's 2026 Designer's Choice catalog.
- **2026-only (new vs 2025):** SCOUT 304, GEMMA 406, RAE 416 (not in 2025). The 2025 "NEW" model is AUDREY 457; the 2026 edition no longer flags it new.
- **Option codes were renamed between editions:** 2025 `TF`, `Z5`, `ZB`, `C1`, `F1`, `Extra Fabric` are not in the 2026 option list; 2026 uses `FS`, `Z6`, `DC`, `FN`. See section C.
- 2025 front matter also carries cross-references: "NEW BELMONT in LB192976 (see Recliner Collection catalog)" and "NEW SHILOH in D207432 (see Stationary Collection catalog)". Both names exist in the app.
- Only 5 style numbers from this catalog appear in `_pdf_codes.json` "Available Products" (section B2).

---
## (A) NEW to the app (in 2025, absent or changed in 2026)

### A1. Styles/models present in 2025 but absent from the 2026 app

| Model | Style no. | Type | Dimensions (H x W x D) | Options (2025) | Finish std / optional | Cover caps (2025) | Page | Status in app |
|---|---|---|---|---|---|---|---|---|
| MERCER 404 | 295-404 | High Leg Reclining Chair | 43 x 32 x 38.5 | TF | 007 / 021, 041, 071 | FABRIC DR, UR, UE, BU; RL | 8 | Absent (no 295404 in style-index; name not in any JSON) |
| MERCER 404 | 29U-404 | High Leg Power Recliner w/ Headrest | 43 x 32 x 38.5 | LW, TF | 007 / 021, 041, 071 | same | 8 | Absent |
| MARIETTA 498 | 235-498 | Chair | 39 x 30 x 36.5 | Z5 | 007 / 021, 041, 071 | FABRIC DR, UR, UE, BU; RL; LL, LM | 26 | Absent (no 235498; name not in any JSON) |
| FLETCHER 424 | 295-424 | High Leg Reclining Chair | 40 x 35.5 x 36.5 | TF | 007 / 021 | DR, UR, DP, NP, PS, UE, VS, BU; RL; LL | 13 | In style-index as `295424` status `discontinued`; not in the 2026 Designer's Choice models (changed/discontinued) |


Interpretation: Mercer, Marietta and Fletcher are not in the 2026 Designer's Choice index; the app marks only Fletcher as discontinued. Whether Mercer and Marietta are discontinued is not stated in any source read; they are simply absent from 2026 (changed/discontinued, unconfirmed).

### A2. Option codes and option text present in 2025, absent from the app's 2026 Designer's Choice option list

| 2025 code | 2025 wording (p9-10 / p30-31) | Where used (2025) | In 2026 app? |
|---|---|---|---|
| TF | TEMPUR-RESPONSE TF MEMORY FOAM CUSHIONING: upgrades standard seat(s), chaise(s), and legrest(s) to TEMPUR-Response memory foam; sensitive to temperature, may feel firmer in rooms 65 F or colder; electric blankets not recommended (p9) | 295/29U/028/265 recliners (Mercer, Dante, Ferndale 265, Eldorado, Fletcher, Brentwood, Scarlett, Riley, Haven, Audrey, Rheeves, Carleton, Kimberly) | No `TF`. 2026 uses `FS` on the same styles (glossary: FS = La-Z-Boy Contour Cushion). Equivalence is not stated by either source. |
| Z5 | COMFORTCORE PLUS TEMPUR-RESPONSE Z5 MEMORY FOAM CUSHIONING: upgrades standard ComfortCore seat cushions to ComfortCore plus TEMPUR-Response Memory Foam seat cushions (p9, p30) | Swivel/chair/glider styles 225/235/210/215 plus duo P94 893 & 899 | No `Z5`. 2026 uses `Z6` (ComfortCore Plus with Contour Cushion) and adds `DC` (ComfortDown). P94 Colby/Bennett lose Z5 and show only FN, LT. |
| ZB | COMFORTCORE PLUS TEMPUR-RESPONSE MEMORY FOAM SEAT AND BACK CUSHIONING (ZB): upgrades standard ComfortCore seat cushions and backs (p9, p30) | Defined in the options pages; not printed in any 2025 style table | No |
| C1 | CORD: cord accent can be added to primary or secondary pillows on most styles (p9, p30) | Opal 215-456 (C1, F1, FP, P1, Z5) | Defined in glossary (name only); Opal 2026 options = DC, FP, P1, Z6 (C1 and F1 dropped on Opal) |
| F1 | FRINGE: fringe accent on primary or secondary pillows on most styles (p9, p30) | Opal 215-456 | Same as C1 |
| EXTRA FABRIC | Additional yards of fabric or complete leather hides for decorative detailing or repair stock (p9) | Order-level option | Not found in the five JSONs |
| 088 BP2 | Heading `088 BP1 088 BP2` BATTERY PACK (p9): rechargeable lithium-ion battery pack to power Designer's Choice and duo styles for cordless operation | 29U/P94 styles | `088 BP1` is in the 2026 options; BP2 appears only in style-index accessory records |
| 088 1YC | BATTERY PACK: rechargeable lithium-ion pack for cordless operation; includes 2 battery packs and 1 battery shelf. Note: not available on lift chairs (p30) | Order-level option | In glossary and style-index, not in the 2026 Designer's Choice option list |
| LT | LEFT HAND POWER ACTIVATOR: changes location of 2-button mounted controller with USB for operating the power recliner from right-side to left-side sitting (p30) | Colby P94-893 (LT, Z5) | LT is used on Colby/Bennett in 2026 and defined in glossary; not in the 2026 DC option list |
| LW / RW | LEFT WIRELESS REMOTE: left-side sitting mounted cradle and wireless remote in place of standard right-side remote on 29U styles; RIGHT WIRELESS REMOTE: control panel with mounted cradle and wireless remote on right-side sitting, standard on 29U styles (p9) | 29U styles | Yes (both in 2026 options) |
| Finish 142 Mesa footnote | `*only available on 295-423` (p10) | Eldorado | Yes (2026: same) |


### A3. Fabric/cover programs shown on 2025 pages and absent in the app's Designer's Choice JSON
- **D2030 Howell** (La-Z-Boy SELECT covers on Bennett p33): D203032 Sand, D203034 Granite, D203053 Ash. `D2030`/`Howell` is not in `designers-choice-catalog-2026.json`, `style-index-2026.json`, `stationary-catalog-2026.json` or the glossary; it is in `fabric-cover-program-a26.json` (1 hit) and `swatch-manifest.json`. Gap is in the Designer's Choice record only.
- **Tahoe 240-632 SELECT cover list in 2025 (p27):** D2009 Promise (D200931 Ecru, D200946 Gold, D200952 Oyster, D200959 Thunder, D200972 Khaki, D200983 Powder) and E1917 i-Adario (E191734 Basmati, E191752 Fog, E191753 Stone, E191765 Taupe). The app's 2026 Tahoe note adds D2124 i-Westvale (Antique, Charcoal, Oat, Timber), so the 2025 list is a subset (changed: Westvale added in 2026).
- Colby p32: C1700 Nico, C170033 Oyster, C170053 Ash, C170057 Charcoal. App 2026 note: "Oyster, Charcoal and Ash". Same.
- Bennett p33 B1808 Social Club: B180852 Stone, B180857 Charcoal, B180868 Pewter, B180872 Chalk, B180876 Cocoa. App: Stone, Pewter, Cocoa, Charcoal, Chalk. Same.

### A4. Front-matter content in 2025 (prefix definitions, pp. PDF 3-4)
The 2025 catalog prints the whole company prefix key (bold = included in this catalog). Items worth cross-checking in the app's prefix tables (the 2026 DC `prefix_definitions` holds only 12 entries): ROCKER/WALL/GLIDER prefixes (010, P10, 10U, 10X, 016, P16, 16X, 017, 30L, 30R, 3CS/SC3); LIFT CHAIRS (1HM Gold, 1PH/1PL Platinum, 3BL Bronze, 4LP Silver); RECLINA-WAY (330, 33U, 33X, 320, 32U, 32X, 390/339, 39U/U39, 39X/X39); LA-Z-MOTION (84U, 88U, 81U, 85U); LA-Z-TIME (445/U45/X45, 443/U43/X43, 444/U44/X44, 448/U48/X48, 449/U49/X49); LA-Z-TIME MODULARS (44A/U4A/X4A, 44B/U4B/X4B, 44C, SC4, 44D/U4D/X4D, 44E/U4E/X4E, M44, 44Q/U4Q/X4Q, 44S/U4S/X4S, 44V/U4V/X4V); LA-Z-MOTION MODULARS (8AU, 8BU, 8CO, 8MO, 8SU, 8SC); STATIONARY SECTIONALS (60A, 6AL, 60B, 6AR, 60C, 6CC, 60D, 60E, 60L, 60R, 60M, 6MM, 6SC, 6SL, 6SR, 6SP, 60W, 60X, 60Y, 60Z); SOFAS & SLEEP SOFAS (510 Queen Sleep Sofa, 51S, 520 Full Sleep Sofa, 610, 61S, 620 Apartment Size Sofa, 630 Loveseat, 640 Extra-Long Sofa, 555 Twin Sleep Chair & A Half, 655 Chair & A Half, 230 Chair, 240 OTTOMAN); DUO (P91, P93, P94 POWER RECLINING CHAIR, P9D, P9E, 90M); SPECIAL ITEMS (01P Single Custom Pillow, 08P Pair of Custom Pillows, 088 Swivel/Tall Bases/Handles/Armcaps/Battery Packs/Mattresses/Misc.); CLASSICS (028, 295, 29U); COMPLEMENTS (024/245 Ottoman, 210 High Leg Swivel Chair, 215 Swivel Chair, 225 Swivel Gliding Chair, 235 Chair, 265 Reclining Chair). Bold (included) prefixes in text: 240, P94, 028, 295, 29U, 024/245, 210, 215, 225, 235, 265. Prefix 240 (OTTOMAN, Tahoe 240-632) is bold here; the 2026 DC prefix list has `024` under "Stationary sofas and sleep sofas" and no 240.
No new prefixes versus the app were checked beyond this DC list; the app's broader prefix coverage is documented in `pdf_vs_app.md` (58 PDF prefixes absent from style index).

### A5. Other 2025-only text
- Warranty p8: complement table uses "ComfortCore Plus TEMPUR-Response Memory Foam Cushion" (5 YEAR) and "ComfortCore Cushion" (3 YEAR); the 2026 app wording is "ComfortDown (DC)" and Contour Cushion.
- Classics warranty row "Wood Frame (Applies to styles 295-423, 295-408)": 5 YEAR. No 295-408 exists in the 2025 model pages (408 Ferndale is 225/245/265). The app has "295-423" (Classics) and "265, 245-408" (Complements). Probable typo in the 2025 print; flag as source conflict.
- Classics row "Electrical Components (Applies to 29U prefix)": 3 YEAR column in 2025; app warranty_matrix lists Classics electrical components under one_year. Text-layer column alignment of the PDF tables is lossy (blank cells collapse), so treat the year column as a reading from the table, verify against the image.
- Complements table (2025): Show Wood row in 1 YEAR column; Polyurethane Foam Cushioning in 1 YEAR column; mechanisms, frame, springs and swivels lifetime. App warranty_matrix lists Complements polyurethane foam at 3 years and show wood at limited lifetime. Same caveat.
- duo CHAIRS table (2025): Electrical Components 3 YEAR; duo Mechanism, Frame, Springs lifetime; Show Wood 1 YEAR. App lists duo electrical under one_year.
- Fabric rows (all 3 tables): conserve / Antimicrobial / Restore by Nanobionic = 1 YEAR; iClean combinations = 3 YEAR.
- Intro: "back the majority of our frames with a Limited Lifetime Warranty"; fabrics wear-tested in lab; specialty fabrics for children/pets.
- Photo captions of covers: "Shown in discontinued cover" appears on 024-205 (Cory), 235/245-400 (Dora), 245/265-408 (Ferndale).

---
## (B) Already in the app
### B1. Styles matching on style number, type and dimensions
All 42 listed below match the app's `style-index-2026.json` dims exactly (H x W x D). Cover cap sets also match (as a union of fabric/RL/leather codes) for all 42.

| Style | Model | Type (2025) | Dims 2025 = app | Options 2025 | Options 2026 (app) | Page |
|---|---|---|---|---|---|---|
| 024-205 | Cory | Ottoman | 20H X 45W X 26D | N/A | - | 1 |
| 024-225 | Roundabout | Ottoman | 18H X 35W X 35D | N/A | - | 2 |
| 245-301 | Oliver | Ottoman | 18H X 39.5W X 39.5D | N/A | - | 3 |
| 024-30A | Leo | Ottoman | 21.5H X 22.5W X 22.5D | 4C | 4C, FN | 4 |
| 225-400 | Dora | Swivel Gliding Chair | 41.5H X 34.5W X 38D | Z5 | DC, FN, Z6 | 5 |
| 235-400 | Dora | Chair | 41.5H X 34.5W X 37.5D | Z5 | DC, FN, Z6 | 5 |
| 245-400 | Dora | Ottoman | 20H X 29W X 23.5D | N/A | FN | 5 |
| 225-401 | Allegra | Swivel Gliding Chair | 36H X 34W X 35D | Z5 | DC, FN, Z6 | 6 |
| 235-401 | Allegra | Chair | 35.5H X 34W X 34D | Z5 | DC, FN, Z6 | 6 |
| 245-401 | Allegra | Ottoman | 19H X 27.5W X 23D | N/A | FN | 6 |
| 225-402 | Maeve | Swivel Gliding Chair | 35.5H X 31W X 40D | Z5 | FN, Z6 | 7 |
| 235-402 | Maeve | Chair | 37H X 31W X 40D | Z5 | FN, Z6 | 7 |
| 245-402 | Maeve | Ottoman | 18H X 28W X 22D | N/A | - | 7 |
| 295-405 | Dante | High Leg Reclining Chair | 43H X 29.5W X 43D | TF | FN, FS | 9 |
| 29U-405 | Dante | High Leg Power Recliner w/ Headrest | 43H X 29.5W X 43D | LW, TF | FN, FS, LW | 9 |
| 225-408 | Ferndale | Swivel Gliding Chair | 39H X 35W X 37D | Z5 | DC, FN, Z6 | 10 |
| 245-408 | Ferndale | Ottoman | 18H X 25W X 22D | N/A | FN | 10 |
| 265-408 | Ferndale | Reclining Chair | 40H X 32W X 34.5D | TF | FN, FS | 10 |
| 210-421 | Bellevue | High Leg Swivel Chair | 37H X 33W X 36D | Z5 | DC, FN, Z6 | 11 |
| 295-423 | Eldorado | High Leg Reclining Chair | 42H X 32.5W X 41D | TF | FN, FS | 12 |
| 295-424 | Fletcher | High Leg Reclining Chair | 40H X 35.5W X 36.5D | TF | FN, FS | 13 |
| 225-425 | Alma | Swivel Gliding Chair | 36H X 32W X 37.5D | Z5 | DC, FN, Z6 | 14 |
| 295-430 | Brentwood | High Leg Reclining Chair | 43.5H X 33.5W X 35D | LG, TF | FN, FS, LG | 15 |
| 29U-430 | Brentwood | High Leg Power Recliner w/ Headrest | 43.5H X 33.5W X 35D | LG, LW, TF | FN, FS, LG, LW | 15 |
| 028-431 | Scarlett | High Leg Reclining Chair | 39H X 33W X 37D | TF | FN, FS | 16 |
| 295-448 | Riley | High Leg Reclining Chair | 41H X 35.5W X 37D | TF | FN, FS | 17 |
| 028-450 | Haven | High Leg Reclining Chair | 40H X 35W X 37D | TF | FN, FS | 18 |
| 215-456 | Opal | Swivel Chair | 34.5H X 51W X 52D | C1, F1, FP, P1, Z5 | DC, FP, P1, Z6 | 19 |
| 295-457 | Audrey | High Leg Reclining Chair | 42H X 31.5W X 38.5D | TF | FN, FS | 20 |
| 29U-457 | Audrey | High Leg Power Recliner w/ Headrest | 42H X 31.5W X 38.5D | LW, TF | FN, FS, LW | 20 |
| 295-458 | Rheeves | High Leg Reclining Chair | 43H X 33.5W X 36D | TF | FN, FS | 21 |
| 29U-458 | Rheeves | High Leg Power Recliner w/ Headrest | 43H X 33.5W X 36D | LW, TF | FN, FS, LW | 21 |
| 210-460 | Reegan | High Leg Swivel Chair | 36.5H X 30W X 35D | Z5 | DC, FN, Z6 | 22 |
| 225-462 | Roxie | Swivel Gliding Chair | 37H X 37W X 37D | Z5 | DC, FN, Z6 | 23 |
| 295-471 | Carleton | High Leg Reclining Chair | 42H X 36W X 39D | NB, NH, NS, TF | FN, FS, NB, NH, NS | 24 |
| 29U-471 | Carleton | High Leg Power Recliner w/ Headrest | 42H X 36W X 39D | LW, NB, NH, NS, TF | FN, FS, LW, NB, NH, NS | 24 |
| 225-479 | Midtown | Swivel Gliding Chair | 40H X 32W X 36D | Z5 | DC, FN, Z6 | 25 |
| 240-632 | Tahoe | Ottoman | 21.5H X 38.5W X 38.5D | N/A | - | 27 |
| 028-916 | Kimberly | High Leg Reclining Chair | 41H X 29.5W X 37.5D | TF | FS | 28 |
| 028-931 | Charlotte | High Leg Reclining Chair | 38.5H X 33W X 35D | (options not legible in extraction) | FN, FS | 29 |
| P94-893 | Colby | duo Reclining Chair | 41H X 39W X 39.5D | LT, Z5 | FN, LT | 32 |
| P94-899 | Bennett | duo Reclining Chair | 39.5H X 37.5W X 39D | Z5 | FN, LT | 33 |


Differences in B that are not conflicts of identity: options codes (see C), and finish lists below.

### B2. Style numbers from this catalog that appear in `_pdf_codes.json` (available_products.pdf, Available Products list)

| Style | Model | Page |
|---|---|---|
| 024-225 | Roundabout | 2 |
| 024-30A | Leo | 4 |
| 028-450 | Haven | 18 |
| 028-916 | Kimberly | 28 |
| 028-931 | Charlotte | 29 |


Also present in the PDF under a different prefix for the same model number: `029-423` (Eldorado), `029-424` (Fletcher), `029-448` (Riley) (prefix 029, not the catalog's 295), and `91P-899`, `93P-899`, `94P-899` (Bennett duo sofa/loveseat/chair prefixes in available_products ordering). None of the "Coming Soon" codes in `_pdf_codes.json` match a model here. 40 of 45 style numbers from this catalog are not in the Available Products list.
`024-30A`, `024-225`, `028-450`, `028-916`, `028-931` are exact matches.

---
## (C) Conflicts and changed items (2025 vs app 2026)

| Item | 2025 catalog (page) | App 2026 | Note |
|---|---|---|---|
| Models dropped from DC catalog | Mercer 404 (p8), Fletcher 424 (p13), Marietta 498 (p26) | Absent from 2026 DC index; Fletcher in style-index status discontinued | changed/discontinued |
| Models added in 2026 | Scout 304, Gemma 406, Rae 416 do not appear in 2025 | Scout/Gemma/Rae pages 5, 10, 12 (Scout and Rae flagged new) | new vs 2025 |
| NEW marker | AUDREY 457 flagged NEW (p20; TOC; warranty-page caption) | Audrey not new (index `new_introduction` false) | aged out of NEW |
| Seat cushion upgrade code, swivel/chair/glider | Z5 (ComfortCore Plus TEMPUR-Response) | Z6 (ComfortCore Plus with Contour Cushion), plus DC (ComfortDown) | renamed/changed |
| Seat cushion upgrade code, recliners | TF (TEMPUR-Response memory foam) | FS (La-Z-Boy Contour Cushion) | renamed/changed; equivalence not stated |
| Wood finish option | not listed as an option code (finish shown as Standard/Optional) | FN on every style (non-standard wood finish), e.g. Eldorado caption 'FN 021' also appears in 2025 p12 photo caption | FN already in use in 2025 caption |
| Opal 215-456 options | C1, F1, FP, P1, Z5 (p19) | DC, FP, P1, Z6 | C1/F1 dropped; Z5->Z6; DC added |
| Colby P94-893 options | LT, Z5 (p32) | FN, LT | Z5 dropped |
| Bennett P94-899 options | Z5 (p33) | FN, LT | Z5 dropped; LT added |
| Kimberly 028-916 options | TF (p28) | FS | as TF->FS |
| Charlotte 028-931 options | blank in text layer (p29) | FN, FS | not comparable |
| Dora 235/245-400 optional finishes | 021, 041*, 071* ('*Finish option available on prefixes 235 and 245 only') (p5) | style-index 235400/245400 list optional finish 021 only; DC model note says Graphite and Driftwood optional only for 235/245 | App internal inconsistency vs 2025: style-index missing 041, 071 on 235-400/245-400 |
| Allegra 225-401 optional finishes | 007, 041* (235/245 only) (p6) | 225401: 007; 235/245: 007, 041 | Matches |
| Maeve 245-402 finishes | Standard 007; optional 021, 041*, 071* (*prefix 235 only) (p7) | 245402 standardFinish none, optional none (style-index) | App shows no finish for 245-402; 2025 prints the finish line for the page group |
| Ferndale 245-408/265-408 finishes | 007; 021, 041*, 071* (*245 and 265 only) (p10) | Matches (225 has 021 only) | Match |
| 29U-430 standard finish | 007 (p15) | standardFinish null in style-index for 29U430 | App data gap |
| Cover-cap classification | FABRIC list includes UE and BU; RECYCLED LEATHER = RL; LEATHER = LL/LM (all model pages) | DC 2026 splits fabric (DR UR DP NP PS VS) vs faux_leather (BU UE RL) | labelling difference only; union of codes identical |
| Tahoe SELECT covers | Promise + i-Adario (p27) | Promise + i-Adario + i-Westvale D2124 | Westvale added in 2026 |
| Warranty: Classics wood frame | 'Applies to styles 295-423, 295-408' (p8) | '295-423' (sales-reference matrix) | 2025 appears to print 295-408 in error |
| Warranty: electrical components | 3 YEAR for Classics 29U and duo (p8) | one_year (Motor, Electrical Components, Battery Pack) | Verify on image; table cells collapse in text |
| Warranty: Complements foam/show wood | 1 YEAR columns (p8) | 3 yr foam; lifetime show wood | Verify on image |
| Page numbering | Models 1-29, options 30-31, Colby 32, Bennett 33 | Same 32/33 for Colby/Bennett, but pages 1-29 shifted after new models (Scout p5, Gemma p10, Rae p12) | expected |
| Footer | (c) 2025 La-Z-Boy Incorporated - 07/2025 - CA0314 | (c) 2026 - 04/2026 - 000119-A-1 | edition id |
| Source coverage note | Colby and Bennett: only P94 chair tables printed (p32-33) | App notes same limitation; sofa/loveseat not in catalog | Match |


### Option definitions the 2025 pages print that the app lacks (see A2): TF, Z5, ZB, C1 and F1 text, Extra Fabric, 088 1YC, LT wording, BP2.

---
## (D) Page-by-page index of what was read
Printed page numbers; PDF page positions inferred (see limits).

| Page | Content | Detail |
|---|---|---|
| PDF 1 | cover | Title: La-Z-Boy Designer's Choice Collection SUMMER/FALL 2025; Lazarini furniture image |
| PDF 2 | image page | 'LAZARINI FURNITURE' (photo caption only) |
| PDF 3-4 | Prefix Definitions (2 pages) | Rocker/Wall recliners/Gliders, Lift chairs, Reclina-Way, La-Z-Motion, La-Z-Time (+Modulars), La-Z-Motion modulars; stationary sectionals, sofas and sleep sofas, duo, special items, Classics, Complements; 'NEW BELMONT in LB192976', 'NEW SHILOH in D207432'; 'la-z-boy.com' |
| PDF 5 | Style Name Index | 31 names with style no. and page (Allegra 6 ... Bennett 33; Audrey NEW) |
| PDF 6-7 | Table of Contents (2 pages) | Style, name, page, flags: Stationary Chair, Ottoman, Reclining Chair, Swivel Chair, Press Back Recliner, Power, Fabric, Leather |
| PDF 8 | Limited Lifetime Warranty | Intro text + 3 tables (Complements, Classics chairs, duo chairs); 'NEW AUDREY in FL207829' |
| PDF 9 | Options (1) | C1, LG, F1, NB, NS, TF, NN, Z5, 088AC2/3/4, 088 BP1/BP2, LW, RW, FP, NH, P1, ZB, Extra Fabric |
| PDF 10 | Finish Options (1) | 007 Brown Mahogany, 021 Coffee, 071 Driftwood, 041 Graphite, 142 Mesa (only on 295-423) |
| p1 (PDF 11) | 205 CORY | 024-205 Ottoman |
| p2 (PDF 12) | 225 ROUNDABOUT | 024-225 Ottoman |
| p3 (PDF 13) | 301 OLIVER | 245-301 Ottoman |
| p4 (PDF 14) | 30A LEO | 024-30A Ottoman |
| p5 (PDF 15) | 400 DORA | 225-400 Swivel Gliding Chair; 235-400 Chair; 245-400 Ottoman |
| p6 (PDF 16) | 401 ALLEGRA | 225-401 Swivel Gliding Chair; 235-401 Chair; 245-401 Ottoman |
| p7 (PDF 17) | 402 MAEVE | 225-402 Swivel Gliding Chair; 235-402 Chair; 245-402 Ottoman |
| p8 (PDF 18) | 404 MERCER | 295-404 High Leg Reclining Chair; 29U-404 High Leg Power Recliner w/ Headrest |
| p9 (PDF 19) | 405 DANTE | 295-405 High Leg Reclining Chair; 29U-405 High Leg Power Recliner w/ Headrest |
| p10 (PDF 20) | 408 FERNDALE | 225-408 Swivel Gliding Chair; 245-408 Ottoman; 265-408 Reclining Chair |
| p11 (PDF 21) | 421 BELLEVUE | 210-421 High Leg Swivel Chair |
| p12 (PDF 22) | 423 ELDORADO | 295-423 High Leg Reclining Chair |
| p13 (PDF 23) | 424 FLETCHER | 295-424 High Leg Reclining Chair |
| p14 (PDF 24) | 425 ALMA | 225-425 Swivel Gliding Chair |
| p15 (PDF 25) | 430 BRENTWOOD | 295-430 High Leg Reclining Chair; 29U-430 High Leg Power Recliner w/ Headrest |
| p16 (PDF 26) | 431 SCARLETT | 028-431 High Leg Reclining Chair |
| p17 (PDF 27) | 448 RILEY | 295-448 High Leg Reclining Chair |
| p18 (PDF 28) | 450 HAVEN | 028-450 High Leg Reclining Chair |
| p19 (PDF 29) | 456 OPAL | 215-456 Swivel Chair |
| p20 (PDF 30) | 457 AUDREY NEW | 295-457 High Leg Reclining Chair; 29U-457 High Leg Power Recliner w/ Headrest |
| p21 (PDF 31) | 458 RHEEVES | 295-458 High Leg Reclining Chair; 29U-458 High Leg Power Recliner w/ Headrest |
| p22 (PDF 32) | 460 REEGAN | 210-460 High Leg Swivel Chair |
| p23 (PDF 33) | 462 ROXIE | 225-462 Swivel Gliding Chair |
| p24 (PDF 34) | 471 CARLETON | 295-471 High Leg Reclining Chair; 29U-471 High Leg Power Recliner w/ Headrest |
| p25 (PDF 35) | 479 MIDTOWN | 225-479 Swivel Gliding Chair |
| p26 (PDF 36) | 498 MARIETTA | 235-498 Chair |
| p27 (PDF 37) | 632 TAHOE | 240-632 Ottoman |
| p28 (PDF 38) | 916 KIMBERLY | 028-916 High Leg Reclining Chair |
| p29 (PDF 39) | 931 CHARLOTTE | 028-931 High Leg Reclining Chair |
| p30-31 (PDF 40-41) | Options (2) / Finish Options (2) | C1, F1, LT, NB, NS, P1, ZB, 088 BP1, FP, NH, Z5, 088 1YC; finishes 007, 021, 041 |
| p32 (PDF 42) | 893 COLBY | P94-893 duo Reclining Chair |
| p33 (PDF 43) | 899 BENNETT | P94-899 duo Reclining Chair |


Pages not read: none missing at text level. Photographs, swatch images and layout art not captured. The scraper could only read Publitas `/page/N` as a logo image, so those URLs were not individually crawled; the PDF behind the viewer contains the same 44 pages.
Total pages: 44 PDF pages (printed model pages 1-29, 32-33; 30-31 options).

Table of Contents flags (as printed, p6-7), bullet = flagged: Cory 205 (Ottoman, Fabric, Leather); Roundabout 225 (Ottoman, F, L); Oliver 301 (Ottoman, F, L); Leo 30A (Ottoman, F, L); Dora 400 (Stationary Chair, Ottoman, Swivel, F, L); Allegra 401 (same); Maeve 402 (same); Mercer 404 (Reclining Chair, Power, Fabric); Dante 405 (Reclining, Power, F, L); Ferndale 408 (Ottoman, Press Back Recliner, F, L); Bellevue 421 (Swivel, F); Eldorado 423 (Reclining, F, L); Fletcher 424 (Reclining, F, L); Alma 425 (Swivel, F); Brentwood 430 (Reclining, Power, F, L); Scarlett 431 (Reclining, F, L); Riley 448 (Reclining, F, L); Haven 450 (Reclining, F, L); Opal 456 (Swivel, Power, F, L); Audrey 457 NEW (Reclining, Power, F, L); Rheeves 458 (Reclining, Power, F, L); Reegan 460 (Swivel, F, L); Roxie 462 (Swivel, F); Carleton 471 (Reclining, Power, F, L); Midtown 479 (Swivel, F, L); Marietta 498 (Stationary Chair, F, L); Tahoe 632 (Ottoman, F, L); Kimberly 916 (Reclining, F); Charlotte 931 (Reclining, F); Colby 893 (Reclining, Power, F, L); Bennett 899 (Reclining, Power, F, L). Flags are navigation metadata only (the columns are lossy in text; e.g. Ferndale's 225 swivel glider is not flagged Swivel).
Footnotes/special rules captured: Midtown LL welt replaced by single-needle topstitching (p25); Eldorado Mesa finish only on 295-423 (p10, p12); Ferndale/Dora/Allegra/Maeve finish asterisks (p5-7, p10); Classics wood-frame warranty styles (p8); 088 1YC not available on lift chairs (p30); 29U prefix standard RW remote (p9); platinum/brass/black nailhead options select styles (p9, p30). No special-order rules, cover-program prices, discontinued-lists, or pillow-style tables (beyond C1/F1/FP/P1 definitions) appear in this catalog. Napkin arm caps/headrest covers: 088AC2/AC3/AC4 'available with all fabric orders' (p9). FP Featherlite pillows: 95% duck feathers, 5% duck down in 100% cotton down-proof ticking (p9, p30).

---
## (E) Machine-readable appendix
Full file: `catalog2025_designers_choice.json` (same directory). Compact style records (style number, name, type, dims, page):

```json

[
 {
  "style_number": "024-205",
  "name": "Cory",
  "type": "Ottoman",
  "dims": "20H X 45W X 26D",
  "options": [
   "N/A"
  ],
  "page": 1
 },
 {
  "style_number": "024-225",
  "name": "Roundabout",
  "type": "Ottoman",
  "dims": "18H X 35W X 35D",
  "options": [
   "N/A"
  ],
  "page": 2
 },
 {
  "style_number": "245-301",
  "name": "Oliver",
  "type": "Ottoman",
  "dims": "18H X 39.5W X 39.5D",
  "options": [
   "N/A"
  ],
  "page": 3
 },
 {
  "style_number": "024-30A",
  "name": "Leo",
  "type": "Ottoman",
  "dims": "21.5H X 22.5W X 22.5D",
  "options": [
   "4C"
  ],
  "page": 4
 },
 {
  "style_number": "225-400",
  "name": "Dora",
  "type": "Swivel Gliding Chair",
  "dims": "41.5H X 34.5W X 38D",
  "options": [
   "Z5"
  ],
  "page": 5
 },
 {
  "style_number": "235-400",
  "name": "Dora",
  "type": "Chair",
  "dims": "41.5H X 34.5W X 37.5D",
  "options": [
   "Z5"
  ],
  "page": 5
 },
 {
  "style_number": "245-400",
  "name": "Dora",
  "type": "Ottoman",
  "dims": "20H X 29W X 23.5D",
  "options": [
   "N/A"
  ],
  "page": 5
 },
 {
  "style_number": "225-401",
  "name": "Allegra",
  "type": "Swivel Gliding Chair",
  "dims": "36H X 34W X 35D",
  "options": [
   "Z5"
  ],
  "page": 6
 },
 {
  "style_number": "235-401",
  "name": "Allegra",
  "type": "Chair",
  "dims": "35.5H X 34W X 34D",
  "options": [
   "Z5"
  ],
  "page": 6
 },
 {
  "style_number": "245-401",
  "name": "Allegra",
  "type": "Ottoman",
  "dims": "19H X 27.5W X 23D",
  "options": [
   "N/A"
  ],
  "page": 6
 },
 {
  "style_number": "225-402",
  "name": "Maeve",
  "type": "Swivel Gliding Chair",
  "dims": "35.5H X 31W X 40D",
  "options": [
   "Z5"
  ],
  "page": 7
 },
 {
  "style_number": "235-402",
  "name": "Maeve",
  "type": "Chair",
  "dims": "37H X 31W X 40D",
  "options": [
   "Z5"
  ],
  "page": 7
 },
 {
  "style_number": "245-402",
  "name": "Maeve",
  "type": "Ottoman",
  "dims": "18H X 28W X 22D",
  "options": [
   "N/A"
  ],
  "page": 7
 },
 {
  "style_number": "295-404",
  "name": "Mercer",
  "type": "High Leg Reclining Chair",
  "dims": "43H X 32W X 38.5D",
  "options": [
   "TF"
  ],
  "page": 8
 },
 {
  "style_number": "29U-404",
  "name": "Mercer",
  "type": "High Leg Power Recliner w/ Headrest",
  "dims": "43H X 32W X 38.5D",
  "options": [
   "LW",
   "TF"
  ],
  "page": 8
 },
 {
  "style_number": "295-405",
  "name": "Dante",
  "type": "High Leg Reclining Chair",
  "dims": "43H X 29.5W X 43D",
  "options": [
   "TF"
  ],
  "page": 9
 },
 {
  "style_number": "29U-405",
  "name": "Dante",
  "type": "High Leg Power Recliner w/ Headrest",
  "dims": "43H X 29.5W X 43D",
  "options": [
   "LW",
   "TF"
  ],
  "page": 9
 },
 {
  "style_number": "225-408",
  "name": "Ferndale",
  "type": "Swivel Gliding Chair",
  "dims": "39H X 35W X 37D",
  "options": [
   "Z5"
  ],
  "page": 10
 },
 {
  "style_number": "245-408",
  "name": "Ferndale",
  "type": "Ottoman",
  "dims": "18H X 25W X 22D",
  "options": [
   "N/A"
  ],
  "page": 10
 },
 {
  "style_number": "265-408",
  "name": "Ferndale",
  "type": "Reclining Chair",
  "dims": "40H X 32W X 34.5D",
  "options": [
   "TF"
  ],
  "page": 10
 },
 {
  "style_number": "210-421",
  "name": "Bellevue",
  "type": "High Leg Swivel Chair",
  "dims": "37H X 33W X 36D",
  "options": [
   "Z5"
  ],
  "page": 11
 },
 {
  "style_number": "295-423",
  "name": "Eldorado",
  "type": "High Leg Reclining Chair",
  "dims": "42H X 32.5W X 41D",
  "options": [
   "TF"
  ],
  "page": 12
 },
 {
  "style_number": "295-424",
  "name": "Fletcher",
  "type": "High Leg Reclining Chair",
  "dims": "40H X 35.5W X 36.5D",
  "options": [
   "TF"
  ],
  "page": 13
 },
 {
  "style_number": "225-425",
  "name": "Alma",
  "type": "Swivel Gliding Chair",
  "dims": "36H X 32W X 37.5D",
  "options": [
   "Z5"
  ],
  "page": 14
 },
 {
  "style_number": "295-430",
  "name": "Brentwood",
  "type": "High Leg Reclining Chair",
  "dims": "43.5H X 33.5W X 35D",
  "options": [
   "LG",
   "TF"
  ],
  "page": 15
 },
 {
  "style_number": "29U-430",
  "name": "Brentwood",
  "type": "High Leg Power Recliner w/ Headrest",
  "dims": "43.5H X 33.5W X 35D",
  "options": [
   "LG",
   "LW",
   "TF"
  ],
  "page": 15
 },
 {
  "style_number": "028-431",
  "name": "Scarlett",
  "type": "High Leg Reclining Chair",
  "dims": "39H X 33W X 37D",
  "options": [
   "TF"
  ],
  "page": 16
 },
 {
  "style_number": "295-448",
  "name": "Riley",
  "type": "High Leg Reclining Chair",
  "dims": "41H X 35.5W X 37D",
  "options": [
   "TF"
  ],
  "page": 17
 },
 {
  "style_number": "028-450",
  "name": "Haven",
  "type": "High Leg Reclining Chair",
  "dims": "40H X 35W X 37D",
  "options": [
   "TF"
  ],
  "page": 18
 },
 {
  "style_number": "215-456",
  "name": "Opal",
  "type": "Swivel Chair",
  "dims": "34.5H X 51W X 52D",
  "options": [
   "C1",
   "F1",
   "FP",
   "P1",
   "Z5"
  ],
  "page": 19
 },
 {
  "style_number": "295-457",
  "name": "Audrey",
  "type": "High Leg Reclining Chair",
  "dims": "42H X 31.5W X 38.5D",
  "options": [
   "TF"
  ],
  "page": 20
 },
 {
  "style_number": "29U-457",
  "name": "Audrey",
  "type": "High Leg Power Recliner w/ Headrest",
  "dims": "42H X 31.5W X 38.5D",
  "options": [
   "LW",
   "TF"
  ],
  "page": 20
 },
 {
  "style_number": "295-458",
  "name": "Rheeves",
  "type": "High Leg Reclining Chair",
  "dims": "43H X 33.5W X 36D",
  "options": [
   "TF"
  ],
  "page": 21
 },
 {
  "style_number": "29U-458",
  "name": "Rheeves",
  "type": "High Leg Power Recliner w/ Headrest",
  "dims": "43H X 33.5W X 36D",
  "options": [
   "LW",
   "TF"
  ],
  "page": 21
 },
 {
  "style_number": "210-460",
  "name": "Reegan",
  "type": "High Leg Swivel Chair",
  "dims": "36.5H X 30W X 35D",
  "options": [
   "Z5"
  ],
  "page": 22
 },
 {
  "style_number": "225-462",
  "name": "Roxie",
  "type": "Swivel Gliding Chair",
  "dims": "37H X 37W X 37D",
  "options": [
   "Z5"
  ],
  "page": 23
 },
 {
  "style_number": "295-471",
  "name": "Carleton",
  "type": "High Leg Reclining Chair",
  "dims": "42H X 36W X 39D",
  "options": [
   "NB",
   "NH",
   "NS",
   "TF"
  ],
  "page": 24
 },
 {
  "style_number": "29U-471",
  "name": "Carleton",
  "type": "High Leg Power Recliner w/ Headrest",
  "dims": "42H X 36W X 39D",
  "options": [
   "LW",
   "NB",
   "NH",
   "NS",
   "TF"
  ],
  "page": 24
 },
 {
  "style_number": "225-479",
  "name": "Midtown",
  "type": "Swivel Gliding Chair",
  "dims": "40H X 32W X 36D",
  "options": [
   "Z5"
  ],
  "page": 25
 },
 {
  "style_number": "235-498",
  "name": "Marietta",
  "type": "Chair",
  "dims": "39H X 30W X 36.5D",
  "options": [
   "Z5"
  ],
  "page": 26
 },
 {
  "style_number": "240-632",
  "name": "Tahoe",
  "type": "Ottoman",
  "dims": "21.5H X 38.5W X 38.5D",
  "options": [
   "N/A"
  ],
  "page": 27
 },
 {
  "style_number": "028-916",
  "name": "Kimberly",
  "type": "High Leg Reclining Chair",
  "dims": "41H X 29.5W X 37.5D",
  "options": [
   "TF"
  ],
  "page": 28
 },
 {
  "style_number": "028-931",
  "name": "Charlotte",
  "type": "High Leg Reclining Chair",
  "dims": "38.5H X 33W X 35D",
  "options": [
   "(options not legible in extraction)"
  ],
  "page": 29
 },
 {
  "style_number": "P94-893",
  "name": "Colby",
  "type": "duo Reclining Chair",
  "dims": "41H X 39W X 39.5D",
  "options": [
   "LT",
   "Z5"
  ],
  "page": 32
 },
 {
  "style_number": "P94-899",
  "name": "Bennett",
  "type": "duo Reclining Chair",
  "dims": "39.5H X 37.5W X 39D",
  "options": [
   "Z5"
  ],
  "page": 33
 }
]

```
