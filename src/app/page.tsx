"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Brain, ChartNoAxesCombined, FileText, FlaskConical, Megaphone, ShieldCheck } from "lucide-react";
import { MarketingNav } from "@/components/MarketingNav";
import { PricingCards } from "@/components/PricingCards";
import { ScoreRing } from "@/components/ScoreRing";
import { useLanguage } from "@/lib/i18n";
import type { ModuleKey } from "@/types/domain";

const modules: { key: ModuleKey; cost: string }[] = [
  { key: "validation", cost: "40 cr" },
  { key: "market", cost: "100 cr" },
  { key: "businessPlan", cost: "120 cr" },
  { key: "brand", cost: "60 cr" },
  { key: "visual", cost: "160 cr" },
  { key: "marketing", cost: "250 cr" }
];

export default function Home() {
  const { t, moduleLabel, moduleCopy } = useLanguage();

  return (
    <>
      <MarketingNav />
      <main>
        <section className="shell grid min-h-[calc(100vh-64px)] items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="chip mb-5 bg-white">
              <ShieldCheck size={14} />
              {t("home.badge")}
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] md:text-7xl">
              {t("home.title")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
              {t("home.subtitle")}
            </p>
            <form action="/auth" className="mt-8 panel p-3 shadow-soft">
              <textarea
                name="idea"
                className="field min-h-28 resize-none border-0"
                placeholder={t("home.placeholder")}
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <button className="btn flex-1" type="submit">
                  {t("home.validate")}
                  <ArrowRight size={16} />
                </button>
                <Link className="btn secondary flex-1" href="/dashboard">
                  {t("home.dashboard")}
                </Link>
              </div>
            </form>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-ink/65">
              <span className="chip">{t("home.freeCredits")}</span>
              <span className="chip">{t("home.noCard")}</span>
              <span className="chip">{t("home.marketModes")}</span>
            </div>
          </div>
          <div id="report" className="panel p-5 shadow-soft">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="text-sm font-black uppercase text-moss">{t("home.demoReport")}</p>
                <h2 className="text-2xl font-black">{t("home.demoTitle")}</h2>
              </div>
              <span className="chip bg-citrus/50">v1</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ScoreRing value={78} label={t("home.viability")} />
              <ScoreRing value={84} label={t("home.confidence")} />
            </div>
            <div className="mt-6 grid gap-3">
              {[
                [t("home.goSignal"), t("home.goCopy")],
                [t("home.stopSignal"), t("home.stopCopy")],
                [t("home.nextMove"), t("home.nextCopy")]
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
              ["100+", t("home.statCredits")],
              ["6", t("home.statModules")],
              ["5+", t("home.statExperiments")],
              ["3", t("home.statEvidence")]
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
            <p className="font-black uppercase text-moss">{t("home.journeyLabel")}</p>
            <h2 className="mt-2 text-4xl font-black">{t("home.journeyTitle")}</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {modules.map(({ key, cost }) => (
              <div key={key} className="panel p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black">{moduleLabel(key)}</h3>
                  <span className="chip">{cost}</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-ink/65">{moduleCopy(key)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-ink py-16 text-white">
          <div className="shell grid gap-8 md:grid-cols-3">
            {[
              [BadgeCheck, t("home.evidenceLedger"), t("home.evidenceLedgerCopy")],
              [FlaskConical, t("home.experimentBoard"), t("home.experimentBoardCopy")],
              [ChartNoAxesCombined, t("home.scenarioSimulator"), t("home.scenarioSimulatorCopy")]
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
              [Brain, t("home.ideaGenerator"), t("home.ideaGeneratorCopy")],
              [FileText, t("home.templates"), t("home.templatesCopy")],
              [Megaphone, t("home.launchAssets"), t("home.launchAssetsCopy")]
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
              <p className="font-black uppercase text-moss">{t("home.pricingLabel")}</p>
              <h2 className="mt-2 text-4xl font-black">{t("home.pricingTitle")}</h2>
            </div>
            <Link className="btn secondary" href="/pricing">
              {t("home.viewAll")}
            </Link>
          </div>
          <PricingCards />
        </section>
      </main>
      <footer className="border-t border-line py-8">
        <div className="shell flex flex-col justify-between gap-4 text-sm text-ink/60 md:flex-row">
          <span>VentureProof AI</span>
          <span>{t("home.footer")}</span>
        </div>
      </footer>
    </>
  );
}
