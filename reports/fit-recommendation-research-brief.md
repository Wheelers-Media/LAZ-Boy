# Fit recommendation audit + research brief

**Purpose:** Attach this file to Gemini Deep Research along with the project files listed below. This brief describes the current implementation, an enumerated zero-result audit, and the specific manufacturer evidence to research. It is a research handoff, not a recommendation to change behavior without review.

## Project context

This repository contains a customer-facing La-Z-Boy floor assistant aimed at Canadian retail conversations. The Fit flow collects preferred scale, approximate height, optional weight, clearance, shopping category, mechanism, and upholstery preferences. Its result list currently comes from a narrow hand-curated research file, not from all local catalog models.

The app has extensive reference catalogs and model data, but most of those data are not currently considered by `getRecommendations` as fallback candidates. It would be useful to show a documented model lead for more customer variants, while never asserting unsupported fit, capacity, clearance, compatibility, or Canadian availability.

## Codebase findings

Relevant files to attach:

- `src/logic.js` — `researchFitBand`, candidate filters, `modelCapacity`, and `getRecommendations`.
- `src/main.jsx` — customer answer choices, scale/height selections, and Fit results UI.
- `test/fit-recommendations.test.js` — existing recommendation expectations and safety regression cases.
- `public/canada_lineup_research.json` — the current four-band candidate list and research evidence.
- `public/catalog_data-v2.json` — master product, prefix, capacity, and tear-pad profile data.
- `public/recliner-catalog-2026.json`, `public/recliner-collection-index-supplement.json`, `public/motion-catalog-2026.json`, `public/stationary-catalog-2026.json`, and `public/designers-choice-catalog-2026.json` — manufacturer catalog transcriptions used elsewhere in the app.
- Relevant files under `data/tear-pad-profiles/` for any model you research.

### Exact recommendation pipeline

1. Height selects a single band in `public/canada_lineup_research.json`: Petite (64 in and under), Small to Medium (65–69 in), Tall / Large (70–74 in), Extra Tall / XL (75 in and above).
2. If the selected scale label does not agree with the height-derived band, `researchFitBand` returns `null`, and recommendations are empty.
3. Candidates come only from that band’s small hand-curated list. Other model, catalog, and tear-pad data do not populate the recommendations.
4. Candidate rows are filtered by category, mechanism list, and conflict status. Conflicting fit rows are intentionally excluded.
5. If a weight is supplied, a candidate without an indexed capacity is removed; capacity can only be inferred from local model records or the tightly scoped 1PL512 lift evidence.
6. `getRecommendations` unconditionally drops `No reclining mechanism`, including stationary and sleeper selections, even though `matchingPrefixes` recognizes those as compatible catalog prefixes.
7. Current tests intentionally assert empty results for a conflicting tall sectional and for a scale/height mismatch. Those can remain safety-oriented states, but they should be distinguishable from a missing candidate and should explain themselves.

### Candidate coverage currently in the four research bands

| Height band | Current candidates | Important limits in current data |
|---|---|---|
| Petite, up to 5′4″ | Pinnacle 512, Vail 403 | The Canadian dealer height descriptions for Pinnacle conflict (one source says 5′3″ and under, another 5′4″–5′9″). Vail has qualitative petite guidance without a numeric range. Neither should be described as a confirmed fit. |
| Small / Medium, 5′5″–5′9″ | James 521, Rowan 765, Harbor Town 799 | James is explicitly marked conflicting and withheld. Rowan/Harbor Town are secondary dealer leads without manufacturer-confirmed fit. |
| Tall / Large, 5′10″–6′2″ | Trouper 724, Morrison 766, Greyson 530 | Trouper is marked conflicting and withheld. Morrison and Greyson rows are narrowly scoped to power motion mechanisms; they are sofa candidates, not evidence for recliner, lift, high-leg, stationary, or sleeper categories. |
| Extra Tall / XL, 6′3″+ | Astor 519, Redwood 776, Randell 777, Ace 805 | Evidence is incomplete and market/configuration varies. Ace has no Canadian evidence in the current report; Redwood has qualitative larger/taller evidence but no official capacity limit. |

No current candidate band lists high-leg designer, stationary suite, or sleeper models. Stationary catalog/tear-pad data includes many model/style configurations, but there is no associated ergonomic fit research for these scales in the present research file.

### Reproduced code audit

I ran a deterministic matrix against the actual `getRecommendations` and `matchingPrefixes` functions. It crosses all 4 scale choices with all 9 height choices (36 pairs, including the 27 mismatches the UI permits), all categories, the 3 clearance choices, every mechanism choice surfaced by `matchingPrefixes` for that build, and weight omitted or set to each of the 4 displayed capacity tiers (300, 325, 350, and 500 lb).

- **17,100 reachable build combinations** across all 36 scale/height pairs and weight states. Only **4,275** use a height and scale that agree with one of the research bands; the other **12,825** mismatched combinations all return no result because there is no selected band.
- Across the full cross-product, **297** combinations produce at least one Fit recommendation and **16,803** return no recommendation. Therefore, **1.74%** of the matrix returns a lead.
- Looking only at the 9 *aligned* scale/height pairs: **297/4,275** have a lead, and **3,978/4,275** have no lead. This isolates category, mechanism, weight, and evidence coverage from the separate height/scale mismatch behavior.
- With weight omitted, all scale/height pairs produce 3,420 reachable rows; 3,285 return no recommendation, including 2,565 scale/height mismatches. Within aligned pairs, 720 of 855 weight-skipped builds have no lead (135 have at least one).
- In **378 aligned weighted combinations**, a lead exists with weight omitted but disappears when one of the listed weight tiers is selected. Other weighted rows were already empty without weight. Unknown capacity is treated as exclusion once weight is supplied.
- Category tally across the full matrix: Recliners **3,642/3,780 empty**; High-leg designer **2,520/2,520 empty**; Motion sofas / loveseats **3,735/3,780 empty**; Modular sectionals **2,160/2,160 empty**; Stationary suites **540/540 empty**; Sleepers **540/540 empty**; Lift chairs **3,666/3,780 empty**. These totals include all 36 scale/height pairs, including the 27 mismatches, and sum to 16,803 empty rows. Restricting the tally to aligned scale/height pairs across five weight states gives: Recliners **807/945 empty**; High-leg designer **630/630 empty**; Motion sofas / loveseats **900/945 empty**; Modular sectionals **540/540 empty**; Stationary suites **135/135 empty**; Sleepers **135/135 empty**; Lift chairs **831/945 empty** (3,978 empty rows).

This is finite over the UI’s listed answer values, not every possible height or weight. Mechanism choices are restricted to the values `matchingPrefixes` makes visible for the selected category and clearance. The aligned and mismatched counts above are derived from the UI’s actual scale labels and height choices. One additional UI caveat: `initialAnswers.scale` starts as `Average / Mid-Scale`, which the logic maps to Small to Medium, but that text is not one of the four rendered scale buttons; initially no scale card appears selected. The enumerated matrix counts the four selectable scale choices and does not treat this legacy default alias as a fifth distinct scale.

**Root causes for the 3,978 empty, aligned scale/height combinations (classified by the first rejection point in the recommendation pipeline):**

- **3,495/3,978:** no guide candidate survives category, mechanism, and conflict filtering. High-leg, stationary, sleeper, and sectional cases are especially affected: those categories are absent from the four-band shortlist or potentially relevant models are withheld for conflicting evidence.
- **426/3,978:** capacity filtering removes every remaining candidate because the selected weight exceeds a known limit or the candidate capacity is unknown. Never relax a known limit. Consider distinguishing “capacity not verified” from “over documented capacity” in the UI.
- The **remaining 57** empty combinations pass category/mechanism/conflict and capacity filtering but are stopped by later guards. Candidate-level rejection tallies across those rows are: **36** from the 1PL512-specific weight check, **15** from the unconditional `No reclining mechanism` rejection, and **24** from lift/category mismatches. These are overlapping candidate rejection tallies (one row can reject several candidates), not a disjoint partition of the 57 rows.

The row accounting is 3,495 + 426 + 57 empty + 297 with leads = 4,275 aligned combinations. Separately, the **12,825** scale/height-mismatch combinations are empty because `researchFitBand` cannot select a band; the actual UI permits those mismatches because scale and height can be changed independently.
## Research question for Gemini Deep Research

Use the repository files as the current implementation and data specification. Do not edit code. Research source-backed candidate coverage across La-Z-Boy **Canada** models, distinguishing manufacturer evidence from dealer claims and distinguishing product/style capability from ergonomic fit.

### Priority research scope

1. Find current Canadian manufacturer/official sources for exact model, category, mechanism/configuration, fit guidance, seat measurements, room-clearance requirements, and capacity where published. Search La-Z-Boy Canada product pages, Canadian catalogs/product information guides, manuals, official tear pads, and official warranty/spec documents first.
2. Specifically investigate gaps in the current four fit bands: high-leg designer chairs; stationary sofas, loveseats, chairs, and sleepers; motion sofas/loveseats and modular sectionals; lift chairs; and all scale bands with no current candidate.
3. Trace the current candidate evidence and conflicting claims for models 512 Pinnacle, 403 Vail, 521 James, 765 Rowan, 799 Harbor Town, 724 Trouper, 766 Morrison, 530 Greyson, 519 Astor, 776 Redwood, 777 Randell, and 805 Ace. Resolve conflicts only with authoritative evidence; do not silently choose one side.
4. Search candidate models from the attached 2026 catalogs and tear pads, but do not call a candidate a “fit match” just because its category or style prefix exists. A catalog listing proves listed product/configuration facts only, not a body-fit claim.
5. Treat US-market sources as non-Canadian evidence and label them. Secondary dealer sources may provide research leads, not manufacturer confirmation. Cite direct URLs, title, page/section, market, configuration, and access/currentness date for each claim.

### Required output

1. Root-cause check against the code audit above, noting any correction to the enumerated combination coverage.
2. A coverage matrix by scale/height band × all seven customer categories × mechanism family. For each cell report: manufacturer-fit-supported candidate(s), secondary/provisional leads, capability-only catalog models, or no evidence. Separately flag clearance and capacity evidence gaps.
3. A source-cited, configuration-specific model candidate table with market, model/style, mechanism, fit evidence, capacity evidence, clearance, and uncertainty/conflicts.
4. Recommendation for a ranked multi-tier result UI: for example, source-backed fit lead; provisional/secondary lead; same-category capability to investigate; or “no verified fit lead” with the closest evidence-backed alternatives clearly marked. This is a proposal for review, not permission to present an unverified alternative as a match.
5. Hard boundaries: never display a known over-capacity product as suitable; unknown capacity is not unlimited; do not relax a stated hard customer constraint without explicit acknowledgement; do not call an unverified source/configuration “Canadian”, “manufacturer-confirmed”, or “compatible”.
6. A finite test plan generated from the actual UI answer options, including height/scale mismatch cases, every category, mechanism, clearance, each capacity tier plus no weight, conflicting claims, unavailable/missing evidence, and a guarantee that the UI gives a useful explanatory state when no candidate survives. Distinguish a model lead from a confirmed fit.
7. Open product/business decisions that must be answered before implementing fallback behavior.

## Gemini prompt (copy/paste)

> You are researching a Canadian La-Z-Boy sales-floor recommendation app. I have attached a codebase audit with the relevant source file list, exact recommendation pipeline, existing candidate bands, and a deterministic coverage audit. I have also attached the named source files from that repository.
>
> First inspect the attached `src/logic.js`, `src/main.jsx`, `test/fit-recommendations.test.js`, `public/canada_lineup_research.json`, master catalog, 2026 catalogs, and relevant tear-pad profiles. Reproduce or audit the stated no-result analysis against the actual code and identify any mistakes or additional causes. The app has seven categories (Recliners; High-leg designer; Motion sofas/loveseats; Modular sectionals; Stationary suites; Sleepers; Lift chairs), four scale bands, several height choices, seven mechanism choices, three clearance choices, and optional capacity values. Some height/scale combinations are inconsistent because the two answers can be selected independently.
>
> Then use **Gemini Deep Research and web search** to research missing coverage. Prioritize official La-Z-Boy Canada manufacturer pages, Canadian product catalogs, Canadian product information guides, official manuals, official tear pads, and manufacturer specifications. Focus particularly on categories that currently return no match: high-leg chairs, stationary seating/suites, sleepers, sectionals, motion sofas, and lift chairs across the four fit scales. Also reassess the listed candidates Pinnacle 512, Vail 403, James 521, Rowan 765, Harbor Town 799, Trouper 724, Morrison 766, Greyson 530, Astor 519, Redwood 776, Randell 777, and Ace 805.
>
> For every factual claim provide a direct source URL and title plus page/section where available, market (Canada or US), exact model/style/configuration, and whether the source is manufacturer or dealer/secondary. Use US information only as clearly labeled non-Canadian context. Dealer recommendations are provisional leads only. A model’s presence in a catalog, matching category, or compatible mechanism does **not** by itself prove that it fits a given customer’s height or body proportions. Do not invent fit ranges, capacity limits, room clearance, availability, or compatibility. Preserve contradictions and explain their consequences.
>
> Deliver a research report—not code—with: (1) confirmed or corrected zero-result causes, (2) a scale × category × mechanism evidence coverage matrix, with clearance/capacity caveats, (3) a cited candidate table by exact configuration, (4) a proposed tiered fallback policy that distinguishes manufacturer-supported fit guidance, secondary/provisional leads, catalog-only capability, and no verified fit, (5) hard safety/evidence boundaries, (6) an exhaustive finite regression test plan based on the app’s actual answer choices, and (7) product/business decisions required before coding. When a candidate has known weight capacity lower than the shopper’s selected weight, never show it as suitable. If no safe/verified candidate exists, recommend an explanatory no-confirmed-fit state with clearly marked alternatives, not a fabricated match. Do not modify code or data.
>
> The attached codebase audit is the source of truth for current behavior; correct it if your direct inspection shows a discrepancy. Keep the distinction clear between a useful *model to explore* and a verified *customer fit match*.

### Attach these project files with the prompt

Attach this brief plus these project files (or upload the repository archive if Gemini accepts it):

- `src/logic.js`
- `src/main.jsx`
- `test/fit-recommendations.test.js`
- `public/canada_lineup_research.json`
- `public/catalog_data-v2.json`
- `public/recliner-catalog-2026.json`
- `public/recliner-collection-index-supplement.json`
- `public/motion-catalog-2026.json`
- `public/stationary-catalog-2026.json`
- `public/designers-choice-catalog-2026.json`
- Relevant `data/tear-pad-profiles/*.json` files. For coverage questions, start with profiles whose model codes occur in the candidate research bands or 2026 manufacturer catalogs; preserve exact source/configuration notes.
