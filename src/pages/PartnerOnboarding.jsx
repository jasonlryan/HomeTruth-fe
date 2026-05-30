import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Home,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  attachPartnerOnboardingProperty,
  claimPartnerInvite,
  emitPartnerOnboardingEvent,
  getPropertyRecords,
  recordPartnerConsents,
  validatePartnerInvite,
} from "../api/api";
import { useAuth } from "../context/AuthContext";

const consentDefinitions = [
  {
    scope: "hometruth_processing",
    label: "HomeTruth processing",
    body: "Required to create and manage your HomeTruth property record.",
    required: true,
  },
  {
    scope: "partner_reporting",
    label: "Partner reporting",
    body: "Required for pilot reporting under the partner agreement.",
    required: true,
  },
  {
    scope: "aggregate_analytics",
    label: "Aggregate analytics",
    body: "Required for anonymised cohort-level pilot analysis.",
    required: true,
  },
  {
    scope: "individual_report_access",
    label: "Individual report access",
    body: "Optional consent for individual-level partner report access.",
    required: false,
  },
  {
    scope: "partner_contact_servicing",
    label: "Partner contact and servicing",
    body: "Optional consent for partner follow-up about the pilot.",
    required: false,
  },
];

const statusMessages = {
  invalid: "This invite code was not recognised.",
  expired: "This invite has expired.",
  already_used: "This invite has already been used.",
  ineligible: "This pilot is not currently accepting onboarding.",
};

const setStoredInvite = (inviteCode, data = {}) => {
  localStorage.setItem("partner_invite_code", inviteCode);
  localStorage.setItem(
    "partner_onboarding_context",
    JSON.stringify({
      inviteCode,
      partnerName: data.partner?.name || data.branding?.partnerName || null,
      cohortName: data.cohort?.name || data.branding?.cohortName || null,
      memberId: data.member?.id || null,
    })
  );
};

const getStoredConsentDefaults = () =>
  consentDefinitions.reduce((acc, consent) => {
    acc[consent.scope] = consent.required;
    return acc;
  }, {});

function StatePanel({ icon: Icon, title, body }) {
  return (
    <section className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface-default))] text-[var(--color-accent)]">
          <Icon size={18} aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-base font-normal text-[var(--color-text-default)]">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            {body}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function PartnerOnboarding() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [inviteData, setInviteData] = useState(null);
  const [records, setRecords] = useState([]);
  const [consents, setConsents] = useState(getStoredConsentDefaults);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [consentSaved, setConsentSaved] = useState(
    () => localStorage.getItem(`partner_consent_${inviteCode}`) === "true"
  );
  const [error, setError] = useState("");

  const authQuery = useMemo(() => {
    const params = new URLSearchParams();
    params.set("partner_invite", inviteCode);
    params.set("redirect", `/partner/${inviteCode}`);
    return params.toString();
  }, [inviteCode]);

  const validInvite = inviteData?.invite?.status === "valid";
  const partnerName =
    inviteData?.branding?.partnerName ||
    inviteData?.partner?.name ||
    "your partner";
  const cohortName =
    inviteData?.branding?.cohortName || inviteData?.cohort?.name || "pilot";

  const loadInvite = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await validatePartnerInvite(inviteCode);
      setInviteData(data);
      if (data?.invite?.status === "valid") {
        setStoredInvite(inviteCode, data);
      }
      await emitPartnerOnboardingEvent("invite_viewed", inviteCode, {
        status: data?.invite?.status,
        mode: data?.invite?.mode,
      });
    } catch (loadError) {
      setError(
        loadError.response?.data?.message || "Invite could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, [inviteCode]);

  useEffect(() => {
    loadInvite();
  }, [loadInvite]);

  useEffect(() => {
    const hydrateAuthenticatedContext = async () => {
      if (!user || !validInvite) return;

      try {
        setClaiming(true);
        const claimed = await claimPartnerInvite(inviteCode);
        setInviteData(claimed);
        setStoredInvite(inviteCode, claimed);
        const propertyRecords = await getPropertyRecords();
        setRecords(Array.isArray(propertyRecords) ? propertyRecords : []);
      } catch (claimError) {
        setError(
          claimError.response?.data?.message ||
            "Partner onboarding could not be started."
        );
      } finally {
        setClaiming(false);
      }
    };

    hydrateAuthenticatedContext();
  }, [consentSaved, inviteCode, user, validInvite]);

  const handleConsentChange = (scope) => {
    const definition = consentDefinitions.find((item) => item.scope === scope);
    if (definition?.required) return;

    setConsents((current) => ({
      ...current,
      [scope]: !current[scope],
    }));
  };

  const handleConsentSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setClaiming(true);
      const payload = consentDefinitions.map((definition) => ({
        scope: definition.scope,
        granted: Boolean(consents[definition.scope]),
      }));
      const saved = await recordPartnerConsents(inviteCode, payload);
      setInviteData(saved);
      setStoredInvite(inviteCode, saved);
      localStorage.setItem(`partner_consent_${inviteCode}`, "true");
      setConsentSaved(true);
      await emitPartnerOnboardingEvent("consent_granted", inviteCode, {
        requiredScopes: payload
          .filter((consent) => consent.granted)
          .map((consent) => consent.scope),
      });
    } catch (saveError) {
      setError(
        saveError.response?.data?.message || "Consent could not be recorded."
      );
    } finally {
      setClaiming(false);
    }
  };

  const startPropertySetup = async () => {
    setStoredInvite(inviteCode, inviteData);
    await emitPartnerOnboardingEvent("property_started", inviteCode, {
      path: "new_property",
    });
    navigate(`/property-profile?partner_invite=${encodeURIComponent(inviteCode)}`);
  };

  const attachExistingProperty = async (record) => {
    try {
      setClaiming(true);
      const attached = await attachPartnerOnboardingProperty(
        inviteCode,
        record.property.id
      );
      setInviteData(attached);
      setStoredInvite(inviteCode, attached);
      await emitPartnerOnboardingEvent("property_completed", inviteCode, {
        propertyId: record.property.id,
        path: "existing_property",
      });
      navigate("/property-profile");
    } catch (attachError) {
      setError(
        attachError.response?.data?.message ||
          "Property could not be linked to this pilot."
      );
    } finally {
      setClaiming(false);
    }
  };

  if (loading || authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[color-mix(in_srgb,var(--color-surface-dark)_4%,var(--color-surface-default))] px-4 text-[var(--color-text-default)]">
        <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
          <Loader2 className="animate-spin" size={20} />
          <span>Checking invite</span>
        </div>
      </main>
    );
  }

  if (!validInvite) {
    const status = inviteData?.invite?.status || "invalid";
    return (
      <main className="min-h-screen bg-[color-mix(in_srgb,var(--color-surface-dark)_4%,var(--color-surface-default))] px-4 py-8 text-[var(--color-text-default)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-6">
          <AlertCircle className="text-[var(--color-action-primary)]" size={28} />
          <h1 className="mt-4 text-3xl font-normal tracking-normal">
            Invite unavailable
          </h1>
          <p className="mt-3 text-base leading-7 text-[var(--color-text-muted)]">
            {error || statusMessages[status] || statusMessages.invalid}
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-[var(--radius-md)] bg-[var(--color-action-primary)] px-5 py-3 text-[var(--color-text-on-dark)]"
          >
            Return to HomeTruth
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[color-mix(in_srgb,var(--color-surface-dark)_4%,var(--color-surface-default))] px-4 py-6 text-[var(--color-text-default)] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-[var(--color-border-default)] pb-6">
          <p className="text-sm text-[var(--color-secondary)]">
            {partnerName} pilot
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-normal tracking-normal sm:text-4xl">
                Set up HomeTruth for your home
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--color-text-muted)]">
                You are joining {cohortName}. HomeTruth will keep your property
                profile separate from ordinary insurance records unless you
                explicitly grant partner access.
              </p>
            </div>
            <img
              src="/assets/logo.png"
              alt="HomeTruth"
              className="h-12 w-auto object-contain"
            />
          </div>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-action-primary)] bg-[color-mix(in_srgb,var(--color-action-primary)_10%,var(--color-surface-default))] p-4 text-sm">
            <AlertCircle className="mt-0.5 flex-none text-[var(--color-action-primary)]" size={18} />
            <p>{error}</p>
          </div>
        )}

        <section className="grid gap-4 lg:grid-cols-3">
          <StatePanel
            icon={ShieldCheck}
            title="Invite confirmed"
            body={`${partnerName} introduced you to this HomeTruth pilot.`}
          />
          <StatePanel
            icon={ClipboardCheck}
            title="Consent controlled"
            body="Partner reporting and individual report access are recorded separately."
          />
          <StatePanel
            icon={Home}
            title="Property first"
            body="Your home profile is the record that documents, facts and actions attach to."
          />
        </section>

        {!user ? (
          <section className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-6">
            <h2 className="text-2xl font-normal">Continue with HomeTruth</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Sign in or create an account to attach this invite to your
              HomeTruth profile.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(`/login?${authQuery}`)}
                className="rounded-[var(--radius-md)] bg-[var(--color-action-primary)] px-5 py-3 text-[var(--color-text-on-dark)]"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => navigate(`/register?${authQuery}`)}
                className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-5 py-3 text-[var(--color-text-default)]"
              >
                Create account
              </button>
            </div>
          </section>
        ) : !consentSaved ? (
          <form
            onSubmit={handleConsentSubmit}
            className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-6"
          >
            <h2 className="text-2xl font-normal">Consent for this pilot</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">
              Required consent lets HomeTruth run the pilot and report at the
              agreed partner level. Optional consent can be changed later.
            </p>
            <div className="mt-6 grid gap-3">
              {consentDefinitions.map((definition) => (
                <label
                  key={definition.scope}
                  className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(consents[definition.scope])}
                    disabled={definition.required}
                    onChange={() => handleConsentChange(definition.scope)}
                    className="mt-1 h-4 w-4 accent-[var(--color-action-primary)]"
                  />
                  <span>
                    <span className="block text-base font-normal">
                      {definition.label}
                      {definition.required ? " required" : " optional"}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-[var(--color-text-muted)]">
                      {definition.body}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={claiming}
              className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-action-primary)] px-5 py-3 text-[var(--color-text-on-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {claiming && <Loader2 className="animate-spin" size={18} />}
              Continue
            </button>
          </form>
        ) : (
          <section className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 text-[var(--color-success)]" size={22} />
              <div>
                <h2 className="text-2xl font-normal">Consent recorded</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">
                  Next, connect the pilot to the property profile HomeTruth will
                  help you manage.
                </p>
              </div>
            </div>

            {records.length > 0 && (
              <div className="mt-6 grid gap-3">
                {records.map((record) => (
                  <button
                    key={record.property.id}
                    type="button"
                    onClick={() => attachExistingProperty(record)}
                    disabled={claiming}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4 text-left transition hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="block text-base font-normal">
                      Use {record.currentAddress?.addressLine1 || "this property"}
                    </span>
                    <span className="mt-1 block text-sm text-[var(--color-text-muted)]">
                      {[
                        record.currentAddress?.townCity,
                        record.currentAddress?.postcode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Property profile"}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={startPropertySetup}
              disabled={claiming}
              className="mt-6 rounded-[var(--radius-md)] bg-[var(--color-action-primary)] px-5 py-3 text-[var(--color-text-on-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Set up a property
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
