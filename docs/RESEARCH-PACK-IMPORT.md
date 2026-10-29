# Updated catalogue import — 28 October 2026

Source: `Aaramv_Updated_JSON_and_Research_Report.zip`, supplied by the user as the authoritative catalogue.

The live arrays are `data/properties.json` and `data/localities.json`. All 27 property IDs, 17 locality IDs, their connections, 259 configurations, 408 named amenities and 162 project FAQs are retained. All 366 supplied images are copied to their JSON paths under `public/images/`. Known character-encoding errors in punctuation and currency symbols are repaired; numerical values are preserved.

`lib/catalog-schema.ts` retains the original core validation and adds the typed research fields defined in `lib/research-fields.ts`. Research metadata remains in the records. The source registry, coverage, source issues and plan gaps are retained in `data/research/`. Those files are administrative data and are not warning banners or sales copy.

The existing navigation, colour palette, cards, page layout, tabs and enquiry architecture remain. New matching modules display home-format prices, brochures, other product families, plot size ranges and locality perspectives. Layouts show their supplied area basis, ranges, carpet/balcony measurements and tower. The project headline uses `pricing.displayText`; configuration prices remain attached to their own configurations. Preview form behaviour is unchanged.

The gallery uses `galleryImageIds`. Plans open separately with contain-fit images, zoom and original-image links. Plot master plans use “View site layout”. Archived Assetz upper-floor plan references remain administrative metadata; buttons only open supplied live files. Legacy layout queries resolve through `configurationIdAliases`. No replacement plans are generated.

Visitor FAQs use the supplied questions and corresponding structured project facts. Original research answers remain in JSON. Image caution overlays, generic research footnotes and verification notes are excluded from visitor presentation. Image credits remain as attribution.

Checks: `npm run validate:data`, `npm run test:catalog`, `npm run test:content`, `npm run test:enquiry`, `npm run typecheck`, `npm run build`. The new content test replaces the earlier Word-master assumptions that every price and possession date must be null. `scripts/content-master.test.mjs` is the historical test for that older import, not the active content acceptance test.

The app continues to run at the fixed address `http://127.0.0.1:3000/` using `npm run dev` or `npm run start`. No deployment is part of this import.
