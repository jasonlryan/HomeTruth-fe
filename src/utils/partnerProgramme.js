export const PARTNER_TYPES = [
  { value: "insurer", label: "Insurer" },
  { value: "mortgage_provider", label: "Mortgage provider" },
  { value: "home_developer", label: "Home developer" },
  { value: "other", label: "Other B2B client" },
];

export const INVITE_MODES = [
  { value: "cohort_code", label: "Shared cohort code" },
  { value: "individual_invite", label: "Individual invite codes" },
  { value: "both", label: "Shared and individual invites" },
];

export const INITIAL_PROGRAMME_FORM = {
  partnerMode: "new",
  partnerId: "",
  partnerName: "",
  partnerType: "other",
  partnerExternalRef: "",
  programmeName: "",
  programmeKey: "",
  programmeStartDate: "",
  programmeEndDate: "",
  inviteMode: "cohort_code",
  entitlementPack: "shared_core",
  participantLimit: "",
  approvedContentRefs: "",
  campaignName: "",
  campaignKey: "",
  inviteRoute: "",
  campaignContentRef: "",
  acquisitionEyebrow: "A HomeTruth partner programme",
  acquisitionHeadline: "Everything about your home, clearer and easier to manage",
  homeownerPromise:
    "Build a useful record of your home, understand important documents and keep practical actions in one place.",
  setupExpectations:
    "Create or sign in to your HomeTruth account\nChoose the programme permissions you want to grant\nConnect an existing property or start a new home record",
  privacySummary:
    "Your HomeTruth record stays under your control. The partner receives no individual property, document or task data through this journey.",
  supportLabel: "Get help from HomeTruth",
  supportUrl: "/faq",
  partnerLogoUrl: "",
  partnerLogoAlt: "",
  consentVersion: "partner-acquisition-v1",
  campaignStartDate: "",
  campaignEndDate: "",
  cohortName: "",
  cohortKey: "",
  targetSize: "",
  cohortStartDate: "",
  cohortEndDate: "",
};

export const nextProgrammeStatuses = (status) =>
  ({
    draft: ["active", "closed"],
    active: ["paused", "closed"],
    paused: ["active", "closed"],
    closed: [],
  }[status] || []);

export const programmeStatusLabel = (status) =>
  ({ draft: "Draft", active: "Active", paused: "Paused", closed: "Closed" }[
    status
  ] || status);

const required = (value) => typeof value === "string" && value.trim().length > 0;

const invalidDateRange = (start, end) => start && end && start > end;

export const validateProgrammeForm = (form) => {
  const errors = {};
  if (form.partnerMode === "existing") {
    if (!required(form.partnerId)) errors.partnerId = "Choose an existing partner.";
  } else if (!required(form.partnerName)) {
    errors.partnerName = "Enter the partner name.";
  }

  for (const [field, message] of [
    ["programmeName", "Enter the programme name."],
    ["programmeKey", "Enter a stable programme key."],
    ["campaignName", "Enter the campaign name."],
    ["campaignKey", "Enter a stable campaign key."],
    ["acquisitionHeadline", "Enter the approved homeowner headline."],
    ["homeownerPromise", "Enter the approved homeowner promise."],
    ["privacySummary", "Enter the approved privacy summary."],
    ["supportLabel", "Enter a support link label."],
    ["supportUrl", "Enter an approved support route."],
    ["consentVersion", "Enter a consent contract version."],
    ["cohortName", "Enter the cohort name."],
    ["cohortKey", "Enter a unique cohort key."],
  ]) {
    if (!required(form[field])) errors[field] = message;
  }

  if (required(form.partnerLogoUrl) && !required(form.partnerLogoAlt)) {
    errors.partnerLogoAlt = "Describe the approved partner logo.";
  }

  if (form.targetSize && (!Number.isInteger(Number(form.targetSize)) || Number(form.targetSize) < 1)) {
    errors.targetSize = "Target size must be a positive whole number.";
  }
  if (
    form.participantLimit &&
    (!Number.isInteger(Number(form.participantLimit)) || Number(form.participantLimit) < 1)
  ) {
    errors.participantLimit = "Participant limit must be a positive whole number.";
  }
  if (invalidDateRange(form.programmeStartDate, form.programmeEndDate)) {
    errors.programmeEndDate = "Programme end date must follow its start date.";
  }
  if (invalidDateRange(form.campaignStartDate, form.campaignEndDate)) {
    errors.campaignEndDate = "Campaign end date must follow its start date.";
  }
  if (invalidDateRange(form.cohortStartDate, form.cohortEndDate)) {
    errors.cohortEndDate = "Cohort end date must follow its start date.";
  }
  return errors;
};

const commaSeparated = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const lineSeparated = (value) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const optionalDate = (value) => value || null;

export const buildProgrammePayload = (form) => ({
  ...(form.partnerMode === "existing"
    ? { partnerId: Number(form.partnerId) }
    : {
        partner: {
          name: form.partnerName.trim(),
          partnerType: form.partnerType,
          externalRef: form.partnerExternalRef.trim() || null,
        },
      }),
  programmeKey: form.programmeKey.trim(),
  name: form.programmeName.trim(),
  startDate: optionalDate(form.programmeStartDate),
  endDate: optionalDate(form.programmeEndDate),
  entitlement: {
    pack: form.entitlementPack.trim() || "shared_core",
    ...(form.participantLimit ? { participantLimit: Number(form.participantLimit) } : {}),
  },
  inviteMode: form.inviteMode,
  approvedContentRefs: commaSeparated(form.approvedContentRefs),
  campaign: {
    campaignKey: form.campaignKey.trim(),
    name: form.campaignName.trim(),
    inviteRoute: form.inviteRoute.trim() || null,
    approvedContentRef: form.campaignContentRef.trim() || null,
    acquisitionConfig: {
      eyebrow: form.acquisitionEyebrow.trim() || "A HomeTruth partner programme",
      headline: form.acquisitionHeadline.trim(),
      homeownerPromise: form.homeownerPromise.trim(),
      setupExpectations: lineSeparated(form.setupExpectations),
      privacySummary: form.privacySummary.trim(),
      support: {
        label: form.supportLabel.trim(),
        url: form.supportUrl.trim(),
      },
      partnerLogo: form.partnerLogoUrl.trim()
        ? {
            url: form.partnerLogoUrl.trim(),
            alt: form.partnerLogoAlt.trim() || `${form.partnerName.trim() || "Partner"} logo`,
          }
        : null,
    },
    consentConfig: { version: form.consentVersion.trim() },
    startDate: optionalDate(form.campaignStartDate),
    endDate: optionalDate(form.campaignEndDate),
  },
  cohort: {
    cohortKey: form.cohortKey.trim(),
    name: form.cohortName.trim(),
    targetSize: form.targetSize ? Number(form.targetSize) : null,
    startDate: optionalDate(form.cohortStartDate),
    endDate: optionalDate(form.cohortEndDate),
  },
});
