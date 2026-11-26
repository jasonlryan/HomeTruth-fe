import { useEffect, useRef, useState } from "react";
import database from "./database.json";
import ontology from "./ontology.json";
import guide from "./guide.json";
import "./ontology.css";

// Keep the exported diagrams isolated. Their only bridge to the app is the
// discussion guide's request to select a node in one of the two diagrams.
const diagramTheme = `<style>
  body, button, input, select, svg text { font-family: "Gill Sans", "Gill Sans MT", Arial, sans-serif; }
  body { background: #f7f8fa; color: #1a1a1a; }
  header { background: #0f1620; color: white; border-top: 4px solid #00b4d8; }
  header p { color: #e4edf0; }
  :focus-visible { outline: 3px solid #8b3fa0; outline-offset: 2px; }
  @media (max-width: 720px) {
    main, .layout { display: block; padding: 12px; }
    .layout nav { position: static; }
    header, .bar { padding: 16px; }
    .bar input, .bar select { max-width: 100%; }
    aside { margin-top: 12px; }
  }
</style>`;
const views = [
  ["ontology", "Ontology", ontology],
  ["database", "Database atlas", database],
  ["guide", "Discussion guide", guide],
].map(([id, label, html]) => ({ id, label, html: html.replace("</head>", diagramTheme + "</head>") }));

export default function AdminOntology() {
  const [active, setActive] = useState("ontology");
  const [fromGuide, setFromGuide] = useState(false);
  const frames = useRef({});
  const buttons = useRef({});
  const pendingJump = useRef(null);

  function deliverJump() {
    const jump = pendingJump.current;
    if (jump) frames.current[jump.view]?.contentWindow?.postMessage(jump, "*");
  }

  useEffect(() => {
    function handleGuideJump(event) {
      const action = event.data;
      if (event.source !== frames.current.guide?.contentWindow || action?.type !== "ontology-guide-jump") return;
      if (action.view !== "ontology" && action.view !== "database") return;
      pendingJump.current = { type: "ontology-select", view: action.view, node: action.node, mode: action.mode };
      setFromGuide(true);
      setActive(action.view);
      buttons.current[action.view]?.focus();
    }
    window.addEventListener("message", handleGuideJump);
    return () => window.removeEventListener("message", handleGuideJump);
  }, []);

  useEffect(() => {
    if (pendingJump.current?.view === active) deliverJump();
  }, [active]);

  function selectView(id) {
    pendingJump.current = null;
    setFromGuide(false);
    setActive(id);
  }

  return (
    <section className="ht-ui ht-admin-ontology">
      <h1>HomeTruth ontology</h1>
      <p>Explore the relationships between a home, its people, their evidence and the work they do. Local snapshot from 19 November 2026.</p>
      <nav aria-label="Ontology views">
        {views.map(({ id, label }) => (
          <button key={id} ref={el => { buttons.current[id] = el; }} className="ht-content-tab" aria-pressed={id === active}
            onClick={() => selectView(id)}>{label}</button>
        ))}
        {fromGuide && <button className="ht-content-tab" onClick={() => { selectView("guide"); buttons.current.guide.focus(); }}>Back to discussion guide</button>}
      </nav>
      {views.map(({ id, label, html }) => (
        <iframe key={id} title={label} hidden={active !== id} ref={el => { frames.current[id] = el; }}
          sandbox="allow-scripts" srcDoc={html} onLoad={() => { if (pendingJump.current?.view === id) deliverJump(); }} />
      ))}
    </section>
  );
}
