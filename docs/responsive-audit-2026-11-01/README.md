# Aaramv Realty — responsive design and mobile-first architecture audit

**Date:** 1 November 2026  
**Target:** the local Next.js application at `http://127.0.0.1:3000`  
**Review type:** source inspection, browser layout measurements, visual review, interaction checks, and existing project validation.

## Executive assessment

The website already has substantial responsive support. Most tested layouts fit their viewport, shared property cards are reused across discovery pages, the enquiry form is centralised, and the main home-page sections remain available on phones and larger screens. The current implementation is **responsive, but is not consistently built from a mobile-first component system**.

The highest-priority defects are the shared header losing its menu button at 320px and the Localities hero clipping its text at that width. A second group of issues concerns navigation consistency, loss of unsent input when switching layouts, and CSS rules whose breakpoints do not form continuous ranges.

The main recommendation is to fix those specific defects first, then gradually move to one semantic page tree with component-owned styles. A whole-site redesign is unnecessary. The existing reusable cards, enquiry form, buyer tools, and data validation provide a useful base.

### Requested About changes completed

| Request | Implementation | Verification |
| --- | --- | --- |
| Use the same footer as other pages | Removed the bespoke About footer; `Site` now renders the existing shared `Footer` on About as well | The visible footer is `.footer` on desktop and `.r-footer` on compact screens |
| Remove numbers after “You ask” | All five labels now read `YOU ASK`, without the slash or number | Verified the rendered labels |
| Match the italic-heading colour and add a little weight | Question text uses the same teal, `#087e70`, with weight 500 and a subtle 0.12px stroke | Verified all five computed colours and weights; retained italic Georgia styling |
| Refresh the project | Reloaded the running About page after the edits | Server remains on fixed port 3000 |

Implementation files: `components/about-page.tsx`, `app/about-handoff.css`, and the shared footer rendering in `app/site.tsx`. Broader audit findings below are recommendations; they have not been silently applied to other pages.

[Updated desktop About page](about-desktop.jpg) · [Updated question styling](about-questions-desktop.jpg) · [Updated phone About page](about-390.jpg)

## 1. Scope, evidence, and limitations

### Coverage

- **199 browser observations**, including 198 completed measurement records and one navigation timeout that passed on a later retry.
- **62 distinct route/query states** in the raw observations, including populated buyer-tool states and calculator variants.
- Every **27 property detail records** and every **17 locality detail records** visited at a 390px phone viewport.
- Core templates checked at **320, 390, 768, 1024, and 1440px**. Apartment and plot details were included in that core matrix; a row-house detail was additionally reviewed at 390 and 1440px.
- Additional boundary checks on Home, Properties, Localities, About, and Contact near the 599/600, 640, 767, 900, 1199/1200, and 1441px transitions, plus a 1920px wide screen.
- Short-screen enquiry review at **390 × 568px**.
- Menu, filter application, gallery navigation, project anchor targets, calculator tabs, populated comparison scrolling, and unsent-search preservation reviewed interactively.
- Source review across **107 TypeScript/TSX files** under `app`, `components`, and `hooks`, plus the 18 global application stylesheets and public asset sizes. Counts of files are inventory metrics, not a claim of a line-by-line review of every UI-library primitive.

The browser rounded a few requested widths: 641→642, 901→902, 1201→1202, and 1441→1442 in the recorded measurements. The JSON records preserve the effective `innerWidth`; no claim is made that each requested integer was reproduced exactly.

### What was measured

The browser pass recorded visible headings and sections, document width, element bounds, internal clipping candidates, loaded-image failures, form font sizes, small controls, and which footer variant was visible. Off-screen content inside a carousel or horizontal comparison scroller was separated from uncontained overflow. Hidden enquiry honeypots were not treated as layout defects.

**A page having no horizontal scrollbar is not sufficient evidence that it fits correctly.** The Localities defect demonstrates why: `overflow-x: clip` hides text that still extends outside its usable area. Header controls were therefore inspected separately from the main-content geometry scan.

Raw evidence:

- [Browser matrix](browser-matrix.json)
- [Source and asset metrics](source-metrics.json)
- [Shell breakpoint measurements](shell-boundaries.json)
- [Search-state reproduction](breakpoint-state-loss.json)
- [Project section and action-bar evidence](sticky-actions.json)

### Limits of this audit

This was a local Chromium-based browser review. It does not establish real-device Safari/Android behaviour, mobile keyboard behaviour, screen-reader conformance, production Core Web Vitals, network-throttled performance, or a complete accessibility certification. Selected states received screenshot review; not every catalogue page was manually inspected at every scroll position and width.

Image checks identify completed, rendered image failures. They do not prove that every below-the-fold lazy image was fetched. The separate catalogue validator confirmed 366 local asset references exist and validate.

The recovery route rendered its designed 404 screen in the accessibility/visual review. Some immediate streaming snapshots reported no visible H1; those are inconclusive timing measurements, not a confirmed missing-heading defect. One `/contact` boundary snapshot was similarly inconclusive. A `/shortlist` navigation timed out once at 1024px and passed on retry. These raw observations remain in the evidence instead of being discarded.

No valid enquiry was submitted, no lead was created for testing, and no external contact or map workflow was completed. Empty-form validation was exercised locally.

## 2. Prioritised findings

| ID | Priority | Finding | Evidence status | Recommended action |
| --- | --- | --- | --- | --- |
| R01 | High | Shared mobile header pushes the menu off-screen at 320px | Reproduced in browser | Reserve space for the menu; move or shorten the consultation CTA on narrow screens |
| R02 | High | Localities hero clips heading, paragraph, and image at 320px | Reproduced and screenshot confirmed | Make the grid track shrinkable, give children `min-width:0`, and correct narrow typography |
| R03 | Medium | About has no useful top-level navigation on phones | Rendered DOM + source confirmed | Use a shared header appearance variant with a linked logo and mobile menu |
| R04 | Medium | Switching compact/desktop layouts loses unsent search input | Reproduced across 1198→1200px | Keep one input/component instance, or lift draft state above the layout switch |
| R05 | Medium | Breakpoint ranges leave a fractional-width gap | Browser media-query observation + source confirmed | Use continuous complementary ranges and one shared breakpoint contract |
| R06 | Medium | Global CSS cascade makes responsive changes fragile | Source evidence | Consolidate tokens; migrate feature styles to modules or deliberate layers |
| R07 | Medium | Large images and duplicate font strategies increase mobile delivery cost | Asset/source evidence; transfer impact not benchmarked | Add responsive modern image variants and reuse the existing WOFF2 font |
| R08 | Medium | Phone home hero delays access to the main search form | Measured and screenshot reviewed | Reduce the decorative masthead and bring search earlier in the flow |
| R09 | Medium | Some important supporting text is too small for comfortable mobile reading | Source inspection, requires targeted visual refinement | Establish minimum text roles instead of shrinking whole components |
| R10 | Medium | Home carousel auto-advances without a visible pause control | Source and rendered controls reviewed | Add pause/play and explicit navigation; retain reduced-motion support |
| R11 | Low/medium | Shared primitives exist, but page structure and variants are still duplicated | Source evidence | Extract stable section-level components and keep page-specific compositions |

“High” means a core navigation or reading task is impaired in a supported narrow viewport. “Medium” includes reproducible behaviour problems and maintainability/performance risks. These priorities do not imply that every visitor currently encounters the issue.

## 3. Confirmed defects and reproductions

### R01 — the shared header loses its menu button at 320px

**Where:** most routes using `ResponsiveHeader`; Home was used for the reproduction.

**Reproduce:** open `/` at 320px, then inspect the shared header. Its logo, saved-homes button, consultation button, and menu are all retained in one horizontal row.

Measured positions:

| Control | Left | Width | Right |
| --- | ---: | ---: | ---: |
| Logo link | 16px | 115px | 131px |
| Saved homes | 143px | 44px | 187px |
| Build my shortlist | 193px | 104px | 297px |
| Open menu | 303px | 44px | 347px |

The menu extends beyond a 320px viewport; with the scrollbar the usable client width was approximately 305px. It remains in the accessibility tree, but most of its visual hit area is clipped. This is more serious than a cosmetic header-spacing issue.

**Source:** `app/responsive.tsx:32` (`ResponsiveHeader`), `app/responsive-shared.css:17`, the header overrides in `app/refinements.css`, and the saved-button treatment in `app/section-revision.css`.

**Fix:** the smallest header should prioritise logo + menu. Keep saved homes only when space permits. Put the consultation action in the drawer or use a compact icon/short label. Use a `minmax(0,1fr) auto` shell rather than allowing several non-shrinking controls to compete. Keep the menu hit area at least 44px as a product sizing target.

**Acceptance:** every visible header control fits within the usable client width at 320, 360, and 390px; the menu can be opened by touch and keyboard; longer labels and text zoom do not push it off-screen.

[320px header screenshot](home-header-320.jpg)

### R02 — the Localities hero is clipped at 320px

**Where:** `/localities`, introductory dark hero.

**Reproduce:** open Localities at 320px. The italic “neighbourhood” text, supporting paragraph, and hero image extend beyond their intended container.

The hero itself measured about **273px wide**, with **21px horizontal padding**. Its single grid track nevertheless measured about **294px**, beginning at x≈38px. The content right edge was therefore about **332px**, already beyond the viewport. The page-wide `overflow-x:clip` prevents a horizontal scrollbar from revealing the underlying sizing problem.

The heading still computed to **43px**, despite smaller-screen rules elsewhere specifying other sizes. This is a cascade conflict as well as an intrinsic grid-sizing issue.

**Source:** `components/locality-discovery.tsx:35`, `app/visual-refinements.css:602`, `app/iteration-two.css:135`, and the page-wide clipping in `app/responsive-shared.css:12`.

**Fix:** make the stacked grid `grid-template-columns:minmax(0,1fr)` and give its text/image children `min-width:0`. Give the image `max-width:100%`. Let headings and emphasis wrap within the available width. Own the heading size in the Locality Hero component rather than adding another global `!important` patch.

**Acceptance:** all hero text remains readable at 320px; child bounds fit inside the padded hero; the layout still works if page-wide clipping is temporarily disabled during QA.

[Localities clipping screenshot](localities-320.jpg)

### R03 — About’s phone header has no useful navigation

At 640px and below, the handoff styles hide the Home and Properties links. The header CTA is already hidden below 900px. The logo is an image rather than a home link, and the bespoke header has no menu button. The newly restored shared footer provides routes at the bottom, but a user must scroll through the About content to reach them.

**Source:** `components/about-page.tsx:6` and `app/about-handoff.css:89`.

**Fix:** retain the approved light About appearance through a shared header variant, while reusing the normal navigation and linked logo. Appearance may vary; access to the rest of the website should remain consistent. This is a recommended follow-up, since the requested change in this task was specifically to restore the shared footer.

### R04 — changing the layout discards an unsent search

**Reproduction:** on `/properties` at 1198px, type `Thanisandra` into “Locality or project” without submitting. Resize to 1200px. The new desktop “Search properties” input is empty.

`DeviceView` removes one branch and mounts the other when `useResponsiveLayout` changes. Its hydration strategy preserves early input in the initially visible branch, but it does not preserve draft input when switching between two separate components later.

**Source:** `hooks/use-responsive-layout.ts:16`, `app/site.tsx` (`Listings`), and `app/responsive.tsx` (`SearchForm`/`ResponsiveListings`).

**Fix:** use the same search input and state for all layouts. For the filter sidebar/drawer, render a shared `FilterFields` component against state owned by one listing controller. If two physical renderings are unavoidable, lift the draft values and do not depend solely on applied URL parameters.

**Acceptance:** unsent search, filter drafts, form errors, and active focus survive resizing/orientation changes. Already-applied query filters continue to survive refresh and back navigation.

[Recorded reproduction](breakpoint-state-loss.json)

### R05 — breakpoint ranges should cover fractional widths

The hook uses `(max-width:1199px)`, while desktop presentation rules commonly begin at `(min-width:1200px)`. Equivalent 599/600 patterns also occur. Fractional CSS viewport sizes can fall between those ranges.

At one requested 1199px viewport, the browser reported **both** the compact max-width query and the desktop min-width query as false. The hook consequently selected the desktop branch even though the desktop media query did not match. `innerWidth` is rounded, so this should be treated as a fractional-width observation, not a claim that every integer 1199px viewport fails.

**Fix:** define a shared continuous boundary such as compact `width < 75rem` and desktop `width >= 75rem`, or use mobile defaults with only the wider `min-width` enhancement. Align any JavaScript media query exactly with the CSS contract. Check fractional widths and browser zoom, not only integer presets.

[Shell boundary records](shell-boundaries.json)

## 4. Page and section review

| Page / family | Current responsive behaviour | Improvement to make |
| --- | --- | --- |
| Home `/` | Main buyer-support, property, neighbourhood, buying-journey, developer, and enquiry sections present on phone and desktop | Compact the first screen, add carousel controls, consolidate duplicated page composition |
| Properties `/properties` | Desktop sidebar and compact drawer; cards fit; mobile Plot filter applied and returned 3 results | Fix header at 320px; preserve drafts across branch changes; share one filtering controller |
| Property details — apartment, plot, row house/mixed | All 27 records visited at 390px; representative apartment/plot pages checked across core widths | Consolidate summary/gallery/action components; continue testing longest content and every layout type |
| Project section navigation | All eight links resolved to existing sections in the representative project; target content remained below the header during the anchor check | Use one sticky-offset contract instead of several independent header/nav offsets |
| Project gallery | Opened and advanced on a phone; image loaded and remained within the dialog | Add real-device zoom/gesture/landscape testing and verify explicit controls remain reachable |
| Localities `/localities` | Directory and filters fit at mainstream widths | Fix the confirmed 320px hero clipping before further visual polish |
| Locality details | All 17 records visited at 390px; representative page checked across core widths | Keep one reusable hero/essential-places/project-grid composition with long-name testing |
| About `/about` | Five expanded answers remain present; phone questions stack; requested shared footer restored | Restore practical mobile header navigation; split repeated service-row markup into a reusable section component |
| Contact `/contact` | Shared enquiry form and contact details fit the checked widths | Add keyboard-open and text-zoom checks; review low-priority helper copy sizing |
| Tools `/tools` | EMI, purchase-cost, and rental-yield tabs render in phone layout | Keep common field/result primitives and test long computed values and large user text |
| Guides `/guides` | Reading layout fits; content remains in normal flow | Improve anchor offsets/reading rhythm and preserve readable text sizes at narrow widths |
| Shortlist `/shortlist` | Ordinary and populated shared-link states fit at 390px; 1024px retry passed | Retain state above layout changes; test populated private-note editing on devices |
| Compare `/compare` | Three-property state uses its own horizontal scroll region; page does not need horizontal scrolling | Keep this intentional scroll behaviour; strengthen column discovery on phones and test four-property state |
| Privacy / Terms | Reading layouts fit tested core widths | Standardise reading width, spacing, heading hierarchy, and link hit areas |
| Coming soon | Recovery/utility composition fits core widths | Keep utility pages on the common shell |
| Thank you | Receipt-free layout fits core widths | Test real receipt/download and error states separately without creating test leads in a live workflow |
| Unknown route / 404 | Designed recovery screen visually confirmed | Retain correct recovery links and check final streamed metadata in production QA |

### Section parity and long pages

The home page exposed the same six main H2 themes on phone and desktop. The representative project had visible `overview`, `research-desk`, `pricing`, `layouts`, `amenities`, `location`, `brochures`, `decision`, `cost-planning`, `approvals`, and `faqs` sections. No recommendation is made to hide substantive content simply because the screen is narrow.

At 390px, observed Home height was about **7,218px** and the representative project about **12,986px**. Those are content/state-dependent observations, not fixed design targets. Long content should be made easier to navigate with clear hierarchy, a compact first screen, and deliberate section navigation rather than wholesale removal on mobile.

## 5. Interaction findings

| Check | Outcome | Practical limit |
| --- | --- | --- |
| Mobile menu at 390px | Opened, showed navigation destinations, and closed | 320px menu visibility is the separate R01 defect |
| Mobile filters | Selecting Plot changed the pending result count; applying navigated to `/properties?type=Plot` with 3 results | Other filter combinations covered partly by the existing catalogue tests |
| Gallery | Opened and advanced from one image to the next | Real touch zoom/pan and iOS landscape not tested |
| Project anchors | All eight target IDs existed; navigation moved to the selected section | No claim of an exhaustive scrolling/animation test |
| Enquiry dialog, short screen | At 390×568 the dialog remained within the viewport, supported vertical scrolling, and text-entry fields computed to 16px | A real software keyboard changes the visual viewport differently |
| Empty enquiry validation | Displayed validation feedback without creating a lead | No valid enquiry or outbound workflow submitted |
| Comparison table | At 390px, its wrapper was about 335px wide and its scrollable content about 733px; overflow was contained and keyboard-focusable | This horizontal table scroll is intentional, not a page overflow defect |
| Calculator tabs | Purchase-cost and rental-yield views switched and retained fitting layouts | Financial accuracy beyond the existing calculation tests was not re-audited here |
| Comparison action tray | Rendered after a temporary compare selection; selection was then removed | `ResponsiveVisitAction` intentionally hides its visit bar while comparison is active, so this test does not demonstrate two simultaneous bars |

Small checkbox glyphs are not automatically small hit-target failures: several live inside a larger label. The raw scan lists glyph bounds for investigation, but those counts must not be presented as accessibility violations. Review the label’s full clickable area, spacing, and focus treatment before deciding on a fix.

## 6. Mobile-first architecture assessment

### What is already reusable

- `CataloguePropertyCard` is used in multiple discovery contexts. Keep this shared data/presentation boundary.
- `EnquiryForm` centralises validation and submission behaviour; do not create a separate mobile form endpoint or validation implementation.
- `BuyerToolsProvider` centralises saved, comparison, recent, and notes state.
- `PropertySectionNav`, gallery, locality detail, and calculator modules already offer useful extraction points.
- `Brand` provides a linked logo for the shared site shell.
- The buyer-difference section uses a CSS module, demonstrating a scoped-styling approach already compatible with the application.

### Where the approach is currently desktop-led

1. `Site` selects page content by pathname inside a single client component and imports the page families together.
2. Home, Listings, Header, and Footer have desktop/compact variants selected by `DeviceView`.
3. Both variants are included before hydration; the inactive variant is removed afterward. This may add HTML, client work, and image-fetch overhead. Actual duplicate transfer cost was not measured, so it remains a performance risk rather than a benchmark result.
4. Much of the styling starts with desktop rules and then applies several layers of `max-width` overrides.
5. Components such as the property card are reused, but their presentation is still influenced by many global feature overrides.
6. The About page is scoped, but uses a high-specificity ID and several final overrides to protect it from the global cascade. That solves the local collision while leaving the underlying cascade complexity in place.

Having separate `.mobile.css` and `.tablet.css` files does not by itself make the implementation mobile-first. The important properties are a usable small-screen default, semantic content in one place, stable interactive state, and wider-screen enhancements that do not require rebuilding the page tree.

### CSS inventory

| Metric | Observed value | Meaning |
| --- | ---: | --- |
| Global application stylesheets | 18 | Imported by the root layout |
| Combined stylesheet source size | 379,997 bytes, about 371 KiB | Unminified source; not measured network transfer |
| Rules | 4,612 | Includes repeated selectors in different conditions |
| Declarations | 12,164 | Source inventory |
| `!important` declarations | 634 | About 5.2% of declarations; a maintenance signal, not proof each is wrong |
| Media blocks containing `max-width` | 96 | Evidence of considerable narrow-screen override work |
| Media blocks containing `min-width` | 46 | Some are mixed-range queries; counts are not exclusive |
| Distinct numeric width thresholds | 26 | Some are valid local content thresholds, but they need a documented contract |

Thresholds found: 359, 360, 380, 430, 540, 599, 600, 601, 640, 647, 699, 700, 767, 768, 850, 851, 899, 900, 1000, 1023, 1100, 1199, 1200, 1441, 1600, and 1700px.

`app/visual-refinements.css`, `app/globals.css`, `app/experience.css`, and `app/section-revision.css` contain much of this styling. The header has been declared relative, sticky, and fixed in different layers. This is why adding one more “responsive fix” at the end is increasingly risky.

## 7. Proposed component and styling structure

| Proposed component | Responsibility | Existing code to reuse |
| --- | --- | --- |
| `SiteShell` | One header, main landmark, skip link, footer, and global dialog host | `Site`, `Header`, `Footer`, `Brand` |
| `SiteHeader` | Shared navigation and controls, with light/dark appearance variants | `DesktopHeader`, `ResponsiveHeader`, About header |
| `Container` | Consistent page gutters, maximum width, and shrinkability | `.wrap`, `.r-wrap`, `.experience-wrap` |
| `Section` / `SectionHeading` | Vertical rhythm, optional intro/actions, heading order | Existing section-head patterns |
| `ResponsiveGrid` | Content-driven 1/2/3-column enhancement | Property/locality grids |
| `PropertySearch` | One stable search form across all widths | `SearchForm`, `HeroSearch` |
| `PropertyFilters` | State and URL updates independent of sidebar/drawer presentation | Desktop and responsive listing filters |
| `PropertyCard` | Shared project facts, prices, actions, and image ratio | `CataloguePropertyCard` |
| `PropertyHero` / `PropertyGallery` | Responsive image composition, gallery controls, and summary | Detail banner and existing `Gallery` |
| `EnquiryPanel` | One form with deliberate inline/dialog presentation variants | `EnquiryForm` and its current variant props |
| `MobileActionDock` | One owner for compare/site-visit actions and safe-area spacing | Compare tray and `ResponsiveVisitAction` |
| `AboutServiceRow` | Question, answer, optional supporting visual, takeaway, and commission variant | Five repeated About articles |
| `ComparisonRegion` | Intentionally scrollable accessible comparison content | `.comparison-scroll` and comparison table |
| `CalculatorField` / `CalculatorResult` | Reusable input/help/error and result rendering | Existing calculator component |

Do not turn every wrapper into a component. Extract where there is repeated semantics, interaction state, a meaningful visual contract, or independent responsive behaviour.

### Suggested ownership

```text
components/
  layout/        SiteShell, SiteHeader, SiteFooter, Container
  sections/      Section, SectionHeading
  properties/    PropertySearch, PropertyFilters, PropertyCard, PropertyGallery
  enquiry/       EnquiryForm, EnquiryPanel
  buyer/         ComparisonRegion, ShortlistItem, MobileActionDock
  about/         AboutHero, AboutServiceRow, AboutClosing
styles/
  tokens.css     colours, spacing, typography, layering, content widths
  base.css       reset, body text, focus, shared document defaults
```

Colocate feature styles as CSS modules. Keep only intentional tokens and document-wide defaults global. Formatting `app/site.tsx` and the compressed feature files would make responsibility and breakpoint review substantially easier before extraction.

### Example mobile-first layout contract

This is a proposal, not code applied by this audit:

```css
.container {
  width: min(100% - 2rem, 80rem);
  margin-inline: auto;
  min-width: 0;
}

.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}

.grid > * { min-width: 0; }

@media (min-width: 48rem) {
  .container { width: min(100% - 4rem, 80rem); }
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 75rem) {
  .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```

Use a small shared set of layout thresholds, with additional component/container queries only when content requires them. Keep a component’s local exceptions next to it. Avoid relying on global clipping, hidden headings, or arbitrary fixed section heights to make the small-screen version fit.

## 8. Typography, imagery, motion, and mobile usability

### Typography and controls

- Keep body and text-entry sizes around 16px on phones. The checked enquiry inputs already do this.
- Locality card region/meta text drops to 7–9px in some phone overrides in `app/iteration-two.css`; property FAQ and helper text also use small sizes. Improve layout density through spacing and hierarchy before shrinking important information.
- Define explicit body, supporting, caption, label, and heading roles. Use fluid heading sizes only inside tested bounds; `clamp()` does not replace checks of actual long names and italic text.
- A 44px control size is a useful product target. Review full clickable labels rather than classifying every 16px checkbox graphic as a failed target.
- Test 200% text zoom, keyboard navigation, focus visibility, and long content after the component refactor. These were not exhaustively simulated in this pass.

### Asset delivery

| Asset | Current size | Why it matters |
| --- | ---: | --- |
| Home buyer-first PNG | 2,004,345 bytes | First-slide image has no phone-specific source in `HomeHero` |
| About consultation PNG | 1,899,786 bytes | A large phone hero asset; preserve the alpha channel and composition in any optimised derivative |
| Support-through-move-in PNG | 2,249,883 bytes | Large below-the-fold artwork |
| Cubbon Park JPEG | 2,145,561 bytes | Large source image; optimise where actually used |
| Root Inter variable WOFF2 | 352,240 bytes | Existing reusable font source |
| About Inter 700 + 800 TTFs | 653,792 bytes combined | Separate heading font strategy in addition to the root font |

Create width-appropriate WebP/AVIF derivatives with suitable fallbacks, and use `picture/srcset/sizes` or the framework’s image support where appropriate. Keep transparent assets transparent and preserve the approved crop/composition. Reserve aspect ratios and explicit intrinsic dimensions. Load only the first visible hero eagerly; retain lazy loading for lower-page images.

The large-asset list does not mean every asset loads on every route. Production resource timing and a throttled network pass are needed to quantify savings. About’s fallback font files are also not necessarily fetched when native Arial/Georgia satisfies the font stack.

### Hero and motion

The mobile home hero measured about 1,008px high at 390px. `app/hero-carousel.css` sets the phone masthead to at least 640px before the search region is added. Consider reducing that decorative minimum or placing search higher. This is a discovery/usability improvement, not a claim that the current hero is technically overflowing.

`HomeHero` advances slides every five seconds after readiness, pauses for form focus/document visibility/reduced-motion preference, but exposes no visible pause/play or previous/next controls. Add explicit controls and retain a stable reading experience. Do not use animation to hide content needed for the property search.

## 9. Route and client/server separation

`app/[...slug]/page.tsx` validates routes and generates metadata, while `app/site.tsx` contains a large client-side pathname switch and imports the page families. A component without its own `use client` directive, such as About, still enters the client graph when imported by that client root.

A gradual follow-up can move page selection and data preparation into route-level server components, leaving search, filters, saved state, gallery controls, and forms as focused client components. This can reduce unrelated client work and clarify page ownership. It should be measured in the production build rather than justified only by file size.

Preserve canonical routes, selected-layout query parameters, enquiry context, saved research, comparison links, and the designed 404 behaviour during migration. The aim is clearer boundaries and stable interactions, not a framework replacement.

## 10. Recommended implementation order

### Phase 1 — fix confirmed usability defects

1. Repair the 320px shared header and Localities hero.
2. Give About a usable mobile navigation variant.
3. Preserve unsent listing/search state across the desktop switch.
4. Remove breakpoint gaps and document the shared layout thresholds.

**Done when:** 320px screenshots show readable Localities content and a reachable menu; all relevant controls fit their containers; unsent input survives 1198→1200→1198 resizing; no unstyled fractional-width band appears.

### Phase 2 — stabilise shared foundations

1. Establish tokens for gutters, spacing, type roles, z-index, and sticky offsets.
2. Consolidate the shell, container, section heading, form presentation, and search/filter controller.
3. Migrate one feature at a time to scoped styles; remove overridden/dead rules only after comparison.
4. Consolidate action-dock ownership and safe-area padding.

**Done when:** a component’s responsive behaviour can be understood from its own file/module; new styles no longer require unrelated global overrides; desktop and compact layouts retain one set of critical state.

### Phase 3 — improve mobile delivery and first-screen usefulness

1. Optimise the largest actually-used images and add width-specific sources.
2. Reuse the existing Inter WOFF2 strategy where visual comparison permits.
3. Shorten the phone hero’s decorative region and add carousel controls.
4. Raise tiny supporting text and improve dense card/FAQ layouts.

**Done when:** production measurements show lower phone transfer cost, the main search is easier to discover, and content remains readable without hiding information.

### Phase 4 — make responsive QA repeatable

Add focused browser checks for the real defects found here, not tests that repeat static copy. Cover header/menu bounds, padded hero content bounds, breakpoint state retention, filter URL state, comparison scroll containment, modal scrolling, and sticky-anchor offsets. Save visual baselines for representative pages.

Run small-screen defaults first, then enhance through tablet and desktop. Include empty/populated buyer tools, long project/locality names, missing optional data, error states, four comparison columns, reduced motion, text zoom, and short landscape screens.

## 11. Validation completed

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run validate:data` | Passed — 27 properties, 17 localities, 366 local asset references |
| `npm run test:catalog` | Passed — 23 tests |
| `npm run test:buyer` | Passed — 7 tests |
| `npm run test:enquiry` | Passed — 5 tests |
| `npm run build` | Passed — compiled, TypeScript, page generation, and build tracing completed |

The production build used a separate `.next-about-validation` output directory, leaving the fixed-port development server available. Temporary generated TypeScript configuration additions were removed after validation.

Development console history included a Next.js hot-refresh/router-initialisation error and a React pre-mount state warning during the editing/build session. The build passed; these messages have not been established as production defects. Recheck in a clean production browser session before attributing them to application behaviour.

## 12. Suggested follow-up test matrix

| Scenario | Sizes / environments | Expected result |
| --- | --- | --- |
| Narrow navigation | 320, 360, 390px | Menu visible and reachable; no clipped header action |
| Content reflow | 320px and 200% text | No clipped words, hidden essential text, or unusable controls |
| Phone → tablet → desktop | Continuous resizing, fractional widths, browser zoom | No blank style ranges or lost drafts |
| Forms | Short viewport, real iOS/Android keyboard, errors | Focused field and submit/close controls reachable by scrolling |
| Data extremes | Longest names, plots, mixed formats, missing optional fields | Shared cards and detail sections remain readable |
| Comparison | Empty, 1, 2, and 4 projects | Clear state, contained table scroll, useful navigation |
| Motion | Reduced motion, paused carousel, keyboard focus | Stable reading and discoverable controls |
| Delivery | Production build, slow network, mid-range phone CPU | Measured image/font improvements and no unexpected layout shift |
| Browser coverage | Safari/iPhone, Chrome/Android, desktop Chromium/Firefox | Critical tasks remain usable, including safe-area behaviour |

The immediate outcome is a working About update plus a reproducible set of responsive findings. The next engineering step should be the narrow-header and Localities fixes, followed by shared state and CSS ownership—not another large layer of page-wide overrides.
