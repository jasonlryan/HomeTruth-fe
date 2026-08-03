import {
  acquisitionContentFromInvite,
  buildConsentPayload,
  consentDefinitionsFromInvite,
  initialConsentChoices,
  statusPresentation,
  storedInviteContext,
  validateConsentChoices,
} from "./partnerAcquisition";

const invite = {
  partner: { name: "Hearthside Building Society", partnerType: "mortgage_provider" },
  programme: { programmeKey: "completion-support", name: "Completion support" },
  campaign: { campaignKey: "autumn", name: "Autumn completions" },
  cohort: { cohortKey: "september", name: "September homeowners" },
  acquisition: {
    headline: "Make your new home easier to understand",
    partnerName: "Hearthside Building Society",
    setupExpectations: ["Choose permissions", "Connect your home"],
  },
  consentContract: {
    version: "completion-v1",
    scopes: [
      { scope: "hometruth_processing", required: true, label: "Use HomeTruth", summary: "Required" },
      { scope: "aggregate_analytics", required: false, label: "Analytics", summary: "Optional" },
      { scope: "partner_reporting", required: false, label: "Reporting", summary: "Optional" },
      { scope: "partner_contact_servicing", required: false, label: "Contact", summary: "Optional" },
    ],
  },
};

test("uses configured acquisition content for a shared mortgage-provider programme", () => {
  expect(acquisitionContentFromInvite(invite)).toMatchObject({
    headline: "Make your new home easier to understand",
    partnerName: "Hearthside Building Society",
    programmeName: "Completion support",
  });
  expect(storedInviteContext("opaque-code", invite)).toEqual({
    inviteCode: "opaque-code",
    partnerName: "Hearthside Building Society",
    programmeKey: "completion-support",
    campaignKey: "autumn",
    cohortKey: "september",
  });
});

test("keeps every partner-facing permission optional and off by default", () => {
  const definitions = consentDefinitionsFromInvite(invite);
  const choices = initialConsentChoices(definitions);
  expect(choices).toEqual({
    hometruth_processing: false,
    aggregate_analytics: false,
    partner_reporting: false,
    partner_contact_servicing: false,
  });
  expect(validateConsentChoices(definitions, choices)).toHaveProperty(
    "hometruth_processing"
  );

  choices.hometruth_processing = true;
  expect(validateConsentChoices(definitions, choices)).toEqual({});
  expect(buildConsentPayload(definitions, choices)).toEqual([
    { scope: "hometruth_processing", granted: true },
    { scope: "aggregate_analytics", granted: false },
    { scope: "partner_reporting", granted: false },
    { scope: "partner_contact_servicing", granted: false },
  ]);
});

test("preserves the fixed required boundary when scope metadata is reordered", () => {
  const definitions = consentDefinitionsFromInvite({
    consentContract: {
      scopes: [...invite.consentContract.scopes]
        .reverse()
        .map((definition) => ({ ...definition, required: false })),
    },
  });
  expect(definitions.map(({ scope }) => scope)).toEqual([
    "hometruth_processing",
    "aggregate_analytics",
    "partner_reporting",
    "partner_contact_servicing",
  ]);
  expect(definitions[0].required).toBe(true);
  expect(definitions.slice(1).every(({ required }) => required === false)).toBe(true);
});

test("provides safe lifecycle status presentation without partner data", () => {
  expect(statusPresentation("expired").title).toMatch(/ended/);
  expect(statusPresentation("ineligible").body).toMatch(/paused or closed/);
});
