# App data vs the April 2026 Product Information Guide

Checked: every style in the app's recliner, motion, Designer's Choice and stationary catalog JSON (749 styles) against the guide's PROD SPECS and DIMENSIONS sheets, matched on style number (prefix + model, for example 10X724).

| Check | Result |
|---|---|
| Style exists in the guide | 749 of 749 |
| Dimensions (H x W x D) agree, 0.6 in tolerance | 716 of 749 (33 differ) |
| Options agree | 737 of 749 (12 differ) |

Nothing here has been changed in the data. The guide and the app's catalogs may be different editions, so each difference needs a decision: which one is right for your floor.

## Dimension differences (app vs guide)

| Model | Styles | App | Guide |
|---|---|---|---|
| 512 Pinnacle | 330, 320, 339, U39 | height 42 | height 41 |
| 512 Pinnacle | 33U, 33X | width 80.5 | width 81.5 |
| 512 Pinnacle | U39, X39 | width 74.5 | width 75.5 |
| 727 | U49, X49 | width 78 | width 75.5 |
| 747 | 32U, 32X | width 57 | width 61 |
| 769 Ava | U4A, X4A, U4B, X4B, 44C, U4D, X4D, U4E, X4E, M44, 44S, U4S, X4S | depth 39 | depth 41 |
| 786 | 32U, 32X | width 58 | width 62 |
| 804 | 36U, 36X | width 83 | width 87 |
| 807 | U39 | width 72 | width 76 |
| 812 Acadia | 8AU, 8BU, 8SU, 85U | height 34.5 | height 42 |

## Option differences

| Style | In app only | In guide only |
|---|---|---|
| P16725 | none | FN |
| 10U747, 10X747 | FN | none |
| 10X803 | none | RW |
| 16X827 | WL | LW |
| 30R512 | none | L3 |
| 360807 | none | 1H, 2E, 3H |
| X46828 | NN | none |
| 240435 | FN | none |
| 60M694, 6MM694 | FP | none |
| 60R694 | P1 | none |

## Label to check

The app's text calls its catalogs "Summer/Fall 2026" (26 places). The recliner and stationary catalogs in the project are labelled Winter/Spring 2025. Confirm which edition the JSON was built from.
