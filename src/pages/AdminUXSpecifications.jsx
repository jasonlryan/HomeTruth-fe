import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import blueprintUrl from "../user-flows/HT-FLOW-001.md";
import "../components/homepage/HomeTruth";
import "./admin-ux-specifications.css";

const domainModel = "https://github.com/jasonlryan/hometruth/blob/744cba50804c9e2f249af2448636fd43ed78b314/docs/product/hometruth-domain-model.md";
const designSystem = "/admin/design-system/index.html";

const ontologyEntries = [
  ["Person / User", "Who signs in and acts on a record.", "person--user"],
  ["Property", "The home or building the record describes.", "property"],
  ["Property Address", "Address details associated with the property.", "property-address"],
  ["Property Person", "Records the person’s relationship to the property and carries record-level permissions.", "property-person"],
  ["Evidence Source", "Where a claim comes from and how to locate it.", "evidence-source"],
  ["Property Fact", "A structured claim about the property, linked to evidence.", "property-fact"],
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
  const [blueprint, setBlueprint] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(blueprintUrl, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error("Blueprint could not be loaded");
        return response.text();
      })
      .then(setBlueprint)
      .catch(error => {
        if (error.name !== "AbortError") setFailed(true);
      });
    return () => controller.abort();
  }, []);

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
        <p><a href={blueprintUrl} download="HT-FLOW-001.md">Download the versioned Markdown</a></p>
        {blueprint && <article className="ht-blueprint">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={blueprintRenderers}>{blueprint}</ReactMarkdown>
        </article>}
        {failed && <p role="alert">The blueprint couldn’t be loaded. Reload the page to try again.</p>}
        {!failed && !blueprint && <p role="status">Loading blueprint…</p>}
      </section>

      <section id="ontology" aria-labelledby="ontology-heading" className="ht-panel">
        <h2 id="ontology-heading">Ontology</h2>
        <p>Entities referenced by HT-FLOW-001. Follow the source links for the full definitions and the blueprint links for the implemented chat and property contracts.</p>
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
