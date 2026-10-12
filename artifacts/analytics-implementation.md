# Consent-gated first-party analytics

## Implementation and integration contract

- `web/privacy.mjs` exports `initPrivacyControls()` and async `trackEvent(event, page)`. Initialize once after DOM load; call `trackEvent('page_view', view)` on each render. Consecutive identical page views are suppressed; navigating elsewhere then returning counts again. Actions count when explicitly invoked; events rejected before consent are never queued or replayed.
- Tracking requires all of: initialized controls, persisted `if-privacy-consent=accepted`, no DNT/GPC, and `<meta name="insightflow-analytics" content="true">`. Parent emits that capability only with DB present and analytics not disabled. Missing/blocked preference storage fails closed. No optional network request is made before acceptance.
- Banner is a `region` labelled **Privacy choices**, mounted on `document.body` outside `#app`. Native equally marked buttons accept/reject. Delegated `[data-privacy-settings]` opens it and focuses rejection; rejection also withdraws previous acceptance. Policy links are `/privacy` and `/terms`. Repeated initialization does not duplicate the banner/listeners. Preference storage events synchronize withdrawal across tabs; each event also rereads storage. Withdrawal aborts in-flight requests when possible, but cannot undo an already recorded anonymous counter.
- Essential feedback backups are explicitly described as browser-local essential storage, distinct from optional anonymous counters.
- Request is only same-origin `POST /api/analytics` with JSON `{event,page,consent:true}`, no cookies (`credentials: omit`), no referrer (`referrerPolicy: no-referrer`), no identifiers or query strings. Browser transport failures do not interrupt product actions.
- Allowlisted events: `page_view`, `feedback_added`, `import_completed`, `report_exported`. Allowlisted pages: `overview`, `feedback`, `issues`, `reports`, `lab`, `architecture`, `privacy`, `terms`, `thankyou`, `notfound`.

## Server and data minimization

`server/analytics.mjs` exports `handleAnalytics(request, env)`. `app/api/analytics/route.ts` delegates supported HTTP entrypoints; only POST can write, and no metrics-read endpoint exists.

POST requires same-origin Origin or same-origin fetch metadata; conflicting or cross-site metadata is rejected. DNT/GPC also deny server ingestion. Only JSON is accepted. Streaming body size is capped at **1,024 bytes**, independently of Content-Length. Unknown fields/events/pages and missing literal boolean consent are rejected before any DB operation.

D1 prepared statements create `analytics_daily` if absent, then atomically prune and UPSERT counters via D1 batch. The entire schema is `(day, event, page, count)` with composite primary key `(day,event,page)`. No IP, feedback text, IDs, referrer, user agent, visitor records, or cookies are read into persisted analytics. UTC day is server-generated. Database errors and unsuccessful result flags yield 503, never success.

Status contract: **204** recorded; **400** invalid JSON/schema/allowlist; **403** origin/consent/privacy denial; **405** non-POST (`Allow: POST`); **413** oversize; **415** wrong content type; **503** disabled/missing DB/persistence failure. Responses are `Cache-Control: no-store` and do not advertise CORS access.

## Executed verification

- Test-first baseline: `node --test tests/analytics.test.mjs` failed because the implementation module did not exist.
- Final focused run: **7 tests passed, 0 failed**.
- `npm test`: **35 tests passed, 0 failed** after analytics additions.
- `node_modules/.bin/tsc --noEmit --incremental false`: passed.
- `node_modules/.bin/eslint server/analytics.mjs web/privacy.mjs app/api/analytics/route.ts tests/analytics.test.mjs`: passed after fixing a test-only lint issue.
- Tests execute production analytics handler SQL against real in-memory SQLite via Node `node:sqlite`, wrapped with D1-compatible prepared statements and transactional batch. They verify counters, all event/page combinations, the four-column schema, 30-day cutoff, and failure rollback. Client tests execute the actual module in a small mocked browser DOM/storage/fetch harness, checking zero default requests, acceptance/withdrawal, duplicate initialization/renders, DNT/GPC, blocked storage, capability gating, input minimization, and silent transport failure.

## Explicit limitations

- Pruning retains today plus the previous 29 UTC days **on each accepted write**. There is no scheduled cleanup in the allowed file scope, so idle/disabled installations can physically retain old aggregate rows until the next accepted write. Strict wall-clock deletion needs an infrastructure-scheduled cleanup, not claimed here.
- Browser tests mock DOM/storage/fetch; they are not a real-browser accessibility/layout audit. Final assembled page mounting, CSS prominence, route rendering, and local Worker/D1 HTTP smoke verification belong to parent integration. No deployment, paid calls, secrets or config edits were performed.
- Hosting infrastructure necessarily handles network connections; application analytics does not store/log IP or request headers. Infrastructure log retention is outside these modules.
- Explicit consent is asserted by the client, not cryptographically attested. No user identifiers or cookies are introduced to prove it. Origin validation is CSRF defense, not protection from callers forging HTTP headers; abuse mitigation is infrastructure work.
- Repository-wide `git diff --check` reported existing/unowned CRLF/trailing whitespace in `SUBMISSION.md`, `next-env.d.ts`, and `scripts/service-check.mjs`; those files were not changed by this task.

## Owned files

Only `server/analytics.mjs`, `web/privacy.mjs`, `app/api/analytics/route.ts`, `tests/analytics.test.mjs`, and this report were created by this task.
