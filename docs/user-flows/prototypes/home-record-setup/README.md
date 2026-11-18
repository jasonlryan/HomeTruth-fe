# HT-FLOW-001 · Signed-in home record setup proposal

**Status:** Proposed for review. **Version:** 0.2 · 18 November 2026.

Open the [end-to-end localhost flow](http://localhost:3000/prototypes/home-record-setup/journey.html) or the [signed-in page-state prototype](http://localhost:3000/prototypes/home-record-setup/index.html). The interactive prototype and its on-page specification use [HT-FLOW-001](../../HT-FLOW-001.md), the [design-system catalogue](http://localhost:3000/admin/design-system/index.html) and the [admin ontology reference](http://localhost:3000/admin/user-flows#ontology). The scenario selector is a review control. The prototype uses sample data in memory.

The app layout, APIs, authentication and record permissions are outside this proposal change. The frontend dev server exposes this folder through a local symlink at `public/prototypes/home-record-setup`. Keep that symlink local for review.

## Review points

- Ask for address line 1 and a deliberate relationship on the first screen. Keep postcode visible and optional, with the other supported fields under Additional property details.
- Put the recovered homepage question beside the setup form. Users can reopen it before or after saving, and return to the form in the same visit.
- Use Cabin Regular for headings and Inter Regular for body copy, fields and buttons. Use the HomeTruth SVGs for navigation, actions, validation, select indicators and disclosure controls. Align icons next to text to the first-line baseline. Use the purple record action from the account handoff and the shared navigation, focus and status styles. On mobile, place the recovered question above the form so it remains easy to find.
- Check an existing record, a recoverable save failure and a failed answer recovery using the scenario selector.

## Review the flow

1. Choose Buying, Improving or Selling and ask the sample question. The selected sample, rather than a fixed Buying answer, follows into the signed-in screens.
2. From the answer, open Start a home record. Follow the returning-user path into a new or existing record, or follow the new-account path through its simulated welcome step.
3. Reopen the same question before saving, return to the draft, confirm the relationship, and save the record. Reopen the conversation again from the saved property.
4. Use Preview state to try a failed save or unavailable answer. The prototype uses known samples, simulated login and in-memory changes, with no backend calls.
