# Honest three-minute demo

## Before recording

Use the frozen judge demo, beginning at Overview. Open its completed Adaption run before starting; have the export destination ready. Do not launch a new run or expose private data. Rehearse the exact UI labels on the current build: this narrative is not evidence that every click was browser-tested today. Close unrelated tabs and keep provider credentials off screen. Use one complaint throughout so the audience sees a decision, not a tour.

## 0:00–0:25 — The decision and its denominator

**Show:** Overview; switch raw rows to distinct texts.

**Say:** “What should a team fix next—and can it explain why? InsightFlow starts with the supplied 7,000 feedback rows. Those rows contain only 320 distinct texts. I show both denominators, because repeated wording must not masquerade as independent customers.”

## 0:25–0:55 — One inspectable priority

**Show:** Seller trust and payment safety; open evidence and the priority explanation.

**Say:** “Here is a priority worth investigating: seller trust and payment safety. The score combines a declared severity policy with frequency in the selected counting mode. Here is the original quote. This is a reported allegation, not proof of fraud. The suggested action is to verify transactions and give customers a dispute route.”

## 0:55–1:30 — What Adaption actually contributed

**Show:** Adaption studio's recorded completed batch; accepted/rejected counts; provider IDs; result inspection.

**Say:** “The initial sentiment labels are a transparent rule-based preview. Adaption improved structured baseline completions using the original review as context. This recorded run processed all 320 distinct texts; 320 outputs passed source-ID and exact-quote checks, and none were rejected. The annotations are then applied back to matching source rows. This is a real saved result, not a simulated live response. The public demo cannot start a paid run.”

## 1:30–2:00 — Admit uncertainty, preserve control

**Show:** Quality panel disagreement for “The product's design is minimalist and understated.” If available within the time, open its source/evidence and human-review controls; do not silently alter the reference.

**Say:** “A quote can be valid while a judgment remains debatable. On 36 assistant-labelled examples, Adaption agreed on 35 and the baseline on 30. This is not independent accuracy. Here the provider calls minimalist design positive; the reference calls it unclear. I expose that disagreement so a person can inspect the original and record a correction.”

## 2:00–2:35 — Turn the insight into an artifact

**Show:** Track the seller-trust issue; owner Trust & Safety; keep status Planned. Export a decision brief and open the actual downloaded Markdown/report, showing evidence and next action.

**Say:** “I assign the investigation to Trust & Safety and leave it Planned—we have not fixed anything yet. This export carries the evidence, owner and proposed action out of the dashboard. Visitor edits stay in this browser. Private mode has server snapshots and stale-save protection, but the public demo does not write to that workspace.”

## 2:35–3:00 — Boundaries and close

**Show:** Return to the next action or Overview's date coverage, not a long architecture detour.

**Say:** “The supplied file has no dates, customer identities or revenue, so I do not invent growth or financial impact. Genuine dated imports enable a volume chart; themes and priority weights remain explicit product rules. The outcome is an accountable next decision: investigate this issue, with this evidence, and this owner.”

## Optional proof, outside the timed narrative

- Import a visibly labelled rehearsal CSV with `review,category,occurred_at` and a valid date. Explain that these are demonstration inputs, not competition history. Compare per-day raw and distinct counts. Show invalid-date rejection if asked.
- Demonstrate CSV export of a formula-like review: whitespace followed by `=`, `+`, `-` or `@` is escaped rather than treated as a spreadsheet formula. Do not claim this is a comprehensive spreadsheet-security audit.
- Explain that imported IDs/source/method claims are ignored by `prepareImport`; fresh import namespaces prevent collision with original feedback. Server validation rejects known source IDs in imports and unknown, duplicate or unsupported-quote annotations.
- Keep the recorded provider run handy: `dataset-fd968ec1-0a74-469a-9e45-8e2ad233557c-1791716066415`. The displayed four credits is an estimate, not a verified account ledger.

## Short answers for judges

**“What is AI-generated versus deterministic?”** Sentiment refinement and supporting quotes come from the recorded Adaption run; initial preview labels, five complaint themes, severity policy, scoring and action templates are deterministic. Do not claim learned clustering or AI-discovered root causes.

**“Why Adaption rather than a decorative chatbot?”** It operates on structured feedback completions, retains original context, produces inspectable output, and is incorporated into labels shown in the decision workspace. Provider IDs and accepted output are preserved. The selected sample suggests better agreement, not proven general accuracy.

**“Why only 320 model results for 7,000 rows?”** Identical normalized review texts are processed once and mapped back to their source occurrences. Counting modes still distinguish raw frequency from distinct wording. This saves repeated processing but is not unique-customer deduplication.

**“Is the AI trustworthy?”** Source-ID and exact-quote validation prevent unsupported evidence from being accepted. They cannot guarantee a correct sentiment or recommendation; the disagreement panel and human-review path are deliberate safeguards.

**“Can I use this with real data?”** Manual and CSV imports are implemented, including genuine dates. In public mode edits are local; private mode supports durable saves. This is not a completed multi-tenant team product, and real customer data would need deployment/access/privacy review.

**“How do trends work without source dates?”** They do not pretend to. Only valid observed dates enter buckets. Distinct text is counted within each day; repeated text on another day counts again. The chart retains the latest 14 observed dates, not a claimed continuous history.

**“What did you personally build?”** Explain the architecture, aggregation rules, safety validation, provider workflow and UX choices you actually understand. State where AI coding assistance was used and show how you tested the output. Do not invent an authorship history or claim sole manual coding.

**“What would you improve next?”** Independent human evaluation, team membership/access controls, broader accessibility testing and configurable theme discovery. Present these as future work, not current functionality.

## Failure fallback

If network access fails, show the locally runnable app and recorded provider artifact with an explicit explanation; do not pretend it is the live deployment. If export fails, say so and show the report preview without claiming a successful download. If an API is unavailable, show the saved result and its provenance, not a fabricated response. The final local suite passed 35/35 after concurrent analytics-owner changes, as documented in `rubric-review.md`; rerun after further changes rather than claiming that historical result verifies a different build.
