import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { registerUser } from "../api/api";
import AccountPage, { AccountPasswordField } from "../components/homepage/AccountPage";
import { Button, Field } from "../components/homepage/HomeTruth";
import { getEntryPartnerInvite, hasHomeRecordTask, HOME_RECORD_PATH } from "../utils/homeRecordEntry";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";
  const startingRecord = redirectTo === HOME_RECORD_PATH;
  const partnerInvite = getEntryPartnerInvite(searchParams, startingRecord);
  const guestSessionId = searchParams.get("guest_session_id") || sessionStorage.getItem("guest_session_id_redirect") || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const loginQuery = new URLSearchParams();
  const loginDestination = partnerInvite && !redirectTo.startsWith("/partner/")
    ? `/partner/${encodeURIComponent(partnerInvite)}`
    : redirectTo;
  if (loginDestination) loginQuery.set("redirect", loginDestination);
  if (guestSessionId) loginQuery.set("guest_session_id", guestSessionId);
  if (partnerInvite) loginQuery.set("partner_invite", partnerInvite);
  const loginHref = loginQuery.size ? `/login?${loginQuery}` : "/login";

  async function handleRegister(event) {
    event.preventDefault();
    if (pending) return;
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!/[A-Z]/.test(password) || !/\d/.test(password)) {
      setError("Password must include at least one capital letter and one number.");
      return;
    }

    setPending(true);
    try {
      await registerUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        confirmPassword: confirm,
        home_address: homeAddress.trim() || undefined,
      });

      localStorage.setItem("new_user", "true");
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_name", `${firstName} ${lastName}`);
      if (partnerInvite) localStorage.setItem("partner_invite_code", partnerInvite);

      navigate(loginHref, { replace: true, state: { accountCreated: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
      setPending(false);
    }
  }

  let description;
  if (startingRecord) {
    description = hasHomeRecordTask()
      ? "Set up your home record and return to Find my manual."
      : "Set up your home record.";
  }

  return (
    <AccountPage title="Create your account" description={description}>
      <form onSubmit={handleRegister}>
        <div className="ht-account-name-row">
          <Field id="register-first-name" label="First name" autoComplete="given-name" required
            value={firstName} onChange={event => setFirstName(event.target.value)} />
          <Field id="register-last-name" label="Last name" autoComplete="family-name" required
            value={lastName} onChange={event => setLastName(event.target.value)} />
        </div>
        <Field id="register-email" label="Email" type="email" autoComplete="email" required
          value={email} onChange={event => setEmail(event.target.value)} />
        <Field id="register-address" label="Home address (optional)" autoComplete="street-address"
          value={homeAddress} onChange={event => setHomeAddress(event.target.value)} />
        <AccountPasswordField id="register-password" autoComplete="new-password" required
          hint="Use at least one capital letter and one number."
          value={password} onChange={event => setPassword(event.target.value)} />
        <AccountPasswordField id="register-confirm-password" label="Confirm password" autoComplete="new-password" required
          value={confirm} onChange={event => setConfirm(event.target.value)} />
        {error && <p className="ht-error" role="alert">{error}</p>}
        <Button variant="cyan" type="submit" pending={pending}>{pending ? "Creating your account…" : "Create an account"}</Button>
      </form>
      <p>Already have an account? <Link to={loginHref}>Log in</Link></p>
    </AccountPage>
  );
}
