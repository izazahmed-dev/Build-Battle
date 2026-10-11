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
- Conflict-safe saves using a D1 revision and immutable R2 snapshots.
- A frozen judge preview sourced only from the supplied competition dataset and verified analysis; no private imports. Paid analysis and server writes are blocked in public demo mode.
- CSV and Markdown exports; printable reports.
- Server-side Adaption connection, JSONL upload, credit estimates, run submission, progress polling, result validation and application to source feedback.
- Durable analysis batches and provider dataset/run provenance in R2.
- Adaption input export and manual structured-analysis import as an alternative.
- Responsive layouts, native accessible dialogs, focus states and keyboard operation.
- Architecture and delivery plan in the website and in `dist/ARCHITECTURE.md`.

## Honest boundaries

The public judge demo shows a verified saved Adaption batch and keeps visitor changes in their browser. Take the guided walkthrough from Overview, inspect before/after labels in analysis quality, and export a brief with owners and tracked status. In private mode, the studio supports live provider analysis and workspace changes save to the server; conflicting updates are rejected and remain available for export. Manually imported files remain identified as user-supplied analysis. Team collaboration is proposed architecture. The supplied data has no dates, ratings, customer IDs or financial values; none are invented.

Set `ADAPTION_API_KEY` through Sites runtime secrets. Never commit the key or expose it in public assets. The `.env.example` documents only its name. R2 uses `BUCKET` and D1 uses `DB`; schema migrations are in `drizzle/`. `Prepare analysis` uploads source feedback, explicitly starts preprocessing, and requests an estimate; `Start analysis` consumes the displayed provider credits. A timed-out launch is reconciled against existing provider status, without automatically charging for another submission.

## Source layout

The completed full Adaption run processed all 320 distinct texts with zero validation failures. See `SUBMISSION.md`, `artifacts/adaption-full.json`, and `artifacts/evaluation.json` for the exact provider IDs and measured sample limits. The studio includes a quality-review panel. `DEMO.md` contains the demonstration narrative.

`?demo=1#overview` previews the frozen judge workspace while the Site remains private. For an intentionally public demo, set `PUBLIC_DEMO=true` and explicitly choose public Site access. This mode serves only the frozen competition snapshot, blocks server mutations and paid provider calls, and keeps visitor edits local. It never reads private workspace imports. Switching the flag off restores the preserved private backend; do not do so while the Site remains public.

- `web/index.html`, `style.css`, `app.mjs`: website source and interaction design.
- `web/engine.mjs`: shared parsing, aggregation and analysis rules.
- `web/data.json`: all source CSV records, unchanged review and category values.
- `web/adaption-client.mjs`: live analysis studio controls.
- `web/ARCHITECTURE.md`: product, system, data and design blueprint.
- `server/adaption.mjs`: server-only provider adapter and durable batch workflow.
- `app/api/adaption/[...path]/route.ts`: hosted API routes.
- `tests/engine.test.mjs`: data reconciliation and edge-case tests.
- `tests/adaption.test.mjs`: provider workflow, validation, cost confirmation and secret-redaction checks.

The design uses original CSS and inline SVG. DM Sans and Manrope are loaded from Google Fonts; system fallbacks work without them. Vinext and the Sites starter own the server build and hosted authentication integration.
