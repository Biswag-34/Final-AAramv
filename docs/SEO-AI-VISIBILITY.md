# SEO and AI visibility implementation

The site now makes its published catalogue available to search crawlers, supplies page-specific metadata and factual structured data, and uses the supplied black-and-gold emblem as its favicon. The canonical origin remains `https://www.aaramvreality.com`; the public trading name remains Aaramv Realty.

## What changed

- Public production routes emit `index, follow` with unrestricted text snippets and large image previews. The 53 canonical routes comprise nine main pages, 27 published projects and 17 published localities.
- Saved homes, comparison states, thank-you and coming-soon pages remain `noindex, follow`. Filtered/search catalogue URLs and calculator input states are also excluded. Tracking parameters alone do not exclude public pages. Project layout variants canonicalize to the clean project URL.
- `/robots.txt` allows public crawling, including Googlebot, Bingbot and OAI-SearchBot under the wildcard rule, and advertises `/sitemap.xml`. APIs are disallowed. Utility pages remain crawlable so crawlers can read their noindex directives. No separate model-training preference was introduced; the previous absence of robots.txt already allowed wildcard crawling.
- The sitemap is generated from the same published catalogue as the pages. It excludes personal states, query variants, drafts, demo records and error pages. Catalogue entries use their recorded `updatedAt` values; undated main pages omit `lastmod`.
- Every public page has its own title, description, canonical, Open Graph and Twitter preview metadata. Project and locality previews use their catalogue cover images and image descriptions.
- Server-rendered JSON-LD identifies the Organization, WebSite and current page. Project and locality breadcrumbs match visible links; collection lists use canonical page URLs. Project/locality source references, record dates and publisher attribution are available in visible HTML and supported by the same catalogue data.
- Organization markup deliberately omits an unverified street address, office hours, agent registration, reviews and ratings. The project pages do not assert live offers or unit availability in schema. No special AI schema, FAQ rich-result promises or ranking guarantees are introduced.
- The homepage uses a stable descriptive heading, “Bengaluru homes that fit your life,” while supporting imagery and copy rotate.
- Unknown routes still return HTTP 404. The report's two historical URLs (`/property/godrej-vanantara` and `/property/assetz-sora-and-saki`) have no equivalent project in the current catalogue, so they retain 404 status instead of redirecting to unrelated inventory.

## Favicon assets

The supplied `Black and gold A emblem favicon.png` was resized without redrawing or changing its proportions/background. The former blue SVG was removed, and the wide wordmark is no longer declared as an icon. The header and organization logo retain the wordmark.

`public/favicon.ico` contains 16, 32, 48 and 64 pixel PNG frames. PNGs are supplied at 16, 32, 48, 64, 96, 192 and 512 pixels, plus `apple-touch-icon.png` at 180 pixels. Root metadata declares the ICO, 32 and 96 pixel icons and the touch icon at stable URLs. These assets do not add an installable app.

To recreate the assets from the original attachment:

```powershell
node scripts/generate-favicons.mjs 'C:\path\to\Black and gold A emblem favicon.png'
```

## Environment and checks

Public production enables indexing automatically. Development and Vercel preview environments remain excluded. Set `SITE_INDEXING_ENABLED=false` on any other staging environment. Do not set this flag to false on the intended public production deployment. Rebuild/redeploy after changing environment configuration; hosting headers must also be checked for `X-Robots-Tag: noindex`.

```powershell
npm run typecheck
npm run build
npm start
# In another terminal, against the production server on the fixed port 3000:
node scripts/seo-http.test.mjs
```

The HTTP checks cover all canonical public routes, metadata inheritance, private/query exclusions, crawler HTML, JSON-LD, visible provenance/breadcrumbs, real 404s, sitemap membership, icon MIME types/dimensions and all ICO frames. To verify staging, start the build with `SITE_INDEXING_ENABLED=false` and run `node scripts/seo-http.test.mjs --staging`.

## Release and account work

### Local validation on 3 November 2026

The production build and TypeScript checks passed. The HTTP suite passed against all 53 public routes in both production and staging configurations, including utility/search exclusions, real 404s, structured data, crawl files and nine icon assets. All 23 catalogue tests and five research-pack tests passed. The 96 pixel favicon was visually inspected. The browser preview connection was unavailable, so interactive layout and real browser-tab icon checks remain outstanding. No deployment was made to the live domain.

Deploy this source through the existing Next.js/Vercel hosting workflow. No separate Sites-hosted copy or new public hostname is needed. After deployment, set `SEO_TEST_BASE_URL=https://www.aaramvreality.com` and run the HTTP checks, then check Search Console URL Inspection and submit `https://www.aaramvreality.com/sitemap.xml`. Verify the Bing Webmaster property and inspect crawler access in the CDN/WAF. A crawler user-agent alone does not establish crawler identity.

Search Console/Bing account verification, business profile ownership, analytics configuration and AI referral/citation measurement require the owner's connected accounts. No tracking IDs, consent setup, advertisements, ad spend, fabricated business details or new project claims were added. Content dates describe the supplied catalogue records, not a new independent property inspection. Existing enquiry and CRM work is preserved.

Browser visual QA and live hosting verification remain separate release checks. These implementation changes support crawlability and interpretation; indexing, search rankings and AI citations are controlled by the respective platforms.

## Official guidance

- [Google AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google favicon requirements](https://developers.google.com/search/docs/appearance/favicon-in-search/)
- [OpenAI crawler controls](https://developers.openai.com/api/docs/bots)
- Implementation follows the documentation bundled with installed Next.js 16.3.4 in `node_modules/next/dist/docs/`.
