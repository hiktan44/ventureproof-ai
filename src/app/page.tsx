import Link from "next/link";
import { ArrowRight, BadgeCheck, Brain, ChartNoAxesCombined, FileText, FlaskConical, Megaphone, ShieldCheck } from "lucide-react";
import { MarketingNav } from "@/components/MarketingNav";
import { PricingCards } from "@/components/PricingCards";
import { ScoreRing } from "@/components/ScoreRing";

const modules = [
  ["Idea Validation", "40 cr", "Score, go/stop signals, risks and first experiments."],
  ["Market Analysis", "100 cr", "TAM/SAM/SOM, demand signals and competitors."],
  ["Business Plan", "120 cr", "Investor memo, financials, GTM and MVP prompt."],
  ["Brand Strategy", "60 cr", "Positioning, archetype, voice and messaging."],
  ["Visual Identity", "160 cr", "Logo direction, colors, type and landing mockups."],
  ["Marketing Suite", "250 cr", "Ads, launch copy, emails and UGC scripts."]
];

export default function Home() {
  return (
    <>
      <MarketingNav />
      <main>
        <section className="shell grid min-h-[calc(100vh-64px)] items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="chip mb-5 bg-white">
              <ShieldCheck size={14} />
              Evidence-first startup validation
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] md:text-7xl">
              Fikrini dakikalar icinde karar dosyasina cevir.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
              VentureProof AI pazar, rekabet, finans, risk, deney, marka ve launch planini tek akista ureten fullstack kurucu platformudur.
              Kaynakli rapor, kredi ledger sistemi ve deney boardu ilk surumden itibaren hazir.
            </p>
            <form action="/auth" className="mt-8 panel p-3 shadow-soft">
              <textarea
                name="idea"
                className="field min-h-28 resize-none border-0"
                placeholder="Ornek: Turkiyedeki butik oteller icin AI destekli gelir optimizasyon ve kanal yonetimi araci"
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <button className="btn flex-1" type="submit">
                  Validate my idea
                  <ArrowRight size={16} />
                </button>
                <Link className="btn secondary flex-1" href="/dashboard">
                  Open dashboard
                </Link>
              </div>
            </form>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-ink/65">
              <span className="chip">100 free credits</span>
              <span className="chip">No card required</span>
              <span className="chip">TR, EU, US market modes</span>
            </div>
          </div>
          <div id="report" className="panel p-5 shadow-soft">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="text-sm font-black uppercase text-moss">Demo report</p>
                <h2 className="text-2xl font-black">AI revenue copilot for boutique hotels</h2>
              </div>
              <span className="chip bg-citrus/50">v1</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ScoreRing value={78} label="Viability" />
              <ScoreRing value={84} label="Confidence" />
            </div>
            <div className="mt-6 grid gap-3">
              {[
                ["Go signal", "Clear painful segment with measurable revenue lift."],
                ["Stop signal", "Channel integrations and trust proof are the hard part."],
                ["Next move", "Run 12 hotelier interviews and 2 paid concierge pilots."]
              ].map(([label, copy]) => (
                <div key={label} className="rounded-lg border border-line bg-white p-4">
                  <div className="text-xs font-black uppercase text-coral">{label}</div>
                  <div className="mt-1 text-sm text-ink/75">{copy}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-white py-12">
          <div className="shell grid gap-4 md:grid-cols-4">
            {[
              ["100+", "free credits on signup"],
              ["6", "founder journey modules"],
              ["5+", "automatic experiments"],
              ["3", "claim evidence labels"]
            ].map(([stat, label]) => (
              <div key={label}>
                <div className="text-4xl font-black">{stat}</div>
                <div className="mt-1 text-sm text-ink/60">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="shell py-16">
          <div className="max-w-2xl">
            <p className="font-black uppercase text-moss">Founder journey</p>
            <h2 className="mt-2 text-4xl font-black">Bir fikirden launch kit seviyesine kadar.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {modules.map(([title, cost, copy]) => (
              <div key={title} className="panel p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black">{title}</h3>
                  <span className="chip">{cost}</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-ink/65">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-ink py-16 text-white">
          <div className="shell grid gap-8 md:grid-cols-3">
            {[
              [BadgeCheck, "Evidence ledger", "Verified source, model inference and user assumption labels."],
              [FlaskConical, "Experiment board", "To validate, in progress, confirmed and false workflows."],
              [ChartNoAxesCombined, "Scenario simulator", "CAC, ARPA, churn and runway assumptions ready for next phase."]
            ].map(([Icon, title, copy]) => {
              const TypedIcon = Icon as typeof Brain;
              return (
                <div key={title as string}>
                  <TypedIcon size={28} />
                  <h3 className="mt-4 text-xl font-black">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">{copy as string}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="tools" className="shell py-16">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              [Brain, "AI idea generator", "Segment, geography and budget aware idea prompts."],
              [FileText, "Founder templates", "Lean canvas, persona, interview script and pitch outline."],
              [Megaphone, "Launch assets", "Ad copy, email sequence and Product Hunt launch messaging."]
            ].map(([Icon, title, copy]) => {
              const TypedIcon = Icon as typeof Brain;
              return (
                <div key={title as string} className="panel p-5">
                  <TypedIcon className="text-ocean" size={24} />
                  <h3 className="mt-4 text-xl font-black">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/65">{copy as string}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="shell pb-16">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="font-black uppercase text-moss">Pricing</p>
              <h2 className="mt-2 text-4xl font-black">Credits that map to outcomes.</h2>
            </div>
            <Link className="btn secondary" href="/pricing">
              View all
            </Link>
          </div>
          <PricingCards />
        </section>
      </main>
      <footer className="border-t border-line py-8">
        <div className="shell flex flex-col justify-between gap-4 text-sm text-ink/60 md:flex-row">
          <span>VentureProof AI</span>
          <span>Validation, market intelligence, experiments and launch planning.</span>
        </div>
      </footer>
    </>
  );
}
