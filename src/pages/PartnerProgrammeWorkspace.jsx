import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileLock2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  getPartnerProgramme,
  getPartnerProgrammeAudit,
  getPartnerProgrammes,
} from "../api/api";
import {
  capabilityLabel,
  programmeAccessState,
  roleLabel,
} from "../utils/partnerAccess";

const surface =
  "rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)]";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-4 py-2 text-sm text-[var(--color-text-default)] transition hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-action-primary)] px-4 py-2 text-sm text-[var(--color-text-on-dark)] transition hover:bg-[var(--color-action-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50";

const statusClasses = {
  active: "border-[var(--color-success)] bg-[color-mix(in_srgb,var(--color-success)_9%,var(--color-surface-default))]",
  paused: "border-[var(--color-action-primary)] bg-[color-mix(in_srgb,var(--color-action-primary)_9%,var(--color-surface-default))]",
  closed: "border-[var(--color-border-default)] bg-[color-mix(in_srgb,var(--color-text-muted)_7%,var(--color-surface-default))]",
  inactive: "border-[var(--color-border-default)] bg-[var(--color-surface-default)]",
};

const formatDateTime = (input) =>
  input
    ? new Date(input).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

function AuditPanel({ entry, onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getPartnerProgrammeAudit(entry.programme.id)
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.response?.data?.message || "Audit evidence could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entry.programme.id]);

  return (
    <section className={`${surface} mt-4 p-5`} aria-labelledby={`audit-${entry.programme.id}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--color-secondary)]">Reviewable evidence</p>
          <h3 id={`audit-${entry.programme.id}`} className="mt-1 text-lg font-bold text-[var(--color-text-default)]">Programme access audit</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Homeowner identifiers and arbitrary request metadata are excluded.</p>
        </div>
        <button type="button" className={secondaryButton} onClick={onClose}>Close audit</button>
      </div>
      {error && <div role="alert" className="mt-4 flex gap-2 rounded-[var(--radius-md)] border border-[var(--color-action-primary)] p-3 text-sm"><AlertTriangle size={17} />{error}</div>}
      {loading ? (
        <p className="mt-5 text-sm text-[var(--color-text-muted)]">Loading audit evidence…</p>
      ) : events.length ? (
        <ol className="mt-5 grid gap-3">
          {events.map((event) => (
            <li key={event.id} className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="font-bold text-[var(--color-text-default)]">{event.action.replaceAll(":", " · ").replaceAll("_", " ")}</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{event.resourceType.replaceAll("_", " ")} · {event.outcome}{event.reasonCode ? ` · ${event.reasonCode.replaceAll("_", " ")}` : ""}</p>
              </div>
              <time className="text-sm text-[var(--color-text-muted)]">{formatDateTime(event.occurredAt)}</time>
            </li>
          ))}
        </ol>
      ) : <p className="mt-5 text-sm text-[var(--color-text-muted)]">No access events have been recorded yet.</p>}
    </section>
  );
}

function ProgrammeAccessCard({ entry, selectedAudit, onAudit, onOpen, busy }) {
  const state = programmeAccessState(entry);
  const canAudit = entry.capabilities?.includes("audit:view");
  const canOpen = entry.capabilities?.includes("programme:view");
  return (
    <article className={`${surface} overflow-hidden`}>
      <div className="h-1 bg-ht-gradient-cool" />
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-[var(--radius-full)] border px-3 py-1 text-xs font-bold ${statusClasses[state.key] || statusClasses.inactive}`}>{state.label}</span>
              <span className="rounded-[var(--radius-full)] border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">{roleLabel(entry.role)}</span>
            </div>
            <h2 className="mt-3 text-xl font-bold text-[var(--color-text-default)]">{entry.programme?.name}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{entry.partner?.name} · {entry.partner?.partnerType?.replaceAll("_", " ")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canOpen && <button type="button" className={primaryButton} disabled={busy} onClick={() => onOpen(entry)}>{busy ? <RefreshCw size={16} className="animate-spin" /> : <Building2 size={16} />} Open programme</button>}
            {canAudit && <button type="button" className={secondaryButton} onClick={() => onAudit(selectedAudit ? null : entry)}><ClipboardList size={16} /> {selectedAudit ? "Hide audit" : "View audit"}</button>}
          </div>
        </div>

        {!state.operational && (
          <div className="mt-5 flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-action-primary)] bg-[color-mix(in_srgb,var(--color-action-primary)_8%,var(--color-surface-default))] p-4 text-sm text-[var(--color-text-default)]">
            <AlertTriangle className="mt-0.5 flex-none text-[var(--color-action-primary)]" size={18} /> Operational and reporting access is unavailable while this programme is not active.{canAudit ? " Your role can still review historical audit evidence." : " Historical audit remains limited to authorised programme managers and privacy auditors."}
          </div>
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <section className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4">
            <ShieldCheck size={19} className="text-[var(--color-success)]" />
            <h3 className="mt-3 font-bold text-[var(--color-text-default)]">Current capabilities</h3>
            <ul className="mt-2 space-y-1 text-sm text-[var(--color-text-muted)]">
              {entry.capabilities?.length ? entry.capabilities.map((capability) => <li key={capability}>{capabilityLabel(capability)}</li>) : <li>No operational capabilities</li>}
            </ul>
          </section>
          <section className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4">
            <BarChart3 size={19} className="text-[var(--color-accent)]" />
            <h3 className="mt-3 font-bold text-[var(--color-text-default)]">Aggregate evidence</h3>
            <p className="mt-2 text-sm leading-5 text-[var(--color-text-muted)]">Evidence and exports appear only when the governed dashboard, threshold and consent checks are enabled.</p>
          </section>
          <section className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4">
            <FileLock2 size={19} className="text-[var(--color-secondary)]" />
            <h3 className="mt-3 font-bold text-[var(--color-text-default)]">Always excluded</h3>
            <p className="mt-2 text-sm leading-5 text-[var(--color-text-muted)]">Individual homeowner, property, document, task, profile, chat and event records.</p>
          </section>
        </div>
        {selectedAudit && <AuditPanel entry={entry} onClose={() => onAudit(null)} />}
      </div>
    </article>
  );
}

export default function PartnerProgrammeWorkspace() {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [auditId, setAuditId] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setNotice("");
      setProgrammes(await getPartnerProgrammes());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Partner programmes could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openProgramme = async (entry) => {
    try {
      setBusyId(entry.programme.id);
      setError("");
      const current = await getPartnerProgramme(entry.programme.id);
      setProgrammes((items) => items.map((item) => item.programme.id === current.programme.id ? current : item));
      setNotice(`${current.programme.name} access was checked and recorded.`);
    } catch (requestError) {
      const accessError =
        requestError.response?.data?.message ||
        "Programme access is no longer available.";
      try {
        setProgrammes(await getPartnerProgrammes());
      } catch {
        // Preserve the authoritative access denial even if the refresh also fails.
      }
      setError(accessError);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[color-mix(in_srgb,var(--color-accent)_4%,var(--color-surface-default))] px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className={`${surface} relative overflow-hidden p-6 sm:p-8`}>
          <div className="absolute inset-y-0 left-0 w-1 bg-ht-gradient-warm" />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--color-secondary)]">Governed partner workspace</p>
              <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-default)]">Your partner programmes</h1>
              <p className="mt-3 max-w-3xl leading-6 text-[var(--color-text-muted)]">Access is assigned per programme and enforced by HomeTruth. Partner value comes from privacy-protected aggregate evidence—not access to a homeowner’s record.</p>
            </div>
            <button type="button" className={secondaryButton} onClick={load} disabled={loading}><RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Refresh access</button>
          </div>
        </header>

        <section className={`${surface} mt-5 flex items-start gap-4 p-5`} aria-label="Privacy boundary">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-success)_12%,var(--color-surface-default))] text-[var(--color-success)]"><ShieldCheck size={22} /></span>
          <div><h2 className="font-bold text-[var(--color-text-default)]">Aggregate-only by default</h2><p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">Every programme is isolated. Access to one programme never grants access to another, and no role shown here permits individual homeowner data.</p></div>
        </section>

        {notice && <div role="status" className="mt-5 flex gap-2 rounded-[var(--radius-md)] border border-[var(--color-success)] bg-[color-mix(in_srgb,var(--color-success)_8%,var(--color-surface-default))] p-4 text-sm"><CheckCircle2 size={18} className="text-[var(--color-success)]" />{notice}</div>}
        {error && <div role="alert" className="mt-5 flex gap-2 rounded-[var(--radius-md)] border border-[var(--color-action-primary)] bg-[color-mix(in_srgb,var(--color-action-primary)_8%,var(--color-surface-default))] p-4 text-sm"><AlertTriangle size={18} className="text-[var(--color-action-primary)]" />{error}</div>}

        <section className="mt-6" aria-labelledby="assigned-programmes">
          <h2 id="assigned-programmes" className="text-xl font-bold text-[var(--color-text-default)]">Assigned programmes</h2>
          {loading ? (
            <div className={`${surface} mt-4 flex min-h-48 items-center justify-center text-[var(--color-text-muted)]`}><RefreshCw size={18} className="mr-2 animate-spin" /> Loading governed access</div>
          ) : programmes.length ? (
            <div className="mt-4 grid gap-5">{programmes.map((entry) => <ProgrammeAccessCard key={entry.programme.id} entry={entry} selectedAudit={auditId === entry.programme.id} onAudit={(selected) => setAuditId(selected?.programme.id || null)} onOpen={openProgramme} busy={busyId === entry.programme.id} />)}</div>
          ) : (
            <div className={`${surface} mt-4 flex min-h-56 flex-col items-center justify-center p-8 text-center`}><FileLock2 size={32} className="text-[var(--color-secondary)]" /><h3 className="mt-4 text-lg font-bold text-[var(--color-text-default)]">No partner programme access</h3><p className="mt-2 max-w-lg text-sm leading-6 text-[var(--color-text-muted)]">Your account has no active programme assignment. A HomeTruth operator must grant access to a verified account; administrator or homeowner status does not grant it automatically.</p></div>
          )}
        </section>
      </div>
    </main>
  );
}
