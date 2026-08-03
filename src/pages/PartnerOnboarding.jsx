import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  Home,
  LifeBuoy,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  attachPartnerOnboardingProperty,
  claimPartnerInvite,
  emitPartnerOnboardingEvent,
  getPropertyRecords,
  recordPartnerConsents,
  recordPartnerInviteView,
  validatePartnerInvite,
} from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  acquisitionContentFromInvite,
  buildConsentPayload,
  consentDefinitionsFromInvite,
  initialConsentChoices,
  statusPresentation,
  storedInviteContext,
  validateConsentChoices,
} from "../utils/partnerAcquisition";

const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-action-primary)] px-5 py-3 text-[var(--color-text-on-dark)] transition hover:bg-[var(--color-action-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-action-primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-5 py-3 text-[var(--color-text-default)] transition hover:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2";
const surface =
  "rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)]";

const setStoredInvite = (inviteCode, data) => {
  localStorage.setItem("partner_invite_code", inviteCode);
  localStorage.setItem(
    "partner_onboarding_context",
    JSON.stringify(storedInviteContext(inviteCode, data))
  );
};

function PrivacyBoundary({ summary }) {
  return (
    <section className={`${surface} p-5 sm:p-6`} aria-labelledby="privacy-boundary-title">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-success)_12%,var(--color-surface-default))] text-[var(--color-success)]">
          <LockKeyhole size={21} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold text-[var(--color-success)]">Your record stays yours</p>
          <h2 id="privacy-boundary-title" className="mt-1 text-xl font-bold text-[var(--color-text-default)]">
            Partner sponsorship does not mean partner access
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">
            {summary}
          </p>
        </div>
      </div>
    </section>
  );
}

function ConsentChoice({ definition, checked, error, onChange }) {
  const descriptionId = `consent-${definition.scope}-description`;
  const errorId = `consent-${definition.scope}-error`;
  return (
    <label
      className={`block rounded-[var(--radius-md)] border p-4 transition ${
        checked
          ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_7%,var(--color-surface-default))]"
          : "border-[var(--color-border-default)] bg-[var(--color-surface-default)]"
      }`}
    >
      <span className="flex items-start gap-3">
        <input
          id={`consent-${definition.scope}`}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ""}`}
          className="mt-1 h-5 w-5 flex-none accent-[var(--color-action-primary)]"
        />
        <span>
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[var(--color-text-default)]">{definition.label}</span>
            <span className="rounded-[var(--radius-full)] border border-[var(--color-border-default)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
              {definition.required ? "Required" : "Optional · off by default"}
            </span>
          </span>
          <span id={descriptionId} className="mt-2 block text-sm leading-6 text-[var(--color-text-muted)]">
            {definition.summary}
          </span>
          {error && (
            <span id={errorId} className="mt-2 flex items-center gap-2 text-sm text-[var(--color-action-primary)]">
              <AlertCircle size={15} aria-hidden="true" /> {error}
            </span>
          )}
        </span>
      </span>
    </label>
  );
}

export default function PartnerOnboarding() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [inviteData, setInviteData] = useState(null);
  const [records, setRecords] = useState([]);
  const [consents, setConsents] = useState({});
  const [consentErrors, setConsentErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");

  const validInvite = inviteData?.invite?.status === "valid";
  const consentDefinitions = useMemo(
    () => consentDefinitionsFromInvite(inviteData || {}),
    [inviteData]
  );
  const acquisition = useMemo(
    () => acquisitionContentFromInvite(inviteData || {}),
    [inviteData]
  );
  const consentComplete = Boolean(inviteData?.consentState?.completed);

  const authQuery = useMemo(() => {
    const params = new URLSearchParams();
    params.set("partner_invite", inviteCode);
    params.set("redirect", `/partner/${inviteCode}`);
    return params.toString();
  }, [inviteCode]);

  const hydrateChoices = useCallback((data) => {
    const definitions = consentDefinitionsFromInvite(data);
    setConsents(initialConsentChoices(definitions, data?.consentState));
  }, []);

  const loadInvite = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await validatePartnerInvite(inviteCode);
      setInviteData(data);
      hydrateChoices(data);
      if (data?.invite?.status === "valid") setStoredInvite(inviteCode, data);
      recordPartnerInviteView(inviteCode).catch(() => undefined);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Invitation could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [hydrateChoices, inviteCode]);

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
        hydrateChoices(claimed);
        setStoredInvite(inviteCode, claimed);
        const propertyRecords = await getPropertyRecords();
        setRecords(Array.isArray(propertyRecords) ? propertyRecords : []);
      } catch (claimError) {
        setError(
          claimError.response?.data?.message || "Partner onboarding could not be started."
        );
      } finally {
        setClaiming(false);
      }
    };
    hydrateAuthenticatedContext();
  }, [hydrateChoices, inviteCode, user, validInvite]);

  const handleConsentChange = (scope) => {
    setConsents((current) => ({ ...current, [scope]: !current[scope] }));
    setConsentErrors((current) => ({ ...current, [scope]: undefined }));
  };

  const handleConsentSubmit = async (event) => {
    event.preventDefault();
    const errors = validateConsentChoices(consentDefinitions, consents);
    if (Object.keys(errors).length) {
      setConsentErrors(errors);
      requestAnimationFrame(() => {
        document.getElementById(`consent-${Object.keys(errors)[0]}`)?.focus();
      });
      return;
    }
    try {
      setClaiming(true);
      setError("");
      const saved = await recordPartnerConsents(
        inviteCode,
        buildConsentPayload(consentDefinitions, consents)
      );
      setInviteData(saved);
      hydrateChoices(saved);
      setStoredInvite(inviteCode, saved);
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Your choices could not be recorded.");
    } finally {
      setClaiming(false);
    }
  };

  const startPropertySetup = async () => {
    setStoredInvite(inviteCode, inviteData);
    try {
      await emitPartnerOnboardingEvent("property_started", inviteCode, {
        path: "new_property",
      });
    } catch (_eventError) {
      // Analytics must never block the homeowner journey.
    }
    navigate(`/property-profile?partner_invite=${encodeURIComponent(inviteCode)}`);
  };

  const attachExistingProperty = async (record) => {
    try {
      setClaiming(true);
      setError("");
      const attached = await attachPartnerOnboardingProperty(
        inviteCode,
        record.property.id
      );
      setInviteData(attached);
      setStoredInvite(inviteCode, attached);
      navigate("/property-profile");
    } catch (attachError) {
      setError(
        attachError.response?.data?.message || "This property could not be connected."
      );
    } finally {
      setClaiming(false);
    }
  };

  if (loading || authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[color-mix(in_srgb,var(--color-accent)_4%,var(--color-surface-default))] px-4 text-[var(--color-text-default)]">
        <div className="flex items-center gap-3 text-[var(--color-text-muted)]" role="status">
          <Loader2 className="animate-spin" size={20} aria-hidden="true" />
          <span>Checking your programme invitation</span>
        </div>
      </main>
    );
  }

  if (!validInvite) {
    const status = inviteData?.invite?.status || "invalid";
    const presentation = statusPresentation(status);
    return (
      <main className="min-h-screen bg-[color-mix(in_srgb,var(--color-accent)_4%,var(--color-surface-default))] px-4 py-8 text-[var(--color-text-default)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className={`${surface} overflow-hidden`} role="alert">
            <div className="h-1 bg-ht-gradient-warm" />
            <div className="p-6 sm:p-9">
              <img src="/assets/logo.png" alt="HomeTruth" className="h-11 w-auto object-contain" />
              <p className="mt-8 text-sm font-bold text-[var(--color-secondary)]">{presentation.eyebrow}</p>
              <h1 className="mt-2 text-3xl font-bold text-[var(--color-text-default)] sm:text-4xl">
                {presentation.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-text-muted)]">
                {error || inviteData?.invite?.message || presentation.body}
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
                No HomeTruth property record has been shared or changed.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => navigate("/")} className={primaryButton}>
                  Return to HomeTruth <ArrowRight size={17} aria-hidden="true" />
                </button>
                <a href={acquisition.support.url} className={secondaryButton}>
                  <LifeBuoy size={17} aria-hidden="true" /> {acquisition.support.label}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[color-mix(in_srgb,var(--color-accent)_4%,var(--color-surface-default))] px-4 py-5 text-[var(--color-text-default)] sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className={`${surface} overflow-hidden`}>
          <div className="h-1 bg-ht-gradient-warm" />
          <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <img src="/assets/logo.png" alt="HomeTruth" className="h-11 w-auto object-contain" />
                {acquisition.partnerLogo && (
                  <>
                    <span className="h-8 w-px bg-[var(--color-border-default)]" aria-hidden="true" />
                    <img
                      src={acquisition.partnerLogo.url}
                      alt={acquisition.partnerLogo.alt}
                      className="max-h-10 max-w-40 object-contain"
                    />
                  </>
                )}
              </div>
              <p className="mt-8 text-sm font-bold text-[var(--color-secondary)]">
                {acquisition.eyebrow}
              </p>
              <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight text-[var(--color-text-default)] sm:text-5xl">
                {acquisition.headline}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--color-text-muted)] sm:text-lg">
                {acquisition.homeownerPromise}
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-sm text-[var(--color-text-muted)]">
                {acquisition.partnerName && (
                  <span className="rounded-[var(--radius-full)] border border-[var(--color-border-default)] px-3 py-1.5">
                    Sponsored by {acquisition.partnerName}
                  </span>
                )}
                {acquisition.programmeName && (
                  <span className="rounded-[var(--radius-full)] border border-[var(--color-border-default)] px-3 py-1.5">
                    {acquisition.programmeName}
                  </span>
                )}
              </div>
            </div>

            <aside className="rounded-[var(--radius-lg)] bg-[var(--color-surface-dark)] p-6 text-[var(--color-text-on-dark)]">
              <p className="text-sm font-bold text-[var(--ht-cyan-light)]">What happens next</p>
              <ol className="mt-5 grid gap-5">
                {acquisition.setupExpectations.map((expectation, index) => (
                  <li key={expectation} className="flex gap-3">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-[var(--radius-full)] border border-[var(--ht-cyan-light)] text-xs text-[var(--ht-cyan-light)]">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-6">{expectation}</span>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </header>

        {error && (
          <div role="alert" className="mt-5 flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-action-primary)] bg-[color-mix(in_srgb,var(--color-action-primary)_9%,var(--color-surface-default))] p-4 text-sm">
            <AlertCircle className="mt-0.5 flex-none text-[var(--color-action-primary)]" size={18} aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid gap-6">
            <PrivacyBoundary summary={acquisition.privacySummary} />

            {!user ? (
              <section className={`${surface} p-6 sm:p-8`} aria-labelledby="continue-title">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface-default))] text-[var(--color-accent)]">
                    <Sparkles size={21} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--color-accent)]">Invitation confirmed</p>
                    <h2 id="continue-title" className="mt-1 text-2xl font-bold text-[var(--color-text-default)]">
                      Continue with your HomeTruth account
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
                      Signing in connects this programme invitation to you. You will choose each permission separately before connecting a property.
                    </p>
                  </div>
                </div>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={() => navigate(`/register?${authQuery}`)} className={primaryButton}>
                    Create an account <ArrowRight size={17} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => navigate(`/login?${authQuery}`)} className={secondaryButton}>
                    Sign in
                  </button>
                </div>
              </section>
            ) : !consentComplete ? (
              <form className={`${surface} p-6 sm:p-8`} onSubmit={handleConsentSubmit} noValidate aria-busy={claiming}>
                <p className="text-sm font-bold text-[var(--color-secondary)]">Your programme permissions</p>
                <h2 className="mt-1 text-2xl font-bold text-[var(--color-text-default)]">
                  Choose what you are comfortable with
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">
                  HomeTruth processing is needed to provide the product. Every partner-facing choice is optional and starts off. Declining it does not stop you using HomeTruth.
                </p>
                <div className="mt-7 grid gap-3">
                  {consentDefinitions.map((definition) => (
                    <ConsentChoice
                      key={definition.scope}
                      definition={definition}
                      checked={Boolean(consents[definition.scope])}
                      error={consentErrors[definition.scope]}
                      onChange={() => handleConsentChange(definition.scope)}
                    />
                  ))}
                </div>
                <div className="mt-7 flex flex-col gap-4 border-t border-[var(--color-border-default)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-[var(--color-text-muted)]">
                    Consent contract: {inviteData?.consentContract?.version || "partner-acquisition-v1"}
                  </p>
                  <button type="submit" disabled={claiming} className={primaryButton}>
                    {claiming ? <Loader2 className="animate-spin" size={17} aria-hidden="true" /> : <ShieldCheck size={17} aria-hidden="true" />}
                    Save choices and continue
                  </button>
                </div>
              </form>
            ) : (
              <section className={`${surface} p-6 sm:p-8`} aria-labelledby="property-title">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-success)_12%,var(--color-surface-default))] text-[var(--color-success)]">
                    <CheckCircle2 size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--color-success)]">Choices recorded</p>
                    <h2 id="property-title" className="mt-1 text-2xl font-bold text-[var(--color-text-default)]">
                      Connect the home you want HomeTruth to help with
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
                      Your property remains your HomeTruth record. Connecting it to the programme does not give the sponsor direct access.
                    </p>
                  </div>
                </div>

                {records.length > 0 && (
                  <div className="mt-7 grid gap-3">
                    <p className="text-sm font-bold text-[var(--color-text-default)]">Use an existing property</p>
                    {records.map((record) => (
                      <button
                        key={record.property.id}
                        type="button"
                        onClick={() => attachExistingProperty(record)}
                        disabled={claiming}
                        className="flex min-h-16 items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4 text-left transition hover:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span>
                          <span className="block font-bold text-[var(--color-text-default)]">
                            {record.currentAddress?.addressLine1 || "Property profile"}
                          </span>
                          <span className="mt-1 block text-sm text-[var(--color-text-muted)]">
                            {[record.currentAddress?.townCity, record.currentAddress?.postcode].filter(Boolean).join(", ") || "Existing HomeTruth record"}
                          </span>
                        </span>
                        <ChevronRight className="flex-none text-[var(--color-accent)]" size={20} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={startPropertySetup} disabled={claiming} className={primaryButton}>
                    <Home size={17} aria-hidden="true" /> Set up a new property
                  </button>
                </div>
              </section>
            )}
          </div>

          <aside className="grid content-start gap-4">
            <section className={`${surface} p-5`}>
              <FileText className="text-[var(--color-secondary)]" size={21} aria-hidden="true" />
              <h2 className="mt-4 font-bold text-[var(--color-text-default)]">Programme context</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                {[
                  ["Sponsor", acquisition.partnerName],
                  ["Programme", acquisition.programmeName],
                  ["Campaign", acquisition.campaignName],
                  ["Cohort", acquisition.cohortName],
                ]
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[var(--color-text-muted)]">{label}</dt>
                      <dd className="mt-0.5 text-[var(--color-text-default)]">{value}</dd>
                    </div>
                  ))}
              </dl>
            </section>

            <section className={`${surface} p-5`}>
              <LifeBuoy className="text-[var(--color-accent)]" size={21} aria-hidden="true" />
              <h2 className="mt-4 font-bold text-[var(--color-text-default)]">Need help?</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Ask about the invitation, your choices or what happens to your HomeTruth record.
              </p>
              <a href={acquisition.support.url} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--color-accent)] hover:underline">
                {acquisition.support.label} <ExternalLink size={15} aria-hidden="true" />
              </a>
            </section>

            <section className="rounded-[var(--radius-lg)] bg-[var(--color-surface-dark)] p-5 text-[var(--color-text-on-dark)]">
              <div className="flex items-center gap-2 text-[var(--ht-cyan-light)]">
                <Check size={18} aria-hidden="true" />
                <p className="text-sm font-bold">HomeTruth stays identifiable</p>
              </div>
              <p className="mt-3 text-sm leading-6">
                This is a HomeTruth-hosted experience. Partner branding explains who sponsored the programme; it does not replace HomeTruth or your control of the record.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
