# InsightFlow — product, architecture and website design

Prepared for Build Battle 2026 from all three supplied local files. This blueprint targets the 48-hour, individual-participant brief. It aims for a distinctive, credible demonstration; an award outcome cannot be guaranteed.

## Live integration update

The application now runs through the Sites Vinext server runtime. The Adaption key is a hosted secret named `ADAPTION_API_KEY`; its authentication was verified against the provider. `server/adaption.mjs` implements JSONL dataset upload, asynchronous ingestion checks, credit estimation, idempotent adaptation submission, progress polling, structured-result validation, and application to source feedback. R2 stores batches, source mappings, result validation and provider dataset/run IDs. The browser never receives the provider secret. Analysis starts only after the displayed credit estimate is confirmed. Invalid quotes or unknown source IDs are rejected. Feedback edits and issue tracking still use browser storage; the broader shared-data model below remains the production target.

The website exposes this workflow under Adaption studio. It supports small verification batches and up to 320 distinct texts per batch. A successful connection check alone is not evidence that an analysis run completed; run status and accepted-result counts are shown separately.

## 1. Product thesis

Help a product or customer-experience lead answer: **What should we fix next, and what customer evidence supports that decision?**

The primary journey is: import feedback → inspect a recurring issue → verify original evidence → choose an action → assign ownership → share a decision brief. Each screen supports this journey. The dashboard is an entry point, not the entire product.

The central differentiator is inspectability. A priority must resolve to a formula, a matching feedback set and original review text. Display limitations beside the metric they affect. Make duplicate-aware analysis a first-class control.

## 2. Source audit and design consequences

### Problem_Statement.pdf, both pages

Requires feedback submission and CSV import; searchable, filterable organization; AI sentiment and topics; meaningful Adaption use; analytics and trends; evidence-backed recommendations; issue tracking; export/share; responsive polish. Submission needs a live application, source repository, short demonstration and an explanation of the integration. There is no numeric judging rubric in the supplied brief, so do not invent one.

### BuildBattle_2026_Customer_Feedback_Dataset.csv

The file contains 7,000 records and exactly two columns: `review` and `category`. There are 320 distinct review strings and no empty reviews. The extra 6,680 occurrences represent repeated text, not necessarily verified duplicate customer events. Category counts reconcile to 7,000: Operational Issues 1,800; Fraud and Scam 1,755; Product Feedback 1,738; Customer Service 1,707.

The most repeated exact text occurs 295 times. Several source reviews explicitly deny fraud; others combine an initial problem with successful recovery. This rules out treating category as sentiment or treating the word “fraud” as sufficient evidence of harm.

Missing fields: timestamps, customer identifiers, source channels, product identifiers, ratings, revenue, resolution status and validated sentiment labels. No historical growth, unique-customer count, churn, NPS, CSAT or revenue impact can be computed from this source. Row order is not a time axis.

Preserve every raw row. Cache computation by normalized text, while exposing both raw occurrence counts and distinct-text counts. Distinct strings still do not establish independent customer identities. Never delete repeated rows simply to make results look cleaner.

### Adaption Documents.pdf

Contains links to an Adaption slide deck and the Adaptive Data app walkthrough. The official walkthrough and dataset API references were reviewed. The linked slide deck could not be retrieved by the available web reader, so no claims here depend on its contents.

The documented workflow supports dataset ingestion, column mapping, adaptation and result review. The recommended role is batch enrichment of review context into inspectable structured labels. This design does not assume a generic synchronous chat endpoint exists.

References checked on 11 October 2026:

- [Adaptive Data app walkthrough](https://docs.adaptionlabs.ai/tutorials/adaptive-data-app-walkthrough/)
- [Dataset creation](https://docs.adaptionlabs.ai/api/resources/datasets/methods/create)
- [Adaptation reference](https://docs.adaptionlabs.ai/api/resources/datasets/methods/adapt)
- [Deprecated run alias](https://docs.adaptionlabs.ai/api/resources/datasets/methods/run)
- [Provided slide deck, inaccessible during review](https://docs.google.com/presentation/d/1P9O8HTis0Qu7Kyz4IdXP2n0B9EifTCF4uUNLzhg7FOA/mobilepresent?slide=id.p1)

## 3. Information architecture

1. **Overview:** next recommended investigation, row and distinct-text metrics, sentiment distribution, category distribution, ranked themes and source evidence. Time charts appear only for actual dated records.
2. **Feedback inbox:** search by text or ID, filter by category and sentiment, inspect source text, add feedback, import CSV and export selected records. Paginate rather than rendering 7,000 rows at once.
3. **Issue tracker:** Planned, In progress and Resolved. Each issue includes evidence, owner, next action and status. Resolution records a workflow decision, not proven customer improvement.
4. **Reports:** reproducible scope, headline findings, recommended investigations, source quotes and methodological limits. Download Markdown, export CSV or use browser printing for PDF.
5. **Adaption studio:** data preparation, provider handoff, result validation and transparent analysis provenance. Production adds run progress, failures and human-review queues.
6. **Architecture:** a reviewable explanation of the system, design decisions, delivery order and current implementation boundaries.

Use an evidence dialog rather than forcing a separate page for every source review. Keep the user's filter context intact when opening and closing it. Deep linking in the production version should serialize filters and issue IDs in the URL.

## 4. Visual and interaction design

### Direction

A calm, editorial workspace with warm ivory backgrounds, olive-charcoal navigation and sparing burnt-orange actions. This palette supports long analytical sessions without turning every metric into an alert. Warm orange marks action; red marks negative sentiment; green marks positive sentiment; ochre marks mixed feedback. Status is always also expressed in words.

DM Sans handles interface text, while Manrope gives headings and numerals a distinct identity. Use system fallbacks and self-host the font assets for a hardened production release. A 4/8px spacing scale, consistent borders and restrained radii make dense views orderly. Decorative orbital artwork suggests connections between signals without posing as a quantitative chart.

### Tokens

- Background `#f6f5f1`; panels `#ffffff`; primary text `#252820`.
- Primary action `#ce4928`; dividers `#e6e6de`.
- Positive `#438373`; negative `#cc654e`; mixed `#c09543`.
- Desktop sidebar 236px; content constrained to 1,510px; responsive intermediate and mobile layouts.
- Primary controls at least 39px high in this prototype; use 44px minimum touch targets during production accessibility hardening.

### States and accessibility

Implement loading, empty search results, missing dates, invalid import, no tracked issues, storage failure, unavailable provider and retry states. Every visible control must cause a real action. Use semantic navigation, real buttons, labelled controls, a skip link, visible focus, native modal focus containment and live announcements. Avoid chart-only meaning; pair charts with counts and labels. Respect reduced motion and verify at 200% zoom and narrow widths.

### Why these choices

The first screen asks for a decision, then presents the metrics supporting it. Raw feedback remains nearby. A neutral missing-date explanation is more credible than synthetic trend lines. The all-rows/distinct-text toggle makes a real dataset limitation visible in one click and provides a memorable demonstration moment.

## 5. Target system architecture

Build a **modular monolith plus a durable background worker**. A solo 48-hour build does not need a microservice fleet.

```text
Browser: React + TypeScript
  │ authenticated JSON / file upload
  ▼
Application server
  ├── workspace authorization
  ├── feedback and import module ── object storage: original CSV
  ├── issue and reporting module ─ PostgreSQL: rows, annotations, issues
  └── analysis orchestration ───── durable jobs / outbox
                                    │
                                    ▼
                              Analysis worker
                              deduplicate compute
                              redact where required
                              Adaption provider adapter
                              schema / evidence validation
                              publish versioned results
                                    │
                                    ▼
                              metric read models
```

React/TypeScript is the proposed production frontend. The delivered design uses browser modules and plain CSS to remain executable without dependency setup. The target backend may use TypeScript throughout; a PostgreSQL-backed job queue avoids introducing Redis solely for this size of workload. Object storage retains source uploads. Start with deterministic SQL aggregates and indexed search, adding vector search only if evaluations establish a need.

The current website has a Sites server runtime and durable R2 analysis storage. Browser storage currently persists feedback edits and issue changes. A shared production workspace must replace that storage adapter before claiming collaboration.

## 6. Logical data model

- **workspace:** id, name, created_at.
- **membership:** workspace_id, user_id, role. Unique workspace/user pair. Suggested roles: viewer, analyst, admin.
- **import_batch:** id, workspace_id, source_file_key, source_hash, original_filename, row_count, import_status, created_by, created_at. Unique workspace/source hash unless a deliberate repeated import is authorized.
- **feedback:** id, workspace_id, import_id, source_row_number, review_raw, source_category, text_hash, occurred_at nullable, ingested_at, source_channel nullable. Source category and text are immutable. An ingestion timestamp is never substituted for event time.
- **analysis_run:** id, workspace_id, provider, provider_dataset_id, provider_run_id, prompt_version, taxonomy_version, schema_version, state, attempts, estimated_cost, started_at, completed_at, error_code.
- **annotation:** id, feedback_text_hash, run_id, sentiment, topics, severity_suggestion, evidence_spans, validation_state, raw_result_key. Use versioned uniqueness; publish through a selected active run.
- **human_correction:** id, annotation_id, actor_id, field, previous_value, new_value, reason, created_at. Preserve the model output separately.
- **issue:** id, workspace_id, title, theme_key, owner_id nullable, status, action, created_at, updated_at, version. Optimistic locking prevents lost updates.
- **issue_evidence:** issue_id, feedback_id, annotation_id. Evidence links retain the exact version that supported the decision.
- **report_snapshot:** id, workspace_id, created_by, filter_json, active_run_id, metric_json, evidence_ids, generated_at, artifact_key.
- **audit_event:** actor, workspace, entity, action, old/new metadata and timestamp. Exclude raw private review text from ordinary logs.

Indexes: `(workspace_id, occurred_at)`, `(workspace_id, source_category)`, `(workspace_id, text_hash)`, `(workspace_id, import_id)`, and appropriate text search indexes. Retain row provenance so a feedback ID can resolve to its original file and line. Production hash caches include prompt and taxonomy versions to avoid stale reuse.

## 7. API and job boundaries

All routes below are proposed internal application endpoints, not claimed provider endpoints.

- `POST /api/imports`: stage file, verify size/schema, return validation preview and rejected-row details.
- `POST /api/imports/:id/commit`: idempotently commit valid rows. Never partially import without reporting accepted and rejected counts.
- `GET /api/feedback`: cursor pagination, validated filters and stable sorting.
- `POST /api/feedback`: manual entry, optional actual occurrence date, immutable source record.
- `POST /api/analysis-runs`: create an idempotent job scoped to a committed import and configuration version.
- `GET /api/analysis-runs/:id`: progress, provider identifiers, error state and validated-result count.
- `GET /api/insights`: aggregates plus denominator, missing-data counts and run version.
- `GET /api/issues/:id/evidence`: paginated source evidence with provenance.
- `POST /api/issues`, `PATCH /api/issues/:id`: validated ownership/status and optimistic version checks.
- `POST /api/reports`: freeze selected filters and analysis version, then generate an export.

State machine: `queued → preparing → uploaded → running → validating → completed`; any stage may move to `failed`, with a structured reason. Record durable checkpoints. Retry rate limits and transient server failures with exponential backoff and a bounded attempt count. Do not repeatedly pay for a new run when polling fails. A stalled job must remain visibly stalled or failed, not appear complete.

## 8. Meaningful Adaption workflow

### Delivered handoff

The Adaption studio exports distinct reviews with stable IDs and occurrence counts. A user can execute the provider workflow, map completions to the displayed JSON contract, and import results. The importer checks sentiment vocabulary, ID validity and exact evidence text, then applies accepted labels to repeated source text. It records imported analysis as user-supplied; it cannot independently authenticate its origin.

### Production automation

The documented create endpoint returns upload instructions for file ingestion. The provider adapter owns upload completion, adaptation launch, status polling and result download. Confirm each response schema while implementing. New code should use `/adapt`; the documentation marks `/run` as a deprecated alias. Use a stable idempotency key and retain the provider run identifiers. Request an estimate before the billable run.

Map `review` as context and supply one universal extraction instruction. Do not seed the answer with preview sentiment. Disable prompt rewriting when strict source fidelity is required. Deduplicate computational input in the application and retain a reversible mapping to all original rows. Generated augmentation belongs in a separate evaluation/training collection, never in observed customer metrics.

Suggested completion contract:

```json
{
  "id": "FB-00001",
  "sentiment": "Positive",
  "topics": ["product_features"],
  "evidence": "innovative features",
  "needs_review": false
}
```

This extended contract is a production proposal. The current importer uses `id`, `sentiment` and `evidence`. Do not request private chain-of-thought. A short evidence quote and a concise decision rationale are sufficient. Treat review text as untrusted data, not instructions. Refuse unknown IDs, unsupported labels and invented quotes; send invalid results to review rather than silently guessing.

### Evaluation

Create a human-reviewed reference set before claiming accuracy. Split on normalized distinct text, not raw rows, to prevent repeated examples leaking across train/test sets. Include positive service, outright complaints, negated fraud, mixed recovery, ambiguity and category disagreements. Report sentiment macro-F1, per-class precision/recall, invalid-output rate and exact-evidence validity. Compare rule-based baseline and provider results on the same holdout. Set acceptance targets before running the experiment; do not invent measured scores. Human-review remaining uncertain labels.

## 9. Priority and recommendation design

The prototype intentionally uses a transparent policy:

`priority = round(60 × severity / 5 + 40 × matching_items / selected_items)`

Severity is policy: seller trust/payment safety 5; checkout reliability 4; fulfilment, unresolved support and product quality 3. Frequency uses the selected all-row or distinct-text denominator. These are proposed product weights, not empirical loss probabilities. A fraud-related category alone never triggers a recommendation. Match negative or mixed text with issue-specific evidence. Themes may overlap, so their totals need not sum to all feedback.

Recommendations propose an investigation, owner and next action. They must not assert causality from complaint text alone. Production adds reviewed severity overrides, measured recent change only for adequately dated samples, and a before/after outcome review. Do not add revenue or churn weights without corresponding fields and defensible definitions.

## 10. Security, privacy and operational controls

Keep provider credentials server-side in a secrets store. Authorize each read, write, export and job through workspace membership; test cross-workspace isolation. Use private object storage and short-lived signed download URLs. Escape rendered reviews and neutralize spreadsheet formula prefixes on CSV exports. Validate file encoding, row counts, column types and size before processing.

Separate untrusted review content from provider instructions, validate generated outputs and never execute them. Make retention and deletion apply to raw files, annotations, exports and provider copies where supported. Provide an explicit explanation before transferring private feedback to a third-party analysis service. Do not put raw review text or credentials in telemetry.

Track import failures, provider queue age, run failures, annotation rejection rate, analysis version and export errors. Add a workspace-specific request ID and an end-to-end run ID. Backup the database and test restore before treating the service as durable production infrastructure.

## 11. Delivery sequence and acceptance gates

**Hours 0–8:** confirm the brief, profile data, choose contracts, build shell, CSV preview and source storage. Gate: all 7,000 rows reconcile and malformed inputs fail safely.

**Hours 8–24:** implement worker/provider adapter, run actual Adaption enrichment, validate outputs and expose evidence. Gate: at least one real provider run has retained provenance and reviewable output; no frontend secret.

**Hours 24–38:** complete filters, priority engine, issue tracking and report snapshots. Add real-date charts with missing-data coverage. Gate: a source row traces through analysis to a tracked issue and exported report.

**Hours 38–48:** evaluate labels, review responsive and keyboard behavior, test authorization and failure recovery, deploy and rehearse. Gate: submission URL is accessible to intended reviewers, source repository is available, demo is concise and no prototype-only behavior is misrepresented.

Avoid scope-expanding integrations, a generic chatbot, a new model-training service or a complex permissions UI during the initial 48 hours. Production automation and trustworthy evidence handling take priority.

## 12. Demonstration narrative

1. Open the supplied dataset: 7,000 rows, 320 distinct texts. Explain the counting distinction.
2. Inspect the highest-ranked issue and open the actual evidence.
3. Show a negated-fraud or mixed-recovery example to demonstrate semantic care.
4. Show the real Adaption dataset/run and validated imported annotations. State what changed and how it was evaluated.
5. Track an issue, assign an owner, move its status and export the decision brief.
6. End with the genuine missing-date limitation and show how a dated CSV enables a real chart.

## 13. Implemented versus remaining

Implemented: the complete visual and interaction workspace, full sample data, validated import, manual feedback, filtering, rule-based baseline, duplicate-aware counts, evidence, priorities, durable private issue tracking, exports, dated-row chart, server-side Adaption upload/estimate/run/status/export/validation, exact-quote human review and analysis provenance. The private workspace uses a D1 revision pointer and immutable R2 snapshots. Saving writes the snapshot first, then updates the pointer only when the expected revision matches; stale tabs receive a conflict instead of overwriting newer work. Retained snapshots enable recovery. All source reviews remain unchanged by label corrections.

Remaining before a complete production submission: measured analysis evaluation, team authorization if the owner-private audience expands, audit-history user interface, report snapshot sharing, production accessibility audit, reviewer-accessible deployment policy and final demonstration recording. The linked slide deck remains unreviewed because it was inaccessible. See the saved Adaption batches for actual provider execution state; no award outcome is implied.
