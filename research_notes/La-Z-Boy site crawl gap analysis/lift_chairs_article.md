# Lift chairs: stylemeetscomfort.ca "Best La-Z-Boy Lift Chairs" article and linked lift-chair content (gap analysis vs LAZ-Boy app)

Source site is a Canadian-owned La-Z-Boy dealer group (Ottawa, Gatineau, Kingston; stores Cyrville, Kingston, Kanata, Hunt Club, Gatineau). All content is Canadian dealer content (Ontario/Quebec). Fetched 2026-11-08 with Firecrawl scrape (maxAge 0 where stated; all returned HTTP 200, no proxy blocks). Dealer pricing is "starting at", dated per article, subject to change, and dealer-specific (not an official La-Z-Boy Canada price list). App comparison used public/*.json (style-index-2026, mechanism-guide-2026, glossary-2026, recliner-catalog-2026, sales-reference-library-2026, canada_lineup_research, catalog_data-v2).

## A. NEW to app (not found in app JSON after grep)

### Takeaway
The app already has strong lift-chair spec data (tiers, capacities, dims, wall clearance, warranty, headrest/lumbar). What is missing is the Canadian purchasing layer: tax rules, financing, delivery fees, real-world dealer pricing/options, sizing/fit language, service/troubleshooting, and sales-consultant talking points.

### Cited Findings
**Tax / medical (grep for GST, HST, zero-rated, prescription, doctor: zero hits in app)**
- Lift chairs are "zero-rated for tax purposes" with a doctor's requisition; also saves tax on delivery and warranty charges — [Clayton review](https://www.stylemeetscomfort.ca/learning-center/la-z-boy-clayton-lift-recliner-review), [Billie review](https://www.stylemeetscomfort.ca/learning-center/review-billie-lift-recliner)
- CRA rule summary: GST/HST exemption plus possible Medical Expense Tax Credit (METC). Eligibility: (1) must function as a complete chair (base, seat, backrest); attachments/partial mechanisms don't qualify; (2) specially designed for a person with a disability: electric lifting and tilting mechanism, stable base, controls for independent operation, intended primarily for a diagnosed condition not comfort; (3) written order from a recognized professional (medical doctor, occupational therapist or physiotherapist) stating medical necessity, with patient name and signature. If bought before paperwork, a refund of tax paid in error may be possible via a CRA rebate form. Keep prescription, receipts, proof of payment for METC. Dealer cites CRA GI-133 — [Tax article](https://www.stylemeetscomfort.ca/learning-center/lift-chairs-tax-deductible-canada)
- Worked example: "$3,000 chair with delivery and protection could save you up to $390 in taxes in Ontario" (13% HST); the prescription must be provided at purchase or submitted before the order is completed; also covers delivery, extended warranty, customization if part of the medically necessary purchase — [Cost article](https://www.stylemeetscomfort.ca/learning-center/lift-recliner-chair-cost)
- UNVERIFIED for app use: Ontario/Quebec specifics (QST not mentioned anywhere); dealer says consult a tax professional. Do not present as tax advice.

**Financing (grep Flexiti/financ: zero hits)**
- Flexiti partnership: "0% interest for up to 36 months with equal monthly payments", quick approval, reusable credit — [Lift Chair Guide](https://www.stylemeetscomfort.ca/learning-center/lift-chairs-guide); cost article says "instant approval" — [Cost article](https://www.stylemeetscomfort.ca/learning-center/lift-recliner-chair-cost); tax article says "in some cases promotional interest-free plans may be available" (less definite). Dealer program, not necessarily corporate.

**Delivery / pickup / services (grep white glove: zero hits)**
- White-glove delivery $129.99 in Ottawa/Gatineau/Kingston, $169.99 out of town; includes placement, assembly, plugging in/testing controls, packaging removal. Move existing furniture $25/piece; disposal $50/seat. Warehouse pickup in Cyrville (Ottawa) and Kingston; many lift chairs separate into parts for transport — [Lift Chair Guide](https://www.stylemeetscomfort.ca/learning-center/lift-chairs-guide) (dealer-specific fees).

**Fit / size language**
- Lift sizes: Petite (many Bronze), Medium (Gold often medium-scale), Large (Platinum for taller/broader). Good fit = head rests on cushion, feet touch floor at 90 degrees, lifts smoothly without strain — [Lift Chair Guide](https://www.stylemeetscomfort.ca/learning-center/lift-chairs-guide) (see C: tier-size mapping conflicts with app).
- Per-model user-height guidance (app has "no numeric height range" for most): Clayton "best suited for someone extra tall, 6'3" and up" (same article also says "average to taller users"); Billie shorter-to-average, back height 39 in; Jean shorter-to-average, upright sit; Liam average height; Astor taller/larger (tall back, deep chaise); Pinnacle average to taller — [Clayton](https://www.stylemeetscomfort.ca/learning-center/la-z-boy-clayton-lift-recliner-review), [Billie](https://www.stylemeetscomfort.ca/learning-center/review-billie-lift-recliner), [Jean](https://www.stylemeetscomfort.ca/learning-center/review-jean-lift-recliner), [Liam](https://www.stylemeetscomfort.ca/learning-center/review-liam-furniture-family), [Astor](https://www.stylemeetscomfort.ca/learning-center/la-z-boy-astor-recliner-review), [Pinnacle](https://www.stylemeetscomfort.ca/learning-center/review-pinnacle-furniture-family). Every article adds "height guidelines are NOT set in stone; sit test recommended."
- Placement/space: need clearance behind and in front for tilt-forward; keep pathways clear; measure delivery route; felt pads on hardwood — [Lift Chair Guide](https://www.stylemeetscomfort.ca/learning-center/lift-chairs-guide)
- Liam: "only about five inches of wall clearance" (best-sellers article) — [Best-selling](https://www.stylemeetscomfort.ca/learning-center/best-selling-la-z-boy-lift-chairs). Conflicts with app (see C).

**Upholstery notes for lift chairs**
- "La-Z-Boy lift chairs do not come in real leather due to their lack of grip on those covers"; faux leather offered — [Lift Chair Guide](https://www.stylemeetscomfort.ca/learning-center/lift-chairs-guide). Per-model cover counts: Pinnacle lift 5 select fabrics, no leather; Astor lift 5 select fabrics, no leather; Liam lift 4 select fabrics, no leather; Billie 5 select fabrics + faux leather options; Jean 5 select fabrics + faux leather; Clayton 5 select fabrics, no leather (reviews linked above). "Select fabrics will not affect the starting price" (cover-grade upcharge applies beyond select).
- Lift chairs show more fabric wear (motion, friction); specialty fabrics (stain-resistant, antimicrobial, pet-friendly) reduce it; fabric warranties and reupholstery mentioned — [Problems article](https://www.stylemeetscomfort.ca/learning-center/problems-lift-recliners)

**Dealer pricing ("starting at", dollars CAD; dates are as-of dates in each article)**
- Billie lift $1,639 (as of Feb 26, 2026; "low-price"); Jean lift $1,099 (May 6, 2026; Key Takeaways call it "mid-price", Cost section "low-price", internally inconsistent); Liam power lift $1,879 (May 11, 2026; recliner rocking from $1,159 manual, loveseat $2,829 manual, sofa $2,899 manual); Pinnacle power lift $2,929 (Mar 11, 2026; rocking $1,779 manual/$2,779 power); Astor power lift $3,539 (Mar 11, 2026; rocking $1,739/$2,739 power; wall $1,789/$2,789); Clayton Gold lift $3,869 (Apr 21, 2026) — links above
- Heat & Massage lift from $3,229, power rocker with H&M from $2,559 (June 3, 2026) — [H&M article](https://www.stylemeetscomfort.ca/learning-center/heat-massage-upgrade-la-z-boy)
- Product page (store web price) for Clayton Ash fabric: $4,389.95 listed, struck-through $5,629.95, "Save $1,240", "Limited Availability", Ottawa & Kingston showrooms — [Product page](https://www.stylemeetscomfort.ca/products/catalog/Clayton-Gold-Power-Lift-Recliner-w-Massage-Heat) (page says prices vary by location; confirm in store). Note this differs from the $3,869 starting price in the review.
- Tier price bands in older cost article (Aug 14, 2025; updated Jul 8, 2025): market $600 to over $4,000; entry $600–$1,500, mid $1,500–$3,000, high-end $3,500+; La-Z-Boy "3-position recliner $1,899, infinite-position $2,399, heat and massage $3,199, bariatric $3,799+" — [Cost article](https://www.stylemeetscomfort.ca/learning-center/lift-recliner-chair-cost). Dated and generic; "bariatric 700 lb capacity" talk is industry-general, not a named La-Z-Boy product (UNVERIFIED for La-Z-Boy).
- Lift Chair Guide (Oct 16, 2025) says La-Z-Boy lift "typically start at $1,200" in one place and "around $1,500" in key takeaways; tax article says dealer lift range $1,800–$3,000+. Stale/inconsistent; prefer per-model prices.

**Option prices relevant to lift (as listed in model reviews)**
- Contour Cushion upgrade $200 (chair; $400 loveseat, $600 sofa); Firm Cushion upgrade $150/cushion (Clayton); Rechargeable battery pack $300 (listed on lift reviews, see C); wireless remote $200; handle options $70–$200; console $300–$600; swivel/power swivel $250–$300 (non-lift)
- Cost-article upgrade ranges: premium leather $500–$1,900; heat and massage $500–$1,000; USB/charging $150–$300; swivel add-on $200; extended warranty plan $150–$500 (older, dated Jul 2025; conflicts with H&M article price differential)
- Headrest + lumbar upgrade cost: rocker/wall +$1,000, power lift +$2,000 (as of Jan 22, 2026); "approximately 30 recliner styles compatible"; headrest-only upgrades available at lower cost — [Headrest & Lumbar article](https://www.stylemeetscomfort.ca/learning-center/la-z-boy-power-recliner-review-lumbar-and-headrest)

**Warranty / service (partly new)**
- Dealer "5 Year Comprehensive Service Plan" and extended protection plan; replacement motors typically $100–$300 depending on model; most common service issues are motor noise/shaking, remote failure (check batteries first), fabric wear, fit; "Lift recliners do not weaken muscles and are often recommended by doctors." Source is Storm Shields, Head Supervisor of the dealer Service Department — [Problems article](https://www.stylemeetscomfort.ca/learning-center/problems-lift-recliners)
- Electrical issues on heat/massage and headrest/lumbar covered "up to 3 years"; lifetime on frame/spring/mechanism for power recliners; lift frame lifetime — [H&M article](https://www.stylemeetscomfort.ca/learning-center/heat-massage-upgrade-la-z-boy). Compare with app in B/C.

**Heat & Massage detail (new specifics)**
- Clayton: "only product on our floor" with H&M; "3 heat settings" for back and seat plus "6-motor vibration massage with 3 modes (constant, wave, pulse)" (Clayton review). The dedicated H&M article instead says lumbar-only heat, low up to 41 C/106 F and high up to 47 C/116 F, massage duration choices 15 or 30 min with 30 min rest after a 30-min cycle, three intensities, 3 patterns, handheld attached remote, no rollers, no neck/shoulder massage. The Lift Chair Guide says "two high & low heat settings and six motor-massage settings for back and thighs" and PowerReclineXR included. Dealer sources disagree with each other; see C.
- Positioning/what it is NOT: "not a commercial massage chair; subtle; best for daily users, retirees, readers, home-theatre users" with FAQ and pros/cons table — [H&M article](https://www.stylemeetscomfort.ca/learning-center/heat-massage-upgrade-la-z-boy)

**Misc**
- Clayton "ETL safety-certified" with auto-stop legrest, 500 lb, 13.5 in from wall to reach AC outlet, wired ergonomic controller tucks into side pocket, backup uses two 9V batteries (Clayton review). App has 500 lb, 13.5 in, 9V backup, but "ETL" has zero hits.
- Pinnacle lift: "one-piece seat and back design" (no gap even when fully reclined), horizontal bed-like full recline; Astor lift: three-cushion pillow back "contours", "taller and larger users"; "La-Z-Boy has been making the Astor for over 25 years... number-one bestseller in North America" (Astor review, marketing claim, unverified; app/Canada catalog does not state it). Consultant quotes (Tim Young, Hunt Club; Leah Valiquette, Kingston; Lina Najia, Kanata; Ghada Shaheen, Hunt Club; Zina Chaban, Hunt Club; Lisa Kemp, Kanata; Racha Pharaon, Kanata/Ottawa and Kingston; Marianne Kola, Gatineau; Vic Bozhko, Cyrville) are reusable as talk-track phrasing, but are individual opinions.
- Miller lift (photo filename `S80i_MILLER_2BL-792`) appears in two dealer pages ([Cost article](https://www.stylemeetscomfort.ca/learning-center/lift-recliner-chair-cost), [Problems article](https://www.stylemeetscomfort.ca/learning-center/problems-lift-recliners)); no Miller record or `2BL` prefix exists in the app (grep: zero hits). The model is not named in any text on these pages. UNVERIFIED: only an image filename, so don't add it without a Canadian source.
- Silver lift (4LP, James 521): the app has prefix `4LP` in the glossary/reference library and a 4LP521 inventory example in catalog_data-v2 but no style-index record or spec; the James review gives lift-specific dims (below).
- James lift dims (Silver, 4LP521 implied; the article itself does not use the word "Silver" or "4LP"): body D 39.5, H 43.5, W 40 in; seat height 22 in (vs recliner 20 in) — [James review](https://www.stylemeetscomfort.ca/learning-center/review-james-furniture-family). James is listed as rocking, wall, loveseat, sofa, sectional in that article (no explicit lift price; "Power Lift Recliner" mentioned only in dims). UNVERIFIED mapping to 4LP/325 lb comes from the lift guide's Silver series (325 lb) and the app inventory, not from the James article.

### Inferences
- A "Canadian buyer's checklist" (tax exemption, prescription requirements, financing, delivery) is the biggest gap and is directly sales-floor useful.
- The reviews' option price tables are dealer data that could populate a quote helper, but must carry "as of" dates and "dealer-specific" labels.

### Gaps
- Never stated on pages: lift motor counts per tier (Clayton "six-motor" is a massage-motor claim), speed of lift, seat-to-floor lift angle, user weight fit beyond tier capacity, covers by name, and Medicare-style insurance (none; Canada provincial programs not discussed beyond CRA/METC).
- "Silver" and James lift pricing not found in any crawled article.

## B. ALREADY in app (verified)

### Takeaway
All four lift tiers, their capacities, wall clearances, key features, series prefixes, lift-model dims and the Billie/Jean/Liam/Clayton/Pinnacle/Astor records already exist.

### Cited Findings
- Tier capacities and prefixes: Bronze 3BL 300 lb, Silver 4LP 325 lb, Gold 1HM 500 lb, Platinum 1PL/1PH 350 lb. App: mechanism-guide-2026.json (lift-bronze/gold/platinum + crossSourceNotes), recliner-catalog-2026.json (`lift_rating_lbs`), sales-reference-library prefixes (3BL/4LP/1HM/1PL/1PH). Article: [Lift Chair Guide](https://www.stylemeetscomfort.ca/learning-center/lift-chairs-guide) (Bronze "300 lbs", Silver "325 lbs", Gold "500 lbs", Platinum "350lbs").
- Clayton 562: Gold, 500 lb, 13.5 in from wall, backup 9V batteries, dims 45.5 H x 42 W x 40.5 D, seat 23 W x 23.5 D x 22 H, weight 143 lb. App style-index 1HM562 matches exactly. [Clayton](https://www.stylemeetscomfort.ca/learning-center/la-z-boy-clayton-lift-recliner-review)
- Jean 793: body 40.5 H x 32.5 W x 38 D, seat 21 W x 21 D x 19 H, 102 lb — app 3BL793 identical. Billie 794: 39 H x 32 W x 37.5 D, seat 20.5 W x 21 D x 19 H, 103 lb — app 3BL794 identical. [Billie](https://www.stylemeetscomfort.ca/learning-center/review-billie-lift-recliner), [Jean](https://www.stylemeetscomfort.ca/learning-center/review-jean-lift-recliner)
- Platinum zero-gravity position and independent back/legrest (Pinnacle, Astor) — app mechanism-guide `lift-zero-g`, `lift-independent`. [Best-selling](https://www.stylemeetscomfort.ca/learning-center/best-selling-la-z-boy-lift-chairs)
- Headrest 0–55 degrees tilt: app glossary PLATINUM entry has the same range [Headrest & Lumbar article](https://www.stylemeetscomfort.ca/learning-center/la-z-boy-power-recliner-review-lumbar-and-headrest)
- Battery pack basics: article says packs are not compatible with lift chairs; app says "Not for use with LUXURY-LIFT chairs" and "No battery packs on any lift recliner". [Battery article](https://www.stylemeetscomfort.ca/learning-center/la-z-boy-rechargeable-battery-packs)
- Warranty structure: lifetime on frame/springs/mechanism, 3 years electrical, 1 year foam/fabric/battery packs — in app warranty_matrix/mechanism-guide (see C for the lift-mechanism nuance).
- Models Pinnacle, Astor, Clayton, Liam, Billie, Jean, James are all present in app lists; Clayton heat+massage and vibration patterns (3 intensities) exist in `lift-heat-massage`.

### Inferences
- Do not rebuild the tier table; instead cross-link existing tier knowledge to the new Canadian-purchase content in A.

### Gaps
- None for this section.

## C. CONFLICTS with app data (needs review before any use)

### Takeaway
Dealer content disagrees with the app (and sometimes itself) on heat details, lift battery packs, Liam wall clearance, tier feature mapping, and lift-mechanism warranty. The app's manufacturer-sourced data should win unless the user confirms otherwise.

### Cited Findings
1. **Heat & Massage heat/massage specifics.** App (mechanism-guide `lift-heat-massage`): "Heat in the seat and back at two intensities. Shuts off after 15 minutes, runs two cycles, then needs an hour to cool down." Dealer H&M article: heat is lumbar-only; low up to 41 C/106 F, high up to 47 C/116 F; massage 15 or 30 min; after a 30-min cycle, 30 min rest. Clayton review: "3 heat settings for back and seat." Lift Chair Guide: "two high & low heat settings and six motor-massage settings for back and thighs." App stays with the Product Knowledge Library; dealer sources conflict among themselves. [H&M](https://www.stylemeetscomfort.ca/learning-center/heat-massage-upgrade-la-z-boy), [Clayton](https://www.stylemeetscomfort.ca/learning-center/la-z-boy-clayton-lift-recliner-review), [Guide](https://www.stylemeetscomfort.ca/learning-center/lift-chairs-guide)
2. **Rechargeable battery pack on lift chairs.** Pinnacle, Clayton, Billie and Jean reviews list "Rechargeable Battery Pack $300" as a lift upgrade; the dealer's own battery article, the app, and La-Z-Boy's accessory notes say packs are NOT for lift chairs ("require a continuous power source for safety reasons"). Treat reviews' battery line as unreliable copy-paste. [Battery article](https://www.stylemeetscomfort.ca/learning-center/la-z-boy-rechargeable-battery-packs)
3. **Liam wall clearance.** Best-selling article: "about five inches of wall clearance to extend fully"; app: Liam lift 3BL786 recline distance 14.5 in, Bronze 13.5–14.5 in. Five inches is probably the rocker/wall recliner story, not the lift. Use app. [Best-selling](https://www.stylemeetscomfort.ca/learning-center/best-selling-la-z-boy-lift-chairs)
4. **Tier counts/features.** Lift Chair Guide key takeaways say "three tiers — Bronze, Gold, and Platinum" but body says four (adds Silver). Best-selling article says four. Guide also says Gold "adds heat and massage, covered lift base, and adjustable headrest and lumbar support" and "Power lift recliners in the Gold and Platinum tiers can adjust their headrest from 0–55 degrees"; the app places headrest/lumbar on Platinum 1PH only (Clayton 1HM562 has no headrest/lumbar in app features), and the Clayton review itself lists only heat/massage. Guide says Platinum "full seat scale" while app records Platinum weight test 350 lb. [Guide](https://www.stylemeetscomfort.ca/learning-center/lift-chairs-guide)
5. **Size mapping per tier.** Guide: Bronze = petite, Gold = medium, Platinum = large. App: Clayton (Gold) is the widest/deepest lift (42 W, seat 23 W); Pinnacle (Platinum) is petite in canada_lineup_research. The article's own lift reviews call Clayton "among our larger lift recliners" and Pinnacle general-fit. Use per-model dims, not tier size.
6. **Jean "independent back and legrest... unique among Bronze".** Best-selling article only. App Bronze lift (`lift-bronze`) lists a 1-motor sequential lift through full recline and no independent function; `lift-independent` is Gold/Platinum only; canada_lineup_research flags Bronze as sequential. Jean's own review does not claim independent control. Treat as unverified dealer claim. [Best-selling](https://www.stylemeetscomfort.ca/learning-center/best-selling-la-z-boy-lift-chairs)
7. **Lumbar extension.** Pinnacle review "extends up to 3 inches"; Headrest & Lumbar article "up to 3.5 inches"; app mechanism-guide says "about 3 inches" and glossary says "nearly 3.5 in". The app already carries both; dealer pages mirror the discrepancy.
8. **Lift mechanism warranty.** Dealer pages say "Limited Lifetime Warranty covers frame, spring systems, and mechanism" for lift reviews; Problems article says "power mechanisms covered under Limited Lifetime Warranty during the first three years"; H&M article says "frame parts of lift recliner chairs are covered for lifetime", electrical 3 years. App: lifetime on frame only for lifts, 3 years on recline & lift mechanism, springs and electrical, 1 year foam/fabric. App matches the narrower reading; do not quote dealer "lifetime mechanism" for lifts.
9. **Clayton details.** Review: "six-motor functionality" (best-selling) vs "6-motor vibration massage" (Clayton review) — massage motors, not lift motors. Clayton height guidance "6'3 and up" vs "average to taller users" in the same article. Clayton price $3,869 (review) vs store listing $4,389.95/$5,629.95. Clayton "number of heat settings" see item 1.
10. **Lift cover/leather rule** (new vs app but may contradict `Select leather` notes): dealer says lift chairs do not come in real leather; app has no explicit rule, and recliner-catalog lift records are fabric-only ("FS"). Compatible; just verify the app does not show leather options on lift styles.
11. **Pricing staleness.** "Lift chairs start at $1,200 / $1,500 / $1,899 / $1,800–$3,000" are inconsistent among dealer articles; per-model "starting at" prices from 2026 reviews are the only usable figures. App has no retail prices to conflict with (pricebook-check-2026.json has none for these models), so these are additive but unverified for other Canadian regions.

### Inferences
- Conflicts 1–2, 4, 6 are the most likely to cause wrong sales claims if copied; flag them rather than merge.

### Gaps
- No manufacturer tear pad or price book in the crawl to adjudicate items 1, 4 and 6.

## D. URLs crawled

### Takeaway
All lift-related learning-center articles on the lift-chair tag plus the linked model reviews were read. The generic learning-center index shows only the 10 newest items; the full catalog is paginated.

### Cited Findings
Read in full (HTTP 200):
- https://www.stylemeetscomfort.ca/learning-center/best-selling-la-z-boy-lift-chairs (Dec 28, 2025; "Best La-Z-Boy Lift Chairs for Comfort and Mobility Support")
- https://www.stylemeetscomfort.ca/learning-center/review-pinnacle-furniture-family (linked as /pinnacle-power-lift-recliner-review; redirects; Mar 31, 2026)
- https://www.stylemeetscomfort.ca/learning-center/la-z-boy-clayton-lift-recliner-review (May 12, 2026)
- https://www.stylemeetscomfort.ca/learning-center/la-z-boy-astor-recliner-review (linked as /in-depth-review-of-the-astor-platinum-power-lift-recliner; Apr 1, 2026)
- https://www.stylemeetscomfort.ca/learning-center/review-liam-furniture-family (Jun 6, 2026)
- https://www.stylemeetscomfort.ca/learning-center/review-billie-lift-recliner (Mar 19, 2026)
- https://www.stylemeetscomfort.ca/learning-center/review-jean-lift-recliner (May 27, 2026)
- https://www.stylemeetscomfort.ca/learning-center/review-james-furniture-family (Apr 3, 2026)
- https://www.stylemeetscomfort.ca/learning-center/lift-chairs-guide (Oct 16, 2025; Lift Chair Buyer's Guide)
- https://www.stylemeetscomfort.ca/learning-center/lift-recliner-chair-cost (Aug 14, 2025; via blog URL /blog/la-z-boy-lift-chair-recliner-costs/)
- https://www.stylemeetscomfort.ca/learning-center/lift-chairs-tax-deductible-canada (Mar 9, 2026)
- https://www.stylemeetscomfort.ca/learning-center/heat-massage-upgrade-la-z-boy (Jun 24, 2026)
- https://www.stylemeetscomfort.ca/learning-center/la-z-boy-rechargeable-battery-packs (Feb 28, 2026)
- https://www.stylemeetscomfort.ca/learning-center/la-z-boy-power-recliner-review-lumbar-and-headrest (Feb 19, 2026)
- https://www.stylemeetscomfort.ca/learning-center/problems-lift-recliners (Jan 20, 2026)
- https://www.stylemeetscomfort.ca/products/catalog/Clayton-Gold-Power-Lift-Recliner-w-Massage-Heat (product page)
- https://www.stylemeetscomfort.ca/learning-center (index, 10 items), /learning-center/tag/lift-chair (9 items), /learning-center/page/2 (links only)

Not fetched (linked but out of scope or budget): product pages for Pinnacle rocking/loveseat/sofa, Astor fabric/rocking/wall, Liam rocking/sofa, Jean fabric (store listings), /learning-center/recliner-best-fit, /fabric-grades, /flexiti-financing, /furniture-protection-plan, /la-z-boy-recliner-warranty-breakdown, /power-control-instructions, /safety-features-la-z-boy-recliner, /service-department, /furniture-delivery-services, iClean and related fabric articles, /how-to-measure-a-room-for-furniture, /design-service, /locations.

Learning-center article titles seen (index page, newest first, as of crawl):
1. The 2026 CHEO Dream Home: Furnished by La-Z-Boy — /learning-center/the-2026-minto-dream-home-for-cheo-furnished-by-la-z-boy (Sep 15, 2026)
2. A Catalogue of the 2026 Minto Dream Home — /learning-center/2026-minto-dream-home-catalogue (Sep 15, 2026)
3. Review of the La-Z-Boy Ace Recliner: Rocking & Wall Recliner — /learning-center/review-ace-recliner (Jul 22, 2026)
4. How Long Does Custom Furniture Take? Understanding Furniture Lead Times — /learning-center/how-long-custom-furniture-build (Jul 18, 2026)
5. Attached vs. Detached Cushions: Which Sofa Cushion Type Is Better? — /learning-center/attachable-vs.-detachable-cushions (Jul 17, 2026)
6. La-Z-Boy Pet-Friendly Fabric Review — /learning-center/pet-friendly-fabric-review (Jul 16, 2026)
7. Will AI Replace Interior Designers? — /learning-center/will-ai-replace-interior-designers (Jul 15, 2026)
8. Review of the La-Z-Boy Opal Swivel Chair & a Half — /learning-center/review-opal-swivel-chair (Jul 14, 2026)
9. Supporting Families During Hard Times: La-Z-Boy Furnishes Ronald McDonald House in Ottawa — /learning-center/ronald-mcdonald-ottawa (Jul 13, 2026)
10. Review of La-Z-Boy's Summit Series: Oversized Recliners — /learning-center/review-summit-series (Jul 12, 2026)

Page 2 (/learning-center/page/2) slugs only: best-chairs-back-pain, review-cassian-furniture-family, area-rug-selection, review-cade-furniture-family, sofa-vs.-couch, review-armitage-sectional, how-to-furnish-a-home-in-gatineau, review-acadia-furniture-family, how-to-furnish-a-home-in-kingston-furniture, review-quinault-furniture-family (titles not extracted; page cached, markdown not returned).

Lift Chair tag (/learning-center/tag/lift-chair), newest first: Clayton review (May 12, 2026), James Furniture Family review (Apr 3, 2026), Billie review (Mar 19, 2026), Rechargeable Battery Pack (Feb 28, 2026), Power Recliners with Headrest & Lumbar (Feb 19, 2026), Common Problems with Power Lift Recliners (Jan 20, 2026), Best La-Z-Boy Lift Chairs (Dec 28, 2025), Lift Chairs Ultimate Guide (Oct 16, 2025). The Jean, Liam, Pinnacle, Astor, tax, cost and H&M articles are not tagged lift chair but are lift-relevant.

Failures/anomalies: none blocked by proxy. Old `/blog/...` URLs resolve to the `/learning-center/...` slugs. The "Pinnacle lift" link lands on the full Pinnacle family review, not a lift-only article. The `/learning-center/page/2` scrape returned only links (cached), so full article titles beyond page 1 were not captured; deeper pages (3+) not crawled. Full learning-center size is therefore unknown (page 1 plus tag pages seen; recliner/sofa tag archives not enumerated).

### Inferences
- Articles marked "updated twice a year" imply pricing refreshes around spring and fall; re-crawl then.

### Gaps
- Complete learning-center article list (pages 3+, other tags) was not enumerated.

## E. Suggested app features/resources this content could fuel

### Takeaway
Best value: a Canadian lift-chair purchase guide (tax/financing/delivery), a lift model comparison with fit language, and a "claims to avoid" cheat-sheet from the conflicts.

### Cited Findings
- **Lift tax and prescription card:** the CRA eligibility steps, who can write the order, what to keep for METC, "zero-rated incl. delivery and warranty," with a "confirm with tax professional / not tax advice" disclaimer. Source: [Tax article](https://www.stylemeetscomfort.ca/learning-center/lift-chairs-tax-deductible-canada), [Cost article](https://www.stylemeetscomfort.ca/learning-center/lift-recliner-chair-cost). Flag Ontario/Quebec specifics as unverified.
- **Lift chair quick-compare table:** Billie vs Jean vs Liam vs James(Silver) vs Pinnacle vs Astor vs Clayton using existing app dims plus dealer "fit" phrases, cover counts (5/5/4 select fabrics, leather yes/no), tier, capacity, wall clearance; tag every dealer claim as unverified.
- **Sit-test coaching for lifts:** 90-degree feet, head support, "height not set in stone" lines, plus the "seat height 19 vs 22 in" cue (Billie/Jean 19 in; Clayton/Pinnacle/Astor/James lift 22 in per app/dealer).
- **Objection-handling snippets:** "lift chairs don't weaken muscles," "doesn't look like a medical chair" (Billie/Lisa Kemp), cost justification, financing; source [Problems article](https://www.stylemeetscomfort.ca/learning-center/problems-lift-recliners).
- **Heat & Massage expectation-setting card:** what it does/doesn't do, daily-user fit, with a conflict note until La-Z-Boy confirms 15/30-min and heat temps.
- **Service quick-ref:** common lift issues and first checks (remote batteries; motor noise reports; replacement motor $100–$300 dealer estimate).
- **Delivery/pickup helper:** dealer fee table as store-configurable (Ottawa/Gatineau/Kingston only).
- **Data hygiene flags** for glossary/mechanism-guide: do not add "battery pack on lift", "Jean independent back/legrest", "Liam 5 in clearance", or "lift lifetime mechanism" claims.
- **Price table with "as of" dates** for dealer-level starting prices (A) in an optional store-specific module, never in global reference data.

### Inferences
- A "dealer content" provenance tag on imported items would keep Ottawa-region fees/prices from being mistaken for corporate Canada-wide terms.

### Gaps
- No lift-chair pages from Canada-wide La-Z-Boy (lazboy.ca) were crawled, so national tax/financing/delivery terms remain unverified.
