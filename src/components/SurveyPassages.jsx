import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createPropertyFollowUp, getPropertyRecords, getSurveyPdfPage } from "../api/api";
import { Button, Field } from "./homepage/HomeTruth";
import HTGlyph from "./HTGlyph";

const contributors = new Set(["contribute", "manage", "admin"]);

export default function SurveyPassages({ documentId, propertyId, savedPassage, onShowPdf }) {
  const [pageNumber, setPageNumber] = useState(1);
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [homes, setHomes] = useState(null);
  const [homeError, setHomeError] = useState(false);
  const [homeId, setHomeId] = useState("");
  const [selection, setSelection] = useState(null);
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [savedHomeId, setSavedHomeId] = useState("");
  const [saveError, setSaveError] = useState("");
  const request = useRef(null);
  const textField = useRef(null);
  const followUpHeading = useRef(null);
  const highlight = useRef(null);
  const page = result?.page;

  useEffect(() => {
    if (savedPassage) {
      highlight.current?.scrollIntoView?.({ block: "nearest" });
      return;
    }

    const controller = new AbortController();
    getSurveyPdfPage(documentId, pageNumber, controller.signal)
      .then(page => { if (!controller.signal.aborted) setResult({ page }); })
      .catch(error => {
        if (!controller.signal.aborted) {
          setResult({ error: error.response?.data?.message || "The PDF page could not be opened." });
        }
      });
    return () => controller.abort();
  }, [documentId, pageNumber, attempt, savedPassage]);

  useEffect(() => {
    if (savedPassage) return;
    let active = true;
    getPropertyRecords().then(records => {
      if (!active) return;
      const allowed = records.filter(record => record.property?.id && contributors.has(record.relationship?.permissionLevel));
      setHomes(allowed);
      const current = allowed.find(record => String(record.property.id) === String(propertyId));
      setHomeId(String((current || (allowed.length === 1 ? allowed[0] : null))?.property.id || ""));
    }).catch(() => { if (active) setHomeError(true); });
    return () => { active = false; };
  }, [savedPassage, propertyId]);

  function goToPage(nextPageNumber) {
    setResult(null);
    setSelection(null);
    setSaveError("");
    setPageNumber(nextPageNumber);
  }

  function captureSelection() {
    const { selectionStart: start, selectionEnd: end } = textField.current;
    const excerpt = page.text.slice(start, end);
    if (!excerpt.trim() || end - start > 2000) {
      setSaveError("Select some text from this page, up to 2,000 characters.");
      return;
    }
    setSelection({ start, end, excerpt, pageNumber: page.pageNumber, digest: page.digest });
    setSavedHomeId("");
    setSaveError("");
    requestAnimationFrame(() => followUpHeading.current?.focus());
  }

  function changePassage() {
    const { start, end } = selection;
    setSelection(null);
    setSavedHomeId("");
    setSaveError("");
    requestAnimationFrame(() => {
      textField.current?.focus();
      textField.current?.setSelectionRange(start, end);
    });
  }

  async function save(event) {
    event.preventDefault();
    if (!homeId || !title.trim() || !selection || pending) return;
    const { pageNumber, digest, start, end } = selection;
    const data = { title: title.trim(), passage: { documentId: Number(documentId), pageNumber, start, end, digest } };
    const fingerprint = JSON.stringify([homeId, data]);
    if (request.current?.fingerprint !== fingerprint) {
      request.current = { fingerprint, id: window.crypto.randomUUID() };
    }
    setPending(true);
    setSaveError("");
    try {
      const task = await createPropertyFollowUp(homeId, { ...data, requestId: request.current.id });
      if (!task?.id || !task.hasSurveyPassage) throw new Error("Follow-up response missing passage");
      setSavedHomeId(homeId);
      setTitle("");
      request.current = null;
    } catch (error) {
      setSaveError(error.response?.data?.message || "Couldn’t save this follow-up. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (savedPassage) {
    const { available, text, start, end, pageNumber } = savedPassage;
    return (
      <section className="space-y-4" aria-label="Saved survey passage">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl">Saved passage · Page {pageNumber}</h3>
          <Button variant="secondary" onClick={() => onShowPdf(pageNumber)}>View PDF page</Button>
        </div>
        {available ? (
          <div className="max-h-[58vh] overflow-auto whitespace-pre-wrap break-words rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4 leading-7">
            {text.slice(0, start)}<mark ref={highlight} className="rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] px-1 font-medium text-[var(--route-ink)] underline decoration-[var(--color-accent)] decoration-2 underline-offset-4">{text.slice(start, end)}</mark>{text.slice(end)}
          </div>
        ) : (
          <p className="ht-workspace-state" role="status">The source page has changed. Open the PDF to review the current wording.</p>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-label="Read and select a passage">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl">Page {pageNumber}{page ? ` of ${page.pageCount}` : ""}</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={pageNumber === 1 || pending} onClick={() => goToPage(pageNumber - 1)}>Previous page</Button>
          <Button variant="secondary" disabled={!page || pageNumber >= page.pageCount || pending} onClick={() => goToPage(pageNumber + 1)}>Next page</Button>
        </div>
      </div>
      {!result && <p role="status">Loading page text…</p>}
      {result?.error && (
        <div className="ht-workspace-state">
          <p role="alert">{result.error}</p>
          <Button variant="secondary" onClick={() => { setResult(null); setAttempt(current => current + 1); }}>Try again</Button>
        </div>
      )}
      {page && !selection && (
        <>
          <Button variant="text" onClick={() => onShowPdf(pageNumber)}>View PDF page</Button>
          {page.text ? (
            <>
              <label htmlFor="survey-page-text" className="block">Select the wording you want to follow up</label>
              <textarea id="survey-page-text" ref={textField} value={page.text} readOnly rows={10}
                className="ht-workspace-input block w-full resize-y leading-7" />
              <Button variant="secondary" onClick={captureSelection} disabled={pending}>Use selected text</Button>
            </>
          ) : <p className="ht-workspace-state">This page has no selectable text. You can still view the original PDF.</p>}
        </>
      )}
      {selection && (
        <section className="ht-panel space-y-4 p-4" aria-labelledby="survey-follow-up-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 id="survey-follow-up-heading" tabIndex={-1} ref={followUpHeading} className="text-xl">
              <HTGlyph name="task" size={20} className="mr-2 inline-block align-baseline" />Follow up on this passage
            </h3>
            <Button variant="text" disabled={pending} onClick={changePassage}>Change passage</Button>
          </div>
          <blockquote className="whitespace-pre-wrap break-words border-l-2 border-[var(--color-accent)] pl-3">{selection.excerpt}</blockquote>
          {savedHomeId ? (
            <div className="space-y-2">
              <p role="status">Follow-up saved.</p>
              <Link className="ht-workspace-link" to={`/control-centre?propertyId=${encodeURIComponent(savedHomeId)}`}>Open Control centre</Link>
            </div>
          ) : (
            <form onSubmit={save} className="space-y-4">
              <div className="ht-field">
                <label htmlFor="survey-follow-up-home">Save to home</label>
                <select id="survey-follow-up-home" required value={homeId} disabled={pending || !homes?.length} onChange={event => setHomeId(event.target.value)}>
                  <option value="">Choose a home</option>
                  {homes?.map(({ property, currentAddress }) => <option key={property.id} value={property.id}>{currentAddress?.addressLine1 || `Home ${property.id}`}</option>)}
                </select>
              </div>
              {homeError && <p role="alert">Homes could not be loaded. Reopen this document to try again.</p>}
              {homes?.length === 0 && <p>You need a home record you can contribute to. <Link className="ht-workspace-link" to="/property-profile">Open home records</Link></p>}
              <Field id="survey-follow-up-title" label="What do you want to follow up?" value={title} required maxLength={180}
                disabled={pending} onChange={event => setTitle(event.target.value)} />
              <p className="ht-workspace-muted">Saving links this survey and the selected passage to the chosen home.</p>
              <button type="submit" className="ht-workspace-primary" disabled={pending || !homeId || !title.trim()}>
                {pending ? "Saving…" : "Save follow-up"}
              </button>
            </form>
          )}
        </section>
      )}
      {saveError && <p role="alert" className="ht-workspace-state">{saveError}</p>}
    </section>
  );
}
