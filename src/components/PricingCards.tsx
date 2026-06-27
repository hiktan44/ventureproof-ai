"use client";

import { Check, CreditCard } from "lucide-react";

const plans = [
  { id: "starter", name: "Starter", price: "EUR 19.99", credits: 200, bestFor: "1 fikir icin net karar", perks: ["5 validations", "PDF/Markdown exports", "Evidence labels"] },
  { id: "builder", name: "Builder", price: "EUR 49.99", credits: 800, bestFor: "Uctan uca kurucu yolculugu", perks: ["Market + business plan", "Brand strategy", "Marketing suite"] },
  { id: "founder", name: "Founder", price: "EUR 99.99", credits: 1800, bestFor: "Birden fazla fikir ve pivot", perks: ["Live monitoring", "2 launch kits", "Priority support"] }
];

export function PricingCards({ onPurchase }: { onPurchase?: (pack: string) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <div key={plan.id} className="panel p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black">{plan.name}</h3>
              <p className="mt-1 text-sm text-ink/65">{plan.bestFor}</p>
            </div>
            <span className="chip bg-citrus/50">{plan.credits} cr</span>
          </div>
          <div className="mt-5 text-3xl font-black">{plan.price}</div>
          <ul className="mt-5 space-y-3 text-sm">
            {plan.perks.map((perk) => (
              <li key={perk} className="flex gap-2">
                <Check className="mt-0.5 text-moss" size={16} />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
          <button className="btn mt-6 w-full" onClick={() => onPurchase?.(plan.id)}>
            <CreditCard size={16} />
            {onPurchase ? "Add credits" : "Choose plan"}
          </button>
        </div>
      ))}
    </div>
  );
}
