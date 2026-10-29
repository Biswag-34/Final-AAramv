## Updated research pack import

These records and schemas now include the 28 October 2026 uploaded research pack: pricing, projectScale, overview, galleryImageIds, configurationIdAliases, detailed layout areas, brochures, locality usp and aaramvPerspective. See each complete record for populated examples. Core templates still validate; research extensions are optional. Raw evidence stays in the data layer. Plot site layouts may reference master-plan images.

# Aaramv current catalogue and scraping contract

This is a snapshot of the actual website input, with 27 property records and 17 locality records. It changes no website code, design, routing or architecture. The authoritative validation rules remain `lib/catalog-schema.ts` in the repository.

## What is included

- `properties.json` and `localities.json`: exact copies of the current live input arrays.
- `properties/<existing-id>.json` and `localities/<existing-id>.json`: one current object per existing record.
- `index.json` and `index.md`: all IDs, names, files and property-to-locality relationships.
- `schemas/property.schema.json` and `schemas/locality.schema.json`: complete JSON Schema definitions for a single record, generated from the current Zod definitions.
- `schemas/property-catalog.schema.json` and `schemas/locality-catalog.schema.json`: schemas for the top-level arrays, using local references to the single-record schemas.
- `schemas/allowed-icons.json`: the full current list of accepted icon names.
- `templates/property.template.json` and `templates/locality.template.json`: existing draft templates. Replace their placeholder text and images, and remove unused example rows before publishing.
- `templates/research-evidence.template.json`: an optional editor-only sidecar for richer source, quotation and media-rights information. Its extra fields are NOT accepted in the live catalogue.

## Output format and stable IDs

The website reads the two arrays under `data/`. It does not automatically scan the individual files in this export. Merge corrected objects back into the arrays by their existing `id`.

Do not change existing IDs or locality relationships just to correct a display name or registered address. A property's `localityId` matches a locality's `id`; no separate project-ID list belongs inside a locality record. Existing search-area labels can describe a broad corridor, while `address` and `phaseName` identify the actual project setting.

Keep the same camelCase field names and nesting. Apart from property `totalUnits`, which is optional, the fields listed as required in the schema must be present. Nullable fields use JSON `null`; optional collections use `[]`. An empty string is permitted only where the schema allows it. Unknown keys are rejected.

## Property collection priorities

1. Identity: existing ID, project name, developer, legal promoter evidence, selected phase/block, registered address, postal code, project entrance and official map coordinates where supported.
2. Layouts: one configuration per actual layout/area/price combination. Record bedroom and bathroom counts, area in numeric square feet and its exact basis, layout ID, actual floor plan, availability and any layout-specific caveats.
3. Prices: collect the current layout or unit cost sheet, developer-sale/resale scope, quote date, inclusions, exclusions and availability evidence. A single resale ask must not price a whole project's configuration range. Put publishable caveats in `priceNote` and source links in `sources`; retain the fuller structured quotation evidence in the sidecar.
4. Completion: keep project `status`, phase/block completion, possession indication and the exact possession date distinct. Do not turn a certificate validity date into a handover commitment. If only a month/year is known, use `possession.label` and keep `possession.date: null`.
5. Scope: distinguish master township acreage, phase acreage, total homes and currently available units. `totalUnits` represents the named project/phase, never available inventory.
6. Project content: descriptions, three or four project-specific highlights, supported facts and amenities, location context and FAQs. Keep developer descriptions distinct from independent inspections.
7. Documents: match any registration to the correct promoter/project/phase certificate. A registration reference is not a verified legal-clearance badge.
8. Media: actual project photographs, artist impressions, show apartments, floor plans and master plans must be correctly identified. Record source and publication permission; the existence of a public image URL is not proof of rights.

## Locality collection priorities

Collect the existing ID, display name, city/state/country, zone, a specific introduction, practical considerations, genuine locality imagery and supported map context. Property links already come from each property's `localityId`.

Use operator/government evidence for landmarks. Record the reference point and travel mode for any measured route. Do not invent distances, travel times, school proximity, infrastructure opening dates, flooding/water assurances, appreciation forecasts or rental returns. Planned, under-construction and operational infrastructure are distinct enum values.

Market figures need the sample/scope, comparable home type, area basis, source and date. Leave `market: null` until those exist. Current connectivity rows containing general buyer checks are editorial prompts, not verified geographic destinations.

## Units and accepted values

- `schemaVersion`: exactly `2`.
- Money: positive integer INR, e.g. `12500000` for INR 1.25 crore. Do not output formatted currency strings or crore values in `startingPriceInr`.
- Area: positive number in square feet. `areaBasis`: `carpet`, `built-up`, `super-built-up`, `plot`, or `unspecified`.
- Property type: `Apartment`, `Villa`, `Plot`, `Row House`, or `Apartment and Villa`. The existing UI groups row houses and mixed apartment/villa records under its Villa category.
- Project status: `Ready to move`, `Under construction`, or `New launch`. This field currently cannot be null. Do not guess a status to satisfy the schema; retain an unresolved research record outside the publishable catalogue until it is supported.
- Configuration availability: `available`, `limited`, `sold-out`, or `on-request`.
- Bedrooms/bathrooms: integer 0–30 or null. Studio bedrooms are 0. Plots require both values to be null. Half-BHK/flex-room marketing belongs in the label, with the actual whole-bedroom count in `bedrooms`.
- Dates: real `YYYY-MM-DD` or null. Do not invent a day when only month/year is known.
- Image kinds: `exterior`, `interior`, `amenity`, `floor-plan`, `map`, `locality`, `master-plan`, `construction`.
- Travel mode: `walk`, `walking`, `drive`, `transit`, or null. Kilometres and minutes are numeric; minutes are whole numbers.
- URLs: public-relative paths such as `/images/project/cover.webp`, or public HTTPS URLs. No filesystem paths, expiring URLs, credentials or protocol-relative URLs.

## References that must resolve

- `localityId`: an existing locality; a published property needs a published locality.
- `coverImageId`: an image in the same record.
- `primaryConfigurationId`: a configuration in that property.
- `floorPlanImageId`: null, or a same-property image whose kind is `floor-plan`.
- `relatedPropertyIds`: other existing property IDs; no self-reference.
- IDs must be unique in their applicable array.

## Sources and unresolved values

The current live source object accepts ONLY `label`, `url` and `checkedAt`. `checkedAt` is the source review date; it is not automatically a quotation, completion, image-capture or legal-policy effective date. Use an explicit label to name the phase/document scope. Keep richer machine-readable provenance in the research sidecar.

The snapshot intentionally contains unknown prices, dates and other held facts. Nulls mean unconfirmed information, not zero cost or absent amenities. Descriptions and reviewed source references are research inputs, not a fresh independent inspection or a guarantee of current inventory.

The draft flag is not a secrecy mechanism: catalogue data is bundled into the client. Do not put credentials, private owner contacts, private documents or sensitive personal information in either catalogue.

## Validate before replacing website data

From the project directory, run:

```text
npm run validate:data
npm run test:catalog
npm run typecheck
```

The generated JSON Schemas help your scraper check structure. They do not express every cross-record reference or custom refinement. The repository's Zod validator is authoritative and must still pass. Structural validation does not establish factual accuracy.

After corrections are merged, the current development server reloads the data at `http://127.0.0.1:3000/`. Production requires a new build. No scraping or website changes were performed to create this package.
