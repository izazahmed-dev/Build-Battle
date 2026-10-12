# Provider capacity and safe model routing

Snapshot: **2026-10-12 06:01:56–06:02 UTC**. Quotas and catalogs can change during concurrent agent work.

## Verdict

- **AgentRouter `deepseek-v4-flash`: a tiny no-tool coding inference succeeded.** The configured Anthropic Messages transport returned HTTP 200 and a Python `add` function. This establishes basic inference, not tool calling or production coding quality.
- **NVIDIA NIM: catalog accessible, but the one permitted coding probe failed.** `mistralai/codestral-22b-instruct-v0.1` appeared in the live catalog yet returned HTTP 404. Do not route a worker to it as a verified working model. No second model/key was tried.
- **Codex account quota: session 69% remaining; weekly 37% remaining.** The weekly window already satisfies the requested **remaining <60%** condition. Switching Codex models on this same login does **not** establish an independent quota pool or replenish that weekly quota.
- `gpt-6.1-sol-900k` has an actual prior `MODEL_OK` delegation result supplied by the parent. `gpt-6-sol` is live-catalog-listed, **not inference-verified here**. No additional Codex inference was issued.
- Native Hermes fallback is **error-triggered**, not a proactive percentage threshold. A <60% policy needs an explicit quota-aware dispatcher/preflight; no such mechanism was installed or enabled during this inspection.

## Scope and protections

Inspected the default profile only. Credentials were consumed in memory and never printed. No global config, source, fallback, parent model, pool status, or credential was intentionally changed. SHA-256 before/after comparisons around the catalog/quota reads and provider probes showed `config.yaml`, `auth.json`, and `.env` unchanged. No purchased credits, quota-reset redemption, Adaption endpoint, or extra account budget pool was used.

**Probe budget:** one AgentRouter inference; one NVIDIA inference; zero new Codex inferences. No inference retries or catalog-wide brute force.

A subsequent attempt to execute unit checks on the returned toy function and calculate an aggregated threshold result was denied by command approval and did not run. It was not retried. Therefore no function-execution test result or additional threshold-script execution is claimed. The successful probe's Python shape was AST-parsed in the original approved request script.

## Existing configuration observed

| Component | Non-secret observations |
|---|---|
| AgentRouter saved custom endpoint | Name `Agentrouter.org`; base `https://agentrouter.org/v1`; model `deepseek-v4-flash`; `api_mode: anthropic_messages`; key source `HERMES_CUSTOM_AGENTROUTER_ORG_API_KEY`; configured `User-Agent` header retained for catalog and inference requests |
| AgentRouter saved model labels | `deepseek-v4-flash`, `claude-opus-4-8`, `claude-opus-5`, `gpt-5.6-sol`, `gpt-6-astra` |
| NVIDIA credential initialization | Three stored `nvidia` API-key entries; endpoint `https://integrate.api.nvidia.com/v1`. Read-only inspection chose the first priority-sorted entry, labelled `api-key-2`, with stored status `ok`; other entries were not tested or rotated into |
| NVIDIA selected model | No dedicated NVIDIA primary model selection was observed in the inspected top-level config. Coding probe chose an ID present in the authenticated catalog, without changing a saved selection |
| Persisted primary model snapshot | `openai-codex` / `gpt-6.1-sol-900k`, base `https://chatgpt.com/backend-api/codex` |
| Persisted delegation snapshot | `openai-codex` / `gpt-6.1-sol-900k`, empty delegation base URL |
| Existing persisted error fallback | `openai-codex` / `gpt-5.5` |

The parent's supplied **active runtime** model is `gpt-6-astra-900k`; a persisted config snapshot is not proof that an already-running parent's model changed. This inspection did not alter either.

## Live catalogs versus working inference

All three catalogs were read using already-configured credentials bound to their own provider origin.

### AgentRouter

`GET https://agentrouter.org/v1/models` → **HTTP 200, 4 distinct IDs**:

```text
claude-opus-4-8
claude-opus-5
deepseek-v4-flash
gpt-6-astra
```

Discrepancy: saved `gpt-5.6-sol` was absent from this live response. The saved list is not a callable-model guarantee.

One request to `POST https://agentrouter.org/v1/messages`:

- Model: `deepseek-v4-flash`; configured Anthropic version header and User-Agent.
- Prompt: `Return only a Python function add(a, b) that returns their sum. No explanation.`
- `max_tokens: 64`; no tools supplied.
- **HTTP 200**, returned model `deepseek-v4-flash`.
- Output:

```python
def add(a, b):
    return a + b
```

- Reported usage: 48 input tokens, 54 output tokens; cache creation/read both 0.
- AST function-shape check succeeded; runtime function execution was not verified.

### NVIDIA NIM

`GET https://integrate.api.nvidia.com/v1/models` → **HTTP 200, 80 distinct IDs**. Relevant examples actually present in that response:

```text
bigcode/starcoder2-15b
deepseek-ai/deepseek-coder-6.7b-instruct
deepseek-ai/deepseek-v4.1-flash
google/codegemma-1.1-7b
google/codegemma-7b
ibm/granite-34b-code-instruct
ibm/granite-8b-code-instruct
meta/codellama-70b
mistralai/codestral-22b-instruct-v0.1
moonshotai/kimi-k2.6
moonshotai/kimi-k3
nvidia/nemotron-3-super-120b-a12b
nvidia/nemotron-3-ultra-550b-a55b
nvidia/nemotron-3.5-lightning-30b-a3b
openai/gpt-oss-20b
poolside/laguna-xs-2.1
z-ai/glm-5.3
z-ai/glm-5.3-flash
```

These are catalog entries, **not verified working models**. In particular, the only permitted probe to `POST /v1/chat/completions` with `mistralai/codestral-22b-instruct-v0.1`, `max_tokens: 64`, temperature 0, streaming disabled, and the same tiny coding prompt returned **HTTP 404**. The normalized failure contained no usable error message. Root cause was not established; it could be unavailable/deprecated routing despite stale enumeration. No second probe is justified under the budget.

The official NVIDIA documentation page advertises some different IDs (for example `deepseek-ai/deepseek-v4-flash` and `poolside/laguna-xs-2-1`). Do not silently substitute documentation IDs for this authenticated catalog's exact IDs.

The Hermes NVIDIA provider plugin strips `name` and `tool_name` from tool messages for NIM compatibility. That source-level adaptation is not an end-to-end tool-call verification.

### OpenAI Codex

Authenticated account-bound `GET https://chatgpt.com/backend-api/codex/models?client_version=99.0.0` through the installed catalog helper → **HTTP 200, 10 entries**:

```text
gpt-6.1-sol
gpt-6-astra
gpt-6-sol
gpt-6-luna
gpt-reserve
gpt-5.6-sol
gpt-5.6-terra
gpt-5.6-luna
gpt-5.5
codex-auto-review
```

| Requested route | Live base model | Catalog context / maximum | Inference evidence |
|---|---|---|---|
| `gpt-6.1-sol-900k` | `gpt-6.1-sol` | 500,000 / 872,000 tokens | Parent-supplied actual prior `MODEL_OK` delegation result; this subagent also runs on that delegated route |
| `gpt-6-sol` | `gpt-6-sol` | 272,000 / 872,000 tokens | Catalog only; not probed |
| Parent `gpt-6-astra-900k` | `gpt-6-astra` | 272,000 / 872,000 tokens | Parent-provided active-model context; no new probe here |

Hermes `agent/model_metadata.py` treats eligible `-900k` suffixes as local context variants and strips the suffix for the wire model. Thus the absence of the literal suffixed ID from the server catalog is expected. **The label is not proof of exactly 900,000 usable tokens**; the live server metadata above remains the provider-reported cap. No long-context acceptance test was performed.

## Codex remaining-usage query

### Supported interfaces

- Interactive Hermes **`/usage`** renders account-limit windows for its live provider. Session token analytics alone are not account quota. A non-Codex session's `/usage` should not be assumed to report the Codex login.
- Installed internal helper: `agent.account_usage._fetch_codex_account_usage_read_only(base_url=..., api_key=...)`. This was the helper actually exercised for this report, using an **explicit existing stored Codex token** so the resolver returns that credential immediately.
- Under this base, it performs **GET `https://chatgpt.com/backend-api/wham/usage`**, not an OpenAI API billing endpoint.
- The helper passes provider-specific Codex account/residency headers. It does not force-refresh on a 401 in the read-only path.

**Important guard:** do not call the helper without explicit `api_key` for a strictly read-only audit. Its shared credential-resolution path can resolve/refresh or select pool credentials when explicit credentials are missing. Do not print its `raw` body, identity, token, or auth file unnecessarily.

Safe integration outline (documentation, not installed code):

```python
# Run with the installed Hermes runtime interpreter/dependencies.
# Read one already-selected credential in memory; never log its contents.
snapshot = _fetch_codex_account_usage_read_only(
    base_url=existing_codex_route,
    api_key=existing_codex_access_token,
)
# Consume snapshot.windows, window.scope, window.used_percent, reset_at,
# and snapshot.fetched_at; export only these non-secret fields.
# A 401/timeout/absent window means UNKNOWN, not 100% remaining.
```

The system Python lacked needed runtime dependencies in prior work. The working interpreter was discovered from `/home/linux/.local/bin/hermes` → `/home/linux/.hermes/hermes-agent/.hermes/bin/hermes`, then run with the source path and `hermes_bootstrap`; both approved audit scripts exited 0. The supported launcher also has `--run-module`, but do not guess a separate Python executable or print launcher/config secrets.

### Actual snapshot

Source `usage_api`; plan **Plus**; fetched **2026-10-12T06:01:57.065415+00:00**.

| Window | Used | Remaining | Reset UTC | Scope |
|---|---:|---:|---|---|
| Session / 5 hours | 31% | **69%** | 2026-10-12 10:46:59 | account |
| Weekly / 7 days | 63% | **37%** | 2026-10-18 05:28:33 | account |

Backend reported `allowed: true`, `limit_reached: false`; no additional model-specific limits were present. Available right now is not the same as safe for unrestricted parallel agents.

## Safe <60% fallback policy

**Recommended policy; not implemented or enabled:**

1. Query the **same account** the next worker would use, at task boundaries. Obtain a fresh snapshot, and evaluate each relevant account-scoped window separately. Route conservatively if **any** remaining percentage is strictly below 60. Do not average windows, round before comparison, or aggregate unrelated logins into one balance. At exactly 60, the strict condition is false.
2. Treat unavailable/expired/missing usage as **unknown**. Hold quota-sensitive new workers or ask for an explicit route, rather than silently using purchased credits or assuming full quota.
3. For the requested model change, prefer the already inference-confirmed **`openai-codex` / `gpt-6.1-sol-900k`** for an explicitly bounded worker. Keep **`gpt-6-sol`** a catalog-available but unverified alternative until a separately authorized probe or real worker succeeds.
4. **Do not claim quota rescue:** both candidates use the same account-scoped quota in this snapshot. If the goal is to preserve the remaining 37% weekly allowance, reduce concurrency/token budgets or route an explicitly authorized worker to the separately verified AgentRouter `deepseek-v4-flash`. Its remaining monetary/request budget was not retrieved, so do not assume unlimited/free capacity. NVIDIA is not an eligible verified backup from this audit.
5. Choose the worker route before launching its new task, via a session-local override or an explicit delegated/provider override supported by the orchestrator. Do **not** edit the parent's `model.default`, the profile's active provider, or a shared fallback list behind the active parent's back. A separate invocation can pin a route using `hermes chat --provider openai-codex --model gpt-6.1-sol-900k -q '<bounded task>'`; this is an example, not an executed task.
6. Pinned delegation does not automatically inherit the parent fallback chain. Declare `delegation.fallback_providers` only in a separately authorized isolated worker configuration if such error recovery is desired. Explicitly empty lists disable it. A multi-model strategy requires deliberate per-worker routing, not assuming every delegated child uses a different model.
7. Recheck at the next task boundary. Do not spin a high-frequency polling loop, rotate through all NVIDIA keys, redeem `/usage reset`, or purchase credits.

### Native error fallback is a separate mechanism

The authoritative Hermes docs specify a top-level chain, for example:

```yaml
# Illustrative only — NOT written to global config.
fallback_providers:
  - provider: openai-codex
    model: gpt-6.1-sol-900k
  - provider: openai-codex
    model: gpt-6-sol
```

This declares ordered **error** candidates, not “switch at 60% remaining.” The second candidate remains unverified here and should not be represented as tested. Native fallback handles rate limits/server errors after retries, immediate auth failures/not-found errors, and repeated invalid responses. Current detailed docs describe turn-scoped fallback with reset-aware cooldown; these supersede older summary wording suggesting permanently session-scoped behavior. Switching models/providers invalidates prompt caches and can increase input usage.

The inspected global fallback is still `openai-codex` / `gpt-5.5`; no change was made. A same-account Codex fallback cannot bypass an account quota exhaustion.

## Limits and unresolved items

- No AgentRouter balance/rate-cap API was identified or exercised; no NVIDIA credit balance/rate cap was obtained. Catalog access does not expose a guaranteed usable budget.
- No free-tier, price, confidentiality, training, retention, or SLA guarantee was established for either external provider. Use only the harmless probe or data the user has authorized for those providers.
- One basic inference does not validate tool calls, long context, latency under load, repository-scale edits, or comparative model quality.
- NVIDIA coding probe failed; other models and other keys remain untested by design.
- No new Codex inference was spent, and `gpt-6-sol` has no working-response evidence in this audit.
- Extra generated-function execution verification was blocked by approval and was not retried.

## Evidence and authoritative references

Live API evidence: authenticated catalogs for each provider; read-only Codex usage helper; one AgentRouter Anthropic Messages request and one NVIDIA Chat Completions request. Sanitized JSON evidence is retained in scratch at `/home/linux/.hermes/cache/scratch/provider-capacity-results.json` (not a global config or a committed project artifact).

Official documentation read:

- [Hermes configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuration)
- [Hermes providers](https://hermes-agent.nousresearch.com/docs/integrations/providers)
- [Hermes fallback providers](https://hermes-agent.nousresearch.com/docs/user-guide/features/fallback-providers)
- [NVIDIA LLM API reference](https://docs.api.nvidia.com/nim/reference/llm-apis)

Installed source inspected:

- `/home/linux/.hermes/hermes-agent/agent/account_usage.py`: read-only helper, GET usage endpoint construction, account window scopes, percent-remaining rendering.
- `/home/linux/.hermes/hermes-agent/agent/model_metadata.py`: catalog compatibility version and context-variant suffix handling.
- `/home/linux/.hermes/hermes-agent/plugins/model-providers/nvidia/__init__.py`: default endpoint and tool-message adaptation.
- `/home/linux/.hermes/hermes-agent/website/docs/user-guide/features/fallback-providers.md`: turn-scoped recovery and pinned-worker behavior.
