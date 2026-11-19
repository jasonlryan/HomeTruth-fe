import { useRef, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { loginUser, claimGuestSession } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Button, Field, HTIcon } from "../components/homepage/HomeTruth";
import { PublicFooter, PublicHeader } from "../components/homepage/Journey";
import { getEntryPartnerInvite, HOME_RECORD_PATH, HOME_RECORD_REDIRECT } from "../utils/homeRecordEntry";
import "./account-entry.css";

const assetBase = process.env.PUBLIC_URL + "/assets/homepage/";

function comingSoonDestination(user) {
  return user?.role === "admin" ? "/admin" : "/";
}

export default function Login({ comingSoon = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, user: signedInUser, loading: checkingSession } = useAuth();
  const loginSucceeded = useRef(false);
  const redirectTo = searchParams.get("redirect") || null;
  const startingRecord = redirectTo === HOME_RECORD_PATH;
  const openingControlCentre = redirectTo === "/control-centre" || redirectTo?.startsWith("/control-centre?");
  const partnerInvite = getEntryPartnerInvite(searchParams, startingRecord || openingControlCentre);
  const guestSessionId = searchParams.get("guest_session_id") || sessionStorage.getItem("guest_session_id_redirect") || null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (pending) return;
    setError("");
    setEmailError("");
    setPasswordError("");

    let valid = true;
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    }
    if (!valid) return;

    setPending(true);
    try {
      // Regular user login
      const res = await loginUser({ email, password });

      const token = res.data?.token || res.data?.data?.token;
      const user = res.data?.user || res.data?.data?.user;
      const userRole = user?.role;

      if (!token) throw new Error("Token not found in response.");

      loginSucceeded.current = true;
      login(token, user);

      if (userRole) {
        localStorage.setItem("user_role", userRole);
      }

      const { first_name, last_name } = user || {};
      if (first_name && last_name) {
        localStorage.setItem("user_name", `${first_name} ${last_name}`);
        // Don't override new_user flag - let it be determined by registration or previous state
      } else {
        localStorage.setItem("require_profile", "true");
      }
      localStorage.setItem("user_email", email);

      // Handle extension redirect if present
      const redirectUri = new URLSearchParams(window.location.search).get(
        "redirect_uri"
      );

      if (redirectUri?.startsWith("chrome-extension://")) {
        window.location.href = `${redirectUri}#access_token=${token}`;
        return;
      }

      if (comingSoon) {
        navigate(comingSoonDestination(user), { replace: true });
        return;
      }

      if (partnerInvite) {
        localStorage.setItem("partner_invite_code", partnerInvite);
        const partnerRedirect =
          redirectTo?.startsWith("/partner/")
            ? redirectTo
            : `/partner/${encodeURIComponent(partnerInvite)}`;
        navigate(partnerRedirect, { replace: true });
        return;
      }

      // Guest session continuity: claim guest chat and redirect to Ask AI with conversation
      if (guestSessionId && (redirectTo === "/ask-ai" || redirectTo === "ask-ai")) {
        try {
          sessionStorage.removeItem("guest_session_id_redirect");
          const data = await claimGuestSession(guestSessionId);
          const conversation_id = data?.conversation_id;
          if (conversation_id) {
            try {
              sessionStorage.setItem("ask_ai_open_conversation_id", conversation_id);
            } catch (_) {}
          }
          navigate("/ask-ai", { replace: true, state: { conversationId: conversation_id } });
          return;
        } catch (claimErr) {
          console.warn("Claim guest session failed:", claimErr);
          navigate("/ask-ai", { replace: true });
          return;
        }
      }

      // Check if this is a new user
      const isNewUser = localStorage.getItem("new_user") === "true";
      
      if (isNewUser) {
        // Redirect new users to welcome page
        navigate("/welcome", { replace: true, state: { startHomeRecord: startingRecord } });
      } else if (redirectTo?.startsWith("/")) {
        navigate(redirectTo, { replace: true, state: { claimHomepageAnswer: startingRecord } });
      } else {
        // Default behavior (normal login) - Dashboard will check for quiz completion
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.status === 401) {
        setPasswordError("Invalid email or password.");
        return;
      }

      const serverMessage =
        err.response?.data?.message || err.message || "Login failed.";
      const field = err.response?.data?.field;
      if (field === "email") {
        setEmailError(serverMessage);
      } else if (field === "password") {
        setPasswordError(serverMessage);
      } else {
        setError(serverMessage);
      }
    } finally {
      setPending(false);
    }
  };

  if (checkingSession) return null;
  if (signedInUser && !loginSucceeded.current) {
    if (comingSoon) return <Navigate to={comingSoonDestination(signedInUser)} replace />;
    if (startingRecord) return <Navigate to={HOME_RECORD_PATH} replace state={{ claimHomepageAnswer: true }} />;
    return <Navigate to={openingControlCentre ? redirectTo : "/dashboard"} replace />;
  }

  const registrationHref = partnerInvite
    ? `/register?partner_invite=${encodeURIComponent(partnerInvite)}&redirect=/partner/${encodeURIComponent(partnerInvite)}`
    : startingRecord ? "/register" + HOME_RECORD_REDIRECT : "/register";

  return (
    <div className="ht-ui ht-journey ht-account">
      <PublicHeader assetBase={assetBase} homeHref="/" />
      <main className="ht-account-main">
        <h1>Log in to HomeTruth</h1>
        {startingRecord && <p>Log in to set up or return to your home record.</p>}
        <form onSubmit={handleLogin}>
          <Field id="login-email" label="Email" type="email" autoComplete="username"
            required value={email} error={emailError} onChange={event => setEmail(event.target.value)} />
          <div className="ht-account-password">
            <Field id="login-password" label="Password" type={showPassword ? "text" : "password"}
              autoComplete="current-password" required value={password} error={passwordError}
              onChange={event => setPassword(event.target.value)} />
            <button className="ht-account-visibility" type="button" aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(value => !value)}>
              <HTIcon name="visible" assetBase={assetBase + "icons/"} />
            </button>
          </div>
          <a href="/forgot-password">Forgot your password?</a>
          {error && <p className="ht-error" role="alert">{error}</p>}
          <Button variant="cyan" type="submit" pending={pending}>{pending ? "Logging in…" : "Log in"}</Button>
        </form>
        {!comingSoon && <p>New to HomeTruth? <a href={registrationHref}>Create an account</a></p>}
      </main>
      <PublicFooter assetBase={assetBase} homeHref="/" />
    </div>
  );
}
