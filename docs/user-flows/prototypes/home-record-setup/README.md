# HT-FLOW-001 · Signed-in home record setup proposal

**Status:** Proposed for review. **Version:** 0.1 · 18 November 2026.

Open the [localhost prototype](http://localhost:3000/prototypes/home-record-setup/index.html). The interactive prototype and its on-page specification use [HT-FLOW-001](../../HT-FLOW-001.md), the [design-system catalogue](http://localhost:3000/admin/design-system/index.html) and the [admin ontology reference](http://localhost:3000/admin/user-flows#ontology). The scenario selector is a review control. The prototype uses sample data in memory.

The app layout, APIs, authentication and record permissions are outside this proposal change. The frontend dev server exposes this folder through a local symlink at `public/prototypes/home-record-setup`. Keep that symlink local for review.

## Review points

- Ask for address line 1 and a deliberate relationship on the first screen. Keep postcode visible and optional, with the other supported fields under Additional property details.
- Put the recovered homepage question beside the setup form. Users can reopen it before or after saving, and return to the form in the same visit.
- Use the purple record action from the account handoff. Use the established navigation, field, focus and status styles. On mobile, place the recovered question above the form so it remains easy to find.
- Check an existing record, a recoverable save failure and a failed answer recovery using the scenario selector.
