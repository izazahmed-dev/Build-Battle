# InsightFlow

A working, responsive website design for the Build Battle 2026 customer-feedback brief. It includes the complete supplied dataset, an interactive decision workspace, and a production architecture.

## Run

Requires Node.js. No package installation or build step is necessary.

```sh
npm start
```

Open http://127.0.0.1:4173. Run meaningful data and parser checks with `npm test`.

## Implemented

- All 7,000 source rows, with 320 distinct review texts.
- Feedback search, category and sentiment filters, pagination and distinct-text counting.
- Clearly labelled rule-based sentiment and complaint grouping.
- Policy-based priorities with original evidence and an explanation of the calculation.
- Manual submission and validated CSV import. Optional real dates enable a volume chart.
- Issue ownership and status tracking, persisted in browser storage.
- CSV and Markdown exports; printable reports.
- Adaption input export and validated structured-analysis import.
- Responsive layouts, native accessible dialogs, focus states and keyboard operation.
- Architecture and delivery plan in the website and in `dist/ARCHITECTURE.md`.

## Honest boundaries

This is a browser prototype. It has no application server, account system, shared database, automated Adaption calls or completed provider run. Imported provider results are identified as user-supplied analysis. Do not submit it as a completed AI integration until a real Adaption run has been executed, reviewed and demonstrated. Local storage is not multi-user persistence. The supplied data has no dates, ratings, customer IDs or financial values; none are invented.

## Source layout

- `dist/index.html`, `style.css`, `app.mjs`: website and interaction design.
- `dist/engine.mjs`: shared parsing, aggregation and analysis rules.
- `dist/data.json`: all source CSV records, unchanged review and category values.
- `dist/ARCHITECTURE.md`: product, system, data and design blueprint.
- `tests/engine.test.mjs`: data reconciliation and edge-case tests.
- `server.mjs`: local static preview only.

The design uses original CSS and inline SVG. DM Sans and Manrope are loaded from Google Fonts; system fallbacks work without them. No runtime JavaScript packages are required.
