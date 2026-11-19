# HT-FLOW-005 · Connect and use a personal agent

**Version 0.1 · 19 November 2026 · Roadmap for review**

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

## Decisions still open

- Select the pilot provider and eligible cohort. The plan distinguishes UK feasibility work on Instinct from the Dots connector pilot. Name the technical owner, payer, support and release owner, and success thresholds.
- Approve the identity provider, roles allowed to delegate, permitted evidence categories and onward disclosure, grant duration and renewal.
- Agree who maintains provider capability and release evidence, including withdrawal of a provider from a cohort.
- Approve or revise the proposed 30-day retention for temporary internal review results. Confirmed documents follow their existing retention rules.
- Choose a first multi-specialist task before enabling parent-to-child operation calls. A manual lookup needs one specialist. Recurring monitoring, job drafts and sale-pack sharing require their own contracts.

## Review check

Using synthetic records, connect for Home A and open a cited source. Check an empty record, cancellation and provider failure. Deny Home B, an unselected private document and an unsupported write. Revoke the grant and repeat both the original query and evidence request. Repeat after expiry and loss of property access. Preserve the original task on return.
