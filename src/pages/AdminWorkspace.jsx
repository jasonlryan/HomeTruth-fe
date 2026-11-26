import { Link, NavLink, Outlet } from "react-router-dom";
import HTGlyph from "../components/HTGlyph";
import "./admin-workspace.css";
import { investorDataRoomEnabled } from "../utils/localDemo";

const destinations = () => [
  ["knowledge-base", "RAG", "knowledge", "Inspect records ingested into the shared Qdrant index."],
  ["operations", "Operations", "activity", "Explore the sample home record and programme workflows."],
  ...(investorDataRoomEnabled() ? [["data-room", "Data Room", "home", "Explore the synthetic Brighton portfolio and property ledger."]] : []),
  ["dashboard", "Reporting", "analytics", "Review product usage and programme activity."],
  ["partner-programmes", "Partner programmes", "programme", "Manage programmes, invitations and partner access."],
  ["resources", "Resources", "list", "Manage HomeTruth articles and browse platform documentation."],
  ["data-access", "Data access", "lock", "View authorised user data and export records when needed."],
];

export default function AdminWorkspace() {
  return (
    <>
      <nav aria-label="Admin navigation" className="ht-ui ht-admin-nav">
        <NavLink to="/admin" end className="ht-content-tab"><HTGlyph name="dashboard" size={20} /> Admin overview</NavLink>
        {destinations().map(([path, title, icon]) => (
          <NavLink key={path} to={`/admin/${path}`} className="ht-content-tab">
            <HTGlyph name={icon} size={20} /> {title}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </>
  );
}

export function AdminResources() {
  return (
    <section className="ht-ui ht-admin-overview">
      <h1>Resources</h1>
      <div className="ht-admin-destinations">
        <Link className="ht-panel ht-admin-destination" to="/admin/articles">
          <h2>HomeTruth articles</h2><p>Write, edit and publish articles.</p>
        </Link>
        <Link className="ht-panel ht-admin-destination" to="/admin/user-flows">
          <h2>Platform documentation</h2><p>Browse user flows and the design system.</p>
        </Link>
        <Link className="ht-panel ht-admin-destination" to="/admin/resources/ontology">
          <h2>HomeTruth ontology</h2><p>Explore 23 domain concepts, their database mappings and the presenter’s discussion guide.</p>
        </Link>
      </div>
    </section>
  );
}

export function AdminOverview() {
  return (
    <div className="ht-ui ht-admin-overview">
      <header>
        <h1>Admin tools</h1>
        <Link to="/" className="ht-button" data-variant="secondary">View public site</Link>
      </header>
      <div className="ht-admin-destinations">
        {destinations().map(([path, title, icon, description]) => (
          <Link key={path} to={`/admin/${path}`} className="ht-panel ht-admin-destination">
            <h2><HTGlyph name={icon} /> {title}</h2>
            <p>{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
