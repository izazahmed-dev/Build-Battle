# Build Battle — evidence-led finishing roadmap

## Competition boundary

The entrant supplied the organizer announcement on 12 October 2026. It states a challenge start of 11 October, 10:00 AM IST and a duration of 48 hours. The resulting cutoff is **13 October 2026, 10:00 AM IST**. No extension is assumed. This is calculated from the supplied announcement, not a separately published submission timestamp. The actual submission form/channel is still unverified.

Official listing inspected in a browser: https://unstop.com/hackathons/build-battle-frontend-arena-1755980 . Its expanded description confirms individual participation, permitted AI assistance, the rubric below and the requirement that the entrant can explain their own solution. Its registration deadline is not the submission cutoff. A similarly named September KonfHub listing is not used as the deadline for this October event.

The supplied Problem_Statement.pdf requires a live application, source code repository, short demo, and brief Adaption explanation. A ZIP is a useful backup, not a verified substitute for the repository. No Git remote was configured when this pass began. Two existing ZIPs were discovered despite the earlier handoff; neither is assumed complete or current. The user authorized a NEW timestamped ZIP without overwriting either.

## Ranked work and tradeoffs

1. **Protect human review and keep its preceding analysis inspectable.** Functionality/UX 25%, technical implementation 15%, innovation 15%. Evidence: feedbackDetail previously removed provider IDs on correction; manual analysis import did not check reviewed labels. Add a bounded preceding-analysis record, server validation, immutable-source tests and protection against manual reapplication. Do not build a speculative full audit/event-sourcing system.
2. **Connect the decision journey.** Functionality/UX 25%, UI/UX 20%, presentation 10%. Evidence: issue quotes and the evaluation disagreement had no direct action to inspect/correct the source. Add source actions with a route back, complete evidence disclosure, and the actual score denominator. Keep the existing ivory/forest/orange design and vanilla modules. Do not add a chatbot or migrate the runtime.
3. **Make exported decisions reproducible.** Problem understanding 15%, technical implementation 15%, presentation 10%. Evidence: Markdown briefs had aggregate method names but omitted exact provider run/dataset IDs and numeric score components. Include those, explicit source excerpts, ownership/status, counting mode, human-review separation and limitations. Escape untrusted Markdown/HTML.
4. **Verify the exact release.** Repeat unit tests, lint, production build, isolated preview asset checks, full existing browser/Axe suites and a new correction/import/export end-to-end journey. Visually inspect desktop, 390px and 320px. Preserve .preview snapshot isolation and .wrangler/state. A 200 HTML response is not asset health.
5. **Package, rehearse, then ship only with permission.** Produce a clean source archive, inspect exclusions and integrity, exercise documented clean build. Rehearse one three-minute decision narrative. Obtain deployment/audience authorization and the actual repository/submission target; do not silently publish.

## Parallel ownership

- Parent: integration, web/app.mjs, web/style.css, decision-brief module/tests, browser journey checks, roadmap/release notes, archive and final verification.
- Review policy worker: web/review-policy.mjs, tests/review-policy.test.mjs, server/workspace.mjs only.
- Journey auditor: artifacts/decision-journey-review.md only; read-only application audit.
- Harness worker: at most two justified default-profile skill installs plus artifacts/harness-improvements.md. No runtime/config rewrite or application ownership.
- Capacity worker: artifacts/provider-capacity.md and read-only credential-safe provider/quota probes. No global model/config changes.

The configured delegation model openai-codex/gpt-6.1-sol-900k returned MODEL_OK in a live probe. Catalog entries alone do not establish other models work. External model names and quota claims must come from actual probes; no retired Llama model is used.

## Non-negotiable data claims

7,000 source rows / 320 distinct texts, not distinct customers. Supplied reviews contain no dates, ratings, identities or revenue. Adaption's 35/36 vs baseline 30/36 is agreement on a selected assistant-labelled sample, not independent accuracy. Five themes, severity weights and action templates are deterministic product rules. A valid exact quote does not prove the sentiment or the allegation. Public visitor edits remain local; private server writes and paid analysis remain blocked in judge mode. No new Adaption spending is needed.

## Completion gate

This roadmap is not a completion claim. See the subsequent finishing report and machine-readable test/browser artifacts for what actually passed. Remaining external gates: permission to deploy, repository destination/access, final video recording, submission form and entrant review/understanding.
