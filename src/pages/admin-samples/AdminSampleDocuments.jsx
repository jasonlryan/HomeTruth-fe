import { Link, useParams } from "react-router-dom";
import HTGlyph from "../../components/HTGlyph";
import { Badge, Panel } from "../../components/homepage/HomeTruth";
import { sampleDocuments } from "./catalogue";
import { PROPERTY_DEED_CONTENT } from "./deed";
import { SURVEY_REPORT_CONTENT } from "./survey";
import surveyMarkdown from "./survey-report-sample.md";
import "../admin-demo-resources.css";

const cataloguePath = "/admin/resources/sample-documents";
const previews = new Map([
  ["2", PROPERTY_DEED_CONTENT],
  ["survey-report-2022", SURVEY_REPORT_CONTENT],
]);

export default function AdminSampleDocuments() {
  const { id } = useParams();
  const sample = sampleDocuments.find(document => document.id === id);
  const preview = previews.get(id);

  if (id) return (
    <section className="ht-ui ht-admin-overview">
      <header>
        <h1>{preview ? sample.type : "Sample preview unavailable"}</h1>
        <Link className="ht-button" data-variant="secondary" to={cataloguePath}>Back to sample documents</Link>
      </header>
      {preview && <>
        <p>{sample.name} · Styleguide demo preview</p>
        {id === "survey-report-2022" &&
          <div>
            <p>The Styleguide also includes a separate Markdown survey sample for a Manchester property.</p>
            <a className="ht-button" data-variant="secondary" href={surveyMarkdown} download="survey-report-sample.md">
              <HTGlyph name="download" size={18} /> Download survey Markdown
            </a>
          </div>}
        <div className="ht-admin-source-pages">
          {preview.pages.map((page, index) => (
            <Panel key={index}>
              <h2>{index + 1}. {page.title}</h2>
              <p>{page.content}</p>
            </Panel>
          ))}
        </div>
      </>}
    </section>
  );

  return (
    <section className="ht-ui ht-admin-overview">
      <header>
        <h1>Sample documents</h1>
        <Link className="ht-button" data-variant="secondary" to="/admin/resources">Back to Resources</Link>
      </header>
      <p>Nine Styleguide samples. The title deed and property survey include text previews.</p>
      <div className="ht-admin-destinations ht-admin-demo-cards">
        {sampleDocuments.map(document => (
          <Panel key={document.id} className="ht-panel ht-admin-sample">
            <h2><HTGlyph name="document" size={20} /> {document.type}</h2>
            <p>{document.name}</p>
            <p>{document.category} · Added {document.dateAdded}</p>
            <p>Styleguide status · {document.status}</p>
            <ul aria-label="Tags">{document.tags.map(tag => <li key={tag}><Badge>{tag}</Badge></li>)}</ul>
            {previews.has(document.id) ? (
              <Link to={cataloguePath + "/" + document.id}>Preview {document.type.toLowerCase()}</Link>
            ) : <Badge>Catalogue only</Badge>}
          </Panel>
        ))}
      </div>
    </section>
  );
}
