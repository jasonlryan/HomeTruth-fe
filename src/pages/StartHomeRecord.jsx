import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { PublicFooter, PublicHeader } from "../components/homepage/Journey";
import { useAuth } from "../context/AuthContext";
import { HOME_RECORD_PATH, HOME_RECORD_REDIRECT } from "../utils/homeRecordEntry";
import "./account-entry.css";

const assetBase = process.env.PUBLIC_URL + "/assets/homepage/";
const previewPath = "/homepage-preview";

export default function StartHomeRecord() {
  const { user } = useAuth();
  const { state } = useLocation();
  const heading = useRef(null);
  const fromAnswer = state?.fromAnswer;

  useEffect(() => heading.current.focus(), []);

  return (
    <div className="ht-ui ht-journey ht-account">
      <PublicHeader assetBase={assetBase} homeHref={previewPath} />
      <main className="ht-account-main ht-record-entry">
        <h1 ref={heading} tabIndex={-1}>Start a home record</h1>
        <p>Add your property to keep its surveys, quotes and records of work together.</p>
        <div className="ht-journey-actions">
          {user ? (
            <Link className="ht-button" data-variant="record" to={HOME_RECORD_PATH} state={{ claimHomepageAnswer: true }}>
              Continue to property profile
            </Link>
          ) : (
            <>
              <Link className="ht-button" data-variant="record" to={"/register" + HOME_RECORD_REDIRECT}>Create an account</Link>
              <Link className="ht-button" data-variant="secondary" to={"/login" + HOME_RECORD_REDIRECT}>Log in</Link>
            </>
          )}
        </div>
        <p><Link to="/privacy-policy">How HomeTruth uses your information</Link></p>
        <p><Link to={fromAnswer ? previewPath + "#homepage-answer" : previewPath} replace>
          {fromAnswer ? "Back to your answer" : "Back to homepage options"}
        </Link></p>
      </main>
      <PublicFooter assetBase={assetBase} homeHref={previewPath} />
    </div>
  );
}
