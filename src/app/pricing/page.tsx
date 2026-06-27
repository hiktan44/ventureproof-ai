"use client";

import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { PricingCards } from "@/components/PricingCards";
import { useLanguage } from "@/lib/i18n";
import { moduleCosts, type ModuleKey } from "@/types/domain";

const costMap: ModuleKey[] = ["validation", "market", "businessPlan", "brand", "visual", "marketing"];

export default function PricingPage() {
  const { t, moduleLabel } = useLanguage();

  return (
    <>
      <MarketingNav />
      <main className="shell py-14">
        <div className="max-w-3xl">
          <p className="font-black uppercase text-moss">{t("pricing.label")}</p>
          <h1 className="mt-2 text-5xl font-black">{t("pricing.title")}</h1>
          <p className="mt-5 text-lg leading-8 text-ink/70">
            {t("pricing.copy")}
          </p>
        </div>
        <div className="mt-10">
          <PricingCards />
        </div>
        <div className="mt-10 panel p-6">
          <h2 className="text-2xl font-black">{t("pricing.costMap")}</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {costMap.map((key) => (
              <div key={key} className="rounded-lg border border-line bg-white p-4">
                <div className="font-black">{moduleLabel(key)}</div>
                <div className="mt-1 text-sm text-ink/60">{moduleCosts[key]} {t("dashboard.credits")}</div>
              </div>
            ))}
          </div>
          <Link className="btn mt-6" href="/auth?mode=signup">
            {t("pricing.startCredits")}
          </Link>
        </div>
      </main>
    </>
  );
}
