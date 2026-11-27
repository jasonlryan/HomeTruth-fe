import { useState } from "react";
import { checkManufacturerManual, registerManufacturerManual } from "../../api/api";

function officialUrl(value) {
  try {
    const url = new URL(value);
    const officialHosts = ["bosch-home.com", "bosch-home.co.uk", "bsh-group.com"];
    if (url.protocol === "https:" && !url.username && !url.password &&
        officialHosts.some(host => url.hostname === host || url.hostname.endsWith("." + host))) {
      return url.href;
    }
  } catch {
    return null;
  }
  return null;
}

export default function ManufacturerManualLink({ homeId, item, canManage }) {
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const { brand, model } = item.record.identity;
  const candidate = result?.link || item.manufacturerManualLink;
  const link = candidate?.brand === "Bosch" && candidate.model === model.trim().toUpperCase() ? candidate : null;
  const registered = result?.registered || Boolean(item.manufacturerManualLink);
  const sourceUrl = officialUrl(link?.sourceUrl);
  const manualUrl = officialUrl(link?.manualUrl);

  async function check() {
    setPending("check");
    setError("");
    try {
      setResult(await checkManufacturerManual(homeId, item.id));
    } catch {
      setError("Couldn’t check the Bosch site. Try again.");
    } finally {
      setPending("");
    }
  }

  async function register() {
    setPending("register");
    setError("");
    try {
      const saved = await registerManufacturerManual(homeId, item.id, {
        confirmed: true, itemVersion: item.version, manualUrl: link.manualUrl,
      });
      if (!saved?.registered) throw new Error("Manual link was not registered");
      setResult(saved);
    } catch {
      setError("Couldn’t register the link. Reopen the appliance to check whether its details changed.");
    } finally {
      setPending("");
    }
  }

  return <div className="item-agent">
    <p>Confirmed model: {brand} {model}</p>
    {sourceUrl && manualUrl ? <>
      <p role="status">{registered ? "Manufacturer link saved with this appliance." : "Bosch links this manual from the page for your exact model."}</p>
      <div className="journey-actions">
        <a className="journey-link" href={sourceUrl} target="_blank" rel="noreferrer">Open Bosch model page</a>
        <a className="journey-link" href={manualUrl} target="_blank" rel="noreferrer">Open manufacturer PDF</a>
        {!registered && canManage && <button type="button" className="journey-button" disabled={Boolean(pending)}
          onClick={register}>Register manual link</button>}
      </div>
      <p className="journey-note">HomeTruth keeps the link on this appliance. The PDF stays with the manufacturer.</p>
    </> : <>
      {result && <p role="status">I couldn’t find an official Bosch manual link for this exact model.</p>}
      <button type="button" className="journey-button" disabled={Boolean(pending)} onClick={check}>Check Bosch for free</button>
    </>}
    {pending && <p role="status">{pending === "check" ? "Checking Bosch…" : "Registering manual link…"}</p>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
