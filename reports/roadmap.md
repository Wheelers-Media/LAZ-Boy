# Floor Assistant: what it is, where it is, where it can go

## What the app is for
A phone and tablet tool for a La-Z-Boy salesperson standing with a customer. Three jobs: work out what fits this person and room, decode or build the RMS string, and answer questions about fabrics, leathers and care. It never shows price, stock or ordering, and it keeps the catalogs as the source of truth.

## Where it is now
| Workspace | What it does well | Main gaps |
|---|---|---|
| Fit & discover | 5-step wizard, height and weight checks, clearance, recommendations that refuse to overstate evidence | Long; results page mixes product leads and caveats; no way to save or send a result |
| SKU Builder | Decode and build RMS strings, round-trips tested | Model list labels carry provenance text; cover picker only shows swatches the model lists, with names for 299 of 726 April colors |
| Product Index | Searchable index across recliner, motion, designer and stationary catalogs (751 styles) | No photos; no side-by-side compare; no "looks like" teaching for the identification drills |
| Floor Unit | Single-piece configuration | Overlaps with the studio; no room view |
| Sectional Studio | Real pieces, validation rules, RMS lines | Rebuilt this round (see below) |
| Fabrics & Care | April 2026 fabrics (161) and leathers (50), care codes | No swatch images; no filter by color family or cleaning code |
| Support | Reference text | Static |

Data: catalog JSON in `public/`, tear-pad profiles in `data/tear-pad-profiles/` (16 collections with width, depth, height and recline length for every piece), import scripts in `scripts/`, 83 tests.

## Done in this round
- Catalog data checked against the project PDFs (3 models added, 29 corrections), April covers rebuilt, 299 color names added.
- Sectional Studio rebuilt as a true-scale SVG plan: every piece uses its catalog width and depth, pieces cannot overlap or leave the room, edges snap flush, recliners show the floor they need when fully reclined, undo and redo, keyboard control, print.
- All 47 starting layouts (4 layouts across 16 collections, where the pieces exist) now pass the layout checks, after fixing a check that treated pieces up to 22 in apart as touching.

## Next, in order of value
1. **Sectional Studio, phase 2**
   - True corner and chaise outlines. The catalogs give one width and depth per corner, not its outline, so corners are drawn as boxes for now. The April guide has wall-space numbers (for example 98 in for a rounded corner) that can define the real L.
   - Doors, windows, a TV wall and traffic paths so the plan shows what the room really allows.
   - Save and reopen plans (browser storage), and a customer-ready printout with the piece list.
   - Mixed rooms: add a rug, coffee table or side table at fixed sizes so the plan reads as a full room.
2. **Fit result you can hand over.** A one-page summary of the customer's height, weight and room answers, the product leads and the next step, printable or shareable as a link with no server.
3. **Photos and identification drills.** Quiz mode from the product index (arm, back, base) with the one-line giveaway per model, scored over time on the device.
4. **Swatch support.** Color names for the remaining 427 April colors need the swatch pages from the current color book; add swatch images once you have them.
5. **Compare.** Two or three models side by side: dimensions, recline length, covers, options.
6. **Housekeeping.** A `test` script in `package.json`; pin dependency versions instead of `latest`; remove either `vercel.json` or the Cloudflare worker; split `logic.js` (1,457 lines) into recommendation, SKU and sectional files.

## Limits that stay
Nothing in the app claims price, stock, order validity or Canadian availability. Piece sizes come only from the catalogs and tear pads; where a size is missing the piece cannot be placed.
