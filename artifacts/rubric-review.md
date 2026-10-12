# Competition readiness: evidence, gaps, and demo priorities

## Scope and confidence

Reviewed `../Problem_Statement.pdf`, README, SUBMISSION, DEMO, shared engine, server workspace validation, recorded evaluation, and the frozen demo snapshot. This is a source/evidence audit plus local automated regression run, not a fresh deployed-site, visual, accessibility, or load audit. Changes owned here are only this document, `demo-narrative.md`, and `tests/readiness-engine.test.mjs`.

The supplied rubric is problem understanding 15%, functionality/UX 25%, UI/UX 20%, innovation 15%, technical implementation 15%, demonstration 10%. These weights come from the task brief; the PDF itself specifies requirements but does not list weights. No score or placement is guaranteed.

## Rubric audit

| Criterion | Evidence available now | Risk / highest-impact action |
| --- | --- | --- |
| Problem understanding — 15% | Decision chain connects source text, sentiment, recurring issue, priority, owner and report. All 7,000 rows reconcile to 320 distinct texts. No invented dates. | Lead with one business decision, not a feature inventory. Repeated text is not evidence of 7,000 independent customers; normalization can also merge genuinely different identical submissions. |
| Functionality/UX — 25% | Engine covers submission/import preparation, CSV parsing, filtering summaries, themes, policy scores and export. Server rejects source-ID collisions and unsupported annotation evidence. Frozen snapshot validates all 7,000 source annotations. Existing tests cover provider workflow, public-demo write blocking and stale saves. | Rehearse import → inspect → track → export in the actual UI. Public edits are browser-local, not shared cloud writes. Dated import chart must be demonstrated with clearly labelled demo data if used. Final local full-suite rerun is green; still rehearse the actual browser journey before submission. |
| UI/UX — 20% | README describes responsive layout, native dialogs and keyboard operation; existing browser artifacts are present. | Presence of artifacts is not a new visual pass. Check today's exact build at desktop and phone widths, loading/error/empty states, focus return and report legibility. Do not trade working dashboard clarity for landing-page polish. |
| Innovation — 15% | Duplicate-aware counts; quote-constrained annotations; inspectable provider lineage; explicit disagreement and human override. These make AI output accountable rather than merely decorative. | Explain how Adaption changes the baseline and show the disagreement. Five themes and recommendations are product rules, not discovered root causes or generative strategic reasoning. |
| Technical — 15% | Shared parser/engine, server-only provider flow, explicit credit confirmation, recovery from timed-out launch, R2 snapshots and D1 revision protection. New behavioral tests exercise real exports and JSON imports. | Quote validation proves grounding, not semantic correctness. Client import provenance is sanitized, but server `method` / provider metadata strings alone are not cryptographic proof of a provider run. Production readiness/security review is broader than these tests. |
| Demonstration — 10% | Completed recorded Adaption run and portable outputs avoid relying on a new billable call during judging. Evidence-to-action route fits three minutes. | Rehearse an actual download and show its contents. Do not promise live AI in the public demo. Reserve time for the limitation and the next action, not infrastructure slides. |

## Core requirement mapping

- **Feedback management:** supplied source data plus manual/CSV ingest; CSV parsing and import identity safety are tested. Verify UI ingest in rehearsal.
- **AI analysis and Adaption:** frozen completed run contains 320 accepted distinct-text results and zero rejected results. Provider dataset `fd968ec1-0a74-469a-9e45-8e2ad233557c`; provider run `dataset-fd968ec1-0a74-469a-9e45-8e2ad233557c-1791716066415`. Original repeated rows receive the corresponding text annotation, rather than 7,000 separate model judgments.
- **Dashboard/trends:** real-date-only volume aggregation, chronological latest 14 observed dates, raw/distinct-per-day counting. The source dataset is undated; there is no justified historical-growth claim. Observed days are not a gap-filled continuous time series.
- **Recommendations:** five rule-defined themes; score is rounded `60 × severity/5 + 40 × issue evidence count / selected entry count`. Severity is a chosen policy weight; ranking is not estimated revenue loss or causal certainty. Show the denominator and a matching quote.
- **Reports/tracking:** owner and status records plus CSV/Markdown/printable export. Public-demo edits remain local. Private storage and concurrency behavior are represented by implementation and tests, not newly verified deployment in this audit.
- **Submission:** PDF requires a live deployment, source repository, short demo and Adaption explanation, individual work within the official window, permitted-library licensing and no misrepresentation. Existing submission lists a URL, but this audit did not access it. Confirm submission channel, actual deadline, source access, recording and authorship explanation yourself.

## Evidence that must not become an inflated claim

`artifacts/evaluation.json` records agreement of 35/36 for Adaption versus 30/36 for the rule baseline on a deliberately selected assistant-labelled judgment sample. This is **not** independent human evaluation, a random held-out sample, or full-dataset accuracy. The ambiguous minimalist-design review remains visible as a disagreement. Zero rejected outputs refers to format/source-ID/quote validation, not zero incorrect labels. Four credits is a recorded estimate, not an independently reconciled account charge. Dataset labels are supplied context, not verified causes. Customer identities, ratings and revenue were not supplied.

Landing-page URLs/metadata, fallback 404, privacy/terms, consent analytics, favicon/OG, thank-you and mobile CTA are concurrent work outside this audit. Do not describe them as delivered until their exact build is read back and exercised. Team collaboration, learned topic discovery and independent model evaluation are not completed product features.

## Regression verification

- `node --test tests/readiness-engine.test.mjs`: **10 passed, 0 failed**.
- Final `npm test` rerun: **35 passed, 0 failed, 35 total** after concurrent analytics-owner changes.
- An earlier `npm test` run had **31 passed, 3 failed, 34 total**. All three failures were in `tests/analytics.test.mjs`, at test declarations on lines 47, 55 and 60: browser consent initialization, DNT/GPC/privacy-off behavior, and allowlisted payload/transport behavior. Each stopped in its browser harness at line 42 with `TypeError: Cannot set property navigator of #<Object> which has only a getter`. The final rerun passes those tests and one additional analytics test. No out-of-scope fix was made by this audit.
- Initial new-test run had one overly strict snapshot assertion: validation intentionally normalizes omitted issue `updated_at` to null. The test was corrected to assert that normalization while preserving annotations and lineage exactly. It is not a remaining application failure.
- New coverage: leap/calendar validation; malformed/missing dates; per-day distinct counting; chronological window; undated source; whitespace-prefixed CSV formula safety and quoted roundtrip; spoofed import ID/source/method removal; namespace separation; original-source collision rejection; unknown/duplicate/fabricated annotation rejection; acceptance of the real frozen source snapshot.

## Deadline priorities

1. Preserve the final green test run and rerun after any remaining edits; do not publish a stale test count.
2. Rehearse the frozen public demo on the actual deployed URL without authentication. Confirm import, local correction, tracking and report download; separately verify that writes and paid runs remain blocked.
3. Record one complete evidence-to-action story using `demo-narrative.md`. Keep the exact run IDs and ambiguity example handy for questions.
4. Verify source access, license obligations and submission logistics. Explain what you personally designed, what AI assisted with and how you validated it.
5. Only then polish secondary production-checklist presentation. No new paid run or speculative feature is needed to substantiate the current story.
