import { useEffect, useState } from "react";
import { getIndexedRecords } from "../api/api";

export default function IndexedRecords() {
  const [cursors, setCursors] = useState([null]);
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setPage(null);
    setError(false);
    getIndexedRecords(cursors[cursors.length - 1]).then(result => {
      if (!Array.isArray(result?.records)) throw new Error("Invalid index response");
      if (active) setPage(result);
    }).catch(() => {
      if (active) setError(true);
    });
    return () => { active = false; };
  }, [cursors, attempt]);

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold">Qdrant ingestion records</h2>
      {error ? <p role="alert">Could not load records. <button onClick={() => setAttempt(attempt + 1)}>Retry</button></p>
        : !page ? <p role="status">Loading indexed chunks…</p>
        : !page.records.length ? <p>No indexed chunks on this page.</p>
        : <ul className="divide-y">
            {page.records.map(record => (
              <li key={record.id} className="py-2 break-words">
                <strong>{record.title || record.documentId || "Indexed chunk"}</strong>
                <p>Point {record.id}{record.chunkIndex != null && ` · Chunk index ${record.chunkIndex}`}</p>
              </li>
            ))}
          </ul>}
      <div className="flex gap-4 mt-3">
        {cursors.length > 1 && <button onClick={() => setCursors(cursors.slice(0, -1))}>Previous records</button>}
        {page?.nextCursor != null && <button onClick={() => setCursors([...cursors, page.nextCursor])}>Next records</button>}
      </div>
    </section>
  );
}
