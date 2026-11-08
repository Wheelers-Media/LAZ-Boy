# stylemeetscomfort.ca (La-Z-Boy Ottawa, Gatineau & Kingston dealer): complete Learning Center index, service/policy pages and gap analysis vs the LAZ-Boy app

Scope and caveats. All content is from one independent, Canadian-owned dealer group (stores: Cyrville, Hunt Club, Kanata, Kingston, Gatineau). It is NOT corporate La-Z-Boy Canada policy. Prices are CAD, "starting at", dated by the dealer, and subject to change. Fetched 2026-11-08 with Firecrawl (maxAge 0 for index pages; article pages fetched fresh, cacheState "miss"). Direct curl to the site failed (proxy), Firecrawl worked for every URL. App check = case-insensitive grep over /home/user/LAZ-Boy/public/*.json (terms and results listed per item). I did not re-read articles already covered in recliners_buyers_guide.md and lift_chairs_article.md. Another researcher covers fabrics/leather/care/battery/controls/rocker-glider/swivel/wall/high-leg/Duo and model reviews, so those were indexed only.

Method for the index: https://www.stylemeetscomfort.ca/learning-center/page/N is the working pagination (10 articles per page). Pages 1 to 37 return articles; /page/38 and /page/40 return HTTP 404. So the index holds 370 articles (37 pages x 10). The `?page=N` form was not tested (the /page/N form is canonical on this HubSpot blog). Tag pages exist (recliner, sofa, loveseat, sectional-sofa, accent-chair, lift-chair, home-decor, fabric, leather, la-z-boy-furniture, dining-furniture, before-afters) but they are filters over the same 370 articles, so I did not enumerate them. A French mirror exists at /fr-ca/learning-center/...

---

## (A) NEW to the app (grep-verified absent in /public/*.json unless noted)

### A1. Delivery, pick-up, removal (dealer-specific, Ottawa/Gatineau/Kingston)
- Delivery fees: in-town (Ottawa, Gatineau, Kingston) $129.99; out-of-town starting at $169.99 depending on area and distance. [Delivery/Pick-ups](https://www.stylemeetscomfort.ca/delivery-pick-ups/), [Shipping & Return Policy](https://www.stylemeetscomfort.ca/shipping-and-return-policy). Grep "129.99", "white glove": no hits.
- What delivery includes: 48-hour confirmation call; 24-hour call with a 2-hour window; online truck tracking; stairs to second floor included; unpack, inspect, set up (including power chairs and sofas), test operation and walk the customer through it; photos taken on every delivery for quality assurance; warehouse pick-up by appointment. [Delivery/Pick-ups](https://www.stylemeetscomfort.ca/delivery-pick-ups/)
- Delivery days and timing: "La-Z-Boy delivers Tuesday through Saturday"; after the item is in the warehouse, delivery is typically scheduled within about 7 to 10 business days (longer in peak periods); delivery window for the date is given 2 days before delivery; a responsible adult must be home. Schedule online or by email delivery@lzb.ca. [Delivery/Pick-ups](https://www.stylemeetscomfort.ca/delivery-pick-ups/)
- Pick-up: warehouse at 1750 Cyrville Rd by appointment, minimum 48 hours' notice; warehouse staff help load; buyer secures the load and owns any damage after loading; store pick-up also possible but store staff cannot help load. [Delivery/Pick-ups](https://www.stylemeetscomfort.ca/delivery-pick-ups/)
- Pre-delivery inspection process: every order goes to the Cyrville warehouse where it is unpacked, assembled and tested; each item is inspected twice (on arrival and about 2 days before delivery); stock items found faulty may be swapped for an identical piece, custom orders may go back to the manufacturer for repair. Delivery crew does a walkthrough of doorways, hallways and stairs first; transport damage is documented and the service department contacts the customer within 48 to 72 hours. [Delivery day](https://www.stylemeetscomfort.ca/learning-center/furniture-delivery-services)
- Old-furniture services (current prices): disposal $75 per seat plus tax (chair $75, 2-seat sofa $100, 3-seat sofa $150, sofa bed $200, sectionals priced per seat); in-home move to another room $50 per seat plus tax. Not accepted: appliances, pianos, mattresses, box springs, hazardous materials. [Delivery/Pick-ups](https://www.stylemeetscomfort.ca/delivery-pick-ups/) (see conflict C1 for older figures)
- Delivery readiness checklist: measured space, clear entrances of breakables, clear snow and ice from sidewalks/driveways, secure pets, remove trip hazards, book condo/apartment elevator for delivery time. [Delivery/Pick-ups](https://www.stylemeetscomfort.ca/delivery-pick-ups/)
- Service to retirement residences, long-term care and apartments: white-glove delivery with in-room setup, coordination with building staff, follows facility health protocols; extra fee outside central Ottawa/Gatineau/Kingston. [Seniors article](https://www.stylemeetscomfort.ca/learning-center/elderly-person-mobility-issues)
- Tipping: optional, appreciated, never expected. [Delivery day FAQ](https://www.stylemeetscomfort.ca/learning-center/furniture-delivery-services)

### A2. Order terms, returns and cancellation (dealer policy)
- Custom orders: "approximately 12 weeks" to manufacture and ship to the distribution centre; 50% deposit at order; cannot be cancelled once placed; manufacturing delays are not grounds for return, exchange or compensation. Custom and clearance items are not returnable or cancellable. [Shipping & Return Policy](https://www.stylemeetscomfort.ca/shipping-and-return-policy). Grep "12 weeks", "deposit": no hits.
- Stock orders: 48-hour cancellation window from purchase; at the dealer's discretion a 20% restocking fee applies and the balance is given as in-store credit; stock = items La-Z-Boy defines as core inventory; proof of purchase and as-received condition required; inspection before refund; service, finance and delivery fees non-refundable; pick-up charge if the dealer collects the return. Refunds go to the original tender; cash purchases are refunded by company cheque, about 4 weeks, no cash refunds; "Final Sale" items not returnable. [Shipping & Return Policy](https://www.stylemeetscomfort.ca/shipping-and-return-policy). Grep "restocking": no hits.
- Delivery damage claims must be made within 24 hours of receipt (report to delivery@lzb.ca), after which the goods are deemed received free from damage. [Shipping & Return Policy](https://www.stylemeetscomfort.ca/shipping-and-return-policy)
- No-fit delivery: handled case by case; re-selection or return usually involves a restocking fee plus extra delivery charges; crews may remove doors from hinges. [No-fit article](https://www.stylemeetscomfort.ca/learning-center/avoiding-no-fit-delivery)

### A3. Dealer 5-Year Protection Plan (price table is new; the concept was in recliners_buyers_guide.md)
- Exclusive to Ottawa, Gatineau and Kingston locations; starts on delivery day; covers accidental damage on fabric and leather (frame breakage, mechanical failure, food/beverage stains, rips/tears/punctures, electrical malfunction, colour transfer), plus seam separation, sleeper mattresses and power electrical; wood furniture: stains only (per table). [Protection plan](https://www.stylemeetscomfort.ca/learning-center/furniture-protection-plan)
- Exclusions: normal wear and tear, abuse/improper use, fading/stretching, pet and body-oil damage, unapproved cleaners, environmental damage/disasters. [Protection plan](https://www.stylemeetscomfort.ca/learning-center/furniture-protection-plan)
- Price by furniture price: $0-299 = $59; $300-449 = $79; $450-599 = $99; $600-700 = $119; $701-1,000 = $149; $1,001-1,500 = $189; $1,501-2,000 = $209; $2,001-2,500 = $239; $2,501-3,000 = $289; $3,001-4,000 = $379; $4,001-5,000 = $459; $5,001-6,000 = $549; $6,001-8,000 = $699; $8,001+ = 9% of sale price (manual frames) or 10% (power frames). Exact price confirmed in store. [Protection plan](https://www.stylemeetscomfort.ca/learning-center/furniture-protection-plan). Grep "protection plan": no hits.
- If a covered item cannot be repaired: store credit equal to original purchase price (also usable toward a replacement if discontinued). If no claims in 5 years: 100% of plan cost back as store credit, usable on a future purchase worth at least double the credit before tax. [Protection plan](https://www.stylemeetscomfort.ca/learning-center/furniture-protection-plan)

### A4. Service department process
- Ticket process: visit a showroom or submit the online service form; include name, contact, address, ACK number, a description (what, when, where on the unit); first update typically within a few business days; photos or video may be requested; technician visit when needed; service acts as liaison with the manufacturer; part approvals about a week, whole cycle "usually" about four weeks without delays; high call volume may extend times. Reupholstery is outside the dealer's service scope (third-party referrals); out-of-warranty fixes cost money; cushion compression is a common request; many mechanisms/frames remain serviceable even if a fabric is discontinued. [Service department](https://www.stylemeetscomfort.ca/learning-center/service-department). Grep "service ticket": not searched separately; "ACK" hits are substring noise ("back"), so treat the service-ticket workflow as new.
- Where to find the ACK number (tags under/behind furniture or on sales documents). [Service department FAQ](https://www.stylemeetscomfort.ca/learning-center/service-department); article exists at [find-ack-number-on-la-z-boy-furniture](https://www.stylemeetscomfort.ca/learning-center/find-ack-number-on-la-z-boy-furniture) (not read). The corporate warranty page (per sitemap_structure.md) calls this the Product ID Tag with ACK/LINE/ITEM.

### A5. Financing (Flexiti term details are new; Flexiti itself was in recliners_buyers_guide.md)
- Flexiti plan types at this dealer: equal monthly payments in 12 or 24 month terms (start once delivery is booked); deferred payment plans starting 3, 6 or 12 months after delivery; applies to in-stock and custom purchases; online or in-store application (government photo ID); reusable credit line; 8,000+ participating retailers; 25-day grace period before interest on the first payment; upfront admin fee (varies by plan) and a deposit on the tax portion; early payoff with no penalty; refunds go back to the Flexiti account in a few business days, admin fee may not be refunded. [Flexiti article](https://www.stylemeetscomfort.ca/learning-center/flexiti-financing)
- Quebec residents: even in deferred periods a minimum payment of 5% of the balance; Flexiti waives its own admin fee in Quebec but the store's admin fee still applies; some plans carry an annual fee. [Flexiti article](https://www.stylemeetscomfort.ca/learning-center/flexiti-financing). Grep "Quebec", "Flexiti": no hits.
- Generic: dealer says lenders commonly want ID, proof of income and a credit check, typical approval around 600+ credit score (generic claim, not Flexiti-specific); Flexiti is also used at Leon's and The Brick, Fairstone at Dufresne/Bennett's/Valley Squire, PayBright at Wayfair/Mobilia. [Furniture financing](https://www.stylemeetscomfort.ca/learning-center/furniture-financing)

### A6. Room measuring and delivery-fit (the app has Room Builder/floorplan but no "does it fit through the door" content: grep "diagonal depth", "elevator": no hits)
- Furniture dimensions: width (arm to arm), depth (seat front to frame back), height (floor to top), diagonal depth. Diagonal depth method: straight edge from the top back corner of the frame to the front of the arm, then measure from the bottom rear corner to the straight edge. Check whether listed sizes are the furniture or the packaged size. If diagonal depth is less than the doorway height, the piece can usually pass when angled. [Measure a room](https://www.stylemeetscomfort.ca/learning-center/how-to-measure-a-room-for-furniture), [No-fit](https://www.stylemeetscomfort.ca/learning-center/avoiding-no-fit-delivery)
- Door measurements to record: width and height with and without trim, diagonal depth excluding frame, hinges/knobs/door swing, stairs (bottom entry, step width, stairwell diagonal), elevators (interior H/W/D plus door opening; service elevator booking), tight corners (width and depth must be smaller than the distance from the corner edge to the parallel wall). Clearance rule in FAQ: 30 to 36 inches of walking clearance, more for reclining furniture. Entry rule: if doorway clearance exceeds piece width it moves flat; otherwise it must tilt vertically and the entry height must exceed the piece width. Also note ceiling fans, radiators, fireplaces, handrails, outlets, vents. A sketch takes 20 to 30 minutes. Tools: 25 ft tape, laser measure, helper. [Measure a room](https://www.stylemeetscomfort.ca/learning-center/how-to-measure-a-room-for-furniture), [No-fit](https://www.stylemeetscomfort.ca/learning-center/avoiding-no-fit-delivery)
- Modular sectional pieces and removable recliner backs help narrow entries. [No-fit](https://www.stylemeetscomfort.ca/learning-center/avoiding-no-fit-delivery)

### A7. Sleeper sofas (some mattress names exist in the app: "Supreme Comfort", "SlumberAir", "Slumber Air" hit; the numbers below did not appear in grep)
- Three sleeper mattresses: Supreme Comfort (standard) 5.5 inch quilted innerspring, medium-firm; Slumber Air = 4 inch innerspring base plus inflatable air cushion that expands up to 6 inches, pump access top right of the mattress with a cover; Firm Mattress = newest, high-resiliency memory foam. [Sofa bed mattress review](https://www.stylemeetscomfort.ca/learning-center/review-sofa-bed-mattress)
- Sizes: Twin sleeper chair (avg width 39 in; mattress 71.5 x 32 x 5.5 in), Full sleeper sofa (avg width 54 in; 71.5 x 52 x 5.5 in), Queen sleeper sofa (avg width 60 in; 71.5 x 60 x 5.5 in); sleeper modules only on select sectionals. [Sofa bed mattress review](https://www.stylemeetscomfort.ca/learning-center/review-sofa-bed-mattress)
- Dealer price anchors (updated May 28, 2026): average starting cost Twin chair $3,279, Full $3,784, Queen $4,116; mattress upgrades Slumber Air +$800, Firm +$1,000, Supreme Comfort included. [Sofa bed mattress review](https://www.stylemeetscomfort.ca/learning-center/review-sofa-bed-mattress)
- Warranty note: dealer says the Limited Lifetime Warranty covers the mattress against foam splitting in half; other mattress aspects have time-limited manufacturer coverage. [Sofa bed mattress review](https://www.stylemeetscomfort.ca/learning-center/review-sofa-bed-mattress) (conflict C4)
- Sectional sleeper upgrade: Full or Queen, 5.5 inch quilted innerspring, upgradable to Slumber Air or firmer. [Sectional guide](https://www.stylemeetscomfort.ca/learning-center/sectional-buyers-guide)

### A8. Sectional guide facts
- Shapes (L, U/C, chaise, curved, modular), room-size mapping, "tape out the footprint with painter's tape", felt pads for floors. [Sectional guide](https://www.stylemeetscomfort.ca/learning-center/sectional-buyers-guide)
- Height-based frame sizing: Petite under 5'4"; Medium 5'4" to 5'9"; Large 5'10" to 6'2"; Extra Tall over 6'2". Grep "5'4", "6'2", "petite": only "petite" appears in canada_lineup_research.json; the height bands are not in the app. [Sectional guide](https://www.stylemeetscomfort.ca/learning-center/sectional-buyers-guide)
- Dealer's four style collections: Classics Revisited, Modern Retreat, Family Favourites, Comfortably Casual (only "Comfortably Casual" is in catalog_data-v2.json). [Sectional guide](https://www.stylemeetscomfort.ca/learning-center/sectional-buyers-guide)
- Over 800 upholstery options with a grade system affecting price; specialty covers listed (performance, iClean, conserve eco, antimicrobial, pet-friendly, Restore by Nanobionic, bleach cleanable). Power upgrade: headrest 0 to 55 degrees, lumbar, USB ports, memory settings, cordless with battery pack. Zero-gravity sectionals (example Armitage) power only and need more clearance behind. [Sectional guide](https://www.stylemeetscomfort.ca/learning-center/sectional-buyers-guide)
- Dealer price anchor: sectionals "typically start at $3,500" (key takeaways) but "around $3,000" (cost section) in the same article. [Sectional guide](https://www.stylemeetscomfort.ca/learning-center/sectional-buyers-guide)
- Dealer claims: over 25 years in business, over 200,000 families. [Sectional guide](https://www.stylemeetscomfort.ca/learning-center/sectional-buyers-guide)

### A9. Petite sizing (recliner)
- Under 5'4" benefits most from small proportions; Pinnacle suits 5'4" to 5'9". Dealer-listed dimensions (inches): Pinnacle body D38.5 H41 W33, seat D21.5 H18.5 W19, weight rocker/wall/glider 71/78/105 lb; Harbor Town body D37 H41 W30, seat D19.5 H19 W23, weight 73/80 lb; Jasper body D38.5 H42 W40, seat D20 H20 W21.5, 76/83 lb; Vail body D36 H40.5 W32, seat D19.5 H18 W17.5, 70/73 lb; Reed body D37.5 H40.5 W36, seat D21 H19 W19, 76/80 lb. [Short people](https://www.stylemeetscomfort.ca/learning-center/recliners-for-short-people). These are dealer-published and should be checked against the app's recliner-catalog-2026.json dimensions (not diffed here; Harbor Town "seat width 23" vs Vail "seat width 17.5" look inconsistent as seat widths, so verify before using).

### A10. Aging in place and accessibility (store experience)
- All showrooms wheelchair accessible; accessible restrooms; a wheelchair available at each location; private appointments in non-peak hours for quieter visits; customers may stay seated; consultants trained to assess mobility needs; Kingston keeps lift chairs near the entrance. [Seniors article](https://www.stylemeetscomfort.ca/learning-center/elderly-person-mobility-issues)
- Senior-friendly criteria: seat height giving 90-degree knees with feet flat, firm cushions, strong armrests; recommended: lift recliners, power recliners (battery packs allow off-wall placement), firm stationary pieces (Kennedy, Mackenzie, Piper, Meyer named); caution: swivel chairs (balance), manual and high-leg recliners (effort, hidden mechanism). Bring walker/cane to the showroom. [Seniors article](https://www.stylemeetscomfort.ca/learning-center/elderly-person-mobility-issues)

### A11. Store directory and contact (dealer)
- Hunt Club: 290 West Hunt Club Road, Ottawa ON K2E 0B7, 613-228-0100. Cyrville: 1750 Cyrville Road, Ottawa ON K1B 3L8, 613-749-0001. Kanata: 8231 Campeau Drive, Ottawa ON K2T 1B7, 613-834-3343 (also a Canadel Dining store at the same address). Kingston: 770 Gardiners Road Unit 3, Kingston ON K7M 0A2, 613-389-0600. Gatineau: 920 Maloney Boulevard West, Unit 6, Gatineau QC J8T 3R6, 819-243-2301. Toll-free for all: 1-866-684-0561. [Locations](https://www.stylemeetscomfort.ca/locations). Grep "Cyrville", "wheelchair": no hits.

### A12. Other topics seen in the index but NOT read (titles only; see D)
Dealer-sold non-La-Z-Boy lines (Canadel dining, Kincaid, Hammary, American Drew, Surya and Feizy rugs), CHEO/Minto Dream Home sponsorship, retailer comparison posts (Leon's, The Brick, Ashley, Costco, etc.), and local design stories. Mostly marketing; low value for the app.

---

## (B) Already in the app (no action)
- Lift chair tax rules and Flexiti mention: covered in lift_chairs_article.md and recliners_buyers_guide.md (not repeated).
- Mattress product names Supreme Comfort and Slumber Air exist in sales-reference-library-2026.json, mechanism-guide-2026.json, glossary-2026.json, stationary-catalog-2026.json and catalog_data*.json; Duo, battery, iClean and cover specialty names are in the app (covered by the other researcher).
- Lifetime-frame/limited-component warranty concept is in sales-reference-library-2026.json warranty_matrix (corporate). Dealer statements below differ in detail (C4).
- 71.5 inch sleeper mattress length string appears in mechanism-guide-2026.json, motion-catalog-2026.json, style-index-2026.json and swatch-manifest.json (not verified that it is the same mattress dimension; treat the Twin/Full/Queen widths 32/52/60 as unverified in the app).

## (C) Conflicts and internal inconsistencies (resolve before using any as a rule)
- C1. Old-furniture move/disposal fees. Sectional guide (Oct 14, 2025) and recliner guide: $25 per item to move or curbside, $50 per seat to haul to a landfill. [Sectional guide](https://www.stylemeetscomfort.ca/learning-center/sectional-buyers-guide). No-fit article (Sep 18, 2025): $50 per piece to move, $75 per seat disposal. [No-fit](https://www.stylemeetscomfort.ca/learning-center/avoiding-no-fit-delivery). Current delivery page: move $50 per seat, disposal $75 per seat plus tax. [Delivery page](https://www.stylemeetscomfort.ca/delivery-pick-ups/). Take the delivery page as the latest, but mark unverified and store-specific.
- C2. Financing terms. Sectional guide and recliner guide: "0% interest for up to 36 months with equal monthly payments". [Sectional guide](https://www.stylemeetscomfort.ca/learning-center/sectional-buyers-guide). Flexiti article: equal-payment terms of 12 or 24 months and deferred starts of 3, 6 or 12 months. [Flexiti](https://www.stylemeetscomfort.ca/learning-center/flexiti-financing). 36 months is not described anywhere in the dedicated Flexiti article. Confirm per store and per promotion.
- C3. Delivery area and days. Policy page: delivery "only within Ottawa, Gatineau and Kingston, Ontario", yet it also lists out-of-town delivery at $169.99. [Policy](https://www.stylemeetscomfort.ca/shipping-and-return-policy). Delivery page says "Tuesday through Saturday" but its map legend lists Sunday and Monday areas (map dated April 2020). [Delivery page](https://www.stylemeetscomfort.ca/delivery-pick-ups/).
- C4. Warranty wording. Policy: frame lifetime, most parts 1 to 3 years, covers (fabric and leather) 1 year, labour 1 year. [Policy](https://www.stylemeetscomfort.ca/shipping-and-return-policy). Delivery article: Limited Lifetime covers "core components such as frames and mechanisms". [Delivery day](https://www.stylemeetscomfort.ca/learning-center/furniture-delivery-services). Sofa bed article: Limited Lifetime includes the mattress against foam splitting. [Mattress review](https://www.stylemeetscomfort.ca/learning-center/review-sofa-bed-mattress). The corporate page in sitemap_structure.md lists mattress warranties (Supreme Comfort 5 years, SlumberAir 5 years, memory foam 3 years) and fabric/leather 1 year. Treat the corporate matrix as authoritative and the dealer text as marketing paraphrase.
- C5. Lead time. Policy: custom orders "approximately 12 weeks". recliners_buyers_guide.md (from how-long-custom-furniture-build) gives recliners 6 to 10 weeks. Likely different product classes; confirm.
- C6. Sectional starting price inside one article: $3,500 vs $3,000 (A8).
- C7. Delivery support claim windows: policy says damage claims within 24 hours; delivery article says service contacts the customer 48 to 72 hours after documented damage. Not a true conflict (reporting window vs follow-up) but do not merge them.
- C8. Light data-quality notes: policy page browser title says "Privacy Policy"; pick-up wording on the delivery page says buyer secures loads; the Pinnacle petite article lists seat width values that look inconsistent across models (A9).

## (D) Complete article inventory (370 articles; pages 1 to 37 of /learning-center/page/N)

All URLs are https://www.stylemeetscomfort.ca/learning-center/<slug>. Format: date | slug | title. R = read in full this session (R*) or in an earlier note (R-prev); I = indexed only (title and snippet seen, not opened). Pages 34 to 37 were fetched as link lists only, so their titles are slug-derived (marked "~") and dates are missing (they predate June 2025; page 35 elderly article is dated April 19, 2025 on its own page).

Page 1
- 2026-09-15 | the-2026-minto-dream-home-for-cheo-furnished-by-la-z-boy | The 2026 CHEO Dream Home: Furnished by La-Z-Boy | I
- 2026-09-15 | 2026-minto-dream-home-catalogue | A Catalogue of the 2026 Minto Dream Home | I
- 2026-07-22 | review-ace-recliner | Review of the La-Z-Boy Ace Recliner: Rocking & Wall Recliner | I
- 2026-07-18 | how-long-custom-furniture-build | How Long Does Custom Furniture Take? Understanding Furniture Lead Times | R-prev
- 2026-07-17 | attachable-vs.-detachable-cushions | Attached vs. Detached Cushions: Which Sofa Cushion Type Is Better? | I
- 2026-07-16 | pet-friendly-fabric-review | La-Z-Boy Pet-Friendly Fabric Review: Is It Worth It for Homes With Pets? | I
- 2026-07-15 | will-ai-replace-interior-designers | Will AI Replace Interior Designers? Comparing AI Tools and Human Expertise | I
- 2026-07-14 | review-opal-swivel-chair | Review of the La-Z-Boy Opal Swivel Chair & a Half | I
- 2026-07-13 | ronald-mcdonald-ottawa | Supporting Families During Hard Times: La-Z-Boy Furnishes Ronald McDonald House in Ottawa | I
- 2026-07-12 | review-summit-series | Review of La-Z-Boy's Summit Series: Oversized Recliners at La-Z-Boy | R-prev

Page 2
- 2026-07-11 | best-chairs-back-pain | 5 Best La-Z-Boy Chairs for Back Pain: Recliners & Accent Chairs Reviewed | I
- 2026-07-10 | review-cassian-furniture-family | Review of the La-Z-Boy Cassian Furniture Family: Recliner, Loveseat & Sofa | I
- 2026-07-09 | area-rug-selection | Area Rugs at La-Z-Boy: Surya vs. Feizy, Costs, Styles & How to Choose the Right Rug | I
- 2026-07-08 | review-cade-furniture-family | Review of the La-Z-Boy Cade Furniture Family: Recliner, Loveseat & Sofa | I
- 2026-07-07 | sofa-vs.-couch | Sofa vs. Couch: Is There Actually a Difference? | I
- 2026-07-06 | review-armitage-sectional | Review of the La-Z-Boy Armitage Furniture Family: Chair and a Half & Sectional | I
- 2026-07-05 | how-to-furnish-a-home-in-gatineau | How to Furnish a Home in Gatineau: Home Design Trends, Furniture Styles, and Ideas for Modern Quebec Living | I
- 2026-07-04 | review-acadia-furniture-family | Review of the La-Z-Boy Acadia Furniture Family: Recliner, Loveseat, Sofa & Sectional | I
- 2026-07-03 | how-to-furnish-a-home-in-kingston-furniture | How to Furnish a Home in Kingston: Furniture & Design Tips for Heritage Homes, Waterfront Properties, and Modern Builds | I
- 2026-07-02 | review-quinault-furniture-family | Review of the La-Z-Boy Quinault Furniture Family: Recliner, Loveseat & Sofa | I

Page 3
- 2026-07-01 | how-to-furnish-a-home-in-ottawa | How to Furnish a Home in Ottawa: Expert Furniture Tips for Condos, Townhomes & Family Homes | I
- 2026-06-30 | review-of-la-z-boys-olson-furniture-family-chair-and-a-half-sofa | Review of the La-Z-Boy Olson Furniture Family: Chair and a Half & Sofa | I
- 2026-06-28 | chairs-vs-benches | Dining Bench vs. Dining Chairs: Which Is Better for Your Home? | I
- 2026-06-28 | furniture-buying-guide | Questions to Ask Yourself When Buying La-Z-Boy Furniture | I
- 2026-06-27 | review-maddox-sectional | Review of the La-Z-Boy Maddox Furniture Family: Recliner, Chair & a Half, Sofa & Sectional | I
- 2026-06-26 | review-swivel-power-recliners | Are La-Z-Boy Power Swivel Recliners Worth It? Features, Cost & Buying Guide | I
- 2026-06-25 | review-apollo-furniture-family | Review of the La-Z-Boy Apollo Furniture Family: Recliner, Loveseat & Sofa | I
- 2026-06-24 | heat-massage-upgrade-la-z-boy | Is the La-Z-Boy Heat & Massage Upgrade Worth It? Review, Cost & Benefits | I
- 2026-06-23 | review-dante-chair | Review of the La-Z-Boy Dante High-Leg Recliner | I
- 2026-06-22 | best-selling-recliners | Best-Selling La-Z-Boy Recliners in Ottawa, Gatineau & Kingston | I

Page 4
- 2026-06-21 | review-neo-power-recliner | Review of the La-Z-Boy Neo Power Recliner: Rocking & Wall Recliner | I
- 2026-06-20 | review-sofa-bed-mattress | Review of La-Z-Boy Sofa Bed Mattresses: Supreme Comfort, Slumber Air & Firm Options | R*
- 2026-06-19 | review-ava-furniture-family | Review of the La-Z-Boy Ava Furniture Family: Recliner, Loveseat, Sofa & Sectional | I
- 2026-06-18 | small-la-z-boy-sofas | Best Small La-Z-Boy Sofas for Condos & Apartments in Ottawa, Gatineau & Kingston | I
- 2026-06-17 | review-baron-furniture-family | Review of the La-Z-Boy Baron Furniture Family: Recliner, Loveseat & Sofa | I
- 2026-06-16 | best-selling-la-z-boy-ottomans | Best-Selling La-Z-Boy Ottomans in Ottawa, Gatineau & Kingston | I
- 2026-06-15 | review-alma-chair | Review of the La-Z-Boy Alma Swivel Gliding Chair | I
- 2026-06-14 | review-kells-recliner | Review of the La-Z-Boy Kells Recliner: Rocking & Wall Recliner | I
- 2026-06-13 | review-wilmette-furniture-family | Review of the La-Z-Boy Wilmette Furniture Family: Chair & a Half, Sofa & Sectional | I
- 2026-06-12 | review-kimberly-high-leg-recliner | Review of the La-Z-Boy Kimberly High-Leg Recliner | I

Page 5
- 2026-06-11 | review-brentwood-recliner | Review of the La-Z-Boy Brentwood High-Leg Recliner | I
- 2026-06-10 | review-redwood-recliner | Review of the La-Z-Boy Redwood Recliner: Rocking & Wall Recliner | I
- 2026-06-09 | review-jasper-recliner | Review of the La-Z-Boy Jasper Recliner: Rocking & Wall Recliner | I
- 2026-06-07 | review-collage-recliner | Review of the La-Z-Boy Collage Recliner: Rocking & Wall Recliner | I
- 2026-06-06 | review-liam-furniture-family | Review of the La-Z-Boy Liam Furniture Family: Recliner, Loveseat & Sofa | I
- 2026-06-05 | la-z-boy-design-stories-riverside-south-ottawa | La-Z-Boy Design Stories: Living Room Makeover in Riverside South, Ottawa | I
- 2026-06-04 | review-joel-furniture-family | Review of the La-Z-Boy Joel Furniture Family: Recliner, Loveseat & Sofa | I
- 2026-06-03 | review-fletcher | Review of the La-Z-Boy Fletcher High-Leg Recliner | I
- 2026-06-02 | review-dora-chair | Review of the La-Z-Boy Dora Swivel Gliding Chair | I
- 2026-06-01 | review-charlotte-chair | Review of the La-Z-Boy Charlotte High-Leg Recliner | I

Page 6
- 2026-05-29 | review-natalie-furniture-family | Review of La-Z-Boy's Natalie Furniture Family: Chair, Loveseat & Sofa | I
- 2026-05-28 | review-midtown-chair | Review of the La-Z-Boy Midtown Swivel Gliding Chair | I
- 2026-05-27 | review-jean-lift-recliner | Review of the La-Z-Boy Jean Power Lift Recliner | I (lift: other researcher)
- 2026-05-26 | review-vail-recliner | Review of the La-Z-Boy Vail Recliner: Rocking & Wall Recliner | I
- 2026-05-25 | review-colby-furniture-family | Review of the La-Z-Boy Colby Furniture Family: Chair, Loveseat & Sofa | I
- 2026-05-24 | review-scarlett-recliner | Review of the La-Z-Boy Scarlett High-Leg Recliner | I
- 2026-05-23 | review-reed-recliner | Review of the La-Z-Boy Reed Recliner: Rocking & Wall Recliner | I
- 2026-05-22 | review-mackenzie-furniture-family | Review of the La-Z-Boy Mackenzie Furniture Family: Chair, Loveseat, Sofa & Sleeper | I
- 2026-05-21 | review-rheeves-recliner | Review of the La-Z-Boy Rheeves High-Leg Recliner | I
- 2026-05-20 | review-kennedy-furniture-family | Review of La-Z-Boy's Kennedy Furniture Family: Chair, Loveseat & Sofa | I

Page 7
- 2026-05-19 | review-roman-recliner | Review of the La-Z-Boy Roman Furniture Family: Chair & a Half & 2-Seater Sofa | I
- 2026-05-18 | review-piper-furniture | Review of La-Z-Boy's Piper Furniture Family: Loveseat & Sofa | I
- 2026-05-17 | review-eldorado-recliner | Review of the La-Z-Boy Eldorado High-Leg Recliner | I
- 2026-05-16 | haven-review | Review of the La-Z-Boy Haven High-Leg Recliner | I
- 2026-05-15 | morrison-furniture-family-review | Review of La-Z-Boy's Morrison Furniture Family: Recliner, Loveseat & Sofa | I
- 2026-05-14 | la-z-boy-jay-furniture-review | Review of La-Z-Boy's Jay Furniture Family: Recliner, Loveseat & Sofa | I
- 2026-05-13 | laurel-furniture-review | Review of La-Z-Boy's Laurel Furniture Family: Chair and a Half & Sofa | I
- 2026-05-12 | la-z-boy-clayton-lift-recliner-review | Review of the La-Z-Boy Clayton Gold Lift Recliner | R-prev (lift note)
- 2026-05-11 | riley-high-leg-recliner-review | Review of the La-Z-Boy Riley High-Leg Recliner | I
- 2026-05-10 | review-la-z-boy-joshua-recliner | Review of the La-Z-Boy Joshua Recliner: Rocking & Wall Recliner | I

Page 8
- 2026-05-09 | greyson-furniture-review | Review of La-Z-Boy's Greyson Furniture Family: Recliner, Loveseat & Sofa | I
- 2026-05-08 | la-z-boy-bellevue-high-leg-swivel-chair-review | Review of the La-Z-Boy Bellevue High-Leg Swivel Accent Chair | I
- 2026-05-07 | custom-furniture-at-la-z-boy-what-to-expect | Custom Furniture at La-Z-Boy vs. Other Furniture Stores: Which is Better for You? | I (HIGH priority for follow-up)
- 2026-05-06 | find-ack-number-on-la-z-boy-furniture | Where to Find the ACK Number on Your La-Z-Boy Furniture | I (HIGH priority)
- 2026-05-05 | furniture-repair-stores-ottawa | Top 5 Furniture Repair Stores in Ottawa, Ontario | I
- 2026-05-04 | furniture-protection-plan | La-Z-Boy 5-Year Protection Plan: What It Covers, Cost, and Is It Worth It? | R*
- 2026-05-03 | power-control-instructions | How to Use La-Z-Boy Power Controls: Complete Instructions Guide | I (controls: other researcher)
- 2026-05-02 | top-7-problems-with-la-z-boy-furniture | Top 7 Problems With La-Z-Boy Furniture: What You Should Know Before Buying | I (HIGH priority)
- 2026-05-01 | design-stories-kanata | La-Z-Boy Design Stories: First Floor Revamp in Kanata | I
- 2026-04-30 | can-you-mix-leather-and-fabric-furniture | Can You Mix Leather and Fabric Furniture? A Complete Guide to a Cohesive Living Room | I

Page 9
- 2026-04-29 | review-wynne-recliner | Review of the La-Z-Boy Wynne Recliner: Rocking, Wall and Gliding Recliner | I
- 2026-04-28 | review-la-z-boy-brooks-furniture | Review of the La-Z-Boy Brooks Furniture Family: Recliner, Loveseat, Sofa | I
- 2026-04-27 | la-z-boy-accent-chairs-guide | La-Z-Boy Accent Chairs Guide: Styles, Custom Options, Pricing and Buying Tips | I
- 2026-04-26 | la-z-boy-recliner-warranty-breakdown | Are La-Z-Boy Recliners Guaranteed for Life? | R-prev
- 2026-04-25 | leather-la-z-boy | La-Z-Boy Leather Selection Guide: How to Choose the Right Leather Upholstery | I (other researcher)
- 2026-04-24 | canadel-dining-collection-review | Review of the Canadel Dining Collection | I
- 2026-04-23 | finley-furniture-review | Review of La-Z-Boy's Finley Furniture Family: Recliner, Loveseat & Sofa | I
- 2026-04-22 | review-paxton-furniture-family | Review of La-Z-Boy's Paxton Furniture Family: Chair and a Half, Loveseat, Sofa & Sectional | I
- 2026-04-21 | recliners-for-short-people | Best La-Z-Boy Recliners for Short People | R*
- 2026-04-20 | la-z-boy-recliners-tall | Best La-Z-Boy Recliners for Tall People | I (HIGH priority: tall sizing)

Page 10
- 2026-04-19 | fabric-grades | A Complete Guide to Fabric Upholstery at La-Z-Boy Ottawa, Gatineau & Kingston | I (other researcher)
- 2026-04-18 | choosing-stool-height | How Tall Should My Stool Be for a Counter, Bar, or Table? | I
- 2026-04-17 | top-consideratons-arranging-sectional-sofa | How to Arrange Sectional Sofa: Top Considerations | I (HIGH priority)
- 2026-04-16 | disassemble-la-z-boy-recliner | How to Disassemble a Recliner (Including La-Z-Boy Models) | I (HIGH priority)
- 2026-04-15 | power-furniture-problems | Common Problems with La-Z-Boy Power Recliners (and How to Fix Them) | I
- 2026-04-14 | disassemble-reclining-sofa | How to Disassemble a Reclining Sofa | I (HIGH priority)
- 2026-04-13 | how-to-mix-wood-furniture | How to Mix Wood Furniture in a Living Room | I
- 2026-04-12 | best-selling-la-z-boy-chairs | Best Selling La-Z-Boy Accent Chairs | I
- 2026-04-11 | la-z-boy-recliners-small-spaces | La-Z-Boy Recliners for Small Spaces | I
- 2026-04-10 | coffee-table-size-shape | Coffee Table Size and Shape Guide | I

Page 11
- 2026-04-09 | best-la-z-boy-sofas-2026 | Best Selling La-Z-Boy Sofas for 2026 | I
- 2026-04-08 | best-la-z-boy-recliners-2026 | Best La-Z-Boy Recliners in 2026 | I
- 2026-04-07 | rocker-recliner-vs-wall-recliner | Rocker Recliner vs. Wall Recliner: What's the Difference? | I (other researcher)
- 2026-04-06 | how-to-layer-decor-in-your-living-room | How to Layer Decor in Your Living Room | I
- 2026-04-05 | la-z-boy-allegra-chair-review | Review of the La-Z-Boy Allegra Accent Chair | I
- 2026-04-04 | review-collins-furniture-family | Review of the La-Z-Boy Collins Furniture Family: Chair, Loveseat, Sofa & Sectional | I
- 2026-04-03 | review-james-furniture-family | Review of La-Z-Boy's James Furniture Family: Recliner, Loveseat, Sofa & Sectional | I
- 2026-04-02 | the-la-z-boy-harbor-town-recliner-review | Review of the La-Z-Boy Harbor Town Recliner: Rocking & Wall Recliner | I
- 2026-04-01 | la-z-boy-astor-recliner-review | Review of the La-Z-Boy Astor Recliner: Rocking, Wall & Lift Recliner | I
- 2026-03-31 | review-pinnacle-furniture-family | Review of the La-Z-Boy Pinnacle Furniture Family: Recliner, Loveseat & Sofa | I

Page 12
- 2026-03-30 | review-charlie-furniture-family | Review of La-Z-Boy's Charlie Furniture Family: Chair and a Half, Sofa & Sectional | I
- 2026-03-29 | la-z-boy-alani-sectional-review | Review of the La-Z-Boy Alani Sectional | I
- 2026-03-28 | leah-queen-sofa-bed-review | Review of La-Z-Boy's Leah Furniture Family: Sleeper Chair, Loveseat & Sofa | I (sleeper; HIGH priority)
- 2026-03-27 | roxie-swivel-chair-review | Review of the La-Z-Boy Roxie Swivel Chair | I
- 2026-03-26 | review-lennon-recliner | Review of the La-Z-Boy Lennon Recliner: Rocking & Wall Recliner | I
- 2026-03-25 | la-z-boy-reegan-chair-review | Review of the La-Z-Boy Reegan Swivel Chair | I
- 2026-03-24 | the-la-z-boy-rowan-recliner-review | Review of the La-Z-Boy Rowan Recliner: Rocking & Wall Recliner | I
- 2026-03-23 | review-tahoe-sectional | Review of the La-Z-Boy Tahoe Modular Sectional | I
- 2026-03-22 | la-z-boy-meyer-sectional-review | Review of the La-Z-Boy Meyer Furniture Family: Chair, Loveseat, Sofa & Sectional | I
- 2026-03-19 | review-billie-lift-recliner | Review of La-Z-Boy's Billie Bronze Power Lift Recliner | R-prev (lift note)

Page 13
- 2026-03-18 | design-stories-embrun-ontario | Design Stories: New Beginnings in Embrun, Ontario | I
- 2026-03-17 | review-bexley-furniture-family | Review of La-Z-Boy's Bexley Furniture Family: Loveseat, Sofa & Sleep Sofa | I (sleeper)
- 2026-03-16 | review-noah-furniture-family | Review of the La-Z-Boy Noah Furniture Family: Chair, Loveseat & Sofa | I
- 2026-03-10 | furniture-delivery-services | What to Expect on Furniture Delivery Day La-Z-Boy Ottawa, Gatineau & Kingston | R*
- 2026-03-09 | lift-chairs-tax-deductible-canada | Are Lift Chairs Tax Deductible in Canada? | R-prev (lift note)
- 2026-03-06 | best-upholstery-fabrics-for-environment | Eco-Friendly Upholstery Fabrics: What Makes Them Sustainable? | I
- 2026-03-05 | la-z-boy-iclean-review | La-Z-Boy iClean(TM) Fabric Review: Is It Worth the Upgrade? | I
- 2026-03-04 | la-z-boy-antimicrobial-fabric-review | What Is Antimicrobial Fabric? A Complete Guide to La-Z-Boy's Antimicrobial Upholstery | I
- 2026-03-03 | cuddler-vs.-chaise | Cuddler vs. Chaise Sectional: Which One Is Right for Your Living Room? | I (HIGH priority)
- 2026-03-02 | tutorial-canadel-udesign | How to Use the Canadel UDesign Tool to Create Custom Dining Furniture | I

Page 14
- 2026-03-01 | select-perfect-area-rug | How to Choose the Perfect Area Rug for Your Living Room | I
- 2026-02-28 | la-z-boy-rechargeable-battery-packs | La-Z-Boy Rechargeable Battery Pack: Everything You Need to Know About Cordless Power Furniture | I (other researcher)
- 2026-02-27 | best-time-to-buy-furniture | When Is the Best Time to Buy Furniture? | I (HIGH priority: sale events)
- 2026-02-26 | how-to-clean-fabrics | How to Clean La-Z-Boy Furniture Fabric Properly | I (other researcher)
- 2026-02-25 | bleach-cleanable-fabrics | What Are Bleach Cleanable Fabrics at La-Z-Boy, and Are They Right for You? | I
- 2026-02-23 | recliner-best-fit | How to Find a Recliner That Is the Best Fit for You | R-prev
- 2026-02-20 | what-is-the-best-fabric-for-your-sofa-leather-vs-fabric | Fabric vs. Leather Furniture: Which Is Better for Your Home? | I
- 2026-02-19 | la-z-boy-power-recliner-review-lumbar-and-headrest | Review: La-Z-Boy Power Recliners with Headrest & Lumbar Support | I
- 2026-02-17 | how-to-measure-a-room-for-furniture | How to Measure a Room for Furniture in 7 Easy Steps | R*
- 2026-02-16 | cost-area-rug | How Much Does an Area Rug Cost? | I

Page 15
- 2026-02-14 | how-much-does-sectional-cost | How Much Does a Sectional Sofa Cost? | I (HIGH priority: price anchors)
- 2026-02-13 | la-z-boy-recliner-cost | How Much Does a La-Z-Boy Recliner Cost? | R-prev
- 2026-02-12 | designing-small-spaces | Smart Design Tips for Small Apartments and Condos | I
- 2026-02-10 | 10-best-canadian-furniture-stores | Top 10 Furniture Stores in Canada | I
- 2026-02-09 | problems-sofa-beds | Common Sofa Bed Problems and Practical Solutions | I (sleeper; HIGH priority)
- 2026-02-08 | swivel-chair-vs.-swivel-power-recliners | Swivel Power Recliner vs. Manual Swivel Chair: Which Is Right for Your Home? | I
- 2026-02-07 | swivel-vs.-gliding | Swivel Chair vs. Gliding Chair: Which Is Better for Your Home? | I
- 2026-02-06 | review-durham-fireplace-collection | Review of the Durham Fireplace Collection at La-Z-Boy | I
- 2026-02-05 | problems-with-leather-furniture | 6 Common Problems with Leather Furniture & Practical Solutions | I
- 2026-02-04 | rocker-recliner-vs.-glider-recliner | Rocker Recliner vs. Glider Recliner: Which Is Better for Your Home? | I

Page 16
- 2026-02-03 | fabric-pilling-causes | Fabric Pilling on Furniture: Causes, Prevention, and How to Fix It | I
- 2026-02-02 | do-you-tip-a-furniture-delivery-person | Should You Tip a Furniture Delivery Person? | I
- 2026-01-30 | leo-ottoman-review | Is the Leo Ottoman the Best Ottoman at La-Z-Boy? | I
- 2026-01-29 | modern-recliners-la-z-boy | Top 5 Modern Recliners at La-Z-Boy | I
- 2026-01-26 | leather-accents-chairs | Top Leather Accent Chairs at La-Z-Boy | I
- 2026-01-26 | 7-exclusive-features-la-z-boy-furniture | What Makes La-Z-Boy Recliners Different: 7 Exclusive Features | R-prev
- 2026-01-20 | problems-lift-recliners | Common Problems with Power Lift Recliners and Their Solutions | I (lift)
- 2026-01-18 | manual-vs-power-recliners | Manual vs. Power Recliners: Which La-Z-Boy Recliner Is Right for You? | R-prev
- 2026-01-17 | pantone-colour-of-the-year-2026 | Pantone Colour of the Year for 2026 | I
- 2026-01-15 | 10-cool-basement-ideas | 10 Basement Design Ideas to Make the Most of Your Space | I

Page 17
- 2026-01-13 | ottoman-cost | How Much Does an Ottoman Cost? | I
- 2026-01-11 | cost-reupholster-chair | How Much Does It Cost to Reupholster a Chair? | I
- 2026-01-10 | colour-trends-2026 | Colour Trends for 2026 | I
- 2026-01-08 | interior-design-trends-2026 | Interior Design Trends for 2026 | I
- 2026-01-06 | recliner-making-noise | Why Does My La-Z-Boy Recliner Make a Clunking Sound? | I (HIGH priority)
- 2025-12-30 | best-la-z-boy-leather-reclinerss-in-ottawa-kingston | 5 Best Leather Recliners at La-Z-Boy | I
- 2025-12-28 | best-selling-la-z-boy-lift-chairs | Best La-Z-Boy Lift Chairs for Comfort and Mobility Support | R-prev (lift note)
- 2025-12-27 | top-recliner-gift-husband-la-z-boy | Top 5 La-Z-Boy Recliners to Gift your Husband | I
- 2025-12-25 | repair-vs-replace-damaged-furniture-how-to-decide | Repair vs. Replace Furniture: How to Decide What Is Right for Your Home | I
- 2025-12-23 | wooden-vs.-glass-coffee-tables | Glass vs. Wood Coffee Tables: Which Is Better for Your Living Room? | I

Page 18
- 2025-12-21 | arrange-living-room-around-christmas-tree | How to Arrange Your Living Room Around a Christmas Tree: A Step-By-Step Guide | I
- 2025-12-20 | ottawa-interior-designer-award | Zeina Badawi: The Top Interior Designer in Canada is Right Here in Ottawa | I
- 2025-12-18 | review-power-reclining-furniture | Review of La-Z-Boy Power Recliners (Features, Cost, and Expert Insights) | I
- 2025-12-16 | top-rocking-recliners-ottawa | Top 5 Best-Selling La-Z-Boy Rocking Recliners | I
- 2025-12-13 | best-sectional-2026 | Best Selling La-Z-Boy Sectionals for 2026 | I
- 2025-12-11 | best-la-z-boy-loveseats-2026 | Best Selling La-Z-Boy Loveseats for 2026 | I
- 2025-12-07 | accent-chair-sofa-pairs | Top 5 La-Z-Boy Accent Chair and Sofa Pairings for a Stylish Living Room | I
- 2025-12-06 | best-selling-swivel-accent-chairs | 5 Best-Selling La-Z-Boy Swivel Accent Chairs | I
- 2025-12-04 | end-tables-vs.-side-tables | End Table vs Side Table: Which Accent Table is Right for You? | I
- 2025-12-02 | review-sherman-recliner | Review of the La-Z-Boy Sherman Recliner: Rocking & Wall Recliner | I

Page 19
- 2025-11-30 | review-shiloh-furniture-family | Review of La-Z-Boy's Shiloh Furniture Family: Chair & a Half and Sofa | I
- 2025-11-27 | affordable-living-room | How to Furnish a Living Room on a Budget in 6 Easy Steps | I
- 2025-11-25 | cost-to-furnish-a-house | How Much Does It Cost to Furnish a Home? | I
- 2025-11-23 | review-modern-swivel-gliding-recliners | Review of the La-Z-Boy Modern Swivel Gliding Recliner Collection | I
- 2025-11-22 | sofas-vs.-sectionals | Sofa vs Sectional: Which Is Right for Your Living Room? | I (HIGH priority)
- 2025-11-20 | secret-recliners | Review of La-Z-Boy Secret Recliners: Recliners That Don't Look Like Recliners | I
- 2025-11-18 | review-modern-pedestal-swivel-glider-collection | Review of the La-Z-Boy Modern Pedestal Chair Collection | I
- 2025-11-16 | feng-shui-living-room-layout | How to Create a Feng Shui Living Room Layout | I
- 2025-11-15 | coffee-tables-small-spaces | Best Coffee Tables for Small Living Rooms | I
- 2025-11-13 | ctv-bell-media-la-z-boy-ottawa | La-Z-Boy Design Stories: Introducing the La-Z-Boy Lounge at CTV Bell Media | I

Page 20
- 2025-11-11 | is-la-z-boy-living-room-furniture-worth-the-extra-money | Is La-Z-Boy Furniture Worth the Cost? | I
- 2025-11-09 | comfort-restored-nicu-lounge-cheo | Restoring Comfort at the CHEO NICU Lounge | I
- 2025-11-08 | top-wall-recliners | Top 5 La-Z-Boy Wall Recliners | I
- 2025-11-06 | la-z-boy-design-stories-new-chapter | La-Z-Boy Design Stories: A New Chapter in Rockland, Ontario | I
- 2025-11-04 | design-stories-carp-ottawa | Design Stories: Urban Country Bungalow in Carp, Ottawa | I
- 2025-10-28 | la-z-boy-ottawa-kingstons-community-involvement | La-Z-Boy Ottawa, Gatineau & Kingston's Community Involvement | I
- 2025-10-26 | la-z-boy-power-recliner-questions-answered | La-Z-Boy Power Recliners: Your Complete FAQ Guide | I
- 2025-10-25 | great-room-makeover-embrun-ontario | La-Z-Boy Design Stories: Great Room Makeover in Embrun, Ontario | I
- 2025-10-23 | main-floor-makeover-in-stittsville-ontario | La-Z-Boy Design Stories: Open-Concept Living Room in Stittsville | I
- 2025-10-21 | dining-furniture-buying-guide | Practical Tips for Furnishing a Functional Dining Room | I

Page 21
- 2025-10-19 | la-z-boy-home-decor | Step-by-Step Guide to Using La-Z-Boy Home Decor in Your Space | I
- 2025-10-16 | lift-chairs-guide | La-Z-Boy Lift Chairs: The Ultimate Guide to Choosing Your Perfect Lift Chair | R-prev (lift note)
- 2025-10-14 | sectional-buyers-guide | Choosing a La-Z-Boy Sectional: The Ultimate Guide to Comfortable Family Seating | R*
- 2025-10-13 | loveseat-buyers-guide | Key Factors to Consider Before Buying a La-Z-Boy Loveseat | I (HIGH priority)
- 2025-10-12 | sofa-buyers-guide | The Ultimate Sofa's Buyers Guide: How to Find the Perfect La-Z-Boy Sofa | I (HIGH priority)
- 2025-10-11 | recliners-buyers-guide | How to Choose the Right La-Z-Boy Recliner for You: A Step-by-Step Guide | R-prev
- 2025-10-10 | la-z-boy-european-collection-review | Review of the La-Z-Boy European Collection | I
- 2025-10-09 | top-mid-century-modern-sofas | Top 5 Mid-Century Modern Sofas at La-Z-Boy | I
- 2025-10-08 | finley-vs.-lennon | The Finley vs. The Lennon: Which La-Z-Boy Recliner is Right For You? | I
- 2025-10-07 | furniture-repair-stores-kingston-ontario | Top 5 Furniture Repair Stores in Kingston, Ontario | I

Page 22
- 2025-10-05 | scotchgard-vs.-iclean-fabrics | Scotchgard vs. iClean: Which Fabric Protection is Best for Your Furniture? | I
- 2025-10-04 | sleeping-reclined-position | Is Sleeping in a Reclined Position Good for You? | I
- 2025-10-03 | service-department | What to Expect from the La-Z-Boy Service Department: Step-by-Step | R*
- 2025-10-02 | living-room-each-season | Expert Advice: How to Decorate Your Home for Each Season | I
- 2025-10-01 | stationary-vs.-reclining | Stationary vs. Reclining Furniture: Which is Better for Your Living Room? | I (HIGH priority)
- 2025-09-30 | problems-wooden-furniture | 5 Common Problems with Wooden Furniture at La-Z-Boy (& Solutions) | I
- 2025-09-29 | home-insurance-furniture | Does Home Insurance Cover Living Room Furniture? | I
- 2025-09-28 | review-loveseats-with-consoles | Review of La-Z-Boy's Loveseats with Consoles: Pros & Cons | I
- 2025-09-27 | sunroom-tips | How to Furnish a Sunroom in 9 Easy Steps | I
- 2025-09-26 | theatre-room-furniture | How to Furnish a Home Theatre Room in 5 Easy Steps | I (HIGH priority: home theater)

Page 23
- 2025-09-25 | top-coffee-table-storage | Best Coffee Tables with Storage at La-Z-Boy | I
- 2025-09-24 | dining-table-shape | Which Dining Room Table Size and Shape is Right for You? | I
- 2025-09-23 | canadel-dining-room-furniture-for-small-spaces | How to Choose Canadel Dining Room Tables for Small Spaces | I
- 2025-09-22 | woman-cave-design | How to Design a Woman's Cave in 7 Easy Steps | I
- 2025-09-21 | glass-round-tables | Are Glass Round Dining Tables Worth It? | I
- 2025-09-20 | top-contemporary-sofas | Top 5 Contemporary Sofas at La-Z-Boy | I
- 2025-09-19 | bedroom-interior-design | Bedroom Interior Design: 9 Expert Tips from a La-Z-Boy Designer | I
- 2025-09-18 | avoiding-no-fit-delivery | How to Avoid a No-Fit Furniture Delivery in 6 Easy Steps | R*
- 2025-09-17 | osb-vs.-plywood | OSB vs Plywood: Which is Better for Furniture Frames? | I
- 2025-09-16 | paxton-vs-alani-sectional-la-z-boy | Paxton vs. Alani Sofa Review: Which La-Z-Boy Furniture Frame Is Right for You? | I

Page 24
- 2025-09-15 | how-to-design-and-open-concept-home | How to Design an Open Concept Home: 5 Essential Tips for Style and Function | I
- 2025-09-14 | sectional-bed-best-furniture-retailers | 7 Best Furniture Stores to Buy a Sectional Sofa Bed in Ottawa, Ontario | I
- 2025-09-13 | how-much-does-a-sofa-cost | How Much Does a Sofa Cost in Ottawa, Gatineau & Kingston? | I (HIGH priority: price anchors)
- 2025-09-12 | best-furniture-stores-in-kingston | 6 Best Furniture Stores in Kingston | I
- 2025-09-11 | 2025-minto-dream-home-catalogue | A Catalogue of the 2025 Minto Dream Home | I
- 2025-09-10 | minto-dream-home-2025 | The 2025 Minto Dream Home: Furnished by La-Z-Boy Ottawa, Gatineau & Kingston | I
- 2025-09-09 | dufresne-vs-la-z-boy | Dufresne vs. La-Z-Boy: Which Furniture Retailer is Right for You? | I
- 2025-09-08 | dining-area-rugs | Do Area Rugs Belong in a Dining Room? | I
- 2025-09-07 | la-z-boy-furniture-wood-quality | The Quality of Wood Used to Make La-Z-Boy Furniture | I
- 2025-09-06 | meyer-vs-collins-la-z-boy | The Meyer vs. Collins Furniture Family at La-Z-Boy: Comparison of Similarities & Differences | I

Page 25
- 2025-09-05 | dining-room-furniture-stores-ottawa | Top 8 Best Dining Table and Chair Stores in Ottawa, Ontario | I
- 2025-09-04 | surya-rugs-review | Review of Surya Rugs at La-Z-Boy | I
- 2025-09-03 | la-z-boy-furniture-styles | What Furniture Styles are Available at La-Z-Boy? | I
- 2025-09-02 | a-beautifully-decorated-dining-room | How to Decorate your Dining Room: 6 Simple Tips to Follow | I
- 2025-09-01 | what-to-expect-interior-design | What to Expect From La-Z-Boy's Interior Design Services | I (HIGH priority: design services)
- 2025-08-31 | living-room-lighting-table-lamps | How to Add Lighting to Your Living Room Without Overhead Fixtures | I
- 2025-08-30 | design-stories-orleans | La-Z-Boy Design Stories: Living Room Revamp in Orleans, Ottawa | I
- 2025-08-29 | shop-quality-furniture-ottawa | Where to Find High-Quality Furniture in Ottawa, Ontario? | I
- 2025-08-28 | arranging-throw-pillows | How to Accessorize with Throw Pillows: 7 Styling Tips from a La-Z-Boy Interior Designer | I
- 2025-08-27 | durable-fabrics | Expert Advice: Most Durable Furniture Fabrics | I

Page 26
- 2025-08-26 | top-reclining-sofas-la-z-boy | Expert Advice: Best La-Z-Boy Reclining Sofas | I
- 2025-08-25 | dining-table-style-ideas-for-your-home | Dining Table Styles for Your Home: Find the Look That Reflects Your Lifestyle | I
- 2025-08-22 | best-la-z-boy-chairs-for-nursery | Expert Insight: La-Z-Boy Chairs for a Nursery | I
- 2025-08-21 | how-much-does-la-z-boy-leather-furniture-cost | How Much Does La-Z-Boy Leather Furniture Cost? | I
- 2025-08-20 | are-recliners-bad-for-your-back | Is a Recliner Chair Good For Back Pain? | I
- 2025-08-19 | review-of-the-la-z-boy-duo-furniture-collection | Review of the La-Z-Boy Duo Collection: Recliners That Don't Look Like Recliners | I (other researcher)
- 2025-08-18 | where-to-throw-old-furniture | 5 Environmentally Friendly Ways to Get Rid of Old Furniture (Without the Guilt) | I
- 2025-08-17 | la-z-boy-power-furniture-and-competition-comparison | La-Z-Boy Power Recliners vs. the Competition: Which is Best for You? | I
- 2025-08-16 | cost-to-furnish-a-dining-room | How Much Does It Cost to Furnish a Dining Room? | I
- 2025-08-15 | coffee-table-cost | How Much Does a Coffee Table Cost? | I

Page 27
- 2025-08-14 | lift-recliner-chair-cost | How Much Does a Lift Recliner Chair Cost? | I (lift note covers)
- 2025-08-13 | kincaid-furniture-review | Review of Kincaid Furniture at La-Z-Boy | I
- 2025-08-12 | american-drew-furniture-la-z-boy-review | Review of the American Drew Furniture at La-Z-Boy | I
- 2025-08-11 | hammary-furniture-review | Review of Hammary Furniture at La-Z-Boy | I
- 2025-08-10 | review-modern-collection | Review of the Canadel Modern Collection | I
- 2025-08-09 | review-loft-collection | Review of Canadel's Loft Collection | I
- 2025-08-08 | review-champlain-collection | Review of Canadel's Champlain Collection | I
- 2025-08-07 | review-downtown-collection | Review of Canadel's Downtown Collection | I
- 2025-08-06 | review-gourmet-collection | Review of Canadel's Gourmet Collection | I
- 2025-08-04 | best-barstool-stores-ottawa | Top 7 Best Stores to Buy Barstools in Ottawa, Ontario | I

Page 28
- 2025-08-03 | 5-best-sofa-stores-ottawa | Best Places to Buy a Sofa in Ottawa, Ontario | I
- 2025-08-02 | spring-cleaning-furniture-care-tips | How to Care for Your Furniture: Expert Advice for Leather, Fabric, Wood, and Rugs | I
- 2025-08-01 | best-furniture-stores-hunt-club-ottawa | The 6 Best Furniture Stores in Hunt Club West, Ottawa | I
- 2025-07-31 | la-z-boy-premier-construction | Review of La-Z-Boy's Premier Construction | I (HIGH priority)
- 2025-07-30 | flexiti-financing | What You Need to Know About Flexiti Financing | R*
- 2025-07-27 | furniture-financing | What Is Furniture Financing and How Does It Work? | R*
- 2025-07-26 | 3-piece-living-room | 3-Piece Living Room Set vs. Other Arrangements: Which is Better for You? | I
- 2025-07-25 | murphy-bed-vs-sofa-bed | Murphy Bed vs. Sofa Bed: Which is Better for You? | I
- 2025-07-24 | safety-features-la-z-boy-recliner | What Are the Safety Features of a La-Z-Boy Recliner? | I (HIGH priority)
- 2025-07-23 | 2-seater-sofas-la-z-boy | Furniture Basics: What Is a 2-Seater Sofa? | I

Page 29
- 2025-07-22 | right-sofa-size | Sizing Advice: Finding the Right Sofa | I (HIGH priority: sizing)
- 2025-07-21 | la-z-boy-design-stories-belleville-ontario | La-Z-Boy Design Stories: Living Room Makeover in Belleville, Ontario | I
- 2025-07-20 | top-selling-la-z-boy-sofa-beds | Expert Insight: Top-Selling La-Z-Boy Sofa Beds | I (sleeper)
- 2025-07-19 | 5-best-selling-la-z-boy-chair-a-half | Expert Advice: Best Selling La-Z-Boy Chair & a Halfs | I
- 2025-07-18 | sectionals-small-spaces | Expert Insight: La-Z-Boy Sectionals for Small Spaces | I
- 2025-07-17 | affordable-la-z-boy-sofas | Expert Insight: Affordable La-Z-Boy Sofas | I
- 2025-07-16 | affordable-la-z-boy-chairs | Top 10 Most Affordable Chairs at La-Z-Boy | I
- 2025-07-15 | affordable-sectionals | The 5 Most Affordable Sectionals at La-Z-Boy | I
- 2025-07-14 | bringing-comfort-to-the-staff-at-the-childrens-hospital-of-eastern-ontario-cheo | Bringing Comfort to the Staff at the Children's Hospital of Eastern Ontario (CHEO) | I
- 2025-07-11 | buying-new-used-furniture | Budget Comparison: New vs. Used Furniture | I

Page 30
- 2025-07-10 | best-area-rug-stores | Local Picks: Best Area Rug Stores in Ottawa & Kingston | I
- 2025-07-09 | used-furniture-ottawa | Local Picks: Finding Used Furniture in Ottawa | I
- 2025-07-08 | custom-furniture-ottawa | 6 Best Custom Furniture Stores in Ottawa | I
- 2025-07-07 | luxury-furniture-ottawa | 7 Best Luxury Furniture Stores in Ottawa | I
- 2025-07-06 | is-la-z-boy-furniture-expensive | Why Is La-Z-Boy Furniture Expensive? | I
- 2025-07-05 | la-z-boy-good-quality | Is La-Z-Boy Furniture Good Quality? | I
- 2025-07-04 | bennetts-vs-la-z-boy-kingston | Bennett's vs. La-Z-Boy Kingston: Similarities & Differences | I
- 2025-07-03 | affordable-online-furniture-stores | 8 Best Affordable Online Furniture Stores in Canada | I
- 2025-07-02 | stylus-vs.-la-z-boy | Stylus Sofas vs. La-Z-Boy: Which Furniture Retailer is Right for You? | I
- 2025-07-01 | costco-vs.-la-z-boy-recliner-chairs | Costco vs. La-Z-Boy: A Comparison of Recliner Chairs in Ottawa, Ontario | I

Page 31
- 2025-06-30 | leons-la-z-boy | Leon's vs. La-Z-Boy: Which Furniture Retailer is Right for You? | I
- 2025-06-29 | urban-barn-vs.-la-z-boy | Urban Barn vs. La-Z-Boy: Which Furniture Retailer is Right for You? | I
- 2025-06-28 | brick-vs.-la-z-boy | The Brick vs. La-Z-Boy: Which Furniture Retailer is Right for You? | I
- 2025-06-27 | dining-room-table-cost | How Much Does a Dining Room Table Cost? | I
- 2025-06-26 | bedroom-furniture-costs | How Much Does It Cost to Furnish a Bedroom? | I
- 2025-06-25 | ormes-vs.-la-z-boy | Ormes vs. La-Z-Boy: Living Room Furniture | I
- 2025-06-24 | structube-vs.-la-z-boy | Structube vs. La-Z-Boy: A Comparison of Furniture Retailers | I
- 2025-06-23 | ashley-vs-la-z-boy-canada | Ashley Furniture vs La-Z-Boy: Which Retailer is Right for You? | I
- 2025-06-22 | decor-rest-vs-la-z-boy | Decor-Rest vs. La-Z-Boy: A Comparison of Living Room Furniture Brands | I
- 2025-06-21 | elran-vs-la-z-boy | Elran vs. La-Z-Boy: Which Furniture Brand Is Right for You? | I

Page 32
- 2025-06-20 | palliser-vs-la-z-boy | Palliser vs. La-Z-Boy: Which Furniture Brand is Better for You? | I
- 2025-06-19 | stressless-vs-la-z-boy-recliner | Stressless Recliners vs. La-Z-Boy Pedestal Chairs: Which Brand is Right for You? | I
- 2025-06-18 | best-glider-recliner-chairs-ottawa | Top 5 Best Glider Recliners & Chairs at La-Z-Boy Ottawa, Gatineau & Kingston | I
- 2025-06-17 | top-high-leg-recliners | Top 5 High-Leg Recliners at La-Z-Boy | I
- 2025-06-16 | top-leather-sofas | Top 8 Leather Sofas at La-Z-Boy | I
- 2025-06-15 | best-selling-la-z-boy-reclining-loveseats | Top 5 Best Selling La-Z-Boy Reclining Loveseats in Ottawa, Gatineau & Kingston | I
- 2025-06-14 | best-stationary-loveseats | 5 Best-Selling Stationary Loveseats at La-Z-Boy | I
- 2025-06-13 | best-sectional-sofas-basement-living-room | Best La-Z-Boy Sectional Sofas for Your Basement Living Room | I
- 2025-06-12 | best-selling-sofas | Top 5 Best Selling La-Z-Boy Sofas in Ottawa, Gatineau & Kingston | I
- 2025-06-11 | best-selling-la-z-boy-sectionals | 5 Best Selling La-Z-Boy Sectional Sofas in Ottawa, Gatineau & Kingston | I

Page 33
- 2025-06-10 | best-furniture-stores-gatineau-quebec | 7 of the Best Furniture Stores in Gatineau, Quebec | I
- 2025-06-09 | tanguay-vs.-la-z-boy | Tanguay vs. La-Z-Boy: Which Furniture Retailer is Right for You? | I
- 2025-06-08 | loveseat-sofa | Loveseat vs. Sofa: Which Furniture is Right for You? | I
- 2025-06-07 | parisian-style-apartment | 9 Tips On How to Design a Parisian Style Apartment | I
- 2025-06-06 | furniture-placement | 8 Practical Tips for Arranging Your Living Room Furniture | I
- 2025-06-05 | decorating-living-room-ideas | 5 Easy Steps to Decorate Your Living Room Like a Pro | I
- 2025-06-03 | how-much-does-interior-designer-cost | How Much Does an Interior Designer Cost in Ottawa? | I (design services; HIGH priority)
- 2025-06-02 | best-colours-home-decor | What Are the Best Colours for Home Decor? | I
- 2025-06-01 | separate-sectional-moving | How to Separate a Sectional Sofa: Easily Moving Heavy Furniture | I (HIGH priority)
- 2025-05-31 | choosing-sofa-colour | Top 5 Tips for Choosing the Right Sofa Colour for Your Living Room | I

Pages 34 to 37 (links only; titles slug-derived "~"; dates not captured)
- Page 34: ottoman-match-sofa (~How to match an ottoman to a sofa); la-z-boy-history-origin-of-name (~La-Z-Boy history and origin of the name); leather-furniture-care (~Leather furniture care); designer-tips-mix-match-furniture (~Designer tips to mix and match furniture); traditional-vs.-contemporary-style (~Traditional vs. contemporary style); pet-friendly-furniture (~Pet-friendly furniture); dining-room-chairs-cost (~Dining room chair cost); cost-reupholster-la-z-boy-recliner (~Cost to reupholster a La-Z-Boy recliner); basement-renovation-costs (~Basement renovation costs); review-restore-fabric (~Review of Restore fabric)
- Page 35: elderly-person-mobility-issues (Best Furniture for Seniors with Mobility Issues in Ottawa, Gatineau & Kingston, Apr 19, 2025, R*); review-dorian-furniture-family (~Dorian family review); la-z-boy-seat-cushion (~Seat cushion article); review-ferndale-chair (~Ferndale chair review); review-bennett-furniture-family (~Bennett family review); where-is-la-z-boy-furniture-made (~Where La-Z-Boy furniture is made); trouper-furniture-family (~Trouper family review); design-stories-lanark-ontario (~Design Stories: Lanark, Ontario); top-recliners-with-headrest-lumbar (~Top recliners with headrest and lumbar); la-z-boy-furniture-toxic (~Is La-Z-Boy furniture toxic?)
- Page 36: navan-great-room-makeover (~Navan great room makeover); before-after-arnprior (~Arnprior before/after); wayfair-vs-la-z-boy- (~Wayfair vs La-Z-Boy); review-maeve-accent-chair (~Maeve accent chair review); design-stories-sleep-cabin (~Design Stories: sleep cabin); 2024-minto-dream-home-catalogue; 2024-minto-dream-home; review-emmons-furniture-family (~Emmons family review); review-sparrow-recliner (~Sparrow recliner review); review-kodie-recliner (~Kodie recliner review)
- Page 37: manotick-design-project; 2023-cheo-dream-home-catalogue; cheo-dream-home-2023; monthly-contest-at-la-z-boy; catalogue-2022-dream-home; 2022-cheo-dream-home; 2021-cheo-dream-home-furniture-catalogue; cheo-dream-home-2021-caraway; cheo-home-2020-furniture-catalog; cheo-dream-home-2020 (all titles slug-derived)

Non-article pages read this session (R*): [/delivery-pick-ups/](https://www.stylemeetscomfort.ca/delivery-pick-ups/), [/shipping-and-return-policy](https://www.stylemeetscomfort.ca/shipping-and-return-policy), [/locations](https://www.stylemeetscomfort.ca/locations). Not read: /financing, /design-service, /design-experts/*, /about-us, /my-orders/, /locations/<store>, /privacy-policy, French mirrors.
Scope gap: the dealer site is a HubSpot blog plus a few service pages. I found no dealer-hosted product/collection pages for recliners, lift chairs, sofas, sectionals, sleepers or chairs (the guides link to articles, /locations, /design-service, /about-us and a financing page only). Product lines and CAD price ranges for those categories are therefore taken only from the articles; la-z-boy.com category pages were covered in sitemap_structure.md and recliner_lift_products.md/stationary_products.md. I did not re-scrape la-z-boy.com category pages and have no verified evidence that they differ for Canada.

Counts: 370 articles indexed. Read in full this session: 11 (delivery-services, furniture-financing, flexiti-financing, furniture-protection-plan, service-department, avoiding-no-fit-delivery, how-to-measure-a-room-for-furniture, elderly-person-mobility-issues, review-sofa-bed-mattress, recliners-for-short-people, sectional-buyers-guide). Read in earlier notes: about 10 (recliner/lift set). Roughly 349 indexed only.

### Priority follow-up reads (not done; budget exhausted)
1. custom-furniture-at-la-z-boy-what-to-expect, find-ack-number-on-la-z-boy-furniture, top-7-problems-with-la-z-boy-furniture, la-z-boy-premier-construction, safety-features-la-z-boy-recliner, recliner-making-noise
2. sofa-buyers-guide, loveseat-buyers-guide, sofas-vs.-sectionals, stationary-vs.-reclining, right-sofa-size, how-much-does-a-sofa-cost, how-much-does-sectional-cost, cuddler-vs.-chaise, top-consideratons-arranging-sectional-sofa, separate-sectional-moving, disassemble-la-z-boy-recliner, disassemble-reclining-sofa
3. problems-sofa-beds, leah-queen-sofa-bed-review, review-bexley-furniture-family, top-selling-la-z-boy-sofa-beds
4. la-z-boy-recliners-tall, theatre-room-furniture, best-time-to-buy-furniture, what-to-expect-interior-design, how-much-does-interior-designer-cost, working-with-la-z-boy-design-consultant (linked, not on the index list)
5. Pages 34 to 37 titles and dates (fetch with markdown rather than links)

## (E) App resource ideas
1. "Fit through the door" calculator: inputs door width/height (with and without trim), stairwell/elevator size, piece width/depth/height/diagonal depth, corner-turn distance. Output: pass/pivot/no-fit with the dealer rules (A6). Link from Room Builder. Needs diagonal depth per style, which the app lacks (grep "diagonal depth" no hits), so store as an optional field.
2. Delivery and policy card set (configurable per store, flagged dealer-specific): fees, tue-sat schedule, 24-hour damage claim, 48-hour stock cancellation with 20% restocking, no cancellation on custom/clearance, 50% deposit, custom lead time (see C5), old-furniture removal fees (use the latest page, see C1).
3. Protection plan quote helper: price bracket lookup from the A3 table, with 9%/10% rule above $8,000, plus the "kids/pets/high-value" prompts and the 100% store-credit-back rule. Source tag: dealer exclusive.
4. Financing explainer with a store toggle: equal 12/24 month, deferred 3/6/12 month, admin fee, tax deposit, 25-day grace, Quebec differences (5% minimum, no Flexiti admin fee). Show the 36-month claim only as "dealer promotion, verify" (C2).
5. Sleeper builder facts: add Twin/Full/Queen widths and mattress dimensions plus the three mattress specs and dealer price anchors to the stationary/sleeper data (verify mattress specs against the corporate pricebook before use).
6. Height-fit chips for sectionals (Petite under 5'4", Medium 5'4"-5'9", Large 5'10"-6'2", Extra Tall over 6'2") to pair with the existing fit engine; complement the recliner height bands in recliners_buyers_guide.md.
7. Accessibility/senior consult script: private appointment offer, bring cane/walker, 90-degree knee test, prefer lift or power, caution on swivel/manual/high-leg (A10).
8. Service-ticket assistant: checklist of what to capture (ACK number, what/when/where, photos, video) and expectation-setting (first update in a few business days, about four weeks to resolve, reupholstery referred out).
9. Store directory screen with the five store addresses/phones (A11) as a local config, not hard-coded.
10. Follow-up crawl list (D) for the 25 flagged articles above.

### Gaps and honesty notes
- Pages 34 to 37 titles and dates are inferred from slugs; do not quote them as titles.
- 349 of 370 article bodies were not read. Figures in A come only from the 11 read articles and three service pages.
- The dealer's dimensions for five recliners (A9) were not diffed against recliner-catalog-2026.json.
- The `?page=N` URL form and per-tag pagination were not tested; /page/N is complete as shown by the 404 at page 38.
- "Dealer-specific, not corporate": delivery fees, restocking fee, 12-week custom lead time, Flexiti terms, and the 5-year plan prices are the Ottawa/Gatineau/Kingston group's own and could differ at other Canadian dealers.
