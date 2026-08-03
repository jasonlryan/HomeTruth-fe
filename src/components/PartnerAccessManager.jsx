import { useEffect, useId, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, KeyRound, RefreshCw, ShieldX, UserPlus } from "lucide-react";
import {
  changeAdminPartnerAccessRole,
  getAdminPartnerAccessAssignments,
  grantAdminPartnerAccess,
  revokeAdminPartnerAccess,
} from "../api/api";
import {
  buildAccessGrantPayload,
  PARTNER_ACCESS_ROLES,
  roleLabel,
  validateAccessGrant,
} from "../utils/partnerAccess";

const inputClass =
  "mt-2 min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-3 py-2 text-[var(--color-text-default)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-accent)_18%,transparent)]";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-4 py-2 text-sm text-[var(--color-text-default)] transition hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-action-primary)] px-4 py-2 text-sm text-[var(--color-text-on-dark)] transition hover:bg-[var(--color-action-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50";

export default function PartnerAccessManager({ programme }) {
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ userEmail: "", role: "analyst" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const emailId = useId();
  const roleId = useId();
  const formRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setAssignments(await getAdminPartnerAccessAssignments(programme.id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Access assignments could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // The programme identifier is the stable scope for this manager.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programme.id]);

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateAccessGrant(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    try {
      setBusyId("grant");
      setError("");
      const assignment = await grantAdminPartnerAccess(
        programme.id,
        buildAccessGrantPayload(form)
      );
      setAssignments((current) => [
        assignment,
        ...current.filter((item) => item.id !== assignment.id),
      ]);
      setForm({ userEmail: "", role: "analyst" });
      setMessage(`${assignment.user?.email || "The user"} now has ${roleLabel(assignment.role).toLowerCase()} access.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Partner access could not be granted.");
    } finally {
      setBusyId(null);
    }
  };

  const changeRole = async (assignment, role) => {
    try {
      setBusyId(assignment.id);
      setError("");
      const updated = await changeAdminPartnerAccessRole(programme.id, assignment.id, role);
      setAssignments((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setMessage(`${updated.user?.email || "The user"} is now a ${roleLabel(updated.role).toLowerCase()}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "The role could not be changed.");
    } finally {
      setBusyId(null);
    }
  };

  const revoke = async (assignment) => {
    if (!window.confirm(`Revoke access for ${assignment.user?.email || "this user"}?`)) return;
    try {
      setBusyId(assignment.id);
      setError("");
      const updated = await revokeAdminPartnerAccess(programme.id, assignment.id);
      setAssignments((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setMessage(`Access was revoked for ${updated.user?.email || "the user"}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Access could not be revoked.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="border-t border-[var(--color-border-default)] bg-[color-mix(in_srgb,var(--color-secondary)_4%,var(--color-surface-default))] p-5 sm:p-6" aria-labelledby={`access-${programme.id}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id={`access-${programme.id}`} className="flex items-center gap-2 text-lg font-bold text-[var(--color-text-default)]">
            <KeyRound size={19} className="text-[var(--color-secondary)]" /> Governed partner access
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">
            Assign a verified HomeTruth account to this programme only. This never grants homeowner, property, document or task access.
          </p>
        </div>
        <button type="button" className={secondaryButton} onClick={load} disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {message && <div role="status" className="mt-4 flex gap-2 rounded-[var(--radius-md)] border border-[var(--color-success)] p-3 text-sm text-[var(--color-text-default)]"><CheckCircle2 size={17} className="text-[var(--color-success)]" />{message}</div>}
      {error && <div role="alert" className="mt-4 flex gap-2 rounded-[var(--radius-md)] border border-[var(--color-action-primary)] p-3 text-sm text-[var(--color-text-default)]"><AlertTriangle size={17} className="text-[var(--color-action-primary)]" />{error}</div>}

      <form ref={formRef} onSubmit={submit} noValidate className="mt-5 grid gap-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-4 lg:grid-cols-[minmax(0,1fr)_240px_auto] lg:items-end">
        <label htmlFor={emailId} className="text-sm font-bold text-[var(--color-text-default)]">
          Verified account email
          <input id={emailId} type="email" className={inputClass} value={form.userEmail} onChange={(event) => { setForm((current) => ({ ...current, userEmail: event.target.value })); setErrors((current) => ({ ...current, userEmail: undefined })); }} aria-invalid={errors.userEmail ? "true" : undefined} aria-describedby={errors.userEmail ? `${emailId}-error` : undefined} />
          {errors.userEmail && <span id={`${emailId}-error`} className="mt-2 block text-xs text-[var(--color-action-primary)]">{errors.userEmail}</span>}
        </label>
        <label htmlFor={roleId} className="text-sm font-bold text-[var(--color-text-default)]">
          Programme role
          <select id={roleId} className={inputClass} value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
            {PARTNER_ACCESS_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
          </select>
        </label>
        <button type="submit" className={primaryButton} disabled={busyId === "grant"}>
          {busyId === "grant" ? <RefreshCw size={16} className="animate-spin" /> : <UserPlus size={16} />} Grant access
        </button>
      </form>

      <div className="mt-5 grid gap-3">
        {loading ? (
          <p className="py-5 text-center text-sm text-[var(--color-text-muted)]">Loading access assignments…</p>
        ) : assignments.length ? assignments.map((assignment) => (
          <article key={assignment.id} className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-4 lg:grid-cols-[minmax(0,1fr)_240px_auto] lg:items-center">
            <div className="min-w-0">
              <p className="truncate font-bold text-[var(--color-text-default)]">{assignment.user?.email || "Deleted account"}</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{assignment.status === "active" ? "Active programme assignment" : "Access revoked"}</p>
            </div>
            <label className="text-sm text-[var(--color-text-muted)]">
              <span className="sr-only">Role for {assignment.user?.email}</span>
              <select className={`${inputClass} mt-0`} value={assignment.role} disabled={assignment.status !== "active" || busyId === assignment.id} onChange={(event) => changeRole(assignment, event.target.value)}>
                {PARTNER_ACCESS_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
              </select>
            </label>
            {assignment.status === "active" ? (
              <button type="button" className={secondaryButton} disabled={busyId === assignment.id} onClick={() => revoke(assignment)}><ShieldX size={16} /> Revoke</button>
            ) : <span className="text-sm font-bold text-[var(--color-text-muted)]">Revoked</span>}
          </article>
        )) : (
          <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-default)] p-5 text-center text-sm text-[var(--color-text-muted)]">No partner staff have access to this programme.</p>
        )}
      </div>
    </section>
  );
}
