# Functional hardening pass

## Product changes

- Demo snapshot is now authoritative: stale browser-local demo state can no longer hide the verified `320 / 320` Adaption analysis or the tracked trust issue.
- Browser QA now asserts the judge-critical content, not only layout: `320 / 320`, `texts with Adaption analysis`, and `1,429 rows match seller trust` must appear before the audit proceeds.
- Workspace validation now rejects imported IDs that collide with source rows, duplicated analysis annotations, unknown analysis IDs, and evidence that is not an exact source quote.
- CSV export neutralizes spreadsheet formulas even when attackers prefix whitespace before `=`, `+`, `@`, or `-`.
- Date trend rendering uses only valid observed `occurred_at` dates and keeps the no-date callout for the supplied dataset.
- Import handling now uses a generated `IMP-*` prefix consistently, avoiding source-ID collisions.
- Accessibility and interaction polish: keyboard focus restore for modals, drawer focus trap, scrollable table regions, keyboard-safe search debounce, and chart/filter buttons with pressed state.
- Static fonts are self-hosted with license files and copied into `public/fonts` during asset prep.

## Verification run

- `node --check web/workspace-client.mjs`
- `npm test` — 18/18 passing.
- `npm run lint` — passing.
- `QA_PACKAGE_ROOT=/home/linux/.hermes/cache/scratch/build-battle-qa node scripts/browser-check.mjs` — 30 responsive Axe/browser checks, 0 failures, 0 page errors, 0 request failures.
- `npm run build` — Vinext production build complete.
- Local production smoke on `http://127.0.0.1:8787`:
  - `GET /?demo=1` -> 200
  - `GET /api/demo/workspace` -> 200 with verified enriched snapshot
  - `GET /api/demo/adaption/connection` -> 200 demo provider status
  - `POST /api/demo/workspace` -> 403 write blocked

## Evidence artifacts

- `artifacts/browser/audit.json`
- `artifacts/browser/overview-1440.png`
- `artifacts/browser/overview-390.png`
- `artifacts/browser/feedback-1440.png`
- `artifacts/browser/feedback-390.png`
- `artifacts/browser/issues-1440.png`
- `artifacts/browser/issues-390.png`
- `artifacts/browser/lab-1440.png`
- `artifacts/browser/lab-390.png`
- `artifacts/web-skills-audit.md`
- `artifacts/web-skills-manifest.json`
