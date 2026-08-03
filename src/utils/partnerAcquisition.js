const ACQUISITION_SCOPES = new Set([
  "hometruth_processing",
  "aggregate_analytics",
  "partner_reporting",
  "partner_contact_servicing",
]);

export const FALLBACK_CONSENT_SCOPES = [
  {
    scope: "hometruth_processing",
    required: true,
    label: "Use HomeTruth for your home",
    summary: "Allows HomeTruth to create and manage the home record you choose to build.",
  },
  {
    scope: "aggregate_analytics",
    required: false,
    label: "Include my use in aggregate programme analytics",
    summary: "Allows de-identified activity to contribute to grouped programme measures.",
  },
  {
    scope: "partner_reporting",
    required: false,
    label: "Include my progress in aggregate partner reporting",
    summary: "Allows activity to contribute to thresholded totals shared with the sponsor.",
  },
  {
    scope: "partner_contact_servicing",
    required: false,
    label: "Allow programme follow-up from the partner",
    summary: "Allows programme contact without granting access to your HomeTruth records.",
  },
];

export const consentDefinitionsFromInvite = (inviteData = {}) => {
  const supplied = inviteData.consentContract?.scopes;
  if (!Array.isArray(supplied)) return FALLBACK_CONSENT_SCOPES;
  const suppliedByScope = new Map(
    supplied
      .filter(
        (definition) =>
          definition &&
          ACQUISITION_SCOPES.has(definition.scope) &&
          typeof definition.label === "string" &&
          typeof definition.summary === "string"
      )
      .map((definition) => [definition.scope, definition])
  );
  if (suppliedByScope.size !== FALLBACK_CONSENT_SCOPES.length) {
    return FALLBACK_CONSENT_SCOPES;
  }
  return FALLBACK_CONSENT_SCOPES.map((fallback) => ({
    ...suppliedByScope.get(fallback.scope),
    required: fallback.required,
  }));
};

export const initialConsentChoices = (definitions, consentState = null) =>
  definitions.reduce((choices, definition) => {
    choices[definition.scope] = Boolean(consentState?.choices?.[definition.scope]);
    return choices;
  }, {});

export const validateConsentChoices = (definitions, choices) =>
  definitions
    .filter(({ required }) => required)
    .reduce((errors, definition) => {
      if (!choices[definition.scope]) {
        errors[definition.scope] = "Choose this required permission to continue.";
      }
      return errors;
    }, {});

export const buildConsentPayload = (definitions, choices) =>
  definitions.map(({ scope }) => ({ scope, granted: Boolean(choices[scope]) }));

export const acquisitionContentFromInvite = (inviteData = {}) => {
  const acquisition = inviteData.acquisition || inviteData.branding || {};
  return {
    eyebrow: acquisition.eyebrow || "A HomeTruth partner programme",
    headline:
      acquisition.headline || "Everything about your home, clearer and easier to manage",
    homeownerPromise:
      acquisition.homeownerPromise ||
      "Build a useful record of your home, understand important documents and keep practical actions in one place.",
    setupExpectations:
      Array.isArray(acquisition.setupExpectations) && acquisition.setupExpectations.length
        ? acquisition.setupExpectations
        : [
            "Create or sign in to your HomeTruth account",
            "Choose the programme permissions you want to grant",
            "Connect an existing property or start a new home record",
          ],
    privacySummary:
      acquisition.privacySummary ||
      "Your HomeTruth record stays under your control. The partner receives no individual property, document or task data through this journey.",
    support: {
      label: acquisition.support?.label || "Get help from HomeTruth",
      url: acquisition.support?.url || "/faq",
    },
    partnerLogo: acquisition.partnerLogo?.url ? acquisition.partnerLogo : null,
    partnerName: acquisition.partnerName || inviteData.partner?.name || null,
    partnerType: acquisition.partnerType || inviteData.partner?.partnerType || null,
    programmeName: acquisition.programmeName || inviteData.programme?.name || null,
    campaignName: acquisition.campaignName || inviteData.campaign?.name || null,
    cohortName: acquisition.cohortName || inviteData.cohort?.name || null,
  };
};

export const statusPresentation = (status) =>
  ({
    invalid: {
      eyebrow: "Invitation not recognised",
      title: "This invitation is not available",
      body: "Check the link you received or ask the programme support team for a new invitation.",
    },
    expired: {
      eyebrow: "Invitation expired",
      title: "This programme invitation has ended",
      body: "Your HomeTruth account remains independent. Contact programme support if you expected to take part.",
    },
    already_used: {
      eyebrow: "Invitation already used",
      title: "This personal invitation has already been claimed",
      body: "Sign in with the account that originally used it, or contact programme support for help.",
    },
    ineligible: {
      eyebrow: "Programme unavailable",
      title: "This programme is not accepting onboarding",
      body: "It may be paused or closed. Your existing HomeTruth records are unaffected.",
    },
  }[status] || {
    eyebrow: "Invitation unavailable",
    title: "We could not open this invitation",
    body: "Try again or contact HomeTruth support.",
  });

export const storedInviteContext = (inviteCode, inviteData = {}) => ({
  inviteCode,
  partnerName: inviteData.partner?.name || inviteData.acquisition?.partnerName || null,
  programmeKey: inviteData.programme?.programmeKey || null,
  campaignKey: inviteData.campaign?.campaignKey || null,
  cohortKey: inviteData.cohort?.cohortKey || null,
});
