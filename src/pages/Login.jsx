import { useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { loginUser, claimGuestSession } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Button, Field } from "../components/homepage/HomeTruth";
import AccountPage, { AccountPasswordField } from "../components/homepage/AccountPage";
import { localMayaEntry } from "../utils/demoEntry";
import { getEntryPartnerInvite, HOME_RECORD_PATH, HOME_RECORD_REDIRECT } from "../utils/homeRecordEntry";

function comingSoonDestination(user) {
  return user?.role === "admin" ? "/admin" : "/";
}

export default function Login({ comingSoon = false }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const { login, user: signedInUser, loading: checkingSession } = useAuth();
  const loginSucceeded = useRef(false);
  const redirectTo = searchParams.get("redirect") || null;
  const startingRecord = redirectTo === HOME_RECORD_PATH;
  const partnerInvite = getEntryPartnerInvite(searchParams, startingRecord);
  const guestSessionId = searchParams.get("guest_session_id") || sessionStorage.getItem("guest_session_id_redirect") || null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [pending, setPending] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    await signIn(false);
  };

  const signIn = async localAdmin => {
    if (pending) return;
    setError("");
    setEmailError("");
    setPasswordError("");

    let valid = true;
    if (!localAdmin && !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }
    if (!localAdmin && password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    }
    if (!valid) return;

    setPending(true);
    try {
      let res;
      if (localAdmin) {
        const response = await fetch("/_local/admin-login", {
          method: "POST",
          headers: { "X-HomeTruth-Local-Admin": "1" },
        });
        res = await response.json();
        if (!response.ok) throw new Error(res.message || "Temporary admin login failed.");
      } else {
        res = await loginUser({ email, password });
      }

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
      localStorage.setItem("user_email", localAdmin ? user.email : email);

      // Handle extension redirect if present
      const redirectUri = new URLSearchParams(window.location.search).get(
        "redirect_uri"
      );

      if (!localAdmin && redirectUri?.startsWith("chrome-extension://")) {
        window.location.href = `${redirectUri}#access_token=${token}`;
        return;
      }

      if (comingSoon) {
        navigate(comingSoonDestination(user), { replace: true });
        return;
      }

      if (!localAdmin && partnerInvite) {
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
      
      if (isNewUser && !localAdmin) {
        // Redirect new users to welcome page
        navigate("/welcome", { replace: true, state: { startHomeRecord: startingRecord } });
      } else if (localAdmin ? startingRecord : redirectTo?.startsWith("/")) {
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

  const showLocalMaya = localMayaEntry();
  const switchingLocalAccount = showLocalMaya && searchParams.get("switch") === "1";
  if (checkingSession) return null;
  if (signedInUser && !loginSucceeded.current && !switchingLocalAccount) {
    if (comingSoon) return <Navigate to={comingSoonDestination(signedInUser)} replace />;
    if (startingRecord) return <Navigate to={HOME_RECORD_PATH} replace state={{ claimHomepageAnswer: true }} />;
    return <Navigate to="/dashboard" replace />;
  }

  const showLocalAdmin = process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_LOCAL_ADMIN_LOGIN === "true" &&
    ["localhost:3014", "127.0.0.1:3014"].includes(window.location.host);

  const registrationHref = partnerInvite
    ? `/register?partner_invite=${encodeURIComponent(partnerInvite)}&redirect=/partner/${encodeURIComponent(partnerInvite)}`
    : startingRecord ? "/register" + HOME_RECORD_REDIRECT : "/register";

  return (
    <AccountPage title="Log in to HomeTruth" description={startingRecord ? "Log in to set up or return to your home record." : undefined}>
      {state?.accountCreated && <p role="status">Account created. Log in to continue.</p>}
      <form onSubmit={handleLogin}>
        <Field id="login-email" label="Email" type="email" autoComplete="username"
          required value={email} error={emailError} onChange={event => setEmail(event.target.value)} />
        <AccountPasswordField id="login-password" autoComplete="current-password"
          required value={password} error={passwordError} onChange={event => setPassword(event.target.value)} />
        <a href="/forgot-password">Forgot your password?</a>
        {error && <p className="ht-error" role="alert">{error}</p>}
        <Button variant="cyan" type="submit" pending={pending}>{pending ? "Logging in…" : "Log in"}</Button>
      </form>
      {(showLocalAdmin || showLocalMaya) && (
        <div className="ht-journey-actions" aria-label="Local demo sign-in">
          {showLocalMaya && <Button variant="secondary" disabled={pending} onClick={() => navigate("/demo?to=appliances")}>Log in as Maya</Button>}
          {showLocalAdmin && <Button variant="secondary" disabled={pending} onClick={() => signIn(true)}>Admin login · localhost only</Button>}
        </div>
      )}
      {!comingSoon && <p>New to HomeTruth? <a href={registrationHref}>Create an account</a></p>}
    </AccountPage>
  );
}
