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
  FileDown,
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
  ShieldCheck,
  Share2,
  Sparkles
} from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { PricingCards } from "@/components/PricingCards";
import { ScoreRing } from "@/components/ScoreRing";
import { useLanguage } from "@/lib/i18n";
import { moduleCosts, type CreditLedgerEntry, type Experiment, type ExperimentStatus, type Idea, type ModuleKey, type Report, type ReportSection } from "@/types/domain";

type SessionUser = { id: string; email: string; name: string; credits: number; role?: "user" | "admin" };
type TabKey = "summary" | "scores" | "market" | "financials" | "roadmap" | "experiments" | "billing";
type GeneratableModule = Exclude<ModuleKey, "validation">;

const moduleOrder: ModuleKey[] = ["validation", "market", "businessPlan", "brand", "visual", "marketing"];
const statuses: ExperimentStatus[] = ["to_validate", "in_progress", "confirmed", "false"];

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-mist">{t("dashboard.loading")}</main>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ledger, setLedger] = useState<CreditLedgerEntry[]>([]);
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
    setLedger(data.ledger || []);
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
      setMessage(data.error || t("dashboard.createError"));
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
      setMessage(data.error || t("dashboard.validationError"));
      return;
    }
    setUser(data.user);
    setIdeas((current) => current.map((idea) => (idea.id === ideaId ? data.idea : idea)));
    setSelectedId(ideaId);
    setTab("summary");
    void refresh();
  }

  async function generateModule(ideaId: string, module: GeneratableModule) {
    setBusy(module);
    setMessage("");
    const response = await fetch(`/api/ideas/${ideaId}/modules/${module}`, { method: "POST" });
    const data = await response.json();
    setBusy("");
    if (!response.ok) {
      setMessage(data.error || t("dashboard.moduleError"));
      return;
    }
    setUser(data.user);
    setIdeas((current) => current.map((idea) => (idea.id === ideaId ? data.idea : idea)));
    setTab(module === "businessPlan" ? "financials" : module === "brand" || module === "visual" || module === "marketing" ? "roadmap" : "market");
    void refresh();
  }

  async function updateExperiment(experiment: Experiment, status: ExperimentStatus) {
    if (status === "confirmed" && experiment.evidence.length === 0) {
      setMessage(t("dashboard.confirmEvidence"));
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
    const evidence = window.prompt(t("dashboard.evidencePrompt"));
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
      setMessage(t("dashboard.billingAdded", { pack }));
      void refresh();
    }
  }

  async function shareReport() {
    if (!selectedIdea || !report) return;
    const response = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId: selectedIdea.id })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || t("dashboard.shareError"));
      return;
    }
    const absoluteUrl = `${window.location.origin}${data.url}`;
    await navigator.clipboard?.writeText(absoluteUrl).catch(() => undefined);
    setMessage(t("dashboard.shareReady", { url: absoluteUrl }));
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  function exportReport(format: "pdf" | "docx") {
    if (!selectedIdea || !report) return;
    const anchor = document.createElement("a");
    anchor.href = `/api/ideas/${selectedIdea.id}/export?format=${format}`;
    anchor.click();
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-mist">
        <div className="panel p-6 font-black">{t("dashboard.loading")}</div>
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
            {t("dashboard.validateNew")}
            <span className="rounded bg-white/15 px-1.5 py-0.5 text-xs">{moduleCosts.validation} {t("dashboard.credits")}</span>
          </button>
          <div className="mt-6 text-xs font-black uppercase text-ink/45">{t("dashboard.myIdeas")}</div>
          <div className="mt-3 space-y-2">
            {ideas.length === 0 ? <div className="rounded-lg border border-dashed border-line p-3 text-sm text-ink/55">{t("dashboard.noIdeas")}</div> : null}
            {ideas.map((idea) => (
              <button key={idea.id} className={`w-full rounded-lg border p-3 text-left text-sm ${selectedIdea?.id === idea.id ? "border-ink bg-mist" : "border-line bg-white"}`} onClick={() => setSelectedId(idea.id)}>
                <div className="font-black">{idea.title}</div>
                <div className="mt-1 text-xs text-ink/55">{idea.reports.length ? `${idea.reports.length} ${t("dashboard.reportVersions")}` : t("dashboard.readyToValidate")}</div>
              </button>
            ))}
          </div>
          <div className="mt-6 text-xs font-black uppercase text-ink/45">{t("dashboard.quickTools")}</div>
          <div className="mt-3 grid gap-2">
            {[
              [Search, t("dashboard.ideaGenerator")],
              [BarChart3, t("dashboard.calculators")],
              [FileText, t("dashboard.failureDb")],
              [Globe2, t("dashboard.benchmarks")]
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
                <h1 className="text-2xl font-black">{selectedIdea ? selectedIdea.title : t("dashboard.startJourney")}</h1>
                <p className="text-sm text-ink/60">{t("dashboard.subtitle")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <LanguageToggle />
                <span className="chip bg-citrus/50">{user?.credits ?? 0} {t("dashboard.credits")}</span>
                {user?.role === "admin" ? (
                  <Link className="btn ghost" href="/admin">
                    <ShieldCheck size={16} />
                    Admin
                  </Link>
                ) : null}
                <button className="btn ghost" onClick={() => exportReport("pdf")} disabled={!report}>
                  <Download size={16} />
                  {t("dashboard.exportPdf")}
                </button>
                <button className="btn ghost" onClick={() => exportReport("docx")} disabled={!report}>
                  <FileDown size={16} />
                  {t("dashboard.exportWord")}
                </button>
                <button className="btn ghost" onClick={shareReport} disabled={!report}>
                  <Share2 size={16} />
                  {t("dashboard.share")}
                </button>
                <button className="btn secondary" onClick={logout}>
                  <LogOut size={16} />
                  {t("dashboard.logout")}
                </button>
              </div>
            </div>
          </header>

          <div className="p-5">
            {message ? <div className="mb-4 rounded-lg border border-coral bg-coral/10 p-3 text-sm font-bold">{message}</div> : null}

            <section id="new-idea" className="panel p-5 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{t("dashboard.validateTitle")}</h2>
                  <p className="mt-1 text-sm text-ink/60">{t("dashboard.validateCopy")}</p>
                </div>
                <span className="chip">{moduleCosts.validation} {t("dashboard.credits")}</span>
              </div>
              <form className="mt-5 grid gap-4" onSubmit={createIdea}>
                <textarea className="field min-h-28" value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t("dashboard.describePlaceholder")} required />
                <div className="grid gap-3 md:grid-cols-4">
                  <input className="field" value={context.geography} onChange={(event) => setContext({ ...context, geography: event.target.value })} placeholder={t("dashboard.geography")} />
                  <input className="field" value={context.industry} onChange={(event) => setContext({ ...context, industry: event.target.value })} placeholder={t("dashboard.industry")} />
                  <input className="field" value={context.customerSegment} onChange={(event) => setContext({ ...context, customerSegment: event.target.value })} placeholder={t("dashboard.customerSegment")} />
                  <select className="field" value={context.stage} onChange={(event) => setContext({ ...context, stage: event.target.value })}>
                    <option value="idea">{t("dashboard.idea")}</option>
                    <option value="mvp">MVP</option>
                    <option value="revenue">{t("dashboard.revenue")}</option>
                    <option value="scaling">{t("dashboard.scaling")}</option>
                  </select>
                </div>
                <button className="btn w-fit" disabled={busy === "create"}>
                  {busy === "create" ? t("dashboard.saving") : t("dashboard.createIdea")}
                  <ArrowRight size={16} />
                </button>
              </form>
            </section>

            {selectedIdea ? (
              <>
                <Journey idea={selectedIdea} busy={busy} onValidate={() => validateIdea(selectedIdea.id)} onGenerateModule={(module) => generateModule(selectedIdea.id, module)} />
                <Tabs tab={tab} setTab={setTab} />
                <div className="mt-5">
                  {tab === "summary" && <Summary idea={selectedIdea} report={report} onValidate={() => validateIdea(selectedIdea.id)} busy={busy} />}
                  {tab === "scores" && <Scores report={report} />}
                  {tab === "market" && <ModuleAndSections idea={selectedIdea} modules={["market"]} report={report} categories={["market", "competition"]} />}
                  {tab === "financials" && <ModuleAndSections idea={selectedIdea} modules={["businessPlan"]} report={report} categories={["financials"]} />}
                  {tab === "roadmap" && <ModuleAndSections idea={selectedIdea} modules={["brand", "visual", "marketing"]} report={report} categories={["roadmap", "risk", "gtm"]} />}
                  {tab === "experiments" && <Experiments idea={selectedIdea} onStatus={updateExperiment} onEvidence={addEvidence} />}
                  {tab === "billing" && <Billing ledger={ledger} onPurchase={purchase} />}
                </div>
              </>
            ) : (
              <div className="mt-5 panel p-8 text-center">
                <Boxes className="mx-auto text-ocean" size={34} />
                <h2 className="mt-4 text-2xl font-black">{t("dashboard.startJourney")}</h2>
                <p className="mt-2 text-ink/60">{t("dashboard.emptyCopy", { credits: user?.credits ?? 0 })}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Journey({ idea, busy, onValidate, onGenerateModule }: { idea: Idea; busy: string; onValidate: () => void; onGenerateModule: (module: GeneratableModule) => void }) {
  const { moduleLabel, statusLabel, t } = useLanguage();

  return (
    <section className="mt-5 panel p-4">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {moduleOrder.map((key) => {
          const status = idea.modules[key];
          const readyValidation = key === "validation" && status !== "complete";
          const readyModule = key !== "validation" && status === "ready";
          return (
            <div key={key} className="min-w-52 rounded-lg border border-line bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="font-black">{moduleLabel(key)}</div>
                {status === "locked" ? <Lock size={15} /> : status === "complete" ? <CheckCircle2 className="text-moss" size={16} /> : <span className="chip">{moduleCosts[key]}</span>}
              </div>
              <div className="mt-2 text-xs font-bold uppercase text-ink/45">{statusLabel(status)}</div>
              {readyValidation ? (
                <button className="btn mt-4 w-full" onClick={onValidate} disabled={busy === "validate"}>
                  {busy === "validate" ? t("dashboard.generating") : t("dashboard.runValidation")}
                </button>
              ) : readyModule ? (
                <button className="btn secondary mt-4 w-full" onClick={() => onGenerateModule(key as GeneratableModule)} disabled={busy === key}>
                  <RefreshCcw size={15} />
                  {busy === key ? t("dashboard.generating") : t("dashboard.generate")}
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
  const { t } = useLanguage();
  const tabs: TabKey[] = ["summary", "scores", "market", "financials", "roadmap", "experiments", "billing"];
  return (
    <div className="mt-5 flex gap-2 overflow-x-auto">
      {tabs.map((entry) => (
        <button key={entry} className={`rounded-lg border px-4 py-2 text-sm font-black capitalize ${tab === entry ? "border-ink bg-ink text-white" : "border-line bg-white"}`} onClick={() => setTab(entry)}>
          {t(`tab.${entry}`)}
        </button>
      ))}
    </div>
  );
}

function Summary({ idea, report, onValidate, busy }: { idea: Idea; report?: Report; onValidate: () => void; busy: string }) {
  const { t, sourceKindLabel } = useLanguage();

  if (!report) {
    return (
      <div className="panel p-8 text-center">
        <FlaskConical className="mx-auto text-ocean" size={34} />
        <h2 className="mt-4 text-2xl font-black">{t("dashboard.validationReady")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-ink/60">{t("dashboard.validationReadyCopy", { title: idea.title })}</p>
        <button className="btn mt-6" onClick={onValidate} disabled={busy === "validate"}>
          {busy === "validate" ? t("dashboard.generating") : t("dashboard.runValidation")}
        </button>
      </div>
    );
  }
  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="panel p-5">
        <ScoreRing value={report.scores.viability} label={t("score.viability")} />
        <div className="mt-5">
          <h2 className="text-xl font-black">{t("dashboard.executiveSummary")}</h2>
          <p className="mt-3 leading-7 text-ink/70">{report.executiveSummary}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {report.sources.map((source) => (
            <span key={source.id} className="chip">
              {source.kind === "verified" ? <BadgeCheck size={14} /> : <AlertTriangle size={14} />}
              {sourceKindLabel(source.kind)} {source.confidence}%
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Signal title={t("dashboard.goSignals")} items={report.goSignals} tone="go" />
        <Signal title={t("dashboard.stopSignals")} items={report.stopSignals} tone="stop" />
        <Signal title={t("dashboard.nextActions")} items={report.nextActions} tone="next" />
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
  const { t } = useLanguage();

  if (!report) return <EmptyReport />;
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Object.entries(report.scores).map(([key, value]) => (
        <div key={key} className="panel p-5">
          <div className="text-sm font-black uppercase text-moss">{t(`score.${key}`)}</div>
          <div className="mt-3 text-4xl font-black">{value}</div>
          <div className="mt-2 h-2 rounded-full bg-line">
            <div className="h-2 rounded-full bg-moss" style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Sections({ report, categories }: { report?: Report; categories: NonNullable<ReportSection["category"]>[] }) {
  const { sourceKindLabel } = useLanguage();

  if (!report) return <EmptyReport />;
  const sections = report.sections.filter((section) => section.category && categories.includes(section.category));
  return (
    <div className="grid gap-4">
      {sections.map((section) => (
        <div key={section.id} className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {section.expert ? <p className="text-xs font-black uppercase text-moss">{section.expert}</p> : null}
              <h2 className="mt-1 text-xl font-black">{section.title}</h2>
            </div>
            <span className="chip">{sourceKindLabel(section.tag)}</span>
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

function ModuleAndSections({ idea, modules, report, categories }: { idea: Idea; modules: GeneratableModule[]; report?: Report; categories: NonNullable<ReportSection["category"]>[] }) {
  const { moduleLabel, statusLabel, t } = useLanguage();

  return (
    <div className="grid gap-4">
      {modules.map((module) => {
        const output = idea.moduleOutputs[module];
        if (!output) {
          return (
            <div key={module} className="panel p-5">
              <h2 className="text-xl font-black">{moduleLabel(module)}</h2>
              <p className="mt-2 text-sm text-ink/65">{t("dashboard.generateStep")}</p>
              <span className="chip mt-4">{statusLabel(idea.modules[module])}</span>
            </div>
          );
        }
        return (
          <article key={output.id} className="panel p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-moss">{moduleLabel(module)}</p>
                <h2 className="mt-1 text-2xl font-black">{output.title}</h2>
              </div>
              <span className="chip">{t("dashboard.generated")}</span>
            </div>
            <p className="mt-4 leading-7 text-ink/70">{output.summary}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {output.artifacts.map((artifact) => (
                <div key={artifact.label} className="rounded-lg border border-line bg-white p-4">
                  <div className="text-xs font-black uppercase text-ink/45">{artifact.label}</div>
                  <div className="mt-1 font-bold">{artifact.value}</div>
                </div>
              ))}
            </div>
            <ul className="mt-5 grid gap-2 text-sm text-ink/70">
              {output.bullets.map((bullet) => (
                <li key={bullet} className="rounded-lg border border-line bg-white p-3">
                  {bullet}
                </li>
              ))}
            </ul>
          </article>
        );
      })}
      <Sections report={report} categories={categories} />
    </div>
  );
}

function Experiments({ idea, onStatus, onEvidence }: { idea: Idea; onStatus: (experiment: Experiment, status: ExperimentStatus) => void; onEvidence: (experiment: Experiment) => void }) {
  const { experimentStatusLabel, t } = useLanguage();

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {statuses.map((status) => (
        <div key={status} className="panel p-3">
          <h2 className="px-2 py-1 text-sm font-black uppercase text-ink/55">{experimentStatusLabel(status)}</h2>
          <div className="mt-2 space-y-3">
            {idea.experiments.filter((experiment) => experiment.status === status).map((experiment) => (
              <div key={experiment.id} className="rounded-lg border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black">{experiment.title}</h3>
                  <span className="chip">{experiment.riskLevel}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/65">{experiment.suggestedExperiment}</p>
                <div className="mt-3 grid gap-1 text-xs text-ink/55">
                  <span>{t("dashboard.evidence")}: {experiment.evidenceRequired}</span>
                  <span>{t("dashboard.cost")}: {experiment.cost}</span>
                  <span>{t("dashboard.duration")}: {experiment.duration}</span>
                  <span>{t("dashboard.success")}: {experiment.successThreshold}</span>
                </div>
                <button className="btn ghost mt-3 w-full" onClick={() => onEvidence(experiment)}>
                  {t("dashboard.addEvidence")} ({experiment.evidence.length})
                </button>
                <select className="field mt-2" value={experiment.status} onChange={(event) => onStatus(experiment, event.target.value as ExperimentStatus)}>
                  {statuses.map((entry) => (
                    <option key={entry} value={entry}>
                      {experimentStatusLabel(entry)}
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

function Billing({ ledger, onPurchase }: { ledger: CreditLedgerEntry[]; onPurchase: (pack: string) => void }) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-5 panel p-5">
        <h2 className="text-xl font-black">{t("dashboard.mockBilling")}</h2>
        <p className="mt-2 text-sm text-ink/65">{t("dashboard.mockBillingCopy")}</p>
      </div>
      <PricingCards onPurchase={onPurchase} />
      <div className="mt-5 panel p-5">
        <h3 className="font-black">{t("dashboard.handoff")}</h3>
        <p className="mt-2 text-sm text-ink/65">{t("dashboard.handoffCopy")}</p>
        <button className="btn secondary mt-4">
          <CreditCard size={16} />
          {t("dashboard.stripePlaceholder")}
        </button>
      </div>
      <div className="mt-5 panel p-5">
        <h3 className="font-black">{t("dashboard.creditLedger")}</h3>
        <div className="mt-4 overflow-hidden rounded-lg border border-line">
          {ledger.length === 0 ? (
            <div className="bg-white p-4 text-sm text-ink/60">{t("dashboard.noCreditEvents")}</div>
          ) : (
            ledger.slice(0, 12).map((entry) => (
              <div key={entry.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-line bg-white p-4 text-sm last:border-0">
                <div>
                  <div className="font-black">{entry.reason}</div>
                  <div className="text-xs text-ink/50">{new Date(entry.createdAt).toLocaleString()}</div>
                </div>
                <div className={entry.amount > 0 ? "font-black text-moss" : "font-black text-coral"}>{entry.amount > 0 ? `+${entry.amount}` : entry.amount}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyReport() {
  const { t } = useLanguage();

  return (
    <div className="panel p-8 text-center">
      <Layers3 className="mx-auto text-ocean" size={34} />
      <h2 className="mt-4 text-2xl font-black">{t("dashboard.runFirst")}</h2>
      <p className="mt-2 text-ink/60">{t("dashboard.runFirstCopy")}</p>
    </div>
  );
}
