# HT-FLOW-002 · Buying a home

**Version 0.1 · 18 November 2026 · Proposed for review · HT-349**

Help a buyer decide what to check before committing and carry useful evidence into ownership.

| Step | Customer action and result | Data and access |
| --- | --- | --- |
| 1. Choose a stage | Choose Getting started, Going to a viewing, or Reviewing a survey. At a viewing, get a short checklist and room to add a question. Ask HomeTruth is available alongside the checklist. | Stage and draft checklist are temporary. No address or account required. |
| 2. Keep the shortlist | Save a checklist against an address when the buyer wants to return. After sign-in, resume the same stage and checklist. Offer a matching record the customer can already access before creating another. | [Person], [Property], [Property Address] and [Property Person]. Ask the customer to confirm Buyer. A home address alone grants no access to other records. |
| 3. Read the survey | Add an authorised survey to Vault. Review a finding, open the passage that supports it and note what still needs checking. | [Document], [Property Document] and [Evidence Source] with page or location. A survey observation and an independently verified [Property Fact] have different status. A document stays private to authorised users. |
| 4. Decide what to follow up | Keep a viewing observation in Notebooks or save a question to ask the surveyor as a next action. Reopen it from the selected home record. | [Reminder / Task] with property, source, owner and status. Notes and drafts should retain the chosen property. Save explicitly and show confirmation. |
| 5. Carry it into ownership | After purchase, confirm the relationship change. Reopen the same survey, history and outstanding actions from the home record. | [Property Person] lifecycle and permissions. Preserve history. A completed step or signed-in session never changes the relationship by itself. |

If sign-in is cancelled, return to the draft in the same visit. If a passage cannot be opened, show the document and identify the missing locator. A missing survey leaves the viewing checklist and general help available. Avoid logging or putting private document content in return URLs.

**Review check.** Start a viewing checklist as a guest, resume it after sign-in, open a survey passage, save a follow-up, reopen it and confirm the role change without losing prior evidence. Review only. The prototype does not implement new persistence or access grants.

[Person]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#person--user
[Property]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#property
[Property Address]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#property-address
[Property Person]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#property-person
[Document]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#document
[Property Document]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#property-document
[Evidence Source]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#evidence-source
[Property Fact]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#property-fact
[Reminder / Task]: https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#reminder--task
