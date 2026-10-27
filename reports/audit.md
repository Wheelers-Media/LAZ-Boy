# App audit (functionality, UI, UX, copy, accessibility)

Method: every workspace rendered at 1280 px and 390 px, plus an automated pass for contrast, text size, tap targets, labels and headings (`report.json` figures below are from that pass). Seen by eye, not only by script.

## Must fix (P0)

| # | Finding | Where | Fix |
|---|---------|-------|-----|
| 1 | Floor Unit page is unstyled: no card padding, selects full width, summary lines run together ("Model-listed coverChoose a sourced cover") | Floor Unit | Give the workspace real layout classes: two columns, padded cards, label/value rows |
| 2 | Grey text is too faint everywhere: 19 distinct pairs under 4.5:1, some as low as 1.5:1 | all | Darken the muted-text tokens once in brand.css; no inline greys |
| 3 | Text still under 12 px (9 to 10.5 px) on every page | all | Raise to 12 px minimum |
| 4 | Provenance wording leaks into the UI ("Catalog model / Supplemental recliner index · verify specs", "Designer's Choice / Catalog index / Rocking recliner supplement" on every Product Index row) | SKU Builder, Product Index | Show model name, code and collection only |
| 5 | Studio cover fields come pre-filled with "D / 1808 / 52", which reads like a real cover | Sectional Studio | Start empty; offer a swatch picker from the cover program |
| 6 | Fit page has no heading; search box has no label; checkboxes are 13 px | Fit, Fabrics, SKU, Studio | Add h1 / aria-label, enlarge hit areas to 44 px |

## Should fix (P1)

- **Fit step 1 is too long.** It asks for a scale card, a height, a weight, two comfort selects and three optional measurements. The scale card duplicates the height. Keep height and weight on step 1; move comfort and measurements to an optional "More detail" fold.
- **Scale cards wrap 3 + 1.** Use one row of four on desktop.
- **Disclaimers repeat** (Code preview only / Planning aid only / Entry preview not order-validated / Evidence-aware). One quiet line per page is enough. Drop the "Evidence-aware" pill.
- **SKU Builder jargon:** "Match the screen", "RMS stock fields", "Grade: Enter". Use plain labels ("Fabric grade").
- **SKU Builder** puts a printable customer summary and checklist under the builder at all times. Collapse it until asked.
- **Product Index** is a single 8,000 px list of about 300 rows with no filters, no images and no grouping. Add collection and type filters, group by collection, and show a thumbnail slot.
- **Fabrics & Care** shows three grade cards and a cleaning-code select but not one fabric. The cover program (161 fabrics, 50 leathers, colour names) should be browsable here: grade, search, swatch grid, care code.
- **Studio:** presets hide in a dropdown (make them buttons); the yellow "Plan your room" banner repeats the empty state; piece select is truncated ("44D / U4"); the wall-gap line names sides of the drawing, not of the room.
- **Phone:** the Studio toolbar wraps in two rows and the plan is small. Put tools in one scrollable row and let the plan use the full width.
- **Customer mode** has not been reviewed rendered; it should be larger, calmer and free of codes.

## Gaps against the goal (P2)

- Photos and recognition drills (the "identify any chair by sight" goal) are not in the app.
- No shareable fit summary or saved plans (Studio phase 2).
- No compare view for two models.
- Corner and chaise outlines are rectangles; the catalog gives only width and depth.
- 427 cover colour pairs have no name in the supplied catalogs.
- Housekeeping: hidden `LegacySectional` tab is dead code; `logic.js` is 1,400 lines; test script and pinned deps.

## Looks good

Brand colour and logo are consistent, the rail and phone tab bar are clear, the Fit stepper is easy to follow, Studio drawing is true scale with no overlaps, no console errors on any page, no horizontal scroll at 390 px.
