# HomeTruth agent SDK integration

**Proposed engineering specification · 19 November 2026**

A homeowner taps **Find my manual** on a confirmed appliance. HomeTruth gives a specialist the exact make and model, searches approved manufacturer sources, and returns candidates for review. The homeowner chooses a candidate. HomeTruth verifies the PDF and attaches it to the appliance. This is the first workflow to put behind a shared agent interface.

HT-341 implements that journey on its feature branch. The shared registry, invocation interface, memory policy and messaging contracts below are proposed. The first release runs on demand inside the backend request. HT-337, HT-338 and HT-339 cover the separate owner-grant and MCP work for external personal-agent connections.

## SDK boundary and agent management

Keep the Agents SDK server-side in the isolated Node workspace used by HT-341. Start with its lockfile versions of `@openai/agents` (0.14.0) and Zod (4.6.7). The runtime adapter constructs the SDK `Agent`, binds authorised tools, invokes `Runner.run`, applies a deadline, and converts the provider response into a validated result and usage counts. Provider credentials, model choice and tool configuration come from the backend. Keep provider tracing disabled and Responses storage off, as in HT-341.

Maintain a version-controlled registry. Each entry declares a stable agent ID and immutable revision, owner, supported operations, input and output schemas, prompt version, model configuration, tool allowlist, permitted child operations, memory policy and execution limits. Validate entries at startup. A missing schema, unknown tool or unbounded operation fails registration. Route new calls to an explicitly enabled revision. Pin that revision on each run so that review and replay use the original result contract. A disable switch stops new executions and delegations. Keep historical result readers available for outstanding reviews. Roll back by switching the active revision.

The first entry is `appliance-information@1`. Expose `findManual` first. Keep evidence analysis and model discovery behind their existing calls until each has its own input, result and disclosure contract. The appliance domain service owns candidate validation, user confirmation and document import.

## Calling an agent

Only trusted domain services call the internal dispatcher. A controller authenticates the homeowner and resolves the selected home and item. Browser clients keep the existing appliance endpoints and response shapes. A new caller chooses a registered operation and supplies typed input plus a request key. The server constructs the principal and resource scope from the authenticated request.

```ts
// Inside the appliance service, after resolving the selected item.
const run = await agents.invoke({
  agent: 'appliance-information',
  operation: 'findManual',
  context: { principal, homeId, itemId },
  input: { requestKey }
})
```

| Operation | Contract |
| --- | --- |
| invoke | Check policy and input, resolve the revision, reserve the run, then execute within budget. Return the run ID, status and authorised result view. |
| get | Recheck current resource access and identity before reading status or results. Reloads and concurrent callers can observe a running lookup. |
| confirm manual | The existing appliance service accepts the run ID, candidate index and explicit confirmation. It rechecks rights, identity and candidate eligibility before import. |

Reserve once with a unique key over principal, resource, agent, operation and request key. Bind it to the input fingerprint and identity snapshot. Reuse returns the existing run, including its pinned revision. Conflicting reuse returns a conflict. An intentional fresh lookup uses a fresh key. Apply per-principal concurrency and usage limits before paid work. On timeout or provider failure, expose a retryable failure and the manufacturer-finder fallback. Recheck access after the model returns. Discard late results after loss of access or a competing terminal transition.

For manual search, preserve the current limits of four runner turns, a 90-second deadline, up to three hosted tool calls per response and at most four candidates. Record model calls, tokens, elapsed time, revision and outcome. Logs omit prompt text, document contents and raw tool responses.

## What the agent remembers

| Memory | Write and read policy | Lifetime |
| --- | --- | --- |
| Working context | Build a fresh allowlisted projection for each operation. Manual search gets confirmed make, model and manufacturer finder. Only the current run sees tool outputs. | In memory until the run ends. |
| Review and recovery | Persist the initiating user, resource, identity snapshot, revision, request key, status, validated candidates, citations, limitations and usage. Authorise each read. | Proposed default of 30 days after completion or interruption. Expired reviews require a new search. |
| Confirmed appliance knowledge | After confirmation, existing services store the verified manual, provenance and item association. Later authorised questions retrieve selected evidence and restore quotations from validated passage IDs. | Follow the appliance and document retention and deletion rules. |

Use the existing appliance run table as the first persistence adapter. Extend it compatibly for revision and expiry. Treat legacy rows as HT-341 results, anchor expiry to their last update, and preserve associations to already saved documents. Keep one authoritative record of the import. An SDK session or transcript is unnecessary for this workflow. Additional agents must declare which resource fields they can read and which reviewed domain action can create lasting knowledge.

Changing model identity invalidates pending candidates. Revoking access takes effect on the next tool read, result read or confirmation. Deleting a source removes derived retrieval content under the existing deletion workflow and invalidates dependent evidence references. A later run rebuilds its context from currently accessible records. No provider conversation ID or shared vector collection confers memory access.

## Messages within a run and between agents

Within one run, the SDK handles ordered tool calls and replies. For example, the manual finder calls `get_confirmed_appliance`, receives the authorised projection, then calls hosted search. The backend accepts candidates only after checking the URLs against the manufacturer policy and actual search citations. This path needs one agent and no message broker.

For a workflow that genuinely needs a second specialist, expose a dispatcher-backed tool to the parent. The parent requests a named child operation and typed inputs. The dispatcher checks the registered parent-to-child permission, narrows the parent's scope to the child's declared needs, and executes the child under the same principal. The child receives selected fields or authorised evidence references. It returns a typed result to its caller. The parent owns the user-facing outcome.

| Envelope field | Meaning |
| --- | --- |
| messageId, rootRunId, parentRunId, childRunId, replyTo | Server-assigned identifiers linking one request and its reply. |
| sender, recipient, operation, schemaVersion | Registered revisions and schemas validated in both directions. |
| payload | Minimal typed request or result, including source references and limitations where relevant. |
| deadline, remaining budget | Server-enforced limits inherited from the root across all model and tool calls. |

Start with synchronous request/reply, one delegation level and sequential children. Deny self-calls, cycles and undeclared destinations before invoking the SDK. Deduplicate on parent run and logical step key. Repeated delivery reuses the child result. Reject changed inputs under the same key, unsolicited replies and replies after the parent has closed. Store correlation IDs, outcome and timings alongside the run under its expiry policy. Keep transient payloads in working context. A child timeout yields a typed failure the parent can surface as a partial result only if its declared output schema permits it. The appliance pilot has an empty child allowlist. Exercise this contract with a fixture specialist before enabling a production pair.

## Appliance rollout and acceptance

1. Wrap the existing HT-341 runtime and service behind the registered operation. Keep the UI, request key and review/import flow. Map lookup to running → needs_review, no_match or failed. Confirmation moves needs_review → importing → saved, returning to review on recoverable import failure. Preserve the existing three-minute interrupted-run recovery and reject stale completions with conditional updates.
2. Verify parity using a synthetic appliance and controlled manufacturer responses. An official exact-model PDF can be confirmed and saved once. A model mismatch, unsupported brand or missing citation leads to a usable fallback. A source answer must resolve to the original passage. Compare the existing and wrapped paths offline to avoid duplicate paid searches.
3. Verify isolation and recovery. Two simultaneous identical requests produce one model run. Permission loss during lookup suppresses the result. A changed identity prevents import. Reload and duplicate confirmation preserve a single document. Expiry removes temporary results while the confirmed manual remains accessible under its document permissions.
4. Verify delegation with a fixture parent and child. A valid request returns a schema-checked reply carrying the root correlation ID. Reject an unauthorised recipient, a cross-home evidence reference, a duplicate with changed input and an expired reply. A child cannot exceed the root deadline or token allowance.
5. Enable the appliance operation after owner review of the experience and retention default. Track latency, tokens per completed lookup, no-match rate, import failures and duplicate suppression. Roll back routing to the existing HT-341 path while retaining compatible readers for pending reviews. A durable queue, scheduled runs and external-agent messaging require a separate delivery decision.

Implementation reference: HT-341, Appliance information agent.
