# Aaramv Realty report implementation

Iteration date: 30 October 2026

Local preview: http://127.0.0.1:3000

The development and production launch scripts both enforce port 3000 on 127.0.0.1. They refuse to silently move to another port. The user approved the report-led structural changes while preserving the existing branding. No hosting deployment or external messaging was performed.

## Report interpretation

All eight images were read as a strategy and requirements report. The diagrams are explanatory examples, not a replacement visual design. Example project names, prices, reviews, people, ratings, RERA badges, partner memberships, fit scores and KPI percentages in the images were not treated as company facts.

The existing 27-project / 17-locality catalogue and its source evidence were retained. The site uses its existing logo, colours, images, typography, buttons and responsive layout system.

## Page-by-page implementation

| Report page | Implemented in this iteration | Data-dependent content / remaining phase |
| --- | --- | --- |
| 1 — Positioning and six pillars | Curated discovery, richer cards, project decision support, locality intelligence, comparison and shortlisting, simpler contextual enquiries. | Confirm the business positioning and project-specific advisory copy in the input template. |
| 2 — Homepage | Hero/search → featured homes → compact Why Aaramv → locality discovery → buying journey → developer discovery/trust → enquiry. Repeated service blocks removed from the homepage. Both desktop and mobile use this order. | Genuine reviews render when supplied. No invented ratings, transaction counts or response-time promises. |
| 3 — Catalogue and cards | Price band, configurations, status/possession, size with area basis, locality, three highlights, save state, comparison checkbox and clear detail/enquiry actions. Grid/list view. Search, locality, type, budget, bedrooms, status, size, timeline, commute connection, buying-priority and saved filters. Filters/sort/view remain in the URL. All matching homes are shown without endless pagination. | Buyer labels use actual home formats. Investor suitability, rental returns, appreciation, metro proximity and limited inventory need evidence before becoming badges. Mixed area bases are explicitly identified. |
| 4 — Project pages | Gallery thumbnails and existing gallery/zoom; sticky price/configuration/location/possession summary; existing project story and facts; pricing by home format; correct initially selected layout tab; amenities and available amenity photographs; fit/strengths/visit questions; cost-sheet/payment-plan request; document checklist and request; advisor/visit/callback section; related homes; recent views; return to filtered results. | Slots exist for developer history, observed trade-offs, unit advice, maintenance, construction updates, all-inclusive prices, payment milestones and documented approval status. Existing documents remain linked. Empty fields do not become invented facts or fake approved ticks. |
| 5 — Locality pages | Catalogue-based project counts/starting prices; work/road/school/health/retail modules using supplied landmarks; lifestyle and buyer-fit structure; strengths and visit watch-outs; existing connectivity/map links; comparison cards linking other areas; linked project collection. | Area-wide price ranges, trends, rental yields, peak-hour commute measurements and expanded everyday destinations require supplied data. Catalogue project prices are labelled separately from area market averages. |
| 6 — Decision tools | Browser-persistent saved shortlist drawer, shortlist page, private notes, recent views, comparison selection of up to four homes, sticky comparison bar, side-by-side table, difference-only view, add/remove actions, share links excluding notes, contextual cost-sheet enquiry. | Cross-device/account shortlists and an evidence-based personal fit score require a later identity/preference model. No arbitrary score is displayed. |
| 7 — Trust and enquiry | Short consent-based forms; callback and site-visit intent; optional project visit date; relevant project/cost-sheet context; server validation; real local recording; duplicate-safe request IDs; reference-number confirmation; error handling. Responsive advisor/trust/review arrangements are present. | Named advisors/photos, genuine reviews, credentials/badges, response commitment, WhatsApp destination and direct contacts need business input. WhatsApp appears only after a real number is configured. No message has been sent. |
| 8 — Content and measurement | Buyer guides, help FAQs, monthly EMI/total cost/rental-yield calculators with editable assumptions; extensible project/locality guidance input; browser-local engagement event foundation. | Account sync, CRM, email/WhatsApp follow-up automation and site-wide analytics need service choices and configuration. Report example KPI percentages are not displayed as measured results. |

## Public identifier cleanup

Removed the enquiry preview banner, preview-only toast/confirmation, legal preview notice, source-review possession wording from rendered summaries, illustrative-price flag, generic reference-image labels, and demo-record wording/flags in the browser search tool. Missing business fields do not render a warning or invented contact detail.

Original research records remain available internally. Normal buyer-facing facts such as “price on request”, the actual area basis, and the fact that a visit request is not an appointment are useful product information. They are not claims that the site is a mockup.

Ready-to-move summaries display “Ready to move”. Future dates use the supplied precision. Past targets on ongoing projects are presented as “By project phase”, with the internal source detail listed in the missing-data report for updating.

## Enquiry recording and operational boundary

`POST /api/enquiries` writes a unique JSON record under `.local/enquiries/`. This directory is ignored by Git and has no public listing/read API. The endpoint validates the incoming host/origin, body size, required fields, consent, optional date, and request ID. The same request ID does not create a second record. Failures are shown without claiming a request was received.

This is local recording, not CRM/email delivery. The success state says the request was recorded and supplies a reference; it does not claim that an advisor has been notified or that an appointment is booked. A production deployment needs persistent managed storage, staff access, spam controls, retention/deletion policy, backups and a delivery workflow. No external service credentials were invented.

## Data handoff

- `MISSING-DATA.md` lists every project and locality, existing coverage, business requirements and service decisions.
- `NEXT-ITERATION-INPUT.json` contains all 27 project IDs and all 17 locality IDs, ready to fill.
- `data/buyer-guidance.json` is the live optional guidance source; `lib/buyer-guidance.ts` describes the supported presentation fields.

The input handoff includes extra workflow fields such as current inventory and phase timelines. These need mapping to the existing canonical records in the next iteration. Do not copy the whole input file over the live guidance file: `projectName`, `localityName`, business and destination lists are handoff metadata, not fields of that live guidance contract.

### Example field shapes

```json
{
  "allInclusivePrices": [{"configuration": "Your actual layout", "amount": "Your actual total", "includes": "What the quote includes"}],
  "paymentPlan": [{"milestone": "Your actual milestone", "amount": "Amount or percentage"}],
  "approvals": [{"title": "Document name", "status": "Actual document status", "url": "https://your-document-url"}],
  "priceTrend": [{"period": "Your observed period", "pricePerSqFtInr": 0}]
}
```

Supply actual values with source/date context; zero above is only the shape of a numeric field, not a market figure to publish.

## KPI foundation

`lib/engagement.ts` records up to 2,000 browser-local interaction events for 30 days. Events include search, results view, project view, save, comparison selection/view, recorded enquiry and return visit. Contact details, search text, messages and notes are excluded. These are local diagnostics, not representative business analytics.

| KPI from the report | Production measurement definition |
| --- | --- |
| Search-to-listing click rate | Search sessions reaching a results page / search sessions |
| Listing-to-detail rate | Results sessions opening a project / results sessions |
| Second-property view rate | Sessions viewing at least two distinct projects / project-viewing sessions |
| Save/compare usage | Sessions with a save or comparison action / eligible browsing sessions |
| Enquiry conversion | Project-viewing sessions with a successfully recorded enquiry / project-viewing sessions |
| Return visitor rate | Visitors returning within 30 days / visitors, under the selected consent/identity policy |

A production analytics service, consent policy and session/visitor model must be selected before these rates can be reported accurately. No baseline or uplift percentage is asserted.

## Verification

- Existing catalogue and enquiry validation suites, new buyer-tool regression tests, data/assets validation, HTTP route/metadata checks, enquiry persistence/security tests, TypeScript and production build.
- Browser checks cover desktop/tablet-width and 390 px mobile layouts, home ordering, saving/drawer, comparison, note persistence after reload, sharing without notes, catalogue filters and mobile filter drawer, project detail and enquiry layout.
- See `VALIDATION.md` for final run results and any remaining verification limits.
