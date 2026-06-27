"use client";

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  FlaskConical,
  Globe2,
  Layers3,
  Lock,
  LogOut,
  Megaphone,
  Plus,
  RefreshCcw,
  Search,
  Share2,
  Sparkles
} from "lucide-react";
import { PricingCards } from "@/components/PricingCards";
import { ScoreRing } from "@/components/ScoreRing";
import { moduleCosts, moduleLabels, type Experiment, type ExperimentStatus, type Idea, type ModuleKey, type Report } from "@/types/domain";

type SessionUser = { id: string; email: string; name: string; credits: number };
type TabKey = "summary" | "scores" | "market" | "financials" | "roadmap" | "experiments" | "billing";

const moduleOrder: ModuleKey[] = ["validation", "market", "businessPlan", "brand", "visual", "marketing"];
const statuses: ExperimentStatus[] = ["to_validate", "in_progress", "confirmed", "false"];
const statusLabels: Record<ExperimentStatus, string> = {
  to_validate: "To validate",
  in_progress: "In progress",
  confirmed: "Confirmed",
  false: "False"
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-mist">Loading founder workspace...</main>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [tab, setTab] = useState<TabKey>("summary");
  const [description, setDescription] = useState(searchParams.get("idea") || "");
  const [context, setContext] = useState({
    geography: "Turkey + EU",
    industry: "SaaS",
    customerSegment: "early-stage operators",
    model: "B2B",
    stage: "idea",
    founderSkills: "product, sales, no-code",
    budget: "under EUR 5k",
    riskTolerance: "medium",
    language: "tr"
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/auth/me");
    const data = await response.json();
    if (!data.user) {
      router.push("/auth");
      return;
    }
    setUser(data.user);
    setIdeas(data.ideas || []);
    setSelectedId((current) => current || data.ideas?.[0]?.id || "");
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectedIdea = useMemo(() => ideas.find((idea) => idea.id === selectedId) || ideas[0], [ideas, selectedId]);
  const report = selectedIdea?.reports[0];

  async function createIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("create");
    setMessage("");
    const response = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, context })
    });
    const data = await response.json();
    setBusy("");
    if (!response.ok) {
      setMessage(data.error || "Idea could not be created.");
      return;
    }
    setIdeas((current) => [data.idea, ...current]);
    setSelectedId(data.idea.id);
    setDescription("");
    setTab("summary");
  }

  async function validateIdea(ideaId: string) {
    setBusy("validate");
    setMessage("");
    const response = await fetch(`/api/ideas/${ideaId}/validate`, { method: "POST" });
    const data = await response.json();
    setBusy("");
    if (!response.ok) {
      setMessage(data.error || "Validation failed.");
      return;
    }
    setUser(data.user);
    setIdeas((current) => current.map((idea) => (idea.id === ideaId ? data.idea : idea)));
    setSelectedId(ideaId);
    setTab("summary");
  }

  async function updateExperiment(experiment: Experiment, status: ExperimentStatus) {
    if (status === "confirmed" && experiment.evidence.length === 0) {
      setMessage("Confirmed icin once evidence ekleyin. PRD guardrail aktif.");
      return;
    }
    const response = await fetch("/api/experiments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId: experiment.ideaId, experimentId: experiment.id, status })
    });
    const data = await response.json();
    if (response.ok) {
      setIdeas((current) => current.map((idea) => (idea.id === data.idea.id ? data.idea : idea)));
      setMessage("");
    }
  }

  async function addEvidence(experiment: Experiment) {
    const evidence = window.prompt("Evidence link or note");
    if (!evidence) return;
    const response = await fetch("/api/experiments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId: experiment.ideaId, experimentId: experiment.id, evidence })
    });
    const data = await response.json();
    if (response.ok) setIdeas((current) => current.map((idea) => (idea.id === data.idea.id ? data.idea : idea)));
  }

  async function purchase(pack: string) {
    const response = await fetch("/api/billing/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pack })
    });
    const data = await response.json();
    if (response.ok) {
      setUser(data.user);
      setMessage(`${pack} credits added with mock billing.`);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  function exportReport() {
    if (!selectedIdea || !report) return;
    const markdown = [
      `# ${selectedIdea.title}`,
      "",
      report.executiveSummary,
      "",
      `Viability: ${report.scores.viability}/100`,
      `Confidence: ${report.scores.confidence}/100`,
      "",
      "## Go signals",
      ...report.goSignals.map((signal) => `- ${signal}`),
      "",
      "## Stop signals",
      ...report.stopSignals.map((signal) => `- ${signal}`),
      "",
      ...report.sections.flatMap((section) => [`## ${section.title}`, section.summary, ...section.bullets.map((bullet) => `- ${bullet}`), ""])
    ].join("\n");
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selectedIdea.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-report.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-mist">
        <div className="panel p-6 font-black">Loading founder workspace...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mist">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-line bg-white p-4">
          <Link href="/" className="flex items-center gap-2 font-black">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white">
              <Sparkles size={18} />
            </span>
            VentureProof AI
          </Link>
          <button className="btn mt-6 w-full" onClick={() => document.getElementById("new-idea")?.scrollIntoView({ behavior: "smooth" })}>
            <Plus size={16} />
            Validate new idea
            <span className="rounded bg-white/15 px-1.5 py-0.5 text-xs">{moduleCosts.validation}cr</span>
          </button>
          <div className="mt-6 text-xs font-black uppercase text-ink/45">My ideas</div>
          <div className="mt-3 space-y-2">
            {ideas.length === 0 ? <div className="rounded-lg border border-dashed border-line p-3 text-sm text-ink/55">No ideas yet</div> : null}
            {ideas.map((idea) => (
              <button key={idea.id} className={`w-full rounded-lg border p-3 text-left text-sm ${selectedIdea?.id === idea.id ? "border-ink bg-mist" : "border-line bg-white"}`} onClick={() => setSelectedId(idea.id)}>
                <div className="font-black">{idea.title}</div>
                <div className="mt-1 text-xs text-ink/55">{idea.reports.length ? `${idea.reports.length} report versions` : "Ready to validate"}</div>
              </button>
            ))}
          </div>
          <div className="mt-6 text-xs font-black uppercase text-ink/45">Quick tools</div>
          <div className="mt-3 grid gap-2">
            {[
              [Search, "Idea generator"],
              [BarChart3, "Calculators"],
              [FileText, "Failure database"],
              [Globe2, "Benchmarks"]
            ].map(([Icon, label]) => {
              const TypedIcon = Icon as typeof Search;
              return (
                <button key={label as string} className="btn ghost justify-start">
                  <TypedIcon size={15} />
                  {label as string}
                </button>
              );
            })}
          </div>
        </aside>

        <section>
          <header className="sticky top-0 z-10 border-b border-line bg-mist/90 px-5 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black">{selectedIdea ? selectedIdea.title : "Start your validation journey"}</h1>
                <p className="text-sm text-ink/60">Evidence-first founder dashboard</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip bg-citrus/50">{user?.credits ?? 0} credits</span>
                <button className="btn ghost" onClick={exportReport} disabled={!report}>
                  <Download size={16} />
                  Export
                </button>
                <button className="btn ghost" disabled={!report}>
                  <Share2 size={16} />
                  Share
                </button>
                <button className="btn secondary" onClick={logout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="p-5">
            {message ? <div className="mb-4 rounded-lg border border-coral bg-coral/10 p-3 text-sm font-bold">{message}</div> : null}

            <section id="new-idea" className="panel p-5 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">Validate a new idea</h2>
                  <p className="mt-1 text-sm text-ink/60">The form stays inside the app shell. No landing-route leak.</p>
                </div>
                <span className="chip">{moduleCosts.validation} credits</span>
              </div>
              <form className="mt-5 grid gap-4" onSubmit={createIdea}>
                <textarea className="field min-h-28" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the idea, target customer and problem..." required />
                <div className="grid gap-3 md:grid-cols-4">
                  <input className="field" value={context.geography} onChange={(event) => setContext({ ...context, geography: event.target.value })} placeholder="Geography" />
                  <input className="field" value={context.industry} onChange={(event) => setContext({ ...context, industry: event.target.value })} placeholder="Industry" />
                  <input className="field" value={context.customerSegment} onChange={(event) => setContext({ ...context, customerSegment: event.target.value })} placeholder="Customer segment" />
                  <select className="field" value={context.stage} onChange={(event) => setContext({ ...context, stage: event.target.value })}>
                    <option value="idea">Idea</option>
                    <option value="mvp">MVP</option>
                    <option value="revenue">Revenue</option>
                    <option value="scaling">Scaling</option>
                  </select>
                </div>
                <button className="btn w-fit" disabled={busy === "create"}>
                  {busy === "create" ? "Saving..." : "Create idea"}
                  <ArrowRight size={16} />
                </button>
              </form>
            </section>

            {selectedIdea ? (
              <>
                <Journey idea={selectedIdea} busy={busy} onValidate={() => validateIdea(selectedIdea.id)} />
                <Tabs tab={tab} setTab={setTab} />
                <div className="mt-5">
                  {tab === "summary" && <Summary idea={selectedIdea} report={report} onValidate={() => validateIdea(selectedIdea.id)} busy={busy} />}
                  {tab === "scores" && <Scores report={report} />}
                  {tab === "market" && <Sections report={report} filter="Market" />}
                  {tab === "financials" && <Sections report={report} filter="Financials" />}
                  {tab === "roadmap" && <Sections report={report} filter="Roadmap" />}
                  {tab === "experiments" && <Experiments idea={selectedIdea} onStatus={updateExperiment} onEvidence={addEvidence} />}
                  {tab === "billing" && <Billing onPurchase={purchase} />}
                </div>
              </>
            ) : (
              <div className="mt-5 panel p-8 text-center">
                <Boxes className="mx-auto text-ocean" size={34} />
                <h2 className="mt-4 text-2xl font-black">Start your validation journey</h2>
                <p className="mt-2 text-ink/60">Create your first idea above. You have {user?.credits} credits waiting.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Journey({ idea, busy, onValidate }: { idea: Idea; busy: string; onValidate: () => void }) {
  return (
    <section className="mt-5 panel p-4">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {moduleOrder.map((key) => {
          const status = idea.modules[key];
          const readyValidation = key === "validation" && status !== "complete";
          return (
            <div key={key} className="min-w-52 rounded-lg border border-line bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="font-black">{moduleLabels[key]}</div>
                {status === "locked" ? <Lock size={15} /> : status === "complete" ? <CheckCircle2 className="text-moss" size={16} /> : <span className="chip">{moduleCosts[key]}</span>}
              </div>
              <div className="mt-2 text-xs font-bold uppercase text-ink/45">{status}</div>
              {readyValidation ? (
                <button className="btn mt-4 w-full" onClick={onValidate} disabled={busy === "validate"}>
                  {busy === "validate" ? "Generating..." : "Run validation"}
                </button>
              ) : status === "ready" ? (
                <button className="btn secondary mt-4 w-full">
                  <RefreshCcw size={15} />
                  Preview unlock
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Tabs({ tab, setTab }: { tab: TabKey; setTab: (tab: TabKey) => void }) {
  const tabs: TabKey[] = ["summary", "scores", "market", "financials", "roadmap", "experiments", "billing"];
  return (
    <div className="mt-5 flex gap-2 overflow-x-auto">
      {tabs.map((entry) => (
        <button key={entry} className={`rounded-lg border px-4 py-2 text-sm font-black capitalize ${tab === entry ? "border-ink bg-ink text-white" : "border-line bg-white"}`} onClick={() => setTab(entry)}>
          {entry}
        </button>
      ))}
    </div>
  );
}

function Summary({ idea, report, onValidate, busy }: { idea: Idea; report?: Report; onValidate: () => void; busy: string }) {
  if (!report) {
    return (
      <div className="panel p-8 text-center">
        <FlaskConical className="mx-auto text-ocean" size={34} />
        <h2 className="mt-4 text-2xl font-black">Validation is ready</h2>
        <p className="mx-auto mt-2 max-w-xl text-ink/60">Spend 40 credits to generate score, signals, sections, sources and experiments for {idea.title}.</p>
        <button className="btn mt-6" onClick={onValidate} disabled={busy === "validate"}>
          {busy === "validate" ? "Generating..." : "Run validation"}
        </button>
      </div>
    );
  }
  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="panel p-5">
        <ScoreRing value={report.scores.viability} label="Viability" />
        <div className="mt-5">
          <h2 className="text-xl font-black">Executive summary</h2>
          <p className="mt-3 leading-7 text-ink/70">{report.executiveSummary}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {report.sources.map((source) => (
            <span key={source.id} className="chip">
              {source.kind === "verified" ? <BadgeCheck size={14} /> : <AlertTriangle size={14} />}
              {source.kind} {source.confidence}%
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Signal title="Go signals" items={report.goSignals} tone="go" />
        <Signal title="Stop signals" items={report.stopSignals} tone="stop" />
        <Signal title="Next actions" items={report.nextActions} tone="next" />
      </div>
    </div>
  );
}

function Signal({ title, items, tone }: { title: string; items: string[]; tone: "go" | "stop" | "next" }) {
  const color = tone === "go" ? "bg-citrus/40" : tone === "stop" ? "bg-coral/15" : "bg-ocean/10";
  return (
    <div className={`panel p-5 ${color}`}>
      <h3 className="font-black">{title}</h3>
      <ul className="mt-3 space-y-3 text-sm leading-6 text-ink/70">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function Scores({ report }: { report?: Report }) {
  if (!report) return <EmptyReport />;
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Object.entries(report.scores).map(([key, value]) => (
        <div key={key} className="panel p-5">
          <div className="text-sm font-black uppercase text-moss">{key}</div>
          <div className="mt-3 text-4xl font-black">{value}</div>
          <div className="mt-2 h-2 rounded-full bg-line">
            <div className="h-2 rounded-full bg-moss" style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Sections({ report, filter }: { report?: Report; filter: string }) {
  if (!report) return <EmptyReport />;
  const sections = report.sections.filter((section) => section.title.includes(filter) || (filter === "Market" && section.title.includes("Competitive")) || (filter === "Roadmap" && section.title.includes("Risk")));
  return (
    <div className="grid gap-4">
      {sections.map((section) => (
        <div key={section.id} className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">{section.title}</h2>
            <span className="chip">{section.tag}</span>
          </div>
          <p className="mt-3 leading-7 text-ink/70">{section.summary}</p>
          <ul className="mt-4 grid gap-2 text-sm text-ink/70">
            {section.bullets.map((bullet) => (
              <li key={bullet} className="rounded-lg border border-line bg-white p-3">
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Experiments({ idea, onStatus, onEvidence }: { idea: Idea; onStatus: (experiment: Experiment, status: ExperimentStatus) => void; onEvidence: (experiment: Experiment) => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {statuses.map((status) => (
        <div key={status} className="panel p-3">
          <h2 className="px-2 py-1 text-sm font-black uppercase text-ink/55">{statusLabels[status]}</h2>
          <div className="mt-2 space-y-3">
            {idea.experiments.filter((experiment) => experiment.status === status).map((experiment) => (
              <div key={experiment.id} className="rounded-lg border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black">{experiment.title}</h3>
                  <span className="chip">{experiment.riskLevel}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/65">{experiment.suggestedExperiment}</p>
                <div className="mt-3 grid gap-1 text-xs text-ink/55">
                  <span>Evidence: {experiment.evidenceRequired}</span>
                  <span>Cost: {experiment.cost}</span>
                  <span>Duration: {experiment.duration}</span>
                  <span>Success: {experiment.successThreshold}</span>
                </div>
                <button className="btn ghost mt-3 w-full" onClick={() => onEvidence(experiment)}>
                  Add evidence ({experiment.evidence.length})
                </button>
                <select className="field mt-2" value={experiment.status} onChange={(event) => onStatus(experiment, event.target.value as ExperimentStatus)}>
                  {statuses.map((entry) => (
                    <option key={entry} value={entry}>
                      {statusLabels[entry]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Billing({ onPurchase }: { onPurchase: (pack: string) => void }) {
  return (
    <div>
      <div className="mb-5 panel p-5">
        <h2 className="text-xl font-black">Mock billing</h2>
        <p className="mt-2 text-sm text-ink/65">Stripe keys are not connected yet. These buttons write to the credit ledger so the app can be tested end-to-end.</p>
      </div>
      <PricingCards onPurchase={onPurchase} />
      <div className="mt-5 panel p-5">
        <h3 className="font-black">Production handoff</h3>
        <p className="mt-2 text-sm text-ink/65">Replace this route with Stripe Checkout and keep the credit ledger as the source of truth.</p>
        <button className="btn secondary mt-4">
          <CreditCard size={16} />
          Stripe-ready placeholder
        </button>
      </div>
    </div>
  );
}

function EmptyReport() {
  return (
    <div className="panel p-8 text-center">
      <Layers3 className="mx-auto text-ocean" size={34} />
      <h2 className="mt-4 text-2xl font-black">Run validation first</h2>
      <p className="mt-2 text-ink/60">This section unlocks after the first evidence-first validation report.</p>
    </div>
  );
}
