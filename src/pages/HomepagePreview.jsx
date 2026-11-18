import { useRef } from "react";
import { askAnonymousAI } from "../api/api";
import Journey from "../components/homepage/Journey";

const assetBase = process.env.PUBLIC_URL + "/assets/homepage/";
const accountLinks = {
  register: "/register?redirect=%2Fproperty-profile",
  login: "/login?redirect=%2Fproperty-profile",
};

export default function HomepagePreview() {
  const sessionId = useRef(null);

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

  return <Journey assetBase={assetBase} ask={ask} getAccountLinks={() => accountLinks} homeHref="/homepage-preview" />;
}
