# LeadRat website integration

All header, footer, contact, project, site-visit and brochure enquiry forms share `POST /api/enquiries`. That route validates consent and contact details before sending one lead to LeadRat. Only a confirmed CRM acceptance returns HTTP 201 and opens the thank-you page.

## Deploy on Vercel

1. Deploy this Next.js project from the folder containing `package.json` (`Final AAramv` in this workspace).
2. In the Vercel project, open **Settings → Environment Variables**.
3. Add **`LEADRAT_API_KEY`** with the exact key supplied by LeadRat in the email/spreadsheet. Enable it for **Production**. Add it to Preview only if preview form submissions should create real CRM leads too.
4. Optionally add **`LEADRAT_SUBSOURCE`** = **`Aaramv Realty Website`**, or the website name agreed with your CRM team. The code uses this value by default.
5. Deploy/redeploy after saving the variables. Keep the standard Next.js preset and `npm run build`; no extra dependency or Vercel plugin is required.
6. Submit one enquiry using your own contact details on the deployed site. Verify it appears in LeadRat with the correct project, mobile, budget preference and website reference. Acceptance by the real tenant has not been verified by the automated tests.

Do not prefix the key with `NEXT_PUBLIC_`, paste it into client code, or commit `.env.local`. The provided key has been copied directly from the attachment into the ignored local `.env.local` for development. `.env.example` documents variable names without containing a secret.

Vercel stores the accepted leads in the CRM. The function does not require a writable project filesystem, local JSON database, or background process. If the key is missing, valid form submissions return a temporary-unavailability error instead of claiming success.

## API contract and mapping

Endpoint: `POST https://connect.leadrat.com/api/v1/integration/Website` with headers `API-Key` and `Content-Type: application/json`.

The attached workbook uses a JSON **array**, whereas the pasted email uses a single object. This implementation follows the supplied workbook: `[oneLead]`, including its `subSource` capitalization. The workbook's sample people, phone numbers, dates, assignments and appointment statuses are examples and are never sent as customer data. The `API-Key` header is required despite the workbook's separate “No Authentication” label.

| Website data | LeadRat field |
| --- | --- |
| Name | `name` |
| Mobile, with optional +91 | Ten-digit `mobile`, separate `countryCode: "91"` |
| Optional email | `email`, empty when omitted |
| Selected project | `project`, matched against the published website catalog |
| Project locality | Catalog-derived `location`, `city`, `state` when available |
| Apartment / Villa / Plot preference | `propertyType`; Apartment maps to Flat |
| Budget range | Exact original label in `notes` and `additionalProperties.BudgetPreference` |
| Form context, message, request type, preferred date | `notes` and relevant `additionalProperties` |
| Contact consent | `additionalProperties.ContactConsent` |
| Website reference | `notes` and `additionalProperties.WebsiteReference` |
| Submission timestamp | `submittedDate` as `dd-MM-yyyy` and `submittedTime` as `HH:mm:ss`, in Asia/Kolkata |
| Website attribution | `source: "Website"`, configurable `subSource` |

Budget bands such as ₹1–2 Cr are not exact amounts, so numeric `budget` and `leadExpectedBudget` are omitted. Generic home-type choices never become project names. New enquiries do not set `leadStatus`, booked dates, scheduled dates, primary users or secondary users. A preferred visit date is a request for follow-up, not a confirmed appointment. The video and additional status images mentioned in the email were not included in the supplied files; status automation can be mapped separately if those are provided.

## Delivery and retry behavior

The request waits for LeadRat, with a 10-second upstream timeout and a 30-second function budget. It uses HTTPS, refuses redirects and keeps the key and upstream response bodies out of browser responses and logs. The supplied contract defines HTTP 200 as success; explicit JSON failure flags are also rejected. An unreadable non-JSON response is treated as uncertain rather than claiming delivery.

Explicit rejection produces a visible error and allows a retry. Network errors, timeouts, upstream server errors and ambiguous responses produce a reference and ask the visitor to contact the team before submitting again. There is no automatic resend or hidden background retry. If the browser loses the server response, it also blocks another submission from that form until the visitor follows up.

Retries with the same reference share a promise on the same warm instance for up to 30 minutes, bounded to 1,000 entries. **Vercel instances do not share memory, so this is not a durable deduplication guarantee.** The provider has not documented an idempotency key. For a timeout, find the website reference in LeadRat before manually resubmitting. A durable queue/database and provider-supported deduplication would be needed for automatic replay across instances. Failed requests are not queued on Vercel.

Outside Vercel, local development additionally stores receipts under ignored `.local/enquiries/`. For a self-hosted production Node server, opt into receipts using a writable persistent `ENQUIRY_STORAGE_DIR`; production otherwise sends directly. Delivered local receipts prevent replay after restarts. Pending/uncertain receipts require a CRM check before an operator changes their state. These local files contain contact information and must remain private.

## Verification

Run `npm run test:enquiry`, `npm run test:leadrat`, `npm run test:enquiry:http`, and `npm run build`.

The HTTP test starts its own local server on fixed port 3000 with outbound CRM fetches intercepted and a test-only key. It refuses to run against an existing server, preventing accidental live CRM submissions. No automated test creates real leads or verifies the supplied tenant key.

Reference: [LeadRat website API documentation](https://apidocs.leadrat.com/index.php/docs/technical-documentation-for-crm-api-integration-with-websites/), [Vercel environment variables](https://vercel.com/docs/environment-variables).
