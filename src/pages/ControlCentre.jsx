import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createPropertyFollowUp, getPropertyRecords, getPropertyTasks, updatePropertyTaskStatus } from "../api/api";
import HTGlyph from "../components/HTGlyph";
import { useAuth } from "../context/AuthContext";
import PageTitle from "../components/PageTitle";
import { Button, Field, Panel, Status } from "../components/homepage/HomeTruth";
import { groupPropertyTasks } from "../utils/controlCentreTasks";
import "../components/workspace.css";
import "./control-centre.css";

const writablePermissions = new Set(["contribute", "manage", "admin"]);
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const homeLabel = ({ currentAddress }) => (
  [currentAddress?.addressLine1, currentAddress?.townCity, currentAddress?.postcode].filter(Boolean).join(", ") || "Home without an address"
);

function TaskList({ tasks, empty, profilePath, propertyId, canContribute, userId, pending, onComplete }) {
  if (!tasks.length) return <p className="ht-workspace-muted">{empty}</p>;

  return (
    <ul className="ht-centre-list">
      {tasks.map(({ task, date, overdue }) => {
        const documentId = task.sourceType === "property_document" && task.metadata?.documentId;
        const canOpenPassage = task.hasSurveyPassage && userId != null && String(task.assignedUserId) === String(userId);
        const canComplete = task.sourceType === "manual" && (canContribute || (userId != null && String(task.assignedUserId) === String(userId)));
        return (
          <li key={task.id}>
            <h3>{task.title}</h3>
            {date && (
              <p className="ht-centre-date">
                <Status tone={overdue ? "review" : "neutral"} appearance="pill">{overdue ? "Overdue" : task.sourceType === "manual" ? "Saved due date" : "Date to check"}</Status>
                {overdue && task.sourceType !== "manual" && <span className="ht-workspace-muted">Date to check</span>}
                <time dateTime={date}>{dateFormat.format(new Date(date))}</time>
              </p>
            )}
            {task.description && <p className="ht-workspace-muted">{task.description}</p>}
            <div className="ht-centre-row-actions">
              {canOpenPassage ? (
                <Link className="ht-workspace-link" to={`/documents?propertyId=${encodeURIComponent(propertyId)}&followUp=${encodeURIComponent(task.id)}`}>
                  <HTGlyph name="document" size={16} className="mr-2 inline-block align-baseline" /> Open survey passage
                </Link>
              ) : documentId ? (
                <Link className="ht-workspace-link" to={`/documents?preview=${encodeURIComponent(documentId)}`} state={{ sourcePropertyId: propertyId, fromControlCentre: true }}>
                  Open document in Vault
                </Link>
              ) : task.sourceType !== "manual" && (
                <Link className="ht-workspace-link" to={profilePath + "#property-next-actions"}>Review in home record</Link>
              )}
              {canComplete && (
                <Button variant="text" aria-label={`Mark "${task.title}" complete`} disabled={pending} onClick={() => onComplete(task)}>
                  Mark complete
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function HomeTasks({ record, userId }) {
  const propertyId = record.property.id;
  const profilePath = `/property-profile?propertyId=${encodeURIComponent(propertyId)}`;
  const canContribute = writablePermissions.has(record.relationship?.permissionLevel);
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const request = useRef(null);
  const followUpsHeading = useRef(null);

  useEffect(() => {
    let active = true;
    getPropertyTasks(propertyId, { status: "open" })
      .then(tasks => { if (active) setResult({ tasks }); })
      .catch(() => { if (active) setResult({ failed: true }); });
    return () => { active = false; };
  }, [propertyId, attempt]);

  const retry = () => {
    setResult(null);
    setAttempt(value => value + 1);
  };

  const save = async event => {
    event.preventDefault();
    const cleaned = title.trim();
    if (pending || !cleaned) return;
    const values = { title: cleaned, dueDate: dueDate || null };
    const fingerprint = JSON.stringify(values);
    if (request.current?.fingerprint !== fingerprint) {
      request.current = { fingerprint, id: window.crypto.randomUUID() };
    }
    setPending(true);
    setError("");
    setNotice("");
    try {
      const task = await createPropertyFollowUp(propertyId, { ...values, requestId: request.current.id });
      if (!task?.id || String(task.propertyId) !== String(propertyId)) {
        throw new Error("Follow-up response did not match the selected home");
      }
      setResult(current => ({ tasks: [task, ...current.tasks.filter(item => item.id !== task.id)] }));
      request.current = null;
      setTitle("");
      setDueDate("");
      setFormOpen(false);
      setNotice("Follow-up saved.");
      followUpsHeading.current?.focus();
    } catch {
      setError("Couldn’t save the follow-up. Try again.");
    } finally {
      setPending(false);
    }
  };

  const complete = async task => {
    if (pending) return;
    setPending(true);
    setError("");
    setNotice("");
    try {
      await updatePropertyTaskStatus(propertyId, task.id, { status: "completed" });
      setResult(current => ({ tasks: current.tasks.filter(item => item.id !== task.id) }));
      setNotice("Follow-up marked complete.");
      followUpsHeading.current?.focus();
    } catch {
      setError("Couldn’t mark the follow-up complete. Try again.");
    } finally {
      setPending(false);
    }
  };

  if (!result) return <p className="ht-workspace-state" role="status">Loading this home’s events and follow-ups…</p>;
  if (result.failed) return (
    <div className="ht-workspace-state">
      <p role="alert">Couldn’t load this home’s events and follow-ups.</p>
      <Button variant="secondary" onClick={retry}>Try again</Button>
    </div>
  );

  const { upcoming, attention } = groupPropertyTasks(result.tasks, propertyId);
  const listProps = { profilePath, propertyId, canContribute, userId, pending, onComplete: complete };

  return (
    <>
      <div role="status" className={notice ? "ht-workspace-state" : "sr-only"}>{notice}</div>
      {error && <p role="alert" className="ht-workspace-state">{error}</p>}
      <div className="ht-centre-grid">
        <Panel aria-labelledby="centre-upcoming" className="ht-panel ht-centre-section">
          <h2 id="centre-upcoming" className="ht-centre-heading"><HTGlyph name="calendar" size={20} /> Upcoming events</h2>
          <TaskList {...listProps} tasks={upcoming} empty="There are no upcoming dates recorded for this home." />
        </Panel>
        <Panel aria-labelledby="centre-follow-ups" className="ht-panel ht-centre-section">
          <div className="ht-centre-section-header">
            <h2 id="centre-follow-ups" tabIndex={-1} ref={followUpsHeading} className="ht-centre-heading"><HTGlyph name="task" size={20} /> Needs attention</h2>
            {canContribute && <Button variant="secondary" aria-expanded={formOpen} aria-controls="centre-follow-up-form" onClick={() => setFormOpen(value => !value)} disabled={pending}>
              {formOpen ? "Close form" : "Add follow-up"}
            </Button>}
          </div>
          <div id="centre-follow-up-form" hidden={!formOpen}>
            {formOpen && (
              <form className="ht-centre-form" onSubmit={save}>
                <Field id="centre-task-title" label="Follow-up" value={title} onChange={event => setTitle(event.target.value)} maxLength={180} required disabled={pending} />
                <Field id="centre-task-date" label="Due date (optional)" type="date" min="1000-01-01" max="9999-12-31" value={dueDate} onChange={event => setDueDate(event.target.value)} disabled={pending} />
                <button type="submit" className="ht-workspace-primary" disabled={pending || !title.trim()}>{pending ? "Saving…" : "Save follow-up"}</button>
              </form>
            )}
          </div>
          <TaskList {...listProps} tasks={attention} empty="There are no overdue items or undated follow-ups for this home." />
        </Panel>
      </div>
    </>
  );
}

export default function ControlCentre() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [homes, setHomes] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const requestedId = params.get("propertyId");
  const selected = homes?.find(record => String(record.property.id) === requestedId) ?? (!requestedId && homes?.[0]);
  const selectedId = selected ? String(selected.property.id) : "";

  useEffect(() => {
    let active = true;
    getPropertyRecords()
      .then(records => { if (active) setHomes(records.filter(record => record.property?.id)); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [attempt]);

  const retry = () => {
    setFailed(false);
    setAttempt(value => value + 1);
  };

  return (
    <div className="ht-workspace-page ht-centre">
      <header className="ht-centre-header">
        <div>
          <PageTitle>Control centre</PageTitle>
          <p className="ht-workspace-muted">Upcoming dates and follow-ups for your home.</p>
        </div>
        {selected && <Link className="ht-workspace-control" to={`/property-profile?propertyId=${encodeURIComponent(selectedId)}`}><HTGlyph name="home" size={18} /> Open home record</Link>}
      </header>

      {homes?.length > 0 && (
        <div className="ht-centre-home">
          {homes.length > 1 || !selected ? (
            <div className="ht-field">
              <label htmlFor="centre-home">Selected home</label>
              <select id="centre-home" value={selectedId} onChange={event => setParams({ propertyId: event.target.value })}>
                {!selected && <option value="" disabled>Choose a home</option>}
                {homes.map(home => <option key={home.property.id} value={home.property.id}>{homeLabel(home)}</option>)}
              </select>
            </div>
          ) : (
            <p className="ht-centre-heading"><HTGlyph name="home" size={22} /> {homeLabel(selected)}</p>
          )}
        </div>
      )}

      {selected && <HomeTasks key={selectedId} record={selected} userId={user?.id} />}
      {failed && <div className="ht-workspace-state"><p role="alert">Couldn’t load your homes.</p><Button variant="secondary" onClick={retry}>Try again</Button></div>}
      {!homes && !failed && <p className="ht-workspace-state" role="status">Loading your homes…</p>}
      {homes?.length === 0 && (
        <Panel className="ht-panel ht-centre-section">
          <h2>Start a home record</h2>
          <p>Once you’ve added a home, you can keep its dates and follow-ups here.</p>
          <Link className="ht-workspace-control" to="/property-profile">Set up a home record</Link>
        </Panel>
      )}
      {homes?.length > 0 && !selected && <p className="ht-workspace-state" role="status">That home is unavailable. Choose a home you can access.</p>}
    </div>
  );
}
