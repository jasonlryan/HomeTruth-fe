import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getPropertyRecords } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { rememberManualContext } from "../features/items/manualAskContext";
import ItemWorkspace from "../features/items/ItemWorkspace";
import "../features/items/ItemJourney.css";

const canWrite = new Set(["manage", "admin"]);

export default function LocalApplianceWorkspace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [result, setResult] = useState(null);
  const requestedHome = params.get("home");

  useEffect(() => {
    let active = true;
    getPropertyRecords().then(homes => {
      if (active) setResult({ homes });
    }).catch(() => {
      if (active) setResult({ error: true });
    });
    return () => { active = false; };
  }, []);

  const home = result?.homes?.find(record => String(record.property.id) === requestedHome)
    ?? (!requestedHome ? result?.homes?.[0] : null);
  const homeId = home?.property.id;
  const address = record => record.currentAddress?.addressLine1 || "Your home";

  return (
    <div className="journey">
      <Link to={homeId ? `/property-profile?propertyId=${homeId}` : "/property-profile"}>Back to home record</Link>
      {!result && <p role="status">Loading your homes…</p>}
      {result?.error && <p role="alert">Your homes couldn’t be loaded. Reload this page to try again.</p>}
      {result?.homes?.length === 0 && <p><Link to="/property-profile">Add a home record</Link> to keep its appliances and manuals.</p>}
      {result?.homes?.length > 0 && (
        <div className="journey-homebar">
          <label className="journey-field">Selected home
            <select value={homeId || ""} onChange={event => {
              rememberManualContext(user?.id, { homeId: event.target.value });
              setParams({ home: event.target.value });
            }}>
              {!homeId && <option value="">Choose a home</option>}
              {result.homes.map(record => <option value={record.property.id} key={record.property.id}>{address(record)}</option>)}
            </select>
          </label>
        </div>
      )}
      {home && (
        <ItemWorkspace key={homeId} homeId={homeId} homeLabel={address(home)} owner={String(user?.id || "")}
          canManage={canWrite.has(home.relationship?.permissionLevel)}
          askGeneral={() => navigate(`/ask-ai?propertyId=${homeId}`)} />
      )}
    </div>
  );
}
