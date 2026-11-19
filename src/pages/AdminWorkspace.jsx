import { Link, NavLink, Outlet } from "react-router-dom";
import HTGlyph from "../components/HTGlyph";
import "./admin-workspace.css";

const destinations = [
  ["knowledge-base", "Knowledge", "knowledge", "Add and review sources used by Ask HomeTruth."],
  ["operations", "Operations", "activity", "Explore the sample home record and programme workflows."],
  ["dashboard", "Reporting", "analytics", "Review product usage and programme activity."],
  ["partner-programmes", "Partner programmes", "programme", "Manage programmes, invitations and partner access."],
  ["articles", "Content", "content", "Manage and publish Home Truths articles."],
  ["user-flows", "Product resources", "list", "Open user-flow blueprints, the design system and the ontology."],
  ["data-access", "Data access", "lock", "View authorised user data and export records when needed."],
];

export default function AdminWorkspace() {
  return (
    <>
      <nav aria-label="Admin navigation" className="ht-ui ht-admin-nav">
        <NavLink to="/admin" end className="ht-content-tab"><HTGlyph name="dashboard" size={20} /> Admin overview</NavLink>
        {destinations.map(([path, title, icon]) => (
          <NavLink key={path} to={`/admin/${path}`} className="ht-content-tab">
            <HTGlyph name={icon} size={20} /> {title}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </>
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
        {destinations.map(([path, title, icon, description]) => (
          <Link key={path} to={`/admin/${path}`} className="ht-panel ht-admin-destination">
            <h2><HTGlyph name={icon} /> {title}</h2>
            <p>{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
