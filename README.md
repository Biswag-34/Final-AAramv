# Aaramv Realty — complete Next.js project

This is the editable source of the Aaramv Realty website already built for you, packaged as a standalone Next.js application. The existing design has been refined for desktop and medium screens. Property and locality pages now consume validated JSON catalogs.

## Start locally

Install **Node.js 22.13 or later** (Node.js 22 LTS is a suitable choice). npm is included with Node.js. Extract the ZIP, open a terminal in the `aaramv-realty` folder containing `package.json`, and run:

```bash
npm ci
npm run dev
```

Open **http://127.0.0.1:3000**. Stop the server with **Ctrl+C**.

The first installation needs internet access to download dependencies. Images and icons are included locally or supplied by installed packages. Pages run without an API key; enquiry submission requires the server-side `LEADRAT_API_KEY`. See [LeadRat setup](docs/LEADRAT-INTEGRATION.md).

Both development and production use fixed port **3000** on `127.0.0.1`. If occupied, identify and stop the old instance of this project before restarting; do not change ports or stop an unrelated service.

## Production build

```bash
npm run build
npm start
```

Run these commands from the project directory. `npm start` uses the completed production build. Rebuild after changing the source. Deploy using a host that supports a Next.js Node server; this package is not configured as a static HTML export.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the dependency versions recorded in `package-lock.json` |
| `npm run dev` | Start the local development server with automatic reload |
| `npm run build` | Create the production build and validate TypeScript |
| `npm start` | Serve the production build |
| `npm run typecheck` | Check TypeScript without changing the application |
| `npm run validate:data` | Validate catalog records, relationships and local assets |
| `npm run test:catalog` | Run schema/search/filter regression tests |
| `npm run test:leadrat` | Check CRM payloads, delivery errors and retry handling with a mocked provider |
| `npm run test:enquiry:http` | Start an isolated test server and check the form API without sending live leads |
| `npm run verify:source` | Check that original source and resources match the supplied website snapshot |

`verify:source` is a handoff check. Once you customize a tracked source file, it will report that change; this does not prevent building or running your edited website.

## Included pages

| Page | Local route |
| --- | --- |
| Home | `/` |
| Property listing and filters | `/properties` |
| Property detail, example | `/properties/the-canopy` |
| All localities | `/localities` |
| Locality detail, example | `/localities/whitefield` |
| About | `/about` |
| Contact | `/contact` |
| Terms and conditions | `/terms` |
| Privacy policy | `/privacy` |
| Designed 404 screen | `/404` |
| Coming soon | `/coming-soon` |

All 27 project detail pages and 17 locality detail pages are included. Direct links and browser refreshes work through the catch-all Next.js route. Unknown URLs use server-side `notFound()` and return HTTP 404 with the designed recovery screen.

## Where to make changes

| File or folder | What it controls |
| --- | --- |
| `app/site.tsx` | All page layouts, header, footer, property cards, enquiry forms and interactions |
| `data/properties.json`, `data/localities.json` | Canonical catalog records |
| `app/data.ts` | Validated catalog imports, buying roadmap and shared formatting |
| `lib/catalog-schema.ts`, `lib/catalog.ts` | Input validation, relationships, search and filters |
| `components/catalog-content.tsx` | Data-driven icons, galleries and locality sections |
| `docs/DATA-STRUCTURE.md` | Complete data contract, templates and publishing instructions |
| `app/globals.css` | Exact colours, spacing, typography, responsive layouts, sticky behavior and animations |
| `app/layout.tsx` | Site title, description, favicon and global CSS import |
| `app/page.tsx` | Home route |
| `app/[...slug]/page.tsx` | Other page routes |
| `components/ui/` | Complete reusable UI component collection |
| `hooks/`, `lib/` | Shared hooks and class-name utilities |
| `public/images/` | All seven original JPEG images plus their attribution manifest |
| `public/favicon.ico`, `public/favicon-*.png`, `public/apple-touch-icon.png` | Supplied black-and-gold brand emblem in browser and touch-icon formats |
| `docs/DESIGN_GUIDE.md` | Page-by-page design specification and interaction notes |
| `docs/ASSET_CREDITS.md` | Portable image locations, source links and credits |
| `docs/SOURCE_MANIFEST.json` | Original source hashes and website commit |

The on-page brand mark is an inline SVG in `app/site.tsx`. The typography uses Arial/Helvetica and Georgia system fonts, matching the existing code; no downloadable font resource is missing. Font rendering can differ between operating systems. Match browser, viewport, zoom and carousel slide when comparing screenshots.

### Add or update a property

Use the [property and locality templates](docs/DATA-STRUCTURE.md). Add objects to `data/properties.json` and `data/localities.json`. Prices are integer **INR** (`9500000` means INR 95 lakh), images use full public paths, and properties reference locality IDs. Run `npm run validate:data` before publishing records. Detail routes are derived from the IDs.

### Update branding or styles

Change copy and the brand mark in `app/site.tsx`, the metadata in `app/layout.tsx`, and design tokens at the beginning of `app/globals.css`. Read the complete stylesheet before editing: later rules refine base styles and responsive behavior.

### Search and AI discovery

Public production pages are indexable; personal saved states and filtered searches remain excluded. Page metadata and canonical routes are maintained in `lib/seo.ts`; crawl files are generated by `app/robots.ts` and `app/sitemap.ts`. See [SEO and AI visibility](docs/SEO-AI-VISIBILITY.md) for environment controls, favicon regeneration, verification and remaining account work.

### Enquiry recording

All enquiry forms submit to `POST /api/enquiries`, which validates the request and pushes it to LeadRat from the server. The thank-you page is shown only after the CRM accepts the lead. Set `LEADRAT_API_KEY` in Vercel's environment settings and deploy; optional `LEADRAT_SUBSOURCE` defaults to `Aaramv Realty Website`. Never use a `NEXT_PUBLIC_` prefix for the key. Local development also saves private receipts under ignored `.local/enquiries/`; Vercel delivers directly without filesystem writes. Field mapping, deployment and failure handling are described in [LeadRat setup](docs/LEADRAT-INTEGRATION.md).

Saved homes, comparison selections, recent views and private notes use browser storage. `/shortlist`, `/compare`, `/tools` and `/guides` contain the report upgrades. Full implementation and missing-data handoff: [Report upgrade](docs/report-upgrade/IMPLEMENTATION-REPORT.md).

## What matches the current website

The project began from the deployed source and has since received responsive and data integration changes. `npm run verify:source` compares against the original snapshot and will report these intentional changes. Carousels, filtering, sorting, tabs, saved homes, dialogs, responsive navigation and sticky panels are preserved.

The build setup is adapted: standard Next.js commands replace hosting-specific commands; unused hosting/build dependencies are omitted; TypeScript uses ordinary Node types; exact direct dependencies and an npm lockfile are supplied. A small `app/not-found.tsx` wrapper makes Next.js use the original designed recovery screen for its reserved `/404` URL. The complete shared UI library is retained so you can build further on it. `app/chatgpt-auth.ts` is an unused original helper; the website does not call it or require authentication.

`node_modules` and `.next` are generated locally. `npm ci` and `npm run build` recreate them. Application source and website assets remain in version control.

### Keep commits and uploads small

`.gitignore` excludes dependencies, builds, local enquiry records, browser profiles, caches, logs, packaged uploads, and generated visual-review evidence. Reference screenshots, audit measurements and the duplicate `docs/scraping-handoff/` export stay available locally but are excluded from future commits. Keep `package-lock.json`, application source, `data/`, `public/`, documentation templates and regression tests in Git so a clean checkout remains buildable and testable.

Upload through Git rather than zipping the entire working directory: a normal folder ZIP does not honour `.gitignore`. Files already present in older commits remain in Git history; these exclusions reduce future commit snapshots and uploads without rewriting history.

## Report upgrade — 30 October 2026

The current catalogue contains 27 projects and 17 localities. The eight-page upgrade report has been implemented with the existing visual identity. Source research records are retained, while public preview/review identifiers have been removed. Missing business facts and data-dependent content are documented in [Missing data](docs/report-upgrade/MISSING-DATA.md), with a complete [next-iteration input](docs/report-upgrade/NEXT-ITERATION-INPUT.json).

Search indexing remains disabled pending the business data and production integration pass. Local enquiry records must not be committed or copied into public assets.

Additional checks: `npm run test:buyer`, `npm run test:leadrat` and `npm run test:enquiry:http`. Stop any local server on port 3000 before the isolated HTTP test; it starts its own server with a mocked CRM and a test-only key.

## Troubleshooting

- **`node` or `npm` is not recognized:** install Node.js, reopen the terminal, then check `node --version`.
- **Missing package or incompatible dependency state:** run `npm ci` from this folder. It recreates `node_modules` from the lockfile.
- **Production build not found:** run `npm run build` before `npm start`.
- **Port is in use:** identify the listener on port 3000 and restart only the instance belonging to this project.
- **Images missing:** keep the complete `public/` folder alongside `app/` and `package.json`.
- **Corporate network blocks installation:** allow access to the npm registry, then rerun `npm ci`. No project-specific private registry is required.
