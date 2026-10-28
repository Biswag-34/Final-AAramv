# Website updates — 28 October 2026

This pass follows the user's latest visual changes and confirmed restoration target: the original About, property-detail and locality-detail designs from before the PDF changes. Property hero-image sizing and cropping remain as currently refined.

## Current presentation

- Existing eyebrow/kicker headings remain hidden across the site, with the requested THE AARAMV DIFFERENCE label shown in the new needs-first section. Main section titles, card titles and field labels remain readable.
- The fixed header stays near the viewport top at every breakpoint. It is transparent while over the home hero and gains its solid background when the hero passes. Header clearance is shared by all sticky page elements.
- The homepage hero is static and has no playback or previous/next controls.
- The old comparison-table section is replaced by the supplied needs-first design: THE AARAMV DIFFERENCE, the two headline phrases, three folded documents and a Search / Booking / Move-in journey. “Still with you” stays below the hollow booking marker. The following dark-blue strip is unchanged.
- Homepage sections alternate warm ivory, dark blue, pale blue, mint, a photo-backed journey, white developer logos and lavender enquiry areas.
- `components/property-card.tsx` supplies the same compact card across Home and catalogue views. Each card shows image, project name, recorded address, all offered configurations, total units, possession date, the recorded price range with Onward*, and View more/Enquiry actions. The three card facts stay on one horizontal row; plot cards show total recorded project land area instead of configurations. Caution text has been removed from the card.
- Unit totals use the optional structured `totalUnits` field first, then an explicitly named project-total fact. Phase-only counts and land areas are not used as project totals. Missing units/dates/prices show On request. Partial recorded price ranges say that other layouts are on request.
- Neighbourhood cards show image, project count, name, home types and Explore. The homepage collection has a solid dark background and an asymmetric two-feature/four-guide grid. Tablet and phone layouts reflow to readable columns. Locality search and filters remain.
- The locality-index hero uses larger type and a much larger rounded skyline cutout.
- The photo-backed curved journey has four accessible stages: Search & shortlist, Visit & experience, Finance & paperwork, and Book & possession. Stages support direct selection and keyboard navigation.
- Developer logos keep their continuous loop, hover/focus pause and reduced-motion behaviour. The visible pause button is removed.
- The catalogue filters and compact coloured results/sort pill remain directly below the header. The filter panel uses visible overflow and has no internal scrollbar.
- About keeps its original page structure with targeted changes: advisor principles beside the image, a heading for the counters, and a compact sage/ivory belief section with concrete supporting copy. Property details keep their original structure with a taller hero, a compact four-fact strip and section tabs that track the clicked/visible section with an underline.

## Later data updates

Edit `data/properties.json` using the schema in `lib/catalog-schema.ts`. `totalUnits` accepts a positive integer or null and is optional for existing records. Set `possession.date` to an actual YYYY-MM-DD date, or keep null. Prices remain integer INR amounts in each configuration's `startingPriceInr`. The UI updates its range and configuration list automatically.

The user confirmed that missing data will be supplied later. No prices, dates or counts were invented. See `docs/DATA-STRUCTURE.md` for the complete data contract.

## Verification

`npm run test:catalog` includes real-record checks for unit totals, exclusion of phase-only values, all BHK options and plot sizes. `scripts/verify-current-design.mjs` covers 10 page families at 12 widths (320–1920 px), card actions and factual summaries, visible-control bounds, sticky filters/results, locality search/filter counts, restored layouts, route-stage interaction and continuous developer motion. Runtime paths and output location can be provided through PLAYWRIGHT_MODULE, PLAYWRIGHT_EXECUTABLE and VISUAL_CHECK_OUTPUT.

Use `npm run validate:data`, `npm run test:catalog`, `npm run test:enquiry`, `npm run typecheck` and a production build before delivery. Screenshot review is stored outside the project source tree. The property sidebar has hidden project interest, a visible budget field and only Request a Callback. Pre-submit caution lines are removed from this sidebar. Submission remains the existing local preview and does not claim a sent lead. Anchor positioning uses one header offset, avoiding the previous doubled padding.

Final verification: production build and TypeScript passed, 26 tests passed, and all 120 responsive checks passed. Browser checks confirmed transparent/solid sticky header states, compact plot cards, the asymmetric neighbourhood grid, revised About sections, a fully visible callback panel at 600/720/900 px heights, hidden project interest and editable budget values, clicked/scrolling tab underlines, and the mobile menu.


## Needs-first section replacement

`components/aaramv-difference.tsx` and its CSS Module implement the supplied desktop/mobile images and `aaramv-section.html`. The site’s Arial/Helvetica sans-serif and Georgia italic serif are retained. All labels and copy are selectable HTML; only paper faces/folds, icons, mint contour and connectors use CSS/SVG. SVG gradient/filter IDs use React useId. Styles are scoped to the component, including overrides for legacy global heading display/tracking rules.

The single CTA reuses the existing enquiry callback on both Home branches. A /contact fallback exists for standalone use. No form, dependency, image asset, hover-dependent content or animation was added. Desktop uses a maximum 1280 px content grid; 1024–1100 px uses compact two-column typography; layouts at 1023 px and below stack. Mobile retains 20 px gutters, three papers and the horizontal three-marker rail. At 390 px, the section is approximately 863 px high.

Focused browser checks cover 14 widths from 320 through 1920 px, natural layout height, text and paper bounds, body font/line height, real HTML labels, scoped SVG IDs, and reuse of the existing enquiry modal. Screenshot comparisons are saved outside the project source tree beside the previous review artifacts.

Shutdown recovery verification (28 October 2026): the saved component and both homepage enquiry integrations were intact. A fresh production build, including TypeScript, passed. The interrupted webpack cache was removed after the successful build. Data validation and all 26 catalogue/enquiry tests passed. The production page passed all 14 focused viewport checks (320–1920 px), with no horizontal overflow or browser errors, all three document labels visible, the Booking annotation retained, and one CTA opening the existing modal at desktop and mobile sizes. Production screenshots were reviewed at 320, 390, 1024 and 1440 px; the 390 px section is 863 px tall. The preview runs on the fixed address http://127.0.0.1:3000/.

