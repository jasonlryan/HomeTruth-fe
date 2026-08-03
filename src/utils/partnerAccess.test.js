import {
  buildAccessGrantPayload,
  capabilityLabel,
  programmeAccessState,
  roleLabel,
  validateAccessGrant,
} from "./partnerAccess";

describe("partner access utilities", () => {
  test("normalizes an operator grant without adding browser scope", () => {
    expect(
      buildAccessGrantPayload({ userEmail: " Partner@example.com ", role: "analyst" })
    ).toEqual({ userEmail: "partner@example.com", role: "analyst" });
  });

  test("validates the exact email and governed role contract", () => {
    expect(validateAccessGrant({ userEmail: "bad", role: "owner" })).toEqual({
      userEmail: "Enter the verified HomeTruth account email.",
      role: "Choose a governed partner role.",
    });
  });

  test("presents active and lifecycle-blocked access safely", () => {
    expect(
      programmeAccessState({
        assignmentStatus: "active",
        partner: { status: "active" },
        programme: { status: "active" },
      })
    ).toMatchObject({ key: "active", operational: true });
    expect(
      programmeAccessState({
        assignmentStatus: "active",
        partner: { status: "active" },
        programme: { status: "paused" },
      })
    ).toMatchObject({ key: "paused", operational: false });
  });

  test("uses comprehensible role and capability labels", () => {
    expect(roleLabel("privacy_auditor")).toBe("Privacy auditor");
    expect(capabilityLabel("audit:view")).toBe("Access audit");
  });
});
