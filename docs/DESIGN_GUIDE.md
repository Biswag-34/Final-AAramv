# Aaramv Realty — Website visualization & build guide

A fresh design concept based on the current brief. No previous brand assets or design assumptions were reused. “Aaramv Realty” is the working spelling used in the prototype; confirm the registered brand name and logo before launch.

## The design direction

An approachable premium Bengaluru property partner: generous architectural photography, precise information, an airy white foundation, deep navy sections, cobalt actions and a restrained lime accent. Editorial headings communicate the brand; compact modules support property comparison.

The prototype demonstrates the complete browsing experience. It uses fictional properties and sample achievement figures. It does not receive enquiries, book visits, create subscriptions or take payments.

## Visual references inspected

These sites were viewed in a browser, including rendered screenshots, to study composition and hierarchy. The design is original; no paid template source or competitor branding was copied.

| Reference | Visual observations | Application in this concept |
|---|---|---|
| [FIND Real Estate on Awwwards](https://www.awwwards.com/sites/find-real-estate), and [live website](https://findrealestate.com/) | Large expressive typography, an immersive architectural hero and restrained navigation | Strong headline hierarchy and photography that carries the opening impression |
| [Realty Webflow template](https://webflow.com/templates/html/realty-real-estate-website-template), [live preview](https://realty-template.webflow.io/) | Generous spacing, rounded photography, split composition and asymmetric property presentation | Consistent image radii, open white space and distinct compositions for different pages |
| [Ivy Homes buying page](https://ivy.homes/buy) | Compact left filters, concise cards, visible price and configuration | Scan-friendly property cards and a focused search/filter architecture |
| [Ivy Homes property example](https://ivy.homes/listing/2357) | Gallery, section navigation, overview, floor plan, amenities, neighbourhood and inspection information | A structured property detail page with separate information sections |
| [Naverah Assets](https://www.naverahassets.com/) | Photographic hero, prominent rounded search and service-led messaging | Search inside the hero and an end-to-end channel partner narrative |
| [ANAROCK](https://www.anarock.com/) | Confident brand hierarchy, contrasting CTA colour, editorial advisory language | Company credibility, measured copy and contrasting content sections |

Bengaluru context was cross-checked against ANAROCK’s [Q1 2025 residential overview](https://websitemedia.anarock.com/media/Residential_Market_Viewpoints_Bengaluru_Q1_2025_0dbe000f64.pdf) and its Whitefield/Sarjapur micro-market material. No historic price statistic is presented as a current market number. The locality content is qualitative guidance, not a return forecast.

## Page map

| Page | Route | Main content / behaviour |
|---|---|---|
| Home | `/` | Sticky ribbon header; three-slide image carousel; search; two CTAs; popular searches; company difference; achievement strip; property type/status/budget tabs; localities; six-step roadmap; enquiry form; footer |
| Property listing | `/properties` | Direct search; locality/type/budget/bedroom/status filters; sorting; saved-home filter; result count; empty state; two-column cards, three on large desktops |
| Property detail | `/properties/the-canopy` | Banner/gallery; title and price; configuration; section navigation; overview; configurations; amenities; locality; document checklist; FAQs; sticky enquiry form; related properties |
| Localities | `/localities` | Bengaluru overview; buyer priorities; animated image rows; North/East/South selection |
| Locality detail | `/localities/whitefield` | Area introduction; suitability and practical checks; matching properties |
| About | `/about` | Brand story; purpose; achievement strip; proposed motto; team-role modules |
| Contact | `/contact` | Clear contact choices; extended enquiry form; callback and site-visit actions |
| Terms | `/terms` | Anchored contents and clearly marked draft terms |
| Privacy | `/privacy` | Anchored contents and an accurate explanation of prototype data handling |
| 404 | `/404` or an unknown route | Designed recovery screen linking to home and properties |
| Coming soon | `/coming-soon` | Brand-led anticipation screen and a demo email-notification form |

Other property and locality routes are generated from `app/data.ts`. The menu includes links to the coming-soon and 404 previews.

## Exact design tokens

| Token | Value | Use |
|---|---|---|
| Ink / navy | `#152B3B` | Main typography and locality section |
| Footer navy | `#102331` | Footer and dark image overlays |
| Cobalt | `#294FD0` | Primary buttons, selected controls, accents |
| Lime | `#DEEF93` | Hero highlight and secondary hero CTA |
| Main background | `#FFFFFF` | General page canvas |
| Quiet surface | `#F3F6F7` | Property collection background |
| Enquiry surface | `#EAF0FD` | Home CTA block |
| Border | `#DCE3E7` | Cards, dividers, controls |
| Supporting text | `#60707D` | Descriptions and metadata |

**Typography:** Arial / Helvetica / system sans-serif for stable rendering, with Georgia italic reserved for selected hero/brand words. No paid font dependency. Headings use medium weight and tight tracking; body text is 16px by default. Property metadata is compact at 12–14px.

| Element | Desktop | Phone |
|---|---|---|
| Hero heading | `clamp(44px, 5.6vw, 82px)` | 47px |
| Section heading | `clamp(36px, 4vw, 58px)` | 38px |
| Property title | 22–24px | 24px |
| Body | 16–18px | 14–16px |
| Content width | max 1280px, 48px side gutters | 20px side gutters |
| Section spacing | 104px vertically | 65px vertically |
| Header | 72px tall, sticky 16px from top | 62px tall, sticky 10px from top |
| Card radius | 15px | 15px |
| Hero radius | 24px | 18px |
| Primary buttons | 50px minimum height, pill corners | generally 42–50px |

`app/globals.css` is the exact implementation source. Its later rules refine the earlier base rules, so use the complete stylesheet.

## Layout and interaction rules

### Header and hero

The ribbon is sticky, translucent and lightly blurred. The centred desktop menu collapses to a side panel. The hero has three photographs, three headlines, previous/next controls and pause/play. It advances every eight seconds until paused, and pauses on hover or focus. Reduced-motion preferences disable autoplay and animation.

The search button remains inside the search surface. Property type is available beside search on desktop; on phones it is available through listing filters to keep the hero compact. Popular searches open prefiltered results.

### Property listing

The desktop layout is a 252px left column plus the property grid. At typical desktop widths the grid has two cards per row; at 1600px and above, three. Below 850px the filters move into a slide-in panel; below 600px the cards form one column.

The filter panel uses `position: sticky; top: 109px`, inside the listing layout. It stays alongside the results and naturally releases at the end of that grid. There is no scroll-lock or nested desktop scrollbar. At very short viewport heights, it returns to normal flow so no controls become unreachable.

Filters combine. The budget slider uses crores; price formatting switches between lakhs and crores. Sorting supports recommended order and both price directions. Empty results offer a reset. Hearts maintain a shortlist in device-local storage only.

### Property detail

A large banner precedes the content. The main grid has a flexible left column, a 337px right column and a 64px gap. The enquiry form sticks at 112px and is constrained by the detail content’s parent; it releases before related properties and the footer. At phone width it becomes an inline section.

Anchor navigation links to overview, layouts, amenities, location, documents and FAQs. The gallery opens in a keyboard-accessible dialog. All areas and specifications in the current sample are marked illustrative. Real floor plans and a real map are deliberately not fabricated.

### Forms and actions

The callback and site-visit buttons both validate the form and show different confirmation wording. Required fields are name, a valid Indian mobile-number shape and contact consent. Preferences and optional email/message give context. The confirmation explicitly says no request was sent or saved.

Social buttons explain that verified brand links are still needed. Contact information is not invented. The coming-soon form demonstrates its success state without subscribing anyone.

### Motion

Hero image crossfade: 1.3 seconds. Card hover: a 5px lift and slight image zoom. Tab content: a short entrance transition. Side panels and dialogs use accessible component transitions. Locality imagery zooms gently on hover. Reduced-motion preferences are respected.

## Content needed to launch

1. Official logo, spelling, legal entity, verified office address, telephone, email and social links.
2. Company achievements supported by evidence, actual team names/portraits/biographies, approved brand story and motto.
3. Real inventory: developer, project name, locality, approved media, exact map location, status, possession information, RERA ID and verification link, price breakup, clearly defined area types, configurations, floor plans and amenities.
4. Approved service wording and legal/privacy policies reflecting actual business processes.
5. A working lead endpoint or CRM connection with consent records, delivery/error states and spam protection. Supply a verified business number before connecting WhatsApp or call actions.

## Source package

The downloadable package includes the complete application source, shared UI components, local images and attribution manifest. It also includes a portable Next.js package configuration. Use Node.js 22 or newer, run `npm install`, then `npm run dev`. Build for a Next.js-compatible host using `npm run build` and `npm start`.

The interactive hosted prototype uses the same app, data and CSS through a compatible server runtime. The exported source has standard Next.js commands to make handoff easier. No backend/CRM integration is included.

Key files:

- `app/site.tsx`: pages, shared components and interactions.
- `app/data.ts`: sample properties, localities and buying steps.
- `app/globals.css`: colours, typography, layout, breakpoints and motion.
- `app/layout.tsx`: metadata and global stylesheet.
- `components/ui/`: accessible tabs, dialogs, sheets, selects, slider, checkbox and radio primitives.
- `public/images/asset-manifest.json`: source URLs, photographer credits and image-use notes.

## Verification

The prototype passed TypeScript validation. Browser checks covered the home hero and tabs, property filters, saved homes, detail navigation, enquiry confirmation, locality and brand layouts, contact form, legal pages, 404 and coming-soon screens. Phone-width checks covered the home page, listings, filter panel and property detail, including a corrected small-screen overflow. The hosted production build and the portable Next.js production build both completed successfully.

A feature-detected read-only property search tool is included for supporting browsers. Its browser integration could not be validated because the preview browser did not expose the required page API; ordinary website controls are unaffected.
