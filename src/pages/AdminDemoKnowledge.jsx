import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getDemoKnowledge, getDemoKnowledgeDocument } from "../api/api";
import { Button, Field, Panel } from "../components/homepage/HomeTruth";
import "./admin-demo-resources.css";
import "./investor-data-room.css";

const path = "/admin/resources/knowledge";
const limit = 25;

function useKnowledgeResult(load) {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal)
      .then(data => { if (!controller.signal.aborted) setResult({ data }); })
      .catch(() => { if (!controller.signal.aborted) setResult({ failed: true }); });
    return () => controller.abort();
  }, [load, attempt]);

  return [result, () => { setResult(null); setAttempt(value => value + 1); }];
}

function KnowledgeDocument({ id, search }) {
  const load = useCallback(signal => getDemoKnowledgeDocument(id, signal), [id]);
  const [result, retry] = useKnowledgeResult(load);
  const document = result?.data;

  return <>
    <header>
      <h1>{document?.name || "Demo knowledge document"}</h1>
      <Link to={path + search} className="ht-button" data-variant="secondary">Back to demo knowledge</Link>
    </header>
    {!result && <p role="status">Loading document…</p>}
    {result?.failed && <p role="alert">Couldn’t load this document. <Button variant="secondary" onClick={retry}>Retry</Button></p>}
    {document && <>
      <p>{document.namespace} · {document.chunkCount} excerpts</p>
      <div className="ht-admin-source-pages">
        {document.chunks.map(({ text }, index) => (
          <Panel key={index}><h2>Excerpt {index + 1}</h2><p>{text}</p></Panel>
        ))}
      </div>
    </>}
  </>;
}

function KnowledgeList({ query, page, search, setParams }) {
  const [draft, setDraft] = useState(query);
  const load = useCallback(signal => getDemoKnowledge({ q: query, page, limit }, signal), [query, page]);
  const [result, retry] = useKnowledgeResult(load);
  const list = result?.data;

  function changePage(nextPage) {
    setParams({ ...(query ? { q: query } : {}), ...(nextPage === 1 ? {} : { page: String(nextPage) }) });
  }

  return <>
    <header>
      <h1>Demo knowledge library</h1>
      <Link to="/admin/resources" className="ht-button" data-variant="secondary">Back to Resources</Link>
    </header>
    <p>Search and read excerpts from the Styleguide knowledge snapshot.</p>
    <form className="ht-investor-search" onSubmit={event => {
      event.preventDefault();
      setParams(draft.trim() ? { q: draft.trim() } : {});
    }}>
      <Field id="demo-knowledge-search" type="search" label="Search knowledge" maxLength={200}
        value={draft} onChange={event => setDraft(event.target.value)} />
      <Button type="submit">Search</Button>
    </form>
    {!result && <p role="status">Loading knowledge documents…</p>}
    {result?.failed && <p role="alert">Couldn’t load demo knowledge. <Button variant="secondary" onClick={retry}>Retry</Button></p>}
    {list && <>
      <p role="status">{list.total} {list.total === 1 ? "document" : "documents"}</p>
      {list.records.length > 0 ? (
        <ul className="ht-admin-knowledge-list">
          {list.records.map(record => (
            <li key={record.id}>
              <Link to={path + "/" + encodeURIComponent(record.id) + search}>{record.name}</Link>
              <div>{record.namespace} · {record.chunkCount} excerpts</div>
            </li>
          ))}
        </ul>
      ) : <p>No documents on this page.</p>}
      {(page > 1 || list.total > limit) && (
        <nav className="ht-investor-pages" aria-label="Knowledge pages">
          <Button variant="secondary" disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</Button>
          <span>Page {page}</span>
          <Button variant="secondary" disabled={page * limit >= list.total} onClick={() => changePage(page + 1)}>Next</Button>
        </nav>
      )}
    </>}
  </>;
}

export default function AdminDemoKnowledge() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const requestedPage = Number(params.get("page"));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const search = params.size ? "?" + params.toString() : "";

  return <section className="ht-ui ht-admin-overview">
    {id ? <KnowledgeDocument key={id} id={id} search={search} /> :
      <KnowledgeList key={search} query={query} page={page} search={search} setParams={setParams} />}
  </section>;
}
