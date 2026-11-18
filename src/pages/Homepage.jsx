import { useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { askAnonymousAI } from "../api/api";
import Journey from "../components/homepage/Journey";
import { useAuth } from "../context/AuthContext";
import { getHomeRecordGuestSession, HOME_RECORD_REDIRECT, setHomeRecordGuestSession } from "../utils/homeRecordEntry";

const assetBase = process.env.PUBLIC_URL + "/assets/homepage/";
const accountLinks = {
  register: "/register" + HOME_RECORD_REDIRECT,
  login: "/login" + HOME_RECORD_REDIRECT,
};

export default function Homepage() {
  const { user } = useAuth();
  const sessionId = useRef(getHomeRecordGuestSession());
  const { hash } = useLocation();

  const ask = async question => {
    try {
      const data = await askAnonymousAI(question, sessionId.current);
      sessionId.current = data.session_id || sessionId.current;
      return { text: data.reply, limited: data.conversationEnded || data.remainingQuestions === 0 };
    } catch (error) {
      const response = error?.response;
      if (response?.status === 429 || response?.data?.conversationEnded) return { limited: true };
      throw error;
    }
  };

  if (hash === "#how-it-works") return <Navigate to="/how-it-works" replace />;

  return (
    <Journey assetBase={assetBase} ask={ask} getAccountLinks={() => accountLinks}
      loginHref={user ? "/dashboard" : "/login"} loginLabel={user ? "Go to dashboard" : undefined}
      onAccountHandoff={() => setHomeRecordGuestSession(sessionId.current)} />
  );
}
