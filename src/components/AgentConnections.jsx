import { ArrowRight, FileText, House, KeyRound } from "lucide-react";

const connections = [
  {
    name: "Instinct",
    provider: "Personal assistant",
    status: "UK pilot candidate",
    availability: "Agent available in the UK",
    description:
      "Our starting point for exploring a connection for UK homeowners.",
    logo: "instinct.ico",
    lead: true,
  },
  {
    name: "ChatGPT / Dots",
    provider: "OpenAI",
    status: "Planned",
    availability: "Personal-agent UK launch awaited",
    description:
      "A future connection, subject to UK availability and platform support.",
    logo: "openai.svg",
  },
  {
    name: "Grok Bot",
    provider: "xAI",
    status: "Exploring",
    availability: "Personal-agent UK launch awaited",
    description: "Exploring property questions and evidence through Grok Bot.",
    logo: "grok.svg",
  },
  {
    name: "Muse",
    provider: "Meta",
    status: "Exploring",
    availability: "Personal-agent UK launch awaited",
    description:
      "Exploring a supported way to bring your home into the conversation.",
    logo: "muse.svg",
  },
];

export default function AgentConnections() {
  return (
    <section
      id="agent-connections"
      aria-labelledby="agent-connections-title"
      className="scroll-mt-24 bg-[var(--color-surface-default)] px-6 py-14 font-brand text-[var(--color-text-default)] sm:px-8 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <div>
            <p className="text-sm font-bold tracking-wide text-[var(--color-secondary)]">
              On our roadmap
            </p>
            <h2
              id="agent-connections-title"
              className="mt-3 max-w-lg text-3xl font-bold leading-tight sm:text-4xl"
            >
              Your home. The assistant you choose.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-[color-mix(in_srgb,var(--color-text-default)_75%,var(--color-surface-default))]">
              We’re planning connections that bring your HomeTruth property
              record to the personal assistant you already use. Ask about your
              home without explaining its history all over again.
            </p>
            <div className="mt-7 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[color-mix(in_srgb,var(--color-accent)_6%,var(--color-surface-default))] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-secondary)]">
                <House size={18} aria-hidden="true" />A question we’re building
                towards
              </div>
              <p className="mt-3 text-xl font-bold leading-snug">
                “What needs attention in my home over the next three months?”
              </p>
              <p className="mt-3 text-sm leading-6 text-[color-mix(in_srgb,var(--color-text-default)_75%,var(--color-surface-default))]">
                The aim: an answer grounded in your documents and recorded
                dates, with sources and a clear explanation of anything missing.
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-[color-mix(in_srgb,var(--color-text-default)_75%,var(--color-surface-default))]">
              Connections we’re planning and exploring
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {connections.map((connection) => (
                <li
                  key={connection.name}
                  className={`flex flex-col rounded-[var(--radius-lg)] border p-5 sm:p-6 ${connection.lead ? "border-[var(--color-secondary)] bg-[color-mix(in_srgb,var(--color-secondary)_5%,var(--color-surface-default))]" : "border-[var(--color-border-default)] bg-[var(--color-surface-default)]"}`}
                >
                  <div className="flex h-16 items-start justify-between gap-3">
                    <img
                      src={`/assets/agents/${connection.logo}`}
                      alt=""
                      width="48"
                      height="48"
                      className="h-12 w-12 object-contain"
                    />
                    {connection.lead && (
                      <span className="rounded-[var(--radius-full)] bg-[var(--color-secondary)] px-3 py-1 text-xs font-bold text-[var(--color-text-on-dark)]">
                        UK first
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-[color-mix(in_srgb,var(--color-text-default)_75%,var(--color-surface-default))]">
                    {connection.provider}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold">{connection.name}</h3>
                  <p className="mt-2 text-xs font-bold text-[var(--color-secondary)]">
                    {connection.availability}
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-6 text-[color-mix(in_srgb,var(--color-text-default)_75%,var(--color-surface-default))]">
                    {connection.description}
                  </p>
                  <div className="mt-5 border-t border-[var(--color-border-default)] pt-3">
                    <p className="text-xs text-[color-mix(in_srgb,var(--color-text-default)_75%,var(--color-surface-default))]">
                      HomeTruth connection
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      {connection.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid gap-4 border-b border-[var(--color-border-default)] pb-6 text-sm sm:grid-cols-3 sm:gap-6">
          <p className="flex items-start gap-2 leading-6">
            <KeyRound
              size={18}
              className="mt-0.5 flex-none text-[var(--color-secondary)]"
              aria-hidden="true"
            />
            <span>You choose the home and what to share.</span>
          </p>
          <p className="flex items-start gap-2 leading-6">
            <FileText
              size={18}
              className="mt-0.5 flex-none text-[var(--color-accent)]"
              aria-hidden="true"
            />
            <span>
              First connections are planned for reading information, with
              changes kept in your hands.
            </span>
          </p>
          <p className="flex items-start gap-2 leading-6">
            <ArrowRight
              size={18}
              className="mt-0.5 flex-none text-[var(--color-action-primary)]"
              aria-hidden="true"
            />
            <span>You’ll still be able to use HomeTruth’s own assistant.</span>
          </p>
        </div>
        <p className="mt-5 max-w-4xl text-sm leading-6 text-[color-mix(in_srgb,var(--color-text-default)_75%,var(--color-surface-default))]">
          These connections are not available yet. Availability will depend on
          platform support, permissions and testing. No launch dates are
          confirmed. UK availability above refers to personal-agent products,
          rather than general chat services. Brand marks belong to their
          respective owners; no partnership or endorsement is implied.
        </p>
      </div>
    </section>
  );
}
