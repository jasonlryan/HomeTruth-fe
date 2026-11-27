import HTGlyph from "../components/HTGlyph";
import PageTitle from "../components/PageTitle";
import "../components/workspace.css";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
const sections = [
  "Overview",
  "Home records",
  "Programmes",
  "Connections",
];
const panel =
  "rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-5 sm:p-6";
const button = "ht-workspace-control";

export default function OperationsDemo() {
  const { user } = useAuth();
  const [section, setSection] = useState("Overview");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
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
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  const filtered = homes.filter((home) =>
    `${home.name} ${home.address}`.toLowerCase().includes(query.toLowerCase()),
  );
  function changeSection(value) {
    setSection(value);
    setMessage("");
    setSelected(null);
  }
  return (
    <div className="p-4 sm:p-8 text-[var(--color-text-default)]">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-[var(--color-secondary)]">
            HomeTruth workspace
          </p>
          <PageTitle className="mt-2">Operations walkthrough</PageTitle>
          <p className="mt-3 max-w-2xl ht-workspace-muted">
            Support a useful home record, trusted guidance and programmes that
            put homeowners in control.
          </p>
        </div>
        <Link className={button} to="/admin">
          Admin overview
          <HTGlyph name="arrow-right" size={16} />
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
            className={`${button} ${section === value ? "ht-workspace-selected" : ""}`}
          >
            {value}
          </button>
        ))}
        <Link className={button} to="/admin/knowledge-base">Knowledge index</Link>
        <Link className={button} to="/admin/resources">Resources</Link>
      </nav>
      {message && (
        <p role="status" className={`${panel} mb-5`}>
          {message}
        </p>
      )}
      {section === "Overview" && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Home records", "3", "Documents, work history and next steps"],
              ["Documents", "12", "Linked to the right home"],
            ].map(([label, value, detail]) => (
              <div className={panel} key={label}>
                <p className="text-sm ht-workspace-muted">{label}</p>
                <p className="my-3 text-4xl">{value}</p>
                <p className="text-sm ht-workspace-muted">{detail}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className={panel}>
              <h2 className="text-lg font-semibold">
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
              <p className="mt-6 text-sm ht-workspace-muted">These sample records illustrate the homeowner journey.</p>
            </section>
            <section className={panel}>
              <h2 className="text-lg font-semibold">Work to review</h2>
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
                    <p className="mt-1 text-sm ht-workspace-muted">
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
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <HTGlyph name="consent" size={20} />
              Two clear data boundaries
            </h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <h3>Homeowner record</h3>
                <p className="mt-2 text-sm leading-6 ht-workspace-muted">
                  Individual documents, notes and home history belong in the
                  owner’s experience. Sharing needs a specific choice and
                  purpose.
                </p>
              </div>
              <div>
                <h3>Partner programme</h3>
                <p className="mt-2 text-sm leading-6 ht-workspace-muted">
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
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <HTGlyph name="building" size={20} />
              Home records
            </h2>
            <label className="flex items-center gap-2">
              <HTGlyph name="search" size={16} />
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
                        className="border-b border-[var(--color-border-default)] p-3 font-normal ht-workspace-muted"
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
              <h3 className="text-lg font-semibold">
                {selected.name} · {selected.address}
              </h3>
              <p className="mt-3 text-sm">{selected.review}</p>
              <p className="mt-3 text-sm ht-workspace-muted">
                {selected.documents} documents · {selected.event}
              </p>
            </div>
          )}
        </section>
      )}
      {section === "Programmes" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className={panel}>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <HTGlyph name="household" size={20} />
              Partner programmes
            </h2>
            <p className="mt-3 text-sm leading-6 ht-workspace-muted">
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
            <h2 className="text-lg font-semibold">Programme reporting</h2>
            <p className="mt-3 text-sm leading-6 ht-workspace-muted">
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
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <HTGlyph name="consent" size={20} />
              Owner-controlled sharing
            </h2>
            <p className="mt-3 text-sm leading-6 ht-workspace-muted">
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
            <h2 className="text-lg font-semibold">A continuing home record</h2>
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
                  <p className="mt-2 text-sm leading-6 ht-workspace-muted">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
