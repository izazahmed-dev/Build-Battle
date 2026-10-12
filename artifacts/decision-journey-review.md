# InsightFlow decision-journey review

## Scope and evidence

Read-only audit of source review → policy priority → AI disagreement → human correction → issue owner/status → exported brief. Read README.md, SUBMISSION.md, DEMO.md, web/app.mjs, web/engine.mjs, web/workspace-client.mjs and server/workspace.mjs. Inspected the running preview at `http://127.0.0.1:8787/?demo=1` in isolated browser session `decision-audit` without saving annotations, tracking changes, applying results or starting paid runs. No product files were edited.

The preview shows 7,000 source rows / 320 distinct texts; all 320 texts have saved Adaption analysis. Seller trust has 1,429 matching rows, 27 distinct matching texts, policy severity 5/5 and priority 68/100. The issue drawer correctly explains the policy formula rather than calling it AI confidence. Quality review correctly labels 35/36 Adaption versus 30/36 baseline as selected, assistant-labelled sample agreement, not independent accuracy. The disputed original review is accessible by searching `minimalist and understated`: FB-00630 and FB-01963, both Positive, with exact supporting quote and provider lineage.

A proposed in-memory Node characterization probe was denied by the command approval layer and did not execute. It was not retried. Accordingly, correction/export failure paths below are source-confirmed findings with reproduction steps and proposed acceptance tests, not claimed executed mutations or verified downloads.

## Ranked weaknesses

### 1. Human correction destroys the previous decision provenance

**Strongest concrete improvement:** preserve the prior provider label, evidence and run lineage when saving a reviewed override, and make both judgments inspectable. This directly strengthens the product's central promise that a human decision can be traced to its source and AI contribution.

**References:** `web/app.mjs:92` (`feedbackDetail` save handler), `web/app.mjs:84–86` (provider application), `web/app.mjs:46` (Markdown brief), `web/app.mjs:70` (feedback CSV fields), `server/workspace.mjs:13` (persisted annotation allowlist).

The save handler replaces every exact-identical text's annotation with `{id, sentiment, evidence, method: 'Reviewed annotation'}`, explicitly deletes `provider_run_id` and `dataset_id` from the working row, and removes the previous annotation from `enriched`. The server serializer retains only one current annotation per source ID and has no prior-decision field. The immutable provider batch remains separately available, but the corrected source loses its direct link to that batch and its previous label; reopening the review has no before/after decision view. Markdown contains aggregate method counts and a source quote, not the correction record or source-level provider lineage.

**Reproduction (proposed; save was not performed):** open the frozen demo → Studio → Load verified run → Review analysis quality; note FB-00630, reference Unclear / Adaption Positive. Close the dialog, open Feedback inbox and search `minimalist and understated`. Open FB-00630 and note its dataset/run IDs. Set sentiment to Unclear while keeping the exact quote, then save. Reopen the source: the current code removes dataset/run IDs and overwrites the prior annotation for both matching rows. Export feedback CSV and a brief: there is no explicit previous-provider versus reviewed decision chain.

**Narrow acceptance tests:**
- Override the existing FB-00630 provider result to Unclear with an exact quote. Both FB-00630 and FB-01963 retain unchanged original reviews; current labels are Reviewed/Unclear and prior Positive label, supporting quote, dataset and run ID remain available as prior analysis, not misrepresented as the reviewed label's producer.
- Reload through the workspace serializer and demo browser-backup path; both current judgment and prior provenance survive.
- Export a decision/annotation record that identifies the source ID, prior method/label/run and current reviewed method/label/quote. Do not invent reviewer identity or review dates; any newly recorded event timestamp must be an actual event timestamp, not a source-feedback date.
- Reapplying the verified provider batch must still leave the human override current (`app.mjs:84` already protects Reviewed/Human methods).

### 2. Tracked decisions can disappear from the brief and become uneditable when matching evidence reaches zero

**References:** `web/app.mjs:45` (`tracker`), `web/app.mjs:46–47` (brief/export iterate current `issues` only), `web/app.mjs:55` (`issueDetail`), `web/engine.mjs:23` (`issues` drops zero-count themes).

Ownership/status are stored separately in `saved`, but reports enumerate only currently matching themes. A filter can omit a tracked task without any explicit tracked-but-outside-scope section. If reviewed labels remove all Negative/Mixed matches for a tracked theme, the tracker retains the ticket with zero matching rows, while `issueDetail` cannot find that theme and returns `This theme has no matching feedback.` Owner editing lives exclusively in that drawer. Its severity also falls back to High because the live theme object is absent, even if the stored decision originated from a Critical policy theme. This is decision-state loss in the reporting/editing path, not evidence that the customer issue has been resolved.

**Reproduction (proposed; no status/annotation changes performed):** with the existing tracked seller-trust task, select Positive sentiment on Reports and download the brief. `issues` excludes every Positive source from complaint evidence, so the task is absent although it remains tracked. For the zero-evidence branch, use an isolated test fixture with an existing fraud ticket and its sole matching source reviewed to Positive; open that ticket's evidence/owner drawer. The tracker displays a zero-row ticket, but the drawer cannot open, and the exported priorities omit the ticket.

**Narrow acceptance tests:**
- A tracked task outside report filters appears in a clearly separated “Tracked decisions outside this evidence scope” section with its owner/status; filtered sentiment counts and priorities remain unchanged.
- A tracked theme with zero current matching items remains openable and owner-editable, displaying zero current evidence and an explicit “No current matching feedback” state rather than silently changing severity or implying resolution.
- Saving a status and owner, then reviewing away the last matching source, preserves those values through reload and export. Export distinguishes workflow status from observed complaint evidence.

### 3. AI disagreement is visible but has no direct handoff into human review

**References:** `web/app.mjs:94` (`qualityDetail`), `web/app.mjs:55` (issue evidence rendered as static quote cards), `web/app.mjs:92` (review correction dialog), `web/app.mjs:21` (walkthrough asks users to open a review independently).

**Executed browser reproduction:** Studio → Load verified run → Review analysis quality shows the sole disagreement, `The product's design is minimalist and understated.`, FB-00630, reference Unclear / Adaption Positive. Inspecting the modal found **zero** `[data-feedback]` elements or anchors. The disputed card has no “Review this source” action or supporting-quote expansion, while improved cases do have supporting-quote expansions. To correct the known disagreement, users must close the panel, navigate to the inbox, re-enter text or ID, and open the source. Issue evidence similarly lists source IDs without source-review actions. The audit manually followed the search route and verified that the source dialog exposes the supporting quote, run lineage and human-review controls; no correction was saved.

**Narrow acceptance tests:**
- The FB-00630 disagreement card provides one keyboard-operable “Review this source” action that opens the existing source-review dialog directly, with source text, current Positive label, provider lineage and the reference Unclear shown as advisory rather than automatically applied.
- After an explicit correction, returning to quality review distinguishes the immutable recorded provider/reference disagreement from the workspace's current reviewed label; it must not rewrite the 35/36 provider sample result.
- Each visible issue evidence source ID opens that original review without changing the issue selection, filters, owner or status; closing restores focus to the initiating action.

## Recommendation

Implement #1 first as a narrow provenance-preserving human override, then reuse that inspectable record for the direct handoff in #3. Keep #2 independent: a tracked task must remain reportable and editable even when the current evidence selection no longer contains it. None of these changes requires new paid analysis, invented customer metrics, altered benchmark labels or deployment.
