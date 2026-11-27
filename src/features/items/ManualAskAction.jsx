import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHomeItem, getPropertyRecords, keepVaultManual } from "../../api/api";
import ManufacturerManualLink from "./ManufacturerManualLink";
import { appliancePath, savedExactManual } from "./manualAskContext";
import "./ItemJourney.css";

export default function ManualAskAction({ scope }) {
  const homeId = scope?.homeId;
  const itemId = scope?.itemId;
  const [state, setState] = useState(null);
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!homeId || !itemId) return;
    let active = true;
    setState(null);
    Promise.all([getHomeItem(homeId, itemId), getPropertyRecords()]).then(([item, homes]) => {
      const home = homes.find(record => String(record.property.id) === String(homeId));
      if (active) setState({ item, canManage: ["manage", "admin"].includes(home?.relationship?.permissionLevel) });
    }).catch(() => {
      if (active) setState({ error: true });
    });
    return () => { active = false; };
  }, [homeId, itemId, retry]);

  if (!itemId) return <p className="mt-2"><Link to={appliancePath(homeId)} className="journey-link">Choose your appliance</Link> to check Vault for its manual.</p>;
  if (!state) return <p className="mt-2" role="status">Checking Vault for the exact model…</p>;
  if (state.error) return <p className="mt-2" role="alert">I couldn’t check Vault. <button type="button" className="journey-link" onClick={() => setRetry(n => n + 1)}>Try again</button> or <Link className="journey-link" to={appliancePath(homeId)}>choose another appliance</Link>.</p>;

  const { item, canManage } = state;
  const { brand, model } = item.record.identity;
  const hasBoschModel = brand?.trim().toLowerCase() === "bosch" && /^[a-z0-9]{3,32}$/i.test(model?.trim() || "");
  const attached = savedExactManual(item);
  const inVault = attached || item.vaultManual;
  async function keepManual() {
    setSaving(true);
    setSaveError("");
    try {
      const updated = await keepVaultManual(homeId, itemId, {
        documentId: inVault.documentId,
        itemVersion: item.version
      });
      setState({ item: updated, canManage });
    } catch {
      setSaveError("The manual couldn’t be attached. Reload the Vault match and try again.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="journey item-agent mt-3" aria-label="Washing machine manual">
    <p>{item.record.name}{brand && model && ` · ${brand} ${model}`}</p>
    {inVault ? <>
      <p role="status">{attached ? "This manual is already saved with your appliance." : "I found the exact model’s manual in Vault."}</p>
      <div className="journey-actions">
        <Link className="journey-link" to={`/documents?preview=${inVault.documentId}`}>{attached ? "Open saved manual" : "Open Vault copy"}</Link>
        {!attached && canManage && <button type="button" className="journey-button" disabled={saving} onClick={keepManual}>Keep with this appliance</button>}
      </div>
    </> : <>
      {brand && model && <p>Vault has no manual for this exact model.</p>}
      {hasBoschModel
        ? <ManufacturerManualLink key={`${homeId}/${itemId}/${item.version}`} homeId={homeId} item={item} canManage={canManage} />
        : <p>Open the appliance record to check its make and model or use the available manual options.</p>}
    </>}
    {saveError && <p role="alert">{saveError} <button className="journey-link" type="button" onClick={() => { setSaveError(""); setRetry(n => n + 1); }}>Reload Vault match</button></p>}
    <Link className="journey-link" to={appliancePath(homeId, itemId)}>Open appliance record</Link>
  </section>;
}
