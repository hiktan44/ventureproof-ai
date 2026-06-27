"use client";

import Link from "next/link";
import { BadgeCheck, Sparkles } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ScoreRing } from "@/components/ScoreRing";
import { useLanguage } from "@/lib/i18n";
import type { Idea, Report } from "@/types/domain";

export function SharedReportView({ idea, report }: { idea: Idea; report: Report }) {
  const { t, sourceKindLabel } = useLanguage();

  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b border-line bg-white">
        <div className="shell flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white">
              <Sparkles size={18} />
            </span>
            VentureProof AI
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <span className="chip">{t("share.shared")}</span>
          </div>
        </div>
      </header>
      <section className="shell py-10">
        <div className="panel p-6 shadow-soft">
          <p className="font-black uppercase text-moss">{t("share.reportLabel")}</p>
          <h1 className="mt-2 text-4xl font-black">{idea.title}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-ink/70">{report.executiveSummary}</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <ScoreRing value={report.scores.viability} label={t("score.viability")} />
            <ScoreRing value={report.scores.confidence} label={t("score.confidence")} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Signal title={t("dashboard.goSignals")} items={report.goSignals} />
          <Signal title={t("dashboard.stopSignals")} items={report.stopSignals} />
          <Signal title={t("dashboard.nextActions")} items={report.nextActions} />
        </div>

        <div className="mt-6 grid gap-4">
          {Object.values(idea.moduleOutputs).filter(Boolean).map((output) => (
            <article key={output.id} className="panel p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-moss">{t("share.artifact")}</p>
                  <h2 className="mt-1 text-xl font-black">{output.title}</h2>
                </div>
                <span className="chip">{t("share.module")}</span>
              </div>
              <p className="mt-3 leading-7 text-ink/70">{output.summary}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {output.artifacts.map((artifact) => (
                  <div key={artifact.label} className="rounded-lg border border-line bg-white p-3">
                    <div className="text-xs font-black uppercase text-ink/45">{artifact.label}</div>
                    <div className="mt-1 font-bold">{artifact.value}</div>
                  </div>
                ))}
              </div>
            </article>
          ))}
          {report.sections.map((section) => (
            <article key={section.id} className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-black">{section.title}</h2>
                <span className="chip">
                  <BadgeCheck size={14} />
                  {sourceKindLabel(section.tag)}
                </span>
              </div>
              <p className="mt-3 leading-7 text-ink/70">{section.summary}</p>
              <ul className="mt-4 grid gap-2 text-sm text-ink/70">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="rounded-lg border border-line bg-white p-3">
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Signal({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="panel p-5">
      <h2 className="font-black">{title}</h2>
      <ul className="mt-3 space-y-3 text-sm leading-6 text-ink/70">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

