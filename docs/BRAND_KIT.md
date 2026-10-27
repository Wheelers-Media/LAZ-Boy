# La-Z-Boy brand kit for the Floor Assistant

Visual version: open `/brand-kit.html` (served from `public/brand-kit.html`).
Code tokens: `src/brand-tokens.css` (additions) on top of `src/brand.css` (core colours, already in the app).

## Evidence

| Item | Source | Tier |
|---|---|---|
| Colours, tints, neutrals, pairing and tint rules | La-Z-Boy brand guidelines, Color Palette page | A (manufacturer) |
| Logo versions and misuse rules, naming rules | Brand guidelines, Primary Logo page | A |
| Typeface names, case rules | Brand guidelines, Typography page | A |
| Voice and "why the logo looks like this" | Fast Company, 29 Jul 2025 (reported by a journalist, with brand quotes) | B, provisional |
| Contrast ratios | Computed here from the published RGB values | Not a manufacturer figure |

Not covered, see the gaps list at the bottom.

## 1. Logo

The mark is a custom script wordmark, "La-Z-Boy" with the registered symbol. Files in the app:

- `public/lazboy-logo.png`: navy artwork (measured ink colour #01344B)
- `public/lazboy-logo-light.png`: white artwork, used automatically in dark mode (`brand.css:171-174`)

Rules from the guidelines:

- Navy logo on light backgrounds. Cream logo on dark backgrounds. Black or white only when colour printing is not available (black on light, white on dark).
- Never: stretch or condense, recolour outside navy / cream / black / white, outline, add a drop shadow, remove the registered symbol, or isolate a single letter (a lone Z or L in a circle).
- Never add taglines or store names to the lockup, and never place it over busy imagery or moving elements.
- Naming: "La-Z-Boy" or "La-Z-Boy + City". The guidelines say not to use "Furniture Galleries" or the legacy galleries logos. The app currently contains no "Furniture Galleries" text.
- Official files come in EPS, JPG and PNG in navy, cream, black and white, plus shorthand badges. Download them from the brand site rather than recolouring the PNG.

## 2. Colour

Core colours are in `src/brand.css:3-9`. Keep the balance the guidelines ask for: navy and cream dominate, secondary colours support, tertiary colours are accents.

| Role | Name | Hex | RGB | Pantone | CMYK |
|---|---|---|---|---|---|
| Primary | Navy | #00334B (app) / #003349 (published) | 0, 51, 73 | 2189 C | 100, 70, 30, 65 |
| Primary | Cream | #E6E2D5 | 230, 226, 213 | 9080 C | 6, 8, 12, 0 |
| Secondary | Blue | #244C5A | 36, 76, 90 | 7477 C | 85, 42, 29, 50 |
| Secondary | Sage | #9AB9AD | 154, 185, 173 | 623 C | 40, 10, 31, 0 |
| Secondary | Rust | #BD472A | 189, 71, 42 | 7598 C | 5, 80, 88, 10 |
| Tertiary | Forest | #00534C | 0, 83, 76 | 330 C | 93, 23, 65, 57 |
| Tertiary | Peach | #ECC3B2 | 236, 195, 178 | 489 C | 0, 26, 30, 0 |

Neutrals: Gray 1 #F6F6F6, Gray 2 #CCCCCC, Gray 3 #A6A6A6, Gray 4 #757575, Gray 5 #404040, Gray 6 #1A1A1A.

Tints (80 / 60 / 40 / 20 %) exist for every colour except cream, which only has 80 and 60. The guidelines say tints are for digital states such as hover and disabled and must not be prominent. Values are in `brand-tokens.css`.

### Contradictions found in the source, and what was decided

1. **The published Hex strings are wrong.** On the Color Palette page every Hex value has its green and blue bytes swapped relative to the RGBA beside it (Navy shows #004933, its RGBA 0, 51, 73 is #003349; Cream shows #E6D5E2, a lilac, while its RGBA is #E6E2D5). All seven base colours and every tint show the same swap. The RGBA values match the colour names, the Pantone references, the logo artwork and the values already in `brand.css`, so this kit uses RGBA and ignores the printed Hex. If anyone copies hex from that page, they get the wrong colour.
2. **Navy differs by 2 in the blue channel.** Published RGBA is 0, 51, 73 (#003349). The app uses #00334B (`brand.css:3`). The official navy logo PNG's ink measures #01344B. All three are visually identical. The kit keeps #00334B so UI navy sits exactly beside the logo. Switching to #003349 is a one-line change if you want the written spec.
3. **Forest 40% tint** is published as #9DBAB7; a straight 40% mix of forest into white gives #99BAB7. Four steps on one channel, kept as published.

### Contrast (computed here, WCAG 2.x)

| Text on background | Ratio | Result |
|---|---|---|
| Navy on cream | 10.3 | AAA |
| Navy on white | 13.4 | AAA |
| Navy on Gray 1 | 12.4 | AAA |
| Navy on peach | 8.3 | AAA |
| Navy on sage | 6.3 | AA |
| Cream on navy | 10.3 | AAA |
| Blue on cream | 7.2 | AAA |
| White on blue | 9.3 | AAA |
| White on forest | 9.0 | AAA |
| Cream on forest | 6.9 | AA |
| Forest on cream | 6.9 | AA |
| White on rust | 5.1 | AA |
| Rust on cream | 3.95 | Large text only |
| Forest on sage | 4.2 | Large text only |
| Navy on rust | 2.6 | Fails |
| Sage on white | 2.1 | Fails |
| Gray 3 on white | 2.4 | Fails, decoration only |
| Gray 4 on white | 4.6 | AA |
| Gray 4 on Gray 1 | 4.3 | Large text only |

Practical rules for the app: rust is for markers, strokes and fills (it is used that way today, `brand.css:55,194,197`), and white text on a rust fill is fine. Never put navy text on rust. Gray 4 is the lightest grey allowed for body text and only on white. Do not use sage for text on white.

The guidelines also publish an accessibility chart as an image. It could not be read here, so the table above is independently computed, not the manufacturer's chart.

## 3. Typography

- **Bookmania** (display): serif that signals craft and trust; Semibold is the headline weight. Licensed via Adobe Fonts or Mark Simonson Studio.
- **Gotham** (labels and body): Bold with loose tracking for small labels, Book weight for body copy. Licensed via MyFonts.
- **Georgia and Arial** are named as the pre-installed system fonts.

Rules: no flourished Bookmania glyphs, no all-caps Bookmania, no weights outside the authorised set, italics only where grammar calls for them, and use digital (system) fonts in email for accessibility.

Headline case: sentence case for full thoughts ("Comfort starts with great design."), title case for short thematic lines ("Long Live The Lazy"). Website banners and email use title case. Print and posters use sentence case when the headline is a sentence. Full stop only on full sentences.

The app uses an Apple system stack today (`styles.css`). Tokens `--font-brand-display` and `--font-brand-body` exist in `brand-tokens.css` but nothing uses them, because the fonts are licensed and I could not verify which face the guidelines assign to "website and digital primary" (that is shown as an image). Decide before switching the app's fonts.

## 4. Voice (provisional, Tier B)

Per Fast Company's report of the 2025 refresh, the brand moved from functional to emotional: comfort first, peace over perfection, playful and warm rather than corporate. The headline example "Long Live The Lazy" also appears in the Typography page. The exact wording of the official tagline lockup is not in the pages that were readable, so none is quoted here.

For the Floor Assistant (an internal rep tool, not customer advertising) that means: plain, warm, short sentences; no hype; and the evidence rules still outrank tone.

## 5. Where the brand is already applied in the app

Navy primary buttons, forest hover, rust active marker, sage focus and selection, cream hover wash, grey 1 page background, grey 6 text, dark mode with the light logo. The floor-plan SVG uses navy walls and rust selection. No changes were needed there.

## Gaps (what this kit does not contain)

- **Brand site pages not read:** the Verbal Identity page and the retail website (la-z-boy.com / la-z-boy.ca) could not be opened from this session, so live buttons, imagery style and photography direction are not documented.
- **Logo downloads:** the official cream, black and white logos, the tagline lockups and the badges sit behind expired signed links. Only the navy PNG you attached was available.
- **Image-only guidance:** the colour pairing do/don't diagram, the accessibility chart and the type specimen images could not be read, so approved and forbidden colour pairings are not listed. Check that diagram on the brand site before building colour-blocked layouts.
