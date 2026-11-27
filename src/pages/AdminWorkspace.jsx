import { Link, NavLink, Outlet } from "react-router-dom";
import HTGlyph from "../components/HTGlyph";
import "./admin-workspace.css";
import { explainers } from "./admin-explainers/catalogue";
import { investorDataRoomEnabled } from "../utils/localDemo";

const destinations = () => [
  ["knowledge-base", "Knowledge index", "knowledge", "Inspect records ingested into the shared Qdrant index."],
  ["operations", "Operations walkthrough", "activity", "Explore the sample home record and programme workflows."],
  ...(investorDataRoomEnabled() ? [["data-room", "Investor Data Room", "home", "Explore the demo Brighton portfolio and property ledger."]] : []),
  ["dashboard", "Reporting", "analytics", "Review product usage and programme activity."],
  ["partner-programmes", "Partner programmes", "programme", "Manage programmes, invitations and partner access."],
  ["resources", "Resources", "list", "Browse demos, explainers, design references and publishing tools."],
  ["data-access", "User data access", "lock", "View authorised user data and export records when needed."],
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
  const groups = [
    ...(investorDataRoomEnabled() ? [{
      title: "Demo library",
      links: [
        ["/admin/data-room", "Investor Data Room", "Explore the Brighton portfolio, John’s ledger and the investor exports."],
        ["/login?switch=1&redirect=%2Fpartner-programmes", "Partner demo sign-in", "Sign in as the demo analyst to view campaign evidence and download the partner review pack."],
        ["/admin/resources/sample-documents", "Sample documents", "Browse the nine sample records and open the available deed and survey previews."],
        ["/admin/resources/knowledge", "Demo knowledge library", "Search the reference documents imported from the Styleguide."],
      ],
    }] : []),
    {
      title: "Product and partner explainers",
      links: explainers.map(({id, title, description}) => [`/admin/resources/explainers/${id}`, title, description]),
    },
    {
      title: "Design and development",
      links: [
        ["/admin/user-flows", "User-flow blueprints", "Follow the homeowner journeys and their acceptance criteria."],
        ["/admin/design-system", "Design system", "Find components, interaction states and HomeTruth icons."],
        ["/admin/resources/ontology", "HomeTruth ontology", "Explore the domain concepts and their database mappings."],
        ["/admin/user-flows?flow=agent-sdk", "Agent SDK reference", "Read the agent integration contract and execution limits."],
      ],
    },
    {
      title: "Publishing",
      links: [["/admin/articles", "Manage articles", "Write, edit and publish HomeTruth articles."]],
    },
  ];
  return (
    <section className="ht-ui ht-admin-overview">
      <h1>Resources</h1>
      {groups.map(({ title, links }) => (
        <section key={title} aria-label={title} className="ht-admin-resource-group">
          <h2>{title}</h2>
          <div className="ht-admin-destinations">
            {links.map(([to, label, description]) => (
              <Link key={to} className="ht-panel ht-admin-destination" to={to}>
                <h3>{label}</h3><p>{description}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
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
