import { ArrowRight, FileText, House, KeyRound } from "lucide-react";

const connections = [
  {
    name: "ChatGPT / Dots",
    provider: "OpenAI",
    status: "Planned first",
    description: "Our first planned route to your preferred assistant.",
    initial: "01",
  },
  {
    name: "Grok Bot",
    provider: "xAI",
    status: "Exploring",
    description: "Exploring a connection for property questions and evidence.",
    initial: "02",
  },
  {
    name: "Muse",
    provider: "Meta",
    status: "Exploring",
    description: "Assessing a supported way to bring your home into the conversation.",
    initial: "03",
  },
  {
    name: "Instinct",
    provider: "Personal assistant",
    status: "Exploring",
    description: "Exploring how HomeTruth could work with Instinct.",
    initial: "04",
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
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
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
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-[var(--color-text-muted)]">
              We’re planning connections that bring your HomeTruth property
              record to the personal assistant you already use. Ask about your
              home without explaining its history all over again.
            </p>
            <div className="mt-7 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[color-mix(in_srgb,var(--color-accent)_6%,var(--color-surface-default))] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-secondary)]">
                <House size={18} aria-hidden="true" />
                A question we’re building towards
              </div>
              <p className="mt-3 text-xl font-bold leading-snug">
                “What needs attention in my home over the next three months?”
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                The aim: an answer grounded in your documents and recorded
                dates, with sources and a clear explanation of anything missing.
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-[var(--color-text-muted)]">
              Connections we’re planning and exploring
            </p>
            <ul className="divide-y divide-[var(--color-border-default)] border-y border-[var(--color-border-default)]">
              {connections.map((connection) => (
                <li key={connection.name} className="py-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="pt-1 text-xs font-bold tabular-nums text-[var(--color-secondary)]" aria-hidden="true">
                      {connection.initial}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs text-[var(--color-text-muted)]">{connection.provider}</p>
                          <h3 className="mt-0.5 text-xl font-bold">{connection.name}</h3>
                        </div>
                        <span className="rounded-[var(--radius-full)] border border-[var(--color-border-default)] bg-[color-mix(in_srgb,var(--color-secondary)_5%,var(--color-surface-default))] px-3 py-1 text-xs font-bold text-[var(--color-secondary)]">
                          {connection.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{connection.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid gap-4 border-b border-[var(--color-border-default)] pb-6 text-sm sm:grid-cols-3 sm:gap-6">
          <p className="flex items-start gap-2 leading-6"><KeyRound size={18} className="mt-0.5 flex-none text-[var(--color-secondary)]" aria-hidden="true" /><span>You choose the home and what to share.</span></p>
          <p className="flex items-start gap-2 leading-6"><FileText size={18} className="mt-0.5 flex-none text-[var(--color-accent)]" aria-hidden="true" /><span>First connections are planned for reading information, with changes kept in your hands.</span></p>
          <p className="flex items-start gap-2 leading-6"><ArrowRight size={18} className="mt-0.5 flex-none text-[var(--color-action-primary)]" aria-hidden="true" /><span>You’ll still be able to use HomeTruth’s own assistant.</span></p>
        </div>
        <p className="mt-5 max-w-4xl text-sm leading-6 text-[var(--color-text-muted)]">
          These connections are not available yet. Availability will depend on
          platform support, permissions and testing. No launch dates are confirmed.
        </p>
      </div>
    </section>
  );
}
