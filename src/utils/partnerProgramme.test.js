import {
  buildProgrammePayload,
  INITIAL_PROGRAMME_FORM,
  nextProgrammeStatuses,
  validateProgrammeForm,
} from "./partnerProgramme";

test("builds the shared programme contract for a mortgage provider", () => {
  const form = {
    ...INITIAL_PROGRAMME_FORM,
    partnerName: "Example Building Society",
    partnerType: "mortgage_provider",
    programmeName: "Completion support",
    programmeKey: "completion-support",
    campaignName: "Autumn completions",
    campaignKey: "autumn-completions",
    cohortName: "September cohort",
    cohortKey: "september-2026",
    targetSize: "250",
    participantLimit: "300",
    approvedContentRefs: "copy/homeowner-v1, copy/privacy-v2",
    acquisitionHeadline: "Understand your new home from day one",
    consentVersion: "completion-v1",
  };

  expect(validateProgrammeForm(form)).toEqual({});
  expect(buildProgrammePayload(form)).toMatchObject({
    partner: { partnerType: "mortgage_provider" },
    programmeKey: "completion-support",
    entitlement: { pack: "shared_core", participantLimit: 300 },
    approvedContentRefs: ["copy/homeowner-v1", "copy/privacy-v2"],
    campaign: {
      acquisitionConfig: {
        headline: "Understand your new home from day one",
        support: { url: "/faq" },
      },
      consentConfig: { version: "completion-v1" },
    },
    cohort: { targetSize: 250 },
  });
});

test("rejects incomplete configuration and inverted dates", () => {
  const errors = validateProgrammeForm({
    ...INITIAL_PROGRAMME_FORM,
    programmeStartDate: "2027-01-01",
    programmeEndDate: "2026-01-01",
  });

  expect(errors.partnerName).toBeTruthy();
  expect(errors.programmeName).toBeTruthy();
  expect(errors.campaignName).toBeTruthy();
  expect(errors.cohortName).toBeTruthy();
  expect(errors.programmeEndDate).toMatch(/follow/);
});

test("requires accessible alternative text for configured partner branding", () => {
  const errors = validateProgrammeForm({
    ...INITIAL_PROGRAMME_FORM,
    partnerId: "2",
    programmeName: "Completion support",
    programmeKey: "completion-support",
    campaignName: "Autumn completions",
    campaignKey: "autumn",
    cohortName: "September homeowners",
    cohortKey: "september",
    partnerLogoUrl: "https://example.com/approved-logo.svg",
    partnerLogoAlt: "",
  });

  expect(errors.partnerLogoAlt).toMatch(/Describe/);
});

test("exposes only valid lifecycle actions", () => {
  expect(nextProgrammeStatuses("draft")).toEqual(["active", "closed"]);
  expect(nextProgrammeStatuses("active")).toEqual(["paused", "closed"]);
  expect(nextProgrammeStatuses("paused")).toEqual(["active", "closed"]);
  expect(nextProgrammeStatuses("closed")).toEqual([]);
});
