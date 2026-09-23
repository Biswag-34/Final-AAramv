# Aaramv Realty — complete Next.js project

This is the editable source of the Aaramv Realty website already built for you, packaged as a standalone Next.js application. The existing design has been refined for desktop and medium screens. Property and locality pages now consume validated JSON catalogs.

## Start locally

Install **Node.js 22.13 or later** (Node.js 22 LTS is a suitable choice). npm is included with Node.js. Extract the ZIP, open a terminal in the `aaramv-realty` folder containing `package.json`, and run:

```bash
npm ci
npm run dev
```

Open **http://127.0.0.1:3000**. Stop the server with **Ctrl+C**.

The first installation needs internet access to download dependencies. Images and icons are included locally or supplied by installed packages. No API keys, environment variables, database, paid fonts or platform account are needed to run the website.

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

All nine sample properties and six locality detail pages are included. Direct links and browser refreshes work through the catch-all Next.js route. Unknown URLs display the same designed recovery screen as the current website. Because the original prototype resolves these inside its client page, unknown catch-all routes retain its HTTP 200 behavior (the reserved `/404` URL uses the custom Next.js not-found wrapper); a production SEO pass can add server-side `notFound()` later.

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
| `public/favicon.svg` | Brand favicon |
| `docs/DESIGN_GUIDE.md` | Page-by-page design specification and interaction notes |
| `docs/ASSET_CREDITS.md` | Portable image locations, source links and credits |
| `docs/SOURCE_MANIFEST.json` | Original source hashes and website commit |

The on-page brand mark is an inline SVG in `app/site.tsx`. The typography uses Arial/Helvetica and Georgia system fonts, matching the existing code; no downloadable font resource is missing. Font rendering can differ between operating systems. Match browser, viewport, zoom and carousel slide when comparing screenshots.

### Add or update a property

Use the [property and locality templates](docs/DATA-STRUCTURE.md). Add objects to `data/properties.json` and `data/localities.json`. Prices are integer **INR** (`9500000` means INR 95 lakh), images use full public paths, and properties reference locality IDs. Run `npm run validate:data` before publishing records. Detail routes are derived from the IDs.

### Update branding or styles

Change copy and the brand mark in `app/site.tsx`, the metadata in `app/layout.tsx`, and design tokens at the beginning of `app/globals.css`. Read the complete stylesheet before editing: later rules refine base styles and responsive behavior.

### Connect real enquiries later

Find `LeadForm` in `app/site.tsx`. It currently validates input and displays a clearly labelled demo confirmation. To launch real lead collection, replace that demo submission path with a server endpoint, send the form to your CRM/email service, and add success/error handling. Keep credentials on the server. The coming-soon form is also a demo. Current shortlist hearts use the browser's local storage.

## What matches the current website

The project began from the deployed source and has since received responsive and data integration changes. `npm run verify:source` compares against the original snapshot and will report these intentional changes. Carousels, filtering, sorting, tabs, saved homes, dialogs, responsive navigation and sticky panels are preserved.

The build setup is adapted: standard Next.js commands replace hosting-specific commands; unused hosting/build dependencies are omitted; TypeScript uses ordinary Node types; exact direct dependencies and an npm lockfile are supplied. A small `app/not-found.tsx` wrapper makes Next.js use the original designed recovery screen for its reserved `/404` URL. The complete shared UI library is retained so you can build further on it. `app/chatgpt-auth.ts` is an unused original helper; the website does not call it or require authentication.

`node_modules` and `.next` are intentionally excluded from the ZIP because they are machine-specific generated folders. `npm ci` and `npm run build` recreate them. No application source or design resource is excluded.

## Current content and behavior

This faithfully preserves the visualization: listings and company figures are samples, contact/social details await verified brand information, and forms do not send or store enquiries. The legal pages are marked design drafts. Search-engine indexing remains disabled in `app/layout.tsx`, as in the current preview. These are existing prototype behaviors, not missing export files.

## Troubleshooting

- **`node` or `npm` is not recognized:** install Node.js, reopen the terminal, then check `node --version`.
- **Missing package or incompatible dependency state:** run `npm ci` from this folder. It recreates `node_modules` from the lockfile.
- **Production build not found:** run `npm run build` before `npm start`.
- **Port is in use:** identify the listener on port 3000 and restart only the instance belonging to this project.
- **Images missing:** keep the complete `public/` folder alongside `app/` and `package.json`.
- **Corporate network blocks installation:** allow access to the npm registry, then rerun `npm ci`. No project-specific private registry is required.
