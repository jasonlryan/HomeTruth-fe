import { useState } from "react";
import { Link } from "react-router-dom";
import HTGlyph from "../components/HTGlyph";
import PageTitle from "../components/PageTitle";
import { Badge, Button, Field, Panel, Status } from "../components/homepage/HomeTruth";
import icons from "../components/homepage/iconCatalogue.json";
import "../components/workspace.css";

const sections = [
  ["homepage-journey", "Homepage patterns"], ["components", "Components"], ["navigation", "Navigation"],
  ["states", "States and statuses"], ["icons", "Icon suite"],
];

export default function AdminDesignSystem() {
  const [query, setQuery] = useState("");
  const filteredIcons = icons.filter(icon => `${icon.id} ${icon.label} ${icon.group} ${icon.usage}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="ht-workspace-page space-y-6">
      <header>
        <PageTitle>HomeTruth design system</PageTitle>
        <p className="ht-workspace-muted mt-2">Cabin Regular for headings. Inter for reading and controls. Use the HomeTruth icon suite and semantic colour tokens.</p>
        <nav className="mt-4 flex flex-wrap gap-4" aria-label="Design system sections">
          {sections.map(([id, label]) => <a key={id} className="ht-workspace-link" href={`#${id}`}>{label}</a>)}
        </nav>
      </header>
      <Panel id="homepage-journey">
        <h2 className="text-2xl">Homepage patterns</h2>
        <p className="mt-2">A customer chooses a route, sees their answer and can take it into a home record. Give sign-in and record setup their own destinations.</p>
        <Link className="ht-workspace-link inline-block mt-3" to="/admin/user-flows">Read the user-flow blueprints</Link>
      </Panel>
      <Panel id="components">
        <h2 className="text-2xl">Components</h2>
        <div className="mt-3 max-w-sm"><Field id="sample-address" label="Property address" placeholder="Find an address" /></div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary"><HTGlyph name="source" size={16} /> Open source</Button>
          <Button variant="text">Back to home record</Button>
          <Button variant="secondary" disabled>Save follow-up</Button>
        </div>
      </Panel>
      <Panel id="navigation">
        <h2 className="text-2xl">Navigation</h2>
        <p className="mt-2">Use HomeTruth icons at 24px in primary navigation. Use a straight selection indicator and make focus visible by keyboard.</p>
        <Link className="ht-workspace-link inline-block mt-3" to="/admin">Open the Admin navigation</Link>
      </Panel>
      <Panel id="states">
        <h2 className="text-2xl">States and statuses</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Status tone="progress" appearance="pill">Processing</Status>
          <Status tone="review" appearance="pill">Needs review</Status>
          <Status tone="success" appearance="pill">Filed</Status>
          <Status tone="error" appearance="pill">Failed</Status>
          <Badge>Survey</Badge>
        </div>
      </Panel>
      <Panel id="icons">
        <h2 className="text-2xl">Icon suite</h2>
        <div className="mt-3 max-w-sm"><Field id="icon-search" label="Find an icon" value={query} onChange={event => setQuery(event.target.value)} /></div>
        <p className="mt-2" role="status">{filteredIcons.length} icons</p>
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredIcons.map(icon => (
            <li key={icon.id} className="ht-workspace-state">
              <p className="inline-grid grid-flow-col items-baseline gap-2"><HTGlyph name={icon.id.slice(3)} /> {icon.label}</p>
              <p className="mt-1 text-xs">{icon.usage}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
