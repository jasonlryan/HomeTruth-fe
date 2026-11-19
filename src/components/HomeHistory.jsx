import HTGlyph from "./HTGlyph";
import "./workspace.css";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDemoHomeHistory } from "../utils/demoHomeHistory";

export default function HomeHistory({ record }) {
  const { user } = useAuth();
  const entries = getDemoHomeHistory(
    record,
    user?.email,
    process.env.REACT_APP_HOMEOWNER_DEMO === "true",
  );
  if (!entries.length) return null;
  return (
    <section
      aria-labelledby="home-history-title"
      className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--color-secondary)]">
            Your home over time
          </p>
          <h3
            id="home-history-title"
            className="mt-1 flex items-center gap-2 text-lg font-semibold text-[var(--color-text-default)]"
          >
            <HTGlyph name="history" size={21} aria-hidden="true" />
            Home history
          </h3>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 ht-workspace-muted">
        Observations, proposed work and recorded repairs, with the documents
        behind each step.
      </p>
      <ol className="mt-6 space-y-5">
        {entries.map((entry) => (
          <li
            key={entry.file}
            className="border-l-2 border-[var(--color-accent)] pl-5"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <time dateTime={entry.date} className="ht-workspace-muted">
                {new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(entry.date))}
              </time>
              <span className="text-[var(--color-secondary)]">
                {entry.kind}
              </span>
            </div>
            <h4 className="mt-2 text-lg text-[var(--color-text-default)]">
              {entry.title}
            </h4>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-default)]">
              {entry.body}
            </p>
            <p className="mt-2 text-sm leading-6 ht-workspace-muted">
              {entry.limit}
            </p>
            {entry.documentId ? (
              <Link
                className="mt-3 inline-flex items-center gap-2 text-sm ht-workspace-link"
                to={`/documents?preview=${encodeURIComponent(entry.documentId)}`}
                state={{ sourcePropertyId: record.property?.id }}
              >
                <HTGlyph name="document" size={15} aria-hidden="true" />
                Open {entry.file}
              </Link>
            ) : (
              <p className="mt-3 text-sm ht-workspace-muted">
                Source document not linked: {entry.file}
              </p>
            )}
          </li>
        ))}
      </ol>
      <div className="mt-6 border-t border-[var(--color-border-default)] pt-4 text-sm leading-6 ht-workspace-muted">
        Keep the source documents for future questions or a future resale. You
        choose what to share.
      </div>
    </section>
  );
}
