export const PARTNER_ACCESS_ROLES = [
  { value: "sponsor", label: "Sponsor" },
  { value: "programme_manager", label: "Programme manager" },
  { value: "analyst", label: "Analyst" },
  { value: "privacy_auditor", label: "Privacy auditor" },
];

export const roleLabel = (role) =>
  PARTNER_ACCESS_ROLES.find((option) => option.value === role)?.label || role;

export const capabilityLabel = (capability) =>
  ({
    "programme:view": "Programme overview",
    "audit:view": "Access audit",
    "report:view": "Aggregate evidence",
    "report:export": "Aggregate export",
    "report:definitions:view": "Metric definitions",
  })[capability] || capability;

export const auditActorLabel = (actorType) =>
  ({
    hometruth_operator: "HomeTruth operator",
    partner_user: "Partner user",
  })[actorType] || "Unknown actor";

export const programmeAccessState = (entry) => {
  if (entry?.assignmentStatus !== "active") {
    return { key: "revoked", label: "Access revoked", operational: false };
  }
  if (entry?.partner?.status !== "active") {
    return { key: "partner_inactive", label: "Partner access paused", operational: false };
  }
  if (entry?.programme?.status !== "active") {
    return {
      key: entry?.programme?.status || "inactive",
      label:
        entry?.programme?.status === "paused"
          ? "Programme paused"
          : entry?.programme?.status === "closed"
            ? "Programme closed"
            : "Programme not active",
      operational: false,
    };
  }
  return { key: "active", label: "Active", operational: true };
};

export const validateAccessGrant = ({ userEmail = "", role = "" }) => {
  const errors = {};
  const email = userEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.userEmail = "Enter the verified HomeTruth account email.";
  }
  if (!PARTNER_ACCESS_ROLES.some((option) => option.value === role)) {
    errors.role = "Choose a governed partner role.";
  }
  return errors;
};

export const buildAccessGrantPayload = ({ userEmail, role }) => ({
  userEmail: userEmail.trim().toLowerCase(),
  role,
});
