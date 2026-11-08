# La-Z-Boy US site: recliner, lift chair and motion-chair products vs the LAZ-Boy app

Crawled 2026-11-08 via Firecrawl `firecrawl_scrape` (US site, store context Rockville MD; Veterans Day 35%-off promo live). Direct `curl` to www.la-z-boy.com failed (agent proxy returned CONNECT 403), so Firecrawl was the only working route. Firecrawl worked with no bot blocking (statusCode 200, `proxyUsed: basic`). The main /recliners listing shows 36 of 272 items ("Load All" is JS-driven), so the model list below was assembled from the five sub-category pages. The sub-category pages were not paginated beyond what first-render returned, so a few models may be missing (see Gaps).

## Q1. Which recliner/lift models and technologies are on the site but NOT in the app?

### Takeaway
Almost every recliner, lift and chair-and-a-half model on the US site is already in the app. The app's style-index has exact style-number matches for all but 7 site style numbers. Only 4 model names are new (Addison, Gibson, Coleman, and Mercury as a name). The bigger gaps are PDP-level terms and facts that the app does not carry.

### Cited Findings

**(A) NEW to the app (checked by grep of style-index, recliner-catalog, motion-catalog, mechanism-guide, glossary, sales-reference-library in /home/user/LAZ-Boy/public; 0 hits for each name)**

| Model | Style no. | Type | Evidence |
|---|---|---|---|
| Addison Gliding Recliner | 017764 | glider (listed under Swivel Gliding Recliners) | [gliding page](https://www.la-z-boy.com/b/living-room/recliners/gliding-recliners) |
| Addison Rocking Recliner | 010764 | rocker | [rocking page](https://www.la-z-boy.com/b/living-room/recliners/rocking-recliners) |
| Gibson Rocking Recliner | 010563 | rocker | [rocking page](https://www.la-z-boy.com/b/living-room/recliners/rocking-recliners) |
| Coleman Rocking Recliner | 010508 | rocker | [rocking page](https://www.la-z-boy.com/b/living-room/recliners/rocking-recliners) |
| Coleman Power Rocking Recliner | P10508 | power rocker (no headrest/lumbar in title) | [rocking page](https://www.la-z-boy.com/b/living-room/recliners/rocking-recliners) |
| Mercury Rocking Recliner | 010795 | rocker; the site lists it first among rockers and in "Best Sellers" | [Mercury link on power-lift page](https://www.la-z-boy.com/p/living-room/recliners/rocking-recliners/mercury-rocking-recliner/R-010795?coverId=C681486) |

- Mercury note: style 010795 already exists in the app's style-index with dims (30W x 35.5D x 41H, weight 69 lb) but the name "Mercury" appears nowhere in the app JSON, so only the marketing name is new.
- Product-content/terms present on PDPs but not found in the app JSON (0 hits): "PowerReclineXR+" and "PowerReclineXR" (named in the Pinnacle copy), "6-motor vibration massage" with "3 massage modes (Constant On/Wave/Pulse)", "legrest autostop safety feature", "ETL safety certified". "GreenGuard Certified" appears only twice in mechanism-guide. Source: [Clayton XL PDP](https://www.la-z-boy.com/p/living-room/recliners/power-lift-chairs/clayton-xl-power-lift-recliner/R-1HM562?coverId=D160454), [Pinnacle Platinum PDP](https://www.la-z-boy.com/p/living-room/recliners/power-lift-chairs/pinnacle-platinum-power-lift-recliner-w-headrest-lumbar/R-1PH512?coverId=D160632), [Pinnacle Swivel Gliding PDP](https://www.la-z-boy.com/p/living-room/recliners/gliding-recliners/pinnacle-swivel-gliding-recliner/R-017512?coverId=D160632).
- The site uses a style-number prefix scheme not described in the app's wall/rock naming: 01x = manual rocker, 016 = manual wall, 10U = power rocker w/ headrest, 10X = power rocker w/ headrest and lumbar, 16X = power wall w/ headrest and lumbar, P10/P16 = "Power" rocker/wall (no headrest), 29U/81U = power high-leg w/ headrest, 3BL = Ease lift, 1PH/1PL = Platinum lift with/without headrest+lumbar. Inferred from the URL slugs below; the app already has these style numbers.

**(B) Already in the app (exact style-number match in style-index-2026.json; all of the following)**
- Lift: 1PH512, 1PL512, 1PH519, 1PL519 (Pinnacle/Astor Platinum), 3BL794 Billie Ease, 3BL786 Liam Ease, 3BL793 Jean Ease, 1HM562 Clayton XL.
- Gliders: 017512 Pinnacle, 017799 Harbor Town, 017712 Sparrow, 017747 Finley, 017700 Wynne.
- High-leg / reclining chairs: 028416 Rae, 028431 Scarlett, 028916 Kimberly, 028931 Charlotte, 028450 Haven, 295471 Carleton, 29U471 Carleton power, 295448 Riley, 295423 Eldorado, 295458 Rheeves, 29U458 Rheeves power, 295457 Audrey, 29U457 Audrey w/ headrest, 295430 Brentwood, 29U430 Brentwood power, 295405 Dante, 265408 Ferndale, 81U813 Clybourn, 81U811 Acadia, 81U810 Quinault, P94893 Colby Duo, P94899 Bennett Duo. Source: [high-leg page](https://www.la-z-boy.com/b/living-room/recliners/high-leg-recliners).
- Rockers (manual / power headrest "10U" / power headrest+lumbar "10X"): Pinnacle, Liam, Brooks, Cade, Trouper, Sherman (P10725), Dutton, Apollo, Dorian, Jay, Morrison, Harbor Town, Vail, Jasper, Collage, Randell (+10X777), Astor (+10X519), Parsens, Emmons, Maverick (+10X582), James (10X521), Baron (10X807). Source: [rocking page](https://www.la-z-boy.com/b/living-room/recliners/rocking-recliners).
- Wall recliners: Cade, Brooks, Liam, Pinnacle, Sherman, Dutton, Jay, Apollo, Dorian, Trouper, Morrison, Baron, James, Vail, Collage, Astor, Maverick, Greyson (16X530), Parsens, Redwood, Sammy (16X826), Emmons, Norton, Wynne (manual and 16X power variants as listed). Source: [wall page](https://www.la-z-boy.com/b/living-room/recliners/wall-recliners).
- Chair-and-a-half: 655613 Olson, 655663 Paxton, 655636 Shiloh, 655603 Wilmette, 555636 Shiloh Twin Sleep Chair. Source: [oversized chairs](https://www.la-z-boy.com/b/living-room/chairs/oversized-chairs).

The full model list captured by this crawl (125 items incl. variants: 8 lift, 6 glider, 22 high-leg, ~58 rocker, ~35 wall, 5 chair-a-half) is in the compact table in (D)/appendix below.

### Inferences
- Because all matching style numbers are present, the "new" signal is names and PDP education content, not whole model rows. The app's style-index apparently already includes Addison/Gibson/Coleman style numbers only if prefixed differently; I found no record for 017764, 010764, 010563, 010508, P10508 in style-index (exact styleNumber match failed), so those are true record gaps.
- The site's category taxonomy (Rocking / Wall / Gliding / High Leg / Power Lift) differs from the app's mechanism families (RECLINER, MOTION, LIFT, SWIVEL ...); the site mixes "Swivel Gliding" under Gliding.

### Gaps
- Sub-category pages returned only first-render items (rocking 56, wall 46, high-leg 33, glide 6, lift 8). The main page says 272 recliner items total (includes sofas/loveseat reclining? unverified); the remaining models were not enumerated. Pagination by "Load All" is JS and was not driven.
- Home theater / theater seating: there is no category link on the site map ([site-map](https://www.la-z-boy.com/site-map)); not found. Swivel chairs (non-recliner) and stationary chairs pages were not crawled. Reclining sofas/loveseats/sectionals were out of scope.
- Size variants (petite/large/extra-tall) and ClimateCool/Comfort Core/Tru-Fit/Infinite-position terms were not seen in the PDP text of the 5 PDPs sampled.

## Q2. What spec values or descriptions differ from the app (conflicts)?

### Takeaway
Dimension data largely agrees; the one numeric disagreement found is Trouper Power Wall fully-extended length. Weight capacity and wall clearance text differs in wording/availability.

### Cited Findings

**(C) Conflicts / differences (site vs app style-index values)**

| Style / model | Site value | App value | Source |
|---|---|---|---|
| 16X724 Trouper Power Wall w/ Headrest & Lumbar, fully extended | 66 in. | 67 in. | [Trouper PDP](https://www.la-z-boy.com/p/living-room/recliners/wall-recliners/trouper-power-wall-recliner-w-headrest-lumbar/R-16X724?coverId=D212432) |
| 1PH512 Pinnacle Platinum, wall clearance | "Can be placed 11 inches from a wall"; recline distance not on PDP | reclineDistance 12.5 | [PDP](https://www.la-z-boy.com/p/living-room/recliners/power-lift-chairs/pinnacle-platinum-power-lift-recliner-w-headrest-lumbar/R-1PH512?coverId=D160632) |
| 1HM562 Clayton XL | "Can be placed 13.5 inches from a wall"; 500-lb capacity | reclineDistance 13.5; 500 lb | [PDP](https://www.la-z-boy.com/p/living-room/recliners/power-lift-chairs/clayton-xl-power-lift-recliner/R-1HM562?coverId=D160454) (consistent) |
| 3BL793 Jean Ease | Site PDP features list no weight capacity; weight 102 lb | app "300-lb operating capacity" | [Jean PDP](https://www.la-z-boy.com/p/living-room/recliners/power-lift-chairs/jean-ease-power-lift-recliner/R-3BL793?coverId=D160454) (unverified: capacity not shown on site) |
| 1PH512 Pinnacle Platinum | 350-lb weight capacity, product weight 152 lb | 350 lb, 152 lb | consistent |

- Dimensions confirmed matching the app: 1PH512 (33.5W x 39D x 45H; seat 20/21/22; arm 26; ext 68), 3BL793 (32.5W x 38D x 40.5H; ext 61.5; seat 21/21/19; arm 23.5), 1HM562 (42W x 40.5D x 45.5H; seat 23/23.5/22; arm 27; ext 68), 017512 (33W x 38.5D x 41H; ext 66; seat 19/21.5/18.5). Sources: PDPs linked in (A).
- Pricing is US-only and not comparable (e.g. Pinnacle Platinum lift sale $2,199 vs $3,399 list; Jean Ease $979 vs $1,499). Source: [lift page](https://www.la-z-boy.com/b/living-room/recliners/power-lift-chairs).
- Category dims shown on listing (D x H x W) for lifts: Pinnacle Platinum 39x45x33.5; Billie Ease 37.5x39x32; Astor Platinum 39x45.5x35; Liam Ease 37.5x43x32; Jean Ease 38x40.5x32.5; Clayton XL 40.5x45.5x42. Source: [lift page](https://www.la-z-boy.com/b/living-room/recliners/power-lift-chairs).

### Inferences
- The 66 vs 67 inch difference could be site rounding vs engineering spec; flag for review rather than change.

### Gaps
- Only 5 PDPs sampled for spec comparison (Pinnacle Platinum lift, Jean Ease, Clayton XL, Trouper Power Wall, Pinnacle Swivel Glider); other models unchecked.

## Q3. What feature/technology terms and product-education content exist on the PDPs?

### Takeaway
PDPs carry a consistent feature vocabulary (zero-gravity, independent back/legrest, power tilt headrest, adjustable lumbar, memory positions, battery backup, heat/massage on some lifts) plus recliner-buying FAQ content on the category pages.

### Cited Findings

**(E) App feature ideas and PDP vocabulary**
- Pinnacle Platinum (1PH512): "Luxury-Lift PowerReclineXR+" in the meta description; one-piece seat and back (no gaps); power tilt headrest; adjustable lumbar; zero-gravity position; 350-lb capacity; 11" wall clearance; right storage pocket; battery backup (2 x 9V); ETL listed; legrest autostop; wired controller; GreenGuard Certified; "Limited Lifetime Warranty". Tags: Adjustable Lumbar, Adjustable Headrest, Lift Function Power, Heat & Massage, USB Charging Port, Number of Cushions 1. Documents: product manual PDF `https://content.la-z-boy.com/productassets/productmanuals/DOC007911_PLATINUM_NO_HOMING_OI.pdf` and lift info sheet `https://content.la-z-boy.com/productassets/productconfigurations/tearpads/tearpad-lift.pdf`. Source: [PDP](https://www.la-z-boy.com/p/living-room/recliners/power-lift-chairs/pinnacle-platinum-power-lift-recliner-w-headrest-lumbar/R-1PH512?coverId=D160632).
- Clayton XL (1HM562): 3-setting heat (High/Low/Off) in back and seat; 6-motor vibration massage (4 back, 2 seat); 3 massage modes (Constant On/Wave/Pulse); adjustable massage speeds; 500-lb capacity. Source: [PDP](https://www.la-z-boy.com/p/living-room/recliners/power-lift-chairs/clayton-xl-power-lift-recliner/R-1HM562?coverId=D160454).
- Jean Ease (3BL793): lift assist, backlit ergonomic wired controller, 61.5" fully extended, GreenGuard. Source: [PDP](https://www.la-z-boy.com/p/living-room/recliners/power-lift-chairs/jean-ease-power-lift-recliner/R-3BL793?coverId=D160454).
- Trouper Power Wall (16X724): side-mounted control panel plus wireless remote; independent back/legrest/headrest/lumbar; two memory positions; Home button returns to upright; built-in USB port; "can be placed inches from a wall"; blown-fiber split back; GreenGuard. Source: [PDP](https://www.la-z-boy.com/p/living-room/recliners/wall-recliners/trouper-power-wall-recliner-w-headrest-lumbar/R-16X724?coverId=D212432).
- Pinnacle Swivel Gliding (017512): swivels (360 degrees), glides and reclines; side-mounted handle; upgrade path to "PowerReclineXR or PowerReclinerXR+" (power back and legrest, power-tilt headrest, power lumbar). Source: [PDP](https://www.la-z-boy.com/p/living-room/recliners/gliding-recliners/pinnacle-swivel-gliding-recliner/R-017512?coverId=D160632).
- Buying-guide content on the recliner category page: manual (lever) vs power (button, USB ports, adjustable headrests/lumbar zones, infinite angles); rocker (arched motion) vs glider (track, quieter); wall recliner slides forward, does not rock; customization (hundreds of fabrics/leathers, swivel bases, "upgrade Contour Cushion", handle styles, wood finishes); iClean stain-resistant covers; "four-sided frame, independent reclining back, 3-position legrest". Source: [recliners page](https://www.la-z-boy.com/b/living-room/recliners) (text seen on the same FAQ block of [lift page](https://www.la-z-boy.com/b/living-room/recliners/power-lift-chairs)).
- Site tools not in the app (from site map): Recliner quiz [forms/recliner-quiz](https://www.la-z-boy.com/forms/recliner-quiz), Room Planner 3D, free swatches, product manuals library [productmanuals](https://www.la-z-boy.com/content/CustomerCare/productmanuals), "Customize in 3D" on PDPs. Source: [site map](https://www.la-z-boy.com/site-map).
- Reviews: PDP shows rating breakdown and AI-generated review summary (Pinnacle Platinum: 4.8/5, 600 ratings; Comfort 4.7, Quality 4.8, Design 4.7). Source: PDP above.
- Availability: PDP meta `availability: MadeToOrder`, price in USD; "Special financing... only applicable in the United States" on Jean/Trouper PDPs, so financing and pricing text are US-only. Free Design Services and "Hand-delivered to your home" are listed (US store-dependent).

### Inferences
- App feature ideas: (1) a "wall clearance" badge per model (11"/13.5" etc.); (2) heat/massage detail panel for Clayton XL (zones, 6 motors, 3 modes); (3) a PowerReclineXR / XR+ explainer in glossary; (4) safety-spec chips (ETL, autostop, battery backup 2 x 9V); (5) link to product-manual and tear-pad PDFs by style; (6) recliner-quiz style selector mapping to rocker/glider/wall categories.
- Canadian availability could not be verified from the US site; treat all site pricing, financing and promo content as US-only.

### Gaps
- No Canadian availability data found; the site served US store context (Rockville MD). Not checked: la-z-boy.ca.
- Tru-Fit, ClimateCool, Comfort Core, Infinite position, Sit & stand terms were not observed in the five PDPs; not searched further.

## (D) URLs crawled
- https://www.la-z-boy.com/site-map
- https://www.la-z-boy.com/b/living-room/recliners (36 of 272 shown)
- https://www.la-z-boy.com/b/living-room/recliners/power-lift-chairs (8 items)
- https://www.la-z-boy.com/b/living-room/recliners/gliding-recliners
- https://www.la-z-boy.com/b/living-room/recliners/high-leg-recliners
- https://www.la-z-boy.com/b/living-room/recliners/rocking-recliners
- https://www.la-z-boy.com/b/living-room/recliners/wall-recliners
- https://www.la-z-boy.com/b/living-room/chairs/oversized-chairs
- 5 PDPs: R-1PH512, R-3BL793, R-1HM562, R-16X724, R-017512 (URLs in findings above)
- Failed: direct curl to la-z-boy.com (agent proxy CONNECT 403). Not crawled: swivel/stationary/office chairs, sofas, ottomans.

## Appendix: compact model list (style no. : site name; all US-site; "(power)" = motorized)
Lift: 1PH512 Pinnacle Platinum w/ Headrest&Lumbar $2,199 sale; 1PL512 Pinnacle Platinum; 1PH519 Astor Platinum w/ H&L; 1PL519 Astor Platinum; 3BL794 Billie Ease; 3BL786 Liam Ease; 3BL793 Jean Ease; 1HM562 Clayton XL (heat+massage).
Gliders (swivel): 017512 Pinnacle; 017764 Addison; 017799 Harbor Town; 017712 Sparrow; 017747 Finley; 017700 Wynne.
Rockers: 010795 Mercury, 010786 Liam, 010727 Brooks, 010512 Pinnacle, 010803 Cade, 010724 Trouper, 010725 Sherman, 010828 Dutton, 010757 Apollo, 010755 Dorian, 010706 Jay, 010764 Addison, 010563 Gibson, 010766 Morrison, 010508 Coleman, 010799 Harbor Town, 010403 Vail, 010709 Jasper, 010734 Collage, 010777 Randell, 010519 Astor, 010827 Parsens, 010781 Emmons, 010582 Maverick; power: P10725 Sherman, P10508 Coleman; 10U/10X (headrest / headrest+lumbar): Trouper 724, Pinnacle 512, Brooks 727, Dutton 828, Cade 803, Apollo 757, Dorian 755, Jay 706, Liam 786; 10X only: Randell 777, Maverick 582, James 521, Astor 519, Baron 807.
Wall: 016803 Cade, 016727 Brooks, 016786 Liam, 016512 Pinnacle, 016706 Jay, 016828 Dutton, 016757 Apollo, 016755 Dorian, 016725 Sherman, 016724 Trouper, 016766 Morrison, 016403 Vail, 016734 Collage, 016519 Astor, 016827 Parsens, 016776 Redwood, 016781 Emmons, 016582 Maverick, 016820 Norton, 016700 Wynne; power: P16725 Sherman; 16X (H&L): Liam 786, Pinnacle 512, Dutton 828, Cade 803, Apollo 757, Dorian 755, Brooks 727, Trouper 724, Jay 706, Baron 807, James 521, Morrison 766, Maverick 582, Greyson 530, Redwood 776, Sammy 826.
High leg: 028416 Rae, 028431 Scarlett, 028916 Kimberly, 028931 Charlotte, 028450 Haven, 295471 Carleton, 295448 Riley, 295423 Eldorado, 295458 Rheeves, 295457 Audrey, 295430 Brentwood, 295405 Dante, 265408 Ferndale (reclining chair), P94893 Colby Duo, P94899 Bennett Duo; power w/ headrest: 29U430 Brentwood, 29U471 Carleton, 29U458 Rheeves, 29U457 Audrey, 81U813 Clybourn, 81U811 Acadia, 81U810 Quinault.
Chair-a-half: 655613 Olson, 655663 Paxton, 655636 Shiloh, 655603 Wilmette, 555636 Shiloh Twin Sleep Chair.
