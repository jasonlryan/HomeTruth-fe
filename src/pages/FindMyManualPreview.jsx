import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import HTGlyph from "../components/HTGlyph";
import { Panel, Status } from "../components/homepage/HomeTruth";
import { PublicFooter, PublicHeader } from "../components/homepage/Journey";
import { useAuth } from "../context/AuthContext";
import { FIND_APPLIANCE_MANUAL_ACTION, HOME_RECORD_PATH, HOME_RECORD_REDIRECT, setHomeRecordTask } from "../utils/homeRecordEntry";
import "./account-entry.css";

const assetBase = process.env.PUBLIC_URL + "/assets/homepage/";

export default function FindMyManualPreview() {
  const { user } = useAuth();
  const heading = useRef(null);
  const keepTask = () => setHomeRecordTask(FIND_APPLIANCE_MANUAL_ACTION);

  useEffect(() => { heading.current?.focus(); }, []);

  return (
    <div className="ht-ui ht-journey ht-account">
      <PublicHeader assetBase={assetBase} homeHref="/" />
      <main className="ht-account-main ht-record-entry ht-manual-preview">
        <Status tone="neutral" appearance="pill">Truth agent preview</Status>
        <h1 ref={heading} tabIndex={-1}>Find my manual</h1>
        <p>See how the Truth agent would find the right manual for a washing machine.</p>

        <Panel className="ht-panel ht-manual-example" aria-labelledby="sample-washer-title">
          <h2 id="sample-washer-title"><HTGlyph name="appliance" size={24} /> Example washing machine</h2>
          <dl>
            <div><dt>Model on the appliance label</dt><dd>HT-WM800</dd></div>
            <div><dt>Manufacturer manual to review</dt><dd>HT-WM800 use and care guide (sample)</dd></div>
          </dl>
        </Panel>

        <ol className="ht-manual-steps">
          <li>Check the full model number on the washer’s label.</li>
          <li>Review the manufacturer’s guide and confirm it matches.</li>
          <li>HomeTruth verifies the manual and saves it to that washer’s record.</li>
        </ol>
        <p>Live manual lookup is awaiting pilot access. This example uses a fictional washer.</p>
        <div className="ht-journey-actions">
          {user ? (
            <Link className="ht-button" data-variant="record" to={HOME_RECORD_PATH} state={{ claimHomepageAnswer: true }} onClick={keepTask}>Open home record</Link>
          ) : (
            <>
              <Link className="ht-button" data-variant="record" to={"/register" + HOME_RECORD_REDIRECT} onClick={keepTask}>Create an account</Link>
              <Link className="ht-button" data-variant="secondary" to={"/login" + HOME_RECORD_REDIRECT} onClick={keepTask}>Log in and keep this task</Link>
            </>
          )}
        </div>
        <p><Link to="/">Back to homepage</Link></p>
      </main>
      <PublicFooter assetBase={assetBase} homeHref="/" />
    </div>
  );
}
