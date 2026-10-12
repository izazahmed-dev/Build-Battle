# Bounded default Hermes skills harness improvements

## Outcome

Installed **one** missing skill, `workers-best-practices`, from official Cloudflare source; no second skill met the usefulness/security bar. The prior bounded 42-entry inventory now has this one addition (43 in that scope, not the total Hermes catalog). No app source, runtime source, configuration, other profile, dependency, deployment, cloud resource, secret, or commit was changed. No untrusted installer/helper or bundled example was executed.

Authoritative Hermes procedure: https://hermes-agent.nousresearch.com/docs/user-guide/features/skills . Loaded `hermes-agent` and `third-party-skill-adaptation` before work. Native pinned URL installation used Hermes security scanning, not npx/plugin/blanket installation. Temporary downloads are under `/home/linux/.hermes/cache/scratch/harness-review/` only.

## Current popularity evidence (GitHub API)

These are repository star counts, not skill quality scores or an exhaustive global ranking. Live `https://api.github.com/repos/{owner}/{repo}` responses:

| Repository | Stars | Observed timestamp (UTC) | Decision |
|---|---:|---|---|
| [anthropics/skills](https://github.com/anthropics/skills) | 180569 | 2026-10-12T06:00:33.686889+00:00 | Investigated webapp-testing tree; existing browser/QA coverage makes another Playwright helper unnecessary. Not installed. |
| [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) | 47477 | 2026-10-12T06:00:34.805695+00:00 | Investigated vanilla JS, JS testing, Cloudflare audit candidates. Not installed. |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | 32254 | 2026-10-12T06:00:35.529786+00:00 | Existing inventory already includes desktop-web selections. React/Next/Vercel guidance is not a Workers/vanilla-ESM substitute. |
| [cloudflare/skills](https://github.com/cloudflare/skills) | 3043 | 2026-10-12T06:00:33.586754+00:00 | Lower stars, better first-party relevance; selected one skill. |

Trees resolved and downloaded at immutable commits: Cloudflare `c430dd965cea3a8faf0ef035e3b3d73b38518081`; Anthropic `dbd4588f9e1033efb41dad4bef2f7947c8993d44`; Antigravity `09e94102a5008d4d8066e14bdb8d0b95d365748c`. All three GitHub recursive tree responses reported `truncated: false`.

## Audit of the existing 42-entry inventory

Read `artifacts/web-skills-audit.md` and `artifacts/web-skills-manifest.json`. Programmatically checked all 42 unique entries for file existence, YAML parsing, nonempty name/description, current SKILL.md SHA256, and manifest comparison: **42 exist, 42 valid frontmatters, 41 hashes match**. This is an inventory/integrity and relevance audit, not a new complete security review of every legacy helper. No existing skill was modified.

Only drift: `software-quality-workflows` current SHA256 `0590c39c869f7ef733fce15a5de4008d799e1f774d56654d82848d8fedb3daf8`, manifest `26eb004eb0b3a0ba204cb9cc7c12f21f219e090a92c4f886b8d7eaf9f0f47065`. It loaded successfully through skill_view; current content includes extra production-preview/full-stack references. Cannot establish who/when changed it from the manifest alone; did not overwrite it or silently update the earlier audit.

Coverage: design/art direction overlaps substantially; existing quality/TDD, API debugging, browser QA, review and performance workflows already cover generic testing/review. React/Next-specific and Vercel deployment/cost skills should stay dormant for vanilla Workers work; they do not justify framework adoption or deployment. Existing creative and gstack names are qualified by Hermes because duplicate variants exist; use discovery names (e.g. `creative/design-taste-frontend`, `gstack/qa`) rather than assuming manifest bare names are callable. No duplicates were deleted or renamed.

| Inventory entry | Integrity | Relevant scope / caution |
|---|---|---|
| `full-output-enforcement` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `redesign-existing-projects` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `high-end-visual-design` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `awesome-design-md` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `stitch-design-taste` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `impeccable` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `brandkit` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `imagegen-frontend-web` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `gpt-taste` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `image-to-code` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `design-taste-frontend` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `design-taste-frontend-v1` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `industrial-brutalist-ui` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `creative-visual-artifacts` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `ui-ux-pro-max` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `skillui` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `minimalist-ui` | match; valid YAML | Design/art direction; use explicit discovery name where qualified |
| `software-quality-workflows` | **drift; retained**; valid YAML | Reusable quality/API/repository coverage |
| `rest-graphql-debug` | match; valid YAML | Reusable quality/API/repository coverage |
| `github-workflows` | match; valid YAML | Reusable quality/API/repository coverage |
| `browse` | match; valid YAML | Existing browser/review coverage; gstack-qualified names, command side effects require approval |
| `qa` | match; valid YAML | Existing browser/review coverage; gstack-qualified names, command side effects require approval |
| `qa-only` | match; valid YAML | Existing browser/review coverage; gstack-qualified names, command side effects require approval |
| `review` | match; valid YAML | Existing browser/review coverage; gstack-qualified names, command side effects require approval |
| `design-review` | match; valid YAML | Existing browser/review coverage; gstack-qualified names, command side effects require approval |
| `benchmark` | match; valid YAML | Existing browser/review coverage; gstack-qualified names, command side effects require approval |
| `devex-review` | match; valid YAML | Existing browser/review coverage; gstack-qualified names, command side effects require approval |
| `health` | match; valid YAML | Existing browser/review coverage; gstack-qualified names, command side effects require approval |
| `ship` | match; valid YAML | Existing browser/review coverage; gstack-qualified names, command side effects require approval |
| `vercel-react-best-practices` | match; valid YAML | Framework/provider-specific; not default for vanilla Workers |
| `web-design-guidelines` | match; valid YAML | General UI/prose coverage |
| `vercel-composition-patterns` | match; valid YAML | Framework/provider-specific; not default for vanilla Workers |
| `vercel-react-view-transitions` | match; valid YAML | Framework/provider-specific; not default for vanilla Workers |
| `writing-guidelines` | match; valid YAML | General UI/prose coverage |
| `deploy-to-vercel` | match; valid YAML | Framework/provider-specific; not default for vanilla Workers |
| `vercel-optimize` | match; valid YAML | Framework/provider-specific; not default for vanilla Workers |
| `next-partial-prefetching-adoption` | match; valid YAML | Framework/provider-specific; not default for vanilla Workers |
| `next-cache-components-optimizer` | match; valid YAML | Framework/provider-specific; not default for vanilla Workers |
| `next-bundle-optimizer` | match; valid YAML | Framework/provider-specific; not default for vanilla Workers |
| `next-dev-loop` | match; valid YAML | Framework/provider-specific; not default for vanilla Workers |
| `next-cache-components-adoption` | match; valid YAML | Framework/provider-specific; not default for vanilla Workers |
| `next-partial-prefetching-optimizer` | match; valid YAML | Framework/provider-specific; not default for vanilla Workers |

## Selected skill: full pre-install review and adaptation

Reviewed the complete upstream `SKILL.md`, all three referenced Markdown files, complete repository Apache-2.0 LICENSE, README installation options, and the full file listing for this skill. **Four upstream skill files, zero scripts/executables/hooks/dependency manifests.** No repository NOTICE file exists at the pinned commit. Copied the complete license with attribution retained. Search across the default profile found no existing Cloudflare/Workers, modern-JS, or JS-testing candidate directory; the new skill provides platform-specific request isolation, promise lifetime, bindings, secret handling, crypto and Workers-runtime test guidance missing from the existing inventory.

Native install command (exit 0):

```sh
hermes skills install 'https://raw.githubusercontent.com/cloudflare/skills/c430dd965cea3a8faf0ef035e3b3d73b38518081/skills/workers-best-practices/SKILL.md' --category web-development --yes
```

Installer downloaded SKILL.md plus all three references, quarantined/scanned them, returned **SAFE / ALLOWED**, and did not use `--force`. Scanner `skills-guard-v9`, timestamp `2026-10-12T06:04:38.435264+00:00`, scanned bundle hash `8bccd0584766418ced814484d562e65a7447a8399ba5d692d2355c57c63e95e3`. Seven medium supply-chain warnings were example `fetch`/service URL snippets in the reviewed Markdown, not helper execution or hidden network actions; kept documented rather than claiming a warning-free scan.

Adapted SKILL.md with prominent modification notice, concise routing metadata/license, Hermes reference-loading syntax and bounded safety instructions. Preserve vanilla JS ES modules and existing toolchain; do not turn TypeScript examples into an unrequested migration. No permission from skill loading to deploy, set secrets, create resources, change compatibility flags/dates, add dependencies or spend credits. Require current docs and redact sensitive logging.

Found upstream staleness: runtime reference mandates old `@cloudflare/vitest-pool-workers`; official [current Vitest integration](https://developers.cloudflare.com/workers/testing/vitest-integration/) retrieved during this audit recommends `@cloudflare/vitest-plugin`, with a migration guide for old-pool users. Added explicit current-doc precedence and labeled the old reference section historical. Left three upstream reference files byte-identical for provenance; no test dependency installation or migration occurred. Likewise added runtime-limit/API/pricing verification caution; illustrative auth snippets are not production-ready security implementations.

## Why no second skill

- Antigravity `modern-javascript-patterns`: fully read its SKILL.md and complete 910-line playbook plus MIT license. Useful ESM/async basics, but mostly generic syntax; examples include interpolated HTML without escaping, a fake `hashed_${password}` password transform, fetch/retry without HTTP-status validation and timeout racing without cancellation. Would need substantial hardening for a security-focused harness; not worth installing simply for stars.
- `javascript-testing-patterns`: screened trigger/instruction file; overlaps existing quality/TDD/browser coverage and is generic JS/TS/framework testing. Downloaded supporting playbook but did not represent it as fully security-reviewed or install it.
- Antigravity `cloudflare-security-audit`: tree includes a broad attack/recon reference collection and schema rather than a narrow Workers-runtime module/testing improvement. Downloaded for inspection; not selected, not fully reviewed, no attack probes/helpers executed.
- Anthropic `webapp-testing`: downloaded tree including license and Python server helper/examples; redundant with existing browser/QA coverage, adds helper/tooling surface. Not selected, no helper executed; no claim of complete script security review.
- No Wrangler/deploy/plugin/MCP bundle installed: unnecessary remote mutation/credential surface for this bounded request.

## Exact durable changed paths

Project artifact (only project write): `/mnt/c/Users/izaza/Documents/Build Battle/insightflow/artifacts/harness-improvements.md`.

Default profile installed skill files, with final SHA256:

- `/home/linux/.hermes/skills/web-development/workers-best-practices/SKILL.md` — `112994cb05b45b02c437057c82c5ec4e9a0aa9686826e074d4e7a2e597b014a9`
- `/home/linux/.hermes/skills/web-development/workers-best-practices/references/configuration.md` — `cdb5c9cd5168231373523332c0e7a5cf8811dc244c48298823e3ccc5eb7157c1`
- `/home/linux/.hermes/skills/web-development/workers-best-practices/references/hermes-provenance.md` — `c5d068e514ee3d8b401f2e96ee8e55285b386f3aac9ef862871b967cc683f1e9`
- `/home/linux/.hermes/skills/web-development/workers-best-practices/references/platform-apis.md` — `9ca9f5a7a82f92de45d310f5e2ee05aa464ddb7a63a737529caa17fff3660f28`
- `/home/linux/.hermes/skills/web-development/workers-best-practices/references/runtime-patterns.md` — `704ce8d4ff62c7655eb1d15f804ad566ed2012d11c2086e0d94bd3addb4d2c07`
- `/home/linux/.hermes/skills/web-development/workers-best-practices/references/upstream-license.txt` — `58d1e17ffe5109a7ae296caafcadfdbe6a7d176f0bc4ab01e12a689b0499d8bd`

Native installer-managed metadata/cache paths observed updated during installation (all under allowed default skills directory):
- `/home/linux/.hermes/skills/.hub/lock.json`
- `/home/linux/.hermes/skills/.hub/audit.log`
- `/home/linux/.hermes/skills/.hub/index-cache/official_optional_dirs.json`
- `/home/linux/.hermes/skills/.hub/index-cache/hermes-index.json`
- `/home/linux/.hermes/skills/.hub/scan-cache/8bccd0584766418ced814484d562e65a7447a8399ba5d692d2355c57c63e95e3-f7e27fced4f7fe75.json`

Temporary download/tree/inventory JSON files reside in `/home/linux/.hermes/cache/scratch/harness-review/`; tool-generated retrieval/output caches are non-harness artifacts. No other project file was written.

## Verified loadability and limits

- `skill_view(name='workers-best-practices')`: **success=true**, readiness **available**, setup_needed **false**, exact source path `/home/linux/.hermes/skills/web-development/workers-best-practices/SKILL.md`; repeated after final metadata adaptation and returned the amended content.
- `skill_view(name='workers-best-practices', file_path='references/runtime-patterns.md')`: **success=true**, complete runtime reference loaded.
- `skill_view(name='workers-best-practices', file_path='references/hermes-provenance.md')`: **success=true**.
- `skills_list(category='web-development')`: exact `workers-best-practices` entry present; category grew from 13 to 14.
- `hermes skills list`: exit 0, skill shown enabled, URL/community trust. Rich truncates long names; exact proof is from skill_view/skills_list rather than substring matching.
- All three native-installed upstream references compared byte-identical to separately downloaded immutable-source copies. License preserved completely. Zero skill helper scripts, so executable smoke tests are intentionally not applicable. No provider-model calls were made for verification.
- One frontmatter patch typo was rejected atomically by skill_manage; corrected patch succeeded and final loading verified valid YAML. Temporary dangling-reference advisory resolved by writing the license/provenance files.
- Future fresh sessions discover the new skill; existing long-running sessions may need documented `/reload-skills`. No runtime restart/config change performed. Native updater may overwrite the local guardrail adaptation; review updates and retain provenance/current-doc precedence rather than blanket auto-updating.
