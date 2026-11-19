# HT-FLOW-001 · First answer to home record

| Field | Value |
| --- | --- |
| Version | 1.0 |
| Date | 18 November 2026 |
| Status | Implemented on the feature branch for localhost review |
| Delivery | HT-348 · `feature/ht-348-homepage-components` |
| User outcome | Get a useful answer, start or return to a home record, and reopen the original conversation. |

The COWORK onboarding decision flow supplies the intent-led journey and sign-in boundary. The [domain model][domain] supplies the shared property and people vocabulary. The [ontology reference](#ontology) points to implemented entities.

| Step and screen | Data needed at this step | What carries forward and where it belongs |
| --- | --- | --- |
| **1. Choose a route and ask** on [Homepage](../../src/pages/Homepage.jsx) | Buying, Improving or Selling selects the example question. Submit a typed or example question. After the first request the app can send the existing guest session ID. Address, account and property relationship are optional for a general question. | The route is journey context in the browser. The request sends the question and optional session ID to `POST /api/ai_chat/anonymous`. The server holds the question and reply in [GuestChatSession][guest]. |
| **2. Read the answer and choose Start a home record** in [Journey](../../src/components/homepage/Journey.jsx) | A successful reply and, for continuity, its guest session ID. | The record panel opens beneath the answer. Choosing account creation or login stores only the guest session ID in the current tab for this handoff. The question stays in the chat service. No property is created at this step. |
| **3. Create an account or log in** through [Register](../../src/pages/Register.jsx), [Login](../../src/pages/Login.jsx) and [Welcome](../../src/pages/WelcomePage.jsx) | Login uses email and password. Registration uses name, email, password and confirmation. Its address field is optional. The home-record destination and guest session ID carry through the handoff when available. | Authenticate the [Person / User][person]. Returning users go to Property profile. New accounts go there after the welcome step. The protected profile uses `POST /api/ai_chat/claim-guest-session` to move the guest conversation into that user's [ChatHistory][history]. |
| **4. Set up your property** on [Property profile](../../src/pages/PropertyProfile.jsx) | Address line 1 and a deliberately chosen relationship are required. Address line 2, town, county and postcode are optional. Country defaults to GB, and property type and tenure can remain unknown. | `POST /api/property-records` uses the signed-in user and writes [Property][property], [Property Address][address] and [Property Person][relationship] together. The [service contract][record-service] records the chosen relationship as user-confirmed, with an active primary role and record-level admin permission for the creator. The Buying route is an intent, so the form begins with **Choose your relationship**. Users with a record can return to it. |
| **5. Continue your homepage question** in [Ask HomeTruth](../../src/pages/AskAI.jsx) | The authenticated conversation ID returned by the claim. No extra property fields or document are needed to reopen it. | Open the specific conversation with `GET /api/ai_chat/history`. Chat remains scoped to the signed-in user. The property page offers a direct link after the claim. The conversation also appears in Ask HomeTruth history for later visits. If a claim is later added to a home as a [Property Fact][fact], it needs an [Evidence Source][evidence] and provenance. Reopening a reply does not perform that write. |

## Design system references

- Steps 1–2 use the [homepage and answer patterns](/admin/design-system/reference#homepage-journey) for the question routes, delivery and record handoff.
- Steps 3–5 use [components](/admin/design-system/reference#components) for form fields and actions, [navigation](/admin/design-system/reference#navigation) for record and conversation destinations, and [states and statuses](/admin/design-system/reference#states) for feedback.
- Review the [ontology reference](/admin/user-flows#ontology) when a screen adds a new data requirement, relationship or permission.

## Failure and access states

- A failed answer can be retried without entering an address. When guest questions are unavailable, the interface can still offer the account handoff.
- A failed sign-in keeps the user in the login form. The property profile requires authentication. Its property list is scoped by the person's active property relationships in the [record service][record-service].
- A missing relationship blocks form submission. The server also validates the allowed relationship values. Address and other selections stay in place while the user corrects a validation error.
- A failed guest claim leaves property setup available and shows a message about the answer. The return link appears once a conversation ID has been received.
- Starting this record does not grant access to a partner. Partner access follows the separate consent and permissions contract.

## Acceptance

- A guest can get a first answer without supplying an address.
- A returning user who enters through the home-record handoff lands on Property profile. A new user reaches it after onboarding.
- The setup form has no preselected relationship. No create request is sent until a valid relationship is chosen. The request carries the selected value, including Buyer.
- The original question and answer open from Property profile after a successful claim. Saving a home record is independent of reopening the answer.

## Version history

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 18 November 2026 | First blueprint. Mapped the guest-to-record flow to existing contracts and required explicit relationship selection. |

[domain]: <https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md>
[person]: <https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#person--user>
[property]: <https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#property>
[address]: <https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#property-address>
[relationship]: <https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#property-person>
[fact]: <https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#property-fact>
[evidence]: <https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md#evidence-source>
[guest]: <https://github.com/jasonlryan/HomeTruth-be/blob/0e0969035eb4c8afae1f2a014ea3d605038f7fb0/models/guestChatSession.js>
[history]: <https://github.com/jasonlryan/HomeTruth-be/blob/0e0969035eb4c8afae1f2a014ea3d605038f7fb0/models/chatHistory.js>
[record-service]: <https://github.com/jasonlryan/HomeTruth-be/blob/0e0969035eb4c8afae1f2a014ea3d605038f7fb0/services/propertyRecordService.js>
