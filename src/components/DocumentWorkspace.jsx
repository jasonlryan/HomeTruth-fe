import SurveyPassages from "./SurveyPassages";
import HTGlyph from "./HTGlyph";
import "./workspace.css";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  askDocumentAI,
  getDocumentChats,
  getDocumentPreviewFile,
} from "../api/api";

export default function DocumentWorkspace({
  document: doc,
  initialTab = "preview",
  onClose,
  propertyId,
  savedPassage,
  allowPassages = false,
}) {
  const [tab, setTab] = useState(savedPassage ? "passages" : initialTab);
  const [pdfPage, setPdfPage] = useState(1);
  const [passagesOpened, setPassagesOpened] = useState(Boolean(savedPassage));
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [hasOlderHistory, setHasOlderHistory] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const alive = useRef(true);
  const documentGeneration = useRef(0);
  const request = useRef(null);
  const previewTab = useRef(null);
  const chatTab = useRef(null);
  const passagesTab = useRef(null);
  const canReadPassages = Boolean(savedPassage || (allowPassages && (doc.file_type === ".pdf" || /\.pdf$/i.test(doc.name || ""))));
  const tabs = [
    ["preview", "Preview", previewTab],
    ...(canReadPassages ? [["passages", "Passages", passagesTab]] : []),
    ["chat", "Chat with Document", chatTab],
  ];

  useEffect(() => {
    alive.current = true;
    const generation = ++documentGeneration.current;
    const isCurrent = () => alive.current && documentGeneration.current === generation;
    setHistory([]);
    setHistoryLoading(true);
    setHistoryError("");
    setHistoryPage(1);
    setHasOlderHistory(false);
    setLoadingOlder(false);
    setPreview(null);
    setPreviewError("");
    setQuestion("");
    setError("");
    setAsking(false);
    const controller = new AbortController();
    let objectUrl;
    const previousFocus = window.document.activeElement;
    const overflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    getDocumentPreviewFile(doc.id, controller.signal)
      .then(async (blob) => {
        if (!isCurrent()) return;
        if (blob.type.includes("json")) {
          const payload = JSON.parse(await blob.text());
          if (!payload.success || !payload.data)
            throw new Error("Preview unavailable");
          if (!isCurrent()) return;
          const data = payload.data;
          setPreview(
            data.preview_image
              ? { url: data.preview_image, type: "image/png" }
              : {
                  type: "text",
                  text:
                    data.preview_content || "No source preview is available.",
                  complete: data.has_full_content,
                },
          );
        } else {
          objectUrl = URL.createObjectURL(blob);
          setPreview({ url: objectUrl, type: blob.type, download: true });
        }
      })
      .catch((err) => {
        if (isCurrent() && err.code !== "ERR_CANCELED")
          setPreviewError(
            "The file preview could not be loaded. You can still ask about this document.",
          );
      });
    getDocumentChats(doc.id, { page: 1, limit: 100 })
      .then((response) => {
        if (isCurrent()) {
          setHistory(response?.data?.chats || []);
          setHistoryPage(1);
          setHasOlderHistory(Boolean(response?.data?.pagination?.has_next_page));
        }
      })
      .catch(() => {
        if (isCurrent())
          setHistoryError(
            "Previous questions could not be loaded. Close and reopen this document to retry.",
          );
      })
      .finally(() => {
        if (isCurrent()) setHistoryLoading(false);
      });
    return () => {
      alive.current = false;
      controller.abort();
      request.current?.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      window.document.body.style.overflow = overflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [doc.id]);

  async function loadOlderHistory() {
    const generation = documentGeneration.current;
    const isCurrent = () => alive.current && documentGeneration.current === generation;
    if (loadingOlder) return;
    setLoadingOlder(true);
    setHistoryError("");
    try {
      const response = await getDocumentChats(doc.id, { page: historyPage + 1, limit: 100 });
      if (!isCurrent()) return;
      setHistory(previous => Array.from(new Map([
        ...previous, ...(response?.data?.chats || []),
      ].map(chat => [chat.id, chat])).values()));
      setHistoryPage(previous => previous + 1);
      setHasOlderHistory(Boolean(response?.data?.pagination?.has_next_page));
    } catch {
      if (isCurrent()) setHistoryError("Older questions could not be loaded. Try again.");
    } finally {
      if (isCurrent()) setLoadingOlder(false);
    }
  }

  function handleKey(event) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
    }
    if (event.key !== "Tab") return;
    const targets = [
      ...dialog.current.querySelectorAll(
        "button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href],iframe",
      ),
    ].filter(
      (el) =>
        !el.closest("[hidden]") &&
        el.tabIndex >= 0 &&
        el.getClientRects().length,
    );
    const first = targets[0],
      last = targets[targets.length - 1];
    if (event.shiftKey && window.document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && window.document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  function switchTab(next, focus = false) {
    setTab(next);
    if (next === "passages") setPassagesOpened(true);
    if (focus) tabs.find(([key]) => key === next)?.[2].current?.focus();
  }
  async function submit(event) {
    const generation = documentGeneration.current;
    const isCurrent = () => alive.current && documentGeneration.current === generation;
    event.preventDefault();
    if (!question.trim() || asking || historyLoading) return;
    const sent = question.trim();
    setAsking(true);
    setError("");
    const controller = new AbortController();
    request.current = controller;
    try {
      const response = await askDocumentAI(doc.id, sent, controller.signal);
      if (!isCurrent()) return;
      const data = response?.data;
      if (!response?.success || !data?.current_answer)
        throw new Error("No answer");
      setHistory((current) => [
        {
          id: `answer-${Date.now()}`,
          question: sent,
          answer: data.current_answer,
        },
        ...current,
      ]);
      setQuestion("");
    } catch (err) {
      if (isCurrent() && err.code !== "ERR_CANCELED")
        setError(
          "The answer could not be loaded. Your question is still here; try again.",
        );
    } finally {
      if (isCurrent()) setAsking(false);
    }
  }
  const button = "ht-workspace-control";
  return (
    <div
      className="ht-ui fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-surface-dark)]/50 p-2 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-workspace-title"
        onKeyDown={handleKey}
        className="flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] text-[var(--color-text-default)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-border-default)] p-4 sm:p-6">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm text-[var(--color-secondary)]">
              <HTGlyph name="document" size={16} aria-hidden="true" />
              Document workspace
            </p>
            <h2
              id="document-workspace-title"
              className="mt-2 break-words text-xl font-semibold"
            >
              {doc.name}
            </h2>
            <p className="mt-1 text-sm ht-workspace-muted">
              {doc.doc_type || doc.category || "Property document"}
            </p>
          </div>
          <button
            ref={closeButton}
            onClick={onClose}
            aria-label="Close document"
            className={button}
          >
            <HTGlyph name="close" size={20} />
          </button>
        </header>
        <div
          role="tablist"
          aria-label="Document views"
          className="flex flex-wrap gap-2 border-b border-[var(--color-border-default)] px-4 py-3 sm:px-6"
          onKeyDown={(event) => {
            if (
              ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
            ) {
              event.preventDefault();
              const current = tabs.findIndex(([key]) => key === tab);
              const step = event.key === "ArrowRight" ? 1 : -1;
              const next = event.key === "Home" ? 0
                : event.key === "End" ? tabs.length - 1
                  : (current + step + tabs.length) % tabs.length;
              switchTab(tabs[next][0], true);
            }
          }}
        >
          {tabs.map(([value, label, ref]) => (
            <button
              key={value}
              ref={ref}
              id={`document-tab-${value}`}
              role="tab"
              aria-selected={tab === value}
              aria-controls={`document-panel-${value}`}
              tabIndex={tab === value ? 0 : -1}
              onClick={() => switchTab(value)}
              className="ht-content-tab"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0 p-4 sm:p-6">
            <div
              id="document-panel-preview"
              role="tabpanel"
              aria-labelledby="document-tab-preview"
              hidden={tab !== "preview"}
            >
              {previewError ? (
                <p role="alert" className="p-4">
                  {previewError}
                </p>
              ) : !preview ? (
                <p role="status" className="flex items-center gap-2 p-5">
                  <HTGlyph name="loading" className="animate-spin" size={18} />
                  Loading document preview…
                </p>
              ) : (
                <>
                  {preview.type === "text" ? (
                    <div>
                      <p className="mb-3 text-sm ht-workspace-muted">
                        Source text
                        {preview.complete === false
                          ? " · extracted preview"
                          : ""}
                      </p>
                      <pre className="max-h-[58vh] overflow-auto whitespace-pre-wrap rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-5 font-chat text-sm leading-7">
                        {preview.text}
                      </pre>
                    </div>
                  ) : preview.type.includes("pdf") ? (
                    <iframe
                      src={pdfPage === 1 ? preview.url : `${preview.url}#page=${pdfPage}`}
                      title={`Preview of ${doc.name}`}
                      className="h-[58vh] w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)]"
                    />
                  ) : preview.type.startsWith("image/") ? (
                    <img
                      src={preview.url}
                      alt={doc.name}
                      className="max-h-[58vh] max-w-full object-contain"
                    />
                  ) : (
                    <p className="py-6">
                      This file can be downloaded for viewing.
                    </p>
                  )}
                  {preview.download && (
                    <a
                      className="mt-4 inline-block text-sm ht-workspace-link"
                      href={preview.url}
                      download={doc.name}
                    >
                      Download source document
                    </a>
                  )}
                </>
              )}
            </div>
            {canReadPassages && (
              <div id="document-panel-passages" role="tabpanel" aria-labelledby="document-tab-passages" hidden={tab !== "passages"}>
                {passagesOpened && (
                  <SurveyPassages documentId={doc.id} propertyId={propertyId} savedPassage={savedPassage}
                    onShowPdf={page => { setPdfPage(page); switchTab("preview", true); }} />
                )}
              </div>
            )}
            <div
              id="document-panel-chat"
              role="tabpanel"
              aria-labelledby="document-tab-chat"
              hidden={tab !== "chat"}
              className="font-chat"
            >
              <p className="mb-4 text-sm leading-6 ht-workspace-muted">
                Questions here use this document. Switch to Preview to check the
                source.
              </p>
              <form onSubmit={submit}>
                <label htmlFor="document-question" className="text-sm">
                  Ask about {doc.name}
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="document-question"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    disabled={asking || historyLoading}
                    className="ht-workspace-input min-w-0 flex-1"
                    placeholder="What does this document establish?"
                  />
                  <button
                    disabled={asking || historyLoading || !question.trim()}
                    className={"ht-workspace-primary"}
                  >
                    Ask
                  </button>
                </div>
              </form>
              {error && (
                <p role="alert" className="mt-3 text-sm">
                  {error}
                </p>
              )}
              {asking && (
                <p
                  role="status"
                  className="mt-4 flex items-center gap-2 text-sm"
                >
                  <HTGlyph name="loading" className="animate-spin" size={16} />
                  Checking this document…
                </p>
              )}
              {historyLoading && (
                <p role="status" className="mt-4 text-sm">
                  Loading previous questions…
                </p>
              )}
              {historyError && (
                <p role="alert" className="mt-4 text-sm">
                  {historyError}
                </p>
              )}
              {!historyLoading && !historyError && !history.length && (
                <p className="mt-6 text-sm ht-workspace-muted">
                  No questions yet. Ask about the findings, amounts or limits in
                  this document.
                </p>
              )}
              {hasOlderHistory && (
                <button type="button" className="mt-4 underline" disabled={loadingOlder} onClick={loadOlderHistory}>
                  {loadingOlder ? "Loading older questions…" : "Load older questions"}
                </button>
              )}
              <div className="mt-6 space-y-6">
                {history.map((chat, index) => (
                  <article
                    key={chat.id || index}
                    className="border-t border-[var(--color-border-default)] pt-4"
                  >
                    <h3 className="mb-3 font-semibold">
                      {chat.question || chat.user_message}
                    </h3>
                    <div className="prose prose-sm max-w-none break-words">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {chat.answer || chat.assistant_reply || ""}
                      </ReactMarkdown>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <aside className="border-t border-[var(--color-border-default)] p-4 sm:p-6 lg:border-l lg:border-t-0">
            <h3 className="text-lg">Document details</h3>
            <dl className="mt-4 space-y-4 text-sm">
              {[
                ["Type", doc.doc_type || doc.category],
                ["Status", doc.status],
                [
                  "Added",
                  doc.created_at || doc.createdAt
                    ? new Date(
                        doc.created_at || doc.createdAt,
                      ).toLocaleDateString("en-GB")
                    : null,
                ],
                ["Tags", Array.isArray(doc.tags) ? doc.tags.join(", ") : null],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="ht-workspace-muted">{label}</dt>
                  <dd className="mt-1 break-words">
                    {value || "Not recorded"}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm leading-6 ht-workspace-muted">
              A document records its stated scope. A quotation is proposed work;
              an invoice alone does not prove payment.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
