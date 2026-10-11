# InsightFlow — Build Battle 2026

InsightFlow turns customer feedback into an inspectable decision: source review → sentiment → recurring issue → priority → owner → decision brief.

## Live application

https://insightflow-build-battle.azurebasil8.chatgpt.site

The judge demo is public and opens without sign-in. It contains only the supplied competition data and verified analysis, allows browser-local exploration, and cannot start paid provider runs or alter the private server workspace. `PUBLIC_DEMO=true` is active on the deployed server. Anonymous checks returned HTTP 200 for the application and frozen workspace, and HTTP 403 for workspace writes and paid-analysis preparation. To restore private analysis, restrict the Site's audience before disabling public demo mode.

## Adaption evidence

- Provider dataset: `fd968ec1-0a74-469a-9e45-8e2ad233557c`.
- Provider run: `dataset-fd968ec1-0a74-469a-9e45-8e2ad233557c-1791716066415`.
- Prompt contract: `insightflow-feedback-v2`.
- 320 distinct source texts processed; 320 accepted structured outputs; zero source-ID or exact-quote validation failures.
- Quoted cost: four credits for the full batch. The earlier eight-text verification quoted one credit. These are provider quotes, not an independently reconciled account balance.
- Adaption refines a fallible structured rule baseline using explicit instruction/completion mapping and immutable review context. Prompt rephrasing, deduplication and reasoning traces are off. An original review is never rewritten.
- The API key is stored in a server-side runtime secret. Original exports and provider IDs are retained; no key is in source or browser assets.

## Measured judgment sample

The assistant labelled 36 distinct texts before reading the full-batch results. Adaption agrees on 35/36; the current rule baseline agrees on 30/36. This is an intentionally selected, assistant-labelled judgment sample, **not** an independent human benchmark, random holdout, or accuracy measurement for the full dataset.

The one disagreement is “The product's design is minimalist and understated.” The reference marks this Unclear because it expresses no explicit evaluation; Adaption marks it Positive. The quality panel displays the disagreement. Users can inspect the original and retain their own reviewed label. The reference was not changed to improve the score.

## Implemented product

- All 7,000 original rows; 320 distinct texts; clear row-versus-text counting.
- Manual and CSV ingestion, validation, searching, filtering, original-source inspection, and exact-quote correction.
- Five configurable complaint themes with transparent policy severity and frequency priorities; source evidence, owners and issue status.
- Secure Adaption upload, explicit preprocessing, estimates, guarded launch, timeout recovery, status polling, downloads and validation.
- Durable private workspace snapshots, stale-save prevention, browser backup and portable exports with provider provenance.
- Responsive phone/desktop layouts, keyboard focus, native modal dialogs, printable reports and architecture explanation.
- Eighteen passing automated checks plus hosted browser verification of saving, reload, fabricated-evidence rejection, provider application and correction preservation.

## Boundaries to state during the demo

The dataset contains no dates, ratings, customer IDs or revenue. No historical growth, customer count or financial-impact claim is invented. Date charts use only genuinely dated imports. Themes and recommended investigations use explicit product rules; they are not claimed as learned root causes. This release is a private workspace or a frozen public demo, without multi-user team collaboration. Independent human evaluation, team membership authorization, broader accessibility auditing and the final recorded demonstration remain external submission work.

Use `DEMO.md` for the three-minute narrative. The source archive excludes credentials and local runtime dependencies.

