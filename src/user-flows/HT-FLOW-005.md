# HT-FLOW-005 · Connect and use a personal agent

**Version 0.2 · 19 November 2026 · Roadmap for review**

A homeowner wants their existing personal agent to answer “What needs attention in this home in the next three months?” Success is an answer with known dates, sources and explicit gaps. Ask HomeTruth remains available throughout the journey.

| Step | Homeowner experience | Data and authority |
| --- | --- | --- |
| 1. Choose the task | Enter from the selected home’s Control centre. Settings → Connections → Agents is the permanent place to manage access. | Preserve the home, task and return destination. Switching homes clears the previous source selection and rechecks access. |
| 2. Review a supported provider | When released for this cohort, show the provider, named home, purpose, material it may read and access duration. Cancel returns to the original task. | Authenticate the person and check their current Property Person relationship and authority to delegate. Issue a scoped, expiring, revocable grant after explicit approval. |
| 3. Continue in the agent’s app | Offer the starter question. On provider failure, retain the task and offer Ask HomeTruth. | The read-only MCP service checks the client, grant and current home/document access on each call. Return evidence dates, source references and unknowns. A missing service receipt leaves the service date unknown. |
| 4. Inspect the evidence | Open the cited passage in the authorised home record. The homeowner can choose Save follow-up inside HomeTruth. | Recheck access to the Evidence Source and Property Document. An explicit save creates a Reminder / Task. Reading dates creates no schedule. |
| 5. Manage access | Show the provider, home, scope, expiry and disconnect action. Expired access requires fresh consent. | Disconnect stops future reads. Explain at consent that previously exported information may remain with the provider. Loss of the underlying property or document permission takes effect on the next read. |

## Release decision

**Connect your agent is roadmap only.** Public copy may explain the intended benefit. A working control requires HT-337 owner grants, HT-338 scoped reads, and HT-339 validation on the actual provider surface, account and region. Private pilot access is cohort-specific. Public availability requires a recorded deployment and any applicable platform approval.

## Internal agent boundary

Ask HomeTruth provides conversational help. The external client reads permitted property information. Inside HomeTruth, the first registered specialist operation proposed is `appliance-information@1.findManual`. The appliance service starts the lookup, the homeowner reviews a candidate, and the service verifies and imports the manual as item evidence. The first external grant carries read access only. See the [HomeTruth agent SDK integration specification](./agent-sdk-integration.md).

## Database requirements

These planning requirements use the local MySQL inventory reviewed on 19 November 2026. Deployment coverage needs separate verification. Decisions below precede schema design or migration.

| Area | Reuse | Missing or required | Decision needed |
| --- | --- | --- | --- |
| Homeowner delegation (HT-337) | Use `users`, `properties` and the active `property_people` relationship to identify who can access the home. | A revocable grant must link the granting person, external client, home, purpose, permitted reads and evidence, expiry and revocation. Check the grant and current property and document permissions on every read. Record the grant, operation, time and outcome for access review. | Which roles may delegate, which sources may leave HomeTruth, how long can a grant last, and how long should access records be kept? |
| Answers and citations (HT-338) | Read dated tasks and facts from `property_tasks` and `property_facts`. Resolve citations through `property_documents` and `evidence_sources`. | The local schema has no dedicated maintenance-event or compliance record. Report missing dates as unknown. Each fact currently references one evidence source. A claim reconciled across several documents needs a way to retain all supporting sources. | Which dated records support the first pilot answer? Do we need multi-source claims or a dedicated event model for that pilot? |
| Provider availability (HT-339) | Use the HT-337 grant and HT-338 evidence-backed response to exercise a named provider on its actual surface. | Record the tested operation, provider surface, cohort or region, validation evidence and release decision. A successful private test establishes eligibility for that cohort only. | Who owns provider eligibility, approval and withdrawal, and where should those decisions be maintained? |
| Internal specialist definitions (HT-350) | Keep specialist definitions, revisions, allowed operations and tools in the version-controlled SDK registry. Use the existing appliance service and `appliance_agent_runs` for manual lookup. | Each invocation must be attributable to its operation and pinned revision. HT-351 owns durable run metadata. | Which revision is approved for the appliance pilot, and who may enable or roll it back? |
| Run identity and retries (HT-351) | Extend the existing `appliance_agent_runs` record and its request-key handling for the initial specialist. | Bind a run to its initiating user, selected resource, operation, revision and input fingerprint. Retain state and usage so repeat clicks reuse the same result and changed inputs under the same key are rejected. | Which concurrency and cost limits apply to the pilot? |
| Review and confirmed evidence (HT-352) | Use the run for reviewable candidates, `home_items` for the appliance and `home_item_evidence` for the confirmed document association. | Separate temporary review expiry from the confirmed manual’s document lifecycle. Recheck access before reading or importing a candidate. Expiring a review must preserve an already confirmed manual. | Approve or revise the proposed 30-day review window and the treatment of legacy runs. External grant expiry is a separate HT-337 decision. |
| Parent and child runs (HT-353) | The manual lookup uses one specialist and its existing run. | For a future delegated task, correlate root, parent and child runs and logical steps. Carry forward the authorised resource scope, deadline and remaining budget. | Which homeowner task warrants two specialists? Defer production delegation until it is selected. |

## Decisions still open

- Select the pilot provider and eligible cohort. The plan distinguishes UK feasibility work on Instinct from the Dots connector pilot. Name the technical owner, payer, support and release owner, and success thresholds.
- Approve the identity provider, roles allowed to delegate, permitted evidence categories and onward disclosure, grant duration and renewal.
- Agree who maintains provider capability and release evidence, including withdrawal of a provider from a cohort.
- Approve or revise the proposed 30-day retention for temporary internal review results. Confirmed documents follow their existing retention rules.
- Choose a first multi-specialist task before enabling parent-to-child operation calls. A manual lookup needs one specialist. Recurring monitoring, job drafts and sale-pack sharing require their own contracts.

## Review check

Using synthetic records, connect for Home A and open a cited source. Check an empty record, cancellation and provider failure. Deny Home B, an unselected private document and an unsupported write. Revoke the grant and repeat both the original query and evidence request. Repeat after expiry and loss of property access. Preserve the original task on return.
