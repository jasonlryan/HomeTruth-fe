import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HTGlyph from "../components/HTGlyph";
import { Badge, Button, Field, Panel, Status } from "../components/homepage/HomeTruth";
import "./control-centre-preview.css";

const screens = {
  record: "Control centre",
  vault: "Vault · Surveys",
  review: "Review the survey",
  source: "Survey evidence",
  task: "Add a follow-up",
  appliance: "Boiler",
  connection: "Energy meter connection",
};
const finding = "Staining below the front gutter";
const source = "Pre-purchase survey · Page 8";
const excerpt = "Localised staining was observed on the brickwork directly below the front gutter. The gutter was not tested during the inspection. The cause was not established.";
const defaultTask = "Ask the surveyor what needs checking at the front gutter.";

export default function ControlCentrePreview() {
  const [screen, setScreen] = useState("record");
  const [draft, setDraft] = useState(defaultTask);
  const [followUp, setFollowUp] = useState("");
  const heading = useRef(null);

  useEffect(() => heading.current.focus({ preventScroll: true }), [screen]);

  const save = event => {
    event.preventDefault();
    if (!draft.trim()) return;
    setFollowUp(draft.trim());
    setScreen("record");
  };

  return (
    <div className="ht-ui ht-control-preview">
      <header className="ht-control-header">
        <div className="ht-control-width">
          <Link to="/homepage-preview"><img src={process.env.PUBLIC_URL + "/assets/brand/hometruth-logo.svg"} alt="HomeTruth" width="174" /></Link>
          <Link to="/admin/user-flows?flow=HT-FLOW-002" className="ht-button" data-variant="secondary">Buying blueprint</Link>
        </div>
      </header>

      <main className="ht-control-width ht-control-main">
        <div className="ht-control-context"><HTGlyph name="home" size={20} /> 48 Orchard Road <Badge>Owner</Badge></div>
        <h1 ref={heading} tabIndex={-1}>{screens[screen]}</h1>
        <p className="ht-control-muted">{screen === "record" ? "What’s coming up and what needs your attention." : "Sample property · Review preview"}</p>
        {screen !== "record" && <Button variant="text" onClick={() => setScreen("record")}>Back to Control centre</Button>}

        <div className="ht-control-grid">
          <div className="ht-control-primary">
            {screen === "record" && (
              <>
                <Panel className="ht-panel" aria-labelledby="upcoming-title">
                  <h2 id="upcoming-title"><HTGlyph name="calendar" /> Upcoming</h2>
                  <h3>Boiler service booked</h3>
                  <p><time dateTime="2026-11-25">25 November 2026</time></p>
                  <p className="ht-control-muted">Date from the service booking confirmation.</p>
                  <Button variant="text" onClick={() => setScreen("appliance")}>Open boiler record</Button>
                </Panel>
                <Panel className="ht-panel" aria-labelledby="attention-title">
                  <h2 id="attention-title"><HTGlyph name="task" /> Needs attention</h2>
                  {followUp && (
                    <div className="ht-control-task">
                      <Status tone="review" appearance="pill">Open</Status>
                      <h3>{followUp}</h3>
                      <p className="ht-control-muted">{source}</p>
                      <Button variant="text" onClick={() => setScreen("source")}>Reopen survey evidence</Button>
                    </div>
                  )}
                  <h3>Energy meter data is out of date</h3>
                  <p className="ht-control-muted">Last successful refresh · 15 November</p>
                  <Button variant="text" onClick={() => setScreen("connection")}>Review connection</Button>
                </Panel>
              </>
            )}

            {screen === "vault" && (
              <Panel className="ht-panel" aria-labelledby="vault-survey">
                <h2 id="vault-survey"><HTGlyph name="survey" /> Pre-purchase survey</h2>
                <p>Survey for 48 Orchard Road</p>
                <Button variant="secondary" onClick={() => setScreen("review")}>Review survey finding</Button>
              </Panel>
            )}

            {screen === "review" && (
              <Panel className="ht-panel" aria-labelledby="survey-finding">
                <Status tone="review" appearance="pill">Needs checking</Status>
                <h2 id="survey-finding"><HTGlyph name="survey" /> {finding}</h2>
                <p>The surveyor saw staining below the gutter. The inspection left the cause open.</p>
                <div className="ht-control-actions">
                  <Button variant="secondary" onClick={() => setScreen("source")}><HTGlyph name="source" size={16} /> Read the source passage</Button>
                  <Button variant="text" onClick={() => setScreen("task")}>Add a follow-up</Button>
                </div>
              </Panel>
            )}

            {screen === "source" && (
              <Panel className="ht-panel" aria-labelledby="survey-source">
                <h2 id="survey-source"><HTGlyph name="document" /> {source}</h2>
                <blockquote>{excerpt}</blockquote>
                <p className="ht-control-muted">Observation from the survey. The cause is still unknown.</p>
                <div className="ht-control-actions">
                  <Button variant="secondary" onClick={() => setScreen("task")}>Add a follow-up</Button>
                  <Button variant="text" onClick={() => setScreen("review")}>Back to survey review</Button>
                </div>
              </Panel>
            )}

            {screen === "task" && (
              <Panel className="ht-panel" aria-labelledby="follow-up-title">
                <h2 id="follow-up-title"><HTGlyph name="task" /> What do you want to check?</h2>
                <form onSubmit={save}>
                  <Field id="follow-up" label="Follow-up" multiline rows={3} required value={draft} onChange={event => setDraft(event.target.value)} />
                  <p className="ht-control-muted">Source attached · {source}</p>
                  <div className="ht-control-actions">
                    <Button variant="secondary" type="submit" disabled={!draft.trim()}><HTGlyph name="save" size={16} /> Save to home record</Button>
                    <Button variant="text" onClick={() => setScreen("source")}>Back to survey evidence</Button>
                  </div>
                </form>
              </Panel>
            )}

            {screen === "appliance" && (
              <Panel className="ht-panel" aria-labelledby="boiler-manual">
                <h2 id="boiler-manual"><HTGlyph name="manual" /> Manufacturer’s manual</h2>
                <p>The manual is associated with the confirmed boiler model so you can find it again from this item.</p>
                <p className="ht-control-muted">Sample item record. Manufacturer PDF unavailable in this preview.</p>
              </Panel>
            )}

            {screen === "connection" && (
              <Panel className="ht-panel" aria-labelledby="meter-access">
                <h2 id="meter-access"><HTGlyph name="connection" /> Connection details</h2>
                <Status tone="review" appearance="pill">Data out of date</Status>
                <p>Illustrative read access · Energy readings for this home</p>
                <p className="ht-control-muted">Last successful refresh · 15 November. Account access and disconnect would be managed in Settings → Connections.</p>
              </Panel>
            )}
          </div>

          <aside className="ht-control-aside" aria-label="Property record context">
            <Panel className="ht-panel">
              <h2><HTGlyph name="history" /> In progress</h2>
              <p>Survey follow-ups from purchase</p>
              <p className="ht-control-muted">{followUp ? "1 open follow-up" : "1 finding to check"}</p>
              {screen !== "review" && <Button variant="text" onClick={() => setScreen("vault")}>Resume in Vault</Button>}
            </Panel>
            <Panel className="ht-panel">
              <h2><HTGlyph name="documents" /> Vault</h2>
              <p>Pre-purchase survey</p>
              <Button variant="text" onClick={() => setScreen("vault")}>Open surveys in Vault</Button>
            </Panel>
            <Panel className="ht-panel">
              <h2><HTGlyph name="appliance" /> Appliances &amp; devices</h2>
              <p>Boiler · Manual available</p>
              <Button variant="text" onClick={() => setScreen("appliance")}>View boiler and manual</Button>
            </Panel>
          </aside>
        </div>
      </main>
    </div>
  );
}
