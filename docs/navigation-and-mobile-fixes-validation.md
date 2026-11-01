# Navigation, mobile layout, and sticky enquiry validation

Date: 1 November 2026. Local preview: http://127.0.0.1:3000.

## Implemented

- A shared route-scroll controller replaces competing numeric listing restoration effects. New searches start at the head; explicit sections target their anchors; Back and Back to results restore saved content anchors where available. Positions saved at the footer recover at the head. The popstate listener captures the outgoing entry before Next's bubble listener replaces its page tree.
- The root HTML declares `data-scroll-behavior="smooth"`, enabling Next.js 16's documented immediate-scroll override during route transitions while retaining smooth in-page scrolling.
- Compact-screen home hero arrangements keep the search and action buttons in the first fold in the measured viewport matrix. Desktop hero rules are unchanged.
- Compact footer places two navigation columns after the introduction, followed by phone/email/social icons and a copyright strip. Phone and email retain their destinations. Instagram and Facebook remain non-link placeholders as requested.
- Compact floor-plan cards separate configuration/status, area/price, and plan actions; desktop retains its table.
- Both footer variants have a soft light logo background (`#e8e7df`).
- The desktop property enquiry uses two-column fields and compact spacing. Its sticky top follows the header, and its maximum height follows the available visual viewport. Very short windows and expanded validation messages can scroll inside the panel. Compact-screen enquiry layout is unchanged.

## Checks completed

- Production build: passed using a separate build directory; temporary generated TypeScript paths were removed afterwards.
- TypeScript: passed.
- Navigation/scroll policy and sidebar geometry: 8 tests passed (`npm run test:navigation`). These test the pure policy and size calculations; they do not simulate a real browser Back gesture.
- Enquiry validation: 5 tests passed. Buyer tools: 7 tests passed.
- HTTP source checks: home, filtered properties, and property detail returned HTTP 200 with the expected component markup.
- Earlier live hero measurements: 320×480, 320×568, 360×640, 375×667, 414×896, 430×932, 568×320, 667×375, 844×390, 768×1024, and 1024×768 all placed the search/actions within the viewport without horizontal overflow. Those hero rules have not changed since those measurements.

## Remaining verification

Final live-browser confirmation is blocked: automatic approval review rejected browser use because its credits were exhausted. No alternate browser access was used to bypass that restriction.

The latest capture-phase Back correction, footer logo colour, and compact desktop form still need live verification. In particular, check a deeply scrolled result card → detail → browser Back, footer navigation → Back, repeat searches, section links, form validation/focus, and short desktop windows (including browser zoom). Do not treat the passing policy tests as visual or browser-history verification.

The broader responsive architecture findings remain in `responsive-audit-2026-11-01/README.md`.
