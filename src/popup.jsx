// src/popup.jsx
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

/* global chrome */
const Popup = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    chrome.storage.local.get("authToken", ({ authToken }) => {
      if (authToken) {
        setToken(authToken);
        setLoggedIn(true);
      }
    });
  }, []);

  const handleLoginClick = () => {
    // DEV ONLY: Open login page in new tab since launchWebAuthFlow won't work with HTTP
    const devLoginUrl = "https://5405077bb50b.ngrok-free.app/login";

    chrome.tabs.create({ url: devLoginUrl });
  };

  const handleSetDevToken = () => {
    const fakeToken = "dev-fake-token";
    chrome.storage.local.set({ authToken: fakeToken }, () => {
      setToken(fakeToken);
      setLoggedIn(true);
    });
  };

  const handleLogout = () => {
    chrome.storage.local.remove("authToken", () => {
      setToken(null);
      setLoggedIn(false);
    });
  };

  return (
    <div className="p-4 w-80 text-sm font-sans">
      <h2 className="text-lg mb-2">🔐 Extension Login</h2>

      {!loggedIn ? (
        <>
          <button onClick={handleLoginClick} className="mb-2">
            Login via Website (opens new tab)
          </button>
          <button onClick={handleSetDevToken} className="text-xs text-blue-600 underline">
            Use Dev Token
          </button>
        </>
      ) : (
        <>
          <p className="text-green-600 mb-2">✅ Logged in with token:</p>
          <code className="break-all block mb-2">{token}</code>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<Popup />);
