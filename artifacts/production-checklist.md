# Production checklist — verified local release

## Scope

The user's list contains 19 named items. Items 1–18 are implemented and exercised locally; item 19 (a real contact address) is intentionally omitted at the user's instruction, not replaced with a fictitious address. This is a competition prototype, not a claim of commercial legal readiness.

## Checklist

| Item | Implementation / evidence |
|---|---|
| 1. Custom 404 | Catch-all route returns branded content with HTTP 404, recovery links, and noindex. Browser checks verify the status. |
| 2. Above-fold CTA | Walkthrough, report export and import actions. Verified within the viewport on desktop and phone. |
| 3. Per-page title | Unique titles rendered in initial HTTP HTML for all nine real page paths, also updated on client navigation/back. |
| 4. Per-page description | Unique descriptions rendered by the server and updated during navigation. |
| 5. Open Graph image | Original 1200×630 PNG, absolute OG/Twitter URLs, dimensions and alt metadata. |
| 6. Favicon set | SVG, 16/32px PNG, ICO 16/32/48px, Apple 180px, Android 192/512px and manifest. |
| 7. robots.txt | Real HTTP endpoint. Public demo disallows APIs/tool routes; private deployment disallows all indexing. |
| 8. sitemap.xml | Real XML endpoint. Only indexable public pages are listed when PUBLIC_DEMO=true; private deployments intentionally publish no URLs. |
| 9. Image alt | All rendered images tested for alt attributes; decorative logo uses empty alt next to accessible brand text. OG/Twitter image alt provided. |
| 10. Mobile breakpoints | Existing responsive layout retained and tested down to 320px, without whole-page overflow. |
| 11. Sticky mobile CTA | Bottom import action with safe-area spacing and reserved content space; verified on 390/320px screens. |
| 12. Loading states | Readable server loading shell, reduced-motion skeleton, workspace connection state and file-validation status. |
| 13. Form errors | Inline feedback errors, invalid field/focus handling, CSV/schema errors and exact-quote review errors. Exercised in Chromium. |
| 14. Thank-you page | /thank-you confirms actual browser-local feedback, survives reload and never claims an email was sent or server save was acknowledged. Direct visits show no submission to confirm. |
| 15. Privacy policy | /privacy describes actual local storage, private processing, provider use, optional analytics, retention limits and missing operator/deletion controls. Server-readable without JavaScript. |
| 16. Terms | /terms explains permitted use, AI limitations, credits and prototype boundaries without inventing a legal entity. |
| 17. Cookie/storage choices | Essential storage by default; equally prominent accept/reject controls; footer reopening and withdrawal; DNT/GPC enforcement. No unnecessary third-party cookie script. |
| 18. Analytics | Working first-party /api/analytics ingestion with allowlisted three-field payloads and aggregate D1 counters. Browser opt-in returned HTTP 204; database rows were read back. No collection before consent or after rejection/withdrawal. |
| 19. Real contact | Omitted on request. Verified operator contact is still required before a general public-service launch. |

## Actual verification

- `npm test`: 53 tests passed, no failures (including decision-brief reproducibility/escaping, and review-policy lineage, import protection and server validation).
- `scripts/journey-check.mjs`: decision-journey suite at 1440/390/320 — original source unchanged through review, provider dataset/run lineage retained as preceding analysis, review survives reload, manual analysis import cannot overwrite reviewed labels, AI-disagreement card links to source review and back, owner/status persist across reload, real brief download contains the priority calculation and provider lineage; zero modal Axe violations, zero page errors.
- `npm run lint`: passed.
- `npm run build`: production Vinext build completed.
- `scripts/readiness-check.mjs`: 30 page checks on the production Worker at http://127.0.0.1:8787; page-specific HTTP metadata, status codes, Axe checks, forms, thank-you/reload, consent, withdrawal and real downloaded brief tested; zero page errors.
- `scripts/browser-check.mjs`: 30 workspace-view/width combinations across 1440,1024,768,390,320px; no overflow, detected WCAG A/AA violations, page errors or failed requests.
- Design review limitation, stated honestly: this provider exposes no image-analysis endpoint, so no human/VLM screenshot review was possible. The visual pass was DOM-geometry (no horizontal clipping; tap targets ≥44px on visible controls; one line-height adjustment so 29px Manrope glyph boxes fit their line boxes) plus Axe WCAG A/AA. The priority/review screenshots at all three widths are in `artifacts/journey/` for later human review.
- Analytics counters were read back from the local SQLite-backed D1 database. They are QA traffic, not customer usage statistics.
- Original demo workspace wire JSON reduced from 2,087,668 to 164,571 bytes. Lossless decode preserves all 7,000 occurrence IDs, quotes and provider lineage; covered by a regression test.

## Run the optional browser suites

Install QA tooling outside the application dependency tree, then run with its absolute package root:

    npm install --prefix /your/qa-directory playwright @axe-core/playwright
    node /your/qa-directory/node_modules/playwright/cli.js install chromium
    QA_PACKAGE_ROOT=/your/qa-directory node scripts/browser-check.mjs
    QA_PACKAGE_ROOT=/your/qa-directory QA_BASE_URL=http://127.0.0.1:8787 node scripts/readiness-check.mjs

Keep the matching local server running. Node/Python are required for the full regression suite; the analytics tests exercise real SQLite using Python's standard library.

## Release boundaries

- These latest changes have NOT been deployed to the existing hosted Site.
- Legal pages are accurate prototype notices, not counsel-approved commercial terms.
- Analytics maintains a rolling 30-day window by pruning on accepted writes. Strict cleanup during idle/disabled periods requires a scheduled infrastructure task, not yet configured.
- Anonymous aggregate counters have no visitor identity; they are not unique-user counts and are not independently authenticated against bots.
- Private workspace deletion/retention UI and multi-user authorization remain unimplemented.
- No new provider run, paid API use or fabricated evidence was introduced.
- See `demo-narrative.md` for an honest three-minute presentation and judge Q&A.
