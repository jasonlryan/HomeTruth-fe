import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Layers3,
  Megaphone,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  createAdminPartnerProgramme,
  getAdminPartnerProgrammes,
  getAdminPartners,
  transitionAdminPartnerProgramme,
} from "../api/api";
import {
  buildProgrammePayload,
  INITIAL_PROGRAMME_FORM,
  INVITE_MODES,
  nextProgrammeStatuses,
  PARTNER_TYPES,
  programmeStatusLabel,
  validateProgrammeForm,
} from "../utils/partnerProgramme";

const surface =
  "rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)]";
const inputClass =
  "mt-2 min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-3 py-2 text-[var(--color-text-default)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-accent)_18%,transparent)]";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-4 py-2 text-sm text-[var(--color-text-default)] transition hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-action-primary)] px-4 py-2 text-sm text-[var(--color-text-on-dark)] transition hover:bg-[var(--color-action-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50";

const typeLabel = (type) =>
  PARTNER_TYPES.find((option) => option.value === type)?.label || type;

function Field({ label, hint, error, children }) {
  return (
    <label className="block text-sm text-[var(--color-text-default)]">
      <span className="font-bold">{label}</span>
      {hint && <span className="ml-2 text-xs text-[var(--color-text-muted)]">{hint}</span>}
      {children}
      {error && (
        <span className="mt-2 flex items-center gap-2 text-xs text-[var(--color-action-primary)]">
          <AlertTriangle size={14} aria-hidden="true" />
          {error}
        </span>
      )}
    </label>
  );
}

function StatusBadge({ status }) {
  const classes = {
    active:
      "border-[var(--color-success)] bg-[color-mix(in_srgb,var(--color-success)_10%,var(--color-surface-default))] text-[var(--color-text-default)]",
    paused:
      "border-[var(--color-action-primary)] bg-[color-mix(in_srgb,var(--color-action-primary)_10%,var(--color-surface-default))] text-[var(--color-text-default)]",
    draft:
      "border-[var(--color-secondary)] bg-[color-mix(in_srgb,var(--color-secondary)_10%,var(--color-surface-default))] text-[var(--color-text-default)]",
    closed:
      "border-[var(--color-border-default)] bg-[color-mix(in_srgb,var(--color-text-muted)_8%,var(--color-surface-default))] text-[var(--color-text-muted)]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-full)] border px-3 py-1 text-xs ${
        classes[status] || classes.closed
      }`}
    >
      {programmeStatusLabel(status)}
    </span>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className={`${surface} flex items-center gap-4 p-4`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface-default))] text-[var(--color-accent)]">
        <Icon size={21} aria-hidden="true" />
      </span>
      <div>
        <p className="text-2xl font-bold text-[var(--color-text-default)]">{value}</p>
        <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      </div>
    </div>
  );
}

function transitionPresentation(status) {
  if (status === "active") return { label: "Activate", Icon: PlayCircle };
  if (status === "paused") return { label: "Pause", Icon: PauseCircle };
  return { label: "Close", Icon: XCircle };
}

function ProgrammeCard({ programme, busy, onTransition }) {
  const campaign = programme.campaigns?.[0];
  const cohort = programme.cohorts?.[0];
  return (
    <article className={`${surface} overflow-hidden`}>
      <div className="h-1 bg-ht-gradient-cool" />
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={programme.status} />
              <span className="rounded-[var(--radius-full)] border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {typeLabel(programme.partner?.partnerType)}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-bold text-[var(--color-text-default)]">
              {programme.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {programme.partner?.name} · {programme.programmeKey}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {nextProgrammeStatuses(programme.status).map((status) => {
              const { label, Icon } = transitionPresentation(status);
              return (
                <button
                  key={status}
                  type="button"
                  className={status === "active" ? primaryButton : secondaryButton}
                  disabled={busy}
                  onClick={() => onTransition(programme, status)}
                >
                  {busy ? <RefreshCw className="animate-spin" size={16} /> : <Icon size={16} />}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-default)]">
              <Megaphone size={17} className="text-[var(--color-secondary)]" /> Campaign
            </div>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {campaign?.name || "Not configured"}
            </p>
            {campaign && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{campaign.status}</p>}
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-default)]">
              <Users size={17} className="text-[var(--color-accent)]" /> Cohort
            </div>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {cohort?.name || "Not configured"}
            </p>
            {cohort && (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {cohort.targetSize ? `${cohort.targetSize} target participants` : "No target set"}
              </p>
            )}
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-default)]">
              <ShieldCheck size={17} className="text-[var(--color-success)]" /> Data boundary
            </div>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Aggregate-only by default
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              No homeowner records exposed
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProgrammeForm({ partners, onCancel, onCreated }) {
  const [form, setForm] = useState(INITIAL_PROGRAMME_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateProgrammeForm(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError("");
      const programme = await createAdminPartnerProgramme(buildProgrammePayload(form));
      onCreated(programme);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || "The programme could not be created. Check the configuration and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={`${surface} overflow-hidden`} onSubmit={submit} noValidate>
      <div className="h-1 bg-ht-gradient-warm" />
      <div className="p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[var(--color-secondary)]">Shared programme core</p>
            <h2 className="mt-1 text-2xl font-bold text-[var(--color-text-default)]">
              Configure a partner programme
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              One lifecycle for every B2B client. Segment-specific content belongs in a vertical pack,
              never in the access or consent model.
            </p>
          </div>
          <button type="button" className={secondaryButton} onClick={onCancel}>
            Cancel
          </button>
        </div>

        {submitError && (
          <div role="alert" className="mt-6 flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-action-primary)] bg-[color-mix(in_srgb,var(--color-action-primary)_10%,var(--color-surface-default))] p-4 text-sm text-[var(--color-text-default)]">
            <AlertTriangle className="mt-0.5 flex-none" size={18} /> {submitError}
          </div>
        )}

        <fieldset className="mt-8">
          <legend className="flex items-center gap-3 text-lg font-bold text-[var(--color-text-default)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-secondary)_12%,var(--color-surface-default))] text-[var(--color-secondary)]">
              1
            </span>
            Partner
          </legend>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Partner source">
              <select className={inputClass} value={form.partnerMode} onChange={update("partnerMode")}>
                <option value="new">Create a new partner</option>
                <option value="existing">Use an existing partner</option>
              </select>
            </Field>
            {form.partnerMode === "existing" ? (
              <Field label="Existing partner" error={errors.partnerId}>
                <select className={inputClass} value={form.partnerId} onChange={update("partnerId")}>
                  <option value="">Choose a partner</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} · {typeLabel(partner.partnerType)}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <>
                <Field label="Partner name" error={errors.partnerName}>
                  <input className={inputClass} value={form.partnerName} onChange={update("partnerName")} />
                </Field>
                <Field label="Partner type">
                  <select className={inputClass} value={form.partnerType} onChange={update("partnerType")}>
                    {PARTNER_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Opaque external reference" hint="Optional; no policy, mortgage or purchaser PII">
                  <input className={inputClass} value={form.partnerExternalRef} onChange={update("partnerExternalRef")} />
                </Field>
              </>
            )}
          </div>
        </fieldset>

        <fieldset className="mt-10 border-t border-[var(--color-border-default)] pt-8">
          <legend className="flex items-center gap-3 text-lg font-bold text-[var(--color-text-default)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface-default))] text-[var(--color-accent)]">2</span>
            Programme contract
          </legend>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Programme name" error={errors.programmeName}>
              <input className={inputClass} value={form.programmeName} onChange={update("programmeName")} />
            </Field>
            <Field label="Programme key" hint="Stable, lowercase identifier" error={errors.programmeKey}>
              <input className={inputClass} value={form.programmeKey} onChange={update("programmeKey")} />
            </Field>
            <Field label="Start date"><input type="date" className={inputClass} value={form.programmeStartDate} onChange={update("programmeStartDate")} /></Field>
            <Field label="End date" error={errors.programmeEndDate}><input type="date" className={inputClass} value={form.programmeEndDate} onChange={update("programmeEndDate")} /></Field>
            <Field label="Invite mode">
              <select className={inputClass} value={form.inviteMode} onChange={update("inviteMode")}>
                {INVITE_MODES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Entitlement pack"><input className={inputClass} value={form.entitlementPack} onChange={update("entitlementPack")} /></Field>
            <Field label="Participant limit" error={errors.participantLimit}><input type="number" min="1" className={inputClass} value={form.participantLimit} onChange={update("participantLimit")} /></Field>
            <Field label="Approved content references" hint="Comma-separated"><input className={inputClass} value={form.approvedContentRefs} onChange={update("approvedContentRefs")} /></Field>
          </div>
        </fieldset>

        <fieldset className="mt-10 border-t border-[var(--color-border-default)] pt-8">
          <legend className="flex items-center gap-3 text-lg font-bold text-[var(--color-text-default)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-action-primary)_12%,var(--color-surface-default))] text-[var(--color-action-primary)]">3</span>
            Campaign and cohort
          </legend>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <section className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-5">
              <h3 className="flex items-center gap-2 font-bold text-[var(--color-text-default)]"><Megaphone size={18} /> Acquisition campaign</h3>
              <div className="mt-5 grid gap-5">
                <Field label="Campaign name" error={errors.campaignName}><input className={inputClass} value={form.campaignName} onChange={update("campaignName")} /></Field>
                <Field label="Campaign key" error={errors.campaignKey}><input className={inputClass} value={form.campaignKey} onChange={update("campaignKey")} /></Field>
                <Field label="Approved invite route"><input className={inputClass} value={form.inviteRoute} onChange={update("inviteRoute")} /></Field>
                <Field label="Approved campaign content"><input className={inputClass} value={form.campaignContentRef} onChange={update("campaignContentRef")} /></Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Start date"><input type="date" className={inputClass} value={form.campaignStartDate} onChange={update("campaignStartDate")} /></Field>
                  <Field label="End date" error={errors.campaignEndDate}><input type="date" className={inputClass} value={form.campaignEndDate} onChange={update("campaignEndDate")} /></Field>
                </div>
              </div>
            </section>
            <section className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-5">
              <h3 className="flex items-center gap-2 font-bold text-[var(--color-text-default)]"><Users size={18} /> Homeowner cohort</h3>
              <div className="mt-5 grid gap-5">
                <Field label="Cohort name" error={errors.cohortName}><input className={inputClass} value={form.cohortName} onChange={update("cohortName")} /></Field>
                <Field label="Cohort key" error={errors.cohortKey}><input className={inputClass} value={form.cohortKey} onChange={update("cohortKey")} /></Field>
                <Field label="Target size" error={errors.targetSize}><input type="number" min="1" className={inputClass} value={form.targetSize} onChange={update("targetSize")} /></Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Start date"><input type="date" className={inputClass} value={form.cohortStartDate} onChange={update("cohortStartDate")} /></Field>
                  <Field label="End date" error={errors.cohortEndDate}><input type="date" className={inputClass} value={form.cohortEndDate} onChange={update("cohortEndDate")} /></Field>
                </div>
              </div>
            </section>
          </div>
        </fieldset>

        <div className="mt-8 flex flex-col gap-4 rounded-[var(--radius-md)] border border-[var(--color-success)] bg-[color-mix(in_srgb,var(--color-success)_8%,var(--color-surface-default))] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 flex-none text-[var(--color-success)]" size={20} />
            <div>
              <p className="font-bold text-[var(--color-text-default)]">Privacy boundary is fixed</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Creating a programme never grants access to individual homeowner data.</p>
            </div>
          </div>
          <button type="submit" className={primaryButton} disabled={submitting}>
            {submitting ? <RefreshCw className="animate-spin" size={17} /> : <Plus size={17} />}
            Create draft programme
          </button>
        </div>
      </div>
    </form>
  );
}

export default function PartnerProgrammeAdmin() {
  const [programmes, setProgrammes] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [programmeData, partnerData] = await Promise.all([
        getAdminPartnerProgrammes(),
        getAdminPartners(),
      ]);
      setProgrammes(programmeData);
      setPartners(partnerData);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Partner programmes could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () => ({
      total: programmes.length,
      active: programmes.filter((programme) => programme.status === "active").length,
      partners: new Set(programmes.map((programme) => programme.partner?.id)).size,
    }),
    [programmes]
  );

  const transition = async (programme, status) => {
    if (status === "closed" && !window.confirm(`Close ${programme.name}? Homeowners keep their independent HomeTruth records.`)) return;
    try {
      setBusyId(programme.id);
      setError("");
      const updated = await transitionAdminPartnerProgramme(programme.id, status);
      setProgrammes((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setNotice(`${updated.name} is now ${programmeStatusLabel(updated.status).toLowerCase()}.`);
    } catch (transitionError) {
      setError(transitionError.response?.data?.message || "The lifecycle change could not be completed.");
    } finally {
      setBusyId(null);
    }
  };

  const created = (programme) => {
    setProgrammes((current) => [programme, ...current]);
    if (programme.partner && !partners.some((partner) => partner.id === programme.partner.id)) {
      setPartners((current) => [...current, programme.partner]);
    }
    setShowForm(false);
    setNotice(`${programme.name} was created as a draft.`);
  };

  return (
    <main className="min-h-screen bg-[color-mix(in_srgb,var(--color-accent)_4%,var(--color-surface-default))] px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Admin" className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link className="text-[var(--color-accent)] hover:underline" to="/admin/dashboard">Dashboard</Link>
          <span aria-current="page" className="font-bold text-[var(--color-text-default)]">Partner programmes</span>
          <Link className="text-[var(--color-accent)] hover:underline" to="/admin/data-access">Data access</Link>
        </nav>

        <header className={`${surface} relative overflow-hidden p-6 sm:p-8`}>
          <div className="absolute inset-y-0 left-0 w-1 bg-ht-gradient-warm" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-secondary)_12%,var(--color-surface-default))] text-[var(--color-secondary)]">
                <Building2 size={24} />
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--color-secondary)]">B2B partnership foundation</p>
                <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-default)]">Partner programmes</h1>
                <p className="mt-2 max-w-3xl leading-6 text-[var(--color-text-muted)]">
                  Configure a shared programme lifecycle for insurers, mortgage providers, home developers and other B2B clients—without creating a bespoke product fork.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={secondaryButton} onClick={load} disabled={loading}>
                <RefreshCw className={loading ? "animate-spin" : ""} size={17} /> Refresh
              </button>
              <button type="button" className={primaryButton} onClick={() => setShowForm(true)}>
                <Plus size={17} /> New programme
              </button>
            </div>
          </div>
        </header>

        <section aria-label="Programme summary" className="mt-6 grid gap-4 sm:grid-cols-3">
          <Metric icon={Layers3} label="Programmes" value={counts.total} />
          <Metric icon={Activity} label="Active" value={counts.active} />
          <Metric icon={Building2} label="Partner organisations" value={counts.partners} />
        </section>

        {notice && (
          <div role="status" className="mt-6 flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-success)] bg-[color-mix(in_srgb,var(--color-success)_9%,var(--color-surface-default))] p-4 text-sm text-[var(--color-text-default)]">
            <CheckCircle2 className="mt-0.5 flex-none text-[var(--color-success)]" size={18} /> {notice}
          </div>
        )}
        {error && (
          <div role="alert" className="mt-6 flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-action-primary)] bg-[color-mix(in_srgb,var(--color-action-primary)_9%,var(--color-surface-default))] p-4 text-sm text-[var(--color-text-default)]">
            <AlertTriangle className="mt-0.5 flex-none text-[var(--color-action-primary)]" size={18} /> {error}
          </div>
        )}

        {showForm && <div className="mt-6"><ProgrammeForm partners={partners} onCancel={() => setShowForm(false)} onCreated={created} /></div>}

        <section className="mt-6" aria-labelledby="programme-list-title">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="programme-list-title" className="text-xl font-bold text-[var(--color-text-default)]">Configured programmes</h2>
            <p className="text-sm text-[var(--color-text-muted)]">Aggregate-only by default</p>
          </div>
          {loading ? (
            <div className={`${surface} flex min-h-48 items-center justify-center text-[var(--color-text-muted)]`}>
              <RefreshCw className="mr-2 animate-spin" size={18} /> Loading programmes
            </div>
          ) : programmes.length ? (
            <div className="grid gap-5">
              {programmes.map((programme) => (
                <ProgrammeCard key={programme.id} programme={programme} busy={busyId === programme.id} onTransition={transition} />
              ))}
            </div>
          ) : (
            <div className={`${surface} flex min-h-56 flex-col items-center justify-center p-8 text-center`}>
              <Layers3 size={32} className="text-[var(--color-accent)]" />
              <h3 className="mt-4 text-lg font-bold text-[var(--color-text-default)]">No programmes configured</h3>
              <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">Create the first shared partner programme and keep vertical differences in configuration.</p>
              <button type="button" className={`${primaryButton} mt-5`} onClick={() => setShowForm(true)}><Plus size={17} /> New programme</button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
