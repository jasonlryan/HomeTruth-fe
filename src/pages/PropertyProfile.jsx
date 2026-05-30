import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  AlertCircle,
  CalendarClock,
  Check,
  CheckCircle2,
  CircleOff,
  ClipboardList,
  FileText,
  Home,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import {
  attachPartnerOnboardingProperty,
  createPropertyRecord,
  emitPartnerOnboardingEvent,
  generatePropertyTasks,
  getPropertyRecords,
  getPropertyTasks,
  updatePropertyTaskStatus,
} from "../api/api";

const initialForm = {
  addressLine1: "",
  addressLine2: "",
  townCity: "",
  county: "",
  postcode: "",
  country: "GB",
  relationshipType: "owner",
  propertyType: "unknown",
  tenure: "unknown",
};

const relationshipOptions = [
  { value: "owner", label: "Owner" },
  { value: "buyer", label: "Buyer" },
  { value: "landlord", label: "Landlord" },
  { value: "tenant", label: "Tenant" },
  { value: "investor", label: "Investor" },
  { value: "manager", label: "Manager" },
  { value: "viewer", label: "Viewer" },
  { value: "other", label: "Other" },
];

const propertyTypeOptions = [
  { value: "unknown", label: "Not sure yet" },
  { value: "house", label: "House" },
  { value: "flat", label: "Flat" },
  { value: "maisonette", label: "Maisonette" },
  { value: "bungalow", label: "Bungalow" },
  { value: "mixed_use", label: "Mixed use" },
];

const tenureOptions = [
  { value: "unknown", label: "Not sure yet" },
  { value: "freehold", label: "Freehold" },
  { value: "leasehold", label: "Leasehold" },
  { value: "share_of_freehold", label: "Share of freehold" },
  { value: "commonhold", label: "Commonhold" },
];

const formatLabel = (value) => {
  if (!value) return "Not set";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatTaskDate = (date) => {
  if (!date) return "No due date";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const taskTypeLabels = {
  service_due: "Service due",
  seasonal_check: "Seasonal check",
  document_expiry: "Document review",
  missing_baseline: "Profile detail",
  known_issue_follow_up: "Known issue",
  evidence_improvement: "Evidence",
};

const priorityStyles = {
  high: "border-[var(--color-action-primary)] text-[var(--color-action-primary)]",
  medium: "border-[var(--color-accent)] text-[var(--color-accent)]",
  low: "border-[var(--color-border-default)] text-[var(--color-text-muted)]",
};

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border-default)]/40 py-3 last:border-b-0">
      <dt className="text-sm text-[var(--color-text-muted)]">{label}</dt>
      <dd className="max-w-[60%] text-right text-sm text-[var(--color-text-default)]">
        {value || "Not set"}
      </dd>
    </div>
  );
}

function SummaryMetric({ icon: Icon, label, value }) {
  return (
    <div className="flex min-h-24 items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-4">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface-default))] text-[var(--color-accent)]">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
        <p className="mt-1 text-2xl font-normal text-[var(--color-text-default)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusPanel({ title, body, icon: Icon }) {
  return (
    <section className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-secondary)_12%,var(--color-surface-default))] text-[var(--color-secondary)]">
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

function PreventionTasksPanel({
  tasks,
  loading,
  generating,
  error,
  updatingTaskId,
  onRefresh,
  onUpdateStatus,
}) {
  return (
    <section className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface-default))] text-[var(--color-accent)]">
            <Wrench size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm text-[var(--color-secondary)]">
              Recommended actions
            </p>
            <h3 className="mt-1 text-xl font-normal text-[var(--color-text-default)]">
              Prevention tasks
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Useful actions generated from this property profile, linked
              documents and recorded facts.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading || generating}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-3 py-2 text-sm text-[var(--color-text-default)] transition hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={generating ? "animate-spin" : ""}
            size={16}
            aria-hidden="true"
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-action-primary)] bg-[color-mix(in_srgb,var(--color-action-primary)_10%,var(--color-surface-default))] p-3 text-sm text-[var(--color-text-default)]">
          <AlertCircle
            className="mt-0.5 flex-none text-[var(--color-action-primary)]"
            size={16}
          />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="mt-5 flex min-h-32 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-default)] text-sm text-[var(--color-text-muted)]">
          <Loader2 className="mr-2 animate-spin" size={18} />
          Loading actions
        </div>
      ) : tasks.length === 0 ? (
        <div className="mt-5 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-default)] p-5 text-sm leading-6 text-[var(--color-text-muted)]">
          No open actions right now. Refresh after adding documents or property
          facts.
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {tasks.map((task) => {
            const isUpdating = updatingTaskId === task.id;
            return (
              <article
                key={task.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-[var(--radius-full)] border border-[var(--color-border-default)] px-2.5 py-1 text-xs text-[var(--color-text-muted)]">
                        {taskTypeLabels[task.taskType] ||
                          formatLabel(task.taskType)}
                      </span>
                      <span
                        className={`rounded-[var(--radius-full)] border px-2.5 py-1 text-xs ${
                          priorityStyles[task.priority] || priorityStyles.medium
                        }`}
                      >
                        {formatLabel(task.priority)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-[var(--radius-full)] border border-[var(--color-border-default)] px-2.5 py-1 text-xs text-[var(--color-text-muted)]">
                        <CalendarClock size={13} aria-hidden="true" />
                        {formatTaskDate(task.dueDate)}
                      </span>
                    </div>
                    <h4 className="mt-3 text-lg font-normal text-[var(--color-text-default)]">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                        {task.description}
                      </p>
                    )}
                    {task.recommendedAction && (
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-default)]">
                        {task.recommendedAction}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(task.id, "completed")}
                      disabled={isUpdating}
                      className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-success)] px-3 py-2 text-sm text-[var(--color-text-on-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdating ? (
                        <Loader2 className="animate-spin" size={15} />
                      ) : (
                        <Check size={15} aria-hidden="true" />
                      )}
                      Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(task.id, "dismissed")}
                      disabled={isUpdating}
                      className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-3 py-2 text-sm text-[var(--color-text-default)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X size={15} aria-hidden="true" />
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(task.id, "not_relevant")}
                      disabled={isUpdating}
                      className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-3 py-2 text-sm text-[var(--color-text-default)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CircleOff size={15} aria-hidden="true" />
                      Not relevant
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function PropertyProfile() {
  const location = useLocation();
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksGenerating, setTasksGenerating] = useState(false);
  const [tasksError, setTasksError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadRecords = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getPropertyRecords();
        if (!isMounted) return;
        setRecords(Array.isArray(data) ? data : []);
        setSelectedId(data?.[0]?.property?.id || null);
      } catch (loadError) {
        if (!isMounted) return;
        setError(
          loadError.response?.data?.message ||
            "Property profile could not be loaded."
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRecords();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedRecord = useMemo(() => {
    if (!records.length) return null;
    return (
      records.find((record) => record.property?.id === selectedId) || records[0]
    );
  }, [records, selectedId]);

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status === "open"),
    [tasks]
  );

  const loadTasks = useCallback(async (propertyId, options = {}) => {
    if (!propertyId) {
      setTasks([]);
      return;
    }

    try {
      setTasksError("");
      setTasksLoading(!options.refresh);
      setTasksGenerating(Boolean(options.refresh));

      if (options.refresh) {
        const generated = await generatePropertyTasks(propertyId);
        setTasks(Array.isArray(generated?.tasks) ? generated.tasks : []);
        return;
      }

      const data = await getPropertyTasks(propertyId, { status: "open" });
      setTasks(Array.isArray(data) ? data : []);
    } catch (taskError) {
      setTasksError(
        taskError.response?.data?.message || "Recommended actions could not be loaded."
      );
    } finally {
      setTasksLoading(false);
      setTasksGenerating(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedRecord?.property?.id) {
      setTasks([]);
      return;
    }

    loadTasks(selectedRecord.property.id, { refresh: true });
  }, [loadTasks, selectedRecord?.property?.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.addressLine1.trim()) {
      setError("Address line 1 is required.");
      return;
    }

    try {
      setSaving(true);
      const created = await createPropertyRecord({
        relationshipType: form.relationshipType,
        propertyType: form.propertyType,
        tenure: form.tenure,
        address: {
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim() || null,
          townCity: form.townCity.trim() || null,
          county: form.county.trim() || null,
          postcode: form.postcode.trim() || null,
          country: form.country.trim() || "GB",
        },
      });

      setRecords((current) => [created, ...current]);
      setSelectedId(created.property.id);
      setForm(initialForm);

      const params = new URLSearchParams(location.search);
      const partnerInvite =
        params.get("partner_invite") ||
        localStorage.getItem("partner_invite_code");

      if (partnerInvite) {
        try {
          const linked = await attachPartnerOnboardingProperty(
            partnerInvite,
            created.property.id
          );
          localStorage.setItem(
            "partner_onboarding_context",
            JSON.stringify({
              inviteCode: partnerInvite,
              partnerName: linked.partner?.name || null,
              cohortName: linked.cohort?.name || null,
              memberId: linked.member?.id || null,
              propertyId: created.property.id,
            })
          );
          await emitPartnerOnboardingEvent(
            "property_completed",
            partnerInvite,
            {
              propertyId: created.property.id,
              path: "new_property",
            }
          );
          setSuccess("Property profile set up and linked to the pilot.");
        } catch (linkError) {
          setError(
            linkError.response?.data?.message ||
              "Property profile was set up, but pilot linking could not be completed."
          );
        }
      } else {
        setSuccess("Property profile set up.");
      }
    } catch (saveError) {
      setError(
        saveError.response?.data?.message ||
          "Property profile could not be saved."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId, status) => {
    if (!selectedRecord?.property?.id) return;

    try {
      setTasksError("");
      setUpdatingTaskId(taskId);
      const updated = await updatePropertyTaskStatus(
        selectedRecord.property.id,
        taskId,
        { status }
      );

      setTasks((current) =>
        updated.status === "open"
          ? current.map((task) => (task.id === updated.id ? updated : task))
          : current.filter((task) => task.id !== updated.id)
      );
      setSuccess("Action updated.");
    } catch (taskError) {
      setTasksError(
        taskError.response?.data?.message || "Action could not be updated."
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="min-h-full bg-[color-mix(in_srgb,var(--color-surface-dark)_4%,var(--color-surface-default))] px-4 py-6 text-[var(--color-text-default)] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-[var(--color-border-default)] pb-6">
          <p className="text-sm text-[var(--color-secondary)]">
            Property profile
          </p>
          <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-normal tracking-normal text-[var(--color-text-default)]">
                Set up your property
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--color-text-muted)]">
                Create the home record that documents, facts and actions will
                attach to.
              </p>
            </div>
            {records.length > 1 && (
              <label className="flex flex-col gap-2 text-sm text-[var(--color-text-muted)]">
                Active property
                <select
                  value={selectedRecord?.property?.id || ""}
                  onChange={(event) => setSelectedId(Number(event.target.value))}
                  className="min-w-64 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-3 py-2 text-[var(--color-text-default)] outline-none focus:border-[var(--color-accent)]"
                >
                  {records.map((record) => (
                    <option key={record.property.id} value={record.property.id}>
                      {record.currentAddress?.addressLine1 ||
                        `Property ${record.property.id}`}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-action-primary)] bg-[color-mix(in_srgb,var(--color-action-primary)_10%,var(--color-surface-default))] p-4 text-sm text-[var(--color-text-default)]">
            <AlertCircle className="mt-0.5 flex-none text-[var(--color-action-primary)]" size={18} />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-success)] bg-[color-mix(in_srgb,var(--color-success)_10%,var(--color-surface-default))] p-4 text-sm text-[var(--color-text-default)]">
            <CheckCircle2 className="mt-0.5 flex-none text-[var(--color-success)]" size={18} />
            <p>{success}</p>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-80 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)]">
            <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
              <Loader2 className="animate-spin" size={20} />
              <span>Loading property profile</span>
            </div>
          </div>
        ) : records.length === 0 ? (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <form
              onSubmit={handleSubmit}
              className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-5 sm:p-6"
            >
              <div className="mb-6 flex items-start gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface-default))] text-[var(--color-accent)]">
                  <Home size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xl font-normal text-[var(--color-text-default)]">
                    Property details
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Start with the address and your relationship to the home.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="text-sm text-[var(--color-text-muted)]">
                    Address line 1
                  </span>
                  <input
                    name="addressLine1"
                    value={form.addressLine1}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-3 py-3 outline-none focus:border-[var(--color-accent)]"
                    autoComplete="address-line1"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-sm text-[var(--color-text-muted)]">
                    Address line 2
                  </span>
                  <input
                    name="addressLine2"
                    value={form.addressLine2}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-3 py-3 outline-none focus:border-[var(--color-accent)]"
                    autoComplete="address-line2"
                  />
                </label>
                <label>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    Town or city
                  </span>
                  <input
                    name="townCity"
                    value={form.townCity}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-3 py-3 outline-none focus:border-[var(--color-accent)]"
                    autoComplete="address-level2"
                  />
                </label>
                <label>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    County
                  </span>
                  <input
                    name="county"
                    value={form.county}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-3 py-3 outline-none focus:border-[var(--color-accent)]"
                  />
                </label>
                <label>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    Postcode
                  </span>
                  <input
                    name="postcode"
                    value={form.postcode}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-3 py-3 uppercase outline-none focus:border-[var(--color-accent)]"
                    autoComplete="postal-code"
                  />
                </label>
                <label>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    Country
                  </span>
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-3 py-3 uppercase outline-none focus:border-[var(--color-accent)]"
                    maxLength={2}
                  />
                </label>
                <label>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    Relationship
                  </span>
                  <select
                    name="relationshipType"
                    value={form.relationshipType}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-3 py-3 outline-none focus:border-[var(--color-accent)]"
                  >
                    {relationshipOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    Property type
                  </span>
                  <select
                    name="propertyType"
                    value={form.propertyType}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-3 py-3 outline-none focus:border-[var(--color-accent)]"
                  >
                    {propertyTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    Tenure
                  </span>
                  <select
                    name="tenure"
                    value={form.tenure}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-3 py-3 outline-none focus:border-[var(--color-accent)]"
                  >
                    {tenureOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-action-primary)] px-5 py-3 text-[var(--color-text-on-dark)] transition hover:bg-[var(--color-action-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 className="animate-spin" size={18} />}
                  Set up property
                </button>
              </div>
            </form>

            <aside className="grid gap-4">
              <StatusPanel
                icon={ShieldCheck}
                title="Access is relationship-based"
                body="This profile starts by recording who you are in relation to the home."
              />
              <StatusPanel
                icon={FileText}
                title="Documents attach here next"
                body="Linked documents will appear against this property once the document flow is connected."
              />
              <StatusPanel
                icon={ClipboardList}
                title="Actions stay property-specific"
                body="Future tasks and reminders will be tied to this home record."
              />
            </aside>
          </section>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <p className="text-sm text-[var(--color-secondary)]">
                      Active property
                    </p>
                    <h2 className="mt-2 text-2xl font-normal text-[var(--color-text-default)]">
                      {selectedRecord.currentAddress?.addressLine1 ||
                        `Property ${selectedRecord.property.id}`}
                    </h2>
                    <p className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                      <MapPin size={16} aria-hidden="true" />
                      {[
                        selectedRecord.currentAddress?.townCity,
                        selectedRecord.currentAddress?.postcode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Address details incomplete"}
                    </p>
                  </div>
                  <span className="w-fit rounded-[var(--radius-full)] border border-[var(--color-border-default)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
                    {formatLabel(selectedRecord.relationship?.relationshipType)}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <SummaryMetric
                    icon={FileText}
                    label="Linked documents"
                    value={selectedRecord.linkedDocumentCount || 0}
                  />
                  <SummaryMetric
                    icon={ShieldCheck}
                    label="Current facts"
                    value={selectedRecord.currentFacts?.length || 0}
                  />
                  <SummaryMetric
                    icon={ClipboardList}
                    label="Open actions"
                    value={openTasks.length}
                  />
                </div>
              </div>

              <PreventionTasksPanel
                tasks={openTasks}
                loading={tasksLoading}
                generating={tasksGenerating}
                error={tasksError}
                updatingTaskId={updatingTaskId}
                onRefresh={() =>
                  loadTasks(selectedRecord.property.id, { refresh: true })
                }
                onUpdateStatus={handleTaskStatusUpdate}
              />

              <div className="grid gap-4 lg:grid-cols-3">
                <StatusPanel
                  icon={FileText}
                  title="Documents"
                  body={
                    selectedRecord.linkedDocumentCount
                      ? `${selectedRecord.linkedDocumentCount} document records are linked to this property.`
                      : "No linked documents yet."
                  }
                />
                <StatusPanel
                  icon={ShieldCheck}
                  title="Property facts"
                  body={
                    selectedRecord.currentFacts?.length
                      ? `${selectedRecord.currentFacts.length} current facts are recorded.`
                      : "No current facts yet."
                  }
                />
                <StatusPanel
                  icon={ClipboardList}
                  title="Next actions"
                  body={
                    openTasks.length
                      ? `${openTasks.length} open action${
                          openTasks.length === 1 ? "" : "s"
                        } to review.`
                      : "No open actions right now."
                  }
                />
              </div>
            </div>

            <aside className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-5">
              <h3 className="text-lg font-normal text-[var(--color-text-default)]">
                Profile details
              </h3>
              <dl className="mt-4">
                <DetailRow
                  label="Address line 1"
                  value={selectedRecord.currentAddress?.addressLine1}
                />
                <DetailRow
                  label="Town or city"
                  value={selectedRecord.currentAddress?.townCity}
                />
                <DetailRow
                  label="Postcode"
                  value={selectedRecord.currentAddress?.postcode}
                />
                <DetailRow
                  label="Property type"
                  value={formatLabel(selectedRecord.property?.propertyType)}
                />
                <DetailRow
                  label="Tenure"
                  value={formatLabel(selectedRecord.property?.tenure)}
                />
                <DetailRow
                  label="Permission"
                  value={formatLabel(selectedRecord.relationship?.permissionLevel)}
                />
                <DetailRow
                  label="Verification"
                  value={formatLabel(
                    selectedRecord.relationship?.verificationStatus
                  )}
                />
              </dl>
            </aside>
          </section>
        )}
      </div>
    </div>
  );
}
