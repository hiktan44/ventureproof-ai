import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { PricingCards } from "@/components/PricingCards";

export default function PricingPage() {
  return (
    <>
      <MarketingNav />
      <main className="shell py-14">
        <div className="max-w-3xl">
          <p className="font-black uppercase text-moss">Pricing</p>
          <h1 className="mt-2 text-5xl font-black">Start free. Pay for outcomes.</h1>
          <p className="mt-5 text-lg leading-8 text-ink/70">
            Signup gives 100 credits. Credits never expire in the MVP ledger and every generation shows its cost before it runs.
          </p>
        </div>
        <div className="mt-10">
          <PricingCards />
        </div>
        <div className="mt-10 panel p-6">
          <h2 className="text-2xl font-black">Credit cost map</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ["Idea Validation", "40 credits"],
              ["Market Analysis", "100 credits"],
              ["Business Plan", "120 credits"],
              ["Brand Strategy", "60 credits"],
              ["Visual Identity", "160 credits"],
              ["Marketing Suite", "250 credits"]
            ].map(([name, cost]) => (
              <div key={name} className="rounded-lg border border-line bg-white p-4">
                <div className="font-black">{name}</div>
                <div className="mt-1 text-sm text-ink/60">{cost}</div>
              </div>
            ))}
          </div>
          <Link className="btn mt-6" href="/auth?mode=signup">
            Start with 100 credits
          </Link>
        </div>
      </main>
    </>
  );
}
