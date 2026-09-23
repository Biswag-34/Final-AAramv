# Export validation

Verified on 23 September 2026 using Node.js 24.19.0, npm 11.9.0 and Next.js 16.3.4.

- A fresh `npm install` completed in the standalone project, using the public npm registry. Its generated `package-lock.json` is included; use `npm ci` to reproduce those versions.
- The project has its own installed dependencies. It does not use the hosted workspace through a symlink.
- `npm run build` passed using standard Next.js and webpack.
- `npm run typecheck` passed.
- `npm run verify:source` passed for all 83 original application and resource files.
- The production server passed direct HTTP checks for 25 routes, including all nine property pages and all six locality pages.
- All 12 public resources served bytes identical to the files in the package.
- All nine compiled JavaScript/CSS resources referenced by the home page loaded successfully.
- `app/not-found.tsx` is a Next.js compatibility wrapper that reuses the existing designed 404 UI at Next.js's reserved `/404` route. Original page implementation files were not changed.
- The final ZIP was checked for archive integrity, required files and original-source hash parity.

The current exported visualization uses a client-side route dispatcher. Unknown catch-all routes render its recovery screen with HTTP 200, and the streamed Next.js not-found response can also return 200. A later production SEO implementation can change status handling without redesigning the page.

This export check establishes source/resource identity, a clean dependency installation, compilation and direct-route delivery. It does not claim pixel-identical font rasterization across different browsers, operating systems, screen sizes or carousel states. The earlier visualization's interaction and responsive-layout checks are described in DESIGN_GUIDE.md.
