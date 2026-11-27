import { useRef } from "react";
import { Link, Navigate, useLocation, useOutlet } from "react-router-dom";
import { askAnonymousAI } from "../api/api";
import Journey from "../components/homepage/Journey";
import QuestionOptions from "../components/homepage/QuestionOptions";
import { isManualAction, localManualAskEnabled } from "../features/items/manualAskContext";
import { useAuth } from "../context/AuthContext";
import { clearHomeRecordTask, getHomeRecordGuestSession, HOME_RECORD_REDIRECT, setHomeRecordGuestSession } from "../utils/homeRecordEntry";

const assetBase = process.env.PUBLIC_URL + "/assets/homepage/";
const accountLinks = {
  register: "/register" + HOME_RECORD_REDIRECT,
  login: "/login" + HOME_RECORD_REDIRECT,
};

function RecordLink({ homeHref, fromAnswer, onClick, children }) {
  return <Link className="ht-button" data-variant="secondary" to={homeHref.replace(/\/$/, "") + "/start-home-record"}
    state={{ fromAnswer }} onClick={onClick}>{children}</Link>;
}

export default function Homepage({ questionHome }) {
  const { user, loading } = useAuth();
  const sessionId = useRef(getHomeRecordGuestSession());
  const { hash } = useLocation();
  const setupPage = useOutlet();
  const onPublicHomepage = questionHome === "/";

  const ask = async question => {
    if (onPublicHomepage) clearHomeRecordTask();
    try {
      const data = await askAnonymousAI(question, sessionId.current);
      sessionId.current = data.session_id || sessionId.current;
      if (onPublicHomepage && data.reply?.trim()) {
        setHomeRecordGuestSession(sessionId.current);
      }
      return { text: data.reply, action: localManualAskEnabled && isManualAction(data.actions), limited: data.conversationEnded || data.remainingQuestions === 0 };
    } catch (error) {
      const response = error?.response;
      if (response?.status === 429 || response?.data?.conversationEnded) return { limited: true };
      throw error;
    }
  };

  if (onPublicHomepage && loading) return null;
  if (onPublicHomepage && !setupPage && user && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (hash === "#how-it-works") return <Navigate to="/how-it-works" replace />;

  return (
    <>
      <div hidden={Boolean(setupPage)}>
        <Journey assetBase={assetBase} ask={ask} getAccountLinks={() => accountLinks}
          Composer={questionHome ? QuestionOptions : undefined} RecordLink={questionHome ? RecordLink : undefined}
          homeHref={questionHome || "/"} manualPreviewHref={onPublicHomepage ? "/find-my-manual" : undefined}
          loginHref={user ? "/dashboard" : "/login"} loginLabel={user ? "Go to dashboard" : undefined}
          loginHrefWithAnswer={onPublicHomepage && !user ? accountLinks.login : undefined}
          onAccountHandoff={() => setHomeRecordGuestSession(sessionId.current)} />
      </div>
      {setupPage}
    </>
  );
}
