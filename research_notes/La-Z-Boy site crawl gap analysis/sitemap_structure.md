# La-Z-Boy.com (US) site structure, URL inventory and gap vs. the app

Crawl date 2026-11-08. All fetches via Firecrawl (direct curl through the sandbox proxy returned 403). Raw working files (parsed product sitemap) are in the session scratchpad only; key results are reproduced below.

## 1. What are all categories, collections and sections on the site map, with URLs? (Section A: full categorized URL inventory)

### Takeaway
The US site has 4 sitemap files declared in robots.txt, a human "Sitemap" page with 7 shopping departments plus Sale, Design Services, Customer Care, About, Policies and 8 utility/tool pages, and a product sitemap of 1,629 URLs (1,210 unique products once the "-in-stock" duplicates are removed). Nothing in the site map is "outdoor", "kids", "home theater" or "rugs/pillows" as a department; outdoor, office, pet beds and mattresses show up only as warranty sections or sub-categories.

### Cited Findings

**Sitemap discovery**
- robots.txt declares four sitemaps: `/img/staticpages.xml`, `/img/storepages.xml`, `/sitemap_detail0.xml`, `/sitemap_navigation0.xml`. It disallows `/cart/`, `/checkout/`, `/account/`, `/ProductRegistration/`, `/ajax/` etc. and blocks all `?` query URLs except `/b/*?` and `/p/*?` — [robots.txt](https://www.la-z-boy.com/robots.txt)
- `/sitemap.xml` does not exist (returns the site's 404 page, HTTP 404) — [sitemap.xml](https://www.la-z-boy.com/sitemap.xml)
- `sitemap_navigation0.xml` holds 53 category (`/b/...`) URLs in Endeca-style form `/b/<path>/_/N-<id>`, all lastmod 2026-11-08 — [sitemap_navigation0.xml](https://www.la-z-boy.com/sitemap_navigation0.xml)
- `sitemap_detail0.xml` holds 1,629 product URLs in the form `/p/<slug>/_/R-<code>`; 419 are "-in-stock" duplicate slugs, leaving 1,210 unique product slugs (my count from the parsed file) — [sitemap_detail0.xml](https://www.la-z-boy.com/sitemap_detail0.xml)
- `staticpages.xml` lists 28 content URLs: design-services (+/request), CustomerCare (contactus, FAQs, customer-care-videos, productmanuals, policies/, parts-warranty, ratings-and-reviews, fabric-and-leather-care, iclean-cleaning, iclean-warranty), AboutLaZBoy/OurBrands, free-swatches, and a sustainability/2026 report (introduction, how-we-operate, century-vision, environmental-footprint, engaging-our-people, supporting-our-communities, quality-for-generations, sasb-index, tcfd-index, disclaimer) — [staticpages.xml](https://www.la-z-boy.com/img/staticpages.xml)
- `storepages.xml` was declared but I did not fetch it (store pages are `/store/<id>/`, e.g. https://www.la-z-boy.com/store/50853384/).

**Human site map page (https://www.la-z-boy.com/site-map), verbatim structure**

Recliners — https://www.la-z-boy.com/b/living-room/recliners
- Gliding: /b/living-room/recliners/gliding-recliners
- High Leg: /b/living-room/recliners/high-leg-recliners
- Power Lift Chairs: /b/living-room/recliners/power-lift-chairs
- Rocking: /b/living-room/recliners/rocking-recliners
- Wall: /b/living-room/recliners/wall-recliners
- (nav sitemap also has Oversized Recliners: /b/living-room/recliners/oversized-recliners/_/N-zkk9h4)

Chairs — /b/living-room/chairs: Office Chairs (/chairs/office-chairs), Oversized Chairs (/chairs/oversized-chairs), Stationary Chairs (/chairs/stationary-chairs), Swivel Chairs (/chairs/swivel-chairs)

Sofas & Sectionals — /b/sofas-sectionals
- Reclining Loveseats: /b/sofas-sectionals/reclining-loveseats
- Reclining Sofas & Sectionals: /b/sofas-sectionals/reclining-sofas-sectionals
- Sleepers: /b/living-room/sofas?filter=options_uFilter:%22Sleeper%22 (a filter, not a category)
- Stationary Loveseats: /b/sofas-sectionals/stationary-loveseats
- Stationary Sofas & Sectionals: /b/sofas-sectionals/stationary-sofas-sectionals
- Nav sitemap also lists: /b/living-room/sectionals (+reclining-sectionals, stationary-sectionals), /b/living-room/sofas (+reclining-sofas, stationary-sofas), /b/living-room/loveseats (+reclining-loveseats, stationary-loveseats), /b/sectional-pieces, and `/b/sofas--sectionals/...` variants (double-hyphen = "&")

Living Room — /b/living-room: Recliners, Chairs, Sofas & Sectionals, Ottomans (/b/living-room/ottomans), Tables & Storage (/b/living-room/tables-storage; nav sitemap adds cocktail-tables, end-tables, media--storage, desks)
Dining Room — /b/dining-room: Barstools, Dining Cabinets, Dining Chairs, Dining Tables
Bedroom — /b/bedroom: Beds, Chests, Dressers, Nightstands
Accessories — /b/accessories: Benches, Lamps, Mirrors (nav sitemap adds Pet Beds: /b/accessories/pet-beds)
Sale Furniture — /b/sale
Design Services — /design-services; Free Consultation /design-services/request
Customer Care — /content/CustomerCare/ : contactus, FAQs, customer-care-videos, productmanuals, parts-warranty, fabric-and-leather-care, iclean-cleaning, iclean-warranty
About La-Z-Boy — /content/AboutLaZBoy/ : our-brands, american-heritage, carbon-and-climate, corporate-commitment, corporate-giving, financial-responsibility, investing-in-employees, leadership, media-resources, natural-resources, OurBrands, sasb-standards, supplier-opportunity, sustainability, sustainability-at-a-glance, waste-and-toxicity, supplier-requirements; external: careers.la-z-boy.com, ir.la-z-boy.com
Policies — /content/policies : ConflictMineralsPolicy, ctsca, privacy-policy, return-policy, terms-of-use
Tools / utility — 3D Room Planner /content/Room-Planner-3D; addi+ions /content/additions; Free Swatches /content/free-swatches; Recliner Quiz /forms/recliner-quiz; Performance Fabric Patterns & Care /content/CustomerCare/performance-fabric-patterns-care; Financing /content/financing; Order Status /order/anonymousOrders.jsp; Cart /cart/cart.jsp; Store Locator /storeLocator/storeLocator.jsp
Source for all of the above: [Sitemap page](https://www.la-z-boy.com/site-map), [navigation sitemap](https://www.la-z-boy.com/sitemap_navigation0.xml)

**Homepage-only URLs (not on site map page)** — [homepage](https://www.la-z-boy.com/)
- /content/recliners, /b/best-selling-recliners, /b/shop-all-leather, /b/coffee-and-side-tables, /b/sofas-and-loveseats?uc_param=reclining, /content/offers, /content/behind-your-unwind, /content/financing-disclosures, /b/audioluxe (AudioLuxe landing), and brand landing pages by model: /b/liam, /b/morrison, /b/belmont, /b/cade, /b/trouper
- Promo: Veterans Day sale, "35% off everything" (/b/sale; banner at crawl time)
- Error-page "popular searches" also list /b/living-rooms/chairs (note: appears to be a typo path in the 404 template) and /b/living-room/sofas/reclining-sofas

**Product counts shown**
- Recliners: "(272 items)" — https://www.la-z-boy.com/b/living-room/recliners (view with 36 per page; cover swatch counts like "+594 More" colors per model)
- Sofas & Sectionals: "(301 items)" — https://www.la-z-boy.com/b/sofas-sectionals
- Lamps: "(14 items)" — https://www.la-z-boy.com/b/accessories/lamps
- Other category counts not captured (gap).

**Product-URL composition (from sitemap_detail0.xml, my parsing; unique non-"in-stock" slugs)**
- 706 upholstery items (R-code of 6 alphanumeric characters, 102 distinct model names). 504 non-upholstery/other items with hyphenated codes (case goods, tables, beds, lamps, etc.).
- Upholstery variants by type word in slug: recliner ~266, reclining ~252, "w-headrest" 310, "lumbar" 164, loveseat 148, rocking 120, wall ~114 (wall-recliner 81 slugs incl power), sofa ~100, chair ~81, sleep ~20 (queen/full sleep sofa, twin sleep chair), modular-sectional 14, ottoman 15 + 4 storage ottoman, power-lift 8, swivel-gliding 12, high-leg 18.
- Case-goods/other collection prefixes (first slug token, hyphenated R-codes): plank (68), weatherford (66), kafe (34), hidden (28), cascade (23), elise (17), modern (15), reclamation (12), sunset (10), savona (9), chairsides (9), vista (8), litchfield, jive, hadleigh (6 each), weisman, primo, jenkins, hancock, foundry, emerit, clifton, chastain, aspire (5 each), plus ~90 smaller names (e.g. Cherry, Nash, Kaplan, Halsey, Foster, Donelson, Domain). These are dining/bedroom/table lines (La-Z-Boy case goods); category not individually verified per collection.

### Inferences
- "Outdoor", "kids", "home theater", "rugs" and "pillows" are not top-level departments on the US site map. Home theater is represented through power/wall recliner features and the AudioLuxe landing page.
- The US catalog (1,210 slugs, 272 recliners, 301 sofas/sectionals) is far broader on case goods than the Canadian app, which is upholstery-centric.

### Gaps
- Category counts for chairs, ottomans, loveseats, dining, bedroom, sale, etc. were not fetched.
- storepages.xml not fetched.
- Page text of /content/additions redirected: the scrape of that URL returned the Lamps category page (https://www.la-z-boy.com/b/accessories/lamps), so what "addi+ions" actually is (probably an accessories/add-on program) is unverified.
- Canadian site: https://www.la-z-boy.ca/ failed with an SSL/TLS certificate error in Firecrawl, so its existence is neither confirmed nor ruled out. /ca on la-z-boy.com not tested.

## 2. Which collections/model names exist, compared with the app? (Section B)

### Takeaway
Of 102 upholstery model names in the US product sitemap, 96 are already in the app's 107-name inventory. Only Lakewood (in catalog_data-v2.json only), Hudson, Rigby, Emric and Casey are absent from the app's names and, per grep, absent from public/*.json. Mercury (homepage/best seller) and Addison (homepage) are also absent from the app but are not in the product sitemap.

### Cited Findings
- Names verified missing from /home/user/LAZ-Boy/public/*.json (case-insensitive whole-word grep returned no files):
  - HUDSON — Hudson Power Sofa w/ Power Headrest R-74U918; Hudson Power Loveseat R-78U918 — [sofa slug in sitemap_detail0.xml](https://www.la-z-boy.com/sitemap_detail0.xml) (URL pattern /p/hudson-power-sofa-w-power-headrest/_/R-74U918)
  - RIGBY — Rigby Left Arm Sitting Reclining Loveseat R-44D703 — same sitemap
  - EMRIC — Emric Right Arm Sitting Loveseat R-60E625 — same sitemap
  - CASEY — Casey Rocking Recliner R-010767 — same sitemap
  - MERCURY — Mercury Rocking Recliner R-010795 (homepage and recliner PLP, first-listed best seller, from $34/mo financing) — https://www.la-z-boy.com/p/living-room/recliners/rocking-recliners/mercury-rocking-recliner/R-010795?coverId=C681486 (not in the product sitemap; also not in the app JSON)
  - ADDISON — Addison Gliding Recliner R-017764 — https://www.la-z-boy.com/p/living-room/recliners/gliding-recliners/addison-gliding-recliner/R-017764?coverId=D207119 (homepage only; not in app JSON)
  - DELANO (Delano Big & Tall Executive Leather Office Chair, R-45833-LZB / R-45833B-LZB), NOVA (R-52372-BLK/CBRN), SUTHERLAND (R-44813A-LZB) — online-exclusive office chairs; Delano/Nova/Sutherland are not in the app — [homepage](https://www.la-z-boy.com/)
- LAKEWOOD (Lakewood Power Chair w/ Power Headrest R-71U942; Power 2-Seat Sofa R-73U942) exists only in catalog_data-v2.json in the app, not in the style index or the 107-name inventory (grep result). The app note describes it as a ZMod power sectional from a 2024 tear pad.
- "Harbor" in the sitemap slugs is "Harbor Town" and is already in the app. All other 96 names (e.g. Trouper 39 slugs, James 39, Ava 39, Maddox 30, Palmer 22, Charlie 21, Pinnacle 19, Collins 19, Meyer 15, Liam 15, Finley 15, Morrison 14, Joel, Jay, Greyson, Emmons, Dorian, Cassian, Cade, Brooks, Apollo 14 each, Baron 13, Paxton 11, Acadia 10) are already in the app inventory.
- Named product-line/feature labels on the site: AudioLuxe (Ovation AudioLuxe Power Wall Recliner R-16XA86, https://www.la-z-boy.com/b/audioluxe), Pinnacle Platinum power lift (R-1PH512), Jean Ease Power Lift Recliner (R-3BL793) — [homepage](https://www.la-z-boy.com/)
- Accessory/lamp names (all hyphen codes, 14 total): Braided Floor Lamp, Harrington Pharmacy Floor Lamp, Collette, Baron, Warren, Grey Trace floor lamps; Claire, Bianca, Augustine, Braided, Montreux, Powell, Veronica, Strapped Metal table lamps — [Lamps PLP](https://www.la-z-boy.com/b/accessories/lamps)
- Case-goods collections (not in the app; app is upholstery): Plank, Weatherford (Heather/Cornsilk finishes), Kafe, Hidden, Cascade, Elise, Modern, Reclamation, Sunset, Savona, Vista, Litchfield, Jive, Hadleigh, Weisman, Whitaker, etc. — [sitemap_detail0.xml](https://www.la-z-boy.com/sitemap_detail0.xml)

### Inferences
- The model gap versus the US site is tiny for upholstery; the real gaps are (a) Mercury, Addison, Casey, Hudson, Rigby, Emric, Lakewood and the online-exclusive office chairs and (b) all non-upholstery lines (dining, bedroom, tables, lamps, mirrors, benches, pet beds, office chairs).
- Many US names (e.g. Trouper, Mackenzie) are US-lineup names; the Canada lineup may differ. Treat US-only listing as "may not be sold in Canada" until confirmed (see canada_lineup_research.json). Hudson, Rigby, Emric, Casey, Mercury, Addison, Delano/Nova/Sutherland are US-site items I could not tie to Canada.
- The app 'pdf_vs_app.md' finding (only 47 of 329 available_products PDF codes in the style index) is consistent with a catalog far wider than 102 model names; sitemap model-level coverage is much better than style-code-level coverage.

### Gaps
- I did not verify the style-code-level coverage (the 6-char R-codes vs app styleNumbers), only model names.
- Whether 2026 Pop-up/Premier Comfort-type collections exist as named collection pages was not found; the site uses model-name landing pages (/b/liam, /b/morrison, /b/belmont, /b/cade, /b/trouper) rather than collection names. No "Premier Comfort" or "Pop-up" page appeared in the sitemaps or nav.

## 3. Which non-product resource pages exist and what do they contain? (Section C)

### Takeaway
Resource content is thin on the web (mostly Customer Care, warranty, iClean, swatches, planner, financing, quiz). The Parts & Warranty page is the richest and is mostly already represented in the app's warranty matrix.

### Cited Findings
- Parts & Warranty (https://www.la-z-boy.com/content/CustomerCare/parts-warranty): tells shoppers to call the buying store for parts/service; explains Product ID Tag (ACK/LINE/ITEM, style number, cover number) on underside of furniture; Customer Care phone (855) 802-6636. Warranty tables:
  - Reclining mechanism parts lifetime (Luxury-Lift 2BL styles one year; 1HM/1PH/1PL/1PM/3BL/4LP three years), labor one year; lift mechanism and base three years (2BL one year); sleep sofa mechanism lifetime parts, one year labor; springs lifetime.
  - Frame: metal/swivel/wood bases lifetime; polished silver tone base one year; show wood parts one year; wood frame lifetime with listed exceptions (styles 023456, 023459, 024459, 023466, 024466, 023472, 023495, 023812, 029423, 235472, 235466, 245466, 294523 five years).
  - Electrical parts/motors three years; Luxury-Lift 2BL and SlumberAir electronics one year; lighted cup holder three years.
  - Fabric one year; leather one year; iClean fabric three years (stains only, plus one year for seams/nap loss).
  - Cushions: ComfortCore three years (Plus TEMPUR-Response / Contour five years), ComfortDown five years, Contour three years, standard foam one year, TEMPUR three years.
  - Mattresses: memory foam three years; SlumberAir bladder/mattress five years; Supreme Comfort mattress five years; separate 10-year Mattress Limited Warranty.
  - Misc: battery pack (088BP1, 088BP2) one year, casters lifetime, tablet holder one year.
  - Outdoor furniture (made by Casual Living): frame cast/extruded aluminum five years, steel/wrought iron one year, Sunbrella/Outdura acrylic five years, wood three years.
  - Office furniture (True Innovations): ten years, upholstery/foam one year, 125 kg / 275 lb limit.
  - Pet beds (Petmate): 30-day returns.
  - Governed by Michigan law, binding AAA arbitration.
- Customer Care hub pages listed on the sitemap: Contact Us, FAQs, Customer Care Videos, Product Manuals, Warranty, Fabric & Leather Care, iClean Recommended Cleaning Methods, iClean Warranty, Performance Fabric Patterns & Care — [Sitemap page](https://www.la-z-boy.com/site-map). Contents of all except Parts & Warranty were not fetched.
- 3D Room Planner (https://www.la-z-boy.com/content/Room-Planner-3D): page loads but the planner itself is a client-side embed; no text content captured (title "3D Room Planner | La-Z-Boy").
- Design Services: "FREE Design Services… start with a consultation" with appointment request form at /design-services/request — [any page header](https://www.la-z-boy.com/design-services)
- Financing: "or $X/mo. with 12 mo. financing" shown on PLPs; disclosures at https://www.la-z-boy.com/content/financing-disclosures — [Recliners PLP](https://www.la-z-boy.com/b/living-room/recliners)
- Free Swatches: https://www.la-z-boy.com/content/free-swatches; Recliner Quiz: https://www.la-z-boy.com/forms/recliner-quiz (not fetched).
- Product pages show cover counts ("+594 More" colors on Liam Rocking Recliner; "+664" on Scarlett High Leg and Dutton) — [Recliners PLP](https://www.la-z-boy.com/b/living-room/recliners)

### Inferences
- No blog, inspiration, glossary, buying guide or measuring-guide pages were found on the US site map; the app's glossary and guides are richer than the web site's.
- Priority deep-crawl URLs for other researchers: (1) product detail pages for the 7 missing names (Mercury, Addison, Casey, Hudson, Rigby, Emric, Lakewood); (2) /content/CustomerCare/fabric-and-leather-care, /iclean-cleaning, /iclean-warranty, /performance-fabric-patterns-care, /FAQs, /productmanuals (manual PDFs per style), /customer-care-videos; (3) /content/free-swatches and /forms/recliner-quiz; (4) /b/audioluxe and /content/recliners; (5) /content/financing and /content/financing-disclosures; (6) /content/policies/return-policy; (7) /b/sectional-pieces for modular-piece names.

### Gaps
- Pages not fetched: all Customer Care pages other than warranty, quiz, swatches, financing, return policy, /content/recliners, /b/audioluxe.
- The warranty text was not diffed field-by-field against warranty_matrix in sales-reference-library-2026.json.

## 4. Features/ideas for the app (Section D)

### Takeaway
Ideas below are my suggestions from the observed site; none are confirmed requirements.

### Cited Findings
- The site exposes "In-stock" recliners (`store.filters=st_availText:"In-stock"`, plus "-in-stock" product slugs: 419 of 1,629 sitemap URLs) and store-specific pricing/hours — [Recliners PLP](https://www.la-z-boy.com/b/living-room/recliners)
- Product naming convention: "<Model> <Mechanism/Type> [w/ Headrest & Lumbar]" with power variants given distinct R-codes (e.g. Liam R-010786 manual, R-10X786 power w/ headrest & lumbar), and modular sectional pieces as separate slugs (left/right arm sitting, armless, corner, console) — [sitemap_detail0.xml](https://www.la-z-boy.com/sitemap_detail0.xml)

### Inferences
- Add the missing names (Mercury, Addison, Casey, Hudson, Rigby, Emric, Lakewood) as "US-only / verify for Canada" entries, with a flag field.
- Mirror the site's R-code prefixes for power variants (10X = rocking power w/ headrest+lumbar, 10U = power headrest, 16X = power wall w/ headrest+lumbar, 1PH = lift) as a power-variant decoder in the style-number lookup; this matches the codes in the sitemap (my pattern reading, not stated by the site).
- Surface a Product ID Tag helper (ACK/Style/Cover locations) from the warranty page for service calls.
- Add office chairs, lamps, benches and pet beds to accessories only if the Canadian line sells them (unverified).

### Gaps
- Canada availability of every US-only item is unknown; lazboy.ca could not be reached (TLS error) and /ca was not tested.
