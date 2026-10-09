# Mobile and tablet design

Implemented from the October 2026 Aaramv Realty design audit. Desktop remains the existing experience at 1200 CSS pixels and above.

## Layout boundaries

- `app/mobile.css`: phones below 600px, including extra reflow below 360px.
- `app/tablet.css`: tablets from 600px through 1199px.
- `app/responsive-shared.css`: responsive foundations and overlays, restricted to widths below 1200px. The few rules outside this media query only hide responsive/server alternatives on desktop.
- `app/responsive.tsx`: responsive navigation, homepage, property results, neighbourhood index, forms, summaries and grouped layouts.
- `hooks/use-responsive-layout.ts`: media subscriptions and server rendering boundaries. CSS chooses the first visible layout; hydration preserves that branch and removes hidden content.
- `components/responsive-gallery.tsx`: responsive image viewer with zoom and original-image access.

Two property columns start when available width supports approximately 280px cards. Narrow tablet widths retain one column. Enquiry fields use one column on phones and only pair on tablets when each field has room. Tablet property details have an inline enquiry panel instead of a sidebar.

## Original Audit Changes

The mobile/tablet homepage has a static image hero, labelled search with project/locality suggestions, four catalog-backed properties, neighbourhood cards, concise benefits, a static developer grid, three expandable buying phases and a short enquiry form. Duplicate showcases, unsupported achievement counters, testimonial claims and preview footer links are absent from this responsive experience.

Property cards distinguish the project configuration range from the starting priced layout. They show developer, price basis, area basis (or explicitly unknown basis), saved state and View details. Reused project images on neighbourhood cards are labelled. Results have draft filters with a pending count, budget presets and numeric inputs, applied chips, sorting, six-at-a-time expansion and saved-home access. Query, filters, sort and expansion live in the URL; return position is retained when opening a result.

Forms have 16px input text, 50px controls, optional preferences, separate callback/visit intent, persistent inline errors, contact consent and a truthful preview confirmation. Close and primary icon controls have 44px targets. Property details retain sourced metadata, grouped floor plans, an updated date, a zoomable gallery and a contextual visit action naming the property. Sticky navigation respects the responsive header. Dark-section links use a light accent.

## Original Audit Verification

- Browser reflow checks: Home, Results, Property Detail, Localities, Locality Detail, About and Contact at 320, 393, 600, 820, 1024 and 1180px. No page-wide horizontal overflow.
- Additional homepage widths: 360, 375, 430, 599, 768 and breakpoint boundaries.
- Desktop checks at 1200, 1280, 1440, 1728 and 1920px. The 1440px header, hero, introduction, property cards, CTA and footer measurements match the pre-change baseline.
- `app/desktop.css`, `app/globals.css` and `app/catalog.css` are unchanged.
- Browser workflows cover suggestions, the 27-to-3 Plot filter, saved/unsaved and empty states, inline form validation, preview confirmation, grouped plans, zoom, project-specific visit intent, sorting, expansion and return navigation.
- TypeScript, existing catalog tests and a production build were run. Browser emulation is not a substitute for physical iOS/Android or enlarged-text testing.

## October 10 Refinements

- Shared enquiry form variants cover header/advisor, bottom-page, contact and project enquiries. Email is visible in every variant; project names are read-only and carried into the visit dialog. Both callback and visit actions remain visible on phones. Validation has inline feedback and colorful Sonner toasts. Confirmations explicitly remain previews, not transmitted leads.
- Home uses the same twelve-developer Embla carousel across devices. The mobile neighbourhood album alternates card heights over animated connecting lines; the mobile advisory comparison is swipeable rather than vertically repeated.
- The journey advances every 2.6 seconds while visible, pauses for keyboard interaction, and includes a pause control. Automatic motion respects reduced-motion preferences. Stage numbers and icons have separate layout positions.
- Page and section headings use the full available section width on desktop/tablet and fit that container on one line. Compact form headings and repeated property-card titles retain their own hierarchy.
- Desktop filters pin 104px below the viewport top. Wider tablets (900-1199px) have a left filter pinned beneath their 76px header; smaller devices retain a drawer. Tall filters scroll internally and stop at the results boundary. Detail forms retain their adaptive sticky behavior.
- Shared validation tests cover local and +91 phone formats, malformed email, required names and contact consent. Current responsive checks supplement, rather than preserve, the original desktop baseline above.

## Content and operational follow-up

Verified team identities, business contact methods, response expectations, fees, achievement evidence, customer permissions and relationship claims were not supplied. They must come from the business. No real lead endpoint exists in this project: responsive forms explicitly identify their confirmation as a preview and do not transmit enquiries. No commute times or missing area/distance measurement bases were fabricated. Existing property records and media sources remain unchanged.

Run the development server with `npm run dev` at `http://127.0.0.1:3000`.
