import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import Journey from "../components/homepage/Journey";
import { routes } from "../components/homepage/HomeTruth";

const replies = [
  "Ask what the surveyor actually saw, which areas they could inspect, and what they still can’t tell you. Then ask **which finding needs follow-up before you commit**. If they suggest a specialist inspection, ask what it should confirm and whether it’s urgent.",
  "Check exactly what the quote covers, which materials are included, and who will deal with access, waste and making good. Ask the contractor to list any exclusions in writing and explain how they’ll price changes before doing extra work.",
  "Gather the dated quote, final invoice, relevant certificates and warranties. Keep them together by job, with a date and a short description of what changed. That gives you something concrete to show buyers when they ask about the work.",
];

const accountLinks = { register: "#create-account", login: "#log-in" };

async function askSample(question) {
  const index = routes.findIndex(route => route.question === question);
  await new Promise(resolve => setTimeout(resolve, 400));
  return { text: index >= 0 ? replies[index] : "For this walkthrough, choose a route and submit its example question. The live HomeTruth journey handles your own questions." };
}

function Reference() {
  const [handoff, setHandoff] = useState("");
  return (
    <>
      <aside className="preview-label">Component walkthrough · sample responses <a href="../../index.html#homepage-journey">Back to catalogue</a></aside>
      <Journey assetBase="./src/components/homepage/assets/" ask={askSample} getAccountLinks={() => accountLinks} homeHref="./"
        onAccountChoice={choice => setHandoff(choice === "register"
          ? "The live app now opens registration and takes new users into onboarding."
          : "The live app now opens sign-in and takes returning users to their property profile.")} />
      <div className="preview-handoff" hidden={!handoff}>
        <span role="status">{handoff}</span> <button onClick={() => setHandoff("")}>Dismiss</button>
      </div>
    </>
  );
}

createRoot(document.getElementById("homepage-reference")).render(<Reference />);
