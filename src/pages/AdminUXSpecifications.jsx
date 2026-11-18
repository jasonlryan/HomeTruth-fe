import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import blueprintUrl from "../user-flows/HT-FLOW-001.md";
import buyingUrl from "../user-flows/HT-FLOW-002.md";
import improvingUrl from "../user-flows/HT-FLOW-003.md";
import sellingUrl from "../user-flows/HT-FLOW-004.md";
import "../components/homepage/HomeTruth";
import "./admin-ux-specifications.css";

const domainModel = "https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md";
const designSystem = "/admin/design-system/index.html";
const blueprints = [
  { id: "HT-FLOW-001", label: "First answer to home record", url: blueprintUrl },
  { id: "HT-FLOW-002", label: "Buying", url: buyingUrl },
  { id: "HT-FLOW-003", label: "Improving", url: improvingUrl },
  { id: "HT-FLOW-004", label: "Selling", url: sellingUrl },
];

const ontologyEntries = [
  ["Person / User", "Who signs in and acts on a record.", "person--user"],
  ["Property", "The home or building the record describes.", "property"],
  ["Property Address", "Address details associated with the property.", "property-address"],
  ["Property Person", "Records the person’s relationship to the property and carries record-level permissions.", "property-person"],
  ["Evidence Source", "Where a claim comes from and how to locate it.", "evidence-source"],
  ["Property Fact", "A structured claim about the property, linked to evidence.", "property-fact"],
  ["Property Document", "Links a source document to the property it describes.", "property-document"],
  ["Reminder / Task", "An action to take, with a completion state and relevant property context.", "reminder--task"],
];

const blueprintRenderers = {
  h1: ({ children }) => <h2>{children}</h2>,
  h2: ({ children }) => <h3>{children}</h3>,
  table: ({ children }) => (
    <div className="ht-scroll-table" tabIndex={0} role="region" aria-label="Blueprint table">
      <table className="ht-table">{children}</table>
    </div>
  ),
  a: ({ href, children }) => href?.startsWith("../../src/")
    ? <>{children}</>
    : <a href={href}>{children}</a>,
};

export default function AdminUXSpecifications() {
  const [params] = useSearchParams();
  const selected = blueprints.find(flow => flow.id === params.get("flow")) ?? blueprints[0];
  const [result, setResult] = useState(null);
  const current = result?.id === selected.id ? result : null;

  useEffect(() => {
    const controller = new AbortController();
    fetch(selected.url, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error("Blueprint could not be loaded");
        return response.text();
      })
      .then(body => setResult({ id: selected.id, body }))
      .catch(error => {
        if (error.name !== "AbortError") setResult({ id: selected.id, failed: true });
      });
    return () => controller.abort();
  }, [selected]);

  return (
    <div className="ht-ui ht-ux-specifications">
      <header>
        <Link to="/admin/knowledge-base">Back to admin</Link>
        <h1>UX specifications</h1>
        <p>Use the blueprint to specify the journey, the design system to choose its interface patterns, and the ontology to define the data and access each step needs.</p>
        <nav aria-label="UX specification resources">
          <a href="#blueprints">User flow blueprints</a>
          <a href={designSystem}>Design system</a>
          <a href="#ontology">Ontology</a>
        </nav>
      </header>

      <section id="blueprints" aria-labelledby="blueprints-heading" className="ht-panel">
        <h2 id="blueprints-heading">User flow blueprints</h2>
        <nav aria-label="Choose a blueprint">
          {blueprints.map(flow => (
            <Link key={flow.id} to={`?flow=${flow.id}`} className="ht-nav-item" aria-current={selected.id === flow.id ? "page" : undefined}>
              {flow.label}
            </Link>
          ))}
        </nav>
        <p><a href={selected.url} download={`${selected.id}.md`}>Download the versioned Markdown</a></p>
        {selected.id === "HT-FLOW-002" && (process.env.NODE_ENV === "development" || process.env.REACT_APP_VISUAL_REVIEW === "true") && (
          <p><Link to="/workspace-preview">Open the Buying Control centre preview</Link></p>
        )}
        {current?.body && <article className="ht-blueprint">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={blueprintRenderers}>{current.body}</ReactMarkdown>
        </article>}
        {current?.failed && <p role="alert">The blueprint couldn’t be loaded. Reload the page to try again.</p>}
        {!current && <p role="status">Loading blueprint…</p>}
      </section>

      <section id="ontology" aria-labelledby="ontology-heading" className="ht-panel">
        <h2 id="ontology-heading">Ontology</h2>
        <p>Follow the domain model links for entity definitions and each blueprint for its data and access requirements.</p>
        <dl className="ht-ontology-links">
          {ontologyEntries.map(([label, description, anchor]) => (
            <div key={anchor}>
              <dt><a href={domainModel + "#" + anchor}>{label}</a></dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
        <p><a href={domainModel}>Open the full HomeTruth domain model</a></p>
      </section>
    </div>
  );
}
