# HT-FLOW-003 · Improving my home

**Version 0.1 · 18 November 2026 · Proposed for review · HT-349**

Help an owner plan a job, understand the decision and find evidence of the finished work later.

| Step | Customer action and result | Data and access |
| --- | --- | --- |
| 1. Scope a job | Choose the work, the room or item and what needs to change. Get a checklist for describing the job and asking for comparable quotes. Ask HomeTruth can help refine the scope. | Temporary job scope and checklist. No account needed until saving or adding private documents. |
| 2. Save against a home | Select a home or set one up. Return after sign-in to the same job draft. See available previous work or open actions for that property. | [Property], [Property Person], [Reminder / Task]. A job workspace and draft are proposed data contracts. Require an active relationship with permission to save. |
| 3. Compare and budget | Add quotes and compare scope, exclusions and unanswered questions from the documents. Open Budget Calculator if needed and save the estimate with the job. | [Document], [Property Document], [Evidence Source]. Store estimate inputs and assumptions with the draft job. Preserve the difference between quoted, invoiced and paid amounts. |
| 4. Close the job | Link the invoice, warranty and any certificate. Confirm what was completed and record a follow-up if relevant. | [Property Fact], [Evidence Source], [Reminder / Task]. Source claims retain the document and location. An invoice by itself does not confirm payment. |
| 5. Revisit the work | Open the job from work history, recover the decision from Notebooks and find original documents in Vault. | Authorised property context applies to history, documents and reminders. Keep the earlier quotes and decisions linked when evidence is added. |

On a failed upload or save, keep the draft and indicate which part needs retrying. If an exclusion is unclear, raise a follow-up instead of assuming coverage. After a failed or cancelled sign-in, the draft remains available for the current visit.

**Review check.** Scope a repair without signing in, resume it on the right home, compare two sources, save a budget assumption and find the invoice and warranty from the history. Cross-property evidence and private notes must never leak into another selected home.

[Property]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#property
[Property Person]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#property-person
[Document]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#document
[Property Document]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#property-document
[Evidence Source]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#evidence-source
[Property Fact]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#property-fact
[Reminder / Task]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#reminder--task
