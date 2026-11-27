import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { explainers } from "./catalogue";
import report from "./home-truth-report-b2b.html.txt";
import ledger from "./hometruth-blockchain-ledger-strategy.html.txt";
import ingestion from "./hometruth-document-ingestion.html.txt";
import profiling from "./hometruth-profiling-system.html.txt";

const files = {
  "home-truth-report-b2b": report,
  "hometruth-blockchain-ledger-strategy": ledger,
  "hometruth-document-ingestion": ingestion,
  "hometruth-profiling-system": profiling,
};

function ExplainerDocument({ file, title }) {
  const [document, setDocument] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(file, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw Error("Unable to load explainer");
        return response.text();
      })
      .then(html => { if (!controller.signal.aborted) setDocument({ html }); })
      .catch(() => { if (!controller.signal.aborted) setDocument({ failed: true }); });
    return () => controller.abort();
  }, [file]);

  if (!document) return <p role="status">Loading explainer…</p>;
  if (document.failed) return <p role="alert">Couldn’t open this explainer.</p>;
  return <iframe className="ht-admin-explainer" title={title} srcDoc={document.html}
    sandbox="allow-top-navigation-by-user-activation" />;
}

export default function AdminExplainer() {
  const { id } = useParams();
  const explainer = explainers.find(item => item.id === id);

  return (
    <section className="ht-ui ht-admin-overview">
      <header>
        <h1>{explainer?.title || "Explainer not found"}</h1>
        <Link className="ht-button" data-variant="secondary" to="/admin/resources">Back to Resources</Link>
      </header>
      {explainer && <ExplainerDocument key={id} file={files[id]} title={explainer.title} />}
    </section>
  );
}
