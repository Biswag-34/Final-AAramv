# Final validation — 30 October 2026

| Check | Result |
| --- | --- |
| Production build (`npm run build`) | Passed, including final TypeScript compilation and all Next.js page-generation checks |
| Standalone TypeScript (`npm run typecheck`) | Passed after generated route files were available |
| Catalogue schema and assets (`npm run validate:data`) | Passed: 27 projects, 17 localities, 366 local asset references |
| Catalogue regressions (`npm run test:catalog`) | 23 passed |
| Enquiry field validation (`npm run test:enquiry`) | 3 passed |
| Buyer tools (`npm run test:buyer`) | 5 passed, including combined filters matching the same layout |
| Enquiry HTTP/persistence (`npm run test:enquiry:http`) | 11 checks passed |
| Route/metadata/public-copy audit (`node scripts/verify-content-http.mjs`) | 56 routes passed with unique titles, canonical URLs and no targeted preview/review identifiers |
| Whitespace (`git diff --check`) | Passed |
| Browser console at final comparison | No errors returned |

## Browser evidence

- Revised home section order and existing visual identity.
- Save and compare controls, saved-shortlist drawer, and side-by-side comparison table.
- Saved homes, comparison choices and private notes restored after reload.
- Shared shortlist URL contains project IDs and excludes notes.
- Thanisandra locality filter shows three catalogue projects; adding ready-to-move timeline reduces the result to one.
- Mobile filter drawer remains open while changing filters and displays the updated result count.
- Project gallery thumbnails, clean possession summary and new decision-support sections at 390 px width.
- Mobile enquiry form submitted successfully and displayed a request reference. The stored synthetic test record was verified, then removed.
- Calculator default EMI: ₹69,426 for ₹80,00,000 principal, 8.5% annual rate and 20 years. At 0% it shows ₹33,333/month and zero interest. ₹40,000 monthly rent less ₹20,000 annual expenses on a ₹1,00,00,000 cost gives 4.60% yield.
- Desktop comparison screenshot: `comparison-preview.png`.
- Temporary mobile viewport override was reset.

Browser automation briefly timed out during one form submission. A fresh observation confirmed the submission had succeeded; it was not repeated. The preferred browser bridge was unavailable, so verification used the supported desktop browser connection.

One standalone typecheck ran concurrently with a production build while Next.js regenerated its route types, causing transient missing-generated-file errors. It was rerun after generation completed and passed. The final production build also completed its TypeScript check successfully.

The local development server remains running on http://127.0.0.1:3000. No external CRM, email, WhatsApp delivery, account synchronisation or public deployment was verified or claimed. These integrations are listed in the missing-data handoff.
