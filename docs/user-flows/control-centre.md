# Home Control centre

**Version 0.3 · 19 November 2026 · First implementation · HT-349**

The Control centre is the overview of the selected home. It answers what is coming up, what requires attention, and where to resume. It shows a short list of actionable records and links to the place where each is managed. Prioritise overdue and dated items. Place undated follow-ups under Needs attention. Label source dates and distinguish confirmed bookings, estimated dates and outstanding checks.

| Show in the Control centre | Open for detail | Domain and taxonomy |
| --- | --- | --- |
| Upcoming service, known deadline or expiry | Maintenance and repairs, item record, or relevant evidence | Maintenance Event, Compliance Record, Reminder / Task. A confirmed event must have supporting evidence or an explicit customer confirmation. |
| Follow-up from a survey | Vault → survey → exact passage | The survey is a Document linked by Property Document. The passage is an Evidence Source. The follow-up is a Reminder / Task. Show uncertainty when an observation remains unverified. |
| Quick access to an appliance or a manual relevant to the next action | Appliances and devices → physical item → model-matched manual | Physical item, product model, and evidence association from the Manage my home taxonomy. A saved manual can also appear in Vault. |
| An actionable connected-device or source freshness issue | Device record for available readings. Settings → Connections for provider access, scope and disconnect. | Provider, Connector, Connection, Connected item and Sync from the taxonomy. A connection grants only the authorised capabilities. Read access and permission to change a device are separate. |
| Resume a buying, improvement or selling task | The originating workspace with its selected home and evidence | Property, Property Person, and task-specific draft. Before a home exists, offer to resume or set up the record without fabricating data. |

Use the [branch preview](/workspace-preview) to open a survey from Vault, inspect its source, save a follow-up and see it in Needs attention. The example is a home after purchase, with one booked service and a stale example meter connection. The preview uses fixed samples and in-memory state. Live provider connections, sharing and new persistence require separate review.

## Selected-home implementation

The signed-in route is `/control-centre`. A Property Person relationship determines which homes appear. Read access permits viewing that home's open items. Contribute access or higher permits saving a follow-up. A follow-up is a Reminder / Task with an optional due date, assigned user and an audited status.

Upcoming events shows saved dates for the selected home, including service and expiry reminders already recorded against it. A source date to check has its own label. Overdue items and undated follow-ups appear under Needs attention. Existing document reminders link to the Vault where a document ID is available, and other generated items point to the next-actions section of the home record. The dated items in this slice are reminders. Confirmed calendar bookings, recurring work and connected devices are follow-on work.

## Save a survey passage

In Vault, open a text-readable PDF and choose **Passages**. Select text on a page and save a follow-up to a home you can contribute to. The save links the Property Document, records the validated page and text range as an Evidence Source, and creates the Reminder / Task together. **Open survey passage** in the Control centre returns to that exact range if the source is still available and unchanged. Vault continues to require access to the underlying private document. If the source is removed or changes, the follow-up remains usable.

Sources: [HomeTruth domain model](https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md), Manage my home taxonomy (Developer product docs), COWORK working strategy STR-003, and HT-FLOW-002 through HT-FLOW-004.
