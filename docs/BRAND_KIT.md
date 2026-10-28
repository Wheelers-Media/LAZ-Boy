# La-Z-Boy brand kit for the Floor Assistant

Visual board: `/brand-kit.html` (source `public/brand-kit.html`).
Code tokens: `src/brand-tokens.css` (new) on top of `src/brand.css` (core colours).

## Sources and evidence

| Source | What it is | Tier |
|---|---|---|
| **La-Z-Boy Incorporated, Brand Standards 2026** (18-page PDF, supplied by Nathan) | Corporate brand standards. Primary source for this kit. Not specific to Canada or to Furniture Galleries stores. | A (manufacturer) |
| La-Z-Boy brand guidelines web pages (brandguidelines.la-z-boy.com: Primary Logo, Color Palette, Typography) | Older web guidelines. Used only where the PDF is silent, and labelled as such. | A (manufacturer), but conflicts with the PDF, see below |
| Fast Company, 29 Jul 2025 | Press report on the 2025 refresh. Voice and design intent only. | B, provisional |
| Contrast ratios | Computed here from the published RGB values. | Not a manufacturer figure |

The brand purpose, from PDF p.2: **"To inspire the future of comfort."** The identity was "designed and relaunched in 2025".

## The two sources disagree about the palette

The PDF palette is navy, forest, cream, sky, sea, storm, claret. The older web guidelines list navy, cream, forest plus **blue, sage, rust, peach**. Those four are not in the PDF anywhere. Neither source says which one supersedes the other. This kit follows the PDF, because that is the document you pointed me to and it is the one that includes colour pairings and accessibility rules. Please confirm it is also the standard your store is expected to follow, because the PDF is the Incorporated (corporate) edition.

What this means for the app: `brand.css` still uses blue, sage and rust on 35 lines (selected cards, focus ring, active marker, chips, floor-plan outlines). They are now marked LEGACY in `brand.css` and left working. A proposed mapping is at the end. Nothing was changed there without your say-so.

The web page's printed hex codes were wrong (green and blue bytes swapped). The PDF's hex codes are correct and agree with the RGB values on the web page for navy, cream and forest. Use the hex below.

## 1. Logo

Rules (PDF pp.4 to 8):

- Navy logo on light backgrounds (primary). **Cream** logo on dark backgrounds (reverse).
- Black logo on light and white logo on dark are for when colour printing is not available.
- Never: stretch or condense; use any colour other than navy, cream, black or white; outline it; add a drop shadow; remove the registered trademark symbol.
- Minimum size: **100 px / 1.39 in / 35.3 mm wide**.
- Clear space: **the height of the "o" on every side**.
- The plain "La-Z-Boy" wordmark is the consumer-brand logo. The "INCORPORATED" lockup is for the corporate entity and the full portfolio (La-Z-Boy, Joybird, England). The app correctly uses the plain wordmark.

Extra rules from the older web pages (not in the PDF, still sensible): don't isolate a single letter, don't add taglines or store names to the lockup, don't put it over busy imagery. Naming per the web pages: "La-Z-Boy" or "La-Z-Boy + City"; not "Furniture Galleries".

**Dark mode (fixed):** the app now swaps in `public/lazboy-logo-cream.png`, the official cream logo you supplied (resized from 2000 to 900 px wide, no recolouring). It replaces the white `lazboy-logo-light.png`, which is now unused. Note the supplied files are not exactly the PDF swatches: the navy logo's pixels are #00314A (PDF navy #003349) and the cream logo's are #ECE3D0 (PDF cream #E6E2D5). They are the official artwork, so they are used as-is. The cream file's edges also look soft, as if it was upscaled from a smaller original; ask for a vector or larger cream file if it looks fuzzy on a big display.

## 2. Colour (PDF p.9)

Hierarchy: **primary** navy; **secondary** forest, cream; **tertiary** sky, sea, storm, claret. "Maintain the relative colour balance shown on the page": navy dominant, forest and cream large, the four tertiary colours small.

| Role | Name | Hex | RGB | Pantone | CMYK |
|---|---|---|---|---|---|
| Primary | Navy | #003349 | 0, 51, 73 | 2189 C | 100, 70, 30, 65 |
| Secondary | Forest | #00534C | 0, 83, 76 | 330 C | 93, 23, 65, 57 |
| Secondary | Cream | #E6E2D5 | 230, 226, 213 | 9080 C | 6, 8, 12, 0 |
| Tertiary | Sky | #B2E2ED | 178, 226, 237 | 290 C | 28, 0, 6, 0 |
| Tertiary | Sea | #4FBCCA | 79, 188, 202 | 631 C | 63, 4, 20, 0 |
| Tertiary | Storm | #D5CFC7 | 213, 207, 199 | 7534 C | 16, 14, 19, 0 |
| Tertiary | Claret | #5F2528 | 95, 37, 40 | 202 C | 39, 84, 71, 52 |

Tints (p.10) at 80 / 60 / 40 / 20 % exist for all seven and are in `brand-tokens.css`, exactly as printed. Their stated purpose is **colour-blocking (especially print) and the readability of tables, charts and graphs**, not prominent use. (My first version said hover and disabled states; that came from the older web page and was wrong for this document.) The printed CMYK for the lightest cream, sky, sea and storm tints says "Do not use" because presses can't print a dot under 3%; that is a print warning, the hex values are fine on screen. One tint, Forest 40%, is #9CBAB7, which is 3 steps from a straight mix; kept as printed.

Neutrals (Gray 1 #F6F6F6, Gray 2 #CCCCCC, Gray 3 #A6A6A6, Gray 4 #757575, Gray 5 #404040, Gray 6 #1A1A1A) are from the web page. The PDF has no neutrals.

### Colour pairings (p.11), for colour-blocking and shapes over layouts

Do (12): navy with cream, sky, sea or storm; forest with cream, sky or sea; cream with navy, forest or claret; claret with storm or sky.

Do not (10) place on or beside each other: navy with forest; navy with claret; forest with navy; forest with claret; claret with navy; claret with forest; cream with storm; cream with sky; storm with sky; and a tint of forest with a tint of claret. In short: no dark on dark across different hues, no light on light, and no mixing tints from different families.

### Text contrast (p.12 and computed)

The PDF chart covers text in black, navy, forest or claret on white, cream, sky or storm (and the reverse). Computed ratios, with the chart's asterisk (large text, graphics and UI only, not body copy) marked:

| Text / background | White | Cream | Sky | Storm |
|---|---|---|---|---|
| Black | 21.0 | 16.2 | 15.0 | 13.6 |
| Navy | 13.4 | 10.3 | 9.6 | 8.7 |
| Forest | 9.0 | 6.9 | 6.4 \* | 5.8 \* |
| Claret | 11.8 | 9.1 | 8.4 | 7.6 |

The chart's asterisks don't follow the maths. Forest text on sky (6.4) is starred but sky text on a forest background (the same 6.4) is not; forest and storm (5.8) are starred both ways; forest and cream (6.9) are not. All of these compute above the 4.5 needed for body text. Treat the chart as the rule, since it is stricter: no forest-and-sky or forest-and-storm for body copy.

Not covered by the chart, computed by me: navy on sea 6.0 and claret on sea 5.3 pass for body text; forest on sea 4.0 does not. Sea on white is 2.2 and sea on cream is 1.7, so sea is a **background or graphic colour, never a text colour on light backgrounds**. In the PDF's own examples, sea holds navy text.

## 3. Typography (PDF pp.13 and 14)

The standards define **two sets**. This app is digital, so it uses the **digital set**: Georgia and Arial, both system fonts, no licence needed.

| Role | Digital (use this) | Print (signage, banners, ads) |
|---|---|---|
| Headline primary | Georgia Bold | Bookmania Semibold |
| Headline secondary | Georgia Regular | Bookmania Regular |
| Subhead | Arial Regular | Gotham Book |
| Special call-out | Georgia Bold Italic | Bookmania Semibold Italic |
| Label or CTA | Arial Bold, uppercase, +100 tracking | Gotham Bold, uppercase, +100 tracking |
| Body | Arial Regular | Gotham Book |
| Legal | Arial Narrow Regular | Gotham Narrow Book |

"+100 tracking" is 0.1 em (`--label-tracking`). For PowerPoint and Word use Arial; for web tools such as Canva use Montserrat. Bookmania and Gotham are licensed (ensure licences are in place) and must not use Bookmania's flourished glyphs. My first version had this backwards, calling Bookmania and Gotham the digital fonts.

Tokens: `--font-display`, `--font-body`, `--font-legal`, `--label-tracking`; print equivalents `--font-print-display`, `--font-print-body`. The app still renders in the Apple system font stack. No rule uses these tokens yet.

## 4. Icons (PDF p.15)

The library is sourced from **Iconoir** (iconoir.com). When downloading extra icons use **optical size 45 and stroke weight 1.3**, and only in colours from the palette. The app uses `lucide-react`, a different set. That is not a defect to fix now (a new dependency needs your approval), but icons should at least be drawn in navy or another palette colour.

## 5. Layout language (PDF pp.16 and 17)

Visible in the "How it comes together" examples: large arched or curved colour-block shapes, a navy base with the logo bottom-left, circular and arched photo crops, Georgia headlines, big Georgia statistics with a small icon above, and a pill-shaped CTA (sea background, navy bold uppercase label). The "Additional assets" page (Courage, Compassion, Curiosity badges, Century Vision, live life well, Power of Comfort, cares, CONNECT) are corporate programme marks and are not for this app.

## 6. Who to ask (PDF p.18)

Corporate Communications Team, La-Z-Boy Incorporated: marielle.rodeheffer@la-z-boy.com and lzbinc@identitypr.com, for questions about using the brand assets or guidelines.

## 7. Where the app stands and a proposed mapping

Already on-standard: navy primary buttons, forest hover and "done" steps, cream hover wash, Gray 1 page background, Gray 6 text. Navy is now #003349 everywhere (it was #00334B, 2 steps off); the three rgba lines and `--studio-blue` were updated to match.

Not on-standard (legacy, 35 lines): rust (active marker, selected-piece outline, blocked reach), sage (focus ring, selected-card fill, reach fill), blue (selected border, checks, kickers, chips, dark-mode primary button), peach. Proposed mapping, **not applied**: rust to claret, sage to sea (or sky for light fills), blue to navy or forest. Caveats: claret is dark (#5F2528), so the selected-piece dashed outline will read heavier; sea fails as text on light backgrounds, so it can only be used for fills, rings and outlines; and the "blocked" and "selected" states currently differ by hue, which needs a check against the "do not" pairings.

## What this kit does not contain

- The white logo from the brand site, the INCORPORATED lockup files and the badges. The black, navy and cream logos you supplied are in hand; only cream is wired into the app (`public/lazboy-logo-cream.png`).
- The web pages' Verbal Identity page and the retail website: neither could be opened.
- Anything specific to Canada or to dealer stores. The PDF is the corporate edition.
