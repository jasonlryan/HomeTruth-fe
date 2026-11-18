import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Building2,
  FileText,
  Search,
  ShieldCheck,
  BookOpen,
  Users,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isDemoWorkspaceUser } from "../utils/demoHomeHistory";

// Presentation fixtures remain separate from all operational/admin APIs.
const homes = [
  {
    name: "Maya",
    address: "18 Alder Walk, Exampleton",
    documents: 3,
    event: "Gutter work recorded",
    review: "Payment evidence not recorded",
  },
  {
    name: "Robin",
    address: "7 Willow Lane, Exampleton",
    documents: 5,
    event: "Boiler service added",
    review: "Next service date to check",
  },
  {
    name: "Leah",
    address: "24 Birch Close, Exampleton",
    documents: 4,
    event: "Home handover pack added",
    review: "Warranty details to confirm",
  },
];
const sources = [
  {
    title: "Understanding your survey",
    category: "Buying & surveys",
    date: "12 Nov 2026",
    status: "Published",
  },
  {
    title: "Keeping records of home repairs",
    category: "Maintenance",
    date: "10 Nov 2026",
    status: "Published",
  },
  {
    title: "What a quotation and invoice establish",
    category: "Documents",
    date: "14 Nov 2026",
    status: "In review",
  },
  {
    title: "Preparing your home information for a sale",
    category: "Selling",
    date: "16 Nov 2026",
    status: "Draft",
  },
];
const sections = [
  "Overview",
  "Home records",
  "Knowledge",
  "Programmes",
  "Connections",
  "Content",
];
const panel =
  "rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-5 sm:p-6";
const button =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-4 py-2 text-sm hover:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]";

export default function OperationsDemo() {
  const { user } = useAuth();
  const [section, setSection] = useState("Overview");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [source, setSource] = useState(null);
  const [programme, setProgramme] = useState("Completion to home ownership");
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState(() => {
    try {
      return (
        JSON.parse(sessionStorage.getItem("ht-presentation-sharing")) || {
          summary: true,
          documents: false,
          history: false,
        }
      );
    } catch {
      return { summary: true, documents: false, history: false };
    }
  });
  if (!isDemoWorkspaceUser(user?.email))
    return <Navigate to="/dashboard" replace />;
  const filtered = homes.filter((home) =>
    `${home.name} ${home.address}`.toLowerCase().includes(query.toLowerCase()),
  );
  function changeSection(value) {
    setSection(value);
    setMessage("");
    setSelected(null);
    setSource(null);
  }
  return (
    <div className="p-4 sm:p-8 text-[var(--color-text-default)]">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-[var(--color-secondary)]">
            HomeTruth workspace
          </p>
          <h1 className="mt-2 text-3xl">Operations</h1>
          <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
            Support a useful home record, trusted guidance and programmes that
            put homeowners in control.
          </p>
        </div>
        <Link className={button} to="/property-profile">
          Open Maya’s home
          <ArrowRight size={16} />
        </Link>
      </header>
      <nav
        aria-label="Operations sections"
        className="mb-6 flex flex-wrap gap-2"
      >
        {sections.map((value) => (
          <button
            key={value}
            aria-pressed={section === value}
            onClick={() => changeSection(value)}
            className={`${button} ${section === value ? "bg-[var(--color-accent)] text-[var(--color-text-on-dark)]" : ""}`}
          >
            {value}
          </button>
        ))}
      </nav>
      {message && (
        <p role="status" className={`${panel} mb-5`}>
          {message}
        </p>
      )}
      {section === "Overview" && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Home records", "3", "Documents, work history and next steps"],
              ["Documents", "12", "Linked to the right home"],
              ["Guidance in review", "1", "Source quality before publication"],
            ].map(([label, value, detail]) => (
              <div className={panel} key={label}>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {label}
                </p>
                <p className="my-3 text-4xl">{value}</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {detail}
                </p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className={panel}>
              <h2 className="text-xl">
                From first document to a lasting home record
              </h2>
              <ol className="mt-5 space-y-4">
                {[
                  "Buyer adds their survey and asks what it establishes.",
                  "Homeowner compares proposed work with the contractor’s record.",
                  "Documents, notes and work history stay together over time.",
                  "For a future sale, the owner selects the evidence they want to share.",
                ].map((text, index) => (
                  <li key={text} className="flex gap-3 text-sm leading-6">
                    <span className="text-[var(--color-accent)]">
                      0{index + 1}
                    </span>
                    {text}
                  </li>
                ))}
              </ol>
              <Link className={`${button} mt-6`} to="/property-profile">
                Follow the homeowner journey
              </Link>
            </section>
            <section className={panel}>
              <h2 className="text-xl">Work to review</h2>
              <div className="mt-4 space-y-4">
                {homes.map((home) => (
                  <button
                    className="block w-full border-b border-[var(--color-border-default)] pb-4 text-left"
                    key={home.name}
                    onClick={() => {
                      changeSection("Home records");
                      setSelected(home);
                    }}
                  >
                    <p>{home.event}</p>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {home.name} · {home.address}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-secondary)]">
                      {home.review}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          </div>
          <section className={`${panel} mt-6`}>
            <h2 className="flex items-center gap-2 text-xl">
              <ShieldCheck size={20} />
              Two clear data boundaries
            </h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <h3>Homeowner record</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  Individual documents, notes and home history belong in the
                  owner’s experience. Sharing needs a specific choice and
                  purpose.
                </p>
              </div>
              <div>
                <h3>Partner programme</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  Programme reporting uses aggregate activity. Sponsoring a
                  programme does not grant access to an individual home.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
      {section === "Home records" && (
        <section className={panel}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-xl">
              <Building2 size={20} />
              Home records
            </h2>
            <label className="flex items-center gap-2">
              <Search size={16} />
              <input
                aria-label="Search home records"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search owner or address"
                className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-2 text-sm"
              />
            </label>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  {["Owner", "Home", "Documents", "Latest activity", ""].map(
                    (title, index) => (
                      <th
                        className="border-b border-[var(--color-border-default)] p-3 font-normal text-[var(--color-text-muted)]"
                        key={index}
                      >
                        {title}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((home) => (
                  <tr key={home.name}>
                    <td className="p-3">{home.name}</td>
                    <td className="p-3">{home.address}</td>
                    <td className="p-3">{home.documents}</td>
                    <td className="p-3">{home.event}</td>
                    <td className="p-3">
                      <button
                        className={button}
                        onClick={() => setSelected(home)}
                      >
                        View record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <p className="p-4">No matching home records.</p>
            )}
          </div>
          {selected && (
            <div className="mt-5 border-t border-[var(--color-border-default)] pt-5">
              <h3 className="text-xl">
                {selected.name} · {selected.address}
              </h3>
              <p className="mt-3 text-sm">{selected.review}</p>
              {selected.name === "Maya" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className={button} to="/property-profile">
                    Open home history
                  </Link>
                  <Link className={button} to="/documents">
                    Open documents
                  </Link>
                  <Link className={button} to="/saved-notes">
                    Open notes
                  </Link>
                </div>
              ) : (
                <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                  {selected.documents} documents · {selected.event}
                </p>
              )}
            </div>
          )}
        </section>
      )}
      {section === "Knowledge" && (
        <section className={panel}>
          <h2 className="flex items-center gap-2 text-xl">
            <BookOpen size={20} />
            Knowledge library
          </h2>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Prepare, review and organise the guidance behind homeowner answers.
          </p>
          <div className="mt-5 grid gap-3">
            {sources.map((item) => (
              <button
                className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4 text-left"
                key={item.title}
                onClick={() => setSource(item)}
              >
                <div>
                  <h3>{item.title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {item.category} · Updated {item.date}
                  </p>
                </div>
                <span className="text-sm text-[var(--color-secondary)]">
                  {item.status}
                </span>
              </button>
            ))}
          </div>
          {source && (
            <div className="mt-5 border-t border-[var(--color-border-default)] pt-5">
              <h3 className="text-lg">{source.title}</h3>
              <p className="mt-3 text-sm leading-6">
                Review the original source, the claims it supports, its date and
                any limits before publishing it as guidance.
              </p>
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                Workflow: received → extracted → reviewed → published
              </p>
            </div>
          )}
        </section>
      )}
      {section === "Programmes" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className={panel}>
            <h2 className="flex items-center gap-2 text-xl">
              <Users size={20} />
              Partner programmes
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
              One shared programme model for mortgage providers, insurers and
              home developers: invitation, owner choice, useful home support and
              aggregate reporting.
            </p>
            <label className="mt-5 block text-sm" htmlFor="programme-title">
              Programme name
            </label>
            <input
              id="programme-title"
              value={programme}
              onChange={(e) => setProgramme(e.target.value)}
              className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-3"
            />
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                className={button}
                onClick={() =>
                  setMessage(
                    `Programme draft: ${programme || "Untitled programme"}. Audience and purpose must be agreed before launch.`,
                  )
                }
              >
                Review programme
              </button>
              <button
                className={button}
                onClick={() =>
                  setMessage(
                    `Invitation: You’re invited to ${programme || "HomeTruth"}. Create your home record and understand your documents. Joining does not share your individual record with the sponsor.`,
                  )
                }
              >
                Preview invitation
              </button>
            </div>
          </section>
          <section className={panel}>
            <h2 className="text-xl">Programme reporting</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
              Track invitation, activation, first useful answer and return
              visits at cohort level. Show reporting thresholds and missing
              data, rather than exposing individual property activity.
            </p>
            <ul className="mt-5 space-y-4 text-sm">
              {[
                "Programme configuration and audience",
                "Purpose-specific consent and access records",
                "Aggregate engagement and outcome evidence",
                "Review, renewal or stop decision",
              ].map((text) => (
                <li
                  key={text}
                  className="border-b border-[var(--color-border-default)] pb-3"
                >
                  {text}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
      {section === "Connections" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className={panel}>
            <h2 className="flex items-center gap-2 text-xl">
              <ShieldCheck size={20} />
              Owner-controlled sharing
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
              Choose the information you would include in a home summary.
              Preferences do not send information to another service.
            </p>
            <div className="mt-5 space-y-4">
              {[
                ["summary", "Home summary"],
                ["documents", "Selected documents"],
                ["history", "Work history"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4"
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={preferences[key]}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        [key]: e.target.checked,
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <button
              className={`${button} mt-5`}
              onClick={() => {
                sessionStorage.setItem(
                  "ht-presentation-sharing",
                  JSON.stringify(preferences),
                );
                setMessage("Sharing preferences saved for this session.");
              }}
            >
              Save preferences
            </button>
          </section>
          <section className={panel}>
            <h2 className="text-xl">A continuing home record</h2>
            <div className="mt-5 space-y-5">
              {[
                [
                  "Appliances and warranties",
                  "Keep manuals, model details, purchase evidence and warranty terms with the home.",
                ],
                [
                  "Home performance",
                  "Understand running costs using information the owner authorises, with source and date context.",
                ],
                [
                  "Personal assistants",
                  "Select a purpose and permission scope before another assistant can access home information.",
                ],
                [
                  "Future resale",
                  "Owner-selected evidence can support a future handover; documents retain their source and limits.",
                ],
              ].map(([title, body]) => (
                <div key={title}>
                  <h3>{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
      {section === "Content" && (
        <section className={panel}>
          <h2 className="flex items-center gap-2 text-xl">
            <FileText size={20} />
            Homeowner content
          </h2>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Practical guidance for each stage of owning a home.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {sources.map((item) => (
              <article
                className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4"
                key={item.title}
              >
                <p className="text-xs text-[var(--color-secondary)]">
                  {item.category} · {item.status}
                </p>
                <h3 className="mt-3 text-lg">{item.title}</h3>
                <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                  Updated {item.date}
                </p>
                <button
                  className={`${button} mt-4`}
                  onClick={() =>
                    setMessage(
                      `${item.title}: check source attribution, owner usefulness, clarity and publication status.`,
                    )
                  }
                >
                  Review content
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
