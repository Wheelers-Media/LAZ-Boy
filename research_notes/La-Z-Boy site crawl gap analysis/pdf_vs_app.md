# available_products.pdf vs the app (computed locally)
- PDF has 329 unique "Available Products" style-model codes (e.g. 44P-726 = prefix 44P + model 726 -> app styleNumber "44P726"), 993 "Available Covers" (e.g. B156175 = cover B1561 + colour 75), and 301 unique "Coming Soon Styles (Oct 18)" codes.
- Only 47 of 329 available product codes exist in style-index-2026.json. 58 three-character prefixes in the PDF (e.g. 44P, 48P, 49P, 4SP, 4QQ, 4VV, 40A/B/S, 60x, 610, 630, 230, 240, 16H, 1HR, 33P, 32P) are absent from the app's style index. ~80 prefixes in the PDF are not in motion-catalog prefix_definitions.
- Only 60 of 993 available cover codes exist in swatch-manifest.json; only 19 of 269 five-character cover patterns appear in fabric-cover-program-a26.json.
- 33 of 301 Coming Soon codes are in the app's style index.
