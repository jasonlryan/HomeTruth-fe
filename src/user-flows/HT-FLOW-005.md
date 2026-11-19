# HT-FLOW-005 · Put the Truth agent to work

**Version 0.4 · 19 November 2026 · Roadmap for review**

## Find my manual · a worked example of property intelligence

A homeowner has a washing machine and wants the right manual for that particular model. The Truth agent uses the confirmed details of the appliance, finds a manufacturer’s manual for review and helps the homeowner keep it with the machine. This is the proposed example for the homepage and the home workspace.

| Where | What the homeowner sees and does |
| --- | --- |
| Homepage | Beside Ask HomeTruth, show **See the Truth agent at work** with a **Find my manual** preview. Use a sample washer to show the model label, the matching manufacturer’s manual and where the confirmed copy belongs. Guests can view the example before signing in. Label the example as a preview while the capability awaits release. |
| Home workspace | In the selected home’s Control centre, show **Find my manual** as a Truth agent task under Appliances. Let the homeowner choose their washer. The same action on the appliance record starts with that washer already selected. If the make or full model is uncertain, ask the homeowner to check the label first. |
| Appliance record | Show which model the Truth agent is checking. Present a candidate with its manufacturer source and model number so the homeowner can check the match. After confirmation, the appliance service verifies the PDF, saves it as evidence and offers **Open manual** on that same washer. If verification fails, keep the item and offer the manufacturer’s page or manual upload. |

**Homepage prompt selection.** The example questions are unvalidated placeholders. Lead with the worked task. For each proposed prompt, identify the home-specific input, the work HomeTruth would do and the result the homeowner could check or keep. For example, once a manual is saved, “Show me how to clean the filter on this washer” can take the owner to the relevant passage in their model’s manual. Test wording and usefulness with homeowners before treating an example as evidence of demand.

## Connect your own agent · roadmap only

On the public site, describe this as an optional future way to use a supported personal agent with a selected home. Keep the roadmap mention informational. Settings → Connections → Agents is for reviewing and managing delegated access. The built-in Truth agent’s manual task uses the homeowner’s existing appliance permissions.

A homeowner wants their existing personal agent to answer “What needs attention in this home in the next three months?” Success is an answer with known dates, sources and explicit gaps. Ask HomeTruth remains available throughout the journey.

| Step | Homeowner experience | Data and authority |
| --- | --- | --- |
| 1. Choose the task | In a future pilot, start the property review from the selected home’s Control centre and choose a supported external agent. | Preserve the home, task and return destination. Switching homes clears the previous source selection and rechecks access. |
| 2. Review a supported provider | When released for this cohort, show the provider, named home, purpose, material it may read and access duration. Cancel returns to the original task. | Authenticate the person and check their current Property Person relationship and authority to delegate. Issue a scoped, expiring, revocable grant after explicit approval. |
| 3. Continue in the agent’s app | Offer the starter question. On provider failure, retain the task and offer Ask HomeTruth. | Authenticate the external client through the agreed OAuth discovery/PKCE flow and verify its token claims. On each query and evidence-link request, check the grant and the granting person’s current property and document permissions, including when a previous request succeeded. Return evidence dates, source references and unknowns. A missing service receipt leaves the service date unknown. |
| 4. Inspect the evidence | Open the cited passage in the authorised home record. The homeowner can choose Save follow-up inside HomeTruth. | Recheck access to the Evidence Source and Property Document. An explicit save creates a Reminder / Task. Reading dates creates no schedule. |
| 5. Manage access | In Settings → Connections → Agents, show the provider, home, scope, expiry and disconnect action. Expired access requires fresh consent. | Disconnect stops future reads. Explain at consent that previously exported information may remain with the provider. Loss of the underlying property or document permission takes effect on the next read. |

## Release decision

**Connect your own agent is roadmap only.** Public copy may explain the intended benefit. A working control requires HT-337 owner grants, HT-338 scoped reads, and HT-339 validation on the actual provider surface, account and region. Private pilot access is cohort-specific. Public availability requires a recorded deployment and any applicable platform approval.

## Internal agent boundary

Ask HomeTruth provides conversational help. The external client reads permitted property information. Inside HomeTruth, the first registered specialist operation proposed is `appliance-information@1.findManual`. The appliance service starts the lookup, the homeowner reviews a candidate, and the service verifies and imports the manual as item evidence. The first external grant carries read access only. See the [HomeTruth agent SDK integration specification](./agent-sdk-integration.md).

## Database requirements

These planning requirements use the local MySQL inventory reviewed on 19 November 2026. Deployment coverage needs separate verification. Decisions below precede schema design or migration.

| Area | Reuse | Missing or required | Decision needed |
| --- | --- | --- | --- |
| Homeowner delegation (HT-337) | Use `users`, `properties` and the active `property_people` relationship to identify who can access the home. | A revocable grant must link the granting person, external client, home, purpose, permitted reads and evidence, expiry and revocation. Check the grant and current property and document permissions on every read. Record the grant, operation, time and outcome for access review. | Which roles may delegate, which sources may leave HomeTruth, how long can a grant last, and how long should access records be kept? |
| Answers and citations (HT-338) | Read dated tasks and facts from `property_tasks` and `property_facts`. Resolve citations through `property_documents` and `evidence_sources`. | The local schema has no dedicated maintenance-event or compliance record. Report missing dates as unknown. An answer may cite several permitted documents without creating a property fact. Each stored fact currently references one source. Saving a reconciled fact supported by several documents requires a fact-to-evidence link for each supporting source. | Which dated records support the first pilot answer? Do we need multi-source claims or a dedicated event model for that pilot? |
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

Walk through the homepage preview as a guest. In the proposed signed-in journey, start from the Control centre and from a washer record. Check that both reach the right appliance, that the owner reviews the model before import, and that a failed match leaves a usable fallback. Confirm the external-agent roadmap mention offers no connection action.

For the future external pilot, using synthetic records, connect for Home A and open a cited source. Check an empty record, cancellation and provider failure. Deny Home B, an unselected private document and an unsupported write. Preserve the original task on return.

Run the following cases independently. Start each with a valid client token, an active grant and a homeowner who can read Home A and its selected document. Verify that the property query succeeds and its evidence link opens.

| Change one condition | Required outcome |
| --- | --- |
| Revoke the external grant. Keep the token valid and the homeowner’s own access intact. | Repeat the same query and request the same evidence link. Both must be denied. Explain during consent that HomeTruth cannot recall copies already exported. |
| In a fresh case, remove the homeowner’s access to Home A. Keep the token valid and the grant active and unexpired. | Repeat the same query and request the same evidence link. Both must be denied even if the client previously used them successfully. |
| Remove only the selected document permission. Retain property access. | The next answer must exclude that document’s contents and its evidence link must be denied. |
| Let the grant expire while the token and underlying permissions remain valid. | Deny both reads until fresh consent is granted. |

For appliance review, use a controlled clock. Confirm and save the manual, expire the temporary candidate, then verify that the candidate can no longer be retrieved or imported and the homeowner can still open the saved manual from the same washer. The 30-day candidate lifetime awaits approval. In a separate case, remove property access during an unexpired review and require both candidate retrieval and confirmation to fail.
