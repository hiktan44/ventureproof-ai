"use client";

import { Check, CreditCard } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const plans = [
  { id: "starter", name: "Starter", price: "EUR 19.99", credits: 200, bestForKey: "pricing.starterBest", perkKeys: ["pricing.validations", "pricing.exports", "pricing.evidenceLabels"] },
  { id: "builder", name: "Builder", price: "EUR 49.99", credits: 800, bestForKey: "pricing.builderBest", perkKeys: ["pricing.marketPlan", "pricing.brandStrategy", "pricing.marketingSuite"] },
  { id: "founder", name: "Founder", price: "EUR 99.99", credits: 1800, bestForKey: "pricing.founderBest", perkKeys: ["pricing.liveMonitoring", "pricing.launchKits", "pricing.priority"] }
];

export function PricingCards({ onPurchase }: { onPurchase?: (pack: string) => void }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <div key={plan.id} className="panel p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black">{plan.name}</h3>
              <p className="mt-1 text-sm text-ink/65">{t(plan.bestForKey)}</p>
            </div>
            <span className="chip bg-citrus/50">{plan.credits} cr</span>
          </div>
          <div className="mt-5 text-3xl font-black">{plan.price}</div>
          <ul className="mt-5 space-y-3 text-sm">
            {plan.perkKeys.map((perk) => (
              <li key={perk} className="flex gap-2">
                <Check className="mt-0.5 text-moss" size={16} />
                <span>{t(perk)}</span>
              </li>
            ))}
          </ul>
          <button className="btn mt-6 w-full" onClick={() => onPurchase?.(plan.id)}>
            <CreditCard size={16} />
            {onPurchase ? t("pricing.addCredits") : t("pricing.choosePlan")}
          </button>
        </div>
      ))}
    </div>
  );
}
