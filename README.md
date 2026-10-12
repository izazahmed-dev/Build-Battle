# InsightFlow

A working, responsive website design for the Build Battle 2026 customer-feedback brief. It includes the complete supplied dataset, an interactive decision workspace, and a production architecture.

## Run

Requires Node.js >=22.13 and the locked dependencies. Use `npm run install:ci`, then `npm run dev` for a local preview. Use `npm run build` for the hosted server artifact.

```sh
npm run dev
```

Open the printed local URL (normally http://127.0.0.1:5173). Run data, parser, provider-workflow and security checks with `npm test`.

## Implemented

- All 7,000 source rows, with 320 distinct review texts.
- Feedback search, category and sentiment filters, pagination and distinct-text counting.
- Clearly labelled rule-based sentiment and complaint grouping.
- Policy-based priorities with original evidence and an explanation of the calculation.
- Manual submission and validated CSV import. Optional real dates enable a volume chart.
- Issue ownership and status tracking with durable private workspace saving and a browser backup.
- Exact-quote human review, source inspection and provider run provenance for individual feedback.
- Decision-chain continuity: issue evidence and AI disagreements link straight to source review and back; human corrections retain the preceding provider annotation as inspectable history; tracked decisions stay in exported briefs even when filters exclude their evidence; exports show the numeric priority calculation and provider dataset/run lineage.
- Conflict-safe saves using a D1 revision and immutable R2 snapshots.
- A frozen judge preview sourced only from the supplied competition dataset and verified analysis; no private imports. Paid analysis and server writes are blocked in public demo mode.
- CSV and Markdown exports; printable reports.
- Server-side Adaption connection, JSONL upload, credit estimates, run submission, progress polling, result validation and application to source feedback.
- Durable analysis batches and provider dataset/run provenance in R2.
- Adaption input export and manual structured-analysis import as an alternative.
- Responsive layouts, native accessible dialogs, focus states and keyboard operation.
- Architecture and delivery plan in the website and in `public/ARCHITECTURE.md` (copied into the production assets).

## Honest boundaries

The public judge demo shows a verified saved Adaption batch and keeps visitor changes in their browser. Take the guided walkthrough from Overview, inspect before/after labels in analysis quality, and export a brief with owners and tracked status. In private mode, the studio supports live provider analysis and workspace changes save to the server; conflicting updates are rejected and remain available for export. Manually imported files remain identified as user-supplied analysis. Team collaboration is proposed architecture. The supplied data has no dates, ratings, customer IDs or financial values; none are invented.

Set `ADAPTION_API_KEY` through Sites runtime secrets. Never commit the key or expose it in public assets. The `.env.example` documents only its name. R2 uses `BUCKET` and D1 uses `DB`; schema migrations are in `drizzle/`. `Prepare analysis` uploads source feedback, explicitly starts preprocessing, and requests an estimate; `Start analysis` consumes the displayed provider credits. A timed-out launch is reconciled against existing provider status, without automatically charging for another submission.

## Source layout

The completed full Adaption run processed all 320 distinct texts with zero validation failures. See `SUBMISSION.md`, `artifacts/adaption-full.json`, and `artifacts/evaluation.json` for the exact provider IDs and measured sample limits. The studio includes a quality-review panel. `DEMO.md` contains the demonstration narrative.

`/?demo=1` previews the frozen judge workspace while the Site remains private. For an intentionally public demo, set `PUBLIC_DEMO=true` and explicitly choose public Site access. This mode serves only the frozen competition snapshot, blocks private workspace mutations and paid provider calls; optional consented analytics writes separate aggregate counters, and keeps visitor edits local. It never reads private workspace imports. Switching the flag off restores the preserved private backend; do not do so while the Site remains public.

- `web/index.html`, `style.css`, `app.mjs`: website source and interaction design.
- `web/engine.mjs`: shared parsing, aggregation and analysis rules.
- `web/data.json`: all source CSV records, unchanged review and category values.
- `web/adaption-client.mjs`: live analysis studio controls.
- `web/ARCHITECTURE.md`: product, system, data and design blueprint.
- `server/adaption.mjs`: server-only provider adapter and durable batch workflow.
- `app/api/adaption/[...path]/route.ts`: hosted API routes.
- `tests/engine.test.mjs`: data reconciliation and edge-case tests.
- `tests/adaption.test.mjs`: provider workflow, validation, cost confirmation and secret-redaction checks.

The design uses original CSS and inline SVG, plus an optional original procedural Three.js evidence lens and GSAP/ScrollTrigger motion. DM Sans and Manrope are self-hosted in `web/fonts` with their license files; no Google Fonts request is made. Vinext and the Sites starter own the server build and hosted authentication integration.

## Optional motion layer

`web/motion-loader.mjs` lazy-loads a locally bundled GSAP entry after idle. `web/motion-entry.mjs` uses native scrolling with small heading/panel reveals, then conditionally imports the Three.js scene only on a visible Overview at >=1000px. `web/evidence-lens.mjs` builds original procedural geometry, caps device pixel ratio at 1.5 and schedules rendering at roughly 30fps; actual device FPS has not been certified. Rendering pauses offscreen/in hidden tabs, and its Pause motion control is keyboard-operable. Route refresh/navigation disposes geometries, materials, renderer, observers and GSAP triggers. Context loss falls back to the existing SVG. This artwork is decorative and does not encode data or model confidence.

Reduced-motion and Save-Data modes download no motion code. Mobile downloads no Three.js chunk. There is no Lenis/scroll-jacking, Rive dependency, Webflow migration, external asset CDN or copied reference-site model. The esbuild output is split into `public/motion` and copied by the existing Vinext build. Proprietary GSAP notices remain in the bundle; `web/assets/MOTION-NOTICES.txt` and `THREE-LICENSE.txt` cover dependency attribution. Do not call GSAP MIT.

Run `QA_PACKAGE_ROOT=/path/to/isolated-qa node scripts/motion-check.mjs` against the production preview. Evidence is in `artifacts/motion/audit.json` and desktop/mobile screenshots. The WebGL check uses Chromium software rendering: it is not real-device FPS evidence. `artifacts/figma-art-direction.md` contains the manual design handoff.

## Production checklist and verification

Real routes: `/`, `/feedback`, `/issues`, `/reports`, `/studio`, `/architecture`, `/privacy`, `/terms`, and `/thank-you`. Legacy hash links still work. Every page has server-rendered title/description, canonical/OG/Twitter metadata; unknown paths return a real HTTP 404. The public/indexable routes appear in `sitemap.xml` only when `PUBLIC_DEMO=true`; private workspaces remain unindexed.

The favicon/OG set lives in `web/assets`. Privacy controls keep optional first-party analytics off until consent, with rejection, withdrawal and DNT/GPC support. `/api/analytics` stores only daily event/page counters in D1; set `ANALYTICS_ENABLED=false` to disable it. Pruning on accepted writes maintains a 30-day window; idle-period cleanup is not yet scheduled. No third-party analytics script is installed. Contact information is intentionally omitted on request; operator identification and deletion controls are prerequisites for a general public-service launch.

Run `npm test`, `npm run lint`, and `npm run build`. The final local suite has 53 tests; browser evidence and exact commands are in `artifacts/production-checklist.md`, `artifacts/readiness/audit.json`, and `artifacts/browser/audit.json`. The readiness suite was also run against the built local Worker using `npm run start` at port 8787. Its analytics counters are QA traffic, not customer metrics. `artifacts/demo-narrative.md` contains the timed demo and explanatory judge answers.

The production preview now runs from an isolated `.preview/release-*` snapshot. Rebuilding `dist` while it is running does not change its worker/assets mapping. Stop and restart `npm run start` after a build when you want to display the new version. The readiness suite checks CSS, JavaScript, fonts and data HTTP status/MIME before browser flows.

The latest source changes are local only until explicitly deployed. Do not assume the existing hosted Site matches this checkout.
